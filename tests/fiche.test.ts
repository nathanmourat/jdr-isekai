import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { creerHeros } from '../src/moteur/personnage';
import { AIDE_CARACS, chiffresCompetence, origineCompetence, resumeChiffres, sujetHeros } from '../src/moteur/fiche';
import { CARACS } from '../src/contenu/constantes';

const c = contenuDisque();
const ombre = creerHeros(c, { id: 'h1', joueurId: 'j1', nom: 'Test', classe: 'ombre', race: 'elfe', don: 'oeil-du-seuil', origine: 'reincarne', anneeCampagne: 1012 });

describe('Aide de la fiche', () => {
  it('chaque caractéristique a un nom complet et un effet', () => {
    for (const k of CARACS) {
      expect(AIDE_CARACS[k].nom.length).toBeGreaterThan(3);
      expect(AIDE_CARACS[k].effet.length).toBeGreaterThan(20);
    }
    expect(AIDE_CARACS.CHA.effet).toContain('présence');
    expect(AIDE_CARACS.CHA.effet).toContain('dialogues');
  });

  it('Pas d\'ombre : coût, recharge, durée et critique garanti chiffré', () => {
    const k = chiffresCompetence(c, sujetHeros(c, ombre), c.competences['pas-d-ombre'], 1);
    expect(k.cout).toBe(5);
    expect(k.recharge).toBe(2);
    expect(k.cible).toBe('soi-même');
    expect(k.degats).toBeNull();
    expect(k.effets[0]).toBe('invisible pendant 1 tour');
    expect(k.effets[1]).toMatch(/coup critique garanti \(environ \d+ à \d+ dégâts\)/);
    expect(resumeChiffres(k)).toContain('5 mana · recharge 2 tours');
  });

  it('Lame empoisonnée : dégâts, toucher et poison par tour', () => {
    const k = chiffresCompetence(c, sujetHeros(c, ombre), c.competences['lame-empoisonnee'], 1);
    expect(k.degats![0]).toBeGreaterThan(0);
    expect(k.degats![1]).toBeGreaterThanOrEqual(k.degats![0]);
    // « plus c'est puissant, moins c'est sûr » : les 5 premiers points de mana sont gratuits, donc 4 mana ne coûtent rien…
    expect(k.toucher).toBeCloseTo(c.config.combat.toucher_base, 5);
    // …mais une compétence à 8 mana perd 3 points
    expect(chiffresCompetence(c, sujetHeros(c, ombre), c.competences['onde-de-givre'], 1).toucher).toBeCloseTo(c.config.combat.toucher_base - 0.03, 5);
    // la maîtrise rend la compétence plus forte et plus sûre
    const maitre = chiffresCompetence(c, sujetHeros(c, ombre), c.competences['lame-empoisonnee'], 1, 5);
    expect(maitre.toucher!).toBeGreaterThan(k.toucher!);
    expect(maitre.degats![1]).toBeGreaterThan(k.degats![1]);
    expect(k.effets.join(' ')).toMatch(/poison pendant 3 tours \(\d+ dégâts par tour, cumulable 3 fois\)/);
    // un rang de plus = plus de dégâts
    const k2 = chiffresCompetence(c, sujetHeros(c, ombre), c.competences['lame-empoisonnee'], 3);
    expect(k2.degats![0]).toBeGreaterThan(k.degats![0]);
  });

  it('indique d\'où vient la compétence', () => {
    expect(origineCompetence(c, ombre, 'lame-empoisonnee')).toBe("compétence de départ de l'Ombre");
    expect(origineCompetence(c, ombre, 'nuage-toxique')).toBe('apprise au niveau 5 (branche Toxines)');
    const lame = creerHeros(c, { id: 'h2', joueurId: 'j2', nom: 'L', classe: 'lame-runique', race: 'nain', don: 'mimetisme', origine: 'reincarne', anneeCampagne: 1012 });
    expect(origineCompetence(c, lame, c.classes['lame-runique'].competences[0])).toBe('compétence de départ de la Lame runique');
  });

  it('toutes les compétences de toutes les classes se chiffrent sans erreur', () => {
    for (const cl of Object.values(c.classes)) {
      const h = creerHeros(c, { id: 'x', joueurId: 'j', nom: 'X', classe: cl.id, race: 'elfe', don: 'oeil-du-seuil', origine: 'reincarne', anneeCampagne: 1012 });
      for (const comp of cl.competences_detail) {
        const texte = resumeChiffres(chiffresCompetence(c, sujetHeros(c, h), comp, 1));
        expect(texte).toContain('cible :');
      }
    }
  });
});
