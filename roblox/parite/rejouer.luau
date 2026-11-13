-- Rejoue sous Lune les actions produites par le robot TypeScript (voir scripts/roblox-parite.ts).
local serde = require("@lune/serde")
local fs = require("@lune/fs")
local moteur = require("../src/shared/moteur")

local contenu = serde.decode("json", fs.readFile("parite/tmp/contenu.json"))
local entree = serde.decode("json", fs.readFile("parite/tmp/entree.json"))
local points = {}
if entree.points and #entree.points > 0 then
  local etat = entree.depart
  for i, a in entree.actions do
    local ok, err = pcall(function() etat = moteur.appliquer(contenu, etat, a) end)
    if not ok then print("action " .. (i - 1) .. " refusée : " .. tostring(err and err.message or err)) end
    if table.find(entree.points, i - 1) then table.insert(points, etat) end
  end
end
local res = moteur.rejouer(contenu, entree.depart, entree.actions)
fs.writeFile("parite/tmp/sortie.json", serde.encode("json", { etat = res.etat, erreurs = res.erreurs, points = points }))
