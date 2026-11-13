# Calques de race — notes pour le développeur

- **Gabarit** : identique aux planches de classe (combat 512 × 384, exploration 128 × 128, mêmes lignes, mêmes images). Fond transparent, uniquement les éléments de race.
- **Ordre de dessin** : afficher le calque **par-dessus** le sprite de classe (y compris pour les queues).
- **Alignement** : toutes les planches de classe suivent maintenant la **même trajectoire de corps** image par image (tête et bassin au même pixel ; seuls bras, jambes et armes diffèrent). C'est ce qui permet à un seul calque de convenir aux 10 classes.
- **K.O.** : les images couchées utilisent la même rotation et le même décalage pour toutes les classes et pour les calques.
- **Touché** : le calque reprend le même flash (blanc puis rouge) que la planche de classe, image par image.
- **Peau** : les 10 classes utilisent une seule teinte de peau, pour que les oreilles d'elfe et de demi-elfe du calque soient raccord. Si vous voulez des teintes de peau variées, appliquez-les dans le jeu au sprite **et** aux oreilles (comme pour le demi-démon).
- **Barbe du nain** : couleur fixe (châtain roux), quelle que soit la couleur de cheveux de la classe.
- **Sang-dragon** : les écailles sont sur la joue, le cou et l'épaule. Les avant-bras ne sont pas couverts, car chaque classe tient son arme différemment : un seul calque ne peut pas suivre les avant-bras des 10 classes.
- **Têtes dégagées** : plus de casque (Gardien : cerceau doré), capuches baissées sur les épaules (Invocateur, Ombre), bandeau à plume au lieu du chapeau (Barde).
