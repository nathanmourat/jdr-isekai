/**
 * Ville vivante (serveur) :
 *  - cycle jour / nuit réel (une journée ≈ 20 minutes) : fenêtres et lanternes allumées la nuit ;
 *  - villageois qui se promènent entre la place et les portes, et rentrent chez eux la nuit ;
 *  - gardes en patrouille (jour et nuit) ;
 *  - bulles de phrases d'ambiance (content/monde/ambiance.yaml), selon l'avancée de la partie ;
 *  - marché sur la place (étals, marchands), poules, chats et chevaux.
 */
import { CollectionService, Lighting, TweenService, Workspace } from "@rbxts/services";
import { piece, souder } from "shared/construction";
import { CONTENU } from "shared/donnees";
import { positionLieu } from "shared/geo";
import { conditionScene, listeHeros } from "shared/moteur";
import { bloc, C, VERTICAL } from "./decor";
import { humanoide, quadrupede, type Costume } from "./modeles";
import { ouvertes } from "./parties";

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);
const DUREE_JOUR = 20 * 60; // secondes réelles pour 24 h de jeu
const ANIM_MARCHE = "rbxassetid://507777826";
const ANIM_REPOS = "rbxassetid://507766666";
const hasard = new Random(1012);

let dossier: Folder;
let nuit = false;
let centrePlace = new Vector3();
/** Portes des lieux (là où les villageois vont et viennent). */
const portes: { lieu: string; position: Vector3 }[] = [];

// ───────────────────────────── Jour et nuit ─────────────────────────────

function appliquerNuit(estNuit: boolean) {
	nuit = estNuit;
	// pièces marquées « Nuit » (fenêtres, flammes) : liste tenue à jour par CollectionService, sans tout parcourir
	for (const e of CollectionService.GetTagged("Nuit")) {
		if (e.IsA("BasePart")) {
			e.Material = estNuit ? Enum.Material.Neon : Enum.Material.Glass;
			for (const l of e.GetChildren()) if (l.IsA("PointLight")) l.Enabled = estNuit;
		}
	}
	// nuit : teinte bleutée, nuages gris ; jour : lumière chaude
	const couleurs = Lighting.FindFirstChild("Couleurs") as ColorCorrectionEffect | undefined;
	if (couleurs) TweenService.Create(couleurs, new TweenInfo(8), { TintColor: estNuit ? rgb(200, 210, 255) : rgb(255, 245, 230), Saturation: estNuit ? -0.05 : 0.15 }).Play();
	const nuages = Workspace.Terrain.FindFirstChildOfClass("Clouds");
	if (nuages) TweenService.Create(nuages, new TweenInfo(8), { Color: estNuit ? rgb(90, 95, 120) : rgb(255, 246, 236) }).Play();
	const atmo = Lighting.FindFirstChildOfClass("Atmosphere");
	if (atmo) {
		TweenService.Create(atmo, new TweenInfo(8), {
			Color: estNuit ? rgb(70, 80, 120) : rgb(230, 200, 170),
			Decay: estNuit ? rgb(30, 30, 60) : rgb(110, 90, 120),
			Density: estNuit ? 0.38 : 0.32,
		}).Play();
	}
	TweenService.Create(Lighting, new TweenInfo(8), { OutdoorAmbient: estNuit ? rgb(60, 65, 95) : rgb(120, 110, 100) }).Play();
}

function cycleJourNuit() {
	Lighting.ClockTime = 9;
	appliquerNuit(false);
	let dernier = os.clock();
	while (true) {
		task.wait(0.5);
		const maintenant = os.clock();
		Lighting.ClockTime = (Lighting.ClockTime + ((maintenant - dernier) * 24) / DUREE_JOUR) % 24;
		dernier = maintenant;
		const t = Lighting.ClockTime;
		const estNuit = t < 6.3 || t > 18.7;
		if (estNuit !== nuit) appliquerNuit(estNuit);
	}
}

// ───────────────────────────── Bulles de phrases ─────────────────────────────

/** Partie de référence pour les conditions (la première partie ouverte avec des joueurs présents). */
function partieDeReference() {
	for (const [, p] of ouvertes) if (p.membres.size() > 0) return p.etat;
	return undefined;
}

function lieuProche(position: Vector3): string | undefined {
	let meilleur: string | undefined;
	let distance = 45;
	for (const p of portes) {
		const d = p.position.sub(position).Magnitude;
		if (d < distance) {
			distance = d;
			meilleur = p.lieu;
		}
	}
	if (position.sub(centrePlace).Magnitude < 40) return "lysmont-place";
	return meilleur;
}

function choisirPhrase(qui: string, position: Vector3): string | undefined {
	const etat = partieDeReference();
	const heros = etat ? listeHeros(etat).map((h) => h.id) : [];
	const lieu = lieuProche(position);
	const possibles: string[] = [];
	for (const [, a] of pairs(CONTENU.ambiance)) {
		if (a.qui !== qui) continue;
		if (a.moment === "jour" && nuit) continue;
		if (a.moment === "nuit" && !nuit) continue;
		if (a.lieu !== undefined && a.lieu !== lieu) continue;
		if (a.si !== undefined) {
			if (!etat) continue;
			const [ok, vrai] = pcall(() => conditionScene(CONTENU, etat, a.si, heros));
			if (!ok || !vrai) continue;
		}
		possibles.push(a.texte);
	}
	return possibles.size() > 0 ? possibles[hasard.NextInteger(0, possibles.size() - 1)] : undefined;
}

/** Bulle au-dessus de la tête d'un personnage pendant quelques secondes. */
export function dire(modele: Model, texte: string) {
	const tete = (modele.FindFirstChild("Head") ?? modele.PrimaryPart) as BasePart | undefined;
	if (!tete) return;
	modele.FindFirstChild("Bulle")?.Destroy();
	const gui = new Instance("BillboardGui");
	gui.Name = "Bulle";
	gui.Size = new UDim2(0, 220, 0, 60);
	gui.StudsOffset = new Vector3(0, 2.6, 0);
	gui.MaxDistance = 60;
	gui.Adornee = tete;
	const fond = new Instance("TextLabel");
	fond.Size = UDim2.fromScale(1, 1);
	fond.BackgroundColor3 = rgb(250, 245, 230);
	fond.BackgroundTransparency = 0.05;
	fond.TextColor3 = rgb(40, 30, 20);
	fond.Font = Enum.Font.Gotham;
	fond.TextSize = 14;
	fond.TextWrapped = true;
	fond.Text = texte;
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 10);
	coin.Parent = fond;
	const marge = new Instance("UIPadding");
	marge.PaddingLeft = new UDim(0, 6);
	marge.PaddingRight = new UDim(0, 6);
	marge.Parent = fond;
	fond.Parent = gui;
	gui.Parent = modele;
	task.delay(5.5, () => gui.Destroy());
}

// ───────────────────────────── Villageois et gardes ─────────────────────────────

const TENUES: Costume[] = [
	{ peau: rgb(225, 190, 160), haut: rgb(120, 60, 50), bas: rgb(70, 60, 50) },
	{ peau: rgb(200, 160, 120), haut: rgb(70, 100, 140), bas: rgb(60, 55, 50) },
	{ peau: rgb(235, 205, 180), haut: rgb(150, 130, 80), bas: rgb(90, 70, 50) },
	{ peau: rgb(170, 125, 90), haut: rgb(90, 120, 80), bas: rgb(70, 60, 45) },
	{ peau: rgb(225, 190, 160), haut: rgb(160, 120, 150), bas: rgb(80, 60, 70), capuche: rgb(140, 100, 130) },
	{ peau: rgb(200, 160, 120), haut: rgb(200, 190, 160), bas: rgb(110, 90, 60), chapeau: rgb(190, 160, 100) },
	{ peau: rgb(235, 205, 180), haut: rgb(110, 80, 60), bas: rgb(60, 50, 40), tablier: rgb(220, 215, 200) },
];
const GARDE: Costume = { peau: rgb(220, 185, 150), haut: rgb(170, 175, 190), bas: rgb(80, 85, 110), classe: "gardien" };

function animer(modele: Model) {
	const h = modele.FindFirstChildOfClass("Humanoid");
	if (!h) return;
	const animateur = h.FindFirstChildOfClass("Animator") ?? new Instance("Animator", h);
	const charger = (id: string, boucle: boolean) => {
		const [ok, piste] = pcall(() => {
			const a = new Instance("Animation");
			a.AnimationId = id;
			const p = animateur.LoadAnimation(a);
			p.Looped = boucle;
			return p;
		});
		return ok ? (piste as AnimationTrack) : undefined;
	};
	const marche = charger(ANIM_MARCHE, true);
	const repos = charger(ANIM_REPOS, true);
	repos?.Play();
	h.Running.Connect((vitesse) => {
		if (vitesse > 0.5) {
			if (marche && !marche.IsPlaying) marche.Play(0.2);
		} else marche?.Stop(0.2);
	});
}

/** Va jusqu'à un point (MoveTo s'arrête seul au bout de 8 s : on relance jusqu'à l'arrivée). */
function allerA(h: Humanoid, racine: BasePart, but: Vector3) {
	for (let essai = 0; essai < 12; essai++) {
		if (!racine.Parent) return;
		h.MoveTo(but);
		let fini = false;
		const lien = h.MoveToFinished.Connect(() => (fini = true));
		const debut = os.clock();
		while (!fini && os.clock() - debut < 8) task.wait(0.25);
		lien.Disconnect();
		const ecart = new Vector3(but.X - racine.Position.X, 0, but.Z - racine.Position.Z).Magnitude;
		if (ecart < 4) return;
	}
}

function pointDePlace(): Vector3 {
	const a = hasard.NextNumber(0, 2 * math.pi);
	const r = hasard.NextNumber(10, 18);
	return centrePlace.add(new Vector3(math.cos(a) * r, 0, math.sin(a) * r));
}

function promeneur(costume: Costume, garde: boolean) {
	const [ok, res] = pcall(() => humanoide(garde ? "Garde" : "Villageois", costume));
	if (!ok) return;
	const m = res as Model;
	const racine = m.PrimaryPart!;
	racine.Anchored = false;
	const h = m.FindFirstChildOfClass("Humanoid")!;
	h.WalkSpeed = garde ? 7 : hasard.NextNumber(5, 7.5);
	m.PivotTo(new CFrame(pointDePlace().add(new Vector3(0, 4, 0))));
	m.Parent = dossier;
	pcall(() => racine.SetNetworkOwner(undefined));
	animer(m);
	const qui = garde ? "garde" : "villageois";
	while (m.Parent) {
		// la nuit, les villageois rentrent chez eux ; les gardes continuent leur ronde
		if (nuit && !garde && portes.size() > 0) {
			const porte = portes[hasard.NextInteger(0, portes.size() - 1)];
			allerA(h, racine, porte.position);
			m.Parent = undefined;
			while (nuit) task.wait(5);
			m.PivotTo(new CFrame(porte.position.add(new Vector3(0, 4, 0))));
			m.Parent = dossier;
		}
		// place → une porte → place (les chemins sont des lignes droites depuis la place)
		allerA(h, racine, pointDePlace());
		task.wait(hasard.NextNumber(2, 6));
		if (hasard.NextNumber() < 0.4) {
			const phrase = choisirPhrase(qui, racine.Position);
			if (phrase !== undefined) dire(m, phrase);
		}
		if (portes.size() > 0) {
			const porte = portes[hasard.NextInteger(0, portes.size() - 1)];
			allerA(h, racine, porte.position.add(new Vector3(hasard.NextNumber(-3, 3), 0, hasard.NextNumber(2, 6))));
			task.wait(hasard.NextNumber(3, 8));
			if (hasard.NextNumber() < 0.5) {
				const phrase = choisirPhrase(qui, racine.Position);
				if (phrase !== undefined) dire(m, phrase);
			}
		}
	}
}

// ───────────────────────────── Marché ─────────────────────────────

const AUVENTS = [rgb(170, 50, 50), rgb(50, 90, 160), rgb(200, 160, 50), rgb(60, 130, 70), rgb(140, 60, 140), rgb(210, 110, 40)];
const MARCHANDISES = [rgb(200, 40, 40), rgb(240, 200, 60), rgb(120, 180, 60), rgb(170, 110, 60), rgb(230, 140, 160)];

function etal(position: Vector3, regard: Vector3, couleur: Color3, nom: string) {
	const m = new Instance("Model");
	m.Name = "Etal";
	m.Parent = dossier;
	const f = CFrame.lookAt(position, new Vector3(regard.X, position.Y, regard.Z));
	const p = (taille: Vector3, decalage: CFrame, coul: Color3, opt: { matiere?: Enum.Material; forme?: "boule" | "cylindre" } = {}) =>
		bloc(taille, f.mul(decalage).Position, coul, { parent: m, rotation: f.Rotation.mul(opt.forme === "cylindre" ? VERTICAL : new CFrame()), matiere: opt.matiere, forme: opt.forme });
	p(new Vector3(8, 3.4, 3), new CFrame(0, 1.7, -1), C.bois, { matiere: Enum.Material.WoodPlanks });
	for (const [x, z] of [[-3.8, -2.4], [3.8, -2.4], [-3.8, 1.5], [3.8, 1.5]] as const) p(new Vector3(0.4, 8, 0.4), new CFrame(x, 4, z), C.bois);
	const auvent = bloc(new Vector3(9, 0.3, 5.4), f.mul(new CFrame(0, 8.2, -0.5)).Position, couleur, { parent: m, matiere: Enum.Material.Fabric });
	auvent.CFrame = f.mul(new CFrame(0, 8.2, -0.5)).mul(CFrame.Angles(math.rad(-12), 0, 0));
	for (let i = 0; i < 10; i++) p(new Vector3(0.8, 0.8, 0.8), new CFrame(-3 + (i % 5) * 1.5, 3.8, -0.4 - math.floor(i / 5) * 1.1), MARCHANDISES[(i + nom.size()) % MARCHANDISES.size()], { forme: "boule" });
	// marchand derrière l'étal, avec l'invite « Acheter » (boutique de la place)
	const [ok, res] = pcall(() => humanoide("Marchand", TENUES[(nom.size() * 3) % TENUES.size()]));
	if (ok) {
		const marchand = res as Model;
		marchand.PivotTo(CFrame.lookAt(f.mul(new CFrame(0, 3, 2.2)).Position, f.mul(new CFrame(0, 3, -6)).Position));
		const invite = new Instance("ProximityPrompt");
		invite.ActionText = "Acheter";
		invite.ObjectText = nom;
		invite.HoldDuration = 0;
		invite.MaxActivationDistance = 10;
		invite.RequiresLineOfSight = false;
		// les étals vendent le catalogue du Comptoir de Halvine (s'il existe, sinon celui de la place)
		const catalogue = CONTENU.regions.aubeclaire.lieux.find((l) => l.id === "boutique") ? "boutique" : "lysmont-place";
		invite.SetAttribute("Lieu", catalogue);
		invite.SetAttribute("Action", "boutique");
		invite.Parent = marchand.PrimaryPart;
		marchand.Parent = m;
		task.spawn(() => {
			while (marchand.Parent) {
				task.wait(hasard.NextNumber(12, 25));
				if (!nuit) {
					const phrase = choisirPhrase("marchand", marchand.PrimaryPart!.Position);
					if (phrase !== undefined) dire(marchand, phrase);
				}
			}
		});
	}
}

function marche() {
	// étals en cercle autour de la fontaine, en évitant l'axe des chemins vers les portes
	const directions = portes.map((p) => {
		const d = p.position.sub(centrePlace);
		return math.atan2(d.Z, d.X);
	});
	const noms = ["Étal de fruits", "Étal de tissus", "Étal d'épices", "Étal de potions", "Étal du boulanger", "Étal de bijoux"];
	let pose = 0;
	for (let k = 0; k < 24 && pose < noms.size(); k++) {
		const a = (k / 24) * 2 * math.pi;
		if (directions.some((d) => math.abs(((a - d + math.pi * 3) % (math.pi * 2)) - math.pi) < 0.3)) continue;
		if (k % 4 !== 0) continue;
		const pos = centrePlace.add(new Vector3(math.cos(a) * 31, 0, math.sin(a) * 31));
		etal(pos, centrePlace, AUVENTS[pose % AUVENTS.size()], noms[pose]);
		pose++;
	}
}

// ───────────────────────────── Animaux ─────────────────────────────

function poule(position: Vector3) {
	const m = new Instance("Model");
	m.Name = "Poule";
	const racine = piece(m, "Racine", new Vector3(1, 1, 1), new CFrame(position.add(new Vector3(0, 0.6, 0))), new Color3(), { transparence: 1 });
	racine.Anchored = true;
	const blanc = rgb(245, 240, 230);
	const parts = [
		piece(m, "Corps", new Vector3(1.2, 1, 1.5), racine.CFrame, blanc, { forme: Enum.PartType.Ball }),
		piece(m, "Tete", new Vector3(0.6, 0.6, 0.6), racine.CFrame.mul(new CFrame(0, 0.6, -0.7)), blanc, { forme: Enum.PartType.Ball }),
		piece(m, "Crete", new Vector3(0.1, 0.3, 0.4), racine.CFrame.mul(new CFrame(0, 1, -0.7)), rgb(220, 40, 40)),
		piece(m, "Bec", new Vector3(0.2, 0.15, 0.3), racine.CFrame.mul(new CFrame(0, 0.55, -1.05)), rgb(240, 170, 40)),
	];
	for (const p of parts) souder(racine, p);
	m.PrimaryPart = racine;
	m.Parent = dossier;
	task.spawn(() => {
		const origine = position;
		while (m.Parent) {
			task.wait(hasard.NextNumber(1.5, 5));
			const but = origine.add(new Vector3(hasard.NextNumber(-7, 7), 0.6, hasard.NextNumber(-7, 7)));
			const cf = CFrame.lookAt(racine.Position, new Vector3(but.X, racine.Position.Y, but.Z));
			racine.CFrame = cf;
			TweenService.Create(racine, new TweenInfo(0.8, Enum.EasingStyle.Sine), { CFrame: CFrame.lookAt(but, but.add(cf.LookVector)) }).Play();
		}
	});
}

function chat(position: Vector3, couleur: Color3) {
	const m = new Instance("Model");
	m.Name = "Chat";
	const racine = piece(m, "Racine", new Vector3(1, 1, 1), new CFrame(position.add(new Vector3(0, 0.5, 0))), new Color3(), { transparence: 1 });
	racine.Anchored = true;
	const queue = piece(m, "Queue", new Vector3(0.25, 0.25, 1.4), racine.CFrame.mul(new CFrame(0, 0.6, 1.2)).mul(CFrame.Angles(math.rad(40), 0, 0)), couleur);
	const parts = [
		piece(m, "Corps", new Vector3(0.9, 0.8, 1.6), racine.CFrame.mul(new CFrame(0, 0.2, 0)), couleur, { matiere: Enum.Material.Fabric }),
		piece(m, "Tete", new Vector3(0.8, 0.7, 0.7), racine.CFrame.mul(new CFrame(0, 0.6, -0.9)), couleur, { matiere: Enum.Material.Fabric }),
		piece(m, "Oreille1", new Vector3(0.2, 0.3, 0.1), racine.CFrame.mul(new CFrame(-0.25, 1.05, -0.9)), couleur),
		piece(m, "Oreille2", new Vector3(0.2, 0.3, 0.1), racine.CFrame.mul(new CFrame(0.25, 1.05, -0.9)), couleur),
	];
	for (const p of parts) souder(racine, p);
	queue.Anchored = true;
	m.PrimaryPart = racine;
	m.Parent = dossier;
	// la queue se balance
	const base = queue.CFrame;
	TweenService.Create(queue, new TweenInfo(1.2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), { CFrame: base.mul(CFrame.Angles(0, math.rad(25), 0)) }).Play();
}

function animaux() {
	const lieu = (id: string) => CONTENU.regions.aubeclaire.lieux.find((l) => l.id === id);
	const combe = lieu("combe-aux-saules");
	const tanneurs = lieu("quartier-tanneurs");
	const chateau = lieu("chateau");
	if (combe) for (let i = 0; i < 6; i++) poule(positionLieu(combe).add(new Vector3(-10 + i * 3, 0, 20)));
	if (tanneurs) for (let i = 0; i < 3; i++) poule(positionLieu(tanneurs).add(new Vector3(-6 + i * 4, 0, 14)));
	const taverne = lieu("taverne");
	if (taverne) chat(positionLieu(taverne).add(new Vector3(-6, 0, 11)), rgb(220, 140, 60));
	if (tanneurs) chat(positionLieu(tanneurs).add(new Vector3(2, 0, 3)), rgb(60, 60, 65));
	chat(centrePlace.add(new Vector3(5, 0, -6)), rgb(240, 240, 235));
	if (chateau) {
		for (const [x, c] of [[-30, rgb(110, 75, 45)], [-36, rgb(60, 45, 35)]] as const) {
			const cheval = quadrupede("Cheval", c, 1.9);
			cheval.PivotTo(new CFrame(positionLieu(chateau).add(new Vector3(x, 0.4, 10))).mul(CFrame.Angles(0, math.rad(90), 0)));
			cheval.Parent = dossier;
		}
	}
}

// ───────────────────────────── Démarrage ─────────────────────────────

export function animerVille() {
	dossier = new Instance("Folder");
	dossier.Name = "VilleVivante";
	dossier.Parent = Workspace;
	const lieux = CONTENU.regions.aubeclaire.lieux;
	const place = lieux.find((l) => l.id === "lysmont-place");
	centrePlace = place ? positionLieu(place) : new Vector3();
	const monde = Workspace.WaitForChild("Velmaris");
	for (const e of monde.GetDescendants()) {
		// les balises des lieux d'étape (hors de la ville) ne sont pas des portes de maisons
		if (e.IsA("BasePart") && e.Name === "Entree" && e.Parent?.GetAttribute("Etape") === undefined) {
			const lieu = e.GetAttribute("Lieu") as string;
			if (lieu !== "lysmont-place") portes.push({ lieu, position: new Vector3(e.Position.X, 0, e.Position.Z) });
		}
	}
	task.spawn(cycleJourNuit);
	task.spawn(() => pcall(marche));
	task.spawn(() => pcall(animaux));
	// 12 villageois et 3 gardes, apparus un par un pour ne pas ralentir le démarrage
	task.spawn(() => {
		for (let i = 0; i < 15; i++) {
			const garde = i < 3;
			task.spawn(() => promeneur(garde ? GARDE : TENUES[i % TENUES.size()], garde));
			task.wait(0.6);
		}
	});
}
