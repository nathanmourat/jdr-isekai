import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { cleCinematiqueVue, urlCinematique } from '../src/ui/cinematiques';

const c = contenuDisque();

describe('Cinématiques (web)', () => {
  it("trouve la vidéo d'une cinématique (mp4, sinon webm), et rien si le fichier manque", () => {
    const fichiers = { '/assets/cinematiques/appel.mp4': '/a.mp4', '/assets/cinematiques/lanternes.webm': '/l.webm' };
    expect(urlCinematique('appel', fichiers)).toBe('/a.mp4');
    expect(urlCinematique('lanternes', fichiers)).toBe('/l.webm');
    expect(urlCinematique('absente', fichiers)).toBeNull();
  });

  it("« L'Appel » et « La Nuit des Lanternes » annoncent leur cinématique", () => {
    expect(c.scenes['ch1-appel'].cinematique).toBe('appel');
    expect(c.scenes['ch1-lanternes'].cinematique).toBe('lanternes');
  });

  it('la mémoire « déjà vue » est propre à la partie', () => {
    expect(cleCinematiqueVue('p1', 'appel')).not.toBe(cleCinematiqueVue('p2', 'appel'));
  });
});

describe('Cinématiques livrées (23/11)', () => {
  it('chaque scène avec une cinématique a sa vidéo dans assets/cinematiques/', async () => {
    const { existsSync } = await import('node:fs');
    for (const s of Object.values(c.scenes)) if (s.cinematique) {
      const ok = ['mp4', 'webm'].some((e) => existsSync(`assets/cinematiques/${s.cinematique}.${e}`));
      expect(ok, `${s.id} › cinematique: ${s.cinematique}`).toBe(true);
    }
  });
});
