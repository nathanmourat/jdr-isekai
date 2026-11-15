/**
 * Costumes des habitants selon la culture de chaque région (d'après les descriptions du contenu) :
 *  - Aubeclaire : royaume médiéval (laine, lin, tabliers, chapeaux de paille, capuches) ;
 *  - Marche des Sables : cités-oasis marchandes de Qarzim, Ourvalis et Vulpins (turbans, voiles,
 *    robes claires, ceintures d'étoffe safran et indigo) ;
 *  - Sylvenoire : elfes de la forêt (oreilles pointues, verts mousse et argent, capes, couronnes de feuilles) ;
 *  - Monts Grisfer : nains de Karak-Dûm (petits, barbus, cuir, cols de fourrure, tabliers de forge) ;
 *  - Archipel des Brumes : marins et pirates de Port-Vérane (bandanas, tricornes, ceintures rouges) ;
 *  - Mur d'Aube : ville de garnison (soldats en tabard, réfugiés en capes grises) ;
 *  - Terres Cendrées : camp de l'Aube et peuple des Cendres (cornes, peaux grises, yeux de braise, capes noires).
 * Utilisé par les villageois des villes, les habitants des maisons et les figurants des salles.
 */
import { regionDePosition } from "shared/geo";
import type { Costume } from "./modeles";

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

export interface Culture {
	tenues: Costume[];
	garde: Costume;
}

const PEAUX_CLAIRES = [rgb(235, 205, 180), rgb(225, 190, 160), rgb(200, 160, 120)];
const PEAUX_SABLE = [rgb(200, 150, 105), rgb(170, 120, 80), rgb(140, 95, 60), rgb(215, 170, 125)];

export const CULTURES: Record<string, Culture> = {
	aubeclaire: {
		tenues: [
			{ peau: PEAUX_CLAIRES[1], haut: rgb(120, 60, 50), bas: rgb(70, 60, 50) },
			{ peau: PEAUX_CLAIRES[2], haut: rgb(70, 100, 140), bas: rgb(60, 55, 50) },
			{ peau: PEAUX_CLAIRES[0], haut: rgb(150, 130, 80), bas: rgb(90, 70, 50) },
			{ peau: rgb(170, 125, 90), haut: rgb(90, 120, 80), bas: rgb(70, 60, 45) },
			{ peau: PEAUX_CLAIRES[1], haut: rgb(160, 120, 150), bas: rgb(80, 60, 70), capuche: rgb(140, 100, 130) },
			{ peau: PEAUX_CLAIRES[2], haut: rgb(200, 190, 160), bas: rgb(110, 90, 60), chapeau: rgb(190, 160, 100) },
			{ peau: PEAUX_CLAIRES[0], haut: rgb(110, 80, 60), bas: rgb(60, 50, 40), tablier: rgb(220, 215, 200) },
		],
		garde: { peau: rgb(220, 185, 150), haut: rgb(170, 175, 190), bas: rgb(80, 85, 110), classe: "gardien" },
	},
	"marche-des-sables": {
		tenues: [
			{ peau: PEAUX_SABLE[0], haut: rgb(235, 225, 200), bas: rgb(235, 225, 200), turban: rgb(230, 180, 60), ceinture: rgb(200, 90, 40) },
			{ peau: PEAUX_SABLE[1], haut: rgb(60, 70, 140), bas: rgb(220, 205, 170), turban: rgb(240, 235, 220), voile: rgb(60, 70, 140) },
			{ peau: PEAUX_SABLE[2], haut: rgb(190, 110, 50), bas: rgb(120, 70, 40), turban: rgb(120, 40, 50), ceinture: rgb(230, 180, 60) },
			{ peau: PEAUX_SABLE[3], haut: rgb(220, 200, 160), bas: rgb(170, 140, 100), voile: rgb(200, 180, 140), capuche: rgb(200, 180, 140) },
			// Vulpins : pelage roux, oreilles et queue de renard
			{ peau: rgb(205, 110, 50), haut: rgb(110, 60, 90), bas: rgb(220, 200, 160), renard: rgb(205, 110, 50), ceinture: rgb(230, 180, 60), echelle: 0.9 },
			// Ourvalis : grands, pelage brun, oreilles d'ours
			{ peau: rgb(120, 85, 60), haut: rgb(150, 120, 80), bas: rgb(90, 70, 50), ours: rgb(110, 75, 50), ceinture: rgb(60, 70, 140), echelle: 1.2 },
		],
		garde: { peau: PEAUX_SABLE[1], haut: rgb(200, 160, 70), bas: rgb(110, 60, 40), turban: rgb(200, 160, 70), voile: rgb(110, 60, 40), classe: "lame-runique" },
	},
	sylvenoire: {
		tenues: [
			{ peau: rgb(240, 225, 205), haut: rgb(70, 110, 70), bas: rgb(60, 80, 55), oreilles: rgb(240, 225, 205), couronneFeuilles: rgb(90, 140, 70) },
			{ peau: rgb(230, 215, 200), haut: rgb(170, 180, 175), bas: rgb(90, 110, 90), oreilles: rgb(230, 215, 200), cape: rgb(50, 80, 60) },
			{ peau: rgb(220, 200, 180), haut: rgb(110, 90, 60), bas: rgb(70, 90, 60), oreilles: rgb(220, 200, 180), capuche: rgb(70, 110, 70) },
			{ peau: rgb(245, 230, 215), haut: rgb(120, 150, 170), bas: rgb(200, 205, 200), oreilles: rgb(245, 230, 215), couronneFeuilles: rgb(200, 170, 80) },
		],
		garde: { peau: rgb(235, 220, 200), haut: rgb(60, 90, 60), bas: rgb(50, 70, 50), oreilles: rgb(235, 220, 200), cape: rgb(40, 60, 45), classe: "archer" },
	},
	"monts-grisfer": {
		tenues: [
			{ peau: rgb(220, 170, 140), haut: rgb(120, 80, 50), bas: rgb(70, 60, 55), barbe: rgb(150, 70, 40), fourrure: rgb(170, 150, 120), echelle: 0.8 },
			{ peau: rgb(210, 165, 130), haut: rgb(90, 95, 110), bas: rgb(60, 55, 50), barbe: rgb(60, 50, 45), tablier: rgb(80, 55, 35), echelle: 0.82 },
			{ peau: rgb(225, 180, 150), haut: rgb(140, 50, 45), bas: rgb(80, 70, 60), barbe: rgb(200, 190, 175), fourrure: rgb(110, 90, 70), echelle: 0.78 },
			{ peau: rgb(215, 170, 135), haut: rgb(70, 90, 70), bas: rgb(60, 50, 40), barbe: rgb(190, 120, 50), ceinture: rgb(180, 150, 60), echelle: 0.8 },
		],
		garde: { peau: rgb(215, 170, 135), haut: rgb(110, 110, 120), bas: rgb(70, 70, 80), barbe: rgb(100, 60, 40), fourrure: rgb(90, 80, 70), echelle: 0.85, classe: "gardien" },
	},
	"archipel-des-brumes": {
		tenues: [
			{ peau: rgb(200, 150, 110), haut: rgb(235, 230, 220), bas: rgb(50, 60, 90), bandana: rgb(170, 40, 40), ceinture: rgb(170, 40, 40) },
			{ peau: rgb(170, 120, 85), haut: rgb(60, 80, 120), bas: rgb(200, 190, 170), bandana: rgb(40, 50, 80) },
			{ peau: rgb(225, 185, 150), haut: rgb(120, 40, 40), bas: rgb(60, 50, 45), tricorne: rgb(40, 35, 35), ceinture: rgb(200, 160, 60) },
			{ peau: rgb(190, 140, 100), haut: rgb(200, 190, 170), bas: rgb(110, 80, 60), chapeau: rgb(180, 160, 110), ceinture: rgb(60, 110, 120) },
		],
		garde: { peau: rgb(190, 140, 100), haut: rgb(40, 50, 80), bas: rgb(40, 40, 50), tricorne: rgb(30, 30, 35), ceinture: rgb(170, 40, 40), classe: "ombre" },
	},
	"mur-d-aube": {
		tenues: [
			{ peau: PEAUX_CLAIRES[1], haut: rgb(150, 150, 160), bas: rgb(70, 70, 80), tablier: rgb(200, 170, 70), classe: "gardien" },
			{ peau: PEAUX_CLAIRES[0], haut: rgb(110, 105, 100), bas: rgb(70, 65, 60), cape: rgb(120, 115, 110), capuche: rgb(120, 115, 110) },
			{ peau: PEAUX_CLAIRES[2], haut: rgb(90, 70, 55), bas: rgb(60, 55, 50), fourrure: rgb(150, 140, 120) },
			{ peau: rgb(180, 135, 100), haut: rgb(140, 40, 40), bas: rgb(70, 60, 55), tablier: rgb(200, 170, 70) },
		],
		garde: { peau: PEAUX_CLAIRES[1], haut: rgb(170, 175, 190), bas: rgb(80, 85, 110), cape: rgb(200, 170, 70), classe: "gardien" },
	},
	"terres-cendrees": {
		tenues: [
			{ peau: rgb(150, 140, 140), haut: rgb(40, 35, 40), bas: rgb(30, 28, 30), cornes: rgb(60, 50, 50), yeux: rgb(255, 120, 40), cape: rgb(30, 25, 28) },
			{ peau: rgb(170, 100, 90), haut: rgb(70, 40, 40), bas: rgb(40, 30, 30), cornes: rgb(40, 35, 35), yeux: rgb(255, 160, 60) },
			{ peau: PEAUX_CLAIRES[1], haut: rgb(110, 105, 100), bas: rgb(60, 55, 50), cape: rgb(90, 85, 80), capuche: rgb(90, 85, 80) },
			{ peau: rgb(130, 120, 125), haut: rgb(90, 50, 30), bas: rgb(40, 35, 35), cornes: rgb(80, 60, 50), ceinture: rgb(200, 90, 40) },
		],
		garde: { peau: PEAUX_CLAIRES[0], haut: rgb(170, 175, 190), bas: rgb(80, 85, 110), cape: rgb(200, 170, 70), classe: "gardien" },
	},
};

export function culture(region: string): Culture {
	return CULTURES[region] ?? CULTURES.aubeclaire;
}

/** Une tenue de la culture de la région (copie, qu'on peut modifier : tablier, chapeau…). */
export function tenueDe(region: string, i: number): Costume {
	const t = culture(region).tenues;
	return { ...t[((i % t.size()) + t.size()) % t.size()] };
}

/** Tenue de la culture de l'endroit où se trouve ce point. */
export function tenueIci(p: Vector3, i: number): Costume {
	return tenueDe(regionDePosition(p), i);
}
