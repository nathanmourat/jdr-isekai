"""PNJ détourés, vus de face, à poser sur les décors (40×64 agrandi ×2 → 80×128).
Point d'ancrage : milieu du bas de l'image (les pieds)."""
import os, math
from px import *

GOLD = hexc('e8b83c'); WHITE = hexc('f8f4ec'); DARK = hexc('201a26'); STEEL = hexc('c9d3e0'); STEEL_D = hexc('8a94a8')
SKIN = {'clair': hexc('f2c9a0'), 'mate': hexc('c8946a'), 'pale': hexc('f5d7bd'), 'brun': hexc('a8714a')}


def npc(s):
    img = new(80, 128)
    p = P(img, 2)
    cx = 20
    top = s.get('shorter', 0)          # décalage vers le bas (personnage plus petit)
    wide = s.get('wide', 0)            # carrure
    skin = s.get('skin', SKIN['clair'])
    hy = 13 + top                      # centre de la tête
    hw = 6 + (1 if wide else 0)
    feet = 62

    # cape / queue derrière
    if s.get('cape'):
        c = s['cape']
        p.poly([(cx - 8 - wide, hy + 8), (cx + 8 + wide, hy + 8), (cx + 11 + wide, feet - 2), (cx - 11 - wide, feet - 2)], shade(c, 0.8))
    if s.get('tail'):
        c = s['tail']
        p.poly([(cx + 6, 40), (cx + 14, 46), (cx + 17, 54), (cx + 13, 56), (cx + 9, 48)], c)
        p.px(cx + 16, 55, WHITE)

    # bas du corps
    lower = s.get('lower', 'robe')
    tw = 7 + wide  # demi-largeur du torse
    waist = hy + 25 - top // 3
    if lower == 'robe':
        rc = s.get('robe', s['top'])
        p.poly([(cx - tw, waist - 2), (cx + tw, waist - 2), (cx + tw + 4, feet - 1), (cx - tw - 4, feet - 1)], rc)
        p.line(cx + tw, waist, cx + tw + 3, feet - 2, shade(rc, 0.75))
        p.line(cx - tw + 1, waist, cx - tw - 2, feet - 2, shade(rc, 1.12))
        if s.get('robe_trim'):
            p.line(cx - tw - 4, feet - 2, cx + tw + 4, feet - 2, s['robe_trim'])
            p.line(cx, waist, cx, feet - 2, s['robe_trim'])
        p.rect(cx - 5, feet - 1, cx - 2, feet, s.get('boots', hexc('5a3a22')))
        p.rect(cx + 2, feet - 1, cx + 5, feet, s.get('boots', hexc('5a3a22')))
    else:
        lc, bc = s.get('legs', hexc('4a3a2a')), s.get('boots', hexc('3a2a1a'))
        p.rect(cx - tw + 1, waist, cx - 1, feet - 5, lc); p.rect(cx + 1, waist, cx + tw - 1, feet - 5, shade(lc, 0.85))
        p.rect(cx - tw, feet - 6, cx - 1, feet, bc); p.rect(cx + 1, feet - 6, cx + tw, feet, shade(bc, 0.9))
        p.line(cx - tw, feet - 6, cx - 1, feet - 6, shade(bc, 1.3))

    # torse
    tc = s['top']
    p.rect(cx - tw, hy + 7, cx + tw, waist, tc)
    p.rect(cx + tw - 2, hy + 8, cx + tw, waist, shade(tc, 0.8))
    p.rect(cx - tw, hy + 8, cx - tw + 1, waist, shade(tc, 1.15))
    if s.get('armor'):
        a = s['armor']
        p.rect(cx - tw + 1, hy + 8, cx + tw - 1, hy + 18, a)
        p.line(cx - tw + 2, hy + 9, cx + tw - 2, hy + 9, shade(a, 1.3))
        p.line(cx, hy + 9, cx, hy + 18, shade(a, 0.7))
        p.ell(cx - tw - 3, hy + 6, cx - tw + 3, hy + 12, a); p.ell(cx + tw - 3, hy + 6, cx + tw + 3, hy + 12, shade(a, 0.85))
        if s.get('armor_trim'):
            p.line(cx - tw + 1, hy + 18, cx + tw - 1, hy + 18, s['armor_trim'])
            p.px(cx - tw - 1, hy + 8, s['armor_trim']); p.px(cx + tw + 1, hy + 8, s['armor_trim'])
    if s.get('apron'):
        ac = s['apron']
        p.rect(cx - tw + 2, hy + 12, cx + tw - 2, waist + 10 if lower != 'robe' else waist + 12, ac)
        p.line(cx - tw + 2, hy + 12, cx + tw - 2, hy + 12, shade(ac, 1.2))
        if s.get('pockets'):
            for (dx, dy) in [(-4, 18), (2, 18), (-4, 24), (2, 24)]:
                p.rect(cx + dx, hy + dy, cx + dx + 2, hy + dy + 3, shade(ac, 0.8))
        if s.get('stains'):
            for (dx, dy) in [(-3, 15), (3, 22), (-1, 27)]:
                p.px(cx + dx, hy + dy, s['stains']); p.px(cx + dx + 1, hy + dy, s['stains'])
    if s.get('overalls'):
        oc = s['overalls']
        p.rect(cx - tw + 2, hy + 12, cx + tw - 2, waist, oc)
        p.line(cx - tw + 2, hy + 7, cx - tw + 2, hy + 12, oc); p.line(cx + tw - 2, hy + 7, cx + tw - 2, hy + 12, oc)
        p.rect(cx - tw + 1, waist, cx + tw - 1, feet - 6, oc)
    if s.get('emblem') == 'soleil':
        p.ell(cx - 2, hy + 11, cx + 2, hy + 15, GOLD)
        for k in range(8):
            a = k / 8 * 2 * math.pi
            p.px(cx + math.cos(a) * 3.5, hy + 13 + math.sin(a) * 3.5, GOLD)
    if s.get('collar'):
        p.rect(cx - tw, hy + 6, cx + tw, hy + 8, s['collar'])
        for x in range(cx - tw, cx + tw + 1, 2):
            p.px(x, hy + 7, DARK if s.get('ermine') else shade(s['collar'], 1.2))
    if s.get('belt'):
        p.rect(cx - tw, waist - 2, cx + tw, waist - 1, s['belt']); p.px(cx, waist - 2, GOLD)
    if s.get('beads'):
        for k in range(7):
            p.px(cx - 3 + k, hy + 9 + abs(k - 3), s['beads'])
    if s.get('rings'):
        pass

    # bras et mains
    ac = s.get('arm', tc)
    pose = s.get('pose', 'down')
    if pose == 'down':
        p.rect(cx - tw - 3, hy + 8, cx - tw - 1, waist + 2, shade(ac, 1.05)); p.rect(cx + tw + 1, hy + 8, cx + tw + 3, waist + 2, shade(ac, 0.85))
        p.rect(cx - tw - 3, waist + 3, cx - tw - 1, waist + 5, skin); p.rect(cx + tw + 1, waist + 3, cx + tw + 3, waist + 5, skin)
    elif pose == 'hold':  # main droite (côté gauche de l'image) tient un objet devant
        p.rect(cx + tw + 1, hy + 8, cx + tw + 3, waist + 2, shade(ac, 0.85)); p.rect(cx + tw + 1, waist + 3, cx + tw + 3, waist + 5, skin)
        p.rect(cx - tw - 3, hy + 8, cx - tw - 1, hy + 18, shade(ac, 1.05))
        p.line(cx - tw - 2, hy + 18, cx - 2, hy + 20, ac, 2); p.rect(cx - 3, hy + 19, cx - 1, hy + 21, skin)
    elif pose == 'hips':
        for side in (-1, 1):
            p.line(cx + side * (tw + 1), hy + 8, cx + side * (tw + 4), hy + 15, ac, 2)
            p.line(cx + side * (tw + 4), hy + 15, cx + side * (tw - 1), waist - 1, ac, 2)
    elif pose == 'staff':
        p.rect(cx - tw - 3, hy + 8, cx - tw - 1, waist + 2, shade(ac, 1.05)); p.rect(cx - tw - 3, waist + 3, cx - tw - 1, waist + 5, skin)
        p.rect(cx + tw + 1, hy + 8, cx + tw + 3, hy + 20, shade(ac, 0.85)); p.rect(cx + tw + 1, hy + 19, cx + tw + 4, hy + 21, skin)

    # cou + tête
    p.rect(cx - 2, hy + 5, cx + 2, hy + 8, shade(skin, 0.88))
    p.ell(cx - hw, hy - 6, cx + hw, hy + 6, skin)
    p.ell(cx + 1, hy - 4, cx + hw, hy + 5, shade(skin, 0.93))
    p.px(cx - hw, hy, shade(skin, 0.85)); p.px(cx + hw, hy, shade(skin, 0.85))  # oreilles

    # cheveux
    hair = s.get('hair')
    hc = s.get('hair_c', hexc('5a3a22'))
    if hair == 'bald':
        p.px(cx - 3, hy - 5, shade(skin, 1.25)); p.px(cx - 2, hy - 5, shade(skin, 1.25))
    elif hair == 'short':
        p.ell(cx - hw - 1, hy - 7, cx + hw + 1, hy - 1, hc)
        p.rect(cx - hw - 1, hy - 3, cx - hw + 1, hy + 2, hc); p.rect(cx + hw - 1, hy - 3, cx + hw + 1, hy + 2, hc)
        p.line(cx - 3, hy - 6, cx + 2, hy - 6, shade(hc, 1.3))
    elif hair == 'messy':
        p.ell(cx - hw - 1, hy - 8, cx + hw + 1, hy - 1, hc)
        for k in range(-hw, hw + 1, 2):
            p.px(cx + k, hy - 8 - (k % 3 == 0), hc)
        p.rect(cx - hw - 1, hy - 3, cx - hw + 1, hy + 1, hc); p.rect(cx + hw - 1, hy - 3, cx + hw + 1, hy + 1, hc)
        p.px(cx - 2, hy - 2, hc); p.px(cx + 1, hy - 2, hc)
    elif hair == 'bob':
        p.ell(cx - hw - 2, hy - 8, cx + hw + 2, hy + 2, hc)
        p.rect(cx - hw - 2, hy - 2, cx - hw, hy + 4, hc); p.rect(cx + hw, hy - 2, cx + hw + 2, hy + 4, hc)
        p.rect(cx - hw + 1, hy - 4, cx + hw - 1, hy - 3, hc)
        p.line(cx - 4, hy - 7, cx + 1, hy - 7, shade(hc, 1.5))
    elif hair == 'long':
        p.ell(cx - hw - 2, hy - 8, cx + hw + 2, hy, hc)
        p.rect(cx - hw - 2, hy - 3, cx - hw, hy + 16, hc); p.rect(cx + hw, hy - 3, cx + hw + 2, hy + 16, hc)
        p.line(cx - 3, hy - 7, cx + 2, hy - 7, shade(hc, 1.25))
    elif hair == 'braid':
        p.ell(cx - hw - 1, hy - 8, cx + hw + 1, hy - 1, hc)
        p.rect(cx - hw - 1, hy - 3, cx - hw + 1, hy + 2, hc)
        for k in range(4):
            p.ell(cx + hw - 1, hy + k * 3, cx + hw + 3, hy + 3 + k * 3, shade(hc, 1.0 if k % 2 else 1.15))
        p.line(cx - 3, hy - 7, cx + 2, hy - 7, shade(hc, 1.3))
    elif hair == 'bun':
        p.ell(cx - hw - 1, hy - 7, cx + hw + 1, hy - 1, hc)
        p.ell(cx - 3, hy - 11, cx + 3, hy - 6, hc)
        p.rect(cx - hw - 1, hy - 3, cx - hw, hy + 1, hc); p.rect(cx + hw, hy - 3, cx + hw + 1, hy + 1, hc)

    # visage
    ec = s.get('eye', hexc('3a2a1a'))
    ey = hy + 1
    if s.get('stern'):
        p.line(cx - 4, ey - 2, cx - 2, ey - 1, shade(s.get('brow', hc), 0.8)); p.line(cx + 4, ey - 2, cx + 2, ey - 1, shade(s.get('brow', hc), 0.8))
    else:
        p.line(cx - 4, ey - 2, cx - 2, ey - 2, shade(s.get('brow', hc), 0.8)); p.line(cx + 2, ey - 2, cx + 4, ey - 2, shade(s.get('brow', hc), 0.8))
    p.rect(cx - 4, ey, cx - 3, ey + 1, ec); p.rect(cx + 2, ey, cx + 3, ey + 1, ec)
    p.px(cx - 4, ey, WHITE); p.px(cx + 2, ey, WHITE)
    mouth = s.get('mouth', 'smile')
    if mouth == 'smile':
        p.line(cx - 2, hy + 4, cx + 1, hy + 4, shade(skin, 0.6)); p.px(cx - 3, hy + 3, shade(skin, 0.6)); p.px(cx + 2, hy + 3, shade(skin, 0.6))
    elif mouth == 'grin':
        p.rect(cx - 2, hy + 3, cx + 2, hy + 4, WHITE); p.line(cx - 3, hy + 3, cx + 3, hy + 3, shade(skin, 0.55))
        p.px(cx - 2, hy + 5, WHITE); p.px(cx + 2, hy + 5, WHITE)  # crocs
    elif mouth == 'flat':
        p.line(cx - 2, hy + 4, cx + 1, hy + 4, shade(skin, 0.6))
    elif mouth == 'smirk':
        p.line(cx - 1, hy + 4, cx + 2, hy + 4, shade(skin, 0.6)); p.px(cx + 3, hy + 3, shade(skin, 0.6))
    elif mouth == 'perfect':
        p.rect(cx - 3, hy + 3, cx + 3, hy + 4, WHITE); p.line(cx - 4, hy + 3, cx + 4, hy + 3, shade(skin, 0.55)); p.px(cx - 4, hy + 2, shade(skin, 0.55)); p.px(cx + 4, hy + 2, shade(skin, 0.55))
    if s.get('freckles'):
        for (dx, dy) in [(-4, 3), (-3, 2), (3, 2), (4, 3)]:
            p.px(cx + dx, hy + dy, shade(skin, 0.8))
    if s.get('scar') == 'oeil':
        p.line(cx - 5, ey - 4, cx - 2, ey + 3, hexc('b8605a'))
        p.rect(cx - 4, ey, cx - 3, ey + 1, hexc('d8d0d0'))  # œil blanchi
    if s.get('scar') == 'menton':
        p.px(cx + 1, hy + 6, hexc('c87a6a'))
    if s.get('beard'):
        bc = s['beard']
        big = s.get('beard_big')
        p.poly([(cx - hw, hy + 2), (cx - 3, hy + 3), (cx + 3, hy + 3), (cx + hw, hy + 2), (cx + hw - 1, hy + 6 + (3 if big else 0)), (cx, hy + 9 + (5 if big else 0)), (cx - hw + 1, hy + 6 + (3 if big else 0))], bc)
        p.line(cx - 2, hy + 4, cx + 1, hy + 4, shade(skin, 0.5) if mouth != 'perfect' else WHITE)
        p.line(cx - 4, hy + 3, cx - 2, hy + 3, shade(bc, 0.85)); p.line(cx + 2, hy + 3, cx + 4, hy + 3, shade(bc, 0.85))
        p.line(cx - 1, hy + 5, cx - 1, hy + 8 + (4 if big else 0), shade(bc, 1.15))
    if s.get('mustache'):
        p.line(cx - 4, hy + 3, cx - 1, hy + 2, s['mustache']); p.line(cx + 1, hy + 2, cx + 4, hy + 3, s['mustache'])
        p.px(cx - 5, hy + 2, s['mustache']); p.px(cx + 5, hy + 2, s['mustache'])
    if s.get('glasses'):
        gc = s['glasses']
        for dx in (-4, 2):
            p.ell(cx + dx - 2, ey - 2, cx + dx + 3, ey + 3, gc)
            p.ell(cx + dx - 1, ey - 1, cx + dx + 2, ey + 2, skin)
            p.rect(cx + dx, ey, cx + dx + 1, ey + 1, ec); p.px(cx + dx + 1, ey - 1, WHITE)
        p.line(cx - 1, ey, cx + 1, ey, gc)
    if s.get('pipe'):
        p.line(cx + 2, hy + 4, cx + 7, hy + 6, hexc('6a4426'))
        p.rect(cx + 7, hy + 3, cx + 9, hy + 6, hexc('4a2e18'))

    # couvre-chefs et accessoires de tête
    if s.get('veil'):
        vc = s['veil']
        p.ell(cx - hw - 2, hy - 9, cx + hw + 2, hy - 2, vc)
        p.rect(cx - hw - 3, hy - 4, cx - hw, hy + 12, vc); p.rect(cx + hw, hy - 4, cx + hw + 3, hy + 12, vc)
        p.ell(cx - 1, hy - 8, cx + 1, hy - 6, GOLD)
    if s.get('crown'):
        p.rect(cx - hw, hy - 9, cx + hw, hy - 6, GOLD)
        for k in range(-hw, hw + 1, 3):
            p.poly([(cx + k - 1, hy - 9), (cx + k + 1, hy - 9), (cx + k, hy - 13)], GOLD)
        p.px(cx, hy - 8, hexc('d83a3a')); p.px(cx - 4, hy - 8, hexc('5fd3ff')); p.px(cx + 4, hy - 8, hexc('5fd3ff'))
    if s.get('diadem'):
        p.line(cx - hw + 1, hy - 5, cx + hw - 1, hy - 5, GOLD); p.px(cx, hy - 6, hexc('8ad0ff'))
    if s.get('straw_hat'):
        p.ell(cx - hw - 6, hy - 7, cx + hw + 6, hy - 3, hexc('e8c870'))
        p.ell(cx - hw, hy - 12, cx + hw, hy - 4, hexc('d8b860'))
        p.line(cx - hw, hy - 6, cx + hw, hy - 6, hexc('b84a2a'))
    if s.get('headband'):
        p.line(cx - hw - 1, hy - 4, cx + hw + 1, hy - 4, s['headband'])
        p.line(cx - hw - 1, hy - 4, cx - hw - 4, hy + 1, s['headband'])
    if s.get('wolf_ears'):
        c = s['wolf_ears']
        for side in (-1, 1):
            p.poly([(cx + side * 2, hy - 7), (cx + side * 7, hy - 6), (cx + side * 6, hy - 14)], c)
            p.poly([(cx + side * 3, hy - 7), (cx + side * 6, hy - 7), (cx + side * 5, hy - 11)], hexc('d8a0a0'))

    # accessoires tenus
    prop = s.get('prop')
    if prop == 'sunstaff':
        x = cx + tw + 3
        p.line(x, hy - 6, x, feet - 1, hexc('8a5a32'), 2)
        p.ell(x - 4, hy - 13, x + 4, hy - 5, GOLD); p.ell(x - 2, hy - 11, x + 2, hy - 7, hexc('fff4c0'))
        for k in range(8):
            a = k / 8 * 2 * math.pi
            p.px(x + math.cos(a) * 6, hy - 9 + math.sin(a) * 6, GOLD)
    elif prop == 'book':
        p.rect(cx - 6, hy + 18, cx + 1, hy + 24, hexc('6a2a2a')); p.line(cx - 6, hy + 18, cx + 1, hy + 18, GOLD)
    elif prop == 'mug':
        p.rect(cx - 5, hy + 18, cx, hy + 24, hexc('c8a050')); p.rect(cx - 5, hy + 17, cx, hy + 18, WHITE); p.line(cx + 1, hy + 19, cx + 1, hy + 22, hexc('8a6a30'))
    elif prop == 'abacus':
        p.rect(cx - 8, hy + 17, cx + 1, hy + 24, hexc('5a3a20'))
        for r in range(3):
            for k in range(4):
                p.px(cx - 7 + k * 2, hy + 19 + r * 2, [hexc('d84a3a'), WHITE][(k + r) % 2])
    elif prop == 'pitchfork':
        x = cx + tw + 3
        p.line(x, hy - 2, x, feet - 1, hexc('8a5a32'), 1)
        p.line(x - 3, hy - 2, x + 3, hy - 2, STEEL_D)
        for k in (-3, 0, 3):
            p.line(x + k, hy - 2, x + k, hy - 8, STEEL)
    elif prop == 'shield':
        x = cx - tw - 6
        p.poly([(x - 4, hy + 10), (x + 6, hy + 10), (x + 6, hy + 24), (x + 1, hy + 30), (x - 4, hy + 24)], STEEL)
        p.poly([(x - 2, hy + 12), (x + 4, hy + 12), (x + 4, hy + 23), (x + 1, hy + 27), (x - 2, hy + 23)], hexc('2e4a9c'))
        p.line(x + 1, hy + 12, x + 1, hy + 26, GOLD); p.line(x - 2, hy + 17, x + 4, hy + 17, GOLD)
    elif prop == 'relic':
        p.ell(cx - 6, hy + 17, cx, hy + 23, hexc('8a6a3a')); p.px(cx - 3, hy + 20, hexc('b04aff')); p.px(cx - 4, hy + 19, hexc('e0a8ff'))
    if s.get('sword_hip'):
        p.line(cx + tw - 1, waist, cx + tw + 4, feet - 6, STEEL, 1); p.line(cx + tw - 2, waist - 1, cx + tw + 2, waist + 1, GOLD)
    if s.get('rings'):
        p.px(cx - tw - 2, waist + 4, GOLD); p.px(cx + tw + 2, waist + 4, GOLD)
    # ---- détails au pixel fin (HD)
    if hair not in (None, 'bald') and not s.get('veil'):
        for (x0, y0, x1, y1) in ((-4, -6, -2, -2), (-1, -7, 0, -3), (2, -6, 3, -3), (4, -5, 5, -1)):
            p.fline(cx + x0, hy + y0, cx + x1, hy + y1, shade(hc, 0.72))
        p.fline(cx - 3, hy - 6.5, cx + 1, hy - 6.5, shade(hc, 1.4))
    p.fpx(cx - 0.5, hy + 2.5, shade(skin, 0.78))                  # nez
    p.fpx(cx - 3.5, ey + 0.5, (255, 255, 255, 255)); p.fpx(cx + 2.5, ey + 0.5, (255, 255, 255, 255))
    p.fline(cx - 4.5, hy + 2.5, cx - 3.5, hy + 2.5, (min(255, skin[0] + 10), max(0, skin[1] - 14), max(0, skin[2] - 12), 255))  # joues
    p.fline(cx + 3.5, hy + 2.5, cx + 4.5, hy + 2.5, (min(255, skin[0] + 10), max(0, skin[1] - 14), max(0, skin[2] - 12), 255))
    if lower == 'robe':
        rc = s.get('robe', s['top'])
        for k in (-4, -1, 2, 5):
            p.fline(cx + k * 0.6, waist + 2, cx + k * 1.4, feet - 3, shade(rc, 0.84))
    else:
        p.fline(cx - tw + 2, waist + 4, cx - tw + 2, feet - 8, shade(s.get('legs', hexc('4a3a2a')), 1.25))
    for k in (-2, 2):
        p.fline(cx + k, hy + 10, cx + k * 1.3, waist - 3, shade(tc, 0.84))
    return outline_sel(volume(img, light=0.12, dark=0.2, grad=0.08))


PNJ = {
    'aureliath': dict(skin=SKIN['clair'], hair='bald', beard=hexc('f0ece4'), beard_big=True, mouth='perfect', top=WHITE, robe=WHITE,
                      robe_trim=GOLD, collar=GOLD, emblem='soleil', cape=hexc('f0e6c8'), prop='sunstaff', pose='staff', eye=hexc('5a7aa8'), brow=hexc('e0dcd4')),
    'elianne': dict(skin=SKIN['pale'], hair='bob', hair_c=hexc('1e1a24'), eye=hexc('d08a2a'), veil=hexc('eef0f6'), top=WHITE, robe=WHITE, robe_trim=hexc('e8c868'),
                    beads=hexc('8ad0ff'), pose='hold', mouth='smile'),
    'tobin': dict(skin=SKIN['clair'], hair='messy', hair_c=hexc('c8642a'), freckles=True, top=hexc('e8e0cc'), robe=hexc('e8e0cc'), robe_trim=hexc('3a6ac0'),
                  prop='book', pose='hold', mouth='grin' if False else 'smile', eye=hexc('4a7a3a')),
    'rowena': dict(skin=SKIN['clair'], hair='short', hair_c=hexc('a8a8b0'), scar='oeil', pipe=True, mouth='flat', stern=True, top=hexc('3a5a3a'),
                   lower='legs', legs=hexc('4a3a2a'), boots=hexc('3a2a1a'), belt=hexc('6a4426'), collar=hexc('c8a050'), pose='hips', eye=hexc('5a6a7a')),
    'kaya': dict(skin=SKIN['clair'], hair='messy', hair_c=hexc('c8ccd8'), wolf_ears=hexc('a8acb8'), tail=hexc('a8acb8'), eye=hexc('f0c020'), mouth='grin',
                 headband=hexc('c8322a'), top=hexc('7a5a3a'), lower='legs', legs=hexc('5a4430'), boots=hexc('3a2a1a'), belt=hexc('4a3020'), pose='hips', sword_hip=True),
    'halvine': dict(skin=SKIN['clair'], shorter=6, hair='bun', hair_c=hexc('8a4a2a'), glasses=hexc('6a5a3a'), top=hexc('8a3a4a'), robe=hexc('6a4a6a'),
                    apron=hexc('d8c098'), pockets=True, prop='abacus', pose='hold', mouth='smile', eye=hexc('3a5a3a')),
    'bram': dict(skin=SKIN['mate'], wide=3, hair='bald', beard=hexc('6a3a1a'), beard_big=True, top=hexc('c8b088'), lower='legs', legs=hexc('4a3a2a'),
                 apron=hexc('e8dcc4'), stains=hexc('a87a5a'), prop='mug', pose='hold', mouth='smile', arm=SKIN['mate']),
    'ferrand': dict(skin=SKIN['clair'], hair='short', hair_c=hexc('2a2026'), mustache=hexc('2a2026'), mouth='smirk', top=hexc('5a2a6a'), robe=hexc('5a2a6a'),
                    robe_trim=GOLD, collar=GOLD, rings=True, prop='relic', pose='hold', eye=hexc('3a2a1a')),
    'edmund-iv': dict(skin=SKIN['clair'], hair='short', hair_c=hexc('9a9aa0'), beard=hexc('9a9aa0'), crown=True, stern=True, mouth='flat', top=hexc('2e4a9c'),
                      robe=hexc('2e4a9c'), robe_trim=GOLD, collar=WHITE, ermine=True, cape=hexc('8a1a2a'), eye=hexc('4a5a6a')),
    'seraphine': dict(skin=SKIN['pale'], hair='long', hair_c=hexc('f0e0a8'), diadem=True, eye=hexc('6aa8e8'), mouth='smirk', top=WHITE, robe=WHITE,
                      robe_trim=GOLD, boots=hexc('6a4426'), pose='down'),
    'gareth': dict(skin=SKIN['mate'], hair='short', hair_c=hexc('6a4a2a'), straw_hat=True, top=hexc('c8a070'), lower='legs', overalls=hexc('3a5a8a'),
                   legs=hexc('3a5a8a'), boots=hexc('4a3020'), prop='pitchfork', pose='staff', mouth='smile', beard=None, arm=SKIN['mate']),
    'intendant-guilde': dict(skin=SKIN['brun'], wide=2, hair='short', hair_c=hexc('3a2a1a'), beard=hexc('3a2a1a'), top=hexc('6a4a2a'), lower='legs',
                             legs=hexc('4a3a2a'), boots=hexc('2a1e18'), apron=hexc('5a3420'), belt=hexc('8a6a3a'), prop='book', pose='hold', stern=True, mouth='flat'),
}
COMPAGNES = {
    'aveline': dict(skin=SKIN['clair'], hair='braid', hair_c=hexc('b8642a'), eye=hexc('7a9a8a'), scar='menton', stern=True, mouth='flat', top=STEEL,
                    armor=STEEL, armor_trim=GOLD, cape=hexc('2e4a9c'), lower='legs', legs=STEEL_D, boots=hexc('6a7488'), belt=hexc('2e4a9c'),
                    prop='shield', sword_hip=True, pose='down'),
}


def build(out='../../../assets'):
    res = {}
    for group, d in (('pnj', PNJ), ('compagnes', COMPAGNES)):
        for k, s in d.items():
            os.makedirs(f'{out}/personnages/{group}/{k}', exist_ok=True)
            npc(s).save(f'{out}/personnages/{group}/{k}/decor.png')
            res[k] = f'personnages/{group}/{k}/decor.png'
    return res


if __name__ == '__main__':
    print(list(build('../../../assets')))
