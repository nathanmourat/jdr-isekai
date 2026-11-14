/**
 * Aide à l'orientation : où se trouvent les combats, et quelle est la prochaine étape de l'histoire.
 * Lecture seule : ne modifie jamais l'état.
 */
import type { Contenu } from '../contenu/types';
import type { Lieu, Scene } from '../contenu/schemas';
import { conditionHeros, etapeContrat, listeHeros, prochainExamen, scenesDisponibles, sceneEstDisponible, type EtatPartie } from './partie';
import { niveauMoyen } from './personnage';
import { entrees, valeurs, vrai } from './outils';
import { versJour } from './temps';

/** Un bureau de la Guilde (Lysmont, ou ses comptoirs dans les autres régions : `guilde-…`) : contrats et fusions. */
export function estGuilde(lieu: string): boolean {
  return lieu === 'guilde' || lieu.startsWith('guilde-');
}

/** Lieu de n'importe quelle région, et l'id de sa région. */
export function trouverLieu(contenu: Contenu, id: string): { lieu: Lieu; region: string } | null {
  for (const r of valeurs(contenu.regions)) {
    const l = r.lieux.find((x) => x.id === id);
    if (l) return { lieu: l, region: r.id };
  }
  return null;
}

/** Vrai si un des nœuds de la scène lance un combat ou un donjon. */
export function sceneAvecCombat(s: Scene): boolean {
  return valeurs(s.noeuds).some((n) => !!n.combat || !!n.donjon);
}

/** Vrai si le lieu propose un combat au héros : scène de combat disponible, ou contrats à la Guilde. */
export function lieuAvecCombat(contenu: Contenu, etat: EtatPartie, lieu: string, herosId: string | null): boolean {
  if (scenesDisponibles(contenu, etat, lieu, herosId).some((s) => sceneAvecCombat(s))) return true;
  const ec = vrai(herosId) ? etapeContrat(contenu, etat, herosId) : null;
  if (ec && ec.etape.lieu === lieu && vrai(ec.etape.combat)) return true;
  if (estGuilde(lieu) && vrai(herosId)) {
    const h = etat.heros[herosId];
    return !!h && valeurs(contenu.contrats).some((ct) => conditionHeros(contenu, etat, ct.disponible_si, h));
  }
  return false;
}

export interface ProchaineEtape {
  objectif: string;
  /** Lieu à rejoindre (absent si l'étape n'a pas de lieu). */
  lieu: string | null;
  nomLieu: string | null;
  /** Vrai si la scène de l'étape peut être lancée maintenant. */
  disponible: boolean;
  /** Jour (absolu) à partir duquel l'étape sera possible, si elle attend une date ; sinon null. */
  attenteJour: number | null;
}

function nomDuLieu(contenu: Contenu, lieu: string | null): string | null {
  if (!vrai(lieu)) return null;
  for (const r of valeurs(contenu.regions)) {
    const l = r.lieux.find((x) => x.id === lieu);
    if (l) return l.nom;
  }
  return lieu;
}

/** Étape en cours de la quête principale ; avant son début, la première scène principale disponible. */
export function prochaineEtape(contenu: Contenu, etat: EtatPartie, herosId: string | null): ProchaineEtape | null {
  for (const [id, q] of entrees(etat.quetes)) {
    const def = contenu.quetes[id];
    if (!def || def.type !== 'principale' || q.terminee) continue;
    const e = def.etapes.find((x) => x.id === q.etape);
    if (!e) continue;
    const scene = vrai(e.scene) ? contenu.scenes[e.scene] : null;
    const lieu = e.lieu ?? scene?.lieu ?? null;
    const dateMin = scene?.disponible_si?.date_min;
    const jourMin = dateMin ? versJour(contenu, dateMin) : null;
    return {
      objectif: e.objectif, lieu, nomLieu: nomDuLieu(contenu, lieu), disponible: !!scene && sceneEstDisponible(contenu, etat, scene, herosId),
      attenteJour: jourMin !== null && jourMin > etat.jour ? jourMin : null,
    };
  }
  const debut = valeurs(contenu.scenes).find((s) => vrai(s.quete) && contenu.quetes[s.quete]?.type === 'principale' && sceneEstDisponible(contenu, etat, s, herosId));
  if (!debut) return null;
  const def = contenu.quetes[debut.quete!];
  const e = def.etapes.find((x) => x.scene === debut.id);
  const lieu = debut.lieu ?? null;
  return { objectif: e?.objectif ?? debut.titre, lieu, nomLieu: nomDuLieu(contenu, lieu), disponible: true, attenteJour: null };
}

// ───────────────────────────── PNJ et symboles (« ! » et « ? ») ─────────────────────────────

/** 'principale' = « ! » doré, 'secondaire' = « ! » argenté, 'rendre' = « ? » (quête à rendre). */
export type Marqueur = 'principale' | 'secondaire' | 'rendre';

function marqueurScene(contenu: Contenu, s: Scene): Marqueur {
  if (s.rend_quete) return 'rendre';
  if (vrai(s.quete) && contenu.quetes[s.quete]?.type === 'principale') return 'principale';
  return 'secondaire';
}

function plusImportant(a: Marqueur | null, b: Marqueur): Marqueur {
  if (a === null) return b;
  const ordre: Marqueur[] = ['secondaire', 'rendre', 'principale'];
  return ordre.indexOf(b) > ordre.indexOf(a) ? b : a;
}

/** Scènes disponibles dans ce lieu qui se lancent en parlant à ce PNJ. */
export function scenesDuPnj(contenu: Contenu, etat: EtatPartie, lieu: string, pnj: string, herosId: string | null): Scene[] {
  return scenesDisponibles(contenu, etat, lieu, herosId).filter((s) => s.pnj === pnj);
}

/**
 * Vrai si ce PNJ fait passer les examens de rang dans ce lieu : l'examinatrice (Dame Rowena),
 * ou le gérant d'un comptoir de Guilde régional (Ibrek, Orsa, Hjalmi, Marée, Valka…).
 */
export function estExaminateur(contenu: Contenu, lieu: string, pnj: string): boolean {
  if (pnj === contenu.config.guilde.examinatrice) return true;
  if (!estGuilde(lieu)) return false;
  const l = trouverLieu(contenu, lieu)?.lieu;
  return !!l && l.gerant === pnj;
}

/** Symbole à afficher au-dessus d'un PNJ (null : rien d'important à dire). */
export function marqueurPnj(contenu: Contenu, etat: EtatPartie, lieu: string, pnj: string, herosId: string | null): Marqueur | null {
  let res: Marqueur | null = null;
  for (const s of scenesDuPnj(contenu, etat, lieu, pnj, herosId)) res = plusImportant(res, marqueurScene(contenu, s));
  // l'examinatrice de la Guilde porte un « ! » quand le héros peut passer un examen de rang
  if (estExaminateur(contenu, lieu, pnj) && examenPret(contenu, etat, herosId)) res = plusImportant(res, 'secondaire');
  return res;
}

/** Vrai si le héros peut passer maintenant l'examen de son prochain rang de Guilde. */
export function examenPret(contenu: Contenu, etat: EtatPartie, herosId: string | null): boolean {
  if (!vrai(herosId)) return false;
  const ex = prochainExamen(contenu, etat, herosId);
  return !!ex && ex.pret;
}

/** Symbole à afficher sur un lieu de la carte ou du plan (le plus important de ses scènes). */
export function marqueurLieu(contenu: Contenu, etat: EtatPartie, lieu: string, herosId: string | null): Marqueur | null {
  let res: Marqueur | null = null;
  for (const s of scenesDisponibles(contenu, etat, lieu, herosId)) res = plusImportant(res, marqueurScene(contenu, s));
  // examen de rang possible : le lieu où se tient l'examinatrice est signalé
  if (examenPret(contenu, etat, herosId)) {
    for (const r of valeurs(contenu.regions)) {
      const l = r.lieux.find((x) => x.id === lieu);
      if (l && l.pnj.some((p) => estExaminateur(contenu, lieu, p.id))) res = plusImportant(res, 'secondaire');
    }
  }
  return res;
}

/** Joueurs qui ne participeront pas à une scène de groupe lancée maintenant (absents dont le héros reste au camp, ou sans héros). */
export function absentsDuGroupe(etat: EtatPartie): string[] {
  const res: string[] = [];
  for (const j of etat.ordreJoueurs) {
    const joueur = etat.joueurs[j];
    const h = vrai(joueur.herosId) ? etat.heros[joueur.herosId] : null;
    if (!h) res.push(`${joueur.pseudo} (pas encore de héros)`);
    else if (!joueur.present) res.push(`${joueur.pseudo} (absent : ${h.siAbsent === 'ia' ? "son héros sera joué par l'ordinateur" : 'son héros reste au camp'})`);
  }
  return res;
}

/**
 * Lieux où mène une étape en cours (quêtes de la partie, contrat du héros) : ils clignotent sur la carte.
 * Les lieux « etape_seulement » ne sont visibles que s'ils sont dans cette liste.
 */
export function lieuxDesEtapes(contenu: Contenu, etat: EtatPartie, herosId: string | null): string[] {
  const res: string[] = [];
  for (const [id, q] of entrees(etat.quetes)) {
    const def = contenu.quetes[id];
    if (!def || q.terminee) continue;
    const e = def.etapes.find((x) => x.id === q.etape);
    const lieu = e ? e.lieu ?? (vrai(e.scene) ? contenu.scenes[e.scene]?.lieu : undefined) : undefined;
    if (vrai(lieu) && !res.includes(lieu)) res.push(lieu);
  }
  const ec = vrai(herosId) ? etapeContrat(contenu, etat, herosId) : null;
  if (ec && !res.includes(ec.etape.lieu)) res.push(ec.etape.lieu);
  return res;
}
// ───────────────────────────── Niveau conseillé des quêtes et des contrats ─────────────────────────────

/** vert : le groupe a le niveau ; orange : il lui manque 1 ou 2 niveaux ; rouge : il lui en manque 3 ou plus. */
export type CouleurNiveau = 'vert' | 'orange' | 'rouge';

/** Niveau du groupe : la moyenne des niveaux des héros (arrondie à l'inférieur). */
export function niveauGroupe(etat: EtatPartie): number {
  return niveauMoyen(listeHeros(etat));
}

export function couleurNiveau(conseille: number, groupe: number): CouleurNiveau {
  const manque = conseille - groupe;
  if (manque <= 0) return 'vert';
  return manque <= 2 ? 'orange' : 'rouge';
}

/** Phrase d'aide affichée à côté du niveau conseillé. */
export function aideNiveau(conseille: number, groupe: number): string {
  const debut = `Conseillé : niveau ${conseille}. Votre groupe : niveau ${groupe}.`;
  const couleur = couleurNiveau(conseille, groupe);
  if (couleur === 'vert') return `${debut} Vous avez le niveau.`;
  if (couleur === 'orange') return `${debut} Ce sera difficile : entraînez-vous ou faites d'abord des contrats plus faciles.`;
  return `${debut} C'est bien trop fort pour l'instant : entraînez-vous ou faites d'abord des contrats plus faciles.`;
}

/** Niveau conseillé d'une quête : celui de son étape en cours si elle en a un, sinon celui de la quête. */
export function niveauQuete(contenu: Contenu, etat: EtatPartie, queteId: string): number {
  const def = contenu.quetes[queteId];
  const e = def.etapes.find((x) => x.id === etat.quetes[queteId]?.etape);
  return e?.niveau ?? def.niveau;
}

/** Niveau conseillé d'une scène : celui de l'étape de quête qui la lance (null : scène sans quête). */
export function niveauScene(contenu: Contenu, s: Scene): number | null {
  if (!vrai(s.quete)) return null;
  const def = contenu.quetes[s.quete];
  if (!def) return null;
  return def.etapes.find((x) => x.scene === s.id)?.niveau ?? def.niveau;
}

/** Niveau conseillé le plus élevé parmi les étapes en cours qui mènent à ce lieu (quêtes, contrat du héros) ; null s'il n'y en a pas. */
export function niveauDuLieu(contenu: Contenu, etat: EtatPartie, lieu: string, herosId: string | null): number | null {
  let res: number | null = null;
  const garder = (n: number) => { if (res === null || n > res) res = n; };
  for (const [id, q] of entrees(etat.quetes)) {
    const def = contenu.quetes[id];
    if (!def || q.terminee) continue;
    const e = def.etapes.find((x) => x.id === q.etape);
    const l = e ? e.lieu ?? (vrai(e.scene) ? contenu.scenes[e.scene]?.lieu : undefined) : undefined;
    if (l === lieu) garder(e?.niveau ?? def.niveau);
  }
  const ec = vrai(herosId) ? etapeContrat(contenu, etat, herosId) : null;
  if (ec && ec.etape.lieu === lieu) garder(ec.contrat.niveau);
  return res;
}
