import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { combattantEnnemi, combattantHeros, demarrerCombat, jouerAction, multiplicateursDifficulte, recompensesCombat } from '../src/moteur/combat';
import { creerHeros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';
import { simulerCombat } from '../src/moteur/simulation';

const c = contenuDisque();
const heros = (classe = 'lame-runique', race = 'humain', don = 'oeil-du-seuil') =>
  creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Test', classe, race, don, origine: 'invoque', age: 20, anneeCampagne: 1012 });

describe('Combat', () => {
  it('est reproductible : même graine, même déroulé', () => {
    const a = simulerCombat(c, 'ref-chef', [{ classe: 'ombre', race: 'vulpin', don: 'pas-de-l-ombre' }], 'g1');
    const b = simulerCombat(c, 'ref-chef', [{ classe: 'ombre', race: 'vulpin', don: 'pas-de-l-ombre' }], 'g1');
    expect(a.evenements.map((e) => e.texte)).toEqual(b.evenements.map((e) => e.texte));
    expect(a.resultat).toBe(b.resultat);
  });

  it('se termine toujours (victoire, défaite ou fuite) pour toutes les classes', () => {
    for (const classe of Object.keys(c.classes)) {
      const r = simulerCombat(c, 'ref-meute', [{ classe, race: 'nain', don: 'mimetisme' }], `fin-${classe}`);
      expect(['victoire', 'defaite']).toContain(r.resultat);
    }
  });

  it('attend le joueur quand son héros est contrôlé, et refuse une action hors de son tour', () => {
    const rng = creerRng('tour');
    const cb = demarrerCombat(c, 'ref-brute', [combattantHeros(c, heros(), true)], rng);
    expect(cb.enAttente).toBe('h:a');
    expect(() => jouerAction(c, cb, rng, { type: 'attaque', acteur: 'e:ref-brute:1', cible: 'h:a' })).toThrow(/pas le tour/);
    jouerAction(c, cb, rng, { type: 'defendre', acteur: 'h:a' });
    expect(cb.evenements.some((e) => e.texte.includes('se met en garde'))).toBe(true);
  });

  it('refuse une compétence sans assez de mana', () => {
    const rng = creerRng('mana');
    const cb = demarrerCombat(c, 'ref-brute', [combattantHeros(c, heros(), true)], rng);
    cb.combattants[0].mana = 0;
    expect(() => jouerAction(c, cb, rng, { type: 'competence', acteur: 'h:a', competence: 'entaille-runique' })).toThrow(/Mana|indisponible/);
  });

  it('un héros à 0 PV est K.O. et la défaite est déclarée si tout le groupe tombe', () => {
    const rng = creerRng('ko');
    const h = combattantHeros(c, heros(), true);
    const cb = demarrerCombat(c, 'ref-chef', [h], rng);
    cb.combattants[0].pv = 1;
    cb.combattants[0].caracs.VIT = 0;
    // le héros se défend en boucle jusqu'à tomber
    for (let i = 0; i < 50 && !cb.resultat; i++) jouerAction(c, cb, rng, { type: 'defendre', acteur: 'h:a' });
    expect(cb.resultat).toBe('defaite');
    expect(cb.combattants[0].ko).toBe(true);
  });

  it('la difficulté augmente avec le nombre de héros (et s\'interpole)', () => {
    const m1 = multiplicateursDifficulte(c, 1), m2 = multiplicateursDifficulte(c, 2), m25 = multiplicateursDifficulte(c, 2.5), m4 = multiplicateursDifficulte(c, 4);
    expect(m2.pv).toBeGreaterThan(m1.pv);
    expect(m25.pv).toBeGreaterThan(m2.pv);
    expect(m4.ennemisEnPlus).toBeGreaterThan(0);
  });

  it('un groupe de 3 affronte des ennemis supplémentaires', () => {
    const rng = creerRng('grp');
    const h = (id: string, cl: string) => combattantHeros(c, { ...heros(cl), id, joueurId: id }, false);
    const cb = demarrerCombat(c, 'ref-meute', [h('a', 'gardien'), h('b', 'archer'), h('c', 'guerisseur')], rng);
    expect(cb.combattants.filter((x) => x.camp === 'ennemis').length).toBe(4);
  });

  it('les récompenses sont données pour les ennemis vaincus', () => {
    const r = simulerCombat(c, 'ref-rapide', [{ classe: 'berserker', race: 'ourvalis', don: 'oeil-du-seuil' }], 'recomp');
    if (r.resultat === 'victoire') expect(recompensesCombat(c, r, creerRng('x')).xpParHeros).toBe(30);
  });

  it('les ennemis résistants au poison n\'en subissent pas', () => {
    const sq = combattantEnnemi(c, c.ennemis.squelette, 'e');
    expect(sq.resistances.poison).toBe(1);
  });
});
