/**
 * Entraînement de l'IA maison — `npm run ia:entrainer`
 * Génère le corpus (src/ia/corpus.ts), entraîne le classificateur, l'évalue,
 * et écrit le modèle dans src/ia/modele.json.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contenuDisque, RACINE } from '../src/contenu/node';
import { entrainer, predire } from '../src/ia/classificateur';
import { INTENTIONS, MODELES, REMPLISSAGE } from '../src/ia/corpus';
import { PHRASES_TEST } from '../src/ia/phrases-test';
import { aleatoire, choisir, creerRng } from '../src/moteur/rng';

const rng = creerRng('ia-velmaris');
const contenu = contenuDisque();
const nomsCompetences = Object.values(contenu.competences).map((c) => c.nom.toLowerCase());

function remplir(modele: string): string {
  return modele
    .replaceAll('{C2}', choisir(rng, nomsCompetences))
    .replaceAll('{C}', choisir(rng, nomsCompetences))
    .replaceAll('{EL2}', choisir(rng, REMPLISSAGE.EL2))
    .replace(/\{(E|A|P|EL|OB|CS)\}/g, (_, k: keyof typeof REMPLISSAGE) => choisir(rng, REMPLISSAGE[k]));
}

/** Fautes de frappe : lettre oubliée, doublée ou inversée (15 % des mots). */
function bruiter(t: string): string {
  return t.split(' ').map((m) => {
    if (m.length < 5 || aleatoire(rng) > 0.15) return m;
    const i = 1 + Math.floor(aleatoire(rng) * (m.length - 2));
    const r = aleatoire(rng);
    if (r < 0.33) return m.slice(0, i) + m.slice(i + 1);
    if (r < 0.66) return m.slice(0, i) + m[i] + m.slice(i);
    return m.slice(0, i - 1) + m[i] + m[i - 1] + m.slice(i + 1);
  }).join(' ');
}

const exemples: { texte: string; classe: string }[] = [];
const PAR_INTENTION = 320;
for (const intention of INTENTIONS) {
  for (let k = 0; k < PAR_INTENTION; k++) {
    const base = remplir(choisir(rng, MODELES[intention]));
    let texte = `${choisir(rng, REMPLISSAGE.INTRO)}${base}${choisir(rng, REMPLISSAGE.FIN)}`;
    if (aleatoire(rng) < 0.5) texte = bruiter(texte);
    exemples.push({ texte, classe: intention });
  }
}
// mélange puis découpe 85 % entraînement / 15 % validation
for (let i = exemples.length - 1; i > 0; i--) { const j = Math.floor(aleatoire(rng) * (i + 1)); [exemples[i], exemples[j]] = [exemples[j], exemples[i]]; }
const coupure = Math.floor(exemples.length * 0.85);
const entrainement = exemples.slice(0, coupure), validation = exemples.slice(coupure);

const classes = [...INTENTIONS];
const modeleValidation = entrainer(entrainement, classes);
const tauxValidation = validation.filter((e) => predire(modeleValidation, e.texte).classe === e.classe).length / validation.length;

// modèle final : entraîné sur tout le corpus généré
const modele = entrainer(exemples, classes, 0.5, 2);
const erreurs: string[] = [];
let ok = 0;
for (const p of PHRASES_TEST) {
  const r = predire(modele, p.texte);
  if (r.classe === p.intention) ok++;
  else erreurs.push(`  « ${p.texte} » → ${r.classe} (${Math.round(r.confiance * 100)} %), attendu ${p.intention}`);
}
const tauxTest = ok / PHRASES_TEST.length;
const json = JSON.stringify(modele);
writeFileSync(join(RACINE, 'src', 'ia', 'modele.json'), json + '\n');

console.log(`Corpus : ${exemples.length} phrases générées (${INTENTIONS.length} intentions, ${PAR_INTENTION} par intention), vocabulaire ${modele.vocab.length} traits`);
console.log(`Précision sur la validation (phrases générées non vues) : ${(tauxValidation * 100).toFixed(1).replace('.', ',')} %`);
console.log(`Précision sur les ${PHRASES_TEST.length} phrases écrites à la main : ${(tauxTest * 100).toFixed(1).replace('.', ',')} %`);
if (erreurs.length) console.log(`Erreurs :\n${erreurs.join('\n')}`);
console.log(`Modèle écrit dans src/ia/modele.json (${(json.length / 1024).toFixed(0)} Ko)`);
process.exit(tauxTest >= 0.85 ? 0 : 1);
