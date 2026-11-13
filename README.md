# Les Appelés de Velmaris

Jeu de rôle **isekai / fantasy** en 2D, **multijoueur (1 à 6 joueurs)**, entièrement en français, qui se joue dans le navigateur (PC et mobile).

> **État actuel : version jouable 1.** Elle contient la création de personnage, le prologue d'enfance des réincarnés, le **chapitre 1 complet**, les combats, le donjon de la Crypte de la Fontaine, la compagne Aveline, le temps libre, les contrats de guilde et la sauvegarde. Les chapitres 2 à 6 arriveront dans les prochaines mises à jour.

Documents de référence :
- [`docs/CONCEPTION.md`](docs/CONCEPTION.md) : le monde, les classes, les races, les règles et le plan de la campagne.
- [`docs/GRAPHISMES.md`](docs/GRAPHISMES.md) et [`docs/LISTE-TEXTURES.md`](docs/LISTE-TEXTURES.md) : les textures.
- [`rapports/equilibrage.md`](rapports/equilibrage.md) : le dernier tableau d'équilibrage.

---

## 1. Lancer le jeu sur son ordinateur

Il faut **Node.js 22** ou plus récent ([nodejs.org](https://nodejs.org), version « LTS »). Dans un terminal, depuis le dossier du projet :

```bash
npm install
```

```bash
npm run dev
```

Ouvrez ensuite l'adresse affichée (en général http://localhost:5173).

## 2. Jouer

### Créer une partie
- **Partie locale** : elle est enregistrée dans votre navigateur. Elle sert à tester, à jouer seul ou à plusieurs **sur le même appareil**. Dans l'onglet « Partie », le bouton « Ajouter un joueur sur cet appareil » permet de passer d'un joueur à l'autre avec le menu en haut à droite. Plusieurs onglets ouverts sur la même partie restent synchronisés.
- **Partie en ligne** : chacun joue depuis chez soi (voir § 3). Partagez le **code à 6 caractères** affiché dans l'onglet « Partie ».

### Déroulement
1. Chaque joueur choisit un **pseudo**, puis crée son héros : race, classe, don (unique dans la partie) et origine (invoqué ou réincarné).
2. Les **réincarnés** jouent leur prologue d'enfance (onglet « Histoire »), seuls et quand ils veulent.
3. Sur la **carte**, un point doré pulsant indique la quête principale. Cliquez sur un lieu pour lancer une scène, acheter, prendre un contrat ou voir un compagnon.
4. **Scènes de groupe** : chaque joueur présent vote. Quand tout le monde a voté, le choix majoritaire l'emporte ; en cas d'égalité, c'est le **meneur du jour** qui décide. Il peut aussi trancher sans attendre les retardataires.
5. **Combat** au tour par tour : choisissez une action, puis cliquez sur la cible (ou utilisez les boutons). Les héros des joueurs absents sont joués par l'ordinateur, ou restent au camp (réglage dans « Personnage »).
6. **Donjon** : le meneur du jour guide le groupe avec les flèches, ZQSD, un clic ou les boutons à l'écran.
7. **Temps libre** : à chaque ellipse, chacun choisit 2 activités (entraînement, commerce, relation avec un compagnon…).
8. **Mort douce** : une défaite blesse et coûte un peu d'or, mais personne ne meurt pour de bon. L'histoire continue autrement.

Un joueur absent peut rattraper l'histoire dans l'onglet « Journal », qui affiche un résumé **« Pendant votre absence »**.

### Sauvegarde
- La partie s'enregistre **automatiquement** après chaque action.
- Onglet « Partie » → **Exporter la sauvegarde** : vous obtenez un fichier `.json` à garder en lieu sûr.
- Sur l'accueil → **Importer une sauvegarde**. Si vous importez sur un autre appareil, celui-ci reprend tous les joueurs de la partie.

## 3. Jouer en ligne (Supabase, gratuit)

GitHub Pages n'héberge que des pages fixes. Pour que plusieurs joueurs partagent la même partie, on ajoute **Supabase**, une base de données gratuite avec synchronisation en temps réel. À faire **une seule fois**, par une seule personne :

1. Créez un compte sur [supabase.com](https://supabase.com), puis un **nouveau projet** (offre gratuite).
2. Dans **Authentication → Sign In / Providers**, activez **« Allow anonymous sign-ins »**. Les joueurs n'ont ainsi besoin ni d'e-mail ni de mot de passe : un pseudo suffit.
3. Dans **SQL Editor → New query**, collez tout le contenu de [`supabase/schema.sql`](supabase/schema.sql), puis cliquez sur **Run**. Cela crée les tables et les règles de sécurité : seuls les membres d'une partie peuvent la lire et y jouer.
4. Récupérez **deux valeurs** :
   - **L'URL du projet** : cliquez sur le bouton vert **Connect** en haut du tableau de bord. Vous pouvez aussi la construire vous-même : c'est `https://<identifiant>.supabase.co`, où l'identifiant est le code qui suit `/project/` dans l'adresse du tableau de bord (exemple : `https://prvpxypywdhuizdlhbeh.supabase.co`).
   - **La clé publique** : allez dans **Project Settings → API Keys**, rubrique **Publishable key**, et copiez la clé `default` (elle commence par `sb_publishable_…`). Elle est publique par conception, car la sécurité repose sur les règles de l'étape 3. L'ancienne clé « anon » (bouton « View legacy API keys ») fonctionne aussi, mais Supabase la retirera en 2027.
   - ⚠️ **N'utilisez jamais la « Secret key »** (`sb_secret_…`). Ne la mettez ni dans le jeu, ni dans GitHub, ni dans un message : elle donne un accès total à la base.
5. Pour jouer en ligne **depuis votre ordinateur** : copiez `.env.example` en `.env.local`, collez-y les deux valeurs, puis relancez `npm run dev`.
6. Pour **publier le jeu** et l'ouvrir avec un simple lien :
   - sur GitHub, **Settings → Pages → Source : « GitHub Actions »** ;
   - **Settings → Secrets and variables → Actions → onglet Variables** : créez `VITE_SUPABASE_URL` (l'URL du projet) et `VITE_SUPABASE_ANON_KEY` (la Publishable key) ;
   - lancez le workflow « Publier le jeu » depuis l'onglet **Actions** (bouton « Run workflow »). Il se relance ensuite tout seul à chaque mise à jour du jeu. Le site sera à l'adresse `https://<votre-compte>.github.io/jdr-isekai/`.
   - GitHub Pages est gratuit pour un dépôt **public**. Pour un dépôt privé, il faut un abonnement GitHub payant.

> **Limite de l'offre gratuite** : un projet Supabase inutilisé pendant environ une semaine est mis en pause. Il se relance en un clic depuis le tableau de bord Supabase. Les conditions exactes peuvent changer : vérifiez-les sur supabase.com.

### Inviter un joueur
Envoyez-lui le lien du jeu et le **code de la partie**. Il clique sur « Rejoindre », choisit un pseudo et crée son héros. **S'il arrive en cours de campagne, son héros commence au niveau moyen du groupe**, avec des points répartis automatiquement (modifiables ensuite). La partie accepte 6 joueurs au maximum.

## 4. Ajouter du contenu (sans coder)

Tout le contenu se trouve dans **`content/`**, sous forme de fichiers **YAML** lisibles. Pour ajouter quelque chose, il suffit d'**ajouter un fichier** : ils sont tous lus automatiquement.

| Pour ajouter… | Où | Exemple à copier |
|---|---|---|
| Une scène ou une quête | `content/campagne/saison-1/…` | `chapitre-1/secondaires.yaml` |
| Un compagnon (y compris masculin) | `content/compagnons/<id>.yaml` | `aveline.yaml` |
| Un ennemi ou une rencontre | `content/ennemis/…` | `bestiaire-aubeclaire.yaml` |
| Un contrat de guilde | `content/contrats/…` | `chapitre-1.yaml` |
| Un objet ou un cadeau | `content/objets/objets.yaml` | — |
| Un lieu sur la carte | `content/monde/aubeclaire.yaml` | — |
| Une classe, une race, un don | `content/classes/`, `content/races/`, `content/dons/` | — |

Réglages généraux (années par chapitre, niveau maximum, paliers d'affinité, difficulté selon le nombre de joueurs, tailles des sprites) : **`content/config/campagne.yaml`**.

Après une modification :
```bash
npm test
```
Le jeu vérifie **tout** le contenu : champs manquants, scènes qui mènent nulle part, ennemis ou objets introuvables… Les erreurs sont affichées en français, avec le nom du fichier et le champ fautif.

Après l'ajout d'une **classe, d'une race, d'un don ou d'un ennemi**, relancez aussi la simulation d'équilibrage :
```bash
npm run equilibrage
```
Elle fait au moins 1 000 combats par cas. Les règles : chaque classe et chaque race doit rester à ± 10 points de la moyenne, et chaque combinaison classe × race à ± 15 points.

## 5. Déposer des textures

Rangez les images dans **`assets/`**, en respectant les noms et formats de [`docs/GRAPHISMES.md`](docs/GRAPHISMES.md). **Une image manquante est remplacée automatiquement par un provisoire**, donc on peut livrer dans n'importe quel ordre.

- Pour voir ce qu'il reste à faire, par priorité :
  ```bash
  npm run assets:manquants
  ```
  Avec l'option `--cocher`, les cases de `docs/LISTE-TEXTURES.md` sont aussi mises à jour.
- Pour les tuiles d'un donjon, il faut un fichier `assets/tuiles/<nom>.json` qui indique quelle tuile correspond à quoi. Exemple : `assets/tuiles/crypte.json`.
- Les sources des images et leurs licences sont notées dans `assets/CREDITS.md`. Le générateur de textures du groupe se trouve dans `outils/textures/`.

## 6. Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Lancer le jeu en local (rechargement automatique) |
| `npm test` | Tests automatiques (règles, contenu, chapitre 1 joué de bout en bout, sauvegarde) |
| `npm run equilibrage` | Simulation d'équilibrage (rapport dans `rapports/`, tableau en CSV lisible dans Colab) |
| `npm run assets:manquants` | Textures encore à fournir |
| `npm run verifier` | Vérification des types de l'interface |
| `npm run build` puis `npm run preview` | Construire et tester la version publiée |
| `npm run e2e` | Parcours complet dans un vrai navigateur (après `npm run preview` ; nécessite Playwright) |

## 7. Organisation du projet

```
content/      tout le contenu du jeu (YAML)
assets/       textures (PNG) du groupe
src/moteur/   règles du jeu : combat, personnages, affinité, temps, partie (aucun affichage)
src/ui/       écrans (Svelte)
src/rendu/    scènes 2D Phaser : combat en vue de côté, donjon en vue de dessus
src/sync/     synchronisation : locale (navigateur) ou en ligne (Supabase)
src/sauvegarde/  format de sauvegarde et migrations entre versions
supabase/     schéma de la base en ligne
scripts/      équilibrage, textures manquantes
tests/        tests automatiques
docs/         conception, cahier des charges graphique
```

Le principe technique tient en une phrase : **une partie est une liste d'actions**. Chaque navigateur rejoue la même liste avec le même « dé à graine » et obtient exactement le même état. Cette liste sert à la fois de sauvegarde, de synchronisation et de journal.
