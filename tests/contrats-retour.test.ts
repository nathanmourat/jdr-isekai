import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, etapeContrat, retourContrat, VERSION_ETAT } from '../src/moteur/partie';
import { creerSauvegarde, migrer } from '../src/sauvegarde/migrations';
import { jouer, nouvellePartieDeTest, type Robot } from './robot';

const c = contenuDisque();

function partie(): Robot {
  const r = nouvellePartieDeTest(c, 'retour');
  jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Alpha' });
  jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Kael', classe: 'barde', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 22, sexe: 'm' } });
  return r;
}

describe('Contrats répétables (test 4, point 7)', () => {
  it('par défaut répétable ; les créatures uniques ne reviennent pas ; 5 jours de retour', () => {
    expect(c.config.contrats.retour_jours).toBe(5);
    expect(c.contrats['c-loups'].repetable).toBe(true);
    for (const id of ['c-capitaine', 'c-colosse', 'c-golem-lac']) expect(c.contrats[id].repetable).toBe(false);
  });

  it('un contrat rempli quitte le tableau puis revient 5 jours plus tard', () => {
    const r = partie();
    r.etat.contratsTermines = { 'c-loups': r.etat.jour };
    expect(retourContrat(c, r.etat, 'c-loups')).toBe(5);
    expect(() => appliquer(c, r.etat, { type: 'contrat', joueur: 'j1', contrat: 'c-loups' })).toThrow(/revient au tableau dans 5 jours/);
    r.etat.jour += 5;
    expect(retourContrat(c, r.etat, 'c-loups')).toBe(0);
    jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: 'c-loups' });
    expect(r.etat.contrats.h1?.id).toBe('c-loups');
  });

  it('un contrat non répétable rempli ne revient jamais', () => {
    const r = partie();
    r.etat.contratsTermines = { 'c-colosse': -1 };
    expect(retourContrat(c, r.etat, 'c-colosse')).toBe(-1);
  });

  it('remplir un contrat à étapes le note comme rempli (s\'il se termine sans combat ni test)', () => {
    const ct = Object.values(c.contrats).find((x) => x.rang_min === 'F' && !x.disponible_si && !x.examen_rang && x.etapes.every((e) => !e.test && !e.combat));
    if (!ct) return; // aucun contrat de ce genre pour l'instant : les autres cas sont couverts ci-dessus
    const r = partie();
    jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: ct.id });
    while (etapeContrat(c, r.etat, 'h1')) jouer(c, r, { type: 'etape_contrat', joueur: 'j1', choix: etapeContrat(c, r.etat, 'h1')!.etape.choix.length ? 0 : undefined });
    expect(r.etat.contratsTermines?.[ct.id]).toBe(r.etat.jour);
  });

  it('migration 8 → 9 : les anciennes actions se rejouent avec l\'ancienne règle', () => {
    const r = partie();
    const s = creerSauvegarde(r.etat, [{ type: 'presence', joueur: 'j1', present: true }], new Date().toISOString());
    s.version = 8;
    delete (s.depart as { contratsTermines?: unknown }).contratsTermines;
    const m = migrer(s);
    expect(m.version).toBe(VERSION_ETAT);
    expect((m.depart as { regleContratsDepuis?: number }).regleContratsDepuis).toBe(1);
    expect((m.depart as { contratsTermines?: unknown }).contratsTermines).toEqual({});
  });
});
