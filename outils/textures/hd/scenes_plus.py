"""Détails en plus pour la taverne (Chaudron Fêlé) et la Guilde. Positions des PNJ et zones inchangées."""
import random
import scenes_int
from decor2 import *

ORIG = scenes_int.finish


def avec(fn, extra):
    def g():
        def f2(img, zones=None, vignette=0.35):
            extra(P(img, K))
            return ORIG(img, zones, vignette)
        scenes_int.finish = f2
        try:
            return fn()
        finally:
            scenes_int.finish = ORIG
    return g


def toile(p, x, y, sens):
    c = (230, 230, 230, 70)
    for k in range(1, 4):
        r = k * 7
        p.line(x, y + r, x + sens * r, y, c)
    for a in (0, 0.5, 1):
        p.line(x, y, x + sens * 22 * (1 - a), y + 22 * a, c)


def bouquet(p, x, y, c, n=5, h=16):
    p.line(x - 3, y, x + 3, y, hexc('8a6a3a'))
    for i in range(n):
        dx = (i - n // 2) * 2
        p.fline(x + dx / 2, y, x + dx, y + h, shade(c, 0.85 + 0.1 * (i % 2)))
        p.ell(x + dx - 1, y + h - 3, x + dx + 2, y + h + 1, c)


def bougie(p, x, y):
    p.rect(x, y - 8, x + 3, y, hexc('efe4c8'))
    p.ell(x, y - 12, x + 3, y - 8, hexc('ffd84a'))
    glow_light(p, x + 1, y - 10, 16, a=45, steps=3)


def plus_taverne(p):
    # toiles d'araignée et poutre du haut
    toile(p, 0, 19, 1); toile(p, W - 1, 19, -1)
    # herbes, aulx et saucissons pendus à la poutre
    for x, c in [(196, hexc('6a8a3a')), (212, hexc('c8a050')), (290, hexc('7a9a4a')), (306, hexc('8a3a2a')), (322, hexc('8a3a2a')), (380, hexc('6a8a3a')), (396, hexc('e8dcc0'))]:
        p.line(x, 19, x, 24, hexc('8a6a3a'))
        if c == hexc('8a3a2a'):
            p.rect(x - 2, 24, x + 2, 42, c); p.rect(x - 1, 26, x, 40, shade(c, 1.25))
        elif c == hexc('e8dcc0'):
            for i in range(4):
                p.ell(x - 4 + (i % 2) * 4, 24 + i * 5, x + (i % 2) * 4, 30 + i * 5, c)
        else:
            bouquet(p, x, 24, c)
    # ardoise du menu derrière le bar
    p.rect(200, 102, 258, 148, hexc('6a4426')); p.rect(203, 105, 255, 145, hexc('2a302c'))
    p.rect(214, 99, 246, 102, hexc('6a4426'))
    rnd = random.Random(3)
    for l in range(6):
        y = 111 + l * 6
        p.line(207, y, 207 + rnd.randint(18, 30), y, hexc('e8e4d8'))
        p.line(244, y, 251, y, hexc('e8c860'))
    p.ell(222, 140, 236, 144, hexc('c8c8c0'))
    # chopes accrochées sous l'étagère et bouteilles
    for i, x in enumerate(range(176, 258, 12)):
        p.line(x + 3, 84, x + 3, 88, hexc('3a2a1a'))
        p.rect(x, 88, x + 7, 97, hexc('9a6a3e') if i % 2 else hexc('a8a8b0'))
        p.rect(x + 7, 90, x + 9, 95, hexc('5a3a20'))
    for i, x in enumerate(range(26, 154, 16)):
        c = [hexc('3a6a3a'), hexc('6a2a3a'), hexc('8a6a2a'), hexc('2a4a6a')][i % 4]
        p.rect(x, 80, x + 6, 92, c); p.rect(x + 2, 74, x + 4, 80, c); p.rect(x + 1, 82, x + 2, 89, shade(c, 1.5))
    # objets sur le manteau de la cheminée
    bougie(p, 300, 104); bougie(p, 386, 104)
    p.rect(330, 96, 344, 104, hexc('7a8a9a')); p.rect(332, 94, 342, 96, hexc('5a6a7a'))
    p.ell(352, 90, 366, 104, hexc('c8b080')); p.rect(356, 88, 362, 91, hexc('8a6a3a'))
    # bûches empilées et chat endormi près du feu
    for i in range(3):
        p.ell(396 + i * 9, 186, 406 + i * 9, 196, hexc('6a4426')); p.ell(399 + i * 9, 189, 403 + i * 9, 193, hexc('c8a070'))
    p.ell(402 + 4, 178, 412 + 4, 188, hexc('6a4426'))
    shadow(p, 300, 254, 16, 4)
    p.ell(286, 240, 314, 254, hexc('d08a3a')); p.ell(304, 236, 318, 248, hexc('d08a3a'))
    p.poly([(306, 238), (308, 231), (311, 237)], hexc('d08a3a')); p.poly([(312, 237), (316, 231), (317, 239)], hexc('d08a3a'))
    for x in (292, 298):
        p.line(x, 242, x + 2, 252, hexc('a8642a'))
    p.line(310, 243, 312, 243, hexc('3a2a1a')); p.line(314, 243, 316, 243, hexc('3a2a1a'))
    p.ell(280, 248, 290, 254, hexc('d08a3a'))
    # sciure et taches au sol, bougies sur les tables
    rnd = random.Random(9)
    for _ in range(160):
        x, y = rnd.randint(0, W - 1), rnd.randint(236, H - 1)
        p.fpx(x + rnd.random(), y + rnd.random(), hexc('c8a070', 120))
    for x, y, r in [(250, 330, 14), (480, 342, 10)]:
        p.ell(x - r, y - r * 0.3, x + r, y + r * 0.3, (60, 30, 15, 70))
    glow_light(p, 160, 268, 40, a=40); glow_light(p, 396, 282, 40, a=40)


def fanion(p, x, y, c, lettre_c=WHITE):
    p.poly([(x, y), (x + 12, y), (x + 6, y + 14)], c)
    p.line(x + 6, y + 3, x + 6, y + 7, lettre_c)


def plus_guilde(p):
    # guirlande de fanions des rangs (E D C B A S), de part et d'autre de la bannière
    cols = [hexc('8a8a8a'), hexc('3a8a4a'), hexc('3a6ac8'), hexc('8a3ac8'), hexc('c83a3a'), GOLD]
    for x0, x1, s in [(20, 200, 0), (440, 620, 3)]:
        pts = [(x0 + (x1 - x0) * t / 20, 22 + 10 * (1 - (2 * t / 20 - 1) ** 2)) for t in range(21)]
        for a, b in zip(pts, pts[1:]):
            p.line(a[0], a[1], b[0], b[1], hexc('e8dcc0'))
        for i, t in enumerate(range(2, 20, 3)):
            x, y = pts[t]
            fanion(p, x - 6, y, cols[(i + s) % 6])
    # écu et épées croisées à gauche de la bannière
    for a, b in [((226, 82), (270, 132)), ((270, 82), (226, 132))]:
        p.fline(a[0], a[1], b[0], b[1], hexc('c9d3e0'), 2)
    for x in (224, 268):
        p.rect(x, 78, x + 4, 84, GOLD)
    p.poly([(232, 86), (264, 86), (264, 112), (248, 128), (232, 112)], hexc('8a2a2a'))
    p.poly([(236, 90), (260, 90), (260, 110), (248, 122), (236, 110)], hexc('aa3a3a'))
    p.rect(246, 92, 250, 118, GOLD); p.rect(238, 100, 258, 104, GOLD)
    # carte du monde à droite de la bannière
    p.rect(372, 74, 432, 150, hexc('6a4426')); p.rect(375, 77, 429, 147, hexc('e8d8a8'))
    rnd = random.Random(4)
    for cx, cy, r in [(392, 98, 11), (414, 118, 13), (396, 132, 7)]:
        pts = []
        for k in range(12):
            a = k / 12 * 6.283
            rr = r * (0.75 + 0.35 * rnd.random())
            import math
            pts.append((cx + rr * math.cos(a), cy + rr * 0.8 * math.sin(a)))
        p.poly(pts, hexc('a8b878'))
    p.line(392, 98, 414, 118, hexc('c03a2a')); p.ell(412, 116, 417, 121, hexc('c03a2a'))
    for i in range(4):
        p.ell(380 + i * 3, 140, 382 + i * 3, 142, hexc('7a6a5a'))
    # crâne de bête trophée au-dessus du tableau des contrats
    p.rect(512, 54, 538, 60, hexc('6a4426'))
    p.ell(514, 34, 536, 56, hexc('e8dcc0')); p.rect(518, 50, 532, 60, hexc('e8dcc0'))
    p.ell(518, 40, 523, 46, DARK); p.ell(527, 40, 532, 46, DARK)
    for x in (519, 523, 527, 531):
        p.rect(x, 58, x + 2, 62, WHITE)
    p.line(514, 38, 504, 26, hexc('d8c8a0'), 2); p.line(536, 38, 546, 26, hexc('d8c8a0'), 2)
    # bougies et registre sur le comptoir de Rowena, plume de l'intendant
    bougie(p, 300, 216); bougie(p, 344, 216)
    p.rect(262, 208, 290, 216, hexc('6a2a2a')); p.rect(264, 209, 288, 213, hexc('f0e6c8'))
    p.rect(60, 224, 80, 230, hexc('f0e6c8')); p.line(84, 230, 92, 218, WHITE)
    for i in range(3):
        p.ell(130 + i * 7, 225, 136 + i * 7, 230, GOLD)
    # paille, papiers au sol, lumière douce
    rnd = random.Random(11)
    for _ in range(120):
        x, y = rnd.randint(0, W - 1), rnd.randint(276, H - 1)
        p.fline(x, y, x + rnd.randint(-3, 3) / 2, y + 0.5, hexc('d8b860', 140))
    p.poly([(470, 330), (484, 326), (488, 336), (474, 340)], hexc('f0e6c8'))
    glow_light(p, 320, 200, 110, a=30)


SCENES = {'taverne': avec(scenes_int.taverne, plus_taverne), 'guilde': avec(scenes_int.guilde, plus_guilde)}
AVANT = {k: scenes_int.AVANT[k] for k in SCENES}
