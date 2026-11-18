/**
 * Carnet des phrases que l'IA de combat a mal comprises (point 8 de l'amélioration de l'IA, 18/11) :
 * gardé sur l'appareil seulement (localStorage), jamais dans l'état de la partie, jamais envoyé.
 * Le tiroir « Partie » permet de le copier pour enrichir le corpus après une séance de test.
 */
export interface EntreeCarnet {
  date: string;
  texte: string;
  /** ce que l'IA a fait ou répondu */
  compris: string;
  statut: 'incomprise' | 'impossible' | 'corrigee' | 'question';
}

const CLE = 'velmaris:carnet-ia';
const MAX = 200;

export function lireCarnet(): EntreeCarnet[] {
  try {
    const brut = localStorage.getItem(CLE);
    const l = brut ? (JSON.parse(brut) as EntreeCarnet[]) : [];
    return Array.isArray(l) ? l : [];
  } catch { return []; }
}

export function noterDansCarnet(e: Omit<EntreeCarnet, 'date'>) {
  try {
    const l = lireCarnet();
    l.push({ ...e, date: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    localStorage.setItem(CLE, JSON.stringify(l.slice(-MAX)));
  } catch { /* stockage indisponible : le carnet n'est simplement pas tenu */ }
}

export function viderCarnet() {
  try { localStorage.removeItem(CLE); } catch { /* rien à faire */ }
}

/** Texte à copier : une ligne par phrase, facile à relire et à recopier dans le corpus. */
export function exporterCarnet(): string {
  const noms: Record<EntreeCarnet['statut'], string> = { incomprise: 'incomprise', impossible: 'impossible', corrigee: 'corrigée par le joueur', question: 'question posée' };
  return lireCarnet().map((e) => `${e.date} | ${noms[e.statut]} | « ${e.texte} » → ${e.compris}`).join('\n');
}
