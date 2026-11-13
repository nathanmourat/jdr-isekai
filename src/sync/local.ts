/**
 * Mode local : la partie est enregistrée dans le navigateur (localStorage).
 * Plusieurs onglets du même navigateur restent synchronisés (BroadcastChannel) :
 * pratique pour tester à plusieurs sur un même ordinateur, ou jouer « à tour de rôle ».
 */
import type { Contenu } from '../contenu/charger';
import { nouvellePartie, type Action } from '../moteur/partie';
import { genererCode, genererId, type Canal, type DonneesPartie, type InfosPartie } from './types';

const PREFIXE = 'velmaris:partie:';
const INDEX = 'velmaris:parties';

function lireIndex(): string[] {
  try { return JSON.parse(localStorage.getItem(INDEX) ?? '[]'); } catch { return []; }
}
function ecrireIndex(ids: string[]) {
  localStorage.setItem(INDEX, JSON.stringify(ids));
}

export function partiesLocales(): InfosPartie[] {
  return lireIndex()
    .map((id) => { try { return (JSON.parse(localStorage.getItem(PREFIXE + id) ?? 'null') as DonneesPartie | null)?.infos; } catch { return null; } })
    .filter((x): x is InfosPartie => !!x)
    .sort((a, b) => b.creeeLe.localeCompare(a.creeeLe));
}

export function identifiantAppareil(): string {
  let id = localStorage.getItem('velmaris:joueur');
  if (!id) { id = genererId(); localStorage.setItem('velmaris:joueur', id); }
  return id;
}

export function creerPartieLocale(contenu: Contenu, nom: string, donnees?: DonneesPartie): InfosPartie {
  const id = genererId();
  const infos: InfosPartie = { id, nom: nom.trim() || 'Nouvelle partie', code: genererCode(), mode: 'local', creeeLe: new Date().toISOString() };
  const d: DonneesPartie = donnees
    ? { ...donnees, infos: { ...infos, nom: donnees.infos?.nom ?? infos.nom } }
    : { infos, depart: nouvellePartie(contenu, id, infos.nom, `${id}:${Date.now()}`), actions: [] };
  localStorage.setItem(PREFIXE + id, JSON.stringify(d));
  ecrireIndex([id, ...lireIndex()]);
  return d.infos;
}

export function supprimerPartieLocale(id: string) {
  localStorage.removeItem(PREFIXE + id);
  ecrireIndex(lireIndex().filter((x) => x !== id));
}

export function donneesLocales(id: string): DonneesPartie | null {
  try { return JSON.parse(localStorage.getItem(PREFIXE + id) ?? 'null'); } catch { return null; }
}

export class CanalLocal implements Canal {
  readonly joueurParDefaut = identifiantAppareil();
  private bc: BroadcastChannel | null;
  private ecouteurs = new Set<(a: Action[]) => void>();

  constructor(public readonly infos: InfosPartie) {
    this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`velmaris:${infos.id}`) : null;
    if (this.bc) this.bc.onmessage = () => this.notifier();
    window.addEventListener('storage', this.surStorage);
  }

  private surStorage = (e: StorageEvent) => { if (e.key === PREFIXE + this.infos.id) this.notifier(); };

  private lire(): DonneesPartie {
    const d = donneesLocales(this.infos.id);
    if (!d) throw new Error('Partie locale introuvable (supprimée ?)');
    return d;
  }

  private notifier() {
    const a = this.lire().actions;
    for (const cb of this.ecouteurs) cb(a);
  }

  async charger() {
    const d = this.lire();
    return { depart: d.depart, actions: d.actions };
  }

  async envoyer(action: Action) {
    const d = this.lire();
    d.actions.push(action);
    try {
      localStorage.setItem(PREFIXE + this.infos.id, JSON.stringify(d));
    } catch {
      throw new Error('Mémoire du navigateur pleine : exportez la sauvegarde puis supprimez d\'anciennes parties.');
    }
    this.bc?.postMessage('nouvelle');
    this.notifier();
  }

  ecouter(cb: (a: Action[]) => void) {
    this.ecouteurs.add(cb);
    return () => this.ecouteurs.delete(cb);
  }

  fermer() {
    this.bc?.close();
    window.removeEventListener('storage', this.surStorage);
    this.ecouteurs.clear();
  }
}
