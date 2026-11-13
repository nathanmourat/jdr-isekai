/**
 * Textes d'aide calculés par le moteur : ce que fait chaque caractéristique,
 * et ce que fait chaque compétence POUR UN HÉROS DONNÉ (dégâts, soins, durées, origine).
 * L'interface affiche ces chiffres ; elle n'en invente aucun.
 */
import type { Contenu } from '../contenu/types';
import type { Competence } from '../contenu/schemas';
import { caracsTotales, type Carac, type Caracs, type Heros } from './personnage';
import { valeurs, vrai } from './outils';

/** Nom complet et effet réel de chaque caractéristique (voir CONCEPTION § 3.2 et 3.3). */
export const AIDE_CARACS: Record<Carac, { nom: string; effet: string }> = {
  FOR: { nom: 'Force', effet: 'augmente les dégâts des attaques et des compétences de corps à corps qui utilisent la Force (+5 % par point).' },
  AGI: { nom: 'Agilité', effet: "fait agir plus tôt, toucher plus souvent (+2 % par point d'écart avec la cible), esquiver, et réussir plus de coups critiques (+0,5 % par point)." },
  INT: { nom: 'Intelligence', effet: "augmente les dégâts des sorts et des compétences qui utilisent l'Intelligence (+5 % par point)." },
  VIT: { nom: 'Vitalité', effet: 'donne des points de vie (+5 PV par point) et réduit les dégâts physiques reçus.' },
  ESP: { nom: 'Esprit', effet: 'donne du mana (+3 par point), le fait revenir plus vite, renforce les soins et réduit les dégâts magiques reçus.' },
  CHA: { nom: 'Charisme', effet: 'donne de la « présence » en combat (±1 % de dégâts infligés et subis par point au-dessus ou au-dessous de 10) et aide dans les dialogues et le commerce.' },
};

export const NOMS_ELEMENTS: Record<string, string> = {
  physique: 'physique', feu: 'feu', glace: 'glace', foudre: 'foudre', sacre: 'sacré', ombre: 'ombre', poison: 'poison', arcane: 'arcane',
};
export const NOMS_CIBLES: Record<string, string> = {
  ennemi: 'un ennemi', tous_ennemis: 'tous les ennemis', ennemi_aleatoire: 'un ennemi au hasard', allie: 'un allié',
  allie_ko: 'un allié K.O.', tous_allies: 'tout le groupe', soi: 'soi-même',
};
const NOMS_ETATS_AIDE: Record<string, string> = {
  brulure: 'brûlure', poison: 'poison', gel: 'gel (agit plus tard)', immobilise: 'immobilisé (perd son tour)', sommeil: 'sommeil', peur: 'peur (peut perdre son tour)',
  silence: 'silence (plus de compétences)', provoque: 'provoqué', marque: 'marqué (subit plus de dégâts)', furtif: 'invisible', bonus_degats: 'dégâts augmentés',
  bonus_defense: 'défense augmentée', bonus_initiative: 'initiative augmentée', bonus_precision: 'précision augmentée', malus_defense: 'défense réduite',
  regeneration: 'régénération', garde: 'en garde', expose: 'exposé', affaibli: 'affaibli (frappe moins fort)',
};

/** Ce dont on a besoin pour chiffrer une compétence : un héros hors combat, ou un combattant. */
export interface SujetChiffres { caracs: Caracs; attaque: { stat: Carac; puissance: number } }

export function sujetHeros(contenu: Contenu, h: Heros): SujetChiffres {
  const cl = contenu.classes[h.classe];
  let puissance = cl.attaque.puissance;
  for (const slot of valeurs(h.equipement)) {
    const o = vrai(slot) ? contenu.objets[slot] : null;
    puissance += o?.bonus?.puissance ?? 0;
  }
  return { caracs: caracsTotales(contenu, h), attaque: { stat: cl.attaque.stat, puissance } };
}

export interface ChiffresCompetence {
  cout: number;
  recharge: number;
  cible: string;
  /** Élément des dégâts (texte), ou null s'il n'y a pas de dégâts. */
  element: string | null;
  /** Dégâts estimés sur une cible moyenne (sans critique), min et max ; null si la compétence ne blesse pas. */
  degats: [number, number] | null;
  soin: number | null;
  /** Chance de toucher contre une cible de même Agilité ; null si la compétence ne vise pas d'ennemi. */
  toucher: number | null;
  /** Effets en phrases courtes, avec leurs chiffres et leur durée. */
  effets: string[];
}

/** Réduction d'une « cible moyenne » (Vitalité 10, Esprit 10, sans armure) : sert seulement à donner un ordre de grandeur. */
const REDUCTION_MOYENNE = 100 / 120;

function fourchette(contenu: Contenu, net: number): [number, number] {
  const v = contenu.config.combat.variance_degats;
  return [Math.max(1, Math.round(net * (1 - v))), Math.max(1, Math.round(net * (1 + v)))];
}

const tours = (n: number) => `${n} tour${n > 1 ? 's' : ''}`;

/** Chiffres d'une compétence pour ce sujet, au rang donné. Hors combat : contre une cible moyenne. */
export function chiffresCompetence(contenu: Contenu, s: SujetChiffres, comp: Competence, rang: number, maitrise = 0): ChiffresCompetence {
  const k = contenu.config.combat;
  const m = contenu.config.maitrise;
  const facteurRang = (1 + 0.1 * (rang - 1)) * (1 + m.degats_par_rang * maitrise);
  // « Plus c'est puissant, moins c'est sûr » : −1 point par point de mana au-delà des 5 premiers (voir chanceToucher dans combat.ts)
  const toucher = Math.min(k.toucher_max, Math.max(k.toucher_min, k.toucher_base - Math.min(k.toucher_malus_max, Math.max(0, comp.cout - k.toucher_mana_gratuit) * k.toucher_malus_par_mana) + m.toucher_par_rang * maitrise));
  const presence = 1 + 0.01 * (s.caracs.CHA - 10);
  const res: ChiffresCompetence = {
    cout: comp.cout, recharge: comp.recharge, cible: NOMS_CIBLES[comp.cible] ?? comp.cible,
    element: null, degats: null, soin: null, toucher: null, effets: [],
  };
  for (const ef of comp.effets) {
    if (ef.type === 'degats') {
      const net = ef.puissance * facteurRang * (1 + s.caracs[ef.stat] / 20) * presence * REDUCTION_MOYENNE * ef.coups;
      const f = fourchette(contenu, net);
      res.degats = res.degats === null ? f : [res.degats[0] + f[0], res.degats[1] + f[1]];
      res.element ??= NOMS_ELEMENTS[ef.element] ?? ef.element;
      res.toucher ??= toucher;
      if (ef.coups > 1) res.effets.push(`${ef.coups} coups`);
      if (ef.critique_garanti) res.effets.push('coup critique garanti');
      if (vrai(ef.executer_sous_pourcent)) res.effets.push(`dégâts doublés si la cible a moins de ${Math.round(ef.executer_sous_pourcent * 100)} % de ses PV`);
      if (vrai(ef.cout_pv_pourcent)) res.effets.push(`coûte ${Math.round(ef.cout_pv_pourcent * 100)} % de tes PV`);
    } else if (ef.type === 'soin') {
      res.soin = Math.round(ef.puissance * facteurRang * (1 + s.caracs[ef.stat] / 20));
    } else if (ef.type === 'etat') {
      const surSoi = (ef.cible ?? comp.cible) === 'soi';
      const duree = surSoi ? Math.max(1, ef.duree - 1) : ef.duree;
      let texte = `${NOMS_ETATS_AIDE[ef.etat] ?? ef.etat} pendant ${tours(duree)}`;
      if (ef.etat === 'poison' || ef.etat === 'brulure') {
        const parTour = Math.max(1, Math.round(ef.valeur * facteurRang * (1 + s.caracs[s.attaque.stat] / 40)));
        texte += ` (${parTour} dégâts par tour${ef.cumul_max > 1 ? `, cumulable ${ef.cumul_max} fois` : ''})`;
      } else if (ef.valeur > 0 && ef.valeur < 1) texte += ` (${Math.round(ef.valeur * 100)} %)`;
      if (ef.chance < 1) texte = `${Math.round(ef.chance * 100)} % de chance : ${texte}`;
      res.effets.push(texte);
      if (ef.etat === 'furtif') {
        const net = s.attaque.puissance * (1 + s.caracs[s.attaque.stat] / 20) * presence * REDUCTION_MOYENNE * contenu.config.combat.multiplicateur_critique;
        const f = fourchette(contenu, net);
        res.effets.push(`ta prochaine attaque est un coup critique garanti (environ ${f[0]} à ${f[1]} dégâts)`);
      }
    } else if (ef.type === 'bouclier') res.effets.push(`bouclier de ${Math.round(ef.pourcent_pv * facteurRang * 100)} % des PV`);
    else if (ef.type === 'invocation') res.effets.push(`invoque : ${contenu.ennemis[ef.creature]?.nom ?? ef.creature} pendant ${tours(ef.duree)}`);
    else if (ef.type === 'purifier') res.effets.push('retire les effets négatifs');
    else if (ef.type === 'charge_rune') res.effets.push(`+${ef.nombre} charge${ef.nombre > 1 ? 's' : ''} de rune`);
    else if (ef.type === 'mana') res.effets.push(`rend ${ef.valeur} mana`);
    else if (ef.type === 'soigner_invocations') res.effets.push(`soigne tes invocations de ${Math.round(ef.pourcent * 100)} % de leurs PV`);
    else if (ef.type === 'relever') res.effets.push(`relève un allié K.O. à ${Math.round(ef.pourcent_pv * 100)} % de ses PV`);
  }
  return res;
}

/** D'où vient cette compétence pour ce héros (phrase courte). */
export function origineCompetence(contenu: Contenu, h: Heros, id: string): string {
  const cl = contenu.classes[h.classe];
  const article = 'AEIOUY'.includes(cl.nom.charAt(0)) ? "l'" : cl.nom.startsWith('Lame') ? 'la ' : 'le ';
  const deLaClasse = article === "l'" ? `de l'${cl.nom}` : article === 'la ' ? `de la ${cl.nom}` : `du ${cl.nom}`;
  if (cl.competences.includes(id)) return `compétence de départ ${deLaClasse}`;
  for (const b of cl.branches) for (const k of b.competences) {
    if (k.competence === id) return `apprise au niveau ${k.niveau} (branche ${b.nom})`;
  }
  for (const parent of valeurs(h.variantes)) if (parent.includes(id)) return 'fusion de ton grimoire';
  if (id === 'souffle-draconique') return 'trait de ta race';
  return 'compétence spéciale';
}

/** Phrase complète : « 5 mana, recharge 2 tours · cible : soi-même · … ». */
export function resumeChiffres(k: ChiffresCompetence): string {
  const morceaux: string[] = [];
  morceaux.push(k.cout > 0 ? `${k.cout} mana` : 'gratuit');
  if (k.recharge > 0) morceaux.push(`recharge ${tours(k.recharge)}`);
  morceaux.push(`cible : ${k.cible}`);
  if (k.element !== null) morceaux.push(`élément : ${k.element}`);
  if (k.degats !== null) morceaux.push(`environ ${k.degats[0]} à ${k.degats[1]} dégâts`);
  if (k.toucher !== null) morceaux.push(`${Math.round(k.toucher * 100)} % de chance de toucher`);
  if (k.soin !== null) morceaux.push(`soigne environ ${k.soin} PV`);
  return morceaux.join(' · ');
}
