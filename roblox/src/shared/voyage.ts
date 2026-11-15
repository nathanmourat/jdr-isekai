/**
 * Pierres de voyage (voyage rapide, comme dans les RPG) : une au centre de chaque ville et village.
 *  - On l'active en passant à côté (serveur : server/voyage.ts) ; la liste est gardée sur le compte du joueur.
 *  - Le voyage rapide ne s'éveille qu'au départ de la caravane (début du chapitre 2) : avant, on marche,
 *    et « Y aller » guide avec une flèche dorée au lieu de téléporter.
 *  - On ne se téléporte qu'entre pierres déjà activées ; la première fois dans une nouvelle région,
 *    le bouton de l'étape de l'histoire y emmène (le voyage de la caravane).
 */
import { CONTENU } from "./donnees";
import { ECHELLE, ORIGINES, positionLieu, regionDePosition } from "./geo";
import type { EtatPartie } from "./moteur";

export interface Pierre {
	id: string;
	nom: string;
	region: string;
	position: Vector3;
}

/** Quand le voyage rapide s'éveille (drapeau de l'histoire) ; à changer ici pour un autre moment. */
export const DEBLOCAGE_VOYAGE = { flag: "ch2-depart-fait", texte: "au départ de la caravane, au début du chapitre 2" };

export function voyageDebloque(etat: EtatPartie | undefined): boolean {
	return etat !== undefined && etat.flags[DEBLOCAGE_VOYAGE.flag] === true;
}

let cache: Pierre[] | undefined;

/** Toutes les pierres du monde : Lysmont, Hautepierre, la Combe-aux-Saules, et chaque ville des autres régions. */
export function pierresDeVoyage(): Pierre[] {
	if (cache) return cache;
	const res: Pierre[] = [];
	const lieux = CONTENU.regions.aubeclaire.lieux;
	const place = lieux.find((l) => l.id === "lysmont-place");
	if (place) res.push({ id: "lysmont", nom: "Lysmont", region: "aubeclaire", position: positionLieu(place).add(new Vector3(14, 0, 75)) });
	res.push({ id: "hautepierre", nom: "Hautepierre (faubourg)", region: "aubeclaire", position: new Vector3(84, 0, 832) });
	const combe = lieux.find((l) => l.id === "combe-aux-saules");
	if (combe) res.push({ id: "combe-aux-saules", nom: combe.nom, region: "aubeclaire", position: positionLieu(combe).add(new Vector3(30, 0, 70)) });
	for (const [id, r] of pairs(CONTENU.regions)) {
		if (id === "aubeclaire") continue;
		const o = ORIGINES[id as string];
		if (!o) continue;
		for (const v of r.villes ?? []) {
			const centre = o.add(new Vector3((v.position.x - 960) * ECHELLE, 0, (v.position.y - 570) * ECHELLE));
			res.push({ id: v.id, nom: v.nom, region: id as string, position: centre.add(new Vector3(18, 0, 18)) });
		}
	}
	cache = res;
	return res;
}

/** Pierre la plus proche d'un point du monde. */
export function pierreLaPlusProche(p: Vector3): Pierre | undefined {
	let meilleure: Pierre | undefined;
	let d = math.huge;
	for (const x of pierresDeVoyage()) {
		const e = new Vector3(p.X - x.position.X, 0, p.Z - x.position.Z).Magnitude;
		if (e < d) {
			d = e;
			meilleure = x;
		}
	}
	return meilleure;
}

export { regionDePosition };
