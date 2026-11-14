/**
 * Test 3, point 6 : un nom de personnage n'est jamais coupé ni remplacé par « … ».
 * Le héros porte le nom le plus long du contenu (compagnes, PNJ, ennemis) ; on vérifie, à 360 et à 1280 px de large,
 * qu'aucun élément qui contient ce nom ne déborde (scrollWidth > clientWidth) ni n'utilise de points de suspension :
 * barre du haut, fiche « Personnage », combat (liste des combattants).
 *
 * Usage : `npx tsx tests/e2e/noms.mjs [url]` (par défaut http://localhost:4173/)
 * Prérequis : `npm run build` + `npx vite preview --port 4173`, Playwright installé.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { appliquer, etapeContrat, nouvellePartie } from '../../src/moteur/partie.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const c = contenuDisque();
const noms = [...Object.values(c.compagnons), ...Object.values(c.pnj), ...Object.values(c.ennemis)].map((x) => x.nom).filter(Boolean);
const long = noms.sort((a, b) => b.length - a.length)[0];
console.log(`Nom le plus long du contenu : « ${long} » (${long.length} caractères)`);

// partie importée : le héros porte ce nom et se bat contre des gobelins (contrat)
const depart = nouvellePartie(c, 'noms', 'Noms longs', 'noms');
let etat = depart; const actions = [];
const jouer = (a) => { etat = appliquer(c, etat, a); actions.push(a); };
jouer({ type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
jouer({ type: 'creer_heros', joueur: 'j1', heros: { nom: long, classe: 'ombre', race: 'ourvalis', don: 'oeil-du-seuil', origine: 'invoque', age: 24 } });
const fichierCarte = join(tmpdir(), 'velmaris-noms-carte.json');
writeFileSync(fichierCarte, JSON.stringify(creerSauvegarde(depart, actions.slice(), new Date().toISOString())));
jouer({ type: 'contrat', joueur: 'j1', contrat: 'c-gobelins' });
for (let k = 0; k < 10 && !etat.combats.h1; k++) { const x = etapeContrat(c, etat, 'h1'); jouer({ type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined }); }
const fichierCombat = join(tmpdir(), 'velmaris-noms-combat.json');
writeFileSync(fichierCombat, JSON.stringify(creerSauvegarde(depart, actions, new Date().toISOString())));

const erreurs = [];
async function verifier(page, ou) {
  const r = await page.evaluate((nom) => {
    const pb = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!(el instanceof HTMLElement) || !el.offsetParent || !el.textContent?.includes(nom)) continue;
      // seulement les éléments au plus près du texte (pas les grands conteneurs qui défilent)
      if ([...el.children].some((x) => x.textContent?.includes(nom))) continue;
      const st = getComputedStyle(el);
      if (st.textOverflow === 'ellipsis') pb.push(`${el.tagName}.${el.className} : points de suspension`);
      if (el.scrollWidth > el.clientWidth + 1 && st.overflowX !== 'visible') pb.push(`${el.tagName}.${el.className} : déborde (${el.scrollWidth} > ${el.clientWidth})`);
      const b = el.getBoundingClientRect();
      if (b.right > innerWidth + 1 || b.left < -1) pb.push(`${el.tagName}.${el.className} : sort de l'écran`);
    }
    return pb;
  }, long);
  for (const x of r) erreurs.push(`${ou} › ${x}`);
}

const navigateur = await chromium.launch();
for (const [ecran, viewport] of [['360', { width: 360, height: 740 }], ['1280', { width: 1280, height: 720 }]]) {
  const page = await navigateur.newPage({ viewport });
  page.on('pageerror', (e) => erreurs.push(`${ecran} › ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichierCarte);
  await page.locator('[data-lieu="temple-du-seuil"]').waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  await verifier(page, `${ecran} › carte`);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: /Personnage/ }).click();
  await page.waitForTimeout(400);
  await verifier(page, `${ecran} › fiche`);
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichierCombat);
  await page.locator('section.combat canvas').waitFor({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await verifier(page, `${ecran} › combat`);
  console.log(`✔ ${ecran} px`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Noms coupés :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log('Aucun nom coupé.');
