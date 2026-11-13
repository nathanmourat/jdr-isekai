/**
 * Parité de l'IA maison web / Roblox : les 69 phrases de test sont interprétées dans un vrai combat,
 * en TypeScript puis par le moteur Luau (sous Lune). Les réponses doivent être identiques.
 * Usage : LUNE=chemin/vers/lune npx tsx scripts/roblox-parite-ia.ts
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { contenuDisque } from '../src/contenu/node';
import { interpreter, propositionsScript } from '../src/ia/interpreteur';
import { PHRASES_TEST } from '../src/ia/phrases-test';
import { avancer, combattantHeros, demarrerCombat } from '../src/moteur/combat';
import { creerHeros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';

const lune = process.env.LUNE ?? 'lune';
const c = contenuDisque();
const heros = [
  creerHeros(c, { id: 'h1', joueurId: 'j1', nom: 'Kael', classe: 'lame-runique', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, anneeCampagne: 1012 }),
  creerHeros(c, { id: 'h2', joueurId: 'j2', nom: 'Ilo', classe: 'arcaniste', race: 'elfe', don: 'mimetisme', origine: 'invoque', age: 22, anneeCampagne: 1012 }),
];
const rng = creerRng('ia');
const combat = demarrerCombat(c, 'loups-combe', heros.map((h) => combattantHeros(c, h, true)), rng);
avancer(c, combat, rng);
const acteur = combat.enAttente!;
const h = heros.find((x) => `h:${x.id}` === acteur) ?? heros[0];

mkdirSync('roblox/parite/tmp', { recursive: true });
writeFileSync('roblox/parite/tmp/contenu.json', JSON.stringify(c));
writeFileSync('roblox/parite/tmp/ia.json', JSON.stringify({ combat, acteur, heros: h, phrases: PHRASES_TEST.map((p) => p.texte) }));
const resume = (i: ReturnType<typeof interpreter>) => `${i.possible} | ${i.message} | ${i.proposition?.libelle ?? '-'} | ${i.alternatives.map((a) => a.libelle).join(' / ')}`;
const web = [
  propositionsScript({ contenu: c, combat, acteur, heros: h, grimoire: {} }).map((p) => p.libelle).join(' / '),
  ...PHRASES_TEST.map((p) => resume(interpreter({ contenu: c, combat, acteur, heros: h, grimoire: {} }, p.texte))),
];
execFileSync(lune, ['run', 'parite/ia.luau'], { cwd: 'roblox', stdio: 'inherit' });
const roblox: string[] = JSON.parse(readFileSync('roblox/parite/tmp/ia-sortie.json', 'utf8'));
let diff = 0;
web.forEach((w, i) => {
  if (w !== roblox[i]) { diff++; if (diff <= 10) console.log(`Différence (${i === 0 ? 'script' : PHRASES_TEST[i - 1].texte}) :\n  web    = ${w}\n  Roblox = ${roblox[i]}`); }
});
if (diff) { console.log(`${diff} différence(s) sur ${web.length}.`); process.exit(1); }
console.log(`Parité IA OK : ${web.length} réponses identiques (script + ${PHRASES_TEST.length} phrases).`);
