"""Petits outils de pixel art (PIL, sans anti-crénelage)."""
import math, random
import numpy as np
from PIL import Image, ImageDraw

OUTLINE = (24, 20, 32, 255)


def hexc(h, a=255):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def shade(c, f):
    """f<1 assombrit, f>1 éclaircit."""
    r, g, b = c[:3]
    if f >= 1:
        r, g, b = [int(v + (255 - v) * (f - 1)) for v in (r, g, b)]
    else:
        r, g, b = [int(v * f) for v in (r, g, b)]
    return (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)), c[3] if len(c) > 3 else 255)


def new(w, h, bg=(0, 0, 0, 0)):
    return Image.new('RGBA', (w, h), bg)


class P:
    """Pinceau pixel sur une image RGBA.
    k = échelle : les coordonnées sont données dans la grille « de base » et multipliées par k.
    Les méthodes f* (fpx, fline, frect) dessinent au pixel fin (1 pixel réel), pour les détails."""

    def __init__(self, img, k=1):
        self.img = img
        self.k = k
        self.d = ImageDraw.Draw(img)

    # --- conversions
    def _c(self, v):
        return v * self.k + (self.k - 1) / 2

    def _blend(self, c, fn):
        """Dessine une forme translucide en la mélangeant au lieu de la remplacer."""
        layer = Image.new('RGBA', self.img.size, (0, 0, 0, 0))
        fn(ImageDraw.Draw(layer), c[:3] + (255,))
        a = np.array(layer)
        a[:, :, 3] = (a[:, :, 3].astype(int) * c[3] // 255).astype(np.uint8)
        self.img.alpha_composite(Image.fromarray(a))

    def _block(self, x0, y0, x1, y1, c):
        """Rectangle en pixels réels (bornes incluses), avec mélange si translucide."""
        W, H = self.img.size
        x0, y0 = max(0, int(x0)), max(0, int(y0))
        x1, y1 = min(W - 1, int(x1)), min(H - 1, int(y1))
        if x1 < x0 or y1 < y0:
            return
        if len(c) == 4 and c[3] < 255:
            a = np.array(self.img.crop((x0, y0, x1 + 1, y1 + 1))).astype(float)
            al = c[3] / 255
            oa = a[:, :, 3:4] / 255
            na = al + oa * (1 - al)
            col = np.array(c[:3], float)
            rgb = np.where(na > 0, (col * al + a[:, :, :3] * oa * (1 - al)) / np.maximum(na, 1e-6), 0)
            out = np.concatenate([rgb, na * 255], axis=2).clip(0, 255).astype(np.uint8)
            self.img.paste(Image.fromarray(out), (x0, y0))
        else:
            self.d.rectangle([x0, y0, x1, y1], fill=c)

    # --- grille de base
    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        k = self.k
        self._block(x * k, y * k, x * k + k - 1, y * k + k - 1, c)

    def rect(self, x0, y0, x1, y1, c):
        x0, x1 = sorted((int(round(x0)), int(round(x1))))
        y0, y1 = sorted((int(round(y0)), int(round(y1))))
        k = self.k
        self._block(x0 * k, y0 * k, x1 * k + k - 1, y1 * k + k - 1, c)

    def ell(self, x0, y0, x1, y1, c):
        k = self.k
        box = [int(round(x0)) * k, int(round(y0)) * k, int(round(x1)) * k + k - 1, int(round(y1)) * k + k - 1]
        if box[2] < box[0] or box[3] < box[1]:
            return
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.ellipse(box, fill=cc))
        self.d.ellipse(box, fill=c)

    def line(self, x0, y0, x1, y1, c, w=1):
        pts = [round(self._c(x0)), round(self._c(y0)), round(self._c(x1)), round(self._c(y1))]
        ww = w * self.k
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.line(pts, fill=cc, width=ww))
        self.d.line(pts, fill=c, width=ww)
        if ww > 1:  # extrémités arrondies proprement
            for (x, y) in ((pts[0], pts[1]), (pts[2], pts[3])):
                r = (ww - 1) / 2
                self.d.ellipse([x - r, y - r, x + r, y + r], fill=c)

    def poly(self, pts, c):
        q = [(round(self._c(x)), round(self._c(y))) for x, y in pts]
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.polygon(q, fill=cc))
        self.d.polygon(q, fill=c)

    def thick(self, x0, y0, x1, y1, c, r=1):
        """Segment épais (rayon r en unités de base)."""
        self.line(x0, y0, x1, y1, c, max(1, int(round(r * 2))))

    # --- pixel fin (détails)
    def fpx(self, x, y, c):
        """x, y en unités de base (fractions permises : 0,5 = demi-pixel de base)."""
        X, Y = int(np.floor(x * self.k)), int(np.floor(y * self.k))
        self._block(X, Y, X, Y, c)

    def fline(self, x0, y0, x1, y1, c, w=1):
        k = self.k
        pts = [int(np.floor(x0 * k)), int(np.floor(y0 * k)), int(np.floor(x1 * k)), int(np.floor(y1 * k))]
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.line(pts, fill=cc, width=w))
        self.d.line(pts, fill=c, width=w)

    def frect(self, x0, y0, x1, y1, c):
        """Rectangle en unités de base, bornes au pixel fin (x1, y1 exclus)."""
        k = self.k
        self._block(np.floor(x0 * k), np.floor(y0 * k), np.ceil(x1 * k) - 1, np.ceil(y1 * k) - 1, c)


def outline(img, c=OUTLINE, diag=False):
    """Ajoute un contour sombre d'1 px autour des pixels opaques."""
    a = np.array(img)
    op = a[:, :, 3] > 0
    nb = np.zeros_like(op)
    nb[1:, :] |= op[:-1, :]
    nb[:-1, :] |= op[1:, :]
    nb[:, 1:] |= op[:, :-1]
    nb[:, :-1] |= op[:, 1:]
    if diag:
        nb[1:, 1:] |= op[:-1, :-1]
        nb[:-1, :-1] |= op[1:, 1:]
        nb[1:, :-1] |= op[:-1, 1:]
        nb[:-1, 1:] |= op[1:, :-1]
    edge = nb & ~op
    a[edge] = c
    return Image.fromarray(a)


def tint(img, c, k):
    """Mélange la couleur c dans les pixels opaques (flash de dégât, etc.)."""
    a = np.array(img).astype(float)
    m = a[:, :, 3] > 0
    for i in range(3):
        a[:, :, i][m] = a[:, :, i][m] * (1 - k) + c[i] * k
    return Image.fromarray(a.astype(np.uint8))


def alpha_mul(img, k):
    a = np.array(img)
    a[:, :, 3] = (a[:, :, 3].astype(float) * k).astype(np.uint8)
    return Image.fromarray(a)


def rot(img, deg, center=None):
    return img.rotate(deg, resample=Image.NEAREST, center=center)


def up(img, k):
    return img.resize((img.width * k, img.height * k), Image.NEAREST)


BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16


def dither_v(p, x0, y0, x1, y1, cols, seed=0):
    """Dégradé vertical en bandes avec tramage ordonné, calculé au pixel fin."""
    k = p.k
    X0, Y0, X1, Y1 = int(x0 * k), int(y0 * k), int(x1 * k), int(y1 * k)
    W, H = p.img.size
    X0, Y0, X1, Y1 = max(0, X0), max(0, Y0), min(W, X1), min(H, Y1)
    if X1 <= X0 or Y1 <= Y0:
        return
    n = len(cols) - 1
    ys = np.arange(Y0, Y1)
    t = (ys - Y0) / max(Y1 - Y0, 1) * n
    i = np.minimum(t.astype(int), n - 1)
    f = t - i
    cols_a = np.array([c[:3] + ((c[3],) if len(c) > 3 else (255,)) for c in cols], np.uint8)
    xs = np.arange(X0, X1)
    th = BAYER[ys[:, None] % 4, xs[None, :] % 4]
    use_next = (f[:, None] > th + 1e-6)
    idx = np.where(use_next, i[:, None] + 1, i[:, None])
    block = cols_a[idx]
    p.img.paste(Image.fromarray(block, 'RGBA'), (X0, Y0))


def noise_fill(p, x0, y0, x1, y1, base, var=0.08, seed=0, density=0.25):
    k = p.k
    rnd = np.random.default_rng(seed)
    X0, Y0, X1, Y1 = int(x0 * k), int(y0 * k), int((x1 + 1) * k), int((y1 + 1) * k)
    W, H = p.img.size
    X0, Y0, X1, Y1 = max(0, X0), max(0, Y0), min(W, X1), min(H, Y1)
    if X1 <= X0 or Y1 <= Y0:
        return
    r = rnd.random((Y1 - Y0, X1 - X0))
    b = np.array(base[:3], float)
    dark, light = np.array(shade(base, 1 - var)[:3], float), np.array(shade(base, 1 + var)[:3], float)
    out = np.empty((Y1 - Y0, X1 - X0, 4), np.uint8)
    out[:, :, :3] = np.where((r < density / 2)[:, :, None], dark, np.where((r < density)[:, :, None], light, b))
    out[:, :, 3] = 255
    p.img.paste(Image.fromarray(out, 'RGBA'), (X0, Y0))


# ---------------------------------------------------------------- passes de rendu « HD »
def volume(img, light=0.13, dark=0.22, grad=0.10, keep=None):
    """Donne du volume : reflet sur les bords haut/gauche de chaque zone de couleur, ombre sur les bords bas/droite,
    et léger dégradé vertical (haut plus clair). `keep` : masque de pixels à ne pas modifier (effets lumineux)."""
    a = np.array(img).astype(np.int32)
    rgb = a[:, :, :3]
    op = a[:, :, 3] > 0
    key = (rgb[:, :, 0] << 16) | (rgb[:, :, 1] << 8) | rgb[:, :, 2]
    key = np.where(op, key, -1)
    H, W = key.shape

    def diff(dy, dx):
        sh = np.full_like(key, -2)
        ys = slice(max(0, dy), H + min(0, dy)); yd = slice(max(0, -dy), H + min(0, -dy))
        xs = slice(max(0, dx), W + min(0, dx)); xd = slice(max(0, -dx), W + min(0, -dx))
        sh[yd, xd] = key[ys, xs]
        return op & (sh != key)

    top, left = diff(-1, 0), diff(0, -1)
    bot, right = diff(1, 0), diff(0, 1)
    f = np.ones((H, W))
    f = np.where(top | left, 1 + light, f)
    f = np.where(bot | right, 1 - dark, f)
    f = np.where((top | left) & (bot | right), 1.0, f)
    ys = np.where(op.any(axis=1))[0]
    if len(ys):
        y0, y1 = ys.min(), ys.max() + 1
        g = np.ones(H)
        g[y0:y1] = 1 + grad / 2 - grad * (np.arange(y1 - y0) / max(1, y1 - y0 - 1))
        f = f * g[:, None]
    if keep is not None:
        f = np.where(keep, 1.0, f)
    out = rgb.astype(float)
    hi = f > 1
    out = np.where(hi[:, :, None], out + (255 - out) * (f[:, :, None] - 1), out * f[:, :, None])
    a[:, :, :3] = out.clip(0, 255).astype(np.int32)
    return Image.fromarray(a.astype(np.uint8))


def outline_sel(img, k=0.35, base=OUTLINE):
    """Contour 1 px coloré : une version très sombre de la couleur voisine (« selout ») au lieu d'un noir uniforme."""
    a = np.array(img).astype(np.int32)
    op = a[:, :, 3] > 200
    H, W = op.shape
    out = a.copy()
    acc = np.zeros((H, W, 3)); cnt = np.zeros((H, W))
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ys = slice(max(0, dy), H + min(0, dy)); yd = slice(max(0, -dy), H + min(0, -dy))
        xs = slice(max(0, dx), W + min(0, dx)); xd = slice(max(0, -dx), W + min(0, -dx))
        m = np.zeros((H, W), bool); m[yd, xd] = op[ys, xs]
        c = np.zeros((H, W, 3)); c[yd, xd] = a[ys, xs, :3]
        acc += c * m[:, :, None]; cnt += m
    edge = (cnt > 0) & ~(a[:, :, 3] > 0)
    col = acc / np.maximum(cnt, 1)[:, :, None] * k + np.array(base[:3]) * (1 - k)
    out[edge, :3] = col[edge].astype(np.int32)
    out[edge, 3] = 255
    return Image.fromarray(out.astype(np.uint8))


def grain(img, amount=0.07, density=0.16):
    """Texture fine (poil, grain, écailles) à l'intérieur des zones de couleur, accrochée à la silhouette."""
    a = np.array(img).astype(np.int32)
    op = a[:, :, 3] > 200
    if not op.any():
        return img
    ys, xs = np.where(op)
    y0, x0 = ys.min(), xs.min()
    H, W = op.shape
    yy, xx = np.mgrid[0:H, 0:W]
    h = ((xx - x0) * 73856093 ^ (yy - y0) * 19349663) % 1000 / 1000.0
    key = (a[:, :, 0] << 16) | (a[:, :, 1] << 8) | a[:, :, 2]
    inner = op.copy()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        inner &= np.roll(np.roll(key, dy, 0), dx, 1) == key
    dark = inner & (h < density / 2)
    light = inner & (h >= density / 2) & (h < density)
    rgb = a[:, :, :3].astype(float)
    rgb[dark] *= (1 - amount)
    rgb[light] = rgb[light] + (255 - rgb[light]) * amount
    a[:, :, :3] = rgb.clip(0, 255).astype(np.int32)
    return Image.fromarray(a.astype(np.uint8))
