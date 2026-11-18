# IA de combat « Proposer mon action » : bilan avant / après (18/11)

L'IA reste **gratuite, hors ligne, dans le navigateur**. Elle ne fixe **jamais** un chiffre : chances, dégâts et mana viennent toujours du moteur (`estimerAction`). L'équilibrage ne bouge pas.

## Comment on mesure

- **Banc d'essai** (`tests/ia/banc.ts`) : 379 phrases écrites à la main, comme des joueurs pressés les tapent. On y trouve des fautes, du langage SMS (« jtape le gob a », « soin a kaya stp »), de l'argot, des majuscules, des phrases sans accents et des phrases longues.
  - Les phrases sont rangées par **intention** et par **difficulté** : 1 = propre, 2 = fautes, SMS ou familier, 3 = long, indirect ou créatif.
  - Elles sont jouées dans **4 combats fixes** (`tests/ia/scenarios.ts`) :
    - un groupe de 4 avec Kaya contre des gobelins et un cultiste au second rang ;
    - un archer seul contre 3 loups ;
    - un gardien et un arcaniste contre le boss Vorthak ;
    - une alchimiste avec une bombe.
  - Pour chaque phrase, on vérifie **l'action entière** : le type d'action, la cible, la compétence et la partie du corps visée.
  - Le banc n'est jamais vu à l'entraînement : le script d'entraînement écarte automatiquement toute phrase identique à une phrase du banc.
- **Erreurs graves** (`tests/ia/evaluer.ts`) :
  - attaquer un allié, ou soigner un ennemi ;
  - soigner ou protéger le mauvais allié ;
  - utiliser une potion ou une bombe sans qu'on l'ait demandé ;
  - fuir sans qu'on l'ait demandé ;
  - attaquer alors que le joueur a écrit « je n'attaque pas » ;
  - viser une partie du corps (action moins sûre) sans qu'on l'ait demandé.
- **Jeu de contrôle** (`tests/ia/controle.ts`) : 60 phrases neuves, écrites **après** les réglages et mesurées une seule fois. Je n'ai rien retouché pour elles. C'est la mesure honnête de ce que l'IA fera face à des phrases inconnues. Le banc, lui, a servi à repérer les erreurs pendant les réglages, donc son 100 % est flatteur.
- Commandes :
  - `npm run ia:banc` (ajouter `--echecs` pour voir les phrases ratées, `--controle` pour le jeu de contrôle) ;
  - `npm run ia:entrainer`.

## Résultats

| | Avant | Après |
|---|---|---|
| **Banc d'essai** (379 phrases) | **62,0 %** | **100 %** |
| Erreurs graves sur le banc | **38** | **0** |
| **Jeu de contrôle** (60 phrases neuves) | 43,3 % (7 erreurs graves) | **88,3 %** (0 erreur grave) |
| Ancien test (69 phrases, intention seule) | 92,8 % | 95,7 % |
| Taille du modèle | 63 Ko | 118 Ko (45 Ko compressé) |
| Réponse sur téléphone (processeur simulé 4 fois plus lent) | — | environ 260 ms, première phrase comprise |

### Par intention (banc d'essai)

| Intention | Phrases | Avant | Après |
|---|---|---|---|
| analyser | 8 | 50,0 % | 100 % |
| attaquer | 50 | 62,0 % | 100 % |
| bombe | 6 | 100 % | 100 % |
| changer de rang | 7 | 85,7 % | 100 % |
| cibles décrites (« le plus faible », « le même »…) | 28 | 53,6 % | 100 % |
| compétence | 56 | 66,1 % | 100 % |
| actions créatives | 15 | 40,0 % | 100 % |
| se défendre | 16 | 81,3 % | 100 % |
| fuir | 12 | 83,3 % | 100 % |
| fusion | 6 | 83,3 % | 100 % |
| hors sujet (« gg », « lol ») | 4 | 75,0 % | 100 % |
| plusieurs actions | 12 | 0 % | 100 % |
| négations | 12 | 66,7 % | 100 % |
| pacifier | 6 | 83,3 % | 100 % |
| potion | 17 | 70,6 % | 100 % |
| protéger | 23 | 56,5 % | 100 % |
| provoquer | 10 | 90,0 % | 100 % |
| hésitations (l'IA doit demander) | 16 | 0 % | 100 % |
| se cacher | 8 | 100 % | 100 % |
| soigner | 48 | 60,4 % | 100 % |
| viser | 16 | 75,0 % | 100 % |
| voler (refus expliqué) | 3 | 100 % | 100 % |

### Par difficulté

| Difficulté | Phrases | Avant (banc) | Après (banc) | Contrôle (après) |
|---|---|---|---|---|
| 1 : propre | 94 | 83,0 % | 100 % | 4 / 4 |
| 2 : fautes, SMS, familier | 214 | 58,4 % | 100 % | 42 / 47 (89 %) |
| 3 : long, indirect, créatif | 71 | 45,1 % | 100 % | 7 / 9 (78 %) |

### Les 7 phrases du contrôle encore mal comprises (aucune n'est grave)

| Phrase | Ce que l'IA fait |
|---|---|
| « fireball sur le cultiste » (mot anglais) | une attaque simple au lieu de Javelot de flamme |
| « Je lance un pot de colle explosive sur le loup B… » | une attaque au lieu de Bombe collante |
| « jesquive » | un refus, au lieu de se défendre |
| « Je tape sur mon bouclier en criant pour que les gobelins viennent sur moi » | une attaque au lieu de la provocation |
| « jvais derriere » | une question, au lieu de changer de rang |
| « je fais quoi » | « incompris » (coûte un essai) au lieu de proposer des idées |
| « il fait beau » | un refus (coûte un essai) : sans danger, mais on aurait préféré « incompris » |

Ces phrases iront dans le corpus au prochain réglage, avec les phrases notées dans le carnet par le groupe.

## Les principales erreurs d'avant (exemples réels)

- « Je soigne le nain », « je soigne le gardien », « soigne Toto » : le soin allait sur **Zed**. La classe, la race et le pseudo n'étaient pas reconnus.
- « Je frappe le gobelin A », « je frappe lui », « frappe » : l'IA choisissait **viser la tête**, qui fait perdre 20 points de chance de toucher.
- « Je prends mes jambes à mon cou » et « je bois pas de potion, je me cache » : l'IA **buvait une potion**.
- « je soigne kaya et après je tape le gobelin b » : l'IA **attaquait** au lieu de soigner.
- « jtape le gobelin », « jlance un eclair sur tt le monde » : phrase incomprise, ou mauvaise intention.

## Ce qui a changé

1. **Nettoyage du langage SMS** (`src/ia/phrase.ts`) : « jtape » → « je tape », « jme » → « je me », « tt » → « tout », « popo » → « potion », « lelfe » → « l'elfe ». « stp » est retiré, et « heal » devient « soigne », ou « soigneur » après « le ».
2. **Découpage de la phrase** : virgules, « puis », « ensuite », « et je… ». L'IA fait **la première action** et dit clairement ce qui ne l'est pas : « Une seule action par tour : « j'attaque » n'est pas fait ce tour-ci. »
3. **Négations** : ce qui est nié n'est jamais fait.
   - « je n'attaque pas » interdit l'attaque ;
   - « pas le A, le C » exclut seulement la cible A ;
   - « pas de potion » exclut seulement la potion ;
   - « surtout pas de feu » exclut seulement le feu.
4. **Cibles** (`src/ia/cibles.ts`) :
   - **Ennemis** : noms avec fautes ou abrégés (« gobelan », « lou a », « vortak »), lettres (« le B »), « le plus faible », « celui qui est presque mort », « le boss », « le mage », « celui du fond », « celui de gauche », « le même », « lui », « je le refrappe ».
   - **Alliés** : nom, **pseudo** du joueur, **classe** (« le mage », « le tank », « la soigneuse »), **race** (« le nain », « l'elfe », « la louve » pour Kaya), « moi ».
   - Quand plusieurs ennemis portent le même nom, l'IA prend le plus blessé et l'écrit (« le plus blessé »).
5. **Questions au lieu de deviner** (sans coût d'essai), avec 2 ou 3 boutons d'actions déjà vérifiées par le moteur :
   - « A ou B » (« boule de feu ou éclair », « je soigne Kaya ou Zed ») ;
   - une cible hors de portée au corps à corps ;
   - « je sais pas », « aide-moi », « une idée ? ».
6. **« J'ai compris : … »** avant de valider, avec les chances du moteur. Le bouton **« Corriger »** permet de réécrire la phrase, sans coût.
7. **Actions créatives**, ramenées à l'action du jeu la plus proche, avec une explication :
   - renverser une table, lancer une chope → attaque ;
   - sable aux yeux, reflet du bouclier → viser la tête ;
   - croche-pied, clous sous les pattes → viser les jambes ;
   - insultes, « venez me chercher » → provocation (ou attaque si le héros ne sait pas provoquer) ;
   - diversion, souffler les bougies → se cacher.
8. **Mots-clés forts** : un verbe évident (« je recule », « je tape », « je fuis ») l'emporte quand le classificateur se trompe. Une **potion** n'est utilisée que si le joueur la demande (ou s'il n'a aucun sort de soin). **Viser** demande une partie du corps nommée.
9. **Classificateur** : il apprend aussi des morceaux de 3 lettres des mots, ce qui le rend tolérant aux fautes. Le corpus est enrichi de tournures familières.
10. **Carnet local** (tiroir « Partie », « Carnet de l'IA de combat ») : il note les phrases incomprises, impossibles, corrigées ou qui ont amené une question. Il reste sur l'appareil seulement (rien n'est envoyé, rien n'entre dans la partie). Le bouton **« Copier le carnet »** permet de l'envoyer pour enrichir le corpus.

## Règles gardées

- La règle des 3 essais est inchangée. Une question de l'IA, « Corriger » et « Observer » ne coûtent pas d'essai.
- **Rejeu des parties** : le journal enregistre l'action calculée par le moteur, pas le texte tapé. Les anciennes parties se rejouent à l'identique, sans changement de format.
- Le code de `src/ia` reste compatible Roblox : `npm run roblox:verifier` passe.

## Tests

- `tests/ia-banc.test.ts` (dans `npm test`) : au moins 95 % sur le banc et 0 erreur grave.
- `tests/e2e/ia-combat.mjs` : un vrai combat où l'on tape 11 phrases variées, sur ordinateur et sur téléphone ; captures dans `rapports/captures-ia/`.

## 15 phrases à essayer au prochain test

1. « jtape le gob le plus blessé stp »
2. « soin a kaya » (ou le pseudo d'un camarade : « soigne Pixel »)
3. « soigne le mage », « soigne le nain », « protège la soigneuse »
4. « je frappe le même »
5. « javelot de flamme sur celui du fond »
6. « boule de feu ou éclair sur le cultiste » (l'IA doit demander)
7. « je bois une potion puis j'attaque » (la potion, et l'IA dit que l'attaque n'est pas faite)
8. « je n'attaque pas, je me défends »
9. « pas le gobelin A, le C »
10. « je renverse la table sur eux »
11. « je lui jette du sable aux yeux »
12. « jsp quoi faire » (trois idées, sans coût)
13. Un guerrier au corps à corps : « je tape celui du fond » (l'IA explique et propose)
14. « jme planque derrière un arbre »
15. « c koi leurs faiblesses » (observer, sans coût)

Après la séance, ouvrez **Partie → Carnet de l'IA de combat → Copier le carnet** et envoyez le texte : ces phrases enrichiront le corpus.
