# Équipements — armes, tenues, accessoires (validé par le groupe)

Ce dossier contient tout le travail sur l'équipement : la conception, le catalogue de **364 objets** et leurs **364 icônes**. Il a été validé par le groupe.

**L'équipement est branché dans le jeu** (sur la branche `equipements`) : catalogue, icônes, règles pour équiper, effets en combat, pouvoirs uniques, interface et boutiques de Lysmont. `npm test` passe (111 tests, dont 11 sur l'équipement) et `npm run equilibrage` respecte tous les critères avec des héros équipés.

## Le contenu en bref

- **6 paliers**, un par chapitre (niveaux 1, 8, 15, 22, 28, 34), plus un **palier X** (niveau 40) réservé aux armes mythiques.
- **6 raretés** : commun, peu commun, rare, épique, légendaire et mythique, avec une **rareté maximum par palier** (I : peu commun ; II : rare ; III et IV : épique ; V et VI : légendaire ; X : mythique).
- **Une seule règle de stats** : points = (2 + 0,3 × niveau) × rareté. 1 point vaut 1 caractéristique, 1 puissance ou 2 d'armure.
- **10 types d'armes, 3 tenues et 6 accessoires**, chacun réservé à certaines classes.
- **6 effets spéciaux** à partir de la rareté Rare : critique, précision, résistance à un élément, touche élémentaire, mana, PV max.
- **10 légendaires** (un par classe, palier V, récompense de la quête de classe) et **6 armes mythiques**, les « Reliques du Voile », **une seule par partie**.

Les détails et les raisons de chaque choix sont dans [`CONCEPTION-EQUIPEMENTS.md`](CONCEPTION-EQUIPEMENTS.md).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `CONCEPTION-EQUIPEMENTS.md` | Règles et choix, validés par le groupe |
| `equipements.xlsx` | Tableur à relire : catalogue filtrable, règles, comparaison des dégâts, objets nommés |
| `objets-nommes.yaml` | Noms, histoires, effets et pouvoirs des objets nommés, écrits à la main |
| `generer.py` | Recalcule toutes les stats, écrit **`content/objets/equipements.yaml`** (le catalogue du jeu) et le tableur |
| `icones/dessiner.py` | Dessine les icônes dans **`assets/icones/objets/<id>.png`** (même style que `outils/textures/`) |
| `icones/apercu.png`, `icones/apercu-nommes.png` | Planches d'aperçu agrandies |

Pour modifier un nom, un effet ou une règle : éditer `objets-nommes.yaml` ou `generer.py`, puis relancer les deux scripts. Il faut Python 3 avec `pip install pyyaml openpyxl pillow numpy`. Les commandes se lancent depuis le dossier `equipements/` :

```bash
python3 generer.py
```

```bash
cd icones && python3 dessiner.py
```

`generer.py` vérifie tout seul : budget de chaque objet, ids uniques, raretés autorisées par palier, chaque classe équipée à chaque palier, 6 mythiques. Relancer ensuite `npm test`.

## Ce qui a été branché dans le jeu

| Partie | Fichiers | Ce qui a changé |
|---|---|---|
| Contenu | `content/objets/equipements.yaml`, `content/objets/objets.yaml` | Les 364 objets. Les 7 anciens gardent leur id et leur nom ; leurs stats suivent la règle. |
| Format des objets | `src/contenu/schemas.ts`, `src/contenu/charger.ts` | Champs `rarete`, `palier`, `niveau`, `categorie`, `classes`, `effets_equipement`, `pouvoir_unique`, `pouvoir_id`, `unique_par_partie`, avec vérifications. |
| Équiper | `src/moteur/personnage.ts` (`refusEquipement`), `src/moteur/partie.ts` | Refus si niveau trop bas ou classe non autorisée. Une arme mythique n'existe qu'une fois par partie (`donnerObjet`). |
| Combat | `src/moteur/combat.ts` | Les 6 effets (critique, précision, résistance, touche élémentaire, mana, PV max) et les 16 pouvoirs uniques (`aPouvoir`, `coutMana`). |
| Interface | `src/ui/NomObjet.svelte`, fiche, fiche rapide, boutique | Icône, couleur de rareté, niveau, classes, effets et pouvoir ; bouton « Équiper » grisé avec la raison du refus ; PV et mana max comptent l'équipement. |
| Boutiques | `content/monde/aubeclaire.yaml` | Guilde : les 19 communs du palier I. Comptoir de Halvine : les 19 « de maître » du palier I. |
| Tests | `tests/equipement.test.ts` | Catalogue, raretés par palier, règles d'équipement, unicité des mythiques, effets et pouvoirs en combat. |

Le moteur reste compatible Roblox (`npm run roblox:verifier`). La version Roblox n'affiche pas encore les icônes ni les raretés : c'est à faire côté `roblox/`.

## Équilibrage avec l'équipement (fait)

Le chapitre 1 avait été réglé pour des héros sans équipement. Il est maintenant réglé pour des héros **équipés** :

- **Chaque nouveau héros reçoit l'équipement standard de sa classe** (les 3 objets communs de son niveau, choisis dans `equipement_standard` de `content/config/campagne.yaml`). Un joueur qui rejoint en cours de route reçoit celui de son niveau.
- **La simulation d'équilibrage équipe les héros** de la même façon (`src/moteur/simulation.ts`).
- **Les ennemis sont renforcés** : `renfort_ennemis: { pv: 1.10, degats: 1.08 }` dans `content/config/campagne.yaml`. L'XP et l'or gagnés ne changent pas.
- **Répartition des points retouchée** pour que toutes les classes profitent autant de l'équipement : la masse donne de la Force seulement, le bouclier de l'armure seulement, l'instrument du Charisme et de l'Esprit. Les points d'INT et d'ESP valent plus (×3 au palier I, ×2 au II, ×1,5 au III, ×1,25 ensuite), parce qu'ils rapportent moins en combat que FOR, AGI ou VIT. Les 7 objets d'origine gardent leur id et leur nom, mais leurs stats et leur prix suivent maintenant la règle.

Résultat de `npm run equilibrage` (1 000 combats par cas) : **tous les critères sont respectés**, avec 74,4 % de victoires en moyenne (72,6 % avant l'équipement). Classes de −7,8 (Arcaniste) à +5,1 (Alchimiste).

`npm run equilibrage:equipement` donne une idée de l'effet de l'équipement pour un héros humain seul : environ 54 % de victoires sans équipement, 77 % avec l'équipement commun, 86 % avec l'équipement « de maître ». Un héros qui revend son équipement aura donc du mal.

⚠️ **Parties déjà commencées** : une partie est une liste d'actions rejouée. Les nouvelles règles (héros équipés, ennemis renforcés) changent le déroulé des combats déjà joués. Il vaut mieux commencer une nouvelle partie après la fusion.

## Points laissés ouverts

- Les **prix** suivent une formule provisoire : 20 × points × (1 + niveau ÷ 10). Ils sont à recaler quand l'économie des chapitres 2 à 6 existera.
- Le **palier X** s'appelle ainsi pour l'instant. Si les paliers numérotés montent un jour jusqu'à 10, il faudra le renommer.
- Un **légendaire « exceptionnel » au palier IV** est prévu dans les règles, mais aucun n'a encore été créé.
