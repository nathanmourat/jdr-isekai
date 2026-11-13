# Équipements — armes, tenues, accessoires (validé par le groupe)

Ce dossier contient tout le travail sur l'équipement : la conception, le catalogue de **364 objets** et leurs **364 icônes**. Il a été validé par le groupe.

**Rien n'est encore branché dans le jeu.** Les fichiers sont rangés à part pour ne rien casser : `npm test` passe comme avant. L'intégration dans le moteur reste à faire (voir plus bas).

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
| `equipements.yaml` | **Catalogue au format du jeu** (même format que `content/objets/objets.yaml`, avec des champs en plus) |
| `objets-nommes.yaml` | Noms, histoires et effets des objets nommés, écrits à la main |
| `generer.py` | Recalcule toutes les stats et réécrit le YAML et le tableur |
| `icones/objets/<id>.png` | Les 364 icônes 32 × 32, nommées selon l'id de l'objet |
| `icones/dessiner.py` | Redessine les icônes (même style que `outils/textures/`) |
| `icones/apercu.png`, `icones/apercu-nommes.png` | Planches d'aperçu agrandies |

Pour modifier un nom ou un effet : éditer `objets-nommes.yaml`, puis relancer les deux scripts. Il faut Python 3 avec `pip install pyyaml openpyxl pillow numpy`. Les commandes se lancent depuis le dossier `equipements/` :

```bash
python3 generer.py
```

```bash
cd icones && python3 dessiner.py
```

`generer.py` vérifie tout seul : budget de chaque objet, ids uniques, raretés autorisées par palier, chaque classe équipée à chaque palier, 6 mythiques.

## Intégrer dans le jeu (pour le responsable du projet)

1. **Contenu** : remplacer les 7 objets d'équipement de `content/objets/objets.yaml` par `equipements.yaml`. Les 7 objets existants y sont repris avec le **même id**, donc les sauvegardes et les boutiques restent valides. Seule l'armure de cuir passe de +3 à +4 d'armure.
2. **Icônes** : copier `icones/objets/*.png` dans `assets/icones/objets/`.
3. **Format des objets** (`src/contenu/schemas.ts`) : ajouter les champs `rarete`, `palier`, `niveau`, `categorie`, `classes`, `effets_equipement`, `pouvoir_unique` et `unique_par_partie`.
4. **Équiper** (`src/moteur/partie.ts`, action « équiper ») : refuser si le niveau est trop bas ou si la classe n'est pas dans `classes`. Une arme `unique_par_partie` ne peut exister qu'une fois dans la partie (même principe que les dons).
5. **Combat** (`src/moteur/combat.ts`) : appliquer les 6 effets (`critique`, `precision`, `resistance`, `touche`, `mana`, `vigueur`). Les 16 pouvoirs uniques (10 légendaires et 6 mythiques) sont décrits en texte et sont à coder un par un.
6. **Interface** : afficher la couleur de rareté (gris, vert, bleu, violet, or, rouge), le niveau requis et les classes autorisées.
7. **Boutiques** (`content/monde/aubeclaire.yaml`) : ajouter les communs et peu communs du palier I. Les boutiques des chapitres suivants viendront avec leurs régions.
8. **Vérifier** : `npm test`, `npm run equilibrage` (les stats n'ont été testées que par le calcul, pas encore en combat simulé) et `npm run roblox:verifier`.

## Intégration faite (13/11)

Les 8 étapes ci-dessus sont faites (web et Roblox). Ce qui a changé par rapport au catalogue de départ, après simulation de combats (`npm run equilibrage:equipements`, rapport dans `rapports/equilibrage-equipements.md`) :

- **Toutes les armes ont de la puissance** (avant : seules les armes physiques). Formule : budget ÷ 3, arrondi au plus proche. Les armes communes génériques passent donc de 0 à 1 de puissance.
- **La puissance de l'arme renforce aussi les compétences** (dégâts et soins) et les créatures invoquées, en proportion de l'attaque de base de la classe. Sans cela, les lanceurs de sorts ne gagnaient presque rien à s'équiper (Guérisseur : +4 points de victoires, contre +20 pour les guerriers).
- **Objets nommés** : la caractéristique principale de la classe pour laquelle l'objet est pensé reçoit la plus grosse part des points (ex. Bâton du dispensaire : ESP 2 / INT 1 au lieu de INT 2 / ESP 1).
- 108 objets ont une répartition de points différente. **Aucun budget ni aucun prix ne change.**
- Résultat au palier I : chaque classe reste à ± 10 points de la moyenne, avec les objets communs, « de maître » et nommés.
- Les paliers II à X seront simulés quand les ennemis des chapitres 2 à 6 existeront (aujourd'hui, aucun ennemi ne dépasse le niveau 7).
- Les **16 pouvoirs uniques** sont codés dans `src/moteur/combat.ts` (liste dans `src/moteur/equipement.ts`).

## Points laissés ouverts

- Les **prix** suivent une formule provisoire : 20 × points × (1 + niveau ÷ 10). Ils sont à recaler quand l'économie des chapitres 2 à 6 existera.
- Le **palier X** s'appelle ainsi pour l'instant. Si les paliers numérotés montent un jour jusqu'à 10, il faudra le renommer.
- Un **légendaire « exceptionnel » au palier IV** est prévu dans les règles, mais aucun n'a encore été créé.
