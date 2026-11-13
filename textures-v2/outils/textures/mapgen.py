"""Carte d'Aubeclaire, style carte ancienne en pixel art, sans texte (480×270 ×4)."""
import math, random
from PIL import Image
from px import *

MW, MH = 480, 270
PARCH = hexc('e8d6a8'); PARCH_D = hexc('d4bc88'); PARCH_DD = hexc('b89a64')
INK = hexc('5a3e22'); INK_L = hexc('8a6a42')
GRASS = hexc('b8c88a'); GRASS_D = hexc('9ab070')
WATER = hexc('6a9ab8'); WATER_L = hexc('9ac0d0')
FOREST = hexc('5a7a42'); FOREST_D = hexc('3e5a2e')
ASH = hexc('6a5a5a'); ASH_D = hexc('4a3a3e'); RED = hexc('a83a2a'); VIOLET = hexc('7a3a8a')
BLUE = hexc('3a64b8'); WHITE = hexc('f4f0e6'); GOLD = hexc('d8a83a')


def tree(p, x, y, c=FOREST):
    p.poly([(x, y - 7), (x - 4, y), (x + 4, y)], c)
    p.poly([(x, y - 9), (x - 3, y - 4), (x + 3, y - 4)], shade(c, 1.15))
    p.line(x, y - 7, x + 3, y, shade(c, 0.7))
    p.px(x, y + 1, INK)


def willow(p, x, y):
    p.ell(x - 5, y - 8, x + 5, y, FOREST)
    for k in range(-4, 5, 2):
        p.line(x + k, y - 3, x + k, y + 1, FOREST_D)
    p.line(x, y, x, y + 2, INK)


def mountain(p, x, y, s=1.0, snow=True):
    h, w = int(14 * s), int(11 * s)
    p.poly([(x - w, y), (x, y - h), (x + w, y)], hexc('a89a80'))
    p.poly([(x, y - h), (x + w, y), (x + 2, y)], hexc('7a6c58'))
    if snow:
        p.poly([(x - 3, y - h + 4), (x, y - h), (x + 3, y - h + 4)], WHITE)
    p.line(x - w, y, x, y - h, INK); p.line(x, y - h, x + w, y, INK)


def hill(p, x, y, w=14):
    p.ell(x - w, y - 7, x + w, y + 5, GRASS_D)
    p.ell(x - w + 2, y - 6, x + w - 4, y + 2, hexc('c8d898'))
    for k in range(-w + 2, w - 1, 3):
        p.px(x + k, y - 6 + abs(k) // 3, INK_L)


def build():
    rnd = random.Random(11)
    img = new(MW, MH, PARCH)
    p = P(img)
    # texture du parchemin
    for _ in range(5000):
        x, y = rnd.randrange(MW), rnd.randrange(MH)
        p.px(x, y, rnd.choice([PARCH_D, hexc('f0e0b8'), PARCH_D]))
    for _ in range(40):
        x, y, r = rnd.randrange(MW), rnd.randrange(MH), rnd.randint(4, 14)
        for k in range(r * 3):
            a = rnd.random() * 2 * math.pi; d = rnd.random() * r
            p.px(x + math.cos(a) * d, y + math.sin(a) * d, (180, 150, 100, 60))
    # terres du royaume (zone verte pâle, tramée)
    land = new(MW, MH); lp = P(land)
    lp.poly([(30, 70), (120, 58), (250, 62), (380, 56), (452, 80), (460, 170), (430, 236), (300, 252), (160, 248),
             (60, 230), (24, 160)], (255, 255, 255, 255))
    la = np.array(land)[:, :, 3] > 0
    for y in range(MH):
        for x in range(MW):
            if la[y, x] and (x + y) % 2 == 0:
                p.px(x, y, GRASS)
    # contour du royaume en pointillés
    edge = np.array(outline(land, (1, 1, 1, 255)))
    ys, xs = np.where((edge[:, :, 0] == 1) & (edge[:, :, 3] == 255))
    for x, y in zip(xs, ys):
        if (x + y) % 4 < 2:
            p.px(x, y, INK_L)

    # Terres Cendrées et Mur d'Aube au nord
    for y in range(0, 34):
        for x in range(MW):
            r = rnd.random()
            if r < 0.95 - y / 45:
                p.px(x, y, ASH_D if r < 0.3 else ASH)
    for k in range(16):
        x = rnd.randint(0, MW); y = rnd.randint(2, 26)
        p.ell(x - 3, y - 1, x + 3, y + 1, (168, 58, 42, 150))
    for x in (90, 250, 400):
        p.poly([(x - 5, 22), (x, 6), (x + 5, 22)], hexc('2a2026')); p.px(x, 10, RED)
    wall_y = 38
    for x in range(10, MW - 10):
        y = wall_y + int(math.sin(x / 50) * 3)
        p.rect(x, y - 2, x, y + 2, hexc('8a8478'))
        p.px(x, y - 3, INK if x % 3 == 0 else hexc('8a8478'))
        p.px(x, y + 3, INK)
        if x % 48 == 20:
            p.rect(x - 3, y - 7, x + 3, y + 3, hexc('a8a294'))
            p.rect(x - 3, y - 8, x + 3, y - 7, INK)
            p.line(x - 3, y - 7, x - 3, y + 3, INK); p.line(x + 3, y - 7, x + 3, y + 3, INK)
            p.px(x, y - 4, INK)
    # montagnes (est) et collines
    for x, y, s in [(452, 92, 1.0), (440, 112, 1.2), (462, 128, 0.9), (446, 150, 1.0), (466, 170, 0.8), (430, 82, 0.8)]:
        mountain(p, x, y, s)
    for x, y in [(200, 60), (300, 66), (350, 210), (120, 120), (380, 160)]:
        hill(p, x, y)

    # rivière : du nord-ouest vers le sud-est, passant à l'ouest puis au sud de Lysmont
    pts = []
    for t in range(0, 101):
        u = t / 100
        x = 20 + u * 460
        y = 60 + u * 150 + math.sin(u * 7) * 18
        pts.append((x, y))
    for i in range(len(pts) - 1):
        w = 2 + int(i / 40)
        p.line(*pts[i], *pts[i + 1], WATER, w + 1)
    for i in range(0, len(pts) - 1, 2):
        p.line(*pts[i], *pts[i + 1], WATER_L, 1)
    # affluent
    for t in range(0, 40):
        u = t / 40
        p.line(240 + u * 30, 120 + u * 18 + math.sin(u * 5) * 4, 240 + (u + 0.025) * 30, 120 + (u + 0.025) * 18, WATER, 2)
    # lac
    p.ell(352, 214, 384, 230, WATER); p.ell(356, 216, 378, 226, WATER_L)

    # positions des lieux
    LYS = (240, 140); TEMPLE = (240, 90); COMBE = (110, 200); CRYPTE = (372, 128)
    # routes en pointillés
    def road(a, b, bend=(0, 0)):
        n = int(math.hypot(b[0] - a[0], b[1] - a[1]) / 1.6) + 2
        for k in range(n):
            u = k / n
            mx, my = (a[0] + b[0]) / 2 + bend[0], (a[1] + b[1]) / 2 + bend[1]
            x = (1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u ** 2 * b[0]
            y = (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u ** 2 * b[1]
            if k % 3 != 2:
                p.rect(x, y, x + 1, y + 1, hexc('9a6a3a'))
    road(LYS, TEMPLE, (8, 0))
    road(TEMPLE, (240, 44), (0, 0))  # vers le Mur
    road(LYS, COMBE, (10, 30))
    road(LYS, CRYPTE, (0, 20))
    road(LYS, (470, 200), (20, 30))
    road(LYS, (16, 120), (0, -14))
    road(LYS, (230, 262), (-10, 0))
    # ponts
    for (x, y) in [(214, 160), (262, 182)]:
        pass

    # forêt de la Combe-aux-Saules (sud-ouest)
    for _ in range(90):
        a = rnd.random() * 2 * math.pi; d = math.sqrt(rnd.random()) * 46
        x, y = COMBE[0] + math.cos(a) * d * 1.3, COMBE[1] + math.sin(a) * d * 0.8
        (willow if rnd.random() < 0.5 else tree)(p, x, y)
    # bosquets épars
    for _ in range(60):
        x, y = rnd.randint(40, 420), rnd.randint(60, 250)
        if abs(x - LYS[0]) > 40 or abs(y - LYS[1]) > 30:
            if la[min(MH - 1, int(y)), min(MW - 1, int(x))] and rnd.random() < 0.5:
                tree(p, x, y, FOREST)
    # petits villages
    for x, y in [(160, 110), (320, 200), (190, 230), (330, 92), (80, 140)]:
        for dx in (-3, 3):
            p.rect(x + dx - 2, y - 2, x + dx + 2, y + 2, WHITE)
            p.poly([(x + dx - 3, y - 2), (x + dx + 3, y - 2), (x + dx, y - 5)], hexc('b8503a'))
            p.line(x + dx - 2, y + 2, x + dx + 2, y + 2, INK)

    # Lysmont (capitale, centre)
    x, y = LYS
    p.ell(x - 22, y - 6, x + 22, y + 14, hexc('d8c898'))
    p.rect(x - 18, y - 8, x + 18, y + 10, hexc('e8e0d0'))
    for xx in range(x - 18, x + 19, 4):
        p.rect(xx, y - 10, xx + 1, y - 8, hexc('e8e0d0'))
    p.line(x - 18, y + 10, x + 18, y + 10, INK); p.line(x - 18, y - 8, x - 18, y + 10, INK); p.line(x + 18, y - 8, x + 18, y + 10, INK)
    for tx, th in [(x - 12, 14), (x + 12, 14), (x, 22)]:
        p.rect(tx - 3, y - th, tx + 3, y + 6, WHITE)
        p.line(tx - 3, y - th, tx - 3, y + 6, INK); p.line(tx + 3, y - th, tx + 3, y + 6, INK)
        p.poly([(tx - 4, y - th), (tx + 4, y - th), (tx, y - th - 8)], BLUE)
        p.line(tx, y - th - 8, tx + 4, y - th, INK)
        p.px(tx, y - th - 10, GOLD); p.px(tx, y - th - 9, INK)
    p.rect(x - 2, y + 4, x + 2, y + 10, INK)
    for k in range(-16, 17, 6):
        p.rect(x + k, y + 12, x + k + 3, y + 15, hexc('e8e0d0'))
        p.poly([(x + k - 1, y + 12), (x + k + 4, y + 12), (x + k + 1, y + 9)], hexc('b8503a'))

    # Temple du Seuil sur une colline au nord
    x, y = TEMPLE
    p.ell(x - 18, y - 4, x + 18, y + 10, GRASS_D)
    p.ell(x - 15, y - 3, x + 13, y + 6, hexc('c8d898'))
    p.rect(x - 9, y - 10, x + 9, y + 1, WHITE)
    p.poly([(x - 11, y - 10), (x + 11, y - 10), (x, y - 18)], WHITE)
    p.line(x - 11, y - 10, x, y - 18, INK); p.line(x, y - 18, x + 11, y - 10, INK); p.line(x - 11, y - 10, x + 11, y - 10, INK)
    for xx in (x - 7, x - 3, x + 1, x + 5):
        p.line(xx, y - 9, xx, y, hexc('c8c4bc'))
    p.line(x - 9, y + 1, x + 9, y + 1, INK)
    p.ell(x - 3, y - 16, x + 3, y - 12, GOLD)
    for k in range(8):
        a = k / 8 * 2 * math.pi
        p.px(x + math.cos(a) * 5, y - 14 + math.sin(a) * 5, GOLD)
    # halo bleu de l'invocation
    for k in range(24):
        a = k / 24 * 2 * math.pi
        p.px(x + math.cos(a) * 16, y - 6 + math.sin(a) * 12, (90, 160, 240, 160))

    # Crypte de la Fontaine (ruines à l'est)
    x, y = CRYPTE
    for dx, h in [(-10, 8), (-4, 12), (4, 6), (10, 10)]:
        p.rect(x + dx - 2, y - h, x + dx + 2, y, hexc('a8a294'))
        p.line(x + dx - 2, y - h, x + dx - 2, y, INK); p.line(x + dx + 2, y - h, x + dx + 2, y, INK)
        p.line(x + dx - 2, y - h, x + dx + 2, y - h + 1, INK)
    p.rect(x - 12, y, x + 12, y + 2, hexc('8a8478')); p.line(x - 12, y + 3, x + 12, y + 3, INK)
    p.ell(x - 4, y - 4, x + 4, y + 1, hexc('2a2026'))
    for k in range(10):
        p.px(x - 12 + rnd.randint(0, 24), y - rnd.randint(0, 10), FOREST)  # lierre
    p.px(x, y - 2, VIOLET); p.px(x + 1, y - 2, VIOLET)

    # rose des vents (coin bas-droit) et cadre
    cx, cy, r = 448, 236, 18
    for k in range(8):
        a = k / 8 * 2 * math.pi - math.pi / 2
        rr = r if k % 2 == 0 else r * 0.5
        a1 = a + math.pi / 2; w = 3
        p.poly([(cx + math.cos(a) * rr, cy + math.sin(a) * rr), (cx + math.cos(a1) * w, cy + math.sin(a1) * w),
                (cx - math.cos(a1) * w, cy - math.sin(a1) * w)], INK if k % 2 == 0 else INK_L)
    p.px(cx, cy - r - 3, RED); p.px(cx, cy - r - 4, RED)
    for k in range(40):
        a = k / 40 * 2 * math.pi
        p.px(cx + math.cos(a) * (r - 6), cy + math.sin(a) * (r - 6), INK_L)
    # bordure
    p.rect(0, 0, MW - 1, 3, INK); p.rect(0, MH - 4, MW - 1, MH - 1, INK)
    p.rect(0, 0, 3, MH - 1, INK); p.rect(MW - 4, 0, MW - 1, MH - 1, INK)
    p.rect(5, 5, MW - 6, 5, GOLD); p.rect(5, MH - 6, MW - 6, MH - 6, GOLD)
    p.rect(5, 5, 5, MH - 6, GOLD); p.rect(MW - 6, 5, MW - 6, MH - 6, GOLD)
    for (x, y) in [(5, 5), (MW - 6, 5), (5, MH - 6), (MW - 6, MH - 6)]:
        p.ell(x - 3, y - 3, x + 3, y + 3, GOLD); p.px(x, y, INK)
    # vignettage
    for y in range(MH):
        for x in range(MW):
            d = min(x, y, MW - 1 - x, MH - 1 - y)
            if 6 < d < 18 and (x * 7 + y * 13) % 18 > d:
                p.px(x, y, (120, 90, 50, 70))
    return up(img, 4).convert('RGB'), dict(lysmont=LYS, temple=TEMPLE, combe=COMBE, crypte=CRYPTE)
