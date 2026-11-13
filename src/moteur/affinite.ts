/**
 * Affinité entre un héros et un compagnon (0 à 100), par paliers.
 * Un compagnon peut refuser : lignes rouges, palier « Engagée » réservé à la fin de sa quête,
 * aucune romance avant que le héros soit adulte.
 */
import type { Contenu } from '../contenu/charger';

export interface Affinite {
  points: number;
  /** Ligne rouge franchie : null, 'temporaire' (palier plafonné à « Proche » jusqu'au pardon) ou 'definitive'. */
  blocage: null | 'temporaire' | 'definitive';
  dernierCadeau: number | null;
  lignesFranchies: string[];
}

export const affiniteVide = (): Affinite => ({ points: 0, blocage: null, dernierCadeau: null, lignesFranchies: [] });

export function paliers(contenu: Contenu) {
  return [...contenu.config.affinite.paliers].sort((a, b) => a.seuil - b.seuil);
}

/** Palier effectif (tient compte des blocages et de la quête personnelle pour « Engagée »). */
export function palier(contenu: Contenu, a: Affinite, queteTerminee: boolean): { id: string; nom: string; index: number } {
  const ps = paliers(contenu);
  let i = 0;
  for (let k = 0; k < ps.length; k++) if (a.points >= ps[k].seuil) i = k;
  const iProche = ps.findIndex((p) => p.id === 'proche');
  const iAlliee = ps.findIndex((p) => p.id === 'alliee');
  const iEngagee = ps.findIndex((p) => p.id === 'engagee');
  if (a.blocage === 'definitive') i = Math.min(i, iAlliee);
  if (a.blocage === 'temporaire') i = Math.min(i, iProche);
  if (i === iEngagee && !queteTerminee) i = iEngagee - 1;
  return { id: ps[i].id, nom: ps[i].nom, index: i };
}

/** Paliers atteints (pour les bonus de combat cumulés). */
export function paliersAtteints(contenu: Contenu, a: Affinite, queteTerminee: boolean): string[] {
  const p = palier(contenu, a, queteTerminee);
  return paliers(contenu).slice(0, p.index + 1).map((x) => x.id);
}

/** Modifie l'affinité ; renvoie la variation réellement appliquée. */
export function modifierAffinite(contenu: Contenu, a: Affinite, delta: number, opts: { ageHeros: number; bonusDialogue?: number }): number {
  if (opts.ageHeros < 18) return 0; // pas de relation avant l'âge adulte
  let d = delta;
  if (d > 0 && opts.bonusDialogue) d = Math.round(d * (1 + opts.bonusDialogue));
  const plafond = a.blocage === 'definitive' ? paliers(contenu).find((p) => p.id === 'proche')!.seuil - 1 : 100;
  const avant = a.points;
  a.points = Math.max(0, Math.min(plafond, a.points + d));
  return a.points - avant;
}

export type ReactionCadeau = 'prefere' | 'apprecie' | 'neutre' | 'deteste';

export function reactionCadeau(contenu: Contenu, compagnonId: string, objetId: string): ReactionCadeau {
  const c = contenu.compagnons[compagnonId].cadeaux;
  if (c.prefere.includes(objetId)) return 'prefere';
  if (c.apprecie.includes(objetId)) return 'apprecie';
  if (c.deteste.includes(objetId)) return 'deteste';
  return 'neutre';
}

export function peutOffrir(contenu: Contenu, a: Affinite, jour: number): boolean {
  return a.dernierCadeau === null || jour - a.dernierCadeau >= contenu.config.affinite.jours_entre_cadeaux;
}

/** Vérifie les lignes rouges d'un compagnon après un changement de drapeaux. Renvoie les lignes franchies maintenant. */
export function verifierLignesRouges(contenu: Contenu, compagnonId: string, a: Affinite, aLeFlag: (flag: string) => boolean): string[] {
  const nouvelles: string[] = [];
  for (const l of contenu.compagnons[compagnonId].lignes_rouges) {
    if (a.lignesFranchies.includes(l.flag) || !aLeFlag(l.flag)) continue;
    a.lignesFranchies.push(l.flag);
    a.points = Math.max(0, a.points + l.penalite);
    a.blocage = l.definitive ? 'definitive' : a.blocage === 'definitive' ? 'definitive' : 'temporaire';
    nouvelles.push(l.description);
  }
  return nouvelles;
}

export function pardonner(a: Affinite) {
  if (a.blocage === 'temporaire') a.blocage = null;
}
