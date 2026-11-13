/**
 * Fusions de compétences : combiner deux compétences connues crée une VARIANTE de la première.
 *
 * Règles (réglables dans content/config/campagne.yaml, section personnage) :
 *  - les deux compétences doivent être connues, au rang `fusion_rang_min` au moins ;
 *  - leurs éléments doivent être différents (fusionner du feu avec du feu n'apporte rien) ;
 *  - une compétence a au plus `variantes_max` variantes, et une seule active à la fois ;
 *  - les chiffres sortent TOUJOURS de la formule ci-dessous, jamais d'une proposition de joueur :
 *    75 % de la puissance de la compétence principale + 45 % de la seconde (dans son élément),
 *    pour 75 % du mana des deux et une recharge d'un tour de plus.
 *    Une fusion fait donc moins que les deux compétences jouées en deux tours, mais en un seul tour
 *    et avec deux éléments (utile contre les faiblesses).
 */
import type { Contenu } from '../contenu/types';
import type { Competence, Effet } from '../contenu/schemas';
import { competencesConnues, type Heros } from './personnage';
import { vrai } from './outils';

export interface Technique extends Competence {
  parent: string;
  secondaire: string;
  elementPrincipal: string;
  elementSecondaire: string;
  creePar: string;
}

export const NOM_ELEMENT: Record<string, string> = {
  physique: 'acier', feu: 'flamme', glace: 'givre', foudre: 'foudre', sacre: 'lumière', ombre: 'ombre', poison: 'venin', arcane: 'runes',
};
const ELEMENT_D_ETAT: Record<string, string> = { brulure: 'feu', gel: 'glace', poison: 'poison', silence: 'arcane', peur: 'ombre', sommeil: 'arcane', marque: 'arcane', immobilise: 'physique' };

/** Élément « dominant » d'une compétence : celui de ses dégâts, sinon celui de son principal effet. */
export function elementDe(c: Competence): string | null {
  const d = c.effets.find((e): e is Extract<Effet, { type: 'degats' }> => e.type === 'degats');
  if (d) return d.element;
  const s = c.effets.find((e): e is Extract<Effet, { type: 'etat' }> => e.type === 'etat');
  return s ? ELEMENT_D_ETAT[s.etat] ?? null : null;
}

export const idFusion = (parent: string, secondaire: string) => `fusion:${parent}+${secondaire}`;

export type ResultatFusion = { ok: true; technique: Technique } | { ok: false; raison: string };

/** Construit la technique (sans l'apprendre). */
export function creerTechnique(contenu: Contenu, parentId: string, secondaireId: string, auteur: string): ResultatFusion {
  const p = contenu.competences[parentId];
  const q = contenu.competences[secondaireId];
  if (!p || !q) return { ok: false, raison: 'Compétence inconnue.' };
  if (parentId === secondaireId) return { ok: false, raison: 'Il faut deux compétences différentes.' };
  const dp = p.effets.find((e): e is Extract<Effet, { type: 'degats' }> => e.type === 'degats');
  if (!dp) return { ok: false, raison: `« ${p.nom} » n'inflige pas de dégâts : elle ne peut pas servir de base à une fusion. Essayez dans l'autre sens.` };
  const e1 = dp.element;
  const e2 = elementDe(q);
  if (!vrai(e2)) return { ok: false, raison: `« ${q.nom} » n'a pas d'élément à transmettre.` };
  if (e1 === e2) return { ok: false, raison: `« ${p.nom} » et « ${q.nom} » sont du même élément (${NOM_ELEMENT[e1]}) : rien à fusionner.` };
  const dq = q.effets.find((e): e is Extract<Effet, { type: 'degats' }> => e.type === 'degats');
  const etatsQ = q.effets.filter((e): e is Extract<Effet, { type: 'etat' }> => e.type === 'etat' && e.cible !== 'soi' && e.cible !== 'tous_allies');
  const effets: Effet[] = [
    { ...dp, puissance: Math.round(dp.puissance * 0.75 * 10) / 10 },
    { type: 'degats', puissance: Math.round((dq?.puissance ?? 8) * 0.45 * 10) / 10, stat: dq?.stat ?? dp.stat, element: e2 as Extract<Effet, { type: 'degats' }>['element'], coups: 1, critique_garanti: false, cout_pv_pourcent: 0 },
    ...etatsQ.map((e) => ({ ...e, chance: Math.round(e.chance * 0.8 * 100) / 100 })),
  ];
  const technique: Technique = {
    id: idFusion(parentId, secondaireId),
    nom: `${p.nom} ✦ ${NOM_ELEMENT[e2]}`,
    description: `Variante de « ${p.nom} » imprégnée de ${NOM_ELEMENT[e2]} (fusion avec « ${q.nom} »).`,
    cout: Math.round((p.cout + q.cout) * 0.75),
    recharge: Math.max(p.recharge, q.recharge) + 1,
    cible: p.cible,
    portee: p.portee,
    effets,
    ia: { priorite: 3, quand: 'toujours' },
    parent: parentId,
    secondaire: secondaireId,
    elementPrincipal: e1,
    elementSecondaire: e2,
    creePar: auteur,
  };
  return { ok: true, technique };
}

/** Le héros peut-il apprendre cette technique ? (raison en français sinon) */
export function peutApprendre(contenu: Contenu, h: Heros, t: Technique): string | null {
  const cfg = contenu.config.personnage;
  const connues = competencesConnues(contenu, h);
  for (const id of [t.parent, t.secondaire]) {
    if (!connues.includes(id)) return `Il faut connaître « ${contenu.competences[id]?.nom ?? id} ».`;
    if ((h.rangsCompetences[id] ?? 1) < cfg.fusion_rang_min) return `Il faut « ${contenu.competences[id].nom} » au rang ${cfg.fusion_rang_min} au moins (actuellement ${h.rangsCompetences[id] ?? 1}).`;
  }
  const deja = h.variantes[t.parent] ?? [];
  if (deja.includes(t.id)) return 'Vous connaissez déjà cette technique.';
  if (deja.length >= cfg.variantes_max) return `« ${contenu.competences[t.parent].nom} » a déjà ${cfg.variantes_max} variantes : oubliez-en une d'abord (fiche du personnage).`;
  return null;
}

/** Apprend la technique et l'active. */
export function apprendre(h: Heros, t: Technique) {
  h.variantes[t.parent] = [...(h.variantes[t.parent] ?? []), t.id];
  h.varianteActive[t.parent] = t.id;
}
