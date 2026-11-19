/**
 * Cinématiques (version web) : vidéos courtes jouées au début d'une scène qui a le champ `cinematique` dans son YAML.
 * Fichier : assets/cinematiques/<id>.mp4 (ou .webm). Sans fichier, rien ne s'affiche : le dialogue commence directement.
 * Ce n'est que de l'affichage : rien n'est envoyé aux autres joueurs ni enregistré dans la partie.
 */
const videos = import.meta.glob('/assets/cinematiques/*.{mp4,webm}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** URL de la vidéo d'une cinématique, ou null si le fichier n'existe pas (`fichiers` sert aux tests). */
export function urlCinematique(id: string, fichiers: Record<string, string> = videos): string | null {
  return fichiers[`/assets/cinematiques/${id}.mp4`] ?? fichiers[`/assets/cinematiques/${id}.webm`] ?? null;
}

/** Clé de l'appareil qui retient qu'une cinématique a été vue dans une partie (elle ne se rejoue pas au rechargement). */
export function cleCinematiqueVue(partie: string, id: string): string {
  return `cinematique:${partie}:${id}`;
}
