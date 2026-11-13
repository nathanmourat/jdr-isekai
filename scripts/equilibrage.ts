/**
 * Simulation d'équilibrage — `npm run equilibrage`
 * Options : --rapide (100 combats par cas au lieu de 1 000)
 * Écrit rapports/equilibrage.md et rapports/equilibrage.csv ; échoue si un critère n'est pas respecté.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contenuDisque, RACINE } from '../src/contenu/node';
import { equilibrage, pc, RENCONTRES_REFERENCE } from '../src/moteur/simulation';

const rapide = process.argv.includes('--rapide');
const n = rapide ? 100 : 1000;
const contenu = contenuDisque();
const debut = Date.now();
console.log(`Simulation : ${n} combats par combinaison classe × race et par rencontre de référence…`);
const r = equilibrage(contenu, n, rapide ? 40 : 200, rapide ? 200 : 600);

const nomsR: Record<string, string> = { 'ref-brute': 'Brute', 'ref-rapide': 'Rapide', 'ref-mage': 'Mage', 'ref-meute': 'Groupe', 'ref-chef': 'Mini-boss' };
const l: string[] = [];
l.push(`# Rapport d'équilibrage`, '', `- Combats par cas : **${n}** (${(Date.now() - debut) / 1000 | 0} s de calcul)`, `- Taux de victoire moyen (toutes classes et races, niveau 1, en solo) : **${pc(r.moyenne)}**`, `- Fourchettes : classe et race ± 10 points, combinaison ± 15 points, don ± 10 points (autour de la moyenne des dons)`, '');
l.push('## Classes (moyenne sur les 8 races)', '', `| Classe | Victoires | Écart | ${RENCONTRES_REFERENCE.map((x) => nomsR[x]).join(' | ')} | Tours moyens |`, `|---|---|---|${RENCONTRES_REFERENCE.map(() => '---').join('|')}|---|`);
for (const c of r.classes) l.push(`| ${c.nom} | ${pc(c.taux)} | ${signe(c.taux - r.moyenne)} | ${RENCONTRES_REFERENCE.map((x) => pc(c.parRencontre[x])).join(' | ')} | ${c.tours.toFixed(1).replace('.', ',')} |`);
l.push('', '## Races (moyenne sur les 10 classes)', '', '| Race | Victoires | Écart |', '|---|---|---|');
for (const x of r.races) l.push(`| ${x.nom} | ${pc(x.taux)} | ${signe(x.taux - r.moyenne)} |`);
const races = r.races.map((x) => x.id);
l.push('', '## Combinaisons classe × race', '', `| Classe | ${r.races.map((x) => x.nom).join(' | ')} |`, `|---|${races.map(() => '---').join('|')}|`);
for (const c of r.classes) l.push(`| ${c.nom} | ${races.map((ra) => pc(r.combinaisons.find((x) => x.classe === c.id && x.race === ra)!.taux)).join(' | ')} |`);
const moyDons = r.dons.reduce((a, x) => a + x.taux, 0) / r.dons.length;
l.push('', '## Dons (toutes classes, race humaine)', '', '| Don | Victoires | Écart |', '|---|---|---|');
for (const d of r.dons) l.push(`| ${d.nom} | ${pc(d.taux)} | ${signe(d.taux - moyDons)} |`);
l.push('', '## Adaptation de la difficulté au nombre de héros', '', '| Héros | Victoires |', '|---|---|');
for (const g of r.groupes) l.push(`| ${g.taille} | ${pc(g.taux)} |`);
l.push('', r.conforme ? '## ✅ Tous les critères sont respectés' : `## ❌ ${r.problemes.length} problème(s)\n\n${r.problemes.map((p) => `- ${p}`).join('\n')}`);
const md = l.join('\n');
console.log(md);

mkdirSync(join(RACINE, 'rapports'), { recursive: true });
writeFileSync(join(RACINE, 'rapports', 'equilibrage.md'), md + '\n');
const csv = ['classe;race;taux_victoire', ...r.combinaisons.map((c) => `${c.classe};${c.race};${c.taux.toFixed(4).replace('.', ',')}`)].join('\n');
writeFileSync(join(RACINE, 'rapports', 'equilibrage.csv'), csv + '\n');
console.log('\nRapports écrits dans rapports/equilibrage.md et rapports/equilibrage.csv');
process.exit(r.conforme ? 0 : 1);

function signe(x: number) { const p = (x * 100).toFixed(1).replace('.', ','); return x >= 0 ? `+${p}` : p; }
