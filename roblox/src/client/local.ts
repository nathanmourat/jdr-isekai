/**
 * État d'affichage propre à ce joueur (jamais envoyé au serveur) : panneau ouvert, combats dont
 * l'introduction a été lue, propositions impossibles par tour, façon de jouer en combat.
 */
export type Section = "tout" | "parler" | "contrats" | "boutique" | "grimoire" | "auberge" | "etape";
export type Panneau = "fiche" | "quetes" | "journal" | "compagnons" | "carte" | "partie" | "histoire";

export const affichage = {
	panneau: undefined as Panneau | undefined,
	/** Panneau d'un lieu ouvert, et la section demandée (PNJ, tableau, comptoir…). */
	lieu: undefined as string | undefined,
	section: "tout" as Section,
	/** PNJ à qui l'on parle (ses scènes seulement). */
	pnj: undefined as string | undefined,
	/** Intérieur dans lequel se trouve le personnage (undefined = dehors). */
	dans: undefined as string | undefined,
	combatsVus: new Set<string>(),
	/** « combat:tour:acteur » → nombre de propositions impossibles (règle des 3 essais) */
	essais: new Map<string, number>(),
	modeCombat: "script" as "script" | "libre",
	/** Saisie libre en combat, et dernière réponse de l'IA */
	texteLibre: "",
	/** Réplique affichée dans la scène en cours (clé « scène:nœud ») */
	replique: { cle: "", vues: 1 },
	/** Activités de temps libre en cours de choix */
	activites: [] as { activite: string; compagnon?: string }[],
};
