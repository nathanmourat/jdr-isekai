import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, noeudCourant, nouvellePartie, partsDeMise, remplacerVariables } from '../src/moteur/partie';
import { fusionsPossibles } from '../src/moteur/fusions';
import { lireSauvegarde } from '../src/sauvegarde/fichier';
import { finirCombats, groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe, nouvellePartieDeTest } from './robot';

const c = contenuDisque();

function seul(classe: string, race = 'humain', graine = 'solo') {
  const r = nouvellePartieDeTest(c, graine);
  jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Daleko' });
  jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Ombrelune', classe, race, don: 'oeil-du-seuil', origine: 'invoque', age: 22 } });
  return r;
}
/** Avance L'Appel jusqu'à la question du Grand Prieur. */
function jusquALaQuestion(r: ReturnType<typeof seul>, joueurs: string[]) {
  jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
  for (const j of joueurs) jouer(c, r, { type: 'choisir', joueur: j, cle: 'groupe', index: 0 });
  jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'groupe' });
  expect(r.etat.scenes.groupe.noeud).toBe('question');
}

describe('Dialogues adaptés au groupe', () => {
  it('« tu » pour un joueur seul, « vous » pour un groupe', () => {
    const solo = seul('ombre');
    const duo = groupeDeDeux(c);
    const phrase = '« [[Repose-toi||Reposez-vous]]. La Couronne [[te||vous]] recevra. »';
    expect(remplacerVariables(c, solo.etat, phrase, ['h1'])).toBe('« Repose-toi. La Couronne te recevra. »');
    expect(remplacerVariables(c, duo.etat, phrase, ['h1', 'h2'])).toBe('« Reposez-vous. La Couronne vous recevra. »');
    // aucune scène ne contient de crochets mal fermés
    for (const s of Object.values(c.scenes)) for (const n of Object.values(s.noeuds)) for (const rep of n.repliques) {
      expect(remplacerVariables(c, solo.etat, rep.dit, ['h1']), s.id).not.toMatch(/\[\[|\]\]|\|\|/);
    }
  });

  it('le Grand Prieur interroge un joueur par son pseudo ; lui seul répond, avec 3 réponses de sa classe', () => {
    const r = groupeDeDeux(c, 'parole');
    jusquALaQuestion(r, ['j1', 'j2']);
    const p = r.etat.scenes.groupe.parole!;
    // la règle préfère les classes de magie : dans ce groupe, c'est le Guérisseur (h2)
    expect(r.etat.heros[p.heros].classe).toBe('guerisseur');
    expect(p.reponses).toHaveLength(3);
    const def = noeudCourant(c, r.etat, 'groupe')!.parole_a!;
    expect(def.reponses[p.reponses[0]].si).toEqual({ classe: 'guerisseur' });
    expect(remplacerVariables(c, r.etat, def.question.dit, r.etat.scenes.groupe.heros, p.heros)).toContain('« Bravo.');
    // l'autre joueur ne peut pas répondre à sa place, et on ne répond que par une réponse proposée
    expect(() => appliquer(c, r.etat, { type: 'repondre', joueur: 'j1', cle: 'groupe', index: p.reponses[0] })).toThrow(/répondre/);
    expect(() => appliquer(c, r.etat, { type: 'repondre', joueur: 'j2', cle: 'groupe', index: 0 })).toThrow(/impossible/);
    const ordreAvant = r.etat.reputation.ordre;
    jouer(c, r, { type: 'repondre', joueur: 'j2', cle: 'groupe', index: p.reponses[0] });
    expect(r.etat.scenes.groupe.noeud).toBe('__fin__');
    expect(r.etat.reputation.ordre).toBe(ordreAvant + 4);
    // tout le monde voit la réponse choisie
    expect(r.etat.scenes.groupe.messages[0]).toMatch(/^Ilo répond : « Je sais seulement/);
  });

  it('les réponses changent avec la classe et la race ; sans classe de magie, le joueur est tiré au sort (graine)', () => {
    const ombre = seul('ombre', 'elfe');
    jusquALaQuestion(ombre, ['j1']);
    const def = noeudCourant(c, ombre.etat, 'groupe')!.parole_a!;
    const textes = ombre.etat.scenes.groupe.parole!.reponses.map((i) => def.reponses[i].texte);
    expect(textes[0]).toContain("l'acier");      // réponse des classes d'armes
    expect(textes[1]).toContain('Voile');        // réponse des elfes
    expect(textes).toHaveLength(3);
    // même graine = même joueur interrogé
    const a = groupeDeDeux(c, 'graine-x'); const b = groupeDeDeux(c, 'graine-x');
    for (const r of [a, b]) { jouerPrologues(c, r); jouerSceneGroupe(c, r, 'ch1-appel'); jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-examen' }); jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'groupe' }); for (const j of ['j1', 'j2']) jouer(c, r, { type: 'parier', joueur: j, cle: 'groupe', mise: false }); jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'groupe' }); }
    expect(a.etat.scenes.groupe.parole).toEqual(b.etat.scenes.groupe.parole);
    expect(a.etat.scenes.groupe.parole!.reponses).toHaveLength(3);
  });

  it('un joueur absent interrogé : son héros répond tout seul', () => {
    const r = groupeDeDeux(c, 'absent');
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
    jouer(c, r, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 0 });
    jouer(c, r, { type: 'choisir', joueur: 'j2', cle: 'groupe', index: 0 });
    jouer(c, r, { type: 'presence', joueur: 'j2', present: false });
    jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'groupe' });
    expect(r.etat.scenes.groupe.noeud).toBe('__fin__');
  });
});

describe('Paris en pièces (mise partagée)', () => {
  /** Lance l'examen de la Guilde et avance jusqu'à la proposition de pari de Kaya. */
  function examen(orJ1: number, r = groupeDeDeux(c, 'pari')) {
    jouerPrologues(c, r);
    jouerSceneGroupe(c, r, 'ch1-appel');
    r.etat.heros.h1.or = orJ1;
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-examen' });
    jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'groupe' });
    expect(r.etat.scenes.groupe.noeud).toBe('pari');
    return r;
  }

  it('la mise est répartie sans virgule, le reste aux premiers joueurs', () => {
    expect(partsDeMise(20, 3)).toEqual([7, 7, 6]);
    expect(partsDeMise(20, 1)).toEqual([20]);
    expect(partsDeMise(20, 6)).toEqual([4, 4, 3, 3, 3, 3]);
    expect(partsDeMise(20, 0)).toEqual([]);
  });

  it('seul celui qui mise paie, et il paie toute la mise', () => {
    const r = examen(50);
    const orH2 = r.etat.heros.h2.or;
    jouer(c, r, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: true });
    expect(r.etat.scenes.groupe.noeud).toBe('pari'); // on attend la réponse de j2
    jouer(c, r, { type: 'parier', joueur: 'j2', cle: 'groupe', mise: false });
    expect(r.etat.heros.h1.or).toBe(30);
    expect(r.etat.heros.h2.or).toBe(orH2);
    expect(r.etat.mises).toEqual({ h1: 20 });
    expect(r.etat.mouvementsOr).toEqual([{ heros: 'h1', montant: -20, raison: 'mise' }]);
    expect(r.etat.flags['pari-kaya']).toBe(true);
  });

  it('à deux, chacun paie sa moitié', () => {
    const r = examen(50);
    const orH2 = r.etat.heros.h2.or;
    jouer(c, r, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: true });
    jouer(c, r, { type: 'parier', joueur: 'j2', cle: 'groupe', mise: true });
    expect(r.etat.heros.h1.or).toBe(40);
    expect(r.etat.heros.h2.or).toBe(orH2 - 10);
    expect(r.etat.mises).toEqual({ h1: 10, h2: 10 });
  });

  it('personne ne mise : la scène continue par la réplique « personne ne parie »', () => {
    const r = examen(50);
    jouer(c, r, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: false });
    jouer(c, r, { type: 'parier', joueur: 'j2', cle: 'groupe', mise: false });
    expect(r.etat.scenes.groupe.noeud).toBe('sans-pari');
    expect(r.etat.mises).toEqual({});
    expect(r.etat.flags['pari-kaya']).toBeUndefined();
  });

  it('on ne peut pas miser sans avoir de quoi payer sa part, ni répondre deux fois', () => {
    const r = examen(4);
    expect(() => appliquer(c, r.etat, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: true })).toThrow(/Pas assez d'or pour miser : il faut au moins 10 pièces \(vous en avez 4\)/);
    jouer(c, r, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: false });
    expect(() => appliquer(c, r.etat, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: true })).toThrow(/déjà répondu/);
  });

  it('celui qui ne peut pas payer sa part finale se retire, et les autres se partagent la mise', () => {
    const r = examen(12); // 12 pièces : assez pour une moitié (10), pas pour la mise entière
    r.etat.heros.h2.or = 50;
    jouer(c, r, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: true });
    jouer(c, r, { type: 'parier', joueur: 'j2', cle: 'groupe', mise: false });
    // j1 est seul à miser : sa part serait de 20, il ne peut pas → personne ne parie
    expect(r.etat.heros.h1.or).toBe(12);
    expect(r.etat.scenes.groupe.noeud).toBe('sans-pari');
  });

  it('pari gagné : chacun récupère le double de sa part ; pari perdu : la part est perdue', () => {
    const r = examen(50);
    const orH2 = r.etat.heros.h2.or;
    jouer(c, r, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: true });
    jouer(c, r, { type: 'parier', joueur: 'j2', cle: 'groupe', mise: true });
    const p = r.etat.scenes.groupe.parole!;
    jouer(c, r, { type: 'repondre', joueur: r.etat.heros[p.heros].joueurId, cle: 'groupe', index: p.reponses[0] });
    // on termine le combat en forçant son résultat, pour tester les deux issues
    const gagne = JSON.parse(JSON.stringify(r.etat)) as typeof r.etat;
    for (const x of gagne.combats.groupe.combat.combattants) if (x.camp === 'ennemis') { x.pv = 0; x.ko = true; }
    gagne.combats.groupe.combat.resultat = 'victoire';
    gagne.combats.groupe.contexte.bilan = [];
    const apresVictoire = appliquer(c, gagne, { type: 'fin_combat', joueur: 'j1', cle: 'groupe' });
    expect(apresVictoire.heros.h1.or).toBe(40 + 20);
    expect(apresVictoire.heros.h2.or).toBe(orH2 - 10 + 20);
    expect(apresVictoire.mises).toEqual({});
    expect(apresVictoire.mouvementsOr).toEqual([{ heros: 'h1', montant: 20, raison: 'pari gagné' }, { heros: 'h2', montant: 20, raison: 'pari gagné' }]);

    const perdu = JSON.parse(JSON.stringify(r.etat)) as typeof r.etat;
    perdu.combats.groupe.combat.resultat = 'defaite';
    perdu.combats.groupe.contexte.bilan = [];
    const apresDefaite = appliquer(c, perdu, { type: 'fin_combat', joueur: 'j1', cle: 'groupe' });
    expect(apresDefaite.heros.h1.or).toBe(40);
    expect(apresDefaite.mises).toEqual({});
    finirCombats(c, r);
  });

  it('un joueur qui s\'absente ne mise pas : le pari se résout sans lui', () => {
    const r = examen(50);
    jouer(c, r, { type: 'parier', joueur: 'j1', cle: 'groupe', mise: true });
    jouer(c, r, { type: 'presence', joueur: 'j2', present: false });
    expect(r.etat.mises).toEqual({ h1: 20 });
  });
});

describe('Grimoire personnel', () => {
  it('la Guilde ne propose que les fusions de la classe du héros', () => {
    const r = groupeDeDeux(c);
    for (const h of Object.values(r.etat.heros)) {
      const connues = c.classes[h.classe].competences;
      for (const f of fusionsPossibles(c, h)) {
        expect(connues).toContain(f.technique.parent);
        expect(connues).toContain(f.technique.secondaire);
        expect(f.probleme).toMatch(/rang 2/); // au niveau 1, il manque encore le rang
      }
    }
  });

  it('ancienne sauvegarde : le grimoire partagé va au héros qui a appris la fusion, sinon à ceux qui peuvent l\'utiliser', () => {
    const r = nouvellePartieDeTest(c, 'ancien');
    jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'A' });
    jouer(c, r, { type: 'rejoindre', joueur: 'j2', pseudo: 'B' });
    jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Pyra', classe: 'arcaniste', race: 'elfe', don: 'oeil-du-seuil', origine: 'invoque', age: 21 } });
    jouer(c, r, { type: 'creer_heros', joueur: 'j2', heros: { nom: 'Roc', classe: 'gardien', race: 'nain', don: 'mimetisme', origine: 'invoque', age: 30 } });
    for (const k of ['javelot-de-flamme', 'onde-de-givre']) r.etat.heros.h1.rangsCompetences[k] = 2;
    jouer(c, r, { type: 'fusionner', joueur: 'j1', parent: 'javelot-de-flamme', secondaire: 'onde-de-givre' });
    // on reconstitue un état « ancien format » : grimoire partagé, héros sans grimoire personnel
    const ancien = JSON.parse(JSON.stringify(r.etat));
    ancien.version = 3;
    ancien.grimoire = { ...ancien.heros.h1.grimoire };
    for (const h of Object.values(ancien.heros) as { grimoire?: unknown }[]) delete h.grimoire;
    delete ancien.mises; delete ancien.mouvementsOr;
    const s = lireSauvegarde(JSON.stringify({ format: 'velmaris-sauvegarde', version: 3, exporteeLe: 'x', depart: ancien, actions: [] }));
    expect(s.version).toBeGreaterThanOrEqual(4);
    const apres = appliquer(c, s.depart, { type: 'presence', joueur: 'j1', present: true });
    expect(Object.keys(apres.heros.h1.grimoire)).toEqual(['fusion:javelot-de-flamme+onde-de-givre']);
    expect(apres.heros.h2.grimoire).toEqual({}); // le Gardien ne peut pas l'utiliser
    expect(apres.grimoire).toBeUndefined();
    expect(nouvellePartie(c, 'p', 'P', 'g').grimoire).toBeUndefined();
  });
});