"""Recale une variante (yeux fermés, bouche…) sur le neutre par une transformation affine (ECC)."""
import sys, cv2, numpy as np
ref_p, var_p, out_p = sys.argv[1:4]
ref = cv2.imread(ref_p); var = cv2.imread(var_p)
g1 = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
g2 = cv2.cvtColor(var, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
warp = np.eye(2, 3, dtype=np.float32)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)
# Pyramide : grossier puis fin
for s in (0.25, 0.5, 1.0):
    a = cv2.resize(g1, None, fx=s, fy=s); b = cv2.resize(g2, None, fx=s, fy=s)
    w = warp.copy(); w[:, 2] *= s
    _, w = cv2.findTransformECC(a, b, w, cv2.MOTION_AFFINE, crit, None, 5)
    warp = w.copy(); warp[:, 2] /= s
al = cv2.warpAffine(var, warp, (ref.shape[1], ref.shape[0]), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite(out_p, al)
d = np.abs(ref.astype(float) - al.astype(float)).mean()
print("matrice", np.round(warp, 4).tolist(), "écart moyen", round(d, 2))
