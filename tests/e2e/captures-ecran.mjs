/**
 * Captures de l'écran de jeu plein écran, sur ordinateur (1920 × 1080, 1366 × 768) et sur téléphone (portrait et paysage) :
 * carte, plan de Lysmont, lieu avec le cadre du bas, dialogue, tiroir « Personnage », combat.
 * Vérifie aussi que la page ne défile jamais.
 *
 * Usage : `npx tsx tests/e2e/captures-ecran.mjs [url] [dossier]` (par défaut http://localhost:4173/ et rapports/captures-ecran)
 * Prérequis : `npm run build` + `npx vite preview --port 4173`, Playwright installé.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { appliquer, etapeContrat, nouvellePartie } from '../../src/moteur/partie.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const dossier = resolve(process.argv[3] ?? 'rapports/captures-ecran');
mkdirSync(dossier, { recursive: true });
const erreurs = [];

// sauvegarde d'un combat (contrat de chasse), importée comme le ferait un joueur
const c = contenuDisque();
const depart = nouvellePartie(c, 'ecran', 'Captures écran', 'ecran');
let etat = depart; const actions = [];
const jouer = (a) => { etat = appliquer(c, etat, a); actions.push(a); };
jouer({ type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
jouer({ type: 'creer_heros', joueur: 'j1', heros: { nom: 'Daleko', classe: 'ombre', race: 'ourvalis', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } });
jouer({ type: 'contrat', joueur: 'j1', contrat: 'c-gobelins' });
for (let k = 0; k < 10 && !etat.combats.h1; k++) { const x = etapeContrat(c, etat, 'h1'); jouer({ type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined }); }
const fichierCombat = join(tmpdir(), 'velmaris-captures-ecran-combat.json');
writeFileSync(fichierCombat, JSON.stringify(creerSauvegarde(depart, actions, new Date().toISOString())));

const ECRANS = [
  ['1920x1080', { width: 1920, height: 1080 }, 1],
  ['1366x768', { width: 1366, height: 768 }, 1],
  ['telephone-portrait', { width: 390, height: 844 }, 3],
  ['telephone-paysage', { width: 844, height: 390 }, 3],
];

async function pasDeDefilement(page, nom) {
  const r = await page.evaluate(() => ({ h: document.scrollingElement.scrollHeight, vh: innerHeight, w: document.scrollingElement.scrollWidth, vw: innerWidth }));
  if (r.h > r.vh + 1 || r.w > r.vw + 1) erreurs.push(`${nom} : la page défile (${r.w}×${r.h} pour un écran de ${r.vw}×${r.vh})`);
}

async function capture(page, ecran, vue) {
  await page.waitForTimeout(600);
  await pasDeDefilement(page, `${ecran} › ${vue}`);
  await page.screenshot({ path: join(dossier, `${ecran}-${vue}.png`) });
}

const navigateur = await chromium.launch();
for (const [ecran, viewport, dpr] of ECRANS) {
  const page = await navigateur.newPage({ viewport, deviceScaleFactor: dpr });
  page.on('pageerror', (e) => erreurs.push(`${ecran} › ${e.message}`));
  await page.goto(url);
  await page.getByLabel('Nom de la nouvelle partie locale').fill(`Écran ${ecran}`);
  await page.getByRole('button', { name: 'Créer' }).first().click();
  await page.getByLabel('Pseudo').fill('Testeur');
  await page.getByRole('button', { name: 'Rejoindre la partie' }).click();
  await page.getByPlaceholder('ex. Kael').fill('Daleko');
  await page.getByRole('button', { name: /^Ombre/ }).first().click();
  await page.getByRole('button', { name: /^Œil du Seuil/ }).click();
  await page.getByRole('button', { name: 'Créer mon héros' }).click();
  await page.locator('[data-lieu="temple-du-seuil"]').waitFor();
  await capture(page, ecran, '1-carte');

  // le Temple : clic sur le Grand Prieur, le cadre du bas s'ouvre sur la discussion
  await page.locator('[data-lieu="temple-du-seuil"]').click();
  await capture(page, ecran, '2-lieu');
  await page.locator('[data-pnj="aureliath"]').click();
  await capture(page, ecran, '3-lieu-discussion');
  await page.getByRole('button', { name: 'Lui parler' }).first().click();
  await capture(page, ecran, '4-dialogue');
  for (let k = 0; k < 300; k++) {
    const fin = page.getByRole('button', { name: 'Terminer la scène' });
    if (await fin.isVisible()) { await fin.click(); break; }
    const suivant = page.getByRole('button', { name: 'Continuer', exact: true });
    if (await suivant.isVisible()) { await suivant.click(); continue; }
    if (await page.locator('.suite').isVisible()) { await page.locator('.replique').click(); continue; }
    const reponse = page.locator('.reponse, .choix button:not([disabled])').first();
    if (await reponse.isVisible()) { await reponse.click(); continue; }
    await page.waitForTimeout(100);
  }
  // retour à la carte par le bouton de la barre, puis le plan de Lysmont et la Guilde
  await page.getByRole('button', { name: 'Carte', exact: true }).click();
  await page.locator('[data-ville="lysmont"]').click();
  await capture(page, ecran, '5-plan');
  await page.locator('[data-lieu="guilde"]').click();
  await capture(page, ecran, '6-guilde');
  // tiroir « Personnage » par le menu
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await capture(page, ecran, '7-menu');
  await page.getByRole('menuitem', { name: /Personnage/ }).click();
  await capture(page, ecran, '8-tiroir');
  await page.keyboard.press('Escape');
  // combat importé
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichierCombat);
  await page.locator('section.combat canvas').waitFor({ timeout: 10000 });
  await page.waitForTimeout(2500);
  await capture(page, ecran, '9-combat');
  console.log(`✔ ${ecran}`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`Captures enregistrées dans ${dossier} ; aucune page ne défile.`);
