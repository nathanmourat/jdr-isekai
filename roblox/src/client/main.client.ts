/**
 * Interface du joueur (étape R1) : un écran par situation, redessiné à chaque changement de la partie.
 */
import { Players } from "@rbxts/services";
import { effacerMessages, jeu, monHeros, surChangement } from "./partie";
import { COULEURS, vider } from "./ui/kit";
import { ecranAccueil, ecranCreation, ecranFiche } from "./ui/ecrans";

const gui = new Instance("ScreenGui");
gui.Name = "Velmaris";
gui.ResetOnSpawn = false;
gui.IgnoreGuiInset = true;
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

const fond = new Instance("Frame");
fond.Size = UDim2.fromScale(1, 1);
fond.BackgroundColor3 = COULEURS.fond;
fond.BackgroundTransparency = 0.08;
fond.Parent = gui;

const defilement = new Instance("ScrollingFrame");
defilement.Size = UDim2.fromScale(1, 1);
defilement.BackgroundTransparency = 1;
defilement.BorderSizePixel = 0;
defilement.ScrollBarThickness = 8;
defilement.ScrollBarImageColor3 = COULEURS.bord;
defilement.CanvasSize = new UDim2();
defilement.AutomaticCanvasSize = Enum.AutomaticSize.Y;
defilement.Parent = fond;

// colonne centrale, 900 px au plus (lisible sur PC comme sur téléphone)
const page = new Instance("Frame");
page.BackgroundTransparency = 1;
page.AnchorPoint = new Vector2(0.5, 0);
page.Position = new UDim2(0.5, 0, 0, 16);
page.Size = new UDim2(1, -32, 0, 0);
page.AutomaticSize = Enum.AutomaticSize.Y;
const limite = new Instance("UISizeConstraint");
limite.MaxSize = new Vector2(900, math.huge);
limite.Parent = page;
const liste = new Instance("UIListLayout");
liste.SortOrder = Enum.SortOrder.LayoutOrder;
liste.Padding = new UDim(0, 10);
liste.Parent = page;
const basPage = new Instance("UIPadding");
basPage.PaddingBottom = new UDim(0, 40);
basPage.Parent = page;
page.Parent = defilement;

// bandeau d'erreur ou d'information, en bas de l'écran (cliquer pour le fermer)
const bandeau = new Instance("TextButton");
bandeau.AutoButtonColor = false;
bandeau.MouseButton1Click.Connect(effacerMessages);
bandeau.AnchorPoint = new Vector2(0.5, 1);
bandeau.Position = new UDim2(0.5, 0, 1, -16);
bandeau.Size = new UDim2(0.9, 0, 0, 0);
bandeau.AutomaticSize = Enum.AutomaticSize.Y;
bandeau.TextWrapped = true;
bandeau.TextSize = 16;
bandeau.Font = Enum.Font.GothamBold;
bandeau.TextColor3 = COULEURS.texte;
bandeau.Visible = false;
bandeau.ZIndex = 10;
const coin = new Instance("UICorner");
coin.Parent = bandeau;
const marge = new Instance("UIPadding");
marge.PaddingTop = new UDim(0, 8);
marge.PaddingBottom = new UDim(0, 8);
marge.PaddingLeft = new UDim(0, 8);
marge.PaddingRight = new UDim(0, 8);
marge.Parent = bandeau;
bandeau.Parent = gui;

let ecran = "";
function redessiner() {
	const nouvel = jeu.etat === undefined ? "accueil" : monHeros() === undefined ? "creation" : "fiche";
	// les saisies en cours (nom, code…) sont gardées en mémoire : on peut tout redessiner sans les perdre
	vider(page);
	if (nouvel === "accueil") ecranAccueil(page, redessiner);
	else if (nouvel === "creation") ecranCreation(page, redessiner);
	else ecranFiche(page, redessiner);
	if (nouvel !== ecran) defilement.CanvasPosition = new Vector2(0, 0);
	ecran = nouvel;

	const message = jeu.erreur ?? jeu.info;
	bandeau.Visible = message !== undefined;
	bandeau.Text = message !== undefined ? `${message}   ✕` : "";
	bandeau.BackgroundColor3 = jeu.erreur !== undefined ? COULEURS.rouge : COULEURS.fond2;
}

surChangement(redessiner);
redessiner();
gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
print("[Velmaris] Client prêt.");
