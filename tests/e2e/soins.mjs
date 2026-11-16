/**
 * Soins au Temple avec la petite scène animée (environ 10 s) chez le joueur soigné (test 4, point 8 ; mise à jour 5,
 * point 1 : décor du Temple, sprites du héros et du prêtre, mains, rayon de la rosace, halo, lueurs, particules, flash).
 * Vérifie : la scène s'ouvre au clic, les phases se suivent aux bons moments (data-phase), les 3 répliques du prêtre,
 * les PV remontent, la notification « +X PV » n'arrive qu'à la fin ; « Passer » ferme tout de suite ; version courte
 * (2 s) avec prefers-reduced-motion. Captures de chaque phase dans rapports/captures-test-5/.
 *
 * Usage : `npx tsx tests/e2e/soins.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { etapeContrat } from '../../src/moteur/partie.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { finirCombats, jouer, nouvellePartieDeTest } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const dossier = resolve('rapports/captures-test-5');
mkdirSync(dossier, { recursive: true });
const c = contenuDisque();

// un héros qui sort d'un combat de contrat (PV entamés, PV gardés d'un combat à l'autre)
let r, depart;
for (let g = 0; g < 30; g++) {
  r = nouvellePartieDeTest(c, `soins${g}`);
  depart = r.etat;
  jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
  jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Daleko', classe: 'gardien', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } });
  jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: 'c-gobelins' });
  for (let k = 0; k < 10 && !r.etat.combats.h1; k++) { const x = etapeContrat(c, r.etat, 'h1'); if (!x) break; jouer(c, r, { type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined }); }
  finirCombats(c, r);
  if (r.etat.heros.h1.pv !== undefined && r.etat.heros.h1.or >= c.config.soins.temple.prix) break;
}
if (r.etat.heros.h1.pv === undefined) throw new Error('Le héros n\'a pas perdu de PV');
const fichier = join(tmpdir(), 'velmaris-soins.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));
const lignes = c.config.soins.temple[r.etat.heros.h1.blessure ? 'repliques_blessure' : 'repliques'];

const erreurs = [];
const navigateur = await chromium.launch();
async function ouvrir(options) {
  const page = await navigateur.newPage(options);
  page.on('pageerror', (e) => erreurs.push(`› ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator('[data-lieu="temple-du-seuil"]').click();
  const bouton = page.getByRole('button', { name: /Soins des prêtres/ });
  if (!(await bouton.isVisible())) await page.getByRole('button', { name: /Détails/ }).click();
  await bouton.click();
  return page;
}
const debutDe = (t) => t.replace(/\{\{.*$/, '').slice(0, 25);

// 1. scène complète
{
  const page = await ouvrir({ viewport: { width: 1366, height: 768 } });
  const soins = page.locator('.soins');
  await soins.waitFor({ timeout: 3000 });
  const t0 = Date.now();
  if (!(await soins.innerText()).includes(debutDe(lignes[0]))) erreurs.push('réplique 1 absente');
  if (await page.locator('.pile-notifs .gain').count()) erreurs.push('une notification de gain s\'affiche avant la fin des soins');
  if (!(await page.locator('.soins .cadre .sprite').count())) erreurs.push('le sprite du héros n\'est pas affiché');
  /** Attend un instant de la scène (ms depuis l'ouverture), vérifie la phase, fait une capture. */
  async function moment(ms, phase, capture) {
    await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    const p = Number(await page.locator('.soins .scene').getAttribute('data-phase'));
    if (p !== phase) erreurs.push(`à ${ms / 1000} s : phase ${p} au lieu de ${phase}`);
    if (capture) await page.locator('.soins').screenshot({ path: join(dossier, `soins-${capture}.png`) });
  }
  await moment(900, 0, '1-debut');
  await moment(2700, 1, '2-approche');
  await moment(4300, 2, '3-mains');
  if (!(await page.locator('.soins .scene.lumiere').count())) erreurs.push('la lumière ne vient pas');
  if (!(await soins.innerText()).includes(debutDe(lignes[1]))) erreurs.push('réplique 2 absente');
  await moment(6000, 3, '4-rayon');
  await moment(7300, 4, '5-halo');
  await moment(8250, 5, '6-flash');
  if (!(await soins.innerText()).includes(debutDe(lignes[2].replace('{{guéri|guérie}}', 'guéri')))) erreurs.push('réplique 3 absente');
  await moment(9300, 6, '7-calme');
  if (!(await soins.innerText()).match(/(\d+) \/ \1 PV/)) erreurs.push('les PV ne sont pas remontés au maximum');
  await soins.waitFor({ state: 'detached', timeout: 6000 });
  const duree = (Date.now() - t0) / 1000;
  if (duree < 8 || duree > 13) erreurs.push(`durée de la scène : ${duree.toFixed(1)} s (environ 10 attendues)`);
  await page.locator('.pile-notifs').getByText(/PV/).first().waitFor({ timeout: 3000 }).catch(() => erreurs.push('pas de notification « +X PV » à la fin'));
  console.log(`✔ scène complète (${duree.toFixed(1)} s)`);
  await page.close();
}
// 2. « Passer »
{
  const page = await ouvrir({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await page.locator('.soins').waitFor();
  await page.waitForTimeout(4500);
  await page.screenshot({ path: join(dossier, 'soins-telephone.png') });
  await page.getByRole('button', { name: /Passer/ }).click();
  await page.waitForTimeout(200);
  if (await page.locator('.soins').count()) erreurs.push('« Passer » ne ferme pas la scène');
  console.log('✔ Passer (téléphone)');
  await page.close();
}
// 3. version courte (prefers-reduced-motion)
{
  const page = await ouvrir({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  await page.locator('.soins').waitFor();
  const t0 = Date.now();
  await page.locator('.soins').waitFor({ state: 'detached', timeout: 5000 });
  const duree = (Date.now() - t0) / 1000;
  if (duree > 3) erreurs.push(`version courte trop longue : ${duree.toFixed(1)} s`);
  console.log(`✔ version courte (${duree.toFixed(1)} s)`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`Soins au Temple : OK (captures dans ${dossier}).`);
