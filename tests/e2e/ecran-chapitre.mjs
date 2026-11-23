/**
 * Écran de début de chapitre : l'illustration du chapitre 1 s'affiche quand le héros est libre sur la carte,
 * « Continuer » la ferme, et elle ne revient pas au rechargement.
 * Usage : `npx tsx tests/e2e/ecran-chapitre.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 * Captures dans rapports/captures-illustrations/.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { dormirJusquaLHistoire, finirTempsLibre, groupeDeDeux, jouerPrologues } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
// `?ecran-chapitre` : sans ce paramètre, l'écran est masqué quand un robot pilote le navigateur
const url = (process.argv[2] ?? 'http://localhost:4173/') + '?ecran-chapitre';
const dossier = resolve('rapports/captures-illustrations');
mkdirSync(dossier, { recursive: true });

const c = contenuDisque();
const r = groupeDeDeux(c, 'ecran-chapitre');
const depart = r.etat;
jouerPrologues(c, r);
dormirJusquaLHistoire(c, r, 'ch1-appel');
finirTempsLibre(c, r);
const fichier = join(tmpdir(), 'velmaris-ecran-chapitre.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));

const erreurs = [];
const navigateur = await chromium.launch();
for (const [ecran, viewport] of [['ordinateur', { width: 1366, height: 768 }], ['telephone', { width: 844, height: 390 }], ['portrait', { width: 390, height: 844 }]]) {
  const page = await navigateur.newPage({ viewport });
  page.on('pageerror', (e) => erreurs.push(`${ecran} › ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  // héros du robot : sexe pas encore choisi → la fenêtre « Votre héros » passe d'abord (l'écran attend qu'elle soit fermée)
  try { await page.getByRole('button', { name: 'un homme' }).click({ timeout: 8000 }); } catch { /* déjà choisi */ }
  try { await page.locator('.ecran-chapitre img.active').waitFor({ timeout: 15000 }); } catch { erreurs.push(`${ecran} : l'écran du chapitre 1 ne s'affiche pas`); await page.close(); continue; }
  await page.waitForTimeout(1500);
  const charge = await page.locator('.ecran-chapitre img.active').evaluate((i) => i.complete && i.naturalWidth > 0);
  if (!charge) erreurs.push(`${ecran} : l'illustration ne se charge pas`);
  const titre = await page.locator('.ecran-chapitre h1').innerText();
  if (titre !== "L'Appel") erreurs.push(`${ecran} : titre inattendu « ${titre} »`);
  await page.screenshot({ path: join(dossier, `chapitre-1-${ecran}.png`) });
  const b = await page.locator('.ecran-chapitre button').boundingBox();
  if (!b || b.width < 44 || b.height < 44) erreurs.push(`${ecran} : bouton « Continuer » trop petit`);
  if (b && (b.y + b.height > viewport.height || b.y < 0)) erreurs.push(`${ecran} : bouton « Continuer » hors de l'écran`);
  await page.locator('.ecran-chapitre button').click();
  await page.waitForTimeout(500);
  if (await page.locator('.ecran-chapitre').count()) erreurs.push(`${ecran} : l'écran reste affiché`);
  await page.reload();
  await page.waitForTimeout(3000);
  if (await page.locator('.ecran-chapitre').count()) erreurs.push(`${ecran} : l'écran revient au rechargement`);
  console.log(`✔ ${ecran}`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`Captures dans ${dossier}`);
