/**
 * « Une seule chose ouverte à la fois » (test 4, point 5) : quand une fenêtre, une bulle de personnage, un tiroir,
 * le menu ☰ ou la fiche rapide s'ouvre, il s'annonce ici ; tous les autres se ferment.
 *
 *   annoncer('fenetre:boutique')   // une fenêtre (Fenetre.svelte le fait toute seule, avec sa clé)
 *   annoncer('bulle')              // la bulle d'un personnage dans un lieu
 *   annoncer('tiroir') / annoncer('menu') / annoncer('fiche')
 *
 * Chaque composant qui affiche quelque chose d'ouvrable suit `premierPlan.jeton` et ferme ce qui n'est pas `premierPlan.qui`.
 */
export const premierPlan = $state({ jeton: 0, qui: '' });

export function annoncer(qui: string) {
  premierPlan.qui = qui;
  premierPlan.jeton++;
}
