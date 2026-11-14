/**
 * Les régions des chapitres 2 à 6, construites par le code à partir des lieux du contenu (content/monde/*.yaml).
 * Chaque région est loin des autres (shared/geo.ts, ORIGINES) : on y va par « Y aller » (téléportation).
 * Un style par région : désert (Marche des Sables), forêt (Sylvenoire), montagne (Grisfer), archipel (Brumes),
 * rempart (Mur d'Aube), cendres (Terres Cendrées). Le style choisit le terrain, les matériaux, la forme des
 * bâtiments et la végétation ; le genre d'un lieu (auberge, guilde, palais…) choisit le bâtiment.
 */
import { CollectionService, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { ORIGINES, positionLieu, STYLES } from "shared/geo";
import type { LieuDef, RegionDef } from "shared/moteur";
import { arbre, bloc, buisson, C, fleurs, lumiere, nuit, rocher, sapin, toit, tonneau, VERTICAL } from "./decor";
import { balise } from "./monde";

const terrain = Workspace.Terrain;
const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

interface Palette {
	sol: Enum.Material;
	sol2: Enum.Material;
	chemin: Enum.Material;
	mur: Color3;
	matMur: Enum.Material;
	toit: Color3;
	matToit: Enum.Material;
	accent: Color3;
	tissus: Color3[];
}

const PALETTES: Record<string, Palette> = {
	desert: { sol: Enum.Material.Sand, sol2: Enum.Material.Sandstone, chemin: Enum.Material.Ground, mur: rgb(222, 190, 140), matMur: Enum.Material.Sandstone, toit: rgb(60, 110, 170), matToit: Enum.Material.CeramicTiles, accent: rgb(70, 140, 200), tissus: [rgb(200, 60, 50), rgb(60, 130, 170), rgb(220, 170, 50), rgb(120, 60, 140)] },
	foret: { sol: Enum.Material.LeafyGrass, sol2: Enum.Material.Grass, chemin: Enum.Material.Mud, mur: rgb(120, 90, 60), matMur: Enum.Material.Wood, toit: rgb(70, 110, 60), matToit: Enum.Material.LeafyGrass, accent: rgb(120, 200, 255), tissus: [rgb(60, 110, 80), rgb(150, 190, 220), rgb(200, 220, 160)] },
	montagne: { sol: Enum.Material.Rock, sol2: Enum.Material.Slate, chemin: Enum.Material.Pavement, mur: rgb(110, 105, 100), matMur: Enum.Material.Slate, toit: rgb(70, 72, 82), matToit: Enum.Material.Slate, accent: rgb(255, 130, 50), tissus: [rgb(140, 40, 40), rgb(200, 150, 50), rgb(60, 60, 70)] },
	archipel: { sol: Enum.Material.Sand, sol2: Enum.Material.Grass, chemin: Enum.Material.WoodPlanks, mur: rgb(150, 110, 75), matMur: Enum.Material.WoodPlanks, toit: rgb(110, 70, 50), matToit: Enum.Material.RoofShingles, accent: rgb(90, 200, 190), tissus: [rgb(230, 230, 220), rgb(170, 40, 40), rgb(40, 70, 130)] },
	rempart: { sol: Enum.Material.Ground, sol2: Enum.Material.Mud, chemin: Enum.Material.Cobblestone, mur: rgb(170, 165, 155), matMur: Enum.Material.Cobblestone, toit: rgb(60, 80, 130), matToit: Enum.Material.Slate, accent: rgb(255, 215, 140), tissus: [rgb(60, 80, 150), rgb(160, 30, 40), rgb(200, 190, 170)] },
	cendres: { sol: Enum.Material.Basalt, sol2: Enum.Material.CrackedLava, chemin: Enum.Material.Ground, mur: rgb(45, 38, 48), matMur: Enum.Material.Basalt, toit: rgb(30, 25, 32), matToit: Enum.Material.Slate, accent: rgb(200, 60, 255), tissus: [rgb(90, 20, 30), rgb(40, 30, 50)] },
};

/** Genre d'un lieu, d'après son id et ses propriétés. */
export function genre(l: LieuDef): string {
	const id = l.id;
	const a = (mot: string) => id.find(mot, 1, true)[0] !== undefined;
	if (l.auberge === true) return "auberge";
	if (id === "guilde" || id.sub(1, 7) === "guilde-") return "guilde";
	if (a("palais") || a("residence") || a("citadelle") || a("trone") || a("forteresse") || a("donjon-") || a("etat-major")) return "palais";
	if (a("temple") || a("sanctuaire") || a("autel") || a("bibliotheque") || a("clairiere")) return "temple";
	if (a("campement") || a("camp")) return "camp";
	if (a("mine") || a("forge")) return "mine";
	if (a("ruines") || a("phare") || a("breche") || a("tour-de-guet") || a("puits")) return "ruines";
	if (a("canyon") || a("falaise") || a("nid") || a("crete") || a("plaine-cendree") || a("coulee") || a("petrifiee") || a("lac-de-lave") || a("col-")) return "rochers";
	if (a("port") || a("quai")) return "port";
	if (a("porte") || a("route") || a("mur") || a("ronde") || a("rempart")) return "porte";
	if (l.boutique.size() > 0) return "boutique";
	return "maison";
}

// ───────────────────────────── Bâtiments ─────────────────────────────

type Construire = (centre: Vector3, m: Model, p: Palette, style: string) => Vector3;

/** Maison simple au style de la région. Renvoie la porte. */
function maisonStyle(centre: Vector3, m: Model, p: Palette, style: string, l = 12, pr = 10, h = 8): Vector3 {
	if (style === "foret") {
		// hutte ronde en bois, toit de feuillage
		bloc(new Vector3(h, l, l), centre.add(new Vector3(0, h / 2, 0)), p.mur, { forme: "cylindre", rotation: VERTICAL, matiere: p.matMur, parent: m });
		terrain.FillBall(centre.add(new Vector3(0, h + 1, 0)), l * 0.62, Enum.Material.LeafyGrass);
	} else if (style === "archipel") {
		// maison sur pilotis
		for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) bloc(new Vector3(0.8, 4, 0.8), centre.add(new Vector3((x * l) / 2.2, 2, (z * pr) / 2.2)), C.bois, { matiere: Enum.Material.Wood, parent: m });
		bloc(new Vector3(l + 1, 0.6, pr + 1), centre.add(new Vector3(0, 4, 0)), C.boisClair, { matiere: Enum.Material.WoodPlanks, parent: m });
		bloc(new Vector3(l, h - 3, pr), centre.add(new Vector3(0, 4 + (h - 3) / 2, 0)), p.mur, { matiere: p.matMur, parent: m });
		toit(centre.add(new Vector3(0, h + 1, 0)), l + 2, pr + 2, l * 0.4, p.toit, m);
		return centre.add(new Vector3(0, 0, pr / 2 + 2));
	} else {
		bloc(new Vector3(l, h, pr), centre.add(new Vector3(0, h / 2, 0)), p.mur, { matiere: p.matMur, parent: m });
		if (style === "desert" || style === "cendres") {
			// toit plat et parapet
			bloc(new Vector3(l + 0.6, 0.8, pr + 0.6), centre.add(new Vector3(0, h + 0.4, 0)), p.mur.Lerp(new Color3(0, 0, 0), 0.08), { matiere: p.matMur, parent: m });
			for (const x of [-l / 3, l / 3]) {
				const f = bloc(new Vector3(1.4, 1.8, 0.3), centre.add(new Vector3(x, h * 0.6, pr / 2 + 0.1)), C.vitre, { neon: true, parent: m });
				nuit(f);
			}
		} else {
			toit(centre.add(new Vector3(0, h, 0)), l + 2, pr + 2, l * 0.42, p.toit, m);
		}
	}
	bloc(new Vector3(2.6, 4.2, 0.4), centre.add(new Vector3(0, 2.1, pr / 2 + 0.2)), C.bois, { matiere: Enum.Material.WoodPlanks, parent: m });
	return centre.add(new Vector3(0, 0, pr / 2 + 2));
}

/** Coupole (désert, palais) : une demi-boule posée sur un tambour. */
function coupole(centre: Vector3, rayon: number, couleur: Color3, m: Model) {
	bloc(new Vector3(1.2, rayon * 2, rayon * 2), centre, couleur.Lerp(new Color3(1, 1, 1), 0.2), { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Sandstone, parent: m });
	bloc(new Vector3(rayon * 2, rayon * 2, rayon * 2), centre.add(new Vector3(0, 0.6, 0)), couleur, { forme: "boule", matiere: Enum.Material.CeramicTiles, parent: m });
	bloc(new Vector3(0.4, 2.5, 0.4), centre.add(new Vector3(0, rayon + 1.6, 0)), C.or, { matiere: Enum.Material.Metal, parent: m });
}

const BATIMENTS: Record<string, Construire> = {
	maison: (c, m, p, s) => maisonStyle(c, m, p, s),
	auberge: (c, m, p, s) => {
		const porte = maisonStyle(c, m, p, s, 18, 14, 10);
		if (s === "desert") {
			coupole(c.add(new Vector3(0, 10.6, 0)), 5, p.toit, m);
			bloc(new Vector3(0.8, 9, 9), c.add(new Vector3(0, 0.3, 13)), C.eau, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Glass, parent: m });
		}
		const enseigne = bloc(new Vector3(4, 2, 0.3), porte.add(new Vector3(3.5, 6, -1.6)), C.bois, { matiere: Enum.Material.Wood, parent: m });
		lumiere(enseigne, rgb(255, 200, 130), 14);
		return porte;
	},
	guilde: (c, m, p, s) => {
		const porte = maisonStyle(c, m, p, s, 20, 14, 11);
		for (const x of [-12, 12]) {
			bloc(new Vector3(0.3, 8, 0.3), c.add(new Vector3(x, 4, 8)), C.bois, { matiere: Enum.Material.Wood, parent: m });
			bloc(new Vector3(2.4, 3.6, 0.1), c.add(new Vector3(x, 6, 8.2)), C.toitBleu, { matiere: Enum.Material.Fabric, parent: m });
			bloc(new Vector3(0.9, 0.9, 0.12), c.add(new Vector3(x, 6.2, 8.25)), C.or, { forme: "boule", parent: m });
		}
		return porte;
	},
	boutique: (c, m, p) => {
		// étals sous auvents colorés
		for (let i = 0; i < 4; i++) {
			const x = -9 + i * 6;
			const tissu = p.tissus[i % p.tissus.size()];
			bloc(new Vector3(5, 2.8, 2.4), c.add(new Vector3(x, 1.4, 0)), C.boisClair, { matiere: Enum.Material.WoodPlanks, parent: m });
			for (const dx of [-2.3, 2.3]) bloc(new Vector3(0.3, 6, 0.3), c.add(new Vector3(x + dx, 3, -1)), C.bois, { matiere: Enum.Material.Wood, parent: m });
			bloc(new Vector3(5.6, 0.2, 4), c.add(new Vector3(x, 6, 0)), tissu, { matiere: Enum.Material.Fabric, rotation: CFrame.Angles(math.rad(12), 0, 0), parent: m });
			for (let k = 0; k < 3; k++) bloc(new Vector3(0.9, 0.9, 0.9), c.add(new Vector3(x - 1.5 + k * 1.5, 3.2, 0)), p.tissus[(i + k + 1) % p.tissus.size()], { forme: "boule", parent: m, collision: false });
		}
		tonneau(c.add(new Vector3(-13, 0, 2)), m);
		return c.add(new Vector3(0, 0, 4));
	},
	palais: (c, m, p, s) => {
		if (s === "foret") {
			// arbre-palais : tronc géant, plateformes et lanternes bleues
			bloc(new Vector3(40, 12, 12), c.add(new Vector3(0, 20, -6)), rgb(90, 64, 42), { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Wood, parent: m });
			for (const [y, r] of [[12, 16], [24, 13]] as const) {
				bloc(new Vector3(1, r * 2, r * 2), c.add(new Vector3(0, y, -6)), C.boisClair, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.WoodPlanks, parent: m });
				const l2 = bloc(new Vector3(1, 1, 1), c.add(new Vector3(r - 1, y + 1.5, -6)), p.accent, { neon: true, parent: m });
				lumiere(l2, p.accent, 16);
			}
			terrain.FillBall(c.add(new Vector3(0, 44, -6)), 20, Enum.Material.LeafyGrass);
			return c.add(new Vector3(0, 0, 4));
		}
		const l = 30;
		const pr = 22;
		const h = s === "cendres" ? 26 : 16;
		bloc(new Vector3(l + 4, 1.4, pr + 4), c.add(new Vector3(0, 0.7, -4)), p.mur.Lerp(new Color3(1, 1, 1), 0.15), { matiere: Enum.Material.Marble, parent: m });
		bloc(new Vector3(l, h, pr), c.add(new Vector3(0, h / 2 + 1.4, -4)), p.mur, { matiere: p.matMur, parent: m });
		if (s === "desert") coupole(c.add(new Vector3(0, h + 2.4, -4)), 8, p.toit, m);
		else if (s === "cendres") {
			for (const x of [-l / 2, l / 2]) bloc(new Vector3(4, h + 14, 4), c.add(new Vector3(x, (h + 14) / 2, -4 - pr / 2)), rgb(30, 22, 34), { matiere: Enum.Material.Basalt, parent: m });
			const oeil = bloc(new Vector3(4, 4, 0.6), c.add(new Vector3(0, h - 2, pr / 2 - 3.6)), p.accent, { neon: true, parent: m });
			lumiere(oeil, p.accent, 30);
		} else toit(c.add(new Vector3(0, h + 1.4, -4)), l + 2, pr + 2, 8, p.toit, m);
		for (const x of [-10, -5, 5, 10]) bloc(new Vector3(h, 1.6, 1.6), c.add(new Vector3(x, h / 2 + 1.4, pr / 2 - 3)), C.blanc, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Marble, parent: m });
		return c.add(new Vector3(0, 0, pr / 2 + 1));
	},
	temple: (c, m, p, s) => {
		bloc(new Vector3(26, 1, 26), c.add(new Vector3(0, 0.5, 0)), p.mur.Lerp(new Color3(1, 1, 1), 0.3), { matiere: Enum.Material.Marble, parent: m });
		for (let i = 0; i < 8; i++) {
			const a = (i / 8) * math.pi * 2;
			bloc(new Vector3(1.6, 10, 1.6), c.add(new Vector3(math.cos(a) * 11, 5.5, math.sin(a) * 11)), C.blanc, { matiere: Enum.Material.Marble, parent: m });
		}
		const coeur = bloc(new Vector3(3, 3, 3), c.add(new Vector3(0, 3, 0)), p.accent, { forme: "boule", neon: true, parent: m });
		lumiere(coeur, p.accent, 26);
		if (s === "foret") for (let i = 0; i < 5; i++) terrain.FillBall(c.add(new Vector3(math.cos(i) * 14, 1, math.sin(i) * 14)), 3, Enum.Material.LeafyGrass);
		return c.add(new Vector3(0, 0, 14));
	},
	camp: (c, m, p) => {
		for (let i = 0; i < 5; i++) {
			const a = (i / 5) * math.pi * 2;
			const pos = c.add(new Vector3(math.cos(a) * 12, 0, math.sin(a) * 12));
			const rot = CFrame.Angles(0, -a, 0);
			const tissu = p.tissus[i % p.tissus.size()];
			bloc(new Vector3(6, 5, 3), pos.add(new Vector3(0, 2.5, 1.5)), tissu, { forme: "coin", rotation: rot, matiere: Enum.Material.Fabric, parent: m });
			bloc(new Vector3(6, 5, 3), pos.add(new Vector3(0, 2.5, -1.5)), tissu, { forme: "coin", rotation: rot.mul(CFrame.Angles(0, math.pi, 0)), matiere: Enum.Material.Fabric, parent: m });
		}
		const feu = bloc(new Vector3(2, 0.6, 2), c.add(new Vector3(0, 0.3, 0)), rgb(255, 130, 50), { neon: true, parent: m });
		const f = new Instance("Fire");
		f.Size = 5;
		f.Parent = feu;
		lumiere(feu, rgb(255, 150, 70), 22);
		for (let i = 0; i < 6; i++) bloc(new Vector3(1.4, 0.6, 0.6), c.add(new Vector3(math.cos(i) * 2.4, 0.3, math.sin(i) * 2.4)), C.bois, { matiere: Enum.Material.Wood, rotation: CFrame.Angles(0, i, 0), parent: m });
		return c.add(new Vector3(0, 0, 8));
	},
	mine: (c, m, p) => {
		terrain.FillBall(c.add(new Vector3(0, -2, -10)), 16, Enum.Material.Rock);
		bloc(new Vector3(8, 8, 2), c.add(new Vector3(0, 4, 2)), rgb(15, 12, 15), { parent: m });
		for (const x of [-4.5, 4.5]) bloc(new Vector3(1, 9, 1), c.add(new Vector3(x, 4.5, 3)), C.bois, { matiere: Enum.Material.Wood, parent: m });
		bloc(new Vector3(10, 1, 1.2), c.add(new Vector3(0, 9, 3)), C.bois, { matiere: Enum.Material.Wood, parent: m });
		for (let i = 0; i < 6; i++) {
			const cr = bloc(new Vector3(1.2, 3 + (i % 3), 1.2), c.add(new Vector3(-10 + i * 4, 1.5, 6 + (i % 2) * 3)), p.accent, { neon: true, rotation: CFrame.Angles(0, i, math.rad(15 - i * 5)), parent: m });
			if (i % 3 === 0) lumiere(cr, p.accent, 12);
		}
		for (let i = 0; i < 3; i++) bloc(new Vector3(2.4, 1.6, 3.6), c.add(new Vector3(8 + i * 3, 0.8, 8)), C.bois, { matiere: Enum.Material.WoodPlanks, parent: m });
		return c.add(new Vector3(0, 0, 8));
	},
	ruines: (c, m, p) => {
		for (let i = 0; i < 9; i++) {
			const a = (i / 9) * math.pi * 2;
			const h = 4 + ((i * 7) % 9);
			bloc(new Vector3(2.4, h, 2.4), c.add(new Vector3(math.cos(a) * 14, h / 2, math.sin(a) * 14)), p.mur.Lerp(new Color3(1, 1, 1), 0.5), { matiere: Enum.Material.Limestone, rotation: CFrame.Angles(0, 0, math.rad((i % 3) * 6)), parent: m });
		}
		bloc(new Vector3(8, 1, 6), c.add(new Vector3(0, 0.5, 0)), rgb(30, 25, 25), { parent: m });
		for (let i = 0; i < 4; i++) bloc(new Vector3(6, 1, 1.5), c.add(new Vector3(0, -0.5 - i, 2 - i * 1.5)), p.mur, { matiere: Enum.Material.Limestone, parent: m });
		return c.add(new Vector3(0, 0, 8));
	},
	rochers: (c) => {
		for (let i = 0; i < 7; i++) rocher(c.add(new Vector3(math.cos(i * 0.9) * 18, 0, math.sin(i * 0.9) * 14)), 4 + (i % 3) * 2);
		for (let i = 0; i < 3; i++) terrain.FillBall(c.add(new Vector3(-20 + i * 20, 6, -18)), 10, Enum.Material.Rock);
		return c.add(new Vector3(0, 0, 10));
	},
	port: (c, m) => {
		bloc(new Vector3(8, 1, 40), c.add(new Vector3(0, 1, -10)), C.boisClair, { matiere: Enum.Material.WoodPlanks, parent: m });
		for (let i = 0; i < 6; i++) bloc(new Vector3(0.8, 6, 0.8), c.add(new Vector3(i % 2 === 0 ? -4 : 4, -1, -28 + i * 7)), C.bois, { matiere: Enum.Material.Wood, parent: m });
		// un navire à quai
		const navire = c.add(new Vector3(14, 0, -20));
		bloc(new Vector3(9, 4, 26), navire.add(new Vector3(0, 1.5, 0)), rgb(100, 70, 45), { matiere: Enum.Material.WoodPlanks, parent: m });
		bloc(new Vector3(9, 4, 6), navire.add(new Vector3(0, 1.5, -16)), rgb(100, 70, 45), { forme: "coin", rotation: CFrame.Angles(0, math.pi, 0), matiere: Enum.Material.WoodPlanks, parent: m });
		bloc(new Vector3(0.8, 22, 0.8), navire.add(new Vector3(0, 14, 0)), C.bois, { matiere: Enum.Material.Wood, parent: m });
		bloc(new Vector3(0.3, 12, 14), navire.add(new Vector3(0, 15, 0)), rgb(235, 230, 215), { matiere: Enum.Material.Fabric, parent: m });
		return c.add(new Vector3(0, 0, 10));
	},
	porte: (c, m, p) => {
		for (const x of [-7, 7]) bloc(new Vector3(4, 14, 4), c.add(new Vector3(x, 7, 0)), p.mur, { matiere: p.matMur, parent: m });
		bloc(new Vector3(18, 3, 4), c.add(new Vector3(0, 15.5, 0)), p.mur, { matiere: p.matMur, parent: m });
		for (const x of [-7, 7]) {
			const f = bloc(new Vector3(1, 1.4, 1), c.add(new Vector3(x, 10, 2.4)), rgb(255, 190, 110), { neon: true, parent: m });
			lumiere(f, rgb(255, 180, 100), 18);
		}
		return c.add(new Vector3(0, 0, 4));
	},
};

// ───────────────────────────── Région ─────────────────────────────

function vegetation(region: RegionDef, style: string, origine: Vector3, parent: Instance, libres: Vector3[]) {
	const graine = new Random(region.id.size() * 97);
	const libre = (p: Vector3) => !libres.some((x) => x.sub(p).Magnitude < 40);
	for (let i = 0; i < 160; i++) {
		const p = origine.add(new Vector3(graine.NextNumber(-500, 500), 0, graine.NextNumber(-380, 380)));
		if (!libre(p)) continue;
		const r = graine.NextNumber();
		if (style === "desert") {
			if (r < 0.25) {
				// palmier
				bloc(new Vector3(1, 10, 1), p.add(new Vector3(0, 5, 0)), rgb(130, 95, 60), { matiere: Enum.Material.Wood, rotation: CFrame.Angles(0, 0, math.rad(8)), parent });
				for (let k = 0; k < 5; k++) bloc(new Vector3(6, 0.3, 1.4), p.add(new Vector3(math.cos(k * 1.26) * 3, 10, math.sin(k * 1.26) * 3)), rgb(70, 130, 60), { matiere: Enum.Material.LeafyGrass, rotation: CFrame.Angles(0, -k * 1.26, math.rad(-20)), parent, collision: false });
			} else if (r < 0.55) rocher(p, graine.NextNumber(1.5, 4));
			else terrain.FillBall(p.add(new Vector3(0, -6, 0)), graine.NextNumber(10, 20), Enum.Material.Sand);
		} else if (style === "foret") {
			if (r < 0.6) arbre(p, parent, graine.NextNumber(1.2, 2), r < 0.3 ? C.feuillage : C.feuillage2);
			else if (r < 0.75) sapin(p, parent, graine.NextNumber(1, 1.6));
			else if (r < 0.9) buisson(p, graine.NextNumber(1.5, 3));
			else {
				// champignon lumineux
				bloc(new Vector3(0.6, 2, 0.6), p.add(new Vector3(0, 1, 0)), rgb(220, 210, 190), { parent });
				const chapeau = bloc(new Vector3(2.4, 1, 2.4), p.add(new Vector3(0, 2.2, 0)), rgb(120, 200, 255), { forme: "boule", neon: true, parent });
				nuit(chapeau);
			}
		} else if (style === "montagne") {
			if (r < 0.45) terrain.FillBall(p.add(new Vector3(0, graine.NextNumber(-4, 8), 0)), graine.NextNumber(12, 30), Enum.Material.Rock);
			else if (r < 0.7) sapin(p, parent, graine.NextNumber(0.9, 1.4));
			else rocher(p, graine.NextNumber(2, 5));
		} else if (style === "archipel") {
			if (r < 0.35) terrain.FillBall(p.add(new Vector3(0, -8, 0)), graine.NextNumber(14, 26), r < 0.2 ? Enum.Material.Sand : Enum.Material.Grass);
			else if (r < 0.5) rocher(p.add(new Vector3(0, -2, 0)), graine.NextNumber(2, 5));
		} else if (style === "rempart") {
			if (r < 0.3) sapin(p, parent, graine.NextNumber(0.9, 1.3));
			else if (r < 0.6) rocher(p, graine.NextNumber(1.5, 3.5));
			else if (r < 0.7) fleurs(p, parent);
		} else if (style === "cendres") {
			if (r < 0.4) {
				// aiguille d'obsidienne
				const h = graine.NextNumber(8, 30);
				bloc(new Vector3(3, h, 3), p.add(new Vector3(0, h / 2, 0)), rgb(25, 20, 30), { matiere: Enum.Material.Basalt, rotation: CFrame.Angles(math.rad(graine.NextNumber(-10, 10)), 0, math.rad(graine.NextNumber(-10, 10))), parent });
			} else if (r < 0.6) terrain.FillBall(p.add(new Vector3(0, -3, 0)), graine.NextNumber(4, 10), Enum.Material.CrackedLava);
			else rocher(p, graine.NextNumber(2, 4));
		}
	}
}

function preparerSol(style: string, origine: Vector3, p: Palette) {
	terrain.FillBlock(new CFrame(origine.add(new Vector3(0, -6, 0))), new Vector3(1300, 12, 1000), p.sol);
	// bordures : collines ou eau selon le style
	const graine = new Random(math.floor(origine.Magnitude));
	if (style === "archipel") {
		// la mer autour d'îles
		terrain.FillBlock(new CFrame(origine.add(new Vector3(0, -4, 0))), new Vector3(1300, 8, 1000), Enum.Material.Water);
		for (let i = 0; i < 10; i++) terrain.FillBall(origine.add(new Vector3(graine.NextNumber(-500, 500), -14, graine.NextNumber(-380, 380))), graine.NextNumber(40, 80), Enum.Material.Sand);
		terrain.FillBall(origine.add(new Vector3(0, -40, 0)), 120, Enum.Material.Grass);
	}
	for (let i = 0; i < 22; i++) {
		const a = graine.NextNumber(0, math.pi * 2);
		const r = graine.NextNumber(520, 640);
		const mat = style === "montagne" ? Enum.Material.Rock : style === "cendres" ? Enum.Material.Basalt : style === "foret" ? Enum.Material.LeafyGrass : p.sol2;
		terrain.FillBall(origine.add(new Vector3(math.cos(a) * r, style === "montagne" ? 10 : -10, math.sin(a) * r * 0.8)), graine.NextNumber(40, style === "montagne" ? 120 : 80), mat);
	}
}

function construireRegion(region: RegionDef, dossier: Folder) {
	const style = STYLES[region.id] ?? "desert";
	const p = PALETTES[style];
	const origine = ORIGINES[region.id];
	if (!origine || !p) return;
	preparerSol(style, origine, p);
	const libres: Vector3[] = [];
	const centreVille = region.villes && region.villes.size() > 0
		? origine.add(new Vector3((region.villes[0].position.x - 960) * 0.6, 0, (region.villes[0].position.y - 570) * 0.6))
		: origine;
	// le cœur de la ville est pavé
	terrain.FillCylinder(new CFrame(centreVille.add(new Vector3(0, -0.5, 0))), 1, 70, p.chemin);
	for (const l of region.lieux) {
		if (l.etape_seulement === true) {
			pcall(() => balise(l));
			continue;
		}
		const modele = new Instance("Model");
		modele.Name = l.id;
		modele.Parent = dossier;
		const centre = positionLieu(l);
		libres.push(centre);
		const g = genre(l);
		const [ok, porte] = pcall(() => (BATIMENTS[g] ?? BATIMENTS.maison)(centre, modele, p, style));
		const entree = ok ? (porte as Vector3) : centre;
		if (!ok) warn(`[Velmaris] Lieu ${l.id} : ${tostring(porte)}`);
		// chemin jusqu'au centre de la ville
		const d = centreVille.sub(entree);
		if (d.Magnitude > 4) {
			terrain.FillBlock(CFrame.lookAt(entree.add(d.div(2)), centreVille).add(new Vector3(0, -0.4, 0)), new Vector3(7, 1.2, d.Magnitude), p.chemin);
			libres.push(entree.add(d.div(2)));
		}
		// point d'entrée : invite « Entrer »
		const ancre = bloc(new Vector3(4, 6, 4), entree.add(new Vector3(0, 3, 0)), C.or, { parent: modele, nom: "Entree" });
		CollectionService.AddTag(ancre, "EntreeLieu");
		ancre.Transparency = 1;
		ancre.CanCollide = false;
		ancre.SetAttribute("Lieu", l.id);
		const invite = new Instance("ProximityPrompt");
		invite.ActionText = "Entrer";
		invite.ObjectText = l.nom;
		invite.SetAttribute("Action", "entrer");
		invite.HoldDuration = 0;
		invite.MaxActivationDistance = 14;
		invite.RequiresLineOfSight = false;
		invite.SetAttribute("Lieu", l.id);
		invite.Parent = ancre;
	}
	// quelques maisons sans lieu autour de la place, pour faire une vraie ville
	if (region.villes && region.villes.size() > 0) {
		const deco = new Instance("Model");
		deco.Name = `${region.id}-maisons`;
		deco.Parent = dossier;
		for (let i = 0; i < 10; i++) {
			const a = (i / 10) * math.pi * 2 + 0.2;
			const pos = centreVille.add(new Vector3(math.cos(a) * 95, 0, math.sin(a) * 75));
			if (libres.some((x) => x.sub(pos).Magnitude < 25)) continue;
			pcall(() => maisonStyle(pos, deco, p, style, 10 + (i % 3) * 2, 9, 7 + (i % 2) * 2));
		}
	}
	vegetation(region, style, origine, dossier, libres);
}

/** Construit toutes les régions sauf Aubeclaire (monde.ts). */
export function construireRegions() {
	const dossier = new Instance("Folder");
	dossier.Name = "Regions";
	dossier.Parent = Workspace.FindFirstChild("Velmaris") ?? Workspace;
	for (const [id, r] of pairs(CONTENU.regions)) {
		if (id === "aubeclaire") continue;
		const [ok, err] = pcall(() => construireRegion(r, dossier));
		if (!ok) warn(`[Velmaris] Région ${id} : ${tostring(err)}`);
	}
}
