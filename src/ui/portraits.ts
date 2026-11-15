/**
 * Portraits animés de dialogue (version web) : on cherche les fichiers livrés par le graphiste.
 * Un personnage a un portrait animé quand son dossier contient (voir docs/PORTRAITS-IA.md § 5) :
 *   portrait-<nom>.png       (512 × 512, fond transparent)
 *   anim/anim.json           (réglages par nom : bouche, largeur, ouverte, cou)
 *   anim/<nom>/yeux.png, anim/<nom>/carte.png   (facultatifs : sans eux, pas de clignement ni de déformation)
 * Compagnes : personnages/compagnes/<id>/ ; PNJ : personnages/pnj/<id>/ ; les noms sont les expressions (neutre, joie…).
 * Héros : personnages/races/<race>/, noms « defaut-f » (héroïne) puis « defaut ».
 * Sinon : null, et le dialogue garde l'image fixe (portraitPersonnage / portraitHeros).
 */
import type { Contenu } from '../contenu/charger';
import type { EffetsPortrait } from '../contenu/schemas';
import type { Heros } from '../moteur/personnage';
import { urlAsset } from '../rendu/assets';
import type { CalquesPortrait, ReglagesExpression } from '../rendu/portraitAnime';

interface AnimJson { taille?: number; expressions?: Record<string, Partial<ReglagesExpression>> }

const animsJson = import.meta.glob('/assets/personnages/**/anim/anim.json', { import: 'default', eager: true }) as Record<string, AnimJson>;

export interface PortraitAnimeDef {
  /** Identifiant stable (dossier + nom) : le portrait ne se recharge que s'il change. */
  cle: string;
  calques: CalquesPortrait;
  reglages: Partial<ReglagesExpression>;
  effets: EffetsPortrait;
}

/** Réglages d'animation d'un dossier (chemin dans assets/, avec « / » final), ou null. */
function reglagesDe(dossier: string, nom: string, anims: Record<string, AnimJson>): Partial<ReglagesExpression> | null {
  return anims[`/assets/${dossier}anim/anim.json`]?.expressions?.[nom] ?? null;
}

function definir(dossier: string, nom: string, reglages: Partial<ReglagesExpression>, effets: EffetsPortrait): PortraitAnimeDef | null {
  const base = urlAsset(`${dossier}portrait-${nom}`);
  if (!base) return null;
  return {
    cle: `${dossier}${nom}`,
    calques: { base, yeux: urlAsset(`${dossier}anim/${nom}/yeux`), carte: urlAsset(`${dossier}anim/${nom}/carte`) },
    reglages,
    effets,
  };
}

function effetsDe(contenu: Contenu, id: string | null): EffetsPortrait {
  const p = contenu.portraits;
  return (id ? p?.personnages?.[id] : undefined) ?? p?.defaut ?? { lueur: null, particules: null };
}

/**
 * Portrait animé d'une compagne ou d'un PNJ pour une expression. S'il manque l'expression, on prend « neutre ».
 * `anims` sert aux tests (par défaut : les anim.json du dossier assets/).
 */
export function portraitAnimePersonnage(contenu: Contenu, qui: string, expression = 'neutre', anims = animsJson): PortraitAnimeDef | null {
  if (qui === 'narrateur' || qui === 'heros' || qui === 'meneur') return null;
  const dossier = contenu.compagnons[qui] ? `personnages/compagnes/${qui}/` : `personnages/pnj/${qui}/`;
  for (const nom of expression === 'neutre' ? ['neutre'] : [expression, 'neutre']) {
    const r = reglagesDe(dossier, nom, anims);
    if (!r || !urlAsset(`${dossier}portrait-${nom}`)) continue;
    return definir(dossier, nom, r, effetsDe(contenu, qui));
  }
  return null;
}

/**
 * Portrait animé par défaut d'un héros (portrait de sa race, version féminine pour une héroïne si elle existe).
 * On prend la même image que le portrait fixe (première qui existe) et on ne l'anime que si elle a ses réglages.
 */
export function portraitAnimeHeros(contenu: Contenu, h: Heros, anims = animsJson): PortraitAnimeDef | null {
  if (h.portrait) return null;   // portrait importé par le joueur : image fixe
  const dossier = `personnages/races/${h.race}/`;
  for (const nom of h.sexe === 'f' ? ['defaut-f', 'defaut'] : ['defaut']) {
    if (!urlAsset(`${dossier}portrait-${nom}`)) continue;
    const r = reglagesDe(dossier, nom, anims);
    return r ? definir(dossier, nom, r, effetsDe(contenu, null)) : null;
  }
  return null;
}

/** Rythme de la parole : délai (ms) après chaque caractère affiché. */
export function delaiApresLettre(c: string): number {
  if (/[.!?…]/.test(c)) return 380;
  if (/[,;:]/.test(c)) return 180;
  return 42;
}
