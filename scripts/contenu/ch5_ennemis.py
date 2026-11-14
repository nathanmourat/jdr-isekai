from bestiaire import ennemi

ENTETE = """# Ennemis du chapitre 5 (Mur d'Aube, la Guerre des Cendres, niveaux 28 à 34).
# Fichier généré par scripts/contenu/bestiaire.py à partir de scripts/contenu/ch5_ennemis.py : modifier la source, puis relancer.
"""

ENNEMIS = [
ennemi('diablotin', 'Diablotin', "Un petit démon rouge ailé, armé d'une fourche, qui ricane en permanence. Ils arrivent toujours par dizaines.", 28, 'faible', 'demon', stat='AGI', element='feu', portee='distance', rang_combat='arriere',
  attaques=[("Fourche", "pique {cible} de sa fourche", 'entaille'), ("Boule de feu", "lance une petite boule de feu sur {cible}", 'feu')],
  resistances={'feu': 0.5, 'sacre': -0.4}),
ennemi('gelee-cendree', 'Gelée cendrée', "Une gelée de cendre violette, avec des braises à l'intérieur. Elle étouffe ce qu'elle touche.", 29, 'standard', 'bete', stat='VIT', element='ombre', facteur_pv=0.85,
  attaques=[("Étouffement", "s'enroule autour de {cible}", 'ombre'), ("Projection de cendre", "projette de la cendre brûlante sur {cible}", 'feu')],
  resistances={'physique': 0.1, 'ombre': 0.3, 'feu': 0.3, 'sacre': -0.4, 'glace': -0.2},
  competences="""- id: nuage-de-cendre
  nom: Nuage de cendre
  description: "La gelée éclate en un nuage qui pique les yeux."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 11, stat: VIT, element: ombre }
    - { type: etat, etat: affaibli, duree: 2, valeur: 0.15, chance: 0.4 }
  ia: { priorite: 3 }"""),
ennemi('chien-des-enfers', 'Chien des enfers', "Un molosse noir à crinière de flammes. Il traque les vivants à l'odeur.", 31, 'fort', 'demon', stat='AGI', element='feu', facteur_pv=0.7, facteur_degats=0.9,
  attaques=[("Crocs ardents", "mord {cible} d'une gueule enflammée", 'feu'), ("Bond", "se jette sur {cible}", 'entaille')],
  resistances={'feu': 0.6, 'ombre': 0.2, 'glace': -0.3, 'sacre': -0.3},
  competences="""- id: hurlement-infernal
  nom: Hurlement infernal
  description: "Un hurlement qui glace le sang."
  recharge: 4
  cible: tous_ennemis
  effets: [{ type: etat, etat: peur, duree: 1, chance: 0.3 }]
  ia: { priorite: 2, quand: debut_combat }"""),
ennemi('legionnaire-cendre', 'Légionnaire cendré', "Un soldat de la Légion en armure noire, bouclier rond et lance. Il avance au pas, comme une machine.", 30, 'standard', 'demon', sprite='chevalier-cendre',
  attaques=[("Lance noire", "transperce {cible} de sa lance", 'entaille'), ("Mur de boucliers", "repousse {cible} d'un coup de bouclier", 'impact')],
  resistances={'feu': 0.3, 'ombre': 0.3, 'sacre': -0.3}),
ennemi('pretre-des-cendres', 'Prêtre des Cendres', "Un cultiste en robe noire, couronné d'os. Il chante, et les démons blessés se relèvent.", 30, 'standard', 'humanoide', stat='INT', element='ombre', portee='distance', sprite='cultiste', rang_combat='arriere',
  attaques=[("Trait d'ombre", "lance un trait d'ombre sur {cible}", 'ombre'), ("Malédiction", "maudit {cible}", 'ombre')],
  resistances={'ombre': 0.4, 'sacre': -0.4},
  competences="""- id: chant-de-cendre
  nom: Chant de cendre
  description: "Un chant qui referme les plaies des démons."
  recharge: 4
  cible: tous_allies
  effets: [{ type: soin, puissance: 14, stat: INT }]
  ia: { priorite: 3, quand: allie_blesse }"""),
ennemi('capitaine-cendre', 'Capitaine de la Légion', "Un officier démon en armure à pointes, cape déchirée, épée à deux mains entourée de runes violettes.", 33, 'elite', 'demon', sprite='chevalier-cendre',
  attaques=[("Lame runique", "abat une lame aux runes violettes sur {cible}", 'ombre'), ("Coup d'épaule", "renverse {cible} d'un coup d'épaule", 'impact')],
  resistances={'feu': 0.3, 'ombre': 0.4, 'sacre': -0.3},
  competences="""- id: ordre-de-charge
  nom: Ordre de charge
  description: "« En avant ! » Ses soldats frappent plus fort."
  recharge: 4
  cible: tous_allies
  effets: [{ type: etat, etat: bonus_degats, duree: 3, valeur: 0.2 }]
  ia: { priorite: 3, quand: debut_combat }"""),
ennemi('colosse-de-siege', 'Colosse de siège', "Un golem d'obsidienne haut comme une tour, veiné de lave, que la Légion pousse contre le Mur. Il ne s'arrête jamais.", 32, 'elite', 'construction', sprite='golem-d-obsidienne', facteur_pv=1.1,
  attaques=[("Poing d'obsidienne", "écrase {cible} d'un poing noir", 'impact'), ("Coulée de lave", "laisse couler de la lave sur {cible}", 'feu')],
  resistances={'physique': 0.3, 'poison': 1.0, 'feu': 0.5, 'glace': -0.3, 'foudre': -0.2},
  competences="""- id: secousse
  nom: Secousse
  description: "Il frappe le sol : tout tremble."
  recharge: 3
  cible: tous_ennemis
  effets: [{ type: degats, puissance: 14, stat: FOR }]
  ia: { priorite: 3 }"""),
ennemi('vorthak-seigneur', 'Vorthak, Seigneur de guerre', "L'émissaire de la Fête des Lanternes est revenu. Il a grandi, ses cornes aussi. Il commande l'assaut du Mur d'Aube.", 31, 'boss', 'demon', element='ombre', sprite='chevalier-cendre', facteur_pv=0.75,
  attaques=[("Lame cendrée", "abat sa lame noire sur {cible}", 'ombre'), ("Flammes violettes", "enveloppe {cible} de flammes violettes", 'ombre')],
  resistances={'feu': 0.5, 'ombre': 0.5, 'sacre': -0.25},
  competences="""- id: vague-violette
  nom: Vague violette
  description: "Une vague de flammes violettes balaie le rempart."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 15, stat: FOR, element: ombre }
    - { type: etat, etat: brulure, duree: 2, valeur: 10, chance: 0.5 }
  ia: { priorite: 4 }
- id: rage-du-seigneur
  nom: Rage du seigneur
  description: "Ses blessures le rendent fou."
  recharge: 5
  cible: soi
  effets: [{ type: etat, etat: bonus_degats, duree: 3, valeur: 0.25 }]
  ia: { priorite: 4, quand: soi_blesse }"""),
ennemi('champion-de-la-guilde', 'Le Champion de l\'épreuve', "Un guerrier masqué, en armure d'argent sans blason. Personne ne connaît son visage : il est l'épreuve du rang S depuis cent ans.", 31, 'boss', 'humanoide', stat='AGI', sprite='bandit', facteur_pv=0.6,
  attaques=[("Lame d'argent", "frappe {cible} d'une lame d'argent", 'entaille'), ("Feinte", "trompe {cible} d'une feinte parfaite", 'entaille')],
  resistances={'physique': 0.1},
  competences="""- id: mille-lames
  nom: Mille lames
  description: "Une pluie de coups, si rapides qu'on ne les voit pas."
  recharge: 3
  cible: ennemi
  effets: [{ type: degats, puissance: 9, stat: AGI, coups: 3 }]
  ia: { priorite: 3 }
- id: garde-parfaite
  nom: Garde parfaite
  description: "Il ne laisse plus aucune ouverture."
  recharge: 4
  cible: soi
  effets: [{ type: etat, etat: bonus_defense, duree: 2, valeur: 0.3 }]
  ia: { priorite: 3, quand: soi_blesse }"""),
ennemi('aldric-prince-noir', 'Aldric, le Prince Noir', "Le frère de Séraphine, disparu en 1009. Armure noire, cape bleue en lambeaux, et des yeux où brûle une lueur violette.", 33, 'boss', 'humanoide', element='ombre', sprite='chevalier-cendre', facteur_pv=0.75,
  attaques=[("Épée royale corrompue", "frappe {cible} de l'épée des princes d'Aubeclaire", 'ombre'), ("Revers de cape", "aveugle {cible} d'un revers de cape", 'impact')],
  resistances={'ombre': 0.4, 'sacre': -0.2},
  competences="""- id: serment-brise
  nom: Serment brisé
  description: "Il crie un serment de chevalier, à l'envers. L'ombre répond."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 14, stat: FOR, element: ombre }
    - { type: etat, etat: malus_defense, duree: 2, valeur: 0.15, chance: 0.5 }
  ia: { priorite: 4 }
- id: ombre-protectrice
  nom: Ombre protectrice
  description: "L'ombre se referme sur ses blessures."
  recharge: 5
  cible: soi
  effets: [{ type: soin, puissance: 30, stat: VIT }]
  ia: { priorite: 4, quand: soi_blesse }"""),
ennemi('gardien-de-la-breche', 'Le Gardien de la Brèche', "Un colosse d'obsidienne enchaîné à la porte des Terres Cendrées. Il garde le passage depuis la première Déchirure.", 34, 'boss', 'construction', sprite='golem-d-obsidienne', facteur_pv=0.8,
  attaques=[("Chaîne d'obsidienne", "fouette {cible} de ses chaînes", 'impact'), ("Poing de lave", "écrase {cible} d'un poing de lave", 'feu')],
  resistances={'physique': 0.3, 'poison': 1.0, 'feu': 0.5, 'glace': -0.2, 'sacre': -0.2},
  competences="""- id: tremblement
  nom: Tremblement des Cendres
  description: "Le sol se fend : de la lave jaillit sous le groupe."
  recharge: 3
  cible: tous_ennemis
  effets:
    - { type: degats, puissance: 15, stat: FOR, element: feu }
    - { type: etat, etat: brulure, duree: 2, valeur: 10, chance: 0.5 }
  ia: { priorite: 4 }"""),
]

RENCONTRES = [
  '{ id: mur-diablotins, nom: "Nuée de diablotins", fond: rempart, ennemis: [{ id: diablotin }, { id: diablotin }, { id: diablotin }], renforts: [diablotin] }',
  '{ id: mur-gelees, nom: "Les gelées cendrées", fond: breche, ennemis: [{ id: gelee-cendree }, { id: gelee-cendree }, { id: diablotin, rang: arriere }], renforts: [gelee-cendree] }',
  '{ id: mur-chiens, nom: "Les chiens des enfers", fond: plaine-cendree, ennemis: [{ id: chien-des-enfers }, { id: chien-des-enfers }], renforts: [chien-des-enfers] }',
  '{ id: mur-legion, nom: "Une patrouille de la Légion", fond: rempart, ennemis: [{ id: legionnaire-cendre }, { id: legionnaire-cendre }, { id: pretre-des-cendres, rang: arriere }], renforts: [legionnaire-cendre] }',
  '{ id: mur-capitaine, nom: "Le capitaine de la Légion", fond: camp, ennemis: [{ id: capitaine-cendre }, { id: legionnaire-cendre }], renforts: [legionnaire-cendre] }',
  '{ id: chute-colosse, nom: "Le colosse de siège", fond: breche, fuite_possible: false, ennemis: [{ id: colosse-de-siege }, { id: diablotin, rang: arriere }], renforts: [diablotin] }',
  '{ id: chute-vorthak, nom: "Vorthak, Seigneur de guerre", fond: rempart, fuite_possible: false, ennemis: [{ id: vorthak-seigneur }, { id: legionnaire-cendre }], renforts: [legionnaire-cendre] }',
  '{ id: epreuve-rang-s, nom: "L\'épreuve du rang S", fond: arene, fuite_possible: false, ennemis: [{ id: champion-de-la-guilde }] }',
  '{ id: aldric-combat, nom: "Aldric, le Prince Noir", fond: plaine-cendree, fuite_possible: false, ennemis: [{ id: aldric-prince-noir }, { id: chien-des-enfers }], renforts: [chien-des-enfers] }',
  '{ id: contre-offensive, nom: "La contre-offensive", fond: plaine-cendree, fuite_possible: false, ennemis: [{ id: capitaine-cendre }, { id: pretre-des-cendres, rang: arriere }], renforts: [legionnaire-cendre] }',
  '{ id: breche-gardien, nom: "Le Gardien de la Brèche", fond: breche, fuite_possible: false, ennemis: [{ id: gardien-de-la-breche }, { id: gelee-cendree }], renforts: [gelee-cendree] }',
]
