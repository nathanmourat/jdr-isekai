# Races — V2 (proposition à valider par le groupe)

> Nouvelles races jouables proposées pour la **V2** : les **Anges** et les **Vampires**.
> Elles s'appuient sur la [cosmologie V2](COSMOLOGIE-V2.md). **Rien n'est encore dans le jeu** : la décision revient au groupe.
> Pas de « demi-ange » : les demi-démons restent une particularité.

---

## 1. Les Anges — « les Orphelins du Ciel »

### Histoire
Avant la Rupture, les dieux avaient des **messagers** : des êtres faits d'éther pur, qui agissaient pour eux dans le monde. Quand le Voile est tombé, ceux qui se trouvaient **du côté du monde** ont été **coupés de leurs dieux** par l'Interdit. Ils sont restés, orphelins, avec un pouvoir qui s'épuise lentement de génération en génération.

### Apparence
- Des **ailes** de plumes ou de lumière, plus ou moins vives selon la force de leur lignée.
- Un **stigmate** visible du dieu que servaient leurs ancêtres : un ange d'**Ossaria** a les ailes grises et une lueur de lanterne au front ; un ange de **Célestre** porte une couronne de rayons ; un ange de **Silhen** a des plumes qui se fondent dans l'ombre.

### Société et divisions
Ils sont peu nombreux, longévifs, et divisés par la grande question de Velmaris : **que faire du Voile ?**
- **Les Gardiens** pensent que le Voile protège le monde. Ils le défendent et sont alliés de l'**Ordre de la Lumière Sereine**. C'est la base naturelle d'un futur **État de la Lumière**.
- **Les Exilés** veulent percer le Voile pour retrouver leurs dieux, quitte à s'allier avec ceux qui veulent le détruire, Légion Cendrée comprise.

### Version de la Rupture
« Nous étions là. Nous avons vu la lumière immobile arriver. Puis la porte s'est fermée. »
Ce sont les **seuls témoins vivants**, mais leur mémoire de ce jour-là est **brisée**. Personne ne sait si c'est un effet du Voile… ou une précaution des dieux.

### Relations
- **L'Ordre** les vénère presque, et voit dans les Gardiens la preuve que la Lumière est bonne.
- **Les démons et les demi-démons** sont leurs ennemis naturels, sauf pour certains Exilés.
- **Les vampires** se méfient d'eux, et c'est réciproque.
- **Les dragons** les traitent comme de lointains collègues tombés en disgrâce.

### En jeu
| | |
|---|---|
| **Modificateurs** | **ESP +2, AGI +1, FOR −1, VIT −1, INT −1** (somme = 0) |
| **Trait** | **Grâce céleste** |
| **Avantage** | *Ailes* : +5 % d'esquive ; résiste au **sacré** (25 %) |
| **Défaut** | *Éther qui s'épuise* : **+25 % de dégâts d'ombre** reçus |
| **Calque graphique** | Ailes (couleur selon le dieu de la lignée), légère lueur |
| **Effets narratifs** | Réactions fortes des prêtres de l'Ordre et des démons ; dialogues spéciaux avec Elianne et Morra |

---

## 2. Les Vampires — « les Refusés »

### Histoire
Pendant le chaos de la Rupture, un peuple entier a **refusé de passer** quand **Ossaria** (la Mort) est venue le chercher. Contre toute attente, la Mort a reculé. Mais elle a laissé une marque : les Refusés vivent, presque sans fin, **sans mana propre**. Pour survivre, ils doivent **prendre la vie des autres**, c'est-à-dire leur mana, à travers le sang.

### Apparence
- Une peau pâle et des yeux qui reflètent la lumière comme ceux des chats.
- Des crocs discrets, visibles seulement quand ils ont faim.
- Ils **n'ont pas d'ombre sous la lumière d'une lanterne d'Ossaria** : c'est ainsi qu'on les démasque pendant la Fête des Lanternes.

### Société
- Une **aristocratie de la nuit** : des familles anciennes, des pactes et des dettes de sang.
- Ils sont à la fois **craints et utiles** : banquiers, diplomates, espions, conseillers de cour.
- Leur grand dilemme : **se nourrir sans devenir des monstres**. Les « Sobres » boivent peu et par contrat ; les « Affamés » chassent.
- Ils sont proches d'**Umbrë**, le dieu des ténèbres, qu'ils honorent sans lui devoir leur existence.

### Version de la Rupture
« La Mort a eu peur, ce jour-là. Nous avons vu qu'elle pouvait reculer. »
Pour eux, rien n'est définitif, pas même la mort, et encore moins le Voile.

### Relations
- **L'Ordre** les chasse ; **les cultes des Cendres** les courtisent.
- **Les anges** s'en méfient, et c'est réciproque.
- **Les Vulpins** commercent volontiers avec eux, et **les nains** refusent de leur vendre des armes.
- Une partie des vampires pourrait former un domaine nocturne, ou se cacher dans les cours des royaumes humains (à décider avec les États).

### En jeu
| | |
|---|---|
| **Modificateurs** | **FOR +1, AGI +1, CHA +1, ESP −2, VIT −1** (somme = 0) |
| **Trait** | **Soif de vie** |
| **Avantage** | *Vol de vie* : récupère **12 % des dégâts infligés** en PV ; voit dans le noir |
| **Défaut** | *Malédiction d'Ossaria* : **régénère moitié moins de mana** ; **+25 % de dégâts sacrés** reçus |
| **Calque graphique** | Teint pâle, yeux luisants, crocs ; pas d'ombre au sol |
| **Effets narratifs** | Dialogues spéciaux pendant la Fête des Lanternes ; méfiance de l'Ordre ; offres des cultistes |

---

## 3. Équilibrage (simulation faite le 14/11)

La simulation officielle (`npm run equilibrage`, 1 000 combats par cas, héros équipés) a été lancée **avec les 10 races**, sur une copie temporaire du jeu :

| Race | Victoires | Écart avec la moyenne |
|---|---|---|
| Ange | 71,2 % | −3,2 |
| Vampire | 77,1 % | +2,8 |
| Moyenne générale | 74,4 % | — |

✅ **Tous les critères du projet sont respectés** : chaque race à ± 10 points, chaque combinaison classe × race à ± 15 points. Les 8 races existantes ne bougent presque pas.

Combinaisons les plus éloignées de la moyenne :
- Ange : Guérisseur 86,3 % (+11,9), Gardien 59,8 % (−14,6), Lame runique 61,5 %, Invocateur 62,3 %.
- Vampire : Barde 85,7 % (+11,3), Berserker 84,6 %, Invocateur 65,4 %, Gardien 66,2 %.

> Une première version de l'Ange (FOR −2, +15 % de soins reçus) faisait sortir **Guérisseur × Ange** (93 %) et **Gardien × Ange** (58 %) des fourchettes : elle a été corrigée.

---

## 4. Pour les intégrer au jeu (plus tard)

1. Ajouter les deux races dans `content/races/races.yaml` (le texte « En jeu » ci-dessus).
2. Le moteur doit comprendre **5 nouveaux réglages de trait** dans `src/moteur/combat.ts` :
   - `resistance_sacre` (résistance au sacré) ;
   - `faiblesse_ombre` (dégâts d'ombre en plus) ;
   - `esquive` lu pour toutes les races (aujourd'hui seulement pour les Vulpins) ;
   - `vol_de_vie` (PV récupérés sur les dégâts infligés) ;
   - `regen_mana` (régénération du mana modifiée).
3. Les calques graphiques : ailes pour les anges, teint et yeux pour les vampires (voir `docs/GRAPHISMES.md`).
4. Une icône de trait 32 × 32 pour chacune (`assets/icones/races/`).
5. Relancer `npm test` et `npm run equilibrage`.

La version testée de ces 5 réglages existe : elle tient en une dizaine de lignes.

---

## 5. Questions pour le groupe
- On garde les **noms** « Orphelins du Ciel » et « Refusés » ?
- Les anges et les vampires ont-ils chacun un **État** (État de la Lumière pour les Gardiens, domaine nocturne pour les vampires), ou vivent-ils dispersés ?
- Faut-il des **dons** ou des **compagnes** liés à ces races (par exemple une compagne vampire « Sobre ») ?
