/**
 * Groupes de collision (PhysicsService) :
 *  - « Joueurs » : les personnages des joueurs ne se bloquent plus entre eux (portes, salles intérieures) ;
 *  - « PNJ » : villageois, gardes, marchands et personnages des intérieurs ne bloquent pas les joueurs
 *    et ne se bloquent pas entre eux. Tout le monde garde ses collisions avec le décor.
 */
import { PhysicsService, Players } from "@rbxts/services";

export const GROUPE_JOUEURS = "Joueurs";
export const GROUPE_PNJ = "PNJ";

function enregistrer(nom: string) {
	pcall(() => {
		if (!PhysicsService.IsCollisionGroupRegistered(nom)) PhysicsService.RegisterCollisionGroup(nom);
	});
}

/** Met toutes les pièces d'un modèle (et celles ajoutées plus tard : accessoires, armes) dans un groupe. */
export function mettreDansGroupe(m: Instance, groupe: string) {
	for (const e of m.GetDescendants()) if (e.IsA("BasePart")) e.CollisionGroup = groupe;
	m.DescendantAdded.Connect((e) => {
		if (e.IsA("BasePart")) e.CollisionGroup = groupe;
	});
}

/** À appeler une fois au démarrage du serveur. */
export function preparerCollisions() {
	enregistrer(GROUPE_JOUEURS);
	enregistrer(GROUPE_PNJ);
	pcall(() => {
		PhysicsService.CollisionGroupSetCollidable(GROUPE_JOUEURS, GROUPE_JOUEURS, false);
		PhysicsService.CollisionGroupSetCollidable(GROUPE_JOUEURS, GROUPE_PNJ, false);
		PhysicsService.CollisionGroupSetCollidable(GROUPE_PNJ, GROUPE_PNJ, false);
	});
	const suivre = (j: Player) => {
		if (j.Character) mettreDansGroupe(j.Character, GROUPE_JOUEURS);
		j.CharacterAdded.Connect((perso) => mettreDansGroupe(perso, GROUPE_JOUEURS));
	};
	Players.GetPlayers().forEach(suivre);
	Players.PlayerAdded.Connect(suivre);
}
