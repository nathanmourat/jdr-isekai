/**
 * Test 4, point 9 : animation du lancer de dé sur une étape de contrat avec un test de caractéristique.
 * Vérifie : le dé roule, puis le dé, le bonus, le total contre la difficulté, puis « Réussi » ou « Échoué » ;
 * un clic ferme ; captures dans rapports/captures-test-4/.
 *
 * Usage : `npx tsx tests/e2e/des.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { etapeContrat } from '../../src/moteur/partie.ts';
import { trouverLieu } from '../../src/moteur/guide.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { jouer, nouvellePartieDeTest } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const dossier = resolve('rapports/captures-test-4');
mkdirSync(dossier, { recursive: true });
const c = contenuDisque();

// partie : un contrat accepté, joué jusqu'à l'étape qui demande un test
const ct = Object.values(c.contrats).find((x) => x.rang_min === 'F' && !x.examen_rang && !x.disponible_si && x.etapes.some((e) => e.test));
const r = nouvellePartieDeTest(c, 'des');
const depart = r.etat;
jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Daleko', classe: 'barde', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } });
jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: ct.id });
for (let k = 0; k < 10; k++) {
  const x = etapeContrat(c, r.etat, 'h1');
  if (!x || x.etape.test || x.etape.combat) break;
  jouer(c, r, { type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined });
}
const etape = etapeContrat(c, r.etat, 'h1');
if (!etape?.etape.test) throw new Error(`Pas d'étape de test atteinte dans ${ct.id}`);
const lieu = trouverLieu(c, etape.etape.lieu);
const fichier = join(tmpdir(), 'velmaris-des.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));

const erreurs = [];
const navigateur = await chromium.launch();
for (const [nom, viewport, dpr] of [['ordinateur', { width: 1366, height: 768 }, 1], ['telephone', { width: 390, height: 844 }, 3]]) {
  const page = await navigateur.newPage({ viewport, deviceScaleFactor: dpr });
  page.on('pageerror', (e) => erreurs.push(`${nom} › ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  if (lieu?.lieu.ville) await page.locator(`[data-ville="${lieu.lieu.ville}"]`).click();
  await page.locator(`[data-lieu="${etape.etape.lieu}"]`).click();
  const bouton = page.getByRole('button', { name: new RegExp(`\\(${etape.etape.test.carac}, difficulté`) });
  if (!(await bouton.isVisible())) await page.getByRole('button', { name: /Détails/ }).click();
  await bouton.click();
  const lancer = page.locator('.lancer');
  await lancer.waitFor({ timeout: 3000 });
  await page.waitForTimeout(300);
  if (await page.locator('.lancer .de.roule').count() === 0) erreurs.push(`${nom} : le dé ne roule pas`);
  await page.screenshot({ path: join(dossier, `de-roule-${nom}.png`) });
  await page.locator('.lancer .verdict.montre').waitFor({ timeout: 5000 });
  const texte = await lancer.innerText();
  if (!/Dé \d+/.test(texte) || !/contre \d+/.test(texte) || !/(Réussi|Échoué)/.test(texte)) erreurs.push(`${nom} : résultat incomplet : ${texte}`);
  await page.screenshot({ path: join(dossier, `de-resultat-${nom}.png`) });
  await lancer.click();
  await page.waitForTimeout(300);
  if (await lancer.count()) erreurs.push(`${nom} : le lancer ne se ferme pas au clic`);
  console.log(`✔ ${nom} : ${texte.split('\n').filter(Boolean).join(' · ')}`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`Lancer de dé : OK (captures dans ${dossier}).`);
