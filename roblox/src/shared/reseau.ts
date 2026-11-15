/**
 * Protocole entre le serveur et les joueurs (même principe que la version web) :
 *  - le serveur garde, pour chaque partie, l'état de départ et la liste des actions ;
 *  - un joueur envoie une action → le serveur la vérifie avec le moteur → il la diffuse à tous les membres ;
 *  - chaque joueur rejoue les actions avec le même moteur, donc tout le monde voit le même état.
 */
import { ReplicatedStorage, RunService } from "@rbxts/services";
import type { Action, EtatPartie } from "./moteur";

/** Action envoyée par un joueur : le serveur remplit lui-même le champ `joueur`. */
export type ActionJoueur = { type: string; [cle: string]: unknown };

/** Partie connue d'un joueur (liste « Mes parties »). */
export interface ResumePartie {
	code: string;
	nom: string;
}

/** Commandes : la campagne en cours (synchro) et les groupes. Pas de création ni de code de partie sur Roblox. */
export type Commande =
	| { type: "synchro" }
	| { type: "inviter"; cible: number }
	| { type: "repondre_invitation"; accepter: boolean }
	| { type: "quitter_groupe" };

/** Ce que chaque joueur sait des groupes du serveur (UserId Roblox). */
export interface EtatGroupe {
	/** Mon groupe (le chef d'abord), ou rien si je joue seul. */
	membres?: number[];
	/** Invitation reçue (60 s pour répondre). */
	invitation?: { chef: number; nom: string };
	/** Joueurs du serveur qui sont déjà dans un groupe. */
	occupes: number[];
	/** Vrai si j'ai déjà créé mon héros (sinon je ne peux ni inviter ni être invité). */
	pret: boolean;
}

/** Campagne envoyée à un joueur (à son arrivée, en entrant dans un groupe, en le quittant). */
export interface CampagneEnvoyee {
	code: string;
	nom: string;
	depart: EtatPartie;
	actions: Action[];
}

export interface ReponseCommande {
	ok: boolean;
	erreur?: string;
	/** Campagne en cours (synchro) */
	partie?: { code: string; nom: string; depart: EtatPartie; actions: Action[] };
	/** Message d'information (ex. sauvegarde désactivée dans Studio) */
	info?: string;
}

const NOM_DOSSIER = "VelmarisReseau";

/** Récupère (ou crée, côté serveur) les objets réseau. */
export function reseau() {
	let dossier = ReplicatedStorage.FindFirstChild(NOM_DOSSIER) as Folder | undefined;
	if (!dossier) {
		if (RunService.IsServer()) {
			dossier = new Instance("Folder");
			dossier.Name = NOM_DOSSIER;
			for (const nom of ["Action", "NouvellesActions", "Erreur", "Campagne", "Groupe"]) {
				const e = new Instance("RemoteEvent");
				e.Name = nom;
				e.Parent = dossier;
			}
			const f = new Instance("RemoteFunction");
			f.Name = "Commande";
			f.Parent = dossier;
			dossier.Parent = ReplicatedStorage;
		} else {
			dossier = ReplicatedStorage.WaitForChild(NOM_DOSSIER) as Folder;
		}
	}
	return {
		/** joueur → serveur : une action de jeu */
		action: dossier.WaitForChild("Action") as RemoteEvent<(a: ActionJoueur) => void>,
		/** serveur → joueurs : actions acceptées, à partir de l'index `debut` */
		nouvellesActions: dossier.WaitForChild("NouvellesActions") as RemoteEvent<(debut: number, actions: Action[]) => void>,
		/** serveur → joueur : action refusée (message en français) */
		erreur: dossier.WaitForChild("Erreur") as RemoteEvent<(message: string) => void>,
		/** serveur → joueur : la campagne qu'il joue maintenant (la sienne ou celle de son chef de groupe) */
		campagne: dossier.WaitForChild("Campagne") as RemoteEvent<(c: CampagneEnvoyee) => void>,
		/** serveur → joueur : son groupe, ses invitations */
		groupe: dossier.WaitForChild("Groupe") as RemoteEvent<(g: EtatGroupe) => void>,
		/** joueur → serveur : sa campagne (synchro), inviter, répondre, quitter le groupe */
		commande: dossier.WaitForChild("Commande") as RemoteFunction<(c: Commande) => ReponseCommande>,
	};
}

/** Identifiant de joueur dans le moteur : « u » + identifiant Roblox. */
export function idJoueur(p: Player): string {
	return `u${p.UserId}`;
}
