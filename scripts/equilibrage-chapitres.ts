/**
 * Équilibrage des rencontres d'un chapitre — `npm run equilibrage:chapitres -- 2` (ou 2 3 4…, ou rien pour tous)
 * Pour chaque rencontre du fichier content/ennemis/chapitre-N.yaml, les 10 classes (race humaine) combattent :
 *  - seules, au niveau prévu de la rencontre, avec l'équipement « de maître » du palier du chapitre ;
 *  - à trois (lame runique, guérisseur, arcaniste), pour vérifier l'adaptation au groupe.
 * Cibles (comme le chapitre 1, testé par le groupe) : rencontres ordinaires 85 à 99,5 % de victoires en solo au bon niveau,
 * boss 55 à 95 %. Une rencontre trop dure en solo reste faisable en groupe ou avec un compagnon.
 * Options : --rapide (40 combats par cas au lieu de 150)
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { Objet } from '../src/contenu/schemas';
import { contenuDisque, RACINE } from '../src/contenu/node';
import { pc, tauxVictoire, type HerosSimule } from '../src/moteur/simulation';

const c = contenuDisque();
const rapide = process.argv.includes('--rapide');
const n = rapide ? 40 : 150;
const demandes = process.argv.slice(2).filter((x) => /^\d+$/.test(x)).map(Number);
const fichiers = readdirSync(join(RACINE, 'content/ennemis')).filter((f) => /^chapitre-\d+\.yaml$/.test(f));
const chapitres = (demandes.length ? demandes : fichiers.map((f) => Number(f.match(/\d+/)![0]))).sort();

/** Niveau de départ, palier d'équipement et niveau de fin de chaque chapitre (CONCEPTION § 10). */
const CHAPITRES: Record<number, { debut: number; fin: number; palier: string }> = {
  1: { debut: 1, fin: 8, palier: 'I' }, 2: { debut: 8, fin: 15, palier: 'II' }, 3: { debut: 15, fin: 22, palier: 'III' },
  4: { debut: 22, fin: 28, palier: 'IV' }, 5: { debut: 28, fin: 34, palier: 'V' }, 6: { debut: 34, fin: 40, palier: 'VI' },
};

function interet(classe: string, o: Objet): number {
  const b = o.bonus;
  if (!b) return 0;
  const stat = c.classes[classe].attaque.stat;
  let v = b.puissance * 2 + b.armure / 2;
  for (const [k, x] of Object.entries(b.caracs)) v += (x ?? 0) * (k === stat ? 3 : 1);
  return v;
}

/** Équipement générique « de maître » du palier (le meilleur pour la classe, à chaque emplacement). */
function equipement(classe: string, palier: string, niveau: number): HerosSimule['equipement'] {
  const res: Record<string, string> = {};
  for (const emp of ['arme', 'armure', 'accessoire'] as const) {
    const choix = Object.values(c.objets)
      .filter((o) => o.type === 'equipement' && o.palier === palier && o.emplacement === emp && o.rarete === 'peu-commun' && (o.niveau ?? 1) <= niveau)
      .filter((o) => !o.classes?.length || o.classes.includes(classe))
      .sort((a, b) => interet(classe, b) - interet(classe, a) || a.id.localeCompare(b.id))[0];
    if (choix) res[emp] = choix.id;
  }
  return res;
}

const lignes: string[] = ['# Équilibrage des rencontres par chapitre', '', `${n} combats par cas. Équipement : objets « de maître » du palier du chapitre. Race humaine, don « Œil du Seuil ».`, ''];
for (const ch of chapitres) {
  const def = CHAPITRES[ch];
  const brut = parse(readFileSync(join(RACINE, `content/ennemis/chapitre-${ch}.yaml`), 'utf8')) as { rencontres?: { id: string }[]; ennemis?: { id: string; niveau: number; boss?: boolean }[] };
  const rencontres = (brut.rencontres ?? []).map((r) => c.rencontres[r.id]);
  lignes.push(`## Chapitre ${ch} (niveaux ${def.debut} à ${def.fin}, palier ${def.palier})`, '', '| Rencontre | Niveau | Solo (moyenne) | Classe la plus faible | Classe la plus forte | Groupe de 3 | Verdict |', '|---|---|---|---|---|---|---|');
  for (const r of rencontres) {
    const niveaux = r.ennemis.map((e) => c.ennemis[e.id].niveau);
    const boss = r.ennemis.some((e) => c.ennemis[e.id].boss);
    // niveau des héros : celui de l'ennemi le plus fort, dans les bornes du chapitre
    const niveau = Math.max(def.debut, Math.min(def.fin, Math.max(...niveaux)));
    const parClasse: { nom: string; t: number }[] = [];
    for (const cl of Object.values(c.classes)) {
      const res = tauxVictoire(c, r.id, [{ classe: cl.id, race: 'humain', don: 'oeil-du-seuil', niveau, equipement: equipement(cl.id, def.palier, niveau) }], n, `ch${ch}:${r.id}:${cl.id}`);
      parClasse.push({ nom: cl.nom, t: res.victoires / res.combats });
    }
    const moyenne = parClasse.reduce((a, x) => a + x.t, 0) / parClasse.length;
    parClasse.sort((a, b) => a.t - b.t);
    const groupe = tauxVictoire(c, r.id, ['lame-runique', 'guerisseur', 'arcaniste'].map((cl) => ({ classe: cl, race: 'humain', don: 'oeil-du-seuil', niveau, equipement: equipement(cl, def.palier, niveau) })), n, `ch${ch}:${r.id}:groupe`);
    const tg = groupe.victoires / groupe.combats;
    const [min, max] = boss ? [0.55, 0.95] : [0.85, 0.995];
    const verdict = moyenne < min ? '❌ trop dur' : moyenne > max ? '⚠️ trop facile' : '✅';
    lignes.push(`| ${r.nom}${boss ? ' (boss)' : ''} | ${niveau} | ${pc(moyenne)} | ${parClasse[0].nom} ${pc(parClasse[0].t)} | ${parClasse[parClasse.length - 1].nom} ${pc(parClasse[parClasse.length - 1].t)} | ${pc(tg)} | ${verdict} |`);
    process.stdout.write('.');
  }
  lignes.push('');
}
console.log();
const md = lignes.join('\n');
console.log(md);
mkdirSync(join(RACINE, 'rapports'), { recursive: true });
writeFileSync(join(RACINE, 'rapports', `equilibrage-chapitres${demandes.length ? '-' + demandes.join('-') : ''}.md`), md + '\n');
