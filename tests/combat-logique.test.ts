import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { combattantHeros, competenceCombattant, competenceUtilisable, demarrerCombat, estimerAction, jouerAction, type Combat, type Combattant } from '../src/moteur/combat';
import { creerHeros, rangMaitrise, type Heros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';
import { interpreter, propositionsScript } from '../src/ia/interpreteur';
import { groupeDeDeux, jouer, jouerSceneGroupe, nouvellePartieDeTest } from './robot';

const c = contenuDisque();

function heros(classe: string, race = 'humain', niveau = 1): Heros {
  return creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Daleko', classe, race, don: 'oeil-du-seuil', origine: 'invoque', age: 22, anneeCampagne: 1012, niveau });
}
function combat(h: Heros, rencontre = 'loups-combe', graine = 'g'): { cb: Combat; moi: Combattant; rng: ReturnType<typeof creerRng> } {
  const rng = creerRng(graine);
  const cb = demarrerCombat(c, rencontre, [combattantHeros(c, h, true, h.grimoire)], rng);
  return { cb, moi: cb.combattants.find((x) => x.type === 'heros')!, rng };
}
/** Joue « défendre » jusqu'à ce que ce soit de nouveau au héros, ou la fin du combat. */
function passer(cb: Combat, rng: ReturnType<typeof creerRng>, moi: Combattant) {
  if (!cb.resultat && cb.enAttente === moi.id) jouerAction(c, cb, rng, { type: 'defendre', acteur: moi.id });
}

describe('Le poison empoisonne vraiment', () => {
  it('la cible perd des PV au début de chacun de ses tours, pendant la durée prévue ; les cumuls vont jusqu\'à 3', () => {
    // on cherche une graine où les trois Lames empoisonnées touchent la même cible
    for (let g = 0; g < 200; g++) {
      const h = heros('ombre');
      h.rangsCompetences['lame-empoisonnee'] = 1;
      const { cb, moi, rng } = combat(h, 'ref-chef', `poison${g}`);
      const cible = cb.combattants.find((x) => x.camp === 'ennemis')!;
      cible.pv = cible.pvMax = 5000; // assez de PV pour observer le poison longtemps
      moi.pv = moi.pvMax = 5000;
      moi.mana = moi.manaMax = 500;
      let poses = 0;
      for (let t = 0; t < 3 && cb.enAttente === moi.id; t++) {
        const avant = cb.evenements.length;
        jouerAction(c, cb, rng, { type: 'competence', acteur: moi.id, competence: 'lame-empoisonnee', cible: cible.id });
        if (cb.evenements.slice(avant).some((e) => e.type === 'etat' && e.etat === 'poison' && e.cible === cible.id)) poses++;
      }
      if (poses < 3) continue;
      expect(cible.etats.find((e) => e.id === 'poison')!.cumul).toBe(3);
      const ticks = cb.evenements.filter((e) => e.type === 'degats' && e.etat === 'poison' && e.cible === cible.id);
      expect(ticks.length).toBeGreaterThanOrEqual(2); // un tic au début de chaque tour de la cible
      expect(ticks.at(-1)!.valeur!).toBeGreaterThan(ticks[0].valeur!); // les cumuls font plus mal
      expect(ticks[0].texte).toMatch(/−\d+ PV \(poison/);
      // on arrête d'empoisonner : le poison continue quelques tours, puis s'arrête
      const dureeRestante = cible.etats.find((e) => e.id === 'poison')!.duree;
      const avant = ticks.length;
      for (let t = 0; t < 8; t++) passer(cb, rng, moi);
      const apres = cb.evenements.filter((e) => e.type === 'degats' && e.etat === 'poison' && e.cible === cible.id).length;
      expect(apres - avant).toBe(dureeRestante);
      expect(cible.etats.some((e) => e.id === 'poison')).toBe(false);
      return;
    }
    throw new Error('aucune graine où trois poisons sont posés');
  });

  it('la brûlure fonctionne de la même façon', () => {
    for (let g = 0; g < 200; g++) {
      const { cb, moi, rng } = combat(heros('arcaniste'), 'crypte-golem', `feu${g}`);
      const cible = cb.combattants.find((x) => x.camp === 'ennemis')!;
      cible.pv = cible.pvMax = 5000; moi.pv = moi.pvMax = 5000;
      if (cb.enAttente !== moi.id) continue;
      jouerAction(c, cb, rng, { type: 'competence', acteur: moi.id, competence: 'javelot-de-flamme', cible: cible.id });
      if (!cb.evenements.some((e) => e.type === 'etat' && e.etat === 'brulure')) continue;
      for (let t = 0; t < 6; t++) passer(cb, rng, moi);
      expect(cb.evenements.filter((e) => e.type === 'degats' && e.etat === 'brulure' && e.cible === cible.id).length).toBeGreaterThanOrEqual(1);
      return;
    }
    throw new Error('aucune graine où la brûlure est posée');
  });
});

describe('Plus c\'est puissant, moins c\'est sûr', () => {
  it('une attaque de base est plus fiable qu\'une compétence ; la chance est annoncée avant de valider', () => {
    const { cb, moi } = combat(heros('berserker'), 'ref-chef');
    const cible = cb.combattants.find((x) => x.camp === 'ennemis')!.id;
    const base = estimerAction(c, cb, { type: 'attaque', acteur: moi.id, cible });
    const fendoir = estimerAction(c, cb, { type: 'competence', acteur: moi.id, competence: 'fendoir-furieux', cible });
    expect(base.possible && fendoir.possible).toBe(true);
    const cout = c.competences['fendoir-furieux'].cout;
    expect(cout).toBeGreaterThan(0);
    // attaque de base : +2 points ; compétence : −1 point par point de mana au-delà des 5 premiers (5 au plus)
    const k = c.config.combat;
    expect(base.reussite! - fendoir.reussite!).toBeCloseTo(k.toucher_bonus_attaque_base + Math.min(k.toucher_malus_max, Math.max(0, cout - k.toucher_mana_gratuit) * k.toucher_malus_par_mana), 5);
    expect(base.reussite!).toBeGreaterThan(fendoir.reussite!);
  });

  it('le niveau compte : un héros de plus haut niveau touche plus souvent la même cible', () => {
    const bas = combat(heros('gardien', 'humain', 1), 'ref-rapide');
    const haut = combat(heros('gardien', 'humain', 9), 'ref-rapide');
    // on neutralise l'Agilité gagnée avec les niveaux pour ne mesurer que l'effet du niveau
    haut.moi.caracs.AGI = bas.moi.caracs.AGI;
    const p = (x: typeof bas) => estimerAction(c, x.cb, { type: 'attaque', acteur: x.moi.id, cible: x.cb.combattants.find((y) => y.camp === 'ennemis')!.id }).reussite!;
    expect(p(haut)).toBeGreaterThan(p(bas));
  });

  it('la maîtrise (0 à 5) augmente les dégâts et la chance de toucher, avec un plafond', () => {
    expect([0, 4, 5, 15, 79, 80, 500].map((p) => rangMaitrise(c, p))).toEqual([0, 0, 1, 2, 4, 5, 5]);
    const novice = heros('ombre');
    const maitre = heros('ombre');
    maitre.maitrise['lame-empoisonnee'] = 80;
    const a = combat(novice, 'ref-rapide'), b = combat(maitre, 'ref-rapide');
    for (const x of [a, b]) x.moi.caracs.AGI = 8; // loin du plafond de 95 %
    const est = (x: typeof a) => estimerAction(c, x.cb, { type: 'competence', acteur: x.moi.id, competence: 'lame-empoisonnee', cible: x.cb.combattants.find((y) => y.camp === 'ennemis')!.id });
    expect(est(b).reussite! - est(a).reussite!).toBeCloseTo(0.05, 5);
    expect(est(b).degats![1]).toBeGreaterThan(est(a).degats![1]);
    expect(est(b).degats![1]).toBeLessThanOrEqual(Math.ceil(est(a).degats![1] * 1.12)); // bonus modeste : +10 % au plus
  });

  it('utiliser une compétence en combat, ou s\'entraîner à l\'auberge, fait monter sa maîtrise', () => {
    const r = groupeDeDeux(c, 'maitrise');
    jouerSceneGroupe(c, r, 'ch1-appel');
    jouerSceneGroupe(c, r, 'ch1-examen');
    const utilisees = Object.values(r.etat.heros).reduce((a, h) => a + Object.values(h.maitrise).reduce((x, y) => x + y, 0), 0);
    expect(utilisees).toBeGreaterThan(0); // le combat de l'examen a compté
    jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' });
    const avant = { ...r.etat.heros.h1.maitrise };
    jouer(c, r, { type: 'proposer_repos', joueur: 'j1', mois: 6 });
    jouer(c, r, { type: 'repondre_repos', joueur: 'j2', accepte: true });
    jouer(c, r, { type: 'temps_libre', joueur: 'j1', activites: [{ activite: 'entrainement' }, { activite: 'entrainement' }] });
    jouer(c, r, { type: 'temps_libre', joueur: 'j2', activites: [{ activite: 'repos' }, { activite: 'guilde' }] });
    for (const id of c.classes[r.etat.heros.h1.classe].competences) expect(r.etat.heros.h1.maitrise[id]).toBe((avant[id] ?? 0) + 12);
    expect(r.etat.tempsLibre!.resultats!.h1.join(' ')).toMatch(/points de maîtrise/);
  });
});

describe('Attaques nommées des ennemis', () => {
  it('chaque ennemi a 2 ou 3 attaques nommées, avec une phrase qui cite la cible', () => {
    for (const e of Object.values(c.ennemis)) {
      expect(e.attaques.length, e.id).toBeGreaterThanOrEqual(2);
      expect(e.attaques.length, e.id).toBeLessThanOrEqual(3);
      for (const a of e.attaques) expect(a.phrase, e.id).toContain('{cible}');
    }
  });

  it('le journal décrit l\'attaque au lieu de « inflige N dégâts »', () => {
    const h = heros('gardien');
    const { cb, moi, rng } = combat(h, 'loups-combe', 'phrases');
    moi.pv = moi.pvMax = 5000;
    for (let t = 0; t < 6; t++) passer(cb, rng, moi);
    const coups = cb.evenements.filter((e) => e.type === 'degats' && e.source?.startsWith('e:loup-gris') && e.competence === 'attaque');
    expect(coups.length).toBeGreaterThan(0);
    for (const e of coups) {
      expect(e.texte).toMatch(/^Loup gris( [A-C])? (bondit et mord|referme ses crocs|laboure) .*Daleko.* : \d+ dégâts/);
      expect(e.effet).toBe('entaille');
      expect(e.chance).toBeGreaterThan(0);
    }
  });
});

describe('Propositions de l\'IA : seulement ce que le héros peut vraiment faire', () => {
  it.each(Object.keys(c.classes))('%s : compétences connues, mana, recharges et objets respectés', (classe) => {
    for (const niveau of [1, 6]) {
      const h = heros(classe, 'elfe', niveau);
      const { cb, moi, rng } = combat(h, 'loups-combe', `ia-${classe}-${niveau}`);
      moi.pv = moi.pvMax = 5000;
      for (let tour = 0; tour < 6 && !cb.resultat && cb.enAttente === moi.id; tour++) {
        if (tour === 3) { moi.mana = 0; moi.potions = 0; moi.bombes = 0; } // plus de mana ni d'objets : il ne doit rester que le possible
        const props = propositionsScript({ contenu: c, combat: cb, acteur: moi.id, heros: h, grimoire: h.grimoire });
        expect(props.length).toBeGreaterThan(0);
        for (const p of props) {
          expect(p.estimation.possible, p.libelle).toBe(true);
          if (p.action.kind !== 'combat') continue;
          const a = p.action.action;
          if (a.type === 'competence') {
            const k = competenceCombattant(c, moi, a.competence);
            expect(k, `${classe} ne connaît pas ${a.competence}`).not.toBeNull();
            expect(competenceUtilisable(c, moi, k!.comp), p.libelle).toBe(true);
            expect(moi.mana).toBeGreaterThanOrEqual(k!.comp.cout);
            expect(p.source.length, p.libelle).toBeGreaterThan(5); // « compétence de départ de l'Ombre »…
          }
          if (a.type === 'objet') expect(a.objet === 'potion' ? moi.potions : moi.bombes).toBeGreaterThan(0);
        }
        // on joue la première proposition
        const p0 = props[0];
        if (p0.action.kind === 'combat') jouerAction(c, cb, rng, p0.action.action); else break;
      }
    }
  });

  it('la source de « Lame empoisonnée » est indiquée', () => {
    const h = heros('ombre');
    const { cb, moi } = combat(h, 'ref-chef', 'source');
    const r = interpreter({ contenu: c, combat: cb, acteur: moi.id, heros: h, grimoire: h.grimoire }, "j'utilise ma lame empoisonnée sur le chef");
    const props = [...(r.proposition ? [r.proposition] : []), ...r.alternatives];
    const lame = props.find((p) => p.libelle.startsWith('Lame empoisonnée'));
    expect(lame, props.map((p) => p.libelle).join(' / ')).toBeDefined();
    expect(lame!.source).toBe("compétence de départ de l'Ombre");
    void nouvellePartieDeTest;
  });
});