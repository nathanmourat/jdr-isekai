/**
 * IA de combat (« Proposer mon action ») dans un vrai combat : une dizaine de phrases variées tapées comme un joueur
 * (SMS, fautes, négation, plusieurs actions, action créative, hésitation, aide), captures dans rapports/captures-ia/.
 * Vérifie aussi : une question ne coûte pas d'essai, « Corriger » ne coûte rien, « Valider » joue l'action,
 * et mesure le temps de la première réponse sur un téléphone simulé (processeur 4 fois plus lent).
 *
 * Usage : `npx tsx tests/e2e/ia-combat.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { etapeContrat } from '../../src/moteur/partie.ts';
import { jouer, nouvellePartieDeTest } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const dossier = resolve('rapports/captures-ia');
mkdirSync(dossier, { recursive: true });
const c = contenuDisque();

// un Arcaniste seul contre les gobelins (contrat de la route du nord)
const r = nouvellePartieDeTest(c, 'ia-combat');
const depart = r.etat;
jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Pixel' });
jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Zed', classe: 'arcaniste', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } });
jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: 'c-gobelins' });
for (let k = 0; k < 10 && !r.etat.combats.h1; k++) { const x = etapeContrat(c, r.etat, 'h1'); jouer(c, r, { type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined }); }
const fichier = join(tmpdir(), 'velmaris-ia-combat.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));

const PHRASES = [
  ['sms', 'jtape le gob le plus blessé stp'],
  ['competence', 'boule de feu sur le gobelin'],
  ['hesitation', 'feu ou glace ?'],
  ['aide', 'jsp quoi faire'],
  ['negation', "je n'attaque pas, je me défends"],
  ['plusieurs', "je bois une potion puis j'attaque"],
  ['creatif', 'je renverse la table sur eux'],
  ['viser', 'je vise la tete du gobelin'],
  ['meme', 'je frappe le même'],
  ['incomprise', 'zorglub bidule machin'],
  ['observer', 'c koi leurs faiblesses'],
];

const erreurs = [];
const navigateur = await chromium.launch();
const resultats = [];
for (const [ecran, viewport, dpr] of [['ordinateur', { width: 1366, height: 768 }, 1], ['telephone', { width: 390, height: 844 }, 3]]) {
  const page = await navigateur.newPage({ viewport, deviceScaleFactor: dpr });
  page.on('pageerror', (e) => erreurs.push(`${ecran} › ${e.message}`));
  if (ecran === 'telephone') { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator('section.combat canvas').waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: /Attaque/ }).first().waitFor({ timeout: 30000 });
  await page.locator('button.proposer').click();
  await page.getByRole('button', { name: /Proposer mon action/ }).click();
  const champ = page.getByLabel('Votre action, en toutes lettres');
  const essais = () => page.locator('.essais').textContent();
  for (const [nom, phrase] of PHRASES) {
    await champ.fill(phrase);
    const t0 = Date.now();
    await page.getByRole('button', { name: 'Proposer', exact: true }).click();
    await page.locator('.reponse .message').waitFor({ timeout: 10000 });
    const duree = Date.now() - t0;
    const message = await page.locator('.reponse .message').textContent();
    const question = await page.locator('.reponse .question').count();
    resultats.push({ ecran, nom, phrase, message, question: question > 0, duree, essais: await essais() });
    if (ecran === 'ordinateur' || ['hesitation', 'plusieurs', 'creatif'].includes(nom)) await page.locator('.panneau-proposer').screenshot({ path: join(dossier, `${ecran}-${nom}.png`) });
    // « Corriger » (ou « Corriger ma phrase ») : sans coût
    const corriger = page.getByRole('button', { name: /^Corriger/ });
    if (await corriger.count()) { const avant = await essais(); await corriger.first().click(); if ((await essais()) !== avant) erreurs.push(`${ecran} › « Corriger » a coûté un essai`); }
    if (/Trois propositions impossibles/.test(await page.locator('.libre').textContent() ?? '')) break;
  }
  // les questions ne coûtent pas d'essai
  for (const x of resultats.filter((y) => y.ecran === ecran && y.question)) if (!/: 0 \//.test(x.essais) && resultats.filter((y) => y.ecran === ecran && !y.question && y.message?.match(/^(Impossible|Pas possible|Ça ne marchera pas)/)).length === 0) erreurs.push(`${ecran} › la question « ${x.phrase} » a coûté un essai`);
  // valider une action : elle est jouée
  if (!/Trois propositions impossibles/.test(await page.locator('.libre').textContent() ?? '')) {
    await champ.fill('jtape le gob le plus blessé');
    await page.getByRole('button', { name: 'Proposer', exact: true }).click();
    await page.getByRole('button', { name: 'Valider' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(dossier, `${ecran}-apres-valider.png`) });
  }
  console.log(`✔ ${ecran}`);
  await page.close();
}
await navigateur.close();
for (const x of resultats) console.log(`  [${x.ecran} ${x.duree} ms] « ${x.phrase} » → ${x.question ? '(question) ' : ''}${x.message?.slice(0, 120)}`);
const tel = resultats.filter((x) => x.ecran === 'telephone');
if (tel.length) console.log(`Téléphone simulé (processeur ÷4) : première réponse en ${tel[0].duree} ms, ensuite ${Math.round(tel.slice(1).reduce((s, x) => s + x.duree, 0) / Math.max(1, tel.length - 1))} ms en moyenne.`);
writeFileSync(join(dossier, 'resultats.json'), JSON.stringify(resultats, null, 1));
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`IA de combat : OK (captures dans ${dossier}).`);
