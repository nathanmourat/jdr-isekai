/**
 * Cinématique de « L'Appel » : elle se joue au début de la scène, « Passer » la ferme, et elle ne revient pas au rechargement.
 * Il faut le fichier assets/cinematiques/appel.mp4 au moment du `npm run build` (sinon le test s'arrête sans rien vérifier).
 * Usage : `npx tsx tests/e2e/cinematique.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 * Captures dans rapports/captures-cinematique/.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { dormirJusquaLHistoire, finirTempsLibre, groupeDeDeux, jouer, jouerPrologues } from '../robot.ts';

if (!existsSync('assets/cinematiques/appel.mp4')) { console.log('Pas de assets/cinematiques/appel.mp4 : rien à vérifier.'); process.exit(0); }
const { chromium } = createRequire(import.meta.url)('playwright');
// `?cinematique` : sans ce paramètre, la vidéo est masquée quand un robot pilote le navigateur
const url = (process.argv[2] ?? 'http://localhost:4173/') + '?cinematique';
const dossier = resolve('rapports/captures-cinematique');
mkdirSync(dossier, { recursive: true });

const c = contenuDisque();
const r = groupeDeDeux(c, 'cinematique-appel');
const depart = r.etat;
jouerPrologues(c, r);
dormirJusquaLHistoire(c, r, 'ch1-appel');
finirTempsLibre(c, r);
jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
const fichier = join(tmpdir(), 'velmaris-cinematique.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));

const erreurs = [];
const navigateur = await chromium.launch();
for (const [ecran, viewport] of [['ordinateur', { width: 1366, height: 768 }], ['telephone', { width: 844, height: 390 }]]) {
  const page = await navigateur.newPage({ viewport });
  page.on('pageerror', (e) => erreurs.push(`${ecran} › ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  try { await page.locator('.cinematique video').waitFor({ timeout: 15000 }); } catch { erreurs.push(`${ecran} : la cinématique ne s'affiche pas`); await page.close(); continue; }
  await page.waitForTimeout(2500);
  const temps = await page.locator('.cinematique video').evaluate((v) => v.currentTime);
  if (!(temps > 0.5)) erreurs.push(`${ecran} : la vidéo ne joue pas (${temps} s)`);
  await page.screenshot({ path: join(dossier, `appel-${ecran}.png`) });
  const b = await page.locator('.cinematique .passer').boundingBox();
  if (!b || b.width < 44 || b.height < 44) erreurs.push(`${ecran} : bouton « Passer » trop petit`);
  await page.locator('.cinematique .passer').click();
  try { await page.locator('.replique').waitFor({ timeout: 5000 }); } catch { erreurs.push(`${ecran} : le dialogue ne reprend pas après « Passer »`); }
  if (await page.locator('.cinematique').count()) erreurs.push(`${ecran} : la cinématique reste affichée`);
  await page.reload();
  await page.waitForTimeout(3000);
  if (await page.locator('.cinematique').count()) erreurs.push(`${ecran} : la cinématique revient au rechargement`);
  console.log(`✔ ${ecran}`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`Captures dans ${dossier}`);
