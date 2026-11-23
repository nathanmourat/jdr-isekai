# Portraits de dialogue (style anime) — prompts pour le générateur d'images

Ce fichier sert au groupe pour générer les **portraits 512 × 512** avec un générateur d'images IA, tous dans le même style.
Il complète `docs/GRAPHISMES.md` (§ 2 et § 6) et `docs/LISTE-TEXTURES.md` (noms de fichiers).

> **Droits** : le jeu pourra être vendu. Outils autorisés, règles (aucun artiste ni œuvre dans les invites, preuves à garder, crédits) et registre des générations : [`DROITS-IA.md`](DROITS-IA.md). À lire avant toute nouvelle génération.

## 1. Chaîne de production

1. **Générer** l'image avec le bloc STYLE (§ 2), puis le bloc PERSONNAGE et l'expression (§ 4).
2. **Préparer pour le jeu** (fait par Claude) : détourage du fond, recadrage en 512 × 512, harmonisation des couleurs avec la palette du sprite, petite version pixel art.
3. **Animer en code** : respiration, clignement, cheveux, bouche qui parle, lueur et particules.
4. **Intégrer** : prompt pour Claude Code.

Générateur conseillé : un outil qui sait **modifier une image existante** (par exemple ChatGPT Images). Toujours le même outil pour tous les portraits. Noter l'outil dans `assets/CREDITS.md` et vérifier que ses conditions autorisent l'usage dans un jeu.

## 2. Bloc STYLE (à coller mot pour mot, jamais modifié)

```
Original character, anime-style illustration for a fantasy JRPG. Bust portrait: head and shoulders, cut at mid-chest, no hands visible. Three-quarter view, body turned slightly toward the viewer's right, eyes looking at the viewer. Character centered, face in the upper half of the image, small empty margin above the hair, nothing cut off at the top. Clean dark lineart, soft two-tone cel shading, subtle rim light. Soft key light from the upper left. Rich but slightly muted colors, like a modern 16-bit JRPG palette. Plain flat solid medium-gray background, uniform, no gradient, no cast shadow, no scenery, no text, no frame. Square image, 1:1.
```

> Traduction : personnage original, illustration de style anime pour un JRPG fantasy. Portrait en buste : tête et épaules, coupé à mi-poitrine, sans mains visibles. Vue de trois quarts, corps légèrement tourné vers la droite de l'image, regard vers le spectateur. Personnage centré, visage dans la moitié haute, petite marge vide au-dessus des cheveux, rien de coupé en haut. Trait sombre et propre, ombrage « cel » doux en deux tons, léger liseré de lumière. Lumière principale douce venant du haut à gauche. Couleurs riches mais un peu adoucies, comme la palette d'un JRPG 16 bits moderne. Fond gris moyen uni et plat, sans dégradé, sans ombre portée, sans décor, sans texte, sans cadre. Image carrée, 1:1.

**À éviter** (champ « negative prompt » si l'outil en a un) :

```
photorealistic, 3D render, painterly, sketch, blurry, gradient background, scenery, hands, extra fingers, text, watermark, signature, logo, frame, chibi, childlike proportions, revealing outfit, cleavage, existing anime character
```

Choix du style :
- **Fond gris uni** : pas de reflets colorés sur les armures et les cheveux clairs. Exception : **demi-démon** (peau gris-violet), remplacer par `Plain flat solid green background`.
- **Lumière en haut à gauche** : règle de tout le jeu (`GRAPHISMES.md` § 1).
- **Tourné vers la droite** : dans `Dialogue.svelte`, le portrait est affiché à gauche du texte. Décision du 15/11 (`GRAPHISMES.md` § 6 mis à jour).
- **Visage dans la moitié haute** : le portrait est affiché entre 72 et 140 px dans les dialogues.

## 3. Méthode pour garder le même visage

1. Générer seulement l'expression `neutre`, plusieurs fois, et garder la meilleure.
2. Pour toutes les autres images, **modifier le neutre** au lieu de recommencer :
   ```
   Keep exactly the same character, framing, outfit, lighting and background. Change only the facial expression: <expression>
   ```
   > Garde exactement le même personnage, le même cadrage, la même tenue, la même lumière et le même fond. Change seulement l'expression : …
3. Images en plus pour l'animation (tous les personnages) :
   - `neutre-yeux-fermes` : `Same image, eyes gently closed, nothing else changed.`
   - `neutre-bouche-ouverte` : `Same image, mouth slightly open as if speaking, nothing else changed.`
4. Envoyer les PNG à la taille d'origine (1024 px ou plus, pas de JPEG), nommés `<id>-<expression>.png`.

**Vérifications** : mêmes détails du même côté sur toutes les images (tresse, cicatrice…), personnage clairement adulte, rien de suggestif, aucun texte ni logo, fond bien uni.

## 4. Fiches des personnages

### Expressions (communes à tous)

| Fichier | Anglais | Français |
|---|---|---|
| `neutre` | `Neutral expression: serious and calm, mouth closed, looking straight at the viewer.` | Sérieux et calme, bouche fermée, regard droit. |
| `joie` | `Happy expression: an honest, slightly awkward wide smile, eyes a little squinted.` | Sourire franc, un peu maladroit, yeux légèrement plissés. |
| `colere` | `Angry expression: furrowed brows, clenched jaw, intense glare.` | Sourcils froncés, mâchoire serrée, regard dur. |
| `tristesse` | `Sad expression: eyes lowered, slightly teary, lips pressed together.` | Regard baissé, yeux un peu humides, lèvres serrées. |
| `gene` | `Embarrassed expression: light blush on the cheeks, glancing away to the side, small awkward smile.` | Léger rougissement, regard détourné, petit sourire gêné. |
| `surprise` | `Surprised expression: wide eyes, eyebrows raised, mouth slightly open.` | Yeux écarquillés, sourcils levés, bouche entrouverte. |

Les formulations peuvent être ajustées au caractère du personnage (exemple : `joie` « un peu maladroit » est propre à Aveline).

### 4.1 Aveline — `aveline` (compagne)

- **Fichiers** : `assets/personnages/compagnes/aveline/portrait-<expression>.png` (6 expressions, `LISTE-TEXTURES.md` n° 31 à 36).
- **Qui** : Aveline de Castelroc, 24 ans, capitaine de la garde royale. Droite, sérieuse, très maladroite dès qu'on parle de sentiments.
- **Couleurs de référence** (relevées sur `decor.png`, pour l'harmonisation) : armure `#c9d3e0` (ombre `#737b8c`), bleu royal `#2d499b` (ombre `#233979`), or `#eac054` (ombre `#ba9330`), cheveux `#ba6931` (reflets `#c37d4c`), peau `#f2caa2`.

```
Aveline, an adult woman aged 24, a knight and captain of the royal guard. Mature adult face. Copper-chestnut hair tied in a short braid resting on her right shoulder (left side of the image), a few loose strands framing her face. Grey-green eyes, straight steady gaze, defined eyebrows, a small pale scar on the right side of her chin. Light warm skin. Polished silver plate armor with blue and gold trim, rounded pauldrons and a gorget, a royal blue cape fastened at the shoulders with a gold clasp. Dignified, disciplined bearing.
```

> Aveline, femme adulte de 24 ans, chevalière et capitaine de la garde royale. Visage d'adulte. Cheveux châtain cuivré attachés en une tresse courte posée sur son épaule droite (à gauche de l'image), quelques mèches libres autour du visage. Yeux gris-vert, regard droit et ferme, sourcils marqués, petite cicatrice pâle du côté droit du menton. Peau claire et chaude. Armure de plates argentée et polie, liserés bleus et or, épaulières arrondies et gorgerin, cape bleu royal attachée aux épaules par une agrafe dorée. Allure digne et disciplinée.

Retouche validée le 15/11 : tresse courte, **emblème du soleil levant** (or) à la place des fleurs de lys sur les agrafes et le plastron.

### 4.2 Portraits par défaut des races

- **Fichiers** : `assets/personnages/races/<race>/portrait-defaut.png` (héros) et `portrait-defaut-f.png` (héroïne). `LISTE-TEXTURES.md` n° 88 à 95 et section « sexe du héros ».
- **Une seule image par portrait** (pas d'expressions) : expression **déterminée**, tenue d'aventurier neutre, **sans marque de classe** (pas d'arme, pas de symbole), pour convenir aux 10 classes.
- **Ne pas ressembler aux compagnes** : l'héroïne Ourvalis ne doit pas ressembler à Kaya, la demi-démone à Morra, la sang-dragon à Ysoria, l'elfe à Ilyssë (couleurs de cheveux différentes ci-dessous).
- Les détails de race suivent les calques des sprites (`GRAPHISMES.md` § 4) : oreilles, cornes, écailles visibles, **tête dégagée** (pas de capuche sur la tête).

**Expression commune** (à la place des expressions du § 4) :

```
Determined expression: confident, focused gaze at the viewer, a faint resolute smile.
```

> Expression déterminée : regard assuré et concentré vers le spectateur, léger sourire résolu.

**Tenue commune** (à ajouter à chaque fiche) :

```
Neutral adventurer's travel outfit with no class insignia and no weapon visible: layered linen shirt, leather jerkin or light coat, travel cloak fastened at the collar, hood down.
```

> Tenue d'aventurier de voyage neutre, sans insigne de classe ni arme visible : chemise de lin superposée, pourpoint de cuir ou manteau léger, cape de voyage attachée au col, capuche baissée.

| Race | Héros (`portrait-defaut`) | Héroïne (`portrait-defaut-f`) |
|---|---|---|
| `humain` | `An adult human man around 27, short dark brown hair, light stubble, brown eyes, tanned skin, a few freckles. Earthy brown and moss-green clothes.` | `An adult human woman around 26, shoulder-length chestnut hair tied back loosely, hazel eyes, light olive skin. Earthy brown and moss-green clothes.` |
| `elfe` | `An adult elf man (looks about 28), long pointed elven ears, fine features, long straight silver-blond hair, pale blue eyes, fair skin. Green and silver clothes with leaf embroidery.` | `An adult elf woman (looks about 26), long pointed elven ears, fine features, long platinum-blond hair with a thin side braid, pale blue eyes, fair skin, no glasses. Green and silver clothes with leaf embroidery.` |
| `demi-elfe` | `An adult half-elf man around 26, slightly pointed ears (shorter than an elf's), mixed human and elven features, wavy auburn hair, green eyes. Practical travel clothes in teal and brown.` | `An adult half-elf woman around 25, slightly pointed ears (shorter than an elf's), mixed human and elven features, wavy dark-blond hair, green eyes. Practical travel clothes in teal and brown.` |
| `nain` | `An adult dwarf man around 40, broad stocky build, thick chestnut-red beard braided and adorned with small iron rings, bushy eyebrows, grey eyes, ruddy skin. Sturdy leather apron over a travel coat, forge-orange and slate-grey colors.` | `An adult dwarf woman around 35, broad sturdy build, thick chestnut-red hair in two heavy braids adorned with small iron rings, freckles, grey eyes, ruddy skin. Sturdy leather apron over a travel coat, forge-orange and slate-grey colors.` |
| `ourvalis` | `An adult Ourvalis man (wolf-folk) around 28, silver-grey wolf ears on top of the head, short shaggy grey hair, yellow eyes, discreet white tribal paint lines on the cheekbones, tanned skin. Nomad leather and sand-colored cloth.` | `An adult Ourvalis woman (wolf-folk) around 27, dark charcoal-grey wolf ears on top of the head, dark grey hair in a high ponytail, yellow eyes, discreet white tribal paint lines on the cheekbones, tanned skin, no headband. Nomad leather and sand-colored cloth.` |
| `vulpin` | `An adult Vulpin man (fox-folk) around 27, red fox ears with white tips on top of the head, tousled ginger hair, amber eyes, sly smile. Nomadic merchant's clothes: patterned scarf, many small pouches, ochre and turquoise colors.` | `An adult Vulpin woman (fox-folk) around 26, red fox ears with white tips on top of the head, ginger hair in a loose bun with strands falling, amber eyes, sly smile. Nomadic merchant's clothes: patterned scarf, many small pouches, ochre and turquoise colors.` |
| `demi-demon` | `An adult half-demon man around 28, grey-violet skin, small curved black horns, dark red eyes, messy black hair. Dark hooded cloak with the hood down (horns visible), charcoal and deep purple colors.` | `An adult half-demon woman around 27, grey-violet skin, small curved black horns, dark red eyes, short ash-white bob haircut. Dark hooded cloak with the hood down (horns visible), charcoal and deep purple colors.` |
| `sang-dragon` | `An adult dragon-blooded man around 29, two small backswept horns, small red scales on the cheekbones and the side of the neck, golden eyes with slit pupils, short black hair. Archipelago sailor's outfit: open-collar shirt, sash, weathered navy coat.` | `An adult dragon-blooded woman around 27, two small backswept horns, small red scales on the cheekbones and the side of the neck, golden eyes with slit pupils, dark teal hair in a short braid. Archipelago sailor's outfit: open-collar shirt, sash, weathered navy coat.` |

**Demi-démon** : remplacer le fond par `Plain flat solid green background` (§ 2).

**Ordre d'un prompt de race** : bloc STYLE (§ 2) + fiche de la race (tableau) + tenue commune + expression commune.

Traductions (pour vérifier) :
- **Humain** : homme d'environ 27 ans, cheveux bruns courts, barbe de quelques jours, yeux marron, peau hâlée, quelques taches de rousseur / femme d'environ 26 ans, cheveux châtains mi-longs attachés lâchement, yeux noisette, peau olive claire. Vêtements brun terre et vert mousse.
- **Elfe** : longues oreilles pointues, traits fins, longs cheveux blond argenté (lui) ou blond platine avec une fine tresse (elle, sans lunettes), yeux bleu pâle, peau claire. Vert et argent, broderies de feuilles.
- **Demi-elfe** : oreilles légèrement pointues, traits mêlés humain et elfe, cheveux ondulés auburn (lui) ou blond foncé (elle), yeux verts. Sarcelle et brun.
- **Nain** : carrure trapue, barbe châtain roux tressée ornée d'anneaux de fer (lui) ; deux grosses tresses châtain roux ornées d'anneaux, taches de rousseur (elle). Tablier de cuir sur manteau de voyage, orange forge et gris ardoise.
- **Ourvalis** : oreilles de loup gris argent (lui) ou gris anthracite (elle), cheveux gris courts en bataille (lui) ou en queue haute (elle, sans bandeau : ne pas ressembler à Kaya), yeux jaunes, fines peintures tribales blanches. Cuir nomade et tissu couleur sable.
- **Vulpin** : oreilles de renard roux à pointe blanche, cheveux roux, yeux ambre, sourire malicieux. Tenue de marchand nomade, foulard à motifs, bourses, ocre et turquoise.
- **Demi-démon** : peau gris-violet, petites cornes noires recourbées, yeux rouge sombre, cheveux noirs en bataille (lui) ou carré court blanc cendré (elle : ne pas ressembler à Morra). Cape à capuche baissée, anthracite et violet profond.
- **Sang-dragon** : deux petites cornes vers l'arrière, petites écailles rouges sur les pommettes et le cou, yeux dorés à pupille fendue, cheveux noirs courts (lui) ou tresse courte sarcelle foncé (elle : ne pas ressembler à Ysoria). Tenue de marin de l'Archipel.

### 4.3 Autres compagnes et PNJ importants

#### Auréliath — `aureliath` (PNJ, Grand Prieur)

- **Fichiers** : `assets/personnages/pnj/aureliath/portrait-<expression>.png` (à préparer) ; original `portraits-sources/aureliath/aureliath-neutre.png` (**neutre fait le 18/11**). **Expressions faites avec Gemini le 18/11** à partir de ce neutre (`portraits-sources/aureliath/aureliath-<expression>.png`, préparés dans `prepares-gemini/`, neutre ramené à 1024 px, bouche 567, 394). Démonstration : artefact « Portrait animé — Auréliath (essai Gemini) ». Colère = « le masque bienveillant tombe ».
- **Qui** : Grand Prieur de l'Ordre de la Lumière Sereine (`content/monde/pnj.yaml` : « Crâne rasé, barbe blanche, sourire bienveillant un peu trop parfait »). Sert aussi à la cinématique « L'Appel ».

```
Aureliath, the Grand Prior of the Order of Serene Light, an older man around 60. Shaved head, neat white beard, pale blue-grey eyes, light warm skin with fine wrinkles. White ceremonial robes with gold embroidery and a high stiff collar, a simple gold pendant shaped like a circle of light on his chest. Dignified and serene. Neutral expression: calm and benevolent, a faint polite smile that feels a little too perfect, looking straight at the viewer.
```

> Homme d'environ 60 ans, crâne rasé, barbe blanche soignée, yeux gris-bleu, robe de cérémonie blanche brodée d'or à col haut, pendentif doré en forme de cercle de lumière. Expression : calme et bienveillant, petit sourire poli un peu trop parfait. Ajouter « any real-world religious symbol » à la liste à éviter.


#### Kaya Lunecroc — `kaya` (future compagne, aventurière ourvalis)

- **Fichiers** : `assets/personnages/pnj/kaya/portrait-<expression>.png` (à intégrer après validation) ; originaux `portraits-sources/kaya/` ; préparés `portraits-sources/kaya/prepares/` (6 portraits 512, calques d'animation, bouche 585, 515). **Fait avec Gemini le 18/11** (essai). Démonstration : artefact « Portrait animé — Kaya (essai Gemini) ».

```
Character: Kaya Lunecroc, an adult woman of 25 from the Ourvalis, a wolf-folk people. Wolf ears with silver-grey fur on top of her head, messy shoulder-length silver hair, golden-yellow eyes, athletic build. Worn brown leather adventurer armor with a fur-trimmed collar, a red cloth headband tied around her forehead. Clearly an adult woman.
```

Expressions : ajouter « showing two small wolf fangs » à la joie et à la colère ; « wolf ears drooping a little » à la tristesse ; « wolf ears perked up » à la surprise.

**Méthode Gemini** : 1) générer le neutre (bloc STYLE + personnage + « Avoid: … ») ; 2) l'ajouter au Drive puis « + → Ajouter depuis Drive » dans une nouvelle discussion ; 3) une demande par expression : « Edit the first image I sent (the neutral one). Keep exactly the same character, framing, outfit, lighting and background, same size and position. Change only the facial expression: … ». Toujours repartir du neutre, pas de la dernière image. Gemini donne du 1024 × 1024 ; pour le détourage, passer la boîte du neutre aux autres expressions (`preparer_portrait.py <source> <sortie> 0,0,1024,1024`) pour garder exactement le même cadrage.

**Séraphine et Elianne (18/11, Gemini)** : 6 expressions + yeux fermés chacune, préparées et ajoutées à la branche `textures-portraits-2` (`compagnes/seraphine/`, `compagnes/elianne/`). Leçons : Gemini dessine souvent un buste « flottant » et ouvre les cols ; écrire « close bust portrait, the shoulders and chest are cut by the bottom edge », « fully closed with a high collar, no opening » et, dans « Avoid », « floating bust with empty space below, neckline opening, cutout ». Si le buste flotte quand même : `preparer_portrait.py <source> <sortie> bas` (le cadre s'arrête au bas du buste), puis recadrer les sources avec la même boîte avant `preparer_animation.py` (il suppose que la source entière = le portrait). Ne jamais cliquer sur une image dans Gemini (ça ouvre l'éditeur et bloque la discussion) ; si les réponses deviennent vides, vérifier `gemini.google.com/usage` (limite à 100 %) ou ouvrir une nouvelle discussion.

#### Rowena, Edmund IV, Vorthak (PNJ, 18 et 19/11, Gemini)

- **Rowena** (`rowena`, maîtresse de la Guilde) : neutre, joie, colère, surprise, yeux fermés (`portraits-sources/rowena/`). La première discussion ne renvoyait plus d'image ; colère, surprise et yeux fermés faits le 19/11 dans une nouvelle discussion, avec le neutre importé depuis Drive (dans Gmail, « Ajouter à Drive » ne marche que si la fenêtre est assez large). Boîte (0, 31, 993, 1024), bouche (588, 480).
- **Edmund IV** (`edmund-iv`) : neutre, colère, tristesse, yeux fermés (`portraits-sources/edmund-iv/`). Boîte (0, 27, 997, 1024), bouche (594, 461) dans l'image recadrée.
- **Vorthak** (`vorthak`) : neutre, colère, joie cruelle, yeux fermés (`portraits-sources/vorthak/`). Recadrage `bas` (buste flottant), boîte (46, 0, 1012, 966), bouche (401, 456).

```
Edmund IV, the king of Aubeclaire, an adult man around 55. Heavy gold crown with blue gems and sun-rise motifs (no cross), short grey beard and grey hair, deep lines on his face, tired but hard grey eyes. Royal blue mantle with a white ermine collar over a dark tunic with gold trim, a gold chain with a rising-sun medallion. Neutral expression: weary, stern, dignified, looking straight at the viewer.
```

```
Vorthak, the Emissary of the Ashes, an adult male demon who looks around 35. Angular ash-grey face with sharp cheekbones, two curved black horns sweeping back from his temples, long straight black hair, glowing violet eyes. Black plate armor with jagged edges and a high gorget, thin wisps of violet flame rising from the shoulder plates, faint ember particles. Neutral expression: calm, arrogant, a faint cruel half-smile, looking straight at the viewer.
```

> Edmund IV : roi d'environ 55 ans, couronne d'or lourde (soleils levants, pas de croix), barbe grise courte, yeux gris fatigués et durs, manteau bleu royal à col d'hermine, médaillon au soleil levant. Vorthak : démon adulte d'environ 35 ans, visage gris cendre anguleux, cornes noires recourbées, longs cheveux noirs, yeux violets lumineux, armure noire dentelée, flammes violettes aux épaules. Ajouter à la liste « à éviter » : `gore, blood, any real-world religious symbol (no cross)`.

**Outil modifié** : dans `preparer_animation.py`, la zone des yeux suit maintenant la bouche (le visage de Vorthak est à gauche de l'image) ; les calques `yeux.png` sont ensuite coupés par la silhouette du portrait (sinon une tache grise apparaît près des cheveux d'Edmund pendant le clignement).

#### Nadja et Ilyssë (compagnes, 19/11, Gemini)

- **Nadja** (`nadja`) : 6 expressions + yeux fermés (`portraits-sources/nadja/`). Boîte (16, 49, 991, 1024), bouche (568, 416). Lueur ocre.
- **Ilyssë** (`ilysse`) : 6 expressions + yeux fermés (`portraits-sources/ilysse/`). Boîte (5, 50, 979, 1024), bouche (578, 466). Lueur violette + magie. Ses lunettes restent sur le calque des yeux fermés.

```
Nadja Kesh, an adult woman of 27, a shrewd caravan broker from the desert. Warm tan skin, wavy black hair tied back with a few loose strands, green eyes lined with dark kohl, a sly half-smile. A fully closed high-collared turquoise silk tunic with ochre trim and a light ochre scarf over the shoulders, several thin gold bracelets and small gold earrings, a small abacus charm on a cord. Neutral expression: confident, amused, appraising the viewer.
```

```
Ilyssë, an adult elf woman who looks about 25, a scholarly mage. Long straight sea-green hair falling over the shoulders, long pointed elf ears, violet eyes behind thin round gold-rimmed glasses, calm intelligent face. A fully closed high-collared midnight-blue mage robe embroidered with small silver runes along the collar and shoulders, a thin silver chain clasp. Neutral expression: calm, attentive, a faint polite smile.
```

> Nadja : femme de 27 ans, courtière des caravanes du désert, peau hâlée, cheveux noirs ondulés, yeux verts au khôl, tunique de soie turquoise et ocre, bracelets d'or, petit boulier. Ilyssë : elfe adulte (environ 25 ans en apparence), cheveux vert d'eau, yeux violets, lunettes rondes, robe de mage bleu nuit brodée de runes. Astuce : si l'image du site n'est pas un « blob », la télécharger par « Télécharger l'image en taille réelle » (2048 × 2048) puis la réduire à 1024.

#### Ysoria et Morra (compagnes, 23/11, Gemini)

- **Ysoria** (`ysoria`) : 6 expressions + yeux fermés (`portraits-sources/ysoria/`). Boîte (0, 30, 994, 1024), bouche (590, 497). Lueur orangée + braises.
- **Morra** (`morra`) : 6 expressions + yeux fermés (`portraits-sources/morra/`). Boîte (0, 0, 1024, 1024), bouche (582, 452). Lueur rouge sombre + ombre. Son neutre sourit en montrant les dents : `ouverte: true` pour « neutre » dans `anim.json`. Première version refusée (`morra-v1-neutre-rejete.png`) : cuirasse moulante ; refaite avec une cuirasse plate de mercenaire.

```
Ysoria, an ancient dragon in human form, appearing as a regal adult woman of about 30. Long flowing ember-red hair, golden eyes with vertical slit pupils, a few small red scales on the upper cheekbones, two small swept-back dark horns rising from the hair. A fully closed high-collared ancient gown of deep purple with gold embroidery and a gold collar ornament, small gold earrings. Neutral expression: serene, majestic, slightly amused, ageless wisdom in the gaze.
```

```
Morra, an adult demon mercenary woman who looks about 28. Pale grey-lilac skin, long black hair with crimson-red tips, two curved black horns rising from the head, red eyes, a sharp mocking half-smile. Practical light armor: a dark padded gambeson with a high closed collar under a plain flat black leather cuirass and layered black steel pauldrons with dark red trim, a torn dark crimson cloak over the shoulders. Neutral expression: sardonic, confident, amused, looking straight at the viewer.
```

> Ysoria : dragonne sous forme humaine (environ 30 ans en apparence), cheveux rouge braise, yeux dorés à pupilles fendues, petites écailles, petites cornes, robe ancienne violet et or. Morra : démone mercenaire (environ 28 ans), peau gris lilas, cheveux noirs aux pointes rouges, cornes noires, yeux rouges, cuirasse plate et cape déchirée. Pour une armure de femme, ajouter « sculpted or shaped breastplate, form-fitting » à la liste « à éviter ».

**Les 8 compagnes ont maintenant leur portrait animé.**

#### PNJ du 23/11 (Gemini, neutre + yeux fermés)

Leurs répliques n'utilisent que « neutre » (sauf Vaelor : une colère), donc 2 images par PNJ suffisent. Même bloc STYLE ; dans « Avoid » : `revealing or form-fitting clothing, gore, blood`. Originaux dans `portraits-sources/pnj/<id>/`.

| PNJ | Boîte | Bouche | Effets | Notes |
|---|---|---|---|---|
| `orlan` | (14, 44, 994, 1024) | (545, 430) | — | sourire de vendeur, bouche ouverte (`ouverte: true` sur le neutre) |
| `orvan` | (0, 0, 1024, 1024) | (565, 493) | lueur rouge + braises | couronne de flammes noires |
| `reine-seve` | (0, 39, 985, 1024) | (600, 465) | lueur verte + lucioles | cheveux comme des racines blanches |
| `bardrek` | (19, 66, 977, 1024) | (565, 418) | lueur orange + braises | bouche cachée par la barbe |
| `vaelor` | (0, 2, 1022, 1024) | (612, 508) | — | neutre + colère |
| `valka` | (0, 26, 998, 1024) | (605, 533) | — | Ourvalis, oreilles déchirées |
| `mere-brisac` | (0, 0, 1024, 1024) | (462, 388) | — | la louche ressemble un peu à une houe |
| `marechale` | (0, 34, 990, 1024) | (600, 482) | — | tabard au soleil levant |
| `brann` | (21, 40, 1005, 1024) | (515, 425) | — | perroquet sur l'épaule |
| `aldric` | (23, 85, 962, 1024) | (565, 350) | lueur violette + ombre | prince corrompu |
| `ashka` | (14, 59, 979, 1024) | (575, 430) | — | buste « flottant » (bas arrondi) |
| `bram` | (33, 82, 975, 1024) | (530, 325) | — | |
| `faelis` | (0, 20, 1004, 1024) | (590, 430) | lucioles | neutre + surprise |
| `grumli` | (59, 99, 984, 1024) | (390, 345) | — | grand sourire : `ouverte: true` sur le neutre |
| `halvine` | (0, 27, 997, 1024) | (570, 420) | — | buste « flottant » |
| `ouzram` | (36, 46, 1014, 1024) | (400, 410) | — | buste « flottant » |
| `sorha` | (0, 0, 1024, 1024) | (580, 520) | — | neutre + joie, œil gauche aveugle |
| `ziyane` | (0, 33, 991, 1024) | (570, 445) | — | sourire ouvert : `ouverte: true` ; buste « flottant » |

Deuxième série faite à 14 h. **Durna** : neutre fait, yeux fermés en attente (fenêtre « Enregistrer sous »). Plusieurs bustes de la 2e série ont un bas arrondi malgré la consigne : à refaire si le groupe trouve que ça se voit trop dans les dialogues.

Astuce : un téléchargement lancé sans clic récent ouvre parfois une fenêtre « Enregistrer sous » dans l'app Claude (impossible à cliquer pour Claude) : toujours cliquer dans la zone de saisie juste avant `sauverIdx`.

## 5. Animation des portraits (15/11, version « réaliste »)

Démonstration : artefact « Portrait animé — Aveline » (lien donné au groupe dans la conversation).

**Fichiers par personnage** (exemple d'Aveline) :
- `assets/personnages/compagnes/aveline/portrait-<expression>.png` : portrait 512 × 512, fond transparent ;
- `assets/personnages/compagnes/aveline/anim/<expression>/` :
  - `yeux.png` : yeux fermés, seulement la zone des yeux (alpha = masque adouci) → clignement ;
  - `carte.png` : rouge = cheveux (0 près du crâne, fort vers les pointes et la tresse), vert = respiration (épaules et buste), bleu = tête (1 au-dessus du cou, la tresse suit à 60 %) ;
- `anim/anim.json` : par expression, centre de la bouche, largeur, `ouverte` (bouche déjà ouverte sur l'image : joie, surprise) et pivot du cou.

**Ce que fait le module** (`outils/portraits/portrait-anime.js`, classe `PortraitAnime`, WebGL 1, sans dépendance) :
- **tête** jamais tout à fait immobile : balancement lent (moins de 0,5° et 1 px), changement de posture toutes les 5 à 12 s, petit hochement sur certaines voyelles accentuées ;
- **cheveux** : vague qui descend vers les pointes, souffle d'air irrégulier, inertie (ils suivent la tête avec retard) ;
- **respiration** irrégulière (inspiration 38 %, expiration 45 %, pause), cycle de 4 à 5,2 s, plus courte pendant la parole ; épaules qui montent ;
- **clignement** au rythme humain : fermeture 75 ms, fermé 45 ms, ouverture 140 ms ; toutes les 2,4 à 5,6 s (parfois double, parfois en fin de phrase) ;
- **changement d'expression pendant un clignement**, avec un fondu de 120 ms ;
- **bouche** dessinée par le code : la mâchoire s'abaisse et l'intérieur de la bouche (avec les dents du haut) apparaît selon la lettre prononcée (`prononcer(lettre)` : voyelles ouvertes, m/b/p fermées), avec un lissage naturel. Plus besoin d'image « bouche ouverte » ;
- **lueur** douce et **particules** en deux plans (derrière et devant le personnage, avec parallaxe) : `lucioles`, `braises`, `magie`, `neige`, `ombre` ;
- `prefers-reduced-motion` : clignement et parole seulement. Sans WebGL : portrait fixe.

**Scripts** (`outils/portraits/`, Python + OpenCV + rembg) :
- `preparer_portrait.py <source> <sortie>` : détourage (modèle `isnet-anime`) et 512 × 512 ;
- `preparer_animation.py <sources> <portraits 512> <sortie> <id> <bouche_x> <bouche_y>` : recale chaque expression sur le neutre (ECC affine) et fabrique `yeux.png`, `carte.png` et `anim.json` ;
- `aligner.py` : recalage seul, pour vérifier ;
- `anim_sans_yeux.py <source> <portrait 512> <sortie>/<expression> <bouche_x> <bouche_y> <largeur> [barbe]` : calques pour un portrait qui n'a pas encore d'image « yeux fermés » (`yeux.png` vide, donc pas de clignement ; option `barbe` : la barbe claire ondule et suit la tête). Utilisé pour Auréliath le 18/11 (bouche 695, 482, largeur 0,09).

Les originaux IA (1254 × 1254) restent sur le PC du graphiste dans `portraits-sources/` (ignoré par Git).

## 6. Fiches de référence et paysages (18/11)

Principe : **les images d'abord, la vidéo ensuite.** Les fiches de référence et les paysages servent dans le jeu **et** comme références pour les cinématiques (Atlabs), pour que la vidéo ressemble au jeu. On n'extrait pas d'images des vidéos (compressées, floues, sans transparence).

### 6.1 Fiche de référence d'un personnage (corps entier)

Sert de référence aux cinématiques et aux futurs sprites. Dans ChatGPT : **joindre le portrait neutre approuvé** (`portrait-neutre.png`) au message, puis :

```
Using the attached portrait as the exact reference for the face, hair, eyes, scar, armor, colors and art style, create an original character reference sheet of the same adult woman. Full body, standing, shown three times side by side at the same scale: front view, three-quarter view, back view. Neutral pose, arms relaxed, feet visible, same outfit in every view. Plain flat light-gray background, even lighting from the upper left, no shadows on the background. No text, no labels, no logo, no frame. Wide image.
```

> En utilisant le portrait joint comme référence exacte (visage, cheveux, yeux, cicatrice, armure, couleurs, style), crée une fiche de référence originale de la même femme adulte : corps entier, debout, vue trois fois côte à côte à la même échelle (face, trois quarts, dos). Pose neutre, bras relâchés, pieds visibles, même tenue partout. Fond gris clair uni, lumière égale venant du haut à gauche. Aucun texte, aucune étiquette, aucun logo, aucun cadre. Image large.

Pour Aveline, ajouter : `Her silver plate armor goes down to armored boots; the royal blue cape reaches her knees; a sheathed longsword hangs at her left hip.` (Armure jusqu'aux bottes, cape bleue jusqu'aux genoux, épée longue au fourreau à la hanche gauche.)

Fichier : `portraits-sources/aveline/aveline-fiche.png` (référence seulement, pas dans le jeu pour l'instant). **Fait le 18/11** (1536 × 1024), dans la conversation ChatGPT du portrait neutre, qui sert de référence sans renvoyer l'image.

> Côté de la tresse : sur toutes les images validées, elle tombe sur l'**épaule droite** d'Aveline (à gauche de l'image). Les invites ont été corrigées le 18/11 pour correspondre.

### 6.2 Bloc STYLE des paysages (à coller mot pour mot)

```
Original fantasy landscape illustration for an anime JRPG, painted background art. Wide cinematic view, 16:9. Clean shapes, soft painterly shading, rich but slightly muted colors like a modern 16-bit JRPG palette. Main light from the upper left. No characters in the foreground (tiny distant figures allowed), no text, no logo, no frame, no signature.
```

> Illustration originale de paysage de fantasy pour un JRPG anime, décor peint. Vue large cinématographique, 16:9. Formes nettes, ombrage doux et peint, couleurs riches mais un peu adoucies. Lumière principale en haut à gauche. Aucun personnage au premier plan (minuscules silhouettes lointaines permises), aucun texte, logo, cadre ni signature.

Usage prévu : écrans de chapitre, écrans de chargement, carte du monde illustrée, référence des cinématiques. **Pas comme décor jouable** (le monde reste en pixel art) ; si le groupe le décide, conversion en pixel art par script (réduction + palette du jeu).

### 6.3 Paysage n° 1 : Lysmont à l'aube

```
Lysmont, the capital of the kingdom of Aubeclaire, seen at dawn from a hill above the river. A city of white stone towers with blue slate roofs, rising in tiers around a castle on a small hill. A large white temple with a rose window stands apart on its own rise. Stone bridges cross a wide calm river; green plains, fields and windmills to the south. Morning mist on the water, warm golden light. Far away to the north, on the horizon, a long fortified wall under a dark, smoky sky.
```

> Lysmont, capitale du royaume d'Aubeclaire, vue à l'aube depuis une colline au-dessus de la rivière : tours de pierre blanche aux toits d'ardoise bleue, en étages autour d'un château sur une butte ; un grand temple blanc à rosace sur sa propre hauteur ; ponts de pierre sur une large rivière calme ; plaines, champs et moulins au sud. Brume du matin, lumière dorée. Au loin vers le nord, à l'horizon, une longue muraille fortifiée sous un ciel sombre et enfumé.

**Fait le 18/11** (1672 × 941). Écart avec le monde : la muraille du nord paraît collée à la ville, alors que le Mur d'Aube est à la frontière ; à retoucher si le groupe garde l'image. Fichier : `portraits-sources/paysages/lysmont-aube.png`, puis version jeu `assets/illustrations/lysmont-aube.png` (1280 × 720) si le groupe la garde.

**Retouche faite le 18/11** (`lysmont-aube-v2.png`, version retenue) : *« Change only one thing: the long fortified wall under the smoky sky must be much farther away… a thin line on the far northern horizon, beyond several layers of distant hills and plains »*. Le reste de l'image est inchangé.

### 6.4 Paysages des chapitres 2 à 6 (faits le 18/11)

Même conversation ChatGPT que Lysmont, chaque invite commence par « New image, same style as the previous landscapes. » puis le bloc STYLE du § 6.2. Originaux dans `portraits-sources/paysages/` (1672 × 941).

| Chapitre | Fichier | Description (anglais, après le bloc STYLE) |
|---|---|---|
| 2 — Marche des Sables | `qarzim.png` | `Qarzim, a great merchant city in the desert of the Sand March, seen from a high dune in warm late-afternoon light. Sandstone walls and domed towers around a turquoise oasis lake lined with palm trees, a huge covered grand bazaar with colorful striped awnings, a long caravan of camels arriving across the golden dunes, red canyons and salt ruins far in the distance.` |
| 3 — Sylvenoire | `ithrael.png` | `Ithrael, an elven city built in and around one colossal ancient tree in the primeval forest of Sylvenoire. Giant trees all around, wooden walkways, spiral stairs and round houses on the branches, soft glowing lanterns, roots like bridges over a clear stream, thick blue mist between the trunks, shafts of morning light through the canopy.` |
| 4 — Monts Grisfer | `ardenclume.png` | `Ardenclume, a dwarven forge-city carved into the grey Grisfer mountains, at dusk. Enormous stone gates and terraces cut into the cliff, many chimneys with glowing orange forge fires, stone bridges over a deep chasm, mine carts on rails, snow on the high peaks, and a smoking volcano in the background lighting the clouds from below.` |
| 4 — Archipel des Brumes | `port-verane.png` | `Port-Verane, a harbor town on a volcanic island of the Mist Archipelago, in permanent soft fog. Wooden docks and stilt houses, tall sailing ships at anchor, a lighthouse on black basalt cliffs, sea stacks and reefs, a half-sunken old lighthouse in the distance, and the faint silhouette of a dragon flying through the mist.` |
| 5 — Mur d'Aube | `mur-d-aube.png` | `The Wall of Dawn, a colossal fortified wall of pale stone stretching from horizon to horizon across the land, seen from the south at sunrise. Tall towers with blue and gold banners, siege engines on the ramparts, army camps with tents and campfire smoke at its foot, a road leading to a great fortified gate. Beyond the wall, to the north, the sky turns red and is filled with ash and dark smoke.` |
| 6 — Terres Cendrées | `terres-cendrees.png` | `The Ashen Lands, a vast plain of grey ash under a dim red sky, with slow rivers of glowing lava, ruined black fortresses and broken stone pillars, dead trees, ash falling like snow. On the far horizon, a huge citadel of black obsidian with sharp spires, lit from below by lava. Ominous but beautiful, no gore.` |

**À retoucher** : `mur-d-aube.png`, les bannières portent un motif doré qui ressemble à une fleur de lys → le remplacer par le soleil levant d'Aubeclaire (même règle que pour Aveline).

**Retouche faite le 23/11** (`mur-d-aube-v2.png`, version retenue, dans le jeu) : *« Keep everything exactly the same… Change only the gold emblem on all the blue banners: replace it with a simple gold rising sun with short rays (no fleur-de-lis, no cross, no other symbol) »*. Le reste de l'image est inchangé (seul l'ornement au-dessus de la grande porte garde une petite pointe dorée).

### 6.5 Versions préparées (18/11, pas encore dans le jeu)

Sur le PC du graphiste, dans `portraits-sources/…/prepares/` :
- **Paysages** en 1280 × 720, JPEG qualité 86, de 210 à 300 Ko chacun (`lysmont-aube.jpg` = la version retouchée). Pour les écrans de chapitre et de chargement.
- **Essai de conversion en pixel art** (`essai-pixel-lysmont.png` : 320 × 180, 40 couleurs, agrandi ×4 sans lissage). Le résultat ressemble à une peinture pixelisée, différente des décors actuels (aplats simples) : c'est au groupe de choisir.
- **Auréliath** : `portrait-neutre.png` 512 × 512 détouré et `anim/` (respiration, tête, barbe, bouche ; clignement quand l'image « yeux fermés » existera).

### 6.6 Conversion en pixel art détaillé (18/11)

Script `outils/portraits/pixel_art.py <source> <sortie> [largeur_native] [couleurs] [facteur]` : recadrage 16:9, lissage qui garde les bords, réduction à la taille native, palette k-means (espace Lab), nettoyage des pixels isolés, contours légèrement assombris, agrandissement sans lissage.

| Réglage | Rendu |
|---|---|
| `640 128 3` → 1920 × 1080 | **recommandé** : vrai pixel art, très détaillé (pixels de 3) |
| `960 160 2` → 1920 × 1080 | le plus détaillé ; ressemble presque à l'illustration |
| `427 48 3` → 1280 × 720 | plus « rétro », moins de détails |

Essai sur Ithrael : `portraits-sources/paysages/prepares/ithrael-pixel-640.png` et `ithrael-pixel-960.png`. Usage possible : décors des lieux, fonds de combat, écrans de chapitre. Pas pour les sprites animés des héros (images d'animation impossibles à aligner avec un générateur d'images).
