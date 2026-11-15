/**
 * Météo, calculée par chaque joueur pour lui-même (rien ne passe par le serveur) :
 *  - la région où se trouve l'avatar (la plus proche des origines de shared/geo.ts) ;
 *  - la saison du calendrier du jeu (mois de la campagne : printemps, été, automne, hiver) ;
 *  - le jour de la campagne : la météo change chaque jour, et elle est la même pour tous les joueurs
 *    d'une même campagne (tirage à partir de la région et du jour).
 * Effets : pluie, neige, brouillard, tempête de sable, pluie de cendres. Rien à l'intérieur ni dans un donjon.
 * Le brouillard passe par Atmosphere.Haze (le cycle jour / nuit du serveur ne touche pas à ce réglage).
 */
import { Lighting, Players, RunService, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { ORIGINES } from "shared/geo";
import { versDate } from "shared/moteur";
import { jeu } from "../partie";
import { sonMeteo } from "../sons";

export type Temps = "beau" | "pluie" | "neige" | "brouillard" | "sable" | "cendres";

type Climat = Partial<Record<Temps, number>>;
const TOUTE_ANNEE = (c: Climat): Record<string, Climat> => ({ printemps: c, "été": c, automne: c, hiver: c });

/** Probabilités par région et par saison (la somme n'a pas besoin de faire 1). */
const CLIMATS: Record<string, Record<string, Climat>> = {
	aubeclaire: {
		printemps: { beau: 50, pluie: 35, brouillard: 15 },
		"été": { beau: 80, pluie: 20 },
		automne: { beau: 35, pluie: 40, brouillard: 25 },
		hiver: { beau: 35, neige: 45, brouillard: 20 },
	},
	"marche-des-sables": TOUTE_ANNEE({ beau: 75, sable: 25 }),
	sylvenoire: TOUTE_ANNEE({ beau: 35, brouillard: 40, pluie: 25 }),
	"monts-grisfer": {
		printemps: { beau: 60, neige: 20, brouillard: 20 },
		"été": { beau: 75, brouillard: 25 },
		automne: { beau: 40, neige: 60 },
		hiver: { beau: 25, neige: 75 },
	},
	"archipel-des-brumes": TOUTE_ANNEE({ beau: 25, pluie: 40, brouillard: 35 }),
	"mur-d-aube": TOUTE_ANNEE({ beau: 40, cendres: 30, brouillard: 30 }),
	"terres-cendrees": TOUTE_ANNEE({ cendres: 80, brouillard: 20 }),
};

/** Réglages visuels de chaque temps. */
const EFFETS: Record<Temps, { brume: number; particules?: { couleur: Color3; taille: number; vitesse: number; debit: number; etire: number; vent: number }; son?: "pluie" | "vent" }> = {
	beau: { brume: 0 },
	pluie: { brume: 1.5, particules: { couleur: Color3.fromRGB(170, 190, 220), taille: 0.12, vitesse: 70, debit: 600, etire: 6, vent: 4 }, son: "pluie" },
	neige: { brume: 2, particules: { couleur: Color3.fromRGB(245, 248, 255), taille: 0.35, vitesse: 8, debit: 260, etire: 0, vent: 3 }, son: "vent" },
	brouillard: { brume: 6 },
	sable: { brume: 4, particules: { couleur: Color3.fromRGB(215, 185, 130), taille: 0.2, vitesse: 30, debit: 400, etire: 2, vent: 45 }, son: "vent" },
	cendres: { brume: 3, particules: { couleur: Color3.fromRGB(110, 100, 95), taille: 0.3, vitesse: 6, debit: 180, etire: 0, vent: 5 }, son: "vent" },
};

export const NOMS_TEMPS: Record<Temps, string> = {
	beau: "☀ beau temps",
	pluie: "🌧 pluie",
	neige: "❄ neige",
	brouillard: "🌫 brouillard",
	sable: "🏜 tempête de sable",
	cendres: "🌋 pluie de cendres",
};

let actuel: Temps = "beau";
let emetteur: Part | undefined;
let particules: ParticleEmitter | undefined;

function regionDe(p: Vector3): string {
	let meilleure = "aubeclaire";
	let d = math.huge;
	for (const [id, o] of pairs(ORIGINES)) {
		const x = new Vector3(p.X - o.X, 0, p.Z - o.Z).Magnitude;
		if (x < d) {
			d = x;
			meilleure = id as string;
		}
	}
	return meilleure;
}

function saisonDu(jour: number): string {
	const mois = versDate(CONTENU, jour).mois;
	const def = (CONTENU.config.calendrier as unknown as { mois?: { saison: string }[] }).mois;
	return def?.[mois - 1]?.saison ?? "printemps";
}

/** Tirage du temps du jour (le même pour tous les joueurs de la campagne). */
export function tempsDuJour(region: string, jour: number): Temps {
	const climat = CLIMATS[region]?.[saisonDu(jour)] ?? { beau: 1 };
	let graine = jour * 7919;
	for (let i = 1; i <= region.size(); i++) graine = (graine * 31 + (string.byte(region, i)[0] ?? 0)) % 1000003;
	const hasard = new Random(graine);
	let total = 0;
	for (const [, v] of pairs(climat)) total += v;
	let tirage = hasard.NextNumber() * total;
	for (const t of ["beau", "pluie", "neige", "brouillard", "sable", "cendres"] as Temps[]) {
		const v = climat[t] ?? 0;
		if (tirage < v) return t;
		tirage -= v;
	}
	return "beau";
}

function appliquer(t: Temps) {
	actuel = t;
	const e = EFFETS[t];
	const atmo = Lighting.FindFirstChildOfClass("Atmosphere");
	if (atmo) atmo.Haze = e.brume;
	sonMeteo(e.son);
	if (!e.particules) {
		if (particules) particules.Enabled = false;
		return;
	}
	if (!emetteur) {
		emetteur = new Instance("Part");
		emetteur.Name = "Meteo";
		emetteur.Anchored = true;
		emetteur.CanCollide = false;
		emetteur.CanQuery = false;
		emetteur.CastShadow = false;
		emetteur.Transparency = 1;
		emetteur.Size = new Vector3(140, 1, 140);
		particules = new Instance("ParticleEmitter");
		particules.EmissionDirection = Enum.NormalId.Bottom;
		particules.Lifetime = new NumberRange(2.5, 4);
		particules.LightEmission = 0.2;
		particules.Parent = emetteur;
		emetteur.Parent = Workspace.CurrentCamera;
	}
	const p = e.particules;
	particules!.Color = new ColorSequence(p.couleur);
	particules!.Size = new NumberSequence(p.taille);
	particules!.Speed = new NumberRange(p.vitesse * 0.8, p.vitesse);
	particules!.Rate = p.debit;
	particules!.Squash = new NumberSequence(p.etire > 0 ? p.etire : 0);
	particules!.Orientation = p.etire > 0 ? Enum.ParticleOrientation.VelocityParallel : Enum.ParticleOrientation.FacingCamera;
	particules!.Acceleration = new Vector3(p.vent, 0, p.vent * 0.4);
	particules!.RotSpeed = new NumberRange(-60, 60);
	particules!.Enabled = true;
}

/** Démarre la météo (à appeler une fois au lancement du client). */
export function demarrerMeteo() {
	// l'émetteur suit la caméra, 30 studs au-dessus
	RunService.RenderStepped.Connect(() => {
		const cam = Workspace.CurrentCamera;
		if (emetteur && cam) emetteur.CFrame = new CFrame(cam.CFrame.Position.add(new Vector3(0, 30, 0)));
	});
	task.spawn(() => {
		while (true) {
			task.wait(1);
			const r = Players.LocalPlayer.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
			const etat = jeu.etat;
			let voulu: Temps = "beau";
			// dehors seulement : ni dans les salles (sous la carte), ni dans les donjons (au-dessus)
			if (r && etat && r.Position.Y > -100 && r.Position.Y < 400) voulu = tempsDuJour(regionDe(r.Position), etat.jour);
			if (voulu !== actuel) appliquer(voulu);
		}
	});
}

/** Temps qu'il fait là où se trouve le joueur (pour la barre du haut). */
export function tempsActuel(): Temps {
	return actuel;
}
