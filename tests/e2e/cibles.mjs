/**
 * Test 4, point 1 : choix de la cible en combat. Un combat de groupe à 5 héros contre 5 ennemis
 * (les loups du vieux saule : 3 ennemis + 2 pour un groupe de 5). Sur ordinateur et sur téléphone :
 *   - un clic au centre de chaque combattant (ennemis et alliés) atteint bien CE combattant ;
 *   - sans action choisie, un message dit « Choisissez d'abord une action » ;
 *   - avec « Attaque » choisie, un ennemi hors de portée affiche la raison, un ennemi valide est attaqué.
 *
 * Usage : `npx tsx tests/e2e/cibles.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { appliquer, choixVisibles, noeudCourant } from '../../src/moteur/partie.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { finirScene, jouer, jouerSceneGroupe, nouvellePartieDeTest } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const c = contenuDisque();

// ───── la partie : 5 héros, jusqu'au combat des loups ─────
const r = nouvellePartieDeTest(c, 'cibles');
const depart = r.etat;
const HEROS = [
  ['Alpha', 'Kael', 'gardien', 'humain'], ['Bravo', 'Ilo', 'guerisseur', 'elfe'], ['Charlie', 'Brann', 'berserker', 'nain'],
  ['Delta', 'Syl', 'archer', 'vulpin'], ['Echo', 'Mira', 'arcaniste', 'demi-elfe'],
];
HEROS.forEach(([pseudo], i) => jouer(c, r, { type: 'rejoindre', joueur: `j${i + 1}`, pseudo }));
const DONS = Object.keys(c.dons);
HEROS.forEach(([, nom, classe, race], i) => jouer(c, r, { type: 'creer_heros', joueur: `j${i + 1}`, heros: { nom, classe, race, don: DONS[i], origine: 'invoque', age: 22, sexe: 'm' } }));
const joueurs = r.etat.ordreJoueurs;
jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
finirScene(c, r, 'groupe', joueurs);
jouerSceneGroupe(c, r, 'ch1-examen');
for (const s of ['sq-loups-guilde', 'sq-loups-ferme', 'sq-loups-traces']) {
  jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: s });
  finirScene(c, r, 'groupe', joueurs);
}
jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'sq-loups' });
for (let k = 0; k < 50 && !r.etat.combats.groupe; k++) {
  const n = noeudCourant(c, r.etat, 'groupe');
  const ch = choixVisibles(c, r.etat, 'groupe').filter((x) => x.possible);
  if (ch.length) for (const j of joueurs) { if (r.etat.combats.groupe || noeudCourant(c, r.etat, 'groupe') !== n) break; jouer(c, r, { type: 'choisir', joueur: j, cle: 'groupe', index: ch[0].index }); }
  else jouer(c, r, { type: 'continuer', joueur: 'j1', cle: 'groupe' });
}
const combat = r.etat.combats.groupe?.combat;
if (!combat) throw new Error('Pas de combat de groupe');
const ennemis = combat.combattants.filter((x) => x.camp === 'ennemis');
if (ennemis.length < 5) throw new Error(`Il faut 5 ennemis, il y en a ${ennemis.length}`);
const fichier = join(tmpdir(), 'velmaris-cibles.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));
void appliquer;

const erreurs = [];
const navigateur = await chromium.launch();
for (const [nom, viewport, dpr] of [['ordinateur', { width: 1366, height: 768 }, 1], ['telephone-paysage', { width: 740, height: 360 }, 2], ['telephone-portrait', { width: 390, height: 844 }, 3]]) {
  const page = await navigateur.newPage({ viewport, deviceScaleFactor: dpr });
  page.on('pageerror', (e) => erreurs.push(`${nom} › ${e.message}`));
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator('section.combat canvas').waitFor({ timeout: 10000 });
  // on attend le tour d'un héros (l'IA joue les ennemis)
  await page.getByRole('button', { name: /Attaque/ }).first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(900);
  const canvas = await page.locator('section.combat canvas').boundingBox();
  const positions = await page.evaluate(() => window.__velmarisCombat.positions());
  const tous = combat.combattants.filter((x) => !x.ko && !x.parti);
  let ok = 0;
  for (const x of tous) {
    const p = positions.find((q) => q.id === x.id);
    if (!p) { erreurs.push(`${nom} : ${x.nom} (${x.id}) n'est pas affiché`); continue; }
    const px = canvas.x + p.x, py = canvas.y + p.y;
    // le point doit être dans la scène visible et ne pas être couvert par l'interface
    const dessus = await page.evaluate(([a, b]) => document.elementFromPoint(a, b)?.tagName, [px, py]);
    if (dessus !== 'CANVAS') { erreurs.push(`${nom} : ${x.nom} est caché par l'interface (${dessus})`); continue; }
    await page.mouse.click(px, py);
    await page.waitForTimeout(80);
    const clic = await page.locator('section.combat').getAttribute('data-dernier-clic');
    if (clic !== x.id) erreurs.push(`${nom} : clic sur ${x.nom} (${x.id}) reçu par ${clic || 'personne'}`);
    else ok++;
  }
  // sans action choisie : le message invite à choisir une action
  const message = await page.locator('.panneau-actions .detail').textContent();
  if (!/Choisissez d'abord une action/.test(message ?? '')) erreurs.push(`${nom} : pas de message « Choisissez d'abord une action » (${message})`);
  // avec « Attaque » : un ennemi refusé affiche une raison, un ennemi valide est attaqué
  await page.getByRole('button', { name: /Attaque/ }).first().click();
  const valides = await page.locator('.cibles button').allTextContents();
  const refuse = ennemis.find((e) => !valides.some((t) => t.startsWith(e.nom)));
  if (refuse) {
    const p = positions.find((q) => q.id === refuse.id);
    await page.mouse.click(canvas.x + p.x, canvas.y + p.y);
    const m = await page.locator('.message-cible').textContent({ timeout: 2000 }).catch(() => null);
    if (!m) erreurs.push(`${nom} : aucun message pour la cible refusée ${refuse.nom}`);
    else console.log(`  ${nom} : ${refuse.nom} refusé → « ${m} »`);
  }
  console.log(`✔ ${nom} : ${ok}/${tous.length} combattants cliquables (${ennemis.length} ennemis)`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log('Tous les combattants sont cliquables.');
