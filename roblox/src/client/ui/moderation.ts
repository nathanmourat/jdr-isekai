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

const etat = { choisi: undefined as number | undefined, raison: 0, annonce: "", arret: false };

const DESCRIPTIONS: Record<Grade, string> = {
	joueur: "",
	moderateur: "Avertir, couper le chat (5 à 60 min), figer, aller vers un joueur, le renvoyer du serveur, lire le journal et les signalements.",
	admin: "Tout ce que fait un modérateur, plus : amener un joueur, bannir (1 h à 7 jours), débannir, faire une annonce, nommer des modérateurs.",
	proprietaire: "Tout : bannir définitivement, nommer des administrateurs, arrêter le serveur, outils de jeu (or, XP). Personne ne peut agir sur toi.",
};

function dateCourte(t: number): string {
	return os.date("%d/%m %H:%M", t);
}

export function vueModeration(parent: Frame, redessiner: () => void) {
	const m = jeu.moderation;
	if (!m || m.grade === "joueur") {
		texte(parent, "Réservé à l'équipe de modération.", 15);
		return;
	}
	const g = m.grade;
	const p = (x: Parameters<typeof aPermission>[1]) => aPermission(g, x);

	const intro = carte(parent, `🛡 Ton grade : ${NOMS_GRADES[g]}`);
	texte(intro, DESCRIPTIONS[g], 14, { couleur: COULEURS.texte2 });

	// ─── joueurs du serveur ───
	const autres = (m.joueurs ?? []).filter((x) => x.id !== Players.LocalPlayer.UserId);
	const lj = carte(parent, `Joueurs sur ce serveur (${autres.size()})`);
	if (autres.size() === 0) texte(lj, "Personne d'autre pour l'instant.", 14, { couleur: COULEURS.texte2 });
	for (const x of autres) {
		const etats = `${x.muet ? " · 🔇 chat coupé" : ""}${x.fige ? " · 🧊 figé" : ""}`;
		const l = ligne(lj, 8);
		texte(l, `<b>${esc(x.nom)}</b> — ${NOMS_GRADES[x.grade]}${etats}`, 15, { largeur: new UDim(1, -120) });
		bouton(l, etat.choisi === x.id ? "▾ Choisi" : "Choisir", () => ((etat.choisi = etat.choisi === x.id ? undefined : x.id), redessiner()), {
			hauteur: 30,
			taille: 14,
			choisi: etat.choisi === x.id,
		});
	}

	const cible = autres.find((x) => x.id === etat.choisi);
	if (cible) {
		const ac = carte(parent, `Actions sur ${esc(cible.nom)}`);
		if (!peutAgirSur(g, cible.grade)) {
			texte(ac, `${esc(cible.nom)} a un grade égal ou supérieur au tien : tu ne peux pas agir sur lui.`, 14, { couleur: COULEURS.rouge });
		} else {
			texte(ac, "Raison :", 14, { couleur: COULEURS.texte2 });
			const lr = ligne(ac, 6);
			RAISONS.forEach((rs, i) => bouton(lr, rs, () => ((etat.raison = i), redessiner()), { hauteur: 28, taille: 12, choisi: etat.raison === i }));
			const id = cible.id;
			const raison = etat.raison;
			const l1 = ligne(ac, 6);
			if (p("avertir")) bouton(l1, "⚠ Avertir", () => commandeModeration({ type: "avertir", cible: id, raison }), { hauteur: 30, taille: 14 });
			if (p("aller_vers")) bouton(l1, "➜ Aller vers", () => commandeModeration({ type: "aller_vers", cible: id }), { hauteur: 30, taille: 14 });
			if (p("amener")) bouton(l1, "⇠ Amener ici", () => commandeModeration({ type: "amener", cible: id }), { hauteur: 30, taille: 14 });
			if (p("figer")) bouton(l1, cible.fige ? "Libérer" : "🧊 Figer", () => commandeModeration({ type: "figer", cible: id, oui: !cible.fige }), { hauteur: 30, taille: 14 });
			if (p("muet")) {
				const l2 = ligne(ac, 6);
				if (cible.muet) bouton(l2, "🔊 Rendre le chat", () => commandeModeration({ type: "rendre_parole", cible: id }), { hauteur: 30, taille: 14 });
				else for (const d of DUREES_MUET) bouton(l2, `🔇 Chat ${texteDuree(d)}`, () => commandeModeration({ type: "muet", cible: id, minutes: d, raison }), { hauteur: 30, taille: 14 });
			}
			const l3 = ligne(ac, 6);
			if (p("renvoyer")) bouton(l3, "Renvoyer du serveur", () => commandeModeration({ type: "renvoyer", cible: id, raison }), { hauteur: 30, taille: 14 });
			if (p("bannir_temporaire")) for (const d of DUREES_BAN) bouton(l3, `Bannir ${texteDuree(d)}`, () => commandeModeration({ type: "bannir", cible: id, minutes: d, raison }), { hauteur: 30, taille: 14 });
			if (p("bannir_definitif")) bouton(l3, "⛔ Bannir définitivement", () => commandeModeration({ type: "bannir", cible: id, minutes: BAN_DEFINITIF, raison }), { hauteur: 30, taille: 14 });
			// grades
			if (p("nommer_moderateur")) {
				const l4 = ligne(ac, 6);
				texte(l4, "Grade :", 14, { largeur: new UDim(0, 60), couleur: COULEURS.texte2 });
				const possibles: Grade[] = p("nommer_admin") ? ["joueur", "moderateur", "admin"] : ["joueur", "moderateur"];
				for (const gr of possibles) bouton(l4, NOMS_GRADES[gr], () => commandeModeration({ type: "nommer", cible: id, grade: gr }), { hauteur: 28, taille: 13, choisi: cible.grade === gr });
			}
			// outils du propriétaire
			if (p("outils_jeu")) {
				const l5 = ligne(ac, 6);
				texte(l5, "Cadeau :", 14, { largeur: new UDim(0, 60), couleur: COULEURS.texte2 });
				bouton(l5, "+100 or", () => commandeModeration({ type: "cadeau", cible: id, or: 100 }), { hauteur: 28, taille: 13 });
				bouton(l5, "+1000 or", () => commandeModeration({ type: "cadeau", cible: id, or: 1000 }), { hauteur: 28, taille: 13 });
				bouton(l5, "+500 XP", () => commandeModeration({ type: "cadeau", cible: id, xp: 500 }), { hauteur: 28, taille: 13 });
				bouton(l5, "+5000 XP", () => commandeModeration({ type: "cadeau", cible: id, xp: 5000 }), { hauteur: 28, taille: 13 });
			}
		}
	}
	// le propriétaire peut aussi se faire des cadeaux (tests)
	if (p("outils_jeu")) {
		const moi = Players.LocalPlayer.UserId;
		const ot = carte(parent, "Outils du propriétaire");
		const l = ligne(ot, 6);
		texte(l, "Pour toi :", 14, { largeur: new UDim(0, 70), couleur: COULEURS.texte2 });
		bouton(l, "+1000 or", () => commandeModeration({ type: "cadeau", cible: moi, or: 1000 }), { hauteur: 28, taille: 13 });
		bouton(l, "+5000 XP", () => commandeModeration({ type: "cadeau", cible: moi, xp: 5000 }), { hauteur: 28, taille: 13 });
		if (p("arreter_serveur")) {
			if (!etat.arret) bouton(ot, "Arrêter le serveur…", () => ((etat.arret = true), redessiner()), { hauteur: 30, taille: 14 });
			else {
				const la = ligne(ot, 6);
				texte(la, "Tout le monde sera renvoyé dans 10 s (progression sauvegardée).", 14, { couleur: COULEURS.rouge, largeur: new UDim(1, -220) });
				bouton(la, "Confirmer", () => ((etat.arret = false), commandeModeration({ type: "arreter_serveur" })), { hauteur: 30, taille: 14, principal: true });
				bouton(la, "Annuler", () => ((etat.arret = false), redessiner()), { hauteur: 30, taille: 14 });
			}
		}
	}

	// ─── annonce ───
	if (p("annonce")) {
		const an = carte(parent, "Annonce à tout le serveur");
		const l = ligne(an, 6);
		champ(l, "Ton message (200 caractères au plus)", etat.annonce, (v) => (etat.annonce = v), new UDim(1, -110));
		bouton(l, "Envoyer", () => {
			commandeModeration({ type: "annonce", texte: etat.annonce });
			etat.annonce = "";
			redessiner();
		}, { hauteur: 34, taille: 14, principal: true });
	}

	// ─── équipe de modération ───
	const eq = m.equipe ?? [];
	const ce = carte(parent, "Équipe de modération");
	texte(ce, "👑 Le propriétaire (créateur du jeu) n'a pas besoin d'être nommé.", 13, { couleur: COULEURS.texte2 });
	if (eq.size() === 0) texte(ce, "Personne n'a encore été nommé.", 14, { couleur: COULEURS.texte2 });
	for (const x of eq) {
		const l = ligne(ce, 8);
		texte(l, `<b>${esc(x.nom)}</b> — ${NOMS_GRADES[x.grade]}`, 15, { largeur: new UDim(1, -130) });
		const perm = x.grade === "admin" ? "nommer_admin" : "nommer_moderateur";
		if (p(perm) && peutAgirSur(g, x.grade)) bouton(l, "Retirer le grade", () => commandeModeration({ type: "nommer", cible: x.id, grade: "joueur" }), { hauteur: 28, taille: 13 });
	}

	// ─── bannis ───
	if (m.bannis) {
		const cb = carte(parent, `Bannis (${m.bannis.size()})`);
		if (m.bannis.size() === 0) texte(cb, "Personne n'est banni.", 14, { couleur: COULEURS.texte2 });
		for (const b of m.bannis) {
			const l = ligne(cb, 8);
			const quand = b.jusqua === BAN_DEFINITIF ? "définitif" : `jusqu'au ${dateCourte(b.jusqua)}`;
			texte(l, `<b>${esc(b.nom)}</b> — ${quand} · ${esc(b.raison)}`, 14, { largeur: new UDim(1, -110) });
			if (b.jusqua !== BAN_DEFINITIF || p("bannir_definitif")) bouton(l, "Débannir", () => commandeModeration({ type: "debannir", cible: b.id }), { hauteur: 28, taille: 13 });
		}
	}

	// ─── journal ───
	if (m.journal) {
		const cj = carte(parent, "Journal de modération (60 derniers)");
		if (m.journal.size() === 0) texte(cj, "Rien pour l'instant.", 14, { couleur: COULEURS.texte2 });
		for (const e of m.journal) {
			const sig = e.action === "signalement";
			texte(
				cj,
				`<font color="#9a8a70">${dateCourte(e.t)}</font> ${sig ? "🚩" : "•"} <b>${esc(e.par)}</b> : ${esc(e.action)}${e.cible !== undefined ? ` → <b>${esc(e.cible)}</b>` : ""}${e.detail !== undefined ? ` (${esc(e.detail)})` : ""}`,
				13,
			);
		}
	}
}
