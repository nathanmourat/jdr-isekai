/**
 * Maisons habitées : certaines maisons des quartiers et des hameaux ont une porte « Entrer ».
 * Comme pour les lieux du contenu, on entre par téléportation dans une salle meublée (sous la carte),
 * selon le métier de la maison (famille, boulanger, forgeron, tisserand, ferme), avec un ou deux habitants
 * qu'on peut saluer (action « habitant » : une phrase s'affiche au-dessus de lui, côté joueur).
 * La porte porte l'étiquette « EntreeLieu » et l'attribut « Lieu » = maison-N : entrer et sortir marchent
 * comme pour les autres bâtiments (client/rendu/marqueurs.ts).
 */
import { CollectionService } from "@rbxts/services";
import { bloc, C, tonneau, VERTICAL } from "./decor";
import { cheminee, comptoir, etagere, invite, salle, tableBancs, tapis, TENUES } from "./interieurs";
import { humanoide, type Costume } from "./modeles";

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);
const HAUTEUR = -380;

export type Metier = "famille" | "boulanger" | "forgeron" | "tisserand" | "ferme";

const NOMS: Record<Metier, string[]> = {
	famille: ["Maison des Aubertin", "Maison des Vasseur", "Maison de la veuve Grenier", "Maison des Lacombe", "Maison des Fontenelle", "Maison des Corbin"],
	boulanger: ["Boulangerie Dorée", "Au Pain Chaud", "Fournil des Remparts"],
	forgeron: ["Forge du Marteau Gris", "Atelier Bréval", "Forge de la Porte Sud"],
	tisserand: ["Atelier de tissage Morel", "Draperie aux Trois Fils", "Atelier des Laines"],
	ferme: ["Ferme des Blés", "Ferme du Vieux Moulin", "Ferme Delorme", "Ferme des Saules", "Ferme du Coteau"],
};

const PHRASES: Record<Metier, string[]> = {
	famille: [
		"Bienvenue chez nous ! Essuyez vos bottes, s'il vous plaît.",
		"Mon fils dit qu'il veut devenir aventurier, comme vous. J'en dors mal.",
		"On raconte que des Appelés sont arrivés au Temple. C'est vous ?",
		"La soupe est sur le feu. Il y en a assez pour un héros affamé.",
	],
	boulanger: [
		"Le pain sort du four ! Le premier est pour les héros.",
		"Levée à quatre heures, comme tous les matins depuis trente ans.",
		"Goûtez-moi cette brioche aux pommes. Spécialité de Lysmont !",
	],
	forgeron: [
		"Une lame bien aiguisée vaut mieux qu'un long discours.",
		"Je ferre les chevaux du château. Même ceux du roi ont mauvais caractère.",
		"Si votre épée a une entaille, ne la laissez pas comme ça. Elle vous trahira.",
	],
	tisserand: [
		"Cette laine vient des moutons de la Combe-aux-Saules. La plus douce du royaume.",
		"Une cape pour l'hiver ? Le vent du nord ne pardonne pas.",
		"Le bleu de ce tissu, c'est de la guède. Trois semaines de teinture !",
	],
	ferme: [
		"La moisson sera bonne cette année, si les loups nous laissent tranquilles.",
		"Le moulin tourne depuis l'aube. Le vent est avec nous.",
		"Vous venez de la ville ? Ici, on se lève avec les poules. Littéralement.",
		"Attention au taureau du voisin. Il n'aime personne.",
	],
};

const COULEURS: Record<Metier, { sol: Color3; mur: Color3; matSol: Enum.Material; matMur: Enum.Material }> = {
	famille: { sol: rgb(120, 86, 58), mur: rgb(214, 198, 168), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Plaster },
	boulanger: { sol: rgb(160, 150, 136), mur: rgb(226, 210, 180), matSol: Enum.Material.Cobblestone, matMur: Enum.Material.Plaster },
	forgeron: { sol: rgb(90, 86, 84), mur: rgb(120, 110, 100), matSol: Enum.Material.Slate, matMur: Enum.Material.Cobblestone },
	tisserand: { sol: rgb(130, 96, 66), mur: rgb(205, 190, 160), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Plaster },
	ferme: { sol: rgb(110, 84, 58), mur: rgb(170, 140, 100), matSol: Enum.Material.WoodPlanks, matMur: Enum.Material.Wood },
};

let compte = 0;
const nomsPris = new Set<string>();

function nomLibre(metier: Metier): string {
	for (const n of NOMS[metier]) {
		if (!nomsPris.has(n)) {
			nomsPris.add(n);
			return n;
		}
	}
	return `${NOMS[metier][0]} (${compte})`;
}

/** Lit : cadre, matelas, oreiller et couverture. */
function lit(m: Model, pos: Vector3, couverture: Color3) {
	bloc(new Vector3(5, 1.6, 8), pos.add(new Vector3(0, 0.8, 0)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
	bloc(new Vector3(4.6, 0.8, 7.6), pos.add(new Vector3(0, 2, 0)), rgb(235, 230, 215), { parent: m, matiere: Enum.Material.Fabric });
	bloc(new Vector3(4.7, 0.3, 5), pos.add(new Vector3(0, 2.45, 1.2)), couverture, { parent: m, matiere: Enum.Material.Fabric });
	bloc(new Vector3(3, 0.6, 1.4), pos.add(new Vector3(0, 2.6, -3)), rgb(245, 240, 230), { parent: m, matiere: Enum.Material.Fabric });
	bloc(new Vector3(5, 3, 0.6), pos.add(new Vector3(0, 2.6, -4)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
}

/** Habitant : on peut le saluer (une phrase au hasard parmi celles du métier). */
function habitant(m: Model, id: string, costume: Costume, pos: Vector3, regard: Vector3, metier: Metier, nom: string) {
	const [ok, res] = pcall(() => humanoide("Habitant", costume));
	if (!ok) return;
	const h = res as Model;
	h.PivotTo(CFrame.lookAt(pos.add(new Vector3(0, 3, 0)), new Vector3(regard.X, pos.Y + 3, regard.Z)));
	h.Parent = m;
	const i = invite(h.PrimaryPart!, id, "habitant", "Saluer", nom, 12);
	i.SetAttribute("Phrases", PHRASES[metier].join("|"));
}

function meubler(m: Model, id: string, base: Vector3, metier: Metier, nom: string) {
	const k = compte;
	const costume = (i: number): Costume => ({ ...TENUES[(k + i) % TENUES.size()] });
	tapis(m, base.add(new Vector3(0, 0, 2)), new Vector2(10, 7), [rgb(150, 50, 50), rgb(60, 80, 140), rgb(90, 110, 60)][k % 3]);
	switch (metier) {
		case "famille":
			cheminee(m, base.add(new Vector3(0, 0, -12)));
			tableBancs(m, base.add(new Vector3(-7, 0, 2)), 8);
			lit(m, base.add(new Vector3(12, 0, -7)), rgb(120, 40, 50));
			lit(m, base.add(new Vector3(12, 0, 5)), rgb(50, 80, 130));
			etagere(m, base.add(new Vector3(-15.6, 0, -6)), CFrame.Angles(0, math.rad(90), 0));
			tonneau(base.add(new Vector3(-13, 0, 9)), m);
			habitant(m, id, costume(0), base.add(new Vector3(-4, 0, -4)), base.add(new Vector3(0, 0, 10)), metier, nom);
			habitant(m, id, costume(1), base.add(new Vector3(-9, 0, 6)), base.add(new Vector3(0, 0, 0)), metier, nom);
			break;
		case "boulanger": {
			comptoir(m, base.add(new Vector3(0, 0, -2)), 16);
			cheminee(m, base.add(new Vector3(-8, 0, -12)));
			etagere(m, base.add(new Vector3(8, 0, -12)));
			// pains sur le comptoir et paniers
			for (let i = 0; i < 8; i++) bloc(new Vector3(1.6, 0.9, 1), base.add(new Vector3(-6 + i * 1.7, 4.8, -2)), rgb(190, 130, 60), { parent: m, forme: "boule", matiere: Enum.Material.Fabric });
			for (let i = 0; i < 3; i++) bloc(new Vector3(2.2, 2.2, 2.2), base.add(new Vector3(12, 1.1, -4 + i * 3)), rgb(235, 228, 205), { parent: m, matiere: Enum.Material.Fabric });
			habitant(m, id, { ...costume(0), tablier: rgb(240, 236, 225) }, base.add(new Vector3(0, 0, -6)), base.add(new Vector3(0, 0, 10)), metier, nom);
			break;
		}
		case "forgeron": {
			cheminee(m, base.add(new Vector3(-6, 0, -12)));
			// enclume, bac d'eau, râtelier
			bloc(new Vector3(2, 2.4, 2), base.add(new Vector3(2, 1.2, -4)), C.bois, { parent: m, matiere: Enum.Material.Wood });
			bloc(new Vector3(3.6, 1.2, 1.6), base.add(new Vector3(2, 3, -4)), C.pierreSombre, { parent: m, matiere: Enum.Material.Metal });
			bloc(new Vector3(5, 2, 3), base.add(new Vector3(-12, 1, -2)), C.boisClair, { parent: m, matiere: Enum.Material.WoodPlanks });
			bloc(new Vector3(4.4, 0.3, 2.4), base.add(new Vector3(-12, 2, -2)), C.eau, { parent: m, matiere: Enum.Material.Glass });
			bloc(new Vector3(10, 7, 1), base.add(new Vector3(10, 3.5, -12.4)), C.bois, { parent: m, matiere: Enum.Material.WoodPlanks });
			for (let i = 0; i < 5; i++) bloc(new Vector3(0.4, 5, 0.3), base.add(new Vector3(6.5 + i * 1.8, 4, -11.8)), C.pierreClaire, { parent: m, matiere: Enum.Material.Metal });
			habitant(m, id, { ...costume(0), tablier: rgb(90, 60, 40) }, base.add(new Vector3(4, 0, -7)), base.add(new Vector3(0, 0, 10)), metier, nom);
			break;
		}
		case "tisserand": {
			// métier à tisser : cadre et fils colorés
			for (const x of [-4, 4]) bloc(new Vector3(0.6, 6, 0.6), base.add(new Vector3(x, 3, -6)), C.bois, { parent: m, matiere: Enum.Material.Wood });
			bloc(new Vector3(8.6, 0.6, 0.6), base.add(new Vector3(0, 6, -6)), C.bois, { parent: m, matiere: Enum.Material.Wood });
			bloc(new Vector3(7.6, 4, 0.1), base.add(new Vector3(0, 3.6, -6)), rgb(60, 90, 150), { parent: m, matiere: Enum.Material.Fabric });
			const couleurs = [rgb(150, 40, 40), rgb(60, 90, 150), rgb(200, 170, 60), rgb(70, 120, 60), rgb(130, 70, 140)];
			for (let i = 0; i < 5; i++) bloc(new Vector3(3.6, 1.6, 1.6), base.add(new Vector3(-12, 0.8 + i * 1.7, 4)), couleurs[i], { parent: m, forme: "cylindre", matiere: Enum.Material.Fabric });
			etagere(m, base.add(new Vector3(8, 0, -12)));
			tableBancs(m, base.add(new Vector3(6, 0, 5)), 6);
			habitant(m, id, costume(2), base.add(new Vector3(0, 0, -2)), base.add(new Vector3(0, 0, -6)), metier, nom);
			break;
		}
		case "ferme": {
			cheminee(m, base.add(new Vector3(0, 0, -12)));
			tableBancs(m, base.add(new Vector3(-6, 0, 2)), 8);
			lit(m, base.add(new Vector3(12, 0, -6)), rgb(110, 90, 50));
			for (let i = 0; i < 4; i++) bloc(new Vector3(2, 2.6, 2), base.add(new Vector3(12, 1.3, 6 - (i % 2) * 2.4)).add(new Vector3(-(math.floor(i / 2)) * 2.4, 0, 0)), rgb(225, 215, 190), { parent: m, matiere: Enum.Material.Fabric });
			// fourche et râteau contre le mur
			for (const x of [-14, -12.5]) bloc(new Vector3(0.3, 6, 0.3), base.add(new Vector3(x, 3, -11.5)), C.boisClair, { parent: m, matiere: Enum.Material.Wood, rotation: CFrame.Angles(math.rad(-10), 0, 0) });
			tonneau(base.add(new Vector3(-13, 0, 9)), m);
			habitant(m, id, { ...costume(3), chapeau: rgb(200, 170, 100) }, base.add(new Vector3(-2, 0, -4)), base.add(new Vector3(0, 0, 10)), metier, nom);
			break;
		}
	}
	void VERTICAL;
}

/**
 * Rend une maison habitée : `porte` = l'endroit, dehors, devant la porte de la maison ; `parent` = son modèle ;
 * `dehors` = direction de la rue vue depuis la porte.
 * Crée la salle intérieure et l'invite « Entrer ». Renvoie l'identifiant (maison-N).
 */
export function maisonHabitee(porte: Vector3, metier: Metier, parent: Instance, dehors = new Vector3(0, 0, 1)): string {
	compte++;
	const id = `maison-${compte}`;
	const nom = nomLibre(metier);
	// la salle intérieure, dans une grille à l'écart des lieux du contenu
	const base = new Vector3(-1200 + ((compte - 1) % 20) * 110, HAUTEUR, -1400 - math.floor((compte - 1) / 20) * 110);
	const [ok, err] = pcall(() => {
		const m = salle(id, base, 34, 26, 13, COULEURS[metier]);
		m.SetAttribute("Nom", nom);
		meubler(m, id, base, metier, nom);
	});
	if (!ok) warn(`[Velmaris] Intérieur de ${id} : ${tostring(err)}`);
	// la porte, dehors
	const ancre = bloc(new Vector3(4, 6, 4), porte.add(new Vector3(0, 3, 0)), C.or, { parent, nom: "Entree" });
	ancre.Transparency = 1;
	ancre.CanCollide = false;
	// l'ancre regarde vers la rue : en sortant, on réapparaît de ce côté (client/rendu/marqueurs.ts)
	const pos = ancre.Position;
	ancre.CFrame = CFrame.lookAt(pos, pos.add(new Vector3(dehors.X, 0, dehors.Z)));
	ancre.SetAttribute("Oriente", true);
	ancre.SetAttribute("Lieu", id);
	ancre.SetAttribute("Nom", nom);
	CollectionService.AddTag(ancre, "EntreeLieu");
	const i = new Instance("ProximityPrompt");
	i.ActionText = "Entrer";
	i.ObjectText = nom;
	i.HoldDuration = 0;
	i.MaxActivationDistance = 12;
	i.RequiresLineOfSight = false;
	i.SetAttribute("Lieu", id);
	i.SetAttribute("Action", "entrer");
	i.Parent = ancre;
	return id;
}
