/**
 * Liste des images encore à fournir — `npm run assets:manquants`
 * Lit docs/LISTE-TEXTURES.md, vérifie la présence de chaque fichier dans assets/, et affiche ce qui manque
 * par priorité. Option --cocher : met à jour les cases [x] du fichier LISTE-TEXTURES.md.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RACINE } from '../src/contenu/node';

const chemin = join(RACINE, 'docs', 'LISTE-TEXTURES.md');
const lignes = readFileSync(chemin, 'utf8').split('\n');
let priorite = '';
const manquants: Record<string, string[]> = {};
let presents = 0, total = 0;
const sortie = lignes.map((l) => {
  const p = l.match(/^## PRIORITÉ (\d)/);
  if (p) priorite = p[1];
  const m = l.match(/^\| \[( |x)\] \| (\d+) \| `([^`]+)`/);
  if (!m) return l;
  const fichier = m[3].split(' ')[0];
  total++;
  const ok = existsSync(join(RACINE, 'assets', fichier));
  if (ok) presents++; else (manquants[priorite] ??= []).push(fichier);
  return l.replace(/^\| \[( |x)\]/, `| [${ok ? 'x' : ' '}]`);
});
console.log(`Images présentes : ${presents} / ${total}\n`);
for (const [p, liste] of Object.entries(manquants)) {
  console.log(`Priorité ${p} — ${liste.length} manquante(s) :`);
  for (const f of liste) console.log(`  - assets/${f}`);
  console.log('');
}
if (process.argv.includes('--cocher')) { writeFileSync(chemin, sortie.join('\n')); console.log('Cases mises à jour dans docs/LISTE-TEXTURES.md'); }
