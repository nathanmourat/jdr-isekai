/**
 * Badges Roblox du jeu. Pour qu'un badge soit donné, il faut le CRÉER sur le site Roblox
 * (Creator Dashboard → ton expérience → Associated Items → Badges), puis coller ici son numéro (Badge ID).
 * Un numéro à 0 = badge pas encore créé : le jeu ne fait rien (aucune erreur).
 * Selon les règles du moment, créer un badge peut coûter des Robux : vérifie sur le site avant.
 */
export const BADGES: Record<string, { numero: number; nom: string; condition: string }> = {
	premier_heros: { numero: 0, nom: "L'Appelé", condition: "Créer son héros" },
	guilde: { numero: 0, nom: "Membre de la Guilde", condition: "Réussir l'examen de la Guilde" },
	premier_groupe: { numero: 0, nom: "Compagnons d'armes", condition: "Jouer dans un groupe" },
	chapitre_1: { numero: 0, nom: "Les Lanternes d'Aubeclaire", condition: "Finir le chapitre 1" },
	chapitre_2: { numero: 0, nom: "Les Routes du Sud", condition: "Finir le chapitre 2" },
	chapitre_3: { numero: 0, nom: "La Forêt qui se souvient", condition: "Finir le chapitre 3" },
	chapitre_4: { numero: 0, nom: "Feu et Écailles", condition: "Finir le chapitre 4" },
	chapitre_5: { numero: 0, nom: "La Guerre des Cendres", condition: "Finir le chapitre 5" },
	fin_sceau: { numero: 0, nom: "Fin : le Sceau", condition: "Recoudre le Voile" },
	fin_pacte: { numero: 0, nom: "Fin : le Pacte", condition: "Faire la paix avec Orvan" },
	fin_couronne: { numero: 0, nom: "Fin : la Couronne", condition: "Rentrer en vainqueurs" },
	fin_retour: { numero: 0, nom: "Fin : le Retour", condition: "Ouvrir une porte vers votre monde" },
	niveau_10: { numero: 0, nom: "Aguerri", condition: "Atteindre le niveau 10" },
	niveau_20: { numero: 0, nom: "Vétéran", condition: "Atteindre le niveau 20" },
	niveau_40: { numero: 0, nom: "Légende de Velmaris", condition: "Atteindre le niveau 40" },
};

/** Bonus de connexion : or par jour de série (multiplié par le chapitre en cours), objet certains jours. */
export const BONUS_CONNEXION: { or: number; objet?: string; quantite?: number }[] = [
	{ or: 10 },
	{ or: 15 },
	{ or: 20, objet: "potion-soin-petite" },
	{ or: 25 },
	{ or: 30, objet: "potion-soin-petite", quantite: 2 },
	{ or: 40 },
	{ or: 60, objet: "potion-soin-grande" },
];
