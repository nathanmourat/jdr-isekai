/**
 * Types du moteur de règles compilé en Luau (moteur.lua, généré depuis src/moteur en TypeScript).
 * Seule la partie utilisée par la version Roblox est décrite ici ; on la complète au fil des étapes.
 */

/** Contenu du jeu (classes, races, scènes…), tel que décodé depuis contenu.lua. */
export interface Contenu {
  classes: Record<string, { id: string; nom: string; description: string }>;
  races: Record<string, { id: string; nom: string; description: string }>;
  dons: Record<string, { id: string; nom: string; description: string }>;
  rencontres: Record<string, { id: string; nom: string }>;
  scenes: Record<string, { id: string; titre: string; lieu?: string }>;
  quetes: Record<string, { id: string; titre: string }>;
  [cle: string]: unknown;
}

export interface Rng { etat: number }

export interface Heros {
  id: string;
  joueurId: string;
  nom: string;
  classe: string;
  race: string;
  don: string;
  niveau: number;
  or: number;
  [cle: string]: unknown;
}

export interface Joueur { id: string; pseudo: string; present: boolean; herosId?: string }

export interface EvenementCombat { tour: number; type: string; texte: string }

export interface Combattant { id: string; nom: string; camp: "heros" | "ennemis"; pv: number; pvMax: number; ko: boolean; [cle: string]: unknown }

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
  jour: number;
  chapitre: number;
  joueurs: Record<string, Joueur>;
  ordreJoueurs: string[];
  heros: Record<string, Heros>;
  journal: { jour: number; chapitre: number; texte: string }[];
  rng: Rng;
  [cle: string]: unknown;
}

/** Action de jeu (même format que la version web, voir src/moteur/partie.ts). */
export type Action = { type: string; joueur: string; [cle: string]: unknown };

export function nouvellePartie(contenu: Contenu, id: string, nom: string, graine: string): EtatPartie;
export function appliquer(contenu: Contenu, etat: EtatPartie, action: Action): EtatPartie;
export function rejouer(contenu: Contenu, depart: EtatPartie, actions: Action[]): { etat: EtatPartie; erreurs: { index: number; message: string }[] };
export function listeHeros(etat: EtatPartie): Heros[];
export function formaterDate(contenu: Contenu, jour: number): string;
export function creerRng(graine: string): Rng;
export function combattantHeros(contenu: Contenu, h: Heros, controle: boolean): Combattant;
export function demarrerCombat(contenu: Contenu, rencontre: string, allies: Combattant[], rng: Rng, id?: string): Combat;
export function avancer(contenu: Contenu, combat: Combat, rng: Rng): void;
export function prochaineEtape(contenu: Contenu, etat: EtatPartie, herosId?: string): { objectif: string; lieu?: string; nomLieu?: string; disponible: boolean } | undefined;
