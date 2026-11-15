/**
 * Réglages du joueur, appliqués chez lui : langue, volumes (par groupes de sons), taille du texte, compteur
 * d'images par seconde, effets réduits, cosmétiques des autres, conseils. Enregistrés sur son compte par le serveur.
 */
import { LocalizationService, Players, RunService, SoundService } from "@rbxts/services";
import { masquerCosmetiques } from "shared/cosmetiques3d";
import { definirLangue, langueActuelle, langueDuCompte, trf } from "shared/langue";
import { REGLAGES_DEFAUT, type Reglages } from "shared/reglages";
import { reseau } from "shared/reseau";
import type { CleSon } from "shared/sons";

const r = reseau();
export const reglages: Reglages = { ...REGLAGES_DEFAUT };
const ecouteurs: (() => void)[] = [];

/** Appelé après chaque changement de réglage (pour redessiner l'interface). */
export function surReglages(f: () => void) {
	ecouteurs.push(f);
}

// ───────────────────────────── Sons ─────────────────────────────

const GROUPES = { ambiance: "Ambiance", effets: "Effets", interface: "Interface" } as const;
type Groupe = keyof typeof GROUPES;
const SONS_AMBIANCE = new Set<CleSon>(["ambianceVille", "ambianceNuit", "ambianceNature", "taverne", "temple", "forge", "donjon", "combat", "combatBoss", "pluie", "vent"]);
const SONS_INTERFACE = new Set<CleSon>(["clic", "boutique"]);

function groupe(nom: Groupe): SoundGroup {
	const n = GROUPES[nom];
	let g = SoundService.FindFirstChild(n) as SoundGroup | undefined;
	if (!g) {
		g = new Instance("SoundGroup");
		g.Name = n;
		g.Parent = SoundService;
	}
	return g;
}

/** Groupe de volume d'un son du jeu. */
export function groupeSon(cle: CleSon): SoundGroup {
	return groupe(SONS_AMBIANCE.has(cle) ? "ambiance" : SONS_INTERFACE.has(cle) ? "interface" : "effets");
}

function appliquerVolumes() {
	groupe("ambiance").Volume = reglages.volumeGeneral * reglages.volumeAmbiance;
	groupe("effets").Volume = reglages.volumeGeneral * reglages.volumeEffets;
	groupe("interface").Volume = reglages.volumeGeneral * reglages.volumeInterface;
}

// ───────────────────────────── Compteur d'images ─────────────────────────────

let compteur: TextLabel | undefined;
let images = 0;
let depuis = os.clock();
RunService.RenderStepped.Connect(() => {
	if (!compteur) return;
	images++;
	const t = os.clock();
	if (t - depuis >= 0.5) {
		const ips = math.floor(images / (t - depuis) + 0.5);
		compteur.Text = trf("{n} images/s", { n: ips });
		compteur.TextColor3 = ips >= 55 ? Color3.fromRGB(120, 210, 120) : ips >= 30 ? Color3.fromRGB(230, 190, 90) : Color3.fromRGB(230, 100, 90);
		images = 0;
		depuis = t;
	}
});

function appliquerCompteur() {
	if (!reglages.compteurImages) {
		compteur?.FindFirstAncestorOfClass("ScreenGui")?.Destroy();
		compteur = undefined;
		return;
	}
	if (compteur) return;
	const gui = new Instance("ScreenGui");
	gui.Name = "CompteurImages";
	gui.DisplayOrder = 50;
	gui.ResetOnSpawn = false;
	gui.IgnoreGuiInset = true;
	compteur = new Instance("TextLabel");
	compteur.BackgroundColor3 = Color3.fromRGB(20, 15, 9);
	compteur.BackgroundTransparency = 0.35;
	compteur.Position = new UDim2(0, 8, 1, -30);
	compteur.Size = new UDim2(0, 110, 0, 22);
	compteur.Font = Enum.Font.GothamBold;
	compteur.TextSize = 13;
	compteur.Text = "…";
	compteur.Parent = gui;
	gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
}

// ───────────────────────────── Cosmétiques et effets des autres joueurs ─────────────────────────────

function appliquerAutres() {
	for (const p of Players.GetPlayers()) {
		if (p === Players.LocalPlayer || !p.Character) continue;
		masquerCosmetiques(p.Character, !reglages.cosmetiquesAutres);
		// effets réduits : on garde les capes et titres, mais plus les particules des autres
		if (reglages.cosmetiquesAutres && reglages.effetsReduits)
			for (const d of p.Character.GetDescendants()) if (d.IsA("ParticleEmitter")) d.Enabled = false;
	}
}
task.spawn(() => {
	while (true) {
		task.wait(3);
		if (!reglages.cosmetiquesAutres || reglages.effetsReduits) pcall(appliquerAutres);
	}
});

// ───────────────────────────── Changer un réglage ─────────────────────────────

function appliquer(prevenir: boolean) {
	appliquerVolumes();
	appliquerCompteur();
	pcall(appliquerAutres);
	const voulue = reglages.langue ?? langueDuCompte(LocalizationService.RobloxLocaleId);
	if (voulue !== langueActuelle()) definirLangue(voulue);
	if (prevenir) for (const f of ecouteurs) task.spawn(f);
}

/** Change un réglage, l'applique tout de suite et l'enregistre sur le compte. */
export function changerReglage<K extends keyof Reglages>(cle: K, valeur: Reglages[K]) {
	reglages[cle] = valeur;
	appliquer(true);
	r.reglages.FireServer(reglages);
}

/** À appeler tout au début du client : langue du compte d'abord, puis les réglages enregistrés quand ils arrivent. */
export function preparerReglages() {
	appliquer(false);
	r.reglages.OnClientEvent.Connect((recu) => {
		if (recu) for (const [k, v] of pairs(recu)) (reglages as unknown as Record<string, unknown>)[k as string] = v;
		appliquer(true);
	});
}

/** Facteur de taille du texte (kit d'interface). */
export function facteurTexte(): number {
	return reglages.tailleTexte;
}
