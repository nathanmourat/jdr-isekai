# Générateur des textures

Python 3 + Pillow + NumPy (`pip install pillow numpy`). Depuis ce dossier :

```
python run_heroes.py    # 10 planches de combat + 10 d'exploration
python run_enemies.py   # loup gris, gobelin cendré, squelette
python run_tiles.py     # tuiles/crypte.png + crypte-positions.md
python run_scenes.py    # 3 décors + 2 fonds de combat
python run_carte.py     # cartes/aubeclaire.png
python run_races.py     # 14 calques de race (combat + exploration)
python icons_races.py   # 8 icônes de traits raciaux
```

Les scripts écrivent dans `../../assets/` (le dossier `assets/` du projet si ce dossier est placé dans `outils/textures/`).
Couleurs et équipement d'une classe : dictionnaire `CLASSES` au début de `heroes.py`.

**Important pour les calques de race** : la trajectoire du corps (tableau `BODY` dans `heroes.py`) est commune
à toutes les classes. Si vous modifiez une planche de classe, ne touchez qu'aux bras, jambes et armes ;
si vous changez `BODY`, relancez aussi `run_races.py`.
