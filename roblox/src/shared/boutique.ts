/**
 * Boutique en Robux (version Roblox seulement) : UNIQUEMENT des cosmétiques. Aucun objet, or, XP ou
 * niveau ne se vend : le moteur de règles et l'équilibrage ne voient jamais la boutique.
 *
 * Pour mettre un article en vente :
 *  1. Creator Dashboard → ton expérience → Monetization → Passes (achat unique, visible sur la page du jeu)
 *     ou Developer Products (achat qu'on peut refaire, ou nombreux articles) ;
 *  2. tu fixes le prix là-bas (le jeu lit le vrai prix, rien n'est écrit ici) ;
 *  3. tu colles son numéro (Pass ID ou Product ID) dans `numero` ci-dessous.
 * Un numéro à 0 = pas encore en vente : l'article s'affiche « Bientôt ». Le propriétaire du jeu a tout gratuitement
 * (pour tester), et dans Studio un bouton « Essai Studio » débloque un article jusqu'à la fin du test.
 */

export type Emplacement = "aura" | "cape" | "titre" | "trace" | "sorts";
export type Categorie = Emplacement | "fete" | "pack";
export type Rarete = "commune" | "rare" | "epique" | "legendaire";

export interface ArticleBoutique {
	id: string;
	nom: string;
	description: string;
	categorie: Categorie;
	rarete: Rarete;
	/** Pictogramme de la carte. */
	icone: string;
	/** Couleurs de l'effet (et du dégradé de la carte). */
	couleurs: Color3[];
	/** "pass" : Game Pass (achat unique) ; "produit" : Developer Product (unique, ou répétable pour une fête). */
	achat: { type: "pass" | "produit"; numero: number };
	/** Fête (consommable) : nombre d'utilisations données par achat. */
	charges?: number;
	/** Pack : articles débloqués avec lui. */
	contenu?: string[];
}

export const EMPLACEMENTS: Emplacement[] = ["aura", "cape", "titre", "trace", "sorts"];

export const CATEGORIES: { id: Categorie; nom: string; icone: string }[] = [
	{ id: "pack", nom: "Packs", icone: "🎁" },
	{ id: "aura", nom: "Auras", icone: "✨" },
	{ id: "cape", nom: "Capes", icone: "🧣" },
	{ id: "titre", nom: "Titres", icone: "🏷" },
	{ id: "trace", nom: "Traces de pas", icone: "👣" },
	{ id: "sorts", nom: "Effets de sorts", icone: "🔮" },
	{ id: "fete", nom: "Fêtes", icone: "🎆" },
];

export const RARETES: Record<Rarete, { nom: string; couleur: Color3 }> = {
	commune: { nom: "Commune", couleur: Color3.fromRGB(170, 160, 140) },
	rare: { nom: "Rare", couleur: Color3.fromRGB(90, 160, 235) },
	epique: { nom: "Épique", couleur: Color3.fromRGB(175, 110, 230) },
	legendaire: { nom: "Légendaire", couleur: Color3.fromRGB(255, 190, 70) },
};

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

export const ARTICLES: ArticleBoutique[] = [
	// ── Packs ──
	{
		id: "pack-fondateur",
		nom: "Pack du Fondateur",
		description: "Pour celles et ceux qui soutiennent Velmaris dès le début : Cape royale de Lysmont, Halo de l'Aube et titre « Fondateur ».",
		categorie: "pack",
		rarete: "legendaire",
		icone: "👑",
		couleurs: [rgb(255, 200, 90), rgb(120, 40, 120)],
		achat: { type: "pass", numero: 0 },
		contenu: ["cape-lysmont", "aura-aube", "titre-fondateur"],
	},
	// ── Auras ──
	{
		id: "aura-lucioles",
		nom: "Lucioles de Sylvenoire",
		description: "Des lucioles dorées tournent autour de toi, comme dans la forêt qui se souvient.",
		categorie: "aura",
		rarete: "rare",
		icone: "🌿",
		couleurs: [rgb(200, 255, 120), rgb(255, 220, 110)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "aura-braises",
		nom: "Braises d'Ardenclume",
		description: "Des braises montent de tes épaules, chaudes comme les forges du Haut-Forgeron.",
		categorie: "aura",
		rarete: "rare",
		icone: "🔥",
		couleurs: [rgb(255, 140, 40), rgb(255, 70, 30)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "aura-givre",
		nom: "Givre des Monts Grisfer",
		description: "Une neige fine tombe autour de toi, même en plein été.",
		categorie: "aura",
		rarete: "rare",
		icone: "❄",
		couleurs: [rgb(220, 240, 255), rgb(150, 200, 255)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "aura-voile",
		nom: "Murmures du Voile",
		description: "Des volutes violettes s'échappent de toi : le Voile n'est jamais loin.",
		categorie: "aura",
		rarete: "epique",
		icone: "🌀",
		couleurs: [rgb(170, 90, 255), rgb(60, 20, 90)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "aura-aube",
		nom: "Halo de l'Aube",
		description: "Un anneau de lumière dorée flotte au-dessus de ta tête et des étincelles t'entourent.",
		categorie: "aura",
		rarete: "legendaire",
		icone: "☀",
		couleurs: [rgb(255, 215, 110), rgb(255, 250, 220)],
		achat: { type: "produit", numero: 0 },
	},
	// ── Capes ──
	{
		id: "cape-guilde",
		nom: "Cape de la Guilde",
		description: "Bleu nuit à liseré doré, la cape des aventuriers de Lysmont.",
		categorie: "cape",
		rarete: "commune",
		icone: "🛡",
		couleurs: [rgb(30, 45, 90), rgb(217, 164, 65)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "cape-sables",
		nom: "Cape des Sables",
		description: "Une étoffe légère couleur dune, brodée de rouge, venue de la Marche des Sables.",
		categorie: "cape",
		rarete: "rare",
		icone: "🏜",
		couleurs: [rgb(220, 185, 125), rgb(170, 50, 40)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "cape-brumes",
		nom: "Cape des Brumes",
		description: "Gris-bleu, presque transparente : elle semble faite de la brume de l'Archipel.",
		categorie: "cape",
		rarete: "rare",
		icone: "🌫",
		couleurs: [rgb(150, 170, 195), rgb(220, 230, 240)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "cape-lysmont",
		nom: "Cape royale de Lysmont",
		description: "Pourpre et or, avec le soleil levant d'Aubeclaire brodé dans le dos.",
		categorie: "cape",
		rarete: "epique",
		icone: "🏰",
		couleurs: [rgb(110, 25, 70), rgb(255, 200, 90)],
		achat: { type: "produit", numero: 0 },
	},
	// ── Titres ──
	{
		id: "titre-lanterne",
		nom: "Lanterne d'Aubeclaire",
		description: "Un titre doré au-dessus de ta tête : « Lanterne d'Aubeclaire ».",
		categorie: "titre",
		rarete: "commune",
		icone: "🏮",
		couleurs: [rgb(255, 200, 110)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "titre-brumes",
		nom: "Chasseur de Brumes",
		description: "Le titre de celles et ceux qui ont navigué dans l'Archipel.",
		categorie: "titre",
		rarete: "rare",
		icone: "⚓",
		couleurs: [rgb(140, 200, 230)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "titre-voile",
		nom: "Gardien du Voile",
		description: "Un titre violet qui scintille doucement.",
		categorie: "titre",
		rarete: "epique",
		icone: "🔮",
		couleurs: [rgb(190, 130, 255)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "titre-fondateur",
		nom: "Fondateur",
		description: "Réservé au Pack du Fondateur : merci d'avoir cru en Velmaris !",
		categorie: "titre",
		rarete: "legendaire",
		icone: "👑",
		couleurs: [rgb(255, 210, 90)],
		achat: { type: "pass", numero: 0 },
	},
	// ── Traces de pas ──
	{
		id: "trace-petales",
		nom: "Pétales de saule",
		description: "Des pétales roses volent derrière toi quand tu marches.",
		categorie: "trace",
		rarete: "rare",
		icone: "🌸",
		couleurs: [rgb(255, 170, 200), rgb(255, 230, 240)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "trace-cendres",
		nom: "Pas de cendre",
		description: "Chaque pas laisse une traînée de cendres rougeoyantes.",
		categorie: "trace",
		rarete: "rare",
		icone: "🌋",
		couleurs: [rgb(90, 80, 75), rgb(255, 100, 40)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "trace-etoiles",
		nom: "Poussière d'étoiles",
		description: "Une traînée lumineuse d'or et d'argent suit chacun de tes pas.",
		categorie: "trace",
		rarete: "epique",
		icone: "⭐",
		couleurs: [rgb(255, 230, 140), rgb(200, 220, 255)],
		achat: { type: "produit", numero: 0 },
	},
	// ── Effets de sorts (seulement l'apparence : les dégâts ne changent pas) ──
	{
		id: "sorts-etoiles",
		nom: "Sorts étoilés",
		description: "Tes sorts et tes flèches laissent une pluie d'étoiles dorées. La couleur de l'élément reste visible.",
		categorie: "sorts",
		rarete: "epique",
		icone: "💫",
		couleurs: [rgb(255, 225, 120), rgb(255, 255, 255)],
		achat: { type: "produit", numero: 0 },
	},
	{
		id: "sorts-prisme",
		nom: "Prisme",
		description: "Une traînée aux couleurs de l'arc-en-ciel suit chacun de tes sorts.",
		categorie: "sorts",
		rarete: "legendaire",
		icone: "🌈",
		couleurs: [rgb(255, 80, 80), rgb(255, 220, 80), rgb(80, 220, 120), rgb(80, 160, 255), rgb(190, 100, 255)],
		achat: { type: "produit", numero: 0 },
	},
	// ── Fêtes (à utiliser, vues par tous les joueurs proches) ──
	{
		id: "fete-artifice",
		nom: "Feu d'artifice",
		description: "Trois fusées qui éclatent en gerbes de couleurs au-dessus de toi. 3 utilisations par achat.",
		categorie: "fete",
		rarete: "rare",
		icone: "🎆",
		couleurs: [rgb(255, 90, 90), rgb(90, 200, 255), rgb(255, 220, 90)],
		achat: { type: "produit", numero: 0 },
		charges: 3,
	},
	{
		id: "fete-lanternes",
		nom: "Lâcher de lanternes",
		description: "Une dizaine de lanternes célestes montent lentement dans le ciel, comme à la fête d'Aubeclaire. 3 utilisations par achat.",
		categorie: "fete",
		rarete: "rare",
		icone: "🏮",
		couleurs: [rgb(255, 170, 70), rgb(255, 220, 140)],
		achat: { type: "produit", numero: 0 },
		charges: 3,
	},
];

export function article(id: string): ArticleBoutique | undefined {
	return ARTICLES.find((a) => a.id === id);
}

/** Ce que le serveur sait des achats d'un joueur (envoyé à ce joueur seulement). */
export interface EtatBoutique {
	/** Articles débloqués (achetés, venus d'un pack, ou tout pour le propriétaire). */
	possedes: string[];
	/** Article porté dans chaque emplacement. */
	equipes: Partial<Record<Emplacement, string>>;
	/** Fêtes : utilisations restantes. */
	charges: Record<string, number>;
	/** Vrai pour le propriétaire du jeu (tout est gratuit). */
	proprietaire: boolean;
	/** Vrai dans Studio : bouton « Essai Studio ». */
	studio: boolean;
}

export type CommandeBoutique =
	| { type: "etat" }
	| { type: "equiper"; id: string }
	| { type: "retirer"; emplacement: Emplacement }
	| { type: "utiliser"; id: string }
	| { type: "essai_studio"; id: string };

/** Attribut posé sur le joueur (vu par tous) : ses cosmétiques portés, « aura=…;cape=…;… ». */
export const ATTRIBUT_COSMETIQUES = "Cosmetiques";

export function lireCosmetiques(texte: unknown): Partial<Record<Emplacement, string>> {
	const r: Partial<Record<Emplacement, string>> = {};
	if (!typeIs(texte, "string")) return r;
	for (const morceau of texte.split(";")) {
		const [k, v] = morceau.split("=") as unknown as [string, string | undefined];
		if (v !== undefined && v !== "" && EMPLACEMENTS.includes(k as Emplacement)) r[k as Emplacement] = v;
	}
	return r;
}

export function ecrireCosmetiques(e: Partial<Record<Emplacement, string>>): string {
	const morceaux: string[] = [];
	for (const k of EMPLACEMENTS) {
		const v = e[k];
		if (v !== undefined) morceaux.push(`${k}=${v}`);
	}
	return morceaux.join(";");
}
