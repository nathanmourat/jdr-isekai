/**
 * Pierres de voyage (serveur) : les obélisques lumineux au centre des villes, et la découverte.
 * Un joueur qui passe à moins de 35 studs d'une pierre l'active ; la liste est gardée dans le DataStore
 * « VelmarisVoyage_v1 » et envoyée à son appareil par l'attribut « PierresConnues » (texte JSON).
 */
import { CollectionService, DataStoreService, HttpService, Players } from "@rbxts/services";
import { reseau } from "shared/reseau";
import { pierresDeVoyage, type Pierre } from "shared/voyage";
import { bloc, C, VERTICAL } from "./decor";
import { auSol } from "./paysage";

const r = reseau();
const rgb = (r2: number, g: number, b: number) => Color3.fromRGB(r2, g, b);

let store: DataStore | undefined;
{
	const [ok] = pcall(() => {
		store = DataStoreService.GetDataStore("VelmarisVoyage_v1");
		store.GetAsync("test");
	});
	if (!ok) store = undefined;
}
const memoire = new Map<number, string[]>();
const connues = new Map<Player, Set<string>>();

function publier(p: Player) {
	const s = connues.get(p);
	const liste: string[] = [];
	if (s) for (const id of s) liste.push(id);
	p.SetAttribute("PierresConnues", HttpService.JSONEncode(liste));
}

function charger(p: Player) {
	let liste: string[] = [];
	if (store) {
		const [ok, res] = pcall(() => store!.GetAsync(`u${p.UserId}`)[0]);
		if (ok && typeIs(res, "table")) liste = res as string[];
	} else liste = memoire.get(p.UserId) ?? [];
	connues.set(p, new Set(liste));
	publier(p);
}

function decouvrir(p: Player, pierre: Pierre) {
	const s = connues.get(p);
	if (!s || s.has(pierre.id)) return;
	s.add(pierre.id);
	publier(p);
	const liste: string[] = [];
	for (const id of s) liste.push(id);
	if (store) task.spawn(() => pcall(() => store!.SetAsync(`u${p.UserId}`, liste)));
	else memoire.set(p.UserId, liste);
	r.message.FireClient(p, { titre: "🌀 Pierre de voyage", texte: `${pierre.nom} : pierre de voyage activée. Tu pourras y revenir en un instant depuis n'importe quelle autre pierre (menu 🗺 Carte ou en touchant une pierre).`, genre: "info" });
}

/** Obélisque de pierre, rune lumineuse qui tourne, invite « Pierre de voyage ». */
function obelisque(pierre: Pierre, parent: Instance) {
	const m = new Instance("Model");
	m.Name = `Pierre-${pierre.id}`;
	m.Parent = parent;
	const base = auSol(pierre.position);
	bloc(new Vector3(7, 1, 7), base.add(new Vector3(0, 0.5, 0)), C.pierreClaire, { parent: m, matiere: Enum.Material.Cobblestone });
	bloc(new Vector3(5, 1, 5), base.add(new Vector3(0, 1.5, 0)), C.pierre, { parent: m, matiere: Enum.Material.Slate });
	const corps = bloc(new Vector3(2.6, 9, 2.6), base.add(new Vector3(0, 6.5, 0)), rgb(70, 75, 95), { parent: m, matiere: Enum.Material.Slate, nom: "Obelisque" });
	bloc(new Vector3(1.6, 2, 1.6), base.add(new Vector3(0, 12, 0)), rgb(70, 75, 95), { parent: m, matiere: Enum.Material.Slate, forme: "coin" });
	for (const z of [-1.32, 1.32]) {
		const rune = bloc(new Vector3(1.2, 4, 0.1), base.add(new Vector3(0, 6.5, z)), rgb(120, 200, 255), { parent: m, neon: true, collision: false });
		void rune;
	}
	const cristal = bloc(new Vector3(1.4, 1.4, 1.4), base.add(new Vector3(0, 14.5, 0)), rgb(140, 210, 255), { parent: m, neon: true, forme: "boule", collision: false, nom: "Cristal" });
	const l = new Instance("PointLight");
	l.Color = rgb(140, 210, 255);
	l.Range = 18;
	l.Brightness = 1.5;
	l.Parent = cristal;
	const e = new Instance("ParticleEmitter");
	e.Color = new ColorSequence(rgb(150, 220, 255));
	e.LightEmission = 1;
	e.Rate = 6;
	e.Lifetime = new NumberRange(1.5, 2.5);
	e.Speed = new NumberRange(0.5, 1.5);
	e.Size = new NumberSequence(0.3, 0);
	e.SpreadAngle = new Vector2(180, 180);
	e.Parent = cristal;
	const invite = new Instance("ProximityPrompt");
	invite.ActionText = "Voyager";
	invite.ObjectText = `Pierre de voyage — ${pierre.nom}`;
	invite.HoldDuration = 0;
	invite.MaxActivationDistance = 12;
	invite.RequiresLineOfSight = false;
	invite.SetAttribute("Lieu", `pierre-${pierre.id}`);
	invite.SetAttribute("Action", "voyage");
	invite.Parent = corps;
	CollectionService.AddTag(m, "PierreVoyage");
	m.SetAttribute("Pierre", pierre.id);
	void VERTICAL;
}

/** Construit les pierres (après les régions : elles se posent sur leur terrain) et surveille les découvertes. */
export function preparerPierres(parent: Instance) {
	const dossier = new Instance("Folder");
	dossier.Name = "PierresDeVoyage";
	dossier.Parent = parent;
	for (const p of pierresDeVoyage()) pcall(() => obelisque(p, dossier));
	for (const p of Players.GetPlayers()) task.spawn(charger, p);
	Players.PlayerAdded.Connect((p) => charger(p));
	Players.PlayerRemoving.Connect((p) => connues.delete(p));
	task.spawn(() => {
		while (true) {
			task.wait(2);
			for (const p of Players.GetPlayers()) {
				const rac = p.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
				if (!rac || !connues.has(p)) continue;
				for (const pierre of pierresDeVoyage()) {
					if (new Vector3(rac.Position.X - pierre.position.X, 0, rac.Position.Z - pierre.position.Z).Magnitude < 35) decouvrir(p, pierre);
				}
			}
		}
	});
}
