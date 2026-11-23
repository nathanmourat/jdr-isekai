import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { contenuDisque } from '../src/contenu/node';
import { cleChapitreVu, ecranDuChapitre, urlIllustration } from '../src/ui/illustrations';

const c = contenuDisque();

describe('Écrans de début de chapitre (illustrations, web)', () => {
  it('les 6 chapitres de la saison 1 ont un écran, dans l\'ordre, avec un titre', () => {
    expect(c.ecransChapitre.map((e) => e.chapitre)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const e of c.ecransChapitre) expect(e.titre.length).toBeGreaterThan(0);
  });

  it('chaque illustration citée existe dans assets/illustrations/', () => {
    for (const e of c.ecransChapitre) for (const id of e.illustrations) {
      const ok = ['jpg', 'png', 'webp'].some((x) => existsSync(`assets/illustrations/${id}.${x}`));
      expect(ok, `chapitre ${e.chapitre} › ${id}`).toBe(true);
    }
  });

  it('le titre correspond à la quête principale du chapitre', () => {
    const titres = Object.values(c.quetes).map((q) => q.titre);
    for (const e of c.ecransChapitre) expect(titres, `chapitre ${e.chapitre}`).toContain(`Chapitre ${e.chapitre} — ${e.titre}`);
  });

  it('cherche jpg, puis png, puis webp ; sans image, pas d\'écran', () => {
    const fichiers = { '/assets/illustrations/qarzim.png': '/q.png', '/assets/illustrations/ardenclume.jpg': '/a.jpg' };
    expect(urlIllustration('qarzim', fichiers)).toBe('/q.png');
    expect(urlIllustration('absente', fichiers)).toBeNull();
    expect(ecranDuChapitre(c, 2, fichiers)!.urls).toEqual(['/q.png']);
    // chapitre 4 : seulement les images qui existent
    expect(ecranDuChapitre(c, 4, fichiers)!.urls).toEqual(['/a.jpg']);
    expect(ecranDuChapitre(c, 3, fichiers)).toBeNull();
    expect(ecranDuChapitre(c, 9, fichiers)).toBeNull();
  });

  it('la mémoire « déjà vu » est propre à la partie et au chapitre', () => {
    expect(cleChapitreVu('p1', 1)).not.toBe(cleChapitreVu('p2', 1));
    expect(cleChapitreVu('p1', 1)).not.toBe(cleChapitreVu('p1', 2));
  });
});
