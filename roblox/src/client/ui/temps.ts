/**
 * Temps libre (ellipse de plusieurs mois) et fin de chapitre (comme TempsLibre.svelte et FinChapitre.svelte).
 */
import { CONTENU } from "shared/donnees";
import { age, conditionHeros, formaterDate, listeHeros, palierCompagnon, versDate } from "shared/moteur";
import { affichage } from "../local";
import { agir, jeu, monHeros } from "../partie";
import { bouton, carte, colonne, COULEURS, esc, ligne, texte } from "./kit";

export function vueTempsLibre(parent: Frame, redessiner: () => void) {
	const etat = jeu.etat!;
	const tl = etat.tempsLibre!;
	const h = monHeros()!;
	const nb = CONTENU.config.ellipses.activites_temps_libre + (h.don === "croissance-acceleree" ? 1 : 0);
	const c = carte(parent, `Temps libre — ${tl.titre}`);
	texte(c, `${tl.mois} mois vont passer, jusqu'au ${formaterDate(CONTENU, tl.jusqua)}. Chaque joueur choisit ${nb} activités ; les gains sont proportionnels à la durée.`, 15);

	if (tl.resultats !== undefined) {
		texte(c, "Ce qui s'est passé", 18, { gras: true, couleur: COULEURS.or });
		for (const x of listeHeros(etat)) {
			texte(c, `<b>${esc(x.nom)}</b>`, 15);
			for (const r of tl.resultats[x.id] ?? []) texte(c, `• ${r}`, 14);
		}
		bouton(c, "Reprendre l'aventure", () => agir({ type: "valider_temps_libre" }), { principal: true });
		return;
	}
	if (tl.choix[h.id] !== undefined) {
		const attente = listeHeros(etat).filter((x) => tl.choix[x.id] === undefined).map((x) => esc(x.nom));
		texte(c, `Tes activités sont choisies. En attente de : ${attente.join(", ")}.`, 15, { couleur: COULEURS.vert });
		if (etat.meneur === jeu.moi) bouton(c, "Valider pour les absents (Repos + Contrats de guilde)", () => agir({ type: "valider_temps_libre" }), { hauteur: 34 });
		return;
	}
	const choix = affichage.activites;
	texte(c, `Activités de ${esc(h.nom)} (${choix.size()}/${nb})`, 16, { gras: true, couleur: COULEURS.or });
	for (const [, a] of pairs(CONTENU.activites)) {
		if (!conditionHeros(CONTENU, etat, a.disponible_si, h)) continue;
		const impossible = choix.size() >= nb || (a.choix_compagnon === true && etat.compagnonsRencontres.size() === 0);
		const l = ligne(c);
		texte(l, `<b>${a.nom}</b> <font color="#beaf96">${a.description}</font>`, 14, { largeur: new UDim(1, -100) });
		bouton(
			l,
			"Ajouter",
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
					"Changer",
					() => {
						const r = etat.compagnonsRencontres;
						ch.compagnon = r[(r.indexOf(ch.compagnon!) + 1) % r.size()];
						redessiner();
					},
					{ hauteur: 30, taille: 13 },
				);
			}
			bouton(l, "Retirer", () => (choix.remove(i), redessiner()), { hauteur: 30, taille: 13 });
		});
	}
	bouton(
		c,
		"Valider mes activités",
		() => {
			if (agir({ type: "temps_libre", activites: [...choix] })) affichage.activites = [];
		},
		{ principal: true, actif: choix.size() === nb },
	);
}

export function vueFinChapitre(parent: Frame) {
	const etat = jeu.etat!;
	const annee = versDate(CONTENU, etat.jour).annee;
	const c = carte(parent, `Fin du chapitre ${etat.finChapitre}`);
	texte(c, `Printemps ${annee}. Voici où en sont les héros.`, 15);
	for (const h of listeHeros(etat)) {
		texte(c, `<b>${esc(h.nom)}</b> — ${age(h, annee)} ans · niveau ${h.niveau} · ${h.or} or`, 15);
		for (const co of etat.compagnonsRencontres) texte(c, `   ${CONTENU.compagnons[co].nom} : ${palierCompagnon(CONTENU, etat, h.id, co).nom}`, 14, { couleur: COULEURS.texte2 });
	}
	texte(c, "Le chapitre 2, « Les Routes du Sud », arrivera dans une prochaine mise à jour. Ta sauvegarde sera reprise telle quelle.", 15);
	bouton(c, "Continuer à explorer Aubeclaire", () => agir({ type: "chapitre_suivant" }), { principal: true });
}
