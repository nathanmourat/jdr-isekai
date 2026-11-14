# Textures HD (deux fois plus de pixels)

Python 3 + Pillow + NumPy. Depuis ce dossier :

```
python run_heroes.py     # 10 classes (combat 1024×768 = cases de 128, exploration 256×256 = cases de 64) + 7 calques de race
python run_enemies.py    # loup gris, gobelin cendré, squelette (1024×512, cases de 128)
python bestiary.py       # 28 monstres du bestiaire (1024×512)
python npcs.py           # PNJ détourés 80×128 (dessinés nativement, plus de pixels)
python run_decors2.py    # 20 décors 1280×720 dessinés nativement + JSON + premiers plans
python plan_lysmont.py   # plan de Lysmont
python fonds.py          # 32 fonds de combat 1280×720 (sol dans le tiers inférieur)
```

Nouveautés par rapport à la V3 :
- `px.py` : le pinceau `P(img, k)` dessine à l'échelle k (2 ici) ; `fpx`, `fline`, `frect` posent les détails au pixel fin.
- `volume()` : reflets sur les bords haut-gauche et ombres bas-droite de chaque zone de couleur, léger dégradé vertical.
- `outline_sel()` : contour d'1 pixel fin, teinté de la couleur voisine (plus doux qu'un noir uniforme).
- `grain()` : texture de poil, de pierre ou d'écailles pour les monstres.
- Héros : jambes galbées, bottes, membres effilés, tête avec mâchoire, nez, œil (blanc, iris, pupille), sourcil, mèches.
- Les trajectoires du corps (`BODY`) n'ont pas changé : les calques de race restent alignés sur les 10 classes.
