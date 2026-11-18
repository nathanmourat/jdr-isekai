# Droits et outils d'IA — « Les Appelés de Velmaris »

> **Objectif du groupe (18/11)** : le jeu web pourra être **vendu**. Chaque image, son, vidéo ou texte doit donc pouvoir être utilisé commercialement, et on doit pouvoir le prouver.
> Ce document résume les **conditions d'utilisation des outils**, vérifiées le **18/11/2026**. Ce n'est **pas un avis juridique** : à faire valider par un professionnel du droit avant la mise en vente. Les conditions changent souvent : revérifier avant chaque nouvelle série d'images.

## 1. Outils autorisés, à surveiller, interdits

| Outil | Usage dans le projet | Statut | Ce que disent les conditions (18/11/2026) |
|---|---|---|---|
| **Claude** (Anthropic) | code, textes, pixel art généré par script, animation | ✅ autorisé | Anthropic cède à l'utilisateur ses droits éventuels sur les sorties (« we assign to you all of our right, title, and interest—if any—in Outputs »). [Consumer Terms](https://www.anthropic.com/legal/consumer-terms) |
| **ChatGPT Images** (OpenAI) | portraits anime, fiches de référence, paysages | ✅ autorisé, toutes offres | L'utilisateur possède la sortie ; OpenAI lui cède ses droits éventuels. [Terms of Use](https://openai.com/policies/terms-of-use/) |
| **rembg** + modèle **isnet-anime** (SkyTNT) | détourage des portraits | ✅ autorisé | Modèle publié sous licence Apache-2.0 (usage commercial permis). Réserve : la licence des poids n'est pas confirmée séparément par l'auteur. [Fiche du modèle](https://huggingface.co/skytnt/anime-seg) |
| **Atlabs** | cinématiques (script → vidéo) | ✅ recommandé | « Videos you generate on Atlabs belong to you », usage commercial compris. Vérifier la présence d'un filigrane selon l'offre. [Aide Atlabs](https://help.atlabs.ai/en-us/article/who-owns-the-videos-i-create-with-atlabs-641jk3/) |
| **Elser AI** | cinématiques (anime) | ⚠️ possible | Pas de revendication de propriété, usage commercial non restreint, **mais** licence perpétuelle accordée à Elser pour l'entraînement de ses modèles et son marketing. [Conditions](https://www.elser.ai/terms-of-service) |
| **FlexClip** | montage vidéo | ⚠️ offre payante seulement | Offre gratuite : aucun usage commercial. Plus, Business ou Team : stocks et IA utilisables commercialement. Crédits IA seuls : pas les stocks. [Règles FlexClip](https://help.flexclip.com/en/articles/7266809-can-i-use-my-video-commercially) |
| **Mootion** | — | ❌ interdit pour le projet | Licence d'usage du service « solely for your personal use », usage commercial des sorties non clairement autorisé, droit de Mootion d'utiliser les contenus pour son marketing. [Conditions](https://mootion.com/docs/terms-of-service.html) |
| Montage libre (**Shotcut**, **Kdenlive**) | montage vidéo | ✅ autorisé | Logiciels libres : la licence porte sur le logiciel, pas sur les vidéos qu'on fabrique avec. |
| **Musique et sons** | cinématiques, jeu | ⚠️ cas par cas | Seulement avec une licence écrite qui autorise un jeu vendu (ou une création du groupe). Noter la licence dans `assets/CREDITS.md`. |

Tout nouvel outil doit être ajouté à ce tableau **avant** d'être utilisé.

## 2. Protection contre la copie

Avoir le droit de **vendre** une image n'est pas la même chose que pouvoir **empêcher les autres de la copier**. Une image produite uniquement par une invite peut ne pas être protégée par le droit d'auteur (États-Unis, et l'Union européenne exige aussi un apport humain original). Ce qui protège le jeu, c'est le **travail humain** : scénario, monde, mise en scène, retouches, animation, code, assemblage. Il faut donc le **documenter**.

## 3. Règles à suivre pour chaque image, vidéo ou son

1. **Aucun nom d'artiste, de studio, d'œuvre ou de personnage existant** dans les invites. Seulement des styles généraux (« anime », « JRPG »).
2. **Garder les preuves** : l'original (dossier `portraits-sources/` sur le PC du graphiste, jamais dans Git), l'invite exacte (dans `docs/PORTRAITS-IA.md`), l'outil, l'offre utilisée et la date.
3. **Enregistrer en PDF les conditions d'utilisation** de l'outil le jour de la génération, dans `portraits-sources/licences/` (hors du dépôt).
4. **Une ligne dans `assets/CREDITS.md`** par série de fichiers : outil, offre, date, licence, retouches faites par le groupe.
5. **Pas de filigrane** dans le jeu, et ne jamais en effacer un : utiliser une offre qui n'en met pas.
6. **Personnages adultes** clairement identifiables, rien de suggestif.
7. À la mise en vente : **déclarer l'usage d'IA** là où la boutique le demande.

## 4. Registre des générations

| Date | Fichiers | Outil et offre | Invites | Retouches du groupe |
|---|---|---|---|---|
| 15/11/2026 | Aveline : 6 expressions + yeux fermés (`personnages/compagnes/aveline/`) | ChatGPT Images, offre gratuite (compte du graphiste) | `docs/PORTRAITS-IA.md` § 2 à 4.1 | Choix entre variantes, retouche demandée (tresse, emblème du soleil, angle), détourage, recadrage, calques et animation (`outils/portraits/`) |
| 18/11/2026 | Aveline : fiche de référence corps entier (face, trois quarts, dos), référence seulement | ChatGPT Images, offre gratuite | `docs/PORTRAITS-IA.md` § 6.1 | Choix du cadrage, contrôle de cohérence avec les portraits |
| 18/11/2026 | Paysage « Lysmont à l'aube », pas encore dans le jeu | ChatGPT Images, offre gratuite | `docs/PORTRAITS-IA.md` § 6.2 et 6.3 | Description du lieu écrite d'après le contenu du jeu ; retouche à prévoir (muraille du nord) |
