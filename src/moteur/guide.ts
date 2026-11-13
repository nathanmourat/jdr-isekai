/**
 * Aide à l'orientation : où se trouvent les combats, et quelle est la prochaine étape de l'histoire.
 * Lecture seule : ne modifie jamais l'état.
 */
import type { Contenu } from '../contenu/types';
import type { Scene } from '../contenu/schemas';
import { conditionHeros, scenesDisponibles, sceneEstDisponible, type EtatPartie } from './partie';
import { entrees, valeurs, vrai } from './outils';

/** Vrai si un des nœuds de la scène lance un combat ou un donjon. */
export function sceneAvecCombat(s: Scene): boolean {
  return valeurs(s.noeuds).some((n) => !!n.combat || !!n.donjon);
}

/** Vrai si le lieu propose un combat au héros : scène de combat disponible, ou contrats à la Guilde. */
export function lieuAvecCombat(contenu: Contenu, etat: EtatPartie, lieu: string, herosId: string | null): boolean {
  if (scenesDisponibles(contenu, etat, lieu, herosId).some((s) => sceneAvecCombat(s))) return true;
  if (lieu === 'guilde' && vrai(herosId)) {
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
    return { objectif: e.objectif, lieu, nomLieu: nomDuLieu(contenu, lieu), disponible: !!scene && sceneEstDisponible(contenu, etat, scene, herosId) };
  }
  const debut = valeurs(contenu.scenes).find((s) => vrai(s.quete) && contenu.quetes[s.quete]?.type === 'principale' && sceneEstDisponible(contenu, etat, s, herosId));
  if (!debut) return null;
  const def = contenu.quetes[debut.quete!];
  const e = def.etapes.find((x) => x.scene === debut.id);
  const lieu = debut.lieu ?? null;
  return { objectif: e?.objectif ?? debut.titre, lieu, nomLieu: nomDuLieu(contenu, lieu), disponible: true };
}
