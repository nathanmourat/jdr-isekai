/**
 * État de l'interface : la partie ouverte, les joueurs de cet appareil, l'envoi des actions.
 * L'état de la partie est recalculé à partir de la liste des actions (même moteur que les tests).
 */
import type { Contenu } from '../contenu/charger';
import { contenuNavigateur } from '../contenu/navigateur';
import { appliquer, ErreurAction, jourPeutPasser, type Action, type EtatPartie } from '../moteur/partie';
import { creerSauvegarde } from '../sauvegarde/migrations';
import { genererId, type Canal } from '../sync/types';
import { calculerGains, type Gain } from './gains';
import { synchroniser } from '../sync/rejeu';

type SansJoueur = Action extends infer A ? (A extends Action ? Omit<A, 'joueur'> & { joueur?: string } : never) : never;

function lireLocaux(partie: string): string[] {
  try { return JSON.parse(localStorage.getItem(`velmaris:locaux:${partie}`) ?? '[]'); } catch { return []; }
}
function lireOption(cle: string): boolean {
  try { return localStorage.getItem(cle) === '1'; } catch { return false; }
}
function ecrireLocaux(partie: string, l: string[]) {
  localStorage.setItem(`velmaris:locaux:${partie}`, JSON.stringify(l));
}

class Jeu {
  contenu: Contenu | null = null;
  erreurContenu = $state<string | null>(null);
  canal = $state.raw<Canal | null>(null);
  etat = $state.raw<EtatPartie | null>(null);
  depart: EtatPartie | null = null;
  actions: Action[] = [];
  joueursLocaux = $state<string[]>([]);
  joueurActif = $state<string>('');
  erreur = $state<string | null>(null);
  /** Gains et pertes des dernières actions reçues (notifications courtes), avec un numéro unique. */
  gains = $state<(Gain & { id: number })[]>([]);
  private numeroGain = 0;
  info = $state<string | null>(null);
  chargement = $state(false);
  /** Nombre d'entrées du journal déjà vues par le joueur actif (résumé « pendant votre absence »). */
  journalVu = $state(0);
  /** Combats de scène dont le joueur a lu l'introduction (affichage seulement, propre à cet appareil). */
  combatsVus = $state<string[]>([]);
  /** Propositions impossibles par tour (« combat:tour:acteur » → nombre), règle des 3 essais. */
  essais = $state<Record<string, number>>({});
  /** Option « Animations rapides » : raccourcit le suspense et les délais du combat (propre à cet appareil). */
  animationsRapides = $state(lireOption('velmaris:animations-rapides'));
  changerAnimationsRapides(v: boolean) {
    this.animationsRapides = v;
    try { localStorage.setItem('velmaris:animations-rapides', v ? '1' : '0'); } catch { /* stockage indisponible */ }
  }
  private arreter: (() => void) | null = null;
  /** Minuteur des jours : temps de jeu actif cumulé, et moment de la dernière action reçue. */
  private tempsActifMs = 0;
  private derniereActivite = 0;
  private minuteur: ReturnType<typeof setInterval> | null = null;
  private envoiEnCours = Promise.resolve();

  constructor() {
    try { this.contenu = contenuNavigateur(); } catch (e) { this.erreurContenu = (e as Error).message; }
  }

  async ouvrir(canal: Canal) {
    this.fermer();
    this.chargement = true;
    try {
      const { depart, actions } = await canal.charger();
      this.depart = depart;
      this.actions = [];
      this.etat = depart;
      this.canal = canal;
      this.recevoir(actions);
      let locaux = canal.infos.mode === 'local' ? lireLocaux(canal.infos.id) : [];
      // sauvegarde importée sur un autre appareil : cet appareil reprend tous les joueurs de la partie
      if (!locaux.length && canal.infos.mode === 'local' && this.etat?.ordreJoueurs.length) locaux = [...this.etat.ordreJoueurs];
      if (!locaux.length) locaux = [canal.joueurParDefaut];
      if (canal.infos.mode === 'en-ligne') locaux = [canal.joueurParDefaut];
      this.joueursLocaux = locaux;
      if (canal.infos.mode === 'local') ecrireLocaux(canal.infos.id, locaux);
      this.joueurActif = locaux[0];
      this.journalVu = Number(localStorage.getItem(this.cleJournal()) ?? '0');
      this.arreter = canal.ecouter((a) => this.recevoir(a));
      localStorage.setItem('velmaris:derniere', JSON.stringify(canal.infos));
      this.tempsActifMs = 0;
      this.derniereActivite = 0;
      this.minuteur = setInterval(() => this.battement(), Jeu.BATTEMENT_MS);
      // présence : les joueurs de cet appareil sont présents
      for (const j of this.joueursLocaux) if (this.etat?.joueurs[j] && !this.etat.joueurs[j].present) await this.envoyer({ type: 'presence', joueur: j, present: true });
    } finally {
      this.chargement = false;
    }
  }

  static readonly BATTEMENT_MS = 15_000;

  /**
   * Les jours avancent en jouant : 1 jour toutes les `minutes_par_jour` minutes de jeu actif.
   * Un seul appareil envoie l'action (celui du premier joueur présent de la partie) ; les autres la rejouent.
   * Sans action depuis `inactivite_minutes`, le temps ne compte plus. Le minuteur ne change jamais de mois.
   */
  private battement() {
    const etat = this.etat;
    if (!this.contenu || !etat || !this.canal) return;
    const cfg = this.contenu.config.jours_temps_reel;
    if (Date.now() - this.derniereActivite > cfg.inactivite_minutes * 60_000) return;
    const responsable = etat.ordreJoueurs.find((j) => etat.joueurs[j].present && etat.joueurs[j].herosId);
    if (!responsable || !this.joueursLocaux.includes(responsable)) return;
    this.tempsActifMs += Jeu.BATTEMENT_MS;
    if (this.tempsActifMs < cfg.minutes_par_jour * 60_000) return;
    this.tempsActifMs = 0;
    if (!jourPeutPasser(this.contenu, etat)) return;
    // envoi discret : un refus (jour déjà passé, par exemple) ne doit pas afficher d'erreur au joueur
    const action: Action = { type: 'jour_passe', joueur: responsable, jour: etat.jour };
    try { appliquer(this.contenu, etat, action); } catch { return; }
    const canal = this.canal;
    this.envoiEnCours = this.envoiEnCours.then(() => canal.envoyer(action)).catch(() => undefined);
  }

  fermer() {
    if (this.minuteur) clearInterval(this.minuteur);
    this.minuteur = null;
    this.arreter?.();
    this.arreter = null;
    this.canal?.fermer();
    this.canal = null;
    this.etat = null;
    this.depart = null;
    this.actions = [];
  }

  /**
   * Met l'état à jour avec le journal partagé. Si une action est arrivée au milieu du journal (réseau plus lent
   * chez un camarade), tout est rejoué depuis le départ : aucune action n'est jamais perdue (test 3, point 10).
   */
  private recevoir(toutes: Action[]) {
    if (!this.contenu || !this.depart) return;
    if (toutes.length === this.actions.length && toutes.every((a, i) => a === this.actions[i])) return;
    const nouvelles = toutes.slice(this.actions.length);
    // une action d'un joueur (pas le simple passage d'un jour) compte comme du jeu actif
    if (nouvelles.some((a) => a.type !== 'jour_passe' && a.type !== 'presence')) this.derniereActivite = Date.now();
    const avant = this.etat;
    const { etat } = synchroniser(this.contenu, this.depart, this.etat, this.actions, toutes);
    // notifications de gain : pas au chargement d'une partie (on ne rejoue pas les anciens gains)
    if (avant && this.actions.length > 0) {
      const nouveaux = calculerGains(this.contenu, avant, etat).map((g) => ({ ...g, id: ++this.numeroGain }));
      if (nouveaux.length) this.gains = [...this.gains, ...nouveaux].slice(-8);
    }
    this.actions = toutes.slice();
    this.etat = etat;
  }

  /** Délai avant d'annoncer une connexion lente, et nombre d'essais d'envoi. */
  static readonly ATTENTE_ENVOI_MS = 5000;
  static readonly ESSAIS_ENVOI = 3;

  /**
   * Vérifie l'action avec le moteur, puis l'envoie. Renvoie false (et affiche l'erreur) si elle est refusée.
   * L'écran n'avance PAS ici : il avance quand l'action revient du journal partagé (recevoir), pour tout le monde.
   * Si l'envoi échoue, il est retenté automatiquement (3 essais), avec un message clair.
   */
  async envoyer(action: Action): Promise<boolean> {
    if (!this.contenu || !this.etat || !this.canal) return false;
    try {
      appliquer(this.contenu, this.etat, action);
    } catch (e) {
      if (e instanceof ErreurAction) { this.erreur = e.message; return false; }
      throw e;
    }
    this.erreur = null;
    const canal = this.canal;
    const essayer = async () => {
      for (let essai = 1; ; essai++) {
        const lent = setTimeout(() => { this.info = 'Connexion lente : votre action est en cours d’envoi…'; }, Jeu.ATTENTE_ENVOI_MS);
        try {
          await canal.envoyer(action);
          clearTimeout(lent);
          if (essai > 1 || this.info?.startsWith('Connexion lente')) this.info = null;
          return;
        } catch (e) {
          clearTimeout(lent);
          if (essai >= Jeu.ESSAIS_ENVOI) throw new Error(`Action non envoyée (${(e as Error).message}). Vérifiez la connexion, puis réessayez.`);
          this.info = `Envoi impossible, nouvel essai (${essai + 1}/${Jeu.ESSAIS_ENVOI})…`;
          await new Promise((ok) => setTimeout(ok, 1500 * essai));
        }
      }
    };
    // les envois sont faits l'un après l'autre, dans l'ordre
    const p = this.envoiEnCours.then(essayer);
    this.envoiEnCours = p.catch(() => undefined);
    try { await p; return true; } catch (e) { this.info = null; this.erreur = (e as Error).message; return false; }
  }

  /** Raccourci : action au nom du joueur actif (ou d'un autre joueur de cet appareil). */
  agir(a: SansJoueur) {
    return this.envoyer({ ...a, joueur: a.joueur ?? this.joueurActif } as Action);
  }

  ajouterJoueurLocal(): string {
    const id = genererId();
    this.joueursLocaux = [...this.joueursLocaux, id];
    if (this.canal?.infos.mode === 'local') ecrireLocaux(this.canal.infos.id, this.joueursLocaux);
    this.joueurActif = id;
    return id;
  }

  changerJoueur(id: string) {
    this.joueurActif = id;
    this.journalVu = Number(localStorage.getItem(this.cleJournal()) ?? '0');
  }

  marquerJournalVu() {
    if (!this.etat) return;
    this.journalVu = this.etat.journal.length;
    localStorage.setItem(this.cleJournal(), String(this.journalVu));
  }

  private cleJournal() {
    return `velmaris:journal:${this.canal?.infos.id}:${this.joueurActif}`;
  }

  get monHeros() {
    const j = this.etat?.joueurs[this.joueurActif];
    return j?.herosId ? this.etat!.heros[j.herosId] : null;
  }

  exporter(): string {
    if (!this.depart) throw new Error('Aucune partie ouverte');
    const s = creerSauvegarde(this.depart, this.actions, new Date().toISOString());
    return JSON.stringify({ ...s, infos: this.canal?.infos });
  }
}

export const jeu = new Jeu();
