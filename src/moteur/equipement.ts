/**
 * Équipement : règles d'équipement (niveau, classe, armes mythiques uniques), effets spéciaux et pouvoirs uniques.
 * Catalogue et règles validés par le groupe : equipements/CONCEPTION-EQUIPEMENTS.md.
 *
 * Effets spéciaux (rareté Rare et plus) : critique, précision, résistance à un élément, touche élémentaire
 * (l'attaque de base ajoute un coup d'un élément), mana max, vigueur (PV max en %).
 * Pouvoirs uniques (10 légendaires + 6 mythiques) : décrits en texte dans le contenu, codés ici par id d'objet.
 *
 * Ce fichier est traduit en Luau pour Roblox : pas de regex, conditions explicites (voir src/moteur/outils.ts).
 */
import type { Contenu } from '../contenu/types';
import type { Objet } from '../contenu/schemas';
import type { Heros } from './personnage';
import { valeurs, vrai } from './outils';

export type ElementEquipement = 'physique' | 'feu' | 'glace' | 'foudre' | 'sacre' | 'ombre' | 'poison' | 'arcane';

/** Ce que l'équipement porté apporte en combat. */
export interface BonusEquipement {
  critique: number;
  precision: number;
  mana: number;
  /** PV max en plus, en fraction (0,1 = +10 %) */
  vigueur: number;
  resistances: Partial<Record<ElementEquipement, number>>;
  touches: { element: ElementEquipement; puissance: number }[];
  /** ids des objets portés qui ont un pouvoir unique */
  pouvoirs: string[];
}

/** Pouvoirs uniques codés (id de l'objet → description courte, pour les tests et l'interface). */
export const POUVOIRS: Record<string, string> = {
  velgraive: 'Commence chaque combat avec 1 charge de rune.',
  ysgarde: 'Les sorts de zone coûtent 15 % de mana en moins.',
  nyxaliel: 'Les invocations commencent le combat avec 20 % de PV en plus.',
  murmure: 'La première attaque du combat est toujours un coup critique.',
  solenne: 'Le héros subit 10 % de dégâts en moins.',
  prisme: 'Les objets de soin et les bombes sont 25 % plus efficaces.',
  kestrevane: "L'attaque touche toujours, même un ennemi caché.",
  lumenae: 'Les soins du héros rendent 15 % de PV en plus.',
  drakhaar: 'Sang de dragon donne son plein effet dès 50 % de PV.',
  melisande: 'Refrain dure 1 tour de plus.',
  'aube-premiere': 'Une fois par combat, relève un allié K.O. avec 30 % de ses PV.',
  'brise-monde': 'Chaque ennemi vaincu par le porteur lui rend 10 % de ses PV max.',
  'nuit-premiere': 'Les coups critiques infligent × 2 au lieu de × 1,5.',
  lointain: "25 % de chances de tirer une seconde flèche sur un autre ennemi.",
  'il-du-voile': 'Les tirs ignorent 30 % de la défense et des résistances de la cible.',
  ylvarae: 'Les compétences coûtent 20 % de mana en moins.',
};

/** Couleurs des raretés (gris, vert, bleu, violet, or, rouge), pour les interfaces. */
export const COULEURS_RARETE: Record<string, string> = {
  commun: '#b8b8b8',
  'peu-commun': '#5fc95f',
  rare: '#4a9bff',
  epique: '#b26bff',
  legendaire: '#f2b53a',
  mythique: '#ff4a4a',
};

export const NOMS_RARETE: Record<string, string> = {
  commun: 'Commun',
  'peu-commun': 'Peu commun',
  rare: 'Rare',
  epique: 'Épique',
  legendaire: 'Légendaire',
  mythique: 'Mythique',
};

export function bonusVide(): BonusEquipement {
  return { critique: 0, precision: 0, mana: 0, vigueur: 0, resistances: {}, touches: [], pouvoirs: [] };
}

/** Additionne les effets de l'équipement porté par un héros. */
export function bonusEquipement(contenu: Contenu, h: Heros): BonusEquipement {
  const b = bonusVide();
  for (const slot of valeurs(h.equipement)) {
    if (!vrai(slot)) continue;
    const o = contenu.objets[slot];
    if (o === undefined) continue;
    for (const e of o.effets_equipement ?? []) {
      const v = e.valeur ?? 0;
      if (e.effet === 'critique') b.critique += v;
      else if (e.effet === 'precision') b.precision += v;
      else if (e.effet === 'mana') b.mana += v;
      else if (e.effet === 'vigueur') b.vigueur += v;
      else if (e.effet === 'resistance' && e.element !== undefined) {
        const el = e.element as ElementEquipement;
        b.resistances[el] = (b.resistances[el] ?? 0) + v;
      } else if (e.effet === 'touche' && e.element !== undefined) b.touches.push({ element: e.element as ElementEquipement, puissance: e.puissance ?? 0 });
    }
    if (vrai(o.pouvoir_unique) && POUVOIRS[o.id] !== undefined) b.pouvoirs.push(o.id);
  }
  return b;
}

/** Raison pour laquelle le héros ne peut pas équiper l'objet (undefined : il peut). */
export function problemeEquipement(contenu: Contenu, h: Heros, o: Objet): string | undefined {
  if (o.type !== 'equipement' || o.emplacement === undefined) return "Cet objet ne s'équipe pas";
  if (o.niveau !== undefined && h.niveau < o.niveau) return `Niveau ${o.niveau} requis`;
  if (o.classes !== undefined && o.classes.length > 0 && !o.classes.includes(h.classe)) {
    return `Réservé à : ${o.classes.map((c) => contenu.classes[c]?.nom ?? c).join(', ')}`;
  }
  return undefined;
}

/** Nombre d'exemplaires d'un objet dans la partie (inventaires et équipement de tous les héros). */
export function exemplaires(heros: Heros[], objet: string): number {
  let n = 0;
  for (const h of heros) {
    n += h.inventaire[objet] ?? 0;
    for (const slot of valeurs(h.equipement)) if (slot === objet) n++;
  }
  return n;
}

/** Description des effets d'un objet, en français (fiche, boutique, Roblox). */
export function texteEffets(o: Objet): string[] {
  const res: string[] = [];
  const pct = (v: number) => `${Math.round(v * 100)} %`;
  const b = o.bonus;
  if (b !== undefined) {
    if (b.puissance !== 0) res.push(`+${b.puissance} puissance`);
    if (b.armure !== 0) res.push(`+${b.armure} armure`);
    for (const [k, v] of [['FOR', b.caracs.FOR], ['AGI', b.caracs.AGI], ['INT', b.caracs.INT], ['VIT', b.caracs.VIT], ['ESP', b.caracs.ESP], ['CHA', b.caracs.CHA]] as const) {
      if (v !== undefined && v !== 0) res.push(`${v > 0 ? '+' : ''}${v} ${k}`);
    }
  }
  for (const e of o.effets_equipement ?? []) {
    const v = e.valeur ?? 0;
    if (e.effet === 'critique') res.push(`+${pct(v)} critique`);
    else if (e.effet === 'precision') res.push(`+${pct(v)} précision`);
    else if (e.effet === 'mana') res.push(`+${v} mana max`);
    else if (e.effet === 'vigueur') res.push(`+${pct(v)} PV max`);
    else if (e.effet === 'resistance') res.push(`résistance ${e.element ?? ''} ${pct(v)}`);
    else if (e.effet === 'touche') res.push(`touche de ${e.element ?? ''} (+${e.puissance ?? 0})`);
  }
  return res;
}
