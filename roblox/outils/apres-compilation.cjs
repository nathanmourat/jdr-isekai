/**
 * Retouches du moteur compilé (src/shared/moteur.lua) pour Luau / Roblox.
 * La bibliothèque d'exécution de TypeScriptToLua utilise debug.getinfo, qui n'existe pas en Luau,
 * et lit des fonctions de base dans _G (vide dans Roblox).
 */
const fs = require('node:fs');
const fichier = __dirname + '/../src/shared/moteur.lua';
let s = fs.readFileSync(fichier, 'utf8');
const remplacements = [
  ['        if debug == nil then\n            return nil\n        end', '        if debug == nil or debug.getinfo == nil then\n            return nil\n        end'],
  ['            local caller = debug.getinfo(3, "f")', '            local caller = debug.getinfo and debug.getinfo(3, "f")'],
];
// Dans Roblox, _G est une table partagée vide : _G.pcall, _G.rawget… valent nil. On utilise les fonctions de base.
for (const nom of ['pcall', 'coroutine', 'getmetatable', 'setmetatable', 'rawget', 'rawset', 'rawequal', 'error', 'type', 'tostring', 'select']) {
  s = s.split(`_G.${nom}`).join(nom);
}
for (const [avant, apres] of remplacements) {
  if (!s.includes(avant)) { console.error(`Retouche introuvable dans moteur.lua (TypeScriptToLua a changé ?) :\n${avant}`); process.exit(1); }
  s = s.split(avant).join(apres);
}
s = '--!nocheck\n-- Fichier GÉNÉRÉ par `npm run moteur` à partir de src/moteur (TypeScript). Ne pas modifier à la main.\n' + s;
const restants = [...new Set(s.match(/_G\.\w+/g) ?? [])].filter((x) => x !== '_G.__TS__sourcemap' && x !== '_G.__TS__originalTraceback');
if (restants.length) { console.error('Usages de _G non traités dans moteur.lua : ' + restants.join(', ')); process.exit(1); }
fs.writeFileSync(fichier, s);
console.log('Moteur Luau prêt : src/shared/moteur.lua');
