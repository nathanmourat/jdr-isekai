/**
 * Boutique en Robux (cosmétiques seulement, voir shared/boutique.ts).
 *  - Game Pass : Roblox dit qui le possède (UserOwnsGamePassAsync, vérifié à l'arrivée et après un achat).
 *  - Developer Product : chaque achat passe par ProcessReceipt. Le reçu est noté dans la même écriture que le
 *    déblocage (UpdateAsync), donc un achat n'est jamais compté deux fois, même si Roblox le renvoie.
 *    On ne répond « accordé » qu'une fois la sauvegarde réussie (sinon Roblox réessaiera plus tard).
 *  - Sauvegarde : DataStore « VelmarisBoutique_v1 », clé u<UserId> → possédés, portés, charges, reçus.
 *  - Ce que porte un joueur est écrit dans son attribut « Cosmetiques » (vu par tous) et posé sur son personnage.
 * Le propriétaire du jeu a tout. Dans Studio, « Essai Studio » débloque un article en mémoire (rien n'est gardé).
 */
import { DataStoreService, MarketplaceService, Players, RunService, Workspace } from "@rbxts/services";
import {
	article,
	ARTICLES,
	ATTRIBUT_COSMETIQUES,
	ecrireCosmetiques,
	type CommandeBoutique,
	type Emplacement,
	type EtatBoutique,
} from "shared/boutique";
import { feuDArtifice, lacherDeLanternes, poserCosmetiques } from "shared/cosmetiques3d";
import { reseau, type ReponseCommande } from "shared/reseau";
import { gradeDe } from "./moderation";

interface DonneesBoutique {
	possedes: string[];
	equipes: Partial<Record<Emplacement, string>>;
	charges: Record<string, number>;
	/** Derniers reçus traités (PurchaseId), pour ne jamais compter un achat deux fois. */
	recus: string[];
}

const r = reseau();
const STUDIO = RunService.IsStudio();

let store: DataStore | undefined;
{
	const [ok] = pcall(() => {
		store = DataStoreService.GetDataStore("VelmarisBoutique_v1");
		store.GetAsync("test");
	});
	if (!ok) store = undefined;
}
const memoire = new Map<number, DonneesBoutique>();

const vide = (): DonneesBoutique => ({ possedes: [], equipes: {}, charges: {}, recus: [] });

function normaliser(d: unknown): DonneesBoutique {
	const x = (d ?? {}) as Partial<DonneesBoutique>;
	return { possedes: x.possedes ?? [], equipes: x.equipes ?? {}, charges: x.charges ?? {}, recus: x.recus ?? [] };
}

/** Modifie la sauvegarde d'un joueur. Renvoie la nouvelle valeur, ou undefined si l'écriture a échoué. */
function modifier(userId: number, f: (d: DonneesBoutique) => DonneesBoutique | undefined): DonneesBoutique | undefined {
	if (!store) {
		const avant = memoire.get(userId) ?? vide();
		const apres = f(normaliser(avant)) ?? avant;
		memoire.set(userId, apres);
		return apres;
	}
	let resultat: DonneesBoutique | undefined;
	const [ok, err] = pcall(() =>
		store!.UpdateAsync(`u${userId}`, (ancien: unknown) => {
			const avant = normaliser(ancien);
			const apres = f(avant);
			resultat = apres ?? avant;
			// undefined = rien à changer (UpdateAsync n'écrit pas)
			return $tuple(apres as unknown as DonneesBoutique);
		}),
	);
	if (!ok) {
		warn(`[Velmaris] Boutique, sauvegarde de ${userId} : ${tostring(err)}`);
		return undefined;
	}
	return resultat;
}

function lire(userId: number): DonneesBoutique {
	if (!store) return memoire.get(userId) ?? vide();
	const [ok, d] = pcall(() => store!.GetAsync(`u${userId}`)[0]);
	return ok ? normaliser(d) : vide();
}

// ───────────────────────────── Ce que possède un joueur ─────────────────────────────

const donnees = new Map<Player, DonneesBoutique>();
const passes = new Map<Player, Set<string>>();
const essais = new Map<Player, Set<string>>();

function passesDe(p: Player): Set<string> {
	let s = passes.get(p);
	if (!s) {
		s = new Set();
		passes.set(p, s);
	}
	return s;
}

function verifierPasses(p: Player) {
	const s = passesDe(p);
	for (const a of ARTICLES) {
		if (a.achat.type !== "pass" || a.achat.numero === 0 || s.has(a.id)) continue;
		const [ok, oui] = pcall(() => MarketplaceService.UserOwnsGamePassAsync(p.UserId as never, a.achat.numero));
		if (ok && oui === true) s.add(a.id);
	}
}

function proprietaire(p: Player): boolean {
	return gradeDe(p) === "proprietaire";
}

/** Tous les articles débloqués (packs compris). */
function possedes(p: Player): Set<string> {
	const s = new Set<string>();
	if (proprietaire(p)) {
		for (const a of ARTICLES) s.add(a.id);
		return s;
	}
	const ajouter = (id: string) => {
		s.add(id);
		for (const x of article(id)?.contenu ?? []) s.add(x);
	};
	for (const id of donnees.get(p)?.possedes ?? []) ajouter(id);
	for (const id of passesDe(p)) ajouter(id);
	const essaisDuJoueur = essais.get(p);
	if (essaisDuJoueur) for (const id of essaisDuJoueur) ajouter(id);
	return s;
}

function etatPour(p: Player): EtatBoutique {
	const d = donnees.get(p) ?? vide();
	const liste: string[] = [];
	for (const id of possedes(p)) liste.push(id);
	return { possedes: liste, equipes: d.equipes, charges: d.charges, proprietaire: proprietaire(p), studio: STUDIO };
}

function envoyer(p: Player) {
	r.etatBoutique.FireClient(p, etatPour(p));
}

/** Pose les cosmétiques portés (seulement ceux qu'on possède encore) et met à jour l'attribut du joueur. */
function habiller(p: Player) {
	const d = donnees.get(p);
	if (!d) return;
	const ok = possedes(p);
	const portes: Partial<Record<Emplacement, string>> = {};
	for (const [emp, id] of pairs(d.equipes)) if (ok.has(id)) portes[emp] = id;
	p.SetAttribute(ATTRIBUT_COSMETIQUES, ecrireCosmetiques(portes));
	const perso = p.Character;
	if (perso) pcall(() => poserCosmetiques(perso, portes));
}

// ───────────────────────────── Achats ─────────────────────────────

/** Un achat de Developer Product : noté avec son reçu, en une seule écriture. */
function traiterRecu(recu: ReceiptInfo): Enum.ProductPurchaseDecision {
	const a = ARTICLES.find((x) => x.achat.type === "produit" && x.achat.numero !== 0 && x.achat.numero === recu.ProductId);
	if (!a) {
		warn(`[Velmaris] Boutique : produit inconnu ${recu.ProductId} (numéro absent de shared/boutique.ts ?)`);
		return Enum.ProductPurchaseDecision.NotProcessedYet;
	}
	const nouveau = modifier(recu.PlayerId, (d) => {
		if (d.recus.includes(recu.PurchaseId)) return undefined; // déjà accordé
		if (a.charges !== undefined) d.charges[a.id] = (d.charges[a.id] ?? 0) + a.charges;
		else if (!d.possedes.includes(a.id)) d.possedes.push(a.id);
		d.recus = [recu.PurchaseId, ...d.recus].filter((_, i) => i < 100);
		return d;
	});
	if (!nouveau) return Enum.ProductPurchaseDecision.NotProcessedYet;
	const p = Players.GetPlayerByUserId(recu.PlayerId);
	if (p) {
		donnees.set(p, nouveau);
		envoyer(p);
	}
	return Enum.ProductPurchaseDecision.PurchaseGranted;
}

// ───────────────────────────── Commandes des joueurs ─────────────────────────────

const derniereFete = new Map<Player, number>();

function commande(p: Player, c: CommandeBoutique): ReponseCommande {
	if (!donnees.has(p)) return { ok: false, erreur: "La boutique se charge encore, réessaie dans un instant." };
	switch (c.type) {
		case "etat":
			envoyer(p);
			return { ok: true };
		case "equiper": {
			const a = article(c.id);
			if (!a || a.categorie === "fete" || a.categorie === "pack") return { ok: false, erreur: "Cet article ne se porte pas." };
			if (!possedes(p).has(a.id)) return { ok: false, erreur: "Tu ne possèdes pas encore cet article." };
			const emp = a.categorie;
			const nouveau = modifier(p.UserId, (d) => ((d.equipes[emp] = a.id), d));
			if (!nouveau) return { ok: false, erreur: "La sauvegarde n'a pas répondu, réessaie." };
			donnees.set(p, nouveau);
			break;
		}
		case "retirer": {
			const nouveau = modifier(p.UserId, (d) => {
				delete d.equipes[c.emplacement];
				return d;
			});
			if (!nouveau) return { ok: false, erreur: "La sauvegarde n'a pas répondu, réessaie." };
			donnees.set(p, nouveau);
			break;
		}
		case "utiliser": {
			const a = article(c.id);
			if (!a || a.categorie !== "fete") return { ok: false, erreur: "Rien à lancer." };
			const maintenant = os.clock();
			if (maintenant - (derniereFete.get(p) ?? -100) < 12) return { ok: false, erreur: "Attends quelques secondes avant la prochaine fête." };
			const racine = p.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
			if (!racine) return { ok: false, erreur: "Ton personnage n'est pas encore là." };
			const gratuit = proprietaire(p) || (essais.get(p)?.has(a.id) ?? false);
			if (!gratuit) {
				let consomme = false;
				const nouveau = modifier(p.UserId, (d) => {
					if ((d.charges[a.id] ?? 0) <= 0) return undefined;
					d.charges[a.id] -= 1;
					consomme = true;
					return d;
				});
				if (!nouveau) return { ok: false, erreur: "La sauvegarde n'a pas répondu, réessaie." };
				donnees.set(p, nouveau);
				if (!consomme) {
					envoyer(p);
					return { ok: false, erreur: "Plus d'utilisation : rachète-en dans la boutique." };
				}
			}
			derniereFete.set(p, maintenant);
			const dossier = Workspace.FindFirstChild("Fetes") ?? (() => {
				const f = new Instance("Folder");
				f.Name = "Fetes";
				f.Parent = Workspace;
				return f;
			})();
			if (a.id === "fete-artifice") feuDArtifice(racine.Position, a.couleurs, dossier);
			else lacherDeLanternes(racine.Position, a.couleurs, dossier);
			envoyer(p);
			return { ok: true };
		}
		case "essai_studio": {
			if (!STUDIO) return { ok: false, erreur: "Seulement dans Studio." };
			let s = essais.get(p);
			if (!s) {
				s = new Set();
				essais.set(p, s);
			}
			s.add(c.id);
			envoyer(p);
			return { ok: true, info: "Débloqué pour ce test seulement (rien n'est sauvegardé)." };
		}
	}
	habiller(p);
	envoyer(p);
	return { ok: true };
}

// ───────────────────────────── Démarrage ─────────────────────────────

function arrivee(p: Player) {
	task.spawn(() => {
		verifierPasses(p);
		donnees.set(p, lire(p.UserId));
		habiller(p);
		envoyer(p);
	});
	p.CharacterAdded.Connect(() => {
		// après l'étiquette de grade (posée 0,5 s après l'apparition), pour placer le titre au-dessus
		task.wait(1);
		habiller(p);
	});
}

export function preparerBoutique() {
	MarketplaceService.ProcessReceipt = traiterRecu;
	MarketplaceService.PromptGamePassPurchaseFinished.Connect((p, numero, achete) => {
		if (!achete) return;
		const a = ARTICLES.find((x) => x.achat.type === "pass" && x.achat.numero === numero);
		if (!a) return;
		passesDe(p).add(a.id);
		habiller(p);
		envoyer(p);
	});
	r.boutique.OnServerInvoke = (p, c) => {
		const [ok, res] = pcall(() => commande(p, c as CommandeBoutique));
		return ok ? res : { ok: false, erreur: "Erreur de la boutique." };
	};
	Players.PlayerAdded.Connect(arrivee);
	for (const p of Players.GetPlayers()) arrivee(p);
	Players.PlayerRemoving.Connect((p) => {
		donnees.delete(p);
		passes.delete(p);
		essais.delete(p);
		derniereFete.delete(p);
	});
}
