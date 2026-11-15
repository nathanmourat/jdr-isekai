/**
 * Tests 3 et 4 du web, à la manière de Roblox :
 *  - lancer de dé : chaque test de caractéristique (etat.tests, rempli par le moteur) est montré à tous les
 *    joueurs de la campagne : le dé roule, puis le détail (jet + bonus = total contre difficulté) et Réussi / Échoué ;
 *  - gains : petites notifications de 5 s en haut à droite (or, XP, niveau, objets, PV), calculées en comparant
 *    l'état avant et après (le moteur ne change pas). Elles attendent la fin du dé.
 * L'interface ne calcule rien : tout vient de l'état de la partie.
 */
import { Players, TweenService } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { pvHorsCombat, type TestCarac } from "shared/moteur";
import { jeu, monHeros } from "../partie";
import { COULEURS } from "./kit";

const NOMS_CARACS: Record<string, string> = { FOR: "Force", AGI: "Agilité", INT: "Intelligence", VIT: "Vitalité", ESP: "Esprit", CHA: "Charisme" };

let gui: ScreenGui | undefined;
let pile: Frame | undefined;
function ecran(): ScreenGui {
	if (gui) return gui;
	gui = new Instance("ScreenGui");
	gui.Name = "Notifications";
	gui.DisplayOrder = 40;
	gui.ResetOnSpawn = false;
	gui.IgnoreGuiInset = true;
	pile = new Instance("Frame");
	pile.BackgroundTransparency = 1;
	pile.AnchorPoint = new Vector2(1, 0);
	pile.Position = new UDim2(1, -12, 0, 70);
	pile.Size = new UDim2(0, 300, 1, -80);
	pile.Parent = gui;
	const l = new Instance("UIListLayout");
	l.Padding = new UDim(0, 6);
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.HorizontalAlignment = Enum.HorizontalAlignment.Right;
	l.Parent = pile;
	gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
	return gui;
}

function etiquette(parent: Instance, t: string, taille: number, couleur: Color3, gras = false): TextLabel {
	const e = new Instance("TextLabel");
	e.BackgroundTransparency = 1;
	e.Size = new UDim2(1, 0, 0, 0);
	e.AutomaticSize = Enum.AutomaticSize.Y;
	e.TextWrapped = true;
	e.RichText = true;
	e.Font = gras ? Enum.Font.GothamBold : Enum.Font.Gotham;
	e.TextSize = taille;
	e.TextColor3 = couleur;
	e.Text = t;
	e.Parent = parent;
	return e;
}

// ───────────────────────────── Gains ─────────────────────────────

let ordre = 0;
function notifier(t: string, couleur = COULEURS.or) {
	ecran();
	const f = new Instance("Frame");
	f.Size = new UDim2(0, 290, 0, 0);
	f.AutomaticSize = Enum.AutomaticSize.Y;
	f.BackgroundColor3 = COULEURS.fond;
	f.BackgroundTransparency = 0.1;
	f.LayoutOrder = ordre++;
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 8);
	coin.Parent = f;
	const bord = new Instance("UIStroke");
	bord.Color = couleur;
	bord.Parent = f;
	const m = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight"] as const) m[k] = new UDim(0, 8);
	m.Parent = f;
	etiquette(f, t, 15, couleur, true);
	f.Parent = pile;
	task.delay(5, () => f.Destroy());
}

interface Photo {
	code: string;
	heros: string;
	or: number;
	xp: number;
	niveau: number;
	pv: number;
	inventaire: Record<string, number>;
}
let photo: Photo | undefined;
let finDes = 0;

function prendrePhoto(): Photo | undefined {
	const h = monHeros();
	if (!h || jeu.code === undefined) return undefined;
	const inventaire: Record<string, number> = {};
	for (const [o, n] of pairs(h.inventaire)) inventaire[o as string] = n;
	return { code: jeu.code, heros: h.id, or: h.or, xp: h.xp, niveau: h.niveau, pv: pvHorsCombat(CONTENU, h), inventaire };
}

function comparer() {
	const apres = prendrePhoto();
	const avant = photo;
	photo = apres;
	// changement de campagne (groupe) ou premier affichage : rien à annoncer
	if (!avant || !apres || avant.code !== apres.code || avant.heros !== apres.heros) return;
	const lignes: [string, Color3][] = [];
	if (apres.niveau > avant.niveau) lignes.push([`⭐ Niveau ${apres.niveau} !`, COULEURS.or]);
	if (apres.xp > avant.xp && apres.niveau === avant.niveau) lignes.push([`+${apres.xp - avant.xp} XP`, COULEURS.bleu]);
	if (apres.or !== avant.or) lignes.push([`${apres.or > avant.or ? "+" : ""}${apres.or - avant.or} or`, apres.or > avant.or ? COULEURS.or : COULEURS.texte2]);
	for (const [o, n] of pairs(apres.inventaire)) {
		const d = n - (avant.inventaire[o] ?? 0);
		if (d > 0) lignes.push([`🎒 ${CONTENU.objets[o]?.nom ?? o}${d > 1 ? ` ×${d}` : ""}`, COULEURS.vert]);
	}
	if (apres.pv !== avant.pv && math.abs(apres.pv - avant.pv) >= 1) lignes.push([`${apres.pv > avant.pv ? "+" : ""}${apres.pv - avant.pv} PV`, apres.pv > avant.pv ? COULEURS.vert : COULEURS.rouge]);
	if (lignes.size() === 0) return;
	// les gains attendent la fin du lancer de dé
	const attente = math.max(0, finDes - os.clock());
	task.delay(attente, () => {
		for (const [t, c] of lignes) notifier(t, c);
	});
}

// ───────────────────────────── Lancer de dé ─────────────────────────────

const fileDes: TestCarac[] = [];
let desEnCours = false;
let derniereAction = -1;
let derniereCampagne = "";

function lancer(t: TestCarac) {
	desEnCours = true;
	ecran();
	const f = new Instance("Frame");
	f.AnchorPoint = new Vector2(0.5, 0);
	f.Position = new UDim2(0.5, 0, 0, 110);
	f.Size = new UDim2(0, 380, 0, 0);
	f.AutomaticSize = Enum.AutomaticSize.Y;
	f.BackgroundColor3 = COULEURS.fond;
	f.BackgroundTransparency = 0.05;
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 12);
	coin.Parent = f;
	const bord = new Instance("UIStroke");
	bord.Thickness = 2;
	bord.Color = COULEURS.or;
	bord.Parent = f;
	const m = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight"] as const) m[k] = new UDim(0, 12);
	m.Parent = f;
	const l = new Instance("UIListLayout");
	l.Padding = new UDim(0, 6);
	l.HorizontalAlignment = Enum.HorizontalAlignment.Center;
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Parent = f;
	const nom = jeu.etat?.heros[t.heros]?.nom ?? "?";
	const titre = etiquette(f, `🎲 Test de ${NOMS_CARACS[t.carac] ?? t.carac} — <b>${nom}</b>`, 16, COULEURS.texte);
	titre.TextXAlignment = Enum.TextXAlignment.Center;
	titre.LayoutOrder = 1;
	if (t.quoi !== "") {
		const q = etiquette(f, t.quoi, 13, COULEURS.texte2);
		q.TextXAlignment = Enum.TextXAlignment.Center;
		q.LayoutOrder = 2;
	}
	const de = etiquette(f, "?", 46, COULEURS.or, true);
	de.TextXAlignment = Enum.TextXAlignment.Center;
	de.LayoutOrder = 3;
	const detail = etiquette(f, "", 16, COULEURS.texte);
	detail.TextXAlignment = Enum.TextXAlignment.Center;
	detail.LayoutOrder = 4;
	f.Parent = gui;
	finDes = os.clock() + 3.6;
	task.spawn(() => {
		const hasard = new Random();
		for (let i = 0; i < 16; i++) {
			de.Text = tostring(hasard.NextInteger(1, 20));
			task.wait(0.05 + i * 0.005);
		}
		de.Text = tostring(t.jet);
		TweenService.Create(de, new TweenInfo(0.15), { TextSize: 56 }).Play();
		detail.Text = `${t.jet} + ${t.bonus} = <b>${t.total}</b> contre ${t.difficulte}`;
		task.wait(0.5);
		const r = etiquette(f, t.reussi ? "Réussi !" : "Échoué…", 22, t.reussi ? COULEURS.vert : COULEURS.rouge, true);
		r.TextXAlignment = Enum.TextXAlignment.Center;
		r.LayoutOrder = 5;
		bord.Color = t.reussi ? COULEURS.vert : COULEURS.rouge;
		task.wait(2);
		f.Destroy();
		desEnCours = false;
		const suivant = fileDes.shift();
		if (suivant) lancer(suivant);
	});
}

function nouveauxTests() {
	const etat = jeu.etat;
	if (!etat) return;
	if (etat.numeroAction === derniereAction && jeu.code === derniereCampagne) return;
	// au chargement ou en changeant de campagne (groupe) : on ne rejoue pas les vieux tests
	const premiere = derniereAction === -1 || jeu.code !== derniereCampagne;
	derniereAction = etat.numeroAction;
	derniereCampagne = jeu.code ?? "";
	if (premiere) return;
	for (const t of etat.tests ?? []) {
		if (desEnCours) fileDes.push(t);
		else lancer(t);
	}
}

/** À appeler à chaque changement de la partie. */
export function majNotifications() {
	nouveauxTests();
	comparer();
}
