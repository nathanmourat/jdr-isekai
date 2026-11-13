/**
 * IA maison de Velmaris : comprend une action écrite librement, la traduit en action de jeu,
 * la fait vérifier par le moteur (faisabilité, chances, mana) et propose des alternatives.
 *
 * Elle ne décide JAMAIS des chiffres : toutes les chances et tous les dégâts viennent du moteur
 * (`estimerAction`), ce qui garde l'équilibrage intact.
 */
import type { Contenu } from '../contenu/types';
import { origineCompetence } from '../moteur/fiche';
import type { Competence } from '../contenu/schemas';
import {
  actionsDisponibles, adversaires, allies, estimerAction, NOMS_ETATS, VISEES,
  type ActionCombat, type Combat, type Combattant, type Element, type Estimation, type PartieVisee,
} from '../moteur/combat';
import { creerTechnique, elementDe, idFusion, NOM_ELEMENT, peutApprendre, type Technique } from '../moteur/fusions';
import { competencesConnues, type Heros } from '../moteur/personnage';
import { predire, type ModeleIA } from './classificateur';
import type { Intention } from './corpus';
import * as modeleBrut from './modele.json';
import { correspondance, hachage, mots, normaliser, ressemble } from './texte';
import { copieProfonde, entrees, trier, valeurs, vrai } from '../moteur/outils';

// navigateur / Node : le JSON est sous « default » ; Roblox (Luau) : le module est le JSON lui-même
const MODELE = ((modeleBrut as { default?: unknown }).default ?? modeleBrut) as unknown as ModeleIA;

export interface ContexteIA {
  contenu: Contenu;
  combat: Combat;
  /** id du combattant qui joue (ex. « h:h1 ») */
  acteur: string;
  heros: Heros | null;
  grimoire: Record<string, Technique>;
}

export type ActionProposee =
  | { kind: 'combat'; action: ActionCombat }
  | { kind: 'fusion'; parent: string; secondaire: string; cible?: string };

export interface Proposition {
  libelle: string;
  action: ActionProposee;
  estimation: Estimation;
  /** résumé chiffré : « 78 % de toucher · 14–17 dégâts · 6 mana » */
  details: string;
  /** remarque tactique éventuelle */
  conseil: string;
  score: number;
  /** D'où vient ce que la proposition utilise : « compétence de départ de l'Ombre », « objet de ton inventaire »… */
  source: string;
}

export interface Interpretation {
  texte: string;
  intention: Intention;
  confiance: number;
  /** l'action comprise (null si rien de jouable n'a été compris) */
  proposition: Proposition | null;
  possible: boolean;
  /** réponse de l'IA, en français */
  message: string;
  alternatives: Proposition[];
  /** une proposition irréalisable ou incomprise compte comme un essai (3 par tour) */
  compteCommeEssai: boolean;
  /** pour « analyser » : ce que le héros apprend sur les ennemis */
  informations: string[];
}

// ───────────────────────────── Vocabulaire ─────────────────────────────

const MOTS_ELEMENTS: Record<string, string[]> = {
  feu: ['feu', 'flamme', 'flammes', 'bruler', 'brule', 'enflamme', 'enflammer', 'incendie', 'immole', 'braise', 'brasier'],
  glace: ['glace', 'givre', 'geler', 'gele', 'congele', 'congeler', 'froid', 'gel', 'glacial'],
  foudre: ['foudre', 'eclair', 'eclairs', 'electrique', 'electrocute', 'tonnerre', 'foudroie'],
  sacre: ['lumiere', 'sacre', 'sacree', 'sainte', 'divine', 'benie'],
  ombre: ['ombre', 'tenebres', 'obscurite'],
  poison: ['poison', 'venin', 'empoisonne', 'toxique', 'toxine'],
};
const MOTS_PARTIES: Record<PartieVisee, string[]> = {
  tete: ['tete', 'crane', 'visage', 'yeux', 'oeil', 'gorge', 'nuque', 'front'],
  jambes: ['jambe', 'jambes', 'genou', 'genoux', 'pied', 'pieds', 'cheville', 'chevilles', 'jarret', 'jarrets'],
  bras: ['bras', 'main', 'poignet', 'arme', 'epee', 'hache', 'baton'],
};
const MOTS_COMBINER = ['combine', 'combiner', 'melange', 'melanger', 'fusion', 'fusionne', 'fusionner', 'mixe', 'mix', 'associe', 'combo'];

function trouverMots(m: string[], liste: string[]) {
  return m.some((x) => liste.some((y) => ressemble(x, y)));
}
function elementsCites(m: string[]): string[] {
  return entrees(MOTS_ELEMENTS).filter(([, l]) => trouverMots(m, l)).map(([e]) => e);
}
function partieCitee(m: string[]): PartieVisee | null {
  return (entrees(MOTS_PARTIES).find(([, l]) => trouverMots(m, l))?.[0] as PartieVisee) ?? null;
}

// ───────────────────────────── Entités ─────────────────────────────

/** Compétences citées : nom reconnu (à une faute près par mot). */
function competencesCitees(contenu: Contenu, m: string[], ids: string[]): { id: string; score: number }[] {
  return trier(ids
    .map((id) => {
      const c = contenu.competences[id];
      if (!c) return { id, score: 0 };
      const cles = mots(c.nom).filter((x) => x.length > 2 && !['de', 'du', 'des'].includes(x));
      const s = correspondance(c.nom, m);
      // un nom d'un seul mot doit être présent ; un nom de plusieurs mots : au moins 2 mots ou 75 %
      return { id, score: cles.length <= 1 ? (s === 1 ? 1 : 0) : s >= 0.75 || (s >= 0.5 && cles.length >= 3) ? s : 0 };
    })
    .filter((x) => x.score > 0), (a, b) => b.score - a.score);
}

function ennemiCite(combat: Combat, x: Combattant, m: string[]): { cible: Combattant | null; tous: boolean } {
  const ennemis = adversaires(combat, x);
  const tous = trouverMots(m, ['tous', 'eux', 'groupe', 'ensemble']) || m.join(' ').includes('tout le monde');
  if (trouverMots(m, ['faible', 'blesse', 'agonisant', 'mourant'])) return { cible: trier([...ennemis], (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0] ?? null, tous };
  if (trouverMots(m, ['boss', 'chef', 'gros', 'costaud'])) return { cible: trier([...ennemis], (a, b) => b.pvMax - a.pvMax)[0] ?? null, tous };
  if (trouverMots(m, ['mage', 'sorcier', 'lanceur', 'pretre'])) {
    const mage = ennemis.find((e) => e.attaque.stat === 'INT' || e.rang === 'arriere');
    if (mage) return { cible: mage, tous };
  }
  let meilleur: { e: Combattant; s: number } | null = null;
  for (const e of ennemis) {
    // « Loup gris B » : nom de base « Loup gris », lettre « b »
    const n = e.nom.length;
    const finLettre = n >= 2 && e.nom.charAt(n - 2) === ' ' && e.nom.charCodeAt(n - 1) >= 65 && e.nom.charCodeAt(n - 1) <= 90;
    const nomBase = finLettre ? e.nom.slice(0, n - 2) : e.nom;
    let s = correspondance(nomBase, m);
    const lettre = finLettre ? e.nom.charAt(n - 1).toLowerCase() : undefined;
    if (s > 0 && vrai(lettre) && m.includes(lettre)) s += 0.5;
    if (s > 0 && (!meilleur || s > meilleur.s || (s === meilleur.s && e.pv < meilleur.e.pv))) meilleur = { e, s };
  }
  if (meilleur && meilleur.s >= 0.5) return { cible: meilleur.e, tous };
  if (trouverMots(m, ['arriere', 'derriere', 'fond'])) return { cible: ennemis.find((e) => e.rang === 'arriere') ?? null, tous };
  // « lui », « le » : la dernière cible du héros, sinon l'ennemi seul
  const derniere = vrai(x.derniereCible) ? ennemis.find((e) => e.id === x.derniereCible) : undefined;
  return { cible: derniere ?? (ennemis.length === 1 ? ennemis[0] : null), tous };
}

function allieCite(combat: Combat, x: Combattant, m: string[]): Combattant | null {
  const amis = allies(combat, x).filter((a) => a.type !== 'invocation');
  if (trouverMots(m, ['moi', 'me', 'soigne', 'mes']) && !amis.some((a) => a.id !== x.id && correspondance(a.nom, m) > 0)) {
    if (m.includes('me') || m.includes('moi') || m.includes('mes')) return x;
  }
  for (const a of amis) if (correspondance(a.nom, m) >= 0.5) return a;
  return null;
}

// ───────────────────────────── Estimations et libellés ─────────────────────────────

function pc(x: number | null) { return x === null ? '' : `${Math.round(x * 100)} %`; }

function details(e: Estimation): string {
  const l: string[] = [];
  if (e.reussite !== null) l.push(`${pc(e.reussite)} de réussite`);
  if (e.degats) l.push(`${e.degats[0]}–${e.degats[1]} dégâts${e.nbCibles > 1 ? ` (×${e.nbCibles} cibles)` : ''}`);
  if (e.soin) l.push(`+${e.soin[0]} PV`);
  if (vrai(e.mana)) l.push(`${e.mana} mana`);
  if (e.critique !== null && e.critique >= 0.99) l.push('critique assuré');
  return l.join(' · ');
}

function nomCible(ctx: ContexteIA, id?: string) {
  return vrai(id) ? ctx.combat.combattants.find((c) => c.id === id)?.nom ?? '?' : '';
}

/** Explique d'où vient l'action proposée (compétence de départ, de niveau, du grimoire, objet de l'inventaire…). */
function sourceAction(ctx: ContexteIA, a: ActionProposee): string {
  if (a.kind === 'fusion') return 'fusion de deux de tes compétences';
  const x = a.action;
  if (x.type === 'competence') {
    if (x.competence.startsWith('copie:')) return 'technique copiée sur un ennemi (don Mimétisme)';
    return ctx.heros ? origineCompetence(ctx.contenu, ctx.heros, x.competence) : '';
  }
  if (x.type === 'objet') return x.objet === 'potion' ? 'potion de ton inventaire' : 'bombe de ta réserve';
  if (x.type === 'pacifier') return 'don Langue universelle';
  if (x.type === 'attaque' || x.type === 'viser') return 'attaque de base, fiable';
  return '';
}

function libelleAction(ctx: ContexteIA, a: ActionProposee): string {
  if (a.kind === 'fusion') {
    const p = ctx.contenu.competences[a.parent], q = ctx.contenu.competences[a.secondaire];
    return `Fusion ${p?.nom ?? a.parent} + ${q?.nom ?? a.secondaire}${vrai(a.cible) ? ` sur ${nomCible(ctx, a.cible)}` : ''}`;
  }
  const x = a.action;
  switch (x.type) {
    case 'attaque': return `Attaque sur ${nomCible(ctx, x.cible)}`;
    case 'viser': return `Viser ${VISEES[x.partie].nom} de ${nomCible(ctx, x.cible)}`;
    case 'competence': {
      const comp = competenceDe(ctx, x.competence);
      return `${comp?.nom ?? x.competence}${vrai(x.cible) ? ` sur ${nomCible(ctx, x.cible)}` : ''}`;
    }
    case 'objet': return x.objet === 'potion' ? `Potion de soin${vrai(x.cible) ? ` pour ${nomCible(ctx, x.cible)}` : ''}` : 'Lancer une bombe';
    case 'defendre': return 'Se défendre';
    case 'changer_rang': return 'Changer de rang';
    case 'pacifier': return `Parler à ${nomCible(ctx, x.cible)} pour le pacifier`;
    case 'se_cacher': return 'Se cacher';
    case 'fuir': return 'Fuir le combat';
  }
}

function competenceDe(ctx: ContexteIA, id: string): Competence | null {
  const x = ctx.combat.combattants.find((c) => c.id === ctx.acteur)!;
  return x.competencesPropres.find((k) => k.id === id) ?? ctx.contenu.competences[id] ?? ctx.grimoire[id] ?? null;
}

/** Estimation d'une fusion : on l'essaie sur une copie du combat (rien n'est modifié). */
function estimerFusion(ctx: ContexteIA, parent: string, secondaire: string, cible?: string): { estimation: Estimation; technique: Technique | null } {
  const existante = ctx.grimoire[idFusion(parent, secondaire)];
  const r = existante ? { ok: true as const, technique: existante } : creerTechnique(ctx.contenu, parent, secondaire, ctx.heros?.nom ?? '');
  const impossible = (raison: string) => ({ estimation: { possible: false, raison, reussite: null, critique: null, mana: 0, degats: null, soin: null, nbCibles: 0, effets: [] } as Estimation, technique: null });
  if (!r.ok) return impossible(r.raison);
  if (ctx.heros && !(ctx.heros.variantes[r.technique.parent] ?? []).includes(r.technique.id)) {
    const pb = peutApprendre(ctx.contenu, ctx.heros, r.technique);
    if (vrai(pb)) return impossible(pb);
  }
  const copie = copieProfonde(ctx.combat);
  const x = copie.combattants.find((c) => c.id === ctx.acteur)!;
  x.competencesPropres.push(r.technique);
  x.compteurs[`rang:${r.technique.id}`] = ctx.heros?.rangsCompetences[parent] ?? 1;
  return { estimation: estimerAction(ctx.contenu, copie, { type: 'competence', acteur: ctx.acteur, competence: r.technique.id, cible }), technique: r.technique };
}

function proposer(ctx: ContexteIA, action: ActionProposee): Proposition {
  const estimation = action.kind === 'fusion' ? estimerFusion(ctx, action.parent, action.secondaire, action.cible).estimation : estimerAction(ctx.contenu, ctx.combat, action.action);
  return { libelle: libelleAction(ctx, action), action, estimation, details: details(estimation), conseil: '', score: 0, source: sourceAction(ctx, action) };
}

// ───────────────────────────── Conseiller tactique ─────────────────────────────

interface Preference { intention?: Intention; element?: string | null; cible?: string | null; distance?: boolean }

/** Les meilleures actions possibles maintenant, avec un score et un conseil. */
export function conseiller(ctx: ContexteIA, pref: Preference = {}, nombre = 3): Proposition[] {
  const { contenu, combat } = ctx;
  const x = combat.combattants.find((c) => c.id === ctx.acteur);
  if (!x || combat.enAttente !== x.id) return [];
  const dispo = actionsDisponibles(contenu, combat, x.id);
  const ennemis = adversaires(combat, x);
  const amis = allies(combat, x).filter((a) => a.type !== 'invocation');
  const candidats: Proposition[] = [];
  const ajouter = (a: ActionProposee, bonus = 0) => {
    const p = proposer(ctx, a);
    if (!p.estimation.possible) return;
    p.score = valeur(ctx, x, p) + bonus + preference(ctx, p, pref);
    candidats.push(p);
  };
  const ciblesAttaque = x.attaque.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance;
  for (const id of ciblesAttaque) ajouter({ kind: 'combat', action: { type: 'attaque', acteur: x.id, cible: id } });
  const faible = trier([...ennemis].filter((e) => ciblesAttaque.includes(e.id)), (a, b) => a.pv - b.pv)[0];
  if (faible) ajouter({ kind: 'combat', action: { type: 'viser', acteur: x.id, cible: faible.id, partie: 'tete' } }, -0.05);
  for (const k of dispo.competences.filter((k) => k.utilisable)) {
    const comp = k.comp;
    if (comp.cible === 'ennemi') {
      const ids = comp.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance;
      for (const id of ids) ajouter({ kind: 'combat', action: { type: 'competence', acteur: x.id, competence: comp.id, cible: id } });
    } else if (comp.cible === 'allie') {
      const blesse = trier([...amis], (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0];
      if (blesse) ajouter({ kind: 'combat', action: { type: 'competence', acteur: x.id, competence: comp.id, cible: blesse.id } });
    } else if (comp.cible === 'allie_ko') {
      for (const id of dispo.alliesKo) ajouter({ kind: 'combat', action: { type: 'competence', acteur: x.id, competence: comp.id, cible: id } });
    } else ajouter({ kind: 'combat', action: { type: 'competence', acteur: x.id, competence: comp.id } });
  }
  if (dispo.potions > 0) {
    const blesse = trier([...amis], (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0];
    if (blesse) ajouter({ kind: 'combat', action: { type: 'objet', acteur: x.id, objet: 'potion', cible: blesse.id } });
  }
  if (dispo.bombes > 0) ajouter({ kind: 'combat', action: { type: 'objet', acteur: x.id, objet: 'bombe' } });
  for (const id of dispo.pacifier) ajouter({ kind: 'combat', action: { type: 'pacifier', acteur: x.id, cible: id } }, 0.3);
  ajouter({ kind: 'combat', action: { type: 'defendre', acteur: x.id } });
  ajouter({ kind: 'combat', action: { type: 'se_cacher', acteur: x.id } });
  if (dispo.fuite) ajouter({ kind: 'combat', action: { type: 'fuir', acteur: x.id } });
  // une proposition par libellé, les meilleures d'abord
  const vus = new Set<string>();
  return trier(candidats, (a, b) => b.score - a.score)
    .filter((p) => {
      if (vus.has(p.libelle)) return false;
      vus.add(p.libelle);
      return true;
    })
    .slice(0, nombre)
    .map((p) => ({ ...p, conseil: conseil(ctx, x, p) }));
}

function moyenne(e: Estimation) { return e.degats ? (e.degats[0] + e.degats[1]) / 2 : 0; }

function valeur(ctx: ContexteIA, x: Combattant, p: Proposition): number {
  const e = p.estimation;
  const a = p.action;
  const cibleId = a.kind === 'fusion' ? a.cible : 'cible' in a.action ? a.action.cible : undefined;
  const cible = vrai(cibleId) ? ctx.combat.combattants.find((c) => c.id === cibleId) : undefined;
  let v = 0;
  if (e.degats) {
    const r = e.reussite ?? 1;
    const crit = 1 + (e.critique ?? 0) * 0.5;
    const pvCible = cible && cible.camp !== x.camp ? cible.pv : 40;
    const dmg = moyenne(e) * r * crit * Math.max(1, e.nbCibles * 0.8);
    v += Math.min(1.2, dmg / Math.max(1, pvCible));
    if (cible && cible.camp !== x.camp && moyenne(e) >= cible.pv) v += 0.4 * r; // achever
  }
  if (e.soin && cible) {
    const manque = (cible.pvMax - cible.pv) / cible.pvMax;
    v += manque < 0.3 ? 0 : Math.min(e.soin[0], cible.pvMax - cible.pv) / cible.pvMax * 1.6;
  }
  if (a.kind === 'combat') {
    const t = a.action.type;
    const ratio = x.pv / x.pvMax;
    if (t === 'defendre') v += 0.12 + (ratio < 0.3 ? 0.35 : 0);
    if (t === 'se_cacher') v += (e.reussite ?? 0) * (ratio < 0.4 ? 0.5 : 0.25);
    if (t === 'fuir') {
      const groupe = allies(ctx.combat, x).filter((y) => y.type !== 'invocation');
      const moy = groupe.reduce((s, y) => s + y.pv / y.pvMax, 0) / Math.max(1, groupe.length);
      v += moy < 0.25 ? 0.6 * (e.reussite ?? 0.5) : 0.01;
    }
    if (t === 'competence' && !e.degats && !e.soin) {
      // soutien (bouclier, bonus, invocation, provocation) : utile tôt dans le combat
      v += ctx.combat.tour <= 2 ? 0.45 : 0.2;
    }
  }
  v -= (e.mana / Math.max(1, x.manaMax)) * 0.25;
  return v;
}

function preference(ctx: ContexteIA, p: Proposition, pref: Preference): number {
  let b = 0;
  const a = p.action;
  const cibleId = a.kind === 'fusion' ? a.cible : 'cible' in a.action ? a.action.cible : undefined;
  if (vrai(pref.cible) && cibleId === pref.cible) b += 0.25;
  const comp = a.kind === 'combat' && a.action.type === 'competence' ? competenceDe(ctx, a.action.competence) : null;
  if (vrai(pref.element) && comp && elementDe(comp) === pref.element) b += 0.4;
  if (pref.distance && (comp?.portee === 'distance' || (a.kind === 'combat' && a.action.type === 'attaque' && ctx.combat.combattants.find((c) => c.id === ctx.acteur)?.attaque.portee === 'distance'))) b += 0.3;
  const t = a.kind === 'combat' ? a.action.type : 'fusion';
  switch (pref.intention) {
    case 'soigner': if (p.estimation.soin) b += 0.6; break;
    case 'proteger': case 'defendre': if (t === 'defendre' || p.estimation.effets.some((e) => e.startsWith('bouclier'))) b += 0.5; break;
    case 'fuir': if (t === 'fuir' || t === 'se_cacher') b += 0.4; break;
    case 'attaquer': case 'viser': case 'voler': if (p.estimation.degats) b += 0.2; break;
    case 'competence': if (t === 'competence' && p.estimation.degats) b += 0.25; break;
  }
  return b;
}

function conseil(ctx: ContexteIA, x: Combattant, p: Proposition): string {
  const a = p.action;
  const cibleId = a.kind === 'fusion' ? a.cible : 'cible' in a.action ? a.action.cible : undefined;
  const cible = vrai(cibleId) ? ctx.combat.combattants.find((c) => c.id === cibleId) : undefined;
  if (cible && cible.camp !== x.camp && p.estimation.degats && moyenne(p.estimation) >= cible.pv) return `De bonnes chances d'achever ${cible.nom}.`;
  const comp = a.kind === 'combat' && a.action.type === 'competence' ? competenceDe(ctx, a.action.competence) : null;
  const el = comp ? elementDe(comp) : null;
  if (cible && vrai(el) && (cible.resistances[el as Element] ?? 0) < 0 && (x.don?.id === 'oeil-du-seuil' || x.caracs.INT >= 12)) return `${cible.nom} semble craindre ${NOM_ELEMENT[el] === 'lumière' ? 'la lumière' : `le ${NOM_ELEMENT[el]}`}.`;
  if (p.estimation.soin && cible) return `${cible.nom} n'a plus que ${Math.round((cible.pv / cible.pvMax) * 100)} % de ses PV.`;
  if (a.kind === 'combat' && a.action.type === 'defendre' && x.pv / x.pvMax < 0.3) return 'Vous êtes très blessé : prudence.';
  if (a.kind === 'combat' && a.action.type === 'fuir') return 'Le groupe est en mauvaise posture.';
  return '';
}

// ───────────────────────────── Interprétation ─────────────────────────────

const FORMULES_OK = ['Compris :', 'Entendu :', "C'est parti :", 'Bien vu :'];
const FORMULES_NON = ['Impossible :', 'Ça ne marchera pas :', 'Pas possible :'];

// hachage du texte normalisé (sans accents) : même formulation sur le web et sur Roblox
function formule(liste: string[], texte: string) { return liste[hachage(normaliser(texte)) % liste.length]; }

/** Analyse la phrase du joueur. Ne modifie rien. */
export function interpreter(ctx: ContexteIA, texte: string): Interpretation {
  const { contenu, combat } = ctx;
  const x = combat.combattants.find((c) => c.id === ctx.acteur);
  const vide: Interpretation = { texte, intention: 'inconnu', confiance: 0, proposition: null, possible: false, message: '', alternatives: [], compteCommeEssai: false, informations: [] };
  if (!x || combat.enAttente !== x.id) return { ...vide, message: "Ce n'est pas votre tour." };
  if (!vrai(texte.trim())) return { ...vide, message: 'Écrivez ce que fait votre personnage.' };

  const m = mots(texte);
  const pred = predire(MODELE, texte);
  let intention = pred.classe as Intention;
  const dispo = actionsDisponibles(contenu, combat, x.id);
  const possedees = dispo.competences.map((k) => k.comp.id);
  const citees = competencesCitees(contenu, m, possedees.filter((id) => contenu.competences[id]));
  // variantes (fusions) déjà possédées : reconnues par le nom de la compétence de base
  const elements = elementsCites(m);
  const partie = partieCitee(m);
  const { cible, tous } = ennemiCite(combat, x, m);
  const allie = allieCite(combat, x, m);
  const combine = trouverMots(m, MOTS_COMBINER);
  // une fusion demande deux compétences (ou deux éléments) nommées, ou un mot comme « combiner »
  if (intention === 'fusionner' && !combine && citees.length < 2 && elements.length < 2) intention = citees.length > 0 ? 'competence' : 'attaquer';
  if (citees.length >= 2 && (combine || m.includes('et') || m.includes('plus'))) intention = 'fusionner';
  else if (citees.length >= 1 && !['soigner', 'proteger', 'fusionner'].includes(intention)) intention = 'competence';
  else if (partie && ['attaquer', 'competence', 'inconnu'].includes(intention) && citees.length === 0) intention = 'viser';
  if (intention === 'inconnu' || pred.confiance < 0.3) {
    if (citees.length === 0 && !partie) intention = 'inconnu';
  }

  const pref: Preference = { intention, element: elements[0] ?? null, cible: cible?.id ?? null };
  const resultat = (action: ActionProposee | null, raisonSiNul?: string): Interpretation => {
    const proposition = action ? proposer(ctx, action) : null;
    const possible = !!proposition?.estimation.possible;
    const raison = proposition?.estimation.raison ?? raisonSiNul ?? "Je n'ai pas compris l'action.";
    if (possible && proposition) proposition.conseil = conseil(ctx, x, proposition);
    const alternatives = conseiller(ctx, { ...pref, distance: raison.includes('rang arrière') || raison.includes('portée') }, possible ? 2 : 3)
      .filter((a) => !proposition || a.libelle !== proposition.libelle);
    return {
      texte, intention, confiance: pred.confiance, proposition, possible, alternatives, informations: [],
      compteCommeEssai: !possible,
      message: possible
        ? `${formule(FORMULES_OK, texte)} ${proposition!.libelle}.`
        : `${formule(FORMULES_NON, texte)} ${raison.endsWith('.') ? raison.slice(0, -1) : raison}. ${alternatives.length > 0 ? 'Voici ce que vous pouvez faire à la place :' : ''}`.trim(),
    };
  };
  const cibleOuDefaut = (portee: 'melee' | 'distance') => cible?.id ?? (portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance)[0];

  switch (intention) {
    case 'fusionner': {
      let [p, q] = citees.map((c) => c.id);
      if ((!vrai(p) || !vrai(q)) && elements.length >= 2) {
        const parElement = (el: string) => possedees.find((id) => { const k = contenu.competences[id]; return k && elementDe(k) === el; });
        p ??= parElement(elements[0])!; q = parElement(elements[1])!;
      }
      if (!vrai(p) || !vrai(q)) {
        const connues = ctx.heros ? competencesConnues(contenu, ctx.heros) : possedees;
        const pasConnue = valeurs(contenu.competences).find((k) => !connues.includes(k.id) && correspondance(k.nom, m) >= 0.75);
        return resultat(null, pasConnue ? `Vous ne connaissez pas « ${pasConnue.nom} »` : 'Pour une fusion, nommez deux de vos compétences (ou deux éléments que vous maîtrisez)');
      }
      // la compétence de base doit infliger des dégâts : on inverse si besoin
      const aDegats = (id: string) => !!contenu.competences[id]?.effets.some((e) => e.type === 'degats');
      if (!aDegats(p) && aDegats(q)) [p, q] = [q, p];
      const base = contenu.competences[p];
      const portee = base?.portee ?? 'distance';
      return resultat({ kind: 'fusion', parent: p, secondaire: q, cible: base?.cible === 'ennemi' ? cibleOuDefaut(portee) : undefined });
    }
    case 'competence':
    case 'soigner':
    case 'proteger':
    case 'provoquer':
    case 'invoquer': {
      let id: string | undefined = citees[0]?.id;
      const comps = dispo.competences.map((k) => k.comp);
      if (!vrai(id)) {
        const cherche = (f: (k: Competence) => boolean) => comps.find((k) => f(k))?.id;
        if (intention === 'soigner') id = cherche((k) => k.effets.some((e) => e.type === 'soin'));
        else if (intention === 'proteger') id = cherche((k) => k.cible === 'allie' && k.effets.some((e) => e.type === 'bouclier'));
        else if (intention === 'provoquer') id = cherche((k) => k.effets.some((e) => e.type === 'etat' && e.etat === 'provoque'));
        else if (intention === 'invoquer') id = cherche((k) => k.effets.some((e) => e.type === 'invocation'));
        else if (elements.length > 0) id = cherche((k) => elementDe(k) === elements[0]);
        else {
          // « je lance un sort » sans préciser : la meilleure compétence du moment
          const meilleure = conseiller(ctx, { intention }, 8).find((p) => p.action.kind === 'combat' && p.action.action.type === 'competence');
          id = meilleure?.action.kind === 'combat' && meilleure.action.action.type === 'competence' ? meilleure.action.action.competence : undefined;
        }
      }
      if (!vrai(id)) {
        if (intention === 'soigner') {
          if (dispo.potions > 0) return resultat({ kind: 'combat', action: { type: 'objet', acteur: x.id, objet: 'potion', cible: allie?.id ?? x.id } });
          return resultat(null, "Vous n'avez ni sort de soin ni potion");
        }
        if (intention === 'proteger') return resultat(null, `Vous n'avez pas de technique pour protéger un allié${allie ? ` comme ${allie.nom}` : ''} ; seul un Gardien sacré sait s'interposer`);
        if (intention === 'provoquer') return resultat(null, "Vous n'avez pas de technique de provocation");
        if (intention === 'invoquer') return resultat(null, "Vous ne savez pas invoquer de créature");
        const autre = valeurs(contenu.competences).find((k) => correspondance(k.nom, m) >= 0.75);
        if (autre) {
          const classe = valeurs(contenu.classes).find((c) => c.competences_detail.some((d) => d.id === autre.id));
          return resultat(null, `Vous ne connaissez pas « ${autre.nom} »${classe ? ` (c'est une compétence de ${classe.nom})` : ''}`);
        }
        if (elements.length > 0) return resultat(null, `Vous ne maîtrisez pas la magie de ${NOM_ELEMENT[elements[0]] ?? elements[0]}`);
        return resultat(null, "Vous n'avez pas de compétence utilisable pour ça");
      }
      const comp = competenceDe(ctx, id)!;
      let c: string | undefined;
      if (comp.cible === 'ennemi') c = cibleOuDefaut(comp.portee);
      else if (comp.cible === 'allie') c = (allie ?? trier([...allies(combat, x)].filter((a) => a.type !== 'invocation'), (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0])?.id;
      else if (comp.cible === 'allie_ko') c = dispo.alliesKo[0];
      void tous;
      return resultat({ kind: 'combat', action: { type: 'competence', acteur: x.id, competence: id, cible: c } });
    }
    case 'attaquer':
      return resultat({ kind: 'combat', action: { type: 'attaque', acteur: x.id, cible: cibleOuDefaut(x.attaque.portee) ?? '' } });
    case 'viser':
      return resultat({ kind: 'combat', action: { type: 'viser', acteur: x.id, cible: cibleOuDefaut(x.attaque.portee) ?? '', partie: partie ?? 'tete' } });
    case 'defendre':
      return resultat({ kind: 'combat', action: { type: 'defendre', acteur: x.id } });
    case 'fuir':
      return resultat({ kind: 'combat', action: { type: 'fuir', acteur: x.id } });
    case 'se_cacher':
      return resultat({ kind: 'combat', action: { type: 'se_cacher', acteur: x.id } });
    case 'bombe':
      if (dispo.bombes <= 0) return resultat(null, "Vous n'avez pas de bombe sur vous");
      return resultat({ kind: 'combat', action: { type: 'objet', acteur: x.id, objet: 'bombe' } });
    case 'voler': {
      const r = x.race === 'sang-dragon' ? 'Votre sang de dragon vous donne des écailles, pas des ailes : impossible de voler' : "Votre personnage n'a pas d'ailes : impossible de voler";
      pref.distance = true;
      return resultat(null, r);
    }
    case 'pacifier': {
      if (x.don?.id !== 'langue-universelle') return resultat(null, 'Les créatures ne comprennent pas votre langue : seul le don « Langue universelle » permet de les raisonner');
      if (!cible) return resultat(null, 'À qui voulez-vous parler ?');
      return resultat({ kind: 'combat', action: { type: 'pacifier', acteur: x.id, cible: cible.id } });
    }
    case 'changer_rang': {
      const veutAvant = trouverMots(m, ['avance', 'devant', 'front', 'premiere', 'premier']);
      const veutArriere = trouverMots(m, ['recule', 'derriere', 'arriere', 'second', 'abri']);
      if ((veutAvant && x.rang === 'avant') || (veutArriere && !veutAvant && x.rang === 'arriere')) return resultat(null, `Vous êtes déjà au rang ${x.rang === 'avant' ? 'avant' : 'arrière'}`);
      return resultat({ kind: 'combat', action: { type: 'changer_rang', acteur: x.id } });
    }
    case 'analyser': {
      const infos = adversaires(combat, x).map((e) => {
        const l = [`${e.nom} : ${Math.round((e.pv / e.pvMax) * 100)} % de PV`];
        if (e.etats.length > 0) l.push(`état : ${e.etats.map((s) => NOMS_ETATS[s.id].toLowerCase()).join(', ')}`);
        const sait = x.don?.id === 'oeil-du-seuil' || x.caracs.INT >= 12 || x.caracs.ESP >= 12;
        if (sait) {
          const faibles = entrees(e.resistances).filter(([, v]) => (v ?? 0) < 0).map(([k]) => NOM_ELEMENT[k] ?? k);
          const forts = entrees(e.resistances).filter(([, v]) => (v ?? 0) > 0).map(([k]) => NOM_ELEMENT[k] ?? k);
          if (faibles.length > 0) l.push(`craint : ${faibles.join(', ')}`);
          if (forts.length > 0) l.push(`résiste : ${forts.join(', ')}`);
        }
        if (x.don?.id === 'oeil-du-seuil') l.push(`${e.pv}/${e.pvMax} PV exactement`);
        return l.join(' — ');
      });
      const alternatives = conseiller(ctx, pref, 3);
      return { texte, intention, confiance: pred.confiance, proposition: null, possible: false, alternatives, informations: infos, compteCommeEssai: false,
        message: `Vous observez le champ de bataille${x.don?.id === 'oeil-du-seuil' ? ' (Œil du Seuil)' : ''}. Cela ne vous coûte pas votre tour.` };
    }
    default:
      return resultat(null, "Je n'ai pas compris l'action. Essayez par exemple « j'attaque le loup », « je vise la tête », « je lance Javelot de flamme sur le mage » ou « je me cache »");
  }
}

/** Mode « suivre le script » : les meilleures propositions, sans rien écrire. */
export function propositionsScript(ctx: ContexteIA): Proposition[] {
  return conseiller(ctx, {}, 3);
}
