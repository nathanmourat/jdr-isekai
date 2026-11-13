/**
 * Serveur Roblox des Appelés de Velmaris (étape R1) :
 * parties avec code à 6 caractères, actions vérifiées par le moteur, sauvegarde DataStore.
 */
import { Players } from "@rbxts/services";
import { idJoueur, reseau, type Commande, type ReponseCommande } from "shared/reseau";
import { actionDuJoueur, boucleSauvegarde, creerPartie, entrer, messageErreur, ouvrirPartie, partieDe, sortir, toutEnregistrer } from "./parties";
import { partiesDuJoueur, sauvegardeActive } from "./stockage";

const r = reseau();
const INFO_MEMOIRE = "Studio : sauvegarde Roblox désactivée, la partie sera perdue à l'arrêt (voir README-ROBLOX.md).";

r.commande.OnServerInvoke = (joueur: Player, c: unknown): ReponseCommande => {
	const cmd = c as Commande;
	if (!typeIs(cmd, "table") || !typeIs(cmd.type, "string")) return { ok: false, erreur: "Commande invalide." };
	try {
		const info = sauvegardeActive() ? undefined : INFO_MEMOIRE;
		switch (cmd.type) {
			case "creer": {
				if (!typeIs(cmd.nom, "string")) return { ok: false, erreur: "Donne un nom à la partie." };
				const p = creerPartie(cmd.nom, joueur);
				entrer(joueur, p);
				return { ok: true, partie: p.resume(), info };
			}
			case "rejoindre": {
				if (!typeIs(cmd.code, "string")) return { ok: false, erreur: "Entre un code." };
				const p = ouvrirPartie(cmd.code);
				if (typeIs(p, "string")) return { ok: false, erreur: p };
				entrer(joueur, p);
				return { ok: true, partie: p.resume(), info };
			}
			case "synchro": {
				const p = partieDe.get(joueur);
				if (!p) return { ok: false, erreur: "Tu n'es dans aucune partie." };
				return { ok: true, partie: p.resume() };
			}
			case "quitter": {
				sortir(joueur);
				return { ok: true };
			}
			case "mes_parties":
				return { ok: true, parties: partiesDuJoueur(idJoueur(joueur)), info };
		}
		return { ok: false, erreur: "Commande inconnue." };
	} catch (e) {
		return { ok: false, erreur: messageErreur(e) };
	}
};

r.action.OnServerEvent.Connect((joueur, a) => actionDuJoueur(joueur, a as never));
Players.PlayerRemoving.Connect((joueur) => sortir(joueur));
game.BindToClose(() => toutEnregistrer());
task.spawn(boucleSauvegarde);

print("[Velmaris] Serveur prêt.");
