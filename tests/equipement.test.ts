import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { RARETES } from '../src/contenu/schemas';
import { aPouvoir, combattantHeros, coutMana, demarrerCombat, jouerAction } from '../src/moteur/combat';
import { bonusEquipement, creerHeros, manaMaxHeros, pvMaxHeros, refusEquipement, type Heros } from '../src/moteur/personnage';
import { appliquer, donnerObjet, objetDejaPossede } from '../src/moteur/partie';
import { creerRng } from '../src/moteur/rng';
import { groupeDeDeux, jouer } from './robot';

const c = contenuDisque();
const heros = (classe = 'lame-runique', niveau = 1): Heros => {
  const h = creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Test', classe, race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 20, anneeCampagne: 1012 });
  h.niveau = niveau;
  return h;
};
const equipements = Object.values(c.objets).filter((o) => o.type === 'equipement');
const MAX: Record<string, string> = { I: 'peu-commun', II: 'rare', III: 'epique', IV: 'epique', V: 'legendaire', VI: 'legendaire', X: 'mythique' };

describe('Catalogue d\'équipements', () => {
  it('contient les 364 objets, dont 10 légendaires et 6 mythiques uniques', () => {
    expect(equipements.length).toBe(364);
    expect(equipements.filter((o) => o.rarete === 'legendaire').length).toBe(10);
    const mythiques = equipements.filter((o) => o.rarete === 'mythique');
    expect(mythiques.length).toBe(6);
    expect(mythiques.every((o) => o.unique_par_partie && o.emplacement === 'arme' && o.niveau === 40)).toBe(true);
  });

  it('respecte la rareté maximum de chaque palier', () => {
    for (const o of equipements) {
      expect(RARETES.indexOf(o.rarete), o.id).toBeLessThanOrEqual(RARETES.indexOf(MAX[o.palier ?? 'I'] as (typeof RARETES)[number]));
    }
  });

  it('garde les 7 objets d\'origine avec le même id (sauvegardes compatibles)', () => {
    for (const id of ['epee-courte', 'dague', 'baton-apprenti', 'arc-court', 'bouclier-bois', 'armure-cuir', 'robe-mage']) {
      expect(c.objets[id]?.type, id).toBe('equipement');
    }
    expect(c.objets['armure-cuir'].bonus?.armure).toBe(4);
  });
});

describe('Équiper', () => {
  it('refuse un objet de niveau trop élevé ou réservé à une autre classe', () => {
    expect(refusEquipement(c, heros('lame-runique', 1), 'epee-ii')).toMatch(/Niveau 8 requis/);
    expect(refusEquipement(c, heros('lame-runique', 8), 'epee-ii')).toBeNull();
    expect(refusEquipement(c, heros('arcaniste', 1), 'epee-courte')).toMatch(/Réservé à/);
    expect(refusEquipement(c, heros('arcaniste', 1), 'anneau-i')).toBeNull(); // les anneaux vont à toutes les classes
  });

  it('l\'action « équiper » applique ces règles', () => {
    const r = groupeDeDeux(c);
    r.etat.heros[r.etat.joueurs.j1.herosId!].inventaire['epee-ii'] = 1;
    expect(() => appliquer(c, r.etat, { type: 'equiper', joueur: 'j1', objet: 'epee-ii' })).toThrow(/Niveau 8 requis/);
    r.etat.heros[r.etat.joueurs.j2.herosId!].inventaire['epee-courte'] = 1;
    expect(() => appliquer(c, r.etat, { type: 'equiper', joueur: 'j2', objet: 'epee-courte' })).toThrow(/Réservé à/);
    jouer(c, r, { type: 'acheter', joueur: 'j1', objet: 'epee-courte', lieu: 'guilde' });
    jouer(c, r, { type: 'equiper', joueur: 'j1', objet: 'epee-courte' });
    expect(r.etat.heros[r.etat.joueurs.j1.herosId!].equipement.arme).toBe('epee-courte');
  });

  it('une arme mythique n\'existe qu\'une fois dans la partie', () => {
    const r = groupeDeDeux(c);
    const [a, b] = Object.values(r.etat.heros);
    expect(donnerObjet(c, r.etat, a, 'aube-premiere')).toBe(true);
    expect(objetDejaPossede(r.etat, 'aube-premiere')).toBe(true);
    expect(donnerObjet(c, r.etat, b, 'aube-premiere')).toBe(false);
    expect(b.inventaire['aube-premiere'] ?? 0).toBe(0);
    // un objet ordinaire peut être donné plusieurs fois
    expect(donnerObjet(c, r.etat, b, 'epee-courte')).toBe(true);
    expect(donnerObjet(c, r.etat, b, 'epee-courte')).toBe(true);
  });
});

describe('Effets de l\'équipement en combat', () => {
  it('additionne critique, PV max, mana et résistances', () => {
    const h = heros('lame-runique', 34);
    h.equipement.arme = 'velgraive'; // palier V : critique +6 %, touche d'arcane
    h.equipement.armure = 'armure-de-cendre-trempee'; // résistance à l'ombre
    const b = bonusEquipement(c, h);
    expect(b.critique).toBeCloseTo(0.06);
    expect(b.resistances.ombre).toBeGreaterThan(0);
    expect(b.touches).toEqual([{ element: 'arcane', puissance: 6 }]);
    const x = combattantHeros(c, h, false);
    expect(x.resistances.ombre).toBeCloseTo(b.resistances.ombre);
    expect(x.compteurs.runes).toBe(1); // pouvoir de Velgraive : 1 charge de rune au départ
  });

  it('la vigueur et le mana de l\'équipement augmentent les maximums', () => {
    const h = heros('guerisseur', 34);
    const pv0 = pvMaxHeros(c, h);
    const mana0 = manaMaxHeros(c, h);
    h.equipement.accessoire = 'coeur-de-l-aube'; // vigueur + mana
    expect(pvMaxHeros(c, h)).toBeGreaterThan(pv0);
    expect(manaMaxHeros(c, h)).toBeGreaterThan(mana0);
    const x = combattantHeros(c, h, false);
    expect(x.pvMax).toBe(pvMaxHeros(c, h));
    expect(x.manaMax).toBe(manaMaxHeros(c, h));
  });

  it('les pouvoirs d\'économie de mana réduisent le coût des compétences', () => {
    const h = heros('arcaniste', 40);
    h.equipement.arme = 'ylvarae'; // −20 % de mana
    const x = combattantHeros(c, h, false);
    expect(aPouvoir(x, 'mana-economique')).toBe(true);
    const comp = { ...c.competences['entaille-runique'], cout: 10 };
    expect(coutMana(x, comp)).toBe(8);
  });

  it('Premier Serment relève un allié tombé, une seule fois', () => {
    const rng = creerRng('serment');
    const porteur = heros('gardien', 40);
    porteur.equipement.arme = 'aube-premiere';
    const allie = creerHeros(c, { id: 'b', joueurId: 'k', nom: 'Allié', classe: 'ombre', race: 'humain', don: 'mimetisme', origine: 'invoque', age: 20, anneeCampagne: 1012 });
    const cb = demarrerCombat(c, 'ref-brute', [combattantHeros(c, porteur, true), combattantHeros(c, allie, true)], rng);
    const victime = cb.combattants.find((x) => x.id === 'h:b')!;
    const avant = cb.evenements.length;
    victime.pv = 1;
    victime.caracs.VIT = 0;
    // on laisse jouer jusqu'à la chute de l'allié
    for (let i = 0; i < 80 && !cb.resultat && !cb.evenements.slice(avant).some((e) => e.texte.includes('tient son serment')); i++) {
      const id = cb.enAttente;
      if (!id) break;
      jouerAction(c, cb, rng, { type: 'defendre', acteur: id });
      if (victime.pv > 1 && !victime.ko) victime.pv = 1;
    }
    expect(cb.evenements.some((e) => e.texte.includes('tient son serment'))).toBe(true);
    const porteurCombat = cb.combattants.find((x) => x.id === 'h:a')!;
    expect(porteurCombat.compteurs.serment).toBe(0);
  });
});
