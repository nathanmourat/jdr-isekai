/**
 * Combats fixes du banc d'essai de l'IA de combat (« Proposer mon action »).
 *   G : groupe aux Lanternes — Lyra (Guérisseuse elfe, pseudo Mimi), Brann (Gardien nain, Toto), Zed (Arcaniste humain, Pixel)
 *       et Kaya (compagne de Brann) contre 3 gobelins cendrés (le B presque mort) et un cultiste au second rang.
 *   L : Sylvan (Archer vulpin, don Langue universelle) seul contre 3 loups gris (le B très blessé, donc pacifiable).
 *   V : Brann et Zed contre Vorthak (boss).
 *   A : Nox (Alchimiste, don Main de l'artisan : une bombe) seul contre 2 loups gris.
 * Dernière cible de chaque héros : le gobelin C (G), le loup A (L, A), Vorthak (V).
 */
import type { Contenu } from '../../src/contenu/types';
import { combattantCompagnon, combattantHeros, demarrerCombat, type Combat, type Combattant } from '../../src/moteur/combat';
import { creerHeros, type Heros } from '../../src/moteur/personnage';
import { creerRng } from '../../src/moteur/rng';
import type { ContexteIA } from '../../src/ia/interpreteur';

export interface Scenario {
  combat: Combat;
  heros: Record<string, Heros>;
  /** alias lisibles → identifiants des combattants (gobA, cult, kaya, loupB…) */
  alias: Record<string, string>;
  pseudos: Record<string, string>;
}

function heros(c: Contenu, id: string, nom: string, classe: string, race: string, don: string): Heros {
  const h = creerHeros(c, { id, joueurId: `j-${id}`, nom, classe, race, don, origine: 'invoque', age: 24, anneeCampagne: 1012, niveau: 6 });
  for (const k of Object.keys(h.rangsCompetences)) h.rangsCompetences[k] = 2;
  return h;
}
const ennemis = (cb: Combat) => cb.combattants.filter((x) => x.camp === 'ennemis');
const parHeros = (cb: Combat, id: string) => cb.combattants.find((x) => x.herosId === id)!;
function pv(x: Combattant, part: number) { x.pv = Math.max(1, Math.round(x.pvMax * part)); }

export function construireScenarios(c: Contenu): Record<string, Scenario> {
  const res: Record<string, Scenario> = {};
  // G : le groupe
  {
    const lyra = heros(c, 'lyra', 'Lyra', 'guerisseur', 'elfe', 'oeil-du-seuil');
    const brann = heros(c, 'brann', 'Brann', 'gardien', 'nain', 'aura-de-l-elu');
    const zed = heros(c, 'zed', 'Zed', 'arcaniste', 'humain', 'reserve-du-neant');
    const cb = demarrerCombat(c, 'lanternes-cultistes', [combattantHeros(c, lyra, true, lyra.grimoire), combattantHeros(c, brann, true, brann.grimoire), combattantHeros(c, zed, true, zed.grimoire), combattantCompagnon(c, 'kaya', brann, [])], creerRng('banc-g'));
    const [gobA, gobB, cult, gobC] = [ennemis(cb).find((e) => e.nom.endsWith(' A'))!, ennemis(cb).find((e) => e.nom.endsWith(' B'))!, ennemis(cb).find((e) => e.refId === 'cultiste')!, ennemis(cb).find((e) => e.nom.endsWith(' C'))!];
    pv(gobB, 0.2);
    pv(parHeros(cb, 'lyra'), 0.6); pv(parHeros(cb, 'brann'), 0.7); pv(parHeros(cb, 'zed'), 0.3);
    const kaya = cb.combattants.find((x) => x.type === 'compagnon')!;
    pv(kaya, 0.55);
    for (const x of cb.combattants) if (x.camp === 'heros') x.derniereCible = gobC.id;
    res.G = {
      combat: cb, heros: { lyra, brann, zed },
      alias: { gobA: gobA.id, gobB: gobB.id, gobC: gobC.id, cult: cult.id, lyra: parHeros(cb, 'lyra').id, brann: parHeros(cb, 'brann').id, zed: parHeros(cb, 'zed').id, kaya: kaya.id },
      pseudos: { lyra: 'Mimi', brann: 'Toto', zed: 'Pixel' },
    };
  }
  // L : l'archer seul contre les loups
  {
    const sylvan = heros(c, 'sylvan', 'Sylvan', 'archer', 'vulpin', 'langue-universelle');
    const cb = demarrerCombat(c, 'loups-alpha', [combattantHeros(c, sylvan, true, sylvan.grimoire)], creerRng('banc-l'));
    const [loupA, loupB, loupC] = ['A', 'B', 'C'].map((l) => ennemis(cb).find((e) => e.nom.endsWith(` ${l}`))!);
    pv(loupB, 0.2);
    const moi = parHeros(cb, 'sylvan');
    pv(moi, 0.4);
    moi.derniereCible = loupA.id;
    res.L = { combat: cb, heros: { sylvan }, alias: { loupA: loupA.id, loupB: loupB.id, loupC: loupC.id, sylvan: moi.id }, pseudos: { sylvan: 'Renard' } };
  }
  // V : le boss
  {
    const brann = heros(c, 'brann', 'Brann', 'gardien', 'nain', 'aura-de-l-elu');
    const zed = heros(c, 'zed', 'Zed', 'arcaniste', 'humain', 'reserve-du-neant');
    const cb = demarrerCombat(c, 'lanternes-vorthak', [combattantHeros(c, brann, true, brann.grimoire), combattantHeros(c, zed, true, zed.grimoire)], creerRng('banc-v'));
    const vorthak = ennemis(cb).find((e) => e.boss)!;
    pv(vorthak, 0.6);
    for (const x of cb.combattants) if (x.camp === 'heros') x.derniereCible = vorthak.id;
    res.V = { combat: cb, heros: { brann, zed }, alias: { vorthak: vorthak.id, brann: parHeros(cb, 'brann').id, zed: parHeros(cb, 'zed').id }, pseudos: { brann: 'Toto', zed: 'Pixel' } };
  }
  // A : l'alchimiste et sa bombe
  {
    const nox = heros(c, 'nox', 'Nox', 'alchimiste', 'demi-demon', 'main-de-l-artisan');
    const cb = demarrerCombat(c, 'loups-combe', [combattantHeros(c, nox, true, nox.grimoire)], creerRng('banc-a'));
    const [loupA, loupB] = ['A', 'B'].map((l) => ennemis(cb).find((e) => e.nom.endsWith(` ${l}`))!);
    const moi = parHeros(cb, 'nox');
    pv(moi, 0.9);
    moi.derniereCible = loupA.id;
    res.A = { combat: cb, heros: { nox }, alias: { loupA: loupA.id, loupB: loupB.id, nox: moi.id }, pseudos: { nox: 'Bulle' } };
  }
  return res;
}

/** Contexte de l'IA pour un acteur « G-lyra », « L-sylvan »… : c'est son tour. */
export function contexte(c: Contenu, sc: Record<string, Scenario>, qui: string): ContexteIA {
  const [s, h] = qui.split('-');
  const scen = sc[s];
  const acteur = scen.combat.combattants.find((x) => x.herosId === h)!;
  scen.combat.enAttente = acteur.id;
  const pseudos: Record<string, string> = {};
  for (const [id, p] of Object.entries(scen.pseudos)) pseudos[id] = p;
  return { contenu: c, combat: scen.combat, acteur: acteur.id, heros: scen.heros[h], grimoire: scen.heros[h].grimoire, pseudos } as ContexteIA;
}
