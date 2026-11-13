import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, noeudCourant, nouvellePartie, remplacerVariables } from '../src/moteur/partie';
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
    for (const r of [a, b]) { jouerPrologues(c, r); jouerSceneGroupe(c, r, 'ch1-appel'); jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-examen' }); for (const j of ['j1', 'j2']) jouer(c, r, { type: 'choisir', joueur: j, cle: 'groupe', index: 0 }); }
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

describe('Paris en pièces', () => {
  function examen(orJ1: number) {
    const r = groupeDeDeux(c, 'pari');
    jouerPrologues(c, r);
    jouerSceneGroupe(c, r, 'ch1-appel');
    r.etat.heros.h1.or = orJ1;
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-examen' });
    return r;
  }

  it('miser retire vraiment l\'or de celui qui parie, pas des autres', () => {
    const r = examen(50);
    const orH2 = r.etat.heros.h2.or;
    jouer(c, r, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 1 }); // « Je double ta mise »
    jouer(c, r, { type: 'choisir', joueur: 'j2', cle: 'groupe', index: 0 }); // égalité : le meneur (j1) l'emporte
    expect(r.etat.heros.h1.or).toBe(30);
    expect(r.etat.heros.h2.or).toBe(orH2);
    expect(r.etat.mises).toEqual({ h1: 20 });
    expect(r.etat.mouvementsOr).toEqual([{ heros: 'h1', montant: -20, raison: 'mise' }]);
  });

  it('on ne peut pas miser plus que ce qu\'on a', () => {
    const r = examen(12);
    expect(() => appliquer(c, r.etat, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 1 })).toThrow(/Pas assez d'or pour miser 20 pièces \(vous en avez 12\)/);
  });

  it('pari gagné : la mise et le gain reviennent ; pari perdu : la mise est perdue', () => {
    const r = examen(50);
    jouer(c, r, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 1 });
    jouer(c, r, { type: 'choisir', joueur: 'j2', cle: 'groupe', index: 0 });
    const p = r.etat.scenes.groupe.parole!;
    jouer(c, r, { type: 'repondre', joueur: r.etat.heros[p.heros].joueurId, cle: 'groupe', index: p.reponses[0] });
    // on termine le combat en forçant son résultat, pour tester les deux issues
    const gagne = JSON.parse(JSON.stringify(r.etat)) as typeof r.etat;
    for (const x of gagne.combats.groupe.combat.combattants) if (x.camp === 'ennemis') { x.pv = 0; x.ko = true; }
    gagne.combats.groupe.combat.resultat = 'victoire';
    gagne.combats.groupe.contexte.bilan = [];
    const apresVictoire = appliquer(c, gagne, { type: 'fin_combat', joueur: 'j1', cle: 'groupe' });
    expect(apresVictoire.heros.h1.or).toBe(30 + 40);
    expect(apresVictoire.mises).toEqual({});
    expect(apresVictoire.mouvementsOr).toEqual([{ heros: 'h1', montant: 40, raison: 'pari gagné' }]);

    const perdu = JSON.parse(JSON.stringify(r.etat)) as typeof r.etat;
    perdu.combats.groupe.combat.resultat = 'defaite';
    perdu.combats.groupe.contexte.bilan = [];
    const apresDefaite = appliquer(c, perdu, { type: 'fin_combat', joueur: 'j1', cle: 'groupe' });
    expect(apresDefaite.heros.h1.or).toBe(30);
    expect(apresDefaite.mises).toEqual({});
    finirCombats(c, r);
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