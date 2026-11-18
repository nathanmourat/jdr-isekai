/**
 * Banc d'essai de l'IA de combat — `npm run ia:banc` (ou `npx tsx scripts/banc-ia.ts [avant|apres]`).
 * Affiche le taux de réussite par intention et par difficulté, et la liste des erreurs graves.
 * Avec « avant » ou « apres », écrit aussi le détail dans rapports/ia-combat-<avant|apres>.json.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contenuDisque, RACINE } from '../src/contenu/node';
import { evaluer, resume } from '../tests/ia/evaluer';

const c = contenuDisque();
const res = evaluer(c);
const r = resume(res);
const pc = (ok: number, n: number) => `${((100 * ok) / Math.max(1, n)).toFixed(1).replace('.', ',')} %`;
console.log(`Banc d'essai : ${r.total.ok} / ${r.total.n} (${pc(r.total.ok, r.total.n)}) ; erreurs graves : ${r.graves.length}`);
console.log('\nPar intention :');
for (const [k, v] of r.parCategorie) console.log(`  ${k.padEnd(13)} ${String(v.ok).padStart(3)} / ${String(v.n).padEnd(3)} ${pc(v.ok, v.n)}`);
console.log('\nPar difficulté (1 propre, 2 fautes/SMS, 3 long/indirect/créatif) :');
for (const [k, v] of r.parNiveau) console.log(`  ${k} : ${v.ok} / ${v.n} (${pc(v.ok, v.n)})`);
if (r.graves.length) {
  console.log('\nErreurs graves :');
  for (const g of r.graves) console.log(`  « ${g.phrase.texte} » (${g.phrase.qui}) → ${JSON.stringify(g.obtenu)} : ${g.grave}`);
}
if (process.argv.includes('--echecs')) {
  console.log('\nÉchecs :');
  for (const e of res.filter((x) => !x.ok)) console.log(`  [${e.phrase.categorie}] « ${e.phrase.texte} » (${e.phrase.qui}) attendu ${JSON.stringify(e.phrase.attendu)} → ${JSON.stringify(e.obtenu)}`);
}
const quand = process.argv.find((a) => a === 'avant' || a === 'apres');
if (quand) {
  writeFileSync(join(RACINE, 'rapports', `ia-combat-${quand}.json`), JSON.stringify({ resume: { total: r.total, graves: r.graves.length, parCategorie: r.parCategorie, parNiveau: r.parNiveau }, details: res.map((x) => ({ qui: x.phrase.qui, niveau: x.phrase.niveau, categorie: x.phrase.categorie, texte: x.phrase.texte, attendu: x.phrase.attendu, obtenu: x.obtenu, ok: x.ok, grave: x.grave })) }, null, 1));
  console.log(`\nDétail écrit dans rapports/ia-combat-${quand}.json`);
}
