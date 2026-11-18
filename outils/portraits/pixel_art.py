"""Convertit une illustration en pixel art détaillé.

Étapes : recadrage 16:9 -> lissage qui garde les bords (enlève la texture « peinture »)
-> réduction à la taille native -> palette k-means (espace Lab) -> nettoyage des pixels isolés
-> contours légèrement assombris (effet pixel art) -> agrandissement sans lissage.

Usage : python3 pixel_art.py <source> <sortie> [largeur_native=640] [couleurs=96] [facteur=3]
"""
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
LN = int(sys.argv[3]) if len(sys.argv) > 3 else 640
NC = int(sys.argv[4]) if len(sys.argv) > 4 else 96
FX = int(sys.argv[5]) if len(sys.argv) > 5 else 3
HN = round(LN * 9 / 16)

im = cv2.imread(src)[..., :3]
H, W = im.shape[:2]
h = round(W * 9 / 16)
if h <= H:
    y0 = (H - h) // 2; im = im[y0:y0 + h]
else:
    w = round(H * 16 / 9); x0 = (W - w) // 2; im = im[:, x0:x0 + w]

# 1. lissage qui garde les bords
lisse = cv2.edgePreservingFilter(im, flags=cv2.RECURS_FILTER, sigma_s=12, sigma_r=0.25)
# 2. taille native
petit = cv2.resize(lisse, (LN, HN), interpolation=cv2.INTER_AREA)
# léger renforcement du contraste local
lab = cv2.cvtColor(petit, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
l = cv2.createCLAHE(clipLimit=1.3, tileGridSize=(8, 8)).apply(l)
petit = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
# un peu plus de saturation (la réduction de palette ternit les couleurs)
hsv = cv2.cvtColor(petit, cv2.COLOR_BGR2HSV).astype(np.float32)
hsv[..., 1] = np.clip(hsv[..., 1] * 1.18, 0, 255)
petit = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

# 3. palette k-means en Lab
lab = cv2.cvtColor(petit, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5)
_, lab_idx, centres = cv2.kmeans(lab, NC, None, crit, 4, cv2.KMEANS_PP_CENTERS)
idx = lab_idx.reshape(HN, LN)
pal_bgr = cv2.cvtColor(centres.reshape(1, -1, 3).astype(np.uint8), cv2.COLOR_LAB2BGR).reshape(-1, 3)
lum = centres[:, 0]

# 4. nettoyage : un pixel différent de ses 8 voisins prend la couleur la plus fréquente autour
for _ in range(2):
    p = np.pad(idx, 1, mode='edge')
    voisins = np.stack([p[1 + dy:1 + dy + HN, 1 + dx:1 + dx + LN] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx])
    seul = (voisins != idx[None]).all(axis=0)
    ys, xs = np.nonzero(seul)
    for y, x in zip(ys, xs):
        v, c = np.unique(voisins[:, y, x], return_counts=True)
        idx[y, x] = v[np.argmax(c)]

# 5. contours : sur les bords forts, le pixel le plus clair prend la couleur un peu plus sombre de la palette
img = pal_bgr[idx]
gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
bords = cv2.Canny(gris, 60, 140) > 0
ordre = np.argsort(lum)
rang = np.empty_like(ordre); rang[ordre] = np.arange(NC)
plus_sombre = ordre[np.maximum(rang - 2, 0)]
lum_idx = lum[idx]
p = np.pad(lum_idx, 1, mode='edge')
voisin_min = np.minimum.reduce([p[1 + dy:1 + dy + HN, 1 + dx:1 + dx + LN] for dy in (-1, 0, 1) for dx in (-1, 0, 1)])
assombrir = bords & (lum_idx > voisin_min + 18)
idx = np.where(assombrir, plus_sombre[idx], idx)
img = pal_bgr[idx]

# 6. agrandissement sans lissage
grand = cv2.resize(img, (LN * FX, HN * FX), interpolation=cv2.INTER_NEAREST)
cv2.imwrite(dst, grand, [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(dst.replace('.png', '-natif.png'), img, [cv2.IMWRITE_PNG_COMPRESSION, 9])
print(f'{LN}x{HN} natif, {NC} couleurs, x{FX} -> {grand.shape[1]}x{grand.shape[0]} : {dst}')
