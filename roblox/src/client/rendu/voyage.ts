/**
 * Voyage rapide côté joueur : pierres de voyage connues (attribut « PierresConnues » envoyé par le serveur),
 * téléportation vers une pierre, et règle de « Y aller » (voir shared/voyage.ts).
 */
import { HttpService, Players } from "@rbxts/services";
import { positionLieu, regionDePosition, trouverLieu } from "shared/geo";
import { pierreLaPlusProche, pierresDeVoyage, voyageDebloque, type Pierre } from "shared/voyage";
import { jeu } from "../partie";
import { teleporter } from "./marqueurs";

/** Pierres déjà activées par ce joueur. */
export function pierresConnues(): Set<string> {
	const brut = Players.LocalPlayer.GetAttribute("PierresConnues");
	const res = new Set<string>();
	if (!typeIs(brut, "string")) return res;
	const [ok, liste] = pcall(() => HttpService.JSONDecode(brut) as string[]);
	if (ok) for (const id of liste) res.add(id);
	return res;
}

export function voyagerVers(p: Pierre) {
	const pos = p.position.add(new Vector3(0, 4, 8));
	teleporter(new CFrame(pos, p.position.add(new Vector3(0, 4, 0))));
}

/**
 * Peut-on se téléporter vers ce lieu ? Oui si le voyage rapide est éveillé et que la pierre la plus proche
 * est connue ; ou, une fois éveillé, si c'est la première fois qu'on va dans cette région (la caravane).
 */
export function teleportationPossible(lieu: string): boolean {
	const etat = jeu.etat;
	if (!voyageDebloque(etat)) return false;
	const l = trouverLieu(lieu);
	if (!l) return false;
	const pos = positionLieu(l);
	const connues = pierresConnues();
	const proche = pierreLaPlusProche(pos);
	if (proche && connues.has(proche.id)) return true;
	const region = regionDePosition(pos);
	if (region === "aubeclaire") return false;
	return !pierresDeVoyage().some((x) => x.region === region && connues.has(x.id));
}
