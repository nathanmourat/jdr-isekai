# Document de conception — « Les Appelés de Velmaris »

> Version 0.2 — **validée par le groupe le 13/11** (le point 9 reste à confirmer avec le graphiste).
> Les chiffres (statistiques, dégâts, seuils) sont des **valeurs de départ**. La simulation d'équilibrage de l'étape 2 les ajustera, puis ce document sera mis à jour.

---

## 1. Le jeu en bref

- **Genre** : jeu de rôle (JDR) isekai/fantasy, au tour par tour, coopératif, en français.
- **Joueurs** : de 1 à 6, identifiés par un **pseudo**. Un joueur peut rejoindre la partie à tout moment.
- **Support** : jeu web **en 2D** dans le navigateur, sur PC comme sur mobile. On envoie un lien et un **code de partie** à 6 caractères.
- **Rendu 2D hybride** :
  - les **villes et la carte du monde** sont des décors illustrés cliquables (PNJ, lieux), avec des **portraits** en dialogue ;
  - les **donjons** s'explorent en **vue de dessus**, sur des cartes en tuiles où l'on déplace son héros ;
  - les **combats** se jouent en **vue de côté**, avec des sprites animés.
- **Style graphique** : **pixel art** pour le monde, les sprites, les combats et l'interface ; **portraits illustrés en style anime** pour les personnages. Le groupe produit les textures en parallèle, selon [`GRAPHISMES.md`](GRAPHISMES.md) et [`LISTE-TEXTURES.md`](LISTE-TEXTURES.md). En attendant, des images provisoires sont générées automatiquement.
- **Façon de jouer** :
  - **en direct** (« session ») : la quête principale et les combats de groupe se jouent ensemble, chacun sur son écran ;
  - **en asynchrone** : le temps libre, les contrats de guilde, les dialogues avec les compagnes et le prologue d'enfance se jouent chacun quand il veut.
- **Narration** : toute l'histoire est écrite à l'avance dans des fichiers de données. Il n'y a pas d'IA et pas de coût.
- **Saison 1** : 18 ans en jeu, 6 chapitres, environ 18 sessions de 2 h. Elle se termine par un **boss final** et l'une des **4 fins de saison**. Des mises à jour ajouteront ensuite des saisons : la chronologie continue, les héros vieillissent et le niveau maximum augmente.
- **Ton** : un mélange d'humour au quotidien et de moments sérieux sur les grands enjeux, comme dans un anime grand public.
- **Mort douce** : un héros vaincu est mis K.O. et subit une pénalité, mais il n'est jamais perdu définitivement. Les **PNJ**, eux, peuvent mourir selon vos choix.

---

## 2. Le monde : Velmaris

### 2.1 Le principe de l'isekai

Le monde de Velmaris est séparé des autres mondes par le **Voile**, une membrane invisible. Depuis quatre siècles, l'**Ordre de la Lumière Sereine** sait percer le Voile pour **appeler** des héros d'un autre monde (le nôtre). Ces héros reçoivent un **don**. Plus rarement, une âme de notre monde traverse le Voile **à sa mort** et renaît dans Velmaris : ce sont les **réincarnés**.

Les héros (et eux seuls) voient une **fenêtre d'état** : niveau, caractéristiques, compétences. Les habitants de Velmaris appellent ça « le regard du Seuil ».

**Le secret de la saison 1** : chaque appel déchire un peu plus le Voile. Les **Terres Cendrées**, au nord, sont nées d'une ancienne déchirure, et chaque invocation nourrit la puissance du seigneur démon.

### 2.2 Carte du monde (6 régions)

```
                 ┌──────────────────────────────┐
                 │   6. TERRES CENDRÉES (nord)  │  ← territoire démoniaque
                 └──────────────┬───────────────┘
                        ═══ Mur d'Aube ═══          (frontière fortifiée)
   ┌───────────────┐   ┌────────┴────────┐   ┌─────────────────┐
   │ 2. SYLVENOIRE │───│ 1. AUBECLAIRE   │───│ 3. MONTS GRISFER│
   │  (ouest)      │   │  (centre)       │   │   (est)         │
   └───────┬───────┘   └────────┬────────┘   └─────────────────┘
   ┌───────┴───────────┐ ┌──────┴──────────────┐
   │ 5. ARCHIPEL DES   │ │ 4. MARCHE DES SABLES│
   │    BRUMES (sud-   │ │    (sud)            │
   │    ouest, mer)    │ │                     │
   └───────────────────┘ └─────────────────────┘
```

| # | Région | Paysage | Peuples | Lieux clés | Niveaux |
|---|---|---|---|---|---|
| 1 | **Royaume d'Aubeclaire** | Plaines, rivières, châteaux | Humains, quelques demi-elfes | **Lysmont** (capitale), **Temple du Seuil** (lieu des invocations), siège de la Guilde, Crypte de la Fontaine (donjon) | 1–10 |
| 2 | **Sylvenoire** | Forêt primaire, arbres géants, brume bleue | Elfes sylvains, dryades | **Ithrael** (cité dans un arbre), Bibliothèque des Racines, Clairière de la Déchirure | 15–22 |
| 3 | **Monts Grisfer** | Montagnes, mines, forges volcaniques | Nains, gnomes | **Karak-Dûm** (cité-forge), donjon **les Mille Marches** (une marche = un étage) | 20–28 |
| 4 | **Marche des Sables** | Désert, cités-oasis, canyons | Humains du désert, **Ourvalis** (peuple-loup), **Vulpins** (peuple-renard) | **Qarzim** (cité marchande), Grand Bazar, Ruines de Sel | 8–16 |
| 5 | **Archipel des Brumes** | Îles volcaniques, récifs, brouillard permanent | Pirates, sirènes, **derniers dragons**, **sang-dragons** | **Port-Vérane**, Nid des Wyrms, Phare noyé | 22–30 |
| 6 | **Terres Cendrées** | Plaine de cendres, ciel rouge, forteresses noires | Démons, morts-vivants, humains corrompus ; **demi-démons** le long du Mur d'Aube | **Mur d'Aube** (frontière), Citadelle d'Obsidienne (boss final) | 28–40 |

### 2.3 Factions (4 + l'ennemi)

| Faction | Qui ? | Objectif affiché | Objectif caché ou dilemme |
|---|---|---|---|
| **La Couronne d'Aubeclaire** | Le roi Edmund IV, la noblesse, l'armée | Protéger le royaume contre les Cendres | Utiliser les héros appelés comme une **arme de guerre** et non comme des alliés. Le prince héritier a disparu en 1009. |
| **La Guilde de la Rose des Vents** | Les aventuriers de tous pays (rangs F à S) | Rester neutre, protéger les gens contre les monstres, être payée | Refuse de prendre parti… jusqu'au jour où elle devra le faire. C'est le « foyer » naturel des héros. |
| **La Concorde de Qarzim** | Une ligue de marchands du désert | Commercer, s'enrichir | Monopoliser les **cristaux d'éther**, qui sont en réalité des **fragments du Voile**. Plus elle en extrait, plus le Voile s'affaiblit. |
| **L'Ordre de la Lumière Sereine** | L'Église officielle, qui pratique les invocations | Guider les Appelés et soigner les gens | Cacher que les invocations nourrissent les Cendres. Une partie du clergé l'ignore sincèrement. |
| *Ennemi* : **La Légion Cendrée** | Les démons et le **Souverain des Cendres** | Effacer le Mur d'Aube et « rendre le monde au Voile » | Le Souverain est **Orvan, le Premier Appelé** (an 430), trahi puis abandonné dans les Cendres par l'Ordre. |

La **réputation** auprès de chaque faction va de −100 à +100, avec 6 paliers : Hostile, Méfiant, Neutre, Ami, Allié, Honoré. Elle ouvre ou ferme des quêtes, des prix, des alliances et des fins.

### 2.4 Chronologie du passé (calendrier « AV » = Après le Voile)

| Date | Événement |
|---|---|
| vers −3000 | **Âge des Dragons** : les dragons-rois règnent sur Velmaris. |
| **0 AV** | **La Déchirure** : un rituel elfe tenté pour vaincre les dragons déchire le Voile. Les Terres Cendrées apparaissent au nord. Les dragons-rois s'y épuisent et disparaissent presque tous. |
| 58 AV | Fondation du Royaume d'Aubeclaire par des réfugiés du nord. |
| 212 AV | Fondation de la **Guilde de la Rose des Vents** après la Peste des Monstres. |
| 430 AV | **Premier Appel** : l'Ordre invoque Orvan, qui vainc le premier seigneur démon. |
| 437 AV | Orvan découvre le coût des invocations. L'Ordre le **trahit** et le scelle dans les Cendres. La version officielle dit qu'il est « mort en héros ». |
| 702 AV | **Deuxième Guerre Cendrée**. Construction du **Mur d'Aube**. Trois héros appelés y meurent. |
| 851 AV | Les cités du désert s'unissent dans la **Concorde de Qarzim**. Début de l'extraction des cristaux d'éther. |
| 990 AV | Un nouveau **Souverain des Cendres** s'éveille (c'est Orvan, transformé). |
| 994 AV | Naissance des **réincarnés** (s'il y en a dans le groupe). |
| 1003 AV | Chute de la forteresse de Valgrane sur le Mur d'Aube. |
| 1009 AV | **Disparition du prince héritier** Aldric lors d'une patrouille. |
| **1012 AV, printemps** | **L'Appel** : l'Ordre invoque les héros au Temple du Seuil. **Début de la campagne (an 0).** |

### 2.5 Calendrier du monde

- Une année compte **4 saisons de 3 mois de 30 jours**, soit 360 jours (réglable dans `content/config/campagne.yaml`).
- Les mois, par saison :
  - Printemps : Germinal, Floréal, Pluvial ;
  - Été : Solaire, Moisson, Ardent ;
  - Automne : Brumaire, Cendral, Givral ;
  - Hiver : Nivôse, Nuitlongue, Aurore.
- **Affichage de la date** (changement du test 1) : « Jour 1 · Germinal (mois 1/12) · An 1012 ». Un clic ou un survol de la date explique la saison, le sens de « AV » (« Après le Voile ») et la fête la plus proche.
- **Fêtes annuelles** (scènes et quêtes spéciales) :
  - **Fête des Lanternes** (Floréal 15) : on rend hommage aux morts. Événement idéal pour un rendez-vous romantique.
  - **Tournoi de la Couronne** (Solaire 10) : arène et classement.
  - **Grand Bazar de Qarzim** (Brumaire 1-7) : objets rares et commerce.
  - **Nuitlongue** (Nuitlongue 30) : nuit la plus longue de l'année, où les démons sont plus forts.

---

## 3. Création de personnage

### 3.1 Les étapes

1. **Pseudo** du joueur et **nom** du héros.
2. **Origine** :
   - **Invoqué** : le héros arrive adulte (le joueur choisit son âge, de 18 à 35 ans) et garde un **souvenir de son monde**, un objet à l'effet mineur (téléphone sans réseau, carnet, briquet…) ;
   - **Réincarné** : le héros est né en 994 AV et joue d'abord le **prologue d'enfance** (§ 3.5). Il a 18 ans au début de la campagne.
3. **Race** : 8 au choix (§ 3.6). Chaque race donne des **bonus et des malus de caractéristiques dont la somme fait zéro**, plus un **trait racial** (un avantage et un défaut). Elle change aussi les dialogues et les réactions des PNJ.
4. **Classe** : 10 au choix (§ 4).
5. **Don** : 12 au choix (§ 5). **Deux joueurs d'une même partie ne peuvent pas avoir le même.**
6. **Atout de départ** :
   - les invoqués choisissent 1 atout dans une liste ;
   - les réincarnés gagnent le leur pendant le prologue.

   La valeur est identique dans les deux cas, par exemple +1 compétence hors combat, un contact PNJ ou +10 de réputation auprès d'une faction.

### 3.2 Les 6 caractéristiques

| Carac. | Abrév. | Effet en combat | Effet hors combat |
|---|---|---|---|
| Force | FOR | Dégâts physiques | Forcer, porter, intimider |
| Agilité | AGI | Initiative, esquive, précision, critiques | Discrétion, crochetage, acrobaties |
| Intelligence | INT | Dégâts magiques | Savoir, artisanat, énigmes |
| Vitalité | VIT | Points de vie (PV), défense | Endurance, résistance aux poisons |
| Esprit | ESP | Mana, soins, résistance magique | Perception, volonté, rituels |
| Charisme | CHA | **Présence** : ±1 % de dégâts infligés et subis par point au-dessus ou en dessous de 10 ; puissance des bonus de compagne | Dialogues, prix, affinité |

**Règle d'équilibrage** : **toutes les classes ont 60 points** de caractéristiques au niveau 1, chaque caractéristique étant comprise entre 5 et 15. Seule la répartition change.

### 3.3 Formules de base (valeurs de départ)

- PV max = 30 + 5 × VIT + 4 × (niveau − 1) × (1 + VIT / 20)
- Mana max = 10 + 3 × ESP + 2 × (niveau − 1)
- Initiative = AGI + 1d10, tirée à chaque tour
- Toucher = 85 % + 2 % × (AGI attaquant − AGI défenseur), borné entre 50 % et 95 %
- **« Plus c'est puissant, moins c'est sûr »** (test 1, pour les héros et leurs alliés ; réglages dans `campagne.yaml`, section `combat`) :
  - une **attaque de base** est fiable : +2 points de chance de toucher ;
  - une **compétence** perd 1 point par point de mana au-delà des 5 premiers, 5 points au plus (une compétence à 8 mana : −3 points) ;
  - **niveau** : +0,5 point par niveau d'avance sur la cible, −0,5 par niveau de retard (10 niveaux au plus), pour tout le monde ;
  - **maîtrise** : +1 point par rang (voir ci-dessous) ;
  - la chance de réussite est **affichée avant de valider**, et le moteur la calcule (`estimerAction`), jamais l'IA.
- **Maîtrise d'une compétence** (rang 0 à 5, section `maitrise`) : 1 point par utilisation en combat, plus l'activité « Entraînement » à l'auberge (6 points par compétence équipée pour 6 mois). Seuils : 5, 15, 30, 50 et 80 points. Chaque rang donne +2 % de dégâts et de soins et +1 point de chance de toucher (au plus +10 % et +5 points). Une fusion suit la maîtrise de sa compétence de base.
- **Poison et brûlure** : la cible perd des PV **au début de chacun de ses tours**, pendant la durée prévue ; « Lame empoisonnée » se cumule jusqu'à 3 fois. Le journal écrit « −6 PV (poison ×2, encore 2 tours) », la cible est teintée en vert avec des bulles, et une icône indique les tours restants.
- **Attaques nommées des ennemis** : chaque ennemi a 2 ou 3 attaques de base nommées (`attaques:` dans `content/ennemis/`), de même puissance, avec une phrase et un effet visuel : « Loup gris bondit et mord Daleko à la jambe : 7 dégâts ».- Critique = 5 % + 0,5 % × AGI, avec des dégâts × 1,5
- Dégâts = puissance de la compétence × (1 + caractéristique utilisée / 20) × (100 / (100 + défense))
- À chaque niveau : +3 points de caractéristiques à répartir librement et +1 point de compétence (§ 4.2).

### 3.4 Progression

- **Niveau maximum en saison 1 : 40.** Il est réglable et sera augmenté par les saisons suivantes.
- XP nécessaire pour passer du niveau *n* au niveau *n* + 1 : 100 × *n*^1,5, arrondi.
- Niveaux visés par chapitre :

  | Chapitre | 1 | 2 | 3 | 4 | 5 | 6 |
  |---|---|---|---|---|---|---|
  | Niveaux | 1 → 8 | 8 → 15 | 15 → 22 | 22 → 28 | 28 → 34 | 34 → 40 |

- **Un joueur qui rejoint en cours de route** crée son personnage au **niveau moyen du groupe** (arrondi à l'inférieur), avec l'équipement standard de ce niveau et des points répartis automatiquement, qu'il peut modifier.

### 3.5 Prologue d'enfance (réincarnés uniquement)

C'est une session courte, d'environ 45 min à 1 h, jouée **en asynchrone** avant le début de la campagne, et couvrant les années 994 à 1012. Elle se compose de 4 scènes, et chaque choix oriente le héros :

| Âge | Scène | Ce que le choix donne |
|---|---|---|
| 6 ans | « Les souvenirs d'avant » : l'enfant comprend qu'il se souvient d'une autre vie | L'**origine** : noble, fils ou fille de fermier, orphelin, enfant de marchand |
| 10 ans | « Le premier secret » : l'enfant découvre son don, qui reste discret | Une première **affinité** avec la future classe (texte d'ambiance) |
| 14 ans | « La rencontre » : un mentor, un rival ou un ami d'enfance (PNJ récurrent) | Un **contact PNJ** pour la campagne |
| 17 ans | « Le départ » : l'adolescent quitte son foyer pour Lysmont | L'**atout de départ** et +10 de réputation auprès d'une faction |

Ce prologue ne contient **ni romance ni combat dangereux**, seulement des épreuves narratives. Au printemps 1012, le réincarné a 18 ans. Il est attiré au Temple du Seuil par la « résonance » de l'Appel et y rencontre les invoqués : c'est l'introduction commune du chapitre 1.

### 3.6 Les 8 races

Chaque race modifie les caractéristiques de classe. **La somme des modificateurs fait toujours zéro** : le total reste de 60 points, et la règle d'équilibrage est respectée. Après modification, chaque caractéristique reste comprise entre **3 et 17**. Ce sont des valeurs de départ, que la simulation ajustera.

| Race | Modificateurs (FOR, AGI, INT, VIT, ESP, CHA) | Trait : avantage | Trait : défaut |
|---|---|---|---|
| **Humain** | +1 dans deux caractéristiques et −1 dans deux autres, **au choix** (polyvalence) | *Détermination* : une fois par combat, sous 25 % de PV, regagne 10 % de ses PV | −10 % de résistance magique |
| **Elfe** | INT +1, ESP +1, AGI +1, FOR −2, CHA −1 | *Sang ancien* : +15 % de résistance magique ; voit dans le noir (donjons) | Poisons et saignements durent 1 tour de plus |
| **Demi-elfe** | CHA +2, AGI +1, FOR −1, VIT −1, INT −1 | *Entre deux mondes* : +10 % d'affinité en dialogue ; +5 % de précision | −10 de réputation de départ auprès de la Couronne (les nobles s'en méfient) |
| **Nain** | VIT +2, FOR +1, AGI −1, INT −1, CHA −1 | *Robuste* : résiste au poison à 50 % ; +2 % de défense | *Lourd* : −3 d'initiative ; ne sait pas nager (certains passages de l'Archipel) |
| **Ourvalis** (peuple-loup) | FOR +2, AGI +1, INT −1, ESP −1, CHA −1 | *Instinct de meute* : +10 % de dégâts sur une cible déjà frappée par un allié ce tour ; flair (détecte les embuscades) | *Sang chaud* : −15 % de résistance à la peur et à la provocation |
| **Vulpin** (peuple-renard) | AGI +2, CHA +1, FOR −2, VIT −1 | *Ruse* : +5 % d'esquive ; −10 % sur les prix | *Réputation de filou* : −5 d'affinité de départ avec les marchands humains et −5 de réputation auprès de la Couronne |
| **Demi-démon** | INT +2, FOR +1, CHA −2, ESP −1 | *Sang cendré* : 25 % de résistance au feu et à l'ombre ; sous 50 % de PV, régénère 2 % de ses PV par tour | +25 % de dégâts sacrés subis ; −20 % de soins sacrés reçus des autres ; −15 de réputation de départ auprès de l'Ordre |
| **Sang-dragon** | FOR +1, VIT +1, ESP +1, AGI −1, CHA −2 | *Écailles et souffle* : un souffle de feu mineur par combat ; −10 % de dégâts de feu reçus | +25 % de dégâts de glace reçus ; −1 d'initiative |

**Place dans le monde et effets narratifs** :
- Les **humains** dominent Aubeclaire et la Marche des Sables.
- Les **elfes** vivent à Sylvenoire et se méfient des demi-elfes. Les **nains** vivent dans les Monts Grisfer.
- Les **Ourvalis** et les **Vulpins** sont des peuples nomades de la Marche des Sables. Les Ourvalis sont chassés de leurs terres par la Concorde (lien avec Kaya).
- Les **demi-démons** descendent de lignées touchées par les Cendres, le long du Mur d'Aube. L'Ordre les craint ; Morra les reconnaît.
- Les **sang-dragons** descendent des anciens pactes avec les dragons-rois et vivent surtout dans l'Archipel des Brumes. Ysoria les considère comme sa « famille lointaine ».
- Chaque race débloque des **répliques et des options de quête** propres, et les compagnes réagissent à la race du héros. Cela ne change jamais les seuils d'affinité : une compagne ne refuse pas un héros à cause de sa race.

**Graphismes** : chaque race (sauf l'humain) a un **calque** superposé au sprite de classe (oreilles, queue, cornes, barbe, écailles) et un portrait par défaut. Voir [`GRAPHISMES.md`](GRAPHISMES.md).

---

## 4. Les 10 classes

Chaque classe possède :
- 1 compétence **passive** ;
- 2 compétences **actives** au niveau 1 ;
- un **arbre** à 2 branches (une compétence tous les 5 niveaux dans la branche choisie) ;
- une **compétence ultime**, débloquée au niveau 30 **et** par la **chaîne de quêtes de classe**.

| # | Classe | Rôle | FOR | AGI | INT | VIT | ESP | CHA | Total |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Lame runique | Dégâts (hybride) | 12 | 10 | 11 | 10 | 9 | 8 | 60 |
| 2 | Arcaniste élémentaire | Dégâts (zone) | 5 | 9 | 15 | 8 | 14 | 9 | 60 |
| 3 | Invocateur | Contrôle / dégâts indirects | 5 | 8 | 14 | 9 | 14 | 10 | 60 |
| 4 | Ombre | Dégâts (cible unique) | 9 | 15 | 8 | 9 | 8 | 11 | 60 |
| 5 | Gardien sacré | Protection | 11 | 6 | 7 | 15 | 12 | 9 | 60 |
| 6 | Alchimiste-artificier | Soutien / contrôle | 7 | 11 | 14 | 9 | 8 | 11 | 60 |
| 7 | Archer spirituel | Dégâts (distance) | 8 | 14 | 8 | 9 | 12 | 9 | 60 |
| 8 | Guérisseur | Soin | 5 | 8 | 11 | 10 | 15 | 11 | 60 |
| 9 | Berserker draconique | Dégâts (mêlée) / tank offensif | 15 | 9 | 5 | 13 | 8 | 10 | 60 |
| 10 | Barde enchanteur | Soutien / contrôle | 6 | 11 | 10 | 9 | 10 | 14 | 60 |

### 1. Lame runique — dégâts hybrides
Un guerrier qui grave des runes sur sa lame en plein combat.
- **Passif : Runes gravées.** Chaque attaque réussie ajoute une charge de rune (3 au maximum). La prochaine compétence consomme les charges : +20 % de dégâts par charge.
- **Actives** :
  - *Entaille runique* : dégâts physiques et magiques mélangés ;
  - *Rune de garde* : bouclier égal à 15 % des PV pendant 2 tours, et +1 charge.
- **Branches** : *Runes de guerre* (dégâts, combos) / *Runes de sceau* (affaiblissements, silence).
- **Ultime : Lame des Mille Sceaux.** Consomme toutes les charges et frappe tous les ennemis ; chaque charge ajoute un effet (brûlure, gel, silence).
- **Point fort** : polyvalent, efficace contre les ennemis physiques comme magiques.
- **Point faible** : lent à démarrer, car il doit accumuler ses charges ; peu efficace dans les combats très courts.

### 2. Arcaniste élémentaire — dégâts de zone
- **Passif : Résonance.** Enchaîner deux éléments différents donne +25 % de dégâts sur le second.
- **Actives** :
  - *Javelot de flamme* : cible unique, inflige une brûlure ;
  - *Onde de givre* : touche tous les ennemis, faibles dégâts, les ralentit.
- **Branches** : *Pyromancie et foudre* (dégâts) / *Cryo et terre* (contrôle, murs).
- **Ultime : Convergence des Quatre.** Dégâts massifs sur tous les ennemis, qui les exposent aux 4 éléments.
- **Point fort** : le meilleur pour nettoyer les groupes d'ennemis.
- **Point faible** : très fragile ; dépend du mana, donc s'épuise dans les longs combats.

### 3. Invocateur — contrôle et dégâts indirects
- **Passif : Lien d'âme.** Un **familier** (loup spectral) combat à ses côtés en permanence. S'il tombe, il revient après 3 tours.
- **Actives** :
  - *Appel du gardien de pierre* : invoque un golem provocateur pour 3 tours ;
  - *Échange d'âme* : échange de position avec une invocation et soigne le familier.
- **Branches** : *Meute* (plusieurs petites invocations) / *Colosse* (une grosse invocation).
- **Ultime : Porte du Bestiaire.** Invoque une créature légendaire pour 3 tours.
- **Point fort** : agit plusieurs fois par tour grâce à ses invocations ; elles encaissent à sa place.
- **Point faible** : très faible si ses invocations sont détruites ; vulnérable au silence.

### 4. Ombre — dégâts sur une cible unique
- **Passif : Dans le dos.** +25 % de chances de critique contre une cible qui n'attaque pas l'Ombre ou qui est affaiblie.
- **Actives** :
  - *Pas d'ombre* : devient invisible pendant 1 tour ; la prochaine attaque est un critique garanti ;
  - *Lame empoisonnée* : inflige un poison qui s'accumule (jusqu'à 3 fois).
- **Branches** : *Assassinat* (critiques, exécution sous 25 % de PV) / *Toxines* (poisons, affaiblissements).
- **Ultime : Mille Coupures.** 6 frappes réparties sur les ennemis, chacune avec une chance de critique.
- **Point fort** : élimine une cible prioritaire en un ou deux tours.
- **Point faible** : peu de PV ; faible contre les groupes nombreux et les ennemis qui frappent toute la zone.

### 5. Gardien sacré — protection
- **Passif : Rempart.** 30 % de chances d'intercepter une attaque visant un allié, en subissant 20 % de dégâts en moins.
- **Actives** :
  - *Provocation sainte* : force les ennemis à le cibler pendant 2 tours ;
  - *Bouclier d'aube* : donne à un allié un bouclier qui absorbe les dégâts.
- **Branches** : *Bastion* (défense pure) / *Croisé* (riposte, dégâts sacrés contre les démons).
- **Ultime : Bastion éternel.** Pendant 2 tours, aucun allié ne peut tomber sous 1 PV.
- **Point fort** : rend le groupe très solide ; seul, il gagne en tenant longtemps.
- **Point faible** : dégâts faibles, combats longs, peu mobile.

### 6. Alchimiste-artificier — soutien et contrôle
- **Passif : Fioles optimisées.** Ses objets (potions, bombes) sont 40 % plus efficaces, avec 25 % de chances de ne pas être consommés.
- **Actives** :
  - *Bombe collante* : dégâts et immobilisation (l'ennemi perd son prochain tour) ;
  - *Tourelle mécanique* : pose une tourelle qui tire pendant 3 tours.
- **Branches** : *Grenadier* (bombes, zone) / *Mécaniste* (tourelles, golem).
- **Ultime : Golem d'airain.** Se protège dans une armure-golem pendant 3 tours, avec des compétences améliorées.
- **Point fort** : très polyvalent ; le meilleur artisan hors combat (temps libre).
- **Point faible** : dépend de ses ressources, qu'il doit fabriquer entre les quêtes.

### 7. Archer spirituel — dégâts à distance
- **Passif : Œil du faucon.** Les cibles **marquées** subissent +15 % de dégâts de tout le groupe.
- **Actives** :
  - *Flèche marquante* : dégâts et marque ;
  - *Volée d'esprits* : 3 flèches sur des cibles au hasard.
- **Branches** : *Tireur d'élite* (une cible, perforation) / *Chaman des vents* (esprits, soutien léger).
- **Ultime : Pluie des Ancêtres.** Pendant 2 tours, une pluie de flèches spirituelles frappe tous les ennemis au début de chaque tour.
- **Point fort** : dégâts réguliers et fiables, depuis la deuxième ligne.
- **Point faible** : fragile au contact ; peu d'outils défensifs.

### 8. Guérisseur — soin
- **Passif : Main bienveillante.** Les soins qui dépassent les PV max deviennent un bouclier (50 % du surplus).
- **Actives** :
  - *Lumière apaisante* : soigne un allié, ou inflige des dégâts sacrés à un démon ou un mort-vivant ;
  - *Purification* : retire les effets négatifs et donne un petit soin de groupe.
- **Branches** : *Sanctuaire* (soins de groupe) / *Jugement* (dégâts sacrés, soin en frappant).
- **Ultime : Second Souffle.** Relève tous les alliés K.O. à 40 % de leurs PV.
- **Point fort** : rend le groupe presque increvable.
- **Point faible** : dégâts très faibles ; seul, il gagne en tenant, pas en tuant.

### 9. Berserker draconique — dégâts en mêlée, tank offensif
- **Passif : Sang de dragon.** +1 % de dégâts par tranche de 2 % de PV manquants, jusqu'à +40 %.
- **Actives** :
  - *Fendoir furieux* : grosse frappe, coûte 5 % de ses propres PV ;
  - *Rugissement* : peut effrayer les ennemis, qui ont alors 50 % de chances de perdre leur tour.
- **Branches** : *Furie* (dégâts, vol de vie) / *Écailles* (réduction de dégâts quand il a peu de PV).
- **Ultime : Forme du Wyrm.** Se transforme pendant 3 tours : souffle de feu et carapace d'écailles.
- **Point fort** : les plus gros dégâts en mêlée ; dangereux quand il est blessé.
- **Point faible** : se met en danger lui-même ; faible face à la magie et au contrôle.

### 10. Barde enchanteur — soutien et contrôle
- **Passif : Refrain.** Le dernier chant joué reste actif tant que le Barde n'est pas K.O.
- **Actives** :
  - *Ballade du courage* : +15 % de dégâts et d'initiative pour le groupe ;
  - *Berceuse* : endort un ennemi, qui se réveille s'il est frappé.
- **Branches** : *Virtuose* (bonus de groupe) / *Dissonance* (dégâts sonores, contrôle).
- **Ultime : Symphonie du dernier acte.** Tout le groupe rejoue immédiatement un tour complet.
- **Point fort** : rend tout le groupe meilleur ; le meilleur en dialogue (charisme élevé).
- **Point faible** : peu de dégâts personnels ; c'est le soutien le plus fragile.

> **Note d'équilibrage** : les classes de soutien (Guérisseur, Barde, Gardien) doivent pouvoir gagner **seules** aussi souvent que les autres contre les ennemis de référence. Leur kit leur donne donc de quoi tenir (soins, boucliers, contrôle) et un peu de dégâts. La simulation le vérifiera.

---

## 5. Les 12 dons d'invoqué

Chaque don a un **effet en combat** et un **effet hors combat** de poids comparable. **Un don ne peut être pris que par un seul joueur dans une partie.**

| # | Don | En combat | Hors combat |
|---|---|---|---|
| 1 | **Œil du Seuil** (analyse) | Voit les PV et les faiblesses des ennemis ; +10 % de dégâts sur une faiblesse | Révèle les pièges, les secrets et les statistiques des objets |
| 2 | **Réserve du Néant** (inventaire infini) | Utiliser un objet ne coûte pas d'action, une fois par combat | Inventaire illimité ; +10 % sur les ventes |
| 3 | **Langue universelle** | Peut **pacifier** une bête ou un démon mineur affaibli (sous 30 % de PV) | Comprend toutes les langues ; gains d'affinité en dialogue +20 % |
| 4 | **Second départ** | Une fois par session : annule le dernier tour du groupe et le rejoue | Une fois par chapitre : refaire un choix de dialogue |
| 5 | **Croissance accélérée** | — | +15 % d'XP **pour soi** ; une activité de temps libre « Entraînement » supplémentaire par chapitre |
| 6 | **Bénédiction de fortune** | Une fois par combat : relancer un jet raté (toucher, critique, résistance) | Meilleur butin (+1 objet rare par donjon) |
| 7 | **Mimétisme** | Copie une compétence active d'un ennemi vue pendant le combat, jusqu'à la fin du combat | Apprend les recettes d'artisanat en les voyant une fois |
| 8 | **Cœur inépuisable** | Régénère 3 % de ses PV max par tour | Ignore la fatigue ; voyages plus rapides (−20 % de temps) |
| 9 | **Lien des bêtes** | Peut **recruter** un monstre vaincu comme compagnon faible (1 à la fois) | Monture gratuite ; bonus contre les bêtes en exploration |
| 10 | **Main de l'artisan** | Une fois par combat : fabrique un objet improvisé (potion, bombe) | Artisanat de qualité supérieure ; peut réparer les reliques |
| 11 | **Aura de l'Élu** | Les alliés à côté de lui gagnent +5 % de dégâts et +5 % de résistance | Première impression +5 d'affinité ; prestige auprès des PNJ |
| 12 | **Pas de l'ombre** | Une fois par combat : esquive garantie, puis se téléporte derrière une cible (prochain coup critique) | Se faufile n'importe où (portes, gardes) une fois par quête |

> Les dons que la simulation jugerait trop forts, par exemple *Croissance accélérée* qui crée des écarts de niveau, seront ajustés. Rappel : un joueur qui arrive en cours de route rejoint au niveau moyen du groupe.

---

## 6. Les compagnes (romance)

### 6.1 Règles générales

- **Tous les personnages romançables sont adultes**, et la romance ne commence qu'avec des héros adultes : les réincarnés ne sont concernés qu'à partir de l'an 0, quand ils ont 18 ans.
- Ton d'anime grand public : flirt, humour, scènes touchantes, **rien d'explicite** (fondu au noir).
- **Harem libre** :
  - un héros peut atteindre le palier « engagée » avec plusieurs compagnes ;
  - une compagne peut aimer plusieurs héros ;
  - les compagnes **réagissent** (jalousie comique, scènes de groupe) mais ne bloquent pas.
- **Chaque compagne peut refuser un héros** :
  - si l'affinité est insuffisante ;
  - si le héros a déclenché une de ses **lignes rouges** : le palier reste bloqué jusqu'à réparation, et certaines fautes graves le bloquent définitivement.
- La liste est **extensible** : chaque compagne est un fichier dans `content/compagnes/`. On peut ajouter des personnages masculins ou autres sans toucher au code. Dans le code, le terme générique est « compagnon ou compagne ».

### 6.2 Affinité à paliers

L'affinité est un score de 0 à 100 **par couple héros-compagne**.

| Palier | Seuil | Ce qu'il débloque |
|---|---|---|
| Inconnue | 0 | Dialogues de base |
| Alliée | 20 | Peut **accompagner le groupe** en combat (bonus de niveau 1) |
| Proche | 45 | **Quête personnelle** ; scènes de confidence ; bonus de niveau 2 |
| Amoureuse | 70 | Scènes romantiques (rendez-vous aux fêtes du calendrier) ; bonus de niveau 3 |
| Engagée | 90 + fin de sa quête personnelle | Scène d'engagement ; **attaque combinée** en combat ; épilogue dédié dans chaque fin de saison |

**Gagner (ou perdre) de l'affinité** :
- **dialogues** : de −5 à +5 selon les réponses ;
- **cadeaux** : un par semaine en jeu ; cadeau préféré +5, apprécié +2, détesté −3 ;
- **quêtes** : de +10 à +20 pour une quête faite avec elle ou pour elle ;
- **décisions** : de −30 à +15 selon ses valeurs ;
- **temps libre** : l'activité « Relation » donne +5 à +10 et une scène.

**En combat** : chaque héros peut emmener **une** compagne de palier « Alliée » ou plus. Elle est contrôlée par une IA simple, ou par le joueur s'il le souhaite. Pour régler la difficulté, une compagne compte pour un **demi-héros** (§ 7.3).

### 6.3 Les 8 compagnes de la saison 1

| # | Nom | Archétype | Âge | Région | Chapitre d'arrivée |
|---|---|---|---|---|---|
| 1 | **Aveline de Castelroc** | Chevalière | 24 ans | Aubeclaire | 1 |
| 2 | **Séraphine d'Aubeclaire** | Princesse | 21 ans | Aubeclaire | 1 |
| 3 | **Kaya Lunecroc** | Aventurière Ourvalis (femme-loup) | 22 ans | Marche des Sables | 1 (rencontre), 2 (quête) |
| 4 | **Sœur Elianne** | Prêtresse | 23 ans | Aubeclaire | 1 |
| 5 | **Nadja Kesh** | Marchande rusée | 27 ans | Marche des Sables | 2 |
| 6 | **Ilyssë Vaëlnor** | Mage elfe | 147 ans (adulte) | Sylvenoire | 3 |
| 7 | **Morwenna, dite « Morra »** | Démone repentie | environ 300 ans | Terres Cendrées | 3 (ennemie), 4 (alliée) |
| 8 | **Ysoria** | Dragonne sous forme humaine | environ 900 ans | Archipel des Brumes | 4 |

**1. Aveline de Castelroc — la chevalière** *(compagne de la version jouable 1)*
- **Personnalité** : droite, sérieuse, très maladroite dès qu'on parle de sentiments. Gourmande de pâtisseries en secret.
- **Passé** : son père, chevalier, a été accusé de trahison lors de la chute de Valgrane (1003) et exécuté. Elle est devenue capitaine de la garde royale par son seul mérite, sous les regards méfiants.
- **Objectif** : prouver l'innocence de son père.
- **Quête personnelle** : « Le Serment brisé ». Elle découvre que la chute de Valgrane a été provoquée par… l'Ordre.
- **Lignes rouges** : mentir sur une parole donnée ; abandonner des civils ; pactiser avec la Légion Cendrée.
- **Cadeaux** : préfère les pâtisseries de Lysmont et l'entretien d'armes ; déteste les bijoux tape-à-l'œil.
- **Bonus** :
  - niveau 1 : *Garde partagée*, elle intercepte parfois un coup destiné à son héros ;
  - niveau 2 : +10 % de défense au groupe ;
  - niveau 3 : contre-attaque.
  - **Attaque combinée** : *Charge des Deux Serments*.

**2. Séraphine d'Aubeclaire — la princesse**
- **Personnalité** : vive, curieuse, rebelle sous l'étiquette ; adore les histoires « de l'autre monde ».
- **Passé** : seconde de la lignée, elle porte le deuil de son frère Aldric, disparu en 1009.
- **Objectif** : retrouver Aldric et réformer une Couronne qui traite les héros comme des armes.
- **Quête personnelle** : « La Couronne et le Masque ». Aldric est vivant… dans les Cendres.
- **Lignes rouges** : servilité aveugle envers le roi au détriment du peuple ; la traiter comme un trophée politique.
- **Bonus** : réputation auprès de la Couronne +, accès aux archives royales, buff de commandement (+initiative).

**3. Kaya Lunecroc — l'aventurière femme-loup**
- **Personnalité** : énergique, compétitive, franche jusqu'à la gaffe, gourmande de viande grillée.
- **Passé** : sa tribu ourvalis a été chassée de ses terres par la Concorde de Qarzim, qui exploite les cristaux.
- **Objectif** : devenir **rang S** pour rendre sa fierté à sa tribu.
- **Quête personnelle** : « Le Hurlement des Ancêtres ».
- **Lignes rouges** : mépriser les races non humaines ; tricher à la Guilde.
- **Bonus** : +initiative et +vitesse ; flair (révèle les embuscades).

**4. Sœur Elianne — la prêtresse**
- **Personnalité** : douce, patiente, mais têtue comme une mule quand il s'agit de justice.
- **Passé** : élevée par l'Ordre, elle a assisté à l'invocation des héros.
- **Objectif** : découvrir la vérité sur les invocations, et choisir entre sa foi et la vérité.
- **Quête personnelle** : « Ce que la Lumière cache ». C'est elle qui révèle le prix des invocations au chapitre 4.
- **Lignes rouges** : cruauté gratuite ; profaner les morts.
- **Bonus** : soin en fin de tour ; résistance aux malédictions.

**5. Nadja Kesh — la marchande rusée**
- **Personnalité** : cupide en apparence, sarcastique, négociatrice redoutable ; loyale envers qui l'a méritée.
- **Passé** : endettée auprès de la Concorde depuis la faillite de sa famille, elle sert d'intermédiaire « à contrecœur ».
- **Objectif** : racheter sa liberté… et, plus tard, faire tomber la Concorde.
- **Quête personnelle** : « Le Grand Livre rouge ».
- **Lignes rouges** : la traiter comme une simple marchande ; lui voler un client.
- **Bonus** : −15 % sur les prix, plus d'or en butin ; en combat, des gadgets (fumigènes).

**6. Ilyssë Vaëlnor — la mage elfe**
- **Personnalité** : érudite, sarcastique, curieuse jusqu'à l'imprudence ; fascinée par les « appelés ».
- **Passé** : bannie d'Ithrael pour avoir étudié la Déchirure, un sujet tabou chez les elfes.
- **Objectif** : comprendre — et peut-être réparer — le Voile.
- **Quête personnelle** : « La Bibliothèque des Racines ».
- **Lignes rouges** : détruire un savoir (livres, ruines) ; brûler la forêt.
- **Bonus** : +dégâts magiques pour le groupe ; analyse des sceaux.

**7. Morwenna, dite « Morra » — la démone repentie**
- **Personnalité** : humour noir, fierté, tendresse cachée ; découvre le monde des vivants avec méfiance.
- **Passé** : ancienne commandante de la Légion Cendrée, elle combat les héros au chapitre 3 et **déserte** au chapitre 4 si on l'a épargnée.
- **Objectif** : libérer sa sœur cadette, prisonnière du Souverain.
- **Quête personnelle** : « Les Chaînes d'Obsidienne ».
- **Lignes rouges** : exterminer les démons sans distinction ; la trahir auprès de l'Ordre.
- **Condition pour la fin « Pacte »** : affinité élevée avec Morra chez au moins un héros.
- **Bonus** : dégâts d'ombre, résistance au feu, connaissance des Cendres.

**8. Ysoria — la dragonne**
- **Personnalité** : majestueuse, directe, ignore totalement les coutumes humaines (source d'humour) ; adore les objets qui brillent.
- **Passé** : une des dernières dragonnes. Elle dort depuis des siècles au Nid des Wyrms, et son œuf a été volé.
- **Objectif** : retrouver son œuf, puis décider si les dragons doivent revenir dans le monde.
- **Quête personnelle** : « L'Œuf de braise ».
- **Lignes rouges** : chasser les dragons ; vendre une relique draconique.
- **Bonus** : *Souffle* une fois par combat ; monture volante (voyage rapide) au palier « Proche ».

---

## 7. Règles du combat

### 7.1 Déroulement

- **Au tour par tour**, sur **deux rangées** (avant et arrière) de chaque côté. Il n'y a pas de grille, ce qui reste lisible sur mobile.
  - Le **rang avant** reçoit la plupart des attaques au corps à corps.
  - Le **rang arrière** n'est touché au corps à corps que si le rang avant est vide.
- À chaque **tour**, l'initiative est tirée, puis chaque combattant agit une fois :
  - **compétence** (coûte du mana ou de l'énergie, ou a un temps de recharge) ;
  - **attaque simple** (gratuite) ;
  - **objet** ;
  - **défendre** (−50 % de dégâts reçus, +10 % de mana) ;
  - **changer de rang**.
- **États** :
  - brûlure, poison (dégâts par tour) ;
  - gel (initiative −50 %) ;
  - immobilisé, sommeil, peur (perte de tour, totale ou partielle) ;
  - silence (pas de compétence) ;
  - provoqué (doit cibler celui qui provoque) ;
  - marqué ;
  - bouclier.
- **Affichage** : journal du combat en phrases courtes (« Kaya bondit et inflige 42 dégâts au Gobelin cendré (critique !) »), barres de PV et de mana, et prévision de l'ordre des tours.

### 7.2 Session en direct ou asynchrone

- **En direct** : chaque joueur choisit l'action de son héros quand vient son tour. Un minuteur (réglable, par défaut 60 s) passe le tour en « défendre » automatiquement s'il expire.
- **Joueur absent** : son héros est soit **joué par l'IA**, soit **laissé au camp**. Chaque joueur choisit son réglage. La difficulté s'adapte aux héros réellement présents.
- **En asynchrone** : les combats des contrats de guilde se jouent en solo, avec la difficulté calculée pour un seul héros et sa compagne.

### 7.3 Difficulté adaptée au nombre de joueurs

On calcule la **puissance du groupe** : P = nombre de héros + 0,5 × nombre de compagnes présentes. Les ennemis sont ensuite ajustés par une table du fichier de configuration (valeurs de départ, à régler par la simulation) :

| P | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Multiplicateur des PV ennemis | × 1,0 | × 2,7 | × 4,3 | × 6,0 | × 8,0 | × 10,0 |
| Multiplicateur des dégâts ennemis | × 1,00 | × 1,35 | × 1,45 | × 1,70 | × 1,90 | × 2,10 |
| Ennemis supplémentaires | 0 | 0 | +1 | +1 | +2 | +2 |

Pour un P non entier (par exemple 2,5), on interpole entre deux colonnes. Ces valeurs ont été réglées par la simulation : un groupe de N héros est bien plus efficace que N héros seuls (ils se soignent, se protègent et concentrent leurs coups), d'où une croissance plus rapide que linéaire. Les PV des ennemis supplémentaires sont pris sur le total.

### 7.4 Mort douce

- À 0 PV, le héros est **K.O.** : il ne peut plus agir, mais un allié peut le relever (soin ou objet).
- Si le groupe gagne, les héros K.O. se relèvent à 1 PV.
- **Défaite du groupe entier** :
  - retour au dernier refuge ;
  - perte de 10 % de l'or ;
  - **blessure** (−10 % de PV max jusqu'au prochain repos long ou à l'activité « Repos ») ;
  - selon la quête, elle peut **échouer ou changer de branche**, par exemple un PNJ enlevé au lieu d'être sauvé.
- **Boss final** : en cas de défaite, on peut réessayer, mais chaque échec rend une fin plus sombre plus probable (des PNJ alliés tombent).

---

### 7.5 Combat libre et IA maison (décidé le 13/11)

À chaque tour, le joueur choisit entre deux façons de jouer, et le jeu mémorise son choix pour chaque héros :
- **📜 Suivre le script** : l'IA maison propose les 3 meilleures actions du moment, avec leurs chiffres. On clique, c'est tout.
- **✍️ Proposer mon action** : on écrit en français ce que fait le personnage (« je vise la tête du loup », « je combine feu et glace », « je me cache derrière le pilier »).

**Ce que fait l'IA maison** :
- Elle tourne dans le navigateur. Elle est gratuite, fonctionne hors ligne et n'utilise aucune IA payante.
- **Compréhension** : un petit classificateur entraîné sur environ 5 000 phrases générées à partir de modèles (`src/ia/corpus.ts`), plus la reconnaissance des noms de compétences, d'ennemis, d'alliés, d'éléments et de parties du corps, avec tolérance aux fautes de frappe. Précision mesurée sur 69 phrases écrites à la main, jamais vues à l'entraînement : environ 93 %. Commande : `npm run ia:entrainer`.
- **Vérification par le moteur** : il contrôle le mana, la recharge, la portée (corps à corps contre rang arrière), la cible, les ailes, les objets disponibles… puis il calcule les **vraies** chances de réussite et les dégâts. **L'IA ne décide jamais d'un chiffre**, c'est ce qui garde l'équilibrage intact.
- **Si l'action est impossible**, l'IA explique pourquoi (« Votre personnage n'a pas d'ailes : impossible de voler ») et propose 3 alternatives déjà validées par le moteur.
- **Règle des 3 essais** : 3 propositions impossibles (ou incomprises) dans un même tour, et le joueur doit choisir parmi les propositions du jeu jusqu'au tour suivant. « Observer l'ennemi » ne coûte ni le tour ni un essai.
- **Actions libres prévues** :
  - attaquer, viser une partie du corps, utiliser une compétence, se défendre, protéger un allié, fuir, se cacher, soigner ou boire une potion, lancer une bombe, parler pour pacifier (avec le don Langue universelle), changer de rang, observer, provoquer, invoquer, fusionner ;
  - certaines actions sont toujours refusées avec explication, par exemple voler sans ailes.

**Attaques visées** (le malus de toucher et les effets viennent du moteur) :

| Partie visée | Toucher | Dégâts | Effet si le coup porte |
|---|---|---|---|
| Tête | −20 points | × 1,25 | 15 % : immobilisé 1 tour (moitié moins contre un boss) |
| Jambes | −10 points | × 0,9 | 50 % : ralenti 2 tours |
| Bras armé | −10 points | × 0,9 | 50 % : affaibli 2 tours (−20 % de dégâts) |

On ne vise ni la tête ni les membres d'une gelée, d'un feu follet ou d'une tourelle.

**Se cacher** : la chance dépend de l'Agilité contre la perception (Esprit) des ennemis (+20 points pour une Ombre ou le don Pas de l'ombre). En cas de réussite, le personnage ne peut plus être ciblé et sa prochaine attaque est critique.

**Fusions et variantes** (pour éviter d'accumuler des centaines de compétences) :
- Combiner deux compétences crée une **variante** de la première, pas une nouvelle compétence. Exemple : « Javelot de flamme ✦ givre ».
- Conditions : les deux compétences sont connues, au **rang 2** au moins, et leurs éléments sont différents.
- **Formule** : 75 % de la puissance de la compétence de base + 45 % de la seconde (dans son élément), ses effets à 80 % de chance, 75 % du mana des deux, et une recharge d'un tour de plus. Une fusion fait moins que les deux compétences jouées en deux tours, mais en un seul tour et avec deux éléments.
- **Limites** :
  - 5 rangs par compétence ;
  - **2 variantes** par compétence, dont **une seule active** à la fois ;
  - **6 compétences équipées** en combat.

  Ces limites se règlent dans `content/config/campagne.yaml`.
- **Grimoire personnel** (décision du groupe après le test 1, remplace le grimoire partagé) : chaque héros a **son grimoire, privé**. Une fusion apprise appartient au héros qui l'a apprise ; les autres joueurs ne la voient ni dans leur fiche, ni à la Guilde, ni dans les propositions de combat. À la Guilde, chacun ne peut apprendre que les fusions de **sa classe et de ses compétences** (deux compétences connues, rang 2, éléments différents). Rien n'est écrit dans le journal commun.

## 8. Quêtes

| Type | Volume en saison 1 | Rôle |
|---|---|---|
| **Principale** | 6 chapitres, 3 à 4 étapes chacun | Le fil rouge ; jouée **en direct** |
| **Secondaires** | **4 ou plus par chapitre**, dans des régions variées | Réputation, objets, PNJ qui vivent ou meurent |
| **Quêtes de classe** | 1 chaîne de 3 étapes par classe (chapitres 2, 4 et 5) | Débloque l'**ultime** |
| **Quêtes de compagne** | 1 chaîne par compagne (3 étapes) | Paliers « Proche » puis « Engagée » |
| **Contrats de guilde** | Générés à partir de modèles (chasse, escorte, cueillette, exploration de donjon) | Or, XP, **points de guilde** ; répétables ; jouables en solo et en asynchrone |

**Parole adressée à un joueur** (test 1) : dans les moments importants, un personnage s'adresse à **un joueur précis, par son pseudo** (bloc `parole_a` d'un nœud de scène). Le joueur est choisi par une règle (classe, race…), puis au hasard à graine. **Lui seul répond**, parmi **3 réponses** adaptées à sa classe ou à sa race ; les autres voient la question et la réponse. Si ce joueur est absent, son héros répond seul. Les textes s'accordent au nombre de joueurs avec `[[tu…||vous…]]`.

**Paris** (test 1) : `miser: 20` retire vraiment l'or du héros qui choisit la réponse (impossible sans assez d'or) ; `gain_pari: 2` rend la mise et autant en gain ; `perte_pari: true` la fait perdre.

**Décisions de groupe** : pour un choix de la quête principale, chaque joueur présent vote. En cas d'égalité, c'est le « meneur du jour » qui tranche (il tourne à chaque session). Les choix personnels (romance, temps libre, dialogues individuels) n'engagent que le joueur.

**Quêtes et contrats par étapes** (test 1) : une quête secondaire ou un contrat ne mène plus directement à un combat. C'est une **suite d'étapes sur la carte** : accepter à la Guilde, se rendre au lieu (le point **clignote**), suivre la piste en 2 ou 3 points (un court texte ou un petit choix à chaque fois), trouver l'adversaire, puis **revenir à la Guilde** pour la récompense. Les contrats décrivent leurs étapes dans `etapes:` (`lieu`, `objectif`, `texte`, puis au plus un de `choix` / `test` / `combat`) ; les quêtes secondaires enchaînent de courtes scènes, une par étape (`etapes` de `quetes.yaml`). Un héros n'a qu'**un contrat en cours** à la fois. Le panneau Quêtes affiche l'étape en cours et le prochain lieu.

**Rangs de guilde** : F (0 point), E (100), D (300), C (700), B (1 500), A (3 000), S (6 000 + **épreuve du rang S** au chapitre 5).

**Conséquences durables**, enregistrées dans des **drapeaux** (« flags ») :
- la réputation auprès des factions ;
- les PNJ en vie ou morts ;
- les compagnes recrutées ou perdues ;
- les secrets révélés ou cachés.

Les drapeaux conditionnent les dialogues, les quêtes et les fins.

---

### Rangs de la Guilde et examens (changement du test 2)

Le rang (F à S) est **individuel** et s'obtient par **examen**. Les points de Guilde ne donnent plus le rang : ils **débloquent l'examen**. Réglages dans `content/config/campagne.yaml` (`guilde.rangs`).

| Rang | Points | Niveau minimum | Examen |
|---|---|---|---|
| F | 0 | — | examen d'entrée (scène du chapitre 1) |
| E | 100 | 3 | combat contre le Sergent Maelric |
| D | 300 | 6 | combat contre la Capitaine Ysolde Brandefer |
| C | 700 | 10 | épreuve en 4 étapes : escorter, enquêter, affronter le Maître d'armes Corvan Elsterre, cérémonie |
| B, A, S | 1 500, 3 000, 6 000 | 15, 22, 30 | à écrire avec les prochains chapitres |

- Quand les points et le niveau sont atteints, une notification l'annonce et **Dame Rowena porte un « ! »**. On lui parle à la Guilde pour passer l'examen.
- **Combat d'examen** : sans danger. En cas de défaite, ni blessure ni or perdu ; on retente **le lendemain** (en jeu). Les héros présents et prêts pour le même rang le passent **ensemble** (difficulté de groupe habituelle).
- **Épreuve** (à partir du rang C) : un contrat à étapes qui n'apparaît pas au tableau ; il se joue seul et se termine par un combat, puis par la cérémonie.
- Examen réussi : cérémonie avec Rowena, nouveau rang, accès aux contrats du rang.
- Équilibrage : `npm run equilibrage:examens` (rapport dans `rapports/equilibrage-examens.md`).

### Maîtrises d'équipement (changement du test 2)

Tout se ramasse et s'achète, mais une classe n'est pas douée avec tout. Chaque classe liste ses familles maîtrisées (`maitrises` dans `content/classes/*.yaml`).

| Classe | Armes maîtrisées | Armures maîtrisées | Interdit |
|---|---|---|---|
| Lame runique | épée, deux-mains | lourde | — |
| Arcaniste | bâton, orbe | légère | armure lourde |
| Invocateur | bâton, orbe | légère | armure lourde |
| Ombre | dague | intermédiaire | — |
| Gardien | épée, masse, sceptre | lourde | — |
| Alchimiste | arbalète | intermédiaire | — |
| Archer | arc, arbalète | intermédiaire | — |
| Guérisseur | bâton, sceptre | légère | armure lourde |
| Berserker | deux-mains, masse | lourde | — |
| Barde | dague, instrument | intermédiaire | — |

- **Arme non maîtrisée** : −30 % de dégâts (compétences comprises) et −15 points de chance de toucher.
- **Armure non maîtrisée** : la moitié de son armure est perdue, et −2 en Agilité.
- **Accessoire spécialisé** (bouclier, carquois, sacoche) d'une autre classe : bonus réduits de moitié.
- **Interdit** : l'objet ne s'équipe pas. **Réservé** : seuls les légendaires et mythiques propres à une classe.
- Le malus est affiché en orange (l'interdit en rouge) dans l'infobulle et la fiche, avant l'achat et l'équipement.

## 9. Temps, ellipses et temps libre

### 9.1 Réglages (fichier `content/config/campagne.yaml`)

| Réglage | Saison 1 |
|---|---|
| Années par chapitre | 3 |
| Chapitres par saison | 6 |
| Sessions par chapitre | 3 (environ 2 h chacune) |
| Durée d'une ellipse entre deux quêtes | 1 à 4 mois (selon la quête) |
| Ellipse de fin de chapitre | Jusqu'au début du chapitre suivant (le reste des 3 ans) |
| Niveau maximum | 40 |
| Date de départ | Printemps 1012 AV |

- **Pendant une quête**, le temps avance en heures et en jours (voyages, repos, nuits).
- **Entre deux quêtes ou deux chapitres**, une **ellipse** fait passer des mois ou des années. Les héros vieillissent automatiquement, et le calendrier déclenche les fêtes et les événements datés.

### 9.1 bis Le temps choisi par les joueurs (changement du test 1)

Cette règle **remplace les ellipses imposées** décrites ci-dessus :
- **Les jours** avancent en jouant : 1 jour toutes les 10 minutes de jeu actif (`jours_temps_reel` dans `campagne.yaml`). Un seul appareil envoie l'action « un jour passe » (celui du premier joueur présent), les autres la rejouent. Sans action depuis 10 minutes, le temps s'arrête. **Ce minuteur ne change jamais de mois** : il s'arrête au jour 30.
- **Les mois** ne passent que si les joueurs le décident, **à l'auberge du Chaudron Fêlé** : un clic sur le lit, puis 1, 3 ou 6 mois, ou « jusqu'à la suite de l'histoire ». **Tous les joueurs présents doivent accepter la même durée** ; ensuite chacun choisit ses activités de temps libre (§ 9.2).
- Les scènes de l'histoire qui ont une date (Crypte en Brumaire 1013, Fête des Lanternes le 15 Floréal 1014, convocation du roi en Nivôse 1014) **attendent** que les joueurs aient fait passer le temps.
- Le **saut entre deux chapitres** reste obligatoire, mais il passe aussi par le lit de l'auberge.
### 9.2 Phase de temps libre (à chaque ellipse, en asynchrone)

Chaque joueur choisit **2 activités** :

| Activité | Gain (pour une ellipse de 6 mois ; proportionnel à la durée) |
|---|---|
| Entraînement | XP (environ 30 % d'un niveau) ou +1 caractéristique (une fois par chapitre) |
| Artisanat | 1 objet fabriqué (qualité selon INT et le don) |
| Commerce | Or (selon CHA) |
| Relation | +5 à +10 d'affinité avec une compagne, plus une **scène** |
| Guilde | Points de guilde et petite somme d'or |
| Études | Compétence hors combat, indices sur l'intrigue |
| Domaine *(à partir du chapitre 3)* | Développer sa seigneurie : revenus, soldats pour la guerre du chapitre 5 |
| Repos | Supprime les blessures ; petit bonus d'affinité avec tout le monde |

### 9.3 Journal automatique

Chaque action importante écrit une ligne datée dans le journal de la partie :
- « Floréal 15, an 1014 — Lysmont est attaquée pendant la Fête des Lanternes » ;
- « Kaya rejoint le groupe ».

À l'ouverture du jeu, un **résumé « pendant votre absence »** liste ce qui s'est passé depuis la dernière connexion du joueur.

---

## 10. Plan de la saison 1 (1012 → 1030 AV)

### Chapitre 1 — « L'Appel » (printemps 1012 → printemps 1015) · niveaux 1 → 8 · Aubeclaire
- **Enjeu** : survivre dans un monde inconnu, s'imposer à la Guilde, comprendre ce que la Couronne attend des héros.
- **Événements datés** :
  - **Germinal 1012** : l'Appel au Temple du Seuil. Les invoqués arrivent, et les réincarnés sont attirés par la résonance.
  - **Solaire 1012** : examen d'entrée à la Guilde (rang F) et premier contrat.
  - **Brumaire 1013** : exploration de la **Crypte de la Fontaine**, le premier donjon. On y trouve un sceau cendré.
  - **Floréal 1014** : **attaque de Lysmont pendant la Fête des Lanternes** par Vorthak, émissaire de la Légion Cendrée. C'est le premier grand combat.
  - **Nivôse 1014** : le roi exige que les héros jurent fidélité à la Couronne. **Choix majeur** : jurer (Couronne +) ou rester indépendants avec la Guilde (Guilde +).
- **Personnages** : Aveline, Séraphine, Sœur Elianne, Kaya (rencontrée lors d'un contrat), le Grand Prieur Auréliath (Ordre), Dame Rowena (maîtresse de la Guilde), le roi Edmund IV.
- **Quêtes secondaires** (au moins 4) :
  - « Les loups de la Combe-aux-Saules » ;
  - « Le marchand de reliques » ;
  - « Les disparus du quartier des Tanneurs » ;
  - « L'apprenti de l'Ordre » ;
  - « Le tournoi des écuyers ».

### Chapitre 2 — « Les Routes du Sud » (1015 → 1018) · niveaux 8 → 15 · Marche des Sables
- **Enjeu** : une mission diplomatique à Qarzim tourne à l'enquête. Les cristaux d'éther sont des **fragments du Voile**.
- **Événements datés** :
  - **1015** : départ en caravane ;
  - **Brumaire 1016** : Grand Bazar de Qarzim ;
  - **Ardent 1016** : complot d'assassinat contre Séraphine ;
  - **1017** : grande tempête de sable, avec le donjon des **Ruines de Sel** ;
  - **1018** : révolte des Ourvalis. **Choix** : soutenir la tribu de Kaya ou la Concorde.
- **Personnages** : Nadja Kesh, le Prévôt Hassad (Concorde), la tribu Lunecroc.
- **Quêtes de classe** : étape 1.

### Chapitre 3 — « La Forêt qui se souvient » (1018 → 1021) · niveaux 15 → 22 · Sylvenoire
- **Enjeu** : les elfes détiennent la vérité sur la Déchirure. Les héros reçoivent chacun un **domaine**, ce qui ouvre l'activité « Domaine ».
- **Événements datés** :
  - **1019** : arrivée à Ithrael ;
  - **1020** : la Bibliothèque des Racines ;
  - **Nuitlongue 1020** : la Légion attaque la forêt, et les héros affrontent **Morra** pour la première fois. **Choix** : l'achever ou l'épargner.
- **Personnages** : Ilyssë, Morra (ennemie), la Reine-Sève des elfes.

### Chapitre 4 — « Feu et Écailles » (1021 → 1024) · niveaux 22 → 28 · Monts Grisfer et Archipel des Brumes
- **Enjeu** : former l'alliance des peuples (nains et dragons) avant la guerre.
- **Révélation** : Elianne découvre que **chaque invocation nourrit les Cendres**.
- **Événements datés** :
  - **1022** : les **Mille Marches** ;
  - **1023** : le Nid des Wyrms, où l'on rencontre **Ysoria** ;
  - **1023** : Morra déserte et rejoint le groupe, si on l'avait épargnée ;
  - **1024** : **choix majeur** : révéler publiquement le secret de l'Ordre ou le garder.
- **Personnages** : Ysoria, le Roi-sous-la-Montagne Bardrek, les pirates de Port-Vérane.
- **Quêtes de classe** : étape 2.

### Chapitre 5 — « La Guerre des Cendres » (1024 → 1027) · niveaux 28 → 34 · Mur d'Aube
- **Enjeu** : une guerre ouverte. Les domaines fournissent des troupes, et les PNJ peuvent mourir selon les choix passés.
- **Événements datés** :
  - **1025** : **chute du Mur d'Aube** et bataille rangée ;
  - **1026** : épreuve du **rang S** ; on découvre que le prince Aldric est vivant mais corrompu ;
  - **1027** : contre-offensive.
- **Quêtes de classe** : étape 3, qui débloque les **ultimes**.

### Chapitre 6 — « Le Souverain des Cendres » (1027 → 1030) · niveaux 34 → 40 · Terres Cendrées
- **Enjeu** : marcher sur la **Citadelle d'Obsidienne**. On y découvre qu'Orvan, le Souverain, est le **Premier Appelé**, trahi par l'Ordre.
- **Boss final** : **Orvan, le Souverain des Cendres**, un combat en 3 phases dont la difficulté s'adapte au nombre de joueurs. Son discours et le déroulé du combat changent selon les drapeaux.
- **Fins de saison** (au moins 3 demandées, 4 prévues) :

| Fin | Conditions principales | Résultat | Point de départ de la saison 2 |
|---|---|---|---|
| **A. Le Sceau** | Secret de l'Ordre révélé ; Ilyssë ou Elianne alliées | Le Voile est refermé pour toujours : plus aucune invocation. Orvan est vaincu et apaisé. | Un monde sans invocations ; l'Ordre dissous ; intrigues politiques |
| **B. Le Pacte** | Morra engagée ou amoureuse chez au moins un héros ; Orvan épargné ; réputation des peuples ≥ Ami | Orvan renonce et les Terres Cendrées deviennent un royaume démon en paix fragile | Diplomatie entre les peuples ; une menace venue d'**au-delà** du Voile |
| **C. La Couronne** | Serment à la Couronne ; secret gardé | Victoire militaire totale, mais l'Ordre continue d'invoquer : le Voile s'effrite | De nouvelles failles s'ouvrent ; de nouveaux Appelés arrivent (parfait pour de **nouveaux joueurs**) |
| **D. Le Retour** | Le Voile compris (Ilyssë « Proche ») ; Orvan vaincu | Une porte vers notre monde s'ouvre : **chaque joueur choisit de rester ou de partir** | Les héros restés sont des légendes ; ceux qui sont partis peuvent revenir en saison 2 |

Chaque fin comprend un **épilogue par héros** (son âge en 1030, son domaine, ses compagnes, son rang) et un **épilogue par compagne**.

### Saisons suivantes (mises à jour)
- On ajoute un dossier `content/campagne/saison-2/`.
- On **augmente le niveau maximum** (par exemple jusqu'à 60) dans le fichier de configuration.
- La chronologie continue après 1030 : les héros ont alors entre 36 et 53 ans. On pourra même envisager des héritiers jouables.
- Les sauvegardes de la saison 1 sont **reprises** : la fin obtenue détermine le point de départ.

---

## 11. Architecture technique (expliquée simplement)

```
 Navigateur de chaque joueur                         En ligne (gratuit)
┌──────────────────────────────────┐            ┌──────────────────────┐
│  Rendu 2D (Phaser) + menus (Svelte)│            │  GitHub Pages        │
│        ↓ actions   ↑ état         │  ← site ── │  (fichiers du jeu)   │
│  MOTEUR DE RÈGLES (TypeScript)   │            └──────────────────────┘
│  combat · XP · affinité · temps  │            ┌──────────────────────┐
│        ↑                         │ ⇄ actions ⇄│  Supabase            │
│  CONTENU (fichiers YAML)         │            │  parties, joueurs,   │
│  classes · quêtes · dialogues    │            │  journal d'actions   │
└──────────────────────────────────┘            └──────────────────────┘
```

- **Le rendu 2D** utilise **Phaser 3**, un moteur de jeu 2D gratuit pour navigateur. Il gère les cartes en tuiles des donjons, les sprites animés, les effets et la caméra. Les **menus, dialogues et fiches** sont faits en Svelte par-dessus, ce qui donne un texte net et facile à lire sur mobile. Toutes les images sont chargées depuis `assets/` : **une image manquante est remplacée par un provisoire**, et `npm run assets:manquants` liste ce qu'il reste à fournir.
- **Exploration à plusieurs** : dans un donjon, le groupe se déplace **ensemble** (le meneur du jour dirige, les autres suivent). Cela évite de synchroniser 6 déplacements en temps réel. Chaque joueur voit le même groupe sur son écran.
- **Le contenu** (classes, dons, ennemis, quêtes, compagnes, dialogues, calendrier, réglages) est écrit dans des **fichiers YAML** du dossier `content/`. Pour ajouter une quête ou une compagne, on ajoute un fichier, sans toucher au code. Un vérificateur signale en français toute erreur, par exemple un champ manquant.
- **Le moteur de règles** est le « cerveau » du jeu. Il ne s'occupe ni de l'affichage ni d'Internet. On peut donc le tester automatiquement et l'utiliser dans le **script de simulation d'équilibrage**.
- **La synchronisation** : chaque joueur envoie des **actions** (« Kaya attaque le gobelin 2 »), rangées dans l'ordre dans Supabase. Chaque navigateur rejoue la même liste avec le même « dé truqué reproductible » (un hasard à graine) et obtient donc **exactement le même état**. La même liste sert de **sauvegarde** et de **journal**.
- **La sauvegarde** : elle est automatique après chaque action. Le format porte un numéro de version, ce qui permet de reprendre les anciennes parties après une mise à jour.
- **Le mode local** : on peut aussi jouer sans Internet, sur un seul appareil, avec une sauvegarde dans le navigateur et un export ou import de fichier.
- **Ce que vous devrez faire vous-mêmes** (le README l'expliquera pas à pas) :
  1. créer un compte et un projet gratuits sur Supabase ;
  2. coller deux valeurs (l'adresse du projet et la clé publique) dans les réglages du dépôt GitHub ;
  3. activer GitHub Pages.

  À noter : un projet Supabase gratuit inutilisé pendant environ une semaine est mis en pause et se relance en un clic (conditions à vérifier sur supabase.com).

---

### 11.1 L'écran de jeu (décidé le 14/11)

Le jeu s'affiche **en plein écran, comme un jeu vidéo** : l'image (carte, décor, combat) occupe toute la fenêtre, et la page ne défile jamais.

- **En haut**, une barre fine et transparente : la date, le badge du héros (qui ouvre sa fiche), le meneur du jour, et les boutons 🗺 Carte, ☰ Menu, ⛶ plein écran et ▴ pour cacher la barre.
- **Le menu ☰** ouvre des tiroirs qui glissent depuis la droite : Histoire, Personnage, Compagnons, Quêtes, Journal, Partie. Un seul à la fois ; on le ferme avec ✕, Échap, un clic à côté, ou en balayant vers la droite. Sur ordinateur : C carte, H histoire, P personnage, O compagnons, Q quêtes, J journal.
- **Dans un lieu**, on clique sur un personnage du décor : une petite bulle s'ouvre près de lui (lui parler, voir sa marchandise…). Le nom du lieu et ses informations sont dans un cadre en bas, replié par défaut.
- **En dialogue**, le décor reste en fond et le texte est dans une boîte en bas, qu'on peut réduire pour voir l'image.
- **En combat**, la scène occupe tout l'écran ; les actions sont dans un panneau en bas, le journal dans un volet à droite.
- La boutique, le lit de l'auberge, l'examen de rang et le temps libre s'ouvrent dans des fenêtres au centre de l'écran.
- Chaque appareil retient si l'on préfère la barre, le cadre du lieu ou le panneau du combat repliés.

## 12. Équilibrage : la méthode

- Un script (`npm run equilibrage`) fait combattre **chaque classe** contre des **ennemis de référence** (un costaud, un rapide, un mage, un groupe de faibles, un mini-boss), au niveau 1 puis à quelques niveaux repères. Il fait **au moins 1 000 combats par cas**.
- On teste aussi chaque **don**, et des **groupes de 2 à 4 héros** pour vérifier l'adaptation de la difficulté.
- Les **80 combinaisons classe × race** (10 × 8) sont testées, avec au moins 1 000 combats chacune.
- **Critères** (en points de pourcentage autour de la moyenne générale) :
  - chaque **classe**, en moyenne sur les races : **± 10 points**. Par exemple, si la moyenne vaut 60 %, chaque classe doit être entre 50 % et 70 % ;
  - chaque **race**, en moyenne sur les classes : **± 10 points** ;
  - chaque **combinaison** : **± 15 points**, pour qu'aucun combo ne devienne un choix évident (par exemple Nain Gardien ou Sang-dragon Berserker).
- Le script affiche un **tableau** et l'enregistre aussi en **CSV** (lisible dans Google Colab). Il **échoue** si une classe, une race ou une combinaison sort de sa fourchette : on corrige alors les chiffres et on relance.
- Le script est relancé à chaque ajout de classe, de race, de don ou d'ennemi.

---

## 13. Ce que contiendra la version jouable 1

- Créer ou rejoindre une partie (code + pseudo), en mode local et en ligne.
- Créer son personnage : les 8 races, les 10 classes, les 12 dons, invoqué ou réincarné, avec import d'un portrait personnel.
- La carte d'Aubeclaire cliquable, les décors de ville, **le donjon de la Crypte de la Fontaine en vue de dessus**, et les combats 2D animés (avec les textures livrées ou les provisoires).
- **Le prologue d'enfance** pour les réincarnés.
- **Le chapitre 1 complet** : quête principale, 4 quêtes secondaires et plus, contrats de guilde.
- Le combat au tour par tour, avec compétences, compagne et difficulté adaptée.
- **Une compagne** : Aveline, avec ses paliers d'affinité et le début de sa quête.
- Le temps libre, le calendrier, le journal automatique.
- La sauvegarde et la reprise ; un joueur peut arriver en cours de route.
- Des tests automatiques et le tableau d'équilibrage.

---

## 14. Points de validation (validés le 13/11)

1. Le **nom du monde** (Velmaris) et le titre « Les Appelés de Velmaris » vous conviennent-ils ? **→ Validé.**
2. Les **10 classes** et les **12 dons** : faut-il en retirer ou en remplacer certains ? **→ Validé.**
3. Les **8 compagnes** : vous conviennent-elles ? Voulez-vous **Aveline** comme compagne de la version 1 ? **→ Validé.**
4. Le **niveau maximum de 40** pour la saison 1, et l'ultime au niveau 30 ? **→ Validé.**
5. Les **votes** pour les décisions de groupe, avec un « meneur du jour » en cas d'égalité ? **→ Validé.**
6. Les **4 fins** et leurs conditions ? **→ Validé.**
7. ~~La race sans effet sur les caractéristiques ?~~ **Tranché** : 8 races, avec des bonus et malus à somme nulle et un trait racial (§ 3.6).
8. Dans les donjons, le groupe se déplace **ensemble**, dirigé par le meneur du jour, plutôt que chacun séparément ? **→ Validé.**
9. Le cahier des charges graphique (tuiles de **32 × 32**, sprites de combat de **64 × 64**, portraits de **512 × 512**) convient-il aux packs ou à l'outil que vous comptez utiliser ? **→ À confirmer avec le graphiste** (les tailles restent réglables dans la configuration).
