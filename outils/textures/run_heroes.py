import os, sys
from heroes import *
OUT = '../../assets/personnages/heros'
for k, s in CLASSES.items():
    os.makedirs(f'{OUT}/{k}', exist_ok=True)
    sheet(combat_frames(s), 64).save(f'{OUT}/{k}/combat.png')
    explore_sheet(s).save(f'{OUT}/{k}/exploration.png')
print('ok')
