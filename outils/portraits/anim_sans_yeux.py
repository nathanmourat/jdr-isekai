"""Calques d'animation d'un portrait qui n'a pas encore d'image « yeux fermés ».
yeux.png vide (pas de clignement), carte : R = barbe/cheveux clairs (option), G = respiration, B = tête.
Usage : python3 anim_sans_yeux.py <source> <portrait 512> <dossier sortie> <bouche_x> <bouche_y> <largeur> [barbe]"""
import sys, os, json, cv2, numpy as np
src, prep, out = sys.argv[1:4]
MX, MY, L = float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
barbe = len(sys.argv) > 7 and sys.argv[7] == 'barbe'
img = cv2.imread(src)[..., :3]; H, W = img.shape[:2]
base = cv2.imread(prep, cv2.IMREAD_UNCHANGED)
alpha = cv2.resize(base[..., 3], (W, H))
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
os.makedirs(out, exist_ok=True)
def png(a, p):
    a = cv2.resize(a, (512, 512), interpolation=cv2.INTER_AREA)
    if a.shape[2] == 4: a[a[..., 3] == 0] = 0
    cv2.imwrite(p, a, [cv2.IMWRITE_PNG_COMPRESSION, 9])
png(np.zeros((H, W, 4), np.uint8), os.path.join(out, 'yeux.png'))
ch = np.zeros((H, W), np.float32)
if barbe:
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    clair = ((hsv[..., 1] < 45) & (hsv[..., 2] > 170) & (alpha > 128) & (yy > MY + 0.01 * H) & (np.abs(xx - MX) < 0.17 * W)).astype(np.float32)
    clair = cv2.morphologyEx(clair, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    ch = cv2.GaussianBlur(clair * np.clip((yy - MY) / (0.18 * H), 0, 1), (0, 0), 3) * 0.7
cou = MY + 0.075 * H
g = (0.35 + 0.65 * np.clip((yy - 0.50 * H) / (0.16 * H), 0, 1)) * (alpha > 0)
t = np.clip((cou + 0.035 * H - yy) / (0.07 * H), 0, 1)
t = np.maximum(t, 0.6 * (ch > 0.05))
t = cv2.GaussianBlur(t * (alpha > 0), (0, 0), 4)
png((np.dstack([t, g, ch]) * 255).clip(0, 255).astype(np.uint8)[..., :3], os.path.join(out, 'carte.png'))
json.dump({"taille": 512, "expressions": {"neutre": {"bouche": [round(MX / W, 4), round(MY / H, 4)], "largeur": L, "ouverte": False, "cou": [round(MX / W, 4), round(cou / H, 4)]}}}, open(os.path.join(os.path.dirname(out), 'anim.json'), 'w'), indent=1)
print('ok', out)
