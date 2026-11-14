/**
 * Captures d'écran des textures HD : un combat par classe (héros avec son calque de race, face à des monstres)
 * et la Guilde avec ses PNJ dans le décor.
 *
 * Usage : `npx tsx tests/e2e/captures-hd.mjs [url] [dossier]`
 *   url     : par défaut http://localhost:4173/ (`npm run build && npm run preview`)
 *   dossier : par défaut rapports/captures-hd
 * Prérequis : Playwright installé (`npm i -D playwright && npx playwright install chromium`).
 *
 * Pour chaque classe, le moteur prépare une partie (un héros, un contrat de chasse joué jusqu'au combat),
 * enregistrée comme une sauvegarde ; le navigateur l'importe par l'accueil, comme le ferait un joueur.
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
const dossier = resolve(process.argv[3] ?? 'rapports/captures-hd');
mkdirSync(dossier, { recursive: true });
const c = contenuDisque();
const erreurs = [];

/** Une race avec calque par classe, pour vérifier l'alignement calque / planche (l'humain n'a pas de calque). */
const RACES = ['elfe', 'nain', 'ourvalis', 'vulpin', 'demi-demon', 'sang-dragon', 'demi-elfe', 'elfe', 'nain', 'ourvalis'];
/** Contrats de rang F qui mènent à un combat : 2 ou 3 monstres différents selon la classe. */
const CONTRATS = ['c-loups', 'c-gobelins', 'c-egouts', 'c-sangliers'];

/** Sauvegarde d'une partie où un héros de cette classe est en plein combat de contrat. */
function sauvegardeCombat(classe, race, contrat) {
  const depart = nouvellePartie(c, `hd-${classe}`, `Captures HD — ${c.classes[classe].nom}`, `hd-${classe}`);
  let etat = depart;
  const actions = [];
  const jouer = (a) => { etat = appliquer(c, etat, a); actions.push(a); };
  jouer({ type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
  jouer({ type: 'creer_heros', joueur: 'j1', heros: { nom: c.classes[classe].nom, classe, race, don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } });
  jouer({ type: 'contrat', joueur: 'j1', contrat });
  for (let k = 0; k < 10 && !etat.combats.h1; k++) {
    const x = etapeContrat(c, etat, 'h1');
    if (!x) throw new Error(`${classe} : le contrat s'est terminé sans combat`);
    jouer({ type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined });
  }
  if (!etat.combats.h1) throw new Error(`${classe} : aucun combat atteint`);
  const fichier = join(tmpdir(), `velmaris-captures-${classe}.json`); // sauvegarde temporaire, hors du dépôt
  writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, actions, new Date().toISOString())));
  return fichier;
}

const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', (e) => erreurs.push(e.message));

// ── Un combat par classe
for (const [i, classe] of Object.keys(c.classes).entries()) {
  const race = RACES[i % RACES.length];
  const fichier = sauvegardeCombat(classe, race, CONTRATS[i % CONTRATS.length]);
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator('section.combat canvas').waitFor({ timeout: 10000 });
  await page.waitForTimeout(2500); // chargement des planches et entrée des combattants
  await page.locator('section.combat').screenshot({ path: join(dossier, `combat-${classe}-${race}.png`) });
  console.log(`✔ combat : ${classe} (${race})`);
}

// ── La Guilde avec ses PNJ dans le décor (après l'Appel, qui ouvre Lysmont)
await page.goto(url);
await page.getByLabel('Nom de la nouvelle partie locale').fill('Captures HD — Guilde');
await page.getByRole('button', { name: 'Créer' }).first().click();
await page.getByLabel('Pseudo').fill('Testeur');
await page.getByRole('button', { name: 'Rejoindre la partie' }).click();
await page.getByPlaceholder('ex. Kael').fill('Kael');
await page.getByRole('button', { name: /Lame runique/ }).click();
await page.getByRole('button', { name: /^Œil du Seuil/ }).click();
await page.getByRole('button', { name: 'Créer mon héros' }).click();
await page.getByRole('button', { name: 'Carte', exact: true }).waitFor();
await page.locator('[data-lieu="temple-du-seuil"]').click();
await page.waitForTimeout(800);
await page.locator('section.lieu').screenshot({ path: join(dossier, 'temple-du-seuil.png') });
await page.locator('[data-pnj="aureliath"]').click();
await page.getByRole('button', { name: 'Lui parler' }).click();
for (let k = 0; k < 300; k++) {
  const fin = page.getByRole('button', { name: 'Terminer la scène' });
  if (await fin.isVisible()) { await fin.click(); break; }
  if (await page.locator('.suite').isVisible()) { await page.locator('.replique').click(); continue; }
  const suivant = page.getByRole('button', { name: 'Continuer', exact: true });
  if (await suivant.isVisible()) { await suivant.click(); continue; }
  const reponse = page.locator('.reponse, .choix button:not([disabled])').first();
  if (await reponse.isVisible()) { await reponse.click(); continue; }
  await page.waitForTimeout(100);
}
await page.getByRole('button', { name: 'Carte', exact: true }).click();
await page.locator('[data-ville="lysmont"]').click();
await page.locator('[data-lieu="guilde"]').click();
await page.waitForTimeout(800);
await page.locator('section.lieu').screenshot({ path: join(dossier, 'guilde.png') });
console.log('✔ Guilde et Temple');

await navigateur.close();
if (erreurs.length) { console.log('Erreurs dans la page :\n' + erreurs.join('\n')); process.exit(1); }
console.log(`Captures enregistrées dans ${dossier}`);
