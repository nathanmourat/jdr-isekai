/**
 * Test 4, point 5 : une seule chose ouverte à la fois (bulle, fenêtre, tiroir, menu).
 *   - clic sur Ferrand (bulle), puis « Faire identifier un objet » : la bulle se ferme, seule la fenêtre reste ;
 *   - bulle ouverte, puis menu ☰ : la bulle se ferme ;
 *   - tiroir « Personnage » ouvert, puis clic sur un personnage : le tiroir se ferme, la bulle s'ouvre ;
 *   - boutique de Bram ouverte depuis sa bulle : la bulle se ferme.
 * Sur ordinateur et sur téléphone.
 *
 * Usage : `npx tsx tests/e2e/fenetres.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { finirScene, jouer, jouerSceneGroupe, nouvellePartieDeTest } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const c = contenuDisque();

// une partie après l'examen de la Guilde (Ferrand est alors à la taverne)
const r = nouvellePartieDeTest(c, 'fenetres');
const depart = r.etat;
jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Daleko', classe: 'gardien', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } });
jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
finirScene(c, r, 'groupe', ['j1']);
jouerSceneGroupe(c, r, 'ch1-examen');
if (r.etat.scenes.groupe) jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' });
const fichier = join(tmpdir(), 'velmaris-fenetres.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));

const erreurs = [];
const verifier = (cond, message) => { if (!cond) erreurs.push(message); };
const navigateur = await chromium.launch();
for (const [nom, viewport, dpr] of [['ordinateur', { width: 1366, height: 768 }, 1], ['telephone', { width: 390, height: 844 }, 3]]) {
  const page = await navigateur.newPage({ viewport, deviceScaleFactor: dpr });
  page.on('pageerror', (e) => erreurs.push(`${nom} › ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator('[data-ville="lysmont"]').click();
  await page.locator('[data-lieu="taverne"]').click();
  const bulle = page.locator('.bulle');
  const fenetres = page.locator('.fenetre');

  // 1. bulle de Ferrand, puis « Faire identifier un objet »
  await page.locator('[data-pnj="ferrand"]').click();
  await bulle.waitFor();
  await page.getByRole('button', { name: /Faire identifier un objet/ }).click();
  await page.waitForTimeout(200);
  verifier(await bulle.count() === 0, `${nom} : la bulle de Ferrand reste ouverte sous la fenêtre d'identification`);
  verifier(await fenetres.count() === 1, `${nom} : ${await fenetres.count()} fenêtre(s) ouverte(s) au lieu d'une`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  verifier(await fenetres.count() === 0, `${nom} : la fenêtre ne se ferme pas avec Échap`);

  // 2. bulle ouverte, puis menu ☰
  await page.locator('[data-pnj="ferrand"]').click();
  await bulle.waitFor();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.waitForTimeout(200);
  verifier(await bulle.count() === 0, `${nom} : la bulle reste ouverte quand on ouvre le menu`);

  // 3. tiroir « Personnage », puis clic sur Bram
  await page.getByRole('menuitem', { name: /Personnage/ }).click();
  await page.locator('.tiroir').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: /Personnage/ }).click();
  await page.locator('[data-pnj="bram"]').click({ force: true });
  await page.waitForTimeout(250);
  verifier(await page.locator('.tiroir').count() === 0, `${nom} : le tiroir reste ouvert quand on parle à Bram`);

  // 4. boutique de Bram depuis sa bulle
  if (await bulle.count() === 0) await page.locator('[data-pnj="bram"]').click();
  await bulle.waitFor();
  const marchandise = page.getByRole('button', { name: /Voir la marchandise/ });
  if (await marchandise.count()) {
    await marchandise.first().click();
    await page.waitForTimeout(200);
    verifier(await bulle.count() === 0, `${nom} : la bulle de Bram reste ouverte sous la boutique`);
    verifier(await fenetres.count() === 1, `${nom} : boutique : ${await fenetres.count()} fenêtre(s)`);
  }
  console.log(`✔ ${nom}`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log('Une seule chose ouverte à la fois : OK.');
