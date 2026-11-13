/**
 * Exporte le contenu du jeu (YAML de content/, vérifié par les schémas) pour la version Roblox :
 * roblox/src/shared/contenu.lua renvoie le contenu en texte JSON, décodé au démarrage par HttpService:JSONDecode.
 *
 * Usage : npm run roblox:contenu   (à relancer après chaque modification de content/)
 */
import { writeFileSync } from 'node:fs';
import { contenuDisque } from '../src/contenu/node';

const json = JSON.stringify(contenuDisque());
if (json.includes(']==]')) throw new Error('Le contenu contient « ]==] », incompatible avec la chaîne longue Luau.');
writeFileSync('roblox/src/shared/contenu.lua', `--!nocheck\n-- Fichier GÉNÉRÉ par \`npm run roblox:contenu\` à partir de content/. Ne pas modifier à la main.\nreturn [==[${json}]==]\n`);
console.log(`Contenu exporté pour Roblox : ${(json.length / 1024).toFixed(0)} Ko → roblox/src/shared/contenu.lua`);
