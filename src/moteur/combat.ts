/**
 * Combat au tour par tour.
 *
 * Fonctionnement :
 *  - `demarrerCombat` prépare les combattants et avance jusqu'au premier tour d'un joueur ;
 *  - `jouerAction` applique l'action du joueur dont c'est le tour, puis avance de nouveau ;
 *  - tous les personnages non contrôlés (ennemis, invocations, compagnons, héros d'absents) jouent via l'IA.
 * Tout le hasard passe par un Rng à graine : même graine + mêmes actions = même combat.
 */
import type { Contenu } from '../contenu/types';
import type { Competence, Effet, Ennemi } from '../contenu/schemas';
import { aleatoire, chance, choisir, de, type Rng } from './rng';
import { cles, copieProfonde, entrees, trier, valeurs, vrai } from './outils';
import { bonusEquipement, type BonusEquipement } from './equipement';
import { caracsTotales, competencesEquipees, manaMax, pvMax, rangMaitrise, type Caracs, type Carac, type Heros } from './personnage';

export type Element = 'physique' | 'feu' | 'glace' | 'foudre' | 'sacre' | 'ombre' | 'poison' | 'arcane';
export type EtatId =
  | 'brulure' | 'poison' | 'gel' | 'immobilise' | 'sommeil' | 'peur' | 'silence' | 'provoque' | 'marque'
  | 'furtif' | 'bonus_degats' | 'bonus_defense' | 'bonus_initiative' | 'bonus_precision' | 'malus_defense'
  | 'regeneration' | 'garde' | 'expose' | 'affaibli';

const ETATS_NEGATIFS: EtatId[] = ['brulure', 'poison', 'gel', 'immobilise', 'sommeil', 'peur', 'silence', 'provoque', 'marque', 'malus_defense', 'expose', 'affaibli'];
const ETATS_CONTROLE: EtatId[] = ['immobilise', 'sommeil', 'peur', 'provoque', 'silence'];
export const NOMS_ETATS: Record<EtatId, string> = {
  brulure: 'Brûlure', poison: 'Poison', gel: 'Gel', immobilise: 'Immobilisé', sommeil: 'Sommeil', peur: 'Peur',
  silence: 'Silence', provoque: 'Provoqué', marque: 'Marqué', furtif: 'Furtif', bonus_degats: 'Dégâts +',
  bonus_defense: 'Défense +', bonus_initiative: 'Initiative +', bonus_precision: 'Précision +', malus_defense: 'Défense −',
  regeneration: 'Régénération', garde: 'En garde', expose: 'Exposé', affaibli: 'Affaibli',
};

export interface EtatActif { id: EtatId; duree: number; valeur: number; source: string; cumul: number }

export interface Particularite { id: string; parametres: Record<string, number> }

export interface Combattant {
  id: string;
  nom: string;
  camp: 'heros' | 'ennemis';
  type: 'heros' | 'compagnon' | 'ennemi' | 'invocation';
  refId: string;
  joueurId: string | null;
  /** true : le joueur choisit les actions ; false : l'IA joue. */
  controle: boolean;
  herosId: string | null;
  maitreId: string | null;
  dureeInvocation: number | null;
  niveau: number;
  caracs: Caracs;
  pvMax: number;
  pv: number;
  manaMax: number;
  mana: number;
  armure: number;
  rang: 'avant' | 'arriere';
  attaque: { stat: Carac; element: Element; portee: 'melee' | 'distance'; puissance: number };
  competences: { id: string; rang: number }[];
  /** Compétences propres (ennemis, compagnons, souffle, mimétisme). */
  competencesPropres: Competence[];
  recharges: Record<string, number>;
  etats: EtatActif[];
  bouclier: number;
  ko: boolean;
  parti: boolean;
  passif: Particularite | null;
  trait: Particularite | null;
  don: Particularite | null;
  bonusCompagnon: Particularite[];
  resistances: Partial<Record<Element, number>>;
  resistanceMagique: number;
  categorie: string;
  boss: boolean;
  fuitSous: number | null;
  compteurs: Record<string, number>;
  derniereCible: string | null;
  potions: number;
  bombes: number;
  recompenses: { xp: number; or: number; objets: { id: string; chance: number }[] } | null;
  sprite: string;
  /** Effets de l'équipement porté (héros) : critique, précision, touches élémentaires, pouvoirs uniques. */
  objets?: BonusEquipement;
  /** Puissance d'arme : multiplie aussi les compétences (dégâts et soins), en proportion de l'attaque de base de la classe. */
  facteurArme?: number;
  echelle: number;
  teinte: string | null;
  race: string | null;
  /** Attaques de base nommées (ennemis) : une est tirée à chaque attaque. */
  attaques: { nom: string; phrase: string; element?: string; effet?: string }[];
  /** Phrase et effet de l'attaque nommée en cours (le temps de la résoudre). */
  phrase: string | null;
  effetAttaque: string | null;
}

export type ActionCombat =
  | { type: 'attaque'; acteur: string; cible: string }
  | { type: 'competence'; acteur: string; competence: string; cible?: string }
  /** `item` : identifiant d'un consommable du sac (potion de soin, de mana, antidote, bombes…) ; sans `item`, la petite potion ou la bombe improvisée. */
  | { type: 'objet'; acteur: string; objet: 'potion' | 'bombe'; cible?: string; item?: string }
  | { type: 'defendre'; acteur: string }
  | { type: 'changer_rang'; acteur: string }
  | { type: 'pacifier'; acteur: string; cible: string }
  | { type: 'viser'; acteur: string; cible: string; partie: PartieVisee }
  | { type: 'se_cacher'; acteur: string }
  | { type: 'fuir'; acteur: string };

export type PartieVisee = 'tete' | 'jambes' | 'bras';

/** Attaques visées : malus de toucher, multiplicateur de dégâts, effet si le coup porte. */
export const VISEES: Record<PartieVisee, { nom: string; toucher: number; degats: number; etat: EtatId; duree: number; valeur: number; chance: number; texte: string }> = {
  tete: { nom: 'la tête', toucher: -0.2, degats: 1.25, etat: 'immobilise', duree: 1, valeur: 0, chance: 0.15, texte: 'vacille, sonné' },
  jambes: { nom: 'les jambes', toucher: -0.1, degats: 0.9, etat: 'gel', duree: 2, valeur: 0, chance: 0.5, texte: 'est ralenti' },
  bras: { nom: 'le bras armé', toucher: -0.1, degats: 0.9, etat: 'affaibli', duree: 2, valeur: 0.2, chance: 0.5, texte: 'frappe moins fort' },
};

/** Créatures sans tête ni membres (gelées, esprits, constructions simples). */
export function sansMembres(x: { refId: string; categorie: string }): boolean {
  return ['gelee', 'feu-follet', 'tourelle', 'champignon'].some((p) => x.refId.startsWith(p));
}

export interface EvenementCombat {
  tour: number;
  type: 'action' | 'degats' | 'soin' | 'rate' | 'etat' | 'ko' | 'invocation' | 'fuite' | 'bouclier' | 'info' | 'fin';
  source?: string;
  cible?: string;
  valeur?: number;
  critique?: boolean;
  element?: Element;
  competence?: string;
  /** Chance de toucher au moment du jet (pour l'animation de suspense). */
  chance?: number;
  /** État posé ou subi (événements « etat », dégâts de poison ou de brûlure). */
  etat?: EtatId;
  /** Effet visuel à jouer (assets/effets/<id>.png). */
  effet?: string;
  texte: string;
}

export interface Combat {
  id: string;
  rencontre: string;
  nom: string;
  fond: string;
  tour: number;
  ordre: string[];
  index: number;
  combattants: Combattant[];
  evenements: EvenementCombat[];
  resultat: null | 'victoire' | 'defaite' | 'fuite';
  enAttente: string | null;
  frappesCeTour: Record<string, string[]>;
  fuitePossible: boolean;
  multiplicateurs: { pv: number; degats: number; ennemisEnPlus: number; puissance: number };
  /** Copie de l'état en début de tour, pour le don « Second départ ». */
  /** Copie du combat au début du tour (pour « Second départ »). */
  instantane: Combat | null;
  compteurInvocations: number;
}

// ───────────────────────────── Création des combattants ─────────────────────────────

function sansParticularite(): Pick<Combattant, 'passif' | 'trait' | 'don' | 'bonusCompagnon'> {
  return { passif: null, trait: null, don: null, bonusCompagnon: [] };
}

/**
 * @param techniques grimoire de la partie : les variantes actives du héros y sont prises
 */
export function combattantHeros(contenu: Contenu, h: Heros, controle: boolean, techniques: Record<string, Competence> = {}): Combattant {
  const cl = contenu.classes[h.classe];
  const race = contenu.races[h.race];
  const don = contenu.dons[h.don];
  const caracs = caracsTotales(contenu, h);
  let armure = cl.armure;
  let puissance = cl.attaque.puissance;
  for (const slot of valeurs(h.equipement)) {
    const o = vrai(slot) ? contenu.objets[slot] : null;
    armure += o?.bonus?.armure ?? 0;
    puissance += o?.bonus?.puissance ?? 0;
  }
  const be = bonusEquipement(contenu, h);
  const pmax = Math.round(pvMax(contenu, caracs.VIT, h.niveau) * (h.blessure ? 1 - contenu.config.mort_douce.blessure_pv_pourcent / 100 : 1) * (1 + be.vigueur));
  const propres: Competence[] = [];
  const rangsVariantes: Record<string, number> = {};
  const competences: { id: string; rang: number }[] = [];
  for (const id of competencesEquipees(contenu, h)) {
    const v = h.varianteActive?.[id];
    if (vrai(v) && techniques[v]) { propres.push({ ...techniques[v] }); rangsVariantes[v] = h.rangsCompetences[id] ?? 1; } // la variante remplace la compétence de base, au rang de celle-ci
    else competences.push({ id, rang: h.rangsCompetences[id] ?? 1 });
  }
  if (race.trait.id === 'ecailles-et-souffle') {
    propres.push({
      id: 'souffle-draconique', nom: 'Souffle draconique', description: 'Un souffle de feu sur tous les ennemis (une fois par combat).',
      cout: 0, recharge: 99, cible: 'tous_ennemis', portee: 'distance',
      effets: [{ type: 'degats', puissance: race.trait.parametres.souffle_puissance ?? 10, stat: 'VIT', element: 'feu', coups: 1, critique_garanti: false, cout_pv_pourcent: 0 }],
      ia: { priorite: 3, quand: 'toujours' },
    });
  }
  const potionsInventaire = h.inventaire['potion-soin-petite'] ?? 0;
  const potions = potionsInventaire + (cl.passif.parametres.potions_bonus ?? 0) + (don.parametres.potions_bonus ?? 0) + (don.parametres.objets_improvises ?? 0);
  const res: Partial<Record<Element, number>> = {};
  const tp = race.trait.parametres;
  if (vrai(tp.resistance_feu)) res.feu = tp.resistance_feu;
  if (vrai(tp.resistance_ombre)) res.ombre = tp.resistance_ombre;
  if (vrai(tp.faiblesse_sacre)) res.sacre = -tp.faiblesse_sacre;
  if (vrai(tp.faiblesse_glace)) res.glace = -tp.faiblesse_glace;
  if (vrai(tp.resistance_poison)) res.poison = tp.resistance_poison;
  // résistances apportées par l'équipement
  for (const [el, v] of entrees(be.resistances)) res[el as Element] = (res[el as Element] ?? 0) + (v ?? 0);
  const manaTotal = manaMax(caracs.ESP, h.niveau) + be.mana;
  return {
    id: `h:${h.id}`,
    nom: h.nom,
    camp: 'heros',
    type: 'heros',
    refId: h.classe,
    joueurId: h.joueurId,
    controle,
    herosId: h.id,
    maitreId: null,
    dureeInvocation: null,
    niveau: h.niveau,
    caracs,
    pvMax: pmax,
    pv: pmax,
    manaMax: manaTotal,
    mana: manaTotal,
    armure,
    rang: cl.rang_prefere,
    attaque: { ...cl.attaque, puissance },
    competences,
    competencesPropres: propres,
    recharges: {},
    etats: [],
    bouclier: 0,
    ko: false,
    parti: false,
    passif: { id: cl.passif.id, parametres: cl.passif.parametres },
    trait: { id: race.trait.id, parametres: race.trait.parametres },
    don: { id: don.id, parametres: don.parametres },
    bonusCompagnon: [],
    resistances: res,
    resistanceMagique: tp.resistance_magique ?? 0,
    categorie: 'humanoide',
    boss: false,
    fuitSous: null,
    compteurs: {
      ...sacDeCombat(contenu, h),
      potionsInventaire,
      bombes: don.parametres.objets_improvises ?? 0,
      esquives: don.parametres.esquives ?? 0,
      relances: don.parametres.relances ?? 0,
      determination: race.trait.id === 'determination' ? 1 : 0,
      objetGratuit: don.id === 'reserve-du-neant' ? 1 : 0,
      // pouvoirs uniques d'équipement
      runes: be.pouvoirs.includes('velgraive') && cl.passif.id === 'runes-gravees' ? 1 : 0,
      premierCritique: be.pouvoirs.includes('murmure') ? 1 : 0,
      aubePrete: be.pouvoirs.includes('aube-premiere') ? 1 : 0,
      // rang de maîtrise de chaque compétence (une variante suit la maîtrise de sa compétence de base)
      ...Object.fromEntries(entrees(h.maitrise ?? {}).map(([k, v]) => [`maitrise:${k}`, rangMaitrise(contenu, v)])),
      ...Object.fromEntries(entrees(rangsVariantes).map(([k, v]) => [`rang:${k}`, v])),
    },
    derniereCible: null,
    potions,
    bombes: don.parametres.objets_improvises ?? 0,
    recompenses: null,
    sprite: `heros/${h.classe}`,
    objets: be,
    facteurArme: puissance / Math.max(1, cl.attaque.puissance),
    echelle: race.echelle,
    teinte: race.teinte ?? null,
    race: h.race,
    attaques: [],
    phrase: null,
    effetAttaque: null,
  };
}

/**
 * Consommables du sac utilisables en combat : tout objet « consommable » qui a des effets, sauf la petite potion
 * (comptée à part avec les potions offertes par la classe ou le don). Compteur « sac:<id> » = nombre disponible.
 */
function sacDeCombat(contenu: Contenu, h: Heros): Record<string, number> {
  const res: Record<string, number> = {};
  for (const [id, n] of entrees(h.inventaire)) {
    const o = contenu.objets[id];
    if (!o || n <= 0 || id === 'potion-soin-petite' || o.type !== 'consommable' || o.effets.length === 0) continue;
    res[`sac:${id}`] = n;
  }
  return res;
}

/** Objets du sac encore disponibles pour ce combattant : identifiant, nom, nombre, cible. */
export function objetsDuSac(contenu: Contenu, x: Combattant): { id: string; nom: string; nombre: number; cible: string; description: string }[] {
  const res: { id: string; nom: string; nombre: number; cible: string; description: string }[] = [];
  for (const [k, n] of entrees(x.compteurs)) {
    if (!k.startsWith('sac:') || n <= 0) continue;
    const o = contenu.objets[k.slice(4)];
    if (o) res.push({ id: o.id, nom: o.nom, nombre: n, cible: o.cible, description: o.description });
  }
  return trier(res, (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function combattantEnnemi(contenu: Contenu, def: Ennemi, id: string, mult = { pv: 1, degats: 1 }): Combattant {
  const pmax = Math.round((def.pv ?? pvMax(contenu, def.caracteristiques.VIT, def.niveau)) * mult.pv);
  return {
    id,
    nom: def.nom,
    camp: 'ennemis',
    type: def.invocation ? 'invocation' : 'ennemi',
    refId: def.id,
    joueurId: null,
    controle: false,
    herosId: null,
    maitreId: null,
    dureeInvocation: null,
    niveau: def.niveau,
    caracs: { ...def.caracteristiques },
    pvMax: pmax,
    pv: pmax,
    manaMax: 999,
    mana: 999,
    armure: def.armure,
    rang: def.rang,
    attaque: { ...def.attaque },
    competences: [],
    competencesPropres: def.competences,
    recharges: {},
    etats: [],
    bouclier: 0,
    ko: false,
    parti: false,
    ...sansParticularite(),
    resistances: def.resistances as Partial<Record<Element, number>>,
    resistanceMagique: 0,
    categorie: def.categorie,
    boss: def.boss,
    fuitSous: def.fuit_sous_pourcent ?? null,
    compteurs: { multDegats: mult.degats },
    derniereCible: null,
    potions: 0,
    bombes: 0,
    recompenses: def.recompenses,
    sprite: `ennemis/${def.sprite ?? def.id}`,
    echelle: 1,
    teinte: null,
    race: null,
    attaques: def.attaques ?? [],
    phrase: null,
    effetAttaque: null,
  };
}

/** Compagnon (ex. Aveline) : niveau = niveau de son héros ; bonus selon le palier d'affinité. */
export function combattantCompagnon(contenu: Contenu, compagnonId: string, h: Heros, paliersAtteints: string[]): Combattant {
  const def = contenu.compagnons[compagnonId];
  const caracs = { ...def.combat.caracteristiques };
  // progression simple : +1 dans la caractéristique d'attaque et +1 VIT tous les 2 niveaux
  const gain = Math.floor((h.niveau - 1) * 1.5);
  caracs[def.combat.attaque.stat] += Math.ceil(gain / 2);
  caracs.VIT += Math.floor(gain / 2);
  const pmax = pvMax(contenu, caracs.VIT, h.niveau);
  const bonus = paliersAtteints.map((p) => def.bonus_paliers[p]).filter((b) => b !== undefined).map((b) => ({ id: b.id, parametres: b.parametres }));
  return {
    id: `c:${compagnonId}:${h.id}`,
    nom: def.nom,
    camp: 'heros',
    type: 'compagnon',
    refId: compagnonId,
    joueurId: h.joueurId,
    controle: false,
    herosId: h.id,
    maitreId: `h:${h.id}`,
    dureeInvocation: null,
    niveau: h.niveau,
    caracs,
    pvMax: pmax,
    pv: pmax,
    manaMax: manaMax(caracs.ESP, h.niveau),
    mana: manaMax(caracs.ESP, h.niveau),
    armure: def.combat.armure,
    rang: def.combat.rang,
    attaque: { ...def.combat.attaque },
    competences: [],
    competencesPropres: def.combat.competences,
    recharges: {},
    etats: [],
    bouclier: 0,
    ko: false,
    parti: false,
    ...sansParticularite(),
    bonusCompagnon: bonus,
    resistances: {},
    resistanceMagique: 0,
    categorie: 'humanoide',
    boss: false,
    fuitSous: null,
    compteurs: {},
    derniereCible: null,
    potions: 0,
    bombes: 0,
    recompenses: null,
    sprite: `compagnons/${compagnonId}`,
    echelle: 1,
    teinte: null,
    race: null,
    attaques: [],
    phrase: null,
    effetAttaque: null,
  };
}

// ───────────────────────────── Difficulté ─────────────────────────────

export function multiplicateursDifficulte(contenu: Contenu, puissance: number) {
  const t = trier([...contenu.config.difficulte], (a, b) => a.puissance - b.puissance);
  if (puissance <= t[0].puissance) return { pv: t[0].pv, degats: t[0].degats, ennemisEnPlus: t[0].ennemis_en_plus, puissance };
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i], b = t[i + 1];
    if (puissance <= b.puissance) {
      const f = (puissance - a.puissance) / (b.puissance - a.puissance);
      return {
        pv: a.pv + f * (b.pv - a.pv),
        degats: a.degats + f * (b.degats - a.degats),
        ennemisEnPlus: f < 0.5 ? a.ennemis_en_plus : b.ennemis_en_plus,
        puissance,
      };
    }
  }
  const z = t[t.length - 1];
  return { pv: z.pv, degats: z.degats, ennemisEnPlus: z.ennemis_en_plus, puissance };
}

// ───────────────────────────── Démarrage ─────────────────────────────

export function demarrerCombat(
  contenu: Contenu,
  rencontreId: string,
  allies: Combattant[],
  rng: Rng,
  id = 'combat',
): Combat {
  const r = contenu.rencontres[rencontreId];
  if (!r) throw new Error(`Rencontre inconnue : ${rencontreId}`);
  const nbHeros = allies.filter((a) => a.type === 'heros').length;
  const nbCompagnons = allies.filter((a) => a.type === 'compagnon').length;
  const puissance = Math.max(1, nbHeros + 0.5 * nbCompagnons);
  const m = multiplicateursDifficulte(contenu, puissance);
  // Les ennemis « en plus » prennent une part des PV : le multiplicateur de PV est réparti.
  const listeEnnemis = r.ennemis.map((e) => ({ ...e }));
  for (let i = 0; i < m.ennemisEnPlus && r.renforts.length > 0; i++) listeEnnemis.push({ id: r.renforts[i % r.renforts.length], rang: undefined });
  const pvBase = r.ennemis.reduce((a, e) => a + (contenu.ennemis[e.id].pv ?? 40), 0);
  const pvAjoute = listeEnnemis.slice(r.ennemis.length).reduce((a, e) => a + (contenu.ennemis[e.id].pv ?? 40), 0);
  const multPv = Math.max(0.5, (m.pv * pvBase - pvAjoute) / pvBase);
  const comptes: Record<string, number> = {};
  const ennemis = listeEnnemis.map((e) => {
    comptes[e.id] = (comptes[e.id] ?? 0) + 1;
    const def = contenu.ennemis[e.id];
    const c = combattantEnnemi(contenu, def, `e:${e.id}:${comptes[e.id]}`, { pv: multPv, degats: m.degats });
    if (e.rang) c.rang = e.rang;
    return c;
  });
  // Numérotation lisible : « Loup gris A », « Loup gris B »
  for (const c of ennemis) if ((comptes[c.refId] ?? 0) > 1) c.nom = `${c.nom} ${String.fromCharCode(64 + Number(c.id.split(':')[2]))}`;

  const combat: Combat = {
    id,
    rencontre: rencontreId,
    nom: r.nom,
    fond: r.fond,
    tour: 0,
    ordre: [],
    index: 0,
    combattants: [...allies, ...ennemis],
    evenements: [],
    resultat: null,
    enAttente: null,
    frappesCeTour: {},
    fuitePossible: r.fuite_possible,
    multiplicateurs: m,
    instantane: null,
    compteurInvocations: 0,
  };
  log(combat, { type: 'info', texte: `Le combat commence : ${r.nom} !` });
  // Effets de début de combat
  for (const c of [...combat.combattants]) {
    if (c.passif?.id === 'lien-d-ame') invoquer(contenu, combat, c, 'loup-spectral', null);
    // Bonus de compagnon de début de combat : une aura sur tout le groupe
    const auras: [string, EtatId][] = [['aura-defense', 'bonus_defense'], ['aura-degats', 'bonus_degats'], ['aura-precision', 'bonus_precision'], ['regeneration-groupe', 'regeneration']];
    for (const [bonus, etatAura] of auras) {
      const b = c.bonusCompagnon.find((x) => x.id === bonus);
      if (b === undefined) continue;
      const v = b.parametres.valeur ?? 0.1;
      for (const a of allies) ajouterEtat(combat, a, { id: etatAura, duree: 999, valeur: v, source: c.id, cumul: 1 });
    }
  }
  avancer(contenu, combat, rng);
  return combat;
}

// ───────────────────────────── Outils ─────────────────────────────

function log(c: Combat, e: Omit<EvenementCombat, 'tour'>) {
  c.evenements.push({ tour: c.tour, ...e });
}

export function trouver(c: Combat, id: string): Combattant {
  const x = c.combattants.find((y) => y.id === id);
  if (!x) throw new Error(`Combattant introuvable : ${id}`);
  return x;
}

const actif = (x: Combattant) => !x.ko && !x.parti;
export const allies = (c: Combat, x: Combattant) => c.combattants.filter((y) => y.camp === x.camp && actif(y));
export const adversaires = (c: Combat, x: Combattant) => c.combattants.filter((y) => y.camp !== x.camp && actif(y));

function aEtat(x: Combattant, id: EtatId) {
  return x.etats.some((e) => e.id === id);
}
function valeurEtat(x: Combattant, id: EtatId) {
  return x.etats.filter((e) => e.id === id).reduce((a, e) => a + e.valeur * e.cumul, 0);
}

function ajouterEtat(c: Combat, x: Combattant, e: EtatActif, cumulMax = 1) {
  const existant = x.etats.find((y) => y.id === e.id && (e.id !== 'provoque' || y.source === e.source));
  if (existant) {
    existant.duree = Math.max(existant.duree, e.duree);
    existant.valeur = Math.max(existant.valeur, e.valeur);
    existant.cumul = Math.min(cumulMax, existant.cumul + (cumulMax > 1 ? 1 : 0));
    if (e.id === 'provoque') existant.source = e.source;
  } else {
    if (e.id === 'provoque') x.etats = x.etats.filter((y) => y.id !== 'provoque');
    x.etats.push({ ...e });
  }
}

export function competenceCombattant(contenu: Contenu, x: Combattant, id: string): { comp: Competence; rang: number } | null {
  const propre = x.competencesPropres.find((k) => k.id === id);
  if (propre) return { comp: propre, rang: x.compteurs[`rang:${id}`] ?? 1 };
  const r = x.competences.find((k) => k.id === id);
  if (r) return { comp: contenu.competences[id], rang: r.rang };
  return null;
}

function toutesCompetences(contenu: Contenu, x: Combattant) {
  return [
    ...x.competences.map((k) => ({ comp: contenu.competences[k.id], rang: k.rang })),
    ...x.competencesPropres.map((k) => ({ comp: k, rang: x.compteurs[`rang:${k.id}`] ?? 1 })),
  ];
}

/** Le combattant porte-t-il l'objet qui donne ce pouvoir unique ? */
export function aPouvoir(x: Combattant, objet: string): boolean {
  return x.objets !== undefined && x.objets.pouvoirs.includes(objet);
}

/** Mana réellement payé pour une compétence (pouvoirs d'équipement qui réduisent le coût). */
export function coutMana(x: Combattant, comp: Competence): number {
  let c = comp.cout;
  if (aPouvoir(x, 'ylvarae')) c *= 0.8;
  if (aPouvoir(x, 'ysgarde') && (comp.cible === 'tous_ennemis' || comp.cible === 'tous_allies')) c *= 0.85;
  return Math.round(c);
}

export function competenceUtilisable(contenu: Contenu, x: Combattant, comp: Competence): boolean {
  if (aEtat(x, 'silence')) return false;
  if ((x.recharges[comp.id] ?? 0) > 0) return false;
  if (x.mana < coutMana(x, comp)) return false;
  if (comp.id === 'souffle-draconique' && (x.compteurs.souffle ?? 0) > 0) return false;
  return true;
}

/** Cibles valides d'une attaque, compte tenu de la portée, de la furtivité et de la provocation. */
export function ciblesValides(c: Combat, x: Combattant, type: 'ennemi' | 'allie' | 'allie_ko', portee: 'melee' | 'distance'): Combattant[] {
  if (type === 'allie') return allies(c, x);
  if (type === 'allie_ko') return c.combattants.filter((y) => y.camp === x.camp && y.ko && !y.parti && y.type !== 'invocation');
  let liste = adversaires(c, x);
  const visibles = liste.filter((y) => !aEtat(y, 'furtif'));
  if (visibles.length > 0) liste = visibles;
  const prov = x.etats.find((e) => e.id === 'provoque');
  if (prov) {
    const src = liste.find((y) => y.id === prov.source);
    if (src) return [src];
  }
  if (portee === 'melee') {
    const avant = liste.filter((y) => y.rang === 'avant');
    if (avant.length > 0) return avant;
  }
  return liste;
}

// ───────────────────────────── Calculs ─────────────────────────────

const ELEMENTS_MAGIQUES: Element[] = ['feu', 'glace', 'foudre', 'sacre', 'ombre', 'arcane'];

function multiplicateurDegatsSource(combat: Combat, s: Combattant, cible: Combattant, element: Element): number {
  let m = 1 + valeurEtat(s, 'bonus_degats');
  m *= 1 - valeurEtat(s, 'affaibli');
  // Présence (Charisme) : ±1 % de dégâts par point au-dessus ou en dessous de 10
  if (s.type === 'heros' || s.type === 'compagnon') m *= 1 + 0.01 * (s.caracs.CHA - 10);
  // ennemis : difficulté du groupe ; invocations des héros : niveau du maître et puissance de son arme
  if (s.camp === 'ennemis' || s.type === 'invocation') m *= s.compteurs.multDegats ?? 1;
  // compagne « engagée » : attaque combinée avec son héros (dégâts augmentés)
  const combinee = s.bonusCompagnon.find((b) => b.id === 'attaque-combinee');
  if (combinee !== undefined) m *= 1 + (combinee.parametres.degats ?? 0.25);
  if (s.passif?.id === 'sang-de-dragon') {
    const manque = 1 - s.pv / s.pvMax;
    const max = s.passif.parametres.max ?? 0.4;
    // Drakhaar : plein effet dès 50 % de PV
    m *= 1 + (aPouvoir(s, 'drakhaar') && s.pv / s.pvMax <= 0.5 ? max : Math.min(max, manque / 2));
  }
  if (s.don?.id === 'oeil-du-seuil') {
    m *= 1 + (s.don.parametres.degats ?? 0);
    if ((cible.resistances[element] ?? 0) < 0) m *= 1 + (s.don.parametres.degats_faiblesse ?? 0);
  }
  if (s.don?.id === 'lien-des-betes' && cible.categorie === 'bete') m *= 1 + (s.don.parametres.degats_betes ?? 0);
  if (s.trait?.id === 'instinct-de-meute' && (combat.frappesCeTour[cible.id] ?? []).some((id) => id !== s.id)) {
    m *= 1 + (s.trait.parametres.degats_meute ?? 0);
  }
  // Aura de l'Élu : un allié porteur du don renforce tout le groupe
  if (allies(combat, s).some((a) => a.don?.id === 'aura-de-l-elu')) m *= 1 + 0.05;
  // Épuisement : après 80 tours, les coups portent de plus en plus (+10 % par tour), pour qu'un combat finisse toujours
  if (combat.tour > 80) m *= 1 + 0.1 * (combat.tour - 80);
  return m;
}

function reductionCible(combat: Combat, cible: Combattant, element: Element, source?: Combattant): number {
  const cfg = { def: 2, res: 2 };
  // Œil du Voile : les tirs du porteur ignorent 30 % de la défense et des résistances
  const perce = source !== undefined && aPouvoir(source, 'il-du-voile') ? 0.7 : 1;
  let m = 1;
  if (element === 'physique' || element === 'poison') {
    const defense = (cible.caracs.VIT * cfg.def + cible.armure) * perce;
    m *= 100 / (100 + defense);
  } else {
    const res = cible.caracs.ESP * cfg.res * perce;
    m *= 100 / (100 + res);
    m *= 1 - cible.resistanceMagique * perce;
  }
  m *= 1 - (cible.resistances[element] ?? 0) * perce;
  if (aPouvoir(cible, 'solenne')) m *= 0.9;
  let def = valeurEtat(cible, 'bonus_defense') - valeurEtat(cible, 'malus_defense');
  if (cible.trait?.id === 'robuste') def += cible.trait.parametres.defense ?? 0;
  m *= Math.max(0.3, 1 - def);
  m *= 1 + valeurEtat(cible, 'marque');
  if (cible.type === 'heros' || cible.type === 'compagnon') m *= 1 - 0.01 * (cible.caracs.CHA - 10);
  if (aEtat(cible, 'garde')) m *= 0.5;
  if (allies(combat, cible).some((a) => a.don?.id === 'aura-de-l-elu')) m *= 0.95;
  return Math.max(0, m);
}

/** Compétence de base dont dépend la maîtrise (une fusion « fusion:a+b » suit la compétence a). */
export function competenceDeBase(id: string): string {
  if (!id.startsWith('fusion:')) return id;
  const i = id.indexOf('+');
  return i < 0 ? id.slice(7) : id.slice(7, i);
}

/** Points de chance de toucher perdus par une compétence selon son coût en mana (les premiers points de mana sont gratuits). */
export function malusPuissance(contenu: Contenu, cout: number): number {
  const k = contenu.config.combat;
  return Math.min(k.toucher_malus_max, Math.max(0, cout - k.toucher_mana_gratuit) * k.toucher_malus_par_mana);
}

/** Rang de maîtrise (0 à 5) du combattant pour cette compétence. */
export function maitriseDe(x: Combattant, competence: string): number {
  return x.compteurs[`maitrise:${competenceDeBase(competence)}`] ?? 0;
}

/**
 * Chance de toucher. « Plus c'est puissant, moins c'est sûr » (pour les héros et leurs alliés) :
 *   base + 2 % par point d'Agilité d'écart
 *   + 2 points pour une attaque de base ;
 *   − 1 point par point de mana de la compétence au-delà des 5 premiers (5 points au plus) ;
 *   + 0,5 point par niveau d'écart avec la cible (10 niveaux au plus) ; + 1 point par rang de maîtrise ;
 * le tout borné entre toucher_min et toucher_max. Les ennemis gardent la formule de base (leurs compétences ne coûtent pas de mana).
 */
function chanceToucher(contenu: Contenu, s: Combattant, cible: Combattant, comp?: Competence): number {
  const k = contenu.config.combat;
  if (aEtat(cible, 'sommeil') || aEtat(cible, 'immobilise')) return 1;
  if (aPouvoir(s, 'kestrevane')) return 1;
  let p = k.toucher_base + k.toucher_par_agi * (s.caracs.AGI - cible.caracs.AGI);
  p += s.objets?.precision ?? 0;
  if (comp && s.camp === 'heros') {
    if (comp.id === 'attaque' || comp.id === 'attaque-visee') p += k.toucher_bonus_attaque_base;
    else p -= malusPuissance(contenu, comp.cout);
    p += contenu.config.maitrise.toucher_par_rang * maitriseDe(s, comp.id);
  }
  p += k.toucher_par_niveau * Math.max(-10, Math.min(10, s.niveau - cible.niveau));
  p += valeurEtat(s, 'bonus_precision');
  p += s.compteurs.modToucher ?? 0;
  if (s.trait?.id === 'entre-deux-mondes') p += s.trait.parametres.precision ?? 0;
  if (cible.trait?.id === 'ruse') p -= cible.trait.parametres.esquive ?? 0;
  return Math.min(k.toucher_max, Math.max(k.toucher_min, p));
}

function chanceCritique(contenu: Contenu, s: Combattant, cible: Combattant): number {
  const k = contenu.config.combat;
  let p = k.critique_base + k.critique_par_agi * s.caracs.AGI;
  p += s.objets?.critique ?? 0;
  if (s.passif?.id === 'dans-le-dos') {
    const affaiblie = cible.etats.some((e) => ETATS_NEGATIFS.includes(e.id));
    if (affaiblie || cible.derniereCible !== s.id) p += s.passif.parametres.critique ?? 0.25;
  }
  return Math.min(0.9, p);
}

/** Inflige des dégâts (gère bouclier, interceptions, Détermination, K.O.). Renvoie les dégâts réels. */
function infliger(contenu: Contenu, combat: Combat, rng: Rng, s: Combattant, cibleInitiale: Combattant, brut: number, element: Element, critique: boolean, monoCible: boolean, competence?: string): number {
  let cible = cibleInitiale;
  // Interceptions (Rempart du Gardien, Garde partagée d'un compagnon)
  if (monoCible && s.camp !== cible.camp) {
    for (const g of allies(combat, cible)) {
      if (g.id === cible.id) continue;
      const rempart = g.passif?.id === 'rempart' ? g.passif.parametres : null;
      const garde = g.bonusCompagnon.find((b) => b.id === 'garde-partagee');
      const protegeCible = garde && (cible.herosId === g.herosId && cible.type === 'heros');
      const p = rempart ? rempart.chance : protegeCible ? garde!.parametres.chance : 0;
      if (p > 0 && chance(rng, p)) {
        const red = rempart ? rempart.reduction ?? 0.2 : 0.2;
        brut = brut * (1 - red);
        log(combat, { type: 'info', source: g.id, cible: cible.id, texte: `${g.nom} s'interpose devant ${cible.nom} !` });
        cible = g;
        break;
      }
    }
  }
  let degats = Math.max(1, Math.round(brut * reductionCible(combat, cible, element, s)));
  if (cible.bouclier > 0) {
    const abs = Math.min(cible.bouclier, degats);
    cible.bouclier -= abs;
    degats -= abs;
    if (abs > 0) log(combat, { type: 'bouclier', cible: cible.id, valeur: abs, texte: `Le bouclier de ${cible.nom} absorbe ${abs} dégâts.` });
  }
  cible.pv -= degats;
  (combat.frappesCeTour[cible.id] ??= []).push(s.id);
  cible.etats = cible.etats.filter((e) => e.id !== 'sommeil');
  log(combat, {
    type: 'degats', source: s.id, cible: cible.id, valeur: degats, critique, element, competence,
    effet: s.effetAttaque ?? undefined,
    // attaque nommée d'un ennemi : « Le loup gris bondit et mord Daleko à la jambe : 7 dégâts. »
    texte: s.phrase !== null
      ? `${s.nom} ${s.phrase.replaceAll('{cible}', cible.nom)} : ${degats} dégâts${critique ? ' (critique !)' : ''}.`
      : `${s.nom} inflige ${degats} dégâts${element !== 'physique' ? ` (${element})` : ''} à ${cible.nom}${critique ? ' (critique !)' : ''}.`,
  });
  if (cible.pv > 0 && cible.pv / cible.pvMax < 0.25 && (cible.compteurs.determination ?? 0) > 0) {
    const v = Math.round(cible.pvMax * 0.1);
    cible.pv += v;
    cible.compteurs.determination = 0;
    log(combat, { type: 'soin', cible: cible.id, valeur: v, texte: `${cible.nom} serre les dents et regagne ${v} PV ! (Détermination)` });
  }
  if (cible.pv <= 0) {
    mettreKo(combat, cible);
    // Brise-Monde : chaque ennemi vaincu par le porteur lui rend 10 % de ses PV max
    if (cible.ko && cible.camp !== s.camp && aPouvoir(s, 'brise-monde') && actif(s)) {
      const v = Math.min(s.pvMax - s.pv, Math.round(s.pvMax * 0.1));
      if (v > 0) {
        s.pv += v;
        log(combat, { type: 'soin', source: s.id, cible: s.id, valeur: v, texte: `${s.nom} récupère ${v} PV. (Brise-Monde)` });
      }
    }
  } else if (vrai(cible.fuitSous) && cible.pv / cible.pvMax <= cible.fuitSous) {
    cible.parti = true;
    log(combat, { type: 'fuite', cible: cible.id, texte: `${cible.nom} bat en retraite dans un nuage de cendres !` });
  }
  // Contre-attaque (compagnon au palier « Amoureuse »)
  if (!cible.ko && s.camp !== cible.camp) {
    const ca = cible.bonusCompagnon.find((b) => b.id === 'contre-attaque');
    if (ca && chance(rng, ca.parametres.chance ?? 0.25) && actif(s)) {
      const dg = Math.round(cible.attaque.puissance * (1 + cible.caracs[cible.attaque.stat] / 20) * 0.6 * reductionCible(combat, s, 'physique'));
      s.pv -= Math.max(1, dg);
      log(combat, { type: 'degats', source: cible.id, cible: s.id, valeur: dg, texte: `${cible.nom} contre-attaque : ${dg} dégâts à ${s.nom}.` });
      if (s.pv <= 0) mettreKo(combat, s);
    }
  }
  return degats;
}

function mettreKo(combat: Combat, x: Combattant) {
  x.pv = 0;
  x.ko = true;
  x.etats = [];
  x.bouclier = 0;
  log(combat, { type: 'ko', cible: x.id, texte: x.camp === 'heros' ? `${x.nom} est K.O. !` : `${x.nom} est vaincu.` });
  // Aube-Première : une fois par combat, le porteur relève un allié K.O. (héros ou compagnon)
  if (x.type === 'heros' || x.type === 'compagnon') {
    const porteur = combat.combattants.find((g) => g.id !== x.id && g.camp === x.camp && actif(g) && (g.compteurs.aubePrete ?? 0) > 0);
    if (porteur !== undefined) {
      porteur.compteurs.aubePrete = 0;
      x.ko = false;
      x.pv = Math.max(1, Math.round(x.pvMax * 0.3));
      log(combat, { type: 'soin', source: porteur.id, cible: x.id, valeur: x.pv, texte: `${porteur.nom} relève ${x.nom} ! (Aube-Première)` });
      return;
    }
  }
  if (x.type === 'invocation') x.parti = x.dureeInvocation !== null; // les invocations temporaires disparaissent
  // le familier reviendra plus tard
  if (x.refId === 'loup-spectral' && vrai(x.maitreId)) {
    const m = combat.combattants.find((y) => y.id === x.maitreId);
    if (m) m.compteurs.retourFamilier = (m.passif?.parametres.retour ?? 3);
  }
}

function soigner(contenu: Contenu, combat: Combat, s: Combattant, cible: Combattant, montant: number) {
  if (cible.ko) return;
  let m = montant;
  if (cible.trait?.id === 'sang-cendre' && s.id !== cible.id && (s.refId === 'guerisseur' || s.refId === 'gardien')) m *= 1 + (cible.trait.parametres.soins_sacres ?? 0);
  if (aPouvoir(s, 'lumenae')) m *= 1.15;
  m = Math.round(m);
  const manque = cible.pvMax - cible.pv;
  const reel = Math.min(manque, m);
  cible.pv += reel;
  log(combat, { type: 'soin', source: s.id, cible: cible.id, valeur: reel, texte: `${cible.nom} récupère ${reel} PV.` });
  if (s.passif?.id === 'main-bienveillante' && m > reel) {
    const b = Math.round((m - reel) * (s.passif.parametres.bouclier_surplus ?? 0.5));
    if (b > 0) {
      cible.bouclier += b;
      log(combat, { type: 'bouclier', cible: cible.id, valeur: b, texte: `Le surplus de soin devient un bouclier de ${b}.` });
    }
  }
}

function invoquer(contenu: Contenu, combat: Combat, maitre: Combattant, creature: string, duree: number | null) {
  const def = contenu.ennemis[creature];
  combat.compteurInvocations++;
  const inv = combattantEnnemi(contenu, def, `i:${creature}:${combat.compteurInvocations}`);
  const f = 1 + 0.12 * (maitre.niveau - 1);
  inv.camp = maitre.camp;
  inv.type = 'invocation';
  inv.maitreId = maitre.id;
  inv.joueurId = maitre.joueurId;
  inv.herosId = maitre.herosId;
  inv.dureeInvocation = duree;
  inv.niveau = maitre.niveau;
  inv.pvMax = Math.round(inv.pvMax * f * (aPouvoir(maitre, 'nyxaliel') ? 1.2 : 1));
  inv.pv = inv.pvMax;
  // la puissance de l'arme du maître renforce aussi ses créatures
  inv.compteurs = { multDegats: f * (maitre.facteurArme ?? 1) };
  inv.recompenses = null;
  inv.sprite = `invocations/${creature}`;
  combat.combattants.push(inv);
  // l'invocation agit à partir du tour suivant
  log(combat, { type: 'invocation', source: maitre.id, cible: inv.id, texte: `${maitre.nom} invoque : ${inv.nom} !` });
}

// ───────────────────────────── Résolution d'une compétence ─────────────────────────────

function resoudreCibles(combat: Combat, rng: Rng, s: Combattant, type: string, cibleChoisie: Combattant | null, portee: 'melee' | 'distance'): Combattant[] {
  switch (type) {
    case 'soi': return [s];
    case 'tous_allies': return allies(combat, s);
    case 'tous_ennemis': return adversaires(combat, s);
    case 'ennemi_aleatoire': return [];
    case 'allie_ko': return cibleChoisie ? [cibleChoisie] : [];
    case 'allie': return [cibleChoisie ?? s];
    default: {
      const valides = ciblesValides(combat, s, 'ennemi', portee);
      if (cibleChoisie && valides.some((v) => v.id === cibleChoisie.id)) return [cibleChoisie];
      return valides.length > 0 ? [choisir(rng, valides)] : [];
    }
  }
}

function appliquerEffets(contenu: Contenu, combat: Combat, rng: Rng, s: Combattant, comp: Competence, rang: number, cibleChoisie: Combattant | null, depuisObjet = false) {
  const facteurRang = 1 + 0.1 * (rang - 1);
  const facteurMaitrise = depuisObjet ? 1 : 1 + contenu.config.maitrise.degats_par_rang * maitriseDe(s, comp.id);
  let consommeRunes = false;
  let premiereCibleOffensive: Combattant | null = null;
  // éléments utilisés par cette compétence (Résonance)
  const elementsComp = comp.effets.filter((e): e is Extract<Effet, { type: 'degats' }> => e.type === 'degats').map((e) => e.element as Element);
  let bonusResonance = 1;
  if (s.passif?.id === 'resonance' && elementsComp.length > 0) {
    const dernier = s.compteurs.dernierElement;
    const code = ELEMENTS_MAGIQUES.indexOf(elementsComp[0]) + 1;
    if (vrai(dernier) && vrai(code) && dernier !== code) bonusResonance = 1 + (s.passif.parametres.bonus ?? 0.25);
    if (vrai(code)) s.compteurs.dernierElement = code;
  }
  let bonusRunes = 1;
  if (s.passif?.id === 'runes-gravees' && !depuisObjet && elementsComp.length > 0) {
    const charges = s.compteurs.runes ?? 0;
    bonusRunes = 1 + charges * (s.passif.parametres.bonus_par_charge ?? 0.2);
    if (charges > 0) consommeRunes = true;
  }
  let multObjet = depuisObjet && s.passif?.id === 'fioles-optimisees' ? 1 + (s.passif.parametres.efficacite ?? 0.4) : 1;
  if (depuisObjet && aPouvoir(s, 'prisme')) multObjet *= 1.25;

  for (const ef of comp.effets) {
    const typeCible = ('cible' in ef && ef.cible) ? ef.cible : comp.cible;
    if (ef.type === 'degats') {
      const n = ef.coups;
      for (let k = 0; k < n; k++) {
        let cibles: Combattant[];
        if (typeCible === 'ennemi_aleatoire') {
          const v = ciblesValides(combat, s, 'ennemi', 'distance');
          cibles = v.length > 0 ? [choisir(rng, v)] : [];
        } else cibles = resoudreCibles(combat, rng, s, typeCible, premiereCibleOffensive ?? cibleChoisie, comp.portee);
        for (const cible of cibles) {
          if (!actif(cible)) continue;
          premiereCibleOffensive ??= cible;
          const monoCible = typeCible === 'ennemi';
          // toucher
          const pToucher = depuisObjet ? 1 : chanceToucher(contenu, s, cible, comp);
          let touche = depuisObjet || chance(rng, pToucher);
          if (!touche && (s.compteurs.relances ?? 0) > 0) { s.compteurs.relances--; touche = chance(rng, pToucher); }
          if (touche && (cible.compteurs.esquives ?? 0) > 0 && monoCible) {
            cible.compteurs.esquives--;
            touche = false;
            ajouterEtat(combat, cible, { id: 'furtif', duree: 1, valeur: 0, source: cible.id, cumul: 1 });
            log(combat, { type: 'rate', source: s.id, cible: cible.id, texte: `${cible.nom} disparaît dans l'ombre et esquive ! (Pas de l'ombre)` });
            continue;
          }
          if (!touche) { log(combat, { type: 'rate', source: s.id, cible: cible.id, chance: pToucher, competence: comp.id, texte: `${s.nom} rate ${cible.nom}.` }); continue; }
          const furtif = aEtat(s, 'furtif');
          let critique = ef.critique_garanti || furtif || chance(rng, chanceCritique(contenu, s, cible));
          // Murmure : la première attaque du combat est toujours un coup critique
          if ((s.compteurs.premierCritique ?? 0) > 0) {
            critique = true;
            s.compteurs.premierCritique = 0;
          }
          if (!critique && (s.compteurs.relancesCrit ?? 0) > 0) { s.compteurs.relancesCrit--; critique = chance(rng, chanceCritique(contenu, s, cible)); }
          const statVal = depuisObjet ? 10 : s.caracs[ef.stat];
          const variance = 1 + (aleatoire(rng) * 2 - 1) * contenu.config.combat.variance_degats;
          let brut = ef.puissance * facteurRang * facteurMaitrise * (1 + statVal / 20) * variance * multObjet;
          if (comp.id !== 'attaque' && !depuisObjet) brut *= s.facteurArme ?? 1;
          brut *= multiplicateurDegatsSource(combat, s, cible, ef.element as Element) * bonusResonance * bonusRunes;
          if (critique) brut *= aPouvoir(s, 'nuit-premiere') ? 2 : contenu.config.combat.multiplicateur_critique;
          if (vrai(ef.executer_sous_pourcent) && cible.pv / cible.pvMax <= ef.executer_sous_pourcent) brut *= 2;
          if (vrai(ef.cout_pv_pourcent)) { s.pv = Math.max(1, s.pv - Math.round(s.pvMax * ef.cout_pv_pourcent)); }
          const avantEvt = combat.evenements.length;
          infliger(contenu, combat, rng, s, cible, brut, ef.element as Element, critique, monoCible, comp.id);
          // la chance de toucher accompagne le résultat (pour l'animation de suspense)
          for (let i = avantEvt; i < combat.evenements.length; i++) if (combat.evenements[i].type === 'degats' && combat.evenements[i].source === s.id) combat.evenements[i].chance = pToucher;
          if (furtif) s.etats = s.etats.filter((e) => e.id !== 'furtif');
        }
      }
    } else if (ef.type === 'soin') {
      const cibles = resoudreCibles(combat, rng, s, typeCible, cibleChoisie, 'distance');
      const statVal = depuisObjet ? 10 : s.caracs[ef.stat];
      for (const cible of cibles) soigner(contenu, combat, s, cible, ef.puissance * facteurRang * facteurMaitrise * (1 + statVal / 20) * multObjet * (depuisObjet ? 1 : s.facteurArme ?? 1));
    } else if (ef.type === 'etat') {
      const cibles = typeCible === 'ennemi' && premiereCibleOffensive ? [premiereCibleOffensive] : resoudreCibles(combat, rng, s, typeCible, cibleChoisie, comp.portee);
      for (const cible of cibles) {
        if (!actif(cible)) continue;
        let p = ef.chance;
        if (cible.camp !== s.camp && ETATS_CONTROLE.includes(ef.etat as EtatId)) {
          if (cible.boss) p *= 0.5;
          if (cible.trait?.id === 'instinct-de-meute') p *= 1 - (cible.trait.parametres.resistance_controle ?? 0);
        }
        if (cible.camp !== s.camp && (ef.etat === 'poison') && (cible.resistances.poison ?? 0) >= 1) { log(combat, { type: 'info', cible: cible.id, texte: `${cible.nom} est insensible au poison.` }); continue; }
        if (!chance(rng, Math.min(1, p))) { log(combat, { type: 'info', cible: cible.id, texte: `${cible.nom} résiste.` }); continue; }
        let duree = ef.duree;
        if (ef.etat === 'poison' && cible.trait?.id === 'sang-ancien') duree += cible.trait.parametres.duree_poison_bonus ?? 1;
        if (ef.etat === 'poison' && cible.trait?.id === 'robuste') { if (chance(rng, cible.trait.parametres.resistance_poison ?? 0.5)) { log(combat, { type: 'info', cible: cible.id, texte: `${cible.nom} résiste au poison.` }); continue; } }
        // Refrain : les chants de groupe durent tant que le barde tient debout
        if (s.passif?.id === 'refrain' && typeCible === 'tous_allies') duree = 99;
        const valeur = ef.etat === 'poison' || ef.etat === 'brulure' ? ef.valeur * facteurRang * (1 + s.caracs[s.attaque.stat] / 40) : ef.valeur;
        const bonusRefrain = aPouvoir(s, 'melisande') && cible.camp === s.camp ? 1 : 0;
        ajouterEtat(combat, cible, { id: ef.etat as EtatId, duree: duree + (cible.id === s.id ? 1 : 0) + bonusRefrain, valeur, source: s.id, cumul: 1 }, ef.cumul_max);
        const pose = cible.etats.find((e) => e.id === ef.etat);
        const cumulTexte = pose && pose.cumul > 1 ? ` ×${pose.cumul}` : '';
        log(combat, { type: 'etat', source: s.id, cible: cible.id, etat: ef.etat as EtatId, texte: ef.etat === 'poison' || ef.etat === 'brulure'
          ? `${cible.nom} : ${NOMS_ETATS[ef.etat as EtatId]}${cumulTexte} (${Math.max(1, Math.round(valeur * (pose?.cumul ?? 1)))} dégâts par tour pendant ${pose?.duree ?? duree} tours).`
          : `${cible.nom} : ${NOMS_ETATS[ef.etat as EtatId]}.` });
      }
    } else if (ef.type === 'bouclier') {
      const cibles = resoudreCibles(combat, rng, s, typeCible, cibleChoisie, 'distance');
      for (const cible of cibles) {
        const v = Math.round(cible.pvMax * ef.pourcent_pv * facteurRang * multObjet);
        cible.bouclier += v;
        log(combat, { type: 'bouclier', source: s.id, cible: cible.id, valeur: v, texte: `${cible.nom} gagne un bouclier de ${v}.` });
      }
    } else if (ef.type === 'invocation') {
      invoquer(contenu, combat, s, ef.creature, ef.duree);
    } else if (ef.type === 'purifier') {
      for (const cible of resoudreCibles(combat, rng, s, typeCible, cibleChoisie, 'distance')) {
        cible.etats = cible.etats.filter((e) => !ETATS_NEGATIFS.includes(e.id));
        log(combat, { type: 'etat', cible: cible.id, texte: `${cible.nom} est purifié.` });
      }
    } else if (ef.type === 'charge_rune') {
      s.compteurs.runes = Math.min(s.passif?.parametres.max ?? 3, (s.compteurs.runes ?? 0) + ef.nombre);
    } else if (ef.type === 'mana') {
      for (const cible of resoudreCibles(combat, rng, s, typeCible, cibleChoisie, 'distance')) cible.mana = Math.min(cible.manaMax, cible.mana + ef.valeur);
    } else if (ef.type === 'soigner_invocations') {
      for (const inv of allies(combat, s).filter((a) => a.maitreId === s.id && a.type === 'invocation')) {
        inv.pv = Math.min(inv.pvMax, inv.pv + Math.round(inv.pvMax * ef.pourcent));
      }
    } else if (ef.type === 'relever') {
      // relever : l'allié K.O. choisi, ou tous les alliés K.O. (cible « tous_allies », ultime du Guérisseur)
      const aRelever = ef.cible === 'tous_allies' ? combat.combattants.filter((x) => x.camp === s.camp && x.ko && !x.parti) : resoudreCibles(combat, rng, s, 'allie_ko', cibleChoisie, 'distance');
      for (const cible of aRelever) {
        if (cible.ko) { cible.ko = false; cible.pv = Math.round(cible.pvMax * ef.pourcent_pv); log(combat, { type: 'soin', cible: cible.id, texte: `${cible.nom} se relève !` }); }
      }
    }
  }
  if (consommeRunes) s.compteurs.runes = 0;
  if (premiereCibleOffensive) s.derniereCible = premiereCibleOffensive.id;
}

function attaqueSimple(contenu: Contenu, combat: Combat, rng: Rng, s: Combattant, cible: Combattant | null) {
  // Attaque nommée (ennemis) : même puissance, mais un nom, une phrase et un effet visuel
  const nommee = s.attaques.length > 0 ? choisir(rng, s.attaques) : null;
  const element = (nommee?.element ?? s.attaque.element) as Element;
  const comp: Competence = {
    id: 'attaque', nom: nommee?.nom ?? 'Attaque', description: '', cout: 0, recharge: 0, cible: 'ennemi', portee: s.attaque.portee,
    effets: [{ type: 'degats', puissance: s.attaque.puissance, stat: s.attaque.stat, element, coups: 1, critique_garanti: false, cout_pv_pourcent: 0 }],
    ia: { priorite: 1, quand: 'toujours' },
  };
  const avantPv = cible?.pv ?? 0;
  if (nommee) {
    s.phrase = nommee.phrase;
    s.effetAttaque = nommee.effet ?? null;
  }
  appliquerEffets(contenu, combat, rng, s, comp, 1, cible);
  s.phrase = null;
  s.effetAttaque = null;
  const c = vrai(s.derniereCible) ? combat.combattants.find((x) => x.id === s.derniereCible) : null;
  // Touches élémentaires de l'équipement : un coup supplémentaire de l'élément, si l'attaque a porté
  if (c && c.pv < avantPv && s.objets !== undefined) {
    for (const t of s.objets.touches) {
      if (!actif(c)) break;
      const brut = t.puissance * (1 + s.caracs[s.attaque.stat] / 20) * multiplicateurDegatsSource(combat, s, c, t.element as Element);
      infliger(contenu, combat, rng, s, c, brut, t.element as Element, false, true, 'touche');
    }
  }
  // Lointain : 25 % de chances de tirer une seconde flèche sur un autre ennemi
  if (aPouvoir(s, 'lointain') && chance(rng, 0.25)) {
    const autres = ciblesValides(combat, s, 'ennemi', 'distance').filter((y) => c === null || c === undefined || y.id !== c.id);
    if (autres.length > 0) {
      const autre = choisir(rng, autres);
      log(combat, { type: 'action', source: s.id, cible: autre.id, competence: 'attaque', texte: `${s.nom} tire une seconde flèche ! (Lointain)` });
      appliquerEffets(contenu, combat, rng, s, comp, 1, autre);
    }
  }
  // Runes gravées : chaque attaque réussie charge une rune
  if (s.passif?.id === 'runes-gravees' && c && c.pv < avantPv) s.compteurs.runes = Math.min(s.passif.parametres.max ?? 3, (s.compteurs.runes ?? 0) + 1);
  // Œil du faucon : chance de marquer
  if (s.passif?.id === 'oeil-du-faucon' && c && actif(c) && chance(rng, s.passif.parametres.chance_marque ?? 0.3)) {
    ajouterEtat(combat, c, { id: 'marque', duree: 2, valeur: 0.15, source: s.id, cumul: 1 });
    log(combat, { type: 'etat', source: s.id, cible: c.id, texte: `${c.nom} est marqué.` });
  }
}

// ───────────────────────────── Tours ─────────────────────────────

function calculerOrdre(contenu: Contenu, combat: Combat, rng: Rng) {
  const vivants = combat.combattants.filter((x) => actif(x));
  const init = new Map<string, number>();
  for (const x of vivants) {
    let v = x.caracs.AGI + de(rng, 10);
    v *= 1 + valeurEtat(x, 'bonus_initiative');
    if (aEtat(x, 'gel')) v *= 0.5;
    if (x.trait) v += x.trait.parametres.initiative ?? 0;
    init.set(x.id, v + aleatoire(rng) * 0.01);
  }
  combat.ordre = trier(vivants.map((x) => x.id), (a, b) => init.get(b)! - init.get(a)!);
  combat.index = 0;
}

function verifierFin(combat: Combat): boolean {
  if (combat.resultat) return true;
  const heros = combat.combattants.filter((x) => x.camp === 'heros' && x.type !== 'invocation');
  const ennemis = combat.combattants.filter((x) => x.camp === 'ennemis');
  if (ennemis.every((x) => !actif(x))) { combat.resultat = 'victoire'; log(combat, { type: 'fin', texte: 'Victoire !' }); }
  else if (heros.every((x) => !actif(x))) { combat.resultat = 'defaite'; log(combat, { type: 'fin', texte: 'Défaite…' }); }
  if (combat.resultat) combat.enAttente = null;
  return !!combat.resultat;
}

/** Début du tour d'un combattant : dégâts sur la durée, régénération. Renvoie false s'il ne peut pas agir. */
function debutTour(contenu: Contenu, combat: Combat, rng: Rng, x: Combattant): boolean {
  for (const e of x.etats.filter((y) => y.id === 'brulure' || y.id === 'poison')) {
    const element: Element = e.id === 'brulure' ? 'feu' : 'poison';
    let dg = Math.max(1, Math.round(e.valeur * e.cumul * (1 - (x.resistances[element] ?? 0))));
    if ((x.resistances[element] ?? 0) >= 1) dg = 0;
    if (dg > 0) {
      x.pv -= dg;
      log(combat, { type: 'degats', cible: x.id, valeur: dg, element, etat: e.id, texte: `${x.nom} : −${dg} PV (${NOMS_ETATS[e.id].toLowerCase()}${e.cumul > 1 ? ` ×${e.cumul}` : ''}, encore ${e.duree} tour${e.duree > 1 ? 's' : ''}).` });
      if (x.pv <= 0) { mettreKo(combat, x); return false; }
    }
  }
  let regen = valeurEtat(x, 'regeneration');
  if (x.don?.id === 'coeur-inepuisable') regen += x.don.parametres.regeneration ?? 0.03;
  if (x.trait?.id === 'sang-cendre' && x.pv / x.pvMax < 0.5) regen += x.trait.parametres.regeneration ?? 0.02;
  if (regen > 0 && x.pv < x.pvMax) {
    const v = Math.min(x.pvMax - x.pv, Math.max(1, Math.round(x.pvMax * regen)));
    x.pv += v;
    log(combat, { type: 'soin', cible: x.id, valeur: v, texte: `${x.nom} régénère ${v} PV.` });
  }
  x.mana = Math.min(x.manaMax, x.mana + contenu.config.combat.regen_mana_base + Math.floor(x.caracs.ESP / 5));
  x.etats = x.etats.filter((e) => e.id !== 'garde');
  if (aEtat(x, 'immobilise') || aEtat(x, 'sommeil')) {
    log(combat, { type: 'info', cible: x.id, texte: `${x.nom} ne peut pas agir.` });
    return false;
  }
  if (aEtat(x, 'peur') && chance(rng, 0.5)) {
    log(combat, { type: 'info', cible: x.id, texte: `${x.nom} est paralysé par la peur.` });
    return false;
  }
  return true;
}

function finTour(combat: Combat, x: Combattant) {
  for (const e of x.etats) e.duree--;
  // le Refrain s'arrête si le barde est K.O.
  x.etats = x.etats.filter((e) => e.duree > 0);
  for (const k of cles(x.recharges)) if (x.recharges[k] > 0) x.recharges[k]--;
  if (x.type === 'invocation' && x.dureeInvocation !== null) {
    x.dureeInvocation--;
    if (x.dureeInvocation <= 0 && !x.ko) {
      x.parti = true;
      log(combat, { type: 'info', cible: x.id, texte: `${x.nom} disparaît.` });
    }
  }
}

function debutRound(contenu: Contenu, combat: Combat, rng: Rng) {
  combat.tour++;
  combat.frappesCeTour = {};
  // Refrain : si le barde est K.O., ses chants s'arrêtent
  for (const x of combat.combattants) {
    x.etats = x.etats.filter((e) => {
      if (e.duree < 50) return true;
      const src = combat.combattants.find((y) => y.id === e.source);
      return !!src && actif(src);
    });
  }
  // Retour du familier
  for (const m of combat.combattants.filter((y) => actif(y) && y.passif?.id === 'lien-d-ame')) {
    if ((m.compteurs.retourFamilier ?? 0) > 0) {
      m.compteurs.retourFamilier--;
      if (m.compteurs.retourFamilier === 0) invoquer(contenu, combat, m, 'loup-spectral', null);
    }
  }
  calculerOrdre(contenu, combat, rng);
  combat.instantane = null;
  combat.instantane = copieProfonde({ ...combat, evenements: [] });
}

/** Fait jouer l'IA jusqu'au prochain tour d'un joueur, ou jusqu'à la fin du combat. */
export function avancer(contenu: Contenu, combat: Combat, rng: Rng) {
  let garde = 0;
  while (!verifierFin(combat)) {
    if (++garde > 5000) throw new Error('Combat bloqué (boucle infinie)');
    if (combat.tour === 0 || combat.index >= combat.ordre.length) debutRound(contenu, combat, rng);
    const id = combat.ordre[combat.index];
    const x = combat.combattants.find((y) => y.id === id)!;
    if (!actif(x)) { combat.index++; continue; }
    if (combat.enAttente === x.id) return; // on attend déjà ce joueur
    const peutAgir = debutTour(contenu, combat, rng, x);
    if (verifierFin(combat)) return;
    if (!peutAgir || !actif(x)) { finTour(combat, x); combat.index++; continue; }
    if (x.controle) { combat.enAttente = x.id; return; }
    const action = choisirActionIA(contenu, combat, rng, x);
    executer(contenu, combat, rng, x, action);
    finTour(combat, x);
    combat.index++;
  }
}

/** Le joueur dont c'est le tour joue une action. */
export function jouerAction(contenu: Contenu, combat: Combat, rng: Rng, action: ActionCombat) {
  if (combat.resultat) throw new Error('Le combat est terminé');
  if (combat.enAttente !== action.acteur) throw new Error("Ce n'est pas le tour de ce personnage");
  const x = trouver(combat, action.acteur);
  verifierAction(contenu, combat, x, action);
  combat.enAttente = null;
  const rejoue = executer(contenu, combat, rng, x, action);
  if (rejoue && !combat.resultat) { combat.enAttente = x.id; return; }
  finTour(combat, x);
  combat.index++;
  avancer(contenu, combat, rng);
}

function verifierAction(contenu: Contenu, combat: Combat, x: Combattant, a: ActionCombat) {
  if (a.type === 'competence') {
    const k = competenceCombattant(contenu, x, a.competence);
    if (!k) throw new Error('Compétence inconnue');
    if (!competenceUtilisable(contenu, x, k.comp)) throw new Error('Compétence indisponible (mana, recharge ou silence)');
  }
  if (a.type === 'objet' && vrai(a.item)) {
    if (!contenu.objets[a.item] || (x.compteurs[`sac:${a.item}`] ?? 0) <= 0) throw new Error("Vous n'avez plus cet objet");
  } else {
    if (a.type === 'objet' && a.objet === 'potion' && x.potions <= 0) throw new Error('Plus de potion');
    if (a.type === 'objet' && a.objet === 'bombe' && x.bombes <= 0) throw new Error('Plus de bombe');
  }
  if (a.type === 'fuir' && !combat.fuitePossible) throw new Error('Impossible de fuir ce combat');
  if (a.type === 'pacifier') {
    const c = trouver(combat, a.cible);
    if (x.don?.id !== 'langue-universelle') throw new Error('Il faut le don Langue universelle');
    if (!pacifiable(x, c)) throw new Error('Cette créature ne peut pas être pacifiée maintenant');
  }
  if (a.type === 'viser') {
    const c = trouver(combat, a.cible);
    if (!ciblesValides(combat, x, 'ennemi', x.attaque.portee).some((y) => y.id === c.id)) throw new Error(`${c.nom} est hors de portée`);
    if (sansMembres(c)) throw new Error(`${c.nom} n'a ni tête ni membres à viser`);
  }
  if (a.type === 'se_cacher' && aEtat(x, 'furtif')) throw new Error('Vous êtes déjà caché');
}

/** Chance de réussir à se cacher (Agilité contre la perception des ennemis). */
export function chanceSeCacher(combat: Combat, x: Combattant): number {
  const perception = Math.max(0, ...adversaires(combat, x).map((y) => y.caracs.ESP));
  let p = 0.35 + 0.03 * (x.caracs.AGI - perception);
  if (x.refId === 'ombre' || x.don?.id === 'pas-de-l-ombre') p += 0.2;
  return Math.min(0.85, Math.max(0.15, p));
}

function pacifiable(x: Combattant, c: Combattant) {
  return actif(c) && c.camp !== x.camp && !c.boss && (c.categorie === 'bete' || c.categorie === 'demon') && c.pv / c.pvMax <= (x.don?.parametres.seuil_pacifier ?? 0.3);
}

/** Exécute une action. Renvoie true si l'acteur rejoue immédiatement (objet gratuit). */
function executer(contenu: Contenu, combat: Combat, rng: Rng, x: Combattant, a: ActionCombat): boolean {
  switch (a.type) {
    case 'attaque': {
      log(combat, { type: 'action', source: x.id, cible: a.cible, competence: 'attaque', texte: `${x.nom} attaque.` });
      attaqueSimple(contenu, combat, rng, x, combat.combattants.find((y) => y.id === a.cible) ?? null);
      return false;
    }
    case 'competence': {
      const k = competenceCombattant(contenu, x, a.competence)!;
      x.mana -= coutMana(x, k.comp);
      // chaque utilisation fait progresser la maîtrise (comptée à la fin du combat)
      if (x.type === 'heros') { const cu = `usage:${competenceDeBase(k.comp.id)}`; x.compteurs[cu] = (x.compteurs[cu] ?? 0) + 1; }
      if (vrai(k.comp.recharge)) x.recharges[k.comp.id] = k.comp.recharge + 1;
      if (k.comp.id === 'souffle-draconique') x.compteurs.souffle = 1;
      log(combat, { type: 'action', source: x.id, cible: a.cible, competence: k.comp.id, texte: `${x.nom} utilise ${k.comp.nom} !` });
      appliquerEffets(contenu, combat, rng, x, k.comp, k.rang, vrai(a.cible) ? combat.combattants.find((y) => y.id === a.cible) ?? null : null);
      // Mimétisme : copier une compétence d'ennemi
      if (x.camp === 'ennemis' && x.type === 'ennemi') {
        for (const m of adversaires(combat, x).filter((y) => y.don?.id === 'mimetisme' && !vrai(y.compteurs.copie))) {
          m.competencesPropres.push({ ...k.comp, id: `copie:${k.comp.id}`, nom: `${k.comp.nom} (copiée)`, cout: 4, ia: { priorite: 2, quand: 'toujours' } });
          m.compteurs.copie = 1;
          log(combat, { type: 'info', cible: m.id, texte: `${m.nom} copie la technique « ${k.comp.nom} » ! (Mimétisme)` });
        }
      }
      return false;
    }
    case 'objet': {
      const cible = vrai(a.cible) ? combat.combattants.find((y) => y.id === a.cible) ?? x : x;
      const duSac = vrai(a.item);
      const objetId = duSac ? a.item! : a.objet === 'potion' ? 'potion-soin-petite' : 'bombe-feu';
      const obj = contenu.objets[objetId];
      const economise = x.passif?.id === 'fioles-optimisees' && chance(rng, x.passif.parametres.economie ?? 0.25);
      if (duSac) {
        // objet du sac : il sort de l'inventaire à la fin du combat (compteur « utilise:<id> »)
        if (!economise) { x.compteurs[`sac:${objetId}`] = (x.compteurs[`sac:${objetId}`] ?? 0) - 1; x.compteurs[`utilise:${objetId}`] = (x.compteurs[`utilise:${objetId}`] ?? 0) + 1; }
      } else if (a.objet === 'potion') { if (!economise) x.potions--; } else if (!economise) x.bombes--;
      if (!duSac && a.objet === 'potion' && !economise && (x.compteurs.potionsInventaire ?? 0) > 0) { x.compteurs.potionsInventaire--; x.compteurs.potionsUtilisees = (x.compteurs.potionsUtilisees ?? 0) + 1; }
      log(combat, { type: 'action', source: x.id, cible: cible.id, competence: objetId, texte: `${x.nom} utilise : ${obj.nom}${economise ? ' (sans la consommer !)' : ''}.` });
      appliquerEffets(contenu, combat, rng, x, { id: objetId, nom: obj.nom, description: '', cout: 0, recharge: 0, cible: obj.cible, portee: 'distance', effets: obj.effets, ia: { priorite: 1, quand: 'toujours' } }, 1, cible, true);
      if ((x.compteurs.objetGratuit ?? 0) > 0) { x.compteurs.objetGratuit = 0; log(combat, { type: 'info', source: x.id, texte: `${x.nom} agit encore ! (Réserve du Néant)` }); return true; }
      return false;
    }
    case 'defendre':
      ajouterEtat(combat, x, { id: 'garde', duree: 2, valeur: 0.5, source: x.id, cumul: 1 });
      x.mana = Math.min(x.manaMax, x.mana + Math.round(x.manaMax * 0.1));
      log(combat, { type: 'action', source: x.id, texte: `${x.nom} se met en garde.` });
      return false;
    case 'changer_rang':
      x.rang = x.rang === 'avant' ? 'arriere' : 'avant';
      log(combat, { type: 'action', source: x.id, texte: `${x.nom} passe au rang ${x.rang === 'avant' ? 'avant' : 'arrière'}.` });
      return false;
    case 'pacifier': {
      const c = trouver(combat, a.cible);
      c.parti = true;
      log(combat, { type: 'fuite', source: x.id, cible: c.id, texte: `${x.nom} parle à ${c.nom}, qui renonce au combat et s'éloigne. (Langue universelle)` });
      return false;
    }
    case 'viser': {
      const v = VISEES[a.partie];
      const c = trouver(combat, a.cible);
      log(combat, { type: 'action', source: x.id, cible: c.id, competence: 'attaque', texte: `${x.nom} vise ${v.nom} de ${c.nom}.` });
      const comp: Competence = {
        id: 'attaque-visee', nom: 'Attaque visée', description: '', cout: 0, recharge: 0, cible: 'ennemi', portee: x.attaque.portee,
        effets: [{ type: 'degats', puissance: x.attaque.puissance * v.degats, stat: x.attaque.stat, element: x.attaque.element, coups: 1, critique_garanti: false, cout_pv_pourcent: 0 }],
        ia: { priorite: 1, quand: 'toujours' },
      };
      const avant = combat.evenements.length;
      x.compteurs.modToucher = v.toucher;
      appliquerEffets(contenu, combat, rng, x, comp, 1, c);
      x.compteurs.modToucher = 0;
      const touche = combat.evenements.slice(avant).some((e) => e.type === 'degats' && e.source === x.id);
      if (touche && actif(c) && chance(rng, v.chance * (c.boss ? 0.5 : 1))) {
        ajouterEtat(combat, c, { id: v.etat, duree: v.duree, valeur: v.valeur, source: x.id, cumul: 1 });
        log(combat, { type: 'etat', source: x.id, cible: c.id, texte: `${c.nom} ${v.texte}.` });
      }
      return false;
    }
    case 'se_cacher': {
      if (chance(rng, chanceSeCacher(combat, x))) {
        ajouterEtat(combat, x, { id: 'furtif', duree: 2, valeur: 0, source: x.id, cumul: 1 });
        log(combat, { type: 'action', source: x.id, texte: `${x.nom} se fond dans l'ombre : impossible à cibler, sa prochaine attaque sera critique.` });
      } else log(combat, { type: 'action', source: x.id, texte: `${x.nom} tente de se cacher… mais se fait repérer.` });
      return false;
    }
    case 'fuir': {
      const p = 0.5 + 0.03 * (x.caracs.AGI - Math.max(...adversaires(combat, x).map((y) => y.caracs.AGI)));
      if (chance(rng, Math.min(0.9, Math.max(0.2, p)))) {
        combat.resultat = 'fuite';
        combat.enAttente = null;
        log(combat, { type: 'fin', texte: 'Le groupe prend la fuite !' });
      } else log(combat, { type: 'info', source: x.id, texte: `${x.nom} tente de fuir, sans succès.` });
      return false;
    }
  }
}

// ───────────────────────────── IA ─────────────────────────────

function conditionIA(combat: Combat, x: Combattant, comp: Competence): boolean {
  const q = comp.ia.quand;
  const amis = allies(combat, x);
  switch (q) {
    case 'allie_blesse': return amis.some((a) => a.pv / a.pvMax < 0.6 && a.type !== 'invocation');
    case 'soi_blesse': return x.pv / x.pvMax < 0.5;
    case 'plusieurs_ennemis': return adversaires(combat, x).length >= 2;
    case 'debut_combat': return combat.tour <= 2;
    case 'cible_faible': return adversaires(combat, x).some((a) => a.pv / a.pvMax < 0.4);
    case 'allie_ko': return combat.combattants.some((a) => a.camp === x.camp && a.ko && a.type !== 'invocation');
    default: return true;
  }
}

function dejaActif(combat: Combat, x: Combattant, comp: Competence): boolean {
  // évite de relancer un buff déjà en place sur soi
  const ef = comp.effets.find((e) => e.type === 'etat');
  if (ef && ef.type === 'etat' && (comp.cible === 'soi' || comp.cible === 'tous_allies') && aEtat(x, ef.etat as EtatId)) return true;
  if (comp.effets.every((e) => e.type === 'invocation')) {
    return allies(combat, x).filter((a) => a.maitreId === x.id && a.dureeInvocation !== null).length >= 2;
  }
  return false;
}

export function choisirActionIA(contenu: Contenu, combat: Combat, rng: Rng, x: Combattant): ActionCombat {
  const amis = allies(combat, x).filter((a) => a.type !== 'invocation');
  // Potion si en danger
  if (x.potions > 0 && x.pv / x.pvMax < 0.35) return { type: 'objet', acteur: x.id, objet: 'potion', cible: x.id };
  // Bombe improvisée
  if (x.bombes > 0 && adversaires(combat, x).length >= 2) return { type: 'objet', acteur: x.id, objet: 'bombe' };
  // Pacifier une bête affaiblie
  if (x.don?.id === 'langue-universelle') {
    const p = adversaires(combat, x).find((c) => pacifiable(x, c));
    if (p) return { type: 'pacifier', acteur: x.id, cible: p.id };
  }
  const candidats = toutesCompetences(contenu, x)
    .filter(({ comp }) => competenceUtilisable(contenu, x, comp) && conditionIA(combat, x, comp) && !dejaActif(combat, x, comp))
    .map(({ comp }) => comp);
  let meilleure: Competence | null = null;
  for (const comp of candidats) {
    if (!meilleure || comp.ia.priorite > meilleure.ia.priorite) meilleure = comp;
  }
  // garder un peu de mana : 25 % de chances de faire une attaque simple si la compétence est « basique »
  if (meilleure && meilleure.ia.priorite <= 2 && x.mana < x.manaMax * 0.3 && chance(rng, 0.5)) meilleure = null;
  if (meilleure) {
    let cible: string | undefined;
    if (meilleure.cible === 'allie') {
      const blesse = trier([...amis], (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0];
      cible = blesse?.id ?? x.id;
    } else if (meilleure.cible === 'allie_ko') {
      cible = combat.combattants.find((a) => a.camp === x.camp && a.ko && a.type !== 'invocation')?.id;
    } else if (meilleure.cible === 'ennemi') {
      cible = choisirCibleEnnemie(combat, rng, x, meilleure.portee)?.id;
    }
    return { type: 'competence', acteur: x.id, competence: meilleure.id, cible };
  }
  const c = choisirCibleEnnemie(combat, rng, x, x.attaque.portee);
  return { type: 'attaque', acteur: x.id, cible: c?.id ?? '' };
}

function choisirCibleEnnemie(combat: Combat, rng: Rng, x: Combattant, portee: 'melee' | 'distance'): Combattant | undefined {
  const v = ciblesValides(combat, x, 'ennemi', portee);
  if (v.length === 0) return undefined;
  if (x.camp === 'heros') {
    // les héros concentrent leurs coups sur la cible la plus affaiblie
    return trier([...v], (a, b) => a.pv - b.pv)[0];
  }
  // les ennemis frappent plutôt le rang avant et les cibles visibles
  const poids = v.map((y) => (y.rang === 'avant' ? 2 : 1) * (y.type === 'invocation' ? 0.7 : 1));
  let r = aleatoire(rng) * poids.reduce((a, b) => a + b, 0);
  for (let i = 0; i < v.length; i++) { r -= poids[i]; if (r <= 0) return v[i]; }
  return v[v.length - 1];
}

/** Second départ : rejoue le tour en cours depuis son début (une fois par session, géré par la partie). */
export function annulerTour(combat: Combat): Combat {
  if (!combat.instantane) throw new Error('Aucun tour à annuler');
  const restaure = copieProfonde(combat.instantane);
  restaure.evenements = [...combat.evenements.filter((e) => e.tour < combat.tour), { tour: combat.tour, type: 'info', texte: 'Le temps se replie… le tour recommence ! (Second départ)' }];
  restaure.instantane = combat.instantane;
  restaure.resultat = null;
  return restaure;
}

/** Actions proposées au joueur dont c'est le tour (pour l'interface). */
export function actionsDisponibles(contenu: Contenu, combat: Combat, acteurId: string) {
  const x = trouver(combat, acteurId);
  const comps = toutesCompetences(contenu, x).map(({ comp, rang }) => ({
    comp, rang,
    utilisable: competenceUtilisable(contenu, x, comp),
    raison: aEtat(x, 'silence') ? 'Réduit au silence' : (x.recharges[comp.id] ?? 0) > 0 ? `Recharge : ${x.recharges[comp.id]} tour(s)` : x.mana < coutMana(x, comp) ? 'Mana insuffisant' : comp.id === 'souffle-draconique' && vrai(x.compteurs.souffle) ? 'Déjà utilisé' : '',
  }));
  return {
    competences: comps,
    potions: x.potions,
    bombes: x.bombes,
    sac: objetsDuSac(contenu, x),
    pacifier: x.don?.id === 'langue-universelle' ? adversaires(combat, x).filter((c) => pacifiable(x, c)).map((c) => c.id) : [],
    fuite: combat.fuitePossible,
    ciblesMelee: ciblesValides(combat, x, 'ennemi', 'melee').map((c) => c.id),
    ciblesDistance: ciblesValides(combat, x, 'ennemi', 'distance').map((c) => c.id),
    allies: allies(combat, x).map((c) => c.id),
    alliesKo: ciblesValides(combat, x, 'allie_ko', 'distance').map((c) => c.id),
  };
}

/** Récompenses d'une victoire, réparties entre les héros présents. */
export function recompensesCombat(contenu: Contenu, combat: Combat, rng: Rng) {
  const vaincus = combat.combattants.filter((x) => x.camp === 'ennemis' && x.type === 'ennemi' && (x.ko || x.parti) && x.recompenses);
  const heros = combat.combattants.filter((x) => x.type === 'heros');
  const facteur = combat.multiplicateurs.pv / Math.max(1, combat.multiplicateurs.puissance);
  const xpTotal = vaincus.reduce((a, x) => a + x.recompenses!.xp, 0);
  const orTotal = vaincus.reduce((a, x) => a + x.recompenses!.or, 0);
  const objets: string[] = [];
  for (const v of vaincus) for (const o of v.recompenses!.objets) if (chance(rng, o.chance)) objets.push(o.id);
  return {
    xpParHeros: Math.round(xpTotal * facteur),
    orParHeros: Math.round((orTotal * facteur) / Math.max(1, heros.length) * 1.5),
    objets,
  };
}

// ───────────────────────────── Estimation (pour l'interface et l'IA maison) ─────────────────────────────

export interface Estimation {
  possible: boolean;
  /** Pourquoi c'est impossible (phrase en français), ou null. */
  raison: string | null;
  /** Chance de réussite (toucher, se cacher, fuir), de 0 à 1 ; null si sans objet. */
  reussite: number | null;
  critique: number | null;
  mana: number;
  /** Dégâts estimés sur la cible principale (sans critique), min et max. */
  degats: [number, number] | null;
  soin: [number, number] | null;
  nbCibles: number;
  effets: string[];
}

/** Sert seulement à dire à `chanceToucher` qu'il s'agit d'une attaque de base (bonus de fiabilité). */
const ATTAQUE_DE_BASE: Competence = { id: 'attaque', nom: 'Attaque', description: '', cout: 0, recharge: 0, cible: 'ennemi', portee: 'melee', effets: [{ type: 'charge_rune', nombre: 0 }], ia: { priorite: 1, quand: 'toujours' } };

const estimationImpossible = (raison: string): Estimation => ({ possible: false, raison, reussite: null, critique: null, mana: 0, degats: null, soin: null, nbCibles: 0, effets: [] });

/** Estime une action SANS la jouer : faisabilité, chances, mana, dégâts. Ne modifie rien. */
export function estimerAction(contenu: Contenu, combat: Combat, a: ActionCombat): Estimation {
  const x = combat.combattants.find((y) => y.id === a.acteur);
  if (!x) return estimationImpossible('Personnage inconnu.');
  if (combat.resultat) return estimationImpossible('Le combat est terminé.');
  if (combat.enAttente !== x.id) return estimationImpossible(`Ce n'est pas le tour de ${x.nom}.`);
  try { verifierAction(contenu, combat, x, a); } catch (e) { return estimationImpossible(`${(e as Error).message}.`); }
  const variance = contenu.config.combat.variance_degats;
  const res: Estimation = { possible: true, raison: null, reussite: null, critique: null, mana: 0, degats: null, soin: null, nbCibles: 1, effets: [] };

  const estimerDegats = (cible: Combattant, puissance: number, stat: Carac, element: Element, rang: number, coups: number, maitrise = 0) => {
    const brut = puissance * (1 + 0.1 * (rang - 1)) * (1 + contenu.config.maitrise.degats_par_rang * maitrise) * (1 + x.caracs[stat] / 20) * multiplicateurDegatsSource(combat, x, cible, element);
    const net = Math.max(1, brut * reductionCible(combat, cible, element)) * coups;
    return [Math.max(1, Math.round(net * (1 - variance))), Math.max(1, Math.round(net * (1 + variance)))] as [number, number];
  };
  const ajouter = (d: [number, number]) => { res.degats = res.degats ? [res.degats[0] + d[0], res.degats[1] + d[1]] : d; };
  const verifierCible = (id: string | undefined, portee: 'melee' | 'distance'): Combattant | string => {
    const c = vrai(id) ? combat.combattants.find((y) => y.id === id) : undefined;
    if (!c) return 'Il faut choisir une cible.';
    if (!actif(c)) return `${c.nom} est déjà hors de combat.`;
    if (c.camp === x.camp) return `${c.nom} est un allié.`;
    if (!ciblesValides(combat, x, 'ennemi', portee).some((y) => y.id === c.id)) {
      if (aEtat(c, 'furtif')) return `${c.nom} est caché : impossible de le viser.`;
      const prov = x.etats.find((e) => e.id === 'provoque');
      if (prov) return `Vous êtes provoqué : vous devez attaquer ${combat.combattants.find((y) => y.id === prov.source)?.nom ?? 'votre provocateur'}.`;
      if (portee === 'melee' && c.rang === 'arriere') return `${c.nom} est protégé au rang arrière : il faut une attaque à distance, ou éliminer d'abord le rang avant.`;
      return `${c.nom} est hors de portée.`;
    }
    return c;
  };

  switch (a.type) {
    case 'attaque':
    case 'viser': {
      const c = verifierCible(a.cible, x.attaque.portee);
      if (typeof c === 'string') return estimationImpossible(c);
      const v = a.type === 'viser' ? VISEES[a.partie] : null;
      x.compteurs.modToucher = v?.toucher ?? 0;
      res.reussite = chanceToucher(contenu, x, c, ATTAQUE_DE_BASE);
      x.compteurs.modToucher = 0;
      res.critique = aEtat(x, 'furtif') ? 1 : chanceCritique(contenu, x, c);
      ajouter(estimerDegats(c, x.attaque.puissance * (v?.degats ?? 1), x.attaque.stat, x.attaque.element, 1, 1));
      if (v) res.effets.push(`${Math.round(v.chance * (c.boss ? 0.5 : 1) * 100)} % : ${NOMS_ETATS[v.etat].toLowerCase()}`);
      return res;
    }
    case 'competence': {
      const k = competenceCombattant(contenu, x, a.competence)!;
      res.mana = coutMana(x, k.comp);
      let principale: Combattant | null = null;
      if (k.comp.cible === 'ennemi') {
        const c = verifierCible(a.cible, k.comp.portee);
        if (typeof c === 'string') return estimationImpossible(c);
        principale = c;
      } else if (k.comp.cible === 'tous_ennemis' || k.comp.cible === 'ennemi_aleatoire') {
        principale = ciblesValides(combat, x, 'ennemi', 'distance')[0] ?? null;
        res.nbCibles = k.comp.cible === 'tous_ennemis' ? adversaires(combat, x).length : 1;
      } else if (k.comp.cible === 'allie' || k.comp.cible === 'allie_ko') {
        const liste = k.comp.cible === 'allie' ? allies(combat, x) : ciblesValides(combat, x, 'allie_ko', 'distance');
        if (!vrai(a.cible) || !liste.some((y) => y.id === a.cible)) return estimationImpossible(k.comp.cible === 'allie_ko' ? 'Il faut choisir un allié K.O.' : 'Il faut choisir un allié.');
      } else if (k.comp.cible === 'tous_allies') res.nbCibles = allies(combat, x).length;
      for (const ef of k.comp.effets) {
        if (ef.type === 'degats' && principale) {
          ajouter(estimerDegats(principale, ef.puissance, ef.stat, ef.element as Element, k.rang, ef.coups, maitriseDe(x, k.comp.id)));
          res.reussite ??= chanceToucher(contenu, x, principale, k.comp);
          res.critique ??= ef.critique_garanti || aEtat(x, 'furtif') ? 1 : chanceCritique(contenu, x, principale);
        } else if (ef.type === 'soin') {
          const s = ef.puissance * (1 + 0.1 * (k.rang - 1)) * (1 + contenu.config.maitrise.degats_par_rang * maitriseDe(x, k.comp.id)) * (1 + x.caracs[ef.stat] / 20);
          res.soin = [Math.round(s), Math.round(s)];
        } else if (ef.type === 'etat') res.effets.push(`${ef.chance < 1 ? `${Math.round(ef.chance * 100)} % : ` : ''}${NOMS_ETATS[ef.etat as EtatId].toLowerCase()}`);
        else if (ef.type === 'bouclier') res.effets.push(`bouclier (${Math.round(ef.pourcent_pv * 100)} % des PV)`);
        else if (ef.type === 'invocation') res.effets.push(`invocation : ${contenu.ennemis[ef.creature]?.nom ?? ef.creature}`);
      }
      return res;
    }
    case 'se_cacher':
      res.reussite = chanceSeCacher(combat, x);
      res.effets.push('furtif : impossible à cibler, prochaine attaque critique');
      return res;
    case 'fuir':
      res.reussite = Math.min(0.9, Math.max(0.2, 0.5 + 0.03 * (x.caracs.AGI - Math.max(...adversaires(combat, x).map((y) => y.caracs.AGI)))));
      return res;
    case 'objet':
      if (a.objet === 'potion') {
        const s = 16 * 1.5 * (x.passif?.id === 'fioles-optimisees' ? 1 + (x.passif.parametres.efficacite ?? 0.4) : 1);
        res.soin = [Math.round(s), Math.round(s)];
      }
      return res;
    case 'defendre':
      res.effets.push('−50 % de dégâts reçus jusqu\'au prochain tour, +10 % de mana');
      return res;
    default:
      return res;
  }
}
