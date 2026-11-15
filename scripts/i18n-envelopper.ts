/**
 * Outil ponctuel : fait passer les textes français de l'interface Roblox (roblox/src/client) par la traduction.
 *  - "Texte" → tr("Texte") ; `Niveau ${n} !` → trf("Niveau {n} !", { n }) ;
 *  - au niveau du module (constantes évaluées une seule fois) : tx("…") (repéré pour la traduction, traduit à l'affichage).
 * Ne touche pas : clés d'objets, comparaisons, case, noms d'instances, attributs, sons, print/warn, motifs Lua.
 * Usage : npx tsx scripts/i18n-envelopper.ts [fichiers…]   (sans argument : tout roblox/src/client)
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

function fichiers(d: string): string[] {
  const r: string[] = [];
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) r.push(...fichiers(p));
    else if (n.endsWith('.ts') && !n.endsWith('.d.ts')) r.push(p);
  }
  return r;
}

const APPELS_EXCLUS = new Set([
  'print', 'warn', 'error', 'FindFirstChild', 'WaitForChild', 'FindFirstChildOfClass', 'FindFirstAncestorOfClass', 'FindFirstChildWhichIsA',
  'GetAttribute', 'SetAttribute', 'GetPropertyChangedSignal', 'IsA', 'GetTagged', 'AddTag', 'HasTag', 'RemoveTag', 'GetService',
  'jouer', 'match', 'gsub', 'find', 'split', 'sub', 'format', 'rep', 'byte', 'lower', 'upper', 'agir', 'commander', 'commandeGroupe',
  'commandeModeration', 'commande', 'tr', 'trf', 'tx', 'trMoteur', 'require', 'Instance', 'Create', 'LoadAnimation', 'GetMarkerReachedSignal',
  'definirLangue', 'date', 'clock', 'changerReglage', 'BindAction', 'UnbindAction', 'invoquer', 'jouerAnim', 'majTutoriel', 'majSons', 'has', 'get', 'set', 'delete',
]);
/** Fonctions d'affichage : même un mot seul y est traduit. */
const APPELS_AFFICHAGE = new Set(['texte', 'bouton', 'choix', 'label', 'btn', 'etiquette', 'notifier', 'champ', 'carte', 'section', 'interrupteur', 'curseur', 'titreFenetre', 'montrerErreur', 'bulle']);
const PROPRIETES_TEXTE = new Set(['Text', 'PlaceholderText', 'ActionText', 'ObjectText', 'titre', 'texte', 'message', 'erreur', 'info']);

/** Ressemble à du français affiché : des lettres, et une espace ou un accent ou une ponctuation de phrase. */
function phrase(s: string): boolean {
  const t = s.trim();
  if (t.length < 2 || !/[a-zà-ÿ]/i.test(t)) return false;
  if (/^[a-z0-9_:.\-/#%^$()[\]*+?]+$/i.test(t)) return /[àâçéèêëîïôûùüÿœ]/i.test(t) && !/[%^$]/.test(t);
  if (/^rbxasset|^https?:/.test(t)) return false;
  return /\s/.test(t) || /[àâçéèêëîïôûùüÿœ«»!?…:]/i.test(t);
}
function motAffichable(s: string): boolean {
  const t = s.trim();
  return t.length >= 1 && /[a-zà-ÿ]/i.test(t) && !/^[a-z0-9_\-]+$/.test(t) && !/^[a-z][A-Za-z0-9_]*$/.test(t);
}

function nomCalcule(e: ts.Expression, deja: Set<string>): string {
  let base = 'v';
  if (ts.isIdentifier(e)) base = e.text;
  else if (ts.isPropertyAccessExpression(e)) base = e.name.text;
  else if (ts.isCallExpression(e) && ts.isIdentifier(e.expression)) base = e.expression.text;
  base = base.replace(/[^A-Za-z0-9_]/g, '') || 'v';
  let n = base;
  let i = 2;
  while (deja.has(n)) n = `${base}${i++}`;
  deja.add(n);
  return n;
}

function traiter(f: string): number {
  const texteSource = readFileSync(f, 'utf8');
  const src = ts.createSourceFile(f, texteSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const remplacements: { debut: number; fin: number; par: string }[] = [];
  const utilise = new Set<string>();

  const contexteExclu = (n: ts.Node): boolean => {
    const p = n.parent;
    if (!p) return true;
    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p)) return true;
    if (ts.isPropertyAssignment(p) && p.name === n) return true;
    if (ts.isElementAccessExpression(p) && p.argumentExpression === n) return true;
    if (ts.isCaseClause(p)) return true;
    if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(p.operatorToken.kind)) return true;
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(p.left) && !PROPRIETES_TEXTE.has(p.left.name.text)) return true;
    if (ts.isTypeReferenceNode(p) || ts.isUnionTypeNode(p)) return true;
    if (ts.isAsExpression(p) || ts.isTypeAssertionExpression(p)) return false;
    // argument d'un appel exclu (noms d'instances, attributs, sons…)
    if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.arguments?.includes(n as ts.Expression)) {
      const ex = p.expression;
      const nom = ts.isIdentifier(ex) ? ex.text : ts.isPropertyAccessExpression(ex) ? ex.name.text : '';
      if (APPELS_EXCLUS.has(nom)) return true;
    }
    // dans un tableau ou un objet passé à un appel exclu, ou une clé d'enregistrement : on laisse
    return false;
  };
  const enAffichage = (n: ts.Node): boolean => {
    let p: ts.Node | undefined = n.parent;
    // remonter les ternaires, parenthèses et ?? jusqu'au vrai parent
    while (p && (ts.isConditionalExpression(p) || ts.isParenthesizedExpression(p) || (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken))) p = p.parent;
    if (!p) return false;
    if (ts.isCallExpression(p)) {
      const ex = p.expression;
      const nom = ts.isIdentifier(ex) ? ex.text : ts.isPropertyAccessExpression(ex) ? ex.name.text : '';
      return APPELS_AFFICHAGE.has(nom);
    }
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(p.left)) return PROPRIETES_TEXTE.has(p.left.name.text);
    if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) return PROPRIETES_TEXTE.has(p.name.text);
    return false;
  };
  const auNiveauModule = (n: ts.Node): boolean => {
    for (let p = n.parent; p; p = p.parent) if (ts.isFunctionLike(p)) return false;
    return true;
  };

  const visiter = (n: ts.Node) => {
    if (ts.isCallExpression(n)) {
      const ex = n.expression;
      const nom = ts.isIdentifier(ex) ? ex.text : ts.isPropertyAccessExpression(ex) ? ex.name.text : '';
      if (nom === 'tr' || nom === 'trf' || nom === 'tx' || nom === 'trMoteur' || nom === 'print' || nom === 'warn') return; // déjà fait / journal développeur
    }
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && !contexteExclu(n)) {
      const t = n.text;
      if (phrase(t) || (enAffichage(n) && motAffichable(t))) {
        const fn = auNiveauModule(n) ? 'tx' : 'tr';
        utilise.add(fn);
        remplacements.push({ debut: n.getStart(), fin: n.getEnd(), par: `${fn}(${JSON.stringify(t)})` });
        return;
      }
    }
    if (ts.isTemplateExpression(n) && !contexteExclu(n)) {
      let modele = n.head.text;
      for (const s of n.templateSpans) modele += '\u0000' + s.literal.text;
      const sansValeurs = modele.replace(/\u0000/g, '');
      if (phrase(sansValeurs) || (enAffichage(n) && /[a-zà-ÿ]{2}/i.test(sansValeurs))) {
        if (auNiveauModule(n)) {
          // rare : on laisse et on signale
          console.warn(`⚠ ${f}:${src.getLineAndCharacterOfPosition(n.getStart()).line + 1} gabarit au niveau du module (à voir à la main)`);
        } else {
          const deja = new Set<string>();
          let t = n.head.text;
          const champs: string[] = [];
          for (const s of n.templateSpans) {
            const nom = nomCalcule(s.expression, deja);
            // l'expression peut contenir des textes à traduire : on la traite récursivement
            const interieur = transformerExpression(s.expression);
            champs.push(nom === interieur ? nom : `${nom}: ${interieur}`);
            t += `{${nom}}` + s.literal.text;
          }
          utilise.add('trf');
          remplacements.push({ debut: n.getStart(), fin: n.getEnd(), par: `trf(${JSON.stringify(t)}, { ${champs.join(', ')} })` });
          return;
        }
      }
    }
    ts.forEachChild(n, visiter);
  };

  /** Renvoie le code d'une expression avec ses textes intérieurs enveloppés (pour les valeurs des gabarits). */
  function transformerExpression(e: ts.Expression): string {
    const debut = e.getStart();
    const avant = remplacements.length;
    visiter(e);
    const internes = remplacements.splice(avant).sort((a, b) => b.debut - a.debut);
    let code = texteSource.slice(debut, e.getEnd());
    for (const r of internes) code = code.slice(0, r.debut - debut) + r.par + code.slice(r.fin - debut);
    return code;
  }

  visiter(src);
  if (!remplacements.length) return 0;
  // appliquer de la fin vers le début (sans chevauchement : un nœud remplacé n'est pas visité plus loin)
  remplacements.sort((a, b) => b.debut - a.debut);
  let sortie = texteSource;
  for (const r of remplacements) sortie = sortie.slice(0, r.debut) + r.par + sortie.slice(r.fin);
  // import
  const noms = [...utilise].sort();
  const imp = sortie.match(/import \{([^}]*)\} from "shared\/langue";\n/);
  if (imp) {
    const existants = imp[1].split(',').map((x) => x.trim()).filter(Boolean);
    const tous = [...new Set([...existants, ...noms])].sort();
    sortie = sortie.replace(imp[0], `import { ${tous.join(', ')} } from "shared/langue";\n`);
  } else {
    const dernier = [...sortie.matchAll(/^import [^;]+;\n/gm)].pop();
    const pos = dernier ? dernier.index! + dernier[0].length : 0;
    sortie = sortie.slice(0, pos) + `import { ${noms.join(', ')} } from "shared/langue";\n` + sortie.slice(pos);
  }
  writeFileSync(f, sortie);
  return remplacements.length;
}

const cibles = process.argv.slice(2).length ? process.argv.slice(2) : fichiers('roblox/src/client');
let total = 0;
for (const f of cibles) {
  const n = traiter(f);
  if (n) console.log(`${String(n).padStart(4)}  ${f}`);
  total += n;
}
console.log(`${total} textes enveloppés.`);
