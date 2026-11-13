/**
 * Combat en vue de côté : héros à gauche, ennemis à droite, deux rangs par camp.
 * La scène affiche un état du moteur (`afficher`) et anime les nouveaux événements.
 */
import Phaser from 'phaser';
import type { Combat, Combattant, EvenementCombat } from '../moteur/combat';
import { urlAsset } from './assets';
import { calqueProvisoire, cheminCombat, creerAnimations, LIGNES_ENNEMIS, LIGNES_HEROS, prechargerTout, textureProvisoire } from './sprites';

const L = 960, H = 540;

interface Vue {
  conteneur: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  calque: Phaser.GameObjects.Sprite | null;
  barre: Phaser.GameObjects.Graphics;
  nom: Phaser.GameObjects.Text;
  cleTexture: string;
  anime: boolean;
  zone: Phaser.GameObjects.Zone;
}

export interface OptionsCombat {
  echelle: number;
  tailleCombat: number;
  tailleBoss: number;
  tailleExploration: number;
  ciblesCliquables: string[];
  actif: string | null;
  surClic: (id: string) => void;
}

export class SceneCombat extends Phaser.Scene {
  private vues = new Map<string, Vue>();
  private fond: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null = null;
  private fondCle = '';
  private nbEvenements = 0;
  private combatId = '';
  private pret = false;
  private enAttente: { combat: Combat; opts: OptionsCombat } | null = null;
  private marqueurActif: Phaser.GameObjects.Triangle | null = null;

  constructor() { super('combat'); }

  private tailles = { tailleCombat: 64, tailleBoss: 128, tailleExploration: 32 };

  init(data: Partial<{ tailleCombat: number; tailleBoss: number; tailleExploration: number }>) {
    this.tailles = { ...this.tailles, ...data };
  }

  preload() {
    prechargerTout(this, this.tailles.tailleCombat, this.tailles.tailleBoss, this.tailles.tailleExploration);
  }

  create() {
    this.pret = true;
    this.marqueurActif = this.add.triangle(0, 0, 0, 0, 16, 0, 8, 12, 0xffd166).setDepth(50).setVisible(false);
    this.tweens.add({ targets: this.marqueurActif, y: '+=6', yoyo: true, repeat: -1, duration: 400 });
    if (this.enAttente) { const e = this.enAttente; this.enAttente = null; this.afficher(e.combat, e.opts); }
  }

  afficher(combat: Combat, opts: OptionsCombat) {
    if (!this.pret) { this.enAttente = { combat, opts }; return; }
    if (combat.id !== this.combatId) this.reinitialiser(combat);
    this.dessinerFond(combat.fond);
    const positions = this.positions(combat, opts.echelle);
    for (const c of combat.combattants) {
      if (c.parti && !this.vues.has(c.id)) continue;
      const vue = this.vues.get(c.id) ?? this.creerVue(c, opts);
      const p = positions.get(c.id);
      if (p) this.tweens.add({ targets: vue.conteneur, x: p.x, y: p.y, duration: 250 });
      vue.zone.removeAllListeners();
      const cliquable = opts.ciblesCliquables.includes(c.id);
      vue.zone.setInteractive({ useHandCursor: cliquable });
      vue.zone.on('pointerdown', () => opts.surClic(c.id));
      vue.nom.setColor(cliquable ? '#ffd166' : '#f3ead7');
      this.majBarre(vue, c);
      if (c.parti && vue.conteneur.alpha > 0) this.tweens.add({ targets: vue.conteneur, alpha: 0, duration: 500 });
      if (c.ko && !c.parti) { vue.conteneur.setAlpha(0.45); vue.sprite.setAngle(c.camp === 'heros' ? -80 : 80); }
      else if (!c.parti) { vue.conteneur.setAlpha(1); vue.sprite.setAngle(0); }
    }
    // marqueur au-dessus du combattant qui doit jouer
    const actif = opts.actif ? this.vues.get(opts.actif) : null;
    if (actif && this.marqueurActif) {
      this.marqueurActif.setVisible(true).setPosition(actif.conteneur.x, actif.conteneur.y - 46 * opts.echelle - 18);
    } else this.marqueurActif?.setVisible(false);
    this.animer(combat.evenements.slice(this.nbEvenements));
    this.nbEvenements = combat.evenements.length;
  }

  private reinitialiser(combat: Combat) {
    for (const v of this.vues.values()) v.conteneur.destroy();
    this.vues.clear();
    this.combatId = combat.id;
    this.nbEvenements = Math.max(0, combat.evenements.length - 12);
  }

  private dessinerFond(fond: string) {
    if (this.fondCle === fond) return;
    this.fond?.destroy();
    this.fondCle = fond;
    const cle = `combat/fonds/${fond}`;
    if (this.textures.exists(cle)) {
      const img = this.add.image(L / 2, H / 2, cle).setDepth(-10);
      img.setScale(Math.max(L / img.width, H / img.height));
      this.fond = img;
    } else {
      const g = this.add.graphics().setDepth(-10);
      const ciel = Phaser.Display.Color.HSLToColor(((fond.length * 47) % 360) / 360, 0.35, 0.22).color;
      g.fillGradientStyle(ciel, ciel, 0x0d0b12, 0x0d0b12, 1).fillRect(0, 0, L, H);
      g.fillStyle(0x2a2233, 1).fillRect(0, H * 0.66, L, H * 0.34);
      g.lineStyle(2, 0x3b3146, 1).lineBetween(0, H * 0.66, L, H * 0.66);
      this.fond = g;
      if (!urlAsset(cleFondManquant(fond))) this.add.text(L / 2, H - 14, `fond provisoire — assets/combat/fonds/${fond}.png`, { fontFamily: 'Source Sans 3', fontSize: '12px', color: '#8f86a0' }).setOrigin(0.5).setDepth(-9);
    }
  }

  private positions(combat: Combat, echelle: number) {
    const res = new Map<string, { x: number; y: number }>();
    const sol = H * 0.62;
    for (const camp of ['heros', 'ennemis'] as const) {
      for (const rang of ['avant', 'arriere'] as const) {
        const liste = combat.combattants.filter((c) => c.camp === camp && c.rang === rang && !(c.parti && c.type === 'invocation'));
        const xBase = camp === 'heros' ? (rang === 'avant' ? L * 0.36 : L * 0.17) : (rang === 'avant' ? L * 0.64 : L * 0.83);
        // plusieurs combattants au même rang : étalés en largeur, en quinconce
        const pas = Math.min(80, 220 / Math.max(1, liste.length)) * (echelle / 2);
        liste.forEach((c, i) => {
          const dx = (i - (liste.length - 1) / 2) * pas;
          res.set(c.id, { x: xBase + dx, y: sol + 20 + (i % 2) * 34 });
        });
      }
    }
    return res;
  }

  private creerVue(c: Combattant, opts: OptionsCombat): Vue {
    const versDroite = c.camp === 'heros';
    const chemin = cheminCombat(c.sprite);
    const taille = c.boss ? opts.tailleBoss : opts.tailleCombat;
    const lignes = c.type === 'heros' || c.type === 'compagnon' ? LIGNES_HEROS : LIGNES_ENNEMIS;
    const anime = creerAnimations(this, chemin, lignes);
    const cleTexture = anime ? chemin : textureProvisoire(this, c.refId, c.nom, taille, versDroite, c.boss);
    const sprite = this.add.sprite(0, 0, cleTexture).setOrigin(0.5, 1);
    const echelle = opts.echelle * (c.echelle || 1) * (anime ? 1 : 1);
    sprite.setScale(echelle);
    if (anime) sprite.play(`${chemin}:attente`);
    // une planche d'ennemi (tournée vers la gauche) utilisée côté héros : on la retourne
    if (anime && versDroite && chemin.startsWith('ennemis/')) sprite.setFlipX(true);
    if (c.teinte) sprite.setTint(Phaser.Display.Color.HexStringToColor(c.teinte).color);
    let calque: Phaser.GameObjects.Sprite | null = null;
    if (c.race && c.type === 'heros') {
      const cheminCalque = `personnages/races/${c.race}/calque-combat`;
      const calqueAnime = anime && creerAnimations(this, cheminCalque, LIGNES_HEROS);
      const cleCalque = calqueAnime ? cheminCalque : calqueProvisoire(this, c.race, taille, versDroite);
      if (cleCalque) {
        calque = this.add.sprite(0, 0, cleCalque).setOrigin(0.5, 1).setScale(echelle);
        if (calqueAnime) calque.play(`${cheminCalque}:attente`);
      }
    }
    const barre = this.add.graphics();
    const nom = this.add.text(0, 10, c.nom, { fontFamily: 'Source Sans 3', fontSize: '13px', color: '#f3ead7', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5, 0);
    const zone = this.add.zone(0, -taille * echelle / 2, taille * echelle * 0.7, taille * echelle);
    const items: Phaser.GameObjects.GameObject[] = [sprite];
    if (calque) items.push(calque);
    items.push(barre, nom, zone);
    const conteneur = this.add.container(versDroite ? -100 : L + 100, H * 0.7, items);
    conteneur.setDepth(10);
    const v: Vue = { conteneur, sprite, calque, barre, nom, cleTexture, anime, zone };
    this.vues.set(c.id, v);
    return v;
  }

  private majBarre(v: Vue, c: Combattant) {
    const l = 64, y = 4;
    v.barre.clear();
    v.barre.fillStyle(0x000000, 0.7).fillRect(-l / 2 - 1, y - 1, l + 2, 7);
    const ratio = Math.max(0, c.pv / c.pvMax);
    v.barre.fillStyle(ratio > 0.5 ? 0x4caf50 : ratio > 0.25 ? 0xf2a33a : 0xd9473b, 1).fillRect(-l / 2, y, l * ratio, 5);
    if (c.bouclier > 0) v.barre.fillStyle(0x7fb3ff, 1).fillRect(-l / 2, y - 3, Math.min(l, l * c.bouclier / c.pvMax), 2);
  }

  private jouerAnim(v: Vue, nom: string) {
    if (!v.anime) return;
    const k = `${v.cleTexture}:${nom}`;
    if (!this.anims.exists(k)) return;
    v.sprite.play(k);
    v.sprite.once('animationcomplete', () => { if (this.anims.exists(`${v.cleTexture}:attente`)) v.sprite.play(`${v.cleTexture}:attente`); });
  }

  private animer(evts: EvenementCombat[]) {
    evts.slice(-30).forEach((e, i) => {
      this.time.delayedCall(i * 180, () => {
        const src = e.source ? this.vues.get(e.source) : undefined;
        const cib = e.cible ? this.vues.get(e.cible) : undefined;
        if (e.type === 'action' && src) {
          const dir = src.conteneur.x < L / 2 ? 1 : -1;
          this.tweens.add({ targets: src.conteneur, x: src.conteneur.x + 26 * dir, yoyo: true, duration: 120 });
          this.jouerAnim(src, e.competence === 'attaque' ? 'attaque' : 'sort');
        }
        if ((e.type === 'degats' || e.type === 'soin' || e.type === 'bouclier') && cib && e.valeur !== undefined) {
          const couleurTexte = e.type === 'soin' ? '#7ee081' : e.type === 'bouclier' ? '#7fb3ff' : e.critique ? '#ffd166' : '#ff6b5b';
          const t = this.add.text(cib.conteneur.x, cib.conteneur.y - 70, `${e.type === 'soin' ? '+' : e.type === 'bouclier' ? '◇' : '−'}${e.valeur}${e.critique ? ' !' : ''}`, {
            fontFamily: 'Pixelify Sans', fontSize: e.critique ? '26px' : '20px', color: couleurTexte, stroke: '#000', strokeThickness: 4,
          }).setOrigin(0.5).setDepth(60);
          this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 900, onComplete: () => t.destroy() });
          if (e.type === 'degats') {
            this.tweens.add({ targets: cib.sprite, x: { from: -4, to: 4 }, yoyo: true, repeat: 2, duration: 40, onComplete: () => cib.sprite.setX(0) });
            this.jouerAnim(cib, 'touche');
            this.effet(cib, e.element ?? 'physique');
          }
        }
        if (e.type === 'rate' && cib) {
          const t = this.add.text(cib.conteneur.x, cib.conteneur.y - 70, 'Raté', { fontFamily: 'Pixelify Sans', fontSize: '18px', color: '#c9c3d6', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setDepth(60);
          this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() });
        }
        if (e.type === 'ko' && cib) this.jouerAnim(cib, 'ko');
      });
    });
  }

  private effet(cib: Vue, element: string) {
    const noms: Record<string, string> = { physique: 'entaille', feu: 'feu', glace: 'glace', foudre: 'foudre', sacre: 'sacre', ombre: 'ombre', poison: 'poison', arcane: 'rune' };
    const cle = `effets/${noms[element] ?? 'impact'}`;
    if (this.textures.exists(cle)) {
      const k = `${cle}:anim`;
      if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(cle, {}), frameRate: 16 });
      const s = this.add.sprite(cib.conteneur.x, cib.conteneur.y - 50, cle).setDepth(55).setScale(1.5);
      s.play(k);
      s.once('animationcomplete', () => s.destroy());
      return;
    }
    const couleurs: Record<string, number> = { feu: 0xff7b2e, glace: 0x8fd3ff, foudre: 0xfff35c, sacre: 0xffe9a8, ombre: 0x8e5bd6, poison: 0x6fd36f, arcane: 0x9fb7ff, physique: 0xffffff };
    const c = this.add.circle(cib.conteneur.x, cib.conteneur.y - 50, 10, couleurs[element] ?? 0xffffff, 0.8).setDepth(55);
    this.tweens.add({ targets: c, radius: 34, alpha: 0, duration: 300, onComplete: () => c.destroy() });
  }
}

function cleFondManquant(fond: string) {
  return `combat/fonds/${fond}`;
}
