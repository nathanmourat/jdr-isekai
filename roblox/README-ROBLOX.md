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

## Liste de contrôle — étape R1 (parties multijoueur, création du héros)

### Activer la sauvegarde (une seule fois, facultatif pour tester)

Sans ces réglages, le jeu marche quand même, mais les parties sont **perdues à l'arrêt** : un bandeau le signale en bas de l'écran.

1. **Fichier → Publier sur Roblox** (*File → Publish to Roblox*) → crée une nouvelle expérience « Les Appelés de Velmaris ». Elle reste **privée**.
2. **Accueil → Paramètres du jeu** (*Home → Game Settings*) → **Sécurité** (*Security*) → active **« Autoriser l'accès de Studio aux services API »** (*Enable Studio Access to API Services*) → **Enregistrer**.

### Tester à deux joueurs dans Studio

1. Onglet **Test** → **Clients et serveurs** (*Clients and Servers*) → choisis **2 joueurs** → **Démarrer** (*Start*). Trois fenêtres s'ouvrent : le serveur, Player1 et Player2.
2. Fais les vérifications ci-dessous dans les fenêtres Player1 et Player2.

- [ ] L'écran d'accueil « Les Appelés de Velmaris » s'affiche.
- [ ] **Player1** : crée une partie → l'écran « Création de ton héros » s'affiche avec un **code à 6 caractères**.
- [ ] **Player1** : clique sur « Créer mon héros » sans nom → bandeau rouge « Donne un nom à ton héros. » (un clic dessus le ferme).
- [ ] **Player1** : crée un héros (nom, race, classe, don) → la **fiche** s'affiche (date, prochaine étape, caractéristiques, joueurs, journal).
- [ ] **Player2** : entre le code → « Rejoindre » → dans la liste des dons, celui de Player1 est **grisé**, avec « pris par … ».
- [ ] **Player2** : crée son héros → chez **Player1**, la liste « Joueurs » montre Player2 🟢 **sans recharger**.
- [ ] **Player2** : « Quitter la partie » → chez Player1, Player2 passe en ⚪ (absent).
- [ ] **Player2** : « Mes parties » → la partie est listée → un clic la reprend, et Player2 repasse en 🟢.
- [ ] Avec la sauvegarde activée : arrête le test, relance-le → « Mes parties » → la partie revient avec les héros.
- [ ] Aucune ligne rouge dans Output (fenêtres du serveur et des joueurs).

## Liste de contrôle — étapes R2 à R5 (tout le chapitre 1 sur Roblox)

Fais d'abord la liste R1 ci-dessus, puis continue avec la même partie.

**Lysmont en 3D (R2)**
- [ ] Après la création du héros, on voit Lysmont : place avec fontaine, temple blanc, château, Guilde (toit bleu), taverne, arène, quartier des Tanneurs, ferme de la Combe-aux-Saules, crypte, reliés par des chemins.
- [ ] Au-dessus du Temple du Seuil : ⭐ (quête principale). Le bandeau du haut indique « ➤ Prochaine étape : Écouter le Grand Prieur… », avec un bouton **Y aller**.
- [ ] « Y aller » te place devant le temple. Approche-toi de la porte, appuie sur **E** (« Entrer ») : le panneau du lieu s'ouvre à droite.
- [ ] Menu du haut : **Carte**, **Personnage**, **Compagnons**, **Quêtes**, **Journal**, **Partie** ouvrent chacun leur panneau.

**Dialogues et votes (R2)**
- [ ] Au temple : « Lancer » la scène de l'Appel → la boîte de dialogue s'affiche en bas, et « Continuer ▸ » fait défiler les répliques.
- [ ] À deux joueurs : chacun vote, les votes s'affichent (« Votes : … »), la scène avance quand tout le monde a voté. Le meneur peut aussi « Trancher ».

**Combats (R3)**
- [ ] Guilde → examen d'entrée → « ⚔ Au combat ! » → la caméra montre l'arène : héros à gauche, golem à droite, barres de PV.
- [ ] À ton tour : « 📜 Suivre le script » propose 3 actions. « ✍️ Proposer mon action » : écris « je vise la tête du golem » puis « Proposer » → l'IA comprend et propose « Valider ».
- [ ] Écris 3 fois n'importe quoi → au 3ᵉ essai, le jeu t'oblige à choisir parmi ses propositions.
- [ ] « ▸ Toutes les actions » : Attaque, compétences, potion, se défendre, fuir…
- [ ] Les pions avancent quand ils attaquent, clignotent en rouge quand ils sont touchés, et tombent quand ils sont K.O.
- [ ] Victoire → bilan → « Continuer » → retour à Lysmont.

**Donjon, temps libre, fin de chapitre (R4)**
- [ ] Crypte de la Fontaine : vue de dessus, brouillard, boule dorée = le groupe. Le meneur se déplace avec les flèches à l'écran ou ZQSD.
- [ ] Temps libre (après certaines scènes) : chacun choisit ses activités, puis « Ce qui s'est passé », puis « Reprendre l'aventure ».
- [ ] Panneau Personnage : « +1 » sur une caractéristique et « Améliorer » une compétence quand on a des points ; équiper ou vendre un objet.
- [ ] Panneau Compagnons : Aveline, son palier (Inconnue → … → Amie fidèle → Lien indéfectible), cadeaux, « L'emmener en combat ».

**Version tout public (R5)**
- [ ] Aucune scène ni aucun texte romantique. Aveline est une amie et une compagne d'armes.

## Publier sur Roblox (quand tout marche)

1. **Fichier → Publier sur Roblox**, si ce n'est pas déjà fait.
2. Sur le site Roblox (*Creator Dashboard*), ouvre ton expérience :
   - remplis le **questionnaire de maturité et de conformité** (*Maturity & Compliance*). Le jeu contient des combats fantastiques sans sang réaliste et aucune romance, mais réponds honnêtement à chaque question ;
   - laisse l'expérience **privée**, ou ouvre-la seulement à tes amis, tant que vous testez.
3. Relis les règles actuelles de Roblox (*Community Standards* et la page *Content Maturity* de la documentation Create) au moment de publier : elles changent régulièrement.

Une expérience qui n'a pas rempli le questionnaire n'est visible que par toi et ton équipe.

## Pour les développeurs (commandes depuis la racine du dépôt)

| Commande | Rôle |
|---|---|
| `npm run roblox:contenu` | Régénère `contenu.lua` après une modification de `content/` |
| `npm run roblox:moteur` | Retraduit le moteur en Luau après une modification de `src/moteur/` (nécessite `npm install` à la racine et dans `roblox/`) |
| `npm run roblox:verifier` | Vérifie que le moteur reste compatible Luau (aussi lancé par `npm test`) |
| `LUNE=chemin/vers/lune npm run roblox:parite [graine]` | Test de parité web / Roblox avec [Lune](https://github.com/lune-org/lune) (graines : chapitre, alpha, bravo, desordre…) |
| `LUNE=… npx tsx scripts/roblox-parite-ia.ts` | Parité de l'IA maison (69 phrases + script) |
| `POINTS=0,3,6,… LUNE=… npm run roblox:parite` puis `lune run parite/interface.luau` (dans roblox/) | Appelle sous Lune toutes les fonctions du moteur utilisées par l'interface, sur des états réels |

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

## Où en est le portage

- **R0 à R5 écrits** (13/11) : tout le chapitre 1 est jouable sur Roblox, à vérifier dans Studio avec les listes ci-dessus.
- Plus tard : vrais modèles 3D et animations (le groupe peut remplacer les blocs), images des portraits dans les dialogues, sons, chapitres 2 à 6 (ils arriveront en même temps sur le web et sur Roblox, grâce au moteur commun).
