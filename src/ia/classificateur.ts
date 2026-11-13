/**
 * Classificateur bayésien naïf (multinomial), entraîné par scripts/entrainer-ia.ts.
 * Principe : chaque intention a une probabilité pour chaque mot ; on additionne les log-probabilités
 * des mots de la phrase et on garde l'intention la plus probable.
 * Le modèle est stocké « creux » (seulement les comptes non nuls) pour rester léger.
 */
import { traits } from './texte';
import { trier } from '../moteur/outils';

export interface ModeleIA {
  version: number;
  classes: string[];
  alpha: number;
  /** nombre de phrases d'entraînement par classe */
  docs: number[];
  vocab: string[];
  /** par classe : liste aplatie [indexTrait, compte, indexTrait, compte, …] */
  comptes: number[][];
}

/** @param minimum traits vus moins de `minimum` fois au total : ignorés (modèle plus léger, moins de bruit) */
export function entrainer(exemples: { texte: string; classe: string }[], classes: string[], alpha = 0.5, minimum = 1): ModeleIA {
  const frequence = new Map<string, number>();
  for (const ex of exemples) for (const t of new Set(traits(ex.texte))) frequence.set(t, (frequence.get(t) ?? 0) + 1);
  const index = new Map<string, number>();
  const vocab: string[] = [];
  const comptes = classes.map(() => new Map<number, number>());
  const docs = classes.map(() => 0);
  for (const ex of exemples) {
    const c = classes.indexOf(ex.classe);
    if (c < 0) throw new Error(`Classe inconnue : ${ex.classe}`);
    docs[c]++;
    for (const t of new Set(traits(ex.texte))) {
      if ((frequence.get(t) ?? 0) < minimum) continue;
      if (!index.has(t)) { index.set(t, vocab.length); vocab.push(t); }
      const i = index.get(t)!;
      comptes[c].set(i, (comptes[c].get(i) ?? 0) + 1);
    }
  }
  return { version: 2, classes, alpha, docs, vocab, comptes: comptes.map((m) => trier([...m.entries()], (a, b) => a[0] - b[0]).flat()) };
}

interface Prepare { index: Map<string, number>; logP: number[][]; inconnu: number[]; priors: number[] }
const caches = new WeakMap<ModeleIA, Prepare>();

function preparer(m: ModeleIA): Prepare {
  const cache = caches.get(m);
  if (cache) return cache;
  const V = m.vocab.length;
  const index = new Map(m.vocab.map((t, i) => [t, i]));
  const totalDocs = m.docs.reduce((a, b) => a + b, 0);
  const logP: number[][] = [];
  const inconnu: number[] = [];
  m.classes.forEach((_, c) => {
    // liste ordinaire (pas de Float64Array : absent en Luau)
    const brut: number[] = [];
    for (let k = 0; k < V; k++) brut.push(0);
    let total = 0;
    for (let k = 0; k < m.comptes[c].length; k += 2) { brut[m.comptes[c][k]] = m.comptes[c][k + 1]; total += m.comptes[c][k + 1]; }
    const denom = total + m.alpha * V;
    logP.push(brut.map((n) => Math.log((n + m.alpha) / denom)));
    inconnu.push(Math.log(m.alpha / denom));
  });
  const priors = m.docs.map((n) => Math.log((n + 1) / (totalDocs + m.classes.length)));
  const p = { index, logP, inconnu, priors };
  caches.set(m, p);
  return p;
}

export interface Prediction { classe: string; confiance: number; classement: { classe: string; p: number }[] }

export function predire(m: ModeleIA, texte: string): Prediction {
  const { index, logP, priors } = preparer(m);
  // (pas de .map() qui donnerait des cases vides : en Luau, une liste à trous n'a pas de longueur fiable)
  const t: number[] = [];
  for (const x of new Set(traits(texte))) {
    const i = index.get(x);
    if (i !== undefined) t.push(i);
  }
  const scores = m.classes.map((_, c) => priors[c] + t.reduce((s, i) => s + logP[c][i], 0));
  const max = Math.max(...scores);
  const exp = scores.map((s) => Math.exp(s - max));
  const somme = exp.reduce((a, b) => a + b, 0);
  const classement = trier(m.classes.map((classe, c) => ({ classe, p: exp[c] / somme })), (a, b) => b.p - a.p);
  if (t.length === 0) return { classe: 'inconnu', confiance: 0, classement };
  return { classe: classement[0].classe, confiance: classement[0].p, classement };
}
