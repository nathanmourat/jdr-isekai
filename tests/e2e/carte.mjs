/**
 * Test navigateur : chaque lieu de la carte et du plan de Lysmont s'ouvre au PREMIER clic,
 * sur ordinateur et sur mobile. `node tests/e2e/carte.mjs [url]`
 * Prérequis : `npm run build && npm run preview` (port 4173) et Playwright installé.
 * Le test crée une partie locale, joue la scène de l'Appel (pour ouvrir Lysmont), puis clique une fois
 * au centre de chaque point et vérifie que le bon lieu (ou le plan de la ville) s'ouvre.
 */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const url = process.argv[2] ?? 'http://localhost:4173/';
const navigateur = await chromium.launch();
const erreurs = [];
const etape = (t) => console.log(`✔ ${t}`);

async function preparer(page) {
  await page.goto(url);
  await page.getByLabel('Nom de la nouvelle partie locale').fill('Test carte');
  await page.getByRole('button', { name: 'Créer' }).first().click();
  await page.getByLabel('Pseudo').fill('Alpha');
  await page.getByRole('button', { name: 'Rejoindre la partie' }).click();
  await page.getByPlaceholder('ex. Kael').fill('Kael');
  await page.getByRole('button', { name: /Lame runique/ }).click();
  await page.getByRole('button', { name: /^Œil du Seuil/ }).click();
  await page.getByRole('button', { name: 'Créer mon héros' }).click();
  await page.getByRole('button', { name: 'Carte', exact: true }).waitFor();
  // l'Appel : on clique sur le Grand Prieur dans le décor du Temple
  await page.locator('[data-lieu="temple-du-seuil"]').click();
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
}

/** Clique UNE fois au centre du point (clic réel : appui puis relâchement). */
async function unClic(page, selecteur) {
  // comme un joueur : on fait défiler la page jusqu'au point s'il est hors de l'écran
  await page.locator(selecteur).scrollIntoViewIfNeeded();
  const boite = await page.locator(selecteur).boundingBox();
  if (!boite) throw new Error(`${selecteur} introuvable`);
  if (boite.width < 44 || boite.height < 44) erreurs.push(`${selecteur} : zone cliquable de ${boite.width}×${boite.height} px (44×44 attendus)`);
  await page.mouse.click(boite.x + boite.width / 2, boite.y + boite.height / 2);
}

async function parcourir(page, nomEcran) {
  const nomLieu = (id) => page.evaluate((i) => document.querySelector(`[data-lieu="${i}"]`)?.getAttribute('aria-label'), id);
  const ids = (attribut) => page.locator(`.carte [data-${attribut}]`).evaluateAll((l, a) => l.map((b) => b.dataset[a]), attribut);
  // carte du monde : lieux hors ville
  for (const id of await ids('lieu')) {
    const attendu = await nomLieu(id);
    await unClic(page, `[data-lieu="${id}"]`);
    const titre = await page.locator('.lieu h2').textContent({ timeout: 2000 }).catch(() => null);
    if (titre !== attendu) erreurs.push(`${nomEcran} › carte › ${id} : « ${titre} » au lieu de « ${attendu} »`);
    await page.getByRole('button', { name: 'Carte', exact: true }).click();
  }
  // villes, puis chaque lieu du plan
  for (const v of await ids('ville')) {
    await unClic(page, `[data-ville="${v}"]`);
    await page.getByRole('button', { name: /Retour à la carte/ }).waitFor({ timeout: 2000 }).catch(() => erreurs.push(`${nomEcran} › la ville ${v} ne s'ouvre pas au premier clic`));
    for (const id of await ids('lieu')) {
      const attendu = await nomLieu(id);
      await unClic(page, `[data-lieu="${id}"]`);
      const titre = await page.locator('.lieu h2').textContent({ timeout: 2000 }).catch(() => null);
      if (titre !== attendu) erreurs.push(`${nomEcran} › plan › ${id} : « ${titre} » au lieu de « ${attendu} »`);
      // retour au plan ; si le lieu ne s'est pas ouvert, on est resté sur le plan (l'erreur est déjà notée)
      const retourPlan = page.getByRole('button', { name: /Plan de la ville/ });
      if (await retourPlan.isVisible()) await retourPlan.click();
    }
    await page.getByRole('button', { name: /Retour à la carte/ }).click();
  }
  etape(`${nomEcran} : chaque lieu testé avec un seul clic`);
}

for (const [nom, viewport] of [['ordinateur', { width: 1280, height: 800 }], ['mobile', { width: 375, height: 812 }]]) {
  const page = await navigateur.newPage({ viewport });
  page.on('pageerror', (e) => erreurs.push(`${nom} › ${e.message}`));
  await preparer(page);
  await parcourir(page, nom);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.error(`✘ ${erreurs.length} problème(s) :\n - ${erreurs.join('\n - ')}`); process.exit(1); }
console.log('✔ Carte : un seul clic suffit partout.');
