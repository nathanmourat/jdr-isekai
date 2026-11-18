"""Prépare un portrait IA pour le jeu : détourage, recadrage 512x512, PNG transparent.

Usage : python3 preparer_portrait.py <source> <sortie> [x0,y0,x1,y1 | bas]
« bas » : le cadre s'arrête au bas du buste (pour un buste qui flotte au-dessus du bord).
Donner la boîte du neutre aux autres expressions pour qu'elles aient exactement le même cadrage."""
import sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
sess = new_session("isnet-anime")
rgba = remove(im, session=sess, post_process_mask=True)
a = np.array(rgba)
alpha = a[..., 3]
ys, xs = np.where(alpha > 20)
top = ys.min()
# Cadrage carré : marge de 6 % au-dessus des cheveux, largeur = hauteur de l'image source
H, W = alpha.shape
cx = int(np.median(xs))
side = min(H - max(0, top - int(0.06 * H)), W)
y0 = max(0, top - int(0.06 * H)); y1 = min(H, y0 + side)
x0 = max(0, min(W - side, cx - side // 2)); x1 = x0 + side
if len(sys.argv) > 3 and sys.argv[3] == 'bas':
    # le buste touche le bord du bas (portraits « flottants » de Gemini)
    bas = int(np.percentile(ys, 99.8))
    side = min(bas - y0, W)
    y1 = y0 + side
    x0 = max(0, min(W - side, cx - side // 2)); x1 = x0 + side
elif len(sys.argv) > 3:
    x0, y0, x1, y1 = (int(v) for v in sys.argv[3].split(','))
crop = rgba.crop((x0, y0, x1, y1)).resize((512, 512), Image.LANCZOS)
crop.save(dst, optimize=True)
print("boîte", (x0, y0, x1, y1), "->", dst)
