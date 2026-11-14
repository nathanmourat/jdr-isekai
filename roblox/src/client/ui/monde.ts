/**
 * Le monde (hors scène, combat, donjon) : barre du haut, menu, et panneaux (personnage, quêtes, journal,
 * compagnons, carte, partie) ; le panneau d'un lieu s'ouvre quand on entre dans un bâtiment.
 * Même contenu que la version web (src/ui/panneaux et src/ui/vues/Lieu.svelte).
 */
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
import { agir, commander, jeu, monHeros } from "../partie";
import { affichage, type Panneau } from "../local";
import { barre, bouton, carte, colonne, COULEURS, esc, ligne, texte } from "./kit";
import { oublierListeParties } from "./ecrans";

const CARACS: Carac[] = ["FOR", "AGI", "INT", "VIT", "ESP", "CHA"];
const NOMS_CARACS: Record<Carac, string> = { FOR: "Force", AGI: "Agilité", INT: "Intelligence", VIT: "Vitalité", ESP: "Esprit", CHA: "Charisme" };
const RANGS = ["F", "E", "D", "C", "B", "A", "S"];
const TYPES_QUETE: Record<string, string> = {
	principale: "Quête principale",
	secondaire: "Quête secondaire",
	classe: "Quête de classe",
	compagnon: "Quête de compagnon",
	contrat: "Contrat",
};
const ONGLETS: [Panneau, string][] = [
	["carte", "🗺 Carte"],
	["fiche", "Personnage"],
	["compagnons", "Compagnons"],
	["quetes", "Quêtes"],
	["journal", "Journal"],
	["partie", "Partie"],
];

function lieux() {
	return tousLesLieux();
}
function nomLieu(id: string | undefined): string | undefined {
	return id !== undefined ? lieux().find((l) => l.id === id)?.nom ?? id : undefined;
}

/** Barre du haut : date, héros, prochaine étape et menu. */
export function barreHaut(parent: Frame, redessiner: () => void, allerA: (lieu: string) => void) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const c = colonne(parent, 6);
	const l1 = ligne(c, 10);
	texte(l1, `<b>${formaterDate(CONTENU, etat.jour)}</b> · Chapitre ${etat.chapitre}`, 16, { largeur: new UDim(0, 300) });
	texte(
		l1,
		`<font color="#d9a441">${esc(h.nom)} · niv. ${h.niveau} · rang ${rangHeros(etat, h.id)} · ${h.or} or</font>${etat.meneur !== undefined ? ` · Meneur : ${esc(etat.joueurs[etat.meneur]?.pseudo ?? "?")}` : ""}`,
		15,
		{ largeur: new UDim(1, -320) },
	);
	if (affichage.dans !== undefined) {
		const ld = ligne(c, 8);
		texte(ld, `📍 Tu es dans : <b>${nomLieu(affichage.dans)}</b>`, 15, { largeur: new UDim(0, 320) });
		bouton(ld, "Que faire ici ?", () => {
			affichage.lieu = affichage.dans;
			affichage.section = "tout";
			affichage.panneau = undefined;
			redessiner();
		}, { hauteur: 30, taille: 14 });
	}
	// proposition de dormir à l'auberge : chacun doit répondre, où qu'il soit
	const repos = etat.repos;
	if (repos && !repos.accords.includes(jeu.moi)) {
		const lr = ligne(c, 8);
		texte(lr, `🛏 <b>${esc(etat.joueurs[repos.par]?.pseudo ?? "?")}</b> propose de dormir <b>${repos.mois} mois</b> à l'auberge.`, 15, { largeur: new UDim(1, -230), couleur: COULEURS.or });
		bouton(lr, "Accepter", () => agir({ type: "repondre_repos", accepte: true }), { principal: true, hauteur: 30, taille: 14 });
		bouton(lr, "Refuser", () => agir({ type: "repondre_repos", accepte: false }), { hauteur: 30, taille: 14 });
	}
	// contrat en cours
	const contrat = etapeContrat(CONTENU, etat, h.id);
	if (contrat) {
		const lc = ligne(c, 8);
		texte(lc, `📜 <b>${contrat.contrat.titre}</b> (${contrat.numero}/${contrat.total}) : ${contrat.etape.objectif}`, 14, { largeur: new UDim(1, -130) });
		bouton(lc, "Y aller", () => allerA(contrat.etape.lieu), { hauteur: 30, taille: 14 });
	}
	const etape = prochaineEtape(CONTENU, etat, h.id);
	if (etape) {
		const l2 = ligne(c, 8);
		texte(l2, `➤ <b>Prochaine étape :</b> ${etape.objectif}`, 15, { largeur: new UDim(1, -130) });
		if (etape.lieu !== undefined && etape.disponible) bouton(l2, "Y aller", () => allerA(etape.lieu!), { principal: true, hauteur: 32 });
	}
	const l3 = ligne(c, 6);
	for (const [id, nom] of ONGLETS) {
		const pastille = (id === "fiche" && (h.pointsCaracDispo > 0 || h.pointsCompetenceDispo > 0)) ? " ●" : "";
		bouton(
			l3,
			`${nom}${pastille}`,
			() => {
				affichage.panneau = affichage.panneau === id ? undefined : id;
				affichage.lieu = undefined;
				redessiner();
			},
			{ choisi: affichage.panneau === id, hauteur: 32, taille: 14 },
		);
	}
	if (etat.dernieresNouvelles.size() > 0) texte(c, etat.dernieresNouvelles.join("  ·  "), 14, { couleur: COULEURS.or });
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
	bouton(entete, "✕ Fermer", fermer, { hauteur: 30, taille: 14 });
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
	bouton(entete, "✕ Fermer", fermer, { hauteur: 30, taille: 14 });
	if (section !== "tout") bouton(entete, "Tout ce qu'on peut faire ici", () => ((affichage.section = "tout"), redessiner()), { hauteur: 30, taille: 14 });
	texte(parent, lieu.nom, 24, { gras: true, couleur: COULEURS.or });
	if (section === "tout") texte(parent, lieu.description, 15);
	const pnj = lieu.pnj.filter((p) => conditionScene(CONTENU, etat, p.si, tous));
	if (pnj.size() > 0) texte(parent, `Ici : ${pnj.map((p) => CONTENU.compagnons[p.id]?.nom ?? CONTENU.pnj[p.id]?.nom ?? p.id).join(", ")}`, 14, { couleur: COULEURS.texte2 });

	// en parlant à un PNJ : ses scènes (et celles qui ne nomment personne, pour le premier PNJ du lieu)
	const avecQui = section === "parler" ? affichage.pnj : undefined;
	const premier = lieu.pnj[0]?.id === avecQui;
	const scenes = voir("parler")
		? scenesDisponibles(CONTENU, etat, id, h.id).filter((sc) => avecQui === undefined || sc.pnj === avecQui || (sc.pnj === undefined && premier))
		: [];
	if (avecQui !== undefined) texte(parent, `Tu parles à <b>${CONTENU.compagnons[avecQui]?.nom ?? CONTENU.pnj[avecQui]?.nom ?? avecQui}</b>.`, 15, { couleur: COULEURS.or });
	const groupe = scenes.filter((s) => s.type === "groupe");
	const perso = scenes.filter((s) => s.type === "individuel");
	if (section === "parler" && scenes.size() === 0) texte(parent, "« Rien de neuf pour l'instant. Repasse plus tard ! »", 15, { couleur: COULEURS.texte2 });
	if (groupe.size() > 0) {
		const c = carte(parent, "Avec le groupe");
		for (const s of groupe) {
			const l = ligne(c);
			const q = s.quete !== undefined ? CONTENU.quetes[s.quete] : undefined;
			texte(l, `${s.titre}${q ? ` <font color="#d9a441">(${q.type === "principale" ? "quête principale" : "quête"})</font>` : ""}`, 15, { largeur: new UDim(1, -110) });
			bouton(l, "Lancer", () => agir({ type: "lancer_scene", scene: s.id }), { principal: true, hauteur: 34 });
		}
		texte(c, "Une scène de groupe implique tous les héros : les choix sont votés.", 13, { couleur: COULEURS.texte2 });
	}
	if (perso.size() > 0) {
		const c = carte(parent, `Pour ${esc(h.nom)} seul`);
		for (const s of perso) {
			const l = ligne(c);
			texte(l, s.titre, 15, { largeur: new UDim(1, -110) });
			bouton(l, "Y aller", () => agir({ type: "lancer_scene", scene: s.id }), { hauteur: 34 });
		}
	}
	// étape de contrat qui se joue ici
	const enCours = etapeContrat(CONTENU, etat, h.id);
	if (enCours && enCours.etape.lieu === id && (voir("parler") || section === "etape")) {
		const c = carte(parent, `📜 Contrat : ${enCours.contrat.titre} — étape ${enCours.numero}/${enCours.total}`);
		for (const n of enCours.notes) texte(c, n, 13, { couleur: COULEURS.texte2 });
		texte(c, enCours.etape.texte, 15);
		const e = enCours.etape;
		if (e.choix.size() > 0) {
			e.choix.forEach((ch, k) => bouton(c, ch.texte, () => agir({ type: "etape_contrat", choix: k }), { largeur: new UDim(1, 0), hauteur: 36, taille: 14 }));
		} else if (e.combat !== undefined) {
			bouton(c, `⚔ ${e.bouton ?? "Engager le combat"}`, () => agir({ type: "etape_contrat" }), { principal: true });
		} else if (e.test) {
			bouton(c, `${e.bouton ?? "Tenter"} (${e.test.carac}, difficulté ${e.test.difficulte})`, () => agir({ type: "etape_contrat" }), { principal: true });
		} else {
			bouton(c, e.bouton ?? "Continuer", () => agir({ type: "etape_contrat" }), { principal: true });
		}
	}
	if (estGuilde(id) && voir("contrats")) {
		const rang = rangHeros(etat, h.id);
		// Examen du rang suivant : les points ne donnent plus le rang, ils ouvrent l'examen
		const ex = prochainExamen(CONTENU, etat, h.id);
		const ce = carte(parent, `🎖 Rang de Guilde : ${rang}`);
		if (ex === undefined) {
			texte(ce, "Tu as atteint le rang le plus haut de la Guilde.", 14, { couleur: COULEURS.or });
		} else {
			const ok = (v: boolean, t: string) => `<font color="${v ? "#7fc77a" : "#e0605a"}">${t}</font>`;
			const epreuve = ex.type === "epreuve" ? "une épreuve en plusieurs étapes, qui se termine par un combat" : ex.type === "scene" ? "une épreuve qui arrive pendant l'histoire" : "un combat contre un examinateur";
			texte(ce, `Rang suivant : <b>${ex.rang}</b>. Il faut ${ok(ex.points >= ex.pointsRequis, `${ex.pointsRequis} points de Guilde (${ex.points})`)}, ${ok(h.niveau >= ex.niveauRequis, `le niveau ${ex.niveauRequis} (${h.niveau})`)}, puis réussir ${epreuve}.`, 14);
			texte(ce, "Aucun danger au combat d'examen : ni blessure, ni or perdu. En cas d'échec, on revient le lendemain.", 12, { couleur: COULEURS.texte2 });
			if (ex.pret) {
				const avec = candidatsExamen(CONTENU, etat, h.id).filter((x) => x !== h.id).map((x) => etat.heros[x].nom);
				if (avec.size() > 0) texte(ce, `Avec toi : ${avec.join(", ")} (prêts pour le même examen).`, 13, { couleur: COULEURS.texte2 });
				bouton(ce, ex.type === "epreuve" ? `Commencer l'épreuve du rang ${ex.rang}` : `⚔ Passer l'examen du rang ${ex.rang}`, () => agir({ type: "examen_rang" }), { principal: true });
			} else {
				texte(ce, ex.raison, 13, { couleur: COULEURS.or });
			}
		}
		const c = carte(parent, `Tableau des contrats (ton rang : ${rang})`);
		if (enCours) {
			texte(c, `<b>En cours : ${enCours.contrat.titre}</b> (étape ${enCours.numero}/${enCours.total})`, 15, { couleur: COULEURS.or });
			texte(c, `➤ ${enCours.etape.objectif}  📍 ${nomLieu(enCours.etape.lieu) ?? enCours.etape.lieu}`, 14);
			bouton(c, "Abandonner ce contrat", () => agir({ type: "abandonner_contrat" }), { hauteur: 30, taille: 13 });
		}
		texte(c, "Un contrat se joue en plusieurs étapes, dans différents lieux (une balise lumineuse t'y attend). On revient ici toucher la récompense. Un seul contrat à la fois.", 13, { couleur: COULEURS.texte2 });
		for (const [, ct] of pairs(CONTENU.contrats)) {
			if (ct.examen_rang !== undefined || !conditionHeros(CONTENU, etat, ct.disponible_si, h)) continue;
			texte(c, `<b>${ct.titre}</b>  <font color="#beaf96">rang ${ct.rang_min}${ct.etapes.size() > 0 ? ` · ${ct.etapes.size()} étapes` : ""}</font>`, 15);
			texte(c, `${ct.description} Récompense : ${ct.recompenses.or} or, ${ct.recompenses.xp} XP, ${ct.recompenses.points_guilde} pts de guilde.`, 13, { couleur: COULEURS.texte2 });
			const ok = RANGS.indexOf(rang) >= RANGS.indexOf(ct.rang_min) && enCours === undefined;
			bouton(c, enCours ? "Termine d'abord ton contrat en cours" : ok ? "Accepter (en solo)" : `Rang ${ct.rang_min} requis`, () => agir({ type: "contrat", contrat: ct.id }), { actif: ok, hauteur: 32, taille: 14 });
		}
	}
	if (estGuilde(id) && voir("grimoire")) {
		const g = carte(parent, "📖 Fusions que la Guilde peut t'enseigner");
		texte(g, "Uniquement les fusions de ta classe et de tes compétences. Elles vont dans ton grimoire personnel : les autres joueurs ne le voient pas.", 13, { couleur: COULEURS.texte2 });
		const fusions = fusionsPossibles(CONTENU, h);
		for (const f of fusions) {
			const t = f.technique;
			texte(g, `<b>${t.nom}</b> — ${t.description} ${t.cout} mana, recharge ${t.recharge}.`, 14);
			bouton(g, f.probleme ?? "Apprendre", () => agir({ type: "apprendre_technique", technique: t.id }), { actif: f.probleme === undefined, hauteur: 30, taille: 13 });
		}
		if (fusions.size() === 0) texte(g, "Aucune fusion à apprendre pour l'instant : il faut deux compétences d'éléments différents.", 13, { couleur: COULEURS.texte2 });
	}
	if (lieu.auberge === true && (voir("parler") || section === "auberge")) vueAuberge(parent);
	if (lieu.boutique.size() > 0 && voir("boutique")) {
		const c = carte(parent, `Boutique (${h.or} or)`);
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
				texte(c, "Pour d'autres classes ou plus tard :", 13, { couleur: COULEURS.texte2 });
			}
			const prix = prixAchat(CONTENU, h, o);
			const d = CONTENU.objets[o];
			const unique = d.unique_par_partie === true && exemplaires(listeHeros(jeu.etat!), o) > 0;
			ficheObjet(c, o, {
				nombre: h.inventaire[o],
				comparer: true,
				taille: 64,
				actions: [{ libelle: unique ? "Déjà possédé dans la partie" : `Acheter · ${prix} or`, surClic: () => agir({ type: "acheter", objet: o, lieu: id }), actif: h.or >= prix && !unique, principal: tri(o) === 1 }],
			});
		}
	}
	if (section === "tout" && groupe.size() === 0 && perso.size() === 0 && !estGuilde(id) && lieu.boutique.size() === 0) {
		texte(parent, "Rien de particulier à faire ici pour le moment.", 14, { couleur: COULEURS.texte2 });
	}
}

// ───────────────────────────── Auberge ─────────────────────────────

/** La chambre de l'auberge : on propose de dormir ; le temps ne passe que si tous les joueurs présents acceptent. */
export function vueAuberge(parent: Instance) {
	const etat = jeu.etat!;
	const pseudo = (j: string) => esc(etat.joueurs[j]?.pseudo ?? "?");
	const c = carte(parent, "🛏 La chambre du Chaudron Fêlé");
	texte(c, "Les mois ne passent que si vous le décidez, ici. En jouant, seuls les jours avancent (jusqu'au dernier jour du mois).", 13, { couleur: COULEURS.texte2 });
	const r = etat.repos;
	if (r) {
		texte(c, `<b>${pseudo(r.par)}</b> propose de dormir <b>${r.mois} mois</b>, jusqu'au ${formaterDate(CONTENU, r.jusqua)}.`, 15);
		const attente = attenteRepos(etat);
		if (attente.size() > 0) texte(c, `En attente de : <b>${attente.map(pseudo).join(", ")}</b>`, 14, { couleur: COULEURS.or });
		if (!r.accords.includes(jeu.moi)) {
			const l = ligne(c);
			bouton(l, "Accepter", () => agir({ type: "repondre_repos", accepte: true }), { principal: true, hauteur: 36 });
			bouton(l, "Refuser et proposer autre chose", () => agir({ type: "repondre_repos", accepte: false }), { hauteur: 36 });
		} else texte(c, "Tu as accepté.", 14, { couleur: COULEURS.vert });
		return;
	}
	const l = ligne(c);
	for (const mois of CONTENU.config.ellipses.durees_auberge_mois) {
		bouton(l, `Dormir ${mois} mois`, () => agir({ type: "proposer_repos", mois }), { hauteur: 36 });
	}
	const histoire = prochaineDateHistoire(CONTENU, etat);
	if (histoire) {
		const mois = math.max(1, math.round((histoire.jour - etat.jour) / CONTENU.config.calendrier.jours_par_mois));
		bouton(c, `Dormir jusqu'à la suite de l'histoire (${mois} mois) — ${histoire.raison}`, () => agir({ type: "proposer_repos", histoire: true }), { principal: true, largeur: new UDim(1, 0), hauteur: 40 });
	}
}

// ───────────────────────────── Carte ─────────────────────────────

function vueCarte(parent: Frame, allerA: (lieu: string) => void) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const tous = listeHeros(etat).map((x) => x.id);
	texte(parent, "⭐ quête principale · ● autre chose à faire · ⚔ combat possible", 13, { couleur: COULEURS.texte2 });
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
		const ici = etapes.includes(l.id) ? '<font color="#ffd166">📍 étape en cours · </font>' : "";
		texte(li, `${ici}${marque}<b>${l.nom}</b>${combat}`, 15, { largeur: new UDim(1, -100) });
		bouton(li, "Y aller", () => allerA(l.id), { hauteur: 32, taille: 14 });
	}
	}
	texte(parent, "« Y aller » te téléporte devant l'entrée (même dans une autre région). Tu peux aussi marcher : approche-toi d'une porte et appuie sur E.", 13, { couleur: COULEURS.texte2 });
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
	texte(id, `${ra.nom} · ${cl.nom} · ${h.origine === "invoque" ? "Invoqué" : "Réincarné"} · ${age(h, annee)} ans${h.blessure ? " · <font color=\"#c4483c\">blessé</font>" : ""}`, 15);
	texte(id, `Niveau ${h.niveau} — XP ${h.xp} / ${xpPourNiveau(CONTENU, h.niveau + 1)} · PV max ${pvMax(CONTENU, k.VIT, h.niveau)} · Mana ${manaMax(k.ESP, h.niveau)} · ${h.or} or`, 14, { couleur: COULEURS.texte2 });
	const la = ligne(id);
	texte(la, "Si je suis absent :", 14, { largeur: new UDim(0, 150) });
	bouton(la, "joué par l'ordinateur", () => agir({ type: "si_absent", mode: "ia" }), { choisi: h.siAbsent === "ia", hauteur: 30, taille: 13 });
	bouton(la, "reste au camp", () => agir({ type: "si_absent", mode: "camp" }), { choisi: h.siAbsent === "camp", hauteur: 30, taille: 13 });

	const cc = carte(parent, `Caractéristiques${h.pointsCaracDispo > 0 ? ` — ${h.pointsCaracDispo} point(s) à répartir` : ""}`);
	for (const x of CARACS) {
		const l = ligne(cc);
		texte(l, `${NOMS_CARACS[x]} : <b>${k[x]}</b>`, 15, { largeur: new UDim(0, 170) });
		if (h.pointsCaracDispo > 0) bouton(l, "+1", () => agir({ type: "repartir", carac: x }), { hauteur: 28, taille: 13 });
	}

	const dn = carte(parent, "Don, trait et passif");
	texte(dn, `<b>Don : ${CONTENU.dons[h.don].nom}</b> — ${CONTENU.dons[h.don].combat} <i>Hors combat :</i> ${CONTENU.dons[h.don].hors_combat}`, 14);
	texte(dn, `<b>${ra.trait.nom}</b> — ${ra.trait.avantage} <i>Défaut :</i> ${ra.trait.defaut}`, 14);
	texte(dn, `<b>Passif : ${cl.passif.nom}</b> — ${cl.passif.description}`, 14);

	const equipees = competencesEquipees(CONTENU, h);
	const connues = competencesConnues(CONTENU, h);
	const co = carte(parent, `Compétences${h.pointsCompetenceDispo > 0 ? ` — ${h.pointsCompetenceDispo} point(s)` : ""}`);
	texte(co, `Rang maximum ${cfg.rang_competence_max} · ${equipees.size()}/${cfg.competences_equipees_max} équipées pour le combat.`, 13, { couleur: COULEURS.texte2 });
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
		texte(l, `<b>${comp.nom}</b> (rang ${rang}/${cfg.rang_competence_max}) <font color="#beaf96">${comp.description}</font>`, 14, { largeur: new UDim(1, -170) });
		if (h.pointsCompetenceDispo > 0 && rang < cfg.rang_competence_max) bouton(l, "Améliorer", () => agir({ type: "ameliorer", competence: cid }), { hauteur: 28, taille: 13 });
		const variantes = h.variantes[cid] ?? [];
		if (variantes.size() > 0) {
			const lv = ligne(co);
			texte(lv, "Variante active :", 13, { largeur: new UDim(0, 120), couleur: COULEURS.texte2 });
			bouton(lv, "de base", () => agir({ type: "variante_active", competence: cid, technique: undefined }), { choisi: h.varianteActive[cid] === undefined, hauteur: 28, taille: 13 });
			for (const v of variantes) {
				const t = h.grimoire[v];
				bouton(lv, t?.nom ?? v, () => agir({ type: "variante_active", competence: cid, technique: v }), { choisi: h.varianteActive[cid] === v, hauteur: 28, taille: 13 });
				bouton(lv, "Oublier", () => agir({ type: "oublier_variante", technique: v }), { hauteur: 28, taille: 12 });
			}
		}
	}
	if (h.branche === undefined && h.niveau >= cfg.niveau_branche) {
		texte(co, "<b>Choisis une branche :</b>", 15, { couleur: COULEURS.or });
		for (const b of cl.branches) {
			texte(co, `<b>${b.nom}</b> — ${b.description}`, 14);
			bouton(co, `Choisir ${b.nom}`, () => agir({ type: "branche", branche: b.id }), { principal: true, hauteur: 30, taille: 13 });
		}
	} else if (h.branche === undefined) {
		texte(co, `Au niveau ${cfg.niveau_branche}, tu choisiras une branche : ${cl.branches.map((b) => b.nom).join(" ou ")}.`, 13, { couleur: COULEURS.texte2 });
	}
	texte(co, `Ultime : ${cl.ultime.nom} — ${cl.ultime.description}`, 13, { couleur: COULEURS.texte2 });

	const inv = carte(parent, "Équipement porté");
	const NOMS_EMP = { arme: "Arme", armure: "Tenue", accessoire: "Accessoire" };
	for (const emp of ["arme", "armure", "accessoire"] as const) {
		const o = h.equipement[emp];
		if (o === undefined) {
			texte(inv, `${NOMS_EMP[emp]} : <font color="#beaf96">rien (${emp === "arme" ? "arme de base de la classe" : "aucun bonus"})</font>`, 14);
			continue;
		}
		texte(inv, NOMS_EMP[emp], 13, { couleur: COULEURS.texte2 });
		ficheObjet(inv, o, { actions: [{ libelle: "Retirer", surClic: () => agir({ type: "desequiper", emplacement: emp }) }] });
	}
	const sac = carte(parent, `Sac (${h.or} or)`);
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
			actions.push({ libelle: refus ?? "Équiper", surClic: () => agir({ type: "equiper", objet: o }), actif: refus === undefined, principal: refus === undefined });
		}
		if (def.prix > 0 && def.type !== "quete") actions.push({ libelle: `Vendre ${prixVente(CONTENU, h, o)} or`, surClic: () => agir({ type: "vendre", objet: o }) });
		ficheObjet(sac, o, { nombre: h.inventaire[o], comparer: true, actions });
	}
	if (objets.size() === 0) texte(sac, "Ton sac est vide.", 14, { couleur: COULEURS.texte2 });
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
			texte(c, `<b>${def.titre}</b>  <font color="#beaf96">${TYPES_QUETE[def.type] ?? def.type}${q.terminee ? " · terminée" : ""}</font>`, 16, { couleur: q.terminee ? COULEURS.texte2 : COULEURS.or });
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
		texte(c, `<b>📜 Contrat : ${contrat.contrat.titre}</b>  <font color="#beaf96">étape ${contrat.numero}/${contrat.total}</font>`, 16, { couleur: COULEURS.or });
		texte(c, contrat.contrat.description, 14, { couleur: COULEURS.texte2 });
		texte(c, `➤ ${contrat.etape.objectif}  📍 ${nomLieu(contrat.etape.lieu) ?? contrat.etape.lieu}`, 15);
	}
	if (rien) texte(parent, "Aucune quête pour l'instant.", 14, { couleur: COULEURS.texte2 });
	// scènes « partout » (sans lieu) : histoire et prologue
	const h = monHeros()!;
	const partout = scenesDisponibles(CONTENU, etat, undefined, h.id);
	if (partout.size() > 0) {
		const c = carte(parent, "À vivre maintenant");
		for (const s of partout) {
			const l = ligne(c);
			texte(l, s.titre, 15, { largeur: new UDim(1, -110) });
			bouton(l, "Lancer", () => agir({ type: "lancer_scene", scene: s.id }), { principal: true, hauteur: 32 });
		}
	}
}

function vueJournal(parent: Frame) {
	const etat = jeu.etat!;
	const c = carte(parent, "Journal de la partie");
	const n = etat.journal.size();
	for (let i = n - 1; i >= math.max(0, n - 40); i--) {
		const e = etat.journal[i];
		texte(c, `<font color="#beaf96">${formaterDate(CONTENU, e.jour)}</font> — ${esc(e.texte)}`, 14);
	}
}

// ───────────────────────────── Compagnons ─────────────────────────────

function vueCompagnons(parent: Frame) {
	const etat = jeu.etat!;
	const h = monHeros()!;
	const paliers = CONTENU.config.affinite.paliers;
	if (etat.compagnonsRencontres.size() === 0) texte(parent, "Tu n'as encore rencontré personne.", 14, { couleur: COULEURS.texte2 });
	for (const id of etat.compagnonsRencontres) {
		const co = CONTENU.compagnons[id];
		const a = affinite(etat, h.id, id);
		const p = palierCompagnon(CONTENU, etat, h.id, id);
		const c = carte(parent, co.nom);
		texte(c, `${co.titre} · ${co.age} ans`, 14, { couleur: COULEURS.texte2 });
		texte(c, co.personnalite, 14);
		texte(c, `<b>Palier : ${p.nom}</b> (${a.points}/100)${a.blocage !== undefined ? " — elle t'en veut, il faudra te faire pardonner" : ""}`, 15);
		barre(c, a.points, 100, COULEURS.violet);
		texte(c, paliers.map((pl, i) => (i <= p.index ? `<b>${pl.nom}</b>` : `<font color="#7a6a55">${pl.nom}</font>`)).join(" › "), 13);
		for (const [pal, b] of pairs(co.bonus_paliers)) {
			const i = paliers.findIndex((x) => x.id === pal);
			texte(c, `${paliers[i]?.nom ?? pal} — <b>${b.nom}</b> : ${b.description}`, 13, { couleur: i <= p.index ? COULEURS.texte : COULEURS.texte2 });
		}
		if (etat.equipe[h.id] === id) {
			const l = ligne(c);
			texte(l, "<b>T'accompagne en combat</b>", 14, { largeur: new UDim(0, 220), couleur: COULEURS.or });
			bouton(l, "Laisser au camp", () => agir({ type: "equipe", compagnon: undefined }), { hauteur: 30, taille: 13 });
		} else {
			bouton(c, p.index < 1 ? "Palier « Alliée » requis pour l'emmener" : "L'emmener en combat", () => agir({ type: "equipe", compagnon: id }), { actif: p.index >= 1, hauteur: 30, taille: 13 });
		}
		const cadeaux: [string, number][] = [];
		for (const [o, n] of pairs(h.inventaire)) if (n > 0 && CONTENU.objets[o]?.type === "cadeau") cadeaux.push([o, n]);
		if (cadeaux.size() > 0) {
			const l = ligne(c);
			texte(l, "Offrir :", 14, { largeur: new UDim(0, 60) });
			for (const [o, n] of cadeaux) bouton(l, `${CONTENU.objets[o].nom} ×${n}`, () => agir({ type: "cadeau", compagnon: id, objet: o }), { hauteur: 30, taille: 13 });
		} else texte(c, "Aucun cadeau dans ton sac. On en trouve dans les boutiques de Lysmont.", 13, { couleur: COULEURS.texte2 });
	}
}

// ───────────────────────────── Partie ─────────────────────────────

function vuePartie(parent: Frame, redessiner: () => void) {
	const etat = jeu.etat!;
	const c = carte(parent, `Partie « ${esc(jeu.nom)} »`);
	texte(c, `Code à donner à tes amis : <b><font color="#d9a441">${jeu.code}</font></b>`, 17);
	texte(c, `Session ${etat.session}${etat.meneur !== undefined ? ` · meneur du jour : ${esc(etat.joueurs[etat.meneur]?.pseudo ?? "?")}` : ""}`, 14);
	const j = carte(parent, "Joueurs");
	for (const id of etat.ordreJoueurs) {
		const jj = etat.joueurs[id];
		const hj: Heros | undefined = jj.herosId !== undefined ? etat.heros[jj.herosId] : undefined;
		texte(j, `${jj.present ? "🟢" : "⚪"} <b>${esc(jj.pseudo)}</b> — ${hj ? `${esc(hj.nom)} (${CONTENU.classes[hj.classe].nom}, niv. ${hj.niveau})` : "crée son héros…"}`, 15);
	}
	const a = carte(parent, "Actions");
	bouton(a, "Nouvelle session (le meneur change)", () => agir({ type: "nouvelle_session" }), { hauteur: 34 });
	bouton(
		a,
		"Quitter la partie",
		() => {
			affichage.panneau = undefined;
			oublierListeParties();
			commander({ type: "quitter" });
			redessiner();
		},
		{ hauteur: 34 },
	);
}
