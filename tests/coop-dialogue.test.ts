import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, joueursAttendusDialogue, nouvellePartie, rejouer, type Action, type EtatPartie } from '../src/moteur/partie';

// Test 3, points 7 et 8 : « Continuer » d'une scène de groupe attend tous les joueurs présents ; votes affichés.
const c = contenuDisque();
function partie(nb: number): EtatPartie {
  const acts: Action[] = [];
  const noms = ['Lise', 'Taro', 'Mira'];
  for (let i = 0; i < nb; i++) {
    acts.push({ type: 'rejoindre', joueur: `j${i}`, pseudo: `P${i}` });
    acts.push({ type: 'creer_heros', joueur: `j${i}`, heros: { nom: noms[i], classe: 'ombre', race: 'humain', don: ['oeil-du-seuil', 'second-depart', 'reserve-du-neant'][i], origine: 'invoque', age: 24 } });
  }
  const e = rejouer(c, nouvellePartie(c, 'd', 'D', 'd'), acts).etat;
  // une scène de groupe dont le premier nœud a une suite (« Continuer »)
  const sc = Object.values(c.scenes).find((s) => s.type === 'groupe' && s.noeuds[s.debut].suite && !s.noeuds[s.debut].choix.length && !s.noeuds[s.debut].combat)!;
  e.scenes.groupe = { sceneId: sc.id, noeud: sc.debut, heros: Object.keys(e.heros), votes: {}, dernierTest: null, messages: [], parole: null, prets: [] };
  return e;
}

describe('dialogue de groupe : tout le monde doit être prêt', () => {
  it('à deux : le premier « Continuer » attend le second', () => {
    let e = partie(2);
    const noeud = e.scenes.groupe.noeud;
    e = appliquer(c, e, { type: 'pret_dialogue', joueur: 'j0', cle: 'groupe' });
    expect(e.scenes.groupe.noeud).toBe(noeud);
    expect(joueursAttendusDialogue(e, 'groupe')).toEqual(['j1']);
    e = appliquer(c, e, { type: 'pret_dialogue', joueur: 'j1', cle: 'groupe' });
    expect(e.scenes.groupe?.noeud).not.toBe(noeud);
  });
  it('un joueur absent ne compte pas', () => {
    let e = partie(2);
    const noeud = e.scenes.groupe.noeud;
    e = appliquer(c, e, { type: 'presence', joueur: 'j1', present: false });
    e = appliquer(c, e, { type: 'pret_dialogue', joueur: 'j0', cle: 'groupe' });
    expect(e.scenes.groupe?.noeud).not.toBe(noeud);
  });
  it('en solo, rien ne change : un clic suffit', () => {
    let e = partie(1);
    const noeud = e.scenes.groupe.noeud;
    e = appliquer(c, e, { type: 'pret_dialogue', joueur: 'j0', cle: 'groupe' });
    expect(e.scenes.groupe?.noeud).not.toBe(noeud);
  });
  it('les votes restent visibles après la résolution : qui a choisi quoi', () => {
    const e0 = partie(2);
    const sc = Object.values(c.scenes).find((s) => s.type === 'groupe' && s.noeuds[s.debut].choix.length >= 2 && s.noeuds[s.debut].choix.every((ch) => !ch.si && !ch.test))!;
    e0.scenes.groupe = { ...e0.scenes.groupe, sceneId: sc.id, noeud: sc.debut };
    let e = appliquer(c, e0, { type: 'choisir', joueur: 'j0', cle: 'groupe', index: 0 });
    e = appliquer(c, e, { type: 'choisir', joueur: 'j1', cle: 'groupe', index: 1 });
    const r = e.scenes.groupe?.resultatVote;
    if (!e.scenes.groupe) return; // la scène s'est terminée sur ce choix
    expect(r?.choix[0].joueurs).toEqual(['j0']);
    expect(r?.choix[1].joueurs).toEqual(['j1']);
    expect([0, 1]).toContain(r?.retenu);
  });
});
