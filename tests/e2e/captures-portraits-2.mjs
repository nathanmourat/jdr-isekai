/**
 * Portraits animés de Kaya et d'Auréliath : captures d'un dialogue avec chacun, une expression calme et la colère,
 * sur ordinateur et sur téléphone, dans rapports/captures-portraits-2/ ; plus des gros plans du portrait à plusieurs
 * instants (respiration, cheveux, bouche qui parle, clignement) pour vérifier que rien ne se déforme.
 * Le robot joue la partie jusqu'à la scène voulue (chapitres 1, 2 et 4).
 *
 * Usage : `npx tsx tests/e2e/captures-portraits-2.mjs [url]`. Prérequis : `npm run build` + `npx vite preview --port 4173`.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';
import { dormirHistoire, dormirJusquaLHistoire, finirScene, finirTempsLibre, groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe } from '../robot.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const dossier = resolve('rapports/captures-portraits-2');
mkdirSync(dossier, { recursive: true });
const c = contenuDisque();

const CHAPITRES = {
  1: ['ch1-appel', 'ch1-examen', 'sq-tournoi', 'sq-loups', 'ch1-crypte', 'sq-tanneurs', 'ch1-lanternes', 'ch1-serment'],
  2: ['ch2-depart', 'ch2-caravane', 'sq-pillards-retour', 'ch2-palais', 'sq-chacals-retour', 'ch2-complot', 'ch2-bazar', 'sq-puits-retour', 'ch2-tempete', 'ch2-revolte'],
  3: ['ch3-domaines', 'ch3-lisiere', 'sq-follets-retour', 'ch3-reine', 'sq-domaine-milice', 'ch3-bibliotheque', 'ch3-nuitlongue', 'ch3-verdict'],
  4: ['ch4-depart', 'ch4-karak', 'sq-forge-retour', 'ch4-marches', 'ch4-port', 'sq-phare-retour', 'ch4-nid', 'ch4-deserteur', 'ch4-conseil'],
};
/** Sauvegarde d'une partie arrêtée au début de la scène `cible`. */
function sauvegarde(nom, cible) {
  const r = groupeDeDeux(c, `portraits-${nom}`);
  const depart = r.etat;
  jouerPrologues(c, r);
  for (const n of [1, 2, 3, 4]) {
    for (const s of CHAPITRES[n]) {
      if (s === cible) {
        dormirJusquaLHistoire(c, r, s);
        finirTempsLibre(c, r);
        if (s === 'ch1-appel') jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: s });
        else {
          // on joue d'abord les étapes de la quête qui précèdent (comme jouerSceneGroupe), puis on lance la scène
          const q = c.scenes[s].quete ? c.quetes[c.scenes[s].quete] : null;
          const etapes = q ? q.etapes.map((e) => e.scene).filter(Boolean) : [];
          for (const x of etapes.slice(0, etapes.indexOf(s))) {
            if (r.etat.scenes.groupe) break;
            try { jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: x }); finirScene(c, r, 'groupe', r.etat.ordreJoueurs); if (r.etat.scenes.groupe) jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' }); } catch { /* étape déjà faite */ }
          }
          jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: s });
        }
        const f = join(tmpdir(), `velmaris-portraits-${nom}.json`);
        writeFileSync(f, JSON.stringify(creerSauvegarde(depart, r.actions, new Date().toISOString())));
        return f;
      }
      jouerSceneGroupe(c, r, s === 'sq-chacals-retour' ? s : s);
    }
    finirTempsLibre(c, r);
    jouer(c, r, { type: 'chapitre_suivant', joueur: 'j1' });
    dormirHistoire(c, r);
  }
  throw new Error(`Scène introuvable : ${cible}`);
}

const CAS = [
  { nom: 'aureliath-calme', scene: 'ch1-appel', qui: 'Auréliath', texte: 'Bienvenue à Velmaris' },
  { nom: 'kaya-calme', scene: 'ch1-examen', qui: 'Kaya', texte: 'oreilles de loup' },
  { nom: 'kaya-colere', scene: 'ch2-palais', qui: 'Kaya', texte: 'serre les poings' },
  { nom: 'aureliath-colere', scene: 'ch4-conseil', qui: 'Auréliath', texte: 'chaque Appel nourrit' },
];
for (const cas of CAS) { cas.fichier = sauvegarde(cas.nom, cas.scene); console.log(`partie prête : ${cas.nom}`); }

const erreurs = [];
const navigateur = await chromium.launch();
for (const [ecran, viewport, dpr] of [['ordinateur', { width: 1366, height: 768 }, 1], ['telephone', { width: 390, height: 844 }, 3]]) {
  for (const cas of CAS) {
    const page = await navigateur.newPage({ viewport, deviceScaleFactor: dpr });
    page.on('pageerror', (e) => erreurs.push(`${ecran} › ${cas.nom} › ${e.message}`));
    await page.goto(url);
    await page.locator('input[type="file"]').setInputFiles(cas.fichier);
    await page.locator('.replique').waitFor({ timeout: 15000 });
    for (let k = 0; k < 20 && !((await page.locator('.replique .dit').textContent()) ?? '').includes(cas.texte); k++) {
      await page.locator('.replique').click();
      await page.waitForTimeout(120);
    }
    const qui = await page.locator('.replique .qui').textContent();
    if (!qui?.includes(cas.qui)) erreurs.push(`${ecran} › ${cas.nom} : réplique introuvable (${qui})`);
    if (!(await page.locator('.replique .cadre-portrait canvas').count())) erreurs.push(`${ecran} › ${cas.nom} : pas de portrait animé`);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(dossier, `${cas.nom}-${ecran}.png`) });
    if (ecran === 'ordinateur') {
      // gros plans : 8 instants (parole, respiration, cheveux, clignement)
      for (let i = 0; i < 8; i++) {
        await page.locator('.replique .cadre-portrait').screenshot({ path: join(dossier, `gros-plan-${cas.nom}-${i}.png`) });
        await page.waitForTimeout(350);
      }
    }
    console.log(`✔ ${ecran} : ${cas.nom}`);
    await page.close();
  }
}
await navigateur.close();
if (erreurs.length) { console.log('✘ Problèmes :\n' + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`Captures dans ${dossier}`);
