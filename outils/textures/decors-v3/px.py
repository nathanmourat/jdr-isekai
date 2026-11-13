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
    """Pinceau pixel sur une image RGBA."""

    def __init__(self, img):
        self.img = img
        self.d = ImageDraw.Draw(img)

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.img.width and 0 <= y < self.img.height:
            if len(c) == 4 and c[3] < 255:
                o = self.img.getpixel((x, y))
                a = c[3] / 255
                oa = o[3] / 255
                na = a + oa * (1 - a)
                if na == 0:
                    return
                col = tuple(int((c[i] * a + o[i] * oa * (1 - a)) / na) for i in range(3))
                self.img.putpixel((x, y), col + (int(na * 255),))
            else:
                self.img.putpixel((x, y), c)

    def _blend(self, c, fn):
        """Dessine une forme translucide en la mélangeant au lieu de la remplacer."""
        layer = Image.new('RGBA', self.img.size, (0, 0, 0, 0))
        fn(ImageDraw.Draw(layer), c[:3] + (255,))
        a = np.array(layer)
        a[:, :, 3] = (a[:, :, 3].astype(int) * c[3] // 255).astype(np.uint8)
        self.img.alpha_composite(Image.fromarray(a))

    def rect(self, x0, y0, x1, y1, c):
        x0, x1 = sorted((int(round(x0)), int(round(x1))))
        y0, y1 = sorted((int(round(y0)), int(round(y1))))
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.rectangle([x0, y0, x1, y1], fill=cc))
        self.d.rectangle([x0, y0, x1, y1], fill=c)

    def ell(self, x0, y0, x1, y1, c):
        box = [int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))]
        if box[2] < box[0] or box[3] < box[1]:
            return
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.ellipse(box, fill=cc))
        self.d.ellipse(box, fill=c)

    def line(self, x0, y0, x1, y1, c, w=1):
        pts = [int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))]
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.line(pts, fill=cc, width=w))
        self.d.line(pts, fill=c, width=w)

    def poly(self, pts, c):
        q = [(int(round(x)), int(round(y))) for x, y in pts]
        if len(c) == 4 and c[3] < 255:
            return self._blend(c, lambda d, cc: d.polygon(q, fill=cc))
        self.d.polygon(q, fill=c)

    def thick(self, x0, y0, x1, y1, c, r=1):
        """Segment épais : disques le long du trait."""
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            t = i / max(n, 1)
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            if r <= 0:
                self.px(x, y, c)
            else:
                self.rect(x - r + 0.5, y - r + 0.5, x + r - 0.5, y + r - 0.5, c) if r == 1 else self.ell(x - r, y - r, x + r - 1, y + r - 1, c)


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


def dither_v(p, x0, y0, x1, y1, cols, seed=0):
    """Dégradé vertical en bandes avec tramage ordonné entre les bandes."""
    bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    h = y1 - y0
    n = len(cols) - 1
    for y in range(y0, y1):
        t = (y - y0) / max(h, 1) * n
        i = min(int(t), n - 1)
        f = t - i
        for x in range(x0, x1):
            c = cols[i + 1] if f * 16 > bayer[y % 4][x % 4] + 0.5 else cols[i]
            p.img.putpixel((x, y), c)


def noise_fill(p, x0, y0, x1, y1, base, var=0.08, seed=0, density=0.25):
    rnd = random.Random(seed)
    p.rect(x0, y0, x1, y1, base)
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            r = rnd.random()
            if r < density / 2:
                p.px(x, y, shade(base, 1 - var))
            elif r < density:
                p.px(x, y, shade(base, 1 + var))
