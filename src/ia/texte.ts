/**
 * Outils de texte de l'IA maison : normalisation (minuscules, sans accents), découpage en mots,
 * et comparaison tolérante aux fautes de frappe.
 */
export function normaliser(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[’'`´-]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  return normaliser(t).split(' ').filter(Boolean);
}

/** Traits utilisés par le classificateur : racines + paires de racines voisines. */
export function traits(t: string): string[] {
  const r = mots(t).map(racine);
  const res = [...r];
  for (let i = 0; i < r.length - 1; i++) res.push(`${r[i]}_${r[i + 1]}`);
  return res;
}

export function distance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
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
  if (tol && Math.abs(a.length - b.length) <= tol && distance(a, b) <= tol) return true;
  // racines identiques (« enflamme » / « enflammer »)
  return a.length > 4 && b.length > 4 && racine(a) === racine(b);
}

/** Proportion des mots significatifs de `nom` présents (à une faute près) dans `texte`. */
export function correspondance(nom: string, texteMots: string[]): number {
  const cles = mots(nom).filter((m) => !MOTS_VIDES.has(m) && m.length > 1);
  if (!cles.length) return 0;
  const trouves = cles.filter((k) => texteMots.some((m) => ressemble(m, k)));
  return trouves.length / cles.length;
}

/** Petit hachage stable (pour varier les formulations sans hasard). */
export function hachage(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619) >>> 0;
  return h;
}
