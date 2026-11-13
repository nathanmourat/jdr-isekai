# Bestiaire — mobs à farmer

Planches de combat au format ennemi : **512 × 256**, cases de 64 × 64, créature **tournée vers la gauche**.
Lignes : 1 attente (4 images), 2 attaque (6), 3 touché (2), 4 K.O. (3). Fichier : `ennemis/<id>/combat.png`.

Classés du plus faible au plus fort. Les **niveaux conseillés** suivent les tranches de niveau des régions (CONCEPTION.md § 2.2) : ce sont des propositions, à ajuster par la simulation d'équilibrage.
Rang : faible < standard < fort < élite.

| N° | Fichier (`ennemis/…`) | Nom | Région | Niveaux conseillés | Rang | Description |
|---|---|---|---|---|---|---|
| 1 | `gelee-verte/combat.png` | Gelée verte | Aubeclaire | 1–2 | faible | Petite gelée verte qui rebondit. |
| 2 | `rat-geant/combat.png` | Rat géant | Aubeclaire | 1–3 | faible | Rat brun de la taille d’un chat, queue rose. |
| 3 | `chauve-souris/combat.png` | Chauve-souris | Aubeclaire | 2–4 | faible | Chauve-souris des cavernes. |
| 4 | `sanglier/combat.png` | Sanglier des plaines | Aubeclaire | 3–5 | standard | Sanglier brun, défenses blanches, charge. |
| 5 | `araignee-geante/combat.png` | Araignée géante | Aubeclaire | 4–6 | standard | Araignée de la taille d’un chien, carapace noire et violette (liste n° 52). |
| 6 | `bandit/combat.png` | Bandit | Aubeclaire | 4–7 | standard | Bandit humain, foulard sur le visage, gourdin (liste n° 53). |
| 7 | `cultiste/combat.png` | Cultiste des Cendres | Aubeclaire | 6–9 | fort | Robe grise à capuche, sceau violet qui brille dans la main (liste n° 54). |
| 8 | `chacal/combat.png` | Chacal des dunes | Sables | 8–10 | standard | Chacal fauve aux grandes oreilles, chasse en meute. |
| 9 | `scorpion-des-sables/combat.png` | Scorpion des sables | Sables | 9–12 | standard | Scorpion ocre, dard noir. |
| 10 | `pillard-du-desert/combat.png` | Pillard du désert | Sables | 10–13 | standard | Pillard au chèche turquoise, cimeterre. |
| 11 | `momie-de-sel/combat.png` | Momie de sel | Sables | 12–15 | fort | Momie couverte de bandelettes, yeux turquoise (Ruines de Sel). |
| 12 | `feu-follet/combat.png` | Feu follet | Sylvenoire | 15–17 | faible | Esprit de lumière bleue, sans corps. |
| 13 | `champignon-veneneux/combat.png` | Champignon vénéneux | Sylvenoire | 15–18 | standard | Myconide au chapeau violet, crache des spores. |
| 14 | `loup-spectral/combat.png` | Loup spectral | Sylvenoire | 17–20 | fort | Loup translucide bleu brume, yeux blancs. |
| 15 | `sylvain-corrompu/combat.png` | Sylvain corrompu | Sylvenoire | 19–22 | fort | Arbre vivant aux feuilles tachées de violet. |
| 16 | `chauve-souris-de-lave/combat.png` | Chauve-souris de lave | Grisfer | 20–22 | standard | Chauve-souris noire aux ailes rougeoyantes. |
| 17 | `kobold-mineur/combat.png` | Kobold mineur | Grisfer | 20–23 | standard | Petit kobold écailleux, pioche et casque de mineur. |
| 18 | `gelee-de-magma/combat.png` | Gelée de magma | Grisfer | 22–25 | standard | Gelée de roche fondue, brûlante. |
| 19 | `salamandre/combat.png` | Salamandre de forge | Grisfer | 23–26 | fort | Lézard des forges, queue enflammée, crache du feu. |
| 20 | `golem-de-pierre/combat.png` | Golem de pierre | Grisfer | 25–28 | fort | Golem de granite, rune bleue sur le torse. |
| 21 | `crabe-des-recifs/combat.png` | Crabe des récifs | Brumes | 22–25 | standard | Gros crabe rouge couvert de coquillages. |
| 22 | `pirate-noye/combat.png` | Pirate noyé | Brumes | 24–28 | fort | Squelette de pirate, bandeau rouge, sabre, coquillages. |
| 23 | `wyrmling/combat.png` | Jeune wyrm | Brumes | 27–30 | fort | Jeune dragon des brumes, ailes, souffle de feu. |
| 24 | `diablotin/combat.png` | Diablotin | Cendres | 28–31 | standard | Petit démon rouge ailé avec une fourche. |
| 25 | `gelee-cendree/combat.png` | Gelée cendrée | Cendres | 29–32 | standard | Gelée de cendre violette, braises à l’intérieur. |
| 26 | `chien-des-enfers/combat.png` | Chien des enfers | Cendres | 31–35 | fort | Molosse noir à crinière de flammes. |
| 27 | `chevalier-cendre/combat.png` | Chevalier cendré | Cendres | 34–38 | élite | Chevalier en armure noire, lame aux runes violettes. |
| 28 | `golem-d-obsidienne/combat.png` | Golem d’obsidienne | Cendres | 36–40 | élite | Golem noir veiné de lave, garde de la Citadelle. |

Les n° 5, 6 et 7 correspondent aux n° 52, 53 et 54 de LISTE-TEXTURES.md (araignée géante, bandit, cultiste).
Le loup gris, le gobelin cendré et le squelette (priorité 1) complètent le début de l'Aubeclaire, niveaux 1 à 5.
