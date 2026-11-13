import os
from tiles import build
img, names = build()
os.makedirs('../../assets/tuiles', exist_ok=True)
img.save('../../assets/tuiles/crypte.png')
lines = ['# Tileset `tuiles/crypte.png` — positions des tuiles', '',
         'Tuiles de 32 × 32, 8 par ligne, 256 × 192 px. Position = (colonne, ligne), en partant de 0 en haut à gauche.',
         'Les « objets » sont dessinés sur fond transparent : ils se posent par-dessus une tuile de sol ou de mur (calque d\'objets).', '',
         '| Col | Ligne | Index | Tuile | Type |', '|---|---|---|---|---|']
for (c, r), (n, k, size) in sorted(names.items(), key=lambda t: (t[0][1], t[0][0])):
    lines.append(f'| {c} | {r} | {r*8+c} | {n} | {k} |')
lines += ['', 'Cases vides : (6, 5) et (7, 5). La fontaine occupe (0-1, 4-5) ; le sarcophage occupe (2, 4-5).']
open('../../assets/tuiles/crypte-positions.md', 'w').write('\n'.join(lines) + '\n')
print(len(names), 'entrées')
