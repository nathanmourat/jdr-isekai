import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, etapeContrat, nouvellePartie, pvHorsCombat, pvMaxHorsCombat, type EtatPartie } from '../src/moteur/partie';

// PV gardés d'un combat à l'autre, et récupération (temps, repas, ration, potion, Temple, repos).
const c = contenuDisque();
function partie(): EtatPartie {
  let e = nouvellePartie(c, 'pv', 'PV', 'pv');
  e = appliquer(c, e, { type: 'rejoindre', joueur: 'j1', pseudo: 'A' });
  e = appliquer(c, e, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Lise', classe: 'ombre', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'f' } });
  return e;
}
const auberge = Object.values(c.regions).flatMap((r) => r.lieux).find((l) => l.auberge)!.id;

describe('PV gardés entre les combats', () => {
  it('un combat commence avec les PV actuels du héros', () => {
    let e = partie();
    const max = pvMaxHorsCombat(c, e.heros.h1);
    e.heros.h1.pv = 20;
    e = appliquer(c, e, { type: 'contrat', joueur: 'j1', contrat: 'c-gobelins' });
    for (let k = 0; k < 10 && !e.combats.h1; k++) { const x = etapeContrat(c, e, 'h1')!; e = appliquer(c, e, { type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined }); }
    const x = e.combats.h1.combat.combattants.find((y) => y.herosId === 'h1')!;
    expect(x.pvMax).toBe(max);
    expect(x.pv).toBeLessThanOrEqual(20); // 20, ou moins sans ration
  });
  it('un jour qui passe rend 10 % des PV', () => {
    let e = partie();
    const max = pvMaxHorsCombat(c, e.heros.h1);
    e.heros.h1.pv = 10;
    e = appliquer(c, e, { type: 'jour_passe', joueur: 'j1', jour: e.jour });
    expect(pvHorsCombat(c, e.heros.h1)).toBe(10 + Math.round(max * 0.1));
  });
  it('repas à l\'auberge : 3 or, +30 % ; refusé en pleine forme', () => {
    let e = partie();
    expect(() => appliquer(c, e, { type: 'se_soigner', joueur: 'j1', moyen: 'repas', lieu: auberge })).toThrow(/pleine forme/);
    const max = pvMaxHorsCombat(c, e.heros.h1);
    e.heros.h1.pv = 5;
    const or = e.heros.h1.or;
    e = appliquer(c, e, { type: 'se_soigner', joueur: 'j1', moyen: 'repas', lieu: auberge });
    expect(e.heros.h1.or).toBe(or - 3);
    expect(pvHorsCombat(c, e.heros.h1)).toBe(5 + Math.round(max * 0.3));
    expect(() => appliquer(c, e, { type: 'se_soigner', joueur: 'j1', moyen: 'repas', lieu: 'temple-du-seuil' })).toThrow(/auberge/);
  });
  it('ration et potion hors combat', () => {
    let e = partie();
    e.heros.h1.pv = 5;
    const rations = e.heros.h1.inventaire.ration;
    e = appliquer(c, e, { type: 'se_soigner', joueur: 'j1', moyen: 'ration' });
    expect(e.heros.h1.inventaire.ration).toBe(rations - 1);
    const p = pvHorsCombat(c, e.heros.h1);
    e = appliquer(c, e, { type: 'se_soigner', joueur: 'j1', moyen: 'objet', objet: 'potion-soin-petite' });
    expect(pvHorsCombat(c, e.heros.h1)).toBeGreaterThan(p);
  });
  it('Temple : 15 or, tous les PV et la blessure guérie', () => {
    let e = partie();
    e.heros.h1.pv = 3; e.heros.h1.blessure = true;
    e = appliquer(c, e, { type: 'se_soigner', joueur: 'j1', moyen: 'temple', lieu: 'temple-du-seuil' });
    expect(e.heros.h1.pv).toBeUndefined();
    expect(e.heros.h1.blessure).toBe(false);
  });
});
