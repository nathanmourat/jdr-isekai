/** Chargement du contenu dans le navigateur : Vite intègre tous les fichiers YAML au moment de la construction. */
import { chargerContenu, type Contenu } from './charger';

const fichiers = import.meta.glob('/content/**/*.{yaml,yml}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

let cache: Contenu | null = null;
export function contenuNavigateur(): Contenu {
  cache ??= chargerContenu(fichiers);
  return cache;
}
