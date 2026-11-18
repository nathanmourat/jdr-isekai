import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { evaluer, resume } from './ia/evaluer';

const c = contenuDisque();

describe('IA de combat : banc d\'essai (379 phrases écrites à la main, jamais vues à l\'entraînement)', () => {
  const res = evaluer(c);
  const r = resume(res);
  it('au moins 95 % de réussite', () => {
    expect(r.total.ok / r.total.n).toBeGreaterThanOrEqual(0.95);
  });
  it('aucune erreur grave (attaquer un allié, soigner le mauvais, gaspiller une potion…)', () => {
    expect(r.graves.map((g) => `${g.phrase.texte} : ${g.grave}`)).toEqual([]);
  });
  it('une question de l\'IA ne coûte jamais d\'essai', () => {
    for (const x of res) if (x.obtenu.a === 'question') expect(x.message.length).toBeGreaterThan(0);
  });
});
