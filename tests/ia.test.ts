import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { interpreter, propositionsScript, type ContexteIA } from '../src/ia/interpreteur';
import { predire } from '../src/ia/classificateur';
import { PHRASES_TEST } from '../src/ia/phrases-test';
import modele from '../src/ia/modele.json';
import type { ModeleIA } from '../src/ia/classificateur';
import { combattantHeros, demarrerCombat } from '../src/moteur/combat';
import { creerHeros, type Heros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';

const c = contenuDisque();
function contexte(rencontre: string, classe = 'lame-runique', modif?: (h: Heros) => void, race = 'humain', don = 'mimetisme'): ContexteIA {
  const h = creerHeros(c, { id: 'a', joueurId: 'j', nom: 'Kael', classe, race, don, origine: 'invoque', age: 20, anneeCampagne: 1012 });
  modif?.(h);
  const combat = demarrerCombat(c, rencontre, [combattantHeros(c, h, true)], creerRng(`ia:${rencontre}`));
  return { contenu: c, combat, acteur: 'h:a', heros: h, grimoire: {} };
}
const typeAction = (i: ReturnType<typeof interpreter>) => i.proposition?.action.kind === 'combat' ? i.proposition.action.action.type : i.proposition?.action.kind;

describe('IA maison : compréhension', () => {
  it('le classificateur reconnaît au moins 85 % des phrases écrites à la main', () => {
    const ok = PHRASES_TEST.filter((p) => predire(modele as unknown as ModeleIA, p.texte).classe === p.intention).length;
    expect(ok / PHRASES_TEST.length).toBeGreaterThanOrEqual(0.85);
  });

  it('comprend des actions simples et les fait valider par le moteur', () => {
    const cas: [string, string][] = [
      ["j'attaque la brute", 'attaque'], ['je lui mets un gros coup', 'attaque'], ['je vise la tête', 'viser'], ['je lui tranche les jambes', 'viser'],
      ['entaille runique !', 'competence'], ['je lance mon entaile runique sur lui', 'competence'], ['je me défends', 'defendre'],
      ['je me cache derrière un pilier', 'se_cacher'], ['on se casse', 'fuir'], ['je bois une potion', 'objet'], ['rune de garde', 'competence'],
    ];
    let ok = 0;
    for (const [texte, attendu] of cas) {
      const i = interpreter(contexte('ref-brute'), texte);
      if (typeAction(i) === attendu && i.possible) ok++;
      else console.log(`IA : « ${texte} » → ${typeAction(i)} (${i.message})`);
    }
    expect(ok / cas.length).toBeGreaterThanOrEqual(0.9);
  });

  it('refuse avec une explication et propose des alternatives possibles', () => {
    const i = interpreter(contexte('ref-brute'), 'je lance un javelot de flamme sur la brute');
    expect(i.possible).toBe(false);
    expect(i.message).toMatch(/ne connaissez pas « Javelot de flamme »/);
    expect(i.message).toMatch(/Arcaniste/);
    expect(i.alternatives.length).toBeGreaterThanOrEqual(2);
    expect(i.alternatives.every((a) => a.estimation.possible)).toBe(true);
    expect(i.compteCommeEssai).toBe(true);
  });

  it('pas d\'ailes, pas de vol', () => {
    const i = interpreter(contexte('ref-brute', 'archer', undefined, 'sang-dragon'), "je m'envole au dessus de la brute");
    expect(i.possible).toBe(false);
    expect(i.message).toMatch(/écailles, pas des ailes/);
    expect(i.alternatives.length).toBeGreaterThan(0);
  });

  it('mana insuffisant : refus chiffré et alternative', () => {
    const ctx = contexte('ref-brute');
    ctx.combat.combattants[0].mana = 0;
    const i = interpreter(ctx, 'entaille runique sur la brute');
    expect(i.possible).toBe(false);
    expect(i.message).toMatch(/mana|indisponible/i);
    expect(i.alternatives.some((a) => a.libelle.startsWith('Attaque'))).toBe(true);
  });

  it('corps à corps contre le rang arrière : refus et alternative', () => {
    const i = interpreter(contexte('tanneurs-cultistes'), "j'attaque le cultiste");
    expect(i.possible).toBe(false);
    expect(i.message).toMatch(/rang arrière/);
    expect(i.alternatives.some((a) => a.libelle.includes('Bandit'))).toBe(true);
  });

  it('une phrase incompréhensible compte comme un essai', () => {
    const i = interpreter(contexte('ref-brute'), 'zorglub bidule truc');
    expect(i.possible).toBe(false);
    expect(i.compteCommeEssai).toBe(true);
  });

  it('observer ne coûte ni tour ni essai', () => {
    const i = interpreter(contexte('crypte-squelettes', 'arcaniste'), "j'observe les squelettes");
    expect(i.compteCommeEssai).toBe(false);
    expect(i.informations.length).toBe(2);
    expect(i.informations[0]).toMatch(/craint : lumière/);
  });

  it('les chiffres viennent du moteur (chances, dégâts, mana)', () => {
    const i = interpreter(contexte('ref-brute'), 'entaille runique');
    expect(i.proposition!.details).toMatch(/% de réussite · \d+–\d+ dégâts · 5 mana/);
  });
});

describe('IA maison : fusions', () => {
  it('refuse une fusion tant que les compétences ne sont pas au rang 2', () => {
    const i = interpreter(contexte('ref-brute', 'arcaniste', undefined, 'elfe', 'oeil-du-seuil'), 'je combine javelot de flamme et onde de givre');
    expect(i.intention).toBe('fusionner');
    expect(i.possible).toBe(false);
    expect(i.message).toMatch(/rang 2/);
  });

  it('accepte la fusion au rang 2 et donne ses chiffres', () => {
    const ctx = contexte('ref-brute', 'arcaniste', (h) => { h.rangsCompetences['javelot-de-flamme'] = 2; h.rangsCompetences['onde-de-givre'] = 2; }, 'elfe', 'oeil-du-seuil');
    const i = interpreter(ctx, 'je mélange javelot de flamme et onde de givre sur la brute');
    expect(i.possible).toBe(true);
    expect(i.proposition!.action.kind).toBe('fusion');
    expect(i.proposition!.details).toMatch(/dégâts/);
  });

  it('feu + glace par les éléments seulement', () => {
    const ctx = contexte('ref-brute', 'arcaniste', (h) => { h.rangsCompetences['javelot-de-flamme'] = 2; h.rangsCompetences['onde-de-givre'] = 2; }, 'elfe', 'oeil-du-seuil');
    const i = interpreter(ctx, 'je combine le feu et la glace');
    expect(i.proposition?.action).toMatchObject({ kind: 'fusion', parent: 'javelot-de-flamme', secondaire: 'onde-de-givre' });
  });
});

describe('Mode « suivre le script »', () => {
  it('propose 3 actions possibles, classées', () => {
    const p = propositionsScript(contexte('ref-meute', 'arcaniste'));
    expect(p).toHaveLength(3);
    expect(p.every((x) => x.estimation.possible)).toBe(true);
    expect(p[0].score).toBeGreaterThanOrEqual(p[2].score);
  });
});
