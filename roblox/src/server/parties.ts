/**
 * Parties ouvertes sur ce serveur : état, membres, application des actions et sauvegarde.
 */
import { HttpService, Players, TextService } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { appliquer, FORMAT, jourPeutPasser, nouvellePartie, rejouer, verifierSauvegarde, type Action, type EtatPartie } from "shared/moteur";
import { idJoueur, reseau, type ActionJoueur } from "shared/reseau";
import { ajouterPartieAuJoueur, chargerEtVerrouiller, enregistrer, partieExiste, type DonneesPartie } from "./stockage";

const LETTRES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

function nouveauCode(): string {
	for (let essai = 0; essai < 20; essai++) {
		let code = "";
		for (let i = 0; i < 6; i++) {
			const k = math.random(1, LETTRES.size());
			code += LETTRES.sub(k, k);
		}
		if (!ouvertes.has(code) && !partieExiste(code)) return code;
	}
	throw "Impossible de trouver un code libre, réessaie.";
}

export function creerPartie(nomBrut: string, auteur: Player): PartieOuverte {
	const nom = filtrer(nomBrut.sub(1, 40), auteur);
	if (nom.size() === 0) throw "Donne un nom à la partie.";
	const code = nouveauCode();
	const depart = nouvellePartie(CONTENU, code, nom, HttpService.GenerateGUID(false));
	const p = new PartieOuverte({ code, nom, depart, actions: [] });
	enregistrer(p.donnees);
	ouvertes.set(code, p);
	return p;
}

export function ouvrirPartie(codeBrut: string): PartieOuverte | string {
	const code = codeBrut.upper().gsub("[^%w]", "")[0];
	if (code.size() !== 6) return "Le code d'une partie a 6 caractères.";
	const deja = ouvertes.get(code);
	if (deja) return deja;
	const d = chargerEtVerrouiller(code);
	if (typeIs(d, "string")) return d;
	const p = new PartieOuverte(d);
	ouvertes.set(code, p);
	return p;
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
	task.spawn(() => pcall(() => ajouterPartieAuJoueur(id, { code: p.donnees.code, nom: p.donnees.nom })));
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
	if (action.type === "creer_heros" && typeIs(action.heros, "table")) {
		const h = action.heros as { nom?: unknown };
		if (!typeIs(h.nom, "string")) return r.erreur.FireClient(joueur, "Donne un nom à ton héros.");
		const [ok, nom] = pcall(() => filtrer((h.nom as string).sub(1, 30), joueur));
		if (!ok) return r.erreur.FireClient(joueur, tostring(nom));
		action.heros = { ...(action.heros as object), nom, portrait: undefined };
	}
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
