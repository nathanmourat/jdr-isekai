"""Intérieurs : temple v2, Comptoir de Halvine, Chaudron Fêlé, chambre d'auberge, salle du trône."""
from decor2 import *


def temple():
    img, p = canvas(WHITE)
    rnd = random.Random(4)
    # mur du fond et voûtes
    wall_plaster(p, 0, 0, W, 232, hexc('ece6da'))
    for x in range(-20, W, 128):
        p.ell(x, -70, x + 128, 70, hexc('ddd6c8'))
        p.ell(x + 8, -62, x + 120, 60, hexc('ece6da'))
        p.line(x + 64, 0, x + 64, 60, hexc('d0c8b8'))
    # trois rosaces en soleil
    for cx, r in ((120, 34), (320, 46), (520, 34)):
        cy = 86
        p.ell(cx - r - 6, cy - r - 6, cx + r + 6, cy + r + 6, hexc('a89c86'))
        p.ell(cx - r - 3, cy - r - 3, cx + r + 3, cy + r + 3, hexc('d8ccb0'))
        cols = [hexc('3a6ac8'), hexc('6aa0e8'), hexc('2a4a9a'), hexc('8ac0f0')]
        n = 24
        for k in range(n):
            a0, a1 = k / n * 2 * math.pi, (k + 1) / n * 2 * math.pi
            p.poly([(cx, cy), (cx + math.cos(a0) * r, cy + math.sin(a0) * r), (cx + math.cos(a1) * r, cy + math.sin(a1) * r)], cols[k % 4])
        for k in range(n):
            a = k / n * 2 * math.pi
            p.line(cx + math.cos(a) * r * 0.45, cy + math.sin(a) * r * 0.45, cx + math.cos(a) * r, cy + math.sin(a) * r, hexc('4a4030'))
        for k in range(12):
            a0, a1 = k / 12 * 2 * math.pi, (k + 1) / 12 * 2 * math.pi
            p.poly([(cx, cy), (cx + math.cos(a0) * r * 0.45, cy + math.sin(a0) * r * 0.45), (cx + math.cos(a1) * r * 0.45, cy + math.sin(a1) * r * 0.45)],
                   hexc('ffcf3a') if k % 2 else hexc('ff9a2a'))
        p.ell(cx - r * 0.18, cy - r * 0.18, cx + r * 0.18, cy + r * 0.18, hexc('fff4c0'))
        for k in range(48):
            a = k / 48 * 2 * math.pi
            p.px(cx + math.cos(a) * (r + 1), cy + math.sin(a) * (r + 1), hexc('4a4030'))
        # rayons de lumière jusqu'au sol
        for k in range(-3, 4):
            for t in range(0, 150, 2):
                x = cx + k * 5 + t * 0.32
                y = cy + r + t
                if (t // 2 + k) % 4 == 0:
                    p.px(x, y, (255, 240, 190, 90))
    # colonnes cannelées
    for x in (34, 214, 406, 586):
        p.rect(x - 4, 22, x + 24, 28, hexc('d8d0c0')); p.line(x - 4, 22, x + 24, 22, GOLD)
        p.rect(x, 28, x + 20, 226, hexc('faf8f2'))
        p.rect(x, 28, x + 3, 226, hexc('d0c8b8')); p.rect(x + 17, 28, x + 20, 226, WHITE)
        for xx in range(x + 5, x + 17, 4):
            p.line(xx, 32, xx, 222, hexc('e4ddd0'))
        p.rect(x - 5, 224, x + 25, 234, hexc('d8d0c0')); p.line(x - 5, 224, x + 25, 224, WHITE)
    # sol de marbre en perspective
    p.rect(0, 232, W, H, hexc('dcd6ca'))
    rows = [232, 238, 246, 257, 271, 290, 314, 344, 360]
    for i in range(len(rows) - 1):
        for k in range(-20, 21):
            x0 = 320 + k * (16 + i * 9); x1 = 320 + (k + 1) * (16 + i * 9)
            xb0 = 320 + k * (16 + (i + 1) * 9); xb1 = 320 + (k + 1) * (16 + (i + 1) * 9)
            if (k + i) % 2 == 0:
                p.poly([(x0, rows[i]), (x1, rows[i]), (xb1, rows[i + 1]), (xb0, rows[i + 1])], hexc('ece8de'))
        p.line(0, rows[i], W, rows[i], hexc('c4bdb0'))
    # estrade, autel et tapis
    p.rect(232, 218, 408, 238, hexc('e6e0d4')); p.line(232, 218, 408, 218, WHITE); p.rect(232, 236, 408, 238, hexc('b8b0a2'))
    p.rect(222, 236, 418, 242, hexc('d8d0c2')); p.line(222, 236, 418, 236, WHITE)
    p.poly([(296, 242), (344, 242), (380, H), (260, H)], hexc('2e5aa8'))
    p.poly([(300, 242), (340, 242), (372, H), (268, H)], hexc('3a6ac0'))
    p.line(296, 242, 260, H, GOLD); p.line(344, 242, 380, H, GOLD)
    for y in range(250, H, 14):
        t = (y - 242) / (H - 242)
        p.px(320, y, GOLD); p.px(319 - 2 * t, y + 1, GOLD); p.px(321 + 2 * t, y + 1, GOLD)
    p.rect(282, 188, 358, 220, hexc('f4f0e8')); p.rect(278, 184, 362, 190, hexc('e0d8c8')); p.line(278, 184, 362, 184, GOLD)
    p.rect(290, 196, 350, 212, hexc('2e5aa8')); p.line(290, 196, 350, 196, GOLD)
    p.ell(312, 198, 328, 210, GOLD); p.ell(316, 201, 324, 207, hexc('fff4c0'))
    for cx in (292, 348):
        p.rect(cx - 2, 170, cx + 2, 184, GOLD); p.rect(cx - 1, 164, cx + 1, 170, hexc('f8f4e0'))
        p.px(cx, 161, hexc('ffd84a')); p.px(cx, 162, hexc('ff8a2a')); glow_light(p, cx, 162, 18, a=60, steps=3)
    # figurants : prêtres en prière de chaque côté
    for i, x in enumerate([60, 84, 108, 150, 490, 532, 556, 580]):
        yy = 262 + (i % 2) * 6
        person(p, x, yy, 46, robe=WHITE if i % 2 else hexc('efe8d8'), hood=True, trim=GOLD, arms='pray', skin=hexc(['f2c9a0', 'd9a273', 'f5d7bd', 'a8714a'][i % 4]))
    for i, x in enumerate([190, 450]):
        person(p, x, 250, 40, robe=hexc('e8e0cc'), hair=hexc('6a4a2a'), trim=hexc('3a6ac0'), arms='down')
    # cercle d'invocation
    cx, cy = 320, 300
    p.ell(cx - 190, cy - 40, cx + 190, cy + 40, (74, 160, 255, 70))
    for rx, ry, c in [(170, 36, hexc('4aa0ff')), (150, 32, hexc('9ad8ff')), (112, 24, hexc('4aa0ff')), (76, 16, hexc('9ad8ff'))]:
        for k in range(420):
            a = k / 420 * 2 * math.pi
            p.px(cx + math.cos(a) * rx, cy + math.sin(a) * ry, c)
    for k in range(32):
        a = k / 32 * 2 * math.pi
        x, y = cx + math.cos(a) * 160, cy + math.sin(a) * 34
        g = k % 4
        p.px(x, y - 1, hexc('e0f6ff')); p.px(x, y, hexc('9ad8ff'))
        if g == 0: p.px(x - 1, y, hexc('e0f6ff')); p.px(x + 1, y, hexc('e0f6ff'))
        if g == 1: p.px(x, y - 2, hexc('e0f6ff'))
    pts = [(cx + math.cos(k / 6 * 2 * math.pi) * 110, cy + math.sin(k / 6 * 2 * math.pi) * 23) for k in range(6)]
    for i in range(6):
        p.line(*pts[i], *pts[(i + 2) % 6], hexc('4aa0ff'))
    p.ell(cx - 16, cy - 4, cx + 16, cy + 4, hexc('e0f6ff'))
    for y in range(120, cy):
        w = 18 + (cy - y) * 0.06
        for x in range(int(cx - w), int(cx + w)):
            if (x + y) % 3 == 0:
                p.px(x, y, (190, 230, 255, 60))
    for _ in range(60):
        p.px(rnd.randint(140, 500), rnd.randint(130, 330), (210, 240, 255, 220))
    return finish(img, {'aureliath': (320, 240), 'elianne': (430, 258), 'tobin': (230, 262), 'cercle': (320, 300)}, vignette=0.25)


def boutique():
    img, p = canvas()
    wall_planks(p, 0, 0, W, 200, hexc('8a5a34'), seed=2)
    p.rect(0, 0, W, 10, WOOD_D)
    for x in (0, 210, 430, 630):
        p.rect(x, 0, x + 10, 210, WOOD_D); p.line(x + 9, 0, x + 9, 210, WOOD_L)
    # étagères chargées
    shelf(p, 76, 30, 118, rows=4, gap=36, seed=1)
    shelf(p, 450, 30, 170, rows=4, gap=36, seed=7)
    # fenêtre avec vitrine
    window(p, 250, 36, 140, 74, arch=False)
    for k in range(6):
        p.ell(258 + k * 22, 98, 268 + k * 22, 108, [hexc('e84a4a'), hexc('4ad87a'), hexc('4a8aff')][k % 3])
    # objets suspendus : jambons, herbes, lanterne, épée
    for x, kind in [(230, 'herbes'), (410, 'herbes'), (300, 'lanterne'), (360, 'epee')]:
        p.line(x, 10, x, 20, hexc('2a2a2a'))
        if kind == 'herbes':
            for k in range(-4, 5, 2):
                p.line(x, 20, x + k, 34, hexc('6a9a4a'), 2)
        elif kind == 'lanterne':
            lantern(p, x, 20)
        else:
            p.line(x, 20, x, 50, STEEL_L := hexc('c9d3e0'), 2); p.line(x - 5, 26, x + 5, 26, GOLD)
    # sol
    floor_planks(p, 200, H, hexc('6a4426'))
    rug(p, 320, 312, 150, 26, hexc('2e4a8c'))
    # comptoir (Halvine se tient derrière)
    p.rect(200, 196, 440, 250, hexc('6a4024'))
    p.rect(194, 190, 446, 200, hexc('a06a3a')); p.line(194, 190, 446, 190, hexc('c88a4a'))
    for x in range(214, 430, 36):
        p.rect(x, 206, x + 26, 244, hexc('5a3420')); p.line(x, 206, x + 26, 206, hexc('7a4a2a'))
    # boulier, balance, registre, pièces
    p.rect(214, 172, 250, 190, WOOD_D); p.rect(216, 174, 248, 188, hexc('2a1a10'))
    for r in range(4):
        p.line(216, 177 + r * 3, 248, 177 + r * 3, hexc('c8a070'))
        for k in range(5):
            p.px(219 + k * 6 + (r % 2) * 2, 177 + r * 3, [hexc('d84a3a'), hexc('f4f0e8')][k % 2])
    p.line(380, 160, 380, 190, GOLD); p.line(366, 166, 394, 166, GOLD)
    p.ell(362, 168, 372, 174, GOLD); p.ell(388, 172, 398, 178, GOLD)
    p.rect(330, 182, 356, 190, hexc('f0e6c8')); p.line(343, 182, 343, 190, hexc('a08a60'))
    for k in range(5):
        p.ell(300 + k * 3, 184 - k, 305 + k * 3, 188 - k, GOLD)
    # tonneaux, caisses, mannequin d'armure
    barrel(p, 40, 300, 12, 30); barrel(p, 70, 310, 12, 30); crate(p, 90, 300, 26); crate(p, 100, 274, 20)
    p.rect(560, 230, 564, 300, WOOD_D)
    p.poly([(548, 236), (576, 236), (572, 270), (552, 270)], hexc('9aa0ac')); p.line(562, 238, 562, 268, hexc('c8ccd6'))
    p.ell(554, 220, 570, 236, hexc('9aa0ac')); p.rect(550, 296, 576, 300, WOOD_D)
    p.rect(590, 250, 600, 300, WOOD); p.line(595, 250, 595, 230, hexc('c9d3e0'), 2); p.line(600, 252, 612, 226, hexc('c9d3e0'), 2)
    # porte (sortie)
    door(p, 14, 116, 50, 84, open_=False)
    glow_light(p, 300, 26, 120, a=40)
    return finish(img, {'halvine': (320, 205), 'comptoir': (320, 200), 'porte': (39, 160)}, vignette=0.4)


def taverne():
    img, p = canvas()
    wall_planks(p, 0, 0, W, 196, hexc('7a4a2a'), seed=5)
    p.rect(0, 0, W, 14, WOOD_D)
    for x in range(0, W, 106):
        p.rect(x, 14, x + 8, 196, WOOD_D)
    for y in (14, 70):
        p.rect(0, y, W, y + 5, WOOD_D)
    floor_planks(p, 196, H, hexc('5a3820'))
    # bar (Bram derrière) et tonneaux en étagère
    for i in range(4):
        barrel(p, 36 + i * 30, 120, 12, 28, hexc('8a5a32'))
    for i in range(3):
        barrel(p, 50 + i * 30, 90, 12, 28, hexc('7a4a2a'))
    p.rect(20, 92, 160, 95, WOOD_D)
    shelf(p, 170, 36, 90, rows=2, gap=24, items='pot', seed=3)
    p.rect(20, 176, 270, 230, hexc('5a3420'))
    p.rect(14, 170, 276, 180, hexc('9a6236')); p.line(14, 170, 276, 170, hexc('c08048'))
    for x in range(30, 260, 30):
        p.rect(x, 186, x + 20, 226, hexc('4a2a18'))
    for x in (60, 120, 200):
        p.rect(x, 160, x + 6, 170, hexc('c8a050')); p.rect(x, 158, x + 6, 160, WHITE)
    # cheminée
    fireplace(p, 300, 196, 90, 74)
    # escalier vers la chambre, à droite
    p.rect(470, 30, 640, 196, hexc('5a3820'))
    door(p, 590, 26, 34, 54, hexc('6a4426'))
    stairs_up(p, 470, 236, n=10, dx=11, dy=20, w=46, c=hexc('8a5a32'))
    p.rect(578, 76, 640, 82, WOOD_D)
    # fenêtre nuit, lanternes, trophée
    window(p, 410, 40, 44, 50, night=True)
    lantern(p, 160, 20); lantern(p, 420, 110)
    p.ell(240, 20, 270, 40, hexc('8a6a4a')); p.line(242, 22, 232, 10, hexc('e8dcc0'), 2); p.line(268, 22, 278, 10, hexc('e8dcc0'), 2)
    # tables et clients
    table(p, 140, 286, 80, items=[(-20, 'chope'), (6, 'assiette'), (20, 'bougie')])
    table(p, 380, 300, 90, items=[(-24, 'chope'), (-6, 'chope'), (16, 'assiette')])
    for x, y in [(96, 300), (184, 300), (330, 314), (430, 314)]:
        stool(p, x, y)
    person(p, 96, 296, 44, robe=hexc('3a5a3a'), hair=hexc('8a5a2a'))
    person(p, 430, 312, 46, robe=hexc('6a3a5a'), hair=hexc('2a1a12'))
    person(p, 330, 312, 40, robe=hexc('8a6a3a'), hair=hexc('c8a060'), back=True)
    glow_light(p, 340, 160, 160, a=50)
    return finish(img, {'bram': (150, 190), 'ferrand': (520, 300), 'escalier': (540, 170), 'porte_chambre': (607, 70), 'sortie': (24, 300)}, vignette=0.45)


def chambre():
    img, p = canvas()
    wall_planks(p, 0, 0, W, 216, hexc('8a6040'), seed=8)
    p.rect(0, 0, W, 16, WOOD_D)
    # poutres en pente (sous les toits)
    p.poly([(0, 0), (220, 0), (0, 120)], hexc('4a2e18')); p.poly([(640, 0), (420, 0), (640, 120)], hexc('4a2e18'))
    window(p, 280, 52, 80, 72, night=False)
    p.rect(276, 50, 364, 54, WOOD_D)
    for side in (-1, 1):
        p.poly([(320 + side * 44, 50), (320 + side * 62, 50), (320 + side * 54, 140), (320 + side * 40, 140)], hexc('8a2a3a'))
    floor_planks(p, 216, H, hexc('6a4426'))
    rug(p, 330, 300, 120, 26, hexc('5a6a3a'), hexc('d8c070'))
    bed(p, 420, 286, 170, 44, hexc('3a5aa0'))
    # table de nuit + bougie, coffre, chaise
    p.rect(390, 230, 412, 262, WOOD); p.rect(388, 226, 414, 232, WOOD_L)
    p.rect(399, 214, 402, 226, hexc('f0e6c8')); p.px(400, 211, hexc('ffd84a')); p.px(400, 212, hexc('ff8a2a')); glow_light(p, 400, 212, 40, a=70)
    p.rect(80, 262, 150, 300, hexc('7a4a2a')); p.rect(78, 252, 152, 266, hexc('8a5a32')); p.line(78, 252, 152, 252, WOOD_L)
    p.rect(110, 270, 120, 280, GOLD)
    p.line(80, 280, 150, 280, hexc('4a4a52'), 2)
    p.rect(190, 236, 222, 240, WOOD_L); p.rect(192, 240, 196, 276, WOOD); p.rect(216, 240, 220, 276, WOOD)
    p.rect(192, 206, 196, 238, WOOD); p.rect(216, 206, 220, 238, WOOD); p.rect(192, 206, 220, 210, WOOD_L)
    p.rect(30, 150, 36, 160, hexc('c9d3e0')); p.line(33, 140, 33, 150, hexc('6a4a2a'))
    # porte (retour à la salle)
    door(p, 30, 120, 50, 96, hexc('6a4426'), arch=False)
    glow_light(p, 320, 90, 140, a=40, c=(200, 220, 255))
    return finish(img, {'lit': (505, 255), 'porte': (55, 170), 'coffre': (115, 270)}, vignette=0.4)


def chateau_trone():
    img, p = canvas()
    wall_stone(p, 0, 0, W, 230, hexc('d8d4cc'), seed=9, h=12, w=26)
    for x in range(-10, W, 160):
        p.ell(x, -60, x + 160, 60, hexc('c8c4bc')); p.ell(x + 8, -52, x + 152, 50, hexc('e0dcd4'))
    for x in (60, 200, 420, 560):
        banner(p, x, 40, 34, 110, hexc('2e4a9c'), emblem='soleil')
    for x in (130, 490):
        window(p, x, 40, 40, 110, arch=True)
    for x in (20, 160, 300, 460, 600):
        if x == 300: continue
        p.rect(x, 20, x + 20, 230, hexc('f0ece4')); p.rect(x, 20, x + 3, 230, hexc('c8c4bc'))
        p.rect(x - 4, 16, x + 24, 22, GOLD)
    # trône sur estrade
    p.rect(250, 196, 390, 226, hexc('b8b4ac')); p.line(250, 196, 390, 196, WHITE)
    p.rect(236, 222, 404, 236, hexc('a8a49c'))
    p.rect(296, 110, 344, 196, hexc('2e4a9c')); p.rect(290, 104, 350, 112, GOLD)
    p.poly([(290, 104), (320, 80), (350, 104)], GOLD); p.ell(314, 86, 326, 98, hexc('5fd3ff'))
    p.rect(286, 160, 354, 196, GOLD); p.rect(292, 166, 348, 190, hexc('2e4a9c'))
    p.rect(282, 150, 292, 196, GOLD); p.rect(348, 150, 358, 196, GOLD)
    floor_stone(p, 230, H, hexc('b8b0a8'))
    p.poly([(294, 236), (346, 236), (396, H), (244, H)], hexc('8a1a2a')); p.line(294, 236, 244, H, GOLD); p.line(346, 236, 396, H, GOLD)
    for x in (80, 560):
        torch_wall(p, x, 170)
    for x in (200, 440):
        person(p, x, 262, 48, robe=hexc('c8ccd6'), hair=hexc('3a3a3a'), trim=GOLD)
        p.line(x + 8, 210, x + 8, 262, hexc('6a4426'), 2); p.poly([(x + 6, 210), (x + 10, 210), (x + 8, 200)], hexc('c9d3e0'))
    return finish(img, {'edmund-iv': (320, 196), 'seraphine': (380, 232)}, vignette=0.35)


SCENES = {'temple-du-seuil': temple, 'boutique': boutique, 'taverne': taverne, 'auberge-chambre': chambre, 'chateau-trone': chateau_trone}


def compass(p, cx, cy, r, c, c2):
    for k in range(8):
        a = k / 8 * 2 * math.pi - math.pi / 2
        rr = r if k % 2 == 0 else r * 0.55
        a1 = a + math.pi / 2; w = r * 0.18
        p.poly([(cx + math.cos(a) * rr, cy + math.sin(a) * rr), (cx + math.cos(a1) * w, cy + math.sin(a1) * w),
                (cx - math.cos(a1) * w, cy - math.sin(a1) * w)], c if k % 2 == 0 else c2)
    p.ell(cx - 3, cy - 3, cx + 3, cy + 3, c2)


def guilde():
    img, p = canvas()
    wall_planks(p, 0, 0, W, 240, hexc('7a4e2c'), seed=12)
    p.rect(0, 0, W, 16, WOOD_D); p.rect(0, 52, W, 60, WOOD_D)
    for x in (0, 208, 424, 624):
        p.rect(x, 0, x + 16, 240, hexc('5a3820')); p.line(x + 15, 0, x + 15, 240, WOOD_L)
    # bannière rose des vents
    p.rect(276, 64, 364, 172, hexc('2e4a8c')); p.poly([(276, 172), (320, 192), (364, 172)], hexc('2e4a8c'))
    p.rect(276, 64, 364, 68, GOLD); p.line(276, 68, 276, 172, GOLD); p.line(364, 68, 364, 172, GOLD); p.rect(270, 60, 370, 63, WOOD_D)
    compass(p, 320, 120, 36, hexc('f4f0e8'), GOLD)
    # tableau des contrats (à droite)
    p.rect(440, 70, 610, 200, hexc('8a6a3a')); p.rect(446, 76, 604, 194, hexc('b89a6a'))
    rnd = random.Random(8)
    for i in range(15):
        x = 452 + (i % 5) * 30 + rnd.randint(-2, 2); y = 82 + (i // 5) * 38 + rnd.randint(0, 3)
        p.rect(x, y, x + 24, y + 30, hexc('f4ecd4') if i % 4 else hexc('e8d8a8'))
        p.ell(x + 10, y - 1, x + 14, y + 3, hexc('c03a2a'))
        for l in range(4):
            p.line(x + 3, y + 7 + l * 5, x + 20 - (l * 4) % 9, y + 7 + l * 5, hexc('7a6a5a'))
        if i % 5 == 2:
            p.ell(x + 8, y + 22, x + 15, y + 28, hexc('c03a2a'))
    # râtelier d'armes (équipement de la Guilde) à gauche
    p.rect(30, 90, 180, 96, WOOD_D)
    for k, (c, kind) in enumerate([(hexc('c9d3e0'), 'epee'), (hexc('8a5a32'), 'arc'), (hexc('c9d3e0'), 'lance'), (hexc('c9d3e0'), 'hache'), (hexc('8a5a32'), 'baton')]):
        x = 44 + k * 28
        if kind == 'arc':
            for yy in range(100, 170):
                p.px(x + 6 - ((yy - 135) ** 2) / 220, yy, c)
            p.line(x, 100, x, 170, hexc('e0e0d0'))
        else:
            p.line(x, 96, x, 174, c if kind != 'baton' else c, 2)
            if kind == 'hache': p.poly([(x, 104), (x + 10, 100), (x + 10, 116), (x, 112)], c)
            if kind == 'lance': p.poly([(x - 3, 100), (x + 3, 100), (x, 88)], c)
            if kind == 'epee': p.line(x - 5, 150, x + 5, 150, GOLD, 2)
            if kind == 'baton': p.ell(x - 3, 90, x + 3, 96, hexc('8fe8ff'))
    p.rect(30, 172, 180, 178, WOOD_D)
    # sol
    floor_planks(p, 240, H, hexc('6a4426'))
    rug(p, 320, 318, 160, 26, hexc('2e4a8c'))
    # comptoir de l'accueil (Dame Rowena) au centre
    p.rect(214, 222, 426, 270, hexc('5a3820'))
    p.rect(208, 216, 432, 226, hexc('8a5a32')); p.line(208, 216, 432, 216, hexc('aa7a4a'))
    for x in range(224, 420, 34):
        p.rect(x, 232, x + 24, 266, hexc('4a2e18'))
    p.rect(232, 204, 252, 216, hexc('f0e6c8')); p.rect(380, 206, 396, 216, hexc('c8b080')); p.line(388, 196, 392, 206, hexc('6a4426'))
    # comptoir de l'intendant (équipement), à gauche devant le râtelier
    p.rect(40, 236, 170, 268, hexc('5a3820')); p.rect(34, 230, 176, 238, hexc('8a5a32')); p.line(34, 230, 176, 230, hexc('aa7a4a'))
    crate(p, 180, 290, 22); barrel(p, 22, 300, 11, 26)
    # lanternes
    for x in (110, 530):
        lantern(p, x, 20)
    # aventuriers de passage (figurants)
    person(p, 520, 300, 46, robe=hexc('6a3a2a'), hair=hexc('2a1a12'), back=True)
    person(p, 560, 306, 44, robe=hexc('3a5a6a'), hair=hexc('c8a060'), back=True)
    table(p, 560, 340, 70, items=[(-16, 'chope'), (10, 'chope')])
    return finish(img, {'rowena': (320, 233), 'intendant-guilde': (105, 247), 'kaya': (450, 300), 'tableau': (525, 135)}, vignette=0.4)


SCENES['guilde'] = guilde


# Zones de premier plan (comptoirs) : recopiées dans decors/<id>-avant.png, à dessiner PAR-DESSUS les PNJ.
AVANT = {
    'boutique': [(192, 188, 448, 252)],
    'taverne': [(12, 168, 278, 232)],
    'guilde': [(206, 214, 434, 272), (32, 228, 178, 270)],
}
