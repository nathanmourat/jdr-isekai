/**
 * Marqueurs au-dessus des bâtiments de Lysmont, propres à chaque joueur :
 * ⭐ quête principale, ● autre chose à faire, ⚔ combat possible ; lieux pas encore accessibles masqués.
 * Gère aussi l'entrée dans un lieu (touche E près d'une porte) et le voyage rapide (« Y aller »).
 */
import { Players, ProximityPromptService, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { conditionScene, lieuAvecCombat, listeHeros, scenesDisponibles } from "shared/moteur";
import { jeu, monHeros } from "../partie";

const panneaux = new Map<string, TextLabel>();

function entrees(): BasePart[] {
	const dossier = Workspace.FindFirstChild("Velmaris");
	if (!dossier) return [];
	const res: BasePart[] = [];
	for (const e of dossier.GetDescendants()) if (e.IsA("BasePart") && e.Name === "Entree") res.push(e);
	return res;
}

/** Met à jour les marqueurs (appelé à chaque changement de la partie). */
export function majMarqueurs(visible: boolean) {
	const etat = jeu.etat;
	const h = monHeros();
	const tous = etat ? listeHeros(etat).map((x) => x.id) : [];
	for (const ancre of entrees()) {
		const id = ancre.GetAttribute("Lieu") as string;
		const lieu = CONTENU.regions.aubeclaire.lieux.find((l) => l.id === id);
		const invite = ancre.FindFirstChildOfClass("ProximityPrompt");
		let etiquette = panneaux.get(id);
		if (!etiquette) {
			const gui = new Instance("BillboardGui");
			gui.Size = new UDim2(0, 220, 0, 40);
			gui.StudsOffset = new Vector3(0, 9, 0);
			gui.AlwaysOnTop = true;
			gui.MaxDistance = 400;
			gui.Adornee = ancre;
			etiquette = new Instance("TextLabel");
			etiquette.Size = UDim2.fromScale(1, 1);
			etiquette.BackgroundTransparency = 1;
			etiquette.Font = Enum.Font.GothamBold;
			etiquette.TextSize = 18;
			etiquette.TextColor3 = new Color3(1, 1, 1);
			etiquette.TextStrokeTransparency = 0.2;
			etiquette.RichText = true;
			etiquette.Parent = gui;
			gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
			panneaux.set(id, etiquette);
		}
		const gui = etiquette.Parent as BillboardGui;
		if (!etat || !h || !lieu || !visible) {
			gui.Enabled = false;
			if (invite) invite.Enabled = visible && etat !== undefined && h !== undefined;
			continue;
		}
		const accessible = conditionScene(CONTENU, etat, lieu.disponible_si, tous);
		if (invite) invite.Enabled = accessible;
		gui.Enabled = accessible;
		if (!accessible) continue;
		const scenes = scenesDisponibles(CONTENU, etat, id, h.id);
		const principale = scenes.some((s) => s.quete !== undefined && CONTENU.quetes[s.quete]?.type === "principale");
		const marque = principale ? '<font color="#ffd166">⭐</font> ' : scenes.size() > 0 ? '<font color="#9fd3ff">●</font> ' : "";
		const combat = lieuAvecCombat(CONTENU, etat, id, h.id) ? ' <font color="#ff9b8a">⚔</font>' : "";
		etiquette.Text = `${marque}${lieu.nom}${combat}`;
	}
}

/** Téléporte le personnage devant l'entrée d'un lieu. */
export function allerAuLieu(id: string) {
	const ancre = entrees().find((a) => a.GetAttribute("Lieu") === id);
	const perso = Players.LocalPlayer.Character;
	const racine = perso?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (ancre && racine) racine.CFrame = new CFrame(ancre.Position.add(new Vector3(0, 1, 6)), ancre.Position);
}

/** Appelle `ouvrir(lieu)` quand le joueur appuie sur E près d'une porte. */
export function surEntree(ouvrir: (lieu: string) => void) {
	ProximityPromptService.PromptTriggered.Connect((invite) => {
		const id = invite.GetAttribute("Lieu");
		if (typeIs(id, "string")) ouvrir(id);
	});
}
