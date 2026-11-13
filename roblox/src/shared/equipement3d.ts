/**
 * Équipement en 3D : chaque objet du catalogue (364) a un modèle construit par le code, selon sa catégorie,
 * son palier (métal de plus en plus précieux) et sa rareté (liserés, lueur, étincelles pour les légendaires
 * et les mythiques). Les mêmes modèles servent :
 *  - sur les personnages (monde, combats) : `equiperPersonnage` ;
 *  - dans les fenêtres (aperçu 3D qui tourne, boutique, inventaire, butin) : `modeleObjet`.
 * Le groupe peut remplacer un objet par son propre modèle : ReplicatedStorage > ObjetsDuGroupe > <id de l'objet>
 * (un Model dont la PrimaryPart s'appelle « Poignee », tenue en main, lame vers -Z).
 */
import { ReplicatedStorage } from "@rbxts/services";
import type { Contenu, ObjetDef } from "shared/moteur";
import { arme, piece, souder } from "shared/construction";

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

/** Couleurs des raretés (identiques au web) */
export const COULEUR_RARETE: Record<string, Color3> = {
	commun: rgb(184, 184, 184),
	"peu-commun": rgb(95, 201, 95),
	rare: rgb(74, 155, 255),
	epique: rgb(178, 107, 255),
	legendaire: rgb(242, 181, 58),
	mythique: rgb(255, 74, 74),
};
const RANG_RARETE: Record<string, number> = { commun: 0, "peu-commun": 1, rare: 2, epique: 3, legendaire: 4, mythique: 5 };
const RANG_PALIER: Record<string, number> = { I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, X: 6 };

/** Métal selon le palier : fer, acier, argent bleuté, acier noir, or pâle, obsidienne, cristal. */
const METAUX: [Color3, Enum.Material][] = [
	[rgb(135, 135, 140), Enum.Material.Metal],
	[rgb(185, 190, 200), Enum.Material.Metal],
	[rgb(205, 215, 232), Enum.Material.DiamondPlate],
	[rgb(80, 86, 102), Enum.Material.Metal],
	[rgb(232, 200, 120), Enum.Material.Metal],
	[rgb(48, 38, 58), Enum.Material.Basalt],
	[rgb(225, 235, 255), Enum.Material.Glass],
];
const ELEMENTS: Record<string, Color3> = {
	feu: rgb(255, 120, 40),
	glace: rgb(140, 220, 255),
	foudre: rgb(255, 240, 90),
	sacre: rgb(255, 230, 150),
	ombre: rgb(140, 70, 200),
	poison: rgb(110, 220, 80),
	arcane: rgb(110, 140, 255),
	physique: rgb(220, 220, 220),
};
const BOIS = rgb(110, 76, 46);
const CUIR = rgb(98, 66, 44);

/** Petit nombre stable tiré de l'id (variantes de forme d'un objet à l'autre). */
function graine(id: string): number {
	let h = 7;
	for (let i = 1; i <= id.size(); i++) h = (h * 31 + string.byte(id, i)[0]) % 1000003;
	return h;
}

export interface Style {
	metal: Color3;
	matiere: Enum.Material;
	accent: Color3;
	rang: number;
	palier: number;
	element?: Color3;
	variante: number;
}

export function styleObjet(o: ObjetDef): Style {
	const palier = RANG_PALIER[o.palier ?? "I"] ?? 0;
	const [metal, matiere] = METAUX[palier];
	let element: Color3 | undefined;
	for (const e of o.effets_equipement ?? []) if (e.effet === "touche" && e.element !== undefined) element = ELEMENTS[e.element];
	return { metal, matiere, accent: COULEUR_RARETE[o.rarete ?? "commun"], rang: RANG_RARETE[o.rarete ?? "commun"] ?? 0, palier, element, variante: graine(o.id) };
}

// ───────────────────────────── Construction ─────────────────────────────

type Ajout = (nom: string, taille: Vector3, cf: CFrame, couleur: Color3, opt?: Parameters<typeof piece>[5]) => Part;

/** Modèle vide avec sa poignée (racine invisible) ; `ajout` soude chaque pièce à la poignée. */
function base(nom: string): [Model, Part, Ajout] {
	const m = new Instance("Model");
	m.Name = nom;
	const poignee = piece(m, "Poignee", new Vector3(0.2, 0.2, 0.2), new CFrame(), new Color3(), { transparence: 1 });
	m.PrimaryPart = poignee;
	const ajout: Ajout = (n, taille, cf, couleur, opt = {}) => {
		const p = piece(m, n, taille, cf, couleur, opt);
		p.CastShadow = taille.Magnitude > 1.2;
		p.CanQuery = false;
		p.CanTouch = false;
		p.Massless = true;
		souder(poignee, p);
		return p;
	};
	return [m, poignee, ajout];
}

/** Lueur, lumière et étincelles selon la rareté (épique et plus). */
function eclat(p: BasePart, st: Style) {
	if (st.rang >= 3) {
		const l = new Instance("PointLight");
		l.Color = st.element ?? st.accent;
		l.Range = 4 + st.rang;
		l.Brightness = 0.6 + 0.25 * st.rang;
		l.Shadows = false;
		l.Parent = p;
	}
	if (st.rang >= 4) {
		// texture par défaut de Roblox (étincelles) : aucun identifiant d'image à fournir
		const e = new Instance("ParticleEmitter");
		e.Color = new ColorSequence(st.accent, st.element ?? Color3.fromRGB(255, 255, 255));
		e.LightEmission = 0.8;
		e.Size = new NumberSequence([new NumberSequenceKeypoint(0, 0.18), new NumberSequenceKeypoint(1, 0)]);
		e.Transparency = new NumberSequence(0.2, 1);
		e.Lifetime = new NumberRange(0.6, 1.2);
		e.Rate = st.rang >= 5 ? 14 : 7;
		e.Speed = new NumberRange(0.3, 0.8);
		e.SpreadAngle = new Vector2(180, 180);
		e.LockedToPart = false;
		e.Parent = p;
	}
}

/** Liseré de rareté (néon fin) à partir de « rare ». */
function lisere(ajout: Ajout, st: Style, nom: string, taille: Vector3, cf: CFrame) {
	if (st.rang < 2) return undefined;
	return ajout(nom, taille, cf, st.element ?? st.accent, { neon: true });
}

const lameLong = (st: Style, b: number) => b + 0.18 * st.palier;

function epee(ajout: Ajout, st: Style, longue: boolean) {
	const L = lameLong(st, longue ? 3.8 : 2.8);
	const l = longue ? 0.45 : 0.32;
	ajout("Manche", new Vector3(0.22, 0.22, longue ? 1.4 : 0.9), new CFrame(0, 0, 0), CUIR, { matiere: Enum.Material.Fabric });
	ajout("Pommeau", new Vector3(0.36, 0.36, 0.36), new CFrame(0, 0, longue ? 0.8 : 0.55), st.metal, { matiere: st.matiere, forme: Enum.PartType.Ball });
	const garde = st.variante % 3;
	ajout("Garde", new Vector3(garde === 0 ? 1.2 : garde === 1 ? 1.5 : 0.9, 0.2, 0.26), new CFrame(0, 0, -0.55), st.metal, { matiere: st.matiere });
	if (garde === 1) {
		ajout("GardeG", new Vector3(0.26, 0.26, 0.26), new CFrame(-0.75, 0, -0.55), st.accent, { forme: Enum.PartType.Ball, matiere: Enum.Material.Metal });
		ajout("GardeD", new Vector3(0.26, 0.26, 0.26), new CFrame(0.75, 0, -0.55), st.accent, { forme: Enum.PartType.Ball, matiere: Enum.Material.Metal });
	}
	const lame = ajout("Lame", new Vector3(l, 0.1, L), new CFrame(0, 0, -0.65 - L / 2), st.metal, { matiere: st.matiere === Enum.Material.Glass ? Enum.Material.Glass : Enum.Material.Metal });
	if (st.matiere === Enum.Material.Glass) lame.Transparency = 0.25;
	// pointe : petite pièce tournée de 45°
	ajout("Pointe", new Vector3(l * 0.72, 0.1, l * 0.72), new CFrame(0, 0, -0.65 - L).mul(CFrame.Angles(0, math.rad(45), 0)), st.metal, { matiere: Enum.Material.Metal });
	const g = lisere(ajout, st, "Gorge", new Vector3(l * 0.25, 0.12, L * 0.75), new CFrame(0, 0, -0.75 - L * 0.4));
	if (st.palier >= 1) ajout("Gemme", new Vector3(0.22, 0.22, 0.22), new CFrame(0, 0.1, -0.55), st.accent, { neon: st.rang >= 2, forme: Enum.PartType.Ball });
	eclat(g ?? lame, st);
}

function hache(ajout: Ajout, st: Style) {
	const L = 4 + 0.15 * st.palier;
	ajout("Manche", new Vector3(0.28, 0.28, L), new CFrame(0, 0, -L / 2 + 0.8), BOIS, { matiere: Enum.Material.Wood });
	const fer = ajout("Fer", new Vector3(0.18, 1.5 + 0.1 * st.palier, 1.2), new CFrame(0, 0.55, -L + 1.1), st.metal, { matiere: st.matiere });
	if (st.variante % 2 === 0) ajout("Fer2", new Vector3(0.18, 1.2, 0.9), new CFrame(0, -0.45, -L + 1.1), st.metal, { matiere: st.matiere });
	ajout("Bague", new Vector3(0.36, 0.36, 0.3), new CFrame(0, 0, -L + 1.1), st.accent, { matiere: Enum.Material.Metal });
	lisere(ajout, st, "Tranchant", new Vector3(0.2, 0.12, 1.2), new CFrame(0, 1.3 + 0.05 * st.palier, -L + 1.1));
	eclat(fer, st);
}

function masse(ajout: Ajout, st: Style) {
	const L = 2.4 + 0.1 * st.palier;
	ajout("Manche", new Vector3(0.24, 0.24, L), new CFrame(0, 0, -L / 2 + 0.6), st.palier >= 2 ? st.metal : BOIS, { matiere: st.palier >= 2 ? Enum.Material.Metal : Enum.Material.Wood });
	const tete = ajout("Tete", new Vector3(0.9, 0.9, 0.9).mul(1 + 0.06 * st.palier), new CFrame(0, 0, -L + 0.45), st.metal, { matiere: st.matiere, forme: st.variante % 2 === 0 ? Enum.PartType.Ball : Enum.PartType.Block });
	// ailettes / pointes à partir du palier II
	if (st.palier >= 1) {
		for (let i = 0; i < 4; i++) {
			ajout(`Ailette${i}`, new Vector3(0.12, 0.5, 0.7), new CFrame(0, 0, -L + 0.45).mul(CFrame.Angles(0, 0, (i * math.pi) / 2)).mul(new CFrame(0, 0.55, 0)), st.metal, { matiere: Enum.Material.Metal });
		}
	}
	lisere(ajout, st, "Anneau", new Vector3(1.05, 0.12, 0.12), new CFrame(0, 0, -L + 0.45));
	eclat(tete, st);
}

function dague(ajout: Ajout, st: Style) {
	const L = 1.3 + 0.08 * st.palier;
	ajout("Manche", new Vector3(0.18, 0.18, 0.6), new CFrame(0, 0, 0), CUIR, { matiere: Enum.Material.Fabric });
	ajout("Garde", new Vector3(0.6, 0.12, 0.16), new CFrame(0, 0, -0.35), st.metal, { matiere: Enum.Material.Metal });
	const lame = ajout("Lame", new Vector3(0.22, 0.08, L), new CFrame(0, 0, -0.4 - L / 2), st.metal, { matiere: st.matiere === Enum.Material.Glass ? Enum.Material.Glass : Enum.Material.Metal });
	ajout("Pointe", new Vector3(0.16, 0.08, 0.16), new CFrame(0, 0, -0.4 - L).mul(CFrame.Angles(0, math.rad(45), 0)), st.metal, { matiere: Enum.Material.Metal });
	const g = lisere(ajout, st, "Fil", new Vector3(0.06, 0.1, L * 0.8), new CFrame(0, 0, -0.45 - L * 0.4));
	eclat(g ?? lame, st);
}

/** Arc tenu dans la main gauche : 4 segments en arc de cercle et une corde. */
function arc(ajout: Ajout, st: Style) {
	const bois = st.palier >= 3 ? st.metal : BOIS;
	const mat = st.palier >= 3 ? Enum.Material.Metal : Enum.Material.Wood;
	const H = 4 + 0.12 * st.palier;
	ajout("Poigne", new Vector3(0.26, 0.6, 0.3), new CFrame(0, 0, 0), CUIR, { matiere: Enum.Material.Fabric });
	const segs: [number, number][] = [
		[0.75, 12],
		[1.55, 28],
	];
	let haut: Part | undefined;
	for (const [y, angle] of segs) {
		const k = y / 2;
		haut = ajout(`Branche+${y}`, new Vector3(0.18, H / 4, 0.24), new CFrame(0, (y * H) / 4, -k * 0.35).mul(CFrame.Angles(math.rad(angle), 0, 0)), bois, { matiere: mat });
		ajout(`Branche-${y}`, new Vector3(0.18, H / 4, 0.24), new CFrame(0, (-y * H) / 4, -k * 0.35).mul(CFrame.Angles(math.rad(-angle), 0, 0)), bois, { matiere: mat });
	}
	ajout("Corde", new Vector3(0.04, H * 0.92, 0.04), new CFrame(0, 0, 0.35), rgb(235, 230, 215));
	lisere(ajout, st, "Inlay", new Vector3(0.2, H * 0.3, 0.05), new CFrame(0, 0, -0.18));
	if (haut) eclat(haut, st);
}

function arbalete(ajout: Ajout, st: Style) {
	const fut = ajout("Fut", new Vector3(0.3, 0.3, 2.2), new CFrame(0, 0.1, -0.8), BOIS, { matiere: Enum.Material.Wood });
	ajout("Arc", new Vector3(2 + 0.1 * st.palier, 0.16, 0.26), new CFrame(0, 0.15, -1.75), st.metal, { matiere: st.matiere });
	ajout("Corde", new Vector3(1.9, 0.04, 0.04), new CFrame(0, 0.2, -1.4), rgb(235, 230, 215));
	ajout("Carreau", new Vector3(0.08, 0.08, 1.2), new CFrame(0, 0.3, -1.3), st.element ?? rgb(170, 140, 100), { neon: st.element !== undefined });
	// alchimiste : une fiole sur le côté (lance-fioles)
	if (st.variante % 2 === 0) ajout("Fiole", new Vector3(0.4, 0.4, 0.4), new CFrame(0.3, 0.2, -0.4), st.element ?? rgb(90, 220, 130), { forme: Enum.PartType.Ball, matiere: Enum.Material.Glass, transparence: 0.2 });
	lisere(ajout, st, "Lisere", new Vector3(0.32, 0.05, 1.8), new CFrame(0, 0.27, -0.8));
	eclat(fut, st);
}

function baton(ajout: Ajout, st: Style) {
	const L = 5 + 0.15 * st.palier;
	ajout("Hampe", new Vector3(0.24, 0.24, L), new CFrame(0, 0, -L / 2 + 1.4), st.palier >= 4 ? st.metal : BOIS, { matiere: st.palier >= 4 ? Enum.Material.Metal : Enum.Material.Wood });
	const z = -L + 1.4;
	const couleur = st.element ?? st.accent;
	// tête : griffes de métal qui tiennent une pierre
	for (let i = 0; i < 3; i++) {
		ajout(`Griffe${i}`, new Vector3(0.12, 0.12, 0.9), new CFrame(0, 0, z - 0.1).mul(CFrame.Angles(0, 0, (i * 2 * math.pi) / 3)).mul(new CFrame(0, 0.3, -0.2)).mul(CFrame.Angles(math.rad(-20), 0, 0)), st.metal, { matiere: Enum.Material.Metal });
	}
	const pierre = ajout("Pierre", new Vector3(0.7, 0.7, 0.7).mul(1 + 0.05 * st.palier), new CFrame(0, 0, z - 0.45), couleur, { neon: st.rang >= 1, forme: Enum.PartType.Ball, matiere: Enum.Material.Glass });
	ajout("Bague", new Vector3(0.34, 0.34, 0.2), new CFrame(0, 0, z + 0.3), st.metal, { matiere: Enum.Material.Metal });
	eclat(pierre, st);
}

function sceptre(ajout: Ajout, st: Style) {
	const L = 2.6 + 0.1 * st.palier;
	ajout("Manche", new Vector3(0.2, 0.2, L), new CFrame(0, 0, -L / 2 + 0.6), st.metal, { matiere: Enum.Material.Metal });
	const z = -L + 0.6;
	ajout("Couronne", new Vector3(0.8, 0.14, 0.8), new CFrame(0, 0, z), st.metal, { matiere: st.matiere, forme: Enum.PartType.Cylinder });
	for (let i = 0; i < 4; i++) ajout(`Fleuron${i}`, new Vector3(0.12, 0.12, 0.5), new CFrame(0, 0, z - 0.2).mul(CFrame.Angles(0, 0, (i * math.pi) / 2)).mul(new CFrame(0, 0.35, 0)), st.metal, { matiere: Enum.Material.Metal });
	const cur = ajout("Coeur", new Vector3(0.5, 0.5, 0.5), new CFrame(0, 0, z - 0.4), st.element ?? rgb(255, 235, 170), { neon: true, forme: Enum.PartType.Ball });
	eclat(cur, st);
}

function orbe(ajout: Ajout, st: Style) {
	const couleur = st.element ?? st.accent;
	const coeur = ajout("Coeur", new Vector3(0.6, 0.6, 0.6), new CFrame(0, 0.9, -0.2), couleur, { neon: true, forme: Enum.PartType.Ball });
	ajout("Coque", new Vector3(1, 1, 1).mul(1 + 0.05 * st.palier), new CFrame(0, 0.9, -0.2), rgb(220, 235, 255), { forme: Enum.PartType.Ball, matiere: Enum.Material.Glass, transparence: 0.6 });
	ajout("Anneau", new Vector3(0.1, 1.4, 1.4), new CFrame(0, 0.9, -0.2).mul(CFrame.Angles(math.rad(30), 0, math.rad(20))), st.metal, { matiere: Enum.Material.Metal, forme: Enum.PartType.Cylinder, transparence: 0 });
	eclat(coeur, st);
}

function instrument(ajout: Ajout, st: Style, flute: boolean) {
	if (flute) {
		const corps = ajout("Flute", new Vector3(0.16, 0.16, 1.8), new CFrame(0, 0, -0.5), st.palier >= 3 ? st.metal : rgb(170, 140, 90), { matiere: st.palier >= 3 ? Enum.Material.Metal : Enum.Material.Wood });
		for (let i = 0; i < 4; i++) ajout(`Trou${i}`, new Vector3(0.06, 0.18, 0.06), new CFrame(0, 0.03, -0.2 - i * 0.3), rgb(40, 30, 25));
		lisere(ajout, st, "Bague", new Vector3(0.2, 0.2, 0.1), new CFrame(0, 0, -1.35));
		eclat(corps, st);
		return;
	}
	const caisse = ajout("Caisse", new Vector3(0.45, 1.5, 1.1), new CFrame(0, -0.2, -0.5), rgb(165, 105, 55), { matiere: Enum.Material.Wood, forme: Enum.PartType.Ball });
	ajout("Rosace", new Vector3(0.05, 0.35, 0.35), new CFrame(0.22, -0.1, -0.5), rgb(40, 25, 15), { forme: Enum.PartType.Ball });
	ajout("Manche", new Vector3(0.18, 1.4, 0.2), new CFrame(0, 1.15, -0.5), BOIS, { matiere: Enum.Material.Wood });
	ajout("Tete", new Vector3(0.2, 0.4, 0.3), new CFrame(0, 1.95, -0.45).mul(CFrame.Angles(math.rad(-25), 0, 0)), st.metal, { matiere: Enum.Material.Metal });
	ajout("Cordes", new Vector3(0.03, 2, 0.12), new CFrame(0.24, 0.6, -0.5), rgb(235, 230, 215));
	lisere(ajout, st, "Filet", new Vector3(0.47, 1.52, 0.04), new CFrame(0, -0.2, -0.02));
	eclat(caisse, st);
}

function bouclier(ajout: Ajout, st: Style) {
	const rond = st.variante % 2 === 0;
	const t = 1 + 0.05 * st.palier;
	const corps = rond
		? ajout("Bouclier", new Vector3(0.22, 2.4 * t, 2.4 * t), new CFrame(0, 0, 0), st.palier <= 0 ? BOIS : st.metal, { matiere: st.palier <= 0 ? Enum.Material.WoodPlanks : st.matiere, forme: Enum.PartType.Cylinder })
		: ajout("Bouclier", new Vector3(0.22, 2.8 * t, 2 * t), new CFrame(0, 0, 0), st.palier <= 0 ? BOIS : st.metal, { matiere: st.palier <= 0 ? Enum.Material.WoodPlanks : st.matiere });
	ajout("Umbo", new Vector3(0.5, 0.5, 0.5), new CFrame(-0.15, 0, 0), st.metal, { forme: Enum.PartType.Ball, matiere: Enum.Material.Metal });
	ajout("Blason", new Vector3(0.05, 1.2 * t, 0.5 * t), new CFrame(-0.12, 0, 0), st.accent, { matiere: Enum.Material.Fabric });
	lisere(ajout, st, "Bord", new Vector3(0.24, rond ? 0.15 : 2.8 * t, rond ? 2.5 * t : 0.12), new CFrame(0, rond ? 1.2 * t : 0, rond ? 0 : -t));
	eclat(corps, st);
}

function bijou(ajout: Ajout, st: Style, sorte: string) {
	const couleur = st.element ?? st.accent;
	if (sorte === "anneau") {
		ajout("Anneau", new Vector3(0.08, 0.5, 0.5), new CFrame(), st.palier >= 4 ? rgb(232, 200, 120) : st.metal, { forme: Enum.PartType.Cylinder, matiere: Enum.Material.Metal });
		const g = ajout("Gemme", new Vector3(0.22, 0.22, 0.22), new CFrame(0, 0.28, 0), couleur, { neon: st.rang >= 2, forme: Enum.PartType.Ball, matiere: Enum.Material.Glass });
		eclat(g, st);
	} else if (sorte === "amulette") {
		ajout("Chaine", new Vector3(0.05, 1.2, 0.05), new CFrame(0, 0.6, 0), st.metal, { matiere: Enum.Material.Metal });
		ajout("Cadre", new Vector3(0.1, 0.55, 0.55), new CFrame(), st.metal, { forme: Enum.PartType.Cylinder, matiere: Enum.Material.Metal });
		const g = ajout("Pierre", new Vector3(0.12, 0.38, 0.38), new CFrame(0.02, 0, 0), couleur, { neon: st.rang >= 2, forme: Enum.PartType.Cylinder });
		eclat(g, st);
	} else {
		// talisman : un os ou une pierre gravée au bout d'un lacet
		ajout("Lacet", new Vector3(0.04, 0.8, 0.04), new CFrame(0, 0.45, 0), CUIR);
		const g = ajout("Charme", new Vector3(0.25, 0.6, 0.15), new CFrame(), st.variante % 2 === 0 ? rgb(225, 215, 190) : st.metal, { matiere: Enum.Material.Marble });
		lisere(ajout, st, "Rune", new Vector3(0.27, 0.3, 0.05), new CFrame(0, 0, -0.06));
		eclat(g, st);
	}
}

function carquois(ajout: Ajout, st: Style) {
	const c = ajout("Etui", new Vector3(0.7, 2.2, 0.7), new CFrame(), CUIR, { matiere: Enum.Material.Leather, forme: Enum.PartType.Cylinder });
	c.CFrame = c.CFrame.mul(CFrame.Angles(0, 0, math.rad(90)));
	for (let i = 0; i < 4; i++) {
		ajout(`Fleche${i}`, new Vector3(0.06, 0.8, 0.06), new CFrame(-0.15 + 0.1 * i, 1.4, (i % 2) * 0.12 - 0.06), rgb(170, 140, 100));
		ajout(`Plume${i}`, new Vector3(0.04, 0.3, 0.16), new CFrame(-0.15 + 0.1 * i, 1.8, (i % 2) * 0.12 - 0.06), st.rang >= 2 ? st.accent : rgb(230, 230, 230));
	}
	lisere(ajout, st, "Bande", new Vector3(0.72, 0.12, 0.72), new CFrame(0, 0.6, 0));
	eclat(c, st);
}

function sacoche(ajout: Ajout, st: Style) {
	const s = ajout("Sac", new Vector3(0.9, 0.8, 0.45), new CFrame(), CUIR, { matiere: Enum.Material.Leather });
	ajout("Rabat", new Vector3(0.92, 0.4, 0.47), new CFrame(0, 0.25, 0), rgb(80, 54, 36), { matiere: Enum.Material.Leather });
	ajout("Boucle", new Vector3(0.18, 0.18, 0.05), new CFrame(0, 0.1, -0.25), st.metal, { matiere: Enum.Material.Metal });
	ajout("Fiole", new Vector3(0.22, 0.4, 0.22), new CFrame(0.55, 0.1, 0), st.element ?? rgb(90, 220, 130), { matiere: Enum.Material.Glass, transparence: 0.15 });
	eclat(s, st);
}

/** Une tenue vue seule (aperçu) : un buste avec plastron, épaulières et ceinture. */
function tenueSeule(ajout: Ajout, st: Style, sorte: string) {
	const [corps, mat] = couleurTenue(st, sorte);
	const b = ajout("Buste", new Vector3(2, 2, 1.05), new CFrame(0, 0, 0), corps, { matiere: mat });
	ajout("Ceinture", new Vector3(2.05, 0.3, 1.1), new CFrame(0, -0.85, 0), CUIR, { matiere: Enum.Material.Leather });
	if (sorte !== "legere") {
		ajout("EpauleG", new Vector3(0.9, 0.5, 1.15), new CFrame(-1.3, 0.85, 0), corps, { matiere: mat });
		ajout("EpauleD", new Vector3(0.9, 0.5, 1.15), new CFrame(1.3, 0.85, 0), corps, { matiere: mat });
	} else ajout("Col", new Vector3(1.4, 0.35, 1.1), new CFrame(0, 1, 0), st.accent, { matiere: Enum.Material.Fabric });
	lisere(ajout, st, "Liseré", new Vector3(0.18, 1.7, 1.08), new CFrame(0, 0, 0));
	eclat(b, st);
}

function couleurTenue(st: Style, sorte: string): [Color3, Enum.Material] {
	if (sorte === "lourde") return [st.metal, st.matiere === Enum.Material.Glass ? Enum.Material.Glass : Enum.Material.Metal];
	if (sorte === "intermediaire") return [st.palier >= 3 ? rgb(60, 45, 40) : CUIR, Enum.Material.Leather];
	// légère : tissu teinté selon la rareté (assombri)
	const a = st.accent;
	return [new Color3(a.R * 0.45 + 0.08, a.G * 0.45 + 0.08, a.B * 0.45 + 0.1), Enum.Material.Fabric];
}

/** Modèle 3D seul d'un objet (aperçus) : poignée à l'origine, lame vers -Z. */
export function modeleObjet(o: ObjetDef): Model {
	const perso = ReplicatedStorage.FindFirstChild("ObjetsDuGroupe")?.FindFirstChild(o.id);
	if (perso && perso.IsA("Model")) return perso.Clone();
	const st = styleObjet(o);
	const [m, , ajout] = base(o.id);
	const cat = o.categorie ?? (o.emplacement === "armure" ? "intermediaire" : o.emplacement === "accessoire" ? "anneau" : "epee");
	const nomMin = o.nom.lower();
	switch (cat) {
		case "epee":
			epee(ajout, st, false);
			break;
		case "deux-mains":
			if (nomMin.find("hache")[0] !== undefined || nomMin.find("fendeuse")[0] !== undefined || st.variante % 3 === 0) hache(ajout, st);
			else epee(ajout, st, true);
			break;
		case "masse":
			masse(ajout, st);
			break;
		case "dague":
			dague(ajout, st);
			break;
		case "arc":
			arc(ajout, st);
			break;
		case "arbalete":
			arbalete(ajout, st);
			break;
		case "baton":
			baton(ajout, st);
			break;
		case "sceptre":
			sceptre(ajout, st);
			break;
		case "orbe":
			orbe(ajout, st);
			break;
		case "instrument":
			instrument(ajout, st, nomMin.find("fl")[0] !== undefined && nomMin.find("luth")[0] === undefined);
			break;
		case "bouclier":
			bouclier(ajout, st);
			break;
		case "anneau":
		case "amulette":
		case "talisman":
			bijou(ajout, st, cat);
			break;
		case "carquois":
			carquois(ajout, st);
			break;
		case "sacoche":
			sacoche(ajout, st);
			break;
		default:
			tenueSeule(ajout, st, cat);
	}
	m.SetAttribute("Categorie", cat);
	return m;
}

// ───────────────────────────── Sur un personnage ─────────────────────────────

const MAIN_GAUCHE = new Set(["arc", "instrument", "bouclier"]);

function partie(perso: Model, nom: string): BasePart | undefined {
	const p = perso.FindFirstChild(nom);
	return p && p.IsA("BasePart") ? p : undefined;
}

/** Fixe un modèle d'objet (poignée) sur une partie du corps, avec un décalage. */
function fixer(perso: Model, dossier: Folder, m: Model, sur: BasePart, decalage: CFrame) {
	m.PivotTo(sur.CFrame.mul(decalage));
	for (const p of m.GetDescendants()) if (p.IsA("BasePart")) p.Anchored = false;
	souder(sur, m.PrimaryPart!);
	m.Parent = dossier;
}

/** Armure portée : pièces ajustées à la taille du corps (R15, tous gabarits). */
function porterTenue(perso: Model, dossier: Folder, o: ObjetDef) {
	const st = styleObjet(o);
	const sorte = o.categorie ?? "intermediaire";
	const [couleur, mat] = couleurTenue(st, sorte);
	const tenue = new Instance("Model");
	tenue.Name = "Tenue";
	tenue.Parent = dossier;
	const sur = (nom: string, f: (p: BasePart) => void) => {
		const p = partie(perso, nom);
		if (p) f(p);
	};
	const coller = (support: BasePart, nom: string, taille: Vector3, decalage: CFrame, c: Color3, opt: Parameters<typeof piece>[5] = {}) => {
		const x = piece(tenue, nom, taille, support.CFrame.mul(decalage), c, opt);
		x.Massless = true;
		x.CanQuery = false;
		x.CanTouch = false;
		x.CastShadow = false;
		souder(support, x);
		return x;
	};
	sur("UpperTorso", (t) => {
		const s = t.Size;
		const plastron = coller(t, "Plastron", new Vector3(s.X * 1.06, s.Y * 0.92, s.Z * 1.18), new CFrame(0, s.Y * 0.03, 0), couleur, { matiere: mat });
		if (sorte === "lourde") coller(t, "Gorgerin", new Vector3(s.X * 0.6, s.Y * 0.2, s.Z * 1.2), new CFrame(0, s.Y * 0.48, 0), st.metal, { matiere: Enum.Material.Metal });
		if (sorte === "legere") {
			coller(t, "Col", new Vector3(s.X * 0.75, s.Y * 0.18, s.Z * 1.25), new CFrame(0, s.Y * 0.47, 0), st.accent, { matiere: Enum.Material.Fabric });
			// cape dans le dos
			coller(t, "Cape", new Vector3(s.X * 1.05, s.Y * 2.2, 0.12), new CFrame(0, -s.Y * 0.55, s.Z * 0.62), couleur, { matiere: Enum.Material.Fabric });
		}
		if (st.rang >= 2) coller(t, "Liseré", new Vector3(s.X * 0.14, s.Y * 0.85, s.Z * 1.2), new CFrame(0, 0, 0), st.element ?? st.accent, { neon: true });
		eclat(plastron, st);
	});
	sur("LowerTorso", (t) => {
		const s = t.Size;
		coller(t, "Ceinture", new Vector3(s.X * 1.08, s.Y * 0.45, s.Z * 1.2), new CFrame(0, s.Y * 0.1, 0), CUIR, { matiere: Enum.Material.Leather });
		coller(t, "Boucle", new Vector3(s.X * 0.2, s.Y * 0.3, 0.08), new CFrame(0, s.Y * 0.1, -s.Z * 0.62), st.metal, { matiere: Enum.Material.Metal });
		if (sorte === "legere") coller(t, "Robe", new Vector3(s.X * 1.15, s.Y * 2.6, s.Z * 1.25), new CFrame(0, -s.Y * 1.2, 0), couleur, { matiere: Enum.Material.Fabric });
		if (sorte === "lourde") coller(t, "Tassette", new Vector3(s.X * 1.1, s.Y * 1.1, s.Z * 1.22), new CFrame(0, -s.Y * 0.55, 0), st.metal, { matiere: mat });
	});
	if (sorte !== "legere") {
		for (const cote of ["Left", "Right"]) {
			sur(`${cote}UpperArm`, (b) => {
				const s = b.Size;
				const x = cote === "Left" ? -s.X * 0.1 : s.X * 0.1;
				coller(b, "Epaulière", new Vector3(s.X * 1.5, s.Y * 0.42, s.Z * 1.45), new CFrame(x, s.Y * 0.35, 0), couleur, { matiere: mat });
				if (st.rang >= 3) coller(b, "Pointe", new Vector3(s.X * 0.3, s.Y * 0.3, s.Z * 0.3), new CFrame(x, s.Y * 0.62, 0), st.accent, { neon: true });
			});
		}
		if (sorte === "lourde") {
			for (const cote of ["Left", "Right"]) {
				sur(`${cote}LowerArm`, (b) => {
					const s = b.Size;
					coller(b, "Brassard", new Vector3(s.X * 1.25, s.Y * 0.7, s.Z * 1.25), new CFrame(0, -s.Y * 0.05, 0), st.metal, { matiere: mat });
				});
				sur(`${cote}LowerLeg`, (b) => {
					const s = b.Size;
					coller(b, "Jambière", new Vector3(s.X * 1.2, s.Y * 0.8, s.Z * 1.25), new CFrame(0, 0, 0), st.metal, { matiere: mat });
				});
			}
		}
	}
}

/** Accessoire porté : bouclier au bras, anneau au doigt, amulette au cou, talisman et sacoche à la ceinture, carquois dans le dos. */
function porterAccessoire(perso: Model, dossier: Folder, o: ObjetDef) {
	const cat = o.categorie ?? "anneau";
	const m = modeleObjet(o);
	const t = partie(perso, "UpperTorso");
	const bas = partie(perso, "LowerTorso");
	if (cat === "bouclier") {
		const bras = partie(perso, "LeftLowerArm") ?? partie(perso, "LeftHand");
		if (bras) return fixer(perso, dossier, m, bras, new CFrame(-bras.Size.X * 0.7, 0, 0));
	} else if (cat === "anneau") {
		const main = partie(perso, "RightHand");
		if (main) {
			m.ScaleTo(0.6);
			return fixer(perso, dossier, m, main, new CFrame(0, -main.Size.Y * 0.2, 0).mul(CFrame.Angles(0, 0, math.rad(90))));
		}
	} else if (cat === "amulette" && t) {
		m.ScaleTo(0.7);
		return fixer(perso, dossier, m, t, new CFrame(0, t.Size.Y * 0.05, -t.Size.Z * 0.62).mul(CFrame.Angles(0, math.rad(90), 0)));
	} else if (cat === "carquois" && t) {
		return fixer(perso, dossier, m, t, new CFrame(t.Size.X * 0.2, 0, t.Size.Z * 0.8).mul(CFrame.Angles(0, 0, math.rad(-20))));
	} else if ((cat === "talisman" || cat === "sacoche") && bas) {
		if (cat === "talisman") m.ScaleTo(0.8);
		return fixer(perso, dossier, m, bas, new CFrame(bas.Size.X * 0.6, -bas.Size.Y * 0.2, 0));
	}
	m.Destroy();
}

/** Arme dans la main : droite (lames, bâtons, orbes) ou gauche (arc, instrument). */
function porterArme(perso: Model, dossier: Folder, o: ObjetDef) {
	const cat = o.categorie ?? "epee";
	const gauche = MAIN_GAUCHE.has(cat);
	const main = partie(perso, gauche ? "LeftHand" : "RightHand");
	if (!main) return;
	const m = modeleObjet(o);
	const decalage = cat === "orbe" ? new CFrame(0, -main.Size.Y * 0.5, 0) : cat === "arc" ? new CFrame(0, 0, -0.2) : new CFrame(0, -main.Size.Y * 0.3, -0.1);
	fixer(perso, dossier, m, main, decalage);
}

export interface EquipementPorte {
	arme?: string;
	armure?: string;
	accessoire?: string;
}

/**
 * Habille un personnage R15 avec son équipement (remplace l'équipement précédent).
 * Sans arme équipée, il garde l'arme de sa classe (si la classe est connue).
 */
export function equiperPersonnage(perso: Model, contenu: Contenu, equipement: EquipementPorte | undefined, classe?: string) {
	perso.FindFirstChild("Equipement")?.Destroy();
	perso.FindFirstChild("Arme")?.Destroy();
	const dossier = new Instance("Folder");
	dossier.Name = "Equipement";
	dossier.Parent = perso;
	const lire = (id: string | undefined) => (id !== undefined ? contenu.objets[id] : undefined);
	const a = lire(equipement?.arme);
	const t = lire(equipement?.armure);
	const x = lire(equipement?.accessoire);
	if (a) pcall(() => porterArme(perso, dossier, a));
	else if (classe !== undefined) arme(perso, classe);
	if (t) pcall(() => porterTenue(perso, dossier, t));
	if (x) pcall(() => porterAccessoire(perso, dossier, x));
	perso.SetAttribute("EquipementPorte", `${equipement?.arme ?? ""}|${equipement?.armure ?? ""}|${equipement?.accessoire ?? ""}`);
}

/** Clé de l'équipement porté (pour ne pas reconstruire si rien n'a changé). */
export function cleEquipement(e: EquipementPorte | undefined): string {
	return `${e?.arme ?? ""}|${e?.armure ?? ""}|${e?.accessoire ?? ""}`;
}
