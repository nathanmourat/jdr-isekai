/**
 * Sons côté joueur : une ambiance à la fois selon l'endroit (ville jour / nuit, campagne, taverne, temple, forge,
 * donjon, combat, boss), la météo par-dessus (pluie, vent), et des sons courts (dé, coffre, victoire…).
 * Les numéros de sons sont dans shared/sons.ts (vides par défaut : rien n'est joué).
 */
import { Lighting, Players, SoundService, Workspace } from "@rbxts/services";
import { SONS, type CleSon } from "shared/sons";
import { jeu } from "./partie";
import { groupeSon } from "./reglages";

const pistes = new Map<string, Sound>();

function piste(cle: CleSon, boucle: boolean, volume: number): Sound | undefined {
	const id = SONS[cle];
	if (id === "") return undefined;
	let s = pistes.get(cle);
	if (!s) {
		s = new Instance("Sound");
		s.SoundId = id;
		s.Looped = boucle;
		s.Volume = volume;
		s.SoundGroup = groupeSon(cle);
		s.Parent = SoundService;
		pistes.set(cle, s);
	}
	return s;
}

const AMBIANCES: CleSon[] = ["ambianceVille", "ambianceNuit", "ambianceNature", "taverne", "temple", "forge", "donjon", "combat", "combatBoss"];
const VOLUMES: Partial<Record<CleSon, number>> = { combat: 0.4, combatBoss: 0.45, donjon: 0.35 };

/** Vrai si le joueur est dans Lysmont ou dans une ville (sinon : campagne, ambiance « nature »). */
function enVille(): boolean {
	const r = Players.LocalPlayer.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (!r) return true;
	// Lysmont est autour de l'origine ; les autres villes : près d'une porte de lieu
	if (new Vector3(r.Position.X, 0, r.Position.Z).Magnitude < 450) return true;
	return false;
}

/** Joue l'ambiance qui correspond à la situation (et coupe les autres). */
export function majSons(vue: string, dans: string | undefined) {
	const t = Lighting.ClockTime;
	const nuit = t < 6.3 || t > 18.7;
	let voulue: CleSon | undefined;
	if (vue === "combat") {
		const boss = jeu.etat !== undefined && (() => {
			for (const [, e] of pairs(jeu.etat!.combats)) if (e.combat.combattants.some((x) => x.boss === true && !x.ko)) return true;
			return false;
		})();
		voulue = boss && SONS.combatBoss !== "" ? "combatBoss" : "combat";
	} else if (vue === "donjon") voulue = "donjon";
	else if (dans === "taverne") voulue = "taverne";
	else if (dans !== undefined && dans.sub(1, 6) === "temple") voulue = "temple";
	else if (dans !== undefined) {
		const nom = Workspace.FindFirstChild("Interieurs")?.FindFirstChild(dans)?.GetAttribute("Nom");
		if (typeIs(nom, "string") && nom.find("Forge", 1, true)[0] !== undefined) voulue = "forge";
	} else if (vue === "monde" || vue === "scene-groupe" || vue === "scene-moi") voulue = !enVille() && SONS.ambianceNature !== "" ? "ambianceNature" : nuit ? "ambianceNuit" : "ambianceVille";
	for (const cle of AMBIANCES) {
		const s = piste(cle, true, VOLUMES[cle] ?? 0.3);
		if (!s) continue;
		if (cle === voulue && !s.IsPlaying) s.Play();
		else if (cle !== voulue && s.IsPlaying) s.Stop();
	}
}

/** Météo : pluie ou vent en boucle par-dessus l'ambiance (undefined = rien). */
export function sonMeteo(cle: "pluie" | "vent" | undefined) {
	for (const k of ["pluie", "vent"] as const) {
		const s = piste(k, true, 0.35);
		if (!s) continue;
		if (k === cle && !s.IsPlaying) s.Play();
		else if (k !== cle && s.IsPlaying) s.Stop();
	}
}

/** Son court. */
export function jouer(cle: CleSon) {
	const s = piste(cle, false, 0.5);
	s?.Play();
}
