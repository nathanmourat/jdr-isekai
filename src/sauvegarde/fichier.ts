/** Lecture d'un fichier de sauvegarde (texte JSON) — version web. Sur Roblox, le décodage JSON est fait par le serveur. */
import { ErreurSauvegarde, verifierSauvegarde, type Sauvegarde } from './migrations';

export function lireSauvegarde(texte: string): Sauvegarde {
  let brut: unknown;
  try { brut = JSON.parse(texte); } catch { throw new ErreurSauvegarde('Fichier illisible : ce n\'est pas une sauvegarde (JSON invalide).'); }
  return verifierSauvegarde(brut);
}
