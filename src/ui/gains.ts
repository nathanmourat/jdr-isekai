/**
 * Petites notifications de gain (test 3, point 5) : « +1 Potion de soin », « +20 or », « +50 XP »,
 * « Affinité avec Kaya ↑ », « Réputation Guilde +1 »…
 * Elles sont calculées en comparant l'état du moteur avant et après une action : elles viennent donc
 * de ce que le moteur a vraiment fait (objets, or, XP, affinité, réputation), jamais du texte de la scène.
 * Rien ne change dans le moteur ni dans la sauvegarde (aucun effet sur Roblox).
 */
import type { Contenu } from '../contenu/types';
import { nomFaction, objetConnu, type EtatPartie } from '../moteur/partie';
import { cles, entrees } from '../moteur/outils';

export interface Gain {
  /** Héros concerné (seul son joueur voit la notification) ; null = gain de groupe, vu par tous. */
  heros: string | null;
  texte: string;
  /** gain (vert), perte (rouge) ou info (or). */
  sorte: 'gain' | 'perte' | 'info';
  /** Objet concerné, pour afficher son icône. */
  objet?: string;
}

const signe = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

export function calculerGains(contenu: Contenu, avant: EtatPartie, apres: EtatPartie): Gain[] {
  const g: Gain[] = [];
  for (const [id, h] of entrees(apres.heros)) {
    const a = avant.heros[id];
    if (!a) continue;
    const plusieurs = cles(apres.heros).length > 1;
    const qui = plusieurs ? `${h.nom} : ` : '';
    // objets du sac
    const objets = new Set([...cles(a.inventaire), ...cles(h.inventaire)]);
    for (const o of objets) {
      const d = (h.inventaire[o] ?? 0) - (a.inventaire[o] ?? 0);
      if (!d) continue;
      const def = contenu.objets[o];
      const nom = def ? (def.mystere && !objetConnu(contenu, apres, o) ? '???' : def.nom) : o;
      g.push({ heros: id, texte: `${qui}${signe(d)} ${nom}`, sorte: d > 0 ? 'gain' : 'perte', objet: o });
    }
    const dOr = h.or - a.or;
    if (dOr) g.push({ heros: id, texte: `${qui}${signe(dOr)} or`, sorte: dOr > 0 ? 'gain' : 'perte' });
    if (h.niveau > a.niveau) g.push({ heros: id, texte: `${qui}niveau ${h.niveau} !`, sorte: 'info' });
    else if (h.xp > a.xp) g.push({ heros: id, texte: `${qui}+${h.xp - a.xp} XP`, sorte: 'gain' });
    const dPts = (apres.pointsGuilde[id] ?? 0) - (avant.pointsGuilde[id] ?? 0);
    if (dPts) g.push({ heros: id, texte: `${qui}${signe(dPts)} points de Guilde`, sorte: dPts > 0 ? 'gain' : 'perte' });
    if ((apres.rangs?.[id] ?? 'F') !== (avant.rangs?.[id] ?? 'F')) g.push({ heros: id, texte: `${qui}rang de Guilde ${apres.rangs[id]} !`, sorte: 'info' });
    // affinité : seulement le sens (les points exacts restent un secret de la compagne)
    for (const [co, af] of entrees(apres.affinites[id] ?? {})) {
      const d = af.points - (avant.affinites[id]?.[co]?.points ?? 0);
      if (d && contenu.compagnons[co]) g.push({ heros: id, texte: `${qui}affinité avec ${contenu.compagnons[co].nom} ${d > 0 ? '↑' : '↓'}`, sorte: d > 0 ? 'gain' : 'perte' });
    }
  }
  // réputation : gain de groupe (arrondi, la réputation peut avoir des décimales)
  for (const [f, v] of entrees(apres.reputation)) {
    const d = Math.round(v) - Math.round(avant.reputation[f] ?? 0);
    if (d) g.push({ heros: null, texte: `Réputation ${nomFaction(f)} ${signe(d)}`, sorte: d > 0 ? 'gain' : 'perte' });
  }
  return g;
}
