/**
 * Traductions de la version Roblox (anglais, espagnol, allemand, japonais ; le français est la langue d'origine).
 *
 *   npm run traductions:extraire   relève les textes à traduire et met à jour traductions/ (garde les traductions faites)
 *   npm run traductions:rapport    ce qui est traduit, langue par langue et fichier par fichier
 *   npm run roblox:traductions     exporte vers roblox/src/shared/traductions/<langue>.lua
 *
 * Fichiers (une entrée = un texte français et ses traductions, côte à côte) :
 *   traductions/interface.yaml            textes de l'interface Roblox : tr("…"), trf("…"), tx("…") dans roblox/src
 *   traductions/moteur.yaml               phrases fabriquées par le moteur et l'IA ({1}, {2}… = valeurs)
 *   traductions/contenu/<chemin>.yaml     textes de content/<chemin>.yaml (mêmes règles que shared/langue.ts)
 *   traductions/contenu/_roblox.yaml      textes propres à l'export Roblox (paliers d'amitié…)
 *
 * Règles pour traduire : garder {n}, {heros}, {pseudo}… tels quels ; garder les marques [[seul||groupe]] et
 * {{masculin|féminin}} (avec des formes dans la langue cible) ; garder « ** » et les balises <b>, <font…>.
 * Une entrée « obsolete: true » n'existe plus en français (texte modifié ou supprimé) : on peut la retirer.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import ts from 'typescript';
import YAML from 'yaml';
import { contenuDisque } from '../src/contenu/node';

export const LANGUES = ['en', 'es', 'de', 'ja'] as const;
type Langue = (typeof LANGUES)[number];
interface Entree {
  fr: string;
  en?: string;
  es?: string;
  de?: string;
  ja?: string;
  note?: string;
  obsolete?: boolean;
}

const RACINE = 'traductions';

// Mêmes clés que roblox/src/shared/langue.ts
const CLES_TEXTE = new Set([
  'nom', 'dit', 'description', 'texte', 'titre', 'objectif', 'phrase', 'reussite', 'echec', 'resume', 'bouton',
  'resultat', 'journal', 'combat', 'utilite', 'accueil', 'pouvoir_unique', 'hors_combat', 'role', 'point_fort',
  'point_faible', 'avantage', 'defaut', 'personnalite', 'passe', 'repliques', 'repliques_blessure',
]);
const identifiant = (s: string) => /^[a-z0-9_-]+$/.test(s);

function fichiers(dossier: string, ext: string[]): string[] {
  const res: string[] = [];
  for (const nom of readdirSync(dossier)) {
    const p = join(dossier, nom);
    if (statSync(p).isDirectory()) res.push(...fichiers(p, ext));
    else if (ext.some((e) => nom.endsWith(e))) res.push(p);
  }
  return res.sort();
}

/** Textes d'un objet du contenu, dans l'ordre (les scènes romantiques, absentes de Roblox, sont ignorées). */
export function textesContenu(x: unknown, texte = false, res: string[] = []): string[] {
  if (Array.isArray(x)) {
    for (const v of x) {
      if (typeof v === 'string') {
        if (texte && !identifiant(v)) res.push(v);
      } else textesContenu(v, texte, res);
    }
  } else if (x && typeof x === 'object') {
    if ((x as { romance?: boolean }).romance === true && 'noeuds' in x) return res;
    for (const [k, v] of Object.entries(x)) {
      const t = CLES_TEXTE.has(k);
      if (typeof v === 'string') {
        if (t && !identifiant(v)) res.push(v);
      } else textesContenu(v, t, res);
    }
  }
  return res;
}

// ───────────────────────────── Lecture / écriture ─────────────────────────────

function lire(chemin: string): Entree[] {
  if (!existsSync(chemin)) return [];
  const d = YAML.parse(readFileSync(chemin, 'utf8'));
  return Array.isArray(d) ? d : [];
}

function ecrire(chemin: string, entete: string, entrees: Entree[]) {
  mkdirSync(dirname(chemin), { recursive: true });
  const corps = entrees.length ? YAML.stringify(entrees, { lineWidth: 0 }) : '[]\n';
  writeFileSync(chemin, `# ${entete}\n# Outil : npm run traductions:extraire (ne retire jamais une traduction). Voir scripts/traductions.ts.\n${corps}`);
}

/** Fusionne la liste des textes actuels avec les traductions déjà faites. */
function fusionner(chemin: string, entete: string, actuels: string[]): { nouveaux: number; obsoletes: number } {
  const anciennes = lire(chemin);
  const parFr = new Map(anciennes.map((e) => [e.fr, e]));
  const vus = new Set<string>();
  const res: Entree[] = [];
  let nouveaux = 0;
  for (const fr of actuels) {
    // rien à traduire : vide, ou seulement des balises, des valeurs {x} et des symboles
    if (vus.has(fr) || !/[a-zà-ÿ]{2}/i.test(fr.replace(/<[^>]*>|\{[^}]*\}/g, ''))) continue;
    vus.add(fr);
    const e = parFr.get(fr);
    if (e) {
      delete e.obsolete;
      res.push(e);
    } else {
      res.push({ fr });
      nouveaux++;
    }
  }
  let obsoletes = 0;
  for (const e of anciennes) {
    if (vus.has(e.fr)) continue;
    // une traduction déjà faite n'est jamais jetée : on la marque
    if (LANGUES.some((l) => e[l])) {
      e.obsolete = true;
      res.push(e);
      obsoletes++;
    }
  }
  ecrire(chemin, entete, res);
  return { nouveaux, obsoletes };
}

// ───────────────────────────── Relevé des textes ─────────────────────────────

/** Textes de l'interface : premiers arguments littéraux de tr(), trf(), tx() dans roblox/src. */
function textesInterface(): string[] {
  const res: string[] = [];
  for (const f of fichiers('roblox/src', ['.ts'])) {
    if (f.endsWith('.d.ts')) continue;
    const src = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true);
    const visiter = (n: ts.Node) => {
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && ['tr', 'trf', 'tx'].includes(n.expression.text)) {
        const a = n.arguments[0];
        if (a && (ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a))) res.push(a.text);
      }
      ts.forEachChild(n, visiter);
    };
    visiter(src);
  }
  return res;
}

/**
 * Phrases du moteur et de l'IA : textes littéraux et gabarits (`${x}` devient {1}, {2}…) qui ressemblent à du français
 * affiché (une espace, ou une majuscule). Les identifiants, imports et clés ne sont pas pris.
 */
function textesMoteur(): string[] {
  // l'IA : seulement l'interpréteur (ses réponses s'affichent) ; le corpus d'entraînement reste en français
  return textesCode([...fichiers('src/moteur', ['.ts']), 'src/ia/interpreteur.ts'].filter((f) => !/simulation|rng|roblox/.test(f)));
}

/** Textes du serveur Roblox et des catalogues partagés (invites, bulles, messages, grades, boutique…). */
function textesServeur(): string[] {
  const exclus = /\.d\.ts$|contenu|traductions|moteur|langue\.ts$/;
  return textesCode([...fichiers('roblox/src/server', ['.ts']), ...fichiers('roblox/src/shared', ['.ts'])].filter((f) => !exclus.test(f)), true);
}

/**
 * `strict` (serveur) : un mot seul (« Parler », « Entrer ») n'est pris que s'il va dans une invite ou un texte affiché
 * (ActionText, ObjectText, Text, appel point(…)) ; les autres mots seuls sont des noms de pièces 3D.
 */
function textesCode(liste: string[], strict = false): string[] {
  const res: string[] = [];
  const motSeulAffiche = (n: ts.Node): boolean => {
    let p: ts.Node | undefined = n.parent;
    while (p && (ts.isConditionalExpression(p) || ts.isParenthesizedExpression(p))) p = p.parent;
    if (!p) return false;
    if (ts.isBinaryExpression(p) && ts.isPropertyAccessExpression(p.left)) return ['ActionText', 'ObjectText', 'Text'].includes(p.left.name.text);
    if (ts.isCallExpression(p) && ts.isIdentifier(p.expression)) return ['point', 'tx'].includes(p.expression.text);
    // catalogues : { nom: "Aura" }, listes [« Donjon », …]
    if (ts.isPropertyAssignment(p) && p.initializer === n) return ['nom', 'titre', 'texte', 'description', 'condition'].includes(p.name.getText()) || /^[a-z_]+$/.test(p.name.getText()) && /^[A-ZÀ-Ý]/.test((n as ts.StringLiteral).text) && !['Name', 'type', 'id'].includes(p.name.getText());
    if (ts.isArrayLiteralExpression(p)) return /^[A-ZÀ-Ý]/.test((n as ts.StringLiteral).text);
    return false;
  };
  // pas les noms techniques en un mot « EntreeLieu », « RightFoot », ni les noms de pièces 3D sans espace ni accent
  const affichable = (s: string) => s.trim().length > 1 && /[a-zà-ÿ]/i.test(s) && !/^[A-Z][a-z]+([A-Z][a-z0-9]*)+$/.test(s.trim()) && (/\s/.test(s.trim()) || /^[A-ZÀ-Ý«]/.test(s)) && !/^[a-z0-9_:.\-/]+$/.test(s);
  for (const f of liste) {
    const src = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true);
    const visiter = (n: ts.Node) => {
      if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return;
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
        const p = n.parent;
        const cle = p && (ts.isPropertyAssignment(p) && p.name === n);
        const compare = p && ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind);
        const appel = p && (ts.isCallExpression(p) || ts.isNewExpression(p)) ? p.expression : undefined;
        const nomAppel = appel && (ts.isIdentifier(appel) ? appel.text : ts.isPropertyAccessExpression(appel) ? appel.name.text : '');
        const technique = nomAppel && ['print', 'warn', 'error', 'FindFirstChild', 'WaitForChild', 'GetAttribute', 'SetAttribute', 'GetDataStore', 'Instance', 'IsA'].includes(nomAppel);
        const motSeul = !/[\s\u00a0]/.test(n.text.trim()) && !/[àâçéèêëîïôûùüÿœ!?…:.]/i.test(n.text);
        const journal = /^\[Velmaris\]|_v\d+$|%[a-zA-Z]/.test(n.text);
        if (!cle && !compare && !technique && !journal && !(p && ts.isCaseClause(p)) && affichable(n.text) && (!strict || !motSeul || motSeulAffiche(n))) res.push(n.text);
      } else if (ts.isTemplateExpression(n)) {
        let t = n.head.text;
        n.templateSpans.forEach((s, i) => (t += `{${i + 1}}` + s.literal.text));
        if (affichable(t.replace(/\{\d+\}/g, '')) && !/^\[Velmaris\]/.test(t)) res.push(t);
      }
      ts.forEachChild(n, visiter);
    };
    visiter(src);
  }
  return res;
}

// ───────────────────────────── Commandes ─────────────────────────────

function extraire() {
  let total = { nouveaux: 0, obsoletes: 0 };
  const ajouter = (r: { nouveaux: number; obsoletes: number }) => {
    total = { nouveaux: total.nouveaux + r.nouveaux, obsoletes: total.obsoletes + r.obsoletes };
  };
  const dejaDansFichiers = new Set<string>();
  for (const f of fichiers('content', ['.yaml', '.yml'])) {
    const rel = relative('content', f);
    const textes = textesContenu(YAML.parse(readFileSync(f, 'utf8')));
    textes.forEach((t) => dejaDansFichiers.add(t));
    ajouter(fusionner(join(RACINE, 'contenu', rel), `Textes de content/${rel.replaceAll('\\', '/')}`, textes));
  }
  // textes propres à l'export Roblox (ex. paliers d'affinité renommés pour la version tout public)
  const c = contenuDisque();
  c.config.romance = false;
  const NOMS_AMITIE: Record<string, string> = { amoureuse: 'Amie fidèle', engagee: 'Lien indéfectible' };
  for (const p of c.config.affinite.paliers) if (NOMS_AMITIE[p.id]) p.nom = NOMS_AMITIE[p.id];
  const autres = textesContenu(c).filter((t) => !dejaDansFichiers.has(t));
  ajouter(fusionner(join(RACINE, 'contenu', '_roblox.yaml'), 'Textes propres à la version Roblox (ajoutés à l\'export)', autres));
  ajouter(fusionner(join(RACINE, 'interface.yaml'), 'Textes de l\'interface Roblox (roblox/src : tr, trf, tx)', textesInterface()));
  ajouter(fusionner(join(RACINE, 'moteur.yaml'), 'Phrases du moteur et de l\'IA (src/moteur, src/ia) ; {1}, {2}… = valeurs', textesMoteur()));
  ajouter(fusionner(join(RACINE, 'serveur.yaml'), 'Textes du serveur Roblox et des catalogues partagés (roblox/src/server, roblox/src/shared) ; {1}, {2}… = valeurs', textesServeur()));
  console.log(`Textes relevés : ${total.nouveaux} nouveau(x), ${total.obsoletes} obsolète(s) gardé(s).`);
  rapport(true);
}

function tousLesFichiers(): string[] {
  return existsSync(RACINE) ? fichiers(RACINE, ['.yaml']) : [];
}

function mots(s: string) {
  return s.split(/\s+/).filter(Boolean).length;
}

function rapport(court = false) {
  const lignes: string[] = [];
  const totaux: Record<Langue, { faits: number; total: number; mots: number; motsFaits: number }> = Object.fromEntries(
    LANGUES.map((l) => [l, { faits: 0, total: 0, mots: 0, motsFaits: 0 }]),
  ) as never;
  for (const f of tousLesFichiers()) {
    const e = lire(f).filter((x) => !x.obsolete);
    if (!e.length) continue;
    const parts = LANGUES.map((l) => {
      const faits = e.filter((x) => x[l]).length;
      const t = totaux[l];
      t.faits += faits;
      t.total += e.length;
      for (const x of e) {
        t.mots += mots(x.fr);
        if (x[l]) t.motsFaits += mots(x.fr);
      }
      return `${l} ${Math.round((100 * faits) / e.length)} %`;
    });
    lignes.push(`  ${relative(RACINE, f).padEnd(52)} ${String(e.length).padStart(5)} textes   ${parts.join('  ')}`);
  }
  if (!court) console.log(lignes.join('\n'));
  for (const l of LANGUES) {
    const t = totaux[l];
    console.log(`${l} : ${t.faits}/${t.total} textes (${t.total ? Math.round((100 * t.motsFaits) / t.mots) : 0} % des ${t.mots} mots)`);
  }
}

function exporter() {
  const dossier = 'roblox/src/shared/traductions';
  mkdirSync(dossier, { recursive: true });
  for (const l of LANGUES) {
    const textes: Record<string, string> = {};
    const motifs: [string, string][] = [];
    for (const f of tousLesFichiers()) {
      const moteur = f.endsWith('moteur.yaml') || f.endsWith('serveur.yaml');
      for (const e of lire(f)) {
        const t = e[l];
        if (!t || t === e.fr) continue;
        if (moteur && /\{\d+\}/.test(e.fr)) motifs.push([e.fr, t]);
        else textes[e.fr] = t;
      }
    }
    // les motifs les plus longs d'abord (les plus précis)
    motifs.sort((a, b) => b[0].replace(/\{\d+\}/g, '').length - a[0].replace(/\{\d+\}/g, '').length);
    const json = JSON.stringify({ textes, motifs });
    if (json.includes(']==]')) throw new Error(`Traductions ${l} : « ]==] » interdit.`);
    writeFileSync(join(dossier, `${l}.lua`), `--!nocheck\n-- Fichier GÉNÉRÉ par \`npm run roblox:traductions\` à partir de traductions/. Ne pas modifier à la main.\nreturn [==[${json}]==]\n`);
    console.log(`${l} : ${Object.keys(textes).length} textes, ${motifs.length} modèles de phrases (${(json.length / 1024).toFixed(0)} Ko)`);
  }
}

const commande = process.argv[2];
if (commande === 'extraire') extraire();
else if (commande === 'rapport') rapport();
else if (commande === 'exporter') exporter();
else if (commande !== undefined) {
  console.error('Usage : tsx scripts/traductions.ts extraire | rapport | exporter');
  process.exit(1);
}
