/**
 * Interface du joueur : choisit quoi afficher selon la situation (même ordre de priorité que la version web) :
 * combat > donjon > scène de groupe > scène personnelle > temps libre > fin de chapitre > monde.
 * Tout est redessiné à chaque changement de la partie (les saisies en cours sont gardées en mémoire).
 */
import { Players, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { noeudCourant } from "shared/moteur";
import { affichage } from "./local";
import { effacerMessages, jeu, monHeros, surChangement } from "./partie";
import { afficherArene, cacherArene } from "./rendu/arene";
import { afficherDonjon, cacherDonjon } from "./rendu/donjon3d";
import { allerAuLieu, entrerDans, majMarqueurs, majPnj, sortirDe, surInteraction } from "./rendu/marqueurs";
import { vueCombat } from "./ui/combat";
import { vueDialogue } from "./ui/dialogue";
import { activerClavier, vueDonjon } from "./ui/donjon";
import { ecranAccueil, ecranCreation } from "./ui/ecrans";
import { COULEURS, vider } from "./ui/kit";
import { barreHaut, panneauLateral } from "./ui/monde";
import { vueFinChapitre, vueTempsLibre } from "./ui/temps";
import { majSons } from "./sons";

const joueur = Players.LocalPlayer;
const gui = new Instance("ScreenGui");
gui.Name = "Velmaris";
gui.ResetOnSpawn = false;
gui.IgnoreGuiInset = true;
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

function remplissage(o: GuiObject, px: number) {
	const p = new Instance("UIPadding");
	p.PaddingTop = new UDim(0, px);
	p.PaddingBottom = new UDim(0, px);
	p.PaddingLeft = new UDim(0, px);
	p.PaddingRight = new UDim(0, px);
	p.Parent = o;
}
function empiler(o: GuiObject, espace = 10) {
	const l = new Instance("UIListLayout");
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Padding = new UDim(0, espace);
	l.Parent = o;
}
function zoneDefilante(nom: string): [ScrollingFrame, Frame] {
	const s = new Instance("ScrollingFrame");
	s.Name = nom;
	s.BackgroundColor3 = COULEURS.fond;
	s.BackgroundTransparency = 0.12;
	s.BorderSizePixel = 0;
	s.ScrollBarThickness = 8;
	s.ScrollBarImageColor3 = COULEURS.bord;
	s.CanvasSize = new UDim2();
	s.AutomaticCanvasSize = Enum.AutomaticSize.Y;
	const page = new Instance("Frame");
	page.BackgroundTransparency = 1;
	page.Size = new UDim2(1, 0, 0, 0);
	page.AutomaticSize = Enum.AutomaticSize.Y;
	empiler(page);
	remplissage(page, 12);
	page.Parent = s;
	s.Parent = gui;
	return [s, page];
}

// plein écran (accueil, création, temps libre, fin de chapitre)
const [plein, pagePleine] = zoneDefilante("PleinEcran");
plein.Size = UDim2.fromScale(1, 1);
plein.BackgroundTransparency = 0.05;
pagePleine.AnchorPoint = new Vector2(0.5, 0);
pagePleine.Position = new UDim2(0.5, 0, 0, 8);
const limite = new Instance("UISizeConstraint");
limite.MaxSize = new Vector2(920, math.huge);
limite.Parent = pagePleine;

// barre du haut (dans le monde)
const barre = new Instance("Frame");
barre.Name = "Barre";
barre.BackgroundColor3 = COULEURS.fond;
barre.BackgroundTransparency = 0.15;
barre.Size = new UDim2(1, 0, 0, 0);
barre.AutomaticSize = Enum.AutomaticSize.Y;
remplissage(barre, 8);
barre.Parent = gui;

// panneau latéral (droite) : lieux, menus, combat, donjon
const [laterale, pageLaterale] = zoneDefilante("Lateral");
laterale.AnchorPoint = new Vector2(1, 0);

// panneau du bas : dialogues
const [bas, pageBas] = zoneDefilante("Bas");
bas.AnchorPoint = new Vector2(0.5, 1);
bas.Position = new UDim2(0.5, 0, 1, -8);
const limiteBas = new Instance("UISizeConstraint");
limiteBas.MaxSize = new Vector2(980, math.huge);
limiteBas.Parent = bas;

// calque du combat (plein écran, transparent : on voit le combat en 3D derrière)
const calqueCombat = new Instance("Frame");
calqueCombat.Name = "Combat";
calqueCombat.BackgroundTransparency = 1;
calqueCombat.Size = UDim2.fromScale(1, 1);
calqueCombat.Parent = gui;

// bandeau d'erreur ou d'information (cliquer pour fermer)
const bandeau = new Instance("TextButton");
bandeau.AutoButtonColor = false;
bandeau.MouseButton1Click.Connect(effacerMessages);
bandeau.AnchorPoint = new Vector2(0.5, 0);
bandeau.Position = new UDim2(0.5, 0, 0, 8);
bandeau.Size = new UDim2(0.8, 0, 0, 0);
bandeau.AutomaticSize = Enum.AutomaticSize.Y;
bandeau.TextWrapped = true;
bandeau.TextSize = 16;
bandeau.Font = Enum.Font.GothamBold;
bandeau.TextColor3 = COULEURS.texte;
bandeau.ZIndex = 10;
bandeau.Visible = false;
new Instance("UICorner").Parent = bandeau;
remplissage(bandeau, 8);
bandeau.Parent = gui;

function allerA(lieu: string) {
	affichage.panneau = undefined;
	affichage.lieu = undefined;
	affichage.dans = undefined;
	allerAuLieu(lieu);
	redessiner();
}

/** Combat à afficher : celui du groupe ou le mien, une fois son introduction lue. */
function combatAAfficher(): string | undefined {
	const etat = jeu.etat!;
	const h = monHeros()!;
	for (const k of ["groupe", h.id]) {
		const e = etat.combats[k];
		if (!e) continue;
		const sc = e.contexte.sceneCle;
		const intro = sc !== undefined && etat.scenes[sc] !== undefined ? noeudCourant(CONTENU, etat, sc)?.repliques.size() ?? 0 : 0;
		if (e.contexte.origine !== "scene" || intro === 0 || affichage.combatsVus.has(e.combat.id)) return k;
	}
	return undefined;
}

let vuePrecedente = "";
function cameraNormale() {
	const camera = Workspace.CurrentCamera!;
	if (camera.CameraType !== Enum.CameraType.Custom) {
		camera.CameraType = Enum.CameraType.Custom;
		const humanoide = joueur.Character?.FindFirstChildOfClass("Humanoid");
		if (humanoide) camera.CameraSubject = humanoide;
	}
}

function redessiner() {
	const etat = jeu.etat;
	const h = monHeros();
	let vue: string;
	let combatCle: string | undefined;
	if (!etat) vue = "accueil";
	else if (!h) vue = "creation";
	else if ((combatCle = combatAAfficher()) !== undefined) vue = "combat";
	else if (etat.donjon) vue = "donjon";
	else if (etat.scenes.groupe) vue = "scene-groupe";
	else if (etat.scenes[h.id]) vue = "scene-moi";
	else if (etat.tempsLibre) vue = "temps-libre";
	else if (etat.finChapitre !== undefined) vue = "fin-chapitre";
	else vue = "monde";

	for (const p of [pagePleine, pageLaterale, pageBas, barre]) vider(p);
	for (const e of calqueCombat.GetChildren()) e.Destroy();
	calqueCombat.Visible = vue === "combat";
	plein.Visible = ["accueil", "creation", "temps-libre", "fin-chapitre"].includes(vue);
	barre.Visible = vue === "monde" || vue === "scene-groupe" || vue === "scene-moi";
	bas.Visible = vue === "scene-groupe" || vue === "scene-moi";
	laterale.Visible = false;

	const etroit = (Workspace.CurrentCamera?.ViewportSize.X ?? 1000) < 820;
	const haut = barre.Visible ? 130 : 8;
	laterale.Position = new UDim2(1, etroit ? 0 : -8, 0, haut);
	laterale.Size = etroit ? new UDim2(1, 0, 0.55, -haut) : new UDim2(0, 470, 1, -haut - 8);
	bas.Size = new UDim2(etroit ? 1 : 0.9, 0, etroit ? 0.5 : 0.42, 0);

	if (vue === "accueil") ecranAccueil(pagePleine, redessiner);
	else if (vue === "creation") ecranCreation(pagePleine, redessiner);
	else if (vue === "temps-libre") vueTempsLibre(pagePleine, redessiner);
	else if (vue === "fin-chapitre") vueFinChapitre(pagePleine);
	else {
		if (barre.Visible) barreHaut(barre, redessiner, allerA);
		if (vue === "combat") {
			const entree = etat!.combats[combatCle!];
			afficherArene(entree.combat, entree.contexte.origine === "donjon");
			vueCombat(calqueCombat, combatCle!, redessiner);
		} else if (vue === "donjon") {
			laterale.Visible = true;
			vueDonjon(pageLaterale);
			afficherDonjon(etat!.donjon!);
		} else if (vue === "scene-groupe" || vue === "scene-moi") {
			vueDialogue(pageBas, vue === "scene-groupe" ? "groupe" : h!.id, redessiner);
		} else {
			laterale.Visible = panneauLateral(pageLaterale, redessiner, allerA);
		}
	}

	if (vue !== "combat") cacherArene();
	if (vue !== "donjon") cacherDonjon();
	if (vue !== "combat" && vue !== "donjon") cameraNormale();
	activerClavier(vue === "donjon");
	majMarqueurs(vue === "monde");
	majPnj();
	majSons(vue, affichage.dans);
	// le panneau latéral commence juste sous la barre du haut (sa hauteur varie avec son contenu)
	if (barre.Visible) {
		task.defer(() => {
			const y = barre.AbsoluteSize.Y + 8;
			laterale.Position = new UDim2(1, etroit ? 0 : -8, 0, y);
			laterale.Size = etroit ? new UDim2(1, 0, 0.55, -y) : new UDim2(0, 470, 1, -y - 8);
		});
	}
	if (vue !== vuePrecedente) {
		plein.CanvasPosition = new Vector2();
		laterale.CanvasPosition = new Vector2();
		bas.CanvasPosition = new Vector2();
	}
	vuePrecedente = vue;

	const message = jeu.erreur ?? jeu.info;
	bandeau.Visible = message !== undefined;
	bandeau.Text = message !== undefined ? `${message}   ✕` : "";
	bandeau.BackgroundColor3 = jeu.erreur !== undefined ? COULEURS.rouge : COULEURS.fond2;
}

surInteraction((lieu, action, pnj) => {
	if (!jeu.etat || !monHeros()) return;
	affichage.panneau = undefined;
	if (action === "entrer") {
		// bâtiment avec intérieur : on y entre ; sinon, on ouvre simplement le panneau du lieu
		if (entrerDans(lieu)) {
			affichage.dans = lieu;
			affichage.lieu = undefined;
		} else {
			affichage.lieu = lieu;
			affichage.section = "tout";
		}
	} else if (action === "sortir") {
		sortirDe(lieu);
		affichage.dans = undefined;
		affichage.lieu = undefined;
	} else {
		affichage.lieu = lieu;
		affichage.pnj = action === "parler" ? pnj : undefined;
		affichage.section =
			action === "parler" || action === "contrats" || action === "boutique" || action === "grimoire" || action === "auberge" || action === "etape" ? action : "tout";
	}
	redessiner();
});
surChangement(redessiner);
redessiner();
// l'ambiance sonore suit aussi le jour et la nuit, même sans action dans la partie
task.spawn(() => {
	while (true) {
		task.wait(10);
		majSons(vuePrecedente, affichage.dans);
	}
});
gui.Parent = joueur.WaitForChild("PlayerGui");
print("[Velmaris] Client prêt.");
