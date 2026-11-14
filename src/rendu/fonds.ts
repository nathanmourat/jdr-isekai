/**
 * Choix de l'image de fond d'un combat. Un combat a TOUJOURS un décor : on essaie dans l'ordre
 *   1. le vrai fond de combat `combat/fonds/<fond>` ;
 *   2. le décor équivalent de `content/config/fonds.yaml` ;
 *   3. le décor du lieu où le combat commence ;
 *   4. le fond générique : `plaine` (extérieur) ou `crypte` (souterrain, intérieur) ;
 *   5. rien (null) : la scène dessine alors un dégradé, en dernier recours.
 * Sans Phaser ni navigateur : `existe` dit si une image est présente (chemin sans extension, relatif à assets/),
 * ce qui permet de tester la chaîne avec les fichiers du disque.
 */
import type { Contenu } from '../contenu/types';

export interface SourceFond {
  /** Chemin dans assets/, sans extension (ex. « combat/fonds/plaine » ou « decors/combe-lisiere »). */
  chemin: string;
  /** true : c'est un décor de lieu, pas un vrai fond de combat (on l'assombrit et on ajoute une bande de sol). */
  decor: boolean;
  /** Étape de la chaîne qui a trouvé l'image (1 à 4). */
  etape: 1 | 2 | 3 | 4;
}

export function choisirFond(contenu: Contenu, fond: string, decorLieu: string | null, existe: (chemin: string) => boolean): SourceFond | null {
  const vrai = `combat/fonds/${fond}`;
  if (existe(vrai)) return { chemin: vrai, decor: false, etape: 1 };
  const def = contenu.fondsCombat?.[fond];
  const equivalents = def?.decor === undefined ? [] : Array.isArray(def.decor) ? def.decor : [def.decor];
  for (const d of equivalents) if (existe(`decors/${d}`)) return { chemin: `decors/${d}`, decor: true, etape: 2 };
  if (decorLieu !== null && existe(`decors/${decorLieu}`)) return { chemin: `decors/${decorLieu}`, decor: true, etape: 3 };
  const generique = `combat/fonds/${def?.type === 'interieur' ? 'crypte' : 'plaine'}`;
  if (existe(generique)) return { chemin: generique, decor: false, etape: 4 };
  return null;
}
