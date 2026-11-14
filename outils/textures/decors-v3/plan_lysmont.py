"""Plan de la ville de Lysmont, vu du dessus (640×360 ×2), sans texte.
Les lieux sont placés aux positions `position_plan` du contenu (coordonnées 1280×720)."""
import json, os
from decor2 import *

LIEUX = {  # coordonnées 1280×720 (identiques à position_plan dans content/monde/aubeclaire.yaml)
    'lysmont-place': (640, 380), 'guilde': (900, 430), 'taverne': (380, 430), 'boutique': (560, 560),
    'chateau': (640, 150), 'quartier-tanneurs': (980, 610), 'arene': (1020, 230),
    'egouts': (740, 480), 'marche': (500, 330), 'tannerie-abandonnee': (1090, 540),
}
ROOFS = [hexc('b8503a'), hexc('a8442e'), hexc('3a64b8'), hexc('8a5a3a'), hexc('c8603a')]


def roof_block(p, x, y, w, h, c, seed=0):
    """Maison vue de dessus : toit à deux pans + ombre portée."""
    x, y, w, h = int(x), int(y), int(w), int(h)
    p.rect(x + 2, y + 2, x + w + 2, y + h + 2, (0, 0, 0, 70))
    p.rect(x, y, x + w, y + h, c)
    if w >= h:
        p.rect(x, y, x + w, y + h // 2, shade(c, 1.18))
        p.line(x, y + h // 2, x + w, y + h // 2, shade(c, 0.7))
        for xx in range(x + 3, x + w, 4):
            p.line(xx, y + 1, xx, y + h - 1, shade(c, 0.88))
    else:
        p.rect(x, y, x + w // 2, y + h, shade(c, 1.18))
        p.line(x + w // 2, y, x + w // 2, y + h, shade(c, 0.7))
        for yy in range(y + 3, y + h, 4):
            p.line(x + 1, yy, x + w - 1, yy, shade(c, 0.88))


def build():
    img, p = canvas(hexc('6aa04a'))
    rnd = random.Random(21)
    # campagne autour
    for _ in range(3000):
        p.px(rnd.randrange(W), rnd.randrange(H), rnd.choice([hexc('5a9040'), hexc('7ab05a'), hexc('6a9a48')]))
    for _ in range(60):
        x, y = rnd.randrange(W), rnd.randrange(H)
        if (x - 320) ** 2 / 290 ** 2 + (y - 190) ** 2 / 175 ** 2 > 1:
            p.ell(x - 5, y - 5, x + 5, y + 5, hexc('3f7a3a')); p.ell(x - 3, y - 4, x + 1, y, hexc('5a9a4a'))
    # rivière à l'ouest et au sud
    pts = [(0, 300), (60, 290), (110, 330), (160, 360)]
    for i in range(len(pts) - 1):
        p.line(*pts[i], *pts[i + 1], hexc('4a8ac8'), 10)
    # remparts (ovale) avec tours et portes
    cx, cy, rx, ry = 320, 190, 290, 168
    p.ell(cx - rx - 6, cy - ry - 6, cx + rx + 6, cy + ry + 6, hexc('8a8478'))
    p.ell(cx - rx, cy - ry, cx + rx, cy + ry, hexc('b8b0a0'))
    for k in range(28):
        a = k / 28 * 2 * math.pi
        x, y = cx + math.cos(a) * (rx + 3), cy + math.sin(a) * (ry + 3)
        p.ell(x - 6, y - 6, x + 6, y + 6, hexc('aaa498')); p.ell(x - 3, y - 3, x + 3, y + 3, hexc('3a64b8'))
    for a in (math.pi / 2, math.pi, 0):
        x, y = cx + math.cos(a) * (rx + 3), cy + math.sin(a) * (ry + 3)
        p.rect(x - 12, y - 12, x + 12, y + 12, hexc('9a948a')); p.rect(x - 5, y - 5, x + 5, y + 5, hexc('6a4426'))
    # rues pavées : grandes avenues depuis la place
    sx, sy = LIEUX['lysmont-place'][0] / 2, LIEUX['lysmont-place'][1] / 2
    street = hexc('d8ccb4')
    for (tx, ty) in [(cx, cy + ry), (cx - rx, cy), (cx + rx, cy), (320, 75), (510, 115), (490, 305), (280, 280), (190, 215)]:
        p.line(sx, sy, tx, ty, street, 9)
    for (a, b) in [((190, 215), (280, 280)), ((250, 165), (450, 215)), ((450, 215), (490, 305)), ((280, 280), (370, 240))]:
        p.line(*a, *b, street, 6)
    # pâtés de maisons (évitent les lieux importants)
    keep = [(x / 2, y / 2) for x, y in LIEUX.values()]
    for _ in range(420):
        x, y = rnd.randint(40, 600), rnd.randint(30, 350)
        if (x - cx) ** 2 / (rx - 16) ** 2 + (y - cy) ** 2 / (ry - 16) ** 2 > 1:
            continue
        if any((x - kx) ** 2 + (y - ky) ** 2 < 34 ** 2 for kx, ky in keep):
            continue
        if img.getpixel((x, y))[:3] == street[:3]:
            continue
        w, h = rnd.choice([(14, 10), (10, 14), (18, 10), (12, 12)])
        roof_block(p, x, y, w, h, rnd.choice(ROOFS))
    # rues secondaires par-dessus (assure la lisibilité)
    for (tx, ty) in [(cx, cy + ry), (cx - rx, cy), (cx + rx, cy), (320, 75), (510, 115), (490, 305), (280, 280), (190, 215)]:
        p.line(sx, sy, tx, ty, street, 7)
        p.line(sx, sy, tx, ty, shade(street, 1.06), 3)

    # ---- lieux ----
    def L(k):
        return LIEUX[k][0] / 2, LIEUX[k][1] / 2

    # place centrale + fontaine
    x, y = L('lysmont-place')
    p.ell(x - 34, y - 24, x + 34, y + 24, hexc('e0d4bc')); p.ell(x - 30, y - 21, x + 30, y + 21, hexc('d0c4a8'))
    for k in range(16):
        a = k / 16 * 2 * math.pi
        p.line(x, y, x + math.cos(a) * 30, y + math.sin(a) * 21, hexc('c8bca0'))
    p.ell(x - 10, y - 8, x + 10, y + 8, hexc('a8a4a0')); p.ell(x - 8, y - 6, x + 8, y + 6, hexc('5a9ad0')); p.ell(x - 2, y - 2, x + 2, y + 2, GOLD)
    # château sur sa butte
    x, y = L('chateau')
    p.ell(x - 60, y - 30, x + 60, y + 34, hexc('7aa858'))
    p.rect(x - 40, y - 22, x + 40, y + 22, hexc('e8e4dc')); p.rect(x - 32, y - 14, x + 32, y + 14, hexc('cfc8bc'))
    for (dx, dy) in [(-40, -22), (40, -22), (-40, 22), (40, 22), (0, -4)]:
        r = 10 if (dx, dy) != (0, -4) else 14
        p.ell(x + dx - r, y + dy - r, x + dx + r, y + dy + r, WHITE); p.ell(x + dx - r + 3, y + dy - r + 3, x + dx + r - 3, y + dy + r - 3, hexc('3a64b8'))
        p.px(x + dx, y + dy, GOLD)
    p.rect(x - 4, y + 22, x + 4, y + 40, street)
    # guilde (grand bâtiment + cour + bannière rose des vents)
    x, y = L('guilde')
    roof_block(p, x - 30, y - 18, 60, 30, hexc('6a4a2a'))
    p.rect(x - 22, y + 12, x + 22, y + 26, hexc('d8ccb4'))
    for k in range(8):
        a = k / 8 * 2 * math.pi - math.pi / 2
        rr = 9 if k % 2 == 0 else 4
        p.line(x, y - 3, x + math.cos(a) * rr, y - 3 + math.sin(a) * rr, WHITE if k % 2 == 0 else GOLD, 2)
    p.ell(x - 2, y - 5, x + 2, y - 1, GOLD)
    # taverne / auberge : cheminée qui fume, enseigne de chaudron
    x, y = L('taverne')
    roof_block(p, x - 24, y - 16, 48, 28, hexc('9a4a2a'))
    p.rect(x + 12, y - 22, x + 18, y - 14, hexc('6a6a6a'))
    for k in range(5):
        p.ell(x + 14 + k * 3, y - 28 - k * 4, x + 20 + k * 3, y - 24 - k * 4, (230, 230, 230, 170 - k * 25))
    p.ell(x - 8, y + 12, x + 4, y + 20, hexc('2a2a2a')); p.line(x - 6, y + 14, x + 2, y + 18, hexc('6a6a6a'))
    # boutique de Halvine : auvent rayé
    x, y = L('boutique')
    roof_block(p, x - 20, y - 16, 40, 24, hexc('3a64b8'))
    for k in range(6):
        p.rect(x - 20 + k * 7, y + 8, x - 14 + k * 7, y + 14, [hexc('d83a3a'), WHITE][k % 2])
    p.ell(x - 4, y - 8, x + 4, y, GOLD); p.px(x, y - 4, hexc('8a6a20'))
    # marché : étals colorés
    x, y = L('marche')
    for k in range(6):
        ex, ey = x - 26 + (k % 3) * 20, y - 10 + (k // 3) * 18
        c = [hexc('d83a3a'), hexc('3a64b8'), hexc('e8c03a')][k % 3]
        p.rect(ex, ey, ex + 14, ey + 10, c); p.rect(ex, ey, ex + 14, ey + 3, shade(c, 1.3))
    # arène
    x, y = L('arene')
    p.ell(x - 42, y - 30, x + 42, y + 30, hexc('a89880')); p.ell(x - 36, y - 25, x + 36, y + 25, hexc('c8b8a0'))
    for k in range(40):
        a = k / 40 * 2 * math.pi
        p.px(x + math.cos(a) * 33, y + math.sin(a) * 22, rnd.choice([hexc('b8503a'), hexc('3a64b8'), hexc('e8c03a')]))
    p.ell(x - 26, y - 17, x + 26, y + 17, hexc('e0c890'))
    # quartier des tanneurs : cuves colorées et peaux
    x, y = L('quartier-tanneurs')
    for k in range(6):
        ex, ey = x - 24 + (k % 3) * 18, y - 10 + (k // 3) * 16
        p.ell(ex - 6, ey - 5, ex + 6, ey + 5, hexc('5a564e'))
        p.ell(ex - 4, ey - 3, ex + 4, ey + 3, [hexc('8a5a2a'), hexc('5a6a3a'), hexc('6a3a2a')][k % 3])
    for k in range(3):
        p.rect(x + 22, y - 14 + k * 9, x + 30, y - 8 + k * 9, hexc('c8a070'))
    # tannerie abandonnée : toit troué
    x, y = L('tannerie-abandonnee')
    roof_block(p, x - 16, y - 12, 32, 22, hexc('5a5048'))
    p.rect(x - 4, y - 6, x + 6, y + 2, hexc('1a1410')); p.line(x - 16, y - 12, x + 16, y + 10, hexc('3a3028'))
    # égouts : grille
    x, y = L('egouts')
    p.rect(x - 7, y - 7, x + 7, y + 7, hexc('3a3a40'))
    for k in range(-5, 6, 3):
        p.line(x + k, y - 6, x + k, y + 6, hexc('8a8a94'))
    # rose des vents en coin
    rx0, ry0 = 600, 330
    for k in range(8):
        a = k / 8 * 2 * math.pi - math.pi / 2
        rr = 18 if k % 2 == 0 else 9
        p.line(rx0, ry0, rx0 + math.cos(a) * rr, ry0 + math.sin(a) * rr, hexc('3a2a1a') if k % 2 == 0 else hexc('7a6a4a'), 2)
    p.px(rx0, ry0 - 21, hexc('c83a2a'))
    img_out, _ = finish(img, None, vignette=0.3)
    return img_out, {k: {'x': v[0], 'y': v[1]} for k, v in LIEUX.items()}


if __name__ == '__main__':
    OUT = '../../../assets/cartes'
    os.makedirs(OUT, exist_ok=True)
    im, pos = build()
    im.save(f'{OUT}/lysmont-plan.png', optimize=True)
    json.dump({'_info': "Centre de chaque lieu sur le plan, en pixels de l'image 1280×720 (identique à position_plan du contenu).", 'lieux': pos},
              open(f'{OUT}/lysmont-plan.json', 'w'), ensure_ascii=False, indent=1)
    print('ok')
