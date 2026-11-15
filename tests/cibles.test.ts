import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { combattantHeros, demarrerCombat, raisonCibleRefusee } from '../src/moteur/combat';
import { creerHeros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';

const c = contenuDisque();

function combat() {
  const h = creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Kael', classe: 'gardien', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 22, anneeCampagne: 1012 });
  const cb = demarrerCombat(c, 'egouts-lysmont', [combattantHeros(c, h, true, h.grimoire)], creerRng('cibles'));
  const moi = cb.combattants.find((x) => x.type === 'heros')!;
  const [e1, e2, e3] = cb.combattants.filter((x) => x.camp === 'ennemis');
  e1.rang = 'avant'; e2.rang = 'arriere'; e3.rang = 'avant';
  return { cb, moi, e1, e2, e3 };
}

describe('Choix de la cible : raison d\'un refus (test 4, point 1)', () => {
  it('cible valide : aucune raison', () => {
    const { cb, moi, e1, e2 } = combat();
    expect(raisonCibleRefusee(cb, moi, e1, 'ennemi', 'melee')).toBeNull();
    expect(raisonCibleRefusee(cb, moi, e2, 'ennemi', 'distance')).toBeNull();
    expect(raisonCibleRefusee(cb, moi, moi, 'allie', 'distance')).toBeNull();
  });
  it('corps à corps : le second rang est hors de portée tant que le premier rang tient', () => {
    const { cb, moi, e2 } = combat();
    expect(raisonCibleRefusee(cb, moi, e2, 'ennemi', 'melee')).toMatch(/Hors de portée/);
  });
  it('K.O., mauvais camp, caché, provoqué', () => {
    const { cb, moi, e1, e2, e3 } = combat();
    e3.ko = true;
    expect(raisonCibleRefusee(cb, moi, e3, 'ennemi', 'distance')).toMatch(/déjà K\.O\./);
    expect(raisonCibleRefusee(cb, moi, e1, 'allie', 'distance')).toMatch(/ne vise que les alliés/);
    expect(raisonCibleRefusee(cb, moi, moi, 'ennemi', 'distance')).toMatch(/ne vise que les ennemis/);
    expect(raisonCibleRefusee(cb, moi, moi, 'allie_ko', 'distance')).toMatch(/n'est pas K\.O\./);
    e2.etats.push({ id: 'furtif', duree: 1, valeur: 0, source: e2.id, cumul: 1 });
    expect(raisonCibleRefusee(cb, moi, e2, 'ennemi', 'distance')).toMatch(/caché/);
    e2.etats = [];
    moi.etats.push({ id: 'provoque', duree: 1, valeur: 0, source: e1.id, cumul: 1 });
    expect(raisonCibleRefusee(cb, moi, e2, 'ennemi', 'distance')).toMatch(/provoqué par/);
  });
});
