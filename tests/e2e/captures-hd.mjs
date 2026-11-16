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
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
function sauvegardeCombat(classe, race, contrat, sexe = 'm') {
  const depart = nouvellePartie(c, `hd-${classe}`, `Captures HD — ${c.classes[classe].nom}`, `hd-${classe}`);
  let etat = depart;
  const actions = [];
  const jouer = (a) => { etat = appliquer(c, etat, a); actions.push(a); };
  jouer({ type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
  jouer({ type: 'creer_heros', joueur: 'j1', heros: { nom: c.classes[classe].nom, classe, race, don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe } });
  jouer({ type: 'contrat', joueur: 'j1', contrat });
  for (let k = 0; k < 10 && !etat.combats.h1; k++) {
    const x = etapeContrat(c, etat, 'h1');
    if (!x) throw new Error(`${classe} : le contrat s'est terminé sans combat`);
    jouer({ type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined });
  }
  if (!etat.combats.h1) throw new Error(`${classe} : aucun combat atteint`);
  const fichier = join(tmpdir(), `velmaris-captures-${classe}-${race}-${sexe}.json`); // sauvegarde temporaire, hors du dépôt
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

// ── Mise à jour 5, point 5 : le calque de race suit le corps image par image (10 classes, nain + une race par classe).
// Pour chaque classe : on fait jouer « attaque », « sort » et « touche », on vérifie à plusieurs instants que le calque
// montre la même case que le corps (et le même angle, la même position), puis on capture le milieu de l'attaque.
const dossierCalques = join(dossier, 'calques');
mkdirSync(dossierCalques, { recursive: true });
async function verifierCalques(nomCas) {
  for (const anim of ['attaque', 'sort', 'touche']) {
    await page.evaluate((a) => window.__velmarisCombat.animer(a), anim);
    for (const t of [60, 160, 260, 420]) {
      await page.waitForTimeout(t === 60 ? 60 : 100);
      const etats = await page.evaluate(() => window.__velmarisCombat.calques());
      if (!etats.length) erreurs.push(`${nomCas} : aucun calque de race affiché`);
      for (const e of etats) {
        if (e.corps !== e.calque) erreurs.push(`${nomCas} (${anim}, ${t} ms) : le calque montre la case ${e.calque}, le corps la case ${e.corps}`);
        if (e.angleCorps !== e.angleCalque || e.xCorps !== e.xCalque) erreurs.push(`${nomCas} (${anim}) : le calque ne bouge pas avec le corps`);
      }
    }
  }
  await page.evaluate(() => window.__velmarisCombat.animer('attaque'));
  await page.waitForTimeout(250); // milieu de l'attaque (6 images à 10 par seconde)
}
const AUTRES = ['elfe', 'ourvalis', 'vulpin', 'demi-demon', 'sang-dragon', 'demi-elfe', 'elfe', 'ourvalis', 'vulpin', 'demi-demon'];
for (const [i, classe] of Object.keys(c.classes).entries()) {
  for (const race of ['nain', AUTRES[i]]) {
    const fichier = sauvegardeCombat(classe, race, CONTRATS[i % CONTRATS.length]);
    await page.goto(url);
    await page.locator('input[type="file"]').setInputFiles(fichier);
    await page.locator('section.combat canvas').waitFor({ timeout: 10000 });
    await page.waitForTimeout(2500);
    await verifierCalques(`${classe} ${race}`);
    if (race === 'nain') await page.locator('section.combat canvas').screenshot({ path: join(dossierCalques, `nain-${classe}.png`) });
  }
  console.log(`✔ calques : ${classe} (nain, ${AUTRES[i]})`);
}

// ── Héroïne naine : calque à tresses (calque-combat-f.png) au lieu de la barbe, s'il est livré
if (existsSync('assets/personnages/races/nain/calque-combat-f.png')) {
  for (const [i, classe] of ['gardien', 'barde', 'archer'].entries()) {
    const fichier = sauvegardeCombat(classe, 'nain', CONTRATS[i], 'f');
    await page.goto(url);
    await page.locator('input[type="file"]').setInputFiles(fichier);
    await page.locator('section.combat canvas').waitFor({ timeout: 10000 });
    await page.waitForTimeout(2500);
    await verifierCalques(`${classe} naine`);
    await page.locator('section.combat canvas').screenshot({ path: join(dossierCalques, `naine-${classe}.png`) });
  }
  console.log('✔ calques : héroïne naine (tresses)');
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
// le bouton « Carte » n'apparaît plus quand on est déjà sur la carte : on attend le Temple
await page.locator('[data-lieu="temple-du-seuil"]').waitFor();
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
