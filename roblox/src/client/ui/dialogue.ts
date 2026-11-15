/**
 * Scène de dialogue (comme src/ui/vues/Dialogue.svelte) : répliques une par une, choix votés en groupe,
 * tests de caractéristique, passage au combat.
 * Tests 3 et 4 du web : « Continuer » attend que tout le groupe soit prêt (le meneur peut passer après 20 s),
 * résultat du vote et réponse montrés 3 s, prix des choix payants, raisons des choix grisés, pari partagé.
 */
import { CONTENU } from "shared/donnees";
import {
	choixVisibles,
	conditionScene,
	joueursAttendusDialogue,
	joueursDuPari,
	miseDuChoix,
	noeudAffiche,
	noeudCourant,
	partMinimaleDePari,
	partsDeMise,
	remplacerVariables,
	type Choix,
	type EtatPartie,
} from "shared/moteur";
import { affichage } from "../local";
import { agir, jeu, monHeros } from "../partie";
import { bouton, carte, COULEURS, esc, ligne, texte } from "./kit";

const NOMS_CARACS: Record<string, string> = { FOR: "Force", AGI: "Agilité", INT: "Intelligence", VIT: "Vitalité", ESP: "Esprit", CHA: "Charisme" };

/** Quand le résultat d'un vote (ou une réponse) a été vu, et quand « Continuer » a commencé à attendre. */
const minuterie = { resultat: "", resultatJusqua: 0, attente: "", attenteDepuis: 0 };

/** Prix d'un choix payant (or retiré par ses effets), ajouté au texte s'il n'y est pas déjà écrit. */
function prixDuChoix(etat: EtatPartie, ch: Choix): number {
	let prix = 0;
	for (const e of ch.effets) {
		if (e.or !== undefined && e.or < 0) prix -= e.or;
		if (e.prix_chapitre !== undefined) prix += e.prix_chapitre * etat.chapitre;
	}
	return prix;
}

/** Pourquoi un choix est grisé (surtout le manque d'or). */
function raisonIndispo(etat: EtatPartie, ch: Choix, heros: string[]): string {
	const si = ch.si as { or_min?: number; or_min_chapitre?: number } | undefined;
	const min = si?.or_min ?? (si?.or_min_chapitre !== undefined ? si.or_min_chapitre * etat.chapitre : undefined);
	if (min !== undefined) return `Pas assez d'or : il faut ${min} or (${heros.map((h) => `${esc(etat.heros[h].nom)} : ${etat.heros[h].or}`).join(", ")})`;
	return "indisponible";
}

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
	// une scène terminée montre encore les répliques de son dernier nœud
	const affiche = noeudAffiche(CONTENU, etat, cle);
	const repliques = affiche ? affiche.repliques.filter((r) => conditionScene(CONTENU, etat, r.si, es.heros)) : [];
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
	// résultat du dernier vote ou de la dernière réponse, montré 3 secondes
	const pseudo = (j: string) => esc(etat.joueurs[j]?.pseudo ?? "?");
	if (es.resultatVote !== undefined || es.reponseParole !== undefined) {
		const kr = `${es.sceneId}:${es.noeud}:${etat.numeroAction}`;
		if (minuterie.resultat !== `${es.sceneId}:${es.noeud}`) {
			minuterie.resultat = `${es.sceneId}:${es.noeud}`;
			minuterie.resultatJusqua = os.clock() + 3;
			task.delay(3.05, redessiner);
		}
		void kr;
		if (os.clock() < minuterie.resultatJusqua) {
			const rv = carte(c);
			if (es.reponseParole) texte(rv, `<b>${pseudo(es.reponseParole.joueur)} a répondu :</b> « ${esc(es.reponseParole.texte)} »`, 15);
			if (es.resultatVote) {
				es.resultatVote.choix.forEach((ch, i) => {
					if (ch.joueurs.size() > 0)
						texte(rv, `${i === es.resultatVote!.retenu ? "★ " : "• "}${esc(ch.texte)} — ${ch.joueurs.map(pseudo).join(", ")}`, 14, { couleur: i === es.resultatVote!.retenu ? COULEURS.or : COULEURS.texte2 });
				});
				texte(rv, `Choix du groupe : <b>${esc(es.resultatVote.choix[es.resultatVote.retenu]?.texte ?? "")}</b>`, 15, { couleur: COULEURS.or });
			}
		}
	}

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
	// pari partagé : chaque joueur dit s'il mise ; la mise est répartie entre ceux qui misent
	if (noeud?.pari && es.pari) {
		const def = noeud.pari;
		const joueurs = joueursDuPari(etat, cle);
		const partMin = partMinimaleDePari(etat, cle, def.mise);
		const cp = carte(c, `🪙 Pari : ${def.mise} pièces pour le groupe`);
		texte(cp, `La mise est partagée entre ceux qui misent${joueurs.size() > 1 ? ` (si tout le monde mise : ${partsDeMise(def.mise, joueurs.size()).join(" + ")})` : ""}. Pari gagné : chacun récupère ${def.gain} fois sa part. Pari perdu : la part est perdue.`, 14, { couleur: COULEURS.texte2 });
		for (const j of joueurs) {
			const hj = etat.heros[etat.joueurs[j].herosId ?? ""];
			const rep = es.pari[j];
			const l = ligne(cp, 8);
			texte(l, `<b>${pseudo(j)}</b> (${esc(hj?.nom ?? "?")}, ${hj?.or ?? 0} or)${rep !== undefined ? ` — <b>${rep ? "mise" : "ne mise pas"}</b>` : ""}`, 15, { largeur: new UDim(1, -230) });
			if (rep === undefined && j === jeu.moi) {
				const manque = (hj?.or ?? 0) < partMin;
				bouton(l, "Je mise", () => agir({ type: "parier", cle, mise: true }), { principal: true, actif: !manque, hauteur: 30, taille: 14 });
				bouton(l, "Je ne mise pas", () => agir({ type: "parier", cle, mise: false }), { hauteur: 30, taille: 14 });
				if (manque) texte(cp, `Pas assez d'or : il faut au moins ${partMin} pièces pour ta part.`, 13, { couleur: COULEURS.rouge });
			} else if (rep === undefined) texte(l, "réfléchit…", 13, { couleur: COULEURS.texte2 });
		}
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
			const libelle = txt(ch.choix.texte);
			const prix = prixDuChoix(etat, ch.choix);
			const avecPrix = prix > 0 && libelle.find(" or", 1, true)[0] === undefined ? `${libelle} <font color="#d9a441">(${prix} or)</font>` : libelle;
			texte(l, `${avecPrix}${test}${pari}${ch.possible ? "" : ` <font color="#c4483c">(${raisonIndispo(etat, ch.choix, es.heros)})</font>`}${groupe && votants.size() > 0 ? `\n<font color="#d9a441">Votes : ${votants.join(", ")}</font>` : ""}`, 15, { largeur: new UDim(1, -110) });
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
		const presents = etat.ordreJoueurs.filter((j) => etat.joueurs[j].present && etat.joueurs[j].herosId !== undefined && es.heros.includes(etat.joueurs[j].herosId!));
		if (!groupe || presents.size() <= 1) {
			bouton(c, "Continuer", () => agir({ type: "continuer", cle }), { principal: true });
			return;
		}
		// en groupe : on avance quand tout le monde est prêt ; le meneur peut passer après 20 s d'attente
		const prets = es.prets ?? [];
		const attendus = joueursAttendusDialogue(etat, cle);
		const jeSuisPret = prets.includes(jeu.moi);
		const l = ligne(c, 8);
		bouton(l, jeSuisPret ? "Prêt ✔" : "Continuer", () => agir({ type: "pret_dialogue", cle }), { principal: !jeSuisPret, actif: !jeSuisPret, hauteur: 36 });
		texte(l, `Prêts : ${presents.filter((j) => prets.includes(j)).size()}/${presents.size()}${attendus.size() > 0 ? ` · en attente de ${attendus.map(pseudo).join(", ")}…` : ""}`, 14, { couleur: COULEURS.texte2, largeur: new UDim(1, -360) });
		const ka = `${es.sceneId}:${es.noeud}`;
		if (jeSuisPret && attendus.size() > 0) {
			if (minuterie.attente !== ka) {
				minuterie.attente = ka;
				minuterie.attenteDepuis = os.clock();
				task.delay(20.1, redessiner);
			}
			if (etat.meneur === jeu.moi && os.clock() - minuterie.attenteDepuis >= 20)
				bouton(l, "Passer quand même (meneur)", () => agir({ type: "continuer", cle }), { hauteur: 32, taille: 13 });
		}
	}
}
