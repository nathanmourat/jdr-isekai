/**
 * Écrans plein écran : chargement de la campagne du joueur et création du héros.
 */
import { CONTENU } from "shared/donnees";
import { caracsDeDepart, listeHeros, type Carac, type Caracs, type OptionsHeros } from "shared/moteur";
import { Players } from "@rbxts/services";
import { agir, jeu, montrerErreur } from "../partie";
import { bouton, carte, champ, choix, colonne, COULEURS, esc, ligne, texte } from "./kit";
import { tr, trf, tx } from "shared/langue";

const CARACS: Carac[] = ["FOR", "AGI", "INT", "VIT", "ESP", "CHA"];
const NOMS_CARACS: Record<Carac, string> = { FOR: tx("Force"), AGI: tx("Agilité"), INT: tx("Intelligence"), VIT: tx("Vitalité"), ESP: tx("Esprit"), CHA: tx("Charisme") };

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

/** En attendant la campagne du serveur (chargée automatiquement à l'arrivée). */
export function ecranAccueil(racine: Frame, _redessiner: () => void) {
	const c = colonne(racine, 12);
	texte(c, tr("Les Appelés de Velmaris"), 34, { gras: true, couleur: COULEURS.or, centre: true });
	texte(c, tr("JDR isekai en coopération : joue seul ou en groupe (6 au plus)."), 16, { couleur: COULEURS.texte2, centre: true });
	texte(c, tr("Chargement de ta campagne…"), 18, { centre: true });
	texte(
		c,
		tr("Ton héros et ton histoire sont sauvegardés sur ton compte Roblox.\nEn groupe, vous jouez la campagne du chef ; tes gains te suivent dans ta campagne."),
		14,
		{ couleur: COULEURS.texte2, centre: true },
	);
}

// ───────────────────────────── Création du héros ─────────────────────────────

const creation = {
	sexe: "m" as "m" | "f",
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
	texte(c, trf("Création de ton héros — {esc}", { esc: esc(jeu.nom) }), 20, { gras: true, couleur: COULEURS.or });
	const enCours = etat.jour > 0 || listeHeros(etat).some((h) => h.niveau > 1);
	if (enCours) texte(c, tr("La campagne a déjà commencé : ton héros arrivera au niveau moyen du groupe."), 14, { couleur: COULEURS.vert });

	// 1. Identité
	const id = carte(c, tr("1. Origine"));
	texte(id, trf("Ton héros porte ton nom Roblox : <b>{esc}</b>.", { esc: esc(Players.LocalPlayer.DisplayName) }), 15);
	const ls = ligne(id);
	bouton(ls, tr("Un homme"), () => ((creation.sexe = "m"), redessiner()), { choisi: creation.sexe === "m" });
	bouton(ls, tr("Une femme"), () => ((creation.sexe = "f"), redessiner()), { choisi: creation.sexe === "f" });
	const lo = ligne(id);
	bouton(lo, tr("Invoqué (adulte, appelé par l'Ordre)"), () => ((creation.origine = "invoque"), redessiner()), { choisi: creation.origine === "invoque" });
	bouton(lo, tr("Réincarné (né dans ce monde en 994)"), () => ((creation.origine = "reincarne"), redessiner()), { choisi: creation.origine === "reincarne" });
	if (creation.origine === "invoque") {
		const la = ligne(id);
		texte(la, trf("Âge à l'arrivée ({age_invoque_min} à {age_invoque_max}) :", { age_invoque_min: cfg.age_invoque_min, age_invoque_max: cfg.age_invoque_max }), 15, { largeur: new UDim(0, 260) });
		champ(la, "20", creation.age, (v) => (creation.age = v), new UDim(0, 80));
	} else {
		texte(id, tr("Tu joueras un court prologue d'enfance (6, 10, 14 et 17 ans) avant le chapitre 1."), 14, { couleur: COULEURS.texte2 });
	}

	// 2. Race
	const ra = carte(c, tr("2. Race"));
	for (const r of trie(CONTENU.races)) {
		const mods = r.modificateurs_libres
			? tr("+1 / +1 et −1 / −1 au choix")
			: CARACS.filter((k) => (r.modificateurs[k] ?? 0) !== 0).map((k) => `${k} ${signe(r.modificateurs[k] ?? 0)}`).join(", ");
		choix(ra, r.nom, trf("{mods}\n<b>{nom}</b> : {avantage} <i>Défaut :</i> {defaut}", { mods, nom: r.trait.nom, avantage: r.trait.avantage, defaut: r.trait.defaut }), creation.race === r.id, () => ((creation.race = r.id), redessiner()));
	}
	const libres = CONTENU.races[creation.race].modificateurs_libres !== undefined;
	if (libres) {
		texte(ra, tr("Humain : choisis <b>deux</b> caractéristiques à +1 et <b>deux autres</b> à −1."), 14);
		const lp = ligne(ra);
		texte(lp, "+1 :", 15, { largeur: new UDim(0, 40) });
		for (const k of CARACS) bouton(lp, k, () => ((creation.plus = basculer(creation.plus, k)), redessiner()), { choisi: creation.plus.includes(k), actif: !creation.moins.includes(k) });
		const lm = ligne(ra);
		texte(lm, "−1 :", 15, { largeur: new UDim(0, 40) });
		for (const k of CARACS) bouton(lm, k, () => ((creation.moins = basculer(creation.moins, k)), redessiner()), { choisi: creation.moins.includes(k), actif: !creation.plus.includes(k) });
	}

	// 3. Classe
	const cl = carte(c, tr("3. Classe"));
	for (const k of trie(CONTENU.classes)) {
		const comps = k.competences.map((x) => CONTENU.competences[x]?.nom ?? x).join(", ");
		choix(cl, `${k.nom} — ${k.role}`, trf("{description}\nPassif : {nom} · Compétences : {comps}\n<i>Fort :</i> {point_fort} <i>Faible :</i> {point_faible}", { description: k.description, nom: k.passif.nom, comps, point_fort: k.point_fort, point_faible: k.point_faible }), creation.classe === k.id, () => ((creation.classe = k.id), redessiner()));
	}

	// 4. Don
	const dn = carte(c, tr("4. Don (unique dans la partie)"));
	const pris = new Map<string, string>();
	for (const h of listeHeros(etat)) pris.set(h.don, h.nom);
	for (const d of trie(CONTENU.dons)) {
		const par = pris.get(d.id);
		choix(dn, par !== undefined ? trf("{nom} (pris par {esc})", { nom: d.nom, esc: esc(par) }) : d.nom, trf("En combat : {combat}\nHors combat : {hors_combat}", { combat: d.combat, hors_combat: d.hors_combat }), creation.don === d.id, () => ((creation.don = d.id), redessiner()), par === undefined);
	}

	// Récapitulatif
	const rc = carte(c, tr("Récapitulatif"));
	const plusObj: Partial<Caracs> = {};
	const moinsObj: Partial<Caracs> = {};
	for (const k of creation.plus) plusObj[k] = 1;
	for (const k of creation.moins) moinsObj[k] = 1;
	const opt = libres ? { plus: plusObj, moins: moinsObj } : undefined;
	const [ok, caracs] = pcall(() => caracsDeDepart(CONTENU, creation.classe, creation.race, opt));
	if (ok) {
		const lc = ligne(rc, 10);
		for (const k of CARACS) texte(lc, `${tr(NOMS_CARACS[k])}\n<b>${(caracs as Caracs)[k]}</b>`, 15, { largeur: new UDim(0, 105), centre: true });
	} else {
		texte(rc, tostring((caracs as unknown as { message?: string }).message ?? caracs), 14, { couleur: COULEURS.rouge });
	}
	bouton(
		rc,
		tr("Créer mon héros"),
		() => {
			const heros: OptionsHeros = { nom: Players.LocalPlayer.DisplayName, sexe: creation.sexe, classe: creation.classe, race: creation.race, don: creation.don, origine: creation.origine, libres: opt };
			if (creation.don === "") return agirErreur(tr("Choisis un don."));
			if (creation.origine === "invoque") heros.age = tonumber(creation.age) ?? 20;
			agir({ type: "creer_heros", heros });
		},
		{ principal: true, actif: ok },
	);
}

function agirErreur(m: string) {
	montrerErreur(m);
}
