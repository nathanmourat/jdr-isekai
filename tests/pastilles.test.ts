import { describe, expect, it } from 'vitest';
import { pastillesMenu, trierEntrees, type Panneau } from '../src/ui/pastilles';

const rien = { pointsCarac: 0, pointsCompetence: 0, brancheAChoisir: false, queteARendre: false, nouvellesLignes: 0 };
const ENTREES: [Panneau, string][] = [['histoire', 'Histoire'], ['fiche', 'Personnage'], ['compagnons', 'Compagnons'], ['quetes', 'Quêtes'], ['journal', 'Journal'], ['partie', 'Partie']];

describe('Pastilles du menu (test 4, point 10)', () => {
  it('rien de neuf : pas de pastille', () => {
    expect(pastillesMenu(rien).bouton).toBeNull();
  });
  it('seulement des lignes du journal : pastille verte avec leur nombre', () => {
    const p = pastillesMenu({ ...rien, nouvellesLignes: 7 });
    expect(p.bouton).toMatchObject({ couleur: 'vert', texte: '7' });
    expect(p.parEntree.journal).toMatchObject({ couleur: 'vert', texte: '7' });
  });
  it('une action importante : le bouton est rouge et compte les entrées rouges, pas les lignes du journal', () => {
    const p = pastillesMenu({ ...rien, pointsCarac: 3, queteARendre: true, nouvellesLignes: 7 });
    expect(p.bouton).toMatchObject({ couleur: 'rouge', texte: '2' });
    expect(p.parEntree.fiche?.couleur).toBe('rouge');
    expect(p.parEntree.quetes?.couleur).toBe('rouge');
    expect(p.parEntree.journal?.couleur).toBe('vert');
  });
  it('branche à choisir ou points de compétence : rouge sur « Personnage »', () => {
    expect(pastillesMenu({ ...rien, brancheAChoisir: true }).parEntree.fiche?.couleur).toBe('rouge');
    expect(pastillesMenu({ ...rien, pointsCompetence: 1 }).bouton?.couleur).toBe('rouge');
  });
  it('menu : les rouges d\'abord, puis les vertes, puis les autres dans l\'ordre habituel', () => {
    const p = pastillesMenu({ ...rien, queteARendre: true, nouvellesLignes: 2 });
    expect(trierEntrees(ENTREES, p.parEntree).map((e) => e[0])).toEqual(['quetes', 'journal', 'histoire', 'fiche', 'compagnons', 'partie']);
  });
});
