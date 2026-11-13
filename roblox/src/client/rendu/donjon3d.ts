/**
 * Donjon en 3D vu de dessus, dessiné par chaque joueur pour lui-même à partir de la carte du contenu
 * (content/campagne/saison-1/donjons.yaml). Seules les cases déjà vues sont montrées (brouillard).
 */
import { TweenService, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { caseDonjon, type EtatDonjon } from "shared/moteur";

const ORIGINE = new Vector3(0, 800, 0);
const CASE = 6;

const COULEURS: Record<string, Color3> = {
	mur: Color3.fromRGB(60, 56, 66),
	sol: Color3.fromRGB(120, 112, 104),
	"sol-os": Color3.fromRGB(150, 140, 120),
	"sol-piege": Color3.fromRGB(120, 112, 104),
	"sol-coffre": Color3.fromRGB(120, 112, 104),
	"sol-sceau": Color3.fromRGB(140, 110, 170),
	escalier: Color3.fromRGB(170, 160, 140),
	porte: Color3.fromRGB(120, 84, 52),
	"porte-verrouillee": Color3.fromRGB(90, 60, 40),
	"colonne-fontaine": Color3.fromRGB(80, 140, 200),
};

let dossier: Folder | undefined;
let donjonAffiche = "";
const cases = new Map<string, BasePart>();
let pion: Part | undefined;

function position(x: number, y: number, hauteur = 0): Vector3 {
	return ORIGINE.add(new Vector3(x * CASE, hauteur, y * CASE));
}

function creerCase(id: string, x: number, y: number): BasePart {
	const sorte = caseDonjon(CONTENU, id, x, y);
	const p = new Instance("Part");
	p.Anchored = true;
	p.CanCollide = false;
	p.Material = sorte === "mur" ? Enum.Material.Slate : Enum.Material.Cobblestone;
	p.Color = COULEURS[sorte] ?? COULEURS.sol;
	const haut = sorte === "mur" ? 6 : sorte === "colonne-fontaine" ? 4 : 1;
	p.Size = new Vector3(CASE, haut, CASE);
	p.Position = position(x, y, haut / 2);
	p.Parent = dossier;
	if (sorte === "sol-coffre") {
		const coffre = new Instance("Part");
		coffre.Anchored = true;
		coffre.CanCollide = false;
		coffre.Size = new Vector3(2.5, 1.6, 1.8);
		coffre.Color = Color3.fromRGB(150, 100, 40);
		coffre.Position = position(x, y, 1.8);
		coffre.Parent = dossier;
	}
	return p;
}

export function afficherDonjon(dj: EtatDonjon) {
	if (donjonAffiche !== dj.id) {
		cacherDonjon();
		donjonAffiche = dj.id;
		dossier = new Instance("Folder");
		dossier.Name = "DonjonLocal";
		dossier.Parent = Workspace;
		pion = new Instance("Part");
		pion.Shape = Enum.PartType.Ball;
		pion.Anchored = true;
		pion.CanCollide = false;
		pion.Size = new Vector3(3.5, 3.5, 3.5);
		pion.Color = Color3.fromRGB(217, 164, 65);
		pion.Material = Enum.Material.Neon;
		pion.Position = position(dj.x, dj.y, 3);
		pion.Parent = dossier;
		const lumiere = new Instance("PointLight");
		lumiere.Range = 26;
		lumiere.Brightness = 2;
		lumiere.Color = Color3.fromRGB(255, 200, 140);
		lumiere.Parent = pion;
	}
	for (const k of dj.vus) {
		if (cases.has(k)) continue;
		const [sx, sy] = k.split(",") as unknown as [string, string];
		const x = tonumber(sx);
		const y = tonumber(sy);
		if (x === undefined || y === undefined) continue;
		if (caseDonjon(CONTENU, dj.id, x, y) === "vide") continue;
		cases.set(k, creerCase(dj.id, x, y));
	}
	if (pion) TweenService.Create(pion, new TweenInfo(0.2), { Position: position(dj.x, dj.y, 3) }).Play();
	const camera = Workspace.CurrentCamera!;
	camera.CameraType = Enum.CameraType.Scriptable;
	const centre = position(dj.x, dj.y, 0);
	TweenService.Create(camera, new TweenInfo(0.25), { CFrame: CFrame.lookAt(centre.add(new Vector3(0, 46, 22)), centre) }).Play();
}

export function cacherDonjon() {
	dossier?.Destroy();
	dossier = undefined;
	donjonAffiche = "";
	cases.clear();
	pion = undefined;
}
