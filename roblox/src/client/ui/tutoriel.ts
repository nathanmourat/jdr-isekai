/**
 * Tutoriel des premières minutes (jusqu'à la réussite de l'examen de la Guilde, au chapitre 1) :
 *  - une flèche dorée flotte devant le joueur et montre la porte du lieu de la prochaine étape ;
 *  - une bulle en bas de l'écran donne LE conseil utile selon ce qu'on fait (dehors, dans un bâtiment,
 *    en dialogue, en combat, dans un donjon) ;
 *  - « Masquer les conseils » les cache (réglage du compte, qu'on peut remettre dans ⚙ Réglages).
 * Rien n'est enregistré : le tutoriel se déduit de l'avancement de la campagne.
 */
import { CollectionService, Players, RunService, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { prochaineEtape } from "shared/moteur";
import { affichage } from "../local";
import { jeu, monHeros } from "../partie";
import { COULEURS } from "./kit";
import { changerReglage, reglages } from "../reglages";
import { tr, trf } from "shared/langue";

/** Lieu vers lequel « Y aller » guide (quand on ne peut pas encore s'y téléporter). */
let guide: string | undefined;
let derniereVue = "";

/** Montre la flèche dorée vers un lieu, jusqu'à ce qu'on y arrive (même après le tutoriel). */
export function guiderVers(lieu: string | undefined) {
	guide = lieu;
	majTutoriel(derniereVue);
}
let gui: ScreenGui | undefined;
let bulle: TextLabel | undefined;
let fleche: Part | undefined;
let cible: Vector3 | undefined;
const vus = new Set<string>();

function actif(): boolean {
	const etat = jeu.etat;
	if (!reglages.conseils || !etat || !monHeros()) return false;
	return etat.chapitre === 1 && etat.flags["examen-reussi"] !== true;
}

function ecran() {
	if (gui) return;
	gui = new Instance("ScreenGui");
	gui.Name = "Tutoriel";
	gui.DisplayOrder = 30;
	gui.ResetOnSpawn = false;
	const cadre = new Instance("Frame");
	cadre.Name = "Cadre";
	cadre.AnchorPoint = new Vector2(0.5, 1);
	cadre.Position = new UDim2(0.5, 0, 1, -16);
	cadre.Size = new UDim2(0, 520, 0, 0);
	cadre.AutomaticSize = Enum.AutomaticSize.Y;
	cadre.BackgroundColor3 = COULEURS.fond;
	cadre.BackgroundTransparency = 0.1;
	cadre.Parent = gui;
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 12);
	coin.Parent = cadre;
	const bord = new Instance("UIStroke");
	bord.Color = COULEURS.or;
	bord.Thickness = 2;
	bord.Parent = cadre;
	const m = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight"] as const) m[k] = new UDim(0, 12);
	m.Parent = cadre;
	const l = new Instance("UIListLayout");
	l.Padding = new UDim(0, 6);
	l.SortOrder = Enum.SortOrder.LayoutOrder;
	l.Parent = cadre;
	bulle = new Instance("TextLabel");
	bulle.BackgroundTransparency = 1;
	bulle.Size = new UDim2(1, 0, 0, 0);
	bulle.AutomaticSize = Enum.AutomaticSize.Y;
	bulle.TextWrapped = true;
	bulle.RichText = true;
	bulle.TextXAlignment = Enum.TextXAlignment.Left;
	bulle.Font = Enum.Font.Gotham;
	bulle.TextSize = 16;
	bulle.TextColor3 = COULEURS.texte;
	bulle.LayoutOrder = 1;
	bulle.Parent = cadre;
	const cacher = new Instance("TextButton");
	cacher.Text = tr("Masquer les conseils");
	cacher.Font = Enum.Font.Gotham;
	cacher.TextSize = 13;
	cacher.TextColor3 = COULEURS.texte2;
	cacher.BackgroundTransparency = 1;
	cacher.Size = new UDim2(0, 160, 0, 22);
	cacher.LayoutOrder = 2;
	cacher.Parent = cadre;
	cacher.MouseButton1Click.Connect(() => {
		changerReglage("conseils", false);
		majTutoriel("");
	});
	gui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
}

/** Porte du lieu (ancre « EntreeLieu » posée par le serveur). */
function porteDe(lieu: string): Vector3 | undefined {
	for (const e of CollectionService.GetTagged("EntreeLieu")) if (e.IsA("BasePart") && e.GetAttribute("Lieu") === lieu) return e.Position;
	return undefined;
}

function poserFleche() {
	if (fleche) return;
	fleche = new Instance("Part");
	fleche.Name = "FlecheTutoriel";
	fleche.Anchored = true;
	fleche.CanCollide = false;
	fleche.CanQuery = false;
	fleche.CastShadow = false;
	fleche.Material = Enum.Material.Neon;
	fleche.Color = Color3.fromRGB(255, 205, 90);
	fleche.Size = new Vector3(1.6, 0.6, 3);
	const pointe = new Instance("SpecialMesh");
	pointe.MeshType = Enum.MeshType.Wedge;
	pointe.Parent = fleche;
	const l = new Instance("PointLight");
	l.Color = fleche.Color;
	l.Range = 10;
	l.Parent = fleche;
	fleche.Parent = Workspace.CurrentCamera;
}

function retirerFleche() {
	fleche?.Destroy();
	fleche = undefined;
	cible = undefined;
}

// la flèche suit le joueur et tourne vers la porte (chez ce joueur seulement)
RunService.RenderStepped.Connect(() => {
	if (!fleche || !cible) return;
	const r = Players.LocalPlayer.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (!r) return;
	const d = new Vector3(cible.X - r.Position.X, 0, cible.Z - r.Position.Z);
	if (d.Magnitude < 12) {
		fleche.Transparency = 1;
		// arrivé : le guidage s'arrête
		if (guide !== undefined) {
			guide = undefined;
			task.defer(() => majTutoriel(derniereVue));
		}
		return;
	}
	fleche.Transparency = 0.1;
	const u = d.Unit;
	const p = r.Position.add(u.mul(5)).add(new Vector3(0, 3.2 + math.sin(os.clock() * 3) * 0.3, 0));
	// le « coin » (Wedge) est mince à l'avant (-Z) : tourné vers la porte, il fait une pointe de flèche
	fleche.CFrame = CFrame.lookAt(p, p.add(u));
});

function conseil(vue: string): string | undefined {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const e = prochaineEtape(CONTENU, etat, h.id);
	const nomCible = e?.nomLieu ?? e?.lieu ?? "";
	if (vue === "combat") return tr("⚔ <b>Combat au tour par tour</b> : à ton tour, choisis « Attaquer » ou une compétence, puis clique sur un ennemi (contour doré). « Conseils » propose une bonne action.");
	if (vue === "scene-groupe" || vue === "scene-moi")
		return tr("💬 Lis les répliques avec « Continuer », puis choisis une réponse. À plusieurs, chacun vote et la majorité l'emporte.");
	if (vue === "donjon") return tr("🕯 Avance avec ton avatar : les événements (coffres, pièges, monstres) se déclenchent sous les pieds du meneur, marqué par la lueur dorée.");
	if (vue !== "monde" || !e) return undefined;
	if (affichage.dans !== undefined) {
		if (e.lieu === affichage.dans) return tr("🗨 C'est ici ! Approche-toi du personnage marqué d'un <b>« ! » doré</b> et appuie sur <b>E</b> pour lui parler.");
		return trf("🚪 Ce n'est pas ici : sors par la porte (touche <b>E</b>), puis suis la flèche dorée jusqu'à <b>{nomCible}</b>.", { nomCible });
	}
	if (!e.disponible) return trf("🎯 Objectif : <b>{objectif}</b>. L'histoire attend : va dormir au <b>Chaudron Fêlé</b> (la taverne) pour faire passer le temps.", { objectif: e.objectif });
	const astuce = !vus.has("groupe") ? tr("\nAstuce : le menu <b>👥 Groupe</b> permet de jouer à plusieurs.") : "";
	vus.add("groupe");
	return trf("🎯 Objectif : <b>{objectif}</b>. Suis la <b>flèche dorée</b> jusqu'à <b>{nomCible}</b>, puis appuie sur <b>E</b> devant la porte. (Le bouton « Guider » de la barre du haut montre aussi le chemin.){astuce}", { objectif: e.objectif, nomCible, astuce });
}

/** À appeler à chaque changement d'écran ou de partie. */
export function majTutoriel(vue: string) {
	derniereVue = vue;
	// guidage demandé par « Y aller » : la flèche montre ce lieu (tutoriel ou non)
	const porteGuide = guide !== undefined && vue === "monde" && affichage.dans === undefined ? porteDe(guide) : undefined;
	if (!actif()) {
		if (gui) gui.Enabled = false;
		if (porteGuide) {
			poserFleche();
			cible = porteGuide;
		} else retirerFleche();
		return;
	}
	ecran();
	const t = conseil(vue);
	gui!.Enabled = t !== undefined;
	if (t !== undefined) bulle!.Text = t;
	// la flèche : dehors, vers la porte du lieu de la prochaine étape
	const e = prochaineEtape(CONTENU, jeu.etat!, monHeros()!.id);
	const porte = porteGuide ?? (vue === "monde" && affichage.dans === undefined && e?.lieu !== undefined ? porteDe(e.lieu) : undefined);
	if (porte) {
		poserFleche();
		cible = porte;
	} else retirerFleche();
}
