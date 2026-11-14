/**
 * La saison 1 jouée de bout en bout par le robot : chaque chapitre s'enchaîne (dates, auberge, régions),
 * les quêtes principales se terminent, et l'état reste reproductible.
 */
import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { affinite, conditionScene, listeHeros, rangHeros, sceneEstDisponible, type EtatPartie } from '../src/moteur/partie';
import { dormirHistoire, finirTempsLibre, groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe, type Robot } from './robot';

const c = contenuDisque();

/** Scènes de groupe jouées par le robot, chapitre par chapitre (principale + quelques secondaires). */
export const SCENES_SAISON: Record<number, string[]> = {
  1: ['ch1-appel', 'ch1-examen', 'sq-tournoi', 'sq-loups', 'ch1-crypte', 'sq-tanneurs', 'ch1-lanternes', 'ch1-serment'],
  2: ['ch2-depart', 'ch2-caravane', 'sq-pillards-retour', 'ch2-palais', 'sq-matriarche-fin', 'ch2-complot', 'ch2-bazar', 'sq-puits-retour', 'ch2-tempete', 'ch2-revolte'],
  3: ['ch3-domaines', 'ch3-lisiere', 'sq-follets-retour', 'ch3-reine', 'sq-domaine-milice', 'ch3-bibliotheque', 'ch3-nuitlongue', 'ch3-verdict'],
  4: ['ch4-depart', 'ch4-karak', 'sq-forge-retour', 'ch4-marches', 'ch4-port', 'sq-phare-retour', 'ch4-nid', 'ch4-deserteur', 'ch4-conseil'],
  5: ['ch5-depart', 'ch5-fort', 'sq-convoi-retour', 'ch5-chute', 'sq-espion-retour', 'ch5-rang-s', 'ch5-aldric', 'sq-chiens-plaine', 'ch5-contre-offensive'],
  6: ['ch6-depart', 'ch6-cendrebourg', 'sq-enfants-retour', 'ch6-souvenirs', 'sq-pretres-retour', 'ch6-citadelle', 'ch6-orvan'],
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
  if (n < 6) dormirHistoire(c, r);
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

  it('chapitres 3 à 5 : Sylvenoire, Grisfer et l\'Archipel, puis la guerre au Mur d\'Aube', () => {
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
    // chapitre 5 : la Guerre des Cendres
    jouerChapitre(r, 5);
    expect(r.etat.quetes['q-ch5-guerre'].terminee).toBe(true);
    expect(r.etat.flags['mur-tombe'] && r.etat.flags['rang-s-obtenu'] && r.etat.flags['terres-cendrees-ouvertes']).toBe(true);
    // l'épreuve de l'Arène donne le rang S (examen de type « scène »)
    for (const h of listeHeros(r.etat)) expect(rangHeros(r.etat, h.id)).toBe('S');
    // l'aiguillage a décidé du sort de la Maréchale et de Vaelor selon la réputation
    expect(r.etat.flags['mort:marechale']).toBe((r.etat.reputation.troupes ?? 0) < 40 ? true : undefined);
    expect(r.etat.flags['aldric-vivant'] || r.etat.flags['aldric-mort'] || r.etat.flags['aldric-enfui']).toBe(true);
    expect(r.etat.chapitre).toBe(6);
    // chapitre 6 : le Souverain des Cendres, le combat final et une des 4 fins
    jouerChapitre(r, 6);
    expect(r.etat.quetes['q-ch6-souverain'].terminee).toBe(true);
    expect(r.etat.flags['orvan-vaincu'] && r.etat.flags['saison-1-finie']).toBe(true);
    const fins = ['fin-sceau', 'fin-pacte', 'fin-couronne', 'fin-retour'].filter((f) => r.etat.flags[f]);
    expect(fins).toHaveLength(1);
    // le robot a révélé le secret de l'Ordre au chapitre 4 : la fin « Le Sceau » lui est proposée en premier si Ilyssë ou Elianne sont alliées
    expect(r.etat.flags['secret-revele']).toBe(true);
    // épilogue personnel de chaque héros
    for (const h of listeHeros(r.etat)) expect(sceneEstDisponible(c, r.etat, c.scenes['ep-heros'], h.id)).toBe(true);
  });

  it('fins de saison : chaque fin n\'est proposée que si ses conditions sont remplies', () => {
    const choix = c.scenes['ch6-orvan'].noeuds['choix-fin'].choix;
    const condition = (aller: string) => choix.find((x) => x.aller === aller)!.si;
    const r = groupeDeDeux(c, 'fins');
    const h = listeHeros(r.etat).map((x) => x.id);
    const proposees = (e: EtatPartie) => choix.filter((x) => conditionScene(c, e, x.si, h)).map((x) => x.aller);
    const e = r.etat;
    // rien de spécial : seule « La Couronne » (fin par défaut) est proposée
    expect(proposees(e)).toEqual(['fin-couronne']);
    // A. Le Sceau : secret révélé + Ilyssë ou Elianne alliée
    e.flags['secret-revele'] = true;
    affinite(e, h[0], 'elianne').points = 25;
    expect(proposees(e)).toContain('fin-sceau');
    // B. Le Pacte : Orvan épargné, Morra amoureuse, peuples amis, démons épargnés
    e.flags['orvan-epargne'] = true;
    affinite(e, h[1], 'morra').points = 75;
    expect(proposees(e)).not.toContain('fin-pacte');
    e.reputation.elfes = 30; e.reputation.nains = 30; e.reputation.dragons = 30;
    expect(proposees(e)).toContain('fin-pacte');
    e.flags['demons-extermines'] = true;
    expect(proposees(e)).not.toContain('fin-pacte');
    // D. Le Retour : le Voile compris, Ilyssë « Proche »
    e.flags['voile-compris'] = true;
    affinite(e, h[0], 'ilysse').points = 50;
    expect(proposees(e)).toContain('fin-retour');
    expect(condition('fin-couronne')).toBeUndefined();
  });
});
