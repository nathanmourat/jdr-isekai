# Liste détaillée des textures — Version jouable 1 (chapitre 1)

> Format, règles techniques et style : voir [`GRAPHISMES.md`](GRAPHISMES.md).
> Cochez une case (`[x]`) quand l'image est faite. Une image manquante est remplacée en jeu par un provisoire, donc vous pouvez livrer dans l'ordre que vous voulez. **Commencez par la priorité 1.**
> Rappels : PNG, fond transparent (sauf décors, fonds et cartes) ; pixel art sans flou ; portraits de style anime en 512 × 512.

---

## PRIORITÉ 1 — indispensable pour tester

### 1.1 Carte, décors et fonds de combat

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 1 | `cartes/aubeclaire.png` | 1920 × 1080 | Carte du royaume vue du dessus, style carte ancienne en pixel art. Y faire figurer : Lysmont (capitale, au centre), le Temple du Seuil (sur une colline au nord de Lysmont), la Combe-aux-Saules (forêt au sud-ouest), la Crypte de la Fontaine (ruines à l'est), des routes, une rivière, et le Mur d'Aube au loin, au nord. Aucun texte (j'ajoute les noms en jeu). |
| [x] | 2 | `decors/temple-du-seuil.png` | 1280 × 720 | Intérieur d'un grand temple blanc, cercle d'invocation lumineux bleu au sol, vitraux en forme de soleil, prêtres en robe blanche en arrière-plan. |
| [x] | 3 | `decors/lysmont-place.png` | 1280 × 720 | Place centrale de la capitale en plein jour : fontaine, étals, maisons à colombages, château blanc aux toits bleus au fond. |
| [x] | 4 | `decors/guilde.png` | 1280 × 720 | Hall de la Guilde des aventuriers : comptoir d'accueil, grand tableau de contrats couvert d'affiches, tables, aventuriers en armes, bannière avec une rose des vents. |
| [x] | 5 | `combat/fonds/plaine.png` | 1280 × 720 | Plaine herbeuse avec un chemin de terre et un ciel clair ; le sol occupe le tiers inférieur. |
| [x] | 6 | `combat/fonds/crypte.png` | 1280 × 720 | Salle de crypte en pierre, torches, colonnes ; sol dallé sur le tiers inférieur. |

### 1.2 Tileset du donjon « Crypte de la Fontaine »

Un seul fichier `tuiles/crypte.png`, avec des **tuiles de 32 × 32 alignées sur une grille, 8 tuiles par ligne** (256 px de large). L'ordre n'a pas d'importance : envoyez-moi une capture annotée ou listez les positions, et je fais la correspondance. Tuiles nécessaires :

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 7 | `tuiles/crypte.png` | 256 × N | Environ 45 tuiles : Sol dallé (3 variantes) ; Sol fissuré ; Mur vu de face (2 variantes) ; Haut de mur (vu de dessus) ; 4 angles de mur extérieurs ; 4 angles de mur intérieurs ; Bord de mur gauche, droite et bas ; Porte fermée ; Porte ouverte ; Escalier descendant ; Escalier montant ; Coffre fermé ; Coffre ouvert ; Torche murale (4 images d'animation) ; Plaque de piège inactive ; Plaque de piège activée (pics) ; Fontaine asséchée (bloc de 2 × 2 tuiles) ; Sarcophage (bloc de 1 × 2 tuiles) ; Tas d'os ; Gravats ; Toile d'araignée (coin) ; Levier (haut et bas) ; Grille de herse fermée et ouverte ; Sceau cendré au sol (rune violette, 2 images d'animation). |

### 1.3 Héros — planches de combat (une par classe)

Planche de **512 × 384** : 6 lignes de 8 cases de 64 × 64, personnage **tourné vers la droite**. Lignes : 1 attente (4 images), 2 attaque (6), 3 sort ou compétence (4), 4 touché (2), 5 K.O. (3), 6 victoire (4, facultatif). Les cases inutilisées restent vides.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 8 | `personnages/heros/lame-runique/combat.png` | 512 × 384 | **Lame runique** : guerrier en armure légère, épée gravée de runes lumineuses bleues. |
| [x] | 9 | `personnages/heros/arcaniste/combat.png` | 512 × 384 | **Arcaniste élémentaire** : mage en robe, bâton, petites flammes et cristaux de glace qui flottent. |
| [x] | 10 | `personnages/heros/invocateur/combat.png` | 512 × 384 | **Invocateur** : mage à capuche, grimoire ouvert, cercle magique vert. |
| [x] | 11 | `personnages/heros/ombre/combat.png` | 512 × 384 | **Ombre** : assassin encapuchonné, foulard, deux dagues. |
| [x] | 12 | `personnages/heros/gardien/combat.png` | 512 × 384 | **Gardien sacré** : armure lourde blanche et or, grand bouclier, masse. |
| [x] | 13 | `personnages/heros/alchimiste/combat.png` | 512 × 384 | **Alchimiste-artificier** : lunettes de protection, tablier, ceinture de fioles, clé à molette. |
| [x] | 14 | `personnages/heros/archer/combat.png` | 512 × 384 | **Archer spirituel** : tenue de rôdeur verte, arc long, flèches aux pointes lumineuses. |
| [x] | 15 | `personnages/heros/guerisseur/combat.png` | 512 × 384 | **Guérisseur** : robe claire, bâton surmonté d'un soleil, sacoche de soins. |
| [x] | 16 | `personnages/heros/berserker/combat.png` | 512 × 384 | **Berserker draconique** : torse protégé par des écailles rouges, grande hache, cheveux en bataille. |
| [x] | 17 | `personnages/heros/barde/combat.png` | 512 × 384 | **Barde enchanteur** : tenue colorée, chapeau à plume, luth. |

### 1.4 Héros — planches d'exploration (une par classe)

Planche de **128 × 128** : 4 lignes de 4 cases de 32 × 32. Lignes : marche vers le bas, vers la gauche, vers la droite, vers le haut. Même tenue que la planche de combat, en plus petit.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 18 | `personnages/heros/lame-runique/exploration.png` | 128 × 128 | **Lame runique** en marche. |
| [x] | 19 | `personnages/heros/arcaniste/exploration.png` | 128 × 128 | **Arcaniste élémentaire** en marche. |
| [x] | 20 | `personnages/heros/invocateur/exploration.png` | 128 × 128 | **Invocateur** en marche. |
| [x] | 21 | `personnages/heros/ombre/exploration.png` | 128 × 128 | **Ombre** en marche. |
| [x] | 22 | `personnages/heros/gardien/exploration.png` | 128 × 128 | **Gardien sacré** en marche. |
| [x] | 23 | `personnages/heros/alchimiste/exploration.png` | 128 × 128 | **Alchimiste-artificier** en marche. |
| [x] | 24 | `personnages/heros/archer/exploration.png` | 128 × 128 | **Archer spirituel** en marche. |
| [x] | 25 | `personnages/heros/guerisseur/exploration.png` | 128 × 128 | **Guérisseur** en marche. |
| [x] | 26 | `personnages/heros/berserker/exploration.png` | 128 × 128 | **Berserker draconique** en marche. |
| [x] | 27 | `personnages/heros/barde/exploration.png` | 128 × 128 | **Barde enchanteur** en marche. |

### 1.5 Ennemis de base

Planche de **512 × 256** : 4 lignes de 8 cases de 64 × 64, ennemi **tourné vers la gauche**. Lignes : attente (4 images), attaque (6), touché (2), K.O. (3).

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 28 | `ennemis/loup-gris/combat.png` | 512 × 256 | Grand loup gris, poils hérissés, yeux jaunes. |
| [x] | 29 | `ennemis/gobelin-cendre/combat.png` | 512 × 256 | Gobelin à la peau gris cendre, yeux rouges, lance rouillée, marques violettes (corrompu par les Cendres). |
| [x] | 30 | `ennemis/squelette/combat.png` | 512 × 256 | Squelette en armure rouillée, épée et bouclier cassés, lueur bleue dans les orbites. |

### 1.6 Aveline (compagne de la version 1) — portraits

Description : femme de 24 ans, chevalière, cheveux châtain cuivré en tresse courte, yeux gris-vert, petite cicatrice au menton, armure argentée aux liserés bleu et or, cape bleue. Buste, fond transparent, **même cadrage pour les 6 expressions**.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 31 | `personnages/compagnes/aveline/portrait-neutre.png` | 512 × 512 | Visage sérieux, regard droit. |
| [ ] | 32 | `personnages/compagnes/aveline/portrait-joie.png` | 512 × 512 | Sourire franc, un peu maladroit. |
| [ ] | 33 | `personnages/compagnes/aveline/portrait-colere.png` | 512 × 512 | Sourcils froncés, mâchoire serrée. |
| [ ] | 34 | `personnages/compagnes/aveline/portrait-tristesse.png` | 512 × 512 | Regard baissé, yeux humides. |
| [ ] | 35 | `personnages/compagnes/aveline/portrait-gene.png` | 512 × 512 | Rougissement, détourne le regard (scènes de flirt). |
| [ ] | 36 | `personnages/compagnes/aveline/portrait-surprise.png` | 512 × 512 | Yeux écarquillés, bouche entrouverte. |

---

## PRIORITÉ 2 — chapitre 1 complet

### 2.1 Décors du chapitre 1

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 37 | `decors/taverne.png` | 1280 × 720 | Taverne chaleureuse « Le Chaudron Fêlé » : comptoir, tonneaux, cheminée, clients. |
| [ ] | 38 | `decors/chateau-trone.png` | 1280 × 720 | Salle du trône du château de Lysmont : tapis bleu, trône doré, bannières, gardes. |
| [ ] | 39 | `decors/combe-aux-saules.png` | 1280 × 720 | Forêt de saules au crépuscule, ruisseau, brume légère. |
| [ ] | 40 | `decors/quartier-tanneurs.png` | 1280 × 720 | Ruelles pauvres de Lysmont : cuves de teinture, linge suspendu, ambiance inquiétante. |
| [ ] | 41 | `decors/lysmont-lanternes-nuit.png` | 1280 × 720 | La place de Lysmont la nuit de la Fête des Lanternes : lanternes flottantes dans le ciel, puis incendie au loin (une seule image : fête + premières flammes). |
| [ ] | 42 | `decors/arene.png` | 1280 × 720 | Arène du tournoi des écuyers : gradins, drapeaux, sable. |
| [ ] | 43 | `decors/crypte-entree.png` | 1280 × 720 | Entrée extérieure de la Crypte de la Fontaine : ruines couvertes de lierre, escalier qui descend. |

### 2.2 Décors du prologue d'enfance (réincarnés) — sans personnages

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 44 | `decors/prologue-campagne.png` | 1280 × 720 | Ferme et champs de blé, petite maison en pierre (origine : enfant de fermier). |
| [ ] | 45 | `decors/prologue-manoir.png` | 1280 × 720 | Jardin et façade d'un manoir de petite noblesse (origine : noble). |
| [ ] | 46 | `decors/prologue-orphelinat.png` | 1280 × 720 | Cour d'un orphelinat tenu par l'Ordre, chapelle blanche (origine : orphelin). |
| [ ] | 47 | `decors/prologue-boutique.png` | 1280 × 720 | Intérieur d'une boutique de marchand encombrée (origine : enfant de marchand). |
| [ ] | 48 | `decors/prologue-route-lysmont.png` | 1280 × 720 | Route au lever du soleil, Lysmont au loin (scène du départ à 17 ans). |

### 2.3 Fonds de combat supplémentaires

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 49 | `combat/fonds/foret.png` | 1280 × 720 | Sous-bois de la Combe-aux-Saules. |
| [ ] | 50 | `combat/fonds/rues-nuit.png` | 1280 × 720 | Rues de Lysmont la nuit, lanternes et incendie. |
| [ ] | 51 | `combat/fonds/arene.png` | 1280 × 720 | Sable de l'arène, gradins flous au fond. |

### 2.4 Ennemis du chapitre 1

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 52 | `ennemis/araignee-geante/combat.png` | 512 × 256 | Araignée de la taille d'un chien, carapace noire et violette. |
| [x] | 53 | `ennemis/bandit/combat.png` | 512 × 256 | Bandit humain, foulard sur le visage, gourdin ou dague. |
| [x] | 54 | `ennemis/cultiste/combat.png` | 512 × 256 | Cultiste des Cendres en robe grise à capuche, sceau violet brillant sur la main. |
| [ ] | 55 | `ennemis/golem-fontaine/combat.png` | 1024 × 512 | **Mini-boss** (cases de 128 × 128) : golem de pierre couvert de mousse, avec une fontaine dans le dos et de l'eau qui coule de ses bras. |
| [ ] | 56 | `ennemis/vorthak/combat.png` | 1024 × 512 | **Boss du chapitre 1** (cases de 128 × 128) : Vorthak, émissaire démon, grand, armure noire, cornes, épée à deux mains entourée de flammes violettes. |

### 2.5 Aveline en combat et en exploration

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 57 | `personnages/compagnes/aveline/combat.png` | 512 × 384 | Même format que les héros : épée longue et bouclier aux couleurs d'Aubeclaire. |
| [ ] | 58 | `personnages/compagnes/aveline/exploration.png` | 128 × 128 | Même format que les héros. |

### 2.6 Portraits des PNJ du chapitre 1 (style anime, fond transparent)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 59 | `personnages/pnj/seraphine/portrait-neutre.png` | 512 × 512 | Princesse, 21 ans : longs cheveux blond pâle, yeux bleu clair, robe de cour blanche et or, petit diadème, air espiègle. — expression : **neutre**. |
| [ ] | 60 | `personnages/pnj/seraphine/portrait-joie.png` | 512 × 512 | Même personnage — expression : **joie**. |
| [ ] | 61 | `personnages/pnj/seraphine/portrait-gene.png` | 512 × 512 | Même personnage — expression : **gene**. |
| [ ] | 62 | `personnages/pnj/elianne/portrait-neutre.png` | 512 × 512 | Prêtresse, 23 ans : cheveux noirs au carré, yeux ambre, robe blanche et voile brodé d'un soleil. — expression : **neutre**. |
| [ ] | 63 | `personnages/pnj/elianne/portrait-joie.png` | 512 × 512 | Même personnage — expression : **joie**. |
| [ ] | 64 | `personnages/pnj/elianne/portrait-tristesse.png` | 512 × 512 | Même personnage — expression : **tristesse**. |
| [ ] | 65 | `personnages/pnj/kaya/portrait-neutre.png` | 512 × 512 | Ourvalis (femme-loup), 22 ans : oreilles et queue de loup argentées, cheveux argent en bataille, yeux jaunes, tenue de cuir, bandeau rouge. — expression : **neutre**. |
| [ ] | 66 | `personnages/pnj/kaya/portrait-joie.png` | 512 × 512 | Même personnage — expression : **joie**. |
| [ ] | 67 | `personnages/pnj/kaya/portrait-colere.png` | 512 × 512 | Même personnage — expression : **colere**. |
| [ ] | 68 | `personnages/pnj/aureliath/portrait-neutre.png` | 512 × 512 | Grand Prieur de l'Ordre, environ 60 ans : crâne rasé, barbe blanche taillée, sourire bienveillant un peu trop parfait, robe blanche et or. — expression : **neutre**. |
| [ ] | 69 | `personnages/pnj/aureliath/portrait-colere.png` | 512 × 512 | Même personnage — expression : **colere**. |
| [ ] | 70 | `personnages/pnj/rowena/portrait-neutre.png` | 512 × 512 | Maîtresse de la Guilde, environ 45 ans : cheveux gris coupés court, cicatrice sur l'œil, veste d'aventurière, pipe. — expression : **neutre**. |
| [ ] | 71 | `personnages/pnj/rowena/portrait-joie.png` | 512 × 512 | Même personnage — expression : **joie**. |
| [ ] | 72 | `personnages/pnj/edmund-iv/portrait-neutre.png` | 512 × 512 | Roi d'Aubeclaire, environ 55 ans : couronne, barbe grise, air fatigué et dur, manteau d'hermine bleu. — expression : **neutre**. |
| [ ] | 73 | `personnages/pnj/vorthak/portrait-neutre.png` | 512 × 512 | Émissaire démon : visage gris anguleux, cornes, yeux violets brillants, sourire cruel. — expression : **neutre**. |

### 2.7 Calques de race (superposés aux sprites de classe)

**Même gabarit exact** que les planches de classe (mêmes lignes, mêmes images), fond transparent, **uniquement les éléments de la race**, placés image par image à l'endroit de la tête et du corps. Le jeu les superpose automatiquement à n'importe quelle classe. L'humain n'a pas de calque. Voir [`GRAPHISMES.md`](GRAPHISMES.md) § 4.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 74 | `personnages/races/elfe/calque-combat.png` | 512 × 384 | **Elfe** : longues oreilles pointues. |
| [x] | 75 | `personnages/races/elfe/calque-exploration.png` | 128 × 128 | **Elfe** : mêmes éléments, en petit. |
| [x] | 76 | `personnages/races/demi-elfe/calque-combat.png` | 512 × 384 | **Demi-elfe** : oreilles légèrement pointues. |
| [x] | 77 | `personnages/races/demi-elfe/calque-exploration.png` | 128 × 128 | **Demi-elfe** : mêmes éléments, en petit. |
| [x] | 78 | `personnages/races/nain/calque-combat.png` | 512 × 384 | **Nain** : barbe fournie et tressée (le jeu réduit lui-même la taille à 90 %). |
| [x] | 79 | `personnages/races/nain/calque-exploration.png` | 128 × 128 | **Nain** : mêmes éléments, en petit. |
| [x] | 80 | `personnages/races/ourvalis/calque-combat.png` | 512 × 384 | **Ourvalis** : oreilles de loup gris argent + queue de loup. |
| [x] | 81 | `personnages/races/ourvalis/calque-exploration.png` | 128 × 128 | **Ourvalis** : mêmes éléments, en petit. |
| [x] | 82 | `personnages/races/vulpin/calque-combat.png` | 512 × 384 | **Vulpin** : oreilles de renard roux à pointe blanche + queue touffue. |
| [x] | 83 | `personnages/races/vulpin/calque-exploration.png` | 128 × 128 | **Vulpin** : mêmes éléments, en petit. |
| [x] | 84 | `personnages/races/demi-demon/calque-combat.png` | 512 × 384 | **Demi-démon** : petites cornes noires recourbées + fine queue en pointe (le jeu applique la teinte gris-violet de la peau). |
| [x] | 85 | `personnages/races/demi-demon/calque-exploration.png` | 128 × 128 | **Demi-démon** : mêmes éléments, en petit. |
| [x] | 86 | `personnages/races/sang-dragon/calque-combat.png` | 512 × 384 | **Sang-dragon** : deux petites cornes + écailles rouges sur les joues et les avant-bras. |
| [x] | 87 | `personnages/races/sang-dragon/calque-exploration.png` | 128 × 128 | **Sang-dragon** : mêmes éléments, en petit. |

### 2.8 Portraits par défaut des héros (un par race)

Utilisés si le joueur n'importe pas son propre portrait. Personnage adulte, tenue d'aventurier neutre (sans marque de classe), expression déterminée.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 88 | `personnages/races/humain/portrait-defaut.png` | 512 × 512 | **Humain** adulte, tenue d'aventurier, cape de voyage. |
| [ ] | 89 | `personnages/races/elfe/portrait-defaut.png` | 512 × 512 | Elfe adulte, traits fins, longues oreilles pointues, cheveux clairs, tenue verte et argent. |
| [ ] | 90 | `personnages/races/demi-elfe/portrait-defaut.png` | 512 × 512 | Demi-elfe adulte, oreilles légèrement pointues, mélange de traits humains et elfes, tenue de voyage. |
| [ ] | 91 | `personnages/races/nain/portrait-defaut.png` | 512 × 512 | Nain adulte, large carrure, barbe tressée ornée d'anneaux de métal, tenue de forgeron et d'aventurier. |
| [ ] | 92 | `personnages/races/ourvalis/portrait-defaut.png` | 512 × 512 | Ourvalis adulte (peuple-loup), oreilles et queue de loup gris argent, yeux jaunes, peintures tribales discrètes. |
| [ ] | 93 | `personnages/races/vulpin/portrait-defaut.png` | 512 × 512 | Vulpin adulte (peuple-renard), oreilles de renard roux, sourire malicieux, tenue de marchand nomade. |
| [ ] | 94 | `personnages/races/demi-demon/portrait-defaut.png` | 512 × 512 | Demi-démon adulte, peau gris-violet, petites cornes noires, yeux rouge sombre, cape à capuche. |
| [ ] | 95 | `personnages/races/sang-dragon/portrait-defaut.png` | 512 × 512 | Sang-dragon adulte, petites cornes, écailles rouges sur les joues, yeux dorés à pupille fendue, tenue de marin de l'Archipel. |

### 2.9 Effets de combat

Une ligne de 6 à 8 cases de 64 × 64, soit au plus 512 × 64.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 96 | `effets/entaille.png` | ≤ 512 × 64 | Trait de lame blanc. |
| [ ] | 97 | `effets/impact.png` | ≤ 512 × 64 | Choc physique (étoile, poussière). |
| [ ] | 98 | `effets/feu.png` | ≤ 512 × 64 | Explosion de flammes orange. |
| [ ] | 99 | `effets/glace.png` | ≤ 512 × 64 | Cristaux de glace qui éclatent. |
| [ ] | 100 | `effets/foudre.png` | ≤ 512 × 64 | Éclair jaune. |
| [ ] | 101 | `effets/soin.png` | ≤ 512 × 64 | Particules vertes et dorées qui montent. |
| [ ] | 102 | `effets/poison.png` | ≤ 512 × 64 | Bulles vertes. |
| [ ] | 103 | `effets/rune.png` | ≤ 512 × 64 | Cercle de rune bleu qui tourne. |
| [ ] | 104 | `effets/bouclier.png` | ≤ 512 × 64 | Dôme translucide bleu. |
| [ ] | 105 | `effets/bonus.png` | ≤ 512 × 64 | Flèche dorée qui monte (amélioration). |
| [ ] | 106 | `effets/malus.png` | ≤ 512 × 64 | Flèche violette qui descend (affaiblissement). |
| [ ] | 107 | `effets/critique.png` | ≤ 512 × 64 | Éclat rouge et blanc. |
| [ ] | 108 | `effets/sacre.png` | ≤ 512 × 64 | Rayon de lumière dorée. |
| [ ] | 109 | `effets/ombre.png` | ≤ 512 × 64 | Volutes violettes. |
| [ ] | 110 | `effets/invocation.png` | ≤ 512 × 64 | Cercle vert et fumée. |

---

## PRIORITÉ 3 — finitions

### 3.1 Icônes de compétences (32 × 32)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 111 | `icones/competences/runes-gravees.png` | 32 × 32 | Classe lame-runique (passif). |
| [ ] | 112 | `icones/competences/entaille-runique.png` | 32 × 32 | Classe lame-runique. |
| [ ] | 113 | `icones/competences/rune-de-garde.png` | 32 × 32 | Classe lame-runique. |
| [ ] | 114 | `icones/competences/resonance.png` | 32 × 32 | Classe arcaniste (passif). |
| [ ] | 115 | `icones/competences/javelot-de-flamme.png` | 32 × 32 | Classe arcaniste. |
| [ ] | 116 | `icones/competences/onde-de-givre.png` | 32 × 32 | Classe arcaniste. |
| [ ] | 117 | `icones/competences/lien-d-ame.png` | 32 × 32 | Classe invocateur (passif). |
| [ ] | 118 | `icones/competences/gardien-de-pierre.png` | 32 × 32 | Classe invocateur. |
| [ ] | 119 | `icones/competences/echange-d-ame.png` | 32 × 32 | Classe invocateur. |
| [ ] | 120 | `icones/competences/dans-le-dos.png` | 32 × 32 | Classe ombre (passif). |
| [ ] | 121 | `icones/competences/pas-d-ombre.png` | 32 × 32 | Classe ombre. |
| [ ] | 122 | `icones/competences/lame-empoisonnee.png` | 32 × 32 | Classe ombre. |
| [ ] | 123 | `icones/competences/rempart.png` | 32 × 32 | Classe gardien (passif). |
| [ ] | 124 | `icones/competences/provocation-sainte.png` | 32 × 32 | Classe gardien. |
| [ ] | 125 | `icones/competences/bouclier-d-aube.png` | 32 × 32 | Classe gardien. |
| [ ] | 126 | `icones/competences/fioles-optimisees.png` | 32 × 32 | Classe alchimiste (passif). |
| [ ] | 127 | `icones/competences/bombe-collante.png` | 32 × 32 | Classe alchimiste. |
| [ ] | 128 | `icones/competences/tourelle-mecanique.png` | 32 × 32 | Classe alchimiste. |
| [ ] | 129 | `icones/competences/oeil-du-faucon.png` | 32 × 32 | Classe archer (passif). |
| [ ] | 130 | `icones/competences/fleche-marquante.png` | 32 × 32 | Classe archer. |
| [ ] | 131 | `icones/competences/volee-d-esprits.png` | 32 × 32 | Classe archer. |
| [ ] | 132 | `icones/competences/main-bienveillante.png` | 32 × 32 | Classe guerisseur (passif). |
| [ ] | 133 | `icones/competences/lumiere-apaisante.png` | 32 × 32 | Classe guerisseur. |
| [ ] | 134 | `icones/competences/purification.png` | 32 × 32 | Classe guerisseur. |
| [ ] | 135 | `icones/competences/sang-de-dragon.png` | 32 × 32 | Classe berserker (passif). |
| [ ] | 136 | `icones/competences/fendoir-furieux.png` | 32 × 32 | Classe berserker. |
| [ ] | 137 | `icones/competences/rugissement.png` | 32 × 32 | Classe berserker. |
| [ ] | 138 | `icones/competences/refrain.png` | 32 × 32 | Classe barde (passif). |
| [ ] | 139 | `icones/competences/ballade-du-courage.png` | 32 × 32 | Classe barde. |
| [ ] | 140 | `icones/competences/berceuse.png` | 32 × 32 | Classe barde. |

### 3.2 Icônes de dons (32 × 32)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 141 | `icones/dons/oeil-du-seuil.png` | 32 × 32 | Œil stylisé dans un cercle de runes. |
| [ ] | 142 | `icones/dons/reserve-du-neant.png` | 32 × 32 | Sac ouvert sur un vide étoilé. |
| [ ] | 143 | `icones/dons/langue-universelle.png` | 32 × 32 | Bulle de dialogue avec des symboles. |
| [ ] | 144 | `icones/dons/second-depart.png` | 32 × 32 | Sablier qui tourne à l'envers. |
| [ ] | 145 | `icones/dons/croissance-acceleree.png` | 32 × 32 | Pousse verte qui grandit vers le haut. |
| [ ] | 146 | `icones/dons/benediction-de-fortune.png` | 32 × 32 | Trèfle doré ou dé. |
| [ ] | 147 | `icones/dons/mimetisme.png` | 32 × 32 | Masque avec un reflet. |
| [ ] | 148 | `icones/dons/coeur-inepuisable.png` | 32 × 32 | Cœur rouge entouré d'une aura. |
| [ ] | 149 | `icones/dons/lien-des-betes.png` | 32 × 32 | Patte de bête et main liées. |
| [ ] | 150 | `icones/dons/main-de-l-artisan.png` | 32 × 32 | Marteau et étincelles. |
| [ ] | 151 | `icones/dons/aura-de-l-elu.png` | 32 × 32 | Silhouette rayonnante. |
| [ ] | 152 | `icones/dons/pas-de-l-ombre.png` | 32 × 32 | Empreinte de pas qui se dissipe en fumée. |

### 3.3 Icônes de traits raciaux (32 × 32)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [x] | 153 | `icones/races/determination.png` | 32 × 32 | Humain : poing serré lumineux. |
| [x] | 154 | `icones/races/sang-ancien.png` | 32 × 32 | Elfe : feuille argentée et étoile. |
| [x] | 155 | `icones/races/entre-deux-mondes.png` | 32 × 32 | Demi-elfe : deux mains qui se rejoignent. |
| [x] | 156 | `icones/races/robuste.png` | 32 × 32 | Nain : enclume et bouclier. |
| [x] | 157 | `icones/races/instinct-de-meute.png` | 32 × 32 | Ourvalis : trois griffures. |
| [x] | 158 | `icones/races/ruse.png` | 32 × 32 | Vulpin : queue de renard enroulée. |
| [x] | 159 | `icones/races/sang-cendre.png` | 32 × 32 | Demi-démon : goutte de sang violette et flamme noire. |
| [x] | 160 | `icones/races/ecailles-et-souffle.png` | 32 × 32 | Sang-dragon : écaille rouge et petite flamme. |

### 3.4 Icônes d'objets (32 × 32)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 161 | `icones/objets/potion-soin-petite.png` | 32 × 32 | Petite fiole rouge. |
| [ ] | 162 | `icones/objets/potion-soin.png` | 32 × 32 | Grande fiole rouge. |
| [ ] | 163 | `icones/objets/potion-mana.png` | 32 × 32 | Fiole bleue. |
| [ ] | 164 | `icones/objets/antidote.png` | 32 × 32 | Fiole verte. |
| [ ] | 165 | `icones/objets/bombe-feu.png` | 32 × 32 | Bombe ronde avec une mèche. |
| [ ] | 166 | `icones/objets/bombe-fumee.png` | 32 × 32 | Sphère grise fumante. |
| [ ] | 167 | `icones/objets/parchemin-retour.png` | 32 × 32 | Parchemin roulé avec un sceau. |
| [ ] | 168 | `icones/objets/ration.png` | 32 × 32 | Pain et fromage. |
| [ ] | 169 | `icones/objets/gateau-lysmont.png` | 32 × 32 | Pâtisserie à la crème (cadeau préféré d'Aveline). |
| [ ] | 170 | `icones/objets/kit-entretien-armes.png` | 32 × 32 | Pierre à aiguiser et chiffon (cadeau apprécié). |
| [ ] | 171 | `icones/objets/bijou-dore.png` | 32 × 32 | Collier doré clinquant (cadeau détesté par Aveline). |
| [ ] | 172 | `icones/objets/fleur-des-champs.png` | 32 × 32 | Petit bouquet. |
| [ ] | 173 | `icones/objets/livre-ancien.png` | 32 × 32 | Livre relié de cuir. |
| [ ] | 174 | `icones/objets/epee-courte.png` | 32 × 32 | Épée courte. |
| [ ] | 175 | `icones/objets/baton-apprenti.png` | 32 × 32 | Bâton de mage simple. |
| [ ] | 176 | `icones/objets/arc-court.png` | 32 × 32 | Arc court. |
| [ ] | 177 | `icones/objets/dague.png` | 32 × 32 | Dague. |
| [ ] | 178 | `icones/objets/bouclier-bois.png` | 32 × 32 | Bouclier rond en bois. |
| [ ] | 179 | `icones/objets/armure-cuir.png` | 32 × 32 | Plastron de cuir. |
| [ ] | 180 | `icones/objets/robe-mage.png` | 32 × 32 | Robe de tissu. |
| [ ] | 181 | `icones/objets/sceau-cendre.png` | 32 × 32 | Fragment de pierre noire marqué d'une rune violette (objet de quête). |
| [ ] | 182 | `icones/objets/cle-crypte.png` | 32 × 32 | Vieille clé de bronze (objet de quête). |
| [ ] | 183 | `icones/objets/piece-or.png` | 32 × 32 | Pièce d'or (monnaie, aussi en 16 × 16). |

### 3.5 Interface

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 184 | `interface/panneau-9slice.png` | 48 × 48 | Cadre de fenêtre : coins de 16 × 16 et bords répétables (bois sombre et liseré doré, ou parchemin). |
| [ ] | 185 | `interface/bulle-dialogue-9slice.png` | 48 × 48 | Cadre de boîte de dialogue, même principe. |
| [ ] | 186 | `interface/bouton.png` | 96 × 96 | Bouton de 96 × 32 en 3 états empilés : normal, survol, appuyé. |
| [ ] | 187 | `interface/barre-fond.png` | 128 × 12 | Fond vide d'une barre (PV, mana, XP). |
| [ ] | 188 | `interface/barre-pv.png` | 128 × 12 | Remplissage rouge. |
| [ ] | 189 | `interface/barre-mana.png` | 128 × 12 | Remplissage bleu. |
| [ ] | 190 | `interface/barre-xp.png` | 128 × 12 | Remplissage doré. |
| [ ] | 191 | `interface/cadre-portrait.png` | 160 × 160 | Cadre décoratif pour les portraits dans l'interface. |
| [ ] | 192 | `interface/curseur.png` | 32 × 32 | Curseur en forme de gantelet ou de flèche. |
| [ ] | 193 | `interface/indicateur-tour.png` | 32 × 32 | Flèche ou triangle qui désigne le combattant actif (2 images d'animation, 64 × 32). |
| [ ] | 194 | `interface/marqueur-carte.png` | 128 × 32 | Marqueur de lieu sur la carte (4 images d'animation de 32 × 32). |
| [ ] | 195 | `interface/icone-quete-principale.png` | 16 × 16 | Point d'exclamation doré. |
| [ ] | 196 | `interface/icone-quete-secondaire.png` | 16 × 16 | Point d'exclamation argenté. |
| [ ] | 197 | `interface/icone-contrat.png` | 16 × 16 | Petit parchemin. |
| [ ] | 198 | `interface/icone-coeur.png` | 16 × 16 | Cœur (affinité), en 5 variantes de 16 × 16 alignées pour les 5 paliers, soit 80 × 16. |
| [ ] | 199 | `interface/titre-logo.png` | 640 × 240 | Logo « Les Appelés de Velmaris ». |
| [ ] | 200 | `interface/ecran-titre.png` | 1280 × 720 | Illustration de l'écran titre : le cercle d'invocation et le Voile qui se déchire. |

### 3.6 Variantes et carte du monde

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 201 | `cartes/monde.png` | 1920 × 1080 | Carte complète de Velmaris avec les 6 régions (voir la conception, § 2.2), le Mur d'Aube et les Terres Cendrées au nord, sans texte. |
| [ ] | 202 | `personnages/heros/lame-runique/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Lame runique**. |
| [ ] | 203 | `personnages/heros/arcaniste/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Arcaniste élémentaire**. |
| [ ] | 204 | `personnages/heros/invocateur/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Invocateur**. |
| [ ] | 205 | `personnages/heros/ombre/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Ombre**. |
| [ ] | 206 | `personnages/heros/gardien/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Gardien sacré**. |
| [ ] | 207 | `personnages/heros/alchimiste/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Alchimiste-artificier**. |
| [ ] | 208 | `personnages/heros/archer/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Archer spirituel**. |
| [ ] | 209 | `personnages/heros/guerisseur/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Guérisseur**. |
| [ ] | 210 | `personnages/heros/berserker/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Berserker draconique**. |
| [ ] | 211 | `personnages/heros/barde/combat-2.png (+ exploration-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Barde enchanteur**. |

---

## Récapitulatif

- **211 lignes** dans la liste ci-dessus (une ligne = un fichier, sauf la dernière section où une ligne regroupe 2 variantes).
- Si le temps manque, faites **la priorité 1** : c'est elle qui rend le jeu présentable pour le premier test.

## À prévoir pour les chapitres suivants (estimation par chapitre)

| Élément | Quantité par chapitre |
|---|---|
| Carte de région | 1 |
| Tileset de donjon | 1 |
| Décors de scène | 6 à 8 |
| Fonds de combat | 2 ou 3 |
| Ennemis | 5 à 7, dont 1 mini-boss et 1 boss |
| Nouvelle(s) compagne(s) | 1 ou 2 (6 portraits + planche de combat + planche d'exploration chacune) |
| Portraits de PNJ | 4 à 6 |
| Icônes | Nouvelles compétences de l'arbre (environ 20 par chapitre pour les 10 classes) et nouveaux objets |

Je fournirai la liste détaillée de chaque chapitre au moment de le développer.
