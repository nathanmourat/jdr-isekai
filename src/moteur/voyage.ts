/**
 * Héros voyageurs (version Roblox : un groupe joue la campagne de son chef).
 *
 * Sur Roblox, chaque joueur a SA campagne, sauvegardée sur son compte. Quand il rejoint le groupe d'un autre
 * joueur, son héros part « en renfort » dans la campagne du chef :
 *  - `exporterHeros` prend une photo du héros (progression, sac, compétences, rang, points de Guilde, affinités) ;
 *  - l'action `invite_arrive` l'installe dans la campagne du chef (marqué `invite`, il reste au camp quand il est absent) ;
 *  - quand il quitte le groupe, l'action `heros_retour` recopie ses gains (XP, niveaux, or, objets, compétences…)
 *    sur son héros, dans sa propre campagne. L'histoire de sa campagne, elle, ne change pas.
 * La version web n'utilise pas ces actions.
 */
import type { Affinite } from './affinite';
import type { Heros } from './personnage';
import { copieProfonde, entrees, vrai } from './outils';

export interface HerosVoyageur {
  heros: Heros;
  pointsGuilde: number;
  rang: string | null;
  affinites: Record<string, Affinite>;
}

/** Ce qu'il faut savoir d'une partie pour exporter un héros (sous-ensemble d'EtatPartie). */
interface EtatHeros {
  heros: Record<string, Heros>;
  pointsGuilde: Record<string, number>;
  rangs: Record<string, string>;
  affinites: Record<string, Record<string, Affinite>>;
}

/** Photo d'un héros, pour l'emmener dans une autre campagne (ou l'en ramener). */
export function exporterHeros(etat: EtatHeros, herosId: string): HerosVoyageur {
  const h = etat.heros[herosId];
  if (!vrai(h)) throw new Error('Héros introuvable');
  const rang = (etat.rangs ?? {})[herosId];
  return {
    heros: copieProfonde(h),
    pointsGuilde: etat.pointsGuilde[herosId] ?? 0,
    rang: vrai(rang) ? rang : null,
    affinites: copieProfonde(etat.affinites[herosId] ?? {}),
  };
}

/** Recopie la progression d'un héros voyageur sur un héros (même personnage, autre campagne). */
export function recopierProgression(cible: Heros, v: Heros) {
  cible.niveau = v.niveau;
  cible.xp = v.xp;
  cible.caracsBonus = copieProfonde(v.caracsBonus);
  cible.pointsCaracDispo = v.pointsCaracDispo;
  cible.pointsCompetenceDispo = v.pointsCompetenceDispo;
  cible.rangsCompetences = copieProfonde(v.rangsCompetences);
  cible.branche = v.branche;
  cible.equipement = copieProfonde(v.equipement);
  cible.inventaire = copieProfonde(v.inventaire);
  cible.or = v.or;
  cible.blessure = v.blessure;
  cible.pv = v.pv;
  cible.variantes = copieProfonde(v.variantes);
  cible.varianteActive = copieProfonde(v.varianteActive);
  cible.equipees = v.equipees === null ? null : copieProfonde(v.equipees);
  cible.grimoire = copieProfonde(v.grimoire ?? {});
  cible.maitrise = copieProfonde(v.maitrise ?? {});
  cible.ultime = v.ultime;
}

/** Recopie aussi ce qui est rangé hors du héros (points de Guilde, rang, affinités). */
export function recopierAutour(etat: EtatHeros, herosId: string, v: HerosVoyageur) {
  etat.pointsGuilde[herosId] = v.pointsGuilde;
  if (vrai(v.rang)) etat.rangs[herosId] = v.rang;
  etat.affinites[herosId] ??= {};
  for (const [co, a] of entrees(v.affinites)) etat.affinites[herosId][co] = copieProfonde(a);
}
