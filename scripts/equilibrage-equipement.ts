/**
 * Effet de l'équipement du palier I sur le chapitre 1 : taux de victoire d'un héros seul (niveau 1, humain)
 * contre les rencontres de référence, sans équipement, avec l'équipement commun, puis « de maître ».
 * Lancer : npm run equilibrage:equipement
 */
import { contenuDisque } from '../src/contenu/node';
import { avancer, combattantHeros, demarrerCombat } from '../src/moteur/combat';
import { creerHeros } from '../src/moteur/personnage';
import { creerRng } from '../src/moteur/rng';
import { RENCONTRES_REFERENCE } from '../src/moteur/simulation';

const c = contenuDisque();
const N = Number(process.argv[2] ?? 300);
/** Arme, tenue et accessoire typiques de chaque classe (mêmes choix que la feuille « Comparaison » du tableur). */
const KIT: Record<string, [string, string, string]> = {
  'lame-runique': ['epee', 'lourde', 'bouclier'], arcaniste: ['baton', 'legere', 'amulette'], invocateur: ['orbe', 'legere', 'amulette'],
  ombre: ['dague', 'intermediaire', 'anneau'], gardien: ['masse', 'lourde', 'bouclier'], alchimiste: ['arbalete', 'intermediaire', 'sacoche'],
  archer: ['arc', 'intermediaire', 'carquois'], guerisseur: ['sceptre', 'legere', 'amulette'], berserker: ['deux-mains', 'lourde', 'talisman'],
  barde: ['instrument', 'intermediaire', 'anneau'],
};
/** Les 7 objets d'origine gardent leur ancien id au palier I. */
const ANCIENS: Record<string, string> = {
  epee: 'epee-courte', dague: 'dague', baton: 'baton-apprenti', arc: 'arc-court', bouclier: 'bouclier-bois', intermediaire: 'armure-cuir', legere: 'robe-mage',
};
const idObjet = (categorie: string, version: 'commun' | 'maitre') => (version === 'maitre' ? `${categorie}-i-maitre` : ANCIENS[categorie] ?? `${categorie}-i`);

function taux(classe: string, version: 'aucun' | 'commun' | 'maitre'): number {
  let victoires = 0, total = 0;
  for (const r of RENCONTRES_REFERENCE) for (let i = 0; i < N; i++) {
    const h = creerHeros(c, { id: 's', joueurId: 'j', nom: 'S', classe, race: 'humain', don: 'oeil-du-seuil', origine: 'invoque', age: 20, anneeCampagne: 1012, niveau: 1 });
    if (version !== 'aucun') {
      const [a, t, x] = KIT[classe];
      h.equipement = { arme: idObjet(a, version), armure: idObjet(t, version), accessoire: idObjet(x, version) };
    }
    const rng = creerRng(`${classe}:${r}:${i}`);
    const combat = demarrerCombat(c, r, [combattantHeros(c, h, false)], rng, 'sim');
    avancer(c, combat, rng);
    total++;
    if (combat.resultat === 'victoire') victoires++;
  }
  return (victoires / total) * 100;
}

const lignes = Object.keys(KIT).map((cl) => ({ cl, sans: taux(cl, 'aucun'), commun: taux(cl, 'commun'), maitre: taux(cl, 'maitre') }));
const moyenne = (k: 'sans' | 'commun' | 'maitre') => lignes.reduce((s, l) => s + l[k], 0) / lignes.length;
const f = (v: number) => `${v.toFixed(1)} %`;
console.log(`Palier I, ${N} combats par rencontre de référence et par classe\n`);
console.log('| Classe | Sans équipement | Commun | De maître |\n|---|---|---|---|');
for (const l of lignes) console.log(`| ${c.classes[l.cl].nom} | ${f(l.sans)} | ${f(l.commun)} | ${f(l.maitre)} |`);
console.log(`| **Moyenne** | ${f(moyenne('sans'))} | ${f(moyenne('commun'))} | ${f(moyenne('maitre'))} |`);
for (const k of ['commun', 'maitre'] as const) {
  const m = moyenne(k);
  const hors = lignes.filter((l) => Math.abs(l[k] - m) > 10);
  console.log(hors.length === 0 ? `\n${k} : toutes les classes à ± 10 points de la moyenne.` : `\n${k} : hors de ± 10 points : ${hors.map((l) => `${c.classes[l.cl].nom} (${(l[k] - m > 0 ? '+' : '') + (l[k] - m).toFixed(1)})`).join(', ')}`);
}
