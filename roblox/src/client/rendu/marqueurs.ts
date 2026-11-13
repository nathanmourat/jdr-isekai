/**
 * Marqueurs au-dessus des bâtiments de Lysmont, propres à chaque joueur :
 * ⭐ quête principale, ● autre chose à faire, ⚔ combat possible ; lieux pas encore accessibles masqués.
 * Gère aussi les interactions (touche E) : entrer / sortir d'un intérieur (fondu au noir + téléportation),
 * parler à un PNJ, consulter un tableau, acheter… ; le voyage rapide (« Y aller ») ; et masque les PNJ
 * que la partie de ce joueur ne doit pas encore voir (condition « si » du lieu).
 */
import { Players, ProximityPromptService, TweenService, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { conditionScene, lieuAvecCombat, lieuxDesEtapes, listeHeros, scenesDisponibles } from "shared/moteur";
import { jeu, monHeros } from "../partie";

const panneaux = new Map<string, TextLabel>();

function montrer(modele: Model, oui: boolean) {
	for (const e of modele.GetDescendants()) {
		if (e.IsA("BasePart") || e.IsA("Decal")) e.LocalTransparencyModifier = oui ? 0 : 1;
		else if (e.IsA("ProximityPrompt")) e.Enabled = oui;
		else if (e.IsA("BillboardGui")) e.Enabled = oui;
	}
}

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
	const etapes = etat && h ? lieuxDesEtapes(CONTENU, etat, h.id) : [];
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
		// balise d'un lieu d'étape : visible seulement pendant l'étape qui y mène
		const balise = ancre.Parent?.GetAttribute("Etape") !== undefined;
		if (balise) montrer(ancre.Parent as Model, etapes.includes(id));
		const accessible = balise ? etapes.includes(id) : conditionScene(CONTENU, etat, lieu.disponible_si, tous);
		if (invite) invite.Enabled = accessible;
		gui.Enabled = accessible;
		if (!accessible) continue;
		const scenes = scenesDisponibles(CONTENU, etat, id, h.id);
		const principale = scenes.some((s) => s.quete !== undefined && CONTENU.quetes[s.quete]?.type === "principale");
		const marque = principale ? '<font color="#ffd166">⭐</font> ' : scenes.size() > 0 ? '<font color="#9fd3ff">●</font> ' : "";
		const combat = lieuAvecCombat(CONTENU, etat, id, h.id) ? ' <font color="#ff9b8a">⚔</font>' : "";
		const etape = etapes.includes(id) ? '<font color="#ffd166">📍</font> ' : "";
		etiquette.Text = `${etape}${marque}${lieu.nom}${combat}`;
	}
}

// ───────────────────────────── PNJ des intérieurs ─────────────────────────────

const marquesPnj = new Map<Model, TextLabel>();

/** PNJ visibles selon la partie (ex. Kaya après l'examen) ; ⭐/● au-dessus de ceux qui ont quelque chose à proposer. */
export function majPnj() {
	const etat = jeu.etat;
	const h = monHeros();
	const interieurs = Workspace.FindFirstChild("Interieurs");
	if (!interieurs) return;
	const tous = etat ? listeHeros(etat).map((x) => x.id) : [];
	for (const e of interieurs.GetDescendants()) {
		if (!e.IsA("Model") || e.GetAttribute("Pnj") === undefined) continue;
		const lieuId = e.GetAttribute("Lieu") as string;
		const pnjId = e.GetAttribute("Pnj") as string;
		const lieu = CONTENU.regions.aubeclaire.lieux.find((l) => l.id === lieuId);
		const entree = lieu?.pnj.find((p) => p.id === pnjId);
		const ok = etat !== undefined && (entree === undefined || conditionScene(CONTENU, etat, entree.si, tous));
		montrer(e, ok);
		let marque = marquesPnj.get(e);
		if (!marque && e.PrimaryPart) {
			const gui = new Instance("BillboardGui");
			gui.Size = new UDim2(0, 60, 0, 40);
			gui.StudsOffset = new Vector3(0, 4.5, 0);
			gui.AlwaysOnTop = true;
			gui.MaxDistance = 80;
			gui.Adornee = e.PrimaryPart;
			marque = new Instance("TextLabel");
			marque.Size = UDim2.fromScale(1, 1);
			marque.BackgroundTransparency = 1;
			marque.TextSize = 28;
			marque.Font = Enum.Font.GothamBold;
			marque.TextStrokeTransparency = 0.2;
			marque.RichText = true;
			marque.Parent = gui;
			gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
			marquesPnj.set(e, marque);
		}
		if (marque) {
			// scènes de ce PNJ (ou, pour le premier PNJ du lieu, celles qui ne nomment personne)
			const premier = lieu?.pnj[0]?.id === pnjId;
			const scenes = (ok && etat && h ? scenesDisponibles(CONTENU, etat, lieuId, h.id) : []).filter((sc) => sc.pnj === pnjId || (sc.pnj === undefined && premier));
			const principale = scenes.some((sc) => sc.quete !== undefined && CONTENU.quetes[sc.quete]?.type === "principale");
			const rendre = scenes.some((sc) => sc.rend_quete === true);
			marque.Text = rendre ? '<font color="#ffd166">?</font>' : principale ? '<font color="#ffd166">!</font>' : scenes.size() > 0 ? '<font color="#d0d6e0">!</font>' : "";
			(marque.Parent as BillboardGui).Enabled = ok;
		}
	}
}

// ───────────────────────────── Déplacements ─────────────────────────────

let voile: Frame | undefined;
/** Fondu au noir, action au milieu, puis retour de l'image. */
function fondu(milieu: () => void) {
	if (!voile) {
		const gui = new Instance("ScreenGui");
		gui.Name = "Fondu";
		gui.IgnoreGuiInset = true;
		gui.DisplayOrder = 100;
		gui.ResetOnSpawn = false;
		voile = new Instance("Frame");
		voile.Size = UDim2.fromScale(1, 1);
		voile.BackgroundColor3 = new Color3(0, 0, 0);
		voile.BackgroundTransparency = 1;
		voile.Parent = gui;
		gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
	}
	const v = voile;
	const assombrir = TweenService.Create(v, new TweenInfo(0.25), { BackgroundTransparency: 0 });
	assombrir.Completed.Connect(() => {
		milieu();
		task.delay(0.15, () => TweenService.Create(v, new TweenInfo(0.35), { BackgroundTransparency: 1 }).Play());
	});
	assombrir.Play();
}

function placer(cf: CFrame) {
	const racine = Players.LocalPlayer.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (racine) {
		racine.AssemblyLinearVelocity = new Vector3();
		racine.CFrame = cf;
	}
}

/** Téléporte le personnage dans la salle d'un lieu. */
export function entrerDans(lieu: string) {
	const arrivee = Workspace.FindFirstChild("Interieurs")?.FindFirstChild(lieu)?.FindFirstChild("Arrivee") as BasePart | undefined;
	if (!arrivee) return false;
	fondu(() => placer(new CFrame(arrivee.Position.add(new Vector3(0, 3, 0)), arrivee.Position.add(new Vector3(0, 3, -10)))));
	return true;
}

/** Ramène le personnage devant la porte du lieu, dehors. */
export function sortirDe(lieu: string) {
	const ancre = entrees().find((a) => a.GetAttribute("Lieu") === lieu);
	if (ancre) fondu(() => placer(new CFrame(ancre.Position.add(new Vector3(0, 1, 6)), ancre.Position.add(new Vector3(0, 1, 12)))));
}

/** Téléporte le personnage devant l'entrée d'un lieu. */
export function allerAuLieu(id: string) {
	const ancre = entrees().find((a) => a.GetAttribute("Lieu") === id);
	const perso = Players.LocalPlayer.Character;
	const racine = perso?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (ancre && racine) racine.CFrame = new CFrame(ancre.Position.add(new Vector3(0, 1, 6)), ancre.Position);
}

/** Appelle `gerer(lieu, action)` quand le joueur appuie sur E : entrer, sortir, parler, contrats, boutique, grimoire, tout. */
export function surInteraction(gerer: (lieu: string, action: string, pnj?: string) => void) {
	ProximityPromptService.PromptTriggered.Connect((invite) => {
		const lieu = invite.GetAttribute("Lieu");
		const action = invite.GetAttribute("Action");
		const pnj = invite.Parent?.Parent?.GetAttribute("Pnj");
		if (typeIs(lieu, "string")) gerer(lieu, typeIs(action, "string") ? action : "entrer", typeIs(pnj, "string") ? pnj : undefined);
	});
}
