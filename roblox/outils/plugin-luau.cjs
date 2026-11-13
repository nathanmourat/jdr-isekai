/**
 * Extension du traducteur TypeScriptToLua pour Roblox :
 * Luau n'a pas d'opérateurs binaires (&, |, ^, <<, >>, >>>, ~) ; on les remplace par la bibliothèque bit32.
 * Les résultats sont égaux à ceux de JavaScript modulo 2^32 (le moteur normalise toujours avec >>> 0).
 *
 * Corrige aussi les conditions « a ? b : c » : traduites en « if a then b else c » sans parenthèses,
 * elles avalaient la suite du calcul (ex. « x * if c then a else b + 0.5 »). On les met entre parenthèses.
 */
const ts = require('typescript');
const lua = require('typescript-to-lua');

const OPS = {
  [ts.SyntaxKind.AmpersandToken]: 'band',
  [ts.SyntaxKind.BarToken]: 'bor',
  [ts.SyntaxKind.CaretToken]: 'bxor',
  [ts.SyntaxKind.LessThanLessThanToken]: 'lshift',
  [ts.SyntaxKind.GreaterThanGreaterThanToken]: 'arshift',
  [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: 'rshift',
};
const COMPOSES = [
  ts.SyntaxKind.AmpersandEqualsToken, ts.SyntaxKind.BarEqualsToken, ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken, ts.SyntaxKind.GreaterThanGreaterThanEqualsToken, ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
];

function appel(nom, args, noeud) {
  return lua.createCallExpression(lua.createTableIndexExpression(lua.createIdentifier('bit32'), lua.createStringLiteral(nom)), args, noeud);
}

/** @type {import('typescript-to-lua').Plugin} */
module.exports = {
  visitors: {
    [ts.SyntaxKind.BinaryExpression]: (noeud, contexte) => {
      const op = noeud.operatorToken.kind;
      if (COMPOSES.includes(op)) throw new Error(`Opérateur binaire composé non pris en charge pour Roblox (écrire « x = x ^ y ») : ${noeud.getText()}`);
      const nom = OPS[op];
      if (!nom) return contexte.superTransformExpression(noeud);
      return appel(nom, [contexte.transformExpression(noeud.left), contexte.transformExpression(noeud.right)], noeud);
    },
    [ts.SyntaxKind.ConditionalExpression]: (noeud, contexte) => {
      const res = contexte.superTransformExpression(noeud);
      return lua.isConditionalExpression(res) ? lua.createParenthesizedExpression(res, noeud) : res;
    },
    [ts.SyntaxKind.PrefixUnaryExpression]: (noeud, contexte) => {
      if (noeud.operator !== ts.SyntaxKind.TildeToken) return contexte.superTransformExpression(noeud);
      return appel('bnot', [contexte.transformExpression(noeud.operand)], noeud);
    },
  },
};
