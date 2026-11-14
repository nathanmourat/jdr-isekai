"""Briques de décor en 640×360 (agrandi ×2 → 1280×720), plus détaillées que la V1."""
import math, random
from PIL import Image
from px import *

W, H = 640, 360
K = 2  # facteur d'agrandissement final

WOOD = hexc('7a4e2c'); WOOD_D = hexc('553419'); WOOD_L = hexc('9a6a3e')
STONE = hexc('8a8478'); STONE_D = hexc('5e5a52'); STONE_L = hexc('aaa498')
GOLD = hexc('e8b83c'); WHITE = hexc('f4f0e8'); DARK = hexc('1a1620')


def canvas(bg=(0, 0, 0, 255)):
    img = new(W, H, bg)
    return img, P(img)


def finish(img, zones=None, vignette=0.35):
    if vignette:
        a = np.array(img).astype(float)
        yy, xx = np.mgrid[0:H, 0:W]
        d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        f = 1 - vignette * np.clip(d - 0.65, 0, 1) ** 1.5
        # tramage pour garder le rendu pixel
        bayer = np.tile(np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16, (H // 4 + 1, W // 4 + 1))[:H, :W]
        f8 = f * 8
        f = (np.floor(f8) + (bayer < (f8 - np.floor(f8)))) / 8
        for i in range(3):
            a[:, :, i] *= f
        img = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    out = up(img.convert('RGBA'), K).convert('RGB')
    z = {k: {'x': int(v[0] * K), 'y': int(v[1] * K)} for k, v in (zones or {}).items()}
    return out, z


def shadow(p, x, y, rx, ry=None, a=90):
    p.ell(x - rx, y - (ry or rx // 3), x + rx, y + (ry or rx // 3), (0, 0, 0, a))


def glow_light(p, x, y, r, c=(255, 190, 110), a=60, steps=4):
    for k in range(steps, 0, -1):
        rr = r * k / steps
        p.ell(x - rr, y - rr * 0.8, x + rr, y + rr * 0.8, (c[0], c[1], c[2], int(a / steps)))


# ------------------------------------------------------------------ murs et sols
def wall_planks(p, x0, y0, x1, y1, base=WOOD, seed=0):
    rnd = random.Random(seed)
    for x in range(x0, x1, 12):
        c = shade(base, 0.9 + rnd.random() * 0.2)
        p.rect(x, y0, min(x + 11, x1), y1, c)
        p.line(x, y0, x, y1, shade(base, 0.6))
        p.line(x + 1, y0, x + 1, y1, shade(c, 1.12))
        for _ in range(2):
            ky = rnd.randint(y0 + 5, y1 - 5)
            p.ell(x + 4, ky, x + 7, ky + 2, shade(c, 0.7))


def wall_stone(p, x0, y0, x1, y1, base=STONE, seed=0, h=10, w=22):
    rnd = random.Random(seed)
    p.rect(x0, y0, x1, y1, shade(base, 0.55))
    r = 0
    for y in range(y0, y1, h):
        off = (r % 2) * (w // 2)
        for x in range(x0 - off, x1, w):
            c = shade(base, 0.82 + rnd.random() * 0.3)
            p.rect(max(x0, x + 1), y + 1, min(x1, x + w - 1), min(y1, y + h - 1), c)
            p.line(max(x0, x + 1), y + 1, min(x1, x + w - 2), y + 1, shade(c, 1.18))
            p.line(max(x0, x + 1), min(y1, y + h - 1), min(x1, x + w - 1), min(y1, y + h - 1), shade(c, 0.78))
        r += 1


def wall_plaster(p, x0, y0, x1, y1, base=hexc('e8dcc0'), seed=0):
    rnd = random.Random(seed)
    p.rect(x0, y0, x1, y1, base)
    for _ in range((x1 - x0) * (y1 - y0) // 40):
        p.px(rnd.randint(x0, x1), rnd.randint(y0, y1), shade(base, rnd.choice([0.92, 1.05])))


def floor_planks(p, y0, y1, base=WOOD, vx=W // 2, vy=-200):
    p.rect(0, y0, W, y1, base)
    n = 9
    for i in range(n + 1):
        t = i / n
        y = y0 + (y1 - y0) * t ** 1.4
        p.line(0, y, W, y, shade(base, 0.7))
    for k in range(-14, 15):
        x_far = vx + k * 22
        x_near = vx + k * 60
        p.line(x_far, y0, x_near, y1, shade(base, 0.78))


def floor_stone(p, y0, y1, base=STONE, vx=W // 2):
    p.rect(0, y0, W, y1, base)
    rows = [y0]
    y = y0
    step = 6
    while y < y1:
        y += step
        step = int(step * 1.28) + 1
        rows.append(min(y, y1))
    for i, y in enumerate(rows):
        p.line(0, y, W, y, shade(base, 0.7))
        if i + 1 < len(rows):
            p.line(0, y + 1, W, y + 1, shade(base, 1.12))
    for k in range(-16, 17):
        p.line(vx + k * 26, y0, vx + k * 80, y1, shade(base, 0.72))


def ground_grass(p, y0, y1, base=hexc('5a9a3a'), seed=1):
    rnd = random.Random(seed)
    dither_v(p, 0, y0, W, y1, [shade(base, 1.15), base, shade(base, 0.85)])
    for _ in range((y1 - y0) * 6):
        x, y = rnd.randint(0, W - 1), rnd.randint(y0, y1 - 1)
        c = rnd.choice([shade(base, 0.8), shade(base, 1.2), shade(base, 0.7)])
        hh = 1 + int((y - y0) / (y1 - y0) * 3)
        p.line(x, y, x + rnd.choice([-1, 0, 1]), y - hh, c)


# ------------------------------------------------------------------ objets
def window(p, x, y, w, h, sky=(hexc('8ec0f0'), hexc('cfe6f8')), frame=WOOD_D, arch=False, night=False):
    if arch:
        p.ell(x, y - w // 2, x + w, y + w // 2, frame)
    p.rect(x, y, x + w, y + h, frame)
    ix0, iy0, ix1, iy1 = x + 2, y + 2, x + w - 2, y + h - 2
    cols = [hexc('1a2450'), hexc('2a3a70')] if night else list(sky)
    dither_v(p, ix0, iy0, ix1 + 1, iy1 + 1, cols)
    if arch:
        p.ell(x + 2, y - w // 2 + 2, x + w - 2, y + w // 2, cols[0])
    p.line(x + w // 2, iy0 - (w // 2 if arch else 0), x + w // 2, iy1, frame)
    p.line(ix0, y + h // 2, ix1, y + h // 2, frame)
    if night:
        p.ell(ix1 - 6, iy0 + 3, ix1 - 3, iy0 + 6, hexc('f4f0c0'))
        for k in range(3):
            p.px(ix0 + 3 + k * 5, iy0 + 4 + k * 3, WHITE)
    p.rect(x - 2, y + h, x + w + 2, y + h + 2, shade(frame, 1.3))


def door(p, x, y, w, h, c=WOOD, arch=True, open_=False):
    p.rect(x - 2, y - 2, x + w + 2, y + h, STONE_D)
    if arch:
        p.ell(x - 2, y - w // 2 - 2, x + w + 2, y + w // 2, STONE_D)
    inner = hexc('140f12') if open_ else c
    p.rect(x, y, x + w, y + h, inner)
    if arch:
        p.ell(x, y - w // 2, x + w, y + w // 2, inner)
    if not open_:
        for xx in range(x + 4, x + w, 5):
            p.line(xx, y - w // 3, xx, y + h, shade(c, 0.7))
        p.line(x, y + h // 4, x + w, y + h // 4, hexc('4a4a52'), 2)
        p.line(x, y + 3 * h // 4, x + w, y + 3 * h // 4, hexc('4a4a52'), 2)
        p.ell(x + w - 6, y + h // 2, x + w - 3, y + h // 2 + 3, GOLD)


def stairs_up(p, x, y, n=8, w=40, dx=6, dy=7, c=WOOD):
    """Escalier montant vers la droite, depuis (x, y) = bas gauche."""
    for i in range(n):
        sx = x + i * dx
        sy = y - i * dy
        p.rect(sx, sy - dy, sx + w, sy, shade(c, 0.85 + 0.03 * i))
        p.line(sx, sy - dy, sx + w, sy - dy, shade(c, 1.25))
    p.line(x + w, y, x + w + n * dx, y - n * dy, WOOD_D, 3)
    for i in range(0, n, 2):
        p.line(x + w + i * dx, y - i * dy, x + w + i * dx, y - i * dy - 16, WOOD_D, 2)
    p.line(x + w, y - 16, x + w + n * dx, y - n * dy - 16, WOOD_L, 2)


def barrel(p, x, y, r=9, h=22, c=WOOD):
    p.rect(x - r, y - h, x + r, y, c)
    p.ell(x - r - 1, y - h - 3, x + r + 1, y - h + 3, shade(c, 1.2))
    p.ell(x - r + 2, y - h - 2, x + r - 2, y - h + 2, shade(c, 0.6))
    for yy in (y - h + 4, y - 4):
        p.line(x - r, yy, x + r, yy, hexc('5a5a62'), 2)
    p.line(x - r + 2, y - h + 2, x - r + 2, y - 1, shade(c, 1.2))
    p.rect(x - r, y - 1, x + r, y, shade(c, 0.6))


def crate(p, x, y, s=18, c=WOOD_L):
    p.rect(x, y - s, x + s, y, c)
    p.rect(x, y - s, x + s, y - s + 2, shade(c, 1.2))
    p.line(x + 1, y - s + 1, x + s - 1, y - 1, shade(c, 0.7), 2)
    p.line(x, y - s, x, y, shade(c, 0.6)); p.line(x + s, y - s, x + s, y, shade(c, 0.6))


def table(p, x, y, w=60, c=WOOD_L, items=()):
    p.ell(x - w // 2, y - 8, x + w // 2, y + 6, shade(c, 0.7))
    p.ell(x - w // 2, y - 10, x + w // 2, y + 3, c)
    p.ell(x - w // 2 + 4, y - 9, x + w // 2 - 12, y - 4, shade(c, 1.15))
    p.rect(x - 3, y + 2, x + 3, y + 22, shade(c, 0.6))
    p.rect(x - 10, y + 21, x + 10, y + 23, shade(c, 0.5))
    for (dx, kind) in items:
        if kind == 'chope':
            p.rect(x + dx, y - 15, x + dx + 4, y - 9, hexc('c8a050')); p.rect(x + dx, y - 16, x + dx + 4, y - 15, WHITE)
            p.line(x + dx + 5, y - 14, x + dx + 5, y - 11, hexc('8a6a30'))
        elif kind == 'bougie':
            p.rect(x + dx, y - 16, x + dx + 2, y - 9, hexc('f0e6c8')); p.px(x + dx + 1, y - 18, hexc('ffd84a')); p.px(x + dx + 1, y - 17, hexc('ff8a2a'))
            glow_light(p, x + dx + 1, y - 17, 14, a=50, steps=3)
        elif kind == 'assiette':
            p.ell(x + dx - 4, y - 11, x + dx + 4, y - 8, hexc('d8d0c0')); p.ell(x + dx - 2, y - 11, x + dx + 2, y - 9, hexc('b86a3a'))


def stool(p, x, y, c=WOOD):
    p.ell(x - 7, y - 12, x + 7, y - 8, shade(c, 1.15))
    p.line(x - 5, y - 9, x - 6, y, c, 2); p.line(x + 5, y - 9, x + 6, y, c, 2)


def shelf(p, x, y, w, rows=3, gap=22, items='mix', seed=0):
    rnd = random.Random(seed)
    p.rect(x, y, x + w, y + rows * gap + 4, shade(WOOD_D, 0.8))
    for r in range(rows + 1):
        yy = y + r * gap
        p.rect(x - 2, yy, x + w + 2, yy + 2, WOOD_L)
    for r in range(rows):
        base = y + (r + 1) * gap
        xx = x + 3
        while xx < x + w - 6:
            k = rnd.choice(['pot', 'fiole', 'livre', 'livre', 'boite', 'fiole'] if items == 'mix' else [items])
            if k == 'pot':
                c = rnd.choice([hexc('b87a4a'), hexc('8a9aa8'), hexc('a8b870')])
                p.ell(xx, base - 12, xx + 9, base, c); p.rect(xx + 2, base - 15, xx + 7, base - 11, shade(c, 0.8))
                p.px(xx + 2, base - 9, shade(c, 1.4)); xx += 12
            elif k == 'fiole':
                c = rnd.choice([hexc('e84a4a'), hexc('4ad87a'), hexc('4a8aff'), hexc('d84aff'), hexc('ffd84a')])
                p.ell(xx, base - 8, xx + 6, base, c); p.rect(xx + 2, base - 12, xx + 4, base - 8, hexc('c8d8e0'))
                p.px(xx + 1, base - 6, WHITE); xx += 8
            elif k == 'livre':
                for _ in range(rnd.randint(2, 5)):
                    c = rnd.choice([hexc('8a2a2a'), hexc('2a4a8a'), hexc('3a6a3a'), hexc('6a4a2a'), hexc('5a2a6a')])
                    hh = rnd.randint(12, 17)
                    p.rect(xx, base - hh, xx + 3, base, c); p.px(xx + 1, base - hh + 3, GOLD); xx += 4
                xx += 2
            elif k == 'boite':
                c = rnd.choice([hexc('a87a4a'), hexc('6a5a8a')])
                p.rect(xx, base - 9, xx + 12, base, c); p.line(xx, base - 9, xx + 12, base - 9, shade(c, 1.3)); xx += 14


def fireplace(p, x, y, w=70, h=60, t=0):
    p.rect(x - 8, y - h - 14, x + w + 8, y - h - 6, STONE_L)
    wall_stone(p, x, y - h - 6, x + w, y, STONE, seed=3, h=8, w=14)
    p.rect(x + 12, y - h + 14, x + w - 12, y, hexc('1a1210'))
    p.ell(x + 12, y - h + 4, x + w - 12, y - h + 24, hexc('1a1210'))
    cx = x + w // 2
    for (dx, hh, c) in [(-10, 18, hexc('ff5a1a')), (6, 22, hexc('ff7a1a')), (-2, 26, hexc('ffa53a')), (0, 14, hexc('ffd84a'))]:
        p.poly([(cx + dx - 7, y - 4), (cx + dx + 7, y - 4), (cx + dx + (t % 2), y - 4 - hh)], c)
    p.rect(cx - 16, y - 5, cx + 16, y - 2, WOOD_D)
    glow_light(p, cx, y - 16, 90, a=90, steps=5)


def bed(p, x, y, w=110, h=40, c=hexc('8a3a3a')):
    p.rect(x, y - h - 30, x + 8, y, WOOD_D)  # tête de lit
    p.rect(x, y - h - 30, x + 8, y - h - 26, WOOD_L)
    p.rect(x, y - h, x + w, y - 8, WOOD)
    p.rect(x + 6, y - h - 8, x + w, y - h + 6, hexc('f0ece0'))  # drap
    p.rect(x + 8, y - h - 14, x + 34, y - h - 4, hexc('f8f4ec'))  # oreiller
    p.rect(x + 30, y - h - 10, x + w, y - h + 10, c)  # couverture
    p.line(x + 30, y - h - 10, x + w, y - h - 10, shade(c, 1.3))
    for k in range(x + 36, x + w, 12):
        p.line(k, y - h - 9, k, y - h + 9, shade(c, 0.8))
    p.rect(x + w - 4, y - h - 10, x + w + 2, y, WOOD_D)
    p.rect(x + 2, y - 8, x + 6, y, WOOD_D)


def banner(p, x, y, w, h, c, emblem=None):
    p.rect(x - 2, y - 2, x + w + 2, y, WOOD_D)
    p.rect(x, y, x + w, y + h, c)
    p.poly([(x, y + h), (x + w // 2, y + h + 8), (x + w, y + h)], c)
    p.line(x + 1, y, x + 1, y + h, shade(c, 1.25)); p.line(x + w - 1, y, x + w - 1, y + h, shade(c, 0.7))
    p.line(x, y + 2, x + w, y + 2, GOLD)
    if emblem == 'soleil':
        cx, cy = x + w // 2, y + h // 2
        p.ell(cx - 5, cy - 5, cx + 5, cy + 5, GOLD)
        for k in range(8):
            a = k / 8 * 2 * math.pi
            p.line(cx + math.cos(a) * 6, cy + math.sin(a) * 6, cx + math.cos(a) * 9, cy + math.sin(a) * 9, GOLD)


def torch_wall(p, x, y):
    p.rect(x - 1, y, x + 1, y + 10, WOOD_D); p.rect(x - 3, y - 1, x + 3, y + 1, hexc('4a4a52'))
    p.poly([(x - 3, y - 1), (x + 3, y - 1), (x, y - 11)], hexc('ff7a1a'))
    p.poly([(x - 1, y - 1), (x + 2, y - 1), (x, y - 6)], hexc('ffd84a'))
    glow_light(p, x, y - 6, 40, a=70)


def lantern(p, x, y, c=hexc('ffcf5a')):
    p.line(x, y - 8, x, y, hexc('2a2a2a'))
    p.rect(x - 3, y, x + 3, y + 8, c); p.rect(x - 4, y - 1, x + 4, y, hexc('2a2a2a')); p.rect(x - 4, y + 8, x + 4, y + 9, hexc('2a2a2a'))
    glow_light(p, x, y + 4, 26, a=70)


def rug(p, x, y, w, h, c=hexc('8a2a3a'), c2=GOLD):
    p.ell(x - w, y - h, x + w, y + h, c)
    p.ell(x - w + 4, y - h + 2, x + w - 4, y + h - 2, shade(c, 1.15))
    p.ell(x - w + 10, y - h + 5, x + w - 10, y + h - 5, c)
    for k in range(-w + 14, w - 13, 10):
        p.px(x + k, y, c2)


# ------------------------------------------------------------------ extérieur
def sky(p, y1, cols=None, y0=0):
    dither_v(p, 0, y0, W, y1, cols or [hexc('4a8ad8'), hexc('6aa6e6'), hexc('9ccaf2'), hexc('d8ecf8')])


def cloud(p, x, y, s=1.0, c=WHITE, c2=hexc('dfe8f4')):
    for dx, dy, r in [(0, 0, 12), (14, -6, 13), (28, 0, 10), (-12, 3, 8), (40, 3, 7)]:
        r = r * s
        p.ell(x + dx * s - r, y + dy * s - r * 0.55, x + dx * s + r, y + dy * s + r * 0.55 + 2, c)
    p.rect(x - 18 * s, y + 4 * s, x + 46 * s, y + 7 * s, c2)


def hills(p, ybase, amp, c, seed=0, freq=1.0, to=None):
    rnd = random.Random(seed)
    ph = rnd.random() * 6
    for x in range(W):
        y = ybase + math.sin(x / (60 / freq) + ph) * amp + math.sin(x / (23 / freq) + ph * 2) * amp * 0.35
        p.line(x, y, x, to if to else H, c)
        p.px(x, y, shade(c, 1.15))


def oak(p, x, y, s=1.0, c=hexc('3f7a3a'), trunk=hexc('5a3a20'), seed=0):
    rnd = random.Random(seed)
    p.rect(x - 3 * s, y - 22 * s, x + 3 * s, y, trunk)
    p.line(x - 3 * s, y - 22 * s, x - 3 * s, y, shade(trunk, 0.7))
    for _ in range(9):
        dx, dy, r = rnd.uniform(-14, 14) * s, rnd.uniform(-38, -20) * s, rnd.uniform(8, 13) * s
        p.ell(x + dx - r, y + dy - r, x + dx + r, y + dy + r, c)
    for _ in range(7):
        dx, dy, r = rnd.uniform(-12, 8) * s, rnd.uniform(-42, -26) * s, rnd.uniform(4, 8) * s
        p.ell(x + dx - r, y + dy - r, x + dx + r, y + dy + r, shade(c, 1.2))
    for _ in range(5):
        dx, dy, r = rnd.uniform(0, 14) * s, rnd.uniform(-28, -18) * s, rnd.uniform(4, 7) * s
        p.ell(x + dx - r, y + dy - r, x + dx + r, y + dy + r, shade(c, 0.8))


def willow(p, x, y, s=1.0, c=hexc('6a9a4a'), trunk=hexc('5a4a32'), seed=0, hollow=False):
    rnd = random.Random(seed)
    tw = 6 * s if not hollow else 16 * s
    p.poly([(x - tw, y), (x + tw, y), (x + tw * 0.6, y - 30 * s), (x - tw * 0.6, y - 30 * s)], trunk)
    p.line(x - tw * 0.5, y - 2, x - tw * 0.3, y - 28 * s, shade(trunk, 0.7))
    p.line(x + tw * 0.3, y - 4, x + tw * 0.2, y - 26 * s, shade(trunk, 1.2))
    if hollow:
        p.ell(x - 9 * s, y - 22 * s, x + 9 * s, y + 2, hexc('1a1410'))
        for k in range(-3, 4):
            p.line(x + k * 6 * s, y, x + k * 9 * s, y + 6 * s, trunk, 3)
    p.ell(x - 26 * s, y - 62 * s, x + 26 * s, y - 26 * s, c)
    for k in range(-24, 25, 3):
        ln = rnd.uniform(28, 46) * s
        xx = x + k * s
        p.line(xx, y - 40 * s - abs(k) * 0.2 * s, xx + rnd.choice([-1, 0, 1]), y - 40 * s + ln, shade(c, rnd.choice([0.85, 1.0, 1.15])), 2)
    p.ell(x - 18 * s, y - 60 * s, x + 6 * s, y - 44 * s, shade(c, 1.2))


def pine(p, x, y, s=1.0, c=hexc('2e5a3a')):
    p.rect(x - 2 * s, y - 8 * s, x + 2 * s, y, hexc('4a3020'))
    for i in range(4):
        w = (16 - i * 3.5) * s
        yy = y - 6 * s - i * 9 * s
        p.poly([(x - w, yy), (x + w, yy), (x, yy - 16 * s)], shade(c, 1 + 0.06 * i))
        p.line(x, yy - 16 * s, x + w, yy, shade(c, 0.75))


def bush(p, x, y, s=1.0, c=hexc('4a7a3a'), seed=0, berries=None):
    rnd = random.Random(seed)
    for _ in range(5):
        dx, r = rnd.uniform(-10, 10) * s, rnd.uniform(5, 8) * s
        p.ell(x + dx - r, y - r * 1.6, x + dx + r, y, c)
    p.ell(x - 6 * s, y - 13 * s, x + 2 * s, y - 7 * s, shade(c, 1.2))
    if berries:
        for _ in range(6):
            p.px(x + rnd.uniform(-10, 10) * s, y - rnd.uniform(3, 12) * s, berries)


def rock(p, x, y, s=1.0, c=STONE):
    p.poly([(x - 12 * s, y), (x - 9 * s, y - 8 * s), (x - 2 * s, y - 11 * s), (x + 8 * s, y - 8 * s), (x + 12 * s, y)], c)
    p.poly([(x - 2 * s, y - 11 * s), (x + 8 * s, y - 8 * s), (x + 12 * s, y), (x + 3 * s, y)], shade(c, 0.78))
    p.line(x - 9 * s, y - 8 * s, x - 2 * s, y - 11 * s, shade(c, 1.25))


def stump(p, x, y, s=1.0):
    p.rect(x - 8 * s, y - 10 * s, x + 8 * s, y, hexc('6a4a2e'))
    p.ell(x - 8 * s, y - 13 * s, x + 8 * s, y - 7 * s, hexc('c8a070'))
    p.ell(x - 5 * s, y - 11 * s, x + 5 * s, y - 9 * s, hexc('a8804a'))
    p.line(x - 10 * s, y, x - 14 * s, y + 2, hexc('6a4a2e'), 2); p.line(x + 8 * s, y, x + 13 * s, y + 2, hexc('6a4a2e'), 2)


def flowers(p, x0, y0, x1, y1, n, seed=0, cols=None):
    rnd = random.Random(seed)
    cols = cols or [WHITE, hexc('ffd84a'), hexc('ff7aa0'), hexc('a87aff')]
    for _ in range(n):
        x, y = rnd.randint(x0, x1), rnd.randint(y0, y1)
        c = rnd.choice(cols)
        p.px(x, y, c); p.px(x + 1, y, shade(c, 0.8)); p.px(x, y + 1, hexc('3a6a2a'))


def water(p, pts_top, pts_bot, c=hexc('4a8ac8'), seed=0):
    p.poly(pts_top + pts_bot[::-1], c)
    rnd = random.Random(seed)
    xs = [x for x, _ in pts_top]
    for _ in range(120):
        i = rnd.randrange(len(pts_top) - 1)
        t = rnd.random()
        x = pts_top[i][0] + (pts_top[i + 1][0] - pts_top[i][0]) * t
        ya = pts_top[i][1] + (pts_top[i + 1][1] - pts_top[i][1]) * t
        yb = pts_bot[i][1] + (pts_bot[i + 1][1] - pts_bot[i][1]) * t
        y = ya + (yb - ya) * rnd.random()
        p.line(x, y, x + rnd.randint(2, 6), y, shade(c, rnd.choice([1.25, 1.4, 0.85])))


def house_front(p, x, y, w, h, wall=hexc('f0e6d0'), beam=hexc('5a3a20'), roof=hexc('b8503a'), roof_h=26, seed=0, door_=True, win=True, night=False):
    rnd = random.Random(seed)
    p.rect(x, y - h, x + w, y, wall)
    p.rect(x, y - h, x + w, y - h + 2, beam); p.rect(x, y - h // 2, x + w, y - h // 2 + 2, beam)
    for xx in range(x, x + w + 1, max(10, w // 4)):
        p.line(xx, y - h, xx, y, beam, 2)
    p.line(x, y - h // 2, x + w // 4, y - h, beam, 2); p.line(x + w, y - h // 2, x + 3 * w // 4, y - h, beam, 2)
    p.poly([(x - 5, y - h), (x + w + 5, y - h), (x + w // 2, y - h - roof_h)], roof)
    p.poly([(x + w // 2, y - h - roof_h), (x + w + 5, y - h), (x + w // 2 + 2, y - h)], shade(roof, 0.8))
    for yy in range(y - h - roof_h + 4, y - h, 4):
        half = (yy - (y - h - roof_h)) * (w / 2 + 5) / roof_h
        p.line(x + w // 2 - half, yy, x + w // 2 + half, yy, shade(roof, 0.88))
    if win:
        for xx in range(x + 6, x + w - 10, 16):
            c = hexc('ffd890') if night and rnd.random() < 0.7 else hexc('3a4a6a')
            p.rect(xx, y - h + 8, xx + 7, y - h + 17, c)
            p.line(xx + 3, y - h + 8, xx + 3, y - h + 17, beam)
            p.rect(xx - 1, y - h + 18, xx + 8, y - h + 19, WOOD)
            if night and c != hexc('3a4a6a'):
                glow_light(p, xx + 3, y - h + 12, 14, a=40, steps=2)
            else:
                p.px(xx + 1, y - h + 9, hexc('9ccaf2'))
    if door_:
        dx = x + w // 2 - 5
        p.rect(dx, y - 17, dx + 10, y, hexc('5a3a20')); p.ell(dx, y - 21, dx + 10, y - 13, hexc('5a3a20'))
        p.px(dx + 8, y - 8, GOLD)
    p.line(x, y - h, x, y, shade(wall, 0.8))


def cobbles(p, y0, y1, base=hexc('b8b0a0'), seed=0):
    rnd = random.Random(seed)
    p.rect(0, y0, W, y1, shade(base, 0.8))
    y = y0
    r = 0
    hh = 4
    while y < y1:
        off = (r % 2) * (hh + 2)
        for x in range(-hh * 2 + off, W, hh * 2 + 2):
            c = shade(base, 0.85 + rnd.random() * 0.25)
            p.rect(x, y, x + hh * 2, y + hh - 1, c)
            p.line(x, y, x + hh * 2, y, shade(c, 1.15))
        y += hh
        r += 1
        hh = min(9, 4 + (y - y0) // 30)


def person(p, x, y, h=40, robe=WHITE, skin=hexc('f2c9a0'), hair=hexc('5a3a22'), hood=False, trim=None, back=False, arms='down'):
    """Silhouette de figurant, vue de face (pieds en (x, y)). Tête ≈ h/6."""
    hr = max(3, h // 7)
    hy = y - h + hr
    bw = h // 5
    p.poly([(x - bw, hy + hr + 1), (x + bw, hy + hr + 1), (x + bw + h // 10, y), (x - bw - h // 10, y)], robe)
    p.line(x + bw, hy + hr + 2, x + bw + h // 10 - 1, y - 1, shade(robe, 0.78))
    p.line(x - bw + 1, hy + hr + 2, x - bw - h // 10 + 2, y - 1, shade(robe, 1.12))
    if trim:
        p.line(x, hy + hr + 2, x, y - 1, trim)
        p.line(x - bw - h // 10, y - 1, x + bw + h // 10, y - 1, trim)
    if arms == 'down':
        p.line(x - bw - 1, hy + hr + 3, x - bw - 2, hy + hr + h // 3, shade(robe, 0.9), 2)
        p.line(x + bw + 1, hy + hr + 3, x + bw + 2, hy + hr + h // 3, shade(robe, 0.85), 2)
    elif arms == 'pray':
        p.line(x - bw, hy + hr + 4, x - 1, hy + hr + h // 4, shade(robe, 0.9), 2)
        p.line(x + bw, hy + hr + 4, x + 1, hy + hr + h // 4, shade(robe, 0.85), 2)
        p.px(x, hy + hr + h // 4 - 1, skin)
    p.ell(x - hr, hy - hr, x + hr, hy + hr, skin)
    if hood:
        p.ell(x - hr - 2, hy - hr - 2, x + hr + 2, hy + hr, robe)
        if not back:
            p.ell(x - hr + 1, hy - hr + 2, x + hr - 1, hy + hr, skin)
    else:
        p.ell(x - hr, hy - hr - 1, x + hr, hy - 1, hair)
        if back:
            p.ell(x - hr, hy - hr - 1, x + hr, hy + hr, hair)
    if not back and hr >= 4:
        p.px(x - hr // 2, hy, DARK); p.px(x + hr // 2, hy, DARK)
    p.line(x - bw - h // 10, y, x + bw + h // 10, y, (0, 0, 0, 80))
