/** Chargement du contenu depuis le disque (tests, scripts). Ne pas importer dans le navigateur. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerContenu, type Contenu } from './charger';

export const RACINE = fileURLToPath(new URL('../..', import.meta.url));

export function lireFichiersContenu(dossier = join(RACINE, 'content')): Record<string, string> {
  const res: Record<string, string> = {};
  const parcourir = (d: string) => {
    for (const nom of readdirSync(d)) {
      const p = join(d, nom);
      if (statSync(p).isDirectory()) parcourir(p);
      else if (nom.endsWith('.yaml') || nom.endsWith('.yml')) res['/' + relative(RACINE, p).replaceAll('\\', '/')] = readFileSync(p, 'utf8');
    }
  };
  parcourir(dossier);
  return res;
}

let cache: Contenu | null = null;
export function contenuDisque(): Contenu {
  cache ??= chargerContenu(lireFichiersContenu());
  return cache;
}
