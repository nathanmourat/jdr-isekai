/**
 * Vérifie que le moteur se comporte pareil en JavaScript (web) et en Luau (Roblox).
 *
 * En Luau, seuls `false` et `nil` sont « faux » : 0 et "" sont « vrais ».
 * Ce script repère les conditions (if, ?:, &&, ||, !, while) dont la valeur peut être un nombre ou un texte,
 * et les usages interdits (Object.keys/values/entries non triés, structuredClone, JSON, regex).
 *
 * Usage : npm run roblox:verifier
 */
import ts from 'typescript';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const DOSSIERS = ['src/moteur', 'src/sauvegarde', 'src/ia'];
const IGNORES = new Set(['simulation.ts', 'fichier.ts', 'corpus.ts', 'phrases-test.ts']); // outils propres au web, jamais compilés pour Roblox

const fichiers = DOSSIERS.flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.ts') && !IGNORES.has(f)).map((f) => join(d, f).replaceAll('\\', '/'))); // chemins en « / » aussi sous Windows
const programme = ts.createProgram(fichiers, { strict: true, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, resolveJsonModule: true, skipLibCheck: true });
const types = programme.getTypeChecker();
const problemes: string[] = [];

function risque(t: ts.Type): boolean {
  if (t.isUnion()) return t.types.some(risque);
  const f = t.flags;
  if (f & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return true;
  if (f & (ts.TypeFlags.NumberLike | ts.TypeFlags.StringLike | ts.TypeFlags.BigIntLike)) {
    // un littéral non nul (ex. 3 ou "abc") est vrai dans les deux langages
    if (t.isNumberLiteral()) return t.value === 0;
    if (t.isStringLiteral()) return t.value === '';
    return true;
  }
  return false;
}

/** Liste dont les éléments peuvent être undefined/null (« trous » en Luau). */
function avecTrous(t: ts.Type): boolean {
  if (!types.isArrayType(t)) return false;
  const el = types.getTypeArguments(t as ts.TypeReference)[0];
  if (!el) return false;
  const parts = el.isUnion() ? el.types : [el];
  return parts.some((p) => (p.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)) !== 0);
}

function signaler(n: ts.Node, quoi: string) {
  const sf = n.getSourceFile();
  const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart());
  problemes.push(`${sf.fileName}:${line + 1}:${character + 1} ${quoi} : ${n.getText().slice(0, 80)}`);
}

function condition(e: ts.Expression) {
  e = ts.skipPartiallyEmittedExpressions(e);
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || e.operatorToken.kind === ts.SyntaxKind.BarBarToken)) {
    condition(e.left);
    condition(e.right);
    return;
  }
  if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) return condition(e.operand);
  if (risque(types.getTypeAtLocation(e))) signaler(e, 'condition sur un nombre ou un texte');
}

function visiter(n: ts.Node) {
  if (ts.isIfStatement(n) || ts.isWhileStatement(n) || ts.isDoStatement(n)) condition(n.expression);
  else if (ts.isConditionalExpression(n)) condition(n.condition);
  else if (ts.isForStatement(n) && n.condition) condition(n.condition);
  else if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.ExclamationToken) condition(n.operand);
  else if (ts.isBinaryExpression(n) && (n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || n.operatorToken.kind === ts.SyntaxKind.BarBarToken)) {
    // a || b sur des nombres : en Luau, 0 || 5 vaut 0
    if (risque(types.getTypeAtLocation(n.left))) signaler(n.left, `opérande gauche de ${n.operatorToken.getText()}`);
  } else if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression)) {
    const o = n.expression.text, p = n.name.text;
    if (o === 'Object' && ['keys', 'values', 'entries'].includes(p)) signaler(n, 'ordre non garanti en Luau (utiliser cles/valeurs/entrees de outils.ts)');
    if (o === 'JSON' || o === 'Math' && p === 'imul') signaler(n, 'non disponible en Luau');
  } else if (ts.isIdentifier(n) && /^(Float|Int|Uint)(8|16|32|64)(Clamped)?Array$/.test(n.text)) signaler(n, 'tableau typé absent en Luau (utiliser une liste ordinaire)');
  else if (ts.isIdentifier(n) && n.text === 'structuredClone') signaler(n, 'non disponible en Luau (utiliser copieProfonde)');
  else if (ts.isCallExpression(n) && n.arguments.some((a) => ts.isIdentifier(a) && ['Boolean', 'Number', 'String'].includes(a.text))) signaler(n, 'Boolean/Number/String passés en fonction : absents en Luau (écrire une fonction fléchée)');
  else if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ['map', 'flatMap'].includes(n.expression.name.text) && avecTrous(types.getTypeAtLocation(n))) signaler(n, 'liste pouvant contenir undefined : en Luau, une liste à trous n\'a pas de longueur fiable');
  else if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.CommaToken) signaler(n, 'opérateur virgule : mal traduit en Luau dans une condition (écrire des instructions séparées)');
  else if (n.kind === ts.SyntaxKind.RegularExpressionLiteral) signaler(n, 'expression régulière non disponible en Luau');
  else if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'sort') signaler(n, 'tri non stable en Luau (utiliser trier de outils.ts)');
  ts.forEachChild(n, visiter);
}

for (const sf of programme.getSourceFiles()) if (fichiers.some((f) => sf.fileName.endsWith(f))) visiter(sf);

if (problemes.length) {
  console.log(`${problemes.length} endroit(s) à corriger pour que le moteur se comporte pareil sur Roblox :`);
  for (const p of problemes) console.log(' - ' + p);
  process.exit(1);
}
console.log('Moteur compatible Luau : aucune condition ambiguë ni fonction interdite.');
