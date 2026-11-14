from bestiaire import ennemi

ENTETE = """# Ennemis du chapitre 2 (Marche des Sables, niveaux 8 à 15).
# Fichier généré par scripts/contenu/bestiaire.py à partir de scripts/contenu/ch2_ennemis.py : modifier la source, puis relancer.
"""

ENNEMIS = [
ennemi('chacal', 'Chacal des dunes', "Chacal fauve aux grandes oreilles, chasse en meute.", 8, 'faible', 'bete', stat='AGI',
  attaques=[("Morsure", "mord {cible} au mollet", 'entaille'), ("Assaut de meute", "bondit sur {cible} en jappant", 'entaille')],
  competences="""- id: hurlement-de-meute
  nom: Hurlement de meute
  description: "Toute la meute frappe plus fort."
  recharge: 4
  cible: tous_allies
  effets: [{ type: etat, etat: bonus_degats, duree: 2, valeur: 0.2 }]
  ia: { priorite: 3, quand: debut_combat }""", objets=[('croc-de-loup', 0.3)]),

ennemi('scorpion-des-sables', 'Scorpion des sables', "Scorpion ocre de la taille d'un chien, dard noir.", 10, 'standard', 'bete', stat='AGI', element='poison', facteur_degats=0.8, caracs={'AGI': 13},
  attaques=[("Coup de dard", "plante son dard dans {cible}", 'poison'), ("Pinces", "serre {cible} dans ses pinces", 'impact')],
  resistances={'feu': 0.25, 'glace': -0.25},
  competences="""- id: venin-de-scorpion
  nom: Venin de scorpion
  description: "Un venin brûlant."
  recharge: 3
  cible: ennemi
  portee: melee
  effets:
    - { type: degats, puissance: 10, stat: AGI, element: poison }
    - { type: etat, etat: poison, duree: 2, valeur: 4 }
  ia: { priorite: 3 }""", objets=[('antidote', 0.3)]),

ennemi('pillard-du-desert', 'Pillard du désert', "Pillard au chèche turquoise, cimeterre à la main.", 9, 'standard', 'humanoide',
  attaques=[("Coup de cimeterre", "taillade {cible} de son cimeterre", 'entaille'), ("Sable aux yeux", "jette du sable au visage de {cible}", 'impact')],
  competences="""- id: charge-du-pillard
  nom: Charge du pillard
  description: "Une charge au cimeterre."
  recharge: 3
  cible: ennemi
  portee: melee
  effets: [{ type: degats, puissance: 14, stat: FOR }]
  ia: { priorite: 2 }""", objets=[('potion-soin', 0.2), ('ration', 0.3)]),

ennemi('archer-pillard', 'Archer pillard', "Archer du désert, perché sur les rochers.", 10, 'faible', 'humanoide', stat='AGI', portee='distance', rang_combat='arriere', sprite='pillard-du-desert',
  attaques=[("Flèche", "décoche une flèche sur {cible}", 'impact'), ("Tir rapide", "tire deux fois vers {cible}", 'impact')]),

ennemi('lame-de-sable', 'Lame de Sable', "Assassin de la Main de Sable : voile noir, deux poignards courbes.", 11, 'standard', 'humanoide', stat='AGI', sprite='bandit',
  attaques=[("Poignard courbe", "glisse un poignard sous la garde de {cible}", 'entaille'), ("Lame empoisonnée", "entaille {cible} d'une lame luisante", 'poison')],
  competences="""- id: disparition
  nom: Disparition
  description: "Se fond dans l'ombre."
  recharge: 4
  cible: soi
  effets: [{ type: etat, etat: furtif, duree: 2 }]
  ia: { priorite: 3, quand: soi_blesse }
- id: frappe-dans-le-dos
  nom: Frappe dans le dos
  description: "Un coup vicieux, souvent critique."
  recharge: 2
  cible: ennemi
  portee: melee
  effets: [{ type: degats, puissance: 15, stat: AGI, critique_garanti: true }]
  ia: { priorite: 3 }"""),

ennemi('kezir', 'Kezir, Main de Sable', "Le maître des assassins de Qarzim. Il ne combat jamais à la loyale, et s'enfuit quand il perd.", 12, 'boss', 'humanoide', stat='AGI', sprite='bandit', fuit=0.2, facteur_pv=0.55,
  attaques=[("Danse des poignards", "tourne autour de {cible} en frappant", 'entaille'), ("Lame de sable", "frappe {cible} d'une lame chargée de sable", 'entaille')],
  competences="""- id: nuage-de-sable
  nom: Nuage de sable
  description: "Aveugle tout le groupe."
  recharge: 4
  cible: tous_ennemis
  effets: [{ type: etat, etat: affaibli, duree: 2, valeur: 0.2, chance: 0.6 }]
  ia: { priorite: 3, quand: debut_combat }
- id: coup-du-scorpion
  nom: Coup du scorpion
  description: "Deux poignards enduits de venin."
  recharge: 2
  cible: ennemi
  portee: melee
  effets:
    - { type: degats, puissance: 12, stat: AGI, coups: 2 }
    - { type: etat, etat: poison, duree: 3, valeur: 6 }
  ia: { priorite: 3 }""", objets=[('potion-soin', 1.0)]),

ennemi('mercenaire-concorde', 'Mercenaire de la Concorde', "Soldat payé par les marchands : cuirasse dorée, lance et bouclier rond.", 12, 'fort', 'humanoide', sprite='bandit',
  attaques=[("Coup de lance", "embroche presque {cible}", 'entaille'), ("Coup de bouclier", "repousse {cible} avec son bouclier", 'impact')],
  competences="""- id: mur-de-boucliers
  nom: Mur de boucliers
  description: "Les mercenaires serrent les rangs."
  recharge: 4
  cible: tous_allies
  effets: [{ type: etat, etat: bonus_defense, duree: 2, valeur: 0.2 }]
  ia: { priorite: 2, quand: debut_combat }"""),

ennemi('mage-de-cristal', "Mage de cristal", "Mage de la Concorde : il puise dans un cristal d'éther pour lancer ses sorts.", 12, 'standard', 'humanoide', stat='INT', element='arcane', portee='distance', rang_combat='arriere', sprite='cultiste',
  attaques=[("Éclat d'éther", "projette un éclat violet sur {cible}", 'rune'), ("Rayon de cristal", "frappe {cible} d'un rayon de lumière", 'rune')],
  competences="""- id: surcharge-d-ether
  nom: Surcharge d'éther
  description: "Le cristal explose de lumière sur tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets: [{ type: degats, puissance: 11, stat: INT, element: arcane }]
  ia: { priorite: 3 }""", objets=[('cristal-ether', 0.4)]),

ennemi('guerrier-lunecroc', 'Guerrier lunecroc', "Guerrier ourvalis de la tribu Lunecroc : peintures de guerre, griffes de fer.", 13, 'standard', 'humanoide', stat='AGI', sprite='pillard-du-desert',
  attaques=[("Griffes de fer", "lacère {cible} de ses griffes de fer", 'entaille'), ("Bond", "bondit sur {cible}", 'impact')]),

ennemi('momie-de-sel', 'Momie de sel', "Momie couverte de bandelettes durcies par le sel, yeux turquoise.", 13, 'fort', 'mort-vivant',
  attaques=[("Poing de sel", "abat un poing durci de sel sur {cible}", 'impact'), ("Étreinte", "agrippe {cible} de ses bras décharnés", 'impact')],
  resistances={'poison': 1.0, 'glace': 0.25, 'feu': -0.25, 'sacre': -0.5},
  competences="""- id: malediction-de-sel
  nom: Malédiction de sel
  description: "Le sel ronge la peau et dessèche."
  recharge: 3
  cible: ennemi
  effets:
    - { type: degats, puissance: 12, stat: FOR, element: ombre }
    - { type: etat, etat: affaibli, duree: 2, valeur: 0.2 }
  ia: { priorite: 3 }"""),

ennemi('chacal-alpha', 'Grande Mère des chacals', "La matriarche du canyon : énorme, pelage presque blanc, cicatrices partout.", 11, 'boss', 'bete', stat='AGI', sprite='chacal', facteur_pv=0.5,
  attaques=[("Crocs de la matriarche", "referme ses mâchoires sur {cible}", 'entaille'), ("Charge", "renverse {cible} d'un coup d'épaule", 'impact')],
  competences="""- id: appel-de-la-meute
  nom: Appel de la meute
  description: "Toute la meute s'enrage."
  recharge: 4
  cible: tous_allies
  effets: [{ type: etat, etat: bonus_degats, duree: 3, valeur: 0.25 }]
  ia: { priorite: 4, quand: debut_combat }"""),

ennemi('roi-de-sel', 'Le Roi de Sel', "Un ancien roi du désert, couronné d'un cristal d'éther fendu. Il garde les Ruines depuis mille ans.", 15, 'boss', 'mort-vivant', stat='INT', element='arcane', sprite='momie-de-sel', facteur_pv=0.75,
  attaques=[("Sceptre de sel", "abat son sceptre sur {cible}", 'impact'), ("Regard d'éther", "fixe {cible} de ses yeux d'éther", 'rune')],
  resistances={'poison': 1.0, 'ombre': 0.25, 'sacre': -0.4, 'feu': -0.2},
  competences="""- id: tempete-de-sel
  nom: Tempête de sel
  description: "Une tempête de sel cristallin sur tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 13, stat: INT, element: arcane }
    - { type: etat, etat: affaibli, duree: 2, valeur: 0.15, chance: 0.5 }
  ia: { priorite: 4 }
- id: eveil-des-gardes
  nom: Éveil des gardes
  description: "Le Roi se régénère grâce au cristal de sa couronne."
  recharge: 5
  cible: soi
  effets: [{ type: soin, puissance: 22, stat: INT }]
  ia: { priorite: 4, quand: soi_blesse }""", objets=[('tablette-dechirure', 1.0)]),

ennemi('capitaine-vask', 'Capitaine Orlen Vask', "Le chef des mercenaires de la Concorde. Cuirasse dorée, ordres secs, aucun scrupule.", 14, 'boss', 'humanoide', sprite='bandit', facteur_pv=0.6, fuit=0.2,
  attaques=[("Fendoir doré", "abat son fendoir sur {cible}", 'entaille'), ("Ordre de tir", "désigne {cible} à ses archers", 'impact')],
  competences="""- id: coup-de-commandement
  nom: Coup de commandement
  description: "Ses hommes frappent plus fort."
  recharge: 4
  cible: tous_allies
  effets: [{ type: etat, etat: bonus_degats, duree: 2, valeur: 0.25 }]
  ia: { priorite: 3, quand: debut_combat }"""),

ennemi('tavek', 'Tavek Lunecroc', "Le cousin de Kaya, chef de guerre de la révolte. Rapide, furieux, désespéré.", 14, 'boss', 'humanoide', stat='AGI', sprite='pillard-du-desert', facteur_pv=0.6, fuit=0.25,
  attaques=[("Griffes du chef", "lacère {cible} des deux mains", 'entaille'), ("Hurlement", "pousse un hurlement qui glace {cible}", 'impact')],
  competences="""- id: furie-lunecroc
  nom: Furie lunecroc
  description: "Trois coups de griffes enragés."
  recharge: 3
  cible: ennemi
  portee: melee
  effets: [{ type: degats, puissance: 9, stat: AGI, coups: 3 }]
  ia: { priorite: 3 }"""),
]

RENCONTRES = [
  '{ id: caravane-pillards, nom: "Embuscade sur la route des caravanes", fond: desert, ennemis: [{ id: pillard-du-desert }, { id: pillard-du-desert }, { id: archer-pillard, rang: arriere }], renforts: [pillard-du-desert] }',
  '{ id: chacals-dunes, nom: "Meute de chacals", fond: desert, ennemis: [{ id: chacal }, { id: chacal }, { id: chacal }], renforts: [chacal] }',
  '{ id: chacals-matriarche, nom: "La Grande Mère des chacals", fond: canyon, fuite_possible: false, ennemis: [{ id: chacal-alpha }, { id: chacal }], renforts: [chacal] }',
  '{ id: scorpions-sables, nom: "Nid de scorpions", fond: desert, ennemis: [{ id: scorpion-des-sables }, { id: scorpion-des-sables }], renforts: [scorpion-des-sables] }',
  '{ id: pillards-camp, nom: "Le camp des pillards", fond: canyon, ennemis: [{ id: pillard-du-desert }, { id: pillard-du-desert }, { id: archer-pillard, rang: arriere }], renforts: [archer-pillard] }',
  '{ id: assassins-banquet, nom: "Les assassins du banquet", fond: palais, fuite_possible: false, ennemis: [{ id: lame-de-sable }, { id: lame-de-sable }], renforts: [lame-de-sable] }',
  '{ id: kezir-toits, nom: "Kezir, sur les toits", fond: ville-desert, fuite_possible: false, ennemis: [{ id: kezir }, { id: lame-de-sable }], renforts: [lame-de-sable] }',
  '{ id: mercenaires-mines, nom: "Les gardes des mines", fond: mine, ennemis: [{ id: mercenaire-concorde }, { id: mage-de-cristal, rang: arriere }], renforts: [mercenaire-concorde] }',
  '{ id: ruines-momies, nom: "Gardiens des Ruines", fond: ruines, ennemis: [{ id: momie-de-sel }, { id: momie-de-sel }], renforts: [momie-de-sel] }',
  '{ id: ruines-scorpions, nom: "Scorpions des Ruines", fond: ruines, ennemis: [{ id: scorpion-des-sables }, { id: scorpion-des-sables }], renforts: [scorpion-des-sables] }',
  '{ id: ruines-roi, nom: "Le Roi de Sel", fond: ruines, fuite_possible: false, ennemis: [{ id: roi-de-sel }, { id: momie-de-sel }], renforts: [momie-de-sel] }',
  '{ id: revolte-vask, nom: "Les mercenaires de Vask", fond: mine, fuite_possible: false, ennemis: [{ id: capitaine-vask }, { id: mercenaire-concorde }, { id: mage-de-cristal, rang: arriere }], renforts: [mercenaire-concorde] }',
  '{ id: revolte-tavek, nom: "Tavek et ses guerriers", fond: desert, fuite_possible: false, ennemis: [{ id: tavek }, { id: guerrier-lunecroc }], renforts: [guerrier-lunecroc] }',
  '{ id: caravane-fantome, nom: "La caravane fantôme", fond: desert, ennemis: [{ id: momie-de-sel }, { id: chacal }, { id: chacal }], renforts: [chacal] }',
]
