import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { affiniteVide, modifierAffinite, palier, peutOffrir, verifierLignesRouges } from '../src/moteur/affinite';
import { caracsTotales, creerHeros, gagnerXp, niveauMax, niveauMoyen, repartirPoint, xpPourNiveau } from '../src/moteur/personnage';
import { formaterDate, versDate, versJour } from '../src/moteur/temps';

const c = contenuDisque();
const nouveau = (o: Partial<Parameters<typeof creerHeros>[1]> = {}) =>
  creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Test', classe: 'archer', race: 'vulpin', don: 'mimetisme', origine: 'invoque', age: 20, anneeCampagne: 1012, ...o });

describe('Expérience et niveaux', () => {
  it('suit la formule 100 × n^1,5', () => {
    expect(xpPourNiveau(c, 1)).toBe(100);
    expect(xpPourNiveau(c, 4)).toBe(800);
  });
  it('fait monter de niveau et donne des points', () => {
    const h = nouveau();
    expect(gagnerXp(c, h, 100 + 283)).toBe(2);
    expect(h.niveau).toBe(3);
    expect(h.pointsCaracDispo).toBe(6);
    expect(h.pointsCompetenceDispo).toBe(2);
    repartirPoint(c, h, 'AGI');
    expect(caracsTotales(c, h).AGI).toBe(c.classes.archer.caracteristiques.AGI + 2 + 1);
  });
  it('ne dépasse pas le niveau maximum de la saison', () => {
    const h = nouveau();
    gagnerXp(c, h, 10_000_000);
    expect(h.niveau).toBe(niveauMax(c));
    expect(niveauMax(c)).toBe(40);
  });
  it('Croissance accélérée donne +15 % d\'XP', () => {
    const h = nouveau({ don: 'croissance-acceleree' });
    gagnerXp(c, h, 80);
    expect(h.xp).toBe(92);
  });
  it('un joueur qui rejoint arrive au niveau moyen du groupe, points répartis', () => {
    const g = [nouveau(), nouveau(), nouveau()];
    g[0].niveau = 6; g[1].niveau = 5; g[2].niveau = 4;
    expect(niveauMoyen(g)).toBe(5);
    const arrivant = nouveau({ niveau: 5 });
    expect(arrivant.niveau).toBe(5);
    expect(arrivant.pointsCaracDispo).toBe(0);
    expect(arrivant.branche).not.toBeNull();
  });
  it('vérifie l\'âge d\'un invoqué', () => {
    expect(() => nouveau({ age: 15 })).toThrow(/Âge/);
  });
  it('un réincarné a 18 ans au début de la campagne', () => {
    const h = nouveau({ origine: 'reincarne' });
    expect(1012 - h.anneeNaissance).toBe(18);
  });
  it('l\'humain répartit librement +1/+1 et −1/−1, pas +2 sur une seule caractéristique', () => {
    expect(() => nouveau({ race: 'humain', libres: { plus: { AGI: 2 }, moins: { CHA: 2 } } })).toThrow(/au plus/);
    const h = nouveau({ race: 'humain', libres: { plus: { AGI: 1, VIT: 1 }, moins: { INT: 1, CHA: 1 } } });
    expect(h.caracsBase.AGI).toBe(c.classes.archer.caracteristiques.AGI + 1);
  });
});

describe('Affinité', () => {
  it('passe les paliers aux bons seuils', () => {
    const a = affiniteVide();
    expect(palier(c, a, false).id).toBe('inconnue');
    modifierAffinite(c, a, 20, { ageHeros: 20 });
    expect(palier(c, a, false).id).toBe('alliee');
    modifierAffinite(c, a, 25, { ageHeros: 20 });
    expect(palier(c, a, false).id).toBe('proche');
    modifierAffinite(c, a, 25, { ageHeros: 20 });
    expect(palier(c, a, false).id).toBe('amoureuse');
  });
  it('« Engagée » exige la fin de la quête personnelle', () => {
    const a = affiniteVide();
    a.points = 95;
    expect(palier(c, a, false).id).toBe('amoureuse');
    expect(palier(c, a, true).id).toBe('engagee');
  });
  it('aucune relation avant 18 ans', () => {
    const a = affiniteVide();
    expect(modifierAffinite(c, a, 10, { ageHeros: 16 })).toBe(0);
    expect(a.points).toBe(0);
  });
  it('une ligne rouge fait chuter l\'affinité et plafonne le palier (refus)', () => {
    const a = affiniteVide();
    a.points = 75;
    const lignes = verifierLignesRouges(c, 'aveline', a, (f) => f === 'civils-abandonnes');
    expect(lignes).toHaveLength(1);
    expect(a.points).toBe(45);
    a.points = 80;
    expect(palier(c, a, false).id).toBe('proche');
    // une ligne déjà franchie ne compte pas deux fois
    expect(verifierLignesRouges(c, 'aveline', a, (f) => f === 'civils-abandonnes')).toHaveLength(0);
  });
  it('une ligne rouge définitive bloque au palier « Alliée »', () => {
    const a = affiniteVide();
    a.points = 90;
    verifierLignesRouges(c, 'aveline', a, (f) => f === 'pacte-cendres');
    modifierAffinite(c, a, 50, { ageHeros: 20 });
    expect(palier(c, a, true).id).toBe('alliee');
  });
  it('un cadeau par semaine au plus', () => {
    const a = affiniteVide();
    expect(peutOffrir(c, a, 10)).toBe(true);
    a.dernierCadeau = 10;
    expect(peutOffrir(c, a, 12)).toBe(false);
    expect(peutOffrir(c, a, 17)).toBe(true);
  });
});

describe('Calendrier', () => {
  it('le jour 0 est le 1er Germinal 1012 AV', () => {
    expect(formaterDate(c, 0)).toBe('1er Germinal 1012 AV');
    expect(versDate(c, 360)).toEqual({ annee: 1013, mois: 1, jour: 1 });
    expect(versJour(c, { annee: 1014, mois: 2, jour: 15 })).toBe(2 * 360 + 30 + 14);
  });
  it('les dates négatives correspondent au passé (prologue)', () => {
    expect(versDate(c, -360 * 18).annee).toBe(994);
  });
});
