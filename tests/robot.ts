/**
 * « Joueur robot » pour les tests : crée une partie et joue automatiquement
 * (premier choix possible, combats à l'IA, exploration du donjon par le plus court chemin).
 */
import type { Contenu } from '../src/contenu/charger';
import { choisirActionIA } from '../src/moteur/combat';
import {
  appliquer, caseDonjon, choixVisibles, joueursDuPari, listeHeros, noeudCourant, nouvellePartie, partMinimaleDePari, sceneEstDisponible,
  type Action, type EtatPartie,
} from '../src/moteur/partie';
import { creerRng } from '../src/moteur/rng';
import { versJour } from '../src/moteur/temps';

export interface Robot { etat: EtatPartie; actions: Action[] }

export function nouvellePartieDeTest(contenu: Contenu, graine = 'test'): Robot {
  return { etat: nouvellePartie(contenu, 'p1', 'Partie de test', graine), actions: [] };
}

export function jouer(contenu: Contenu, r: Robot, a: Action) {
  r.etat = appliquer(contenu, r.etat, a);
  r.actions.push(a);
}

/** Deux joueurs : un invoqué (Lame runique humain) et un réincarné (Guérisseur elfe). */
export function groupeDeDeux(contenu: Contenu, graine = 'test'): Robot {
  const r = nouvellePartieDeTest(contenu, graine);
  jouer(contenu, r, { type: 'rejoindre', joueur: 'j1', pseudo: 'Alpha' });
  jouer(contenu, r, { type: 'rejoindre', joueur: 'j2', pseudo: 'Bravo' });
  jouer(contenu, r, { type: 'creer_heros', joueur: 'j1', heros: { nom: 'Kael', classe: 'lame-runique', race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 22 } });
  jouer(contenu, r, { type: 'creer_heros', joueur: 'j2', heros: { nom: 'Ilo', classe: 'guerisseur', race: 'elfe', don: 'aura-de-l-elu', origine: 'reincarne' } });
  return r;
}

const rngRobot = creerRng('robot');

/** Termine tous les combats en cours (actions choisies par l'IA). */
export function finirCombats(contenu: Contenu, r: Robot) {
  for (let garde = 0; garde < 2000; garde++) {
    const cles = Object.keys(r.etat.combats);
    if (cles.length === 0) return;
    const cle = cles[0];
    const { combat } = r.etat.combats[cle];
    if (combat.resultat) { jouer(contenu, r, { type: 'fin_combat', joueur: r.etat.ordreJoueurs[0], cle }); continue; }
    const acteur = combat.combattants.find((c) => c.id === combat.enAttente)!;
    const action = choisirActionIA(contenu, combat, rngRobot, acteur);
    jouer(contenu, r, { type: 'combat', joueur: acteur.joueurId!, cle, action });
  }
  throw new Error('Combat sans fin');
}

/** Avance une scène (groupe ou individuelle) jusqu'à sa fin. */
export function finirScene(contenu: Contenu, r: Robot, cle: string, joueurs: string[], choixPrefere = 0) {
  for (let garde = 0; garde < 500; garde++) {
    finirCombats(contenu, r);
    if (r.etat.donjon && cle === 'groupe') { explorerDonjon(contenu, r); continue; }
    const n = noeudCourant(contenu, r.etat, cle);
    if (!n) return;
    // un personnage interroge un héros : seul son joueur répond (première réponse proposée)
    const parole = r.etat.scenes[cle]?.parole;
    if (parole) { jouer(contenu, r, { type: 'repondre', joueur: r.etat.heros[parole.heros].joueurId, cle, index: parole.reponses[0] }); continue; }
    // pari partagé : le robot ne mise pas (choixPrefere = 0) ou mise (choixPrefere ≥ 1), s'il en a les moyens
    if (r.etat.scenes[cle]?.pari && n.pari) {
      const minimum = partMinimaleDePari(r.etat, cle, n.pari.mise);
      for (const j of joueursDuPari(r.etat, cle)) {
        if (!r.etat.scenes[cle]?.pari || r.etat.scenes[cle].pari![j] !== undefined) continue;
        const h = r.etat.heros[r.etat.joueurs[j].herosId!];
        jouer(contenu, r, { type: 'parier', joueur: j, cle, mise: choixPrefere >= 1 && h.or >= minimum });
      }
      continue;
    }
    const visibles = choixVisibles(contenu, r.etat, cle).filter((c) => c.possible);
    if (visibles.length) {
      const c = visibles[Math.min(choixPrefere, visibles.length - 1)];
      for (const j of joueurs) {
        if (!r.etat.scenes[cle] || noeudCourant(contenu, r.etat, cle) !== n) break;
        jouer(contenu, r, { type: 'choisir', joueur: j, cle, index: c.index });
      }
    } else if (n.suite) jouer(contenu, r, { type: 'continuer', joueur: joueurs[0], cle });
    else throw new Error(`Scène bloquée : ${r.etat.scenes[cle].sceneId} / ${r.etat.scenes[cle].noeud}`);
  }
  throw new Error('Scène sans fin');
}

/** Explore le donjon : va vers l'événement non fait le plus proche, puis vers la sortie. */
export function explorerDonjon(contenu: Contenu, r: Robot) {
  for (let garde = 0; garde < 3000 && r.etat.donjon; garde++) {
    finirCombats(contenu, r);
    const dj = r.etat.donjon;
    if (!dj) return;
    const d = contenu.donjons[dj.id];
    const aCle = listeHeros(r.etat).some((h) => h.inventaire['cle-crypte'] > 0);
    const aSceau = listeHeros(r.etat).some((h) => h.inventaire['sceau-cendre'] > 0);
    const cibles = aSceau
      ? d.evenements.filter((e) => e.type === 'sortie')
      : d.evenements.filter((e) => ['combat', 'coffre'].includes(e.type) && !dj.faits.includes(e.id));
    const chemin = plusCourtChemin(contenu, dj.id, dj.x, dj.y, cibles.map((e) => [e.x, e.y] as [number, number]), aCle);
    if (!chemin || chemin.length === 0) throw new Error('Donjon : aucun chemin');
    const [nx, ny] = chemin[0];
    jouer(contenu, r, { type: 'donjon_deplacer', joueur: r.etat.meneur!, dx: nx - dj.x, dy: ny - dj.y });
  }
}

function plusCourtChemin(contenu: Contenu, id: string, x: number, y: number, cibles: [number, number][], aCle: boolean): [number, number][] | null {
  const k = (a: number, b: number) => `${a},${b}`;
  const viens = new Map<string, string | null>([[k(x, y), null]]);
  const file: [number, number][] = [[x, y]];
  const estCible = (a: number, b: number) => cibles.some(([cx, cy]) => cx === a && cy === b) && !(a === x && b === y);
  while (file.length) {
    const [cx, cy] = file.shift()!;
    if (estCible(cx, cy)) {
      const chemin: [number, number][] = [];
      let cur: string | null = k(cx, cy);
      while (cur && cur !== k(x, y)) { const [a, b] = cur.split(',').map(Number); chemin.unshift([a, b]); cur = viens.get(cur)!; }
      return chemin;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (viens.has(k(nx, ny))) continue;
      const t = caseDonjon(contenu, id, nx, ny);
      if (['mur', 'vide', 'eau', 'colonne'].some((m) => t.startsWith(m))) continue;
      if (t.startsWith('porte-verrouillee') && !aCle) continue;
      viens.set(k(nx, ny), k(cx, cy));
      file.push([nx, ny]);
    }
  }
  // cas particulier : la sortie est la case de départ et on y est déjà → s'écarter puis revenir
  if (cibles.some(([cx, cy]) => cx === x && cy === y)) return [[x + 1, y], [x, y]];
  return null;
}

/** Joue le prologue de chaque réincarné. */
export function jouerPrologues(contenu: Contenu, r: Robot) {
  for (const h of listeHeros(r.etat).filter((x) => x.origine === 'reincarne')) {
    for (const id of ['prologue-6-ans', 'prologue-10-ans', 'prologue-14-ans', 'prologue-17-ans']) {
      jouer(contenu, r, { type: 'lancer_scene', joueur: h.joueurId, scene: id });
      finirScene(contenu, r, h.id, [h.joueurId]);
    }
  }
}

/** Valide le temps libre en cours (chaque joueur choisit Entraînement + Relation avec Aveline si possible). */
export function finirTempsLibre(contenu: Contenu, r: Robot) {
  const tl = r.etat.tempsLibre;
  if (!tl || tl.resultats) return;
  for (const h of listeHeros(r.etat)) {
    const n = contenu.config.ellipses.activites_temps_libre + (h.don === 'croissance-acceleree' ? 1 : 0);
    const acts = r.etat.compagnonsRencontres.includes('aveline')
      ? [{ activite: 'entrainement' }, { activite: 'relation', compagnon: 'aveline' }]
      : [{ activite: 'entrainement' }, { activite: 'guilde' }];
    while (acts.length < n) acts.push({ activite: 'entrainement' });
    jouer(contenu, r, { type: 'temps_libre', joueur: h.joueurId, activites: acts });
  }
}

/** Lance une scène de groupe disponible et la joue. */
export function jouerSceneGroupe(contenu: Contenu, r: Robot, id: string, choixPrefere = 0) {
  finirTempsLibre(contenu, r);
  const s = contenu.scenes[id];
  dormirJusquaLHistoire(contenu, r, id);
  const dispo = (x: string) => sceneEstDisponible(contenu, r.etat, contenu.scenes[x], listeHeros(r.etat)[0].id);
  const lancer = (x: string) => {
    jouer(contenu, r, { type: 'lancer_scene', joueur: r.etat.ordreJoueurs[0], scene: x });
    finirScene(contenu, r, 'groupe', r.etat.ordreJoueurs, choixPrefere);
  };
  // Quête à étapes : on joue d'abord les étapes qui précèdent cette scène, puis celles qui la suivent (retour à la Guilde…)
  const etapes = (s.quete ? contenu.quetes[s.quete].etapes : []).map((e) => e.scene).filter((x): x is string => !!x && contenu.scenes[x]?.type === 'groupe');
  const rang = etapes.indexOf(id);
  if (!dispo(id)) for (const x of etapes.slice(0, Math.max(0, rang))) if (dispo(x)) lancer(x);
  if (!dispo(id)) throw new Error(`Scène indisponible : ${id}`);
  lancer(id);
  if (rang >= 0 && contenu.quetes[s.quete!].type !== 'principale') for (const x of etapes.slice(rang + 1)) if (dispo(x)) lancer(x);
  finirTempsLibre(contenu, r);
}

/** Si la scène attend une date, tout le groupe dort à l'auberge jusqu'à cette date (puis choisit ses activités). */
export function dormirJusquaLHistoire(contenu: Contenu, r: Robot, sceneId: string) {
  const d = contenu.scenes[sceneId].disponible_si?.date_min;
  if (!d || versJour(contenu, d) <= r.etat.jour) return;
  dormirHistoire(contenu, r);
}

/** Tout le groupe dort à l'auberge jusqu'à la prochaine date attendue par l'histoire. */
export function dormirHistoire(contenu: Contenu, r: Robot) {
  // les scènes terminées restent affichées tant qu'on ne les a pas quittées
  for (const cle of Object.keys(r.etat.scenes)) {
    if (r.etat.scenes[cle].noeud === '__fin__') jouer(contenu, r, { type: 'quitter_scene', joueur: cle === 'groupe' ? r.etat.ordreJoueurs[0] : r.etat.heros[cle].joueurId, cle });
  }
  const [premier, ...autres] = r.etat.ordreJoueurs;
  jouer(contenu, r, { type: 'proposer_repos', joueur: premier, histoire: true });
  for (const j of autres) if (r.etat.repos) jouer(contenu, r, { type: 'repondre_repos', joueur: j, accepte: true });
  finirTempsLibre(contenu, r);
  if (r.etat.tempsLibre?.resultats) jouer(contenu, r, { type: 'valider_temps_libre', joueur: premier });
}