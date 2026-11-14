/**
 * Test de bout en bout (navigateur réel) : `node tests/e2e/parcours.mjs [url] [dossier-captures]`
 * Prérequis : `npm run build && npm run preview` (port 4173).
 * Parcours : partie locale → 2 joueurs sur le même appareil → création d'un invoqué et d'un réincarné →
 * prologue → scène de l'Appel → examen de la Guilde (combat) → rechargement de la page → reprise.
 */
import { createRequire } from 'node:module';
// Playwright est installé globalement dans l'environnement de test (require le trouve partout)
const { chromium } = createRequire(import.meta.url)('playwright');
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:4173/';
const dossier = process.argv[3] ?? 'test-results/captures';
mkdirSync(dossier, { recursive: true });
const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 1280, height: 800 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
let n = 0;
const capture = async (nom) => page.screenshot({ path: `${dossier}/${String(++n).padStart(2, '0')}-${nom}.png` });
const etape = (t) => console.log(`✔ ${t}`);
/** Écran plein écran : les panneaux s'ouvrent par le menu ☰, comme des tiroirs. */
async function ouvrirTiroir(nom) {
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: new RegExp(nom) }).click();
}
/** Retour à la carte (bouton de la barre du haut, présent seulement depuis un lieu ou un plan de ville). */
async function allerCarte() {
  const bouton = page.getByRole('button', { name: 'Carte', exact: true });
  if (await bouton.isVisible()) await bouton.click();
  await page.locator('[data-lieu], [data-ville]').first().waitFor();
}
/** La page ne doit jamais défiler. */
async function pasDeDefilement(vue) {
  const r = await page.evaluate(() => ({ h: document.scrollingElement.scrollHeight, w: document.scrollingElement.scrollWidth, vh: innerHeight, vw: innerWidth }));
  if (r.h > r.vh + 1 || r.w > r.vw + 1) erreurs.push(`${vue} : la page défile (${r.w}×${r.h} pour ${r.vw}×${r.vh})`);
}

await page.goto(url);
await page.getByRole('heading', { name: 'Les Appelés de Velmaris' }).waitFor();
await capture('accueil');
await page.getByLabel('Nom de la nouvelle partie locale').fill('Test E2E');
await page.getByRole('button', { name: 'Créer' }).first().click();
etape('partie locale créée');

// Joueur 1 : invoqué
await page.getByLabel('Pseudo').fill('Alpha');
await page.getByRole('button', { name: 'Rejoindre la partie' }).click();
await page.getByPlaceholder('ex. Kael').fill('Kael');
await page.getByRole('button', { name: /Lame runique/ }).click();
await page.getByRole('button', { name: /^Œil du Seuil/ }).click();
await capture('creation');
await page.getByRole('button', { name: 'Créer mon héros' }).click();
await page.locator('[data-lieu="temple-du-seuil"]').waitFor(); // la carte est la scène elle-même
etape('héros 1 créé (invoqué)');

// Joueur 2 sur le même appareil : réincarné
await ouvrirTiroir('Partie');
await page.getByRole('button', { name: /Ajouter un joueur sur cet appareil/ }).click();
await page.getByLabel('Pseudo').fill('Bravo');
await page.getByRole('button', { name: 'Rejoindre la partie' }).click();
await page.getByPlaceholder('ex. Kael').fill('Ilo');
await page.getByLabel(/Réincarné/).check();
await page.getByRole('button', { name: /^Elfe/ }).click();
await page.getByRole('button', { name: /Guérisseur/ }).click();
await page.getByRole('button', { name: /^Aura de l'Élu/ }).click();
await page.getByRole('button', { name: 'Créer mon héros' }).click();
await ouvrirTiroir('Histoire');
etape('héros 2 créé (réincarné)');

// Prologue de Bravo
for (let s = 0; s < 4; s++) {
  await page.getByRole('button', { name: 'Jouer' }).first().click();
  for (let k = 0; k < 20; k++) {
    if (await page.getByRole('button', { name: 'Terminer la scène' }).isVisible()) break;
    // un personnage interroge un joueur : on choisit la première réponse proposée
    const reponse = page.locator('button.reponse').first();
    if (await reponse.isVisible()) { await reponse.click(); continue; }
    const suite = page.getByText(/Cliquer pour continuer/);
    if (await suite.isVisible()) { await page.locator('.replique').click(); continue; }
    const choix = page.getByRole('button', { name: 'Choisir' }).first();
    if (await choix.isVisible()) { await choix.click(); continue; }
    const cont = page.getByRole('button', { name: 'Continuer', exact: true });
    if (await cont.isVisible()) { await cont.click(); continue; }
    await page.waitForTimeout(100);
  }
  if (s === 0) await capture('prologue');
  await page.getByRole('button', { name: 'Terminer la scène' }).click();
  await ouvrirTiroir('Histoire');
}
await page.keyboard.press('Escape'); // on referme le tiroir « Histoire »
etape('prologue joué (4 scènes)');

// Carte → Temple → L'Appel
await allerCarte();
await capture('carte');
await pasDeDefilement('carte');
await page.getByRole('button', { name: /Temple du Seuil/ }).click();
// on clique sur le Grand Prieur (silhouette sur le décor), puis on lui parle
await page.getByRole('button', { name: /Parler à Grand Prieur/ }).click();
await page.getByRole('button', { name: 'Lui parler' }).first().click();
async function jouerScene(captureNom) {
  for (let k = 0; k < 120; k++) {
    if (await page.getByRole('button', { name: 'Terminer la scène' }).isVisible()) break;
    // un personnage interroge un joueur : on choisit la première réponse proposée
    const reponse = page.locator('button.reponse').first();
    if (await reponse.isVisible()) { await reponse.click(); continue; }
    // pari partagé : chaque joueur local mise
    const mise = page.getByRole('button', { name: 'Je mise', exact: true });
    if (await mise.first().isVisible()) { await mise.first().click(); continue; }
    if (await page.getByRole('button', { name: /Au combat/ }).isVisible()) { await page.getByRole('button', { name: /Au combat/ }).click(); continue; }
    if (await page.locator('.combat').isVisible()) { await combattre(captureNom); continue; }
    const suite = page.getByText(/Cliquer pour continuer/);
    if (await suite.isVisible()) { await page.locator('.replique').click(); continue; }
    const votes = page.getByRole('button', { name: /Vote de/ });
    if (await votes.first().isVisible()) {
      const nb = await votes.count();
      // chaque joueur local vote pour le premier choix
      await votes.nth(0).click();
      if (nb > 1) await page.getByRole('button', { name: /Vote de/ }).nth(1).click();
      continue;
    }
    const cont = page.getByRole('button', { name: 'Continuer', exact: true });
    if (await cont.isVisible()) { await cont.click(); continue; }
    await page.waitForTimeout(100);
  }
}
let captureCombat = false;
let libreTeste = false;
async function combattre(nom) {
  for (let k = 0; k < 200; k++) {
    if (await page.getByRole('button', { name: 'Continuer', exact: true }).isVisible() && await page.getByText(/Victoire|Défaite|Fuite/).first().isVisible()) {
      await capture(`${nom}-fin`);
      await page.getByRole('button', { name: 'Continuer', exact: true }).click();
      return;
    }
    const proposer = page.getByRole('button', { name: /Proposer mon action/ });
    if (await proposer.isVisible()) {
      if (!libreTeste) {
        // un tour en écrivant librement : l'IA maison comprend et le moteur vérifie
        libreTeste = true;
        await proposer.click();
        await page.getByLabel('Votre action, en toutes lettres').fill('je vise la tete du golem');
        await page.getByRole('button', { name: 'Proposer', exact: true }).click();
        await page.locator('.reponse').waitFor();
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${dossier}/${String(++n).padStart(2, '0')}-${nom}-action-libre.png`, fullPage: true });
        const valider = page.getByRole('button', { name: 'Valider' });
        if (await valider.isVisible()) await valider.click();
        else await page.locator('.reponse .carte-prop button').first().click();
        await page.getByRole('button', { name: /Suivre le script/ }).click();
        continue;
      }
      // sinon : on suit le script (le mode est mémorisé par héros : on y revient si besoin)
      if (await page.getByLabel('Votre action, en toutes lettres').isVisible()) { await page.getByRole('button', { name: /Suivre le script/ }).click(); continue; }
      const jouer = page.locator('.propositions .carte-prop button').first();
      if (await jouer.isVisible()) {
        await jouer.click();
        if (!captureCombat) { await page.waitForTimeout(600); await capture(`${nom}`); captureCombat = true; }
        continue;
      }
    }
    await page.waitForTimeout(100);
  }
}
await capture('appel');
await jouerScene('appel');
await page.getByRole('button', { name: 'Terminer la scène' }).click();
etape('scène de l\'Appel jouée (votes des 2 joueurs)');

await allerCarte();
// un seul point « Ville de Lysmont » sur la carte, puis le plan de la ville
await page.getByRole('button', { name: /Ville de Lysmont/ }).click();
await capture('plan-lysmont');
await page.getByRole('button', { name: /Guilde de la Rose des Vents/ }).click();
await capture('guilde');
await pasDeDefilement('guilde');
await page.getByRole('button', { name: /Dame Rowena/ }).first().click();
await page.getByRole('button', { name: 'Lui parler' }).first().click();
await jouerScene('examen-combat');
await page.getByRole('button', { name: 'Terminer la scène' }).click();
etape('examen de la Guilde avec combat');

// Les mois ne passent qu'à l'auberge : on clique sur le lit, on propose 6 mois, l'autre joueur accepte
await allerCarte();
await page.getByRole('button', { name: /Ville de Lysmont/ }).click();
await page.getByRole('button', { name: /Le Chaudron Fêlé/ }).click();
// le lit est dans la chambre, à l'étage (escalier ou porte de la chambre)
await page.getByRole('button', { name: /Monter à la chambre/ }).first().click();
await page.getByRole('button', { name: /Le lit/ }).click();
await page.getByRole('button', { name: '6 mois', exact: true }).click();
const accepter = page.getByRole('button', { name: /^Accepter/ }).first();
if (await accepter.isVisible()) await accepter.click();
etape('repos à l\'auberge accepté par tous');

await page.getByRole('heading', { name: /Temps libre/ }).waitFor();
await capture('temps-libre');
await pasDeDefilement('temps libre');
etape('temps libre affiché');

// Reprise après rechargement
await page.reload();
await page.getByRole('button', { name: 'Test E2E' }).first().click();
await page.getByRole('heading', { name: /Temps libre/ }).waitFor();
etape('reprise après rechargement : la partie continue où elle en était');

await navigateur.close();
if (erreurs.length) { console.log('Erreurs dans la console du navigateur :\n' + erreurs.join('\n')); process.exit(1); }
console.log('Parcours complet réussi.');
