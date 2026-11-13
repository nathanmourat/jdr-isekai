/**
 * Interface de combat « RPG moderne » (mêmes règles que la version web) :
 *  - en haut : nom du combat, tour, ordre des tours ; à gauche : l'équipe (PV, mana) ;
 *  - en bas : gros menu (Attaquer, Compétences, Objets, Défendre, Proposer, Conseils, Plus) ;
 *  - cibles : clic sur le personnage en 3D (contour doré) ou boutons ;
 *  - « Proposer » : on écrit son action en français, l'IA maison la comprend (3 essais impossibles par tour).
 */
import { CONTENU } from "shared/donnees";
import { actionsDisponibles, interpreter, NOMS_ETATS, propositionsScript, type ActionCombat, type Combat, type Combattant, type ContexteIA, type Interpretation, type Proposition } from "shared/moteur";
import { affichage } from "../local";
import { agir, jeu, monHeros } from "../partie";
import { proposerCibles } from "../rendu/arene";
import { barre, bouton, champ, colonne, COULEURS, esc, ligne, texte } from "./kit";

const ESSAIS_MAX = 3;
type Menu = "aucun" | "competences" | "objets" | "proposer" | "conseils" | "plus" | "cible";
type Visee = { type: "attaque" } | { type: "competence"; comp: string } | { type: "potion" } | { type: "pacifier" };

const ui = {
	menu: "aucun" as Menu,
	visee: undefined as Visee | undefined,
	reponse: undefined as Interpretation | undefined,
	cleTour: "",
};

function cadre(parent: Instance, position: UDim2, ancre: Vector2, largeur: UDim, transparence = 0.15): Frame {
	const f = new Instance("Frame");
	f.AnchorPoint = ancre;
	f.Position = position;
	f.Size = new UDim2(largeur, new UDim(0, 0));
	f.AutomaticSize = Enum.AutomaticSize.Y;
	f.BackgroundColor3 = COULEURS.fond;
	f.BackgroundTransparency = transparence;
	const coin = new Instance("UICorner");
	coin.CornerRadius = new UDim(0, 12);
	coin.Parent = f;
	const bord = new Instance("UIStroke");
	bord.Color = COULEURS.bord;
	bord.Parent = f;
	const p = new Instance("UIPadding");
	for (const k of ["PaddingTop", "PaddingBottom", "PaddingLeft", "PaddingRight"] as const) p[k] = new UDim(0, 10);
	p.Parent = f;
	f.Parent = parent;
	return colonne(f, 6).Parent as Frame;
}

function contenu(f: Frame): Frame {
	return f.FindFirstChildOfClass("Frame")!;
}

function grosBouton(parent: Instance, icone: string, libelle: string, surClic: () => void, options: { actif?: boolean; choisi?: boolean } = {}) {
	return bouton(parent, `${icone}\n${libelle}`, surClic, { actif: options.actif ?? true, choisi: options.choisi, largeur: new UDim(0, 104), hauteur: 64, taille: 15 });
}

function jouerProposition(cle: string, p: Proposition) {
	ui.reponse = undefined;
	ui.menu = "aucun";
	if (p.action.kind === "combat") agir({ type: "combat", cle, action: p.action.action });
	else agir({ type: "fusionner", cle, parent: p.action.parent, secondaire: p.action.secondaire, cible: p.action.cible });
}

function carteProposition(parent: Instance, cle: string, p: Proposition, principale: boolean, libelle = "Jouer") {
	const l = ligne(parent);
	const effets = p.estimation.effets.size() > 0 ? ` · ${p.estimation.effets.join(", ")}` : "";
	const conseil = p.conseil !== undefined ? `\n<font color="#d9a441">💡 ${p.conseil}</font>` : "";
	texte(l, `<b>${p.libelle}</b>  <font color="#beaf96">${p.details}${effets}</font>${conseil}`, 14, { largeur: new UDim(1, -100) });
	bouton(l, libelle, () => jouerProposition(cle, p), { principal: principale, hauteur: 34 });
}

function viser(cle: string, acteur: Combattant, v: Visee, id: string) {
	let action: ActionCombat;
	if (v.type === "attaque") action = { type: "attaque", acteur: acteur.id, cible: id };
	else if (v.type === "potion") action = { type: "objet", acteur: acteur.id, objet: "potion", cible: id };
	else if (v.type === "pacifier") action = { type: "pacifier", acteur: acteur.id, cible: id };
	else action = { type: "competence", acteur: acteur.id, competence: v.comp, cible: id };
	ui.menu = "aucun";
	ui.visee = undefined;
	proposerCibles([], undefined);
	agir({ type: "combat", cle, action });
}

export function vueCombat(calque: Frame, cle: string, redessiner: () => void) {
	const etat = jeu.etat!;
	const entree = etat.combats[cle];
	const combat = entree.combat;
	const acteur = combat.enAttente !== undefined ? combat.combattants.find((x) => x.id === combat.enAttente) : undefined;
	const monTour = acteur !== undefined && acteur.joueurId === jeu.moi && combat.resultat === undefined;
	const nom = (id: string) => combat.combattants.find((x) => x.id === id)?.nom ?? id;
	const cleTour = `${combat.id}:${combat.tour}:${combat.enAttente ?? ""}`;
	if (ui.cleTour !== cleTour) {
		ui.cleTour = cleTour;
		ui.menu = "aucun";
		ui.visee = undefined;
		ui.reponse = undefined;
		affichage.texteLibre = "";
	}

	// ── En haut : titre et ordre des tours
	const haut = contenu(cadre(calque, new UDim2(0.5, 0, 0, 10), new Vector2(0.5, 0), new UDim(0, 640)));
	texte(haut, `⚔ <b>${combat.nom}</b>  ·  Tour ${combat.tour}`, 18, { couleur: COULEURS.or, centre: true });
	const ordre = ligne(haut, 4);
	const n = combat.ordre.size();
	for (let k = 0; k < math.min(n, 8); k++) {
		const id = combat.ordre[(combat.index + k) % math.max(1, n)];
		const x = combat.combattants.find((c) => c.id === id);
		if (!x || x.ko || x.parti) continue;
		const couleur = x.camp === "heros" ? "#9fd3ff" : "#ff9b8a";
		bouton(ordre, `<font color="${couleur}">${esc(x.nom)}</font>`, () => undefined, { choisi: id === combat.enAttente, actif: false, hauteur: 28, taille: 13 });
	}
	// derniers événements
	const nb = combat.evenements.size();
	for (let i = math.max(0, nb - 3); i < nb; i++) texte(haut, combat.evenements[i].texte, 13, { couleur: i === nb - 1 ? COULEURS.texte : COULEURS.texte2, centre: true });

	// ── À gauche : l'équipe
	const equipe = contenu(cadre(calque, new UDim2(0, 10, 0, 10), new Vector2(0, 0), new UDim(0, 230)));
	for (const x of combat.combattants) {
		if (x.camp !== "heros" || x.parti) continue;
		const etats = x.etats.map((e) => NOMS_ETATS[e.id] ?? e.id).join(", ");
		texte(equipe, `<b>${esc(x.nom)}</b>${x.ko ? " · K.O." : ""}${etats !== "" ? `  <font color="#c8a0ff">${etats}</font>` : ""}`, 13, { couleur: x.ko ? COULEURS.texte2 : COULEURS.texte });
		barre(equipe, x.pv, x.pvMax, COULEURS.vert, new UDim(1, 0), 8);
		texte(equipe, `${x.pv}/${x.pvMax} PV${x.bouclier > 0 ? ` +${x.bouclier}` : ""} · ${x.mana}/${x.manaMax} mana`, 12, { couleur: COULEURS.texte2 });
	}

	// ── En bas : commandes
	const bas = contenu(cadre(calque, new UDim2(0.5, 0, 1, -10), new Vector2(0.5, 1), new UDim(0, 860), 0.08));

	if (combat.resultat !== undefined) {
		proposerCibles([], undefined);
		texte(bas, combat.resultat === "victoire" ? "🏆 Victoire !" : combat.resultat === "defaite" ? "Défaite…" : "Le groupe a fui", 26, { gras: true, couleur: COULEURS.or, centre: true });
		for (const b of entree.contexte.bilan ?? []) texte(bas, b, 14, { couleur: COULEURS.texte2, centre: true });
		if (combat.resultat === "defaite") texte(bas, "Mort douce : personne ne meurt pour de bon. L'histoire continue.", 14, { couleur: COULEURS.texte2, centre: true });
		bouton(bas, "Continuer", () => agir({ type: "fin_combat", cle }), { principal: true, largeur: new UDim(1, 0) });
		return;
	}
	if (!acteur || !monTour) {
		proposerCibles([], undefined);
		const pseudo = acteur?.joueurId !== undefined ? etat.joueurs[acteur.joueurId]?.pseudo : undefined;
		texte(bas, acteur ? `Tour de <b>${esc(acteur.nom)}</b>${pseudo !== undefined ? ` (${esc(pseudo)})` : ""}…` : "…", 17, { centre: true });
		return;
	}

	const dispo = actionsDisponibles(CONTENU, combat, acteur.id);
	texte(bas, `À toi : <b>${esc(acteur.nom)}</b>  <font color="#beaf96">${acteur.pv}/${acteur.pvMax} PV · ${acteur.mana} mana</font>`, 16);

	// sous-menu (au-dessus des gros boutons)
	const sous = colonne(bas, 6);
	if (ui.menu === "cible" && ui.visee !== undefined) {
		const v = ui.visee;
		let cibles: string[] = [];
		if (v.type === "attaque") cibles = acteur.attaque.portee === "melee" ? dispo.ciblesMelee : dispo.ciblesDistance;
		else if (v.type === "potion") cibles = dispo.allies;
		else if (v.type === "pacifier") cibles = dispo.pacifier;
		else {
			const k = dispo.competences.find((x) => x.comp.id === v.comp)!.comp;
			cibles = k.cible === "ennemi" ? (k.portee === "melee" ? dispo.ciblesMelee : dispo.ciblesDistance) : k.cible === "allie" ? dispo.allies : dispo.alliesKo;
		}
		proposerCibles(cibles, (id) => viser(cle, acteur, v, id));
		texte(sous, cibles.size() > 0 ? "🎯 Choisis une cible : clique sur un personnage (contour doré) ou ci-dessous." : "Aucune cible possible.", 14, { couleur: COULEURS.or });
		const l = ligne(sous);
		for (const id of cibles) bouton(l, esc(nom(id)), () => viser(cle, acteur, v, id), { hauteur: 34, taille: 14 });
		bouton(l, "Annuler", () => {
			ui.menu = "aucun";
			proposerCibles([], undefined);
			redessiner();
		}, { hauteur: 34, taille: 14 });
	} else {
		proposerCibles([], undefined);
	}
	const choisirCible = (v: Visee) => {
		ui.visee = v;
		ui.menu = "cible";
		redessiner();
	};
	if (ui.menu === "competences") {
		const l = ligne(sous);
		for (const k of dispo.competences) {
			const info = `${k.comp.cout > 0 ? `${k.comp.cout} mana` : "gratuit"}${k.raison !== "" ? ` · ${k.raison}` : ""}`;
			bouton(
				l,
				`<b>${k.comp.nom}${k.rang > 1 ? ` ${k.rang}` : ""}</b>\n<font size="12">${info}</font>`,
				() => {
					if (k.comp.cible === "ennemi" || k.comp.cible === "allie" || k.comp.cible === "allie_ko") choisirCible({ type: "competence", comp: k.comp.id });
					else {
						ui.menu = "aucun";
						agir({ type: "combat", cle, action: { type: "competence", acteur: acteur.id, competence: k.comp.id } });
					}
				},
				{ actif: k.utilisable, largeur: new UDim(0, 196), hauteur: 52, taille: 14 },
			);
		}
		for (const k of dispo.competences) if (k.comp.description !== "") texte(sous, `<b>${k.comp.nom}</b> : ${k.comp.description}`, 12, { couleur: COULEURS.texte2 });
	} else if (ui.menu === "objets") {
		const l = ligne(sous);
		bouton(l, `🧪 Potion (${dispo.potions})`, () => choisirCible({ type: "potion" }), { actif: dispo.potions > 0, hauteur: 40 });
		bouton(l, `💣 Bombe (${dispo.bombes})`, () => {
			ui.menu = "aucun";
			agir({ type: "combat", cle, action: { type: "objet", acteur: acteur.id, objet: "bombe" } });
		}, { actif: dispo.bombes > 0, hauteur: 40 });
	} else if (ui.menu === "plus") {
		const l = ligne(sous);
		bouton(l, `↔ Passer au rang ${acteur.rang === "avant" ? "arrière" : "avant"}`, () => agir({ type: "combat", cle, action: { type: "changer_rang", acteur: acteur.id } }), { hauteur: 40 });
		bouton(l, "🙈 Se cacher", () => agir({ type: "combat", cle, action: { type: "se_cacher", acteur: acteur.id } }), { hauteur: 40 });
		if (dispo.pacifier.size() > 0) bouton(l, "🕊 Pacifier", () => choisirCible({ type: "pacifier" }), { hauteur: 40 });
		if (dispo.fuite) bouton(l, "🏃 Fuir", () => agir({ type: "combat", cle, action: { type: "fuir", acteur: acteur.id } }), { hauteur: 40 });
		const h = monHeros();
		if (h && h.don === "second-depart" && etat.secondDepart[h.id] !== etat.session && combat.instantane !== undefined) {
			bouton(l, "⟲ Second départ", () => agir({ type: "second_depart", cle }), { hauteur: 40 });
		}
	} else if (ui.menu === "conseils") {
		const ctx = contexte(combat, acteur);
		const props = propositionsScript(ctx);
		if (props.size() === 0) texte(sous, "Aucune proposition.", 14, { couleur: COULEURS.texte2 });
		props.forEach((p, i) => carteProposition(sous, cle, p, i === 0));
	} else if (ui.menu === "proposer") {
		menuProposer(sous, cle, combat, acteur, redessiner);
	}

	// gros boutons
	const ouvrir = (m: Menu) => () => {
		ui.menu = ui.menu === m ? "aucun" : m;
		redessiner();
	};
	const l = ligne(bas, 6);
	grosBouton(l, "⚔", "Attaquer", () => choisirCible({ type: "attaque" }), { choisi: ui.menu === "cible" && ui.visee?.type === "attaque" });
	grosBouton(l, "✨", "Compétences", ouvrir("competences"), { choisi: ui.menu === "competences" });
	grosBouton(l, "🎒", "Objets", ouvrir("objets"), { choisi: ui.menu === "objets" });
	grosBouton(l, "🛡", "Défendre", () => agir({ type: "combat", cle, action: { type: "defendre", acteur: acteur.id } }));
	grosBouton(l, "💬", "Proposer", ouvrir("proposer"), { choisi: ui.menu === "proposer" });
	grosBouton(l, "📜", "Conseils", ouvrir("conseils"), { choisi: ui.menu === "conseils" });
	grosBouton(l, "⋯", "Plus", ouvrir("plus"), { choisi: ui.menu === "plus" });
}

function contexte(combat: Combat, acteur: Combattant): ContexteIA {
	const etat = jeu.etat!;
	const heros = acteur.herosId !== undefined ? etat.heros[acteur.herosId] : undefined;
	return { contenu: CONTENU, combat, acteur: acteur.id, heros, grimoire: etat.grimoire ?? {} };
}

/** « Proposer mon action » : texte libre compris par l'IA maison, 3 propositions impossibles par tour au plus. */
function menuProposer(parent: Instance, cle: string, combat: Combat, acteur: Combattant, redessiner: () => void) {
	const ctx = contexte(combat, acteur);
	const cleEssais = `${combat.id}:${combat.tour}:${acteur.id}`;
	const essais = affichage.essais.get(cleEssais) ?? 0;
	if (essais >= ESSAIS_MAX) {
		texte(parent, "Trois propositions impossibles ce tour-ci : choisis parmi les conseils du jeu. Tu pourras de nouveau proposer au prochain tour.", 14, { couleur: COULEURS.or });
		propositionsScript(ctx).forEach((p, i) => carteProposition(parent, cle, p, i === 0));
		return;
	}
	const l = ligne(parent);
	const boite = champ(l, "💬 Ex. : je vise la tête du loup · je combine feu et glace · je me cache", affichage.texteLibre, (v) => (affichage.texteLibre = v), new UDim(1, -120));
	const proposer = () => {
		if (affichage.texteLibre.gsub("%s", "")[0].size() === 0) return;
		const rep = interpreter(ctx, affichage.texteLibre);
		ui.reponse = rep;
		if (rep.compteCommeEssai) affichage.essais.set(cleEssais, essais + 1);
		redessiner();
	};
	boite.FocusLost.Connect((entree) => {
		if (entree) proposer();
	});
	bouton(l, "Proposer", proposer, { principal: true, hauteur: 40 });
	texte(parent, `Propositions impossibles ce tour-ci : ${essais} / ${ESSAIS_MAX}`, 12, { couleur: COULEURS.texte2 });
	const rep = ui.reponse;
	if (!rep) return;
	texte(parent, rep.message, 15, { couleur: rep.possible ? COULEURS.vert : COULEURS.rouge });
	if (rep.proposition && rep.possible) carteProposition(parent, cle, rep.proposition, true, "Valider");
	for (const info of rep.informations) texte(parent, `🔎 ${info}`, 14);
	for (const p of rep.alternatives) carteProposition(parent, cle, p, false);
}
