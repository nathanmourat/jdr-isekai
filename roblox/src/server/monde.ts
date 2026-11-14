/**
 * Lysmont et ses environs en 3D, générés par le code à partir des lieux du contenu (content/monde/aubeclaire.yaml) :
 * terrain Roblox (herbe, collines, rivière, chemins de terre), lumière de fin d'après-midi, maisons à colombages,
 * lanternes, arbres, villageois. Chaque lieu a sa silhouette et une invite « Entrer ».
 */
import { CollectionService, Lighting, Players, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import type { LieuDef } from "shared/moteur";
import { positionLieu } from "shared/geo";
import { arbre, banniere, bloc, buisson, C, dossierParDefaut, fleurs, lanterne, lumiere, maison, nuit, rocher, sapin, toit, tonneau, tour, VERTICAL } from "./decor";

let dossier: Folder;
const terrain = Workspace.Terrain;
/** Zones à garder libres (bâtiments, chemins) pour ne pas y planter d'arbres. */
const zonesLibres: { centre: Vector3; rayon: number }[] = [];

// ───────────────────────────── Lieux ─────────────────────────────

/** Construit un lieu ; renvoie la position de sa porte (là où apparaît « Entrer »). */
function construire(l: LieuDef, centre: Vector3, parent: Model): Vector3 {
	switch (l.id) {
		case "lysmont-place": {
			terrain.FillCylinder(new CFrame(centre.add(new Vector3(0, -0.5, 0))), 1, 26, Enum.Material.Cobblestone);
			bloc(new Vector3(2, 12, 12), centre.add(new Vector3(0, 1, 0)), C.pierreClaire, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Marble, parent });
			bloc(new Vector3(0.6, 10.5, 10.5), centre.add(new Vector3(0, 1.9, 0)), C.eau, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Glass, parent });
			bloc(new Vector3(1.8, 6, 1.8), centre.add(new Vector3(0, 5, 0)), C.pierreClaire, { matiere: Enum.Material.Marble, parent });
			const sommet = bloc(new Vector3(3, 3, 3), centre.add(new Vector3(0, 8.5, 0)), C.or, { forme: "boule", matiere: Enum.Material.Metal, parent });
			// margelle et jets d'eau (particules : texture par défaut de Roblox)
			bloc(new Vector3(0.6, 4.5, 4.5), centre.add(new Vector3(0, 5.6, 0)), C.pierreClaire, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Marble, parent });
			const jet = new Instance("ParticleEmitter");
			jet.Color = new ColorSequence(Color3.fromRGB(210, 235, 255));
			jet.Transparency = new NumberSequence(0.35, 1);
			jet.Size = new NumberSequence([new NumberSequenceKeypoint(0, 0.35), new NumberSequenceKeypoint(1, 0.6)]);
			jet.Lifetime = new NumberRange(1, 1.4);
			jet.Rate = 40;
			jet.Speed = new NumberRange(7, 9);
			jet.SpreadAngle = new Vector2(14, 14);
			jet.Acceleration = new Vector3(0, -14, 0);
			jet.EmissionDirection = Enum.NormalId.Top;
			jet.Parent = sommet;
			for (let i = 0; i < 6; i++) {
				const a = (i / 6) * 2 * math.pi + 0.3;
				lanterne(centre.add(new Vector3(math.cos(a) * 20, 0, math.sin(a) * 20)), parent);
			}
			for (const [x, z] of [[-14, -8], [14, -10], [-12, 12]] as const) tonneau(centre.add(new Vector3(x, 0, z)), parent);
			return centre.add(new Vector3(0, 0, 9));
		}
		case "temple-du-seuil": {
			for (let i = 0; i < 3; i++) bloc(new Vector3(34 - i * 2, 1, 26 - i * 2), centre.add(new Vector3(0, 0.5 + i, 2 - i)), C.blanc, { matiere: Enum.Material.Marble, parent });
			bloc(new Vector3(24, 16, 16), centre.add(new Vector3(0, 11, -2)), C.blanc, { matiere: Enum.Material.Marble, parent });
			for (const x of [-10, -5, 0, 5, 10]) {
				bloc(new Vector3(16, 1.8, 1.8), centre.add(new Vector3(x, 11, 8.5)), C.blanc, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Marble, parent });
				bloc(new Vector3(2.6, 0.8, 2.6), centre.add(new Vector3(x, 3.4, 8.5)), C.pierreClaire, { matiere: Enum.Material.Marble, parent });
				bloc(new Vector3(2.6, 0.9, 2.6), centre.add(new Vector3(x, 18.6, 8.5)), C.or, { matiere: Enum.Material.Metal, parent });
			}
			bloc(new Vector3(26, 1.2, 20), centre.add(new Vector3(0, 19.4, 0)), C.blanc, { matiere: Enum.Material.Marble, parent });
			toit(centre.add(new Vector3(0, 20, 0)), 28, 22, 7, C.or, parent);
			bloc(new Vector3(1.4, 12, 1.4), centre.add(new Vector3(0, 32, -2)), C.or, { matiere: Enum.Material.Metal, parent });
			const vitrail = bloc(new Vector3(6, 6, 0.3), centre.add(new Vector3(0, 13, 6.2)), Color3.fromRGB(150, 120, 255), { neon: true, parent });
			lumiere(vitrail, Color3.fromRGB(180, 150, 255), 20);
			for (const x of [-14, 14]) lanterne(centre.add(new Vector3(x, 3, 12)), parent);
			return centre.add(new Vector3(0, 0, 15));
		}
		case "chateau": {
			bloc(new Vector3(44, 24, 30), centre.add(new Vector3(0, 12, -6)), C.pierreClaire, { matiere: Enum.Material.Cobblestone, parent });
			// soubassement, cordon de pierre, fenêtres à meneaux sur deux étages, porche voûté
			bloc(new Vector3(45, 3, 31), centre.add(new Vector3(0, 1.5, -6)), C.pierre, { matiere: Enum.Material.Granite, parent });
			bloc(new Vector3(45, 0.8, 31), centre.add(new Vector3(0, 13, -6)), C.pierre, { matiere: Enum.Material.Limestone, parent });
			for (const y of [8, 18]) {
				for (const x of [-16, -9, 9, 16]) {
					const f = bloc(new Vector3(2.6, 4.4, 0.3), centre.add(new Vector3(x, y, 9.1)), C.vitre, { neon: true, parent });
					nuit(f);
					bloc(new Vector3(3.4, 0.5, 0.8), centre.add(new Vector3(x, y - 2.4, 9.2)), C.pierre, { matiere: Enum.Material.Limestone, parent });
					bloc(new Vector3(3.4, 0.7, 0.6), centre.add(new Vector3(x, y + 2.5, 9.2)), C.pierre, { matiere: Enum.Material.Limestone, parent });
					bloc(new Vector3(0.3, 4.4, 0.5), centre.add(new Vector3(x, y, 9.25)), C.pierreSombre, { matiere: Enum.Material.Metal, parent });
				}
			}
			// porche : deux piliers et un linteau autour de la porte
			for (const x of [-6.2, 6.2]) bloc(new Vector3(2.4, 16, 3), centre.add(new Vector3(x, 8, 10)), C.pierre, { matiere: Enum.Material.Granite, parent });
			bloc(new Vector3(14.8, 3, 3), centre.add(new Vector3(0, 14.5, 10)), C.pierre, { matiere: Enum.Material.Granite, parent });
			bloc(new Vector3(12, 1, 6), centre.add(new Vector3(0, 0.5, 13)), C.pierre, { matiere: Enum.Material.Cobblestone, parent });
			for (let x = -20; x <= 20; x += 4) bloc(new Vector3(2, 2.4, 2), centre.add(new Vector3(x, 25.2, 9)), C.pierreClaire, { matiere: Enum.Material.Cobblestone, parent });
			for (const [x, z] of [[-22, -20], [22, -20], [-22, 9], [22, 9]] as const) tour(centre.add(new Vector3(x, 0, z)), 4.5, 32, parent);
			bloc(new Vector3(10, 13, 2), centre.add(new Vector3(0, 6.5, 9.4)), C.bois, { matiere: Enum.Material.WoodPlanks, parent });
			for (const x of [-12, 12]) banniere(centre.add(new Vector3(x, 0, 12)), Color3.fromRGB(150, 30, 40), parent);
			return centre.add(new Vector3(0, 0, 14));
		}
		case "guilde": {
			maison(centre, 24, 18, 13, C.toitBleu, parent, { murs: Color3.fromRGB(214, 200, 170) });
			const enseigne = bloc(new Vector3(6, 3, 0.4), centre.add(new Vector3(0, 9.5, 9.6)), C.or, { matiere: Enum.Material.Metal, parent, nom: "Enseigne" });
			const surface = new Instance("SurfaceGui");
			surface.Face = Enum.NormalId.Front;
			const t = new Instance("TextLabel");
			t.Size = UDim2.fromScale(1, 1);
			t.BackgroundTransparency = 1;
			t.Text = "GUILDE";
			t.Font = Enum.Font.Fantasy;
			t.TextScaled = true;
			t.TextColor3 = Color3.fromRGB(60, 40, 20);
			t.Parent = surface;
			surface.Parent = enseigne;
			for (const x of [-15, 15]) banniere(centre.add(new Vector3(x, 0, 10)), C.toitBleu, parent);
			return centre.add(new Vector3(0, 0, 11.5));
		}
		case "taverne": {
			maison(centre, 20, 15, 11, C.toitRouge, parent);
			for (const [x, z] of [[8, 10], [10, 8], [-9, 10]] as const) tonneau(centre.add(new Vector3(x, 0, z)), parent);
			lanterne(centre.add(new Vector3(-12, 0, 10)), parent);
			return centre.add(new Vector3(0, 0, 10));
		}
		case "quartier-tanneurs": {
			maison(centre.add(new Vector3(-9, 0, 0)), 11, 10, 8, C.ardoise, parent, { murs: Color3.fromRGB(190, 175, 150) });
			maison(centre.add(new Vector3(7, 0, -5)), 10, 9, 7, C.ardoise, parent, { murs: Color3.fromRGB(180, 165, 140), cheminee: false });
			maison(centre.add(new Vector3(5, 0, 12)), 9, 8, 7, C.toitRouge, parent, { murs: Color3.fromRGB(185, 170, 145) });
			for (const [x, z] of [[-2, 7], [-4, 9]] as const) tonneau(centre.add(new Vector3(x, 0, z)), parent);
			lanterne(centre.add(new Vector3(0, 0, 4)), parent);
			return centre.add(new Vector3(-2, 0, 6));
		}
		case "arene": {
			terrain.FillCylinder(new CFrame(centre.add(new Vector3(0, -0.5, 0))), 1, 18, Enum.Material.Sand);
			for (let i = 0; i < 20; i++) {
				if (i === 5) continue; // l'entrée
				const a = (i / 20) * 2 * math.pi;
				const pos = centre.add(new Vector3(math.cos(a) * 20, 0, math.sin(a) * 20));
				const rot = CFrame.Angles(0, -a + math.pi / 2, 0);
				bloc(new Vector3(7, 8, 2.5), pos.add(new Vector3(0, 4, 0)), C.pierre, { rotation: rot, matiere: Enum.Material.Cobblestone, parent });
				bloc(new Vector3(7, 2, 3), pos.add(new Vector3(0, 9, 0)), C.pierreClaire, { rotation: rot, matiere: Enum.Material.Cobblestone, parent });
			}
			for (const a of [0.9, 2.2]) banniere(centre.add(new Vector3(math.cos(a) * 22, 0, math.sin(a) * 22)), Color3.fromRGB(150, 30, 40), parent);
			return centre.add(new Vector3(0, 0, 20));
		}
		case "combe-aux-saules": {
			maison(centre, 14, 11, 8, C.toitRouge, parent, { murs: Color3.fromRGB(220, 205, 175) });
			bloc(new Vector3(8, 7, 7), centre.add(new Vector3(-14, 3.5, -2)), C.boisClair, { matiere: Enum.Material.WoodPlanks, parent });
			toit(centre.add(new Vector3(-14, 7, -2)), 9, 8, 3, C.toitRouge, parent);
			for (const [x, z] of [[-22, -14], [-26, 8], [18, -16], [22, 14], [-6, -22], [10, 22], [28, -2]] as const) arbre(centre.add(new Vector3(x, 0, z)), parent, 1.1, C.feuillage2);
			for (let i = -4; i <= 4; i++) bloc(new Vector3(4, 0.4, 0.4), centre.add(new Vector3(i * 4, 2, 15)), C.boisClair, { matiere: Enum.Material.Wood, parent });
			for (let i = -4; i <= 4; i++) bloc(new Vector3(0.5, 3, 0.5), centre.add(new Vector3(i * 4 - 2, 1.5, 15)), C.bois, { matiere: Enum.Material.Wood, parent });
			return centre.add(new Vector3(0, 0, 9));
		}
		case "boutique": {
			maison(centre, 14, 12, 9, C.toitBleu, parent, { murs: Color3.fromRGB(225, 210, 170) });
			const enseigne = bloc(new Vector3(5, 2, 0.4), centre.add(new Vector3(0, 7.8, 6.4)), C.bois, { matiere: Enum.Material.Wood, parent });
			const surface = new Instance("SurfaceGui");
			surface.Face = Enum.NormalId.Front;
			const t = new Instance("TextLabel");
			t.Size = UDim2.fromScale(1, 1);
			t.BackgroundTransparency = 1;
			t.Text = "COMPTOIR";
			t.Font = Enum.Font.Fantasy;
			t.TextScaled = true;
			t.TextColor3 = C.or;
			t.Parent = surface;
			surface.Parent = enseigne;
			for (const [x, z] of [[6, 8], [-6, 8]] as const) tonneau(centre.add(new Vector3(x, 0, z)), parent);
			return centre.add(new Vector3(0, 0, 7.5));
		}
		case "crypte-fontaine": {
			terrain.FillBlock(new CFrame(centre.add(new Vector3(0, -0.5, 4))), new Vector3(30, 1, 30), Enum.Material.Mud);
			bloc(new Vector3(20, 11, 16), centre.add(new Vector3(0, 5.5, 0)), C.pierreSombre, { matiere: Enum.Material.Slate, parent });
			toit(centre.add(new Vector3(0, 11, 0)), 22, 18, 6, C.pierreSombre, parent);
			bloc(new Vector3(6, 8, 1), centre.add(new Vector3(0, 4, 8.2)), Color3.fromRGB(15, 12, 18), { parent });
			for (const x of [-4, 4]) {
				const flambeau = bloc(new Vector3(0.6, 1, 0.6), centre.add(new Vector3(x, 7, 8.6)), Color3.fromRGB(255, 140, 60), { neon: true, parent });
				const feu = new Instance("Fire");
				feu.Size = 2;
				feu.Parent = flambeau;
				lumiere(flambeau, Color3.fromRGB(255, 140, 60), 14);
			}
			for (const [x, z] of [[-14, 12], [14, 12], [-16, -8], [16, -6]] as const) bloc(new Vector3(1.6, 3.5, 0.6), centre.add(new Vector3(x, 1.75, z)), C.pierre, { matiere: Enum.Material.Slate, parent });
			for (const x of [-20, 20]) sapin(centre.add(new Vector3(x, 0, 2)), parent, 1.3);
			return centre.add(new Vector3(0, 0, 11));
		}
	}
	maison(centre, 14, 12, 8, C.toitRouge, parent);
	return centre.add(new Vector3(0, 0, 8));
}

// ───────────────────────────── Terrain, chemins, végétation ─────────────────────────────

function chemin(de: Vector3, a: Vector3) {
	const d = a.sub(de);
	const longueur = d.Magnitude;
	if (longueur < 1) return;
	const milieu = de.add(a).div(2);
	terrain.FillBlock(CFrame.lookAt(milieu, a).add(new Vector3(0, -0.4, 0)), new Vector3(9, 1.2, longueur), Enum.Material.Ground);
	// pavés au milieu du chemin (en ville)
	terrain.FillBlock(CFrame.lookAt(milieu, a).add(new Vector3(0, -0.35, 0)), new Vector3(4.5, 1.2, longueur), Enum.Material.Pavement);
	for (let t = 0; t <= longueur; t += 10) zonesLibres.push({ centre: de.add(d.Unit.mul(t)), rayon: 8 });
}

/** Couleurs des matériaux du terrain : une palette chaude et peinte, plus douce que celle par défaut. */
function couleursTerrain() {
	const couleurs: [Enum.Material, Color3][] = [
		[Enum.Material.Grass, Color3.fromRGB(96, 142, 64)],
		[Enum.Material.LeafyGrass, Color3.fromRGB(70, 120, 58)],
		[Enum.Material.Ground, Color3.fromRGB(122, 98, 72)],
		[Enum.Material.Mud, Color3.fromRGB(88, 72, 58)],
		[Enum.Material.Sand, Color3.fromRGB(214, 194, 150)],
		[Enum.Material.Cobblestone, Color3.fromRGB(150, 144, 134)],
		[Enum.Material.Rock, Color3.fromRGB(122, 116, 110)],
		[Enum.Material.Slate, Color3.fromRGB(96, 94, 100)],
		[Enum.Material.Pavement, Color3.fromRGB(160, 150, 136)],
	];
	for (const [m, c] of couleurs) pcall(() => terrain.SetMaterialColor(m, c));
	// eau de rivière, claire et un peu agitée
	terrain.WaterColor = Color3.fromRGB(46, 104, 120);
	terrain.WaterTransparency = 0.65;
	terrain.WaterReflectance = 0.55;
	terrain.WaterWaveSize = 0.12;
	terrain.WaterWaveSpeed = 9;
	// brins d'herbe animés sur l'herbe (rendu par Roblox, désactivé automatiquement sur les petits appareils)
	pcall(() => {
		terrain.Decoration = true;
	});
	// nuages animés
	terrain.FindFirstChildOfClass("Clouds")?.Destroy();
	const nuages = new Instance("Clouds");
	nuages.Cover = 0.55;
	nuages.Density = 0.55;
	nuages.Color = Color3.fromRGB(255, 246, 236);
	nuages.Parent = terrain;
}

function preparerTerrain() {
	terrain.Clear();
	couleursTerrain();
	terrain.FillBlock(new CFrame(0, -6, 0), new Vector3(1400, 12, 1200), Enum.Material.Grass);
	// collines au loin
	const graine = new Random(1012);
	for (let i = 0; i < 26; i++) {
		const a = graine.NextNumber(0, 2 * math.pi);
		const r = graine.NextNumber(420, 560);
		terrain.FillBall(new Vector3(math.cos(a) * r, -10, math.sin(a) * r * 0.85), graine.NextNumber(40, 80), i % 4 === 0 ? Enum.Material.Rock : Enum.Material.Grass);
	}
	// douces ondulations dans la campagne (loin de la ville)
	for (let i = 0; i < 40; i++) {
		const p = new Vector3(graine.NextNumber(-600, 600), -14, graine.NextNumber(-180, 520));
		if (p.Magnitude < 220) continue;
		terrain.FillBall(p, graine.NextNumber(16, 26), Enum.Material.Grass);
	}
	// rivière au nord
	terrain.FillBlock(new CFrame(0, -2.5, -230), new Vector3(1400, 6, 26), Enum.Material.Air);
	terrain.FillBlock(new CFrame(0, -3.5, -230), new Vector3(1400, 4, 26), Enum.Material.Water);
	terrain.FillBlock(new CFrame(0, -2, -244), new Vector3(1400, 2, 4), Enum.Material.Sand);
	terrain.FillBlock(new CFrame(0, -2, -216), new Vector3(1400, 2, 4), Enum.Material.Sand);
}

function vegetation() {
	const graine = new Random(1030);
	const foret = new Instance("Model");
	foret.Name = "Vegetation";
	foret.Parent = dossier;
	let plantes = 0;
	for (let essai = 0; essai < 900 && plantes < 170; essai++) {
		const p = new Vector3(graine.NextNumber(-420, 420), 0, graine.NextNumber(-200, 360));
		if (zonesLibres.some((z) => z.centre.sub(p).Magnitude < z.rayon + 6)) continue;
		const densite = p.Magnitude > 140 ? 1 : 0.25; // forêt dense loin du centre, quelques arbres en ville
		if (graine.NextNumber() > densite) continue;
		if (graine.NextNumber() < 0.35) sapin(p, foret, graine.NextNumber(0.9, 1.5));
		else arbre(p, foret, graine.NextNumber(0.8, 1.4), graine.NextNumber() < 0.5 ? C.feuillage : C.feuillage2);
		plantes++;
	}
	// sous-bois et campagne : buissons, rochers, fleurs des champs, taches de terre et d'herbe feuillue
	const libre = (p: Vector3, marge: number) => !zonesLibres.some((z) => z.centre.sub(p).Magnitude < z.rayon + marge);
	let n = 0;
	for (let essai = 0; essai < 1200 && n < 260; essai++) {
		const p = new Vector3(graine.NextNumber(-430, 430), 0, graine.NextNumber(-205, 380));
		if (!libre(p, 2)) continue;
		const r = graine.NextNumber();
		if (r < 0.45) buisson(p, graine.NextNumber(1.4, 2.8));
		else if (r < 0.6) rocher(p, graine.NextNumber(1.2, 3.2));
		else if (r < 0.85) fleurs(p, foret);
		else terrain.FillCylinder(new CFrame(p.add(new Vector3(0, -0.45, 0))), 1, graine.NextNumber(4, 9), graine.NextNumber() < 0.5 ? Enum.Material.LeafyGrass : Enum.Material.Ground);
		n++;
	}
	// roseaux et pierres le long de la rivière
	for (let x = -420; x <= 420; x += graine.NextNumber(14, 30)) {
		const z = graine.NextNumber() < 0.5 ? -216.5 : -243.5;
		rocher(new Vector3(x, -1.4, z), graine.NextNumber(0.8, 1.6));
		for (let k = 0; k < 3; k++) {
			bloc(new Vector3(0.2, graine.NextNumber(2.5, 4), 0.2), new Vector3(x + k * 0.6 + 2, -0.2, z + (z > -230 ? -1.2 : 1.2)), Color3.fromRGB(110, 130, 70), { matiere: Enum.Material.Grass, parent: foret, collision: false });
		}
	}
}

function eclairage() {
	Lighting.ClockTime = 16.8;
	Lighting.Brightness = 2.6;
	Lighting.ExposureCompensation = 0.1;
	Lighting.OutdoorAmbient = Color3.fromRGB(120, 110, 100);
	Lighting.Ambient = Color3.fromRGB(40, 36, 44);
	// reflets du ciel sur le métal, le verre et l'eau (rendu physique des matériaux)
	Lighting.EnvironmentDiffuseScale = 1;
	Lighting.EnvironmentSpecularScale = 1;
	Lighting.GlobalShadows = true;
	Lighting.ShadowSoftness = 0.3;
	Lighting.GeographicLatitude = 41;
	// La technologie d'éclairage « Future » (plus belles lumières) ne se règle pas par script :
	// dans Studio, Explorer → Lighting → propriété Technology → Future (voir README-ROBLOX.md).
	for (const e of Lighting.GetChildren()) e.Destroy();
	const atmosphere = new Instance("Atmosphere");
	atmosphere.Density = 0.32;
	atmosphere.Haze = 1.4;
	atmosphere.Color = Color3.fromRGB(230, 200, 170);
	atmosphere.Decay = Color3.fromRGB(110, 90, 120);
	atmosphere.Glare = 0.3;
	atmosphere.Parent = Lighting;
	const ciel = new Instance("Sky");
	ciel.SunAngularSize = 14;
	ciel.MoonAngularSize = 9;
	ciel.StarCount = 4000;
	ciel.Parent = Lighting;
	const flou = new Instance("BloomEffect");
	flou.Intensity = 0.5;
	flou.Size = 26;
	flou.Threshold = 1.6;
	flou.Parent = Lighting;
	const rayons = new Instance("SunRaysEffect");
	rayons.Intensity = 0.08;
	rayons.Spread = 0.6;
	rayons.Parent = Lighting;
	const couleurs = new Instance("ColorCorrectionEffect");
	couleurs.Name = "Couleurs";
	couleurs.Saturation = 0.15;
	couleurs.Contrast = 0.08;
	couleurs.TintColor = Color3.fromRGB(255, 245, 230);
	couleurs.Parent = Lighting;
	// profondeur de champ légère : le lointain se fond doucement (style peint)
	const profondeur = new Instance("DepthOfFieldEffect");
	profondeur.FarIntensity = 0.22;
	profondeur.FocusDistance = 70;
	profondeur.InFocusRadius = 90;
	profondeur.NearIntensity = 0;
	profondeur.Parent = Lighting;
}

/** Villageois immobiles sur la place (personnages Roblox costumés). */
function villageois(centrePlace: Vector3) {
	const tenues = [
		[Color3.fromRGB(120, 60, 50), Color3.fromRGB(70, 60, 50)],
		[Color3.fromRGB(70, 100, 140), Color3.fromRGB(60, 55, 50)],
		[Color3.fromRGB(150, 130, 80), Color3.fromRGB(90, 70, 50)],
		[Color3.fromRGB(90, 120, 80), Color3.fromRGB(70, 60, 45)],
	];
	const places = [new Vector3(-10, 0, 14), new Vector3(12, 0, -14), new Vector3(16, 0, 6), new Vector3(-16, 0, -6)];
	places.forEach((pos, i) => {
		const [ok] = pcall(() => {
			const d = new Instance("HumanoidDescription");
			const [haut, bas] = tenues[i % tenues.size()];
			d.HeadColor = Color3.fromRGB(230, 190, 150);
			d.TorsoColor = haut;
			d.LeftArmColor = haut;
			d.RightArmColor = haut;
			d.LeftLegColor = bas;
			d.RightLegColor = bas;
			const m = Players.CreateHumanoidModelFromDescriptionAsync(d, Enum.HumanoidRigType.R15);
			m.Name = "Villageois";
			const h = m.FindFirstChildOfClass("Humanoid");
			if (h) h.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None;
			const racine = m.FindFirstChild("HumanoidRootPart") as BasePart;
			racine.Anchored = true;
			const p = centrePlace.add(pos);
			m.PivotTo(CFrame.lookAt(p.add(new Vector3(0, 3, 0)), centrePlace.add(new Vector3(0, 3, 0))));
			m.Parent = dossier;
		});
		if (!ok) warn("[Velmaris] Villageois non créé");
	});
}

/**
 * Lieu d'étape (quête ou contrat) : pas de bâtiment, une balise lumineuse avec une invite.
 * Chaque joueur ne la voit que pendant l'étape qui y mène (client/rendu/marqueurs.ts).
 */
export function balise(l: LieuDef) {
	const pos = positionLieu(l);
	const m = new Instance("Model");
	m.Name = `etape-${l.id}`;
	m.SetAttribute("Etape", l.id);
	m.Parent = dossier;
	const socle = bloc(new Vector3(6, 1, 6), pos.add(new Vector3(0, 0.5, 0)), C.pierre, { parent: m, matiere: Enum.Material.Cobblestone });
	void socle;
	const colonne = bloc(new Vector3(1.6, 10, 1.6), pos.add(new Vector3(0, 6, 0)), C.or, { parent: m, neon: true, nom: "Entree" });
	CollectionService.AddTag(colonne, "EntreeLieu");
	colonne.Transparency = 0.35;
	colonne.CanCollide = false;
	colonne.SetAttribute("Lieu", l.id);
	const l2 = new Instance("PointLight");
	l2.Color = C.or;
	l2.Range = 20;
	l2.Brightness = 2;
	l2.Parent = colonne;
	const invite = new Instance("ProximityPrompt");
	invite.ActionText = "Examiner";
	invite.ObjectText = l.nom;
	invite.HoldDuration = 0;
	invite.MaxActivationDistance = 14;
	invite.RequiresLineOfSight = false;
	invite.SetAttribute("Lieu", l.id);
	invite.SetAttribute("Action", "etape");
	invite.Parent = colonne;
}

/** Construit le monde (une seule fois, au démarrage du serveur). */
export function construireMonde() {
	Workspace.FindFirstChild("Baseplate")?.Destroy();
	for (const e of Workspace.GetChildren()) if (e.IsA("SpawnLocation")) e.Destroy();
	dossier = new Instance("Folder");
	dossier.Name = "Velmaris";
	dossier.Parent = Workspace;
	dossierParDefaut(dossier);
	eclairage();
	preparerTerrain();

	const apparition = new Instance("SpawnLocation");
	apparition.Anchored = true;
	apparition.Size = new Vector3(8, 1, 8);
	apparition.Position = new Vector3(0, 0.5, 16);
	apparition.Transparency = 1;
	apparition.CanCollide = false;
	apparition.Neutral = true;
	apparition.Duration = 0;
	apparition.Parent = dossier;

	const region = CONTENU.regions.aubeclaire;
	const place = region.lieux.find((l) => l.id === "lysmont-place");
	const centrePlace = place ? positionLieu(place) : new Vector3();
	for (const l of region.lieux) {
		if (l.etape_seulement === true) {
			balise(l);
			continue;
		}
		const modele = new Instance("Model");
		modele.Name = l.id;
		modele.Parent = dossier;
		const centre = positionLieu(l);
		zonesLibres.push({ centre, rayon: l.id === "chateau" || l.id === "combe-aux-saules" ? 34 : 26 });
		const porte = construire(l, centre, modele);
		if (l.id !== "lysmont-place") chemin(centrePlace, porte);

		// point d'entrée : invite « Entrer » (les marqueurs ⭐ ● ⚔ sont ajoutés par chaque joueur)
		const ancre = bloc(new Vector3(4, 6, 4), porte.add(new Vector3(0, 3, 0)), C.or, { parent: modele, nom: "Entree" });
		CollectionService.AddTag(ancre, "EntreeLieu");
		ancre.Transparency = 1;
		ancre.CanCollide = false;
		ancre.SetAttribute("Lieu", l.id);
		const invite = new Instance("ProximityPrompt");
		// la place n'a pas d'intérieur : on y « regarde » ce qu'il y a à faire ; les autres lieux ont une salle
		const exterieur = l.id === "lysmont-place";
		invite.ActionText = exterieur ? "Regarder" : "Entrer";
		invite.ObjectText = l.nom;
		invite.SetAttribute("Action", exterieur ? "tout" : "entrer");
		invite.HoldDuration = 0;
		invite.MaxActivationDistance = 14;
		invite.RequiresLineOfSight = false;
		invite.SetAttribute("Lieu", l.id);
		invite.Parent = ancre;
	}
	vegetation();
	task.spawn(() => villageois(centrePlace));
}
