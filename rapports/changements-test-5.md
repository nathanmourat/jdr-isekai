# Mise à jour 5 (retours de test, version web, 16/11)

Les 8 points demandés, un commit par point, sur `claude/festive-mccarthy-ahagx5`.
Contrôles : `npm test` (245 tests, dont 12 nouveaux), `svelte-check`, `npm run roblox:verifier`, `npm run build`, et les tests navigateur `noms`, `captures-hd`, `captures-combat`, `captures-ecran`, `soins` et le nouveau `captures-boss`.
Captures : `rapports/captures-test-5/` (soins), `rapports/captures-boss/` (20 combats de boss), `rapports/captures-hd/calques/` (calques de race).

Les anciennes parties continuent de fonctionner : la sauvegarde passe au **format v10**, et ce qui a déjà été joué se rejoue à l'identique (y compris un changement de sexe déjà fait pendant le premier mois).

**À valider par le groupe avant de les garder** : l'image du Golem de la Fontaine (point 3) et le calque de l'héroïne naine à tresses (point 5).

---

## 1. Soins au Temple : animation plus réaliste
**Ce qui a changé** : la scène se joue maintenant sur le décor du Temple du Seuil, avec le vrai sprite du héros (et son calque de race) et celui de Sœur Elianne. Environ 10 secondes :
- 0 à 1,5 s : la lumière baisse, le héros se tient sur le cercle bleu ;
- 1,5 à 3,5 s : Elianne s'avance vers lui ;
- 3,5 à 5 s : ses mains s'illuminent ;
- 5 à 6,5 s : un rayon descend de la grande rosace jusqu'au héros ;
- 6,5 à 8 s : un halo l'enveloppe, de petites lueurs s'allument sur son corps (les blessures se referment), des particules dorées montent ;
- 8 s : léger flash, les PV remontent ;
- 8,5 à 10 s : la lumière revient, Elianne s'incline, puis la notification verte apparaît.

« Passer » est toujours là ; avec « réduire les animations » (téléphone ou ordinateur), une version fixe de 2 secondes.
**À vérifier**
- [ ] Au Temple, « Soins des prêtres » : la scène se déroule comme ci-dessus, puis « +X PV » apparaît.
- [ ] « Passer » ferme tout de suite.
- [ ] Sur téléphone, tout tient dans l'écran.

## 2. Nom coupé : « aya Lunecroc »
**La cause** : en combat, le nom et les barres sont centrés sous chaque personnage. Avec beaucoup de héros, celui du bout de la rangée est tout près du bord : le début de son nom sortait du cadre et la première lettre disparaissait. Sur téléphone, le zoom sur l'action rapproche encore le bord. L'ancien test ne regardait pas du tout les noms dessinés dans le combat, seulement ceux de la page, et seulement le débordement à droite.
**Ce qui a changé** : l'étiquette d'un personnage se décale un peu vers l'intérieur quand elle toucherait le bord ; le personnage, lui, ne bouge pas. Le test `noms` vérifie maintenant les 27 noms longs de compagnes et de PNJ (dont Kaya Lunecroc), lettre par lettre (la première et la dernière), dans le combat, le dialogue, la fiche, la fiche rapide, le tiroir Compagnons, les étiquettes et les bulles des lieux, sur téléphone (portrait et paysage) et sur ordinateur. Il ne trouve plus aucun nom coupé.
**À vérifier**
- [ ] Un combat à 4 joueurs ou plus, avec Kaya : son nom est entier, sur ordinateur et sur téléphone.

## 3. Nouveau Golem de la Fontaine
**Ce qu'il y avait** : le golem n'avait aucune image (il ne partageait pas celle du golem de pierre) : le jeu dessinait une silhouette violette provisoire.
**Ce qui a changé** : il a sa propre planche, `assets/ennemis/golem-fontaine/combat.png` (1024 × 512, mêmes cases et mêmes animations que les autres monstres), dessinée par `outils/textures/hd/golem_fontaine.py` : silhouette de pierre gris-vert voûtée, vasque de fontaine fendue sur le dos d'où l'eau déborde, mousse sur les épaules et les genoux, ruisseaux d'eau sur le corps, flaque aux pieds, yeux et runes cyan qui luisent. Les autres golems ne changent pas.
**À vérifier (et à valider)**
- [ ] Le dessin vous plaît (capture `rapports/captures-boss/crypte-golem.png`) ; sinon, dites ce qu'il faut changer.
- [ ] Dans la crypte, « La fontaine se fend… » : le golem apparaît avec ce nouveau dessin.

## 4. Le golem n'était pas à la hauteur de son nom
**La cause** : le jeu posait le bas de la *case* de l'image sur la ligne du nom, pas les pieds du dessin. La silhouette provisoire du golem avait du vide sous les pieds, agrandi trois fois pour un boss : il flottait au-dessus de son nom. Le marqueur « à vous » était aussi à une hauteur fixe, donc au milieu du corps d'un boss.
**Ce qui a changé** : le jeu mesure où sont vraiment les pieds de chaque dessin et les pose juste au-dessus du nom et des barres ; le marqueur « à vous » et les icônes d'état se placent au-dessus de la tête. Le nouveau test `captures-boss` affiche les 20 combats de boss (dont le golem), vérifie pieds, nom, sol (ligne des pieds) et marqueur, sur ordinateur et sur téléphone, et prend une capture par combat.
**À vérifier**
- [ ] Combat contre le golem : ses pieds touchent sa barre de vie et son nom.
- [ ] Un boss d'un autre chapitre (ex. le Gardien des Mille Marches) : pareil.

## 5. La barbe du nain ne suivait pas le personnage
**La cause** : les images étaient bonnes (la barbe tombe juste sur les 10 classes, image par image). C'était le combat : quand le héros attaquait, lançait un sort ou était touché, seul le corps jouait l'animation ; la barbe restait sur la pose « attente ». Les secousses, l'esquive, la chute au K.O. et le vert du poison ne touchaient aussi que le corps. Les oreilles, cornes et queues des autres races avaient le même problème. En exploration, le calque prenait aussi la couleur de peau de la race.
**Ce qui a changé** : en combat, le calque recopie à chaque instant l'image du corps et bouge avec lui ; il ne prend jamais la couleur de peau. Le test `captures-hd` vérifie les 10 classes avec un nain et avec une autre race, pendant l'attaque, le sort et le touché, et garde une capture par classe (`rapports/captures-hd/calques/`).
**Héroïne naine (proposition à confirmer)** : un calque sans barbe, avec deux tresses châtain roux (même couleur que la barbe) à perles de métal, une derrière l'oreille et une sur l'épaule. Le jeu l'utilise pour une héroïne naine dès que l'image est gardée.
**À vérifier**
- [ ] Un nain (n'importe quelle classe) en combat : la barbe suit l'attaque, le sort, le coup reçu et le K.O.
- [ ] Un elfe, un vulpin, un demi-démon : oreilles, queue et cornes suivent aussi.
- [ ] Le calque à tresses de l'héroïne naine vous convient (capture jointe au message).

## 6. Quêtes solo : choisir avec qui on les fait
**Ce qui a changé** : quand on lance une quête solo (quêtes de classe, de compagnes, d'Aveline, « Premiers pas au Comptoir » ; jamais une scène romantique, le prologue ni l'épilogue), une fenêtre demande « Avec qui partez-vous ? » : seul, avec tout le groupe présent, ou avec certains joueurs (cases à cocher). Un joueur occupé (combat, scène, donjon, autre invitation) ou absent est grisé, avec la raison.
- Les invités reçoivent une demande « Accepter / Refuser » (elle attend la fin de l'animation des soins s'ils sont au Temple).
- La quête commence quand tout le monde a répondu ; le lanceur peut « Commencer sans attendre » après 20 secondes, ou « Annuler ».
- **La quête reste celle du lanceur** : lui seul fait les choix ; l'avancée et la fin de la quête, les objets, l'affinité avec la compagne sont pour lui. Les invités gagnent l'XP, l'or gagné et le butin des combats (combats à plusieurs, difficulté de groupe). Ils peuvent faire la même quête pour eux-mêmes plus tard.
- Les textes s'accordent : « tu » seul, « vous » à plusieurs ; « prêt / prête » selon le lanceur.
- Tout passe par le journal d'actions : la partie se rejoue à l'identique chez chacun (testé).
**À vérifier**
- [ ] Une quête de classe « avec certains joueurs » : l'invité reçoit la demande, accepte, suit la scène sans pouvoir choisir.
- [ ] Un invité qui refuse : la quête commence avec les autres.
- [ ] Un joueur en combat est grisé « en combat » dans la liste.
- [ ] À la fin, l'invité a bien gagné XP et or, mais la quête n'est terminée que pour le lanceur.

## 7. Un joueur téléporté en plein combat
**La cause** : une scène de groupe prenait automatiquement tous les héros présents, sans regarder s'ils étaient occupés ; les combats et le donjon de la scène aussi ; et l'écran affichait le combat du groupe avant le combat personnel du joueur.
**Ce qui a changé** (règle : on n'interrompt jamais un joueur occupé) : la scène de groupe commence sans lui, et les autres voient « Kael est en combat, il vous rejoindra. ». Il reste dans son combat. Quand il est libre, un bandeau « Le groupe joue … — Rejoindre la scène » lui permet d'entrer à la réplique suivante (il gagne ce qui vient ensuite). Les votes et « Continuer » n'attendent que les joueurs de la scène ; si le meneur du jour est occupé, le premier joueur de la scène tranche et guide. Un test du moteur rejoue exactement le cas : deux héros, l'un en combat, l'autre lance une scène de groupe.
**À vérifier**
- [ ] Un joueur en combat de contrat ; un autre lance une quête de groupe : le premier reste dans son combat, les autres voient le message.
- [ ] Son combat fini, le bandeau « Rejoindre la scène » apparaît et fonctionne.

## 8. Le sexe du héros ne change plus
**Ce qui a changé** : le sexe se choisit à la création (« Ce choix est définitif »), puis ne change plus : plus de boutons dans la fiche, et le jeu refuse tout changement. Pour une ancienne partie dont le héros n'a jamais choisi, la question est posée une seule fois, avec « Ce choix est définitif ». Un changement déjà fait pendant le premier mois dans une partie en cours est gardé.
**À vérifier**
- [ ] La fiche « Personnage » n'a plus de boutons Homme / Femme.
- [ ] Une ancienne sauvegarde sans sexe : la question arrive une fois, puis plus jamais.

---

## Pour Roblox
Tout ce que la version Roblox doit reprendre est dans `roblox/README-ROBLOX.md`, section « À reprendre — mise à jour 5 » (format v10, règle des joueurs occupés, quêtes solo à plusieurs, sexe figé).
