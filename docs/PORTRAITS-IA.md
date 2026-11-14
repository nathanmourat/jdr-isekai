# Portraits de dialogue (style anime) — prompts pour le générateur d'images

Ce fichier sert au groupe pour générer les **portraits 512 × 512** avec un générateur d'images IA, tous dans le même style.
Il complète `docs/GRAPHISMES.md` (§ 2 et § 6) et `docs/LISTE-TEXTURES.md` (noms de fichiers).

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
- **Tourné vers la droite** : dans `Dialogue.svelte`, le portrait est affiché à gauche du texte. *(À confirmer par le groupe : `GRAPHISMES.md` § 6 dit encore « facing slightly left ».)*
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
Aveline, an adult woman aged 24, a knight and captain of the royal guard. Mature adult face. Copper-chestnut hair tied in a short braid resting on her left shoulder, a few loose strands framing her face. Grey-green eyes, straight steady gaze, defined eyebrows, a small pale scar on the right side of her chin. Light warm skin. Polished silver plate armor with blue and gold trim, rounded pauldrons and a gorget, a royal blue cape fastened at the shoulders with a gold clasp. Dignified, disciplined bearing.
```

> Aveline, femme adulte de 24 ans, chevalière et capitaine de la garde royale. Visage d'adulte. Cheveux châtain cuivré attachés en une tresse courte posée sur son épaule gauche, quelques mèches libres autour du visage. Yeux gris-vert, regard droit et ferme, sourcils marqués, petite cicatrice pâle du côté droit du menton. Peau claire et chaude. Armure de plates argentée et polie, liserés bleus et or, épaulières arrondies et gorgerin, cape bleu royal attachée aux épaules par une agrafe dorée. Allure digne et disciplinée.

### 4.2 Portraits par défaut des races

À venir : 8 races × 2 versions (`portrait-defaut.png` et `portrait-defaut-f.png`), expression déterminée, tenue d'aventurier neutre.

### 4.3 Autres compagnes et PNJ importants

À venir : Kaya, Nadja, Séraphine, Elianne, Ilyssë, Ysoria, Morra ; Halvine, Rowena, Auréliath, Bram, Ferrand…
