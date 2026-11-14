from bestiaire import ennemi

ENTETE = """# Ennemis du chapitre 4 (Monts Grisfer et Archipel des Brumes, niveaux 22 à 28).
# Fichier généré par scripts/contenu/bestiaire.py à partir de scripts/contenu/ch4_ennemis.py : modifier la source, puis relancer.
"""

ENNEMIS = [
# ── Monts Grisfer
ennemi('chauve-souris-de-lave', 'Chauve-souris de lave', "Une chauve-souris noire aux ailes rougeoyantes, qui niche dans les cheminées volcaniques.", 21, 'faible', 'bete', stat='AGI', element='feu',
  attaques=[("Morsure brûlante", "mord {cible} d'une gueule fumante", 'feu'), ("Battement de feu", "souffle des étincelles sur {cible}", 'feu')],
  resistances={'feu': 0.6, 'glace': -0.4}),
ennemi('kobold-mineur', 'Kobold mineur', "Un petit kobold écailleux, casque de mineur et pioche. Il défend « sa » galerie.", 22, 'standard', 'humanoide',
  attaques=[("Coup de pioche", "plante sa pioche dans {cible}", 'entaille'), ("Lancer de caillou", "jette un caillou sur {cible}", 'impact')],
  competences="""- id: eboulement
  nom: Éboulement
  description: "Il fait tomber le plafond sur le groupe."
  recharge: 4
  cible: tous_ennemis
  effets: [{ type: degats, puissance: 12, stat: FOR }]
  ia: { priorite: 3 }"""),
ennemi('gelee-de-magma', 'Gelée de magma', "Une gelée de roche fondue, brûlante, qui laisse des traces noires derrière elle.", 23, 'standard', 'bete', stat='VIT', element='feu',
  attaques=[("Éclaboussure de magma", "éclabousse {cible} de roche fondue", 'feu'), ("Engloutissement", "s'étale sur les pieds de {cible}", 'feu')],
  resistances={'feu': 0.5, 'physique': 0.1, 'glace': -0.5},
  competences="""- id: coulee
  nom: Coulée
  description: "Une coulée brûlante."
  recharge: 3
  cible: ennemi
  effets:
    - { type: degats, puissance: 14, stat: VIT, element: feu }
    - { type: etat, etat: brulure, duree: 2, valeur: 8, chance: 0.6 }
  ia: { priorite: 3 }"""),
ennemi('salamandre', 'Salamandre de forge', "Un lézard des forges, queue enflammée, qui crache du feu quand on l'énerve. Il est toujours énervé.", 24, 'fort', 'bete', stat='AGI', element='feu',
  attaques=[("Crocs de braise", "mord {cible}", 'feu'), ("Coup de queue enflammée", "fouette {cible} de sa queue en feu", 'feu')],
  resistances={'feu': 0.4, 'glace': -0.4},
  competences="""- id: crachat-de-feu
  nom: Crachat de feu
  description: "Un jet de flammes sur tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets: [{ type: degats, puissance: 13, stat: AGI, element: feu }]
  ia: { priorite: 3 }"""),
ennemi('golem-de-granite', 'Golem de granite', "Un golem nain de granite, une rune bleue sur le torse. Il garde les Mille Marches depuis des siècles.", 26, 'fort', 'construction', sprite='golem-de-pierre',
  attaques=[("Poing de granite", "abat un poing de pierre sur {cible}", 'impact'), ("Balayage", "balaie {cible} d'un revers", 'impact')],
  resistances={'physique': 0.3, 'poison': 1.0, 'foudre': -0.3}),
ennemi('gardien-des-marches', 'Le Gardien des Mille Marches', "Un colosse de bronze et de runes, assis au sommet de la millième marche. Il pose une question à chaque visiteur. Il n'aime pas les réponses.", 27, 'boss', 'construction', sprite='golem-de-pierre', facteur_pv=0.9,
  attaques=[("Marteau de bronze", "abat un marteau runique sur {cible}", 'impact'), ("Rune de foudre", "frappe {cible} d'une rune crépitante", 'foudre')],
  resistances={'physique': 0.3, 'poison': 1.0, 'foudre': 0.3, 'glace': -0.2},
  competences="""- id: onde-runique
  nom: Onde runique
  description: "Toutes les runes s'allument : la foudre frappe le groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 15, stat: INT, element: foudre }
    - { type: etat, etat: affaibli, duree: 2, valeur: 0.15, chance: 0.5 }
  ia: { priorite: 4 }
- id: reparation
  nom: Réparation runique
  description: "Les runes recousent le bronze."
  recharge: 5
  cible: soi
  effets: [{ type: soin, puissance: 30, stat: VIT }]
  ia: { priorite: 4, quand: soi_blesse }"""),
# ── Archipel des Brumes
ennemi('crabe-des-recifs', 'Crabe des récifs', "Un gros crabe rouge couvert de coquillages, aux pinces capables de briser une ancre.", 23, 'standard', 'bete',
  attaques=[("Pince", "serre {cible} dans sa pince", 'impact'), ("Carapace", "charge {cible} carapace en avant", 'impact')],
  resistances={'physique': 0.25, 'glace': 0.3, 'foudre': -0.4}),
ennemi('pirate-de-verane', 'Pirate de Port-Vérane', "Un pirate en chemise rayée, sabre d'abordage et sourire édenté.", 24, 'standard', 'humanoide', stat='AGI', sprite='bandit',
  attaques=[("Sabre d'abordage", "taillade {cible} de son sabre", 'entaille'), ("Coup de crosse", "assomme presque {cible} d'un coup de crosse", 'impact')]),
ennemi('pirate-noye', 'Pirate noyé', "Un squelette de pirate couvert de coquillages, bandeau rouge et sabre rouillé. Il ne sait pas qu'il est mort.", 25, 'fort', 'mort-vivant',
  attaques=[("Sabre rouillé", "taillade {cible} d'un sabre rongé de sel", 'entaille'), ("Étreinte des noyés", "agrippe {cible} de ses doigts d'os", 'ombre')],
  resistances={'poison': 1.0, 'glace': 0.3, 'sacre': -0.5, 'foudre': -0.2},
  competences="""- id: chant-des-noyes
  nom: Chant des noyés
  description: "Un chant qui glace le sang."
  recharge: 4
  cible: tous_ennemis
  effets: [{ type: etat, etat: peur, duree: 1, chance: 0.3 }]
  ia: { priorite: 2 }"""),
ennemi('jeune-wyrm', 'Jeune wyrm', "Un jeune dragon des brumes, ailes membraneuses, souffle de feu. Rendu fou par la disparition de son œuf.", 27, 'fort', 'bete', stat='FOR', element='feu', sprite='wyrmling',
  attaques=[("Griffes", "lacère {cible} de ses griffes", 'entaille'), ("Morsure de braise", "mord {cible} d'une gueule ardente", 'feu')],
  resistances={'feu': 0.6, 'glace': -0.3},
  competences="""- id: souffle-du-wyrm
  nom: Souffle du wyrm
  description: "Un souffle de flammes sur tout le groupe."
  recharge: 3
  cible: tous_ennemis
  effets: [{ type: degats, puissance: 15, stat: FOR, element: feu }]
  ia: { priorite: 4 }"""),
ennemi('chasseur-concorde', 'Chasseur de dragons', "Mercenaire de la Concorde équipé pour chasser les dragons : filet lesté, harpon, armure ignifugée.", 25, 'standard', 'humanoide', sprite='bandit',
  attaques=[("Harpon", "lance un harpon sur {cible}", 'entaille'), ("Filet lesté", "jette un filet sur {cible}", 'impact')],
  resistances={'feu': 0.4},
  competences="""- id: filet
  nom: Filet lesté
  description: "Immobilise la cible."
  recharge: 3
  cible: ennemi
  effets:
    - { type: degats, puissance: 10, stat: FOR }
    - { type: etat, etat: immobilise, duree: 1, chance: 0.6 }
  ia: { priorite: 3 }"""),
ennemi('vask-chasseur', 'Orlen Vask, chasseur de dragons', "Le capitaine des mercenaires de la Concorde est revenu. Il vend maintenant des œufs de dragon au plus offrant.", 27, 'boss', 'humanoide', sprite='bandit', facteur_pv=0.55, fuit=0.15,
  attaques=[("Lance-harpon", "tire un harpon sur {cible}", 'entaille'), ("Fendoir doré", "abat son fendoir sur {cible}", 'entaille')],
  resistances={'feu': 0.5},
  competences="""- id: ordre-de-chasse
  nom: Ordre de chasse
  description: "Ses chasseurs frappent plus fort."
  recharge: 4
  cible: tous_allies
  effets: [{ type: etat, etat: bonus_degats, duree: 2, valeur: 0.3 }]
  ia: { priorite: 3, quand: debut_combat }
- id: harpon-empoisonne
  nom: Harpon empoisonné
  description: "Un harpon trempé dans du venin de scorpion."
  recharge: 2
  cible: ennemi
  effets:
    - { type: degats, puissance: 18, stat: FOR }
    - { type: etat, etat: poison, duree: 3, valeur: 9 }
  ia: { priorite: 3 }"""),
ennemi('soldat-cendre', 'Soldat de la Légion', "Un soldat de la Légion Cendrée en armure noire, envoyé pour ramener une déserteuse.", 24, 'standard', 'demon', sprite='chevalier-cendre',
  attaques=[("Lame noire", "taille {cible} d'une lame noire", 'ombre'), ("Coup de bouclier", "frappe {cible} de son bouclier", 'impact')],
  resistances={'feu': 0.3, 'ombre': 0.3, 'sacre': -0.3}),
]

RENCONTRES = [
  '{ id: grisfer-chauves-souris, nom: "Nuée de chauves-souris de lave", fond: montagne, ennemis: [{ id: chauve-souris-de-lave }, { id: chauve-souris-de-lave }, { id: chauve-souris-de-lave }], renforts: [chauve-souris-de-lave] }',
  '{ id: grisfer-kobolds, nom: "Les kobolds de la galerie", fond: mine-naine, ennemis: [{ id: kobold-mineur }, { id: kobold-mineur }], renforts: [kobold-mineur] }',
  '{ id: grisfer-magma, nom: "Gelées de magma", fond: forge, ennemis: [{ id: gelee-de-magma }, { id: gelee-de-magma }], renforts: [gelee-de-magma] }',
  '{ id: grisfer-salamandres, nom: "Salamandres de forge", fond: forge, ennemis: [{ id: salamandre }, { id: chauve-souris-de-lave, rang: arriere }], renforts: [salamandre] }',
  '{ id: marches-golems, nom: "Les gardiens de granite", fond: marches, ennemis: [{ id: golem-de-granite }, { id: kobold-mineur }], renforts: [golem-de-granite] }',
  '{ id: marches-salamandres, nom: "Les salamandres des Marches", fond: marches, ennemis: [{ id: salamandre }, { id: gelee-de-magma }], renforts: [gelee-de-magma] }',
  '{ id: marches-gardien, nom: "Le Gardien des Mille Marches", fond: marches, fuite_possible: false, ennemis: [{ id: gardien-des-marches }, { id: golem-de-granite }], renforts: [golem-de-granite] }',
  '{ id: archipel-crabes, nom: "Les crabes du récif", fond: plage, ennemis: [{ id: crabe-des-recifs }, { id: crabe-des-recifs }], renforts: [crabe-des-recifs] }',
  '{ id: archipel-pirates, nom: "Abordage !", fond: port, ennemis: [{ id: pirate-de-verane }, { id: pirate-de-verane }], renforts: [pirate-de-verane] }',
  '{ id: archipel-noyes, nom: "L\'équipage noyé", fond: epave, ennemis: [{ id: pirate-noye }, { id: pirate-noye }], renforts: [pirate-noye] }',
  '{ id: nid-wyrms, nom: "Les jeunes wyrms", fond: nid, ennemis: [{ id: jeune-wyrm }, { id: crabe-des-recifs }], renforts: [jeune-wyrm] }',
  '{ id: nid-chasseurs, nom: "Les chasseurs de dragons", fond: nid, ennemis: [{ id: chasseur-concorde }, { id: chasseur-concorde }], renforts: [chasseur-concorde] }',
  '{ id: nid-vask, nom: "Orlen Vask, chasseur de dragons", fond: nid, fuite_possible: false, ennemis: [{ id: vask-chasseur }, { id: chasseur-concorde }], renforts: [chasseur-concorde] }',
  '{ id: deserteuse-poursuite, nom: "Les chasseurs de la Légion", fond: montagne, fuite_possible: false, ennemis: [{ id: soldat-cendre }, { id: soldat-cendre }], renforts: [soldat-cendre] }',
]
