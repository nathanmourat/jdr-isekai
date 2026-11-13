/**
 * Simulation d'équilibrage : fait combattre des héros contrôlés par l'IA contre des rencontres de référence.
 */
import type { Contenu } from '../contenu/charger';
import { annulerTour, avancer, combattantHeros, demarrerCombat, type Combat } from './combat';
import { creerHeros } from './personnage';
import { creerRng, entier } from './rng';

export interface Resultat { victoires: number; combats: number; tours: number }

export function simulerCombat(contenu: Contenu, rencontre: string, heros: { classe: string; race: string; don: string; niveau?: number }[], graine: string): Combat {
  const rng = creerRng(graine);
  const allies = heros.map((h, i) =>
    combattantHeros(contenu, creerHeros(contenu, {
      id: `sim${i}`, joueurId: `j${i}`, nom: `${contenu.classes[h.classe].nom} ${i + 1}`, classe: h.classe, race: h.race, don: h.don,
      origine: 'invoque', age: 20, anneeCampagne: 1012, niveau: h.niveau ?? 1,
    }), false),
  );
  let combat = demarrerCombat(contenu, rencontre, allies, rng, 'sim');
  // Second départ : rejoue une fois le tour perdu
  if (combat.resultat === 'defaite' && allies.some((a) => a.don?.id === 'second-depart')) {
    combat = annulerTour(combat);
    for (const a of combat.combattants) if (a.don?.id === 'second-depart') a.don = { id: 'second-depart-utilise', parametres: {} };
    avancer(contenu, combat, rng);
  }
  return combat;
}

export function tauxVictoire(contenu: Contenu, rencontre: string, heros: { classe: string; race: string; don: string; niveau?: number }[], n: number, graine: string): Resultat {
  let v = 0, t = 0;
  for (let i = 0; i < n; i++) {
    const c = simulerCombat(contenu, rencontre, heros, `${graine}:${i}`);
    if (c.resultat === 'victoire') v++;
    t += c.tour;
  }
  return { victoires: v, combats: n, tours: t };
}

export const RENCONTRES_REFERENCE = ['ref-brute', 'ref-rapide', 'ref-mage', 'ref-meute', 'ref-chef'];

export interface Rapport {
  moyenne: number;
  classes: { id: string; nom: string; taux: number; parRencontre: Record<string, number>; tours: number }[];
  races: { id: string; nom: string; taux: number }[];
  combinaisons: { classe: string; race: string; taux: number }[];
  dons: { id: string; nom: string; taux: number }[];
  groupes: { taille: number; taux: number }[];
  ecarts: { classe: number; race: number; combinaison: number; don: number };
  conforme: boolean;
  problemes: string[];
}

/**
 * @param n combats par combinaison classe × race et par rencontre
 */
export function equilibrage(contenu: Contenu, n = 1000, nDons = 200, nGroupes = 400): Rapport {
  const classes = Object.keys(contenu.classes);
  const races = Object.keys(contenu.races);
  const dons = Object.keys(contenu.dons);
  const combi: Record<string, Record<string, { v: number; n: number; t: number; parR: Record<string, number> }>> = {};
  for (const cl of classes) {
    combi[cl] = {};
    for (const ra of races) {
      const r = { v: 0, n: 0, t: 0, parR: {} as Record<string, number> };
      for (const re of RENCONTRES_REFERENCE) {
        let vr = 0;
        for (let i = 0; i < n; i++) {
          const don = dons[i % dons.length];
          const c = simulerCombat(contenu, re, [{ classe: cl, race: ra, don }], `cr:${cl}:${ra}:${re}:${i}`);
          if (c.resultat === 'victoire') { r.v++; vr++; }
          r.n++;
          r.t += c.tour;
        }
        r.parR[re] = vr / n;
      }
      combi[cl][ra] = r;
    }
  }
  const tx = (x: { v: number; n: number }) => x.v / x.n;
  const toutes = classes.flatMap((cl) => races.map((ra) => combi[cl][ra]));
  const moyenne = toutes.reduce((a, x) => a + x.v, 0) / toutes.reduce((a, x) => a + x.n, 0);

  const resClasses = classes.map((cl) => {
    const l = races.map((ra) => combi[cl][ra]);
    const parRencontre: Record<string, number> = {};
    for (const re of RENCONTRES_REFERENCE) parRencontre[re] = l.reduce((a, x) => a + x.parR[re], 0) / l.length;
    return { id: cl, nom: contenu.classes[cl].nom, taux: l.reduce((a, x) => a + x.v, 0) / l.reduce((a, x) => a + x.n, 0), parRencontre, tours: l.reduce((a, x) => a + x.t, 0) / l.reduce((a, x) => a + x.n, 0) };
  });
  const resRaces = races.map((ra) => {
    const l = classes.map((cl) => combi[cl][ra]);
    return { id: ra, nom: contenu.races[ra].nom, taux: l.reduce((a, x) => a + x.v, 0) / l.reduce((a, x) => a + x.n, 0) };
  });
  const resCombi = classes.flatMap((cl) => races.map((ra) => ({ classe: cl, race: ra, taux: tx(combi[cl][ra]) })));

  // Dons : chaque don avec toutes les classes (race humaine)
  const resDons = dons.map((d) => {
    let v = 0, tot = 0;
    for (const cl of classes) for (const re of RENCONTRES_REFERENCE) for (let i = 0; i < nDons; i++) {
      const c = simulerCombat(contenu, re, [{ classe: cl, race: 'humain', don: d }], `don:${d}:${cl}:${re}:${i}`);
      if (c.resultat === 'victoire') v++;
      tot++;
    }
    return { id: d, nom: contenu.dons[d].nom, taux: v / tot };
  });

  // Groupes de 2 à 4 héros aléatoires : la difficulté adaptée doit garder un taux comparable
  const rngG = creerRng('groupes');
  const resGroupes = [1, 2, 3, 4].map((taille) => {
    let v = 0;
    for (let i = 0; i < nGroupes; i++) {
      const heros = Array.from({ length: taille }, () => ({ classe: classes[entier(rngG, 0, classes.length - 1)], race: races[entier(rngG, 0, races.length - 1)], don: dons[entier(rngG, 0, dons.length - 1)] }));
      const re = RENCONTRES_REFERENCE[i % RENCONTRES_REFERENCE.length];
      if (simulerCombat(contenu, re, heros, `grp:${taille}:${i}`).resultat === 'victoire') v++;
    }
    return { taille, taux: v / nGroupes };
  });

  const ecart = (l: { taux: number }[]) => Math.max(...l.map((x) => Math.abs(x.taux - moyenne)));
  const ecarts = { classe: ecart(resClasses), race: ecart(resRaces), combinaison: ecart(resCombi), don: Math.max(...resDons.map((d) => Math.abs(d.taux - resDons.reduce((a, x) => a + x.taux, 0) / resDons.length))) };
  const problemes: string[] = [];
  for (const c of resClasses) if (Math.abs(c.taux - moyenne) > 0.10) problemes.push(`Classe ${c.nom} : ${pc(c.taux)} (moyenne ${pc(moyenne)})`);
  for (const r of resRaces) if (Math.abs(r.taux - moyenne) > 0.10) problemes.push(`Race ${r.nom} : ${pc(r.taux)} (moyenne ${pc(moyenne)})`);
  for (const c of resCombi) if (Math.abs(c.taux - moyenne) > 0.15) problemes.push(`Combinaison ${c.classe} × ${c.race} : ${pc(c.taux)}`);
  const moyDons = resDons.reduce((a, x) => a + x.taux, 0) / resDons.length;
  for (const d of resDons) if (Math.abs(d.taux - moyDons) > 0.10) problemes.push(`Don ${d.nom} : ${pc(d.taux)} (moyenne des dons ${pc(moyDons)})`);
  for (const g of resGroupes) if (Math.abs(g.taux - resGroupes[0].taux) > 0.15) problemes.push(`Groupe de ${g.taille} : ${pc(g.taux)} (solo ${pc(resGroupes[0].taux)})`);
  return { moyenne, classes: resClasses, races: resRaces, combinaisons: resCombi, dons: resDons, groupes: resGroupes, ecarts, conforme: problemes.length === 0, problemes };
}

export const pc = (x: number) => `${(x * 100).toFixed(1).replace('.', ',')} %`;
