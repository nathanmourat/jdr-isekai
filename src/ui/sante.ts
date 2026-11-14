/**
 * PV et mana d'un héros hors combat (test 3, point 12), calculés par le moteur comme au début d'un combat :
 * les PV sont gardés d'un combat à l'autre (heros.pv) ; le max tient compte de la blessure d'un K.O. (mort douce).
 * On les récupère avec le temps, le repos, un repas, une ration, une potion ou les soins du Temple. Le mana est toujours plein.
 */
import type { Contenu } from '../contenu/types';
import { combattantHeros } from '../moteur/combat';
import { listeHeros, type EtatPartie } from '../moteur/partie';
import type { Heros } from '../moteur/personnage';

export interface Sante { pv: number; pvMax: number; mana: number; manaMax: number }

export function santeHeros(contenu: Contenu, h: Heros): Sante {
  const x = combattantHeros(contenu, h, true, h.grimoire ?? {});
  const sain = h.blessure ? combattantHeros(contenu, { ...h, blessure: false }, true, h.grimoire ?? {}) : x;
  return { pv: h.pv === undefined ? x.pvMax : Math.min(x.pvMax, h.pv), pvMax: sain.pvMax, mana: x.manaMax, manaMax: sain.manaMax };
}

/** Seuil de confirmation avant un combat (part des PV max). */
export const SEUIL_PV_CONFIRMATION = 0.5;

/** Messages d'alerte pour les héros présents trop faibles : « Attention : Lise n'a que 20/65 PV… ». */
export function alertesSante(contenu: Contenu, etat: EtatPartie, seuil = SEUIL_PV_CONFIRMATION): string[] {
  return listeHeros(etat)
    .filter((h) => etat.joueurs[h.joueurId]?.present ?? false)
    .map((h) => ({ h, s: santeHeros(contenu, h) }))
    .filter(({ s }) => s.pv < s.pvMax * seuil)
    .map(({ h, s }) => `Attention : ${etat.joueurs[h.joueurId]?.pseudo ?? h.nom} n'a que ${s.pv}/${s.pvMax} PV. Se soigner : auberge, Temple ou potion.`);
}
