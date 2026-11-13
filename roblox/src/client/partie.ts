/**
 * La partie vue par ce joueur : état de départ + actions reçues du serveur, rejouées avec le moteur.
 */
import { Players } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { appliquer, rejouer, type Action, type EtatPartie, type Heros } from "shared/moteur";
import { idJoueur, reseau, type ActionJoueur, type Commande, type ReponseCommande } from "shared/reseau";

const r = reseau();
const moi = idJoueur(Players.LocalPlayer);

type Ecouteur = () => void;
const ecouteurs: Ecouteur[] = [];

export const jeu = {
	code: undefined as string | undefined,
	nom: "",
	depart: undefined as EtatPartie | undefined,
	actions: [] as Action[],
	etat: undefined as EtatPartie | undefined,
	erreur: undefined as string | undefined,
	info: undefined as string | undefined,
	moi,
};

export function surChangement(f: Ecouteur) {
	ecouteurs.push(f);
}
function prevenir() {
	for (const f of ecouteurs) task.spawn(f);
}

export function monHeros(): Heros | undefined {
	const id = jeu.etat?.joueurs[moi]?.herosId;
	return id !== undefined ? jeu.etat!.heros[id] : undefined;
}

export function montrerErreur(message: string | undefined) {
	jeu.erreur = message;
	prevenir();
}

/** Ferme le bandeau d'erreur ou d'information. */
export function effacerMessages() {
	jeu.erreur = undefined;
	jeu.info = undefined;
	prevenir();
}

function ouvrir(rep: ReponseCommande) {
	const p = rep.partie!;
	jeu.code = p.code;
	jeu.nom = p.nom;
	jeu.depart = p.depart;
	jeu.actions = p.actions;
	jeu.etat = rejouer(CONTENU, p.depart, p.actions).etat;
	jeu.info = rep.info;
	jeu.erreur = undefined;
}

/** Envoie une commande au serveur (créer, rejoindre…). Renvoie la réponse, ou une erreur en français. */
export function commander(c: Commande): ReponseCommande {
	const [ok, rep] = pcall(() => r.commande.InvokeServer(c));
	if (!ok) return { ok: false, erreur: "Le serveur ne répond pas. Réessaie." };
	if (rep.ok && rep.partie) ouvrir(rep);
	if (rep.ok && c.type === "quitter") {
		jeu.code = undefined;
		jeu.etat = undefined;
		jeu.depart = undefined;
		jeu.actions = [];
	}
	if (!rep.ok) jeu.erreur = rep.erreur;
	prevenir();
	return rep;
}

/** Joue une action : vérifiée ici d'abord (message immédiat), puis par le serveur. */
export function agir(a: ActionJoueur): boolean {
	if (!jeu.etat) return false;
	try {
		appliquer(CONTENU, jeu.etat, { ...a, joueur: moi } as Action);
	} catch (e) {
		const m = typeIs(e, "table") ? (e as { message?: string }).message : undefined;
		montrerErreur(m ?? tostring(e));
		return false;
	}
	jeu.erreur = undefined;
	r.action.FireServer(a);
	return true;
}

r.nouvellesActions.OnClientEvent.Connect((debut, actions) => {
	if (!jeu.etat) return;
	const connues = jeu.actions.size();
	if (debut > connues) {
		// actions manquées : on redemande tout au serveur
		commander({ type: "synchro" });
		return;
	}
	// actions déjà reçues (par exemple dans la réponse à « rejoindre ») : on ne garde que les nouvelles
	const nouvelles = actions.filter((_, i) => debut + i >= connues);
	if (nouvelles.size() === 0) return;
	let etat = jeu.etat;
	for (const a of nouvelles) {
		jeu.actions.push(a);
		const [ok, res] = pcall(() => appliquer(CONTENU, etat, a));
		if (ok) etat = res as EtatPartie;
	}
	jeu.etat = etat;
	prevenir();
});

r.erreur.OnClientEvent.Connect((m) => montrerErreur(m));
