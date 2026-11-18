/**
 * Préparation d'une phrase de joueur avant l'IA de combat :
 *  1. nettoyage du langage SMS et des contractions collées (« jtape » → « je tape », « tt » → « tout », « stp » supprimé) ;
 *  2. découpage en propositions (virgules, « puis », « ensuite », « et je… ») ;
 *  3. repérage des négations (« je n'attaque pas », « pas de potion », « pas le A ») : ce qui est nié n'est jamais fait.
 * Sans expression régulière : le même code tourne sur Roblox (Luau).
 */
import { mots, normaliser } from './texte';
import { vrai } from '../moteur/outils';

/** Mots SMS ou argotiques remplacés (avant toute analyse). */
const SMS: Record<string, string[]> = {
  tt: ['tout'], ts: ['tous'], tlm: ['tout', 'le', 'monde'], stp: [], svp: [], plz: [], pls: [], stv: [], steuplait: [], merci: [],
  popo: ['potion'], popos: ['potions'], koi: ['quoi'], ki: ['qui'], pk: ['pourquoi'], pq: ['pourquoi'], jsp: ['je', 'sais', 'pas'],
  jsais: ['je', 'sais'], chais: ['je', 'sais'], taunt: ['provoque'], shield: ['bouclier'], def: ['defense'], headshot: ['vise', 'la', 'tete'],
  go: [], mago: ['mage'], gob: ['gobelin'], gobs: ['gobelins'], perfo: ['perforant'], freeze: ['gele'], crame: ['brule'], cramer: ['bruler'],
  bcp: ['beaucoup'], pr: ['pour'], ds: ['dans'], ac: ['avec'], vs: ['contre'], dla: ['de', 'la'], jvais: ['je', 'vais'], jveux: ['je', 'veux'],
  cest: ['c', 'est'], ya: ['il', 'y', 'a'], kil: ['qu', 'il'], quil: ['qu', 'il'], quils: ['qu', 'ils'], quelle: ['qu', 'elle'], sil: ['si', 'il'],
  shoot: ['tire'], attak: ['attaque'], attaq: ['attaque'], attack: ['attaque'], atak: ['attaque'], atack: ['attaque'], hit: ['frappe'],
  oneshot: ['acheve'], finish: ['acheve'], kill: ['acheve'], rush: ['fonce'], dps: ['attaque'], spell: ['sort'], skill: ['competence'],
  regen: ['soigne'], soins: ['soin'], tjr: ['toujours'], tjrs: ['toujours'], mm: ['meme'],
};
/** « heal » : un verbe (« heal kaya »), sauf après un article (« le heal » = le soigneur). */
const ARTICLES = new Set(['le', 'la', 'l', 'notre', 'ton', 'mon', 'au']);

/** Mots qui commencent par une voyelle, collés à « j », « l », « d », « m » ou « qu » (« jattaque », « lelfe », « daube »). */
const APRES_APOSTROPHE = new Set([
  'attaque', 'attaques', 'attaquer', 'utilise', 'installe', 'envoie', 'envoies', 'observe', 'examine', 'ai', 'arrive', 'avance', 'essaie', 'enchaine',
  'acheve', 'assomme', 'abats', 'abat', 'empoisonne', 'eclate', 'arrache', 'attire', 'allume', 'aide', 'enfuis', 'enfuit', 'echappe', 'ecrase', 'immobilise',
  'esquive', 'interpose', 'approche', 'eloigne', 'avale', 'arrose', 'etudie', 'equipe', 'elfe', 'humain', 'humaine', 'arcaniste', 'archer', 'archere',
  'alchimiste', 'invocateur', 'ombre', 'oeil', 'arc', 'ennemi', 'ennemis', 'autre', 'attention', 'aube', 'esprit', 'esprits',
  'envole', 'envoler', 'ours', 'epee', 'emissaire', 'eclair', 'arme', 'achever', 'occupe',
  'agenouille', 'accroupis', 'avance', 'enflamme', 'electrocute', 'exploser',
]);
/** Après « d » seulement : « dun » → « d'un », « dici », « dabord » (jamais « deux », qui est un nombre). */
const APRES_D = new Set(['un', 'une', 'ici', 'abord', 'aube', 'esprit', 'esprits', 'arc', 'ombre', 'autre', 'attaque']);
const VOYELLES = 'aeiouyh';

function decoller(t: string): string[] {
  // « jtape », « jme », « jlance » : en français, aucun mot ne commence par « j » + consonne
  if (t.length >= 3 && t.charAt(0) === 'j' && !VOYELLES.includes(t.charAt(1))) return ['je', t.slice(1)];
  for (const [prefixe, mot] of [['j', 'je'], ['l', 'l'], ['d', 'de'], ['m', 'me'], ['qu', 'qu'], ['s', 'se'], ['n', 'ne']] as const) {
    const reste = t.slice(prefixe.length);
    if (t.length > prefixe.length + 1 && t.startsWith(prefixe) && (APRES_APOSTROPHE.has(reste) || (prefixe === 'd' && APRES_D.has(reste)))) return [mot, reste];
  }
  return [t];
}

/** Mots d'une phrase, normalisés (minuscules, sans accents) puis nettoyés du langage SMS. */
export function motsNettoyes(texte: string): string[] {
  const res: string[] = [];
  for (const brut of mots(texte)) {
    for (const t of decoller(brut)) {
      if (t === 'heal' || t === 'heals') { res.push(res.length > 0 && ARTICLES.has(res[res.length - 1]) ? 'soigneur' : 'soigne'); continue; }
      if (t === 'healer') { res.push('soigneur'); continue; }
      const r = SMS[t];
      if (r !== undefined) { for (const x of r) res.push(x); continue; }
      res.push(t);
    }
  }
  return res;
}

// ───────────────────────────── Découpage et négations ─────────────────────────────

/** Une proposition de la phrase : ses mots, et si elle est niée. */
export interface Proposition { mots: string[]; niee: boolean; texte: string }

const SEQUENCE = new Set(['puis', 'ensuite', 'apres']);
const PRONOMS = new Set(['le', 'la', 'l', 'lui', 'les', 'leur', 'y', 'en']);
/** « d'un pas », « un grand pas » : un pas en avant, pas une négation. */
const AVANT_PAS = new Set(['un', 'grand', 'petit', 'premier', 'dernier']);

function estNegation(m: string[], i: number): boolean {
  if (m[i] === 'jamais') return true;
  if (m[i] !== 'pas') return false;
  return !(i > 0 && AVANT_PAS.has(m[i - 1]));
}

/** Découpe la phrase en propositions (une action par proposition, en principe). */
export function decouper(texte: string): Proposition[] {
  // 1. ponctuation forte (virgule, point, point-virgule, deux-points, ! ?)
  const morceaux: string[] = [];
  let cur = '';
  for (let i = 0; i < texte.length; i++) {
    const ch = texte.charAt(i);
    if (ch === ',' || ch === ';' || ch === ':' || ch === '.' || ch === '!' || ch === '?') { morceaux.push(cur); cur = ''; } else cur += ch;
  }
  morceaux.push(cur);
  const res: Proposition[] = [];
  for (const morceau of morceaux) {
    const m = motsNettoyes(morceau);
    if (m.length === 0) continue;
    // 2. mots d'enchaînement : « puis », « ensuite », « et après », « et je … » (sauf « et je le … », qui continue l'action)
    let courant: string[] = [];
    const couper = () => { if (courant.length > 0) res.push({ mots: courant, niee: false, texte: courant.join(' ') }); courant = []; };
    for (let i = 0; i < m.length; i++) {
      const t = m[i];
      if (SEQUENCE.has(t)) { couper(); continue; }
      if (t === 'abord' && courant.length > 0 && courant[courant.length - 1] === 'de') { courant.pop(); continue; }
      if (t === 'et') {
        const n1 = m[i + 1] ?? '', n2 = m[i + 2] ?? '', n3 = m[i + 3] ?? '';
        if (SEQUENCE.has(n1)) { couper(); continue; }
        // « et je la soigne » : la même action continue ; « et je me cache », « et j'attaque » : une nouvelle action
        if (n1 === 'je' && !(PRONOMS.has(n2) || ((n2 === 'me' || n2 === 'm') && PRONOMS.has(n3)))) { couper(); continue; }
      }
      courant.push(t);
      // 3. « je fuis pas je tire » : la négation s'arrête au « je » suivant
      if (estNegation(m, i) && (m[i + 1] === 'je' || m[i + 1] === 'j')) couper();
    }
    couper();
  }
  for (const p of res) p.niee = p.mots.some((_, i) => estNegation(p.mots, i));
  return res;
}

/** Mots d'une proposition niée, sans les mots de négation (« je n'attaque pas » → « je attaque »). */
export function sansNegation(m: string[]): string[] {
  return m.filter((x, i) => !estNegation(m, i) && x !== 'ne' && x !== 'n' && x !== 'surtout');
}

/** Normalise un mot isolé (même règles que les phrases). */
export function motSeul(t: string): string { return normaliser(t); }

export function contient(m: string[], liste: readonly string[]): boolean {
  return m.some((x) => liste.includes(x));
}
export function suite(m: string[], a: string, b: string): boolean {
  for (let i = 0; i < m.length - 1; i++) if (m[i] === a && m[i + 1] === b) return true;
  return false;
}
export { vrai };
