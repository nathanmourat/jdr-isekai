/**
 * Évalue l'IA de combat sur le banc d'essai (tests/ia/banc.ts) : taux de réussite par intention et par difficulté,
 * et « erreurs graves » (attaquer un allié, soigner le mauvais allié, gaspiller une potion ou une bombe, fuir sans
 * l'avoir demandé, attaquer quand le joueur a dit « je n'attaque pas », viser sans partie du corps nommée…).
 */
import type { Contenu } from '../../src/contenu/types';
import { interpreter, type Interpretation } from '../../src/ia/interpreteur';
import { BANC, type Attendu, type PhraseBanc } from './banc';
import { construireScenarios, contexte, type Scenario } from './scenarios';

export interface Obtenu { a: string; c?: string; k?: string; p?: string }
export interface Resultat { phrase: PhraseBanc; obtenu: Obtenu; ok: boolean; grave: string | null; message: string }

/** Ce que l'IA a décidé, ramené au format du banc. */
export function obtenu(r: Interpretation, alias: Record<string, string>): Obtenu {
  const inverse: Record<string, string> = {};
  for (const [k, v] of Object.entries(alias)) inverse[v] = k;
  const nom = (id?: string) => (id === undefined ? undefined : inverse[id] ?? id);
  const q = (r as Interpretation & { question?: unknown }).question;
  if (q) return { a: 'question' };
  if (r.intention === 'analyser' && !r.proposition) return { a: 'analyser' };
  if (r.proposition && r.possible) {
    const a = r.proposition.action;
    if (a.kind === 'fusion') return { a: 'fusion', c: nom(a.cible), k: a.parent };
    const x = a.action;
    switch (x.type) {
      case 'attaque': return { a: 'attaque', c: nom(x.cible) };
      case 'viser': return { a: 'viser', c: nom(x.cible), p: x.partie };
      case 'competence': return { a: 'competence', c: nom(x.cible), k: x.competence };
      case 'objet': return { a: x.objet === 'bombe' ? 'bombe' : 'potion', c: nom(x.cible) };
      case 'pacifier': return { a: 'pacifier', c: nom(x.cible) };
      default: return { a: x.type };
    }
  }
  return { a: r.intention === 'inconnu' ? 'inconnu' : 'refus' };
}

function correspond(att: Attendu, o: Obtenu, categorie: string): boolean {
  if (att.a === 'question') return o.a === 'question' || (categorie === 'hors_sujet' && o.a === 'inconnu');
  if (att.a === 'refus') return o.a === 'refus' || o.a === 'question';
  if (o.a !== att.a) return false;
  if (att.c !== undefined && o.c !== att.c) return false;
  if (att.k !== undefined && !(Array.isArray(att.k) ? att.k : [att.k]).includes(o.k ?? '')) return false;
  if (att.p !== undefined && o.p !== att.p) return false;
  return true;
}

const ALLIES = new Set(['lyra', 'brann', 'zed', 'kaya', 'sylvan', 'nox']);
function offensive(c: Contenu, o: Obtenu): boolean {
  if (['attaque', 'viser', 'bombe', 'fusion'].includes(o.a)) return true;
  if (o.a === 'competence' && o.k) {
    const k = c.competences[o.k];
    return !!k && (k.cible === 'ennemi' || k.cible === 'tous_ennemis' || k.cible === 'ennemi_aleatoire') && k.effets.some((e) => e.type === 'degats');
  }
  return false;
}
function soutien(c: Contenu, o: Obtenu): boolean {
  if (o.a === 'potion') return true;
  if (o.a === 'competence' && o.k) {
    const k = c.competences[o.k];
    return !!k && (k.cible === 'allie' || k.cible === 'tous_allies') && k.effets.some((e) => e.type === 'soin' || e.type === 'bouclier');
  }
  return false;
}

/** Erreur grave : ce que le joueur ne voulait sûrement pas, et qui lui coûte (tour, objet, PV). */
export function grave(c: Contenu, ph: PhraseBanc, o: Obtenu): string | null {
  const att = ph.attendu;
  if (o.a === 'question' || o.a === 'refus' || o.a === 'inconnu' || o.a === 'analyser') return null;
  if (offensive(c, o) && o.c !== undefined && ALLIES.has(o.c)) return 'attaque un allié';
  if (soutien(c, o) && o.c !== undefined && !ALLIES.has(o.c)) return 'soigne un ennemi';
  const attenduSoutien = att.a === 'potion' || (att.a === 'competence' && soutien(c, { a: 'competence', k: Array.isArray(att.k) ? att.k[0] : att.k }));
  if (attenduSoutien && soutien(c, o) && att.c !== undefined && o.c !== undefined && o.c !== att.c) return 'soigne ou protège le mauvais allié';
  if (attenduSoutien && offensive(c, o)) return 'attaque au lieu de soigner ou protéger';
  if ((o.a === 'potion' || o.a === 'bombe') && att.a !== o.a) return `utilise ${o.a === 'potion' ? 'une potion' : 'une bombe'} sans qu'on l'ait demandé`;
  if (o.a === 'fuir' && att.a !== 'fuir') return 'fuit sans qu\'on l\'ait demandé';
  if (ph.categorie === 'negation' && offensive(c, o) && !['attaque', 'viser', 'competence', 'fusion', 'bombe'].includes(att.a)) return 'attaque alors que le joueur a dit non';
  if (o.a === 'viser' && att.a === 'attaque') return 'vise une partie du corps (moins sûr) sans qu\'on l\'ait demandé';
  return null;
}

export function evaluer(c: Contenu): Resultat[] {
  const res: Resultat[] = [];
  for (const ph of BANC) {
    // scénarios reconstruits à chaque phrase : aucune phrase n'influence la suivante
    const sc: Record<string, Scenario> = construireScenarios(c);
    const ctx = contexte(c, sc, ph.qui);
    const r = interpreter(ctx, ph.texte);
    const o = obtenu(r, sc[ph.qui.split('-')[0]].alias);
    let ok = correspond(ph.attendu, o, ph.categorie);
    if (ok && ph.categorie === 'multi' && !vrai((r as Interpretation & { nonFait?: string }).nonFait)) ok = false;
    res.push({ phrase: ph, obtenu: o, ok, grave: grave(c, ph, o), message: r.message });
  }
  return res;
}
function vrai(x: string | undefined) { return x !== undefined && x.length > 0; }

export function resume(res: Resultat[]) {
  const par = (cle: (r: Resultat) => string) => {
    const m = new Map<string, { ok: number; n: number }>();
    for (const r of res) { const k = cle(r); const v = m.get(k) ?? { ok: 0, n: 0 }; v.n++; if (r.ok) v.ok++; m.set(k, v); }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  };
  return {
    total: { ok: res.filter((r) => r.ok).length, n: res.length },
    graves: res.filter((r) => r.grave),
    parCategorie: par((r) => r.phrase.categorie),
    parNiveau: par((r) => String(r.phrase.niveau)),
  };
}
