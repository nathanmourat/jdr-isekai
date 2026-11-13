import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer } from '../src/moteur/partie';
import { marqueurLieu, marqueurPnj, scenesDuPnj } from '../src/moteur/guide';
import { groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe } from './robot';

const c = contenuDisque();

function apresExamen() {
  const r = groupeDeDeux(c, 'ville');
  jouerPrologues(c, r);
  jouerSceneGroupe(c, r, 'ch1-appel');
  jouerSceneGroupe(c, r, 'ch1-examen');
  return r;
}

describe('Ville de Lysmont, PNJ et boutique', () => {
  it('Lysmont regroupe ses lieux ; le Temple et la Combe restent sur la carte du monde', () => {
    const lieux = c.regions.aubeclaire.lieux;
    const enVille = lieux.filter((l) => l.ville === 'lysmont').map((l) => l.id).sort();
    expect(enVille).toEqual(['arene', 'boutique', 'chateau', 'guilde', 'lysmont-place', 'quartier-tanneurs', 'taverne']);
    for (const id of ['temple-du-seuil', 'combe-aux-saules', 'crypte-fontaine']) expect(lieux.find((l) => l.id === id)!.ville).toBeUndefined();
    expect(lieux.find((l) => l.id === 'taverne')!.auberge).toBe(true);
    for (const l of lieux.filter((x) => x.ville)) expect(l.position_plan).toBeDefined();
  });

  it('le Grand Prieur a été renommé partout', () => {
    expect(c.pnj.mathis).toBeUndefined();
    expect(c.pnj.aureliath.nom).toBe('Grand Prieur Auréliath');
    expect(JSON.stringify(c.scenes)).not.toMatch(/mathis/i);
  });

  it('au début, le Grand Prieur porte le « ! » doré de la quête principale', () => {
    const r = groupeDeDeux(c, 'ville');
    expect(marqueurPnj(c, r.etat, 'temple-du-seuil', 'aureliath', 'h1')).toBe('principale');
    expect(marqueurLieu(c, r.etat, 'temple-du-seuil', 'h1')).toBe('principale');
    expect(scenesDuPnj(c, r.etat, 'temple-du-seuil', 'aureliath', 'h1').map((s) => s.id)).toEqual(['ch1-appel']);
    expect(marqueurPnj(c, r.etat, 'temple-du-seuil', 'elianne', 'h1')).toBeNull();
  });

  it('toute scène liée à un PNJ a ce PNJ dans son lieu', () => {
    for (const s of Object.values(c.scenes)) {
      if (!s.pnj || !s.lieu) continue;
      const lieu = c.regions.aubeclaire.lieux.find((l) => l.id === s.lieu)!;
      expect(lieu.pnj.map((p) => p.id), `scène ${s.id}`).toContain(s.pnj);
    }
  });

  it('quête d\'initiation : parler à Halvine, acheter, vendre, puis rendre la quête', () => {
    const r = apresExamen();
    expect(marqueurPnj(c, r.etat, 'boutique', 'halvine', 'h1')).toBe('secondaire');
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'sq-boutique' });
    while (r.etat.scenes.h1 && r.etat.scenes.h1.noeud !== '__fin__') jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'h1' });
    jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'h1' });
    expect(r.etat.quetes['q-boutique']).toEqual({ etape: 'acheter', terminee: false });
    expect(r.etat.heros.h1.inventaire['breloque-cabossee']).toBe(1);

    const orAvant = r.etat.heros.h1.or;
    const potionsAvant = r.etat.heros.h1.inventaire['potion-soin-petite'] ?? 0;
    jouer(c, r, { type: 'acheter', joueur: 'j1', objet: 'potion-soin-petite', lieu: 'boutique', quantite: 2 });
    expect(r.etat.heros.h1.inventaire['potion-soin-petite']).toBe(potionsAvant + 2);
    expect(r.etat.heros.h1.or).toBeLessThan(orAvant);
    expect(r.etat.quetes['q-boutique'].etape).toBe('vendre');

    jouer(c, r, { type: 'vendre', joueur: 'j1', objet: 'breloque-cabossee' });
    expect(r.etat.heros.h1.inventaire['breloque-cabossee']).toBe(0);
    expect(r.etat.quetes['q-boutique'].etape).toBe('retour');
    expect(marqueurPnj(c, r.etat, 'boutique', 'halvine', 'h1')).toBe('rendre');

    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'sq-boutique-fin' });
    while (r.etat.scenes.h1 && r.etat.scenes.h1.noeud !== '__fin__') jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'h1' });
    expect(r.etat.quetes['q-boutique'].terminee).toBe(true);
    expect(marqueurPnj(c, r.etat, 'boutique', 'halvine', 'h1')).toBeNull();
  });

  it('on ne peut pas acheter plus que son or, ni vendre plus que son stock', () => {
    const r = apresExamen();
    expect(() => appliquer(c, r.etat, { type: 'acheter', joueur: 'j1', objet: 'bijou-dore', lieu: 'boutique', quantite: 50 })).toThrow(/or/);
    expect(() => appliquer(c, r.etat, { type: 'vendre', joueur: 'j1', objet: 'potion-soin-petite', quantite: 99 })).toThrow(/que/);
    expect(() => appliquer(c, r.etat, { type: 'acheter', joueur: 'j1', objet: 'ration', lieu: 'boutique', quantite: 0 })).toThrow(/Quantité/);
  });
});
