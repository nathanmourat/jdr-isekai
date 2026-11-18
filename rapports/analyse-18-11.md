# Analyse du jeu — nuit du 18/11 (version web)

J'ai fait tourner dans le cloud, sur la branche `claude/festive-mccarthy-ahagx5` (commit `0e58629`) :
- les 253 tests, puis 275 avec les nouvelles quêtes ;
- la compilation ;
- la vérification des types ;
- 10 tests navigateur sur 4 tailles d'écran.

J'ai aussi regardé les captures une par une.

**Bilan : le jeu est solide.**
- Tous les tests du moteur passent.
- Le parcours complet marche : création → prologue → Appel → examen → lit de l'auberge → temps libre → rechargement de la page.
- La carte demande un seul clic par lieu.
- Il n'y a qu'une seule fenêtre ouverte à la fois.
- Les dés, les soins du Temple et les clics sur les combattants (5 contre 5) marchent.
- L'IA de combat répond en environ 0,5 s sur un téléphone simulé.

## Bugs trouvés

| # | Gravité | Problème | Où | Comment le voir |
|---|---|---|---|---|
| 1 | **Moyenne** | **Des noms sont encore coupés en combat** (régression du test de la mise à jour 5). Sur téléphone (360 × 740) : « Morwenna « Morra » », « Hjalmi l'Éborgnée », « Tolvan l'Armurier ». Sur ordinateur (1280 × 720) : « Capitaine Corsa la Rouge », « Dame Halvine Corbelet ». L'étiquette sort du cadre à gauche. | `xEtiquetteDansCadre` (SceneCombat) | `npx tsx tests/e2e/noms.mjs` |
| 2 | Moyenne | **Trop de notifications en même temps.** Les gains (jusqu'à 8) et les messages (jusqu'à 5) ont chacun leur pile : on peut en avoir 9 à 10 à droite, qui cachent la scène. Des messages anciens (« Ilo grandit dans une ferme d'Aubeclaire ») sont encore là sur la carte. | `src/ui/Gains.svelte`, `Notifications.svelte`, `jeu.svelte.ts` | Capture `07-guilde.png` du parcours |
| 3 | Faible | La commande `npm run contenu:verifier` est cassée : le script `scripts/verifier-contenu.ts` n'existe pas. | `package.json` | `npm run contenu:verifier` |
| 4 | Faible | Les tests navigateur ne se lancent pas tous de la même façon : `parcours` et `carte` avec `node`, tous les autres avec `npx tsx` (sinon erreur « module introuvable »). | `tests/e2e/` | — |

## À améliorer

| # | Idée | Pourquoi |
|---|---|---|
| 5 | **Décor de la Guilde : un bouclier à croix rouge** est accroché au mur. Il ressemble trop à un symbole religieux réel (croisés) : le remplacer par la rose des vents de la Guilde. | Règle « 100 % original » et jeu vendu |
| 6 | **Premier chargement lourd** : tout le jeu est dans un seul fichier de 3,5 Mo (1 Mo compressé). Sur un téléphone en 4G, plusieurs secondes d'écran noir. Découper : Phaser à part, contenu des chapitres 2 à 6 chargé plus tard. | Confort sur mobile |
| 7 | **Carte du monde** : en haut, la bande du nord (Terres Cendrées et Mur) ressemble à du bruit de pixels en 1280 × 800. | Lisibilité |
| 8 | IA de combat : « boule de feu sur le gobelin » devient « Javelot de flamme » sans le dire. Ajouter « (vous n'avez pas Boule de feu : je prends Javelot de flamme) ». | Le joueur comprend pourquoi |
| 9 | Les 7 nouvelles quêtes posent des drapeaux (feuille verte d'Orvan, insigne de son écuyer, carnet d'un Appelé…) : en faire réagir Orvan au chapitre 6 et Elianne au chapitre 4. | Choix qui comptent (voir `rapports/quetes-monde.md`) |

## Prompt pour Claude Code

```
Corrige les points 1 à 4 de rapports/analyse-18-11.md (version web seulement) et fais les points 5 à 8 si c'est simple.
AVANT DE COMMENCER : pose-moi toutes tes questions en une seule fois, avec une option recommandée pour chacune.
1. Noms coupés en combat : tests/e2e/noms.mjs doit repasser à 100 % (360×740, 740×360, 1280×720).
2. Notifications : une seule pile commune (gains + messages), 4 au plus à l'écran, les plus anciennes partent d'abord ; un message d'histoire ne doit pas rester après un changement de vue.
3. npm run contenu:verifier : recréer le script ou retirer la commande.
4. Tests navigateur : tous lançables de la même façon (npx tsx), et la doc de CLAUDE.md à jour.
5. Décor de la Guilde : remplacer le bouclier à croix par l'emblème de la rose des vents (générateur outils/textures/decors-v3/).
6. Découper le paquet JS (Phaser à part, chapitres 2 à 6 chargés à la demande) si ça ne casse rien.
7. Carte : vérifier la bande du nord en 1280×800.
8. IA de combat : dire quelle compétence remplace celle que le joueur n'a pas.
Tests : npm test, npm run build, puis les tests navigateur concernés. Commit et push sur claude/festive-mccarthy-ahagx5 (git fetch + rebase avant). Explique-moi simplement ce qui a changé.
```
