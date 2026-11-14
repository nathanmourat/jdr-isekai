/**
 * Combat en 3D « sur place », dessiné par chaque joueur pour lui-même (rien n'est envoyé au serveur) :
 *  - le combat a lieu dans le monde, au lieu qui correspond au décor (arène, Combe-aux-Saules, Tanneurs…) ;
 *  - héros = avatar Roblox du joueur, habillé de son équipement en 3D (arme de sa classe s'il n'en a pas) ; ennemis = modèles 3D préparés par le serveur ;
 *  - les événements du combat sont joués un par un : élan, coup, chiffres de dégâts, effets d'élément, K.O.
 */
import { CollectionService, Players, ReplicatedStorage, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { equiperPersonnage, type EquipementPorte } from "shared/equipement3d";
import { CONTENU } from "shared/donnees";
import { LIEU_DU_DECOR, ORIGINES, positionLieu, regionDuLieu, trouverLieu } from "shared/geo";
import type { Combat, Combattant, EvenementCombat } from "shared/moteur";
import { jouer } from "../sons";

const COULEUR_ELEMENT: Record<string, Color3> = {
	physique: Color3.fromRGB(255, 255, 255),
	feu: Color3.fromRGB(255, 120, 40),
	glace: Color3.fromRGB(120, 220, 255),
	foudre: Color3.fromRGB(255, 240, 90),
	sacre: Color3.fromRGB(255, 225, 150),
	ombre: Color3.fromRGB(150, 70, 200),
	poison: Color3.fromRGB(120, 220, 80),
	arcane: Color3.fromRGB(120, 140, 255),
};
// Animations R15 fournies par Roblox (si l'une ne se charge pas, on se contente des mouvements)
const ANIM = {
	repos: "rbxassetid://507766666",
	coup: "rbxassetid://522635514",
	estoc: "rbxassetid://522638767",
	sort: "rbxassetid://507770453",
	victoire: "rbxassetid://507770677",
};

interface Pion {
	modele: Model;
	racine: BasePart;
	repos: CFrame;
	pv: number;
	pvMax: number;
	barre: Frame;
	nom: TextLabel;
	surbrillance: Highlight;
	animateur?: Animator;
	pistes: Map<string, AnimationTrack>;
	ko: boolean;
}

let dossier: Folder | undefined;
let combatAffiche = "";
let repere = new CFrame();
let evenementsVus = 0;
const pions = new Map<string, Pion>();
const file: EvenementCombat[] = [];
let lecture = false;
let dernierCombat: Combat | undefined;
let surClic: ((id: string) => void) | undefined;
let ciblesSurlignees: string[] = [];

// ───────────────────────────── Lieu du combat ─────────────────────────────

function sol(position: Vector3): number {
	const params = new RaycastParams();
	params.FilterType = Enum.RaycastFilterType.Include;
	params.FilterDescendantsInstances = [Workspace.Terrain];
	const r = Workspace.Raycast(position.add(new Vector3(0, 200, 0)), new Vector3(0, -400, 0), params);
	return r ? r.Position.Y : 0;
}

/** Position de la porte d'un lieu (pièce « Entree » marquée EntreeLieu), si elle est construite. */
function entreeDe(lieu: string): Vector3 | undefined {
	for (const e of CollectionService.GetTagged("EntreeLieu")) {
		if (e.IsA("BasePart") && e.GetAttribute("Lieu") === lieu) return e.Position;
	}
	return undefined;
}

/** Repère du combat : origine au sol, axe X = de la gauche (héros) vers la droite (ennemis). */
function choisirRepere(combat: Combat, enDonjon: boolean): CFrame {
	if (enDonjon || combat.fond === "crypte") {
		const o = new Vector3(0, 600, 0);
		construireSalleCrypte(o);
		return new CFrame(o);
	}
	// le combat se déroule au lieu qui correspond au décor ; la caméra regarde depuis le centre de la région
	const lieu = trouverLieu(LIEU_DU_DECOR[combat.fond] ?? "lysmont-place");
	const place = trouverLieu("lysmont-place");
	const pLieu = lieu ? positionLieu(lieu) : new Vector3();
	const region = lieu ? regionDuLieu(lieu.id) : "aubeclaire";
	const pPlace = region === "aubeclaire" ? (place ? positionLieu(place) : new Vector3()) : ORIGINES[region] ?? new Vector3();
	let o: Vector3;
	let versCamera: Vector3;
	if (lieu?.id === "arene") {
		o = pLieu;
		versCamera = new Vector3(0, 0, 1);
	} else {
		// devant la porte du bâtiment (les bâtiments sont grands : on se bat dehors, face à l'entrée)
		const porte = lieu ? entreeDe(lieu.id) : undefined;
		if (porte) {
			const d = new Vector3(porte.X - pLieu.X, 0, porte.Z - pLieu.Z);
			versCamera = d.Magnitude > 1 ? d.Unit : new Vector3(0, 0, 1);
			o = new Vector3(porte.X, 0, porte.Z).add(versCamera.mul(34));
		} else {
			const d = pPlace.sub(pLieu);
			versCamera = d.Magnitude > 1 ? d.Unit : new Vector3(0, 0, 1);
			o = pLieu.add(versCamera.mul(70));
		}
	}
	o = new Vector3(o.X, sol(o), o.Z);
	// la caméra regarde depuis « versCamera » : l'axe X du repère est perpendiculaire
	return CFrame.lookAt(o, o.sub(versCamera));
}

function construireSalleCrypte(o: Vector3) {
	const ajouter = (taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material) => {
		const p = new Instance("Part");
		p.Anchored = true;
		p.Size = taille;
		p.CFrame = cf;
		p.Color = couleur;
		p.Material = matiere;
		p.Parent = dossier;
		return p;
	};
	ajouter(new Vector3(80, 2, 60), new CFrame(o.add(new Vector3(0, -1, 0))), Color3.fromRGB(80, 76, 82), Enum.Material.Slate);
	ajouter(new Vector3(80, 30, 2), new CFrame(o.add(new Vector3(0, 14, -24))), Color3.fromRGB(55, 50, 60), Enum.Material.Slate);
	for (const x of [-24, -8, 8, 24]) {
		ajouter(new Vector3(3, 22, 3), new CFrame(o.add(new Vector3(x, 10, -18))), Color3.fromRGB(90, 85, 92), Enum.Material.Cobblestone);
		const torche = ajouter(new Vector3(0.6, 1, 0.6), new CFrame(o.add(new Vector3(x, 8, -16.2))), Color3.fromRGB(255, 140, 60), Enum.Material.Neon);
		const feu = new Instance("Fire");
		feu.Size = 2;
		feu.Parent = torche;
		const l = new Instance("PointLight");
		l.Color = Color3.fromRGB(255, 150, 70);
		l.Range = 24;
		l.Parent = torche;
	}
}

// ───────────────────────────── Pions ─────────────────────────────

/** Équipement porté par chaque héros (id du héros → objets), mis à jour avant d'afficher l'arène. */
let equipementsDesHeros: Record<string, EquipementPorte> = {};
export function definirEquipements(e: Record<string, EquipementPorte>) {
	equipementsDesHeros = e;
}

function gabarit(x: Combattant): Model | undefined {
	const modeles = ReplicatedStorage.FindFirstChild("VelmarisModeles");
	if (!modeles) return undefined;
	if (x.type === "heros") return (modeles.FindFirstChild(`joueur-${x.joueurId}`) ?? modeles.FindFirstChild(`classe-${x.refId}`)) as Model | undefined;
	return modeles.FindFirstChild(x.refId) as Model | undefined;
}

/** Modèle de secours (si les modèles 3D ne sont pas encore prêts) : un simple personnage en pièces. */
function secours(x: Combattant): Model {
	const m = new Instance("Model");
	const corps = new Instance("Part");
	corps.Name = "Racine";
	corps.Anchored = true;
	corps.CanCollide = false;
	corps.Size = new Vector3(2.4, 4, 1.6);
	corps.Color = x.camp === "heros" ? Color3.fromRGB(80, 130, 210) : Color3.fromRGB(160, 60, 50);
	corps.Parent = m;
	m.PrimaryPart = corps;
	m.SetAttribute("Hauteur", 5);
	return m;
}

function placeLocale(combat: Combat, x: Combattant): Vector3 {
	const memes = combat.combattants.filter((c) => c.camp === x.camp && c.rang === x.rang && !c.parti);
	const i = memes.indexOf(x);
	const cote = x.camp === "heros" ? -1 : 1;
	const profondeur = x.rang === "avant" ? 9 : 17;
	return new Vector3(cote * profondeur, 0, (i - (memes.size() - 1) / 2) * 7);
}

function creerPion(combat: Combat, x: Combattant): Pion {
	const g = gabarit(x);
	const modele = g ? g.Clone() : secours(x);
	modele.Name = x.id;
	if (x.type === "heros" && modele.FindFirstChild("UpperTorso")) equiperPersonnage(modele, CONTENU, equipementsDesHeros[x.herosId ?? ""], x.refId);
	if (x.boss && modele.GetAttribute("Humanoide") !== true) pcall(() => modele.ScaleTo(1.4));
	const racine = (modele.PrimaryPart ?? modele.FindFirstChildWhichIsA("BasePart"))!;
	modele.Parent = dossier;

	// posé au sol, tourné vers l'adversaire
	const ici = placeLocale(combat, x);
	const monde = repere.PointToWorldSpace(ici);
	const cible = repere.PointToWorldSpace(new Vector3(-math.sign(ici.X) * 10, 0, ici.Z));
	modele.PivotTo(CFrame.lookAt(monde, new Vector3(cible.X, monde.Y, cible.Z)));
	const [boite, taille] = modele.GetBoundingBox();
	const decalage = monde.Y - (boite.Position.Y - taille.Y / 2);
	modele.PivotTo(modele.GetPivot().add(new Vector3(0, decalage, 0)));

	const surbrillance = new Instance("Highlight");
	surbrillance.FillTransparency = 1;
	surbrillance.OutlineTransparency = 1;
	surbrillance.OutlineColor = Color3.fromRGB(255, 210, 110);
	surbrillance.DepthMode = Enum.HighlightDepthMode.Occluded;
	surbrillance.Parent = modele;

	const hauteur = (modele.GetAttribute("Hauteur") as number | undefined) ?? taille.Y;
	const panneau = new Instance("BillboardGui");
	panneau.Size = new UDim2(0, 150, 0, 36);
	panneau.StudsOffsetWorldSpace = new Vector3(0, hauteur * 0.5 + 1.5, 0);
	panneau.AlwaysOnTop = true;
	panneau.Adornee = racine;
	panneau.MaxDistance = 200;
	const nom = new Instance("TextLabel");
	nom.Size = new UDim2(1, 0, 0, 18);
	nom.BackgroundTransparency = 1;
	nom.TextColor3 = new Color3(1, 1, 1);
	nom.TextStrokeTransparency = 0.3;
	nom.Font = Enum.Font.GothamBold;
	nom.TextSize = 14;
	nom.Text = x.nom;
	nom.Parent = panneau;
	const fond = new Instance("Frame");
	fond.Position = new UDim2(0.1, 0, 0, 22);
	fond.Size = new UDim2(0.8, 0, 0, 7);
	fond.BackgroundColor3 = Color3.fromRGB(30, 20, 15);
	fond.BorderSizePixel = 0;
	new Instance("UICorner").Parent = fond;
	fond.Parent = panneau;
	const barre = new Instance("Frame");
	barre.Size = UDim2.fromScale(math.clamp(x.pv / math.max(1, x.pvMax), 0, 1), 1);
	barre.BackgroundColor3 = x.camp === "ennemis" ? Color3.fromRGB(220, 70, 60) : Color3.fromRGB(96, 190, 90);
	barre.BorderSizePixel = 0;
	new Instance("UICorner").Parent = barre;
	barre.Parent = fond;
	panneau.Parent = modele;

	const pion: Pion = { modele, racine, repos: modele.GetPivot(), pv: x.pv, pvMax: x.pvMax, barre, nom, surbrillance, pistes: new Map(), ko: false };
	const humanoide = modele.FindFirstChildOfClass("Humanoid");
	if (humanoide) {
		pion.animateur = humanoide.FindFirstChildOfClass("Animator") ?? new Instance("Animator", humanoide);
		jouerAnim(pion, "repos", true);
	}
	return pion;
}

function jouerAnim(p: Pion, cle: keyof typeof ANIM, boucle = false) {
	if (!p.animateur) return;
	pcall(() => {
		let piste = p.pistes.get(cle);
		if (!piste) {
			const a = new Instance("Animation");
			a.AnimationId = ANIM[cle];
			piste = p.animateur!.LoadAnimation(a);
			piste.Looped = boucle;
			p.pistes.set(cle, piste);
		}
		piste.Play(0.1);
	});
}

function majBarre(p: Pion) {
	TweenService.Create(p.barre, new TweenInfo(0.3), { Size: UDim2.fromScale(math.clamp(p.pv / math.max(1, p.pvMax), 0, 1), 1) }).Play();
}

// ───────────────────────────── Effets ─────────────────────────────

function chiffre(p: Pion, texte: string, couleur: Color3, gros = false) {
	const gui = new Instance("BillboardGui");
	gui.Size = new UDim2(0, 120, 0, 50);
	gui.AlwaysOnTop = true;
	gui.Adornee = p.racine;
	gui.StudsOffsetWorldSpace = new Vector3(math.random(-10, 10) / 10, 3, 0);
	const t = new Instance("TextLabel");
	t.Size = UDim2.fromScale(1, 1);
	t.BackgroundTransparency = 1;
	t.Text = texte;
	t.Font = Enum.Font.FredokaOne;
	t.TextSize = gros ? 40 : 30;
	t.TextColor3 = couleur;
	t.TextStrokeTransparency = 0;
	t.Parent = gui;
	gui.Parent = dossier;
	TweenService.Create(gui, new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { StudsOffsetWorldSpace: gui.StudsOffsetWorldSpace.add(new Vector3(0, 4, 0)) }).Play();
	TweenService.Create(t, new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.In), { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();
	task.delay(1.1, () => gui.Destroy());
}

function eclat(p: Pion, couleur: Color3, nombre = 24) {
	const a = new Instance("Attachment");
	a.Parent = p.racine;
	const e = new Instance("ParticleEmitter");
	e.Color = new ColorSequence(couleur);
	e.LightEmission = 1;
	e.Size = new NumberSequence([new NumberSequenceKeypoint(0, 0.8), new NumberSequenceKeypoint(1, 0)]);
	e.Speed = new NumberRange(8, 16);
	e.SpreadAngle = new Vector2(180, 180);
	e.Lifetime = new NumberRange(0.3, 0.6);
	e.Rate = 0;
	e.Parent = a;
	e.Emit(nombre);
	task.delay(1, () => a.Destroy());
}

function flash(p: Pion, couleur: Color3) {
	p.surbrillance.FillColor = couleur;
	p.surbrillance.FillTransparency = 0.35;
	TweenService.Create(p.surbrillance, new TweenInfo(0.35), { FillTransparency: 1 }).Play();
}

function secousse(force: number) {
	const camera = Workspace.CurrentCamera!;
	const base = camera.CFrame;
	task.spawn(() => {
		for (let i = 0; i < 6; i++) {
			camera.CFrame = base.mul(new CFrame(math.random(-10, 10) / 40 * force, math.random(-10, 10) / 40 * force, 0));
			task.wait(0.03);
		}
		camera.CFrame = base;
	});
}

// ───────────────────────────── Lecture des événements ─────────────────────────────

function jouerEvenement(e: EvenementCombat): number {
	const source = e.source !== undefined ? pions.get(e.source) : undefined;
	const cible = e.cible !== undefined ? pions.get(e.cible) : undefined;
	switch (e.type) {
		case "action": {
			if (source && cible && source !== cible && !source.ko) {
				const versCible = cible.racine.Position.sub(source.racine.Position);
				const distance = versCible.Magnitude;
				// corps à corps : attaque de mêlée ou compétence de mêlée → élan vers la cible ; sinon, incantation
				const attaquant = dernierCombat?.combattants.find((c) => c.id === e.source);
				const portee = e.competence === "attaque" ? attaquant?.attaque.portee : CONTENU.competences[e.competence ?? ""]?.portee;
				const corpsACorps = portee === "melee" && distance < 40;
				if (corpsACorps) {
					jouerAnim(source, math.random() < 0.5 ? "coup" : "estoc");
					const avance = source.repos.add(versCible.Unit.mul(math.max(0, distance - 5)));
					const aller = TweenService.Create(source.racine, new TweenInfo(0.18), { CFrame: new CFrame(avance.Position).mul(source.repos.Rotation) });
					aller.Completed.Connect(() => task.delay(0.15, () => TweenService.Create(source.racine, new TweenInfo(0.25), { CFrame: source.repos }).Play()));
					if (source.racine.Anchored) aller.Play();
				} else {
					jouerAnim(source, "sort");
					eclat(source, Color3.fromRGB(255, 230, 160), 12);
				}
			}
			return 0.45;
		}
		case "degats":
			if (cible) {
				jouer("coup");
				cible.pv = math.max(0, cible.pv - (e.valeur ?? 0));
				majBarre(cible);
				chiffre(cible, `${e.valeur ?? 0}`, e.critique ? Color3.fromRGB(255, 220, 60) : Color3.fromRGB(255, 90, 70), e.critique === true);
				flash(cible, Color3.fromRGB(255, 60, 50));
				eclat(cible, COULEUR_ELEMENT[e.element ?? "physique"] ?? new Color3(1, 1, 1), e.critique ? 40 : 20);
				if (e.critique) secousse(1.5);
			}
			return 0.4;
		case "soin":
			if (cible) {
				cible.pv = math.min(cible.pvMax, cible.pv + (e.valeur ?? 0));
				majBarre(cible);
				chiffre(cible, `+${e.valeur ?? 0}`, Color3.fromRGB(120, 255, 140));
				flash(cible, Color3.fromRGB(120, 255, 140));
				eclat(cible, Color3.fromRGB(150, 255, 170), 18);
			}
			return 0.35;
		case "rate":
			if (cible) chiffre(cible, "Raté", Color3.fromRGB(200, 200, 200));
			return 0.3;
		case "bouclier":
			if (cible) {
				flash(cible, Color3.fromRGB(120, 180, 255));
				chiffre(cible, "🛡", Color3.fromRGB(150, 200, 255));
			}
			return 0.3;
		case "etat":
			if (cible) eclat(cible, Color3.fromRGB(200, 150, 255), 14);
			return 0.25;
		case "ko":
			if (cible) {
				cible.ko = true;
				for (const [, piste] of cible.pistes) piste.Stop();
				const tombe = cible.repos.mul(CFrame.Angles(0, 0, math.rad(85))).add(new Vector3(0, -1.5, 0));
				if (cible.racine.Anchored) TweenService.Create(cible.racine, new TweenInfo(0.5, Enum.EasingStyle.Bounce), { CFrame: tombe }).Play();
				cible.surbrillance.FillColor = Color3.fromRGB(40, 40, 40);
				cible.surbrillance.FillTransparency = 0.5;
			}
			return 0.6;
		case "fin":
			if (e.texte.find("Victoire")[0] !== undefined) jouer("victoire");
			if (e.texte.find("Victoire")[0] !== undefined) for (const [, p] of pions) if (!p.ko && p.modele.Name.sub(1, 2) === "h:") jouerAnim(p, "victoire");
			return 0.3;
	}
	return 0.1;
}

function lireFile() {
	if (lecture) return;
	lecture = true;
	task.spawn(() => {
		while (file.size() > 0) {
			const e = file.shift()!;
			const [ok, duree] = pcall(() => jouerEvenement(e));
			task.wait(ok ? (duree as number) : 0.1);
		}
		lecture = false;
		// fin de la file : on recale tout sur l'état réel du combat
		if (dernierCombat) synchroniser(dernierCombat);
	});
}

function synchroniser(combat: Combat) {
	for (const x of combat.combattants) {
		const p = pions.get(x.id);
		if (!p) continue;
		p.pv = x.pv;
		p.pvMax = x.pvMax;
		majBarre(p);
		p.nom.Text = combat.enAttente === x.id ? `▶ ${x.nom}` : x.nom;
		p.nom.TextColor3 = combat.enAttente === x.id ? Color3.fromRGB(255, 210, 110) : new Color3(1, 1, 1);
		if (!x.ko && p.ko) {
			p.ko = false;
			if (p.racine.Anchored) TweenService.Create(p.racine, new TweenInfo(0.3), { CFrame: p.repos }).Play();
			p.surbrillance.FillTransparency = 1;
			jouerAnim(p, "repos", true);
		}
	}
}

// ───────────────────────────── Interface publique ─────────────────────────────

/** Met le combat à jour : crée les pions, puis joue les nouveaux événements dans l'ordre. */
export function afficherArene(combat: Combat, enDonjon: boolean) {
	if (combatAffiche !== combat.id) {
		cacherArene();
		combatAffiche = combat.id;
		dossier = new Instance("Folder");
		dossier.Name = "CombatLocal";
		dossier.Parent = Workspace;
		repere = choisirRepere(combat, enDonjon);
		// le combat commence : on ne rejoue pas les événements passés
		evenementsVus = combat.evenements.size();
	}
	dernierCombat = combat;
	for (const x of combat.combattants) {
		if (x.parti) {
			const p = pions.get(x.id);
			if (p) {
				p.modele.Destroy();
				pions.delete(x.id);
			}
			continue;
		}
		if (!pions.has(x.id)) pions.set(x.id, creerPion(combat, x));
	}
	const n = combat.evenements.size();
	for (let i = evenementsVus; i < n; i++) file.push(combat.evenements[i]);
	evenementsVus = n;
	if (file.size() > 0) lireFile();
	else synchroniser(combat);

	const camera = Workspace.CurrentCamera!;
	camera.CameraType = Enum.CameraType.Scriptable;
	const vue = CFrame.lookAt(repere.PointToWorldSpace(new Vector3(-6, 12, 30)), repere.PointToWorldSpace(new Vector3(2, 2, 0)));
	TweenService.Create(camera, new TweenInfo(0.6, Enum.EasingStyle.Sine), { CFrame: vue }).Play();
}

/** Contours dorés sur les cibles possibles ; un clic sur l'une d'elles appelle `choisir`. */
export function proposerCibles(ids: string[], choisir: ((id: string) => void) | undefined) {
	ciblesSurlignees = ids;
	surClic = choisir;
	for (const [id, p] of pions) {
		const ok = ids.includes(id);
		p.surbrillance.OutlineTransparency = ok ? 0 : 1;
	}
}

UserInputService.InputBegan.Connect((entree, traite) => {
	if (traite || !surClic || !dossier) return;
	if (entree.UserInputType !== Enum.UserInputType.MouseButton1 && entree.UserInputType !== Enum.UserInputType.Touch) return;
	const camera = Workspace.CurrentCamera!;
	const rayon = camera.ViewportPointToRay(entree.Position.X, entree.Position.Y);
	const params = new RaycastParams();
	params.FilterType = Enum.RaycastFilterType.Include;
	params.FilterDescendantsInstances = [dossier];
	const r = Workspace.Raycast(rayon.Origin, rayon.Direction.mul(500), params);
	let o: Instance | undefined = r?.Instance;
	while (o && o.Parent !== dossier) o = o.Parent;
	if (o && ciblesSurlignees.includes(o.Name)) surClic(o.Name);
});

/** Retire le combat (fin du combat ou changement d'écran). */
export function cacherArene() {
	dossier?.Destroy();
	dossier = undefined;
	combatAffiche = "";
	pions.clear();
	file.clear();
	dernierCombat = undefined;
	surClic = undefined;
	ciblesSurlignees = [];
	void Players;
}
