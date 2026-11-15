/**
 * Réglages d'un joueur (version Roblox) : langue, volumes, affichage, performances.
 * Gardés sur son compte (DataStore « VelmarisReglages_v1 », server/reglages.ts) et appliqués chez lui seulement.
 * Les images par seconde (60, 144…) se règlent dans le menu de Roblox, pas par le jeu.
 */
import type { Langue } from "./langue";

export interface Reglages {
	/** absent = langue du compte Roblox */
	langue?: Langue;
	/** volumes de 0 à 1 */
	volumeGeneral: number;
	volumeAmbiance: number;
	volumeEffets: number;
	volumeInterface: number;
	/** taille du texte de l'interface, de 0,85 à 1,3 */
	tailleTexte: number;
	/** moins de particules (météo, auras des autres, moulins…) pour les appareils modestes */
	effetsReduits: boolean;
	/** voir les auras, capes, titres et traces des autres joueurs */
	cosmetiquesAutres: boolean;
	/** compteur d'images par seconde en haut à gauche */
	compteurImages: boolean;
	/** bulle de conseils du tutoriel */
	conseils: boolean;
}

export const REGLAGES_DEFAUT: Reglages = {
	volumeGeneral: 0.8,
	volumeAmbiance: 0.7,
	volumeEffets: 0.8,
	volumeInterface: 0.6,
	tailleTexte: 1,
	effetsReduits: false,
	cosmetiquesAutres: true,
	compteurImages: false,
	conseils: true,
};

const LANGUES_OK = ["fr", "en", "es", "de", "ja"];

/** Remet des valeurs sûres (venues d'un joueur ou d'une vieille sauvegarde). */
export function nettoyerReglages(x: unknown): Reglages {
	const r = { ...REGLAGES_DEFAUT };
	if (!typeIs(x, "table")) return r;
	const d = x as Record<string, unknown>;
	const nombre = (k: "volumeGeneral" | "volumeAmbiance" | "volumeEffets" | "volumeInterface" | "tailleTexte", min: number, max: number) => {
		const v = d[k];
		if (typeIs(v, "number") && v === v) r[k] = math.clamp(v, min, max);
	};
	nombre("volumeGeneral", 0, 1);
	nombre("volumeAmbiance", 0, 1);
	nombre("volumeEffets", 0, 1);
	nombre("volumeInterface", 0, 1);
	nombre("tailleTexte", 0.85, 1.3);
	for (const k of ["effetsReduits", "cosmetiquesAutres", "compteurImages", "conseils"] as const) {
		const v = d[k];
		if (typeIs(v, "boolean")) r[k] = v;
	}
	if (typeIs(d.langue, "string") && LANGUES_OK.includes(d.langue)) r.langue = d.langue as Langue;
	return r;
}
