/**
 * Synchronisation : chaque partie est une liste ordonnée d'actions.
 * Le canal (local ou en ligne) stocke cette liste et prévient quand de nouvelles actions arrivent.
 */
import type { Action, EtatPartie } from '../moteur/partie';

export interface InfosPartie {
  id: string;
  nom: string;
  code: string;
  mode: 'local' | 'en-ligne';
  creeeLe: string;
}

export interface DonneesPartie { infos: InfosPartie; depart: EtatPartie; actions: Action[] }

export interface Canal {
  readonly infos: InfosPartie;
  /** Identifiant du joueur sur cet appareil (un seul en ligne ; plusieurs possibles en local). */
  readonly joueurParDefaut: string;
  charger(): Promise<{ depart: EtatPartie; actions: Action[] }>;
  envoyer(action: Action): Promise<void>;
  /** Appelé avec la liste complète des actions dès qu'elle change. Renvoie une fonction pour arrêter d'écouter. */
  ecouter(cb: (actions: Action[]) => void): () => void;
  fermer(): void;
}

export function genererCode(): string {
  const lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1 (confusions)
  const t = new Uint32Array(6);
  crypto.getRandomValues(t);
  return Array.from(t, (v) => lettres[v % lettres.length]).join('');
}

export function genererId(): string {
  return crypto.randomUUID();
}
