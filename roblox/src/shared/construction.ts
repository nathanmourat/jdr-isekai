/**
 * Petits outils de construction 3D partagés (serveur et joueurs) : pièces soudées et armes selon la classe.
 */
const rgb = (r: number, g: number, b: number) => Color3.fromRGB(r, g, b);

// ───────────────────────────── Outils ─────────────────────────────

export function piece(modele: Model, nom: string, taille: Vector3, cf: CFrame, couleur: Color3, options: { forme?: Enum.PartType; matiere?: Enum.Material; transparence?: number; neon?: boolean } = {}): Part {
	const p = new Instance("Part");
	p.Name = nom;
	p.Size = taille;
	p.CFrame = cf;
	p.Color = couleur;
	p.Material = options.neon ? Enum.Material.Neon : options.matiere ?? Enum.Material.SmoothPlastic;
	p.Transparency = options.transparence ?? 0;
	if (options.forme) p.Shape = options.forme;
	p.CanCollide = false;
	p.Anchored = false;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	p.Parent = modele;
	return p;
}

export function souder(a: BasePart, b: BasePart) {
	const w = new Instance("WeldConstraint");
	w.Part0 = a;
	w.Part1 = b;
	w.Parent = b;
}

// ───────────────────────────── Armes (selon la classe) ─────────────────────────────

/** Ajoute l'arme de la classe dans les mains d'un personnage R15. */
export function arme(modele: Model, classe: string) {
	const main = modele.FindFirstChild("RightHand") as BasePart | undefined;
	const gauche = modele.FindFirstChild("LeftHand") as BasePart | undefined;
	if (!main) return;
	const objet = new Instance("Model");
	objet.Name = "Arme";
	objet.Parent = modele;
	const cf = main.CFrame;
	const ajouter = (nom: string, taille: Vector3, decalage: CFrame, couleur: Color3, opt: Parameters<typeof piece>[5] = {}, surGauche = false) => {
		const base = surGauche && gauche ? gauche : main;
		const p = piece(objet, nom, taille, base.CFrame.mul(decalage), couleur, opt);
		souder(base, p);
		return p;
	};
	switch (classe) {
		case "lame-runique":
			ajouter("Lame", new Vector3(0.3, 0.15, 3.6), new CFrame(0, -0.2, -1.9), rgb(200, 210, 230), { matiere: Enum.Material.Metal });
			ajouter("Rune", new Vector3(0.32, 0.17, 1.2), new CFrame(0, -0.2, -1.3), rgb(90, 150, 255), { neon: true });
			break;
		case "berserker":
			ajouter("Manche", new Vector3(0.3, 0.3, 4), new CFrame(0, -0.2, -1.6), rgb(110, 75, 45), { matiere: Enum.Material.Wood });
			ajouter("Fer", new Vector3(0.25, 1.8, 1.4), new CFrame(0, 0.4, -3.3), rgb(170, 170, 180), { matiere: Enum.Material.Metal });
			break;
		case "gardien":
			ajouter("Masse", new Vector3(0.3, 0.3, 2.6), new CFrame(0, -0.2, -1.2), rgb(150, 150, 160), { matiere: Enum.Material.Metal });
			ajouter("Tete", new Vector3(0.9, 0.9, 0.9), new CFrame(0, -0.2, -2.5), rgb(150, 150, 160), { matiere: Enum.Material.Metal, forme: Enum.PartType.Ball });
			ajouter("Bouclier", new Vector3(0.3, 2.6, 2), new CFrame(-0.4, 0, 0), rgb(60, 80, 150), { matiere: Enum.Material.Metal }, true);
			break;
		case "archer":
			ajouter("Arc", new Vector3(0.2, 4, 0.3), new CFrame(0, 0, -0.3), rgb(120, 85, 50), { matiere: Enum.Material.Wood }, true);
			ajouter("Corde", new Vector3(0.05, 3.8, 0.05), new CFrame(0, 0, 0.1), rgb(230, 230, 220), {}, true);
			break;
		case "ombre":
			ajouter("Dague", new Vector3(0.2, 0.1, 1.6), new CFrame(0, -0.2, -0.9), rgb(60, 60, 70), { matiere: Enum.Material.Metal });
			ajouter("Dague2", new Vector3(0.2, 0.1, 1.6), new CFrame(0, -0.2, -0.9), rgb(60, 60, 70), { matiere: Enum.Material.Metal }, true);
			break;
		case "barde":
			ajouter("Luth", new Vector3(0.5, 1.6, 1.2), new CFrame(0, 0, -0.6), rgb(160, 100, 50), { matiere: Enum.Material.Wood, forme: Enum.PartType.Ball }, true);
			break;
		case "alchimiste":
			ajouter("Fiole", new Vector3(0.7, 0.7, 0.7), new CFrame(0, -0.4, -0.3), rgb(80, 220, 120), { neon: true, forme: Enum.PartType.Ball });
			break;
		default: {
			// bâtons : arcaniste (violet), guérisseur (or), invocateur (vert)
			const couleurs: Record<string, Color3> = { arcaniste: rgb(170, 90, 255), guerisseur: rgb(255, 220, 120), invocateur: rgb(90, 230, 150) };
			ajouter("Baton", new Vector3(0.25, 0.25, 5), new CFrame(0, -0.2, -1.6), rgb(110, 80, 50), { matiere: Enum.Material.Wood });
			ajouter("Orbe", new Vector3(0.8, 0.8, 0.8), new CFrame(0, -0.2, -4.2), couleurs[classe] ?? rgb(170, 90, 255), { neon: true, forme: Enum.PartType.Ball });
		}
	}
}

