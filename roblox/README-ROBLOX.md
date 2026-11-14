# Les Appelés de Velmaris — version Roblox

Portage du jeu sur Roblox, en 3D simple. Les compagnes restent des **amies** : sur Roblox, la romance n'est autorisée que dans les expériences 17+ avec vérification d'identité, donc on fait une version tout public.

## Comment c'est construit

```
content/*.yaml  ──(npm run roblox:contenu)──►  roblox/src/shared/contenu.lua   (les données du jeu)
src/moteur/*.ts ──(npm run moteur)──────────►  roblox/src/shared/moteur.lua    (les règles, traduites en Luau)
roblox/src/server/  : le serveur Roblox (la partie, les sauvegardes)
roblox/src/client/  : ce que voit chaque joueur (interface, 3D)
```

- **Un seul moteur pour le web et Roblox.** Les règles (combat, quêtes, affinité…) sont écrites une seule fois, en TypeScript, dans `src/moteur/`. L'outil TypeScriptToLua les traduit en Luau pour Roblox. Une correction faite dans le moteur profite donc aux deux versions.
- **Test de parité.** Un robot joue tout le chapitre 1 en TypeScript, puis le moteur Luau rejoue les mêmes actions. Les deux états finaux doivent être identiques, au point près. C'est vérifié avec 5 graines de hasard différentes.
- `moteur.lua` et `contenu.lua` sont **générés** : on ne les modifie jamais à la main. Ils sont déjà dans le dépôt, donc tu n'as pas besoin de les régénérer pour tester.

## Installer (une seule fois)

Il te faut : Node.js, VS Code avec les extensions **Rojo** et **roblox-ts**, Roblox Studio et Rojo. Tu as déjà tout ça.

1. Récupère la dernière version du dépôt (`git pull`, ou « Fetch / Pull » dans GitHub Desktop), sur la branche `claude/festive-mccarthy-ahagx5`.
2. Dans VS Code : **Fichier → Ouvrir le dossier** → choisis le dossier **`roblox`** du dépôt (pas ton ancien dossier d'essai `velmaris-roblox`).
3. Copie ton `rojo.exe` dans ce dossier `roblox` (il est ignoré par Git).
4. Dans le terminal de VS Code :

```bash
npm install
```

## Lancer et tester dans Studio

1. Terminal 1, pour traduire le code à chaque sauvegarde :

```bash
npm run watch
```

2. Terminal 2, pour envoyer le code à Studio :

```bash
.\rojo.exe serve
```

3. Dans Roblox Studio : **Nouveau → Baseplate**, puis **Plugins → Rojo → Connect**.
4. **View → Output** pour afficher la sortie, puis **Play** ▶.

## Liste de contrôle — étape R0 (le moteur tourne dans Roblox)

Dans Output, tu dois voir, dans l'ordre :

- [ ] `[Velmaris] Contenu chargé : OK`
- [ ] `[Velmaris] 1er Germinal 1012 AV — partie « Partie d'essai »`
- [ ] deux lignes `Héros :`, pour Kael (Humain, Lame runique) et Ilo (Elfe, Arcaniste élémentaire)
- [ ] `Prochaine étape : Écouter le Grand Prieur au Temple du Seuil.`
- [ ] une suite de lignes `[Combat] …`, l'examen de la Guilde joué automatiquement
- [ ] `Résultat : victoire en … tours`
- [ ] `Le moteur fonctionne dans Roblox !`
- [ ] aucune ligne rouge (erreur)

S'il y a une ligne rouge, envoie une capture de la fenêtre Output.

## Liste de contrôle — étape R1 (parties multijoueur, création du héros)

### Activer la sauvegarde (une seule fois, facultatif pour tester)

Sans ces réglages, le jeu marche quand même, mais les parties sont **perdues à l'arrêt** : un bandeau le signale en bas de l'écran.

1. **Fichier → Publier sur Roblox** (*File → Publish to Roblox*) → crée une nouvelle expérience « Les Appelés de Velmaris ». Elle reste **privée**.
2. **Accueil → Paramètres du jeu** (*Home → Game Settings*) → **Sécurité** (*Security*) → active **« Autoriser l'accès de Studio aux services API »** (*Enable Studio Access to API Services*) → **Enregistrer**.

### Tester à deux joueurs dans Studio

1. Onglet **Test** → **Clients et serveurs** (*Clients and Servers*) → choisis **2 joueurs** → **Démarrer** (*Start*). Trois fenêtres s'ouvrent : le serveur, Player1 et Player2.
2. Fais les vérifications ci-dessous dans les fenêtres Player1 et Player2.

- [ ] L'écran d'accueil « Les Appelés de Velmaris » s'affiche.
- [ ] **Player1** : crée une partie → l'écran « Création de ton héros » s'affiche avec un **code à 6 caractères**.
- [ ] **Player1** : clique sur « Créer mon héros » sans nom → bandeau rouge « Donne un nom à ton héros. » (un clic dessus le ferme).
- [ ] **Player1** : crée un héros (nom, race, classe, don) → la **fiche** s'affiche (date, prochaine étape, caractéristiques, joueurs, journal).
- [ ] **Player2** : entre le code → « Rejoindre » → dans la liste des dons, celui de Player1 est **grisé**, avec « pris par … ».
- [ ] **Player2** : crée son héros → chez **Player1**, la liste « Joueurs » montre Player2 🟢 **sans recharger**.
- [ ] **Player2** : « Quitter la partie » → chez Player1, Player2 passe en ⚪ (absent).
- [ ] **Player2** : « Mes parties » → la partie est listée → un clic la reprend, et Player2 repasse en 🟢.
- [ ] Avec la sauvegarde activée : arrête le test, relance-le → « Mes parties » → la partie revient avec les héros.
- [ ] Aucune ligne rouge dans Output (fenêtres du serveur et des joueurs).

## Liste de contrôle — étapes R2 à R5 (tout le chapitre 1 sur Roblox)

Fais d'abord la liste R1 ci-dessus, puis continue avec la même partie.

**Lysmont en 3D (R2)**
- [ ] Après la création du héros, on voit Lysmont : place avec fontaine, temple blanc, château, Guilde (toit bleu), taverne, arène, quartier des Tanneurs, ferme de la Combe-aux-Saules, crypte, reliés par des chemins.
- [ ] Au-dessus du Temple du Seuil : ⭐ (quête principale). Le bandeau du haut indique « ➤ Prochaine étape : Écouter le Grand Prieur… », avec un bouton **Y aller**.
- [ ] « Y aller » te place devant le temple. Approche-toi de la porte, appuie sur **E** (« Entrer ») : le panneau du lieu s'ouvre à droite.
- [ ] Menu du haut : **Carte**, **Personnage**, **Compagnons**, **Quêtes**, **Journal**, **Partie** ouvrent chacun leur panneau.

**Dialogues et votes (R2)**
- [ ] Au temple : « Lancer » la scène de l'Appel → la boîte de dialogue s'affiche en bas, et « Continuer ▸ » fait défiler les répliques.
- [ ] À deux joueurs : chacun vote, les votes s'affichent (« Votes : … »), la scène avance quand tout le monde a voté. Le meneur peut aussi « Trancher ».

**Combats (R3)**
- [ ] Guilde → examen d'entrée → « ⚔ Au combat ! » → la caméra montre l'arène : héros à gauche, golem à droite, barres de PV.
- [ ] À ton tour : « 📜 Suivre le script » propose 3 actions. « ✍️ Proposer mon action » : écris « je vise la tête du golem » puis « Proposer » → l'IA comprend et propose « Valider ».
- [ ] Écris 3 fois n'importe quoi → au 3ᵉ essai, le jeu t'oblige à choisir parmi ses propositions.
- [ ] « ▸ Toutes les actions » : Attaque, compétences, potion, se défendre, fuir…
- [ ] Les pions avancent quand ils attaquent, clignotent en rouge quand ils sont touchés, et tombent quand ils sont K.O.
- [ ] Victoire → bilan → « Continuer » → retour à Lysmont.

**Donjon, temps libre, fin de chapitre (R4)**
- [ ] Crypte de la Fontaine : vue de dessus, brouillard, boule dorée = le groupe. Le meneur se déplace avec les flèches à l'écran ou ZQSD.
- [ ] Temps libre (après certaines scènes) : chacun choisit ses activités, puis « Ce qui s'est passé », puis « Reprendre l'aventure ».
- [ ] Panneau Personnage : « +1 » sur une caractéristique et « Améliorer » une compétence quand on a des points ; équiper ou vendre un objet.
- [ ] Panneau Compagnons : Aveline, son palier (Inconnue → … → Amie fidèle → Lien indéfectible), cadeaux, « L'emmener en combat ».

**Version tout public (R5)**
- [ ] Aucune scène ni aucun texte romantique. Aveline est une amie et une compagne d'armes.

## Graphismes (mise à jour du 13/11)

### Réglage à faire une fois dans Studio : l'éclairage « Future »
Roblox interdit de le régler par script. Dans Studio : **Explorer → Lighting** → dans **Properties**, **Technology → Future**, puis enregistre la place (Ctrl+S). Le reste (ciel, brume, couleurs, reflets) est réglé automatiquement par le jeu.

### Ce que fait le code
- **Monde** :
  - terrain Roblox (herbe, collines, rivière au nord, chemins de terre), lumière de fin d'après-midi ;
  - maisons à colombages (fenêtres éclairées, cheminées qui fument), lanternes, arbres et sapins, villageois sur la place ;
  - temple, château à tours, arène en pierre, crypte avec flambeaux.
- **Personnages** :
  - héros = **ton avatar Roblox**, avec l'arme de ta classe (épée runique, hache, bâton, arc, dagues…) ;
  - ennemis humanoïdes en personnages costumés (bandit, cultiste, squelette, gobelin, Vorthak cornu) ;
  - bêtes et golems construits en pièces (loups, rat, sanglier, araignée, chauve-souris, gelée, feu follet, golems).
- **Combat** :
  - il a lieu **sur place**, à l'arène, à la Combe, aux Tanneurs, ou dans une salle de crypte pour le donjon ;
  - gros menu en bas, ordre des tours en haut, équipe à gauche ;
  - **clic sur un personnage** pour le viser ;
  - chiffres de dégâts, éclats de couleur selon l'élément, coups critiques qui secouent la caméra, chutes au K.O.

### Remplacer un modèle par celui du groupe
1. Construis le modèle dans Studio, ou importe-le depuis Blender. Si tu prends un modèle du Creator Store, il doit être **sans scripts**.
2. Dans **ServerStorage**, crée un dossier **`ModelesDuGroupe`** et mets-y le modèle. Il doit porter **exactement le nom de l'ennemi** : `loup-gris`, `squelette`, `bandit`, `cultiste`, `gobelin-cendre`, `golem-de-pierre`, `golem-fontaine`, `araignee-geante`, `rat-geant`, `sanglier`, `chauve-souris`, `gelee-verte`, `feu-follet`, `loup-spectral`, `vorthak`, `mannequin-entrainement`, `tourelle`, `colosse`, ou `aveline` pour la compagne.
3. Le modèle est utilisé automatiquement au lancement suivant :
   - un personnage avec `Humanoid` (R15) est animé comme les autres ;
   - sinon, sa **PrimaryPart** sert de point d'appui.
4. Par sécurité, le jeu **supprime tous les scripts** contenus dans ces modèles.

Les bâtiments se remplacent plus tard sur le même principe, sur demande.

## Intérieurs et ville vivante (mise à jour du 13/11)

### Ce qui a été ajouté
- **Intérieurs** : chaque lieu a sa salle. Approche-toi de la porte, appuie sur **E** (« Entrer ») : fondu au noir, et tu es dedans. La porte « **Sortir** » te ramène dehors.
  - **Guilde** : comptoir de Dame Rowena (Acheter), **tableau des contrats** (Consulter), **pupitre du grimoire** (Lire), tables, mannequins d'entraînement.
  - **Taverne** : bar de Bram (Commander), tonneaux, cheminée qui brûle, clients attablés, escalier.
  - **Temple** : nef, bancs, autel lumineux, vitraux, Grand Prieur Mathis et Sœur Elianne, comptoir des offrandes.
  - **Château** : salle du trône, tapis rouge, gardes, le roi Edmund IV et la princesse Séraphine.
  - **Tanneurs** : atelier avec cuves de teinture et peaux tendues, Lina.
  - **Arène** : vestiaire, râteliers d'armes, maître d'armes.
  - **Combe-aux-Saules** : maison de Gareth.
  - **Crypte** : antichambre aux flambeaux et escalier pour « Descendre ».
  - **Comptoir de Halvine** : étagères pleines, balance et fioles, Halvine (Acheter / Vendre).
  - La **place de Lysmont** reste dehors : c'est le **marché** (ses étals vendent le catalogue du Comptoir).
- **PNJ** : touche **E** pour « Parler ». Chacun propose **ses** scènes. Au-dessus de la tête : **!** doré pour la quête principale, **!** argenté pour autre chose à faire, **?** quand on peut rendre une quête. Les PNJ que ta partie ne doit pas encore voir (Kaya avant l'examen…) sont cachés pour toi.
- **Jour et nuit** : une journée dure environ 20 minutes. La nuit, les fenêtres et les lanternes s'allument et la lumière devient bleutée.
- **Villageois** :
  - une douzaine marchent entre la place et les portes, et rentrent chez eux la nuit ;
  - **3 gardes** font des rondes, jour et nuit ;
  - des **bulles de phrases** s'affichent au-dessus des têtes, et elles changent avec l'histoire (« Encore des loups à la Combe… » puis « Plus un hurlement depuis que les aventuriers sont passés ! »).
- **Marché** : six étals colorés autour de la fontaine. Leurs marchands crient leurs produits, et **E** sur un marchand ouvre la boutique de la place.
- **Animaux** : poules qui picorent à la Combe et aux Tanneurs, chats (la queue bouge), chevaux devant le château.
- Les phrases d'ambiance sont dans **`content/monde/ambiance.yaml`**. Le groupe peut en ajouter sans toucher au code.

### Ajouter des sons (facultatif)
Le jeu est prêt à jouer : ambiance de ville le jour et la nuit, taverne, temple, musique de combat, coups, fanfare de victoire. Il manque seulement les numéros des sons :
1. Dans Studio : **Boîte à outils** (*Toolbox*) → onglet **Audio** → écoute et choisis un son.
2. Clic droit sur le son → **Copier l'identifiant de l'asset**.
3. Colle-le dans `roblox/src/shared/sons.ts`, par exemple `ambianceVille: "rbxassetid://123456789",`. Enregistre : `npm run watch` s'occupe du reste.

Je n'ai mis aucun numéro moi-même : je ne peux pas vérifier qu'un son existe et qu'il est libre d'utilisation.

### Liste de contrôle
- [ ] Entrer dans chaque bâtiment (E), et en ressortir par la porte « Sortir ».
- [ ] Dans la Guilde : Parler à Rowena, Consulter le tableau (contrats), Lire le grimoire, Acheter au comptoir.
- [ ] Le bandeau du haut indique « 📍 Tu es dans : … » avec « Que faire ici ? ».
- [ ] Des villageois marchent sur la place et vers les bâtiments ; des bulles de phrases apparaissent.
- [ ] Attendre la nuit (environ 10 minutes après le début) : les fenêtres et les lanternes s'allument et les villageois rentrent. Les gardes restent.
- [ ] Marché : E sur un marchand → boutique.
- [ ] À 2 joueurs : chacun peut être dans une salle différente.

## Nouveautés du web intégrées (lots C, D et E)

- **Les jours passent en jouant** : 1 jour toutes les 10 minutes de jeu actif (le serveur s'en charge), jamais d'un mois à l'autre.
- **Les mois passent à l'auberge** : dans la taverne, le **lit** (touche E) propose de dormir 1, 3 ou 6 mois, ou « jusqu'à la suite de l'histoire ». Tous les joueurs présents doivent accepter. La demande s'affiche dans la barre du haut, où qu'ils soient.
- **Questions adressées à un joueur** : pendant certaines scènes, un PNJ interroge un joueur par son pseudo. Lui seul choisit parmi 3 réponses, adaptées à sa classe ou à sa race. Les autres voient « … réfléchit à sa réponse ».
- **Paris** : la mise est indiquée sur le choix, et grisée si tu n'as pas assez d'or.
- **Grimoire personnel** : chacun a ses fusions. La Guilde n'enseigne que celles de ta classe (pupitre du grimoire).
- **Contrats et quêtes par étapes** : on accepte le contrat au tableau de la Guilde, puis chaque étape se joue dans un lieu.
  - Les **lieux d'étape** (lisière de la Combe, gué de Valmont, égouts…) apparaissent comme une **balise lumineuse dorée**, visible seulement pendant l'étape qui y mène. On l'examine avec E.
  - La barre du haut rappelle le contrat en cours, avec un bouton **Y aller**.
- **Anciennes parties Roblox** : mises à jour automatiquement au chargement (mêmes migrations que le web).

### Liste de contrôle
- [ ] Taverne → lit → « Dormir 1 mois » : l'autre joueur voit la demande en haut ; quand il accepte, le temps libre commence.
- [ ] Scène de l'Appel : le Grand Prieur interroge un joueur par son pseudo, et seul ce joueur a les 3 réponses.
- [ ] Guilde → tableau → accepter « Les loups… » → une balise dorée apparaît (Y aller) → Examiner → étape suivante… → retour à la Guilde pour la récompense.
- [ ] Pupitre du grimoire : seules les fusions de ta classe sont proposées.

## Équipement en 3D (mise à jour du 13/11)

Les 364 objets du catalogue du groupe (`equipements/`) sont dans le jeu, sur le web et sur Roblox.

### Ce que fait le code
- **Chaque objet a un modèle 3D** construit par le code (`src/shared/equipement3d.ts`) :
  - la forme dépend de la **catégorie** (épée, hache, masse, dague, arc, arbalète, bâton, sceptre, orbe, luth ou flûte, bouclier, anneau, amulette, talisman, carquois, sacoche, tenues lourde, intermédiaire et légère) ;
  - le **métal** dépend du palier : fer, acier, argent, acier noir, or pâle, obsidienne, cristal ;
  - la **rareté** ajoute un liseré lumineux (rare), une lueur (épique), des étincelles (légendaire et mythique) ;
  - une **touche élémentaire** colore la lame (feu orange, glace bleue, foudre jaune…).
- **Ton avatar porte ton équipement** dans le monde et en combat : arme en main (arc et luth à gauche), armure ajustée à ton corps (plastron, épaulières, robe et cape pour les tenues légères), bouclier au bras, anneau, amulette, carquois dans le dos, sacoche à la ceinture. Sans arme équipée, tu gardes l'arme de ta classe.
- **Fiche du personnage → Sac** : chaque objet a un **aperçu 3D qui tourne**, son nom en couleur de rareté, le niveau et les classes requis (en rouge si tu ne peux pas), ses effets, son pouvoir unique, et la **comparaison** avec l'objet porté. Boutons Équiper, Retirer, Vendre.
- **Boutiques** (Halvine, Guilde) : même présentation, objets triés (ce que tu peux porter d'abord). Une arme mythique déjà présente dans la partie ne peut pas être rachetée.
- **Butin** : un nouvel équipement s'annonce en haut de l'écran avec son aperçu 3D.
- Les ennemis humanoïdes (bandit, cultiste, squelette, Vorthak…) et Aveline portent aussi des objets du catalogue. C'est seulement de l'apparence : les règles de combat ne changent pas pour eux.

### Remplacer un objet par un modèle du groupe
Dans **ReplicatedStorage**, crée un dossier **`ObjetsDuGroupe`** et mets-y un Model nommé comme l'objet (ex. `velgraive`). Sa **PrimaryPart** doit s'appeler `Poignee` : c'est le point tenu en main, avec la lame vers l'avant (axe -Z). **Il ne doit contenir aucun script.**

### Liste de contrôle
- [ ] Halvine : les objets ont un aperçu 3D qui tourne ; les objets d'une autre classe sont en bas, avec « Pour : … » en rouge.
- [ ] Acheter une arme → l'annonce « Nouvel objet ! » apparaît → Fiche → Sac → Équiper : l'arme apparaît dans la main de ton avatar (en ville) et en combat.
- [ ] Équiper une tenue légère (robe) : robe et cape sur ton avatar ; une tenue lourde : épaulières, brassards, jambières.
- [ ] Retirer l'arme : l'arme de ta classe revient.
- [ ] Objet de niveau trop élevé : le bouton affiche « Niveau N requis » et reste grisé.
- [ ] Le Vorthak, le cultiste et Aveline portent leurs armes et armures.

## Graphismes et optimisation (mise à jour du 13/11, suite)

### Ce qui a changé
- **Lumière** : reflets du ciel sur le métal, le verre et l'eau, ombres plus douces, soleil et lune plus grands, étoiles, **nuages animés**, légère profondeur de champ au loin. La nuit, l'image devient bleutée et les nuages gris.
- **Terrain** : couleurs plus chaudes (herbe, terre, pavés, sable), **brins d'herbe animés**, rivière plus claire avec des vagues, collines douces, chemins pavés au centre, rochers et roseaux au bord de l'eau.
- **Végétation** : arbres avec racines, branches et feuillage en volume (terrain « herbe feuillue »), sapins à quatre étages, buissons, rochers, fleurs des champs.
- **Bâtiments** :
  - toits en tuiles d'argile avec faîtière ;
  - colombages en croix, fenêtres à croisillons, volets et jardinières fleuries ;
  - portes encadrées de pierre avec une marche ;
  - château : fenêtres à meneaux et porche ; temple : chapiteaux dorés ; fontaine avec des jets d'eau ;
  - tours à toit conique et fanion, lanternes vitrées.
- **Monstres** :
  - loups, sanglier et rat refaits : poitrail, cou, gueule et crocs, pattes articulées, queue courbée. Le sanglier a des soies et des défenses, le loup spectral une âme qui brille ;
  - araignée aux pattes coudées, chauve-souris aux ailes en membrane, gelée brillante avec des bulles ;
  - golems avec mousse, fissures et runes lumineuses, tourelle runique ;
  - gobelins aux oreilles pointues, capes pour le cultiste, le Vorthak, le chef et Aveline.
- **Optimisation** :
  - les petites pièces ne projettent plus d'ombre et le décor ne déclenche plus de contacts ;
  - les lumières de la ville n'ont plus d'ombres (les intérieurs les gardent) ;
  - le feuillage est en terrain : beaucoup moins de pièces qu'avant ;
  - les fenêtres et les flammes qui s'allument la nuit sont retrouvées par étiquette (CollectionService), sans parcourir tout le monde ;
  - une seule boucle fait tourner tous les aperçus 3D ;
  - l'équipement d'un avatar n'est reconstruit que s'il a changé.

### Liste de contrôle
- [ ] Au lancement : nuages qui bougent, herbe animée, reflets sur la fontaine et la rivière.
- [ ] Les maisons ont des volets, des jardinières et des toits en tuiles ; le château a des fenêtres et un porche.
- [ ] La nuit : fenêtres et lanternes allumées, ciel étoilé, image bleutée.
- [ ] Combat contre les loups : nouveaux modèles (gueule, pattes, queue).
- [ ] Sur téléphone (ou avec le réglage de qualité graphique bas) : le jeu reste fluide.

### Si le jeu rame
Dans **Studio → Workspace → StreamingEnabled**, le streaming peut alléger les téléphones. **Je ne l'ai pas activé** : les marqueurs et les intérieurs ont besoin que tous les bâtiments soient chargés chez chaque joueur. Si vous l'activez, testez bien l'entrée dans les bâtiments éloignés.

## Saison 1 complète : les nouvelles régions (mise à jour du 14/11)

Chaque région des chapitres 2 à 6 est construite par le code (`src/server/regions.ts`), **loin des autres** :
- la Marche des Sables au sud, Sylvenoire à l'ouest, Grisfer à l'est ;
- l'Archipel au sud-ouest, le Mur d'Aube et les Terres Cendrées au nord.

On y va par la **carte → « Y aller »** (téléportation). Chaque région a son style : terrain, matériaux, bâtiments et végétation. Chaque lieu a son bâtiment selon son genre (auberge, comptoir de la Guilde, boutique, palais, temple, campement, mine, ruines…) et sa salle intérieure. Les PNJ apparaissent quand l'histoire le permet.

### Liste de contrôle — chapitre 2 (Marche des Sables)
- [ ] Fin du chapitre 1 → dormir à l'auberge → au château, Séraphine lance « Le départ ».
- [ ] La carte affiche une nouvelle section « Marche des Sables » ; « Y aller » vers la Route des Caravanes téléporte dans le désert.
- [ ] Qarzim : porte, Grand Bazar (étals colorés), Oasis Bleue (coupole et bassin), Comptoir de la Guilde (bannières), Palais (coupole), Résidence.
- [ ] Comptoir de la Guilde de Qarzim : le tableau propose les contrats de la région, le pupitre les fusions.
- [ ] Oasis Bleue : le lit permet de dormir (les mois passent).
- [ ] Les combats du chapitre se déroulent dans le désert (route, canyon, mines, résidence).
- [ ] Ruines de Sel : le donjon se joue comme la Crypte. Après 3 défaites, on peut ressortir par l'escalier (porte de secours).

### Liste de contrôle — chapitre 3 (Sylvenoire)
- [ ] Fin du chapitre 2 → dormir → au château : « Les domaines » ; Elianne rejoint le groupe.
- [ ] La carte affiche « Sylvenoire » : la lisière, puis Ithrael (arbre-palais aux plateformes, lanternes bleues, huttes à toit de feuillage, champignons lumineux la nuit).
- [ ] « Votre domaine » apparaît sur la carte de Sylvenoire ; l'activité « Gestion du domaine » du temps libre augmente les troupes.
- [ ] Bibliothèque des Racines : donjon jouable, Codex à la fin.
- [ ] Nuitlongue : combat contre Morra, puis le choix l'achever / l'épargner.

### Liste de contrôle — chapitre 4 (Monts Grisfer et Archipel des Brumes)
- [ ] Fin du chapitre 3 → dormir → au château : « L'alliance des peuples ».
- [ ] La carte affiche « Monts Grisfer » (à l'est) et « Archipel des Brumes » (au sud-ouest).
- [ ] Karak-Dûm : porte de bronze, salle du trône, Grande Forge (boutique de Durna, palier IV), Chope Ardente (lit), Comptoir de la Guilde.
- [ ] Port-Vérane : quais, Requin Ivre (lit), Marché aux épaves (boutique de Corail), Comptoir de la Guilde.
- [ ] Les Mille Marches : donjon jouable (golems, salamandres, Gardien), Registre à la fin.
- [ ] Nid des Wyrms : combat contre Vask, puis Ysoria rejoint le groupe (amitié seulement sur Roblox).
- [ ] Porte de Karak-Dûm : Morra déserte (si on l'avait épargnée), sinon un déserteur.
- [ ] Temple du Seuil : le choix « révéler / garder le secret » de l'Ordre, puis fin du chapitre.

### Liste de contrôle — chapitre 5 (Mur d'Aube)
- [ ] Fin du chapitre 4 → dormir → au château : « Le conseil de guerre ».
- [ ] La carte affiche « Mur d'Aube » (au nord) : Fort-Aube (porte, État-major, la Gamelle avec lit, Armurerie de Tolvan au palier V, comptoir de la Guilde), chemin de ronde, camp des alliés, ruines de Valgrane.
- [ ] Chute du Mur : colosse de siège puis Vorthak ; selon la réputation des troupes et des elfes, la Maréchale ou Vaelor peuvent mourir (ils disparaissent alors des décors).
- [ ] La Brèche et la plaine cendrée apparaissent sur la carte après la chute.
- [ ] Arène de Lysmont : épreuve du rang S (broche dans le sac).
- [ ] Ruines de Valgrane : combat contre Aldric, puis le choix le ramener / le laisser partir / l'achever.
- [ ] Contre-offensive : camp de la Légion, puis le Gardien de la Brèche ; fin du chapitre.
- [ ] Quête de classe étape 3 : l'ultime est débloqué (utilisable au niveau 30).

### Liste de contrôle — chapitre 6 (Terres Cendrées) et fin de la saison
- [ ] Fin du chapitre 5 → dormir → à l'État-major de Fort-Aube : « Au-delà du Mur ».
- [ ] La carte affiche « Terres Cendrées » : Camp de l'Aube (Tente des Braves avec lit, Forge de Durna au palier VI, comptoir de la Guilde), Cendrebourg, Forêt pétrifiée, Lac de lave.
- [ ] Cendrebourg : le choix épargner / protéger / brûler le village (brûler fait partir Morra).
- [ ] Citadelle d'Obsidienne : donjon jouable ; avec Morra et la clé de braise, Lyss est libérée.
- [ ] Sommet : Orvan en 3 phases (Souverain, déchaîné, cœur du Voile), puis l'épargner ou l'achever.
- [ ] Vote de la fin : seules les fins possibles sont proposées (« La Couronne » toujours) ; épilogue des compagnes.
- [ ] Écran « Fin de la saison 1 » avec le nom de la fin ; au château, chaque joueur voit son épilogue personnel (fin « Le Retour » : rester ou partir).

### Liste de contrôle — examens de rang et maîtrises d'équipement (test 2, changements 10 et 11)
- [ ] Dans n'importe quel comptoir de la Guilde, le panneau « 🎖 Rang de Guilde » montre le rang suivant, ce qu'il manque (points, niveau) et le bouton de l'examen quand tout est prêt.
- [ ] Rangs E, D et A : un combat contre un examinateur (A : Dame Rowena en personne). En cas d'échec, on retente le lendemain.
- [ ] Rangs C et B : une épreuve en plusieurs étapes (balises dorées), qui ne s'affiche pas au tableau des contrats.
- [ ] Rang S : donné par l'épreuve de l'Arène au chapitre 5.
- [ ] Dans le sac et les boutiques, un objet non maîtrisé par ta classe affiche un avertissement orange (malus), un objet interdit un message rouge.

## Publier sur Roblox (quand tout marche)

1. **Fichier → Publier sur Roblox**, si ce n'est pas déjà fait.
2. Sur le site Roblox (*Creator Dashboard*), ouvre ton expérience :
   - remplis le **questionnaire de maturité et de conformité** (*Maturity & Compliance*). Le jeu contient des combats fantastiques sans sang réaliste et aucune romance, mais réponds honnêtement à chaque question ;
   - laisse l'expérience **privée**, ou ouvre-la seulement à tes amis, tant que vous testez.
3. Relis les règles actuelles de Roblox (*Community Standards* et la page *Content Maturity* de la documentation Create) au moment de publier : elles changent régulièrement.

Une expérience qui n'a pas rempli le questionnaire n'est visible que par toi et ton équipe.

## Pour les développeurs (commandes depuis la racine du dépôt)

| Commande | Rôle |
|---|---|
| `npm run roblox:contenu` | Régénère `contenu.lua` après une modification de `content/` |
| `npm run roblox:moteur` | Retraduit le moteur en Luau après une modification de `src/moteur/` (nécessite `npm install` à la racine et dans `roblox/`) |
| `npm run roblox:verifier` | Vérifie que le moteur reste compatible Luau (aussi lancé par `npm test`) |
| `LUNE=chemin/vers/lune npm run roblox:parite [graine]` | Test de parité web / Roblox avec [Lune](https://github.com/lune-org/lune) (graines : chapitre, alpha, bravo, desordre, contrats, equipement) |
| `LUNE=… npx tsx scripts/roblox-parite-ia.ts` | Parité de l'IA maison (69 phrases + script) |
| `POINTS=0,3,6,… LUNE=… npm run roblox:parite` puis `lune run parite/interface.luau` (dans roblox/) | Appelle sous Lune toutes les fonctions du moteur utilisées par l'interface, sur des états réels |

### Règles d'écriture du moteur (pour qu'il reste identique en Luau)

En Luau, `0` et `""` sont « vrais », l'ordre des clés d'une table n'est pas garanti et il n'y a ni expressions régulières ni `JSON`. Dans `src/moteur/` :

- écrire des conditions explicites (`x > 0`, `x !== undefined`) ou utiliser `vrai(x)` ;
- utiliser `cles`, `valeurs`, `entrees`, `trier` et `copieProfonde` de `src/moteur/outils.ts` ;
- ne pas utiliser `Object.keys/values/entries`, `.sort`, `structuredClone`, `JSON`, les regex, ni `.filter(Boolean)`.

`npm run roblox:verifier` signale tout écart, et `npm test` échoue s'il en trouve.

### Retouches automatiques du code traduit

`roblox/outils/plugin-luau.cjs` et `roblox/outils/apres-compilation.cjs` corrigent ce que TypeScriptToLua ne gère pas pour Roblox :
- les opérations sur les bits passent par `bit32` ;
- les conditions `a ? b : c` sont mises entre parenthèses (sans elles, la suite du calcul était avalée) ;
- `debug.getinfo` n'est plus utilisé ;
- `_G.pcall` et les fonctions de ce type sont remplacés par les fonctions de base.

## Où en est le portage

- **R0 à R5 écrits** (13/11) : tout le chapitre 1 est jouable sur Roblox, à vérifier dans Studio avec les listes ci-dessus.
- **Équipement en 3D** et **grande passe graphique** (13/11) : listes de contrôle ci-dessus.
- Plus tard : vrais modèles 3D et animations (le groupe peut remplacer les blocs et les objets), images des portraits dans les dialogues, sons, chapitres 2 à 6 (ils arriveront en même temps sur le web et sur Roblox, grâce au moteur commun).
