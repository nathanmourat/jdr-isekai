/**
 * Mise à jour 5, point 7 : on n'interrompt jamais un joueur occupé.
 * Deux héros : Ilo se bat (contrat), Kael lance une scène de groupe. Ilo reste dans son combat ; la scène commence
 * sans lui, avec un message clair, et il la rejoint quand il est libre.
 */
import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { choisirActionIA } from '../src/moteur/combat';
import { appliquer, etapeContrat, meneurDeScene, nouvellePartie, occupationHeros, phraseOccupe, type Action, type EtatPartie } from '../src/moteur/partie';
import { creerRng } from '../src/moteur/rng';
import { groupeDeDeux, jouer, jouerPrologues, type Robot } from './robot';

const c = contenuDisque();
const rng = creerRng('occupes');

/** Ilo (h2) accepte un contrat et avance jusqu'à son combat. */
function iloEnCombat(r: Robot) {
  jouer(c, r, { type: 'contrat', joueur: 'j2', contrat: 'c-gobelins' });
  for (let k = 0; k < 10 && !r.etat.combats.h2; k++) {
    const x = etapeContrat(c, r.etat, 'h2');
    jouer(c, r, { type: 'etape_contrat', joueur: 'j2', choix: x?.etape.choix.length ? 0 : undefined });
  }
  expect(r.etat.combats.h2).toBeDefined();
}

/** Termine un seul combat (celui de la clé donnée). */
function finirCombat(r: Robot, cle: string) {
  for (let garde = 0; garde < 2000 && r.etat.combats[cle]; garde++) {
    const { combat } = r.etat.combats[cle];
    if (combat.resultat) { jouer(c, r, { type: 'fin_combat', joueur: r.etat.heros[cle === 'groupe' ? 'h1' : cle].joueurId, cle }); continue; }
    const acteur = combat.combattants.find((x) => x.id === combat.enAttente)!;
    jouer(c, r, { type: 'combat', joueur: acteur.joueurId!, cle, action: choisirActionIA(c, combat, rng, acteur) });
  }
}

/** Ilo (h2) est au milieu de sa scène de classe (premier nœud, pas encore finie). */
function occuperDansUneScene(r: Robot) {
  const sc = c.scenes['cl-guerisseur-1'];
  r.etat.scenes.h2 = { sceneId: sc.id, noeud: sc.debut, heros: ['h2'], votes: {}, dernierTest: null, messages: [], parole: null };
}

function journalContient(e: EtatPartie, texte: string) {
  return e.journal.some((l) => (typeof l === 'string' ? l : (l as { texte: string }).texte).includes(texte));
}

describe('un joueur occupé n\'est jamais interrompu', () => {
  it('la scène de groupe commence sans le héros en combat, puis il la rejoint', () => {
    const r = groupeDeDeux(c, 'occupes');
    jouerPrologues(c, r);
    iloEnCombat(r);
    const combatIlo = r.etat.combats.h2.combat.id;
    expect(occupationHeros(r.etat, 'h2')).toBe('en combat');
    expect(occupationHeros(r.etat, 'h1')).toBeNull();

    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
    const es = r.etat.scenes.groupe;
    expect(es.heros).toEqual(['h1']);
    expect(es.enAttente).toEqual(['h2']);
    // Ilo est toujours dans SON combat, rien n'a bougé
    expect(r.etat.combats.h2.combat.id).toBe(combatIlo);
    expect(r.etat.combats.h2.combat.combattants.some((x) => x.id === 'h:h2')).toBe(true);
    expect(phraseOccupe(r.etat, 'h2', 'en combat')).toBe('Ilo est en combat, il vous rejoindra.');
    expect(journalContient(r.etat, 'Ilo est en combat, il vous rejoindra.')).toBe(true);
    // Kael mène la scène seul : Ilo ne vote pas et ne peut pas encore la rejoindre
    expect(meneurDeScene(r.etat)).toBe('j1');
    expect(() => jouer(c, r, { type: 'rejoindre_scene', joueur: 'j2', cle: 'groupe' })).toThrow(/en combat/);

    finirCombat(r, 'h2');
    expect(occupationHeros(r.etat, 'h2')).toBeNull();
    jouer(c, r, { type: 'rejoindre_scene', joueur: 'j2', cle: 'groupe' });
    expect(r.etat.scenes.groupe.heros).toEqual(['h1', 'h2']);
    expect(r.etat.scenes.groupe.enAttente).toEqual([]);
  });

  it('un héros occupé ne peut pas lancer une scène de groupe', () => {
    const r = groupeDeDeux(c, 'occupes2');
    jouerPrologues(c, r);
    iloEnCombat(r);
    expect(() => jouer(c, r, { type: 'lancer_scene', joueur: 'j2', scene: 'ch1-appel' })).toThrow(/en combat/);
  });

  it('ancienne partie (avant le format 10) : les anciennes actions gardent l\'ancienne règle', () => {
    const r = groupeDeDeux(c, 'occupes3');
    jouerPrologues(c, r);
    iloEnCombat(r);
    r.etat.regleOccupesDepuis = r.etat.numeroAction + 100;
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
    expect(r.etat.scenes.groupe.heros).toEqual(['h1', 'h2']);
  });

  it('examen de rang : un héros prêt mais occupé dans sa scène n\'est pas emmené dans le combat', () => {
    const r = groupeDeDeux(c, 'occupes4');
    jouerPrologues(c, r);
    for (const h of ['h1', 'h2']) { r.etat.heros[h].niveau = 3; r.etat.pointsGuilde[h] = 100; }
    r.etat.flags['examen-reussi'] = true;
    occuperDansUneScene(r);
    expect(occupationHeros(r.etat, 'h2')).toBe('dans une scène');
    jouer(c, r, { type: 'examen_rang', joueur: 'j1' });
    const ids = r.etat.combats.groupe.combat.combattants.map((x) => x.id);
    expect(ids).toContain('h:h1');
    expect(ids).not.toContain('h:h2');
  });

  it('pas d\'étape de contrat en pleine scène (la scène attendrait ce héros)', () => {
    const r = groupeDeDeux(c, 'occupes5');
    jouerPrologues(c, r);
    r.etat.flags['examen-reussi'] = true;
    jouer(c, r, { type: 'contrat', joueur: 'j2', contrat: 'c-gobelins' });
    occuperDansUneScene(r);
    expect(() => jouer(c, r, { type: 'etape_contrat', joueur: 'j2', choix: 0 })).toThrow(/dans une scène/);
  });
});

describe('partie d\'avant le format 10 gardée dans le navigateur (jamais migrée)', () => {
  it('les anciennes actions gardent les anciennes règles jusqu\'à « format_moteur », les nouvelles ensuite', () => {
    // une partie locale créée au format 9 : son état de départ dit version 9 et n'a aucun repère de règle
    let e: EtatPartie = { ...nouvellePartie(c, 'v9', 'V9', 'v9'), version: 9 };
    const jouerE = (a: Action) => { e = appliquer(c, e, a); };
    jouerE({ type: 'rejoindre', joueur: 'j0', pseudo: 'P0' });
    jouerE({ type: 'creer_heros', joueur: 'j0', heros: { nom: 'H0', classe: 'ombre', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } } as Action);
    // ancienne règle : changer de sexe pendant le premier mois était permis, l'action se rejoue
    jouerE({ type: 'changer_sexe', joueur: 'j0', sexe: 'f' });
    expect(e.heros.h1.sexe).toBe('f');
    // au chargement, le jeu envoie format_moteur une fois : la nouvelle règle vaut ensuite
    jouerE({ type: 'format_moteur', joueur: 'j0' });
    expect(e.version).toBe(10);
    expect(() => jouerE({ type: 'changer_sexe', joueur: 'j0', sexe: 'm' })).toThrow(/ne change plus/);
    // un second format_moteur (autre appareil) ne change rien
    const avant = e.regleSexeDepuis;
    jouerE({ type: 'format_moteur', joueur: 'j0' });
    expect(e.regleSexeDepuis).toBe(avant);
  });
});
