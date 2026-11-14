/**
 * Objets dans l'interface Roblox : fiche d'objet avec aperçu 3D qui tourne (ViewportFrame), couleur de rareté,
 * conditions (niveau, classe), effets, pouvoir unique, comparaison avec l'objet porté ; et annonce du butin.
 * Les modèles 3D viennent de shared/equipement3d.ts (les mêmes que sur les personnages).
 */
import { Players, RunService, TweenService } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { COULEUR_RARETE, modeleObjet } from "shared/equipement3d";
import { avertissementEquipement, NOMS_RARETE, problemeEquipement, texteEffets, type Heros, type ObjetDef } from "shared/moteur";
import { monHeros, surChangement } from "../partie";
import { bouton, COULEURS, esc, ligne, texte } from "./kit";

// ───────────────────────────── Aperçu 3D ─────────────────────────────

interface Apercu {
	vp: ViewportFrame;
	modele: Model;
	centre: CFrame;
}
const apercus: Apercu[] = [];
let angle = 0;

/** Une seule boucle fait tourner tous les aperçus visibles (et oublie ceux qui ont disparu). */
RunService.RenderStepped.Connect((dt) => {
	angle += dt * 0.9;
	for (let i = apercus.size() - 1; i >= 0; i--) {
		const a = apercus[i];
		if (a.vp.Parent === undefined) {
			apercus.remove(i);
			continue;
		}
		if (!a.vp.Visible) continue;
		a.modele.PivotTo(CFrame.Angles(0, angle, 0).mul(a.centre));
	}
});

const CAMERA_PAR_CATEGORIE: Record<string, number> = { anneau: 1.6, amulette: 2.2, talisman: 2.2, sacoche: 2.4, orbe: 2.6, dague: 3 };

/** Petite fenêtre 3D qui montre l'objet en rotation. */
export function apercu3D(parent: Instance, objetId: string, taille = 72): ViewportFrame {
	const o = CONTENU.objets[objetId];
	const vp = new Instance("ViewportFrame");
	vp.Size = new UDim2(0, taille, 0, taille);
	vp.BackgroundColor3 = Color3.fromRGB(14, 11, 7);
	vp.BackgroundTransparency = 0.1;
	vp.Ambient = Color3.fromRGB(150, 140, 130);
	vp.LightColor = Color3.fromRGB(255, 245, 225);
	vp.LightDirection = new Vector3(-1, -1.5, -1);
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 8);
	coin.Parent = vp;
	const bord = new Instance("UIStroke");
	bord.Color = COULEUR_RARETE[o?.rarete ?? "commun"] ?? COULEURS.bord;
	bord.Thickness = o?.rarete === "legendaire" || o?.rarete === "mythique" ? 2 : 1;
	bord.Parent = vp;
	vp.Parent = parent;
	if (!o) return vp;
	const [ok, m] = pcall(() => modeleObjet(o));
	if (!ok || !m) return vp;
	const modele = m as Model;
	// centrer : l'objet tourne autour du centre de sa boîte, couché pour les armes longues
	const couche = o.emplacement === "arme" && o.categorie !== "orbe" && o.categorie !== "arc" && o.categorie !== "instrument";
	const pose = couche ? CFrame.Angles(math.rad(90), 0, math.rad(45)) : new CFrame();
	modele.PivotTo(pose);
	const [boite, dims] = modele.GetBoundingBox();
	// position telle que le centre de l'objet soit à l'origine : il tourne alors sur lui-même
	const centre = new CFrame(boite.Position.mul(-1)).mul(pose);
	modele.PivotTo(centre);
	modele.Parent = vp;
	const rayon = math.max(dims.X, dims.Y, dims.Z);
	const camera = new Instance("Camera");
	camera.FieldOfView = 40;
	const recul = rayon * 1.25 + (CAMERA_PAR_CATEGORIE[o.categorie ?? ""] ?? 0) * 0.2;
	camera.CFrame = CFrame.lookAt(new Vector3(0, rayon * 0.25, recul * 1.6), new Vector3());
	camera.Parent = vp;
	vp.CurrentCamera = camera;
	apercus.push({ vp, modele, centre });
	return vp;
}

// ───────────────────────────── Fiche d'objet ─────────────────────────────

function hex(c: Color3): string {
	return `#${c.ToHex()}`;
}

/** Différences de bonus avec l'objet actuellement porté au même emplacement. */
function comparaison(h: Heros, o: ObjetDef): string | undefined {
	if (o.type !== "equipement" || o.emplacement === undefined) return undefined;
	const porte = h.equipement[o.emplacement];
	if (porte === undefined || porte === o.id) return undefined;
	const a = CONTENU.objets[porte];
	if (!a) return undefined;
	const diff: string[] = [];
	const ecart = (nom: string, x: number, y: number) => {
		const d = y - x;
		if (d !== 0) diff.push(`<font color="${d > 0 ? "#72c46a" : "#e0605a"}">${d > 0 ? "+" : ""}${d} ${nom}</font>`);
	};
	ecart("puissance", a.bonus?.puissance ?? 0, o.bonus?.puissance ?? 0);
	ecart("armure", a.bonus?.armure ?? 0, o.bonus?.armure ?? 0);
	for (const k of ["FOR", "AGI", "INT", "VIT", "ESP", "CHA"] as const) ecart(k, a.bonus?.caracs[k] ?? 0, o.bonus?.caracs[k] ?? 0);
	if (diff.size() === 0) return `Comparé à ${esc(a.nom)} : mêmes valeurs de base.`;
	return `Comparé à ${esc(a.nom)} : ${diff.join(", ")}`;
}

export interface ActionObjet {
	libelle: string;
	surClic: () => void;
	actif?: boolean;
	principal?: boolean;
}

/** Une ligne d'objet : aperçu 3D, nom coloré, conditions, effets, pouvoir, comparaison et boutons. */
export function ficheObjet(parent: Instance, objetId: string, options: { nombre?: number; actions?: ActionObjet[]; comparer?: boolean; taille?: number } = {}) {
	const o = CONTENU.objets[objetId];
	if (!o) return;
	const h = monHeros();
	const l = ligne(parent, 10);
	const lay = l.FindFirstChildWhichIsA("UIListLayout");
	if (lay) lay.VerticalAlignment = Enum.VerticalAlignment.Top;
	if (o.type === "equipement") apercu3D(l, objetId, options.taille ?? 72).LayoutOrder = 1;
	const col = new Instance("Frame");
	col.BackgroundTransparency = 1;
	col.Size = new UDim2(1, o.type === "equipement" ? -(options.taille ?? 72) - 12 : 0, 0, 0);
	col.AutomaticSize = Enum.AutomaticSize.Y;
	const liste = new Instance("UIListLayout");
	liste.Padding = new UDim(0, 3);
	liste.SortOrder = Enum.SortOrder.LayoutOrder;
	liste.Parent = col;
	col.LayoutOrder = 2;
	col.Parent = l;

	const couleur = COULEUR_RARETE[o.rarete ?? "commun"] ?? COULEURS.texte;
	const probleme = h && o.type === "equipement" ? problemeEquipement(CONTENU, h, o) : undefined;
	let titre = `<b><font color="${hex(couleur)}">${esc(o.nom)}</font></b>${options.nombre !== undefined && options.nombre > 1 ? ` ×${options.nombre}` : ""}`;
	if (o.rarete !== undefined) titre += `  <font size="12" color="${hex(couleur)}">${NOMS_RARETE[o.rarete]}</font>`;
	if (o.niveau !== undefined && o.niveau > 1) titre += `  <font size="12" color="${h && h.niveau < o.niveau ? "#e0605a" : "#beaf96"}">niv. ${o.niveau}</font>`;
	if (o.unique_par_partie === true) titre += `  <font size="12" color="#ff4a4a">unique</font>`;
	texte(col, titre, 15);
	if (o.classes !== undefined && o.classes.size() > 0) {
		const refus = probleme !== undefined && probleme.sub(1, 7) === "Réservé";
		texte(col, `Pour : ${o.classes.map((c) => CONTENU.classes[c]?.nom ?? c).join(", ")}`, 12, { couleur: refus ? COULEURS.rouge : COULEURS.texte2 });
	}
	const effets = o.type === "equipement" ? texteEffets(o) : [];
	if (effets.size() > 0) texte(col, effets.join(" · "), 13);
	if (o.pouvoir_unique !== undefined) texte(col, `<i>✦ ${esc(o.pouvoir_unique)}</i>`, 13, { couleur: COULEUR_RARETE.legendaire });
	texte(col, esc(o.description), 12, { couleur: COULEURS.texte2 });
	// maîtrise d'équipement : interdit (rouge) ou malus de non-maîtrise (orange), affiché avant l'achat et l'équipement
	if (probleme !== undefined && probleme.sub(1, 7) !== "Réservé") texte(col, `⛔ ${esc(probleme)}`, 12, { couleur: COULEURS.rouge });
	else if (probleme === undefined && h && o.type === "equipement") {
		const malus = avertissementEquipement(CONTENU, h, o);
		if (malus !== undefined) texte(col, `⚠ ${esc(malus)}`, 12, { couleur: COULEURS.or });
	}
	if (options.comparer && h) {
		const c = comparaison(h, o);
		if (c !== undefined) texte(col, c, 12, { couleur: COULEURS.texte2 });
	}
	if (options.actions && options.actions.size() > 0) {
		const b = ligne(col, 6);
		for (const a of options.actions) bouton(b, a.libelle, a.surClic, { actif: a.actif ?? true, principal: a.principal, hauteur: 28, taille: 13 });
	}
}

// ───────────────────────────── Butin : annonce avec aperçu ─────────────────────────────

let avant: Record<string, number> | undefined;
let heroAvant: string | undefined;
let pile = 0;

function annoncer(objetId: string) {
	const o = CONTENU.objets[objetId];
	const gui = Players.LocalPlayer.FindFirstChild("PlayerGui")?.FindFirstChild("VelmarisButin") as ScreenGui | undefined;
	if (!o || !gui) return;
	const cadre = new Instance("Frame");
	cadre.AnchorPoint = new Vector2(0.5, 0);
	cadre.Position = new UDim2(0.5, 0, 0, -120);
	cadre.Size = new UDim2(0, 360, 0, 96);
	cadre.BackgroundColor3 = COULEURS.fond;
	cadre.BackgroundTransparency = 0.05;
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 12);
	coin.Parent = cadre;
	const bord = new Instance("UIStroke");
	bord.Color = COULEUR_RARETE[o.rarete ?? "commun"] ?? COULEURS.or;
	bord.Thickness = 2;
	bord.Parent = cadre;
	const marge = new Instance("UIPadding");
	for (const k of ["PaddingLeft", "PaddingRight", "PaddingTop", "PaddingBottom"] as const) marge[k] = new UDim(0, 10);
	marge.Parent = cadre;
	const l = ligne(cadre, 10);
	apercu3D(l, objetId, 76);
	const t = texte(l, `<font color="#d9a441">Nouvel objet !</font>\n<b><font color="${hex(COULEUR_RARETE[o.rarete ?? "commun"])}">${esc(o.nom)}</font></b>\n<font size="12" color="#beaf96">${o.rarete !== undefined ? NOMS_RARETE[o.rarete] : ""}${o.niveau !== undefined && o.niveau > 1 ? ` · niv. ${o.niveau}` : ""}</font>`, 16, { largeur: new UDim(1, -90) });
	t.TextYAlignment = Enum.TextYAlignment.Center;
	cadre.Parent = gui;
	const rang = pile++;
	const y = 70 + rang * 106;
	TweenService.Create(cadre, new TweenInfo(0.35, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Position: new UDim2(0.5, 0, 0, y) }).Play();
	task.delay(4, () => {
		TweenService.Create(cadre, new TweenInfo(0.3), { Position: new UDim2(0.5, 0, 0, -120) }).Play();
		task.delay(0.35, () => {
			cadre.Destroy();
			pile = math.max(0, pile - 1);
		});
	});
}

/** Annonce chaque nouvel équipement qui arrive dans le sac du héros (butin, récompense, achat). */
export function surveillerButin() {
	const gui = new Instance("ScreenGui");
	gui.Name = "VelmarisButin";
	gui.ResetOnSpawn = false;
	gui.DisplayOrder = 20;
	gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
	surChangement(() => {
		const h = monHeros();
		if (!h) {
			avant = undefined;
			return;
		}
		const maintenant: Record<string, number> = {};
		for (const [k, v] of pairs(h.inventaire)) maintenant[k as string] = v;
		if (avant !== undefined && heroAvant === h.id) {
			for (const [k, v] of pairs(maintenant)) {
				const o = CONTENU.objets[k];
				if (o && o.type === "equipement" && v > (avant[k] ?? 0)) {
					// un objet qui revient du corps (déséquipé) n'est pas un nouvel objet
					let porte = false;
					for (const [, e] of pairs(h.equipement)) if (e === k) porte = true;
					const etaitPorte = equipementAvant.includes(k);
					if (!porte && !etaitPorte) annoncer(k);
				}
			}
		}
		equipementAvant = [];
		for (const [, e] of pairs(h.equipement)) equipementAvant.push(e as string);
		avant = maintenant;
		heroAvant = h.id;
	});
}
let equipementAvant: string[] = [];
