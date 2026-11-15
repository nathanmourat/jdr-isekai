"""Calques d'animation d'un portrait IA (même cadrage que preparer_portrait.py : image source entière -> 512).

Pour chaque expression <e>, écrit dans <sortie>/<e>/ :
  yeux.png   : yeux fermés (seulement la zone des yeux, bords adoucis), pour le clignement
  carte.png  : R = cheveux (ondulation), G = respiration, B = tête (micro-mouvements)
La bouche est animée par le code (mâchoire + intérieur de bouche), d'après anim.json :
  centre de la bouche, largeur, bouche déjà ouverte ou non, pivot du cou.
Le portrait de base reste prepares/portrait-<e>.png.

Usage : python3 preparer_animation.py <dossier sources> <dossier portraits 512> <sortie> <id> <bouche_x> <bouche_y>
(bouche_x, bouche_y : centre de la bouche sur le neutre, en pixels de l'image source)
"""
import sys, os, json
import cv2
import numpy as np

SRC, PREP, OUT, ID = sys.argv[1:5]
MX, MY = float(sys.argv[5]), float(sys.argv[6])
EXPRS = ["neutre", "joie", "colere", "tristesse", "gene", "surprise"]
TAILLE = 512


def lire(p):
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise SystemExit(f"Image introuvable : {p}")
    return im


def recaler(ref, var):
    """Matrice affine M telle que var(M·x) ≈ ref(x)."""
    g1 = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    g2 = cv2.cvtColor(var, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    w = np.eye(2, 3, dtype=np.float32)
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)
    for s in (0.25, 0.5, 1.0):
        a = cv2.resize(g1, None, fx=s, fy=s)
        b = cv2.resize(g2, None, fx=s, fy=s)
        ws = w.copy(); ws[:, 2] *= s
        try:
            _, ws = cv2.findTransformECC(a, b, ws, cv2.MOTION_AFFINE, crit, None, 5)
        except cv2.error:
            pass
        w = ws.copy(); w[:, 2] /= s
    return w


def vers(img, M, shape, inverse):
    flags = cv2.INTER_CUBIC | (cv2.WARP_INVERSE_MAP if inverse else 0)
    return cv2.warpAffine(img, M, (shape[1], shape[0]), flags=flags, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def adoucir(m, r):
    return cv2.GaussianBlur(m, (0, 0), r)


def png512(rgba, chemin):
    p = cv2.resize(rgba, (TAILLE, TAILLE), interpolation=cv2.INTER_AREA)
    if p.shape[2] == 4:
        p[p[..., 3] == 0] = 0  # pixels invisibles à zéro : fichier beaucoup plus léger
    cv2.imwrite(chemin, p, [cv2.IMWRITE_PNG_COMPRESSION, 9])


def masque_cheveux(img_bgr, alpha, visage):
    H, W = alpha.shape
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    brut = (((h <= 16) | (h >= 170)) & (s > 140) & (v > 50) & (alpha > 128)).astype(np.uint8)
    brut = cv2.morphologyEx(brut, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(brut, 8)
    garde = np.zeros_like(brut)
    for i in range(1, n):
        x, y, w, hh, a = stats[i]
        if a > 0.002 * H * W and y < 0.55 * H:   # cheveux et tresse : composantes qui partent du haut
            garde[lab == i] = 1
    # enlever le visage (traits des yeux, de la bouche)
    cx, cy, rx, ry = visage
    yy, xx = np.mgrid[0:H, 0:W]
    dans_visage = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 < 1
    garde[dans_visage] = 0
    garde = cv2.dilate(garde, np.ones((5, 5), np.uint8))
    # poids : nul près du sommet du crâne, fort vers les pointes et la tresse
    d = np.sqrt((xx - cx) ** 2 + ((yy - (cy - ry * 1.1)) * 1.0) ** 2)
    poids = np.clip((d - 0.12 * H) / (0.30 * H), 0, 1) ** 1.3
    m = adoucir(garde.astype(np.float32) * poids, 3)
    return np.clip(m, 0, 1)


def respiration(alpha):
    H, W = alpha.shape
    yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
    g = 0.35 + 0.65 * np.clip((yy - 0.50 * H) / (0.16 * H), 0, 1)  # la tête suit un peu, épaules et buste beaucoup
    return g * (alpha > 0).astype(np.float32)


def tete(alpha, cheveux, cou_y):
    """Poids de la tête : 1 au-dessus du cou, 0 sur le buste ; la tresse suit à 60 %."""
    H, W = alpha.shape
    yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
    t = np.clip((cou_y + 0.035 * H - yy) / (0.07 * H), 0, 1)
    t = np.maximum(t, 0.6 * (cheveux > 0.05).astype(np.float32))
    return adoucir(t * (alpha > 0).astype(np.float32), 4)


def main():
    os.makedirs(OUT, exist_ok=True)
    neutre = lire(os.path.join(SRC, f"{ID}-neutre.png"))[..., :3]
    H, W = neutre.shape[:2]
    infos = {"taille": TAILLE, "expressions": {}}

    # 1. yeux fermés recalés sur le neutre + masque des yeux
    fermes = lire(os.path.join(SRC, f"{ID}-neutre-yeux-fermes.png"))[..., :3]
    Mf = recaler(neutre, fermes)
    fermes_al = vers(fermes, Mf, neutre.shape, inverse=True)
    diff = adoucir(np.abs(neutre.astype(np.float32) - fermes_al.astype(np.float32)).mean(axis=2), 5)
    zone = np.zeros_like(diff); zone[int(0.20 * H):int(0.40 * H), int(0.38 * W):int(0.75 * W)] = 1
    yeux = ((diff > 14) & (zone > 0)).astype(np.uint8)
    yeux = cv2.morphologyEx(yeux, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    yeux = cv2.dilate(yeux, np.ones((17, 17), np.uint8))
    yeux_m = np.clip(adoucir(yeux.astype(np.float32), 5) * 1.3, 0, 1)

    # 2. bouche : seulement ses dimensions (le code anime la mâchoire)
    largeur = 0.060 * W
    yy, xx = np.mgrid[0:H, 0:W]

    visage = (MX - 0.005 * W, MY - 0.085 * H, 0.105 * W, 0.135 * H)

    for e in EXPRS:
        p = os.path.join(SRC, f"{ID}-{e}.png")
        if not os.path.exists(p):
            continue
        img = lire(p)[..., :3]
        base = lire(os.path.join(PREP, f"portrait-{e}.png"))
        alpha = cv2.resize(base[..., 3], (W, H), interpolation=cv2.INTER_LINEAR)
        M = np.eye(2, 3, dtype=np.float32) if e == "neutre" else recaler(neutre, img)
        dos = os.path.join(OUT, e); os.makedirs(dos, exist_ok=True)

        # yeux : patch du neutre-yeux-fermés amené dans le repère de l'expression
        f_e = vers(fermes_al, M, img.shape, inverse=False)
        m_e = vers(yeux_m, M, img.shape, inverse=False)
        rgba = np.dstack([f_e, (m_e * 255).astype(np.uint8)])
        png512(rgba, os.path.join(dos, "yeux.png"))

        c = M @ np.array([MX, MY, 1.0])
        # carte : cheveux (R) et respiration (G)
        v_e = (c[0] - 0.005 * W, c[1] - 0.085 * H, visage[2], visage[3])
        ch = masque_cheveux(img, alpha, v_e)
        re = respiration(alpha)
        cou_y = c[1] + 0.075 * H
        te = tete(alpha, ch, cou_y)
        carte = np.dstack([te, re, ch])  # BGR : B=tête, G=respiration, R=cheveux
        png512((np.clip(carte, 0, 1) * 255).astype(np.uint8), os.path.join(dos, "carte.png"))
        infos["expressions"][e] = {
            "bouche": [round(float(c[0]) / W, 4), round(float(c[1]) / H, 4)],
            "largeur": round(largeur / W, 4),
            "ouverte": e in ("joie", "surprise"),
            "cou": [round(float(c[0]) / W, 4), round(float(cou_y) / H, 4)],
        }
        print(e, "ok, bouche", infos["expressions"][e]["bouche"])

    with open(os.path.join(OUT, "anim.json"), "w") as f:
        json.dump(infos, f, indent=1)


main()
