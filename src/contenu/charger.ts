/**
 * Chargement et vérification de tout le contenu du jeu.
 *
 * Chaque fichier YAML de `content/` peut contenir une ou plusieurs de ces clés :
 *   config, classe, races, dons, ennemis, rencontres, objets, compagnon,
 *   regions, pnj, scenes, quetes, donjons, contrats, activites
 * Les listes de tous les fichiers sont fusionnées. Ajouter du contenu = ajouter un fichier.
 */
import { parse } from 'yaml';
import type { z } from 'zod';
import {
  zActivite, zClasse, zCompagnon, zConfig, zContrat, zDon, zDonjon, zEnnemi, zObjet, zPnj, zQuete, zRace,
  zRegion, zRencontre, zScene,
  type Activite, type Classe, type Compagnon, type Competence, type Condition, type Config, type Consequence,
  type Contrat, type Don, type Donjon, type Ennemi, type Objet, type Pnj, type Quete, type Race, type Region,
  type Rencontre, type Scene,
} from './schemas';

export type { Contenu } from './types';
import type { Contenu } from './types';

export class ErreurContenu extends Error {
  constructor(public erreurs: string[]) {
    super(`Le contenu du jeu contient ${erreurs.length} erreur(s) :\n - ` + erreurs.join('\n - '));
    this.name = 'ErreurContenu';
  }
}

function formaterErreurZod(fichier: string, quoi: string, err: z.ZodError): string[] {
  return err.issues.map((i) => {
    const chemin = i.path.length ? i.path.join('.') : '(racine)';
    return `${fichier} › ${quoi} › champ « ${chemin} » : ${traduire(i.message)}`;
  });
}

function traduire(message: string): string {
  return message
    .replace(/^Invalid input: expected (\w+), received (\w+)$/, 'valeur invalide (attendu : $1, reçu : $2)')
    .replace(/^Invalid input$/, 'valeur invalide')
    .replace(/^Invalid option: expected one of (.*)$/, 'valeur non autorisée (valeurs possibles : $1)')
    .replace(/^Required$/, 'champ obligatoire manquant')
    .replace(/^Too small.*$/, 'valeur ou liste trop petite')
    .replace(/^Too big.*$/, 'valeur ou liste trop grande');
}

/**
 * @param fichiers dictionnaire { chemin du fichier : texte YAML }
 */
export function chargerContenu(fichiers: Record<string, string>): Contenu {
  const erreurs: string[] = [];
  const c: Contenu = {
    config: undefined as unknown as Config,
    classes: {}, competences: {}, races: {}, dons: {}, ennemis: {}, rencontres: {}, objets: {}, compagnons: {},
    regions: {}, pnj: {}, scenes: {}, quetes: {}, donjons: {}, contrats: {}, activites: {},
  };

  const ajouter = <T extends { id: string }>(
    fichier: string, cle: string, valeur: unknown, schema: z.ZodType<T>, cible: Record<string, T>,
  ) => {
    const liste = Array.isArray(valeur) ? valeur : [valeur];
    liste.forEach((brut, i) => {
      const r = schema.safeParse(brut);
      const nom = (brut as { id?: string })?.id ?? `${cle}[${i}]`;
      if (!r.success) { erreurs.push(...formaterErreurZod(fichier, nom, r.error)); return; }
      if (cible[r.data.id]) erreurs.push(`${fichier} › identifiant « ${r.data.id} » déjà utilisé ailleurs (${cle})`);
      cible[r.data.id] = r.data;
    });
  };

  for (const [fichier, texte] of Object.entries(fichiers).sort(([a], [b]) => a.localeCompare(b))) {
    let doc: Record<string, unknown>;
    try {
      doc = (parse(texte) ?? {}) as Record<string, unknown>;
    } catch (e) {
      erreurs.push(`${fichier} › YAML illisible : ${(e as Error).message.split('\n')[0]}`);
      continue;
    }
    for (const [cle, valeur] of Object.entries(doc)) {
      switch (cle) {
        case 'config': {
          const r = zConfig.safeParse(valeur);
          if (r.success) c.config = r.data; else erreurs.push(...formaterErreurZod(fichier, 'config', r.error));
          break;
        }
        case 'classe': case 'classes': ajouter(fichier, cle, valeur, zClasse, c.classes); break;
        case 'races': ajouter(fichier, cle, valeur, zRace, c.races); break;
        case 'dons': ajouter(fichier, cle, valeur, zDon, c.dons); break;
        case 'ennemis': ajouter(fichier, cle, valeur, zEnnemi, c.ennemis); break;
        case 'rencontres': ajouter(fichier, cle, valeur, zRencontre, c.rencontres); break;
        case 'objets': ajouter(fichier, cle, valeur, zObjet, c.objets); break;
        case 'compagnon': case 'compagnons': ajouter(fichier, cle, valeur, zCompagnon, c.compagnons); break;
        case 'regions': ajouter(fichier, cle, valeur, zRegion, c.regions); break;
        case 'pnj': ajouter(fichier, cle, valeur, zPnj, c.pnj); break;
        case 'scene': case 'scenes': ajouter(fichier, cle, valeur, zScene, c.scenes); break;
        case 'quetes': ajouter(fichier, cle, valeur, zQuete, c.quetes); break;
        case 'donjons': ajouter(fichier, cle, valeur, zDonjon, c.donjons); break;
        case 'contrats': ajouter(fichier, cle, valeur, zContrat, c.contrats); break;
        case 'activites': ajouter(fichier, cle, valeur, zActivite, c.activites); break;
        default: erreurs.push(`${fichier} › clé inconnue « ${cle} » (clés possibles : config, classe, races, dons, ennemis, rencontres, objets, compagnon, regions, pnj, scenes, quetes, donjons, contrats, activites)`);
      }
    }
  }

  if (!c.config) erreurs.push('Aucun fichier ne contient la clé « config » (content/config/campagne.yaml manquant ?)');

  // Index des compétences
  for (const classe of Object.values(c.classes)) {
    for (const comp of classe.competences_detail) {
      if (c.competences[comp.id]) erreurs.push(`Classe ${classe.id} › compétence « ${comp.id} » définie deux fois`);
      c.competences[comp.id] = comp;
    }
  }

  if (erreurs.length === 0) erreurs.push(...verifierReferences(c));
  if (erreurs.length) throw new ErreurContenu(erreurs);
  return c;
}

/** Vérifie que tout ce qui est cité existe bien (compétences, ennemis, scènes, objets…). */
function verifierReferences(c: Contenu): string[] {
  const e: string[] = [];
  const cfg = c.config;

  for (const cl of Object.values(c.classes)) {
    const total = Object.values(cl.caracteristiques).reduce((a, b) => a + b, 0);
    if (total !== cfg.personnage.total_caracteristiques) e.push(`Classe ${cl.id} › total des caractéristiques = ${total} (doit être ${cfg.personnage.total_caracteristiques})`);
    for (const id of cl.competences) if (!c.competences[id]) e.push(`Classe ${cl.id} › compétence « ${id} » introuvable`);
    for (const b of cl.branches) for (const x of b.competences) if (!c.competences[x.competence]) e.push(`Classe ${cl.id} › branche ${b.id} › compétence « ${x.competence} » introuvable`);
    for (const comp of cl.competences_detail) for (const ef of comp.effets) if (ef.type === 'invocation' && !c.ennemis[ef.creature]) e.push(`Compétence ${comp.id} › créature « ${ef.creature} » introuvable dans les ennemis`);
  }
  for (const r of Object.values(c.races)) {
    const somme = Object.values(r.modificateurs).reduce((a, b) => a + (b ?? 0), 0);
    const libre = r.modificateurs_libres ? r.modificateurs_libres.plus - r.modificateurs_libres.moins : 0;
    if (somme + libre !== 0) e.push(`Race ${r.id} › la somme des modificateurs vaut ${somme + libre} (doit valoir 0)`);
  }
  for (const r of Object.values(c.rencontres)) {
    for (const en of r.ennemis) if (!c.ennemis[en.id]) e.push(`Rencontre ${r.id} › ennemi « ${en.id} » introuvable`);
    for (const id of r.renforts) if (!c.ennemis[id]) e.push(`Rencontre ${r.id} › renfort « ${id} » introuvable`);
  }
  for (const en of Object.values(c.ennemis)) for (const o of en.recompenses.objets) if (!c.objets[o.id]) e.push(`Ennemi ${en.id} › objet « ${o.id} » introuvable`);
  for (const co of Object.values(c.compagnons)) {
    for (const liste of Object.values(co.cadeaux)) for (const o of liste) if (!c.objets[o]) e.push(`Compagnon ${co.id} › cadeau « ${o} » introuvable dans les objets`);
    if (co.quete && !c.quetes[co.quete]) e.push(`Compagnon ${co.id} › quête « ${co.quete} » introuvable`);
  }
  for (const reg of Object.values(c.regions)) for (const l of reg.lieux) {
    for (const o of l.boutique) if (!c.objets[o]) e.push(`Lieu ${l.id} › objet de boutique « ${o} » introuvable`);
    for (const p of l.pnj) if (!c.pnj[p.id] && !c.compagnons[p.id]) e.push(`Lieu ${l.id} › PNJ « ${p.id} » introuvable`);
    if (l.disponible_si) verifierCondition(c, `Lieu ${l.id}`, l.disponible_si, e);
  }
  const lieux = new Set(Object.values(c.regions).flatMap((r) => r.lieux.map((l) => l.id)));
  for (const s of Object.values(c.scenes)) {
    const ou = `Scène ${s.id}`;
    if (!s.noeuds[s.debut]) e.push(`${ou} › nœud de départ « ${s.debut} » introuvable`);
    if (s.lieu && !lieux.has(s.lieu)) e.push(`${ou} › lieu « ${s.lieu} » introuvable`);
    if (s.quete && !c.quetes[s.quete]) e.push(`${ou} › quête « ${s.quete} » introuvable`);
    if (s.disponible_si) verifierCondition(c, ou, s.disponible_si, e);
    for (const [nid, n] of Object.entries(s.noeuds)) {
      const lien = (cible: string | undefined, quoi: string) => { if (cible && !s.noeuds[cible]) e.push(`${ou} › nœud ${nid} › ${quoi} vers « ${cible} » introuvable`); };
      lien(n.suite, 'suite');
      if (n.combat) { lien(n.combat.victoire, 'victoire'); lien(n.combat.defaite, 'défaite'); if (!c.rencontres[n.combat.rencontre]) e.push(`${ou} › nœud ${nid} › rencontre « ${n.combat.rencontre} » introuvable`); }
      if (n.donjon) { lien(n.donjon.sortie, 'sortie de donjon'); if (!c.donjons[n.donjon.id]) e.push(`${ou} › nœud ${nid} › donjon « ${n.donjon.id} » introuvable`); }
      if (!n.fin && !n.suite && !n.combat && !n.donjon && n.choix.length === 0) e.push(`${ou} › nœud ${nid} › impasse : ni choix, ni suite, ni combat, ni « fin: true »`);
      for (const r of n.repliques) {
        if (r.qui !== 'narrateur' && r.qui !== 'heros' && r.qui !== 'meneur' && !c.pnj[r.qui] && !c.compagnons[r.qui]) e.push(`${ou} › nœud ${nid} › personnage « ${r.qui} » introuvable`);
        if (r.si) verifierCondition(c, ou, r.si, e);
      }
      for (const eff of n.effets) verifierConsequence(c, `${ou} › nœud ${nid}`, eff, e);
      for (const ch of n.choix) {
        lien(ch.aller, 'choix');
        if (ch.test) { lien(ch.test.reussite, 'test réussi'); lien(ch.test.echec, 'test raté'); }
        if (ch.si) verifierCondition(c, ou, ch.si, e);
        for (const eff of ch.effets) verifierConsequence(c, `${ou} › nœud ${nid}`, eff, e);
        if (!ch.aller && !ch.test) e.push(`${ou} › nœud ${nid} › le choix « ${ch.texte} » ne mène nulle part (aller ou test)`);
      }
    }
  }
  for (const q of Object.values(c.quetes)) for (const et of q.etapes) if (et.scene && !c.scenes[et.scene]) e.push(`Quête ${q.id} › étape ${et.id} › scène « ${et.scene} » introuvable`);
  for (const d of Object.values(c.donjons)) {
    const largeur = d.carte[0].length;
    d.carte.forEach((ligne, y) => {
      if (ligne.length !== largeur) e.push(`Donjon ${d.id} › ligne ${y} de longueur ${ligne.length} (attendu ${largeur})`);
      for (const ch of ligne) if (!d.legende[ch]) e.push(`Donjon ${d.id} › caractère « ${ch} » absent de la légende`);
    });
    for (const ev of d.evenements) {
      if (ev.rencontre && !c.rencontres[ev.rencontre]) e.push(`Donjon ${d.id} › événement ${ev.id} › rencontre « ${ev.rencontre} » introuvable`);
      if (ev.scene && !c.scenes[ev.scene]) e.push(`Donjon ${d.id} › événement ${ev.id} › scène « ${ev.scene} » introuvable`);
      for (const o of ev.objets) if (!c.objets[o]) e.push(`Donjon ${d.id} › événement ${ev.id} › objet « ${o} » introuvable`);
    }
  }
  for (const ct of Object.values(c.contrats)) {
    if (ct.rencontre && !c.rencontres[ct.rencontre]) e.push(`Contrat ${ct.id} › rencontre « ${ct.rencontre} » introuvable`);
    for (const o of ct.recompenses.objets) if (!c.objets[o]) e.push(`Contrat ${ct.id} › objet « ${o} » introuvable`);
  }
  return e;
}

function verifierCondition(c: Contenu, ou: string, cond: Condition, e: string[]) {
  const liste = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  for (const r of liste(cond.race)) if (!c.races[r]) e.push(`${ou} › condition › race « ${r} » introuvable`);
  for (const r of liste(cond.classe)) if (!c.classes[r]) e.push(`${ou} › condition › classe « ${r} » introuvable`);
  for (const id of Object.keys(cond.affinite_min ?? {})) if (!c.compagnons[id]) e.push(`${ou} › condition › compagnon « ${id} » introuvable`);
  for (const id of Object.keys(cond.affinite_palier ?? {})) if (!c.compagnons[id]) e.push(`${ou} › condition › compagnon « ${id} » introuvable`);
  if (cond.objet && !c.objets[cond.objet]) e.push(`${ou} › condition › objet « ${cond.objet} » introuvable`);
  for (const q of Object.keys(cond.quete_etape ?? {})) if (!c.quetes[q]) e.push(`${ou} › condition › quête « ${q} » introuvable`);
  for (const sous of cond.ou ?? []) verifierCondition(c, ou, sous, e);
}

function verifierConsequence(c: Contenu, ou: string, eff: Consequence, e: string[]) {
  const liste = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  for (const o of liste(eff.objet)) if (!c.objets[o]) e.push(`${ou} › objet « ${o} » introuvable`);
  for (const id of Object.keys(eff.affinite ?? {})) if (!c.compagnons[id]) e.push(`${ou} › affinité › compagnon « ${id} » introuvable`);
  if (eff.recruter && !c.compagnons[eff.recruter]) e.push(`${ou} › recruter › compagnon « ${eff.recruter} » introuvable`);
  if (eff.quete && !c.quetes[eff.quete.id]) e.push(`${ou} › quête « ${eff.quete.id} » introuvable`);
  if (eff.quete && c.quetes[eff.quete.id] && !c.quetes[eff.quete.id].etapes.some((x) => x.id === eff.quete!.etape)) e.push(`${ou} › quête « ${eff.quete.id} » › étape « ${eff.quete.etape} » introuvable`);
  if (eff.terminer_quete && !c.quetes[eff.terminer_quete]) e.push(`${ou} › quête « ${eff.terminer_quete} » introuvable`);
}
