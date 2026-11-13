/**
 * Lysmont et ses environs en 3D, générés par le code à partir des lieux du contenu (content/monde/aubeclaire.yaml).
 * Style simple « blocs » : chaque lieu a sa silhouette (temple, château, guilde…), une porte et une invite « Entrer ».
 * Les positions viennent de la carte du jeu (pixels 1920 × 1080) : 1 pixel = ECHELLE studs autour du centre.
 */
import { Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import type { LieuDef } from "shared/moteur";

const ECHELLE = 0.6;
const CENTRE = { x: 960, y: 570 }; // la place de Lysmont

const C = {
	herbe: Color3.fromRGB(96, 140, 70),
	chemin: Color3.fromRGB(176, 150, 106),
	pierre: Color3.fromRGB(150, 146, 140),
	pierreSombre: Color3.fromRGB(70, 66, 72),
	blanc: Color3.fromRGB(235, 230, 218),
	bois: Color3.fromRGB(120, 84, 52),
	toitRouge: Color3.fromRGB(150, 60, 48),
	toitBleu: Color3.fromRGB(58, 84, 150),
	toitSombre: Color3.fromRGB(60, 50, 46),
	or: Color3.fromRGB(217, 164, 65),
	sable: Color3.fromRGB(214, 190, 140),
	feuillage: Color3.fromRGB(62, 110, 54),
	eau: Color3.fromRGB(80, 140, 200),
};

let dossier: Folder;

function bloc(
	taille: Vector3,
	position: Vector3,
	couleur: Color3,
	options: { matiere?: Enum.Material; forme?: "bloc" | "coin" | "cylindre" | "boule"; rotation?: CFrame; parent?: Instance; nom?: string } = {},
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
	p.Material = options.matiere ?? Enum.Material.SmoothPlastic;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	if (options.nom !== undefined) p.Name = options.nom;
	p.Parent = options.parent ?? dossier;
	return p;
}

/** Toit à deux pans au-dessus d'un bâtiment (largeur x, profondeur z). */
function toit(centre: Vector3, largeur: number, profondeur: number, hauteur: number, couleur: Color3, parent: Instance) {
	const demi = largeur / 2;
	// un coin (WedgePart) est haut du côté +Z local : on tourne chaque pan pour que le côté haut soit au faîte
	bloc(new Vector3(profondeur, hauteur, demi), centre.add(new Vector3(-demi / 2, hauteur / 2, 0)), couleur, {
		forme: "coin",
		rotation: CFrame.Angles(0, math.rad(90), 0),
		parent,
	});
	bloc(new Vector3(profondeur, hauteur, demi), centre.add(new Vector3(demi / 2, hauteur / 2, 0)), couleur, {
		forme: "coin",
		rotation: CFrame.Angles(0, math.rad(-90), 0),
		parent,
	});
}

function maison(base: Vector3, l: number, p: number, h: number, mur: Color3, couleurToit: Color3, parent: Instance) {
	bloc(new Vector3(l, h, p), base.add(new Vector3(0, h / 2, 0)), mur, { matiere: Enum.Material.Brick, parent });
	toit(base.add(new Vector3(0, h, 0)), l + 2, p + 2, l * 0.35, couleurToit, parent);
}

function arbre(base: Vector3, parent: Instance, taille = 1) {
	bloc(new Vector3(1.6 * taille, 8 * taille, 1.6 * taille), base.add(new Vector3(0, 4 * taille, 0)), C.bois, { matiere: Enum.Material.Wood, parent });
	bloc(new Vector3(9, 9, 9).mul(taille), base.add(new Vector3(0, 10 * taille, 0)), C.feuillage, { forme: "boule", matiere: Enum.Material.Grass, parent });
}

function tour(base: Vector3, rayon: number, hauteur: number, couleur: Color3, parent: Instance) {
	bloc(new Vector3(hauteur, rayon * 2, rayon * 2), base.add(new Vector3(0, hauteur / 2, 0)), couleur, {
		forme: "cylindre",
		rotation: CFrame.Angles(0, 0, math.rad(90)),
		matiere: Enum.Material.Cobblestone,
		parent,
	});
	bloc(new Vector3(rayon * 2.2, rayon * 1.6, rayon * 2.2), base.add(new Vector3(0, hauteur + rayon * 0.8, 0)), C.toitBleu, { forme: "boule", parent });
}

/** Construit la silhouette d'un lieu ; renvoie la position de sa porte (là où apparaît « Entrer »). */
function construire(l: LieuDef, centre: Vector3, parent: Model): Vector3 {
	switch (l.id) {
		case "lysmont-place": {
			bloc(new Vector3(1, 40, 40), centre.add(new Vector3(0, 0.1, 0)), C.pierre, { forme: "cylindre", rotation: CFrame.Angles(0, 0, math.rad(90)), matiere: Enum.Material.Cobblestone, parent });
			bloc(new Vector3(2, 10, 10), centre.add(new Vector3(0, 1, 0)), C.pierre, { forme: "cylindre", rotation: CFrame.Angles(0, 0, math.rad(90)), parent });
			bloc(new Vector3(0.5, 8, 8), centre.add(new Vector3(0, 2, 0)), C.eau, { forme: "cylindre", rotation: CFrame.Angles(0, 0, math.rad(90)), matiere: Enum.Material.Glass, parent });
			bloc(new Vector3(1.5, 6, 1.5), centre.add(new Vector3(0, 4, 0)), C.pierre, { parent });
			return centre.add(new Vector3(0, 0, 8));
		}
		case "temple-du-seuil": {
			bloc(new Vector3(30, 2, 22), centre.add(new Vector3(0, 1, 0)), C.blanc, { matiere: Enum.Material.Marble, parent });
			bloc(new Vector3(24, 14, 16), centre.add(new Vector3(0, 9, -1)), C.blanc, { matiere: Enum.Material.Marble, parent });
			for (const x of [-10, -5, 5, 10]) bloc(new Vector3(1.6, 14, 1.6), centre.add(new Vector3(x, 9, 8.5)), C.blanc, { forme: "cylindre", rotation: CFrame.Angles(0, 0, math.rad(90)), matiere: Enum.Material.Marble, parent });
			toit(centre.add(new Vector3(0, 16, 0)), 28, 20, 7, C.or, parent);
			bloc(new Vector3(2, 10, 2), centre.add(new Vector3(0, 28, 0)), C.or, { matiere: Enum.Material.Metal, parent });
			return centre.add(new Vector3(0, 0, 12));
		}
		case "chateau": {
			bloc(new Vector3(40, 22, 28), centre.add(new Vector3(0, 11, -4)), C.pierre, { matiere: Enum.Material.Cobblestone, parent });
			for (const [x, z] of [[-20, -18], [20, -18], [-20, 10], [20, 10]] as const) tour(centre.add(new Vector3(x, 0, z)), 4, 30, C.pierre, parent);
			bloc(new Vector3(8, 10, 1), centre.add(new Vector3(0, 5, 10.2)), C.bois, { matiere: Enum.Material.Wood, parent });
			return centre.add(new Vector3(0, 0, 14));
		}
		case "guilde": {
			maison(centre, 22, 16, 12, C.bois, C.toitBleu, parent);
			bloc(new Vector3(8, 4, 0.5), centre.add(new Vector3(0, 13, 8.3)), C.or, { parent, nom: "Enseigne" });
			return centre.add(new Vector3(0, 0, 10));
		}
		case "taverne": {
			maison(centre, 18, 14, 10, C.bois, C.toitRouge, parent);
			bloc(new Vector3(3, 3, 3), centre.add(new Vector3(7, 1.5, 9)), C.bois, { forme: "cylindre", matiere: Enum.Material.Wood, parent });
			return centre.add(new Vector3(0, 0, 9));
		}
		case "quartier-tanneurs": {
			maison(centre.add(new Vector3(-8, 0, 0)), 10, 10, 7, C.bois, C.toitSombre, parent);
			maison(centre.add(new Vector3(6, 0, -4)), 9, 9, 6, C.bois, C.toitSombre, parent);
			maison(centre.add(new Vector3(4, 0, 10)), 8, 8, 6, C.bois, C.toitSombre, parent);
			return centre.add(new Vector3(-2, 0, 6));
		}
		case "arene": {
			bloc(new Vector3(0.6, 34, 34), centre.add(new Vector3(0, 0.3, 0)), C.sable, { forme: "cylindre", rotation: CFrame.Angles(0, 0, math.rad(90)), matiere: Enum.Material.Sand, parent });
			for (let i = 0; i < 16; i++) {
				if (i === 4) continue; // l'entrée
				const a = (i / 16) * 2 * math.pi;
				const pos = centre.add(new Vector3(math.cos(a) * 18, 4, math.sin(a) * 18));
				bloc(new Vector3(7, 8, 2), pos, C.pierre, { rotation: CFrame.Angles(0, -a + math.pi / 2, 0), matiere: Enum.Material.Cobblestone, parent });
			}
			return centre.add(new Vector3(0, 0, 18));
		}
		case "combe-aux-saules": {
			maison(centre, 12, 10, 7, C.bois, C.toitRouge, parent);
			for (const [x, z] of [[-18, -10], [-22, 8], [16, -14], [20, 12], [-6, -20], [8, 20]] as const) arbre(centre.add(new Vector3(x, 0, z)), parent, 1.2);
			for (let i = -3; i <= 3; i++) bloc(new Vector3(4, 2.5, 0.5), centre.add(new Vector3(i * 4, 1.25, 14)), C.bois, { matiere: Enum.Material.Wood, parent });
			return centre.add(new Vector3(0, 0, 8));
		}
		case "crypte-fontaine": {
			bloc(new Vector3(20, 10, 16), centre.add(new Vector3(0, 5, 0)), C.pierreSombre, { matiere: Enum.Material.Slate, parent });
			toit(centre.add(new Vector3(0, 10, 0)), 22, 18, 6, C.pierreSombre, parent);
			bloc(new Vector3(6, 7, 1), centre.add(new Vector3(0, 3.5, 8.2)), Color3.fromRGB(20, 18, 22), { parent });
			for (const x of [-12, 12]) arbre(centre.add(new Vector3(x, 0, 10)), parent, 0.8);
			return centre.add(new Vector3(0, 0, 11));
		}
	}
	// lieu ajouté plus tard dans le contenu : une maison générique
	maison(centre, 14, 12, 8, C.bois, C.toitRouge, parent);
	return centre.add(new Vector3(0, 0, 8));
}

function chemin(de: Vector3, a: Vector3) {
	const milieu = de.add(a).div(2);
	const longueur = a.sub(de).Magnitude;
	if (longueur < 1) return;
	bloc(new Vector3(6, 0.2, longueur), milieu.add(new Vector3(0, 0.1, 0)), C.chemin, { rotation: CFrame.lookAt(milieu, a).sub(milieu), matiere: Enum.Material.Ground });
}

export function positionLieu(l: LieuDef): Vector3 {
	return new Vector3((l.position.x - CENTRE.x) * ECHELLE, 0, (l.position.y - CENTRE.y) * ECHELLE);
}

/** Construit le monde (une seule fois, au démarrage du serveur). */
export function construireMonde() {
	Workspace.FindFirstChild("Baseplate")?.Destroy();
	for (const e of Workspace.GetChildren()) if (e.IsA("SpawnLocation")) e.Destroy();
	dossier = new Instance("Folder");
	dossier.Name = "Velmaris";
	dossier.Parent = Workspace;

	bloc(new Vector3(1200, 2, 1000), new Vector3(0, -1, 0), C.herbe, { matiere: Enum.Material.Grass, nom: "Sol" });
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
		const modele = new Instance("Model");
		modele.Name = l.id;
		modele.Parent = dossier;
		const centre = positionLieu(l);
		const porte = construire(l, centre, modele);
		if (l.id !== "lysmont-place") chemin(centrePlace, porte);

		// point d'entrée : invite « Entrer » (les marqueurs ⚔ et quête sont ajoutés par chaque joueur)
		const ancre = bloc(new Vector3(4, 6, 4), porte.add(new Vector3(0, 3, 0)), C.or, { parent: modele, nom: "Entree" });
		ancre.Transparency = 1;
		ancre.CanCollide = false;
		ancre.SetAttribute("Lieu", l.id);
		const invite = new Instance("ProximityPrompt");
		invite.ActionText = "Entrer";
		invite.ObjectText = l.nom;
		invite.HoldDuration = 0;
		invite.MaxActivationDistance = 14;
		invite.RequiresLineOfSight = false;
		invite.SetAttribute("Lieu", l.id);
		invite.Parent = ancre;
	}
}
