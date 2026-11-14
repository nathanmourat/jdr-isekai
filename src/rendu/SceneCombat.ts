/**
 * Combat en vue de côté : héros à gauche, ennemis à droite, deux rangs par camp.
 * La scène affiche un état du moteur (`afficher`) et anime les nouveaux événements.
 */
import Phaser from 'phaser';
import type { Combat, Combattant, EvenementCombat } from '../moteur/combat';
import type { Contenu } from '../contenu/types';
import { choisirFond } from './fonds';
import { calqueProvisoire, cheminCombat, creerAnimations, echelleCase, LIGNES_ENNEMIS, LIGNES_HEROS, prechargerTout, textureProvisoire } from './sprites';

const L = 960, H = 540;

interface Vue {
  conteneur: Phaser.GameObjects.Container;
  /** Nom, niveau, barres de vie et de mana : dessinés au-dessus de tous les personnages, pour qu'un voisin ne les cache jamais. */
  etiquette: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  calque: Phaser.GameObjects.Sprite | null;
  barre: Phaser.GameObjects.Graphics;
  nom: Phaser.GameObjects.Text;
  cleTexture: string;
  anime: boolean;
  zone: Phaser.GameObjects.Zone;
  /** Icônes d'état avec le nombre de tours restants (☠3 🔥2). */
  etats: Phaser.GameObjects.Text;
  /** Bulles vertes qui montent tant que le combattant est empoisonné. */
  bulles: Phaser.Time.TimerEvent | null;
  teinte: number | null;
}

/** Icône de chaque état, affichée au-dessus du combattant avec le nombre de tours restants. */
const ICONES_ETATS: Record<string, string> = {
  poison: '☠', brulure: '🔥', gel: '❄', immobilise: '⛓', sommeil: '💤', peur: '😱', silence: '🤐', provoque: '💢', marque: '🎯',
  furtif: '👁', bonus_degats: '⬆', bonus_defense: '🛡', bonus_initiative: '⬆', bonus_precision: '⬆', malus_defense: '⬇',
  regeneration: '✚', garde: '🛡', expose: '⬇', affaibli: '⬇',
};

/** Effet visuel (assets/effets/<id>.png) selon l'élément des dégâts. */
const EFFET_ELEMENT: Record<string, string> = { physique: 'entaille', feu: 'feu', glace: 'glace', foudre: 'foudre', sacre: 'sacre', ombre: 'ombre', poison: 'poison', arcane: 'rune' };
/** Effet visuel selon l'état posé. */
function effetEtat(etat: string | undefined): string {
  if (etat === 'poison') return 'poison';
  if (etat === 'brulure') return 'feu';
  if (etat === 'gel') return 'glace';
  if (etat === 'furtif') return 'ombre';
  if (etat === 'garde' || etat === 'bonus_defense') return 'bouclier';
  if (etat === 'regeneration') return 'soin';
  if (etat !== undefined && etat.startsWith('bonus')) return 'bonus';
  return 'malus';
}
/** Couleur de l'effet dessiné par le code quand l'image n'est pas encore livrée. */
const COULEUR_EFFET: Record<string, number> = {
  entaille: 0xffffff, impact: 0xf2d9a0, feu: 0xff7b2e, glace: 0x8fd3ff, foudre: 0xfff35c, soin: 0x7ee081, poison: 0x6fd36f, rune: 0x9fb7ff,
  bouclier: 0x7fb3ff, bonus: 0xffd166, malus: 0xb07ad6, critique: 0xffe14d, sacre: 0xffe9a8, ombre: 0x8e5bd6, invocation: 0xc9a7ff,
};

export interface OptionsCombat {
  echelle: number;
  tailleCombat: number;
  tailleBoss: number;
  tailleExploration: number;
  ciblesCliquables: string[];
  /** Contenu du jeu (table des fonds de combat). */
  contenu: Contenu;
  /** Décor du lieu où le combat a commencé : fond de secours si le fond de combat n'existe pas encore. */
  decorLieu: string | null;
  actif: string | null;
  surClic: (id: string) => void;
}

export class SceneCombat extends Phaser.Scene {
  private vues = new Map<string, Vue>();
  /** Image de fond, voile sombre et bande de sol (détruits ensemble quand le fond change). */
  private calquesFond: Phaser.GameObjects.GameObject[] = [];
  private contenu: Contenu | null = null;
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
    // le cadre change de taille (téléphone tourné, fenêtre redimensionnée) : on réajuste le zoom
    this.scale.on(Phaser.Scale.Events.RESIZE, () => { if (this.majZoom() && this.dernier) this.afficher(this.dernier.combat, this.dernier.opts); });
    if (this.enAttente) { const e = this.enAttente; this.enAttente = null; this.afficher(e.combat, e.opts); }
  }

  // ───────────── Zoom sur l'action (écrans étroits) ─────────────
  /**
   * Sur un écran étroit (téléphone), le cadre de combat est réduit à la largeur de l'écran et les personnages
   * deviennent petits. On zoome alors la caméra sur la bande où se tiennent les combattants (on coupe le ciel
   * et les bords vides), et on rapproche un peu les combattants pour qu'ils restent dans le cadre.
   * Sur ordinateur (cadre de 700 px de large ou plus), rien ne change.
   */
  private zoom = 1;
  private dernier: { combat: Combat; opts: OptionsCombat } | null = null;
  /** Largeur affichée du cadre en dessous de laquelle on zoome, et force du zoom. */
  static readonly LARGEUR_ZOOM = 700;
  static readonly ZOOM_ETROIT = 1.3;
  /** Centre de la bande des combattants (pieds vers y = 355 à 390, têtes vers y = 160). */
  static readonly CENTRE_ACTION = { x: L / 2, y: 300 };

  /** Met la caméra au bon zoom. Renvoie true si le zoom a changé (il faut alors replacer les combattants). */
  private majZoom(): boolean {
    const largeur = this.scale.displaySize.width;
    const z = largeur > 0 && largeur < SceneCombat.LARGEUR_ZOOM ? SceneCombat.ZOOM_ETROIT : 1;
    const camera = this.cameras.main;
    camera.setZoom(z);
    if (z > 1) camera.centerOn(SceneCombat.CENTRE_ACTION.x, SceneCombat.CENTRE_ACTION.y);
    else camera.centerOn(L / 2, H / 2);
    const change = z !== this.zoom;
    this.zoom = z;
    return change;
  }

  afficher(combat: Combat, opts: OptionsCombat) {
    if (!this.pret) { this.enAttente = { combat, opts }; return; }
    this.dernier = { combat, opts };
    this.majZoom();
    if (combat.id !== this.combatId) this.reinitialiser(combat);
    this.contenu = opts.contenu;
    this.dessinerFond(combat.fond, opts.decorLieu);
    const positions = this.positions(combat, opts.echelle);
    for (const c of combat.combattants) {
      if (c.parti && !this.vues.has(c.id)) continue;
      const vue = this.vues.get(c.id) ?? this.creerVue(c, opts);
      const p = positions.get(c.id);
      if (p) this.tweens.add({ targets: [vue.conteneur, vue.etiquette], x: p.x, y: p.y, duration: 250 });
      vue.zone.removeAllListeners();
      const cliquable = opts.ciblesCliquables.includes(c.id);
      vue.zone.setInteractive({ useHandCursor: cliquable });
      vue.zone.on('pointerdown', () => opts.surClic(c.id));
      vue.nom.setColor(cliquable ? '#ffd166' : '#f3ead7');
      this.majBarre(vue, c);
      this.majEtats(vue, c);
      if (c.parti && vue.conteneur.alpha > 0) this.tweens.add({ targets: [vue.conteneur, vue.etiquette], alpha: 0, duration: 500 });
      if (c.ko && !c.parti) { vue.conteneur.setAlpha(0.45); vue.etiquette.setAlpha(0.45); vue.sprite.setAngle(c.camp === 'heros' ? -80 : 80); }
      else if (!c.parti) { vue.conteneur.setAlpha(1); vue.etiquette.setAlpha(1); vue.sprite.setAngle(0); }
      // invisible (Pas d'ombre, se cacher) : le personnage devient semi-transparent
      const furtif = !c.ko && c.etats.some((e) => e.id === 'furtif');
      vue.sprite.setAlpha(furtif ? 0.4 : 1);
      vue.calque?.setAlpha(furtif ? 0.4 : 1);
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
    for (const v of this.vues.values()) { v.bulles?.remove(); v.conteneur.destroy(); v.etiquette.destroy(); }
    this.vues.clear();
    this.combatId = combat.id;
    this.nbEvenements = Math.max(0, combat.evenements.length - 12);
  }

  /**
   * Fond du combat : un combat a toujours un décor (chaîne de secours de `src/rendu/fonds.ts`).
   * Un décor de lieu utilisé comme fond est assombri et reçoit une bande de sol, pour que les combattants ressortent
   * et ne semblent pas flotter. Le dégradé n'est qu'un dernier recours, signalé seulement dans la console.
   */
  private dessinerFond(fond: string, decorLieu: string | null) {
    const cleFond = `${fond}|${decorLieu ?? ''}`;
    if (this.fondCle === cleFond) return;
    for (const o of this.calquesFond) o.destroy();
    this.calquesFond = [];
    this.fondCle = cleFond;
    const source = this.contenu ? choisirFond(this.contenu, fond, decorLieu, (chemin) => this.textures.exists(chemin)) : null;
    if (source) {
      const img = this.add.image(L / 2, H / 2, source.chemin).setDepth(-10);
      // remplir le cadre sans déformer l'image (le surplus est coupé)
      img.setScale(Math.max(L / img.width, H / img.height));
      this.calquesFond.push(img);
      if (source.decor) {
        // décor de lieu : assombri de 18 %, puis une bande de sol douce sous la ligne des pieds
        this.calquesFond.push(this.add.rectangle(L / 2, H / 2, L, H, 0x000000, 0.18).setDepth(-9));
        const sol = this.add.graphics().setDepth(-8);
        const haut = H * 0.62 - 12;
        sol.fillGradientStyle(0x1a140f, 0x1a140f, 0x1a140f, 0x1a140f, 0, 0, 0.5, 0.5).fillRect(0, haut, L, H - haut);
        this.calquesFond.push(sol);
      }
      if (source.etape > 1) console.info(`[combat] fond « ${fond} » : pas encore de assets/combat/fonds/${fond}.png, remplacé par ${source.chemin}`);
    } else {
      const g = this.add.graphics().setDepth(-10);
      const ciel = Phaser.Display.Color.HSLToColor(((fond.length * 47) % 360) / 360, 0.35, 0.22).color;
      g.fillGradientStyle(ciel, ciel, 0x0d0b12, 0x0d0b12, 1).fillRect(0, 0, L, H);
      g.fillStyle(0x2a2233, 1).fillRect(0, H * 0.66, L, H * 0.34);
      g.lineStyle(2, 0x3b3146, 1).lineBetween(0, H * 0.66, L, H * 0.66);
      this.calquesFond.push(g);
      console.warn(`[combat] aucun décor trouvé pour le fond « ${fond} » : dégradé provisoire (ajoutez assets/combat/fonds/${fond}.png)`);
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
        // zoom sur l'action : on rapproche les combattants du centre pour qu'ils restent dans le cadre zoomé
        const serrer = this.zoom > 1 ? 0.95 / this.zoom : 1;
        liste.forEach((c, i) => {
          const dx = (i - (liste.length - 1) / 2) * pas;
          res.set(c.id, { x: L / 2 + (xBase + dx - L / 2) * serrer, y: sol + 20 + (i % 2) * 34 });
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
    // taille logique (64, ou 128 pour un boss) quelle que soit la résolution de la planche (HD : cases deux fois plus grandes)
    const echelle = opts.echelle * (c.echelle || 1);
    sprite.setScale(echelle * (anime ? echelleCase(this, chemin, taille) : 1));
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
        calque = this.add.sprite(0, 0, cleCalque).setOrigin(0.5, 1).setScale(echelle * (calqueAnime ? echelleCase(this, cheminCalque, taille) : 1));
        if (calqueAnime) calque.play(`${cheminCalque}:attente`);
      }
    }
    const barre = this.add.graphics();
    // les ennemis affichent leur niveau à côté de leur nom ; un nom long passe sur deux lignes pour ne pas recouvrir le voisin
    const libelleNom = c.camp === 'ennemis' ? `${c.nom} · Niv. ${c.niveau}` : c.nom;
    const nom = this.add.text(0, 10, libelleNom, { fontFamily: 'Source Sans 3', fontSize: '13px', color: '#f3ead7', stroke: '#000', strokeThickness: 3, align: 'center', wordWrap: { width: 120 } }).setOrigin(0.5, 0).setResolution(2);
    const zone = this.add.zone(0, -taille * echelle / 2, taille * echelle * 0.7, taille * echelle);
    const etats = this.add.text(0, -taille * echelle - 6, '', { fontFamily: 'Source Sans 3', fontSize: '14px', color: '#f3ead7', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5, 1).setResolution(2);
    const items: Phaser.GameObjects.GameObject[] = [sprite];
    if (calque) items.push(calque);
    items.push(zone, etats);
    const conteneur = this.add.container(versDroite ? -100 : L + 100, H * 0.7, items);
    conteneur.setDepth(10);
    const etiquette = this.add.container(conteneur.x, conteneur.y, [barre, nom]).setDepth(40);
    const v: Vue = { conteneur, etiquette, sprite, calque, barre, nom, cleTexture, anime, zone, etats, bulles: null, teinte: c.teinte ? Phaser.Display.Color.HexStringToColor(c.teinte).color : null };
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
    // barre de mana bleue sous la barre de vie (les ennemis ont un mana illimité : pas de barre)
    const aMana = utiliseMana(c);
    if (aMana) {
      const ym = y + 7;
      v.barre.fillStyle(0x000000, 0.7).fillRect(-l / 2 - 1, ym - 1, l + 2, 6);
      v.barre.fillStyle(0x4f8dff, 1).fillRect(-l / 2, ym, l * Math.max(0, Math.min(1, c.mana / c.manaMax)), 4);
    }
    v.nom.setY(aMana ? 17 : 10);
  }

  /** États visibles : icônes avec tours restants, teinte verte et bulles pour le poison. */
  private majEtats(v: Vue, c: Combattant) {
    const morceaux = c.ko ? [] : c.etats.map((e) => `${ICONES_ETATS[e.id] ?? '•'}${e.duree > 50 ? '' : e.duree}${e.cumul > 1 ? `×${e.cumul}` : ''}`);
    v.etats.setText(morceaux.join(' '));
    const empoisonne = !c.ko && c.etats.some((e) => e.id === 'poison');
    if (empoisonne) v.sprite.setTint(0x9be89b);
    else if (v.teinte !== null) v.sprite.setTint(v.teinte);
    else v.sprite.clearTint();
    if (empoisonne && !v.bulles) {
      v.bulles = this.time.addEvent({ delay: 420, loop: true, callback: () => {
        const b = this.add.circle(v.conteneur.x + Phaser.Math.Between(-18, 18), v.conteneur.y - Phaser.Math.Between(20, 60), Phaser.Math.Between(2, 5), 0x6fd36f, 0.85).setDepth(54);
        this.tweens.add({ targets: b, y: b.y - 38, alpha: 0, duration: 800, onComplete: () => b.destroy() });
      } });
    } else if (!empoisonne && v.bulles) { v.bulles.remove(); v.bulles = null; }
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
      this.time.delayedCall(i * 140, () => {
        const src = e.source ? this.vues.get(e.source) : undefined;
        const cib = e.cible ? this.vues.get(e.cible) : undefined;
        if (e.type === 'action' && src) {
          // le personnage joue sa ligne « attaque » (attaque de base) ou « sort » (compétence, objet)
          const dir = src.conteneur.x < L / 2 ? 1 : -1;
          const attaque = e.competence === 'attaque';
          this.tweens.add({ targets: src.conteneur, x: src.conteneur.x + (attaque ? 34 : 14) * dir, yoyo: true, duration: attaque ? 130 : 180 });
          this.jouerAnim(src, attaque ? 'attaque' : 'sort');
          if (!attaque && e.competence !== undefined) this.effet(src, 'rune', 0.9); // la compétence se « charge » sur le lanceur
        }
        if ((e.type === 'degats' || e.type === 'soin' || e.type === 'bouclier') && cib && e.valeur !== undefined) {
          const surLaDuree = e.type === 'degats' && e.etat !== undefined; // poison, brûlure : « −3 poison »
          const couleurTexte = e.type === 'soin' ? '#7ee081' : e.type === 'bouclier' ? '#7fb3ff' : e.etat === 'poison' ? '#8fe38f' : e.etat === 'brulure' ? '#ff9c4a' : e.critique ? '#ffd166' : '#ff6b5b';
          const libelle = `${e.type === 'soin' ? '+' : e.type === 'bouclier' ? '◇' : '−'}${e.valeur}${surLaDuree ? (e.etat === 'poison' ? ' poison' : ' brûlure') : ''}${e.critique ? ' !' : ''}`;
          const t = this.add.text(cib.conteneur.x, cib.conteneur.y - 70, libelle, {
            fontFamily: 'Pixelify Sans', fontSize: e.critique ? '26px' : '20px', color: couleurTexte, stroke: '#000', strokeThickness: 4,
          }).setOrigin(0.5).setDepth(60);
          this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 900, onComplete: () => t.destroy() });
          if (e.type === 'degats') {
            this.tweens.add({ targets: cib.sprite, x: { from: -4, to: 4 }, yoyo: true, repeat: 2, duration: 40, onComplete: () => cib.sprite.setX(0) });
            this.jouerAnim(cib, 'touche');
            this.effet(cib, e.effet ?? EFFET_ELEMENT[e.element ?? 'physique'] ?? 'impact');
            if (e.critique) this.time.delayedCall(120, () => this.effet(cib, 'critique', 1.9));
          } else this.effet(cib, e.type === 'soin' ? 'soin' : 'bouclier');
        }
        if (e.type === 'etat' && cib) this.effet(cib, effetEtat(e.etat));
        if (e.type === 'invocation' && cib) this.effet(cib, 'invocation', 1.8);
        if (e.type === 'rate' && cib) {
          const t = this.add.text(cib.conteneur.x, cib.conteneur.y - 70, 'Raté', { fontFamily: 'Pixelify Sans', fontSize: '18px', color: '#c9c3d6', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setDepth(60);
          this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() });
          // la cible esquive d'un petit pas en arrière
          const dir = cib.conteneur.x < L / 2 ? -1 : 1;
          this.tweens.add({ targets: cib.sprite, x: 10 * dir, yoyo: true, duration: 110, onComplete: () => cib.sprite.setX(0) });
        }
        if (e.type === 'ko' && cib) this.jouerAnim(cib, 'ko');
      });
    });
  }

  /** Joue un effet sur un combattant : l'image assets/effets/<nom>.png si elle est livrée, sinon un effet dessiné par le code. */
  private effet(cib: Vue, nom: string, echelle = 1.5) {
    const cle = `effets/${nom}`;
    const x = cib.conteneur.x, y = cib.conteneur.y - 50;
    if (this.textures.exists(cle)) {
      const k = `${cle}:anim`;
      if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(cle, {}), frameRate: 16 });
      const s = this.add.sprite(x, y, cle).setDepth(55).setScale(echelle);
      s.play(k);
      s.once('animationcomplete', () => s.destroy());
      return;
    }
    const couleur = COULEUR_EFFET[nom] ?? 0xffffff;
    if (nom === 'entaille' || nom === 'critique') {
      // trait(s) en diagonale
      const g = this.add.graphics().setDepth(55);
      g.lineStyle(nom === 'critique' ? 6 : 4, couleur, 1).lineBetween(x - 26, y - 22, x + 26, y + 22);
      if (nom === 'critique') g.lineBetween(x + 26, y - 22, x - 26, y + 22);
      this.tweens.add({ targets: g, alpha: 0, duration: 320, onComplete: () => g.destroy() });
    } else if (nom === 'bouclier') {
      const g = this.add.graphics().setDepth(55);
      g.lineStyle(4, couleur, 0.9).strokeCircle(x, y, 30);
      this.tweens.add({ targets: g, alpha: 0, duration: 500, onComplete: () => g.destroy() });
    } else if (nom === 'soin' || nom === 'bonus' || nom === 'malus' || nom === 'invocation' || nom === 'poison') {
      // particules qui montent (soin, bonus, invocation, poison) ou qui descendent (malus)
      const sens = nom === 'malus' ? 1 : -1;
      for (let n = 0; n < 6; n++) {
        const p = this.add.circle(x + Phaser.Math.Between(-24, 24), y + Phaser.Math.Between(-10, 20) - sens * 16, Phaser.Math.Between(3, 5), couleur, 0.9).setDepth(55);
        this.tweens.add({ targets: p, y: p.y + sens * 40, alpha: 0, duration: 500 + n * 40, onComplete: () => p.destroy() });
      }
    } else {
      // impact, feu, glace, foudre, rune, sacré, ombre : un éclat qui s'élargit
      const c = this.add.circle(x, y, 10, couleur, 0.8).setDepth(55);
      this.tweens.add({ targets: c, radius: 22 * echelle, alpha: 0, duration: 300, onComplete: () => c.destroy() });
    }
  }
}
/** Vrai si le combattant dépense du mana (héros, compagnons) ; les ennemis ont une réserve illimitée. */
export function utiliseMana(c: Combattant): boolean {
  return c.manaMax > 0 && c.manaMax < 999;
}
