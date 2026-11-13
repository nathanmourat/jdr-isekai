/**
 * Exporte le contenu du jeu (YAML de content/, vérifié par les schémas) pour la version Roblox :
 * roblox/src/shared/contenu.lua renvoie le contenu en texte JSON, décodé au démarrage par HttpService:JSONDecode.
 *
 * Version tout public : la romance est désactivée (scènes « romance: true » masquées par le moteur),
 * les paliers d'affinité sont renommés, et on vérifie qu'aucun texte romantique ne reste.
 *
 * Usage : npm run roblox:contenu   (à relancer après chaque modification de content/)
 */
import { writeFileSync } from 'node:fs';
import { contenuDisque } from '../src/contenu/node';

const c = contenuDisque();
c.config.romance = false;
const NOMS_AMITIE: Record<string, string> = { amoureuse: 'Amie fidèle', engagee: 'Lien indéfectible' };
for (const p of c.config.affinite.paliers) if (NOMS_AMITIE[p.id]) p.nom = NOMS_AMITIE[p.id];

// Vérification : aucun mot romantique dans les textes visibles (hors scènes « romance », masquées)
const INTERDITS = ['amoureu', 'amour', 'embrass', 'baiser', 'romance', 'romanti', 'sédui', 'séduc', 'flirt', 'caress', 'câlin', 'galant', 'épouser', 'fiancé'];
const trouves: string[] = [];
function parcourir(x: unknown, chemin: string) {
  if (typeof x === 'string') {
    const t = x.toLowerCase();
    for (const m of INTERDITS) if (t.includes(m)) trouves.push(`${chemin} : « ${x.slice(0, 90)} » (mot « ${m} »)`);
  } else if (Array.isArray(x)) x.forEach((v, i) => parcourir(v, `${chemin}[${i}]`));
  else if (x && typeof x === 'object') {
    // identifiants et conditions : jamais affichés aux joueurs
    for (const [k, v] of Object.entries(x)) if (k !== 'id' && k !== 'si' && !k.endsWith('_si') && !k.includes('palier')) parcourir(v, `${chemin}.${k}`);
  }
}
for (const [cle, v] of Object.entries(c)) {
  if (cle === 'scenes') {
    for (const s of Object.values(c.scenes)) if (!s.romance) parcourir(s, `scenes.${s.id}`);
  } else parcourir(v, cle);
}
if (trouves.length) {
  console.error(`Version tout public : ${trouves.length} texte(s) romantique(s) à revoir (marquer la scène « romance: true » ou reformuler) :`);
  for (const t of trouves) console.error(' - ' + t);
  process.exit(1);
}

const json = JSON.stringify(c);
if (json.includes(']==]')) throw new Error('Le contenu contient « ]==] », incompatible avec la chaîne longue Luau.');
writeFileSync('roblox/src/shared/contenu.lua', `--!nocheck\n-- Fichier GÉNÉRÉ par \`npm run roblox:contenu\` à partir de content/ (version tout public). Ne pas modifier à la main.\nreturn [==[${json}]==]\n`);
console.log(`Contenu exporté pour Roblox (tout public) : ${(json.length / 1024).toFixed(0)} Ko → roblox/src/shared/contenu.lua`);
