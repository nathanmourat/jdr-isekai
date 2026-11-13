/**
 * Outils de texte de l'IA maison : normalisation (minuscules, sans accents), découpage en mots,
 * et comparaison tolérante aux fautes de frappe.
 */
import { imul, vrai } from '../moteur/outils';

// Lettres accentuées → lettres simples (sans expression régulière : le même code tourne sur Roblox, en Luau)
const ACCENTS: [string, string][] = [
  ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['á', 'a'], ['ã', 'a'], ['å', 'a'], ['À', 'a'], ['Â', 'a'], ['Ä', 'a'], ['Á', 'a'],
  ['ç', 'c'], ['Ç', 'c'],
  ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['É', 'e'], ['È', 'e'], ['Ê', 'e'], ['Ë', 'e'],
  ['î', 'i'], ['ï', 'i'], ['í', 'i'], ['ì', 'i'], ['Î', 'i'], ['Ï', 'i'],
  ['ô', 'o'], ['ö', 'o'], ['ó', 'o'], ['ò', 'o'], ['õ', 'o'], ['Ô', 'o'], ['Ö', 'o'],
  ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ú', 'u'], ['Ù', 'u'], ['Û', 'u'], ['Ü', 'u'],
  ['ÿ', 'y'], ['Ÿ', 'y'], ['ñ', 'n'], ['Ñ', 'n'],
  ['œ', 'oe'], ['Œ', 'oe'], ['æ', 'ae'], ['Æ', 'ae'],
];

export function normaliser(t: string): string {
  let s = t;
  for (const [a, b] of ACCENTS) s = s.split(a).join(b);
  s = s.toLowerCase();
  // tout ce qui n'est ni lettre (a-z) ni chiffre devient une espace (apostrophes, tirets, ponctuation…)
  let res = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    res += (code >= 97 && code <= 122) || (code >= 48 && code <= 57) ? s.charAt(i) : ' ';
  }
  return res.split(' ').filter((x) => x.length > 0).join(' ');
}

/** Mots vides ignorés pour reconnaître les noms (compétences, ennemis). */
export const MOTS_VIDES = new Set(['le', 'la', 'les', 'l', 'un', 'une', 'des', 'de', 'du', 'd', 'a', 'au', 'aux', 'et', 'sur', 'avec', 'en', 'je', 'j', 'me', 'm', 'mon', 'ma', 'mes', 'son', 'sa', 'ses', 'ce', 'cet', 'cette', 'ces', 'qui', 'que', 'pour', 'par', 'il', 'elle', 'lui', 'y']);

/** Racine grossière : retire les terminaisons fréquentes (pluriels, conjugaisons). */
export function racine(mot: string): string {
  if (mot.length <= 4) return mot;
  for (const fin of ['ements', 'ement', 'aient', 'ions', 'erai', 'eras', 'era', 'ons', 'ent', 'ez', 'er', 'es', 'ee', 'e', 's', 'x']) {
    if (mot.endsWith(fin) && mot.length - fin.length >= 4) return mot.slice(0, -fin.length);
  }
  return mot;
}

export function mots(t: string): string[] {
  return normaliser(t).split(' ').filter((x) => x.length > 0);
}

/** Traits utilisés par le classificateur : racines + paires de racines voisines. */
export function traits(t: string): string[] {
  const r = mots(t).map((m) => racine(m));
  const res = [...r];
  for (let i = 0; i < r.length - 1; i++) res.push(`${r[i]}_${r[i + 1]}`);
  return res;
}

export function distance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!vrai(m)) return n;
  if (!vrai(n)) return m;
  let prec = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prec[j] + 1, cur[j - 1] + 1, prec[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prec = cur;
  }
  return prec[n];
}

/** Deux mots se ressemblent-ils (fautes de frappe tolérées selon la longueur) ? */
export function ressemble(a: string, b: string): boolean {
  if (a === b) return true;
  const l = Math.max(a.length, b.length);
  const tol = l <= 4 ? 0 : l <= 7 ? 1 : 2;
  if (vrai(tol) && Math.abs(a.length - b.length) <= tol && distance(a, b) <= tol) return true;
  // racines identiques (« enflamme » / « enflammer »)
  return a.length > 4 && b.length > 4 && racine(a) === racine(b);
}

/** Proportion des mots significatifs de `nom` présents (à une faute près) dans `texte`. */
export function correspondance(nom: string, texteMots: string[]): number {
  const cles = mots(nom).filter((m) => !MOTS_VIDES.has(m) && m.length > 1);
  if (cles.length === 0) return 0;
  const trouves = cles.filter((k) => texteMots.some((m) => ressemble(m, k)));
  return trouves.length / cles.length;
}

/** Petit hachage stable (pour varier les formulations sans hasard). */
export function hachage(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = imul(h ^ t.charCodeAt(i), 16777619) >>> 0;
  return h;
}
