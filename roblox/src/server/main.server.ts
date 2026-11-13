/**
 * Étape R0 — test du moteur dans Roblox Studio.
 * Au lancement (Play), le serveur crée une partie d'essai, deux héros, et joue l'examen de la Guilde
 * en automatique. Tout s'affiche dans la fenêtre Output (View → Output).
 */
import { CONTENU } from "shared/donnees";
import { appliquer, avancer, combattantHeros, creerRng, demarrerCombat, formaterDate, listeHeros, nouvellePartie, prochaineEtape } from "shared/moteur";

const debut = os.clock();
print(`[Velmaris] Contenu chargé : ${CONTENU.classes !== undefined ? "OK" : "ERREUR"}`);

let etat = nouvellePartie(CONTENU, "essai", "Partie d'essai", "studio");
etat = appliquer(CONTENU, etat, { type: "rejoindre", joueur: "j1", pseudo: "Alpha" });
etat = appliquer(CONTENU, etat, { type: "rejoindre", joueur: "j2", pseudo: "Bravo" });
etat = appliquer(CONTENU, etat, {
	type: "creer_heros",
	joueur: "j1",
	heros: { nom: "Kael", classe: "lame-runique", race: "humain", don: "oeil-du-seuil", origine: "invoque", age: 24 },
});
etat = appliquer(CONTENU, etat, {
	type: "creer_heros",
	joueur: "j2",
	heros: { nom: "Ilo", classe: "arcaniste", race: "elfe", don: "mimetisme", origine: "invoque", age: 22 },
});

print(`[Velmaris] ${formaterDate(CONTENU, etat.jour)} — partie « ${etat.nom} »`);
for (const h of listeHeros(etat)) {
	print(`[Velmaris] Héros : ${h.nom} (${CONTENU.races[h.race].nom}, ${CONTENU.classes[h.classe].nom}), niveau ${h.niveau}, ${h.or} or`);
}
const etape = prochaineEtape(CONTENU, etat, "h1");
if (etape) print(`[Velmaris] Prochaine étape : ${etape.objectif}`);

// Combat d'essai joué par l'ordinateur pour les deux héros
const rng = creerRng("studio");
const allies = listeHeros(etat).map((h) => combattantHeros(CONTENU, h, false));
const combat = demarrerCombat(CONTENU, "examen-guilde", allies, rng);
avancer(CONTENU, combat, rng);
for (const e of combat.evenements) print(`[Combat] ${e.texte}`);
print(`[Velmaris] Résultat : ${combat.resultat ?? "en cours"} en ${combat.tour} tours`);
print(`[Velmaris] Test terminé en ${math.floor((os.clock() - debut) * 1000)} ms. Le moteur fonctionne dans Roblox !`);
