/**
 * Géographie partagée serveur / joueurs : où se trouve chaque lieu dans le monde 3D,
 * et où se déroule un combat selon son décor.
 */
import type { LieuDef } from "./moteur";

/** 1 pixel de la carte du jeu (1920 × 1080) = ECHELLE studs, autour de la place de Lysmont. */
export const ECHELLE = 0.6;
export const CENTRE_CARTE = { x: 960, y: 570 };

export function positionLieu(l: LieuDef): Vector3 {
	return new Vector3((l.position.x - CENTRE_CARTE.x) * ECHELLE, 0, (l.position.y - CENTRE_CARTE.y) * ECHELLE);
}

/** Lieu du monde où l'on se bat, selon le décor de la rencontre (combat « sur place »). */
export const LIEU_DU_DECOR: Record<string, string> = {
	arene: "arene",
	foret: "combe-aux-saules",
	plaine: "combe-aux-saules",
	"rues-nuit": "quartier-tanneurs",
	crypte: "crypte-fontaine",
	ville: "lysmont-place",
};

/** Hauteur à laquelle est dessiné le donjon (au-dessus du monde). */
export const HAUTEUR_DONJON = 800;
