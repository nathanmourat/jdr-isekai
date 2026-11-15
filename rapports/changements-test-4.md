# Changements du test 4 (version web, 15/11)

Les 10 points demandés après le test 4, un commit par point, tous envoyés sur `claude/festive-mccarthy-ahagx5`.
Contrôles : `npm test` (224 tests), `npm run build`, et les tests navigateur `carte`, `captures-ecran`, `captures-combat`, `parcours`, plus les nouveaux `cibles`, `fenetres`, `des` et `soins` passent tous.
Captures : `rapports/captures-test-4/`.

Les anciennes parties continuent de fonctionner : la sauvegarde passe au **format v9**, et ce qui a déjà été joué se rejoue à l'identique.

---

## 1. Combat : choix de la cible
**La cause** : tous les combattants avaient une zone de clic à la même profondeur. Quand ils sont serrés (5 ennemis, ou le zoom sur téléphone), les zones se chevauchaient et le dernier dessiné « volait » le clic de son voisin. En plus, un clic sur un personnage qu'on ne peut pas viser ne faisait rien, sans explication (par exemple un ennemi du second rang avec une attaque au corps à corps). Sur téléphone en paysage, la ligne du journal passait par-dessus les combattants et bloquait les clics.
**Ce qui a changé** :
- c'est le combattant le plus proche du clic qui est choisi, avec une zone d'au moins 44 × 44 px (son nom compris) ;
- un clic refusé affiche un court message, avec les vraies règles du jeu : « Hors de portée : au corps à corps, il faut d'abord vaincre les ennemis du premier rang », « X est déjà K.O. », « X est caché », « Vous êtes provoqué par X », « Cette action ne vise que les alliés », « Choisissez d'abord une action ».

Il n'existe pas de règle « Protégé par X » : la garde n'empêche pas de viser, elle intercepte parfois le coup.

**À vérifier**
- [ ] Dans un combat contre 4 ou 5 ennemis, chacun se clique, sur ordinateur et sur téléphone.
- [ ] Avec une attaque au corps à corps, cliquer un ennemi du second rang affiche « Hors de portée ».
- [ ] Sans action choisie, cliquer un ennemi affiche « Choisissez d'abord une action ».

## 2. Poison sur une attaque ratée
**La cause** : le poison visait « la première cible offensive », retenue même quand le coup avait raté.
**Ce qui a changé** : après des dégâts, un état (poison, brûlure, gel…) ne touche que les cibles réellement touchées, une par une pour les attaques de zone. Pareil pour le passif « Œil du faucon » (marque). Les compétences sans dégâts gardent leur propre chance de réussite. Les touches élémentaires de l'équipement étaient déjà correctes. Un test vérifie 300 coups de Lame empoisonnée : aucun coup raté n'empoisonne.
**À vérifier**
- [ ] Une Lame empoisonnée ratée (« Raté ») ne pose pas ☠ sur l'ennemi.

## 3. La tannerie abandonnée et sa cave
**Ce qui a changé** :
- deux nouveaux décors dessinés dans le style du jeu (`outils/textures/hd/scenes_tannerie.py`) : la tannerie vue de dehors (volets cloués, cuves à sec, trappe aux gonds graissés, traces dans la poussière) et la cave (cages, bougies violettes, symboles du culte, échelle) ;
- la scène commence dehors puis passe à la cave quand on descend ;
- le combat contre les cultistes a lieu dans la cave, avec un vrai fond de combat ;
- les conséquences ne changent pas (Lina sauvée ou morte, réputation, XP).

Le texte validé est intégré. Une précision : pour que les anciennes parties se rejouent, le choix « Descendre dans la cave » reste en deux versions cachées (selon la piste). Le joueur n'en voit toujours qu'une.
**À vérifier**
- [ ] « Les disparus des Tanneurs : la cave » : décor de la tannerie, puis de la cave après « Descendre ».
- [ ] Le combat se déroule dans la cave.

## 4. Notifications vertes : 5 secondes
**Ce qui a changé** : elles restent 5 secondes. Pendant un lancer de dé ou les soins du Temple, elles attendent la fin de l'animation pour ne pas dévoiler le résultat.
**À vérifier**
- [ ] Un gain reste affiché environ 5 secondes.

## 5. Une seule chose ouverte à la fois
**Ce qui a changé** : ouvrir une fenêtre (boutique, identification, lit, examen…), une bulle, un tiroir, le menu ☰ ou la fiche rapide ferme tout le reste. La règle est écrite dans CLAUDE.md pour toutes les prochaines fenêtres.
**À vérifier**
- [ ] Ferrand, puis « Faire identifier un objet » : la bulle disparaît, seule la fenêtre reste.
- [ ] Bulle ouverte, puis ☰ : la bulle se ferme.

## 6. Orlan Cassebrune, colporteur de reliques
**Ce qui a changé** :
- **Orlan** (petit homme rond, chapeau à breloques, gilet moutarde, énorme sacoche) remplace Ferrand dans « Le marchand de reliques ». Il a son sprite dans la taverne.
- **Ferrand** reste à sa place : il devient « Expert en antiquités » et identifie toujours les objets. Aucun autre texte du jeu ne fait de lui un escroc.
- **Démasqué ou arrêté** : Orlan disparaît pour toujours.
- **Sinon** (test raté, relique achetée ou nouveau choix « L'ignorer »), il part 3 jours plus tard. Un client de la taverne le dit : « parti vers d'autres marchés ».
- **Retour** : il revient 60 jours après (délai réglable dans le YAML), avec une relique tirée au hasard. Elle est authentique 1 fois sur 10 (hasard à graine). On peut l'examiner, l'acheter (100 or × numéro du chapitre), prévenir l'Ordre ou l'ignorer.
- **Si la relique est vraie**, Orlan est sincère : il n'est pas démasqué, et l'Ordre la lui rachète au lieu de l'arrêter.

**Reliques authentiques** (`content/objets/reliques.yaml`) :
- **Phalange de Saint Aldebrand** (amulette) : les caractéristiques de l'amulette « de maître » du palier + 8 % de PV max.
- **Clou de la Porte d'Aube** (talisman) : les caractéristiques du talisman « de maître » du palier + 12 % de résistance à l'ombre.
- **Larme de Sainte Ysolde** (une seule utilisation) : en combat, relève un allié K.O. avec 50 % de ses PV ; hors combat, rend tous les PV et guérit la blessure.

Phalange et Clou existent en une version par palier : on reçoit celle du chapitre en cours. Au palier I, ils sont « peu communs » (la rareté maximum du palier), « rares » ensuite.

Petites phrases ajoutées par rapport au texte validé, pour éviter des écrans vides avec seulement « Continuer » :
- « [[Tu approches||Vous approchez]] la relique de la lanterne… » ;
- « L'or change de mains. Orlan compte les pièces deux fois, par principe. » ;
- « Un garçon de salle court chercher l'Ordre… » ;
- « Prenez-en soin. Moi, je n'y croyais pas. » ;
- « Orlan range son coffret. Dans quelques jours, il repartira vers d'autres marchés. »

À ajuster si besoin : Orlan est placé automatiquement dans la taverne. Le graphiste peut lui donner une position dans `assets/decors/taverne.json`.

**À vérifier**
- [ ] Après l'examen, Orlan est à la taverne (« ! »), Ferrand aussi, à part.
- [ ] Le démasquer : il ne revient jamais.
- [ ] Le laisser partir, dormir 3 mois au Chaudron Fêlé : il revient avec une relique.

## 7. Contrats terminés
**Ce qui a changé** : un contrat rempli disparaît du tableau de la Guilde pour tout le groupe, puis revient 5 jours plus tard (`contrats.retour_jours` dans `campagne.yaml`). Le tableau indique « Remplis récemment, de retour bientôt : … ».
- Les contrats sont répétables par défaut. « Tête de la Légion », « Le colosse égaré » et « Le golem du Lac de lave » sont marqués `repetable: false` : ils ne reviennent jamais.
- Les épreuves d'examen ne sont jamais au tableau.
- Un contrat raté ou abandonné reste au tableau.

**À vérifier**
- [ ] Remplir un contrat : il disparaît du tableau, puis revient 5 jours plus tard.

## 8. Soins au Temple
**Ce qui a changé** : « Soins des prêtres » lance une petite scène d'environ 10 secondes, chez le joueur soigné seulement.
- Sœur Elianne s'approche et prie (3 répliques, variante quand le héros a une blessure).
- Une lumière dorée descend avec des particules, puis les PV remontent.
- La notification verte « +X PV » arrive à la fin.
- Le bouton « Passer » arrête la scène. Avec « réduire les animations », elle dure 2 secondes.

Au passage, une compagne qui est aussi un PNJ (Elianne) a maintenant un vrai portrait dans les dialogues, au lieu de la silhouette provisoire.
**À vérifier**
- [ ] Au Temple, blessé : la scène, le texte de la variante « blessure », puis « +X PV ».
- [ ] « Passer » ferme tout de suite.

## 9. Lancer de dé
**Ce qui a changé** : chaque test de caractéristique montre la même animation : le dé roule, puis le dé, le bonus, le total contre la difficulté, puis « Réussi » en vert ou « Échoué » en rouge. Cela vaut pour les scènes, les étapes de contrat, les épreuves d'examen et les pièges de donjon. Le temps libre n'a pas de jet de dé.
- Tous les joueurs présents voient le lancer.
- Un clic passe directement au résultat, un second ferme.
- L'animation ne fait que montrer le résultat calculé par le moteur.

**À vérifier**
- [ ] « Médiation au marché », étape 3 : le test de Charisme montre le dé qui roule, puis le détail.
- [ ] En partie à plusieurs : les camarades présents voient aussi le lancer.

## 10. Pastilles du menu ☰
**Ce qui a changé** :
- **rouge** : action importante (points à placer, branche à choisir, quête à rendre) ;
- **vert** : simple information (nouvelles lignes du Journal) ;
- le bouton ☰ montre le nombre d'entrées rouges, sinon le nombre de nouveautés en vert ;
- dans le menu, les entrées rouges passent en premier ;
- la pastille verte disparaît quand on ouvre le Journal.

**À vérifier**
- [ ] Avec seulement des lignes de journal : pastille verte.
- [ ] Après un gain de niveau : pastille rouge sur ☰ et sur « Personnage ».

---

## Pour la version Roblox
Tout ce que Roblox doit reprendre est listé dans `roblox/README-ROBLOX.md` (« À reprendre — test 4 »).
