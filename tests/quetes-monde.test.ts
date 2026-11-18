// Quêtes secondaires « du monde » ajoutées le 18/11 (une ou deux par chapitre) :
// chacune se joue du début à la fin, avec chaque choix du premier embranchement, sans scène bloquée.
import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { listeHeros, sceneEstDisponible } from '../src/moteur/partie';
import { finirScene, jouer, jouerSceneGroupe, nouvellePartieDeTest, type Robot } from './robot';

const c = contenuDisque();

const QUETES: { id: string; flags: string[]; scenes: string[] }[] = [
  { id: 'q-pensions-valgrane', flags: [], scenes: ['sq-pensions-rowena', 'sq-pensions-seraphine', 'sq-pensions-place', 'sq-pensions-retour'] },
  { id: 'q-lanterne-noire', flags: ['lanternes-faites'], scenes: ['sq-lanterne-bram', 'sq-lanterne-egouts', 'sq-lanterne-cache', 'sq-lanterne-retour'] },
  { id: 'q-cristal-murmure', flags: ['sables-ouverts'], scenes: ['sq-cristal-ouzram', 'sq-cristal-idris', 'sq-cristal-mine', 'sq-cristal-retour'] },
  { id: 'q-arbre-des-noms', flags: ['sylvenoire-ouverte'], scenes: ['sq-arbre-orsa', 'sq-arbre-clairiere', 'sq-arbre-retour'] },
  { id: 'q-appele-oublie', flags: ['ch4-depart-fait', 'carte-du-nid'], scenes: ['sq-oublie-brann', 'sq-oublie-ile', 'sq-oublie-retour'] },
  { id: 'q-hopital-gamelle', flags: ['ch5-depart-fait', 'mur-tombe'], scenes: ['sq-hopital-brisac', 'sq-hopital-village', 'sq-hopital-triage'] },
  { id: 'q-dernier-ecuyer', flags: ['ch6-depart-fait'], scenes: ['sq-ecuyer-foret', 'sq-ecuyer-retour'] },
];

function apresExamen(graine: string): Robot {
  const r = nouvellePartieDeTest(c, graine);
  jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Alpha' });
  jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Kael', classe: 'lame-runique', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 22, sexe: 'm' } });
  jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'ch1-appel' });
  finirScene(c, r, 'groupe', ['j1']);
  jouerSceneGroupe(c, r, 'ch1-examen');
  if (r.etat.scenes.groupe) jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' });
  return r;
}

describe('Quêtes secondaires « du monde » (18/11)', () => {
  it('7 quêtes, du chapitre 1 au chapitre 6, avec leur niveau conseillé', () => {
    for (const q of QUETES) {
      expect(c.quetes[q.id], q.id).toBeDefined();
      expect(c.quetes[q.id].type).toBe('secondaire');
      expect(c.quetes[q.id].niveau).toBeGreaterThan(0);
    }
    expect(new Set(QUETES.map((q) => c.quetes[q.id].chapitre)).size).toBe(6);
  });

  for (const q of QUETES) for (const choix of [0, 1, 2]) {
    it(`${q.id} se termine (choix n° ${choix + 1})`, () => {
      const r = apresExamen(`${q.id}-${choix}`);
      for (const f of q.flags) r.etat.flags[f] = true;
      listeHeros(r.etat)[0].or = 500;
      for (const id of q.scenes) {
        const h = listeHeros(r.etat)[0].id;
        expect(sceneEstDisponible(c, r.etat, c.scenes[id], h), `${id} disponible`).toBe(true);
        jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: id });
        finirScene(c, r, 'groupe', ['j1'], choix);
        if (r.etat.scenes.groupe) jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'groupe' });
      }
      expect(r.etat.quetes[q.id]?.terminee, `${q.id} terminée`).toBe(true);
      // la quête ne se relance pas
      expect(sceneEstDisponible(c, r.etat, c.scenes[q.scenes[0]], listeHeros(r.etat)[0].id)).toBe(false);
    });
  }
});
