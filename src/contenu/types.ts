/**
 * Type du contenu chargé, sans dépendance à zod ni à YAML : le moteur l'importe sur le web comme sur Roblox.
 */
import type {
  Activite, Classe, Compagnon, Competence, Config, Contrat, Don, Donjon, Ennemi, Objet, Pnj, Quete, Race, Region, Rencontre, Scene,
} from './schemas';

export interface Contenu {
  config: Config;
  classes: Record<string, Classe>;
  competences: Record<string, Competence>;
  races: Record<string, Race>;
  dons: Record<string, Don>;
  ennemis: Record<string, Ennemi>;
  rencontres: Record<string, Rencontre>;
  objets: Record<string, Objet>;
  compagnons: Record<string, Compagnon>;
  regions: Record<string, Region>;
  pnj: Record<string, Pnj>;
  scenes: Record<string, Scene>;
  quetes: Record<string, Quete>;
  donjons: Record<string, Donjon>;
  contrats: Record<string, Contrat>;
  activites: Record<string, Activite>;
}
