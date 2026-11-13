/**
 * Petite boîte à outils d'interface (fenêtres, textes, boutons, champs) aux couleurs de Velmaris.
 * Tout est construit par le code : aucune interface à dessiner dans Studio.
 */

export const COULEURS = {
	fond: Color3.fromRGB(20, 15, 9),
	fond2: Color3.fromRGB(38, 29, 18),
	carte: Color3.fromRGB(46, 35, 22),
	bord: Color3.fromRGB(110, 84, 46),
	or: Color3.fromRGB(217, 164, 65),
	texte: Color3.fromRGB(243, 234, 215),
	texte2: Color3.fromRGB(190, 175, 150),
	rouge: Color3.fromRGB(196, 72, 60),
	vert: Color3.fromRGB(96, 170, 90),
	choisi: Color3.fromRGB(78, 60, 28),
	bleu: Color3.fromRGB(110, 170, 230),
	violet: Color3.fromRGB(160, 110, 210),
};

const POLICE = Enum.Font.Gotham;
const POLICE_GRAS = Enum.Font.GothamBold;

function arrondir(o: GuiObject, r = 8) {
	const c = new Instance("UICorner");
	c.CornerRadius = new UDim(0, r);
	c.Parent = o;
}
function bordure(o: GuiObject, couleur = COULEURS.bord) {
	const s = new Instance("UIStroke");
	s.Color = couleur;
	s.Thickness = 1;
	s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
	s.Parent = o;
}
function marges(o: GuiObject, px = 10) {
	const p = new Instance("UIPadding");
	p.PaddingTop = new UDim(0, px);
	p.PaddingBottom = new UDim(0, px);
	p.PaddingLeft = new UDim(0, px);
	p.PaddingRight = new UDim(0, px);
	p.Parent = o;
}

let ordre = 0;
function placer(o: GuiObject, parent: Instance) {
	o.LayoutOrder = ++ordre;
	o.Parent = parent;
	return o;
}

/** Colonne : empile ses enfants verticalement, hauteur automatique. */
export function colonne(parent: Instance, espace = 8): Frame {
	const f = new Instance("Frame");
	f.BackgroundTransparency = 1;
	f.Size = new UDim2(1, 0, 0, 0);
	f.AutomaticSize = Enum.AutomaticSize.Y;
	const l = new Instance("UIListLayout");
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Padding = new UDim(0, espace);
	l.Parent = f;
	placer(f, parent);
	return f;
}

/** Ligne : aligne ses enfants horizontalement et passe à la ligne si besoin. */
export function ligne(parent: Instance, espace = 6): Frame {
	const f = new Instance("Frame");
	f.BackgroundTransparency = 1;
	f.Size = new UDim2(1, 0, 0, 0);
	f.AutomaticSize = Enum.AutomaticSize.Y;
	const l = new Instance("UIListLayout");
	l.FillDirection = Enum.FillDirection.Horizontal;
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Padding = new UDim(0, espace);
	l.Wraps = true;
	l.VerticalAlignment = Enum.VerticalAlignment.Center;
	l.Parent = f;
	placer(f, parent);
	return f;
}

/** Carte : bloc encadré avec un titre facultatif. Renvoie la colonne intérieure. */
export function carte(parent: Instance, titre?: string): Frame {
	const f = new Instance("Frame");
	f.BackgroundColor3 = COULEURS.carte;
	f.Size = new UDim2(1, 0, 0, 0);
	f.AutomaticSize = Enum.AutomaticSize.Y;
	arrondir(f, 10);
	bordure(f);
	marges(f, 12);
	placer(f, parent);
	const c = colonne(f, 8);
	if (titre !== undefined) texte(c, titre, 20, { gras: true, couleur: COULEURS.or });
	return c;
}

export function texte(
	parent: Instance,
	contenu: string,
	taille = 16,
	options: { gras?: boolean; couleur?: Color3; largeur?: UDim; centre?: boolean } = {},
): TextLabel {
	const t = new Instance("TextLabel");
	t.BackgroundTransparency = 1;
	t.Text = contenu;
	t.TextSize = taille;
	t.Font = options.gras ? POLICE_GRAS : POLICE;
	t.TextColor3 = options.couleur ?? COULEURS.texte;
	t.TextWrapped = true;
	t.RichText = true;
	t.TextXAlignment = options.centre ? Enum.TextXAlignment.Center : Enum.TextXAlignment.Left;
	t.Size = new UDim2(options.largeur ?? new UDim(1, 0), new UDim(0, 0));
	t.AutomaticSize = Enum.AutomaticSize.Y;
	placer(t, parent);
	return t;
}

export function bouton(
	parent: Instance,
	libelle: string,
	surClic: () => void,
	options: { principal?: boolean; choisi?: boolean; actif?: boolean; largeur?: UDim; hauteur?: number; taille?: number } = {},
): TextButton {
	const b = new Instance("TextButton");
	const actif = options.actif ?? true;
	b.Text = libelle;
	b.TextSize = options.taille ?? 16;
	b.Font = options.principal ? POLICE_GRAS : POLICE;
	b.TextWrapped = true;
	b.RichText = true;
	b.AutoButtonColor = actif;
	b.TextColor3 = options.principal ? COULEURS.fond : actif ? COULEURS.texte : COULEURS.texte2;
	b.BackgroundColor3 = options.principal ? COULEURS.or : options.choisi ? COULEURS.choisi : COULEURS.fond2;
	b.BackgroundTransparency = actif ? 0 : 0.5;
	if (options.largeur) {
		b.Size = new UDim2(options.largeur, new UDim(0, options.hauteur ?? 40));
	} else {
		b.Size = new UDim2(0, 0, 0, options.hauteur ?? 40);
		b.AutomaticSize = Enum.AutomaticSize.X;
	}
	arrondir(b, 8);
	bordure(b, options.choisi ? COULEURS.or : COULEURS.bord);
	marges(b, 8);
	if (actif) b.MouseButton1Click.Connect(surClic);
	placer(b, parent);
	return b;
}

/** Bouton « carte » : un choix avec un titre et une description (race, classe, don…). */
export function choix(parent: Instance, titre: string, description: string, choisi: boolean, surClic: () => void, actif = true): TextButton {
	const b = new Instance("TextButton");
	b.Text = "";
	b.AutoButtonColor = actif;
	b.BackgroundColor3 = choisi ? COULEURS.choisi : COULEURS.fond2;
	b.BackgroundTransparency = actif ? 0 : 0.55;
	b.Size = new UDim2(1, 0, 0, 0);
	b.AutomaticSize = Enum.AutomaticSize.Y;
	arrondir(b, 8);
	bordure(b, choisi ? COULEURS.or : COULEURS.bord);
	marges(b, 10);
	const c = colonne(b, 4);
	texte(c, titre, 17, { gras: true, couleur: choisi ? COULEURS.or : COULEURS.texte });
	texte(c, description, 14, { couleur: COULEURS.texte2 });
	if (actif) b.MouseButton1Click.Connect(surClic);
	placer(b, parent);
	return b;
}

export function champ(parent: Instance, indication: string, valeur: string, surChangement: (v: string) => void, largeur = new UDim(1, 0)): TextBox {
	const t = new Instance("TextBox");
	t.PlaceholderText = indication;
	t.Text = valeur;
	t.ClearTextOnFocus = false;
	t.TextSize = 17;
	t.Font = POLICE;
	t.TextColor3 = COULEURS.texte;
	t.PlaceholderColor3 = COULEURS.texte2;
	t.BackgroundColor3 = COULEURS.fond;
	t.TextXAlignment = Enum.TextXAlignment.Left;
	t.Size = new UDim2(largeur, new UDim(0, 40));
	arrondir(t, 8);
	bordure(t);
	marges(t, 8);
	t.GetPropertyChangedSignal("Text").Connect(() => surChangement(t.Text));
	placer(t, parent);
	return t;
}

/** Barre de progression (PV, mana, affinité). */
export function barre(parent: Instance, valeur: number, max: number, couleur: Color3, largeur = new UDim(1, 0), hauteur = 10): Frame {
	const fond = new Instance("Frame");
	fond.BackgroundColor3 = COULEURS.fond;
	fond.Size = new UDim2(largeur, new UDim(0, hauteur));
	arrondir(fond, 4);
	const plein = new Instance("Frame");
	plein.BackgroundColor3 = couleur;
	plein.BorderSizePixel = 0;
	plein.Size = UDim2.fromScale(math.clamp(max > 0 ? valeur / max : 0, 0, 1), 1);
	arrondir(plein, 4);
	plein.Parent = fond;
	placer(fond, parent);
	return fond;
}

/** Protège un texte écrit par un joueur (nom, pseudo) avant de l'afficher en texte enrichi. */
export function esc(t: string): string {
	return t.gsub("&", "&amp;")[0].gsub("<", "&lt;")[0].gsub(">", "&gt;")[0];
}

/** Vide un conteneur (avant de redessiner un écran). */
export function vider(o: Instance) {
	for (const e of o.GetChildren()) if (e.IsA("GuiObject")) e.Destroy();
}
