"""Golem de la Fontaine (mise à jour 5, point 3) : le gardien de la crypte du chapitre 1.
« La fontaine se fend. Une silhouette de pierre ruisselante se détache du mur : le gardien de la crypte ! »

Silhouette de pierre gris-vert, voûtée, sortie du mur de la fontaine : vasque fendue sur le dos d'où l'eau déborde,
mousse sur les épaules et les genoux, ruisseaux d'eau sur le corps, flaque aux pieds, yeux et runes cyan qui luisent.
Même gabarit que les autres monstres : planche 1024 × 512, cases de 128 (64 × 64 logiques), lignes attente (4),
attaque (6), touché (2), K.O. (3) ; dessiné tourné vers la droite puis retourné (les ennemis regardent à gauche).

Usage (depuis ce dossier) : python bestiary.py golem-fontaine
"""
import math
from mobs import *

PIERRE = hexc('6f7a72')
PIERRE_D = hexc('465049')
PIERRE_L = hexc('96a39a')
MOUSSE = hexc('4f7a36')
MOUSSE_L = hexc('7aa84a')
EAU = hexc('5fb8f0', 210)
EAU_L = hexc('c8f0ff', 230)
EAU_D = hexc('2f6f9a', 200)
RUNE = hexc('6ff0ff')


def golem_fontaine():
    def draw(S):
        img = new(64 * SC, 64 * SC)
        p = P(img, SC)
        cx = 30 + S['x'] * 0.6
        cr = S['crouch']
        top = 21 + cr + S['bob']  # tête vers y = 18 : à peine plus haut que le golem de granite
        ph = S['phase'] % 4
        raise_ = 0 if S['fx'] else S['open']

        # flaque aux pieds (l'eau qui coule de lui)
        p.ell(cx - 19, 56, cx + 19, 62, EAU_D)
        p.ell(cx - 15, 57, cx + 13, 60, EAU)
        p.line(cx - 10 + ph, 58, cx - 4 + ph, 58, EAU_L)

        # vasque fendue sur le dos (morceau de la fontaine resté accroché), l'eau déborde par la fente
        p.ell(cx - 24, top - 2, cx - 6, top + 10, PIERRE_D)
        p.ell(cx - 22, top - 1, cx - 8, top + 4, EAU)
        p.line(cx - 22, top + 1, cx - 9, top + 1, EAU_L)
        p.line(cx - 17, top + 4, cx - 14, top + 10, hexc('2a302c'))  # la fente
        for k in range(4):  # cascade dans le dos, qui descend jusqu'au sol (décalée à chaque image)
            y0 = top + 9 + ((k * 7 + ph * 3) % 22)
            p.line(cx - 21 + k, y0, cx - 21 + k, min(57, y0 + 6), EAU if k % 2 else EAU_L)

        # jambes trapues, mousse aux genoux
        p.rect(cx - 11, 44 + cr, cx - 3, 58, PIERRE_D)
        p.rect(cx + 2, 44 + cr, cx + 10, 58, PIERRE)
        p.rect(cx + 2, 44 + cr, cx + 3, 58, PIERRE_L)
        p.rect(cx - 11, 49 + cr, cx - 7, 51 + cr, MOUSSE)
        p.rect(cx + 5, 50 + cr, cx + 9, 52 + cr, MOUSSE_L)

        # bras arrière
        ay = top + 7
        p.rect(cx - 18, ay - raise_ * 10, cx - 10, ay + 18 - raise_ * 12, PIERRE_D)
        p.rect(cx - 19, ay + 15 - raise_ * 12, cx - 9, ay + 21 - raise_ * 12, shade(PIERRE_D, 0.9))

        # torse : gros bloc voûté, épaules en rocher
        p.poly([(cx - 13, top + 6), (cx - 6, top + 1), (cx + 8, top + 2), (cx + 14, top + 8), (cx + 13, 47 + cr), (cx - 13, 47 + cr)], PIERRE)
        p.line(cx - 6, top + 1, cx + 8, top + 2, PIERRE_L)
        p.rect(cx - 13, top + 6, cx - 11, 47 + cr, PIERRE_D)
        # joints de pierre
        for (x0, y0, x1, y1) in [(-9, 11, 0, 12), (2, 18, 11, 19), (-11, 23, -3, 24)]:
            p.line(cx + x0, top + y0, cx + x1, top + y1, PIERRE_D)
        # mousse sur les épaules
        for k in range(-11, 12, 3):
            p.rect(cx + k, top + 1 + abs(k) // 4, cx + k + 2, top + 3 + abs(k) // 4 + (k % 2), MOUSSE if k % 2 else MOUSSE_L)
        p.rect(cx - 13, top + 18, cx - 11, top + 23, MOUSSE)

        # tête enfoncée entre les épaules, penchée en avant
        p.rect(cx + 2, top - 3, cx + 12, top + 6, PIERRE)
        p.line(cx + 2, top - 3, cx + 12, top - 3, PIERRE_L)
        p.rect(cx + 2, top - 3, cx + 3, top + 6, PIERRE_D)
        p.rect(cx + 4, top - 4, cx + 9, top - 3, MOUSSE)

        # ruisseaux d'eau sur le corps (ils glissent d'une image à l'autre)
        for (x, y0, n) in [(-7, 4, 20), (1, 6, 16), (9, 9, 14)]:
            for k in range(0, n, 3):
                yy = top + y0 + k + (ph % 3)
                if yy < 47 + cr:
                    p.px(cx + x + (k // 6) % 2, yy, EAU if k % 2 else EAU_L)

        # bras avant : il se lève puis s'abat (attaque)
        ax0 = cx + 11
        p.rect(ax0, ay - raise_ * 16, ax0 + 8, ay + 17 - raise_ * 18, PIERRE)
        p.rect(ax0, ay - raise_ * 16, ax0 + 1, ay + 17 - raise_ * 18, PIERRE_L)
        p.rect(ax0 - 1, ay + 14 - raise_ * 18, ax0 + 10, ay + 21 - raise_ * 18, shade(PIERRE, 0.9))
        p.rect(ax0 + 2, ay + 2 - raise_ * 16, ax0 + 6, ay + 4 - raise_ * 16, MOUSSE_L)
        p.px(ax0 + 4, ay + 21 - raise_ * 18, EAU_L)  # goutte au bout du poing

        img = outline_sel(volume(grain(img)))

        # ce qui luit, posé après le volume pour rester vif : yeux, runes du torse et du bras
        q = P(img, SC)
        if S['closed']:
            q.line(cx + 6, top + 1, cx + 11, top + 1, DARK)
        else:
            q.rect(cx + 6, top, cx + 7, top + 2, RUNE); q.rect(cx + 9, top, cx + 10, top + 2, RUNE)
            q.px(cx + 7, top, WHITE); q.px(cx + 10, top, WHITE)
            lueur = (RUNE[0], RUNE[1], RUNE[2], 150 if ph in (1, 2) else 230)
            for (x0, y0, x1, y1) in [(-3, 9, 1, 12), (1, 12, -3, 15), (-3, 15, 1, 18), (4, 10, 7, 10), (5, 10, 5, 15)]:
                q.line(cx + x0, top + y0, cx + x1, top + y1, lueur)
            q.line(ax0 + 4, ay + 8 - raise_ * 16, ax0 + 4, ay + 13 - raise_ * 16, lueur)
        # gouttes qui tombent autour de lui
        aura(img, EAU_L, n=9, r=(16, 24), cy=38, seed=S['phase'] + (7 if S['open'] else 0))
        if S['fx']:  # l'impact soulève une gerbe d'eau
            for k in range(7):
                q.px(34 + k * 4, 57 - (k % 3) * 2, EAU_L)
                q.px(35 + k * 4, 55 - (k % 2) * 3, EAU)
        return img
    return draw


def planche():
    return creature_sheet(golem_fontaine(), ko='crumble', fx_y=50)
