/**
 * Intérieurs des lieux : une salle meublée par lieu, construite à l'écart (sous la carte).
 * On y entre par la porte du bâtiment (téléportation, côté joueur) et on en sort par la porte « Sortir ».
 * Points d'interaction (touche E), attributs « Lieu » et « Action » :
 *   parler (PNJ → scènes du lieu), contrats (tableau), boutique (comptoir), grimoire (pupitre), sortir.
 * Les PNJ du contenu (lieu.pnj) sont placés dans la salle ; chaque joueur masque ceux que sa partie
 * ne doit pas voir encore (condition « si »), voir client/rendu/marqueurs.ts.
 */
import { Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { positionLieu, regionDuLieu, STYLES, tousLesLieux, trouverLieu } from "shared/geo";
import type { LieuDef } from "shared/moteur";
import { genre } from "./regions";
import { banniere, bloc, C, tonneau, VERTICAL } from "./decor";
import { COSTUMES, humanoide, type Costume } from "./modeles";

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);
const HAUTEUR = -300;

/** Costumes des PNJ du contenu (les autres reçoivent une tenue simple). */
const COSTUMES_PNJ: Record<string, Costume> = {
	aureliath: { peau: rgb(225, 190, 160), haut: rgb(240, 235, 220), bas: rgb(220, 210, 190), tablier: rgb(217, 164, 65) },
	elianne: { peau: rgb(235, 205, 180), haut: rgb(120, 150, 210), bas: rgb(235, 230, 215), capuche: rgb(235, 230, 215) },
	rowena: { peau: rgb(220, 185, 150), haut: rgb(70, 65, 60), bas: rgb(50, 45, 40), classe: "lame-runique" },
	kaya: { peau: rgb(200, 200, 205), haut: rgb(90, 110, 90), bas: rgb(70, 60, 50), classe: "archer" },
	bram: { peau: rgb(210, 160, 120), haut: rgb(150, 110, 70), bas: rgb(80, 60, 40), echelle: 1.25, tablier: rgb(230, 225, 210) },
	"edmund-iv": { peau: rgb(225, 190, 160), haut: rgb(140, 30, 40), bas: rgb(90, 20, 30), couronne: true },
	seraphine: { peau: rgb(240, 210, 190), haut: rgb(150, 190, 240), bas: rgb(150, 190, 240), couronne: true },
	gareth: { peau: rgb(210, 165, 125), haut: rgb(110, 130, 80), bas: rgb(100, 80, 55), chapeau: rgb(200, 170, 100) },
	ferrand: { peau: rgb(225, 190, 160), haut: rgb(110, 50, 130), bas: rgb(60, 30, 70) },
	halvine: { peau: rgb(235, 200, 175), haut: rgb(90, 120, 110), bas: rgb(70, 60, 50), tablier: rgb(170, 130, 80), echelle: 0.85 },
	lina: { peau: rgb(230, 195, 165), haut: rgb(150, 100, 70), bas: rgb(100, 80, 60), tablier: rgb(190, 170, 140) },
	tobin: { peau: rgb(235, 205, 180), haut: rgb(200, 195, 180), bas: rgb(120, 115, 105) },
};

/** Noms des PNJ propres à la version Roblox (absents du contenu). */
const NOMS_FIGURANTS: Record<string, string> = { "maitre-armes": "Maître d'armes" };

let dossier: Folder;

function lumiereInterieure(p: BasePart, couleur = rgb(255, 200, 140), portee = 30) {
	const l = new Instance("PointLight");
	l.Color = couleur;
	l.Range = portee;
	l.Brightness = 1.4;
	l.Shadows = true;
	l.Parent = p;
}

function invite(ancre: BasePart, lieu: string, action: string, texteAction: string, objet: string, distance = 10) {
	const i = new Instance("ProximityPrompt");
	i.ActionText = texteAction;
	i.ObjectText = objet;
	i.HoldDuration = 0;
	i.MaxActivationDistance = distance;
	i.RequiresLineOfSight = false;
	i.SetAttribute("Lieu", lieu);
	i.SetAttribute("Action", action);
	i.Parent = ancre;
	return i;
}

/** Point d'interaction invisible (tableau, comptoir, porte…). */
function point(parent: Instance, position: Vector3, lieu: string, action: string, texteAction: string, objet: string) {
	const p = bloc(new Vector3(3, 4, 3), position, C.or, { parent, nom: `Point-${action}` });
	p.Transparency = 1;
	p.CanCollide = false;
	invite(p, lieu, action, texteAction, objet);
	return p;
}

/** Salle : sol, murs, plafond, porte de sortie (face +Z) et point d'arrivée. Renvoie le modèle. */
function salle(lieu: string, base: Vector3, l: number, p: number, h: number, couleurs: { sol: Color3; mur: Color3; matSol: Enum.Material; matMur: Enum.Material }): Model {
	const m = new Instance("Model");
	m.Name = lieu;
	m.Parent = dossier;
	const opt = (matiere: Enum.Material) => ({ parent: m, matiere });
	bloc(new Vector3(l, 1, p), base.add(new Vector3(0, -0.5, 0)), couleurs.sol, opt(couleurs.matSol));
	bloc(new Vector3(l, 1, p), base.add(new Vector3(0, h + 0.5, 0)), couleurs.mur.Lerp(new Color3(0, 0, 0), 0.4), opt(Enum.Material.Wood));
	bloc(new Vector3(1, h, p), base.add(new Vector3(-l / 2, h / 2, 0)), couleurs.mur, opt(couleurs.matMur));
	bloc(new Vector3(1, h, p), base.add(new Vector3(l / 2, h / 2, 0)), couleurs.mur, opt(couleurs.matMur));
	bloc(new Vector3(l, h, 1), base.add(new Vector3(0, h / 2, -p / 2)), couleurs.mur, opt(couleurs.matMur));
	// mur de façade avec la porte au milieu
	const largeurPorte = 6;
	const cote = (l - largeurPorte) / 2;
	bloc(new Vector3(cote, h, 1), base.add(new Vector3(-(largeurPorte + cote) / 2, h / 2, p / 2)), couleurs.mur, opt(couleurs.matMur));
	bloc(new Vector3(cote, h, 1), base.add(new Vector3((largeurPorte + cote) / 2, h / 2, p / 2)), couleurs.mur, opt(couleurs.matMur));
	bloc(new Vector3(largeurPorte, h - 9, 1), base.add(new Vector3(0, 9 + (h - 9) / 2, p / 2)), couleurs.mur, opt(couleurs.matMur));
	bloc(new Vector3(largeurPorte, 9, 0.6), base.add(new Vector3(0, 4.5, p / 2 + 0.2)), C.bois, opt(Enum.Material.WoodPlanks));
	point(m, base.add(new Vector3(0, 2, p / 2 - 2)), lieu, "sortir", "Sortir", "Porte");
	const arrivee = bloc(new Vector3(2, 1, 2), base.add(new Vector3(0, 0.5, p / 2 - 6)), C.or, { parent: m, nom: "Arrivee" });
	arrivee.Transparency = 1;
	arrivee.CanCollide = false;
	// plafonniers
	for (const x of [-l / 4, l / 4]) {
		for (const z of [-p / 4, p / 4]) {
			const lustre = bloc(new Vector3(2, 0.6, 2), base.add(new Vector3(x, h - 1.5, z)), rgb(255, 210, 140), { parent: m, neon: true });
			lumiereInterieure(lustre);
		}
	}
	return m;
}

// ───────────────────────────── Mobilier ─────────────────────────────

function tableBancs(m: Model, pos: Vector3, longueur = 8) {
	bloc(new Vector3(longueur, 0.5, 4), pos.add(new Vector3(0, 3, 0)), C.boisClair, { parent: m, matiere: Enum.Material.WoodPlanks });
	for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) bloc(new Vector3(0.5, 3, 0.5), pos.add(new Vector3((x * (longueur - 1)) / 2, 1.5, z * 1.5)), C.bois, { parent: m, matiere: Enum.Material.Wood });
	for (const z of [-3, 3]) bloc(new Vector3(longueur, 0.4, 1.4), pos.add(new Vector3(0, 1.8, z)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
	bloc(new Vector3(0.8, 1, 0.8), pos.add(new Vector3(-1, 3.75, 0.5)), rgb(200, 190, 170), { parent: m, forme: "cylindre", rotation: VERTICAL });
	bloc(new Vector3(0.8, 1, 0.8), pos.add(new Vector3(1.5, 3.75, -0.5)), rgb(200, 190, 170), { parent: m, forme: "cylindre", rotation: VERTICAL });
}

function comptoir(m: Model, pos: Vector3, longueur: number) {
	bloc(new Vector3(longueur, 4, 2.5), pos.add(new Vector3(0, 2, 0)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
	bloc(new Vector3(longueur + 0.6, 0.4, 3), pos.add(new Vector3(0, 4.2, 0)), C.boisClair, { parent: m, matiere: Enum.Material.Wood });
}

function etagere(m: Model, pos: Vector3, rotation = new CFrame()) {
	const f = new CFrame(pos).mul(rotation);
	bloc(new Vector3(8, 9, 1.5), f.mul(new CFrame(0, 4.5, 0)).Position, C.bois, { parent: m, rotation: rotation, matiere: Enum.Material.WoodPlanks });
	const couleurs = [rgb(140, 40, 40), rgb(40, 80, 140), rgb(60, 110, 50), rgb(150, 120, 50), rgb(90, 50, 110)];
	for (let rangee = 0; rangee < 3; rangee++) {
		for (let i = 0; i < 9; i++) {
			bloc(new Vector3(0.6, 1.8, 1.1), f.mul(new CFrame(-3.4 + i * 0.85, 1.6 + rangee * 2.8, -0.3)).Position, couleurs[(i + rangee) % couleurs.size()], { parent: m, rotation });
		}
	}
}

function cheminee(m: Model, pos: Vector3, rotation = new CFrame()) {
	const f = new CFrame(pos).mul(rotation);
	bloc(new Vector3(8, 8, 3), f.mul(new CFrame(0, 4, 0)).Position, C.pierre, { parent: m, rotation, matiere: Enum.Material.Cobblestone });
	bloc(new Vector3(5, 4, 1.6), f.mul(new CFrame(0, 2, -0.8)).Position, rgb(25, 20, 20), { parent: m, rotation });
	const braises = bloc(new Vector3(3, 0.6, 1), f.mul(new CFrame(0, 0.6, -1)).Position, rgb(255, 120, 40), { parent: m, rotation, neon: true });
	const feu = new Instance("Fire");
	feu.Size = 4;
	feu.Heat = 8;
	feu.Parent = braises;
	lumiereInterieure(braises, rgb(255, 140, 60), 26);
}

function tapis(m: Model, pos: Vector3, taille: Vector2, couleur: Color3) {
	bloc(new Vector3(taille.X, 0.12, taille.Y), pos.add(new Vector3(0, 0.06, 0)), couleur, { parent: m, matiere: Enum.Material.Fabric });
}

function pnj(m: Model, lieu: string, id: string, position: Vector3, regard: Vector3, action = "parler") {
	const costume = COSTUMES_PNJ[id] ?? COSTUMES[id] ?? { peau: rgb(225, 190, 160), haut: rgb(120, 100, 80), bas: rgb(80, 70, 60) };
	const [ok, modele] = pcall(() => humanoide(`pnj-${id}`, costume));
	if (!ok) return;
	const p = modele as Model;
	p.PivotTo(CFrame.lookAt(position.add(new Vector3(0, 3 * (costume.echelle ?? 1), 0)), new Vector3(regard.X, position.Y + 3, regard.Z)));
	p.SetAttribute("Lieu", lieu);
	p.SetAttribute("Pnj", id);
	const racine = p.PrimaryPart!;
	const nom = CONTENU.compagnons[id]?.nom ?? CONTENU.pnj[id]?.nom ?? NOMS_FIGURANTS[id] ?? id;
	invite(racine, lieu, action, action === "parler" ? "Parler" : "Voir", nom, 12);
	p.Parent = m;
}

/** Figurant (client, garde, artisan) : simple personnage décoratif, sans interaction. */
function figurant(m: Model, costume: Costume, position: Vector3, regard: Vector3) {
	const [ok, modele] = pcall(() => humanoide("figurant", costume));
	if (!ok) return;
	const p = modele as Model;
	p.PivotTo(CFrame.lookAt(position.add(new Vector3(0, 3, 0)), new Vector3(regard.X, position.Y + 3, regard.Z)));
	p.Parent = m;
}

const TENUES: Costume[] = [
	{ peau: rgb(225, 190, 160), haut: rgb(120, 60, 50), bas: rgb(70, 60, 50) },
	{ peau: rgb(200, 160, 120), haut: rgb(70, 100, 140), bas: rgb(60, 55, 50) },
	{ peau: rgb(235, 205, 180), haut: rgb(150, 130, 80), bas: rgb(90, 70, 50) },
	{ peau: rgb(170, 125, 90), haut: rgb(90, 120, 80), bas: rgb(70, 60, 45) },
];
const GARDE: Costume = { peau: rgb(220, 185, 150), haut: rgb(170, 175, 190), bas: rgb(80, 85, 110), classe: "gardien" };

// ───────────────────────────── Salles ─────────────────────────────

function construireSalle(lieu: string, base: Vector3) {
	const def = trouverLieu(lieu);
	const pnjDuLieu = def?.pnj.map((x) => x.id) ?? [];
	// lieux des autres régions : salle générique selon le genre du lieu (auberge, guilde, boutique…)
	if (def && regionDuLieu(lieu) !== "aubeclaire") return salleRegionale(def, base, pnjDuLieu);
	switch (lieu) {
		case "guilde": {
			const m = salle(lieu, base, 60, 44, 18, { sol: rgb(120, 90, 60), mur: rgb(214, 200, 170), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Plaster });
			comptoir(m, base.add(new Vector3(0, 0, -12)), 18);
			pnj(m, lieu, "rowena", base.add(new Vector3(0, 0, -16)), base);
			point(m, base.add(new Vector3(6, 2, -10)), lieu, "boutique", "Acheter", "Comptoir de la Guilde");
			// tableau des contrats
			const tableau = bloc(new Vector3(0.6, 9, 14), base.add(new Vector3(-29.2, 7, -4)), rgb(110, 80, 50), { parent: m, matiere: Enum.Material.Wood });
			for (let i = 0; i < 8; i++) bloc(new Vector3(0.2, 2.2, 1.8), base.add(new Vector3(-28.8, 4.5 + (i % 3) * 2.8, -9.5 + i * 1.5)), rgb(235, 225, 195), { parent: m });
			const t = new Instance("SurfaceGui");
			t.Face = Enum.NormalId.Right;
			const titre = new Instance("TextLabel");
			titre.Size = new UDim2(1, 0, 0.2, 0);
			titre.BackgroundTransparency = 1;
			titre.Text = "CONTRATS";
			titre.Font = Enum.Font.Fantasy;
			titre.TextScaled = true;
			titre.TextColor3 = rgb(240, 220, 170);
			titre.Parent = t;
			t.Parent = tableau;
			point(m, base.add(new Vector3(-26, 2, -4)), lieu, "contrats", "Consulter", "Tableau des contrats");
			// pupitre du grimoire
			bloc(new Vector3(2, 4, 2), base.add(new Vector3(20, 2, -8)), C.bois, { parent: m, matiere: Enum.Material.Wood });
			const livre = bloc(new Vector3(2.4, 0.4, 1.8), base.add(new Vector3(20, 4.3, -8)), rgb(120, 60, 160), { parent: m, neon: true });
			lumiereInterieure(livre, rgb(170, 110, 255), 12);
			point(m, base.add(new Vector3(20, 2, -5)), lieu, "grimoire", "Lire", "Grimoire de la partie");
			etagere(m, base.add(new Vector3(20, 0, -20.5)));
			for (const [x, z] of [[-14, 6], [0, 8], [14, 6]] as const) tableBancs(m, base.add(new Vector3(x, 0, z)));
			if (pnjDuLieu.includes("kaya")) pnj(m, lieu, "kaya", base.add(new Vector3(-14, 0, 3)), base.add(new Vector3(-14, 0, 6)));
			figurant(m, TENUES[1], base.add(new Vector3(14, 0, 3)), base.add(new Vector3(14, 0, 6)));
			for (const x of [24, 27]) figurant(m, { peau: rgb(190, 150, 100), haut: rgb(170, 130, 85), bas: rgb(150, 115, 75) }, base.add(new Vector3(x, 0, 14)), base);
			for (const x of [-20, 20]) banniere(base.add(new Vector3(x, 0, -21)), C.toitBleu, m);
			break;
		}
		case "taverne": {
			const m = salle(lieu, base, 48, 36, 14, { sol: rgb(110, 80, 55), mur: rgb(140, 100, 65), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Wood });
			comptoir(m, base.add(new Vector3(6, 0, -11)), 22);
			pnj(m, lieu, "bram", base.add(new Vector3(6, 0, -14.5)), base);
			point(m, base.add(new Vector3(12, 2, -9)), lieu, "boutique", "Commander", "Comptoir du Chaudron Fêlé");
			for (let i = 0; i < 5; i++) tonneau(base.add(new Vector3(-2 + i * 3, 0, -16.5)), m);
			cheminee(m, base.add(new Vector3(-22.5, 0, -6)), CFrame.Angles(0, math.rad(-90), 0));
			for (const [x, z] of [[-12, 4], [4, 6], [-10, 12], [8, 12]] as const) tableBancs(m, base.add(new Vector3(x, 0, z)), 7);
			if (pnjDuLieu.includes("ferrand")) pnj(m, lieu, "ferrand", base.add(new Vector3(-10, 0, 9)), base.add(new Vector3(-10, 0, 12)));
			for (const [x, z, i] of [[-12, 1, 0], [4, 9, 2], [8, 9, 3]] as const) figurant(m, TENUES[i], base.add(new Vector3(x, 0, z)), base.add(new Vector3(x, 0, z + (z < 6 ? 3 : -3))));
			// escalier vers l'étage
			for (let i = 0; i < 8; i++) bloc(new Vector3(5, 1, 2), base.add(new Vector3(20, 0.5 + i, 14 - i * 2)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
			// la chambre (auberge) : le lit fait passer les mois, si tout le monde est d'accord
			bloc(new Vector3(5, 1.6, 8), base.add(new Vector3(-18, 0.8, 12)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
			bloc(new Vector3(4.6, 0.8, 7.4), base.add(new Vector3(-18, 2, 12)), rgb(230, 225, 210), { parent: m, matiere: Enum.Material.Fabric });
			bloc(new Vector3(4.6, 0.3, 4.5), base.add(new Vector3(-18, 2.5, 13.3)), rgb(150, 40, 50), { parent: m, matiere: Enum.Material.Fabric });
			bloc(new Vector3(3, 0.6, 1.4), base.add(new Vector3(-18, 2.6, 9)), rgb(245, 240, 230), { parent: m, matiere: Enum.Material.Fabric });
			point(m, base.add(new Vector3(-14, 2, 12)), lieu, "auberge", "Dormir", "Le lit de l'auberge");
			break;
		}
		case "temple-du-seuil": {
			const m = salle(lieu, base, 40, 70, 26, { sol: rgb(220, 215, 205), mur: rgb(235, 230, 218), matSol: Enum.Material.Marble, matMur: Enum.Material.Marble });
			tapis(m, base.add(new Vector3(0, 0, 0)), new Vector2(6, 60), rgb(130, 40, 50));
			for (let r = 0; r < 6; r++) for (const x of [-9, 9]) bloc(new Vector3(10, 1, 2), base.add(new Vector3(x, 1.6, 18 - r * 6)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
			bloc(new Vector3(20, 2, 10), base.add(new Vector3(0, 1, -28)), C.blanc, { parent: m, matiere: Enum.Material.Marble });
			const autel = bloc(new Vector3(6, 3, 3), base.add(new Vector3(0, 3.5, -29)), rgb(255, 230, 160), { parent: m, neon: true });
			lumiereInterieure(autel, rgb(255, 230, 170), 40);
			for (const [k, z] of [[0, -20], [1, -5], [2, 10]] as const) {
				for (const x of [-19.4, 19.4]) {
					const v = bloc(new Vector3(0.3, 10, 5), base.add(new Vector3(x, 12, z)), [rgb(150, 120, 255), rgb(255, 150, 120), rgb(120, 220, 200)][k], { parent: m, neon: true });
					lumiereInterieure(v, v.Color, 14);
				}
			}
			pnj(m, lieu, "aureliath", base.add(new Vector3(0, 2, -25)), base);
			pnj(m, lieu, "elianne", base.add(new Vector3(-12, 0, -20)), base);
			comptoir(m, base.add(new Vector3(14, 0, 26)), 8);
			point(m, base.add(new Vector3(14, 2, 23)), lieu, "boutique", "Faire une offrande", "Comptoir des offrandes");
			figurant(m, { peau: rgb(225, 190, 160), haut: rgb(235, 230, 215), bas: rgb(220, 210, 190), capuche: rgb(235, 230, 215) }, base.add(new Vector3(14, 0, 22)), base.add(new Vector3(14, 0, 30)));
			break;
		}
		case "chateau": {
			const m = salle(lieu, base, 50, 70, 28, { sol: rgb(170, 165, 155), mur: rgb(196, 190, 178), matSol: Enum.Material.Marble, matMur: Enum.Material.Cobblestone });
			tapis(m, base, new Vector2(8, 64), rgb(150, 30, 40));
			bloc(new Vector3(18, 3, 10), base.add(new Vector3(0, 1.5, -28)), rgb(150, 145, 140), { parent: m, matiere: Enum.Material.Marble });
			bloc(new Vector3(5, 9, 2), base.add(new Vector3(0, 7.5, -32)), rgb(217, 164, 65), { parent: m, matiere: Enum.Material.Metal });
			bloc(new Vector3(4.5, 1, 4), base.add(new Vector3(0, 4.5, -30.5)), rgb(150, 30, 40), { parent: m, matiere: Enum.Material.Fabric });
			pnj(m, lieu, "edmund-iv", base.add(new Vector3(0, 3, -29)), base);
			pnj(m, lieu, "seraphine", base.add(new Vector3(-6, 3, -27)), base);
			for (const z of [-15, 0, 15]) for (const x of [-7, 7]) figurant(m, GARDE, base.add(new Vector3(x, 0, z)), base.add(new Vector3(0, 0, z)));
			for (const z of [-25, -10, 5, 20]) for (const x of [-24, 24]) banniere(base.add(new Vector3(x * 0.98, 0, z)), rgb(150, 30, 40), m);
			break;
		}
		case "quartier-tanneurs": {
			const m = salle(lieu, base, 40, 30, 12, { sol: rgb(110, 95, 75), mur: rgb(170, 150, 120), matSol: Enum.Material.Ground, matMur: Enum.Material.Plaster });
			for (const [x, z, c] of [[-12, -8, rgb(120, 70, 40)], [-4, -8, rgb(90, 110, 60)], [4, -8, rgb(70, 60, 110)]] as const) {
				bloc(new Vector3(3, 6, 6), base.add(new Vector3(x, 1.5, z)), C.bois, { parent: m, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.WoodPlanks });
				bloc(new Vector3(0.3, 5.4, 5.4), base.add(new Vector3(x, 3.05, z)), c, { parent: m, forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Glass });
			}
			for (const x of [10, 15]) {
				bloc(new Vector3(0.4, 7, 0.4), base.add(new Vector3(x - 2, 3.5, -12)), C.bois, { parent: m });
				bloc(new Vector3(0.4, 7, 0.4), base.add(new Vector3(x + 2, 3.5, -12)), C.bois, { parent: m });
				bloc(new Vector3(4, 5, 0.2), base.add(new Vector3(x, 4, -12)), rgb(190, 150, 110), { parent: m, matiere: Enum.Material.Fabric });
			}
			tableBancs(m, base.add(new Vector3(0, 0, 6)), 9);
			pnj(m, lieu, "lina", base.add(new Vector3(-6, 0, 2)), base.add(new Vector3(0, 0, 6)));
			figurant(m, { peau: rgb(200, 160, 120), haut: rgb(130, 100, 70), bas: rgb(80, 70, 55), tablier: rgb(110, 80, 50) }, base.add(new Vector3(-8, 0, -4)), base.add(new Vector3(-8, 0, -8)));
			break;
		}
		case "arene": {
			const m = salle(lieu, base, 36, 26, 12, { sol: rgb(150, 146, 140), mur: rgb(150, 146, 140), matSol: Enum.Material.Cobblestone, matMur: Enum.Material.Cobblestone });
			for (const x of [-12, -4]) {
				bloc(new Vector3(6, 0.5, 1), base.add(new Vector3(x, 5, -12)), C.bois, { parent: m });
				for (let i = 0; i < 4; i++) bloc(new Vector3(0.3, 5, 0.3), base.add(new Vector3(x - 2 + i * 1.3, 3, -11.8)), rgb(170, 170, 180), { parent: m, matiere: Enum.Material.Metal });
			}
			for (const z of [0, 6]) bloc(new Vector3(10, 1, 2), base.add(new Vector3(8, 1.6, z)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
			figurant(m, { peau: rgb(190, 150, 100), haut: rgb(170, 130, 85), bas: rgb(150, 115, 75) }, base.add(new Vector3(-12, 0, 4)), base);
			pnj(m, lieu, "maitre-armes", base.add(new Vector3(4, 0, -6)), base);
			break;
		}
		case "combe-aux-saules": {
			const m = salle(lieu, base, 36, 28, 11, { sol: rgb(120, 90, 60), mur: rgb(150, 110, 70), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Wood });
			cheminee(m, base.add(new Vector3(0, 0, -12.5)));
			tableBancs(m, base.add(new Vector3(-6, 0, 2)), 6);
			bloc(new Vector3(5, 2, 8), base.add(new Vector3(13, 1, -8)), rgb(200, 190, 170), { parent: m, matiere: Enum.Material.Fabric });
			for (let i = 0; i < 4; i++) bloc(new Vector3(2, 2.5, 2), base.add(new Vector3(-14 + i * 0.4, 1.25 + (i % 2) * 2.5, -10 + i * 1.5)), rgb(200, 180, 120), { parent: m, matiere: Enum.Material.Fabric });
			pnj(m, lieu, "gareth", base.add(new Vector3(-2, 0, 6)), base.add(new Vector3(0, 0, 12)));
			break;
		}
		case "boutique": {
			const m = salle(lieu, base, 34, 28, 13, { sol: rgb(130, 95, 60), mur: rgb(160, 120, 80), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Wood });
			comptoir(m, base.add(new Vector3(0, 0, -6)), 14);
			pnj(m, lieu, "halvine", base.add(new Vector3(0, 0, -9.5)), base);
			point(m, base.add(new Vector3(5, 2, -3.5)), lieu, "boutique", "Acheter / Vendre", "Comptoir de Halvine");
			etagere(m, base.add(new Vector3(-9, 0, -13.2)));
			etagere(m, base.add(new Vector3(9, 0, -13.2)));
			etagere(m, base.add(new Vector3(-16.2, 0, 2)), CFrame.Angles(0, math.rad(90), 0));
			etagere(m, base.add(new Vector3(16.2, 0, 2)), CFrame.Angles(0, math.rad(-90), 0));
			for (const [x, z] of [[-10, 8], [-7, 9], [10, 7]] as const) tonneau(base.add(new Vector3(x, 0, z)), m);
			// balance sur le comptoir, fioles colorées
			bloc(new Vector3(0.3, 2, 0.3), base.add(new Vector3(-3, 5.4, -6)), rgb(200, 170, 80), { parent: m, matiere: Enum.Material.Metal });
			bloc(new Vector3(3, 0.2, 0.2), base.add(new Vector3(-3, 6.4, -6)), rgb(200, 170, 80), { parent: m, matiere: Enum.Material.Metal });
			for (const [k, c] of [[0, rgb(220, 60, 60)], [1, rgb(80, 120, 230)], [2, rgb(90, 200, 110)]] as const) {
				const fiole = bloc(new Vector3(0.6, 1, 0.6), base.add(new Vector3(2 + k * 1, 4.9, -6)), c, { parent: m, forme: "boule", neon: true });
				void fiole;
			}
			break;
		}
		case "crypte-fontaine": {
			const m = salle(lieu, base, 30, 40, 14, { sol: rgb(70, 66, 72), mur: rgb(80, 76, 82), matSol: Enum.Material.Slate, matMur: Enum.Material.Slate });
			for (const z of [-10, 4]) for (const x of [-9, 9]) bloc(new Vector3(4, 2.4, 8), base.add(new Vector3(x, 1.2, z)), rgb(110, 105, 100), { parent: m, matiere: Enum.Material.Slate });
			for (const z of [-14, 0, 14]) {
				for (const x of [-14.2, 14.2]) {
					const t = bloc(new Vector3(0.6, 1, 0.6), base.add(new Vector3(x, 7, z)), rgb(255, 140, 60), { parent: m, neon: true });
					const feu = new Instance("Fire");
					feu.Size = 2;
					feu.Parent = t;
					lumiereInterieure(t, rgb(255, 150, 70), 20);
				}
			}
			bloc(new Vector3(6, 9, 0.6), base.add(new Vector3(0, 4.5, -19.6)), rgb(15, 12, 18), { parent: m });
			const p = point(m, base.add(new Vector3(0, 2, -16)), lieu, "parler", "Descendre", "Escalier de la crypte");
			void p;
			break;
		}
		default: {
			const m = salle(lieu, base, 30, 24, 11, { sol: rgb(120, 90, 60), mur: rgb(214, 200, 170), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Plaster });
			tableBancs(m, base.add(new Vector3(0, 0, -2)));
			for (const id of pnjDuLieu) pnj(m, lieu, id, base.add(new Vector3(0, 0, -8)), base);
		}
	}
}

/** Couleurs des salles selon la région. */
const SALLES: Record<string, { sol: Color3; mur: Color3; matSol: Enum.Material; matMur: Enum.Material }> = {
	desert: { sol: rgb(170, 120, 80), mur: rgb(225, 195, 150), matSol: Enum.Material.CeramicTiles, matMur: Enum.Material.Sandstone },
	foret: { sol: rgb(110, 80, 55), mur: rgb(130, 95, 62), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Wood },
	montagne: { sol: rgb(95, 92, 90), mur: rgb(120, 115, 110), matSol: Enum.Material.Slate, matMur: Enum.Material.Cobblestone },
	archipel: { sol: rgb(130, 95, 65), mur: rgb(150, 110, 75), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.WoodPlanks },
	rempart: { sol: rgb(150, 145, 135), mur: rgb(175, 170, 160), matSol: Enum.Material.Cobblestone, matMur: Enum.Material.Cobblestone },
	cendres: { sol: rgb(40, 34, 42), mur: rgb(55, 46, 60), matSol: Enum.Material.Basalt, matMur: Enum.Material.Basalt },
};

/** Salle d'un lieu des chapitres 2 à 6 : meubles selon le genre, PNJ du lieu, points d'interaction. */
function salleRegionale(l: LieuDef, base: Vector3, pnjDuLieu: string[]) {
	const style = STYLES[regionDuLieu(l.id)] ?? "desert";
	const couleurs = SALLES[style] ?? SALLES.desert;
	const g = genre(l);
	const grande = g === "palais" || g === "guilde" || g === "auberge" || g === "temple";
	const m = salle(l.id, base, grande ? 50 : 34, grande ? 38 : 26, grande ? 16 : 12, couleurs);
	const fond = base.add(new Vector3(0, 0, grande ? -14 : -8));
	if (g === "guilde") {
		comptoir(m, fond.add(new Vector3(6, 0, 2)), 16);
		point(m, fond.add(new Vector3(10, 2, 5)), l.id, "boutique", "Acheter", "Comptoir de la Guilde");
		const tableau = bloc(new Vector3(0.6, 9, 14), base.add(new Vector3(-24.2, 7, -4)), rgb(110, 80, 50), { parent: m, matiere: Enum.Material.Wood });
		void tableau;
		for (let i = 0; i < 8; i++) bloc(new Vector3(0.2, 2.2, 1.8), base.add(new Vector3(-23.8, 4.5 + (i % 3) * 2.8, -9.5 + i * 1.5)), rgb(235, 225, 195), { parent: m });
		point(m, base.add(new Vector3(-21, 2, -4)), l.id, "contrats", "Consulter", "Tableau des contrats");
		bloc(new Vector3(2, 4, 2), base.add(new Vector3(18, 2, -6)), C.bois, { parent: m, matiere: Enum.Material.Wood });
		const livre = bloc(new Vector3(2.4, 0.4, 1.8), base.add(new Vector3(18, 4.3, -6)), rgb(120, 60, 160), { parent: m, neon: true });
		lumiereInterieure(livre, rgb(170, 110, 255), 12);
		point(m, base.add(new Vector3(18, 2, -3)), l.id, "grimoire", "Lire", "Fusions de la Guilde");
		for (const [x, z] of [[-10, 8], [8, 8]] as const) tableBancs(m, base.add(new Vector3(x, 0, z)));
	} else if (g === "auberge") {
		comptoir(m, fond.add(new Vector3(4, 0, 2)), 18);
		point(m, fond.add(new Vector3(9, 2, 5)), l.id, "boutique", "Commander", "Comptoir de l'auberge");
		cheminee(m, base.add(new Vector3(-23.5, 0, -6)), CFrame.Angles(0, math.rad(-90), 0));
		for (const [x, z] of [[-10, 4], [6, 6], [-8, 12]] as const) tableBancs(m, base.add(new Vector3(x, 0, z)), 7);
		// le lit : dormir fait passer les mois, si tout le monde est d'accord
		bloc(new Vector3(5, 1.6, 8), base.add(new Vector3(18, 0.8, 10)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
		bloc(new Vector3(4.6, 0.8, 7.4), base.add(new Vector3(18, 2, 10)), rgb(230, 225, 210), { parent: m, matiere: Enum.Material.Fabric });
		bloc(new Vector3(4.6, 0.3, 4.5), base.add(new Vector3(18, 2.5, 11.3)), rgb(60, 110, 160), { parent: m, matiere: Enum.Material.Fabric });
		point(m, base.add(new Vector3(14, 2, 10)), l.id, "auberge", "Dormir", "Le lit de l'auberge");
	} else if (g === "boutique") {
		comptoir(m, fond, 16);
		etagere(m, fond.add(new Vector3(-8, 0, -3.5)));
		etagere(m, fond.add(new Vector3(8, 0, -3.5)));
		point(m, fond.add(new Vector3(0, 2, 3)), l.id, "boutique", "Acheter", l.nom);
	} else if (g === "palais") {
		tapis(m, base, new Vector2(8, 30), rgb(150, 30, 40));
		bloc(new Vector3(14, 2, 6), fond.add(new Vector3(0, 1, -2)), couleurs.mur.Lerp(new Color3(1, 1, 1), 0.3), { parent: m, matiere: Enum.Material.Marble });
		bloc(new Vector3(4, 7, 1.6), fond.add(new Vector3(0, 5.5, -4)), C.or, { parent: m, matiere: Enum.Material.Metal });
		for (const x of [-18, 18]) banniere(base.add(new Vector3(x, 0, -17)), C.toitBleu, m);
		if (l.boutique.size() > 0) point(m, fond.add(new Vector3(10, 2, 4)), l.id, "boutique", "Acheter", l.nom);
	} else if (g === "temple") {
		tapis(m, base, new Vector2(6, 30), rgb(130, 40, 50));
		const autel = bloc(new Vector3(6, 3, 3), fond.add(new Vector3(0, 1.5, -2)), rgb(255, 230, 160), { parent: m, neon: true });
		lumiereInterieure(autel, rgb(255, 230, 170), 36);
		for (const x of [-9, 9]) for (let r = 0; r < 4; r++) bloc(new Vector3(8, 1, 2), base.add(new Vector3(x, 1.6, 8 - r * 5)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
		if (l.boutique.size() > 0) point(m, base.add(new Vector3(14, 2, 10)), l.id, "boutique", "Faire une offrande", l.nom);
	} else {
		tableBancs(m, base.add(new Vector3(0, 0, -2)));
		tapis(m, base.add(new Vector3(0, 0, 6)), new Vector2(10, 8), rgb(140, 60, 50));
		if (l.boutique.size() > 0) {
			comptoir(m, fond, 12);
			point(m, fond.add(new Vector3(0, 2, 3)), l.id, "boutique", "Acheter", l.nom);
		}
	}
	// les PNJ du lieu, en arc de cercle face à la porte (leur visibilité suit la partie : client/rendu/marqueurs.ts)
	pnjDuLieu.forEach((id, k) => {
		const x = (k - (pnjDuLieu.size() - 1) / 2) * 5;
		pnj(m, l.id, id, fond.add(new Vector3(x, 0, 4 - math.abs(x) * 0.15)), base.add(new Vector3(0, 0, 10)));
	});
}

/** Construit toutes les salles (une par lieu, sauf la place de Lysmont qui reste en extérieur). */
export function construireInterieurs() {
	dossier = new Instance("Folder");
	dossier.Name = "Interieurs";
	dossier.Parent = Workspace;
	let i = 0;
	for (const l of tousLesLieux()) {
		if (l.id === "lysmont-place" || l.etape_seulement === true) continue;
		const base = new Vector3(-1200 + (i % 16) * 320, HAUTEUR, 1400 + math.floor(i / 16) * 320);
		i++;
		const [ok, err] = pcall(() => construireSalle(l.id, base));
		if (!ok) warn(`[Velmaris] Intérieur de ${l.id} : ${tostring(err)}`);
	}
	// la place de Lysmont : PNJ dehors, près de la fontaine (Aveline…)
	const place = CONTENU.regions.aubeclaire.lieux.find((l) => l.id === "lysmont-place");
	if (place) {
		const m = new Instance("Model");
		m.Name = "lysmont-place";
		m.Parent = dossier;
		const centre = positionLieu(place);
		place.pnj.forEach((p, k) => pnj(m, place.id, p.id, centre.add(new Vector3(-8 + k * 4, 0, 10)), centre.add(new Vector3(0, 0, 20))));
	}
}
