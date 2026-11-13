-- Reproduit sous Lune le test R0 de Studio (src/server/main.server.ts), sans Roblox.
local serde = require("@lune/serde")
local moteur = require("../src/shared/moteur")
local contenu = serde.decode("json", require("../src/shared/contenu"))
local etat = moteur.nouvellePartie(contenu, "essai", "Partie d'essai", "studio")
etat = moteur.appliquer(contenu, etat, { type = "rejoindre", joueur = "j1", pseudo = "Alpha" })
etat = moteur.appliquer(contenu, etat, { type = "rejoindre", joueur = "j2", pseudo = "Bravo" })
etat = moteur.appliquer(contenu, etat, { type = "creer_heros", joueur = "j1", heros = { nom = "Kael", classe = "lame-runique", race = "humain", don = "oeil-du-seuil", origine = "invoque", age = 24 } })
etat = moteur.appliquer(contenu, etat, { type = "creer_heros", joueur = "j2", heros = { nom = "Ilo", classe = "arcaniste", race = "elfe", don = "mimetisme", origine = "invoque", age = 22 } })
print(moteur.formaterDate(contenu, etat.jour))
for _, h in moteur.listeHeros(etat) do print(h.nom, contenu.races[h.race].nom, contenu.classes[h.classe].nom, h.niveau, h["or"]) end
local e = moteur.prochaineEtape(contenu, etat, "h1")
print("Prochaine étape :", e and e.objectif)
local rng = moteur.creerRng("studio")
local allies = {}
for _, h in moteur.listeHeros(etat) do table.insert(allies, moteur.combattantHeros(contenu, h, false)) end
local combat = moteur.demarrerCombat(contenu, "examen-guilde", allies, rng)
moteur.avancer(contenu, combat, rng)
for _, ev in combat.evenements do print("[Combat] " .. ev.texte) end
print("Résultat :", combat.resultat, combat.tour)
