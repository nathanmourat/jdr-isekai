# Saison 1 complète — ce qui a été ajouté (14/11)

La saison 1 est jouable du début à la fin, **sur le web et sur Roblox**, avec le même moteur.
Elle va du chapitre 1 (« L'Appel », 1012) au chapitre 6 (« Le Souverain des Cendres », 1030) et se termine par le combat contre Orvan et une des 4 fins.

## En résumé

| Chapitre | Région | Niveaux | Ce qui s'y passe |
|---|---|---|---|
| 2 — Les Routes du Sud (1015-1018) | Marche des Sables (Qarzim) | 8 → 15 | Caravane, Grand Bazar, complot contre Séraphine, Ruines de Sel, révolte des Ourvalis. Kaya et Nadja. |
| 3 — La Forêt qui se souvient (1018-1021) | Sylvenoire (Ithrael) | 15 → 22 | Domaines, Reine-Sève, Bibliothèque des Racines, Nuitlongue et Morra (l'achever ou l'épargner). Elianne et Ilyssë. |
| 4 — Feu et Écailles (1021-1024) | Monts Grisfer (Karak-Dûm) et Archipel des Brumes (Port-Vérane) | 22 → 28 | Mille Marches et le Registre des Appels, Nid des Wyrms, Morra déserte, choix : révéler ou garder le secret de l'Ordre. Ysoria et Morra. |
| 5 — La Guerre des Cendres (1024-1027) | Mur d'Aube (Fort-Aube) | 28 → 34 | Chute du Mur (des PNJ peuvent mourir selon vos alliances), épreuve du rang S, Aldric, contre-offensive. Fin des quêtes des compagnes, ultimes. |
| 6 — Le Souverain des Cendres (1027-1030) | Terres Cendrées (Citadelle d'Obsidienne) | 34 → 40 | Cendrebourg, le souvenir du Premier Appel, la Citadelle, Orvan en 3 phases, les 4 fins et les épilogues. |

Chaque chapitre a : sa quête principale, 3 à 5 quêtes secondaires, 3 à 5 contrats de Guilde, ses ennemis (calibrés par simulation), ses boutiques (paliers II à VI), ses phrases d'ambiance, et des scènes pour les compagnes.

**Les 4 fins** se votent à la toute fin. Seules les fins possibles sont proposées :
- **A. Le Sceau** : secret de l'Ordre révélé au chapitre 4, et Ilyssë ou Elianne au moins « Alliée » ;
- **B. Le Pacte** : Orvan épargné, Morra « Amoureuse » chez au moins un héros, Cendrebourg épargné, réputation d'au moins 30 chez les elfes, les nains et les dragons ;
- **C. La Couronne** : toujours proposée (victoire militaire, mais le Voile s'effrite) ;
- **D. Le Retour** : Ilyssë « Proche » et le Voile étudié au Phare noyé (chapitre 4) ; chaque joueur choisit ensuite de rester ou de partir.

Après la fin : un épilogue pour chaque compagne, puis un **épilogue personnel** pour chaque héros, au château de Lysmont.

## Nouveautés du moteur

- **Aiguillage** dans les scènes : la suite se choisit toute seule selon vos choix passés (par exemple, la Maréchale meurt si vos troupes de domaine sont trop faibles).
- **Épuisement** : après 80 tours, les coups portent de plus en plus fort, pour qu'aucun combat ne dure à l'infini. Cela ne change rien à l'équilibrage du niveau 1 (vérifié : tous les critères respectés).
- **Porte de secours** des donjons : après 3 défaites, on peut ressortir et l'histoire continue.

## Ce qui est vérifié automatiquement

- 149 tests, dont un robot qui joue **toute la saison** de bout en bout, et un test qui vérifie les conditions des 4 fins.
- Équilibrage général (niveau 1) : ✅ tous les critères respectés.
- Équilibrage des chapitres 2 à 6 : aucun combat « trop dur ». Beaucoup de combats ordinaires des chapitres 2 à 4 sont « trop faciles » en solo (plus de 99,5 % de victoires), comme au chapitre 1 que le groupe a trouvé bien ; les boss restent entre 55 et 95 %. À ajuster si le groupe s'ennuie. Rapports : `rapports/equilibrage-chapitres-N.md`.
- Roblox : le moteur Luau donne exactement le même état que le web sur toute la saison (parité Lune) ; compilation sans erreur.

## Liste de vérification pour le groupe (web)

- [ ] Fin du chapitre 1 → dormir au Chaudron Fêlé → le chapitre 2 commence au château.
- [ ] La carte du monde affiche les onglets des régions au fur et à mesure qu'elles s'ouvrent.
- [ ] Chaque ville a son auberge (lit), sa boutique et son comptoir de Guilde (contrats de la région).
- [ ] Les quêtes de classe (étape 1 au chapitre 2, étape 2 au chapitre 4, étape 3 au chapitre 5) : l'ultime apparaît au niveau 30.
- [ ] Les compagnes : chacune a sa quête personnelle ; une fois terminée, le palier « Engagée » devient possible.
- [ ] Chapitre 5 : selon vos alliances, la Maréchale Corvin ou le capitaine Vaelor peuvent mourir ; ils disparaissent alors des décors.
- [ ] Chapitre 6 : brûler Cendrebourg fait partir Morra (et ferme la fin « Le Pacte »).
- [ ] Combat final : 3 phases ; puis épargner ou achever Orvan ; puis le vote de la fin.
- [ ] L'écran « Fin de la saison 1 » affiche le nom de la fin ; chaque joueur trouve son épilogue au château.

## Ce qui reste à faire

- **Images** : les nouvelles régions, les décors, les PNJ et les monstres utilisent des images provisoires (générées automatiquement). Les listes des images à dessiner sont à compléter dans `docs/LISTE-TEXTURES.md` pour les chapitres 2 à 6.
- **Roblox** : à tester dans Studio avec les listes de contrôle de `roblox/README-ROBLOX.md` (chapitres 2 à 6).
- Les changements 10 (examens de rang) et 11 (maîtrises d'équipement) du test 2 restent à faire (session web).
