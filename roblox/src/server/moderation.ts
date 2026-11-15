/**
 * Modération du serveur Roblox : grades (joueur, modérateur, administrateur, propriétaire), sanctions et journal.
 *  - Les permissions de chaque grade sont dans shared/grades.ts.
 *  - Le propriétaire est le créateur du jeu (ou le rang 255 du groupe propriétaire, ou PROPRIETAIRES_EN_PLUS) ;
 *    dans un test Studio à plusieurs joueurs, c'est Player1. Les autres grades sont nommés en jeu et sauvegardés.
 *  - Sanctions sauvegardées (elles suivent le joueur sur tous les serveurs) : bannissement (temporaire ou définitif)
 *    et mise en sourdine du chat. Figer, déplacer, renvoyer : sur ce serveur seulement.
 *  - Toute action de modération (et tout signalement d'un joueur) est écrite dans le journal de modération.
 */
import { DataStoreService, Players, RunService, TextChatService, Workspace } from "@rbxts/services";
import {
	aPermission,
	BAN_DEFINITIF,
	DUREES_BAN,
	DUREES_MUET,
	ETIQUETTES,
	NIVEAU_GRADE,
	NOMS_GRADES,
	peutAgirSur,
	PROPRIETAIRES_EN_PLUS,
	RAISONS,
	texteDuree,
	type CommandeModeration,
	type EntreeJournalModeration,
	type EtatModeration,
	type Grade,
	type Permission,
} from "shared/grades";
import { idJoueur, reseau, type ReponseCommande } from "shared/reseau";
import { filtrer, messageErreur, partieDe, toutEnregistrer } from "./parties";

const r = reseau();

// ───────────────────────────── Sauvegarde (avec repli en mémoire dans Studio) ─────────────────────────────

interface Sanctions {
	ban?: { jusqua: number; raison: string; par: string };
	muet?: { jusqua: number; raison: string };
}

type NomStore = "VelmarisGrades_v1" | "VelmarisSanctions_v1" | "VelmarisJournalModeration_v1";
const storeGrades: NomStore = "VelmarisGrades_v1";
const storeSanctions: NomStore = "VelmarisSanctions_v1";
const storeJournal: NomStore = "VelmarisJournalModeration_v1";
const stores = new Map<NomStore, DataStore>();
let memoire = false;
{
	const [ok] = pcall(() => {
		for (const n of [storeGrades, storeSanctions, storeJournal]) stores.set(n, DataStoreService.GetDataStore(n));
		stores.get(storeGrades)!.GetAsync("test");
	});
	if (!ok) memoire = true;
}
/** Sans accès aux DataStores (Studio non publié) : tout est gardé en mémoire, le temps du test. */
const memoireCles = new Map<string, unknown>();

function lire<T>(nom: NomStore, cle: string): T | undefined {
	const store = stores.get(nom);
	if (memoire || !store) return memoireCles.get(`${nom}:${cle}`) as T | undefined;
	const [ok, res] = pcall(() => store.GetAsync(cle)[0]);
	return ok ? (res as T | undefined) : undefined;
}

function modifier<T>(nom: NomStore, cle: string, f: (ancien: T | undefined) => T) {
	const store = stores.get(nom);
	if (memoire || !store) {
		const k = `${nom}:${cle}`;
		memoireCles.set(k, f(memoireCles.get(k) as T | undefined));
		return;
	}
	pcall(() => store.UpdateAsync(cle, (ancien: unknown) => $tuple(f(ancien as T | undefined))));
}

// ───────────────────────────── Grades ─────────────────────────────

/** Grades nommés en jeu (UserId → grade), lus au démarrage du serveur puis tenus à jour. */
let grades: Record<string, { grade: Grade; nom: string }> = {};
task.spawn(() => {
	grades = lire<Record<string, { grade: Grade; nom: string }>>(storeGrades, "grades") ?? {};
	for (const p of Players.GetPlayers()) appliquerEtiquette(p);
	diffuser();
});

function estProprietaire(p: Player): boolean {
	if (PROPRIETAIRES_EN_PLUS.includes(p.UserId)) return true;
	// Studio : à plusieurs joueurs (test local), Player1 (identifiant -1) est le propriétaire ;
	// en « Jouer » seul dans un jeu pas encore publié (CreatorId = 0), c'est toi
	if (RunService.IsStudio() && (p.UserId === -1 || (game.CreatorId === 0 && p.UserId > 0))) return true;
	if (game.CreatorType === Enum.CreatorType.User) return p.UserId === game.CreatorId;
	const [ok, rang] = pcall(() => p.GetRankInGroup(game.CreatorId));
	return ok && rang === 255;
}

const cacheProprietaire = new Map<Player, boolean>();
export function gradeDe(p: Player): Grade {
	let prop = cacheProprietaire.get(p);
	if (prop === undefined) {
		prop = estProprietaire(p);
		cacheProprietaire.set(p, prop);
	}
	if (prop) return "proprietaire";
	return grades[tostring(p.UserId)]?.grade ?? "joueur";
}

function gradeParId(userId: number): Grade {
	const p = Players.GetPlayerByUserId(userId);
	if (p) return gradeDe(p);
	return grades[tostring(userId)]?.grade ?? "joueur";
}

// ───────────────────────────── Journal ─────────────────────────────

let journal: EntreeJournalModeration[] = [];
task.spawn(() => (journal = lire<EntreeJournalModeration[]>(storeJournal, "journal") ?? []));

function noter(par: string, action: string, cible?: string, detail?: string) {
	const e: EntreeJournalModeration = { t: os.time(), par, action, cible, detail };
	journal = [e, ...journal].filter((_, i) => i < 200);
	task.spawn(() => modifier<EntreeJournalModeration[]>(storeJournal, "journal", (a) => [e, ...(a ?? [])].filter((_, i) => i < 200)));
}

// ───────────────────────────── Sanctions ─────────────────────────────

const muets = new Map<number, number>(); // UserId → fin (os.time), -1 = sans fin
const figes = new Set<Player>();
/** Liste des bannis (pour les débannir depuis le panneau) : UserId → infos. */
let bannis: Record<string, { nom: string; jusqua: number; raison: string }> = {};
task.spawn(() => (bannis = lire<Record<string, { nom: string; jusqua: number; raison: string }>>(storeSanctions, "liste-bannis") ?? {}));

function dateFr(t: number): string {
	return os.date("%d/%m/%Y à %H:%M (UTC)", t);
}

function message(p: Player, titre: string, texte: string, genre: "annonce" | "avertissement" | "info") {
	r.message.FireClient(p, { titre, texte, genre });
}

/**
 * Un joueur arrive : s'il est banni, il est renvoyé (renvoie faux) ; sinon on remet sa sourdine éventuelle
 * et on pose son étiquette de grade.
 */
export function verifierArrivee(p: Player): boolean {
	const s = lire<Sanctions>(storeSanctions, `u${p.UserId}`);
	if (s?.ban && (s.ban.jusqua === BAN_DEFINITIF || s.ban.jusqua > os.time()) && gradeDe(p) !== "proprietaire") {
		const quand = s.ban.jusqua === BAN_DEFINITIF ? "définitivement" : `jusqu'au ${dateFr(s.ban.jusqua)}`;
		p.Kick(`Tu es banni de ce jeu ${quand}. Raison : ${s.ban.raison}.`);
		return false;
	}
	if (s?.muet && (s.muet.jusqua === -1 || s.muet.jusqua > os.time())) muets.set(p.UserId, s.muet.jusqua);
	p.CharacterAdded.Connect(() => {
		task.wait(0.5);
		appliquerEtiquette(p);
		if (figes.has(p)) figer(p, true);
	});
	if (p.Character) appliquerEtiquette(p);
	return true;
}

/** Étiquette de grade au-dessus de la tête (vue par tous). */
function appliquerEtiquette(p: Player) {
	const tete = p.Character?.FindFirstChild("Head") as BasePart | undefined;
	if (!tete) return;
	tete.FindFirstChild("EtiquetteGrade")?.Destroy();
	const e = ETIQUETTES[gradeDe(p)];
	if (!e) return;
	const gui = new Instance("BillboardGui");
	gui.Name = "EtiquetteGrade";
	gui.Size = new UDim2(0, 180, 0, 24);
	gui.StudsOffset = new Vector3(0, 2.6, 0);
	gui.MaxDistance = 90;
	gui.AlwaysOnTop = false;
	const t = new Instance("TextLabel");
	t.Size = UDim2.fromScale(1, 1);
	t.BackgroundTransparency = 1;
	t.Font = Enum.Font.GothamBold;
	t.TextSize = 15;
	t.TextColor3 = e.couleur;
	t.TextStrokeTransparency = 0.3;
	t.Text = e.texte;
	t.Parent = gui;
	gui.Parent = tete;
}

function figer(p: Player, oui: boolean) {
	const racine = p.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (racine) racine.Anchored = oui;
	if (oui) figes.add(p);
	else figes.delete(p);
}

/** Le chat : un joueur en sourdine ne peut plus envoyer de messages (vérifié par le serveur, pour chaque canal). */
function brancherChat() {
	const canaux = TextChatService.WaitForChild("TextChannels", 30);
	if (!canaux) return;
	const brancher = (c: Instance) => {
		if (!c.IsA("TextChannel")) return;
		c.ShouldDeliverCallback = (msg) => {
			const id = msg.TextSource?.UserId;
			if (id === undefined) return true;
			const fin = muets.get(id);
			if (fin === undefined) return true;
			if (fin !== -1 && fin <= os.time()) {
				muets.delete(id);
				return true;
			}
			return false;
		};
	};
	canaux.GetChildren().forEach(brancher);
	canaux.ChildAdded.Connect(brancher);
}
task.spawn(() => pcall(brancherChat));

// ───────────────────────────── État envoyé aux joueurs ─────────────────────────────

function etatPour(p: Player): EtatModeration {
	const g = gradeDe(p);
	const e: EtatModeration = { grade: g };
	if (NIVEAU_GRADE[g] < 1) return e;
	e.joueurs = Players.GetPlayers().map((x) => ({
		id: x.UserId,
		nom: x.DisplayName,
		grade: gradeDe(x),
		muet: muets.has(x.UserId),
		fige: figes.has(x),
	}));
	e.equipe = [];
	for (const [id, v] of pairs(grades)) if (v.grade !== "joueur") e.equipe.push({ id: tonumber(id) ?? 0, nom: v.nom, grade: v.grade });
	if (aPermission(g, "debannir")) {
		e.bannis = [];
		for (const [id, b] of pairs(bannis))
			if (b.jusqua === BAN_DEFINITIF || b.jusqua > os.time()) e.bannis.push({ id: tonumber(id) ?? 0, nom: b.nom, jusqua: b.jusqua, raison: b.raison });
	}
	if (aPermission(g, "voir_journal")) e.journal = journal.filter((_, i) => i < 60);
	return e;
}

export function diffuser() {
	for (const p of Players.GetPlayers()) r.etatModeration.FireClient(p, etatPour(p));
}

// ───────────────────────────── Commandes ─────────────────────────────

const derniersSignalements = new Map<Player, number>();

function raison(i: unknown): string {
	return typeIs(i, "number") ? RAISONS[i] ?? RAISONS[RAISONS.size() - 1] : RAISONS[RAISONS.size() - 1];
}

/** Vérifie la permission et le grade de la cible ; renvoie la cible (joueur présent) ou un message d'erreur. */
function cibleValide(qui: Player, perm: Permission, id: unknown): Player | string {
	if (!aPermission(gradeDe(qui), perm)) return "Tu n'as pas la permission de faire ça.";
	const cible = typeIs(id, "number") ? Players.GetPlayerByUserId(id) : undefined;
	if (!cible) return "Ce joueur n'est plus sur le serveur.";
	if (cible === qui) return "Pas sur toi-même.";
	if (!peutAgirSur(gradeDe(qui), gradeDe(cible))) return `${cible.DisplayName} a un grade égal ou supérieur au tien.`;
	return cible;
}

function executer(qui: Player, c: CommandeModeration): string | undefined {
	const g = gradeDe(qui);
	switch (c.type) {
		case "signaler": {
			// tout joueur peut signaler (une fois toutes les 30 s) ; l'équipe de modération présente est prévenue
			const cible = typeIs(c.cible, "number") ? Players.GetPlayerByUserId(c.cible) : undefined;
			if (!cible || cible === qui) return "Signalement impossible.";
			if (os.clock() - (derniersSignalements.get(qui) ?? -100) < 30) return "Attends un peu avant de signaler à nouveau.";
			derniersSignalements.set(qui, os.clock());
			noter(qui.DisplayName, "signalement", cible.DisplayName, raison(c.raison));
			for (const p of Players.GetPlayers())
				if (aPermission(gradeDe(p), "voir_journal")) message(p, "Signalement", `${qui.DisplayName} signale ${cible.DisplayName} : ${raison(c.raison)}.`, "info");
			return undefined;
		}
		case "avertir": {
			const cible = cibleValide(qui, "avertir", c.cible);
			if (typeIs(cible, "string")) return cible;
			message(cible, "Avertissement de la modération", `${raison(c.raison)}. Merci de respecter les autres joueurs : la prochaine fois, ce sera une sanction.`, "avertissement");
			noter(qui.DisplayName, "avertissement", cible.DisplayName, raison(c.raison));
			return undefined;
		}
		case "muet": {
			const cible = cibleValide(qui, "muet", c.cible);
			if (typeIs(cible, "string")) return cible;
			const minutes = DUREES_MUET.includes(c.minutes) ? c.minutes : DUREES_MUET[0];
			const fin = os.time() + minutes * 60;
			muets.set(cible.UserId, fin);
			modifier<Sanctions>(storeSanctions, `u${cible.UserId}`, (a) => ({ ...(a ?? {}), muet: { jusqua: fin, raison: raison(c.raison) } }));
			message(cible, "Chat coupé", `Tu ne peux plus écrire dans le chat pendant ${texteDuree(minutes)}. Raison : ${raison(c.raison)}.`, "avertissement");
			noter(qui.DisplayName, `sourdine ${texteDuree(minutes)}`, cible.DisplayName, raison(c.raison));
			return undefined;
		}
		case "rendre_parole": {
			const cible = cibleValide(qui, "muet", c.cible);
			if (typeIs(cible, "string")) return cible;
			muets.delete(cible.UserId);
			modifier<Sanctions>(storeSanctions, `u${cible.UserId}`, (a) => ({ ...(a ?? {}), muet: undefined }));
			message(cible, "Chat rétabli", "Tu peux de nouveau écrire dans le chat.", "info");
			noter(qui.DisplayName, "fin de sourdine", cible.DisplayName);
			return undefined;
		}
		case "figer": {
			const cible = cibleValide(qui, "figer", c.cible);
			if (typeIs(cible, "string")) return cible;
			figer(cible, c.oui === true);
			message(cible, c.oui === true ? "Tu es figé" : "Tu peux bouger", c.oui === true ? "Un modérateur t'a figé sur place." : "Un modérateur t'a libéré.", "info");
			noter(qui.DisplayName, c.oui === true ? "figer" : "libérer", cible.DisplayName);
			return undefined;
		}
		case "aller_vers":
		case "amener": {
			const cible = cibleValide(qui, c.type === "amener" ? "amener" : "aller_vers", c.cible);
			if (typeIs(cible, "string")) return cible;
			const a = qui.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
			const b = cible.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
			if (!a || !b) return "Personnage introuvable.";
			if (c.type === "aller_vers") a.CFrame = b.CFrame.mul(new CFrame(0, 0, 5));
			else b.CFrame = a.CFrame.mul(new CFrame(0, 0, -5));
			noter(qui.DisplayName, c.type === "amener" ? "amener" : "aller vers", cible.DisplayName);
			return undefined;
		}
		case "renvoyer": {
			const cible = cibleValide(qui, "renvoyer", c.cible);
			if (typeIs(cible, "string")) return cible;
			noter(qui.DisplayName, "renvoi du serveur", cible.DisplayName, raison(c.raison));
			cible.Kick(`Tu as été renvoyé du serveur. Raison : ${raison(c.raison)}.`);
			return undefined;
		}
		case "bannir": {
			const definitif = c.minutes === BAN_DEFINITIF;
			const cible = cibleValide(qui, definitif ? "bannir_definitif" : "bannir_temporaire", c.cible);
			if (typeIs(cible, "string")) return cible;
			if (!definitif && !DUREES_BAN.includes(c.minutes)) return "Durée inconnue.";
			const fin = definitif ? BAN_DEFINITIF : os.time() + c.minutes * 60;
			const pourquoi = raison(c.raison);
			modifier<Sanctions>(storeSanctions, `u${cible.UserId}`, (a) => ({ ...(a ?? {}), ban: { jusqua: fin, raison: pourquoi, par: qui.DisplayName } }));
			bannis[tostring(cible.UserId)] = { nom: cible.DisplayName, jusqua: fin, raison: pourquoi };
			modifier<Record<string, unknown>>(storeSanctions, "liste-bannis", (a) => ({ ...(a ?? {}), [tostring(cible.UserId)]: bannis[tostring(cible.UserId)] }));
			// bannissement officiel de Roblox en plus (dans un jeu publié, si Players.BanningEnabled est activé)
			if (!RunService.IsStudio())
				pcall(() =>
					Players.BanAsync({
						UserIds: [cible.UserId],
						ApplyToUniverse: true,
						Duration: definitif ? -1 : c.minutes * 60,
						DisplayReason: pourquoi,
						PrivateReason: `Par ${qui.Name} (${idJoueur(qui)})`,
						ExcludeAltAccounts: false,
					}),
				);
			noter(qui.DisplayName, `bannissement ${texteDuree(c.minutes)}`, cible.DisplayName, pourquoi);
			cible.Kick(`Tu es banni de ce jeu ${definitif ? "définitivement" : `pendant ${texteDuree(c.minutes)}`}. Raison : ${pourquoi}.`);
			return undefined;
		}
		case "debannir": {
			if (!aPermission(g, "debannir")) return "Tu n'as pas la permission de faire ça.";
			const id = tostring(c.cible);
			const b = bannis[id];
			if (!b) return "Ce joueur n'est pas banni.";
			if (b.jusqua === BAN_DEFINITIF && !aPermission(g, "bannir_definitif")) return "Seul le propriétaire lève un bannissement définitif.";
			delete bannis[id];
			modifier<Sanctions>(storeSanctions, `u${id}`, (a) => ({ ...(a ?? {}), ban: undefined }));
			modifier<Record<string, unknown>>(storeSanctions, "liste-bannis", (a) => {
				const res = { ...(a ?? {}) };
				delete res[id];
				return res;
			});
			if (!RunService.IsStudio()) pcall(() => Players.UnbanAsync({ UserIds: [c.cible], ApplyToUniverse: true }));
			noter(qui.DisplayName, "débannissement", b.nom);
			return undefined;
		}
		case "nommer": {
			const cible = typeIs(c.cible, "number") ? Players.GetPlayerByUserId(c.cible) : undefined;
			const nom = cible?.DisplayName ?? grades[tostring(c.cible)]?.nom;
			if (nom === undefined) return "Joueur introuvable.";
			const actuel = gradeParId(c.cible);
			const voulu = c.grade;
			if (voulu === "proprietaire" || NIVEAU_GRADE[voulu] === undefined) return "Grade impossible.";
			// on ne touche qu'à un grade inférieur au sien, et on ne nomme qu'en dessous de soi
			if (!peutAgirSur(g, actuel) || !peutAgirSur(g, voulu)) return "Tu ne peux pas changer ce grade.";
			const perm: Permission = voulu === "admin" || actuel === "admin" ? "nommer_admin" : "nommer_moderateur";
			if (!aPermission(g, perm)) return "Tu n'as pas la permission de faire ça.";
			if (voulu === "joueur") delete grades[tostring(c.cible)];
			else grades[tostring(c.cible)] = { grade: voulu, nom };
			const copie = { ...grades };
			modifier<Record<string, unknown>>(storeGrades, "grades", () => copie);
			if (cible) {
				appliquerEtiquette(cible);
				message(cible, "Nouveau grade", `Tu es maintenant : ${NOMS_GRADES[voulu]}.`, "info");
			}
			noter(qui.DisplayName, `grade → ${NOMS_GRADES[voulu]}`, nom);
			return undefined;
		}
		case "annonce": {
			if (!aPermission(g, "annonce")) return "Tu n'as pas la permission de faire ça.";
			if (!typeIs(c.texte, "string")) return "Annonce vide.";
			const [ok, propre] = pcall(() => filtrer(c.texte.sub(1, 200), qui));
			if (!ok) return tostring(propre);
			if ((propre as string).size() === 0) return "Annonce vide.";
			for (const p of Players.GetPlayers()) message(p, `Annonce de ${qui.DisplayName}`, propre as string, "annonce");
			noter(qui.DisplayName, "annonce", undefined, propre as string);
			return undefined;
		}
		case "arreter_serveur": {
			if (!aPermission(g, "arreter_serveur")) return "Tu n'as pas la permission de faire ça.";
			noter(qui.DisplayName, "arrêt du serveur");
			task.spawn(() => {
				for (const p of Players.GetPlayers()) message(p, "Arrêt du serveur", "Le serveur s'arrête dans 10 secondes. Ta progression est sauvegardée.", "annonce");
				task.wait(10);
				toutEnregistrer();
				for (const p of Players.GetPlayers()) p.Kick("Le serveur a été arrêté par le propriétaire. Ta progression est sauvegardée : reviens quand tu veux !");
			});
			return undefined;
		}
		case "cadeau": {
			const cible = typeIs(c.cible, "number") ? Players.GetPlayerByUserId(c.cible) : undefined;
			if (!aPermission(g, "outils_jeu")) return "Tu n'as pas la permission de faire ça.";
			if (!cible) return "Ce joueur n'est plus sur le serveur.";
			const p = partieDe.get(cible);
			if (!p) return "Sa campagne n'est pas chargée.";
			const pieces = typeIs(c.or, "number") ? math.clamp(c.or, 0, 100000) : undefined;
			const xp = typeIs(c.xp, "number") ? math.clamp(c.xp, 0, 1000000) : undefined;
			const err = p.jouer({ type: "cadeau_admin", joueur: idJoueur(cible), or: pieces, xp });
			if (err !== undefined) return err;
			noter(qui.DisplayName, "cadeau", cible.DisplayName, `${pieces ?? 0} or, ${xp ?? 0} XP`);
			return undefined;
		}
	}
	return "Commande inconnue.";
}

export function preparerModeration() {
	r.moderation.OnServerInvoke = (qui: Player, c: unknown): ReponseCommande => {
		const cmd = c as CommandeModeration;
		if (!typeIs(cmd, "table") || !typeIs(cmd.type, "string")) return { ok: false, erreur: "Commande invalide." };
		let err: string | undefined;
		try {
			err = executer(qui, cmd);
		} catch (e) {
			err = messageErreur(e);
		}
		diffuser();
		return err !== undefined ? { ok: false, erreur: err } : { ok: true, info: cmd.type === "signaler" ? "Merci : ton signalement a été transmis à la modération." : "C'est fait." };
	};
	Players.PlayerRemoving.Connect((p) => {
		figes.delete(p);
		cacheProprietaire.delete(p);
		derniersSignalements.delete(p);
		task.defer(diffuser);
	});
	void Workspace;
}
