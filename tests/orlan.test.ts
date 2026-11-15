import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { conditionScene, listeHeros, sceneEstDisponible } from '../src/moteur/partie';
import { finirScene, jouer, jouerSceneGroupe, nouvellePartieDeTest, type Robot } from './robot';

const c = contenuDisque();
const taverne = Object.values(c.regions).flatMap((r) => r.lieux).find((l) => l.id === 'taverne')!;
const defOrlan = taverne.pnj.find((p) => (typeof p === 'string' ? p : p.id) === 'orlan');
const present = (r: Robot) => typeof defOrlan === 'object' && conditionScene(c, r.etat, defOrlan.si, listeHeros(r.etat).map((h) => h.id));
const dispo = (r: Robot, id: string) => sceneEstDisponible(c, r.etat, c.scenes[id], listeHeros(r.etat)[0].id);

function apresExamen(): Robot {
  const r = nouvellePartieDeTest(c, 'orlan');
  jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Alpha' });
  jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Kael', classe: 'barde', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 22, sexe: 'm' } });
  jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
  finirScene(c, r, 'groupe', ['j1']);
  jouerSceneGroupe(c, r, 'ch1-examen');
  if (r.etat.scenes.groupe) jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' });
  return r;
}
function scene(r: Robot, id: string, choix: number, flags: string[] = []) {
  jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: id });
  // on fixe le tirage (relique et authenticité) pour tester chaque suite
  for (const f of ['orlan-relique-phalange', 'orlan-relique-clou', 'orlan-relique-larme', 'orlan-relique-vraie']) delete r.etat.flags[f];
  for (const f of flags) r.etat.flags[f] = true;
  finirScene(c, r, 'groupe', ['j1'], choix);
  if (r.etat.scenes.groupe) jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' });
}

describe('Orlan Cassebrune, colporteur de reliques (test 4, point 6)', () => {
  it('Ferrand reste l\'expert ; Orlan tient la scène des reliques', () => {
    expect(c.scenes['sq-reliques'].pnj).toBe('orlan');
    expect(c.pnj.ferrand.identifie).toBe(10);
    expect(c.pnj.ferrand.titre).not.toMatch(/relique/i);
  });

  it('ignoré : il part 3 jours plus tard, puis revient 60 jours après avec une relique', () => {
    const r = apresExamen();
    expect(present(r)).toBe(true);
    scene(r, 'sq-reliques', 3);   // « L'ignorer »
    expect(present(r)).toBe(true);
    r.etat.jour += 3;
    expect(present(r)).toBe(false);
    expect(dispo(r, 'sq-reliques-retour')).toBe(false);
    r.etat.jour += 60;
    expect(present(r)).toBe(true);
    expect(dispo(r, 'sq-reliques-retour')).toBe(true);
  });

  it('retour, relique authentique achetée : la vraie relique du palier, au prix du chapitre ; il reviendra', () => {
    const r = apresExamen();
    scene(r, 'sq-reliques', 3);
    r.etat.jour += 63;
    const h = listeHeros(r.etat)[0];
    h.or = 500;
    scene(r, 'sq-reliques-retour', 1, ['orlan-relique-phalange', 'orlan-relique-vraie']);   // « L'acheter »
    const apres = listeHeros(r.etat)[0];
    expect(apres.inventaire['relique-phalange-i']).toBe(1);
    expect(apres.or).toBe(500 - 100 * r.etat.chapitre);
    expect(r.etat.flags['orlan-parti']).toBeFalsy();
    r.etat.jour += 63;
    expect(dispo(r, 'sq-reliques-retour')).toBe(true);
  });

  it('retour, fausse relique dénoncée à l\'Ordre : arrêté, il ne revient jamais', () => {
    const r = apresExamen();
    scene(r, 'sq-reliques', 3);
    r.etat.jour += 63;
    listeHeros(r.etat)[0].or = 500;   // assez d'or : le choix « L'acheter » reste dans la liste
    scene(r, 'sq-reliques-retour', 2, ['orlan-relique-clou']);   // « Prévenir l'Ordre »
    expect(r.etat.flags['orlan-parti']).toBe(true);
    r.etat.jour += 400;
    expect(present(r)).toBe(false);
    expect(dispo(r, 'sq-reliques-retour')).toBe(false);
  });

  it('le tirage du retour donne toujours une seule relique', () => {
    const r = apresExamen();
    scene(r, 'sq-reliques', 3);
    r.etat.jour += 63;
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'sq-reliques-retour' });
    const tirees = ['orlan-relique-phalange', 'orlan-relique-clou', 'orlan-relique-larme'].filter((f) => r.etat.flags[f]);
    expect(tirees).toHaveLength(1);
  });

  it('Larme de Sainte Ysolde : hors combat, tous les PV et la blessure', () => {
    const r = apresExamen();
    const h = r.etat.heros.h1;
    h.inventaire['larme-ysolde'] = 1;
    h.pv = 5;
    h.blessure = true;
    jouer(c, r, { type: 'se_soigner', joueur: 'j1', moyen: 'objet', objet: 'larme-ysolde' });
    expect(r.etat.heros.h1.pv).toBeUndefined();
    expect(r.etat.heros.h1.blessure).toBe(false);
    expect(r.etat.heros.h1.inventaire['larme-ysolde']).toBe(0);
  });
});
