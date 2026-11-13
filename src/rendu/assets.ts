/**
 * Textures : on utilise l'image du dossier assets/ si elle existe, sinon un « provisoire »
 * dessiné automatiquement (forme colorée + nom). Déposer le vrai fichier suffit à le remplacer.
 */
const fichiers = import.meta.glob('/assets/**/*.{png,jpg,jpeg,webp}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** URL d'une image du dossier assets (chemin sans extension, ex. « decors/guilde »), ou null. */
export function urlAsset(chemin: string): string | null {
  for (const ext of ['png', 'webp', 'jpg', 'jpeg']) {
    const u = fichiers[`/assets/${chemin}.${ext}`];
    if (u) return u;
  }
  return null;
}

export function assetsPresents(): string[] {
  return Object.keys(fichiers).map((f) => f.replace(/^\/assets\//, '').replace(/\.(png|webp|jpe?g)$/, ''));
}

/** Couleur stable dérivée d'un nom. */
export function couleur(nom: string, s = 45, l = 38): string {
  let h = 0;
  for (const ch of nom) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} ${s}% ${l}%)`;
}

const cache = new Map<string, string>();

function canvas(l: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = l; c.height = h;
  return [c, c.getContext('2d')!];
}

function etiquette(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, taille: number, max: number) {
  ctx.font = `600 ${taille}px "Source Sans 3", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const w = Math.min(max, ctx.measureText(texte).width + taille);
  ctx.fillRect(x - w / 2, y - taille * 0.8, w, taille * 1.6);
  ctx.fillStyle = '#f3ead7';
  ctx.fillText(texte, x, y, max - taille);
}

/** Décor provisoire (1280 × 720) : ciel en dégradé, silhouettes, nom du lieu. */
export function decorProvisoire(nom: string, titre: string): string {
  const cle = `decor:${nom}`;
  if (cache.has(cle)) return cache.get(cle)!;
  const [c, ctx] = canvas(1280, 720);
  const g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, couleur(nom, 40, 22));
  g.addColorStop(1, couleur(nom + 'sol', 30, 10));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 720);
  // silhouettes de bâtiments / arbres, pseudo-aléatoires mais stables
  let graine = 0;
  for (const ch of nom) graine = (graine * 17 + ch.charCodeAt(0)) % 9973;
  const alea = () => ((graine = (graine * 9301 + 49297) % 233280) / 233280);
  for (let couche = 0; couche < 3; couche++) {
    ctx.fillStyle = `rgba(0,0,0,${0.18 + couche * 0.14})`;
    let x = -40;
    while (x < 1300) {
      const l = 60 + alea() * 160, h = 120 + alea() * (260 - couche * 60);
      ctx.fillRect(x, 720 - h - couche * 30 + 90, l, h);
      if (alea() > 0.5) { ctx.beginPath(); ctx.moveTo(x, 720 - h - couche * 30 + 90); ctx.lineTo(x + l / 2, 720 - h - couche * 30 + 30); ctx.lineTo(x + l, 720 - h - couche * 30 + 90); ctx.fill(); }
      x += l + alea() * 40;
    }
  }
  etiquette(ctx, titre, 640, 80, 34, 900);
  etiquette(ctx, `image provisoire — assets/decors/${nom}.png`, 640, 680, 16, 700);
  const url = c.toDataURL();
  cache.set(cle, url);
  return url;
}

/** Portrait provisoire (512 × 512) : silhouette en buste et nom. */
export function portraitProvisoire(cle: string, nom: string): string {
  const k = `portrait:${cle}`;
  if (cache.has(k)) return cache.get(k)!;
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = couleur(cle, 35, 24);
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = couleur(cle, 45, 46);
  ctx.beginPath(); ctx.arc(256, 210, 95, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(256, 520, 190, 200, 0, Math.PI, 0); ctx.fill();
  etiquette(ctx, nom, 256, 470, 30, 480);
  const url = c.toDataURL();
  cache.set(k, url);
  return url;
}

/** Carte provisoire (1920 × 1080). */
export function carteProvisoire(nom: string): string {
  const k = `carte:${nom}`;
  if (cache.has(k)) return cache.get(k)!;
  const [c, ctx] = canvas(1920, 1080);
  ctx.fillStyle = '#c9b48a';
  ctx.fillRect(0, 0, 1920, 1080);
  ctx.strokeStyle = 'rgba(80,60,30,0.25)';
  for (let i = 0; i < 1920; i += 80) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke(); }
  for (let i = 0; i < 1080; i += 80) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1920, i); ctx.stroke(); }
  // rivière et forêt indicatives
  ctx.strokeStyle = '#6b8fb3'; ctx.lineWidth = 18;
  ctx.beginPath(); ctx.moveTo(300, 0); ctx.bezierCurveTo(700, 400, 600, 700, 1100, 1080); ctx.stroke();
  ctx.fillStyle = 'rgba(60,100,50,0.45)';
  ctx.beginPath(); ctx.ellipse(560, 780, 260, 160, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(90,80,70,0.4)';
  ctx.fillRect(0, 0, 1920, 90);
  etiquette(ctx, 'Mur d\'Aube (nord)', 960, 45, 28, 600);
  etiquette(ctx, `Carte provisoire — assets/cartes/${nom}.png`, 960, 1040, 22, 900);
  const url = c.toDataURL();
  cache.set(k, url);
  return url;
}

/** Image de décor, de portrait ou de carte : vraie image si présente, sinon provisoire. */
export function imageDecor(nom: string, titre: string): string {
  return urlAsset(`decors/${nom}`) ?? decorProvisoire(nom, titre);
}
export function imageCarte(nom: string): string {
  return urlAsset(`cartes/${nom}`) ?? carteProvisoire(nom);
}
export function imagePortrait(chemins: string[], cle: string, nom: string): string {
  for (const ch of chemins) { const u = urlAsset(ch); if (u) return u; }
  return portraitProvisoire(cle, nom);
}

// ───────────────────────────── Plans de ville et positions livrées avec les images ─────────────────────────────

const positionsJson = import.meta.glob('/assets/{cartes,decors}/*.json', { import: 'default', eager: true }) as Record<string, unknown>;

/**
 * Positions livrées par le graphiste à côté d'une image (ex. « cartes/lysmont-plan » ou « decors/auberge-chambre ») :
 * `{ "guilde": { "x": 900, "y": 430 }, … }`, en pixels de l'image (1280 × 720). Null si le fichier n'est pas encore là.
 * Le fichier peut aussi ranger les positions sous une clé « lieux » ou « positions ».
 */
export function positionsImage(chemin: string): Record<string, { x: number; y: number }> | null {
  const brut = positionsJson[`/assets/${chemin}.json`] as Record<string, unknown> | undefined;
  if (!brut || typeof brut !== 'object') return null;
  const source = (brut.lieux ?? brut.positions ?? brut) as Record<string, unknown>;
  const res: Record<string, { x: number; y: number }> = {};
  for (const [k, v] of Object.entries(source)) {
    const p = v as { x?: unknown; y?: unknown } | null;
    if (p && typeof p.x === 'number' && typeof p.y === 'number') res[k] = { x: p.x, y: p.y };
  }
  return Object.keys(res).length ? res : null;
}

/** Plan de ville provisoire (1280 × 720) : remparts, rues, place centrale. */
export function planProvisoire(nom: string, titre: string): string {
  const k = `plan:${nom}`;
  if (cache.has(k)) return cache.get(k)!;
  const [c, ctx] = canvas(1280, 720);
  ctx.fillStyle = '#b9c79a';
  ctx.fillRect(0, 0, 1280, 720);
  // remparts
  ctx.fillStyle = '#d8ccb0';
  ctx.strokeStyle = '#6b5a3c'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.roundRect(110, 60, 1060, 600, 60); ctx.fill(); ctx.stroke();
  // rues
  ctx.strokeStyle = '#a8977a'; ctx.lineWidth = 34;
  ctx.beginPath(); ctx.moveTo(640, 60); ctx.lineTo(640, 660); ctx.moveTo(110, 400); ctx.lineTo(1170, 400); ctx.stroke();
  ctx.lineWidth = 18;
  ctx.beginPath(); ctx.moveTo(300, 200); ctx.lineTo(1000, 600); ctx.moveTo(980, 200); ctx.lineTo(360, 600); ctx.stroke();
  // place centrale
  ctx.fillStyle = '#e6dcc4';
  ctx.beginPath(); ctx.arc(640, 400, 70, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7fb3ff';
  ctx.beginPath(); ctx.arc(640, 400, 18, 0, Math.PI * 2); ctx.fill();
  etiquette(ctx, titre, 640, 30, 26, 700);
  etiquette(ctx, `plan provisoire — assets/cartes/${nom}.png`, 640, 695, 16, 700);
  const url = c.toDataURL();
  cache.set(k, url);
  return url;
}

export function imagePlan(nom: string, titre: string): string {
  return urlAsset(`cartes/${nom}`) ?? planProvisoire(nom, titre);
}