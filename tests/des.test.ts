import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { etapeContrat } from '../src/moteur/partie';
import { jouer, nouvellePartieDeTest } from './robot';

const c = contenuDisque();

describe('Lancer de dé : le moteur note chaque test (test 4, point 9)', () => {
  it('une étape de contrat avec un test : le dé, le bonus, le total, la difficulté et le résultat', () => {
    // un contrat de rang F dont une étape est un test de caractéristique
    const ct = Object.values(c.contrats).find((x) => x.rang_min === 'F' && !x.examen_rang && x.etapes.some((e) => e.test) && !x.disponible_si)!;
    expect(ct).toBeTruthy();
    const r = nouvellePartieDeTest(c, 'des');
    jouer(c, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Testeur' });
    jouer(c, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Daleko', classe: 'barde', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 24, sexe: 'm' } });
    jouer(c, r, { type: 'contrat', joueur: 'j1', contrat: ct.id });
    expect(r.etat.tests).toEqual([]);
    for (let k = 0; k < 10; k++) {
      const x = etapeContrat(c, r.etat, 'h1');
      if (!x) break;
      if (x.etape.combat) break;   // on s'arrête avant un éventuel combat
      jouer(c, r, { type: 'etape_contrat', joueur: 'j1', choix: x.etape.choix.length ? 0 : undefined });
      if (x.etape.test) {
        expect(r.etat.tests).toHaveLength(1);
        const t = r.etat.tests![0];
        expect(t).toMatchObject({ heros: 'h1', carac: x.etape.test.carac, difficulte: x.etape.test.difficulte, quoi: ct.titre });
        expect(t.total).toBe(t.jet + t.bonus);
        expect(t.reussi).toBe(t.jet === 20 || (t.jet !== 1 && t.total >= t.difficulte));
        // l'action suivante vide la liste (l'animation ne rejoue pas un ancien lancer)
        jouer(c, r, { type: 'presence', joueur: 'j1', present: true });
        expect(r.etat.tests).toEqual([]);
        return;
      }
    }
    throw new Error(`Aucune étape de test jouée dans ${ct.id}`);
  });
});
