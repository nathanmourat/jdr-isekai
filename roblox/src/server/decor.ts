/**
 * Briques de décor partagées par le monde, les intérieurs et la ville vivante (serveur) :
 * pièces, toits, maisons à colombages, arbres, buissons, rochers, fleurs, lanternes, tonneaux, bannières…
 * Les pièces lumineuses portent l'attribut « Nuit » : vie.ts les allume la nuit et les éteint le jour.
 *
 * Optimisation : les petites pièces ne projettent pas d'ombre, aucune pièce de décor ne déclenche de contact,
 * les lumières n'ont d'ombres que si on le demande, et le feuillage est fait en terrain Roblox (voxels),
 * bien moins coûteux que des centaines de pièces.
 */
import { CollectionService, Workspace } from "@rbxts/services";

export const C = {
	pierre: Color3.fromRGB(150, 146, 140),
	pierreClaire: Color3.fromRGB(196, 190, 178),
	pierreSombre: Color3.fromRGB(70, 66, 72),
	blanc: Color3.fromRGB(235, 230, 218),
	enduit: Color3.fromRGB(228, 214, 186),
	bois: Color3.fromRGB(96, 64, 40),
	boisClair: Color3.fromRGB(150, 110, 70),
	toitRouge: Color3.fromRGB(150, 70, 52),
	toitBleu: Color3.fromRGB(64, 88, 140),
	ardoise: Color3.fromRGB(72, 74, 86),
	or: Color3.fromRGB(217, 164, 65),
	feuillage: Color3.fromRGB(62, 110, 54),
	feuillage2: Color3.fromRGB(86, 130, 60),
	eau: Color3.fromRGB(80, 140, 200),
	vitre: Color3.fromRGB(255, 214, 140),
	volet: Color3.fromRGB(58, 92, 70),
	volet2: Color3.fromRGB(64, 80, 120),
};

const terrain = Workspace.Terrain;
let dossier: Instance = Workspace;
/** Dossier où sont rangées les pièces quand on ne précise pas de parent. */
export function dossierParDefaut(d: Instance) {
	dossier = d;
}

export function bloc(
	taille: Vector3,
	position: Vector3,
	couleur: Color3,
	options: { matiere?: Enum.Material; forme?: "bloc" | "coin" | "cylindre" | "boule"; rotation?: CFrame; parent?: Instance; nom?: string; neon?: boolean; collision?: boolean } = {},
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
	// optimisation : pas d'ombre pour les petites pièces, pas d'événement de contact pour le décor
	const grand = math.max(taille.X, taille.Y, taille.Z);
	p.CastShadow = grand > 3 && !options.neon;
	p.CanTouch = false;
	if (options.collision === false || grand < 0.8) p.CanCollide = false;
	if (options.nom !== undefined) p.Name = options.nom;
	p.Parent = options.parent ?? dossier;
	return p;
}

export const VERTICAL = CFrame.Angles(0, 0, math.rad(90));

/** Lumière de nuit. Les ombres de lumière coûtent cher : seulement si `ombres` est demandé. */
export function lumiere(p: BasePart, couleur = Color3.fromRGB(255, 190, 120), portee = 18, ombres = false) {
	const l = new Instance("PointLight");
	l.Color = couleur;
	l.Range = portee;
	l.Brightness = 1.5;
	l.Shadows = ombres;
	l.Parent = p;
	// allumée la nuit, éteinte le jour (cycle géré par vie.ts)
	nuit(p);
}

/** Marque une pièce qui s'allume la nuit (fenêtre, flamme). */
export function nuit(p: BasePart) {
	p.SetAttribute("Nuit", true);
	CollectionService.AddTag(p, "Nuit");
}

/** Petit nombre stable tiré d'une position (variantes de décor sans hasard). */
function variante(v: Vector3, n: number): number {
	return math.abs(math.floor(v.X * 7.3 + v.Z * 3.1)) % n;
}

// ───────────────────────────── Toits et maisons ─────────────────────────────

/** Toit à deux pans (le faîte suit l'axe Z), en tuiles, avec faîtière et rives. */
export function toit(centre: Vector3, largeur: number, profondeur: number, hauteur: number, couleur: Color3, parent: Instance) {
	const demi = largeur / 2;
	const tuiles = couleur === C.ardoise || couleur === C.pierreSombre ? Enum.Material.Slate : couleur === C.or ? Enum.Material.Metal : Enum.Material.ClayRoofTiles;
	// un coin (WedgePart) est haut du côté +Z local : on tourne chaque pan pour que le côté haut soit au faîte
	bloc(new Vector3(profondeur, hauteur, demi), centre.add(new Vector3(-demi / 2, hauteur / 2, 0)), couleur, { forme: "coin", rotation: CFrame.Angles(0, math.rad(90), 0), matiere: tuiles, parent });
	bloc(new Vector3(profondeur, hauteur, demi), centre.add(new Vector3(demi / 2, hauteur / 2, 0)), couleur, { forme: "coin", rotation: CFrame.Angles(0, math.rad(-90), 0), matiere: tuiles, parent });
	// faîtière (poutre au sommet) et rives en bois sous le bord du toit
	const sombre = couleur.Lerp(new Color3(0, 0, 0), 0.35);
	bloc(new Vector3(0.7, 0.7, profondeur + 0.4), centre.add(new Vector3(0, hauteur + 0.1, 0)), sombre, { matiere: tuiles, parent });
	for (const x of [-1, 1]) bloc(new Vector3(0.4, 0.4, profondeur + 0.2), centre.add(new Vector3(x * (demi - 0.1), 0.05, 0)), C.bois, { matiere: Enum.Material.Wood, parent });
}

/** Fenêtre : vitre éclairée la nuit, encadrement, volets ouverts et jardinière fleurie. */
function fenetre(centre: Vector3, rotation: CFrame, parent: Instance, couleurVolet: Color3, fleurs: boolean, avecLumiere: boolean) {
	const ici = (x: number, y: number, z: number) => new CFrame(centre).mul(rotation).mul(new CFrame(x, y, z));
	const vitre = bloc(new Vector3(1.8, 1.8, 0.2), Vector3.zero, C.vitre, { neon: true, parent });
	vitre.CFrame = ici(0, 0, 0);
	nuit(vitre);
	if (avecLumiere) lumiere(vitre, C.vitre, 12);
	// croisillons
	const croix1 = bloc(new Vector3(0.14, 1.8, 0.26), Vector3.zero, C.bois, { matiere: Enum.Material.Wood, parent });
	croix1.CFrame = ici(0, 0, 0.02);
	const croix2 = bloc(new Vector3(1.8, 0.14, 0.26), Vector3.zero, C.bois, { matiere: Enum.Material.Wood, parent });
	croix2.CFrame = ici(0, 0, 0.02);
	// encadrement
	for (const [w, h, x, y] of [[2.3, 0.25, 0, 1], [2.3, 0.3, 0, -1.02], [0.25, 2.1, -1.05, 0], [0.25, 2.1, 1.05, 0]] as const) {
		const b = bloc(new Vector3(w, h, 0.36), Vector3.zero, C.bois, { matiere: Enum.Material.Wood, parent });
		b.CFrame = ici(x, y, 0.05);
	}
	// volets ouverts, de part et d'autre
	for (const cote of [-1, 1]) {
		const v = bloc(new Vector3(0.95, 1.95, 0.14), Vector3.zero, couleurVolet, { matiere: Enum.Material.WoodPlanks, parent });
		v.CFrame = ici(cote * 1.65, 0, 0.12);
	}
	if (fleurs) {
		const bac = bloc(new Vector3(2.1, 0.45, 0.55), Vector3.zero, C.boisClair, { matiere: Enum.Material.WoodPlanks, parent });
		bac.CFrame = ici(0, -1.35, 0.38);
		const couleurs = [Color3.fromRGB(220, 60, 70), Color3.fromRGB(250, 210, 80), Color3.fromRGB(240, 240, 240), Color3.fromRGB(170, 90, 200)];
		for (let i = 0; i < 4; i++) {
			const f = bloc(new Vector3(0.38, 0.38, 0.38), Vector3.zero, couleurs[(i + variante(centre, 4)) % 4], { forme: "boule", parent, collision: false });
			f.CFrame = ici(-0.72 + i * 0.48, -1.0, 0.4);
			const feuille = bloc(new Vector3(0.5, 0.25, 0.4), Vector3.zero, C.feuillage2, { matiere: Enum.Material.LeafyGrass, parent, collision: false });
			feuille.CFrame = ici(-0.72 + i * 0.48, -1.12, 0.38);
		}
	}
}

/** Maison à colombages : soubassement de pierre, murs enduits, colombages croisés, fenêtres à volets, porte, cheminée. */
export function maison(base: Vector3, l: number, p: number, h: number, couleurToit: Color3, parent: Instance, options: { murs?: Color3; cheminee?: boolean } = {}) {
	const murs = options.murs ?? C.enduit;
	const v = variante(base, 2);
	const volet = v === 0 ? C.volet : C.volet2;
	bloc(new Vector3(l + 0.6, 1.6, p + 0.6), base.add(new Vector3(0, 0.8, 0)), C.pierre, { matiere: Enum.Material.Cobblestone, parent });
	bloc(new Vector3(l, h - 1.6, p), base.add(new Vector3(0, 1.6 + (h - 1.6) / 2, 0)), murs, { matiere: Enum.Material.Plaster, parent });
	// colombages : poteaux d'angle, poutres horizontales, croix de Saint-André sur les façades avant et arrière
	for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) bloc(new Vector3(0.7, h, 0.7), base.add(new Vector3((x * l) / 2, h / 2, (z * p) / 2)), C.bois, { matiere: Enum.Material.Wood, parent });
	const etage = h * 0.55 + 0.8;
	for (const y of [1.6, etage, h]) {
		for (const z of [p / 2 + 0.05, -p / 2 - 0.05]) bloc(new Vector3(l + 0.2, 0.5, 0.3), base.add(new Vector3(0, y, z)), C.bois, { matiere: Enum.Material.Wood, parent });
		for (const x of [l / 2 + 0.05, -l / 2 - 0.05]) bloc(new Vector3(0.3, 0.5, p + 0.2), base.add(new Vector3(x, y, 0)), C.bois, { matiere: Enum.Material.Wood, parent });
	}
	const hautEtage = h - etage;
	const diag = math.sqrt((l / 4) ** 2 + hautEtage ** 2);
	const angle = math.atan2(hautEtage, l / 4);
	for (const z of [p / 2 + 0.08, -p / 2 - 0.08]) {
		for (const [x, signe] of [[-l * 0.375, 1], [l * 0.375, -1]] as const) {
			bloc(new Vector3(diag, 0.35, 0.25), base.add(new Vector3(x, etage + hautEtage / 2, z)), C.bois, { matiere: Enum.Material.Wood, rotation: CFrame.Angles(0, 0, signe * angle), parent });
		}
	}
	// porte (façade +Z) avec encadrement, linteau, marche et heurtoir
	const zp = p / 2;
	bloc(new Vector3(2.6, 4.2, 0.4), base.add(new Vector3(0, 2.5, zp + 0.2)), C.bois, { matiere: Enum.Material.WoodPlanks, parent });
	for (const x of [-1.5, 1.5]) bloc(new Vector3(0.45, 4.6, 0.55), base.add(new Vector3(x, 2.7, zp + 0.22)), C.pierreClaire, { matiere: Enum.Material.Limestone, parent });
	bloc(new Vector3(3.5, 0.6, 0.6), base.add(new Vector3(0, 5.1, zp + 0.24)), C.pierreClaire, { matiere: Enum.Material.Limestone, parent });
	bloc(new Vector3(3.6, 0.4, 1.4), base.add(new Vector3(0, 0.2, zp + 0.9)), C.pierre, { matiere: Enum.Material.Cobblestone, parent });
	bloc(new Vector3(0.3, 0.3, 0.2), base.add(new Vector3(0.7, 2.6, zp + 0.45)), C.or, { matiere: Enum.Material.Metal, forme: "boule", parent });
	// fenêtres de l'étage (façade) et des côtés
	for (const x of [-l / 3, l / 3]) fenetre(base.add(new Vector3(x, etage + 1.6, zp + 0.2)), new CFrame(), parent, volet, true, x > 0);
	if (p >= 9) {
		for (const cote of [-1, 1]) fenetre(base.add(new Vector3(cote * (l / 2 + 0.2), 3.2, 0)), CFrame.Angles(0, (cote * math.pi) / 2, 0), parent, volet, false, false);
	}
	toit(base.add(new Vector3(0, h, 0)), l + 2.4, p + 2.4, l * 0.42, couleurToit, parent);
	if (options.cheminee !== false) {
		const haut = h + l * 0.3;
		const ch = bloc(new Vector3(1.6, 5, 1.6), base.add(new Vector3(l / 4, haut, -p / 4)), C.pierreSombre, { matiere: Enum.Material.Brick, parent });
		bloc(new Vector3(2, 0.4, 2), base.add(new Vector3(l / 4, haut + 2.6, -p / 4)), C.pierre, { matiere: Enum.Material.Cobblestone, parent });
		const fumee = new Instance("Smoke");
		fumee.Size = 3;
		fumee.RiseVelocity = 3;
		fumee.Opacity = 0.08;
		fumee.Color = Color3.fromRGB(200, 200, 200);
		fumee.Parent = ch;
	}
}

// ───────────────────────────── Nature ─────────────────────────────

/** Arbre feuillu : tronc et branches en bois, feuillage en terrain (herbe feuillue), en 3 ou 4 masses. */
export function arbre(base: Vector3, parent: Instance, taille = 1, couleur = C.feuillage) {
	const t = taille;
	const penche = CFrame.Angles(math.rad(variante(base, 7) - 3), 0, math.rad(variante(base.add(new Vector3(3, 0, 1)), 7) - 3));
	const tronc = bloc(new Vector3(1.5 * t, 9 * t, 1.5 * t), base.add(new Vector3(0, 4.5 * t, 0)), C.bois, { matiere: Enum.Material.Wood, rotation: penche, parent });
	tronc.Color = Color3.fromRGB(88, 62, 42);
	// racines et deux branches
	for (const a of [0, 2.1, 4.2]) bloc(new Vector3(0.7 * t, 0.6 * t, 2.2 * t), base.add(new Vector3(math.cos(a) * 0.9 * t, 0.3 * t, math.sin(a) * 0.9 * t)), C.bois, { matiere: Enum.Material.Wood, rotation: CFrame.Angles(0, -a, 0), parent });
	for (const [a, y] of [[0.6, 6.5], [3.6, 7.5]] as const) {
		bloc(new Vector3(0.6 * t, 3.6 * t, 0.6 * t), base.add(new Vector3(math.cos(a) * 1.2 * t, y * t, math.sin(a) * 1.2 * t)), C.bois, { matiere: Enum.Material.Wood, rotation: CFrame.Angles(0, -a, math.rad(45)), parent });
	}
	const matiere = couleur === C.feuillage2 ? Enum.Material.Grass : Enum.Material.LeafyGrass;
	const masses: [number, number, number, number][] = [
		[0, 10.5, 0, 4.6],
		[2.4, 9.6, 1.2, 3.4],
		[-2.2, 9.8, -1.4, 3.3],
		[0.6, 13, -0.4, 3.2],
	];
	for (const [x, y, z, r] of masses) terrain.FillBall(base.add(new Vector3(x * t, y * t, z * t)), r * t, matiere);
}

/** Sapin : tronc et quatre étages d'aiguilles, du plus large au plus étroit. */
export function sapin(base: Vector3, parent: Instance, taille = 1) {
	bloc(new Vector3(1.2, 5, 1.2).mul(taille), base.add(new Vector3(0, 2.5 * taille, 0)), Color3.fromRGB(80, 56, 38), { matiere: Enum.Material.Wood, parent });
	const vert = Color3.fromRGB(34, 78, 46).Lerp(Color3.fromRGB(50, 96, 58), variante(base, 5) / 5);
	for (let i = 0; i < 4; i++) {
		const r = (7 - i * 1.6) * taille;
		bloc(new Vector3(2.6 * taille, r, r), base.add(new Vector3(0, (4 + i * 2.6) * taille, 0)), vert, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.LeafyGrass, parent });
	}
	bloc(new Vector3(1.2, 2.2, 1.2).mul(taille), base.add(new Vector3(0, 14.6 * taille, 0)), vert, { matiere: Enum.Material.LeafyGrass, parent });
}

/** Buisson (terrain), à moitié enterré. */
export function buisson(base: Vector3, rayon: number) {
	terrain.FillBall(base.add(new Vector3(0, rayon * 0.3, 0)), rayon, Enum.Material.LeafyGrass);
}

/** Rocher (terrain) avec une pierre plus petite à côté. */
export function rocher(base: Vector3, rayon: number) {
	terrain.FillBall(base.add(new Vector3(0, rayon * 0.2, 0)), rayon, Enum.Material.Rock);
	terrain.FillBall(base.add(new Vector3(rayon * 0.9, 0, rayon * 0.4)), rayon * 0.5, Enum.Material.Slate);
}

/** Petit massif de fleurs des champs (sans ombre ni collision). */
export function fleurs(base: Vector3, parent: Instance) {
	const couleurs = [Color3.fromRGB(230, 70, 80), Color3.fromRGB(250, 215, 80), Color3.fromRGB(245, 245, 245), Color3.fromRGB(160, 110, 220), Color3.fromRGB(255, 150, 60)];
	const c = couleurs[variante(base, couleurs.size())];
	for (let i = 0; i < 5; i++) {
		const a = i * 1.3;
		const f = bloc(new Vector3(0.45, 0.45, 0.45), base.add(new Vector3(math.cos(a) * 0.9, 0.55, math.sin(a) * 0.9)), c, { forme: "boule", parent, collision: false });
		f.CanQuery = false;
	}
}

// ───────────────────────────── Mobilier urbain ─────────────────────────────

export function lanterne(base: Vector3, parent: Instance) {
	bloc(new Vector3(1.2, 0.6, 1.2), base.add(new Vector3(0, 0.3, 0)), C.pierreSombre, { matiere: Enum.Material.Slate, parent });
	bloc(new Vector3(0.5, 9, 0.5), base.add(new Vector3(0, 4.5, 0)), C.pierreSombre, { matiere: Enum.Material.Metal, parent });
	bloc(new Vector3(2, 0.3, 0.3), base.add(new Vector3(0.8, 8.8, 0)), C.pierreSombre, { matiere: Enum.Material.Metal, parent });
	// cage vitrée, chapeau et flamme
	bloc(new Vector3(1.3, 1.5, 1.3), base.add(new Vector3(1.6, 7.9, 0)), Color3.fromRGB(255, 230, 190), { matiere: Enum.Material.Glass, parent }).Transparency = 0.55;
	bloc(new Vector3(1.6, 0.35, 1.6), base.add(new Vector3(1.6, 8.8, 0)), C.pierreSombre, { matiere: Enum.Material.Metal, parent });
	const flamme = bloc(new Vector3(0.6, 0.8, 0.6), base.add(new Vector3(1.6, 7.9, 0)), Color3.fromRGB(255, 200, 110), { neon: true, parent });
	lumiere(flamme, Color3.fromRGB(255, 190, 110), 22);
}

/** Tour ronde : fût en pierre, meurtrières, créneaux, toit conique en ardoise et fanion. */
export function tour(base: Vector3, rayon: number, hauteur: number, parent: Instance) {
	bloc(new Vector3(hauteur, rayon * 2, rayon * 2), base.add(new Vector3(0, hauteur / 2, 0)), C.pierreClaire, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Cobblestone, parent });
	bloc(new Vector3(1.2, rayon * 2.3, rayon * 2.3), base.add(new Vector3(0, hauteur - 0.2, 0)), C.pierre, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Cobblestone, parent });
	for (let i = 0; i < 8; i++) {
		const a = (i / 8) * 2 * math.pi;
		bloc(new Vector3(1.2, 1.6, 1.2), base.add(new Vector3(math.cos(a) * (rayon + 0.1), hauteur + 1, math.sin(a) * (rayon + 0.1))), C.pierreClaire, { matiere: Enum.Material.Cobblestone, parent });
	}
	for (const y of [hauteur * 0.4, hauteur * 0.7]) {
		for (const a of [0.4, 2.0, 3.6, 5.2]) {
			bloc(new Vector3(0.4, 1.8, 0.5), base.add(new Vector3(math.cos(a) * rayon, y, math.sin(a) * rayon)), Color3.fromRGB(25, 22, 28), { rotation: CFrame.Angles(0, -a, 0), parent });
		}
	}
	// toit conique : disques de plus en plus petits
	for (let i = 0; i < 5; i++) {
		const r = rayon * (1.25 - i * 0.24);
		bloc(new Vector3(1.4, r * 2, r * 2), base.add(new Vector3(0, hauteur + 1.6 + i * 1.3, 0)), C.toitBleu, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Slate, parent });
	}
	bloc(new Vector3(0.2, 4, 0.2), base.add(new Vector3(0, hauteur + 9.5, 0)), C.pierreSombre, { matiere: Enum.Material.Metal, parent });
	bloc(new Vector3(0.1, 1.2, 2), base.add(new Vector3(0, hauteur + 10.8, 1)), Color3.fromRGB(150, 30, 40), { matiere: Enum.Material.Fabric, parent });
}

export function tonneau(base: Vector3, parent: Instance) {
	bloc(new Vector3(2.6, 2, 2), base.add(new Vector3(0, 1.3, 0)), C.boisClair, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.WoodPlanks, parent });
	for (const y of [0.6, 2]) bloc(new Vector3(0.2, 2.08, 2.08), base.add(new Vector3(0, y, 0)), C.pierreSombre, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Metal, parent });
}

export function banniere(base: Vector3, couleur: Color3, parent: Instance) {
	bloc(new Vector3(0.3, 8, 0.3), base.add(new Vector3(0, 4, 0)), C.bois, { matiere: Enum.Material.Wood, parent });
	bloc(new Vector3(2.8, 0.25, 0.25), base.add(new Vector3(0, 7.9, 0.2)), C.bois, { matiere: Enum.Material.Wood, parent });
	bloc(new Vector3(2.4, 3.6, 0.1), base.add(new Vector3(0, 6, 0.2)), couleur, { matiere: Enum.Material.Fabric, parent });
	bloc(new Vector3(0.9, 0.9, 0.12), base.add(new Vector3(0, 6.2, 0.22)), C.or, { matiere: Enum.Material.Fabric, forme: "boule", parent });
}
