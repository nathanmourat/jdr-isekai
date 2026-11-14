/**
 * Types du moteur de règles compilé en Luau (moteur.lua, généré depuis src/moteur en TypeScript).
 * Seule la partie utilisée par la version Roblox est décrite ici ; on la complète au fil des étapes.
 * Les noms et formats sont ceux de src/moteur (même moteur que la version web).
 */

export type Carac = "FOR" | "AGI" | "INT" | "VIT" | "ESP" | "CHA";
export type Caracs = Record<Carac, number>;

export interface ClasseDef {
	id: string;
	nom: string;
	role: string;
	description: string;
	passif: { id: string; nom: string; description: string };
	competences: string[];
	branches: { id: string; nom: string; description: string; competences: { niveau: number; competence: string }[] }[];
	ultime: { nom: string; description: string };
	point_fort: string;
	point_faible: string;
}

export interface RaceDef {
	id: string;
	nom: string;
	description: string;
	modificateurs: Partial<Caracs>;
	modificateurs_libres?: { plus: number; moins: number };
	trait: { id: string; nom: string; avantage: string; defaut: string };
}

export interface DonDef {
	id: string;
	nom: string;
	combat: string;
	hors_combat: string;
}

/** Condition du contenu (format libre, interprétée par le moteur). */
export type Condition = Record<string, unknown>;

export interface CompetenceDef {
	id: string;
	nom: string;
	description: string;
	cout: number;
	recharge: number;
	cible: string;
	portee: "melee" | "distance";
}

export interface ObjetDef {
	id: string;
	nom: string;
	description: string;
	type: "consommable" | "cadeau" | "equipement" | "quete" | "materiau";
	prix: number;
	emplacement?: "arme" | "armure" | "accessoire";
	bonus?: { puissance: number; armure: number; caracs: Partial<Caracs> };
	rarete?: "commun" | "peu-commun" | "rare" | "epique" | "legendaire" | "mythique";
	palier?: string;
	niveau?: number;
	categorie?: string;
	classes?: string[];
	effets_equipement?: { effet: string; valeur?: number; puissance?: number; element?: string }[];
	pouvoir_unique?: string;
	unique_par_partie?: boolean;
}

export interface BonusEquipement {
	critique: number;
	precision: number;
	mana: number;
	vigueur: number;
	resistances: Record<string, number>;
	touches: { element: string; puissance: number }[];
	pouvoirs: string[];
}

export interface CompagnonDef {
	id: string;
	nom: string;
	titre: string;
	age: number;
	personnalite: string;
	objectif: string;
	cadeaux: { prefere: string[]; apprecie: string[]; deteste: string[] };
	bonus_paliers: Record<string, { nom: string; description: string }>;
}

export interface LieuDef {
	id: string;
	nom: string;
	description: string;
	decor: string;
	position: { x: number; y: number };
	disponible_si?: Condition;
	pnj: { id: string; si?: Condition }[];
	boutique: string[];
	/** lieu d'étape : visible seulement pendant l'étape de quête ou de contrat qui y mène */
	etape_seulement?: boolean;
	/** on peut y dormir (le lit fait passer les mois) */
	auberge?: boolean;
	/** ville qui contient ce lieu */
	ville?: string;
	gerant?: string;
}

export interface RegionDef {
	id: string;
	nom: string;
	description?: string;
	chapitre?: number;
	disponible_si?: Condition;
	villes?: { id: string; nom: string; position: { x: number; y: number } }[];
	lieux: LieuDef[];
}

export interface EtapeContratDef {
	lieu: string;
	objectif: string;
	texte: string;
	bouton?: string;
	choix: { texte: string; resultat: string }[];
	test?: { carac: Carac; difficulte: number };
	combat?: string;
}

export interface ContratDef {
	id: string;
	titre: string;
	description: string;
	rang_min: string;
	etapes: EtapeContratDef[];
	disponible_si?: Condition;
	recompenses: { or: number; xp: number; points_guilde: number };
}

export interface Replique {
	qui: string;
	expression: string;
	dit: string;
	si?: Condition;
}

export interface Choix {
	texte: string;
	effets: { miser?: number }[];
	si?: Condition;
	test?: { carac: Carac; difficulte: number };
}

export interface Noeud {
	decor?: string;
	/** un personnage interroge un joueur précis : lui seul répond */
	parole_a?: { question: Replique; reponses: { texte: string }[] };
	repliques: Replique[];
	choix: Choix[];
	suite?: string;
	combat?: { rencontre: string };
	donjon?: { id: string };
	fin: boolean;
}

export interface SceneDef {
	id: string;
	titre: string;
	type: "groupe" | "individuel";
	lieu?: string;
	/** PNJ à qui parler pour lancer la scène */
	pnj?: string;
	/** la scène sert à rendre une quête (symbole « ? ») */
	rend_quete?: boolean;
	decor: string;
	quete?: string;
	noeuds: Record<string, Noeud>;
}

/** Contenu du jeu (classes, races, scènes…), tel que décodé depuis contenu.lua. */
export interface Contenu {
	config: {
		personnage: {
			age_invoque_min: number;
			age_invoque_max: number;
			annee_naissance_reincarne: number;
			niveau_branche: number;
			rang_competence_max: number;
			competences_equipees_max: number;
			variantes_max: number;
			fusion_rang_min: number;
			[cle: string]: unknown;
		};
		affinite: { paliers: { id: string; nom: string; seuil: number }[] };
		ellipses: { activites_temps_libre: number; durees_auberge_mois: number[] };
		jours_temps_reel: { minutes_par_jour: number; inactivite_minutes: number };
		calendrier: { jours_par_mois: number };
		[cle: string]: unknown;
	};
	classes: Record<string, ClasseDef>;
	competences: Record<string, CompetenceDef>;
	races: Record<string, RaceDef>;
	dons: Record<string, DonDef>;
	objets: Record<string, ObjetDef>;
	rencontres: Record<string, { id: string; nom: string; fond: string }>;
	ennemis: Record<string, { id: string; nom: string; categorie: string; boss: boolean }>;
	scenes: Record<string, SceneDef>;
	quetes: Record<string, { id: string; titre: string; type: string; resume: string; etapes: { id: string; objectif: string; scene?: string; lieu?: string }[] }>;
	compagnons: Record<string, CompagnonDef>;
	pnj: Record<string, { id: string; nom: string; titre: string; description: string }>;
	regions: Record<string, RegionDef>;
	contrats: Record<string, ContratDef>;
	activites: Record<string, { id: string; nom: string; description: string; disponible_si?: Condition; choix_compagnon?: boolean }>;
	donjons: Record<string, { id: string; nom: string; carte: string[]; legende: Record<string, string>; depart: { x: number; y: number } }>;
	ambiance: Record<string, { id: string; lieu?: string; moment: "jour" | "nuit" | "toujours"; qui: "villageois" | "garde" | "marchand" | "client" | "pretre"; texte: string; si?: Condition }>;
	[cle: string]: unknown;
}

export interface Rng {
	etat: number;
}

export interface Heros {
	id: string;
	joueurId: string;
	nom: string;
	classe: string;
	race: string;
	don: string;
	origine: "invoque" | "reincarne";
	anneeNaissance: number;
	niveau: number;
	xp: number;
	caracsBase: Caracs;
	caracsBonus: Caracs;
	pointsCaracDispo: number;
	pointsCompetenceDispo: number;
	inventaire: Record<string, number>;
	or: number;
	blessure: boolean;
	branche?: string;
	rangsCompetences: Record<string, number>;
	equipement: { arme?: string; armure?: string; accessoire?: string };
	siAbsent: "ia" | "camp";
	variantes: Record<string, string[]>;
	varianteActive: Record<string, string | undefined>;
	/** grimoire personnel (fusions connues de ce héros) */
	grimoire: Record<string, Technique>;
	[cle: string]: unknown;
}

export interface Joueur {
	id: string;
	pseudo: string;
	present: boolean;
	herosId?: string;
}

export interface EvenementCombat {
	tour: number;
	type: "action" | "degats" | "soin" | "rate" | "etat" | "ko" | "invocation" | "fuite" | "bouclier" | "info" | "fin";
	source?: string;
	cible?: string;
	valeur?: number;
	critique?: boolean;
	element?: string;
	competence?: string;
	texte: string;
}

export interface Combattant {
	id: string;
	nom: string;
	type: "heros" | "compagnon" | "ennemi" | "invocation";
	camp: "heros" | "ennemis";
	refId: string;
	joueurId?: string;
	herosId?: string;
	controle: boolean;
	niveau: number;
	pv: number;
	pvMax: number;
	mana: number;
	manaMax: number;
	bouclier: number;
	rang: "avant" | "arriere";
	attaque: { portee: "melee" | "distance" };
	etats: { id: string; duree: number }[];
	ko: boolean;
	parti: boolean;
	categorie: string;
	boss: boolean;
	echelle: number;
	race?: string;
	[cle: string]: unknown;
}

export type ActionCombat = { type: string; acteur: string; [cle: string]: unknown };

export interface Combat {
	id: string;
	nom: string;
	fond: string;
	rencontre: string;
	tour: number;
	ordre: string[];
	index: number;
	combattants: Combattant[];
	evenements: EvenementCombat[];
	resultat?: "victoire" | "defaite" | "fuite";
	enAttente?: string;
	instantane?: unknown;
	[cle: string]: unknown;
}

export interface EtatScene {
	sceneId: string;
	noeud: string;
	heros: string[];
	votes: Record<string, number>;
	dernierTest?: { carac: Carac; jet: number; total: number; difficulte: number; reussi: boolean; heros: string };
	messages: string[];
	/** un personnage interroge ce héros : lui seul répond, parmi ces réponses (index dans parole_a.reponses) */
	parole?: { heros: string; reponses: number[] };
}

export interface ContexteCombat {
	cle: string;
	origine: "scene" | "donjon" | "contrat";
	sceneCle?: string;
	bilan?: string[];
}

export interface EtatDonjon {
	id: string;
	x: number;
	y: number;
	messages: string[];
	vus: string[];
}

export interface TempsLibre {
	titre: string;
	jusqua: number;
	mois: number;
	choix: Record<string, { activite: string; compagnon?: string }[]>;
	resultats?: Record<string, string[]>;
}

export interface Technique extends CompetenceDef {
	parent: string;
	secondaire: string;
	creePar: string;
}

export interface EtatPartie {
	version: number;
	id: string;
	nom: string;
	numeroAction: number;
	jour: number;
	chapitre: number;
	session: number;
	meneur?: string;
	joueurs: Record<string, Joueur>;
	ordreJoueurs: string[];
	heros: Record<string, Heros>;
	quetes: Record<string, { etape: string; terminee: boolean }>;
	pointsGuilde: Record<string, number>;
	scenes: Record<string, EtatScene>;
	combats: Record<string, { combat: Combat; contexte: ContexteCombat }>;
	donjon?: EtatDonjon;
	tempsLibre?: TempsLibre;
	finChapitre?: number;
	compagnonsRencontres: string[];
	equipe: Record<string, string | undefined>;
	repos?: { par: string; mois: number; jusqua: number; accords: string[] };
	mises: Record<string, number>;
	mouvementsOr: { heros: string; montant: number; raison: string }[];
	contrats: Record<string, { id: string; etape: number; notes: string[] }>;
	secondDepart: Record<string, number>;
	flags: Record<string, boolean | undefined>;
	journal: { jour: number; chapitre: number; texte: string }[];
	dernieresNouvelles: string[];
	rng: Rng;
	[cle: string]: unknown;
}

/** Action de jeu (même format que la version web, voir src/moteur/partie.ts). Le serveur remplit `joueur`. */
export type Action = { type: string; joueur: string; [cle: string]: unknown };

export interface OptionsHeros {
	nom: string;
	classe: string;
	race: string;
	don: string;
	origine: "invoque" | "reincarne";
	age?: number;
	libres?: { plus: Partial<Caracs>; moins: Partial<Caracs> };
}

export const VERSION_ETAT: number;
export const FORMAT: string;
export function verifierSauvegarde(brut: unknown): { version: number; depart: EtatPartie; actions: Action[] };
export function nouvellePartie(contenu: Contenu, id: string, nom: string, graine: string): EtatPartie;
export function appliquer(contenu: Contenu, etat: EtatPartie, action: Action): EtatPartie;
export function rejouer(
	contenu: Contenu,
	depart: EtatPartie,
	actions: Action[],
): { etat: EtatPartie; erreurs: { index: number; message: string }[] };
export function listeHeros(etat: EtatPartie): Heros[];
export function formaterDate(contenu: Contenu, jour: number): string;
export function rangGuilde(contenu: Contenu, points: number): string;
export function creerRng(graine: string): Rng;
export function caracsDeDepart(contenu: Contenu, classe: string, race: string, libres?: OptionsHeros["libres"]): Caracs;
export function caracsTotales(contenu: Contenu, h: Heros): Caracs;
export function pvMax(contenu: Contenu, vit: number, niveau: number): number;
export function manaMax(esp: number, niveau: number): number;
export function xpPourNiveau(contenu: Contenu, niveau: number): number;
export function combattantHeros(contenu: Contenu, h: Heros, controle: boolean): Combattant;
export function demarrerCombat(contenu: Contenu, rencontre: string, allies: Combattant[], rng: Rng, id?: string): Combat;
export function avancer(contenu: Contenu, combat: Combat, rng: Rng): void;
export function prochaineEtape(
	contenu: Contenu,
	etat: EtatPartie,
	herosId?: string,
): { objectif: string; lieu?: string; nomLieu?: string; disponible: boolean } | undefined;

// ─── Scènes, lieux, quêtes ───
export function noeudCourant(contenu: Contenu, etat: EtatPartie, cle: string): Noeud | undefined;
export function choixVisibles(contenu: Contenu, etat: EtatPartie, cle: string): { choix: Choix; index: number; possible: boolean }[];
export function remplacerVariables(contenu: Contenu, etat: EtatPartie, texte: string, heros: string[], interroge?: string): string;
export function miseDuChoix(ch: Choix): number;
export function jourPeutPasser(contenu: Contenu, etat: EtatPartie): boolean;
export function prochaineDateHistoire(contenu: Contenu, etat: EtatPartie): { jour: number; raison: string } | undefined;
export function attenteRepos(etat: EtatPartie): string[];
export function etapeContrat(
	contenu: Contenu,
	etat: EtatPartie,
	herosId: string,
): { contrat: ContratDef; etape: EtapeContratDef; numero: number; total: number; notes: string[]; derniere: boolean } | undefined;
export function lieuxDesEtapes(contenu: Contenu, etat: EtatPartie, herosId: string | undefined): string[];
export function fusionsPossibles(contenu: Contenu, h: Heros): { technique: Technique; probleme?: string }[];
export function absentsDuGroupe(etat: EtatPartie): string[];
export function conditionScene(contenu: Contenu, etat: EtatPartie, c: Condition | undefined, heros: string[]): boolean;
export function conditionHeros(contenu: Contenu, etat: EtatPartie, c: Condition | undefined, h: Heros | undefined): boolean;
export function scenesDisponibles(contenu: Contenu, etat: EtatPartie, lieu: string | undefined, herosId: string | undefined): SceneDef[];
export function lieuAvecCombat(contenu: Contenu, etat: EtatPartie, lieu: string, herosId: string | undefined): boolean;
export function palierCompagnon(contenu: Contenu, etat: EtatPartie, herosId: string, compagnon: string): { id: string; nom: string; index: number };
export function prixAchat(contenu: Contenu, h: Heros, objet: string): number;
export function prixVente(contenu: Contenu, h: Heros, objet: string): number;
export function estGuilde(lieu: string): boolean;
export const COULEURS_RARETE: Record<string, string>;
export const NOMS_RARETE: Record<string, string>;
export const POUVOIRS: Record<string, string>;
export function bonusEquipement(contenu: Contenu, h: Heros): BonusEquipement;
export function problemeEquipement(contenu: Contenu, h: Heros, o: ObjetDef): string | undefined;
export function exemplaires(heros: Heros[], objet: string): number;
export function texteEffets(o: ObjetDef): string[];
export function caseDonjon(contenu: Contenu, id: string, x: number, y: number): string;
export function versDate(contenu: Contenu, jour: number): { annee: number; mois: number; jour: number };
export function age(h: Heros, annee: number): number;

// ─── Personnage ───
export function competencesConnues(contenu: Contenu, h: Heros): string[];
export function competencesEquipees(contenu: Contenu, h: Heros): string[];
export function peutApprendre(contenu: Contenu, h: Heros, t: Technique): string | undefined;

// ─── Combat ───
export const NOMS_ETATS: Record<string, string>;
export function actionsDisponibles(
	contenu: Contenu,
	combat: Combat,
	acteur: string,
): {
	competences: { comp: CompetenceDef; rang: number; utilisable: boolean; raison: string }[];
	potions: number;
	bombes: number;
	pacifier: string[];
	fuite: boolean;
	ciblesMelee: string[];
	ciblesDistance: string[];
	allies: string[];
	alliesKo: string[];
};

// ─── IA maison ───
export interface ContexteIA {
	contenu: Contenu;
	combat: Combat;
	acteur: string;
	heros: Heros | undefined;
	grimoire: Record<string, Technique>;
}
export type ActionProposee =
	| { kind: "combat"; action: ActionCombat }
	| { kind: "fusion"; parent: string; secondaire: string; cible?: string };
export interface Proposition {
	libelle: string;
	details: string;
	action: ActionProposee;
	estimation: { possible: boolean; effets: string[] };
	conseil?: string;
}
export interface Interpretation {
	proposition?: Proposition;
	possible: boolean;
	message: string;
	alternatives: Proposition[];
	compteCommeEssai: boolean;
	informations: string[];
}
export function interpreter(ctx: ContexteIA, texte: string): Interpretation;
export function propositionsScript(ctx: ContexteIA): Proposition[];
export function affinite(etat: EtatPartie, herosId: string, compagnon: string): { points: number; blocage?: "temporaire" | "definitive"; lignesFranchies: string[] };
