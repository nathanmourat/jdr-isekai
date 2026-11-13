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
