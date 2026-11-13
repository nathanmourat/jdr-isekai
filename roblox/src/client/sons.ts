/**
 * Sons d'ambiance côté joueur : ville (jour / nuit), taverne, temple, combat, victoire.
 * Les numéros de sons sont dans shared/sons.ts (vides par défaut : rien n'est joué).
 */
import { Lighting, SoundService } from "@rbxts/services";
import { SONS } from "shared/sons";

const pistes = new Map<string, Sound>();

function piste(cle: keyof typeof SONS, boucle: boolean, volume: number): Sound | undefined {
	const id = SONS[cle];
	if (id === "") return undefined;
	let s = pistes.get(cle);
	if (!s) {
		s = new Instance("Sound");
		s.SoundId = id;
		s.Looped = boucle;
		s.Volume = volume;
		s.Parent = SoundService;
		pistes.set(cle, s);
	}
	return s;
}

/** Joue l'ambiance qui correspond à la situation (et coupe les autres). */
export function majSons(vue: string, dans: string | undefined) {
	const t = Lighting.ClockTime;
	const nuit = t < 6.3 || t > 18.7;
	let voulue: keyof typeof SONS | undefined;
	if (vue === "combat") voulue = "combat";
	else if (dans === "taverne") voulue = "taverne";
	else if (dans === "temple-du-seuil") voulue = "temple";
	else if (dans === undefined && (vue === "monde" || vue === "scene-groupe" || vue === "scene-moi")) voulue = nuit ? "ambianceNuit" : "ambianceVille";
	for (const cle of ["ambianceVille", "ambianceNuit", "taverne", "temple", "combat"] as const) {
		const s = piste(cle, true, cle === "combat" ? 0.4 : 0.3);
		if (!s) continue;
		if (cle === voulue && !s.IsPlaying) s.Play();
		else if (cle !== voulue && s.IsPlaying) s.Stop();
	}
}

/** Son ponctuel (victoire, coup). */
export function jouer(cle: "victoire" | "coup") {
	const s = piste(cle, false, 0.5);
	s?.Play();
}
