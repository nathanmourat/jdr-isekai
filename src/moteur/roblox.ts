/**
 * Point d'entrée du moteur pour la version Roblox (compilé en Luau par TypeScriptToLua, voir roblox/).
 * Tout ce qui est exporté ici est utilisable par le serveur Roblox.
 */
export * from './partie';
export * from './combat';
export * from './guide';
export * from './fusions';
export * from './temps';
export * from './personnage';
export * from './affinite';
export * from './rng';
export * from './outils';
export * from './equipement';
export { creerSauvegarde, verifierSauvegarde, ErreurSauvegarde, FORMAT } from '../sauvegarde/migrations';
export { interpreter, propositionsScript, conseiller } from '../ia/interpreteur';
export { normaliser } from '../ia/texte';
export { traits, hachage } from '../ia/texte';
export { predire } from '../ia/classificateur';
