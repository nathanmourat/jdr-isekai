"""Fonds de combat HD (1280×720) : sol dans le tiers inférieur, bande des combattants (pieds à 62 % de la hauteur) dégagée.
Dessinés en grille 640×360, rendus nativement en 1280×720 (pinceau à l'échelle 2)."""
import os
from decor2 import *

SOL = 206  # ligne d'horizon du sol (base 360) ; les pieds des combattants sont vers 223


def base_exterieur(p, ciel, sol_c, horizon=SOL, seed=0, grass=True):
    sky(p, horizon, ciel)
    if grass:
        ground_grass(p, horizon, H, sol_c, seed=seed)
    else:
        dither_v(p, 0, horizon, W, H, [shade(sol_c, 1.12), sol_c, shade(sol_c, 0.8)])


def bande_sol(p, y=222, c=(0, 0, 0, 50)):
    """Ombre douce sous la ligne des combattants."""
    p.ell(60, y - 8, W - 60, y + 14, c)


def speck(p, y0, y1, cols, n, seed=0, w=1.0):
    rnd = random.Random(seed)
    for _ in range(n):
        x, y = rnd.uniform(0, W - 1), rnd.uniform(y0, y1)
        p.fline(x, y, x + rnd.uniform(0.5, 3) * w, y, rnd.choice(cols))


# ------------------------------------------------------------------ forêts, nature
def foret():
    img, p = canvas()
    base_exterieur(p, [hexc('6a9ad0'), hexc('a8c8e0')], hexc('4a7a32'), seed=1)
    for x in range(-20, 680, 26):
        oak(p, x, 150 + (x * 13) % 18, 1.6, c=hexc('2e5a2e'), seed=x)
    for x in range(-30, 690, 70):
        oak(p, x, 206, 2.4, c=hexc('3f7a3a'), seed=x + 7)
    for x in (30, 610):
        oak(p, x, 330, 3.2, c=hexc('2e5a2e'), seed=x + 3)
    bush(p, 120, 300, 1.8, seed=2); bush(p, 520, 310, 2, seed=5)
    flowers(p, 0, 230, 640, 358, 70, seed=3)
    bande_sol(p)
    return finish(img, vignette=0.3)


def foret_profonde():
    img, p = canvas()
    base_exterieur(p, [hexc('1a2a2a'), hexc('2e4a3a')], hexc('2e4a26'), seed=2)
    for x in range(-20, 680, 18):
        oak(p, x, 170 + (x * 7) % 20, 1.8, c=hexc('1a3420'), trunk=hexc('2a1e14'), seed=x)
    for x in range(-40, 700, 90):
        p.rect(x, 0, x + 26, 230, hexc('2a1e14')); p.rect(x + 20, 0, x + 26, 230, hexc('3a2a1a'))
    for k in range(40):  # brume
        y = 170 + k % 8 * 6
        p.ell(k * 17 - 40, y, k * 17 + 60, y + 14, (180, 210, 200, 22))
    rnd = random.Random(4)
    for _ in range(14):  # champignons luminescents
        x, y = rnd.randint(20, 620), rnd.randint(240, 350)
        p.rect(x, y - 6, x + 1, y, hexc('d8d0b8')); p.ell(x - 4, y - 10, x + 5, y - 5, hexc('6ad8c8'))
        glow_light(p, x, y - 8, 12, c=(106, 216, 200), a=50, steps=2)
    for x in (20, 600):
        oak(p, x, 360, 3.6, c=hexc('1a3420'), trunk=hexc('2a1e14'), seed=x)
    bande_sol(p, c=(0, 0, 0, 70))
    return finish(img, vignette=0.55)


def clairiere():
    img, p = canvas()
    base_exterieur(p, [hexc('5a9ad8'), hexc('b8dcf0')], hexc('6aaa42'), seed=3)
    for x in range(-20, 680, 30):
        if 140 < x < 500:
            continue
        oak(p, x, 200 + (x * 5) % 12, 2.2, seed=x)
    for x in range(140, 500, 40):
        oak(p, x, 150, 1.2, c=hexc('4a8a42'), seed=x)
    for k in range(5):  # rayons de soleil
        x0 = 220 + k * 50
        p.poly([(x0, 0), (x0 + 18, 0), (x0 + 80, 300), (x0 + 50, 300)], (255, 250, 200, 26))
    flowers(p, 0, 220, 640, 358, 200, seed=4)
    stump(p, 470, 300, 1.6); rock(p, 160, 320, 1.5)
    bande_sol(p, c=(0, 0, 0, 35))
    return finish(img, vignette=0.2)


def marais():
    img, p = canvas()
    base_exterieur(p, [hexc('5a6a6a'), hexc('9aa8a0')], hexc('4a5a32'), seed=5)
    for x in range(-20, 680, 40):  # arbres morts
        y = 196 + (x * 3) % 10
        p.line(x, y, x + 2, y - 70, hexc('3a3228'), 3)
        for k in range(3):
            p.line(x + 1, y - 40 - k * 10, x + 1 + (12 - k * 3) * (1 if k % 2 else -1), y - 52 - k * 10, hexc('3a3228'), 2)
    water(p, [(0, 260), (200, 250), (420, 268), (640, 256)], [(0, 300), (200, 292), (420, 312), (640, 298)], hexc('3a4a3a'), seed=5)
    water(p, [(80, 330), (300, 324), (560, 336)], [(80, 350), (300, 352), (560, 356)], hexc('3a4a3a'), seed=6)
    for x in range(0, 640, 7):
        p.line(x, 262 + (x % 5), x + 1, 248 + (x % 9), hexc('6a7a3a'))
    for k in range(30):
        p.ell(k * 24 - 30, 190 + k % 5 * 6, k * 24 + 50, 204 + k % 5 * 6, (200, 210, 190, 30))
    bande_sol(p)
    return finish(img, vignette=0.4)


def camp():
    img, p = canvas()
    base_exterieur(p, [hexc('3a4a7a'), hexc('d88a5a')], hexc('5a6a32'), seed=6)
    for x in range(-20, 680, 30):
        pine(p, x, 200 + (x * 3) % 10, 1.8, c=hexc('243a2a'))
    for (x, c) in [(90, hexc('8a6a4a')), (520, hexc('6a5a3a'))]:  # tentes
        p.poly([(x - 50, 236), (x + 50, 236), (x, 170)], c)
        p.poly([(x, 170), (x + 50, 236), (x + 8, 236)], shade(c, 0.75))
        p.poly([(x - 10, 236), (x + 10, 236), (x, 206)], hexc('1a1410'))
    # feu de camp au premier plan
    cx, cy = 320, 330
    for k in range(6):
        a = k / 6 * math.pi * 2
        p.ell(cx + math.cos(a) * 18 - 5, cy + math.sin(a) * 6 - 3, cx + math.cos(a) * 18 + 5, cy + math.sin(a) * 6 + 3, STONE)
    p.line(cx - 12, cy, cx + 12, cy - 2, WOOD_D, 3); p.line(cx - 10, cy - 3, cx + 10, cy + 2, WOOD, 3)
    for (dx, hh, c) in [(-6, 16, hexc('ff5a1a')), (5, 20, hexc('ff8a2a')), (0, 26, hexc('ffd84a'))]:
        p.poly([(cx + dx - 6, cy - 2), (cx + dx + 6, cy - 2), (cx + dx, cy - hh)], c)
    glow_light(p, cx, cy - 10, 120, a=80, steps=5)
    crate(p, 170, 300, 24); barrel(p, 470, 310, 12, 28)
    bande_sol(p)
    return finish(img, vignette=0.4)


# ------------------------------------------------------------------ montagne, hauteurs
def montagne():
    img, p = canvas()
    sky(p, SOL, [hexc('4a7ac8'), hexc('a8c8e8')])
    cloud(p, 80, 50); cloud(p, 480, 30, 1.2)
    for (x, s, c) in [(80, 3.4, hexc('8a94a8')), (300, 4.6, hexc('7a8498')), (540, 3.8, hexc('8a94a8'))]:
        p.poly([(x - 120 * s / 3, SOL), (x, SOL - 46 * s), (x + 120 * s / 3, SOL)], c)
        p.poly([(x, SOL - 46 * s), (x + 120 * s / 3, SOL), (x + 10, SOL)], shade(c, 0.8))
        p.poly([(x - 18 * s / 3, SOL - 46 * s + 22), (x, SOL - 46 * s), (x + 18 * s / 3, SOL - 46 * s + 22)], WHITE)
    dither_v(p, 0, SOL, W, H, [hexc('8a8a78'), hexc('6a6a5a'), hexc('5a5a4a')])
    speck(p, SOL, H, [hexc('5a5a4a'), hexc('9a9a88')], 500, seed=7, w=1.5)
    for (x, y, s) in [(70, 300, 2.4), (560, 320, 2.8), (240, 350, 1.6)]:
        rock(p, x, y, s, c=hexc('7a7a6a'))
    bande_sol(p)
    return finish(img, vignette=0.25)


def sommet():
    img, p = canvas()
    sky(p, SOL, [hexc('2a4a9a'), hexc('6a9ad8'), hexc('d8e8f8')])
    for k in range(10):  # mer de nuages en contrebas
        p.ell(k * 70 - 60, 160 + (k % 3) * 8, k * 70 + 60, 200 + (k % 3) * 8, WHITE)
    p.ell(-100, 180, 740, 220, hexc('f4f4f8'))
    dither_v(p, 0, SOL, W, H, [hexc('f4f6fa'), hexc('d8e0ec'), hexc('b8c4d4')])
    speck(p, SOL, H, [hexc('c8d4e4'), WHITE], 400, seed=8, w=2)
    for (x, y, s) in [(60, 290, 2.2), (590, 300, 2.6)]:
        rock(p, x, y, s, c=hexc('6a6a7a'))
        p.poly([(x - 8 * s, y - 8 * s), (x + 6 * s, y - 9 * s), (x - 2 * s, y - 11 * s)], WHITE)
    p.line(480, 210, 480, 150, WOOD_D, 2); p.poly([(480, 150), (520, 160), (480, 170)], hexc('2e4a9c'))  # fanion
    bande_sol(p, c=(60, 80, 120, 40))
    return finish(img, vignette=0.2)


def canyon():
    img, p = canvas()
    sky(p, 120, [hexc('5a8ad0'), hexc('f0d0a0')])
    dither_v(p, 0, 120, W, SOL + 10, [hexc('e8b888'), hexc('c88a5a'), hexc('a86a40')])
    for k in range(4):  # mesas au loin, au fond du canyon
        x = 250 + k * 40
        p.rect(x, 130 - k * 6, x + 30, SOL, shade(hexc('c8784a'), 0.9 + k * 0.03))
    for side in (-1, 1):
        for k in range(6):
            x0 = 320 + side * (60 + k * 50)
            c = shade(hexc('b8643a'), 0.8 + k * 0.05)
            p.poly([(x0, 0), (320 + side * 700, 0), (320 + side * 700, SOL + 10), (x0 + side * 20, SOL + 10)], c)
            for y in range(20, SOL, 18):
                p.line(x0 + side * 6, y, x0 + side * 46, y + 4, shade(c, 0.8))
    dither_v(p, 0, SOL, W, H, [hexc('d89a60'), hexc('c88450'), hexc('a86a40')])
    speck(p, SOL, H, [hexc('b87a48'), hexc('e8b080')], 500, seed=9, w=1.5)
    for (x, y) in [(110, 300), (530, 320)]:
        rock(p, x, y, 2.2, c=hexc('a85a34'))
    bande_sol(p)
    return finish(img, vignette=0.3)


def nid():
    img, p = canvas()
    sky(p, SOL, [hexc('3a5a9a'), hexc('9ab8d8'), hexc('f0d8c0')])
    cloud(p, 60, 80, 1.3); cloud(p, 470, 60)
    p.poly([(0, SOL), (640, SOL - 20), (640, H), (0, H)], hexc('7a6a5a'))  # falaise
    # nid géant de branchages
    p.ell(30, 196, 610, 330, hexc('6a4a2a'))
    p.ell(70, 210, 570, 320, hexc('8a6a3a'))
    rnd = random.Random(10)
    for _ in range(260):
        x, y = rnd.uniform(40, 600), rnd.uniform(200, 330)
        a = rnd.uniform(-0.6, 0.6)
        p.fline(x, y, x + math.cos(a) * 14, y + math.sin(a) * 4, rnd.choice([hexc('4a3220'), hexc('a8804a'), hexc('6a4a2a')]))
    for (x, y) in [(150, 300), (480, 296)]:  # œufs
        p.ell(x - 12, y - 30, x + 12, y, hexc('d8e0c8')); p.ell(x - 6, y - 24, x, y - 16, WHITE)
    for (x, y) in [(260, 320), (380, 326)]:
        p.line(x, y, x + 20, y - 4, hexc('e8e0c8'), 2)
    bande_sol(p, c=(0, 0, 0, 40))
    return finish(img, vignette=0.3)


def marches():
    img, p = canvas()
    sky(p, 160, [hexc('3a2a3a'), hexc('a8504a')])
    hills(p, 120, 14, hexc('4a3a3a'), seed=11, to=200)
    # escalier taillé dans la montagne, fissuré de lave
    for i in range(10):
        y = 120 + i * 9
        w = 80 + i * 26
        p.rect(320 - w, y, 320 + w, y + 9, shade(hexc('6a5a52'), 0.8 + i * 0.03))
        p.line(320 - w, y, 320 + w, y, hexc('8a7a70'))
    dither_v(p, 0, SOL, W, H, [hexc('6a5a52'), hexc('4a3e3a')])
    for (x0, y0, x1, y1) in [(80, 230, 200, 300), (200, 300, 260, 360), (420, 220, 560, 280), (560, 280, 600, 360)]:
        p.line(x0, y0, x1, y1, hexc('ff6a1a'), 3); p.fline(x0, y0, x1, y1, hexc('ffd84a'))
        glow_light(p, (x0 + x1) / 2, (y0 + y1) / 2, 40, c=(255, 120, 40), a=50, steps=2)
    for x in (40, 600):
        p.rect(x - 10, 120, x + 10, SOL, hexc('5a4a44')); p.rect(x - 14, 116, x + 14, 124, hexc('7a6a60'))
    bande_sol(p)
    return finish(img, vignette=0.35)


# ------------------------------------------------------------------ sables
def desert():
    img, p = canvas()
    sky(p, SOL, [hexc('3a7ad8'), hexc('a8d0f0'), hexc('f8e8c8')])
    p.ell(500, 30, 560, 90, hexc('fff4c0')); glow_light(p, 530, 60, 80, c=(255, 240, 180), a=60)
    for (y, amp, c) in [(150, 10, hexc('e8b870')), (178, 12, hexc('d8a058')), (SOL, 0, hexc('e8c080'))]:
        if amp:
            hills(p, y, amp, c, seed=y, to=SOL + 10)
    dither_v(p, 0, SOL, W, H, [hexc('f0c888'), hexc('e0b070'), hexc('c89858')])
    for k in range(9):  # rides du sable
        y = SOL + 14 + k * 16
        for x in range(0, W, 3):
            p.fpx(x, y + math.sin(x / 20 + k) * 3, hexc('c89050'))
    p.rect(90, 230, 92, 260, hexc('5a7a3a')); p.rect(84, 238, 90, 240, hexc('5a7a3a')); p.rect(92, 232, 98, 234, hexc('5a7a3a'))  # cactus
    p.line(560, 300, 600, 296, hexc('e8e0c8'), 2); p.ell(596, 290, 608, 300, hexc('e8e0c8'))  # ossement
    bande_sol(p, c=(120, 80, 30, 40))
    return finish(img, vignette=0.2)


def ville_desert():
    img, p = canvas()
    sky(p, SOL, [hexc('3a7ad8'), hexc('f0d8b0')])
    for i, x in enumerate(range(-20, 680, 90)):
        h = 70 + (i * 37) % 50
        c = hexc(['e0c090', 'd8b080', 'e8c898'][i % 3])
        p.rect(x, SOL - h, x + 80, SOL, c)
        p.rect(x, SOL - h, x + 80, SOL - h + 4, shade(c, 1.1))
        if i % 3 == 0:
            p.ell(x + 20, SOL - h - 26, x + 60, SOL - h + 10, hexc('d8a050'))  # dôme
        for wx in range(x + 10, x + 70, 22):
            p.ell(wx, SOL - h + 18, wx + 10, SOL - h + 38, hexc('5a3a2a'))
        if i % 2:
            for k in range(4):
                p.rect(x + 8 + k * 16, SOL - 34, x + 22 + k * 16, SOL - 28, [hexc('3ab0a8'), WHITE][k % 2])
    dither_v(p, 0, SOL, W, H, [hexc('e8c890'), hexc('d0b078')])
    speck(p, SOL, H, [hexc('c8a068'), hexc('f0d8a8')], 400, seed=12, w=1.5)
    crate(p, 60, 320, 26); barrel(p, 580, 320, 12, 28, hexc('a87a4a'))
    bande_sol(p)
    return finish(img, vignette=0.25)


# ------------------------------------------------------------------ mer
def plage():
    img, p = canvas()
    sky(p, 170, [hexc('3a8ad8'), hexc('b8e0f8')])
    cloud(p, 120, 50); cloud(p, 460, 40, 1.2)
    dither_v(p, 0, 170, W, SOL + 6, [hexc('2a6ab8'), hexc('3a8ac8'), hexc('5aaad8')])
    for k in range(40):
        x = (k * 53) % 640; y = 176 + (k * 7) % 26
        p.fline(x, y, x + 8, y, hexc('d8f0ff'))
    for x in range(0, W, 2):
        p.fpx(x, SOL + 6 + math.sin(x / 9) * 2, WHITE)
    dither_v(p, 0, SOL + 8, W, H, [hexc('f0dca8'), hexc('e0c890'), hexc('d0b478')])
    speck(p, SOL + 8, H, [hexc('c8a870'), hexc('fff0c8')], 400, seed=13)
    for (x, y) in [(120, 300), (500, 330)]:
        p.ell(x - 5, y - 3, x + 5, y + 2, hexc('f0a0a0'))  # coquillages
    p.line(40, 340, 40, 230, hexc('8a6a3a'), 3)  # palmier
    for a in (-2.6, -2.0, -1.2, -0.5):
        p.line(40, 230, 40 + math.cos(a) * 40, 230 + math.sin(a) * 18 + 14, hexc('3a8a3a'), 3)
    bande_sol(p, c=(120, 90, 40, 40))
    return finish(img, vignette=0.2)


def port():
    img, p = canvas()
    sky(p, 170, [hexc('4a7ab8'), hexc('c8d8e8')])
    dither_v(p, 0, 150, W, SOL, [hexc('2a5a8a'), hexc('3a6a9a')])
    for (x, s) in [(110, 1.0), (470, 1.3)]:  # bateaux
        p.poly([(x - 60 * s, 150), (x + 60 * s, 150), (x + 44 * s, 172), (x - 44 * s, 172)], hexc('6a4426'))
        p.line(x, 150, x, 70, WOOD_D, 2)
        p.poly([(x + 2, 76), (x + 40 * s, 120), (x + 2, 140)], hexc('f0e8d8'))
    # quai en planches
    p.rect(0, SOL - 4, W, H, hexc('7a5a3a'))
    for y in range(SOL - 4, H, 12):
        p.line(0, y, W, y, hexc('5a4026'))
        off = (y // 12) % 3 * 30
        for x in range(off, W, 90):
            p.line(x, y, x, y + 11, hexc('5a4026'))
    for x in range(20, W, 120):
        p.rect(x, SOL - 22, x + 10, SOL + 6, hexc('5a4026'))
    p.line(0, SOL - 18, W, SOL - 14, hexc('c8b080'))  # corde
    crate(p, 70, 330, 28); crate(p, 100, 330, 22); barrel(p, 560, 340, 14, 32)
    bande_sol(p)
    return finish(img, vignette=0.25)


def epave():
    img = plage()[0]
    p = P(img, 1)
    # coque échouée à gauche (dessinée au pixel réel)
    q = P(img, 2)
    q.poly([(20, 236), (220, 224), (240, 266), (40, 290)], hexc('4a3220'))
    for k in range(7):
        q.line(40 + k * 28, 262 - k * 2, 52 + k * 28, 206 - k * 3, hexc('3a2618'), 3)
    q.line(150, 230, 190, 120, WOOD_D, 3); q.poly([(190, 120), (230, 150), (186, 170)], hexc('b8a890'))
    q.ell(380, 320, 420, 332, hexc('5a7a3a'))  # algues
    return img, {}


# ------------------------------------------------------------------ ville, intérieurs
def rues_nuit():
    img, p = canvas()
    sky(p, 160, [hexc('0e1430'), hexc('2a3a6a')])
    rnd = random.Random(14)
    for _ in range(80):
        p.px(rnd.randint(0, W - 1), rnd.randint(0, 120), WHITE)
    for i, x in enumerate(range(-20, 680, 96)):
        house_front(p, x, SOL, 86, 80 + (i % 2) * 14, wall=hexc('3a3a50'), beam=hexc('1a1a28'), roof=hexc('2a2a48'), roof_h=26, seed=i, night=True)
    cobbles(p, SOL, H, hexc('4a4a5a'), seed=14)
    for x in (100, 540):
        p.rect(x - 2, 150, x + 2, SOL + 20, hexc('2a2a2a')); lantern(p, x, 140)
    bande_sol(p, c=(0, 0, 0, 60))
    return finish(img, vignette=0.45)


def rempart():
    img, p = canvas()
    sky(p, SOL, [hexc('4a6aa8'), hexc('e8c8a8')])
    cloud(p, 100, 40); cloud(p, 430, 60, 1.3)
    hills(p, 150, 10, hexc('7a8a9a'), seed=15, to=SOL)
    # chemin de ronde : créneaux à l'arrière, dalles au sol
    p.rect(0, 150, W, SOL, hexc('9a948a'))
    for x in range(0, W, 40):
        p.rect(x, 126, x + 24, 150, hexc('aaa498')); p.line(x, 126, x + 24, 126, hexc('c8c4b8'))
    wall_stone(p, 0, 150, W, SOL, hexc('9a948a'), seed=15, h=12, w=26)
    floor_stone(p, SOL, H, hexc('8a847a'))
    banner(p, 80, 156, 26, 40, hexc('2e4a9c'), emblem='soleil'); banner(p, 520, 156, 26, 40, hexc('2e4a9c'), emblem='soleil')
    bande_sol(p)
    return finish(img, vignette=0.25)


def breche():
    img, p = canvas()
    sky(p, SOL, [hexc('3a2a3a'), hexc('a8504a'), hexc('e8905a')])
    # mur d'Aube éventré
    wall_stone(p, 0, 70, 250, SOL, hexc('8a847a'), seed=16, h=12, w=26)
    wall_stone(p, 390, 70, W, SOL, hexc('8a847a'), seed=17, h=12, w=26)
    p.poly([(250, 70), (280, 120), (262, 160), (300, SOL), (250, SOL)], hexc('8a847a'))
    p.poly([(390, 70), (360, 130), (376, 170), (340, SOL), (390, SOL)], hexc('8a847a'))
    for k in range(20):
        p.ell(240 + k * 8, 30 + (k % 4) * 10 - k * 3, 280 + k * 8, 60 + (k % 4) * 10 - k * 3, (60, 50, 60, 60))  # fumée
    dither_v(p, 0, SOL, W, H, [hexc('6a625a'), hexc('4a443e')])
    rnd = random.Random(16)
    for _ in range(26):  # gravats
        x, y = rnd.randint(180, 460), rnd.randint(SOL, H - 10)
        rock(p, x, y, rnd.uniform(0.5, 1.4), c=hexc('8a847a'))
    for _ in range(40):
        p.fpx(rnd.uniform(0, W), rnd.uniform(0, SOL), (255, 160, 80, 200))  # braises
    bande_sol(p)
    return finish(img, vignette=0.35)


def bibliotheque():
    img, p = canvas()
    wall_planks(p, 0, 0, W, SOL, hexc('5a3a24'), seed=18)
    for x in range(0, W, 128):
        shelf(p, x + 8, 20, 112, rows=5, gap=34, items='livre', seed=x)
    for x in (0, 128, 256, 384, 512, 632):
        p.rect(x, 0, x + 8, SOL, hexc('3a2414'))
    floor_planks(p, SOL, H, hexc('6a4426'))
    rug(p, 320, 300, 220, 40, hexc('6a2a3a'))
    for (x, y) in [(150, 330), (480, 320)]:
        p.rect(x - 14, y - 6, x + 14, y, hexc('8a2a2a')); p.rect(x - 12, y - 8, x + 12, y - 6, hexc('f0e6c8'))  # livres ouverts au sol
    for x in (60, 580):
        lantern(p, x, 10)
    for k in range(30):  # poussière dans la lumière
        p.fpx(200 + (k * 37) % 240, 40 + (k * 53) % 160, (255, 240, 200, 160))
    bande_sol(p)
    return finish(img, vignette=0.4)


def palais():
    img, p = canvas(WHITE)
    wall_plaster(p, 0, 0, W, SOL, hexc('f0ece4'))
    for x in range(-10, W, 160):
        p.ell(x, -70, x + 160, 70, hexc('e0dcd0')); p.ell(x + 8, -62, x + 152, 60, hexc('f0ece4'))
    for x in (40, 200, 420, 580):
        p.rect(x, 20, x + 22, SOL, hexc('faf8f2')); p.rect(x, 20, x + 3, SOL, hexc('d8d0c0')); p.rect(x - 4, 16, x + 26, 22, GOLD)
    for x in (110, 300, 490):
        window(p, x, 50, 40, 100, arch=True)
    floor_stone(p, SOL, H, hexc('e8e0d0'))
    for i in range(0, W, 40):
        p.poly([(i, SOL + 40), (i + 20, SOL + 30), (i + 40, SOL + 40), (i + 20, SOL + 50)], (200, 170, 90, 60))  # incrustations dorées
    p.poly([(270, SOL), (370, SOL), (430, H), (210, H)], hexc('8a1a2a')); p.line(270, SOL, 210, H, GOLD); p.line(370, SOL, 430, H, GOLD)
    bande_sol(p, c=(80, 60, 30, 40))
    return finish(img, vignette=0.25)


def citadelle():
    img, p = canvas()
    sky(p, SOL, [hexc('1a1020'), hexc('4a2040'), hexc('8a3a4a')])
    for (x, w, h) in [(80, 30, 150), (200, 24, 120), (440, 24, 130), (560, 34, 170)]:
        p.rect(x - w, SOL - h, x + w, SOL, hexc('2a2430'))
        p.poly([(x - w - 6, SOL - h), (x + w + 6, SOL - h), (x, SOL - h - 40)], hexc('1a1620'))
        p.rect(x - 3, SOL - h + 20, x + 3, SOL - h + 34, hexc('b04aff'))
    wall_stone(p, 0, 120, W, SOL, hexc('3a3446'), seed=19, h=12, w=26)
    for x in (130, 330, 510):
        banner(p, x, 128, 28, 60, hexc('5a1a6a'))
    floor_stone(p, SOL, H, hexc('3a3446'))
    for x in (60, 580):
        torch_wall(p, x, 150)
    bande_sol(p, c=(0, 0, 0, 70))
    return finish(img, vignette=0.45)


def forge():
    img, p = canvas()
    wall_stone(p, 0, 0, W, SOL, hexc('5a524c'), seed=20, h=14, w=30)
    # canaux de lave et grands soufflets
    p.rect(0, 150, W, 164, hexc('ff6a1a')); p.line(0, 150, W, 150, hexc('ffd84a'), 2)
    glow_light(p, 320, 156, 300, c=(255, 120, 40), a=90, steps=5)
    for x in (110, 530):
        fireplace(p, x - 50, SOL, 100, 90)
    floor_stone(p, SOL, H, hexc('4a4440'))
    for x in (230, 410):  # enclumes
        p.poly([(x - 28, 300), (x + 32, 300), (x + 36, 306), (x + 18, 308), (x + 14, 316), (x - 14, 316), (x - 18, 308), (x - 28, 306)], hexc('4a4e58'))
        p.line(x - 28, 300, x + 32, 300, hexc('9aa0ac'))
        p.rect(x - 10, 316, x + 10, 330, hexc('3a3e48'))
    bande_sol(p)
    return finish(img, vignette=0.4)


def lac_de_lave():
    img, p = canvas(hexc('1a1010'))
    wall_stone(p, 0, 0, W, 170, hexc('3a2a28'), seed=21, h=16, w=34)
    for x in range(0, W, 50):  # stalactites
        p.poly([(x, 0), (x + 20, 0), (x + 10, 30 + (x * 7) % 30)], hexc('2a1e1c'))
    dither_v(p, 0, 160, W, SOL + 10, [hexc('ff8a2a'), hexc('ff5a1a'), hexc('c8321a')])
    for k in range(60):
        x = (k * 41) % 640; y = 164 + (k * 13) % 50
        p.fline(x, y, x + 10, y, hexc('ffd84a'))
    glow_light(p, 320, 190, 360, c=(255, 100, 30), a=90, steps=6)
    p.poly([(0, SOL), (640, SOL - 6), (640, H), (0, H)], hexc('3a2a28'))  # avancée rocheuse
    speck(p, SOL, H, [hexc('2a1e1c'), hexc('5a3a30')], 400, seed=21, w=1.5)
    for (x0, x1) in [(100, 200), (420, 560)]:
        p.line(x0, SOL + 30, x1, SOL + 60, hexc('ff6a1a'), 2)
    bande_sol(p)
    return finish(img, vignette=0.4)


def mine():
    img, p = canvas(hexc('1a1614'))
    wall_stone(p, 0, 0, W, SOL, hexc('5e564c'), seed=22, h=14, w=30)
    p.ell(170, 30, 470, 300, hexc('0e0c0a')); p.rect(170, 160, 470, SOL, hexc('0e0c0a'))
    for x in (160, 460):
        p.rect(x, 40, x + 16, SOL, WOOD)
    p.rect(150, 30, 490, 46, WOOD_L)
    dither_v(p, 0, SOL, W, H, [hexc('5a5248'), hexc('3a342e')])
    for k in (-24, 24):
        p.line(320 + k, SOL, 320 + k * 8, H, hexc('8a8a94'), 2)
    for i in range(8):
        y = SOL + 8 + i * 20
        w = 30 + (y - SOL) * 1.2
        p.rect(320 - w, y, 320 + w, y + 3, WOOD_D)
    lantern(p, 190, 70); lantern(p, 450, 70)
    rnd = random.Random(22)
    for _ in range(12):  # cristaux dans la roche
        x, y = rnd.randint(10, 630), rnd.randint(10, 190)
        if 170 < x < 470:
            continue
        p.poly([(x, y), (x + 4, y - 10), (x + 8, y)], hexc('8ad0ff'))
    bande_sol(p)
    return finish(img, vignette=0.45)


def mine_naine():
    img, p = canvas(hexc('1a1614'))
    wall_stone(p, 0, 0, W, SOL, hexc('6a6258'), seed=23, h=16, w=40)
    for x in (60, 220, 420, 580):  # piliers sculptés
        p.rect(x - 18, 0, x + 18, SOL, hexc('7a7266'))
        p.rect(x - 18, 0, x - 14, SOL, hexc('5a5248'))
        for y in range(30, SOL, 40):
            p.poly([(x - 10, y), (x + 10, y), (x, y + 12)], GOLD)
    p.rect(0, 10, W, 26, hexc('7a7266')); p.line(0, 26, W, 26, GOLD)
    for x in (140, 320, 500):
        lantern(p, x, 40, hexc('ffb040'))
    floor_stone(p, SOL, H, hexc('5a5248'))
    p.poly([(250, SOL), (390, SOL), (450, H), (190, H)], hexc('6a2a2a')); p.line(250, SOL, 190, H, GOLD); p.line(390, SOL, 450, H, GOLD)
    bande_sol(p)
    return finish(img, vignette=0.4)


def ruines():
    img, p = canvas()
    base_exterieur(p, [hexc('6a8ab8'), hexc('c8d8e0')], hexc('5a7a3a'), seed=24)
    for (x, h) in [(60, 150), (170, 90), (480, 120), (590, 170)]:  # colonnes brisées
        p.rect(x - 14, SOL - h, x + 14, SOL, hexc('b8b0a0')); p.rect(x - 14, SOL - h, x - 10, SOL, hexc('8a8478'))
        p.poly([(x - 14, SOL - h), (x + 14, SOL - h + 8), (x + 14, SOL - h - 4), (x, SOL - h - 12)], hexc('b8b0a0'))
    p.rect(150, 90, 500, 104, hexc('b8b0a0')); p.poly([(500, 90), (520, 120), (500, 104)], (0, 0, 0, 0))
    rnd = random.Random(24)
    for _ in range(300):  # lierre
        x = rnd.choice([rnd.uniform(46, 74), rnd.uniform(156, 184), rnd.uniform(466, 494), rnd.uniform(576, 604)])
        p.fpx(x, rnd.uniform(40, SOL), rnd.choice([hexc('3a6a3a'), hexc('4a8a3a')]))
    for (x, y) in [(260, 320), (420, 300), (120, 340)]:
        rock(p, x, y, 1.6, c=hexc('a8a090'))
    bande_sol(p)
    return finish(img, vignette=0.3)


def arene():
    img, p = canvas()
    sky(p, 200)
    cloud(p, 120, 24); cloud(p, 480, 34, 1.1)
    for i in range(6):
        y0 = 40 + i * 24
        c = shade(hexc('c8b8a0'), 1 - i * 0.04)
        p.ell(-120 + i * 10, y0, W + 120 - i * 10, y0 + 320 - i * 20, c)
        p.ell(-110 + i * 10, y0 + 6, W + 110 - i * 10, y0 + 320 - i * 20, shade(c, 0.85))
    rnd = random.Random(3)
    for i in range(5):
        y = 52 + i * 24
        for x in range(10, 630, 7):
            if rnd.random() < 0.8:
                c = rnd.choice([hexc('b8503a'), hexc('3a64b8'), hexc('e8c03a'), hexc('5a8a4a'), hexc('f0e6d0')])
                p.rect(x, y, x + 4, y + 6, c); p.ell(x, y - 4, x + 4, y, hexc(['f2c9a0', 'd9a273', 'a8714a'][rnd.randrange(3)]))
    p.rect(0, 176, W, SOL, hexc('8a7a68')); p.line(0, 176, W, 176, hexc('b8a890'))
    for x in range(0, W, 80):
        banner(p, x + 20, 178, 22, 20, [hexc('2e4a9c'), hexc('b8282a')][x // 80 % 2], emblem='soleil')
    dither_v(p, 0, SOL, W, H, [hexc('e0c890'), hexc('d0b478'), hexc('c0a468')])
    speck(p, SOL, H, [hexc('b89c64'), hexc('f0dca8')], 500, seed=3)
    bande_sol(p, c=(120, 90, 40, 40))
    return finish(img, vignette=0.25)


# ------------------------------------------------------------------ cendres et Voile
def plaine_cendree():
    img, p = canvas()
    sky(p, SOL, [hexc('2a1a20'), hexc('7a2a2a'), hexc('c85a3a')])
    hills(p, 170, 12, hexc('3a3036'), seed=25, to=SOL)
    dither_v(p, 0, SOL, W, H, [hexc('6a6060'), hexc('4a4246'), hexc('3a3236')])
    rnd = random.Random(25)
    for _ in range(600):
        x, y = rnd.uniform(0, W), rnd.uniform(SOL, H)
        p.fline(x, y, x, y - rnd.uniform(1, 4), rnd.choice([hexc('8a8080'), hexc('5a5050')]))  # herbe grise
    for x in (70, 250, 560):  # arbres calcinés
        p.line(x, SOL + 10, x + 4, SOL - 80, hexc('1a1416'), 4)
        p.line(x + 3, SOL - 50, x + 26, SOL - 70, hexc('1a1416'), 2); p.line(x + 2, SOL - 30, x - 18, SOL - 52, hexc('1a1416'), 2)
    for _ in range(50):
        p.fpx(rnd.uniform(0, W), rnd.uniform(0, H), (255, 140, 70, 200))
    bande_sol(p, c=(0, 0, 0, 60))
    return finish(img, vignette=0.4)


def cendres():
    img, p = canvas()
    sky(p, SOL, [hexc('1a1014'), hexc('5a1a1a'), hexc('a83a2a')])
    for x in (120, 360, 560):  # volcans au loin
        p.poly([(x - 90, SOL), (x - 14, SOL - 110), (x + 14, SOL - 110), (x + 90, SOL)], hexc('2a2022'))
        p.ell(x - 14, SOL - 116, x + 14, SOL - 104, hexc('ff5a1a'))
        for k in range(5):
            p.ell(x - 16 - k * 6, SOL - 140 - k * 18, x + 16 + k * 6, SOL - 120 - k * 18, (60, 50, 50, 90))
    dither_v(p, 0, SOL, W, H, [hexc('4a4044'), hexc('2e282c')])
    rnd = random.Random(26)
    for _ in range(900):
        p.fpx(rnd.uniform(0, W), rnd.uniform(SOL, H), rnd.choice([hexc('6a5e60'), hexc('24201e'), hexc('8a3a2a')]))
    for _ in range(80):
        p.fpx(rnd.uniform(0, W), rnd.uniform(0, H), (255, 150, 80, 220))
    bande_sol(p, c=(0, 0, 0, 60))
    return finish(img, vignette=0.45)


def voile():
    img, p = canvas(hexc('0a0614'))
    sky(p, H, [hexc('0a0614'), hexc('2a1040'), hexc('4a1a6a'), hexc('1a0a2a')])
    for k in range(6):  # rideaux de lumière (le Voile)
        x0 = 40 + k * 100
        for y in range(0, SOL + 40, 2):
            x = x0 + math.sin(y / 24 + k) * 18
            p.fline(x, y, x + 14, y, (176 - k * 10, 90 + k * 20, 255, 60))
    rnd = random.Random(27)
    for _ in range(140):
        p.fpx(rnd.uniform(0, W), rnd.uniform(0, H), rnd.choice([WHITE, hexc('c8a0ff'), hexc('8ad0ff')]))
    # îlots de pierre qui flottent, sol de cristal
    for (x, y, w) in [(90, 120, 40), (520, 90, 50), (300, 60, 26)]:
        p.poly([(x - w, y), (x + w, y), (x + w * 0.4, y + w * 0.8), (x - w * 0.3, y + w * 0.9)], hexc('3a2a4a'))
        p.line(x - w, y, x + w, y, hexc('8a6ab0'))
    p.poly([(0, SOL + 4), (640, SOL - 4), (640, H), (0, H)], hexc('2a1a3a'))
    for k in range(18):
        x = k * 38
        p.poly([(x, SOL + 30 + k % 3 * 20), (x + 8, SOL + 6 + k % 3 * 20), (x + 16, SOL + 30 + k % 3 * 20)], (176, 120, 255, 200))
    bande_sol(p, c=(100, 60, 160, 50))
    return finish(img, vignette=0.4)


def plaine():
    img, p = canvas()
    base_exterieur(p, [hexc('3f7fd0'), hexc('8ec0f0'), hexc('c8e4f8')], hexc('5a9a3a'), seed=28)
    cloud(p, 60, 40); cloud(p, 380, 60, 1.3); cloud(p, 560, 30, 0.8)
    hills(p, 160, 10, hexc('8aa8c8'), seed=28, to=SOL)
    hills(p, 186, 8, hexc('6aa85a'), seed=29, to=SOL + 4)
    for x in (40, 600):
        oak(p, x, 240, 1.8, seed=x)
    p.poly([(290, SOL), (350, SOL), (470, H), (170, H)], hexc('b0905a'))
    p.poly([(298, SOL), (342, SOL), (450, H), (190, H)], hexc('c0a06a'))
    flowers(p, 0, SOL + 10, 640, H, 120, seed=28)
    bande_sol(p, c=(0, 0, 0, 30))
    return finish(img, vignette=0.2)


def crypte():
    img, p = canvas(hexc('1a1820'))
    wall_stone(p, 0, 0, W, SOL, hexc('4a4655'), seed=30, h=12, w=26)
    for cx in (160, 480):
        p.ell(cx - 70, 30, cx + 70, 170, hexc('121016'))
        p.rect(cx - 70, 100, cx + 70, SOL, hexc('121016'))
    for x in (20, 300, 600):
        p.rect(x, 0, x + 24, SOL, hexc('5a5668')); p.rect(x, 0, x + 4, SOL, hexc('3a3646'))
    for x in (90, 230, 410, 550):
        torch_wall(p, x, 110)
    floor_stone(p, SOL, H, hexc('3a3846'))
    p.ell(60, 330, 76, 342, hexc('d8d0b8')); p.line(80, 340, 100, 336, hexc('d8d0b8'), 2)
    bande_sol(p, c=(0, 0, 0, 60))
    return finish(img, vignette=0.5)


FONDS = {
    'plaine': plaine, 'crypte': crypte, 'arene': arene, 'foret': foret, 'foret-profonde': foret_profonde, 'clairiere': clairiere,
    'marais': marais, 'camp': camp, 'montagne': montagne, 'sommet': sommet, 'canyon': canyon, 'nid': nid, 'marches': marches,
    'desert': desert, 'ville-desert': ville_desert, 'plage': plage, 'port': port, 'epave': epave, 'rues-nuit': rues_nuit,
    'rempart': rempart, 'breche': breche, 'bibliotheque': bibliotheque, 'palais': palais, 'citadelle': citadelle,
    'forge': forge, 'lac-de-lave': lac_de_lave, 'mine': mine, 'mine-naine': mine_naine, 'ruines': ruines,
    'plaine-cendree': plaine_cendree, 'cendres': cendres, 'voile': voile,
}


if __name__ == '__main__':
    import sys
    out = '../../../assets/combat/fonds' if len(sys.argv) < 2 else sys.argv[1]
    os.makedirs(out, exist_ok=True)
    only = sys.argv[2:]
    for k, f in FONDS.items():
        if only and k not in only:
            continue
        img = f()[0]
        img.convert('RGB').save(f'{out}/{k}.png', optimize=True)
        print(k)
