/**
 * Mise à jour 5, point 4 : placement des gros monstres et des boss (128 × 128) en combat.
 * Pour chaque rencontre qui contient un boss (golem de la fontaine compris), le combat est préparé par le moteur et
 * affiché dans le vrai écran de combat, puis on vérifie pour chaque combattant :
 *  - les pieds du dessin sont posés juste au-dessus de l'étiquette (nom + barres), sans vide ni chevauchement ;
 *  - les pieds sont sur la bande du sol (ligne des pieds : sol = H * 0.62, et un peu en dessous pour la 2e rangée) ;
 *  - le marqueur « à vous » est au-dessus de la tête du boss (pas au milieu de son corps).
 * Une capture par combat dans rapports/captures-boss/.
 *
 * Usage : `npx tsx tests/e2e/captures-boss.mjs [url]` (par défaut http://localhost:4173/)
 * Prérequis : `npm run build` + `npx vite preview --port 4173`, Playwright installé.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { contenuDisque } from '../../src/contenu/node.ts';
import { combattantHeros, demarrerCombat } from '../../src/moteur/combat.ts';
import { appliquer, etapeContrat, nouvellePartie } from '../../src/moteur/partie.ts';
import { creerRng } from '../../src/moteur/rng.ts';
import { creerSauvegarde } from '../../src/sauvegarde/migrations.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] ?? 'http://localhost:4173/';
const dossier = resolve('rapports/captures-boss');
mkdirSync(dossier, { recursive: true });
const c = contenuDisque();

// une partie à trois héros, dont l'un est en plein combat de contrat (pour ouvrir l'écran de combat)
const depart = nouvellePartie(c, 'boss', 'Boss', 'boss');
let etat = depart;
const actions = [];
const jouer = (a) => { etat = appliquer(c, etat, a); actions.push(a); };
const heros = [['Kael', 'gardien', 'nain'], ['Ilo', 'arcaniste', 'elfe'], ['Brune', 'archer', 'vulpin']];
heros.forEach(([nom, classe, race], k) => {
  jouer({ type: 'rejoindre', joueur: `j${k}`, pseudo: `Joueur ${k + 1}` });
  jouer({ type: 'creer_heros', joueur: `j${k}`, heros: { nom, classe, race, don: ['oeil-du-seuil', 'reserve-du-neant', 'mimetisme'][k], origine: 'invoque', age: 24, sexe: 'm' } });
});
jouer({ type: 'contrat', joueur: 'j0', contrat: 'c-loups' });
for (let k = 0; k < 10 && !etat.combats.h1; k++) {
  const x = etapeContrat(c, etat, 'h1');
  jouer({ type: 'etape_contrat', joueur: 'j0', choix: x?.etape.choix.length ? 0 : undefined });
}
const fichier = join(tmpdir(), 'velmaris-boss.json');
writeFileSync(fichier, JSON.stringify(creerSauvegarde(depart, actions, new Date().toISOString())));
const allies = Object.values(etat.heros).map((h) => combattantHeros(c, h, true, h.grimoire));

const rencontres = Object.values(c.rencontres).filter((r) => r.ennemis.some((e) => c.ennemis[e.id]?.boss));
console.log(`${rencontres.length} combats de boss`);

const erreurs = [];
const navigateur = await chromium.launch();
for (const [ecran, viewport] of [['ordinateur', { width: 1280, height: 720 }], ['telephone', { width: 740, height: 360 }]]) {
  const page = await navigateur.newPage({ viewport, deviceScaleFactor: ecran === 'telephone' ? 2 : 1 });
  page.on('pageerror', (e) => erreurs.push(`${ecran} › ${e.message}`));
  await page.goto(url, { timeout: 90000 });
  await page.locator('input[type="file"]').setInputFiles(fichier);
  await page.locator('section.combat canvas').waitFor({ timeout: 15000 });
  await page.waitForTimeout(2000);
  for (const r of rencontres) {
    const combat = demarrerCombat(c, r.id, allies, creerRng(`boss-${r.id}`), `essai-${r.id}`);
    await page.evaluate((x) => window.__velmarisCombat.essai(x), JSON.parse(JSON.stringify(combat)));
    await page.waitForTimeout(1200); // entrée des combattants (250 ms) et chargement
    const mesures = await page.evaluate(() => window.__velmarisCombat.etiquettes());
    const boss = combat.combattants.find((x) => x.boss);
    if (!mesures.some((m) => m.texte.includes(boss.nom))) { erreurs.push(`${ecran} › ${r.id} : le boss « ${boss.nom} » n'est pas affiché`); continue; }
    for (const m of mesures) {
      const cb = combat.combattants.find((x) => x.id === m.id);
      const qui = `${ecran} › ${r.id} › ${cb?.nom ?? m.id}`;
      const ecart = m.barre - m.pieds; // de la ligne des pieds au haut de la barre de vie
      if (ecart < -1 || ecart > 10) erreurs.push(`${qui} : ${Math.round(ecart)} px entre les pieds et la barre`);
      if (m.pieds < m.sol - 2 || m.pieds > m.sol + (m.hauteur * 0.2)) erreurs.push(`${qui} : pieds hors de la bande du sol (${Math.round(m.pieds)} px, sol ${Math.round(m.sol)} px)`);
      if (cb?.boss && m.marqueur !== null && m.marqueur > m.tete) erreurs.push(`${qui} : le marqueur « à vous » est dans le corps du boss`);
    }
    if (ecran === 'ordinateur' || r.id === 'crypte-golem') await page.locator('section.combat canvas').screenshot({ path: join(dossier, `${r.id}${ecran === 'telephone' ? '-telephone' : ''}.png`) });
  }
  console.log(`✔ ${ecran}`);
  await page.close();
}
await navigateur.close();
if (erreurs.length) { console.log(`✘ Placement (${erreurs.length}) :\n` + erreurs.map((e) => ' - ' + e).join('\n')); process.exit(1); }
console.log(`Placement des boss : OK (captures dans ${dossier}).`);
