import math
from PIL import Image
from px import *
from heroes import figure, combat_frames, sheet, tint, rot, settle, glow, LEATHER, lay, S

BONE = hexc('e8e0c8')
GOBLIN = dict(skin=hexc('8a8c86'), hair=hexc('3a3a3a'), hair_style='none', top=hexc('5a4a3a'), top2=None,
              legs=hexc('4a3a2a'), boots=hexc('3a2a1a'), weapon='spear', ears=True, nose=True,
              eye=hexc('ff3030'), marks=hexc('a040e0'), magic=hexc('a040e0'), attack='thrust', belt=LEATHER)
SKELETON = dict(skin=BONE, hair=BONE, hair_style='none', top=hexc('7a5a3a'), top2=hexc('9a6a3a'),
                legs=BONE, boots=hexc('5a4a3a'), weapon='brokensword', brokenshield=True, skull=True,
                eye=hexc('5fd3ff'), magic=hexc('5fd3ff'), attack='melee', armor='light', bare_arms=True)


def humanoid_sheet(s):
    rows = combat_frames(s)
    rows = [rows[0], rows[1], rows[3], rows[4]]
    rows = [[f.transpose(Image.FLIP_LEFT_RIGHT) for f in r] for r in rows]
    return sheet(rows, 64)


# ---------------------------------------------------------------- loup
WOLF = hexc('8a8e96'); WOLF_D = hexc('5a5e68'); WOLF_L = hexc('b8bcc4')


def wolf(dx=0, dy=0, phase=0, head_dy=0, mouth=0, leap=0, crouch=0, closed=False):
    """Loup de côté, tourné vers la DROITE (retourné ensuite)."""
    img = new(64 * S, 64 * S)
    p = P(img, S)
    bx, by = 26 + dx, 42 + dy + crouch - leap  # centre du corps
    g = 59
    # pattes (arrière-plan plus sombres)
    def legp(x, ph, c):
        o = math.sin(ph) * 3
        fy = min(g, by + 15 - leap)
        p.line(x, by + 3, x + o, fy - 2, c, 3)
        p.rect(x + o - 1, fy - 2, x + o + 2, fy, shade(c, 0.8))
    legp(bx - 9, phase + math.pi, WOLF_D)
    legp(bx + 9, phase, WOLF_D)
    # queue
    p.poly([(bx - 13, by - 3), (bx - 22, by - 8 - crouch), (bx - 24, by - 5), (bx - 14, by + 2)], WOLF)
    p.line(bx - 21, by - 7, bx - 23, by - 5, WOLF_L)
    # corps
    p.ell(bx - 15, by - 7, bx + 13, by + 6, WOLF)
    p.ell(bx - 12, by + 1, bx + 10, by + 6, WOLF_L)
    # poils hérissés sur le dos
    for k in range(-12, 10, 3):
        p.poly([(bx + k, by - 6), (bx + k + 2, by - 6), (bx + k, by - 10 - (k % 2))], WOLF_D)
    legp(bx - 6, phase, WOLF)
    legp(bx + 12, phase + math.pi, WOLF)
    # cou + tête
    hx, hy = bx + 15, by - 8 + head_dy
    p.poly([(bx + 6, by - 6), (bx + 12, by + 3), (hx + 2, hy + 6), (hx - 2, hy - 4)], WOLF)
    p.ell(hx - 5, hy - 5, hx + 5, hy + 5, WOLF)
    # oreilles
    p.poly([(hx - 4, hy - 3), (hx - 2, hy - 10), (hx + 1, hy - 4)], WOLF_D)
    p.poly([(hx - 1, hy - 4), (hx + 2, hy - 9), (hx + 4, hy - 3)], WOLF)
    # museau
    p.poly([(hx + 2, hy - 2), (hx + 12, hy + 1), (hx + 12, hy + 3), (hx + 3, hy + 3)], WOLF)
    p.px(hx + 12, hy + 1, (20, 18, 26, 255))
    if mouth:
        p.poly([(hx + 3, hy + 4), (hx + 11, hy + 4 + mouth), (hx + 3, hy + 6)], WOLF_D)
        p.line(hx + 4, hy + 4, hx + 11, hy + 4 + mouth, hexc('a02a2a'))
        p.px(hx + 10, hy + 4, (255, 255, 255, 255)); p.px(hx + 7, hy + 4, (255, 255, 255, 255))
    else:
        p.line(hx + 3, hy + 4, hx + 11, hy + 4, WOLF_D)
    # œil jaune
    if closed:
        p.line(hx + 1, hy, hx + 4, hy, (20, 18, 26, 255))
    else:
        p.rect(hx + 2, hy - 1, hx + 3, hy, hexc('ffd030'))
        p.px(hx + 3, hy - 1, (20, 18, 26, 255))
    return outline_sel(volume(grain(img)))


def wolf_sheet():
    rows = []
    rows.append([wolf(dy=d, phase=0, head_dy=d) for d in [0, 1, 1, 0]])
    att = [wolf(crouch=2, head_dy=2, mouth=1), wolf(crouch=3, dx=-2, head_dy=3, mouth=2),
           wolf(dx=6, leap=6, phase=1.2, mouth=4, head_dy=-1), wolf(dx=12, leap=4, phase=2, mouth=5),
           wolf(dx=10, phase=0.5, mouth=2), wolf(dx=4, phase=0, mouth=0)]
    for i in (2, 3):
        p = P(att[i], S)
        for k in range(3):
            p.line(56 - k * 3, 30 + k * 4, 59 - k * 3, 36 + k * 4, (255, 255, 255, 200))
    rows.append(att)
    rows.append([tint(wolf(dx=-3, head_dy=-2, mouth=3), (255, 255, 255), 0.65),
                 tint(wolf(dx=-2, head_dy=-1), (255, 60, 60), 0.15)])
    base = wolf(phase=0)
    rows.append([wolf(crouch=5, head_dy=4), lay(base, -20, pivot=(40, 58)),
                 wolf(crouch=10, head_dy=8, closed=True)])
    rows = [[f.transpose(Image.FLIP_LEFT_RIGHT) for f in r] for r in rows]
    return sheet(rows, 64)
