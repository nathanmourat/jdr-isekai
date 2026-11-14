import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { aideNiveau, couleurNiveau, lieuAvecCombat, niveauDuLieu, niveauGroupe, niveauQuete, prochaineEtape } from '../src/moteur/guide';
import { groupeDeDeux, jouerPrologues, jouerSceneGroupe } from './robot';

const c = contenuDisque();

describe("Guide : où aller et où se battre", () => {
  it("au début, la prochaine étape mène au Temple du Seuil (l'Appel)", () => {
    const r = groupeDeDeux(c);
    jouerPrologues(c, r);
    const e = prochaineEtape(c, r.etat, 'h1');
    expect(e?.lieu).toBe('temple-du-seuil');
    expect(e?.disponible).toBe(true);
  });

  it("après l'Appel : examen à la Guilde, marquée d'un combat", () => {
    const r = groupeDeDeux(c);
    jouerPrologues(c, r);
    jouerSceneGroupe(c, r, 'ch1-appel');
    const e = prochaineEtape(c, r.etat, 'h1');
    expect(e?.lieu).toBe('guilde');
    expect(e?.objectif).toMatch(/examen/i);
    expect(lieuAvecCombat(c, r.etat, 'guilde', 'h1')).toBe(true);
    expect(lieuAvecCombat(c, r.etat, 'taverne', 'h1')).toBe(false);
  });
});

describe('Niveau conseillé des quêtes et des contrats', () => {
  it('vert si le groupe a le niveau, orange s\'il manque 1 ou 2 niveaux, rouge à partir de 3', () => {
    expect(couleurNiveau(4, 4)).toBe('vert');
    expect(couleurNiveau(4, 6)).toBe('vert');
    expect(couleurNiveau(4, 3)).toBe('orange');
    expect(couleurNiveau(4, 2)).toBe('orange');
    expect(couleurNiveau(4, 1)).toBe('rouge');
    expect(aideNiveau(4, 2)).toContain('Conseillé : niveau 4. Votre groupe : niveau 2.');
  });

  it('chaque quête et chaque contrat a un niveau conseillé', () => {
    for (const q of Object.values(c.quetes)) expect(q.niveau, q.id).toBeGreaterThanOrEqual(1);
    for (const ct of Object.values(c.contrats)) expect(ct.niveau, ct.id).toBeGreaterThanOrEqual(1);
  });

  it('le niveau du groupe est la moyenne des héros ; le lieu de l\'étape en cours porte le niveau de la quête', () => {
    const r = groupeDeDeux(c);
    jouerPrologues(c, r);
    r.etat.heros.h1.niveau = 5;
    r.etat.heros.h2.niveau = 2;
    expect(niveauGroupe(r.etat)).toBe(3);
    jouerSceneGroupe(c, r, 'ch1-appel');
    expect(niveauDuLieu(c, r.etat, 'guilde', 'h1')).toBe(c.quetes['q-ch1-appel'].niveau);
    expect(niveauDuLieu(c, r.etat, 'arene', 'h1')).toBeNull();
    r.etat.quetes['q-ch1-appel'].etape = 'crypte';
    expect(niveauQuete(c, r.etat, 'q-ch1-appel')).toBe(4);
  });
});
