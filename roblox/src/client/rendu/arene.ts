/**
 * Arène de combat en 3D, dessinée par chaque joueur pour lui-même (rien n'est envoyé au serveur).
 * Les combattants sont des « pions » simples : héros à gauche, ennemis à droite, rang avant / arrière.
 * Les nouveaux événements du combat (attaque, dégâts, soin, K.O.) déclenchent de petites animations.
 */
import { TweenService, Workspace } from "@rbxts/services";
import type { Combat, Combattant } from "shared/moteur";

const ORIGINE = new Vector3(0, 400, 0);
const COULEUR_CLASSE: Record<string, Color3> = {
	"lame-runique": Color3.fromRGB(70, 110, 200),
	arcaniste: Color3.fromRGB(150, 80, 200),
	guerisseur: Color3.fromRGB(230, 220, 170),
	rodeur: Color3.fromRGB(70, 140, 70),
	gardien: Color3.fromRGB(150, 150, 160),
};

let dossier: Folder | undefined;
let combatAffiche = "";
let evenementsVus = 0;
const pions = new Map<string, { modele: Model; corps: BasePart; barre: Frame; nom: TextLabel }>();

function part(taille: Vector3, cf: CFrame, couleur: Color3, parent: Instance, forme?: Enum.PartType): Part {
	const p = new Instance("Part");
	p.Anchored = true;
	p.CanCollide = false;
	p.Size = taille;
	p.CFrame = cf;
	p.Color = couleur;
	p.Material = Enum.Material.SmoothPlastic;
	if (forme) p.Shape = forme;
	p.Parent = parent;
	return p;
}

function couleurDe(x: Combattant): Color3 {
	if (x.camp === "heros") return COULEUR_CLASSE[x.refId] ?? (x.type === "compagnon" ? Color3.fromRGB(200, 120, 60) : Color3.fromRGB(80, 130, 210));
	return x.boss ? Color3.fromRGB(110, 30, 40) : Color3.fromRGB(160, 60, 50);
}

function preparerDecor(fond: string) {
	dossier?.Destroy();
	dossier = new Instance("Folder");
	dossier.Name = "AreneLocale";
	dossier.Parent = Workspace;
	const sol: Record<string, Color3> = {
		arene: Color3.fromRGB(214, 190, 140),
		foret: Color3.fromRGB(70, 110, 60),
		plaine: Color3.fromRGB(110, 150, 80),
		crypte: Color3.fromRGB(70, 66, 72),
		ville: Color3.fromRGB(150, 146, 140),
	};
	part(new Vector3(70, 2, 40), new CFrame(ORIGINE.add(new Vector3(0, -1, 0))), sol[fond] ?? Color3.fromRGB(120, 120, 110), dossier);
	part(new Vector3(70, 30, 2), new CFrame(ORIGINE.add(new Vector3(0, 14, -20))), Color3.fromRGB(40, 34, 48), dossier);
}

function creerPion(x: Combattant): { modele: Model; corps: BasePart; barre: Frame; nom: TextLabel } {
	const echelle = x.boss ? 2 : x.categorie === "petit" ? 0.7 : 1;
	const modele = new Instance("Model");
	modele.Name = x.id;
	const couleur = couleurDe(x);
	const corps = part(new Vector3(2.4, 3.6, 1.6).mul(echelle), new CFrame(), couleur, modele);
	corps.Name = "Corps";
	const tete = part(new Vector3(1.8, 1.8, 1.8).mul(echelle), new CFrame(0, 2.8 * echelle, 0), Color3.fromRGB(240, 210, 180), modele, Enum.PartType.Ball);
	if (x.camp === "ennemis") tete.Color = couleur.Lerp(new Color3(0, 0, 0), 0.3);
	const soude = (a: BasePart, b: BasePart) => {
		const w = new Instance("WeldConstraint");
		w.Part0 = a;
		w.Part1 = b;
		w.Parent = a;
	};
	tete.CFrame = corps.CFrame.mul(new CFrame(0, 2.8 * echelle, 0));
	// la tête n'est pas ancrée : soudée au corps (ancré), elle le suit quand il bouge
	tete.Anchored = false;
	soude(corps, tete);
	modele.PrimaryPart = corps;

	const panneau = new Instance("BillboardGui");
	panneau.Size = new UDim2(0, 140, 0, 34);
	panneau.StudsOffset = new Vector3(0, 4.5 * echelle, 0);
	panneau.AlwaysOnTop = true;
	panneau.Adornee = corps;
	const nom = new Instance("TextLabel");
	nom.Size = new UDim2(1, 0, 0, 18);
	nom.BackgroundTransparency = 1;
	nom.TextColor3 = new Color3(1, 1, 1);
	nom.TextStrokeTransparency = 0.3;
	nom.Font = Enum.Font.GothamBold;
	nom.TextSize = 14;
	nom.Text = x.nom;
	nom.Parent = panneau;
	const fond = new Instance("Frame");
	fond.Position = new UDim2(0, 0, 0, 22);
	fond.Size = new UDim2(1, 0, 0, 8);
	fond.BackgroundColor3 = Color3.fromRGB(30, 20, 15);
	fond.Parent = panneau;
	const barre = new Instance("Frame");
	barre.Size = UDim2.fromScale(1, 1);
	barre.BackgroundColor3 = x.camp === "ennemis" ? Color3.fromRGB(196, 72, 60) : Color3.fromRGB(96, 170, 90);
	barre.BorderSizePixel = 0;
	barre.Parent = fond;
	panneau.Parent = modele;
	modele.Parent = dossier;
	return { modele, corps, barre, nom };
}

function placeDe(combat: Combat, x: Combattant): CFrame {
	const memeCamp = combat.combattants.filter((c) => c.camp === x.camp && c.rang === x.rang && !c.parti);
	const i = memeCamp.indexOf(x);
	const n = memeCamp.size();
	const cote = x.camp === "heros" ? -1 : 1;
	const profondeur = x.rang === "avant" ? 8 : 15;
	const z = (i - (n - 1) / 2) * 6;
	const position = ORIGINE.add(new Vector3(cote * profondeur, 1.8 * (x.boss ? 2 : 1), z));
	return CFrame.lookAt(position, position.add(new Vector3(-cote, 0, 0)));
}

function eclair(p: BasePart, couleur: Color3) {
	const avant = p.Color;
	p.Color = couleur;
	task.delay(0.25, () => {
		if (p.Parent) p.Color = avant;
	});
}

/** Met l'arène à jour pour ce combat (crée, déplace, anime les pions). */
export function afficherArene(combat: Combat) {
	if (combatAffiche !== combat.id) {
		combatAffiche = combat.id;
		evenementsVus = 0;
		pions.clear();
		preparerDecor(combat.fond);
	}
	const presents = new Set<string>();
	for (const x of combat.combattants) {
		if (x.parti) continue;
		presents.add(x.id);
		let p = pions.get(x.id);
		if (!p) {
			p = creerPion(x);
			pions.set(x.id, p);
			p.modele.PivotTo(placeDe(combat, x));
		}
		const cible = placeDe(combat, x);
		const ko = x.ko;
		const finale = ko ? cible.mul(CFrame.Angles(0, 0, math.rad(80))).add(new Vector3(0, -1, 0)) : cible;
		TweenService.Create(p.corps, new TweenInfo(0.35), { CFrame: finale }).Play();
		p.barre.Size = UDim2.fromScale(math.clamp(x.pv / math.max(1, x.pvMax), 0, 1), 1);
		p.nom.Text = combat.enAttente === x.id ? `▶ ${x.nom}` : x.nom;
		p.nom.TextColor3 = combat.enAttente === x.id ? Color3.fromRGB(255, 210, 110) : new Color3(1, 1, 1);
	}
	for (const [id, p] of pions) {
		if (!presents.has(id)) {
			p.modele.Destroy();
			pions.delete(id);
		}
	}
	// animations des nouveaux événements
	const n = combat.evenements.size();
	for (let i = evenementsVus; i < n; i++) {
		const e = combat.evenements[i];
		if (e.type === "action" && e.source !== undefined && e.cible !== undefined) {
			const a = pions.get(e.source);
			const b = pions.get(e.cible);
			if (a && b && a !== b) {
				const depart = a.corps.CFrame;
				const vers = depart.Lerp(CFrame.lookAt(b.corps.Position, b.corps.Position), 0.35);
				const aller = TweenService.Create(a.corps, new TweenInfo(0.15), { CFrame: new CFrame(vers.Position).mul(depart.Rotation) });
				aller.Completed.Connect(() => TweenService.Create(a.corps, new TweenInfo(0.2), { CFrame: depart }).Play());
				aller.Play();
			}
		} else if (e.type === "degats" && e.cible !== undefined) {
			const b = pions.get(e.cible);
			if (b) eclair(b.corps, Color3.fromRGB(255, 70, 60));
		} else if (e.type === "soin" && e.cible !== undefined) {
			const b = pions.get(e.cible);
			if (b) eclair(b.corps, Color3.fromRGB(120, 255, 140));
		}
	}
	evenementsVus = n;
	const camera = Workspace.CurrentCamera!;
	camera.CameraType = Enum.CameraType.Scriptable;
	camera.CFrame = CFrame.lookAt(ORIGINE.add(new Vector3(0, 16, 34)), ORIGINE.add(new Vector3(0, 2, 0)));
}

/** Retire l'arène (fin du combat). */
export function cacherArene() {
	if (dossier) {
		dossier.Destroy();
		dossier = undefined;
	}
	combatAffiche = "";
	pions.clear();
}
