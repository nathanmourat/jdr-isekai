import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { combattantHeros, demarrerCombat, jouerAction } from '../src/moteur/combat';
import { creerHeros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';

const c = contenuDisque();

/** Joue la Lame empoisonnée (dégâts + poison) de nombreuses fois et classe chaque coup : touché ou raté. */
function coups(competence: string, rangs: Record<string, number>) {
  const res = { rates: 0, ratesEmpoisonnes: 0, touches: 0, touchesEmpoisonnes: 0 };
  for (let g = 0; g < 300; g++) {
    const h = creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Daleko', classe: 'ombre', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 22, anneeCampagne: 1012 });
    Object.assign(h.rangsCompetences, rangs);
    const rng = creerRng(`impact${g}`);
    const cb = demarrerCombat(c, 'ref-chef', [combattantHeros(c, h, true, h.grimoire)], rng);
    const moi = cb.combattants.find((x) => x.type === 'heros')!;
    moi.pv = moi.pvMax = 5000;
    moi.mana = moi.manaMax = 500;
    const cible = cb.combattants.find((x) => x.camp === 'ennemis')!;
    cible.pv = cible.pvMax = 5000;
    if (cb.enAttente !== moi.id) continue;
    const avant = cb.evenements.length;
    jouerAction(c, cb, rng, { type: 'competence', acteur: moi.id, competence, cible: cible.id });
    const evts = cb.evenements.slice(avant).filter((e) => e.source === moi.id || e.cible === cible.id);
    const rate = evts.some((e) => e.type === 'rate' && e.source === moi.id && e.cible === cible.id);
    const empoisonne = evts.some((e) => e.type === 'etat' && e.etat === 'poison' && e.cible === cible.id && e.source === moi.id);
    if (rate) { res.rates++; if (empoisonne) res.ratesEmpoisonnes++; } else { res.touches++; if (empoisonne) res.touchesEmpoisonnes++; }
  }
  return res;
}

describe('Effets « à l\'impact » (test 4, point 2)', () => {
  it('une Lame empoisonnée ratée n\'empoisonne jamais ; touchée, elle empoisonne', () => {
    const r = coups('lame-empoisonnee', { 'lame-empoisonnee': 1 });
    expect(r.rates).toBeGreaterThan(0);          // il y a bien des coups ratés à vérifier
    expect(r.ratesEmpoisonnes).toBe(0);
    expect(r.touches).toBeGreaterThan(0);
    expect(r.touchesEmpoisonnes).toBeGreaterThan(0);
  });
});
