/**
 * Donjon en vue de dessus : carte en tuiles, brouillard, groupe déplacé par le meneur du jour.
 * Utilise tuiles/<tileset>.png + tuiles/<tileset>.json s'ils existent, sinon des tuiles provisoires.
 */
import Phaser from 'phaser';
import type { Contenu } from '../contenu/charger';
import type { EtatPartie } from '../moteur/partie';
import { caseDonjon } from '../moteur/partie';
import { prechargerTout } from './sprites';

const tuilesJson = import.meta.glob('/assets/tuiles/*.json', { import: 'default', eager: true }) as Record<string, Correspondance>;

interface Correspondance {
  taille: number;
  colonnes: number;
  sol: number[];
  mur_face: number[];
  mur_haut: number;
  porte: number;
  'porte-verrouillee': number;
  'porte-deverrouillee'?: number;
  escalier: number;
  piege: number;
  'piege-declenche'?: number;
  objets: { coffre: number; 'coffre-ouvert': number; os: number; gravats?: number; torche: number[]; fontaine: { index: number; largeur: number; hauteur: number }; sceau: number[]; toile?: number };
}

export interface OptionsDonjon {
  contenu: Contenu;
  echelle: number;
  meneur: { classe: string; race: string; teinte: string | null } | null;
  peutBouger: boolean;
  surDeplacement: (dx: number, dy: number) => void;
}

const COULEURS: Record<string, number> = {
  sol: 0x3b3644, mur: 0x1b1822, porte: 0x7a5230, 'porte-verrouillee': 0x8a6a2a, escalier: 0x6d6a78,
  'sol-os': 0x3b3644, 'sol-piege': 0x4a3a3a, 'sol-coffre': 0x3b3644, 'colonne-fontaine': 0x4a6a8a, 'sol-sceau': 0x3b3644,
};

export class SceneDonjon extends Phaser.Scene {
  private pret = false;
  private enAttente: { etat: EtatPartie; opts: OptionsDonjon } | null = null;
  private calqueCarte: Phaser.GameObjects.Container | null = null;
  private brouillard: Phaser.GameObjects.Graphics | null = null;
  private groupe: Phaser.GameObjects.Container | null = null;
  private idCarte = '';
  private opts: OptionsDonjon | null = null;
  private dernierePos = { x: -1, y: -1 };
  private torches: Phaser.GameObjects.Sprite[] = [];

  constructor() { super('donjon'); }

  private tailles = { tailleCombat: 64, tailleBoss: 128, tailleExploration: 32 };

  init(data: Partial<{ tailleCombat: number; tailleBoss: number; tailleExploration: number }>) {
    this.tailles = { ...this.tailles, ...data };
  }

  preload() {
    prechargerTout(this, this.tailles.tailleCombat, this.tailles.tailleBoss, this.tailles.tailleExploration);
  }

  create() {
    this.pret = true;
    const touches: Record<string, [number, number]> = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      KeyZ: [0, -1], KeyW: [0, -1], KeyS: [0, 1], KeyQ: [-1, 0], KeyA: [-1, 0], KeyD: [1, 0],
    };
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const d = touches[e.code];
      if (d && this.opts?.peutBouger) { e.preventDefault(); this.opts.surDeplacement(d[0], d[1]); }
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.opts?.peutBouger || !this.groupe) return;
      const t = this.taillePx();
      const dx = p.worldX - this.groupe.x, dy = p.worldY - this.groupe.y;
      if (Math.abs(dx) < t / 2 && Math.abs(dy) < t / 2) return;
      if (Math.abs(dx) > Math.abs(dy)) this.opts.surDeplacement(Math.sign(dx), 0);
      else this.opts.surDeplacement(0, Math.sign(dy));
    });
    if (this.enAttente) { const e = this.enAttente; this.enAttente = null; this.afficher(e.etat, e.opts); }
  }

  private taillePx() { return 32 * (this.opts?.echelle ?? 2); }

  afficher(etat: EtatPartie, opts: OptionsDonjon) {
    if (!this.pret) { this.enAttente = { etat, opts }; return; }
    this.opts = opts;
    const dj = etat.donjon;
    if (!dj) return;
    const d = opts.contenu.donjons[dj.id];
    if (this.idCarte !== dj.id) this.construireCarte(etat);
    this.majObjets(etat);
    this.majBrouillard(etat);
    const t = this.taillePx();
    const cible = { x: dj.x * t + t / 2, y: dj.y * t + t / 2 };
    if (!this.groupe) this.creerGroupe(opts, cible);
    const dir = dj.x > this.dernierePos.x ? 'droite' : dj.x < this.dernierePos.x ? 'gauche' : dj.y < this.dernierePos.y ? 'haut' : 'bas';
    if (this.dernierePos.x >= 0 && (this.dernierePos.x !== dj.x || this.dernierePos.y !== dj.y)) this.jouerMarche(dir);
    this.dernierePos = { x: dj.x, y: dj.y };
    this.tweens.add({ targets: this.groupe, x: cible.x, y: cible.y, duration: 140 });
    this.cameras.main.setBounds(0, 0, d.carte[0].length * t, d.carte.length * t);
    this.cameras.main.startFollow(this.groupe!, true, 0.15, 0.15);
  }

  private correspondance(tileset: string): Correspondance | null {
    if (!this.textures.exists(`tuiles/${tileset}`)) return null;
    const c = tuilesJson[`/assets/tuiles/${tileset}.json`];
    if (!c) return null;
    const k = `tuiles:${tileset}`;
    if (!this.textures.exists(k)) {
      const img = this.textures.get(`tuiles/${tileset}`).getSourceImage() as HTMLImageElement;
      this.textures.addSpriteSheet(k, img, { frameWidth: c.taille, frameHeight: c.taille });
    }
    return c;
  }

  private construireCarte(etat: EtatPartie) {
    const contenu = this.opts!.contenu;
    const dj = etat.donjon!;
    const d = contenu.donjons[dj.id];
    this.calqueCarte?.destroy();
    this.torches = [];
    this.idCarte = dj.id;
    const t = this.taillePx();
    const e = this.opts!.echelle;
    const cont = this.add.container(0, 0);
    const corr = this.correspondance(d.tileset);
    const cle = `tuiles:${d.tileset}`;
    const g = this.add.graphics();
    cont.add(g);
    d.carte.forEach((ligne, y) => {
      [...ligne].forEach((_, x) => {
        const nom = caseDonjon(contenu, dj.id, x, y);
        const alea = (x * 7 + y * 13) % 7;
        if (corr) {
          let idx: number;
          if (nom === 'mur') {
            const dessous = caseDonjon(contenu, dj.id, x, y + 1);
            idx = dessous !== 'mur' && dessous !== 'vide' ? corr.mur_face[alea % corr.mur_face.length] : corr.mur_haut;
          } else if (nom === 'porte') idx = corr.porte;
          else if (nom === 'porte-verrouillee') idx = corr['porte-verrouillee'];
          else if (nom === 'escalier') idx = corr.escalier;
          else if (nom === 'sol-piege') idx = corr.piege;
          else idx = corr.sol[alea % corr.sol.length];
          cont.add(this.add.image(x * t, y * t, cle, idx).setOrigin(0).setScale(e));
          // torche sur un mur de face, de temps en temps
          if (nom === 'mur' && caseDonjon(contenu, dj.id, x, y + 1).startsWith('sol') && (x + y) % 5 === 0) {
            const k = `${cle}:torche`;
            if (!this.anims.exists(k)) this.anims.create({ key: k, frames: corr.objets.torche.map((f) => ({ key: cle, frame: f })), frameRate: 6, repeat: -1 });
            const s = this.add.sprite(x * t, y * t, cle, corr.objets.torche[0]).setOrigin(0).setScale(e).play(k);
            cont.add(s);
            this.torches.push(s);
          }
        } else {
          g.fillStyle(COULEURS[nom] ?? 0x3b3644, 1).fillRect(x * t, y * t, t, t);
          if (nom === 'mur') g.lineStyle(1, 0x2b2733, 1).strokeRect(x * t + 0.5, y * t + 0.5, t - 1, t - 1);
          else g.lineStyle(1, 0x332f3b, 1).strokeRect(x * t + 0.5, y * t + 0.5, t - 1, t - 1);
          if (nom === 'escalier') for (let i = 0; i < 4; i++) g.fillStyle(0x8a8796, 1).fillRect(x * t + 6, y * t + 6 + i * (t / 5), t - 12, 4);
          if (nom === 'porte-verrouillee') g.fillStyle(0xd4af37, 1).fillCircle(x * t + t / 2, y * t + t / 2, 5);
        }
      });
    });
    this.calqueCarte = cont;
    cont.setDepth(0);
    this.objets?.destroy();
    this.objets = this.add.container(0, 0).setDepth(1);
    this.brouillard?.destroy();
    this.brouillard = this.add.graphics().setDepth(5);
  }

  private objets: Phaser.GameObjects.Container | null = null;

  private majObjets(etat: EtatPartie) {
    const contenu = this.opts!.contenu;
    const dj = etat.donjon!;
    const d = contenu.donjons[dj.id];
    const t = this.taillePx();
    const e = this.opts!.echelle;
    const corr = this.correspondance(d.tileset);
    const cle = `tuiles:${d.tileset}`;
    this.objets!.removeAll(true);
    const ajouterObjet = (x: number, y: number, idx: number, larg = 1, haut = 1) => {
      if (!corr) return;
      for (let j = 0; j < haut; j++) for (let i = 0; i < larg; i++) {
        this.objets!.add(this.add.image(x * t + (i - (larg - 1) / 2) * t, y * t + (j - (haut - 1) / 2) * t, cle, idx + i + j * corr.colonnes).setOrigin(0).setScale(e));
      }
    };
    d.carte.forEach((ligne, y) => [...ligne].forEach((_, x) => {
      const nom = caseDonjon(contenu, dj.id, x, y);
      if (nom === 'sol-os') corr ? ajouterObjet(x, y, corr.objets.os) : this.marque(x, y, 0xd8d2c0, 'os');
      if (nom === 'colonne-fontaine') corr ? ajouterObjet(x, y, corr.objets.fontaine.index, corr.objets.fontaine.largeur, corr.objets.fontaine.hauteur) : this.marque(x, y, 0x7fb3ff, 'fontaine');
    }));
    for (const ev of d.evenements) {
      const fait = dj.faits.includes(ev.id);
      if (ev.type === 'coffre') {
        if (ev.id === 'sceau' && !fait) {
          if (corr) {
            const k = `${cle}:sceau`;
            if (!this.anims.exists(k)) this.anims.create({ key: k, frames: corr.objets.sceau.map((f) => ({ key: cle, frame: f })), frameRate: 3, repeat: -1 });
            this.objets!.add(this.add.sprite(ev.x * t, ev.y * t, cle, corr.objets.sceau[0]).setOrigin(0).setScale(e).play(k));
          } else this.marque(ev.x, ev.y, 0xa45cff, 'sceau');
        } else if (ev.id !== 'sceau') {
          corr ? ajouterObjet(ev.x, ev.y, fait ? corr.objets['coffre-ouvert'] : corr.objets.coffre) : this.marque(ev.x, ev.y, fait ? 0x6b5a3a : 0xd4af37, fait ? '' : 'coffre');
        }
      }
      if (ev.type === 'combat' && !fait && dj.vus.includes(`${ev.x},${ev.y}`)) {
        const c = this.add.circle(ev.x * t + t / 2, ev.y * t + t / 2, t * 0.28, 0xd9473b, 0.35).setStrokeStyle(2, 0xff6b5b);
        this.tweens.add({ targets: c, alpha: 0.15, yoyo: true, repeat: -1, duration: 700 });
        this.objets!.add(c);
      }
      if (ev.type === 'piege' && fait && corr) ajouterObjet(ev.x, ev.y, corr['piege-declenche'] ?? corr.piege);
    }
  }

  private marque(x: number, y: number, couleur: number, texte: string) {
    const t = this.taillePx();
    this.objets!.add(this.add.rectangle(x * t + t / 2, y * t + t / 2, t * 0.6, t * 0.6, couleur, 0.9));
    if (texte) this.objets!.add(this.add.text(x * t + t / 2, y * t + t / 2, texte, { fontSize: '10px', color: '#111' }).setOrigin(0.5));
  }

  private majBrouillard(etat: EtatPartie) {
    const dj = etat.donjon!;
    const d = this.opts!.contenu.donjons[dj.id];
    const t = this.taillePx();
    const g = this.brouillard!;
    g.clear();
    d.carte.forEach((ligne, y) => [...ligne].forEach((_, x) => {
      const vu = dj.vus.includes(`${x},${y}`);
      const dist = Math.max(Math.abs(x - dj.x), Math.abs(y - dj.y));
      if (!vu) g.fillStyle(0x07060a, 1).fillRect(x * t, y * t, t, t);
      else if (dist > 3) g.fillStyle(0x07060a, 0.55).fillRect(x * t, y * t, t, t);
    }));
  }

  private creerGroupe(opts: OptionsDonjon, pos: { x: number; y: number }) {
    const t = this.taillePx();
    const items: Phaser.GameObjects.GameObject[] = [];
    const m = opts.meneur;
    const cle = m ? `personnages/heros/${m.classe}/exploration` : '';
    if (m && this.textures.exists(cle)) {
      const s = this.add.sprite(0, 0, cle, 0).setScale(opts.echelle);
      if (m.teinte) s.setTint(Phaser.Display.Color.HexStringToColor(m.teinte).color);
      items.push(s);
      const cleCalque = `personnages/races/${m.race}/calque-exploration`;
      if (this.textures.exists(cleCalque)) {
        const c = this.add.sprite(0, 0, cleCalque, 0).setScale(opts.echelle);
        if (m.teinte) c.setTint(Phaser.Display.Color.HexStringToColor(m.teinte).color);
        items.push(c);
      }
    } else {
      items.push(this.add.circle(0, 0, t * 0.32, 0xffd166).setStrokeStyle(3, 0x3b2a10));
      items.push(this.add.text(0, 0, 'G', { fontFamily: 'Pixelify Sans', fontSize: `${Math.round(t * 0.4)}px`, color: '#3b2a10' }).setOrigin(0.5));
    }
    this.groupe = this.add.container(pos.x, pos.y, items).setDepth(10);
  }

  private jouerMarche(dir: 'bas' | 'gauche' | 'droite' | 'haut') {
    const ligne = { bas: 0, gauche: 1, droite: 2, haut: 3 }[dir];
    for (const o of this.groupe?.list ?? []) {
      if (!(o instanceof Phaser.GameObjects.Sprite)) continue;
      const cle = o.texture.key;
      const k = `${cle}:marche-${dir}`;
      if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(cle, { start: ligne * 4, end: ligne * 4 + 3 }), frameRate: 12, repeat: 0 });
      o.play(k);
      o.once('animationcomplete', () => o.setFrame(ligne * 4));
    }
  }
}
