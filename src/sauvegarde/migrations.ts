/**
 * Sauvegarde versionnée.
 *
 * Une sauvegarde contient l'état de départ de la partie et la liste des actions jouées.
 * Quand le format de l'état change (nouvelle saison, nouveau champ…), on augmente VERSION_ETAT
 * dans src/moteur/partie.ts et on ajoute ici une migration « version n → n+1 ».
 * Les anciennes parties restent ainsi jouables après une mise à jour.
 */
import { VERSION_ETAT, type Action, type EtatPartie } from '../moteur/partie';
import { cles, copieProfonde } from '../moteur/outils';

export const FORMAT = 'velmaris-sauvegarde';

export interface Sauvegarde {
  format: typeof FORMAT;
  version: number;
  exporteeLe: string;
  depart: EtatPartie;
  actions: Action[];
  /** Instantané facultatif (accélère le chargement des longues parties). */
  instantane?: { index: number; etat: EtatPartie };
}

type Migration = (s: Sauvegarde) => Sauvegarde;

/** migrations[n] transforme une sauvegarde de version n en version n+1. */
export const migrations: Record<number, Migration> = {
  // v1 → v2 (combat libre) : grimoire des fusions dans la partie. Les héros sont recréés en rejouant les actions,
  // ils reçoivent donc automatiquement leurs nouveaux champs (variantes, compétences équipées).
  1: (s) => {
    (s.depart as { grimoire?: unknown }).grimoire ??= {};
    s.version = 2;
    return s;
  },
  // v2 → v3 (test 1, lot C) : les mois passent à l'auberge. On ajoute la proposition de repos (vide).
  // Les anciennes actions sont rejouées telles quelles ; le moteur accepte toujours les anciennes ellipses.
  2: (s) => {
    (s.depart as { repos?: unknown }).repos ??= null;
    s.version = 3;
    return s;
  },
  // v3 → v4 (test 1, lot D) : grimoire personnel, paris. Les héros sont recréés en rejouant les actions :
  // chaque fusion retombe donc dans le grimoire du héros qui l'a inventée ou apprise.
  // Si l'état de départ contient encore un grimoire partagé, le moteur le répartit à la première action
  // (au héros qui a appris chaque fusion, sinon à tous ceux qui peuvent l'utiliser).
  3: (s) => {
    const d = s.depart as { grimoire?: Record<string, unknown>; mises?: unknown; mouvementsOr?: unknown };
    if (d.grimoire && cles(d.grimoire).length === 0) delete d.grimoire;
    d.mises ??= {};
    d.mouvementsOr ??= [];
    s.version = 4;
    return s;
  },
  // v4 → v5 (test 1, lot E) : contrats à étapes (un contrat en cours par héros).
  4: (s) => {
    (s.depart as { contrats?: unknown }).contrats ??= {};
    s.version = 5;
    return s;
  },
  // v5 → v6 (test 2, lot H) : objets mystérieux identifiés, goûts découverts des compagnons, rangs de Guilde
  // obtenus par examen. Les actions sont rejouées : un ancien rang « automatique » est recalculé par le moteur.
  5: (s) => {
    const d = s.depart as { objetsConnus?: unknown; goutsConnus?: unknown };
    d.objetsConnus ??= [];
    d.goutsConnus ??= {};
    s.version = 6;
    return s;
  },
};

export class ErreurSauvegarde extends Error {
  constructor(message: string) { super(message); this.name = 'ErreurSauvegarde'; }
}

export function creerSauvegarde(depart: EtatPartie, actions: Action[], date: string, instantane?: Sauvegarde['instantane']): Sauvegarde {
  return { format: FORMAT, version: VERSION_ETAT, exporteeLe: date, depart, actions, instantane };
}

/** Vérifie une sauvegarde déjà décodée (objet), puis la met au format courant. */
export function verifierSauvegarde(brut: unknown): Sauvegarde {
  const s = brut as Partial<Sauvegarde> | null;
  if (s === null || typeof s !== 'object' || s.format !== FORMAT) throw new ErreurSauvegarde('Ce fichier n\'est pas une sauvegarde des Appelés de Velmaris.');
  if (typeof s.version !== 'number' || s.depart === undefined || !Array.isArray(s.actions)) throw new ErreurSauvegarde('Sauvegarde incomplète ou abîmée.');
  if (s.version > VERSION_ETAT) throw new ErreurSauvegarde(`Cette sauvegarde vient d'une version plus récente du jeu (format ${s.version}). Mettez le jeu à jour.`);
  return migrer(s as Sauvegarde);
}

export function migrer(s: Sauvegarde): Sauvegarde {
  let res = s;
  while (res.version < VERSION_ETAT) {
    const m = migrations[res.version];
    if (!m) throw new ErreurSauvegarde(`Aucune migration pour passer du format ${res.version} au format ${res.version + 1}.`);
    res = m(copieProfonde(res));
  }
  // l'instantané n'est valable que pour la version courante
  if (res !== s) delete res.instantane;
  return res;
}
