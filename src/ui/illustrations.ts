/**
 * Illustrations peintes (version web) : écrans de début de chapitre (content/config/illustrations.yaml).
 * Fichiers : assets/illustrations/<id>.jpg (ou .png, .webp), 1280 × 720.
 * Ce n'est que de l'affichage : rien n'est envoyé aux autres joueurs ni enregistré dans la partie.
 */
import type { Contenu } from '../contenu/types';
import type { EcranChapitre } from '../contenu/schemas';

const images = import.meta.glob('/assets/illustrations/*.{jpg,png,webp}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** URL d'une illustration, ou null si le fichier n'existe pas (`fichiers` sert aux tests). */
export function urlIllustration(id: string, fichiers: Record<string, string> = images): string | null {
  for (const ext of ['jpg', 'png', 'webp']) {
    const u = fichiers[`/assets/illustrations/${id}.${ext}`];
    if (u) return u;
  }
  return null;
}

/** Écran d'un chapitre avec les URL de ses images (celles qui existent), ou null s'il n'y en a aucune. */
export function ecranDuChapitre(c: Contenu, chapitre: number, fichiers: Record<string, string> = images): (EcranChapitre & { urls: string[] }) | null {
  const e = c.ecransChapitre.find((x) => x.chapitre === chapitre);
  if (!e) return null;
  const urls = e.illustrations.map((id) => urlIllustration(id, fichiers)).filter((u): u is string => !!u);
  return urls.length ? { ...e, urls } : null;
}

/**
 * Vrai quand un robot de test pilote le navigateur (Playwright) sans avoir demandé cet affichage
 * dans l'adresse (`?ecran-chapitre`, `?cinematique`) : les écrans et vidéos plein écran ne gênent pas les autres tests.
 */
export function masqueParRobot(param: string): boolean {
  try {
    return typeof navigator !== 'undefined' && navigator.webdriver === true && !new URLSearchParams(location.search).has(param);
  } catch { return false; }
}

/** Clé de l'appareil qui retient qu'un écran de chapitre a été vu dans une partie. */
export function cleChapitreVu(partie: string, chapitre: number): string {
  return `ecran-chapitre:${partie}:${chapitre}`;
}
