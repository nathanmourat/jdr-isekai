/**
 * Équilibrage des examens de rang de la Guilde : `npx tsx scripts/equilibrage-examens.ts [combats]`
 * Pour chaque examen « combat » de content/config/campagne.yaml, simule des combats pour chaque classe,
 * seule puis à deux, au niveau minimum du rang (sans équipement : c'est le cas le plus dur).
 * Objectif : un examen sérieux mais faisable — entre 45 % et 85 % de réussite en moyenne au niveau minimum.
 */
import { contenuDisque } from '../src/contenu/node';
import { simulerCombat } from '../src/moteur/simulation';

const c = contenuDisque();
const n = Number(process.argv[2] ?? 300);
const classes = Object.keys(c.classes);
const don = Object.keys(c.dons).find((d) => d !== 'second-depart') ?? Object.keys(c.dons)[0];
let probleme = false;
for (const r of c.config.guilde.rangs) {
  const rencontre = r.examen?.type === 'combat' ? r.examen.rencontre : r.examen?.type === 'epreuve' ? c.contrats[r.examen.contrat ?? '']?.etapes.find((e) => e.combat)?.combat : undefined;
  if (!rencontre) continue;
  console.log(`\n## Examen du rang ${r.rang} (${rencontre}) — niveau ${r.niveau_min}, ${n} combats par cas`);
  let somme = 0;
  for (const cl of classes) {
    let seul = 0, duo = 0;
    for (let i = 0; i < n; i++) {
      if (simulerCombat(c, rencontre, [{ classe: cl, race: 'humain', don, niveau: r.niveau_min }], `ex:${r.rang}:${cl}:${i}`).resultat === 'victoire') seul++;
      if (simulerCombat(c, rencontre, [{ classe: cl, race: 'humain', don, niveau: r.niveau_min }, { classe: 'guerisseur', race: 'humain', don, niveau: r.niveau_min }], `ex2:${r.rang}:${cl}:${i}`).resultat === 'victoire') duo++;
    }
    somme += seul / n;
    console.log(`| ${c.classes[cl].nom.padEnd(22)} | seul ${(100 * seul / n).toFixed(0).padStart(3)} % | avec un Guérisseur ${(100 * duo / n).toFixed(0).padStart(3)} % |`);
  }
  const moyenne = 100 * somme / classes.length;
  const ok = moyenne >= 45 && moyenne <= 85;
  if (!ok) probleme = true;
  console.log(`Moyenne seul : ${moyenne.toFixed(1)} % ${ok ? '✅' : '❌ (objectif : entre 45 % et 85 %)'}`);
}
process.exit(probleme ? 1 : 0);
