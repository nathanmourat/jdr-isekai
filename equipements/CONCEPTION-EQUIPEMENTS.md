# Équipements — conception (version 1, à valider)

Projet : « Les Appelés de Velmaris » (jdr-isekai). Document préparé à part du dépôt : **rien n'est encore ajouté au jeu**.

## 1. Pourquoi

Donner aux héros de vraies armes et tenues, adaptées à leur classe, avec des stats cohérentes selon le **niveau** et la **rareté**. Une fois les stats validées par le groupe, les armes seront dessinées en 2D, puis le tout sera transmis au collègue qui tient le projet.

- **Objectifs** : un catalogue complet pour les 10 classes et les 6 chapitres ; des stats calculées par une règle unique (donc équilibrées entre elles) ; un fichier prêt à intégrer ; un tableur pour relire.
- **Hors sujet pour l'instant** : les dessins 2D, la modification du moteur, l'intégration dans le dépôt, la version Roblox.
- **À éviter** : un objet qui rend une classe bien plus forte que les autres ; des armes qui écrasent les compétences ; des noms ou objets repris d'œuvres existantes (règle du projet : 100 % original).

## 2. Ce qui existe déjà dans le jeu

- 7 objets d'équipement (épée courte, dague, arc court, bâton d'apprenti, bouclier de bois, armure de cuir, robe de mage), vendus 30 à 45 or à Lysmont.
- **3 emplacements** : arme, armure (la tenue), accessoire. **On les garde** pour la version 1.
- Un objet peut donner : **puissance** (renforce seulement l'attaque de base), **armure** (s'ajoute à la défense : défense = 2 × VIT + armure) et **caractéristiques** (+FOR, +AGI…).
- Pas de rareté, pas de niveau requis, pas de restriction de classe.
- Repères : +1 point de caractéristique = +5 % de la partie « stat » des dégâts ; un héros gagne +3 points par niveau (≈ 117 points au niveau 40).

## 3. Approches envisagées

| Approche | Avantage | Inconvénient |
|---|---|---|
| Document de présentation seul | Simple à lire | Tout à recopier à la main dans le jeu |
| Tableur seul | Facile à modifier | Conversion nécessaire, effets mal rangés |
| **Fichier au format du jeu + tableur et résumé générés** (choisi) | Une seule source, prête à déposer, chiffres vérifiés | Fichier brut moins agréable à éditer |

Effets : **option B choisie** (objets communs simples, effets spéciaux pour les raretés hautes). Le moteur devra être adapté plus tard avec le collègue.

## 4. Les paliers de niveau (un par chapitre)

Plutôt qu'un palier tous les 5 niveaux, un palier **par chapitre** : chaque chapitre apporte une nouvelle génération d'équipement.

| Palier | Niveau requis | Chapitre | Où on le trouve (proposition) |
|---|---|---|---|
| I | 1 | 1 — L'Appel (Aubeclaire) | Lysmont |
| II | 8 | 2 — Les Routes du Sud | Marche des Sables |
| III | 15 | 3 — La Forêt qui se souvient | Sylvenoire |
| IV | 22 | 4 — Feu et Écailles | Monts Grisfer, Archipel |
| V | 28 | 5 — La Guerre des Cendres | Mur d'Aube |
| VI | 34 | 6 — Le Souverain des Cendres | Terres Cendrées |
| **X** | 40 | fin de saison | **Reliques du Voile** : les 6 armes mythiques uniquement |

Les paliers numérotés restent ouverts : un palier VII pourra arriver avec une prochaine saison. Le palier X est à part : il est réservé aux armes mythiques.

## 5. Les 5 raretés

| Rareté | Couleur | Multiplicateur de stats | Effets spéciaux | Où on l'obtient |
|---|---|---|---|---|
| Commun | gris | × 1,0 | aucun | boutiques |
| Peu commun | vert | × 1,2 | aucun | boutiques (plus cher), contrats |
| Rare | bleu | × 1,4 | 1 effet | butin, récompenses de contrats et quêtes |
| Épique | violet | × 1,6 | 2 effets | boss, donjons, fins de chapitre |
| Légendaire | or | × 1,8 | 2 effets + 1 pouvoir unique | quête de classe (1 par classe), palier V |
| **Mythique** | rouge | × 2,0 | 3 effets + 1 pouvoir majeur | quêtes cachées du chapitre 6 et boss final |

**Rareté maximum par palier** (décidé avec le groupe) : la rareté monte avec le héros.

| Palier | I | II | III | IV | V | VI | X |
|---|---|---|---|---|---|---|---|
| Rareté max | Peu commun | Rare | Épique | Épique* | Légendaire | Légendaire | Mythique |

\* Un légendaire « exceptionnel » au palier IV reste possible plus tard (objet d'histoire, pas de classe) ; aucun pour l'instant.

- Les légendaires arrivent au **palier V (niveau 28)** : c'est la récompense de la chaîne de quêtes de classe, juste avant la compétence ultime du niveau 30. Un légendaire du palier V (19 points) a un peu moins de stats qu'un épique du palier VI (20 points) : c'est voulu, son pouvoir unique compense.
- Les **communs restent à tous les paliers** : c'est l'équipement standard de chaque chapitre (boutiques, joueur malchanceux, joueur qui rejoint en cours de route). Un commun du palier VI (12 points) reste bien meilleur qu'un épique du palier III (10 points).
- **Mythiques** : 6 armes seulement, **un seul exemplaire par partie** (même règle que les dons), niveau 40.

- **Commun et peu commun** = objets « génériques » (ex. « Épée longue »).
- **Rare, épique, légendaire** = objets **nommés**, avec une petite histoire (ex. « Lame du Guet de Lysmont »).

## 6. La règle de calcul des stats (budget)

Chaque objet reçoit un **budget de points** :

> **budget = (2 + 0,3 × niveau requis) × multiplicateur de rareté**, arrondi

Conversion du budget : **1 point = 1 caractéristique (FOR, AGI, VIT, CHA) = 1 puissance = 2 d'armure**. Les points d'**INT et d'ESP valent plus** : ×3 au palier I, ×2 au II, ×1,5 au III, ×1,25 ensuite. Ces caractéristiques rapportent moins en combat que les autres ; le palier I a été réglé par simulation, les suivants seront à recaler quand leurs ennemis existeront.

| Palier (niveau) | Commun | Peu commun | Rare | Épique | Légendaire | Mythique |
|---|---|---|---|---|---|---|
| I (1) | 2 | 3 | — | — | — | — |
| II (8) | 4 | 5 | 6 | — | — | — |
| III (15) | 7 | 8 | 9 | 10 | — | — |
| IV (22) | 9 | 10 | 12 | 14 | — | — |
| V (28) | 10 | 12 | 15 | 17 | 19 | — |
| VI (34) | 12 | 15 | 17 | 20 | 22 | — |
| X (40) | — | — | — | — | — | 28 |

« — » = rareté interdite à ce palier.

Répartition par emplacement :
- **Arme** : une petite part en **puissance** (1/3 du budget pour une arme physique, 1/4 pour une arme magique, et au plus 1 + niveau / 5, pour que l'attaque de base ne dépasse pas les compétences), le reste dans la **caractéristique principale** de la classe (FOR, AGI, INT, ESP ou CHA).
- **Tenue** : surtout de l'**armure**, plus VIT ou ESP selon le type.
- **Accessoire** : caractéristiques au choix (souvent secondaires), ou armure pour le bouclier.

Ordre de grandeur au niveau 34 avec 3 objets épiques (feuille « Comparaison » du tableur) : **+25 à +34 % de dégâts** pour les classes offensives et de soutien, avec −7 à −25 % de dégâts physiques subis ; **+17 à +18 % de dégâts et −33 % de dégâts subis** pour le Gardien et la Lame runique équipés d'un bouclier. C'est une part importante mais pas écrasante de la puissance du héros (le reste vient des niveaux et des compétences). La vraie vérification se fera avec `npm run equilibrage` une fois le moteur adapté.

**Prix** (proposition, à caler avec l'économie du jeu) : prix = 20 × budget × (1 + niveau / 10). Palier I commun : 40 or.

## 7. Types d'armes et classes

| Type d'arme | Classes qui peuvent l'utiliser | Caractéristique principale |
|---|---|---|
| Épée | Lame runique, Gardien sacré | FOR |
| Arme à deux mains (hache, espadon) | Berserker draconique, Lame runique | FOR |
| Masse / marteau | Gardien sacré, Berserker draconique | FOR |
| Dague / lame courte | Ombre, Barde enchanteur | AGI |
| Arc | Archer spirituel | AGI |
| Arbalète de poing / lance-fioles | Alchimiste-artificier, Archer spirituel | INT ou AGI |
| Bâton | Arcaniste, Invocateur, Guérisseur | INT ou ESP |
| Sceptre | Guérisseur, Gardien sacré | ESP |
| Orbe / grimoire | Invocateur, Arcaniste | INT |
| Instrument (luth, flûte) | Barde enchanteur | CHA |

Chaque classe a 1 à 3 types : la cohérence est gardée, sans tout verrouiller.

## 8. Tenues et accessoires

| Tenue | Classes | Stats |
|---|---|---|
| **Lourde** (plates, mailles) | Gardien, Berserker, Lame runique | armure 60 %, VIT 20 %, FOR 20 % |
| **Intermédiaire** (cuir, brigandine) | Ombre, Archer, Alchimiste, Barde | armure 50 %, AGI 25 %, VIT 25 % |
| **Légère** (robe, tunique) | Arcaniste, Invocateur, Guérisseur | armure 30 %, ESP 35 %, INT 35 % |

| Accessoire | Classes | Stats |
|---|---|---|
| Bouclier | Gardien, Lame runique | armure 100 % |
| Anneau | toutes | AGI 50 %, CHA 50 % |
| Amulette | toutes | ESP 50 %, INT 50 % |
| Talisman | toutes | VIT 60 %, FOR 40 % |
| Carquois | Archer | AGI 60 %, ESP 40 % |
| Sacoche | Alchimiste | INT 60 %, AGI 40 % |

## 9. Les effets spéciaux (raretés Rare et plus)

Liste courte, chaque effet avec une valeur qui monte par palier :

| Effet | Exemple au palier I → VI | Ce que le moteur devra savoir faire |
|---|---|---|
| Critique | +2 % → +7 % de chance de critique | ajouter un bonus de critique |
| Précision | +3 % → +8 % de chance de toucher | ajouter un bonus de précision |
| Résistance à un élément | 5 % → 20 % (feu, glace, foudre, sacré, ombre, poison, arcane) | le champ « résistances » existe déjà pour les ennemis |
| Touche élémentaire | l'attaque de base ajoute un peu de dégâts de feu, glace… | ajouter un second coup à l'attaque de base |
| Mana | +5 → +30 mana max | ajouter un bonus de mana |
| Vigueur | +3 % → +10 % de PV max | ajouter un bonus de PV |

**Pouvoirs uniques (légendaires)** : écrits à la main, un par classe, en lien avec le passif de la classe (ex. pour la Lame runique : « commence le combat avec 1 charge de rune »).

## 10. Contenu du catalogue version 1

- **Objets génériques (commun et peu commun)** : 10 types d'armes, 3 tenues et 6 accessoires × 6 paliers × 2 raretés, soit **228 objets**, entièrement calculés par la règle du § 6.
- **Objets nommés**, par classe : 2 peu communs nommés au palier I (arme + tenue, sans effet), 2 rares au palier II, puis 1 rare + 1 épique aux paliers III à VI, en alternant arme, tenue et accessoire. Soit 20 peu communs, 60 rares et 40 épiques nommés, plus **10 légendaires** (1 par classe, palier V).
- **6 armes mythiques** (palier X), les « Reliques du Voile » : épée, arme à deux mains, dague, arc, arbalète et bâton. Chaque classe peut en utiliser au moins une.
- **Total : 364 objets.**
- Les **7 objets existants** gardent leur id et leur nom : ils deviennent les « communs du palier I », avec des stats et un prix recalculés par la règle.

## 11. Ce qui sera livré

Dans le dossier `equipements/` (en dehors du dépôt) :
- `equipements.yaml` : le catalogue au format du jeu, avec les nouveaux champs `rarete`, `niveau`, `categorie` (type d'arme, de tenue ou d'accessoire), `classes`, `effets_equipement`, `pouvoir_unique`.
- `equipements.xlsx` : le tableur, une ligne par objet, avec des filtres par classe, palier, rareté et emplacement.
- une page de résumé des règles avec des comparaisons de dégâts calculées avec les formules du jeu.

## 12. Ce qui restera à faire avec le collègue (plus tard)

> **Fait** sur la branche `equipements` (voir `LISEZ-MOI.md`), y compris l'équilibrage : héros équipés dès la création, ennemis renforcés (+10 % PV, +8 % dégâts), répartitions retouchées (masse, bouclier, instrument, INT/ESP).

1. Ajouter les nouveaux champs au format des objets (`src/contenu/schemas.ts`).
2. Bloquer l'équipement selon le niveau et la classe (`src/moteur/partie.ts`, action « équiper ») ; empêcher qu'une arme mythique existe deux fois dans la partie (`unique_par_partie`).
3. Gérer les 6 effets spéciaux en combat (`src/moteur/combat.ts`).
4. Afficher la couleur de rareté dans l'interface.
5. Relancer `npm run equilibrage` et `npm test`.
6. Garder le moteur compatible Roblox (`npm run roblox:verifier`).

## 13. Mes choix, à vérifier

- Paliers par chapitre (§ 4) plutôt que tous les 5 niveaux.
- Multiplicateurs de rareté et formule de budget (§ 5 et § 6).
- Formule de prix (§ 6), à recaler quand l'économie des chapitres 2 à 6 existera.
- Répartition des types d'armes entre classes (§ 7).
