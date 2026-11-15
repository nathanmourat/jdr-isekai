/**
 * Fenêtre au milieu de l'écran pour les messages du serveur : annonce (or), avertissement de la modération (rouge),
 * information (gris). Elle se ferme seule après 10 s, ou avec ✕. Les messages arrivés en même temps attendent leur tour.
 */
import { Players } from "@rbxts/services";
import { reseau, type MessageServeur } from "shared/reseau";
import { COULEURS } from "./kit";
import { tr, trMoteur } from "shared/langue";

const r = reseau();
const file: MessageServeur[] = [];
let ouvert = false;

function afficher(m: MessageServeur) {
	ouvert = true;
	const gui = new Instance("ScreenGui");
	gui.Name = "MessageServeur";
	gui.DisplayOrder = 50;
	gui.ResetOnSpawn = false;
	gui.IgnoreGuiInset = true;
	const cadre = new Instance("Frame");
	cadre.AnchorPoint = new Vector2(0.5, 0.5);
	cadre.Position = UDim2.fromScale(0.5, 0.42);
	cadre.Size = new UDim2(0, 440, 0, 0);
	cadre.AutomaticSize = Enum.AutomaticSize.Y;
	cadre.BackgroundColor3 = COULEURS.fond;
	cadre.BackgroundTransparency = 0.05;
	cadre.Parent = gui;
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 12);
	coin.Parent = cadre;
	const bord = new Instance("UIStroke");
	bord.Thickness = 2;
	bord.Color = m.genre === "avertissement" ? COULEURS.rouge : m.genre === "annonce" ? COULEURS.or : COULEURS.bord;
	bord.Parent = cadre;
	const marge = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight"] as const) marge[k] = new UDim(0, 16);
	marge.Parent = cadre;
	const liste = new Instance("UIListLayout");
	liste.Padding = new UDim(0, 8);
	liste.SortOrder = Enum.SortOrder.LayoutOrder;
	liste.Parent = cadre;
	const ligneTexte = (t: string, taille: number, couleur: Color3, gras: boolean, ordre: number) => {
		const l = new Instance("TextLabel");
		l.Size = new UDim2(1, 0, 0, 0);
		l.AutomaticSize = Enum.AutomaticSize.Y;
		l.BackgroundTransparency = 1;
		l.TextWrapped = true;
		l.TextXAlignment = Enum.TextXAlignment.Left;
		l.Font = gras ? Enum.Font.GothamBold : Enum.Font.Gotham;
		l.TextSize = taille;
		l.TextColor3 = couleur;
		l.Text = t;
		l.LayoutOrder = ordre;
		l.Parent = cadre;
	};
	ligneTexte(trMoteur(m.titre), 19, bord.Color, true, 1);
	ligneTexte(trMoteur(m.texte), 16, COULEURS.texte, false, 2);
	const fermer = new Instance("TextButton");
	fermer.Text = tr("OK");
	fermer.Font = Enum.Font.GothamBold;
	fermer.TextSize = 15;
	fermer.Size = new UDim2(0, 90, 0, 34);
	fermer.BackgroundColor3 = COULEURS.fond2;
	fermer.TextColor3 = COULEURS.texte;
	fermer.LayoutOrder = 3;
	fermer.Parent = cadre;
	gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
	let fini = false;
	const finir = () => {
		if (fini) return;
		fini = true;
		gui.Destroy();
		ouvert = false;
		const suivant = file.shift();
		if (suivant) afficher(suivant);
	};
	fermer.MouseButton1Click.Connect(finir);
	task.delay(10, finir);
}

/** Message affiché seulement chez ce joueur (répliques des soins du Temple…). */
export function messageLocal(m: MessageServeur) {
	if (ouvert) file.push(m);
	else afficher(m);
}

export function ecouterMessages() {
	r.message.OnClientEvent.Connect((m) => {
		if (ouvert) file.push(m);
		else afficher(m);
	});
}
