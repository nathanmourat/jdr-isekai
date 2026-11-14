"""Extérieurs du chapitre 1."""
from decor2 import *

GRASS = hexc('5a9a3a')


def combe_aux_saules():
    img, p = canvas()
    sky(p, 170)
    cloud(p, 80, 40); cloud(p, 420, 28, 1.2); cloud(p, 560, 64, 0.7)
    hills(p, 130, 10, hexc('8ab8a0'), seed=1, to=180)
    hills(p, 150, 8, hexc('6aa860'), seed=2, to=200)
    ground_grass(p, 170, H, GRASS, seed=3)
    # champs en bandes
    for i, c in enumerate([hexc('c8b860'), hexc('8ab850'), hexc('d8c070')]):
        p.poly([(380 + i * 40, 172), (420 + i * 40, 172), (460 + i * 70, 220), (400 + i * 70, 220)], c)
    # ferme de Gareth
    house_front(p, 470, 196, 70, 40, wall=hexc('e8dcc0'), roof=hexc('c8a060'), roof_h=24, seed=1)
    for k in range(6):
        p.line(400 + k * 18, 230, 400 + k * 18, 222, WOOD);
    p.line(396, 225, 500, 225, WOOD, 1); p.line(396, 228, 500, 228, WOOD, 1)
    # ruisseau qui serpente
    top = [(0, 250), (120, 262), (240, 252), (360, 272), (480, 262), (640, 280)]
    bot = [(0, 262), (120, 276), (240, 266), (360, 288), (480, 278), (640, 298)]
    water(p, top, bot, hexc('5a9ad0'), seed=2)
    # saules
    for (x, y, s) in [(70, 250, 1.4), (190, 240, 1.1), (330, 236, 0.9), (590, 262, 1.5), (250, 330, 1.2)]:
        willow(p, x, y, s, seed=x)
    for x in (140, 420, 520):
        bush(p, x, 300, 1.2, seed=x)
    flowers(p, 0, 290, 640, 358, 90, seed=4)
    return finish(img, {'gareth': (440, 312)}, vignette=0.2)


def combe_lisiere():
    img, p = canvas()
    sky(p, 150, [hexc('5a8ac8'), hexc('8ab0d8'), hexc('c8dcec')])
    hills(p, 120, 6, hexc('7aa890'), seed=4, to=170)
    # mur d'arbres sombres au fond
    for x in range(-10, 660, 22):
        oak(p, x, 190 + (x * 7) % 12, 1.3, c=hexc('2e5a2e'), seed=x)
    ground_grass(p, 196, H, hexc('5a8a3a'), seed=5)
    # sentier boueux avec empreintes
    p.poly([(250, 200), (330, 200), (420, H), (150, H)], hexc('7a5a3a'))
    p.poly([(266, 200), (318, 200), (390, H), (186, H)], hexc('8a6a44'))
    rnd = random.Random(2)
    for i in range(9):
        y = 214 + i * 16
        x = 286 + (i % 2) * 18 + (y - 200) * 0.08
        for (dx, dy) in [(0, 0), (-3, -3), (0, -4), (3, -3)]:
            p.ell(x + dx - 1, y + dy - 1, x + dx + 1, y + dy + 1, hexc('4a3220'))
    # ronces, souches
    for (x, y, s) in [(90, 300, 1.5), (520, 290, 1.6), (600, 330, 1.2), (40, 250, 1.1)]:
        bush(p, x, y, s, c=hexc('3a5a2a'), seed=x, berries=hexc('5a1a3a'))
        for k in range(5):
            p.line(x - 18 + k * 8, y, x - 12 + k * 7, y - 16 - k % 2 * 4, hexc('5a3a2a'))
    stump(p, 180, 280, 1.4); stump(p, 470, 250, 1.1); rock(p, 560, 240, 1.2)
    return finish(img, {'empreintes': (300, 290)}, vignette=0.35)


def combe_ruisseau():
    img, p = canvas()
    sky(p, 120, [hexc('6a9ad0'), hexc('a8c8e8')])
    ground_grass(p, 110, H, hexc('5a9a3a'), seed=6)
    top = [(0, 190), (160, 180), (320, 200), (480, 188), (640, 196)]
    bot = [(0, 300), (160, 290), (320, 316), (480, 300), (640, 312)]
    water(p, top, bot, hexc('4a8ac0'), seed=6)
    for i in range(14):
        rock(p, 20 + i * 47, 300 + (i * 13) % 20, 0.8 + (i % 3) * 0.2, c=hexc('7a8478'))
    for (x, y, s) in [(60, 186, 1.8), (330, 180, 1.6), (580, 190, 1.9)]:
        willow(p, x, y, s, seed=x)
    for x in range(0, 640, 9):
        p.line(x, 196 + (x * 3) % 8, x + 1, 186 + (x * 5) % 8, hexc('6a9a3a'))
    flowers(p, 0, 320, 640, 358, 60, seed=7, cols=[hexc('ffd84a'), WHITE])
    return finish(img, {}, vignette=0.3)


def combe_taniere():
    img, p = canvas()
    sky(p, 140, [hexc('3a5a8a'), hexc('6a8ab0'), hexc('a8b8c8')])
    for x in range(-10, 660, 30):
        oak(p, x, 170, 1.2, c=hexc('24452a'), seed=x + 3)
    ground_grass(p, 170, H, hexc('4a7a32'), seed=8)
    # vieux saule creux géant
    willow(p, 320, 300, 3.0, c=hexc('5a8a42'), trunk=hexc('4a3a2a'), seed=9, hollow=True)
    p.ell(296, 248, 344, 306, hexc('0e0a08'))
    for k in range(5):
        p.px(310 + k * 5, 290 - k % 2 * 3, hexc('ffd030') if k == 2 else hexc('0e0a08'))  # deux yeux qui brillent
    p.px(316, 282, hexc('ffd030')); p.px(324, 282, hexc('ffd030'))
    for (x, y) in [(150, 320), (500, 314), (420, 340)]:
        p.ell(x - 6, y - 2, x + 6, y + 2, hexc('e8e0c8'))  # os
        p.line(x - 8, y + 4, x + 6, y + 6, hexc('e8e0c8'), 2)
    for x in (80, 560):
        bush(p, x, 320, 1.6, c=hexc('2e4a2a'), seed=x)
    p.ell(0, 0, W, H, (0, 0, 0, 0))
    return finish(img, {'taniere': (320, 280)}, vignette=0.5)


def arene():
    img, p = canvas()
    sky(p, 200)
    cloud(p, 120, 24); cloud(p, 480, 34, 1.1)
    # gradins en arc
    for i in range(6):
        y0 = 70 + i * 22
        c = shade(hexc('c8b8a0'), 1 - i * 0.04)
        p.ell(-120 + i * 10, y0, W + 120 - i * 10, y0 + 300 - i * 20, c)
        p.ell(-110 + i * 10, y0 + 6, W + 110 - i * 10, y0 + 300 - i * 20, shade(c, 0.85))
    rnd = random.Random(3)
    for i in range(5):
        y = 82 + i * 22
        for x in range(10, 630, 7):
            if rnd.random() < 0.8:
                c = rnd.choice([hexc('b8503a'), hexc('3a64b8'), hexc('e8c03a'), hexc('5a8a4a'), hexc('f0e6d0'), hexc('6a3a8a')])
                p.rect(x, y, x + 4, y + 6, c); p.ell(x, y - 4, x + 4, y, hexc(['f2c9a0', 'd9a273', 'a8714a'][rnd.randrange(3)]))
    # mur de l'arène et sable
    p.rect(0, 196, W, 222, hexc('8a7a68')); p.line(0, 196, W, 196, hexc('b8a890'))
    for x in range(0, W, 80):
        banner(p, x + 20, 198, 22, 20, [hexc('2e4a9c'), hexc('b8282a')][x // 80 % 2], emblem='soleil')
    dither_v(p, 0, 222, W, H, [hexc('e0c890'), hexc('d0b478'), hexc('c0a468')])
    for _ in range(500):
        p.px(rnd.randint(0, W - 1), rnd.randint(224, H - 1), hexc('b89c64'))
    # herse et loge
    p.rect(296, 150, 344, 196, hexc('2a2026'))
    for x in range(300, 344, 6):
        p.line(x, 152, x, 196, hexc('6a6a74'), 2)
    p.rect(270, 130, 370, 150, hexc('2e4a9c')); p.line(270, 130, 370, 130, GOLD)
    for x in (110, 520):
        p.rect(x, 250, x + 4, 300, WOOD_D); p.ell(x - 10, 236, x + 14, 256, hexc('c8a070'))  # mannequins d'entraînement
    return finish(img, {'centre': (320, 290)}, vignette=0.25)


def quartier_tanneurs():
    img, p = canvas()
    sky(p, 120, [hexc('8a9ab0'), hexc('b8c0c8')])
    for i, x in enumerate(range(-20, 660, 110)):
        house_front(p, x, 230, 100, 110 + (i % 2) * 14, wall=hexc(['d8c8a8', 'c8b898', 'e0d0b0'][i % 3]), roof=hexc(['8a4a2a', '6a5a4a'][i % 2]), roof_h=30, seed=i)
    # peaux tendues sur des cordes
    for k in range(3):
        y = 120 + k * 4
        p.line(0, y, W, y + 10, hexc('3a2a1a'))
    for x in range(30, 620, 70):
        p.poly([(x, 124), (x + 30, 126), (x + 26, 160), (x + 4, 158)], hexc(['a8805a', '8a6040', 'c8a070'][x % 3]))
        p.line(x + 6, 130, x + 22, 152, hexc('6a4a2a'))
    cobbles(p, 230, H, hexc('9a9080'), seed=3)
    # cuves de tannage
    for x, c in [(120, hexc('7a5a2a')), (260, hexc('5a6a3a')), (430, hexc('6a3a2a'))]:
        p.ell(x - 40, 270, x + 40, 300, hexc('5a564e'))
        p.ell(x - 34, 272, x + 34, 292, c)
        p.ell(x - 20, 276, x + 10, 284, shade(c, 1.2))
    barrel(p, 560, 320, 13, 30); barrel(p, 590, 330, 13, 30); crate(p, 30, 340, 26)
    # volets cloués de la tannerie abandonnée
    p.rect(560, 150, 600, 190, hexc('4a3a2a')); p.line(560, 160, 600, 180, WOOD_L, 2); p.line(560, 180, 600, 160, WOOD_L, 2)
    return finish(img, {'trappe': (520, 330)}, vignette=0.3)


def crypte_entree():
    img, p = canvas()
    sky(p, 160, [hexc('3a3a5a'), hexc('6a6a8a'), hexc('a8a0b0')])
    hills(p, 140, 8, hexc('4a5a4a'), seed=5, to=200)
    ground_grass(p, 180, H, hexc('4a6a3a'), seed=9)
    # ruines
    wall_stone(p, 160, 90, 480, 250, hexc('8a8478'), seed=4, h=12, w=24)
    p.poly([(160, 90), (210, 70), (260, 90)], hexc('8a8478')); p.poly([(380, 90), (440, 60), (480, 90)], hexc('8a8478'))
    for x in (160, 450):
        p.rect(x, 40, x + 30, 250, hexc('9a9488')); p.rect(x, 40, x + 4, 250, hexc('6a665e'))
    p.rect(190, 30, 450, 46, hexc('9a9488'))
    p.poly([(440, 30), (470, 20), (450, 46)], (0, 0, 0, 0))
    # entrée et escalier descendant
    p.rect(256, 140, 384, 250, hexc('0e0c12'))
    p.ell(256, 100, 384, 180, hexc('0e0c12'))
    for i in range(8):
        y = 250 - i * 12
        p.rect(262 + i * 4, y - 6, 378 - i * 4, y, shade(hexc('6a665e'), 0.95 - i * 0.1))
    # lierre
    rnd = random.Random(1)
    for _ in range(220):
        x = rnd.choice([rnd.randint(160, 200), rnd.randint(430, 480), rnd.randint(200, 440)])
        y = rnd.randint(30, 120) if 200 < x < 440 else rnd.randint(30, 240)
        p.px(x, y, rnd.choice([hexc('3a6a3a'), hexc('4a8a3a'), hexc('2e5a2e')]))
    p.ell(300, 196, 340, 204, (176, 74, 255, 90)); p.px(320, 200, hexc('e0a8ff'))  # lueur violette
    for (x, y, s) in [(80, 300, 1.4), (560, 290, 1.6)]:
        rock(p, x, y, s, c=hexc('7a766e'))
    for x in (40, 600):
        pine(p, x, 260, 1.8, c=hexc('243a2a'))
    return finish(img, {'entree': (320, 220)}, vignette=0.45)


def egouts():
    img, p = canvas(hexc('1a1a20'))
    # voûte en briques
    wall_stone(p, 0, 0, W, 260, hexc('5a5a52'), seed=11, h=8, w=18)
    p.ell(60, -160, 580, 300, hexc('121216'))
    for k in range(80):
        a = math.pi + k / 79 * math.pi
        x, y = 320 + math.cos(a) * 262, 70 + math.sin(a) * 230 + 160
        p.rect(x - 3, y - 3, x + 3, y + 3, hexc('6a6a62'))
    # canal d'eau
    p.poly([(200, 200), (440, 200), (560, H), (80, H)], hexc('3a5a4a'))
    for k in range(60):
        y = 204 + k * 2.6
        p.line(320 - (y - 180) * 0.9 + (k * 13) % 40, y, 320 - (y - 180) * 0.9 + (k * 13) % 40 + 8, y, hexc('5a8a6a'))
    p.poly([(0, 220), (200, 200), (80, H), (0, H)], hexc('4a4a44'))
    p.poly([(640, 220), (440, 200), (560, H), (640, H)], hexc('4a4a44'))
    for x in (0, 640):
        pass
    # grille et lumière qui tombe
    p.rect(296, 0, 344, 12, hexc('3a3a40'))
    for x in range(298, 344, 6):
        p.line(x, 0, x, 12, hexc('8a8a90'))
    for y in range(12, 200):
        w = 20 + y * 0.12
        for x in range(int(320 - w), int(320 + w)):
            if (x + y) % 4 == 0:
                p.px(x, y, (200, 210, 190, 40))
    torch_wall(p, 120, 150); torch_wall(p, 520, 150)
    for (x, y) in [(60, 300), (580, 310)]:
        p.ell(x - 3, y - 2, x + 3, y + 2, hexc('6a6a6a')); p.line(x + 3, y, x + 8, y - 1, hexc('d8a0a0'))  # rats
    return finish(img, {'grille': (320, 20)}, vignette=0.5)


def route_du_nord():
    img, p = canvas()
    sky(p, 160, [hexc('5a7ab0'), hexc('8aa8d0'), hexc('c8d8e8')])
    cloud(p, 100, 40, 1.2); cloud(p, 470, 30)
    hills(p, 140, 6, hexc('8a9aa8'), seed=7, to=170)
    # Mur d'Aube à l'horizon
    p.rect(0, 140, W, 152, hexc('9a948a'))
    for x in range(0, W, 8):
        p.rect(x, 136, x + 4, 140, hexc('9a948a'))
    for x in (90, 320, 550):
        p.rect(x - 8, 118, x + 8, 152, hexc('aaa498')); p.poly([(x - 10, 118), (x + 10, 118), (x, 106)], hexc('3a64b8'))
    p.rect(0, 120, W, 136, (40, 30, 40, 50))
    ground_grass(p, 152, H, hexc('7aa04a'), seed=10)
    # route pavée en perspective + fossés
    p.poly([(300, 152), (340, 152), (500, H), (140, H)], hexc('9a9080'))
    for i in range(16):
        y = 152 + (i / 15) ** 1.5 * (H - 152)
        w = 20 + (y - 152) * 0.85
        p.line(320 - w, y, 320 + w, y, hexc('8a8070'))
    for k in range(-6, 7):
        p.line(320 + k * 3, 152, 320 + k * 30, H, hexc('8a8070'))
    p.poly([(290, 152), (298, 152), (130, H), (100, H)], hexc('4a6a3a')); p.poly([(342, 152), (350, 152), (540, H), (510, H)], hexc('4a6a3a'))
    for x in (70, 590):
        oak(p, x, 300, 1.5, seed=x)
    p.rect(400, 250, 404, 290, WOOD_D); p.poly([(380, 250), (430, 254), (430, 264), (380, 260)], WOOD_L)  # panneau
    return finish(img, {}, vignette=0.25)


def gue_de_valmont():
    img, p = canvas()
    sky(p, 150)
    cloud(p, 300, 36, 1.3)
    hills(p, 130, 8, hexc('8ab8a0'), seed=11, to=170)
    ground_grass(p, 160, H, GRASS, seed=11)
    top = [(0, 200), (320, 190), (640, 204)]
    bot = [(0, 320), (320, 300), (640, 330)]
    water(p, top, bot, hexc('5a9ad0'), seed=11)
    # gué : bande de cailloux et ornières de chariot
    p.poly([(270, 190), (370, 190), (420, 330), (220, 330)], hexc('a89c80'))
    for i in range(40):
        x = 240 + (i * 37) % 160; y = 196 + (i * 53) % 128
        p.ell(x - 3, y - 2, x + 3, y + 2, hexc('8a8270'))
    for dx in (-16, 16):
        p.line(320 + dx, 190, 320 + dx * 3, 330, hexc('6a5a40'), 2)
    for x in range(0, 640, 6):
        if not 220 < x < 420:
            p.line(x, 198 + (x % 5), x + 1, 186 + (x % 7), hexc('6a9a3a'), 1)  # roseaux
            p.rect(x, 184 + (x % 7), x + 1, 186 + (x % 7), hexc('7a5a3a'))
    # chariot sur l'autre rive
    p.rect(420, 160, 480, 176, WOOD); p.ell(426, 170, 440, 184, WOOD_D); p.ell(462, 170, 476, 184, WOOD_D)
    p.poly([(420, 160), (450, 140), (480, 160)], hexc('e8dcc0'))
    for x in (60, 580):
        willow(p, x, 210, 1.3, seed=x)
    return finish(img, {}, vignette=0.2)


def champs_du_nord():
    img, p = canvas()
    sky(p, 130, [hexc('5a8ad0'), hexc('9ac0e8'), hexc('f0e0b8')])
    cloud(p, 60, 30); cloud(p, 380, 44, 1.3)
    hills(p, 120, 6, hexc('a8b880'), seed=12, to=150)
    dither_v(p, 0, 140, W, H, [hexc('e8c860'), hexc('d8b040'), hexc('c89a30')])
    rnd = random.Random(12)
    for y in range(142, H, 3):
        for x in range(0, W, 4 + (H - y) // 40):
            if rnd.random() < 0.7:
                p.line(x, y, x + rnd.choice([-1, 0, 1]), y - 2 - (y - 140) // 40, rnd.choice([hexc('f0d878'), hexc('c89a30'), hexc('e0b850')]))
    # sillons arrachés comme par une charrue folle
    for (x0, y0, x1, y1) in [(100, 200, 320, 340), (340, 180, 420, 330), (420, 210, 600, 300)]:
        for k in range(-3, 4):
            p.line(x0 + k * 4, y0, x1 + k * 7, y1, hexc('6a4a2a') if k % 2 else hexc('8a6a3a'), 2)
    # moulin au loin
    p.rect(520, 96, 540, 140, hexc('e8dcc0')); p.poly([(516, 96), (544, 96), (530, 82)], hexc('8a4a2a'))
    for a in (0.3, 1.87, 3.44, 5.01):
        p.line(530, 92, 530 + math.cos(a) * 26, 92 + math.sin(a) * 26, WOOD, 2)
    p.rect(60, 180, 64, 214, WOOD_D); p.line(48, 190, 76, 190, WOOD_D, 2); p.ell(55, 172, 69, 184, hexc('c8a070'))  # épouvantail
    return finish(img, {'sillons': (320, 300)}, vignette=0.2)


def grotte_des_mineurs():
    img, p = canvas()
    sky(p, 120, [hexc('6a7a9a'), hexc('a0a8b8')])
    # flanc de montagne
    p.poly([(0, 120), (120, 30), (260, 70), (380, 10), (520, 60), (640, 30), (640, H), (0, H)], hexc('7a7268'))
    for k in range(40):
        x = (k * 97) % 640; y = 60 + (k * 53) % 200
        p.line(x, y, x + 20, y + 6, hexc('5e584e'))
    p.poly([(0, 260), (640, 240), (640, H), (0, H)], hexc('6a6458'))
    # entrée étayée
    p.ell(240, 120, 400, 300, hexc('0e0c0e'))
    p.rect(240, 210, 400, 300, hexc('0e0c0e'))
    p.rect(240, 140, 254, 300, WOOD); p.rect(386, 140, 400, 300, WOOD); p.rect(232, 130, 408, 146, WOOD_L)
    p.line(254, 146, 386, 146, WOOD_D, 2)
    # rails et wagonnet
    for k in (-14, 14):
        p.line(320 + k, 240, 320 + k * 6, H, hexc('8a8a94'), 2)
    for i in range(10):
        y = 250 + i * 12
        w = 18 + (y - 240) * 0.7
        p.rect(320 - w, y, 320 + w, y + 2, WOOD_D)
    p.rect(420, 280, 480, 310, hexc('5a5a64')); p.rect(416, 276, 484, 282, hexc('7a7a84'))
    p.ell(424, 304, 438, 318, hexc('2a2a2a')); p.ell(462, 304, 476, 318, hexc('2a2a2a'))
    for k in range(6):
        p.ell(424 + k * 9, 268, 434 + k * 9, 280, hexc('5a5450'))
    lantern(p, 270, 150); lantern(p, 370, 150)
    for y in range(160, 300, 3):
        p.px(320 + (y * 7) % 30 - 15, y, (180, 200, 255, 60))  # air froid
    return finish(img, {'entree': (320, 230)}, vignette=0.4)


def collines_lune_sauge():
    img, p = canvas()
    sky(p, 200, [hexc('2a2a5a'), hexc('6a4a7a'), hexc('d87a6a'), hexc('f0b070')])
    p.ell(480, 40, 520, 80, hexc('f4f0d8')); p.ell(486, 42, 516, 72, hexc('fffbe8'))
    hills(p, 150, 18, hexc('5a5a6a'), seed=13, to=230)
    hills(p, 190, 22, hexc('6a6a5a'), seed=14, to=280)
    hills(p, 250, 16, hexc('7a7460'), seed=15)
    rnd = random.Random(15)
    for _ in range(500):
        x, y = rnd.randint(0, W - 1), rnd.randint(200, H - 1)
        p.line(x, y, x, y - 3, rnd.choice([hexc('c8d8e8'), hexc('e8f0f8'), hexc('a8b8c8')]))  # herbe argentée
    for _ in range(40):
        x, y = rnd.randint(0, W - 1), rnd.randint(210, H - 1)
        p.px(x, y - 4, (230, 240, 255, 230))
    for _ in range(30):
        p.px(rnd.randint(0, W - 1), rnd.randint(0, 120), WHITE)
    rock(p, 120, 300, 1.6, c=hexc('6a6458')); rock(p, 520, 320, 1.3, c=hexc('6a6458'))
    return finish(img, {}, vignette=0.35)


def lysmont_nuit():
    img, p = canvas()
    sky(p, 200, [hexc('0e1430'), hexc('1a2450'), hexc('2a3a6a')])
    rnd = random.Random(16)
    for _ in range(90):
        p.px(rnd.randint(0, W - 1), rnd.randint(0, 150), rnd.choice([WHITE, hexc('c8d8ff')]))
    p.ell(70, 30, 98, 58, hexc('f4f0d8'))
    # château en silhouette
    for (x, w, h) in [(250, 16, 120), (320, 24, 150), (390, 16, 120)]:
        p.rect(x - w, 200 - h, x + w, 200, hexc('2a2a40'))
        p.poly([(x - w - 4, 200 - h), (x + w + 4, 200 - h), (x, 200 - h - 30)], hexc('1a2a5a'))
        for yy in range(200 - h + 12, 196, 16):
            p.rect(x - 2, yy, x + 1, yy + 5, hexc('ffd890'))
    for i, x in enumerate(range(-20, 660, 96)):
        house_front(p, x, 250, 86, 70 + (i % 2) * 10, wall=hexc('3a3a50'), beam=hexc('1a1a28'), roof=hexc('2a2a48'), roof_h=24, seed=i, night=True)
    cobbles(p, 250, H, hexc('4a4a5a'), seed=16)
    # guirlandes de lanternes
    for k in range(2):
        y0 = 210 + k * 22
        for x in range(0, W, 4):
            y = y0 + 14 * math.sin(math.pi * (x % 160) / 160)
            p.px(x, y, hexc('3a2a2a'))
            if x % 32 == 16:
                c = [hexc('ffb040'), hexc('ff6a4a'), hexc('ffe070'), hexc('8ad0ff')][(x // 32 + k) % 4]
                p.ell(x - 3, y + 1, x + 3, y + 9, c)
                glow_light(p, x, y + 5, 18, c=c[:3], a=50, steps=2)
    for x, c in [(150, hexc('6a3a8a')), (300, hexc('2e5a3a')), (480, hexc('8a3a2a'))]:
        person(p, x, 330, 44, robe=c, hair=hexc('3a2a1a'))
    return finish(img, {}, vignette=0.4)


SCENES = {
    'combe-aux-saules': combe_aux_saules, 'combe-lisiere': combe_lisiere, 'combe-ruisseau': combe_ruisseau,
    'combe-taniere': combe_taniere, 'arene': arene, 'quartier-tanneurs': quartier_tanneurs, 'crypte-entree': crypte_entree,
    'egouts': egouts, 'route-du-nord': route_du_nord, 'gue-de-valmont': gue_de_valmont, 'champs-du-nord': champs_du_nord,
    'grotte-des-mineurs': grotte_des_mineurs, 'collines-lune-sauge': collines_lune_sauge, 'lysmont-lanternes-nuit': lysmont_nuit,
}
