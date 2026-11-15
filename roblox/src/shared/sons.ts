/**
 * Sons du jeu : numéros d'assets Roblox (« rbxassetid://123456 »). Vides par défaut : un son vide n'est pas joué.
 * Pour en ajouter : dans Studio, Boîte à outils (Toolbox) → onglet Audio (ou le Creator Store sur le site) →
 * choisis un son libre d'utilisation, clic droit → « Copier l'identifiant de l'asset », puis colle-le ici :
 *   taverne: "rbxassetid://123456789",
 * Écoute-le d'abord : certains sons sont trop forts ou trop longs. Voir roblox/README-ROBLOX.md (« Sons »).
 */
export const SONS = {
	// ── Ambiances en boucle (une seule à la fois, selon l'endroit) ──
	/** Ville le jour (foule, oiseaux) */
	ambianceVille: "",
	/** Ville la nuit (grillons, vent léger) */
	ambianceNuit: "",
	/** Campagne, champs, forêt (vent, oiseaux) : hors des villes */
	ambianceNature: "",
	/** Intérieur de la taverne (brouhaha, musique) */
	taverne: "",
	/** Intérieur d'un temple (chœur, écho) */
	temple: "",
	/** Forge d'une maison de forgeron (marteau sur l'enclume) */
	forge: "",
	/** Donjon (gouttes d'eau, échos, grondements) */
	donjon: "",
	/** Musique de combat */
	combat: "",
	/** Musique de combat contre un boss */
	combatBoss: "",

	// ── Météo, en boucle, par-dessus l'ambiance ──
	pluie: "",
	/** Vent fort (tempête de sable, neige, cendres) */
	vent: "",

	// ── Sons courts ──
	/** Fanfare de victoire */
	victoire: "",
	/** Défaite (quelques notes graves) */
	defaite: "",
	/** Coup porté (à chaque dégât) */
	coup: "",
	/** Sort lancé (compétence magique) */
	sort: "",
	/** Dé qui roule (test de caractéristique) */
	de: "",
	/** Test réussi */
	reussite: "",
	/** Test raté */
	echec: "",
	/** Coffre qui s'ouvre (donjon) */
	coffre: "",
	/** Piège qui se déclenche (donjon) */
	piege: "",
	/** Montée de niveau */
	niveau: "",
	/** Pièces d'or (achat, gain d'or) */
	pieces: "",
};

export type CleSon = keyof typeof SONS;
