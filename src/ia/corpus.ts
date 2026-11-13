/**
 * Corpus d'entraînement de l'IA maison : des modèles de phrases par intention.
 * Le générateur (scripts/entrainer-ia.ts) remplace les cases {E}, {A}, {P}, {C}, {C2}, {EL}
 * par des valeurs variées, ajoute des formules d'introduction et des fautes de frappe,
 * puis entraîne le classificateur sur plusieurs milliers de phrases.
 * Pour améliorer la compréhension : ajouter des modèles ici, puis `npm run ia:entrainer`.
 */
export const INTENTIONS = [
  'attaquer', 'competence', 'viser', 'defendre', 'proteger', 'fuir', 'se_cacher', 'soigner', 'bombe', 'voler',
  'pacifier', 'changer_rang', 'fusionner', 'analyser', 'provoquer', 'invoquer',
] as const;
export type Intention = (typeof INTENTIONS)[number] | 'inconnu';

export const MODELES: Record<(typeof INTENTIONS)[number], string[]> = {
  attaquer: [
    'je lui colle une beigne', 'je lui mets une raclée', "je l'étripe", 'je lui fous un pain', 'je lui mets une mandale', 'coup de boule dans {E}', "je l'éventre", 'je lui ouvre le ventre', 'je le transperce', 'je lui donne un coup de pied', 'je le roue de coups', "je cours vers {E} et je l'attaque", 'je fonce dans le tas', 'je lui assène un coup', 'je lui envoie un coup de hache',
    "j'attaque {E}", 'je frappe {E}', "je tape {E}", 'je cogne {E}', "je fonce sur {E} et je le frappe", "je charge {E}",
    "je donne un coup d'épée à {E}", 'coup de poing sur {E}', 'attaque normale sur {E}', 'je tranche {E}', "je l'attaque",
    'je saute sur {E} et je frappe', 'je me jette sur {E}', 'je lui mets un coup', 'je plante ma lame dans {E}', 'je découpe {E}',
    "j'embroche {E}", 'je pourfends {E}', 'je tire une flèche sur {E}', 'je lui tire dessus', 'frappe {E}', 'attaque', 'je cogne dessus',
    "je l'éclate", 'je lui défonce la tronche', 'coup de dague dans {E}', 'je lui rentre dedans', 'on attaque {E}', 'taper le plus faible',
    'je frappe le plus faible', "j'achève {E}", 'je termine {E}', 'je lui file un coup de bouclier', 'je donne un coup de masse à {E}',
  ],
  competence: [
    'je déchaîne la {EL} sur {E}', "je fais s'abattre la {EL} sur eux", 'pluie de {EL}', 'je canalise ma magie de {EL}', 'avec ma magie je brûle {E}', 'je fais jaillir la {EL}', "j'invoque la {EL} contre {E}", '{C} sur lui', '{C} direct', 'je tente un {C}', 'sort de {EL}', "je l'électrocute", 'je le congèle', "je l'immole",
    "j'utilise {C} sur {E}", 'je lance {C} sur {E}', '{C} sur {E}', 'je lance {C}', "j'utilise {C}", '{C} !', 'je déclenche {C}',
    'je fais {C} sur {E}', 'technique {C}', "j'envoie {C} sur {E}", 'je balance {C}', 'je tente {C} contre {E}', 'je prépare {C}',
    'je canalise {C}', 'je récite {C}', 'compétence {C} sur {E}', 'je lui envoie un {C}', 'je fais un {C}', 'je lance mon sort sur {E}',
    "j'utilise ma compétence sur {E}", 'je lance un sort', 'je jette un sort de {EL} sur {E}', 'je lui lance une boule de {EL}',
    'je projette du {EL} sur {E}', "j'enflamme {E}", 'je gèle {E}', 'je foudroie {E}', 'je fais pleuvoir de la {EL}', 'magie de {EL} sur {E}',
  ],
  viser: [
    'je vise {P} de {E}', 'je vise {P}', 'je frappe {E} à {P}', 'je lui tire dans {P}', 'un coup dans {P}', 'je vise {P} pour le ralentir',
    'je vise {P} pour le désarmer', 'je tranche {P} de {E}', 'je lui coupe {P}', 'je tire une flèche dans {P} de {E}', 'je vise la tête',
    'je vise les jambes', 'je vise son arme', 'je frappe au visage', 'coup à la gorge', 'je lui crève un oeil', 'je fauche ses jambes',
    'je frappe son poignet pour lui faire lâcher son arme', 'balayage dans les jambes', 'je vise le point faible de {E}', 'tir précis dans {P}',
  ],
  defendre: [
    'je me défends', 'je me mets en garde', 'je lève mon bouclier', 'je pare', "je me protège", 'défense', 'je bloque',
    "je reste sur la défensive", "j'encaisse", 'je me prépare à parer', 'je me couvre', 'posture défensive', 'je garde ma position',
    'je ne bouge pas et je me protège', 'je me recroqueville derrière mon bouclier', "j'attends en garde", 'je passe mon tour en défense',
  ],
  proteger: [
    'je protège {A}', 'je me mets devant {A}', "je couvre {A}", 'bouclier sur {A}', "je m'interpose pour protéger {A}", 'je défends {A}',
    'je fais un rempart pour {A}', 'je protège mes alliés', "je protège l'équipe", 'je mets un bouclier à {A}', 'je garde {A}',
  ],
  fuir: [
    'fuyez', 'il faut fuir', 'je me barre', 'on file', 'je détale', 'je file à toute vitesse', "je m'en vais d'ici", 'courez', 'je tourne les talons', 'je pars en courant', 'on abandonne le combat',
    'je fuis', "je m'enfuis", 'on se casse', 'on fuit', 'je prends la fuite', 'je cours', 'retraite', 'on bat en retraite', 'je me sauve',
    'je déguerpis', "je m'échappe", 'sauve qui peut', 'on se replie', 'je recule et je fuis le combat', 'on dégage d ici', 'je quitte le combat',
  ],
  se_cacher: [
    'je me cache', 'je me planque', 'je me cache derrière {OB}', 'je disparais dans les ombres', 'je me fonds dans le décor',
    'je me rends invisible', "je me camoufle", 'je me dissimule', 'je me faufile dans son dos', 'je passe en furtif', 'je me tapis dans le noir',
    'je me planque derrière {OB} pour le surprendre', "je m'efface dans l'ombre", 'je deviens discret',
  ],
  soigner: [
    '{CS} sur {A}', 'je lance {CS}', '{CS}', 'je soigne avec {CS}', 'je redonne de la santé à {A}', 'je soigne les blessés', 'je me retape', 'je rends la vie à {A}',
    'je soigne {A}', 'je me soigne', 'je bois une potion', 'potion', 'je prends une potion', 'je donne une potion à {A}', 'je guéris {A}',
    'je soigne le groupe', 'je régénère {A}', 'soin sur {A}', 'je panse les blessures de {A}', 'je récupère des PV', 'heal {A}',
    'je me heal', 'je bois une fiole de soin', 'je rends des PV à {A}', 'je prie pour soigner {A}', 'je refais la vie de {A}',
  ],
  bombe: [
    'je lance une bombe', 'je jette une bombe sur {E}', 'je balance un explosif', 'grenade sur {E}', 'je fais tout exploser', 'bombe sur le groupe',
    'je lance un explosif sur eux', 'je jette une fiole explosive',
  ],
  voler: [
    'je prends mon envol', "je m'élance dans le ciel", 'je fonds du ciel sur {E}', 'je bats des ailes', "je reste en l'air", "je vole en cercle au dessus d'eux",
    "je m'envole", 'je vole au dessus de {E}', 'je décolle', "je m'élève dans les airs", 'je vole jusqu à {E}', 'je plane au dessus du combat',
    "je déploie mes ailes", 'je survole le champ de bataille', 'je vole pour attaquer {E} par le haut', "je m'envole pour esquiver",
  ],
  pacifier: [
    'je lui dis de partir', "je lui ordonne de s'éloigner", "je l'apaise", "je lui fais comprendre qu'on ne lui veut pas de mal", 'je tends la main vers {E}', 'je murmure à {E}', 'je convaincs {E} de partir',
    'je parle à {E}', 'je calme {E}', "j'essaie de raisonner {E}", 'je négocie avec {E}', 'je lui demande de partir', 'je lui parle doucement',
    "j'apprivoise {E}", 'je tente de pacifier {E}', 'je lui propose de se rendre', 'je discute avec {E}', 'je dis à {E} de fuir',
  ],
  changer_rang: [
    'je me place derrière {A}', "je passe à l'arrière", 'je rejoins le premier rang', "je me mets à l'abri derrière les autres",
    "j'avance", 'je recule', 'je passe devant', 'je passe derrière', 'je me mets en première ligne', 'je recule au second rang',
    'je change de rang', 'je reviens en arrière', 'je monte au front', "je me replie à l'arrière", 'je vais devant', 'je me mets derrière le tank',
  ],
  fusionner: [
    'je combine {C} et {C2}', 'je mélange {C} avec {C2}', 'je fusionne {C} et {C2}', '{C} et {C2} en même temps', '{C} plus {C2}',
    'je combine {EL} et {EL2}', 'je mélange le {EL} et la {EL2}', 'je fais une fusion {EL} {EL2}', 'je mixe {C} et {C2} sur {E}',
    "j'associe {C} à {C2}", 'combo {C} {C2}', 'je fusionne mes deux sorts', 'je crée une nouvelle technique avec {C} et {C2}',
  ],
  analyser: [
    'je cherche ses faiblesses', "je l'inspecte", 'quelle est sa faiblesse', 'je jauge {E}', "j'évalue sa santé",
    "j'observe {E}", "j'analyse {E}", 'je regarde ses faiblesses', 'quelles sont ses faiblesses', 'je scanne {E}', 'je cherche son point faible',
    'combien de PV il lui reste', "j'examine {E}", 'je l étudie', 'il est fort contre quoi', 'je regarde ses stats',
  ],
  provoquer: [
    'je provoque {E}', 'je provoque tout le monde', "j'attire leur attention", 'je les nargue', 'je hurle pour attirer les ennemis sur moi',
    'je les insulte pour qu ils me ciblent', 'venez vous battre', 'je fais diversion', 'provocation',
  ],
  invoquer: [
    "j'invoque une créature", "j'invoque un golem", "j'appelle mon familier", 'je fais apparaître un allié', 'invocation', "j'invoque des renforts",
    'je convoque un esprit', 'je pose une tourelle', "j'appelle à l'aide une bête",
  ],
};

export const REMPLISSAGE = {
  E: ['le loup', 'ce loup', 'le squelette', 'ce gobelin', 'le bandit', 'le mage', "l'ennemi", 'la bête', 'le golem', 'le cultiste', 'ce monstre', 'le chef',
    "l'araignée", 'le rat', 'la gelée', 'le démon', 'lui', 'le premier', 'celui de gauche', 'le plus faible', 'le gros', 'le boss', 'Vorthak', 'le sanglier'],
  A: ['Aveline', 'moi', 'mon ami', 'le gardien', 'ma camarade', 'notre guérisseur', 'Kael', 'Ilo', 'le groupe', 'mon allié', 'tout le monde', "l'équipe"],
  P: ['la tête', 'le crâne', 'les yeux', 'la gorge', 'le visage', 'les jambes', 'le genou', 'les pieds', 'les chevilles', 'le bras', 'sa main', 'son arme', 'le poignet'],
  EL: ['feu', 'flamme', 'glace', 'givre', 'foudre', 'éclair', 'lumière', 'ombre', 'poison', 'venin'],
  EL2: ['glace', 'feu', 'foudre', 'poison', 'ombre', 'lumière'],
  CS: ['lumière apaisante', 'prière de groupe', 'hymne de guérison', 'purification', 'souffle des ancêtres'],
  OB: ['un pilier', 'une colonne', 'un arbre', 'un tonneau', 'un rocher', 'la fumée', 'un mur'],
  INTRO: ['', '', '', '', 'je vais ', 'je veux ', 'allez ', 'bon ', 'ok ', 'vas y ', 'maintenant ', 'tant pis ', "j'essaie de ", 'du coup '],
  FIN: ['', '', '', '', ' !', ' vite', ' de toutes mes forces', ' tout de suite', ' sans réfléchir', ' fort'],
};
