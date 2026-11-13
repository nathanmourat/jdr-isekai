# CLAUDE.md — mémoire du projet « Les Appelés de Velmaris »

JDR isekai/fantasy multijoueur (de 1 à 6 joueurs), en français, pour un groupe d'amis non développeurs.
Toujours expliquer les choix simplement, en français, et proposer une option recommandée quand on pose une question.
Si une demande est floue ou contradictoire : poser la question plutôt que deviner.

## État d'avancement
- [x] Étape 0 : questions de cadrage (réponses ci-dessous)
- [x] Étape 1 : conception **validée le 13/11** (`docs/CONCEPTION.md` v0.2, `docs/GRAPHISMES.md`, `docs/LISTE-TEXTURES.md`). Tailles d'images à confirmer avec le graphiste.
- [x] Étape 2 : **version jouable 1 livrée** (13/11) — à faire tester par le groupe
  - moteur pur + 51 tests ; chapitre 1 complet joué de bout en bout par un robot de test (`tests/robot.ts`) ; test navigateur `tests/e2e/parcours.mjs`
  - interface Svelte + Phaser ; mode local OK ; mode Supabase écrit (`src/sync/supabase.ts`, `supabase/schema.sql`) mais **pas encore testé contre un vrai projet** (le groupe doit créer le projet)
  - textures du groupe intégrées (V2 : priorité 1 sauf portraits d'Aveline, calques de race, icônes ; bestiaire de 28 monstres)
- [x] Combat libre + IA maison (13/11) : voir CONCEPTION § 7.5
- [x] **Équipements validés par le groupe** (branche `equipements`, dossier `equipements/`) : 364 objets (6 paliers + palier X mythique, 6 raretés avec rareté max par palier, 6 effets, 10 légendaires, 6 mythiques uniques par partie) et 364 icônes 32×32. **Pas encore branchés dans le moteur** : étapes d'intégration dans `equipements/LISEZ-MOI.md`
- [ ] Étape 3 et suivantes : chapitres 2 à 6, un par itération (**en pause** : portage Roblox d'abord)
- [ ] **Portage Roblox (décidé le 13/11)** : voir `roblox/README-ROBLOX.md`. R0 validé dans Studio le 13/11 ; R1 à R5 écrits le 13/11 (parties à code, DataStore, Lysmont 3D, dialogues/votes, combats 3D + IA, donjon, temps libre, tout public), **à tester par Nathan** avec les listes de `roblox/README-ROBLOX.md`

## Décisions validées (étape 0)
- **Support** : jeu web **2D** (navigateur, PC et mobile).
- **Rendu 2D hybride** : villes et carte du monde = décors cliquables avec portraits ; donjons = vue de dessus en tuiles ; combats = vue de côté avec sprites animés.
- **Style** : pixel art (tuiles de 32×32, sprites de combat de 64×64, boss de 128×128) + portraits anime en 512×512. **Les textures sont produites par le groupe en parallèle** (spécifications dans `docs/GRAPHISMES.md` et `docs/LISTE-TEXTURES.md`). Toute image manquante est remplacée par un provisoire généré automatiquement : ne jamais bloquer le développement sur une image.
- **Hébergement** : GitHub Pages (statique) + Supabase gratuit (parties partagées, temps réel). Plus un **mode local** sans compte.
- **Façon de jouer** : les deux. En direct pour la quête principale et les combats de groupe ; en asynchrone pour le temps libre, les contrats, les compagnes et le prologue.
- **Narration** : écrite dans des fichiers de données, **sans IA payante**.
- **Combat libre (13/11)** : à chaque tour, « Suivre le script » (3 propositions) ou « Proposer mon action » (texte libre). **IA maison** (`src/ia/`) : classificateur bayésien entraîné par `npm run ia:entrainer` + reconnaissance d'entités + conseiller tactique, sans API payante (choix du groupe). **L'IA ne fixe jamais de chiffres** : `estimerAction` (moteur) vérifie et calcule. **3 propositions impossibles par tour**, ensuite on choisit parmi les propositions. Si un jour le groupe veut une vraie IA (Claude via une fonction Supabase), elle se branche par-dessus, sans rien jeter.
- **Fusions** : variante d'une compétence (rang 2 requis dans les deux, éléments différents), formule fixe (75 % + 45 %, 75 % du mana, recharge +1) ; **5 rangs, 2 variantes par compétence (une active), 6 compétences équipées** ; grimoire **partagé dans la partie** (`etat.grimoire`), apprentissage à la Guilde. Format de sauvegarde v2 (migration 1→2).
- **Départ** : chaque joueur choisit **invoqué adulte** (18 à 35 ans) ou **réincarné** (né en 994 AV, prologue d'enfance jouable aux âges de 6, 10, 14 et 17 ans, sans romance ni combat dangereux, 18 ans à l'an 0). Tous au niveau 1 à l'an 0.
- **Durée** : saison 1 = 18 ans (1012 → 1030 AV), 6 chapitres de 3 ans, 3 sessions de 2 h par chapitre. Elle se termine par un **boss final**. Des **mises à jour ajouteront des saisons** : la chronologie continue, les âges augmentent et le niveau maximum monte (40 en saison 1).
- **Ton** : mélange humour et sérieux. **Mort douce** : K.O. + pénalité, jamais de perte définitive du héros ; les PNJ peuvent mourir.
- **Romance** : **harem libre** (plusieurs compagnes engagées par héros, et une compagne peut aimer plusieurs héros), mais **chaque compagne peut refuser** (affinité, lignes rouges). Uniquement entre adultes, rien d'explicite (fondu au noir).
- **Joueurs** : identifiés par **pseudo**, aucun prénom codé en dur.
- **Races (révision du 13/11)** : **8 races** (humain, elfe, demi-elfe, nain, Ourvalis, Vulpin, demi-démon, sang-dragon). Chacune a des **modificateurs de caractéristiques à somme nulle** (le total reste de 60 ; chaque caractéristique reste entre 3 et 17) et un **trait racial** (un avantage et un défaut). Détails dans `docs/CONCEPTION.md` § 3.6. En graphisme : un **calque par race** superposé au sprite de classe (l'humain n'en a pas), une teinte de peau et une taille gérées par le code, et un portrait par défaut par race.

## Version Roblox (décisions du 13/11)
- **Portage complet** sur Roblox, en **3D simple** (style Roblox, décors générés par le code). Code dans `roblox/` (roblox-ts + Rojo).
- **Compagnes = amitié seulement** sur Roblox (expérience tout public). La version web garde la romance. Règles Roblox : romance seulement en 17+ avec pièce d'identité.
- **Un seul moteur** : `src/moteur` est traduit en Luau par TypeScriptToLua (`roblox/src/shared/moteur.lua`, généré). Le moteur doit rester compatible Luau : `npm run roblox:verifier` (dans `npm test`). Utiliser `vrai`, `cles/valeurs/entrees`, `trier`, `copieProfonde` (`src/moteur/outils.ts`).
- Tests sous Lune : parité moteur (`npm run roblox:parite`, graines chapitre/alpha/bravo/desordre), parité IA (`scripts/roblox-parite-ia.ts`), fonctions de l'interface (`roblox/parite/interface.luau`). Pièges Luau corrigés : listes à trous, opérateur virgule, `filter(Boolean)`, `?:` sans parenthèses, `_G`, bitwise.
- Contenu Roblox : `npm run roblox:contenu` (romance désactivée, paliers renommés « Amie fidèle » / « Lien indéfectible », contrôle des textes). Scène romantique = `romance: true` dans le YAML.
- Nathan teste dans Studio (je n'ai pas Studio) : chaque étape a une liste de contrôle dans `roblox/README-ROBLOX.md`.
- **Graphismes Roblox (13/11)** : tout en 3D ; héros = avatar Roblox + arme de classe ; ennemis = modèles du serveur (`roblox/src/server/modeles.ts`), remplaçables par `ServerStorage/ModelesDuGroupe/<id>` ; combat tour par tour modernisé, sur place.
- **Intérieurs + ville vivante (13/11)** : entrée par téléportation dans une salle (`roblox/src/server/interieurs.ts`), points d'interaction (attributs `Lieu`/`Action`) ; jour/nuit réel de 20 min, villageois, gardes, marché, animaux (`roblox/src/server/vie.ts`) ; phrases d'ambiance dans `content/monde/ambiance.yaml` ; sons dans `roblox/src/shared/sons.ts` (vides : le groupe choisit).
- Deux sessions Claude travaillent sur la branche : celle-ci (cloud) s'occupe de Roblox, celle du PC de Nathan de la version web. Toujours `git fetch` + rebase avant de pousser.

## Choix techniques
- TypeScript + Vite + **Phaser 3** (rendu 2D) + Svelte (menus et dialogues par-dessus) ; tests avec Vitest ; Playwright pour le test de bout en bout.
- Le moteur de règles est **pur** (`src/moteur/`, sans interface ni réseau). Il est réutilisé par les tests et par `scripts/equilibrage.ts`.
- **Hasard à graine** (RNG reproductible). La synchronisation se fait par **journal d'actions rejoué** (même graine + mêmes actions = même état). Des instantanés réguliers. Le journal d'actions sert aussi de journal de rattrapage.
- Supabase : connexion anonyme + code de partie à 6 caractères + pseudo. Tables `parties`, `membres`, `actions`, `instantanes` ; règles de sécurité RLS réservées aux membres.
- Contenu en **YAML** dans `content/`, validé par des schémas zod (messages d'erreur en français).
- Réglages de temps, de niveau maximum, de paliers d'affinité et de difficulté selon le nombre de joueurs : dans `content/config/campagne.yaml`.
- Sauvegarde **versionnée** + migrations (`src/sauvegarde/migrations.ts`) pour que les nouvelles saisons ne cassent pas les anciennes parties.

## Textures (livrées par le groupe sur la branche `textures-v2`)
- Le groupe envoie ses images par GitHub (« Upload files » sur la branche `textures-v2`). Les récupérer avec `git fetch origin textures-v2`, les copier dans `assets/`, puis lancer `npm run assets:manquants -- --cocher`.
- Toutes les classes partagent la **même trajectoire de corps** image par image : c'est ce qui permet à un seul calque de race de s'adapter aux 10 classes (`assets/personnages/races/NOTE-CALQUES.md`).
- Tileset : la correspondance est dans `assets/tuiles/<nom>.json`. Le bestiaire est dans `assets/ennemis/BESTIAIRE.md` : 21 monstres prêts pour les chapitres 2 à 6, avec les niveaux conseillés.
- Les invocations utilisent la planche du monstre du même nom, retournée côté héros.
- Chemins : compagnons dans `personnages/compagnes/<id>/`, PNJ dans `personnages/pnj/<id>/`, portraits par défaut dans `personnages/races/<race>/portrait-defaut.png`.

## Règles de conception à respecter
- **Équilibrage** : 60 points de caractéristiques pour toutes les classes au niveau 1. Simulation de 1 000 combats ou plus par cas. Taux de victoire : **± 10 points de la moyenne** par classe et par race, **± 15 points** par combinaison classe × race (80 combinaisons). Relancer `npm run equilibrage` à chaque ajout de classe, de race, de don ou d'ennemi.
- Difficulté de groupe (réglée par simulation, de 1 à 6 héros) : PV des ennemis ×1 / 2,7 / 4,3 / 6,0 / 8,0 / 10,0 ; dégâts ×1 / 1,35 / 1,45 / 1,70 / 1,90 / 2,10.
- Le Charisme a un effet en combat (« présence ») : ±1 % de dégâts infligés et subis par point par rapport à 10.
- Un don est **unique par partie**.
- Un joueur qui arrive en cours de route rejoint au **niveau moyen du groupe**.
- Monde, noms et intrigues **100 % originaux** : aucune reprise d'œuvre existante.
- Interface **entièrement en français**.

## Branche Git
Développement sur `claude/festive-mccarthy-ahagx5`. Pas de pull request sauf si on la demande.
