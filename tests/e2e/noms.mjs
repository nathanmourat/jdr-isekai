/**
 * Un nom de personnage n'est jamais coupé ni remplacé par « … » (test 3, point 6 ; élargi à la mise à jour 5, point 2,
 * après « Kaya Lunecroc » affiché « aya Lunecroc »).
 *
 * Noms vérifiés : tous les noms longs des compagnes et des PNJ (13 caractères ou plus, « Kaya Lunecroc » compris).
 * Pour chaque nom, on vérifie que sa PREMIÈRE et sa DERNIÈRE lettre sont visibles : dans l'écran, et dans chaque cadre
 * qui rogne son contenu (overflow, clip-path), à gauche comme à droite. L'ancien test ne regardait que le débordement
 * à droite de l'élément lui-même : un nom centré plus large que son cadre, rogné des deux côtés, lui échappait.
 * Les noms dessinés dans le combat (canvas Phaser) sont vérifiés aussi : étiquette entière et dans le canvas.
 *
 * Écrans : téléphone en portrait (360 × 740), téléphone en paysage (740 × 360), ordinateur (1280 × 720).
 * Endroits :
 *  A. six héros portent ces noms (par lots de six) : dialogue de groupe (« Kael, Kaya… »), combat (étiquettes, barre
 *     d'actions, liste des combattants, journal), barre du haut, fiche rapide, fiche « Personnage » ;
 *  B. partie du robot au chapitre 2 (Aveline, Séraphine, Kaya, Nadja rencontrées) : tiroir « Compagnons »,
 *     étiquettes et bulles des personnages dans les lieux, dialogues.
 *
 * Usage : `npx tsx tests/e2e/noms.mjs [url]` (par défaut http://localhost:4173/)
 * Prérequis : `npm run build` + `npx vite preview --port 4173`, Playwright installé.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { choixVisibles, noeudCourant, nouvellePartie } from '../../src/moteur/partie.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { dormirHistoire, finirTempsLibre, groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const c = contenuDisque();
const NOMS = [...new Set([...Object.values(c.compagnons), ...Object.values(c.pnj)].map((x) => x.nom).filter((n) => n && n.length >= 13))]
  .sort((a, b) => b.length - a.length);
if (!NOMS.includes('Kaya Lunecroc')) throw new Error('« Kaya Lunecroc » devrait faire partie des noms vérifiés');
console.log(`${NOMS.length} noms longs vérifiés (du plus long, « ${NOMS[0]} », à « ${NOMS.at(-1)} »)`);

const CLASSES = ['ombre', 'gardien', 'barde', 'archer', 'arcaniste', 'berserker'];
const RACES = ['ourvalis', 'nain', 'elfe', 'vulpin', 'humain', 'demi-demon'];
const DONS = ['oeil-du-seuil', 'reserve-du-neant', 'langue-universelle', 'second-depart', 'benediction-de-fortune', 'mimetisme'];

/** A : six héros portant ces noms, en plein combat de groupe (après le dialogue d'une scène de groupe). */
function sauvegardeLot(noms, i) {
  const depart = nouvellePartie(c, `noms-${i}`, `Noms longs ${i}`, `noms-${i}`);
  const r = { etat: depart, actions: [] };
  noms.forEach((nom, k) => {
    jouer(c, r, { type: 'rejoindre', joueur: `j${k}`, pseudo: `Joueur ${k + 1}` });
    jouer(c, r, { type: 'creer_heros', joueur: `j${k}`, heros: { nom, classe: CLASSES[k], race: RACES[k], don: DONS[k], origine: 'invoque', age: 24, sexe: k % 2 ? 'f' : 'm' } });
  });
  jouerSceneGroupe(c, r, 'ch1-appel');
  jouerSceneGroupe(c, r, 'ch1-examen');
  const fichierDialogue = join(tmpdir(), `velmaris-noms-dialogue-${i}.json`);
  // quête des loups : on joue ses scènes une à une (votes au premier choix) jusqu'au premier combat de groupe
  const etapes = c.quetes['q-loups'].etapes.map((e) => e.scene).filter(Boolean);
  for (const scene of etapes) {
    if (r.etat.combats.groupe) break;
    for (const cle of Object.keys(r.etat.scenes)) if (r.etat.scenes[cle].noeud === '__fin__') jouer(c, r, { type: 'quitter_scene', joueur: 'j0', cle });
    jouer(c, r, { type: 'lancer_scene', joueur: 'j0', scene });
    if (scene === etapes[0]) writeFileSync(fichierDialogue, JSON.stringify(creerSauvegarde(depart, r.actions.slice(), new Date().toISOString())));
    for (let garde = 0; garde < 200 && !r.etat.combats.groupe; garde++) {
      const n = noeudCourant(c, r.etat, 'groupe');
      if (!n) break;
      const ch = choixVisibles(c, r.etat, 'groupe').filter((x) => x.possible);
      if (ch.length) { for (const j of r.etat.ordreJoueurs) if (noeudCourant(c, r.etat, 'groupe') === n) jouer(c, r, { type: 'choisir', joueur: j, cle: 'groupe', index: ch[0].index }); }
      else jouer(c, r, { type: 'continuer', joueur: 'j0', cle: 'groupe' });
    }
  }
  if (!r.etat.combats.groupe) throw new Error('quête des loups : aucun combat de groupe atteint');
  const fichierCombat = join(tmpdir(), `velmaris-noms-combat-${i}.json`);
  writeFileSync(fichierCombat, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));
  return { fichierDialogue, fichierCombat };
}

/** B : partie du robot au début du chapitre 2 (quatre compagnes rencontrées). */
function sauvegardeCompagnes() {
  const r = groupeDeDeux(c, 'noms-compagnes');
  const depart = nouvellePartie(c, 'p1', 'Partie de test', 'noms-compagnes');
  jouerPrologues(c, r);
  for (const s of ['ch1-appel', 'ch1-examen', 'sq-tournoi', 'sq-loups', 'ch1-crypte', 'sq-tanneurs', 'ch1-lanternes', 'ch1-serment']) jouerSceneGroupe(c, r, s);
  finirTempsLibre(c, r);
  jouer(c, r, { type: 'chapitre_suivant', joueur: 'j1' });
  dormirHistoire(c, r);
  for (const s of ['ch2-depart', 'ch2-caravane', 'sq-pillards-retour']) jouerSceneGroupe(c, r, s);
  for (const cle of Object.keys(r.etat.scenes)) jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle });
  const fichier = join(tmpdir(), 'velmaris-noms-compagnes.json');
  writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));
  return { fichier, compagnes: r.etat.compagnonsRencontres.map((id) => c.compagnons[id].nom) };
}

const erreurs = [];
/** Vérifie, dans la page, la première et la dernière lettre de chaque nom affiché. */
async function verifierDom(page, ou, noms) {
  const r = await page.evaluate((noms) => {
    const pb = [];
    const coupe = (rect, el) => {
      // à gauche ou à droite de l'écran (en hauteur, un nom plus bas qu'on fait défiler n'est pas coupé)
      if (rect.left < -0.5 || rect.right > innerWidth + 0.5) return `sort de l'écran (${Math.round(rect.left)} → ${Math.round(rect.right)} px sur ${innerWidth})`;
      for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
        const st = getComputedStyle(a);
        if (st.display === 'contents') continue;
        const rogne = st.overflowX !== 'visible' || st.overflowY !== 'visible' || st.clipPath !== 'none' || st.contain.includes('paint');
        if (!rogne) continue;
        const b = a.getBoundingClientRect();
        // un cadre qui défile (auto/scroll) ne rogne que ce qu'on peut faire défiler : on ne regarde que l'horizontal rogné
        const defile = /(auto|scroll)/.test(st.overflowX);
        if (!defile && (rect.left < b.left - 0.5 || rect.right > b.right + 0.5)) return `rogné par ${a.tagName.toLowerCase()}.${String(a.className).split(' ')[0]}`;
        if (defile && rect.left < b.left - 0.5 && a.scrollLeft === 0) return `rogné à gauche par ${a.tagName.toLowerCase()}.${String(a.className).split(' ')[0]} (impossible à faire défiler)`;
      }
      return null;
    };
    const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = marche.nextNode(); n; n = marche.nextNode()) {
      const el = n.parentElement;
      if (!el || !el.offsetParent || getComputedStyle(el).visibility === 'hidden') continue;
      // une étiquette invisible tant qu'on ne survole pas (opacité 0) compte quand même : elle doit tenir dans le cadre
      for (const nom of noms) {
        let i = n.data.indexOf(nom);
        while (i >= 0) {
          const st = getComputedStyle(el);
          if (st.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth) pb.push(`« ${nom} » (${el.tagName.toLowerCase()}.${el.className}) : points de suspension`);
          for (const [k, lettre] of [[i, 'première'], [i + nom.length - 1, 'dernière']]) {
            const rg = document.createRange();
            rg.setStart(n, k); rg.setEnd(n, k + 1);
            const rect = [...rg.getClientRects()][0];
            if (!rect || rect.width === 0) continue;
            const raison = coupe(rect, el);
            if (raison) pb.push(`« ${nom} » (${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}) : ${lettre} lettre ${raison}`);
          }
          i = n.data.indexOf(nom, i + 1);
        }
      }
    }
    return [...new Set(pb)];
  }, noms);
  for (const x of r) erreurs.push(`${ou} › ${x}`);
}

/** Étiquettes du combat (canvas) : texte entier et dans le canvas visible. */
async function verifierCanvas(page, ou, noms) {
  const etiquettes = await page.evaluate(() => window.__velmarisCombat?.etiquettes() ?? []);
  for (const nom of noms) {
    const e = etiquettes.find((x) => x.texte.replace(/\s+/g, ' ').includes(nom));
    if (!e) { erreurs.push(`${ou} › combat : « ${nom} » introuvable entier parmi les étiquettes (${etiquettes.map((x) => `« ${x.texte} »`).join(', ')})`); continue; }
    if (e.gauche < -0.5 || e.droite > e.largeur + 0.5) erreurs.push(`${ou} › combat : l'étiquette de « ${nom} » sort du cadre (${Math.round(e.gauche)} → ${Math.round(e.droite)} sur ${Math.round(e.largeur)} px)`);
  }
}

async function charger(page, fichier, attendre) {
  await page.goto(url);
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator(attendre).first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);
}

const lots = [];
for (let i = 0; i < NOMS.length; i += 6) lots.push(NOMS.slice(i, i + 6));
// un lot incomplet est complété avec les premiers noms (six héros dans chaque combat)
const dernier = lots.at(-1);
for (let k = 0; dernier.length < 6; k++) dernier.push(NOMS[k]);
const sauvegardes = lots.map((noms, i) => ({ noms, ...sauvegardeLot(noms, i) }));
const compagnes = sauvegardeCompagnes();

const navigateur = await chromium.launch();
for (const [ecran, viewport] of [['360×740', { width: 360, height: 740 }], ['740×360', { width: 740, height: 360 }], ['1280×720', { width: 1280, height: 720 }]]) {
  const page = await navigateur.newPage({ viewport });
  page.on('pageerror', (e) => erreurs.push(`${ecran} › ${e.message}`));
  for (const [i, s] of sauvegardes.entries()) {
    // A1 : dialogue de groupe (le nom des six héros dans « qui parle »)
    await charger(page, s.fichierDialogue, '.boite');
    for (let k = 0; k < 6; k++) { await verifierDom(page, `${ecran} › lot ${i + 1} › dialogue`, s.noms); if (await page.locator('.suite').isVisible()) await page.locator('.replique').click(); else break; }
    // A2 : combat
    await charger(page, s.fichierCombat, 'section.combat canvas');
    await page.waitForTimeout(1500);
    await verifierDom(page, `${ecran} › lot ${i + 1} › combat`, s.noms);
    await verifierCanvas(page, `${ecran} › lot ${i + 1}`, s.noms);
    // A3 : fiche rapide et fiche « Personnage »
    await page.locator('.barre-heros').click().catch(() => undefined);
    await page.waitForTimeout(300);
    await verifierDom(page, `${ecran} › lot ${i + 1} › fiche rapide`, s.noms);
    await page.keyboard.press('Escape');
    await page.keyboard.press('p');
    await page.waitForTimeout(400);
    await verifierDom(page, `${ecran} › lot ${i + 1} › fiche`, s.noms);
  }
  // B : compagnes, lieux, bulles
  await charger(page, compagnes.fichier, '[data-lieu]');
  const noms = [...new Set([...NOMS, ...compagnes.compagnes])];
  const fenetre = page.getByRole('button', { name: 'une femme' });
  if (await fenetre.isVisible().catch(() => false)) await fenetre.click();
  await page.keyboard.press('o');
  await page.waitForTimeout(500);
  await verifierDom(page, `${ecran} › compagnons`, noms);
  await page.keyboard.press('Escape');
  const lieux = await page.locator('[data-lieu]').evaluateAll((els) => els.map((e) => e.getAttribute('data-lieu')));
  for (const lieu of lieux) {
    await page.locator(`[data-lieu="${lieu}"]`).dispatchEvent("click");
    await page.waitForTimeout(500);
    await verifierDom(page, `${ecran} › ${lieu}`, noms);
    for (const pnj of await page.locator('[data-pnj]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pnj')))) {
      await page.locator(`[data-pnj="${pnj}"]`).dispatchEvent("click");
      await page.waitForTimeout(300);
      await verifierDom(page, `${ecran} › ${lieu} › bulle de ${pnj}`, noms);
      await page.keyboard.press('Escape');
    }
    const retour = page.getByRole('button', { name: /Carte/ }).first();
    if (await retour.isVisible().catch(() => false)) await retour.click();
    await page.waitForTimeout(300);
  }
  console.log(`✔ ${ecran}`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log(`✘ Noms coupés (${erreurs.length}) :\n` + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log('Aucun nom coupé.');
