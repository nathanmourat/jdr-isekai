import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, choixVisibles, ErreurAction, listeHeros, nouvellePartie, palierCompagnon, rejouer, type Action } from '../src/moteur/partie';
import { creerSauvegarde, ErreurSauvegarde } from '../src/sauvegarde/migrations';
import { lireSauvegarde } from '../src/sauvegarde/fichier';
import { dormirHistoire, groupeDeDeux, jouer, jouerPrologues, jouerSceneGroupe, finirScene, finirTempsLibre, nouvellePartieDeTest } from './robot';

const c = contenuDisque();

describe('Partie : joueurs et héros', () => {
  it('six joueurs au maximum, pseudos uniques', () => {
    const r = nouvellePartieDeTest(c);
    for (let i = 1; i <= 6; i++) jouer(c, r, { type: 'rejoindre', joueur: `j${i}`, pseudo: `Joueur${i}` });
    expect(() => appliquer(c, r.etat, { type: 'rejoindre', joueur: 'j7', pseudo: 'Septième' })).toThrow(/complète/);
    const r2 = nouvellePartieDeTest(c);
    jouer(c, r2, { type: 'rejoindre', joueur: 'a', pseudo: 'Zed' });
    expect(() => appliquer(c, r2.etat, { type: 'rejoindre', joueur: 'b', pseudo: 'zed' })).toThrow(/déjà pris/);
  });

  it('un don ne peut être pris que par un seul joueur', () => {
    const r = groupeDeDeux(c);
    jouer(c, r, { type: 'rejoindre', joueur: 'j3', pseudo: 'Charlie' });
    expect(() => appliquer(c, r.etat, { type: 'creer_heros', joueur: 'j3', heros: { nom: 'X', classe: 'barde', race: 'vulpin', don: 'oeil-du-seuil', origine: 'invoque', age: 25 } }))
      .toThrow(/déjà pris/);
  });

  it('le premier joueur devient meneur du jour ; il tourne à chaque session', () => {
    const r = groupeDeDeux(c);
    expect(r.etat.meneur).toBe('j1');
    jouer(c, r, { type: 'nouvelle_session', joueur: 'j1' });
    expect(r.etat.meneur).toBe('j2');
  });

  it('un joueur qui arrive en cours de campagne rejoint au niveau moyen du groupe', () => {
    const r = groupeDeDeux(c);
    r.etat.heros.h1.niveau = 6;
    r.etat.heros.h2.niveau = 4;
    r.etat.jour = 400;
    jouer(c, r, { type: 'rejoindre', joueur: 'j3', pseudo: 'Charlie' });
    jouer(c, r, { type: 'creer_heros', joueur: 'j3', heros: { nom: 'Nouveau', classe: 'barde', race: 'vulpin', don: 'mimetisme', origine: 'invoque', age: 25 } });
    expect(r.etat.heros.h3.niveau).toBe(5);
  });
});

describe('Partie : scènes, votes et prologue', () => {
  it('le prologue se joue en 4 scènes pour un réincarné, et pas pour un invoqué', () => {
    const r = groupeDeDeux(c);
    expect(() => appliquer(c, r.etat, { type: 'lancer_scene', joueur: 'j1', scene: 'prologue-6-ans' })).toThrow(/pas disponible/);
    jouerPrologues(c, r);
    expect(r.etat.heros.h2.origineEnfance).not.toBeNull();
    expect(r.etat.heros.h2.atout).not.toBeNull();
    expect(r.etat.heros.h2.contacts.length).toBe(1);
  });

  it('un choix de groupe attend le vote de tous les joueurs présents ; le meneur peut trancher', () => {
    const r = groupeDeDeux(c);
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
    const avant = r.etat.scenes.groupe.noeud;
    jouer(c, r, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 1 });
    expect(r.etat.scenes.groupe.noeud).toBe(avant); // j2 n'a pas voté
    expect(() => appliquer(c, r.etat, { type: 'trancher', joueur: 'j2', cle: 'groupe' })).toThrow(/meneur/);
    jouer(c, r, { type: 'trancher', joueur: 'j1', cle: 'groupe' });
    expect(r.etat.scenes.groupe.noeud).toBe('mefiant');
    expect(r.etat.flags['mefiance-ordre']).toBe(true);
  });

  it('en cas d\'égalité, le vote du meneur l\'emporte ; l\'affinité ne touche que ceux qui ont voté', () => {
    const r = groupeDeDeux(c);
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
    jouer(c, r, { type: 'choisir', joueur: 'j2', cle: 'groupe', index: 0 });
    jouer(c, r, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 1 });
    expect(r.etat.scenes.groupe.noeud).toBe('mefiant');
    expect(r.etat.affinites.h1.aveline.points).toBe(4);
    expect(r.etat.affinites.h2.aveline.points).toBe(5); // inchangé : 5 = bonus de départ de l'Aura de l'Élu
  });

  it('un joueur absent ne bloque pas le vote', () => {
    const r = groupeDeDeux(c);
    jouer(c, r, { type: 'presence', joueur: 'j2', present: false });
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
    jouer(c, r, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 2 });
    expect(r.etat.scenes.groupe.noeud).toBe('humour');
  });

  it('les choix réservés (don, race…) n\'apparaissent que si un héros remplit la condition', () => {
    const r = groupeDeDeux(c);
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
    finirScene(c, r, 'groupe', ['j1', 'j2']);
    jouerSceneGroupe(c, r, 'ch1-examen');
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'sq-loups' });
    const textes = choixVisibles(c, r.etat, 'groupe').map((x) => x.choix.texte);
    expect(textes.some((t) => t.includes('Langue universelle'))).toBe(false);
  });
});

describe('Partie : chapitre 1 complet', () => {
  it('se joue de bout en bout (prologue, 5 scènes principales, donjon, temps libre)', () => {
    const r = groupeDeDeux(c, 'chapitre');
    jouerPrologues(c, r);
    for (const s of ['ch1-appel', 'ch1-examen', 'sq-tournoi', 'sq-loups', 'ch1-crypte', 'sq-tanneurs', 'ch1-lanternes', 'ch1-serment']) jouerSceneGroupe(c, r, s);
    finirTempsLibre(c, r);
    expect(r.etat.quetes['q-ch1-appel'].terminee).toBe(true);
    expect(r.etat.finChapitre).toBe(1);
    // le saut jusqu'au chapitre suivant passe par l'auberge : rien ne bouge tant que le groupe ne dort pas
    expect(r.etat.chapitre).toBe(1);
    expect(r.etat.jour).toBeLessThan(3 * 360);
    jouer(c, r, { type: 'chapitre_suivant', joueur: 'j1' });
    dormirHistoire(c, r);
    expect(r.etat.chapitre).toBe(2);
    expect(r.etat.jour).toBeGreaterThanOrEqual(3 * 360);
    for (const h of listeHeros(r.etat)) expect(h.niveau).toBeGreaterThanOrEqual(4);
    expect(listeHeros(r.etat).some((h) => h.inventaire['sceau-cendre'] > 0)).toBe(true);
    expect(r.etat.journal.length).toBeGreaterThan(10);
    // Aveline est devenue au moins une alliée pour quelqu'un grâce au temps libre et aux scènes
    expect(listeHeros(r.etat).some((h) => palierCompagnon(c, r.etat, h.id, 'aveline').index >= 1)).toBe(true);
  });

  it('rejouer les actions redonne exactement le même état (synchronisation)', () => {
    const r = groupeDeDeux(c, 'determinisme');
    jouerPrologues(c, r);
    for (const s of ['ch1-appel', 'ch1-examen', 'ch1-crypte']) jouerSceneGroupe(c, r, s);
    const depart = nouvellePartie(c, 'p1', 'Partie de test', 'determinisme');
    const { etat, erreurs } = rejouer(c, depart, r.actions);
    expect(erreurs).toEqual([]);
    expect(JSON.stringify(etat)).toBe(JSON.stringify(r.etat));
  });

  it('une action invalide est refusée avec un message en français, sans modifier l\'état', () => {
    const r = groupeDeDeux(c);
    const avant = JSON.stringify(r.etat);
    expect(() => appliquer(c, r.etat, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-serment' })).toThrow(ErreurAction);
    expect(JSON.stringify(r.etat)).toBe(avant);
  });
});

describe('Temps libre, compagnons et objets', () => {
  it('le temps libre attend tous les joueurs, puis fait passer le temps et donne des gains', () => {
    const r = groupeDeDeux(c);
    jouerSceneGroupe(c, r, 'ch1-appel');
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-examen' });
    finirScene(c, r, 'groupe', ['j1', 'j2']);
    // les mois ne passent plus tout seuls : il faut dormir à l'auberge, et que tout le monde soit d'accord
    expect(r.etat.tempsLibre).toBeNull();
    jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' });
    expect(() => appliquer(c, r.etat, { type: 'proposer_repos', joueur: 'j1', mois: 4 })).toThrow(/Durée/);
    jouer(c, r, { type: 'proposer_repos', joueur: 'j1', mois: 3 });
    expect(r.etat.repos).toMatchObject({ par: 'j1', mois: 3, accords: ['j1'] });
    expect(r.etat.tempsLibre).toBeNull();
    jouer(c, r, { type: 'repondre_repos', joueur: 'j2', accepte: false });
    expect(r.etat.repos).toBeNull();
    jouer(c, r, { type: 'proposer_repos', joueur: 'j2', mois: 6 });
    jouer(c, r, { type: 'repondre_repos', joueur: 'j1', accepte: true });
    expect(r.etat.repos).toBeNull();
    expect(r.etat.tempsLibre).not.toBeNull();
    expect(r.etat.tempsLibre!.mois).toBe(6);
    const jourAvant = r.etat.jour;
    jouer(c, r, { type: 'temps_libre', joueur: 'j1', activites: [{ activite: 'commerce' }, { activite: 'relation', compagnon: 'aveline' }] });
    expect(r.etat.jour).toBe(jourAvant);
    const orAvant = r.etat.heros.h1.or;
    jouer(c, r, { type: 'temps_libre', joueur: 'j2', activites: [{ activite: 'entrainement' }, { activite: 'repos' }] });
    expect(r.etat.jour).toBeGreaterThan(jourAvant);
    expect(r.etat.heros.h1.or).toBeGreaterThan(orAvant);
    expect(r.etat.tempsLibre!.resultats!.h1.length).toBe(2);
  });

  it('les jours passent un par un, jamais d\'un mois à l\'autre, et sans doublon', () => {
    const r = groupeDeDeux(c);
    expect(r.etat.jour).toBe(0);
    jouer(c, r, { type: 'jour_passe', joueur: 'j1', jour: 0 });
    expect(r.etat.jour).toBe(1);
    // deux appareils qui envoient le même jour : le second est refusé
    expect(() => appliquer(c, r.etat, { type: 'jour_passe', joueur: 'j2', jour: 0 })).toThrow(/déjà passé/);
    for (let j = 1; j < 29; j++) jouer(c, r, { type: 'jour_passe', joueur: 'j1', jour: j });
    expect(r.etat.jour).toBe(29); // jour 30 du mois : le minuteur s'arrête là
    expect(() => appliquer(c, r.etat, { type: 'jour_passe', joueur: 'j1', jour: 29 })).toThrow(/auberge/);
  });

  it('cadeaux : réaction selon les goûts, un par semaine', () => {
    const r = groupeDeDeux(c);
    jouerSceneGroupe(c, r, 'ch1-appel');
    r.etat.heros.h1.inventaire['gateau-lysmont'] = 2;
    jouer(c, r, { type: 'cadeau', joueur: 'j1', compagnon: 'aveline', objet: 'gateau-lysmont' });
    // L'Appel a été joué avec le premier choix (+2), puis le gâteau préféré (+5)
    expect(r.etat.affinites.h1.aveline.points).toBe(7);
    expect(() => appliquer(c, r.etat, { type: 'cadeau', joueur: 'j1', compagnon: 'aveline', objet: 'gateau-lysmont' })).toThrow(/jours/);
  });

  it('acheter et équiper une arme', () => {
    const r = groupeDeDeux(c);
    jouerSceneGroupe(c, r, 'ch1-appel');
    jouer(c, r, { type: 'acheter', joueur: 'j1', objet: 'epee-courte', lieu: 'guilde' });
    jouer(c, r, { type: 'equiper', joueur: 'j1', objet: 'epee-courte' });
    expect(r.etat.heros.h1.equipement.arme).toBe('epee-courte');
    expect(r.etat.heros.h1.or).toBe(10);
    expect(() => appliquer(c, r.etat, { type: 'acheter', joueur: 'j1', objet: 'epee-courte', lieu: 'guilde' })).toThrow(/or/);
  });

  it('un compagnon n\'accompagne qu\'à partir du palier « Alliée »', () => {
    const r = groupeDeDeux(c);
    jouerSceneGroupe(c, r, 'ch1-appel');
    expect(() => appliquer(c, r.etat, { type: 'equipe', joueur: 'j1', compagnon: 'aveline' })).toThrow(/Alliée/);
    r.etat.affinites.h1.aveline.points = 25;
    jouer(c, r, { type: 'equipe', joueur: 'j1', compagnon: 'aveline' });
    expect(() => appliquer(c, r.etat, { type: 'equipe', joueur: 'j2', compagnon: 'aveline' })).toThrow(/accompagne déjà|Alliée/);
  });

  it('contrat de guilde en solo', () => {
    const r = groupeDeDeux(c);
    jouerSceneGroupe(c, r, 'ch1-appel');
    jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: 'c-herbes' });
    expect(r.etat.dernieresNouvelles[0]).toMatch(/Contrat (réussi|raté)/);
    expect(() => appliquer(c, r.etat, { type: 'contrat', joueur: 'j1', contrat: 'c-bandits' })).toThrow(/rang E/);
  });
});

describe('Sauvegarde', () => {
  it('s\'exporte et se relit à l\'identique', () => {
    const r = groupeDeDeux(c);
    jouerSceneGroupe(c, r, 'ch1-appel');
    const s = creerSauvegarde(nouvellePartie(c, 'p1', 'Partie de test', 'test'), r.actions, '2026-11-13');
    const relue = lireSauvegarde(JSON.stringify(s));
    expect(JSON.stringify(rejouer(c, relue.depart, relue.actions).etat)).toBe(JSON.stringify(r.etat));
  });

  it('refuse un fichier abîmé ou étranger avec un message clair', () => {
    expect(() => lireSauvegarde('pas du json')).toThrow(ErreurSauvegarde);
    expect(() => lireSauvegarde('{"format":"autre"}')).toThrow(/n'est pas une sauvegarde/);
    expect(() => lireSauvegarde('{"format":"velmaris-sauvegarde","version":99,"depart":{},"actions":[]}')).toThrow(/plus récente/);
  });

  it('les actions invalides d\'une sauvegarde sont ignorées et signalées', () => {
    const actions: Action[] = [{ type: 'rejoindre', joueur: 'a', pseudo: 'A' }, { type: 'lancer_scene', joueur: 'a', scene: 'ch1-appel' }];
    const { erreurs } = rejouer(c, nouvellePartie(c, 'x', 'x', 'x'), actions);
    expect(erreurs).toHaveLength(1);
    expect(erreurs[0].message).toMatch(/héros/);
  });
});
