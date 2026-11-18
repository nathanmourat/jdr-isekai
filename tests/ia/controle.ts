/**
 * Jeu de contrôle de l'IA de combat : 60 phrases écrites APRÈS les réglages (18/11), jamais utilisées pour régler
 * l'IA ni pour l'entraîner. Elles donnent une mesure honnête de ce que l'IA fera face à des phrases nouvelles :
 * le banc d'essai (banc.ts), lui, a servi à repérer les erreurs pendant les réglages.
 * Règle : ne jamais modifier l'IA pour faire passer une phrase de ce fichier ; en ajouter de nouvelles après chaque test.
 */
import type { PhraseBanc } from './banc';

const C: PhraseBanc[] = [];
const p = (qui: string, niveau: 1 | 2 | 3, categorie: string, texte: string, attendu: PhraseBanc['attendu']) => { C.push({ qui, niveau, categorie, texte, attendu }); };

p('G-brann', 2, 'attaquer', 'jlui colle un coup de marteau au gobelin c', { a: 'attaque', c: 'gobC' });
p('G-brann', 2, 'attaquer', 'je cogne le b', { a: 'attaque', c: 'gobB' });
p('G-brann', 3, 'attaquer', 'Je fais tournoyer mon marteau et je le fracasse sur le gobelin A', { a: 'attaque', c: 'gobA' });
p('G-lyra', 2, 'attaquer', 'coup de baton sur le gob c', { a: 'attaque', c: 'gobC' });
p('L-sylvan', 2, 'attaquer', 'tir sur le loup c', { a: 'attaque', c: 'loupC' });
p('L-sylvan', 1, 'attaquer', "J'envoie une flèche au loup A", { a: 'attaque', c: 'loupA' });
p('V-brann', 2, 'attaquer', 'tape vorthak fort', { a: 'attaque', c: 'vorthak' });
p('A-nox', 2, 'attaquer', 'jattaque le loup qui a le moins de pv', { a: 'attaque', c: 'loupA' });
p('G-zed', 2, 'cibles', 'javelot sur celui du fond', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('G-brann', 2, 'cibles', 'je finis le gobelin presque mort', { a: 'attaque', c: 'gobB' });
p('G-brann', 2, 'cibles', 'remet lui un coup', { a: 'attaque', c: 'gobC' });
p('L-sylvan', 2, 'cibles', 'achève le plus faible', { a: 'attaque', c: 'loupB' });
p('G-zed', 1, 'competence', 'Éclair en chaîne', { a: 'competence', k: 'eclair-en-chaine' });
p('G-zed', 2, 'competence', 'je balance de la glace sur tout le monde', { a: 'competence', k: 'onde-de-givre' });
p('G-zed', 2, 'competence', 'fireball sur le cultiste', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('L-sylvan', 2, 'competence', 'volee desprits', { a: 'competence', k: 'volee-d-esprits' });
p('A-nox', 2, 'competence', 'tourelle !', { a: 'competence', k: 'tourelle-mecanique' });
p('A-nox', 3, 'competence', "Je lance un pot de colle explosive sur le loup B pour qu'il reste collé au sol", { a: 'competence', k: 'bombe-collante', c: 'loupB' });
p('G-lyra', 2, 'soigner', 'soigne zed vite il va mourir', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'jsoigne la naine', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 2, 'soigner', 'soin a toto', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 1, 'soigner', 'Je soigne Kaya, elle saigne', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 2, 'soigner', 'soin de groupe stp', { a: 'competence', k: ['priere-de-groupe', 'purification'] });
p('G-lyra', 3, 'soigner', "J'impose les mains sur Brann pour refermer ses blessures", { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 2, 'soigner', 'heal moi', { a: 'competence', k: 'lumiere-apaisante', c: 'lyra' });
p('G-zed', 2, 'potion', 'je bois une popo de soin', { a: 'potion', c: 'zed' });
p('G-brann', 2, 'potion', 'potion pour la louve', { a: 'potion', c: 'kaya' });
p('A-nox', 1, 'potion', 'Je bois une potion de soin', { a: 'potion', c: 'nox' });
p('G-brann', 2, 'proteger', 'bouclier sur kaya', { a: 'competence', k: 'bouclier-d-aube', c: 'kaya' });
p('G-brann', 2, 'proteger', 'protege la prêtresse', { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('V-brann', 3, 'proteger', "Je m'interpose entre Vorthak et Zed", { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 2, 'defendre', 'je me met en garde', { a: 'defendre' });
p('L-sylvan', 2, 'defendre', 'jesquive', { a: 'defendre' });
p('G-brann', 2, 'provoquer', 'jles provoc', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 3, 'provoquer', 'Je tape sur mon bouclier en criant pour que les gobelins viennent sur moi', { a: 'competence', k: 'provocation-sainte' });
p('L-sylvan', 2, 'fuir', 'on se tire', { a: 'fuir' });
p('A-nox', 2, 'fuir', 'jme sauve', { a: 'fuir' });
p('L-sylvan', 2, 'se_cacher', 'je me cache derriere un rocher', { a: 'se_cacher' });
p('G-brann', 2, 'changer_rang', 'jvais derriere', { a: 'changer_rang' });
p('A-nox', 2, 'bombe', 'jlance ma bombe', { a: 'bombe' });
p('L-sylvan', 2, 'pacifier', 'je parle au loup qui boite', { a: 'pacifier', c: 'loupB' });
p('G-zed', 2, 'analyser', 'jregarde leurs pv', { a: 'analyser' });
p('G-zed', 2, 'fusion', 'combo feu glace sur le cultiste', { a: 'fusion' });
p('G-lyra', 2, 'voler', 'je saute et je vole', { a: 'refus' });
p('G-zed', 2, 'multi', 'je me cache et je lance un sort', { a: 'se_cacher' });
p('G-brann', 2, 'multi', 'protege kaya puis attaque', { a: 'competence', k: 'bouclier-d-aube', c: 'kaya' });
p('L-sylvan', 3, 'multi', "D'abord je bois une potion, ensuite je tire sur le loup B", { a: 'potion', c: 'sylvan' });
p('G-brann', 2, 'negation', 'je fuis pas, je tape le gobelin c', { a: 'attaque', c: 'gobC' });
p('G-zed', 2, 'negation', 'pas de glace, du feu sur le cultiste', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('G-lyra', 2, 'negation', 'je soigne pas brann, je soigne kaya', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-brann', 3, 'creatif', 'Je lance un tabouret sur le gobelin A', { a: 'attaque', c: 'gobA' });
p('L-sylvan', 3, 'creatif', 'Je lui jette de la poussière dans les yeux', { a: 'viser', p: 'tete' });
p('G-brann', 3, 'creatif', 'Je fais un croche-patte au gobelin B', { a: 'viser', p: 'jambes', c: 'gobB' });
p('G-zed', 2, 'question', 'onde de givre ou eclair en chaine', { a: 'question' });
p('G-lyra', 2, 'question', 'jsoigne brann ou kaya ?', { a: 'question' });
p('G-zed', 2, 'question', 'une idee ?', { a: 'question' });
p('V-zed', 2, 'question', 'je fais quoi', { a: 'question' });
p('G-zed', 2, 'hors_sujet', 'mdr', { a: 'question' });
p('G-zed', 2, 'hors_sujet', 'il fait beau', { a: 'question' });
p('G-brann', 2, 'question', 'jtape le cultiste du fond', { a: 'question' });

export const CONTROLE: PhraseBanc[] = C;
