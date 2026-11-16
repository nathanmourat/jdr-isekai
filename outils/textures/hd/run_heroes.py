import os, sys
from heroes import *
# Usage : python run_heroes.py [dossier] [noms…]
#   sans nom : tout (10 classes, 7 calques de race, calques féminins) ; sinon seulement les noms donnés
#   (une classe, une race, ou « nain-f » pour le calque de l'héroïne naine).
OUT = sys.argv[1] if len(sys.argv) > 1 else '../../../assets'
NOMS = sys.argv[2:]
# Calques féminins (mise à jour 5) : la race « nain-f » dessine personnages/races/nain/calque-*-f.png (tresses, sans barbe)
VARIANTES_F = {'nain-f': 'nain'}
voulu = lambda n: not NOMS or n in NOMS
for k, s in CLASSES.items():
    if not voulu(k): continue
    os.makedirs(f'{OUT}/personnages/heros/{k}', exist_ok=True)
    sheet(combat_frames(s), 64).save(f'{OUT}/personnages/heros/{k}/combat.png')
    explore_sheet(s).save(f'{OUT}/personnages/heros/{k}/exploration.png')
for r in RACES:
    if not voulu(r): continue
    os.makedirs(f'{OUT}/personnages/races/{r}', exist_ok=True)
    sheet(race_combat_frames(r), 64).save(f'{OUT}/personnages/races/{r}/calque-combat.png')
    race_explore_sheet(r).save(f'{OUT}/personnages/races/{r}/calque-exploration.png')
for v, r in VARIANTES_F.items():
    if not voulu(v): continue
    os.makedirs(f'{OUT}/personnages/races/{r}', exist_ok=True)
    sheet(race_combat_frames(v), 64).save(f'{OUT}/personnages/races/{r}/calque-combat-f.png')
    race_explore_sheet(v).save(f'{OUT}/personnages/races/{r}/calque-exploration-f.png')
print('ok')
