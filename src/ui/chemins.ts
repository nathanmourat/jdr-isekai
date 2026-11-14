/**
 * Flèches de chemin sur les décors (test 3, point 2).
 * Un chemin, c'est la suite des lieux des étapes d'une quête ou d'un contrat en cours
 * (ex. Combe-aux-Saules → Lisière de la Combe → Vieux saule creux). Aucun nouveau champ dans le YAML :
 * l'ordre des étapes suffit. Sur un lieu déjà traversé du chemin, une flèche mène directement à la zone
 * de l'étape en cours (les zones déjà faites se retraversent d'un clic, les combats gagnés restent acquis :
 * ce sont des étapes réussies). Sur la zone en cours, une flèche « retour » ramène à la zone précédente.
 * Position : clé `suite` (ou `chemin`) et `retour` de `assets/decors/<decor>.json` ; sinon bord droit
 * (ou gauche pour le retour), au milieu.
 */
import type { Contenu } from '../contenu/types';
import { etapeContrat, type EtatPartie } from '../moteur/partie';
import { lieuxDesEtapes, trouverLieu } from '../moteur/guide';
import { entrees } from '../moteur/outils';

export interface Fleche { vers: string; nom: string; niveau: number | null; retour: boolean }

/** Les chemins en cours : lieux des étapes déjà commencées (dans l'ordre, sans doublon voisin), la dernière étant la zone en cours. */
export function cheminsEnCours(contenu: Contenu, etat: EtatPartie, herosId: string | null): { lieux: string[]; niveau: number | null }[] {
  const res: { lieux: string[]; niveau: number | null }[] = [];
  const ajouter = (lieux: (string | undefined)[], niveau: number | null) => {
    const l: string[] = [];
    // seulement les zones hors des villes (la Guilde, l'auberge… ne font pas partie du chemin)
    for (const x of lieux) if (x && l[l.length - 1] !== x && !trouverLieu(contenu, x)?.lieu.ville) l.push(x);
    if (l.length >= 2) res.push({ lieux: l, niveau });
  };
  for (const [id, q] of entrees(etat.quetes)) {
    const def = contenu.quetes[id];
    if (!def || q.terminee) continue;
    const i = def.etapes.findIndex((x) => x.id === q.etape);
    if (i < 1) continue;
    const lieuDe = (e: (typeof def.etapes)[number]) => e.lieu ?? (e.scene ? contenu.scenes[e.scene]?.lieu : undefined);
    ajouter(def.etapes.slice(0, i + 1).map(lieuDe), def.etapes[i].niveau ?? def.niveau ?? null);
  }
  const ec = herosId ? etapeContrat(contenu, etat, herosId) : null;
  if (ec && herosId) {
    const st = etat.contrats[herosId];
    ajouter(ec.contrat.etapes.slice(0, st.etape + 1).map((e) => e.lieu), ec.contrat.niveau ?? null);
  }
  return res;
}

export function flechesDuLieu(contenu: Contenu, etat: EtatPartie, herosId: string | null, lieu: string): Fleche[] {
  const ouverts = lieuxDesEtapes(contenu, etat, herosId);
  const res: Fleche[] = [];
  for (const ch of cheminsEnCours(contenu, etat, herosId)) {
    const actuel = ch.lieux[ch.lieux.length - 1];
    const precedent = ch.lieux[ch.lieux.length - 2];
    const nom = (id: string) => trouverLieu(contenu, id)?.lieu.nom ?? id;
    if (lieu !== actuel && ch.lieux.includes(lieu) && ouverts.includes(actuel) && !res.some((f) => f.vers === actuel)) res.push({ vers: actuel, nom: nom(actuel), niveau: ch.niveau, retour: false });
    if (lieu === actuel && !res.some((f) => f.vers === precedent)) res.push({ vers: precedent, nom: nom(precedent), niveau: null, retour: true });
  }
  return res;
}
