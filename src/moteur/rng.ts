/**
 * Hasard reproductible (« dé à graine »).
 * Même graine + mêmes tirages = mêmes résultats sur tous les navigateurs.
 * L'état tient dans un seul nombre, sauvegardé avec la partie.
 */
export interface Rng {
  etat: number;
}

export function creerRng(graine: number | string): Rng {
  let h = 2166136261 >>> 0;
  const s = String(graine);
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return { etat: h || 1 };
}

/** Nombre dans [0, 1[ (algorithme mulberry32). Fait avancer l'état. */
export function aleatoire(rng: Rng): number {
  rng.etat = (rng.etat + 0x6d2b79f5) >>> 0;
  let t = rng.etat;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Entier entre min et max inclus. */
export function entier(rng: Rng, min: number, max: number): number {
  return min + Math.floor(aleatoire(rng) * (max - min + 1));
}

export function de(rng: Rng, faces: number): number {
  return entier(rng, 1, faces);
}

export function chance(rng: Rng, p: number): boolean {
  return aleatoire(rng) < p;
}

export function choisir<T>(rng: Rng, liste: readonly T[]): T {
  return liste[Math.floor(aleatoire(rng) * liste.length)];
}
