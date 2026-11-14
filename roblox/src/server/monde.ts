/**
 * Lysmont et ses environs en 3D, générés par le code à partir des lieux du contenu (content/monde/aubeclaire.yaml) :
 * terrain Roblox (herbe, collines, rivière, chemins de terre), lumière de fin d'après-midi, maisons à colombages,
 * lanternes, arbres, villageois. Chaque lieu a sa silhouette et une invite « Entrer ».
 */
import { CollectionService, Lighting, Players, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import type { LieuDef } from "shared/moteur";
import { GRANDEUR, positionLieu } from "shared/geo";
import { arbre, banniere, bloc, buisson, C, dossierParDefaut, fleurs, lanterne, lumiere, maison, rocher, sapin, toit, tonneau, VERTICAL } from "./decor";
import { maisonHabitee, type Metier } from "./maisons";
import { auSol, champ, charrette, epouvantail, meule, moulin, plateforme, puits, reverberes, routeCourbe } from "./paysage";
import { GROUPE_PNJ, mettreDansGroupe } from "./collisions";
import { agrandir, ajouterOuverture, type Contour, dansContour, enceinte, forteresse, pointAgrandi } from "./royaume";

let dossier: Folder;
const terrain = Workspace.Terrain;
/** Zones à garder libres (bâtiments, chemins) pour ne pas y planter d'arbres. */
const zonesLibres: { centre: Vector3; rayon: number }[] = [];

// ───────────────────────────── Lieux ─────────────────────────────

/** Agrandissement de chaque lieu de Lysmont (le château est construit directement en grand : forteresse()). */
const AGRANDISSEMENT: Record<string, number> = {
	"lysmont-place": 2.4,
	"temple-du-seuil": GRANDEUR.edifice,
	chateau: 1,
	arene: 2.4,
	"crypte-fontaine": 2,
};

/** Arbres plantés autour de certains lieux après agrandissement (le feuillage est en terrain : il ne s'agrandit pas). */
function arbresAutour(l: LieuDef, centre: Vector3, k: number) {
	if (l.id === "combe-aux-saules") for (const [x, z] of [[-22, -14], [-26, 8], [18, -16], [22, 14], [-6, -22], [10, 22], [28, -2]] as const) arbre(centre.add(new Vector3(x * k, 0, z * k)), dossier, 1.6, C.feuillage2);
	if (l.id === "crypte-fontaine") for (const x of [-20, 20]) sapin(centre.add(new Vector3(x * k, 0, 2 * k)), dossier, 1.8);
}

/**
 * Construit un lieu à ses mesures de base ; renvoie la position de sa porte (là où apparaît « Entrer »).
 * Le modèle est ensuite agrandi (AGRANDISSEMENT) ; `k` sert aux remplissages de terrain, qui ne s'agrandissent pas tout seuls.
 */
function construire(l: LieuDef, centre: Vector3, parent: Model, k: number): Vector3 {
	switch (l.id) {
		case "lysmont-place": {
			terrain.FillCylinder(new CFrame(centre.add(new Vector3(0, -0.5, 0))), 1, 26 * k, Enum.Material.Cobblestone);
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
		case "chateau":
			return forteresse(centre, parent);
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
			terrain.FillCylinder(new CFrame(centre.add(new Vector3(0, -0.5, 0))), 1, 18 * k, Enum.Material.Sand);
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
			terrain.FillBlock(new CFrame(centre.add(new Vector3(0, -0.5, 4 * k))), new Vector3(30 * k, 1, 30 * k), Enum.Material.Mud);
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
			return centre.add(new Vector3(0, 0, 11));
		}
	}
	maison(centre, 14, 12, 8, C.toitRouge, parent);
	return centre.add(new Vector3(0, 0, 8));
}

// ───────────────────────────── Terrain, chemins, végétation ─────────────────────────────

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

/** Lysmont s'étend sur environ 3 500 × 2 600 studs : campagne, collines, rivière au nord. */
function preparerTerrain() {
	terrain.Clear();
	couleursTerrain();
	terrain.FillBlock(new CFrame(0, -6, 0), new Vector3(4000, 12, 3000), Enum.Material.Grass);
	// collines au loin
	const graine = new Random(1012);
	for (let i = 0; i < 40; i++) {
		const a = graine.NextNumber(0, 2 * math.pi);
		const r = graine.NextNumber(1300, 1650);
		terrain.FillBall(new Vector3(math.cos(a) * r, -20, math.sin(a) * r * 0.75), graine.NextNumber(90, 180), i % 4 === 0 ? Enum.Material.Rock : Enum.Material.Grass);
	}
	// douces ondulations dans la campagne (hors des remparts)
	for (let i = 0; i < 70; i++) {
		const p = new Vector3(graine.NextNumber(-1500, 1500), -16, graine.NextNumber(-500, 1200));
		if (p.Magnitude < 560) continue;
		terrain.FillBall(p, graine.NextNumber(20, 36), Enum.Material.Grass);
	}
	// rivière au nord, derrière le Temple du Seuil
	terrain.FillBlock(new CFrame(0, -2.5, -560), new Vector3(4000, 6, 46), Enum.Material.Air);
	terrain.FillBlock(new CFrame(0, -3.5, -560), new Vector3(4000, 4, 46), Enum.Material.Water);
	terrain.FillBlock(new CFrame(0, -2, -585), new Vector3(4000, 2, 6), Enum.Material.Sand);
	terrain.FillBlock(new CFrame(0, -2, -535), new Vector3(4000, 2, 6), Enum.Material.Sand);
}

function vegetation() {
	const graine = new Random(1030);
	const foret = new Instance("Model");
	foret.Name = "Vegetation";
	foret.Parent = dossier;
	let plantes = 0;
	for (let essai = 0; essai < 2600 && plantes < 360; essai++) {
		const p = new Vector3(graine.NextNumber(-1500, 1500), 0, graine.NextNumber(-520, 1100));
		if (zonesLibres.some((z) => z.centre.sub(p).Magnitude < z.rayon + 6)) continue;
		if (dansLesMurs(p, 20)) continue; // pas de forêt dans la ville
		const densite = p.Magnitude > 650 ? 1 : 0.35;
		if (graine.NextNumber() > densite) continue;
		if (graine.NextNumber() < 0.35) sapin(p, foret, graine.NextNumber(0.9, 1.5));
		else arbre(p, foret, graine.NextNumber(0.8, 1.4), graine.NextNumber() < 0.5 ? C.feuillage : C.feuillage2);
		plantes++;
	}
	// sous-bois et campagne : buissons, rochers, fleurs des champs, taches de terre et d'herbe feuillue
	const libre = (p: Vector3, marge: number) => !zonesLibres.some((z) => z.centre.sub(p).Magnitude < z.rayon + marge);
	let n = 0;
	for (let essai = 0; essai < 2600 && n < 520; essai++) {
		const p = new Vector3(graine.NextNumber(-1500, 1500), 0, graine.NextNumber(-530, 1150));
		if (!libre(p, 2) || dansLesMurs(p, 10)) continue;
		const r = graine.NextNumber();
		if (r < 0.45) buisson(p, graine.NextNumber(1.4, 2.8));
		else if (r < 0.6) rocher(p, graine.NextNumber(1.2, 3.2));
		else if (r < 0.85) fleurs(p, foret);
		else terrain.FillCylinder(new CFrame(p.add(new Vector3(0, -0.45, 0))), 1, graine.NextNumber(4, 9), graine.NextNumber() < 0.5 ? Enum.Material.LeafyGrass : Enum.Material.Ground);
		n++;
	}
	// roseaux et pierres le long de la rivière
	for (let x = -1500; x <= 1500; x += graine.NextNumber(20, 40)) {
		const z = graine.NextNumber() < 0.5 ? -536.5 : -583.5;
		rocher(new Vector3(x, -1.4, z), graine.NextNumber(0.8, 1.6));
		for (let k = 0; k < 3; k++) {
			bloc(new Vector3(0.2, graine.NextNumber(2.5, 4), 0.2), new Vector3(x + k * 0.6 + 2, -0.2, z + (z > -560 ? -1.2 : 1.2)), Color3.fromRGB(110, 130, 70), { matiere: Enum.Material.Grass, parent: foret, collision: false });
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
	atmosphere.Density = 0.26;
	atmosphere.Haze = 1.2;
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
	profondeur.FarIntensity = 0.18;
	profondeur.FocusDistance = 160;
	profondeur.InFocusRadius = 260;
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
	const places = [new Vector3(-24, 0, 34), new Vector3(30, 0, -34), new Vector3(38, 0, 14), new Vector3(-38, 0, -14)];
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
			mettreDansGroupe(m, GROUPE_PNJ);
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

// ───────────────────────────── Remparts, rues et quartiers ─────────────────────────────

/** Remparts de Lysmont : une ellipse qui entoure la place, les rues, le château et l'arène (le temple reste dehors, sur sa colline). */
const MURS: Contour = { centre: new Vector3(40, 0, -15), rx: 390, rz: 345 };
const dansLesMurs = (p: Vector3, marge = 0) => dansContour(MURS, p, marge);

/** Obstacles pour placer maisons, champs et moulins (lieux, buttes, maisons déjà posées…). */
const obstacles: { centre: Vector3; rayon: number }[] = [];
/** Points des rues (pour ne pas bâtir dessus). */
const pointsRues: { p: Vector3; demi: number }[] = [];
/** Rues de la ville et routes du faubourg, pour y aligner des maisons. */
const rues: { points: Vector3[]; largeur: number; dedans: boolean }[] = [];

/** Vrai si rien n'est déjà posé là (`rayonRue` : distance à garder avec les rues, la demi-profondeur pour une maison). */
function libre(pos: Vector3, rayon: number, rayonRue = rayon * 0.8): boolean {
	if (obstacles.some((o) => o.centre.sub(new Vector3(pos.X, o.centre.Y, pos.Z)).Magnitude < o.rayon + rayon)) return false;
	return !pointsRues.some((r) => new Vector3(r.p.X - pos.X, 0, r.p.Z - pos.Z).Magnitude < r.demi + rayonRue);
}

/** Trace une rue courbe (pavée en ville) et la mémorise. Renvoie ses points. */
function rue(de: Vector3, a: Vector3, largeur: number, graine: number, dedans: boolean, courbure = 0.14): Vector3[] {
	const points = routeCourbe(de, a, largeur, Enum.Material.Ground, graine, courbure, dedans ? Enum.Material.Pavement : undefined);
	for (const p of points) {
		pointsRues.push({ p, demi: largeur / 2 + 2 });
		zonesLibres.push({ centre: p, rayon: largeur / 2 + 6 });
	}
	if (points.size() > 1) rues.push({ points, largeur, dedans });
	return points;
}

/** Angle où une route traverse les remparts (le premier point dehors), pour y percer une porte. */
function sortieDesMurs(points: Vector3[]): number | undefined {
	for (let i = 1; i < points.size(); i++) {
		if (dansLesMurs(points[i - 1]) !== dansLesMurs(points[i])) {
			const p = points[i];
			return math.atan2((p.Z - MURS.centre.Z) / MURS.rz, (p.X - MURS.centre.X) / MURS.rx);
		}
	}
	return undefined;
}

/** Bord de la grande place, en direction d'un point (les rues partent de là, la place reste pavée). */
function bordDePlace(centrePlace: Vector3, vers: Vector3): Vector3 {
	const d = new Vector3(vers.X - centrePlace.X, 0, vers.Z - centrePlace.Z);
	return d.Magnitude < 1 ? centrePlace : centrePlace.add(d.Unit.mul(60));
}

const TOITS = [C.toitRouge, C.toitBleu, C.ardoise, C.toitRouge];
const MURS_MAISONS = [C.enduit, Color3.fromRGB(214, 200, 170), Color3.fromRGB(225, 210, 175), Color3.fromRGB(200, 186, 160)];
const METIERS_VILLE: Metier[] = ["famille", "boulanger", "famille", "forgeron", "famille", "tisserand"];
const METIERS_HAMEAU: Metier[] = ["ferme", "famille", "ferme"];

/**
 * Maisons alignées le long des rues, des deux côtés, la façade tournée vers la rue.
 * Une maison sur trois est habitée : on peut y entrer (maisons.ts).
 */
function bordsDeRues(parent: Instance, graine: Random, dedans: boolean, max: number) {
	let n = 0;
	let habitees = 0;
	for (const r of rues) {
		if (r.dedans !== dedans) continue;
		let cumul = 20;
		for (let i = 1; i < r.points.size() && n < max; i++) {
			const seg = r.points[i].sub(r.points[i - 1]);
			cumul += new Vector3(seg.X, 0, seg.Z).Magnitude;
			if (cumul < 34) continue;
			cumul = 0;
			const d = new Vector3(seg.X, 0, seg.Z);
			if (d.Magnitude < 0.1) continue;
			const normale = new Vector3(-d.Z, 0, d.X).Unit;
			for (const cote of [-1, 1]) {
				if (n >= max) break;
				const k = graine.NextNumber(1.6, 2.2);
				const l = graine.NextInteger(11, 14);
				const pr = graine.NextInteger(9, 11);
				const rayon = (math.max(l, pr) * k) / 2 + 2;
				const pos = auSol(r.points[i].add(normale.mul(cote * (r.largeur / 2 + (pr * k) / 2 + 5))));
				if (dedans ? !dansLesMurs(pos, rayon + 14) : dansLesMurs(pos, -(rayon + 18))) continue;
				if (!libre(pos, rayon, (pr * k) / 2 + 1)) continue;
				const modele = new Instance("Model");
				modele.Name = "Maison";
				modele.Parent = parent;
				maison(pos, l, pr, graine.NextInteger(8, 11), dedans ? TOITS[n % TOITS.size()] : C.toitRouge, modele, {
					murs: MURS_MAISONS[graine.NextInteger(0, MURS_MAISONS.size() - 1)],
					cheminee: graine.NextNumber() < 0.7,
				});
				agrandir(modele, pos, k);
				// la façade (côté +Z) regarde la rue
				const versRue = normale.mul(-cote);
				const rotation = CFrame.Angles(0, math.atan2(versRue.X, versRue.Z), 0);
				modele.PivotTo(new CFrame(pos).mul(rotation));
				obstacles.push({ centre: pos, rayon });
				zonesLibres.push({ centre: pos, rayon: rayon + 4 });
				n++;
				if (n % 3 === 1) {
					const metiers = dedans ? METIERS_VILLE : METIERS_HAMEAU;
					const porte = pos.add(new CFrame(Vector3.zero).mul(rotation).PointToWorldSpace(new Vector3(0, 0, (pr * k) / 2 + 2.5)));
					maisonHabitee(porte, metiers[habitees % metiers.size()], modele, versRue);
					habitees++;
				} else if (graine.NextNumber() < 0.25) {
					charrette(pos.add(normale.mul(-cote * ((pr * k) / 2 + 3))).add(d.Unit.mul(rayon * 0.8)), math.atan2(d.X, d.Z), modele);
				} else if (graine.NextNumber() < 0.3) {
					tonneau(auSol(pos.add(normale.mul(-cote * ((pr * k) / 2 + 2))).add(d.Unit.mul(rayon * 0.6))), modele);
				}
			}
		}
	}
}

/** Champs, meules, épouvantails et moulins autour d'un point de la campagne. */
function campagne(parent: Instance, centre: Vector3, rayon: number, nbChamps: number, nbMoulins: number, graine: Random) {
	let poses = 0;
	for (let essai = 0; essai < nbChamps * 12 && poses < nbChamps; essai++) {
		const a = graine.NextNumber(0, 2 * math.pi);
		const r = graine.NextNumber(rayon * 0.3, rayon);
		const pos = auSol(centre.add(new Vector3(math.cos(a) * r, 0, math.sin(a) * r)));
		const l = graine.NextInteger(56, 80);
		const p = graine.NextInteger(36, 50);
		const rc = math.max(l, p) / 2 + 4;
		if (dansLesMurs(pos, -(rc + 30)) || !libre(pos, rc)) continue;
		const angle = graine.NextNumber(-0.35, 0.35);
		champ(pos, l, p, angle, parent, poses % 2 === 0);
		if (poses % 3 === 0) epouvantail(pos, parent);
		if (poses % 2 === 1) meule(pos.add(new Vector3(l / 2 + 8, 0, 0)), parent);
		obstacles.push({ centre: pos, rayon: rc });
		zonesLibres.push({ centre: pos, rayon: rc + 6 });
		poses++;
	}
	const vent = new Vector3(1, 0, -0.4);
	let moulins = 0;
	for (let essai = 0; essai < 40 && moulins < nbMoulins; essai++) {
		const a = graine.NextNumber(0, 2 * math.pi);
		const r = graine.NextNumber(rayon * 0.4, rayon * 1.05);
		const pos = centre.add(new Vector3(math.cos(a) * r, 0, math.sin(a) * r));
		if (dansLesMurs(pos, -60) || !libre(pos, 24)) continue;
		// le moulin est posé sur une petite butte
		plateforme(pos, 18, 18, 5, 14);
		moulin(pos, vent, parent);
		obstacles.push({ centre: pos, rayon: 24 });
		zonesLibres.push({ centre: pos, rayon: 30 });
		moulins++;
	}
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

	const region = CONTENU.regions.aubeclaire;
	const place = region.lieux.find((l) => l.id === "lysmont-place");
	const centrePlace = place ? positionLieu(place) : new Vector3();

	// on apparaît sur la grande place, au sud de la fontaine
	const apparition = new Instance("SpawnLocation");
	apparition.Anchored = true;
	apparition.Size = new Vector3(8, 1, 8);
	apparition.Position = centrePlace.add(new Vector3(0, 0.5, 40));
	apparition.Transparency = 1;
	apparition.CanCollide = false;
	apparition.Neutral = true;
	apparition.Duration = 0;
	apparition.Parent = dossier;

	// les buttes d'abord (le château domine la ville, le temple est sur sa colline)
	const chateau = region.lieux.find((l) => l.id === "chateau");
	if (chateau) {
		// la butte porte toute la forteresse (180 × 150 studs, tours d'angle comprises)
		const c = positionLieu(chateau);
		plateforme(new Vector3(c.X, 0, c.Z - 45), 214, 184, c.Y, 26);
		obstacles.push({ centre: new Vector3(c.X, 0, c.Z - 45), rayon: 135 });
	}
	const temple = region.lieux.find((l) => l.id === "temple-du-seuil");
	if (temple) {
		const c = positionLieu(temple);
		plateforme(new Vector3(c.X, 0, c.Z), 98, 78, c.Y, 16);
		obstacles.push({ centre: c, rayon: 70 });
	}

	const graine = new Random(1012);
	const ouvertures: number[] = [];
	const ville = new Instance("Model");
	ville.Name = "Quartiers";
	ville.Parent = dossier;
	let numeroRue = 0;
	for (const l of region.lieux) {
		if (l.etape_seulement === true) {
			balise(l);
			continue;
		}
		const modele = new Instance("Model");
		modele.Name = l.id;
		modele.Parent = dossier;
		const centre = positionLieu(l);
		const k = AGRANDISSEMENT[l.id] ?? GRANDEUR.maison;
		const rayon = l.id === "chateau" ? 120 : l.id === "combe-aux-saules" ? 34 * k : 26 * k;
		zonesLibres.push({ centre, rayon });
		obstacles.push({ centre, rayon });
		const porteBase = construire(l, centre, modele, k);
		agrandir(modele, centre, k);
		const porte = pointAgrandi(porteBase, centre, k);
		arbresAutour(l, centre, k);
		if (l.id === "temple-du-seuil") {
			// la route du temple contourne la butte du château par l'ouest et sort par la porte nord-ouest
			const w1 = new Vector3(-172, 0, -90);
			const w2 = new Vector3(-176, 0, -250);
			rue(bordDePlace(centrePlace, w1), w1, 18, 2000 + numeroRue++, true, 0.08);
			rue(w1, w2, 18, 2000 + numeroRue++, true, 0.03);
			const points = rue(w2, porte, 14, 2000 + numeroRue++, false, 0.1);
			ajouterOuverture(ouvertures, sortieDesMurs([w2, ...points]));
		} else if (l.id !== "lysmont-place") {
			// une rue courbe depuis la place ; si elle sort des remparts, une porte fortifiée à cet endroit
			const points = rue(bordDePlace(centrePlace, porte), porte, dansLesMurs(porte) ? 18 : 14, 2000 + numeroRue++, dansLesMurs(porte));
			ajouterOuverture(ouvertures, sortieDesMurs(points));
		}

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
	// ruelles entre quartiers (elles relient les rues principales)
	const parId = (id: string) => region.lieux.find((x) => x.id === id);
	for (const [a, b] of [["taverne", "boutique"], ["guilde", "quartier-tanneurs"], ["guilde", "arene"], ["boutique", "quartier-tanneurs"]] as const) {
		const la = parId(a);
		const lb = parId(b);
		if (la && lb) rue(positionLieu(la).add(new Vector3(0, 0, 70)), positionLieu(lb).add(new Vector3(0, 0, 70)), 12, 3000 + numeroRue++, true, 0.22);
	}
	// la grande route du sud : de la place à la porte sud, puis jusqu'au village de Hautepierre
	const porteSud = MURS.centre.add(new Vector3(0, 0, MURS.rz));
	const hameau = new Vector3(70, 0, 820);
	rue(bordDePlace(centrePlace, porteSud), porteSud, 18, 4000, true, 0.08);
	ajouterOuverture(ouvertures, math.pi / 2);
	rue(porteSud, hameau, 14, 4001, false, 0.22);

	// remparts de la ville, posés sur le terrain, avec une porte fortifiée sur chaque route qui sort
	const murs = new Instance("Model");
	murs.Name = "Remparts";
	murs.Parent = dossier;
	enceinte(MURS.centre, MURS.rx, MURS.rz, ouvertures, murs);
	for (let i = 0; i < 90; i++) {
		const a = (i / 90) * 2 * math.pi;
		zonesLibres.push({ centre: MURS.centre.add(new Vector3(math.cos(a) * MURS.rx, 0, math.sin(a) * MURS.rz)), rayon: 22 });
	}
	// la ville : maisons le long des rues, réverbères, puits
	bordsDeRues(ville, graine, true, 80);
	for (const r of rues) if (r.dedans) reverberes(r.points, r.largeur, ville);
	for (const p of [new Vector3(-150, 0, 160), new Vector3(150, 0, 110)]) {
		if (libre(p, 6)) {
			puits(p, ville);
			obstacles.push({ centre: p, rayon: 6 });
		}
	}
	// le faubourg : le village de Hautepierre, ses fermes, ses champs de blé et ses moulins
	const faubourg = new Instance("Model");
	faubourg.Name = "Hautepierre";
	faubourg.Parent = dossier;
	puits(hameau, faubourg);
	obstacles.push({ centre: hameau, rayon: 10 });
	bordsDeRues(faubourg, graine, false, 18);
	campagne(faubourg, hameau.add(new Vector3(0, 0, -60)), 420, 14, 3, graine);
	// et autour de la ferme de la Combe-aux-Saules
	const combe = parId("combe-aux-saules");
	if (combe) campagne(faubourg, positionLieu(combe), 220, 5, 1, graine);
	vegetation();
	task.spawn(() => villageois(centrePlace));
}
