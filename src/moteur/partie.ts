/**
 * État d'une partie et application des actions des joueurs.
 *
 * Principe : l'état de la partie = la suite de toutes les actions, rejouées dans l'ordre.
 * `appliquer` ne fait jamais appel à l'heure ni au hasard du navigateur : tout passe par le Rng de la partie.
 * Ainsi, chaque joueur obtient exactement le même état en rejouant la même liste d'actions.
 */
import type { Contenu } from '../contenu/types';
import type { Choix, Condition, Consequence, Noeud, Scene } from '../contenu/schemas';
import { affiniteVide, modifierAffinite, palier, paliersAtteints, pardonner, peutOffrir, reactionCadeau, verifierLignesRouges, type Affinite } from './affinite';
import {
  annulerTour, avancer, combattantCompagnon, combattantHeros, demarrerCombat, jouerAction, recompensesCombat,
  type ActionCombat, type Combat, type Combattant,
} from './combat';
import {
  age, ameliorerCompetence, caracsTotales, choisirBranche, competencesConnues, competencesEquipees, creerHeros, gagnerMaitrise, gagnerXp, niveauMoyen, rangMaitrise, repartirPoint,
  xpPourNiveau, type Carac, type Heros, type OptionsCreation,
} from './personnage';
import { choisir as choisirAuHasard, creerRng, de, type Rng } from './rng';
import { cles, copieProfonde, entrees, valeurs, vrai } from './outils';
import { apprendre, creerTechnique, idFusion, peutApprendre, type Technique } from './fusions';
import { competencesConnues as connuesDe } from './personnage';
import { exemplaires, problemeEquipement } from './equipement';
import { anneeDepart, chapitreDe, fetesEntre, formaterDate, joursParMois, versDate, versJour } from './temps';

export const VERSION_ETAT = 7;
export const MAX_JOUEURS = 6;

export interface Joueur { id: string; pseudo: string; herosId: string | null; present: boolean }

export interface EtatScene {
  sceneId: string;
  noeud: string;
  /** Héros qui participent (scène de groupe : tous les héros ; individuelle : un seul). */
  heros: string[];
  votes: Record<string, number>;
  /** Dernier résultat de test, affiché au joueur. */
  dernierTest: { carac: Carac; jet: number; total: number; difficulte: number; reussi: boolean; heros: string } | null;
  /** Ce qui s'est passé à l'entrée du nœud (gains, pertes), affiché au joueur. */
  messages: string[];
  /** Un personnage interroge ce héros : lui seul répond, parmi ces réponses (index dans `parole_a.reponses`). */
  parole?: { heros: string; reponses: number[] } | null;
  /** Dernier nœud joué quand la scène est terminée : ses répliques restent à lire avant de quitter. */
  noeudFin?: string;
  /** Pari partagé en cours : réponse de chaque joueur (true = « Je mise »). Résolu quand tous ont répondu. */
  pari?: Record<string, boolean> | null;
}

/** Contrat en cours d'un héros : numéro de l'étape à jouer, et ce qui vient de se passer. */
export interface ContratEnCours { id: string; etape: number; notes: string[] }

/** Pièces qui sortent du porte-monnaie d'un héros ou y rentrent pendant la dernière action (pour l'animation). */
export interface MouvementOr { heros: string; montant: number; raison: string }

export interface ContexteCombat {
  cle: string;               // 'groupe' ou id du héros (combat individuel)
  origine: 'scene' | 'donjon' | 'contrat' | 'examen';
  /** Combat d'examen de rang : rang visé et héros qui le passent ensemble. */
  examen?: { rang: string; heros: string[] } | null;
  sceneCle: string | null;   // scène à reprendre
  victoire: string | null;
  defaite: string | null;
  evenementDonjon: string | null;
  contrat: string | null;
  bilan: string[] | null;
}

export interface EtatDonjon {
  id: string;
  x: number;
  y: number;
  faits: string[];
  sceneCle: string;
  sortie: string;
  messages: string[];
  vus: string[];
  /** Défaites dans ce donjon (après 3, on peut ressortir par la porte de secours : nœud `abandon` de la scène). */
  defaites?: number;
  abandon?: string;
}

export interface TempsLibre {
  titre: string;
  jusqua: number;
  mois: number;
  choix: Record<string, { activite: string; compagnon?: string }[]>;
  resultats: Record<string, string[]> | null;
}

/** Proposition de repos à l'auberge : le temps ne passe que si tous les joueurs présents sont d'accord. */
export interface Repos {
  /** Joueur qui a cliqué sur le lit en premier. */
  par: string;
  mois: number;
  jusqua: number;
  accords: string[];
}

export interface EntreeJournal { jour: number; texte: string; chapitre: number }

export interface EtatPartie {
  version: number;
  id: string;
  nom: string;
  graine: string;
  rng: Rng;
  numeroAction: number;
  joueurs: Record<string, Joueur>;
  ordreJoueurs: string[];
  heros: Record<string, Heros>;
  jour: number;
  chapitre: number;
  session: number;
  meneur: string | null;
  flags: Record<string, boolean>;
  reputation: Record<string, number>;
  affinites: Record<string, Record<string, Affinite>>;
  compagnonsRencontres: string[];
  equipe: Record<string, string | null>;
  pnjMorts: string[];
  quetes: Record<string, { etape: string; terminee: boolean }>;
  pointsGuilde: Record<string, number>;
  scenes: Record<string, EtatScene>;
  scenesVues: string[];
  combats: Record<string, { combat: Combat; contexte: ContexteCombat }>;
  donjon: EtatDonjon | null;
  tempsLibre: TempsLibre | null;
  repos: Repos | null;
  journal: EntreeJournal[];
  secondDepart: Record<string, number>;
  dernieresNouvelles: string[];
  finChapitre: number | null;
  /** Ancien grimoire partagé (avant le format 4). Le moteur le répartit entre les héros puis le supprime. */
  grimoire?: Record<string, Technique>;
  /** Paris en cours : somme mise de côté par héros. */
  mises: Record<string, number>;
  mouvementsOr: MouvementOr[];
  /** Contrats à étapes en cours, par héros (un seul à la fois). */
  contrats: Record<string, ContratEnCours>;
  /** Objets mystérieux dont l'effet a été découvert (achat ou identification) : connus de toute la partie. */
  objetsConnus: string[];
  /** Goûts découverts des compagnons : pour chacun, les cadeaux dont on connaît la réaction. */
  goutsConnus: Record<string, string[]>;
  /** Rang de Guilde obtenu par examen, par héros (absent = F). Les points ne font que débloquer l'examen. */
  rangs: Record<string, string>;
  /** Jour du dernier examen raté, par héros : on peut retenter le lendemain. */
  examensRates: Record<string, number>;
}

export type Action =
  | { type: 'rejoindre'; joueur: string; pseudo: string }
  | { type: 'presence'; joueur: string; present: boolean }
  | { type: 'creer_heros'; joueur: string; heros: Omit<OptionsCreation, 'id' | 'joueurId' | 'anneeCampagne' | 'niveau'> }
  | { type: 'portrait'; joueur: string; image: string | null }
  | { type: 'si_absent'; joueur: string; mode: 'ia' | 'camp' }
  | { type: 'lancer_scene'; joueur: string; scene: string }
  | { type: 'choisir'; joueur: string; cle: string; index: number }
  /** Réponse du joueur à qui un personnage s'adresse (index dans la liste des réponses proposées). */
  | { type: 'repondre'; joueur: string; cle: string; index: number }
  /** Pari partagé : chaque joueur dit s'il mise (la mise totale est répartie entre ceux qui misent). */
  | { type: 'parier'; joueur: string; cle: string; mise: boolean }
  | { type: 'trancher'; joueur: string; cle: string }
  | { type: 'continuer'; joueur: string; cle: string }
  | { type: 'quitter_scene'; joueur: string; cle: string }
  | { type: 'combat'; joueur: string; cle: string; action: ActionCombat }
  | { type: 'second_depart'; joueur: string; cle: string }
  | { type: 'fin_combat'; joueur: string; cle: string }
  | { type: 'donjon_deplacer'; joueur: string; dx: number; dy: number }
  | { type: 'temps_libre'; joueur: string; activites: { activite: string; compagnon?: string }[] }
  | { type: 'valider_temps_libre'; joueur: string }
  /** Un jour du monde passe (minuteur de jeu actif). `jour` = jour courant vu par l'expéditeur : évite les doublons. */
  | { type: 'jour_passe'; joueur: string; jour: number }
  /** Dormir à l'auberge : `mois` choisi, ou `histoire: true` pour aller jusqu'au prochain événement de l'histoire. */
  | { type: 'proposer_repos'; joueur: string; mois?: number; histoire?: boolean }
  | { type: 'repondre_repos'; joueur: string; accepte: boolean }
  | { type: 'cadeau'; joueur: string; compagnon: string; objet: string }
  | { type: 'equipe'; joueur: string; compagnon: string | null }
  | { type: 'equiper'; joueur: string; objet: string }
  | { type: 'desequiper'; joueur: string; emplacement: 'arme' | 'armure' | 'accessoire' }
  | { type: 'acheter'; joueur: string; objet: string; lieu: string; quantite?: number }
  | { type: 'vendre'; joueur: string; objet: string; quantite?: number }
  | { type: 'utiliser'; joueur: string; objet: string }
  /** Payer un PNJ (Ferrand) pour connaître l'effet d'un objet mystérieux avant de l'acheter. */
  | { type: 'identifier'; joueur: string; objet: string; pnj: string }
  | { type: 'repartir'; joueur: string; carac: Carac }
  | { type: 'ameliorer'; joueur: string; competence: string }
  | { type: 'branche'; joueur: string; branche: string }
  | { type: 'contrat'; joueur: string; contrat: string }
  /** Joue l'étape en cours de son contrat (choix : index de la réponse quand l'étape en propose). */
  | { type: 'etape_contrat'; joueur: string; choix?: number }
  | { type: 'abandonner_contrat'; joueur: string }
  /** Passer l'examen du rang suivant à la Guilde (combat d'examen, ou début de l'épreuve en plusieurs étapes). */
  | { type: 'examen_rang'; joueur: string }
  | { type: 'meneur'; joueur: string; nouveau: string }
  | { type: 'nouvelle_session'; joueur: string }
  | { type: 'chapitre_suivant'; joueur: string }
  /** Combine deux compétences : crée la technique si besoin, l'apprend, et (en combat) l'utilise tout de suite. */
  | { type: 'fusionner'; joueur: string; parent: string; secondaire: string; cle?: string; cible?: string }
  | { type: 'apprendre_technique'; joueur: string; technique: string }
  | { type: 'oublier_variante'; joueur: string; technique: string }
  | { type: 'variante_active'; joueur: string; competence: string; technique: string | null }
  | { type: 'equiper_competences'; joueur: string; competences: string[] };

export class ErreurAction extends Error {
  constructor(message: string) { super(message); this.name = 'ErreurAction'; }
}
const refuser = (m: string): never => { throw new ErreurAction(m); };

// ───────────────────────────── Création ─────────────────────────────

export function nouvellePartie(contenu: Contenu, id: string, nom: string, graine: string): EtatPartie {
  return {
    version: VERSION_ETAT,
    id,
    nom,
    graine,
    rng: creerRng(graine),
    numeroAction: 0,
    joueurs: {},
    ordreJoueurs: [],
    heros: {},
    jour: 0,
    chapitre: 1,
    session: 1,
    meneur: null,
    flags: {},
    reputation: { couronne: 0, guilde: 0, concorde: 0, ordre: 0 },
    affinites: {},
    compagnonsRencontres: [],
    equipe: {},
    pnjMorts: [],
    quetes: {},
    pointsGuilde: {},
    scenes: {},
    scenesVues: [],
    combats: {},
    donjon: null,
    tempsLibre: null,
    repos: null,
    journal: [{ jour: 0, chapitre: 1, texte: `Printemps ${anneeDepart(contenu)} AV : la partie « ${nom} » commence.` }],
    secondDepart: {},
    dernieresNouvelles: [],
    finChapitre: null,
    mises: {},
    mouvementsOr: [],
    contrats: {},
    objetsConnus: [],
    goutsConnus: {},
    rangs: {},
    examensRates: {},
  };
}

// ───────────────────────────── Outils ─────────────────────────────

export function herosDuJoueur(etat: EtatPartie, joueur: string): Heros {
  const j = etat.joueurs[joueur] ?? refuser('Joueur inconnu');
  return etat.heros[j.herosId ?? ''] ?? refuser("Ce joueur n'a pas encore de héros");
}

export function listeHeros(etat: EtatPartie): Heros[] {
  const res: Heros[] = [];
  for (const j of etat.ordreJoueurs) {
    const id = etat.joueurs[j].herosId;
    if (vrai(id)) res.push(etat.heros[id]);
  }
  return res;
}

function journal(contenu: Contenu, etat: EtatPartie, texte: string) {
  etat.journal.push({ jour: etat.jour, chapitre: etat.chapitre, texte: `${formaterDate(contenu, etat.jour)} — ${texte}` });
  etat.dernieresNouvelles.push(texte);
}

export function aFlag(etat: EtatPartie, flag: string, herosId?: string): boolean {
  return !!etat.flags[flag] || (vrai(herosId) && !!etat.flags[`${herosId}:${flag}`]);
}

export function affinite(etat: EtatPartie, herosId: string, compagnon: string): Affinite {
  etat.affinites[herosId] ??= {};
  return (etat.affinites[herosId][compagnon] ??= affiniteVide());
}

export function queteTerminee(etat: EtatPartie, q: string | undefined): boolean {
  return vrai(q) && !!etat.quetes[q]?.terminee;
}

export function palierCompagnon(contenu: Contenu, etat: EtatPartie, herosId: string, compagnon: string) {
  return palier(contenu, affinite(etat, herosId, compagnon), queteTerminee(etat, contenu.compagnons[compagnon]?.quete));
}

export function rangGuilde(contenu: Contenu, points: number): string {
  let r = 'F';
  for (const x of contenu.config.guilde.rangs) if (points >= x.points) r = x.rang;
  return r;
}

const ordreRangs = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

// ───────────────────────────── Rangs de Guilde et examens ─────────────────────────────

/** Rang de Guilde du héros : celui du dernier examen réussi (F au départ). */
export function rangHeros(etat: EtatPartie, herosId: string): string {
  return (etat.rangs ?? {})[herosId] ?? 'F';
}

export interface ProchainExamen {
  rang: string;
  points: number;
  pointsRequis: number;
  niveauRequis: number;
  type: 'combat' | 'epreuve' | 'scene' | null;
  /** Vrai si le héros peut passer l'examen maintenant. */
  pret: boolean;
  /** Ce qui manque, en une phrase ('' si l'examen est possible). */
  raison: string;
}

/** Examen du rang suivant pour ce héros (null : il a déjà le rang le plus haut). */
export function prochainExamen(contenu: Contenu, etat: EtatPartie, herosId: string): ProchainExamen | null {
  const h = etat.heros[herosId];
  if (!h) return null;
  const rangs = contenu.config.guilde.rangs;
  const i = rangs.findIndex((r) => r.rang === rangHeros(etat, herosId));
  const suivant = rangs[i + 1];
  if (i < 0 || !suivant) return null;
  const points = etat.pointsGuilde[herosId] ?? 0;
  const rate = (etat.examensRates ?? {})[herosId];
  let raison = '';
  if (points < suivant.points) raison = `Il faut ${suivant.points} points de Guilde (vous en avez ${points}).`;
  else if (h.niveau < suivant.niveau_min) raison = `Il faut être niveau ${suivant.niveau_min} (vous êtes niveau ${h.niveau}).`;
  else if (!suivant.examen) raison = `L'examen du rang ${suivant.rang} arrivera avec un prochain chapitre.`;
  else if (suivant.examen.type === 'scene') raison = `L'épreuve du rang ${suivant.rang} fait partie de l'histoire : « ${contenu.scenes[suivant.examen.scene ?? '']?.titre ?? suivant.rang} ».`;
  else if (rate !== undefined && etat.jour <= rate) raison = 'Examen raté aujourd\'hui : revenez demain.';
  else if (suivant.examen.type === 'epreuve' && vrai(etat.contrats[herosId])) raison = 'Terminez d\'abord votre contrat en cours.';
  return { rang: suivant.rang, points, pointsRequis: suivant.points, niveauRequis: suivant.niveau_min, type: suivant.examen ? suivant.examen.type : null, pret: raison === '', raison };
}

/** Héros présents qui peuvent passer le même combat d'examen que ce héros, lui compris (ordre de la partie). */
export function candidatsExamen(contenu: Contenu, etat: EtatPartie, herosId: string): string[] {
  const ex = prochainExamen(contenu, etat, herosId);
  if (!ex || !ex.pret || ex.type !== 'combat') return [];
  return listeHeros(etat).filter((x) => {
    if (x.id === herosId) return true;
    if (!(etat.joueurs[x.joueurId]?.present ?? false)) return false;
    const e = prochainExamen(contenu, etat, x.id);
    return !!e && e.pret && e.rang === ex.rang && e.type === 'combat';
  }).map((x) => x.id);
}

/** Cérémonie : le héros reçoit son nouveau rang. */
function promouvoir(contenu: Contenu, etat: EtatPartie, h: Heros, rang: string): string {
  etat.rangs[h.id] = rang;
  delete etat.examensRates[h.id];
  const qui = contenu.pnj[contenu.config.guilde.examinatrice]?.nom ?? 'La Guilde';
  journal(contenu, etat, `${h.nom} réussit l'examen de la Guilde : rang ${rang}.`);
  return `${qui} tamponne la carte de ${h.nom} devant tout le hall : rang ${rang} ! Les contrats du rang ${rang} lui sont ouverts.`;
}

/** Phrase à afficher quand un gain de points (ou de niveau) rend un examen possible. */
function annonceExamen(contenu: Contenu, etat: EtatPartie, h: Heros): string {
  const ex = prochainExamen(contenu, etat, h.id);
  if (!ex || ex.type === null || ex.points < ex.pointsRequis) return '';
  if (h.niveau < ex.niveauRequis) return ` — examen du rang ${ex.rang} possible dès le niveau ${ex.niveauRequis}`;
  return ` — ${h.nom} peut passer l'examen du rang ${ex.rang} à la Guilde !`;
}

// ───────────────────────────── Conditions ─────────────────────────────

/** Une condition sur un héros précis (scènes individuelles, dialogues). */
export function conditionHeros(contenu: Contenu, etat: EtatPartie, c: Condition | undefined, h: Heros | null): boolean {
  if (!c) return true;
  const liste = (v?: string | string[]) => (v === undefined ? null : Array.isArray(v) ? v : [v]);
  if (vrai(c.flag) && !aFlag(etat, c.flag, h?.id)) return false;
  if (vrai(c.pas_flag) && aFlag(etat, c.pas_flag, h?.id)) return false;
  for (const [q, et] of entrees(c.quete_etape ?? {})) if (etat.quetes[q]?.etape !== et) return false;
  if (vrai(c.quete_terminee) && !etat.quetes[c.quete_terminee]?.terminee) return false;
  for (const [f, v] of entrees(c.reputation_min ?? {})) if ((etat.reputation[f] ?? 0) < v) return false;
  if (c.date_min && etat.jour < versJour(contenu, c.date_min)) return false;
  if (c.ou && !c.ou.some((x) => conditionHeros(contenu, etat, x, h))) return false;
  // (pas de liste [c.race, c.classe…] ici : en Luau, une liste avec des trous peut sembler vide)
  const besoinHeros = vrai(c.race) || vrai(c.classe) || vrai(c.origine) || vrai(c.don) || vrai(c.affinite_min) || vrai(c.affinite_palier)
    || vrai(c.carac_min) || vrai(c.objet) || vrai(c.rang_guilde_min) || c.niveau_min !== undefined || c.or_min !== undefined;
  if (!besoinHeros) return true;
  if (!h) return false;
  const races = liste(c.race); if (races && !races.includes(h.race)) return false;
  const classes = liste(c.classe); if (classes && !classes.includes(h.classe)) return false;
  if (c.origine && h.origine !== c.origine) return false;
  if (vrai(c.don) && h.don !== c.don) return false;
  for (const [co, v] of entrees(c.affinite_min ?? {})) if (affinite(etat, h.id, co).points < v) return false;
  for (const [co, p] of entrees(c.affinite_palier ?? {})) {
    const ps = contenu.config.affinite.paliers.map((x) => x.id);
    if (palierCompagnon(contenu, etat, h.id, co).index < ps.indexOf(p)) return false;
  }
  const ca = caracsTotales(contenu, h);
  for (const [k, v] of entrees(c.carac_min ?? {})) if (ca[k as Carac] < (v ?? 0)) return false;
  if (c.niveau_min !== undefined && h.niveau < c.niveau_min) return false;
  if (c.or_min !== undefined && h.or < c.or_min) return false;
  if (vrai(c.objet) && !((h.inventaire[c.objet] ?? 0) > 0)) return false;
  if (vrai(c.rang_guilde_min) && ordreRangs.indexOf(rangHeros(etat, h.id)) < ordreRangs.indexOf(c.rang_guilde_min)) return false;
  return true;
}

/** Une condition dans une scène : vraie si au moins un héros participant la remplit. */
export function conditionScene(contenu: Contenu, etat: EtatPartie, c: Condition | undefined, heros: string[]): boolean {
  if (!c) return true;
  if (c.groupe_min !== undefined && heros.length < c.groupe_min) return false;
  if (c.groupe_max !== undefined && heros.length > c.groupe_max) return false;
  if (heros.length === 0) return conditionHeros(contenu, etat, c, null);
  return heros.some((h) => conditionHeros(contenu, etat, c, etat.heros[h]));
}

// ───────────────────────────── Conséquences ─────────────────────────────

function appliquerConsequence(contenu: Contenu, etat: EtatPartie, eff: Consequence, heros: string[], messages: string[]) {
  const hs = heros.map((h) => etat.heros[h]);
  const liste = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  for (const f of liste(eff.flag)) {
    if (f.startsWith('heros:')) for (const h of heros) etat.flags[`${h}:${f.slice(6)}`] = true;
    else etat.flags[f] = true;
  }
  if (vrai(eff.retirer_flag)) delete etat.flags[eff.retirer_flag];
  if (vrai(eff.rang_guilde)) for (const h of hs) {
    if (ordreRangs.indexOf(rangHeros(etat, h.id)) < ordreRangs.indexOf(eff.rang_guilde)) messages.push(promouvoir(contenu, etat, h, eff.rang_guilde));
  }
  if (eff.debloquer_ultime === true) for (const h of hs) {
    if (h.ultime === true) continue;
    h.ultime = true;
    const u = contenu.classes[h.classe].ultime;
    messages.push(`${h.nom} débloque son ultime : ${u.nom}${h.niveau < contenu.config.saisons[0].niveau_ultime ? ` (utilisable au niveau ${contenu.config.saisons[0].niveau_ultime})` : ''} !`);
  }
  for (const [f, v] of entrees(eff.reputation ?? {})) {
    etat.reputation[f] = Math.max(-100, Math.min(100, (etat.reputation[f] ?? 0) + v));
    messages.push(`Réputation ${nomFaction(f)} ${v > 0 ? '+' : ''}${v}`);
  }
  for (const [co, v] of entrees(eff.affinite ?? {})) {
    for (const h of hs) {
      const bonus = (contenu.races[h.race].trait.parametres.affinite_dialogue ?? 0) + (contenu.dons[h.don].parametres.affinite_dialogue ?? 0);
      const d = modifierAffinite(contenu, affinite(etat, h.id, co), v, { ageHeros: age(h, versDate(contenu, etat.jour).annee), bonusDialogue: bonus });
      if (d !== 0) messages.push(`${contenu.compagnons[co].nom} : affinité ${d > 0 ? '+' : ''}${d} (${h.nom})`);
    }
  }
  if (vrai(eff.xp)) for (const h of hs) { const n = gagnerXp(contenu, h, eff.xp); messages.push(`${h.nom} gagne ${eff.xp} XP${vrai(n) ? ` et monte au niveau ${h.niveau} !` : ''}`); }
  if (vrai(eff.or)) for (const h of hs) { h.or = Math.max(0, h.or + eff.or); messages.push(`${h.nom} ${eff.or > 0 ? 'gagne' : 'perd'} ${Math.abs(eff.or)} pièces d'or`); }
  for (const o of liste(eff.objet)) {
    const h = hs[0];
    if (h !== undefined) {
      if (dejaUnique(contenu, etat, o)) messages.push(`${contenu.objets[o].nom} existe déjà dans la partie : il n'en existe qu'un.`);
      else { h.inventaire[o] = (h.inventaire[o] ?? 0) + 1; messages.push(`${h.nom} obtient : ${contenu.objets[o].nom}`); }
    }
  }
  if (vrai(eff.retirer_objet)) for (const h of hs) if (vrai(h.inventaire[eff.retirer_objet])) { h.inventaire[eff.retirer_objet]--; break; }
  if (vrai(eff.points_guilde)) for (const h of hs) {
    const avant = rangGuilde(contenu, etat.pointsGuilde[h.id] ?? 0);
    etat.pointsGuilde[h.id] = (etat.pointsGuilde[h.id] ?? 0) + eff.points_guilde;
    const apres = rangGuilde(contenu, etat.pointsGuilde[h.id]);
    // les points ne donnent plus le rang : ils débloquent l'examen
    messages.push(`${h.nom} : +${eff.points_guilde} points de guilde${apres !== avant ? annonceExamen(contenu, etat, h) : ''}`);
  }
  if (eff.quete) {
    const neuve = !etat.quetes[eff.quete.id];
    etat.quetes[eff.quete.id] = { etape: eff.quete.etape, terminee: false };
    const q = contenu.quetes[eff.quete.id];
    if (neuve) { journal(contenu, etat, `Nouvelle quête : ${q.titre}.`); messages.push(`Nouvelle quête : ${q.titre}`); }
    else messages.push(`Quête mise à jour : ${q.titre}`);
  }
  if (vrai(eff.terminer_quete)) {
    etat.quetes[eff.terminer_quete] = { etape: etat.quetes[eff.terminer_quete]?.etape ?? 'fin', terminee: true };
    const q = contenu.quetes[eff.terminer_quete];
    journal(contenu, etat, `Quête terminée : ${q.titre}.`);
    messages.push(`Quête terminée : ${q.titre}`);
  }
  if (vrai(eff.recruter) && !etat.compagnonsRencontres.includes(eff.recruter)) {
    etat.compagnonsRencontres.push(eff.recruter);
    const nom = contenu.compagnons[eff.recruter].nom;
    journal(contenu, etat, `${nom} croise la route du groupe.`);
    messages.push(`${nom} peut désormais accompagner un héros (palier « Alliée » requis).`);
  }
  if (vrai(eff.pnj_mort) && !etat.pnjMorts.includes(eff.pnj_mort)) {
    etat.pnjMorts.push(eff.pnj_mort);
    etat.flags[`mort:${eff.pnj_mort}`] = true;
    journal(contenu, etat, `${contenu.pnj[eff.pnj_mort]?.nom ?? eff.pnj_mort} a perdu la vie.`);
  }
  for (const h of hs) {
    if (vrai(eff.atout)) h.atout = eff.atout;
    if (vrai(eff.origine_enfance)) h.origineEnfance = eff.origine_enfance;
    if (vrai(eff.contact) && !h.contacts.includes(eff.contact)) h.contacts.push(eff.contact);
  }
  if (vrai(eff.journal)) journal(contenu, etat, remplacerVariables(contenu, etat, eff.journal, heros));
  if (eff.avancer_temps) avancerTemps(contenu, etat, eff.avancer_temps.jours + eff.avancer_temps.mois * joursParMois(contenu));
  if (eff.aller_date) {
    const cible = versJour(contenu, eff.aller_date);
    if (cible > etat.jour) avancerTemps(contenu, etat, cible - etat.jour);
  }
  if (eff.ellipse) {
    const jusqua = versJour(contenu, eff.ellipse.jusqua);
    if (jusqua > etat.jour) {
      etat.tempsLibre = { titre: eff.ellipse.titre, jusqua, mois: Math.round((jusqua - etat.jour) / joursParMois(contenu)), choix: {}, resultats: null };
      messages.push(`Ellipse : ${eff.ellipse.titre}. Chaque joueur choisit ses activités de temps libre.`);
    }
  }
  if (eff.soigner_groupe) for (const h of hs) h.blessure = false;
  for (const [co, o] of entrees(eff.reveler_gout ?? {})) decouvrirGout(etat, co, o);
  // Paris : la mise sort vraiment du porte-monnaie ; elle revient (multipliée) si le pari est gagné
  if (eff.miser !== undefined) for (const h of hs) {
    if (h.or < eff.miser) continue;
    h.or -= eff.miser;
    etat.mises[h.id] = (etat.mises[h.id] ?? 0) + eff.miser;
    etat.mouvementsOr.push({ heros: h.id, montant: -eff.miser, raison: 'mise' });
    messages.push(`${h.nom} mise ${eff.miser} pièces d'or.`);
  }
  if (eff.gain_pari !== undefined) for (const h of hs) {
    const mise = etat.mises[h.id] ?? 0;
    if (mise <= 0) continue;
    const gain = Math.round(mise * eff.gain_pari);
    h.or += gain;
    delete etat.mises[h.id];
    etat.mouvementsOr.push({ heros: h.id, montant: gain, raison: 'pari gagné' });
    messages.push(`${h.nom} gagne son pari : +${gain} pièces d'or (mise comprise).`);
  }
  if (eff.perte_pari === true) for (const h of hs) {
    const mise = etat.mises[h.id] ?? 0;
    if (mise <= 0) continue;
    delete etat.mises[h.id];
    messages.push(`${h.nom} perd sa mise de ${mise} pièces d'or.`);
  }
  if (vrai(eff.fin_chapitre)) {
    etat.finChapitre = eff.fin_chapitre;
    etat.flags[`chapitre-${eff.fin_chapitre}-fini`] = true;
    journal(contenu, etat, `Fin du chapitre ${eff.fin_chapitre}. Un long moment va passer : rendez-vous à l'auberge quand tout le monde est prêt.`);
  }
  // Lignes rouges des compagnons
  for (const h of hs) for (const co of cles(contenu.compagnons)) {
    const lignes = verifierLignesRouges(contenu, co, affinite(etat, h.id, co), (f) => aFlag(etat, f, h.id));
    for (const l of lignes) messages.push(`${contenu.compagnons[co].nom} est profondément blessée : ${l}`);
    if (aFlag(etat, `pardon:${co}`, h.id)) pardonner(affinite(etat, h.id, co));
  }
}

function avancerTemps(contenu: Contenu, etat: EtatPartie, jours: number) {
  const avant = etat.jour;
  etat.jour += jours;
  for (const f of fetesEntre(contenu, avant, etat.jour)) etat.journal.push({ jour: f.jour, chapitre: etat.chapitre, texte: `${formaterDate(contenu, f.jour)} — ${f.nom}.` });
  etat.chapitre = Math.max(etat.chapitre, chapitreDe(contenu, etat.jour));
}

// ───────────────────────────── Temps choisi par les joueurs ─────────────────────────────

/** Vrai si le minuteur de jeu actif peut encore faire passer un jour (il ne change jamais de mois). */
export function jourPeutPasser(contenu: Contenu, etat: EtatPartie): boolean {
  if (etat.tempsLibre !== null) return false;
  return versDate(contenu, etat.jour).jour < joursParMois(contenu);
}

/**
 * Prochaine date que l'histoire attend : la scène principale en cours si elle exige une date,
 * sinon le début du chapitre suivant quand le chapitre est terminé. Null s'il n'y a rien à attendre.
 */
export function prochaineDateHistoire(contenu: Contenu, etat: EtatPartie): { jour: number; raison: string } | null {
  for (const [id, q] of entrees(etat.quetes)) {
    const def = contenu.quetes[id];
    if (!def || def.type !== 'principale' || q.terminee) continue;
    const e = def.etapes.find((x) => x.id === q.etape);
    const scene = e && vrai(e.scene) ? contenu.scenes[e.scene] : null;
    const d = scene?.disponible_si?.date_min;
    if (d) {
      const jour = versJour(contenu, d);
      if (jour > etat.jour) return { jour, raison: e!.objectif };
    }
  }
  if (aFlag(etat, `chapitre-${etat.chapitre}-fini`) && etat.chapitre < contenu.config.saisons[0].chapitres) {
    const s = contenu.config.saisons[0];
    const jour = versJour(contenu, { annee: s.annee_debut + etat.chapitre * s.annees_par_chapitre });
    if (jour > etat.jour) return { jour, raison: `Début du chapitre ${etat.chapitre + 1}` };
  }
  return null;
}

/** Joueurs dont on attend encore l'accord pour dormir (présents, avec un héros). */
export function attenteRepos(etat: EtatPartie): string[] {
  if (!etat.repos) return [];
  const r = etat.repos;
  return etat.ordreJoueurs.filter((j) => etat.joueurs[j].present && vrai(etat.joueurs[j].herosId) && !r.accords.includes(j));
}

function reposImpossible(etat: EtatPartie): string | null {
  if (etat.tempsLibre !== null) return 'Un temps libre est déjà en cours';
  if (etat.donjon) return 'Le groupe est dans un donjon';
  if (cles(etat.combats).length > 0) return 'Un combat est en cours';
  for (const es of valeurs(etat.scenes)) if (es.noeud !== '__fin__') return 'Une scène est en cours : terminez-la d\'abord';
  return null;
}

/** Tous les joueurs présents sont d'accord : le temps libre commence (les mois passeront à sa résolution). */
function commencerRepos(contenu: Contenu, etat: EtatPartie) {
  const r = etat.repos!;
  etat.repos = null;
  etat.tempsLibre = { titre: `Repos à l'auberge (${r.mois} mois)`, jusqua: r.jusqua, mois: r.mois, choix: {}, resultats: null };
  etat.dernieresNouvelles.push(`Tout le monde est d'accord : ${r.mois} mois vont passer. Chacun choisit ses activités.`);
}

export function nomFaction(f: string): string {
  return ({
    couronne: 'Couronne', guilde: 'Guilde', concorde: 'Concorde', ordre: 'Ordre',
    ourvalis: 'Tribus ourvalis', elfes: 'Elfes de Sylvenoire', nains: 'Nains de Grisfer', dragons: 'Dragons et Archipel',
    troupes: 'Troupes des domaines', legion: 'Légion Cendrée',
  } as Record<string, string>)[f] ?? f;
}

/** « [[tu…||vous…]] » : la première forme pour un héros seul, la seconde pour un groupe. */
function accorder(texte: string, seul: boolean): string {
  let res = '';
  let reste = texte;
  for (let garde = 0; garde < 100; garde++) {
    const i = reste.indexOf('[[');
    if (i < 0) break;
    const j = reste.indexOf(']]', i);
    if (j < 0) break;
    const morceaux = reste.slice(i + 2, j).split('||');
    res += reste.slice(0, i) + (seul ? morceaux[0] : (morceaux[1] ?? morceaux[0]));
    reste = reste.slice(j + 2);
  }
  return res + reste;
}

/**
 * @param interroge héros à qui un personnage s'adresse : {pseudo} = pseudo de son joueur, {nom} = son nom
 */
export function remplacerVariables(contenu: Contenu, etat: EtatPartie, texteBrut: string, heros: string[], interroge?: string): string {
  let texte = accorder(texteBrut, heros.length <= 1);
  const hi = vrai(interroge) ? etat.heros[interroge] : null;
  if (hi) texte = texte.replaceAll('{pseudo}', etat.joueurs[hi.joueurId]?.pseudo ?? hi.nom).replaceAll('{nom}', hi.nom);
  const noms = heros.map((h) => etat.heros[h]?.nom).filter((n): n is string => vrai(n));
  const listeNoms = noms.length <= 1 ? noms[0] ?? 'le héros' : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
  const meneur = vrai(etat.meneur) && vrai(etat.joueurs[etat.meneur]?.herosId) ? etat.heros[etat.joueurs[etat.meneur].herosId!].nom : noms[0] ?? '';
  const h0 = vrai(heros[0]) ? etat.heros[heros[0]] : null;
  return texte
    .replaceAll('{heros}', listeNoms)
    .replaceAll('{groupe}', listeNoms)
    .replaceAll('{meneur}', meneur)
    .replaceAll('{date}', formaterDate(contenu, etat.jour))
    .replaceAll('{race}', h0 ? contenu.races[h0.race].nom.toLowerCase() : '')
    .replaceAll('{classe}', h0 ? contenu.classes[h0.classe].nom.toLowerCase() : '');
}

// ───────────────────────────── Scènes ─────────────────────────────

export function sceneEstDisponible(contenu: Contenu, etat: EtatPartie, s: Scene, herosId: string | null): boolean {
  if (s.romance && contenu.config.romance === false) return false;
  if (!s.repetable && etat.scenesVues.includes(s.id)) return false;
  if (s.type === 'individuel') {
    if (!vrai(herosId)) return false;
    if (!s.repetable && etat.scenesVues.includes(`${s.id}@${herosId}`)) return false;
    return conditionHeros(contenu, etat, s.disponible_si, etat.heros[herosId]);
  }
  return conditionScene(contenu, etat, s.disponible_si, listeHeros(etat).map((h) => h.id));
}

/** Scènes que l'on peut lancer dans un lieu (ou partout si lieu = null). */
export function scenesDisponibles(contenu: Contenu, etat: EtatPartie, lieu: string | null, herosId: string | null): Scene[] {
  return valeurs(contenu.scenes).filter((s) => (lieu === null ? !vrai(s.lieu) : s.lieu === lieu) && sceneEstDisponible(contenu, etat, s, herosId));
}

function participantsGroupe(etat: EtatPartie): string[] {
  return listeHeros(etat).filter((h) => etat.joueurs[h.joueurId]?.present || h.siAbsent === 'ia').map((h) => h.id);
}

function entrerNoeud(contenu: Contenu, etat: EtatPartie, cle: string, noeudId: string) {
  const es = etat.scenes[cle];
  const scene = contenu.scenes[es.sceneId];
  const n = scene.noeuds[noeudId] ?? refuser(`Nœud introuvable : ${noeudId}`);
  es.noeud = noeudId;
  es.votes = {};
  es.messages = [];
  es.parole = null;
  es.pari = null;
  for (const eff of n.effets) appliquerConsequence(contenu, etat, eff, es.heros, es.messages);
  if (n.pari) {
    // Pari partagé : chaque joueur présent répond ; un joueur absent ne mise pas
    es.pari = {};
    if (joueursDuPari(etat, cle).length === 0) resoudrePari(contenu, etat, cle);
    return;
  }
  if (n.parole_a) {
    // Un personnage s'adresse à un joueur précis : on choisit lequel (règle, puis hasard à graine)
    const pa = n.parole_a;
    let candidats = es.heros.filter((h) => conditionHeros(contenu, etat, pa.regle, etat.heros[h]));
    if (candidats.length === 0) candidats = es.heros;
    const elu = choisirAuHasard(etat.rng, candidats);
    const h = etat.heros[elu];
    const specifiques: number[] = [];
    const generiques: number[] = [];
    pa.reponses.forEach((r, i) => {
      if (!r.si) generiques.push(i);
      else if (conditionHeros(contenu, etat, r.si, h)) specifiques.push(i);
    });
    es.parole = { heros: elu, reponses: [...specifiques, ...generiques].slice(0, 3) };
    // joueur absent : son héros répond tout seul (première réponse)
    if (!(etat.joueurs[h.joueurId]?.present ?? false)) repondreParole(contenu, etat, cle, es.parole.reponses[0]);
    return;
  }
  if (n.combat) {
    lancerCombat(contenu, etat, n.combat.rencontre, cle === 'groupe' ? 'groupe' : cle, { cle: cle === 'groupe' ? 'groupe' : cle, origine: 'scene', sceneCle: cle, victoire: n.combat.victoire, defaite: n.combat.defaite, evenementDonjon: null, contrat: null, bilan: null }, scene.lieu ?? null);
  } else if (n.donjon) {
    const d = contenu.donjons[n.donjon.id];
    etat.donjon = { id: d.id, x: d.depart.x, y: d.depart.y, faits: [], sceneCle: cle, sortie: n.donjon.sortie, messages: [`Le groupe entre dans : ${d.nom}.`], vus: [] };
    if (vrai(n.donjon.abandon)) etat.donjon.abandon = n.donjon.abandon;
    reveler(etat, d.depart.x, d.depart.y);
  } else if (n.fin) {
    terminerScene(contenu, etat, cle);
  }
}

function repondreParole(contenu: Contenu, etat: EtatPartie, cle: string, index: number) {
  const es = etat.scenes[cle];
  const n = noeudCourant(contenu, etat, cle)!;
  const p = es.parole!;
  const rep = n.parole_a!.reponses[index];
  const msgs: string[] = [`${etat.heros[p.heros].nom} répond : ${remplacerVariables(contenu, etat, rep.texte, es.heros, p.heros)}`];
  for (const eff of rep.effets) appliquerConsequence(contenu, etat, eff, [p.heros], msgs);
  entrerNoeud(contenu, etat, cle, rep.aller);
  etat.scenes[cle].messages.unshift(...msgs);
}

// ───────────────────────────── Pari partagé ─────────────────────────────

/** Joueurs qui doivent répondre au pari de la scène : présents, avec un héros dans la scène, dans l'ordre de la partie. */
export function joueursDuPari(etat: EtatPartie, cle: string): string[] {
  const es = etat.scenes[cle];
  if (!es) return [];
  return etat.ordreJoueurs.filter((j) => {
    const x = etat.joueurs[j];
    return x.present && vrai(x.herosId) && es.heros.includes(x.herosId);
  });
}

/**
 * Répartit une mise entre des parieurs, sans virgule : division entière, puis les pièces qui restent
 * sont données une par une aux premiers (ordre de la liste). Exemple : 20 à 3 → 7, 7, 6.
 */
export function partsDeMise(total: number, nombre: number): number[] {
  const res: number[] = [];
  if (nombre <= 0) return res;
  const base = Math.floor(total / nombre);
  const reste = total - base * nombre;
  for (let i = 0; i < nombre; i++) res.push(base + (i < reste ? 1 : 0));
  return res;
}

/** Part la plus petite possible (tout le monde mise) : en dessous, un héros ne peut pas miser. */
export function partMinimaleDePari(etat: EtatPartie, cle: string, total: number): number {
  const n = Math.max(1, joueursDuPari(etat, cle).length);
  return Math.floor(total / n);
}

function resoudrePari(contenu: Contenu, etat: EtatPartie, cle: string) {
  const es = etat.scenes[cle];
  const n = noeudCourant(contenu, etat, cle)!;
  const pari = n.pari!;
  const reponses = es.pari ?? {};
  // parieurs dans l'ordre de la partie ; celui qui ne peut pas payer sa part se retire, et on recalcule
  let parieurs = joueursDuPari(etat, cle).filter((j) => reponses[j] === true).map((j) => etat.heros[etat.joueurs[j].herosId!]);
  const msgs: string[] = [];
  let parts: number[] = [];
  for (let garde = 0; garde < 10 && parieurs.length > 0; garde++) {
    parts = partsDeMise(pari.mise, parieurs.length);
    const fauche = parieurs.findIndex((h, i) => h.or < parts[i]);
    if (fauche < 0) break;
    msgs.push(`${parieurs[fauche].nom} n'a pas assez d'or pour sa part et se retire du pari.`);
    parieurs = parieurs.filter((_, i) => i !== fauche);
  }
  es.pari = null;
  if (parieurs.length === 0) {
    msgs.push('Personne ne parie.');
    entrerNoeud(contenu, etat, cle, pari.personne);
  } else {
    parieurs.forEach((h, i) => {
      h.or -= parts[i];
      etat.mises[h.id] = (etat.mises[h.id] ?? 0) + parts[i];
      etat.mouvementsOr.push({ heros: h.id, montant: -parts[i], raison: 'mise' });
      msgs.push(`${h.nom} mise ${parts[i]} pièce${parts[i] > 1 ? 's' : ''} d'or.`);
    });
    if (vrai(pari.flag)) etat.flags[pari.flag] = true;
    entrerNoeud(contenu, etat, cle, pari.aller);
  }
  etat.scenes[cle].messages.unshift(...msgs);
}

/** Somme qu'un choix fait miser (0 si ce n'est pas un pari). */
export function miseDuChoix(ch: Choix): number {
  let total = 0;
  for (const eff of ch.effets) total += eff.miser ?? 0;
  return total;
}

function terminerScene(contenu: Contenu, etat: EtatPartie, cle: string) {
  const es = etat.scenes[cle];
  const s = contenu.scenes[es.sceneId];
  if (!s.repetable) etat.scenesVues.push(s.type === 'individuel' ? `${s.id}@${es.heros[0]}` : s.id);
  // une scène individuelle non répétable est « vue » pour ce héros seulement
  es.noeudFin = es.noeud;
  es.noeud = '__fin__';
}

/** Nœud à afficher : le nœud en cours, ou le dernier nœud d'une scène terminée (ses répliques restent à lire). */
export function noeudAffiche(contenu: Contenu, etat: EtatPartie, cle: string): Noeud | null {
  const es = etat.scenes[cle];
  if (!es) return null;
  if (es.noeud !== '__fin__') return contenu.scenes[es.sceneId].noeuds[es.noeud] ?? null;
  return vrai(es.noeudFin) ? contenu.scenes[es.sceneId].noeuds[es.noeudFin] ?? null : null;
}

export function noeudCourant(contenu: Contenu, etat: EtatPartie, cle: string): Noeud | null {
  const es = etat.scenes[cle];
  if (!es || es.noeud === '__fin__') return null;
  return contenu.scenes[es.sceneId].noeuds[es.noeud] ?? null;
}

export function choixVisibles(contenu: Contenu, etat: EtatPartie, cle: string): { choix: Choix; index: number; possible: boolean }[] {
  const n = noeudCourant(contenu, etat, cle);
  if (!n) return [];
  const es = etat.scenes[cle];
  return n.choix
    .map((choix, index) => ({ choix, index, possible: conditionScene(contenu, etat, choix.si, es.heros) }))
    .filter((c) => c.possible || c.choix.visible_si_bloque);
}

function resoudreChoix(contenu: Contenu, etat: EtatPartie, cle: string, index: number, votants: string[]) {
  const es = etat.scenes[cle];
  const n = noeudCourant(contenu, etat, cle)!;
  const ch = n.choix[index];
  // Les conséquences de type affinité ne touchent que les héros qui ont voté ce choix
  const herosVotants: string[] = [];
  for (const j of votants) {
    const h = etat.joueurs[j]?.herosId;
    if (vrai(h) && es.heros.includes(h)) herosVotants.push(h);
  }
  const msgs: string[] = [];
  for (const eff of ch.effets) {
    // affinité et drapeaux personnels (« heros:… ») : seulement pour ceux qui ont voté ce choix
    const { affinite: aff, flag, miser, ...reste } = eff;
    const flags = flag === undefined ? [] : Array.isArray(flag) ? flag : [flag];
    const perso = flags.filter((f) => f.startsWith('heros:'));
    const communs = flags.filter((f) => !f.startsWith('heros:'));
    appliquerConsequence(contenu, etat, { ...reste, flag: communs }, es.heros, msgs);
    if (aff || perso.length > 0 || miser !== undefined) appliquerConsequence(contenu, etat, { affinite: aff, flag: perso, miser }, herosVotants.length > 0 ? herosVotants : es.heros, msgs);
  }
  let suite = ch.aller;
  es.dernierTest = null;
  if (ch.test) {
    const candidats = es.heros.map((h) => etat.heros[h]);
    const meilleur = candidats.reduce((a, b) => (caracsTotales(contenu, b)[ch.test!.carac] > caracsTotales(contenu, a)[ch.test!.carac] ? b : a));
    const jet = de(etat.rng, 20);
    const total = jet + caracsTotales(contenu, meilleur)[ch.test.carac];
    const reussi = jet === 20 || (jet !== 1 && total >= ch.test.difficulte);
    es.dernierTest = { carac: ch.test.carac, jet, total, difficulte: ch.test.difficulte, reussi, heros: meilleur.id };
    suite = reussi ? ch.test.reussite : ch.test.echec;
  }
  entrerNoeud(contenu, etat, cle, suite!);
  etat.scenes[cle].messages.unshift(...msgs);
}

// ───────────────────────────── Combats ─────────────────────────────

/** Vrai si l'effet de cet objet est connu du joueur (un objet mystérieux reste « ??? » tant qu'il n'est pas découvert). */
export function objetConnu(contenu: Contenu, etat: EtatPartie, objet: string): boolean {
  return !contenu.objets[objet]?.mystere || (etat.objetsConnus ?? []).includes(objet);
}

function decouvrirObjet(contenu: Contenu, etat: EtatPartie, objet: string) {
  if (objetConnu(contenu, etat, objet)) return;
  etat.objetsConnus.push(objet);
  const o = contenu.objets[objet];
  etat.dernieresNouvelles.push(`Objet identifié : ${o.nom}. ${o.description}`);
}

/** Réaction connue d'un compagnon à un cadeau (null tant qu'on ne l'a pas découverte). */
export function goutConnu(contenu: Contenu, etat: EtatPartie, compagnon: string, objet: string): 'prefere' | 'apprecie' | 'neutre' | 'deteste' | null {
  if (!((etat.goutsConnus ?? {})[compagnon] ?? []).includes(objet)) return null;
  return reactionCadeau(contenu, compagnon, objet);
}

function decouvrirGout(etat: EtatPartie, compagnon: string, objet: string) {
  etat.goutsConnus[compagnon] ??= [];
  if (!etat.goutsConnus[compagnon].includes(objet)) etat.goutsConnus[compagnon].push(objet);
}

/** Ration de voyage : il en faut une par héros pour un combat hors de la ville ; sans ration, on part fatigué. */
export const RATION = { objet: 'ration', malusPv: 0.15 };

/** Vrai si un combat dans ce lieu se passe « en route » (hors d'une ville) : chaque héros y mange une ration. */
export function lieuHorsVille(contenu: Contenu, lieu: string | null | undefined): boolean {
  if (!vrai(lieu)) return false;
  for (const r of valeurs(contenu.regions)) {
    const l = r.lieux.find((x) => x.id === lieu);
    if (l) return !vrai(l.ville);
  }
  return false;
}

function lancerCombat(contenu: Contenu, etat: EtatPartie, rencontre: string, cle: string, contexte: ContexteCombat, lieu: string | null = null, participants: string[] | null = null) {
  const herosIds = participants ?? (cle === 'groupe' ? participantsGroupe(etat) : [cle]);
  if (herosIds.length === 0) refuser('Aucun héros disponible pour combattre');
  const allies: Combattant[] = [];
  for (const id of herosIds) {
    const h = etat.heros[id];
    const present = etat.joueurs[h.joueurId]?.present ?? false;
    allies.push(combattantHeros(contenu, h, present, h.grimoire));
    const co = etat.equipe[id];
    if (vrai(co) && etat.compagnonsRencontres.includes(co)) {
      const p = paliersAtteints(contenu, affinite(etat, id, co), queteTerminee(etat, contenu.compagnons[co].quete));
      if (p.includes('alliee')) allies.push(combattantCompagnon(contenu, co, h, p));
    }
  }
  const combat = demarrerCombat(contenu, rencontre, allies, etat.rng, `${cle}:${etat.numeroAction}`);
  if (lieuHorsVille(contenu, lieu)) {
    // en route : chaque héros mange une ration ; sans ration, il commence le combat fatigué
    for (const x of combat.combattants) {
      if (x.type !== 'heros' || !vrai(x.herosId)) continue;
      const h = etat.heros[x.herosId];
      if ((h.inventaire[RATION.objet] ?? 0) > 0) {
        h.inventaire[RATION.objet]--;
        etat.dernieresNouvelles.push(`${h.nom} mange une ration de voyage en route.`);
      } else {
        x.pv = Math.max(1, x.pv - Math.round(x.pvMax * RATION.malusPv));
        etat.dernieresNouvelles.push(`${h.nom} n'a pas de ration : la route l'a fatigué (−${Math.round(RATION.malusPv * 100)} % de PV au début du combat).`);
      }
    }
  }
  etat.combats[cle] = { combat, contexte };
}

function terminerCombat(contenu: Contenu, etat: EtatPartie, cle: string) {
  const { combat, contexte } = etat.combats[cle];
  const bilan: string[] = [];
  const heros = combat.combattants.filter((c) => c.type === 'heros').map((c) => etat.heros[c.herosId!]);
  // potions réellement consommées
  for (const c of combat.combattants.filter((x) => x.type === 'heros')) {
    const h = etat.heros[c.herosId!];
    const utilisees = c.compteurs.potionsUtilisees ?? 0;
    if (vrai(utilisees)) h.inventaire['potion-soin-petite'] = Math.max(0, (h.inventaire['potion-soin-petite'] ?? 0) - utilisees);
    // autres objets du sac consommés pendant le combat (potions de soin et de mana, antidotes, bombes…)
    for (const [k, n] of entrees(c.compteurs)) {
      if (!k.startsWith('utilise:') || n <= 0) continue;
      const objet = k.slice(8);
      h.inventaire[objet] = Math.max(0, (h.inventaire[objet] ?? 0) - n);
    }
    // Maîtrise : chaque utilisation d'une compétence pendant le combat compte pour un point
    for (const [k, n] of entrees(c.compteurs)) {
      if (!k.startsWith('usage:') || n <= 0) continue;
      const id = k.slice(6);
      const avant = rangMaitrise(contenu, h.maitrise[id] ?? 0);
      gagnerMaitrise(contenu, h, id, n);
      const apres = rangMaitrise(contenu, h.maitrise[id] ?? 0);
      if (apres > avant) bilan.push(`${h.nom} maîtrise mieux « ${contenu.competences[id]?.nom ?? id} » : maîtrise ${apres}/${contenu.config.maitrise.seuils.length}.`);
    }
  }
  if (combat.resultat === 'victoire') {
    const r = recompensesCombat(contenu, combat, etat.rng);
    for (const h of heros) {
      const n = gagnerXp(contenu, h, r.xpParHeros);
      h.or += r.orParHeros;
      bilan.push(`${h.nom} : +${r.xpParHeros} XP, +${r.orParHeros} or${vrai(n) ? ` — niveau ${h.niveau} !` : ''}`);
    }
    r.objets.forEach((o, i) => {
      const h = heros[i % heros.length];
      if (dejaUnique(contenu, etat, o)) return;
      h.inventaire[o] = (h.inventaire[o] ?? 0) + 1;
      bilan.push(`${h.nom} récupère : ${contenu.objets[o].nom}`);
    });
  } else if (combat.resultat === 'defaite' && contexte.origine === 'examen') {
    // examen de rang : aucun danger. Ni blessure, ni or perdu ; on pourra retenter le lendemain.
    bilan.push("L'examinateur baisse son arme et vous aide à vous relever. « Pas encore. Revenez demain. » Aucune blessure, aucune pièce perdue.");
  } else if (combat.resultat === 'defaite') {
    for (const h of heros) {
      const perte = Math.floor(h.or * contenu.config.mort_douce.perte_or_pourcent / 100);
      h.or -= perte;
      h.blessure = true;
      bilan.push(`${h.nom} se réveille au refuge, blessé (−${contenu.config.mort_douce.blessure_pv_pourcent} % de PV max jusqu'au repos) et perd ${perte} or.`);
    }
    journal(contenu, etat, `Défaite face à : ${combat.nom}.`);
  } else bilan.push('Le groupe a pris la fuite.');
  contexte.bilan = bilan;
}

function apresCombat(contenu: Contenu, etat: EtatPartie, cle: string) {
  const { combat, contexte } = etat.combats[cle];
  delete etat.combats[cle];
  const victoire = combat.resultat === 'victoire';
  if (contexte.origine === 'examen' && contexte.examen) {
    // examen réussi : cérémonie, nouveau rang pour chaque héros qui l'a passé
    etat.dernieresNouvelles.push(...(contexte.bilan ?? []));
    for (const id of contexte.examen.heros) {
      if (!etat.heros[id]) continue;
      if (victoire) etat.dernieresNouvelles.push(promouvoir(contenu, etat, etat.heros[id], contexte.examen.rang));
      else etat.examensRates[id] = etat.jour; // raté : nouvelle tentative le lendemain
    }
  } else if (contexte.origine === 'scene' && vrai(contexte.sceneCle) && etat.scenes[contexte.sceneCle]) {
    entrerNoeud(contenu, etat, contexte.sceneCle, (victoire ? contexte.victoire : contexte.defaite)!);
    etat.scenes[contexte.sceneCle].messages.unshift(...(contexte.bilan ?? []));
  } else if (contexte.origine === 'donjon' && etat.donjon) {
    if (victoire && vrai(contexte.evenementDonjon)) etat.donjon.faits.push(contexte.evenementDonjon);
    etat.donjon.messages = [...(contexte.bilan ?? [])];
    if (!victoire) {
      // défaite ou fuite : le groupe se retrouve à l'entrée (mort douce) ; les combats déjà gagnés restent gagnés
      const d = etat.donjon;
      const defaites = (d.defaites ?? 0) + (combat.resultat === 'defaite' ? 1 : 0);
      const msg = combat.resultat === 'defaite'
        ? [...(contexte.bilan ?? []), 'Vous reprenez connaissance près de l\'escalier d\'entrée. Les ennemis vaincus ne se relèveront pas.']
        : ['Le groupe se replie vers l\'entrée.'];
      if (defaites >= 3 && vrai(d.abandon)) msg.push('Le groupe est épuisé. Vous pouvez renoncer et remonter par l\'escalier d\'entrée : l\'histoire continuera sans ce que vous cherchiez ici.');
      etat.donjon = { ...d, x: contenu.donjons[d.id].depart.x, y: contenu.donjons[d.id].depart.y, messages: msg, defaites };
    }
  } else if (contexte.origine === 'contrat' && vrai(contexte.contrat) && etat.contrats[cle]?.id === contexte.contrat) {
    // contrat à étapes : la victoire fait passer à l'étape suivante ; sinon on pourra réessayer
    const st = etat.contrats[cle];
    if (victoire) { st.notes = [...(contexte.bilan ?? [])]; avancerContrat(contenu, etat, etat.heros[cle]); }
    else st.notes = [...(contexte.bilan ?? []), combat.resultat === 'defaite' ? 'Vous êtes repoussé. Reprenez des forces, puis revenez : le contrat tient toujours.' : 'Vous vous repliez. Le contrat tient toujours : revenez quand vous êtes prêt.'];
  } else if (contexte.origine === 'contrat' && vrai(contexte.contrat)) {
    const h = etat.heros[cle];
    const ct = contenu.contrats[contexte.contrat];
    if (victoire) {
      const msgs: string[] = [];
      appliquerConsequence(contenu, etat, { or: ct.recompenses.or, xp: ct.recompenses.xp, points_guilde: ct.recompenses.points_guilde, objet: ct.recompenses.objets }, [h.id], msgs);
      journal(contenu, etat, `${h.nom} remplit le contrat « ${ct.titre} ».`);
    }
  }
}

// ───────────────────────────── Donjon ─────────────────────────────

const INFRANCHISSABLE = ['mur', 'vide', 'eau', 'colonne'];

export function caseDonjon(contenu: Contenu, id: string, x: number, y: number): string {
  const d = contenu.donjons[id];
  const ligne = d.carte[y];
  if (!vrai(ligne) || x < 0 || x >= ligne.length) return 'vide';
  return d.legende[ligne[x]];
}

function reveler(etat: EtatPartie, x: number, y: number) {
  if (!etat.donjon) return;
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const k = `${x + dx},${y + dy}`;
    if (!etat.donjon.vus.includes(k)) etat.donjon.vus.push(k);
  }
}

function deplacerDonjon(contenu: Contenu, etat: EtatPartie, dx: number, dy: number) {
  const dj = etat.donjon ?? refuser("Le groupe n'est pas dans un donjon");
  if (cles(etat.combats).includes('groupe')) refuser('Un combat est en cours');
  if (Math.abs(dx) + Math.abs(dy) !== 1) refuser('Déplacement d\'une case à la fois');
  const nx = dj.x + dx, ny = dj.y + dy;
  const t = caseDonjon(contenu, dj.id, nx, ny);
  const d = contenu.donjons[dj.id];
  const ev = d.evenements.find((e) => e.x === nx && e.y === ny && !(e.unique && dj.faits.includes(e.id)) && conditionScene(contenu, etat, e.si, participantsGroupe(etat)));
  if (INFRANCHISSABLE.some((m) => t.startsWith(m))) {
    if (ev?.type === 'texte' && vrai(ev.texte)) dj.messages = [ev.texte];
    else refuser('Passage bloqué');
    return;
  }
  if (t.startsWith('porte-verrouillee') && !listeHeros(etat).some((h) => entrees(h.inventaire).some(([o, n]) => o.startsWith('cle-') && n > 0))) {
    dj.messages = ['Une lourde porte de bronze, verrouillée. Il faudrait une clé.'];
    return;
  }
  dj.x = nx; dj.y = ny;
  dj.messages = [];
  reveler(etat, nx, ny);
  // porte de secours : après 3 défaites, la sortie s'ouvre même sans l'objectif, vers le nœud « abandon »
  const sortieFermee = ev?.type !== 'sortie' ? d.evenements.find((e) => e.type === 'sortie' && e.x === nx && e.y === ny) : undefined;
  if (sortieFermee && (dj.defaites ?? 0) >= 3 && vrai(dj.abandon)) {
    const cle = dj.sceneCle;
    const abandon = dj.abandon!;
    etat.donjon = null;
    if (etat.scenes[cle]) entrerNoeud(contenu, etat, cle, abandon);
    return;
  }
  if (!ev) return;
  const heros = participantsGroupe(etat);
  switch (ev.type) {
    case 'combat':
      lancerCombat(contenu, etat, ev.rencontre!, 'groupe', { cle: 'groupe', origine: 'donjon', sceneCle: dj.sceneCle, victoire: null, defaite: null, evenementDonjon: ev.id, contrat: null, bilan: null });
      if (vrai(ev.texte)) dj.messages.push(ev.texte);
      return;
    case 'coffre': {
      dj.faits.push(ev.id);
      const msgs: string[] = [ev.texte ?? 'Un coffre !'];
      if (vrai(ev.or)) appliquerConsequence(contenu, etat, { or: Math.round(ev.or / Math.max(1, heros.length)) }, heros, msgs);
      ev.objets.forEach((o, i) => appliquerConsequence(contenu, etat, { objet: o }, [heros[i % heros.length]], msgs));
      dj.messages = msgs;
      return;
    }
    case 'piege': {
      dj.faits.push(ev.id);
      const t2 = ev.test ?? { carac: 'AGI' as Carac, difficulte: 15 };
      const meilleur = heros.map((h) => etat.heros[h]).reduce((a, b) => (caracsTotales(contenu, b)[t2.carac] > caracsTotales(contenu, a)[t2.carac] ? b : a));
      const jet = de(etat.rng, 20);
      const total = jet + caracsTotales(contenu, meilleur)[t2.carac];
      if (total >= t2.difficulte) dj.messages = [`${ev.texte ?? 'Un piège !'} ${meilleur.nom} le repère à temps (${t2.carac} : ${jet} + ${total - jet} = ${total} ≥ ${t2.difficulte}).`];
      else {
        for (const h of heros) etat.heros[h].blessure = true;
        dj.messages = [`${ev.texte ?? 'Un piège !'} Le groupe est pris au dépourvu (${t2.carac} : ${total} < ${t2.difficulte}) : tout le monde est blessé jusqu'au prochain repos.`];
      }
      return;
    }
    case 'texte':
      if (ev.unique) dj.faits.push(ev.id);
      dj.messages = [ev.texte ?? ''];
      return;
    case 'sortie': {
      const cle = dj.sceneCle;
      const sortie = dj.sortie;
      etat.donjon = null;
      if (etat.scenes[cle]) entrerNoeud(contenu, etat, cle, sortie);
      return;
    }
    case 'scene':
      dj.faits.push(ev.id);
      dj.messages = [ev.texte ?? ''];
      return;
  }
}

// ───────────────────────────── Temps libre ─────────────────────────────

function resoudreTempsLibre(contenu: Contenu, etat: EtatPartie) {
  const tl = etat.tempsLibre!;
  const f = tl.mois / contenu.config.ellipses.duree_reference_mois;
  const resultats: Record<string, string[]> = {};
  for (const h of listeHeros(etat)) {
    const r: string[] = [];
    for (const choix of tl.choix[h.id] ?? []) {
      const a = contenu.activites[choix.activite];
      const g = a.gains;
      if (vrai(g.xp_pourcent_niveau)) { const xp = Math.round(xpPourNiveau(contenu, h.niveau) * g.xp_pourcent_niveau * f); const n = gagnerXp(contenu, h, xp); r.push(`${a.nom} : +${xp} XP${vrai(n) ? ` (niveau ${h.niveau} !)` : ''}`); }
      if (g.carac_plus_un) { h.pointsCaracDispo += 1; r.push(`${a.nom} : +1 point de caractéristique à répartir`); }
      let or = g.or_base * f;
      if (g.or_par_carac) or += caracsTotales(contenu, h)[g.or_par_carac.carac] * g.or_par_carac.valeur * f;
      if (vrai(or)) { h.or += Math.round(or); r.push(`${a.nom} : +${Math.round(or)} or`); }
      if (vrai(g.points_guilde)) { const p = Math.round(g.points_guilde * f); etat.pointsGuilde[h.id] = (etat.pointsGuilde[h.id] ?? 0) + p; r.push(`${a.nom} : +${p} points de guilde (rang ${rangGuilde(contenu, etat.pointsGuilde[h.id])})`); }
      if (g.objet_artisanat) {
        const n = Math.max(1, Math.round(f * (1 + (h.don === 'main-de-l-artisan' ? 1 : 0) + (h.classe === 'alchimiste' ? 1 : 0))));
        h.inventaire['potion-soin'] = (h.inventaire['potion-soin'] ?? 0) + n;
        r.push(`${a.nom} : ${n} potion(s) de soin fabriquée(s)`);
      }
      if (vrai(g.affinite) && vrai(choix.compagnon)) {
        const d = modifierAffinite(contenu, affinite(etat, h.id, choix.compagnon), Math.round(g.affinite * Math.max(1, f)), { ageHeros: age(h, versDate(contenu, tl.jusqua).annee) });
        r.push(`${a.nom} avec ${contenu.compagnons[choix.compagnon].nom} : affinité +${d}`);
      }
      if (vrai(g.affinite_tous)) for (const co of etat.compagnonsRencontres) modifierAffinite(contenu, affinite(etat, h.id, co), g.affinite_tous, { ageHeros: age(h, versDate(contenu, tl.jusqua).annee) });
      if (g.soigne_blessure) { h.blessure = false; r.push(`${a.nom} : blessures guéries`); }
      for (const [fac, v] of entrees(g.reputation ?? {})) {
        const gain = Math.max(1, Math.round(v * f));
        etat.reputation[fac] = Math.max(-100, Math.min(100, (etat.reputation[fac] ?? 0) + gain));
        r.push(`${a.nom} : ${nomFaction(fac)} +${gain}`);
      }
      if (vrai(g.maitrise)) {
        // l'entraînement fait progresser la maîtrise de toutes les compétences équipées
        const points = Math.max(1, Math.round(g.maitrise * f));
        const montees: string[] = [];
        for (const id of competencesEquipees(contenu, h)) {
          const avant = rangMaitrise(contenu, h.maitrise[id] ?? 0);
          gagnerMaitrise(contenu, h, id, points);
          if (rangMaitrise(contenu, h.maitrise[id] ?? 0) > avant) montees.push(`${contenu.competences[id].nom} (maîtrise ${rangMaitrise(contenu, h.maitrise[id])})`);
        }
        r.push(`${a.nom} : +${points} points de maîtrise par compétence équipée${montees.length > 0 ? ` — progrès : ${montees.join(', ')}` : ''}`);
      }
    }
    resultats[h.id] = r;
  }
  tl.resultats = resultats;
  journal(contenu, etat, `${tl.titre} (${tl.mois} mois passent).`);
  avancerTemps(contenu, etat, tl.jusqua - etat.jour);
  for (const h of listeHeros(etat)) h.blessure = false;
}

// ───────────────────────────── Application d'une action ─────────────────────────────

export function appliquer(contenu: Contenu, etatAvant: EtatPartie, action: Action): EtatPartie {
  const etat = copieProfonde(etatAvant);
  etat.dernieresNouvelles = [];
  etat.mouvementsOr = [];
  etat.mises ??= {};
  etat.objetsConnus ??= [];
  etat.goutsConnus ??= {};
  etat.rangs ??= {};
  etat.examensRates ??= {};
  etat.contrats ??= {};
  for (const h of valeurs(etat.heros)) { h.grimoire ??= {}; h.maitrise ??= {}; }
  if (etat.grimoire) repartirAncienGrimoire(contenu, etat); // parties d'avant le grimoire personnel
  if (etat.repos === undefined) etat.repos = null; // parties créées avant le repos à l'auberge
  const j = etat.joueurs[action.joueur];
  if (action.type !== 'rejoindre' && !j) refuser('Joueur inconnu : rejoignez la partie d\'abord');

  switch (action.type) {
    case 'rejoindre': {
      if (j !== undefined) { j.pseudo = action.pseudo; j.present = true; break; }
      if (etat.ordreJoueurs.length >= MAX_JOUEURS) refuser(`La partie est complète (${MAX_JOUEURS} joueurs maximum)`);
      const pseudo = action.pseudo.trim().slice(0, 24);
      if (!vrai(pseudo)) refuser('Choisissez un pseudo');
      if (valeurs(etat.joueurs).some((x) => x.pseudo.toLowerCase() === pseudo.toLowerCase())) refuser('Ce pseudo est déjà pris dans cette partie');
      etat.joueurs[action.joueur] = { id: action.joueur, pseudo, herosId: null, present: true };
      etat.ordreJoueurs.push(action.joueur);
      etat.meneur ??= action.joueur;
      journal(contenu, etat, `${pseudo} rejoint la partie.`);
      break;
    }
    case 'presence':
      j.present = action.present;
      // un joueur qui s'absente ne mise pas : un pari qui n'attendait plus que lui se résout
      for (const [k, es] of entrees(etat.scenes)) {
        if (!es.pari || !noeudCourant(contenu, etat, k)?.pari) continue;
        if (joueursDuPari(etat, k).every((x) => es.pari![x] !== undefined)) resoudrePari(contenu, etat, k);
      }
      break;
    case 'creer_heros': {
      if (vrai(j.herosId)) refuser('Vous avez déjà un héros');
      const h = action.heros;
      if (listeHeros(etat).some((x) => x.don === h.don)) refuser(`Le don « ${contenu.dons[h.don]?.nom ?? h.don} » est déjà pris par un autre joueur`);
      const existants = listeHeros(etat);
      const enCours = etat.jour > 0 || existants.some((x) => x.niveau > 1);
      const niveau = enCours ? niveauMoyen(existants) : 1;
      const id = `h${etat.ordreJoueurs.indexOf(action.joueur) + 1}`;
      let hero: Heros;
      try {
        hero = creerHeros(contenu, { ...h, id, joueurId: action.joueur, anneeCampagne: versDate(contenu, Math.max(0, etat.jour)).annee, niveau });
      } catch (e) { return refuser((e as Error).message); }
      // un réincarné qui arrive en cours de campagne n'a pas de prologue jouable
      etat.heros[id] = hero;
      j.herosId = id;
      for (const [f, v] of entrees(contenu.races[hero.race].reputation_depart)) etat.reputation[f] = (etat.reputation[f] ?? 0) + v / Math.max(1, existants.length + 1);
      etat.pointsGuilde[id] = enCours ? Math.round(existants.reduce((a, x) => a + (etat.pointsGuilde[x.id] ?? 0), 0) / Math.max(1, existants.length)) : 0;
      etat.equipe[id] = null;
      if (vrai(contenu.dons[hero.don].parametres.affinite_depart)) for (const co of cles(contenu.compagnons)) affinite(etat, id, co).points = contenu.dons[hero.don].parametres.affinite_depart;
      journal(contenu, etat, `${hero.nom} (${contenu.races[hero.race].nom.toLowerCase()}, ${contenu.classes[hero.classe].nom}, ${hero.origine === 'invoque' ? 'invoqué' : 'réincarné'}) rejoint l'histoire${niveau > 1 ? ` au niveau ${niveau}` : ''}.`);
      break;
    }
    case 'portrait': {
      const h = herosDuJoueur(etat, action.joueur);
      if (vrai(action.image) && action.image.length > 300_000) refuser('Image trop lourde (300 Ko maximum)');
      h.portrait = action.image;
      break;
    }
    case 'si_absent':
      herosDuJoueur(etat, action.joueur).siAbsent = action.mode;
      break;
    case 'lancer_scene': {
      const s = contenu.scenes[action.scene] ?? refuser('Scène inconnue');
      const h = herosDuJoueur(etat, action.joueur);
      if (s.type === 'groupe') {
        if (etat.tempsLibre && !etat.tempsLibre.resultats) refuser('Terminez d\'abord le temps libre');
        if (etat.scenes.groupe && etat.scenes.groupe.noeud !== '__fin__') refuser('Une scène de groupe est déjà en cours');
        if (etat.donjon) refuser('Le groupe est dans un donjon');
        if (!sceneEstDisponible(contenu, etat, s, h.id)) refuser('Cette scène n\'est pas disponible');
        etat.scenes.groupe = { sceneId: s.id, noeud: s.debut, heros: participantsGroupe(etat), votes: {}, dernierTest: null, messages: [], parole: null };
        if (etat.tempsLibre?.resultats) etat.tempsLibre = null;
        entrerNoeud(contenu, etat, 'groupe', s.debut);
      } else {
        if (etat.scenes[h.id] && etat.scenes[h.id].noeud !== '__fin__') refuser('Vous êtes déjà dans une scène');
        if (!sceneEstDisponible(contenu, etat, s, h.id)) refuser('Cette scène n\'est pas disponible');
        etat.scenes[h.id] = { sceneId: s.id, noeud: s.debut, heros: [h.id], votes: {}, dernierTest: null, messages: [], parole: null };
        entrerNoeud(contenu, etat, h.id, s.debut);
      }
      break;
    }
    case 'choisir': {
      const es = etat.scenes[action.cle] ?? refuser('Aucune scène');
      if (action.cle !== 'groupe' && j.herosId !== action.cle) refuser('Ce n\'est pas votre scène');
      if (etat.combats[action.cle]) refuser('Un combat est en cours');
      if (etat.donjon && action.cle === 'groupe') refuser('Le groupe explore un donjon');
      const visibles = choixVisibles(contenu, etat, action.cle);
      const c = visibles.find((x) => x.index === action.index);
      if (!c || !c.possible) refuser('Choix impossible');
      const mise = miseDuChoix(c!.choix);
      if (mise > 0 && vrai(j.herosId) && etat.heros[j.herosId].or < mise) refuser(`Pas assez d'or pour miser ${mise} pièces (vous en avez ${etat.heros[j.herosId].or})`);
      if (action.cle !== 'groupe') { resoudreChoix(contenu, etat, action.cle, action.index, [action.joueur]); break; }
      es.votes[action.joueur] = action.index;
      // tous les joueurs présents ont voté → résolution
      const presents = etat.ordreJoueurs.filter((x) => etat.joueurs[x].present && vrai(etat.joueurs[x].herosId));
      if (presents.every((p) => es.votes[p] !== undefined)) resoudreVote(contenu, etat);
      break;
    }
    case 'repondre': {
      const es = etat.scenes[action.cle] ?? refuser('Aucune scène');
      const p = es.parole ?? refuser('Personne ne vous pose de question');
      if (j.herosId !== p.heros) refuser(`C'est à ${etat.heros[p.heros].nom} de répondre`);
      if (!p.reponses.includes(action.index)) refuser('Réponse impossible');
      repondreParole(contenu, etat, action.cle, action.index);
      break;
    }
    case 'parier': {
      const es = etat.scenes[action.cle] ?? refuser('Aucune scène');
      const n = noeudCourant(contenu, etat, action.cle);
      if (!n || !n.pari || !es.pari) refuser('Aucun pari en cours');
      const attendus = joueursDuPari(etat, action.cle);
      if (!attendus.includes(action.joueur)) refuser('Vous ne participez pas à ce pari');
      if (es.pari![action.joueur] !== undefined) refuser('Vous avez déjà répondu');
      const hj = herosDuJoueur(etat, action.joueur);
      const minimum = partMinimaleDePari(etat, action.cle, n!.pari!.mise);
      if (action.mise && hj.or < minimum) refuser(`Pas assez d'or pour miser : il faut au moins ${minimum} pièces (vous en avez ${hj.or})`);
      es.pari![action.joueur] = action.mise === true;
      if (attendus.every((x) => es.pari![x] !== undefined)) resoudrePari(contenu, etat, action.cle);
      break;
    }
    case 'trancher': {
      if (etat.meneur !== action.joueur) refuser('Seul le meneur du jour peut trancher');
      const es = etat.scenes.groupe ?? refuser('Aucune scène de groupe');
      if (cles(es.votes).length === 0) refuser('Personne n\'a encore voté');
      resoudreVote(contenu, etat);
      break;
    }
    case 'continuer': {
      if (action.cle !== 'groupe' && j.herosId !== action.cle) refuser('Ce n\'est pas votre scène');
      if (etat.combats[action.cle]) refuser('Un combat est en cours');
      const n = noeudCourant(contenu, etat, action.cle) ?? refuser('Rien à continuer');
      if (!vrai(n.suite)) refuser('Il faut faire un choix');
      if (action.cle === 'groupe' && etat.donjon) refuser('Le groupe explore un donjon');
      // aiguillage : premier nœud dont la condition est vraie, sinon la suite
      let dest = n.suite!;
      for (const a of n.aiguillage ?? []) {
        if (conditionScene(contenu, etat, a.si, etat.scenes[action.cle].heros)) { dest = a.aller; break; }
      }
      entrerNoeud(contenu, etat, action.cle, dest);
      break;
    }
    case 'quitter_scene': {
      const es = etat.scenes[action.cle];
      if (!es) break;
      if (es.noeud !== '__fin__') {
        const s = contenu.scenes[es.sceneId];
        if (!s.repetable || etat.combats[action.cle]) refuser('Cette scène doit être menée jusqu\'au bout');
      }
      delete etat.scenes[action.cle];
      break;
    }
    case 'combat': {
      const entree = etat.combats[action.cle] ?? refuser('Aucun combat');
      const acteur = entree.combat.combattants.find((c) => c.id === action.action.acteur) ?? refuser('Combattant inconnu');
      if (acteur.joueurId !== action.joueur) refuser('Ce personnage ne vous appartient pas');
      try { jouerAction(contenu, entree.combat, etat.rng, action.action); } catch (e) { refuser((e as Error).message); }
      if (entree.combat.resultat) terminerCombat(contenu, etat, action.cle);
      break;
    }
    case 'second_depart': {
      const h = herosDuJoueur(etat, action.joueur);
      if (h.don !== 'second-depart') refuser('Il faut le don Second départ');
      if (etat.secondDepart[h.id] === etat.session) refuser('Déjà utilisé pendant cette session');
      const entree = etat.combats[action.cle] ?? refuser('Aucun combat');
      entree.combat = annulerTour(entree.combat);
      entree.contexte.bilan = null;
      etat.secondDepart[h.id] = etat.session;
      // reprend jusqu'au premier joueur
      avancer(contenu, entree.combat, etat.rng);
      if (entree.combat.resultat) terminerCombat(contenu, etat, action.cle);
      break;
    }
    case 'fin_combat': {
      const entree = etat.combats[action.cle] ?? refuser('Aucun combat');
      if (!entree.combat.resultat) refuser('Le combat n\'est pas terminé');
      apresCombat(contenu, etat, action.cle);
      break;
    }
    case 'donjon_deplacer':
      if (etat.meneur !== action.joueur && etat.joueurs[etat.meneur ?? '']?.present) refuser('C\'est le meneur du jour qui guide le groupe');
      deplacerDonjon(contenu, etat, action.dx, action.dy);
      break;
    case 'temps_libre': {
      const tl = etat.tempsLibre ?? refuser('Pas de temps libre en cours');
      if (tl.resultats) refuser('Le temps libre est terminé');
      const h = herosDuJoueur(etat, action.joueur);
      const n = contenu.config.ellipses.activites_temps_libre + (h.don === 'croissance-acceleree' ? 1 : 0);
      if (action.activites.length !== n) refuser(`Choisissez ${n} activités`);
      for (const a of action.activites) {
        const act = contenu.activites[a.activite] ?? refuser('Activité inconnue');
        if (!conditionHeros(contenu, etat, act.disponible_si, h)) refuser(`Activité « ${act.nom} » indisponible`);
        if (act.choix_compagnon && (!vrai(a.compagnon) || !etat.compagnonsRencontres.includes(a.compagnon))) refuser('Choisissez un compagnon rencontré');
      }
      if (h.don === 'croissance-acceleree' && action.activites.filter((a) => a.activite === 'entrainement').length < 1) refuser('Le don Croissance accélérée donne une activité « Entraînement » en plus : choisissez-la');
      tl.choix[h.id] = action.activites;
      const tous = listeHeros(etat).every((x) => tl.choix[x.id]);
      if (tous) resoudreTempsLibre(contenu, etat);
      break;
    }
    case 'valider_temps_libre': {
      // un joueur absent n'a pas choisi : on lui attribue Repos + Guilde pour ne pas bloquer
      const tl = etat.tempsLibre ?? refuser('Pas de temps libre en cours');
      if (tl.resultats) { etat.tempsLibre = null; break; }
      if (etat.meneur !== action.joueur) refuser('Seul le meneur du jour peut valider pour les absents');
      for (const h of listeHeros(etat)) if (!tl.choix[h.id]) tl.choix[h.id] = [{ activite: 'repos' }, { activite: 'guilde' }];
      resoudreTempsLibre(contenu, etat);
      break;
    }
    case 'jour_passe': {
      if (action.jour !== etat.jour) refuser('Ce jour est déjà passé');
      if (!jourPeutPasser(contenu, etat)) refuser('Dernier jour du mois : pour changer de mois, dormez à l\'auberge');
      avancerTemps(contenu, etat, 1);
      const fete = fetesEntre(contenu, etat.jour - 1, etat.jour)[0];
      etat.dernieresNouvelles.push(fete ? `Un nouveau jour se lève : ${fete.nom} !` : `Un nouveau jour se lève : ${formaterDate(contenu, etat.jour)}.`);
      break;
    }
    case 'proposer_repos': {
      herosDuJoueur(etat, action.joueur);
      const pb = reposImpossible(etat);
      if (vrai(pb)) refuser(pb);
      let mois = action.mois ?? 0;
      let jusqua = etat.jour + mois * joursParMois(contenu);
      if (action.histoire === true) {
        const d = prochaineDateHistoire(contenu, etat) ?? refuser('L\'histoire n\'attend aucune date pour le moment');
        jusqua = d.jour;
        mois = Math.max(1, Math.round((d.jour - etat.jour) / joursParMois(contenu)));
      } else if (!contenu.config.ellipses.durees_auberge_mois.includes(mois)) refuser('Durée de repos non proposée');
      etat.repos = { par: action.joueur, mois, jusqua, accords: [action.joueur] };
      if (attenteRepos(etat).length === 0) commencerRepos(contenu, etat);
      else etat.dernieresNouvelles.push(`${j.pseudo} propose de dormir ${mois} mois à l'auberge. En attente de : ${attenteRepos(etat).map((x) => etat.joueurs[x].pseudo).join(', ')}.`);
      break;
    }
    case 'repondre_repos': {
      const r = etat.repos ?? refuser('Personne ne propose de dormir pour le moment');
      herosDuJoueur(etat, action.joueur);
      if (!action.accepte) {
        etat.repos = null;
        etat.dernieresNouvelles.push(`${j.pseudo} préfère ne pas dormir ${r.mois} mois. Proposez une autre durée.`);
        break;
      }
      const pb = reposImpossible(etat);
      if (vrai(pb)) refuser(pb);
      if (!r.accords.includes(action.joueur)) r.accords.push(action.joueur);
      if (attenteRepos(etat).length === 0) commencerRepos(contenu, etat);
      break;
    }
    case 'cadeau': {
      const h = herosDuJoueur(etat, action.joueur);
      if (!etat.compagnonsRencontres.includes(action.compagnon)) refuser('Vous ne connaissez pas encore ce personnage');
      if (!((h.inventaire[action.objet] ?? 0) > 0)) refuser('Vous n\'avez pas cet objet');
      const a = affinite(etat, h.id, action.compagnon);
      if (!peutOffrir(contenu, a, etat.jour)) refuser(`Un cadeau tous les ${contenu.config.affinite.jours_entre_cadeaux} jours au plus`);
      h.inventaire[action.objet]--;
      const r = reactionCadeau(contenu, action.compagnon, action.objet);
      const d = modifierAffinite(contenu, a, contenu.config.affinite.cadeau[r], { ageHeros: age(h, versDate(contenu, etat.jour).annee) });
      a.dernierCadeau = etat.jour;
      decouvrirGout(etat, action.compagnon, action.objet);
      etat.dernieresNouvelles.push(`${contenu.compagnons[action.compagnon].nom} ${({ prefere: 'adore', apprecie: 'apprécie', neutre: 'accepte poliment', deteste: 'n\'aime pas du tout' } as const)[r]} ce cadeau (${d >= 0 ? '+' : ''}${d}).`);
      break;
    }
    case 'equipe': {
      const h = herosDuJoueur(etat, action.joueur);
      if (vrai(action.compagnon)) {
        if (!etat.compagnonsRencontres.includes(action.compagnon)) refuser('Compagnon inconnu');
        if (palierCompagnon(contenu, etat, h.id, action.compagnon).index < 1) refuser('Il faut atteindre le palier « Alliée »');
        const deja = entrees(etat.equipe).find(([hid, c]) => c === action.compagnon && hid !== h.id);
        if (deja) refuser(`${contenu.compagnons[action.compagnon].nom} accompagne déjà ${etat.heros[deja[0]].nom}`);
      }
      etat.equipe[h.id] = action.compagnon;
      break;
    }
    case 'equiper': {
      const h = herosDuJoueur(etat, action.joueur);
      const o = contenu.objets[action.objet] ?? refuser('Objet inconnu');
      if (!((h.inventaire[o.id] ?? 0) > 0)) refuser('Vous n\'avez pas cet objet');
      const probleme = problemeEquipement(contenu, h, o);
      if (probleme !== undefined) refuser(probleme);
      const emplacement = o.emplacement!;
      const ancien = h.equipement[emplacement];
      if (vrai(ancien)) h.inventaire[ancien] = (h.inventaire[ancien] ?? 0) + 1;
      h.inventaire[o.id]--;
      h.equipement[emplacement] = o.id;
      break;
    }
    case 'desequiper': {
      const h = herosDuJoueur(etat, action.joueur);
      const ancien = h.equipement[action.emplacement];
      if (vrai(ancien)) { h.inventaire[ancien] = (h.inventaire[ancien] ?? 0) + 1; h.equipement[action.emplacement] = null; }
      break;
    }
    case 'acheter': {
      const h = herosDuJoueur(etat, action.joueur);
      const lieu = valeurs(contenu.regions).flatMap((r) => r.lieux).find((l) => l.id === action.lieu) ?? refuser('Lieu inconnu');
      if (!lieu.boutique.includes(action.objet)) refuser('Cet objet n\'est pas vendu ici');
      const n = quantiteValide(action.quantite);
      if (contenu.objets[action.objet]?.unique_par_partie && (n > 1 || dejaUnique(contenu, etat, action.objet))) refuser('Cet objet est unique : il n\'en existe qu\'un dans la partie');
      const prix = prixAchat(contenu, h, action.objet) * n;
      if (h.or < prix) refuser('Pas assez d\'or');
      h.or -= prix;
      h.inventaire[action.objet] = (h.inventaire[action.objet] ?? 0) + n;
      etat.dernieresNouvelles.push(`${h.nom} achète ${n > 1 ? `${n} × ` : ''}${contenu.objets[action.objet].nom} : −${prix} or.`);
      decouvrirObjet(contenu, etat, action.objet);
      declencherEtapes(contenu, etat, (d) => d.acheter === action.lieu);
      break;
    }
    case 'vendre': {
      const h = herosDuJoueur(etat, action.joueur);
      const o = contenu.objets[action.objet] ?? refuser('Objet inconnu');
      if (!((h.inventaire[o.id] ?? 0) > 0)) refuser('Vous n\'avez pas cet objet');
      if (o.type === 'quete') refuser('On ne vend pas un objet de quête');
      const n = quantiteValide(action.quantite);
      if ((h.inventaire[o.id] ?? 0) < n) refuser(`Vous n'en avez que ${h.inventaire[o.id]}`);
      const gain = prixVente(contenu, h, o.id) * n;
      h.inventaire[o.id] -= n;
      h.or += gain;
      etat.dernieresNouvelles.push(`${h.nom} vend ${n > 1 ? `${n} × ` : ''}${o.nom} : +${gain} or.`);
      declencherEtapes(contenu, etat, (d) => d.vendre === true);
      break;
    }
    case 'identifier': {
      const h = herosDuJoueur(etat, action.joueur);
      const o = contenu.objets[action.objet] ?? refuser('Objet inconnu');
      const expert = contenu.pnj[action.pnj] ?? refuser('Personnage inconnu');
      const prix = expert.identifie ?? refuser(`${expert.nom} n'identifie pas les objets`);
      if (etat.pnjMorts.includes(action.pnj)) refuser(`${expert.nom} n'est plus là`);
      if (!o.mystere) refuser("Cet objet n'a rien de mystérieux");
      if (objetConnu(contenu, etat, o.id)) refuser('Vous savez déjà ce que c\'est');
      if (h.or < prix) refuser(`Pas assez d'or : l'identification coûte ${prix} pièces`);
      h.or -= prix;
      etat.mouvementsOr.push({ heros: h.id, montant: -prix, raison: 'identification' });
      decouvrirObjet(contenu, etat, o.id);
      break;
    }
    case 'utiliser': {
      const h = herosDuJoueur(etat, action.joueur);
      if (!((h.inventaire[action.objet] ?? 0) > 0)) refuser('Vous n\'avez pas cet objet');
      if (action.objet === 'potion-soin' || action.objet === 'potion-soin-petite') refuser('Les potions se boivent en combat (les PV remontent au maximum après chaque combat)');
      refuser('Cet objet ne s\'utilise pas hors combat');
      break;
    }
    case 'repartir': {
      const h = herosDuJoueur(etat, action.joueur);
      try { repartirPoint(contenu, h, action.carac); } catch (e) { refuser((e as Error).message); }
      break;
    }
    case 'ameliorer': {
      const h = herosDuJoueur(etat, action.joueur);
      try { ameliorerCompetence(contenu, h, action.competence); } catch (e) { refuser((e as Error).message); }
      break;
    }
    case 'branche': {
      const h = herosDuJoueur(etat, action.joueur);
      try { choisirBranche(contenu, h, action.branche); } catch (e) { refuser((e as Error).message); }
      break;
    }
    case 'contrat': {
      const h = herosDuJoueur(etat, action.joueur);
      const ct = contenu.contrats[action.contrat] ?? refuser('Contrat inconnu');
      if (etat.combats[h.id]) refuser('Vous êtes déjà en combat');
      if (vrai(ct.examen_rang)) refuser('Cette épreuve se demande à la Guilde, en passant l\'examen de rang');
      if (ordreRangs.indexOf(rangHeros(etat, h.id)) < ordreRangs.indexOf(ct.rang_min)) refuser(`Contrat réservé au rang ${ct.rang_min}`);
      if (!conditionHeros(contenu, etat, ct.disponible_si, h)) refuser('Contrat indisponible');
      if (ct.etapes.length > 0) {
        // contrat à étapes : on l'accepte à la Guilde, puis on le joue sur la carte, lieu après lieu
        if (etat.contrats[h.id]) refuser(`Terminez d'abord votre contrat en cours : ${contenu.contrats[etat.contrats[h.id].id]?.titre ?? ''}`);
        etat.contrats[h.id] = { id: ct.id, etape: 0, notes: [] };
        etat.dernieresNouvelles.push(`Contrat accepté : ${ct.titre}. ${ct.etapes[0].objectif}`);
      } else if (vrai(ct.rencontre)) {
        lancerCombat(contenu, etat, ct.rencontre, h.id, { cle: h.id, origine: 'contrat', sceneCle: null, victoire: null, defaite: null, evenementDonjon: null, contrat: ct.id, bilan: null });
      } else if (ct.test) {
        const jet = de(etat.rng, 20);
        const total = jet + caracsTotales(contenu, h)[ct.test.carac];
        const msgs: string[] = [];
        if (total >= ct.test.difficulte) {
          appliquerConsequence(contenu, etat, { or: ct.recompenses.or, xp: ct.recompenses.xp, points_guilde: ct.recompenses.points_guilde, objet: ct.recompenses.objets }, [h.id], msgs);
          etat.dernieresNouvelles.push(`Contrat réussi (${ct.test.carac} : ${jet} + ${total - jet} = ${total} ≥ ${ct.test.difficulte}).`, ...msgs);
          journal(contenu, etat, `${h.nom} remplit le contrat « ${ct.titre} ».`);
        } else {
          appliquerConsequence(contenu, etat, { xp: Math.round(ct.recompenses.xp / 3) }, [h.id], msgs);
          etat.dernieresNouvelles.push(`Contrat raté (${ct.test.carac} : ${total} < ${ct.test.difficulte}). Vous en tirez quand même une leçon.`, ...msgs);
        }
      }
      break;
    }
    case 'examen_rang': {
      const h = herosDuJoueur(etat, action.joueur);
      const ex = prochainExamen(contenu, etat, h.id) ?? refuser('Vous avez déjà le rang le plus haut');
      if (!ex.pret) refuser(ex.raison);
      const def = contenu.config.guilde.rangs.find((r) => r.rang === ex.rang)!.examen!;
      if (def.type === 'epreuve') {
        const ct = contenu.contrats[def.contrat ?? ''] ?? refuser('Épreuve introuvable');
        etat.contrats[h.id] = { id: ct.id, etape: 0, notes: [] };
        etat.dernieresNouvelles.push(`Épreuve du rang ${ex.rang} : ${ct.titre}. ${ct.etapes[0].objectif}`);
        break;
      }
      if (etat.combats.groupe || etat.combats[h.id]) refuser('Un combat est en cours');
      if (etat.scenes.groupe && etat.scenes.groupe.noeud !== '__fin__') refuser('Une scène de groupe est en cours');
      if (etat.donjon) refuser('Le groupe est dans un donjon');
      if (etat.tempsLibre && !etat.tempsLibre.resultats) refuser('Terminez d\'abord le temps libre');
      // les héros présents et prêts pour le même rang passent l'examen ensemble (difficulté de groupe habituelle)
      const candidats = candidatsExamen(contenu, etat, h.id).filter((id) => !etat.combats[id]);
      etat.dernieresNouvelles.push(`Examen du rang ${ex.rang} : ${candidats.map((id) => etat.heros[id].nom).join(', ')} ${candidats.length > 1 ? 'entrent' : 'entre'} dans l'arène d'entraînement.`);
      lancerCombat(contenu, etat, def.rencontre!, 'groupe', { cle: 'groupe', origine: 'examen', sceneCle: null, victoire: null, defaite: null, evenementDonjon: null, contrat: null, bilan: null, examen: { rang: ex.rang, heros: candidats } }, null, candidats);
      break;
    }
    case 'etape_contrat': {
      const h = herosDuJoueur(etat, action.joueur);
      const x = etapeContrat(contenu, etat, h.id) ?? refuser('Vous n\'avez pas de contrat en cours');
      const st = etat.contrats[h.id];
      const e = x.etape;
      if (etat.combats[h.id]) refuser('Vous êtes déjà en combat');
      if (vrai(e.combat)) {
        st.notes = [];
        lancerCombat(contenu, etat, e.combat, h.id, { cle: h.id, origine: 'contrat', sceneCle: null, victoire: null, defaite: null, evenementDonjon: null, contrat: x.contrat.id, bilan: null }, e.lieu);
        break;
      }
      if (e.test) {
        const jet = de(etat.rng, 20);
        const total = jet + caracsTotales(contenu, h)[e.test.carac];
        const detail = `${e.test.carac} : dé ${jet} + ${total - jet} = ${total} contre ${e.test.difficulte}`;
        if (jet === 20 || (jet !== 1 && total >= e.test.difficulte)) {
          st.notes = [`Réussi (${detail}). ${e.test.reussite}`];
          avancerContrat(contenu, etat, h);
        } else {
          const msgs: string[] = [];
          appliquerConsequence(contenu, etat, { xp: Math.round(x.contrat.recompenses.xp / 3) }, [h.id], msgs);
          delete etat.contrats[h.id];
          etat.dernieresNouvelles.push(`Contrat raté (${detail}). ${e.test.echec} Vous en tirez quand même une leçon.`, ...msgs);
        }
        break;
      }
      if (e.choix.length > 0) {
        const ch = e.choix[action.choix ?? -1] ?? refuser('Choisissez une des réponses proposées');
        const msgs: string[] = [];
        for (const eff of ch.effets) appliquerConsequence(contenu, etat, eff, [h.id], msgs);
        st.notes = vrai(ch.resultat) ? [ch.resultat, ...msgs] : msgs;
        avancerContrat(contenu, etat, h);
        break;
      }
      st.notes = [];
      avancerContrat(contenu, etat, h);
      break;
    }
    case 'abandonner_contrat': {
      const h = herosDuJoueur(etat, action.joueur);
      if (!etat.contrats[h.id]) refuser('Vous n\'avez pas de contrat en cours');
      if (etat.combats[h.id]) refuser('Terminez d\'abord le combat');
      delete etat.contrats[h.id];
      break;
    }
    case 'meneur':
      if (!etat.joueurs[action.nouveau]) refuser('Joueur inconnu');
      etat.meneur = action.nouveau;
      break;
    case 'nouvelle_session': {
      etat.session++;
      const idx = etat.ordreJoueurs.indexOf(etat.meneur ?? '');
      etat.meneur = etat.ordreJoueurs[(idx + 1) % etat.ordreJoueurs.length] ?? null;
      journal(contenu, etat, `Session ${etat.session} : ${etat.joueurs[etat.meneur ?? '']?.pseudo ?? '?'} est le meneur du jour.`);
      break;
    }
    case 'fusionner': {
      const h = herosDuJoueur(etat, action.joueur);
      const id = idFusion(action.parent, action.secondaire);
      let t = h.grimoire[id];
      if (!t) {
        const r = creerTechnique(contenu, action.parent, action.secondaire, h.nom);
        if (!r.ok) refuser(r.raison);
        t = (r as { ok: true; technique: Technique }).technique;
      }
      const connue = (h.variantes[t.parent] ?? []).includes(t.id);
      if (!connue) {
        const pb = peutApprendre(contenu, h, t);
        if (vrai(pb)) refuser(pb);
      }
      // en combat : il faut que ce soit le tour du héros
      const entree = vrai(action.cle) ? etat.combats[action.cle] : undefined;
      const acteur = entree?.combat.combattants.find((c) => c.herosId === h.id && c.type === 'heros');
      if (vrai(action.cle) && (!entree || !acteur || entree.combat.enAttente !== acteur.id)) refuser('Ce n\'est pas votre tour');
      // grimoire personnel et privé : rien n'est écrit dans le journal commun
      if (!h.grimoire[id]) h.grimoire[id] = t;
      if (!connue) apprendre(h, t); else h.varianteActive[t.parent] = t.id;
      if (entree && acteur) {
        // la variante remplace la compétence de base pour la suite du combat
        acteur.competences = acteur.competences.filter((k) => k.id !== t.parent);
        if (!acteur.competencesPropres.some((k) => k.id === t.id)) acteur.competencesPropres.push({ ...t });
        acteur.compteurs[`rang:${t.id}`] = h.rangsCompetences[t.parent] ?? 1;
        try { jouerAction(contenu, entree.combat, etat.rng, { type: 'competence', acteur: acteur.id, competence: t.id, cible: action.cible }); }
        catch (e) { refuser((e as Error).message); }
        if (entree.combat.resultat) terminerCombat(contenu, etat, action.cle!);
      }
      break;
    }
    case 'apprendre_technique': {
      const h = herosDuJoueur(etat, action.joueur);
      // À la Guilde, on n'apprend que les fusions de SES compétences (sa classe, ses rangs)
      let t: Technique | null = null;
      const connues = connuesDe(contenu, h);
      for (const a of connues) for (const b of connues) {
        if (t === null && a !== b && idFusion(a, b) === action.technique) {
          const r = creerTechnique(contenu, a, b, h.nom);
          if (!r.ok) refuser(r.raison);
          t = (r as { ok: true; technique: Technique }).technique;
        }
      }
      if (t === null) return refuser('Votre classe ne peut pas apprendre cette fusion');
      const pb = peutApprendre(contenu, h, t);
      if (vrai(pb)) refuser(pb);
      apprendre(h, t);
      h.grimoire[t.id] = t;
      break;
    }
    case 'oublier_variante': {
      const h = herosDuJoueur(etat, action.joueur);
      const t = h.grimoire[action.technique] ?? refuser('Technique inconnue');
      h.variantes[t.parent] = (h.variantes[t.parent] ?? []).filter((x) => x !== t.id);
      if (h.varianteActive[t.parent] === t.id) h.varianteActive[t.parent] = null;
      delete h.grimoire[t.id];
      break;
    }
    case 'variante_active': {
      const h = herosDuJoueur(etat, action.joueur);
      if (vrai(action.technique) && !(h.variantes[action.competence] ?? []).includes(action.technique)) refuser('Variante non apprise');
      h.varianteActive[action.competence] = action.technique;
      break;
    }
    case 'equiper_competences': {
      const h = herosDuJoueur(etat, action.joueur);
      const max = contenu.config.personnage.competences_equipees_max;
      if (action.competences.length > max) refuser(`${max} compétences équipées au maximum`);
      const connues = competencesConnues(contenu, h);
      if (action.competences.some((c) => !connues.includes(c))) refuser('Compétence non connue');
      h.equipees = [...new Set(action.competences)];
      break;
    }
    case 'chapitre_suivant':
      if (!vrai(etat.finChapitre)) refuser('Le chapitre n\'est pas terminé');
      etat.finChapitre = null;
      break;
  }
  etat.numeroAction++;
  return etat;
}

/**
 * Ancienne partie (grimoire partagé) : chaque fusion va au héros qui l'a apprise ;
 * si personne ne l'a apprise, à tous les héros qui pourraient l'utiliser.
 */
function repartirAncienGrimoire(contenu: Contenu, etat: EtatPartie) {
  for (const t of valeurs(etat.grimoire ?? {})) {
    const heros = valeurs(etat.heros);
    const appris = heros.filter((h) => (h.variantes[t.parent] ?? []).includes(t.id));
    const cibles = appris.length > 0 ? appris : heros.filter((h) => peutApprendre(contenu, h, t) === null);
    for (const h of cibles) h.grimoire[t.id] = t;
  }
  delete etat.grimoire;
}

/** Étape en cours du contrat d'un héros (null s'il n'a pas de contrat). */
export function etapeContrat(contenu: Contenu, etat: EtatPartie, herosId: string) {
  const st = etat.contrats?.[herosId];
  if (!st) return null;
  const ct = contenu.contrats[st.id];
  if (!ct || st.etape >= ct.etapes.length) return null;
  return { contrat: ct, etape: ct.etapes[st.etape], numero: st.etape + 1, total: ct.etapes.length, notes: st.notes, derniere: st.etape === ct.etapes.length - 1 };
}

/** Passe à l'étape suivante ; après la dernière (retour à la Guilde), donne la récompense. */
function avancerContrat(contenu: Contenu, etat: EtatPartie, h: Heros) {
  const st = etat.contrats[h.id];
  const ct = contenu.contrats[st.id];
  st.etape++;
  if (st.etape < ct.etapes.length) {
    etat.dernieresNouvelles.push(`Contrat « ${ct.titre} » : ${ct.etapes[st.etape].objectif}`);
    return;
  }
  const msgs: string[] = [];
  appliquerConsequence(contenu, etat, { or: ct.recompenses.or, xp: ct.recompenses.xp, points_guilde: ct.recompenses.points_guilde, objet: ct.recompenses.objets }, [h.id], msgs);
  delete etat.contrats[h.id];
  if (vrai(ct.examen_rang)) {
    etat.dernieresNouvelles.push(`Épreuve réussie : ${ct.titre}.`, ...msgs, promouvoir(contenu, etat, h, ct.examen_rang));
    return;
  }
  etat.dernieresNouvelles.push(`Contrat rempli : ${ct.titre}.`, ...msgs);
  journal(contenu, etat, `${h.nom} remplit le contrat « ${ct.titre} ».`);
}

function quantiteValide(q: number | undefined): number {
  if (q === undefined) return 1;
  if (q < 1 || q > 99 || Math.floor(q) !== q) refuser('Quantité invalide (de 1 à 99)');
  return q;
}

/** Fait avancer les quêtes dont l'étape en cours se valide par une action (acheter, vendre…). */
function declencherEtapes(contenu: Contenu, etat: EtatPartie, correspond: (d: { acheter?: string; vendre?: boolean }) => boolean) {
  for (const [id, q] of entrees(etat.quetes)) {
    const def = contenu.quetes[id];
    if (!def || q.terminee) continue;
    const i = def.etapes.findIndex((e) => e.id === q.etape);
    if (i < 0 || i + 1 >= def.etapes.length) continue;
    const d = def.etapes[i].declencheur;
    if (!d || !correspond(d)) continue;
    q.etape = def.etapes[i + 1].id;
    etat.dernieresNouvelles.push(`Quête « ${def.titre} » : ${def.etapes[i + 1].objectif}`);
  }
}

function resoudreVote(contenu: Contenu, etat: EtatPartie) {
  const es = etat.scenes.groupe;
  const comptes = new Map<number, string[]>();
  for (const [joueur, idx] of entrees(es.votes)) comptes.set(idx, [...(comptes.get(idx) ?? []), joueur]);
  let meilleur = -1, max = -1;
  for (const [idx, v] of comptes) {
    if (v.length > max || (v.length === max && vrai(etat.meneur) && v.includes(etat.meneur))) { meilleur = idx; max = v.length; }
  }
  resoudreChoix(contenu, etat, 'groupe', meilleur, comptes.get(meilleur) ?? []);
}

export function prixAchat(contenu: Contenu, h: Heros, objet: string): number {
  const p = contenu.objets[objet].prix;
  const r = contenu.races[h.race].trait.parametres.prix ?? 0;
  return Math.max(1, Math.round(p * (1 + r)));
}
export function prixVente(contenu: Contenu, h: Heros, objet: string): number {
  const p = contenu.objets[objet].prix;
  return Math.max(0, Math.floor(p * (h.don === 'reserve-du-neant' ? 0.6 : 0.5)));
}

/** Rejoue une liste d'actions ; les actions invalides sont ignorées (et signalées). */
export function rejouer(contenu: Contenu, depart: EtatPartie, actions: Action[]): { etat: EtatPartie; erreurs: { index: number; message: string }[] } {
  let etat = depart;
  const erreurs: { index: number; message: string }[] = [];
  actions.forEach((a, i) => {
    try { etat = appliquer(contenu, etat, a); } catch (e) {
      if (e instanceof ErreurAction) erreurs.push({ index: i, message: e.message });
      else throw e;
    }
  });
  return { etat, erreurs };
}

export function moisRestants(contenu: Contenu, etat: EtatPartie): number {
  return etat.tempsLibre ? etat.tempsLibre.mois : 0;
}

export { formaterDate, versDate };

/** Objet « unique par partie » (armes mythiques) dont un exemplaire existe déjà chez un héros. */
function dejaUnique(contenu: Contenu, etat: EtatPartie, objet: string): boolean {
  return contenu.objets[objet]?.unique_par_partie === true && exemplaires(listeHeros(etat), objet) > 0;
}
