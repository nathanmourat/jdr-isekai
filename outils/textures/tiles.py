"""Tileset 32×32 de la Crypte de la Fontaine (8 tuiles par ligne)."""
import math, random
from px import *

T = 32
FLOOR = hexc('5b5867'); MORTAR = hexc('3c3946')
WALL = hexc('6f6a7a'); WALL_D = hexc('4a4655'); WALL_L = hexc('8d889a')
TOP = hexc('2b2833'); RIM = hexc('9a95a8')
MOSS = hexc('4f6a3c')
BRONZE = hexc('a8763a'); WOOD = hexc('6a4426'); WOOD_L = hexc('8a5a32')
GOLD = hexc('e8b83c'); BONE = hexc('e8e0c8')
RUNE = hexc('b04aff'); RUNE_L = hexc('e0a8ff')
TRANSP = (0, 0, 0, 0)


def floor(p, ox, oy, seed, cracked=False, moss=False):
    rnd = random.Random(seed)
    noise_fill(p, ox, oy, ox + T - 1, oy + T - 1, FLOOR, 0.07, seed, 0.3)
    # dalles 16×16 décalées
    for r in range(2):
        y = oy + r * 16
        p.line(ox, y, ox + T - 1, y, MORTAR)
        off = 0 if (r + seed) % 2 == 0 else 8
        for x in range(ox + off, ox + T, 16):
            p.line(x, y, x, y + 15, MORTAR)
        # reflet haut-gauche de chaque dalle
        for x in range(ox + off - 16, ox + T, 16):
            if x + 14 < ox:
                continue
            p.line(max(ox, x + 1), y + 1, min(ox + T - 1, x + 14), y + 1, shade(FLOOR, 1.15))
    for _ in range(3):
        x, y = rnd.randint(ox + 2, ox + 29), rnd.randint(oy + 2, oy + 29)
        p.px(x, y, shade(FLOOR, 0.75))
    if cracked:
        x, y = ox + 6, oy + 4
        for _ in range(16):
            nx, ny = x + rnd.choice([0, 1, 1, 2]), y + rnd.choice([1, 1, 2])
            p.line(x, y, nx, ny, MORTAR)
            x, y = nx, ny
            if y > oy + 29:
                break
        p.line(ox + 14, oy + 14, ox + 24, oy + 18, MORTAR)
    if moss:
        for _ in range(30):
            x, y = rnd.randint(ox, ox + 12), rnd.randint(oy + 18, oy + 31)
            p.px(x, y, MOSS)


def wall_face(p, ox, oy, var=0):
    rnd = random.Random(10 + var)
    p.rect(ox, oy, ox + T - 1, oy + T - 1, WALL)
    for r in range(4):
        y = oy + r * 8
        p.line(ox, y, ox + T - 1, y, WALL_D)
        off = 0 if r % 2 == 0 else 6
        for x in range(ox + off, ox + T, 12):
            p.line(x, y, x, y + 7, WALL_D)
        p.line(ox, y + 1, ox + T - 1, y + 1, WALL_L)
    for _ in range(25):
        p.px(rnd.randint(ox, ox + 31), rnd.randint(oy, oy + 31), shade(WALL, 0.85))
    p.rect(ox, oy + 28, ox + T - 1, oy + T - 1, WALL_D)  # pied de mur
    if var == 1:
        for _ in range(18):
            p.px(rnd.randint(ox, ox + 10), rnd.randint(oy + 18, oy + 30), MOSS)
        p.line(ox + 20, oy + 3, ox + 24, oy + 13, WALL_D)
        p.line(ox + 24, oy + 13, ox + 22, oy + 20, WALL_D)


def wall_top(p, ox, oy, rims=(), corners=()):
    rnd = random.Random(ox * 7 + oy)
    p.rect(ox, oy, ox + T - 1, oy + T - 1, TOP)
    for _ in range(14):
        p.px(rnd.randint(ox, ox + 31), rnd.randint(oy, oy + 31), shade(TOP, 1.25))
    W = 3
    if 'N' in rims: p.rect(ox, oy, ox + T - 1, oy + W - 1, RIM)
    if 'S' in rims: p.rect(ox, oy + T - W, ox + T - 1, oy + T - 1, RIM)
    if 'W' in rims: p.rect(ox, oy, ox + W - 1, oy + T - 1, RIM)
    if 'E' in rims: p.rect(ox + T - W, oy, ox + T - 1, oy + T - 1, RIM)
    for c in corners:
        x = ox if 'W' in c else ox + T - W
        y = oy if 'N' in c else oy + T - W
        p.rect(x, y, x + W - 1, y + W - 1, RIM)


def door(p, ox, oy, open_=False):
    wall_face(p, ox, oy)
    p.rect(ox + 5, oy + 4, ox + 26, oy + 31, hexc('2a2630'))
    p.ell(ox + 5, oy + 1, ox + 26, oy + 12, hexc('2a2630'))
    if not open_:
        p.rect(ox + 7, oy + 6, ox + 24, oy + 31, WOOD)
        p.ell(ox + 7, oy + 3, ox + 24, oy + 12, WOOD)
        for x in (ox + 11, ox + 16, ox + 21):
            p.line(x, oy + 5, x, oy + 31, shade(WOOD, 0.7))
        p.line(ox + 7, oy + 12, ox + 24, oy + 12, hexc('4a4a52'), 2)
        p.line(ox + 7, oy + 24, ox + 24, oy + 24, hexc('4a4a52'), 2)
        p.rect(ox + 20, oy + 17, ox + 21, oy + 19, GOLD)
    else:
        p.rect(ox + 7, oy + 8, ox + 24, oy + 31, hexc('141218'))
        p.rect(ox + 7, oy + 6, ox + 9, oy + 31, WOOD_L)
        dither = [hexc('2a2630'), hexc('141218')]
        for y in range(oy + 26, oy + 32):
            for x in range(ox + 8, ox + 24):
                if (x + y) % 2 == 0:
                    p.px(x, y, FLOOR)


def stairs(p, ox, oy, down=True):
    p.rect(ox, oy, ox + T - 1, oy + T - 1, TOP)
    for i in range(6):
        y = oy + 3 + i * 5
        c = shade(FLOOR, 1.1 - i * 0.14) if down else shade(FLOOR, 0.45 + i * 0.13)
        inset = i if down else 5 - i
        p.rect(ox + 3 + inset, y, ox + 28 - inset, y + 4, c)
        p.line(ox + 3 + inset, y, ox + 28 - inset, y, shade(c, 1.25))
    p.rect(ox, oy, ox + 2, oy + T - 1, WALL_D); p.rect(ox + 29, oy, ox + 31, oy + T - 1, WALL_D)


def chest(p, ox, oy, open_=False):
    x0, y0 = ox + 6, oy + 12
    p.rect(x0, y0 + 6, x0 + 19, y0 + 16, WOOD)
    p.line(x0, y0 + 11, x0 + 19, y0 + 11, BRONZE)
    p.rect(x0 + 2, y0 + 6, x0 + 3, y0 + 16, BRONZE); p.rect(x0 + 16, y0 + 6, x0 + 17, y0 + 16, BRONZE)
    if not open_:
        p.rect(x0, y0, x0 + 19, y0 + 6, WOOD_L)
        p.line(x0, y0, x0 + 19, y0, shade(WOOD_L, 1.2))
        p.rect(x0 + 8, y0 + 4, x0 + 11, y0 + 8, GOLD)
        p.px(x0 + 9, y0 + 6, hexc('3a2a10'))
    else:
        p.rect(x0, y0 - 6, x0 + 19, y0 - 1, WOOD_L)
        p.rect(x0 + 1, y0 + 1, x0 + 18, y0 + 6, hexc('1e1418'))
        p.px(x0 + 6, y0 + 4, GOLD); p.px(x0 + 12, y0 + 3, GOLD); p.px(x0 + 9, y0 + 5, GOLD)
    out = P(p.img)  # contour fait plus tard sur toute la feuille d'objets


def torch(p, ox, oy, f):
    p.rect(ox + 14, oy + 16, ox + 17, oy + 24, WOOD)
    p.rect(ox + 12, oy + 14, ox + 19, oy + 16, hexc('4a4a52'))
    flick = [0, 1, 0, -1][f]
    h = [8, 10, 9, 11][f]
    p.poly([(ox + 12, oy + 14), (ox + 19, oy + 14), (ox + 16 + flick, oy + 14 - h)], hexc('ff7a1a'))
    p.poly([(ox + 14, oy + 14), (ox + 18, oy + 14), (ox + 16 + flick, oy + 16 - h)], hexc('ffd84a'))
    p.px(ox + 16, oy + 12, (255, 255, 230, 255))
    # halo
    for k in range(10):
        a = k / 10 * 2 * math.pi + f
        p.px(ox + 16 + math.cos(a) * (8 + f % 2), oy + 8 + math.sin(a) * 7, (255, 170, 60, 90))


def trap(p, ox, oy, active):
    floor(p, ox, oy, 7)
    p.rect(ox + 5, oy + 5, ox + 26, oy + 26, hexc('4a4652'))
    p.rect(ox + 6, oy + 6, ox + 25, oy + 25, hexc('6a6574'))
    for y in range(oy + 9, oy + 25, 5):
        for x in range(ox + 9, ox + 25, 5):
            if active:
                p.poly([(x - 2, y + 2), (x + 2, y + 2), (x, y - 5)], hexc('c8ccd6'))
                p.px(x, y - 4, (255, 255, 255, 255))
            else:
                p.rect(x - 1, y - 1, x, y, hexc('2a2630'))


def bones(p, ox, oy):
    p.ell(ox + 10, oy + 14, ox + 19, oy + 22, BONE)
    p.rect(ox + 12, oy + 17, ox + 13, oy + 18, hexc('2a2630')); p.rect(ox + 16, oy + 17, ox + 17, oy + 18, hexc('2a2630'))
    p.line(ox + 4, oy + 25, ox + 14, oy + 27, BONE, 2)
    p.line(ox + 18, oy + 24, ox + 27, oy + 21, BONE, 2)
    p.rect(ox + 3, oy + 24, ox + 4, oy + 26, BONE); p.rect(ox + 26, oy + 20, ox + 28, oy + 21, BONE)
    p.line(ox + 20, oy + 28, ox + 26, oy + 28, shade(BONE, 0.85), 2)


def rubble(p, ox, oy):
    rnd = random.Random(42)
    for (x, y, r) in [(9, 22, 5), (19, 24, 6), (14, 15, 4), (24, 17, 3), (6, 28, 2)]:
        p.ell(ox + x - r, oy + y - r + 2, ox + x + r, oy + y + r - 1, WALL)
        p.line(ox + x - r + 1, oy + y - r + 2, ox + x + 1, oy + y - r + 2, WALL_L)
    for _ in range(10):
        p.px(rnd.randint(ox + 3, ox + 28), rnd.randint(oy + 25, oy + 30), WALL_D)


def web(p, ox, oy):
    c = (230, 230, 240, 200)
    for k in range(5):
        a = math.radians(k * 22.5)
        p.line(ox, oy, ox + math.cos(a) * 30, oy + math.sin(a) * 30, c)
    for r in (8, 15, 22):
        pts = [(ox + math.cos(math.radians(k * 22.5)) * r, oy + math.sin(math.radians(k * 22.5)) * r) for k in range(5)]
        for i in range(4):
            p.line(*pts[i], *pts[i + 1], c)


def lever(p, ox, oy, up_):
    p.rect(ox + 11, oy + 16, ox + 20, oy + 25, hexc('4a4a52'))
    p.rect(ox + 12, oy + 17, ox + 19, oy + 24, hexc('6a6a74'))
    if up_:
        p.line(ox + 16, oy + 20, ox + 21, oy + 8, WOOD, 2); p.ell(ox + 19, oy + 5, ox + 23, oy + 9, hexc('c03a2a'))
    else:
        p.line(ox + 16, oy + 20, ox + 21, oy + 30, WOOD, 2); p.ell(ox + 19, oy + 28, ox + 23, oy + 31, hexc('c03a2a'))


def portcullis(p, ox, oy, open_):
    wall_face(p, ox, oy)
    p.rect(ox + 4, oy + 4, ox + 27, oy + 31, hexc('141218'))
    p.rect(ox + 3, oy + 2, ox + 28, oy + 4, WALL_L)
    bars = hexc('5a5a64')
    if not open_:
        for x in range(ox + 6, ox + 27, 5):
            p.line(x, oy + 5, x, oy + 31, bars, 2)
            p.px(x, oy + 31, hexc('8a8a94'))
        for y in (oy + 12, oy + 22):
            p.line(ox + 5, y, ox + 26, y, bars)
    else:
        for x in range(ox + 6, ox + 27, 5):
            p.line(x, oy + 5, x, oy + 8, bars, 2)
        p.line(ox + 5, oy + 7, ox + 26, oy + 7, bars)
        for y in range(oy + 26, oy + 32):
            for x in range(ox + 5, ox + 27):
                if (x + y) % 2 == 0:
                    p.px(x, y, FLOOR)


def fountain(p, ox, oy):
    """bloc 2×2 tuiles (64×64), asséchée."""
    cx, cy = ox + 32, oy + 36
    p.ell(cx - 28, cy - 16, cx + 28, cy + 24, hexc('7a7686'))
    p.ell(cx - 24, cy - 12, cx + 24, cy + 18, hexc('3a3640'))
    p.ell(cx - 22, cy - 8, cx + 22, cy + 18, hexc('4a4450'))
    p.line(cx - 26, cy - 10, cx - 4, cy - 15, WALL_L)
    # dépôt sec + fissures
    for k in range(12):
        p.px(cx - 15 + k * 3, cy + 8 + (k % 3), hexc('6a6050'))
    p.line(cx + 6, cy + 2, cx + 14, cy + 12, hexc('2a2630'))
    # pilier central + vasque
    p.rect(cx - 4, cy - 22, cx + 4, cy + 4, hexc('8a8696'))
    p.line(cx - 4, cy - 22, cx - 4, cy + 4, WALL_L)
    p.ell(cx - 12, cy - 30, cx + 12, cy - 20, hexc('8a8696'))
    p.ell(cx - 10, cy - 29, cx + 10, cy - 23, hexc('3a3640'))
    p.ell(cx - 3, cy - 36, cx + 3, cy - 28, hexc('9a96a6'))
    # rune ternie
    p.px(cx, cy - 10, RUNE); p.px(cx - 1, cy - 9, RUNE); p.px(cx + 1, cy - 9, RUNE)


def sarcophagus(p, ox, oy):
    """bloc 1×2 tuiles (32×64), vu de dessus."""
    p.rect(ox + 4, oy + 2, ox + 27, oy + 61, hexc('7a7686'))
    p.rect(ox + 6, oy + 4, ox + 25, oy + 59, hexc('8e8a9a'))
    p.line(ox + 6, oy + 4, ox + 25, oy + 4, WALL_L)
    # gisant
    p.ell(ox + 11, oy + 8, ox + 20, oy + 17, hexc('a8a4b4'))
    p.rect(ox + 10, oy + 18, ox + 21, oy + 48, hexc('a8a4b4'))
    p.line(ox + 15, oy + 22, ox + 15, oy + 42, GOLD)
    p.line(ox + 12, oy + 28, ox + 19, oy + 28, GOLD)
    p.rect(ox + 11, oy + 49, ox + 14, oy + 54, hexc('a8a4b4')); p.rect(ox + 17, oy + 49, ox + 20, oy + 54, hexc('a8a4b4'))
    p.rect(ox + 4, oy + 60, ox + 27, oy + 61, WALL_D)


def seal(p, ox, oy, f):
    c = RUNE if f == 0 else RUNE_L
    a = (c[0], c[1], c[2], 255)
    cx, cy = ox + 16, oy + 16
    for k in range(32):
        ang = k / 32 * 2 * math.pi
        p.px(cx + math.cos(ang) * 12, cy + math.sin(ang) * 12, a)
    for k in range(3):
        ang = k / 3 * 2 * math.pi - math.pi / 2 + (0.2 if f else 0)
        x1, y1 = cx + math.cos(ang) * 11, cy + math.sin(ang) * 11
        ang2 = (k + 1) / 3 * 2 * math.pi - math.pi / 2 + (0.2 if f else 0)
        p.line(x1, y1, cx + math.cos(ang2) * 11, cy + math.sin(ang2) * 11, a)
    p.ell(cx - 3, cy - 3, cx + 3, cy + 3, a)
    p.px(cx, cy, (255, 255, 255, 255))
    if f:
        for k in range(8):
            ang = k / 8 * 2 * math.pi
            p.px(cx + math.cos(ang) * 14, cy + math.sin(ang) * 14, (c[0], c[1], c[2], 140))


# (col, ligne) -> (nom, fonction, objet transparent ?)
LAYOUT = []


def build():
    img = new(256, 192)
    objs = new(256, 192)  # objets sur fond transparent, contourés à part
    p = P(img)
    q = P(objs)
    names = {}

    def at(c, r):
        return c * T, r * T

    def put(c, r, name, fn, obj=False, size=(1, 1)):
        ox, oy = at(c, r)
        fn(q if obj else p, ox, oy)
        names[(c, r)] = (name, 'objet (fond transparent)' if obj else 'tuile pleine', size)

    # ligne 0
    put(0, 0, 'Sol dallé 1', lambda p, x, y: floor(p, x, y, 1))
    put(1, 0, 'Sol dallé 2', lambda p, x, y: floor(p, x, y, 2))
    put(2, 0, 'Sol dallé 3 (mousse)', lambda p, x, y: floor(p, x, y, 3, moss=True))
    put(3, 0, 'Sol fissuré', lambda p, x, y: floor(p, x, y, 4, cracked=True))
    put(4, 0, 'Mur de face 1', lambda p, x, y: wall_face(p, x, y, 0))
    put(5, 0, 'Mur de face 2 (mousse, fissure)', lambda p, x, y: wall_face(p, x, y, 1))
    put(6, 0, 'Haut de mur (plein)', lambda p, x, y: wall_top(p, x, y))
    put(7, 0, 'Porte fermée', lambda p, x, y: door(p, x, y, False))
    # ligne 1 : angles
    put(0, 1, 'Angle extérieur haut-gauche (liseré haut + gauche)', lambda p, x, y: wall_top(p, x, y, rims='NW'))
    put(1, 1, 'Angle extérieur haut-droit (liseré haut + droite)', lambda p, x, y: wall_top(p, x, y, rims='NE'))
    put(2, 1, 'Angle extérieur bas-gauche (liseré bas + gauche)', lambda p, x, y: wall_top(p, x, y, rims='SW'))
    put(3, 1, 'Angle extérieur bas-droit (liseré bas + droite)', lambda p, x, y: wall_top(p, x, y, rims='SE'))
    put(4, 1, 'Angle intérieur haut-gauche (point de liseré en haut à gauche)', lambda p, x, y: wall_top(p, x, y, corners=['NW']))
    put(5, 1, 'Angle intérieur haut-droit (point de liseré en haut à droite)', lambda p, x, y: wall_top(p, x, y, corners=['NE']))
    put(6, 1, 'Angle intérieur bas-gauche (point de liseré en bas à gauche)', lambda p, x, y: wall_top(p, x, y, corners=['SW']))
    put(7, 1, 'Angle intérieur bas-droit (point de liseré en bas à droite)', lambda p, x, y: wall_top(p, x, y, corners=['SE']))
    # ligne 2
    put(0, 2, 'Bord de mur gauche (mur à gauche de la pièce, liseré à droite)', lambda p, x, y: wall_top(p, x, y, rims='E'))
    put(1, 2, 'Bord de mur droit (mur à droite de la pièce, liseré à gauche)', lambda p, x, y: wall_top(p, x, y, rims='W'))
    put(2, 2, 'Bord de mur bas (mur en bas de la pièce, liseré en haut)', lambda p, x, y: wall_top(p, x, y, rims='N'))
    put(3, 2, 'Porte ouverte', lambda p, x, y: door(p, x, y, True))
    put(4, 2, 'Escalier descendant', lambda p, x, y: stairs(p, x, y, True))
    put(5, 2, 'Escalier montant', lambda p, x, y: stairs(p, x, y, False))
    put(6, 2, 'Coffre fermé', lambda p, x, y: chest(p, x, y, False), obj=True)
    put(7, 2, 'Coffre ouvert', lambda p, x, y: chest(p, x, y, True), obj=True)
    # ligne 3
    for f in range(4):
        put(f, 3, f'Torche murale (image {f + 1}/4)', lambda p, x, y, f=f: torch(p, x, y, f), obj=True)
    put(4, 3, 'Plaque de piège inactive', lambda p, x, y: trap(p, x, y, False))
    put(5, 3, 'Plaque de piège activée (pics)', lambda p, x, y: trap(p, x, y, True))
    put(6, 3, "Tas d'os", bones, obj=True)
    put(7, 3, 'Gravats', rubble, obj=True)
    # lignes 4-5
    put(0, 4, 'Fontaine asséchée (bloc 2×2 : colonnes 0-1, lignes 4-5)', fountain, obj=True, size=(2, 2))
    put(2, 4, 'Sarcophage (bloc 1×2 : colonne 2, lignes 4-5)', sarcophagus, obj=True, size=(1, 2))
    put(3, 4, "Toile d'araignée (coin haut-gauche)", web, obj=True)
    put(4, 4, 'Levier (haut)', lambda p, x, y: lever(p, x, y, True), obj=True)
    put(5, 4, 'Levier (bas)', lambda p, x, y: lever(p, x, y, False), obj=True)
    put(6, 4, 'Herse fermée', lambda p, x, y: portcullis(p, x, y, False))
    put(7, 4, 'Herse ouverte', lambda p, x, y: portcullis(p, x, y, True))
    put(3, 5, 'Sceau cendré au sol (image 1/2)', lambda p, x, y: seal(p, x, y, 0), obj=True)
    put(4, 5, 'Sceau cendré au sol (image 2/2)', lambda p, x, y: seal(p, x, y, 1), obj=True)
    put(5, 5, 'Sol dallé 4 (variante sombre)', lambda p, x, y: floor(p, x, y, 5))

    # contour des objets (sauf toile et sceau, plus légers)
    a = np.array(objs)
    keep = a.copy()
    o = np.array(outline(objs, diag=False))
    for (c, r), (name, kind, size) in names.items():
        if kind.startswith('objet') and not any(w in name for w in ('Toile', 'Sceau', 'Torche')):
            x0, y0 = c * T, r * T
            keep[y0:y0 + size[1] * T, x0:x0 + size[0] * T] = o[y0:y0 + size[1] * T, x0:x0 + size[0] * T]
    objs = Image.fromarray(keep)
    img.alpha_composite(objs)
    return img, names
