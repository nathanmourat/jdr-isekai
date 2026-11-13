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

/** Contenu du jeu (classes, races, scènes…), tel que décodé depuis contenu.lua. */
export interface Contenu {
	config: {
		personnage: { age_invoque_min: number; age_invoque_max: number; annee_naissance_reincarne: number; [cle: string]: unknown };
		[cle: string]: unknown;
	};
	classes: Record<string, ClasseDef>;
	competences: Record<string, { id: string; nom: string; description: string; cout: number }>;
	races: Record<string, RaceDef>;
	dons: Record<string, DonDef>;
	objets: Record<string, { id: string; nom: string }>;
	rencontres: Record<string, { id: string; nom: string }>;
	scenes: Record<string, { id: string; titre: string; lieu?: string }>;
	quetes: Record<string, { id: string; titre: string; type: string; resume: string; etapes: { id: string; objectif: string }[] }>;
	compagnons: Record<string, { id: string; nom: string }>;
	regions: Record<string, { id: string; nom: string; lieux: { id: string; nom: string; description: string }[] }>;
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
	type: string;
	texte: string;
}

export interface Combattant {
	id: string;
	nom: string;
	camp: "heros" | "ennemis";
	pv: number;
	pvMax: number;
	ko: boolean;
	[cle: string]: unknown;
}

export interface Combat {
	id: string;
	nom: string;
	tour: number;
	combattants: Combattant[];
	evenements: EvenementCombat[];
	resultat?: "victoire" | "defaite" | "fuite";
	enAttente?: string;
	[cle: string]: unknown;
}

export interface EtatPartie {
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
