"""Décors 1280×720 et fonds de combat : dessinés en 320×180 puis agrandis ×4 (pixels nets)."""
import math, random
from PIL import Image
from px import *
from heroes import CLASSES, explore_frame

W, H = 320, 180
SKY = [hexc('4a8ad8'), hexc('6aa6e6'), hexc('9ccaf2'), hexc('cfe6f8')]
WHITE = hexc('f2f0ea'); WHITE_D = hexc('c8c4bc'); WHITE_DD = hexc('9a968e')
BLUE_ROOF = hexc('3a64b8'); BLUE_ROOF_D = hexc('284a8c')
GOLD = hexc('e8b83c')


def sky(p, y1, cols=SKY, y0=0):
    dither_v(p, 0, y0, W, y1, cols)


def cloud(p, x, y, s=1.0):
    c, d = hexc('ffffff'), hexc('dfe8f4')
    for dx, dy, r in [(0, 0, 8), (9, -4, 9), (19, 0, 7), (-8, 2, 5)]:
        r = int(r * s)
        p.ell(x + dx * s - r, y + dy * s - r // 2, x + dx * s + r, y + dy * s + r // 2 + 2, c)
    p.rect(x - 12 * s, y + 3 * s, x + 26 * s, y + 5 * s, d)


def tiny_person(p, x, y, robe, head=hexc('f2c9a0'), hair=hexc('3a2a22'), hood=False, h=14):
    """Silhouette simple de ~h px (pieds en (x, y))."""
    p.poly([(x - 3, y - h + 6), (x + 3, y - h + 6), (x + 4, y), (x - 4, y)], robe)
    p.line(x + 3, y - h + 7, x + 4, y - 1, shade(robe, 1.2))
    p.ell(x - 2, y - h + 1, x + 2, y - h + 5, head)
    if hood:
        p.ell(x - 3, y - h, x + 3, y - h + 5, robe); p.ell(x - 1, y - h + 2, x + 2, y - h + 5, head)
    else:
        p.rect(x - 2, y - h + 1, x + 2, y - h + 2, hair)


def finish(img, k=4, light=None):
    out = outline(img) if False else img
    return up(out.convert('RGBA'), k).convert('RGB')


# ================================================================ temple du Seuil
def temple():
    img = new(W, H, WHITE); p = P(img)
    # mur du fond
    dither_v(p, 0, 0, W, 112, [hexc('dcd8ce'), hexc('ece8e0'), hexc('f4f2ec')])
    # voûte
    for x in range(0, W, 64):
        p.ell(x - 4, -40, x + 68, 40, hexc('e6e2d8'))
        p.ell(x + 2, -36, x + 62, 34, hexc('d4d0c6'))
    # vitraux soleil
    for cx in (60, 160, 260):
        cy, r = 44, 22 if cx == 160 else 17
        p.ell(cx - r - 3, cy - r - 3, cx + r + 3, cy + r + 3, WHITE_DD)
        cols = [hexc('ffcf3a'), hexc('ff8a2a'), hexc('4a8ad8'), hexc('8ac0f0')]
        for k in range(16):
            a0 = k / 16 * 2 * math.pi; a1 = (k + 1) / 16 * 2 * math.pi
            p.poly([(cx, cy), (cx + math.cos(a0) * r, cy + math.sin(a0) * r), (cx + math.cos(a1) * r, cy + math.sin(a1) * r)],
                   cols[2 + k % 2])
        for k in range(16):
            a = k / 16 * 2 * math.pi
            p.line(cx, cy, cx + math.cos(a) * r, cy + math.sin(a) * r, hexc('5a5040'))
        p.ell(cx - r // 2, cy - r // 2, cx + r // 2, cy + r // 2, cols[0])
        p.ell(cx - r // 4, cy - r // 4, cx + r // 4, cy + r // 4, hexc('fff4c0'))
        for k in range(8):
            a = k / 8 * 2 * math.pi
            p.line(cx + math.cos(a) * r // 2, cy + math.sin(a) * r // 2, cx + math.cos(a) * (r // 2 + 4), cy + math.sin(a) * (r // 2 + 4), cols[1])
        # rayons de lumière
        for k in range(-2, 3):
            for t in range(0, 70, 2):
                x = cx + k * 3 + t * 0.35
                y = cy + r + t
                if y < 140 and (t // 2 + k) % 3 == 0:
                    p.px(x, y, (255, 240, 190, 110))
    # colonnes
    for x in (14, 108, 202, 296):
        p.rect(x, 10, x + 12, 118, hexc('f8f6f0'))
        p.rect(x, 10, x + 2, 118, WHITE_D)
        p.rect(x + 10, 10, x + 12, 118, hexc('ffffff'))
        for xx in range(x + 4, x + 10, 3):
            p.line(xx, 14, xx, 114, hexc('e2ded4'))
        p.rect(x - 3, 8, x + 15, 12, WHITE_D); p.rect(x - 3, 114, x + 15, 120, WHITE_D)
        p.line(x - 3, 8, x + 15, 8, GOLD)
    # sol en perspective
    p.rect(0, 112, W, H, hexc('d8d4ca'))
    for i in range(9):
        y = 112 + int((i / 8) ** 1.6 * 68)
        p.line(0, y, W, y, hexc('bcb8ae'))
    for k in range(-12, 13):
        p.line(160 + k * 14, 112, 160 + k * 46, H, hexc('bcb8ae'))
    # tapis bleu bordé d'or
    p.poly([(146, 112), (174, 112), (196, H), (124, H)], hexc('2e5aa8'))
    p.line(146, 112, 124, H, GOLD); p.line(174, 112, 196, H, GOLD)
    # prêtres au fond
    for i, x in enumerate([40, 52, 84, 236, 268, 280]):
        tiny_person(p, x, 124, WHITE if i % 2 else hexc('ece6d6'), hood=True, h=22)
        p.rect(x - 1, 112, x, 113, GOLD)
    tiny_person(p, 160, 116, hexc('fffaf0'), hood=True, h=18)  # grand prieur près de l'autel
    p.rect(150, 116, 170, 122, WHITE_D); p.line(150, 116, 170, 116, GOLD)
    # cercle d'invocation
    cx, cy = 160, 150
    glow_c = [hexc('2a6ad8'), hexc('4aa0ff'), hexc('9ad8ff'), hexc('e0f6ff')]
    p.ell(cx - 92, cy - 22, cx + 92, cy + 22, (74, 160, 255, 90))
    for rx, ry, c in [(80, 18, glow_c[1]), (70, 15, glow_c[2]), (52, 11, glow_c[1]), (34, 7, glow_c[2])]:
        for k in range(160):
            a = k / 160 * 2 * math.pi
            p.px(cx + math.cos(a) * rx, cy + math.sin(a) * ry, c)
    # runes entre les anneaux
    rnd = random.Random(3)
    for k in range(20):
        a = k / 20 * 2 * math.pi
        x, y = cx + math.cos(a) * 75, cy + math.sin(a) * 16.5
        g = rnd.choice(['|-', '-|', '+', 'o'])
        p.px(x, y - 1, glow_c[3]); p.px(x, y, glow_c[2])
        if g in ('|-', '+'): p.px(x + 1, y, glow_c[2])
    # étoile intérieure
    pts = [(cx + math.cos(k / 6 * 2 * math.pi) * 52, cy + math.sin(k / 6 * 2 * math.pi) * 11) for k in range(6)]
    for i in range(6):
        p.line(*pts[i], *pts[(i + 2) % 6], glow_c[1])
    p.ell(cx - 8, cy - 2, cx + 8, cy + 2, glow_c[3])
    # colonne de lumière
    for y in range(60, int(cy)):
        w = 10 + (cy - y) * 0.05
        for x in range(int(cx - w), int(cx + w)):
            if (x + y) % 3 == 0:
                p.px(x, y, (190, 230, 255, 70))
    for k in range(30):
        p.px(rnd.randint(70, 250), rnd.randint(70, 165), (200, 240, 255, 220))
    return finish(img)


# ================================================================ place de Lysmont
def house(p, x, y, w, h, wall, beam, roof, roof_h=14, rnd=None):
    p.rect(x, y, x + w, y + h, wall)
    # colombages
    p.rect(x, y, x + w, y + 1, beam); p.rect(x, y + h // 2, x + w, y + h // 2 + 1, beam)
    for xx in range(x, x + w + 1, max(6, w // 4)):
        p.line(xx, y, xx, y + h, beam)
    p.line(x, y + h // 2, x + w // 4, y, beam); p.line(x + w, y + h // 2, x + 3 * w // 4, y, beam)
    # toit
    p.poly([(x - 3, y), (x + w + 3, y), (x + w // 2, y - roof_h)], roof)
    p.line(x + w // 2, y - roof_h, x + w + 3, y, shade(roof, 0.7))
    for yy in range(y - roof_h + 3, y, 3):
        p.line(x + w // 2 - (yy - y + roof_h), yy, x + w // 2 + (yy - y + roof_h), yy, shade(roof, 0.85))
    # fenêtres et porte
    for xx in range(x + 3, x + w - 4, 8):
        p.rect(xx, y + 4, xx + 3, y + 8, hexc('3a4a6a')); p.px(xx, y + 4, hexc('9ccaf2'))
        p.rect(xx - 1, y + 9, xx + 4, y + 9, hexc('6a4426'))
    p.rect(x + w // 2 - 2, y + h - 9, x + w // 2 + 3, y + h, hexc('5a3a20'))
    p.line(x, y, x, y + h, shade(wall, 0.85))


def castle(p, cx, base):
    # remparts
    p.rect(cx - 70, base - 22, cx + 70, base, WHITE)
    for x in range(cx - 70, cx + 70, 6):
        p.rect(x, base - 25, x + 3, base - 22, WHITE)
    p.line(cx - 70, base - 22, cx + 70, base - 22, WHITE_D)
    # tours
    def tower(x, w, h, roof_h):
        p.rect(x - w, base - h, x + w, base, WHITE)
        p.rect(x - w, base - h, x - w + 1, base, WHITE_D)
        p.rect(x + w - 1, base - h, x + w, base, hexc('ffffff'))
        p.poly([(x - w - 2, base - h), (x + w + 2, base - h), (x, base - h - roof_h)], BLUE_ROOF)
        p.poly([(x, base - h - roof_h), (x + w + 2, base - h), (x + 1, base - h)], BLUE_ROOF_D)
        p.line(x, base - h - roof_h - 5, x, base - h - roof_h, hexc('5a5040'))
        p.poly([(x, base - h - roof_h - 5), (x + 5, base - h - roof_h - 4), (x, base - h - roof_h - 3)], GOLD)
        for yy in range(base - h + 6, base - 4, 9):
            p.rect(x - 1, yy, x, yy + 3, hexc('3a4a6a'))
    tower(cx - 64, 7, 44, 18); tower(cx + 64, 7, 44, 18)
    tower(cx - 34, 9, 58, 22); tower(cx + 34, 9, 58, 22)
    tower(cx, 14, 78, 30)
    p.rect(cx - 6, base - 14, cx + 6, base, hexc('4a3a2a'))
    p.ell(cx - 6, base - 18, cx + 6, base - 10, hexc('4a3a2a'))
    # bannières
    for x in (cx - 20, cx + 20):
        p.rect(x - 2, base - 50, x + 2, base - 38, BLUE_ROOF); p.px(x, base - 44, GOLD)


def fountain_big(p, cx, base):
    p.ell(cx - 34, base - 10, cx + 34, base + 8, hexc('a8a4a0'))
    p.ell(cx - 30, base - 8, cx + 30, base + 4, hexc('4a90d8'))
    p.ell(cx - 22, base - 6, cx + 22, base + 2, hexc('6aaee8'))
    p.rect(cx - 34, base - 1, cx + 34, base + 6, hexc('a8a4a0'))
    p.line(cx - 34, base - 1, cx + 34, base - 1, hexc('d0ccc6'))
    p.rect(cx - 4, base - 32, cx + 4, base - 2, hexc('c8c4c0'))
    p.ell(cx - 14, base - 36, cx + 14, base - 28, hexc('c8c4c0'))
    p.ell(cx - 12, base - 35, cx + 12, base - 31, hexc('6aaee8'))
    # statue (soleil)
    p.ell(cx - 4, base - 46, cx + 4, base - 38, GOLD)
    for k in range(8):
        a = k / 8 * 2 * math.pi
        p.px(cx + math.cos(a) * 6, base - 42 + math.sin(a) * 6, GOLD)
    # jets d'eau
    for s in (-1, 1):
        for t in range(14):
            x = cx + s * (4 + t * 1.3)
            y = base - 34 + (t - 5) ** 2 * 0.25
            p.px(x, y, hexc('cfe6f8'))
    for k in range(-20, 21, 4):
        p.px(cx + k, base - 4 + (k % 3), hexc('ffffff'))


def stall(p, x, y, c1, c2, goods):
    p.rect(x, y, x + 30, y + 14, hexc('8a5a32'))
    p.line(x, y, x + 30, y, hexc('aa7a4a'))
    p.rect(x + 1, y - 22, x + 2, y, hexc('5a3a20')); p.rect(x + 28, y - 22, x + 29, y, hexc('5a3a20'))
    for i in range(6):
        p.poly([(x - 2 + i * 6, y - 24), (x + 4 + i * 6, y - 24), (x + 4 + i * 6, y - 18), (x - 2 + i * 6, y - 18)], c1 if i % 2 == 0 else c2)
        p.ell(x - 2 + i * 6, y - 20, x + 4 + i * 6, y - 15, c1 if i % 2 == 0 else c2)
    for i, g in enumerate(goods):
        p.ell(x + 3 + i * 6, y - 4, x + 7 + i * 6, y, g)


def lysmont():
    img = new(W, H); p = P(img)
    sky(p, 110)
    cloud(p, 40, 20); cloud(p, 230, 14, 1.2); cloud(p, 300, 40, 0.7)
    # collines lointaines
    for x in range(W):
        y = 92 + int(math.sin(x / 30) * 4 + math.sin(x / 11) * 2)
        p.line(x, y, x, 110, hexc('8ab8a0'))
    p.rect(0, 104, W, 120, hexc('a89f8e'))
    castle(p, 160, 104)
    # maisons gauche et droite
    rnd = random.Random(5)
    walls = [hexc('f0e6d0'), hexc('e8d8b8'), hexc('f4ecdc')]
    roofs = [hexc('b8503a'), hexc('3a64b8'), hexc('9a4a2a')]
    for i, x in enumerate([-6, 30, 62]):
        house(p, x, 72 + (i % 2) * 6, 30, 48 - (i % 2) * 6, walls[i % 3], hexc('5a3a20'), roofs[i % 3], 16)
    for i, x in enumerate([228, 262, 294]):
        house(p, x, 74 + (i % 2) * 5, 30, 46 - (i % 2) * 5, walls[(i + 1) % 3], hexc('5a3a20'), roofs[(i + 1) % 3], 16)
    # pavés
    p.rect(0, 120, W, H, hexc('b8b0a0'))
    for y in range(122, H, 5):
        off = (y // 5) % 2 * 4
        for x in range(-4 + off, W, 8):
            p.rect(x, y, x + 6, y + 3, hexc('c8c0b0') if (x + y) % 3 else hexc('a89f8e'))
    p.ell(-40, 128, W + 40, H + 60, (200, 192, 176, 120))
    # étals
    stall(p, 30, 146, hexc('d83a3a'), hexc('f4f0e8'), [hexc('ff6a3a'), hexc('ffd03a'), hexc('7ad03a'), hexc('ff6a3a')])
    stall(p, 258, 148, hexc('3a64b8'), hexc('f4f0e8'), [hexc('c8a070'), hexc('e8d8b8'), hexc('c8a070')])
    fountain_big(p, 160, 150)
    # passants
    for x, c in [(78, hexc('6a3a8a')), (96, hexc('3a7a4a')), (214, hexc('b8503a')), (236, hexc('3a64b8')), (122, hexc('8a6a3a'))]:
        tiny_person(p, x, 132 + (x % 7), c, h=16)
    # pigeons
    for x in (186, 192, 200):
        p.rect(x, 170, x + 2, 171, hexc('8a8a94')); p.px(x + 2, 169, hexc('8a8a94'))
    return finish(img)


# ================================================================ guilde de la Rose des Vents
def compass(p, cx, cy, r, c, c2):
    for k in range(8):
        a = k / 8 * 2 * math.pi - math.pi / 2
        rr = r if k % 2 == 0 else r * 0.55
        a1 = a + math.pi / 2; w = r * 0.18
        p.poly([(cx + math.cos(a) * rr, cy + math.sin(a) * rr), (cx + math.cos(a1) * w, cy + math.sin(a1) * w),
                (cx - math.cos(a1) * w, cy - math.sin(a1) * w)], c if k % 2 == 0 else c2)
    p.ell(cx - 2, cy - 2, cx + 2, cy + 2, c2)


def guild():
    img = new(W, H); p = P(img)
    # mur de planches
    for x in range(0, W, 10):
        p.rect(x, 0, x + 9, 120, hexc('7a4e2c') if (x // 10) % 2 else hexc('6e4426'))
        p.line(x, 0, x, 120, hexc('4a2e18'))
        for y in (20, 64, 98):
            p.px(x + 4, y, hexc('3a2414'))
    # poutres
    p.rect(0, 0, W, 8, hexc('4a2e18')); p.rect(0, 26, W, 30, hexc('4a2e18'))
    for x in (0, 104, 214, 312):
        p.rect(x, 0, x + 8, 120, hexc('5a3820')); p.line(x + 7, 0, x + 7, 120, hexc('7a5030'))
    # bannière rose des vents
    p.rect(138, 32, 182, 86, hexc('2e4a8c'))
    p.poly([(138, 86), (160, 96), (182, 86)], hexc('2e4a8c'))
    p.rect(138, 32, 182, 34, GOLD); p.line(138, 34, 138, 86, GOLD); p.line(182, 34, 182, 86, GOLD)
    p.rect(134, 30, 186, 31, hexc('5a3820'))
    compass(p, 160, 60, 18, hexc('f4f0e8'), GOLD)
    # lanternes
    for x in (60, 260):
        p.line(x, 8, x, 18, hexc('2a2a2a')); p.rect(x - 3, 18, x + 3, 26, hexc('ffcf5a')); p.rect(x - 3, 18, x + 3, 19, hexc('2a2a2a'))
        for k in range(14):
            a = k / 14 * 2 * math.pi
            p.px(x + math.cos(a) * 9, 22 + math.sin(a) * 8, (255, 210, 120, 110))
    # tableau des contrats
    p.rect(194, 38, 284, 104, hexc('8a6a3a')); p.rect(197, 41, 281, 101, hexc('b89a6a'))
    rnd = random.Random(8)
    for i in range(14):
        x = 199 + (i % 5) * 16 + rnd.randint(-1, 1); y = 44 + (i // 5) * 19 + rnd.randint(0, 2)
        c = hexc('f4ecd4') if i % 4 else hexc('e8d8a8')
        p.rect(x, y, x + 13, y + 16, c)
        p.px(x + 6, y, hexc('c03a2a'))
        for l in range(3):
            p.line(x + 2, y + 4 + l * 3, x + 10 - (l * 3 % 5), y + 4 + l * 3, hexc('7a6a5a'))
        if i % 5 == 2:
            p.ell(x + 4, y + 11, x + 8, y + 14, hexc('c03a2a'))
    # comptoir
    p.rect(14, 92, 120, 128, hexc('5a3820'))
    p.rect(10, 88, 124, 94, hexc('8a5a32')); p.line(10, 88, 124, 88, hexc('aa7a4a'))
    for x in range(20, 120, 20):
        p.rect(x, 98, x + 14, 124, hexc('4a2e18'))
    # Dame Rowena derrière le comptoir
    row = dict(CLASSES['alchimiste']); row.update(hair=hexc('a8a8a8'), hair_style='short', top=hexc('3a5a3a'),
               top2=hexc('c8a050'), goggles=False, apron=None, vials=False, weapon='none', skin=hexc('e8b890'))
    img.alpha_composite(explore_frame(row, 'down', 0).crop((0, 0, 32, 22)), (52, 70))
    p.rect(10, 88, 124, 94, hexc('8a5a32')); p.line(10, 88, 124, 88, hexc('aa7a4a'))
    p.line(68, 78, 72, 76, hexc('6a4426')); p.px(73, 75, (220, 220, 220, 200))
    p.rect(20, 82, 26, 88, hexc('c8b080')); p.rect(100, 84, 104, 88, hexc('d8d0c0'))
    # sol
    p.rect(0, 120, W, H, hexc('6a4426'))
    for y in range(122, H, 7):
        p.line(0, y, W, y, hexc('553620'))
        off = (y // 7) % 3 * 13
        for x in range(off, W, 40):
            p.line(x, y, x, y + 6, hexc('553620'))
    # tables
    for cx, cy in [(150, 150), (262, 156)]:
        p.ell(cx - 26, cy - 6, cx + 26, cy + 6, hexc('8a5a32'))
        p.ell(cx - 26, cy - 7, cx + 26, cy + 4, hexc('a87040'))
        p.rect(cx - 2, cy + 4, cx + 2, cy + 18, hexc('5a3820'))
        for dx in (-12, 4, 14):
            p.rect(cx + dx, cy - 10, cx + dx + 3, cy - 6, hexc('d8c070')); p.px(cx + dx, cy - 11, hexc('ffffff'))
    # aventuriers (sprites des classes, vus de face ou de dos)
    for cls, d, x, y in [('berserker', 'down', 120, 128), ('ombre', 'right', 176, 130), ('archer', 'up', 242, 128),
                         ('gardien', 'left', 288, 132), ('barde', 'down', 196, 152), ('alchimiste', 'up', 30, 140)]:
        img.alpha_composite(explore_frame(CLASSES[cls], d, 0), (x - 16, y - 30))
    return finish(img)


# ================================================================ fonds de combat
def plain():
    img = new(W, H); p = P(img)
    sky(p, 110, [hexc('3f7fd0'), hexc('5a98e0'), hexc('8ec0f0'), hexc('c8e4f8')])
    cloud(p, 60, 24); cloud(p, 200, 34, 1.3); cloud(p, 290, 18, 0.8)
    for x in range(W):  # montagnes lointaines
        y = 84 + int(math.sin(x / 23) * 9 + math.sin(x / 7) * 2)
        p.line(x, y, x, 110, hexc('8aa8c8'))
        if y < 80:
            p.px(x, y, hexc('e8f0f8'))
    for x in range(W):  # collines
        y = 98 + int(math.sin(x / 40 + 1) * 6)
        p.line(x, y, x, 120, hexc('6aa85a'))
    # arbres lointains
    rnd = random.Random(2)
    for _ in range(14):
        x = rnd.randint(0, W); y = 100 + rnd.randint(0, 10)
        p.ell(x - 5, y - 9, x + 5, y + 1, hexc('3f7a3a')); p.rect(x, y, x + 1, y + 3, hexc('5a3a20'))
    # sol (tiers inférieur)
    p.rect(0, 120, W, H, hexc('5a9a3a'))
    dither_v(p, 0, 112, W, 124, [hexc('7ab85a'), hexc('5a9a3a')])
    for _ in range(500):
        x, y = rnd.randint(0, W - 1), rnd.randint(122, H - 1)
        p.px(x, y, rnd.choice([hexc('4a8a32'), hexc('7ab84a'), hexc('3f7a2a')]))
    for _ in range(80):
        x, y = rnd.randint(0, W - 1), rnd.randint(124, H - 2)
        p.line(x, y, x + rnd.choice([-1, 0, 1]), y - 2, hexc('8ac85a'))
    # chemin de terre
    p.poly([(140, 120), (180, 120), (250, H), (70, H)], hexc('b0905a'))
    p.poly([(146, 120), (174, 120), (230, H), (90, H)], hexc('c0a06a'))
    for _ in range(90):
        x = rnd.randint(80, 240); y = rnd.randint(124, H - 1)
        p.px(x, y, hexc('9a7a4a'))
    for k in range(6):
        x = rnd.randint(0, W); y = rnd.randint(130, H - 6)
        p.px(x, y, rnd.choice([hexc('ffffff'), hexc('ffd84a'), hexc('ff7aa0')]))
    return finish(img)


def crypt_bg():
    img = new(W, H); p = P(img)
    p.rect(0, 0, W, H, hexc('1a1820'))
    # mur de pierre
    rnd = random.Random(6)
    for y in range(0, 122, 10):
        off = (y // 10) % 2 * 10
        for x in range(-10 + off, W, 20):
            c = shade(hexc('4a4655'), 0.85 + rnd.random() * 0.3)
            p.rect(x + 1, y + 1, x + 19, y + 9, c)
            p.line(x + 1, y + 1, x + 19, y + 1, shade(c, 1.2))
    # assombrissement haut
    for y in range(0, 50):
        for x in range(W):
            if (x + y) % 2 == 0 and rnd.random() < (50 - y) / 50:
                p.px(x, y, hexc('1a1820'))
    # arches
    for cx in (80, 240):
        p.ell(cx - 34, 30, cx + 34, 98, hexc('121016'))
        p.rect(cx - 34, 64, cx + 34, 122, hexc('121016'))
        for k in range(24):
            a = math.pi + k / 23 * math.pi
            p.rect(cx + math.cos(a) * 36 - 2, 64 + math.sin(a) * 36 - 2, cx + math.cos(a) * 36 + 2, 64 + math.sin(a) * 36 + 2, hexc('6a6578'))
    # colonnes
    for x in (14, 150, 290):
        p.rect(x, 0, x + 18, 124, hexc('5a5668'))
        p.rect(x, 0, x + 3, 124, hexc('3a3646')); p.rect(x + 15, 0, x + 18, 124, hexc('7a7688'))
        p.rect(x - 3, 116, x + 21, 124, hexc('4a4655'))
        for y in range(10, 116, 18):
            p.line(x, y, x + 18, y, hexc('3a3646'))
    # torches
    for x in (50, 116, 204, 270):
        p.rect(x - 1, 60, x + 1, 70, hexc('6a4426')); p.rect(x - 3, 58, x + 3, 60, hexc('4a4a52'))
        p.poly([(x - 3, 58), (x + 3, 58), (x, 48)], hexc('ff7a1a')); p.poly([(x - 1, 58), (x + 2, 58), (x, 52)], hexc('ffd84a'))
        for r in (18, 26):
            for k in range(40):
                a = k / 40 * 2 * math.pi
                xx, yy = x + math.cos(a) * r * rnd.uniform(0.6, 1), 56 + math.sin(a) * r * rnd.uniform(0.6, 1)
                p.px(xx, yy, (255, 150, 60, 70 if r == 26 else 110))
    # toiles
    for k in range(4):
        p.line(0, 0, 18 - k * 4, 4 + k * 6, (200, 200, 210, 140))
    # sol dallé (tiers inférieur)
    p.rect(0, 122, W, H, hexc('3a3846'))
    rows = [122, 130, 140, 153, 168, 181]
    for i in range(len(rows) - 1):
        y0, y1 = rows[i], rows[i + 1]
        p.line(0, y0, W, y0, hexc('24222c'))
        n = 10 + i * 0
        for k in range(-n, n + 1):
            xa = 160 + k * (16 + i * 6)
            p.line(xa, y0, xa + k * 1, y1, hexc('24222c'))
        p.line(0, y0 + 1, W, y0 + 1, hexc('4e4a5c'))
    for _ in range(200):
        p.px(rnd.randint(0, W - 1), rnd.randint(124, H - 1), hexc('2e2c38'))
    # lueur des torches au sol
    for x in (50, 116, 204, 270):
        for k in range(60):
            p.px(x + rnd.randint(-20, 20), 124 + rnd.randint(0, 10), (255, 150, 60, 50))
    # ossements
    p.ell(30, 160, 38, 166, hexc('d8d0b8')); p.line(40, 166, 50, 164, hexc('d8d0b8'), 2)
    p.line(280, 170, 292, 172, hexc('d8d0b8'), 2)
    return finish(img)
