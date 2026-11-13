import os
from mapgen import build
os.makedirs('../../assets/cartes', exist_ok=True)
build()[0].save('../../assets/cartes/aubeclaire.png', optimize=True)
