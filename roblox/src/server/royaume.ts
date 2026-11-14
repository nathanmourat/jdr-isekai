/**
 * Grandes constructions : un vrai royaume plutôt qu'un village.
 * - agrandir() : met un bâtiment déjà construit à l'échelle (Model:ScaleTo), autour de son centre au sol ;
 * - grandeTour() : tour ronde haute, toit conique pointu, meurtrières et créneaux ;
 * - enceinte() : remparts de ville (ellipse de murailles crénelées, chemin de ronde, tours, portes fortifiées) ;
 * - forteresse() : le château royal (courtines, tours d'angle, châtelet d'entrée, cour, logis, donjon et grande tour).
 * Les mesures sont en studs : un personnage Roblox mesure environ 5 studs.
 */
import { bloc, C, lumiere, nuit, VERTICAL } from "./decor";

const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

/** Contour elliptique d'une ville (remparts). */
export interface Contour {
	centre: Vector3;
	rx: number;
	rz: number;
}

/** Vrai si le point est à l'intérieur du contour (avec une marge en studs vers l'intérieur). */
export function dansContour(e: Contour, p: Vector3, marge = 0): boolean {
	const dx = (p.X - e.centre.X) / (e.rx - marge);
	const dz = (p.Z - e.centre.Z) / (e.rz - marge);
	return dx * dx + dz * dz < 1;
}

/** Angle (paramètre de l'ellipse) où la route de `de` vers `a` traverse le contour, ou undefined si elle ne le traverse pas. */
export function croisement(e: Contour, de: Vector3, a: Vector3): number | undefined {
	if (dansContour(e, a) === dansContour(e, de)) return undefined;
	const ux = (de.X - e.centre.X) / e.rx;
	const uz = (de.Z - e.centre.Z) / e.rz;
	const vx = (a.X - de.X) / e.rx;
	const vz = (a.Z - de.Z) / e.rz;
	const A = vx * vx + vz * vz;
	const B = 2 * (ux * vx + uz * vz);
	const Cq = ux * ux + uz * uz - 1;
	const disc = B * B - 4 * A * Cq;
	if (disc < 0 || A === 0) return undefined;
	// la route part de l'intérieur : la plus grande racine ; de l'extérieur : la plus petite
	const t = dansContour(e, de) ? (-B + math.sqrt(disc)) / (2 * A) : (-B - math.sqrt(disc)) / (2 * A);
	return math.atan2(uz + vz * t, ux + vx * t);
}

/** Ajoute une ouverture si aucune autre n'est déjà à moins de 0,25 radian. */
export function ajouterOuverture(ouvertures: number[], angle: number | undefined) {
	if (angle === undefined) return;
	if (ouvertures.some((o) => math.abs(((angle - o + math.pi * 3) % (math.pi * 2)) - math.pi) < 0.25)) return;
	ouvertures.push(angle);
}

/** Agrandit un modèle autour d'un point au sol (les bâtiments restent posés par terre). */
export function agrandir(m: Model, centre: Vector3, k: number) {
	if (k === 1 || m.GetChildren().size() === 0) return;
	m.WorldPivot = new CFrame(centre);
	m.ScaleTo(k);
}

/** Position d'un point (porte…) après agrandissement autour du centre. */
export function pointAgrandi(p: Vector3, centre: Vector3, k: number): Vector3 {
	return centre.add(p.sub(centre).mul(k));
}

export interface Pierres {
	mur: Color3;
	matiere: Enum.Material;
	toit: Color3;
	fanion: Color3;
}

export const PIERRES_ROYALES: Pierres = { mur: C.pierreClaire, matiere: Enum.Material.Cobblestone, toit: C.toitBleu, fanion: rgb(150, 30, 40) };

/** Tour ronde : fût, cordons, meurtrières, couronne crénelée sur mâchicoulis, toit conique pointu et fanion. */
export function grandeTour(base: Vector3, rayon: number, hauteur: number, parent: Instance, pierres = PIERRES_ROYALES, avecToit = true) {
	const sombre = pierres.mur.Lerp(new Color3(0, 0, 0), 0.25);
	bloc(new Vector3(hauteur, rayon * 2, rayon * 2), base.add(new Vector3(0, hauteur / 2, 0)), pierres.mur, { forme: "cylindre", rotation: VERTICAL, matiere: pierres.matiere, parent });
	// empattement à la base et cordons de pierre
	bloc(new Vector3(4, rayon * 2.25, rayon * 2.25), base.add(new Vector3(0, 2, 0)), sombre, { forme: "cylindre", rotation: VERTICAL, matiere: pierres.matiere, parent });
	for (const y of [hauteur * 0.35, hauteur * 0.7]) bloc(new Vector3(1, rayon * 2.08, rayon * 2.08), base.add(new Vector3(0, y, 0)), sombre, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Limestone, parent });
	// meurtrières et fenêtres éclairées la nuit
	const nb = math.max(4, math.floor(rayon));
	for (const [y, eclaire] of [[hauteur * 0.25, false], [hauteur * 0.5, true], [hauteur * 0.78, true]] as const) {
		for (let i = 0; i < nb; i++) {
			const a = ((i + (eclaire ? 0.5 : 0)) / nb) * 2 * math.pi;
			const f = bloc(new Vector3(0.6, eclaire ? 4 : 3, 0.8), base.add(new Vector3(math.cos(a) * rayon, y, math.sin(a) * rayon)), eclaire ? C.vitre : rgb(25, 22, 28), { rotation: CFrame.Angles(0, -a, 0), neon: eclaire, parent });
			if (eclaire) nuit(f);
		}
	}
	// mâchicoulis et créneaux
	const rc = rayon * 1.18;
	bloc(new Vector3(3, rc * 2, rc * 2), base.add(new Vector3(0, hauteur + 1.5, 0)), pierres.mur, { forme: "cylindre", rotation: VERTICAL, matiere: pierres.matiere, parent });
	const merlons = math.max(8, math.floor(rc * 1.4));
	for (let i = 0; i < merlons; i++) {
		const a = (i / merlons) * 2 * math.pi;
		bloc(new Vector3(2.2, 3, 1.6), base.add(new Vector3(math.cos(a) * (rc - 0.6), hauteur + 4.5, math.sin(a) * (rc - 0.6))), pierres.mur, { rotation: CFrame.Angles(0, -a + math.pi / 2, 0), matiere: pierres.matiere, parent });
	}
	if (!avecToit) return;
	// toit conique pointu : anneaux de plus en plus étroits
	const hToit = rayon * 2.6;
	const n = 10;
	for (let i = 0; i < n; i++) {
		const r = rc * (1 - i / n) + 0.4;
		bloc(new Vector3(hToit / n + 0.1, r * 2, r * 2), base.add(new Vector3(0, hauteur + 3 + (i + 0.5) * (hToit / n), 0)), pierres.toit, { forme: "cylindre", rotation: VERTICAL, matiere: Enum.Material.Slate, parent });
	}
	const sommet = hauteur + 3 + hToit;
	bloc(new Vector3(0.5, 8, 0.5), base.add(new Vector3(0, sommet + 4, 0)), C.or, { matiere: Enum.Material.Metal, parent });
	bloc(new Vector3(0.15, 3.4, 6), base.add(new Vector3(0, sommet + 6.4, 3)), pierres.fanion, { matiere: Enum.Material.Fabric, parent });
}

/** Mur crénelé droit entre deux points (au sol), avec chemin de ronde. */
export function muraille(de: Vector3, a: Vector3, hauteur: number, epaisseur: number, parent: Instance, pierres = PIERRES_ROYALES) {
	const d = a.sub(de);
	const longueur = d.Magnitude;
	if (longueur < 1) return;
	const milieu = de.add(a).div(2);
	const repere = CFrame.lookAt(milieu, a);
	const pose = (taille: Vector3, ici: Vector3, couleur: Color3, matiere: Enum.Material) => {
		const p = bloc(taille, Vector3.zero, couleur, { matiere, parent });
		p.CFrame = repere.mul(new CFrame(ici));
		return p;
	};
	const sombre = pierres.mur.Lerp(new Color3(0, 0, 0), 0.22);
	pose(new Vector3(epaisseur, hauteur, longueur), new Vector3(0, hauteur / 2, 0), pierres.mur, pierres.matiere);
	pose(new Vector3(epaisseur + 2, 3, longueur), new Vector3(0, 1.5, 0), sombre, pierres.matiere);
	pose(new Vector3(epaisseur + 1, 1, longueur), new Vector3(0, hauteur * 0.62, 0), sombre, Enum.Material.Limestone);
	// créneaux des deux côtés du chemin de ronde
	const pas = 6;
	for (let z = -longueur / 2 + pas / 2; z < longueur / 2; z += pas) {
		for (const x of [-epaisseur / 2 + 0.6, epaisseur / 2 - 0.6]) pose(new Vector3(1.2, 3, 3), new Vector3(x, hauteur + 1.5, z), pierres.mur, pierres.matiere);
	}
}

/** Porte fortifiée (châtelet) : deux tours, une arche, une herse, des bannières et des flambeaux. Face vers `dehors`. */
export function chatelet(centre: Vector3, dehors: Vector3, largeur: number, hauteurMur: number, parent: Instance, pierres = PIERRES_ROYALES) {
	const repere = CFrame.lookAt(centre, centre.add(new Vector3(dehors.X, 0, dehors.Z)));
	const ici = (x: number, y: number, z: number) => repere.mul(new CFrame(x, y, z)).Position;
	const rTour = largeur * 0.38;
	for (const x of [-1, 1]) grandeTour(ici((x * (largeur / 2 + rTour * 0.7)), 0, 0), rTour, hauteurMur + 14, parent, pierres);
	// arche au-dessus du passage
	const arche = bloc(new Vector3(largeur + 2, hauteurMur * 0.45, 10), Vector3.zero, pierres.mur, { matiere: pierres.matiere, parent });
	arche.CFrame = repere.mul(new CFrame(0, hauteurMur * 0.775, 0));
	for (let i = 0; i < math.floor(largeur / 3); i++) {
		const m = bloc(new Vector3(1.4, 3, 1.4), Vector3.zero, pierres.mur, { matiere: pierres.matiere, parent });
		m.CFrame = repere.mul(new CFrame(-largeur / 2 + 1.5 + i * 3, hauteurMur + 1.5, -4));
	}
	// herse relevée (barreaux de fer)
	for (let i = 0; i <= math.floor(largeur / 2.5); i++) {
		const b = bloc(new Vector3(0.4, hauteurMur * 0.25, 0.4), Vector3.zero, C.pierreSombre, { matiere: Enum.Material.Metal, parent, collision: false });
		b.CFrame = repere.mul(new CFrame(-largeur / 2 + i * 2.5, hauteurMur * 0.55 + hauteurMur * 0.125, -5.4));
	}
	// bannières et flambeaux de part et d'autre
	for (const x of [-1, 1]) {
		const ban = bloc(new Vector3(4, 12, 0.2), Vector3.zero, pierres.fanion, { matiere: Enum.Material.Fabric, parent, collision: false });
		ban.CFrame = repere.mul(new CFrame(x * (largeur / 2 + 0.5), hauteurMur * 0.6, -5.3));
		const medaillon = bloc(new Vector3(1.6, 1.6, 0.25), Vector3.zero, C.or, { matiere: Enum.Material.Metal, parent, collision: false });
		medaillon.CFrame = repere.mul(new CFrame(x * (largeur / 2 + 0.5), hauteurMur * 0.66, -5.5));
		const f = bloc(new Vector3(1, 1.4, 1), ici(x * (largeur / 2 + 0.5), hauteurMur * 0.3, -6), rgb(255, 170, 80), { neon: true, parent });
		const feu = new Instance("Fire");
		feu.Size = 3;
		feu.Heat = 6;
		feu.Parent = f;
		lumiere(f, rgb(255, 170, 90), 26);
	}
}

/**
 * Remparts d'une ville : une ellipse de murailles crénelées, des tours régulières
 * et un châtelet à chaque ouverture (angles en radians, mesurés depuis le centre ; 0 = +X, π/2 = +Z).
 */
export function enceinte(centre: Vector3, rx: number, rz: number, ouvertures: number[], parent: Instance, pierres = PIERRES_ROYALES, hauteur = 26) {
	const n = math.max(16, math.floor(((rx + rz) * math.pi) / 34));
	const point = (a: number) => centre.add(new Vector3(math.cos(a) * rx, 0, math.sin(a) * rz));
	const largeurPorte = 18;
	// demi-largeur angulaire d'une ouverture (le châtelet et ses tours font environ ±21 studs)
	const demiAngle = (a: number) => 21 / math.sqrt((math.sin(a) * rx) ** 2 + (math.cos(a) * rz) ** 2);
	const tour2pi = math.pi * 2;
	// ouvertures ramenées dans [0, 2π[, avec leur intervalle
	const trous = ouvertures.map((o) => {
		const a = ((o % tour2pi) + tour2pi) % tour2pi;
		return { a, de: a - demiAngle(a), a2: a + demiAngle(a) };
	});
	/** Parties d'un intervalle [a1, a2] qui ne tombent dans aucune ouverture. */
	const horsOuvertures = (a1: number, a2: number): [number, number][] => {
		let morceaux: [number, number][] = [[a1, a2]];
		for (const t of trous) {
			for (const decalage of [-tour2pi, 0, tour2pi]) {
				const d = t.de + decalage;
				const f = t.a2 + decalage;
				const suite: [number, number][] = [];
				for (const [x, y] of morceaux) {
					if (f <= x || d >= y) suite.push([x, y]);
					else {
						if (d > x) suite.push([x, d]);
						if (f < y) suite.push([f, y]);
					}
				}
				morceaux = suite;
			}
		}
		return morceaux.filter(([x, y]) => y - x > 0.004);
	};
	const pres = (a: number, marge: number) =>
		trous.some((t) => math.abs(((a - t.a + math.pi * 3) % tour2pi) - math.pi) < demiAngle(t.a) * marge);
	for (let i = 0; i < n; i++) {
		const a1 = (i / n) * tour2pi;
		const a2 = ((i + 1) / n) * tour2pi;
		for (const [x, y] of horsOuvertures(a1, a2)) muraille(point(x), point(y), hauteur, 8, parent, pierres);
		if (i % 3 === 0 && !pres(a1, 1.6)) grandeTour(point(a1), 7, hauteur + 10, parent, pierres);
	}
	// un châtelet (porte fortifiée) par ouverture
	for (const t of trous) {
		const p = point(t.a);
		chatelet(p, p.sub(centre).Unit, largeurPorte, hauteur, parent, pierres);
	}
}

/** Logis rectangulaire à toit pointu, avec fenêtres éclairées (dans la forteresse). */
function logis(centre: Vector3, l: number, p: number, h: number, parent: Instance, pierres: Pierres) {
	bloc(new Vector3(l, h, p), centre.add(new Vector3(0, h / 2, 0)), pierres.mur, { matiere: pierres.matiere, parent });
	bloc(new Vector3(l + 1, 1.2, p + 1), centre.add(new Vector3(0, h * 0.55, 0)), pierres.mur.Lerp(new Color3(0, 0, 0), 0.2), { matiere: Enum.Material.Limestone, parent });
	for (const etage of [h * 0.32, h * 0.72]) {
		for (let x = -l / 2 + 5; x <= l / 2 - 5; x += 7) {
			const f = bloc(new Vector3(2.6, 5, 0.4), centre.add(new Vector3(x, etage, p / 2 + 0.1)), C.vitre, { neon: true, parent });
			nuit(f);
			bloc(new Vector3(3.6, 0.6, 0.8), centre.add(new Vector3(x, etage - 2.8, p / 2 + 0.3)), C.pierreClaire, { matiere: Enum.Material.Limestone, parent });
		}
	}
	// toit à deux pans en ardoise
	const hToit = p * 0.55;
	const demi = p / 2;
	bloc(new Vector3(l + 2, hToit, demi + 1), centre.add(new Vector3(0, h + hToit / 2, (demi + 1) / 2)), pierres.toit, { forme: "coin", rotation: CFrame.Angles(0, math.pi, 0), matiere: Enum.Material.Slate, parent });
	bloc(new Vector3(l + 2, hToit, demi + 1), centre.add(new Vector3(0, h + hToit / 2, -(demi + 1) / 2)), pierres.toit, { forme: "coin", matiere: Enum.Material.Slate, parent });
}

/**
 * Le château royal de Lysmont : courtines crénelées (180 × 150 studs), quatre tours d'angle, deux tours de flanc,
 * un châtelet d'entrée face à la ville (+Z), une cour pavée, le logis royal, et au fond le donjon
 * avec sa grande tour (plus de 130 studs de haut). Renvoie la position de la porte.
 */
export function forteresse(centre: Vector3, parent: Instance, pierres = PIERRES_ROYALES): Vector3 {
	const L = 180;
	const P = 150;
	const H = 36;
	const avant = centre.Z + 30; // façade de la courtine avant
	const c0 = new Vector3(centre.X, centre.Y, avant - P / 2);
	const coin = (x: number, z: number) => c0.add(new Vector3((x * L) / 2, 0, (z * P) / 2));
	// sol de la cour
	bloc(new Vector3(L - 6, 1, P - 6), c0.add(new Vector3(0, 0.5, 0)), C.pierre, { matiere: Enum.Material.Cobblestone, parent });
	// courtines (la courtine avant est coupée au milieu pour le châtelet)
	const largeurPorte = 22;
	muraille(coin(-1, -1), coin(1, -1), H, 10, parent, pierres);
	muraille(coin(-1, -1), coin(-1, 1), H, 10, parent, pierres);
	muraille(coin(1, -1), coin(1, 1), H, 10, parent, pierres);
	muraille(coin(-1, 1), coin(-1, 1).add(new Vector3(L / 2 - largeurPorte, 0, 0)), H, 10, parent, pierres);
	muraille(coin(1, 1), coin(1, 1).sub(new Vector3(L / 2 - largeurPorte, 0, 0)), H, 10, parent, pierres);
	// tours d'angle et de flanc
	for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) grandeTour(coin(x, z), 13, H + 22, parent, pierres);
	for (const x of [-1, 1]) grandeTour(c0.add(new Vector3((x * L) / 2, 0, 0)), 9, H + 12, parent, pierres);
	// châtelet d'entrée, face à la ville
	const porte = new Vector3(centre.X, centre.Y, avant);
	chatelet(porte, new Vector3(0, 0, 1), largeurPorte, H, parent, pierres);
	// logis royal (grande salle) et donjon au fond de la cour
	logis(c0.add(new Vector3(-30, 0, -20)), 70, 34, 30, parent, pierres);
	const donjon = c0.add(new Vector3(40, 0, -32));
	bloc(new Vector3(56, 70, 50), donjon.add(new Vector3(0, 35, 0)), pierres.mur, { matiere: pierres.matiere, parent });
	bloc(new Vector3(58, 3, 52), donjon.add(new Vector3(0, 46, 0)), pierres.mur.Lerp(new Color3(0, 0, 0), 0.2), { matiere: Enum.Material.Limestone, parent });
	for (let x = -24; x <= 24; x += 6) {
		for (const z of [-24.4, 24.4]) bloc(new Vector3(2.4, 3, 1.4), donjon.add(new Vector3(x, 71.5, z)), pierres.mur, { matiere: pierres.matiere, parent });
	}
	for (const etage of [22, 40, 58]) {
		for (const x of [-16, -6, 6, 16]) {
			const f = bloc(new Vector3(3, 6, 0.4), donjon.add(new Vector3(x, etage, 25.1)), C.vitre, { neon: true, parent });
			nuit(f);
		}
	}
	// échauguettes aux quatre coins du donjon
	for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) grandeTour(donjon.add(new Vector3(x * 27, 50, z * 24)), 5, 30, parent, pierres);
	// la grande tour du roi, au centre du donjon
	grandeTour(donjon.add(new Vector3(0, 70, 0)), 11, 50, parent, pierres);
	// étendard royal sur la façade du donjon
	const etendard = bloc(new Vector3(12, 26, 0.3), donjon.add(new Vector3(0, 46, 25.3)), pierres.fanion, { matiere: Enum.Material.Fabric, parent, collision: false });
	void etendard;
	bloc(new Vector3(5, 5, 0.4), donjon.add(new Vector3(0, 50, 25.5)), C.or, { matiere: Enum.Material.Metal, forme: "boule", parent, collision: false });
	return porte.add(new Vector3(0, 0, 10));
}
