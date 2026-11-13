/**
 * Écrans plein écran : accueil (créer / rejoindre une partie) et création du héros.
 */
import { CONTENU } from "shared/donnees";
import { caracsDeDepart, listeHeros, type Carac, type Caracs, type OptionsHeros } from "shared/moteur";
import type { ResumePartie } from "shared/reseau";
import { agir, commander, jeu, montrerErreur } from "../partie";
import { bouton, carte, champ, choix, colonne, COULEURS, esc, ligne, texte } from "./kit";

const CARACS: Carac[] = ["FOR", "AGI", "INT", "VIT", "ESP", "CHA"];
const NOMS_CARACS: Record<Carac, string> = { FOR: "Force", AGI: "Agilité", INT: "Intelligence", VIT: "Vitalité", ESP: "Esprit", CHA: "Charisme" };

function signe(n: number) {
	return n > 0 ? `+${n}` : `${n}`;
}
function trie<T extends { nom: string }>(o: Record<string, T>): T[] {
	const l: T[] = [];
	for (const [, v] of pairs(o)) l.push(v);
	l.sort((a, b) => a.nom < b.nom);
	return l;
}

// ───────────────────────────── Accueil ─────────────────────────────

const accueil = { nom: "", code: "", parties: undefined as ResumePartie[] | undefined, chargement: false };

export function ecranAccueil(racine: Frame, redessiner: () => void) {
	const c = colonne(racine, 12);
	texte(c, "Les Appelés de Velmaris", 34, { gras: true, couleur: COULEURS.or, centre: true });
	texte(c, "JDR isekai en coopération, de 1 à 6 joueurs.", 16, { couleur: COULEURS.texte2, centre: true });

	const creer = carte(c, "Créer une partie");
	texte(creer, "Tu deviens le premier joueur. Donne ensuite le code à tes amis.", 14, { couleur: COULEURS.texte2 });
	const l1 = ligne(creer);
	champ(l1, "Nom de la partie (ex. Les Lanternes)", accueil.nom, (v) => (accueil.nom = v), new UDim(0.65, 0));
	bouton(
		l1,
		"Créer",
		() => {
			if (accueil.nom.gsub("%s", "")[0].size() === 0) return;
			commander({ type: "creer", nom: accueil.nom });
		},
		{ principal: true },
	);

	const rej = carte(c, "Rejoindre une partie");
	texte(rej, "Entre le code à 6 caractères donné par un ami.", 14, { couleur: COULEURS.texte2 });
	const l2 = ligne(rej);
	champ(l2, "Code (ex. K7QM2X)", accueil.code, (v) => (accueil.code = v), new UDim(0.4, 0));
	bouton(l2, "Rejoindre", () => commander({ type: "rejoindre", code: accueil.code }), { principal: true });

	const mes = carte(c, "Mes parties");
	if (accueil.parties === undefined) {
		texte(mes, "Chargement…", 14, { couleur: COULEURS.texte2 });
		if (!accueil.chargement) {
			accueil.chargement = true;
			task.spawn(() => {
				const rep = commander({ type: "mes_parties" });
				accueil.parties = rep.parties ?? [];
				accueil.chargement = false;
				if (rep.info !== undefined) jeu.info = rep.info;
				redessiner();
			});
		}
	} else if (accueil.parties.size() === 0) {
		texte(mes, "Aucune partie pour l'instant.", 14, { couleur: COULEURS.texte2 });
	} else {
		for (const p of accueil.parties) {
			choix(mes, esc(p.nom), `Code ${p.code} — cliquer pour reprendre`, false, () => commander({ type: "rejoindre", code: p.code }));
		}
	}
}

export function oublierListeParties() {
	accueil.parties = undefined;
}

// ───────────────────────────── Création du héros ─────────────────────────────

const creation = {
	nom: "",
	origine: "invoque" as "invoque" | "reincarne",
	age: "20",
	race: "humain",
	classe: "lame-runique",
	don: "",
	plus: ["FOR", "VIT"] as Carac[],
	moins: ["CHA", "INT"] as Carac[],
};

function basculer(liste: Carac[], k: Carac): Carac[] {
	if (liste.includes(k)) return liste.filter((x) => x !== k);
	const res = [...liste, k];
	return res.size() > 2 ? [res[1], res[2]] : res;
}

export function ecranCreation(racine: Frame, redessiner: () => void) {
	const etat = jeu.etat!;
	const cfg = CONTENU.config.personnage;
	const c = colonne(racine, 12);
	texte(c, `Création de ton héros — partie « ${esc(jeu.nom)} » · code <b>${jeu.code}</b>`, 20, { gras: true, couleur: COULEURS.or });
	const enCours = etat.jour > 0 || listeHeros(etat).some((h) => h.niveau > 1);
	if (enCours) texte(c, "La campagne a déjà commencé : ton héros arrivera au niveau moyen du groupe.", 14, { couleur: COULEURS.vert });

	// 1. Identité
	const id = carte(c, "1. Identité");
	champ(id, "Nom du héros (ex. Kael)", creation.nom, (v) => (creation.nom = v));
	const lo = ligne(id);
	bouton(lo, "Invoqué (adulte, appelé par l'Ordre)", () => ((creation.origine = "invoque"), redessiner()), { choisi: creation.origine === "invoque" });
	bouton(lo, "Réincarné (né dans ce monde en 994)", () => ((creation.origine = "reincarne"), redessiner()), { choisi: creation.origine === "reincarne" });
	if (creation.origine === "invoque") {
		const la = ligne(id);
		texte(la, `Âge à l'arrivée (${cfg.age_invoque_min} à ${cfg.age_invoque_max}) :`, 15, { largeur: new UDim(0, 260) });
		champ(la, "20", creation.age, (v) => (creation.age = v), new UDim(0, 80));
	} else {
		texte(id, "Tu joueras un court prologue d'enfance (6, 10, 14 et 17 ans) avant le chapitre 1.", 14, { couleur: COULEURS.texte2 });
	}

	// 2. Race
	const ra = carte(c, "2. Race");
	for (const r of trie(CONTENU.races)) {
		const mods = r.modificateurs_libres
			? "+1 / +1 et −1 / −1 au choix"
			: CARACS.filter((k) => (r.modificateurs[k] ?? 0) !== 0).map((k) => `${k} ${signe(r.modificateurs[k] ?? 0)}`).join(", ");
		choix(ra, r.nom, `${mods}\n<b>${r.trait.nom}</b> : ${r.trait.avantage} <i>Défaut :</i> ${r.trait.defaut}`, creation.race === r.id, () => ((creation.race = r.id), redessiner()));
	}
	const libres = CONTENU.races[creation.race].modificateurs_libres !== undefined;
	if (libres) {
		texte(ra, "Humain : choisis <b>deux</b> caractéristiques à +1 et <b>deux autres</b> à −1.", 14);
		const lp = ligne(ra);
		texte(lp, "+1 :", 15, { largeur: new UDim(0, 40) });
		for (const k of CARACS) bouton(lp, k, () => ((creation.plus = basculer(creation.plus, k)), redessiner()), { choisi: creation.plus.includes(k), actif: !creation.moins.includes(k) });
		const lm = ligne(ra);
		texte(lm, "−1 :", 15, { largeur: new UDim(0, 40) });
		for (const k of CARACS) bouton(lm, k, () => ((creation.moins = basculer(creation.moins, k)), redessiner()), { choisi: creation.moins.includes(k), actif: !creation.plus.includes(k) });
	}

	// 3. Classe
	const cl = carte(c, "3. Classe");
	for (const k of trie(CONTENU.classes)) {
		const comps = k.competences.map((x) => CONTENU.competences[x]?.nom ?? x).join(", ");
		choix(cl, `${k.nom} — ${k.role}`, `${k.description}\nPassif : ${k.passif.nom} · Compétences : ${comps}\n<i>Fort :</i> ${k.point_fort} <i>Faible :</i> ${k.point_faible}`, creation.classe === k.id, () => ((creation.classe = k.id), redessiner()));
	}

	// 4. Don
	const dn = carte(c, "4. Don (unique dans la partie)");
	const pris = new Map<string, string>();
	for (const h of listeHeros(etat)) pris.set(h.don, h.nom);
	for (const d of trie(CONTENU.dons)) {
		const par = pris.get(d.id);
		choix(dn, par !== undefined ? `${d.nom} (pris par ${esc(par)})` : d.nom, `En combat : ${d.combat}\nHors combat : ${d.hors_combat}`, creation.don === d.id, () => ((creation.don = d.id), redessiner()), par === undefined);
	}

	// Récapitulatif
	const rc = carte(c, "Récapitulatif");
	const plusObj: Partial<Caracs> = {};
	const moinsObj: Partial<Caracs> = {};
	for (const k of creation.plus) plusObj[k] = 1;
	for (const k of creation.moins) moinsObj[k] = 1;
	const opt = libres ? { plus: plusObj, moins: moinsObj } : undefined;
	const [ok, caracs] = pcall(() => caracsDeDepart(CONTENU, creation.classe, creation.race, opt));
	if (ok) {
		const lc = ligne(rc, 10);
		for (const k of CARACS) texte(lc, `${NOMS_CARACS[k]}\n<b>${(caracs as Caracs)[k]}</b>`, 15, { largeur: new UDim(0, 105), centre: true });
	} else {
		texte(rc, tostring((caracs as unknown as { message?: string }).message ?? caracs), 14, { couleur: COULEURS.rouge });
	}
	bouton(
		rc,
		"Créer mon héros",
		() => {
			const heros: OptionsHeros = { nom: creation.nom, classe: creation.classe, race: creation.race, don: creation.don, origine: creation.origine, libres: opt };
			if (creation.nom.gsub("%s", "")[0].size() === 0) return agirErreur("Donne un nom à ton héros.");
			if (creation.don === "") return agirErreur("Choisis un don.");
			if (creation.origine === "invoque") heros.age = tonumber(creation.age) ?? 20;
			agir({ type: "creer_heros", heros });
		},
		{ principal: true, actif: ok },
	);
}

function agirErreur(m: string) {
	montrerErreur(m);
}
