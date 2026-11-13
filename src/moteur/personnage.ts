/**
 * Héros : création, caractéristiques, niveaux, XP.
 */
import type { Contenu } from '../contenu/types';
import type { Competence } from '../contenu/schemas';
import type { Technique } from './fusions';
import { CARACS } from '../contenu/constantes';
import { valeurs, vrai } from './outils';

export type Carac = (typeof CARACS)[number];
export type Caracs = Record<Carac, number>;

export interface Heros {
  id: string;
  joueurId: string;
  nom: string;
  classe: string;
  race: string;
  don: string;
  origine: 'invoque' | 'reincarne';
  anneeNaissance: number;
  niveau: number;
  xp: number;
  /** Caractéristiques classe + race (+ modificateurs libres de l'humain). */
  caracsBase: Caracs;
  /** Points ajoutés au fil des niveaux. */
  caracsBonus: Caracs;
  pointsCaracDispo: number;
  pointsCompetenceDispo: number;
  rangsCompetences: Record<string, number>;
  branche: string | null;
  equipement: { arme: string | null; armure: string | null; accessoire: string | null };
  inventaire: Record<string, number>;
  or: number;
  blessure: boolean;
  atout: string | null;
  origineEnfance: string | null;
  contacts: string[];
  portrait: string | null;
  /** Quand le joueur est absent : son héros est joué par l'IA, ou reste au camp. */
  siAbsent: 'ia' | 'camp';
  /** Variantes (fusions) connues, par compétence de base : au plus `variantes_max`. */
  variantes: Record<string, string[]>;
  /** Variante utilisée en combat à la place de la compétence de base (null = la compétence de base). */
  varianteActive: Record<string, string | null>;
  /** Compétences équipées pour le combat (null = les premières, dans la limite `competences_equipees_max`). */
  equipees: string[] | null;
  /** Grimoire personnel et privé : les fusions que CE héros a apprises (les autres joueurs ne les voient pas). */
  grimoire: Record<string, Technique>;
}

export interface OptionsCreation {
  id: string;
  joueurId: string;
  nom: string;
  classe: string;
  race: string;
  don: string;
  origine: 'invoque' | 'reincarne';
  age?: number;
  /** Pour l'humain : où mettre +2 et −2 (répartition libre). */
  libres?: { plus: Partial<Caracs>; moins: Partial<Caracs> };
  niveau?: number;
  anneeCampagne: number;
}

export const caracsVides = (): Caracs => ({ FOR: 0, AGI: 0, INT: 0, VIT: 0, ESP: 0, CHA: 0 });

export function caracsDeDepart(contenu: Contenu, classe: string, race: string, libres?: OptionsCreation['libres']): Caracs {
  const cl = contenu.classes[classe];
  const ra = contenu.races[race];
  if (!cl) throw new Error(`Classe inconnue : ${classe}`);
  if (!ra) throw new Error(`Race inconnue : ${race}`);
  const cfg = contenu.config.personnage;
  const res = { ...cl.caracteristiques };
  for (const c of CARACS) res[c] += ra.modificateurs[c] ?? 0;
  if (ra.modificateurs_libres) {
    // Par défaut : +1 à la caractéristique d'attaque et +1 VIT, −1 aux deux caractéristiques les moins utiles.
    const inutiles = (['CHA', 'INT', 'FOR', 'ESP', 'AGI'] as Carac[]).filter((c) => c !== cl.attaque.stat && c !== 'VIT');
    const plus = libres?.plus ?? { [cl.attaque.stat]: 1, VIT: 1 };
    const moins = libres?.moins ?? { [inutiles[0]]: 1, [inutiles[cl.attaque.stat === 'INT' ? 2 : 1]]: 1 };
    for (const c of CARACS) {
      if ((plus[c] ?? 0) > 1 || (moins[c] ?? 0) > 1) throw new Error('Répartition libre : au plus +1 ou −1 par caractéristique');
      if ((plus[c] ?? 0) > 0 && (moins[c] ?? 0) > 0) throw new Error('Répartition libre : une même caractéristique ne peut pas avoir +1 et −1');
    }
    const sp = valeurs(plus).reduce((a, b) => a + (b ?? 0), 0);
    const sm = valeurs(moins).reduce((a, b) => a + (b ?? 0), 0);
    if (sp !== ra.modificateurs_libres.plus || sm !== ra.modificateurs_libres.moins) {
      throw new Error(`Répartition libre invalide : il faut +${ra.modificateurs_libres.plus} et −${ra.modificateurs_libres.moins}`);
    }
    for (const c of CARACS) res[c] += (plus[c] ?? 0) - (moins[c] ?? 0);
  }
  for (const c of CARACS) {
    if (res[c] < cfg.carac_min || res[c] > cfg.carac_max) {
      throw new Error(`${c} = ${res[c]} hors limites (${cfg.carac_min} à ${cfg.carac_max})`);
    }
  }
  return res;
}

export function creerHeros(contenu: Contenu, o: OptionsCreation): Heros {
  const cfg = contenu.config.personnage;
  if (!contenu.dons[o.don]) throw new Error(`Don inconnu : ${o.don}`);
  const age = o.origine === 'reincarne' ? o.anneeCampagne - cfg.annee_naissance_reincarne : (o.age ?? 20);
  if (o.origine === 'invoque' && (age < cfg.age_invoque_min || age > cfg.age_invoque_max)) {
    throw new Error(`Âge d'un invoqué : entre ${cfg.age_invoque_min} et ${cfg.age_invoque_max} ans`);
  }
  const cl = contenu.classes[o.classe];
  const h: Heros = {
    id: o.id,
    joueurId: o.joueurId,
    nom: (vrai(o.nom.trim()) ? o.nom.trim() : 'Héros sans nom'),
    classe: o.classe,
    race: o.race,
    don: o.don,
    origine: o.origine,
    anneeNaissance: o.anneeCampagne - age,
    niveau: 1,
    xp: 0,
    caracsBase: caracsDeDepart(contenu, o.classe, o.race, o.libres),
    caracsBonus: caracsVides(),
    pointsCaracDispo: 0,
    pointsCompetenceDispo: 0,
    rangsCompetences: Object.fromEntries(cl.competences.map((c) => [c, 1])),
    branche: null,
    equipement: { arme: null, armure: null, accessoire: null },
    inventaire: { 'potion-soin-petite': contenu.config.combat.potions_depart },
    or: 50,
    blessure: false,
    atout: null,
    origineEnfance: null,
    contacts: [],
    portrait: null,
    siAbsent: 'ia',
    variantes: {},
    varianteActive: {},
    equipees: null,
    grimoire: {},
  };
  if (vrai(o.niveau) && o.niveau > 1) monterJusquA(contenu, h, o.niveau, true);
  return h;
}

/** XP nécessaire pour passer du niveau n au niveau n+1. */
export function xpPourNiveau(contenu: Contenu, n: number): number {
  const e = contenu.config.experience;
  return Math.round(e.base * Math.pow(n, e.exposant));
}

export function niveauMax(contenu: Contenu): number {
  const s = contenu.config.saisons.find((x) => x.numero === contenu.config.saison_actuelle) ?? contenu.config.saisons[0];
  return Math.max(...contenu.config.saisons.filter((x) => x.numero <= s.numero).map((x) => x.niveau_max));
}

/** Ajoute de l'XP ; renvoie le nombre de niveaux gagnés. */
export function gagnerXp(contenu: Contenu, h: Heros, xp: number): number {
  const bonus = contenu.dons[h.don]?.parametres.xp ?? 0;
  h.xp += Math.round(xp * (1 + bonus));
  let gagnes = 0;
  while (h.niveau < niveauMax(contenu) && h.xp >= xpPourNiveau(contenu, h.niveau)) {
    h.xp -= xpPourNiveau(contenu, h.niveau);
    monterNiveau(contenu, h);
    gagnes++;
  }
  if (h.niveau >= niveauMax(contenu)) h.xp = 0;
  return gagnes;
}

function monterNiveau(contenu: Contenu, h: Heros) {
  h.niveau++;
  h.pointsCaracDispo += contenu.config.personnage.points_carac_par_niveau;
  h.pointsCompetenceDispo += 1;
}

/** Monte directement un héros à un niveau (joueur qui rejoint en cours de route). */
export function monterJusquA(contenu: Contenu, h: Heros, niveau: number, repartirAuto: boolean) {
  while (h.niveau < Math.min(niveau, niveauMax(contenu))) monterNiveau(contenu, h);
  if (repartirAuto) repartitionAutomatique(contenu, h);
}

/** Répartition automatique (modifiable ensuite) : la caractéristique d'attaque, puis VIT, puis l'ESP. */
export function repartitionAutomatique(contenu: Contenu, h: Heros) {
  const cl = contenu.classes[h.classe];
  const ordre: Carac[] = [cl.attaque.stat, 'VIT', cl.attaque.stat, 'ESP', 'AGI'];
  let i = 0;
  while (h.pointsCaracDispo > 0) {
    const c = ordre[i++ % ordre.length];
    if (caracsTotales(contenu, h)[c] < 99) { h.caracsBonus[c]++; h.pointsCaracDispo--; }
  }
  if (h.niveau >= contenu.config.personnage.niveau_branche && !vrai(h.branche)) choisirBranche(contenu, h, cl.branches[0].id);
  const comps = competencesConnues(contenu, h);
  while (h.pointsCompetenceDispo > 0 && comps.length > 0) {
    const cible = comps.reduce((a, b) => ((h.rangsCompetences[a] ?? 1) <= (h.rangsCompetences[b] ?? 1) ? a : b));
    if ((h.rangsCompetences[cible] ?? 1) >= contenu.config.personnage.rang_competence_max) break;
    ameliorerCompetence(contenu, h, cible);
  }
}

export function repartirPoint(contenu: Contenu, h: Heros, c: Carac) {
  if (h.pointsCaracDispo <= 0) throw new Error('Aucun point de caractéristique disponible');
  h.caracsBonus[c]++;
  h.pointsCaracDispo--;
}

export function choisirBranche(contenu: Contenu, h: Heros, brancheId: string) {
  const cl = contenu.classes[h.classe];
  if (vrai(h.branche)) throw new Error('La branche est déjà choisie');
  if (h.niveau < contenu.config.personnage.niveau_branche) throw new Error(`Branche disponible au niveau ${contenu.config.personnage.niveau_branche}`);
  if (!cl.branches.some((b) => b.id === brancheId)) throw new Error('Branche inconnue');
  h.branche = brancheId;
}

/** Compétences utilisables en combat (au plus `competences_equipees_max`). */
export function competencesEquipees(contenu: Contenu, h: Heros): string[] {
  const max = contenu.config.personnage.competences_equipees_max;
  const connues = competencesConnues(contenu, h);
  const choix = h.equipees ? h.equipees.filter((id) => connues.includes(id)) : connues;
  return choix.slice(0, max);
}

export function competencesConnues(contenu: Contenu, h: Heros): string[] {
  const cl = contenu.classes[h.classe];
  const res = [...cl.competences];
  const b = cl.branches.find((x) => x.id === h.branche);
  if (b) for (const c of b.competences) if (h.niveau >= c.niveau) res.push(c.competence);
  return res;
}

export function ameliorerCompetence(contenu: Contenu, h: Heros, id: string) {
  if (h.pointsCompetenceDispo <= 0) throw new Error('Aucun point de compétence disponible');
  if (!competencesConnues(contenu, h).includes(id)) throw new Error('Compétence non connue');
  const r = h.rangsCompetences[id] ?? 1;
  if (r >= contenu.config.personnage.rang_competence_max) throw new Error('Rang maximum atteint');
  h.rangsCompetences[id] = r + 1;
  h.pointsCompetenceDispo--;
}

export function caracsTotales(contenu: Contenu, h: Heros): Caracs {
  const res = { ...h.caracsBase };
  for (const c of CARACS) res[c] += h.caracsBonus[c];
  for (const slot of valeurs(h.equipement)) {
    const o = vrai(slot) ? contenu.objets[slot] : null;
    for (const c of CARACS) res[c] += o?.bonus?.caracs?.[c] ?? 0;
  }
  return res;
}

export function pvMax(contenu: Contenu, vit: number, niveau: number): number {
  return Math.round(30 + 5 * vit + 4 * (niveau - 1) * (1 + vit / 20));
}

export function manaMax(esp: number, niveau: number): number {
  return Math.round(10 + 3 * esp + 2 * (niveau - 1));
}

export function age(h: Heros, annee: number): number {
  return annee - h.anneeNaissance;
}

/** Niveau moyen du groupe (arrondi à l'inférieur) : niveau d'arrivée d'un nouveau joueur. */
export function niveauMoyen(heros: Heros[]): number {
  if (heros.length === 0) return 1;
  return Math.max(1, Math.floor(heros.reduce((a, h) => a + h.niveau, 0) / heros.length));
}

export function competenceDe(contenu: Contenu, id: string): Competence {
  const c = contenu.competences[id];
  if (!c) throw new Error(`Compétence inconnue : ${id}`);
  return c;
}
