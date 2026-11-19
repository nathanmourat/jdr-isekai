# Cinématiques — scripts plan par plan (18/11)

Ce document découpe les cinématiques en **plans de 8 secondes**, parce que c'est la durée d'un clip dans Google Flow. Chaque plan a son invite (en anglais, à coller telle quelle), sa traduction et les images de référence à joindre.

Rien de tout cela n'entre dans le jeu sans l'accord du groupe.

## 1. Outil choisi : Google Flow (gratuit)

| | Google Flow (offre gratuite) |
|---|---|
| Accès | Compte Google, navigateur Chrome ou Edge, `flow.google.com` |
| Quota | 50 crédits Flow par jour (Aide Google Flow, « Premiers pas ») |
| Filigrane visible | **Réglage officiel** « Filigrane visible » sous la photo de profil. Il est imposé seulement en Corée du Sud, en Inde et au Vietnam. |
| Marquage invisible | SynthID, toujours présent. On ne le retire jamais. |
| Droits | « Google ne revendiquera pas la propriété de ce contenu » (Aide Google Flow) ; les conditions d'utilisation de Google s'appliquent. |
| Personnages réguliers | « Ingredients to video » : on joint les images de référence (portraits, fiches, paysages). |
| Données | Prompts, importations et vidéos gardés par Google et utilisables pour améliorer ses modèles. On peut couper « Aider à améliorer Flow » dans le menu ⋮. |

**Autres pistes** (voir `docs/DROITS-IA.md`) :
- **Wan 2.2** : modèle libre sous licence Apache 2.0. Usage commercial permis, aucun filigrane. Il demande une carte graphique : 8 Go pour le petit modèle 5B, environ 16 à 24 Go pour le 14B. À essayer seulement si un membre du groupe a une carte NVIDIA récente.
- **Atlabs** : reste possible, mais il demande un compte, et ses crédits gratuits sont plus courts.

## 2. Bloc STYLE vidéo (à coller au début de chaque invite)

```
Original 2D anime film style for a fantasy JRPG cinematic. Clean dark lineart, soft cel shading, painted backgrounds with rich but slightly muted colors like a modern 16-bit JRPG palette. Main light from the upper left. Smooth, calm camera movement. No text, no subtitles, no logo, no watermark, no real-world religious symbol, no existing anime character.
```

> Style original de film d'animation 2D anime pour une cinématique de JRPG fantasy. Trait sombre et propre, ombrage « cel » doux, décors peints aux couleurs riches mais un peu adoucies, comme une palette de JRPG 16 bits moderne. Lumière principale en haut à gauche. Mouvements de caméra doux et calmes. Pas de texte, pas de sous-titres, pas de logo, pas de filigrane, pas de symbole religieux réel, pas de personnage d'anime existant.

**Règles**
- Les héros des joueurs ne sont pas fixés (race, classe et sexe au choix). Ils restent donc des **silhouettes à contre-jour, de dos ou au loin**. Seuls les PNJ fixes sont vus de face : Auréliath, Aveline, Vorthak, Séraphine, Bram.
- Pour un PNJ, on joint son `portrait-neutre.png` et sa fiche corps entier si elle existe.
- Pour un lieu, on joint le paysage de `portraits-sources/paysages/`.
- La musique et les voix ne viennent pas de Flow : on coupe le son généré (droits non clairs, voir `DROITS-IA.md` « Musique et sons »).
- Pour chaque plan gardé, noter dans `DROITS-IA.md` : la date, l'invite, le modèle et le nom du fichier. L'original se range dans `portraits-sources/cinematiques/`, jamais dans Git.

## 3. Cinématique 1 : « L'Appel » (ouverture, environ 48 s)

D'après la scène `ch1-appel` (`content/campagne/saison-1/chapitre-1/principale.yaml`). Elle se joue avant le premier dialogue.

| # | Plan | Références à joindre |
|---|---|---|
| 1 | Lysmont à l'aube, la caméra glisse vers le temple blanc | `lysmont-aube-v2.png` |
| 2 | Intérieur du Temple du Seuil : chants, vitraux, acolytes en cercle | — |
| 3 | Le cercle de lumière bleue s'embrase au sol | — |
| 4 | Silence ; des silhouettes se relèvent dans la lumière | — |
| 5 | Auréliath s'avance, bras ouverts, sourire trop parfait | portrait neutre d'Auréliath |
| 6 | Aveline, main sur le pommeau, regard méfiant | portrait neutre + fiche d'Aveline |

**Plan 1**
```
[STYLE] Wide establishing shot at dawn: a city of white stone towers with blue slate roofs rising in tiers around a castle on a small hill, a wide calm river with stone bridges, morning mist. The camera slowly glides forward toward a large white temple with a rose window standing on its own rise. Birds cross the golden sky. Peaceful, majestic mood.
```
> Plan large à l'aube : la ville de tours blanches, la rivière, la brume. La caméra glisse lentement vers le grand temple blanc à rosace. Des oiseaux traversent le ciel doré. Ambiance paisible et majestueuse.

**Plan 2**
```
[STYLE] Inside a vast white temple with tall pillars and a large rose window of blue and gold glass. Robed acolytes stand in a wide circle, singing with closed eyes, holding small lanterns. The camera slowly rises along the pillars toward the rose window, whose glass begins to tremble and glow.
```
> Intérieur d'un vaste temple blanc, grande rosace bleu et or. Des acolytes en robe chantent en cercle, les yeux fermés. La caméra monte lentement vers la rosace, dont le verre se met à vibrer et à briller.

**Plan 3**
```
[STYLE] Top-down then low-angle shot: engraved runes on the white stone floor ignite into a huge circle of bright blue light. Wind rushes outward, robes and lantern flames bend, blue sparks spiral upward. Intense but not violent.
```
> Vue du dessus puis contre-plongée : les runes gravées au sol s'embrasent en un immense cercle de lumière bleue. Un souffle part vers l'extérieur, robes et flammes se courbent, des étincelles bleues montent en spirale.

**Plan 4**
```
[STYLE] The blue light fades into soft dust floating in sunbeams. In the center of the circle, four or five adult figures slowly get up, seen from behind as dark silhouettes against the light, confused, one shielding their eyes. Their faces are never visible. Silence, slow motion.
```
> La lumière retombe en poussière dans les rayons du soleil. Au centre du cercle, quatre ou cinq adultes se relèvent lentement, vus de dos en silhouettes à contre-jour, hagards. On ne voit jamais leur visage. Silence, ralenti.

**Plan 5** (joindre le portrait d'Auréliath)
```
[STYLE] Using the attached portrait as the exact reference for his face and robes: Aureliath, an older man around 60 with a shaved head and a neat white beard, in white ceremonial robes with gold embroidery and a high collar, walks slowly toward the camera through the dust of light, arms opening in welcome. Medium shot, he smiles warmly, a smile that is a little too perfect. Behind him, the acolytes bow.
```
> Auréliath (portrait joint) s'avance lentement vers la caméra dans la poussière de lumière, bras qui s'ouvrent pour accueillir. Plan moyen, sourire chaleureux, un peu trop parfait. Derrière lui, les acolytes s'inclinent.

**Plan 6** (joindre le portrait et la fiche d'Aveline)
```
[STYLE] Using the attached images as the exact reference for her face, braid, armor and cape: Aveline, an adult woman knight in polished silver plate armor with blue and gold trim and a royal blue cape, steps forward from the edge of the light, one hand resting on the pommel of her sheathed sword. Slow push-in to a close-up of her grey-green eyes: steady, wary, studying the newcomers.
```
> Aveline (images jointes) s'avance depuis le bord de la lumière, une main sur le pommeau de son épée au fourreau. Lent rapprochement jusqu'au gros plan sur ses yeux gris-vert : fermes, méfiants, ils jaugent les nouveaux venus.

## 4. Cinématique 2 : « La Fête des Lanternes » (milieu du chapitre 1, environ 40 s)

D'après la scène des lanternes (`lanternes-faites`). Elle s'enchaîne avec le combat.

| # | Plan | Références |
|---|---|---|
| 1 | Des milliers de lanternes de papier montent au-dessus de Lysmont | `lysmont-aube-v2.png` (pour la ville) |
| 2 | La place en fête : danses, brochettes, musiciens ; au balcon, une jeune femme blonde fait un signe discret | portrait de Séraphine |
| 3 | Les lanternes virent au violet, une explosion de cendres au centre de la place | — |
| 4 | Des gobelins sortent des égouts, la foule fuit ; Aveline dégaine | portrait + fiche d'Aveline |
| 5 | Les flammes s'ouvrent : Vorthak s'avance, épée nimbée de feu violet | portrait de Vorthak (à faire) |

**Plan 1**
```
[STYLE] Night. Thousands of glowing paper lanterns rise slowly above a city of white stone towers and a castle, reflected in a wide river. Warm orange light, deep blue sky with stars. The camera tilts up with the lanterns. Gentle, nostalgic mood.
```
> Nuit. Des milliers de lanternes de papier montent lentement au-dessus de la ville blanche et du château, reflétées dans la rivière. La caméra suit leur montée. Ambiance douce et nostalgique.

**Plan 2** (joindre le portrait de Séraphine)
```
[STYLE] A festive town square at night, strings of lanterns, people dancing, a laughing tavern keeper handing out skewers, musicians with lutes. The camera rises toward a castle balcony where, using the attached portrait as the exact reference, a young blonde princess in an elegant high-collared gown gives a small discreet wave.
```
> Place en fête la nuit : guirlandes de lanternes, danses, un tavernier rieur distribue des brochettes, des musiciens jouent du luth. La caméra monte vers un balcon du château où la princesse (portrait joint) fait un petit signe discret.

**Plan 3**
```
[STYLE] The floating lanterns suddenly turn violet one after another. A scream. In the middle of the town square, an explosion of grey ash and violet sparks throws people back. Slow motion, embers falling like snow.
```
> Les lanternes virent au violet l'une après l'autre. Un cri. Au centre de la place, une explosion de cendres grises et d'étincelles violettes projette les gens en arrière. Ralenti, braises qui tombent comme de la neige.

**Plan 4** (joindre les images d'Aveline)
```
[STYLE] Small ash-grey goblins with glowing violet eyes pour out of sewer grates, led by hooded cultists. The crowd runs in panic. Using the attached images as the exact reference, Aveline, the knight captain, draws her sword and shouts an order, her blue cape snapping in the wind. Dynamic but not gory.
```
> De petits gobelins gris cendre aux yeux violets jaillissent des grilles d'égout, menés par des cultistes encapuchonnés. La foule fuit. Aveline (images jointes) dégaine et crie un ordre, cape au vent. Dynamique, sans gore.

**Plan 5** (joindre le portrait de Vorthak quand il sera fait)
```
[STYLE] A wall of violet flames parts. A tall armored demon in black plate armor walks out slowly, holding a longsword wreathed in violet fire, ash swirling around him. Low-angle shot, the camera slowly pushes in on his helmet as his eyes light up. Menacing, calm.
```
> Un mur de flammes violettes s'écarte. Un grand démon en armure noire sort lentement, une épée longue nimbée de feu violet à la main, des cendres tourbillonnent autour de lui. Contre-plongée, lent rapprochement sur son casque, ses yeux s'allument. Menaçant, calme.

## 5. Premier essai (18/11)

- **Plan 3 de « L'Appel » : réussi du premier coup.** Style anime net, temple blanc, acolytes en cercle, runes puis anneau de lumière bleue et étincelles. Aucun filigrane visible ; 8 s en 1280 × 720. Original : `portraits-sources/cinematiques/appel-plan3-essai1.mp4`.
- Coût : **Veo 3.1 Lite = 10 crédits par vidéo** (le réglage « x2 » en fait 2, soit 20 crédits). Avec 50 crédits par jour, on peut faire **5 vidéos par jour**. Les crédits reviennent chaque jour vers 23 h 13 (heure de La Réunion).
- **Plan 4, premier envoi : « Échec de la génération de l'audio »** sur les 2 vidéos. Flow a rendu les crédits en quelques minutes. Cause probable : le mot « Silence » dans l'invite. **Deuxième envoi réussi** : « Silence » retiré et `Ambient sound: soft wind and a distant choir fading out.` ajouté à la fin. Résultat : 2 versions.
  - Essai 1 : 4 jeunes adultes de dos, détaillés (cheveux, sweat rouge), éclairage chaud.
  - Essai 2 : 5 vraies silhouettes noires, l'une se protège les yeux, plus proche du script.
  - Fichiers : `portraits-sources/cinematiques/appel-plan4-essai{1,2}.mp4`.
- **Plan 1 (Lysmont à l'aube), sans image de référence** : belle ville blanche, rivière, brume, moulins, oiseaux. Mais le temple est collé au château au lieu d'être sur sa propre butte : la prochaine fois, joindre `lysmont-aube-v2.png` en « Ingrédient ». Fichier : `portraits-sources/cinematiques/appel-plan1-essai1.mp4`.
- **Montage d'essai** sans le son : plan 1 + plan 3 + plan 4 (essai 2), soit 24 s. Fichier : `portraits-sources/cinematiques/appel-montage-essai.mp4`.
- Bilan du 18/11 : 50 crédits = 5 vidéos réussies + 2 échecs remboursés.
- **Règle** : ne jamais écrire « silence » dans une invite Veo, toujours décrire un son d'ambiance.
- Dans Flow, les **images avec Nano Banana 2.1 coûtent 0 crédit** (offre gratuite) : une piste pour les fiches de référence et les décors, à ajouter au tableau des droits avant de s'en servir.
- Le téléchargement se fait par clic droit sur la vidéo, puis « Télécharger ». Le fichier arrive dans « Téléchargements » sous un nom en `.tmp` : il faut le renommer en `.mp4`.

## 6. Deuxième série (19/11, compte étudiant)

- Le compte a maintenant **200 crédits Flow par mois** (forfait étudiant « Plus », renouvelés le 19 de chaque mois), et non plus 50 par jour : on compte chaque vidéo (10 crédits avec Veo 3.1 Lite).
- Flow passe par un « agent » : on écrit la demande, il annonce le coût et attend « Approuver » (réglage « Confirmer avant de générer : Toujours », à garder).
- Images de référence (« Ingrédients ») : nos portraits du jeu (Auréliath, Aveline, Séraphine, Vorthak), importés après avoir confirmé « Droits d'utilisation de cette image » (accord de Sasha le 19/11). Les visages restent très fidèles.
- 9 plans demandés (90 crédits), 8 réussis :
  - **L'Appel** : plan 1 refait (temple enfin séparé du château), plan 2 (chants, la rosace s'embrase), plan 5 (Auréliath accueille), plan 6 (Aveline jauge ; vers 7 s un casque apparaît : couper avant). Montage complet de 47 s, sans son : `portraits-sources/cinematiques/appel-montage-v2.mp4`.
  - **Lanternes** : plan 1 (lanternes sur la ville), plan 2 (fête puis Séraphine au balcon), plan 4 (Aveline face aux gobelins), plan 5 (Vorthak sort des flammes). Montage de 32 s : `lanternes-montage-v1.mp4`.
  - **Plan 3 des Lanternes (explosion) : retiré par le filtre de Flow** (« La vidéo a été supprimée »), sans doute à cause des gens projetés par l'explosion. À réécrire sans victimes : lanternes qui virent au violet, puis un éclair violet et de la cendre qui tombe sur une foule qui recule.
- Défaut à surveiller : le temple du plan 1 ressemble à une église (clocher). Pour la version finale, préciser « round domed temple, no bell tower » ou joindre le paysage du groupe.

## 7. Ordre de travail conseillé

1. ~~Faire un seul plan d'essai~~ (fait le 18/11, voir § 5) : le groupe juge le style.
2. Si le groupe valide le rendu : finir les portraits manquants (Vorthak), puis la fiche corps entier de chaque PNJ qui apparaît.
3. Générer les plans un par un, avec 2 essais au plus par plan (50 crédits par jour).
4. Monter dans Shotcut ou Kdenlive : enchaîner les plans, couper le son de Flow, ajouter la musique du groupe et les textes du jeu.
