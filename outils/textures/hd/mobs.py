"""Bestiaire : mobs à farmer, du plus faible au plus fort.
Chaque créature est dessinée tournée vers la DROITE puis retournée (les ennemis regardent à gauche).
Planche 512×256 : attente (4), attaque (6), touché (2), K.O. (3), cases de 64×64."""
import math, random
from PIL import Image
from px import *
from heroes import sheet, tint, lay, figure, combat_frames, hexc, LEATHER, STEEL, STEEL_D, GOLD, S as SC

WHITE = (255, 255, 255, 255)
DARK = (24, 20, 32, 255)

# --------------------------------------------------------------------------- poses communes
IDLE = [dict(bob=0, phase=0, flap=0), dict(bob=1, phase=1, flap=1), dict(bob=1, phase=2, flap=2), dict(bob=0, phase=3, flap=1)]
ATTACK = [dict(x=-2, crouch=2, flap=0), dict(x=-3, crouch=3, open=0.4, flap=2), dict(x=5, open=1, lift=3, flap=0),
          dict(x=9, open=1, fx=True, flap=1), dict(x=7, open=0.5, flap=2), dict(x=2, flap=1)]
HIT = [dict(x=-3, hurt=True), dict(x=-2, hurt=True, flap=1)]


def st(**kw):
    d = dict(x=0, bob=0, crouch=0, open=0, lift=0, phase=0, flap=0, fx=False, hurt=False, closed=False)
    d.update(kw)
    return d


def slash(img, x, y, c=(255, 255, 255, 210)):
    p = P(img, SC)
    for k in range(3):
        p.line(x - k * 3, y - 6 + k * 5, x + 5 - k * 3, y + k * 5, c)
    return img


def squash(img, k=0.5, ground=60):
    a = np.array(img)[:, :, 3]
    ys, xs = np.where(a > 0)
    box = (0, ys.min(), img.width, ys.max() + 1)
    part = img.crop(box)
    h = max(2, int(part.height * k))
    part = part.resize((part.width, h), Image.NEAREST)
    out = new(img.width, img.height)
    out.alpha_composite(part, (0, ground * SC - h))
    return out


def creature_sheet(draw, ko='tilt', fx_y=34):
    rows = []
    rows.append([draw(st(**s)) for s in IDLE])
    att = []
    for s in ATTACK:
        im = draw(st(**s))
        if s.get('fx'):
            slash(im, 56, fx_y)
        att.append(im)
    rows.append(att)
    h = [draw(st(**s)) for s in HIT]
    rows.append([tint(h[0], (255, 255, 255), 0.65), tint(h[1], (255, 60, 60), 0.15)])
    base = draw(st(closed=True))
    if ko == 'tilt':
        rows.append([draw(st(crouch=5, closed=True)), lay(base, 25), squash(lay(base, 25), 0.5)])
    elif ko == 'fall':  # créatures volantes : tombent et se retournent
        rows.append([draw(st(closed=True, lift=-8)), lay(base, 45), lay(base, 180)])
    elif ko == 'melt':  # gelées, esprits
        rows.append([squash(base, 0.75), squash(base, 0.45), squash(alpha_mul(base, 0.7), 0.2)])
    elif ko == 'crumble':  # golems
        rows.append([draw(st(crouch=6, closed=True)), squash(lay(base, 12), 0.7), squash(base, 0.3)])
    rows = [[f.transpose(Image.FLIP_LEFT_RIGHT) for f in r] for r in rows]
    return sheet(rows, 64)


def humanoid(spec):
    from heroes import combat_frames
    rows = combat_frames(spec)
    rows = [rows[0], rows[1], rows[3], rows[4]]
    rows = [[f.transpose(Image.FLIP_LEFT_RIGHT) for f in r] for r in rows]
    return sheet(rows, 64)


def aura(img, c, n=14, r=(18, 26), cy=40, seed=0):
    rnd = random.Random(seed)
    p = P(img, SC)
    for k in range(n):
        a = rnd.random() * 2 * math.pi
        d = rnd.uniform(*r)
        p.px(32 + math.cos(a) * d, cy + math.sin(a) * d * 0.7, (c[0], c[1], c[2], 170))
    return img


# --------------------------------------------------------------------------- quadrupède
def quadruped(P_):
    """P_ : dictionnaire de paramètres (couleurs, taille, tête, queue…)."""
    def draw(S):
        img = new(64 * SC, 64 * SC)
        p = P(img, SC)
        s = P_.get('s', 1.0)
        col, dk, lt = P_['col'], P_['dark'], P_['light']
        leg = 9 * s
        rx, ry = 13 * s, 6 * s
        bx = 28 + S['x'] * 0.7 + (4 if P_.get('tail') == 'lizard' else 0) + (3 if P_.get('tail') == 'fire' else 0)
        by = 59 - leg - ry * 0.4 + S['crouch'] - S['lift'] - (1 if S['bob'] else 0) * 0
        if P_.get('low'):
            by += 3
        ph = S['phase'] * math.pi / 2

        def legp(x, ph_, c):
            o = math.sin(ph_) * 2.5 * s
            fy = 59 - S['lift'] * 0.5
            p.line(x, by + ry * 0.5, x + o, fy - 1, c, max(2, int(3 * s)))
            p.rect(x + o - 1, fy - 1, x + o + 2 * s, fy, shade(c, 0.75))

        # ailes (derrière)
        if P_.get('wings'):
            wc = P_['wings']
            up = [-14, -8, -2][S['flap'] % 3] * s
            p.poly([(bx - 2, by - ry), (bx + 8 * s, by - ry), (bx - 6 * s, by - ry + up - 8 * s), (bx - 16 * s, by - ry + up * 0.6)], wc)
            p.line(bx + 8 * s, by - ry, bx - 6 * s, by - ry + up - 8 * s, shade(wc, 0.6))
        legp(bx - rx * 0.6, ph + math.pi, dk)
        legp(bx + rx * 0.6, ph, dk)
        # queue
        tx, ty = bx - rx, by - ry * 0.3
        t = P_.get('tail', 'bushy')
        sw = [0, 1, 0, -1][S['phase'] % 4]
        if t == 'bushy':
            p.poly([(tx + 2, ty - 2), (tx - 9 * s, ty - 5 * s + sw), (tx - 11 * s, ty - 2 * s + sw), (tx + 1, ty + 3)], col)
        elif t == 'thin':
            for k in range(14):
                p.px(tx - k * s, ty + 1 + math.sin(k / 3 + sw) * 2, P_.get('tail_c', hexc('d8a0a0')))
        elif t == 'stub':
            p.rect(tx - 2, ty - 2, tx, ty, dk)
        elif t == 'lizard':
            p.poly([(tx + 3, ty - 3), (tx + 3, ty + 4), (tx - 11 * s, ty + 6 * s + sw), (tx - 13 * s, ty + 5 * s + sw)], col)
            if P_.get('tail_fire'):
                p.ell(tx - 16 * s, ty + 1 * s + sw, tx - 10 * s, ty + 7 * s + sw, hexc('ff7a1a'))
                p.ell(tx - 15 * s, ty + 3 * s + sw, tx - 12 * s, ty + 6 * s + sw, hexc('ffd84a'))
        elif t == 'fire':
            p.poly([(tx + 2, ty - 1), (tx - 8 * s, ty - 7 * s + sw), (tx - 12 * s, ty - 9 * s + sw), (tx - 6 * s, ty - 2 * s), (tx + 1, ty + 3)], hexc('ff5a1a'))
            p.poly([(tx, ty), (tx - 7 * s, ty - 5 * s + sw), (tx - 3 * s, ty)], hexc('ffd84a'))
        # corps
        p.ell(bx - rx, by - ry, bx + rx, by + ry, col)
        p.ell(bx - rx + 3, by, bx + rx - 3, by + ry, lt)
        p.line(bx - rx + 3, by - ry + 1, bx + rx - 4, by - ry + 1, shade(col, 1.2))
        if P_.get('spikes'):
            for k in range(int(-rx) + 2, int(rx) - 3, 3):
                p.poly([(bx + k, by - ry + 1), (bx + k + 2, by - ry + 1), (bx + k, by - ry - 3 - (k % 2))], P_.get('spike_c', dk))
        if P_.get('stripes'):
            for k in range(int(-rx) + 4, int(rx) - 2, 4):
                p.line(bx + k, by - ry + 1, bx + k - 1, by, P_['stripes'])
        if P_.get('scales'):
            for k in range(int(-rx) + 3, int(rx) - 2, 3):
                p.px(bx + k, by - 2 + (k % 2), shade(col, 1.25))
        if P_.get('armor'):
            p.rect(bx - rx * 0.7, by - ry, bx + rx * 0.5, by - ry * 0.3, P_['armor'])
        legp(bx - rx * 0.35, ph, col)
        legp(bx + rx * 0.85, ph + math.pi, col)
        # tête
        hd = P_.get('head', 'wolf')
        hx = bx + rx + 1
        hy = by - ry * 0.8 + (2 if S['crouch'] > 2 else 0) - (1 if S['open'] > 0.8 else 0)
        if P_.get('mane'):
            p.ell(hx - 7 * s, hy - 6 * s, hx + 3 * s, hy + 6 * s, P_['mane'])
        hr = 5 * s
        if hd in ('wolf', 'jackal', 'hound'):
            p.poly([(bx + rx - 6, by - ry + 1), (bx + rx, by + ry * 0.4), (hx + 2, hy + hr), (hx - 3, hy - hr + 1)], col)
            p.ell(hx - hr, hy - hr, hx + hr, hy + hr, col)
            eh = 9 * s if hd == 'jackal' else 6 * s
            p.poly([(hx - 4 * s, hy - 3 * s), (hx - 2 * s, hy - 3 * s - eh), (hx + 1 * s, hy - 4 * s)], dk)
            p.poly([(hx - 1 * s, hy - 4 * s), (hx + 2 * s, hy - 3 * s - eh), (hx + 4 * s, hy - 3 * s)], col)
            sn = 9 * s
            p.poly([(hx + 2 * s, hy - 2 * s), (hx + sn + 3 * s, hy + 1 * s), (hx + sn + 3 * s, hy + 3 * s), (hx + 3 * s, hy + 3 * s)], col)
            p.px(hx + sn + 3 * s, hy + 1 * s, DARK)
            jaw = int(S['open'] * 4 * s)
            if jaw:
                p.poly([(hx + 3 * s, hy + 3 * s + 1), (hx + sn + 2 * s, hy + 3 * s + 1 + jaw), (hx + 3 * s, hy + 5 * s + jaw * 0.5)], dk)
                p.line(hx + 4 * s, hy + 3 * s + 1, hx + sn + 2 * s, hy + 3 * s + 1 + jaw, hexc('a02a2a'))
                p.px(hx + sn + 1 * s, hy + 3 * s + 1, WHITE); p.px(hx + 6 * s, hy + 3 * s + 1, WHITE)
        elif hd == 'boar':
            p.ell(hx - 6 * s, hy - 5 * s, hx + 6 * s, hy + 6 * s, col)
            p.poly([(hx - 3 * s, hy - 4 * s), (hx - 1 * s, hy - 9 * s), (hx + 1 * s, hy - 4 * s)], dk)
            p.rect(hx + 5 * s, hy - 1 * s, hx + 9 * s, hy + 4 * s, P_.get('snout', hexc('d89a8a')))
            p.px(hx + 8 * s, hy + 1 * s, DARK)
            tk = hexc('f4ecd8')
            p.line(hx + 5 * s, hy + 4 * s, hx + 9 * s, hy - 1 * s - S['open'] * 2, tk, 2)
            if P_.get('mane'):
                pass
        elif hd == 'rat':
            p.ell(hx - 4 * s, hy - 4 * s, hx + 4 * s, hy + 4 * s, col)
            p.poly([(hx + 2 * s, hy - 2 * s), (hx + 10 * s, hy + 2 * s), (hx + 2 * s, hy + 4 * s)], col)
            p.px(hx + 10 * s, hy + 2 * s, hexc('e88a9a'))
            p.ell(hx - 4 * s, hy - 9 * s, hx + 1 * s, hy - 3 * s, col)
            p.ell(hx - 3 * s, hy - 8 * s, hx, hy - 4 * s, hexc('e8a0a8'))
            for k in (-1, 1):
                p.line(hx + 7 * s, hy + 2 * s, hx + 12 * s, hy + 2 * s + k * 2, (230, 230, 230, 200))
            if S['open']:
                p.rect(hx + 5 * s, hy + 3 * s, hx + 6 * s, hy + 5 * s, WHITE)
        elif hd == 'lizard':
            p.poly([(bx + rx - 6, by - ry + 1), (bx + rx, by + ry * 0.4), (hx + 2, hy + 4 * s), (hx - 3, hy - 3 * s)], col)
            p.poly([(hx - 4 * s, hy - 4 * s), (hx + 5 * s, hy - 4 * s), (hx + 12 * s, hy), (hx + 12 * s, hy + 2 * s), (hx - 3 * s, hy + 3 * s)], col)
            jaw = S['open'] * 5 * s
            p.poly([(hx - 2 * s, hy + 2 * s), (hx + 11 * s, hy + 2 * s + jaw), (hx + 10 * s, hy + 4 * s + jaw), (hx - 2 * s, hy + 5 * s)], dk)
            if jaw:
                p.line(hx, hy + 3 * s, hx + 10 * s, hy + 3 * s + jaw * 0.6, hexc('ffd84a') if P_.get('breath') else hexc('a02a2a'))
                if P_.get('breath') and S['open'] >= 1:
                    for k in range(3):
                        p.ell(hx + 12 * s + k * 2, hy + jaw * 0.5 - k, hx + 16 * s + k * 3, hy + 4 * s + jaw * 0.5 + k, (255, 120 + k * 20, 30, 200))
            if P_.get('horns'):
                p.poly([(hx - 3 * s, hy - 3 * s), (hx - 8 * s, hy - 9 * s), (hx, hy - 4 * s)], P_['horns'])
                p.poly([(hx + 1 * s, hy - 4 * s), (hx - 2 * s, hy - 10 * s), (hx + 3 * s, hy - 4 * s)], shade(P_['horns'], 1.2))
        # œil
        ec = P_.get('eye', hexc('ffd030'))
        ex, ey = (hx + 1 * s, hy - 1 * s) if hd != 'lizard' else (hx + 3 * s, hy - 2 * s)
        if S['closed']:
            p.line(ex - 1, ey, ex + 1, ey, DARK)
        else:
            p.rect(ex, ey, ex + 1, ey + (1 if s >= 1 else 0), ec)
            p.px(ex + 1, ey, DARK if not P_.get('glow_eye') else WHITE)
        img = outline_sel(volume(grain(img)))
        if P_.get('aura'):
            aura(img, P_['aura'], n=16, cy=int(by), seed=S['phase'] + int(S['x']))
        if P_.get('alpha'):
            img = alpha_mul(img, P_['alpha'])
        return img
    return draw


# --------------------------------------------------------------------------- gelée
def blob(P_):
    def draw(S):
        img = new(64 * SC, 64 * SC)
        p = P(img, SC)
        s = P_.get('s', 1.0)
        col = P_['col']
        sq = [1.0, 0.92, 0.88, 0.95][S['phase'] % 4] if not S['open'] else (1.25 if S['lift'] else 0.85)
        w = 13 * s / sq ** 0.5
        h = 11 * s * sq
        if S['crouch']:
            h *= 0.8; w *= 1.1
        cx = 30 + S['x']
        base = 59 - S['lift'] * 3
        p.ell(cx - w, base - 2 * h, cx + w, base, col)
        p.rect(cx - w + 1, base - h * 0.5, cx + w - 1, base - 1, shade(col, 0.82))
        p.ell(cx - w + 1, base - h * 0.9, cx + w - 1, base - 1, shade(col, 0.82))
        p.ell(cx - w + 2, base - 2 * h + 2, cx + w - 4, base - h * 0.6, col)
        p.ell(cx - w * 0.6, base - 2 * h + 3, cx - w * 0.2, base - 2 * h + 6, shade(col, 1.5))
        for (bxo, byo, r) in P_.get('bubbles', [(-4, -6, 1.5), (5, -4, 1)]):
            p.ell(cx + bxo * s - r, base + byo * s - r, cx + bxo * s + r, base + byo * s + r, shade(col, 1.3))
        if P_.get('inner'):
            P_['inner'](p, cx, base - h, s)
        ey = base - h * 1.15
        if S['closed']:
            p.line(cx + 2, ey, cx + 4, ey, DARK); p.line(cx + 7, ey, cx + 9, ey, DARK)
        else:
            ec = P_.get('eye', DARK)
            p.rect(cx + 2, ey - 2, cx + 3, ey + 1, ec); p.rect(cx + 7, ey - 2, cx + 8, ey + 1, ec)
            p.px(cx + 2, ey - 2, WHITE); p.px(cx + 7, ey - 2, WHITE)
        if S['open']:
            p.ell(cx + 3, ey + 3, cx + 8, ey + 3 + S['open'] * 4, shade(col, 0.5))
        img = outline_sel(volume(grain(img)))
        if P_.get('aura'):
            aura(img, P_['aura'], n=10, cy=int(base - h), r=(12, 18), seed=S['phase'])
        if P_.get('alpha'):
            img = alpha_mul(img, P_['alpha'])
        return img
    return draw


# --------------------------------------------------------------------------- volant
def flyer(P_):
    def draw(S):
        img = new(64 * SC, 64 * SC)
        p = P(img, SC)
        kind = P_.get('kind', 'bat')
        col, dk = P_['col'], P_['dark']
        cx = 30 + S['x']
        cy = 28 + S['bob'] * 2 - S['lift'] * 2 + S['crouch']
        fl = S['flap'] % 3
        if kind == 'wisp':
            r = 7 + (S['phase'] % 2)
            for k in range(6):
                p.ell(cx - 10 - k * 3, cy - 2 + math.sin(k + S['phase']) * 2, cx - 6 - k * 3, cy + 2 + math.sin(k + S['phase']) * 2,
                      (col[0], col[1], col[2], 160 - k * 22))
            p.ell(cx - r - 3, cy - r - 3, cx + r + 3, cy + r + 3, (col[0], col[1], col[2], 90))
            p.ell(cx - r, cy - r, cx + r, cy + r, col)
            p.ell(cx - r + 3, cy - r + 3, cx + r - 3, cy + r - 3, shade(col, 1.5))
            if not S['closed']:
                p.rect(cx + 1, cy - 2, cx + 2, cy, dk); p.rect(cx + 5, cy - 2, cx + 6, cy, dk)
            if S['open']:
                p.ell(cx + 2, cy + 2, cx + 6, cy + 5, dk)
            return img  # esprit : pas de contour
        # ailes
        wy = [-12, -3, 6][fl]
        wing = P_.get('wing', dk)
        for side, sh in ((-1, 0.75), (1, 1.0)):
            ox = cx + side * 2
            pts = [(ox, cy - 2), (ox - 16 if side < 0 else ox + 4, cy + wy - 4), (ox - 20 if side < 0 else ox + 2, cy + wy + 2),
                   (ox - 12 if side < 0 else ox - 4, cy + 3), (ox - 6, cy + 4)]
            if side < 0:
                p.poly(pts, shade(wing, sh))
                for k in (1, 2):
                    p.line(ox, cy - 2, pts[k][0], pts[k][1], shade(wing, 0.6))
        if kind == 'bat':
            p.ell(cx - 6, cy - 5, cx + 6, cy + 7, col)
            p.ell(cx - 2, cy - 1, cx + 5, cy + 6, shade(col, 1.25))
            p.poly([(cx - 1, cy - 4), (cx + 1, cy - 11), (cx + 3, cy - 4)], col)
            p.poly([(cx + 2, cy - 4), (cx + 5, cy - 10), (cx + 6, cy - 3)], col)
            p.rect(cx - 2, cy + 7, cx - 1, cy + 9, dk); p.rect(cx + 2, cy + 7, cx + 3, cy + 9, dk)
            ex, ey = cx + 3, cy - 1
            if S['open']:
                p.rect(cx + 2, cy + 2, cx + 5, cy + 4, hexc('5a1a2a')); p.px(cx + 2, cy + 2, WHITE); p.px(cx + 5, cy + 2, WHITE)
        elif kind == 'imp':
            # diablotin : petit corps rouge, cornes, queue
            p.line(cx - 3, cy + 6, cx - 10, cy + 12, dk); p.poly([(cx - 10, cy + 10), (cx - 13, cy + 13), (cx - 9, cy + 14)], dk)
            p.rect(cx - 4, cy, cx + 4, cy + 9, col)
            p.rect(cx - 3, cy + 9, cx - 2, cy + 13, col); p.rect(cx + 2, cy + 9, cx + 3, cy + 13, col)
            p.ell(cx - 5, cy - 10, cx + 6, cy + 1, col)
            p.poly([(cx - 3, cy - 8), (cx - 6, cy - 15), (cx - 1, cy - 9)], hexc('2a2026'))
            p.poly([(cx + 2, cy - 9), (cx + 3, cy - 16), (cx + 5, cy - 8)], hexc('2a2026'))
            a = -40 if S['open'] else 30
            hx2 = cx + 3 + math.cos(math.radians(a)) * 8; hy2 = cy + 2 + math.sin(math.radians(a)) * 8
            p.line(cx + 3, cy + 2, hx2, hy2, col, 2)
            # fourche
            p.line(hx2 - 3, hy2 + 8, hx2 + 3, hy2 - 10, hexc('3a3036'))
            p.line(hx2 + 1, hy2 - 10, hx2 + 5, hy2 - 10, hexc('8a8e9a'))
            for k in range(3):
                p.line(hx2 + 1 + k * 2, hy2 - 10, hx2 + 1 + k * 2, hy2 - 13, hexc('8a8e9a'))
            ex, ey = cx + 3, cy - 5
            p.line(cx + 1, cy - 2, cx + 5, cy - 2, DARK)
        # aile avant
        ox = cx + 2
        pts = [(ox, cy - 2), (ox + 14, cy + wy - 6), (ox + 18, cy + wy), (ox + 10, cy + 3), (ox + 4, cy + 4)]
        p.poly(pts, wing)
        for k in (1, 2):
            p.line(ox, cy - 2, pts[k][0], pts[k][1], shade(wing, 0.6))
        # yeux
        ec = P_.get('eye', hexc('ff3030'))
        if S['closed']:
            p.line(ex - 1, ey, ex + 1, ey, DARK)
        else:
            p.rect(ex, ey, ex + 1, ey, ec)
        img = outline_sel(volume(grain(img)))
        if P_.get('aura'):
            aura(img, P_['aura'], n=10, cy=int(cy), r=(12, 20), seed=S['phase'] + fl)
        return img
    return draw


# --------------------------------------------------------------------------- arthropodes
def arthropod(P_):
    def draw(S):
        img = new(64 * SC, 64 * SC)
        p = P(img, SC)
        kind = P_['kind']
        col, dk, lt = P_['col'], P_['dark'], P_['light']
        cx = 28 + S['x']
        g = 59
        by = 48 + S['crouch'] - S['lift']
        ph = S['phase'] * math.pi / 2
        if kind == 'spider':
            for k in range(4):
                for side in (0, 1):
                    a = ph + k * 0.8 + side * math.pi
                    kx = cx - 6 + k * 5 + (2 if side else -2)
                    kneey = by - 9 - math.sin(a) * 2
                    c = dk if side == 0 else shade(dk, 1.3)
                    p.line(kx, by - 2, kx + (k - 1.5) * 3, kneey, c, 1)
                    p.line(kx + (k - 1.5) * 3, kneey, kx + (k - 1.5) * 6, g, c, 1)
            p.ell(cx - 14, by - 13, cx + 2, by + 1, col)  # abdomen
            p.ell(cx - 11, by - 11, cx - 3, by - 7, lt)
            if P_.get('mark'):
                p.poly([(cx - 7, by - 9), (cx - 5, by - 5), (cx - 7, by - 1), (cx - 9, by - 5)], P_['mark'])
            p.ell(cx, by - 9, cx + 10, by, col)  # céphalothorax
            for (ex, ey) in [(cx + 7, by - 7), (cx + 9, by - 6), (cx + 6, by - 5), (cx + 8, by - 4)]:
                p.px(ex, ey, P_.get('eye', hexc('ff3030')) if not S['closed'] else dk)
            fo = int(S['open'] * 2)
            p.line(cx + 9, by - 1, cx + 11 + fo, by + 3, WHITE); p.line(cx + 7, by, cx + 8, by + 3 + fo, WHITE)
        elif kind == 'scorpion':
            for k in range(3):
                for side in (0, 1):
                    a = ph + k + side * math.pi
                    kx = cx - 8 + k * 6
                    p.line(kx, by - 1, kx - 2 + math.sin(a) * 2, g, dk if side == 0 else shade(dk, 1.3), 1)
            # queue arquée au-dessus du corps
            strike = S['open']
            ctrl = [(-13, -3), (-18, -9), (-17, -17), (-10, -22), (-2 + strike * 8, -21 + strike * 4), (2 + strike * 12, -15 + strike * 8)]
            pts = [(cx + x, by + y) for x, y in ctrl]
            for i in range(len(pts) - 1):
                p.line(*pts[i], *pts[i + 1], col, 4 - (i // 3))
            for i, (x, y) in enumerate(pts[:-1]):
                r = 3 - i * 0.3
                p.ell(x - r, y - r, x + r, y + r, lt if i % 2 else col)
            tx, ty = pts[-1]
            p.poly([(tx - 2, ty - 2), (tx + 4, ty + 4), (tx + 1, ty - 3)], P_.get('sting', hexc('2a2026')))
            p.ell(cx - 14, by - 6, cx + 8, by + 2, col)
            for k in range(-12, 6, 4):
                p.line(cx + k, by - 6, cx + k, by + 1, dk)
            p.line(cx - 12, by - 5, cx + 6, by - 5, lt)
            # pinces
            o = 2 + S['open'] * 3
            px0 = cx + 8 + S['open'] * 3
            p.line(cx + 6, by - 2, px0 + 2, by - 4, col, 2)
            p.poly([(px0 + 1, by - 7), (px0 + 8, by - 6 - o), (px0 + 9, by - 4 - o), (px0 + 4, by - 4)], col)
            p.poly([(px0 + 1, by - 3), (px0 + 8, by - 2 + o * 0.4), (px0 + 7, by), (px0 + 2, by)], dk)
            p.px(cx + 6, by - 4, P_.get('eye', DARK) if not S['closed'] else dk)
        elif kind == 'crab':
            for k in range(3):
                for side in (-1, 1):
                    a = ph + k
                    kx = cx + side * (6 + k * 3)
                    p.line(kx, by - 2, kx + side * 4, by + 3 + math.sin(a), dk, 1)
                    p.line(kx + side * 4, by + 3 + math.sin(a), kx + side * 5, g, dk, 1)
            p.ell(cx - 15, by - 12, cx + 15, by + 2, col)
            p.ell(cx - 12, by - 11, cx + 8, by - 5, lt)
            for k in range(-10, 11, 5):
                p.px(cx + k, by - 3, dk)
            # yeux pédonculés
            for ex in (cx + 1, cx + 6):
                p.line(ex, by - 12, ex, by - 16, dk)
                p.ell(ex - 1, by - 18, ex + 1, by - 16, WHITE if not S['closed'] else dk); p.px(ex, by - 17, DARK)
            # pinces levées
            for side, sh in ((-1, 0.8), (1, 1.0)):
                cxp = cx + side * 15 + (S['open'] * 5 if side > 0 else 0)
                cyp = by - 16 - S['open'] * 4
                p.line(cx + side * 12, by - 6, cxp, cyp + 4, shade(col, sh), 3)
                p.ell(cxp - 5, cyp - 5, cxp + 5, cyp + 4, shade(col, sh))
                o = 2 + S['open'] * 3
                p.poly([(cxp + 2 * side, cyp - 4), (cxp + 8 * side, cyp - 4 - o), (cxp + 7 * side, cyp - 1)], shade(lt, sh))
            if P_.get('barnacles'):
                for (bx_, by_) in [(-8, -9), (4, -10), (10, -6)]:
                    p.px(cx + bx_, by + by_, P_['barnacles']); p.px(cx + bx_ + 1, by + by_, shade(P_['barnacles'], 1.3))
        img = outline_sel(volume(grain(img)))
        if P_.get('aura'):
            aura(img, P_['aura'], seed=S['phase'])
        return img
    return draw


# --------------------------------------------------------------------------- golem / sylvain
def golem(P_):
    def draw(S):
        img = new(64 * SC, 64 * SC)
        p = P(img, SC)
        col, dk, lt = P_['col'], P_['dark'], P_['light']
        kind = P_.get('kind', 'stone')
        cx = 28 + S['x'] * 0.6
        top = 16 + S['crouch'] + S['bob']
        # jambes
        sw = [0, 1, 0, -1][S['phase'] % 4]
        p.rect(cx - 9, 46 + S['crouch'], cx - 3, 59, dk)
        p.rect(cx + 2, 46 + S['crouch'], cx + 8, 59, col)
        p.rect(cx + 2, 46 + S['crouch'], cx + 3, 59, lt)
        # bras arrière
        raise_ = 0 if S['fx'] else S['open']
        ay = top + 8
        if kind == 'tree':
            p.line(cx - 8, ay, cx - 16, ay + 14 - raise_ * 18, dk, 3)
            p.line(cx - 16, ay + 14 - raise_ * 18, cx - 19, ay + 18 - raise_ * 22, dk, 1)
        else:
            p.rect(cx - 16, ay - raise_ * 14, cx - 9, ay + 20 - raise_ * 18, dk)
        # torse
        if kind == 'tree':
            p.poly([(cx - 8, top + 4), (cx + 8, top + 4), (cx + 9, 48 + S['crouch']), (cx - 9, 48 + S['crouch'])], col)
            for k in range(-6, 8, 4):
                p.line(cx + k, top + 6, cx + k + 1, 46 + S['crouch'], dk)
            # couronne de feuilles
            leaf = P_.get('leaf', hexc('3f7a3a'))
            for (lx, ly, r) in [(-8, -2, 8), (4, -4, 9), (-2, -9, 8), (10, 2, 6), (-12, 6, 5)]:
                p.ell(cx + lx - r, top + ly - r, cx + lx + r, top + ly + r, leaf)
                p.ell(cx + lx - r + 2, top + ly - r + 1, cx + lx + r - 4, top + ly, shade(leaf, 1.25))
            if P_.get('rot'):
                for (lx, ly) in [(-6, -4), (6, -2), (0, -10), (-11, 4)]:
                    p.px(cx + lx, top + ly, P_['rot']); p.px(cx + lx + 1, top + ly + 1, P_['rot'])
            # visage dans l'écorce
            ec = P_.get('eye', hexc('ffd84a'))
            if not S['closed']:
                p.rect(cx + 2, top + 10, cx + 3, top + 11, ec); p.rect(cx + 6, top + 10, cx + 7, top + 11, ec)
            p.rect(cx + 3, top + 15, cx + 6, top + 16 + S['open'] * 2, DARK)
        else:
            p.rect(cx - 11, top + 6, cx + 11, 48 + S['crouch'], col)
            p.rect(cx - 11, top + 6, cx + 11, top + 8, lt)
            p.rect(cx - 11, top + 6, cx - 9, 48 + S['crouch'], dk)
            for (x0, y0, x1, y1) in [(-6, 14, 2, 15), (3, 24, 9, 25), (-8, 30, -2, 31)]:
                p.line(cx + x0, top + y0, cx + x1, top + y1, dk)
            if P_.get('cracks'):
                cc = P_['cracks']
                for (x0, y0, x1, y1) in [(-5, 10, 0, 20), (0, 20, 6, 22), (4, 12, 8, 30), (-9, 26, -3, 36)]:
                    p.line(cx + x0, top + y0, cx + x1, top + y1, cc)
                p.ell(cx - 3, top + 16, cx + 3, top + 22, cc); p.px(cx, top + 19, hexc('fff4a0'))
            if P_.get('moss'):
                for k in range(-10, 11, 3):
                    p.rect(cx + k, top + 5, cx + k + 1, top + 7 + (k % 2), P_['moss'])
            if P_.get('rune'):
                p.ell(cx - 3, top + 16, cx + 3, top + 22, P_['rune']); p.px(cx, top + 19, WHITE)
            # tête
            p.rect(cx - 4, top - 2, cx + 7, top + 7, col)
            p.line(cx - 4, top - 2, cx + 7, top - 2, lt)
            ec = P_.get('eye', hexc('5fd3ff'))
            if S['closed']:
                p.line(cx + 2, top + 2, cx + 5, top + 2, DARK)
            else:
                p.rect(cx + 2, top + 1, cx + 5, top + 3, ec); p.px(cx + 5, top + 1, WHITE)
        # bras avant
        if kind == 'tree':
            ex_, ey_ = cx + 10 + raise_ * 6, ay + 14 - raise_ * 20
            p.line(cx + 6, ay, ex_, ey_, col, 3)
            for k in (-1, 1):
                p.line(ex_, ey_, ex_ + 4, ey_ + k * 3 + 2, col, 1)
        else:
            ax0 = cx + 9
            p.rect(ax0, ay - raise_ * 16, ax0 + 8, ay + 20 - raise_ * 18, col)
            p.rect(ax0, ay - raise_ * 16, ax0 + 1, ay + 20 - raise_ * 18, lt)
            p.rect(ax0 - 1, ay + 17 - raise_ * 18, ax0 + 9, ay + 22 - raise_ * 18, shade(col, 0.9))
        img = outline_sel(volume(grain(img)))
        if P_.get('aura'):
            aura(img, P_['aura'], n=12, cy=36, seed=S['phase'])
        if S['fx'] and kind != 'tree':
            pp = P(img, SC)
            for k in range(6):
                pp.px(30 + k * 5, 58 - (k % 2) * 2, (200, 190, 170, 220))
        return img
    return draw


# --------------------------------------------------------------------------- champignon
def mushroom(P_):
    def draw(S):
        img = new(64 * SC, 64 * SC)
        p = P(img, SC)
        cap, spots, stem = P_['cap'], P_['spots'], P_.get('stem', hexc('f0e6d0'))
        cx = 30 + S['x']
        sq = [0, 1, 1, 0][S['phase'] % 4]
        lean = S['open'] * 4
        g = 59
        p.rect(cx - 6, g - 3, cx - 3, g, shade(stem, 0.7)); p.rect(cx + 3, g - 3, cx + 6, g, shade(stem, 0.7))
        p.ell(cx - 7, g - 20 + sq + S['crouch'], cx + 7, g - 2, stem)
        p.line(cx + 5, g - 16, cx + 5, g - 5, shade(stem, 1.1))
        ct = g - 32 + sq + S['crouch']
        p.ell(cx - 15 + lean, ct, cx + 15 + lean, ct + 16, cap)
        p.rect(cx - 15 + lean, ct + 9, cx + 15 + lean, ct + 12, shade(cap, 0.75))
        p.ell(cx - 12 + lean, ct + 2, cx + 2 + lean, ct + 7, shade(cap, 1.25))
        for (sx, sy, r) in [(-8, 4, 2), (3, 2, 2), (9, 6, 1.5), (-2, 7, 1.5)]:
            p.ell(cx + sx - r + lean, ct + sy - r, cx + sx + r + lean, ct + sy + r, spots)
        ey = g - 13 + sq + S['crouch']
        if S['closed']:
            p.line(cx + 1, ey, cx + 3, ey, DARK); p.line(cx + 5, ey, cx + 7, ey, DARK)
        else:
            p.rect(cx + 1, ey - 1, cx + 2, ey + 1, DARK); p.rect(cx + 5, ey - 1, cx + 6, ey + 1, DARK)
        if S['open']:
            p.ell(cx + 2, ey + 3, cx + 6, ey + 6, hexc('5a2a2a'))
        img = outline_sel(volume(grain(img)))
        if S['open'] >= 1 or S['fx']:
            pp = P(img, SC)
            rnd = random.Random(int(S['x']))
            sc = P_.get('spore', hexc('c8e08a'))
            for k in range(14):
                pp.px(cx + 14 + rnd.randint(0, 16), ct + rnd.randint(-2, 18), (sc[0], sc[1], sc[2], 210))
        return img
    return draw
