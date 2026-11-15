/**
 * Fenêtre « ⚙ Réglages » (touche R ou bouton de la barre du haut) : langue, son, affichage, performances.
 * Chaque changement s'applique tout de suite et s'enregistre sur le compte du joueur.
 */
import { Players, TweenService, UserInputService } from "@rbxts/services";
import { LANGUES, langueActuelle, tr, trf } from "shared/langue";
import type { Reglages } from "shared/reglages";
import { changerReglage, reglages, surReglages } from "../reglages";
import { jouer } from "../sons";
import { COULEURS, MOBILE } from "./kit";

let gui: ScreenGui | undefined;
let corps: ScrollingFrame | undefined;
let ouvert = false;

function coin(o: GuiObject, r = 10) {
	const c = new Instance("UICorner");
	c.CornerRadius = new UDim(0, r);
	c.Parent = o;
}
function trait(o: GuiObject, couleur: Color3, e = 1) {
	const s = new Instance("UIStroke");
	s.Color = couleur;
	s.Thickness = e;
	s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
	s.Parent = o;
}
let ordre = 0;
function label(parent: Instance, t: string, taille: number, couleur = COULEURS.texte, gras = false): TextLabel {
	const l = new Instance("TextLabel");
	l.BackgroundTransparency = 1;
	l.Text = t;
	l.RichText = true;
	l.TextWrapped = true;
	l.Font = gras ? Enum.Font.GothamBold : Enum.Font.Gotham;
	l.TextSize = taille;
	l.TextColor3 = couleur;
	l.TextXAlignment = Enum.TextXAlignment.Left;
	l.Size = new UDim2(1, 0, 0, 0);
	l.AutomaticSize = Enum.AutomaticSize.Y;
	l.LayoutOrder = ordre++;
	l.Parent = parent;
	return l;
}
function section(titre: string): Frame {
	const f = new Instance("Frame");
	f.BackgroundColor3 = COULEURS.carte;
	f.Size = new UDim2(1, 0, 0, 0);
	f.AutomaticSize = Enum.AutomaticSize.Y;
	f.LayoutOrder = ordre++;
	coin(f, 12);
	trait(f, COULEURS.bord);
	const m = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight"] as const) m[k] = new UDim(0, 12);
	m.Parent = f;
	const l = new Instance("UIListLayout");
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Padding = new UDim(0, 10);
	l.Parent = f;
	f.Parent = corps;
	label(f, titre, 18, COULEURS.or, true);
	return f;
}

/** Curseur de 0 à 100 % : on clique ou on glisse sur la barre, ou on utilise − et +. */
function curseur(parent: Instance, nom: string, cle: keyof Reglages, min: number, max: number, pas: number, format: (v: number) => string) {
	const ligne = new Instance("Frame");
	ligne.BackgroundTransparency = 1;
	ligne.Size = new UDim2(1, 0, 0, MOBILE ? 44 : 34);
	ligne.LayoutOrder = ordre++;
	ligne.Parent = parent;
	const n = label(ligne, nom, 15);
	n.Size = new UDim2(0.34, 0, 1, 0);
	n.AutomaticSize = Enum.AutomaticSize.None;
	const valeur = () => reglages[cle] as number;
	// mis à jour sur place (pas de redessin : on peut glisser sans lâcher)
	let maj = () => {};
	const mettre = (v: number) => {
		const arrondi = math.clamp(math.floor(v / pas + 0.5) * pas, min, max);
		if (arrondi === valeur()) return;
		changerReglage(cle, arrondi as never);
		maj();
	};
	const bouton = (t: string, x: UDim, delta: number) => {
		const b = new Instance("TextButton");
		b.Text = t;
		b.Font = Enum.Font.GothamBold;
		b.TextSize = 18;
		b.TextColor3 = COULEURS.texte;
		b.BackgroundColor3 = COULEURS.fond2;
		b.Position = new UDim2(x, new UDim(0.5, 0));
		b.AnchorPoint = new Vector2(0, 0.5);
		b.Size = new UDim2(0, MOBILE ? 44 : 32, 0, MOBILE ? 44 : 32);
		coin(b, 16);
		trait(b, COULEURS.bord);
		b.Parent = ligne;
		b.MouseButton1Click.Connect(() => mettre(valeur() + delta));
	};
	bouton("−", new UDim(0.35, 0), -pas);
	const barre = new Instance("TextButton");
	barre.Text = "";
	barre.AutoButtonColor = false;
	barre.BackgroundColor3 = COULEURS.fond;
	barre.AnchorPoint = new Vector2(0, 0.5);
	barre.Position = new UDim2(0.35, MOBILE ? 52 : 40, 0.5, 0);
	barre.Size = new UDim2(0.65, MOBILE ? -170 : -140, 0, 12);
	coin(barre, 6);
	barre.Parent = ligne;
	const plein = new Instance("Frame");
	plein.BorderSizePixel = 0;
	plein.BackgroundColor3 = COULEURS.or;
	plein.Size = UDim2.fromScale((valeur() - min) / (max - min), 1);
	coin(plein, 6);
	plein.Parent = barre;
	const poignee = new Instance("Frame");
	poignee.AnchorPoint = new Vector2(0.5, 0.5);
	poignee.Position = UDim2.fromScale((valeur() - min) / (max - min), 0.5);
	poignee.Size = new UDim2(0, 20, 0, 20);
	poignee.BackgroundColor3 = COULEURS.texte;
	coin(poignee, 10);
	poignee.Parent = barre;
	const depuisX = (x: number) => mettre(min + math.clamp((x - barre.AbsolutePosition.X) / barre.AbsoluteSize.X, 0, 1) * (max - min));
	barre.InputBegan.Connect((i) => {
		if (i.UserInputType === Enum.UserInputType.MouseButton1 || i.UserInputType === Enum.UserInputType.Touch) {
			glisse = depuisX;
			depuisX(i.Position.X);
		}
	});
	bouton("+", new UDim(1, MOBILE ? -96 : -76), pas);
	const v = label(ligne, format(valeur()), 15, COULEURS.or, true);
	v.AnchorPoint = new Vector2(1, 0);
	v.Position = new UDim2(1, 0, 0, 0);
	v.Size = new UDim2(0, 44, 1, 0);
	v.AutomaticSize = Enum.AutomaticSize.None;
	v.TextXAlignment = Enum.TextXAlignment.Right;
	maj = () => {
		const f = (valeur() - min) / (max - min);
		plein.Size = UDim2.fromScale(f, 1);
		poignee.Position = UDim2.fromScale(f, 0.5);
		v.Text = format(valeur());
	};
}

/** Curseur qu'on est en train de glisser (un seul à la fois). */
let glisse: ((x: number) => void) | undefined;
UserInputService.InputChanged.Connect((i) => {
	if (glisse && (i.UserInputType === Enum.UserInputType.MouseMovement || i.UserInputType === Enum.UserInputType.Touch)) glisse(i.Position.X);
});
UserInputService.InputEnded.Connect((i) => {
	if (i.UserInputType === Enum.UserInputType.MouseButton1 || i.UserInputType === Enum.UserInputType.Touch) glisse = undefined;
});

/** Interrupteur oui / non. */
function interrupteur(parent: Instance, nom: string, aide: string, cle: "effetsReduits" | "cosmetiquesAutres" | "compteurImages" | "conseils") {
	const b = new Instance("TextButton");
	b.Text = "";
	b.AutoButtonColor = true;
	b.BackgroundColor3 = COULEURS.fond2;
	b.Size = new UDim2(1, 0, 0, 0);
	b.AutomaticSize = Enum.AutomaticSize.Y;
	b.LayoutOrder = ordre++;
	coin(b, 10);
	b.Parent = parent;
	const m = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft"] as const) m[k] = new UDim(0, 10);
	m.PaddingRight = new UDim(0, 76);
	m.Parent = b;
	const l = new Instance("UIListLayout");
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Parent = b;
	label(b, nom, 15, COULEURS.texte, true);
	label(b, aide, 13, COULEURS.texte2);
	const oui = reglages[cle];
	const fond = new Instance("Frame");
	fond.AnchorPoint = new Vector2(1, 0.5);
	fond.Position = new UDim2(1, 66, 0.5, 0);
	fond.Size = new UDim2(0, 52, 0, 28);
	fond.BackgroundColor3 = oui ? COULEURS.vert : COULEURS.fond;
	coin(fond, 14);
	trait(fond, COULEURS.bord);
	fond.Parent = b;
	const rond = new Instance("Frame");
	rond.AnchorPoint = new Vector2(0.5, 0.5);
	rond.Position = UDim2.fromScale(oui ? 0.73 : 0.27, 0.5);
	rond.Size = new UDim2(0, 22, 0, 22);
	rond.BackgroundColor3 = COULEURS.texte;
	coin(rond, 11);
	rond.Parent = fond;
	b.MouseButton1Click.Connect(() => {
		jouer("clic");
		changerReglage(cle, !reglages[cle]);
		dessiner();
	});
}

function dessiner() {
	if (!corps) return;
	const pos = corps.CanvasPosition;
	for (const e of corps.GetChildren()) if (e.IsA("GuiObject")) e.Destroy();
	ordre = 0;
	// Langue
	const sl = section(`🌐 ${tr("Langue")}`);
	const grille = new Instance("Frame");
	grille.BackgroundTransparency = 1;
	grille.Size = new UDim2(1, 0, 0, 0);
	grille.AutomaticSize = Enum.AutomaticSize.Y;
	grille.LayoutOrder = ordre++;
	grille.Parent = sl;
	const g = new Instance("UIGridLayout");
	g.CellSize = new UDim2(0, MOBILE ? 140 : 150, 0, 48);
	g.CellPadding = new UDim2(0, 8, 0, 8);
	g.SortOrder = Enum.SortOrder.LayoutOrder;
	g.Parent = grille;
	for (const [i, l] of ipairs(LANGUES)) {
		const choisie = langueActuelle() === l.id;
		const b = new Instance("TextButton");
		b.Text = `${l.drapeau}  ${l.nom}`;
		b.Font = choisie ? Enum.Font.GothamBold : Enum.Font.Gotham;
		b.TextSize = 16;
		b.TextColor3 = choisie ? COULEURS.fond : COULEURS.texte;
		b.BackgroundColor3 = choisie ? COULEURS.or : COULEURS.fond2;
		b.LayoutOrder = i;
		coin(b, 12);
		trait(b, choisie ? COULEURS.or : COULEURS.bord);
		b.Parent = grille;
		b.MouseButton1Click.Connect(() => {
			jouer("clic");
			changerReglage("langue", l.id);
		});
	}
	label(sl, tr("Les textes pas encore traduits restent en français. « Proposer mon action » en combat ne comprend que le français."), 13, COULEURS.texte2);

	// Son
	const ss = section(`🔊 ${tr("Son")}`);
	const pct = (v: number) => `${math.floor(v * 100 + 0.5)} %`;
	curseur(ss, tr("Volume général"), "volumeGeneral", 0, 1, 0.05, pct);
	curseur(ss, tr("Musique et ambiance"), "volumeAmbiance", 0, 1, 0.05, pct);
	curseur(ss, tr("Effets sonores"), "volumeEffets", 0, 1, 0.05, pct);
	curseur(ss, tr("Interface"), "volumeInterface", 0, 1, 0.05, pct);

	// Affichage
	const sa = section(`🖥 ${tr("Affichage")}`);
	curseur(sa, tr("Taille du texte"), "tailleTexte", 0.85, 1.3, 0.05, pct);
	interrupteur(sa, tr("Conseils du tutoriel"), tr("La bulle d'aide en bas de l'écran pendant les premières minutes."), "conseils");
	interrupteur(sa, tr("Cosmétiques des autres joueurs"), tr("Voir les auras, capes, titres et traces de pas des autres."), "cosmetiquesAutres");

	// Performances
	const sp = section(`⚡ ${tr("Performances")}`);
	interrupteur(sp, tr("Effets réduits"), tr("Moins de particules (météo, auras des autres, moulins) : utile sur un appareil modeste."), "effetsReduits");
	interrupteur(sp, tr("Compteur d'images par seconde"), tr("Affiche les images par seconde en bas à gauche de l'écran."), "compteurImages");
	label(
		sp,
		trf(
			"<b>60, 144 images par seconde ou plus</b> : c'est Roblox qui les règle, pas le jeu. Ouvre le menu de Roblox ({touche}) → Paramètres → fréquence d'images maximale, si ton appareil le permet. Le compteur ci-dessus montre la valeur réelle.",
			{ touche: MOBILE ? tr("bouton Roblox en haut à gauche") : tr("touche Échap") },
		),
		13,
		COULEURS.texte2,
	);
	label(corps!, tr("Les réglages sont enregistrés sur ton compte : tu les retrouves sur tous tes appareils."), 12, COULEURS.texte2);
	task.defer(() => {
		if (corps) corps.CanvasPosition = pos;
	});
}

function construire() {
	gui = new Instance("ScreenGui");
	gui.Name = "Reglages";
	gui.DisplayOrder = 36;
	gui.ResetOnSpawn = false;
	gui.IgnoreGuiInset = true;
	const voile = new Instance("TextButton");
	voile.Text = "";
	voile.AutoButtonColor = false;
	voile.Modal = true;
	voile.BackgroundColor3 = new Color3(0, 0, 0);
	voile.BackgroundTransparency = 0.5;
	voile.Size = UDim2.fromScale(1, 1);
	voile.Parent = gui;
	voile.MouseButton1Click.Connect(fermerReglages);
	const f = new Instance("Frame");
	f.AnchorPoint = new Vector2(0.5, 0.5);
	f.Position = UDim2.fromScale(0.5, 0.5);
	f.Size = MOBILE ? UDim2.fromScale(0.96, 0.92) : new UDim2(0, 640, 0.86, 0);
	f.BackgroundColor3 = COULEURS.fond;
	f.Active = true;
	coin(f, 16);
	trait(f, COULEURS.or, 2);
	f.Parent = gui;
	const echelle = new Instance("UIScale");
	echelle.Scale = 0.94;
	echelle.Parent = f;
	TweenService.Create(echelle, new TweenInfo(0.18, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale: 1 }).Play();
	const titre = label(f, `⚙ ${tr("Réglages")}`, 24, COULEURS.or, true);
	titre.Font = Enum.Font.Garamond;
	titre.Position = new UDim2(0, 16, 0, 12);
	titre.Size = new UDim2(1, -80, 0, 34);
	titre.AutomaticSize = Enum.AutomaticSize.None;
	const x = new Instance("TextButton");
	x.Text = "✕";
	x.Font = Enum.Font.GothamBold;
	x.TextSize = 20;
	x.TextColor3 = COULEURS.texte;
	x.BackgroundColor3 = COULEURS.fond2;
	x.AnchorPoint = new Vector2(1, 0);
	x.Position = new UDim2(1, -10, 0, 8);
	x.Size = new UDim2(0, 44, 0, 44);
	coin(x, 22);
	trait(x, COULEURS.bord);
	x.Parent = f;
	x.MouseButton1Click.Connect(fermerReglages);
	corps = new Instance("ScrollingFrame");
	corps.BackgroundTransparency = 1;
	corps.BorderSizePixel = 0;
	corps.Position = new UDim2(0, 12, 0, 60);
	corps.Size = new UDim2(1, -24, 1, -72);
	corps.CanvasSize = new UDim2();
	corps.AutomaticCanvasSize = Enum.AutomaticSize.Y;
	corps.ScrollBarThickness = 5;
	corps.ScrollBarImageColor3 = COULEURS.or;
	corps.Parent = f;
	const l = new Instance("UIListLayout");
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Padding = new UDim(0, 12);
	l.Parent = corps;
	const m = new Instance("UIPadding");
	m.PaddingRight = new UDim(0, 8);
	m.PaddingBottom = new UDim(0, 8);
	m.Parent = corps;
	gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
}

export function ouvrirReglages() {
	if (ouvert) return;
	ouvert = true;
	construire();
	dessiner();
}

export function fermerReglages() {
	ouvert = false;
	gui?.Destroy();
	gui = undefined;
	corps = undefined;
}

export function preparerFenetreReglages() {
	// une autre langue : on reconstruit la fenêtre (titre compris)
	let langue = langueActuelle();
	surReglages(() => {
		if (langue === langueActuelle()) return;
		langue = langueActuelle();
		if (!ouvert) return;
		fermerReglages();
		ouvrirReglages();
	});
	UserInputService.InputBegan.Connect((entree, traite) => {
		if (traite) return;
		if (entree.KeyCode === Enum.KeyCode.Escape && ouvert) fermerReglages();
	});
}
