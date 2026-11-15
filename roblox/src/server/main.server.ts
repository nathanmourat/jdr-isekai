/**
 * Serveur Roblox des Appelés de Velmaris :
 * une campagne par serveur (serveur privé, ou campagne de l'hôte), actions vérifiées par le moteur, sauvegarde DataStore.
 */
import { Players } from "@rbxts/services";
import { reseau, type Commande, type ReponseCommande } from "shared/reseau";
import { accueillir, actionDuJoueur, boucleJours, boucleSauvegarde, messageErreur, partieDe, sortir, toutEnregistrer } from "./parties";
import { sauvegardeActive } from "./stockage";
import { construireMonde } from "./monde";
import { preparerModeles } from "./modeles";
import { construireInterieurs } from "./interieurs";
import { animerVille } from "./vie";
import { habillerLesHeros } from "./tenues";
import { construireRegions } from "./regions";
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
task.spawn(construireRegions);
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
				// la campagne du serveur se charge à l'arrivée du joueur : il redemande jusqu'à ce qu'elle soit prête
				const p = partieDe.get(joueur);
				if (!p) return { ok: false, erreur: "La campagne se charge…" };
				return { ok: true, partie: p.resume(), info };
			}
		}
		return { ok: false, erreur: "Commande inconnue." };
	} catch (e) {
		return { ok: false, erreur: messageErreur(e) };
	}
};

r.action.OnServerEvent.Connect((joueur, a) => actionDuJoueur(joueur, a as never));
// chaque joueur qui arrive entre directement dans la campagne du serveur
Players.GetPlayers().forEach(accueillir);
Players.PlayerAdded.Connect(accueillir);
Players.PlayerRemoving.Connect((joueur) => sortir(joueur));
game.BindToClose(() => toutEnregistrer());
task.spawn(boucleSauvegarde);
task.spawn(boucleJours);

print("[Velmaris] Serveur prêt.");
