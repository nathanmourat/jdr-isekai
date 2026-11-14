import os, sys
from heroes import *
OUT = sys.argv[1] if len(sys.argv) > 1 else '../../../assets'
for k, s in CLASSES.items():
    os.makedirs(f'{OUT}/personnages/heros/{k}', exist_ok=True)
    sheet(combat_frames(s), 64).save(f'{OUT}/personnages/heros/{k}/combat.png')
    explore_sheet(s).save(f'{OUT}/personnages/heros/{k}/exploration.png')
for r in RACES:
    os.makedirs(f'{OUT}/personnages/races/{r}', exist_ok=True)
    sheet(race_combat_frames(r), 64).save(f'{OUT}/personnages/races/{r}/calque-combat.png')
    race_explore_sheet(r).save(f'{OUT}/personnages/races/{r}/calque-exploration.png')
print('ok')
