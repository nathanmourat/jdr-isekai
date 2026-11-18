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
import { predire, type ModeleIA, type Prediction } from './classificateur';
import { cibleAlliee, cibleEnnemie, plusBlesse, ressembleNom, type CibleEnnemie } from './cibles';
import { afficher, contient, decouper, motsNettoyes, sansNegation, suite } from './phrase';
import type { Intention } from './corpus';
import * as modeleBrut from './modele.json';
import { correspondance, hachage, mots, MOTS_VIDES, normaliser, racine, ressemble } from './texte';
import { copieProfonde, entrees, trier, valeurs, vrai } from '../moteur/outils';

// navigateur / Node : le JSON est sous « default » ; Roblox (Luau) : le module est le JSON lui-même
const MODELE = ((modeleBrut as { default?: unknown }).default ?? modeleBrut) as unknown as ModeleIA;
/** Mots entiers connus du modèle (sans les morceaux de 3 lettres ni les paires) : une phrase sans aucun d'eux est incomprise. */
const MOTS_CONNUS = new Set(MODELE.vocab.filter((t) => !t.startsWith('~') && !t.includes('_')));

export interface ContexteIA {
  contenu: Contenu;
  combat: Combat;
  /** id du combattant qui joue (ex. « h:h1 ») */
  acteur: string;
  heros: Heros | null;
  grimoire: Record<string, Technique>;
  /** pseudo du joueur de chaque héros (« soigne Pixel ») */
  pseudos?: Record<string, string>;
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
  /** l'IA hésite : une question courte et 2 ou 3 actions déjà vérifiées par le moteur (ne coûte pas d'essai) */
  question?: { texte: string; options: Proposition[] };
  /** phrase à plusieurs actions : ce qui n'est pas fait ce tour-ci */
  nonFait: string;
  /** cible choisie sans être nommée (« le plus blessé ») */
  note: string;
  /** action créative ramenée à une action du jeu, avec l'explication */
  rapprochement: string;
}

// ───────────────────────────── Vocabulaire ─────────────────────────────

const MOTS_ELEMENTS: Record<string, string[]> = {
  feu: ['feu', 'flamme', 'flammes', 'bruler', 'brule', 'enflamme', 'enflammer', 'incendie', 'immole', 'braise', 'brasier', 'incendiaire', 'inflammable'],
  glace: ['glace', 'givre', 'geler', 'gele', 'gel', 'congele', 'congeler', 'froid', 'glacial', 'glaciale', 'fige', 'figer'],
  foudre: ['foudre', 'eclair', 'eclairs', 'electrique', 'electrocute', 'tonnerre', 'foudroie', 'foudroyer'],
  sacre: ['sacre', 'sacree', 'sainte', 'divine', 'benie'],
  ombre: ['tenebres', 'obscurite'],
  poison: ['poison', 'venin', 'empoisonne', 'toxique', 'toxine'],
};
const MOTS_PARTIES: Record<PartieVisee, string[]> = {
  tete: ['tete', 'crane', 'visage', 'yeux', 'oeil', 'gorge', 'nuque', 'front', 'tronche', 'gueule', 'museau'],
  jambes: ['jambe', 'jambes', 'genou', 'genoux', 'pied', 'pieds', 'cheville', 'chevilles', 'jarret', 'jarrets', 'patte', 'pattes', 'mollet', 'mollets'],
  bras: ['bras', 'main', 'poignet', 'arme', 'epee', 'hache', 'baton', 'lame'],
};
const MOTS_COMBINER = ['combine', 'combiner', 'melange', 'melanger', 'fusion', 'fusionne', 'fusionner', 'mixe', 'mix', 'associe', 'combo', 'mele', 'meler'];
const MOTS_POTION = ['potion', 'potions', 'fiole', 'fioles'];
const MOTS_BOMBE = ['bombe', 'bombes', 'explosif', 'explosifs'];
/** Mots trop courants pour désigner une compétence à eux seuls (« une bombe », « une flèche », « de la lumière »). */
const GENERIQUES = new Set(['bombe', 'fleche', 'tir', 'lumiere', 'priere', 'bouclier', 'attaque', 'coup', 'sort', 'groupe', 'aube', 'foi', 'chaine', 'esprit', 'sainte', 'ultime']);
/** Autres façons de nommer une compétence (verbes surtout). */
const ALIAS_COMPETENCES: Record<string, string[]> = {
  'fleche-marquante': ['marque', 'marquer'],
  purification: ['purifie', 'purifier', 'purifies'],
  'priere-de-groupe': ['prie', 'prier'],
  'tourelle-mecanique': ['automate'],
  'volee-d-esprits': ['ancetres'],
  'tir-perforant': ['traverse', 'transperce', 'perce', 'perforer'],
};

function trouverMots(m: string[], liste: string[]) {
  return m.some((x) => liste.some((y) => ressemble(x, y)));
}
function elementsCites(m: string[]): string[] {
  // dans l'ordre de la phrase (« feu ou glace » : le feu d'abord)
  const res: { e: string; i: number }[] = [];
  for (const [e, l] of entrees(MOTS_ELEMENTS)) {
    const i = m.findIndex((x) => l.some((y) => ressemble(x, y)));
    if (i >= 0) res.push({ e, i });
  }
  return trier(res, (a, b) => a.i - b.i).map((r) => r.e);
}
/** Partie du corps visée — pas « mon épée », « avec mon bâton », « coup de pied », « remettre sur pied ». */
function partieCitee(m: string[]): PartieVisee | null {
  for (let i = 0; i < m.length; i++) {
    const avant = m[i - 1] ?? '', avant2 = m[i - 2] ?? '';
    if (['mon', 'ma', 'mes', 'avec', 'sur'].includes(avant) || (avant === 'de' && avant2 === 'coup') || avant2 === 'avec') continue;
    for (const [p, l] of entrees(MOTS_PARTIES)) if (l.includes(m[i])) return p as PartieVisee;
  }
  return null;
}

// ───────────────────────────── Entités ─────────────────────────────

/** Compétences citées : nom reconnu (fautes tolérées), mot distinctif (« javelot », « tourelle ») ou alias (« je marque »). */
function competencesCitees(ctx: ContexteIA, m: string[], ids: string[]): { id: string; score: number; pos: number }[] {
  const cles = (id: string) => mots(competenceDe(ctx, id)?.nom ?? id).filter((x) => x.length > 2 && !['des', 'les', 'aux'].includes(x));
  const motsElements = valeurs(MOTS_ELEMENTS).flatMap((l) => l);
  const res: { id: string; score: number; pos: number }[] = [];
  for (const id of ids) {
    const k = cles(id);
    if (k.length === 0) continue;
    const pos = (w: string) => m.findIndex((x) => ressembleNom(x, w));
    const trouves = k.filter((w) => pos(w) >= 0);
    const s = trouves.length / k.length;
    let score = k.length <= 1 ? (s === 1 ? 1 : 0) : s >= 0.75 || (s >= 0.5 && k.length >= 3) ? s : 0;
    if (score === 0) {
      // un mot distinctif, propre à cette compétence parmi celles du héros
      const distinctif = trouves.find((w) => (w.length >= 5 || w === k[0]) && m.includes(w) && !GENERIQUES.has(w) && !motsElements.includes(w) && ids.filter((j) => cles(j).includes(w)).length === 1);
      if (vrai(distinctif)) score = 0.6;
    }
    if (score === 0 && (ALIAS_COMPETENCES[id] ?? []).some((a) => m.includes(a))) score = 0.7;
    if (score > 0) {
      const p = Math.min(...k.map((w) => pos(w)).filter((i) => i >= 0), ...(ALIAS_COMPETENCES[id] ?? []).map((a) => m.indexOf(a)).filter((i) => i >= 0));
      res.push({ id, score, pos: p });
    }
  }
  return trier(res, (a, b) => (b.score !== a.score ? b.score - a.score : a.pos - b.pos));
}

/** Actions créatives : ramenées à l'action du jeu la plus proche, avec une explication. */
interface Rapprochement { intention: Intention; partie?: PartieVisee; explication: string }
function rapprocher(m: string[]): Rapprochement | null {
  const a = (l: string[]) => contient(m, l);
  if (a(['diversion', 'bougies', 'bougie', 'obscurite']) || suite(m, 'dans', 'le') && a(['noir'])) return { intention: 'se_cacher', explication: 'faire diversion revient à vous cacher : on vous perd de vue' };
  if (a(['sable', 'poussiere', 'aveugle', 'aveugler', 'reflet', 'eblouis', 'ebloui', 'eblouir']) || (a(['jette', 'lance', 'balance', 'jeter', 'lancer']) && a(['tete', 'yeux', 'visage', 'crane', 'tronche'])))
    return { intention: 'viser', partie: 'tete', explication: 'gêner la vue ou frapper le visage compte comme viser la tête' };
  if (a(['croche', 'clous', 'billes', 'huile']) || (a(['balaie', 'balaye', 'balayer', 'faucher']) && a(['jambes', 'jambe', 'pieds', 'pattes'])))
    return { intention: 'viser', partie: 'jambes', explication: 'faire trébucher compte comme viser les jambes' };
  if (a(['insulte', 'insultes', 'insulter', 'nargue', 'narguer', 'moque', 'moches']) || (a(['viens', 'venez']) && a(['battre', 'chercher'])) || (a(['attire', 'attirer']) && a(['attention'])))
    return { intention: 'provoquer', explication: 'attirer les coups sur vous, c\'est une provocation' };
  if (a(['renverse', 'renverser', 'table', 'chope', 'tonneau', 'poutre', 'lustre', 'sacoche', 'caillou', 'pierre', 'chaise', 'tabouret', 'bouteille', 'gourde']))
    return { intention: 'attaquer', explication: 'lancer ou faire tomber un objet sur l\'ennemi compte comme une attaque' };
  return null;
}

/**
 * Mots-clés forts, par intention (début de mot) : un verbe évident (« je recule », « je tape ») l'emporte
 * sur le classificateur quand celui-ci se trompe. Ils servent aussi à reconnaître une proposition qui est une action
 * (et pas une simple description : « Zed est à bout », « je prends mon temps »).
 */
const MOTS_CLES: [Intention, string[]][] = [
  ['soigner', ['soin', 'soign', 'heal', 'gueri', 'pans', 'plaie', 'regener']],
  ['fuir', ['fui', 'fuy', 'fuite', 'enfui', 'barre', 'decamp', 'detal', 'deguerp', 'echapp', 'sortie', 'retraite', 'sauve', 'talons']],
  ['se_cacher', ['cach', 'planq', 'tapi', 'dissimul', 'camoufl']],
  ['defendre', ['defen', 'defend', 'garde', 'pare', 'bloqu', 'encaiss']],
  ['proteger', ['proteg', 'barrier', 'interpos', 'couvr', 'couvre']],
  ['changer_rang', ['recul', 'avanc']],
  ['analyser', ['observ', 'examin', 'regard', 'etudi', 'analys', 'faibless', 'faille', 'inspect', 'scrut', 'jaug', 'combien']],
  ['pacifier', ['parl', 'calm', 'murmur', 'apais', 'raisonn', 'negoci', 'rassur', 'apprivois']],
  ['provoquer', ['provoq', 'insult', 'nargu', 'defie']],
  ['voler', ['envol', 'volant', 'decoll']],
  ['fusionner', ['combin', 'fusion', 'melang', 'combo']],
  ['invoquer', ['invoqu', 'convoqu']],
  ['viser', ['vise', 'viser', 'crev', 'fauch']],
  ['competence', ['lanc', 'utilis', 'envoi', 'projet', 'canalis', 'incant', 'magie', 'sort', 'techniq', 'competen', 'gel', 'brul', 'enflamm', 'foudroi', 'electrocut', 'fige']],
  ['attaquer', ['tap', 'frap', 'cogn', 'attaq', 'piqu', 'defonc', 'tranch', 'charg', 'fonc', 'achev', 'fini', 'termin', 'decoch', 'tir', 'abat', 'jett', 'assomm',
    'eclat', 'massacr', 'bastonn', 'tabass', 'embroch', 'eventr', 'transperc', 'pourfend', 'decoup', 'shoot', 'tue', 'bute', 'flech', 'occup', 'elimin', 'degomm', 'colle', 'fracass', 'cass']],
];
/** Expressions de plusieurs mots (« je me tire », « on se casse », « mes jambes à mon cou », « je passe devant »). */
function expressions(m: string[]): { intention: Intention; i: number }[] {
  const res: { intention: Intention; i: number }[] = [];
  for (let i = 0; i < m.length - 1; i++) {
    if ((m[i] === 'me' || m[i] === 'se') && ['tire', 'casse', 'barre', 'sauve', 'tirer', 'casser'].includes(m[i + 1])) res.push({ intention: 'fuir', i });
    if (m[i] === 'jambes' && m.includes('cou')) res.push({ intention: 'fuir', i });
    if (m[i] === 'passe' && ['devant', 'derriere', 'premier', 'second'].includes(m[i + 1])) res.push({ intention: 'changer_rang', i });
    if (['passe', 'mets', 'met', 'place', 'retourne', 'vais', 'reviens'].includes(m[i]) && contient(m, ['rang', 'ligne'])) res.push({ intention: 'changer_rang', i });
    if (['fond', 'fonds', 'fonde'].includes(m[i]) && m[i + 1] === 'dans') res.push({ intention: 'se_cacher', i });
    if (['rends', 'rend', 'redonne'].includes(m[i]) && m.includes('vie')) res.push({ intention: 'soigner', i });
    if (m[i] === 'remet' || m[i] === 'remets') { if (suite(m, 'sur', 'pied')) res.push({ intention: 'soigner', i }); }
    if (m[i] === 'vole' && !m.includes('volee')) res.push({ intention: 'voler', i });
    if (m[i] === 'bouclier' && ['sur', 'pour', 'a', 'autour'].includes(m[i + 1] ?? '')) res.push({ intention: 'proteger', i });
    if (['place', 'mets', 'met', 'poste', 'tiens'].includes(m[i]) && m.includes('devant')) res.push({ intention: 'proteger', i });
    if (['dis', 'demande', 'ordonne', 'conseille'].includes(m[i]) && contient(m, ['partir', 'fuir', 'rendre', 'calmer', 'filer'])) res.push({ intention: 'pacifier', i });
  }
  return res;
}
/** Noms (de classe surtout) qui commencent comme un verbe : « le soigneur » ne veut pas dire « soigner ». */
const PAS_DES_VERBES = new Set(['soigneur', 'soigneuse', 'guerisseur', 'guerisseuse', 'protecteur', 'protectrice', 'tireur', 'tireuse', 'gardien', 'gardienne', 'tank', 'lanceur', 'sortie']);
/** Mots-clés d'un seul mot (sans les expressions ni les éléments) : sert à repérer les verbes d'une phrase. */
function estVerbe(t: string): boolean {
  return t.length >= 3 && !PAS_DES_VERBES.has(t) && MOTS_CLES.some(([, l]) => l.some((r) => t.startsWith(r)));
}
/** Intentions désignées par des mots-clés, dans l'ordre de la phrase. */
function motsCles(m: string[]): Intention[] {
  const trouves: { intention: Intention; i: number }[] = [...expressions(m)];
  m.forEach((t, i) => {
    if (t.length < 3 || PAS_DES_VERBES.has(t)) return;
    for (const [intention, l] of MOTS_CLES) if (l.some((r) => t.startsWith(r))) { trouves.push({ intention, i }); return; }
  });
  if (elementsCites(m).length > 0) trouves.push({ intention: 'competence', i: m.length });
  // les expressions passent avant les mots isolés (« je me tire » : fuir, pas tirer)
  const ex = new Set(expressions(m).map((e) => e.i + 1));
  return trier(trouves.filter((t) => !(ex.has(t.i) && t.intention === 'attaquer')), (p, q) => p.i - q.i).map((t) => t.intention);
}
function aUneAction(m: string[]): boolean {
  return motsCles(m).length > 0;
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

const FORMULES_NON = ['Impossible :', 'Ça ne marchera pas :', 'Pas possible :'];

// hachage du texte normalisé (sans accents) : même formulation sur le web et sur Roblox
function formule(liste: string[], texte: string) { return liste[hachage(normaliser(texte)) % liste.length]; }

/** Ce que les propositions niées interdisent (« je n'attaque pas », « pas de potion », « pas le A »). */
interface Exclusions { intentions: Set<string>; cibles: Set<string>; potion: boolean; elements: Set<string> }

/** Résultat de la compréhension d'un morceau de phrase (avant la mise en forme du message). */
interface Comprehension {
  intention: Intention;
  action: ActionProposee | null;
  raison?: string;
  /** cible choisie sans être nommée (« le plus blessé ») */
  note: string;
  rapprochement: string;
  question?: { texte: string; options: Proposition[] };
  /** une autre cible nommée avec « et » : pas faite ce tour-ci */
  autresCibles: string;
}

/** Une aide demandée (« je sais pas », « aide-moi ») : l'IA propose 3 idées, sans coût. */
function demandeAide(m: string[]): boolean {
  return contient(m, ['aide', 'aider', 'truc', 'idee', 'conseil', 'hesite', 'perdu']) || suite(m, 'sais', 'pas') || suite(m, 'quoi', 'faire') || suite(m, 'sais', 'trop');
}
const MOTS_ANALYSE = ['observe', 'observer', 'regarde', 'examine', 'etudie', 'analyse', 'faiblesse', 'faiblesses', 'pv', 'vie', 'reste', 'faille', 'point', 'points', 'scrute', 'inspecte', 'resistances', 'craint'];

function comprendre(ctx: ContexteIA, m: string[], pred: Prediction, excl: Exclusions): Comprehension {
  const { contenu, combat } = ctx;
  const x = combat.combattants.find((c) => c.id === ctx.acteur)!;
  const dispo = actionsDisponibles(contenu, combat, x.id);
  const possedees = dispo.competences.map((k) => k.comp.id);
  const comps = dispo.competences.map((k) => k.comp);
  const r = (intention: Intention, action: ActionProposee | null, extra: Partial<Comprehension> = {}): Comprehension => ({ intention, action, note: '', rapprochement: '', autresCibles: '', ...extra });

  let intention = pred.classe as Intention;
  const citees = competencesCitees(ctx, m, possedees).filter((c) => !excl.elements.has(elementDe(competenceDe(ctx, c.id)!) ?? ''));
  const elements = elementsCites(m).filter((e) => !excl.elements.has(e));
  const partie = partieCitee(m);
  const combine = trouverMots(m, MOTS_COMBINER);
  const potionDite = !excl.potion && contient(m, MOTS_POTION);
  const bombeDite = contient(m, MOTS_BOMBE);
  const creatif = citees.length === 0 && !potionDite ? rapprocher(m) : null;
  const pseudos = ctx.pseudos ?? {};

  // 1. ce qui est nommé passe avant le classificateur
  if (citees.length >= 2 && (combine || contient(m, ['et', 'plus']))) intention = 'fusionner';
  else if (combine && elements.length >= 2) intention = 'fusionner';
  else if (citees.length >= 1) intention = 'competence';
  else if (potionDite) intention = 'soigner';
  else if (bombeDite && ['bombe', 'attaquer', 'competence', 'inconnu', 'viser'].includes(intention)) intention = 'bombe';
  else if (creatif && !motsCles(m).includes('soigner')) intention = creatif.intention;
  else {
    if (intention === 'fusionner') intention = elements.length > 0 ? 'competence' : 'attaquer';
    if (intention === 'viser' && !partie) intention = 'attaquer';
    if (partie && ['attaquer', 'competence', 'inconnu'].includes(intention)) intention = 'viser';
    if (intention === 'analyser' && !contient(m, MOTS_ANALYSE)) intention = 'inconnu';
    if (['attaquer', 'inconnu'].includes(intention) && elements.length > 0 && comps.some((k) => elementDe(k) === elements[0] && k.effets.some((e) => e.type === 'degats'))) intention = 'competence';
    const cles = motsCles(m);
    if (cles.length > 0 && !cles.includes(intention)) intention = cles[0];
    if (intention === 'viser' && !partie) intention = 'attaquer';
    if (partie && ['attaquer', 'competence', 'inconnu'].includes(intention) && elements.length === 0) intention = 'viser';
    // « une compétence » sans nom ni élément, mais un verbe d'attaque (« j'envoie une flèche ») : l'attaque de base
    if (intention === 'competence' && elements.length === 0 && cles.includes('attaquer')) intention = partie ? 'viser' : 'attaquer';
    // une cible nommée et aucun verbe (« le loup A », « jlui met une patate à Vorthak ») : une attaque
    if (cles.length === 0 && cibleEnnemie(combat, x, m, [], excl.cibles).explicite && !['viser', 'fusionner', 'competence'].includes(intention)) intention = partie ? 'viser' : 'attaquer';
    if (intention === 'bombe' && !bombeDite) intention = cles.find((i) => i !== 'bombe') ?? 'attaquer';
    if (pred.confiance < 0.3 && !partie && elements.length === 0 && cles.length === 0) intention = 'inconnu';
    // aucun mot vraiment connu (seulement des morceaux de lettres : « zorglub bidule ») : incompris
    if (cles.length === 0 && !partie && elements.length === 0 && !m.some((t) => MOTS_CONNUS.has(racine(t))) && !cibleEnnemie(combat, x, m, [], excl.cibles).explicite) intention = 'inconnu';
    // une cible nommée sans verbe (« pas le A, le C », « le loup A ou le C ») : une attaque
    if (intention === 'inconnu' && cibleEnnemie(combat, x, m, [], excl.cibles).explicite && !demandeAide(m)) intention = 'attaquer';
  }
  // protéger un allié (et pas soi-même) : la technique de protection, si on l'a
  const allie = cibleAlliee(contenu, combat, x, m, pseudos, excl.cibles);
  const aProtection = comps.some((k) => k.cible === 'allie' && k.effets.some((e) => e.type === 'bouclier'));
  if (intention === 'defendre' && aProtection && allie.cible && allie.cible.id !== x.id && allie.explicite) intention = 'proteger';
  if (intention === 'proteger' && !aProtection && (!allie.cible || allie.cible.id === x.id)) intention = 'defendre';
  if (excl.intentions.has(intention) && intention !== 'inconnu') return r('inconnu', null, { raison: 'Vous avez écrit que vous ne vouliez pas faire ça' });

  const rap = creatif && intention === creatif.intention ? `Je l'interprète ainsi : ${creatif.explication}.` : '';
  const offensive = ['attaquer', 'viser', 'competence', 'fusionner', 'bombe', 'pacifier', 'provoquer'].includes(intention);

  // cible ennemie (portée selon l'action)
  const ennemi = (portee: 'melee' | 'distance') => cibleEnnemie(combat, x, m, portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance, excl.cibles);
  const autres = (c: CibleEnnemie) => c.autres.map((e) => e.nom).join(', ');
  /** Cible hors de portée au corps à corps : on demande plutôt que de gaspiller un essai. */
  const horsDePortee = (c: CibleEnnemie, portee: 'melee' | 'distance'): Comprehension | null => {
    if (!c.cible || !c.explicite || portee !== 'melee' || dispo.ciblesMelee.includes(c.cible.id)) return null;
    const options: Proposition[] = [];
    const proche = trier(adversaires(combat, x).filter((e) => dispo.ciblesMelee.includes(e.id)), (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0];
    if (proche) options.push(proposer(ctx, { kind: 'combat', action: { type: 'attaque', acteur: x.id, cible: proche.id } }));
    for (const k of comps.filter((k) => k.cible === 'ennemi' && k.portee === 'distance' && k.effets.some((e) => e.type === 'degats'))) {
      const p = proposer(ctx, { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: k.id, cible: c.cible.id } });
      if (p.estimation.possible) options.push(p);
    }
    for (const k of comps.filter((k) => (k.cible === 'tous_ennemis') && k.effets.some((e) => e.type === 'degats'))) {
      const p = proposer(ctx, { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: k.id } });
      if (p.estimation.possible && options.length < 3) options.push(p);
    }
    return r(intention, null, { question: { texte: `${c.cible.nom} est hors de portée au corps à corps (protégé par le premier rang). Que faites-vous ?`, options: options.filter((p) => p.estimation.possible).slice(0, 3) } });
  };

  switch (intention) {
    case 'fusionner': {
      let p: string | undefined = citees[0]?.id, q: string | undefined = citees[1]?.id;
      if ((!vrai(p) || !vrai(q)) && elements.length >= 2) {
        const parElement = (el: string) => possedees.find((id) => { const k = contenu.competences[id]; return k && elementDe(k) === el; });
        p = parElement(elements[0]); q = parElement(elements[1]);
      }
      if (!vrai(p) || !vrai(q)) return r(intention, null, { raison: 'Pour une fusion, nommez deux de vos compétences (ou deux éléments que vous maîtrisez)' });
      const aDegats = (id: string) => !!contenu.competences[id]?.effets.some((e) => e.type === 'degats');
      if (!aDegats(p) && aDegats(q)) [p, q] = [q, p];
      const base = contenu.competences[p];
      const c = ennemi(base?.portee ?? 'distance');
      return r(intention, { kind: 'fusion', parent: p, secondaire: q, cible: base?.cible === 'ennemi' ? c.cible?.id : undefined }, { note: base?.cible === 'ennemi' ? c.note : '' });
    }
    case 'soigner': {
      const blesse = plusBlesse(allies(combat, x).filter((a) => a.type !== 'invocation' && !excl.cibles.has(a.id)));
      const tousAllies = contient(m, ['tous', 'toutes', 'groupe', 'equipe', 'ensemble']) || (suite(m, 'tout', 'le') && contient(m, ['monde']));
      if (allie.ambigus.length > 1) {
        return r(intention, null, { question: { texte: 'Qui voulez-vous soigner ?', options: allie.ambigus.map((a) => proposer(ctx, choisirSoin(ctx, comps, dispo.potions, a.id, potionDite, false)!)).filter((p) => p.estimation.possible) } });
      }
      const boit = potionDite && contient(m, ['bois', 'boi', 'avale', 'vide', 'bu', 'prends', 'prend']) && !(allie.cible && allie.cible.id !== x.id);
      const cible = boit ? x : allie.cible ?? blesse;
      const action = choisirSoin(ctx, comps, dispo.potions, cible?.id ?? x.id, potionDite, tousAllies);
      if (!action) return r(intention, null, { raison: potionDite ? "Vous n'avez plus de potion" : "Vous n'avez ni sort de soin ni potion" });
      const note = allie.cible || boit ? allie.note : tousAllies ? '' : 'le plus blessé du groupe';
      return r(intention, action, { note });
    }
    case 'proteger': {
      const k = comps.find((c) => c.cible === 'allie' && c.effets.some((e) => e.type === 'bouclier'));
      if (!k) return r(intention, null, { raison: `Vous n'avez pas de technique pour protéger un allié${allie.cible && allie.cible.id !== x.id ? ` comme ${allie.cible.nom}` : ''} ; seul un Gardien sacré sait s'interposer` });
      const cible = allie.cible ?? plusBlesse(allies(combat, x).filter((a) => a.type !== 'invocation' && a.id !== x.id)) ?? x;
      return r(intention, { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: k.id, cible: cible.id } }, { note: allie.cible ? '' : 'le plus blessé du groupe' });
    }
    case 'competence':
    case 'provoquer':
    case 'invoquer': {
      let id: string | undefined = citees[0]?.id;
      const tous = cibleEnnemie(combat, x, m, dispo.ciblesDistance, excl.cibles).tous;
      if (!vrai(id)) {
        const cherche = (f: (k: Competence) => boolean) => comps.find((k) => f(k))?.id;
        if (intention === 'provoquer') id = cherche((k) => k.effets.some((e) => e.type === 'etat' && e.etat === 'provoque'));
        else if (intention === 'invoquer') id = cherche((k) => k.effets.some((e) => e.type === 'invocation'));
        else if (elements.length > 0) {
          const offensives = comps.filter((k) => elementDe(k) === elements[0] && k.effets.some((e) => e.type === 'degats'));
          const zone = offensives.find((k) => k.cible === 'tous_ennemis' || k.cible === 'ennemi_aleatoire');
          const seule = offensives.find((k) => k.cible === 'ennemi');
          id = (tous ? zone ?? seule : seule ?? zone)?.id;
        } else {
          const meilleure = conseiller(ctx, { intention }, 8).find((p) => p.action.kind === 'combat' && p.action.action.type === 'competence');
          id = meilleure?.action.kind === 'combat' && meilleure.action.action.type === 'competence' ? meilleure.action.action.competence : undefined;
        }
      }
      if (!vrai(id)) {
        if (intention === 'provoquer' && creatif) {
          // pas de technique de provocation : on frappe, ce qui attire aussi l'attention
          const c = ennemi(x.attaque.portee);
          return r('attaquer', { kind: 'combat', action: { type: 'attaque', acteur: x.id, cible: c.cible?.id ?? '' } }, { note: c.note, rapprochement: "Vous ne savez pas provoquer : je le compte comme une attaque, qui attire aussi l'attention." });
        }
        if (intention === 'provoquer') return r(intention, null, { raison: "Vous n'avez pas de technique de provocation" });
        if (intention === 'invoquer') return r(intention, null, { raison: 'Vous ne savez pas invoquer de créature' });
        const autre = valeurs(contenu.competences).find((k) => correspondance(k.nom, m) >= 0.75);
        if (autre) {
          const classe = valeurs(contenu.classes).find((c) => c.competences_detail.some((d) => d.id === autre.id));
          return r(intention, null, { raison: `Vous ne connaissez pas « ${autre.nom} »${classe ? ` (c'est une compétence de ${classe.nom})` : ''}` });
        }
        if (elements.length > 0) return r(intention, null, { raison: `Vous ne maîtrisez pas la magie de ${NOM_ELEMENT[elements[0]] ?? elements[0]}` });
        return r(intention, null, { raison: "Vous n'avez pas de compétence utilisable pour ça" });
      }
      const comp = competenceDe(ctx, id)!;
      if (comp.cible === 'ennemi') {
        const c = ennemi(comp.portee);
        const hp = horsDePortee(c, comp.portee);
        if (hp) return hp;
        return r('competence', { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: id, cible: c.cible?.id } }, { note: c.note, rapprochement: rap, autresCibles: autres(c) });
      }
      if (comp.cible === 'allie') {
        const cible = allie.cible ?? plusBlesse(allies(combat, x).filter((a) => a.type !== 'invocation'));
        return r('competence', { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: id, cible: cible?.id } }, { note: allie.cible ? '' : 'le plus blessé du groupe' });
      }
      if (comp.cible === 'allie_ko') return r('competence', { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: id, cible: dispo.alliesKo[0] } });
      return r('competence', { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: id } }, { rapprochement: rap });
    }
    case 'attaquer':
    case 'viser': {
      const c = ennemi(x.attaque.portee);
      const hp = horsDePortee(c, x.attaque.portee);
      if (hp) return hp;
      const action: ActionCombat = intention === 'viser'
        ? { type: 'viser', acteur: x.id, cible: c.cible?.id ?? '', partie: (creatif?.partie ?? partie ?? 'tete') }
        : { type: 'attaque', acteur: x.id, cible: c.cible?.id ?? '' };
      return r(intention, { kind: 'combat', action }, { note: c.note, rapprochement: rap, autresCibles: autres(c) });
    }
    case 'defendre':
      return r(intention, { kind: 'combat', action: { type: 'defendre', acteur: x.id } });
    case 'fuir':
      return r(intention, { kind: 'combat', action: { type: 'fuir', acteur: x.id } });
    case 'se_cacher':
      return r(intention, { kind: 'combat', action: { type: 'se_cacher', acteur: x.id } }, { rapprochement: rap });
    case 'bombe':
      if (dispo.bombes <= 0) return r(intention, null, { raison: "Vous n'avez pas de bombe sur vous" });
      return r(intention, { kind: 'combat', action: { type: 'objet', acteur: x.id, objet: 'bombe' } });
    case 'voler': {
      const raison = x.race === 'sang-dragon' ? 'Votre sang de dragon vous donne des écailles, pas des ailes : impossible de voler' : "Votre personnage n'a pas d'ailes : impossible de voler";
      return r(intention, null, { raison });
    }
    case 'pacifier': {
      if (x.don?.id !== 'langue-universelle') return r(intention, null, { raison: 'Les créatures ne comprennent pas votre langue : seul le don « Langue universelle » permet de les raisonner' });
      const c = cibleEnnemie(combat, x, m, dispo.pacifier, excl.cibles);
      if (!c.cible) return r(intention, null, { raison: 'À qui voulez-vous parler ?' });
      return r(intention, { kind: 'combat', action: { type: 'pacifier', acteur: x.id, cible: c.cible.id } }, { note: c.note });
    }
    case 'changer_rang': {
      const veutAvant = trouverMots(m, ['avance', 'devant', 'front', 'premiere', 'premier']);
      const veutArriere = trouverMots(m, ['recule', 'derriere', 'arriere', 'second', 'abri']);
      if ((veutAvant && x.rang === 'avant') || (veutArriere && !veutAvant && x.rang === 'arriere')) return r(intention, null, { raison: `Vous êtes déjà au rang ${x.rang === 'avant' ? 'avant' : 'arrière'}` });
      return r(intention, { kind: 'combat', action: { type: 'changer_rang', acteur: x.id } });
    }
    case 'analyser':
      return r(intention, null);
    default:
      return r('inconnu', null, { raison: "Je n'ai pas compris l'action. Essayez par exemple « j'attaque le loup », « je vise la tête », « je lance Javelot de flamme sur le mage » ou « je me cache »" });
  }
}

/** Soin : un sort de soin (de groupe si demandé), sinon une potion. Une potion seulement si le joueur la demande ou n'a pas de sort. */
function choisirSoin(ctx: ContexteIA, comps: Competence[], potions: number, cible: string, potionDite: boolean, groupe: boolean): ActionProposee | null {
  const x = ctx.combat.combattants.find((c) => c.id === ctx.acteur)!;
  const soins = potionDite ? [] : comps.filter((k) => k.effets.some((e) => e.type === 'soin') && (k.cible === 'allie' || k.cible === 'tous_allies'));
  const utilisables = soins.filter((k) => proposer(ctx, { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: k.id, cible: k.cible === 'allie' ? cible : undefined } }).estimation.possible);
  const groupeK = utilisables.find((k) => k.cible === 'tous_allies');
  const seul = utilisables.find((k) => k.cible === 'allie');
  const k = groupe ? groupeK ?? seul : seul ?? groupeK;
  if (k) return { kind: 'combat', action: { type: 'competence', acteur: x.id, competence: k.id, cible: k.cible === 'allie' ? cible : undefined } };
  if (potions > 0) return { kind: 'combat', action: { type: 'objet', acteur: x.id, objet: 'potion', cible } };
  return null;
}

/** Ce que les propositions niées interdisent. */
function exclusions(ctx: ContexteIA, niees: string[][]): Exclusions {
  const x = ctx.combat.combattants.find((c) => c.id === ctx.acteur)!;
  const e: Exclusions = { intentions: new Set(), cibles: new Set(), potion: false, elements: new Set() };
  for (const brut of niees) {
    const m = sansNegation(brut);
    if (contient(m, MOTS_POTION)) e.potion = true;
    for (const el of elementsCites(m)) e.elements.add(el);
    const nommes = cibleEnnemie(ctx.combat, x, m, [], new Set());
    const visee = nommes.explicite && nommes.cible && nommes.note === '' ? nommes.cible : null;
    if (visee) e.cibles.add(visee.id);
    const a = cibleAlliee(ctx.contenu, ctx.combat, x, m, ctx.pseudos ?? {}, new Set());
    if (a.explicite && a.cible) e.cibles.add(a.cible.id);
    // une proposition niée qui nomme une cible (« pas le A », « je ne me soigne pas ») n'exclut que cette cible ;
    // sinon, c'est l'action qui est niée (« je n'attaque pas »)
    const sansElements = m.filter((t) => elementsCites([t]).length === 0);
    if (aUneAction(sansElements) && !contient(m, MOTS_POTION) && !visee && !(a.explicite && a.cible)) {
      const k = motsCles(sansElements);
      if (k.length > 0) e.intentions.add(k[0]);
      else { const p = predire(MODELE, sansElements.join(' ')); if (p.confiance >= 0.5) e.intentions.add(p.classe); }
    }
  }
  return e;
}

/** Analyse la phrase du joueur. Ne modifie rien. */
export function interpreter(ctx: ContexteIA, texte: string): Interpretation {
  const { contenu, combat } = ctx;
  const x = combat.combattants.find((c) => c.id === ctx.acteur);
  const vide: Interpretation = { texte, intention: 'inconnu', confiance: 0, proposition: null, possible: false, message: '', alternatives: [], compteCommeEssai: false, informations: [], nonFait: '', note: '', rapprochement: '' };
  if (!x || combat.enAttente !== x.id) return { ...vide, message: "Ce n'est pas votre tour." };
  if (!vrai(texte.trim())) return { ...vide, message: 'Écrivez ce que fait votre personnage.' };

  // 0. une aide demandée (« je sais pas », « aide-moi ») : 3 idées, sans coût
  const tout = motsNettoyes(texte);
  if (demandeAide(tout) && motsCles(tout.filter((t) => t !== 'aide' && t !== 'aider')).length === 0) {
    return { ...vide, message: 'Voici trois idées pour ce tour :', question: { texte: 'Voici trois idées pour ce tour :', options: conseiller(ctx, {}, 3) } };
  }

  // 1. découpage : propositions niées, actions, descriptions
  const props = decouper(texte);
  const niees = props.filter((p) => p.niee).map((p) => p.mots);
  const excl = exclusions(ctx, niees);
  const actives = props.filter((p) => !p.niee);
  const analyses = actives.map((p) => {
    const pred = predire(MODELE, p.texte);
    const actionnable = aUneAction(p.mots) || contient(p.mots, MOTS_POTION) || contient(p.mots, MOTS_BOMBE) || rapprocher(p.mots) !== null || competencesCitees(ctx, p.mots, actionsDisponibles(contenu, combat, x.id).competences.map((k) => k.comp.id)).length > 0;
    return { p, pred, actionnable: actionnable && !(contient(p.mots, ['recule', 'avance']) && suite(p.mots, 'un', 'pas')) };
  });
  const principale = analyses.find((a) => a.actionnable);
  let motsPrincipaux: string[];
  let pred: Prediction;
  const nonFaits: string[] = [];
  if (principale) {
    motsPrincipaux = [...principale.p.mots];
    pred = principale.pred;
    for (const a of analyses) {
      if (a === principale) continue;
      if (!a.actionnable) { motsPrincipaux.push(...a.p.mots); continue; } // description : elle précise la cible
      const autreCible = (cibleEnnemie(combat, x, a.p.mots, [], new Set()).explicite && cibleEnnemie(combat, x, principale.p.mots, [], new Set()).explicite)
        || (cibleAlliee(contenu, combat, x, a.p.mots, ctx.pseudos ?? {}, new Set()).explicite && cibleAlliee(contenu, combat, x, principale.p.mots, ctx.pseudos ?? {}, new Set()).explicite);
      const intentionDe = (mm: string[], p: Prediction) => motsCles(mm)[0] ?? p.classe;
      const memeAction = intentionDe(a.p.mots, a.pred) === intentionDe(principale.p.mots, pred) && !autreCible && !contient(a.p.mots, MOTS_POTION);
      if (memeAction && analyses.indexOf(a) > analyses.indexOf(principale)) motsPrincipaux.push(...a.p.mots);
      else if (analyses.indexOf(a) > analyses.indexOf(principale)) nonFaits.push(afficher(a.p.mots));
      else motsPrincipaux.push(...a.p.mots);
    }
  } else {
    // pas de verbe d'action : « pas le A, le C » (on garde l'action de la phrase), « le loup a ou le c », ou une phrase floue
    motsPrincipaux = actives.flatMap((a) => a.mots);
    pred = predire(MODELE, motsPrincipaux.join(' '));
  }
  if (motsPrincipaux.length === 0 && niees.length > 0) return { ...vide, message: "Vous avez dit ce que vous ne vouliez pas faire : dites-moi ce que vous faites à la place." };

  const repondre = (c: Comprehension): Interpretation => {
    const proposition = c.action ? proposer(ctx, c.action) : null;
    const possible = !!proposition?.estimation.possible;
    if (c.question && c.question.options.length > 0) {
      return { ...vide, intention: c.intention, confiance: pred.confiance, question: c.question, message: c.question.texte, alternatives: [], compteCommeEssai: false };
    }
    const raison = proposition?.estimation.raison ?? c.raison ?? "Je n'ai pas compris l'action.";
    if (possible && proposition) proposition.conseil = conseil(ctx, x, proposition);
    const pref: Preference = { intention: c.intention, element: elementsCites(motsPrincipaux)[0] ?? null };
    const alternatives = conseiller(ctx, { ...pref, distance: raison.includes('rang arrière') || raison.includes('portée') }, possible ? 2 : 3)
      .filter((a) => !proposition || a.libelle !== proposition.libelle);
    const nonFait = [...(vrai(c.autresCibles) ? [`l'autre cible (${c.autresCibles})`] : []), ...nonFaits.map((t) => `« ${t} »`)].join(', ');
    const morceaux: string[] = [];
    if (possible) {
      morceaux.push(`J'ai compris : ${proposition!.libelle}${vrai(c.note) ? ` (${c.note})` : ''}.`);
      if (vrai(c.rapprochement)) morceaux.push(c.rapprochement);
      if (vrai(nonFait)) morceaux.push(`Une seule action par tour : ${nonFait} ${nonFaits.length + (vrai(c.autresCibles) ? 1 : 0) > 1 ? 'ne sont pas faits' : "n'est pas fait"} ce tour-ci.`);
    } else morceaux.push(`${formule(FORMULES_NON, texte)} ${raison.endsWith('.') ? raison.slice(0, -1) : raison}. ${alternatives.length > 0 ? 'Voici ce que vous pouvez faire à la place :' : ''}`.trim());
    return {
      texte, intention: c.intention, confiance: pred.confiance, proposition, possible, alternatives, informations: [],
      compteCommeEssai: !possible, message: morceaux.join(' '), nonFait: possible ? nonFait : '', note: c.note, rapprochement: c.rapprochement,
    };
  };

  // 2. « A ou B » : deux possibilités nommées → on demande
  const iOu = motsPrincipaux.findIndex((t, i) => t === 'ou' && !['la', 'de', 'd', 'par'].includes(motsPrincipaux[i - 1] ?? ''));
  if (iOu > 0 && iOu < motsPrincipaux.length - 1) {
    const gauche = motsPrincipaux.slice(0, iOu), droite = motsPrincipaux.slice(iOu + 1);
    const verbes = gauche.filter((t) => estVerbe(t) || t === 'je' || t === 'j');
    const entites = (l: string[]) => l.filter((t) => !estVerbe(t) && !MOTS_VIDES.has(t));
    const g = comprendre(ctx, [...gauche, ...entites(droite).filter((t) => !gauche.includes(t) && cibleEnnemie(combat, x, [t], [], new Set()).explicite)], pred, excl);
    const d = comprendre(ctx, [...verbes, ...droite], aUneAction(droite) || contient(droite, MOTS_POTION) ? predire(MODELE, droite.join(' ')) : pred, excl);
    const options: Proposition[] = [];
    for (const c of [g, d]) if (c.action) { const p = proposer(ctx, c.action); if (p.estimation.possible && !options.some((o) => o.libelle === p.libelle)) options.push(p); }
    if (options.length >= 2) return repondre({ ...g, action: null, question: { texte: 'Vous hésitez entre deux actions : laquelle ?', options } });
    if (options.length === 1) return repondre({ ...g, action: options[0].action });
  }

  const c = comprendre(ctx, motsPrincipaux, pred, excl);
  if (c.intention === 'analyser') {
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
    return { ...vide, intention: 'analyser', confiance: pred.confiance, alternatives: conseiller(ctx, {}, 3), informations: infos,
      message: `Vous observez le champ de bataille${x.don?.id === 'oeil-du-seuil' ? ' (Œil du Seuil)' : ''}. Cela ne vous coûte pas votre tour.` };
  }
  return repondre(c);
}

/** Mode « suivre le script » : les meilleures propositions, sans rien écrire. */
export function propositionsScript(ctx: ContexteIA): Proposition[] {
  return conseiller(ctx, {}, 3);
}
