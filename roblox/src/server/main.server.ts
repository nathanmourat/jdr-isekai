/**
 * Serveur Roblox des Appelés de Velmaris :
 * une campagne par joueur (sauvegardée sur son compte), monde partagé, groupes formés dans le jeu
 * (le groupe joue la campagne du chef), actions vérifiées par le moteur, sauvegarde DataStore.
 */
import { Players, Workspace } from "@rbxts/services";
import { reseau, type Commande, type ReponseCommande } from "shared/reseau";
import {
	accueillir,
	actionDuJoueur,
	boucleJours,
	boucleSauvegarde,
	diffuserGroupes,
	inviter,
	messageErreur,
	partieDe,
	publierAnnonce,
	quitterGroupe,
	rejoindreAnnonce,
	repondreInvitation,
	retirerAnnonce,
	sortir,
	toutEnregistrer,
} from "./parties";
import { sauvegardeActive } from "./stockage";
import { diffuser as diffuserModeration, preparerModeration, verifierArrivee } from "./moderation";
import { preparerRecompenses } from "./recompenses";
import { construireMonde } from "./monde";
import { preparerModeles } from "./modeles";
import { construireInterieurs } from "./interieurs";
import { animerVille } from "./vie";
import { habillerLesHeros } from "./tenues";
import { construireRegions } from "./regions";
import { preparerPierres } from "./voyage";
import { preparerCollisions } from "./collisions";

// joueurs et PNJ ne se bloquent plus entre eux (groupes de collision)
preparerCollisions();
construireMonde();
// un royaume à grande échelle : on voit loin et on marche un peu plus vite
const reglerJoueur = (j: Player) => {
	j.CameraMaxZoomDistance = 420;
	j.CharacterAdded.Connect((perso) => {
		const h = perso.WaitForChild("Humanoid", 10) as Humanoid | undefined;
		if (h) h.WalkSpeed = 24;
	});
};
Players.GetPlayers().forEach(reglerJoueur);
Players.PlayerAdded.Connect(reglerJoueur);
// les autres régions (chapitres 2 à 6), loin de Lysmont
task.spawn(() => {
	construireRegions();
	// pierres de voyage : après les régions, pour se poser sur leur terrain
	preparerPierres(Workspace.FindFirstChild("Velmaris") ?? Workspace);
});
// les modèles 3D sont créés en arrière-plan (cela prend quelques secondes) : le jeu démarre sans attendre
task.spawn(preparerModeles);
task.spawn(construireInterieurs);
task.spawn(animerVille);
task.spawn(habillerLesHeros);
const r = reseau();
const INFO_MEMOIRE = "Studio : sauvegarde Roblox désactivée, la partie sera perdue à l'arrêt (voir README-ROBLOX.md).";

r.commande.OnServerInvoke = (joueur: Player, c: unknown): ReponseCommande => {
	const cmd = c as Commande;
	if (!typeIs(cmd, "table") || !typeIs(cmd.type, "string")) return { ok: false, erreur: "Commande invalide." };
	try {
		const info = sauvegardeActive() ? undefined : INFO_MEMOIRE;
		switch (cmd.type) {
			case "synchro": {
				// la campagne se charge à l'arrivée du joueur : il redemande jusqu'à ce qu'elle soit prête
				const p = partieDe.get(joueur);
				if (!p) return { ok: false, erreur: "La campagne se charge…" };
				task.defer(diffuserGroupes);
				return { ok: true, partie: p.resume(), info };
			}
			case "inviter": {
				const cible = typeIs(cmd.cible, "number") ? Players.GetPlayerByUserId(cmd.cible) : undefined;
				if (!cible) return { ok: false, erreur: "Ce joueur n'est plus sur le serveur." };
				const err = inviter(joueur, cible);
				return err !== undefined ? { ok: false, erreur: err } : { ok: true, info: `Invitation envoyée à ${cible.DisplayName}.` };
			}
			case "repondre_invitation": {
				const err = repondreInvitation(joueur, cmd.accepter === true);
				return err !== undefined ? { ok: false, erreur: err } : { ok: true };
			}
			case "publier_annonce":
			case "retirer_annonce":
			case "rejoindre_annonce": {
				const err =
					cmd.type === "publier_annonce" ? publierAnnonce(joueur, cmd.objectif) : cmd.type === "retirer_annonce" ? retirerAnnonce(joueur) : rejoindreAnnonce(joueur, cmd.chef);
				return err !== undefined ? { ok: false, erreur: err } : { ok: true };
			}
			case "quitter_groupe": {
				const err = quitterGroupe(joueur);
				return err !== undefined ? { ok: false, erreur: err } : { ok: true };
			}
		}
		return { ok: false, erreur: "Commande inconnue." };
	} catch (e) {
		return { ok: false, erreur: messageErreur(e) };
	}
};

r.action.OnServerEvent.Connect((joueur, a) => actionDuJoueur(joueur, a as never));
// modération : grades, bannissements, sourdines, journal
preparerModeration();
// badges et bonus de connexion
preparerRecompenses();
// chaque joueur qui arrive (s'il n'est pas banni) retrouve sa campagne (créée la première fois)
const arrivee = (p: Player) => {
	if (!verifierArrivee(p)) return;
	accueillir(p);
	task.delay(1, diffuserModeration);
};
Players.GetPlayers().forEach(arrivee);
Players.PlayerAdded.Connect(arrivee);
Players.PlayerRemoving.Connect((joueur) => sortir(joueur));
game.BindToClose(() => toutEnregistrer());
task.spawn(boucleSauvegarde);
task.spawn(boucleJours);

print("[Velmaris] Serveur prêt.");
