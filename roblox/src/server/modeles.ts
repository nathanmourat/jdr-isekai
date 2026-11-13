/**
 * Modèles 3D des combattants, préparés par le serveur dans ReplicatedStorage.VelmarisModeles
 * (chaque joueur les copie pour son affichage) :
 *  - héros : l'avatar Roblox du joueur + une arme selon sa classe ;
 *  - ennemis humanoïdes (bandit, cultiste, squelette, gobelin, Vorthak…) : personnages Roblox costumés ;
 *  - bêtes, golems, esprits : construits en pièces (loup, rat, araignée, gelée, golem…).
 * Le groupe peut remplacer n'importe quel modèle : mettre un Model nommé comme l'ennemi (ex. « loup-gris »)
 * dans ServerStorage > ModelesDuGroupe ; il est alors utilisé à la place (voir README-ROBLOX.md).
 */
import { Players, ReplicatedStorage, ServerStorage } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { arme, piece, souder } from "shared/construction";

const dossier = new Instance("Folder");
dossier.Name = "VelmarisModeles";

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

/** Modèle « construit » : une racine invisible, toutes les pièces soudées à elle. */
function construit(nom: string, hauteur: number, f: (m: Model, racine: Part) => void): Model {
	const m = new Instance("Model");
	m.Name = nom;
	const racine = piece(m, "Racine", new Vector3(2, 2, 2), new CFrame(0, 1, 0), new Color3(), { transparence: 1 });
	racine.Anchored = true;
	f(m, racine);
	for (const p of m.GetDescendants()) if (p.IsA("BasePart") && p !== racine) souder(racine, p);
	m.PrimaryPart = racine;
	m.SetAttribute("Hauteur", hauteur);
	m.SetAttribute("Humanoide", false);
	return m;
}

// ───────────────────────────── Humanoïdes ─────────────────────────────

export interface Costume {
	peau: Color3;
	haut: Color3;
	bas: Color3;
	echelle?: number;
	cornes?: Color3;
	capuche?: Color3;
	yeux?: Color3;
	classe?: string;
	/** couronne dorée (roi, princesse) */
	couronne?: boolean;
	/** chapeau à large bord (fermier) */
	chapeau?: Color3;
	/** tablier (tavernier, artisan) */
	tablier?: Color3;
}

export function humanoide(nom: string, c: Costume): Model {
	const d = new Instance("HumanoidDescription");
	d.HeadColor = c.peau;
	d.LeftArmColor = c.haut;
	d.RightArmColor = c.haut;
	d.TorsoColor = c.haut;
	d.LeftLegColor = c.bas;
	d.RightLegColor = c.bas;
	const e = c.echelle ?? 1;
	d.HeightScale = e;
	d.WidthScale = e;
	d.DepthScale = e;
	d.HeadScale = e;
	const m = Players.CreateHumanoidModelFromDescriptionAsync(d, Enum.HumanoidRigType.R15);
	m.Name = nom;
	preparerHumanoide(m);
	const tete = m.FindFirstChild("Head") as BasePart | undefined;
	if (tete && c.cornes) {
		for (const cote of [-1, 1]) {
			const corne = piece(m, "Corne", new Vector3(0.35, 1.2, 0.35).mul(e), tete.CFrame.mul(new CFrame(cote * 0.45 * e, 0.8 * e, 0)).mul(CFrame.Angles(0, 0, math.rad(-cote * 25))), c.cornes, { matiere: Enum.Material.Slate });
			souder(tete, corne);
		}
	}
	if (tete && c.capuche) {
		const capuche = piece(m, "Capuche", new Vector3(1.5, 1.4, 1.5).mul(e), tete.CFrame.mul(new CFrame(0, 0.25 * e, 0.1 * e)), c.capuche, { matiere: Enum.Material.Fabric });
		souder(tete, capuche);
	}
	if (tete && c.yeux) {
		for (const cote of [-1, 1]) {
			const oeil = piece(m, "Oeil", new Vector3(0.2, 0.2, 0.1).mul(e), tete.CFrame.mul(new CFrame(cote * 0.22 * e, 0.1 * e, -0.58 * e)), c.yeux, { neon: true });
			souder(tete, oeil);
		}
	}
	if (tete && c.couronne) {
		const couronne = piece(m, "Couronne", new Vector3(1.3, 0.5, 1.3).mul(e), tete.CFrame.mul(new CFrame(0, 0.75 * e, 0)), rgb(230, 185, 60), { matiere: Enum.Material.Metal });
		souder(tete, couronne);
	}
	if (tete && c.chapeau) {
		const bord = piece(m, "Bord", new Vector3(0.2, 2.6, 2.6).mul(e), tete.CFrame.mul(new CFrame(0, 0.6 * e, 0)).mul(CFrame.Angles(0, 0, math.rad(90))), c.chapeau, { forme: Enum.PartType.Cylinder, matiere: Enum.Material.Fabric });
		const calotte = piece(m, "Calotte", new Vector3(1.3, 0.8, 1.3).mul(e), tete.CFrame.mul(new CFrame(0, 0.95 * e, 0)), c.chapeau, { matiere: Enum.Material.Fabric });
		souder(tete, bord);
		souder(tete, calotte);
	}
	const torse = (m.FindFirstChild("UpperTorso") ?? m.FindFirstChild("Torso")) as BasePart | undefined;
	if (torse && c.tablier) {
		const tablier = piece(m, "Tablier", new Vector3(1.8, 2.6, 0.15).mul(e), torse.CFrame.mul(new CFrame(0, -0.8 * e, -0.55 * e)), c.tablier, { matiere: Enum.Material.Fabric });
		souder(torse, tablier);
	}
	if (c.classe !== undefined) arme(m, c.classe);
	m.SetAttribute("Hauteur", 5.5 * e);
	return m;
}

export function preparerHumanoide(m: Model) {
	const h = m.FindFirstChildOfClass("Humanoid");
	if (h) {
		h.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None;
		h.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOff;
	}
	m.FindFirstChild("Animate")?.Destroy();
	for (const p of m.GetDescendants()) if (p.IsA("BasePart")) p.CanCollide = false;
	const racine = m.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (racine) {
		racine.Anchored = true;
		m.PrimaryPart = racine;
	}
	m.SetAttribute("Humanoide", true);
}

// ───────────────────────────── Bêtes, golems, esprits ─────────────────────────────

export function quadrupede(nom: string, couleur: Color3, taille: number, options: { defenses?: boolean; spectral?: boolean } = {}): Model {
	return construit(nom, 3.2 * taille, (m, r) => {
		const o = r.CFrame.mul(new CFrame(0, 0.6 * taille, 0));
		const opt = options.spectral ? { matiere: Enum.Material.ForceField, transparence: 0.2 } : { matiere: Enum.Material.Fabric };
		piece(m, "Corps", new Vector3(1.6, 1.4, 3.4).mul(taille), o.mul(new CFrame(0, 0.4 * taille, 0)), couleur, opt);
		piece(m, "Tete", new Vector3(1.2, 1.1, 1.3).mul(taille), o.mul(new CFrame(0, 0.9 * taille, -2 * taille)), couleur, opt);
		piece(m, "Museau", new Vector3(0.6, 0.5, 0.8).mul(taille), o.mul(new CFrame(0, 0.7 * taille, -2.9 * taille)), couleur.Lerp(new Color3(0, 0, 0), 0.3), opt);
		for (const x of [-0.35, 0.35]) piece(m, "Oreille", new Vector3(0.3, 0.6, 0.2).mul(taille), o.mul(new CFrame(x * taille, 1.6 * taille, -1.8 * taille)), couleur, opt);
		for (const x of [-0.25, 0.25]) piece(m, "Oeil", new Vector3(0.15, 0.15, 0.1).mul(taille), o.mul(new CFrame(x * taille, 1.1 * taille, -2.66 * taille)), options.spectral ? rgb(150, 255, 255) : rgb(255, 210, 60), { neon: true });
		for (const [x, z] of [[-0.55, -1.2], [0.55, -1.2], [-0.55, 1.2], [0.55, 1.2]] as const) piece(m, "Patte", new Vector3(0.45, 1.4, 0.45).mul(taille), o.mul(new CFrame(x * taille, -0.7 * taille, z * taille)), couleur, opt);
		piece(m, "Queue", new Vector3(0.3, 0.3, 1.4).mul(taille), o.mul(new CFrame(0, 0.7 * taille, 2.2 * taille)).mul(CFrame.Angles(math.rad(25), 0, 0)), couleur, opt);
		if (options.defenses) for (const x of [-0.3, 0.3]) piece(m, "Defense", new Vector3(0.15, 0.15, 0.6).mul(taille), o.mul(new CFrame(x * taille, 0.5 * taille, -3.2 * taille)).mul(CFrame.Angles(math.rad(-30), 0, 0)), rgb(240, 235, 220));
	});
}

function araignee(nom: string): Model {
	return construit(nom, 3, (m, r) => {
		const o = r.CFrame;
		const noir = rgb(30, 28, 32);
		piece(m, "Abdomen", new Vector3(2.6, 2, 2.8), o.mul(new CFrame(0, 1.2, 1)), noir, { forme: Enum.PartType.Ball, matiere: Enum.Material.Fabric });
		piece(m, "Tete", new Vector3(1.5, 1.2, 1.5), o.mul(new CFrame(0, 1, -0.9)), noir, { forme: Enum.PartType.Ball });
		for (const x of [-0.3, 0, 0.3]) piece(m, "Oeil", new Vector3(0.2, 0.2, 0.1), o.mul(new CFrame(x, 1.25, -1.62)), rgb(220, 30, 30), { neon: true });
		for (let i = 0; i < 4; i++) {
			for (const cote of [-1, 1]) {
				const z = -0.8 + i * 0.55;
				piece(m, "Patte", new Vector3(2.6, 0.2, 0.2), o.mul(new CFrame(cote * 1.6, 0.8, z)).mul(CFrame.Angles(0, math.rad(cote * (i - 1.5) * 12), math.rad(cote * -25))), noir);
			}
		}
	});
}

function chauveSouris(nom: string): Model {
	return construit(nom, 5, (m, r) => {
		const o = r.CFrame.mul(new CFrame(0, 3, 0));
		const c = rgb(40, 32, 40);
		piece(m, "Corps", new Vector3(0.9, 1.2, 0.9), o, c, { forme: Enum.PartType.Ball });
		for (const cote of [-1, 1]) piece(m, "Aile", new Vector3(2.4, 0.1, 1.3), o.mul(new CFrame(cote * 1.5, 0.2, 0)).mul(CFrame.Angles(0, 0, math.rad(cote * 15))), c);
		for (const cote of [-0.2, 0.2]) piece(m, "Oeil", new Vector3(0.15, 0.15, 0.1), o.mul(new CFrame(cote, 0.2, -0.45)), rgb(255, 80, 80), { neon: true });
	});
}

function gelee(nom: string, couleur: Color3): Model {
	return construit(nom, 3, (m, r) => {
		piece(m, "Gelee", new Vector3(3, 2.2, 3), r.CFrame.mul(new CFrame(0, 0.2, 0)), couleur, { forme: Enum.PartType.Ball, matiere: Enum.Material.Glass, transparence: 0.25 });
		piece(m, "Noyau", new Vector3(0.9, 0.9, 0.9), r.CFrame.mul(new CFrame(0, 0.3, 0)), couleur.Lerp(new Color3(1, 1, 1), 0.4), { forme: Enum.PartType.Ball, neon: true });
	});
}

function feuFollet(nom: string): Model {
	return construit(nom, 5, (m, r) => {
		const coeur = piece(m, "Flamme", new Vector3(1.6, 1.6, 1.6), r.CFrame.mul(new CFrame(0, 2.5, 0)), rgb(255, 150, 40), { forme: Enum.PartType.Ball, neon: true });
		const feu = new Instance("Fire");
		feu.Size = 4;
		feu.Heat = 6;
		feu.Parent = coeur;
		const lumiere = new Instance("PointLight");
		lumiere.Color = rgb(255, 160, 60);
		lumiere.Range = 14;
		lumiere.Parent = coeur;
	});
}

function golem(nom: string, couleur: Color3, taille: number, lueur: Color3): Model {
	return construit(nom, 6.5 * taille, (m, r) => {
		const o = r.CFrame.mul(new CFrame(0, 1.6 * taille, 0));
		const opt = { matiere: Enum.Material.Rock };
		piece(m, "Torse", new Vector3(3.2, 3, 2).mul(taille), o.mul(new CFrame(0, 1.4 * taille, 0)), couleur, opt);
		piece(m, "Tete", new Vector3(1.6, 1.4, 1.5).mul(taille), o.mul(new CFrame(0, 3.6 * taille, 0)), couleur, opt);
		for (const x of [-0.35, 0.35]) piece(m, "Oeil", new Vector3(0.3, 0.2, 0.1).mul(taille), o.mul(new CFrame(x * taille, 3.7 * taille, -0.78 * taille)), lueur, { neon: true });
		piece(m, "Coeur", new Vector3(0.8, 0.8, 0.2).mul(taille), o.mul(new CFrame(0, 1.6 * taille, -1.02 * taille)), lueur, { neon: true });
		for (const x of [-2.1, 2.1]) piece(m, "Bras", new Vector3(1.1, 3.2, 1.1).mul(taille), o.mul(new CFrame(x * taille, 0.9 * taille, 0)), couleur, opt);
		for (const x of [-0.8, 0.8]) piece(m, "Jambe", new Vector3(1.2, 2.2, 1.2).mul(taille), o.mul(new CFrame(x * taille, -0.9 * taille, 0)), couleur, opt);
	});
}

function tourelle(nom: string): Model {
	return construit(nom, 6, (m, r) => {
		piece(m, "Socle", new Vector3(4, 2.6, 2.6), r.CFrame.mul(new CFrame(0, 1, 0)).mul(CFrame.Angles(0, 0, math.rad(90))), rgb(110, 105, 100), { forme: Enum.PartType.Cylinder, matiere: Enum.Material.Cobblestone });
		piece(m, "Oeil", new Vector3(1.2, 1.2, 1.2), r.CFrame.mul(new CFrame(0, 3.6, 0)), rgb(120, 200, 255), { forme: Enum.PartType.Ball, neon: true });
	});
}

// ───────────────────────────── Catalogue ─────────────────────────────

export const COSTUMES: Record<string, Costume> = {
	"gobelin-cendre": { peau: rgb(110, 140, 70), haut: rgb(90, 70, 50), bas: rgb(70, 55, 40), echelle: 0.7, yeux: rgb(255, 120, 40), classe: "ombre" },
	bandit: { peau: rgb(225, 180, 140), haut: rgb(110, 80, 55), bas: rgb(60, 50, 40), capuche: rgb(70, 60, 50), classe: "ombre" },
	cultiste: { peau: rgb(220, 190, 160), haut: rgb(110, 25, 30), bas: rgb(70, 15, 20), capuche: rgb(90, 20, 25), yeux: rgb(255, 60, 60), classe: "arcaniste" },
	squelette: { peau: rgb(235, 230, 215), haut: rgb(235, 230, 215), bas: rgb(235, 230, 215), yeux: rgb(120, 200, 255), classe: "lame-runique" },
	vorthak: { peau: rgb(120, 30, 30), haut: rgb(50, 20, 25), bas: rgb(35, 15, 18), echelle: 1.6, cornes: rgb(40, 35, 35), yeux: rgb(255, 200, 60), classe: "berserker" },
	"ref-brute": { peau: rgb(200, 160, 120), haut: rgb(120, 60, 40), bas: rgb(60, 40, 30), echelle: 1.2, classe: "berserker" },
	"ref-mage": { peau: rgb(220, 190, 160), haut: rgb(60, 60, 140), bas: rgb(40, 40, 90), capuche: rgb(50, 50, 120), classe: "arcaniste" },
	"ref-faible": { peau: rgb(220, 190, 160), haut: rgb(140, 130, 110), bas: rgb(90, 80, 70), classe: "ombre" },
	"ref-chef": { peau: rgb(200, 160, 120), haut: rgb(150, 120, 40), bas: rgb(80, 60, 30), echelle: 1.3, classe: "gardien" },
	"mannequin-entrainement": { peau: rgb(190, 150, 100), haut: rgb(170, 130, 85), bas: rgb(150, 115, 75), echelle: 1.2 },
	aveline: { peau: rgb(235, 200, 170), haut: rgb(170, 175, 190), bas: rgb(80, 85, 110), classe: "gardien" },
};

function modelePour(id: string, categorie: string): Model {
	const costume = COSTUMES[id];
	if (costume) return humanoide(id, costume);
	switch (id) {
		case "loup-gris":
		case "ref-rapide":
			return quadrupede(id, rgb(120, 120, 125), 1);
		case "loup-spectral":
			return quadrupede(id, rgb(120, 220, 255), 1.1, { spectral: true });
		case "rat-geant":
			return quadrupede(id, rgb(110, 90, 75), 0.6);
		case "sanglier":
			return quadrupede(id, rgb(80, 60, 45), 1.1, { defenses: true });
		case "araignee-geante":
			return araignee(id);
		case "chauve-souris":
			return chauveSouris(id);
		case "gelee-verte":
			return gelee(id, rgb(90, 200, 90));
		case "feu-follet":
			return feuFollet(id);
		case "golem-de-pierre":
			return golem(id, rgb(130, 125, 115), 1, rgb(255, 170, 60));
		case "golem-fontaine":
			return golem(id, rgb(100, 120, 140), 1.4, rgb(80, 200, 255));
		case "colosse":
			return golem(id, rgb(90, 85, 80), 1.7, rgb(255, 90, 60));
		case "tourelle":
			return tourelle(id);
	}
	// nouvel ennemi sans modèle dédié : selon sa catégorie
	if (categorie === "bete") return quadrupede(id, rgb(110, 100, 90), 1);
	if (categorie === "construction") return golem(id, rgb(120, 115, 110), 1, rgb(255, 170, 60));
	return humanoide(id, { peau: rgb(220, 190, 160), haut: rgb(90, 90, 100), bas: rgb(60, 60, 70), classe: "ombre" });
}

/** Modèle fourni par le groupe (ServerStorage > ModelesDuGroupe > <id>), s'il existe. */
function modeleDuGroupe(id: string): Model | undefined {
	const m = ServerStorage.FindFirstChild("ModelesDuGroupe")?.FindFirstChild(id);
	if (!m || !m.IsA("Model")) return undefined;
	const copie = m.Clone();
	for (const s of copie.GetDescendants()) if (s.IsA("BaseScript")) s.Destroy(); // jamais de scripts dans un modèle importé
	if (copie.FindFirstChildOfClass("Humanoid")) preparerHumanoide(copie);
	else {
		const racine = copie.PrimaryPart ?? copie.FindFirstChildWhichIsA("BasePart");
		if (racine) {
			copie.PrimaryPart = racine;
			for (const p of copie.GetDescendants()) if (p.IsA("BasePart")) p.Anchored = p === racine;
		}
		copie.SetAttribute("Humanoide", false);
	}
	if (copie.GetAttribute("Hauteur") === undefined) copie.SetAttribute("Hauteur", copie.GetExtentsSize().Y + 1);
	return copie;
}

function ajouter(id: string, m: Model) {
	dossier.FindFirstChild(id)?.Destroy();
	m.Name = id;
	m.Parent = dossier;
}

/** Avatar Roblox du joueur, en héros (avec l'arme de sa classe, ajoutée à l'affichage selon la partie). */
function modeleJoueur(joueur: Player) {
	const [ok, desc] = pcall(() => Players.GetHumanoidDescriptionFromUserIdAsync(math.max(1, joueur.UserId) as never));
	const m = ok
		? Players.CreateHumanoidModelFromDescriptionAsync(desc as HumanoidDescription, Enum.HumanoidRigType.R15)
		: humanoide("joueur", { peau: rgb(230, 190, 150), haut: rgb(60, 90, 160), bas: rgb(50, 50, 60) });
	preparerHumanoide(m);
	m.SetAttribute("Hauteur", 6);
	ajouter(`joueur-u${joueur.UserId}`, m);
}

export function preparerModeles() {
	dossier.Parent = ReplicatedStorage;
	for (const j of Players.GetPlayers()) task.spawn(() => pcall(() => modeleJoueur(j)));
	Players.PlayerAdded.Connect((j) => pcall(() => modeleJoueur(j)));
	for (const [id, e] of pairs(CONTENU.ennemis as Record<string, { categorie: string }>)) {
		const [ok, m] = pcall(() => modeleDuGroupe(id) ?? modelePour(id, e.categorie));
		if (ok && m) ajouter(id, m as Model);
		else warn(`[Velmaris] Modèle 3D de ${id} : ${tostring(m)}`);
	}
	for (const [id] of pairs(CONTENU.compagnons)) {
		const [ok, m] = pcall(() => modeleDuGroupe(id) ?? modelePour(id, "humanoide"));
		if (ok && m) ajouter(id, m as Model);
	}
	// modèles de héros génériques, un par classe (si l'avatar d'un joueur n'est pas disponible)
	for (const [id] of pairs(CONTENU.classes)) {
		const [ok, m] = pcall(() => humanoide(`classe-${id}`, { peau: rgb(230, 190, 150), haut: rgb(60, 90, 160), bas: rgb(50, 50, 60), classe: id }));
		if (ok && m) ajouter(`classe-${id}`, m as Model);
	}
}
