# Les Appelés de Velmaris — version Roblox

Portage du jeu sur Roblox, en 3D simple. Les compagnes restent des **amies** : sur Roblox, la romance n'est autorisée que dans les expériences 17+ avec vérification d'identité, donc on fait une version tout public.

## Comment c'est construit

```
content/*.yaml  ──(npm run roblox:contenu)──►  roblox/src/shared/contenu.lua   (les données du jeu)
src/moteur/*.ts ──(npm run moteur)──────────►  roblox/src/shared/moteur.lua    (les règles, traduites en Luau)
roblox/src/server/  : le serveur Roblox (la partie, les sauvegardes)
roblox/src/client/  : ce que voit chaque joueur (interface, 3D)
```

- **Un seul moteur pour le web et Roblox.** Les règles (combat, quêtes, affinité…) sont écrites une seule fois, en TypeScript, dans `src/moteur/`. L'outil TypeScriptToLua les traduit en Luau pour Roblox. Une correction faite dans le moteur profite donc aux deux versions.
- **Test de parité.** Un robot joue tout le chapitre 1 en TypeScript, puis le moteur Luau rejoue les mêmes actions. Les deux états finaux doivent être identiques, au point près. C'est vérifié avec 5 graines de hasard différentes.
- `moteur.lua` et `contenu.lua` sont **générés** : on ne les modifie jamais à la main. Ils sont déjà dans le dépôt, donc tu n'as pas besoin de les régénérer pour tester.

## Installer (une seule fois)

Il te faut : Node.js, VS Code avec les extensions **Rojo** et **roblox-ts**, Roblox Studio et Rojo. Tu as déjà tout ça.

1. Récupère la dernière version du dépôt (`git pull`, ou « Fetch / Pull » dans GitHub Desktop), sur la branche `claude/festive-mccarthy-ahagx5`.
2. Dans VS Code : **Fichier → Ouvrir le dossier** → choisis le dossier **`roblox`** du dépôt (pas ton ancien dossier d'essai `velmaris-roblox`).
3. Copie ton `rojo.exe` dans ce dossier `roblox` (il est ignoré par Git).
4. Dans le terminal de VS Code :

```bash
npm install
```

## Lancer et tester dans Studio

1. Terminal 1, pour traduire le code à chaque sauvegarde :

```bash
npm run watch
```

2. Terminal 2, pour envoyer le code à Studio :

```bash
.\rojo.exe serve
```

3. Dans Roblox Studio : **Nouveau → Baseplate**, puis **Plugins → Rojo → Connect**.
4. **View → Output** pour afficher la sortie, puis **Play** ▶.

## Liste de contrôle — étape R0 (le moteur tourne dans Roblox)

Dans Output, tu dois voir, dans l'ordre :

- [ ] `[Velmaris] Contenu chargé : OK`
- [ ] `[Velmaris] 1er Germinal 1012 AV — partie « Partie d'essai »`
- [ ] deux lignes `Héros :`, pour Kael (Humain, Lame runique) et Ilo (Elfe, Arcaniste élémentaire)
- [ ] `Prochaine étape : Écouter le Grand Prieur au Temple du Seuil.`
- [ ] une suite de lignes `[Combat] …`, l'examen de la Guilde joué automatiquement
- [ ] `Résultat : victoire en … tours`
- [ ] `Le moteur fonctionne dans Roblox !`
- [ ] aucune ligne rouge (erreur)

S'il y a une ligne rouge, envoie une capture de la fenêtre Output.

## Pour les développeurs (commandes depuis la racine du dépôt)

| Commande | Rôle |
|---|---|
| `npm run roblox:contenu` | Régénère `contenu.lua` après une modification de `content/` |
| `npm run roblox:moteur` | Retraduit le moteur en Luau après une modification de `src/moteur/` (nécessite `npm install` à la racine et dans `roblox/`) |
| `npm run roblox:verifier` | Vérifie que le moteur reste compatible Luau (aussi lancé par `npm test`) |
| `LUNE=chemin/vers/lune npm run roblox:parite [graine]` | Test de parité web / Roblox avec [Lune](https://github.com/lune-org/lune) |

### Règles d'écriture du moteur (pour qu'il reste identique en Luau)

En Luau, `0` et `""` sont « vrais », l'ordre des clés d'une table n'est pas garanti et il n'y a ni expressions régulières ni `JSON`. Dans `src/moteur/` :

- écrire des conditions explicites (`x > 0`, `x !== undefined`) ou utiliser `vrai(x)` ;
- utiliser `cles`, `valeurs`, `entrees`, `trier` et `copieProfonde` de `src/moteur/outils.ts` ;
- ne pas utiliser `Object.keys/values/entries`, `.sort`, `structuredClone`, `JSON`, les regex, ni `.filter(Boolean)`.

`npm run roblox:verifier` signale tout écart, et `npm test` échoue s'il en trouve.

### Retouches automatiques du code traduit

`roblox/outils/plugin-luau.cjs` et `roblox/outils/apres-compilation.cjs` corrigent ce que TypeScriptToLua ne gère pas pour Roblox :
- les opérations sur les bits passent par `bit32` ;
- les conditions `a ? b : c` sont mises entre parenthèses (sans elles, la suite du calcul était avalée) ;
- `debug.getinfo` n'est plus utilisé ;
- `_G.pcall` et les fonctions de ce type sont remplacés par les fonctions de base.

## Étapes suivantes

- **R1** : vraie partie multijoueur (code à 6 caractères), sauvegarde DataStore, création du héros à l'écran.
- **R2** : Lysmont en 3D, carte, dialogues et votes.
- **R3** : combats en 3D, IA maison.
- **R4** : crypte, temps libre, fin du chapitre 1.
- **R5** : version tout public et publication.
