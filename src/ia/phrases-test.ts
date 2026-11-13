/**
 * Phrases de test écrites à la main, JAMAIS utilisées pour l'entraînement :
 * elles mesurent si l'IA comprend des tournures qu'elle n'a pas vues.
 */
export const PHRASES_TEST: { texte: string; intention: string }[] = [
  // attaquer
  { texte: 'Je fonce dans le tas et je frappe le premier loup', intention: 'attaquer' },
  { texte: "je lui assène un grand coup d'épée", intention: 'attaquer' },
  { texte: 'coup de hache sur le bandit', intention: 'attaquer' },
  { texte: 'je cours vers le squelette et je le défonce', intention: 'attaquer' },
  { texte: 'je décoche une flèche sur le gobelin', intention: 'attaquer' },
  { texte: 'jattaque le rat', intention: 'attaquer' },
  { texte: 'je mets une grosse patate au golem', intention: 'attaquer' },
  { texte: 'frappe simple sur celui qui est blessé', intention: 'attaquer' },
  { texte: "j'éventre la bête avec ma dague", intention: 'attaquer' },
  // compétence
  { texte: 'je lance un javelot de flamme sur le loup', intention: 'competence' },
  { texte: 'onde de givre !', intention: 'competence' },
  { texte: "j'utilise entaille runique sur le squelette", intention: 'competence' },
  { texte: 'je balance une boule de feu au cultiste', intention: 'competence' },
  { texte: 'je fais tomber la foudre sur eux', intention: 'competence' },
  { texte: 'je lance un sort de glace', intention: 'competence' },
  { texte: 'lame empoisonnee sur le bandit', intention: 'competence' },
  { texte: 'je déclenche ma rune de garde', intention: 'competence' },
  { texte: "je l'enflamme avec ma magie", intention: 'competence' },
  // viser
  { texte: 'je vise la tete du loup', intention: 'viser' },
  { texte: 'je lui tranche les jarrets pour qu il ne puisse plus avancer', intention: 'viser' },
  { texte: "je tire dans l'oeil du golem", intention: 'viser' },
  { texte: "je frappe sa main pour qu'il lâche son épée", intention: 'viser' },
  { texte: 'coup précis au crâne', intention: 'viser' },
  { texte: 'je vise ses genoux', intention: 'viser' },
  // défendre
  { texte: 'je me mets en position de défense', intention: 'defendre' },
  { texte: 'je lève ma garde et j attends', intention: 'defendre' },
  { texte: 'je bloque avec mon bouclier', intention: 'defendre' },
  { texte: "je reste prudent et je pare les coups", intention: 'defendre' },
  { texte: 'défense totale', intention: 'defendre' },
  // protéger
  { texte: "je m'interpose devant Aveline", intention: 'proteger' },
  { texte: 'je protège le guérisseur', intention: 'proteger' },
  { texte: 'je mets mon bouclier devant mon pote', intention: 'proteger' },
  // fuir
  { texte: 'on se tire de là !', intention: 'fuir' },
  { texte: 'je prends mes jambes à mon cou', intention: 'fuir' },
  { texte: 'retraite générale', intention: 'fuir' },
  { texte: "je m'échappe par la porte", intention: 'fuir' },
  { texte: 'fuyons', intention: 'fuir' },
  // se cacher
  { texte: 'je me cache derrière la colonne', intention: 'se_cacher' },
  { texte: 'je me fonds dans l ombre pour le surprendre', intention: 'se_cacher' },
  { texte: 'je me planque', intention: 'se_cacher' },
  { texte: 'je deviens invisible', intention: 'se_cacher' },
  // soigner
  { texte: 'je soigne Aveline', intention: 'soigner' },
  { texte: 'je bois ma potion de soin', intention: 'soigner' },
  { texte: 'je me soigne vite fait', intention: 'soigner' },
  { texte: 'lumière apaisante sur Kael', intention: 'soigner' },
  { texte: 'je redonne de la vie au groupe', intention: 'soigner' },
  { texte: 'je guéris mes blessures', intention: 'soigner' },
  // bombe
  { texte: 'je balance une bombe au milieu', intention: 'bombe' },
  { texte: 'je jette un explosif sur les gobelins', intention: 'bombe' },
  // voler
  { texte: "je m'envole au dessus du golem", intention: 'voler' },
  { texte: 'je vole pour esquiver ses attaques', intention: 'voler' },
  { texte: 'je décolle et je plonge sur lui', intention: 'voler' },
  // pacifier
  { texte: "je parle au loup pour qu'il s'en aille", intention: 'pacifier' },
  { texte: 'je tente de calmer la bête', intention: 'pacifier' },
  { texte: 'je négocie avec le bandit', intention: 'pacifier' },
  // changer de rang
  { texte: 'je recule derrière le gardien', intention: 'changer_rang' },
  { texte: 'je passe en première ligne', intention: 'changer_rang' },
  { texte: "j'avance au front", intention: 'changer_rang' },
  // fusionner
  { texte: 'je combine javelot de flamme et onde de givre', intention: 'fusionner' },
  { texte: 'je mélange le feu et la glace', intention: 'fusionner' },
  { texte: 'fusion de mes deux sorts', intention: 'fusionner' },
  { texte: 'je mixe ma lame empoisonnée avec mon pas d ombre', intention: 'fusionner' },
  // analyser
  { texte: "j'observe le golem pour trouver une faiblesse", intention: 'analyser' },
  { texte: "c'est quoi son point faible ?", intention: 'analyser' },
  { texte: 'je regarde combien de vie il lui reste', intention: 'analyser' },
  // provoquer
  { texte: 'je provoque les squelettes', intention: 'provoquer' },
  { texte: 'je crie pour attirer les ennemis vers moi', intention: 'provoquer' },
  // invoquer
  { texte: "j'invoque mon golem", intention: 'invoquer' },
  { texte: "j'appelle une créature à l'aide", intention: 'invoquer' },
];
