-- Parité de l'IA maison : voir scripts/roblox-parite-ia.ts
local serde = require("@lune/serde")
local fs = require("@lune/fs")
local moteur = require("../src/shared/moteur")
local contenu = serde.decode("json", fs.readFile("parite/tmp/contenu.json"))
local e = serde.decode("json", fs.readFile("parite/tmp/ia.json"))
local ctx = { contenu = contenu, combat = e.combat, acteur = e.acteur, heros = e.heros, grimoire = {} }
local res = {}
local libs = {}
for _, p in moteur.propositionsScript(ctx) do table.insert(libs, p.libelle) end
table.insert(res, table.concat(libs, " / "))
for _, texte in e.phrases do
  local i = moteur.interpreter(ctx, texte)
  local alt = {}
  for _, a in i.alternatives do table.insert(alt, a.libelle) end
  table.insert(res, `{tostring(i.possible)} | {i.message} | {i.proposition and i.proposition.libelle or "-"} | {table.concat(alt, " / ")}`)
end
fs.writeFile("parite/tmp/ia-sortie.json", serde.encode("json", res))
