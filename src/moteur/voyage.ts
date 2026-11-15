/**
 * Héros voyageurs (version Roblox : un groupe joue la campagne de son chef).
 *
 * Sur Roblox, chaque joueur a SA campagne, sauvegardée sur son compte. Quand il rejoint le groupe d'un autre
 * joueur, son héros part « en renfort » dans la campagne du chef :
 *  - `exporterHeros` prend une photo du héros (progression, sac, compétences, rang, points de Guilde, affinités) ;
 *  - l'action `invite_arrive` l'installe dans la campagne du chef (marqué `invite`, il reste au camp quand il est absent) ;
 *  - quand il quitte le groupe, l'action `heros_retour` recopie ses gains (XP, niveaux, or, objets, compétences…)
 *    sur son héros, dans sa propre campagne. L'histoire de sa campagne, elle, ne change pas.
 * La version web n'utilise pas ces actions.
 */
import type { Affinite } from './affinite';
import type { Heros } from './personnage';
import { copieProfonde, entrees, vrai } from './outils';

export interface HerosVoyageur {
  heros: Heros;
  pointsGuilde: number;
  rang: string | null;
  affinites: Record<string, Affinite>;
}

/** Ce qu'il faut savoir d'une partie pour exporter un héros (sous-ensemble d'EtatPartie). */
interface EtatHeros {
  heros: Record<string, Heros>;
  pointsGuilde: Record<string, number>;
  rangs: Record<string, string>;
  affinites: Record<string, Record<string, Affinite>>;
}

/** Photo d'un héros, pour l'emmener dans une autre campagne (ou l'en ramener). */
export function exporterHeros(etat: EtatHeros, herosId: string): HerosVoyageur {
  const h = etat.heros[herosId];
  if (!vrai(h)) throw new Error('Héros introuvable');
  const rang = (etat.rangs ?? {})[herosId];
  return {
    heros: copieProfonde(h),
    pointsGuilde: etat.pointsGuilde[herosId] ?? 0,
    rang: vrai(rang) ? rang : null,
    affinites: copieProfonde(etat.affinites[herosId] ?? {}),
  };
}

/** Recopie la progression d'un héros voyageur sur un héros (même personnage, autre campagne). */
export function recopierProgression(cible: Heros, v: Heros) {
  cible.niveau = v.niveau;
  cible.xp = v.xp;
  cible.caracsBonus = copieProfonde(v.caracsBonus);
  cible.pointsCaracDispo = v.pointsCaracDispo;
  cible.pointsCompetenceDispo = v.pointsCompetenceDispo;
  cible.rangsCompetences = copieProfonde(v.rangsCompetences);
  cible.branche = v.branche;
  cible.equipement = copieProfonde(v.equipement);
  cible.inventaire = copieProfonde(v.inventaire);
  cible.or = v.or;
  cible.blessure = v.blessure;
  cible.pv = v.pv;
  cible.variantes = copieProfonde(v.variantes);
  cible.varianteActive = copieProfonde(v.varianteActive);
  cible.equipees = v.equipees === null ? null : copieProfonde(v.equipees);
  cible.grimoire = copieProfonde(v.grimoire ?? {});
  cible.maitrise = copieProfonde(v.maitrise ?? {});
  cible.ultime = v.ultime;
}

/** Recopie aussi ce qui est rangé hors du héros (points de Guilde, rang, affinités). */
export function recopierAutour(etat: EtatHeros, herosId: string, v: HerosVoyageur) {
  etat.pointsGuilde[herosId] = v.pointsGuilde;
  if (vrai(v.rang)) etat.rangs[herosId] = v.rang;
  etat.affinites[herosId] ??= {};
  for (const [co, a] of entrees(v.affinites)) etat.affinites[herosId][co] = copieProfonde(a);
}

// ───────────────────────────── Histoire partagée (Roblox) ─────────────────────────────
//
// Quand un renfort repart, l'histoire vécue avec le groupe peut aussi compter dans SA campagne, s'il en était
// au même point : mêmes étapes de quêtes que la campagne du chef au moment où il est arrivé, et scènes jouées
// encore inédites chez lui. Sinon il ne rapporte que ses gains (son histoire ne bouge pas).

/** Point de l'histoire d'une campagne : ce que le groupe peut faire avancer. */
export interface PointHistoire {
  quetes: Record<string, { etape: string; terminee: boolean }>;
  flags: Record<string, boolean>;
  scenesVues: string[];
  compagnonsRencontres: string[];
  pnjMorts: string[];
  reputation: Record<string, number>;
  jour: number;
}

/** Ce que le groupe a fait avancer entre l'arrivée et le départ d'un renfort. */
export interface DeltaHistoire {
  /** État des quêtes touchées, chez le chef, à l'arrivée du renfort (null = pas encore commencée). */
  quetesAvant: Record<string, { etape: string; terminee: boolean } | null>;
  quetesApres: Record<string, { etape: string; terminee: boolean }>;
  flags: Record<string, boolean>;
  scenes: string[];
  compagnons: string[];
  pnjMorts: string[];
  reputation: Record<string, number>;
  jour: number;
}

interface EtatHistoire {
  quetes: Record<string, { etape: string; terminee: boolean }>;
  flags: Record<string, boolean>;
  scenesVues: string[];
  compagnonsRencontres: string[];
  pnjMorts: string[];
  reputation: Record<string, number>;
  jour: number;
}

export function pointHistoire(etat: EtatHistoire): PointHistoire {
  return {
    quetes: copieProfonde(etat.quetes),
    flags: copieProfonde(etat.flags),
    scenesVues: [...etat.scenesVues],
    compagnonsRencontres: [...etat.compagnonsRencontres],
    pnjMorts: [...etat.pnjMorts],
    reputation: copieProfonde(etat.reputation),
    jour: etat.jour,
  };
}

export function deltaHistoire(avant: PointHistoire, apres: PointHistoire): DeltaHistoire {
  const d: DeltaHistoire = { quetesAvant: {}, quetesApres: {}, flags: {}, scenes: [], compagnons: [], pnjMorts: [], reputation: {}, jour: apres.jour };
  for (const [id, q] of entrees(apres.quetes)) {
    const a = avant.quetes[id];
    if (vrai(a) && a.etape === q.etape && a.terminee === q.terminee) continue;
    d.quetesAvant[id] = vrai(a) ? { etape: a.etape, terminee: a.terminee } : null;
    d.quetesApres[id] = { etape: q.etape, terminee: q.terminee };
  }
  for (const [f, v] of entrees(apres.flags)) if ((avant.flags[f] ?? false) !== v) d.flags[f] = v;
  for (const s of apres.scenesVues) if (!avant.scenesVues.includes(s)) d.scenes.push(s);
  for (const c of apres.compagnonsRencontres) if (!avant.compagnonsRencontres.includes(c)) d.compagnons.push(c);
  for (const p of apres.pnjMorts) if (!avant.pnjMorts.includes(p)) d.pnjMorts.push(p);
  for (const [f, v] of entrees(apres.reputation)) {
    const dv = v - (avant.reputation[f] ?? 0);
    if (dv !== 0) d.reputation[f] = dv;
  }
  return d;
}

/**
 * Vrai si cette campagne en était au même point que celle du chef à l'arrivée du renfort :
 * chaque quête que le groupe a fait avancer y est à la même étape, et aucune des scènes jouées n'y a déjà été vue.
 */
export function memePointHistoire(etat: EtatHistoire, d: DeltaHistoire): boolean {
  if (d.scenes.length === 0) return false;
  for (const [id, av] of entrees(d.quetesAvant)) {
    const ici = etat.quetes[id];
    if (av === null) {
      if (vrai(ici)) return false;
    } else if (!vrai(ici) || ici.etape !== av.etape || ici.terminee !== av.terminee) return false;
  }
  return !d.scenes.some((s) => etat.scenesVues.includes(s));
}

/** Applique l'histoire vécue en groupe (après vérification par memePointHistoire). */
export function appliquerHistoire(etat: EtatHistoire, d: DeltaHistoire) {
  for (const [id, q] of entrees(d.quetesApres)) etat.quetes[id] = { etape: q.etape, terminee: q.terminee };
  for (const [f, v] of entrees(d.flags)) etat.flags[f] = v;
  for (const s of d.scenes) if (!etat.scenesVues.includes(s)) etat.scenesVues.push(s);
  for (const c of d.compagnons) if (!etat.compagnonsRencontres.includes(c)) etat.compagnonsRencontres.push(c);
  for (const p of d.pnjMorts) if (!etat.pnjMorts.includes(p)) etat.pnjMorts.push(p);
  for (const [f, v] of entrees(d.reputation)) etat.reputation[f] = Math.max(-100, Math.min(100, (etat.reputation[f] ?? 0) + v));
}
