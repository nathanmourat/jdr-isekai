# Changements après le premier test du jeu (version web)

Ce document résume, en français simple, ce qui a changé après le premier test complet (personnage : Daleko, humain, Ombre, réincarné), et **ce que le groupe doit vérifier en jouant**.

- Les 21 changements sont faits et en ligne, sauf les images du graphiste (voir « Images » en bas) : en attendant, le jeu affiche des images provisoires.
- La version Roblox n'a pas été modifiée par ce travail. Elle devra reprendre ces changements (nouveau nom du Grand Prieur, nouvelles règles) de son côté.
- Les anciennes parties se rouvrent (sauvegarde au format 5). Mais comme l'histoire du chapitre 1 a été réorganisée (plus de sauts de temps imposés, quêtes en étapes), **il vaut mieux recommencer une partie** pour tester.

---

## Les changements, un par un

### 1. Caractéristiques expliquées
À la création du héros et sur sa fiche, chaque caractéristique a son nom complet et son effet réel. Exemple : « Force (FOR) : augmente les dégâts des attaques et des compétences de corps à corps qui utilisent la Force (+5 % par point). » Le Charisme indique bien la « présence » en combat et son rôle dans les dialogues.

### 2. Tirage au hasard à la création
Boutons 🎲 « Au hasard » pour la race, la classe et le don, plus « Tout au hasard » (qui tire aussi l'âge d'un invoqué). On peut tout retoucher ensuite. Le tirage du don ne prend que les dons encore libres. L'origine d'enfance d'un réincarné n'a pas de tirage : elle se gagne dans le prologue.

### 3. Messages qui s'effacent
Les messages courts (« Daleko (humain, Ombre, réincarné) rejoint l'histoire. », achats, gains…) apparaissent en bas à droite et disparaissent seuls après environ 6 secondes. Tout reste dans l'onglet Journal.

### 4. Boutique et quête d'initiation
Nouveau lieu dans Lysmont : **Le Comptoir de Halvine**, tenu par **Dame Halvine Corbelet**. L'écran a deux onglets, Acheter et Vendre, avec le prix, votre or, la quantité et une confirmation. La quête « Premiers pas au Comptoir » (disponible après l'examen de la Guilde) fait acheter un objet, revendre une breloque trouvée, puis revenir voir Halvine pour une petite récompense. Le Chaudron Fêlé garde sa nourriture, la Guilde son matériel.

### 5. Temple du Seuil
Le code est prêt pour la nouvelle image. La zone cliquable du Grand Prieur est au centre du décor.

### 6. Parler aux personnages
Dans un lieu, on clique sur un personnage (son portrait, ou sa silhouette sur le décor du Temple) pour lui parler. Un symbole flotte au-dessus de lui : « ! » doré = quête principale, « ! » argenté = quête secondaire, « ? » = quête à rendre. Ces symboles apparaissent aussi sur la carte et sur le plan de la ville. Avant une scène de groupe, le jeu dit clairement s'il manque des joueurs.

### 7. Nouveau nom du Grand Prieur
« Mathis » s'appelle désormais **Auréliath** (identifiant `aureliath`). Le dossier de ses portraits devient `personnages/pnj/aureliath/`.

### 8. Dialogues adaptés
- Le texte dit « tu » quand on joue seul et « vous » en groupe (dans L'Appel, l'examen de la Guilde, la Crypte et les nouvelles scènes).
- Dans trois scènes (L'Appel, l'examen, la Crypte), un personnage **s'adresse à un joueur précis, par son pseudo**. Seul ce joueur répond, parmi 3 réponses adaptées à sa classe ou à sa race. Les autres voient la question et la réponse. Le joueur interrogé est choisi selon sa classe, puis au hasard (le même pour tout le monde).

### 9. Date et jours qui passent
- La date s'écrit « Jour 1 · Germinal (mois 1/12) · An 1012 ». Un clic dessus explique la saison, le sens de « AV » et la prochaine fête.
- En jouant, **un jour passe toutes les 10 minutes de jeu actif**. Sans action pendant 10 minutes, le temps s'arrête. Ce minuteur ne change jamais de mois : il s'arrête au jour 30.

### 10. Ville de Lysmont
Sur la carte, il n'y a plus qu'un point « Ville de Lysmont ». Il ouvre le plan de la ville (provisoire pour l'instant) avec la place, la Guilde, le Chaudron Fêlé, la boutique, le château, le quartier des Tanneurs et l'arène, plus un bouton « Retour à la carte ».

### 11. Grimoire personnel
Chaque héros a son grimoire, privé. Les fusions apprises n'apparaissent que chez lui. À la Guilde, chacun voit seulement les fusions possibles pour sa classe et ses compétences. La fiche a une section « Mon grimoire ».

### 12. Paris en pièces
Parier contre Kaya (examen de la Guilde) retire vraiment 20 pièces, avec des pièces qui s'envolent et « −20 or » en rouge. Si le groupe gagne le combat, la mise et le gain reviennent (« +40 or » en vert) ; sinon la mise est perdue. Sans assez d'or, la réponse est grisée et le jeu explique pourquoi.

### 13. Fiche dépliable
Un clic sur la barre du héros (« Daleko · niv. 1 · rang F · 50 or ») ouvre un panneau avec tout : identité, PV, mana, XP, rang, or, caractéristiques expliquées, compétences, grimoire, trait, passif, équipement, effets en cours et date. Un second clic le referme.

### 14. Compétences expliquées
Partout (fiche et combat), chaque compétence affiche sa description, ses chiffres calculés pour le héros (dégâts, soins, chance de toucher, durée, mana, recharge), son élément, sa cible et **d'où elle vient** (« compétence de départ de l'Ombre », « apprise au niveau 5 », « fusion de ton grimoire »).

### 15. Suspense
Avant le résultat d'une action d'un héros, une jauge monte vers la chance de réussite annoncée pendant environ une seconde, puis affiche « Réussi », « Critique ! » ou « Raté ». Le résultat est toujours celui du moteur. L'option « Animations rapides » (en combat, et dans l'onglet Partie) raccourcit tout.

### 16. Une animation par attaque
Le héros joue son animation d'attaque ou de sort, puis un effet propre à l'élément ou au type apparaît sur la cible (entaille, impact, feu, glace, foudre, soin, poison, rune, bouclier, bonus, malus, critique, sacré, ombre, invocation). Tant que les images ne sont pas livrées, ces effets sont dessinés par le jeu. Un héros invisible devient à moitié transparent.

### 17. Riposte des ennemis
Le jeu attend entre 0,8 et 1,2 seconde avant chaque action d'un ennemi. Chaque ennemi a 2 ou 3 attaques nommées : « Loup gris bondit et mord Daleko à la jambe : 7 dégâts ».

### 18. Les mois passent à l'auberge
Le Chaudron Fêlé est aussi une auberge. Un clic sur le lit propose 1, 3 ou 6 mois, ou « jusqu'à la suite de l'histoire ». **Tous les joueurs présents doivent accepter** ; le jeu affiche « En attente de : … ». Ensuite chacun choisit ses activités de temps libre. L'histoire n'impose plus de saut de temps : les scènes datées (Crypte en Brumaire 1013, Fête des Lanternes, convocation du roi) attendent que le groupe ait dormi. Le saut de fin de chapitre passe aussi par le lit.

### 19. Quêtes et contrats par étapes
Un contrat ou une quête secondaire ne mène plus directement au combat. Exemple, la chasse aux loups : accepter à la Guilde → Combe-aux-Saules → lisière → ruisseau → vieux saule (combat) → retour à la Guilde pour la récompense. Le prochain lieu clignote sur la carte, et l'onglet Quêtes montre l'étape en cours. Les 9 contrats et les quêtes des loups, des Tanneurs et du tournoi sont découpés ainsi. Un héros n'a qu'un contrat en cours à la fois.

### 20. Propositions logiques en combat
Le jeu ne propose que ce que le héros peut vraiment faire (ses compétences, son mana, ses recharges, ses objets) ; c'est vérifié automatiquement pour les 10 classes. Chaque proposition indique son origine.

### 21. Un combat logique
- **Le poison empoisonne** : la cible perd des PV au début de chacun de ses tours, jusqu'à 3 cumuls pour « Lame empoisonnée ». Le journal l'écrit, la cible devient verte avec des bulles, et une icône indique les tours restants. La brûlure fonctionne pareil.
- **Plus c'est puissant, moins c'est sûr** : une attaque de base touche un peu plus souvent (+2 points) ; une compétence perd 1 point par point de mana au-delà de 5 (5 points au plus). La chance est affichée avant de valider.
- **Niveau et entraînement** : un héros de plus haut niveau que sa cible touche plus souvent. Chaque compétence a une **maîtrise** de 0 à 5, qui monte en l'utilisant et avec l'activité « Entraînement » à l'auberge ; elle donne jusqu'à +10 % de dégâts et +5 points de précision.

---

## Ce qui a changé dans les chiffres

- La règle de précision a été adoucie par rapport à la première idée, parce que la simulation montrait qu'elle pénalisait trop les classes qui attaquent.
- Armure du Gardien sacré : 10 → 8. Armure de l'Arcaniste : 3 → 4.
- Simulation relancée (1 000 combats par cas) après la fusion avec le système d'équipement : tous les critères sont respectés, moyenne de victoires à 72 %. La simulation des équipements passe aussi.

## Ce que le groupe doit vérifier en jouant

Recommencez une partie, si possible à plusieurs.

1. **Création** : les boutons 🎲, les explications des caractéristiques ; à deux joueurs, un don pris n'est jamais tiré.
2. **Temple** : le « ! » doré au-dessus du Grand Prieur ; la zone cliquable tombe-t-elle bien sur lui ?
3. **L'Appel** : « tu » en solo, « vous » à plusieurs ; la question du Grand Prieur va-t-elle au bon joueur, avec des réponses qui collent à sa classe ?
4. **Plan de Lysmont** : les lieux sont-ils lisibles sur mobile ?
5. **Examen** : le pari (pièces qui partent, puis qui reviennent en cas de victoire) ; la réponse grisée quand on a moins de 20 pièces.
6. **Combat** : le suspense est-il agréable ou trop long ? Les ripostes sont-elles lisibles ? Le poison se voit-il ? Essayez « Animations rapides ».
7. **Boutique** : acheter plusieurs objets d'un coup, vendre, finir la quête de Halvine.
8. **Auberge** : proposer une durée, refuser, proposer autre chose, accepter. À plusieurs appareils, tout le monde voit-il « En attente de… » ?
9. **Jours** : après 10 minutes de jeu, un nouveau jour doit s'annoncer. À plusieurs, un seul jour doit passer, pas un par joueur.
10. **Contrats** : la chasse aux loups du début à la fin ; le point qui clignote ; le retour à la Guilde.
11. **Grimoire** : apprendre une fusion à la Guilde (il faut deux compétences au rang 2) et vérifier qu'un autre joueur ne la voit pas.
12. **Fiche dépliable** sur mobile.

## Ce qui n'a pas été vérifié

- L'interface a été essayée à la main jusqu'au deuxième tour du premier combat seulement. La boutique, l'auberge, les contrats et la fin d'un pari n'ont été vérifiés que par les tests automatiques.
- Le jeu en ligne à plusieurs appareils (Supabase) n'a pas été essayé, en particulier le minuteur des jours et l'accord pour dormir.
- Le test navigateur automatique (`tests/e2e/parcours.mjs`) a été réécrit pour le nouveau parcours, mais pas relancé.
- Le suspense ne s'affiche que pour les actions des héros qui visent un ennemi.

## Images (branche `textures-v3`)

La branche n'existait pas encore à la fin de ce travail : aucune image n'a été branchée. Le jeu prend les images automatiquement dès qu'elles sont dans `assets/` avec le bon nom ; la liste exacte est dans `docs/LISTE-TEXTURES.md` (section « Nouvelles images demandées après le test 1 »). Quand elles arrivent : `git fetch origin textures-v3`, les copier dans `assets/`, puis `npm run assets:manquants -- --cocher`.
