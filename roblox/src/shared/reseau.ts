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

export type Commande =
	| { type: "creer"; nom: string }
	| { type: "rejoindre"; code: string }
	| { type: "mes_parties" }
	| { type: "synchro" }
	| { type: "quitter" };

export interface ReponseCommande {
	ok: boolean;
	erreur?: string;
	/** Partie ouverte (creer, rejoindre, synchro) */
	partie?: { code: string; nom: string; depart: EtatPartie; actions: Action[] };
	/** Mes parties (mes_parties) */
	parties?: ResumePartie[];
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
			for (const nom of ["Action", "NouvellesActions", "Erreur"]) {
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
		/** joueur → serveur : créer, rejoindre, lister ses parties… */
		commande: dossier.WaitForChild("Commande") as RemoteFunction<(c: Commande) => ReponseCommande>,
	};
}

/** Identifiant de joueur dans le moteur : « u » + identifiant Roblox. */
export function idJoueur(p: Player): string {
	return `u${p.UserId}`;
}
