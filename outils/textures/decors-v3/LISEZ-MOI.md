# Décors, PNJ, plan et effets (textures V3)

Python 3 + Pillow + NumPy. Depuis ce dossier :

```
python run_decors2.py      # 20 décors 1280×720 + leurs JSON (positions des PNJ et zones cliquables) + premiers plans des comptoirs
python plan_lysmont.py     # cartes/lysmont-plan.png + .json
python npcs.py             # personnages/pnj/<id>/decor.png et compagnes/aveline/decor.png (80×128, ancre = pieds)
python effets.py           # effets/*.png (bandes de 8 images 64×64)
```

Les décors sont dessinés en 640×360 puis agrandis ×2 (pixels nets).
- `decors/<id>.json` : `positions` (pieds des PNJ, centre des zones), `avant_plan` éventuel.
- Les PNJ se règlent dans le dictionnaire `PNJ` de `npcs.py` (couleurs, coiffure, accessoires).
- Ajouter un décor : une fonction dans `scenes_int.py` ou `scenes_ext.py`, puis une ligne dans `SCENES`.
