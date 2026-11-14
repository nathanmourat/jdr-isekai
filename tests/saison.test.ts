/**
 * La saison 1 jouée de bout en bout par le robot : chaque chapitre s'enchaîne (dates, auberge, régions),
 * les quêtes principales se terminent, et l'état reste reproductible.
 */
import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { listeHeros, sceneEstDisponible } from '../src/moteur/partie';
import { dormirHistoire, finirTempsLibre, groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe, type Robot } from './robot';

const c = contenuDisque();

/** Scènes de groupe jouées par le robot, chapitre par chapitre (principale + quelques secondaires). */
export const SCENES_SAISON: Record<number, string[]> = {
  1: ['ch1-appel', 'ch1-examen', 'sq-tournoi', 'sq-loups', 'ch1-crypte', 'sq-tanneurs', 'ch1-lanternes', 'ch1-serment'],
  2: ['ch2-depart', 'ch2-caravane', 'sq-pillards-retour', 'ch2-palais', 'sq-matriarche-fin', 'ch2-complot', 'ch2-bazar', 'sq-puits-retour', 'ch2-tempete', 'ch2-revolte'],
  3: ['ch3-domaines', 'ch3-lisiere', 'sq-follets-retour', 'ch3-reine', 'sq-domaine-milice', 'ch3-bibliotheque', 'ch3-nuitlongue', 'ch3-verdict'],
  4: ['ch4-depart', 'ch4-karak', 'sq-forge-retour', 'ch4-marches', 'ch4-port', 'sq-phare-retour', 'ch4-nid', 'ch4-deserteur', 'ch4-conseil'],
};

/** Joue un chapitre ; à la fin, passe au chapitre suivant (auberge). */
export function jouerChapitre(r: Robot, n: number) {
  for (const s of SCENES_SAISON[n]) {
    // une quête secondaire se joue depuis sa dernière scène (le robot enchaîne les étapes précédentes)
    const id = s === 'sq-matriarche-fin' ? 'sq-chacals-retour' : s;
    jouerSceneGroupe(c, r, id);
  }
  finirTempsLibre(c, r);
  expect(r.etat.finChapitre).toBe(n);
  jouer(c, r, { type: 'chapitre_suivant', joueur: 'j1' });
  dormirHistoire(c, r);
}

describe('Saison 1 jouée par le robot', () => {
  it('chapitres 1 et 2 : la Marche des Sables s\'ouvre et la quête principale se termine', () => {
    const r = groupeDeDeux(c, 'saison');
    jouerPrologues(c, r);
    jouerChapitre(r, 1);
    expect(r.etat.chapitre).toBe(2);
    expect(sceneEstDisponible(c, r.etat, c.scenes['ch2-depart'], listeHeros(r.etat)[0].id)).toBe(true);
    jouerChapitre(r, 2);
    expect(r.etat.quetes['q-ch2-routes'].terminee).toBe(true);
    expect(r.etat.flags['sables-ouverts']).toBe(true);
    expect(r.etat.compagnonsRencontres).toEqual(expect.arrayContaining(['aveline', 'seraphine', 'kaya', 'nadja']));
    expect(r.etat.quetes['q-matriarche']?.terminee).toBe(true);
    expect(r.etat.chapitre).toBe(3);
    // le robot ne s'équipe pas et perd souvent : il progresse moins vite qu'un vrai groupe
    for (const h of listeHeros(r.etat)) expect(h.niveau).toBeGreaterThanOrEqual(6);
  });

  it('chapitres 3 et 4 : Sylvenoire, puis Grisfer et l\'Archipel', () => {
    const r = groupeDeDeux(c, 'saison3');
    jouerPrologues(c, r);
    for (const n of [1, 2, 3]) jouerChapitre(r, n);
    expect(r.etat.quetes['q-ch3-foret'].terminee).toBe(true);
    expect(r.etat.flags['codex-lu']).toBe(true);
    expect(r.etat.flags['domaine-obtenu']).toBe(true);
    expect(r.etat.compagnonsRencontres).toEqual(expect.arrayContaining(['elianne', 'ilysse']));
    expect(r.etat.flags['morra-vivante'] || r.etat.flags['morra-tuee']).toBe(true);
    expect((r.etat.reputation.troupes ?? 0)).toBeGreaterThan(10);
    expect(r.etat.chapitre).toBe(4);
    // chapitre 4 : Feu et Écailles
    jouerChapitre(r, 4);
    expect(r.etat.quetes['q-ch4-feu'].terminee).toBe(true);
    expect(r.etat.flags['registre-lu']).toBe(true);
    expect(r.etat.flags['nains-allies'] && r.etat.flags['dragons-allies']).toBe(true);
    expect(r.etat.compagnonsRencontres).toContain('ysoria');
    if (r.etat.flags['morra-vivante']) expect(r.etat.compagnonsRencontres).toContain('morra');
    expect(r.etat.flags['secret-revele'] || r.etat.flags['secret-garde']).toBe(true);
    expect(r.etat.quetes['q-forge-froide']?.terminee).toBe(true);
    expect(r.etat.chapitre).toBe(5);
  });
});
