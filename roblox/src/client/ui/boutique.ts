/**
 * Fenêtre de la boutique en Robux (cosmétiques seulement) : touche B ou bouton « 🛍 Boutique » de la barre du haut.
 *  - onglets par catégorie + « Ma collection » (ce qu'on porte, ce qu'on possède) ;
 *  - cartes aux couleurs de la rareté (bordure animée pour les épiques et légendaires), prix réel lu sur Roblox ;
 *  - panneau de détail : grand aperçu, couleurs, contenu d'un pack, Acheter / Porter / Retirer / Lancer ;
 *  - « Essayer » : l'effet est posé sur ton personnage, chez toi seulement, pendant 10 secondes.
 * Le serveur décide de tout (shared/boutique.ts, server/boutique.ts) : la fenêtre n'accorde jamais rien elle-même.
 */
import { MarketplaceService, Players, TweenService, UserInputService } from "@rbxts/services";
import {
	ARTICLES,
	CATEGORIES,
	EMPLACEMENTS,
	RARETES,
	article,
	type ArticleBoutique,
	type Categorie,
	type CommandeBoutique,
	type Emplacement,
	type EtatBoutique,
} from "shared/boutique";
import { masquerCosmetiques, poserCosmetiques, retirerCosmetiques } from "shared/cosmetiques3d";
import { reseau } from "shared/reseau";
import { jouer } from "../sons";
import { COULEURS, MOBILE } from "./kit";
import { messageLocal } from "./messages";
import { tr, trf, tx } from "shared/langue";

const r = reseau();
const joueur = Players.LocalPlayer;

type Onglet = Categorie | "collection";
const etat = {
	ouvert: false,
	onglet: "pack" as Onglet,
	choisi: undefined as string | undefined,
	/** Sur téléphone : le détail remplace la grille. */
	detailMobile: false,
	boutique: undefined as EtatBoutique | undefined,
	info: undefined as { texte: string; couleur: Color3 } | undefined,
	essai: undefined as { id: string; fin: number } | undefined,
};

const NOMS_EMPLACEMENTS: Record<Emplacement, string> = { aura: tx("Aura"), cape: tx("Cape"), titre: tx("Titre"), trace: tx("Traces de pas"), sorts: tx("Effets de sorts") };

// ───────────────────────────── Prix (lus sur Roblox) ─────────────────────────────

const prix = new Map<string, number | false>();
let prixCharges = false;
function chargerPrix() {
	if (prixCharges) return;
	prixCharges = true;
	task.spawn(() => {
		for (const a of ARTICLES) {
			if (a.achat.numero === 0) continue;
			const [ok, info] = pcall(() => MarketplaceService.GetProductInfo(a.achat.numero, a.achat.type === "pass" ? Enum.InfoType.GamePass : Enum.InfoType.Product));
			const p = ok ? (info as unknown as { PriceInRobux?: number }).PriceInRobux : undefined;
			prix.set(a.id, p !== undefined ? p : false);
		}
		if (etat.ouvert) dessiner();
	});
}

function textePrix(a: ArticleBoutique): string {
	if (a.achat.numero === 0) return tr("Bientôt");
	const p = prix.get(a.id);
	if (p === undefined) return "…";
	if (p === false) return "Indisponible";
	return `R$ ${p}`;
}

// ───────────────────────────── Petits outils de dessin ─────────────────────────────

function coin(o: GuiObject, r = 10) {
	const c = new Instance("UICorner");
	c.CornerRadius = new UDim(0, r);
	c.Parent = o;
}
function trait(o: GuiObject, couleur: Color3, epaisseur = 1): UIStroke {
	const s = new Instance("UIStroke");
	s.Color = couleur;
	s.Thickness = epaisseur;
	s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
	s.Parent = o;
	return s;
}
function marge(o: GuiObject, px: number) {
	const p = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight"] as const) p[k] = new UDim(0, px);
	p.Parent = o;
}
function degrade(o: GuiObject, haut: Color3, bas: Color3, rotation = 90) {
	const g = new Instance("UIGradient");
	g.Color = new ColorSequence(haut, bas);
	g.Rotation = rotation;
	g.Parent = o;
	return g;
}
function label(parent: Instance, t: string, taille: number, couleur = COULEURS.texte, gras = false, ordre = 0): TextLabel {
	const l = new Instance("TextLabel");
	l.BackgroundTransparency = 1;
	l.Text = t;
	l.RichText = true;
	l.TextWrapped = true;
	l.Font = gras ? Enum.Font.GothamBold : Enum.Font.Gotham;
	l.TextSize = MOBILE ? math.max(13, taille) : taille;
	l.TextColor3 = couleur;
	l.TextXAlignment = Enum.TextXAlignment.Left;
	l.Size = new UDim2(1, 0, 0, 0);
	l.AutomaticSize = Enum.AutomaticSize.Y;
	l.LayoutOrder = ordre;
	l.Parent = parent;
	return l;
}
function pile(o: GuiObject, espace: number, horizontal = false): UIListLayout {
	const l = new Instance("UIListLayout");
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Padding = new UDim(0, espace);
	if (horizontal) {
		l.FillDirection = Enum.FillDirection.Horizontal;
		l.VerticalAlignment = Enum.VerticalAlignment.Center;
	}
	l.Parent = o;
	return l;
}
/** Bouton arrondi : "or" (principal), "vert" (acheter), "sombre". */
function btn(parent: Instance, t: string, genre: "or" | "vert" | "sombre" | "rouge", surClic: (() => void) | undefined, ordre = 0, largeur = new UDim(1, 0)): TextButton {
	const b = new Instance("TextButton");
	b.Text = t;
	b.RichText = true;
	b.Font = Enum.Font.GothamBold;
	b.TextSize = MOBILE ? 16 : 15;
	b.Size = new UDim2(largeur, new UDim(0, MOBILE ? 46 : 40));
	b.LayoutOrder = ordre;
	b.AutoButtonColor = surClic !== undefined;
	const fonds = { or: COULEURS.or, vert: Color3.fromRGB(70, 160, 85), sombre: COULEURS.fond2, rouge: Color3.fromRGB(150, 60, 50) };
	b.BackgroundColor3 = fonds[genre];
	b.BackgroundTransparency = surClic ? 0 : 0.5;
	b.TextColor3 = genre === "or" ? COULEURS.fond : COULEURS.texte;
	coin(b, 10);
	if (genre === "sombre") trait(b, COULEURS.bord);
	else degrade(b, new Color3(1, 1, 1), Color3.fromRGB(190, 190, 190));
	if (surClic) b.MouseButton1Click.Connect(() => {
		jouer("clic");
		surClic();
	});
	b.Parent = parent;
	return b;
}

/** Bordure qui tourne doucement (épique, légendaire). */
function bordureAnimee(s: UIStroke, couleur: Color3) {
	const g = new Instance("UIGradient");
	g.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, couleur),
		new ColorSequenceKeypoint(0.45, couleur),
		new ColorSequenceKeypoint(0.5, new Color3(1, 1, 1)),
		new ColorSequenceKeypoint(0.55, couleur),
		new ColorSequenceKeypoint(1, couleur),
	]);
	g.Parent = s;
	TweenService.Create(g, new TweenInfo(3, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1), { Rotation: 360 }).Play();
}

// ───────────────────────────── État d'un article ─────────────────────────────

function possede(id: string): boolean {
	return etat.boutique?.possedes.includes(id) ?? false;
}
function porte(a: ArticleBoutique): boolean {
	return a.categorie !== "fete" && a.categorie !== "pack" && etat.boutique?.equipes[a.categorie as Emplacement] === a.id;
}
function charges(a: ArticleBoutique): number {
	return etat.boutique?.charges[a.id] ?? 0;
}
function lancementLibre(a: ArticleBoutique): boolean {
	return (etat.boutique?.proprietaire ?? false) || (possede(a.id) && a.charges !== undefined && charges(a) === 0 && etat.boutique?.studio === true);
}

function commande(c: CommandeBoutique) {
	task.spawn(() => {
		const [ok, rep] = pcall(() => r.boutique.InvokeServer(c));
		if (!ok) etat.info = { texte: tr("La boutique ne répond pas, réessaie."), couleur: COULEURS.rouge };
		else if (!rep.ok) etat.info = { texte: rep.erreur ?? tr("Refusé."), couleur: COULEURS.rouge };
		else if (rep.info !== undefined) etat.info = { texte: rep.info, couleur: COULEURS.texte2 };
		if (etat.ouvert) dessiner();
	});
}

function acheter(a: ArticleBoutique) {
	if (a.achat.numero === 0) return;
	if (a.achat.type === "pass") MarketplaceService.PromptGamePassPurchase(joueur, a.achat.numero);
	else MarketplaceService.PromptProductPurchase(joueur, a.achat.numero);
}

// ───────────────────────────── Essayer (chez soi seulement) ─────────────────────────────

function finirEssai() {
	const perso = joueur.Character;
	if (perso) {
		retirerCosmetiques(perso, "EssaiCosmetique");
		masquerCosmetiques(perso, false);
	}
	etat.essai = undefined;
	barreEssai?.Destroy();
	barreEssai = undefined;
}

let barreEssai: Frame | undefined;
function essayer(a: ArticleBoutique) {
	const perso = joueur.Character;
	if (!perso || a.categorie === "fete" || a.categorie === "pack" || a.categorie === "sorts") return;
	finirEssai();
	const equipes = { ...(etat.boutique?.equipes ?? {}) };
	equipes[a.categorie as Emplacement] = a.id;
	masquerCosmetiques(perso, true);
	poserCosmetiques(perso, equipes, "EssaiCosmetique");
	etat.essai = { id: a.id, fin: os.clock() + 10 };
	fermer();
	// petite barre en haut : compte à rebours et retour à la boutique
	barreEssai = new Instance("Frame");
	barreEssai.AnchorPoint = new Vector2(0.5, 0);
	barreEssai.Position = new UDim2(0.5, 0, 0, 64);
	barreEssai.Size = new UDim2(0, 0, 0, 0);
	barreEssai.AutomaticSize = Enum.AutomaticSize.XY;
	barreEssai.BackgroundColor3 = COULEURS.fond;
	barreEssai.BackgroundTransparency = 0.1;
	coin(barreEssai, 12);
	trait(barreEssai, RARETES[a.rarete].couleur, 2);
	marge(barreEssai, 10);
	pile(barreEssai, 10, true);
	const t = label(barreEssai, "", 15, COULEURS.texte, true, 1);
	t.Size = new UDim2(0, 0, 0, 0);
	t.AutomaticSize = Enum.AutomaticSize.XY;
	t.TextWrapped = false;
	btn(barreEssai, tr("Retour à la boutique"), "or", () => {
		finirEssai();
		ouvrirBoutique(a.id);
	}, 2, new UDim(0, 190));
	barreEssai.Parent = ecran();
	task.spawn(() => {
		const id = a.id;
		while (etat.essai?.id === id) {
			const reste = math.ceil(etat.essai.fin - os.clock());
			if (reste <= 0) {
				finirEssai();
				break;
			}
			t.Text = trf("👁 Essai : {icone} {nom} — {reste} s (tourne la caméra pour te voir)", { icone: a.icone, nom: tr(a.nom), reste });
			task.wait(0.25);
		}
	});
}

// ───────────────────────────── Fenêtre ─────────────────────────────

let gui: ScreenGui | undefined;
let fenetre: Frame | undefined;
let corps: Frame | undefined;
let defilementGrille = new Vector2();

function ecran(): ScreenGui {
	if (gui) return gui;
	gui = new Instance("ScreenGui");
	gui.Name = "Boutique";
	gui.DisplayOrder = 35;
	gui.ResetOnSpawn = false;
	gui.IgnoreGuiInset = true;
	gui.Parent = joueur.WaitForChild("PlayerGui");
	return gui;
}

function construireFenetre() {
	const g = ecran();
	// voile sombre : un clic à côté ferme la fenêtre ; Modal libère la souris
	const voile = new Instance("TextButton");
	voile.Name = "Voile";
	voile.Text = "";
	voile.AutoButtonColor = false;
	voile.Modal = true;
	voile.BackgroundColor3 = new Color3(0, 0, 0);
	voile.BackgroundTransparency = 1;
	voile.Size = UDim2.fromScale(1, 1);
	voile.Parent = g;
	voile.MouseButton1Click.Connect(fermer);
	TweenService.Create(voile, new TweenInfo(0.2), { BackgroundTransparency: 0.45 }).Play();

	fenetre = new Instance("Frame");
	fenetre.Name = "Fenetre";
	fenetre.AnchorPoint = new Vector2(0.5, 0.5);
	fenetre.Position = UDim2.fromScale(0.5, 0.5);
	fenetre.Size = MOBILE ? UDim2.fromScale(0.96, 0.92) : UDim2.fromScale(0.82, 0.84);
	fenetre.BackgroundColor3 = COULEURS.fond;
	fenetre.Active = true;
	coin(fenetre, 16);
	const bord = trait(fenetre, COULEURS.or, 2);
	bordureAnimee(bord, COULEURS.or);
	const limite = new Instance("UISizeConstraint");
	limite.MaxSize = new Vector2(1040, 680);
	limite.Parent = fenetre;
	fenetre.Parent = g;
	// apparition : léger zoom
	const echelle = new Instance("UIScale");
	echelle.Scale = 0.94;
	echelle.Parent = fenetre;
	TweenService.Create(echelle, new TweenInfo(0.18, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale: 1 }).Play();

	// en-tête
	const tete = new Instance("Frame");
	tete.Name = "Entete";
	tete.Size = new UDim2(1, 0, 0, MOBILE ? 58 : 70);
	tete.BackgroundColor3 = new Color3(1, 1, 1);
	coin(tete, 16);
	degrade(tete, Color3.fromRGB(70, 30, 85), Color3.fromRGB(35, 22, 12), 0);
	tete.Parent = fenetre;
	marge(tete, 12);
	const titre = label(tete, tr("✦ Boutique de Velmaris ✦"), MOBILE ? 20 : 26, COULEURS.or, true);
	titre.Font = Enum.Font.Garamond;
	titre.Size = new UDim2(1, -60, 0, 0);
	if (!MOBILE) {
		const sous = label(tete, tr("Des cosmétiques seulement : rien ne rend plus fort, tout rend plus beau."), 13, COULEURS.texte2);
		sous.Position = new UDim2(0, 0, 0, 32);
		sous.Size = new UDim2(1, -60, 0, 0);
	}
	const x = new Instance("TextButton");
	x.Text = "✕";
	x.Font = Enum.Font.GothamBold;
	x.TextSize = 20;
	x.TextColor3 = COULEURS.texte;
	x.BackgroundColor3 = COULEURS.fond2;
	x.AnchorPoint = new Vector2(1, 0.5);
	x.Position = new UDim2(1, 0, 0.5, 0);
	x.Size = new UDim2(0, 44, 0, 44);
	coin(x, 22);
	trait(x, COULEURS.bord);
	x.Parent = tete;
	x.MouseButton1Click.Connect(fermer);

	corps = new Instance("Frame");
	corps.Name = "Corps";
	corps.BackgroundTransparency = 1;
	corps.Position = new UDim2(0, 0, 0, MOBILE ? 58 : 70);
	corps.Size = new UDim2(1, 0, 1, MOBILE ? -58 : -70);
	corps.Parent = fenetre;
	marge(corps, 12);
}

/** Onglets en haut du corps. */
function dessinerOnglets(parent: Frame) {
	const barre = new Instance("ScrollingFrame");
	barre.Name = "Onglets";
	barre.BackgroundTransparency = 1;
	barre.BorderSizePixel = 0;
	barre.Size = new UDim2(1, 0, 0, MOBILE ? 50 : 42);
	barre.CanvasSize = new UDim2();
	barre.AutomaticCanvasSize = Enum.AutomaticSize.X;
	barre.ScrollingDirection = Enum.ScrollingDirection.X;
	barre.ScrollBarThickness = MOBILE ? 0 : 4;
	barre.Parent = parent;
	pile(barre, 6, true);
	const onglets: [Onglet, string][] = CATEGORIES.map((c) => [c.id, `${c.icone} ${tr(c.nom)}`]);
	onglets.push(["collection", tr("🎒 Ma collection")]);
	let i = 0;
	for (const [id, nom] of onglets) {
		const choisi = etat.onglet === id;
		const b = new Instance("TextButton");
		b.Text = nom;
		b.Font = choisi ? Enum.Font.GothamBold : Enum.Font.Gotham;
		b.TextSize = MOBILE ? 15 : 14;
		b.TextColor3 = choisi ? COULEURS.fond : COULEURS.texte;
		b.BackgroundColor3 = choisi ? COULEURS.or : COULEURS.fond2;
		b.Size = new UDim2(0, 0, 1, -6);
		b.AutomaticSize = Enum.AutomaticSize.X;
		b.LayoutOrder = i++;
		coin(b, 18);
		trait(b, choisi ? COULEURS.or : COULEURS.bord);
		const m = new Instance("UIPadding");
		m.PaddingLeft = new UDim(0, 14);
		m.PaddingRight = new UDim(0, 14);
		m.Parent = b;
		b.Parent = barre;
		b.MouseButton1Click.Connect(() => {
			etat.onglet = id;
			etat.detailMobile = false;
			defilementGrille = new Vector2();
			const premier = id === "collection" ? undefined : ARTICLES.find((a) => a.categorie === id);
			if (premier) etat.choisi = premier.id;
			jouer("clic");
			dessiner();
		});
	}
}

/** Pastille de prix ou d'état en bas d'une carte. */
function pastille(parent: Instance, a: ArticleBoutique) {
	let t: string;
	let fond: Color3;
	let texteCouleur = COULEURS.texte;
	if (a.categorie === "fete") {
		const n = charges(a);
		if (etat.boutique?.proprietaire) [t, fond] = [tr("∞ illimité"), COULEURS.choisi];
		else if (n > 0) [t, fond] = [trf("×{n} restantes", { n }), Color3.fromRGB(60, 120, 70)];
		else [t, fond] = [textePrix(a), COULEURS.fond2];
	} else if (porte(a)) {
		[t, fond] = [tr("★ Porté"), COULEURS.or];
		texteCouleur = COULEURS.fond;
	} else if (possede(a.id)) [t, fond] = [tr("✓ Possédé"), Color3.fromRGB(60, 120, 70)];
	else [t, fond] = [textePrix(a), a.achat.numero === 0 ? COULEURS.fond2 : Color3.fromRGB(45, 95, 55)];
	const p = new Instance("TextLabel");
	p.Text = t;
	p.Font = Enum.Font.GothamBold;
	p.TextSize = 14;
	p.TextColor3 = texteCouleur;
	p.BackgroundColor3 = fond;
	p.AnchorPoint = new Vector2(0.5, 1);
	p.Position = new UDim2(0.5, 0, 1, -8);
	p.Size = new UDim2(1, -16, 0, 26);
	coin(p, 13);
	p.Parent = parent;
}

function carteArticle(parent: Instance, a: ArticleBoutique, ordre: number) {
	const rarete = RARETES[a.rarete];
	const choisi = etat.choisi === a.id;
	const b = new Instance("TextButton");
	b.Name = a.id;
	b.Text = "";
	b.AutoButtonColor = false;
	b.BackgroundColor3 = COULEURS.carte;
	b.LayoutOrder = ordre;
	coin(b, 14);
	const s = trait(b, choisi ? COULEURS.or : rarete.couleur, choisi ? 3 : 1.5);
	if (a.rarete === "epique" || a.rarete === "legendaire") bordureAnimee(s, choisi ? COULEURS.or : rarete.couleur);
	b.Parent = parent;
	// haut : dégradé de la rareté et grand pictogramme
	const haut = new Instance("Frame");
	haut.BackgroundColor3 = new Color3(1, 1, 1);
	haut.Size = new UDim2(1, 0, 0.55, 0);
	coin(haut, 14);
	degrade(haut, rarete.couleur, COULEURS.carte);
	haut.Parent = b;
	const halo = new Instance("Frame");
	halo.AnchorPoint = new Vector2(0.5, 0.5);
	halo.Position = UDim2.fromScale(0.5, 0.55);
	halo.Size = new UDim2(0, 64, 0, 64);
	halo.BackgroundColor3 = a.couleurs[0];
	halo.BackgroundTransparency = 0.7;
	coin(halo, 32);
	halo.Parent = haut;
	const icone = new Instance("TextLabel");
	icone.BackgroundTransparency = 1;
	icone.Text = a.icone;
	icone.TextSize = MOBILE ? 40 : 46;
	icone.Font = Enum.Font.GothamBold;
	icone.TextColor3 = COULEURS.texte;
	icone.Size = UDim2.fromScale(1, 1);
	icone.Position = UDim2.fromScale(0, 0.05);
	icone.Parent = haut;
	// étiquette de rareté
	const r = new Instance("TextLabel");
	r.Text = tr(rarete.nom);
	r.Font = Enum.Font.GothamBold;
	r.TextSize = 11;
	r.TextColor3 = COULEURS.fond;
	r.BackgroundColor3 = rarete.couleur;
	r.Position = new UDim2(0, 8, 0, 8);
	r.Size = new UDim2(0, 0, 0, 18);
	r.AutomaticSize = Enum.AutomaticSize.X;
	coin(r, 9);
	const mr = new Instance("UIPadding");
	mr.PaddingLeft = new UDim(0, 7);
	mr.PaddingRight = new UDim(0, 7);
	mr.Parent = r;
	r.Parent = b;
	// nom
	const nom = new Instance("TextLabel");
	nom.BackgroundTransparency = 1;
	nom.Text = tr(a.nom);
	nom.Font = Enum.Font.GothamBold;
	nom.TextSize = MOBILE ? 14 : 15;
	nom.TextWrapped = true;
	nom.TextColor3 = choisi ? COULEURS.or : COULEURS.texte;
	nom.Position = new UDim2(0, 8, 0.56, 0);
	nom.Size = new UDim2(1, -16, 0.44, -42);
	nom.TextYAlignment = Enum.TextYAlignment.Top;
	nom.Parent = b;
	pastille(b, a);
	// survol : la carte grandit un peu
	const e = new Instance("UIScale");
	e.Parent = b;
	b.MouseEnter.Connect(() => TweenService.Create(e, new TweenInfo(0.12), { Scale: 1.04 }).Play());
	b.MouseLeave.Connect(() => TweenService.Create(e, new TweenInfo(0.12), { Scale: 1 }).Play());
	b.MouseButton1Click.Connect(() => {
		etat.choisi = a.id;
		etat.info = undefined;
		if (MOBILE) etat.detailMobile = true;
		jouer("clic");
		dessiner();
	});
}

function grille(parent: Instance, articles: ArticleBoutique[], ordre: number, hauteur?: UDim): ScrollingFrame {
	const g = new Instance("ScrollingFrame");
	g.Name = "Grille";
	g.BackgroundTransparency = 1;
	g.BorderSizePixel = 0;
	g.LayoutOrder = ordre;
	g.Size = new UDim2(new UDim(1, 0), hauteur ?? new UDim(1, 0));
	g.CanvasSize = new UDim2();
	g.AutomaticCanvasSize = Enum.AutomaticSize.Y;
	g.ScrollingDirection = Enum.ScrollingDirection.Y;
	g.ScrollBarThickness = 5;
	g.ScrollBarImageColor3 = COULEURS.or;
	g.Parent = parent;
	const m = new Instance("UIPadding");
	m.PaddingTop = new UDim(0, 6);
	m.PaddingLeft = new UDim(0, 6);
	m.PaddingRight = new UDim(0, 10);
	m.PaddingBottom = new UDim(0, 6);
	m.Parent = g;
	const l = new Instance("UIGridLayout");
	l.CellSize = MOBILE ? new UDim2(0, 138, 0, 186) : new UDim2(0, 162, 0, 206);
	l.CellPadding = new UDim2(0, 12, 0, 12);
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Parent = g;
	let i = 0;
	for (const a of articles) carteArticle(g, a, i++);
	return g;
}

/** Panneau de détail de l'article choisi. */
function detail(parent: Instance, a: ArticleBoutique) {
	const rarete = RARETES[a.rarete];
	const p = new Instance("ScrollingFrame");
	p.Name = "Detail";
	p.BackgroundColor3 = COULEURS.fond2;
	p.BorderSizePixel = 0;
	p.CanvasSize = new UDim2();
	p.AutomaticCanvasSize = Enum.AutomaticSize.Y;
	p.ScrollBarThickness = 4;
	p.ScrollBarImageColor3 = COULEURS.or;
	coin(p, 14);
	trait(p, rarete.couleur, 1.5);
	p.Parent = parent;
	const c = new Instance("Frame");
	c.BackgroundTransparency = 1;
	c.Size = new UDim2(1, 0, 0, 0);
	c.AutomaticSize = Enum.AutomaticSize.Y;
	c.Parent = p;
	marge(c, 14);
	pile(c, 10);
	let o = 0;
	if (MOBILE) btn(c, tr("← Retour aux articles"), "sombre", () => ((etat.detailMobile = false), dessiner()), o++, new UDim(0, 220));

	// grand aperçu : dégradé, cercle qui « respire », pictogramme
	const apercu = new Instance("Frame");
	apercu.BackgroundColor3 = new Color3(1, 1, 1);
	apercu.Size = new UDim2(1, 0, 0, MOBILE ? 140 : 170);
	apercu.LayoutOrder = o++;
	apercu.ClipsDescendants = true;
	coin(apercu, 12);
	degrade(apercu, rarete.couleur, COULEURS.fond, 90);
	apercu.Parent = c;
	const rond = new Instance("Frame");
	rond.AnchorPoint = new Vector2(0.5, 0.5);
	rond.Position = UDim2.fromScale(0.5, 0.5);
	rond.Size = new UDim2(0, 110, 0, 110);
	rond.BackgroundColor3 = a.couleurs[0];
	rond.BackgroundTransparency = 0.75;
	coin(rond, 55);
	rond.Parent = apercu;
	TweenService.Create(rond, new TweenInfo(1.6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), { Size: new UDim2(0, 136, 0, 136), BackgroundTransparency: 0.55 }).Play();
	const ic = new Instance("TextLabel");
	ic.BackgroundTransparency = 1;
	ic.Text = a.icone;
	ic.TextSize = 72;
	ic.Font = Enum.Font.GothamBold;
	ic.TextColor3 = COULEURS.texte;
	ic.Size = UDim2.fromScale(1, 1);
	ic.Parent = apercu;
	// petites étincelles qui montent
	for (let k = 0; k < 6; k++) {
		const e = new Instance("Frame");
		e.BackgroundColor3 = a.couleurs[k % a.couleurs.size()];
		e.Size = new UDim2(0, 5, 0, 5);
		e.Position = UDim2.fromScale(0.15 + 0.14 * k, 1.05);
		coin(e, 3);
		e.Parent = apercu;
		task.delay(k * 0.4, () => {
			if (e.Parent) TweenService.Create(e, new TweenInfo(2.4, Enum.EasingStyle.Sine, Enum.EasingDirection.Out, -1), { Position: UDim2.fromScale(0.15 + 0.14 * k, -0.05), BackgroundTransparency: 1 }).Play();
		});
	}

	label(c, tr(a.nom), 22, COULEURS.texte, true, o++).Font = Enum.Font.Garamond;
	const cat = CATEGORIES.find((x) => x.id === a.categorie);
	label(c, trf("<font color=\"#{v}\"><b>{nom}</b></font>  ·  {v2} {v3}", { v: rarete.couleur.ToHex(), nom: tr(rarete.nom), v2: cat?.icone ?? "", v3: tr(cat?.nom ?? "") }), 14, COULEURS.texte2, false, o++);
	label(c, tr(a.description), 15, COULEURS.texte, false, o++);

	// pastilles de couleur
	const nuancier = new Instance("Frame");
	nuancier.BackgroundTransparency = 1;
	nuancier.Size = new UDim2(1, 0, 0, 20);
	nuancier.LayoutOrder = o++;
	nuancier.Parent = c;
	pile(nuancier, 6, true);
	for (const couleur of a.couleurs) {
		const d = new Instance("Frame");
		d.BackgroundColor3 = couleur;
		d.Size = new UDim2(0, 18, 0, 18);
		coin(d, 9);
		trait(d, COULEURS.fond);
		d.Parent = nuancier;
	}

	// contenu d'un pack
	if (a.contenu) {
		label(c, tr("<b>Contient :</b>"), 14, COULEURS.or, false, o++);
		for (const id of a.contenu) {
			const x = article(id);
			if (x) label(c, trf("{icone}  {nom}  <font color=\"#{v}\">({nom2})</font>", { icone: x.icone, nom: tr(x.nom), v: RARETES[x.rarete].couleur.ToHex(), nom2: tr(RARETES[x.rarete].nom) }), 14, COULEURS.texte, false, o++);
		}
	}

	// boutons
	const b = etat.boutique;
	const prop = b?.proprietaire ?? false;
	if (a.categorie === "fete") {
		const n = charges(a);
		label(c, prop ? tr("👑 Propriétaire : illimité.") : trf("Utilisations restantes : <b>{n}</b>", { n }), 14, COULEURS.texte2, false, o++);
		if (prop || n > 0 || lancementLibre(a)) btn(c, trf("{icone} Lancer maintenant", { icone: a.icone }), "or", () => {
			commande({ type: "utiliser", id: a.id });
			fermer();
		}, o++);
	} else if (a.categorie === "pack") {
		if (possede(a.id)) label(c, tr("✓ Tu possèdes ce pack : ses articles sont dans « Ma collection »."), 14, COULEURS.vert, false, o++);
	} else if (possede(a.id)) {
		if (porte(a)) btn(c, tr("Retirer"), "sombre", () => commande({ type: "retirer", emplacement: a.categorie as Emplacement }), o++);
		else btn(c, tr("★ Porter"), "or", () => commande({ type: "equiper", id: a.id }), o++);
	}
	const aAcheter = a.categorie === "fete" ? !prop : !possede(a.id);
	if (aAcheter) {
		if (a.achat.numero !== 0) btn(c, trf("Acheter — {textePrix}", { textePrix: textePrix(a) }), "vert", () => acheter(a), o++);
		else {
			btn(c, tr("Bientôt en vente"), "sombre", undefined, o++);
			if (b?.studio) btn(c, tr("🧪 Essai Studio (gratuit, non gardé)"), "sombre", () => commande({ type: "essai_studio", id: a.id }), o++);
		}
	}
	if (a.categorie === "sorts") label(c, tr("🔮 Se voit en combat, sur tes sorts et tes flèches."), 13, COULEURS.texte2, false, o++);
	else if (a.categorie !== "fete" && a.categorie !== "pack") btn(c, tr("👁 Essayer 10 secondes"), "sombre", () => essayer(a), o++);
	if (etat.info) label(c, etat.info.texte, 14, etat.info.couleur, true, o++);
	label(c, tr("Achat sécurisé par Roblox. Les cosmétiques ne donnent aucun avantage en jeu."), 12, COULEURS.texte2, false, o++);
}

/** Onglet « Ma collection » : ce que je porte, puis ce que je possède. */
function collection(parent: Frame) {
	const zone = new Instance("Frame");
	zone.BackgroundTransparency = 1;
	zone.Size = UDim2.fromScale(1, 1);
	zone.Parent = parent;
	pile(zone, 10);
	label(zone, tr("<b>Porté en ce moment</b>"), 16, COULEURS.or, false, 1);
	const rang = new Instance("Frame");
	rang.BackgroundTransparency = 1;
	rang.Size = new UDim2(1, 0, 0, MOBILE ? 92 : 84);
	rang.LayoutOrder = 2;
	rang.Parent = zone;
	const lr = pile(rang, 8, true);
	lr.Wraps = MOBILE;
	for (const emp of EMPLACEMENTS) {
		const id = etat.boutique?.equipes[emp];
		const a = id !== undefined ? article(id) : undefined;
		const f = new Instance("TextButton");
		f.Text = "";
		f.AutoButtonColor = a !== undefined;
		f.BackgroundColor3 = a ? COULEURS.choisi : COULEURS.fond2;
		f.Size = new UDim2(0.2, -7, 1, 0);
		coin(f, 12);
		trait(f, a ? RARETES[a.rarete].couleur : COULEURS.bord, a ? 2 : 1);
		f.Parent = rang;
		marge(f, 6);
		pile(f, 2);
		const t1 = label(f, a ? a.icone : "—", 24, COULEURS.texte, true, 1);
		t1.TextXAlignment = Enum.TextXAlignment.Center;
		const t2 = label(f, `<b>${tr(NOMS_EMPLACEMENTS[emp])}</b>${a ? `\n${tr(a.nom)}` : ""}`, 11, a ? COULEURS.texte : COULEURS.texte2, false, 2);
		t2.TextXAlignment = Enum.TextXAlignment.Center;
		if (a) f.MouseButton1Click.Connect(() => {
			etat.choisi = a.id;
			if (MOBILE) etat.detailMobile = true;
			dessiner();
		});
	}
	const mes = ARTICLES.filter((a) => possede(a.id) || (a.categorie === "fete" && charges(a) > 0));
	label(zone, trf("<b>Ma collection</b> ({v} article{v2})", { v: mes.size(), v2: mes.size() > 1 ? "s" : "" }), 16, COULEURS.or, false, 3);
	if (mes.size() === 0) label(zone, tr("Rien pour l'instant. Les articles achetés apparaîtront ici, et tu pourras les porter ou les retirer quand tu veux."), 14, COULEURS.texte2, false, 4);
	else grille(zone, mes, 5, new UDim(1, MOBILE ? -170 : -150));
}

function dessiner() {
	if (!corps) return;
	const ancienne = corps.FindFirstChild("Contenu")?.FindFirstChild("Gauche")?.FindFirstChild("Grille") as ScrollingFrame | undefined;
	if (ancienne) defilementGrille = ancienne.CanvasPosition;
	for (const e of corps.GetChildren()) if (e.IsA("GuiObject")) e.Destroy();
	dessinerOnglets(corps);
	const contenu = new Instance("Frame");
	contenu.Name = "Contenu";
	contenu.BackgroundTransparency = 1;
	contenu.Position = new UDim2(0, 0, 0, MOBILE ? 58 : 50);
	contenu.Size = new UDim2(1, 0, 1, MOBILE ? -58 : -50);
	contenu.Parent = corps;
	// bandeau pour le propriétaire et dans Studio
	const b = etat.boutique;
	let decalage = 0;
	if (b?.proprietaire || b?.studio) {
		const bandeau = label(
			contenu,
			b.proprietaire ? tr("👑 Propriétaire du jeu : tout est débloqué pour toi (les autres joueurs voient les vrais prix).") : tr("🧪 Studio : les achats Roblox sont des tests gratuits ; « Essai Studio » débloque un article jusqu'à la fin du test."),
			13,
			COULEURS.or,
		);
		bandeau.Size = new UDim2(1, 0, 0, 20);
		bandeau.AutomaticSize = Enum.AutomaticSize.None;
		decalage = 26;
	}
	const choisi = etat.choisi !== undefined ? article(etat.choisi) : undefined;
	const largeurDetail = MOBILE ? 0 : 300;
	const gauche = new Instance("Frame");
	gauche.Name = "Gauche";
	gauche.BackgroundTransparency = 1;
	gauche.Position = new UDim2(0, 0, 0, decalage);
	gauche.Size = new UDim2(1, choisi && !MOBILE ? -largeurDetail - 12 : 0, 1, -decalage);
	gauche.Parent = contenu;
	if (MOBILE && etat.detailMobile && choisi) {
		const d = new Instance("Frame");
		d.BackgroundTransparency = 1;
		d.Size = UDim2.fromScale(1, 1);
		d.Parent = gauche;
		detail(d, choisi);
		(d.FindFirstChild("Detail") as ScrollingFrame).Size = UDim2.fromScale(1, 1);
		return;
	}
	if (etat.onglet === "collection") collection(gauche);
	else {
		const g = grille(gauche, ARTICLES.filter((a) => a.categorie === etat.onglet), 1);
		g.CanvasPosition = defilementGrille;
	}
	if (choisi && !MOBILE) {
		const droite = new Instance("Frame");
		droite.BackgroundTransparency = 1;
		droite.AnchorPoint = new Vector2(1, 0);
		droite.Position = new UDim2(1, 0, 0, decalage);
		droite.Size = new UDim2(0, largeurDetail, 1, -decalage);
		droite.Parent = contenu;
		detail(droite, choisi);
		(droite.FindFirstChild("Detail") as ScrollingFrame).Size = UDim2.fromScale(1, 1);
	}
}

export function ouvrirBoutique(id?: string) {
	if (etat.essai) finirEssai();
	chargerPrix();
	if (id !== undefined) {
		const a = article(id);
		if (a) {
			etat.choisi = a.id;
			etat.onglet = a.categorie;
		}
	} else if (etat.choisi === undefined) etat.choisi = ARTICLES.find((a) => a.categorie === etat.onglet)?.id;
	etat.info = undefined;
	if (!etat.ouvert) {
		etat.ouvert = true;
		construireFenetre();
		jouer("boutique");
	}
	dessiner();
	commande({ type: "etat" });
}

export function fermer() {
	if (!etat.ouvert) return;
	etat.ouvert = false;
	etat.detailMobile = false;
	gui?.FindFirstChild("Voile")?.Destroy();
	fenetre?.Destroy();
	fenetre = undefined;
	corps = undefined;
}

export function basculerBoutique() {
	if (etat.ouvert) fermer();
	else ouvrirBoutique();
}

/** À appeler une fois au démarrage du client. */
export function preparerBoutique() {
	r.etatBoutique.OnClientEvent.Connect((e) => {
		const avant = etat.boutique;
		etat.boutique = e;
		// remerciement après un achat (pas au premier envoi)
		if (avant && !e.proprietaire) {
			// un seul message : le pack s'il y en a un, sinon le premier article nouveau
			const nouveaux = e.possedes.filter((id) => !avant.possedes.includes(id));
			const a = article(nouveaux.find((id) => article(id)?.categorie === "pack") ?? nouveaux[0] ?? "");
			if (a) {
				messageLocal({ titre: tr("✨ Merci !"), texte: trf("{icone} {nom} est à toi. Tu peux le porter depuis « Ma collection ».", { icone: a.icone, nom: tr(a.nom) }), genre: "annonce" });
				jouer("niveau");
			}
			for (const [id, n] of pairs(e.charges)) {
				const a = article(id as string);
				if (a && n > (avant.charges[id as string] ?? 0)) {
					messageLocal({ titre: tr("✨ Merci !"), texte: trf("{icone} {nom} : {n} utilisation{v} disponible{v2}.", { icone: a.icone, nom: tr(a.nom), n, v: n > 1 ? "s" : "", v2: n > 1 ? "s" : "" }), genre: "annonce" });
					jouer("niveau");
				}
			}
		}
		if (etat.ouvert) dessiner();
	});
	UserInputService.InputBegan.Connect((entree, traite) => {
		if (traite) return;
		if (entree.KeyCode === Enum.KeyCode.B) basculerBoutique();
		else if (entree.KeyCode === Enum.KeyCode.Escape && etat.ouvert) fermer();
	});
	// si le personnage réapparaît pendant un essai
	joueur.CharacterAdded.Connect(() => {
		if (etat.essai) finirEssai();
	});
}
