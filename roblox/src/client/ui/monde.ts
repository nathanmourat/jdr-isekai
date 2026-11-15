/**
 * Le monde (hors scène, combat, donjon) : barre du haut, menu, et panneaux (personnage, quêtes, journal,
 * compagnons, carte, partie) ; le panneau d'un lieu s'ouvre quand on entre dans un bâtiment.
 * Même contenu que la version web (src/ui/panneaux et src/ui/vues/Lieu.svelte).
 */
import { Players, Workspace } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { tousLesLieux } from "shared/geo";
import { ficheObjet, type ActionObjet } from "./objets";
import {
	affinite,
	age,
	caracsTotales,
	competencesConnues,
	competencesEquipees,
	conditionHeros,
	conditionScene,
	etapeContrat,
	fusionsPossibles,
	attenteRepos,
	prochaineDateHistoire,
	formaterDate,
	lieuAvecCombat,
	lieuxDesEtapes,
	listeHeros,
	manaMax,
	palierCompagnon,
	prixAchat,
	prixVente,
	estGuilde,
	problemeEquipement,
	exemplaires,
	prochaineEtape,
	pvMax,
	pvHorsCombat,
	pvMaxHorsCombat,
	RATION,
	remplacerVariables,
	retourContrat,
	candidatsExamen,
	prochainExamen,
	rangHeros,
	scenesDisponibles,
	versDate,
	xpPourNiveau,
	type Carac,
	type Heros,
	type RegionDef,
} from "shared/moteur";
import { agir, commandeGroupe, commandeModeration, jeu, monHeros } from "../partie";
import { RAISONS } from "shared/grades";
import { OBJECTIFS_GROUPE } from "shared/reseau";
import { vueModeration } from "./moderation";
import { ouvrirBoutique } from "./boutique";
import { ouvrirReglages } from "./reglages";
import { messageLocal } from "./messages";
import { NOMS_TEMPS, tempsActuel } from "../rendu/meteo";
import { pierresConnues, teleportationPossible, voyagerVers } from "../rendu/voyage";
import { DEBLOCAGE_VOYAGE, pierresDeVoyage, voyageDebloque } from "shared/voyage";
import { affichage, type Panneau } from "../local";
import { barre, bouton, carte, colonne, COULEURS, esc, ligne, texte } from "./kit";
import { tr, trMoteur, trf, tx } from "shared/langue";

const CARACS: Carac[] = ["FOR", "AGI", "INT", "VIT", "ESP", "CHA"];
const NOMS_CARACS: Record<Carac, string> = { FOR: tx("Force"), AGI: tx("Agilité"), INT: tx("Intelligence"), VIT: tx("Vitalité"), ESP: tx("Esprit"), CHA: tx("Charisme") };
const RANGS = ["F", "E", "D", "C", "B", "A", "S"];
const TYPES_QUETE: Record<string, string> = {
	principale: tx("Quête principale"),
	secondaire: tx("Quête secondaire"),
	classe: tx("Quête de classe"),
	compagnon: tx("Quête de compagnon"),
	contrat: tx("Contrat"),
};
const ONGLETS: [Panneau, string][] = [
	["carte", tx("🗺 Carte")],
	["fiche", tx("Personnage")],
	["compagnons", tx("Compagnons")],
	["quetes", tx("Quêtes")],
	["journal", tx("Journal")],
	["partie", tx("👥 Groupe")],
];

function lieux() {
	return tousLesLieux();
}
function nomLieu(id: string | undefined): string | undefined {
	if (id === undefined) return undefined;
	// maisons habitées (construites par le serveur) : leur nom est un attribut de la salle
	const salle = Workspace.FindFirstChild("Interieurs")?.FindFirstChild(id);
	const nom = salle?.GetAttribute("Nom");
	if (typeIs(nom, "string")) return trMoteur(nom);
	return lieux().find((l) => l.id === id)?.nom ?? id;
}

/** PV hors combat, en rouge sous la moitié (on garde ses PV d'un combat à l'autre, test 3). */
function textePv(h: Heros): string {
	const pv = pvHorsCombat(CONTENU, h);
	const max = pvMaxHorsCombat(CONTENU, h);
	return trf("<font color=\"{v}\">{pv}/{max} PV</font>", { v: pv * 2 < max ? "#e0605a" : "#7fc77a", pv, max });
}

/** Barre du haut : date, héros, prochaine étape et menu. */
export function barreHaut(parent: Frame, redessiner: () => void, allerA: (lieu: string) => void) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const c = colonne(parent, 6);
	const l1 = ligne(c, 10);
	texte(l1, trf("<b>{formaterDate}</b> · Chapitre {chapitre} · {v}", { formaterDate: trMoteur(formaterDate(CONTENU, etat.jour)), chapitre: etat.chapitre, v: tr(NOMS_TEMPS[tempsActuel()]) }), 16, { largeur: new UDim(0, 350) });
	texte(
		l1,
		trf("<font color=\"#d9a441\">{esc} · niv. {niveau} · rang {rangHeros} · {or} or</font> · {textePv}{v}", { esc: esc(h.nom), niveau: h.niveau, rangHeros: rangHeros(etat, h.id), or: h.or, textePv: textePv(h), v: etat.meneur !== undefined ? trf(" · Meneur : {esc}", { esc: esc(etat.joueurs[etat.meneur]?.pseudo ?? "?") }) : "" }),
		15,
		{ largeur: new UDim(1, -420) },
	);
	// barre réductible (pratique sur téléphone) : une seule ligne quand elle est réduite
	bouton(l1, affichage.barreReduite ? "▾" : "▴", () => ((affichage.barreReduite = !affichage.barreReduite), redessiner()), { hauteur: 28, taille: 14 });
	if (affichage.barreReduite) {
		const lr = ligne(c, 6);
		for (const [id, nom] of ONGLETS) bouton(lr, tr(nom), () => ((affichage.panneau = affichage.panneau === id ? undefined : id), (affichage.lieu = undefined), redessiner()), { choisi: affichage.panneau === id, hauteur: 28, taille: 13 });
		bouton(lr, "🛍", () => ouvrirBoutique(), { hauteur: 28, taille: 13 });
		bouton(lr, "⚙", () => ouvrirReglages(), { hauteur: 28, taille: 13 });
		return;
	}
	if (affichage.dans !== undefined) {
		const ld = ligne(c, 8);
		texte(ld, trf("📍 Tu es dans : <b>{nomLieu}</b>", { nomLieu: nomLieu(affichage.dans) }), 15, { largeur: new UDim(0, 320) });
		if (!affichage.dans.match("^maison%-")[0]) bouton(ld, tr("Que faire ici ?"), () => {
			affichage.lieu = affichage.dans;
			affichage.section = "tout";
			affichage.panneau = undefined;
			redessiner();
		}, { hauteur: 30, taille: 14 });
	}
	// héros d'une ancienne campagne : on demande son sexe (accords des textes, test 3)
	if (h.sexeChoisi === false) {
		const lsx = ligne(c, 8);
		texte(lsx, trf("<b>{esc}</b> est-il un homme ou une femme ? (pour accorder les textes)", { esc: esc(h.nom) }), 15, { largeur: new UDim(1, -240), couleur: COULEURS.or });
		bouton(lsx, tr("Un homme"), () => agir({ type: "changer_sexe", sexe: "m" }), { hauteur: 30, taille: 14 });
		bouton(lsx, tr("Une femme"), () => agir({ type: "changer_sexe", sexe: "f" }), { hauteur: 30, taille: 14 });
	}
	// PV bas : on prévient avant le prochain combat (test 3)
	if (pvHorsCombat(CONTENU, h) * 2 < pvMaxHorsCombat(CONTENU, h))
		texte(c, tr("⚠ Moins de la moitié de tes PV : soigne-toi avant de te battre (repas à l'auberge, Temple, potion ou ration du sac, ou repos)."), 13, { couleur: COULEURS.rouge });
	// invitation dans un groupe (60 s pour répondre)
	const inv = jeu.groupe?.invitation;
	if (inv) {
		const li = ligne(c, 8);
		texte(li, trf("👥 <b>{esc}</b> t'invite dans son groupe (vous jouerez sa campagne, tes gains te suivent).", { esc: esc(inv.nom) }), 15, { largeur: new UDim(1, -230), couleur: COULEURS.or });
		bouton(li, tr("Accepter"), () => commandeGroupe({ type: "repondre_invitation", accepter: true }), { principal: true, hauteur: 30, taille: 14 });
		bouton(li, tr("Refuser"), () => commandeGroupe({ type: "repondre_invitation", accepter: false }), { hauteur: 30, taille: 14 });
	}
	// proposition de dormir à l'auberge : chacun doit répondre, où qu'il soit
	const repos = etat.repos;
	if (repos && !repos.accords.includes(jeu.moi)) {
		const lr = ligne(c, 8);
		texte(lr, trf("🛏 <b>{esc}</b> propose de dormir <b>{mois} mois</b> à l'auberge.", { esc: esc(etat.joueurs[repos.par]?.pseudo ?? "?"), mois: repos.mois }), 15, { largeur: new UDim(1, -230), couleur: COULEURS.or });
		bouton(lr, tr("Accepter"), () => agir({ type: "repondre_repos", accepte: true }), { principal: true, hauteur: 30, taille: 14 });
		bouton(lr, tr("Refuser"), () => agir({ type: "repondre_repos", accepte: false }), { hauteur: 30, taille: 14 });
	}
	// contrat en cours
	const contrat = etapeContrat(CONTENU, etat, h.id);
	if (contrat) {
		const lc = ligne(c, 8);
		texte(lc, trf("📜 <b>{titre}</b> ({numero}/{total}) : {objectif}", { titre: contrat.contrat.titre, numero: contrat.numero, total: contrat.total, objectif: contrat.etape.objectif }), 14, { largeur: new UDim(1, -130) });
		bouton(lc, teleportationPossible(contrat.etape.lieu) ? tr("Y aller") : tr("Guider"), () => allerA(contrat.etape.lieu), { hauteur: 30, taille: 14 });
	}
	const etape = prochaineEtape(CONTENU, etat, h.id);
	if (etape) {
		const l2 = ligne(c, 8);
		texte(l2, trf("➤ <b>Prochaine étape :</b> {objectif}", { objectif: etape.objectif }), 15, { largeur: new UDim(1, -130) });
		if (etape.lieu !== undefined && etape.disponible) bouton(l2, teleportationPossible(etape.lieu) ? tr("Y aller") : tr("Guider"), () => allerA(etape.lieu!), { principal: true, hauteur: 32 });
	}
	const l3 = ligne(c, 6);
	// l'équipe de modération a un onglet de plus
	const onglets = [...ONGLETS];
	if (jeu.moderation !== undefined && jeu.moderation.grade !== "joueur") onglets.push(["moderation", tr("🛡 Modération")]);
	for (const [id, nom] of onglets) {
		const pastille = (id === "fiche" && (h.pointsCaracDispo > 0 || h.pointsCompetenceDispo > 0)) ? " ●" : "";
		bouton(
			l3,
			`${tr(nom)}${pastille}`,
			() => {
				affichage.panneau = affichage.panneau === id ? undefined : id;
				affichage.lieu = undefined;
				redessiner();
			},
			{ choisi: affichage.panneau === id, hauteur: 32, taille: 14 },
		);
	}
	// boutique en Robux (cosmétiques) : sa propre fenêtre, aussi avec la touche B
	bouton(l3, tr("🛍 Boutique"), () => ouvrirBoutique(), { hauteur: 32, taille: 14 });
	bouton(l3, "⚙", () => ouvrirReglages(), { hauteur: 32, taille: 14 });
	if (etat.dernieresNouvelles.size() > 0) texte(c, etat.dernieresNouvelles.map((x) => trMoteur(x)).join("  ·  "), 14, { couleur: COULEURS.or });
}

/** Contenu du panneau latéral (lieu ou onglet ouvert). Renvoie false s'il n'y a rien à afficher. */
export function panneauLateral(parent: Frame, redessiner: () => void, allerA: (lieu: string) => void): boolean {
	const fermer = () => {
		affichage.panneau = undefined;
		affichage.lieu = undefined;
		redessiner();
	};
	if (affichage.lieu !== undefined) {
		vueLieu(parent, affichage.lieu, fermer, redessiner);
		return true;
	}
	if (affichage.panneau === undefined) return false;
	const entete = ligne(parent);
	bouton(entete, tr("✕ Fermer"), fermer, { hauteur: 30, taille: 14 });
	switch (affichage.panneau) {
		case "carte":
			vueCarte(parent, allerA);
			break;
		case "fiche":
			vueFiche(parent);
			break;
		case "quetes":
			vueQuetes(parent);
			break;
		case "journal":
			vueJournal(parent);
			break;
		case "compagnons":
			vueCompagnons(parent);
			break;
		case "moderation":
			vueModeration(parent, redessiner);
			break;
		case "voyage":
			vueVoyage(parent);
			break;
		case "partie":
			vuePartie(parent, redessiner);
			break;
		case "histoire":
			vueQuetes(parent);
			break;
	}
	return true;
}

// ───────────────────────────── Lieu ─────────────────────────────

/**
 * Panneau d'un lieu. `affichage.section` dit ce que le joueur a demandé dans la salle :
 * parler (scènes), contrats (tableau), boutique (comptoir), grimoire (pupitre), ou tout.
 */
function vueLieu(parent: Frame, id: string, fermer: () => void, redessiner: () => void) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const lieu = lieux().find((l) => l.id === id);
	if (!lieu) return;
	const section = affichage.section;
	const voir = (s: string) => section === "tout" || section === s || (section === "etape" && s === "parler");
	const tous = listeHeros(etat).map((x) => x.id);
	const entete = ligne(parent);
	bouton(entete, tr("✕ Fermer"), fermer, { hauteur: 30, taille: 14 });
	if (section !== "tout") bouton(entete, tr("Tout ce qu'on peut faire ici"), () => ((affichage.section = "tout"), redessiner()), { hauteur: 30, taille: 14 });
	texte(parent, lieu.nom, 24, { gras: true, couleur: COULEURS.or });
	if (section === "tout") texte(parent, lieu.description, 15);
	const pnj = lieu.pnj.filter((p) => conditionScene(CONTENU, etat, p.si, tous));
	if (pnj.size() > 0) texte(parent, trf("Ici : {v}", { v: pnj.map((p) => CONTENU.compagnons[p.id]?.nom ?? CONTENU.pnj[p.id]?.nom ?? p.id).join(", ") }), 14, { couleur: COULEURS.texte2 });

	// en parlant à un PNJ : ses scènes (et celles qui ne nomment personne, pour le premier PNJ du lieu)
	const avecQui = section === "parler" ? affichage.pnj : undefined;
	const premier = lieu.pnj[0]?.id === avecQui;
	const scenes = voir("parler")
		? scenesDisponibles(CONTENU, etat, id, h.id).filter((sc) => avecQui === undefined || sc.pnj === avecQui || (sc.pnj === undefined && premier))
		: [];
	if (avecQui !== undefined) texte(parent, trf("Tu parles à <b>{v}</b>.", { v: CONTENU.compagnons[avecQui]?.nom ?? CONTENU.pnj[avecQui]?.nom ?? avecQui }), 15, { couleur: COULEURS.or });
	const groupe = scenes.filter((s) => s.type === "groupe");
	const perso = scenes.filter((s) => s.type === "individuel");
	if (section === "parler" && scenes.size() === 0) texte(parent, tr("« Rien de neuf pour l'instant. Repasse plus tard ! »"), 15, { couleur: COULEURS.texte2 });
	if (groupe.size() > 0) {
		const c = carte(parent, tr("Avec le groupe"));
		for (const s of groupe) {
			const l = ligne(c);
			const q = s.quete !== undefined ? CONTENU.quetes[s.quete] : undefined;
			texte(l, `${s.titre}${q ? trf(" <font color=\"#d9a441\">({v})</font>", { v: q.type === "principale" ? tr("quête principale") : tr("quête") }) : ""}`, 15, { largeur: new UDim(1, -110) });
			bouton(l, tr("Lancer"), () => agir({ type: "lancer_scene", scene: s.id }), { principal: true, hauteur: 34 });
		}
		texte(c, tr("Une scène de groupe implique tous les héros : les choix sont votés."), 13, { couleur: COULEURS.texte2 });
	}
	if (perso.size() > 0) {
		const c = carte(parent, trf("Pour {esc} seul", { esc: esc(h.nom) }));
		for (const s of perso) {
			const l = ligne(c);
			texte(l, s.titre, 15, { largeur: new UDim(1, -110) });
			bouton(l, tr("Y aller"), () => agir({ type: "lancer_scene", scene: s.id }), { hauteur: 34 });
		}
	}
	// étape de contrat qui se joue ici
	const enCours = etapeContrat(CONTENU, etat, h.id);
	if (enCours && enCours.etape.lieu === id && (voir("parler") || section === "etape")) {
		const c = carte(parent, trf("📜 Contrat : {titre} — étape {numero}/{total}", { titre: enCours.contrat.titre, numero: enCours.numero, total: enCours.total }));
		for (const n of enCours.notes) texte(c, n, 13, { couleur: COULEURS.texte2 });
		texte(c, enCours.etape.texte, 15);
		const e = enCours.etape;
		if (e.choix.size() > 0) {
			e.choix.forEach((ch, k) => bouton(c, ch.texte, () => agir({ type: "etape_contrat", choix: k }), { largeur: new UDim(1, 0), hauteur: 36, taille: 14 }));
		} else if (e.combat !== undefined) {
			bouton(c, `⚔ ${e.bouton ?? tr("Engager le combat")}`, () => agir({ type: "etape_contrat" }), { principal: true });
		} else if (e.test) {
			bouton(c, trf("{v} ({carac}, difficulté {difficulte})", { v: e.bouton ?? "Tenter", carac: e.test.carac, difficulte: e.test.difficulte }), () => agir({ type: "etape_contrat" }), { principal: true });
		} else {
			bouton(c, e.bouton ?? tr("Continuer"), () => agir({ type: "etape_contrat" }), { principal: true });
		}
	}
	if (estGuilde(id) && voir("contrats")) {
		const rang = rangHeros(etat, h.id);
		// Examen du rang suivant : les points ne donnent plus le rang, ils ouvrent l'examen
		const ex = prochainExamen(CONTENU, etat, h.id);
		const ce = carte(parent, trf("🎖 Rang de Guilde : {rang}", { rang }));
		if (ex === undefined) {
			texte(ce, tr("Tu as atteint le rang le plus haut de la Guilde."), 14, { couleur: COULEURS.or });
		} else {
			const ok = (v: boolean, t: string) => trf("<font color=\"{v}\">{t}</font>", { v: v ? "#7fc77a" : "#e0605a", t });
			const epreuve = ex.type === "epreuve" ? tr("une épreuve en plusieurs étapes, qui se termine par un combat") : ex.type === "scene" ? tr("une épreuve qui arrive pendant l'histoire") : tr("un combat contre un examinateur");
			texte(ce, trf("Rang suivant : <b>{rang}</b>. Il faut {ok}, {ok2}, puis réussir {epreuve}.", { rang: ex.rang, ok: ok(ex.points >= ex.pointsRequis, trf("{pointsRequis} points de Guilde ({points})", { pointsRequis: ex.pointsRequis, points: ex.points })), ok2: ok(h.niveau >= ex.niveauRequis, trf("le niveau {niveauRequis} ({niveau})", { niveauRequis: ex.niveauRequis, niveau: h.niveau })), epreuve }), 14);
			texte(ce, tr("Aucun danger au combat d'examen : ni blessure, ni or perdu. En cas d'échec, on revient le lendemain."), 12, { couleur: COULEURS.texte2 });
			if (ex.pret) {
				const avec = candidatsExamen(CONTENU, etat, h.id).filter((x) => x !== h.id).map((x) => etat.heros[x].nom);
				if (avec.size() > 0) texte(ce, trf("Avec toi : {v} (prêts pour le même examen).", { v: avec.join(", ") }), 13, { couleur: COULEURS.texte2 });
				bouton(ce, ex.type === "epreuve" ? trf("Commencer l'épreuve du rang {rang}", { rang: ex.rang }) : trf("⚔ Passer l'examen du rang {rang}", { rang: ex.rang }), () => agir({ type: "examen_rang" }), { principal: true });
			} else {
				texte(ce, ex.raison, 13, { couleur: COULEURS.or });
			}
		}
		const c = carte(parent, trf("Tableau des contrats (ton rang : {rang})", { rang }));
		if (enCours) {
			texte(c, trf("<b>En cours : {titre}</b> (étape {numero}/{total})", { titre: enCours.contrat.titre, numero: enCours.numero, total: enCours.total }), 15, { couleur: COULEURS.or });
			texte(c, `➤ ${enCours.etape.objectif}  📍 ${nomLieu(enCours.etape.lieu) ?? enCours.etape.lieu}`, 14);
			bouton(c, tr("Abandonner ce contrat"), () => agir({ type: "abandonner_contrat" }), { hauteur: 30, taille: 13 });
		}
		texte(c, tr("Un contrat se joue en plusieurs étapes, dans différents lieux (une balise lumineuse t'y attend). On revient ici toucher la récompense. Un seul contrat à la fois."), 13, { couleur: COULEURS.texte2 });
		for (const [, ct] of pairs(CONTENU.contrats)) {
			if (ct.examen_rang !== undefined || !conditionHeros(CONTENU, etat, ct.disponible_si, h)) continue;
			// un contrat rempli quitte le tableau, puis revient quelques jours plus tard (sauf s'il est unique)
			const retour = retourContrat(CONTENU, etat, ct.id);
			if (retour === -1) continue;
			texte(c, trf("<b>{titre}</b>  <font color=\"#beaf96\">rang {rang_min}{v}</font>", { titre: ct.titre, rang_min: ct.rang_min, v: ct.etapes.size() > 0 ? trf(" · {v} étapes", { v: ct.etapes.size() }) : "" }), 15);
			texte(c, trf("{description} Récompense : {or} or, {xp} XP, {points_guilde} pts de guilde.", { description: ct.description, or: ct.recompenses.or, xp: ct.recompenses.xp, points_guilde: ct.recompenses.points_guilde }), 13, { couleur: COULEURS.texte2 });
			const ok = RANGS.indexOf(rang) >= RANGS.indexOf(ct.rang_min) && enCours === undefined && retour === 0;
			const libelle =
				retour > 0 ? trf("Rempli : revient dans {retour} jour{v}", { retour, v: retour > 1 ? "s" : "" }) : enCours ? tr("Termine d'abord ton contrat en cours") : ok ? tr("Accepter (en solo)") : trf("Rang {rang_min} requis", { rang_min: ct.rang_min });
			bouton(c, libelle, () => agir({ type: "contrat", contrat: ct.id }), { actif: ok, hauteur: 32, taille: 14 });
		}
	}
	if (estGuilde(id) && voir("contrats")) vueRecherche(parent, redessiner);
	if (estGuilde(id) && voir("grimoire")) {
		const g = carte(parent, tr("📖 Fusions que la Guilde peut t'enseigner"));
		texte(g, tr("Uniquement les fusions de ta classe et de tes compétences. Elles vont dans ton grimoire personnel : les autres joueurs ne le voient pas."), 13, { couleur: COULEURS.texte2 });
		const fusions = fusionsPossibles(CONTENU, h);
		for (const f of fusions) {
			const t = f.technique;
			texte(g, trf("<b>{nom}</b> — {description} {cout} mana, recharge {recharge}.", { nom: t.nom, description: t.description, cout: t.cout, recharge: t.recharge }), 14);
			bouton(g, f.probleme ?? tr("Apprendre"), () => agir({ type: "apprendre_technique", technique: t.id }), { actif: f.probleme === undefined, hauteur: 30, taille: 13 });
		}
		if (fusions.size() === 0) texte(g, tr("Aucune fusion à apprendre pour l'instant : il faut deux compétences d'éléments différents."), 13, { couleur: COULEURS.texte2 });
	}
	if (lieu.auberge === true && (voir("parler") || section === "auberge")) {
		vueSoins(parent, h, "repas", id);
		vueAuberge(parent);
	}
	if (id.sub(1, 6) === "temple" && (voir("parler") || section === "parler")) vueSoins(parent, h, "temple", id);
	if (lieu.boutique.size() > 0 && voir("boutique")) {
		const c = carte(parent, trf("Boutique ({or} or)", { or: h.or }));
		// d'abord ce que le héros peut porter, puis le reste ; les objets à usage unique en premier
		const tri = (o: string) => {
			const d = CONTENU.objets[o];
			if (d.type !== "equipement") return 0;
			return problemeEquipement(CONTENU, h, d) === undefined ? 1 : 2;
		};
		const liste = [...lieu.boutique];
		liste.sort((a, b) => tri(a) < tri(b));
		let separe = false;
		for (const o of liste) {
			if (!separe && tri(o) === 2) {
				separe = true;
				texte(c, tr("Pour d'autres classes ou plus tard :"), 13, { couleur: COULEURS.texte2 });
			}
			const prix = prixAchat(CONTENU, h, o);
			const d = CONTENU.objets[o];
			const unique = d.unique_par_partie === true && exemplaires(listeHeros(jeu.etat!), o) > 0;
			ficheObjet(c, o, {
				nombre: h.inventaire[o],
				comparer: true,
				taille: 64,
				actions: [{ libelle: unique ? tr("Déjà possédé dans la partie") : trf("Acheter · {prix} or", { prix }), surClic: () => agir({ type: "acheter", objet: o, lieu: id }), actif: h.or >= prix && !unique, principal: tri(o) === 1 }],
			});
		}
	}
	if (section === "tout" && groupe.size() === 0 && perso.size() === 0 && !estGuilde(id) && lieu.boutique.size() === 0) {
		texte(parent, tr("Rien de particulier à faire ici pour le moment."), 14, { couleur: COULEURS.texte2 });
	}
}

// ───────────────────────────── Soins (PV gardés entre les combats, test 3) ─────────────────────────────

/** Repas chaud à l'auberge, ou soins des prêtres au Temple (avec leurs répliques, test 4). */
function vueSoins(parent: Instance, h: Heros, moyen: "repas" | "temple", lieu: string) {
	const etat = jeu.etat!;
	const cfg = CONTENU.config.soins;
	const pv = pvHorsCombat(CONTENU, h);
	const max = pvMaxHorsCombat(CONTENU, h);
	const c = carte(parent, moyen === "repas" ? tr("🍲 Un repas chaud") : tr("✨ Les soins des prêtres"));
	texte(c, trf("{esc} : <b>{pv}/{max} PV</b>{v}", { esc: esc(h.nom), pv, max, v: h.blessure ? tr(" · <font color=\"#e0605a\">blessé</font>") : "" }), 15);
	if (moyen === "repas") {
		texte(c, trf("{prix} or : rend {pourcent} % des PV.", { prix: cfg.repas.prix, pourcent: cfg.repas.pourcent }), 13, { couleur: COULEURS.texte2 });
		bouton(c, trf("Manger ({prix} or)", { prix: cfg.repas.prix }), () => agir({ type: "se_soigner", moyen: "repas", lieu }), { actif: pv < max && h.or >= cfg.repas.prix, hauteur: 34 });
	} else {
		texte(c, trf("{prix} or : tous les PV, et la blessure est guérie.", { prix: cfg.temple.prix }), 13, { couleur: COULEURS.texte2 });
		bouton(
			c,
			trf("Se faire soigner ({prix} or)", { prix: cfg.temple.prix }),
			() => {
				const blesse = h.blessure;
				if (!agir({ type: "se_soigner", moyen: "temple", lieu })) return;
				const pretre = CONTENU.pnj[cfg.temple.pnj]?.nom ?? CONTENU.compagnons[cfg.temple.pnj]?.nom ?? tr("Le Temple");
				const repliques = blesse ? cfg.temple.repliques_blessure : cfg.temple.repliques;
				for (const r of repliques) messageLocal({ titre: pretre, texte: remplacerVariables(CONTENU, etat, r, [h.id]), genre: "info" });
			},
			{ actif: (pv < max || h.blessure) && h.or >= cfg.temple.prix, hauteur: 34 },
		);
	}
	if (pv >= max && !(moyen === "temple" && h.blessure)) texte(c, tr("Déjà en pleine forme."), 13, { couleur: COULEURS.vert });
}

// ───────────────────────────── Auberge ─────────────────────────────

/** La chambre de l'auberge : on propose de dormir ; le temps ne passe que si tous les joueurs présents acceptent. */
export function vueAuberge(parent: Instance) {
	const etat = jeu.etat!;
	const pseudo = (j: string) => esc(etat.joueurs[j]?.pseudo ?? "?");
	const c = carte(parent, tr("🛏 La chambre du Chaudron Fêlé"));
	texte(c, tr("Les mois ne passent que si vous le décidez, ici. En jouant, seuls les jours avancent (jusqu'au dernier jour du mois)."), 13, { couleur: COULEURS.texte2 });
	const r = etat.repos;
	if (r) {
		texte(c, trf("<b>{pseudo}</b> propose de dormir <b>{mois} mois</b>, jusqu'au {formaterDate}.", { pseudo: pseudo(r.par), mois: r.mois, formaterDate: formaterDate(CONTENU, r.jusqua) }), 15);
		const attente = attenteRepos(etat);
		if (attente.size() > 0) texte(c, trf("En attente de : <b>{v}</b>", { v: attente.map(pseudo).join(", ") }), 14, { couleur: COULEURS.or });
		if (!r.accords.includes(jeu.moi)) {
			const l = ligne(c);
			bouton(l, tr("Accepter"), () => agir({ type: "repondre_repos", accepte: true }), { principal: true, hauteur: 36 });
			bouton(l, tr("Refuser et proposer autre chose"), () => agir({ type: "repondre_repos", accepte: false }), { hauteur: 36 });
		} else texte(c, tr("Tu as accepté."), 14, { couleur: COULEURS.vert });
		return;
	}
	const l = ligne(c);
	for (const mois of CONTENU.config.ellipses.durees_auberge_mois) {
		bouton(l, trf("Dormir {mois} mois", { mois }), () => agir({ type: "proposer_repos", mois }), { hauteur: 36 });
	}
	const histoire = prochaineDateHistoire(CONTENU, etat);
	if (histoire) {
		const mois = math.max(1, math.round((histoire.jour - etat.jour) / CONTENU.config.calendrier.jours_par_mois));
		bouton(c, trf("Dormir jusqu'à la suite de l'histoire ({mois} mois) — {raison}", { mois, raison: histoire.raison }), () => agir({ type: "proposer_repos", histoire: true }), { principal: true, largeur: new UDim(1, 0), hauteur: 40 });
	}
}

// ───────────────────────────── Carte ─────────────────────────────

function vueCarte(parent: Frame, allerA: (lieu: string) => void) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const tous = listeHeros(etat).map((x) => x.id);
	texte(parent, tr("⭐ quête principale · ● autre chose à faire · ⚔ combat possible"), 13, { couleur: COULEURS.texte2 });
	const etapes = lieuxDesEtapes(CONTENU, etat, h.id);
	// une section par région ouverte, dans l'ordre des chapitres
	const regions: RegionDef[] = [];
	for (const [, r] of pairs(CONTENU.regions)) if (conditionScene(CONTENU, etat, r.disponible_si, tous)) regions.push(r);
	regions.sort((a, b) => (a.chapitre ?? 1) < (b.chapitre ?? 1));
	for (const region of regions) {
	texte(parent, region.nom, 20, { gras: true, couleur: COULEURS.or });
	for (const l of region.lieux) {
		if (l.etape_seulement === true ? !etapes.includes(l.id) : !conditionScene(CONTENU, etat, l.disponible_si, tous)) continue;
		const scenes = scenesDisponibles(CONTENU, etat, l.id, h.id);
		const principale = scenes.some((s) => s.quete !== undefined && CONTENU.quetes[s.quete]?.type === "principale");
		const marque = principale ? "⭐ " : scenes.size() > 0 ? "● " : "";
		const combat = lieuAvecCombat(CONTENU, etat, l.id, h.id) ? " ⚔" : "";
		const li = ligne(parent);
		const ici = etapes.includes(l.id) ? tr("<font color=\"#ffd166\">📍 étape en cours · </font>") : "";
		texte(li, `${ici}${marque}<b>${l.nom}</b>${combat}`, 15, { largeur: new UDim(1, -100) });
		bouton(li, teleportationPossible(l.id) ? tr("Y aller") : tr("Guider"), () => allerA(l.id), { hauteur: 32, taille: 14 });
	}
	}
	texte(
		parent,
		voyageDebloque(etat)
			? tr("« Y aller » te téléporte près des pierres de voyage déjà activées ; « Guider » montre le chemin avec une flèche dorée. Une pierre s'active en passant à côté.")
			: trf("Le voyage rapide s'éveillera {texte}. En attendant, « Guider » montre le chemin avec une flèche dorée.", { texte: tr(DEBLOCAGE_VOYAGE.texte) }),
		13,
		{ couleur: COULEURS.texte2 },
	);
	vueVoyage(parent);
}

/** Pierres de voyage : celles qu'on a activées, et le voyage vers elles (s'il est éveillé). */
function vueVoyage(parent: Instance) {
	const etat = jeu.etat!;
	const connues = pierresConnues();
	const c = carte(parent, trf("🌀 Pierres de voyage ({v}/{v2})", { v: connues.size(), v2: pierresDeVoyage().size() }));
	const ok = voyageDebloque(etat);
	if (!ok) texte(c, trf("Les pierres dorment encore : le voyage rapide s'éveillera {texte}. Tu peux déjà les activer en passant à côté.", { texte: tr(DEBLOCAGE_VOYAGE.texte) }), 13, { couleur: COULEURS.or });
	for (const p of pierresDeVoyage()) {
		if (!connues.has(p.id)) continue;
		const l = ligne(c, 8);
		texte(l, trf("<b>{esc}</b>  <font color=\"#beaf96\">{v}</font>", { esc: esc(tr(p.nom)), v: CONTENU.regions[p.region]?.nom ?? p.region }), 15, { largeur: new UDim(1, -120) });
		bouton(l, tr("Voyager"), () => voyagerVers(p), { principal: true, actif: ok, hauteur: 30, taille: 14 });
	}
	if (connues.size() === 0) texte(c, tr("Aucune pierre activée : la première est sur la grande place de Lysmont."), 13, { couleur: COULEURS.texte2 });
}

// ───────────────────────────── Personnage ─────────────────────────────

function vueFiche(parent: Frame) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const cl = CONTENU.classes[h.classe];
	const ra = CONTENU.races[h.race];
	const cfg = CONTENU.config.personnage;
	const k = caracsTotales(CONTENU, h);
	const annee = versDate(CONTENU, etat.jour).annee;

	const id = carte(parent, esc(h.nom));
	texte(id, trf("{nom} · {nom2} · {v} · {age} ans{v2}", { nom: ra.nom, nom2: cl.nom, v: h.origine === "invoque" ? tr("Invoqué") : tr("Réincarné"), age: age(h, annee), v2: h.blessure ? tr(" · <font color=\"#c4483c\">blessé</font>") : "" }), 15);
	texte(id, trf("Niveau {niveau} — XP {xp} / {xpPourNiveau} · PV max {pvMax} · Mana {manaMax} · {or} or", { niveau: h.niveau, xp: h.xp, xpPourNiveau: xpPourNiveau(CONTENU, h.niveau + 1), pvMax: pvMax(CONTENU, k.VIT, h.niveau), manaMax: manaMax(k.ESP, h.niveau), or: h.or }), 14, { couleur: COULEURS.texte2 });
	const la = ligne(id);
	texte(la, tr("Si je suis absent :"), 14, { largeur: new UDim(0, 150) });
	bouton(la, tr("joué par l'ordinateur"), () => agir({ type: "si_absent", mode: "ia" }), { choisi: h.siAbsent === "ia", hauteur: 30, taille: 13 });
	bouton(la, tr("reste au camp"), () => agir({ type: "si_absent", mode: "camp" }), { choisi: h.siAbsent === "camp", hauteur: 30, taille: 13 });

	const cc = carte(parent, trf("Caractéristiques{v}", { v: h.pointsCaracDispo > 0 ? trf(" — {pointsCaracDispo} point(s) à répartir", { pointsCaracDispo: h.pointsCaracDispo }) : "" }));
	for (const x of CARACS) {
		const l = ligne(cc);
		texte(l, trf("{v} : <b>{v2}</b>", { v: tr(NOMS_CARACS[x]), v2: k[x] }), 15, { largeur: new UDim(0, 170) });
		if (h.pointsCaracDispo > 0) bouton(l, "+1", () => agir({ type: "repartir", carac: x }), { hauteur: 28, taille: 13 });
	}

	const dn = carte(parent, tr("Don, trait et passif"));
	texte(dn, trf("<b>Don : {nom}</b> — {combat} <i>Hors combat :</i> {hors_combat}", { nom: CONTENU.dons[h.don].nom, combat: CONTENU.dons[h.don].combat, hors_combat: CONTENU.dons[h.don].hors_combat }), 14);
	texte(dn, trf("<b>{nom}</b> — {avantage} <i>Défaut :</i> {defaut}", { nom: ra.trait.nom, avantage: ra.trait.avantage, defaut: ra.trait.defaut }), 14);
	texte(dn, trf("<b>Passif : {nom}</b> — {description}", { nom: cl.passif.nom, description: cl.passif.description }), 14);

	const equipees = competencesEquipees(CONTENU, h);
	const connues = competencesConnues(CONTENU, h);
	const co = carte(parent, trf("Compétences{v}", { v: h.pointsCompetenceDispo > 0 ? trf(" — {pointsCompetenceDispo} point(s)", { pointsCompetenceDispo: h.pointsCompetenceDispo }) : "" }));
	texte(co, trf("Rang maximum {rang_competence_max} · {v}/{competences_equipees_max} équipées pour le combat.", { rang_competence_max: cfg.rang_competence_max, v: equipees.size(), competences_equipees_max: cfg.competences_equipees_max }), 13, { couleur: COULEURS.texte2 });
	for (const cid of connues) {
		const comp = CONTENU.competences[cid];
		const rang = h.rangsCompetences[cid] ?? 1;
		const equipee = equipees.includes(cid);
		const l = ligne(co);
		bouton(
			l,
			equipee ? "✔" : "  ",
			() => agir({ type: "equiper_competences", competences: equipee ? equipees.filter((x) => x !== cid) : [...equipees, cid] }),
			{ choisi: equipee, actif: equipee || equipees.size() < cfg.competences_equipees_max, hauteur: 28, taille: 13 },
		);
		texte(l, trf("<b>{nom}</b> (rang {rang}/{rang_competence_max}) <font color=\"#beaf96\">{description}</font>", { nom: comp.nom, rang, rang_competence_max: cfg.rang_competence_max, description: comp.description }), 14, { largeur: new UDim(1, -170) });
		if (h.pointsCompetenceDispo > 0 && rang < cfg.rang_competence_max) bouton(l, tr("Améliorer"), () => agir({ type: "ameliorer", competence: cid }), { hauteur: 28, taille: 13 });
		const variantes = h.variantes[cid] ?? [];
		if (variantes.size() > 0) {
			const lv = ligne(co);
			texte(lv, tr("Variante active :"), 13, { largeur: new UDim(0, 120), couleur: COULEURS.texte2 });
			bouton(lv, tr("de base"), () => agir({ type: "variante_active", competence: cid, technique: undefined }), { choisi: h.varianteActive[cid] === undefined, hauteur: 28, taille: 13 });
			for (const v of variantes) {
				const t = h.grimoire[v];
				bouton(lv, t?.nom ?? v, () => agir({ type: "variante_active", competence: cid, technique: v }), { choisi: h.varianteActive[cid] === v, hauteur: 28, taille: 13 });
				bouton(lv, tr("Oublier"), () => agir({ type: "oublier_variante", technique: v }), { hauteur: 28, taille: 12 });
			}
		}
	}
	if (h.branche === undefined && h.niveau >= cfg.niveau_branche) {
		texte(co, tr("<b>Choisis une branche :</b>"), 15, { couleur: COULEURS.or });
		for (const b of cl.branches) {
			texte(co, trf("<b>{nom}</b> — {description}", { nom: b.nom, description: b.description }), 14);
			bouton(co, trf("Choisir {nom}", { nom: b.nom }), () => agir({ type: "branche", branche: b.id }), { principal: true, hauteur: 30, taille: 13 });
		}
	} else if (h.branche === undefined) {
		texte(co, trf("Au niveau {niveau_branche}, tu choisiras une branche : {v}.", { niveau_branche: cfg.niveau_branche, v: cl.branches.map((b) => b.nom).join(" ou ") }), 13, { couleur: COULEURS.texte2 });
	}
	texte(co, trf("Ultime : {nom} — {description}", { nom: cl.ultime.nom, description: cl.ultime.description }), 13, { couleur: COULEURS.texte2 });

	const inv = carte(parent, tr("Équipement porté"));
	const NOMS_EMP = { arme: "Arme", armure: "Tenue", accessoire: "Accessoire" };
	for (const emp of ["arme", "armure", "accessoire"] as const) {
		const o = h.equipement[emp];
		if (o === undefined) {
			texte(inv, trf("{v} : <font color=\"#beaf96\">rien ({v2})</font>", { v: NOMS_EMP[emp], v2: emp === "arme" ? tr("arme de base de la classe") : tr("aucun bonus") }), 14);
			continue;
		}
		texte(inv, NOMS_EMP[emp], 13, { couleur: COULEURS.texte2 });
		ficheObjet(inv, o, { actions: [{ libelle: "Retirer", surClic: () => agir({ type: "desequiper", emplacement: emp }) }] });
	}
	const pvHeros = pvHorsCombat(CONTENU, h);
	const pvMaxHeros = pvMaxHorsCombat(CONTENU, h);
	const sac = carte(parent, trf("Sac ({or} or) · {pvHeros}/{pvMaxHeros} PV", { or: h.or, pvHeros, pvMaxHeros }));
	const objets: string[] = [];
	for (const [o, n] of pairs(h.inventaire)) if (n > 0 && CONTENU.objets[o] !== undefined) objets.push(o);
	// équipements d'abord (rareté décroissante), puis le reste
	const RANG: Record<string, number> = { mythique: 0, legendaire: 1, epique: 2, rare: 3, "peu-commun": 4, commun: 5 };
	const rang = (o: string) => {
		const d = CONTENU.objets[o];
		return d.type === "equipement" ? RANG[d.rarete ?? "commun"] ?? 5 : 10;
	};
	objets.sort((a, b) => rang(a) < rang(b) || (rang(a) === rang(b) && a < b));
	for (const o of objets) {
		const def = CONTENU.objets[o];
		const actions: ActionObjet[] = [];
		if (def.type === "equipement") {
			const refus = problemeEquipement(CONTENU, h, def);
			actions.push({ libelle: refus ?? tr("Équiper"), surClic: () => agir({ type: "equiper", objet: o }), actif: refus === undefined, principal: refus === undefined });
		}
		// soins hors combat (test 3) : potions, rations, Larme de Sainte Ysolde
		const soigne = def.effets?.some((e) => e.type === "soin" || e.type === "relever") === true;
		if (o === RATION.objet) actions.push({ libelle: trf("Manger (+{ration_pourcent} % PV)", { ration_pourcent: CONTENU.config.soins.ration_pourcent }), surClic: () => agir({ type: "se_soigner", moyen: "ration" }), actif: pvHeros < pvMaxHeros });
		else if (soigne) actions.push({ libelle: tr("Utiliser (hors combat)"), surClic: () => agir({ type: "se_soigner", moyen: "objet", objet: o }), actif: pvHeros < pvMaxHeros || h.blessure });
		if (def.prix > 0 && def.type !== "quete") actions.push({ libelle: trf("Vendre {prixVente} or", { prixVente: prixVente(CONTENU, h, o) }), surClic: () => agir({ type: "vendre", objet: o }) });
		ficheObjet(sac, o, { nombre: h.inventaire[o], comparer: true, actions });
	}
	if (objets.size() === 0) texte(sac, tr("Ton sac est vide."), 14, { couleur: COULEURS.texte2 });
}

// ───────────────────────────── Quêtes et journal ─────────────────────────────

function vueQuetes(parent: Frame) {
	const etat = jeu.etat!;
	let rien = true;
	for (const terminees of [false, true]) {
		for (const [id, q] of pairs(etat.quetes)) {
			if (q.terminee !== terminees) continue;
			const def = CONTENU.quetes[id];
			if (!def) continue;
			rien = false;
			const c = carte(parent);
			texte(c, trf("<b>{titre}</b>  <font color=\"#beaf96\">{v}{v2}</font>", { titre: def.titre, v: tr(TYPES_QUETE[def.type] ?? def.type), v2: q.terminee ? tr(" · terminée") : "" }), 16, { couleur: q.terminee ? COULEURS.texte2 : COULEURS.or });
			texte(c, def.resume, 14, { couleur: COULEURS.texte2 });
			if (!q.terminee) {
				const e = def.etapes.find((x) => x.id === q.etape);
				const ou = nomLieu(e?.lieu ?? (e?.scene !== undefined ? CONTENU.scenes[e.scene]?.lieu : undefined));
				texte(c, `➤ ${e?.objectif ?? ""}${ou !== undefined ? `  📍 ${ou}` : ""}`, 15);
				// liste des étapes : faites ✔, en cours ➤, à venir ·
				const k = def.etapes.findIndex((x) => x.id === q.etape);
				if (def.etapes.size() > 1) {
					const lignes = def.etapes.map((x, i) => `${i < k ? "✔" : i === k ? "➤" : "·"} ${x.objectif}`);
					texte(c, lignes.join("\n"), 13, { couleur: COULEURS.texte2 });
				}
			}
		}
	}
	const contrat = etapeContrat(CONTENU, etat, monHeros()!.id);
	if (contrat) {
		rien = false;
		const c = carte(parent);
		texte(c, trf("<b>📜 Contrat : {titre}</b>  <font color=\"#beaf96\">étape {numero}/{total}</font>", { titre: contrat.contrat.titre, numero: contrat.numero, total: contrat.total }), 16, { couleur: COULEURS.or });
		texte(c, contrat.contrat.description, 14, { couleur: COULEURS.texte2 });
		texte(c, `➤ ${contrat.etape.objectif}  📍 ${nomLieu(contrat.etape.lieu) ?? contrat.etape.lieu}`, 15);
	}
	if (rien) texte(parent, tr("Aucune quête pour l'instant."), 14, { couleur: COULEURS.texte2 });
	// scènes « partout » (sans lieu) : histoire et prologue
	const h = monHeros()!;
	const partout = scenesDisponibles(CONTENU, etat, undefined, h.id);
	if (partout.size() > 0) {
		const c = carte(parent, tr("À vivre maintenant"));
		for (const s of partout) {
			const l = ligne(c);
			texte(l, s.titre, 15, { largeur: new UDim(1, -110) });
			bouton(l, tr("Lancer"), () => agir({ type: "lancer_scene", scene: s.id }), { principal: true, hauteur: 32 });
		}
	}
}

function vueJournal(parent: Frame) {
	const etat = jeu.etat!;
	const c = carte(parent, tr("Journal de la partie"));
	const n = etat.journal.size();
	for (let i = n - 1; i >= math.max(0, n - 40); i--) {
		const e = etat.journal[i];
		texte(c, trf("<font color=\"#beaf96\">{formaterDate}</font> — {esc}", { formaterDate: trMoteur(formaterDate(CONTENU, e.jour)), esc: esc(trMoteur(e.texte)) }), 14);
	}
}

// ───────────────────────────── Compagnons ─────────────────────────────

function vueCompagnons(parent: Frame) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const paliers = CONTENU.config.affinite.paliers;
	if (etat.compagnonsRencontres.size() === 0) texte(parent, tr("Tu n'as encore rencontré personne."), 14, { couleur: COULEURS.texte2 });
	for (const id of etat.compagnonsRencontres) {
		const co = CONTENU.compagnons[id];
		const a = affinite(etat, h.id, id);
		const p = palierCompagnon(CONTENU, etat, h.id, id);
		const c = carte(parent, co.nom);
		texte(c, trf("{titre} · {age} ans", { titre: co.titre, age: co.age }), 14, { couleur: COULEURS.texte2 });
		texte(c, co.personnalite, 14);
		texte(c, trf("<b>Palier : {nom}</b> ({points}/100){v}", { nom: p.nom, points: a.points, v: a.blocage !== undefined ? tr(" — elle t'en veut, il faudra te faire pardonner") : "" }), 15);
		barre(c, a.points, 100, COULEURS.violet);
		texte(c, paliers.map((pl, i) => (i <= p.index ? `<b>${pl.nom}</b>` : trf("<font color=\"#7a6a55\">{nom}</font>", { nom: pl.nom }))).join(" › "), 13);
		for (const [pal, b] of pairs(co.bonus_paliers)) {
			const i = paliers.findIndex((x) => x.id === pal);
			texte(c, trf("{v} — <b>{nom}</b> : {description}", { v: paliers[i]?.nom ?? pal, nom: b.nom, description: b.description }), 13, { couleur: i <= p.index ? COULEURS.texte : COULEURS.texte2 });
		}
		if (etat.equipe[h.id] === id) {
			const l = ligne(c);
			texte(l, tr("<b>T'accompagne en combat</b>"), 14, { largeur: new UDim(0, 220), couleur: COULEURS.or });
			bouton(l, tr("Laisser au camp"), () => agir({ type: "equipe", compagnon: undefined }), { hauteur: 30, taille: 13 });
		} else {
			bouton(c, p.index < 1 ? tr("Palier « Alliée » requis pour l'emmener") : tr("L'emmener en combat"), () => agir({ type: "equipe", compagnon: id }), { actif: p.index >= 1, hauteur: 30, taille: 13 });
		}
		const cadeaux: [string, number][] = [];
		for (const [o, n] of pairs(h.inventaire)) if (n > 0 && CONTENU.objets[o]?.type === "cadeau") cadeaux.push([o, n]);
		if (cadeaux.size() > 0) {
			const l = ligne(c);
			texte(l, tr("Offrir :"), 14, { largeur: new UDim(0, 60) });
			for (const [o, n] of cadeaux) bouton(l, `${CONTENU.objets[o].nom} ×${n}`, () => agir({ type: "cadeau", compagnon: id, objet: o }), { hauteur: 30, taille: 13 });
		} else texte(c, tr("Aucun cadeau dans ton sac. On en trouve dans les boutiques de Lysmont."), 13, { couleur: COULEURS.texte2 });
	}
}

// ───────────────────────────── Partie ─────────────────────────────

/** Joueur qu'on est en train de signaler (on choisit ensuite la raison). */
const signalement = { cible: undefined as number | undefined };

function nomDe(userId: number): string {
	return Players.GetPlayerByUserId(userId)?.DisplayName ?? tr("un joueur parti");
}

/** Annonce qu'on s'apprête à publier (objectif choisi). */
const recherche = { objectif: 0 };

/** Tableau « Recherche de groupe » : les annonces du serveur, rejoindre en un clic, publier la sienne. */
export function vueRecherche(parent: Instance, redessiner: () => void) {
	const g = jeu.groupe;
	const moi = Players.LocalPlayer.UserId;
	const c = carte(parent, tr("📋 Recherche de groupe"));
	const annonces = g?.annonces ?? [];
	const mienne = annonces.find((a) => a.chef === moi);
	const autres = annonces.filter((a) => a.chef !== moi);
	if (autres.size() === 0) texte(c, tr("Aucune annonce pour l'instant."), 14, { couleur: COULEURS.texte2 });
	const libre = g?.membres === undefined;
	for (const a of autres) {
		const l = ligne(c, 8);
		texte(l, trf("<b>{esc}</b> (niv. {niveau}) cherche du monde : <b>{esc2}</b> · {places} place{v}", { esc: esc(a.nom), niveau: a.niveau, esc2: esc(tr(a.objectif)), places: a.places, v: a.places > 1 ? "s" : "" }), 14, { largeur: new UDim(1, -120) });
		bouton(l, tr("Rejoindre"), () => commandeGroupe({ type: "rejoindre_annonce", chef: a.chef }), { principal: true, actif: libre && g?.pret === true, hauteur: 30, taille: 14 });
	}
	const chef = g?.membres?.[0];
	if (g?.pret !== true || (chef !== undefined && chef !== moi)) return;
	if (mienne) {
		const l = ligne(c, 8);
		texte(l, trf("Ton annonce : <b>{esc}</b>", { esc: esc(mienne.objectif) }), 14, { couleur: COULEURS.or, largeur: new UDim(1, -120) });
		bouton(l, tr("Retirer"), () => commandeGroupe({ type: "retirer_annonce" }), { hauteur: 30, taille: 14 });
	} else {
		texte(c, tr("Publier une annonce : que veux-tu faire ?"), 13, { couleur: COULEURS.texte2 });
		const lo = ligne(c, 6);
		OBJECTIFS_GROUPE.forEach((o, i) => bouton(lo, tr(o), () => ((recherche.objectif = i), redessiner()), { hauteur: 28, taille: 12, choisi: recherche.objectif === i }));
		bouton(c, tr("Publier"), () => commandeGroupe({ type: "publier_annonce", objectif: recherche.objectif }), { principal: true, hauteur: 32, taille: 14 });
	}
}

/** Groupe : ma campagne ou celle du chef, membres, invitations, joueurs du serveur. */
function vuePartie(parent: Frame, _redessiner: () => void) {
	const etat = jeu.etat!;
	const g = jeu.groupe;
	const moi = Players.LocalPlayer.UserId;
	const chef = g?.membres?.[0];
	const enRenfort = chef !== undefined && chef !== moi;
	const c = carte(parent, esc(trMoteur(jeu.nom)));
	texte(
		c,
		enRenfort
			? trf("Tu joues la campagne de <b>{esc}</b>, en renfort. Ton XP, ton or, tes objets et tes compétences rentreront avec toi dans ta campagne quand tu quitteras le groupe. L'histoire de ta campagne, elle, n'avance pas.", { esc: esc(nomDe(chef!)) })
			: tr("Ta campagne : ton héros et ton histoire, sauvegardés sur ton compte Roblox. Invite d'autres joueurs du serveur pour la jouer en groupe."),
		14,
		{ couleur: COULEURS.texte2 },
	);
	texte(c, trf("Session {session}{v}", { session: etat.session, v: etat.meneur !== undefined ? trf(" · meneur du jour : {esc}", { esc: esc(etat.joueurs[etat.meneur]?.pseudo ?? "?") }) : "" }), 14);

	// mon groupe
	const gr = carte(parent, tr("👥 Mon groupe"));
	if (!g?.membres) texte(gr, tr("Tu joues seul. Invite quelqu'un ci-dessous, ou approche-toi d'un joueur (touche E)."), 14, { couleur: COULEURS.texte2 });
	else {
		for (const [i, u] of ipairs(g.membres)) {
			const id = `u${u}`;
			const hj: Heros | undefined = etat.joueurs[id]?.herosId !== undefined ? etat.heros[etat.joueurs[id].herosId!] : undefined;
			texte(gr, `${i === 1 ? "★" : "•"} <b>${esc(nomDe(u))}</b>${hj ? trf(" — {nom}, niv. {niveau}", { nom: CONTENU.classes[hj.classe].nom, niveau: hj.niveau }) : ""}${i === 1 ? " (chef)" : ""}`, 15);
		}
		bouton(gr, chef === moi ? tr("Dissoudre le groupe") : tr("Quitter le groupe"), () => commandeGroupe({ type: "quitter_groupe" }), { hauteur: 32, taille: 14 });
	}

	vueRecherche(parent, _redessiner);
	// les joueurs du serveur
	const autres = Players.GetPlayers().filter((p) => p !== Players.LocalPlayer);
	const sv = carte(parent, trf("Joueurs sur ce serveur ({v})", { v: autres.size() + 1 }));
	if (autres.size() === 0) texte(sv, tr("Personne d'autre pour l'instant."), 14, { couleur: COULEURS.texte2 });
	const peutInviter = g?.pret === true && (chef === undefined || chef === moi) && (g?.membres?.size() ?? 1) < 6;
	for (const p of autres) {
		const l = ligne(sv, 8);
		const dansMonGroupe = g?.membres?.includes(p.UserId) === true;
		const occupe = g?.occupes.includes(p.UserId) === true;
		texte(l, `<b>${esc(p.DisplayName)}</b>${dansMonGroupe ? tr(" — dans ton groupe") : occupe ? tr(" — déjà en groupe") : ""}`, 15, { largeur: new UDim(1, -210) });
		if (peutInviter && !dansMonGroupe && !occupe) bouton(l, tr("Inviter"), () => commandeGroupe({ type: "inviter", cible: p.UserId }), { hauteur: 30, taille: 14 });
		bouton(l, "🚩", () => ((signalement.cible = signalement.cible === p.UserId ? undefined : p.UserId), _redessiner()), { hauteur: 30, taille: 14, choisi: signalement.cible === p.UserId });
		if (signalement.cible === p.UserId) {
			const ls = ligne(sv, 6);
			texte(ls, tr("Signaler pour :"), 13, { largeur: new UDim(0, 100), couleur: COULEURS.texte2 });
			RAISONS.forEach((rs, i) =>
				bouton(ls, tr(rs), () => {
					commandeModeration({ type: "signaler", cible: p.UserId, raison: i });
					signalement.cible = undefined;
					_redessiner();
				}, { hauteur: 26, taille: 12 }),
			);
		}
	}

	// les héros de cette campagne
	const j = carte(parent, tr("Héros de cette campagne"));
	for (const id of etat.ordreJoueurs) {
		const jj = etat.joueurs[id];
		const hj: Heros | undefined = jj.herosId !== undefined ? etat.heros[jj.herosId] : undefined;
		texte(j, trf("{v} <b>{esc}</b> — {v2}", { v: jj.present ? "🟢" : "⚪", esc: esc(jj.pseudo), v2: hj ? trf("{esc} ({nom}, niv. {niveau}) · {textePv}{v}{v2}", { esc: esc(hj.nom), nom: CONTENU.classes[hj.classe].nom, niveau: hj.niveau, textePv: textePv(hj), v: hj.blessure ? tr(" <font color=\"#e0605a\">blessé</font>") : "", v2: hj.invite === true ? tr(" · renfort") : "" }) : tr("crée son héros…") }), 15);
	}
	const a = carte(parent, tr("Actions"));
	bouton(a, tr("Nouvelle session (le meneur change)"), () => agir({ type: "nouvelle_session" }), { hauteur: 34 });
	texte(a, tr("Pour arrêter, quitte simplement le serveur : tout est sauvegardé sur ton compte."), 13, { couleur: COULEURS.texte2 });
}
