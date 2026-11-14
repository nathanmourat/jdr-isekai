/**
 * Chargement des planches de sprites dans Phaser, et provisoires dessinés quand une planche manque.
 * Formats attendus : voir docs/GRAPHISMES.md § 4.
 */
import Phaser from 'phaser';
import { assetsPresents, couleur, urlAsset } from './assets';

export const COLONNES = 8;
/** Planches d'exploration : 4 colonnes × 4 lignes (bas, gauche, droite, haut). */
export const COLONNES_EXPLORATION = 4;

/**
 * Facteur d'échelle pour afficher une planche à sa taille « logique » quelle que soit sa résolution :
 * une planche HD (cases de 128 au lieu de 64) est affichée à la même taille, avec deux fois plus de détails.
 */
export function echelleCase(scene: Phaser.Scene, cle: string, tailleLogique: number): number {
  if (!scene.textures.exists(cle)) return 1;
  const largeur = scene.textures.get(cle).get(0).width;
  return largeur > 0 ? tailleLogique / largeur : 1;
}
/** Lignes des planches de combat : [nom, nombre d'images]. */
export const LIGNES_HEROS: [string, number][] = [['attente', 4], ['attaque', 6], ['sort', 4], ['touche', 2], ['ko', 3], ['victoire', 4]];
export const LIGNES_ENNEMIS: [string, number][] = [['attente', 4], ['attaque', 6], ['touche', 2], ['ko', 3]];

/** Chemin dans assets/ de la planche de combat d'un combattant (champ « sprite » du moteur). */
export function cheminCombat(sprite: string): string {
  const [type, id] = sprite.split('/');
  if (type === 'heros') return `personnages/heros/${id}/combat`;
  if (type === 'compagnons') return `personnages/compagnes/${id}/combat`;
  // les invocations utilisent la planche du monstre du même nom (bestiaire), retournée côté héros
  if (type === 'invocations') return `ennemis/${id}/combat`;
  return `ennemis/${id}/combat`;
}
export function cheminExploration(classe: string) {
  return `personnages/heros/${classe}/exploration`;
}

/** Charge toutes les images présentes dans assets/ utiles aux scènes Phaser. */
export function prechargerTout(scene: Phaser.Scene, tailleCombat: number, tailleBoss: number, tailleExploration: number) {
  for (const chemin of assetsPresents()) {
    const url = urlAsset(chemin)!;
    if (scene.textures.exists(chemin) || scene.textures.exists(`brut:${chemin}`)) continue;
    if (chemin.endsWith('/combat') || chemin.endsWith('/calque-combat') || chemin.endsWith('/exploration') || chemin.endsWith('/calque-exploration')) {
      // la taille des cases se déduit de la largeur de l'image (8 colonnes en combat, 4 en exploration) au chargement :
      // les planches normales et HD (deux fois plus de pixels) marchent toutes les deux
      scene.load.image(`brut:${chemin}`, url);
    } else if (chemin.startsWith('effets/')) {
      scene.load.spritesheet(chemin, url, { frameWidth: tailleCombat, frameHeight: tailleCombat });
    } else {
      scene.load.image(chemin, url);
    }
  }
  scene.load.once('complete', () => {
    // découpe des planches de combat : 8 colonnes, cases carrées
    for (const chemin of assetsPresents()) {
      const brut = `brut:${chemin}`;
      if (!scene.textures.exists(brut) || scene.textures.exists(chemin)) continue;
      const img = scene.textures.get(brut).getSourceImage() as HTMLImageElement;
      const exploration = chemin.endsWith('exploration');
      const taille = Math.round(img.width / (exploration ? COLONNES_EXPLORATION : COLONNES)) || (exploration ? tailleExploration : tailleCombat);
      scene.textures.addSpriteSheet(chemin, img, { frameWidth: taille, frameHeight: taille });
    }
    void tailleBoss;
  });
}

/** Crée les animations d'une planche de combat (si elle existe). Renvoie true si la planche existe. */
export function creerAnimations(scene: Phaser.Scene, cle: string, lignes: [string, number][]): boolean {
  if (!scene.textures.exists(cle)) return false;
  lignes.forEach(([nom, n], ligne) => {
    const k = `${cle}:${nom}`;
    if (scene.anims.exists(k)) return;
    scene.anims.create({
      key: k,
      frames: scene.anims.generateFrameNumbers(cle, { start: ligne * COLONNES, end: ligne * COLONNES + n - 1 }),
      frameRate: nom === 'attente' ? 5 : 10,
      repeat: nom === 'attente' ? -1 : 0,
    });
  });
  return true;
}

/** Sprite provisoire : silhouette colorée (corps + tête + arme) tournée vers la droite ou la gauche. */
export function textureProvisoire(scene: Phaser.Scene, cle: string, nom: string, taille: number, versDroite: boolean, boss = false): string {
  const k = `provisoire:${cle}:${taille}:${versDroite}`;
  if (scene.textures.exists(k)) return k;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const c = Phaser.Display.Color.HSLToColor(teinte(nom) / 360, 0.5, boss ? 0.35 : 0.5).color;
  const s = taille / 64;
  g.fillStyle(0x000000, 0.25).fillEllipse(32 * s, 60 * s, 40 * s, 8 * s);
  g.fillStyle(c, 1).fillRoundedRect(20 * s, 26 * s, 24 * s, 30 * s, 6 * s);
  g.fillStyle(0xf1d2b6, 1).fillCircle(32 * s, 18 * s, 10 * s);
  g.fillStyle(0x222222, 1).fillCircle((versDroite ? 36 : 28) * s, 17 * s, 2 * s);
  g.lineStyle(4 * s, 0xd8d8e0, 1).lineBetween((versDroite ? 46 : 18) * s, 46 * s, (versDroite ? 58 : 6) * s, 24 * s);
  g.generateTexture(k, taille, taille);
  g.destroy();
  return k;
}

/** Calque de race provisoire (oreilles, cornes, queue…), dessiné par-dessus le provisoire. */
export function calqueProvisoire(scene: Phaser.Scene, race: string, taille: number, versDroite: boolean): string | null {
  if (race === 'humain') return null;
  const k = `calque:${race}:${taille}:${versDroite}`;
  if (scene.textures.exists(k)) return k;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const s = taille / 64;
  const tri = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, col: number) => g.fillStyle(col, 1).fillTriangle(x1 * s, y1 * s, x2 * s, y2 * s, x3 * s, y3 * s);
  switch (race) {
    case 'elfe': tri(22, 18, 12, 8, 24, 14, 0xf1d2b6); tri(42, 18, 52, 8, 40, 14, 0xf1d2b6); break;
    case 'demi-elfe': tri(22, 18, 16, 12, 24, 15, 0xf1d2b6); tri(42, 18, 48, 12, 40, 15, 0xf1d2b6); break;
    case 'nain': g.fillStyle(0x8a4b22, 1).fillTriangle(24 * s, 22 * s, 40 * s, 22 * s, 32 * s, 38 * s); break;
    case 'ourvalis': tri(24, 10, 22, 0, 30, 8, 0xb9bcc8); tri(40, 10, 42, 0, 34, 8, 0xb9bcc8); g.fillStyle(0xb9bcc8, 1).fillEllipse((versDroite ? 16 : 48) * s, 48 * s, 14 * s, 6 * s); break;
    case 'vulpin': tri(24, 10, 22, 0, 30, 8, 0xd2692a); tri(40, 10, 42, 0, 34, 8, 0xd2692a); g.fillStyle(0xd2692a, 1).fillEllipse((versDroite ? 15 : 49) * s, 46 * s, 16 * s, 9 * s); break;
    case 'demi-demon': tri(25, 10, 20, 0, 28, 8, 0x1d1a22); tri(39, 10, 44, 0, 36, 8, 0x1d1a22); break;
    case 'sang-dragon': tri(26, 9, 24, 2, 29, 8, 0x9c2a1c); tri(38, 9, 40, 2, 35, 8, 0x9c2a1c); g.fillStyle(0xc0392b, 1).fillCircle(26 * s, 21 * s, 2 * s).fillCircle(38 * s, 21 * s, 2 * s); break;
  }
  g.generateTexture(k, taille, taille);
  g.destroy();
  return k;
}

export function teinte(nom: string): number {
  let h = 0;
  for (const ch of nom) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export { couleur };
