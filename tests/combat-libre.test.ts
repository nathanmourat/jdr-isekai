import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { combattantHeros, demarrerCombat, estimerAction } from '../src/moteur/combat';
import { creerTechnique } from '../src/moteur/fusions';
import { appliquer, nouvellePartie } from '../src/moteur/partie';
import { creerHeros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';
import { lireSauvegarde } from '../src/sauvegarde/fichier';
import { jouer, nouvellePartieDeTest } from './robot';

const c = contenuDisque();
const heros = (classe: string, race = 'humain', don = 'oeil-du-seuil', id = 'a') =>
  creerHeros(c, { id, joueurId: 'j', nom: 'Test', classe, race, don, origine: 'invoque', age: 20, anneeCampagne: 1012 });
const combat = (rencontre: string, classe = 'lame-runique') => demarrerCombat(c, rencontre, [combattantHeros(c, heros(classe), true)], creerRng(`libre:${rencontre}:${classe}`));

describe('Estimation des actions (ce que le joueur voit avant de valider)', () => {
  it('donne la chance de toucher, les dégâts et le mana', () => {
    const cb = combat('ref-brute');
    const e = estimerAction(c, cb, { type: 'attaque', acteur: 'h:a', cible: 'e:ref-brute:1' });
    expect(e.possible).toBe(true);
    expect(e.reussite).toBeGreaterThan(0.5);
    expect(e.degats![0]).toBeLessThanOrEqual(e.degats![1]);
    const k = estimerAction(c, cb, { type: 'competence', acteur: 'h:a', competence: 'entaille-runique', cible: 'e:ref-brute:1' });
    expect(k.mana).toBe(5);
  });

  it('refuse une attaque au corps à corps sur le rang arrière, avec une explication', () => {
    const cb = combat('tanneurs-cultistes');
    const e = estimerAction(c, cb, { type: 'attaque', acteur: 'h:a', cible: 'e:cultiste:1' });
    expect(e.possible).toBe(false);
    expect(e.raison).toMatch(/rang arrière/);
  });

  it('refuse une compétence sans assez de mana', () => {
    const cb = combat('ref-brute');
    cb.combattants[0].mana = 0;
    const e = estimerAction(c, cb, { type: 'competence', acteur: 'h:a', competence: 'entaille-runique', cible: 'e:ref-brute:1' });
    expect(e.possible).toBe(false);
    expect(e.raison).toMatch(/mana|indisponible/i);
  });

  it('viser la tête : moins de chances de toucher, plus de dégâts', () => {
    const cb = combat('ref-brute');
    const normal = estimerAction(c, cb, { type: 'attaque', acteur: 'h:a', cible: 'e:ref-brute:1' });
    const tete = estimerAction(c, cb, { type: 'viser', acteur: 'h:a', cible: 'e:ref-brute:1', partie: 'tete' });
    expect(tete.reussite!).toBeLessThan(normal.reussite!);
    expect(tete.degats![1]).toBeGreaterThan(normal.degats![1]);
  });

  it('on ne vise pas la tête d\'une gelée', () => {
    const cb = combat('egouts-lysmont');
    const gelee = cb.combattants.find((x) => x.refId === 'gelee-verte')!;
    const e = estimerAction(c, cb, { type: 'viser', acteur: 'h:a', cible: gelee.id, partie: 'tete' });
    expect(e.possible).toBe(false);
    expect(e.raison).toMatch(/ni tête ni membres/);
  });

  it('se cacher : chance meilleure pour une Ombre', () => {
    const a = estimerAction(c, combat('ref-brute', 'gardien'), { type: 'se_cacher', acteur: 'h:a' });
    const b = estimerAction(c, combat('ref-brute', 'ombre'), { type: 'se_cacher', acteur: 'h:a' });
    expect(b.reussite!).toBeGreaterThan(a.reussite!);
  });
});

describe('Fusions (variantes)', () => {
  it('feu + glace donne une variante à deux éléments, moins chère que les deux compétences', () => {
    const r = creerTechnique(c, 'javelot-de-flamme', 'onde-de-givre', 'Test');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.technique.nom).toBe('Javelot de flamme ✦ givre');
    expect(r.technique.cout).toBeLessThan(c.competences['javelot-de-flamme'].cout + c.competences['onde-de-givre'].cout);
    const puissance = r.technique.effets.filter((e) => e.type === 'degats').reduce((s, e) => s + (e.type === 'degats' ? e.puissance : 0), 0);
    expect(puissance).toBeLessThan(16 + 9); // moins que les deux compétences jouées séparément
  });

  it('refuse deux compétences du même élément, ou une base sans dégâts', () => {
    expect(creerTechnique(c, 'entaille-runique', 'frappe-ecarlate', 'T')).toMatchObject({ ok: false });
    const r = creerTechnique(c, 'rune-de-garde', 'entaille-runique', 'T');
    expect(r.ok).toBe(false);
  });

  it('dans une partie : rang 2 requis, 2 variantes au maximum, grimoire partagé', () => {
    const r = nouvellePartieDeTest(c, 'fusion');
    jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'A' });
    jouer(c, r, { type: 'rejoindre', joueur: 'j2', pseudo: 'B' });
    jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Pyra', classe: 'arcaniste', race: 'elfe', don: 'oeil-du-seuil', origine: 'invoque', age: 21 } });
    jouer(c, r, { type: 'creer_heros', joueur: 'j2', heros: { nom: 'Glacia', classe: 'arcaniste', race: 'humain', don: 'mimetisme', origine: 'invoque', age: 22 } });
    expect(() => appliquer(c, r.etat, { type: 'fusionner', joueur: 'j1', parent: 'javelot-de-flamme', secondaire: 'onde-de-givre' })).toThrow(/rang 2/);
    for (const h of ['h1', 'h2']) { r.etat.heros[h].rangsCompetences['javelot-de-flamme'] = 2; r.etat.heros[h].rangsCompetences['onde-de-givre'] = 2; }
    jouer(c, r, { type: 'fusionner', joueur: 'j1', parent: 'javelot-de-flamme', secondaire: 'onde-de-givre' });
    expect(Object.keys(r.etat.grimoire)).toEqual(['fusion:javelot-de-flamme+onde-de-givre']);
    expect(r.etat.heros.h1.varianteActive['javelot-de-flamme']).toBe('fusion:javelot-de-flamme+onde-de-givre');
    expect(r.etat.journal.at(-1)!.texte).toMatch(/invente une technique/);
    // l'autre joueur l'apprend depuis le grimoire
    jouer(c, r, { type: 'apprendre_technique', joueur: 'j2', technique: 'fusion:javelot-de-flamme+onde-de-givre' });
    expect(r.etat.heros.h2.variantes['javelot-de-flamme']).toHaveLength(1);
    // limite de 2 variantes par compétence
    r.etat.heros.h1.variantes['javelot-de-flamme'].push('fusion:fictive');
    r.etat.heros.h1.rangsCompetences['eclair-en-chaine'] = 2;
    expect(() => appliquer(c, r.etat, { type: 'equiper_competences', joueur: 'j1', competences: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] })).toThrow(/6 compétences/);
  });

  it('en combat, la fusion se joue immédiatement et apparaît dans le journal du combat', () => {
    const r = nouvellePartieDeTest(c, 'fusion-combat');
    jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'A' });
    jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Pyra', classe: 'arcaniste', race: 'elfe', don: 'oeil-du-seuil', origine: 'invoque', age: 21 } });
    r.etat.heros.h1.rangsCompetences['javelot-de-flamme'] = 2;
    r.etat.heros.h1.rangsCompetences['onde-de-givre'] = 2;
    jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: 'c-loups' });
    const cb = r.etat.combats.h1.combat;
    expect(cb.enAttente).toBe('h:h1');
    const cible = cb.combattants.find((x) => x.camp === 'ennemis')!.id;
    jouer(c, r, { type: 'fusionner', joueur: 'j1', parent: 'javelot-de-flamme', secondaire: 'onde-de-givre', cle: 'h1', cible });
    const textes = (r.etat.combats.h1?.combat ?? cb).evenements.map((e) => e.texte).join('\n');
    expect(textes).toMatch(/Javelot de flamme ✦ givre/);
  });
});

describe('Sauvegardes de la version précédente', () => {
  it('une sauvegarde v1 est migrée jusqu\'au format courant (grimoire et repos ajoutés)', () => {
    const depart = nouvellePartie(c, 'p', 'P', 'g') as unknown as Record<string, unknown>;
    delete depart.grimoire;
    delete depart.repos;
    const s = lireSauvegarde(JSON.stringify({ format: 'velmaris-sauvegarde', version: 1, exporteeLe: 'x', depart, actions: [] }));
    expect(s.version).toBe(s.depart.version);
    expect(s.version).toBeGreaterThanOrEqual(3);
    expect((s.depart as unknown as { grimoire: object }).grimoire).toEqual({});
    expect(s.depart.repos).toBeNull();
  });
});
