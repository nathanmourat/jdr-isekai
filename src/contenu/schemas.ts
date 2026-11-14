/**
 * Schémas du contenu (fichiers YAML de `content/`).
 * Chaque fichier est vérifié au chargement : une erreur donne un message en français
 * avec le nom du fichier et le champ fautif.
 */
import { z } from 'zod';

import { CARACS } from './constantes';
export { CARACS };
export const zCarac = z.enum(CARACS);
export const zCaracs = z.object({
  FOR: z.number().int(),
  AGI: z.number().int(),
  INT: z.number().int(),
  VIT: z.number().int(),
  ESP: z.number().int(),
  CHA: z.number().int(),
});
export const zCaracsPartielles = zCaracs.partial();

export const ELEMENTS = ['physique', 'feu', 'glace', 'foudre', 'sacre', 'ombre', 'poison', 'arcane'] as const;
export const zElement = z.enum(ELEMENTS);

export const ETATS = [
  'brulure', 'poison', 'gel', 'immobilise', 'sommeil', 'peur', 'silence', 'provoque', 'marque',
  'furtif', 'bonus_degats', 'bonus_defense', 'bonus_initiative', 'bonus_precision', 'malus_defense',
  'regeneration', 'garde', 'expose', 'affaibli',
] as const;
export const zEtat = z.enum(ETATS);

export const CIBLES = ['ennemi', 'tous_ennemis', 'ennemi_aleatoire', 'allie', 'allie_ko', 'tous_allies', 'soi'] as const;
export const zCible = z.enum(CIBLES);

const zEffetDegats = z.object({
  type: z.literal('degats'),
  puissance: z.number(),
  stat: zCarac,
  element: zElement.default('physique'),
  coups: z.number().int().min(1).default(1),
  critique_garanti: z.boolean().default(false),
  cout_pv_pourcent: z.number().default(0),
  bonus_si_etat: z.object({ etat: zEtat, multiplicateur: z.number() }).optional(),
  executer_sous_pourcent: z.number().optional(),
});
const zEffetSoin = z.object({
  type: z.literal('soin'),
  puissance: z.number(),
  stat: zCarac.default('ESP'),
  cible: zCible.optional(),
});
const zEffetEtat = z.object({
  type: z.literal('etat'),
  etat: zEtat,
  duree: z.number().int(),
  valeur: z.number().default(0),
  chance: z.number().min(0).max(1).default(1),
  cible: zCible.optional(),
  cumul_max: z.number().int().default(1),
});
const zEffetBouclier = z.object({
  type: z.literal('bouclier'),
  pourcent_pv: z.number(),
  stat: zCarac.optional(),
  bonus_par_point: z.number().default(0),
  cible: zCible.optional(),
});
const zEffetInvocation = z.object({
  type: z.literal('invocation'),
  creature: z.string(),
  duree: z.number().int(),
});
const zEffetPurifier = z.object({ type: z.literal('purifier'), cible: zCible.optional() });
const zEffetCharge = z.object({ type: z.literal('charge_rune'), nombre: z.number().int() });
const zEffetMana = z.object({ type: z.literal('mana'), valeur: z.number(), cible: zCible.optional() });
const zEffetEchange = z.object({ type: z.literal('soigner_invocations'), pourcent: z.number() });
const zEffetRelever = z.object({ type: z.literal('relever'), pourcent_pv: z.number(), cible: zCible.optional() });

export const zEffet = z.discriminatedUnion('type', [
  zEffetDegats, zEffetSoin, zEffetEtat, zEffetBouclier, zEffetInvocation, zEffetPurifier,
  zEffetCharge, zEffetMana, zEffetEchange, zEffetRelever,
]);
export type Effet = z.infer<typeof zEffet>;

export const zCompetence = z.object({
  id: z.string(),
  nom: z.string(),
  description: z.string(),
  cout: z.number().int().default(0),
  recharge: z.number().int().default(0),
  cible: zCible,
  portee: z.enum(['melee', 'distance']).default('distance'),
  effets: z.array(zEffet).min(1),
  // indications pour l'IA (alliés contrôlés par l'ordinateur et simulation)
  ia: z.object({
    priorite: z.number().default(1),
    quand: z.enum(['toujours', 'allie_blesse', 'plusieurs_ennemis', 'debut_combat', 'cible_faible', 'soi_blesse', 'allie_ko']).default('toujours'),
  }).default({ priorite: 1, quand: 'toujours' }),
});
export type Competence = z.infer<typeof zCompetence>;

export const zClasse = z.object({
  id: z.string(),
  nom: z.string(),
  role: z.string(),
  description: z.string(),
  caracteristiques: zCaracs,
  attaque: z.object({ stat: zCarac, element: zElement.default('physique'), portee: z.enum(['melee', 'distance']), puissance: z.number().default(8) }),
  rang_prefere: z.enum(['avant', 'arriere']),
  armure: z.number().default(0),
  /**
   * Familles d'équipement (champ `categorie` des objets) que la classe maîtrise. Une arme ou une armure d'une autre
   * famille s'équipe avec un malus ; une famille de `interdits` ne s'équipe pas du tout.
   */
  maitrises: z.object({ armes: z.array(z.string()).min(1), armures: z.array(z.string()).min(1), interdits: z.array(z.string()).default([]) }),
  passif: z.object({ id: z.string(), nom: z.string(), description: z.string(), parametres: z.record(z.string(), z.number()).default({}) }),
  competences: z.array(z.string()).min(2),
  branches: z.array(z.object({ id: z.string(), nom: z.string(), description: z.string(), competences: z.array(z.object({ niveau: z.number().int(), competence: z.string() })) })).length(2),
  ultime: z.object({ nom: z.string(), description: z.string() }),
  point_fort: z.string(),
  point_faible: z.string(),
  competences_detail: z.array(zCompetence),
});
export type Classe = z.infer<typeof zClasse>;

export const zRace = z.object({
  id: z.string(),
  nom: z.string(),
  description: z.string(),
  modificateurs: zCaracsPartielles,
  modificateurs_libres: z.object({ plus: z.number().int(), moins: z.number().int() }).optional(),
  trait: z.object({
    id: z.string(),
    nom: z.string(),
    avantage: z.string(),
    defaut: z.string(),
    parametres: z.record(z.string(), z.number()).default({}),
  }),
  reputation_depart: z.record(z.string(), z.number()).default({}),
  calque: z.boolean().default(true),
  echelle: z.number().default(1),
  teinte: z.string().optional(),
});
export type Race = z.infer<typeof zRace>;

export const zDon = z.object({
  id: z.string(),
  nom: z.string(),
  combat: z.string(),
  hors_combat: z.string(),
  parametres: z.record(z.string(), z.number()).default({}),
});
export type Don = z.infer<typeof zDon>;

export const zEnnemi = z.object({
  id: z.string(),
  nom: z.string(),
  description: z.string().default(''),
  niveau: z.number().int(),
  caracteristiques: zCaracs,
  pv: z.number().optional(),
  armure: z.number().default(0),
  resistances: z.record(z.string(), z.number()).default({}),
  attaque: z.object({ stat: zCarac, element: zElement.default('physique'), portee: z.enum(['melee', 'distance']), puissance: z.number().default(8) }),
  rang: z.enum(['avant', 'arriere']).default('avant'),
  competences: z.array(zCompetence).default([]),
  /**
   * Attaques de base nommées (2 ou 3 par ennemi) : même puissance que ttaque, mais avec un nom, une phrase
   * ({cible} = nom de la cible) et un effet visuel. Ex. « bondit et mord {cible} à la jambe ».
   */
  attaques: z.array(z.object({ nom: z.string(), phrase: z.string(), element: zElement.optional(), effet: z.string().optional() })).default([]),
  recompenses: z.object({ xp: z.number(), or: z.number().default(0), objets: z.array(z.object({ id: z.string(), chance: z.number() })).default([]) }),
  categorie: z.enum(['bete', 'demon', 'mort-vivant', 'humanoide', 'construction', 'esprit']).default('humanoide'),
  boss: z.boolean().default(false),
  invocation: z.boolean().default(false),
  fuit_sous_pourcent: z.number().optional(),
  sprite: z.string().optional(),
});
export type Ennemi = z.infer<typeof zEnnemi>;

export const zRencontre = z.object({
  id: z.string(),
  nom: z.string(),
  fond: z.string().default('plaine'),
  ennemis: z.array(z.object({ id: z.string(), rang: z.enum(['avant', 'arriere']).optional() })).min(1),
  renforts: z.array(z.string()).default([]), // ennemis ajoutés selon la taille du groupe
  fuite_possible: z.boolean().default(true),
});
export type Rencontre = z.infer<typeof zRencontre>;

export const RARETES = ['commun', 'peu-commun', 'rare', 'epique', 'legendaire', 'mythique'] as const;
export type Rarete = (typeof RARETES)[number];

export const zObjet = z.object({
  id: z.string(),
  nom: z.string(),
  description: z.string(),
  type: z.enum(['consommable', 'cadeau', 'equipement', 'quete', 'materiau']),
  prix: z.number().default(0),
  effets: z.array(zEffet).default([]),
  cible: zCible.default('soi'),
  emplacement: z.enum(['arme', 'armure', 'accessoire']).optional(),
  bonus: z.object({ armure: z.number().default(0), puissance: z.number().default(0), caracs: zCaracsPartielles.default({}) }).optional(),
  // ── Équipement (catalogue validé par le groupe, voir equipements/CONCEPTION-EQUIPEMENTS.md)
  rarete: z.enum(RARETES).optional(),
  /** palier d'équipement : I à VI (un par chapitre), X pour les mythiques */
  palier: z.string().optional(),
  /** niveau requis pour l'équiper */
  niveau: z.number().int().optional(),
  /** type d'arme, de tenue ou d'accessoire (epee, arc, lourde, anneau…) */
  categorie: z.string().optional(),
  /** classes qui peuvent l'équiper (absent = toutes) */
  classes: z.array(z.string()).optional(),
  /** effets spéciaux (rare et plus) */
  effets_equipement: z.array(z.object({
    effet: z.enum(['critique', 'precision', 'resistance', 'touche', 'mana', 'vigueur']),
    valeur: z.number().optional(),
    puissance: z.number().optional(),
    element: zElement.optional(),
  })).default([]),
  /** pouvoir unique (légendaires et mythiques), décrit en texte ; son effet est codé dans src/moteur/equipement.ts */
  pouvoir_unique: z.string().optional(),
  /** un seul exemplaire par partie (armes mythiques) */
  unique_par_partie: z.boolean().default(false),
  /** À quoi sert l'objet, en une phrase (affichée dans l'infobulle). */
  utilite: z.string().optional(),
  /** Objet mystérieux : « ??? — effet inconnu » tant qu'on ne l'a pas acheté ou fait identifier. */
  mystere: z.boolean().default(false),
});
export type Objet = z.infer<typeof zObjet>;

// ─── Compagnons ──────────────────────────────────────────────
export const zCompagnon = z.object({
  id: z.string(),
  nom: z.string(),
  titre: z.string(),
  age: z.number().int().min(18),
  genre: z.enum(['f', 'm', 'autre']),
  personnalite: z.string(),
  passe: z.string(),
  objectif: z.string(),
  chapitre_arrivee: z.number().int(),
  lignes_rouges: z.array(z.object({ flag: z.string(), description: z.string(), definitive: z.boolean().default(false), penalite: z.number().default(-30) })),
  cadeaux: z.object({ prefere: z.array(z.string()), apprecie: z.array(z.string()), deteste: z.array(z.string()) }),
  combat: z.object({
    caracteristiques: zCaracs,
    attaque: z.object({ stat: zCarac, element: zElement.default('physique'), portee: z.enum(['melee', 'distance']), puissance: z.number().default(8) }),
    armure: z.number().default(0),
    rang: z.enum(['avant', 'arriere']),
    competences: z.array(zCompetence).default([]),
  }),
  bonus_paliers: z.record(z.string(), z.object({ id: z.string(), nom: z.string(), description: z.string(), parametres: z.record(z.string(), z.number()).default({}) })),
  quete: z.string().optional(),
});
export type Compagnon = z.infer<typeof zCompagnon>;

// ─── Narration ───────────────────────────────────────────────
export const zCondition: z.ZodType<Condition> = z.lazy(() =>
  z.object({
    flag: z.string().optional(),
    pas_flag: z.string().optional(),
    race: z.union([z.string(), z.array(z.string())]).optional(),
    classe: z.union([z.string(), z.array(z.string())]).optional(),
    origine: z.enum(['invoque', 'reincarne']).optional(),
    don: z.string().optional(),
    affinite_min: z.record(z.string(), z.number()).optional(),
    affinite_palier: z.record(z.string(), z.string()).optional(),
    reputation_min: z.record(z.string(), z.number()).optional(),
    carac_min: zCaracsPartielles.optional(),
    niveau_min: z.number().optional(),
    or_min: z.number().optional(),
    objet: z.string().optional(),
    quete_etape: z.record(z.string(), z.string()).optional(),
    quete_terminee: z.string().optional(),
    date_min: z.object({ annee: z.number(), mois: z.number().default(1), jour: z.number().default(1) }).optional(),
    rang_guilde_min: z.string().optional(),
    /** Nombre de héros dans la scène (pour adapter une réplique à un joueur seul ou à un groupe). */
    groupe_min: z.number().optional(),
    groupe_max: z.number().optional(),
    ou: z.array(zCondition).optional(),
  }),
);
export interface Condition {
  flag?: string; pas_flag?: string; race?: string | string[]; classe?: string | string[];
  origine?: 'invoque' | 'reincarne'; don?: string;
  affinite_min?: Record<string, number>; affinite_palier?: Record<string, string>;
  reputation_min?: Record<string, number>; carac_min?: Partial<Record<(typeof CARACS)[number], number>>;
  niveau_min?: number; or_min?: number; objet?: string;
  quete_etape?: Record<string, string>; quete_terminee?: string;
  date_min?: { annee: number; mois: number; jour: number }; rang_guilde_min?: string; groupe_min?: number; groupe_max?: number; ou?: Condition[];
}

export const zConsequence = z.object({
  flag: z.union([z.string(), z.array(z.string())]).optional(),
  retirer_flag: z.string().optional(),
  reputation: z.record(z.string(), z.number()).optional(),
  affinite: z.record(z.string(), z.number()).optional(),
  xp: z.number().optional(),
  or: z.number().optional(),
  objet: z.union([z.string(), z.array(z.string())]).optional(),
  retirer_objet: z.string().optional(),
  points_guilde: z.number().optional(),
  quete: z.object({ id: z.string(), etape: z.string() }).optional(),
  terminer_quete: z.string().optional(),
  recruter: z.string().optional(),
  pnj_mort: z.string().optional(),
  atout: z.string().optional(),
  origine_enfance: z.string().optional(),
  contact: z.string().optional(),
  journal: z.string().optional(),
  avancer_temps: z.object({ jours: z.number().default(0), mois: z.number().default(0) }).optional(),
  aller_date: z.object({ annee: z.number(), mois: z.number(), jour: z.number().default(1) }).optional(),
  ellipse: z.object({ jusqua: z.object({ annee: z.number(), mois: z.number(), jour: z.number().default(1) }), titre: z.string() }).optional(),
  fin_chapitre: z.number().optional(),
  soigner_groupe: z.boolean().optional(),
  /** Pari : retire cette somme au héros qui choisit (elle est mise de côté). */
  /** Un goût d'un compagnon est découvert en discutant : { compagnon: objet }. */
  reveler_gout: z.record(z.string(), z.string()).optional(),
  miser: z.number().int().min(1).optional(),
  /** Pari gagné : rend la mise multipliée (2 = la mise et autant en gain). */
  gain_pari: z.number().min(0).optional(),
  /** Pari perdu : la mise est définitivement perdue. */
  perte_pari: z.boolean().optional(),
});
export type Consequence = z.infer<typeof zConsequence>;

export const zReplique = z.object({
  qui: z.string().default('narrateur'),
  expression: z.string().default('neutre'),
  dit: z.string(),
  si: zCondition.optional(),
});
export type Replique = z.infer<typeof zReplique>;

export const zChoix = z.object({
  texte: z.string(),
  si: zCondition.optional(),
  visible_si_bloque: z.boolean().default(false),
  test: z.object({ carac: zCarac, difficulte: z.number(), reussite: z.string(), echec: z.string() }).optional(),
  effets: z.array(zConsequence).default([]),
  aller: z.string().optional(),
});
export type Choix = z.infer<typeof zChoix>;

/**
 * Un personnage s'adresse à UN joueur précis, par son pseudo. Seul ce joueur répond, parmi 3 réponses au plus.
 *  - `regle` : quel héros est interrogé (ex. { classe: arcaniste }) ; si plusieurs conviennent, ou aucun, tirage à graine ;
 *  - `question` : dans le texte, {pseudo} = pseudo du joueur, {nom} = nom de son héros ;
 *  - `reponses` : celles dont le `si` correspond au héros passent d'abord, puis celles sans `si`.
 */
export const zParoleA = z.object({
  regle: zCondition.optional(),
  question: zReplique,
  reponses: z.array(z.object({ texte: z.string(), si: zCondition.optional(), effets: z.array(zConsequence).default([]), aller: z.string() })).min(1),
});
export type ParoleA = z.infer<typeof zParoleA>;

export const zNoeud = z.object({
  decor: z.string().optional(),
  parole_a: zParoleA.optional(),
  /**
   * Pari partagé : chaque joueur répond « Je mise » ou « Je ne mise pas ». La mise totale est répartie entre ceux
   * qui misent (division entière, le reste aux premiers joueurs). `aller` : nœud suivant si quelqu'un mise
   * (le drapeau `flag` est alors posé) ; `personne` : nœud suivant si personne ne mise.
   * Le gain ou la perte se règle ensuite avec les effets `gain_pari` et `perte_pari`.
   */
  pari: z.object({ mise: z.number().int().min(1), gain: z.number().min(1).default(2), flag: z.string().optional(), aller: z.string(), personne: z.string() }).optional(),
  repliques: z.array(zReplique).default([]),
  effets: z.array(zConsequence).default([]),
  choix: z.array(zChoix).default([]),
  suite: z.string().optional(),
  combat: z.object({ rencontre: z.string(), victoire: z.string(), defaite: z.string() }).optional(),
  donjon: z.object({ id: z.string(), sortie: z.string() }).optional(),
  fin: z.boolean().default(false),
});
export type Noeud = z.infer<typeof zNoeud>;

export const zScene = z.object({
  id: z.string(),
  titre: z.string(),
  type: z.enum(['groupe', 'individuel']),
  lieu: z.string().optional(),
  decor: z.string(),
  debut: z.string().default('debut'),
  disponible_si: zCondition.optional(),
  repetable: z.boolean().default(false),
  /** Scène romantique : masquée dans la version tout public (config.romance = false). */
  romance: z.boolean().default(false),
  quete: z.string().optional(),
  /** PNJ à qui il faut parler pour lancer la scène (on clique sur lui dans le lieu). */
  pnj: z.string().optional(),
  /** true : la scène sert à rendre une quête (symbole « ? » au-dessus du PNJ). */
  rend_quete: z.boolean().default(false),
  noeuds: z.record(z.string(), zNoeud),
});
export type Scene = z.infer<typeof zScene>;

export const zQuete = z.object({
  id: z.string(),
  titre: z.string(),
  type: z.enum(['principale', 'secondaire', 'classe', 'compagnon', 'contrat']),
  chapitre: z.number().int(),
  /** Niveau conseillé (comparé au niveau moyen du groupe : vert, orange, rouge). */
  niveau: z.number({ error: 'niveau conseillé obligatoire (champ « niveau »)' }).int().min(1),
  region: z.string().default('aubeclaire'),
  resume: z.string(),
  etapes: z.array(z.object({
    id: z.string(), objectif: z.string(), scene: z.string().optional(), lieu: z.string().optional(),
    /** Niveau conseillé de cette étape, s'il diffère de celui de la quête. */
    niveau: z.number().int().min(1).optional(),
    /** L'étape se valide toute seule quand le héros fait cette action (puis la quête passe à l'étape suivante). */
    declencheur: z.object({ acheter: z.string().optional(), vendre: z.boolean().optional() }).optional(),
  })),
});
export type Quete = z.infer<typeof zQuete>;

export const zLieu = z.object({
  id: z.string(),
  nom: z.string(),
  description: z.string(),
  decor: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  /** Ville qui contient ce lieu : il n'apparaît alors que sur le plan de la ville, pas sur la carte du monde. */
  ville: z.string().optional(),
  /** Position sur le plan de la ville (1280 × 720), utilisée tant que le fichier assets/cartes/<plan>.json n'est pas livré. */
  position_plan: z.object({ x: z.number(), y: z.number() }).optional(),
  disponible_si: zCondition.optional(),
  /** `position` : point au sol (pieds) du PNJ sur le décor (1280 × 720), si assets/decors/<decor>.json ne le donne pas. */
  pnj: z.array(z.object({ id: z.string(), si: zCondition.optional(), position: z.object({ x: z.number(), y: z.number() }).optional() })).default([]),
  boutique: z.array(z.string()).default([]),
  /** PNJ qui tient la boutique du lieu : on lui parle (« Voir la marchandise ») pour l'ouvrir. Obligatoire si le lieu a une boutique. */
  gerant: z.string().optional(),
  /** true : le lieu n'apparaît sur la carte que pendant l'étape de quête ou de contrat qui y mène. */
  etape_seulement: z.boolean().default(false),
  /** true : on peut y dormir (le lit de l'auberge fait passer les mois). */
  auberge: z.boolean().default(false),
});
export const zVille = z.object({
  id: z.string(),
  nom: z.string(),
  description: z.string().default(''),
  /** Image du plan : assets/cartes/<plan>.png, avec les positions des lieux dans assets/cartes/<plan>.json. */
  plan: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
});
export const zRegion = z.object({
  id: z.string(),
  nom: z.string(),
  carte: z.string(),
  villes: z.array(zVille).default([]),
  lieux: z.array(zLieu),
});
export type Region = z.infer<typeof zRegion>;
export type Lieu = z.infer<typeof zLieu>;

export const zPnj = z.object({
  id: z.string(),
  nom: z.string(),
  titre: z.string().default(''),
  description: z.string().default(''),
  /** Phrase d'accueil quand on lui parle (gérant de boutique surtout). */
  accueil: z.string().optional(),
  /** Prix auquel ce PNJ identifie un objet mystérieux (absent : il n'identifie rien). */
  identifie: z.number().int().min(0).optional(),
});
export type Pnj = z.infer<typeof zPnj>;

export const zDonjon = z.object({
  id: z.string(),
  nom: z.string(),
  tileset: z.string(),
  carte: z.array(z.string()).min(3),
  legende: z.record(z.string(), z.string()),
  depart: z.object({ x: z.number().int(), y: z.number().int() }),
  evenements: z.array(z.object({
    id: z.string(),
    x: z.number().int(),
    y: z.number().int(),
    type: z.enum(['combat', 'coffre', 'piege', 'scene', 'sortie', 'texte']),
    rencontre: z.string().optional(),
    objets: z.array(z.string()).default([]),
    or: z.number().default(0),
    texte: z.string().optional(),
    degats_pourcent: z.number().default(0),
    test: z.object({ carac: zCarac, difficulte: z.number() }).optional(),
    scene: z.string().optional(),
    unique: z.boolean().default(true),
    si: zCondition.optional(),
  })),
});
export type Donjon = z.infer<typeof zDonjon>;

/** Phrase d'ambiance dite par un passant (version Roblox : bulles au-dessus des têtes). */
export const zAmbiance = z.object({
  id: z.string(),
  /** Lieu où on l'entend (absent = partout en ville). */
  lieu: z.string().optional(),
  moment: z.enum(['jour', 'nuit', 'toujours']).default('toujours'),
  qui: z.enum(['villageois', 'garde', 'marchand', 'client', 'pretre']).default('villageois'),
  texte: z.string(),
  si: zCondition.optional(),
});
export type Ambiance = z.infer<typeof zAmbiance>;

/**
 * Étape d'un contrat, jouée sur la carte : on se rend au `lieu`, on lit le `texte`, puis
 *  - `choix` : un petit choix (chaque réponse a son `resultat` et ses `effets`) ;
 *  - `test` : un jet de caractéristique (raté : le contrat échoue, avec le texte `echec`) ;
 *  - `combat` : une rencontre à gagner pour passer à la suite ;
 *  - rien : on continue simplement. La dernière étape se joue à la Guilde et donne la récompense.
 */
export const zEtapeContrat = z.object({
  lieu: z.string(),
  objectif: z.string(),
  texte: z.string(),
  bouton: z.string().optional(),
  choix: z.array(z.object({ texte: z.string(), resultat: z.string().default(''), effets: z.array(zConsequence).default([]) })).default([]),
  test: z.object({ carac: zCarac, difficulte: z.number(), reussite: z.string().default(''), echec: z.string().default('') }).optional(),
  combat: z.string().optional(),
});
export type EtapeContrat = z.infer<typeof zEtapeContrat>;

export const zContrat = z.object({
  id: z.string(),
  titre: z.string(),
  description: z.string(),
  rang_min: z.string().default('F'),
  /** Niveau conseillé (comparé au niveau moyen du groupe : vert, orange, rouge). */
  niveau: z.number({ error: 'niveau conseillé obligatoire (champ « niveau »)' }).int().min(1),
  etapes: z.array(zEtapeContrat).default([]),
  rencontre: z.string().optional(),
  test: z.object({ carac: zCarac, difficulte: z.number() }).optional(),
  duree_jours: z.number().int(),
  recompenses: z.object({ or: z.number(), xp: z.number(), points_guilde: z.number(), objets: z.array(z.string()).default([]) }),
  disponible_si: zCondition.optional(),
});
export type Contrat = z.infer<typeof zContrat>;

export const zActivite = z.object({
  id: z.string(),
  nom: z.string(),
  description: z.string(),
  disponible_si: zCondition.optional(),
  gains: z.object({
    xp_pourcent_niveau: z.number().default(0),
    or_base: z.number().default(0),
    or_par_carac: z.object({ carac: zCarac, valeur: z.number() }).optional(),
    affinite: z.number().default(0),
    affinite_tous: z.number().default(0),
    points_guilde: z.number().default(0),
    objet_artisanat: z.boolean().default(false),
    carac_plus_un: z.boolean().default(false),
    soigne_blessure: z.boolean().default(false),
    /** Points de maîtrise donnés à chaque compétence équipée (pour 6 mois). */
    maitrise: z.number().default(0),
  }),
  choix_compagnon: z.boolean().default(false),
});
export type Activite = z.infer<typeof zActivite>;

export const zDifficulte = z.object({ puissance: z.number(), pv: z.number(), degats: z.number(), ennemis_en_plus: z.number().int() });

export const zConfig = z.object({
  saison_actuelle: z.number().int(),
  /** false = version tout public (Roblox) : scènes « romance » masquées, paliers renommés. */
  romance: z.boolean().default(true),
  saisons: z.array(z.object({
    numero: z.number().int(), titre: z.string(), annee_debut: z.number().int(), annees_par_chapitre: z.number().int(),
    chapitres: z.number().int(), sessions_par_chapitre: z.number().int(), niveau_max: z.number().int(), niveau_ultime: z.number().int(),
  })).min(1),
  calendrier: z.object({
    jours_par_mois: z.number().int(),
    mois: z.array(z.object({ nom: z.string(), saison: z.string() })).length(12),
    fetes: z.array(z.object({ nom: z.string(), mois: z.number().int(), jour: z.number().int() })),
  }),
  ellipses: z.object({
    entre_quetes_mois: z.array(z.number()).length(2), activites_temps_libre: z.number().int(), duree_reference_mois: z.number(),
    durees_auberge_mois: z.array(z.number().int().min(1)).default([1, 3, 6]),
  }),
  jours_temps_reel: z.object({ minutes_par_jour: z.number().default(10), inactivite_minutes: z.number().default(10) }).default({ minutes_par_jour: 10, inactivite_minutes: 10 }),
  personnage: z.object({
    total_caracteristiques: z.number().int(), carac_min: z.number().int(), carac_max: z.number().int(), points_carac_par_niveau: z.number().int(),
    age_invoque_min: z.number().int(), age_invoque_max: z.number().int(), annee_naissance_reincarne: z.number().int(),
    niveau_branche: z.number().int(), rang_competence_max: z.number().int(),
    variantes_max: z.number().int().default(2), competences_equipees_max: z.number().int().default(6), fusion_rang_min: z.number().int().default(2),
  }),
  experience: z.object({ base: z.number(), exposant: z.number() }),
  affinite: z.object({
    paliers: z.array(z.object({ id: z.string(), nom: z.string(), seuil: z.number() })),
    cadeau: z.object({ prefere: z.number(), apprecie: z.number(), neutre: z.number(), deteste: z.number() }),
    jours_entre_cadeaux: z.number().int(),
  }),
  reputation: z.object({ paliers: z.array(z.object({ nom: z.string(), seuil: z.number() })) }),
  guilde: z.object({ rangs: z.array(z.object({ rang: z.string(), points: z.number() })) }),
  difficulte: z.array(zDifficulte).min(1),
  combat: z.object({
    minuteur_tour_secondes: z.number(), regen_mana_base: z.number(), defense_par_vit: z.number(), resistance_par_esp: z.number(),
    toucher_base: z.number(), toucher_par_agi: z.number(), toucher_min: z.number(), toucher_max: z.number(),
    critique_base: z.number(), critique_par_agi: z.number(), multiplicateur_critique: z.number(), variance_degats: z.number(),
    potions_depart: z.number().int(),
    /** « Plus c'est puissant, moins c'est sûr » : une attaque de base est fiable, une compétence coûteuse l'est moins. */
    toucher_bonus_attaque_base: z.number().default(0),
    toucher_malus_par_mana: z.number().default(0),
    toucher_malus_max: z.number().default(0),
    toucher_mana_gratuit: z.number().default(0),
    /** Chance de toucher par niveau d'écart entre l'attaquant et sa cible (10 niveaux d'écart au plus). */
    toucher_par_niveau: z.number().default(0),
  }),
  /** Maîtrise d'une compétence (rang 0 à 5) : elle monte en l'utilisant et en s'entraînant. */
  maitrise: z.object({
    seuils: z.array(z.number()).default([5, 15, 30, 50, 80]),
    degats_par_rang: z.number().default(0.02),
    toucher_par_rang: z.number().default(0.01),
  }).default({ seuils: [5, 15, 30, 50, 80], degats_par_rang: 0.02, toucher_par_rang: 0.01 }),
  mort_douce: z.object({ perte_or_pourcent: z.number(), blessure_pv_pourcent: z.number() }),
  graphismes: z.record(z.string(), z.number()),
});
export type Config = z.infer<typeof zConfig>;
