/**
 * PortraitAnime — anime un portrait de dialogue 512 × 512 (style anime, fond transparent).
 *
 * Calques attendus pour une expression (même cadrage que le portrait) :
 *   base   : le portrait (portrait-<expression>.png)
 *   yeux   : yeux fermés, seulement la zone des yeux (alpha = masque)  → clignement
 *   bouche : bouche ouverte, seulement la zone de la bouche            → parole
 *   carte  : R = poids « cheveux » (ondulation), G = poids « respiration »
 *
 * Effets autour du portrait : lueur (aura qui pulse) et particules (canvas 2D par-dessus).
 * Tout s'arrête proprement avec detruire(). Avec prefers-reduced-motion : image fixe,
 * clignement et parole seulement (pas d'ondulation, pas de particules).
 * Sans WebGL : le portrait de base s'affiche sans animation.
 *
 * Utilisation :
 *   const p = new PortraitAnime(conteneur, { lueur: '#f3c45a', particules: 'lucioles' });
 *   await p.charger({ base, yeux, bouche, carte });   // URLs
 *   p.parler(true);  …  p.parler(false);
 */

const VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FS = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uBase, uYeux, uBouche, uCarte;
uniform float uT, uCligne, uParle, uSouffle, uOndule;
void main() {
  vec4 carte = texture2D(uCarte, vUv);
  vec2 uv = vUv;
  // respiration : le buste monte un peu, la tête suit à moitié
  uv.y += uSouffle * carte.g * 0.0032;
  // cheveux : deux ondes lentes, plus fortes vers les pointes et la tresse
  float onde = sin(uT * 1.55 + vUv.y * 7.0) * 0.0030 + sin(uT * 2.6 + vUv.y * 15.0 + 1.3) * 0.0012;
  uv.x += onde * carte.r * uOndule;
  uv.y += sin(uT * 1.2 + vUv.x * 6.0) * 0.0010 * carte.r * uOndule;
  vec4 c = texture2D(uBase, uv);
  vec4 y = texture2D(uYeux, uv);
  c.rgb = mix(c.rgb, y.rgb, y.a * uCligne);
  vec4 b = texture2D(uBouche, uv);
  c.rgb = mix(c.rgb, b.rgb, b.a * uParle);
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

const PARTICULES = {
  lucioles: { couleur: '#ffd77a', nombre: 14, vitesse: -9, taille: [1.2, 2.6], derive: 10 },
  braises: { couleur: '#ff8a3d', nombre: 16, vitesse: -16, taille: [1, 2.2], derive: 14 },
  magie: { couleur: '#9fd8ff', nombre: 18, vitesse: -7, taille: [1, 2.4], derive: 8 },
  neige: { couleur: '#f4f8ff', nombre: 16, vitesse: 10, taille: [1.2, 2.8], derive: 12 },
  ombre: { couleur: '#b07cff', nombre: 12, vitesse: -6, taille: [1.5, 3], derive: 6 },
};

function chargerImage(url) {
  return new Promise((ok, ko) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => ok(im);
    im.onerror = () => ko(new Error('Image introuvable : ' + url));
    im.src = url;
  });
}

export class PortraitAnime {
  constructor(conteneur, options = {}) {
    this.options = { lueur: null, particules: null, respiration: true, cheveux: true, clignement: true, ...options };
    this.reduit = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.racine = document.createElement('div');
    this.racine.className = 'portrait-anime';
    Object.assign(this.racine.style, { position: 'relative', width: '100%', aspectRatio: '1 / 1' });
    this.aura = document.createElement('div');
    Object.assign(this.aura.style, {
      position: 'absolute', inset: '6%', borderRadius: '50%', pointerEvents: 'none',
      filter: 'blur(18px)', opacity: '0', transition: 'opacity 300ms',
    });
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = 512;
    Object.assign(this.canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
    this.calque = document.createElement('canvas');
    Object.assign(this.calque.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
    this.racine.append(this.aura, this.canvas, this.calque);
    conteneur.appendChild(this.racine);

    this.parle = false;
    this.valParle = 0;
    this.cligne = 0;
    this.prochainClignement = 1.5;
    this.phaseClignement = -1;
    this.particules = [];
    this.t0 = performance.now();
    this.dernier = this.t0;
    this.boucle = this.boucle.bind(this);
    this.definirLueur(this.options.lueur);
    this.definirParticules(this.options.particules);
  }

  /** Charge (ou change) l'expression affichée. */
  async charger({ base, yeux, bouche, carte }) {
    const [ib, iy, ibo, ic] = await Promise.all([
      chargerImage(base),
      yeux ? chargerImage(yeux) : null,
      bouche ? chargerImage(bouche) : null,
      carte ? chargerImage(carte) : null,
    ]);
    if (!this.gl && !this.ctx2d) this.initRendu();
    if (this.gl) {
      const gl = this.gl;
      const vide = this.textureVide || (this.textureVide = this.texture(null));
      for (const [nom, im] of [['base', ib], ['yeux', iy], ['bouche', ibo], ['carte', ic]]) {
        if (this.tex[nom] && this.tex[nom] !== vide) gl.deleteTexture(this.tex[nom]);
        this.tex[nom] = im ? this.texture(im) : vide;
      }
    } else {
      this.imageBase = ib;
    }
    if (!this.raf) this.raf = requestAnimationFrame(this.boucle);
  }

  initRendu() {
    const gl = this.canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { this.ctx2d = this.canvas.getContext('2d'); return; }
    this.gl = gl;
    const prog = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[portrait]', gl.getShaderInfoLog(s));
      gl.attachShader(prog, s);
    }
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    for (const n of ['uBase', 'uYeux', 'uBouche', 'uCarte', 'uT', 'uCligne', 'uParle', 'uSouffle', 'uOndule']) this.u[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(this.u.uBase, 0); gl.uniform1i(this.u.uYeux, 1); gl.uniform1i(this.u.uBouche, 2); gl.uniform1i(this.u.uCarte, 3);
    this.tex = {};
  }

  texture(im) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    if (im) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /** Bouche qui bouge tant que `oui` est vrai (à appeler pendant l'affichage du texte). */
  parler(oui) { this.parle = !!oui; }

  definirLueur(couleur) {
    this.options.lueur = couleur;
    this.aura.style.background = couleur ? `radial-gradient(circle at 50% 45%, ${couleur} 0%, transparent 68%)` : 'none';
    this.aura.style.opacity = couleur ? '0.35' : '0';
  }

  definirParticules(type) {
    this.options.particules = type;
    this.particules = [];
    const p = PARTICULES[type];
    if (!p || this.reduit) { this.calque.getContext('2d').clearRect(0, 0, this.calque.width, this.calque.height); return; }
    for (let i = 0; i < p.nombre; i++) this.particules.push(this.nouvelleParticule(p, true));
  }

  nouvelleParticule(p, partout) {
    return {
      x: Math.random(), y: partout ? Math.random() : (p.vitesse < 0 ? 1.05 : -0.05),
      r: p.taille[0] + Math.random() * (p.taille[1] - p.taille[0]),
      v: p.vitesse * (0.6 + Math.random() * 0.8), phase: Math.random() * 6.28, vie: 0,
    };
  }

  boucle(maintenant) {
    this.raf = requestAnimationFrame(this.boucle);
    const dt = Math.min(0.05, (maintenant - this.dernier) / 1000);
    this.dernier = maintenant;
    const t = (maintenant - this.t0) / 1000;
    this.majClignement(dt);
    // parole : ouvertures irrégulières (syllabes) de 0,08 à 0,18 s
    if (this.parle) {
      this.syllabe = (this.syllabe ?? 0) - dt;
      if (this.syllabe <= 0) { this.cible = this.cible > 0.5 ? 0.1 * Math.random() : 0.55 + 0.45 * Math.random(); this.syllabe = 0.08 + Math.random() * 0.1; }
    } else this.cible = 0;
    this.valParle += ((this.cible ?? 0) - this.valParle) * Math.min(1, dt * 22);

    if (this.gl && this.tex.base) {
      const gl = this.gl;
      gl.viewport(0, 0, 512, 512);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      ['base', 'yeux', 'bouche', 'carte'].forEach((n, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, this.tex[n]); });
      const bouge = !this.reduit;
      gl.uniform1f(this.u.uT, t);
      gl.uniform1f(this.u.uCligne, this.options.clignement ? this.cligne : 0);
      gl.uniform1f(this.u.uParle, this.valParle);
      gl.uniform1f(this.u.uSouffle, bouge && this.options.respiration ? 0.5 - 0.5 * Math.cos(t * 2 * Math.PI / 4.2) : 0);
      gl.uniform1f(this.u.uOndule, bouge && this.options.cheveux ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (this.ctx2d && this.imageBase && !this.dessine) {
      this.ctx2d.clearRect(0, 0, 512, 512);
      this.ctx2d.drawImage(this.imageBase, 0, 0, 512, 512);
      this.dessine = true;
    }
    if (this.options.lueur && !this.reduit) this.aura.style.opacity = (0.28 + 0.14 * Math.sin(t * 1.3)).toFixed(3);
    this.majParticules(dt, t);
  }

  majClignement(dt) {
    if (this.phaseClignement < 0) {
      this.prochainClignement -= dt;
      if (this.prochainClignement <= 0) { this.phaseClignement = 0; this.doubleClignement = Math.random() < 0.15; }
      this.cligne = 0;
      return;
    }
    // fermeture 0,06 s, tenue 0,04 s, ouverture 0,09 s
    this.phaseClignement += dt;
    const p = this.phaseClignement;
    this.cligne = p < 0.06 ? p / 0.06 : p < 0.10 ? 1 : p < 0.19 ? 1 - (p - 0.10) / 0.09 : 0;
    if (p >= 0.19) {
      if (this.doubleClignement) { this.doubleClignement = false; this.phaseClignement = -1; this.prochainClignement = 0.12; }
      else { this.phaseClignement = -1; this.prochainClignement = 2.5 + Math.random() * 3.5; }
    }
  }

  majParticules(dt, t) {
    const p = PARTICULES[this.options.particules];
    if (!p || this.reduit) return;
    const c = this.calque;
    const w = c.clientWidth || 256, h = c.clientHeight || 256;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    const echelle = h / 256;
    for (let i = 0; i < this.particules.length; i++) {
      const q = this.particules[i];
      q.vie += dt;
      q.y += (q.v * echelle * dt) / h;
      q.x += (Math.sin(t * 0.9 + q.phase) * p.derive * echelle * dt) / w / 3;
      if (q.y < -0.06 || q.y > 1.06) { this.particules[i] = this.nouvelleParticule(p, false); continue; }
      const bord = Math.min(1, q.vie / 1.2) * Math.min(1, (p.vitesse < 0 ? q.y : 1 - q.y) * 4);
      const scint = 0.55 + 0.45 * Math.sin(t * 3 + q.phase * 2);
      ctx.globalAlpha = Math.max(0, bord * scint * 0.9);
      const r = q.r * echelle;
      const g = ctx.createRadialGradient(q.x * w, q.y * h, 0, q.x * w, q.y * h, r * 3);
      g.addColorStop(0, p.couleur);
      g.addColorStop(0.35, p.couleur + 'aa');
      g.addColorStop(1, p.couleur + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(q.x * w, q.y * h, r * 3, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  detruire() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.gl) {
      for (const t of Object.values(this.tex)) this.gl.deleteTexture(t);
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    this.racine.remove();
  }
}
