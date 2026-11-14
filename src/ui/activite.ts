import type { EtatPartie } from '../moteur/partie';

/**
 * Résumé de « ce qui se passe » pour un héros : scènes, combats, donjon, étape de contrat.
 * Quand ce résumé change (une scène, un combat ou une épreuve commence), l'interface referme
 * toutes ses fenêtres (boutique, examen de rang, identification, contrats, lit, bulle de PNJ),
 * pour qu'aucune ne reste par-dessus ce qui commence.
 */
export function signatureActivite(etat: EtatPartie, herosId: string | null): string {
  const scenes = Object.keys(etat.scenes).filter((k) => k === 'groupe' || k === herosId).map((k) => `${k}:${etat.scenes[k].sceneId}`);
  const combats = Object.keys(etat.combats).filter((k) => k === 'groupe' || k === herosId).map((k) => `${k}:${etat.combats[k].combat.id}`);
  const ct = herosId ? etat.contrats?.[herosId] : undefined;
  return [scenes.sort().join(','), combats.sort().join(','), etat.donjon ? 'donjon' : '', ct ? `${ct.id}#${ct.etape}` : ''].join('|');
}

/** Vrai si une activité a commencé ou changé (pas au premier affichage). */
export function activiteChangee(avant: string | null, apres: string): boolean {
  return avant !== null && avant !== apres;
}
