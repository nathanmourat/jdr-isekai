import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { examenPret, marqueurPnj } from '../src/moteur/guide';
import { appliquer, candidatsExamen, nouvellePartie, prochainExamen, rangHeros, VERSION_ETAT, type EtatPartie } from '../src/moteur/partie';
import { lireSauvegarde } from '../src/sauvegarde/fichier';
import { finirCombats, groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe, type Robot } from './robot';

const c = contenuDisque();

/** Groupe de deux héros entrés à la Guilde (rang F), temps libre terminé. */
function aLaGuilde(graine: string): Robot {
  const r = groupeDeDeux(c, graine);
  jouerPrologues(c, r);
  for (const s of ['ch1-appel', 'ch1-examen']) jouerSceneGroupe(c, r, s);
  if (r.etat.tempsLibre) jouer(c, r, { type: 'valider_temps_libre', joueur: 'j1' });
  return r;
}
/** Force l'issue du combat de groupe en cours, puis le termine. */
function finir(etat: EtatPartie, resultat: 'victoire' | 'defaite'): EtatPartie {
  const e = JSON.parse(JSON.stringify(etat)) as EtatPartie;
  e.combats.groupe.combat.resultat = resultat;
  e.combats.groupe.contexte.bilan = [];
  return appliquer(c, e, { type: 'fin_combat', joueur: 'j1', cle: 'groupe' });
}

describe('Rangs de Guilde : examens', () => {
  it('les points ne donnent plus le rang : ils débloquent l\'examen, avec un niveau minimum', () => {
    const r = aLaGuilde('examen');
    r.etat.pointsGuilde.h1 = 150;
    expect(rangHeros(r.etat, 'h1')).toBe('F');
    const ex = prochainExamen(c, r.etat, 'h1')!;
    expect(ex.rang).toBe('E');
    expect(ex.pret).toBe(false);
    expect(ex.raison).toMatch(/niveau 3/);
    expect(() => appliquer(c, r.etat, { type: 'examen_rang', joueur: 'j1' })).toThrow(/niveau 3/);
    // un contrat de rang E reste fermé tant que l'examen n'est pas réussi
    expect(() => appliquer(c, r.etat, { type: 'contrat', joueur: 'j1', contrat: 'c-bandits' })).toThrow(/rang E/);
    r.etat.pointsGuilde.h1 = 40;
    expect(prochainExamen(c, r.etat, 'h1')!.raison).toMatch(/100 points/);
  });

  it('Rowena porte un « ! » quand l\'examen est possible', () => {
    const r = aLaGuilde('marqueur');
    expect(examenPret(c, r.etat, 'h1')).toBe(false);
    r.etat.pointsGuilde.h1 = 120;
    r.etat.heros.h1.niveau = 3;
    expect(examenPret(c, r.etat, 'h1')).toBe(true);
    expect(marqueurPnj(c, r.etat, 'guilde', 'rowena', 'h1')).not.toBeNull();
    expect(examenPret(c, r.etat, 'h2')).toBe(false);
  });

  it('examen réussi : nouveau rang et accès aux contrats du rang', () => {
    const r = aLaGuilde('reussi');
    r.etat.pointsGuilde.h1 = 120;
    r.etat.heros.h1.niveau = 3;
    jouer(c, r, { type: 'examen_rang', joueur: 'j1' });
    const combat = r.etat.combats.groupe.combat;
    expect(combat.nom).toBe('Examen du rang E');
    // h2 n'est pas prêt : h1 passe l'examen seul
    expect(combat.combattants.filter((x) => x.type === 'heros').map((x) => x.herosId)).toEqual(['h1']);
    const apres = finir(r.etat, 'victoire');
    expect(rangHeros(apres, 'h1')).toBe('E');
    expect(rangHeros(apres, 'h2')).toBe('F');
    expect(apres.dernieresNouvelles.join(' ')).toMatch(/rang E/);
    expect(prochainExamen(c, apres, 'h1')!.rang).toBe('D');
    const avecContrat = appliquer(c, apres, { type: 'contrat', joueur: 'j1', contrat: 'c-bandits' });
    expect(avecContrat.contrats.h1.id).toBe('c-bandits');
  });

  it('examen raté : ni blessure ni or perdu, et on retente le lendemain', () => {
    const r = aLaGuilde('rate');
    r.etat.pointsGuilde.h1 = 120;
    r.etat.heros.h1.niveau = 3;
    r.etat.heros.h1.or = 80;
    jouer(c, r, { type: 'examen_rang', joueur: 'j1' });
    // le héros n'a plus qu'un PV : le combat est joué pour de vrai jusqu'à la défaite
    for (const x of r.etat.combats.groupe.combat.combattants) { if (x.type === 'heros') { x.pv = 1; x.potions = 0; x.armure = 0; } else { x.pv = 9999; x.pvMax = 9999; } }
    finirCombats(c, r);
    const apres = r.etat;
    expect(apres.combats.groupe).toBeUndefined();
    expect(rangHeros(apres, 'h1')).toBe('F');
    expect(apres.heros.h1.or).toBe(80);
    expect(apres.heros.h1.blessure).toBe(false);
    expect(() => appliquer(c, apres, { type: 'examen_rang', joueur: 'j1' })).toThrow(/revenez demain/);
    const lendemain = JSON.parse(JSON.stringify(apres)) as EtatPartie;
    lendemain.jour += 1;
    expect(prochainExamen(c, lendemain, 'h1')!.pret).toBe(true);
  });

  it('deux héros prêts passent le combat d\'examen ensemble', () => {
    const r = aLaGuilde('ensemble');
    for (const h of ['h1', 'h2']) { r.etat.pointsGuilde[h] = 120; r.etat.heros[h].niveau = 3; }
    expect(candidatsExamen(c, r.etat, 'h1')).toEqual(['h1', 'h2']);
    jouer(c, r, { type: 'examen_rang', joueur: 'j2' });
    expect(r.etat.combats.groupe.combat.combattants.filter((x) => x.type === 'heros')).toHaveLength(2);
    const apres = finir(r.etat, 'victoire');
    expect(rangHeros(apres, 'h1')).toBe('E');
    expect(rangHeros(apres, 'h2')).toBe('E');
  });

  it('rang C : une épreuve en plusieurs étapes, qui ne s\'affiche pas au tableau des contrats', () => {
    const r = aLaGuilde('epreuve');
    r.etat.rangs.h1 = 'D';
    r.etat.pointsGuilde.h1 = 800;
    r.etat.heros.h1.niveau = 10;
    expect(prochainExamen(c, r.etat, 'h1')!.type).toBe('epreuve');
    expect(() => appliquer(c, r.etat, { type: 'contrat', joueur: 'j1', contrat: 'c-examen-c' })).toThrow(/examen de rang/);
    jouer(c, r, { type: 'examen_rang', joueur: 'j1' });
    expect(r.etat.contrats.h1.id).toBe('c-examen-c');
    expect(c.contrats['c-examen-c'].etapes.some((e) => !!e.combat)).toBe(true);
    // rang B : une épreuve aussi (Marche des Sables, puis l'Arène)
    r.etat.rangs.h2 = 'C';
    r.etat.pointsGuilde.h2 = 2000;
    r.etat.heros.h2.niveau = 20;
    expect(prochainExamen(c, r.etat, 'h2')!.type).toBe('epreuve');
  });

  it('rangs A et S : un combat contre Dame Rowena, puis l\'épreuve du chapitre 5 (scène de l\'histoire)', () => {
    const r = aLaGuilde('rangs-hauts');
    r.etat.rangs.h1 = 'B';
    r.etat.pointsGuilde.h1 = 3500;
    r.etat.heros.h1.niveau = 22;
    const a = prochainExamen(c, r.etat, 'h1')!;
    expect(a.rang).toBe('A');
    expect(a.type).toBe('combat');
    expect(a.pret).toBe(true);
    r.etat.rangs.h1 = 'A';
    r.etat.pointsGuilde.h1 = 7000;
    r.etat.heros.h1.niveau = 30;
    const s = prochainExamen(c, r.etat, 'h1')!;
    expect(s.rang).toBe('S');
    expect(s.type).toBe('scene');
    expect(s.pret).toBe(false);
    expect(s.raison).toMatch(/histoire/);
    // la scène donne le rang S à tous les héros présents, même sans avoir passé les examens précédents
    expect(c.scenes['ch5-rang-s'].noeuds['rang'].effets.some((e) => e.rang_guilde === 'S')).toBe(true);
  });

  it('une sauvegarde au format 6 est migrée au format 7', () => {
    const depart = JSON.parse(JSON.stringify(nouvellePartie(c, 'p1', 'Ancienne partie', 'migration'))) as Record<string, unknown>;
    delete depart.rangs;
    delete depart.examensRates;
    depart.version = 6;
    const s = lireSauvegarde(JSON.stringify({ format: 'velmaris-sauvegarde', version: 6, exporteeLe: '', depart, actions: [] }));
    expect(s.version).toBe(VERSION_ETAT);
    expect((s.depart as unknown as { rangs: object }).rangs).toEqual({});
  });
});
