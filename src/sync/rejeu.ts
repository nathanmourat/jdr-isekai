/**
 * Mise à jour de l'état à partir du journal partagé (test 3, point 10).
 * Le journal est trié par numéro d'envoi : une action d'un camarade peut arriver APRÈS la nôtre tout en
 * ayant un numéro plus petit (réseau plus lent). Elle s'insère alors au milieu du journal, pas à la fin.
 * L'ancienne lecture « seulement les actions au-delà de celles déjà connues » la sautait : l'appareil
 * restait bloqué à attendre un vote déjà envoyé. Ici, si le début du journal a changé, on rejoue tout.
 */
import type { Contenu } from '../contenu/types';
import { rejouer, type Action, type EtatPartie } from '../moteur/partie';

const meme = (a: Action, b: Action) => a === b || JSON.stringify(a) === JSON.stringify(b);

export function synchroniser(contenu: Contenu, depart: EtatPartie, etat: EtatPartie | null, connues: Action[], toutes: Action[]): { etat: EtatPartie; rejoue: boolean } {
  let prefixeIntact = toutes.length >= connues.length;
  for (let i = 0; prefixeIntact && i < connues.length; i++) if (!meme(connues[i], toutes[i])) prefixeIntact = false;
  if (!prefixeIntact || !etat) return { etat: rejouer(contenu, depart, toutes).etat, rejoue: true };
  return { etat: rejouer(contenu, etat, toutes.slice(connues.length)).etat, rejoue: false };
}
