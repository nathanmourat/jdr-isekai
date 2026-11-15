/**
 * Temps libre (ellipse de plusieurs mois) et fin de chapitre (comme TempsLibre.svelte et FinChapitre.svelte).
 */
import { CONTENU } from "shared/donnees";
import { age, conditionHeros, formaterDate, listeHeros, palierCompagnon, versDate } from "shared/moteur";
import { affichage } from "../local";
import { agir, jeu, monHeros } from "../partie";
import { bouton, carte, colonne, COULEURS, esc, ligne, texte } from "./kit";
import { tr, trf, tx } from "shared/langue";

export function vueTempsLibre(parent: Frame, redessiner: () => void) {
	const etat = jeu.etat!;
	const tl = etat.tempsLibre!;
	const h = monHeros()!;
	const nb = CONTENU.config.ellipses.activites_temps_libre + (h.don === "croissance-acceleree" ? 1 : 0);
	const c = carte(parent, trf("Temps libre — {titre}", { titre: tl.titre }));
	texte(c, trf("{mois} mois vont passer, jusqu'au {formaterDate}. Chaque joueur choisit {nb} activités ; les gains sont proportionnels à la durée.", { mois: tl.mois, formaterDate: formaterDate(CONTENU, tl.jusqua), nb }), 15);

	if (tl.resultats !== undefined) {
		texte(c, tr("Ce qui s'est passé"), 18, { gras: true, couleur: COULEURS.or });
		for (const x of listeHeros(etat)) {
			texte(c, `<b>${esc(x.nom)}</b>`, 15);
			for (const r of tl.resultats[x.id] ?? []) texte(c, `• ${r}`, 14);
		}
		bouton(c, tr("Reprendre l'aventure"), () => agir({ type: "valider_temps_libre" }), { principal: true });
		return;
	}
	if (tl.choix[h.id] !== undefined) {
		const attente = listeHeros(etat).filter((x) => tl.choix[x.id] === undefined).map((x) => esc(x.nom));
		texte(c, trf("Tes activités sont choisies. En attente de : {v}.", { v: attente.join(", ") }), 15, { couleur: COULEURS.vert });
		if (etat.meneur === jeu.moi) bouton(c, tr("Valider pour les absents (Repos + Contrats de guilde)"), () => agir({ type: "valider_temps_libre" }), { hauteur: 34 });
		return;
	}
	const choix = affichage.activites;
	texte(c, trf("Activités de {esc} ({v}/{nb})", { esc: esc(h.nom), v: choix.size(), nb }), 16, { gras: true, couleur: COULEURS.or });
	for (const [, a] of pairs(CONTENU.activites)) {
		if (!conditionHeros(CONTENU, etat, a.disponible_si, h)) continue;
		const impossible = choix.size() >= nb || (a.choix_compagnon === true && etat.compagnonsRencontres.size() === 0);
		const l = ligne(c);
		texte(l, trf("<b>{nom}</b> <font color=\"#beaf96\">{description}</font>", { nom: a.nom, description: a.description }), 14, { largeur: new UDim(1, -100) });
		bouton(
			l,
			tr("Ajouter"),
			() => {
				choix.push({ activite: a.id, compagnon: a.choix_compagnon === true ? etat.compagnonsRencontres[0] : undefined });
				redessiner();
			},
			{ actif: !impossible, hauteur: 32, taille: 14 },
		);
	}
	if (choix.size() > 0) {
		const liste = colonne(c, 4);
		choix.forEach((ch, i) => {
			const l = ligne(liste);
			const co = ch.compagnon !== undefined ? ` avec ${CONTENU.compagnons[ch.compagnon]?.nom ?? ch.compagnon}` : "";
			texte(l, `${i + 1}. ${CONTENU.activites[ch.activite].nom}${co}`, 15, { largeur: new UDim(1, -200) });
			if (ch.compagnon !== undefined && etat.compagnonsRencontres.size() > 1) {
				bouton(
					l,
					tr("Changer"),
					() => {
						const r = etat.compagnonsRencontres;
						ch.compagnon = r[(r.indexOf(ch.compagnon!) + 1) % r.size()];
						redessiner();
					},
					{ hauteur: 30, taille: 13 },
				);
			}
			bouton(l, tr("Retirer"), () => (choix.remove(i), redessiner()), { hauteur: 30, taille: 13 });
		});
	}
	bouton(
		c,
		tr("Valider mes activités"),
		() => {
			if (agir({ type: "temps_libre", activites: [...choix] })) affichage.activites = [];
		},
		{ principal: true, actif: choix.size() === nb },
	);
}

const TITRES_CHAPITRES: Record<number, string> = { 2: tx("Les Routes du Sud"), 3: tx("La Forêt qui se souvient"), 4: tx("Feu et Écailles"), 5: tx("La Guerre des Cendres"), 6: tx("Le Souverain des Cendres") };
const FINS_SAISON: [string, string][] = [["fin-sceau", tx("A. Le Sceau")], ["fin-pacte", tx("B. Le Pacte")], ["fin-couronne", tx("C. La Couronne")], ["fin-retour", tx("D. Le Retour")]];

export function vueFinChapitre(parent: Frame) {
	const etat = jeu.etat!;
	const annee = versDate(CONTENU, etat.jour).annee;
	const n = etat.finChapitre ?? 1;
	const finSaison = n === 6;
	const c = carte(parent, finSaison ? tr("Fin de la saison 1") : trf("Fin du chapitre {n}", { n }));
	if (finSaison) {
		for (const [f, nom] of FINS_SAISON) if (etat.flags[f] === true) texte(c, trf("<b>Fin {nom}</b>", { nom: tr(nom) }), 17, { couleur: COULEURS.or });
	}
	texte(c, trf("{annee}. Voici où en sont les héros.", { annee }), 15);
	for (const h of listeHeros(etat)) {
		texte(c, trf("<b>{esc}</b> — {age} ans · niveau {niveau} · {or} or", { esc: esc(h.nom), age: age(h, annee), niveau: h.niveau, or: h.or }), 15);
		for (const co of etat.compagnonsRencontres) texte(c, `   ${CONTENU.compagnons[co].nom} : ${palierCompagnon(CONTENU, etat, h.id, co).nom}`, 14, { couleur: COULEURS.texte2 });
	}
	if (finSaison) {
		texte(c, tr("<b>La saison 1 est terminée.</b> Vous pouvez continuer à parcourir Velmaris, finir vos contrats et vos quêtes de compagnes."), 15);
		texte(c, tr("La saison 2 arrivera dans une prochaine mise à jour : la sauvegarde sera reprise, et la fin obtenue décidera de son point de départ."), 15);
	} else {
		texte(c, tr("<b>Un long moment va passer.</b> Quand tout le monde est prêt, retrouvez-vous dans une auberge et utilisez le lit : le groupe dormira jusqu'au début du chapitre suivant."), 15);
		texte(c, trf("Chapitre {v} : « {v2} ».", { v: n + 1, v2: tr(TITRES_CHAPITRES[n + 1] ?? "") }), 15);
	}
	bouton(c, tr("Continuer"), () => agir({ type: "chapitre_suivant" }), { principal: true });
}
