/**
 * Donjons en 3D où l'on marche avec son avatar. Chaque joueur construit le donjon chez lui, à partir de la carte
 * du contenu (content/campagne/saison-1/…/donjon.yaml) : une case de la carte = 12 × 12 studs.
 *
 * Les règles ne changent pas : le moteur garde une seule position pour le groupe (etat.donjon.x / y).
 * - Le meneur du jour (ou n'importe qui s'il est absent) « porte » le groupe : quand son avatar entre dans
 *   une nouvelle case, son appareil envoie l'action `donjon_deplacer`, case par case. Les événements
 *   (combat, coffre, piège, texte, sortie) se déclenchent donc sous ses pieds.
 * - Les autres joueurs se promènent librement ; une lueur dorée montre où se trouve le groupe.
 * - Combat : il a lieu sur place, au milieu de la salle (repereDonjon) ; les murs côté caméra sont masqués et
 *   chaque avatar se retire le temps du combat (retraitCombat).
 * - Défaite : le moteur ramène le groupe à l'escalier d'entrée ; tout le monde y est téléporté.
 * Brouillard : les torches ne s'allument, et les monstres n'apparaissent, que dans les cases déjà vues.
 */
import { Players, ReplicatedStorage, RunService, TweenService, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { caseDonjon, listeHeros, type DonjonDef, type EtatDonjon, type EtatPartie } from "shared/moteur";
import { agir, jeu } from "../partie";

const CASE = 12;
const HAUT = 18;
const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

interface Ambiance {
	sol: Color3;
	matSol: Enum.Material;
	mur: Color3;
	matMur: Enum.Material;
	plafond: Color3;
	flamme: Color3;
	accent: Color3;
}

/** Une ambiance par jeu de tuiles (le champ `tileset` du donjon). */
const AMBIANCES: Record<string, Ambiance> = {
	crypte: { sol: rgb(92, 88, 96), matSol: Enum.Material.Slate, mur: rgb(74, 70, 80), matMur: Enum.Material.Cobblestone, plafond: rgb(44, 41, 50), flamme: rgb(255, 150, 70), accent: rgb(160, 110, 255) },
	"ruines-de-sel": { sol: rgb(214, 200, 172), matSol: Enum.Material.Sandstone, mur: rgb(226, 216, 196), matMur: Enum.Material.Sandstone, plafond: rgb(150, 132, 104), flamme: rgb(255, 196, 120), accent: rgb(130, 220, 255) },
	"bibliotheque-racines": { sol: rgb(108, 80, 54), matSol: Enum.Material.WoodPlanks, mur: rgb(84, 68, 50), matMur: Enum.Material.Wood, plafond: rgb(58, 46, 34), flamme: rgb(170, 255, 170), accent: rgb(120, 255, 160) },
	"mille-marches": { sol: rgb(112, 110, 114), matSol: Enum.Material.Granite, mur: rgb(92, 90, 94), matMur: Enum.Material.Rock, plafond: rgb(58, 56, 60), flamme: rgb(255, 170, 80), accent: rgb(255, 120, 60) },
	"citadelle-obsidienne": { sol: rgb(42, 36, 48), matSol: Enum.Material.Basalt, mur: rgb(32, 26, 38), matMur: Enum.Material.Basalt, plafond: rgb(20, 16, 24), flamme: rgb(200, 110, 255), accent: rgb(220, 80, 255) },
};

const INFRANCHISSABLE = ["mur", "vide", "eau", "colonne"];

let dossier: Folder | undefined;
let donjonAffiche = "";
let origine = new Vector3(0, 800, 0);
let ambiance = AMBIANCES.crypte;
const murs: BasePart[] = [];
const torches = new Map<string, Light[]>();
const coffres = new Map<string, { couvercle: BasePart; ferme: CFrame; ouvert: CFrame; eclat: ParticleEmitter; objet?: BasePart }>();
const pieges = new Map<string, Model>();
const verrous: BasePart[] = [];
const monstres = new Map<string, Model>();
let dossierMonstres: Folder | undefined;
let lueur: BasePart | undefined;
let correction: ColorCorrectionEffect | undefined;
let derniere: { x: number; y: number } | undefined;
let retour: CFrame | undefined;

// ───────────────────────────── Outils ─────────────────────────────

function centre(x: number, y: number, h = 0): Vector3 {
	return origine.add(new Vector3(x * CASE, h, y * CASE));
}

function caseDe(p: Vector3): [number, number] {
	return [math.floor((p.X - origine.X) / CASE + 0.5), math.floor((p.Z - origine.Z) / CASE + 0.5)];
}

function bloc(taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material, parent: Instance, collision = true): Part {
	const p = new Instance("Part");
	p.Anchored = true;
	p.CanCollide = collision;
	p.Size = taille;
	p.CFrame = cf;
	p.Color = couleur;
	p.Material = matiere;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	if (taille.Magnitude < 4) p.CastShadow = false;
	p.Parent = parent;
	return p;
}

function cylindre(diametre: number, hauteur: number, pos: Vector3, couleur: Color3, matiere: Enum.Material, parent: Instance, collision = true): Part {
	const p = bloc(new Vector3(hauteur, diametre, diametre), new CFrame(pos).mul(CFrame.Angles(0, 0, math.pi / 2)), couleur, matiere, parent, collision);
	p.Shape = Enum.PartType.Cylinder;
	return p;
}

function lumiere(sur: BasePart, couleur: Color3, portee: number, eclat = 1.6): PointLight {
	const l = new Instance("PointLight");
	l.Color = couleur;
	l.Range = portee;
	l.Brightness = eclat;
	l.Shadows = false;
	l.Parent = sur;
	return l;
}

function tuile(id: string, x: number, y: number): string {
	return caseDonjon(CONTENU, id, x, y);
}

function bloquant(t: string): boolean {
	return INFRANCHISSABLE.some((m) => t.sub(1, m.size()) === m);
}

function aUneCle(etat: EtatPartie): boolean {
	for (const h of listeHeros(etat)) for (const [o, n] of pairs(h.inventaire)) if ((o as string).sub(1, 4) === "cle-" && n > 0) return true;
	return false;
}

/** Vrai si le groupe peut entrer dans cette case (mêmes règles que le moteur). */
function franchissable(etat: EtatPartie, id: string, x: number, y: number): boolean {
	const t = tuile(id, x, y);
	if (bloquant(t)) return false;
	if (t.sub(1, 17) === "porte-verrouillee") return aUneCle(etat);
	return true;
}

/** Le meneur guide le groupe ; s'il est absent, n'importe quel joueur présent peut le faire. */
export function peutGuider(): boolean {
	const etat = jeu.etat;
	if (!etat) return false;
	const meneurPresent = etat.meneur !== undefined && etat.joueurs[etat.meneur]?.present === true;
	return etat.meneur === jeu.moi || !meneurPresent;
}

function racine(): BasePart | undefined {
	return Players.LocalPlayer.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
}

/** Place l'avatar du joueur au centre d'une case (un petit décalage par joueur pour ne pas s'empiler). */
function placerAvatar(x: number, y: number) {
	const r = racine();
	if (!r) return;
	const n = (Players.LocalPlayer.UserId % 4) - 1.5;
	const p = centre(x, y, 3.5).add(new Vector3(n * 1.6, 0, n * 0.8));
	r.AssemblyLinearVelocity = new Vector3();
	r.CFrame = CFrame.lookAt(p, p.add(new Vector3(1, 0, 0)));
}

/** Chaque partie a son propre emplacement dans le ciel : deux groupes dans le même donjon ne se croisent pas. */
function origineDeLaPartie(): Vector3 {
	let h = 0;
	const code = jeu.code ?? "";
	for (let i = 1; i <= code.size(); i++) h = (h * 31 + (string.byte(code, i)[0] ?? 0)) % 64;
	return new Vector3(-3200 + (h % 8) * 800, 900, -3200 + math.floor(h / 8) * 800);
}

// ───────────────────────────── Construction ─────────────────────────────

function torche(x: number, y: number, dx: number, dy: number) {
	// sur le mur voisin (dx, dy), tournée vers la case (x, y)
	const face = centre(x, y, 9).add(new Vector3(dx * (CASE / 2 - 0.4), 0, dy * (CASE / 2 - 0.4)));
	const m = dossier!;
	bloc(new Vector3(0.6, 2.2, 0.6), new CFrame(face.add(new Vector3(-dx * 0.5, -1.4, -dy * 0.5))), rgb(60, 45, 30), Enum.Material.Wood, m, false);
	const flamme = bloc(new Vector3(0.8, 1, 0.8), new CFrame(face.add(new Vector3(-dx * 0.7, 0.1, -dy * 0.7))), ambiance.flamme, Enum.Material.Neon, m, false);
	const feu = new Instance("Fire");
	feu.Size = 2.2;
	feu.Heat = 6;
	feu.Color = ambiance.flamme;
	feu.SecondaryColor = rgb(255, 230, 160);
	feu.Enabled = false;
	feu.Parent = flamme;
	const l = lumiere(flamme, ambiance.flamme, 26, 1.8);
	l.Enabled = false;
	const cle = `${x},${y}`;
	const liste = torches.get(cle) ?? [];
	liste.push(l);
	torches.set(cle, liste);
	flamme.SetAttribute("Case", cle);
	flamme.Transparency = 1;
}

function porte(id: string, x: number, y: number, verrouillee: boolean) {
	const m = dossier!;
	// le passage va-t-il de gauche à droite (murs au-dessus et au-dessous) ou de haut en bas ?
	const horizontal = bloquant(tuile(id, x, y - 1)) && bloquant(tuile(id, x, y + 1));
	const axe = horizontal ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0); // le long du mur
	const c = centre(x, y);
	const ouverture = 6;
	const cote = (CASE - ouverture) / 2;
	for (const s of [-1, 1]) {
		const t = horizontal ? new Vector3(3, HAUT, cote) : new Vector3(cote, HAUT, 3);
		const p = bloc(t, new CFrame(c.add(axe.mul(s * (ouverture / 2 + cote / 2))).add(new Vector3(0, HAUT / 2, 0))), ambiance.mur, ambiance.matMur, m);
		murs.push(p);
	}
	const linteau = bloc(horizontal ? new Vector3(3, HAUT - 10, ouverture) : new Vector3(ouverture, HAUT - 10, 3), new CFrame(c.add(new Vector3(0, 10 + (HAUT - 10) / 2, 0))), ambiance.mur, ambiance.matMur, m);
	murs.push(linteau);
	// encadrement en bois
	for (const s of [-1, 1]) bloc(horizontal ? new Vector3(3.4, 10, 0.8) : new Vector3(0.8, 10, 3.4), new CFrame(c.add(axe.mul(s * (ouverture / 2 + 0.2))).add(new Vector3(0, 5, 0))), rgb(90, 62, 38), Enum.Material.Wood, m);
	bloc(horizontal ? new Vector3(3.4, 0.8, ouverture + 1.6) : new Vector3(ouverture + 1.6, 0.8, 3.4), new CFrame(c.add(new Vector3(0, 10, 0))), rgb(90, 62, 38), Enum.Material.Wood, m);
	// battant : ouvert contre le mur, ou fermé (porte de bronze verrouillée)
	const charniere = c.add(axe.mul(-ouverture / 2));
	const fermee = CFrame.lookAt(charniere, charniere.add(axe)).mul(new CFrame(0, 4.8, -ouverture / 2));
	const battant = bloc(new Vector3(0.6, 9.4, ouverture - 0.2), fermee, verrouillee ? rgb(150, 110, 50) : rgb(110, 76, 44), verrouillee ? Enum.Material.Metal : Enum.Material.WoodPlanks, m, verrouillee);
	if (verrouillee) {
		battant.SetAttribute("Charniere", charniere);
		battant.SetAttribute("Axe", axe);
		const serrure = bloc(new Vector3(0.8, 1.2, 0.8), battant.CFrame.mul(new CFrame(0, 0, ouverture / 2 - 1.2)), rgb(230, 190, 80), Enum.Material.Metal, m, false);
		serrure.Name = "Serrure";
		battant.Name = "Verrou";
		verrous.push(battant);
	} else {
		battant.CFrame = CFrame.lookAt(charniere, charniere.add(axe)).mul(CFrame.Angles(0, math.rad(-80), 0)).mul(new CFrame(0, 4.8, -ouverture / 2));
	}
}

function escalier(id: string, x: number, y: number) {
	const m = dossier!;
	// les marches montent vers le mur voisin (au nord ou à l'ouest)
	let d = new Vector3(0, 0, -1);
	if (!bloquant(tuile(id, x, y - 1))) d = bloquant(tuile(id, x - 1, y)) ? new Vector3(-1, 0, 0) : new Vector3(1, 0, 0);
	const c = centre(x, y);
	for (let i = 0; i < 5; i++) {
		const h = 0.8 * (i + 1);
		const p = c.add(d.mul(1 + i * 1.1));
		bloc(d.X !== 0 ? new Vector3(1.2, h, CASE - 2) : new Vector3(CASE - 2, h, 1.2), new CFrame(p.add(new Vector3(0, h / 2, 0))), ambiance.sol.Lerp(new Color3(1, 1, 1), 0.15), ambiance.matSol, m);
	}
	// la lumière du jour qui tombe de l'escalier
	const jour = bloc(new Vector3(2, 0.4, 2), new CFrame(c.add(d.mul(CASE / 2 - 1)).add(new Vector3(0, HAUT - 1, 0))), rgb(255, 245, 220), Enum.Material.Neon, m, false);
	lumiere(jour, rgb(255, 240, 210), 30, 2);
	const gui = new Instance("BillboardGui");
	gui.Size = new UDim2(0, 120, 0, 30);
	gui.StudsOffset = new Vector3(0, 6, 0);
	gui.MaxDistance = 70;
	gui.Adornee = jour;
	const t = new Instance("TextLabel");
	t.Size = UDim2.fromScale(1, 1);
	t.BackgroundTransparency = 1;
	t.Font = Enum.Font.GothamBold;
	t.TextSize = 16;
	t.TextColor3 = rgb(255, 230, 170);
	t.TextStrokeTransparency = 0.3;
	t.Text = "↑ Sortie";
	t.Parent = gui;
	gui.Parent = jour;
}

function ossements(x: number, y: number) {
	const m = dossier!;
	const c = centre(x, y);
	const hasard = new Random(x * 97 + y * 13);
	for (let i = 0; i < 5; i++) {
		const p = c.add(new Vector3(hasard.NextNumber(-4, 4), 0.25, hasard.NextNumber(-4, 4)));
		bloc(new Vector3(0.4, 0.4, hasard.NextNumber(1.4, 2.4)), new CFrame(p).mul(CFrame.Angles(0, hasard.NextNumber(0, math.pi), 0)), rgb(226, 220, 200), Enum.Material.SmoothPlastic, m, false);
	}
	const crane = bloc(new Vector3(1.2, 1.2, 1.2), new CFrame(c.add(new Vector3(hasard.NextNumber(-3, 3), 0.6, hasard.NextNumber(-3, 3)))), rgb(230, 224, 205), Enum.Material.SmoothPlastic, m, false);
	crane.Shape = Enum.PartType.Ball;
}

function fontaine(x: number, y: number) {
	const m = dossier!;
	const c = centre(x, y);
	cylindre(10, 2, c.add(new Vector3(0, 1, 0)), ambiance.mur, ambiance.matMur, m);
	const eau = cylindre(9, 0.4, c.add(new Vector3(0, 2, 0)), rgb(70, 140, 200), Enum.Material.Glass, m, false);
	eau.Transparency = 0.3;
	cylindre(3, HAUT, c.add(new Vector3(0, HAUT / 2, 0)), ambiance.mur.Lerp(new Color3(1, 1, 1), 0.1), ambiance.matMur, m);
	const filet = bloc(new Vector3(0.6, 8, 0.6), new CFrame(c.add(new Vector3(1.7, 6, 0))), rgb(120, 190, 255), Enum.Material.Neon, m, false);
	filet.Transparency = 0.4;
	lumiere(filet, rgb(120, 180, 255), 18, 1);
}

function autel(x: number, y: number) {
	const m = dossier!;
	const c = centre(x, y);
	const cercle = cylindre(10, 0.2, c.add(new Vector3(0, 0.1, 0)), ambiance.accent, Enum.Material.Neon, m, false);
	cercle.Transparency = 0.55;
	bloc(new Vector3(5, 3.4, 3), new CFrame(c.add(new Vector3(0, 1.7, 0))), ambiance.mur.Lerp(new Color3(0, 0, 0), 0.2), Enum.Material.Marble, m);
	lumiere(cercle, ambiance.accent, 22, 1.4);
}

/** Coffre (ou objet posé sur l'autel) d'un événement « coffre ». */
function coffre(id: string, cle: string, x: number, y: number) {
	const m = dossier!;
	const c = centre(x, y);
	const surAutel = tuile(id, x, y) === "sol-sceau";
	if (surAutel) {
		const pierre = bloc(new Vector3(1.6, 1.6, 1.6), new CFrame(c.add(new Vector3(0, 4.3, 0))), rgb(30, 24, 36), Enum.Material.Basalt, m, false);
		pierre.Shape = Enum.PartType.Ball;
		const rune = bloc(new Vector3(0.2, 0.9, 0.9), new CFrame(c.add(new Vector3(0, 4.3, 0.75))).mul(CFrame.Angles(0, math.pi / 2, 0)), ambiance.accent, Enum.Material.Neon, m, false);
		rune.Parent = pierre;
		const eclat = new Instance("ParticleEmitter");
		eclat.Color = new ColorSequence(ambiance.accent);
		eclat.LightEmission = 1;
		eclat.Rate = 8;
		eclat.Lifetime = new NumberRange(0.8, 1.4);
		eclat.Speed = new NumberRange(1, 2);
		eclat.Size = new NumberSequence(0.3, 0);
		eclat.Parent = pierre;
		coffres.set(cle, { couvercle: pierre, ferme: pierre.CFrame, ouvert: pierre.CFrame, eclat, objet: pierre });
		return;
	}
	const base = c.add(new Vector3(0, 0, -2));
	bloc(new Vector3(4, 2.2, 2.6), new CFrame(base.add(new Vector3(0, 1.1, 0))), rgb(120, 78, 40), Enum.Material.WoodPlanks, m);
	for (const xx of [-1.4, 1.4]) bloc(new Vector3(0.3, 2.3, 2.7), new CFrame(base.add(new Vector3(xx, 1.1, 0))), rgb(190, 150, 70), Enum.Material.Metal, m, false);
	const charniere = base.add(new Vector3(0, 2.2, -1.3));
	const ferme = new CFrame(charniere).mul(new CFrame(0, 0.4, 1.3));
	const ouvert = new CFrame(charniere).mul(CFrame.Angles(math.rad(-105), 0, 0)).mul(new CFrame(0, 0.4, 1.3));
	const couvercle = bloc(new Vector3(4.1, 0.8, 2.7), ferme, rgb(130, 86, 44), Enum.Material.WoodPlanks, m, false);
	bloc(new Vector3(0.5, 0.6, 0.2), new CFrame(base.add(new Vector3(0, 1.9, 1.35))), rgb(230, 190, 80), Enum.Material.Metal, m, false);
	const tresor = bloc(new Vector3(3.4, 0.4, 2), new CFrame(base.add(new Vector3(0, 2, 0))), rgb(255, 205, 80), Enum.Material.Neon, m, false);
	const eclat = new Instance("ParticleEmitter");
	eclat.Color = new ColorSequence(rgb(255, 215, 110));
	eclat.LightEmission = 1;
	eclat.Rate = 6;
	eclat.Lifetime = new NumberRange(0.6, 1.2);
	eclat.Speed = new NumberRange(1.5, 3);
	eclat.SpreadAngle = new Vector2(25, 25);
	eclat.Size = new NumberSequence(0.25, 0);
	eclat.Parent = tresor;
	coffres.set(cle, { couvercle, ferme, ouvert, eclat, objet: tresor });
}

/** Dalle piégée : discrète tant que le piège n'a pas joué, hérissée de pointes ensuite. */
function piege(cle: string, x: number, y: number) {
	const m = dossier!;
	const c = centre(x, y);
	bloc(new Vector3(6, 0.2, 6), new CFrame(c.add(new Vector3(0, 0.1, 0))), ambiance.sol.Lerp(new Color3(0, 0, 0), 0.18), ambiance.matSol, m, false);
	const pointes = new Instance("Model");
	pointes.Name = "Pointes";
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			const p = bloc(new Vector3(0.5, 1.6, 0.5), new CFrame(c.add(new Vector3(i * 1.8, 0.8, j * 1.8))), rgb(150, 150, 160), Enum.Material.Metal, pointes, false);
			p.Name = "Pointe";
		}
	}
	pieges.set(cle, pointes);
}

function murs3d(d: DonjonDef) {
	const m = dossier!;
	const hauteur = d.carte.size();
	const largeur = d.carte[0].size();
	// sol et plafond d'un seul tenant
	const milieu = centre((largeur - 1) / 2, (hauteur - 1) / 2);
	bloc(new Vector3(largeur * CASE, 1, hauteur * CASE), new CFrame(milieu.add(new Vector3(0, -0.5, 0))), ambiance.sol, ambiance.matSol, m);
	const plafond = bloc(new Vector3(largeur * CASE, 1, hauteur * CASE), new CFrame(milieu.add(new Vector3(0, HAUT + 0.5, 0))), ambiance.plafond, ambiance.matMur, m);
	plafond.Name = "Plafond";
	// murs : seulement ceux qui bordent une case praticable (les autres sont dans la masse)
	for (let y = 0; y < hauteur; y++) {
		for (let x = 0; x < largeur; x++) {
			const t = tuile(d.id, x, y);
			if (!(t === "mur" || t === "vide")) continue;
			let borde = false;
			for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
				const v = tuile(d.id, x + dx, y + dy);
				if (!(v === "mur" || v === "vide")) borde = true;
			}
			if (!borde) continue;
			const p = bloc(new Vector3(CASE, HAUT, CASE), new CFrame(centre(x, y, HAUT / 2)), ambiance.mur, ambiance.matMur, m);
			// une bande plus sombre au pied du mur
			bloc(new Vector3(CASE + 0.2, 1.2, CASE + 0.2), new CFrame(centre(x, y, 0.6)), ambiance.mur.Lerp(new Color3(0, 0, 0), 0.3), ambiance.matMur, p, false);
			murs.push(p);
		}
	}
	// tuiles particulières et torches
	for (let y = 0; y < hauteur; y++) {
		for (let x = 0; x < largeur; x++) {
			const t = tuile(d.id, x, y);
			if (t === "porte") porte(d.id, x, y, false);
			else if (t === "porte-verrouillee") porte(d.id, x, y, true);
			else if (t === "escalier") escalier(d.id, x, y);
			else if (t === "sol-os") ossements(x, y);
			else if (t === "colonne-fontaine") fontaine(x, y);
			else if (t === "sol-sceau") autel(x, y);
			if (bloquant(t) || t.sub(1, 5) === "porte") continue;
			for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
				if (tuile(d.id, x + dx, y + dy) !== "mur") continue;
				if ((x * 7 + y * 13 + dx * 3 + dy * 5 + 40) % 6 === 0) torche(x, y, dx, dy);
			}
		}
	}
	for (const e of d.evenements) {
		if (e.type === "coffre") coffre(d.id, e.id, e.x, e.y);
		else if (e.type === "piege") piege(e.id, e.x, e.y);
	}
}

/** Monstre d'une rencontre, posé sur sa case : le modèle 3D du premier ennemi (silhouette rouge en secours). */
function monstre(rencontre: string, x: number, y: number): Model {
	const r = CONTENU.rencontres[rencontre];
	const premier = r?.ennemis[0]?.id ?? "";
	const modeles = ReplicatedStorage.FindFirstChild("VelmarisModeles");
	const g = modeles?.FindFirstChild(premier) as Model | undefined;
	let m: Model;
	if (g) {
		m = g.Clone();
		for (const p of m.GetDescendants()) {
			if (p.IsA("BasePart")) {
				p.Anchored = true;
				p.CanCollide = false;
			} else if (p.IsA("Script") || p.IsA("LocalScript")) p.Destroy();
		}
		if (CONTENU.ennemis[premier]?.boss === true) pcall(() => m.ScaleTo(1.4));
	} else {
		m = new Instance("Model");
		const corps = bloc(new Vector3(3, 6, 2), new CFrame(), rgb(120, 30, 30), Enum.Material.SmoothPlastic, m, false);
		const yeux = bloc(new Vector3(1.6, 0.4, 0.2), new CFrame(0, 2, -1.1), rgb(255, 80, 60), Enum.Material.Neon, m, false);
		void yeux;
		m.PrimaryPart = corps;
	}
	m.Name = rencontre;
	const ici = centre(x, y);
	const regard = centre(CONTENU.donjons[donjonAffiche].depart.x, CONTENU.donjons[donjonAffiche].depart.y);
	m.PivotTo(CFrame.lookAt(ici, new Vector3(regard.X, ici.Y, regard.Z)));
	const [boite, taille] = m.GetBoundingBox();
	m.PivotTo(m.GetPivot().add(new Vector3(0, ici.Y - (boite.Position.Y - taille.Y / 2), 0)));
	const gui = new Instance("BillboardGui");
	gui.Size = new UDim2(0, 200, 0, 28);
	gui.StudsOffset = new Vector3(0, taille.Y / 2 + 2, 0);
	gui.MaxDistance = 70;
	const t = new Instance("TextLabel");
	t.Size = UDim2.fromScale(1, 1);
	t.BackgroundTransparency = 1;
	t.Font = Enum.Font.GothamBold;
	t.TextSize = 15;
	t.TextColor3 = rgb(255, 140, 120);
	t.TextStrokeTransparency = 0.2;
	t.Text = `⚔ ${r?.nom ?? "Danger"}`;
	t.Parent = gui;
	gui.Adornee = m.PrimaryPart ?? m.FindFirstChildWhichIsA("BasePart");
	gui.Parent = m;
	const aura = lumiere((m.PrimaryPart ?? m.FindFirstChildWhichIsA("BasePart"))!, rgb(255, 80, 60), 14, 0.8);
	void aura;
	m.Parent = dossierMonstres;
	return m;
}

function construire(dj: EtatDonjon) {
	const d = CONTENU.donjons[dj.id];
	donjonAffiche = dj.id;
	origine = origineDeLaPartie();
	ambiance = AMBIANCES[d.tileset] ?? AMBIANCES.crypte;
	dossier = new Instance("Folder");
	dossier.Name = "DonjonLocal";
	dossier.Parent = Workspace;
	dossierMonstres = new Instance("Folder");
	dossierMonstres.Name = "Monstres";
	dossierMonstres.Parent = dossier;
	murs3d(d);
	// la lueur dorée qui montre où est le groupe (ce que « voit » le moteur)
	const boule = bloc(new Vector3(1.4, 1.4, 1.4), new CFrame(centre(dj.x, dj.y, 7)), rgb(255, 210, 110), Enum.Material.Neon, dossier, false);
	boule.Shape = Enum.PartType.Ball;
	boule.Transparency = 0.2;
	lumiere(boule, rgb(255, 210, 140), 22, 1.2);
	lueur = boule;
	// pénombre (seulement chez ce joueur)
	correction = new Instance("ColorCorrectionEffect");
	correction.Name = "PenombreDonjon";
	correction.Brightness = -0.06;
	correction.Contrast = 0.12;
	correction.Saturation = -0.1;
	correction.TintColor = rgb(235, 225, 215);
	correction.Parent = Workspace.CurrentCamera;
	// on entre : chacun se retrouve au pied de l'escalier
	const r = racine();
	if (r && !retour) retour = r.CFrame;
	placerAvatar(dj.x, dj.y);
	derniere = { x: dj.x, y: dj.y };
}

// ───────────────────────────── Interface publique ─────────────────────────────

/** Construit le donjon (la première fois) puis le met à jour : brouillard, coffres, pièges, portes, monstres. */
export function afficherDonjon(dj: EtatDonjon) {
	if (donjonAffiche !== dj.id) {
		cacherDonjon(false);
		construire(dj);
	}
	const etat = jeu.etat!;
	const d = CONTENU.donjons[dj.id];
	const vus = new Set<string>(dj.vus);
	// torches des cases vues
	for (const [cle, liste] of torches) {
		const allumee = vus.has(cle);
		for (const l of liste) {
			l.Enabled = allumee;
			const flamme = l.Parent as BasePart;
			flamme.Transparency = allumee ? 0 : 1;
			const feu = flamme.FindFirstChildOfClass("Fire");
			if (feu) feu.Enabled = allumee;
		}
	}
	// coffres ouverts, pièges déclenchés
	for (const e of d.evenements) {
		const fait = dj.faits.includes(e.id);
		const c = coffres.get(e.id);
		if (c && fait && c.eclat.Enabled) {
			// ouvert une seule fois : le couvercle bascule, l'or disparaît (l'objet de l'autel aussi)
			c.eclat.Enabled = false;
			if (c.objet) {
				c.objet.Transparency = 1;
				for (const x of c.objet.GetChildren()) if (x.IsA("BasePart")) x.Transparency = 1;
			}
			if (c.couvercle !== c.objet) TweenService.Create(c.couvercle, new TweenInfo(0.5, Enum.EasingStyle.Back), { CFrame: c.ouvert }).Play();
		}
		const p = pieges.get(e.id);
		if (p) p.Parent = fait ? dossier : undefined;
		// monstres : visibles dans les cases vues, tant que leur combat n'est pas gagné
		if (e.type === "combat" && e.rencontre !== undefined) {
			const voir = vus.has(`${e.x},${e.y}`) && !fait;
			const m = monstres.get(e.id);
			if (voir && !m) monstres.set(e.id, monstre(e.rencontre, e.x, e.y));
			else if (!voir && m) {
				m.Destroy();
				monstres.delete(e.id);
			}
		}
	}
	// portes de bronze : elles s'ouvrent dès que le groupe a une clé
	if (aUneCle(etat)) {
		for (const v of verrous) {
			if (!v.CanCollide) continue;
			v.CanCollide = false;
			const charniere = v.GetAttribute("Charniere") as Vector3;
			const axe = v.GetAttribute("Axe") as Vector3;
			const ouvert = CFrame.lookAt(charniere, charniere.add(axe)).mul(CFrame.Angles(0, math.rad(-80), 0)).mul(new CFrame(0, 4.8, -3));
			TweenService.Create(v, new TweenInfo(1, Enum.EasingStyle.Sine), { CFrame: ouvert }).Play();
			v.Parent?.FindFirstChild("Serrure")?.Destroy();
		}
	}
	// la lueur suit le groupe ; si le groupe a « sauté » (défaite : retour à l'entrée), tout le monde y retourne
	if (lueur) TweenService.Create(lueur, new TweenInfo(0.25), { CFrame: new CFrame(centre(dj.x, dj.y, 7)) }).Play();
	if (derniere && math.abs(derniere.x - dj.x) + math.abs(derniere.y - dj.y) > 1) placerAvatar(dj.x, dj.y);
	derniere = { x: dj.x, y: dj.y };
}

/** Retire le donjon. `rentrer` : ramène l'avatar là où il était avant d'entrer. */
export function cacherDonjon(rentrer = true) {
	if (!dossier) return;
	dossier.Destroy();
	dossier = undefined;
	dossierMonstres = undefined;
	correction?.Destroy();
	correction = undefined;
	donjonAffiche = "";
	murs.clear();
	torches.clear();
	coffres.clear();
	pieges.clear();
	verrous.clear();
	monstres.clear();
	lueur = undefined;
	derniere = undefined;
	retraitCombat(false);
	if (rentrer && retour) {
		const r = racine();
		if (r) {
			r.AssemblyLinearVelocity = new Vector3();
			r.CFrame = retour;
		}
		retour = undefined;
	}
}

/** Téléporte l'avatar auprès du groupe (bouton « Rejoindre le groupe »). */
export function rejoindreGroupe() {
	const dj = jeu.etat?.donjon;
	if (dj && dossier) placerAvatar(dj.x, dj.y);
}

// ───────────────────────────── Combat sur place ─────────────────────────────

const masques: BasePart[] = [];

/**
 * Repère du combat dans le donjon : au milieu de la salle où se trouve le groupe, l'axe des combattants dans
 * la plus grande longueur libre. Les murs côté caméra et les monstres du décor sont masqués le temps du combat.
 */
export function repereDonjon(): CFrame | undefined {
	const dj = jeu.etat?.donjon;
	if (!dj || !dossier || donjonAffiche !== dj.id) return undefined;
	const libre = (x: number, y: number) => !bloquant(tuile(dj.id, x, y));
	const course = (dx: number, dy: number) => {
		let k = 0;
		while (k < 6 && libre(dj.x + dx * (k + 1), dj.y + dy * (k + 1))) k++;
		return k;
	};
	const g = course(-1, 0);
	const dr = course(1, 0);
	const h = course(0, -1);
	const b = course(0, 1);
	const o = centre(dj.x + (dr - g) / 2, dj.y + (b - h) / 2);
	const versCamera = g + dr >= h + b ? new Vector3(0, 0, b >= h ? 1 : -1) : new Vector3(dr >= g ? 1 : -1, 0, 0);
	const repere = CFrame.lookAt(o, o.sub(versCamera));
	montrerMurs();
	for (const p of murs) {
		if (repere.PointToObjectSpace(p.Position).Z > CASE * 0.6) {
			p.LocalTransparencyModifier = 1;
			masques.push(p);
		}
	}
	if (dossierMonstres) dossierMonstres.Parent = undefined;
	if (lueur) lueur.Transparency = 1;
	return repere;
}

/** Fin du combat : murs, monstres et lueur réapparaissent. */
export function montrerMurs() {
	for (const p of masques) p.LocalTransparencyModifier = 0;
	masques.clear();
	if (dossierMonstres && dossier) dossierMonstres.Parent = dossier;
	if (lueur) lueur.Transparency = 0.2;
}

let retraite: CFrame | undefined;
/** Pendant un combat du donjon, l'avatar se met à l'écart (pour ne pas encombrer l'arène), puis revient. */
export function retraitCombat(oui: boolean) {
	const r = racine();
	if (oui && !retraite && dossier && r) {
		retraite = r.CFrame;
		r.Anchored = true;
		r.CFrame = new CFrame(origine.add(new Vector3(-60, 40, -60)));
	} else if (!oui && retraite) {
		if (r) {
			r.CFrame = retraite;
			r.Anchored = false;
		}
		retraite = undefined;
	}
}

// ───────────────────────────── Le meneur porte le groupe ─────────────────────────────

let dernierPas = 0;
RunService.Heartbeat.Connect(() => {
	const etat = jeu.etat;
	const dj = etat?.donjon;
	if (!etat || !dj || !dossier || donjonAffiche !== dj.id || retraite) return;
	if (etat.combats["groupe"] !== undefined || !peutGuider()) return;
	if (os.clock() - dernierPas < 0.12) return;
	const r = racine();
	if (!r) return;
	const [ax, ay] = caseDe(r.Position);
	if (ax === dj.x && ay === dj.y) return;
	const ex = ax - dj.x;
	const ey = ay - dj.y;
	if (math.abs(ex) + math.abs(ey) > 4) {
		// trop loin du groupe (chute, téléportation…) : on revient auprès de lui
		dernierPas = os.clock() + 0.5;
		placerAvatar(dj.x, dj.y);
		return;
	}
	const sx = math.sign(ex);
	const sy = math.sign(ey);
	const options: [number, number][] = math.abs(ex) >= math.abs(ey) ? [[sx, 0], [0, sy]] : [[0, sy], [sx, 0]];
	for (const [dx, dy] of options) {
		if (dx === 0 && dy === 0) continue;
		if (!franchissable(etat, dj.id, dj.x + dx, dj.y + dy)) continue;
		dernierPas = os.clock();
		agir({ type: "donjon_deplacer", dx, dy });
		return;
	}
	dernierPas = os.clock();
});
