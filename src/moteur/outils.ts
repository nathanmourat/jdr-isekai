/**
 * Petits outils qui se comportent EXACTEMENT pareil en JavaScript (web) et en Luau (Roblox).
 * Le moteur les utilise à la place des fonctions natives dont le résultat diffère d'un langage à l'autre.
 * `npm run roblox:verifier` signale tout usage d'une fonction native risquée dans le moteur.
 */

/** « Vrai » au sens de JavaScript : ni undefined, null, false, 0, "" ni NaN (en Luau, 0 et "" sont vrais). */
export function vrai<T>(x: T): x is Exclude<T, undefined | null | false | 0 | ''> {
  // eslint-disable-next-line no-self-compare
  return x !== undefined && x !== null && (x as unknown) !== false && (x as unknown) !== 0 && (x as unknown) !== '' && x === x;
}

/** Clés d'un objet, triées (en Luau, l'ordre de parcours d'une table n'est pas garanti). */
export function cles<T extends object>(o: T): (keyof T & string)[] {
  const res: string[] = [];
  for (const k in o) res.push(k);
  return trier(res, (a, b) => (a < b ? -1 : a > b ? 1 : 0)) as (keyof T & string)[];
}

/** Valeurs d'un objet, dans l'ordre de ses clés triées. */
export function valeurs<V>(o: Record<string, V>): V[] {
  return cles(o).map((k) => o[k]);
}

/** Paires [clé, valeur] d'un objet, dans l'ordre de ses clés triées. */
export function entrees<V>(o: Record<string, V>): [string, V][] {
  return cles(o).map((k): [string, V] => [k, o[k]]);
}

/** Tri stable (tri fusion) : même résultat en JavaScript et en Luau, sans modifier la liste d'origine. */
export function trier<T>(liste: readonly T[], comparer: (a: T, b: T) => number): T[] {
  if (liste.length <= 1) return liste.slice();
  const milieu = Math.floor(liste.length / 2);
  const g = trier(liste.slice(0, milieu), comparer);
  const d = trier(liste.slice(milieu), comparer);
  const res: T[] = [];
  let i = 0, j = 0;
  while (i < g.length && j < d.length) {
    if (comparer(d[j], g[i]) < 0) res.push(d[j++]);
    else res.push(g[i++]);
  }
  while (i < g.length) res.push(g[i++]);
  while (j < d.length) res.push(d[j++]);
  return res;
}

/** Copie profonde de données simples (objets, listes, nombres, textes, booléens). */
export function copieProfonde<T>(x: T): T {
  if (x === null || typeof x !== 'object') return x;
  if (Array.isArray(x)) return x.map((v) => copieProfonde(v)) as T;
  const res: Record<string, unknown> = {};
  for (const k in x) res[k] = copieProfonde((x as Record<string, unknown>)[k]);
  return res as T;
}

/** Multiplication entière 32 bits (équivalent de Math.imul, absent en Luau). */
export function imul(a: number, b: number): number {
  const aHaut = (a >>> 16) & 0xffff, aBas = a & 0xffff;
  const bHaut = (b >>> 16) & 0xffff, bBas = b & 0xffff;
  return (aBas * bBas + (((aHaut * bBas + aBas * bHaut) << 16) >>> 0)) | 0;
}
