/**
 * PortraitAnime — anime un portrait de dialogue 512 × 512 (style anime, fond transparent),
 * avec des mouvements aussi naturels que possible (inspiré des portraits « Live2D »).
 *
 * Calques d'une expression (même cadrage que le portrait) :
 *   base  : le portrait (portrait-<expression>.png)
 *   yeux  : yeux fermés, seulement la zone des yeux (alpha = masque adouci)
 *   carte : R = cheveux, G = respiration, B = tête
 * Réglages d'une expression (anim.json) : bouche [x, y], largeur, ouverte, cou [x, y].
 *
 * Ce qui bouge :
 *   - respiration irrégulière (inspiration plus courte que l'expiration, pause), épaules qui montent,
 *     plus courte et plus rapide quand le personnage parle ;
 *   - tête jamais tout à fait immobile (petits balancements lents, changements de posture),
 *     petits hochements sur les syllabes accentuées ;
 *   - cheveux : vagues qui descendent vers les pointes, souffle d'air irrégulier, et inertie
 *     (ils suivent la tête avec un temps de retard) ;
 *   - clignements au rythme humain (fermeture rapide, ouverture plus lente, parfois double),
 *     plus fréquents en fin de phrase et pendant un changement d'expression (qui masque le fondu) ;
 *   - bouche : la mâchoire s'abaisse et l'intérieur de la bouche apparaît, selon les lettres
 *     prononcées (voyelles ouvertes, m/b/p fermées), avec un lissage naturel ;
 *   - lueur douce et particules en profondeur (proches = plus grosses et floues), avec parallaxe.
 * Avec prefers-reduced-motion : clignement et parole seulement. Sans WebGL : portrait fixe.
 *
 *   const p = new PortraitAnime(conteneur, { lueur: '#f3c45a', particules: 'lucioles' });
 *   await p.charger({ base, yeux, carte }, reglages);   // reglages = anim.json.expressions[e]
 *   p.prononcer('a');        // à chaque lettre affichée (effet machine à écrire)
 *   p.parler(false);         // fin de la réplique
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
uniform sampler2D uBase, uYeux, uCarte, uAvant;
uniform float uT, uCligne, uOuvre, uSouffle, uMix, uLumiere, uOndule, uRafale;
uniform vec3 uTete;       // angle (rad), dx, dy
uniform vec2 uInertie;    // décalage des cheveux dû aux mouvements de la tête
uniform vec4 uBouche;     // x, y, largeur, 1 si la bouche est déjà ouverte
uniform vec2 uCou;        // pivot de la tête

vec2 deformer(vec2 uv, vec4 carte) {
  // tête : rotation autour du cou + petite translation (transformation inverse)
  float wt = carte.b;
  vec2 p = uv - uCou;
  float a = -uTete.x * wt;
  p = vec2(cos(a) * p.x - sin(a) * p.y, sin(a) * p.x + cos(a) * p.y);
  uv = uCou + p - uTete.yz * wt;
  // respiration : les épaules et le buste montent et s'élargissent à peine
  float g = carte.g;
  uv.y += uSouffle * g * 0.0036;
  uv.x = 0.5 + (uv.x - 0.5) * (1.0 - uSouffle * g * 0.0022);
  // cheveux : vague qui descend vers les pointes (déphasage), modulée par le souffle d'air, + inertie
  float r = carte.r;
  float descente = vUv.y * 9.0;
  float vague = sin(uT * 1.3 - descente) * 0.0024 + sin(uT * 2.3 - descente * 1.7 + 1.1) * 0.0009;
  uv.x += (vague * (0.45 + uRafale) * uOndule + uInertie.x) * r;
  uv.y += (sin(uT * 1.1 - descente * 0.8) * 0.0007 * uOndule + uInertie.y) * r;
  return uv;
}

void main() {
  vec4 carte = texture2D(uCarte, vUv);
  vec2 uv = deformer(vUv, carte);

  // mâchoire : le contenu sous la lèvre du haut descend (dans le repère de l'image affichée)
  vec2 b = uBouche.xy;
  float L = uBouche.z;
  float fx = exp(-pow((uv.x - b.x) / (L * 0.75), 2.0));
  float fy = clamp((uv.y - b.y) / 0.004, 0.0, 1.0) * clamp(1.0 - (uv.y - b.y - 0.006) / 0.045, 0.0, 1.0);
  float amp = uOuvre * (uBouche.w > 0.5 ? 0.008 : 0.016);
  vec2 uvM = uv - vec2(0.0, amp * fx * fy);

  vec4 c = texture2D(uBase, uvM);
  if (uMix < 1.0) c = mix(texture2D(uAvant, uvM), c, uMix);
  vec4 y = texture2D(uYeux, uvM);
  c.rgb = mix(c.rgb, y.rgb, y.a * uCligne);

  // intérieur de la bouche (bouche fermée au repos) : lentille entre les deux lèvres
  if (uBouche.w < 0.5 && uOuvre > 0.01) {
    float t = (uv.x - b.x) / (L * 0.5);
    float h = amp * 0.95 * pow(max(0.0, 1.0 - t * t), 0.8);
    float d = uv.y - b.y - 0.0008;
    float dedans = smoothstep(-0.0008, 0.0008, d) * (1.0 - smoothstep(h - 0.0012, h + 0.0004, d)) * step(abs(t), 1.0);
    float prof = clamp(d / max(h, 0.0001), 0.0, 1.0);
    vec3 fond = mix(vec3(0.22, 0.08, 0.09), vec3(0.42, 0.16, 0.17), smoothstep(0.55, 1.0, prof));
    // dents du haut, à peine visibles quand la bouche s'ouvre bien
    float dents = (1.0 - smoothstep(0.0, 0.28, prof)) * smoothstep(0.35, 0.8, uOuvre) * (1.0 - smoothstep(0.6, 1.0, abs(t)));
    fond = mix(fond, vec3(0.93, 0.9, 0.86), dents * 0.85);
    c.rgb = mix(c.rgb, fond, dedans * c.a);
  }

  c.rgb *= 1.0 + uLumiere;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

const PARTICULES = {
  lucioles: { couleur: '#ffd77a', nombre: 12, vitesse: -7, taille: [1.0, 2.2], derive: 9 },
  braises: { couleur: '#ff8a3d', nombre: 14, vitesse: -14, taille: [0.8, 1.9], derive: 13 },
  magie: { couleur: '#9fd8ff', nombre: 14, vitesse: -6, taille: [0.9, 2.0], derive: 7 },
  neige: { couleur: '#f4f8ff', nombre: 14, vitesse: 9, taille: [1.0, 2.4], derive: 11 },
  ombre: { couleur: '#b07cff', nombre: 10, vitesse: -5, taille: [1.2, 2.6], derive: 6 },
};

// Ouverture de la bouche selon la lettre (français simplifié)
const OUVERTURE = (() => {
  const t = {};
  for (const c of 'aàâ') t[c] = 1.0;
  for (const c of 'oôœ') t[c] = 0.75;
  for (const c of 'eéèêë') t[c] = 0.6;
  for (const c of 'iîïy') t[c] = 0.45;
  for (const c of 'uùûü') t[c] = 0.32;
  for (const c of 'mbp') t[c] = 0.0;
  for (const c of 'fv') t[c] = 0.12;
  for (const c of 'lnrdtsz') t[c] = 0.3;
  for (const c of 'cgjkqx') t[c] = 0.35;
  return t;
})();

// Bruit doux : somme de sinus à fréquences sans rapport simple (jamais périodique à l'œil)
function bruit(t, graine) {
  return (Math.sin(t * 1.0 + graine) * 0.5 + Math.sin(t * 2.17 + graine * 1.7) * 0.3 + Math.sin(t * 3.71 + graine * 2.3) * 0.2);
}
const lisser = (x) => x * x * (3 - 2 * x);

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
    this.options = { lueur: null, particules: null, respiration: true, cheveux: true, clignement: true, tete: true, ...options };
    this.reduit = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.racine = document.createElement('div');
    this.racine.className = 'portrait-anime';
    Object.assign(this.racine.style, { position: 'relative', width: '100%', aspectRatio: '1 / 1' });
    this.aura = document.createElement('div');
    Object.assign(this.aura.style, {
      position: 'absolute', inset: '8%', borderRadius: '50%', pointerEvents: 'none',
      filter: 'blur(20px)', opacity: '0', transition: 'opacity 400ms',
    });
    this.fondPart = document.createElement('canvas');   // particules derrière le personnage
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = 512;
    this.avantPart = document.createElement('canvas');  // particules devant
    for (const c of [this.fondPart, this.canvas, this.avantPart]) {
      Object.assign(c.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
    }
    this.racine.append(this.aura, this.fondPart, this.canvas, this.avantPart);
    conteneur.appendChild(this.racine);

    this.reglages = { bouche: [0.55, 0.425], largeur: 0.06, ouverte: false, cou: [0.55, 0.5] };
    this.ouvre = 0; this.vitOuvre = 0; this.cibleOuvre = 0; this.finSyllabe = 0;
    this.parle = false; this.dernierePrononciation = -1;
    this.cligne = 0; this.phaseCligne = -1; this.prochainCligne = 1.2; this.doubleCligne = false; this.surCligneFerme = null;
    this.souffle = { phase: 0, duree: 4.4, valeur: 0 };
    this.tete = { a: 0, x: 0, y: 0, va: 0, vx: 0, vy: 0, posture: [0, 0, 0], prochainePosture: 4, hoche: 0 };
    this.inertie = { x: 0, y: 0, vx: 0, vy: 0 };
    this.mix = 1;
    this.graine = Math.random() * 100;
    this.particules = [];
    this.t0 = performance.now();
    this.dernier = this.t0;
    this.boucle = this.boucle.bind(this);
    this.definirLueur(this.options.lueur);
    this.definirParticules(this.options.particules);
  }

  /** Charge (ou change) l'expression. Le changement se fait pendant un clignement, en fondu. */
  async charger({ base, yeux, carte }, reglages) {
    const [ib, iy, ic] = await Promise.all([chargerImage(base), yeux ? chargerImage(yeux) : null, carte ? chargerImage(carte) : null]);
    if (!this.gl && !this.ctx2d) this.initRendu();
    const appliquer = () => {
      if (reglages) this.reglages = { ...this.reglages, ...reglages };
      if (this.gl) {
        const vide = this.textureVide || (this.textureVide = this.texture(null));
        if (this.tex.base) {
          if (this.tex.avant && this.tex.avant !== vide) this.gl.deleteTexture(this.tex.avant);
          this.tex.avant = this.tex.base;   // ancienne expression, pour le fondu
          this.mix = 0;
        } else this.tex.avant = vide;
        for (const n of ['yeux', 'carte']) if (this.tex[n] && this.tex[n] !== vide) this.gl.deleteTexture(this.tex[n]);
        this.tex.base = this.texture(ib);
        this.tex.yeux = iy ? this.texture(iy) : vide;
        this.tex.carte = ic ? this.texture(ic) : vide;
      } else { this.imageBase = ib; this.dessine = false; }
    };
    if (this.tex && this.tex.base && this.options.clignement) {
      // on cligne, et l'image change quand les yeux sont fermés
      this.surCligneFerme = appliquer;
      this.lancerClignement();
    } else appliquer();
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
    for (const n of ['uBase', 'uYeux', 'uCarte', 'uAvant', 'uT', 'uCligne', 'uOuvre', 'uSouffle', 'uMix', 'uLumiere', 'uOndule', 'uRafale', 'uTete', 'uInertie', 'uBouche', 'uCou']) {
      this.u[n] = gl.getUniformLocation(prog, n);
    }
    gl.uniform1i(this.u.uBase, 0); gl.uniform1i(this.u.uYeux, 1); gl.uniform1i(this.u.uCarte, 2); gl.uniform1i(this.u.uAvant, 3);
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

  /** À appeler à chaque lettre affichée : la bouche prend la forme de la lettre. */
  prononcer(c) {
    const l = (c || '').toLowerCase();
    this.parle = true;
    this.dernierePrononciation = this.temps;
    if (/[.!?…]/.test(l)) {
      this.cibleOuvre = 0;
      this.finSyllabe = this.temps + 0.25;
      if (Math.random() < 0.3) this.prochainCligne = Math.min(this.prochainCligne, 0.15); // clignement en fin de phrase
      return;
    }
    if (/[,;:\s—-]/.test(l)) { this.cibleOuvre *= 0.4; return; }
    const o = OUVERTURE[l];
    if (o === undefined) return;
    this.cibleOuvre = o * (0.8 + Math.random() * 0.25);
    // hochement léger sur certaines voyelles ouvertes (accent de la phrase)
    if (o >= 0.75 && Math.random() < 0.18) this.tete.hoche = 1;
  }

  /** Parole sans texte (vrai) ou fin de la réplique (faux). */
  parler(oui) {
    this.parle = !!oui;
    if (!oui) this.cibleOuvre = 0;
  }

  definirLueur(couleur) {
    this.options.lueur = couleur;
    this.aura.style.background = couleur ? `radial-gradient(circle at 50% 42%, ${couleur} 0%, transparent 66%)` : 'none';
    this.aura.style.opacity = couleur ? '0.22' : '0';
  }

  definirParticules(type) {
    this.options.particules = type;
    this.particules = [];
    for (const c of [this.fondPart, this.avantPart]) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    const p = PARTICULES[type];
    if (!p || this.reduit) return;
    for (let i = 0; i < p.nombre; i++) this.particules.push(this.nouvelleParticule(p, true));
  }

  nouvelleParticule(p, partout) {
    const proche = Math.random() < 0.25;   // 1 sur 4 devant le personnage, plus grosse et floue
    const prof = proche ? 1.6 + Math.random() * 0.8 : 0.5 + Math.random() * 0.5;
    return {
      x: Math.random(), y: partout ? Math.random() : (p.vitesse < 0 ? 1.08 : -0.08),
      r: (p.taille[0] + Math.random() * (p.taille[1] - p.taille[0])) * prof,
      v: p.vitesse * (0.6 + Math.random() * 0.8) * prof, prof, proche,
      phase: Math.random() * 6.28, vie: 0,
    };
  }

  lancerClignement() {
    if (this.phaseCligne < 0) { this.phaseCligne = 0; this.doubleCligne = Math.random() < 0.12; }
  }

  majClignement(dt) {
    if (this.phaseCligne < 0) {
      // plus de clignements quand on parle ; intervalle irrégulier
      this.prochainCligne -= dt * (this.parle ? 1.15 : 1);
      this.cligne = 0;
      if (this.prochainCligne <= 0) this.lancerClignement();
      if (this.phaseCligne < 0) return;
    }
    // fermeture 0,075 s (accélère), fermé 0,045 s, ouverture 0,14 s (ralentit)
    this.phaseCligne += dt;
    const p = this.phaseCligne;
    const F = 0.075, T = 0.045, O = 0.14;
    if (p < F) this.cligne = (p / F) ** 2;
    else if (p < F + T) {
      this.cligne = 1;
      if (this.surCligneFerme) { this.surCligneFerme(); this.surCligneFerme = null; }
    } else if (p < F + T + O) this.cligne = 1 - lisser((p - F - T) / O);
    else {
      this.cligne = 0;
      this.phaseCligne = -1;
      if (this.doubleCligne) { this.doubleCligne = false; this.prochainCligne = 0.1; }
      else this.prochainCligne = 2.4 + Math.random() * 3.2 + (Math.random() < 0.2 ? 3 : 0);
    }
  }

  majSouffle(dt) {
    const s = this.souffle;
    const duree = this.parle ? s.duree * 0.75 : s.duree;
    s.phase += dt / duree;
    if (s.phase >= 1) { s.phase -= 1; s.duree = 4.0 + Math.random() * 1.2; }
    const p = s.phase;
    // inspiration 38 %, expiration 45 %, pause 17 % ; plus faible pendant la parole
    let v = p < 0.38 ? lisser(p / 0.38) : p < 0.83 ? 1 - lisser((p - 0.38) / 0.45) : 0;
    s.valeur = v * (this.parle ? 0.6 : 1);
  }

  majTete(dt, t) {
    const h = this.tete;
    // changement de posture de temps en temps (petit déplacement qui se stabilise)
    h.prochainePosture -= dt;
    if (h.prochainePosture <= 0) {
      h.posture = [(Math.random() - 0.5) * 0.016, (Math.random() - 0.5) * 0.004, (Math.random() - 0.5) * 0.002];
      h.prochainePosture = 5 + Math.random() * 7;
    }
    // balancement lent permanent + hochement sur les syllabes accentuées
    h.hoche = Math.max(0, h.hoche - dt * 4);
    const hoche = Math.sin((1 - h.hoche) * Math.PI) * (h.hoche > 0 ? 1 : 0);
    const cible = [
      h.posture[0] + bruit(t * 0.31, this.graine) * 0.006,
      h.posture[1] + bruit(t * 0.23, this.graine + 3) * 0.0016,
      h.posture[2] + bruit(t * 0.27, this.graine + 7) * 0.0009 + hoche * 0.0018 + this.souffle.valeur * 0.0006,
    ];
    // ressort amorti (mouvement souple, sans à-coups)
    const k = 18, amort = 7.5;
    const va = h.va, vx = h.vx, vy = h.vy;
    h.va += ((cible[0] - h.a) * k - h.va * amort) * dt;
    h.vx += ((cible[1] - h.x) * k - h.vx * amort) * dt;
    h.vy += ((cible[2] - h.y) * k - h.vy * amort) * dt;
    h.a += h.va * dt; h.x += h.vx * dt; h.y += h.vy * dt;
    // inertie des cheveux : ils sont « tirés » dans le sens inverse de l'accélération de la tête
    const ax = (h.vx - vx) / Math.max(dt, 1e-3) + (h.va - va) / Math.max(dt, 1e-3) * 0.25;
    const ay = (h.vy - vy) / Math.max(dt, 1e-3);
    const I = this.inertie;
    I.vx += ((-ax * 0.012 - I.x) * 30 - I.vx * 5) * dt;
    I.vy += ((-ay * 0.008 - I.y) * 30 - I.vy * 5) * dt;
    I.x += I.vx * dt; I.y += I.vy * dt;
    I.x = Math.max(-0.004, Math.min(0.004, I.x));
    I.y = Math.max(-0.003, Math.min(0.003, I.y));
  }

  majBouche(dt) {
    // fin de parole si plus aucune lettre depuis un moment
    if (this.parle && this.dernierePrononciation >= 0 && this.temps - this.dernierePrononciation > 0.35) { this.parle = false; this.cibleOuvre = 0; }
    if (!this.parle) this.cibleOuvre = 0;
    // lissage exponentiel (stable même si l'affichage ralentit) : s'ouvre vite, se ferme un peu moins vite
    const k = this.cibleOuvre > this.ouvre ? 28 : 18;
    this.ouvre += (this.cibleOuvre - this.ouvre) * (1 - Math.exp(-k * dt));
  }

  boucle(maintenant) {
    this.raf = requestAnimationFrame(this.boucle);
    const dt = Math.min(0.05, (maintenant - this.dernier) / 1000);
    this.dernier = maintenant;
    const t = (maintenant - this.t0) / 1000;
    this.temps = t;
    const bouge = !this.reduit;
    this.majClignement(dt);
    this.majSouffle(dt);
    if (bouge) { const n = Math.ceil(dt / 0.017); for (let i = 0; i < n; i++) this.majTete(dt / n, t); }
    this.majBouche(dt);
    if (this.mix < 1) this.mix = Math.min(1, this.mix + dt / 0.12);

    if (this.gl && this.tex.base) {
      const gl = this.gl, u = this.u, R = this.reglages, h = this.tete, tete = bouge && this.options.tete;
      gl.viewport(0, 0, 512, 512);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      ['base', 'yeux', 'carte', 'avant'].forEach((n, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, this.tex[n]); });
      gl.uniform1f(u.uT, t);
      gl.uniform1f(u.uCligne, this.options.clignement ? this.cligne : 0);
      gl.uniform1f(u.uOuvre, this.ouvre);
      gl.uniform1f(u.uSouffle, bouge && this.options.respiration ? this.souffle.valeur : 0);
      gl.uniform1f(u.uMix, this.mix);
      gl.uniform1f(u.uOndule, bouge && this.options.cheveux ? 1 : 0);
      gl.uniform1f(u.uRafale, bouge ? Math.max(0, bruit(t * 0.17, this.graine + 11)) * 0.9 : 0);
      gl.uniform1f(u.uLumiere, this.options.lueur && bouge ? bruit(t * 0.9, this.graine + 5) * 0.012 : 0);
      gl.uniform3f(u.uTete, tete ? h.a : 0, tete ? h.x : 0, tete ? h.y : 0);
      gl.uniform2f(u.uInertie, bouge && this.options.cheveux ? this.inertie.x : 0, bouge && this.options.cheveux ? this.inertie.y : 0);
      gl.uniform4f(u.uBouche, R.bouche[0], R.bouche[1], R.largeur, R.ouverte ? 1 : 0);
      gl.uniform2f(u.uCou, R.cou[0], R.cou[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (this.ctx2d && this.imageBase && !this.dessine) {
      this.ctx2d.clearRect(0, 0, 512, 512);
      this.ctx2d.drawImage(this.imageBase, 0, 0, 512, 512);
      this.dessine = true;
    }
    if (this.options.lueur && bouge) this.aura.style.opacity = (0.2 + 0.06 * bruit(t * 0.4, this.graine + 9)).toFixed(3);
    this.majParticules(dt, t);
  }

  majParticules(dt, t) {
    const p = PARTICULES[this.options.particules];
    if (!p || this.reduit) return;
    const w = this.canvas.clientWidth || 256, h = this.canvas.clientHeight || 256;
    const ctxs = [];
    for (const c of [this.fondPart, this.avantPart]) {
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      ctxs.push(ctx);
    }
    const echelle = h / 256;
    const px = this.tete.x * w * 6, py = this.tete.y * h * 6;   // parallaxe : les proches bougent plus
    for (let i = 0; i < this.particules.length; i++) {
      const q = this.particules[i];
      q.vie += dt;
      q.y += (q.v * echelle * dt) / h;
      q.x += (Math.sin(t * 0.7 + q.phase) * p.derive * q.prof * echelle * dt) / w / 3;
      if (q.y < -0.1 || q.y > 1.1) { this.particules[i] = this.nouvelleParticule(p, false); continue; }
      const ctx = q.proche ? ctxs[1] : ctxs[0];
      const bord = Math.min(1, q.vie / 1.5) * Math.min(1, (p.vitesse < 0 ? q.y : 1 - q.y) * 4);
      const scint = 0.6 + 0.4 * Math.sin(t * 2.2 + q.phase * 2);
      ctx.globalAlpha = Math.max(0, bord * scint * (q.proche ? 0.45 : 0.75));
      const r = q.r * echelle;
      const x = q.x * w + px * (q.prof - 1), y = q.y * h + py * (q.prof - 1);
      const flou = q.proche ? 4.5 : 2.6;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * flou);
      g.addColorStop(0, p.couleur);
      g.addColorStop(q.proche ? 0.15 : 0.3, p.couleur + 'aa');
      g.addColorStop(1, p.couleur + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * flou, 0, 6.2832);
      ctx.fill();
    }
    for (const ctx of ctxs) ctx.globalAlpha = 1;
  }

  detruire() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.gl) {
      for (const t of new Set(Object.values(this.tex))) this.gl.deleteTexture(t);
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    this.racine.remove();
  }
}
