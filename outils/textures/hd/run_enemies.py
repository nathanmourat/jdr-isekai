import os
from enemies import *
O='../../../assets/ennemis'
for k,f in [('loup-gris',wolf_sheet),('gobelin-cendre',lambda: humanoid_sheet(GOBLIN)),('squelette',lambda: humanoid_sheet(SKELETON))]:
    os.makedirs(f'{O}/{k}',exist_ok=True); f().save(f'{O}/{k}/combat.png')
