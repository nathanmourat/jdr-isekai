# Liste détaillée des textures — Version jouable 1 (chapitre 1)

> Format, règles techniques et style : voir [`GRAPHISMES.md`](GRAPHISMES.md).
> Cochez une case (`[x]`) quand l'image est faite. Une image manquante est remplacée en jeu par un provisoire, donc vous pouvez livrer dans l'ordre que vous voulez. **Commencez par la priorité 1.**
> Rappels : PNG, fond transparent (sauf décors, fonds et cartes) ; pixel art sans flou ; portraits de style anime en 512 × 512.

---

## PRIORITÉ 1 — indispensable pour tester

### 1.1 Carte, décors et fonds de combat

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 1 | `cartes/aubeclaire.png` | 1920 × 1080 | Carte du royaume vue du dessus, style carte ancienne en pixel art. Y faire figurer : Lysmont (capitale, au centre), le Temple du Seuil (sur une colline au nord de Lysmont), la Combe-aux-Saules (forêt au sud-ouest), la Crypte de la Fontaine (ruines à l'est), des routes, une rivière, et le Mur d'Aube au loin, au nord. Aucun texte (j'ajoute les noms en jeu). |
| [ ] | 2 | `decors/temple-du-seuil.png` | 1280 × 720 | Intérieur d'un grand temple blanc, cercle d'invocation lumineux bleu au sol, vitraux en forme de soleil, prêtres en robe blanche en arrière-plan. |
| [ ] | 3 | `decors/lysmont-place.png` | 1280 × 720 | Place centrale de la capitale en plein jour : fontaine, étals, maisons à colombages, château blanc aux toits bleus au fond. |
| [ ] | 4 | `decors/guilde.png` | 1280 × 720 | Hall de la Guilde des aventuriers : comptoir d'accueil, grand tableau de contrats couvert d'affiches, tables, aventuriers en armes, bannière avec une rose des vents. |
| [ ] | 5 | `combat/fonds/plaine.png` | 1280 × 720 | Plaine herbeuse avec un chemin de terre et un ciel clair ; le sol occupe le tiers inférieur. |
| [ ] | 6 | `combat/fonds/crypte.png` | 1280 × 720 | Salle de crypte en pierre, torches, colonnes ; sol dallé sur le tiers inférieur. |

### 1.2 Tileset du donjon « Crypte de la Fontaine »

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|

Un seul fichier `tuiles/crypte.png`, avec des **tuiles de 32 × 32 alignées sur une grille, 8 tuiles par ligne** (256 px de large). L'ordre n'a pas d'importance : envoyez-moi une capture annotée ou listez les positions, et je fais la correspondance. Tuiles nécessaires :

| [ ] | 7 | `tuiles/crypte.png` | 256 × N | Environ 45 tuiles : Sol dallé (3 variantes) ; Sol fissuré ; Mur vu de face (2 variantes) ; Haut de mur (vu de dessus) ; 4 angles de mur extérieurs ; 4 angles de mur intérieurs ; Bord de mur gauche, droite et bas ; Porte fermée ; Porte ouverte ; Escalier descendant ; Escalier montant ; Coffre fermé ; Coffre ouvert ; Torche murale (4 images d'animation) ; Plaque de piège inactive ; Plaque de piège activée (pics) ; Fontaine asséchée (bloc de 2 × 2 tuiles) ; Sarcophage (bloc de 1 × 2 tuiles) ; Tas d'os ; Gravats ; Toile d'araignée (coin) ; Levier (haut et bas) ; Grille de herse fermée et ouverte ; Sceau cendré au sol (rune violette, 2 images d'animation). |

### 1.3 Héros — planches de combat (une par classe)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|

Planche de **512 × 384** : 6 lignes de 8 cases de 64 × 64, personnage **tourné vers la droite**. Lignes : 1 attente (4 images), 2 attaque (6), 3 sort ou compétence (4), 4 touché (2), 5 K.O. (3), 6 victoire (4, facultatif). Les cases inutilisées restent vides.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 8 | `personnages/heros/lame-runique/combat.png` | 512 × 384 | **Lame runique** : guerrier en armure légère, épée gravée de runes lumineuses bleues. |
| [ ] | 9 | `personnages/heros/arcaniste/combat.png` | 512 × 384 | **Arcaniste élémentaire** : mage en robe, bâton, petites flammes et cristaux de glace qui flottent. |
| [ ] | 10 | `personnages/heros/invocateur/combat.png` | 512 × 384 | **Invocateur** : mage à capuche, grimoire ouvert, cercle magique vert. |
| [ ] | 11 | `personnages/heros/ombre/combat.png` | 512 × 384 | **Ombre** : assassin encapuchonné, foulard, deux dagues. |
| [ ] | 12 | `personnages/heros/gardien/combat.png` | 512 × 384 | **Gardien sacré** : armure lourde blanche et or, grand bouclier, masse. |
| [ ] | 13 | `personnages/heros/alchimiste/combat.png` | 512 × 384 | **Alchimiste-artificier** : lunettes de protection, tablier, ceinture de fioles, clé à molette. |
| [ ] | 14 | `personnages/heros/archer/combat.png` | 512 × 384 | **Archer spirituel** : tenue de rôdeur verte, arc long, flèches aux pointes lumineuses. |
| [ ] | 15 | `personnages/heros/guerisseur/combat.png` | 512 × 384 | **Guérisseur** : robe claire, bâton surmonté d'un soleil, sacoche de soins. |
| [ ] | 16 | `personnages/heros/berserker/combat.png` | 512 × 384 | **Berserker draconique** : torse protégé par des écailles rouges, grande hache, cheveux en bataille. |
| [ ] | 17 | `personnages/heros/barde/combat.png` | 512 × 384 | **Barde enchanteur** : tenue colorée, chapeau à plume, luth. |

### 1.4 Héros — planches d'exploration (une par classe)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|

Planche de **128 × 128** : 4 lignes de 4 cases de 32 × 32. Lignes : marche vers le bas, vers la gauche, vers la droite, vers le haut. Même tenue que la planche de combat, en plus petit.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 18 | `personnages/heros/lame-runique/exploration.png` | 128 × 128 | **Lame runique** en marche. |
| [ ] | 19 | `personnages/heros/arcaniste/exploration.png` | 128 × 128 | **Arcaniste élémentaire** en marche. |
| [ ] | 20 | `personnages/heros/invocateur/exploration.png` | 128 × 128 | **Invocateur** en marche. |
| [ ] | 21 | `personnages/heros/ombre/exploration.png` | 128 × 128 | **Ombre** en marche. |
| [ ] | 22 | `personnages/heros/gardien/exploration.png` | 128 × 128 | **Gardien sacré** en marche. |
| [ ] | 23 | `personnages/heros/alchimiste/exploration.png` | 128 × 128 | **Alchimiste-artificier** en marche. |
| [ ] | 24 | `personnages/heros/archer/exploration.png` | 128 × 128 | **Archer spirituel** en marche. |
| [ ] | 25 | `personnages/heros/guerisseur/exploration.png` | 128 × 128 | **Guérisseur** en marche. |
| [ ] | 26 | `personnages/heros/berserker/exploration.png` | 128 × 128 | **Berserker draconique** en marche. |
| [ ] | 27 | `personnages/heros/barde/exploration.png` | 128 × 128 | **Barde enchanteur** en marche. |

### 1.5 Ennemis de base

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|

Planche de **512 × 256** : 4 lignes de 8 cases de 64 × 64, ennemi **tourné vers la gauche**. Lignes : attente (4 images), attaque (6), touché (2), K.O. (3).

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 28 | `ennemis/loup-gris/combat.png` | 512 × 256 | Grand loup gris, poils hérissés, yeux jaunes. |
| [ ] | 29 | `ennemis/gobelin-cendre/combat.png` | 512 × 256 | Gobelin à la peau gris cendre, yeux rouges, lance rouillée, marques violettes (corrompu par les Cendres). |
| [ ] | 30 | `ennemis/squelette/combat.png` | 512 × 256 | Squelette en armure rouillée, épée et bouclier cassés, lueur bleue dans les orbites. |

### 1.6 Aveline (compagne de la version 1) — portraits

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|

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
| [ ] | 52 | `ennemis/araignee-geante/combat.png` | 512 × 256 | Araignée de la taille d'un chien, carapace noire et violette. |
| [ ] | 53 | `ennemis/bandit/combat.png` | 512 × 256 | Bandit humain, foulard sur le visage, gourdin ou dague. |
| [ ] | 54 | `ennemis/cultiste/combat.png` | 512 × 256 | Cultiste des Cendres en robe grise à capuche, sceau violet brillant sur la main. |
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
| [ ] | 68 | `personnages/pnj/mathis/portrait-neutre.png` | 512 × 512 | Grand Prieur de l'Ordre, environ 60 ans : crâne rasé, barbe blanche taillée, sourire bienveillant un peu trop parfait, robe blanche et or. — expression : **neutre**. |
| [ ] | 69 | `personnages/pnj/mathis/portrait-colere.png` | 512 × 512 | Même personnage — expression : **colere**. |
| [ ] | 70 | `personnages/pnj/rowena/portrait-neutre.png` | 512 × 512 | Maîtresse de la Guilde, environ 45 ans : cheveux gris coupés court, cicatrice sur l'œil, veste d'aventurière, pipe. — expression : **neutre**. |
| [ ] | 71 | `personnages/pnj/rowena/portrait-joie.png` | 512 × 512 | Même personnage — expression : **joie**. |
| [ ] | 72 | `personnages/pnj/edmund-iv/portrait-neutre.png` | 512 × 512 | Roi d'Aubeclaire, environ 55 ans : couronne, barbe grise, air fatigué et dur, manteau d'hermine bleu. — expression : **neutre**. |
| [ ] | 73 | `personnages/pnj/vorthak/portrait-neutre.png` | 512 × 512 | Émissaire démon : visage gris anguleux, cornes, yeux violets brillants, sourire cruel. — expression : **neutre**. |

### 2.7 Portraits par défaut des héros (un par classe)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|

Utilisés si le joueur n'importe pas son propre portrait. Mêmes tenues que les sprites de combat.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 74 | `personnages/heros/lame-runique/portrait-defaut.png` | 512 × 512 | **Lame runique**, adulte, expression déterminée. |
| [ ] | 75 | `personnages/heros/arcaniste/portrait-defaut.png` | 512 × 512 | **Arcaniste élémentaire**, adulte, expression déterminée. |
| [ ] | 76 | `personnages/heros/invocateur/portrait-defaut.png` | 512 × 512 | **Invocateur**, adulte, expression déterminée. |
| [ ] | 77 | `personnages/heros/ombre/portrait-defaut.png` | 512 × 512 | **Ombre**, adulte, expression déterminée. |
| [ ] | 78 | `personnages/heros/gardien/portrait-defaut.png` | 512 × 512 | **Gardien sacré**, adulte, expression déterminée. |
| [ ] | 79 | `personnages/heros/alchimiste/portrait-defaut.png` | 512 × 512 | **Alchimiste-artificier**, adulte, expression déterminée. |
| [ ] | 80 | `personnages/heros/archer/portrait-defaut.png` | 512 × 512 | **Archer spirituel**, adulte, expression déterminée. |
| [ ] | 81 | `personnages/heros/guerisseur/portrait-defaut.png` | 512 × 512 | **Guérisseur**, adulte, expression déterminée. |
| [ ] | 82 | `personnages/heros/berserker/portrait-defaut.png` | 512 × 512 | **Berserker draconique**, adulte, expression déterminée. |
| [ ] | 83 | `personnages/heros/barde/portrait-defaut.png` | 512 × 512 | **Barde enchanteur**, adulte, expression déterminée. |

### 2.8 Effets de combat

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|

Une ligne de 6 à 8 cases de 64 × 64, soit au plus 512 × 64.

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 84 | `effets/entaille.png` | ≤ 512 × 64 | Trait de lame blanc. |
| [ ] | 85 | `effets/impact.png` | ≤ 512 × 64 | Choc physique (étoile, poussière). |
| [ ] | 86 | `effets/feu.png` | ≤ 512 × 64 | Explosion de flammes orange. |
| [ ] | 87 | `effets/glace.png` | ≤ 512 × 64 | Cristaux de glace qui éclatent. |
| [ ] | 88 | `effets/foudre.png` | ≤ 512 × 64 | Éclair jaune. |
| [ ] | 89 | `effets/soin.png` | ≤ 512 × 64 | Particules vertes et dorées qui montent. |
| [ ] | 90 | `effets/poison.png` | ≤ 512 × 64 | Bulles vertes. |
| [ ] | 91 | `effets/rune.png` | ≤ 512 × 64 | Cercle de rune bleu qui tourne. |
| [ ] | 92 | `effets/bouclier.png` | ≤ 512 × 64 | Dôme translucide bleu. |
| [ ] | 93 | `effets/bonus.png` | ≤ 512 × 64 | Flèche dorée qui monte (amélioration). |
| [ ] | 94 | `effets/malus.png` | ≤ 512 × 64 | Flèche violette qui descend (affaiblissement). |
| [ ] | 95 | `effets/critique.png` | ≤ 512 × 64 | Éclat rouge et blanc. |
| [ ] | 96 | `effets/sacre.png` | ≤ 512 × 64 | Rayon de lumière dorée. |
| [ ] | 97 | `effets/ombre.png` | ≤ 512 × 64 | Volutes violettes. |
| [ ] | 98 | `effets/invocation.png` | ≤ 512 × 64 | Cercle vert et fumée. |

---

## PRIORITÉ 3 — finitions

### 3.1 Icônes de compétences (32 × 32)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 99 | `icones/competences/runes-gravees.png` | 32 × 32 | Classe lame-runique (passif). |
| [ ] | 100 | `icones/competences/entaille-runique.png` | 32 × 32 | Classe lame-runique. |
| [ ] | 101 | `icones/competences/rune-de-garde.png` | 32 × 32 | Classe lame-runique. |
| [ ] | 102 | `icones/competences/resonance.png` | 32 × 32 | Classe arcaniste (passif). |
| [ ] | 103 | `icones/competences/javelot-de-flamme.png` | 32 × 32 | Classe arcaniste. |
| [ ] | 104 | `icones/competences/onde-de-givre.png` | 32 × 32 | Classe arcaniste. |
| [ ] | 105 | `icones/competences/lien-d-ame.png` | 32 × 32 | Classe invocateur (passif). |
| [ ] | 106 | `icones/competences/gardien-de-pierre.png` | 32 × 32 | Classe invocateur. |
| [ ] | 107 | `icones/competences/echange-d-ame.png` | 32 × 32 | Classe invocateur. |
| [ ] | 108 | `icones/competences/dans-le-dos.png` | 32 × 32 | Classe ombre (passif). |
| [ ] | 109 | `icones/competences/pas-d-ombre.png` | 32 × 32 | Classe ombre. |
| [ ] | 110 | `icones/competences/lame-empoisonnee.png` | 32 × 32 | Classe ombre. |
| [ ] | 111 | `icones/competences/rempart.png` | 32 × 32 | Classe gardien (passif). |
| [ ] | 112 | `icones/competences/provocation-sainte.png` | 32 × 32 | Classe gardien. |
| [ ] | 113 | `icones/competences/bouclier-d-aube.png` | 32 × 32 | Classe gardien. |
| [ ] | 114 | `icones/competences/fioles-optimisees.png` | 32 × 32 | Classe alchimiste (passif). |
| [ ] | 115 | `icones/competences/bombe-collante.png` | 32 × 32 | Classe alchimiste. |
| [ ] | 116 | `icones/competences/tourelle-mecanique.png` | 32 × 32 | Classe alchimiste. |
| [ ] | 117 | `icones/competences/oeil-du-faucon.png` | 32 × 32 | Classe archer (passif). |
| [ ] | 118 | `icones/competences/fleche-marquante.png` | 32 × 32 | Classe archer. |
| [ ] | 119 | `icones/competences/volee-d-esprits.png` | 32 × 32 | Classe archer. |
| [ ] | 120 | `icones/competences/main-bienveillante.png` | 32 × 32 | Classe guerisseur (passif). |
| [ ] | 121 | `icones/competences/lumiere-apaisante.png` | 32 × 32 | Classe guerisseur. |
| [ ] | 122 | `icones/competences/purification.png` | 32 × 32 | Classe guerisseur. |
| [ ] | 123 | `icones/competences/sang-de-dragon.png` | 32 × 32 | Classe berserker (passif). |
| [ ] | 124 | `icones/competences/fendoir-furieux.png` | 32 × 32 | Classe berserker. |
| [ ] | 125 | `icones/competences/rugissement.png` | 32 × 32 | Classe berserker. |
| [ ] | 126 | `icones/competences/refrain.png` | 32 × 32 | Classe barde (passif). |
| [ ] | 127 | `icones/competences/ballade-du-courage.png` | 32 × 32 | Classe barde. |
| [ ] | 128 | `icones/competences/berceuse.png` | 32 × 32 | Classe barde. |

### 3.2 Icônes de dons (32 × 32)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 129 | `icones/dons/oeil-du-seuil.png` | 32 × 32 | Œil stylisé dans un cercle de runes. |
| [ ] | 130 | `icones/dons/reserve-du-neant.png` | 32 × 32 | Sac ouvert sur un vide étoilé. |
| [ ] | 131 | `icones/dons/langue-universelle.png` | 32 × 32 | Bulle de dialogue avec des symboles. |
| [ ] | 132 | `icones/dons/second-depart.png` | 32 × 32 | Sablier qui tourne à l'envers. |
| [ ] | 133 | `icones/dons/croissance-acceleree.png` | 32 × 32 | Pousse verte qui grandit vers le haut. |
| [ ] | 134 | `icones/dons/benediction-de-fortune.png` | 32 × 32 | Trèfle doré ou dé. |
| [ ] | 135 | `icones/dons/mimetisme.png` | 32 × 32 | Masque avec un reflet. |
| [ ] | 136 | `icones/dons/coeur-inepuisable.png` | 32 × 32 | Cœur rouge entouré d'une aura. |
| [ ] | 137 | `icones/dons/lien-des-betes.png` | 32 × 32 | Patte de bête et main liées. |
| [ ] | 138 | `icones/dons/main-de-l-artisan.png` | 32 × 32 | Marteau et étincelles. |
| [ ] | 139 | `icones/dons/aura-de-l-elu.png` | 32 × 32 | Silhouette rayonnante. |
| [ ] | 140 | `icones/dons/pas-de-l-ombre.png` | 32 × 32 | Empreinte de pas qui se dissipe en fumée. |

### 3.3 Icônes d'objets (32 × 32)

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 141 | `icones/objets/potion-soin-petite.png` | 32 × 32 | Petite fiole rouge. |
| [ ] | 142 | `icones/objets/potion-soin.png` | 32 × 32 | Grande fiole rouge. |
| [ ] | 143 | `icones/objets/potion-mana.png` | 32 × 32 | Fiole bleue. |
| [ ] | 144 | `icones/objets/antidote.png` | 32 × 32 | Fiole verte. |
| [ ] | 145 | `icones/objets/bombe-feu.png` | 32 × 32 | Bombe ronde avec une mèche. |
| [ ] | 146 | `icones/objets/bombe-fumee.png` | 32 × 32 | Sphère grise fumante. |
| [ ] | 147 | `icones/objets/parchemin-retour.png` | 32 × 32 | Parchemin roulé avec un sceau. |
| [ ] | 148 | `icones/objets/ration.png` | 32 × 32 | Pain et fromage. |
| [ ] | 149 | `icones/objets/gateau-lysmont.png` | 32 × 32 | Pâtisserie à la crème (cadeau préféré d'Aveline). |
| [ ] | 150 | `icones/objets/kit-entretien-armes.png` | 32 × 32 | Pierre à aiguiser et chiffon (cadeau apprécié). |
| [ ] | 151 | `icones/objets/bijou-dore.png` | 32 × 32 | Collier doré clinquant (cadeau détesté par Aveline). |
| [ ] | 152 | `icones/objets/fleur-des-champs.png` | 32 × 32 | Petit bouquet. |
| [ ] | 153 | `icones/objets/livre-ancien.png` | 32 × 32 | Livre relié de cuir. |
| [ ] | 154 | `icones/objets/epee-courte.png` | 32 × 32 | Épée courte. |
| [ ] | 155 | `icones/objets/baton-apprenti.png` | 32 × 32 | Bâton de mage simple. |
| [ ] | 156 | `icones/objets/arc-court.png` | 32 × 32 | Arc court. |
| [ ] | 157 | `icones/objets/dague.png` | 32 × 32 | Dague. |
| [ ] | 158 | `icones/objets/bouclier-bois.png` | 32 × 32 | Bouclier rond en bois. |
| [ ] | 159 | `icones/objets/armure-cuir.png` | 32 × 32 | Plastron de cuir. |
| [ ] | 160 | `icones/objets/robe-mage.png` | 32 × 32 | Robe de tissu. |
| [ ] | 161 | `icones/objets/sceau-cendre.png` | 32 × 32 | Fragment de pierre noire marqué d'une rune violette (objet de quête). |
| [ ] | 162 | `icones/objets/cle-crypte.png` | 32 × 32 | Vieille clé de bronze (objet de quête). |
| [ ] | 163 | `icones/objets/piece-or.png` | 32 × 32 | Pièce d'or (monnaie, aussi en 16 × 16). |

### 3.4 Interface

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 164 | `interface/panneau-9slice.png` | 48 × 48 | Cadre de fenêtre : coins de 16 × 16 et bords répétables (bois sombre et liseré doré, ou parchemin). |
| [ ] | 165 | `interface/bulle-dialogue-9slice.png` | 48 × 48 | Cadre de boîte de dialogue, même principe. |
| [ ] | 166 | `interface/bouton.png` | 96 × 96 | Bouton de 96 × 32 en 3 états empilés : normal, survol, appuyé. |
| [ ] | 167 | `interface/barre-fond.png` | 128 × 12 | Fond vide d'une barre (PV, mana, XP). |
| [ ] | 168 | `interface/barre-pv.png` | 128 × 12 | Remplissage rouge. |
| [ ] | 169 | `interface/barre-mana.png` | 128 × 12 | Remplissage bleu. |
| [ ] | 170 | `interface/barre-xp.png` | 128 × 12 | Remplissage doré. |
| [ ] | 171 | `interface/cadre-portrait.png` | 160 × 160 | Cadre décoratif pour les portraits dans l'interface. |
| [ ] | 172 | `interface/curseur.png` | 32 × 32 | Curseur en forme de gantelet ou de flèche. |
| [ ] | 173 | `interface/indicateur-tour.png` | 32 × 32 | Flèche ou triangle qui désigne le combattant actif (2 images d'animation, 64 × 32). |
| [ ] | 174 | `interface/marqueur-carte.png` | 128 × 32 | Marqueur de lieu sur la carte (4 images d'animation de 32 × 32). |
| [ ] | 175 | `interface/icone-quete-principale.png` | 16 × 16 | Point d'exclamation doré. |
| [ ] | 176 | `interface/icone-quete-secondaire.png` | 16 × 16 | Point d'exclamation argenté. |
| [ ] | 177 | `interface/icone-contrat.png` | 16 × 16 | Petit parchemin. |
| [ ] | 178 | `interface/icone-coeur.png` | 16 × 16 | Cœur (affinité), en 5 variantes de 16 × 16 alignées pour les 5 paliers, soit 80 × 16. |
| [ ] | 179 | `interface/titre-logo.png` | 640 × 240 | Logo « Les Appelés de Velmaris ». |
| [ ] | 180 | `interface/ecran-titre.png` | 1280 × 720 | Illustration de l'écran titre : le cercle d'invocation et le Voile qui se déchire. |

### 3.5 Variantes et carte du monde

| Fait | N° | Fichier (dans `assets/`) | Dimensions | Contenu |
|---|---|---|---|---|
| [ ] | 181 | `cartes/monde.png` | 1920 × 1080 | Carte complète de Velmaris avec les 6 régions (voir la conception, § 2.2), le Mur d'Aube et les Terres Cendrées au nord, sans texte. |
| [ ] | 182 | `personnages/heros/lame-runique/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Lame runique**. |
| [ ] | 183 | `personnages/heros/arcaniste/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Arcaniste élémentaire**. |
| [ ] | 184 | `personnages/heros/invocateur/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Invocateur**. |
| [ ] | 185 | `personnages/heros/ombre/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Ombre**. |
| [ ] | 186 | `personnages/heros/gardien/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Gardien sacré**. |
| [ ] | 187 | `personnages/heros/alchimiste/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Alchimiste-artificier**. |
| [ ] | 188 | `personnages/heros/archer/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Archer spirituel**. |
| [ ] | 189 | `personnages/heros/guerisseur/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Guérisseur**. |
| [ ] | 190 | `personnages/heros/berserker/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Berserker draconique**. |
| [ ] | 191 | `personnages/heros/barde/combat-2.png (+ exploration-2, portrait-defaut-2)` | mêmes formats | Facultatif : variante de l'autre genre pour **Barde enchanteur**. |

---

## Récapitulatif

- **191 lignes** dans la liste ci-dessus (une ligne = un fichier, sauf la dernière section où une ligne regroupe 3 variantes).
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
