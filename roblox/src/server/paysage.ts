/**
 * Paysage : relief, routes courbes qui suivent le terrain, réverbères, champs de blé, moulins à vent,
 * fermes, puits, charrettes, meules de foin, clôtures. Utilisé par Lysmont (monde.ts) et les régions.
 * Les ailes des moulins portent l'étiquette « AilesMoulin » : chaque joueur les fait tourner chez lui
 * (client/rendu/ambiance.ts), sans charger le serveur.
 */
import { CollectionService, Workspace } from "@rbxts/services";
import { bloc, C, lanterne, lumiere, nuit, toit, VERTICAL } from "./decor";

const terrain = Workspace.Terrain;
const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

/** Hauteur du terrain en (x, z) (0 s'il n'y a rien). */
export function hauteurSol(x: number, z: number): number {
	const params = new RaycastParams();
	params.FilterType = Enum.RaycastFilterType.Include;
	params.FilterDescendantsInstances = [terrain];
	const r = Workspace.Raycast(new Vector3(x, 400, z), new Vector3(0, -800, 0), params);
	return r ? r.Position.Y : 0;
}

/** Le même point, posé sur le terrain. */
export function auSol(p: Vector3): Vector3 {
	return new Vector3(p.X, hauteurSol(p.X, p.Z), p.Z);
}

/**
 * Plateau surélevé (terrain) : un rectangle plat de L × P à la hauteur h, entouré d'un talus en pente douce
 * de `talus` studs de large (marches d'environ 1,3 stud : on y monte à pied).
 */
export function plateforme(centre: Vector3, L: number, P: number, h: number, talus: number, matiere = Enum.Material.Grass) {
	const n = math.max(4, math.ceil(h / 1.3));
	for (let k = 1; k <= n; k++) {
		const haut = (h * k) / n;
		const marge = (talus * (n - k)) / n;
		terrain.FillBlock(new CFrame(centre.X, (haut - 14) / 2, centre.Z), new Vector3(L + 2 * marge, haut + 14, P + 2 * marge), matiere);
	}
}

/** Point d'une courbe de Bézier quadratique. */
function bezier(a: Vector3, c: Vector3, b: Vector3, t: number): Vector3 {
	const u = 1 - t;
	return a.mul(u * u).add(c.mul(2 * u * t)).add(b.mul(t * t));
}

/**
 * Route courbe de `de` à `a` : légèrement incurvée (courbure en proportion de la longueur, sens tiré au hasard),
 * posée sur le terrain (elle monte et descend avec lui). Renvoie les points de la route, au sol.
 */
export function routeCourbe(de: Vector3, a: Vector3, largeur: number, matiere: Enum.Material, graine: number, courbure = 0.16, pave?: Enum.Material): Vector3[] {
	const plat = (p: Vector3) => new Vector3(p.X, 0, p.Z);
	const A = plat(de);
	const B = plat(a);
	const d = B.sub(A);
	const longueur = d.Magnitude;
	if (longueur < 2) return [];
	const hasard = new Random(graine);
	const normale = new Vector3(-d.Z, 0, d.X).Unit;
	const controle = A.add(B).div(2).add(normale.mul(hasard.NextNumber(-1, 1) * courbure * longueur));
	const n = math.max(2, math.ceil(longueur / 5));
	const points: Vector3[] = [];
	for (let i = 0; i <= n; i++) points.push(auSol(bezier(A, controle, B, i / n)));
	for (let i = 0; i < n; i++) {
		const p0 = points[i];
		const p1 = points[i + 1];
		const seg = p1.sub(p0);
		if (seg.Magnitude < 0.1) continue;
		const milieu = p0.add(p1).div(2);
		const cf = CFrame.lookAt(milieu, p1).add(new Vector3(0, -0.45, 0));
		terrain.FillBlock(cf, new Vector3(largeur, 1.4, seg.Magnitude + 1.4), matiere);
		if (pave) terrain.FillBlock(cf.add(new Vector3(0, 0.05, 0)), new Vector3(largeur * 0.55, 1.4, seg.Magnitude + 1.4), pave);
	}
	return points;
}

/** Réverbères le long d'une route, en alternant les côtés. */
export function reverberes(points: Vector3[], largeur: number, parent: Instance, ecart = 48) {
	let cumul = 0;
	let cote = 1;
	for (let i = 1; i < points.size(); i++) {
		const seg = points[i].sub(points[i - 1]);
		cumul += seg.Magnitude;
		if (cumul < ecart) continue;
		cumul = 0;
		const d = new Vector3(seg.X, 0, seg.Z);
		if (d.Magnitude < 0.1) continue;
		const normale = new Vector3(-d.Z, 0, d.X).Unit;
		lanterne(auSol(points[i].add(normale.mul(cote * (largeur / 2 + 2.5)))), parent);
		cote = -cote;
	}
}

/** Champ de blé : terre labourée, rangées d'épis dorés (on les traverse), bordure de clôture. */
export function champ(centre: Vector3, l: number, p: number, angle: number, parent: Instance, mur = false) {
	const repere = new CFrame(auSol(centre)).mul(CFrame.Angles(0, angle, 0));
	const ici = (x: number, y: number, z: number) => repere.mul(new CFrame(x, y, z));
	const terre = bloc(new Vector3(l, 0.6, p), Vector3.zero, rgb(110, 84, 58), { parent, matiere: Enum.Material.Ground });
	terre.CFrame = ici(0, 0.2, 0);
	const ble = mur ? rgb(214, 176, 86) : rgb(198, 170, 80);
	for (let x = -l / 2 + 2; x <= l / 2 - 2; x += 3) {
		const rang = bloc(new Vector3(1.1, 2.6, p - 3), Vector3.zero, ble, { parent, matiere: Enum.Material.Grass, collision: false });
		rang.CFrame = ici(x, 1.6, 0);
		rang.CastShadow = false;
	}
	// clôture : piquets et lisses
	const piquet = (x: number, z: number) => {
		const b = bloc(new Vector3(0.5, 3, 0.5), Vector3.zero, C.bois, { parent, matiere: Enum.Material.Wood });
		b.CFrame = ici(x, 1.5, z);
	};
	for (let x = -l / 2; x <= l / 2; x += 8) for (const z of [-p / 2 - 1, p / 2 + 1]) piquet(x, z);
	for (const z of [-p / 2 - 1, p / 2 + 1]) {
		const lisse = bloc(new Vector3(l, 0.3, 0.3), Vector3.zero, C.boisClair, { parent, matiere: Enum.Material.Wood });
		lisse.CFrame = ici(0, 2.2, z);
	}
}

/** Meule de foin. */
export function meule(base: Vector3, parent: Instance) {
	const p = auSol(base);
	bloc(new Vector3(4, 5, 5), p.add(new Vector3(0, 2, 0)), rgb(214, 186, 100), { parent, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Grass });
	bloc(new Vector3(3.6, 3.6, 3.6), p.add(new Vector3(0, 4.2, 0)), rgb(200, 172, 92), { parent, forme: "boule", matiere: Enum.Material.Grass });
}

/** Charrette à bras, chargée de sacs. */
export function charrette(base: Vector3, angle: number, parent: Instance) {
	const f = new CFrame(auSol(base)).mul(CFrame.Angles(0, angle, 0));
	const poser = (taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material, forme?: "cylindre") => {
		const b = bloc(taille, Vector3.zero, couleur, { parent, matiere, forme, rotation: forme === "cylindre" ? new CFrame() : undefined });
		b.CFrame = f.mul(cf);
	};
	poser(new Vector3(5, 0.6, 3.4), new CFrame(0, 2.2, 0), C.boisClair, Enum.Material.WoodPlanks);
	for (const z of [-1.6, 1.6]) poser(new Vector3(5, 1.2, 0.3), new CFrame(0, 3, z), C.bois, Enum.Material.WoodPlanks);
	for (const z of [-1.9, 1.9]) poser(new Vector3(0.4, 3, 3), new CFrame(0, 1.5, z).mul(CFrame.Angles(0, math.rad(90), 0)), C.bois, Enum.Material.Wood, "cylindre");
	for (const z of [-0.8, 0.8]) poser(new Vector3(4, 0.3, 0.3), new CFrame(4.2, 2, z), C.bois, Enum.Material.Wood);
	for (let i = 0; i < 3; i++) poser(new Vector3(1.4, 1.6, 1.2), new CFrame(-1.4 + i * 1.4, 3.2, 0), rgb(225, 215, 190), Enum.Material.Fabric);
}

/** Puits de pierre avec toit et seau. */
export function puits(base: Vector3, parent: Instance) {
	const p = auSol(base);
	bloc(new Vector3(3, 6, 6), p.add(new Vector3(0, 1.5, 0)), C.pierre, { parent, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Cobblestone });
	bloc(new Vector3(0.4, 4.6, 4.6), p.add(new Vector3(0, 2.9, 0)), C.eau, { parent, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Glass });
	for (const x of [-2.6, 2.6]) bloc(new Vector3(0.5, 6, 0.5), p.add(new Vector3(x, 4.5, 0)), C.bois, { parent, matiere: Enum.Material.Wood });
	bloc(new Vector3(6, 0.4, 0.4), p.add(new Vector3(0, 6.6, 0)), C.bois, { parent, matiere: Enum.Material.Wood });
	toit(p.add(new Vector3(0, 7.4, 0)), 7, 5, 2, C.toitRouge, parent);
	bloc(new Vector3(0.9, 1, 0.9), p.add(new Vector3(0, 4.6, 0)), C.boisClair, { parent, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.WoodPlanks });
}

/** Épouvantail au milieu d'un champ. */
export function epouvantail(base: Vector3, parent: Instance) {
	const p = auSol(base);
	bloc(new Vector3(0.4, 6, 0.4), p.add(new Vector3(0, 3, 0)), C.bois, { parent, matiere: Enum.Material.Wood });
	bloc(new Vector3(4, 0.4, 0.4), p.add(new Vector3(0, 4.6, 0)), C.bois, { parent, matiere: Enum.Material.Wood });
	bloc(new Vector3(2, 2.4, 1), p.add(new Vector3(0, 4.2, 0)), rgb(120, 60, 50), { parent, matiere: Enum.Material.Fabric });
	bloc(new Vector3(1.3, 1.3, 1.3), p.add(new Vector3(0, 6.2, 0)), rgb(210, 180, 110), { parent, forme: "boule", matiere: Enum.Material.Fabric });
	bloc(new Vector3(2.4, 0.3, 2.4), p.add(new Vector3(0, 6.9, 0)), rgb(170, 140, 70), { parent, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Grass });
}

/**
 * Moulin à vent : tour de pierre qui s'affine, toit conique, porte, et quatre ailes de toile tournées vers `vent`.
 * Les ailes sont un modèle à part (étiquette « AilesMoulin ») que les joueurs font tourner autour de son pivot.
 */
export function moulin(base: Vector3, vent: Vector3, parent: Instance) {
	const p = auSol(base);
	const m = new Instance("Model");
	m.Name = "Moulin";
	m.Parent = parent;
	const etages = [
		[13, 16],
		[11.5, 14],
		[10, 12],
	] as const;
	let y = 0;
	for (const [d, h] of etages) {
		bloc(new Vector3(h, d, d), p.add(new Vector3(0, y + h / 2, 0)), C.pierreClaire, { parent: m, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Cobblestone });
		bloc(new Vector3(0.8, d + 0.6, d + 0.6), p.add(new Vector3(0, y + h, 0)), C.bois, { parent: m, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Wood });
		y += h;
	}
	// toit conique
	for (let i = 0; i < 6; i++) {
		const r = 6 - i;
		bloc(new Vector3(1.2, r * 2, r * 2), p.add(new Vector3(0, y + 0.6 + i * 1.1, 0)), C.toitRouge, { parent: m, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.ClayRoofTiles });
	}
	const dir = new Vector3(vent.X, 0, vent.Z).Unit;
	// porte et fenêtre éclairée, côté vent
	const porte = bloc(new Vector3(3, 5, 0.6), Vector3.zero, C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
	porte.CFrame = CFrame.lookAt(p.add(dir.mul(6.4)).add(new Vector3(0, 2.5, 0)), p.add(dir.mul(20)).add(new Vector3(0, 2.5, 0)));
	const fenetre = bloc(new Vector3(1.6, 2, 0.4), Vector3.zero, C.vitre, { parent: m, neon: true });
	fenetre.CFrame = CFrame.lookAt(p.add(dir.mul(5.6)).add(new Vector3(0, 22, 0)), p.add(dir.mul(20)).add(new Vector3(0, 22, 0)));
	nuit(fenetre);
	// ailes : moyeu face au vent, quatre bras avec leurs toiles
	const ailes = new Instance("Model");
	ailes.Name = "Ailes";
	ailes.Parent = m;
	const moyeuPos = p.add(new Vector3(0, y - 4, 0)).add(dir.mul(7));
	const moyeu = CFrame.lookAt(moyeuPos, moyeuPos.add(dir));
	const centre = bloc(new Vector3(1.6, 1.6, 2), Vector3.zero, C.bois, { parent: ailes, matiere: Enum.Material.Wood, nom: "Moyeu" });
	centre.CFrame = moyeu;
	ailes.PrimaryPart = centre;
	for (let k = 0; k < 4; k++) {
		const rot = moyeu.mul(CFrame.Angles(0, 0, (k * math.pi) / 2));
		const bras = bloc(new Vector3(0.5, 17, 0.5), Vector3.zero, C.bois, { parent: ailes, matiere: Enum.Material.Wood, collision: false });
		bras.CFrame = rot.mul(new CFrame(0, 8.5, -0.6));
		const toile = bloc(new Vector3(3.4, 12, 0.15), Vector3.zero, rgb(235, 228, 205), { parent: ailes, matiere: Enum.Material.Fabric, collision: false });
		toile.CFrame = rot.mul(new CFrame(1.9, 10, -0.6));
	}
	ailes.WorldPivot = moyeu;
	CollectionService.AddTag(ailes, "AilesMoulin");
	lumiere(fenetre, C.vitre, 14);
	return m;
}

/** Clôture droite (piquets et deux lisses) entre deux points au sol. */
export function cloture(de: Vector3, a: Vector3, parent: Instance) {
	const A = auSol(de);
	const B = auSol(a);
	const d = B.sub(A);
	const n = math.max(1, math.floor(d.Magnitude / 6));
	for (let i = 0; i <= n; i++) bloc(new Vector3(0.5, 3, 0.5), A.add(d.mul(i / n)).add(new Vector3(0, 1.5, 0)), C.bois, { parent, matiere: Enum.Material.Wood });
	for (const y of [1.2, 2.4]) {
		const l = bloc(new Vector3(0.3, 0.3, d.Magnitude), Vector3.zero, C.boisClair, { parent, matiere: Enum.Material.Wood });
		l.CFrame = CFrame.lookAt(A.add(d.div(2)).add(new Vector3(0, y, 0)), B.add(new Vector3(0, y, 0)));
	}
}
