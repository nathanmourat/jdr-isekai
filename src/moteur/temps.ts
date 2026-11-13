/**
 * Calendrier de Velmaris. Le temps est compté en jours depuis le 1er Germinal de l'année de départ
 * de la saison 1 (jour 0). Un nombre négatif correspond au passé (prologue d'enfance).
 */
import type { Contenu } from '../contenu/types';
import { vrai } from './outils';

export interface DateMonde { annee: number; mois: number; jour: number }

function cal(contenu: Contenu) {
  const c = contenu.config.calendrier;
  return { jpm: c.jours_par_mois, mois: c.mois, jpa: c.jours_par_mois * c.mois.length };
}

export function anneeDepart(contenu: Contenu): number {
  return contenu.config.saisons[0].annee_debut;
}

export function versDate(contenu: Contenu, jourAbsolu: number): DateMonde {
  const { jpm, jpa } = cal(contenu);
  const a = Math.floor(jourAbsolu / jpa);
  const reste = jourAbsolu - a * jpa;
  return { annee: anneeDepart(contenu) + a, mois: Math.floor(reste / jpm) + 1, jour: (reste % jpm) + 1 };
}

export function versJour(contenu: Contenu, d: { annee: number; mois?: number; jour?: number }): number {
  const { jpm, jpa } = cal(contenu);
  return (d.annee - anneeDepart(contenu)) * jpa + ((d.mois ?? 1) - 1) * jpm + ((d.jour ?? 1) - 1);
}

export function formaterDate(contenu: Contenu, jourAbsolu: number): string {
  const d = versDate(contenu, jourAbsolu);
  const m = contenu.config.calendrier.mois[d.mois - 1];
  return `Jour ${d.jour} · ${m.nom} (mois ${d.mois}/${contenu.config.calendrier.mois.length}) · An ${d.annee}`;
}

/** Aide affichée au survol de la date : saison, calendrier « AV », fête la plus proche. */
export function aideDate(contenu: Contenu, jourAbsolu: number): string[] {
  const { jpa } = cal(contenu);
  const d = versDate(contenu, jourAbsolu);
  const mois = contenu.config.calendrier.mois;
  const m = mois[d.mois - 1];
  let rangSaison = 0;
  for (let i = 0; i < d.mois; i++) if (mois[i].saison === m.saison) rangSaison++;
  const article = m.saison === 'printemps' ? 'du printemps' : m.saison === 'hiver' ? "de l'hiver" : `de l'${m.saison}`;
  const res = [
    `${m.nom} : ${rangSaison === 1 ? '1er' : `${rangSaison}e`} mois ${article}.`,
    `« AV » veut dire « Après le Voile » : c'est le calendrier de Velmaris. Nous sommes en ${d.annee} AV.`,
  ];
  // fête la plus proche à venir (dans l'année qui suit)
  let meilleure: { nom: string; dans: number } | null = null;
  for (const f of contenu.config.calendrier.fetes) {
    let dans = versJour(contenu, { annee: d.annee, mois: f.mois, jour: f.jour }) - jourAbsolu;
    if (dans < 0) dans += jpa;
    if (meilleure === null || dans < meilleure.dans) meilleure = { nom: f.nom, dans };
  }
  if (meilleure !== null) {
    res.push(meilleure.dans === 0 ? `Aujourd'hui : ${meilleure.nom} !` : `Prochaine fête : ${meilleure.nom}, dans ${meilleure.dans} jour${meilleure.dans > 1 ? 's' : ''}.`);
  }
  return res;
}

export function saisonDe(contenu: Contenu, jourAbsolu: number): string {
  return contenu.config.calendrier.mois[versDate(contenu, jourAbsolu).mois - 1].saison;
}

export function feteDuJour(contenu: Contenu, jourAbsolu: number): string | null {
  const d = versDate(contenu, jourAbsolu);
  return contenu.config.calendrier.fetes.find((f) => f.mois === d.mois && f.jour === d.jour)?.nom ?? null;
}

/** Fêtes rencontrées entre deux dates (exclu, inclus). */
export function fetesEntre(contenu: Contenu, de: number, a: number): { jour: number; nom: string }[] {
  const res: { jour: number; nom: string }[] = [];
  for (let j = de + 1; j <= a; j++) {
    const f = feteDuJour(contenu, j);
    if (vrai(f)) res.push({ jour: j, nom: f });
  }
  return res;
}

export function joursParMois(contenu: Contenu): number {
  return contenu.config.calendrier.jours_par_mois;
}

/** Chapitre correspondant à une date (saison 1). */
export function chapitreDe(contenu: Contenu, jourAbsolu: number): number {
  const s = contenu.config.saisons[0];
  const annees = versDate(contenu, jourAbsolu).annee - s.annee_debut;
  return Math.min(s.chapitres, Math.max(1, Math.floor(annees / s.annees_par_chapitre) + 1));
}
