from bestiaire import ennemi

ENTETE = """# Ennemis du chapitre 3 (Sylvenoire, niveaux 15 à 22).
# Fichier généré par scripts/contenu/bestiaire.py à partir de scripts/contenu/ch3_ennemis.py : modifier la source, puis relancer.
"""

ENNEMIS = [
ennemi('feu-follet-sauvage', 'Feu follet', "Un esprit de lumière bleue, sans corps. Il attire les voyageurs loin des sentiers.", 15, 'faible', 'esprit', stat='INT', element='arcane', portee='distance', rang_combat='arriere', sprite='feu-follet',
  attaques=[("Lueur brûlante", "frôle {cible} d'une lueur glacée", 'rune'), ("Éclat", "éclate au visage de {cible}", 'rune')],
  resistances={'physique': 0.3, 'arcane': 0.5, 'ombre': -0.3},
  competences="""- id: lueur-trompeuse
  nom: Lueur trompeuse
  description: "Une lumière qui égare."
  recharge: 3
  cible: ennemi
  effets: [{ type: etat, etat: affaibli, duree: 2, valeur: 0.2, chance: 0.6 }]
  ia: { priorite: 3 }"""),

ennemi('champignon-veneneux', 'Champignon vénéneux', "Un myconide au chapeau violet, qui crache des spores.", 16, 'standard', 'bete', stat='VIT', element='poison',
  attaques=[("Coup de chapeau", "assène un coup de chapeau à {cible}", 'impact'), ("Spores", "crache des spores sur {cible}", 'poison')],
  resistances={'poison': 0.6, 'feu': -0.4},
  competences="""- id: nuage-de-spores
  nom: Nuage de spores
  description: "Des spores sur tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 8, stat: VIT, element: poison }
    - { type: etat, etat: poison, duree: 2, valeur: 6 }
  ia: { priorite: 3 }"""),

ennemi('loup-de-brume', 'Loup de brume', "Un loup translucide, bleu brume, aux yeux blancs. Les elfes disent que ce sont des chiens de garde de la forêt.", 17, 'fort', 'esprit', stat='AGI', sprite='loup-spectral',
  attaques=[("Morsure de brume", "traverse {cible} d'une morsure glacée", 'entaille'), ("Hurlement", "hurle à la face de {cible}", 'rune')],
  resistances={'physique': 0.2, 'glace': 0.4, 'sacre': -0.3},
  competences="""- id: chasse-fantome
  nom: Chasse fantôme
  description: "Deux morsures rapides."
  recharge: 2
  cible: ennemi
  portee: melee
  effets: [{ type: degats, puissance: 10, stat: AGI, element: glace, coups: 2 }]
  ia: { priorite: 3 }"""),

ennemi('sylvain-corrompu', 'Sylvain corrompu', "Un arbre vivant aux feuilles tachées de violet. La corruption des cristaux l'a rendu fou.", 19, 'fort', 'construction', element='physique',
  attaques=[("Branche-fouet", "fouette {cible} d'une branche noueuse", 'impact'), ("Racines", "fait jaillir des racines sous {cible}", 'impact')],
  resistances={'physique': 0.2, 'poison': 0.5, 'feu': -0.5},
  competences="""- id: etreinte-des-racines
  nom: Étreinte des racines
  description: "Des racines immobilisent la cible."
  recharge: 3
  cible: ennemi
  effets:
    - { type: degats, puissance: 14, stat: FOR }
    - { type: etat, etat: immobilise, duree: 1, chance: 0.5 }
  ia: { priorite: 3 }"""),

ennemi('garde-sylvain', 'Garde sylvain', "Archer elfe de la garde d'Ithrael, cape vert sombre, arc long.", 16, 'standard', 'humanoide', stat='AGI', portee='distance', rang_combat='arriere', sprite='bandit',
  attaques=[("Flèche elfique", "décoche une flèche silencieuse sur {cible}", 'impact'), ("Tir double", "tire deux flèches vers {cible}", 'impact')]),

ennemi('eclaireur-cendre', 'Éclaireur de la Légion', "Un soldat de la Légion Cendrée : armure noire, cape en lambeaux, épée qui fume.", 17, 'standard', 'demon', sprite='cultiste',
  attaques=[("Lame fumante", "taille {cible} d'une lame qui fume", 'ombre'), ("Coup de garde", "frappe {cible} du pommeau", 'impact')],
  resistances={'feu': 0.3, 'ombre': 0.3, 'sacre': -0.3}),

ennemi('diablotin-sylve', 'Diablotin', "Un petit démon rouge aux ailes de chauve-souris, une fourche à la main. Il rit tout le temps.", 16, 'faible', 'demon', stat='AGI', element='feu', portee='distance', rang_combat='arriere', sprite='diablotin',
  attaques=[("Fourche", "pique {cible} de sa fourche", 'entaille'), ("Boule de feu", "lance une petite boule de feu sur {cible}", 'feu')],
  resistances={'feu': 0.6, 'sacre': -0.4}),

ennemi('gardien-des-racines', 'Le Gardien des Racines', "Un sylvain immense, plus vieux que le royaume. Il garde la Bibliothèque, et il ne sait plus pourquoi.", 19, 'boss', 'construction', sprite='sylvain-corrompu', facteur_pv=0.75,
  attaques=[("Tronc", "écrase {cible} sous un bras de bois", 'impact'), ("Tempête de feuilles", "fouette {cible} d'une tempête de feuilles", 'entaille')],
  resistances={'physique': 0.25, 'poison': 0.6, 'feu': -0.4},
  competences="""- id: seve-ancienne
  nom: Sève ancienne
  description: "Il se régénère par ses racines."
  recharge: 4
  cible: soi
  effets: [{ type: soin, puissance: 28, stat: VIT }]
  ia: { priorite: 4, quand: soi_blesse }
- id: foret-vivante
  nom: Forêt vivante
  description: "Des racines frappent tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 14, stat: FOR }
    - { type: etat, etat: immobilise, duree: 1, chance: 0.3 }
  ia: { priorite: 4 }"""),

ennemi('morra-commandante', 'Morwenna « Morra »', "Commandante de la Légion Cendrée : cornes noires, cheveux couleur de braise, épée-faux. Elle se bat comme si elle n'avait plus rien à perdre.", 21, 'boss', 'demon', stat='FOR', element='ombre', sprite='chevalier-cendre', facteur_pv=0.7,
  attaques=[("Faux de cendre", "fauche {cible} d'un large arc noir", 'ombre'), ("Ricanement", "frappe {cible} du plat de la lame en riant", 'ombre')],
  resistances={'feu': 0.5, 'ombre': 0.5, 'sacre': -0.25},
  competences="""- id: moisson-noire
  nom: Moisson noire
  description: "Un coup de faux sur tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 15, stat: FOR, element: ombre }
    - { type: etat, etat: affaibli, duree: 2, valeur: 0.15, chance: 0.5 }
  ia: { priorite: 4 }
- id: pacte-de-sang
  nom: Pacte de sang
  description: "Elle se soigne en frappant."
  recharge: 3
  cible: ennemi
  portee: melee
  effets:
    - { type: degats, puissance: 18, stat: FOR, element: ombre }
    - { type: soin, puissance: 12, stat: FOR, cible: soi }
  ia: { priorite: 3 }"""),
]

RENCONTRES = [
  '{ id: lisiere-loups, nom: "Les loups de brume", fond: foret-profonde, ennemis: [{ id: loup-de-brume }, { id: loup-de-brume }], renforts: [loup-de-brume] }',
  '{ id: follets-bois, nom: "Les feux follets", fond: foret-profonde, ennemis: [{ id: feu-follet-sauvage }, { id: feu-follet-sauvage }, { id: feu-follet-sauvage }], renforts: [feu-follet-sauvage] }',
  '{ id: champignons-marais, nom: "Le cercle de champignons", fond: marais, ennemis: [{ id: champignon-veneneux }, { id: champignon-veneneux }], renforts: [champignon-veneneux] }',
  '{ id: sylvains-corrompus, nom: "Les sylvains corrompus", fond: foret-profonde, ennemis: [{ id: sylvain-corrompu }, { id: feu-follet-sauvage, rang: arriere }], renforts: [sylvain-corrompu] }',
  '{ id: gardes-ithrael, nom: "La garde d\'Ithrael", fond: foret-profonde, ennemis: [{ id: garde-sylvain }, { id: garde-sylvain }], renforts: [garde-sylvain] }',
  '{ id: eclaireurs-legion, nom: "Éclaireurs de la Légion", fond: foret-profonde, ennemis: [{ id: eclaireur-cendre }, { id: eclaireur-cendre }, { id: diablotin-sylve, rang: arriere }], renforts: [eclaireur-cendre] }',
  '{ id: bibliotheque-sylvains, nom: "Les gardiens de bois", fond: bibliotheque, ennemis: [{ id: sylvain-corrompu }, { id: champignon-veneneux }], renforts: [champignon-veneneux] }',
  '{ id: bibliotheque-follets, nom: "Les lumières de la Bibliothèque", fond: bibliotheque, ennemis: [{ id: feu-follet-sauvage }, { id: feu-follet-sauvage }, { id: loup-de-brume }], renforts: [feu-follet-sauvage] }',
  '{ id: bibliotheque-gardien, nom: "Le Gardien des Racines", fond: bibliotheque, fuite_possible: false, ennemis: [{ id: gardien-des-racines }, { id: feu-follet-sauvage, rang: arriere }], renforts: [feu-follet-sauvage] }',
  '{ id: nuitlongue-legion, nom: "La Légion dans la forêt", fond: foret-profonde, fuite_possible: false, ennemis: [{ id: eclaireur-cendre }, { id: eclaireur-cendre }, { id: diablotin-sylve, rang: arriere }], renforts: [diablotin-sylve] }',
  '{ id: nuitlongue-morra, nom: "Morra, commandante des Cendres", fond: clairiere, fuite_possible: false, ennemis: [{ id: morra-commandante }, { id: eclaireur-cendre }], renforts: [eclaireur-cendre] }',
  '{ id: domaine-brigands, nom: "Les brigands du domaine", fond: plaine, ennemis: [{ id: eclaireur-cendre }, { id: diablotin-sylve, rang: arriere }], renforts: [diablotin-sylve] }',
]
