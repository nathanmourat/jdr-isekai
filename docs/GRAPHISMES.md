# Cahier des charges graphique — « Les Appelés de Velmaris »

> Ce document sert à **vous** (le groupe) pour produire ou trouver les textures en parallèle du développement.
> **Le jeu fonctionne sans elles** : toute image manquante est remplacée par un **provisoire** généré automatiquement (une forme colorée avec son nom). Dès que vous déposez le vrai fichier au bon endroit, avec le bon nom, il remplace le provisoire, sans aucune modification du code.
> La commande `npm run assets:manquants` listera les images encore manquantes, par ordre de priorité.

---

## 1. Direction artistique

- **Monde, sprites, combats, interface** : **pixel art**. On vise la palette d'un JRPG 16 bits moderne : couleurs franches, contours sombres, lumière venant du haut à gauche.
- **Portraits** (dialogues, romance, fiches de personnage) : **illustrations style anime**, en buste, sur fond transparent.
- **Ambiance par région** :

| Région | Couleurs dominantes |
|---|---|
| Aubeclaire | Bleu ciel, blanc, or |
| Sylvenoire | Verts profonds, bleu brume |
| Grisfer | Gris, orange forge |
| Sables | Ocre, turquoise |
| Brumes | Gris-vert, rouge volcan |
| Cendres | Noir, rouge, violet |

- **100 % original** : aucun personnage, aucun logo, aucun décor repris d'un jeu ou d'un anime existant.
- **Cohérence** : pour un même type d'image (par exemple toutes les tuiles), utilisez une seule source ou un seul style. Si vous générez par IA, gardez le **même modèle**, la **même formulation de style** et, si l'outil le permet, la même graine ou une image de référence.

## 2. Règles techniques (à respecter pour que l'image s'affiche bien)

| Règle | Valeur |
|---|---|
| Format | **PNG**, fond **transparent** (sauf décors et cartes) |
| Pixel art | **Sans anti-crénelage ni flou** : bords nets. Le jeu agrandit l'image ×2 ou ×3 sans lissage. |
| Taille d'une tuile | **32 × 32 px** |
| Sprite d'exploration | Cases de **32 × 32 px**, ou **64 × 64 px** en HD (planche de 4 × 4 cases) |
| Sprite de combat | Cases de **64 × 64 px** (boss : **128 × 128 px**), ou deux fois plus en HD (planche de 8 colonnes) |
| Version HD (14/11) | Le jeu lit la taille des cases dans la largeur de l'image (8 colonnes en combat, 4 en exploration) et affiche le personnage à la même taille : une planche HD montre simplement deux fois plus de détails. Un héros HD et son calque de race doivent avoir la même résolution. |
| Planche d'animation | Les images d'une animation sont **alignées horizontalement**, sans espace ; une ligne par animation (§ 4) |
| Portrait | **512 × 512 px**, buste centré, fond transparent |
| Décor de scène | **1280 × 720 px** (16:9). Les éléments importants doivent rester dans la zone centrale de 960 × 720, car l'image est rognée sur mobile. |
| Fond de combat | **1280 × 720 px** ; le sol occupe le tiers inférieur |
| Icône | **32 × 32 px** |
| Noms de fichiers | minuscules, sans accent, mots séparés par des tirets : `aveline/portrait-joie.png` |
| Poids | moins de 500 Ko par image ; moins de 1 Mo pour les décors |
| Licence | Chaque image doit être utilisable librement : votre création, un pack **CC0** ou **CC-BY**, ou un outil IA dont les conditions autorisent cet usage. **Notez la source dans `assets/CREDITS.md`.** |

## 3. Où déposer les fichiers

```
assets/
  CREDITS.md                         # source + licence de chaque image ou pack
  tuiles/<lieu>.png                  # tileset en 32×32
  decors/<lieu>.png                  # 1280×720
  combat/fonds/<lieu>.png            # 1280×720
  cartes/monde.png, cartes/aubeclaire.png
  personnages/heros/<classe>/exploration.png | combat.png
  personnages/races/<race>/calque-combat.png | calque-exploration.png | portrait-defaut.png
  personnages/compagnes/<id>/portrait-<expression>.png | combat.png | exploration.png
  personnages/pnj/<id>/portrait-<expression>.png
  ennemis/<id>/combat.png
  effets/<id>.png
  icones/competences/<id>.png | icones/dons/<id>.png | icones/objets/<id>.png
  interface/...
```

Vous pouvez aussi simplement m'envoyer les images avec leur nom : je les range au bon endroit.

## 4. Formats des planches d'animation

**Sprite d'exploration** (`exploration.png`, cases de 32 × 32) : 4 lignes × 4 images, soit 128 × 128 px au total.

| Ligne | Animation |
|---|---|
| 1 | Marche vers le bas |
| 2 | Marche vers la gauche |
| 3 | Marche vers la droite |
| 4 | Marche vers le haut |

**Sprite de combat** (`combat.png`, cases de 64 × 64, personnage **tourné vers la droite** pour les héros et **vers la gauche** pour les ennemis) : 8 images par ligne au maximum, soit 512 px de large.

| Ligne | Animation | Images |
|---|---|---|
| 1 | Attente (respiration) | 4 |
| 2 | Attaque | 6 |
| 3 | Lancer un sort ou une compétence | 4 |
| 4 | Touché | 2 |
| 5 | K.O. | 3 (la dernière reste affichée) |
| 6 | Victoire | 4 (facultatif) |

**Ennemis** : une planche de **4 lignes**, dans cet ordre : attente, attaque, touché, K.O. Elle mesure donc 512 × 256 px, ou 1024 × 512 px pour un boss en 128 × 128.

**Héros** : une planche par classe. Le genre du personnage est libre. Une **variante facultative** (`combat-2.png`, `exploration-2.png`) peut proposer l'autre genre, par exemple un Gardien et une Gardienne.

**Calques de race** (`personnages/races/<race>/calque-combat.png` et `calque-exploration.png`) :
- ils ont **exactement le même gabarit** que les planches de classe : 512 × 384 en combat, 128 × 128 en exploration, mêmes lignes, mêmes images ;
- ils ne contiennent **que les éléments propres à la race**, sur fond transparent : oreilles, queue, cornes, barbe, écailles. Ces éléments sont placés image par image à l'endroit où se trouvent la tête et le corps dans les planches de classe. Le jeu superpose automatiquement le calque au sprite de classe ;
- le jeu applique lui-même la **teinte de peau** (gris-violet pour le demi-démon) et la **taille réduite à 90 %** pour le nain : rien à dessiner pour ça ;
- l'**humain n'a pas de calque**.

Consigne pour les planches de classe : **ne pas couvrir le haut et les côtés de la tête** avec un casque ou une capuche trop large, pour que les oreilles et les cornes restent visibles. Ou alors, prévoir une capuche que les oreilles « traversent ».

| Race | Ce que contient le calque |
|---|---|
| `elfe` | Longues oreilles pointues |
| `demi-elfe` | Oreilles légèrement pointues |
| `nain` | Barbe fournie, tressée |
| `ourvalis` | Oreilles de loup gris argent et queue de loup |
| `vulpin` | Oreilles de renard roux à pointe blanche et queue touffue |
| `demi-demon` | Petites cornes recourbées noires, fine queue terminée en pointe |
| `sang-dragon` | Deux petites cornes, écailles rouges sur les joues et les avant-bras |

> **La liste complète, fichier par fichier, est dans [`LISTE-TEXTURES.md`](LISTE-TEXTURES.md).**

**Effets** (`effets/<id>.png`) : une seule ligne de 6 à 8 images de 64 × 64.

**Portraits** : une image par expression. Expressions attendues pour les compagnes :
- `neutre`
- `joie`
- `colere`
- `tristesse`
- `gene` (rougissement)
- `surprise`

Pour les PNJ secondaires, `neutre` suffit, et éventuellement une seconde expression.

### Correspondance des tuiles d'un donjon

Le jeu doit savoir quelle tuile du tileset correspond à « sol », « mur », « porte »… Pour cela, un fichier `assets/tuiles/<nom>.json` accompagne chaque tileset. Exemple : `assets/tuiles/crypte.json`, écrit d'après le fichier `crypte-positions.md` du graphiste. Pour un nouveau tileset, recopiez-le et changez les numéros de tuiles (index = ligne × 8 + colonne).

### Bestiaire et invocations

Les planches de `assets/ennemis/<id>/combat.png` servent aussi aux **invocations** du même nom (loup spectral, golem de pierre, feu follet…). Le jeu les retourne automatiquement quand elles combattent du côté des héros. Le bestiaire complet (28 monstres, du niveau 1 au niveau 40) est décrit dans `assets/ennemis/BESTIAIRE.md`.

## 5. Liste des images — Version jouable 1 (par priorité)

### Priorité 1 — indispensable pour tester

| Fichier | Description |
|---|---|
| `cartes/aubeclaire.png` | Carte du royaume d'Aubeclaire, avec Lysmont, le Temple du Seuil, la Combe-aux-Saules et la Crypte de la Fontaine (je place les zones cliquables) |
| `decors/temple-du-seuil.png` | Grande salle de temple, cercle d'invocation lumineux au sol, vitraux |
| `decors/lysmont-place.png` | Place centrale de la capitale, fontaine, château en arrière-plan |
| `decors/guilde.png` | Hall de la Guilde de la Rose des Vents : comptoir, tableau des contrats, aventuriers |
| `tuiles/crypte.png` | Tileset du donjon : sol, murs (avec angles), portes, escaliers, coffre (fermé et ouvert), torche (4 images), plaque piège, fontaine asséchée |
| `combat/fonds/plaine.png` et `combat/fonds/crypte.png` | Fonds de combat |
| `personnages/heros/<classe>/combat.png` × 10 | Une planche de combat par classe : `lame-runique`, `arcaniste`, `invocateur`, `ombre`, `gardien`, `alchimiste`, `archer`, `guerisseur`, `berserker`, `barde` |
| `personnages/heros/<classe>/exploration.png` × 10 | Une planche d'exploration par classe |
| `ennemis/loup-gris`, `gobelin-cendre`, `squelette` | Ennemis de base (combat) |
| `personnages/compagnes/aveline/portrait-*.png` | Aveline, les 6 expressions (§ 6) |

### Priorité 2 — chapitre 1 complet

| Fichier | Description |
|---|---|
| `decors/` : `taverne`, `chateau-trone`, `combe-aux-saules`, `quartier-tanneurs`, `lysmont-lanternes-nuit`, `arene` | Lieux du chapitre 1 |
| `decors/prologue-` : `campagne`, `manoir`, `orphelinat`, `boutique`, `route-lysmont` | Prologue d'enfance : **décors uniquement**, pas de portraits d'enfants |
| `combat/fonds/` : `foret`, `rues-nuit`, `arene` | Fonds de combat |
| `ennemis/` : `araignee-geante`, `bandit`, `cultiste`, `golem-fontaine` (mini-boss, 128 × 128), `vorthak` (boss, 128 × 128) | Ennemis |
| `personnages/compagnes/aveline/combat.png` et `exploration.png` | Aveline en combat et en exploration |
| `personnages/pnj/` : `seraphine`, `elianne`, `kaya` (2 ou 3 expressions chacune, car ce sont de futures compagnes), `aureliath`, `rowena`, `edmund-iv`, `vorthak` (neutre) | PNJ |
| `personnages/races/<race>/calque-combat.png` et `calque-exploration.png` × 7 | Calques de race (§ 4) |
| `personnages/races/<race>/portrait-defaut.png` × 8 | Un portrait par défaut **par race**. **Chaque joueur peut aussi importer son propre portrait** (512 × 512). |
| `effets/` : `entaille`, `feu`, `glace`, `soin`, `poison`, `rune`, `bouclier`, `bonus`, `malus`, `critique` | Effets |

### Priorité 3 — finitions

| Fichier | Description |
|---|---|
| `icones/competences/` | 30 icônes : 10 passifs + 20 actives |
| `icones/dons/` | 12 icônes |
| `icones/objets/` | Environ 20 : potions, bombes, cadeaux de compagne, armes et armures de base |
| `interface/` | Cadre de panneau découpable (9-slice) en 48 × 48, boutons, barres de PV et de mana, cadre de portrait, curseur |
| `cartes/monde.png` | Carte du monde complète, 1920 × 1080, avec les 6 régions (voir § 2.2 de la conception) |

> **Police d'écriture** : je m'en occupe. Je choisirai une police pixel libre **qui gère bien les accents français**.
> **Musique et sons** : ils ne font pas partie de la version 1. On pourra ajouter des sons libres plus tard si vous le souhaitez.

## 6. Fiche de description des personnages (pour l'IA ou un dessinateur)

Le modèle de prompt ci-dessous est à adapter à votre outil. Gardez **la même phrase de style** pour tous les portraits :

> *Style : « anime illustration, bust portrait, clean lineart, soft cel shading, fantasy JRPG character art, transparent background, facing slightly left, consistent art style » + description du personnage + expression.*

| Id | Description visuelle |
|---|---|
| `aveline` | Femme de 24 ans, chevalière. Cheveux châtain cuivré attachés en tresse courte, yeux gris-vert, regard droit, petite cicatrice au menton. Armure de plates argentée aux liserés bleu et or (Aubeclaire), cape bleue. |
| `seraphine` | Femme de 21 ans, princesse. Longs cheveux blond pâle, yeux bleu clair, sourire espiègle. Robe de cour blanche et or, mais bottes de voyage ; petit diadème. |
| `elianne` | Femme de 23 ans, prêtresse. Cheveux noirs courts au carré, yeux ambre, air doux. Robe blanche et voile clair brodé d'un soleil stylisé, chapelet de perles de verre. |
| `kaya` | Femme de 22 ans, Ourvalis (peuple-loup). Oreilles et queue de loup gris argent, cheveux argent en bataille, yeux jaunes, crocs visibles quand elle sourit. Tenue d'aventurière en cuir, bandeau rouge. |
| `nadja` | Femme de 27 ans, marchande du désert. Peau mate, cheveux noirs ondulés, yeux verts maquillés de khôl, sourire en coin. Tenue de soie turquoise et ocre, nombreux bracelets, boulier à la ceinture. |
| `ilysse` | Femme elfe adulte (apparence d'environ 25 ans). Longs cheveux vert d'eau, oreilles longues, yeux violets, lunettes rondes. Robe de mage bleu nuit couverte de runes, livre sous le bras. |
| `morra` | Femme démone adulte (apparence d'environ 28 ans). Cheveux noirs aux pointes rouges, cornes recourbées, yeux rouges. Armure noire légère, cape déchirée, sourire narquois. |
| `ysoria` | Femme dragonne sous forme humaine (apparence d'environ 30 ans). Longs cheveux rouge braise, yeux dorés à pupille fendue, petites écailles sur les joues et les mains, deux petites cornes. Robe ancienne pourpre et or, bijoux. |

**Tous les personnages romançables sont des adultes et doivent avoir l'air adultes. Les tenues restent celles d'un anime grand public, sans rien de suggestif.**

## 7. Packs libres conseillés (à vérifier avant usage)

Quelques sources connues de ressources pixel art gratuites. **La licence de chaque pack est à vérifier sur sa page avant de l'utiliser, puis à noter dans `CREDITS.md`.**
- **Kenney.nl** : nombreux packs en CC0 (tuiles, interface, icônes).
- **OpenGameArt.org** : filtrer par licence CC0 ou CC-BY.
- **itch.io**, rubrique « game assets », filtre « free » : la licence varie d'un pack à l'autre, lisez-la bien.

Conseil : choisissez **d'abord un pack de tuiles en 32 × 32**, puis cherchez des sprites qui vont avec. Si un pack est en 16 × 16, dites-le-moi : j'adapterai la taille dans la configuration, mais il faut alors s'y tenir pour tout le jeu.
