import os, sys
from scenes import *
O='../../assets/'
jobs={'decors/temple-du-seuil.png':temple,'decors/lysmont-place.png':lysmont,'decors/guilde.png':guild,
      'combat/fonds/plaine.png':plain,'combat/fonds/crypte.png':crypt_bg}
only=sys.argv[1:]
for k,f in jobs.items():
    if only and not any(o in k for o in only): continue
    os.makedirs(os.path.dirname(O+k),exist_ok=True)
    f().save(O+k, optimize=True); print(k)
