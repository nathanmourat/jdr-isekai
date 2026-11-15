/**
 * Badges et bonus de connexion (version Roblox).
 *  - Badges : vérifiés après chaque action de la campagne d'un joueur (shared/badges.ts) ; donnés une seule fois.
 *  - Bonus de connexion : une fois par jour (jour UTC) ; la série augmente si on revient le lendemain,
 *    elle repart à 1 sinon. Il est donné au héros dans la campagne où joue le joueur (la sienne, ou celle
 *    de son chef de groupe : il rentre alors avec ses gains).
 */
import { BadgeService, DataStoreService, Players, RunService } from "@rbxts/services";
import { BADGES, BONUS_CONNEXION } from "shared/badges";
import { idJoueur } from "shared/reseau";
import { enGroupe, partieDe, surAction, type PartieOuverte } from "./parties";

// ───────────────────────────── Badges ─────────────────────────────

const deja = new Map<Player, Set<string>>();

function donner(p: Player, cle: string) {
	const b = BADGES[cle];
	if (!b || b.numero === 0) return;
	let s = deja.get(p);
	if (!s) {
		s = new Set();
		deja.set(p, s);
	}
	if (s.has(cle)) return;
	s.add(cle);
	task.spawn(() => {
		const [ok, a] = pcall(() => BadgeService.UserHasBadgeAsync(p.UserId, b.numero));
		if (ok && a === true) return;
		const [ok2, err] = pcall(() => BadgeService.AwardBadge(p.UserId, b.numero));
		if (!ok2) warn(`[Velmaris] Badge ${cle} : ${tostring(err)}`);
	});
}

/** Vérifie les badges des joueurs présents dans cette campagne. */
function verifierBadges(partie: PartieOuverte) {
	const etat = partie.etat;
	for (const p of partie.membres) {
		const hid = etat.joueurs[idJoueur(p)]?.herosId;
		if (hid === undefined) continue;
		const h = etat.heros[hid];
		donner(p, "premier_heros");
		if (etat.flags["examen-reussi"] === true) donner(p, "guilde");
		for (let n = 1; n <= 5; n++) if (etat.chapitre > n) donner(p, `chapitre_${n}`);
		for (const f of ["sceau", "pacte", "couronne", "retour"]) if (etat.flags[`fin-${f}`] === true) donner(p, `fin_${f}`);
		if (h.niveau >= 10) donner(p, "niveau_10");
		if (h.niveau >= 20) donner(p, "niveau_20");
		if (h.niveau >= 40) donner(p, "niveau_40");
		if (enGroupe(p)) donner(p, "premier_groupe");
	}
}

// ───────────────────────────── Bonus de connexion ─────────────────────────────

let store: DataStore | undefined;
{
	const [ok] = pcall(() => {
		store = DataStoreService.GetDataStore("VelmarisConnexion_v1");
		store.GetAsync("test");
	});
	if (!ok) store = undefined;
}
const memoire = new Map<number, { jour: number; serie: number }>();
/** Joueurs dont le bonus du jour a déjà été vérifié sur ce serveur. */
const verifies = new Set<Player>();

function aujourdhui(): number {
	return math.floor(os.time() / 86400);
}

function bonusDuJour(p: Player) {
	const partie = partieDe.get(p);
	const id = idJoueur(p);
	if (!partie || partie.etat.joueurs[id]?.herosId === undefined) return; // héros pas encore créé : on réessaiera
	verifies.add(p);
	const jour = aujourdhui();
	let serie = 0;
	let neuf = false;
	const maj = (ancien: { jour: number; serie: number } | undefined) => {
		if (ancien && ancien.jour === jour) return ancien; // déjà reçu aujourd'hui
		neuf = true;
		serie = ancien && ancien.jour === jour - 1 ? ancien.serie + 1 : 1;
		return { jour, serie };
	};
	if (store) {
		const [ok] = pcall(() => store!.UpdateAsync(`u${p.UserId}`, (a: unknown) => $tuple(maj(a as { jour: number; serie: number } | undefined))));
		if (!ok) return;
	} else memoire.set(p.UserId, maj(memoire.get(p.UserId)));
	if (!neuf) return;
	const r = BONUS_CONNEXION[(math.min(serie, BONUS_CONNEXION.size()) - 1) as number];
	const pieces = r.or * math.max(1, partie.etat.chapitre);
	const err = partie.jouer({ type: "bonus_connexion", joueur: id, serie, or: pieces, objet: r.objet, quantite: r.quantite });
	if (err !== undefined) warn(`[Velmaris] Bonus de connexion de ${p.Name} : ${err}`);
}

export function preparerRecompenses() {
	surAction((partie) => pcall(() => verifierBadges(partie)));
	// le bonus du jour : dès que la campagne du joueur est chargée et son héros créé
	task.spawn(() => {
		while (true) {
			task.wait(RunService.IsStudio() ? 5 : 20);
			for (const p of Players.GetPlayers()) if (!verifies.has(p)) pcall(() => bonusDuJour(p));
		}
	});
	Players.PlayerRemoving.Connect((p) => {
		verifies.delete(p);
		deja.delete(p);
	});
}
