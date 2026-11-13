/**
 * Scène de dialogue (comme src/ui/vues/Dialogue.svelte) : répliques une par une, choix votés en groupe,
 * tests de caractéristique, passage au combat.
 */
import { CONTENU } from "shared/donnees";
import { choixVisibles, conditionScene, miseDuChoix, noeudCourant, remplacerVariables, type EtatPartie } from "shared/moteur";
import { affichage } from "../local";
import { agir, jeu, monHeros } from "../partie";
import { bouton, carte, COULEURS, esc, ligne, texte } from "./kit";

const NOMS_CARACS: Record<string, string> = { FOR: "Force", AGI: "Agilité", INT: "Intelligence", VIT: "Vitalité", ESP: "Esprit", CHA: "Charisme" };

function nomPersonnage(etat: EtatPartie, qui: string, heros: string[]): string {
	if (qui === "narrateur") return "";
	if (qui === "heros" || qui === "meneur") return heros.map((h) => esc(etat.heros[h]?.nom ?? "?")).join(", ");
	return CONTENU.compagnons[qui]?.nom ?? CONTENU.pnj[qui]?.nom ?? qui;
}

export function vueDialogue(parent: Frame, cle: string, redessiner: () => void) {
	const etat = jeu.etat!;
	const es = etat.scenes[cle];
	const scene = CONTENU.scenes[es.sceneId];
	const noeud = noeudCourant(CONTENU, etat, cle);
	const repliques = noeud ? noeud.repliques.filter((r) => conditionScene(CONTENU, etat, r.si, es.heros)) : [];
	const k = `${es.sceneId}:${es.noeud}`;
	if (affichage.replique.cle !== k) affichage.replique = { cle: k, vues: 1 };
	const vues = affichage.replique.vues;
	const toutVu = vues >= repliques.size();
	const groupe = cle === "groupe";
	const fini = es.noeud === "__fin__";
	const combatEnAttente = etat.combats[groupe ? "groupe" : cle] !== undefined;
	const txt = (t: string) => remplacerVariables(CONTENU, etat, t, es.heros);

	const c = carte(parent);
	texte(c, `${scene.titre}${groupe ? '  <font color="#beaf96">· scène de groupe</font>' : ""}`, 20, { gras: true, couleur: COULEURS.or });

	if (vues === 1 && es.dernierTest) {
		const t = es.dernierTest;
		texte(
			c,
			`Test de ${NOMS_CARACS[t.carac]} (${esc(etat.heros[t.heros]?.nom ?? "?")}) : dé ${t.jet} + ${t.total - t.jet} = <b>${t.total}</b> contre ${t.difficulte} → ${t.reussi ? "réussite !" : "échec."}`,
			15,
			{ couleur: t.reussi ? COULEURS.vert : COULEURS.rouge },
		);
	}
	if (vues === 1) for (const m of es.messages) texte(c, `• ${m}`, 14, { couleur: COULEURS.or });

	const r = repliques[math.min(vues, repliques.size()) - 1];
	if (r) {
		const qui = nomPersonnage(etat, r.qui, es.heros);
		if (qui !== "") texte(c, qui, 16, { gras: true, couleur: COULEURS.or });
		texte(c, r.qui === "narrateur" ? `<i>${txt(r.dit)}</i>` : txt(r.dit), 18);
		if (!toutVu) {
			bouton(
				c,
				`Continuer ▸ (${vues}/${repliques.size()})`,
				() => {
					affichage.replique.vues += 1;
					redessiner();
				},
				{ hauteur: 34 },
			);
		}
	}
	if (!toutVu) return;

	if (fini) {
		bouton(c, "Terminer la scène", () => agir({ type: "quitter_scene", cle }), { principal: true });
		return;
	}
	// un personnage s'adresse à un joueur précis : lui seul répond
	const parole = es.parole;
	if (parole && noeud?.parole_a) {
		const q = noeud.parole_a.question;
		const dire = (t: string) => remplacerVariables(CONTENU, etat, t, es.heros, parole.heros);
		const qui = nomPersonnage(etat, q.qui, es.heros);
		if (qui !== "") texte(c, qui, 16, { gras: true, couleur: COULEURS.or });
		texte(c, dire(q.dit), 18);
		const interroge = etat.heros[parole.heros];
		if (monHeros()?.id === parole.heros) {
			texte(c, "C'est à toi de répondre :", 14, { couleur: COULEURS.or });
			for (const i of parole.reponses) bouton(c, dire(noeud.parole_a.reponses[i].texte), () => agir({ type: "repondre", cle, index: i }), { largeur: new UDim(1, 0), hauteur: 40, taille: 15 });
		} else {
			const pseudo = etat.joueurs[interroge?.joueurId ?? ""]?.pseudo ?? "?";
			texte(c, `<i>${esc(interroge?.nom ?? "?")} (${esc(pseudo)}) réfléchit à sa réponse…</i>`, 15, { couleur: COULEURS.texte2 });
		}
		return;
	}
	if (combatEnAttente) {
		bouton(
			c,
			"⚔ Au combat !",
			() => {
				affichage.combatsVus.add(etat.combats[groupe ? "groupe" : cle].combat.id);
				redessiner();
			},
			{ principal: true },
		);
		return;
	}
	const choix = choixVisibles(CONTENU, etat, cle);
	if (choix.size() > 0) {
		const presents = etat.ordreJoueurs.filter((j) => etat.joueurs[j].present && etat.joueurs[j].herosId !== undefined);
		for (const ch of choix) {
			const l = ligne(c);
			const votants: string[] = [];
			for (const [j, v] of pairs(es.votes)) if (v === ch.index) votants.push(esc(etat.joueurs[j]?.pseudo ?? "?"));
			const test = ch.choix.test ? ` <font color="#beaf96">[test de ${NOMS_CARACS[ch.choix.test.carac]}]</font>` : "";
			// pari : la mise sort vraiment du porte-monnaie
			const mise = miseDuChoix(ch.choix);
			const orDispo = monHeros()?.or ?? 0;
			const pari = mise > 0 ? ` <font color="#d9a441">[mise ${mise} or${orDispo < mise ? " — pas assez d'or" : ""}]</font>` : "";
			texte(l, `${txt(ch.choix.texte)}${test}${pari}${ch.possible ? "" : ' <font color="#c4483c">(indisponible)</font>'}${groupe && votants.size() > 0 ? `\n<font color="#d9a441">Votes : ${votants.join(", ")}</font>` : ""}`, 15, { largeur: new UDim(1, -110) });
			bouton(l, groupe ? "Voter" : "Choisir", () => agir({ type: "choisir", cle, index: ch.index }), { actif: ch.possible && orDispo >= mise, choisi: es.votes[jeu.moi] === ch.index, hauteur: 34 });
		}
		if (groupe) {
			const attente = presents.filter((j) => es.votes[j] === undefined).map((j) => esc(etat.joueurs[j].pseudo));
			texte(c, `En attente des votes : ${attente.size() > 0 ? attente.join(", ") : "personne"}.`, 13, { couleur: COULEURS.texte2 });
			let nbVotes = 0;
			for (const [,] of pairs(es.votes)) nbVotes++;
			if (etat.meneur === jeu.moi && nbVotes > 0) bouton(c, "Trancher (meneur)", () => agir({ type: "trancher", cle }), { hauteur: 32, taille: 14 });
		}
	} else if (noeud?.suite !== undefined) {
		bouton(c, "Continuer", () => agir({ type: "continuer", cle }), { principal: true });
	}
}
