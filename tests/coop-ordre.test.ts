import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, nouvellePartie, rejouer, type Action } from '../src/moteur/partie';
import { synchroniser } from '../src/sync/rejeu';

/**
 * Test 3, point 10 : « j'ai validé mon choix et j'ai pu continuer, alors que mon camarade attendait toujours ».
 * Deux appareils, deux joueurs. Le vote de B part en premier (numéro 1) mais arrive en retard chez A,
 * après le vote de A (numéro 2). Le journal de A devient [vote B, vote A] par insertion au milieu.
 */
const c = contenuDisque();
function preparer() {
  let e = nouvellePartie(c, 'coop', 'Coop', 'coop');
  const debut: Action[] = [
    { type: 'rejoindre', joueur: 'a', pseudo: 'Alice' },
    { type: 'rejoindre', joueur: 'b', pseudo: 'Bruno' },
    { type: 'creer_heros', joueur: 'a', heros: { nom: 'Lise', classe: 'ombre', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24 } },
    { type: 'creer_heros', joueur: 'b', heros: { nom: 'Taro', classe: 'gardien', race: 'nain', don: 'second-depart', origine: 'invoque', age: 24 } },
  ];
  e = rejouer(c, e, debut).etat;
  return { depart: nouvellePartie(c, 'coop', 'Coop', 'coop'), debut, etat: e };
}

describe('coop : actions qui arrivent dans le désordre', () => {
  it('une action insérée au milieu du journal n\'est jamais perdue', () => {
    const { depart, debut } = preparer();
    const x: Action = { type: 'presence', joueur: 'b', present: false };
    const y: Action = { type: 'presence', joueur: 'a', present: true };
    // l'appareil A connaît déjà [début…, y] (sa propre action) ; le journal trié devient [début…, x, y]
    const connues = [...debut, y];
    const etatA = rejouer(c, depart, connues).etat;
    const toutes = [...debut, x, y];
    const r = synchroniser(c, depart, etatA, connues, toutes);
    expect(r.rejoue).toBe(true);
    expect(r.etat).toEqual(rejouer(c, depart, toutes).etat);
    // l'ancienne lecture (« seulement la fin ») sautait x et réappliquait y : états différents
    const ancienne = rejouer(c, etatA, toutes.slice(connues.length)).etat;
    expect(r.etat.joueurs.b.present).toBe(false);
    expect(ancienne.joueurs.b.present).toBe(true); // l'action de B a été perdue
  });
  it('cas normal : les nouvelles actions sont ajoutées à la fin, sans tout rejouer', () => {
    const { depart, debut } = preparer();
    const etat = rejouer(c, depart, debut).etat;
    const plus: Action = { type: 'presence', joueur: 'a', present: true };
    const r = synchroniser(c, depart, etat, debut, [...debut, plus]);
    expect(r.rejoue).toBe(false);
    expect(r.etat).toEqual(appliquer(c, etat, plus));
  });
});
