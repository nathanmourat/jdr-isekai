/**
 * Combat au tour par tour (comme src/ui/vues/CombatVue.svelte et ActionsLibres.svelte) :
 *  - « Suivre le script » : l'IA maison propose les meilleures actions ;
 *  - « Proposer mon action » : on écrit en français, l'IA comprend, le moteur vérifie (3 essais impossibles par tour) ;
 *  - « Toutes les actions » : choix manuel.
 */
import { CONTENU } from "shared/donnees";
import {
	actionsDisponibles,
	interpreter,
	NOMS_ETATS,
	propositionsScript,
	type ActionCombat,
	type Combattant,
	type ContexteIA,
	type Interpretation,
	type Proposition,
} from "shared/moteur";
import { affichage } from "../local";
import { agir, jeu, monHeros } from "../partie";
import { barre, bouton, carte, champ, colonne, COULEURS, esc, ligne, texte } from "./kit";

const ESSAIS_MAX = 3;
type Selection = { type: "attaque" } | { type: "competence"; comp: string; cible: string } | { type: "potion" } | { type: "pacifier" };

const etatCombat = {
	selection: undefined as Selection | undefined,
	manuel: false,
	reponse: undefined as Interpretation | undefined,
	cleReponse: "",
};

function jouerProposition(cle: string, p: Proposition) {
	etatCombat.reponse = undefined;
	if (p.action.kind === "combat") agir({ type: "combat", cle, action: p.action.action });
	else agir({ type: "fusionner", cle, parent: p.action.parent, secondaire: p.action.secondaire, cible: p.action.cible });
}

function carteProposition(parent: Instance, cle: string, p: Proposition, principale: boolean, libelleBouton = "Jouer") {
	const l = ligne(parent);
	const effets = p.estimation.effets.size() > 0 ? `\n<font color="#beaf96">Effets : ${p.estimation.effets.join(", ")}</font>` : "";
	const conseil = p.conseil !== undefined ? `\n<font color="#d9a441">💡 ${p.conseil}</font>` : "";
	texte(l, `<b>${p.libelle}</b>\n<font color="#beaf96">${p.details}</font>${effets}${conseil}`, 14, { largeur: new UDim(1, -100) });
	bouton(l, libelleBouton, () => jouerProposition(cle, p), { principal: principale, hauteur: 34 });
}

export function vueCombat(parent: Frame, cle: string, redessiner: () => void) {
	const etat = jeu.etat!;
	const entree = etat.combats[cle];
	const combat = entree.combat;
	const acteur = combat.enAttente !== undefined ? combat.combattants.find((x) => x.id === combat.enAttente) : undefined;
	const monTour = acteur !== undefined && acteur.joueurId === jeu.moi;
	const nom = (id: string) => combat.combattants.find((x) => x.id === id)?.nom ?? id;
	if (combat.enAttente === undefined || !monTour) etatCombat.selection = undefined;

	const haut = ligne(parent, 10);
	texte(haut, `<b>⚔ ${combat.nom}</b>  ·  Tour ${combat.tour}`, 18, { couleur: COULEURS.or, largeur: new UDim(1, 0) });

	const zone = colonne(parent, 8);
	const actions = carte(zone);

	if (combat.resultat !== undefined) {
		texte(actions, combat.resultat === "victoire" ? "🏆 Victoire !" : combat.resultat === "defaite" ? "Défaite…" : "Fuite", 22, { gras: true, couleur: COULEURS.or });
		for (const b of entree.contexte.bilan ?? []) texte(actions, b, 14, { couleur: COULEURS.texte2 });
		if (combat.resultat === "defaite") texte(actions, "Mort douce : personne ne meurt pour de bon. L'histoire continue.", 14, { couleur: COULEURS.texte2 });
		bouton(actions, "Continuer", () => agir({ type: "fin_combat", cle }), { principal: true });
	} else if (acteur && monTour) {
		const dispo = actionsDisponibles(CONTENU, combat, acteur.id);
		texte(actions, `À toi : <b>${esc(acteur.nom)}</b>  (${acteur.pv}/${acteur.pvMax} PV · ${acteur.mana} mana)`, 16);
		const sel = etatCombat.selection;
		if (sel !== undefined) {
			let cibles: string[] = [];
			if (sel.type === "attaque") cibles = acteur.attaque.portee === "melee" ? dispo.ciblesMelee : dispo.ciblesDistance;
			else if (sel.type === "potion") cibles = dispo.allies;
			else if (sel.type === "pacifier") cibles = dispo.pacifier;
			else {
				const k = dispo.competences.find((x) => x.comp.id === sel.comp)!.comp;
				cibles = k.cible === "ennemi" ? (k.portee === "melee" ? dispo.ciblesMelee : dispo.ciblesDistance) : k.cible === "allie" ? dispo.allies : dispo.alliesKo;
			}
			texte(actions, cibles.size() > 0 ? "Choisis une cible :" : "Aucune cible possible.", 15, { couleur: COULEURS.or });
			const l = ligne(actions);
			for (const id of cibles) {
				bouton(l, esc(nom(id)), () => {
					etatCombat.selection = undefined;
					let action: ActionCombat;
					if (sel.type === "attaque") action = { type: "attaque", acteur: acteur.id, cible: id };
					else if (sel.type === "potion") action = { type: "objet", acteur: acteur.id, objet: "potion", cible: id };
					else if (sel.type === "pacifier") action = { type: "pacifier", acteur: acteur.id, cible: id };
					else action = { type: "competence", acteur: acteur.id, competence: sel.comp, cible: id };
					agir({ type: "combat", cle, action });
				});
			}
			bouton(l, "Annuler", () => ((etatCombat.selection = undefined), redessiner()), { hauteur: 34, taille: 14 });
		} else {
			actionsLibres(actions, cle, acteur, redessiner);
			bouton(actions, etatCombat.manuel ? "▾ Toutes les actions (mode manuel)" : "▸ Toutes les actions (mode manuel)", () => ((etatCombat.manuel = !etatCombat.manuel), redessiner()), { hauteur: 30, taille: 13 });
			if (etatCombat.manuel) {
				const l = ligne(actions);
				const envoyer = (a: ActionCombat) => agir({ type: "combat", cle, action: a });
				bouton(l, "Attaque", () => ((etatCombat.selection = { type: "attaque" }), redessiner()), { hauteur: 34, taille: 14 });
				for (const k of dispo.competences) {
					const libelle = `${k.comp.nom}${k.rang > 1 ? ` ${k.rang}` : ""}${k.comp.cout > 0 ? ` (${k.comp.cout} mana)` : ""}${k.raison !== "" ? ` · ${k.raison}` : ""}`;
					bouton(
						l,
						libelle,
						() => {
							if (k.comp.cible === "ennemi" || k.comp.cible === "allie" || k.comp.cible === "allie_ko") {
								etatCombat.selection = { type: "competence", comp: k.comp.id, cible: k.comp.cible };
								redessiner();
							} else envoyer({ type: "competence", acteur: acteur.id, competence: k.comp.id });
						},
						{ actif: k.utilisable, hauteur: 34, taille: 14 },
					);
				}
				bouton(l, `Potion (${dispo.potions})`, () => ((etatCombat.selection = { type: "potion" }), redessiner()), { actif: dispo.potions > 0, hauteur: 34, taille: 14 });
				if (dispo.bombes > 0) bouton(l, `Bombe (${dispo.bombes})`, () => envoyer({ type: "objet", acteur: acteur.id, objet: "bombe" }), { hauteur: 34, taille: 14 });
				if (dispo.pacifier.size() > 0) bouton(l, "Pacifier", () => ((etatCombat.selection = { type: "pacifier" }), redessiner()), { hauteur: 34, taille: 14 });
				bouton(l, "Se défendre", () => envoyer({ type: "defendre", acteur: acteur.id }), { hauteur: 34, taille: 14 });
				bouton(l, `Passer au rang ${acteur.rang === "avant" ? "arrière" : "avant"}`, () => envoyer({ type: "changer_rang", acteur: acteur.id }), { hauteur: 34, taille: 14 });
				if (dispo.fuite) bouton(l, "Fuir", () => envoyer({ type: "fuir", acteur: acteur.id }), { hauteur: 34, taille: 14 });
			}
		}
	} else if (acteur) {
		const pseudo = acteur.joueurId !== undefined ? etat.joueurs[acteur.joueurId]?.pseudo : undefined;
		texte(actions, `C'est au tour de <b>${esc(acteur.nom)}</b>${pseudo !== undefined ? ` (${esc(pseudo)})` : ""}…`, 16);
	}
	const h = monHeros();
	if (h && h.don === "second-depart" && etat.secondDepart[h.id] !== etat.session && combat.instantane !== undefined && combat.resultat === undefined) {
		bouton(actions, "⟲ Second départ (rejouer le tour)", () => agir({ type: "second_depart", cle }), { hauteur: 30, taille: 13 });
	}

	// Combattants
	const liste = carte(zone, "Combattants");
	for (const x of combat.combattants) {
		if (x.parti) continue;
		const etats = x.etats.map((e) => NOMS_ETATS[e.id] ?? e.id).join(", ");
		texte(liste, `${x.camp === "ennemis" ? "👹" : "🛡"} <b>${esc(x.nom)}</b>  ${x.pv}/${x.pvMax}${x.bouclier > 0 ? ` +${x.bouclier}` : ""}${etats !== "" ? ` · ${etats}` : ""}${x.ko ? " · K.O." : ""}`, 14, {
			couleur: x.ko ? COULEURS.texte2 : COULEURS.texte,
		});
		barre(liste, x.pv, x.pvMax, x.camp === "ennemis" ? COULEURS.rouge : COULEURS.vert, new UDim(1, 0), 6);
	}

	// Journal du combat
	const jo = carte(zone, "Journal du combat");
	const n = combat.evenements.size();
	for (let i = n - 1; i >= math.max(0, n - 8); i--) {
		const e = combat.evenements[i];
		texte(jo, e.texte, 13, { couleur: e.type === "ko" || e.type === "fin" ? COULEURS.or : COULEURS.texte });
	}
}

/** Suivre le script ou proposer son action (règle des 3 propositions impossibles par tour). */
function actionsLibres(parent: Instance, cle: string, acteur: Combattant, redessiner: () => void) {
	const etat = jeu.etat!;
	const combat = etat.combats[cle].combat;
	const heros = acteur.herosId !== undefined ? etat.heros[acteur.herosId] : undefined;
	const ctx: ContexteIA = { contenu: CONTENU, combat, acteur: acteur.id, heros, grimoire: etat.grimoire ?? {} };
	const cleEssais = `${combat.id}:${combat.tour}:${acteur.id}`;
	if (etatCombat.cleReponse !== cleEssais) {
		etatCombat.cleReponse = cleEssais;
		etatCombat.reponse = undefined;
		affichage.texteLibre = "";
	}
	const essais = affichage.essais.get(cleEssais) ?? 0;
	const bloque = essais >= ESSAIS_MAX;

	const modes = ligne(parent);
	bouton(modes, "📜 Suivre le script", () => ((affichage.modeCombat = "script"), redessiner()), { choisi: affichage.modeCombat === "script", hauteur: 34, taille: 14 });
	bouton(modes, "✍️ Proposer mon action", () => ((affichage.modeCombat = "libre"), redessiner()), { choisi: affichage.modeCombat === "libre", hauteur: 34, taille: 14 });

	if (affichage.modeCombat === "libre" && !bloque) {
		const l = ligne(parent);
		const boite = champ(l, "Ex. : je vise la tête du loup · je combine feu et glace · je me cache", affichage.texteLibre, (v) => (affichage.texteLibre = v), new UDim(1, -120));
		const proposer = () => {
			if (affichage.texteLibre.gsub("%s", "")[0].size() === 0) return;
			const rep = interpreter(ctx, affichage.texteLibre);
			etatCombat.reponse = rep;
			if (rep.compteCommeEssai) affichage.essais.set(cleEssais, essais + 1);
			redessiner();
		};
		boite.FocusLost.Connect((entree) => {
			if (entree) proposer();
		});
		bouton(l, "Proposer", proposer, { principal: true, hauteur: 40 });
		texte(parent, `Propositions impossibles ce tour-ci : ${essais} / ${ESSAIS_MAX}`, 13, { couleur: COULEURS.texte2 });
		const rep = etatCombat.reponse;
		if (rep) {
			texte(parent, rep.message, 15, { couleur: rep.possible ? COULEURS.vert : COULEURS.rouge });
			if (rep.proposition && rep.possible) carteProposition(parent, cle, rep.proposition, true, "Valider");
			for (const info of rep.informations) texte(parent, `🔎 ${info}`, 14);
			if (rep.alternatives.size() > 0) {
				texte(parent, rep.possible ? "Autres idées :" : "Propositions :", 13, { couleur: COULEURS.texte2 });
				for (const p of rep.alternatives) carteProposition(parent, cle, p, false);
			}
		}
		return;
	}
	if (affichage.modeCombat === "libre" && bloque) {
		texte(parent, "Trois propositions impossibles ce tour-ci : choisis parmi les propositions du jeu. Tu pourras de nouveau proposer au prochain tour.", 14, { couleur: COULEURS.or });
	}
	const propositions = propositionsScript(ctx);
	if (propositions.size() === 0) texte(parent, "Aucune proposition : utilise les actions manuelles ci-dessous.", 14, { couleur: COULEURS.texte2 });
	propositions.forEach((p, i) => carteProposition(parent, cle, p, i === 0));
}
