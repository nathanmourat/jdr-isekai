import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { contenuDisque, RACINE } from '../src/contenu/node';
import { choisirFond } from '../src/rendu/fonds';

const c = contenuDisque();
/** Une image est présente dans assets/ (chemin sans extension). */
const existe = (chemin: string) => existeVraiment(chemin);
const existeVraiment = (chemin: string) => ['png', 'webp', 'jpg', 'jpeg'].some((ext) => existsSync(join(RACINE, 'assets', `${chemin}.${ext}`)));
const fondsCites = [...new Set(Object.values(c.rencontres).map((r) => r.fond))].sort();

describe('Fonds de combat : un combat a toujours un décor', () => {
  it('chaque fond cité par une rencontre trouve une vraie image (vrai fond ou décor équivalent), jamais le dégradé', () => {
    expect(fondsCites.length).toBeGreaterThan(10);
    const sansImage = fondsCites.filter((f) => {
      const s = choisirFond(c, f, null, existe);
      return s === null || s.etape > 2; // le fond générique ne suffit pas : il faut une image pensée pour ce lieu
    });
    expect(sansImage, `fonds sans image (ajoutez assets/combat/fonds/<fond>.png ou une ligne dans content/config/fonds.yaml)`).toEqual([]);
  });

  it('depuis la livraison des vrais fonds (branche textures-fonds), chaque fond cité a son propre fichier : étape 1', () => {
    const empruntes = fondsCites.filter((f) => choisirFond(c, f, null, existe)?.etape !== 1);
    expect(empruntes, 'fonds qui empruntent encore un décor (ajoutez assets/combat/fonds/<fond>.png)').toEqual([]);
  });
  it('chaque décor de content/config/fonds.yaml existe dans assets/decors/', () => {
    for (const [fond, def] of Object.entries(c.fondsCombat)) {
      const decors = def.decor === undefined ? [] : Array.isArray(def.decor) ? def.decor : [def.decor];
      for (const d of decors) expect(existe(`decors/${d}`), `${fond} → decors/${d}`).toBe(true);
    }
  });

  it('ordre de la chaîne : vrai fond, décor équivalent, décor du lieu, fond générique', () => {
    // comme avant la livraison des vrais fonds : seuls plaine et crypte existaient
    const existe = (ch: string) => (!ch.startsWith('combat/fonds/') || ch === 'combat/fonds/plaine' || ch === 'combat/fonds/crypte') && existeVraiment(ch);
    expect(choisirFond(c, 'plaine', 'guilde', existe)).toEqual({ chemin: 'combat/fonds/plaine', decor: false, etape: 1 });
    expect(choisirFond(c, 'foret', 'guilde', existe)).toEqual({ chemin: 'decors/combe-lisiere', decor: true, etape: 2 });
    expect(choisirFond(c, 'fond-inconnu', 'guilde', existe)).toEqual({ chemin: 'decors/guilde', decor: true, etape: 3 });
    expect(choisirFond(c, 'fond-inconnu', null, existe)).toEqual({ chemin: 'combat/fonds/plaine', decor: false, etape: 4 });
    expect(choisirFond(c, 'mine', null, () => false)).toBeNull();
    // un fond souterrain sans décor ni lieu prend la crypte
    const sansDecor = (ch: string) => ch.startsWith('combat/fonds/crypte') || ch.startsWith('combat/fonds/plaine');
    expect(choisirFond(c, 'mine', null, sansDecor)?.chemin).toBe('combat/fonds/crypte');
  });

  it('un vrai fond de combat livré plus tard passe en priorité', () => {
    const avecForet = (ch: string) => ch === 'combat/fonds/foret' || existe(ch);
    expect(choisirFond(c, 'foret', null, avecForet)).toEqual({ chemin: 'combat/fonds/foret', decor: false, etape: 1 });
  });
});
