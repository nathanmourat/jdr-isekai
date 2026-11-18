/**
 * Banc d'essai de l'IA de combat : phrases écrites à la main, comme des joueurs les taperaient vite.
 * JAMAIS utilisées pour l'entraînement (ne pas copier ces phrases dans src/ia/corpus.ts).
 * Figé le 18/11 avant d'enrichir le corpus : on ne le modifie plus pour « faire passer » l'IA.
 *
 * Chaque phrase : qui joue (combat-héros, voir scenarios.ts), difficulté (1 propre, 2 fautes/SMS/familier,
 * 3 long/indirect/créatif), catégorie (intention), texte, et action attendue :
 *   a : attaque | viser | competence | potion | bombe | defendre | fuir | se_cacher | changer_rang | pacifier
 *       | fusion | analyser | question (l'IA doit demander) | refus (l'IA doit expliquer que c'est impossible)
 *   c : cible attendue (alias de scenarios.ts) ; k : compétence(s) acceptée(s) ; p : partie visée
 */
export interface Attendu { a: string; c?: string; k?: string | string[]; p?: string }
export interface PhraseBanc { qui: string; niveau: 1 | 2 | 3; categorie: string; texte: string; attendu: Attendu }

const B: PhraseBanc[] = [];
const p = (qui: string, niveau: 1 | 2 | 3, categorie: string, texte: string, attendu: Attendu) => { B.push({ qui, niveau, categorie, texte, attendu }); };

// ───────────── attaquer ─────────────
p('G-lyra', 1, 'attaquer', "J'attaque le gobelin B", { a: 'attaque', c: 'gobB' });
p('G-lyra', 1, 'attaquer', 'Je frappe le cultiste', { a: 'attaque', c: 'cult' });
p('G-brann', 1, 'attaquer', 'Je frappe le gobelin A', { a: 'attaque', c: 'gobA' });
p('G-brann', 1, 'attaquer', "J'attaque le gobelin C avec mon marteau", { a: 'attaque', c: 'gobC' });
p('G-zed', 1, 'attaquer', 'Attaque simple sur le gobelin A', { a: 'attaque', c: 'gobA' });
p('L-sylvan', 1, 'attaquer', 'Je tire une flèche sur le loup A', { a: 'attaque', c: 'loupA' });
p('L-sylvan', 1, 'attaquer', 'Je décoche une flèche sur le loup C', { a: 'attaque', c: 'loupC' });
p('A-nox', 1, 'attaquer', "J'attaque le loup B", { a: 'attaque', c: 'loupB' });
p('V-brann', 1, 'attaquer', "J'attaque Vorthak", { a: 'attaque', c: 'vorthak' });
p('V-zed', 1, 'attaquer', 'Je frappe Vorthak avec mon bâton', { a: 'attaque', c: 'vorthak' });
p('G-brann', 2, 'attaquer', 'jtape le gobelin a', { a: 'attaque', c: 'gobA' });
p('G-brann', 2, 'attaquer', 'JE FRAPPE LE GOBELIN B', { a: 'attaque', c: 'gobB' });
p('G-brann', 2, 'attaquer', 'je tappe le goblin c', { a: 'attaque', c: 'gobC' });
p('G-brann', 2, 'attaquer', 'je cogne le gobelan A', { a: 'attaque', c: 'gobA' });
p('G-lyra', 2, 'attaquer', 'jattak le cultist', { a: 'attaque', c: 'cult' });
p('G-zed', 2, 'attaquer', 'tape le gob b', { a: 'attaque', c: 'gobB' });
p('L-sylvan', 2, 'attaquer', 'je tir sur le loup c', { a: 'attaque', c: 'loupC' });
p('L-sylvan', 2, 'attaquer', 'jtire sur le lou a', { a: 'attaque', c: 'loupA' });
p('A-nox', 2, 'attaquer', 'j attaque le loup a', { a: 'attaque', c: 'loupA' });
p('V-brann', 2, 'attaquer', 'je défonce vortak', { a: 'attaque', c: 'vorthak' });
p('V-brann', 2, 'attaquer', 'jlui met une patate a vorthak', { a: 'attaque', c: 'vorthak' });
p('G-brann', 2, 'attaquer', 'go taper le gobelin A', { a: 'attaque', c: 'gobA' });
p('G-brann', 2, 'attaquer', 'attak gob A', { a: 'attaque', c: 'gobA' });
p('L-sylvan', 2, 'attaquer', 'flèche dans le loup C stp', { a: 'attaque', c: 'loupC' });
p('G-lyra', 2, 'attaquer', 'je lui en colle une au cultiste', { a: 'attaque', c: 'cult' });
p('G-brann', 3, 'attaquer', "Je m'avance d'un pas lourd et j'abats mon marteau de toutes mes forces sur le gobelin A", { a: 'attaque', c: 'gobA' });
p('G-brann', 3, 'attaquer', "Je cours vers le gobelin C en hurlant et je lui mets un énorme coup", { a: 'attaque', c: 'gobC' });
p('L-sylvan', 3, 'attaquer', "Je bande mon arc, je prends mon temps et je décoche sur le loup A", { a: 'attaque', c: 'loupA' });
p('V-brann', 3, 'attaquer', "Pour Lysmont ! Je me jette sur Vorthak et je frappe", { a: 'attaque', c: 'vorthak' });
p('A-nox', 3, 'attaquer', "Je sors ma dague et je pique le loup B là où ça fait mal", { a: 'attaque', c: 'loupB' });
p('G-brann', 1, 'attaquer', "J'attaque", { a: 'attaque' });
p('G-zed', 2, 'attaquer', 'jattaque', { a: 'attaque' });
p('V-zed', 2, 'attaquer', 'frappe', { a: 'attaque', c: 'vorthak' });

// ───────────── cibles décrites ─────────────
p('G-brann', 1, 'cibles', 'Je frappe le plus faible', { a: 'attaque', c: 'gobB' });
p('G-brann', 1, 'cibles', "J'attaque celui qui est blessé", { a: 'attaque', c: 'gobB' });
p('G-brann', 2, 'cibles', 'je tape celui qui est presque mort', { a: 'attaque', c: 'gobB' });
p('G-brann', 2, 'cibles', 'achève le gobelin blessé', { a: 'attaque', c: 'gobB' });
p('G-zed', 2, 'cibles', 'jfinis celui qui a plus de vie', { a: 'attaque', c: 'gobB' });
p('G-brann', 1, 'cibles', 'Je frappe le même', { a: 'attaque', c: 'gobC' });
p('G-brann', 2, 'cibles', 'encore le meme', { a: 'attaque', c: 'gobC' });
p('G-brann', 2, 'cibles', 'je le refrappe', { a: 'attaque', c: 'gobC' });
p('G-lyra', 1, 'cibles', 'Je le frappe encore', { a: 'attaque', c: 'gobC' });
p('G-brann', 2, 'cibles', 'je frappe lui', { a: 'attaque', c: 'gobC' });
p('G-brann', 2, 'cibles', 'je lui remet un coup', { a: 'attaque', c: 'gobC' });
p('G-lyra', 1, 'cibles', 'Je frappe celui du fond', { a: 'attaque', c: 'cult' });
p('G-lyra', 2, 'cibles', 'tape celui derriere', { a: 'attaque', c: 'cult' });
p('G-brann', 1, 'cibles', 'Je frappe celui de gauche', { a: 'attaque', c: 'gobA' });
p('G-lyra', 2, 'cibles', 'jattaque le mage ennemi', { a: 'attaque', c: 'cult' });
p('G-zed', 1, 'cibles', 'Javelot de flamme sur le sorcier', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('V-brann', 1, 'cibles', 'Je tape le boss', { a: 'attaque', c: 'vorthak' });
p('V-zed', 2, 'cibles', 'javelot sur le boss', { a: 'competence', k: 'javelot-de-flamme', c: 'vorthak' });
p('V-brann', 2, 'cibles', 'jtape le gros', { a: 'attaque', c: 'vorthak' });
p('L-sylvan', 1, 'cibles', 'Je tire sur le loup le plus blessé', { a: 'attaque', c: 'loupB' });
p('L-sylvan', 2, 'cibles', 'achève le loup', { a: 'attaque', c: 'loupB' });
p('L-sylvan', 2, 'cibles', 'jtire sur le meme loup', { a: 'attaque', c: 'loupA' });
p('L-sylvan', 3, 'cibles', "Je vise le loup qui boite, celui qui a pris le plus de coups", { a: 'attaque', c: 'loupB' });
p('G-brann', 3, 'cibles', "Je m'occupe du gobelin qui est sur le point de tomber", { a: 'attaque', c: 'gobB' });
p('G-zed', 3, 'cibles', "Je lance un javelot de flamme sur celui qui se cache derrière les gobelins", { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('G-zed', 2, 'cibles', 'javelot de flame sur le cultite', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('G-zed', 2, 'cibles', 'javelot de flamme sur le gobln c', { a: 'competence', k: 'javelot-de-flamme', c: 'gobC' });
p('A-nox', 2, 'cibles', 'je tape le loupp b', { a: 'attaque', c: 'loupB' });

// ───────────── viser ─────────────
p('G-brann', 1, 'viser', 'Je vise la tête du gobelin A', { a: 'viser', c: 'gobA', p: 'tete' });
p('G-brann', 1, 'viser', 'Je vise les jambes du gobelin C', { a: 'viser', c: 'gobC', p: 'jambes' });
p('G-brann', 1, 'viser', "Je frappe le bras armé du gobelin A", { a: 'viser', c: 'gobA', p: 'bras' });
p('L-sylvan', 1, 'viser', 'Je tire dans la tête du loup C', { a: 'viser', c: 'loupC', p: 'tete' });
p('L-sylvan', 1, 'viser', 'Je vise les pattes du loup A', { a: 'viser', c: 'loupA', p: 'jambes' });
p('V-brann', 1, 'viser', 'Je vise la tête de Vorthak', { a: 'viser', c: 'vorthak', p: 'tete' });
p('V-brann', 2, 'viser', 'je vise sa main pour quil lache son arme', { a: 'viser', c: 'vorthak', p: 'bras' });
p('G-brann', 2, 'viser', 'je vise la tete du gob a', { a: 'viser', c: 'gobA', p: 'tete' });
p('G-brann', 2, 'viser', 'coup dans les genoux du gobelin c', { a: 'viser', c: 'gobC', p: 'jambes' });
p('L-sylvan', 2, 'viser', 'headshot sur le loup c', { a: 'viser', c: 'loupC', p: 'tete' });
p('L-sylvan', 2, 'viser', 'fleche dans loeil du loup a', { a: 'viser', c: 'loupA', p: 'tete' });
p('G-lyra', 2, 'viser', 'je vise la tete du cultiste', { a: 'viser', c: 'cult', p: 'tete' });
p('G-brann', 3, 'viser', "Je fauche les jambes du gobelin A pour qu'il tombe", { a: 'viser', c: 'gobA', p: 'jambes' });
p('V-brann', 3, 'viser', "Je frappe son poignet pour lui faire lâcher son épée", { a: 'viser', c: 'vorthak', p: 'bras' });
p('L-sylvan', 3, 'viser', "Je prends le temps de viser entre les deux yeux du loup C", { a: 'viser', c: 'loupC', p: 'tete' });
p('A-nox', 2, 'viser', 'je vise les jambes du loup a pour le ralentir', { a: 'viser', c: 'loupA', p: 'jambes' });

// ───────────── compétences ─────────────
p('G-zed', 1, 'competence', 'Javelot de flamme sur le gobelin A', { a: 'competence', k: 'javelot-de-flamme', c: 'gobA' });
p('G-zed', 1, 'competence', "J'utilise Onde de givre", { a: 'competence', k: 'onde-de-givre' });
p('G-zed', 1, 'competence', 'Je lance Éclair en chaîne', { a: 'competence', k: 'eclair-en-chaine' });
p('G-zed', 2, 'competence', 'jlance un eclair sur tt le monde', { a: 'competence', k: 'eclair-en-chaine' });
p('G-zed', 2, 'competence', 'boule de feu sur le gob a', { a: 'competence', k: 'javelot-de-flamme', c: 'gobA' });
p('G-zed', 2, 'competence', 'onde de givre !!!', { a: 'competence', k: 'onde-de-givre' });
p('G-zed', 2, 'competence', 'je gele tout le monde', { a: 'competence', k: 'onde-de-givre' });
p('G-zed', 2, 'competence', 'je crame le cultiste', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('G-zed', 2, 'competence', 'eclair en chaine sur eux', { a: 'competence', k: 'eclair-en-chaine' });
p('G-zed', 3, 'competence', "Je concentre le feu dans ma paume et je le projette sur le gobelin C", { a: 'competence', k: 'javelot-de-flamme', c: 'gobC' });
p('G-zed', 3, 'competence', "Je fais tomber la foudre sur toute la bande", { a: 'competence', k: 'eclair-en-chaine' });
p('G-zed', 3, 'competence', "Un vent glacial sort de mes mains et fige tous les ennemis", { a: 'competence', k: 'onde-de-givre' });
p('V-zed', 1, 'competence', 'Javelot de flamme sur Vorthak', { a: 'competence', k: 'javelot-de-flamme', c: 'vorthak' });
p('V-zed', 2, 'competence', 'je lui balance du feu', { a: 'competence', k: 'javelot-de-flamme', c: 'vorthak' });
p('V-zed', 2, 'competence', 'givre sur vorthak', { a: 'competence', k: 'onde-de-givre' });
p('L-sylvan', 1, 'competence', 'Tir perforant sur le loup C', { a: 'competence', k: 'tir-perforant', c: 'loupC' });
p('L-sylvan', 1, 'competence', 'Flèche marquante sur le loup A', { a: 'competence', k: 'fleche-marquante', c: 'loupA' });
p('L-sylvan', 1, 'competence', "J'utilise Volée d'esprits", { a: 'competence', k: 'volee-d-esprits' });
p('L-sylvan', 2, 'competence', 'tir perfo sur le loup a', { a: 'competence', k: 'tir-perforant', c: 'loupA' });
p('L-sylvan', 2, 'competence', 'fleche marquante loup c', { a: 'competence', k: 'fleche-marquante', c: 'loupC' });
p('L-sylvan', 2, 'competence', 'je marque le loup a', { a: 'competence', k: 'fleche-marquante', c: 'loupA' });
p('L-sylvan', 3, 'competence', "J'appelle les esprits de mes ancêtres pour qu'ils déchirent les loups", { a: 'competence', k: 'volee-d-esprits' });
p('A-nox', 1, 'competence', 'Bombe collante sur le loup A', { a: 'competence', k: 'bombe-collante', c: 'loupA' });
p('A-nox', 1, 'competence', 'Je lance une grenade incendiaire', { a: 'competence', k: 'grenade-incendiaire' });
p('A-nox', 2, 'competence', 'grenade sur les loups', { a: 'competence', k: 'grenade-incendiaire' });
p('A-nox', 2, 'competence', 'bombe colante sur le loup b', { a: 'competence', k: 'bombe-collante', c: 'loupB' });
p('A-nox', 1, 'competence', 'Je pose ma tourelle mécanique', { a: 'competence', k: 'tourelle-mecanique' });
p('A-nox', 2, 'competence', 'jinstalle une tourelle', { a: 'competence', k: 'tourelle-mecanique' });
p('A-nox', 3, 'competence', "Je déploie mon petit automate à ressorts pour qu'il tire à ma place", { a: 'competence', k: 'tourelle-mecanique' });
p('G-brann', 1, 'competence', 'Mur de foi', { a: 'competence', k: 'mur-de-foi' });
p('G-brann', 2, 'competence', 'jlance mur de foi sur lequipe', { a: 'competence', k: 'mur-de-foi' });
p('V-brann', 1, 'competence', "J'utilise Mur de foi", { a: 'competence', k: 'mur-de-foi' });
p('G-lyra', 1, 'competence', "J'utilise Purification", { a: 'competence', k: 'purification' });
p('G-lyra', 2, 'competence', 'priere de groupe', { a: 'competence', k: 'priere-de-groupe' });
p('G-zed', 1, 'competence', 'Je lance un sort de glace', { a: 'competence', k: 'onde-de-givre' });
p('G-zed', 2, 'competence', 'un sort de feu sur le gobelin c', { a: 'competence', k: 'javelot-de-flamme', c: 'gobC' });
p('G-zed', 2, 'competence', 'jutilise ma magie de foudre', { a: 'competence', k: 'eclair-en-chaine' });

// ───────────── soigner ─────────────
p('G-lyra', 1, 'soigner', 'Je soigne Kaya', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 1, 'soigner', 'Je soigne Brann', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 1, 'soigner', 'Je soigne Zed', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 1, 'soigner', 'Je me soigne', { a: 'competence', k: 'lumiere-apaisante', c: 'lyra' });
p('G-lyra', 1, 'soigner', 'Lumière apaisante sur Kaya', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 1, 'soigner', 'Je soigne le plus blessé', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 1, 'soigner', 'Je soigne le mage', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 1, 'soigner', 'Je soigne le nain', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 1, 'soigner', 'Je soigne le gardien', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 1, 'soigner', 'Je soigne Pixel', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 1, 'soigner', 'Je soigne Toto', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 1, 'soigner', 'Je soigne tout le groupe', { a: 'competence', k: ['priere-de-groupe', 'purification'] });
p('G-lyra', 2, 'soigner', 'soin a kaya stp', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 2, 'soigner', 'heal kaya', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 2, 'soigner', 'heal zed vite', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'soigne le tank', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 2, 'soigner', 'soin sur le mago', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'jsoigne pixel', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'soigne toto stp', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 2, 'soigner', 'je me heal', { a: 'competence', k: 'lumiere-apaisante', c: 'lyra' });
p('G-lyra', 2, 'soigner', 'soigne moi vite', { a: 'competence', k: 'lumiere-apaisante', c: 'lyra' });
p('G-lyra', 2, 'soigner', 'soin de groupe', { a: 'competence', k: ['priere-de-groupe', 'purification'] });
p('G-lyra', 2, 'soigner', 'heal tt le monde', { a: 'competence', k: ['priere-de-groupe', 'purification'] });
p('G-lyra', 2, 'soigner', 'soigne la louve', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 2, 'soigner', 'soin sur l arcaniste', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'jsoigne lhumain', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'soigne kaia', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 2, 'soigner', 'soigne bran', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 3, 'soigner', "Je pose les mains sur l'épaule de Kaya et je referme ses plaies", { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 3, 'soigner', "Zed est au bord du gouffre, je canalise la lumière pour le remettre sur pied", { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 3, 'soigner', "Je prie pour que la Lumière referme les blessures de tout le monde", { a: 'competence', k: ['priere-de-groupe', 'purification'] });
p('G-lyra', 3, 'soigner', "Je cours vers notre gardien et je le soigne", { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 3, 'soigner', "Je soigne celui d'entre nous qui a le moins de vie", { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 1, 'soigner', 'Je soigne', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'soin', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });

// ───────────── potion ─────────────
p('G-zed', 1, 'potion', 'Je bois une potion', { a: 'potion', c: 'zed' });
p('G-zed', 1, 'potion', 'Je donne une potion à Kaya', { a: 'potion', c: 'kaya' });
p('G-lyra', 1, 'potion', 'Potion pour Zed', { a: 'potion', c: 'zed' });
p('G-lyra', 1, 'potion', 'Je bois une potion de soin', { a: 'potion', c: 'lyra' });
p('L-sylvan', 1, 'potion', 'Je bois une potion', { a: 'potion', c: 'sylvan' });
p('G-zed', 2, 'potion', 'jbois une popo', { a: 'potion', c: 'zed' });
p('G-zed', 2, 'potion', 'potion', { a: 'potion', c: 'zed' });
p('G-zed', 2, 'potion', 'je prend une potion', { a: 'potion', c: 'zed' });
p('L-sylvan', 2, 'potion', 'jbois 1 potion', { a: 'potion', c: 'sylvan' });
p('L-sylvan', 2, 'potion', 'popo stp', { a: 'potion', c: 'sylvan' });
p('G-brann', 2, 'potion', 'je file une potion a zed', { a: 'potion', c: 'zed' });
p('G-brann', 2, 'potion', 'potion pour kaya', { a: 'potion', c: 'kaya' });
p('G-lyra', 2, 'potion', 'potion a pixel', { a: 'potion', c: 'zed' });
p('A-nox', 2, 'potion', 'je boi une potion', { a: 'potion', c: 'nox' });
p('G-zed', 3, 'potion', "Je recule d'un pas et je vide une fiole de soin d'un trait", { a: 'potion', c: 'zed' });
p('G-brann', 3, 'potion', "Je lance une de mes potions à Kaya pour qu'elle tienne le coup", { a: 'potion', c: 'kaya' });
p('L-sylvan', 3, 'potion', "J'avale une potion de soin avant que les loups ne reviennent", { a: 'potion', c: 'sylvan' });

// ───────────── protéger ─────────────
p('G-brann', 1, 'proteger', 'Je protège Kaya', { a: 'competence', k: 'bouclier-d-aube', c: 'kaya' });
p('G-brann', 1, 'proteger', 'Je protège Zed', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 1, 'proteger', "Bouclier d'aube sur Lyra", { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('G-brann', 1, 'proteger', 'Je protège le mage', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 1, 'proteger', 'Je protège la guérisseuse', { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('G-brann', 2, 'proteger', 'protege kaya', { a: 'competence', k: 'bouclier-d-aube', c: 'kaya' });
p('G-brann', 2, 'proteger', 'jme met devant zed pour le proteger', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 2, 'proteger', 'bouclier sur pixel', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 2, 'proteger', 'protege mimi', { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('G-brann', 2, 'proteger', 'shield sur le heal', { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('G-brann', 2, 'proteger', 'protege la soigneuse', { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('G-brann', 2, 'proteger', 'jprotege lelfe', { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('V-brann', 2, 'proteger', 'protège zed', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 3, 'proteger', "Je lève un bouclier de lumière autour de Kaya pour encaisser à sa place", { a: 'competence', k: 'bouclier-d-aube', c: 'kaya' });
p('G-brann', 3, 'proteger', "Zed est trop fragile, je l'entoure d'une barrière sacrée", { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-lyra', 2, 'proteger', 'protège kaya', { a: 'refus' });

// ───────────── se défendre ─────────────
p('G-brann', 1, 'defendre', 'Je me défends', { a: 'defendre' });
p('G-zed', 1, 'defendre', 'Je me mets en garde', { a: 'defendre' });
p('L-sylvan', 1, 'defendre', 'Je me protège', { a: 'defendre' });
p('G-brann', 2, 'defendre', 'jme defend', { a: 'defendre' });
p('G-brann', 2, 'defendre', 'def', { a: 'defendre' });
p('G-brann', 2, 'defendre', 'je pare', { a: 'defendre' });
p('V-brann', 2, 'defendre', 'je bloque son coup', { a: 'defendre' });
p('G-zed', 2, 'defendre', 'garde', { a: 'defendre' });
p('A-nox', 2, 'defendre', 'je me couvre', { a: 'defendre' });
p('V-brann', 3, 'defendre', "Je plante mes pieds dans le sol et je lève mon bouclier pour encaisser le prochain coup", { a: 'defendre' });
p('G-zed', 3, 'defendre', "Je reste sur mes gardes et j'attends qu'ils viennent", { a: 'defendre' });

// ───────────── provoquer ─────────────
p('G-brann', 1, 'provoquer', 'Je provoque les gobelins', { a: 'competence', k: 'provocation-sainte' });
p('V-brann', 1, 'provoquer', 'Je provoque Vorthak', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 2, 'provoquer', 'jles provoque', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 2, 'provoquer', 'taunt', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 2, 'provoquer', 'je les insulte pour quils viennent sur moi', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 3, 'provoquer', "Je hurle pour attirer leur attention sur moi plutôt que sur Zed", { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 3, 'provoquer', "Hé, les moches ! Venez donc me chercher !", { a: 'competence', k: 'provocation-sainte' });

// ───────────── fuir, se cacher, changer de rang ─────────────
p('L-sylvan', 1, 'fuir', 'Je fuis', { a: 'fuir' });
p('L-sylvan', 1, 'fuir', "Je m'enfuis", { a: 'fuir' });
p('L-sylvan', 2, 'fuir', 'on se casse', { a: 'fuir' });
p('L-sylvan', 2, 'fuir', 'jme tire dici', { a: 'fuir' });
p('L-sylvan', 2, 'fuir', 'fuite !', { a: 'fuir' });
p('L-sylvan', 2, 'fuir', 'je prend la fuite', { a: 'fuir' });
p('A-nox', 3, 'fuir', "Je tourne les talons et je cours aussi vite que possible vers la sortie", { a: 'fuir' });
p('L-sylvan', 3, 'fuir', 'Je prends mes jambes à mon cou', { a: 'fuir' });
p('G-zed', 2, 'fuir', 'je fuis', { a: 'refus' });
p('L-sylvan', 1, 'se_cacher', 'Je me cache', { a: 'se_cacher' });
p('L-sylvan', 2, 'se_cacher', 'jme planque derriere un arbre', { a: 'se_cacher' });
p('A-nox', 2, 'se_cacher', 'je me cache dans les buissons', { a: 'se_cacher' });
p('G-zed', 2, 'se_cacher', 'je me fond dans lombre', { a: 'se_cacher' });
p('L-sylvan', 3, 'se_cacher', "Je me glisse sans bruit derrière un rocher pour qu'ils me perdent de vue", { a: 'se_cacher' });
p('G-brann', 1, 'changer_rang', 'Je recule au second rang', { a: 'changer_rang' });
p('G-lyra', 1, 'changer_rang', 'Je passe au premier rang', { a: 'changer_rang' });
p('G-brann', 2, 'changer_rang', 'jrecule', { a: 'changer_rang' });
p('G-zed', 2, 'changer_rang', 'je passe devant', { a: 'changer_rang' });
p('G-lyra', 3, 'changer_rang', "Je m'avance pour me placer en première ligne à côté de Brann", { a: 'changer_rang' });

// ───────────── bombe, pacifier, observer, fusion ─────────────
p('A-nox', 1, 'bombe', 'Je lance une bombe', { a: 'bombe' });
p('A-nox', 2, 'bombe', 'jbalance une bombe sur eux', { a: 'bombe' });
p('A-nox', 3, 'bombe', "Je dégoupille une de mes bombes improvisées et je la lance au milieu des loups", { a: 'bombe' });
p('G-zed', 2, 'bombe', 'je lance une bombe', { a: 'refus' });
p('L-sylvan', 1, 'pacifier', 'Je parle au loup B pour le calmer', { a: 'pacifier', c: 'loupB' });
p('L-sylvan', 2, 'pacifier', 'je calme le loup blessé', { a: 'pacifier', c: 'loupB' });
p('L-sylvan', 3, 'pacifier', "Je m'accroupis et je murmure au loup B qu'il peut partir, qu'on ne lui veut pas de mal", { a: 'pacifier', c: 'loupB' });
p('G-zed', 2, 'pacifier', 'je parle au gobelin pour quil se rende', { a: 'refus' });
p('G-lyra', 1, 'analyser', "J'observe les ennemis", { a: 'analyser' });
p('G-zed', 2, 'analyser', 'c koi leurs faiblesses', { a: 'analyser' });
p('V-zed', 2, 'analyser', 'jregarde combien de vie il lui reste', { a: 'analyser' });
p('L-sylvan', 3, 'analyser', "Avant d'agir, j'étudie comment les loups se déplacent pour trouver une faille", { a: 'analyser' });
p('G-zed', 1, 'fusion', 'Je combine feu et glace', { a: 'fusion' });
p('G-zed', 2, 'fusion', 'combo javelot de flamme + onde de givre', { a: 'fusion' });
p('G-zed', 2, 'fusion', 'je fusionne feu et foudre sur le gob a', { a: 'fusion' });
p('V-zed', 3, 'fusion', "Je mêle la glace et le feu dans un seul sort et je l'envoie sur Vorthak", { a: 'fusion' });
p('G-lyra', 2, 'voler', 'je menvole au dessus deux', { a: 'refus' });
p('G-brann', 2, 'voler', 'je saute en volant sur le cultiste', { a: 'refus' });

// ───────────── plusieurs actions (on fait la première, on dit ce qui n'est pas fait) ─────────────
p('G-zed', 2, 'multi', "je bois une potion puis j'attaque", { a: 'potion', c: 'zed' });
p('G-lyra', 2, 'multi', 'je soigne kaya et après je tape le gobelin b', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-brann', 2, 'multi', 'je protege zed puis je provoque', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('L-sylvan', 2, 'multi', 'je tire sur le loup a et ensuite je me cache', { a: 'attaque', c: 'loupA' });
p('G-zed', 3, 'multi', "D'abord je lance un javelot de flamme sur le cultiste, ensuite je recule", { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('A-nox', 3, 'multi', "Je pose ma tourelle, puis je bois une potion", { a: 'competence', k: 'tourelle-mecanique' });
p('V-brann', 2, 'multi', 'je provoque vorthak puis je me defend', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 2, 'multi', 'jtape le gob a et le gob c', { a: 'attaque', c: 'gobA' });

// ───────────── négations ─────────────
p('G-brann', 2, 'negation', "je n'attaque pas, je me défends", { a: 'defendre' });
p('G-brann', 2, 'negation', 'jattaque pas je bloque', { a: 'defendre' });
p('L-sylvan', 2, 'negation', 'je fuis pas je tire sur le loup c', { a: 'attaque', c: 'loupC' });
p('G-lyra', 2, 'negation', 'pas de potion, soigne zed avec un sort', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'negation', "je ne me soigne pas, je soigne kaya", { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-zed', 2, 'negation', 'pas le gobelin a, le c', { a: 'attaque', c: 'gobC' });
p('G-brann', 3, 'negation', "Je ne vais pas attaquer ce tour, je préfère me mettre en garde", { a: 'defendre' });
p('G-zed', 3, 'negation', "Surtout pas de feu, ils aiment ça : je les gèle tous", { a: 'competence', k: 'onde-de-givre' });
p('L-sylvan', 2, 'negation', 'je bois pas de potion, je me cache', { a: 'se_cacher' });

// ───────────── actions créatives (ramenées à l'action la plus proche) ─────────────
p('G-brann', 3, 'creatif', 'Je renverse la table sur eux', { a: 'attaque' });
p('G-brann', 3, 'creatif', 'Je lui jette du sable aux yeux', { a: 'viser', p: 'tete' });
p('G-lyra', 3, 'creatif', 'Je lance ma chope de bière sur le cultiste', { a: 'attaque', c: 'cult' });
p('G-brann', 3, 'creatif', 'Je donne un coup de pied dans un tonneau qui roule vers le gobelin A', { a: 'attaque', c: 'gobA' });
p('G-brann', 3, 'creatif', 'Je crie des insultes au gobelin pour le faire venir', { a: 'competence', k: 'provocation-sainte' });
p('L-sylvan', 3, 'creatif', 'Je fais diversion en lançant un caillou plus loin', { a: 'se_cacher' });
p('A-nox', 3, 'creatif', 'Je balaie ses jambes avec mon bâton', { a: 'viser', p: 'jambes' });
p('V-brann', 3, 'creatif', "Je l'aveugle avec le reflet de mon bouclier", { a: 'viser', p: 'tete' });
p('G-zed', 3, 'creatif', "J'arrache une poutre et je l'abats sur le gobelin C", { a: 'attaque', c: 'gobC' });
p('L-sylvan', 3, 'creatif', 'Je grimpe à un arbre pour tirer de plus haut sur le loup A', { a: 'attaque', c: 'loupA' });
p('A-nox', 3, 'creatif', 'Je lance une poignée de clous sous les pattes du loup B', { a: 'viser', p: 'jambes', c: 'loupB' });
p('G-brann', 3, 'creatif', 'Je fais un croche-pied au gobelin C', { a: 'viser', p: 'jambes', c: 'gobC' });
p('G-lyra', 3, 'creatif', 'Je souffle les bougies pour plonger la salle dans le noir', { a: 'se_cacher' });

// ───────────── hésitations (l'IA doit demander) ─────────────
p('G-zed', 2, 'question', 'boule de feu ou eclair sur le cultiste', { a: 'question' });
p('G-zed', 2, 'question', 'javelot de flamme ou onde de givre ?', { a: 'question' });
p('G-lyra', 2, 'question', 'je soigne kaya ou zed', { a: 'question' });
p('G-brann', 2, 'question', 'je protege zed ou lyra', { a: 'question' });
p('G-brann', 2, 'question', 'je tape le cultiste', { a: 'question' });
p('G-brann', 2, 'question', 'jattaque celui du fond', { a: 'question' });
p('G-zed', 2, 'question', 'je sais pas', { a: 'question' });
p('G-zed', 2, 'question', 'jsp quoi faire', { a: 'question' });
p('L-sylvan', 2, 'question', 'le loup a ou le c ?', { a: 'question' });
p('G-zed', 2, 'question', 'je fais un truc', { a: 'question' });
p('G-zed', 2, 'question', 'aide moi', { a: 'question' });
p('A-nox', 2, 'question', 'bombe collante ou grenade', { a: 'question' });

// ───────────── tout et n'importe quoi (pas d'action jouable : il ne faut surtout rien faire) ─────────────
p('G-zed', 2, 'hors_sujet', 'gg', { a: 'question' });
p('G-zed', 2, 'hors_sujet', 'lol', { a: 'question' });
p('G-zed', 2, 'hors_sujet', 'cest quoi ce jeu', { a: 'question' });
p('G-brann', 2, 'hors_sujet', 'jai faim', { a: 'question' });

// ───────────── davantage de variété, par intention ─────────────
p('G-brann', 2, 'attaquer', 'jlui fou une claque au gob c', { a: 'attaque', c: 'gobC' });
p('G-brann', 2, 'attaquer', 'coup de marteau gob a', { a: 'attaque', c: 'gobA' });
p('G-brann', 2, 'attaquer', 'je fracasse le crane du gobelin a', { a: 'viser', c: 'gobA', p: 'tete' });
p('G-brann', 2, 'attaquer', 'je charge le gobelin c', { a: 'attaque', c: 'gobC' });
p('G-lyra', 2, 'attaquer', 'coup de baton au cultiste', { a: 'attaque', c: 'cult' });
p('L-sylvan', 2, 'attaquer', 'je shoot le loup c', { a: 'attaque', c: 'loupC' });
p('L-sylvan', 2, 'attaquer', 'fleche sur loup a', { a: 'attaque', c: 'loupA' });
p('A-nox', 2, 'attaquer', 'je pique le loup a', { a: 'attaque', c: 'loupA' });
p('V-zed', 2, 'attaquer', 'coup de baton sur vortack', { a: 'attaque', c: 'vorthak' });
p('V-brann', 1, 'attaquer', "Je frappe l'émissaire des Cendres", { a: 'attaque', c: 'vorthak' });
p('V-brann', 2, 'attaquer', 'je tape le demon', { a: 'attaque', c: 'vorthak' });
p('G-brann', 1, 'attaquer', 'Je tranche le gobelin C', { a: 'attaque', c: 'gobC' });
p('G-brann', 1, 'attaquer', "J'achève le gobelin B", { a: 'attaque', c: 'gobB' });
p('G-lyra', 1, 'attaquer', 'Je frappe le gobelin A de mon bâton', { a: 'attaque', c: 'gobA' });
p('L-sylvan', 3, 'attaquer', "Je recule d'un pas et j'envoie une flèche bien droite dans le flanc du loup C", { a: 'attaque', c: 'loupC' });
p('G-brann', 3, 'attaquer', "Sans réfléchir, je fonce dans le tas et je frappe le premier gobelin qui passe", { a: 'attaque' });
p('G-zed', 3, 'attaquer', "Plus de mana, tant pis : je frappe le gobelin A avec mon bâton", { a: 'attaque', c: 'gobA' });
p('G-zed', 1, 'competence', 'Onde de givre sur les gobelins', { a: 'competence', k: 'onde-de-givre' });
p('G-zed', 1, 'competence', 'Je lance Javelot de flamme sur le cultiste', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('G-zed', 2, 'competence', 'javelo de flamme cultiste', { a: 'competence', k: 'javelot-de-flamme', c: 'cult' });
p('G-zed', 2, 'competence', 'jenvoie la foudre', { a: 'competence', k: 'eclair-en-chaine' });
p('G-zed', 2, 'competence', 'du feu sur le gob c', { a: 'competence', k: 'javelot-de-flamme', c: 'gobC' });
p('G-zed', 2, 'competence', 'freeze tout le monde', { a: 'competence', k: 'onde-de-givre' });
p('G-zed', 2, 'competence', 'eclaire en chene', { a: 'competence', k: 'eclair-en-chaine' });
p('V-zed', 1, 'competence', "J'utilise Éclair en chaîne sur Vorthak", { a: 'competence', k: 'eclair-en-chaine' });
p('V-zed', 2, 'competence', 'jle crame', { a: 'competence', k: 'javelot-de-flamme', c: 'vorthak' });
p('V-zed', 3, 'competence', "Je rassemble tout mon mana et je projette une lance de feu dans la poitrine du démon", { a: 'competence', k: 'javelot-de-flamme', c: 'vorthak' });
p('L-sylvan', 2, 'competence', 'volée desprit', { a: 'competence', k: 'volee-d-esprits' });
p('L-sylvan', 2, 'competence', 'tir perforant sur le meme', { a: 'competence', k: 'tir-perforant', c: 'loupA' });
p('L-sylvan', 3, 'competence', "Je tire une flèche si puissante qu'elle traverse le loup C de part en part", { a: 'competence', k: 'tir-perforant', c: 'loupC' });
p('A-nox', 2, 'competence', 'jlance ma bombe collante sur le loup a', { a: 'competence', k: 'bombe-collante', c: 'loupA' });
p('A-nox', 3, 'competence', "J'arrose les deux loups de liquide inflammable et j'y mets le feu", { a: 'competence', k: 'grenade-incendiaire' });
p('G-lyra', 2, 'competence', 'jpurifie tout le monde', { a: 'competence', k: 'purification' });
p('G-lyra', 3, 'competence', "Je chasse le mal qui ronge mes compagnons avec une prière de purification", { a: 'competence', k: 'purification' });
p('G-brann', 2, 'competence', 'mur de foie', { a: 'competence', k: 'mur-de-foi' });
p('G-brann', 3, 'competence', "J'élève un mur de foi devant toute l'équipe", { a: 'competence', k: 'mur-de-foi' });
p('G-lyra', 2, 'soigner', 'soin sur zed', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'remet zed sur pied', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 2, 'soigner', 'soigne brann sil te plait', { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('G-lyra', 2, 'soigner', 'lumiere apaisante sur moi', { a: 'competence', k: 'lumiere-apaisante', c: 'lyra' });
p('G-lyra', 2, 'soigner', 'lumiere apaisante kaya', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 1, 'soigner', 'Je soigne Kaya Lunecroc', { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 1, 'soigner', "Je soigne l'Arcaniste", { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-lyra', 3, 'soigner', "Kaya saigne beaucoup, je m'agenouille près d'elle et je la soigne", { a: 'competence', k: 'lumiere-apaisante', c: 'kaya' });
p('G-lyra', 3, 'soigner', "Toto a pris cher, je lui rends un peu de vie", { a: 'competence', k: 'lumiere-apaisante', c: 'brann' });
p('L-sylvan', 2, 'soigner', 'je me soigne', { a: 'potion', c: 'sylvan' });
p('G-zed', 2, 'soigner', 'je me soigne', { a: 'potion', c: 'zed' });
p('G-zed', 2, 'soigner', 'je soigne kaya', { a: 'potion', c: 'kaya' });
p('A-nox', 2, 'soigner', 'jme heal', { a: 'potion', c: 'nox' });
p('G-brann', 2, 'proteger', 'protège le petit mage', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 1, 'proteger', "Je mets un bouclier sur Kaya", { a: 'competence', k: 'bouclier-d-aube', c: 'kaya' });
p('G-brann', 2, 'proteger', 'bouclier daube sur zed', { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 2, 'proteger', 'jprotege toto', { a: 'competence', k: 'bouclier-d-aube', c: 'brann' });
p('G-brann', 2, 'proteger', 'protege moi', { a: 'competence', k: 'bouclier-d-aube', c: 'brann' });
p('G-brann', 3, 'proteger', "Je me place devant Lyra, mon bouclier levé, pour qu'aucun coup ne l'atteigne", { a: 'competence', k: 'bouclier-d-aube', c: 'lyra' });
p('V-brann', 3, 'proteger', "Je couvre Zed de ma lumière avant que le démon ne frappe", { a: 'competence', k: 'bouclier-d-aube', c: 'zed' });
p('G-brann', 2, 'defendre', 'posture defensive', { a: 'defendre' });
p('G-lyra', 2, 'defendre', 'je me met en defense', { a: 'defendre' });
p('L-sylvan', 2, 'defendre', 'jme protege', { a: 'defendre' });
p('V-zed', 2, 'defendre', 'je me prepare a encaisser', { a: 'defendre' });
p('G-brann', 1, 'defendre', 'Je lève mon bouclier', { a: 'defendre' });
p('V-brann', 2, 'provoquer', 'eh vorthak viens te battre', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 2, 'provoquer', 'jattire leur attention', { a: 'competence', k: 'provocation-sainte' });
p('G-brann', 1, 'provoquer', 'Provocation sainte', { a: 'competence', k: 'provocation-sainte' });
p('L-sylvan', 2, 'fuir', 'jme barre', { a: 'fuir' });
p('A-nox', 2, 'fuir', 'on fuit', { a: 'fuir' });
p('A-nox', 1, 'fuir', 'Je prends la fuite', { a: 'fuir' });
p('L-sylvan', 2, 'se_cacher', 'jme cache', { a: 'se_cacher' });
p('A-nox', 1, 'se_cacher', "Je me cache derrière un rocher", { a: 'se_cacher' });
p('L-sylvan', 3, 'se_cacher', "Je me tapis dans les hautes herbes en retenant mon souffle", { a: 'se_cacher' });
p('G-zed', 1, 'changer_rang', 'Je recule', { a: 'refus' });
p('G-brann', 2, 'changer_rang', 'je passe derriere', { a: 'changer_rang' });
p('A-nox', 2, 'bombe', 'bombe !', { a: 'bombe' });
p('A-nox', 2, 'bombe', 'jlance une bombe sur le loup a', { a: 'bombe' });
p('L-sylvan', 2, 'pacifier', 'je parle au loup b', { a: 'pacifier', c: 'loupB' });
p('L-sylvan', 2, 'pacifier', 'je dis au loup b de partir', { a: 'pacifier', c: 'loupB' });
p('G-lyra', 2, 'analyser', 'jobserve', { a: 'analyser' });
p('G-zed', 1, 'analyser', 'Je cherche leurs points faibles', { a: 'analyser' });
p('A-nox', 2, 'analyser', 'cest quoi leurs pv', { a: 'analyser' });
p('V-brann', 2, 'analyser', 'jexamine vorthak', { a: 'analyser' });
p('G-zed', 1, 'fusion', 'Je fusionne Javelot de flamme et Éclair en chaîne', { a: 'fusion' });
p('G-zed', 2, 'fusion', 'fusion feu glace', { a: 'fusion' });
p('L-sylvan', 2, 'voler', 'je vole jusquau loup', { a: 'refus' });
p('G-zed', 2, 'multi', 'je me soigne et jattaque', { a: 'potion', c: 'zed' });
p('L-sylvan', 2, 'multi', 'je me cache puis je tire', { a: 'se_cacher' });
p('G-lyra', 3, 'multi', "Je soigne Zed, puis s'il me reste du mana je soigne Kaya", { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-brann', 2, 'multi', 'provoque et ensuite def', { a: 'competence', k: 'provocation-sainte' });
p('G-zed', 2, 'negation', 'jattaque pas le a, je tape le c', { a: 'attaque', c: 'gobC' });
p('G-lyra', 2, 'negation', 'soigne pas kaya, soigne zed', { a: 'competence', k: 'lumiere-apaisante', c: 'zed' });
p('G-brann', 2, 'negation', 'je bouge pas je me defend', { a: 'defendre' });
p('A-nox', 3, 'creatif', "Je jette ma sacoche pleine d'outils à la tête du loup A", { a: 'viser', p: 'tete', c: 'loupA' });
p('V-zed', 3, 'creatif', "Je fais exploser le lustre au-dessus de Vorthak", { a: 'attaque', c: 'vorthak' });
p('G-zed', 2, 'question', 'feu ou glace', { a: 'question' });
p('G-lyra', 2, 'question', 'soin ou purification ?', { a: 'question' });
p('L-sylvan', 2, 'question', 'tir perforant ou fleche marquante', { a: 'question' });
p('V-brann', 2, 'question', 'jsais pas trop', { a: 'question' });

export const BANC: PhraseBanc[] = B;
