import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { lieuAvecCombat, prochaineEtape } from '../src/moteur/guide';
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
