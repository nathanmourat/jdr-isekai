/**
 * La campagne du serveur : état, membres, application des actions et sauvegarde.
 * Sur Roblox, un serveur = un groupe (6 joueurs au plus) : pas de code de partie ni de pseudo à choisir.
 * Serveur privé : la campagne est attachée au serveur privé. Serveur public : c'est celle de l'hôte
 * (le premier joueur arrivé), et les autres y entrent avec leur héros.
 */
import { HttpService, Players, TextService } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { appliquer, FORMAT, jourPeutPasser, nouvellePartie, rejouer, verifierSauvegarde, type Action, type EtatPartie } from "shared/moteur";

const MAX_JOUEURS = 6;
import { idJoueur, reseau, type ActionJoueur } from "shared/reseau";
import { chargerEtVerrouiller, enregistrer, type DonneesPartie } from "./stockage";

const r = reseau();

export class PartieOuverte {
	etat: EtatPartie;
	membres = new Set<Player>();
	modifiee = false;

	/** Temps de jeu actif accumulé (secondes) et dernière action « réelle » (pour le passage des jours). */
	tempsActif = 0;
	derniereActivite = os.clock();

	constructor(public donnees: DonneesPartie) {
		// parties enregistrées avec un ancien format : le moteur les met à jour (mêmes migrations que le web)
		const [ok, migree] = pcall(() => verifierSauvegarde({ format: FORMAT, version: donnees.depart.version ?? 1, depart: donnees.depart, actions: donnees.actions }));
		if (ok) {
			donnees.depart = migree.depart;
			donnees.actions = migree.actions;
		} else warn(`[Velmaris] Migration de ${donnees.code} : ${tostring(migree)}`);
		const res = rejouer(CONTENU, donnees.depart, donnees.actions);
		if (res.erreurs.size() > 0) warn(`[Velmaris] ${res.erreurs.size()} action(s) ignorée(s) au rechargement de ${donnees.code}`);
		this.etat = res.etat;
	}

	/** Vérifie l'action avec le moteur, l'ajoute et la diffuse. Renvoie un message d'erreur si elle est refusée. */
	jouer(action: Action): string | undefined {
		let nouvel: EtatPartie | undefined;
		let erreur: string | undefined;
		try {
			nouvel = appliquer(CONTENU, this.etat, action);
		} catch (e) {
			erreur = messageErreur(e);
		}
		if (erreur !== undefined || nouvel === undefined) return erreur ?? "Action refusée.";
		this.etat = nouvel;
		if (action.type !== "jour_passe" && action.type !== "presence") this.derniereActivite = os.clock();
		const debut = this.donnees.actions.size();
		this.donnees.actions.push(action);
		this.modifiee = true;
		for (const p of this.membres) r.nouvellesActions.FireClient(p, debut, [action]);
		return undefined;
	}

	resume() {
		return { code: this.donnees.code, nom: this.donnees.nom, depart: this.donnees.depart, actions: this.donnees.actions };
	}
}

export function messageErreur(e: unknown): string {
	if (typeIs(e, "table")) {
		const m = (e as { message?: unknown }).message;
		if (typeIs(m, "string")) return m;
	}
	return tostring(e);
}

export const ouvertes = new Map<string, PartieOuverte>();
/** Partie dans laquelle se trouve chaque joueur de ce serveur. */
export const partieDe = new Map<Player, PartieOuverte>();

/** Texte écrit par un joueur et vu par les autres : filtré par Roblox (obligatoire). */
export function filtrer(texte: string, auteur: Player): string {
	const propre = texte.gsub("^%s+", "")[0].gsub("%s+$", "")[0];
	if (propre.size() === 0) return "";
	const [ok, res] = pcall(() => TextService.FilterStringAsync(propre, auteur.UserId).GetNonChatStringForBroadcastAsync());
	if (!ok) throw "Le filtre de texte de Roblox ne répond pas : réessaie dans un instant.";
	return res as string;
}

// ───────────────────────────── Une campagne par serveur ─────────────────────────────

/** La campagne de ce serveur (une seule : tous les joueurs du serveur forment le groupe). */
let partieServeur: PartieOuverte | undefined;
const enAttente: Player[] = [];
let occupe = false;

/** Clé de sauvegarde : le serveur privé lui-même, sinon l'hôte (premier joueur arrivé sur le serveur). */
function cleDuServeur(hote: Player): { cle: string; nom: string } {
	if (game.PrivateServerId !== "") {
		let proprio = "ses amis";
		if (game.PrivateServerOwnerId !== 0) {
			const [ok, n] = pcall(() => Players.GetNameFromUserIdAsync(game.PrivateServerOwnerId as never));
			if (ok) proprio = n as string;
		}
		return { cle: `prive-${game.PrivateServerId}`, nom: `Serveur privé de ${proprio}` };
	}
	return { cle: `hote-${idJoueur(hote)}`, nom: `Campagne de ${hote.DisplayName}` };
}

function ouvrirPartieDuServeur(hote: Player): PartieOuverte {
	const { cle, nom } = cleDuServeur(hote);
	// un joueur (ou un serveur privé) n'est que sur un serveur à la fois : on reprend la partie même si
	// un ancien serveur arrêté brutalement l'a laissée verrouillée
	const d = chargerEtVerrouiller(cle, true);
	let p: PartieOuverte;
	if (typeIs(d, "string")) {
		const depart = nouvellePartie(CONTENU, cle, nom, HttpService.GenerateGUID(false));
		p = new PartieOuverte({ code: cle, nom, depart, actions: [] });
		enregistrer(p.donnees);
	} else p = new PartieOuverte(d);
	ouvertes.set(cle, p);
	return p;
}

/**
 * Un joueur arrive sur le serveur : il entre automatiquement dans la campagne du serveur
 * (chargée ou créée à l'arrivée du premier joueur). Les arrivées sont traitées une par une.
 */
export function accueillir(joueur: Player) {
	enAttente.push(joueur);
	if (occupe) return;
	occupe = true;
	task.spawn(() => {
		while (enAttente.size() > 0) {
			const j = enAttente.shift()!;
			if (j.Parent !== Players) continue;
			const [ok, err] = pcall(() => {
				if (!partieServeur) partieServeur = ouvrirPartieDuServeur(j);
				if (partieServeur.membres.size() >= MAX_JOUEURS) {
					j.Kick("Ce serveur est complet (6 joueurs au plus). Rejoins un autre serveur.");
					return;
				}
				entrer(j, partieServeur);
			});
			if (!ok) {
				warn(`[Velmaris] Arrivée de ${j.Name} : ${messageErreur(err)}`);
				const m = messageErreur(err);
				// la campagne a déjà ses 6 héros : ce joueur ne peut pas y entrer
				if (m.find("complète", 1, true)[0] !== undefined) j.Kick(`La campagne de ce serveur a déjà ses 6 héros. Rejoins un autre serveur.`);
				else r.erreur.FireClient(j, m);
			}
		}
		occupe = false;
	});
}

/** Fait entrer un joueur dans une partie : il « rejoint » la première fois, puis il est marqué présent. */
export function entrer(joueur: Player, p: PartieOuverte) {
	sortir(joueur);
	p.membres.add(joueur);
	partieDe.set(joueur, p);
	const id = idJoueur(joueur);
	const j = p.etat.joueurs[id];
	if (j === undefined) {
		// pseudo = nom affiché Roblox (déjà filtré par Roblox), rendu unique dans la partie
		let pseudo = joueur.DisplayName;
		const pris = (x: string) => p.etat.ordreJoueurs.some((o) => p.etat.joueurs[o].pseudo.lower() === x.lower());
		for (let n = 2; pris(pseudo); n++) pseudo = `${joueur.DisplayName}${n}`;
		const err = p.jouer({ type: "rejoindre", joueur: id, pseudo });
		if (err !== undefined) {
			p.membres.delete(joueur);
			partieDe.delete(joueur);
			throw err;
		}
	} else if (!j.present) {
		p.jouer({ type: "presence", joueur: id, present: true });
	}
}

/** Retire un joueur de sa partie (il devient « absent »). La partie est fermée quand il n'y a plus personne. */
export function sortir(joueur: Player) {
	const p = partieDe.get(joueur);
	if (!p) return;
	partieDe.delete(joueur);
	p.membres.delete(joueur);
	const id = idJoueur(joueur);
	if (p.etat.joueurs[id]?.present) p.jouer({ type: "presence", joueur: id, present: false });
	if (p.membres.size() === 0) {
		pcall(() => enregistrer(p.donnees, true));
		p.modifiee = false;
		ouvertes.delete(p.donnees.code);
		// serveur vide : le prochain joueur qui arrive devient l'hôte (sa campagne sera chargée)
		if (partieServeur === p) partieServeur = undefined;
	}
}

/** Action envoyée par un joueur. */
export function actionDuJoueur(joueur: Player, brute: ActionJoueur) {
	const p = partieDe.get(joueur);
	if (!p) return r.erreur.FireClient(joueur, "Tu n'es dans aucune partie.");
	if (!typeIs(brute, "table") || !typeIs(brute.type, "string")) return;
	// le serveur décide qui joue : on ne fait jamais confiance au champ « joueur » envoyé
	const action = { ...brute, joueur: idJoueur(joueur) } as Action;
	// textes écrits par le joueur et visibles par les autres : filtrés
	// sur Roblox, le héros porte le nom affiché du joueur (déjà filtré par Roblox)
	if (action.type === "creer_heros" && typeIs(action.heros, "table")) action.heros = { ...(action.heros as object), nom: joueur.DisplayName, portrait: undefined };
	if (action.type === "rejoindre" || action.type === "portrait") return r.erreur.FireClient(joueur, "Action non disponible sur Roblox.");
	const err = p.jouer(action);
	if (err !== undefined) r.erreur.FireClient(joueur, err);
}

/**
 * Les jours passent en jouant (comme sur le web) : 1 jour toutes les `minutes_par_jour` minutes de jeu actif,
 * seulement si quelqu'un a agi depuis moins de `inactivite_minutes`, et jamais d'un mois à l'autre.
 * Ici c'est le serveur qui envoie l'action, au nom du premier joueur présent.
 */
export function boucleJours() {
	const cfg = CONTENU.config.jours_temps_reel;
	while (true) {
		task.wait(15);
		for (const [, p] of ouvertes) {
			if (p.membres.size() === 0) continue;
			if (os.clock() - p.derniereActivite > cfg.inactivite_minutes * 60) continue;
			p.tempsActif += 15;
			if (p.tempsActif < cfg.minutes_par_jour * 60) continue;
			p.tempsActif = 0;
			const etat = p.etat;
			if (!jourPeutPasser(CONTENU, etat)) continue;
			const responsable = etat.ordreJoueurs.find((j) => etat.joueurs[j].present && etat.joueurs[j].herosId !== undefined);
			if (responsable !== undefined) p.jouer({ type: "jour_passe", joueur: responsable, jour: etat.jour });
		}
	}
}

/** Sauvegarde régulière des parties modifiées (toutes les 10 s), et prolongation des verrous. */
export function boucleSauvegarde() {
	let tours = 0;
	while (true) {
		task.wait(10);
		tours++;
		for (const [, p] of ouvertes) {
			if (p.modifiee || tours % 6 === 0) {
				p.modifiee = false;
				const [ok, err] = pcall(() => enregistrer(p.donnees));
				if (!ok) {
					p.modifiee = true;
					warn(`[Velmaris] Sauvegarde de ${p.donnees.code} : ${tostring(err)}`);
				}
			}
		}
	}
}

export function toutEnregistrer() {
	for (const [, p] of ouvertes) pcall(() => enregistrer(p.donnees, true));
}

export { Players };
