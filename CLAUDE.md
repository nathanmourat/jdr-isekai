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
- [x] **Équipements validés par le groupe** (dossier `equipements/`) : 364 objets (6 paliers + palier X mythique, 6 raretés avec rareté max par palier, 6 effets, 10 légendaires, 6 mythiques uniques par partie) et 364 icônes 32×32.
- [x] **Équipements intégrés (13/11)** : `content/objets/equipements.yaml` (copie de `equipements/equipements.yaml`), `src/moteur/equipement.ts` (niveau, classes, effets, 16 pouvoirs dans `combat.ts`, unicité des mythiques), boutiques palier I (Halvine, Guilde), affichage web (`src/ui/ObjetInfo.svelte`). Équilibrage : `npm run equilibrage:equipements` (palier I, ± 10 points). Choix faits : toutes les armes ont de la puissance, qui renforce aussi compétences et invocations (`facteurArme`) ; objets nommés orientés vers la carac principale de leur classe (voir `equipements/LISEZ-MOI.md`). Roblox : modèles 3D par catégorie/palier/rareté (`roblox/src/shared/equipement3d.ts`), avatars équipés (`server/tenues.ts`), sac et boutiques avec aperçu 3D (`client/ui/objets.ts`)
- [x] **Changements du test 1 (version web, 14/11)** : les 21 changements demandés après le premier test sont faits (lots A à G). Résumé et liste de vérification pour le groupe : `rapports/changements-test-1.md`. Images du graphiste attendues sur `textures-v3` (pas encore livrées : provisoires en place). **La version Roblox doit encore reprendre ces changements.**
- [ ] **Changements du test 2 (version web, 14/11)** : changements 1 à 9 faits (lots F2, G, début du lot H) ; **restent les changements 10 (examens de rang) et 11 (maîtrises d'équipement)**. Résumé et liste de vérification : `rapports/changements-test-2.md`. Images `textures-v3` intégrées. **La version Roblox doit reprendre ces changements** (nœud `pari`, `gerant`, sac en combat, rations, objets mystérieux, niveaux conseillés, format 6).
- [x] **Étape 3 : saison 1 complète (14/11)**, web et Roblox ensemble, poussée chapitre par chapitre : chapitres 2 à 6 (`content/campagne/saison-1/chapitre-N/`), 5 nouvelles régions (Marche des Sables, Sylvenoire, Monts Grisfer, Archipel des Brumes, Mur d'Aube, Terres Cendrées), les 7 autres compagnes (Kaya, Nadja, Séraphine, Elianne, Ilyssë, Ysoria, Morra), quêtes de classe en 3 étapes (ultimes au chapitre 5), domaines et troupes, guerre au Mur d'Aube (morts de PNJ selon la réputation), rang S, Orvan en 3 phases, **4 fins votées** (Sceau, Pacte, Couronne, Retour : seules les fins possibles sont proposées, « La Couronne » toujours) et épilogues (compagnes + un épilogue personnel par héros, `ep-heros` ; `ep-romance` web seulement). Ennemis générés par `scripts/contenu/bestiaire.py` + `chN_ennemis.py`, calibrés avec `npm run equilibrage:chapitres -- N` (rapports `rapports/equilibrage-chapitres-N.md`). Le robot joue toute la saison (`tests/saison.test.ts`) ; parité Lune graine `saison` = toute la saison. **À faire tester par le groupe** (web) et par Nathan dans Studio (listes de `roblox/README-ROBLOX.md`).
- [ ] **Portage Roblox (décidé le 13/11)** : voir `roblox/README-ROBLOX.md`. R0 validé dans Studio le 13/11 ; R1 à R5 écrits le 13/11 (parties à code, DataStore, Lysmont 3D, dialogues/votes, combats 3D + IA, donjon, temps libre, tout public), **à tester par Nathan** avec les listes de `roblox/README-ROBLOX.md`

## Décisions validées (étape 0)
- **Support** : jeu web **2D** (navigateur, PC et mobile).
- **Rendu 2D hybride** : villes et carte du monde = décors cliquables avec portraits ; donjons = vue de dessus en tuiles ; combats = vue de côté avec sprites animés.
- **Style** : pixel art (tuiles de 32×32, sprites de combat de 64×64, boss de 128×128) + portraits anime en 512×512. **Les textures sont produites par le groupe en parallèle** (spécifications dans `docs/GRAPHISMES.md` et `docs/LISTE-TEXTURES.md`). Toute image manquante est remplacée par un provisoire généré automatiquement : ne jamais bloquer le développement sur une image.
- **Hébergement** : GitHub Pages (statique) + Supabase gratuit (parties partagées, temps réel). Plus un **mode local** sans compte.
- **Façon de jouer** : les deux. En direct pour la quête principale et les combats de groupe ; en asynchrone pour le temps libre, les contrats, les compagnes et le prologue.
- **Narration** : écrite dans des fichiers de données, **sans IA payante**.
- **Combat libre (13/11)** : à chaque tour, « Suivre le script » (3 propositions) ou « Proposer mon action » (texte libre). **IA maison** (`src/ia/`) : classificateur bayésien entraîné par `npm run ia:entrainer` + reconnaissance d'entités + conseiller tactique, sans API payante (choix du groupe). **L'IA ne fixe jamais de chiffres** : `estimerAction` (moteur) vérifie et calcule. **3 propositions impossibles par tour**, ensuite on choisit parmi les propositions. Si un jour le groupe veut une vraie IA (Claude via une fonction Supabase), elle se branche par-dessus, sans rien jeter.
- **Fusions** : variante d'une compétence (rang 2 requis dans les deux, éléments différents), formule fixe (75 % + 45 %, 75 % du mana, recharge +1) ; **5 rangs, 2 variantes par compétence (une active), 6 compétences équipées** ; grimoire **personnel et privé par héros** (`heros.grimoire`, décision du groupe après le test 1 : il remplace le grimoire partagé) ; à la Guilde, chacun n'apprend que les fusions de sa classe. Format de sauvegarde **v6** (migrations 1→2 fusions, 2→3 repos à l'auberge, 3→4 grimoire personnel et paris, 4→5 contrats à étapes, 5→6 objets et goûts connus).
- **Départ** : chaque joueur choisit **invoqué adulte** (18 à 35 ans) ou **réincarné** (né en 994 AV, prologue d'enfance jouable aux âges de 6, 10, 14 et 17 ans, sans romance ni combat dangereux, 18 ans à l'an 0). Tous au niveau 1 à l'an 0.
- **Durée** : saison 1 = 18 ans (1012 → 1030 AV), 6 chapitres de 3 ans, 3 sessions de 2 h par chapitre. Elle se termine par un **boss final**. Des **mises à jour ajouteront des saisons** : la chronologie continue, les âges augmentent et le niveau maximum monte (40 en saison 1).
- **Ton** : mélange humour et sérieux. **Mort douce** : K.O. + pénalité, jamais de perte définitive du héros ; les PNJ peuvent mourir.
- **Romance** : **harem libre** (plusieurs compagnes engagées par héros, et une compagne peut aimer plusieurs héros), mais **chaque compagne peut refuser** (affinité, lignes rouges). Uniquement entre adultes, rien d'explicite (fondu au noir).
- **Joueurs** : identifiés par **pseudo**, aucun prénom codé en dur.
- **Races (révision du 13/11)** : **8 races** (humain, elfe, demi-elfe, nain, Ourvalis, Vulpin, demi-démon, sang-dragon). Chacune a des **modificateurs de caractéristiques à somme nulle** (le total reste de 60 ; chaque caractéristique reste entre 3 et 17) et un **trait racial** (un avantage et un défaut). Détails dans `docs/CONCEPTION.md` § 3.6. En graphisme : un **calque par race** superposé au sprite de classe (l'humain n'en a pas), une teinte de peau et une taille gérées par le code, et un portrait par défaut par race.

## Décisions du test 1 (14/11, version web)
- **Temps** : les jours avancent en jouant (action `jour_passe`, 1 jour toutes les 10 minutes de jeu actif, envoyée par l'appareil du premier joueur présent, jamais d'un mois à l'autre). **Les mois ne passent qu'au lit de l'auberge** (Chaudron Fêlé), avec l'accord de tous les joueurs présents (`proposer_repos`, `repondre_repos`), puis temps libre. Plus d'ellipse imposée dans les scènes : une scène datée porte `date_min` et attend. Le saut de fin de chapitre passe aussi par le lit.
- **Ville** : un lieu peut appartenir à une `ville` (un seul point sur la carte, puis un plan). Positions du plan : `assets/cartes/<plan>.json`, sinon `position_plan` du YAML. Lieux `etape_seulement` : visibles seulement pendant l'étape qui y mène.
- **PNJ** : une scène se lance en parlant à son `pnj` ; symboles « ! » doré, « ! » argenté, « ? » (`rend_quete`). Le Grand Prieur s'appelle **Auréliath** (`aureliath`) ; la marchande est **Dame Halvine Corbelet** (`halvine`).
- **Dialogues** : `[[tu…||vous…]]` selon le nombre de héros ; bloc `parole_a` (un PNJ interroge un joueur par son pseudo, lui seul répond parmi 3 réponses, choix du joueur par règle puis hasard à graine). Paris : `miser`, `gain_pari`, `perte_pari`.
- **Quêtes et contrats par étapes** : contrats avec `etapes` (lieu, objectif, texte, puis choix / test / combat), un contrat en cours par héros, récompense au retour à la Guilde ; quêtes secondaires = une courte scène par étape.
- **Combat** : précision « plus c'est puissant, moins c'est sûr » (héros : attaque de base +2 points, compétence −1 point par mana au-delà de 5, 5 au plus), écart de niveau ±0,5 point, **maîtrise** par compétence (0 à 5 : +2 % de dégâts et +1 point de précision par rang), attaques nommées des ennemis (`attaques:`). L'écran de combat révèle les événements du moteur petit à petit (suspense, pause avant la riposte) : il ne calcule rien.
- **Aiguillage de nœud (14/11)** : `aiguillage: [{ si, aller }]` + `suite` obligatoire ; au « Continuer », le groupe va au premier nœud dont la condition est vraie (morts de PNJ selon la réputation, libération de Lyss…). Un PNJ qui peut mourir a `si: { pas_flag: mort:<id> }` dans les listes `pnj` des lieux. **Épuisement** en combat après 80 tours (+10 % de dégâts par tour) : à 30 ou 60 tours, il cassait l'équilibrage du Guérisseur au niveau 1. Bilan de la saison pour le groupe : `rapports/saison-1.md`.
- Une scène terminée garde `noeudFin` : les répliques de son dernier nœud s'affichent avant « Terminer la scène ».
- Sous Windows, le serveur `npm run dev` ne voit pas toujours les fichiers modifiés par script : le relancer avec `npm run dev -- --force` en cas de doute.

## Décisions du test 2 (14/11, version web)
- **PNJ dans les décors** : les personnages présents sont dessinés sur le décor (`personnages/pnj/<id>/decor.png`, 80 × 128, ancre = pieds), aux positions de `assets/decors/<decor>.json` (`positions`), triés par profondeur, puis le premier plan `decors/<decor>-avant.png` (comptoirs). On leur parle en cliquant dessus. Sans position : placement automatique ; sans image : silhouette provisoire. Portrait de dialogue = haut de `decor.png` tant que le portrait 512 × 512 n'existe pas.
- **Zones cliquables des décors** (clés du JSON) : `escalier` et `porte_chambre` (taverne → chambre), `lit` (repos), `porte` / `sortie`, `tableau` (contrats de la Guilde), `entree` et points d'intérêt (actifs s'il y a quelque chose à faire). Code : `src/ui/vues/Lieu.svelte`.
- **Règle d'interface** : une zone cliquable posée sur une image (carte, plan, décor) est fixe, d'au moins 44 × 44 px, et ne doit jamais être centrée par un `transform` que le style `button:active` peut écraser. Seuls les éléments décoratifs à l'intérieur sont animés (`pointer-events: none`).
- **Boutiques par gérant** : champ `gerant` obligatoire pour un lieu qui a une `boutique` (Halvine, Bram, Elianne, et l'intendant de la Guilde **Maître Barnoul Kestrin**, `intendant-guilde`). On ouvre la boutique par « Voir la marchandise ». Champ `accueil` des PNJ.
- **Pari partagé** : nœud `pari: { mise, gain, flag, aller, personne }`, action `parier`. La mise est répartie entre ceux qui misent (division entière, reste aux premiers joueurs de la partie) ; `gain_pari` et `perte_pari` règlent la suite. L'ancien effet `miser` sur un choix existe toujours.
- **Niveau conseillé** : champ `niveau` obligatoire pour les quêtes et les contrats (facultatif par étape de quête). Couleur selon le niveau moyen du groupe : vert, orange (il manque 1 ou 2 niveaux), rouge (3 ou plus) ; confirmation avant un combat rouge. Fonctions dans `src/moteur/guide.ts`.
- **Objets** : infobulle compacte (`src/ui/ObjetInfo.svelte`) ; champ `utilite` ; les consommables à effet du sac s'utilisent en combat (action `objet` avec `item`, compteurs `sac:<id>` et `utilise:<id>`) ; **ration de voyage** : une par héros pour un combat hors de la ville, sinon −15 % de PV (3 rations au départ) ; **objets mystérieux** (`mystere: true`) : « ??? » jusqu'à l'achat ou l'identification payante (`identifie` d'un PNJ, action `identifier`, Ferrand : 10 or), connus ensuite de toute la partie (`etat.objetsConnus`) ; goûts des compagnes découverts en offrant ou par l'effet `reveler_gout` (`etat.goutsConnus`).
- Format de sauvegarde **v6** (migration 5→6 : objets connus, goûts connus).
- Combat : barre de mana (héros et compagnons ; les ennemis ont un mana illimité) et « Niv. X » des ennemis.
- `npm run roblox:parite` échoue tant que `roblox/src/shared/moteur.lua` n'est pas régénéré par la session Roblox (c'était déjà le cas avant le test 2).
- Playwright n'est pas installé sur le PC du groupe : `tests/e2e/carte.mjs` (`npm run e2e:carte`) est écrit, pas encore lancé. L'aperçu se lance avec `.claude/launch.json` (non versionné).

## Version Roblox (décisions du 13/11)
- **Portage complet** sur Roblox, en **3D simple** (style Roblox, décors générés par le code). Code dans `roblox/` (roblox-ts + Rojo).
- **Compagnes = amitié seulement** sur Roblox (expérience tout public). La version web garde la romance. Règles Roblox : romance seulement en 17+ avec pièce d'identité.
- **Un seul moteur** : `src/moteur` est traduit en Luau par TypeScriptToLua (`roblox/src/shared/moteur.lua`, généré). Le moteur doit rester compatible Luau : `npm run roblox:verifier` (dans `npm test`). Utiliser `vrai`, `cles/valeurs/entrees`, `trier`, `copieProfonde` (`src/moteur/outils.ts`).
- Tests sous Lune : parité moteur (`npm run roblox:parite`, graines chapitre/alpha/bravo/desordre), parité IA (`scripts/roblox-parite-ia.ts`), fonctions de l'interface (`roblox/parite/interface.luau`). Pièges Luau corrigés : listes à trous, opérateur virgule, `filter(Boolean)`, `?:` sans parenthèses, `_G`, bitwise.
- Contenu Roblox : `npm run roblox:contenu` (romance désactivée, paliers renommés « Amie fidèle » / « Lien indéfectible », contrôle des textes). Scène romantique = `romance: true` dans le YAML.
- Nathan teste dans Studio (je n'ai pas Studio) : chaque étape a une liste de contrôle dans `roblox/README-ROBLOX.md`.
- **Graphismes Roblox (13/11)** : tout en 3D ; héros = avatar Roblox + arme de classe ; ennemis = modèles du serveur (`roblox/src/server/modeles.ts`), remplaçables par `ServerStorage/ModelesDuGroupe/<id>` ; combat tour par tour modernisé, sur place.
- **Intérieurs + ville vivante (13/11)** : entrée par téléportation dans une salle (`roblox/src/server/interieurs.ts`), points d'interaction (attributs `Lieu`/`Action`) ; jour/nuit réel de 20 min, villageois, gardes, marché, animaux (`roblox/src/server/vie.ts`) ; phrases d'ambiance dans `content/monde/ambiance.yaml` ; sons dans `roblox/src/shared/sons.ts` (vides : le groupe choisit).
- **Grande passe graphique Roblox (13/11)** : lumière (reflets, nuages, profondeur de champ), terrain coloré et herbe animée, feuillage en terrain, maisons détaillées (tuiles, volets, jardinières), monstres refaits, ennemis habillés d'objets du catalogue. Optimisation : pas d'ombre pour les petites pièces, lumières de ville sans ombres, CollectionService pour la nuit. **StreamingEnabled laissé désactivé** (marqueurs et intérieurs en ont besoin).
- Roblox suit les lots C/D/E du web (13/11) : jours par le serveur (`boucleJours`), lit de l'auberge (taverne), `parole_a`, paris, grimoire personnel, contrats à étapes (balises dorées des lieux `etape_seulement`), migrations au chargement. Parité Lune : graines `contrats` et `equipement` en plus.
- Deux sessions Claude travaillent sur la branche : celle-ci (cloud) s'occupe de Roblox, celle du PC de Nathan de la version web. Toujours `git fetch` + rebase avant de pousser.

## Choix techniques
- TypeScript + Vite + **Phaser 3** (rendu 2D) + Svelte (menus et dialogues par-dessus) ; tests avec Vitest ; Playwright pour le test de bout en bout.
- Le moteur de règles est **pur** (`src/moteur/`, sans interface ni réseau). Il est réutilisé par les tests et par `scripts/equilibrage.ts`.
- **Hasard à graine** (RNG reproductible). La synchronisation se fait par **journal d'actions rejoué** (même graine + mêmes actions = même état). Des instantanés réguliers. Le journal d'actions sert aussi de journal de rattrapage.
- Supabase : connexion anonyme + code de partie à 6 caractères + pseudo. Tables `parties`, `membres`, `actions`, `instantanes` ; règles de sécurité RLS réservées aux membres.
- Contenu en **YAML** dans `content/`, validé par des schémas zod (messages d'erreur en français).
- Réglages de temps, de niveau maximum, de paliers d'affinité et de difficulté selon le nombre de joueurs : dans `content/config/campagne.yaml`.
- Sauvegarde **versionnée** + migrations (`src/sauvegarde/migrations.ts`) pour que les nouvelles saisons ne cassent pas les anciennes parties.

## Textures (livrées par le groupe sur les branches `textures-v2` puis `textures-v3`)
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
