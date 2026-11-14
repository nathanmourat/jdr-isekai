import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';

/**
 * Test 3, point 13 : un choix qui fait payer (payer, acheter, racheter, soudoyer, pourboire, « (N or) ») doit vraiment
 * retirer de l'or (effet `or` négatif ou `miser`). « Offrir » n'est pas compté quand on offre autre chose que de l'or
 * (un objet retiré du sac, de l'énergie…). Un choix qui coûte de l'or doit aussi demander assez d'or (`si: { or_min }`).
 */
const c = contenuDisque();
const PAYER = /\b(pay|achet|rachet|soudoy|pourboire)|\(\d+ or\)/i;
/** Répliques prononcées qui parlent de payer sans que le héros paie (ex. « leur faire payer au centuple »). */
const EXCEPTIONS = new Set(['nd-acheteurs']);

type ChoixLu = { ou: string; texte: string; effets: { or?: number; miser?: number }[]; si?: { or_min?: number }; contrat: boolean };
function tousLesChoix(): ChoixLu[] {
  const l: ChoixLu[] = [];
  for (const s of Object.values(c.scenes)) for (const [nid, n] of Object.entries(s.noeuds)) for (const ch of n.choix) l.push({ ou: `${s.id} › ${nid}`, texte: ch.texte, effets: ch.effets, si: ch.si, contrat: false });
  for (const ct of Object.values(c.contrats)) ct.etapes.forEach((e, i) => (e.choix ?? []).forEach((ch) => l.push({ ou: `contrat ${ct.id} › étape ${i + 1}`, texte: ch.texte, effets: ch.effets ?? [], contrat: true })));
  return l;
}
const cout = (x: ChoixLu) => x.effets.reduce((n, e) => n - Math.min(0, e.or ?? 0) + (e.miser ?? 0), 0);

describe('choix payants', () => {
  it('tout choix qui fait payer retire vraiment de l\'or', () => {
    const fautifs = tousLesChoix().filter((x) => PAYER.test(x.texte) && !EXCEPTIONS.has(x.ou.split(' › ')[0]) && cout(x) === 0).map((x) => `${x.ou} : « ${x.texte} »`);
    expect(fautifs, `Choix payants sans effet d'or :\n${fautifs.join('\n')}`).toEqual([]);
  });
  it('un choix de scène qui coûte de l\'or demande assez d\'or et reste visible (grisé) sinon', () => {
    const fautifs = tousLesChoix().filter((x) => !x.contrat && x.effets.some((e) => (e.or ?? 0) < 0) && (x.si?.or_min ?? 0) < cout(x)).map((x) => `${x.ou} : « ${x.texte} » coûte ${cout(x)} or`);
    expect(fautifs, fautifs.join('\n')).toEqual([]);
  });
});
