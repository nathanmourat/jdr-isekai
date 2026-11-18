# Quêtes secondaires « du monde » (ajoutées le 18/11)

7 nouvelles quêtes secondaires, une par chapitre (deux au chapitre 1). Elles ne changent rien à l'histoire principale : elles la rendent plus vivante et préparent ses révélations (les Appels déchirent le Voile, les cristaux d'éther, le Premier Appelé trahi par l'Ordre).

**Ce qu'il faut savoir :**
- Tout est dans de nouveaux fichiers `content/campagne/saison-1/chapitre-N/quetes-monde.yaml`, sans toucher aux fichiers existants : aucune ancienne partie ne casse.
- Elles réutilisent les lieux, les décors, les PNJ et les combats existants. Il n'y a **aucune nouvelle image à faire**.
- Test : `tests/quetes-monde.test.ts` joue chaque quête du début à la fin, avec chacun des 3 premiers choix (22 tests).
- **À valider par le groupe :** les textes ci-dessous. Roblox devra régénérer son contenu (`npm run roblox:contenu`) pour les avoir.

| Ch. | Quête | Niv. | Où | Qui la donne |
|---|---|---|---|---|
| 1 | Les veuves de Valgrane | 3 | Guilde → château → place → Guilde | Rowena (après l'examen) |
| 1 | La lanterne noire | 5 | Taverne → égouts (×2) → Guilde | Bram (après la Fête des Lanternes) |
| 2 | Le cristal qui murmure | 12 | Bazar → Oasis Bleue → mines d'éther → Oasis Bleue | Ouzram |
| 3 | L'Arbre des Noms | 18 | Relais d'Ithrael → Clairière de la Déchirure → Relais | Orsa |
| 4 | L'Appelé de l'Île aux Épaves | 25 | Requin Ivre → Île aux Épaves → Requin Ivre | Vieux Brann |
| 5 | L'hôpital de la Gamelle | 30 | Gamelle → village évacué → Gamelle | Mère Brisac (après la chute du Mur) |
| 6 | Le dernier écuyer | 36 | Forêt pétrifiée → Relais du camp | (statue) puis Sergente Valka |

## Résumés et choix

**1. Les veuves de Valgrane**
- **Le point de départ :** depuis 1004, les veuves des soldats de Valgrane ne touchent plus leur pension.
- **L'enquête :** avec Séraphine, on fouille de nuit les registres du Trésor (test d'Intelligence). On découvre que l'argent a été redirigé vers « la préparation des Appels » au Temple.
- **Le choix, sur la place :**
  - tout révéler en public : Couronne −8, Ordre −5, Guilde +5 ;
  - confier le registre à Séraphine pour le Conseil du roi : affinité avec Séraphine ;
  - payer 20 or de sa poche (choix payant).
- **Si Aveline est rencontrée :** elle réagit, car son père commandait à Valgrane.

**2. La lanterne noire**
- **L'histoire :**
  - après l'attaque de Vorthak, des capuches descendent dans les égouts ;
  - dans les égouts, on se bat deux fois : rats géants, puis cultistes ;
  - on trouve une lettre : « chaque Appel ouvre la porte un peu plus. Le Premier attend ».
- **Le choix :** garder le secret avec la Guilde, ou montrer la lettre à Sœur Elianne. Elianne en est troublée, ce qui prépare sa découverte du chapitre 4.

**3. Le cristal qui murmure**
- **L'histoire :** un cristal d'éther serti dans une dague empêche un scribe de dormir.
- **Avec un test d'Esprit réussi :** les héros entendent dans le cristal une voix **de leur propre monde**, qui cherche la sortie. C'est le premier indice que l'éther est un morceau du Voile.
- **À la mine :** il faut convaincre les gardes (Charisme) ou se battre.
- **Le choix :** briser le cristal contre la veine, ou le garder.

**4. L'Arbre des Noms**
- **L'histoire :**
  - des éclaireurs de la Légion coupent les feuilles d'un arbre blanc, où une feuille pousse pour chaque âme venue de l'autre côté du Voile ;
  - on y trouve les noms de tous les Appelés… et ceux des héros.
- **Avec un test d'Intelligence réussi :** la feuille d'Orvan, le Premier Appelé « mort en héros » en 437, est **toujours verte**.

**5. L'Appelé de l'Île aux Épaves**
- **L'histoire :** un ermite, Julien Marceau, a été appelé en 981 et a déserté en 984. Il parle la langue des héros, et sa fenêtre d'état est bloquée au niveau 19 depuis trente ans.
- **Son carnet :** à chaque Appel correspond une nouvelle fissure dans le ciel du nord. Avec un test de Charisme réussi, il le donne ; sinon, il ne donne qu'une page.
- **Si Elianne est recrutée :** elle réagit, ce qui prépare la révélation du chapitre.

**6. L'hôpital de la Gamelle**
- **La mission :** aller chercher des remèdes dans le village évacué (combat contre des chiens des enfers).
- **Le triage, sans bonne réponse :**
  - les soldats d'abord : troupes +6 ;
  - les civils et les enfants d'abord : Guilde +5, troupes −3 ;
  - ou, avec un test d'Esprit très difficile (30), utiliser la fenêtre d'état pour soigner les plus en danger, quels qu'ils soient.

**7. Le dernier écuyer**
- **L'histoire :** Lucan, écuyer d'Orvan, a été changé en pierre en 437. Les ombres se nourrissent de ses souvenirs.
- **Son récit :** l'Ordre n'a pas tué Orvan, il l'a scellé vivant dans la cendre.
- **Ce qu'on obtient :** l'insigne de la Compagnie du Seuil. Si Morra est recrutée, elle réagit.

## Drapeaux posés (pour plus tard)

| Drapeau | Signification |
|---|---|
| `pensions-revelees`, `pensions-conseil`, `pensions-dons` | Choix des veuves de Valgrane |
| `lettre-du-premier`, `lettre-gardee`, `lettre-elianne` | Lettre de la lanterne noire |
| `cristal-voix`, `cristal-brise`, `cristal-garde` | Cristal qui murmure |
| `arbre-orvan-vert` | Feuille d'Orvan vue sur l'Arbre des Noms |
| `carnet-appele`, `page-appele` | Carnet de Julien |
| `triage-soldats`, `triage-civils`, `triage-regard` | Triage de la Gamelle |
| `promesse-ecuyer`, `repos-ecuyer` | Adieu à Lucan |

**Idée pour plus tard (pas encore fait) :** une réplique d'Orvan au sommet de la Citadelle, ou d'Elianne au chapitre 4, qui change si ces drapeaux sont posés. Par exemple, Orvan reconnaît l'insigne de Lucan.
