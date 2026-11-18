/**
 * Reconnaissance des cibles dans une phrase de combat (IA maison) :
 *  - ennemis : nom (fautes tolérées, « gob », « lou »), lettre (« le B »), « le plus faible », « le boss », « le mage »,
 *    « celui du fond », « celui de gauche », « le même » / « lui » (dernière cible), « tous » ;
 *  - alliés : nom, pseudo du joueur, classe (« le mage », « le tank »), race (« le nain »), nom de compagne, « moi ».
 * Ne décide de rien : renvoie ce que le joueur semble désigner ; l'interpréteur choisit et le moteur vérifie.
 */
import type { Contenu } from '../contenu/types';
import { adversaires, allies, type Combat, type Combattant } from '../moteur/combat';
import { cles, trier, vrai } from '../moteur/outils';
import { distance, mots, ressemble } from './texte';
import { contient, suite } from './phrase';

/** Un mot tapé ressemble-t-il à un nom propre ou à un nom de monstre (fautes et abréviations tolérées) ? */
export function ressembleNom(tape: string, nom: string): boolean {
  if (ressemble(tape, nom)) return true;
  if (tape.length < 3 || nom.length < 3) return false;
  // abréviation : « lou » pour « loup », « gobel » pour « gobelin »
  if (nom.startsWith(tape) && tape.length >= Math.min(nom.length - 1, 5)) return true;
  // nom de 4 lettres ou plus : une faute (« kaia », « bran »)
  if (nom.length >= 4 && tape.charAt(0) === nom.charAt(0) && Math.abs(tape.length - nom.length) <= 1 && distance(tape, nom) <= 1) return true;
  // nom long : deux fautes si les deux premières lettres sont bonnes (« gobln », « vortack »)
  return nom.length >= 6 && tape.length >= 5 && tape.slice(0, 2) === nom.slice(0, 2) && distance(tape, nom) <= 2;
}

function contientNom(m: string[], nom: string): boolean { return m.some((x) => ressembleNom(x, nom)); }

// ───────────────────────────── Ennemis ─────────────────────────────

const MOTS_FAIBLE = ['faible', 'blesse', 'blessee', 'mourant', 'mourante', 'agonisant', 'boite', 'abime', 'amoche', 'esquinte'];
const MOTS_BOSS = ['boss', 'chef', 'gros', 'costaud', 'colosse', 'patron', 'balaise', 'baraque'];
const MOTS_LANCEUR = ['mage', 'sorcier', 'sorciere', 'pretre', 'lanceur', 'magicien', 'chaman', 'shaman', 'invocateur', 'sorcier'];
const MOTS_FOND = ['fond', 'derriere', 'arriere', 'loin'];
const MOTS_TOUS = ['tous', 'toutes', 'eux', 'groupe', 'ensemble', 'bande', 'ennemis', 'monstres', 'meute'];
const VERBES_COUP = ['frappe', 'tape', 'cogne', 'tire', 'attaque', 'met', 'mets', 'colle', 'lance', 'plante', 'pique', 'tranche'];

/** Nom de base (sans la lettre « A », « B »…) et lettre d'un ennemi. */
function nomEtLettre(e: Combattant): { base: string[]; lettre: string | null } {
  const n = e.nom.length;
  const finLettre = n >= 2 && e.nom.charAt(n - 2) === ' ' && e.nom.charCodeAt(n - 1) >= 65 && e.nom.charCodeAt(n - 1) <= 90;
  const base = finLettre ? e.nom.slice(0, n - 2) : e.nom;
  return { base: mots(base).filter((x) => x.length > 2 && !['des', 'les', 'aux'].includes(x)), lettre: finLettre ? e.nom.charAt(n - 1).toLowerCase() : null };
}

/** Lettres désignées dans la phrase (« le B », « gobelin c ») : une lettre seule après « le », « la » ou un nom. */
function lettresCitees(m: string[], bases: string[]): string[] {
  const res: string[] = [];
  for (let i = 1; i < m.length; i++) {
    const t = m[i];
    if (t.length !== 1 || t < 'a' || t > 'h') continue;
    const avant = m[i - 1];
    if (avant === 'le' || avant === 'la' || bases.some((b) => ressembleNom(avant, b) || ressembleNom(avant, `${b}s`))) res.push(t);
  }
  return res;
}

/** « le même », « lui », « je le refrappe », « encore » : la dernière cible. */
function designeDerniere(m: string[]): boolean {
  if (contient(m, ['meme', 'encore', 'reste']) && !suite(m, 'le', 'reste')) return true;
  for (let i = 0; i < m.length; i++) {
    const t = m[i];
    // « refrappe », « retape », « remet »
    if (t.length > 4 && t.startsWith('re') && VERBES_COUP.some((v) => t.slice(2) === v || t.slice(2) === `${v}s`)) return true;
    // « je le frappe », « je lui mets », « frappe lui »
    if ((t === 'le' || t === 'la' || t === 'l' || t === 'lui') && i > 0 && m[i - 1] === 'je') return true;
    if (t === 'lui' && i > 0 && VERBES_COUP.includes(m[i - 1])) return true;
  }
  return false;
}

export interface CibleEnnemie {
  cible: Combattant | null;
  /** le joueur a nommé ou décrit cette cible (sinon : choix par défaut) */
  explicite: boolean;
  /** tous les ennemis (« sur eux », « tout le monde ») */
  tous: boolean;
  /** pourquoi cette cible, quand elle n'a pas été nommée (« le plus blessé ») */
  note: string;
  /** autres ennemis nommés avec « et » (« le A et le C ») : une seule action par tour */
  autres: Combattant[];
}

/**
 * Ennemi désigné par la phrase.
 * @param valides ennemis que l'action peut viser (portée) : sert au choix par défaut
 */
export function cibleEnnemie(combat: Combat, x: Combattant, m: string[], valides: string[], exclues: Set<string>): CibleEnnemie {
  const ennemis = adversaires(combat, x).filter((e) => !exclues.has(e.id));
  const tous = contient(m, MOTS_TOUS) || suite(m, 'tout', 'le') && contient(m, ['monde']) || suite(m, 'les', 'deux') || ennemis.some((e) => nomEtLettre(e).base.some((b) => contient(m, [`${b}s`, `${b}x`])));
  const res = (cible: Combattant | null, explicite: boolean, note = '', autres: Combattant[] = []): CibleEnnemie => ({ cible, explicite, tous, note, autres });
  const plusFaible = (liste: Combattant[]) => trier([...liste], (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0] ?? null;
  const parmiValides = (liste: Combattant[]) => { const v = liste.filter((e) => valides.includes(e.id)); return v.length > 0 ? v : liste; };

  // 1. noms (et lettres)
  const bases = ennemis.flatMap((e) => nomEtLettre(e).base);
  const lettres = lettresCitees(m, bases);
  const nommes: Combattant[] = [];
  for (const e of ennemis) {
    const { base, lettre } = nomEtLettre(e);
    const nomCite = base.some((b) => contientNom(m, b) || contient(m, [`${b}s`]));
    const lettreCitee = lettre !== null && lettres.includes(lettre);
    if (lettreCitee && (nomCite || !ennemis.some((f) => f !== e && nomEtLettre(f).lettre === lettre && nomEtLettre(f).base.some((b) => contientNom(m, b))))) nommes.push(e);
  }
  // ordre de la phrase : « le A et le C » → A d'abord
  const ordre = (e: Combattant) => { const l = nomEtLettre(e).lettre; return l === null ? 0 : m.indexOf(l); };
  const parLettre = trier(nommes, (a, b) => ordre(a) - ordre(b));
  if (parLettre.length > 0) return res(parLettre[0], true, '', parLettre.slice(1));
  // 2. descriptions
  const decritFaible = contient(m, MOTS_FAIBLE) || suite(m, 'presque', 'mort') || suite(m, 'moins', 'de') || (suite(m, 'plus', 'de') && contient(m, ['vie', 'pv']))
    || suite(m, 'point', 'de') || (contient(m, ['acheve', 'achever', 'finis', 'termine']) && !ennemis.some((e) => nomEtLettre(e).base.some((b) => contientNom(m, b)) && nomEtLettre(e).lettre === null))
    || suite(m, 'le', 'plus') && contient(m, ['coups', 'touche', 'mal']);
  const nomsDeBase = ennemis.filter((e) => nomEtLettre(e).base.some((b) => contientNom(m, b) || contient(m, [`${b}s`])));
  if (decritFaible) {
    const f = plusFaible(parmiValides(nomsDeBase.length > 0 ? nomsDeBase : ennemis));
    return res(f, true, 'le plus blessé');
  }
  if (contient(m, MOTS_BOSS) || suite(m, 'plus', 'fort')) {
    const boss = ennemis.find((e) => e.boss) ?? trier([...ennemis], (a, b) => b.pvMax - a.pvMax)[0] ?? null;
    return res(boss, true, ennemis.some((e) => e.boss) ? '' : 'le plus robuste');
  }
  if (contient(m, MOTS_FOND) && !contient(m, ['me', 'se']) || contient(m, ['derriere', 'arriere']) && !contient(m, ['rang', 'ligne'])) {
    const fond = ennemis.find((e) => e.rang === 'arriere');
    if (fond) return res(fond, true);
  }
  if (contient(m, MOTS_LANCEUR) && nomsDeBase.length === 0) {
    const mage = ennemis.find((e) => e.attaque.stat === 'INT' || e.attaque.stat === 'ESP') ?? ennemis.find((e) => e.rang === 'arriere');
    if (mage) return res(mage, true);
  }
  if (contient(m, ['demon', 'diable', 'bete', 'animal', 'emissaire'])) {
    const cat = contient(m, ['demon', 'diable', 'emissaire']) ? 'demon' : 'bete';
    const e = ennemis.filter((y) => y.categorie === cat);
    if (e.length > 0) return res(plusFaible(parmiValides(e)), true);
  }
  if (contient(m, ['gauche', 'premier', 'premiere']) && !contient(m, ['rang', 'ligne'])) {
    const avant = ennemis.filter((e) => e.rang === 'avant');
    if (avant.length > 0) return res(avant[0], true);
  }
  if (contient(m, ['droite', 'dernier', 'derniere'])) {
    const avant = ennemis.filter((e) => e.rang === 'avant');
    if (avant.length > 0) return res(avant[avant.length - 1], true);
  }
  // 3. un nom sans lettre : s'il y en a plusieurs, la dernière cible si « le même », sinon le plus blessé (on le dit)
  const derniereNommee = vrai(x.derniereCible) ? nomsDeBase.find((e) => e.id === x.derniereCible) : undefined;
  if (derniereNommee && designeDerniere(m)) return res(derniereNommee, true, 'votre dernière cible');
  if (nomsDeBase.length === 1) return res(nomsDeBase[0], true);
  if (nomsDeBase.length > 1 && !tous) {
    const f = plusFaible(parmiValides(nomsDeBase));
    return res(f, true, 'le plus blessé');
  }
  // 4. « le même », « lui » : la dernière cible
  const derniere = vrai(x.derniereCible) ? ennemis.find((e) => e.id === x.derniereCible) : undefined;
  if (derniere && designeDerniere(m)) return res(derniere, true, 'votre dernière cible');
  // 5. par défaut : la dernière cible si elle est à portée, sinon le plus blessé à portée
  if (ennemis.length === 1) return res(ennemis[0], false);
  if (derniere && valides.includes(derniere.id)) return res(derniere, false, 'votre dernière cible');
  const f = plusFaible(ennemis.filter((e) => valides.includes(e.id)));
  return res(f, false, f ? 'le plus blessé à votre portée' : '');
}

// ───────────────────────────── Alliés ─────────────────────────────

const CLASSES: Record<string, string[]> = {
  guerisseur: ['guerisseur', 'guerisseuse', 'soigneur', 'soigneuse', 'pretre', 'pretresse', 'clerc', 'medecin', 'healer'],
  gardien: ['gardien', 'gardienne', 'tank', 'paladin', 'protecteur', 'protectrice', 'chevalier'],
  arcaniste: ['arcaniste', 'mage', 'magicien', 'magicienne', 'sorcier', 'sorciere', 'elementaliste'],
  archer: ['archer', 'archere', 'chasseur', 'chasseuse', 'tireur', 'tireuse'],
  alchimiste: ['alchimiste', 'artificier', 'artificiere', 'ingenieur', 'bricoleur'],
  invocateur: ['invocateur', 'invocatrice', 'conjurateur'],
  ombre: ['assassin', 'voleur', 'voleuse', 'rogue'],
  berserker: ['berserker', 'barbare', 'brute'],
  barde: ['barde', 'musicien', 'musicienne', 'chanteur', 'chanteuse'],
  'lame-runique': ['runique', 'lame', 'epeiste'],
};
const RACES: Record<string, string[]> = {
  humain: ['humain', 'humaine'], elfe: ['elfe'], 'demi-elfe': ['demi'], nain: ['nain', 'naine'],
  ourvalis: ['ourvalis', 'louve', 'lycan'], vulpin: ['vulpin', 'vulpine', 'renard', 'renarde'],
  'demi-demon': ['diablotin', 'tieffelin'], 'sang-dragon': ['dragon', 'draconique', 'drake'],
};

/** Mots qui désignent un allié : nom, pseudo, classe, race (une compagne : sa race d'après son titre). */
function motsAllie(contenu: Contenu, a: Combattant, pseudos: Record<string, string>): { noms: string[]; descriptions: string[] } {
  const noms = mots(a.nom).filter((t) => t.length >= 3);
  if (a.type === 'heros' && vrai(a.herosId) && vrai(pseudos[a.herosId])) noms.push(...mots(pseudos[a.herosId]));
  const descriptions: string[] = [];
  if (a.type === 'heros') descriptions.push(...(CLASSES[a.refId] ?? []));
  let race = a.race;
  if (a.type === 'compagnon') {
    const titre = mots(`${contenu.compagnons[a.refId]?.titre ?? ''}`);
    race = cles(RACES).find((r) => titre.includes(r.split('-').join(''))) ?? cles(RACES).find((r) => titre.includes(r)) ?? null;
  }
  if (vrai(race)) descriptions.push(...(RACES[race] ?? []));
  return { noms, descriptions };
}

export interface CibleAlliee { cible: Combattant | null; explicite: boolean; note: string; /** plusieurs alliés répondent à la même description */ ambigus: Combattant[] }

/** Allié désigné (soin, protection, potion). Sans indication : null (l'interpréteur choisit le plus blessé). */
export function cibleAlliee(contenu: Contenu, combat: Combat, x: Combattant, m: string[], pseudos: Record<string, string>, exclus: Set<string>): CibleAlliee {
  const amis = allies(combat, x).filter((a) => a.type !== 'invocation' && !exclus.has(a.id));
  const trouves: { a: Combattant; pos: number; parDescription: boolean }[] = [];
  for (const a of amis) {
    const { noms, descriptions } = motsAllie(contenu, a, pseudos);
    const iNom = m.findIndex((t) => noms.some((n) => ressembleNom(t, n)));
    const iDesc = m.findIndex((t) => descriptions.includes(t));
    if (iNom >= 0) trouves.push({ a, pos: iNom, parDescription: false });
    else if (iDesc >= 0) trouves.push({ a, pos: iDesc, parDescription: true });
  }
  const res = (cible: Combattant | null, explicite: boolean, note = '', ambigus: Combattant[] = []): CibleAlliee => ({ cible, explicite, note, ambigus });
  // plusieurs alliés pour une même description (« l'humain » et deux humains) : il faudra demander
  const tries = trier(trouves, (p, q) => p.pos - q.pos);
  if (tries.length > 1 && tries[0].parDescription && tries.filter((t) => t.pos === tries[0].pos).length > 1) return res(null, false, '', tries.filter((t) => t.pos === tries[0].pos).map((t) => t.a));
  const autre = tries.find((t) => t.a.id !== x.id);
  if (autre) return res(autre.a, true);
  if (tries.length > 0) return res(tries[0].a, true);
  // « moi », « je me soigne »
  if (contient(m, ['moi', 'me', 'm', 'mes', 'moimeme']) && !exclus.has(x.id)) return res(x, true);
  if (contient(m, MOTS_FAIBLE) || suite(m, 'moins', 'de')) return res(plusBlesse(amis), true, 'le plus blessé');
  return res(null, false);
}

/** L'allié le plus blessé (en proportion de ses PV). */
export function plusBlesse(amis: Combattant[]): Combattant | null {
  return trier([...amis], (a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0] ?? null;
}
