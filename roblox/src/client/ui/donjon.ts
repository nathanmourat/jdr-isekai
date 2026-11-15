/**
 * Panneau d'exploration d'un donjon (comme src/ui/vues/DonjonVue.svelte). On marche avec son avatar :
 * le meneur du jour (n'importe quel joueur présent s'il est absent) porte le groupe, et les événements
 * se déclenchent sous ses pieds (client/rendu/donjon3d.ts). Ce panneau montre les messages du donjon.
 */
import { CONTENU } from "shared/donnees";
import { jeu } from "../partie";
import { peutGuider, rejoindreGroupe } from "../rendu/donjon3d";
import { bouton, carte, COULEURS, esc, texte } from "./kit";

export function vueDonjon(parent: Frame) {
	const etat = jeu.etat!;
	const dj = etat.donjon!;
	const c = carte(parent, CONTENU.donjons[dj.id].nom);
	texte(
		c,
		peutGuider()
			? "Tu guides le groupe : marche, les événements se déclenchent sous tes pieds (lueur dorée)."
			: `${esc(etat.joueurs[etat.meneur ?? ""]?.pseudo ?? "Le meneur")} guide le groupe : la lueur dorée montre où il est.`,
		14,
		{ couleur: COULEURS.texte2 },
	);
	if (dj.messages.size() === 0) texte(c, "Le groupe avance prudemment…", 15);
	for (const m of dj.messages) texte(c, m, 15);
	bouton(c, "Rejoindre le groupe", () => rejoindreGroupe(), { hauteur: 32, taille: 14 });
}
