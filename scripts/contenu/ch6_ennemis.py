from bestiaire import ennemi

ENTETE = """# Ennemis du chapitre 6 (Terres Cendrées et Citadelle d'Obsidienne, niveaux 34 à 40), dont Orvan en 3 phases.
# Fichier généré par scripts/contenu/bestiaire.py à partir de scripts/contenu/ch6_ennemis.py : modifier la source, puis relancer.
"""

ENNEMIS = [
ennemi('garde-d-obsidienne', 'Garde d\'obsidienne', "Un soldat d'élite de la Citadelle, armure noire polie comme un miroir, hallebarde de verre volcanique.", 35, 'standard', 'demon', sprite='chevalier-cendre', facteur_pv=0.9,
  attaques=[("Hallebarde de verre", "fauche {cible} d'une hallebarde d'obsidienne", 'entaille'), ("Coup de bouclier", "repousse {cible} d'un coup de bouclier", 'impact')],
  resistances={'feu': 0.3, 'ombre': 0.3, 'sacre': -0.3}),
ennemi('ombre-du-voile', 'Ombre du Voile', "Une silhouette violette, sans visage, échappée d'une déchirure. Elle chuchote dans une langue que personne ne parle.", 36, 'standard', 'mort-vivant', stat='INT', element='arcane', portee='distance', sprite='feu-follet', rang_combat='arriere', facteur_pv=0.7,
  attaques=[("Murmure", "chuchote à l'oreille de {cible}", 'ombre'), ("Éclat du Voile", "lance un éclat violet sur {cible}", 'arcane')],
  resistances={'physique': 0.1, 'arcane': 0.4, 'sacre': -0.4},
  competences="""- id: dechirure
  nom: Petite déchirure
  description: "Elle ouvre une fente dans l'air, qui aspire les forces."
  recharge: 3
  cible: ennemi
  effets:
    - { type: degats, puissance: 15, stat: INT, element: arcane }
    - { type: etat, etat: affaibli, duree: 2, valeur: 0.15, chance: 0.5 }
  ia: { priorite: 3 }"""),
ennemi('dragon-de-cendre', 'Dragon de cendre', "Un dragon mort il y a des siècles, relevé par les Cendres. Ses ailes sont trouées, son souffle est gris.", 37, 'fort', 'mort-vivant', element='ombre', sprite='wyrmling', facteur_pv=0.85,
  attaques=[("Griffes grises", "lacère {cible} de ses griffes", 'entaille'), ("Morsure de cendre", "mord {cible}", 'ombre')],
  resistances={'feu': 0.5, 'ombre': 0.3, 'sacre': -0.4},
  competences="""- id: souffle-gris
  nom: Souffle gris
  description: "Un souffle de cendre froide sur tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets: [{ type: degats, puissance: 13, stat: FOR, element: ombre }]
  ia: { priorite: 3 }"""),
ennemi('liche-cendree', 'Liche cendrée', "Un ancien prêtre de l'Ordre, venu chercher Orvan il y a des siècles, et qui n'est jamais reparti. Il soigne les démons qu'il haïssait.", 36, 'fort', 'mort-vivant', stat='INT', element='ombre', portee='distance', sprite='cultiste', rang_combat='arriere', facteur_pv=0.85,
  attaques=[("Trait de cendre", "lance un trait de cendre sur {cible}", 'ombre'), ("Prière inversée", "maudit {cible} d'une prière à l'envers", 'ombre')],
  resistances={'ombre': 0.4, 'sacre': -0.5},
  competences="""- id: requiem
  nom: Requiem
  description: "Un chant qui recoud les chairs mortes."
  recharge: 4
  cible: tous_allies
  effets: [{ type: soin, puissance: 15, stat: INT }]
  ia: { priorite: 3, quand: allie_blesse }"""),
ennemi('chevalier-cendre', 'Chevalier cendré', "Un chevalier de la garde personnelle du Souverain, en armure noire aux runes violettes. Il ne parle jamais.", 37, 'elite', 'demon',
  attaques=[("Lame runique", "frappe {cible} d'une lame aux runes violettes", 'ombre'), ("Charge", "renverse {cible}", 'impact')],
  resistances={'feu': 0.3, 'ombre': 0.4, 'sacre': -0.3},
  competences="""- id: serment-noir
  nom: Serment noir
  description: "Il plante son épée au sol : l'ombre protège ses alliés."
  recharge: 4
  cible: tous_allies
  effets: [{ type: etat, etat: bonus_defense, duree: 2, valeur: 0.2 }]
  ia: { priorite: 3, quand: debut_combat }"""),
ennemi('golem-d-obsidienne', 'Golem d\'obsidienne', "Un golem noir veiné de lave, gardien de la Citadelle. Chaque pas fait trembler le sol.", 38, 'elite', 'construction', facteur_pv=0.9,
  attaques=[("Poing d'obsidienne", "écrase {cible} d'un poing noir", 'impact'), ("Éclats de verre", "projette des éclats tranchants sur {cible}", 'entaille')],
  resistances={'physique': 0.3, 'poison': 1.0, 'feu': 0.5, 'glace': -0.3, 'foudre': -0.2}),
ennemi('geolier-d-obsidienne', 'Le Geôlier', "Un colosse d'obsidienne qui porte à la ceinture les clés de toutes les cellules de la Citadelle. Ses chaînes traînent par terre en chantant.", 37, 'boss', 'construction', sprite='golem-d-obsidienne', facteur_pv=0.75,
  attaques=[("Chaîne", "fouette {cible} d'une chaîne d'obsidienne", 'impact'), ("Poing", "écrase {cible}", 'impact')],
  resistances={'physique': 0.3, 'poison': 1.0, 'feu': 0.5, 'glace': -0.2},
  competences="""- id: enchainement
  nom: Enchaînement
  description: "Ses chaînes s'enroulent autour d'un héros."
  recharge: 3
  cible: ennemi
  effets:
    - { type: degats, puissance: 14, stat: FOR }
    - { type: etat, etat: immobilise, duree: 1, chance: 0.5 }
  ia: { priorite: 3 }"""),
ennemi('orvan-souverain', 'Orvan, Souverain des Cendres', "Un homme grand, en armure d'obsidienne, couronne de flammes noires. Ses yeux sont ceux d'un homme très fatigué. Il était le premier Appelé.", 39, 'boss', 'demon', element='ombre', sprite='chevalier-cendre', facteur_pv=0.6,
  attaques=[("Épée du premier Appel", "frappe {cible} d'une épée qui vient d'un autre monde", 'ombre'), ("Geste royal", "renverse {cible} d'un simple geste", 'arcane')],
  resistances={'feu': 0.4, 'ombre': 0.5, 'sacre': -0.2},
  competences="""- id: couronne-de-flammes
  nom: Couronne de flammes
  description: "La couronne s'embrase : des flammes noires tombent sur le groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 15, stat: FOR, element: ombre }
    - { type: etat, etat: brulure, duree: 2, valeur: 12, chance: 0.5 }
  ia: { priorite: 4 }"""),
ennemi('orvan-dechaine', 'Orvan déchaîné', "Le Souverain a jeté sa couronne. Il se bat comme un homme qui a tout perdu il y a six cents ans, et qui n'a plus rien à perdre.", 40, 'boss', 'demon', element='ombre', sprite='chevalier-cendre', facteur_pv=0.65,
  attaques=[("Fureur", "frappe {cible} de toutes ses forces", 'ombre'), ("Cri du premier Appelé", "hurle sur {cible} un nom que personne ne connaît", 'arcane')],
  resistances={'feu': 0.4, 'ombre': 0.5},
  competences="""- id: six-cents-ans
  nom: Six cents ans de colère
  description: "Une série de coups, de plus en plus forts."
  recharge: 3
  cible: ennemi
  effets: [{ type: degats, puissance: 11, stat: FOR, coups: 3, element: ombre }]
  ia: { priorite: 4 }
- id: rage-ancienne
  nom: Rage ancienne
  description: "Sa colère le rend plus fort."
  recharge: 5
  cible: soi
  effets: [{ type: etat, etat: bonus_degats, duree: 3, valeur: 0.25 }]
  ia: { priorite: 4, quand: soi_blesse }"""),
ennemi('orvan-coeur-du-voile', 'Orvan, cœur du Voile', "Orvan a plongé dans la déchirure, sous la Citadelle. Il est devenu une silhouette de lumière violette, reliée au Voile par mille fils. S'il tombe, le Voile tombe avec lui… ou se recoud.", 40, 'boss', 'mort-vivant', stat='INT', element='arcane', portee='distance', sprite='feu-follet', facteur_pv=0.6,
  attaques=[("Fil du Voile", "transperce {cible} d'un fil de lumière", 'arcane'), ("Souvenir", "montre à {cible} un souvenir de son monde d'origine", 'arcane')],
  resistances={'physique': 0.2, 'arcane': 0.5, 'ombre': 0.3},
  competences="""- id: tempete-du-voile
  nom: Tempête du Voile
  description: "Le Voile se déchire autour du groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 15, stat: INT, element: arcane }
    - { type: etat, etat: malus_defense, duree: 2, valeur: 0.15, chance: 0.5 }
  ia: { priorite: 4 }
- id: recoudre-soi
  nom: Mille fils
  description: "Les fils du Voile recousent ses blessures."
  recharge: 5
  cible: soi
  effets: [{ type: soin, puissance: 30, stat: INT }]
  ia: { priorite: 4, quand: soi_blesse }"""),
]

RENCONTRES = [
  '{ id: cendres-gardes, nom: "Les gardes d\'obsidienne", fond: cendres, ennemis: [{ id: garde-d-obsidienne }, { id: garde-d-obsidienne }, { id: liche-cendree, rang: arriere }], renforts: [garde-d-obsidienne] }',
  '{ id: cendres-ombres, nom: "Les ombres du Voile", fond: voile, ennemis: [{ id: ombre-du-voile }, { id: ombre-du-voile }, { id: ombre-du-voile }], renforts: [ombre-du-voile] }',
  '{ id: cendres-dragons, nom: "Le dragon de cendre", fond: lac-de-lave, ennemis: [{ id: dragon-de-cendre }, { id: ombre-du-voile, rang: arriere }], renforts: [ombre-du-voile] }',
  '{ id: cendres-chevaliers, nom: "Les chevaliers du Souverain", fond: citadelle, ennemis: [{ id: chevalier-cendre }, { id: ombre-du-voile, rang: arriere }], renforts: [garde-d-obsidienne] }',
  '{ id: citadelle-golems, nom: "Le golem d\'obsidienne", fond: citadelle, ennemis: [{ id: golem-d-obsidienne }, { id: garde-d-obsidienne }], renforts: [garde-d-obsidienne] }',
  '{ id: citadelle-liches, nom: "Les prêtres oubliés", fond: citadelle, ennemis: [{ id: garde-d-obsidienne }, { id: liche-cendree, rang: arriere }, { id: ombre-du-voile, rang: arriere }], renforts: [garde-d-obsidienne] }',
  '{ id: citadelle-geolier, nom: "Le Geôlier", fond: citadelle, fuite_possible: false, ennemis: [{ id: geolier-d-obsidienne }, { id: garde-d-obsidienne }], renforts: [garde-d-obsidienne] }',
  '{ id: orvan-1, nom: "Orvan, Souverain des Cendres", fond: sommet, fuite_possible: false, ennemis: [{ id: orvan-souverain }, { id: chevalier-cendre }], renforts: [garde-d-obsidienne] }',
  '{ id: orvan-2, nom: "Orvan déchaîné", fond: sommet, fuite_possible: false, ennemis: [{ id: orvan-dechaine }] }',
  '{ id: orvan-3, nom: "Orvan, cœur du Voile", fond: voile, fuite_possible: false, ennemis: [{ id: orvan-coeur-du-voile }, { id: ombre-du-voile, rang: arriere }], renforts: [ombre-du-voile] }',
]
