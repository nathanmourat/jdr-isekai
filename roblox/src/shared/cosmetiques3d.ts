/**
 * Effets 3D des cosmétiques de la boutique (auras, capes, titres, traces de pas) et des fêtes
 * (feu d'artifice, lanternes). Construits par le code, sans asset à importer.
 *  - le serveur les pose sur le personnage : tout le monde les voit ;
 *  - le client s'en sert pour « Essayer » (posés chez lui seulement, pendant quelques secondes).
 */
import { Debris, TweenService } from "@rbxts/services";
import { article, EMPLACEMENTS, type Emplacement } from "./boutique";

const DOSSIER = "Cosmetiques";

function sequence(couleurs: Color3[]): ColorSequence {
	if (couleurs.size() <= 1) return new ColorSequence(couleurs[0] ?? new Color3(1, 1, 1));
	const n = couleurs.size();
	return new ColorSequence(couleurs.map((c, i) => new ColorSequenceKeypoint(i / (n - 1), c)));
}

function attache(parent: BasePart, nom: string, pos = new Vector3()): Attachment {
	const a = new Instance("Attachment");
	a.Name = nom;
	a.Position = pos;
	a.Parent = parent;
	return a;
}

function emetteur(parent: Instance, r: Partial<WritableInstanceProperties<ParticleEmitter>>): ParticleEmitter {
	const e = new Instance("ParticleEmitter");
	for (const [k, v] of pairs(r)) (e as unknown as Record<string, unknown>)[k as string] = v;
	e.Parent = parent;
	return e;
}

// ───────────────────────────── Auras ─────────────────────────────

function aura(dossier: Folder, racine: BasePart, tete: BasePart | undefined, id: string, couleurs: Color3[]) {
	const a = attache(racine, "AuraCosmetique");
	const c = sequence(couleurs);
	const lumiere = new Instance("PointLight");
	lumiere.Color = couleurs[0];
	lumiere.Range = 8;
	lumiere.Brightness = 0.6;
	lumiere.Shadows = false;
	lumiere.Parent = a;
	if (id === "aura-lucioles") {
		emetteur(a, {
			Color: c, LightEmission: 1, Rate: 8, Lifetime: new NumberRange(2, 3.5), Speed: new NumberRange(0.5, 1.5),
			SpreadAngle: new Vector2(180, 180), Size: new NumberSequence([new NumberSequenceKeypoint(0, 0), new NumberSequenceKeypoint(0.2, 0.35), new NumberSequenceKeypoint(1, 0)]),
			Acceleration: new Vector3(0, 0.6, 0), RotSpeed: new NumberRange(-90, 90),
		});
	} else if (id === "aura-braises") {
		emetteur(a, {
			Color: c, LightEmission: 1, Rate: 14, Lifetime: new NumberRange(1, 2), Speed: new NumberRange(1, 3),
			SpreadAngle: new Vector2(40, 40), EmissionDirection: Enum.NormalId.Top, Acceleration: new Vector3(0, 3, 0),
			Size: new NumberSequence([new NumberSequenceKeypoint(0, 0.25), new NumberSequenceKeypoint(1, 0)]),
			Transparency: new NumberSequence(0, 0.6),
		});
	} else if (id === "aura-givre") {
		const haut = attache(racine, "GivreHaut", new Vector3(0, 4.5, 0));
		emetteur(haut, {
			Color: c, LightEmission: 0.4, Rate: 16, Lifetime: new NumberRange(2, 3), Speed: new NumberRange(1, 2),
			SpreadAngle: new Vector2(70, 70), EmissionDirection: Enum.NormalId.Bottom,
			Size: new NumberSequence(0.18), Transparency: new NumberSequence(0.1, 0.7), RotSpeed: new NumberRange(-120, 120),
		});
	} else if (id === "aura-voile") {
		emetteur(a, {
			Color: c, LightEmission: 0.6, Rate: 10, Lifetime: new NumberRange(1.5, 2.5), Speed: new NumberRange(0.5, 1.2),
			SpreadAngle: new Vector2(180, 30), Acceleration: new Vector3(0, 1.5, 0),
			Size: new NumberSequence([new NumberSequenceKeypoint(0, 0.6), new NumberSequenceKeypoint(1, 1.6)]),
			Transparency: new NumberSequence([new NumberSequenceKeypoint(0, 1), new NumberSequenceKeypoint(0.3, 0.55), new NumberSequenceKeypoint(1, 1)]),
			RotSpeed: new NumberRange(-40, 40),
		});
	} else if (id === "aura-aube") {
		emetteur(a, {
			Color: c, LightEmission: 1, Rate: 12, Lifetime: new NumberRange(1, 2), Speed: new NumberRange(1, 2.5),
			SpreadAngle: new Vector2(180, 180), Size: new NumberSequence([new NumberSequenceKeypoint(0, 0.3), new NumberSequenceKeypoint(1, 0)]),
		});
		lumiere.Range = 12;
		lumiere.Brightness = 1;
		// halo : un anneau de 12 perles de lumière au-dessus de la tête
		if (tete) {
			for (let i = 0; i < 12; i++) {
				const angle = (i / 12) * math.pi * 2;
				const perle = new Instance("Part");
				perle.Name = "Halo";
				perle.Shape = Enum.PartType.Ball;
				perle.Size = new Vector3(0.24, 0.24, 0.24);
				perle.Material = Enum.Material.Neon;
				perle.Color = couleurs[0];
				perle.CanCollide = false;
				perle.CanQuery = false;
				perle.CanTouch = false;
				perle.Massless = true;
				perle.CastShadow = false;
				perle.CFrame = tete.CFrame.mul(new CFrame(math.cos(angle) * 0.62, 1.05, math.sin(angle) * 0.62));
				const s = new Instance("WeldConstraint");
				s.Part0 = tete;
				s.Part1 = perle;
				s.Parent = perle;
				perle.Parent = dossier;
			}
		}
	}
}

// ───────────────────────────── Capes ─────────────────────────────

function cape(dossier: Folder, perso: Model, id: string, couleurs: Color3[]) {
	const torse = (perso.FindFirstChild("UpperTorso") ?? perso.FindFirstChild("Torso")) as BasePart | undefined;
	if (!torse) return;
	const largeur = math.max(1.6, torse.Size.X * 0.95);
	const tissu = new Instance("Part");
	tissu.Name = "Cape";
	tissu.Size = new Vector3(largeur, 3.4, 0.12);
	tissu.Color = couleurs[0];
	tissu.Material = id === "cape-brumes" ? Enum.Material.Glass : Enum.Material.Fabric;
	tissu.Transparency = id === "cape-brumes" ? 0.35 : 0;
	tissu.CanCollide = false;
	tissu.CanQuery = false;
	tissu.CanTouch = false;
	tissu.Massless = true;
	tissu.CastShadow = false;
	// dans le dos, un peu penchée, le haut aux épaules
	tissu.CFrame = torse.CFrame.mul(new CFrame(0, torse.Size.Y / 2 - 1.7, torse.Size.Z / 2 + 0.12)).mul(CFrame.Angles(math.rad(-8), 0, 0));
	const s = new Instance("WeldConstraint");
	s.Part0 = torse;
	s.Part1 = tissu;
	s.Parent = tissu;
	tissu.Parent = dossier;
	// liseré ou broderie dans la seconde couleur
	if (couleurs.size() > 1) {
		const bord = new Instance("Part");
		bord.Name = "Liseré";
		bord.Size = new Vector3(largeur + 0.04, 0.22, 0.14);
		bord.Color = couleurs[1];
		bord.Material = id === "cape-lysmont" ? Enum.Material.Neon : Enum.Material.Fabric;
		bord.CanCollide = false;
		bord.CanQuery = false;
		bord.CanTouch = false;
		bord.Massless = true;
		bord.CastShadow = false;
		bord.CFrame = tissu.CFrame.mul(new CFrame(0, -1.6, 0));
		const s2 = new Instance("WeldConstraint");
		s2.Part0 = tissu;
		s2.Part1 = bord;
		s2.Parent = bord;
		bord.Parent = dossier;
		if (id === "cape-lysmont") {
			// soleil levant brodé
			const soleil = new Instance("Part");
			soleil.Name = "Soleil";
			soleil.Shape = Enum.PartType.Cylinder;
			soleil.Size = new Vector3(0.05, 0.9, 0.9);
			soleil.Color = couleurs[1];
			soleil.Material = Enum.Material.Neon;
			soleil.CanCollide = false;
			soleil.CanQuery = false;
			soleil.CanTouch = false;
			soleil.Massless = true;
			soleil.CFrame = tissu.CFrame.mul(new CFrame(0, 0.4, 0.08)).mul(CFrame.Angles(0, math.rad(90), 0));
			const s3 = new Instance("WeldConstraint");
			s3.Part0 = tissu;
			s3.Part1 = soleil;
			s3.Parent = soleil;
			soleil.Parent = dossier;
		}
	}
}

// ───────────────────────────── Titre ─────────────────────────────

function titre(dossier: Folder, tete: BasePart, id: string, couleurs: Color3[]) {
	const a = article(id);
	if (!a) return;
	const gui = new Instance("BillboardGui");
	gui.Name = "TitreCosmetique";
	gui.Adornee = tete;
	gui.Size = new UDim2(0, 220, 0, 22);
	// au-dessus de l'étiquette de grade s'il y en a une
	gui.StudsOffset = new Vector3(0, tete.FindFirstChild("EtiquetteGrade") ? 3.4 : 2.6, 0);
	gui.MaxDistance = 80;
	const t = new Instance("TextLabel");
	t.Size = UDim2.fromScale(1, 1);
	t.BackgroundTransparency = 1;
	t.Font = Enum.Font.Garamond;
	t.TextSize = 18;
	t.TextColor3 = couleurs[0];
	t.TextStrokeTransparency = 0.35;
	t.Text = `« ${a.nom} »`;
	t.Parent = gui;
	if (a.rarete === "legendaire" || a.rarete === "epique") {
		const g = new Instance("UIGradient");
		g.Color = new ColorSequence([
			new ColorSequenceKeypoint(0, couleurs[0]),
			new ColorSequenceKeypoint(0.5, new Color3(1, 1, 1)),
			new ColorSequenceKeypoint(1, couleurs[0]),
		]);
		g.Parent = t;
		// reflet qui passe sur le texte
		const tw = TweenService.Create(g, new TweenInfo(2.5, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1), { Offset: new Vector2(1, 0) });
		g.Offset = new Vector2(-1, 0);
		tw.Play();
	}
	gui.Parent = dossier;
}

// ───────────────────────────── Traces de pas ─────────────────────────────

function trace(dossier: Folder, perso: Model, racine: BasePart, id: string, couleurs: Color3[]) {
	const pieds = ["LeftFoot", "RightFoot"].map((n) => perso.FindFirstChild(n) as BasePart | undefined);
	for (const pied of pieds) {
		const p = pied ?? racine;
		const a0 = attache(p, "TraceA", new Vector3(-0.3, pied ? -0.2 : -2.8, 0));
		const a1 = attache(p, "TraceB", new Vector3(0.3, pied ? -0.2 : -2.8, 0));
		const t = new Instance("Trail");
		t.Name = "TraceCosmetique";
		t.Attachment0 = a0;
		t.Attachment1 = a1;
		t.Color = sequence(couleurs);
		t.LightEmission = id === "trace-cendres" ? 0.3 : 1;
		t.Lifetime = 0.6;
		t.MinLength = 0.2;
		t.Transparency = new NumberSequence(0.2, 1);
		t.Parent = dossier;
		if (id === "trace-petales" || id === "trace-cendres") {
			emetteur(a0, {
				Color: sequence(couleurs), Rate: 6, Lifetime: new NumberRange(0.8, 1.4), Speed: new NumberRange(0.5, 1.5),
				SpreadAngle: new Vector2(60, 60), Acceleration: new Vector3(0, id === "trace-cendres" ? 1 : -1, 0),
				Size: new NumberSequence(0.18), RotSpeed: new NumberRange(-180, 180), LightEmission: id === "trace-cendres" ? 0.8 : 0.2,
			});
		}
		if (!pied) break;
	}
}

// ───────────────────────────── Pose et retrait ─────────────────────────────

/** Retire tous les cosmétiques d'un personnage. */
export function retirerCosmetiques(perso: Model, nom = DOSSIER) {
	perso.FindFirstChild(nom)?.Destroy();
	for (const d of perso.GetDescendants()) {
		if (d.IsA("Attachment") && (d.Name === "AuraCosmetique" || d.Name === "GivreHaut" || d.Name === "TraceA" || d.Name === "TraceB")) {
			if (d.GetAttribute("Dossier") === nom || d.GetAttribute("Dossier") === undefined) d.Destroy();
		}
	}
}

/**
 * Pose les cosmétiques portés sur un personnage (remplace les précédents).
 * `nom` : dossier où les ranger (« Cosmetiques » pour les vrais, « EssaiCosmetique » pour un essai chez soi).
 */
export function poserCosmetiques(perso: Model, equipes: Partial<Record<Emplacement, string>>, nom = DOSSIER) {
	retirerCosmetiques(perso, nom);
	const racine = perso.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	const tete = perso.FindFirstChild("Head") as BasePart | undefined;
	if (!racine) return;
	const dossier = new Instance("Folder");
	dossier.Name = nom;
	dossier.Parent = perso;
	const avant = new Set(perso.GetDescendants());
	for (const emp of EMPLACEMENTS) {
		const id = equipes[emp];
		const a = id !== undefined ? article(id) : undefined;
		if (!a || a.categorie !== emp) continue;
		if (emp === "aura") aura(dossier, racine, tete, a.id, a.couleurs);
		else if (emp === "cape") cape(dossier, perso, a.id, a.couleurs);
		else if (emp === "titre" && tete) titre(dossier, tete, a.id, a.couleurs);
		else if (emp === "trace") trace(dossier, perso, racine, a.id, a.couleurs);
		// "sorts" : rien sur le personnage, c'est l'arène de combat qui lit l'attribut du joueur
	}
	// les attaches posées sur le corps sont marquées pour pouvoir les retirer avec le bon dossier
	for (const d of perso.GetDescendants()) if (!avant.has(d) && d.IsA("Attachment")) d.SetAttribute("Dossier", nom);
}

/** Cache (chez soi seulement) les vrais cosmétiques pendant un essai, ou les remontre. */
export function masquerCosmetiques(perso: Model, masquer: boolean) {
	const d = perso.FindFirstChild(DOSSIER);
	const elements: Instance[] = d ? d.GetDescendants() : [];
	for (const x of perso.GetDescendants()) if (x.IsA("Attachment") && x.GetAttribute("Dossier") === DOSSIER) for (const y of x.GetDescendants()) elements.push(y);
	for (const x of elements) {
		if (x.IsA("BasePart")) x.LocalTransparencyModifier = masquer ? 1 : 0;
		else if (x.IsA("ParticleEmitter") || x.IsA("Trail") || x.IsA("Light") || x.IsA("BillboardGui")) x.Enabled = !masquer;
	}
}

// ───────────────────────────── Fêtes ─────────────────────────────

function eclatement(pos: Vector3, couleur: Color3, parent: Instance) {
	const p = new Instance("Part");
	p.Anchored = true;
	p.CanCollide = false;
	p.CanQuery = false;
	p.Transparency = 1;
	p.Size = new Vector3(1, 1, 1);
	p.Position = pos;
	p.Parent = parent;
	const e = emetteur(p, {
		Color: new ColorSequence(couleur), LightEmission: 1, Rate: 0, Lifetime: new NumberRange(1.2, 2),
		Speed: new NumberRange(18, 26), SpreadAngle: new Vector2(180, 180), Drag: 2.5, Acceleration: new Vector3(0, -6, 0),
		Size: new NumberSequence([new NumberSequenceKeypoint(0, 0.6), new NumberSequenceKeypoint(1, 0)]),
	});
	e.Emit(90);
	const l = new Instance("PointLight");
	l.Color = couleur;
	l.Range = 40;
	l.Brightness = 3;
	l.Parent = p;
	TweenService.Create(l, new TweenInfo(1.2), { Brightness: 0 }).Play();
	Debris.AddItem(p, 3);
}

/** Feu d'artifice au-dessus d'une position : trois fusées qui montent et éclatent. */
export function feuDArtifice(pos: Vector3, couleurs: Color3[], parent: Instance) {
	for (let i = 0; i < 3; i++) {
		task.delay(i * 0.7, () => {
			const fusee = new Instance("Part");
			fusee.Anchored = true;
			fusee.CanCollide = false;
			fusee.CanQuery = false;
			fusee.Material = Enum.Material.Neon;
			fusee.Color = new Color3(1, 0.9, 0.7);
			fusee.Size = new Vector3(0.4, 0.4, 0.4);
			const depart = pos.add(new Vector3(math.random(-6, 6), 2, math.random(-6, 6)));
			fusee.Position = depart;
			const a0 = attache(fusee, "A0", new Vector3(0, 0.2, 0));
			const a1 = attache(fusee, "A1", new Vector3(0, -0.2, 0));
			const t = new Instance("Trail");
			t.Attachment0 = a0;
			t.Attachment1 = a1;
			t.LightEmission = 1;
			t.Lifetime = 0.4;
			t.Color = new ColorSequence(Color3.fromRGB(255, 220, 160));
			t.Parent = fusee;
			fusee.Parent = parent;
			const haut = depart.add(new Vector3(math.random(-4, 4), 38 + math.random(0, 10), math.random(-4, 4)));
			const tw = TweenService.Create(fusee, new TweenInfo(1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Position: haut });
			tw.Completed.Connect(() => {
				eclatement(haut, couleurs[i % couleurs.size()], parent);
				fusee.Destroy();
			});
			tw.Play();
		});
	}
}

/** Lâcher de lanternes célestes : elles montent lentement en se balançant, puis s'éteignent. */
export function lacherDeLanternes(pos: Vector3, couleurs: Color3[], parent: Instance) {
	for (let i = 0; i < 10; i++) {
		task.delay(i * 0.35, () => {
			const l = new Instance("Part");
			l.Anchored = true;
			l.CanCollide = false;
			l.CanQuery = false;
			l.Material = Enum.Material.Neon;
			l.Color = couleurs[i % couleurs.size()];
			l.Size = new Vector3(0.9, 1.2, 0.9);
			l.Transparency = 0.15;
			const depart = pos.add(new Vector3(math.random(-8, 8), 3, math.random(-8, 8)));
			l.Position = depart;
			const lum = new Instance("PointLight");
			lum.Color = l.Color;
			lum.Range = 14;
			lum.Brightness = 1.4;
			lum.Parent = l;
			l.Parent = parent;
			const duree = 9 + math.random() * 3;
			const arrivee = depart.add(new Vector3(math.random(-12, 12), 70 + math.random(0, 25), math.random(-12, 12)));
			TweenService.Create(l, new TweenInfo(duree, Enum.EasingStyle.Sine, Enum.EasingDirection.Out), { Position: arrivee }).Play();
			task.delay(duree - 2, () => {
				TweenService.Create(l, new TweenInfo(2), { Transparency: 1 }).Play();
				TweenService.Create(lum, new TweenInfo(2), { Brightness: 0 }).Play();
			});
			Debris.AddItem(l, duree + 0.5);
		});
	}
}
