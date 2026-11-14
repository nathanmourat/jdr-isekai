/**
 * Modèles 3D des combattants, préparés par le serveur dans ReplicatedStorage.VelmarisModeles
 * (chaque joueur les copie pour son affichage) :
 *  - héros : l'avatar Roblox du joueur + une arme selon sa classe ;
 *  - ennemis humanoïdes (bandit, cultiste, squelette, gobelin, Vorthak…) : personnages Roblox costumés ;
 *  - bêtes, golems, esprits : construits en pièces (loup, rat, araignée, gelée, golem…).
 * Le groupe peut remplacer n'importe quel modèle : mettre un Model nommé comme l'ennemi (ex. « loup-gris »)
 * dans ServerStorage > ModelesDuGroupe ; il est alors utilisé à la place (voir README-ROBLOX.md).
 */
import { GROUPE_PNJ, mettreDansGroupe } from "./collisions";
import { Players, ReplicatedStorage, ServerStorage } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { arme, piece, souder } from "shared/construction";
import { equiperPersonnage, type EquipementPorte } from "shared/equipement3d";

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
	/** objets du catalogue portés (apparence seulement) : remplacent l'arme de la classe */
	equipement?: EquipementPorte;
	/** oreilles pointues (gobelins) */
	oreilles?: Color3;
	/** cape dans le dos */
	cape?: Color3;
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
	// les PNJ (villageois, gardes, personnages des intérieurs…) ne bloquent pas les joueurs
	mettreDansGroupe(m, GROUPE_PNJ);
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
	if (tete && c.oreilles) {
		for (const cote of [-1, 1]) {
			const o = piece(m, "OreillePointue", new Vector3(0.9, 0.35, 0.15).mul(e), tete.CFrame.mul(new CFrame(cote * 0.75 * e, 0.15 * e, 0)).mul(CFrame.Angles(0, 0, math.rad(cote * 18))), c.oreilles, {});
			souder(tete, o);
		}
		const nez = piece(m, "Nez", new Vector3(0.25, 0.25, 0.45).mul(e), tete.CFrame.mul(new CFrame(0, -0.05 * e, -0.65 * e)), c.oreilles, {});
		souder(tete, nez);
	}
	if (torse && c.cape) {
		const cape = piece(m, "Cape", new Vector3(1.9, 3.4, 0.12).mul(e), torse.CFrame.mul(new CFrame(0, -1.0 * e, 0.62 * e)).mul(CFrame.Angles(math.rad(-6), 0, 0)), c.cape, { matiere: Enum.Material.Fabric });
		souder(torse, cape);
		const col = piece(m, "Col", new Vector3(2.1, 0.3, 1.3).mul(e), torse.CFrame.mul(new CFrame(0, 0.95 * e, 0)), c.cape, { matiere: Enum.Material.Fabric });
		souder(torse, col);
	}
	if (c.equipement !== undefined) pcall(() => equiperPersonnage(m, CONTENU, c.equipement, c.classe));
	else if (c.classe !== undefined) arme(m, c.classe);
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

/** Particules douces (texture par défaut de Roblox, aucun identifiant d'image). */
function particules(p: BasePart, couleur: Color3, taux: number, taille = 0.25) {
	const e = new Instance("ParticleEmitter");
	e.Color = new ColorSequence(couleur);
	e.LightEmission = 0.7;
	e.Size = new NumberSequence([new NumberSequenceKeypoint(0, taille), new NumberSequenceKeypoint(1, 0)]);
	e.Transparency = new NumberSequence(0.2, 1);
	e.Lifetime = new NumberRange(0.8, 1.6);
	e.Rate = taux;
	e.Speed = new NumberRange(0.4, 1.2);
	e.SpreadAngle = new Vector2(180, 180);
	e.Parent = p;
}

function lueur(p: BasePart, couleur: Color3, portee: number) {
	const l = new Instance("PointLight");
	l.Color = couleur;
	l.Range = portee;
	l.Brightness = 1.4;
	l.Shadows = false;
	l.Parent = p;
}

/**
 * Bête à quatre pattes (loup, sanglier, rat…) : poitrail et arrière-train arrondis, cou, tête avec museau,
 * mâchoire et crocs, oreilles pointues, pattes en deux segments, queue courbée, ventre plus clair.
 */
export function quadrupede(nom: string, couleur: Color3, taille: number, options: { defenses?: boolean; spectral?: boolean; queueFine?: boolean; criniere?: boolean } = {}): Model {
	return construit(nom, 3.4 * taille, (m, r) => {
		const t = taille;
		const o = r.CFrame.mul(new CFrame(0, 0.9 * t, 0));
		const fourrure = options.spectral ? { matiere: Enum.Material.ForceField, transparence: 0.1 } : { matiere: Enum.Material.Fabric };
		const ventre = couleur.Lerp(new Color3(1, 1, 1), 0.25);
		const sombre = couleur.Lerp(new Color3(0, 0, 0), 0.35);
		const bout = (n: string, taille3: Vector3, cf: CFrame, c: Color3, opt: Parameters<typeof piece>[5] = fourrure) => piece(m, n, taille3.mul(t), o.mul(cf), c, opt);
		// corps : poitrail, ventre, arrière-train
		bout("Poitrail", new Vector3(1.9, 1.8, 1.9), new CFrame(0, 0.55, -0.9), couleur, { ...fourrure, forme: Enum.PartType.Ball });
		bout("Dos", new Vector3(1.6, 1.4, 2.6), new CFrame(0, 0.5, 0.2), couleur);
		bout("Ventre", new Vector3(1.3, 0.5, 2.4), new CFrame(0, -0.15, 0.1), ventre);
		bout("Croupe", new Vector3(1.7, 1.55, 1.7), new CFrame(0, 0.5, 1.3), couleur, { ...fourrure, forme: Enum.PartType.Ball });
		// cou et tête
		bout("Cou", new Vector3(1, 1.1, 1.2), new CFrame(0, 1.05, -1.75).mul(CFrame.Angles(math.rad(35), 0, 0)), couleur);
		bout("Tete", new Vector3(1.25, 1.1, 1.3), new CFrame(0, 1.35, -2.35), couleur, { ...fourrure, forme: Enum.PartType.Ball });
		bout("Museau", new Vector3(0.7, 0.55, 1), new CFrame(0, 1.15, -3.1), couleur.Lerp(ventre, 0.4));
		bout("Truffe", new Vector3(0.32, 0.25, 0.2), new CFrame(0, 1.32, -3.6), rgb(25, 22, 22), { matiere: Enum.Material.SmoothPlastic });
		bout("Machoire", new Vector3(0.6, 0.22, 0.9), new CFrame(0, 0.86, -3.0).mul(CFrame.Angles(math.rad(-8), 0, 0)), sombre);
		for (const x of [-0.2, 0.2]) bout("Croc", new Vector3(0.1, 0.25, 0.1), new CFrame(x, 0.98, -3.45), rgb(245, 240, 225), { matiere: Enum.Material.SmoothPlastic });
		for (const x of [-0.38, 0.38]) {
			const oreille = piece(m, "Oreille", new Vector3(0.18, 0.7, 0.45).mul(t), o.mul(new CFrame(x * t, 2.0 * t, -2.15 * t)).mul(CFrame.Angles(math.rad(-10), 0, math.rad(x > 0 ? -12 : 12))), sombre, fourrure);
			void oreille;
		}
		const yeux = options.spectral ? rgb(170, 255, 255) : rgb(255, 205, 60);
		for (const x of [-0.3, 0.3]) bout("Oeil", new Vector3(0.18, 0.14, 0.1), new CFrame(x, 1.5, -2.95), yeux, { neon: true });
		// pattes : cuisse, jambe, patte
		for (const [x, z, arriere] of [[-0.6, -1.0, false], [0.6, -1.0, false], [-0.62, 1.35, true], [0.62, 1.35, true]] as const) {
			bout("Cuisse", new Vector3(0.55, 1.1, 0.7), new CFrame(x, -0.1, z).mul(CFrame.Angles(math.rad(arriere ? 15 : -8), 0, 0)), couleur);
			bout("Jambe", new Vector3(0.38, 1.0, 0.42), new CFrame(x, -0.95, z + (arriere ? 0.15 : -0.05)).mul(CFrame.Angles(math.rad(arriere ? -15 : 4), 0, 0)), sombre);
			bout("Patte", new Vector3(0.48, 0.25, 0.62), new CFrame(x, -1.42, z - 0.1), sombre);
		}
		// queue en trois segments qui remontent
		const fine = options.queueFine === true;
		for (let i = 0; i < 3; i++) {
			const e = fine ? 0.18 : 0.42 - i * 0.08;
			bout("Queue", new Vector3(e, e, 0.9), new CFrame(0, 0.75 + i * 0.32, 2.25 + i * 0.7).mul(CFrame.Angles(math.rad(25 + i * 12), 0, 0)), i === 2 && !fine ? ventre : couleur);
		}
		if (options.criniere) for (let i = 0; i < 5; i++) bout("Soies", new Vector3(0.25, 0.5, 0.5), new CFrame(0, 1.3 - i * 0.05, -1.4 + i * 0.6), sombre);
		if (options.defenses) for (const x of [-0.32, 0.32]) bout("Defense", new Vector3(0.14, 0.14, 0.7), new CFrame(x, 1.0, -3.45).mul(CFrame.Angles(math.rad(-40), 0, 0)), rgb(240, 235, 220), { matiere: Enum.Material.Marble });
		if (options.spectral) {
			const coeur = bout("Ame", new Vector3(0.8, 0.8, 0.8), new CFrame(0, 0.6, -0.6), rgb(170, 255, 255), { neon: true, forme: Enum.PartType.Ball });
			lueur(coeur, rgb(150, 230, 255), 12);
			particules(coeur, rgb(170, 240, 255), 10, 0.35);
		}
	});
}

/** Araignée géante : pattes coudées, crochets, abdomen marqué d'un motif, grappe d'yeux. */
function araignee(nom: string): Model {
	return construit(nom, 3.4, (m, r) => {
		const o = r.CFrame;
		const noir = rgb(32, 28, 34);
		const poil = { matiere: Enum.Material.Fabric };
		piece(m, "Abdomen", new Vector3(2.8, 2.2, 3.1), o.mul(new CFrame(0, 1.6, 1.3)), noir, { forme: Enum.PartType.Ball, ...poil });
		piece(m, "Motif", new Vector3(0.8, 0.12, 1.6), o.mul(new CFrame(0, 2.68, 1.3)), rgb(170, 40, 40), { matiere: Enum.Material.SmoothPlastic });
		piece(m, "Thorax", new Vector3(1.7, 1.3, 1.7), o.mul(new CFrame(0, 1.3, -0.6)), noir, { forme: Enum.PartType.Ball, ...poil });
		piece(m, "Tete", new Vector3(1.2, 1, 1.1), o.mul(new CFrame(0, 1.35, -1.45)), noir, { forme: Enum.PartType.Ball });
		for (const [x, y] of [[-0.25, 1.55], [0.25, 1.55], [-0.12, 1.75], [0.12, 1.75], [-0.4, 1.4], [0.4, 1.4]] as const) piece(m, "Oeil", new Vector3(0.16, 0.16, 0.1), o.mul(new CFrame(x, y, -1.97)), rgb(230, 30, 30), { neon: true, forme: Enum.PartType.Ball });
		for (const x of [-0.2, 0.2]) piece(m, "Crochet", new Vector3(0.14, 0.5, 0.14), o.mul(new CFrame(x, 1.0, -1.95)).mul(CFrame.Angles(math.rad(20), 0, 0)), rgb(200, 190, 170), { matiere: Enum.Material.Marble });
		for (let i = 0; i < 4; i++) {
			for (const cote of [-1, 1]) {
				const z = -1.0 + i * 0.5;
				const ouverture = CFrame.Angles(0, math.rad(cote * (i - 1.5) * 22), 0);
				const racine = o.mul(new CFrame(cote * 0.7, 1.3, z)).mul(ouverture);
				// fémur qui monte, tibia qui redescend jusqu'au sol
				piece(m, "Femur", new Vector3(1.9, 0.22, 0.22), racine.mul(new CFrame(cote * 0.9, 0.55, 0)).mul(CFrame.Angles(0, 0, math.rad(cote * 32))), noir, poil);
				piece(m, "Tibia", new Vector3(2.1, 0.18, 0.18), racine.mul(new CFrame(cote * 2.3, 0.35, 0)).mul(CFrame.Angles(0, 0, math.rad(cote * -55))), noir, poil);
			}
		}
	});
}

/** Chauve-souris : ailes en membrane (doigts et toile), oreilles, crocs. */
function chauveSouris(nom: string): Model {
	return construit(nom, 5, (m, r) => {
		const o = r.CFrame.mul(new CFrame(0, 3, 0));
		const c = rgb(46, 36, 46);
		const toile = rgb(80, 50, 60);
		piece(m, "Corps", new Vector3(0.95, 1.3, 0.95), o, c, { forme: Enum.PartType.Ball, matiere: Enum.Material.Fabric });
		piece(m, "Tete", new Vector3(0.75, 0.7, 0.75), o.mul(new CFrame(0, 0.8, -0.1)), c, { forme: Enum.PartType.Ball, matiere: Enum.Material.Fabric });
		for (const cote of [-1, 1]) {
			piece(m, "Oreille", new Vector3(0.12, 0.6, 0.35), o.mul(new CFrame(cote * 0.25, 1.3, -0.05)).mul(CFrame.Angles(0, 0, math.rad(-cote * 15))), c);
			for (let k = 0; k < 3; k++) {
				piece(m, "Doigt", new Vector3(1.6, 0.08, 0.08), o.mul(new CFrame(cote * (0.8 + k * 0.35), 0.3 - k * 0.2, k * 0.25)).mul(CFrame.Angles(0, math.rad(cote * -k * 18), math.rad(cote * (20 - k * 12)))), c);
			}
			piece(m, "Aile", new Vector3(2.2, 0.05, 1.3), o.mul(new CFrame(cote * 1.3, 0.05, 0.25)).mul(CFrame.Angles(0, 0, math.rad(cote * 8))), toile, { matiere: Enum.Material.Fabric, transparence: 0.1 });
		}
		for (const cote of [-0.15, 0.15]) piece(m, "Oeil", new Vector3(0.12, 0.12, 0.08), o.mul(new CFrame(cote, 0.9, -0.45)), rgb(255, 80, 80), { neon: true });
		for (const cote of [-0.08, 0.08]) piece(m, "Croc", new Vector3(0.05, 0.16, 0.05), o.mul(new CFrame(cote, 0.6, -0.42)), rgb(245, 240, 225));
	});
}

/** Gelée : corps translucide brillant, noyau lumineux, bulles qui montent. */
function gelee(nom: string, couleur: Color3): Model {
	return construit(nom, 3, (m, r) => {
		const corps = piece(m, "Gelee", new Vector3(3.2, 2.3, 3.2), r.CFrame.mul(new CFrame(0, 0.2, 0)), couleur, { forme: Enum.PartType.Ball, matiere: Enum.Material.Glass, transparence: 0.3 });
		corps.Reflectance = 0.15;
		piece(m, "Base", new Vector3(3.6, 0.5, 3.6), r.CFrame.mul(new CFrame(0, -0.8, 0)), couleur.Lerp(new Color3(0, 0, 0), 0.2), { forme: Enum.PartType.Ball, matiere: Enum.Material.Glass, transparence: 0.35 });
		const noyau = piece(m, "Noyau", new Vector3(0.9, 0.9, 0.9), r.CFrame.mul(new CFrame(0, 0.3, 0)), couleur.Lerp(new Color3(1, 1, 1), 0.4), { forme: Enum.PartType.Ball, neon: true });
		for (const [x, y, z, d] of [[0.7, 0.6, -0.4, 0.35], [-0.6, 0.1, 0.5, 0.25], [0.2, -0.2, 0.8, 0.2]] as const) piece(m, "Bulle", new Vector3(d, d, d), r.CFrame.mul(new CFrame(x, y, z)), rgb(255, 255, 255), { forme: Enum.PartType.Ball, matiere: Enum.Material.Glass, transparence: 0.5 });
		for (const x of [-0.45, 0.45]) piece(m, "Oeil", new Vector3(0.3, 0.3, 0.1), r.CFrame.mul(new CFrame(x, 0.6, -1.5)), rgb(20, 30, 20), { forme: Enum.PartType.Ball });
		lueur(noyau, couleur, 8);
		particules(noyau, couleur.Lerp(new Color3(1, 1, 1), 0.5), 4, 0.2);
	});
}

function feuFollet(nom: string): Model {
	return construit(nom, 5, (m, r) => {
		const coeur = piece(m, "Flamme", new Vector3(1.2, 1.2, 1.2), r.CFrame.mul(new CFrame(0, 2.5, 0)), rgb(255, 230, 150), { forme: Enum.PartType.Ball, neon: true });
		piece(m, "Halo", new Vector3(2.2, 2.2, 2.2), r.CFrame.mul(new CFrame(0, 2.5, 0)), rgb(255, 140, 40), { forme: Enum.PartType.Ball, matiere: Enum.Material.ForceField, transparence: 0.2 });
		for (const x of [-0.25, 0.25]) piece(m, "Oeil", new Vector3(0.18, 0.28, 0.1), r.CFrame.mul(new CFrame(x, 2.65, -0.62)), rgb(60, 20, 0), {});
		const feu = new Instance("Fire");
		feu.Size = 4;
		feu.Heat = 6;
		feu.Parent = coeur;
		lueur(coeur, rgb(255, 160, 60), 14);
		particules(coeur, rgb(255, 180, 80), 12, 0.3);
	});
}

/** Golem : blocs de roche taillés, épaules massives, poings, mousse, fissures et runes lumineuses. */
function golem(nom: string, couleur: Color3, taille: number, lueurRune: Color3): Model {
	return construit(nom, 6.8 * taille, (m, r) => {
		const t = taille;
		const o = r.CFrame.mul(new CFrame(0, 1.6 * t, 0));
		const roche = { matiere: Enum.Material.Rock };
		const sombre = couleur.Lerp(new Color3(0, 0, 0), 0.25);
		const mousse = rgb(80, 120, 60);
		const bout = (n: string, v: Vector3, cf: CFrame, c: Color3, opt: Parameters<typeof piece>[5] = roche) => piece(m, n, v.mul(t), o.mul(cf), c, opt);
		bout("Bassin", new Vector3(2.6, 1.2, 1.8), new CFrame(0, 0.1, 0), sombre);
		bout("Torse", new Vector3(3.4, 2.6, 2.2), new CFrame(0, 1.9, 0).mul(CFrame.Angles(math.rad(6), 0, 0)), couleur);
		bout("Plaque", new Vector3(2.4, 1.4, 0.4), new CFrame(0, 2.2, -1.15), sombre);
		bout("Coeur", new Vector3(0.8, 0.8, 0.2), new CFrame(0, 2.2, -1.38), lueurRune, { neon: true });
		bout("Tete", new Vector3(1.4, 1.2, 1.3), new CFrame(0, 3.7, -0.3), couleur);
		bout("Front", new Vector3(1.6, 0.4, 1.4), new CFrame(0, 4.2, -0.35), sombre);
		for (const x of [-0.32, 0.32]) bout("Oeil", new Vector3(0.32, 0.18, 0.1), new CFrame(x, 3.75, -0.98), lueurRune, { neon: true });
		for (const cote of [-1, 1]) {
			bout("Epaule", new Vector3(1.7, 1.5, 1.7), new CFrame(cote * 2.15, 2.9, 0), couleur, { ...roche, forme: Enum.PartType.Ball });
			bout("Mousse", new Vector3(1.2, 0.35, 1.2), new CFrame(cote * 2.15, 3.6, 0.1), mousse, { matiere: Enum.Material.LeafyGrass });
			bout("Bras", new Vector3(1.1, 2.2, 1.1), new CFrame(cote * 2.3, 1.4, 0), sombre);
			bout("Rune", new Vector3(0.15, 1.2, 0.3), new CFrame(cote * 2.86, 1.4, 0), lueurRune, { neon: true });
			bout("Poing", new Vector3(1.6, 1.4, 1.5), new CFrame(cote * 2.4, -0.05, -0.1), couleur);
			bout("Jambe", new Vector3(1.3, 2, 1.3), new CFrame(cote * 0.85, -1.0, 0), sombre);
			bout("Pied", new Vector3(1.5, 0.6, 1.9), new CFrame(cote * 0.85, -1.85, -0.2), couleur);
		}
		bout("Fissure", new Vector3(0.12, 1.6, 0.1), new CFrame(0.7, 1.7, -1.12).mul(CFrame.Angles(0, 0, math.rad(20))), lueurRune, { neon: true });
		const c = m.FindFirstChild("Coeur") as BasePart | undefined;
		if (c) lueur(c, lueurRune, 10 * t);
	});
}

/** Tourelle runique : socle de pierre, anneaux de runes et cristal flottant. */
function tourelle(nom: string): Model {
	return construit(nom, 6.5, (m, r) => {
		piece(m, "Socle", new Vector3(3.6, 3, 3), r.CFrame.mul(new CFrame(0, 0.8, 0)).mul(CFrame.Angles(0, 0, math.rad(90))), rgb(110, 105, 100), { forme: Enum.PartType.Cylinder, matiere: Enum.Material.Cobblestone });
		piece(m, "Chapiteau", new Vector3(0.6, 3.6, 3.6), r.CFrame.mul(new CFrame(0, 2.7, 0)).mul(CFrame.Angles(0, 0, math.rad(90))), rgb(140, 135, 125), { forme: Enum.PartType.Cylinder, matiere: Enum.Material.Limestone });
		piece(m, "Runes", new Vector3(0.25, 3.15, 3.15), r.CFrame.mul(new CFrame(0, 1.6, 0)).mul(CFrame.Angles(0, 0, math.rad(90))), rgb(120, 200, 255), { forme: Enum.PartType.Cylinder, neon: true });
		const oeil = piece(m, "Oeil", new Vector3(1.1, 1.8, 1.1), r.CFrame.mul(new CFrame(0, 4.4, 0)).mul(CFrame.Angles(0, math.rad(45), 0)), rgb(140, 210, 255), { matiere: Enum.Material.Glass, transparence: 0.15 });
		piece(m, "Coeur", new Vector3(0.5, 0.5, 0.5), r.CFrame.mul(new CFrame(0, 4.4, 0)), rgb(200, 240, 255), { forme: Enum.PartType.Ball, neon: true });
		lueur(oeil, rgb(120, 200, 255), 12);
		particules(oeil, rgb(150, 220, 255), 6, 0.2);
	});
}

// ───────────────────────────── Catalogue ─────────────────────────────

// Les ennemis humanoïdes portent des objets du catalogue d'équipement (apparence seulement, aucun effet de jeu).
export const COSTUMES: Record<string, Costume> = {
	"gobelin-cendre": { peau: rgb(110, 140, 70), haut: rgb(90, 70, 50), bas: rgb(70, 55, 40), echelle: 0.7, yeux: rgb(255, 120, 40), oreilles: rgb(110, 140, 70), classe: "ombre", equipement: { arme: "dague", armure: "armure-cuir" } },
	bandit: { peau: rgb(225, 180, 140), haut: rgb(110, 80, 55), bas: rgb(60, 50, 40), capuche: rgb(70, 60, 50), classe: "ombre", equipement: { arme: "surin-des-ruelles", armure: "pourpoint-du-voleur-de-minuit" } },
	cultiste: { peau: rgb(220, 190, 160), haut: rgb(110, 25, 30), bas: rgb(70, 15, 20), capuche: rgb(90, 20, 25), yeux: rgb(255, 60, 60), cape: rgb(80, 15, 20), classe: "arcaniste", equipement: { arme: "baton-des-chacals-d-ombre", accessoire: "talisman-i" } },
	squelette: { peau: rgb(235, 230, 215), haut: rgb(235, 230, 215), bas: rgb(235, 230, 215), yeux: rgb(120, 200, 255), classe: "lame-runique", equipement: { arme: "epee-courte", accessoire: "bouclier-bois" } },
	vorthak: { peau: rgb(120, 30, 30), haut: rgb(50, 20, 25), bas: rgb(35, 15, 18), echelle: 1.6, cornes: rgb(40, 35, 35), yeux: rgb(255, 200, 60), cape: rgb(40, 10, 14), classe: "berserker", equipement: { arme: "drakhaar", armure: "armure-de-l-enrage" } },
	"ref-brute": { peau: rgb(200, 160, 120), haut: rgb(120, 60, 40), bas: rgb(60, 40, 30), echelle: 1.2, classe: "berserker", equipement: { arme: "hache-du-bucheron-colerique" } },
	"ref-mage": { peau: rgb(220, 190, 160), haut: rgb(60, 60, 140), bas: rgb(40, 40, 90), capuche: rgb(50, 50, 120), classe: "arcaniste", equipement: { arme: "orbe-i" } },
	"ref-faible": { peau: rgb(220, 190, 160), haut: rgb(140, 130, 110), bas: rgb(90, 80, 70), classe: "ombre" },
	"ref-chef": { peau: rgb(200, 160, 120), haut: rgb(150, 120, 40), bas: rgb(80, 60, 30), echelle: 1.3, cape: rgb(120, 30, 30), classe: "gardien", equipement: { arme: "masse-du-sacristain", armure: "lourde-i", accessoire: "bouclier-i-maitre" } },
	"mannequin-entrainement": { peau: rgb(190, 150, 100), haut: rgb(170, 130, 85), bas: rgb(150, 115, 75), echelle: 1.2 },
	aveline: { peau: rgb(235, 200, 170), haut: rgb(170, 175, 190), bas: rgb(80, 85, 110), cape: rgb(60, 80, 140), classe: "gardien", equipement: { arme: "lame-du-guet-de-lysmont", armure: "haubert-du-temple-du-seuil", accessoire: "bouclier-bois" } },
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
			return quadrupede(id, rgb(110, 90, 75), 0.6, { queueFine: true });
		case "sanglier":
			return quadrupede(id, rgb(80, 60, 45), 1.1, { defenses: true, criniere: true });
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
