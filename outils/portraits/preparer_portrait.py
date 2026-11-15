"""Prépare un portrait IA pour le jeu : détourage, recadrage 512x512, PNG transparent."""
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
crop = rgba.crop((x0, y0, x1, y1)).resize((512, 512), Image.LANCZOS)
crop.save(dst, optimize=True)
print("boîte", (x0, y0, x1, y1), "->", dst)
