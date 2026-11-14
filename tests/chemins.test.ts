import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, nouvellePartie } from '../src/moteur/partie';
import { flechesDuLieu } from '../src/ui/chemins';

// Test 3, point 2 : flèches de chemin (Combe-aux-Saules → Lisière de la Combe → Vieux saule creux).
const c = contenuDisque();
const QUETE = Object.values(c.quetes).find((q) => q.etapes.some((e) => e.lieu === 'combe-taniere'))!.id;
function partie(etape: string) {
  let e = nouvellePartie(c, 'ch', 'Chemins', 'ch');
  e = appliquer(c, e, { type: 'rejoindre', joueur: 'j1', pseudo: 'A' });
  e = appliquer(c, e, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Lise', classe: 'ombre', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24 } });
  e.quetes[QUETE] = { etape, terminee: false };
  return e;
}

describe('flèches de chemin', () => {
  it('sur la zone de départ, une flèche mène directement à l\'étape en cours (zones faites traversées d\'un clic)', () => {
    const f = flechesDuLieu(c, partie('taniere'), 'h1', 'combe-aux-saules');
    expect(f.map((x) => [x.vers, x.retour])).toEqual([['combe-taniere', false]]);
    expect(f[0].niveau).not.toBeNull();
  });
  it('sur la zone en cours, une flèche « retour » ramène à la zone précédente', () => {
    const f = flechesDuLieu(c, partie('taniere'), 'h1', 'combe-taniere');
    expect(f.map((x) => [x.vers, x.retour])).toEqual([['combe-lisiere', true]]);
  });
  it('pas de flèche hors du chemin, ni avant la deuxième étape', () => {
    expect(flechesDuLieu(c, partie('taniere'), 'h1', 'temple-du-seuil')).toEqual([]);
    const debut = partie('ferme');
    expect(flechesDuLieu(c, debut, 'h1', 'guilde')).toEqual([]); // la Guilde (en ville) ne fait pas partie du chemin
    expect(flechesDuLieu(c, debut, 'h1', 'combe-aux-saules')).toEqual([]);
  });
});
