/**
 * Campagnes ouvertes sur ce serveur, comme dans les RPG Roblox habituels :
 *  - chaque joueur a SA campagne (son héros, son histoire), sauvegardée sur son compte : clé « joueur-u<UserId> » ;
 *  - le serveur est un monde partagé : on croise les autres joueurs, chacun avec sa progression ;
 *  - les groupes se forment dans le jeu (invitation, 6 joueurs au plus) : le groupe joue la campagne du chef,
 *    les héros des autres y viennent en renfort (action `invite_arrive`) ;
 *  - en quittant le groupe, chacun rapporte ses gains (XP, niveaux, or, objets, compétences) dans sa propre
 *    campagne (action `heros_retour`). Une copie des gains est gardée dans sa sauvegarde pendant qu'il est en
 *    groupe (`retourEnAttente`) : rien n'est perdu si le serveur s'arrête brutalement.
 * Pas de code de partie ni de pseudo à choisir : le pseudo et le nom du héros sont le nom affiché Roblox.
 */
import { HttpService, Players, TextService } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { appliquer, deltaHistoire, exporterHeros, pointHistoire, type PointHistoire, FORMAT, jourPeutPasser, nouvellePartie, rejouer, verifierSauvegarde, type Action, type EtatPartie } from "shared/moteur";
import { idJoueur, OBJECTIFS_GROUPE, reseau, type ActionJoueur, type EtatGroupe } from "shared/reseau";
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
/** Campagne que chaque joueur joue en ce moment : la sienne, ou celle de son chef de groupe. */
export const partieDe = new Map<Player, PartieOuverte>();
/** Campagne personnelle de chaque joueur présent (ouverte tant qu'il est sur le serveur). */
const campagnePerso = new Map<Player, PartieOuverte>();

/** Texte écrit par un joueur et vu par les autres : filtré par Roblox (obligatoire). */
export function filtrer(texte: string, auteur: Player): string {
	const propre = texte.gsub("^%s+", "")[0].gsub("%s+$", "")[0];
	if (propre.size() === 0) return "";
	const [ok, res] = pcall(() => TextService.FilterStringAsync(propre, auteur.UserId).GetNonChatStringForBroadcastAsync());
	if (!ok) throw "Le filtre de texte de Roblox ne répond pas : réessaie dans un instant.";
	return res as string;
}

// ───────────────────────────── Campagne personnelle ─────────────────────────────

const MAX_GROUPE = 6;
const enAttente: Player[] = [];
let occupe = false;

function envoyerCampagne(j: Player, p: PartieOuverte) {
	r.campagne.FireClient(j, p.resume());
}

function ouvrirCampagnePerso(j: Player): PartieOuverte {
	const cle = `joueur-${idJoueur(j)}`;
	// un joueur n'est que sur un serveur à la fois : on reprend sa campagne même si un serveur arrêté
	// brutalement l'a laissée verrouillée
	const d = chargerEtVerrouiller(cle, true);
	let p: PartieOuverte;
	if (typeIs(d, "string")) {
		const depart = nouvellePartie(CONTENU, cle, `Campagne de ${j.DisplayName}`, HttpService.GenerateGUID(false));
		p = new PartieOuverte({ code: cle, nom: `Campagne de ${j.DisplayName}`, depart, actions: [] });
	} else p = new PartieOuverte(d);
	ouvertes.set(cle, p);
	const id = idJoueur(j);
	if (p.etat.joueurs[id] === undefined) {
		const err = p.jouer({ type: "rejoindre", joueur: id, pseudo: j.DisplayName });
		if (err !== undefined) throw err;
	} else if (!p.etat.joueurs[id].present) p.jouer({ type: "presence", joueur: id, present: true });
	// gains d'un groupe que le serveur n'a pas eu le temps de rapporter (arrêt brutal) : on les rapporte maintenant
	const v = p.donnees.retourEnAttente;
	if (v !== undefined) {
		const err = p.jouer({ type: "heros_retour", joueur: id, voyageur: v });
		if (err !== undefined) warn(`[Velmaris] Retour en attente de ${j.Name} : ${err}`);
		p.donnees.retourEnAttente = undefined;
	}
	const h = p.donnees.histoireEnAttente;
	if (h !== undefined) {
		const err = p.jouer({ type: "histoire_retour", joueur: id, delta: h });
		if (err !== undefined) warn(`[Velmaris] Histoire en attente de ${j.Name} : ${err}`);
		p.donnees.histoireEnAttente = undefined;
	}
	pcall(() => enregistrer(p.donnees));
	return p;
}

/** Un joueur arrive sur le serveur : on ouvre sa campagne (créée la première fois). Les arrivées passent une par une. */
export function accueillir(joueur: Player) {
	enAttente.push(joueur);
	if (occupe) return;
	occupe = true;
	task.spawn(() => {
		while (enAttente.size() > 0) {
			const j = enAttente.shift()!;
			if (j.Parent !== Players) continue;
			const [ok, err] = pcall(() => {
				const p = ouvrirCampagnePerso(j);
				campagnePerso.set(j, p);
				p.membres.add(j);
				partieDe.set(j, p);
				envoyerCampagne(j, p);
			});
			if (!ok) {
				warn(`[Velmaris] Arrivée de ${j.Name} : ${messageErreur(err)}`);
				r.erreur.FireClient(j, `Ta campagne n'a pas pu être chargée : ${messageErreur(err)}`);
			}
		}
		occupe = false;
		diffuserGroupes();
	});
}

/** Le joueur quitte le serveur : il quitte son groupe (ses gains rentrent avec lui), puis sa campagne est enregistrée. */
export function sortir(joueur: Player) {
	const i = enAttente.indexOf(joueur);
	if (i >= 0) enAttente.remove(i);
	invitations.delete(joueur);
	annonces.delete(joueur);
	quitterGroupe(joueur, true);
	const p = campagnePerso.get(joueur);
	partieDe.delete(joueur);
	campagnePerso.delete(joueur);
	if (!p) return;
	p.membres.delete(joueur);
	const id = idJoueur(joueur);
	if (p.etat.joueurs[id]?.present) p.jouer({ type: "presence", joueur: id, present: false });
	pcall(() => enregistrer(p.donnees, true));
	p.modifiee = false;
	ouvertes.delete(p.donnees.code);
	diffuserGroupes();
}

// ───────────────────────────── Groupes ─────────────────────────────

interface Groupe {
	chef: Player;
	/** Le chef d'abord. */
	membres: Player[];
}
const groupeDe = new Map<Player, Groupe>();
/** Point de l'histoire du chef quand chaque membre est arrivé (pour faire avancer l'histoire du membre au retour). */
const histoireAvant = new Map<Player, PointHistoire>();
const invitations = new Map<Player, { chef: Player; expire: number }>();
/** Tableau « Recherche de groupe » : ce que chaque chef (ou joueur seul) cherche à faire. */
const annonces = new Map<Player, { objectif: string }>();

function niveauDe(j: Player): number {
	const p = campagnePerso.get(j);
	const hid = p?.etat.joueurs[idJoueur(j)]?.herosId;
	return hid !== undefined ? p!.etat.heros[hid]?.niveau ?? 1 : 1;
}

export function publierAnnonce(j: Player, objectif: unknown): string | undefined {
	if (!aUnHeros(j)) return "Crée d'abord ton héros.";
	const g = groupeDe.get(j);
	if (g && g.chef !== j) return "Seul le chef du groupe peut publier une annonce.";
	if (g && g.membres.size() >= MAX_GROUPE) return "Ton groupe est déjà complet.";
	const i = typeIs(objectif, "number") ? objectif : 0;
	annonces.set(j, { objectif: OBJECTIFS_GROUPE[i] ?? OBJECTIFS_GROUPE[0] });
	diffuserGroupes();
	return undefined;
}

export function retirerAnnonce(j: Player): string | undefined {
	annonces.delete(j);
	diffuserGroupes();
	return undefined;
}

/** Rejoindre en un clic le groupe d'une annonce (sans attendre l'accord du chef : l'annonce est publique). */
export function rejoindreAnnonce(j: Player, chefId: unknown): string | undefined {
	const chef = typeIs(chefId, "number") ? Players.GetPlayerByUserId(chefId) : undefined;
	if (!chef || !annonces.has(chef)) return "Cette annonce n'existe plus.";
	if (chef === j) return "C'est ton annonce.";
	if (groupeDe.has(j)) return "Quitte d'abord ton groupe.";
	if (!aUnHeros(j)) return "Crée d'abord ton héros.";
	const g = groupeDe.get(chef);
	if (g && g.membres.size() >= MAX_GROUPE) return "Ce groupe est complet.";
	const err = rejoindreGroupe(chef, j);
	if (err !== undefined) return err;
	annonces.delete(j);
	const g2 = groupeDe.get(chef);
	if (g2 && g2.membres.size() >= MAX_GROUPE) annonces.delete(chef);
	diffuserGroupes();
	return undefined;
}

function aUnHeros(j: Player): boolean {
	const p = campagnePerso.get(j);
	return p !== undefined && p.etat.joueurs[idJoueur(j)]?.herosId !== undefined;
}

/** Informe chaque joueur : son groupe, l'invitation qu'il a reçue, et qui est déjà en groupe sur le serveur. */
export function diffuserGroupes() {
	const occupes: number[] = [];
	for (const [j] of groupeDe) occupes.push(j.UserId);
	const liste: EtatGroupe["annonces"] = [];
	for (const [chef, a] of annonces) {
		if (chef.Parent !== Players) continue;
		liste.push({ chef: chef.UserId, nom: chef.DisplayName, objectif: a.objectif, niveau: niveauDe(chef), places: MAX_GROUPE - (groupeDe.get(chef)?.membres.size() ?? 1) });
	}
	for (const j of Players.GetPlayers()) {
		const g = groupeDe.get(j);
		const inv = invitations.get(j);
		const info: EtatGroupe = {
			membres: g ? g.membres.map((m) => m.UserId) : undefined,
			invitation: inv && inv.expire > os.time() ? { chef: inv.chef.UserId, nom: inv.chef.DisplayName } : undefined,
			occupes,
			pret: aUnHeros(j),
			annonces: liste,
		};
		r.groupe.FireClient(j, info);
	}
}

export function inviter(chef: Player, cible: Player): string | undefined {
	if (chef === cible) return "Tu ne peux pas t'inviter toi-même.";
	if (!aUnHeros(chef)) return "Crée d'abord ton héros.";
	const g = groupeDe.get(chef);
	if (g && g.chef !== chef) return `Seul le chef du groupe (${g.chef.DisplayName}) peut inviter.`;
	if (g && g.membres.size() >= MAX_GROUPE) return `Ton groupe est complet (${MAX_GROUPE} joueurs).`;
	if (groupeDe.has(cible)) return `${cible.DisplayName} est déjà dans un groupe.`;
	if (!aUnHeros(cible)) return `${cible.DisplayName} n'a pas encore créé son héros.`;
	invitations.set(cible, { chef, expire: os.time() + 60 });
	diffuserGroupes();
	task.delay(61, diffuserGroupes);
	return undefined;
}

/** Le héros d'un joueur part en renfort dans la campagne du chef. */
function rejoindreGroupe(chef: Player, j: Player): string | undefined {
	const perso = campagnePerso.get(j);
	const campagneChef = campagnePerso.get(chef);
	if (!perso || !campagneChef) return "Campagne introuvable.";
	const id = idJoueur(j);
	const herosId = perso.etat.joueurs[id]?.herosId;
	if (herosId === undefined) return "Crée d'abord ton héros.";
	if (perso.etat.combats["groupe"] !== undefined || perso.etat.combats[herosId] !== undefined) return "Termine d'abord ton combat.";
	const voyageur = exporterHeros(perso.etat, herosId);
	const err = campagneChef.jouer({ type: "invite_arrive", joueur: id, pseudo: j.DisplayName, voyageur });
	if (err !== undefined) return err;
	let g = groupeDe.get(chef);
	if (!g) {
		g = { chef, membres: [chef] };
		groupeDe.set(chef, g);
	}
	g.membres.push(j);
	groupeDe.set(j, g);
	annonces.delete(j);
	perso.membres.delete(j);
	campagneChef.membres.add(j);
	partieDe.set(j, campagneChef);
	perso.donnees.retourEnAttente = voyageur;
	perso.modifiee = true;
	histoireAvant.set(j, pointHistoire(campagneChef.etat));
	envoyerCampagne(j, campagneChef);
	return undefined;
}

export function repondreInvitation(j: Player, accepter: boolean): string | undefined {
	const inv = invitations.get(j);
	invitations.delete(j);
	let err: string | undefined;
	if (!inv || inv.expire < os.time()) err = "Cette invitation a expiré.";
	else if (accepter) {
		if (inv.chef.Parent !== Players) err = "Ce joueur a quitté le serveur.";
		else if (groupeDe.has(j)) err = "Tu es déjà dans un groupe.";
		else {
			const g = groupeDe.get(inv.chef);
			if (g && g.chef !== inv.chef) err = "Ce joueur n'est plus chef de son groupe.";
			else if (g && g.membres.size() >= MAX_GROUPE) err = "Ce groupe est complet.";
			else err = rejoindreGroupe(inv.chef, j);
		}
	}
	diffuserGroupes();
	return err;
}

/** Ramène le héros d'un membre dans sa propre campagne, avec ses gains. */
function rentrer(j: Player, g: Groupe, depart: boolean) {
	const campagneChef = campagnePerso.get(g.chef);
	const perso = campagnePerso.get(j);
	const id = idJoueur(j);
	g.membres = g.membres.filter((m) => m !== j);
	groupeDe.delete(j);
	if (campagneChef && perso) {
		const herosId = campagneChef.etat.joueurs[id]?.herosId;
		if (herosId !== undefined) {
			const v = exporterHeros(campagneChef.etat, herosId);
			const err = perso.jouer({ type: "heros_retour", joueur: id, voyageur: v });
			if (err !== undefined) {
				warn(`[Velmaris] Retour de ${j.Name} : ${err}`);
				perso.donnees.retourEnAttente = v;
			} else perso.donnees.retourEnAttente = undefined;
			// l'histoire vécue avec le groupe compte aussi chez lui, s'il en était au même point
			const avant = histoireAvant.get(j);
			if (avant) {
				const delta = deltaHistoire(avant, pointHistoire(campagneChef.etat));
				if (delta.scenes.size() > 0) {
					const e2 = perso.jouer({ type: "histoire_retour", joueur: id, delta });
					if (e2 !== undefined) warn(`[Velmaris] Histoire de ${j.Name} : ${e2}`);
				}
			}
			histoireAvant.delete(j);
			perso.donnees.histoireEnAttente = undefined;
			perso.modifiee = true;
		}
		campagneChef.membres.delete(j);
		if (campagneChef.etat.joueurs[id]?.present) campagneChef.jouer({ type: "presence", joueur: id, present: false });
	}
	if (perso && !depart) {
		perso.membres.add(j);
		partieDe.set(j, perso);
		envoyerCampagne(j, perso);
	}
}

/** Quitter son groupe (le chef qui part dissout le groupe : chacun rentre chez lui). */
export function quitterGroupe(j: Player, depart = false): string | undefined {
	const g = groupeDe.get(j);
	if (!g) return depart ? undefined : "Tu n'es dans aucun groupe.";
	const campagneChef = campagnePerso.get(g.chef);
	if (!depart && campagneChef && campagneChef.etat.combats["groupe"] !== undefined) return "Attends la fin du combat pour quitter le groupe.";
	if (g.chef === j) {
		for (const m of [...g.membres]) if (m !== j) rentrer(m, g, false);
		groupeDe.delete(j);
	} else {
		rentrer(j, g, depart);
		if (g.membres.size() <= 1) groupeDe.delete(g.chef);
	}
	diffuserGroupes();
	return undefined;
}

/** Pendant qu'un joueur est en groupe, sa sauvegarde garde une copie de ses gains (en cas d'arrêt brutal du serveur). */
function majRetoursEnAttente() {
	for (const [j, g] of groupeDe) {
		if (g.chef === j) continue;
		const campagneChef = campagnePerso.get(g.chef);
		const perso = campagnePerso.get(j);
		const herosId = campagneChef?.etat.joueurs[idJoueur(j)]?.herosId;
		if (!campagneChef || !perso || herosId === undefined) continue;
		perso.donnees.retourEnAttente = exporterHeros(campagneChef.etat, herosId);
		const avant = histoireAvant.get(j);
		if (avant) {
			const delta = deltaHistoire(avant, pointHistoire(campagneChef.etat));
			perso.donnees.histoireEnAttente = delta.scenes.size() > 0 ? delta : undefined;
		}
		perso.modifiee = true;
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
	// rejoindre, renforts et retours : c'est le serveur seul qui les décide
	if (action.type === "rejoindre" || action.type === "portrait" || action.type === "invite_arrive" || action.type === "heros_retour" || action.type === "cadeau_admin")
		return r.erreur.FireClient(joueur, "Action non disponible sur Roblox.");
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
		if (tours % 3 === 0) pcall(majRetoursEnAttente);
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
	pcall(majRetoursEnAttente);
	for (const [, p] of ouvertes) pcall(() => enregistrer(p.donnees, true));
}

export { Players };
