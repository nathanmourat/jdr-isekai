"""Effets de combat : bandes de 8 images de 64×64 (512×64), fond transparent, centre en (32, 32)."""
import math, os, random
from px import *

N = 8
WHITE = (255, 255, 255, 255)


def a(c, al):
    return (c[0], c[1], c[2], max(0, min(255, int(al))))


def entaille(p, t):
    k = t / (N - 1)
    if t > 5:
        return
    L = min(1.0, (t + 1) / 3)
    for w, c in ((5, a(hexc('9ad8ff'), 120 * (1 - k))), (3, a(WHITE, 255 * (1 - k * 0.8))), (1, WHITE)):
        x0, y0 = 10, 52
        x1, y1 = 10 + 44 * L, 52 - 40 * L
        p.line(x0 + (1 - L) * 0, y0, x1, y1, c, w)
    if 1 <= t <= 4:
        for i in range(4):
            p.px(54 - i * 6, 10 + i * 9 + t, a(WHITE, 200))


def impact(p, t):
    k = t / (N - 1)
    r = 4 + t * 3
    for i in range(8):
        ang = i / 8 * 2 * math.pi + 0.3
        p.line(32 + math.cos(ang) * r * 0.5, 32 + math.sin(ang) * r * 0.5, 32 + math.cos(ang) * r, 32 + math.sin(ang) * r, a(WHITE, 255 * (1 - k)), 2)
    if t < 4:
        pts = []
        for i in range(10):
            rr = (10 if i % 2 == 0 else 4) * (1 + t * 0.4)
            ang = i / 10 * 2 * math.pi
            pts.append((32 + math.cos(ang) * rr, 32 + math.sin(ang) * rr))
        p.poly(pts, a(hexc('fff4a0'), 230))
    rnd = random.Random(1)
    for i in range(10):
        ang = rnd.random() * 2 * math.pi
        d = 6 + t * 3.5 + rnd.random() * 4
        p.px(32 + math.cos(ang) * d, 40 + math.sin(ang) * d * 0.4, a(hexc('b8a888'), 220 * (1 - k)))


def feu(p, t):
    k = t / (N - 1)
    rnd = random.Random(t)
    r = 6 + min(t, 4) * 4
    f = 1.0 if t < 4 else (1 - (t - 3) / 5) ** 1.5
    p.ell(32 - r, 32 - r, 32 + r, 32 + r, a(hexc('ff5a1a'), 255 * f))
    p.ell(32 - r * 0.7, 32 - r * 0.7, 32 + r * 0.7, 32 + r * 0.7, a(hexc('ff9a2a'), 255 * f))
    if t < 5:
        p.ell(32 - r * 0.4, 32 - r * 0.4, 32 + r * 0.4, 32 + r * 0.4, a(hexc('ffe27a'), 255))
    for i in range(12):
        ang = rnd.random() * 2 * math.pi
        d = r + rnd.random() * 6
        x, y = 32 + math.cos(ang) * d, 32 + math.sin(ang) * d - t
        p.poly([(x - 2, y + 2), (x + 2, y + 2), (x, y - 4)], a(hexc('ff7a1a'), 230 * (1 - k)))


def glace(p, t):
    k = t / (N - 1)
    g = min(1, (t + 1) / 4)
    shards = [(0, 18), (60, 14), (120, 20), (180, 15), (240, 19), (300, 13)]
    for deg, ln in shards:
        ang = math.radians(deg - 90)
        L = ln * g if t < 5 else ln
        tip = (32 + math.cos(ang) * L, 34 + math.sin(ang) * L)
        nx, ny = -math.sin(ang) * 4, math.cos(ang) * 4
        off = (t - 4) * 3 if t >= 5 else 0
        ox, oy = math.cos(ang) * off, math.sin(ang) * off
        al = 255 if t < 6 else 255 * (1 - (t - 5) / 3)
        p.poly([(32 + nx + ox, 34 + ny + oy), (32 - nx + ox, 34 - ny + oy), (tip[0] + ox, tip[1] + oy)], a(hexc('8fd3ff'), al))
        p.line(32 + ox, 34 + oy, tip[0] + ox, tip[1] + oy, a(hexc('e8f8ff'), al))
    if t < 5:
        p.ell(26, 28, 38, 40, a(hexc('c8ecff'), 220))
    for i in range(6):
        ang = i + t
        p.px(32 + math.cos(ang) * (8 + t * 3), 34 + math.sin(ang) * (8 + t * 3), a(WHITE, 220 * (1 - k)))


def foudre(p, t):
    rnd = random.Random(t // 2)
    if t in (0, 1, 2, 4, 5):
        x = 32
        pts = [(x, 0)]
        y = 0
        while y < 50:
            y += rnd.randint(5, 9)
            x += rnd.randint(-7, 7)
            pts.append((x, min(y, 52)))
        for i in range(len(pts) - 1):
            p.line(*pts[i], *pts[i + 1], a(hexc('fff35c'), 160), 5)
        for i in range(len(pts) - 1):
            p.line(*pts[i], *pts[i + 1], WHITE, 2)
        bx, by = pts[3]
        p.line(bx, by, bx + 12, by + 8, a(hexc('fff35c'), 220), 1)
    if t >= 2:
        r = 4 + (t - 2) * 4
        p.ell(32 - r, 52 - r * 0.4, 32 + r, 52 + r * 0.4, a(hexc('fff35c'), 180 * (1 - (t - 2) / 6)))


def soin(p, t):
    rnd = random.Random(7)
    k = t / (N - 1)
    p.ell(14, 46, 50, 58, a(hexc('8dffb0'), 110 * (1 - k * 0.6)))
    for i in range(14):
        x = 14 + rnd.random() * 36
        y0 = 56 - rnd.random() * 10
        y = y0 - (t * 6 + rnd.random() * 6)
        if y < 2:
            continue
        c = hexc('8dffb0') if i % 3 else hexc('ffe27a')
        al = 255 * (1 - max(0, (y0 - y) / 50))
        p.px(x, y, a(c, al)); p.px(x, y - 1, a(c, al * 0.7))
        if i % 4 == 0:
            p.line(x - 2, y - 4, x + 2, y - 4, a(c, al)); p.line(x, y - 6, x, y - 2, a(c, al))


def poison(p, t):
    rnd = random.Random(3)
    k = t / (N - 1)
    for i in range(9):
        x = 18 + rnd.random() * 28
        y = 50 - ((rnd.random() * 30 + t * 5) % 44)
        r = 2 + rnd.random() * 3
        c = hexc('6fd36f') if i % 2 else hexc('a8f06a')
        p.ell(x - r, y - r, x + r, y + r, a(c, 200))
        p.px(x - r * 0.4, y - r * 0.4, a(WHITE, 220))
    p.ell(16, 48, 48, 58, a(hexc('3a8a3a'), 90))
    for i in range(5):
        ang = i * 1.3 + t * 0.5
        p.px(32 + math.cos(ang) * 16, 30 + math.sin(ang) * 10, a(hexc('6fd36f'), 160))


def rune(p, t):
    ang0 = t / N * math.pi / 2
    c, c2 = hexc('9fb7ff'), hexc('e0e8ff')
    al = 255 if t < 6 else 255 * (1 - (t - 5) / 3)
    for r in (22, 16):
        for i in range(90):
            ang = i / 90 * 2 * math.pi
            p.px(32 + math.cos(ang) * r, 32 + math.sin(ang) * r, a(c, al))
    for i in range(6):
        ang = ang0 + i / 6 * 2 * math.pi
        x, y = 32 + math.cos(ang) * 19, 32 + math.sin(ang) * 19
        p.line(x - 1, y - 2, x + 1, y + 2, a(c2, al)); p.px(x + 1, y - 1, a(c2, al))
    pts = [(32 + math.cos(-ang0 + i / 3 * 2 * math.pi) * 15, 32 + math.sin(-ang0 + i / 3 * 2 * math.pi) * 15) for i in range(3)]
    for i in range(3):
        p.line(*pts[i], *pts[(i + 1) % 3], a(c, al))
    p.ell(29, 29, 35, 35, a(c2, al))


def bouclier(p, t):
    g = min(1, (t + 1) / 3)
    al = 150 if t < 6 else 150 * (1 - (t - 5) / 3)
    r = 26 * g
    p.ell(32 - r, 58 - 2 * r, 32 + r, 58 + 2, a(hexc('6ab0ff'), al * 0.6))
    for i in range(80):
        ang = math.pi + i / 79 * math.pi
        p.px(32 + math.cos(ang) * r, 58 + math.sin(ang) * 2 * r, a(hexc('c8e4ff'), al * 1.6))
    if t in (2, 3, 4):
        for i in range(5):
            ang = math.pi * (1.2 + i * 0.15)
            p.px(32 + math.cos(ang) * (r - 4), 58 + math.sin(ang) * 2 * (r - 4), a(WHITE, 230))
    p.line(32 - r, 58, 32 + r, 58, a(hexc('c8e4ff'), al * 1.6))


def fleche(p, t, up_=True, c=hexc('ffd84a')):
    k = t / (N - 1)
    off = (t * 4) if up_ else (-t * 4)
    y = 40 - off if up_ else 14 - off
    al = 255 * (1 - max(0, k - 0.5) * 2)
    if up_:
        p.poly([(32, y - 12), (42, y), (36, y), (36, y + 12), (28, y + 12), (28, y), (22, y)], a(c, al))
        p.line(32, y - 11, 41, y - 1, a(WHITE, al))
    else:
        p.poly([(32, y + 12), (42, y), (36, y), (36, y - 12), (28, y - 12), (28, y), (22, y)], a(c, al))
    for i in range(4):
        p.px(18 + i * 9, 50 - ((t * 5 + i * 11) % 40) if up_ else 10 + ((t * 5 + i * 11) % 40), a(c, al * 0.8))


def bonus(p, t):
    fleche(p, t, True, hexc('ffd84a'))


def malus(p, t):
    fleche(p, t, False, hexc('a070ff'))


def critique(p, t):
    k = t / (N - 1)
    r = 6 + t * 4
    pts = []
    for i in range(16):
        rr = r if i % 2 == 0 else r * 0.35
        ang = i / 16 * 2 * math.pi + 0.2
        pts.append((32 + math.cos(ang) * rr, 32 + math.sin(ang) * rr))
    if t < 6:
        p.poly(pts, a(hexc('ff3a3a'), 230 * (1 - k)))
        p.ell(32 - r * 0.3, 32 - r * 0.3, 32 + r * 0.3, 32 + r * 0.3, a(WHITE, 255 * (1 - k)))
    for i in range(6):
        ang = i / 6 * 2 * math.pi
        p.line(32 + math.cos(ang) * r * 1.1, 32 + math.sin(ang) * r * 1.1, 32 + math.cos(ang) * (r * 1.1 + 6), 32 + math.sin(ang) * (r * 1.1 + 6), a(WHITE, 255 * (1 - k)), 2)


def sacre(p, t):
    k = t / (N - 1)
    w = 4 + min(t, 3) * 4 - max(0, t - 5) * 4
    if w > 0:
        p.rect(32 - w, 0, 32 + w, 58, a(hexc('ffe9a8'), 150))
        p.rect(32 - w // 2, 0, 32 + w // 2, 58, a(WHITE, 220))
    p.ell(32 - 18, 52, 32 + 18, 60, a(hexc('ffe9a8'), 180 * (1 - k * 0.5)))
    rnd = random.Random(5)
    for i in range(10):
        x = 32 + rnd.uniform(-16, 16)
        y = 56 - ((rnd.random() * 40 + t * 7) % 56)
        p.px(x, y, a(hexc('ffd84a'), 230))


def ombre(p, t):
    k = t / (N - 1)
    f = 1 - max(0, k - 0.4) / 0.6
    for i in range(6):
        ang0 = i / 6 * 2 * math.pi + t * 0.45
        pts = []
        for j in range(10):
            ang = ang0 + j * 0.22
            r = 3 + j * 2.0 + t * 1.0
            pts.append((32 + math.cos(ang) * r, 34 + math.sin(ang) * r * 0.75))
        for j in range(len(pts) - 1):
            p.line(*pts[j], *pts[j + 1], a(hexc('8e5bd6') if j < 6 else hexc('c8a0ff'), 240 * f), 2 if j < 5 else 1)
    p.ell(25, 27, 39, 41, a(hexc('2a1440'), 230 * f))
    p.ell(29, 31, 35, 37, a(hexc('b080ff'), 200 * f))
    rnd = random.Random(9)
    for i in range(6):
        p.px(rnd.randint(14, 50), 54 - t * 5 - i * 3, a(hexc('c8a0ff'), 220 * f))


def invocation(p, t):
    k = t / (N - 1)
    c = hexc('6dff8a')
    for i in range(70):
        ang = i / 70 * 2 * math.pi + t * 0.2
        p.px(32 + math.cos(ang) * 24, 52 + math.sin(ang) * 7, a(c, 230))
    for i in range(6):
        ang = i / 6 * 2 * math.pi + t * 0.4
        p.px(32 + math.cos(ang) * 18, 52 + math.sin(ang) * 5, a(WHITE, 230))
    rnd = random.Random(11)
    for i in range(9):
        x = 32 + rnd.uniform(-18, 18)
        y = 50 - (t * 4 + rnd.random() * 12)
        r = 3 + rnd.random() * 3 + t * 0.4
        p.ell(x - r, y - r, x + r, y + r, a(hexc('c8f0d0'), 110 * (1 - k * 0.6)))
    if t >= 4:
        p.ell(24, 30, 40, 50, a(c, 90 * (t - 3) / 4))


EFFETS = dict(entaille=entaille, impact=impact, feu=feu, glace=glace, foudre=foudre, soin=soin, poison=poison, rune=rune,
              bouclier=bouclier, bonus=bonus, malus=malus, critique=critique, sacre=sacre, ombre=ombre, invocation=invocation)


def build(out='../../../assets/effets'):
    os.makedirs(out, exist_ok=True)
    for name, fn in EFFETS.items():
        strip = new(64 * N, 64)
        for t in range(N):
            fr = new(64, 64)
            fn(P(fr), t)
            strip.alpha_composite(fr, (t * 64, 0))
        strip.save(f'{out}/{name}.png')


if __name__ == '__main__':
    build('../../../assets/effets')
    print('ok')
