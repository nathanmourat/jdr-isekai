/**
 * Grades et permissions de modération (version Roblox).
 * Tout se règle ici : qui peut faire quoi. Un grade a aussi toutes les permissions des grades en dessous.
 * Règle générale : on n'agit que sur un joueur de grade STRICTEMENT inférieur (le propriétaire est intouchable).
 */

export type Grade = "joueur" | "moderateur" | "admin" | "proprietaire";

export const NIVEAU_GRADE: Record<Grade, number> = { joueur: 0, moderateur: 1, admin: 2, proprietaire: 3 };

export const NOMS_GRADES: Record<Grade, string> = {
	joueur: "Joueur",
	moderateur: "Modérateur",
	admin: "Administrateur",
	proprietaire: "Propriétaire",
};

/** Étiquette au-dessus de la tête (rien pour un joueur). */
export const ETIQUETTES: Record<Grade, { texte: string; couleur: Color3 } | undefined> = {
	joueur: undefined,
	moderateur: { texte: "🛡 Modérateur", couleur: Color3.fromRGB(120, 190, 255) },
	admin: { texte: "⚔ Administrateur", couleur: Color3.fromRGB(255, 160, 80) },
	proprietaire: { texte: "👑 Propriétaire", couleur: Color3.fromRGB(255, 210, 90) },
};

export type Permission =
	// modérateur
	| "voir_journal"
	| "avertir"
	| "muet"
	| "figer"
	| "aller_vers"
	| "renvoyer"
	// administrateur
	| "amener"
	| "bannir_temporaire"
	| "debannir"
	| "annonce"
	| "nommer_moderateur"
	// propriétaire
	| "bannir_definitif"
	| "nommer_admin"
	| "arreter_serveur"
	| "outils_jeu";

const MODERATEUR: Permission[] = ["voir_journal", "avertir", "muet", "figer", "aller_vers", "renvoyer"];
const ADMIN: Permission[] = [...MODERATEUR, "amener", "bannir_temporaire", "debannir", "annonce", "nommer_moderateur"];
const PROPRIETAIRE: Permission[] = [...ADMIN, "bannir_definitif", "nommer_admin", "arreter_serveur", "outils_jeu"];

export const PERMISSIONS: Record<Grade, Permission[]> = {
	joueur: [],
	moderateur: MODERATEUR,
	admin: ADMIN,
	proprietaire: PROPRIETAIRE,
};

export function aPermission(g: Grade, p: Permission): boolean {
	return PERMISSIONS[g].includes(p);
}

/** Vrai si `qui` peut agir sur `cible` (grade strictement supérieur ; le propriétaire peut tout). */
export function peutAgirSur(qui: Grade, cible: Grade): boolean {
	return NIVEAU_GRADE[qui] > NIVEAU_GRADE[cible];
}

/**
 * Comptes propriétaires en plus du créateur du jeu (identifiants Roblox, UserId).
 * Le créateur du jeu est reconnu tout seul (ou le rang 255 du groupe si le jeu appartient à un groupe Roblox).
 * Ajoute ici ton UserId si le jeu est publié par un groupe et que tu n'en es pas le propriétaire.
 */
export const PROPRIETAIRES_EN_PLUS: number[] = [];

/** Raisons proposées (pas de texte libre : rien à filtrer, rien d'insultant). */
export const RAISONS = [
	"Insultes ou propos blessants",
	"Triche ou exploitation d'un bug",
	"Spam",
	"Gêne les autres joueurs",
	"Pseudo ou avatar inapproprié",
	"Autre comportement",
];

/** Durées proposées, en minutes (-1 = définitif). */
export const DUREES_MUET = [5, 15, 60];
export const DUREES_BAN = [60, 24 * 60, 7 * 24 * 60];
export const BAN_DEFINITIF = -1;

export function texteDuree(minutes: number): string {
	if (minutes < 0) return "définitivement";
	if (minutes < 60) return `${minutes} min`;
	if (minutes < 24 * 60) return `${minutes / 60} h`;
	const j = minutes / (24 * 60);
	return `${j} jour${j > 1 ? "s" : ""}`;
}

/** Ce que le serveur envoie à chaque joueur sur la modération. */
export interface EtatModeration {
	grade: Grade;
	/** Rempli seulement pour les modérateurs et au-dessus. */
	joueurs?: { id: number; nom: string; grade: Grade; muet: boolean; fige: boolean }[];
	equipe?: { id: number; nom: string; grade: Grade }[];
	bannis?: { id: number; nom: string; jusqua: number; raison: string }[];
	journal?: EntreeJournalModeration[];
}

export interface EntreeJournalModeration {
	t: number;
	par: string;
	action: string;
	cible?: string;
	detail?: string;
}

export type CommandeModeration =
	| { type: "avertir"; cible: number; raison: number }
	| { type: "muet"; cible: number; minutes: number; raison: number }
	| { type: "rendre_parole"; cible: number }
	| { type: "figer"; cible: number; oui: boolean }
	| { type: "aller_vers"; cible: number }
	| { type: "amener"; cible: number }
	| { type: "renvoyer"; cible: number; raison: number }
	| { type: "bannir"; cible: number; minutes: number; raison: number }
	| { type: "debannir"; cible: number }
	| { type: "nommer"; cible: number; grade: Grade }
	| { type: "annonce"; texte: string }
	| { type: "arreter_serveur" }
	| { type: "cadeau"; cible: number; or?: number; xp?: number }
	| { type: "signaler"; cible: number; raison: number };
