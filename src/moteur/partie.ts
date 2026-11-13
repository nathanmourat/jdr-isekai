/**
 * État d'une partie et application des actions des joueurs.
 *
 * Principe : l'état de la partie = la suite de toutes les actions, rejouées dans l'ordre.
 * `appliquer` ne fait jamais appel à l'heure ni au hasard du navigateur : tout passe par le Rng de la partie.
 * Ainsi, chaque joueur obtient exactement le même état en rejouant la même liste d'actions.
 */
import type { Contenu } from '../contenu/charger';
import type { Choix, Condition, Consequence, Noeud, Scene } from '../contenu/schemas';
import { affiniteVide, modifierAffinite, palier, paliersAtteints, pardonner, peutOffrir, reactionCadeau, verifierLignesRouges, type Affinite } from './affinite';
import {
  annulerTour, avancer, combattantCompagnon, combattantHeros, demarrerCombat, jouerAction, recompensesCombat,
  type ActionCombat, type Combat, type Combattant,
} from './combat';
import {
  age, ameliorerCompetence, caracsTotales, choisirBranche, creerHeros, gagnerXp, niveauMoyen, repartirPoint,
  xpPourNiveau, type Carac, type Heros, type OptionsCreation,
} from './personnage';
import { creerRng, de, type Rng } from './rng';
import { anneeDepart, chapitreDe, fetesEntre, formaterDate, joursParMois, versDate, versJour } from './temps';

export const VERSION_ETAT = 1;
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
}

export interface ContexteCombat {
  cle: string;               // 'groupe' ou id du héros (combat individuel)
  origine: 'scene' | 'donjon' | 'contrat';
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
}

export interface TempsLibre {
  titre: string;
  jusqua: number;
  mois: number;
  choix: Record<string, { activite: string; compagnon?: string }[]>;
  resultats: Record<string, string[]> | null;
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
  journal: EntreeJournal[];
  secondDepart: Record<string, number>;
  dernieresNouvelles: string[];
  finChapitre: number | null;
}

export type Action =
  | { type: 'rejoindre'; joueur: string; pseudo: string }
  | { type: 'presence'; joueur: string; present: boolean }
  | { type: 'creer_heros'; joueur: string; heros: Omit<OptionsCreation, 'id' | 'joueurId' | 'anneeCampagne' | 'niveau'> }
  | { type: 'portrait'; joueur: string; image: string | null }
  | { type: 'si_absent'; joueur: string; mode: 'ia' | 'camp' }
  | { type: 'lancer_scene'; joueur: string; scene: string }
  | { type: 'choisir'; joueur: string; cle: string; index: number }
  | { type: 'trancher'; joueur: string; cle: string }
  | { type: 'continuer'; joueur: string; cle: string }
  | { type: 'quitter_scene'; joueur: string; cle: string }
  | { type: 'combat'; joueur: string; cle: string; action: ActionCombat }
  | { type: 'second_depart'; joueur: string; cle: string }
  | { type: 'fin_combat'; joueur: string; cle: string }
  | { type: 'donjon_deplacer'; joueur: string; dx: number; dy: number }
  | { type: 'temps_libre'; joueur: string; activites: { activite: string; compagnon?: string }[] }
  | { type: 'valider_temps_libre'; joueur: string }
  | { type: 'cadeau'; joueur: string; compagnon: string; objet: string }
  | { type: 'equipe'; joueur: string; compagnon: string | null }
  | { type: 'equiper'; joueur: string; objet: string }
  | { type: 'desequiper'; joueur: string; emplacement: 'arme' | 'armure' | 'accessoire' }
  | { type: 'acheter'; joueur: string; objet: string; lieu: string }
  | { type: 'vendre'; joueur: string; objet: string }
  | { type: 'utiliser'; joueur: string; objet: string }
  | { type: 'repartir'; joueur: string; carac: Carac }
  | { type: 'ameliorer'; joueur: string; competence: string }
  | { type: 'branche'; joueur: string; branche: string }
  | { type: 'contrat'; joueur: string; contrat: string }
  | { type: 'meneur'; joueur: string; nouveau: string }
  | { type: 'nouvelle_session'; joueur: string }
  | { type: 'chapitre_suivant'; joueur: string };

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
    journal: [{ jour: 0, chapitre: 1, texte: `Printemps ${anneeDepart(contenu)} AV : la partie « ${nom} » commence.` }],
    secondDepart: {},
    dernieresNouvelles: [],
    finChapitre: null,
  };
}

// ───────────────────────────── Outils ─────────────────────────────

export function herosDuJoueur(etat: EtatPartie, joueur: string): Heros {
  const j = etat.joueurs[joueur] ?? refuser('Joueur inconnu');
  return etat.heros[j.herosId ?? ''] ?? refuser("Ce joueur n'a pas encore de héros");
}

export function listeHeros(etat: EtatPartie): Heros[] {
  return etat.ordreJoueurs.map((j) => etat.joueurs[j].herosId).filter((x): x is string => !!x).map((h) => etat.heros[h]);
}

function journal(contenu: Contenu, etat: EtatPartie, texte: string) {
  etat.journal.push({ jour: etat.jour, chapitre: etat.chapitre, texte: `${formaterDate(contenu, etat.jour)} — ${texte}` });
  etat.dernieresNouvelles.push(texte);
}

export function aFlag(etat: EtatPartie, flag: string, herosId?: string): boolean {
  return !!etat.flags[flag] || (!!herosId && !!etat.flags[`${herosId}:${flag}`]);
}

export function affinite(etat: EtatPartie, herosId: string, compagnon: string): Affinite {
  etat.affinites[herosId] ??= {};
  return (etat.affinites[herosId][compagnon] ??= affiniteVide());
}

export function queteTerminee(etat: EtatPartie, q: string | undefined): boolean {
  return !!q && !!etat.quetes[q]?.terminee;
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

// ───────────────────────────── Conditions ─────────────────────────────

/** Une condition sur un héros précis (scènes individuelles, dialogues). */
export function conditionHeros(contenu: Contenu, etat: EtatPartie, c: Condition | undefined, h: Heros | null): boolean {
  if (!c) return true;
  const liste = (v?: string | string[]) => (v === undefined ? null : Array.isArray(v) ? v : [v]);
  if (c.flag && !aFlag(etat, c.flag, h?.id)) return false;
  if (c.pas_flag && aFlag(etat, c.pas_flag, h?.id)) return false;
  for (const [q, et] of Object.entries(c.quete_etape ?? {})) if (etat.quetes[q]?.etape !== et) return false;
  if (c.quete_terminee && !etat.quetes[c.quete_terminee]?.terminee) return false;
  for (const [f, v] of Object.entries(c.reputation_min ?? {})) if ((etat.reputation[f] ?? 0) < v) return false;
  if (c.date_min && etat.jour < versJour(contenu, c.date_min)) return false;
  if (c.ou && !c.ou.some((x) => conditionHeros(contenu, etat, x, h))) return false;
  const besoinHeros = c.race || c.classe || c.origine || c.don || c.affinite_min || c.affinite_palier || c.carac_min || c.niveau_min !== undefined || c.or_min !== undefined || c.objet || c.rang_guilde_min;
  if (!besoinHeros) return true;
  if (!h) return false;
  const races = liste(c.race); if (races && !races.includes(h.race)) return false;
  const classes = liste(c.classe); if (classes && !classes.includes(h.classe)) return false;
  if (c.origine && h.origine !== c.origine) return false;
  if (c.don && h.don !== c.don) return false;
  for (const [co, v] of Object.entries(c.affinite_min ?? {})) if (affinite(etat, h.id, co).points < v) return false;
  for (const [co, p] of Object.entries(c.affinite_palier ?? {})) {
    const ps = contenu.config.affinite.paliers.map((x) => x.id);
    if (palierCompagnon(contenu, etat, h.id, co).index < ps.indexOf(p)) return false;
  }
  const ca = caracsTotales(contenu, h);
  for (const [k, v] of Object.entries(c.carac_min ?? {})) if (ca[k as Carac] < (v ?? 0)) return false;
  if (c.niveau_min !== undefined && h.niveau < c.niveau_min) return false;
  if (c.or_min !== undefined && h.or < c.or_min) return false;
  if (c.objet && !(h.inventaire[c.objet] > 0)) return false;
  if (c.rang_guilde_min && ordreRangs.indexOf(rangGuilde(contenu, etat.pointsGuilde[h.id] ?? 0)) < ordreRangs.indexOf(c.rang_guilde_min)) return false;
  return true;
}

/** Une condition dans une scène : vraie si au moins un héros participant la remplit. */
export function conditionScene(contenu: Contenu, etat: EtatPartie, c: Condition | undefined, heros: string[]): boolean {
  if (!c) return true;
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
  if (eff.retirer_flag) delete etat.flags[eff.retirer_flag];
  for (const [f, v] of Object.entries(eff.reputation ?? {})) {
    etat.reputation[f] = Math.max(-100, Math.min(100, (etat.reputation[f] ?? 0) + v));
    messages.push(`Réputation ${nomFaction(f)} ${v > 0 ? '+' : ''}${v}`);
  }
  for (const [co, v] of Object.entries(eff.affinite ?? {})) {
    for (const h of hs) {
      const bonus = (contenu.races[h.race].trait.parametres.affinite_dialogue ?? 0) + (contenu.dons[h.don].parametres.affinite_dialogue ?? 0);
      const d = modifierAffinite(contenu, affinite(etat, h.id, co), v, { ageHeros: age(h, versDate(contenu, etat.jour).annee), bonusDialogue: bonus });
      if (d !== 0) messages.push(`${contenu.compagnons[co].nom} : affinité ${d > 0 ? '+' : ''}${d} (${h.nom})`);
    }
  }
  if (eff.xp) for (const h of hs) { const n = gagnerXp(contenu, h, eff.xp); messages.push(`${h.nom} gagne ${eff.xp} XP${n ? ` et monte au niveau ${h.niveau} !` : ''}`); }
  if (eff.or) for (const h of hs) { h.or = Math.max(0, h.or + eff.or); messages.push(`${h.nom} ${eff.or > 0 ? 'gagne' : 'perd'} ${Math.abs(eff.or)} pièces d'or`); }
  for (const o of liste(eff.objet)) {
    const h = hs[0];
    if (h) { h.inventaire[o] = (h.inventaire[o] ?? 0) + 1; messages.push(`${h.nom} obtient : ${contenu.objets[o].nom}`); }
  }
  if (eff.retirer_objet) for (const h of hs) if (h.inventaire[eff.retirer_objet]) { h.inventaire[eff.retirer_objet]--; break; }
  if (eff.points_guilde) for (const h of hs) {
    const avant = rangGuilde(contenu, etat.pointsGuilde[h.id] ?? 0);
    etat.pointsGuilde[h.id] = (etat.pointsGuilde[h.id] ?? 0) + eff.points_guilde;
    const apres = rangGuilde(contenu, etat.pointsGuilde[h.id]);
    messages.push(`${h.nom} : +${eff.points_guilde} points de guilde${apres !== avant ? ` — nouveau rang ${apres} !` : ''}`);
  }
  if (eff.quete) {
    const neuve = !etat.quetes[eff.quete.id];
    etat.quetes[eff.quete.id] = { etape: eff.quete.etape, terminee: false };
    const q = contenu.quetes[eff.quete.id];
    if (neuve) { journal(contenu, etat, `Nouvelle quête : ${q.titre}.`); messages.push(`Nouvelle quête : ${q.titre}`); }
    else messages.push(`Quête mise à jour : ${q.titre}`);
  }
  if (eff.terminer_quete) {
    etat.quetes[eff.terminer_quete] = { etape: etat.quetes[eff.terminer_quete]?.etape ?? 'fin', terminee: true };
    const q = contenu.quetes[eff.terminer_quete];
    journal(contenu, etat, `Quête terminée : ${q.titre}.`);
    messages.push(`Quête terminée : ${q.titre}`);
  }
  if (eff.recruter && !etat.compagnonsRencontres.includes(eff.recruter)) {
    etat.compagnonsRencontres.push(eff.recruter);
    const nom = contenu.compagnons[eff.recruter].nom;
    journal(contenu, etat, `${nom} croise la route du groupe.`);
    messages.push(`${nom} peut désormais accompagner un héros (palier « Alliée » requis).`);
  }
  if (eff.pnj_mort && !etat.pnjMorts.includes(eff.pnj_mort)) {
    etat.pnjMorts.push(eff.pnj_mort);
    etat.flags[`mort:${eff.pnj_mort}`] = true;
    journal(contenu, etat, `${contenu.pnj[eff.pnj_mort]?.nom ?? eff.pnj_mort} a perdu la vie.`);
  }
  for (const h of hs) {
    if (eff.atout) h.atout = eff.atout;
    if (eff.origine_enfance) h.origineEnfance = eff.origine_enfance;
    if (eff.contact && !h.contacts.includes(eff.contact)) h.contacts.push(eff.contact);
  }
  if (eff.journal) journal(contenu, etat, remplacerVariables(contenu, etat, eff.journal, heros));
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
  if (eff.fin_chapitre) { etat.finChapitre = eff.fin_chapitre; journal(contenu, etat, `Fin du chapitre ${eff.fin_chapitre}.`); }
  // Lignes rouges des compagnons
  for (const h of hs) for (const co of Object.keys(contenu.compagnons)) {
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

export function nomFaction(f: string): string {
  return ({ couronne: 'Couronne', guilde: 'Guilde', concorde: 'Concorde', ordre: 'Ordre' } as Record<string, string>)[f] ?? f;
}

export function remplacerVariables(contenu: Contenu, etat: EtatPartie, texte: string, heros: string[]): string {
  const noms = heros.map((h) => etat.heros[h]?.nom).filter(Boolean);
  const listeNoms = noms.length <= 1 ? noms[0] ?? 'le héros' : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
  const meneur = etat.meneur && etat.joueurs[etat.meneur]?.herosId ? etat.heros[etat.joueurs[etat.meneur].herosId!].nom : noms[0] ?? '';
  const h0 = heros[0] ? etat.heros[heros[0]] : null;
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
  if (!s.repetable && etat.scenesVues.includes(s.id)) return false;
  if (s.type === 'individuel') {
    if (!herosId) return false;
    if (!s.repetable && etat.scenesVues.includes(`${s.id}@${herosId}`)) return false;
    return conditionHeros(contenu, etat, s.disponible_si, etat.heros[herosId]);
  }
  return conditionScene(contenu, etat, s.disponible_si, listeHeros(etat).map((h) => h.id));
}

/** Scènes que l'on peut lancer dans un lieu (ou partout si lieu = null). */
export function scenesDisponibles(contenu: Contenu, etat: EtatPartie, lieu: string | null, herosId: string | null): Scene[] {
  return Object.values(contenu.scenes).filter((s) => (lieu === null ? !s.lieu : s.lieu === lieu) && sceneEstDisponible(contenu, etat, s, herosId));
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
  for (const eff of n.effets) appliquerConsequence(contenu, etat, eff, es.heros, es.messages);
  if (n.combat) {
    lancerCombat(contenu, etat, n.combat.rencontre, cle === 'groupe' ? 'groupe' : cle, { cle: cle === 'groupe' ? 'groupe' : cle, origine: 'scene', sceneCle: cle, victoire: n.combat.victoire, defaite: n.combat.defaite, evenementDonjon: null, contrat: null, bilan: null });
  } else if (n.donjon) {
    const d = contenu.donjons[n.donjon.id];
    etat.donjon = { id: d.id, x: d.depart.x, y: d.depart.y, faits: [], sceneCle: cle, sortie: n.donjon.sortie, messages: [`Le groupe entre dans : ${d.nom}.`], vus: [] };
    reveler(etat, d.depart.x, d.depart.y);
  } else if (n.fin) {
    terminerScene(contenu, etat, cle);
  }
}

function terminerScene(contenu: Contenu, etat: EtatPartie, cle: string) {
  const es = etat.scenes[cle];
  const s = contenu.scenes[es.sceneId];
  if (!s.repetable) etat.scenesVues.push(s.type === 'individuel' ? `${s.id}@${es.heros[0]}` : s.id);
  // une scène individuelle non répétable est « vue » pour ce héros seulement
  es.noeud = '__fin__';
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
  const herosVotants = votants.map((j) => etat.joueurs[j]?.herosId).filter((h): h is string => !!h && es.heros.includes(h));
  const msgs: string[] = [];
  for (const eff of ch.effets) {
    // affinité et drapeaux personnels (« heros:… ») : seulement pour ceux qui ont voté ce choix
    const { affinite: aff, flag, ...reste } = eff;
    const flags = flag === undefined ? [] : Array.isArray(flag) ? flag : [flag];
    const perso = flags.filter((f) => f.startsWith('heros:'));
    const communs = flags.filter((f) => !f.startsWith('heros:'));
    appliquerConsequence(contenu, etat, { ...reste, flag: communs }, es.heros, msgs);
    if (aff || perso.length) appliquerConsequence(contenu, etat, { affinite: aff, flag: perso }, herosVotants.length ? herosVotants : es.heros, msgs);
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

function lancerCombat(contenu: Contenu, etat: EtatPartie, rencontre: string, cle: string, contexte: ContexteCombat) {
  const herosIds = cle === 'groupe' ? participantsGroupe(etat) : [cle];
  if (herosIds.length === 0) refuser('Aucun héros disponible pour combattre');
  const allies: Combattant[] = [];
  for (const id of herosIds) {
    const h = etat.heros[id];
    const present = etat.joueurs[h.joueurId]?.present ?? false;
    allies.push(combattantHeros(contenu, h, present));
    const co = etat.equipe[id];
    if (co && etat.compagnonsRencontres.includes(co)) {
      const p = paliersAtteints(contenu, affinite(etat, id, co), queteTerminee(etat, contenu.compagnons[co].quete));
      if (p.includes('alliee')) allies.push(combattantCompagnon(contenu, co, h, p));
    }
  }
  const combat = demarrerCombat(contenu, rencontre, allies, etat.rng, `${cle}:${etat.numeroAction}`);
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
    if (utilisees) h.inventaire['potion-soin-petite'] = Math.max(0, (h.inventaire['potion-soin-petite'] ?? 0) - utilisees);
  }
  if (combat.resultat === 'victoire') {
    const r = recompensesCombat(contenu, combat, etat.rng);
    for (const h of heros) {
      const n = gagnerXp(contenu, h, r.xpParHeros);
      h.or += r.orParHeros;
      bilan.push(`${h.nom} : +${r.xpParHeros} XP, +${r.orParHeros} or${n ? ` — niveau ${h.niveau} !` : ''}`);
    }
    r.objets.forEach((o, i) => {
      const h = heros[i % heros.length];
      h.inventaire[o] = (h.inventaire[o] ?? 0) + 1;
      bilan.push(`${h.nom} récupère : ${contenu.objets[o].nom}`);
    });
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
  if (contexte.origine === 'scene' && contexte.sceneCle && etat.scenes[contexte.sceneCle]) {
    entrerNoeud(contenu, etat, contexte.sceneCle, (victoire ? contexte.victoire : contexte.defaite)!);
    etat.scenes[contexte.sceneCle].messages.unshift(...(contexte.bilan ?? []));
  } else if (contexte.origine === 'donjon' && etat.donjon) {
    if (victoire && contexte.evenementDonjon) etat.donjon.faits.push(contexte.evenementDonjon);
    etat.donjon.messages = [...(contexte.bilan ?? [])];
    if (!victoire) {
      // défaite ou fuite : le groupe se retrouve à l'entrée (mort douce) ; les combats déjà gagnés restent gagnés
      const d = etat.donjon;
      const msg = combat.resultat === 'defaite'
        ? [...(contexte.bilan ?? []), 'Vous reprenez connaissance près de l\'escalier d\'entrée. Les ennemis vaincus ne se relèveront pas.']
        : ['Le groupe se replie vers l\'entrée.'];
      etat.donjon = { ...d, x: contenu.donjons[d.id].depart.x, y: contenu.donjons[d.id].depart.y, messages: msg };
    }
  } else if (contexte.origine === 'contrat' && contexte.contrat) {
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
  if (!ligne || x < 0 || x >= ligne.length) return 'vide';
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
  if (Object.keys(etat.combats).includes('groupe')) refuser('Un combat est en cours');
  if (Math.abs(dx) + Math.abs(dy) !== 1) refuser('Déplacement d\'une case à la fois');
  const nx = dj.x + dx, ny = dj.y + dy;
  const t = caseDonjon(contenu, dj.id, nx, ny);
  const d = contenu.donjons[dj.id];
  const ev = d.evenements.find((e) => e.x === nx && e.y === ny && !(e.unique && dj.faits.includes(e.id)) && conditionScene(contenu, etat, e.si, participantsGroupe(etat)));
  if (INFRANCHISSABLE.some((m) => t.startsWith(m))) {
    if (ev?.type === 'texte' && ev.texte) dj.messages = [ev.texte];
    else refuser('Passage bloqué');
    return;
  }
  if (t.startsWith('porte-verrouillee') && !listeHeros(etat).some((h) => h.inventaire['cle-crypte'])) {
    dj.messages = ['Une lourde porte de bronze, verrouillée. Il faudrait une clé.'];
    return;
  }
  dj.x = nx; dj.y = ny;
  dj.messages = [];
  reveler(etat, nx, ny);
  if (!ev) return;
  const heros = participantsGroupe(etat);
  switch (ev.type) {
    case 'combat':
      lancerCombat(contenu, etat, ev.rencontre!, 'groupe', { cle: 'groupe', origine: 'donjon', sceneCle: dj.sceneCle, victoire: null, defaite: null, evenementDonjon: ev.id, contrat: null, bilan: null });
      if (ev.texte) dj.messages.push(ev.texte);
      return;
    case 'coffre': {
      dj.faits.push(ev.id);
      const msgs: string[] = [ev.texte ?? 'Un coffre !'];
      if (ev.or) appliquerConsequence(contenu, etat, { or: Math.round(ev.or / Math.max(1, heros.length)) }, heros, msgs);
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
      if (g.xp_pourcent_niveau) { const xp = Math.round(xpPourNiveau(contenu, h.niveau) * g.xp_pourcent_niveau * f); const n = gagnerXp(contenu, h, xp); r.push(`${a.nom} : +${xp} XP${n ? ` (niveau ${h.niveau} !)` : ''}`); }
      if (g.carac_plus_un) { h.pointsCaracDispo += 1; r.push(`${a.nom} : +1 point de caractéristique à répartir`); }
      let or = g.or_base * f;
      if (g.or_par_carac) or += caracsTotales(contenu, h)[g.or_par_carac.carac] * g.or_par_carac.valeur * f;
      if (or) { h.or += Math.round(or); r.push(`${a.nom} : +${Math.round(or)} or`); }
      if (g.points_guilde) { const p = Math.round(g.points_guilde * f); etat.pointsGuilde[h.id] = (etat.pointsGuilde[h.id] ?? 0) + p; r.push(`${a.nom} : +${p} points de guilde (rang ${rangGuilde(contenu, etat.pointsGuilde[h.id])})`); }
      if (g.objet_artisanat) {
        const n = Math.max(1, Math.round(f * (1 + (h.don === 'main-de-l-artisan' ? 1 : 0) + (h.classe === 'alchimiste' ? 1 : 0))));
        h.inventaire['potion-soin'] = (h.inventaire['potion-soin'] ?? 0) + n;
        r.push(`${a.nom} : ${n} potion(s) de soin fabriquée(s)`);
      }
      if (g.affinite && choix.compagnon) {
        const d = modifierAffinite(contenu, affinite(etat, h.id, choix.compagnon), Math.round(g.affinite * Math.max(1, f)), { ageHeros: age(h, versDate(contenu, tl.jusqua).annee) });
        r.push(`${a.nom} avec ${contenu.compagnons[choix.compagnon].nom} : affinité +${d}`);
      }
      if (g.affinite_tous) for (const co of etat.compagnonsRencontres) modifierAffinite(contenu, affinite(etat, h.id, co), g.affinite_tous, { ageHeros: age(h, versDate(contenu, tl.jusqua).annee) });
      if (g.soigne_blessure) { h.blessure = false; r.push(`${a.nom} : blessures guéries`); }
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
  const etat = structuredClone(etatAvant);
  etat.dernieresNouvelles = [];
  const j = etat.joueurs[action.joueur];
  if (action.type !== 'rejoindre' && !j) refuser('Joueur inconnu : rejoignez la partie d\'abord');

  switch (action.type) {
    case 'rejoindre': {
      if (j) { j.pseudo = action.pseudo; j.present = true; break; }
      if (etat.ordreJoueurs.length >= MAX_JOUEURS) refuser(`La partie est complète (${MAX_JOUEURS} joueurs maximum)`);
      const pseudo = action.pseudo.trim().slice(0, 24);
      if (!pseudo) refuser('Choisissez un pseudo');
      if (Object.values(etat.joueurs).some((x) => x.pseudo.toLowerCase() === pseudo.toLowerCase())) refuser('Ce pseudo est déjà pris dans cette partie');
      etat.joueurs[action.joueur] = { id: action.joueur, pseudo, herosId: null, present: true };
      etat.ordreJoueurs.push(action.joueur);
      etat.meneur ??= action.joueur;
      journal(contenu, etat, `${pseudo} rejoint la partie.`);
      break;
    }
    case 'presence':
      j.present = action.present;
      break;
    case 'creer_heros': {
      if (j.herosId) refuser('Vous avez déjà un héros');
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
      for (const [f, v] of Object.entries(contenu.races[hero.race].reputation_depart)) etat.reputation[f] = (etat.reputation[f] ?? 0) + v / Math.max(1, existants.length + 1);
      etat.pointsGuilde[id] = enCours ? Math.round(existants.reduce((a, x) => a + (etat.pointsGuilde[x.id] ?? 0), 0) / Math.max(1, existants.length)) : 0;
      etat.equipe[id] = null;
      if (contenu.dons[hero.don].parametres.affinite_depart) for (const co of Object.keys(contenu.compagnons)) affinite(etat, id, co).points = contenu.dons[hero.don].parametres.affinite_depart;
      journal(contenu, etat, `${hero.nom}, ${contenu.races[hero.race].nom.toLowerCase()} ${contenu.classes[hero.classe].nom.toLowerCase()}, ${hero.origine === 'invoque' ? 'invoqué' : 'réincarné'}, rejoint l'histoire${niveau > 1 ? ` au niveau ${niveau}` : ''}.`);
      break;
    }
    case 'portrait': {
      const h = herosDuJoueur(etat, action.joueur);
      if (action.image && action.image.length > 300_000) refuser('Image trop lourde (300 Ko maximum)');
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
        etat.scenes.groupe = { sceneId: s.id, noeud: s.debut, heros: participantsGroupe(etat), votes: {}, dernierTest: null, messages: [] };
        if (etat.tempsLibre?.resultats) etat.tempsLibre = null;
        entrerNoeud(contenu, etat, 'groupe', s.debut);
      } else {
        if (etat.scenes[h.id] && etat.scenes[h.id].noeud !== '__fin__') refuser('Vous êtes déjà dans une scène');
        if (!sceneEstDisponible(contenu, etat, s, h.id)) refuser('Cette scène n\'est pas disponible');
        etat.scenes[h.id] = { sceneId: s.id, noeud: s.debut, heros: [h.id], votes: {}, dernierTest: null, messages: [] };
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
      if (action.cle !== 'groupe') { resoudreChoix(contenu, etat, action.cle, action.index, [action.joueur]); break; }
      es.votes[action.joueur] = action.index;
      // tous les joueurs présents ont voté → résolution
      const presents = etat.ordreJoueurs.filter((x) => etat.joueurs[x].present && etat.joueurs[x].herosId);
      if (presents.every((p) => es.votes[p] !== undefined)) resoudreVote(contenu, etat);
      break;
    }
    case 'trancher': {
      if (etat.meneur !== action.joueur) refuser('Seul le meneur du jour peut trancher');
      const es = etat.scenes.groupe ?? refuser('Aucune scène de groupe');
      if (Object.keys(es.votes).length === 0) refuser('Personne n\'a encore voté');
      resoudreVote(contenu, etat);
      break;
    }
    case 'continuer': {
      if (action.cle !== 'groupe' && j.herosId !== action.cle) refuser('Ce n\'est pas votre scène');
      if (etat.combats[action.cle]) refuser('Un combat est en cours');
      const n = noeudCourant(contenu, etat, action.cle) ?? refuser('Rien à continuer');
      if (!n.suite) refuser('Il faut faire un choix');
      if (action.cle === 'groupe' && etat.donjon) refuser('Le groupe explore un donjon');
      entrerNoeud(contenu, etat, action.cle, n.suite!);
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
        if (act.choix_compagnon && (!a.compagnon || !etat.compagnonsRencontres.includes(a.compagnon))) refuser('Choisissez un compagnon rencontré');
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
    case 'cadeau': {
      const h = herosDuJoueur(etat, action.joueur);
      if (!etat.compagnonsRencontres.includes(action.compagnon)) refuser('Vous ne connaissez pas encore ce personnage');
      if (!(h.inventaire[action.objet] > 0)) refuser('Vous n\'avez pas cet objet');
      const a = affinite(etat, h.id, action.compagnon);
      if (!peutOffrir(contenu, a, etat.jour)) refuser(`Un cadeau tous les ${contenu.config.affinite.jours_entre_cadeaux} jours au plus`);
      h.inventaire[action.objet]--;
      const r = reactionCadeau(contenu, action.compagnon, action.objet);
      const d = modifierAffinite(contenu, a, contenu.config.affinite.cadeau[r], { ageHeros: age(h, versDate(contenu, etat.jour).annee) });
      a.dernierCadeau = etat.jour;
      etat.dernieresNouvelles.push(`${contenu.compagnons[action.compagnon].nom} ${({ prefere: 'adore', apprecie: 'apprécie', neutre: 'accepte poliment', deteste: 'n\'aime pas du tout' } as const)[r]} ce cadeau (${d >= 0 ? '+' : ''}${d}).`);
      break;
    }
    case 'equipe': {
      const h = herosDuJoueur(etat, action.joueur);
      if (action.compagnon) {
        if (!etat.compagnonsRencontres.includes(action.compagnon)) refuser('Compagnon inconnu');
        if (palierCompagnon(contenu, etat, h.id, action.compagnon).index < 1) refuser('Il faut atteindre le palier « Alliée »');
        const deja = Object.entries(etat.equipe).find(([hid, c]) => c === action.compagnon && hid !== h.id);
        if (deja) refuser(`${contenu.compagnons[action.compagnon].nom} accompagne déjà ${etat.heros[deja[0]].nom}`);
      }
      etat.equipe[h.id] = action.compagnon;
      break;
    }
    case 'equiper': {
      const h = herosDuJoueur(etat, action.joueur);
      const o = contenu.objets[action.objet] ?? refuser('Objet inconnu');
      if (o.type !== 'equipement' || !o.emplacement) refuser('Cet objet ne s\'équipe pas');
      if (!(h.inventaire[o.id] > 0)) refuser('Vous n\'avez pas cet objet');
      const emplacement = o.emplacement!;
      const ancien = h.equipement[emplacement];
      if (ancien) h.inventaire[ancien] = (h.inventaire[ancien] ?? 0) + 1;
      h.inventaire[o.id]--;
      h.equipement[emplacement] = o.id;
      break;
    }
    case 'desequiper': {
      const h = herosDuJoueur(etat, action.joueur);
      const ancien = h.equipement[action.emplacement];
      if (ancien) { h.inventaire[ancien] = (h.inventaire[ancien] ?? 0) + 1; h.equipement[action.emplacement] = null; }
      break;
    }
    case 'acheter': {
      const h = herosDuJoueur(etat, action.joueur);
      const lieu = Object.values(contenu.regions).flatMap((r) => r.lieux).find((l) => l.id === action.lieu) ?? refuser('Lieu inconnu');
      if (!lieu.boutique.includes(action.objet)) refuser('Cet objet n\'est pas vendu ici');
      const prix = prixAchat(contenu, h, action.objet);
      if (h.or < prix) refuser('Pas assez d\'or');
      h.or -= prix;
      h.inventaire[action.objet] = (h.inventaire[action.objet] ?? 0) + 1;
      break;
    }
    case 'vendre': {
      const h = herosDuJoueur(etat, action.joueur);
      const o = contenu.objets[action.objet] ?? refuser('Objet inconnu');
      if (!(h.inventaire[o.id] > 0)) refuser('Vous n\'avez pas cet objet');
      if (o.type === 'quete') refuser('On ne vend pas un objet de quête');
      h.inventaire[o.id]--;
      h.or += prixVente(contenu, h, o.id);
      break;
    }
    case 'utiliser': {
      const h = herosDuJoueur(etat, action.joueur);
      if (!(h.inventaire[action.objet] > 0)) refuser('Vous n\'avez pas cet objet');
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
      if (ordreRangs.indexOf(rangGuilde(contenu, etat.pointsGuilde[h.id] ?? 0)) < ordreRangs.indexOf(ct.rang_min)) refuser(`Contrat réservé au rang ${ct.rang_min}`);
      if (!conditionHeros(contenu, etat, ct.disponible_si, h)) refuser('Contrat indisponible');
      if (ct.rencontre) {
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
    case 'chapitre_suivant':
      if (!etat.finChapitre) refuser('Le chapitre n\'est pas terminé');
      etat.finChapitre = null;
      break;
  }
  etat.numeroAction++;
  return etat;
}

function resoudreVote(contenu: Contenu, etat: EtatPartie) {
  const es = etat.scenes.groupe;
  const comptes = new Map<number, string[]>();
  for (const [joueur, idx] of Object.entries(es.votes)) comptes.set(idx, [...(comptes.get(idx) ?? []), joueur]);
  let meilleur = -1, max = -1;
  for (const [idx, v] of comptes) {
    if (v.length > max || (v.length === max && etat.meneur && v.includes(etat.meneur))) { meilleur = idx; max = v.length; }
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
