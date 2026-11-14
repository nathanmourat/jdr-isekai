# Changements du test 3 (version web, 15/11)

Les 14 points demandés après le test 3, en 6 lots (un commit chacun, tous envoyés sur `claude/festive-mccarthy-ahagx5`).
Après chaque lot : `npm test` (192 tests), `npm run build` et le test de la carte (`tests/e2e/carte.mjs`) passent.
Le parcours complet à deux joueurs (`tests/e2e/parcours.mjs`) passe aussi.

---

## Lot A : décors et affichage

### A0. Décors de la taverne et de la Guilde plus détaillés
**Ce qui a changé** : les nouvelles images du graphiste (`taverne.png`, `taverne-avant.png`, `guilde.png`, `guilde-avant.png`) et son outil `outils/textures/hd/scenes_plus.py` sont intégrés. Les `.json` n'ont pas été touchés.
**À vérifier**
- [ ] Au Chaudron Fêlé : le comptoir passe bien devant le tavernier, l'escalier et le lit se cliquent.
- [ ] À la Guilde : Rowena et Barnoul sont derrière le comptoir, le tableau des contrats se clique.

### A1. Encadré « Prochaine étape » repliable (point 1)
**Ce qui a changé** : un bouton ▾ / ▸ replie l'encadré sur une ligne : « Prochaine étape : <lieu> · Niv. X » avec sa couleur. Le choix est retenu pour chaque joueur sur l'appareil. L'encadré se redéplie tout seul quand l'étape change.
**À vérifier**
- [ ] Replier l'encadré, recharger la page : il reste replié.
- [ ] Finir une étape : il se redéplie.

### A2. Noms jamais coupés (point 6)
**Ce qui a changé** : les noms passent à la ligne au lieu d'être coupés (barre du haut sur téléphone, noms des PNJ dans les décors). Dans le combat, un nom trop long réduit sa police (jusqu'à 80 %). Nouveau test `tests/e2e/noms.mjs`, à 360 et à 1280 px, avec le nom le plus long du jeu (« Dame Rowena, maîtresse de la Guilde »).
**À vérifier**
- [ ] « Kaya Lune-Croc » en entier partout : fiche, combat, dialogues, compagnons.

### A3. Message de PNJ coupé en plein écran (point 4)
**Ce qui a changé** : la bulle d'un PNJ ne dépasse jamais l'écran ni ne passe sous la barre du haut. Si elle est trop longue, elle défile, avec « ▼ suite » et un dégradé en bas. Une bordure dorée marque sa fin. Les fenêtres (boutique, examen, temps libre) et la boîte de dialogue ont aussi une bordure basse.
**À vérifier**
- [ ] Chez Dame Halvine, en plein écran : on voit « Voir la marchandise » et la fin de la bulle.
- [ ] Sur téléphone, en portrait et en paysage : idem.

### A4. Fenêtre « Examen de rang » qui restait affichée (point 11)
**Ce qui a changé** : quand une scène, un combat ou une épreuve commence, toutes les fenêtres se ferment (boutique, examen, identification, contrats, lit, bulle) ainsi que le tiroir (grimoire, fiche). Test `tests/activite.test.ts`.
**À vérifier**
- [ ] Lancer l'examen de rang C (épreuve) : la fenêtre se ferme et l'étape s'affiche.
- [ ] Lancer un combat d'examen : rien ne reste par-dessus.

## Lot B : combat lisible (point 3)
**Ce qui a changé** (votre proposition, gardée telle quelle) :
- La dernière action du journal s'affiche sur une ligne en haut. Le bouton 📜 Journal ouvre le journal complet sur le côté.
- La barre d'actions en bas prend au plus 30 % de la hauteur (24 % sur ordinateur, 15 à 27 % sur téléphone). Ses boutons sont courts (icône + nom + mana) et le détail (dégâts, réussite, recharge) s'affiche au survol, ou en appui long sur téléphone. Sur téléphone, les boutons tiennent sur une ligne qu'on fait défiler du doigt.
- « ✍ Proposer » ouvre un petit panneau (texte libre et conseils de l'IA) qui se ferme une fois l'action jouée.
- La scène Phaser s'arrête au-dessus de la barre : les combattants, leurs noms et leurs barres ne sont jamais cachés.
- On choisit la cible en cliquant sur l'ennemi. La liste reste disponible en secours.

Captures avant et après dans `rapports/captures-test-3/` (ordinateur, téléphone 360 × 740 et 740 × 360).
**À vérifier**
- [ ] On voit tout le combat, avec les barres de PV.
- [ ] Appui long sur une compétence (téléphone) : le détail s'affiche sans lancer l'action.

## Lot C : informations au joueur

### C1. Notifications de gain (point 5)
**Ce qui a changé** : de petites bulles de 3 secondes apparaissent en haut à droite (4 au plus, elles ne bloquent pas les clics) : « +1 Potion de soin » avec son icône, « +20 or », « +50 XP », « niveau 3 ! », « +5 points de Guilde », « affinité avec Kaya ↑ », « Réputation Guilde +1 ». Elles viennent de ce que le moteur a vraiment changé, jamais du texte. Chacun voit les gains de son héros, et tout le monde voit les gains de groupe (réputation). Un objet mystérieux reste « ??? ». Les drapeaux d'histoire (flags) ne sont pas notifiés : aucun n'est marqué « important » pour l'instant.
**À vérifier**
- [ ] Chez Gareth : la récompense s'affiche.
- [ ] En coop : je ne vois pas les gains de mon camarade, mais je vois la réputation.

### C2. Payer retire vraiment l'or (point 13)
**Ce qui a changé** : inventaire de tous les choix qui font payer.
- **Un seul choix ne retirait rien** : « Payer un verre à l'un de ses anciens adversaires » (repérage du tournoi, chapitre 1). Il coûte maintenant **2 or**.
- « Payons le prix qu'il demande » (Nadja, chapitre 2) retirait déjà 15 or, mais sans vérifier qu'on les avait : il le vérifie maintenant.
- Les 9 choix payants restent visibles **grisés** quand il manque de l'or, avec la raison (« Pas assez d'or : il faut 100 or (Lise : 40) »). Avant, ils disparaissaient.
- Le prix s'affiche sur le bouton (« Payer un verre… (2 or) »), aussi pour les étapes de contrat (« Lui acheter de l'eau (10 or) »).
- La notification « −2 or » apparaît en rouge (C1).
- Test de contenu `tests/choix-payants.test.ts` : tout choix qui fait payer doit retirer de l'or et vérifier qu'on en a assez.

**À vérifier**
- [ ] Payer un verre : −2 or.
- [ ] Sans assez d'or, le choix est grisé avec la raison.

### C3. PV et mana visibles hors combat (point 12)
**Ce qui a changé** : chaque héros du groupe a deux mini-barres (PV en vert, mana en bleu) dans la barre du haut, repliées avec elle. La fiche « Personnage » affiche les PV et le mana en clair. Avant un combat, si un héros présent a moins de 50 % de ses PV, une confirmation s'affiche : « Attention : <pseudo> n'a que X/Y PV. Se soigner : auberge, Temple ou potion. »
**⚠️ Question pour le groupe** (voir à la fin) : dans le moteur actuel, **les PV ne sont pas gardés d'un combat à l'autre**. Chaque combat commence avec tous les PV, sauf −10 % si le héros est blessé (K.O.) et −15 % sans ration. La confirmation ne se déclenche donc presque jamais.

### C3 bis. PV gardés et récupération (décision du 15/11)
**Ce qui a changé** : les PV restent ceux de la fin du combat. Un héros K.O. se relève avec 20 % de ses PV.
On les récupère :
- **avec le temps** : +10 % des PV max par jour qui passe ;
- **en se reposant** : le lit de l'auberge (et le temps libre) rend tous les PV ;
- **en mangeant** : un repas chaud à l'auberge (3 or, +30 %), ou une ration du sac (+15 %, bouton « Manger » de la fiche) ;
- **avec une potion hors combat** (bouton « Boire » de la fiche) : petite +25 %, normale +47 %, grande +94 % ;
- **en payant les prêtres du Temple** : 15 or, tous les PV, et la blessure est guérie.

Les examens de rang se passent toujours avec tous ses PV, et on retrouve ensuite les PV d'avant. Une notification « +12 PV » s'affiche. Les réglages sont dans `content/config/campagne.yaml` (`soins`).
**À vérifier**
- [ ] Après un combat difficile, la barre de PV du haut reste basse.
- [ ] Repas au Chaudron Fêlé (cadre « Détails » du lieu) : −3 or, +PV.
- [ ] Soins au Temple du Seuil : −15 or, PV pleins.
- [ ] Contrat à deux combats : jouable sans se soigner entre les deux ?

## Lot D : flèches de chemin (point 2)
**Ce qui a changé** : sur le décor d'une zone de chemin, une flèche dorée qui pulse mène à la zone suivante. Elle affiche le nom de la zone et la couleur du niveau conseillé.
- **Aucun nouveau format** : le chemin se déduit de l'ordre des étapes de la quête ou du contrat en cours (par exemple Combe-aux-Saules → Lisière de la Combe → Vieux saule creux). Les lieux en ville (Guilde, auberge) ne comptent pas.
- Sur une zone déjà traversée, la flèche mène **directement** à la zone de l'étape en cours (les zones faites se traversent d'un clic). Sur la zone en cours, une flèche « retour » ramène à la zone précédente.
- Les étapes réussies et les combats gagnés restent acquis.
- Position : clé `suite` (ou `chemin`) et `retour` dans `assets/decors/<decor>.json`. Sinon, bord droit (ou gauche pour le retour), au milieu.
- La zone cliquable fait 64 × 64 px, fixe ; seule la pastille pulse.
- Le déplacement se fait comme les autres : chacun change de lieu de son côté, et les scènes de groupe se lancent comme avant.

**À vérifier**
- [ ] Quête des loups, étape de la tanière : flèche sur la Combe-aux-Saules vers le Vieux saule creux, et flèche retour.

## Lot E : coop (points 7, 8 et 10)

### E1. Choix validé alors que le camarade attendait (point 10)
**Cause trouvée** : avec Supabase, le journal partagé est trié par numéro d'envoi. Quand l'action d'un camarade arrivait **après** la mienne tout en ayant un numéro plus petit (réseau plus lent), elle s'insérait au milieu du journal. Or l'appareil ne lisait que les actions « au-delà de celles déjà connues » : l'action du camarade était **perdue** sur cet appareil. Son vote n'y comptait jamais, et l'appareil restait bloqué.
**Correction** : si le début du journal change, tout est rejoué (`src/sync/rejeu.ts`). Le test `tests/coop-ordre.test.ts` reproduit le bug : l'ancienne méthode perd l'action, la nouvelle non.
- L'écran n'avance qu'à l'arrivée de l'action dans le journal partagé (c'était déjà le cas).
- Si l'envoi échoue, il est retenté automatiquement 3 fois, avec « Connexion lente : votre action est en cours d'envoi… », puis « Action non envoyée, vérifiez la connexion ».
**À vérifier** (à 2 appareils, avec Supabase)
- [ ] Voter presque en même temps : les deux écrans avancent ensemble.

### E2. Montrer les réponses choisies (point 7)
**Ce qui a changé** : après un vote, un encadré reste 3 secondes. Il montre chaque réponse avec les pseudos de ceux qui l'ont choisie, puis « Choix du groupe : … » en doré. Pour un `parole_a` : « <pseudo> a répondu : … ». Le bouton « OK » le ferme plus tôt.

### E3. Dialogue : tout le monde doit valider (point 8)
**Ce qui a changé** : dans une scène de groupe, « Continuer » devient « Prêt ✔ » et affiche « Prêts : 1/2 · en attente de Bruno… ». La scène avance quand tous les joueurs présents ont cliqué. Les absents ne comptent pas. Si quelqu'un ne clique pas, **le meneur peut « Passer quand même » après 20 secondes**. En solo, rien ne change. C'est une action du journal (`pret_dialogue`) : le hasard reste reproductible. **Le moteur a changé** : Nathan doit le reprendre (voir `roblox/README-ROBLOX.md`).
**À vérifier**
- [ ] À 2 : le premier qui clique attend le second.

## Lot F : sexe du héros (point 9)
**Ce qui a changé**
- Création : « Votre héros est… un homme / une femme », avec l'aperçu du portrait.
- Fiche : sexe affiché (« Femme · Elfe · Ombre · Invoquée »), modifiable pendant le premier mois de jeu.
- **Sauvegarde v8** (migration 7→8). Dans une ancienne partie, une fenêtre demande une fois « un homme / une femme » (homme en attendant).
- **Syntaxe des accords** dans le YAML :
  - `{{accueilli|accueillie}}` : le héros concerné (celui qu'un `parole_a` interroge, sinon le seul héros de la scène, sinon le meneur) ;
  - `{{groupe:accueillis|accueillies|accueillis}}` : tout le groupe (masculin pluriel | féminin pluriel | groupe mixte ; la 3e forme est facultative) ;
  - les deux se combinent avec `[[tu||vous]]` : `[[tu t'es {{relevé|relevée}}||vous vous êtes {{groupe:relevés|relevées|relevés}}]]`.
- Chapitre 1 et prologue : **9 tournures accordées** (Appelé/Appelée, « Le golem t'a laminée », « Elle a l'air toute molle », « descendre seule »…). Ces textes étaient presque tous neutres (tu / vous).
- Compagnes : aucun texte ne suppose un héros masculin. Aucune règle de refus selon le sexe (harem libre inchangé).
- Graphismes : une héroïne prend `personnages/races/<race>/portrait-defaut-f.png` s'il existe, sinon le portrait actuel. Les images à dessiner sont ajoutées dans `docs/LISTE-TEXTURES.md` (section « Héroïnes »).

**Reste à faire (chapitres 2 à 6)** : le chapitre 2 a environ 5 tournures au masculin dans des `[[tu||vous]]` à accorder ; les chapitres 3 à 6 sont écrits au « vous », sans accord repéré. Les planches de sprites féminines `personnages/heros/<classe>/f/…` sont prévues mais le jeu ne les lit pas encore.
**À vérifier**
- [ ] Créer une héroïne : Auréliath dit « Bienvenue à Velmaris, Appelée ».
- [ ] Charger une ancienne partie : la question s'affiche une seule fois.

---

## Pour Roblox (Nathan)
Tout est noté dans `roblox/README-ROBLOX.md`, section « À reprendre — test 3 » : action `pret_dialogue`, champs `prets` / `resultatVote` / `reponseParole`, sexe du héros et format v8, action `changer_sexe`, accords `{{…}}`, 9 choix payants. Le dossier `roblox/` n'a pas été modifié en dehors de cette note. `npm run roblox:parite` échouera jusqu'à la régénération du moteur Luau.

## Questions pour le groupe
1. ~~PV entre les combats~~ : **décidé, les PV sont gardés** (voir C3 bis). À surveiller au prochain test : les contrats à plusieurs combats sont plus durs.
2. **Flags importants (C1)** : faut-il notifier certains événements d'histoire (« La princesse vous doit une faveur »…) ? Il faudrait les marquer dans le YAML.
3. **Sprites féminins** : à brancher quand le graphiste livrera les planches `f/`.
