/**
 * Géographie partagée serveur / joueurs : où se trouve chaque lieu dans le monde 3D,
 * et où se déroule un combat selon son décor.
 *
 * Chaque région de la saison 1 a sa propre zone, loin des autres (on y voyage par téléportation) :
 * Aubeclaire au centre, la Marche des Sables au sud, Sylvenoire à l'ouest, Grisfer à l'est,
 * l'Archipel au sud-ouest, le Mur d'Aube et les Terres Cendrées au nord.
 */
import { CONTENU } from "./donnees";
import type { LieuDef } from "./moteur";

/**
 * 1 pixel de la carte d'une région (1920 × 1080) = ECHELLE studs, autour du centre de la région.
 * 1,8 : une région fait environ 3 500 × 1 900 studs, de quoi bâtir de vraies villes (un personnage mesure 5 studs).
 */
export const ECHELLE = 1.8;
/** Agrandissement des bâtiments par rapport à leurs mesures de base (maisons, auberges, Guildes…). */
export const GRANDEUR = { maison: 2.2, edifice: 2.6, palais: 3 };
export const CENTRE_CARTE = { x: 960, y: 570 };

/** Origine 3D de chaque région (centre de sa carte). */
export const ORIGINES: Record<string, Vector3> = {
	aubeclaire: new Vector3(0, 0, 0),
	"marche-des-sables": new Vector3(0, 0, 6000),
	sylvenoire: new Vector3(-6000, 0, 0),
	"monts-grisfer": new Vector3(6000, 0, 0),
	"archipel-des-brumes": new Vector3(-6000, 0, 6000),
	"mur-d-aube": new Vector3(0, 0, -6000),
	"terres-cendrees": new Vector3(0, 0, -12000),
};

/** Style de décor de chaque région (terrain, bâtiments, végétation). */
export const STYLES: Record<string, string> = {
	aubeclaire: "plaine",
	"marche-des-sables": "desert",
	sylvenoire: "foret",
	"monts-grisfer": "montagne",
	"archipel-des-brumes": "archipel",
	"mur-d-aube": "rempart",
	"terres-cendrees": "cendres",
};

const regionDe = new Map<string, string>();
for (const [rid, r] of pairs(CONTENU.regions)) for (const l of r.lieux) regionDe.set(l.id, rid as string);

/** Région d'un lieu (« aubeclaire » si inconnu). */
export function regionDuLieu(id: string): string {
	return regionDe.get(id) ?? "aubeclaire";
}

/** Tous les lieux de toutes les régions. */
export function tousLesLieux(): LieuDef[] {
	const res: LieuDef[] = [];
	for (const [, r] of pairs(CONTENU.regions)) for (const l of r.lieux) res.push(l);
	return res;
}

export function trouverLieu(id: string): LieuDef | undefined {
	for (const [, r] of pairs(CONTENU.regions)) {
		const l = r.lieux.find((x) => x.id === id);
		if (l) return l;
	}
	return undefined;
}

/**
 * Décalages propres à la 3D (en studs) : le château domine la ville sur sa butte (Y = 16),
 * le temple est sur sa colline, un peu plus au nord, hors des remparts (Y = 8).
 */
export const DECALAGE_3D: Record<string, Vector3> = {
	chateau: new Vector3(0, 16, 0),
	"temple-du-seuil": new Vector3(0, 8, -60),
};

export function positionLieu(l: LieuDef): Vector3 {
	const o = ORIGINES[regionDuLieu(l.id)] ?? new Vector3();
	const d = DECALAGE_3D[l.id] ?? new Vector3();
	return o.add(new Vector3((l.position.x - CENTRE_CARTE.x) * ECHELLE, 0, (l.position.y - CENTRE_CARTE.y) * ECHELLE)).add(d);
}

/** Lieu du monde où l'on se bat, selon le décor de la rencontre (combat « sur place »). */
export const LIEU_DU_DECOR: Record<string, string> = {
	arene: "arene",
	foret: "combe-aux-saules",
	plaine: "combe-aux-saules",
	"rues-nuit": "quartier-tanneurs",
	crypte: "crypte-fontaine",
	ville: "lysmont-place",
	// chapitre 2 : Marche des Sables
	desert: "route-des-caravanes",
	canyon: "canyon-des-chacals",
	palais: "qarzim-residence",
	"ville-desert": "qarzim-porte",
	mine: "mines-ether",
	ruines: "ruines-de-sel",
	// chapitre 3 : Sylvenoire
	"foret-profonde": "bois-des-feux-follets",
	marais: "bois-des-feux-follets",
	bibliotheque: "bibliotheque-racines",
	clairiere: "clairiere-dechirure",
	// chapitre 4 : Monts Grisfer et Archipel des Brumes
	montagne: "col-des-vents",
	"mine-naine": "mines-profondes",
	forge: "coulee-de-lave",
	marches: "mille-marches",
	plage: "plage-noire",
	port: "port-quais",
	epave: "phare-noye",
	nid: "nid-des-wyrms",
	// chapitre 5 : Mur d'Aube
	rempart: "chemin-de-ronde",
	breche: "breche-du-mur",
	camp: "camp-des-allies",
	"plaine-cendree": "plaine-cendree",
	// chapitre 6 : Terres Cendrées
	cendres: "foret-petrifiee",
	voile: "foret-petrifiee",
	"lac-de-lave": "lac-de-lave",
	citadelle: "citadelle-porte",
	sommet: "citadelle-sommet",
};

/** Hauteur à laquelle est dessiné le donjon (au-dessus du monde). */
export const HAUTEUR_DONJON = 800;
