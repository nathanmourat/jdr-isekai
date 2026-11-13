/**
 * Sauvegarde des parties dans les DataStores Roblox.
 *  - « VelmarisParties_v1 » : code → { nom, depart, actions, verrou }
 *  - « VelmarisJoueurs_v1 » : u<UserId> → { parties: [{ code, nom }] }
 * Dans Studio sans accès aux services (jeu non publié ou option désactivée), on garde tout en mémoire :
 * le jeu marche, mais rien n'est conservé après l'arrêt.
 */
import { DataStoreService, HttpService, RunService } from "@rbxts/services";
import type { Action, EtatPartie } from "shared/moteur";
import type { ResumePartie } from "shared/reseau";

export interface DonneesPartie {
	code: string;
	nom: string;
	depart: EtatPartie;
	actions: Action[];
	/** Serveur qui a la partie ouverte (évite que deux serveurs l'écrivent en même temps). */
	verrou?: { serveur: string; expire: number };
}

const SERVEUR = RunService.IsStudio() ? `studio-${HttpService.GenerateGUID(false)}` : game.JobId;
const DUREE_VERROU = 180; // secondes

let memoire = false;
const parties = new Map<string, DonneesPartie>();
const joueurs = new Map<string, ResumePartie[]>();

let storeParties: DataStore | undefined;
let storeJoueurs: DataStore | undefined;
{
	const [ok] = pcall(() => {
		storeParties = DataStoreService.GetDataStore("VelmarisParties_v1");
		storeJoueurs = DataStoreService.GetDataStore("VelmarisJoueurs_v1");
		// petit test : échoue dans Studio si l'accès aux services n'est pas activé
		storeJoueurs.GetAsync("test");
	});
	if (!ok) {
		memoire = true;
		warn("[Velmaris] DataStores indisponibles : parties gardées en mémoire seulement (normal dans Studio si le jeu n'est pas publié).");
	}
}

export function sauvegardeActive(): boolean {
	return !memoire;
}

/** Appel DataStore avec 3 essais (les DataStores peuvent échouer ponctuellement). */
function essayer<T>(f: () => T): T {
	let derniere: unknown;
	for (let i = 0; i < 3; i++) {
		const [ok, res] = pcall(f);
		if (ok) return res as T;
		derniere = res;
		task.wait(1 + i * 2);
	}
	throw `Sauvegarde Roblox indisponible : ${tostring(derniere)}`;
}

export function partieExiste(code: string): boolean {
	if (memoire) return parties.has(code);
	return essayer(() => storeParties!.GetAsync(code)[0]) !== undefined;
}

/** Charge une partie et la verrouille pour ce serveur. Renvoie un message d'erreur si impossible. */
export function chargerEtVerrouiller(code: string): DonneesPartie | string {
	if (memoire) return parties.get(code) ?? "Aucune partie avec ce code.";
	let refus: string | undefined;
	const res = essayer(() =>
		storeParties!.UpdateAsync(code, (ancien: unknown) => {
			refus = undefined;
			const d = ancien as DonneesPartie | undefined;
			if (d === undefined) {
				refus = "Aucune partie avec ce code.";
				return $tuple(undefined);
			}
			const v = d.verrou;
			if (v !== undefined && v.serveur !== SERVEUR && v.expire > os.time()) {
				refus = "Cette partie est déjà ouverte sur un autre serveur. Rejoins ton ami sur Roblox (bouton « Rejoindre » sur son profil), puis entre le code.";
				return $tuple(undefined);
			}
			d.verrou = { serveur: SERVEUR, expire: os.time() + DUREE_VERROU };
			return $tuple(d);
		}),
	);
	if (refus !== undefined) return refus;
	return res[0] as DonneesPartie;
}

/** Enregistre la partie (et prolonge le verrou, ou le libère). */
export function enregistrer(d: DonneesPartie, liberer = false) {
	if (memoire) {
		parties.set(d.code, d);
		return;
	}
	d.verrou = liberer ? undefined : { serveur: SERVEUR, expire: os.time() + DUREE_VERROU };
	essayer(() =>
		storeParties!.UpdateAsync(d.code, (ancien: unknown) => {
			const a = ancien as DonneesPartie | undefined;
			// ne jamais écraser une partie reprise par un autre serveur
			if (a?.verrou !== undefined && a.verrou.serveur !== SERVEUR && a.verrou.expire > os.time()) return $tuple(undefined);
			return $tuple(d);
		}),
	);
}

export function partiesDuJoueur(id: string): ResumePartie[] {
	if (memoire) return joueurs.get(id) ?? [];
	const r = essayer(() => storeJoueurs!.GetAsync(id)[0]) as { parties: ResumePartie[] } | undefined;
	return r?.parties ?? [];
}

export function ajouterPartieAuJoueur(id: string, p: ResumePartie) {
	const ajouter = (liste: ResumePartie[]) => [p, ...liste.filter((x) => x.code !== p.code)].filter((_, i) => i < 20);
	if (memoire) {
		joueurs.set(id, ajouter(joueurs.get(id) ?? []));
		return;
	}
	essayer(() =>
		storeJoueurs!.UpdateAsync(id, (ancien: unknown) => {
			const a = (ancien as { parties: ResumePartie[] } | undefined)?.parties ?? [];
			return $tuple({ parties: ajouter(a) });
		}),
	);
}
