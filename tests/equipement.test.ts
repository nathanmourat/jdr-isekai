import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { aPouvoir, combattantHeros, coutMana, demarrerCombat, jouerAction } from '../src/moteur/combat';
import { aptitudeEquipement, avertissementEquipement, bonusEquipement, exemplaires, messageEquipement, problemeEquipement, texteEffets } from '../src/moteur/equipement';
import { appliquer } from '../src/moteur/partie';
import { creerHeros, type Heros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';
import { groupeDeDeux, jouer } from './robot';

const c = contenuDisque();
const heros = (classe = 'lame-runique', niveau = 1): Heros => {
  const h = creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Test', classe, race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 20, anneeCampagne: 1012 });
  h.niveau = niveau;
  return h;
};

describe('Équipement : catalogue', () => {
  it('le catalogue du groupe est chargé (364 objets, 6 mythiques uniques)', () => {
    const equip = Object.values(c.objets).filter((o) => o.type === 'equipement');
    expect(equip.length).toBe(364);
    expect(equip.filter((o) => o.unique_par_partie).length).toBe(6);
    expect(equip.every((o) => o.rarete !== undefined && o.niveau !== undefined)).toBe(true);
  });

  it('les effets sont décrits en français', () => {
    const t = texteEffets(c.objets.velgraive);
    expect(t).toContain('+6 % critique');
    expect(t.some((x) => x.startsWith('touche de arcane'))).toBe(true);
  });
});

describe('Équipement : règles', () => {
  it('refuse un objet de niveau trop élevé, ou un légendaire réservé à une autre classe', () => {
    expect(problemeEquipement(c, heros('lame-runique', 1), c.objets.velgraive)).toMatch(/Niveau 28/);
    expect(problemeEquipement(c, heros('lame-runique', 30), c.objets.velgraive)).toBeUndefined();
    expect(problemeEquipement(c, heros('lame-runique', 30), c.objets.kestrevane)).toMatch(/Réservé/);
    expect(problemeEquipement(c, heros('lame-runique', 1), c.objets['epee-courte'])).toBeUndefined();
  });

  it('l\'action « équiper » applique ces règles', () => {
    const r = groupeDeDeux(c);
    r.etat.heros.h1.inventaire.velgraive = 1;
    r.etat.heros.h1.inventaire['arc-court'] = 1;
    expect(() => appliquer(c, r.etat, { type: 'equiper', joueur: 'j1', objet: 'velgraive' })).toThrow(/Niveau 28/);
    // un arc n'est pas maîtrisé par la Lame runique : il s'équipe quand même (avec un malus)
    const avecArc = appliquer(c, r.etat, { type: 'equiper', joueur: 'j1', objet: 'arc-court' });
    expect(avecArc.heros.h1.equipement.arme).toBe('arc-court');
    r.etat.heros.h1.niveau = 28;
    jouer(c, r, { type: 'equiper', joueur: 'j1', objet: 'velgraive' });
    expect(r.etat.heros.h1.equipement.arme).toBe('velgraive');
  });

  it('une arme mythique n\'existe qu\'en un exemplaire par partie', () => {
    const r = groupeDeDeux(c);
    r.etat.heros.h1.equipement.arme = 'aube-premiere';
    expect(exemplaires(Object.values(r.etat.heros), 'aube-premiere')).toBe(1);
    // une boutique qui la vendrait refuse quand même la vente
    const lieu = c.regions[Object.keys(c.regions)[0]].lieux.find((l) => l.boutique.length > 0)!;
    lieu.boutique.push('aube-premiere');
    try {
      r.etat.heros.h2.or = 99999;
      expect(() => appliquer(c, r.etat, { type: 'acheter', joueur: 'j2', lieu: lieu.id, objet: 'aube-premiere', quantite: 1 })).toThrow(/unique/);
      r.etat.heros.h1.equipement.arme = null;
      expect(() => appliquer(c, r.etat, { type: 'acheter', joueur: 'j2', lieu: lieu.id, objet: 'aube-premiere', quantite: 2 })).toThrow(/unique/);
    } finally {
      lieu.boutique.pop();
    }
  });
});

describe('Équipement : maîtrises de classe', () => {
  it('chaque classe maîtrise au moins une famille d\'armes et une famille d\'armures du catalogue', () => {
    for (const cl of Object.values(c.classes)) {
      expect(cl.maitrises.armes.length, cl.id).toBeGreaterThan(0);
      expect(cl.maitrises.armures.length, cl.id).toBeGreaterThan(0);
    }
    // les objets que le catalogue destine à une classe sont maîtrisés par elle (armes et armures)
    for (const o of Object.values(c.objets)) {
      if (o.type !== 'equipement' || o.emplacement === 'accessoire') continue;
      for (const cl of o.classes ?? []) expect(aptitudeEquipement(c, cl, o), `${o.id} / ${cl}`).toBe('maitrise');
    }
  });

  it('maîtrisé, non maîtrisé, interdit, réservé', () => {
    expect(aptitudeEquipement(c, 'ombre', c.objets.dague)).toBe('maitrise');
    expect(aptitudeEquipement(c, 'ombre', c.objets['epee-courte'])).toBe('non-maitrise');
    expect(aptitudeEquipement(c, 'arcaniste', c.objets['lourde-i'])).toBe('interdit');
    expect(aptitudeEquipement(c, 'ombre', c.objets['lourde-i'])).toBe('non-maitrise');
    expect(aptitudeEquipement(c, 'lame-runique', c.objets.kestrevane)).toBe('reserve');
    expect(avertissementEquipement(c, heros('ombre'), c.objets['epee-courte'])).toBe('Non maîtrisé par Ombre : −30 % de dégâts, −15 points de chance de toucher');
    expect(avertissementEquipement(c, heros('ombre'), c.objets.dague)).toBeUndefined();
    expect(problemeEquipement(c, heros('arcaniste'), c.objets['lourde-i'])).toMatch(/^Interdit : Arcaniste élémentaire ne peut pas porter les armures lourdes/);
    expect(messageEquipement(c, heros('ombre'), c.objets['epee-courte'])).toMatch(/^Non maîtrisé/);
  });

  it('une arme non maîtrisée frappe moins fort et touche moins souvent', () => {
    const maitre = heros('ombre');
    maitre.equipement.arme = 'dague';
    const maladroit = heros('ombre');
    maladroit.equipement.arme = 'epee-courte';
    const a = combattantHeros(c, maitre, true);
    const b = combattantHeros(c, maladroit, true);
    const brute = c.classes.ombre.attaque.puissance + (c.objets['epee-courte'].bonus?.puissance ?? 0);
    expect(b.attaque.puissance).toBe(Math.max(1, Math.round(brute * 0.7)));
    expect(b.attaque.puissance).toBeLessThan(a.attaque.puissance);
    expect((b.objets?.precision ?? 0) - (a.objets?.precision ?? 0)).toBeCloseTo(-0.15);
  });

  it('une armure non maîtrisée protège moitié moins et gêne l\'Agilité', () => {
    const h = heros('ombre');
    const sans = combattantHeros(c, h, true);
    h.equipement.armure = 'lourde-i';
    const avec = combattantHeros(c, h, true);
    const bonus = c.objets['lourde-i'].bonus?.armure ?? 0;
    expect(avec.armure - sans.armure).toBe(Math.floor(bonus * 0.5));
    expect(avec.caracs.AGI).toBe(sans.caracs.AGI + (c.objets['lourde-i'].bonus?.caracs.AGI ?? 0) - 2);
    expect(() => appliquer(c, (() => { const r = groupeDeDeux(c); r.etat.heros.h2.inventaire['lourde-i'] = 1; return r.etat; })(), { type: 'equiper', joueur: 'j2', objet: 'lourde-i' })).toThrow(/Interdit/);
  });
});

describe('Équipement : effets en combat', () => {
  it('additionne les effets des objets portés', () => {
    const h = heros('lame-runique', 30);
    h.equipement.arme = 'velgraive';
    const b = bonusEquipement(c, h);
    expect(b.critique).toBeCloseTo(0.06);
    expect(b.touches).toEqual([{ element: 'arcane', puissance: 6 }]);
    expect(b.pouvoirs).toEqual(['velgraive']);
  });

  it('Velgraive : une charge de rune au début du combat (Lame runique)', () => {
    const h = heros('lame-runique', 30);
    h.equipement.arme = 'velgraive';
    expect(combattantHeros(c, h, true).compteurs.runes).toBe(1);
    expect(combattantHeros(c, heros('lame-runique', 30), true).compteurs.runes ?? 0).toBe(0);
  });

  it('vigueur et mana : PV max et mana max augmentent', () => {
    const vig = Object.values(c.objets).find((o) => (o.effets_equipement ?? []).some((e) => e.effet === 'vigueur') && o.emplacement === 'armure' && !(o.classes ?? []).length)
      ?? Object.values(c.objets).find((o) => (o.effets_equipement ?? []).some((e) => e.effet === 'vigueur'))!;
    const h = heros((vig.classes ?? [])[0] ?? 'lame-runique', 40);
    const sans = combattantHeros(c, h, true);
    h.equipement[vig.emplacement!] = vig.id;
    const avec = combattantHeros(c, h, true);
    expect(avec.pvMax).toBeGreaterThan(sans.pvMax);
  });

  it('Ylvarae : les compétences coûtent 20 % de mana en moins', () => {
    const h = heros('arcaniste', 40);
    h.equipement.arme = 'ylvarae';
    const x = combattantHeros(c, h, true);
    expect(aPouvoir(x, 'ylvarae')).toBe(true);
    const comp = x.competences.map((k) => c.competences[k.id]).find((k) => k !== undefined && k.cout >= 5)!;
    expect(coutMana(x, comp)).toBe(Math.round(comp.cout * 0.8));
  });

  it('Murmure : la première attaque du combat est un coup critique', () => {
    const h = heros('ombre', 30);
    h.equipement.arme = 'murmure';
    for (const graine of ['m1', 'm2', 'm3']) {
      const rng = creerRng(graine);
      const cb = demarrerCombat(c, 'ref-brute', [combattantHeros(c, h, true)], rng);
      const cible = cb.combattants.find((x) => x.camp !== 'heros')!;
      if (cb.enAttente !== 'h:a') continue;
      jouerAction(c, cb, rng, { type: 'attaque', acteur: 'h:a', cible: cible.id });
      const coups = cb.evenements.filter((e) => e.type === 'degats' && e.source === 'h:a');
      if (coups.length === 0) continue; // esquivé
      expect(coups[0].critique).toBe(true);
      return;
    }
    throw new Error('aucune attaque n\'a porté : test à revoir');
  });

  it('Kestrevane : l\'attaque touche toujours', () => {
    const h = heros('archer', 30);
    h.equipement.arme = 'kestrevane';
    let manques = 0;
    for (let i = 0; i < 20; i++) {
      const rng = creerRng(`k${i}`);
      const cb = demarrerCombat(c, 'ref-brute', [combattantHeros(c, h, true)], rng);
      if (cb.enAttente !== 'h:a') continue;
      const cible = cb.combattants.find((x) => x.camp !== 'heros')!;
      cible.caracs.AGI = 30;
      jouerAction(c, cb, rng, { type: 'attaque', acteur: 'h:a', cible: cible.id });
      if (!cb.evenements.some((e) => e.type === 'degats' && e.source === 'h:a')) manques++;
    }
    expect(manques).toBe(0);
  });

  it('Aube-Première : relève une fois par combat un allié K.O. à 30 % de ses PV', () => {
    const porteur = heros('lame-runique', 40);
    porteur.equipement.arme = 'aube-premiere';
    const autre = { ...heros('guerisseur', 1), id: 'b', joueurId: 'k' };
    const rng = creerRng('aube');
    const cb = demarrerCombat(c, 'ref-chef', [combattantHeros(c, porteur, true), combattantHeros(c, autre, true)], rng);
    const b = cb.combattants.find((x) => x.id === 'h:b')!;
    b.pv = 1;
    b.caracs.VIT = 0;
    for (let i = 0; i < 80 && !cb.resultat && !cb.evenements.some((e) => e.texte.includes('Aube-Première')); i++) {
      if (cb.enAttente) jouerAction(c, cb, rng, { type: 'defendre', acteur: cb.enAttente });
    }
    const releve = cb.evenements.find((e) => e.texte.includes('Aube-Première'));
    expect(releve).toBeDefined();
    expect(b.ko).toBe(false);
    expect(b.pv).toBe(Math.max(1, Math.round(b.pvMax * 0.3)));
    expect(cb.combattants.find((x) => x.id === 'h:a')!.compteurs.aubePrete).toBe(0);
  });
});
