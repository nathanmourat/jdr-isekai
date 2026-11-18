# Paysage de Lysmont à l'aube, dessiné entièrement par le code (aucune IA d'image).
# usage : python3 paysage_code.py <sortie.png> [graine]
import sys
import numpy as np
from PIL import Image

W, H = 640, 360
GRAINE = int(sys.argv[2]) if len(sys.argv) > 2 else 7
R = np.random.default_rng(GRAINE)
img = np.zeros((H, W, 3), float)
YY, XX = np.mgrid[0:H, 0:W]
B4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16 + 1 / 32
SEUIL = B4[YY % 4, XX % 4]


def c(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)


def rampe(t, cols, masque=None):
    """Couleur tramée (Bayer 4x4) le long d'une rampe de couleurs."""
    cols = np.array([c(x) for x in cols])
    n = len(cols) - 1
    f = np.clip(t, 0, 1) * n
    i = np.floor(f).astype(int)
    i = np.where(f - i > SEUIL[:t.shape[0], :t.shape[1]] if t.ndim == 2 else 0, i + 1, i)
    out = cols[np.clip(i, 0, n)]
    if masque is not None:
        img[masque] = out[masque]
    return out


def bruit(w, h, echelle, octaves=4, graine=0, etire=1.0):
    r = np.random.default_rng(graine)
    out = np.zeros((h, w))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        sx, sy = echelle * etire / 2 ** o, echelle / 2 ** o
        g = r.random((int(h / sy) + 3, int(w / sx) + 3))
        ys, xs = np.arange(h) / sy, np.arange(w) / sx
        y0, x0 = ys.astype(int), xs.astype(int)
        ty, tx = ys - y0, xs - x0
        ty, tx = ty * ty * (3 - 2 * ty), tx * tx * (3 - 2 * tx)
        a, b = g[y0][:, x0], g[y0][:, x0 + 1]
        cc, d = g[y0 + 1][:, x0], g[y0 + 1][:, x0 + 1]
        v = (a + (b - a) * tx) * (1 - ty[:, None]) + (cc + (d - cc) * tx) * ty[:, None]
        out += v * amp
        tot += amp
        amp *= 0.5
    return out / tot


def ligne(w, echelle, octaves, graine):
    return bruit(w, 1, echelle, octaves, graine)[0]


# ---------------- Ciel ----------------
HORIZON = 205
SOLX, SOLY, SOLR = 452, 112, 13
CIEL = ['#141233', '#1f1b47', '#2e2459', '#45306b', '#623b78', '#86467d', '#ac527c',
        '#cc6278', '#e47a70', '#f2996a', '#f9bb72', '#fdd98e', '#fff0bd']
dist = np.hypot((XX - SOLX) * 0.55, YY - SOLY)
t = (YY / HORIZON) ** 1.15 * 0.82 + np.clip(1 - dist / 260, 0, 1) ** 2 * 0.35
ciel_t = np.clip(t, 0, 1)
rampe(ciel_t, CIEL, np.ones((H, W), bool))
ciel = img.copy()

# étoiles qui s'effacent
for _ in range(90):
    x, y = R.integers(0, W), R.integers(0, 70)
    if ciel_t[y, x] < 0.25:
        img[y, x] = c('#c8c0e8') if R.random() < 0.7 else c('#fff4d8')

# soleil et halo
halo = dist < SOLR + 9
img[halo & (dist >= SOLR + 4) & (SEUIL < 0.5)] = c('#fff0bd')
img[dist < SOLR + 4] = c('#fff0bd')
img[np.hypot(XX - SOLX, YY - SOLY) < SOLR] = c('#fffbe8')

# nuages (bandes étirées, éclairées par en dessous côté soleil)
n = bruit(W, H, 26, 5, GRAINE + 1, etire=3.2)
dens = n - 0.52 + (1 - YY / 175) * -0.10 + np.clip(YY - 40, 0, None) * 0.0
nuage = (dens > 0) & (YY < 172) & (YY > 18)
lum = (n - np.roll(n, (3, -2), (0, 1))) * 9 + (YY / 172) * 0.6 + np.clip(1 - dist / 320, 0, 1) * 0.5
NUAGE = ['#2a2252', '#3e2d62', '#5a3a70', '#7c4878', '#a0577a', '#c96d78', '#ea8f74', '#fbb97c', '#ffe0a8']
rampe(np.clip(lum, 0, 1), NUAGE, nuage)
bord = nuage & ~np.roll(nuage, 1, 0)   # liseré lumineux sous les nuages
img[np.roll(bord, 0, 0) & (YY > 80)] = c('#ffd89a')

# oiseaux
for _ in range(7):
    x, y = R.integers(150, 560), R.integers(70, 140)
    for dx, dy in [(-2, -1), (-1, 0), (0, 0), (1, 0), (2, -1)]:
        if dy == 0 and dx == 0:
            continue
        img[y + dy, x + dx] = c('#2a1c3c')


# ---------------- Montagnes en couches ----------------
def montagne(base, amp, ech, graine, couleurs, eclaire, neige=None, brume='#c26a7a'):
    crete = (base - ligne(W, ech, 5, graine) * amp).astype(int)
    pente = np.gradient(crete.astype(float))
    m = YY >= crete[None, :]
    tex = bruit(W, H, 6, 3, graine + 50)
    hm = bruit(W, H, 16, 4, graine + 60, etire=0.6)
    gx = np.roll(hm, -1, 1) - np.roll(hm, 1, 1)
    pl = np.convolve(pente, np.ones(11) / 11, 'same')
    # côté tourné vers le soleil (droite) plus clair : pente de la crête + relief 2D
    face = np.clip(0.45 + pl[None, :] * 0.35 + gx * 9 + (tex - 0.5) * 0.25, 0, 1)
    prof = np.clip((YY - crete[None, :]) / 60, 0, 1)
    t = np.clip(face * (1 - prof * 0.6), 0, 1)
    rampe(t, couleurs + [eclaire], m)
    if neige:
        haut = crete < base - amp * 0.55
        mn = m & (YY < crete[None, :] + 5 + (tex * 4).astype(int)) & haut[None, :]
        rampe(np.clip(face, 0, 1), neige, mn)
    # brume au pied
    pied = m & (YY > base + 6) & (SEUIL < np.clip((YY - base - 6) / 18, 0, 0.75))
    img[pied] = c(brume)
    return crete


montagne(150, 70, 90, 11, ['#6e4c84', '#835a8e'], '#b27a98',
         neige=['#c8a0bc', '#e8c4cc', '#fbe2d8'], brume='#b0607c')
montagne(178, 55, 60, 12, ['#4a3a6c', '#5c467a'], '#8a5e88', brume='#8e4e7a')
montagne(200, 34, 40, 13, ['#34305a', '#40386a'], '#64507a', brume='#6a4272')

# ---------------- Colline du château ----------------
cx = 268
colline = (212 - 58 * np.exp(-((np.arange(W) - cx) / 95.0) ** 2) - ligne(W, 25, 3, 21) * 6).astype(int)
mc = YY >= colline[None, :]
tex = bruit(W, H, 5, 3, 22)
face = np.clip((np.arange(W)[None, :] - cx) / 140 + 0.45 + (tex - 0.5) * 0.6, 0, 1)
rampe(face, ['#1f2a3a', '#2a3848', '#384a4e', '#566050', '#7c7858'], mc)
# arbustes sur la colline
top = colline[cx]
for _ in range(55):
    x = R.integers(cx - 140, cx + 140)
    y = colline[x] + R.integers(3, 34)
    if y < H:
        for k in range(R.integers(2, 5)):
            bx, by, r = x + k * 3 - 4, y + R.integers(-1, 2), R.integers(2, 4)
            m = np.hypot(XX - bx, YY - by) <= r
            img[m] = c('#16202c')
            img[m & (np.hypot(XX - bx - 1, YY - by + 1) <= r - 1)] = c('#2c3a3c')
            img[m & (XX >= bx) & (YY <= by - r + 1)] = c('#6a6a4c')
# chemin en lacets vers le château
for k in range(0, 60):
    y = top + 14 + k
    x = cx + int(np.sin(k / 7) * 22)
    if y < H and img[y, x].sum() < 400:
        img[y, x:x + 3] = c('#8a6a5e')
        img[y, x + 2] = c('#b88a6e')


def rect(x0, y0, x1, y1, col):
    if x1 > 0 and y1 > 0:
        img[max(y0, 0):y1, max(x0, 0):x1] = c(col)


def mur(x0, y0, x1, y1, ombre='#5a4f6c', pierre='#8c7f98', lumiere='#d0a8a0', creneaux=True):
    rect(x0, y0, x1, y1, pierre)
    rect(x0, y0, x0 + max(1, (x1 - x0) // 4), y1, ombre)
    rect(x1 - max(1, (x1 - x0) // 5), y0, x1, y1, lumiere)
    # joints de pierre
    for yy in range(y0 + 2, y1, 3):
        for xx in range(x0 + (yy // 3) % 2 * 2, x1, 4):
            if R.random() < 0.6 and 0 <= xx < W:
                img[yy, xx] = c('#6a5e7c')
    if creneaux:
        for xx in range(x0, x1, 2):
            if (xx - x0) % 4 < 2:
                rect(xx, y0 - 2, xx + 2, y0, pierre)
                if 0 <= xx < W: img[y0 - 2, xx] = c(lumiere) if xx > (x0 + x1) // 2 else c(ombre)


def fenetres(x0, y0, x1, y1, p=0.35, haut=2):
    for yy in range(y0, y1 - haut, 5):
        for xx in range(x0 + 1, x1 - 1, 3):
            if R.random() < p:
                col = '#ffd27a' if R.random() < 0.7 else '#ff9a4a'
                rect(xx, yy, xx + 1, yy + haut, col)


def toit_cone(xm, y, larg, haut, sombre='#2c2450', clair='#6a4c7c'):
    for k in range(haut):
        demi = int(larg / 2 * (k + 1) / haut)
        for xx in range(max(xm - demi, 0), min(xm + demi + 1, W)):
            img[y - haut + k, xx] = c(clair) if xx > xm else c(sombre)
            if xx == xm + demi and k % 2 == 0:
                img[y - haut + k, xx] = c('#e0a080')


def tour(xm, base, larg, haut, toit=14, drapeau=False):
    mur(xm - larg // 2, base - haut, xm + larg // 2 + 1, base, creneaux=False)
    fenetres(xm - larg // 2 + 1, base - haut + 4, xm + larg // 2, base - 4, p=0.25, haut=3)
    toit_cone(xm, base - haut, larg + 4, toit)
    if drapeau:
        h0 = base - haut - toit
        rect(xm, h0 - 9, xm + 1, h0, '#3a2a3a')
        for k in range(5):
            for xx in range(xm + 1, xm + 8 - k // 2):
                img[h0 - 9 + k, xx] = c('#d4a040') if (xx + k) % 5 else c('#f7d070')
        img[h0 - 7, xm + 3] = c('#fff0bd')  # soleil levant


top = colline[cx]
# remparts du château
mur(cx - 52, top - 8, cx + 54, top + 14)
fenetres(cx - 50, top - 4, cx + 52, top + 10, p=0.12)
mur(cx - 28, top - 34, cx + 30, top - 8)          # donjon
fenetres(cx - 26, top - 30, cx + 28, top - 10, p=0.3, haut=3)
toit_cone(cx + 1, top - 34, 40, 10)
tour(cx - 52, top + 14, 12, 42, 16)
tour(cx + 54, top + 14, 12, 44, 16)
tour(cx - 16, top - 26, 10, 36, 18)
tour(cx + 1, top - 30, 14, 54, 24, drapeau=True)
tour(cx + 20, top - 26, 10, 30, 15)
# porte
rect(cx - 4, top + 6, cx + 5, top + 14, '#1a1426')

# ---------------- Brume du matin ----------------
mb = (YY > 196) & (YY < 216) & (SEUIL < np.clip(1 - np.abs(YY - 206) / 10, 0, 1) * 0.55) & ~((YY >= colline[None, :]) & (np.abs(XX - cx) < 60))
img[mb] = img[mb] * 0.45 + c('#e0a0a8') * 0.55

# ---------------- Ville ----------------
TOITS = [('#5a2a34', '#9a4a3e'), ('#4a2c40', '#8a4a50'), ('#3a3050', '#6e5070'), ('#5e3428', '#a8603a')]
MURS = [('#7a6a70', '#c8ae96', '#e8c8a8'), ('#6c6274', '#b4a094', '#dcbca4'), ('#706068', '#bca88c', '#ecd0a0')]


def maison(x, sol, l, h, th):
    sombre, mi, clair = MURS[R.integers(len(MURS))]
    rect(x, sol - h, x + l, sol, mi)
    rect(x, sol - h, x + l // 3, sol, sombre)
    rect(x + l - 2, sol - h, x + l, sol, clair)
    # colombages
    if R.random() < 0.5:
        for xx in range(x + 2, x + l - 1, 4):
            rect(xx, sol - h, xx + 1, sol, '#5a4048')
        rect(x, sol - h + h // 2, x + l, sol - h + h // 2 + 1, '#5a4048')
    fenetres(x + 1, sol - h + 2, x + l - 1, sol - 1, p=0.3)
    rect(x + l // 2 - 1, sol - 4, x + l // 2 + 2, sol, '#2a1c26')
    ts, tc = TOITS[R.integers(len(TOITS))]
    for k in range(th):
        demi = int((l / 2 + 1) * (k + 1) / th)
        xm = x + l // 2
        for xx in range(xm - demi, xm + demi + 1):
            if 0 <= xx < W:
                img[sol - h - th + k, xx] = c(tc) if xx >= xm else c(ts)
        if k % 2 == 1:
            img[sol - h - th + k, min(max(xm - demi, 0), W - 1)] = c('#2a1a26')
    if R.random() < 0.4:  # cheminée et fumée
        xx = x + l - 4
        rect(xx, sol - h - th - 2, xx + 2, sol - h - th + 3, '#4a3a48')
        for k in range(10):
            yy = sol - h - th - 4 - k * 2
            x2 = xx + int(np.sin(k * 0.7 + x) * 2) + k // 3
            if 0 <= yy < H and R.random() < 0.8 - k * 0.06:
                if 0 <= x2 < W: img[yy, x2] = c('#c890a0') if k > 3 else c('#a07890')


for rangee, sol in enumerate(range(222, 282, 9)):
    x = R.integers(-10, 4)
    while x < W:
        l = int(R.integers(9, 22))
        if abs(x - cx) > 70 or sol > top + 30 + rangee:
            if sol > colline[min(max(x, 0), W - 1)] - 2 or rangee > 2:
                maison(x, sol, l, int(R.integers(7, 12)) + rangee, int(R.integers(5, 9)))
        x += l + int(R.integers(0, 4))
    if rangee == 3:  # temple au milieu de la ville
        tx, ts = 470, sol
        mur(tx - 22, ts - 26, tx + 22, ts, creneaux=False)
        rect(tx - 4, ts - 20, tx + 4, ts - 12, '#ffd27a')
        img[ts - 17:ts - 15, tx - 5:tx + 5] = c('#fff0bd')  # rosace
        toit_cone(tx, ts - 26, 50, 12, '#3a3456', '#7a6488')
        tour(tx + 18, ts - 20, 8, 22, 16)

# rempart de la ville
mur(-2, 284, W + 2, 296, creneaux=True)
for xx in range(20, W, 92):
    tour(xx, 300, 12, 26, 11)
rect(306, 286, 322, 296, '#1a1426')       # porte de ville
rect(308, 284, 320, 286, '#5a4f6c')

# ---------------- Rivière et rive ----------------
riv_h = (318 + ligne(W, 60, 3, 31) * 10).astype(int)
rive_h = (302 + ligne(W, 40, 3, 32) * 6).astype(int)
mr = (YY >= rive_h[None, :]) & (YY < riv_h[None, :])
# herbe de la rive au-dessus de l'eau
mh = (YY >= 296) & (YY < rive_h[None, :])
rampe(np.clip(bruit(W, H, 4, 2, 40) * 1.1 + (XX / W) * 0.4 - 0.2, 0, 1),
      ['#1c2630', '#28363c', '#3e4a44', '#66644e'], mh)
# eau = reflet du ciel ondulé
ondes = (bruit(W, H, 2.5, 2, 41, etire=8) - 0.5) * 6
ys = np.clip((2 * HORIZON - YY * 0.75 - 30 + ondes).astype(int), 0, HORIZON)
eau = ciel[ys, XX] * 0.72 + c('#20204a') * 0.28
img[mr] = eau[mr]
# chemin de lumière du soleil sur l'eau
reflet = mr & (np.abs(XX - SOLX + (YY - 300) * 0.0) < 8 + (YY - 300) * 0.6) & (
    bruit(W, H, 1.5, 1, 42, etire=6) > 0.55)
img[reflet] = c('#ffe6a8')
img[mr & (YY == rive_h[None, :])] = c('#14182a')

# ---------------- Premier plan ----------------
mp = YY >= riv_h[None, :]
herbe = np.clip(bruit(W, H, 5, 3, 50) * 0.9 + (1 - (YY - 318) / 42) * 0.25, 0, 1)
rampe(herbe, ['#0e1420', '#16202a', '#202e30', '#34403a', '#5a5a44'], mp)
for _ in range(900):  # brins d'herbe éclairés
    x, y = R.integers(0, W), R.integers(322, H)
    if mp[y, x]:
        col = '#7a7050' if R.random() < 0.4 else '#3e4a3c'
        img[y - 1:y + 1, x] = c(col)
for _ in range(40):  # fleurs
    x, y = R.integers(0, W), R.integers(326, H)
    img[y, x] = c(['#e8b0c0', '#f7d070', '#c8c8f0'][R.integers(3)])
# chemin de terre vers la porte
for y in range(296, H):
    k = (y - 296) / (H - 296)
    xm = 314 + int(np.sin(k * 3.0) * 30 * k)
    demi = int(4 + k * 26)
    for x in range(xm - demi, xm + demi):
        if 0 <= x < W and not mr[y, x]:
            t = 0.35 + (x - xm) / (2 * demi) * 0.5 + (SEUIL[y, x] - 0.5) * 0.3
            img[y, x] = c('#5a4446') if t < 0.4 else (c('#8a6a5e') if t < 0.7 else c('#b88a6e'))
# pont sur la rivière
for y in range(300, 322):
    for x in range(296, 334):
        if mr[y, x] or (y < 304):
            img[y, x] = c('#6a5466') if (x - 296) % 6 else c('#3a2c3a')
rect(296, 299, 334, 301, '#b89478')


def arbre(x, y, taille, graine):
    r = np.random.default_rng(graine)
    rect(x - 2, y - taille, x + 3, y, '#1a1218')
    rect(x + 1, y - taille, x + 3, y, '#4a3030')
    boules = [(x + int(r.normal(0, taille * 0.35)), y - taille - int(r.random() * taille * 0.7),
               int(taille * (0.28 + r.random() * 0.22))) for _ in range(12)]
    masque = np.zeros((H, W), bool)
    lum = np.full((H, W), -1.0)
    for bx, by, br in boules:
        d = np.hypot(XX - bx, YY - by)
        m = d <= br
        masque |= m
        # lumière venant du haut à droite (soleil)
        l = np.clip(((XX - bx) * 0.7 - (YY - by) * 0.7) / br * 0.5 + 0.5, 0, 1)
        lum = np.where(m, np.maximum(lum, l * 0.85 + (1 - d / br) * 0.1), lum)
    feuille = bruit(W, H, 2, 2, graine)
    t = np.clip(lum * 0.8 + (feuille - 0.5) * 0.6, 0, 1)
    rampe(t, ['#0c1018', '#141c24', '#1e2a2a', '#2e3a30', '#4c4a3a', '#8a6a4a'], masque)
    contour = masque & ~(np.roll(masque, -1, 1) & np.roll(masque, 1, 0))
    img[contour & (XX > x)] = c('#d08a5a')  # liseré du soleil


arbre(38, 352, 70, 61)
arbre(600, 356, 62, 62)
arbre(560, 340, 34, 63)
arbre(95, 336, 28, 64)

# lucioles / poussière dorée
for _ in range(45):
    x, y = R.integers(0, W), R.integers(220, H)
    img[y, x] = c('#ffe08a')

out = np.clip(img, 0, 255).astype(np.uint8)
Image.fromarray(out).save(sys.argv[1].replace('.png', '-natif.png'))
Image.fromarray(out).resize((W * 3, H * 3), Image.NEAREST).save(sys.argv[1])
print('couleurs :', len(np.unique(out.reshape(-1, 3), axis=0)))
