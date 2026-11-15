import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { zPortraits } from '../src/contenu/schemas';
import type { Heros } from '../src/moteur/personnage';
import { delaiApresLettre, portraitAnimeHeros, portraitAnimePersonnage } from '../src/ui/portraits';

const c = contenuDisque();

describe('Portraits animés de dialogue (essai)', () => {
  it('Aveline a un portrait animé pour ses 6 expressions, avec lueur dorée et lucioles', () => {
    for (const e of ['neutre', 'joie', 'colere', 'tristesse', 'gene', 'surprise']) {
      const p = portraitAnimePersonnage(c, 'aveline', e);
      expect(p, e).not.toBeNull();
      expect(p!.cle).toBe(`personnages/compagnes/aveline/${e}`);
      expect(p!.calques.base).toContain(`portrait-${e}`);
      expect(p!.calques.yeux).toContain(`anim/${e}/yeux`);
      expect(p!.calques.carte).toContain(`anim/${e}/carte`);
      expect(p!.reglages.bouche).toHaveLength(2);
    }
    expect(portraitAnimePersonnage(c, 'aveline')!.effets).toEqual({ lueur: '#f3c45a', particules: 'lucioles' });
  });

  it("une expression qui n'existe pas prend « neutre »", () => {
    expect(portraitAnimePersonnage(c, 'aveline', 'boudeuse')!.cle).toBe('personnages/compagnes/aveline/neutre');
  });

  it('sans vrais portraits ni anim.json : pas de portrait animé (image fixe comme avant)', () => {
    expect(portraitAnimePersonnage(c, 'kaya', 'joie')).toBeNull();
    expect(portraitAnimePersonnage(c, 'aureliath')).toBeNull();
    expect(portraitAnimePersonnage(c, 'narrateur')).toBeNull();
    // portrait présent mais pas de réglages d'animation : image fixe
    expect(portraitAnimePersonnage(c, 'aveline', 'neutre', {})).toBeNull();
  });

  it("héros : portrait de race animé seulement s'il est livré avec ses calques", () => {
    const h = { race: 'elfe', sexe: 'f', classe: 'guerrier' } as unknown as Heros;
    expect(portraitAnimeHeros(c, h)).toBeNull();
    // réglages d'animation sans le portrait de race (pas encore livré) : toujours l'image fixe
    const reglages = { bouche: [0.5, 0.42] as [number, number], largeur: 0.06, ouverte: false, cou: [0.5, 0.5] as [number, number] };
    const anims = { '/assets/personnages/races/elfe/anim/anim.json': { expressions: { defaut: reglages, 'defaut-f': reglages } } };
    expect(portraitAnimeHeros(c, h, anims)).toBeNull();
    // portrait importé par le joueur : jamais animé
    expect(portraitAnimeHeros(c, { ...h, portrait: 'data:image/png;base64,' } as Heros, anims)).toBeNull();
  });

  it('rythme de la parole : 42 ms par lettre, 380 ms après . ! ? …, 180 ms après , ; :', () => {
    expect(delaiApresLettre('a')).toBe(42);
    for (const l of ['.', '!', '?', '…']) expect(delaiApresLettre(l)).toBe(380);
    for (const l of [',', ';', ':']) expect(delaiApresLettre(l)).toBe(180);
  });

  it('portraits.yaml : particules et couleurs vérifiées', () => {
    expect(c.portraits.defaut).toEqual({ lueur: null, particules: null });
    expect(zPortraits.safeParse({ personnages: { x: { particules: 'paillettes' } } }).success).toBe(false);
    expect(zPortraits.safeParse({ personnages: { x: { lueur: 'doré' } } }).success).toBe(false);
    expect(zPortraits.safeParse({ personnages: { x: { lueur: '#9fd8ff', particules: 'neige' } } }).success).toBe(true);
  });
});
