/**
 * Les héros portent leur équipement sur leur avatar, dans le monde : à l'arrivée du personnage
 * et à chaque changement (vérifié toutes les secondes, sans rien reconstruire si rien n'a changé).
 * Sans partie ouverte, l'avatar reste tel quel.
 */
import { Players } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { cleEquipement, equiperPersonnage } from "shared/equipement3d";
import { idJoueur } from "shared/reseau";
import { partieDe } from "./parties";

function habiller(joueur: Player) {
	const perso = joueur.Character;
	if (!perso || !perso.FindFirstChild("UpperTorso")) return;
	const p = partieDe.get(joueur);
	const hid = p?.etat.joueurs[idJoueur(joueur)]?.herosId;
	const h = hid !== undefined ? p!.etat.heros[hid] : undefined;
	if (!h) {
		if (perso.FindFirstChild("Equipement")) {
			perso.FindFirstChild("Equipement")!.Destroy();
			perso.FindFirstChild("Arme")?.Destroy();
			perso.SetAttribute("EquipementPorte", undefined);
		}
		return;
	}
	const cle = `${h.classe}#${cleEquipement(h.equipement)}`;
	if (perso.GetAttribute("CleTenue") === cle) return;
	equiperPersonnage(perso, CONTENU, h.equipement, h.classe);
	perso.SetAttribute("CleTenue", cle);
}

export function habillerLesHeros() {
	Players.PlayerAdded.Connect((j) => j.CharacterAppearanceLoaded.Connect(() => pcall(() => habiller(j))));
	for (const j of Players.GetPlayers()) j.CharacterAppearanceLoaded.Connect(() => pcall(() => habiller(j)));
	while (true) {
		task.wait(1);
		for (const j of Players.GetPlayers()) pcall(() => habiller(j));
	}
}
