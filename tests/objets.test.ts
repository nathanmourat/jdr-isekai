import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { actionsDisponibles, combattantHeros, demarrerCombat, jouerAction } from '../src/moteur/combat';
import { appliquer, goutConnu, lieuHorsVille, nouvellePartie, objetConnu, VERSION_ETAT } from '../src/moteur/partie';
import { creerHeros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';
import { lireSauvegarde } from '../src/sauvegarde/fichier';
import { groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe } from './robot';

const c = contenuDisque();

describe('Objets : chacun a une vraie utilité', () => {
  it('les consommables du sac servent en combat et ne sortent du sac que s\'ils sont utilisés', () => {
    const h = creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Test', classe: 'lame-runique', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 20, anneeCampagne: 1012 });
    h.inventaire['potion-mana'] = 2;
    h.inventaire['bombe-feu'] = 1;
    const rng = creerRng('sac');
    const cb = demarrerCombat(c, 'loups-combe', [combattantHeros(c, h, true, h.grimoire)], rng);
    const moi = cb.combattants.find((x) => x.type === 'heros')!;
    // on joue jusqu'au tour du héros
    for (let k = 0; k < 20 && cb.enAttente !== moi.id && !cb.resultat; k++) jouerAction(c, cb, rng, { type: 'defendre', acteur: cb.enAttente! });
    const sac = actionsDisponibles(c, cb, moi.id).sac;
    expect(sac.map((o) => o.id)).toEqual(['bombe-feu', 'potion-mana']);
    // la ration n'a pas d'effet de combat, la petite potion est comptée à part
    expect(sac.some((o) => o.id === 'ration' || o.id === 'potion-soin-petite')).toBe(false);
    moi.mana = 0;
    jouerAction(c, cb, rng, { type: 'objet', acteur: moi.id, objet: 'potion', item: 'potion-mana' });
    expect(moi.mana).toBeGreaterThanOrEqual(Math.min(20, moi.manaMax));
    expect(moi.compteurs['sac:potion-mana']).toBe(1);
    expect(moi.compteurs['utilise:potion-mana']).toBe(1);
    expect(() => jouerAction(c, cb, rng, { type: 'objet', acteur: cb.enAttente ?? moi.id, objet: 'potion', item: 'antidote' })).toThrow();
  });

  it('chaque consommable et chaque matériau explique à quoi il sert', () => {
    for (const o of Object.values(c.objets)) {
      if (o.type === 'consommable' || o.type === 'materiau') expect(o.utilite, o.id).toBeTruthy();
    }
  });

  it('ration de voyage : une par héros pour un combat hors de la ville, sinon −15 % de PV', () => {
    expect(lieuHorsVille(c, 'combe-taniere')).toBe(true);
    expect(lieuHorsVille(c, 'guilde')).toBe(false);
    const r = groupeDeDeux(c, 'ration');
    jouerPrologues(c, r);
    for (const s of ['ch1-appel', 'ch1-examen']) jouerSceneGroupe(c, r, s);
    if (r.etat.tempsLibre) jouer(c, r, { type: 'valider_temps_libre', joueur: 'j1' });

    expect(r.etat.heros.h1.inventaire.ration).toBe(3); // l'examen se passe en ville : aucune ration mangée
    // contrat des loups : les étapes sans combat ne coûtent rien, le combat du vieux saule coûte une ration
    jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: 'c-loups' });
    for (let k = 0; k < 10 && !r.etat.combats.h1; k++) jouer(c, r, { type: 'etape_contrat', joueur: 'j1', choix: 0 });
    expect(r.etat.combats.h1).toBeTruthy();
    expect(r.etat.heros.h1.inventaire.ration).toBe(2);
    const moi = r.etat.combats.h1.combat.combattants.find((x) => x.type === 'heros')!;
    const pvAvecRation = moi.pv;

    // sans ration : le héros commence fatigué
    const r2 = groupeDeDeux(c, 'ration');
    jouerPrologues(c, r2);
    for (const s of ['ch1-appel', 'ch1-examen']) jouerSceneGroupe(c, r2, s);
    if (r2.etat.tempsLibre) jouer(c, r2, { type: 'valider_temps_libre', joueur: 'j1' });
    r2.etat.heros.h1.inventaire.ration = 0;
    jouer(c, r2, { type: 'contrat', joueur: 'j1', contrat: 'c-loups' });
    for (let k = 0; k < 10 && !r2.etat.combats.h1; k++) jouer(c, r2, { type: 'etape_contrat', joueur: 'j1', choix: 0 });
    const fatigue = r2.etat.combats.h1.combat.combattants.find((x) => x.type === 'heros')!;
    expect(fatigue.pv).toBe(pvAvecRation - Math.round(fatigue.pvMax * 0.15));
  });
});

describe('Objets mystérieux et goûts des compagnes', () => {
  function apresExamen(graine: string) {
    const r = groupeDeDeux(c, graine);
    jouerPrologues(c, r);
    for (const s of ['ch1-appel', 'ch1-examen']) jouerSceneGroupe(c, r, s);
    if (r.etat.tempsLibre) jouer(c, r, { type: 'valider_temps_libre', joueur: 'j1' });
    return r;
  }

  it('un objet mystérieux est inconnu, puis connu de toute la partie après un achat', () => {
    const r = apresExamen('mystere');
    expect(c.objets['livre-ancien'].mystere).toBe(true);
    expect(objetConnu(c, r.etat, 'livre-ancien')).toBe(false);
    expect(objetConnu(c, r.etat, 'ration')).toBe(true);
    r.etat.heros.h1.or = 100;
    jouer(c, r, { type: 'acheter', joueur: 'j1', objet: 'livre-ancien', lieu: 'taverne' });
    expect(objetConnu(c, r.etat, 'livre-ancien')).toBe(true);
    expect(r.etat.objetsConnus).toEqual(['livre-ancien']);
  });

  it('Ferrand identifie un objet contre de l\'or, sans qu\'on l\'achète', () => {
    const r = apresExamen('identifier');
    r.etat.heros.h1.or = 30;
    jouer(c, r, { type: 'identifier', joueur: 'j1', objet: 'livre-ancien', pnj: 'ferrand' });
    expect(r.etat.heros.h1.or).toBe(20);
    expect(objetConnu(c, r.etat, 'livre-ancien')).toBe(true);
    expect(r.etat.heros.h1.inventaire['livre-ancien'] ?? 0).toBe(0);
    expect(() => appliquer(c, r.etat, { type: 'identifier', joueur: 'j1', objet: 'livre-ancien', pnj: 'ferrand' })).toThrow(/déjà/);
    expect(() => appliquer(c, r.etat, { type: 'identifier', joueur: 'j1', objet: 'ration', pnj: 'ferrand' })).toThrow(/mystérieux/);
    expect(() => appliquer(c, r.etat, { type: 'identifier', joueur: 'j1', objet: 'relique-douteuse', pnj: 'bram' })).toThrow(/n'identifie pas/);
    r.etat.heros.h2.or = 3;
    expect(() => appliquer(c, r.etat, { type: 'identifier', joueur: 'j2', objet: 'relique-douteuse', pnj: 'ferrand' })).toThrow(/Pas assez d'or/);
  });

  it('offrir un cadeau fait découvrir le goût de la compagne', () => {
    const r = apresExamen('gout');
    r.etat.compagnonsRencontres.push('aveline');
    r.etat.heros.h1.inventaire['gateau-lysmont'] = 1;
    expect(goutConnu(c, r.etat, 'aveline', 'gateau-lysmont')).toBeNull();
    jouer(c, r, { type: 'cadeau', joueur: 'j1', compagnon: 'aveline', objet: 'gateau-lysmont' });
    expect(goutConnu(c, r.etat, 'aveline', 'gateau-lysmont')).toBe('prefere');
    expect(goutConnu(c, r.etat, 'aveline', 'bijou-dore')).toBeNull();
  });

  it('une sauvegarde au format 5 est migrée au format 6', () => {
    const depart = JSON.parse(JSON.stringify(nouvellePartie(c, 'p1', 'Ancienne partie', 'migration'))) as Record<string, unknown>;
    delete depart.objetsConnus;
    delete depart.goutsConnus;
    depart.version = 5;
    const s = lireSauvegarde(JSON.stringify({ format: 'velmaris-sauvegarde', version: 5, exporteeLe: '', depart, actions: [] }));
    expect(s.version).toBe(VERSION_ETAT);
    expect((s.depart as unknown as { objetsConnus: string[] }).objetsConnus).toEqual([]);
    expect((s.depart as unknown as { goutsConnus: object }).goutsConnus).toEqual({});
  });
});
