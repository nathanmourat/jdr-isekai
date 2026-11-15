"""Test 4 : la tannerie abandonnée du quartier des Tanneurs (quête « Les disparus des Tanneurs »).
- tannerie-abandonnee : la tannerie vue de l'extérieur (volets cloués, cuves à sec, trappe de cave) ;
- tannerie-cave : la cave (cages, bougies violettes, symboles du culte, échelle).
python run_decors2.py tannerie-abandonnee tannerie-cave
"""
from decor2 import *

VIOLET = hexc('9a4ae0'); VIOLET_L = hexc('e0a8ff'); CIRE = hexc('7a3aa8')


def planches_clouees(p, x, y, w, h):
    """Fenêtre condamnée : planches en croix, clous."""
    p.rect(x, y, x + w, y + h, hexc('1e1814'))
    for (a, b, c, d) in ((x - 2, y + 3, x + w + 2, y + h - 3), (x - 2, y + h - 3, x + w + 2, y + 3)):
        p.line(a, b, c, d, WOOD_L, 3)
    p.rect(x - 3, y + h // 2 - 2, x + w + 3, y + h // 2 + 2, WOOD)
    for (cx, cy) in ((x, y + 3), (x + w, y + h - 3), (x + w, y + 3), (x, y + h - 3)):
        p.px(cx, cy, hexc('c8ccd4'))


def symbole_culte(p, x, y, r, c=VIOLET, w=2):
    """Cercle brisé entouré de flammes (le symbole des cultistes des Cendres)."""
    for k in range(36):
        if 4 <= k <= 7:   # la brisure
            continue
        a0 = k / 36 * 2 * math.pi; a1 = (k + 1) / 36 * 2 * math.pi
        p.line(x + math.cos(a0) * r, y + math.sin(a0) * r, x + math.cos(a1) * r, y + math.sin(a1) * r, c, w)
    for k in range(6):
        a = k / 6 * 2 * math.pi - math.pi / 2
        bx, by = x + math.cos(a) * (r + 3), y + math.sin(a) * (r + 3)
        tx, ty = x + math.cos(a) * (r + 11), y + math.sin(a) * (r + 11)
        nx, ny = -math.sin(a) * 3, math.cos(a) * 3
        p.poly([(bx + nx, by + ny), (bx - nx, by - ny), (tx, ty)], c)
    p.line(x - r * 0.4, y, x + r * 0.4, y, c, w)


def cuve_seche(p, x, y, rx, seed=0):
    """Cuve de tannage vide : fond craquelé, croûte de teinture, mousse noire."""
    rnd = random.Random(seed)
    p.ell(x - rx, y - rx // 3, x + rx, y + rx // 3, hexc('5a564e'))
    p.ell(x - rx + 5, y - rx // 3 + 3, x + rx - 5, y + rx // 3 - 2, hexc('3a2e24'))
    p.ell(x - rx + 8, y - rx // 3 + 5, x + rx - 14, y - rx // 3 + 9, hexc('6a4a2a'))   # croûte de teinture
    for _ in range(10):
        a = rnd.uniform(0, math.pi); rr = rnd.uniform(rx * 0.2, rx * 0.8)
        p.line(x, y, x + math.cos(a) * rr, y - math.sin(a) * rr * 0.25, hexc('241c16'))
    for _ in range(14):
        p.px(x + rnd.randint(-rx + 4, rx - 4), y + rnd.randint(-2, rx // 3 - 3), hexc('2a3a24'))


def tannerie_abandonnee():
    img, p = canvas()
    sky(p, 110, [hexc('7a8090'), hexc('a8a8a8'), hexc('c0b8a8')])
    # maisons du quartier au loin
    for i, x in enumerate(range(-30, 680, 95)):
        house_front(p, x, 250, 90, 150 + (i % 3) * 10, wall=hexc(['b8a888', 'a89878', 'c0b090'][i % 3]), roof=hexc(['6a3a2a', '5a4a3a'][i % 2]), roof_h=22, seed=i + 20, door_=False)
    # la tannerie : grande façade de bois sombre, toit affaissé
    tx0, tx1, ty0, ty1 = 150, 500, 70, 250
    wall_planks(p, tx0, ty0, tx1, ty1, base=hexc('5a4430'), seed=7)
    p.poly([(tx0 - 14, ty0), (tx1 + 14, ty0), (tx1 - 30, ty0 - 46), (tx0 + 60, ty0 - 40)], hexc('4a3a30'))
    for xx in range(tx0 + 50, tx1 - 20, 12):
        p.line(xx, ty0 - 2, xx + 10, ty0 - 40, shade(hexc('4a3a30'), 0.8))
    p.poly([(tx0 + 180, ty0 - 44), (tx0 + 230, ty0 - 43), (tx0 + 220, ty0 - 30)], hexc('1a1410'))     # trou dans le toit
    p.rect(tx0 - 4, ty0, tx0 + 4, ty1, hexc('3a2a1e')); p.rect(tx1 - 4, ty0, tx1 + 4, ty1, hexc('3a2a1e'))
    # enseigne effacée, de travers
    p.line(tx0 + 120, ty0 + 6, tx0 + 120, ty0 + 14, hexc('3a2a1e')); p.line(tx0 + 210, ty0 + 6, tx0 + 210, ty0 + 18, hexc('3a2a1e'))
    p.poly([(tx0 + 110, ty0 + 14), (tx0 + 220, ty0 + 18), (tx0 + 220, ty0 + 32), (tx0 + 110, ty0 + 28)], hexc('7a6a52'))
    for xx in range(tx0 + 120, tx0 + 210, 9):
        p.line(xx, ty0 + 21, xx + 5, ty0 + 22, hexc('5e5040'))
    # volets cloués
    for x in (tx0 + 25, tx0 + 95, tx1 - 135, tx1 - 65):
        planches_clouees(p, x, ty0 + 50, 40, 46)
    # grande porte barrée
    p.rect(tx0 + 145, ty0 + 90, tx0 + 205, ty1, hexc('3a2a1e'))
    p.rect(tx0 + 140, ty0 + 130, tx0 + 210, ty0 + 136, WOOD_L)
    p.px(tx0 + 175, ty0 + 133, hexc('c8ccd4'))
    # peaux oubliées, racornies, sur une corde
    p.line(tx1 + 10, 120, W, 132, hexc('2a1e16'))
    for x in (tx1 + 22, tx1 + 70, tx1 + 112):
        p.poly([(x, 123 + (x - tx1) // 10), (x + 26, 125 + (x - tx1) // 10), (x + 20, 152), (x + 6, 150)], hexc('6a5038'))
    # cour pavée, poussiéreuse
    cobbles(p, 250, H, hexc('8a8476'), seed=11)
    p.poly([(0, 250), (W, 250), (W, 262), (0, 258)], (90, 84, 72, 120))
    # cuves à sec
    cuve_seche(p, 90, 285, 42, seed=1); cuve_seche(p, 210, 300, 36, seed=2)
    barrel(p, 560, 290, 12, 26); crate(p, 590, 300, 24); crate(p, 30, 320, 22)
    # traces de pas dans la poussière, et deux sillons parallèles (on a traîné quelqu'un)
    for k in range(9):
        x, y = 300 + k * 15, 300 + (k % 2) * 6 + k * 2
        p.ell(x, y, x + 5, y + 3, (60, 52, 42, 160))
    p.line(320, 334, 440, 318, (60, 52, 42, 150), 2); p.line(324, 342, 444, 326, (60, 52, 42, 150), 2)
    # la trappe de la cave, gonds graissés (luisants), lueur violette entre les planches
    hx, hy = 470, 318
    p.poly([(hx - 34, hy - 10), (hx + 34, hy - 10), (hx + 42, hy + 16), (hx - 42, hy + 16)], hexc('4a3624'))
    for k in range(1, 5):
        xx = hx - 34 + k * 14
        p.line(xx, hy - 10, xx + 2 * k - 5, hy + 16, (176, 74, 255, 120))
    p.line(hx - 38, hy + 2, hx + 38, hy + 2, WOOD_D, 2)
    p.ell(hx + 14, hy, hx + 22, hy + 6, hexc('8a8e98')); p.ell(hx + 16, hy + 2, hx + 20, hy + 4, hexc('4a3624'))   # anneau
    for gx in (hx - 30, hx + 28):
        p.rect(gx - 3, hy - 12, gx + 3, hy - 8, hexc('2a2a2e')); p.px(gx - 1, hy - 11, hexc('e8eef8'))            # gonds qui brillent
    glow_light(p, hx, hy + 2, 40, c=(176, 74, 255), a=40, steps=3)
    # goutte de cire violette sur le seuil
    p.ell(hx - 52, hy + 8, hx - 44, hy + 12, CIRE); p.px(hx - 48, hy + 9, VIOLET_L)
    return finish(img, {'entree': (470, 318)}, vignette=0.35)


def cage(p, x, y, w, h, ouverte=False, prisonnier=None):
    p.rect(x, y + h - 4, x + w, y + h, hexc('3a3634'))
    p.rect(x, y, x + w, y + 3, hexc('4a4644'))
    if prisonnier:
        person(p, x + w // 2, y + h - 4, h - 12, robe=prisonnier, hair=hexc('3a2a1a'))
    for xx in range(x, x + w + 1, 6):
        if ouverte and x + w // 3 < xx < x + w:
            continue
        p.line(xx, y, xx, y + h - 2, hexc('6a6662'), 1)
    if ouverte:
        p.line(x + w, y + 2, x + w + w // 2, y + 10, hexc('6a6662'), 1)
        p.line(x + w + w // 2, y + 10, x + w + w // 2, y + h - 6, hexc('6a6662'), 1)


def bougie(p, x, y, h=10):
    p.rect(x - 2, y - h, x + 2, y, VIOLET)
    p.px(x - 1, y - h + 1, VIOLET_L)
    p.ell(x - 2, y - h - 6, x + 2, y - h, hexc('ffe9a0')); p.px(x, y - h - 3, WHITE)
    p.ell(x - 5, y - 1, x + 6, y + 2, CIRE)      # flaque de cire
    glow_light(p, x, y - h - 3, 26, c=(190, 110, 255), a=46, steps=3)


def tannerie_cave():
    img, p = canvas(hexc('0c0a10'))
    # voûte et murs de pierre humide
    wall_stone(p, 0, 0, W, 250, base=hexc('4a4450'), seed=3, h=12, w=26)
    # voûte : arcs de pierre plus sombres, piliers
    for k in range(5):
        x = 60 + k * 130
        for t in range(4):
            p.line(x - 70, 46 - t, x - 35, 14 - t, hexc('2a2630'), 2); p.line(x - 35, 14 - t, x + 35, 14 - t, hexc('2a2630'), 2); p.line(x + 35, 14 - t, x + 70, 46 - t, hexc('2a2630'), 2)
        p.line(x - 70, 46, x - 70, 250, hexc('2a2630'), 3)
    p.rect(0, 0, W, 12, (8, 6, 12, 200))
    p.rect(0, 0, W, 250, (10, 6, 20, 90))
    floor_stone(p, 250, H, base=hexc('3a3640'))
    # symboles du culte peints au mur
    symbole_culte(p, 320, 110, 34, w=3)
    symbole_culte(p, 110, 90, 16); symbole_culte(p, 540, 96, 16)
    glow_light(p, 320, 110, 70, c=(176, 74, 255), a=40, steps=3)
    # cages le long des murs (celle du fond ouverte)
    cage(p, 20, 160, 70, 92, prisonnier=hexc('8a6a4a'))
    cage(p, 100, 172, 60, 80)
    cage(p, 470, 166, 66, 86, prisonnier=hexc('5a6a8a'))
    cage(p, 548, 150, 76, 102, ouverte=True)
    # l'échelle qui descend de la trappe (lumière du jour en haut)
    p.poly([(214, 0), (270, 0), (262, 14), (222, 14)], hexc('c8c0a8'))
    glow_light(p, 242, 8, 40, c=(220, 210, 180), a=40, steps=2)
    for xx in (226, 256):
        p.line(xx, 0, xx - 6, 262, WOOD_L, 3)
    for y in range(14, 262, 18):
        p.line(226 - y * 6 / 262, y, 256 - y * 6 / 262, y, WOOD, 2)
    # cercle rituel au sol, bougies violettes
    p.ell(250, 270, 470, 330, hexc('2a2034'))
    for k in range(48):
        a0 = k / 48 * 2 * math.pi; a1 = (k + 1) / 48 * 2 * math.pi
        if k % 6 == 3:
            continue
        p.line(360 + math.cos(a0) * 104, 300 + math.sin(a0) * 28, 360 + math.cos(a1) * 104, 300 + math.sin(a1) * 28, VIOLET, 2)
    for k in range(8):
        a = k / 8 * 2 * math.pi
        bougie(p, 360 + math.cos(a) * 112, 304 + math.sin(a) * 32, 8 + (k % 3) * 3)
    for (x, y) in ((40, 270), (170, 262), (600, 268), (520, 300), (110, 320)):
        bougie(p, x, y, 12)
    # autel bas et livre ouvert
    p.rect(330, 278, 390, 296, hexc('2e2a34')); p.rect(330, 276, 390, 279, hexc('4a4450'))
    p.rect(346, 270, 374, 277, hexc('d8ccb0')); p.line(360, 270, 360, 277, hexc('8a7a60'))
    return finish(img, {}, vignette=0.5)


SCENES = {'tannerie-abandonnee': tannerie_abandonnee, 'tannerie-cave': tannerie_cave}
