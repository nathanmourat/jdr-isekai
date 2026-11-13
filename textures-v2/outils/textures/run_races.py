import os
from heroes import *
O = '../../assets/personnages/races'
for r in RACES:
    os.makedirs(f'{O}/{r}', exist_ok=True)
    sheet(race_combat_frames(r), 64).save(f'{O}/{r}/calque-combat.png')
    race_explore_sheet(r).save(f'{O}/{r}/calque-exploration.png')
print('ok')
