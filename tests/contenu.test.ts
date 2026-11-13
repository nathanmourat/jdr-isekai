import { describe, expect, it } from 'vitest';
import { chargerContenu, ErreurContenu } from '../src/contenu/charger';
import { contenuDisque, lireFichiersContenu } from '../src/contenu/node';
import { caracsDeDepart } from '../src/moteur/personnage';

describe('Contenu du jeu', () => {
  it('se charge sans erreur', () => {
    const c = contenuDisque();
    expect(Object.keys(c.classes)).toHaveLength(10);
    expect(Object.keys(c.races)).toHaveLength(8);
    expect(Object.keys(c.dons)).toHaveLength(12);
    expect(c.compagnons.aveline).toBeDefined();
  });

  it('toutes les classes ont 60 points et au moins 2 compétences actives', () => {
    const c = contenuDisque();
    for (const cl of Object.values(c.classes)) {
      expect(Object.values(cl.caracteristiques).reduce((a, b) => a + b, 0)).toBe(60);
      expect(cl.competences.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('chaque combinaison classe × race garde 60 points, entre 3 et 17', () => {
    const c = contenuDisque();
    for (const cl of Object.keys(c.classes)) for (const ra of Object.keys(c.races)) {
      const k = caracsDeDepart(c, cl, ra);
      expect(Object.values(k).reduce((a, b) => a + b, 0)).toBe(60);
      for (const v of Object.values(k)) { expect(v).toBeGreaterThanOrEqual(3); expect(v).toBeLessThanOrEqual(17); }
    }
  });

  it('le chapitre 1 contient au moins 4 quêtes secondaires', () => {
    const c = contenuDisque();
    expect(Object.values(c.quetes).filter((q) => q.chapitre === 1 && q.type === 'secondaire').length).toBeGreaterThanOrEqual(4);
  });

  it('signale une erreur de contenu en français, avec le fichier et le champ', () => {
    const fichiers = lireFichiersContenu();
    fichiers['/content/test-faux.yaml'] = 'ennemis:\n  - id: faux\n    nom: Faux\n    niveau: "beaucoup"\n';
    try {
      chargerContenu(fichiers);
      throw new Error('aurait dû échouer');
    } catch (e) {
      expect(e).toBeInstanceOf(ErreurContenu);
      const m = (e as Error).message;
      expect(m).toContain('test-faux.yaml');
      expect(m).toContain('niveau');
      expect(m).toContain('erreur');
    }
  });

  it('signale une référence cassée (scène vers un nœud inexistant)', () => {
    const fichiers = lireFichiersContenu();
    fichiers['/content/test-scene.yaml'] = `scenes:
  - id: scene-cassee
    titre: Test
    type: groupe
    decor: guilde
    noeuds:
      debut:
        suite: nulle-part
`;
    expect(() => chargerContenu(fichiers)).toThrow(/nulle-part/);
  });
});
