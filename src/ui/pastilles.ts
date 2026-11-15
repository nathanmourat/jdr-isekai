/**
 * Pastilles du menu ☰ (test 4, point 10) :
 *   - rouge = une action importante attend le joueur (points à placer, branche à choisir, quête à rendre) ;
 *   - vert = une simple information (nouvelles lignes du Journal).
 * Sur le bouton ☰ : le nombre d'entrées rouges s'il y en a, sinon le nombre de nouveautés en vert.
 * Les pastilles vertes disparaissent quand on ouvre l'entrée (le Journal marque ses lignes comme vues).
 */
export type Panneau = 'histoire' | 'fiche' | 'compagnons' | 'quetes' | 'journal' | 'partie';

export interface Pastille { couleur: 'rouge' | 'vert'; texte: string; titre: string }

export interface EtatPastilles {
  pointsCarac: number;
  pointsCompetence: number;
  brancheAChoisir: boolean;
  queteARendre: boolean;
  nouvellesLignes: number;
}

export function pastillesMenu(e: EtatPastilles): { parEntree: Partial<Record<Panneau, Pastille>>; bouton: Pastille | null } {
  const parEntree: Partial<Record<Panneau, Pastille>> = {};
  const aFaire: string[] = [];
  if (e.pointsCarac > 0) aFaire.push(`${e.pointsCarac} point(s) de caractéristique à placer`);
  if (e.pointsCompetence > 0) aFaire.push(`${e.pointsCompetence} point(s) de compétence à placer`);
  if (e.brancheAChoisir) aFaire.push('une branche à choisir');
  if (aFaire.length) parEntree.fiche = { couleur: 'rouge', texte: '!', titre: `À faire : ${aFaire.join(', ')}` };
  if (e.queteARendre) parEntree.quetes = { couleur: 'rouge', texte: '?', titre: 'Une quête attend d\'être rendue' };
  if (e.nouvellesLignes > 0) parEntree.journal = { couleur: 'vert', texte: String(e.nouvellesLignes), titre: `${e.nouvellesLignes} nouvelle(s) ligne(s) dans le journal` };
  const rouges = Object.values(parEntree).filter((p) => p?.couleur === 'rouge').length;
  const bouton: Pastille | null = rouges > 0
    ? { couleur: 'rouge', texte: String(rouges), titre: `${rouges} action(s) importante(s) à faire` }
    : e.nouvellesLignes > 0 ? { couleur: 'vert', texte: String(e.nouvellesLignes), titre: 'Nouveautés dans le journal' } : null;
  return { parEntree, bouton };
}

/** Ordre du menu : entrées à pastille rouge d'abord, puis vertes, puis les autres (ordre habituel conservé). */
export function trierEntrees<T extends [Panneau, ...unknown[]]>(entrees: T[], parEntree: Partial<Record<Panneau, Pastille>>): T[] {
  const rang = (p: Panneau) => (parEntree[p]?.couleur === 'rouge' ? 0 : parEntree[p]?.couleur === 'vert' ? 1 : 2);
  return entrees.map((x, i) => ({ x, i })).sort((a, b) => rang(a.x[0]) - rang(b.x[0]) || a.i - b.i).map((y) => y.x);
}
