"""Icônes 32×32 des équipements génériques, dans le style du générateur du groupe (px.py).

Une forme par catégorie, une palette par palier (I → VI).
Sorties : objets/<id>.png (32×32) et apercu.png (planche agrandie pour relire).
Lancer :  python3 dessiner.py   (il faut pillow et numpy)
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from px import P, hexc, new, outline, shade, up

ICI = Path(__file__).resolve().parent
SORTIE = ICI.parent.parent / "assets" / "icones" / "objets"  # dossier des icônes du jeu

PALIERS = ["I", "II", "III", "IV", "V", "VI"]
PALETTES = {
    "I": dict(metal="9aa3ad", metal_l="dde2e8", metal_d="5c6470", wood="8a5a32", wood_d="5e3a1e", accent="b8322a", accent_l="e86a52",
              cloth="3d5c8c", cloth_d="2a3f63", leather="8b5e3c", gem="4aa3df"),
    "II": dict(metal="c9963a", metal_l="f0cf7a", metal_d="7d5a20", wood="b88a50", wood_d="7a5630", accent="2fb5a3", accent_l="8ae6d8",
               cloth="e0c48a", cloth_d="a8894d", leather="a06a3a", gem="2fb5a3"),
    "III": dict(metal="b8d0c0", metal_l="f0f8f0", metal_d="6f8f7a", wood="c9b28a", wood_d="8a7552", accent="4f9d3a", accent_l="9ed46a",
                cloth="3f7a4a", cloth_d="2a5233", leather="6b5a3a", gem="9ed46a"),
    "IV": dict(metal="5a5f6b", metal_l="9aa0ac", metal_d="33363e", wood="4a3a30", wood_d="2c221c", accent="e8722a", accent_l="ffb03a",
               cloth="7a2e22", cloth_d="4e1c15", leather="4e3a2e", gem="ff7a2a"),
    "V": dict(metal="e6e2d6", metal_l="ffffff", metal_d="a8a294", wood="d8b46a", wood_d="9a7a3a", accent="e8b83c", accent_l="fff0a0",
              cloth="2f5fb3", cloth_d="1f3f80", leather="8a6a4a", gem="7ab8ff"),
    "VI": dict(metal="3a3440", metal_l="8a7e9a", metal_d="1e1a24", wood="2e2a2e", wood_d="18161a", accent="9b4ddc", accent_l="d7a0ff",
               cloth="4a2a5a", cloth_d="2e1a3a", leather="3a2e30", gem="c070ff"),
}


def pal(code):
    return {k: hexc(v) for k, v in PALETTES[code].items()}


def bezier(p0, p1, p2, n=24):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]


def trace(p, pts, c, r=0):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        p.thick(x0, y0, x1, y1, c, r)


def gemme(p, x, y, c, r=2):
    p.ell(x - r, y - r, x + r, y + r, c)
    p.px(x - 1, y - 1, shade(c, 1.6))


# ── Armes ────────────────────────────────────────────────────────────────
def epee(p, c, code):
    p.thick(12, 20, 26, 6, c["metal"], 1)
    p.line(13, 18, 26, 5, c["metal_l"])
    p.line(14, 21, 27, 8, c["metal_d"])
    p.thick(8, 17, 15, 24, c["accent"], 1)
    p.thick(11, 21, 6, 26, c["wood"], 1)
    p.line(10, 23, 7, 26, c["wood_d"])
    gemme(p, 5, 27, c["accent_l"], 1)


def deux_mains(p, c, code):
    p.thick(5, 28, 22, 11, c["wood"], 1)
    p.line(6, 28, 22, 12, c["wood_d"])
    p.poly([(17, 6), (24, 3), (29, 9), (28, 17), (22, 14)], c["metal"])
    p.line(24, 3, 29, 10, c["metal_l"])
    p.line(28, 11, 28, 16, c["metal_l"])
    p.poly([(17, 6), (20, 9), (22, 14), (19, 12)], c["metal_d"])
    p.rect(18, 12, 21, 15, c["accent"])


def masse(p, c, code):
    p.thick(6, 27, 18, 15, c["wood"], 1)
    p.line(7, 27, 18, 16, c["wood_d"])
    p.rect(15, 15, 19, 19, c["accent"])
    p.ell(16, 5, 27, 16, c["metal"])
    for (x, y) in ((21, 3), (29, 10), (21, 18), (14, 10)):
        p.ell(x - 2, y - 2, x + 1, y + 1, c["metal_d"])
    p.ell(18, 7, 22, 10, c["metal_l"])


def dague(p, c, code):
    p.poly([(14, 17), (24, 6), (27, 5), (26, 8), (16, 19)], c["metal"])
    p.line(15, 17, 25, 6, c["metal_l"])
    p.thick(11, 15, 17, 21, c["accent"], 1)
    p.thick(13, 19, 8, 24, c["leather"], 1)
    gemme(p, 7, 25, c["accent_l"], 1)


def arc(p, c, code):
    corps = bezier((25, 3), (27, 27), (3, 25))
    p.line(25, 3, 3, 25, c["metal_l"])
    trace(p, corps, c["wood"], 1)
    trace(p, [(x - 1, y - 1) for x, y in corps[4:-4]], c["wood_d"])
    p.thick(19, 17, 21, 19, c["accent"], 1)
    p.line(6, 22, 22, 6, c["metal_d"])
    p.poly([(22, 6), (25, 5), (24, 8)], c["metal"])


def arbalete(p, c, code):
    p.thick(6, 26, 21, 11, c["wood"], 2)
    p.line(7, 27, 22, 12, c["wood_d"])
    prod = bezier((13, 5), (25, 4), (27, 17))
    trace(p, prod, c["metal"], 1)
    p.line(13, 5, 19, 14, c["metal_l"])
    p.line(27, 17, 19, 14, c["metal_l"])
    p.rect(18, 13, 21, 16, c["accent"])
    p.thick(9, 25, 11, 28, c["metal_d"], 1)


def baton(p, c, code):
    p.thick(5, 28, 23, 10, c["wood"], 1)
    p.line(6, 28, 23, 11, c["wood_d"])
    p.rect(18, 14, 20, 16, c["accent"])
    p.poly([(23, 3), (28, 6), (27, 11), (22, 12), (20, 8)], c["gem"])
    p.line(23, 4, 21, 8, shade(c["gem"], 1.6))
    p.px(25, 6, (255, 255, 255, 255))


def sceptre(p, c, code):
    p.thick(7, 27, 19, 15, c["metal"], 1)
    p.line(8, 27, 19, 16, c["metal_d"])
    p.ell(16, 4, 28, 16, c["accent"])
    p.ell(18, 6, 26, 14, (0, 0, 0, 0))
    p.img.paste((0, 0, 0, 0), (19, 7, 26, 14))
    p.ell(16, 4, 28, 16, c["accent"])
    p.ell(19, 7, 25, 13, c["accent_l"])
    gemme(p, 22, 10, c["gem"], 2)
    p.rect(15, 16, 18, 18, c["accent"])


def orbe(p, c, code):
    if code in ("III", "VI"):  # grimoire
        p.rect(7, 6, 25, 27, c["cloth"])
        p.rect(7, 6, 9, 27, c["cloth_d"])
        p.rect(24, 8, 26, 26, hexc("efe6cf"))
        p.line(25, 9, 25, 25, hexc("c8bea4"))
        p.rect(13, 11, 21, 21, c["accent"])
        gemme(p, 17, 16, c["gem"], 2)
        return
    p.poly([(9, 27), (23, 27), (21, 23), (11, 23)], c["metal_d"])
    p.ell(7, 4, 25, 22, c["gem"])
    p.ell(9, 6, 23, 20, shade(c["gem"], 1.15))
    p.ell(11, 8, 16, 12, shade(c["gem"], 1.6))
    p.px(12, 9, (255, 255, 255, 255))
    p.line(11, 23, 21, 23, c["metal_l"])


def instrument(p, c, code):
    if code == "I":  # flûte
        p.thick(5, 27, 26, 6, c["wood"], 1)
        p.line(6, 27, 26, 7, c["wood_d"])
        for k in range(4):
            p.px(12 + k * 3, 19 - k * 3, c["wood_d"])
        p.thick(23, 9, 26, 6, c["accent"], 1)
        return
    if code == "III":  # harpe
        p.thick(8, 5, 8, 27, c["wood"], 1)
        p.thick(8, 27, 24, 24, c["wood"], 1)
        trace(p, bezier((8, 5), (26, 6), (24, 24)), c["accent"], 1)
        for k in range(4):
            p.line(11 + k * 3, 9 + k, 11 + k * 3, 25 - k // 2, c["metal_l"])
        return
    if code == "IV":  # cornemuse
        p.ell(6, 12, 22, 27, c["cloth"])
        p.ell(8, 14, 14, 19, shade(c["cloth"], 1.2))
        for k, (x, y) in enumerate(((16, 3), (21, 5), (25, 8))):
            p.thick(14 + k * 2, 14, x, y, c["wood_d"], 1)
            p.rect(x - 1, y - 1, x + 1, y + 1, c["metal"])
        p.thick(10, 26, 6, 30, c["wood_d"], 1)
        return
    p.ell(4, 14, 19, 29, c["wood"])
    p.ell(6, 16, 15, 25, shade(c["wood"], 1.15))
    p.ell(9, 19, 13, 23, c["wood_d"])
    p.thick(14, 19, 25, 7, c["wood_d"], 1)
    p.rect(24, 3, 28, 8, c["wood_d"])
    p.line(10, 22, 26, 5, c["metal_l"])
    p.rect(8, 24, 12, 25, c["accent"])


# ── Tenues ───────────────────────────────────────────────────────────────
def torse(p, base, fonce):
    p.poly([(9, 7), (23, 7), (25, 13), (24, 27), (8, 27), (7, 13)], base)
    p.poly([(16, 7), (23, 7), (25, 13), (24, 27), (16, 27)], fonce)


def lourde(p, c, code):
    torse(p, c["metal"], c["metal_d"])
    p.ell(3, 6, 12, 15, c["metal_l"])
    p.ell(20, 6, 29, 15, c["metal"])
    p.line(16, 8, 16, 21, c["metal_l"])
    p.rect(8, 21, 24, 23, c["accent"])
    p.rect(14, 21, 18, 23, c["accent_l"])
    p.poly([(12, 7), (20, 7), (16, 11)], c["metal_d"])


def intermediaire(p, c, code):
    torse(p, c["leather"], shade(c["leather"], 0.78))
    p.line(10, 8, 22, 24, c["wood_d"])
    p.line(11, 8, 23, 24, shade(c["leather"], 0.6))
    for (x, y) in ((11, 13), (21, 13), (11, 18), (21, 18)):
        p.px(x, y, c["metal_l"])
    p.rect(8, 22, 24, 23, c["accent"])
    p.poly([(12, 7), (20, 7), (16, 11)], shade(c["leather"], 0.6))


def legere(p, c, code):
    p.poly([(11, 5), (21, 5), (24, 12), (27, 28), (5, 28), (8, 12)], c["cloth"])
    p.poly([(16, 5), (21, 5), (24, 12), (27, 28), (16, 28)], c["cloth_d"])
    p.poly([(8, 9), (3, 19), (6, 20), (10, 13)], c["cloth"])
    p.poly([(24, 9), (29, 19), (26, 20), (22, 13)], c["cloth_d"])
    p.line(16, 7, 16, 27, c["accent"])
    p.rect(9, 15, 23, 16, c["accent"])
    p.line(5, 27, 27, 27, c["accent_l"])
    p.poly([(13, 5), (19, 5), (16, 9)], shade(c["cloth"], 0.6))


# ── Accessoires ──────────────────────────────────────────────────────────
def bouclier(p, c, code):
    p.poly([(6, 4), (26, 4), (26, 15), (16, 28), (6, 15)], c["metal_d"])
    p.poly([(8, 6), (24, 6), (24, 14), (16, 25), (8, 14)], c["wood"] if code in ("I", "III") else c["metal"])
    p.poly([(16, 6), (24, 6), (24, 14), (16, 25)], shade(c["wood"] if code in ("I", "III") else c["metal"], 0.8))
    p.line(16, 6, 16, 24, c["accent"])
    p.line(8, 11, 24, 11, c["accent"])
    gemme(p, 16, 11, c["accent_l"], 2)


def anneau(p, c, code):
    p.ell(7, 10, 25, 28, c["accent"])
    p.ell(10, 13, 22, 25, (0, 0, 0, 0))
    p.img.paste((0, 0, 0, 0), (11, 14, 22, 25))
    p.ell(7, 10, 25, 28, c["accent"])
    p.ell(10, 13, 22, 25, (0, 0, 0, 0))
    img = p.img
    for y in range(32):
        for x in range(32):
            if (x - 16) ** 2 + (y - 19) ** 2 < 30:
                img.putpixel((x, y), (0, 0, 0, 0))
    p.line(9, 15, 11, 12, c["accent_l"])
    p.poly([(12, 9), (16, 4), (20, 9), (16, 12)], c["gem"])
    p.px(15, 6, (255, 255, 255, 255))


def amulette(p, c, code):
    p.line(6, 3, 16, 17, c["metal"])
    p.line(26, 3, 16, 17, c["metal"])
    for k in range(0, 10, 2):
        p.px(7 + k, 4 + int(k * 1.4), c["metal_l"])
    p.ell(10, 15, 22, 27, c["accent"])
    p.ell(12, 17, 20, 25, c["gem"])
    p.px(14, 19, (255, 255, 255, 255))


def talisman(p, c, code):
    p.line(16, 2, 16, 10, c["leather"])
    p.line(15, 2, 15, 10, shade(c["leather"], 0.7))
    p.poly([(16, 9), (25, 15), (22, 27), (10, 27), (7, 15)], c["metal"] if code != "I" else hexc("e8e0c8"))
    p.poly([(16, 9), (25, 15), (22, 27), (16, 27)], shade(c["metal"] if code != "I" else hexc("e8e0c8"), 0.8))
    p.line(16, 13, 16, 24, c["accent"])
    p.line(12, 17, 20, 21, c["accent"])
    p.line(20, 17, 12, 21, c["accent"])


def carquois(p, c, code):
    p.thick(8, 27, 20, 9, c["leather"], 2)
    p.line(7, 25, 19, 7, shade(c["leather"], 1.2))
    for k, (x, y) in enumerate(((20, 4), (24, 6), (23, 2))):
        p.line(18, 10, x, y, c["wood"])
        p.poly([(x, y), (x + 3, y - 1), (x + 1, y + 2)], c["accent"])
    p.line(10, 22, 15, 26, c["metal"])
    p.line(14, 16, 19, 20, c["metal"])


def sacoche(p, c, code):
    p.rect(6, 12, 26, 27, c["leather"])
    p.rect(16, 12, 26, 27, shade(c["leather"], 0.8))
    p.poly([(5, 11), (27, 11), (25, 19), (7, 19)], shade(c["leather"], 1.15))
    p.rect(14, 16, 18, 20, c["metal"])
    p.px(16, 18, c["metal_d"])
    p.rect(19, 4, 22, 11, hexc("d8eef0"))
    p.rect(19, 7, 22, 11, c["gem"])
    p.rect(19, 3, 22, 4, c["wood"])
    p.line(8, 11, 13, 4, c["leather"])


FORMES = {
    "epee": epee, "deux-mains": deux_mains, "masse": masse, "dague": dague, "arc": arc, "arbalete": arbalete,
    "baton": baton, "sceptre": sceptre, "orbe": orbe, "instrument": instrument,
    "lourde": lourde, "intermediaire": intermediaire, "legere": legere,
    "bouclier": bouclier, "anneau": anneau, "amulette": amulette, "talisman": talisman, "carquois": carquois, "sacoche": sacoche,
}
LIBELLES = {
    "epee": "Épée", "deux-mains": "Deux mains", "masse": "Masse", "dague": "Dague", "arc": "Arc", "arbalete": "Arbalète",
    "baton": "Bâton", "sceptre": "Sceptre", "orbe": "Orbe / grimoire", "instrument": "Instrument",
    "lourde": "Tenue lourde", "intermediaire": "Tenue interm.", "legere": "Tenue légère",
    "bouclier": "Bouclier", "anneau": "Anneau", "amulette": "Amulette", "talisman": "Talisman", "carquois": "Carquois", "sacoche": "Sacoche",
}
# Les objets existants gardent leur id : l'icône porte leur nom de fichier
EXISTANTS = {("epee", "I"): "epee-courte", ("dague", "I"): "dague", ("baton", "I"): "baton-apprenti", ("arc", "I"): "arc-court",
             ("bouclier", "I"): "bouclier-bois", ("intermediaire", "I"): "armure-cuir", ("legere", "I"): "robe-mage"}


def icone(categorie, code):
    img = new(32, 32)
    FORMES[categorie](P(img), pal(code), code)
    return outline(img)


def fichiers(categorie, code):
    """Noms des fichiers : la version commune et la version « de maître » partagent la même icône."""
    base = f"{categorie}-{code.lower()}"
    return [EXISTANTS.get((categorie, code), base), base + "-maitre"]


def apercu(icones):
    k, marge, gauche, haut = 3, 8, 130, 30
    cell = 32 * k + marge
    w = gauche + cell * len(PALIERS)
    h = haut + cell * len(FORMES)
    planche = Image.new("RGBA", (w, h), (34, 32, 44, 255))
    d = ImageDraw.Draw(planche)
    police = None
    for chemin in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf", "C:/Windows/Fonts/arial.ttf",
                   "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        try:
            police = ImageFont.truetype(chemin, 14)
            break
        except OSError:
            continue
    if police is None:
        police = ImageFont.load_default()
    for j, code in enumerate(PALIERS):
        d.text((gauche + j * cell + 40, 8), f"Palier {code}", fill=(230, 230, 240), font=police)
    for i, cat in enumerate(FORMES):
        y = haut + i * cell
        d.text((8, y + 40), LIBELLES[cat], fill=(230, 230, 240), font=police)
        for j, code in enumerate(PALIERS):
            x = gauche + j * cell
            d.rectangle([x, y, x + 32 * k - 1, y + 32 * k - 1], fill=(52, 50, 66, 255))
            planche.alpha_composite(up(icones[(cat, code)], k), (x, y))
    return planche


# ── Objets nommés : forme de la catégorie + couleurs propres + aura de rareté ──
PALETTES["X"] = dict(metal="f4efe2", metal_l="ffffff", metal_d="b8a98a", wood="e8d5a8", wood_d="a8905a", accent="e53935", accent_l="ff8a80",
                     cloth="f4efe2", cloth_d="c8b890", leather="b08a5a", gem="ff5252")
COULEUR_CLASSE = {
    "lame-runique": "35c4d8", "arcaniste": "ff8c3a", "invocateur": "8a6ae0", "ombre": "6a5a8a", "gardien": "f0c850",
    "alchimiste": "5ac85a", "archer": "7ad89a", "guerisseur": "fff0b0", "berserker": "d83a2a", "barde": "e05ab0",
}
COULEUR_ELEMENT = {"feu": "ff7a2a", "glace": "8ad8ff", "foudre": "ffe14a", "sacre": "fff0a0", "ombre": "8a4ad8",
                   "poison": "8ad84a", "arcane": "d07aff"}
AURA = {"epique": ("b45adc", 110), "legendaire": ("ffc83a", 130), "mythique": ("ff3a3a", 160)}


def variante(categorie, nom, palier):
    """Choisit la forme qui correspond au nom (flûte, harpe, grimoire…) ; sinon celle du palier."""
    n = nom.lower()
    if categorie == "instrument":
        for mot, code in (("flûte", "I"), ("harpe", "III"), ("cornemuse", "IV"), ("luth", "II"), ("oud", "II")):
            if mot in n:
                return code
        return "II"
    if categorie == "orbe":
        return "III" if ("grimoire" in n or "livre" in n) else "I"
    return "VI" if palier == "X" else palier


def palette_nommee(o):
    c = pal(o["palier"])
    elements = [e["element"] for e in o["effets"] if e.get("element")]
    if o["pense_pour"]:
        c["accent"] = hexc(COULEUR_CLASSE[o["pense_pour"]])
        c["accent_l"] = shade(c["accent"], 1.45)
    if elements:
        c["gem"] = hexc(COULEUR_ELEMENT[elements[0]])
    elif o["pense_pour"]:
        c["gem"] = shade(c["accent"], 1.3)
    return c


def aura(img, couleur, alpha, rayon=2):
    """Halo coloré derrière les pixels opaques (épique, légendaire, mythique)."""
    import numpy as np
    a = np.array(img)
    plein = a[:, :, 3] > 0
    zone = plein.copy()
    halo = Image.new("RGBA", img.size, (0, 0, 0, 0))
    h = np.array(halo)
    for k in range(1, rayon + 1):
        voisin = zone.copy()
        voisin[1:, :] |= zone[:-1, :]
        voisin[:-1, :] |= zone[1:, :]
        voisin[:, 1:] |= zone[:, :-1]
        voisin[:, :-1] |= zone[:, 1:]
        anneau = voisin & ~zone
        h[anneau] = hexc(couleur)[:3] + (int(alpha / k),)
        zone = voisin
    fond = Image.fromarray(h)
    fond.alpha_composite(img)
    return fond


def etoile(p, x, y, c):
    p.px(x, y, (255, 255, 255, 255))
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        p.px(x + dx, y + dy, c)


def icone_nommee(o):
    img = new(32, 32)
    FORMES[o["categorie"]](P(img), palette_nommee(o), variante(o["categorie"], o["nom"], o["palier"]))
    img = outline(img)
    r = o["rarete"]
    if r in AURA:
        img = aura(img, *AURA[r])
    p = P(img)
    etoiles = {"rare": [(3, 3)], "epique": [(3, 3)], "legendaire": [(3, 3), (28, 27)], "mythique": [(3, 3), (28, 27), (27, 3)]}
    for (x, y) in etoiles.get(r, []):
        etoile(p, x, y, hexc({"rare": "8ac8ff", "epique": "e0a0ff", "legendaire": "ffe08a", "mythique": "ff8a8a"}[r]))
    return img


def apercu_nommes(objets):
    import generer
    k, marge, gauche, haut = 3, 10, 170, 34
    cell = 32 * k + marge
    groupes = [(generer.CLASSES[c], [o for o in objets if o["pense_pour"] == c]) for c in generer.CLASSES]
    groupes.append(("Reliques du Voile", [o for o in objets if o["rarete"] == "mythique"]))
    colonnes = max(len(g) for _, g in groupes)
    planche = Image.new("RGBA", (gauche + cell * colonnes, haut + (cell + 16) * len(groupes)), (34, 32, 44, 255))
    d = ImageDraw.Draw(planche)
    police = police_apercu(14)
    petite = police_apercu(11)
    d.text((8, 8), "Objets nommés — palier et rareté sous chaque icône", fill=(230, 230, 240), font=police)
    ordre = list(generer.RARETES)
    for i, (titre, liste) in enumerate(groupes):
        y = haut + i * (cell + 16)
        d.text((8, y + 40), titre, fill=(230, 230, 240), font=police)
        liste = sorted(liste, key=lambda o: (generer.INDEX[o["palier"]], ordre.index(o["rarete"])))
        for j, o in enumerate(liste):
            x = gauche + j * cell
            d.rectangle([x, y, x + 32 * k - 1, y + 32 * k - 1], fill=(52, 50, 66, 255))
            planche.alpha_composite(up(icone_nommee(o), k), (x, y))
            couleur = hexc(generer.RARETES[o["rarete"]][3])
            d.rectangle([x, y + 32 * k, x + 32 * k - 1, y + 32 * k + 3], fill=couleur)
            d.text((x + 2, y + 32 * k + 4), f"{o['palier']} · {generer.RARETES[o['rarete']][0]}", fill=(200, 200, 214), font=petite)
    return planche


def police_apercu(taille):
    for chemin in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf", "C:/Windows/Fonts/arial.ttf",
                   "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(chemin, taille)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    SORTIE.mkdir(exist_ok=True)
    icones = {}
    n = 0
    for cat in FORMES:
        for code in PALIERS:
            img = icone(cat, code)
            icones[(cat, code)] = img
            for nom in fichiers(cat, code):
                img.save(SORTIE / f"{nom}.png")
                n += 1
    apercu(icones).save(ICI / "apercu.png")
    print(f"{len(icones)} icônes génériques, {n} fichiers, planche : apercu.png")

    import sys
    sys.path.insert(0, str(ICI.parent))
    import generer
    nommes = generer.nommes()
    for o in nommes:
        icone_nommee(o).save(SORTIE / f"{o['id']}.png")
    apercu_nommes(nommes).save(ICI / "apercu-nommes.png")
    print(f"{len(nommes)} icônes d'objets nommés, planche : apercu-nommes.png")
    ids = {o["id"] for o in generer.generiques() + nommes}
    fichiers_png = {f.stem for f in SORTIE.glob("*.png")}
    manquants = ids - fichiers_png
    print("Toutes les icônes sont présentes." if not manquants else f"Icônes manquantes : {sorted(manquants)}")


if __name__ == "__main__":
    main()
