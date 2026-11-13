/**
 * Exploration d'un donjon (comme src/ui/vues/DonjonVue.svelte) : le meneur du jour guide le groupe
 * (n'importe quel joueur présent s'il est absent). Flèches à l'écran, ou ZQSD / flèches du clavier.
 */
import { ContextActionService } from "@rbxts/services";
import { CONTENU } from "shared/donnees";
import { agir, jeu } from "../partie";
import { bouton, carte, COULEURS, esc, ligne, texte } from "./kit";

let dernierEnvoi = 0;

function peutGuider(): boolean {
	const etat = jeu.etat!;
	const meneurPresent = etat.meneur !== undefined && etat.joueurs[etat.meneur]?.present === true;
	return etat.meneur === jeu.moi || !meneurPresent;
}

export function bouger(dx: number, dy: number) {
	if (!jeu.etat?.donjon || !peutGuider()) return;
	if (os.clock() - dernierEnvoi < 0.15) return;
	dernierEnvoi = os.clock();
	agir({ type: "donjon_deplacer", dx, dy });
}

/** Touches du clavier (actives seulement pendant l'exploration). */
export function activerClavier(actif: boolean) {
	if (!actif) {
		ContextActionService.UnbindAction("VelmarisDonjon");
		return;
	}
	ContextActionService.BindAction(
		"VelmarisDonjon",
		(_, etatEntree, objet) => {
			if (etatEntree !== Enum.UserInputState.Begin) return Enum.ContextActionResult.Pass;
			const k = objet.KeyCode;
			if (k === Enum.KeyCode.Up || k === Enum.KeyCode.Z || k === Enum.KeyCode.W) bouger(0, -1);
			else if (k === Enum.KeyCode.Down || k === Enum.KeyCode.S) bouger(0, 1);
			else if (k === Enum.KeyCode.Left || k === Enum.KeyCode.Q || k === Enum.KeyCode.A) bouger(-1, 0);
			else if (k === Enum.KeyCode.Right || k === Enum.KeyCode.D) bouger(1, 0);
			else return Enum.ContextActionResult.Pass;
			return Enum.ContextActionResult.Sink;
		},
		false,
		Enum.KeyCode.Up, Enum.KeyCode.Down, Enum.KeyCode.Left, Enum.KeyCode.Right,
		Enum.KeyCode.Z, Enum.KeyCode.Q, Enum.KeyCode.S, Enum.KeyCode.D, Enum.KeyCode.W, Enum.KeyCode.A,
	);
}

export function vueDonjon(parent: Frame) {
	const etat = jeu.etat!;
	const dj = etat.donjon!;
	const c = carte(parent, CONTENU.donjons[dj.id].nom);
	const guide = peutGuider();
	texte(c, guide ? "Tu guides le groupe : flèches à l'écran, ZQSD ou flèches du clavier." : `${esc(etat.joueurs[etat.meneur ?? ""]?.pseudo ?? "Le meneur")} guide le groupe.`, 14, { couleur: COULEURS.texte2 });
	if (dj.messages.size() === 0) texte(c, "Le groupe avance prudemment…", 15);
	for (const m of dj.messages) texte(c, m, 15);
	if (guide) {
		const l1 = ligne(c);
		bouton(l1, "▲", () => bouger(0, -1), { hauteur: 48, largeur: new UDim(0, 60) });
		const l2 = ligne(c);
		bouton(l2, "◀", () => bouger(-1, 0), { hauteur: 48, largeur: new UDim(0, 60) });
		bouton(l2, "▼", () => bouger(0, 1), { hauteur: 48, largeur: new UDim(0, 60) });
		bouton(l2, "▶", () => bouger(1, 0), { hauteur: 48, largeur: new UDim(0, 60) });
	}
}
