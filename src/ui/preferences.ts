/**
 * Préférences d'affichage propres à cet appareil (barre repliée, cadre du lieu, panneau du combat…).
 * Elles ne font pas partie de l'état de la partie : elles ne sont ni envoyées aux autres joueurs, ni sauvegardées avec la partie.
 * Le stockage du navigateur peut être indisponible (navigation privée, réglages) : on retombe alors sur la valeur par défaut.
 */
const PREFIXE = 'velmaris:affichage:';

export function lirePreference(cle: string, defaut: boolean): boolean {
  try {
    const v = localStorage.getItem(PREFIXE + cle);
    return v === null ? defaut : v === '1';
  } catch {
    return defaut;
  }
}

export function ecrirePreference(cle: string, valeur: boolean) {
  try { localStorage.setItem(PREFIXE + cle, valeur ? '1' : '0'); } catch { /* stockage indisponible : préférence non retenue */ }
}

/** Variante texte (par exemple : la dernière étape vue, pour savoir si elle a changé). */
export function lireTexte(cle: string): string | null {
  try { return localStorage.getItem(PREFIXE + cle); } catch { return null; }
}

export function ecrireTexte(cle: string, valeur: string) {
  try { localStorage.setItem(PREFIXE + cle, valeur); } catch { /* stockage indisponible */ }
}
