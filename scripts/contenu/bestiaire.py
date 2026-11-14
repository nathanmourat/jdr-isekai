"""
Générateur des fiches d'ennemis des chapitres 2 à 6 (saison 1).
Les caractéristiques suivent une formule par niveau et par rang ; on règle ensuite avec
`npm run equilibrage:chapitres` (simulation de combats) en changeant FACTEUR_PV / FACTEUR_DEGATS ou un ennemi précis.
Usage : python3 scripts/contenu/bestiaire.py   (réécrit content/ennemis/chapitre-N.yaml pour chaque chapitre décrit dans scripts/contenu/chN_ennemis.py)
"""
import importlib.util, os, sys

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(ICI))

# Coefficients par chapitre : aux niveaux élevés, l'équipement et les compétences rendent les héros plus forts
# que la seule formule par niveau (réglé avec npm run equilibrage:chapitres).
COEF_PV = {2: 1.0, 3: 1.0, 4: 1.35, 5: 1.55, 6: 1.75}
COEF_DEGATS = {2: 1.0, 3: 1.0, 4: 1.12, 5: 1.2, 6: 1.28}
CHAPITRE = 2

RANGS = {
    #          pv0  stat  armure  puiss  xp    or
    'faible':   (24, 0.9,  0.8,   0,    3.5,  1.0),
    'standard': (34, 1.0,  1.0,   0,    5.0,  1.5),
    'fort':     (46, 1.1,  1.2,   1,    7.0,  2.0),
    'elite':    (62, 1.2,  1.4,   2,    10.0, 3.0),
    'boss':     (150, 1.25, 1.5,  3,    30.0, 10.0),
}

def q(s):
    return '"' + s.replace('"', '\\"') + '"'

def ennemi(id, nom, description, niveau, rang, categorie, stat='FOR', element='physique', portee='melee', attaques=(), competences='', resistances=None,
           objets=(), sprite=None, facteur_pv=1.0, facteur_degats=1.0, boss=False, fuit=None, rang_combat=None, caracs=None, pv=None):
    pv0, rs, ra, rp, rx, ro = RANGS[rang]
    N = niveau
    main = round(8 + 0.75 * N * rs)
    vit = round(7 + 0.55 * N * rs)
    autre = round(5 + 0.25 * N)
    c = {'FOR': autre, 'AGI': round(7 + 0.35 * N), 'INT': autre, 'VIT': vit, 'ESP': autre, 'CHA': max(2, round(3 + 0.1 * N))}
    c[stat] = main
    if caracs: c.update(caracs)
    pvs = pv if pv is not None else round(pv0 * (1 + 0.32 * (N - 1)) * facteur_pv * COEF_PV.get(CHAPITRE, 1))
    armure = round(1 + 0.45 * N * ra)
    puissance = round((7 + 0.22 * N + rp) * facteur_degats * COEF_DEGATS.get(CHAPITRE, 1))
    xp = round(rx * N ** 1.5)
    orx = round(ro * N)
    L = []
    L.append(f"  - id: {id}")
    L.append(f"    nom: {q(nom)}")
    L.append(f"    description: {q(description)}")
    L.append(f"    niveau: {N}")
    L.append(f"    categorie: {categorie}")
    if boss or rang == 'boss': L.append("    boss: true")
    if fuit: L.append(f"    fuit_sous_pourcent: {fuit}")
    if sprite: L.append(f"    sprite: {sprite}")
    if rang_combat: L.append(f"    rang: {rang_combat}")
    L.append("    caracteristiques: { " + ", ".join(f"{k}: {v}" for k, v in c.items()) + " }")
    L.append(f"    pv: {pvs}")
    L.append(f"    armure: {armure}")
    L.append(f"    attaque: {{ stat: {stat}, element: {element}, portee: {portee}, puissance: {puissance} }}")
    if attaques:
        L.append("    attaques:")
        for a in attaques:
            nom_a, phrase, effet = a
            L.append(f"      - {{ nom: {q(nom_a)}, phrase: {q(phrase)}, effet: {effet} }}")
    if resistances:
        L.append("    resistances: { " + ", ".join(f"{k}: {v}" for k, v in resistances.items()) + " }")
    if competences.strip():
        L.append("    competences:")
        for ligne in competences.strip('\n').split('\n'):
            L.append("      " + ligne)
    obj = ", ".join(f"{{ id: {o}, chance: {ch} }}" for o, ch in objets)
    L.append(f"    recompenses: {{ xp: {xp}, or: {orx}{', objets: [' + obj + ']' if objets else ''} }}")
    return "\n".join(L)

def ecrire(chapitre, entete, ennemis, rencontres):
    texte = entete.rstrip() + "\nennemis:\n" + "\n\n".join(ennemis) + "\n\nrencontres:\n" + "\n".join("  - " + r for r in rencontres) + "\n"
    with open(os.path.join(RACINE, 'content', 'ennemis', f'chapitre-{chapitre}.yaml'), 'w') as f:
        f.write(texte)

if __name__ == '__main__':
    for n in range(2, 7):
        chemin = os.path.join(ICI, f'ch{n}_ennemis.py')
        if not os.path.exists(chemin): continue
        CHAPITRE = n
        sys.modules['bestiaire'] = sys.modules[__name__]
        spec = importlib.util.spec_from_file_location(f'ch{n}', chemin)
        m = importlib.util.module_from_spec(spec); sys.modules[f'ch{n}'] = m
        sys.path.insert(0, ICI)
        spec.loader.exec_module(m)
        ecrire(n, m.ENTETE, m.ENNEMIS, m.RENCONTRES)
        print(f"chapitre {n} : {len(m.ENNEMIS)} ennemis, {len(m.RENCONTRES)} rencontres")
