/**
 * Briques de décor partagées par le monde, les intérieurs et la ville vivante (serveur) :
 * pièces, toits, maisons à colombages, arbres, lanternes, tonneaux, bannières…
 * Les pièces lumineuses portent l'attribut « Nuit » : vie.ts les allume la nuit et les éteint le jour.
 */
import { Workspace } from "@rbxts/services";

export const C = {
	pierre: Color3.fromRGB(150, 146, 140),
	pierreClaire: Color3.fromRGB(196, 190, 178),
	pierreSombre: Color3.fromRGB(70, 66, 72),
	blanc: Color3.fromRGB(235, 230, 218),
	enduit: Color3.fromRGB(228, 214, 186),
	bois: Color3.fromRGB(110, 76, 46),
	boisClair: Color3.fromRGB(150, 110, 70),
	toitRouge: Color3.fromRGB(140, 62, 48),
	toitBleu: Color3.fromRGB(58, 84, 150),
	ardoise: Color3.fromRGB(70, 72, 82),
	or: Color3.fromRGB(217, 164, 65),
	feuillage: Color3.fromRGB(62, 110, 54),
	feuillage2: Color3.fromRGB(86, 130, 60),
	eau: Color3.fromRGB(80, 140, 200),
	vitre: Color3.fromRGB(255, 214, 140),
};

let dossier: Instance = Workspace;
/** Dossier où sont rangées les pièces quand on ne précise pas de parent. */
export function dossierParDefaut(d: Instance) {
	dossier = d;
}

export function bloc(
	taille: Vector3,
	position: Vector3,
	couleur: Color3,
	options: { matiere?: Enum.Material; forme?: "bloc" | "coin" | "cylindre" | "boule"; rotation?: CFrame; parent?: Instance; nom?: string; neon?: boolean } = {},
): BasePart {
	let p: BasePart;
	if (options.forme === "coin") p = new Instance("WedgePart");
	else {
		const part = new Instance("Part");
		if (options.forme === "cylindre") part.Shape = Enum.PartType.Cylinder;
		if (options.forme === "boule") part.Shape = Enum.PartType.Ball;
		p = part;
	}
	p.Anchored = true;
	p.Size = taille;
	p.CFrame = new CFrame(position).mul(options.rotation ?? new CFrame());
	p.Color = couleur;
	p.Material = options.neon ? Enum.Material.Neon : options.matiere ?? Enum.Material.SmoothPlastic;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	if (options.nom !== undefined) p.Name = options.nom;
	p.Parent = options.parent ?? dossier;
	return p;
}

export const VERTICAL = CFrame.Angles(0, 0, math.rad(90));

export function lumiere(p: BasePart, couleur = Color3.fromRGB(255, 190, 120), portee = 18) {
	const l = new Instance("PointLight");
	l.Color = couleur;
	l.Range = portee;
	l.Brightness = 1.6;
	l.Shadows = true;
	l.Parent = p;
	// allumée la nuit, éteinte le jour (cycle géré par vie.ts)
	p.SetAttribute("Nuit", true);
}

// ───────────────────────────── Éléments de décor ─────────────────────────────

/** Toit à deux pans (le faîte suit l'axe Z). */
export function toit(centre: Vector3, largeur: number, profondeur: number, hauteur: number, couleur: Color3, parent: Instance) {
	const demi = largeur / 2;
	// un coin (WedgePart) est haut du côté +Z local : on tourne chaque pan pour que le côté haut soit au faîte
	bloc(new Vector3(profondeur, hauteur, demi), centre.add(new Vector3(-demi / 2, hauteur / 2, 0)), couleur, { forme: "coin", rotation: CFrame.Angles(0, math.rad(90), 0), matiere: Enum.Material.Slate, parent });
	bloc(new Vector3(profondeur, hauteur, demi), centre.add(new Vector3(demi / 2, hauteur / 2, 0)), couleur, { forme: "coin", rotation: CFrame.Angles(0, math.rad(-90), 0), matiere: Enum.Material.Slate, parent });
}

/** Maison à colombages : soubassement de pierre, murs enduits, poutres, fenêtres éclairées, porte, cheminée. */
export function maison(base: Vector3, l: number, p: number, h: number, couleurToit: Color3, parent: Instance, options: { murs?: Color3; cheminee?: boolean } = {}) {
	const murs = options.murs ?? C.enduit;
	bloc(new Vector3(l + 0.6, 1.6, p + 0.6), base.add(new Vector3(0, 0.8, 0)), C.pierre, { matiere: Enum.Material.Cobblestone, parent });
	bloc(new Vector3(l, h - 1.6, p), base.add(new Vector3(0, 1.6 + (h - 1.6) / 2, 0)), murs, { matiere: Enum.Material.Plaster, parent });
	// colombages : poteaux d'angle et poutres horizontales
	for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) bloc(new Vector3(0.7, h, 0.7), base.add(new Vector3((x * l) / 2, h / 2, (z * p) / 2)), C.bois, { matiere: Enum.Material.Wood, parent });
	for (const y of [1.6, h * 0.55 + 0.8, h]) {
		bloc(new Vector3(l + 0.2, 0.5, 0.3), base.add(new Vector3(0, y, p / 2 + 0.05)), C.bois, { matiere: Enum.Material.Wood, parent });
		bloc(new Vector3(l + 0.2, 0.5, 0.3), base.add(new Vector3(0, y, -p / 2 - 0.05)), C.bois, { matiere: Enum.Material.Wood, parent });
	}
	// porte et fenêtres (façade +Z)
	bloc(new Vector3(2.6, 4.2, 0.4), base.add(new Vector3(0, 2.1 + 0.4, p / 2 + 0.2)), C.bois, { matiere: Enum.Material.WoodPlanks, parent });
	for (const x of [-l / 3, l / 3]) {
		const f = bloc(new Vector3(1.8, 1.8, 0.3), base.add(new Vector3(x, h * 0.55 + 2.4, p / 2 + 0.2)), C.vitre, { neon: true, parent });
		f.SetAttribute("Nuit", true);
		if (x > 0) lumiere(f, C.vitre, 10);
		bloc(new Vector3(2.2, 0.3, 0.5), base.add(new Vector3(x, h * 0.55 + 1.35, p / 2 + 0.3)), C.bois, { matiere: Enum.Material.Wood, parent });
	}
	toit(base.add(new Vector3(0, h, 0)), l + 2.4, p + 2.4, l * 0.42, couleurToit, parent);
	if (options.cheminee !== false) {
		const ch = bloc(new Vector3(1.6, 5, 1.6), base.add(new Vector3(l / 4, h + l * 0.3, -p / 4)), C.pierreSombre, { matiere: Enum.Material.Brick, parent });
		const fumee = new Instance("Smoke");
		fumee.Size = 3;
		fumee.RiseVelocity = 3;
		fumee.Opacity = 0.08;
		fumee.Color = Color3.fromRGB(200, 200, 200);
		fumee.Parent = ch;
	}
}

export function arbre(base: Vector3, parent: Instance, taille = 1, couleur = C.feuillage) {
	bloc(new Vector3(1.4 * taille, 9 * taille, 1.4 * taille), base.add(new Vector3(0, 4.5 * taille, 0)), C.bois, { matiere: Enum.Material.Wood, parent });
	bloc(new Vector3(9, 8, 9).mul(taille), base.add(new Vector3(0, 10 * taille, 0)), couleur, { forme: "boule", matiere: Enum.Material.Grass, parent });
	bloc(new Vector3(6, 6, 6).mul(taille), base.add(new Vector3(1.5 * taille, 13 * taille, 1 * taille)), couleur.Lerp(new Color3(1, 1, 1), 0.08), { forme: "boule", matiere: Enum.Material.Grass, parent });
}

export function sapin(base: Vector3, parent: Instance, taille = 1) {
	bloc(new Vector3(1.2, 4, 1.2).mul(taille), base.add(new Vector3(0, 2 * taille, 0)), C.bois, { matiere: Enum.Material.Wood, parent });
	for (let i = 0; i < 3; i++) {
		const r = (6 - i * 1.6) * taille;
		bloc(new Vector3(3 * taille, r, r), base.add(new Vector3(0, (4 + i * 3) * taille, 0)), Color3.fromRGB(40, 90, 50), { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Grass, parent });
	}
}

export function lanterne(base: Vector3, parent: Instance) {
	bloc(new Vector3(0.5, 9, 0.5), base.add(new Vector3(0, 4.5, 0)), C.pierreSombre, { matiere: Enum.Material.Metal, parent });
	bloc(new Vector3(2, 0.3, 0.3), base.add(new Vector3(0.8, 8.8, 0)), C.pierreSombre, { matiere: Enum.Material.Metal, parent });
	const flamme = bloc(new Vector3(1, 1.2, 1), base.add(new Vector3(1.6, 8, 0)), Color3.fromRGB(255, 200, 110), { neon: true, parent });
	lumiere(flamme, Color3.fromRGB(255, 190, 110), 22);
}

export function tour(base: Vector3, rayon: number, hauteur: number, parent: Instance) {
	bloc(new Vector3(hauteur, rayon * 2, rayon * 2), base.add(new Vector3(0, hauteur / 2, 0)), C.pierreClaire, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Cobblestone, parent });
	for (let i = 0; i < 8; i++) {
		const a = (i / 8) * 2 * math.pi;
		bloc(new Vector3(1.2, 1.6, 1.2), base.add(new Vector3(math.cos(a) * (rayon - 0.4), hauteur + 0.8, math.sin(a) * (rayon - 0.4))), C.pierreClaire, { matiere: Enum.Material.Cobblestone, parent });
	}
	bloc(new Vector3(rayon * 1.6, rayon * 2.2, rayon * 1.6), base.add(new Vector3(0, hauteur + rayon * 1.2, 0)), C.toitBleu, { forme: "boule", matiere: Enum.Material.Slate, parent });
}

export function tonneau(base: Vector3, parent: Instance) {
	bloc(new Vector3(2.6, 2, 2), base.add(new Vector3(0, 1.3, 0)), C.boisClair, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.WoodPlanks, parent });
}

export function banniere(base: Vector3, couleur: Color3, parent: Instance) {
	bloc(new Vector3(0.3, 8, 0.3), base.add(new Vector3(0, 4, 0)), C.bois, { matiere: Enum.Material.Wood, parent });
	bloc(new Vector3(2.4, 3.6, 0.1), base.add(new Vector3(0, 6, 0.2)), couleur, { matiere: Enum.Material.Fabric, parent });
}

