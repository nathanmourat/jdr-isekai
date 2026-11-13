"""Héros : planches de combat (64×64, vue de côté, tournés vers la droite)
et d'exploration (32×32, 4 directions)."""
import math
from PIL import Image
from px import *

# ---------------------------------------------------------------- palettes
SKIN = [hexc('f2c9a0'), hexc('d9a273'), hexc('a8714a'), hexc('f5d7bd')]
STEEL = hexc('c9d3e0')
STEEL_D = hexc('7d8aa0')
GOLD = hexc('e8b83c')
WOOD = hexc('8a5a32')
LEATHER = hexc('6b4426')

CLASSES = {
    'lame-runique': dict(
        skin=SKIN[0], hair=hexc('3a2a22'), hair_style='short', top=hexc('3d5c8c'), top2=STEEL,
        legs=hexc('4a3b30'), boots=hexc('2e2420'), weapon='sword', runes=hexc('5fd3ff'),
        magic=hexc('5fd3ff'), attack='melee', armor='light', belt=LEATHER),
    'arcaniste': dict(
        skin=SKIN[0], hair=hexc('c94f2a'), hair_style='long', top=hexc('7a2e3a'), top2=hexc('e0a34a'),
        legs=hexc('5a2430'), boots=hexc('3a2020'), weapon='staff', robe=hexc('7a2e3a'),
        orb=hexc('8fe8ff'), magic=hexc('ff8a3a'), magic2=hexc('a8ecff'), attack='bolt', floaters=True),
    'invocateur': dict(
        skin=SKIN[0], hair=hexc('2a2a2a'), hair_style='short', hood_down=hexc('2f5a3a'), top=hexc('2f5a3a'),
        top2=hexc('c9b26a'), legs=hexc('2a3a2a'), boots=hexc('2a2420'), weapon='grimoire',
        robe=hexc('2f5a3a'), magic=hexc('6dff8a'), attack='bolt', circle=True),
    'ombre': dict(
        skin=SKIN[0], hair=hexc('1e1e28'), hair_style='messy', hood_down=hexc('2b2838'), top=hexc('2b2838'),
        top2=hexc('5a2a48'), legs=hexc('24222e'), boots=hexc('18161e'), weapon='daggers',
        scarf=hexc('8a2a3a'), magic=hexc('a070ff'), attack='daggers'),
    'gardien': dict(
        skin=SKIN[0], hair=hexc('d8c070'), hair_style='short', top=hexc('eef0f4'), top2=GOLD,
        legs=hexc('c8ccd6'), boots=hexc('9aa0ac'), weapon='mace', shield=True, armor='heavy',
        circlet=True, magic=hexc('ffe27a'), attack='melee'),
    'alchimiste': dict(
        skin=SKIN[0], hair=hexc('7a4a24'), hair_style='messy', top=hexc('a0703a'), top2=hexc('5a7a8a'),
        legs=hexc('4a4a5a'), boots=hexc('3a2a20'), weapon='wrench', goggles=True, apron=hexc('c8a070'),
        vials=True, magic=hexc('9dff5a'), attack='melee'),
    'archer': dict(
        skin=SKIN[0], hair=hexc('2a1a12'), hair_style='tail', top=hexc('3f7a3a'), top2=hexc('7aa84a'),
        legs=hexc('4a3a24'), boots=hexc('3a2a1a'), weapon='bow', quiver=True, magic=hexc('9ff0ff'),
        attack='bow', cape=hexc('2e5a2a')),
    'guerisseur': dict(
        skin=SKIN[0], hair=hexc('e8d8a8'), hair_style='long', top=hexc('f0ece0'), top2=GOLD,
        legs=hexc('d8d0bc'), boots=hexc('8a6a4a'), weapon='sunstaff', robe=hexc('f0ece0'),
        satchel=hexc('8a5a32'), magic=hexc('8dffb0'), magic2=hexc('ffe27a'), attack='bolt'),
    'berserker': dict(
        skin=SKIN[0], hair=hexc('b83a20'), hair_style='wild', top=hexc('b8322a'), top2=hexc('6a1a1a'),
        legs=hexc('3a2a22'), boots=hexc('2a1e18'), weapon='axe', scales=True, magic=hexc('ff6a2a'),
        attack='melee', bare_arms=True),
    'barde': dict(
        skin=SKIN[0], hair=hexc('d89a3a'), hair_style='short', top=hexc('3a6ad0'), top2=hexc('e8c03a'),
        legs=hexc('c03a5a'), boots=hexc('4a2a1a'), weapon='lute', band=hexc('8a2ac0'),
        feather=hexc('f0f0f0'), cape=hexc('c03a5a'), magic=hexc('ffd84a'), attack='notes'),
}

# position de repos de l'arme : (angle du bras, angle de l'arme)
REST = {
    'sword': (60, -40), 'staff': (15, -78), 'grimoire': (20, 0), 'daggers': (55, -20),
    'mace': (60, -50), 'wrench': (60, -45), 'bow': (20, -90), 'sunstaff': (15, -78),
    'axe': (65, -55), 'lute': (40, -30), 'spear': (30, -20), 'brokensword': (60, -40),
}


# ---------------------------------------------------------------- dessin de l'arme
def draw_weapon(p, s, hx, hy, wa, front=True):
    w = s['weapon']
    ca, sa = math.cos(math.radians(wa)), math.sin(math.radians(wa))

    def at(t):
        return hx + ca * t, hy + sa * t

    if w == 'sword':
        x0, y0 = at(-2); x1, y1 = at(15)
        p.line(x0, y0, *at(1), LEATHER, 2)
        p.line(*at(2), x1, y1, STEEL, 2)
        p.line(*at(3), *at(14), shade(STEEL, 1.25), 1)
        gx, gy = at(1.5)
        p.line(gx - sa * 3, gy + ca * 3, gx + sa * 3, gy - ca * 3, GOLD, 1)
        if s.get('runes'):
            for t in (5, 8, 11):
                p.px(*at(t), s['runes'])
    elif w in ('staff', 'sunstaff'):
        p.line(*at(-9), *at(14), WOOD, 2)
        tx, ty = at(15)
        if w == 'staff':
            p.ell(tx - 2, ty - 2, tx + 2, ty + 2, s['orb'])
            p.px(tx - 1, ty - 1, (255, 255, 255, 255))
        else:
            p.ell(tx - 3, ty - 3, tx + 3, ty + 3, GOLD)
            for k in range(8):
                a = k * math.pi / 4
                p.px(tx + math.cos(a) * 4.5, ty + math.sin(a) * 4.5, GOLD)
            p.ell(tx - 1, ty - 1, tx + 1, ty + 1, hexc('fff4c0'))
    elif w == 'grimoire':
        p.rect(hx - 1, hy - 4, hx + 6, hy + 1, hexc('5a3a1a'))
        p.rect(hx, hy - 4, hx + 2, hy, hexc('f0e8d0'))
        p.rect(hx + 3, hy - 4, hx + 5, hy, hexc('e8dcc0'))
        p.px(hx + 1, hy - 2, s['magic']); p.px(hx + 4, hy - 3, s['magic'])
    elif w == 'daggers':
        p.line(*at(-1), *at(1), LEATHER, 2)
        p.line(*at(2), *at(8), STEEL, 2)
        p.px(*at(8), shade(STEEL, 1.3))
    elif w == 'mace':
        p.line(*at(-2), *at(10), WOOD, 2)
        tx, ty = at(12)
        p.ell(tx - 3, ty - 3, tx + 3, ty + 3, GOLD)
        for k in range(4):
            a = k * math.pi / 2 + math.radians(wa)
            p.px(tx + math.cos(a) * 4, ty + math.sin(a) * 4, shade(GOLD, 0.7))
    elif w == 'wrench':
        p.line(*at(-2), *at(10), STEEL_D, 2)
        tx, ty = at(12)
        p.ell(tx - 3, ty - 3, tx + 3, ty + 3, STEEL)
        p.px(tx + ca * 2, ty + sa * 2, (0, 0, 0, 0))
        p.rect(tx + ca * 2 - 1, ty + sa * 2 - 1, tx + ca * 2, ty + sa * 2, (0, 0, 0, 0))
    elif w == 'axe':
        p.line(*at(-3), *at(14), WOOD, 2)
        tx, ty = at(12)
        nx, ny = -sa, ca  # normale
        pts = [(tx - ca * 3, ty - sa * 3), (tx + ca * 3, ty + sa * 3),
               (tx + ca * 5 + nx * 7, ty + sa * 5 + ny * 7), (tx - ca * 5 + nx * 7, ty - sa * 5 + ny * 7)]
        p.poly(pts, STEEL)
        p.line(tx + ca * 5 + nx * 7, ty + sa * 5 + ny * 7, tx - ca * 5 + nx * 7, ty - sa * 5 + ny * 7,
               shade(STEEL, 1.3), 1)
    elif w == 'bow':
        # arc vertical tenu à la main
        for k in range(-10, 11):
            yy = hy + k
            xx = hx + 3 - (k * k) / 33.0
            p.rect(xx, yy, xx + 1, yy, WOOD)
        p.line(hx - 1, hy - 10, hx - 1, hy + 10, hexc('e0e0d0'), 1)
    elif w == 'spear':
        p.line(*at(-12), *at(10), hexc('6a4a2a'), 2)
        tx, ty = at(11)
        p.poly([(tx - sa * 2, ty + ca * 2), (tx + sa * 2, ty - ca * 2), (tx + ca * 6, ty + sa * 6)], hexc('9a5a3a'))
        p.px(tx + ca * 3, ty + sa * 3, hexc('c87a4a'))
    elif w == 'brokensword':
        p.line(*at(-2), *at(1), LEATHER, 2)
        p.line(*at(2), *at(9), hexc('a09a8a'), 2)
        p.px(*at(10), hexc('a09a8a'))
        gx, gy = at(1.5)
        p.line(gx - sa * 3, gy + ca * 3, gx + sa * 3, gy - ca * 3, hexc('8a6a3a'), 1)
        p.px(*at(5), hexc('9a5a3a'))
    elif w == 'lute':
        bx, by = hx - 4, hy + 2
        p.ell(bx - 4, by - 3, bx + 4, by + 4, hexc('b87a3a'))
        p.ell(bx - 1, by - 1, bx + 1, by + 1, hexc('3a2010'))
        p.line(bx + 3, by - 2, bx + 12, by - 8, hexc('6a4020'), 2)
        p.rect(bx + 11, by - 10, bx + 13, by - 8, hexc('4a2a10'))


# ---------------------------------------------------------------- figure de côté
def figure(s, dx=0, dy=0, lean=0, fa=None, ba=None, wa=None, fl=2, bl=-2, crouch=0,
           show_weapon=True, cell=64, race=None, only=False, ph=0):
    img = new(cell, cell)
    p = P(img)
    rest_a, rest_w = REST[s['weapon']]
    fa = rest_a if fa is None else fa
    wa = rest_w if wa is None else wa
    ba = 80 if ba is None else ba
    cx = 30 + dx
    hip = 47 + crouch
    top = 34 + dy + crouch
    hx = cx + 1 + lean  # centre tête
    hy = 26 + dy + crouch
    skin = s['skin']
    topc = s['top']
    legs = s['legs']
    boots = s['boots']
    if only:
        if race:
            draw_race_side(p, race, cx, hip, top, hx, hy, ph, lean)
        img = outline(img)
        if race:
            draw_race_side(P(img), race, cx, hip, top, hx, hy, ph, lean, decal=True)
        return img

    # cape (derrière)
    if s.get('cape'):
        c = s['cape']
        p.poly([(cx - 3 + lean, top), (cx + 2 + lean, top), (cx - 4, hip + 8), (cx - 9 - lean, hip + 6)], c)
        p.line(cx - 4 + lean, top + 1, cx - 9 - lean, hip + 5, shade(c, 0.75), 1)

    # carquois
    if s.get('quiver'):
        p.poly([(cx - 7, top - 3), (cx - 4, top - 4), (cx - 2, top + 9), (cx - 5, top + 10)], LEATHER)
        for k in range(3):
            p.line(cx - 6 + k, top - 4, cx - 7 + k, top - 7, hexc('e0e0d0'))
            p.px(cx - 7 + k, top - 8, s['magic'])

    # jambe arrière
    def leg(x, foot_dx, c, bc):
        fx = x + foot_dx
        p.line(x, hip, fx, 58, c, 3)
        p.rect(fx - 1, 57, fx + 3, 59, bc)

    leg(cx - 2, bl, shade(legs, 0.8), shade(boots, 0.8))

    # bras arrière
    sx, sy = cx - 1 + lean, top + 2
    bax = sx + math.cos(math.radians(ba)) * 8
    bay = sy + math.sin(math.radians(ba)) * 8
    arm_c = skin if s.get('bare_arms') else shade(topc, 0.75)
    p.thick(sx, sy, bax, bay, arm_c, 1)
    p.rect(bax - 1, bay - 1, bax, bay, shade(skin, 0.85))
    if s['weapon'] == 'daggers' and show_weapon:
        draw_weapon(p, s, bax, bay, wa + 25)

    # torse
    tl = lean
    p.poly([(cx - 5 + tl, top), (cx + 5 + tl, top), (cx + 5, hip), (cx - 5, hip)], topc)
    p.line(cx + 4 + tl, top + 1, cx + 4, hip - 1, shade(topc, 1.25), 1)
    p.line(cx - 5 + tl, top, cx - 5, hip, shade(topc, 0.75), 1)
    if s.get('armor') == 'light':
        p.rect(cx - 4 + tl, top + 1, cx + 3 + tl, top + 6, s['top2'])
        p.line(cx - 3 + tl, top + 2, cx + 2 + tl, top + 2, shade(s['top2'], 1.2))
    if s.get('armor') == 'heavy':
        p.rect(cx - 5 + tl, top, cx + 5 + tl, top + 3, shade(topc, 0.92))
        p.line(cx + tl, top + 4, cx, hip - 2, s['top2'], 1)
        p.line(cx - 3 + tl, top + 7, cx + 3 + tl, top + 7, s['top2'], 1)
        # épaulières
        p.ell(cx - 7 + tl, top - 2, cx - 1 + tl, top + 3, topc)
    if s.get('scales'):
        for yy in range(top + 2, hip - 2, 3):
            for xx in range(cx - 4 + tl, cx + 4 + tl, 3):
                p.px(xx, yy, shade(topc, 1.3)); p.px(xx + 1, yy + 1, s['top2'])
    if s.get('apron'):
        p.rect(cx - 2 + tl, top + 3, cx + 5, hip + 3, s['apron'])
    if s.get('vials') or s.get('belt'):
        p.rect(cx - 5, hip - 3, cx + 5, hip - 2, s.get('belt', LEATHER))
    if s.get('vials'):
        for k, vc in enumerate([hexc('ff4a4a'), hexc('4aff7a'), hexc('4a9aff')]):
            p.rect(cx - 4 + k * 3, hip - 5, cx - 3 + k * 3, hip - 3, vc)
    if s.get('satchel'):
        p.rect(cx - 6, hip - 4, cx - 2, hip, s['satchel'])
        p.line(cx - 4 + tl, top, cx + 3, hip - 4, shade(s['satchel'], 0.8), 1)
    if s.get('top2') and not s.get('armor') and not s.get('scales'):
        p.line(cx + tl, top, cx, hip - 3, s['top2'], 1)  # galon

    # robe
    if s.get('robe'):
        rc = s['robe']
        p.poly([(cx - 5, hip - 3), (cx + 5, hip - 3), (cx + 8, 57), (cx - 8, 57)], rc)
        p.line(cx + 7, 56, cx + 4, hip - 2, shade(rc, 1.2))
        p.line(cx - 8, 57, cx + 8, 57, s.get('top2', shade(rc, 0.7)))

    # jambe avant
    if not s.get('robe'):
        leg(cx + 2, fl, legs, boots)
    else:
        p.rect(cx + 2 + fl - 1, 57, cx + 2 + fl + 3, 59, boots)
        p.rect(cx - 2 + bl - 1, 57, cx - 2 + bl + 3, 59, shade(boots, 0.8))

    if s.get('hood_down'):
        c = s['hood_down']
        p.ell(hx - 9, hy + 2, hx + 1, hy + 9, c)
        p.line(hx - 8, hy + 3, hx - 2, hy + 3, shade(c, 1.25))
    # tête
    p.ell(hx - 6, hy - 6, hx + 6, hy + 6, skin)
    p.ell(hx - 5, hy + 4, hx + 4, hy + 6, shade(skin, 0.85))
    p.rect(hx + 3, hy - 1, hx + 4, hy + 1, (34, 30, 48, 255))  # œil
    p.px(hx + 4, hy - 1, (255, 255, 255, 255))
    hs = s['hair_style']
    hc = s['hair']
    if hs in ('short', 'messy', 'wild', 'tail', 'long'):
        p.ell(hx - 7, hy - 8, hx + 6, hy - 2, hc)
        p.rect(hx - 7, hy - 4, hx - 2, hy + 3, hc)
        p.px(hx + 5, hy - 2, hc)
        p.line(hx - 4, hy - 7, hx + 3, hy - 7, shade(hc, 1.3))
        if hs == 'messy':
            for k in range(-6, 6, 3):
                p.px(hx + k, hy - 9, hc)
        if hs == 'wild':
            for k in range(-8, 6, 2):
                p.line(hx + k, hy - 7, hx + k - 2, hy - 11 + (k % 3), hc, 1)
            p.rect(hx - 9, hy - 2, hx - 5, hy + 6, hc)
        if hs == 'tail':
            p.line(hx - 6, hy - 3, hx - 11, hy + 6, hc, 2)
        if hs == 'long':
            p.rect(hx - 8, hy - 3, hx - 3, hy + 12, hc)
            p.line(hx - 8, hy, hx - 8, hy + 12, shade(hc, 0.8))
    if hs == 'hood':
        c = s['hood']
        p.ell(hx - 8, hy - 8, hx + 6, hy + 5, c)
        p.ell(hx - 1, hy - 4, hx + 6, hy + 5, skin)
        p.line(hx - 6, hy - 6, hx + 2, hy - 7, shade(c, 1.25))
        p.rect(hx + 3, hy - 1, hx + 4, hy + 1, (34, 30, 48, 255))
        p.poly([(hx - 7, hy - 2), (hx - 12, hy + 5), (hx - 5, hy + 6)], c)
        if s['weapon'] == 'daggers':
            p.rect(hx + 1, hy - 3, hx + 4, hy - 2, shade(c, 0.6))
            p.rect(hx + 3, hy - 2, hx + 4, hy - 1, (230, 60, 255, 255))
    if s.get('scarf'):
        sc = s['scarf']
        p.rect(hx - 3, hy + 2, hx + 6, hy + 6, sc)
        p.poly([(hx - 5, hy + 3), (hx - 12, hy + 8 - (dy % 2)), (hx - 10, hy + 10), (hx - 4, hy + 6)], sc)
    if s.get('helmet'):
        p.ell(hx - 7, hy - 8, hx + 6, hy + 0, STEEL)
        p.rect(hx - 7, hy - 4, hx - 3, hy + 3, STEEL)
        p.line(hx - 6, hy - 1, hx + 5, hy - 1, GOLD)
        p.line(hx - 3, hy - 9, hx + 1, hy - 9, GOLD)
    if s.get('circlet'):
        p.line(hx - 1, hy - 3, hx + 6, hy - 3, GOLD)
        p.px(hx + 4, hy - 4, hexc('5fd3ff'))
    if s.get('band'):
        p.line(hx - 1, hy - 3, hx + 6, hy - 3, s['band'])
        p.line(hx - 6, hy - 5, hx - 12, hy - 4, s['feather'], 2)
        p.px(hx - 6, hy - 5, s['band'])
    if s.get('goggles'):
        p.line(hx - 6, hy - 4, hx + 6, hy - 4, LEATHER, 2)
        p.ell(hx + 1, hy - 6, hx + 6, hy - 2, hexc('8ad0e0'))
        p.px(hx + 4, hy - 5, (255, 255, 255, 255))
    if s.get('hat'):
        c = s['hat']
        p.line(hx - 9, hy - 5, hx + 8, hy - 5, c, 2)
        p.ell(hx - 6, hy - 11, hx + 4, hy - 4, c)
        p.line(hx - 5, hy - 6, hx + 3, hy - 6, s['top2'])
        p.line(hx - 5, hy - 8, hx - 12, hy - 15, s['feather'], 2)
    # œil redessiné par-dessus cheveux/casque
    if s.get('ears'):
        p.poly([(hx - 4, hy - 2), (hx - 13, hy - 6), (hx - 4, hy + 2)], skin)
        p.line(hx - 5, hy - 1, hx - 10, hy - 4, shade(skin, 0.8))
    if s.get('nose'):
        p.poly([(hx + 5, hy), (hx + 9, hy + 2), (hx + 5, hy + 3)], skin)
    if hs not in ('hood',):
        ec = s.get('eye', (34, 30, 48, 255))
        if s.get('skull'):
            p.rect(hx + 1, hy - 2, hx + 4, hy + 1, (20, 18, 26, 255))
            p.rect(hx + 2, hy - 1, hx + 3, hy, ec)
            p.line(hx - 1, hy + 4, hx + 5, hy + 4, (20, 18, 26, 255))
            for k in range(0, 6, 2):
                p.px(hx + k, hy + 5, (20, 18, 26, 255))
        else:
            p.rect(hx + 3, hy - 1, hx + 4, hy + 1, ec if s.get('eye') else (34, 30, 48, 255))
            p.px(hx + 4, hy - 1, (255, 255, 255, 255) if not s.get('eye') else shade(ec, 1.4))
            if not s.get('nose'):
                p.px(hx + 5, hy, skin); p.px(hx + 5, hy + 1, skin)
    if s.get('marks'):
        mc = s['marks']
        p.line(hx - 2, hy - 4, hx + 1, hy + 2, mc); p.px(hx + 2, hy + 3, mc)

    # bras avant + arme
    fx0, fy0 = cx + 1 + lean, top + 2
    fhx = fx0 + math.cos(math.radians(fa)) * 9
    fhy = fy0 + math.sin(math.radians(fa)) * 9
    if s['weapon'] == 'lute' and show_weapon:
        draw_weapon(p, s, cx + 4 + lean, top + 6, wa)
    p.thick(fx0, fy0, fhx, fhy, skin if s.get('bare_arms') else topc, 1)
    if s.get('armor') == 'heavy':
        p.ell(fx0 - 3, fy0 - 3, fx0 + 3, fy0 + 2, s['top'])
        p.px(fx0, fy0 - 2, GOLD)
    p.rect(fhx - 1, fhy - 1, fhx, fhy, skin)
    if show_weapon and s['weapon'] != 'lute':
        draw_weapon(p, s, fhx, fhy, wa)
    if s.get('marks'):
        p.px((fx0 + fhx) / 2, (fy0 + fhy) / 2, s['marks'])
    if s.get('brokenshield') and show_weapon:
        sxx = cx + 6 + lean
        bc = hexc('7a5a3a')
        p.poly([(sxx, top), (sxx + 6, top + 2), (sxx + 6, top + 8), (sxx + 3, top + 6), (sxx + 2, top + 12), (sxx, top + 10)], bc)
        p.line(sxx + 1, top + 1, sxx + 1, top + 9, hexc('9a7a4a'))
        p.px(sxx + 4, top + 4, hexc('5a3a20'))
    if s.get('shield') and show_weapon:
        sxx = cx + 6 + lean
        p.poly([(sxx, top - 1), (sxx + 6, top - 1), (sxx + 6, top + 9), (sxx + 3, top + 14), (sxx, top + 9)], STEEL)
        p.poly([(sxx + 1, top), (sxx + 5, top), (sxx + 5, top + 9), (sxx + 3, top + 12), (sxx + 1, top + 9)], hexc('f4f4f8'))
        p.line(sxx + 3, top + 1, sxx + 3, top + 11, GOLD)
        p.line(sxx + 1, top + 4, sxx + 5, top + 4, GOLD)
    return outline(img)


# ---------------------------------------------------------------- effets non contourés
def glow(img, x, y, r, c, core=(255, 255, 255, 255)):
    p = P(img)
    p.ell(x - r, y - r, x + r, y + r, (c[0], c[1], c[2], 150))
    if r > 2:
        p.ell(x - r + 2, y - r + 2, x + r - 2, y + r - 2, c)
    p.ell(x - max(1, r // 3), y - max(1, r // 3), x + max(1, r // 3), y + max(1, r // 3), core)
    return img


def sparkle(img, x, y, c, n=2):
    p = P(img)
    for k in range(-n, n + 1):
        p.px(x + k, y, c); p.px(x, y + k, c)
    p.px(x, y, (255, 255, 255, 255))
    return img


def ground_circle(img, c, phase):
    p = P(img)
    a = (c[0], c[1], c[2], 170)
    for k in range(24):
        ang = k / 24 * 2 * math.pi + phase
        x = 30 + math.cos(ang) * 16
        y = 59 + math.sin(ang) * 3.5
        if k % 2 == 0:
            p.px(x, y, a)
    return img


def _rot_big(img, deg, pivot):
    big = new(img.width * 2, img.height * 2)
    big.alpha_composite(img, (img.width // 2, img.height // 2))
    return big.rotate(deg, resample=Image.NEAREST, center=(pivot[0] + img.width // 2, pivot[1] + img.height // 2))


def lay_offset(img, deg, pivot=(30, 58), ground=60):
    """Décalage qui recentre le sprite tourné et le pose au sol (calculé sur un corps de référence)."""
    big = _rot_big(img, deg, pivot)
    a = np.array(big)[:, :, 3]
    ys, xs = np.where(a > 0)
    x0, x1, y1 = xs.min(), xs.max(), ys.max()
    return (img.width - (x1 - x0 + 1)) // 2 - x0, ground - 1 - y1


def lay(img, deg, pivot=(30, 58), ground=60, off=None):
    """Fait pivoter le sprite (K.O.) sur une toile plus grande, puis applique un décalage.
    Avec off=None, le décalage est calculé sur l'image elle-même ; sinon il est imposé
    (même décalage pour toutes les classes et pour les calques de race)."""
    if off is None:
        off = lay_offset(img, deg, pivot, ground)
    big = _rot_big(img, deg, pivot)
    ox, oy = off
    shifted = new(big.width + 2 * img.width, big.height + 2 * img.height)
    shifted.alpha_composite(big, (img.width + ox, img.height + oy))
    return shifted.crop((img.width, img.height, img.width * 2, img.height * 2))


def settle(img, ground=60):
    """Après rotation (K.O.), pose le personnage au sol."""
    a = np.array(img)[:, :, 3]
    ys = np.where(a.max(axis=1) > 0)[0]
    if len(ys) == 0:
        return img
    shift = ground - 1 - ys.max()
    out = new(img.width, img.height)
    out.alpha_composite(img, (0, int(shift)))
    return out


# ---------------------------------------------------------------- animations
# Trajectoire du CORPS commune à toutes les classes : (dx, dy, lean, crouch) pour chaque image.
# La tête et le bassin sont ainsi au même pixel dans les 10 planches, ce qui permet
# aux calques de race de se superposer à n'importe quelle classe. Seuls bras, jambes et armes varient.
BODY = {
    'idle':   [(0, 0, 0, 0), (0, 0, 0, 0), (0, 1, 0, 0), (0, 1, 0, 0)],
    'attack': [(-1, 0, -1, 0), (-2, 0, -2, 0), (2, 0, 1, 0), (4, 0, 2, 0), (4, 0, 2, 0), (1, 0, 1, 0)],
    'cast':   [(0, 0, 0, 0), (0, -1, 0, 0), (0, -1, 0, 0), (0, 0, 0, 0)],
    'hit':    [(-3, 0, -2, 0), (-2, 0, -1, 0)],
    'ko0':    [(0, 0, -2, 4)],
    'victory': [(0, 0, 0, 0), (0, -2, 0, 0), (0, -3, 0, 0), (0, -1, 0, 0)],
}
KO_ANGLES = [45, 90]
_KO_OFF = {}


def ko_offset(deg):
    """Décalage des images K.O. couchées, calculé une fois sur un corps de référence sans arme."""
    if deg not in _KO_OFF:
        ref = figure(CLASSES['lame-runique'], fa=100, wa=80, show_weapon=False)
        _KO_OFF[deg] = lay_offset(ref, deg)
    return _KO_OFF[deg]


def B(row, i):
    dx, dy, lean, crouch = BODY[row][i]
    return dict(dx=dx, dy=dy, lean=lean, crouch=crouch)


def combat_frames(s):
    rows = []
    ra, rw = REST[s['weapon']]
    mag = s['magic']
    kind = s['attack']
    # 1 attente
    idle = []
    for i in range(4):
        d = BODY['idle'][i][1]
        im = figure(s, fa=ra + d * 2, **B('idle', i))
        if s.get('floaters'):
            P(im).px(44, 24 + (i % 2), s['magic']); P(im).px(14, 30 - (i % 2), s['magic2'])
            P(im).px(45, 30 + ((i + 1) % 2), s['magic2'])
        idle.append(im)
    rows.append(idle)

    # 2 attaque (bras et arme selon la classe, corps commun)
    att = []
    for i in range(6):
        b = B('attack', i)
        x0 = b['dx']
        stride = dict(fl=4, bl=-4) if i >= 2 else dict(fl=2, bl=-2)
        if kind == 'melee':
            a, w = [(-100, -110), (-125, -135), (-50, -55), (10, 5), (40, 35), (25, 0)][i]
            im = figure(s, fa=a, wa=w, **stride, **b)
            if i in (3, 4):
                p = P(im)
                for k in range(-60, 50, 12):
                    ang = math.radians(k)
                    p.px(31 + x0 + math.cos(ang) * 20, 36 + math.sin(ang) * 20, (255, 255, 255, 200 if i == 3 else 110))
        elif kind == 'thrust':
            a, w = [(40, 0), (70, 5), (10, -5), (0, -5), (5, -5), (25, -15)][i]
            im = figure(s, fa=a, wa=w, **stride, **b)
            if i == 3:
                p = P(im)
                for k in range(3):
                    p.line(48, 30 + k * 4, 60, 31 + k * 4, (255, 255, 255, 170))
        elif kind == 'daggers':
            a, w = [(40, -30), (-60, -40), (20, 0), (70, -20), (-20, -10), (50, -20)][i]
            im = figure(s, fa=a, wa=w, ba=a + 60, fl=4, bl=-4, **b)
            if i in (2, 4):
                p = P(im)
                for k in range(8):
                    p.px(40 + x0 + k, 30 + k if i == 2 else 44 - k, (255, 255, 255, 220))
        elif kind == 'bolt':
            a = [30, 0, -10, -10, 0, 20][i]
            w = [rw, -60, -40, -40, -60, rw][i] if s['weapon'] != 'grimoire' else 0
            im = figure(s, fa=a, wa=w, **b)
            if s.get('circle'):
                ground_circle(im, mag, i * 0.4)
            if i in (2, 3, 4):
                glow(im, [46, 52, 58][i - 2], 34, [3, 4, 4][i - 2], mag)
        elif kind == 'bow':
            im = figure(s, fa=0, wa=-90, ba=[10, 5, 0, 0, 15, 40][i], **b)
            p = P(im)
            hx, hy = 31 + x0 + b['lean'] + 9, 36
            if i in (1, 2):
                pull = 3 + i * 2
                p.line(hx - pull, hy, hx + 4, hy, hexc('e0e0d0'))
                p.px(hx + 5, hy, s['magic'])
                p.line(hx - 1, hy - 10, hx - pull, hy, hexc('e0e0d0'))
                p.line(hx - 1, hy + 10, hx - pull, hy, hexc('e0e0d0'))
            if i in (3, 4):
                ax = 50 + (i - 3) * 6
                p.line(ax, hy, ax + 5, hy, hexc('e0e0d0'))
                p.px(ax + 6, hy, s['magic']); p.px(ax + 7, hy, (255, 255, 255, 255))
                for k in range(3):
                    p.px(ax - 2 - k * 2, hy, (s['magic'][0], s['magic'][1], s['magic'][2], 160 - k * 50))
        elif kind == 'notes':
            im = figure(s, fa=[40, 55, 40, 55, 40, 50][i], **b)
            p = P(im)
            for j in range(i):
                nx = 44 + x0 + j * 4
                ny = 30 - ((j * 5 + i * 3) % 7)
                if nx < 62:
                    p.rect(nx, ny + 3, nx + 1, ny + 4, mag)
                    p.line(nx + 1, ny, nx + 1, ny + 3, mag)
                    p.px(nx + 2, ny, mag)
        att.append(im)
    rows.append(att)

    # 3 sort / compétence
    cast = []
    for i in range(4):
        a = [-20, -45, -60, -60][i]
        w = rw if s['weapon'] in ('grimoire', 'bow', 'lute') else -80
        b = B('cast', i)
        im = figure(s, fa=a if s['weapon'] != 'lute' else 40, wa=w, **b)
        hx = 31 + math.cos(math.radians(a)) * 9
        hy = 36 + b['dy'] + math.sin(math.radians(a)) * 9
        if s.get('circle') or s['weapon'] in ('sunstaff', 'mace'):
            ground_circle(im, mag, i * 0.5)
        r = [2, 3, 5, 4][i]
        if s['weapon'] == 'lute':
            glow(im, 42, 36, r, mag)
        else:
            glow(im, hx + 3, hy - 3, r, mag)
        if i >= 2:
            sparkle(im, 16, 30 - i, mag, 1)
            sparkle(im, 52, 18 + i, s.get('magic2', mag), 1)
        cast.append(im)
    rows.append(cast)

    # 4 touché
    rows.append(hit_tints([figure(s, fa=ra - 30, fl=0, bl=-4, **B('hit', 0)),
                           figure(s, fa=ra - 15, fl=1, bl=-3, **B('hit', 1))]))

    # 5 K.O.
    base = figure(s, fa=100, wa=80)
    rows.append([figure(s, fa=90, wa=60, fl=4, bl=-5, **B('ko0', 0))] +
                [lay(base, d, off=ko_offset(d)) for d in KO_ANGLES])

    # 6 victoire
    vic = []
    for i in range(4):
        b = B('victory', i)
        if s['weapon'] == 'bow':
            im = figure(s, fa=-60, wa=-90, **b)
        elif s['weapon'] == 'lute':
            im = figure(s, fa=55, **b)
        else:
            im = figure(s, fa=-75, wa=-88, **b)
        if i in (1, 2):
            sparkle(im, 44, 8 + i, GOLD, 2)
            sparkle(im, 16, 14 - i, (255, 255, 255, 255), 1)
        vic.append(im)
    rows.append(vic)
    return rows


def hit_tints(frames):
    return [tint(frames[0], (255, 255, 255), 0.65), tint(frames[1], (255, 60, 60), 0.15)]


# ---------------------------------------------------------------- calques de race
RACES = ['elfe', 'demi-elfe', 'nain', 'ourvalis', 'vulpin', 'demi-demon', 'sang-dragon']
SKIN0 = SKIN[0]
R_COL = {
    'wolf': hexc('a8acb8'), 'wolf_d': hexc('6e7280'), 'wolf_in': hexc('d8a0a0'),
    'fox': hexc('d8702a'), 'fox_d': hexc('a04a1a'), 'fox_w': hexc('f4f0e8'),
    'horn': hexc('2a2430'), 'horn_l': hexc('5a5064'),
    'dhorn': hexc('e8dcc0'), 'dhorn_d': hexc('a8987a'), 'scale': hexc('c8322a'), 'scale_l': hexc('f06a4a'),
    'beard': hexc('8a4a22'), 'beard_l': hexc('b06a32'), 'ring': hexc('c9d3e0'),
}


def draw_tail(p, x, y, sway, kind):
    """Queue partant du bas du dos (x, y), vers l'arrière (gauche)."""
    c = R_COL
    if kind == 'wolf':
        p.thick(x, y, x - 4, y + 2 + sway, c['wolf'], 1)
        p.ell(x - 11, y + sway, x - 3, y + 6 + sway, c['wolf'])
        p.ell(x - 13, y + 3 + sway, x - 8, y + 8 + sway, c['wolf'])
        p.line(x - 4, y + 4 + sway, x - 10, y + 6 + sway, c['wolf_d'])
        p.px(x - 13, y + 6 + sway, hexc('e8ecf0')); p.px(x - 12, y + 7 + sway, hexc('e8ecf0'))
    elif kind == 'fox':
        pts = [(x, y), (x - 6, y + 1 + sway), (x - 12, y + 5 + sway), (x - 15, y + 10 + sway)]
        p.thick(*pts[0], *pts[1], c['fox'], 2)
        p.ell(x - 15, y - 1 + sway, x - 5, y + 9 + sway, c['fox'])
        p.ell(x - 18, y + 5 + sway, x - 11, y + 13 + sway, c['fox_w'])
        p.line(x - 5, y + 2 + sway, x - 13, y + 6 + sway, c['fox_d'])
    elif kind == 'demon':
        pts = [(x, y), (x - 5, y + 4), (x - 9, y + 10 + sway), (x - 13, y + 11 + sway)]
        for i in range(3):
            p.line(*pts[i], *pts[i + 1], c['horn'], 1)
        tx, ty = pts[3]
        p.poly([(tx, ty - 2), (tx - 4, ty), (tx, ty + 2)], c['horn'])


def draw_race_side(p, race, cx, hip, top, hx, hy, ph, lean, decal=False):
    """Éléments de race, vue de côté (tournée vers la droite), mêmes repères que figure()."""
    c = R_COL
    sway = [0, 1, 0, -1][ph % 4]
    tx, ty = cx - 5, hip - 3  # bas du dos
    if decal:
        if race == 'sang-dragon':
            # écailles sur la joue (devant l'oreille), le cou et l'épaule, sans contour
            for (x, y) in [(hx - 1, hy + 1), (hx + 1, hy + 2), (hx - 2, hy + 3), (hx, hy + 4), (hx - 3, hy + 6)]:
                p.px(x, y, c['scale']); p.px(x + 1, y, c['scale_l'])
            for k in range(3):
                p.px(cx - 4 + lean + k * 2, top + 1 + (k % 2), c['scale']); p.px(cx - 3 + lean + k * 2, top + 1 + (k % 2), c['scale_l'])
        return
    if race == 'elfe':
        p.poly([(hx - 3, hy - 1), (hx - 2, hy + 3), (hx - 13, hy - 8)], SKIN0)
        p.line(hx - 4, hy, hx - 11, hy - 6, shade(SKIN0, 0.8))
    elif race == 'demi-elfe':
        p.poly([(hx - 3, hy - 1), (hx - 2, hy + 3), (hx - 8, hy - 4)], SKIN0)
        p.line(hx - 4, hy, hx - 7, hy - 3, shade(SKIN0, 0.8))
    elif race == 'nain':
        b, bl = c['beard'], c['beard_l']
        p.poly([(hx - 1, hy + 2), (hx + 6, hy + 2), (hx + 6, hy + 4), (hx + 4, hy + 8), (hx + 1, hy + 8), (hx - 2, hy + 5)], b)
        p.rect(hx - 3, hy - 1, hx - 2, hy + 3, b)  # favoris
        p.line(hx + 2, hy + 4, hx + 2, hy + 7, bl)
        p.line(hx + 4, hy + 3, hx + 4, hy + 5, bl)
        p.rect(hx + 2, hy + 8, hx + 3, hy + 11, b)  # tresse
        p.line(hx + 2, hy + 9, hx + 3, hy + 9, c['ring'])
        p.line(hx + 3, hy + 2, hx + 6, hy + 2, shade(b, 0.8))  # moustache
    elif race == 'ourvalis':
        draw_tail(p, tx, ty, sway, 'wolf')
        p.poly([(hx - 5, hy - 4), (hx - 1, hy - 6), (hx - 5, hy - 13)], c['wolf'])
        p.poly([(hx - 4, hy - 5), (hx - 2, hy - 6), (hx - 4, hy - 10)], c['wolf_in'])
        p.poly([(hx, hy - 6), (hx + 4, hy - 5), (hx + 2, hy - 13)], c['wolf'])
        p.line(hx + 1, hy - 7, hx + 2, hy - 11, c['wolf_d'])
    elif race == 'vulpin':
        draw_tail(p, tx, ty, sway, 'fox')
        p.poly([(hx - 6, hy - 4), (hx - 1, hy - 6), (hx - 6, hy - 15)], c['fox'])
        p.poly([(hx - 5, hy - 6), (hx - 2, hy - 6), (hx - 5, hy - 11)], c['fox_w'])
        p.px(hx - 6, hy - 15, c['fox_d']); p.px(hx - 6, hy - 14, c['fox_d'])
        p.poly([(hx, hy - 6), (hx + 5, hy - 5), (hx + 2, hy - 15)], c['fox'])
        p.rect(hx + 2, hy - 15, hx + 2, hy - 13, hexc('3a2a20'))
    elif race == 'demi-demon':
        draw_tail(p, tx, ty, sway, 'demon')
        # corne avant (recourbée vers l'arrière)
        p.thick(hx + 2, hy - 5, hx + 1, hy - 9, c['horn'], 1)
        p.line(hx + 1, hy - 9, hx - 2, hy - 11, c['horn'])
        p.px(hx - 3, hy - 11, c['horn'])
        p.px(hx + 2, hy - 7, c['horn_l'])
        # corne arrière (plus sombre, en retrait)
        p.line(hx - 2, hy - 6, hx - 4, hy - 9, c['horn']); p.line(hx - 4, hy - 9, hx - 7, hy - 10, c['horn'])
    elif race == 'sang-dragon':
        p.thick(hx + 1, hy - 5, hx - 1, hy - 9, c['dhorn'], 1)
        p.line(hx - 1, hy - 9, hx - 4, hy - 10, c['dhorn'])
        p.line(hx, hy - 6, hx - 1, hy - 8, c['dhorn_d'])
        p.line(hx - 3, hy - 5, hx - 6, hy - 8, c['dhorn_d'])


def race_combat_frames(race):
    """Calque de race : même gabarit et même trajectoire de corps que combat_frames()."""
    ref = CLASSES['lame-runique']

    def F(row, i, **kw):
        return figure(ref, race=race, only=True, ph=i, **B(row, i), **kw)

    rows = [[F('idle', i) for i in range(4)],
            [F('attack', i) for i in range(6)],
            [F('cast', i) for i in range(4)],
            hit_tints([F('hit', 0), F('hit', 1)])]
    base = figure(ref, race=race, only=True, ph=0)
    rows.append([F('ko0', 0)] + [lay(base, d, off=ko_offset(d)) for d in KO_ANGLES])
    rows.append([F('victory', i) for i in range(4)])
    return rows


def sheet(rows, cell, cols=8):
    out = new(cols * cell, len(rows) * cell)
    for r, frames in enumerate(rows):
        for c, im in enumerate(frames):
            out.alpha_composite(im, (c * cell, r * cell))
    return out


# ---------------------------------------------------------------- exploration 32×32
def explore_frame(s, direction, step, race=None, only=False):
    """direction : 'down', 'left', 'right', 'up' ; step : 0..3."""
    img = new(32, 32)
    p = P(img)
    leg_off = [0, 1, 0, -1][step]
    bob = 1 if step in (1, 3) else 0
    skin, hc, topc = s['skin'], s['hair'], s['top']
    legs, boots = s['legs'], s['boots']
    cx = 16
    hy = 10 + bob  # centre tête
    ty0, ty1 = 16 + bob, 23 + bob
    robe = s.get('robe')
    if only:
        dd = 'right' if direction == 'left' else direction
        if race:
            draw_race_explore(p, race, dd, cx, hy, ty0, ty1, step)
        img = outline(img)
        if race == 'sang-dragon':
            q = P(img)
            if dd == 'down':
                for k in (1, -1):
                    q.px(cx + k * 4, hy + 2, R_COL['scale']); q.px(cx + k * 3, hy + 3, R_COL['scale_l'])
            elif dd == 'right':
                q.px(cx - 1, hy + 2, R_COL['scale']); q.px(cx, hy + 3, R_COL['scale_l']); q.px(cx - 2, hy + 4, R_COL['scale'])
        return img.transpose(Image.FLIP_LEFT_RIGHT) if direction == 'left' else img

    if direction in ('down', 'up'):
        # cape derrière (vue de face on voit les côtés)
        if s.get('cape') and direction == 'up':
            p.poly([(cx - 4, ty0), (cx + 4, ty0), (cx + 6, 28), (cx - 6, 28)], s['cape'])
        # jambes
        if not robe:
            p.rect(cx - 3, ty1, cx - 1, 28 - max(0, leg_off), legs)
            p.rect(cx + 1, ty1, cx + 3, 28 - max(0, -leg_off), legs)
            p.rect(cx - 3, 28 - max(0, leg_off), cx - 1, 29 - max(0, leg_off), boots)
            p.rect(cx + 1, 28 - max(0, -leg_off), cx + 3, 29 - max(0, -leg_off), boots)
        # torse
        p.rect(cx - 4, ty0, cx + 4, ty1, topc)
        if robe:
            p.poly([(cx - 4, ty1 - 2), (cx + 4, ty1 - 2), (cx + 6, 28), (cx - 6, 28)], robe)
            p.rect(cx - 3 + leg_off, 28, cx - 1 + leg_off, 29, boots)
            p.rect(cx + 1 - leg_off, 28, cx + 3 - leg_off, 29, boots)
        if s.get('top2'):
            if s.get('armor') == 'light':
                p.rect(cx - 3, ty0 + 1, cx + 3, ty0 + 3, s['top2'])
            else:
                p.line(cx, ty0, cx, ty1 - 1, s['top2'])
        if s.get('apron') and direction == 'down':
            p.rect(cx - 3, ty0 + 2, cx + 3, ty1 + 2, s['apron'])
        if s.get('scales') and direction == 'down':
            for yy in range(ty0 + 1, ty1, 2):
                p.px(cx - 2 + (yy % 4), yy, shade(topc, 1.3)); p.px(cx + 1 + (yy % 4) // 2, yy, s['top2'])
        # bras
        arm = skin if s.get('bare_arms') else shade(topc, 0.85)
        p.rect(cx - 6, ty0 + 1 - leg_off, cx - 5, ty0 + 6 - leg_off, arm)
        p.rect(cx + 5, ty0 + 1 + leg_off, cx + 6, ty0 + 6 + leg_off, arm)
        p.px(cx - 6, ty0 + 7 - leg_off, skin); p.px(cx + 6, ty0 + 7 + leg_off, skin)
        # tête
        p.ell(cx - 5, hy - 5, cx + 5, hy + 5, skin)
        hs = s['hair_style']
        if hs == 'hood':
            p.ell(cx - 6, hy - 6, cx + 6, hy + 5, s['hood'])
            if direction == 'down':
                p.ell(cx - 4, hy - 3, cx + 4, hy + 5, skin)
        else:
            if direction == 'down':
                p.ell(cx - 6, hy - 7, cx + 6, hy - 1, hc)
                p.rect(cx - 6, hy - 3, cx - 5, hy + 2, hc)
                p.rect(cx + 5, hy - 3, cx + 6, hy + 2, hc)
                if hs == 'long':
                    p.rect(cx - 6, hy, cx - 5, hy + 8, hc); p.rect(cx + 5, hy, cx + 6, hy + 8, hc)
                if hs == 'wild':
                    for k in range(-6, 7, 3):
                        p.line(cx + k, hy - 6, cx + k, hy - 9, hc)
            else:
                p.ell(cx - 6, hy - 7, cx + 6, hy + 4, hc)
                if hs == 'long':
                    p.rect(cx - 5, hy, cx + 5, hy + 8, hc)
                if hs == 'tail':
                    p.rect(cx - 1, hy + 3, cx + 1, hy + 8, hc)
                if hs == 'wild':
                    for k in range(-6, 7, 3):
                        p.line(cx + k, hy - 6, cx + k, hy - 9, hc)
        if s.get('helmet'):
            p.ell(cx - 6, hy - 7, cx + 6, hy, STEEL)
            p.line(cx - 6, hy - 2, cx + 6, hy - 2, GOLD)
        if s.get('hat'):
            p.rect(cx - 7, hy - 5, cx + 7, hy - 4, s['hat'])
            p.ell(cx - 4, hy - 10, cx + 4, hy - 4, s['hat'])
            p.line(cx + 3, hy - 7, cx + 7, hy - 12, s['feather'])
        if s.get('circlet'):
            p.line(cx - 5, hy - 3, cx + 5, hy - 3, GOLD)
            if direction == 'down':
                p.px(cx, hy - 3, hexc('5fd3ff'))
        if s.get('band'):
            p.line(cx - 5, hy - 3, cx + 5, hy - 3, s['band'])
            p.line(cx + 5, hy - 4, cx + 9, hy - 7, s['feather'])
        if s.get('hood_down'):
            p.rect(cx - 5, ty0 - 1, cx + 5, ty0, s['hood_down']) if direction == 'down' else p.ell(cx - 5, ty0 - 2, cx + 5, ty0 + 4, s['hood_down'])
        if direction == 'down':
            p.px(cx - 2, hy + 1, (34, 30, 48, 255)); p.px(cx + 2, hy + 1, (34, 30, 48, 255))
            if s.get('goggles'):
                p.line(cx - 5, hy - 3, cx + 5, hy - 3, LEATHER)
                p.rect(cx - 3, hy - 4, cx - 1, hy - 3, hexc('8ad0e0')); p.rect(cx + 1, hy - 4, cx + 3, hy - 3, hexc('8ad0e0'))
            if s.get('scarf'):
                p.rect(cx - 4, hy + 3, cx + 4, hy + 5, s['scarf'])
            if s['hair_style'] == 'hood' and s['weapon'] == 'daggers':
                p.rect(cx - 4, hy + 2, cx + 4, hy + 5, shade(s['hood'], 0.7))
        else:
            if s.get('quiver'):
                p.line(cx - 4, ty0 - 1, cx + 3, ty0 + 7, LEATHER, 2)
                p.px(cx - 4, ty0 - 2, s['magic'])
        if s.get('cape') and direction == 'down':
            p.rect(cx - 4, ty0, cx + 4, ty0, s['cape'])
        # arme visible
        w = s['weapon']
        if direction == 'down':
            if w in ('staff', 'sunstaff'):
                p.line(cx + 8, ty0 - 8, cx + 8, ty1 + 4 + leg_off, WOOD)
                p.ell(cx + 6, ty0 - 12, cx + 10, ty0 - 8, s.get('orb', GOLD))
            elif w == 'sword':
                p.line(cx + 7, ty0 + 6, cx + 7, ty0 - 3, STEEL); p.px(cx + 7, ty0 + 1, s['runes'])
            elif w == 'mace':
                p.line(cx + 7, ty0 + 6, cx + 7, ty0 - 1, WOOD); p.rect(cx + 6, ty0 - 3, cx + 8, ty0 - 1, GOLD)
            elif w == 'axe':
                p.line(cx + 7, ty0 + 7, cx + 7, ty0 - 4, WOOD); p.rect(cx + 7, ty0 - 4, cx + 10, ty0, STEEL)
            elif w == 'bow':
                p.line(cx - 8, ty0 - 4, cx - 8, ty1 + 2, WOOD)
            elif w == 'grimoire':
                p.rect(cx - 9, ty0 + 3, cx - 6, ty0 + 7, hexc('5a3a1a'))
            elif w == 'daggers':
                p.line(cx - 6, ty0 + 7, cx - 6, ty0 + 10, STEEL); p.line(cx + 6, ty0 + 7, cx + 6, ty0 + 10, STEEL)
            elif w == 'wrench':
                p.line(cx + 7, ty0 + 7, cx + 7, ty0 + 1, STEEL_D); p.rect(cx + 6, ty0 - 1, cx + 8, ty0 + 1, STEEL)
            elif w == 'lute':
                p.ell(cx - 3, ty0 + 2, cx + 3, ty1, hexc('b87a3a')); p.line(cx + 2, ty0 + 3, cx + 7, ty0 - 2, hexc('6a4020'))
            if s.get('shield'):
                p.rect(cx - 9, ty0 + 1, cx - 5, ty0 + 8, STEEL); p.line(cx - 7, ty0 + 2, cx - 7, ty0 + 7, GOLD)
        else:  # vue de dos
            if w in ('staff', 'sunstaff'):
                p.line(cx - 7, ty0 - 6, cx - 7, ty1 + 4, WOOD)
            elif w in ('sword', 'axe', 'mace'):
                p.line(cx - 4, ty0 + 7, cx + 4, ty0 - 4, STEEL if w == 'sword' else WOOD)
            elif w == 'bow':
                p.line(cx + 4, ty0 - 3, cx - 4, ty1 + 1, WOOD)
            if s.get('shield'):
                p.rect(cx - 4, ty0 + 1, cx + 4, ty1, STEEL); p.line(cx, ty0 + 2, cx, ty1 - 1, GOLD)
            if s.get('cape'):
                pass
    else:
        # profil (droite), gauche = miroir
        lo = [0, 2, 0, -2][step]
        if s.get('cape'):
            p.poly([(cx - 2, ty0), (cx + 1, ty0), (cx - 3, 28), (cx - 6 - abs(lo) // 2, 27)], s['cape'])
        if not robe:
            p.line(cx - 1, ty1, cx - 1 - lo, 28, shade(legs, 0.8), 2)
            p.rect(cx - 1 - lo, 28, cx + 1 - lo, 29, shade(boots, 0.8))
        arm = skin if s.get('bare_arms') else shade(topc, 0.75)
        p.line(cx - 1, ty0 + 1, cx - 1 - lo // 2, ty0 + 6, arm, 2)
        p.rect(cx - 3, ty0, cx + 3, ty1, topc)
        if s.get('top2'):
            p.line(cx + 2, ty0 + 1, cx + 2, ty1 - 1, shade(topc, 1.2))
        if s.get('quiver'):
            p.rect(cx - 5, ty0 - 2, cx - 4, ty0 + 6, LEATHER); p.px(cx - 5, ty0 - 3, s['magic'])
        if s.get('satchel'):
            p.rect(cx - 5, ty1 - 3, cx - 3, ty1, s['satchel'])
        if robe:
            p.poly([(cx - 3, ty1 - 2), (cx + 3, ty1 - 2), (cx + 5, 28), (cx - 5, 28)], robe)
            p.rect(cx - 2 + lo // 2, 28, cx + 1 + lo // 2, 29, boots)
        else:
            p.line(cx + 1, ty1, cx + 1 + lo, 28, legs, 2)
            p.rect(cx + 1 + lo, 28, cx + 3 + lo, 29, boots)
        # tête
        p.ell(cx - 5, hy - 5, cx + 5, hy + 5, skin)
        hs = s['hair_style']
        if hs == 'hood':
            p.ell(cx - 6, hy - 6, cx + 5, hy + 4, s['hood'])
            p.ell(cx, hy - 3, cx + 5, hy + 4, skin)
            if s['weapon'] == 'daggers':
                p.rect(cx + 1, hy + 2, cx + 5, hy + 4, shade(s['hood'], 0.7))
        else:
            p.ell(cx - 6, hy - 7, cx + 5, hy - 1, s['hair'])
            p.rect(cx - 6, hy - 3, cx - 2, hy + 3, s['hair'])
            if hs == 'long':
                p.rect(cx - 6, hy, cx - 3, hy + 8, s['hair'])
            if hs == 'tail':
                p.line(cx - 5, hy - 1, cx - 9, hy + 6, s['hair'], 2)
            if hs == 'wild':
                for k in range(-6, 5, 3):
                    p.line(cx + k, hy - 6, cx + k - 2, hy - 9, s['hair'])
        if s.get('helmet'):
            p.ell(cx - 6, hy - 7, cx + 5, hy, STEEL); p.line(cx - 6, hy - 2, cx + 5, hy - 2, GOLD)
        if s.get('hat'):
            p.rect(cx - 7, hy - 5, cx + 7, hy - 4, s['hat'])
            p.ell(cx - 4, hy - 10, cx + 3, hy - 4, s['hat'])
            p.line(cx - 4, hy - 7, cx - 9, hy - 12, s['feather'])
        if s.get('goggles'):
            p.line(cx - 5, hy - 3, cx + 5, hy - 3, LEATHER); p.rect(cx + 2, hy - 4, cx + 4, hy - 3, hexc('8ad0e0'))
        if s.get('circlet'):
            p.line(cx - 1, hy - 3, cx + 5, hy - 3, GOLD)
        if s.get('band'):
            p.line(cx - 1, hy - 3, cx + 5, hy - 3, s['band']); p.line(cx - 4, hy - 4, cx - 9, hy - 6, s['feather'])
        if s.get('hood_down'):
            p.ell(cx - 6, hy + 3, cx, hy + 7, s['hood_down'])
        if s.get('scarf'):
            p.rect(cx - 1, hy + 3, cx + 4, hy + 5, s['scarf'])
            p.line(cx - 2, hy + 4, cx - 6, hy + 6 + (step % 2), s['scarf'])
        p.px(cx + 3, hy + 1, (34, 30, 48, 255))
        # bras avant + arme
        p.line(cx + 1, ty0 + 1, cx + 1 + lo // 2, ty0 + 6, skin if s.get('bare_arms') else shade(topc, 0.9), 2)
        hxp, hyp = cx + 1 + lo // 2, ty0 + 7
        w = s['weapon']
        if w in ('staff', 'sunstaff'):
            p.line(hxp + 6, hyp - 12, hxp + 6, hyp + 4, WOOD)
            p.ell(hxp + 4, hyp - 15, hxp + 8, hyp - 11, s.get('orb', GOLD))
        elif w == 'sword':
            p.line(hxp + 1, hyp, hxp + 6, hyp - 6, STEEL); p.px(hxp + 4, hyp - 4, s['runes'])
        elif w == 'mace':
            p.line(hxp + 1, hyp, hxp + 4, hyp - 5, WOOD); p.rect(hxp + 3, hyp - 7, hxp + 5, hyp - 5, GOLD)
        elif w == 'axe':
            p.line(hxp, hyp + 1, hxp + 4, hyp - 8, WOOD); p.rect(hxp + 4, hyp - 9, hxp + 7, hyp - 5, STEEL)
        elif w == 'bow':
            p.line(hxp + 2, hyp - 8, hxp + 2, hyp + 4, WOOD)
        elif w == 'grimoire':
            p.rect(hxp + 1, hyp - 3, hxp + 4, hyp + 1, hexc('5a3a1a'))
        elif w == 'daggers':
            p.line(hxp + 1, hyp, hxp + 4, hyp - 2, STEEL)
        elif w == 'wrench':
            p.line(hxp + 1, hyp, hxp + 4, hyp - 4, STEEL_D); p.rect(hxp + 4, hyp - 6, hxp + 5, hyp - 4, STEEL)
        elif w == 'lute':
            p.ell(cx - 1, ty0 + 2, cx + 5, ty1, hexc('b87a3a')); p.line(cx + 4, ty0 + 3, cx + 8, ty0 - 2, hexc('6a4020'))
        if s.get('shield'):
            p.rect(cx + 3, ty0 + 1, cx + 5, ty0 + 9, STEEL); p.px(cx + 4, ty0 + 4, GOLD)
    img = outline(img)
    if direction == 'left':
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    return img


def draw_race_explore(p, race, d, cx, hy, ty0, ty1, step):
    c = R_COL
    sway = [0, 1, 0, -1][step]

    def both(fn):
        fn(1); fn(-1)

    if d in ('down', 'up'):
        if race in ('elfe', 'demi-elfe'):
            tip = 10 if race == 'elfe' else 8
            both(lambda k: p.poly([(cx + k * 5, hy - 1), (cx + k * 5, hy + 2), (cx + k * tip, hy - (4 if race == 'elfe' else 2))], SKIN0))
        elif race == 'nain' and d == 'down':
            b = c['beard']
            p.poly([(cx - 5, hy + 3), (cx + 5, hy + 3), (cx + 4, hy + 6), (cx + 1, hy + 9), (cx - 1, hy + 9), (cx - 4, hy + 6)], b)
            p.rect(cx - 5, hy, cx - 5, hy + 3, b); p.rect(cx + 5, hy, cx + 5, hy + 3, b)
            p.px(cx, hy + 4, shade(b, 0.7))
            p.line(cx - 1, hy + 8, cx + 1, hy + 8, c['ring'])
            p.px(cx - 3, hy + 5, c['beard_l']); p.px(cx + 3, hy + 5, c['beard_l'])
        elif race == 'nain':
            p.rect(cx - 6, hy + 1, cx - 5, hy + 4, c['beard']); p.rect(cx + 5, hy + 1, cx + 6, hy + 4, c['beard'])
        elif race in ('ourvalis', 'vulpin'):
            fur = c['wolf'] if race == 'ourvalis' else c['fox']
            inner = c['wolf_in'] if race == 'ourvalis' else c['fox_w']
            h = 11 if race == 'ourvalis' else 12
            both(lambda k: p.poly([(cx + k * 6, hy - 4), (cx + k * 1, hy - 6), (cx + k * 5, hy - h)], fur))
            if d == 'down':
                both(lambda k: p.poly([(cx + k * 5, hy - 5), (cx + k * 2, hy - 6), (cx + k * 5, hy - h + 3)], inner))
            if race == 'vulpin':
                both(lambda k: p.px(cx + k * 5, hy - h, c['fox_d']))
            # queue
            if d == 'up':
                if race == 'ourvalis':
                    p.thick(cx, ty1 - 1, cx + sway, ty1 + 5, c['wolf'], 1); p.px(cx + sway, ty1 + 6, hexc('e8ecf0'))
                else:
                    p.ell(cx - 3 + sway, ty1 - 1, cx + 3 + sway, ty1 + 6, c['fox']); p.ell(cx - 2 + sway, ty1 + 4, cx + 2 + sway, ty1 + 8, c['fox_w'])
            else:
                if race == 'ourvalis':
                    p.line(cx + 5, ty1 - 1, cx + 8, ty1 + 2 + sway, c['wolf'], 2)
                else:
                    p.ell(cx + 4, ty1 - 2, cx + 9, ty1 + 3 + sway, c['fox']); p.px(cx + 8, ty1 + 3 + sway, c['fox_w'])
        elif race in ('demi-demon', 'sang-dragon'):
            hc, hd = (c['horn'], c['horn_l']) if race == 'demi-demon' else (c['dhorn'], c['dhorn_d'])
            both(lambda k: (p.line(cx + k * 3, hy - 5, cx + k * 4, hy - 8, hc), p.line(cx + k * 4, hy - 8, cx + k * 6, hy - 10, hc),
                            p.px(cx + k * 3, hy - 6, hd)))
            if race == 'demi-demon':
                if d == 'up':
                    p.line(cx, ty1 - 1, cx + 2 + sway, ty1 + 5, c['horn']); p.poly([(cx + 1 + sway, ty1 + 5), (cx + 4 + sway, ty1 + 5), (cx + 3 + sway, ty1 + 8)], c['horn'])
                else:
                    p.line(cx + 5, ty1, cx + 8, ty1 + 3 + sway, c['horn']); p.px(cx + 9, ty1 + 4 + sway, c['horn'])

    else:  # profil tourné vers la droite (la gauche est obtenue par miroir)
        if race in ('elfe', 'demi-elfe'):
            tip = (-10, -5) if race == 'elfe' else (-7, -3)
            p.poly([(cx - 3, hy - 1), (cx - 2, hy + 2), (cx + tip[0], hy + tip[1])], SKIN0)
        elif race == 'nain':
            b = c['beard']
            p.poly([(cx + 1, hy + 3), (cx + 5, hy + 3), (cx + 5, hy + 5), (cx + 3, hy + 9), (cx + 1, hy + 9), (cx - 1, hy + 5)], b)
            p.rect(cx - 2, hy, cx - 1, hy + 3, b)
            p.line(cx + 1, hy + 8, cx + 3, hy + 8, c['ring'])
        elif race in ('ourvalis', 'vulpin'):
            fur = c['wolf'] if race == 'ourvalis' else c['fox']
            h = 11 if race == 'ourvalis' else 12
            p.poly([(cx - 5, hy - 3), (cx - 1, hy - 5), (cx - 4, hy - h)], fur)
            p.poly([(cx, hy - 5), (cx + 3, hy - 4), (cx + 1, hy - h)], fur)
            p.px(cx - 4, hy - 6, c['wolf_in'] if race == 'ourvalis' else c['fox_w'])
            if race == 'ourvalis':
                p.line(cx - 3, ty1 - 1, cx - 8, ty1 + 2 + sway, c['wolf'], 2); p.px(cx - 9, ty1 + 3 + sway, hexc('e8ecf0'))
            else:
                p.ell(cx - 11, ty1 - 3 + sway, cx - 3, ty1 + 3 + sway, c['fox']); p.ell(cx - 12, ty1 + sway, cx - 8, ty1 + 4 + sway, c['fox_w'])
        elif race in ('demi-demon', 'sang-dragon'):
            hc = c['horn'] if race == 'demi-demon' else c['dhorn']
            p.line(cx + 1, hy - 5, cx, hy - 8, hc); p.line(cx, hy - 8, cx - 3, hy - 9, hc)
            p.line(cx - 3, hy - 5, cx - 5, hy - 8, shade(hc, 0.8))
            if race == 'demi-demon':
                p.line(cx - 3, ty1, cx - 8, ty1 + 3 + sway, c['horn']); p.poly([(cx - 8, ty1 + 1 + sway), (cx - 11, ty1 + 4 + sway), (cx - 7, ty1 + 5 + sway)], c['horn'])



def race_explore_sheet(race):
    rows = []
    for d in ('down', 'left', 'right', 'up'):
        rows.append([explore_frame(CLASSES['lame-runique'], d, k, race=race, only=True) for k in range(4)])
    return sheet(rows, 32, cols=4)


def explore_sheet(s):
    rows = []
    for d in ('down', 'left', 'right', 'up'):
        rows.append([explore_frame(s, d, k) for k in range(4)])
    return sheet(rows, 32, cols=4)
