-- Appelle sous Lune toutes les fonctions du moteur utilisées par l'interface Roblox, sur des états réels
-- (produits par scripts/roblox-parite.ts avec POINTS=…). Une erreur Luau = un écran qui planterait dans Roblox.
local serde = require("@lune/serde")
local fs = require("@lune/fs")
local moteur = require("../src/shared/moteur")
local contenu = serde.decode("json", fs.readFile("parite/tmp/contenu.json"))
local sortie = serde.decode("json", fs.readFile("parite/tmp/sortie.json"))
local appels, erreurs = 0, 0
local function essai(nom, f)
	appels += 1
	local ok, err = pcall(f)
	if not ok then
		erreurs += 1
		if erreurs <= 15 then print("ERREUR " .. nom .. " : " .. tostring(type(err) == "table" and err.message or err)) end
	end
end
for _, etat in sortie.points do
	local tous = {}
	for _, h in moteur.listeHeros(etat) do table.insert(tous, h.id) end
	for _, h in moteur.listeHeros(etat) do
		essai("prochaineEtape", function() moteur.prochaineEtape(contenu, etat, h.id) end)
		essai("caracsTotales", function() moteur.caracsTotales(contenu, h) end)
		essai("competences", function() moteur.competencesConnues(contenu, h); moteur.competencesEquipees(contenu, h) end)
		essai("scenesDisponibles(partout)", function() moteur.scenesDisponibles(contenu, etat, nil, h.id) end)
		for _, l in contenu.regions.aubeclaire.lieux do
			essai("lieu " .. l.id, function()
				moteur.conditionScene(contenu, etat, l.disponible_si, tous)
				moteur.scenesDisponibles(contenu, etat, l.id, h.id)
				moteur.lieuAvecCombat(contenu, etat, l.id, h.id)
				for _, o in l.boutique do moteur.prixAchat(contenu, h, o) end
			end)
		end
		for _, co in etat.compagnonsRencontres do essai("palier", function() moteur.palierCompagnon(contenu, etat, h.id, co) end) end
		for o, _ in h.inventaire do essai("prixVente", function() moteur.prixVente(contenu, h, o) end) end
		for _, ct in contenu.contrats do essai("contrat", function() moteur.conditionHeros(contenu, etat, ct.disponible_si, h) end) end
		for _, a in contenu.activites do essai("activite", function() moteur.conditionHeros(contenu, etat, a.disponible_si, h) end) end
	end
	for cle, es in etat.scenes do
		essai("scene " .. es.sceneId, function()
			local n = moteur.noeudCourant(contenu, etat, cle)
			if n then for _, r in n.repliques do moteur.remplacerVariables(contenu, etat, r.dit, es.heros); moteur.conditionScene(contenu, etat, r.si, es.heros) end end
			moteur.choixVisibles(contenu, etat, cle)
		end)
	end
	for cle, e in etat.combats do
		local c = e.combat
		if c.enAttente then
			essai("combat " .. c.nom, function()
				moteur.actionsDisponibles(contenu, c, c.enAttente)
				local x
				for _, y in c.combattants do if y.id == c.enAttente then x = y end end
				local ctx = { contenu = contenu, combat = c, acteur = c.enAttente, heros = x and x.herosId and etat.heros[x.herosId], grimoire = etat.grimoire or {} }
				moteur.propositionsScript(ctx)
				moteur.interpreter(ctx, "je vise la tête")
				moteur.interpreter(ctx, "je combine les deux")
			end)
		end
	end
	for id, a in contenu.ambiance or {} do
		if a.si then essai("ambiance " .. id, function() moteur.conditionScene(contenu, etat, a.si, tous) end) end
	end
	if etat.donjon then essai("donjon", function() moteur.caseDonjon(contenu, etat.donjon.id, etat.donjon.x, etat.donjon.y) end) end
end
print(`{#sortie.points} états testés, {appels} appels, {erreurs} erreur(s).`)
if erreurs > 0 then error("Des fonctions de l'interface échouent en Luau") end
