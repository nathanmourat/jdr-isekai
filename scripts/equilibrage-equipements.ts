/**
 * Équilibrage de l'équipement du palier I (le seul en vente au chapitre 1) — `npm run equilibrage:equipements`
 * Chaque classe (race humaine) combat les 5 rencontres de référence au niveau 1 :
 * sans équipement, avec l'ensemble commun, l'ensemble « de maître » et l'ensemble nommé de sa classe.
 * Critère : pour chaque ensemble, chaque classe reste à ± 10 points de la moyenne des classes.
 * Les paliers II à X seront simulés quand les ennemis des chapitres 2 à 6 existeront (aucun ennemi au-delà du niveau 7 aujourd'hui).
 * Options : --rapide (100 combats par cas au lieu de 500)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Objet } from '../src/contenu/schemas';
import { contenuDisque, RACINE } from '../src/contenu/node';
import { pc, RENCONTRES_REFERENCE, tauxVictoire, type HerosSimule } from '../src/moteur/simulation';

const n = process.argv.includes('--rapide') ? 100 : 500;
const c = contenuDisque();
const palierI = Object.values(c.objets).filter((o) => o.type === 'equipement' && o.palier === 'I');
const pour = (classe: string, o: Objet) => !o.classes?.length || o.classes.includes(classe);

type Ensemble = 'aucun' | 'commun' | 'maitre' | 'nomme';
const ENSEMBLES: Record<Ensemble, string> = { aucun: 'Sans équipement', commun: 'Communs', maitre: '« De maître »', nomme: 'Nommés' };

/** Intérêt d'un objet pour une classe (ce qu'un joueur regarderait) : sa caractéristique d'attaque compte triple. */
function interet(classe: string, o: Objet): number {
  const b = o.bonus;
  if (!b) return 0;
  const stat = c.classes[classe].attaque.stat;
  let v = b.puissance * 2 + b.armure / 2;
  for (const [k, x] of Object.entries(b.caracs)) v += (x ?? 0) * (k === stat ? 3 : 1);
  return v;
}

/** Meilleur objet par emplacement pour la classe, dans la sélection. */
function ensemble(classe: string, e: Ensemble): HerosSimule['equipement'] {
  if (e === 'aucun') return {};
  const filtre = (o: Objet) => pour(classe, o) && (e === 'commun' ? o.rarete === 'commun' : e === 'maitre' ? o.id.endsWith('-i-maitre') : o.rarete === 'peu-commun' && !o.id.endsWith('-i-maitre'));
  const res: Record<string, string> = {};
  for (const emp of ['arme', 'armure', 'accessoire'] as const) {
    const tri = (a: Objet, b: Objet) => interet(classe, b) - interet(classe, a) || (a.classes?.length ?? 10) - (b.classes?.length ?? 10) || a.id.localeCompare(b.id);
    let choix = palierI.filter((o) => o.emplacement === emp && filtre(o)).sort(tri)[0];
    // pas d'objet nommé pour cet emplacement : on garde l'objet « de maître »
    if (!choix && e === 'nomme') choix = palierI.filter((o) => o.emplacement === emp && pour(classe, o) && o.id.endsWith('-i-maitre')).sort(tri)[0];
    if (choix) res[emp] = choix.id;
  }
  return res;
}

const debut = Date.now();
const lignes: { classe: string; nom: string; taux: Record<Ensemble, number>; objets: Record<Ensemble, string> }[] = [];
for (const cl of Object.values(c.classes)) {
  const taux = {} as Record<Ensemble, number>;
  const objets = {} as Record<Ensemble, string>;
  for (const e of Object.keys(ENSEMBLES) as Ensemble[]) {
    const eq = ensemble(cl.id, e);
    objets[e] = Object.values(eq ?? {}).map((id) => c.objets[id].nom).join(', ');
    let v = 0, t = 0;
    for (const r of RENCONTRES_REFERENCE) {
      const res = tauxVictoire(c, r, [{ classe: cl.id, race: 'humain', don: 'oeil-du-seuil', equipement: eq }], n, `eq:${cl.id}:${e}:${r}`);
      v += res.victoires; t += res.combats;
    }
    taux[e] = v / t;
  }
  lignes.push({ classe: cl.id, nom: cl.nom, taux, objets });
  process.stdout.write('.');
}
console.log();

const l: string[] = ['# Équilibrage de l\'équipement (palier I)', '', `- ${n} combats par rencontre de référence et par cas (${(Date.now() - debut) / 1000 | 0} s), niveau 1, race humaine, don « Œil du Seuil »`, '- Critère : chaque classe à ± 10 points de la moyenne des classes, pour chaque ensemble', ''];
l.push(`| Classe | ${Object.values(ENSEMBLES).join(' | ')} | Gain (nommés) |`, `|---|${Object.keys(ENSEMBLES).map(() => '---').join('|')}|---|`);
for (const x of lignes) l.push(`| ${x.nom} | ${(Object.keys(ENSEMBLES) as Ensemble[]).map((e) => pc(x.taux[e])).join(' | ')} | +${((x.taux.nomme - x.taux.aucun) * 100).toFixed(1).replace('.', ',')} pts |`);
const problemes: string[] = [];
const moyennes = {} as Record<Ensemble, number>;
for (const e of Object.keys(ENSEMBLES) as Ensemble[]) {
  moyennes[e] = lignes.reduce((a, x) => a + x.taux[e], 0) / lignes.length;
  for (const x of lignes) if (Math.abs(x.taux[e] - moyennes[e]) > 0.1) problemes.push(`${ENSEMBLES[e]} : ${x.nom} à ${pc(x.taux[e])} (moyenne ${pc(moyennes[e])})`);
}
l.push(`| **Moyenne** | ${(Object.keys(ENSEMBLES) as Ensemble[]).map((e) => `**${pc(moyennes[e])}**`).join(' | ')} | |`);
l.push('', '## Objets utilisés', '', '| Classe | Communs | « De maître » | Nommés |', '|---|---|---|---|');
for (const x of lignes) l.push(`| ${x.nom} | ${x.objets.commun} | ${x.objets.maitre} | ${x.objets.nomme} |`);
l.push('', problemes.length ? `## ❌ ${problemes.length} écart(s) hors fourchette\n\n${problemes.map((p) => `- ${p}`).join('\n')}` : '## ✅ Tous les critères sont respectés');
const md = l.join('\n');
console.log(md);
mkdirSync(join(RACINE, 'rapports'), { recursive: true });
writeFileSync(join(RACINE, 'rapports', 'equilibrage-equipements.md'), md + '\n');
process.exit(problemes.length ? 1 : 0);
