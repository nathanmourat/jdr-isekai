import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, nouvellePartie } from '../src/moteur/partie';
import { copieProfonde } from '../src/moteur/outils';
import { calculerGains } from '../src/ui/gains';

// Test 3, point 5 : les notifications viennent de ce que le moteur a changé, pas du texte.
const c = contenuDisque();
function partie() {
  let e = nouvellePartie(c, 'g', 'Gains', 'g');
  e = appliquer(c, e, { type: 'rejoindre', joueur: 'j1', pseudo: 'A' });
  e = appliquer(c, e, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Kaya', classe: 'ombre', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24 } });
  return e;
}

describe('notifications de gain', () => {
  it('objet, or, XP et réputation', () => {
    const avant = partie();
    const apres = copieProfonde(avant);
    const h = Object.values(apres.heros)[0];
    h.inventaire['potion-soin'] = (h.inventaire['potion-soin'] ?? 0) + 1;
    h.or += 20; h.xp += 50; apres.reputation.guilde = (apres.reputation.guilde ?? 0) + 1;
    const textes = calculerGains(c, avant, apres).map((g) => g.texte);
    expect(textes).toContain(`+1 ${c.objets['potion-soin'].nom}`);
    expect(textes).toContain('+20 or');
    expect(textes).toContain('+50 XP');
    expect(textes).toContain('Réputation Guilde +1');
  });
  it('payer retire l\'or : « −2 or » en perte', () => {
    const avant = partie();
    const apres = copieProfonde(avant);
    Object.values(apres.heros)[0].or -= 2;
    expect(calculerGains(c, avant, apres)).toEqual([{ heros: 'h1', texte: '−2 or', sorte: 'perte' }]);
  });
  it('un objet mystérieux reste « ??? » tant qu\'il n\'est pas identifié', () => {
    const mystere = Object.values(c.objets).find((o) => o.mystere);
    if (!mystere) return;
    const avant = partie();
    const apres = copieProfonde(avant);
    Object.values(apres.heros)[0].inventaire[mystere.id] = 1;
    expect(calculerGains(c, avant, apres)[0].texte).toBe('+1 ???');
  });
  it('rien ne change : aucune notification', () => {
    const e = partie();
    expect(calculerGains(c, e, copieProfonde(e))).toEqual([]);
  });
});
