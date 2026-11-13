# CLAUDE.md — mémoire du projet « Les Appelés de Velmaris »

JDR isekai/fantasy multijoueur (de 1 à 6 joueurs), en français, pour un groupe d'amis non développeurs.
Toujours expliquer les choix simplement, en français, et proposer une option recommandée quand on pose une question.
Si une demande est floue ou contradictoire : poser la question plutôt que deviner.

## État d'avancement
- [x] Étape 0 : questions de cadrage (réponses ci-dessous)
- [ ] Étape 1 : `docs/CONCEPTION.md`, `docs/GRAPHISMES.md` et `docs/LISTE-TEXTURES.md` rédigés, **en attente de validation**
- [ ] Étape 2 : version jouable 1 (création de personnage, prologue, chapitre 1, combat, Aveline, sauvegarde)
- [ ] Étape 3 et suivantes : chapitres 2 à 6, un par itération

## Décisions validées (étape 0)
- **Support** : jeu web **2D** (navigateur, PC et mobile).
- **Rendu 2D hybride** : villes et carte du monde = décors cliquables avec portraits ; donjons = vue de dessus en tuiles ; combats = vue de côté avec sprites animés.
- **Style** : pixel art (tuiles de 32×32, sprites de combat de 64×64, boss de 128×128) + portraits anime en 512×512. **Les textures sont produites par le groupe en parallèle** (spécifications dans `docs/GRAPHISMES.md` et `docs/LISTE-TEXTURES.md`). Toute image manquante est remplacée par un provisoire généré automatiquement : ne jamais bloquer le développement sur une image.
- **Hébergement** : GitHub Pages (statique) + Supabase gratuit (parties partagées, temps réel). Plus un **mode local** sans compte.
- **Façon de jouer** : les deux. En direct pour la quête principale et les combats de groupe ; en asynchrone pour le temps libre, les contrats, les compagnes et le prologue.
- **Narration** : écrite dans des fichiers de données, **sans IA**.
- **Départ** : chaque joueur choisit **invoqué adulte** (18 à 35 ans) ou **réincarné** (né en 994 AV, prologue d'enfance jouable aux âges de 6, 10, 14 et 17 ans, sans romance ni combat dangereux, 18 ans à l'an 0). Tous au niveau 1 à l'an 0.
- **Durée** : saison 1 = 18 ans (1012 → 1030 AV), 6 chapitres de 3 ans, 3 sessions de 2 h par chapitre. Elle se termine par un **boss final**. Des **mises à jour ajouteront des saisons** : la chronologie continue, les âges augmentent et le niveau maximum monte (40 en saison 1).
- **Ton** : mélange humour et sérieux. **Mort douce** : K.O. + pénalité, jamais de perte définitive du héros ; les PNJ peuvent mourir.
- **Romance** : **harem libre** (plusieurs compagnes engagées par héros, et une compagne peut aimer plusieurs héros), mais **chaque compagne peut refuser** (affinité, lignes rouges). Uniquement entre adultes, rien d'explicite (fondu au noir).
- **Joueurs** : identifiés par **pseudo**, aucun prénom codé en dur.
- **Races (révision du 13/11)** : **8 races** (humain, elfe, demi-elfe, nain, Ourvalis, Vulpin, demi-démon, sang-dragon). Chacune a des **modificateurs de caractéristiques à somme nulle** (le total reste de 60 ; chaque caractéristique reste entre 3 et 17) et un **trait racial** (un avantage et un défaut). Détails dans `docs/CONCEPTION.md` § 3.6. En graphisme : un **calque par race** superposé au sprite de classe (l'humain n'en a pas), une teinte de peau et une taille gérées par le code, et un portrait par défaut par race.

## Choix techniques
- TypeScript + Vite + **Phaser 3** (rendu 2D) + Svelte (menus et dialogues par-dessus) ; tests avec Vitest ; Playwright pour le test de bout en bout.
- Le moteur de règles est **pur** (`src/moteur/`, sans interface ni réseau). Il est réutilisé par les tests et par `scripts/equilibrage.ts`.
- **Hasard à graine** (RNG reproductible). La synchronisation se fait par **journal d'actions rejoué** (même graine + mêmes actions = même état). Des instantanés réguliers. Le journal d'actions sert aussi de journal de rattrapage.
- Supabase : connexion anonyme + code de partie à 6 caractères + pseudo. Tables `parties`, `membres`, `actions`, `instantanes` ; règles de sécurité RLS réservées aux membres.
- Contenu en **YAML** dans `content/`, validé par des schémas zod (messages d'erreur en français).
- Réglages de temps, de niveau maximum, de paliers d'affinité et de difficulté selon le nombre de joueurs : dans `content/config/campagne.yaml`.
- Sauvegarde **versionnée** + migrations (`src/sauvegarde/migrations.ts`) pour que les nouvelles saisons ne cassent pas les anciennes parties.

## Règles de conception à respecter
- **Équilibrage** : 60 points de caractéristiques pour toutes les classes au niveau 1. Simulation de 1 000 combats ou plus par cas. Taux de victoire : **± 10 points de la moyenne** par classe et par race, **± 15 points** par combinaison classe × race (80 combinaisons). Relancer `npm run equilibrage` à chaque ajout de classe, de race, de don ou d'ennemi.
- Un don est **unique par partie**.
- Un joueur qui arrive en cours de route rejoint au **niveau moyen du groupe**.
- Monde, noms et intrigues **100 % originaux** : aucune reprise d'œuvre existante.
- Interface **entièrement en français**.

## Branche Git
Développement sur `claude/festive-mccarthy-ahagx5`. Pas de pull request sauf si on la demande.
