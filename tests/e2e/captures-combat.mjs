/**
 * Test 3, point 3 : captures du combat lisible (ordinateur 1366 × 768, téléphone 360 × 740 et 740 × 360),
 * dans rapports/captures-test-3/. Vérifie aussi que la barre d'actions ne dépasse pas 30 % de la hauteur
 * et que la scène Phaser s'arrête au-dessus d'elle (les combattants ne sont jamais cachés).
 *
 * Usage : `npx tsx tests/e2e/captures-combat.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
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
const dossier = resolve('rapports/captures-test-3');
mkdirSync(dossier, { recursive: true });
const c = contenuDisque();
const depart = nouvellePartie(c, 'combat3', 'Combat lisible', 'combat3');
let etat = depart; const actions = [];
const jouer = (a) => { etat = appliquer(c, etat, a); actions.push(a); };
jouer({ type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
jouer({ type: 'creer_heros', joueur: 'j1', heros: { nom: 'Kaya Lune-Croc', classe: 'arcaniste', race: 'vulpin', don: 'oeil-du-seuil', origine: 'invoque', age: 24 } });
jouer({ type: 'contrat', joueur: 'j1', contrat: 'c-gobelins' });
for (let k = 0; k < 10 && !etat.combats.h1; k++) { const x = etapeContrat(c, etat, 'h1'); jouer({ type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined }); }
const fichier = join(tmpdir(), 'velmaris-combat-test3.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, actions, new Date().toISOString())));

const erreurs = [];
const navigateur = await chromium.launch();
for (const [nom, viewport, dpr] of [['ordinateur', { width: 1366, height: 768 }, 1], ['telephone-portrait', { width: 360, height: 740 }, 2], ['telephone-paysage', { width: 740, height: 360 }, 2]]) {
  const page = await navigateur.newPage({ viewport, deviceScaleFactor: dpr });
  page.on('pageerror', (e) => erreurs.push(`${nom} › ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator('section.combat canvas').waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: /Attaque/ }).first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const barre = document.querySelector('.panneau-bas').getBoundingClientRect();
    const arene = document.querySelector('.arene').getBoundingClientRect();
    return { barre: barre.height / innerHeight, chevauche: arene.bottom > barre.top + 1 };
  });
  if (m.barre > 0.31) erreurs.push(`${nom} : la barre d'actions prend ${Math.round(m.barre * 100)} % de la hauteur`);
  if (m.chevauche) erreurs.push(`${nom} : la scène passe sous la barre d'actions`);
  await page.screenshot({ path: join(dossier, `combat-apres-${nom}.png`) });
  await page.getByRole('button', { name: /Proposer/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(dossier, `combat-apres-${nom}-proposer.png`) });
  console.log(`✔ ${nom} (barre : ${Math.round(m.barre * 100)} %)`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
