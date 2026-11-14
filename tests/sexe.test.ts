import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, nouvellePartie, remplacerVariables, VERSION_ETAT, type Action } from '../src/moteur/partie';
import { creerSauvegarde, migrer } from '../src/sauvegarde/migrations';

// Test 3, point 9 : sexe du héros, accords {{m|f}} et {{groupe:mpl|fpl|mixte}}, format v8.
const c = contenuDisque();
function partie(sexes: ('m' | 'f' | undefined)[]) {
  let e = nouvellePartie(c, 's', 'S', 's');
  sexes.forEach((sexe, i) => {
    e = appliquer(c, e, { type: 'rejoindre', joueur: `j${i}`, pseudo: `P${i}` });
    e = appliquer(c, e, { type: 'creer_heros', joueur: `j${i}`, heros: { nom: `H${i}`, classe: 'ombre', race: 'humain', don: ['oeil-du-seuil', 'second-depart'][i], origine: 'invoque', age: 24, sexe } } as Action);
  });
  return e;
}

describe('sexe du héros', () => {
  it('accord du héros concerné', () => {
    const e = partie(['f']);
    expect(remplacerVariables(c, e, 'Tu es {{accueilli|accueillie}}, {{Messire|Dame}} {heros}.', ['h1'])).toBe('Tu es accueillie, Dame H0.');
    const m = partie(['m']);
    expect(remplacerVariables(c, m, '{{le héros|l\'héroïne}}', ['h1'])).toBe('le héros');
  });
  it('accord du groupe : masculin pluriel, féminin pluriel, mixte', () => {
    const t = 'Vous êtes {{groupe:prêts|prêtes|prêts}}.';
    expect(remplacerVariables(c, partie(['f', 'f']), t, ['h1', 'h2'])).toBe('Vous êtes prêtes.');
    expect(remplacerVariables(c, partie(['m', 'f']), t, ['h1', 'h2'])).toBe('Vous êtes prêts.');
    expect(remplacerVariables(c, partie(['m', 'm']), t, ['h1', 'h2'])).toBe('Vous êtes prêts.');
  });
  it('parole_a : l\'accord suit le héros interrogé', () => {
    const e = partie(['m', 'f']);
    expect(remplacerVariables(c, e, '{pseudo}, {{seul|seule}} ?', ['h1', 'h2'], 'h2')).toBe('P1, seule ?');
  });
  it('ancienne partie : homme par défaut, choix demandé, puis fixé', () => {
    let e = partie([undefined]);
    expect(e.heros.h1.sexe).toBe('m');
    expect(e.heros.h1.sexeChoisi).toBe(false);
    e = appliquer(c, e, { type: 'changer_sexe', joueur: 'j0', sexe: 'f' });
    expect(e.heros.h1.sexe).toBe('f');
    expect(e.heros.h1.sexeChoisi).toBe(true);
  });
  it('le sexe ne change plus après le premier mois', () => {
    const e = partie(['m']);
    e.jour = 40;
    expect(() => appliquer(c, e, { type: 'changer_sexe', joueur: 'j0', sexe: 'f' })).toThrow();
  });
  it('migration 7 → 8', () => {
    const depart = nouvellePartie(c, 'v', 'V', 'v');
    const s = creerSauvegarde(depart, [], '2026-11-15');
    s.version = 7;
    expect(migrer(s).version).toBe(VERSION_ETAT);
    expect(VERSION_ETAT).toBe(8);
  });
});
