/**
 * Verse des traductions dans un fichier de traductions/ : npx tsx scripts/traductions-verser.ts <fichier.yaml> <lot.yaml>
 * Le lot est une liste { i: numéro de l'entrée (à partir de 0, entrées non obsolètes), en, es, de, ja } ;
 * le texte français n'est pas recopié (moins d'erreurs). « fr » facultatif : vérifié s'il est donné (début du texte).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import YAML from 'yaml';

const [fichier, lot] = process.argv.slice(2);
const brut = readFileSync(fichier, 'utf8');
const entete = brut.split('\n').filter((l) => l.startsWith('#')).join('\n');
const entrees = YAML.parse(brut) as Record<string, unknown>[];
const actives = entrees.filter((e) => !e.obsolete);
const ajouts = YAML.parse(readFileSync(lot, 'utf8')) as Record<string, unknown>[];
let n = 0;
for (const a of ajouts) {
  const e = actives[a.i as number];
  if (!e) throw new Error(`Entrée ${a.i} absente de ${fichier}`);
  if (typeof a.fr === 'string' && !(e.fr as string).startsWith(a.fr)) throw new Error(`Entrée ${a.i} : « ${a.fr} » ≠ « ${e.fr} »`);
  for (const l of ['en', 'es', 'de', 'ja']) if (typeof a[l] === 'string') e[l] = a[l];
  n++;
}
writeFileSync(fichier, `${entete}\n${YAML.stringify(entrees, { lineWidth: 0 })}`);
console.log(`${n} entrées versées dans ${fichier}`);
