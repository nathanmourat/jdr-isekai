"""Icônes de traits raciaux, 32×32, fond transparent, contour sombre."""
import math, os
from px import *

GOLD = hexc('e8b83c'); GOLD_L = hexc('fff0a0'); SKIN = hexc('f2c9a0'); SKIN_D = hexc('c8946a')
SILVER = hexc('d8dce6'); SILVER_D = hexc('9aa0b0')


def rays(p, cx, cy, r0, r1, c, n=8, off=0):
    for k in range(n):
        a = k / n * 2 * math.pi + off
        p.line(cx + math.cos(a) * r0, cy + math.sin(a) * r0, cx + math.cos(a) * r1, cy + math.sin(a) * r1, c)


def determination(p):  # poing serré lumineux
    rays(p, 16, 15, 11, 14, GOLD_L, 8, math.pi / 8)
    p.rect(9, 9, 22, 20, SKIN)
    for x in (12, 15, 18):
        p.line(x, 9, x, 13, SKIN_D)
    p.line(9, 14, 22, 14, SKIN_D)
    p.rect(9, 14, 13, 17, shade(SKIN, 1.08))  # pouce
    p.line(10, 15, 13, 15, SKIN_D)
    p.rect(12, 21, 20, 27, hexc('3d5c8c'))  # poignet / manche
    p.line(12, 21, 20, 21, GOLD)
    p.line(10, 10, 13, 10, (255, 255, 255, 255))


def sang_ancien(p):  # feuille argentée et étoile
    p.poly([(6, 26), (10, 14), (18, 6), (26, 4), (24, 12), (16, 22)], SILVER)
    p.poly([(6, 26), (16, 22), (24, 12), (26, 4)], SILVER_D)
    p.line(7, 25, 24, 7, hexc('7a8090'))
    for k in range(3):
        p.line(10 + k * 4, 21 - k * 4, 8 + k * 4, 16 - k * 4, hexc('7a8090'))
    cx, cy = 23, 22
    pts = []
    for k in range(10):
        r = 6 if k % 2 == 0 else 2.5
        a = k / 10 * 2 * math.pi - math.pi / 2
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    p.poly(pts, GOLD)
    p.px(cx, cy, GOLD_L)


def entre_deux_mondes(p):  # deux mains qui se rejoignent
    # main gauche (claire) et main droite (plus sombre)
    for side, c in ((-1, SKIN), (1, hexc('b07a50'))):
        x0 = 16 + side * 15
        p.poly([(x0, 20), (16 + side * 6, 17), (16 + side * 6, 22), (x0, 25)], hexc('5a7a9a') if side < 0 else hexc('7a5a8a'))
        p.rect(min(16 + side * 6, 16 + side * 1), 13, max(16 + side * 6, 16 + side * 1), 21, c)
        for k in range(3):
            y = 13 + k * 3
            p.line(16 + side * 1, y, 16 + side * 6, y, shade(c, 0.8))
        p.rect(min(16 + side * 5, 16 + side * 7), 10, max(16 + side * 5, 16 + side * 7), 14, c)  # pouce
    rays(p, 16, 15, 3, 7, GOLD_L, 6)
    p.rect(15, 12, 16, 20, (255, 255, 255, 255))


def robuste(p):  # enclume et bouclier
    p.poly([(8, 3), (24, 3), (24, 14), (16, 22), (8, 14)], hexc('8a5a32'))
    p.poly([(10, 5), (22, 5), (22, 13), (16, 19), (10, 13)], hexc('a87040'))
    p.line(16, 5, 16, 18, GOLD); p.line(10, 9, 22, 9, GOLD)
    # enclume
    p.poly([(4, 18), (26, 18), (28, 20), (22, 21), (20, 23), (12, 23), (10, 21), (4, 20)], hexc('5a5e6a'))
    p.line(4, 18, 26, 18, hexc('9aa0ac'))
    p.rect(13, 23, 19, 26, hexc('4a4e58'))
    p.rect(9, 26, 23, 29, hexc('5a5e6a')); p.line(9, 26, 23, 26, hexc('8a8e9a'))
    p.px(24, 16, hexc('ffb03a')); p.px(26, 14, hexc('ffd84a'))


def instinct_de_meute(p):  # trois griffures
    p.ell(3, 3, 28, 28, hexc('3a3036'))
    for k in range(3):
        x = 9 + k * 6
        p.poly([(x, 6), (x + 3, 6), (x + 5, 26), (x + 3, 27)], hexc('c8322a'))
        p.line(x + 1, 7, x + 4, 25, hexc('ff7a5a'))


def ruse(p):  # queue de renard enroulée
    pts = []
    for k in range(40):
        t = k / 39
        a = t * 3.6 * math.pi
        r = 12 - t * 9
        pts.append((16 + math.cos(a) * r, 16 + math.sin(a) * r))
    for i in range(len(pts) - 1):
        w = 3 - i // 18
        p.thick(*pts[i], *pts[i + 1], hexc('d8702a'), max(1, w))
    p.ell(1, 10, 9, 19, hexc('d8702a'))
    p.ell(0, 15, 6, 21, hexc('f4f0e8'))
    for i in range(4, 30, 6):
        p.px(*pts[i], hexc('a04a1a'))


def sang_cendre(p):  # goutte de sang violette et flamme noire
    p.poly([(18, 2), (24, 10), (27, 18), (22, 26), (15, 26), (12, 18), (16, 12)], hexc('1e1a24'))
    p.poly([(18, 8), (22, 16), (20, 22), (16, 20), (17, 14)], hexc('3a3046'))
    p.px(19, 12, hexc('7a3a8a'))
    # goutte
    p.poly([(9, 10), (5, 18), (13, 18)], hexc('8a3ab0'))
    p.ell(4, 15, 14, 26, hexc('8a3ab0'))
    p.ell(6, 17, 9, 21, hexc('c88ae8'))


def ecailles_et_souffle(p):  # écaille rouge et petite flamme
    p.poly([(4, 10), (14, 6), (20, 12), (18, 24), (10, 28), (4, 20)], hexc('b8282a'))
    p.poly([(6, 12), (14, 8), (18, 13), (16, 22), (10, 25), (6, 19)], hexc('e04a3a'))
    p.line(7, 13, 13, 10, hexc('ff9a7a'))
    p.line(11, 13, 11, 24, hexc('8a1a1a'))
    # flamme
    p.poly([(22, 28), (28, 28), (29, 22), (26, 12), (24, 18), (21, 20)], hexc('ff7a1a'))
    p.poly([(23, 28), (27, 28), (27, 23), (25, 18), (23, 23)], hexc('ffd84a'))


ICONS = {
    'determination': determination, 'sang-ancien': sang_ancien, 'entre-deux-mondes': entre_deux_mondes,
    'robuste': robuste, 'instinct-de-meute': instinct_de_meute, 'ruse': ruse,
    'sang-cendre': sang_cendre, 'ecailles-et-souffle': ecailles_et_souffle,
}


def build(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    for name, fn in ICONS.items():
        img = new(32, 32)
        fn(P(img))
        img = outline(img)
        img.save(f'{out_dir}/{name}.png')


if __name__ == '__main__':
    build('../../assets/icones/races')
