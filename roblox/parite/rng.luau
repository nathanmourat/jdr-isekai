local moteur = require("../src/shared/moteur")
local r = moteur.creerRng("test")
local res = {}
for i = 1, 20 do table.insert(res, string.format("%.17g", moteur.aleatoire(r))) end
print(table.concat(res, ","))
