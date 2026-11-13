# Équipements — armes, tenues, accessoires (validé par le groupe)

Ce dossier contient tout le travail sur l'équipement : la conception, le catalogue de **364 objets** et leurs **364 icônes**. Il a été validé par le groupe.

**L'équipement est branché dans le jeu** (sur la branche `equipements`) : catalogue, icônes, règles pour équiper, effets en combat, pouvoirs uniques, interface et boutiques de Lysmont. `npm test` passe (110 tests, dont 10 sur l'équipement). Un seul point reste à trancher : l'**équilibrage** (voir plus bas).

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
| Contenu | `content/objets/equipements.yaml`, `content/objets/objets.yaml` | Les 364 objets. Les 7 anciens gardent leur id (sauvegardes compatibles) ; l'armure de cuir passe à +4 d'armure. |
| Format des objets | `src/contenu/schemas.ts`, `src/contenu/charger.ts` | Champs `rarete`, `palier`, `niveau`, `categorie`, `classes`, `effets_equipement`, `pouvoir_unique`, `pouvoir_id`, `unique_par_partie`, avec vérifications. |
| Équiper | `src/moteur/personnage.ts` (`refusEquipement`), `src/moteur/partie.ts` | Refus si niveau trop bas ou classe non autorisée. Une arme mythique n'existe qu'une fois par partie (`donnerObjet`). |
| Combat | `src/moteur/combat.ts` | Les 6 effets (critique, précision, résistance, touche élémentaire, mana, PV max) et les 16 pouvoirs uniques (`aPouvoir`, `coutMana`). |
| Interface | `src/ui/NomObjet.svelte`, fiche, fiche rapide, boutique | Icône, couleur de rareté, niveau, classes, effets et pouvoir ; bouton « Équiper » grisé avec la raison du refus ; PV et mana max comptent l'équipement. |
| Boutiques | `content/monde/aubeclaire.yaml` | Guilde : les 19 communs du palier I. Comptoir de Halvine : les 19 « de maître » du palier I. |
| Tests | `tests/equipement.test.ts` | Catalogue, raretés par palier, règles d'équipement, unicité des mythiques, effets et pouvoirs en combat. |

Le moteur reste compatible Roblox (`npm run roblox:verifier`). La version Roblox n'affiche pas encore les icônes ni les raretés : c'est à faire côté `roblox/`.

## ⚠️ À trancher : l'équilibrage du chapitre 1

`npm run equilibrage` ne change pas (la simulation fait combattre des héros sans équipement). La nouvelle commande `npm run equilibrage:equipement` mesure l'effet de l'équipement du palier I (héros seul, niveau 1, rencontres de référence) :

| | Sans équipement | Commun | De maître |
|---|---|---|---|
| Moyenne des victoires | 75,6 % | 86,8 % | 92,4 % |
| Classe la plus basse | Lame runique 71,7 % | Invocateur 76,7 % (−10,1) | Invocateur 78,7 % (−13,7) |
| Classe la plus haute | Ombre 80,7 % | Barde 95,9 % | Barde 99,6 % |

Deux conséquences :
1. **Le chapitre 1 devient plus facile** quand les héros sont équipés. Les ennemis ont été réglés pour des héros sans équipement.
2. **L'Invocateur profite moins de l'équipement** : ses créatures ne profitent pas de ses objets. Avec l'équipement « de maître », il sort de la règle des ± 10 points.

Pistes (à décider avec le groupe) : régler les ennemis du chapitre 1 en supposant un équipement commun ; faire profiter les invocations d'une partie des stats du maître ; ou baisser les points du palier I.

## Points laissés ouverts

- Les **prix** suivent une formule provisoire : 20 × points × (1 + niveau ÷ 10). Ils sont à recaler quand l'économie des chapitres 2 à 6 existera.
- Le **palier X** s'appelle ainsi pour l'instant. Si les paliers numérotés montent un jour jusqu'à 10, il faudra le renommer.
- Un **légendaire « exceptionnel » au palier IV** est prévu dans les règles, mais aucun n'a encore été créé.
