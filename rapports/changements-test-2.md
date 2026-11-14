# Changements après le deuxième test du jeu (version web)

Ce document résume, en français simple, ce qui a changé après le deuxième test, et **ce que le groupe doit vérifier en jouant**.

- **Les 11 changements sont faits.**
- **Où est le code** : les changements 1 à 9 sont sur la branche commune `claude/festive-mccarthy-ahagx5`. Les changements 10 et 11 (et la fin de ce rapport) sont sur une branche à part, **`claude/test-2-lot-h-fin`**, que Nathan fusionnera quand il aura fini son travail en cours. Tant qu'elle n'est pas fusionnée, le site ne montre pas les changements 10 et 11.
- La version Roblox n'a pas été modifiée. Elle devra reprendre ces changements (voir « Pour la version Roblox »).
- Les anciennes parties se rouvrent (sauvegarde au format 6 sur la branche commune, 7 après la fusion). Mais la scène de l'examen de la Guilde a changé (nouveau pari) : **il vaut mieux recommencer une partie** pour tester.

---

## Les changements, un par un

### 1. Les lieux de la carte répondent au premier clic
**Cause trouvée** : quand on appuie sur un bouton, le site le décale d'un pixel (effet « bouton enfoncé »). Sur la carte, cet effet remplaçait le réglage qui centrait le point : au moment de l'appui, le point sautait de la moitié de sa taille, et le clic tombait à côté.
**Correction** : chaque lieu a maintenant une zone cliquable fixe de 44 × 44 px, centrée sur le point. Le point, le symbole « ! » et le nom sont décoratifs : eux seuls sont animés, et ils ne captent jamais le clic (un nom ne peut donc plus cacher le lieu voisin). Même correction pour les personnages et les zones des décors.

### 2. On parle aux personnages en cliquant sur eux dans le décor
Chaque personnage présent est dessiné sur le décor, les pieds posés à la position prévue par le graphiste, et rangé du fond vers l'avant. Les comptoirs passent devant lui (Bram, Halvine et l'intendant sont bien derrière leur comptoir). Au survol, son nom s'affiche et il s'éclaire ; le « ! » ou le « ? » flotte au-dessus de sa tête. La rangée de portraits a disparu ; il reste une petite liste repliée « Personnes présentes et endroits » pour le mobile et l'accessibilité. Un personnage sans position est placé automatiquement au sol ; sans image, il a une silhouette provisoire.

### 3. La chambre de l'auberge
Dans le Chaudron Fêlé, cliquer sur l'escalier ou sur la porte du haut mène à la chambre. Dans la chambre, le lit ouvre l'écran de repos, et la porte ramène dans la salle. Les zones sont invisibles : le curseur change et un contour apparaît au survol. Même principe pour la porte de la boutique (sortie), le tableau des contrats de la Guilde (ouvre la liste), l'entrée de la crypte et de la grotte.

### 4. Les boutiques s'ouvrent en parlant au gérant
On clique sur le gérant, puis sur « Voir la marchandise ». Gérants : Dame Halvine (Comptoir), Bram (Chaudron Fêlé), Sœur Elianne (Temple) et, à la Guilde, un nouveau personnage : **Maître Barnoul Kestrin, intendant de la Guilde** (costaud, barbe brune, tablier de cuir, registre à la main, sévère). Chaque gérant a une phrase d'accueil. Si le gérant n'est plus là (Bram peut mourir dans l'histoire), la boutique reste accessible directement.

### 5. Des personnages qui ressemblent à leur description
Les descriptions ont été comparées aux images. Détails ajoutés aux descriptions (les images n'ont pas été touchées) : Séraphine (longs cheveux blond pâle, diadème, robe blanche et or), Elianne (cheveux noirs au carré, voile clair, perles bleues), Kaya (queue de loup, bandeau rouge, épée à la hanche), Ferrand (moustache noire, bagues, manteau violet et or), Halvine (boulier à la main), Bram (crâne lisse, grande barbe brune, chope), Tobin (cheveux roux, taches de rousseur, livre), Gareth (salopette bleue, fourche). Auréliath, Rowena et Edmund IV étaient déjà cohérents.
Dans les dialogues, tant que les grands portraits n'existent pas, le portrait est le haut de l'image du personnage (tête et épaules).

### 6. Barre de mana en combat
Une barre bleue sous la barre de vie de chaque héros et de chaque compagnon, dans la scène et dans la liste « Combattants » (avec « 12/20 mana »). Un sort trop cher affiche son coût en rouge. Les ennemis n'ont pas de barre : dans les règles actuelles, leur mana est illimité.

### 7. Pari : chacun choisit, la mise est partagée
Kaya propose 20 pièces pour le groupe. Chaque joueur répond « Je mise » ou « Je ne mise pas ». La mise est répartie entre ceux qui misent, sans virgule (à trois : 7 + 7 + 6 ; les pièces en trop vont aux premiers joueurs). Victoire : chacun récupère le double de sa part. Défaite : la part est perdue. Ceux qui n'ont pas misé ne gagnent et ne perdent rien. Si personne ne mise, Kaya range sa pièce et la scène continue. Le bouton est grisé pour celui qui n'a pas de quoi payer la plus petite part possible ; si, au final, quelqu'un ne peut pas payer sa part, il se retire et les autres se partagent la mise.

### 8. Niveaux des quêtes et des monstres
- En combat, chaque ennemi affiche « Niv. X » à côté de son nom.
- Chaque quête et chaque contrat a un **niveau conseillé**, affiché à la Guilde, dans l'onglet Quêtes et sur la carte. Couleur selon le niveau moyen du groupe : vert (niveau atteint), orange (il manque 1 ou 2 niveaux), rouge (il en manque 3 ou plus), avec une phrase d'aide.
- Avant de lancer un combat « rouge », le jeu demande une confirmation.
- Niveaux donnés : contrats des loups, des herbes et des égouts : 1 ; gobelins, négociation, bandits, chauves-souris : 2 ; araignées et sangliers : 3. Quête principale : 1 au début, 4 pour la crypte et la Fête des Lanternes, 6 pour la convocation du roi. Loups et boutique : 1 ; reliques, apprenti, tournoi : 2 ; Tanneurs et quête d'Aveline : 3.

### 9. Comprendre à quoi sert chaque objet
- **Infobulle** : au survol (0,4 s) sur ordinateur, par un appui long ou le petit « i » sur mobile. Elle donne le type, l'effet en chiffres (« Rend environ 24 PV », « +3 armure »), l'utilité en une phrase et le prix de revente. Les listes d'objets sont donc plus compactes.
- **Objets du sac en combat** : avant, seule la petite potion servait. Maintenant, la potion de soin, la potion de mana, l'antidote et les deux bombes s'utilisent en combat (boutons « 🎒 » dans « Toutes les actions »). Un objet utilisé sort vraiment du sac.
- **Ration de voyage** (option choisie) : il en faut une par héros pour chaque combat hors de la ville. Sans ration, le héros commence le combat fatigué (−15 % de PV). Chaque héros commence avec 3 rations ; on en achète chez Bram et chez Halvine (3 or).
- **Cadeaux** : l'infobulle explique qu'ils augmentent l'affinité. Une fois un cadeau offert, la réaction est retenue et affichée (« Aveline adore ça »).
- **Objets mystérieux** : le livre ancien et la relique douteuse affichent « ??? — effet inconnu ». On découvre l'effet en l'achetant, ou avant, en payant Ferrand 10 pièces. Une fois découvert, toute la partie le sait.
- Le parchemin de retour n'a pas encore d'usage : son infobulle le dit (il n'est vendu nulle part pour l'instant).

---

## Ce que le groupe doit vérifier en jouant

Recommencez une partie, si possible à plusieurs.

1. **Carte et plan de Lysmont** : chaque lieu s'ouvre-t-il au premier clic, sur ordinateur et sur téléphone ?
2. **Temple, Guilde, taverne, boutique, château** : les personnages sont-ils bien placés, à la bonne taille ? Sont-ils faciles à toucher sur téléphone ?
3. **Taverne** : monter par l'escalier, dormir (le lit), redescendre par la porte.
4. **Boutiques** : parler à Halvine, à Bram, à Sœur Elianne et à l'intendant, puis « Voir la marchandise ».
5. **Guilde** : cliquer sur le tableau des contrats ; les niveaux conseillés et leurs couleurs sont-ils clairs ?
6. **Examen de la Guilde** : le pari. À plusieurs, un joueur mise et l'autre non : les pièces partent-elles et reviennent-elles au bon joueur ?
7. **Combat** : la barre de mana, le niveau des ennemis, les boutons « 🎒 » du sac (potion de mana, bombe).
8. **Rations** : faire le contrat des loups avec, puis sans ration. Le message et la perte de PV sont-ils compréhensibles ? Est-ce trop sévère ?
9. **Infobulles** : survol sur ordinateur, appui long et bouton « i » sur téléphone. L'infobulle sort-elle de l'écran quelque part ?
10. **Ferrand** (à la taverne, après l'examen) : faire identifier le livre ancien.
11. **Cadeau** : offrir un gâteau à Aveline, puis vérifier que « adore » reste affiché.

## Ce qui n'a pas été vérifié

- Dans le navigateur, j'ai essayé : le Temple, la Guilde, la taverne et la chambre, les boutiques par gérant, les clics sur la carte et le plan (ordinateur et taille téléphone), une infobulle. **Pas essayé à la main** : le pari à l'écran, le sac en combat, l'identification chez Ferrand, la confirmation du combat « rouge ». Ils sont couverts par les tests automatiques du moteur (146 tests), pas par un essai à l'écran.
- Le test navigateur de la carte (`tests/e2e/carte.mjs`, `npm run e2e:carte`) est écrit mais **n'a pas été lancé** : Playwright n'est pas installé sur ce PC. La même vérification a été faite à la main dans le navigateur.
- Le jeu en ligne à plusieurs appareils (Supabase) n'a pas été essayé.
- Les propositions automatiques du combat (« Suivre le script ») ne proposent pas encore les objets du sac : ils sont dans « Toutes les actions ».

## Équilibrage

- `npm run equilibrage` et `npm run equilibrage:equipements` relancés : tous les critères sont respectés. Les rapports de `rapports/` sont à jour.
- La ration et les objets du sac ne sont pas dans la simulation (elle joue sans sac). À surveiller en jeu : les bombes et les potions de soin rendent les combats plus faciles pour un groupe riche.

## Pour la version Roblox

Le contenu et le moteur sont partagés ; l'interface Roblox doit suivre :
- **Pari** : la scène de l'examen passe par un nœud `pari` et l'action `parier` (sans elle, la scène reste bloquée à ce nœud).
- **Boutiques** : champ `gerant` des lieux ; nouveau PNJ `intendant-guilde`.
- **Objets** : action `objet` avec `item` (sac), rations hors de la ville, `mystere`, action `identifier`, goûts connus.
- **Niveaux conseillés** : champ `niveau` des quêtes et des contrats.
- Sauvegarde au format 6.
- **Attention** : `npm run roblox:parite` échouait déjà avant ce travail (le moteur Luau de `roblox/` n'a pas été régénéré depuis le lot F du test 1). `npm test`, qui vérifie que le moteur reste compatible Luau, passe.

## Changements 10 et 11 (branche `claude/test-2-lot-h-fin`)

### 10. Monter de rang à la Guilde, avec un examen
- Les points de Guilde **ne donnent plus le rang** : ils ouvrent l'examen. Il faut aussi un niveau minimum (E : niveau 3 ; D : 6 ; C : 10 ; B : 15 ; A : 22 ; S : 30).
- Quand c'est possible, un message l'annonce et **Dame Rowena porte un « ! »**. On lui parle : son panneau montre le rang, ce qu'il manque, et le bouton de l'examen.
- **Rangs E et D** : un combat contre un examinateur de la Guilde (le Sergent Maelric, puis la Capitaine Ysolde Brandefer). Aucun danger : en cas de défaite, ni blessure ni or perdu, et on retente le lendemain. Les héros présents et prêts pour le même rang passent le combat ensemble.
- **Rang C** : une épreuve en 4 étapes (escorter un chariot, enquêter aux Tanneurs, affronter le Maître d'armes Corvan Elsterre à l'arène, cérémonie à la Guilde). Elle se joue seul.
- **Rangs B, A, S** : l'examen arrivera avec les prochains chapitres (le jeu le dit).
- Examen réussi : cérémonie avec Rowena, nouveau rang affiché, contrats du rang ouverts.
- **Ancienne partie** : un héros qui avait gagné un rang « automatiquement » repart du rang F (ses points sont gardés) et doit passer l'examen.
- Simulation (`rapports/equilibrage-examens.md`) : en moyenne, 75 % de réussite au rang E, 57 % au rang D, 62 % au rang C, au niveau minimum et sans équipement. **L'écart entre classes est grand** : Arcaniste, Alchimiste et Lame runique ont du mal seuls aux rangs D et C. À surveiller.

### 11. Équipement : malus quand la classe ne maîtrise pas l'objet
- Plus de blocage « Réservé à : … » pour l'équipement courant : tout s'équipe, mais **hors des familles maîtrisées par la classe, il y a un malus**, affiché en orange avant l'achat et avant d'équiper.
  - Arme non maîtrisée : −30 % de dégâts (compétences comprises) et −15 points de chance de toucher.
  - Armure non maîtrisée : la moitié de son armure est perdue, et −2 en Agilité.
  - Bouclier, carquois ou sacoche d'une autre classe : bonus réduits de moitié.
- **Interdits (en rouge), liste proposée** : l'armure lourde pour l'Arcaniste, l'Invocateur et le Guérisseur. Rien d'autre.
- **Réservés** : seulement les objets légendaires et mythiques propres à une classe.
- Familles maîtrisées par classe : tableau dans `docs/CONCEPTION.md` (§ 8). Elles reprennent le catalogue validé par le groupe : un objet prévu pour une classe est toujours maîtrisé par elle.
- Les deux simulations d'équilibrage passent toujours (les tenues de référence sont maîtrisées).

### À vérifier en jouant (après la fusion)
1. Avec 100 points de Guilde et le niveau 3 : le « ! » de Rowena, son panneau, l'examen du rang E. Perdre exprès : aucun or perdu, « revenez demain ».
2. À deux joueurs prêts en même temps : le combat d'examen se joue-t-il bien à deux ?
3. Un contrat de rang E reste-t-il fermé tant que l'examen n'est pas réussi ?
4. Équiper une épée avec une Ombre : le message orange apparaît-il dans la boutique et dans la fiche ? Les dégâts baissent-ils en combat ?
5. Un Arcaniste devant une armure lourde : « Interdit » en rouge, bouton grisé.

### Ce qui n'a pas été essayé à l'écran
Le panneau d'examen de Rowena, le combat d'examen et les messages de malus n'ont été vérifiés que par les tests automatiques (157 tests) et la vérification des types, pas à la main dans le navigateur.

### Pour la version Roblox
Action `examen_rang`, `etat.rangs` (le rang ne se lit plus dans les points : fonction `rangHeros`), contrat `examen_rang`, champ `maitrises` des classes, `messageEquipement`. Sauvegarde au format 7.

## Petits restes
- Les propositions automatiques du combat (« Suivre le script ») ne proposent pas encore les objets du sac.
- Le parchemin de retour n'a pas encore d'usage.
- `npm run e2e:carte` reste à lancer sur un PC où Playwright est installé.
