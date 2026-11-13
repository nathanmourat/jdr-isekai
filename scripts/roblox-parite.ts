/**
 * Test de parité web / Roblox : le robot joue le chapitre 1 en TypeScript, puis le moteur compilé en Luau
 * (roblox/src/shared/moteur.lua) rejoue les mêmes actions sous Lune. Les deux états finaux doivent être identiques.
 *
 * Usage : npm run roblox:parite   (prérequis : `npm run moteur` dans roblox/ et Lune installé)
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, nouvellePartie } from '../src/moteur/partie';
import { finirTempsLibre, groupeDeDeux, jouerPrologues, jouerSceneGroupe } from '../tests/robot';

const lune = process.env.LUNE ?? 'lune';
const c = contenuDisque();
const graine = process.argv[2] ?? 'chapitre';
const r = groupeDeDeux(c, graine);
jouerPrologues(c, r);
for (const s of ['ch1-appel', 'ch1-examen', 'sq-tournoi', 'sq-loups', 'ch1-crypte', 'sq-tanneurs', 'ch1-lanternes', 'ch1-serment']) jouerSceneGroupe(c, r, s);
finirTempsLibre(c, r);

mkdirSync('roblox/parite/tmp', { recursive: true });
writeFileSync('roblox/parite/tmp/contenu.json', JSON.stringify(c));
const depart = nouvellePartie(c, 'p1', 'Partie de test', graine);
// états intermédiaires à comparer (pour trouver la première action qui diverge)
const points = (process.env.POINTS ?? '').split(',').filter(Boolean).map(Number);
writeFileSync('roblox/parite/tmp/entree.json', JSON.stringify({ depart, actions: r.actions, points }));
execFileSync(lune, ['run', 'parite/rejouer.luau'], { cwd: 'roblox', stdio: 'inherit' });
const sortie = JSON.parse(readFileSync('roblox/parite/tmp/sortie.json', 'utf8'));

/** Normalise : Luau ne distingue pas null/undefined ni liste vide/objet vide. */
function normaliser(x: unknown): unknown {
  if (x === null || x === undefined) return undefined;
  if (Array.isArray(x)) return x.length ? x.map(normaliser) : '∅';
  if (typeof x === 'object') {
    const res: Record<string, unknown> = {};
    for (const k of Object.keys(x as object).sort()) { const v = normaliser((x as Record<string, unknown>)[k]); if (v !== undefined) res[k] = v; }
    return Object.keys(res).length ? res : '∅';
  }
  return x;
}

const differences: string[] = [];
function comparer(a: unknown, b: unknown, chemin: string) {
  if (differences.length > 20) return;
  if (typeof a === 'object' && a && typeof b === 'object' && b) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) comparer((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${chemin}.${k}`);
  } else if (a !== b) differences.push(`${chemin} : web = ${JSON.stringify(a)?.slice(0, 80)} · Roblox = ${JSON.stringify(b)?.slice(0, 80)}`);
}
if (sortie.erreurs?.length) console.log('Erreurs côté Roblox :', sortie.erreurs.slice(0, 5));
if (points.length) {
  let etat = depart;
  for (let i = 0; i < r.actions.length; i++) {
    etat = appliquer(c, etat, r.actions[i]);
    const k = points.indexOf(i);
    if (k >= 0) { comparer(normaliser(etat), normaliser(sortie.points[k]), `après action ${i} (${r.actions[i].type})`); if (differences.length) break; }
  }
} else comparer(normaliser(r.etat), normaliser(sortie.etat), 'etat');
console.log(`${r.actions.length} actions rejouées (graine « ${graine} »).`);
if (differences.length) {
  console.log('Différences entre le web et Roblox :');
  for (const d of differences) console.log(' - ' + d);
  process.exit(1);
}
console.log('Parité OK : le moteur Roblox donne exactement le même état que le web.');
