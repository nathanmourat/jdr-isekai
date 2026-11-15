/**
 * Panneau « 🛡 Modération » (visible pour les modérateurs, administrateurs et le propriétaire).
 * On choisit un joueur, une raison, puis une action ; seuls les boutons permis par son grade apparaissent.
 * Le serveur revérifie tout (shared/grades.ts, server/moderation.ts).
 */
import { Players } from "@rbxts/services";
import {
	aPermission,
	BAN_DEFINITIF,
	DUREES_BAN,
	DUREES_MUET,
	NOMS_GRADES,
	peutAgirSur,
	RAISONS,
	texteDuree,
	type Grade,
} from "shared/grades";
import { commandeModeration, jeu } from "../partie";
import { bouton, carte, champ, COULEURS, esc, ligne, texte } from "./kit";
import { tr, trf, tx } from "shared/langue";

const etat = { choisi: undefined as number | undefined, raison: 0, annonce: "", arret: false };

const DESCRIPTIONS: Record<Grade, string> = {
	joueur: "",
	moderateur: tx("Avertir, couper le chat (5 à 60 min), figer, aller vers un joueur, le renvoyer du serveur, lire le journal et les signalements."),
	admin: tx("Tout ce que fait un modérateur, plus : amener un joueur, bannir (1 h à 7 jours), débannir, faire une annonce, nommer des modérateurs."),
	proprietaire: tx("Tout : bannir définitivement, nommer des administrateurs, arrêter le serveur, outils de jeu (or, XP). Personne ne peut agir sur toi."),
};

function dateCourte(t: number): string {
	return os.date("%d/%m %H:%M", t);
}

export function vueModeration(parent: Frame, redessiner: () => void) {
	const m = jeu.moderation;
	if (!m || m.grade === "joueur") {
		texte(parent, tr("Réservé à l'équipe de modération."), 15);
		return;
	}
	const g = m.grade;
	const p = (x: Parameters<typeof aPermission>[1]) => aPermission(g, x);

	const intro = carte(parent, trf("🛡 Ton grade : {v}", { v: tr(NOMS_GRADES[g]) }));
	texte(intro, tr(DESCRIPTIONS[g]), 14, { couleur: COULEURS.texte2 });

	// ─── joueurs du serveur ───
	const autres = (m.joueurs ?? []).filter((x) => x.id !== Players.LocalPlayer.UserId);
	const lj = carte(parent, trf("Joueurs sur ce serveur ({v})", { v: autres.size() }));
	if (autres.size() === 0) texte(lj, tr("Personne d'autre pour l'instant."), 14, { couleur: COULEURS.texte2 });
	for (const x of autres) {
		const etats = `${x.muet ? tr(" · 🔇 chat coupé") : ""}${x.fige ? tr(" · 🧊 figé") : ""}`;
		const l = ligne(lj, 8);
		texte(l, trf("<b>{esc}</b> — {v}{etats}", { esc: esc(x.nom), v: tr(NOMS_GRADES[x.grade]), etats }), 15, { largeur: new UDim(1, -120) });
		bouton(l, etat.choisi === x.id ? tr("▾ Choisi") : tr("Choisir"), () => ((etat.choisi = etat.choisi === x.id ? undefined : x.id), redessiner()), {
			hauteur: 30,
			taille: 14,
			choisi: etat.choisi === x.id,
		});
	}

	const cible = autres.find((x) => x.id === etat.choisi);
	if (cible) {
		const ac = carte(parent, trf("Actions sur {esc}", { esc: esc(cible.nom) }));
		if (!peutAgirSur(g, cible.grade)) {
			texte(ac, trf("{esc} a un grade égal ou supérieur au tien : tu ne peux pas agir sur lui.", { esc: esc(cible.nom) }), 14, { couleur: COULEURS.rouge });
		} else {
			texte(ac, tr("Raison :"), 14, { couleur: COULEURS.texte2 });
			const lr = ligne(ac, 6);
			RAISONS.forEach((rs, i) => bouton(lr, tr(rs), () => ((etat.raison = i), redessiner()), { hauteur: 28, taille: 12, choisi: etat.raison === i }));
			const id = cible.id;
			const raison = etat.raison;
			const l1 = ligne(ac, 6);
			if (p("avertir")) bouton(l1, tr("⚠ Avertir"), () => commandeModeration({ type: "avertir", cible: id, raison }), { hauteur: 30, taille: 14 });
			if (p("aller_vers")) bouton(l1, tr("➜ Aller vers"), () => commandeModeration({ type: "aller_vers", cible: id }), { hauteur: 30, taille: 14 });
			if (p("amener")) bouton(l1, tr("⇠ Amener ici"), () => commandeModeration({ type: "amener", cible: id }), { hauteur: 30, taille: 14 });
			if (p("figer")) bouton(l1, cible.fige ? tr("Libérer") : tr("🧊 Figer"), () => commandeModeration({ type: "figer", cible: id, oui: !cible.fige }), { hauteur: 30, taille: 14 });
			if (p("muet")) {
				const l2 = ligne(ac, 6);
				if (cible.muet) bouton(l2, tr("🔊 Rendre le chat"), () => commandeModeration({ type: "rendre_parole", cible: id }), { hauteur: 30, taille: 14 });
				else for (const d of DUREES_MUET) bouton(l2, trf("🔇 Chat {texteDuree}", { texteDuree: texteDuree(d) }), () => commandeModeration({ type: "muet", cible: id, minutes: d, raison }), { hauteur: 30, taille: 14 });
			}
			const l3 = ligne(ac, 6);
			if (p("renvoyer")) bouton(l3, tr("Renvoyer du serveur"), () => commandeModeration({ type: "renvoyer", cible: id, raison }), { hauteur: 30, taille: 14 });
			if (p("bannir_temporaire")) for (const d of DUREES_BAN) bouton(l3, trf("Bannir {texteDuree}", { texteDuree: texteDuree(d) }), () => commandeModeration({ type: "bannir", cible: id, minutes: d, raison }), { hauteur: 30, taille: 14 });
			if (p("bannir_definitif")) bouton(l3, tr("⛔ Bannir définitivement"), () => commandeModeration({ type: "bannir", cible: id, minutes: BAN_DEFINITIF, raison }), { hauteur: 30, taille: 14 });
			// grades
			if (p("nommer_moderateur")) {
				const l4 = ligne(ac, 6);
				texte(l4, tr("Grade :"), 14, { largeur: new UDim(0, 60), couleur: COULEURS.texte2 });
				const possibles: Grade[] = p("nommer_admin") ? ["joueur", "moderateur", "admin"] : ["joueur", "moderateur"];
				for (const gr of possibles) bouton(l4, tr(NOMS_GRADES[gr]), () => commandeModeration({ type: "nommer", cible: id, grade: gr }), { hauteur: 28, taille: 13, choisi: cible.grade === gr });
			}
			// outils du propriétaire
			if (p("outils_jeu")) {
				const l5 = ligne(ac, 6);
				texte(l5, tr("Cadeau :"), 14, { largeur: new UDim(0, 60), couleur: COULEURS.texte2 });
				bouton(l5, tr("+100 or"), () => commandeModeration({ type: "cadeau", cible: id, or: 100 }), { hauteur: 28, taille: 13 });
				bouton(l5, tr("+1000 or"), () => commandeModeration({ type: "cadeau", cible: id, or: 1000 }), { hauteur: 28, taille: 13 });
				bouton(l5, tr("+500 XP"), () => commandeModeration({ type: "cadeau", cible: id, xp: 500 }), { hauteur: 28, taille: 13 });
				bouton(l5, tr("+5000 XP"), () => commandeModeration({ type: "cadeau", cible: id, xp: 5000 }), { hauteur: 28, taille: 13 });
			}
		}
	}
	// le propriétaire peut aussi se faire des cadeaux (tests)
	if (p("outils_jeu")) {
		const moi = Players.LocalPlayer.UserId;
		const ot = carte(parent, tr("Outils du propriétaire"));
		const l = ligne(ot, 6);
		texte(l, tr("Pour toi :"), 14, { largeur: new UDim(0, 70), couleur: COULEURS.texte2 });
		bouton(l, tr("+1000 or"), () => commandeModeration({ type: "cadeau", cible: moi, or: 1000 }), { hauteur: 28, taille: 13 });
		bouton(l, tr("+5000 XP"), () => commandeModeration({ type: "cadeau", cible: moi, xp: 5000 }), { hauteur: 28, taille: 13 });
		if (p("arreter_serveur")) {
			if (!etat.arret) bouton(ot, tr("Arrêter le serveur…"), () => ((etat.arret = true), redessiner()), { hauteur: 30, taille: 14 });
			else {
				const la = ligne(ot, 6);
				texte(la, tr("Tout le monde sera renvoyé dans 10 s (progression sauvegardée)."), 14, { couleur: COULEURS.rouge, largeur: new UDim(1, -220) });
				bouton(la, tr("Confirmer"), () => ((etat.arret = false), commandeModeration({ type: "arreter_serveur" })), { hauteur: 30, taille: 14, principal: true });
				bouton(la, tr("Annuler"), () => ((etat.arret = false), redessiner()), { hauteur: 30, taille: 14 });
			}
		}
	}

	// ─── annonce ───
	if (p("annonce")) {
		const an = carte(parent, tr("Annonce à tout le serveur"));
		const l = ligne(an, 6);
		champ(l, tr("Ton message (200 caractères au plus)"), etat.annonce, (v) => (etat.annonce = v), new UDim(1, -110));
		bouton(l, tr("Envoyer"), () => {
			commandeModeration({ type: "annonce", texte: etat.annonce });
			etat.annonce = "";
			redessiner();
		}, { hauteur: 34, taille: 14, principal: true });
	}

	// ─── équipe de modération ───
	const eq = m.equipe ?? [];
	const ce = carte(parent, tr("Équipe de modération"));
	texte(ce, tr("👑 Le propriétaire (créateur du jeu) n'a pas besoin d'être nommé."), 13, { couleur: COULEURS.texte2 });
	if (eq.size() === 0) texte(ce, tr("Personne n'a encore été nommé."), 14, { couleur: COULEURS.texte2 });
	for (const x of eq) {
		const l = ligne(ce, 8);
		texte(l, trf("<b>{esc}</b> — {v}", { esc: esc(x.nom), v: tr(NOMS_GRADES[x.grade]) }), 15, { largeur: new UDim(1, -130) });
		const perm = x.grade === "admin" ? "nommer_admin" : "nommer_moderateur";
		if (p(perm) && peutAgirSur(g, x.grade)) bouton(l, tr("Retirer le grade"), () => commandeModeration({ type: "nommer", cible: x.id, grade: "joueur" }), { hauteur: 28, taille: 13 });
	}

	// ─── bannis ───
	if (m.bannis) {
		const cb = carte(parent, trf("Bannis ({v})", { v: m.bannis.size() }));
		if (m.bannis.size() === 0) texte(cb, tr("Personne n'est banni."), 14, { couleur: COULEURS.texte2 });
		for (const b of m.bannis) {
			const l = ligne(cb, 8);
			const quand = b.jusqua === BAN_DEFINITIF ? tr("définitif") : `jusqu'au ${dateCourte(b.jusqua)}`;
			texte(l, trf("<b>{esc}</b> — {quand} · {esc2}", { esc: esc(b.nom), quand, esc2: esc(tr(b.raison)) }), 14, { largeur: new UDim(1, -110) });
			if (b.jusqua !== BAN_DEFINITIF || p("bannir_definitif")) bouton(l, tr("Débannir"), () => commandeModeration({ type: "debannir", cible: b.id }), { hauteur: 28, taille: 13 });
		}
	}

	// ─── journal ───
	if (m.journal) {
		const cj = carte(parent, tr("Journal de modération (60 derniers)"));
		if (m.journal.size() === 0) texte(cj, tr("Rien pour l'instant."), 14, { couleur: COULEURS.texte2 });
		for (const e of m.journal) {
			const sig = e.action === "signalement";
			texte(
				cj,
				trf("<font color=\"#9a8a70\">{dateCourte}</font> {v} <b>{esc}</b> : {esc2}{v2}{v3}", { dateCourte: dateCourte(e.t), v: sig ? "🚩" : "•", esc: esc(e.par), esc2: esc(e.action), v2: e.cible !== undefined ? trf(" → <b>{esc}</b>", { esc: esc(e.cible) }) : "", v3: e.detail !== undefined ? ` (${esc(e.detail)})` : "" }),
				13,
			);
		}
	}
}
