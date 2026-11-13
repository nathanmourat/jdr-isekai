"""Génère le catalogue d'équipements (equipements.yaml + equipements.xlsx).

Toutes les stats viennent des règles de CONCEPTION-EQUIPEMENTS.md.
Les objets nommés (rares, épiques, légendaires) sont écrits à la main dans objets-nommes.yaml.
Lancer :  python3 generer.py   (il faut les modules pyyaml et openpyxl)
"""
import math
import sys
from pathlib import Path

import yaml
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

ICI = Path(__file__).resolve().parent

# ── Règles ───────────────────────────────────────────────────────────────
PALIERS = [  # (code, niveau requis, chapitre, région)
    ("I", 1, 1, "Aubeclaire"),
    ("II", 8, 2, "Marche des Sables"),
    ("III", 15, 3, "Sylvenoire"),
    ("IV", 22, 4, "Monts Grisfer / Archipel"),
    ("V", 28, 5, "Mur d'Aube"),
    ("VI", 34, 6, "Terres Cendrées"),
    ("X", 40, "fin de saison", "Reliques du Voile"),
]
STANDARD = PALIERS[:6]  # les paliers des chapitres ; X est réservé aux armes mythiques
NIVEAU = {p[0]: p[1] for p in PALIERS}
INDEX = {p[0]: i for i, p in enumerate(PALIERS)}

RARETES = {  # id: (nom, multiplicateur, nombre d'effets, couleur)
    "commun": ("Commun", 1.0, 0, "BDBDBD"),
    "peu-commun": ("Peu commun", 1.2, 0, "81C784"),
    "rare": ("Rare", 1.4, 1, "64B5F6"),
    "epique": ("Épique", 1.6, 2, "BA68C8"),
    "legendaire": ("Légendaire", 1.8, 2, "FFD54F"),
    "mythique": ("Mythique", 2.0, 3, "E53935"),
}
# Rareté maximum autorisée à chaque palier
MAX_RARETE = {"I": "peu-commun", "II": "rare", "III": "epique", "IV": "epique", "V": "legendaire", "VI": "legendaire", "X": "mythique"}

CARACS = ["FOR", "AGI", "INT", "VIT", "ESP", "CHA"]
ELEMENTS = ["feu", "glace", "foudre", "sacre", "ombre", "poison", "arcane"]
NOM_ELEMENT = {"feu": "feu", "glace": "glace", "foudre": "foudre", "sacre": "sacré", "ombre": "ombre", "poison": "poison", "arcane": "arcane"}

CLASSES = {
    "lame-runique": "Lame runique", "arcaniste": "Arcaniste élémentaire", "invocateur": "Invocateur",
    "ombre": "Ombre", "gardien": "Gardien sacré", "alchimiste": "Alchimiste-artificier",
    "archer": "Archer spirituel", "guerisseur": "Guérisseur", "berserker": "Berserker draconique",
    "barde": "Barde enchanteur",
}
TOUTES = list(CLASSES)

# Valeur des effets par palier (I → VI, puis X)
EFFETS = {
    "critique": ([0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08], "Critique"),
    "precision": ([0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09], "Précision"),
    "resistance": ([0.05, 0.08, 0.11, 0.14, 0.17, 0.20, 0.23], "Résistance"),
    "touche": ([2, 3, 4, 5, 6, 7, 8], "Touche élémentaire"),
    "mana": ([5, 10, 15, 20, 25, 30, 35], "Mana max"),
    "vigueur": ([0.03, 0.04, 0.05, 0.07, 0.08, 0.10, 0.12], "PV max"),
}

# Types : emplacement, classes, arme physique ?, répartition des points (armure = 2 par point)
TYPES = {
    # Armes
    "epee": ("arme", "Épée", ["lame-runique", "gardien"], True, [("FOR", .8), ("VIT", .2)]),
    "deux-mains": ("arme", "Arme à deux mains", ["berserker", "lame-runique"], True, [("FOR", 1)]),
    "masse": ("arme", "Masse / marteau", ["gardien", "berserker"], True, [("FOR", .7), ("VIT", .3)]),
    "dague": ("arme", "Dague / lame courte", ["ombre", "barde"], True, [("AGI", .8), ("CHA", .2)]),
    "arc": ("arme", "Arc", ["archer"], True, [("AGI", .7), ("ESP", .3)]),
    "arbalete": ("arme", "Arbalète / lance-fioles", ["alchimiste", "archer"], False, [("INT", .6), ("AGI", .4)]),
    "baton": ("arme", "Bâton", ["arcaniste", "invocateur", "guerisseur"], False, [("INT", .5), ("ESP", .5)]),
    "sceptre": ("arme", "Sceptre", ["guerisseur", "gardien"], False, [("ESP", .7), ("VIT", .3)]),
    "orbe": ("arme", "Orbe / grimoire", ["invocateur", "arcaniste"], False, [("INT", .7), ("ESP", .3)]),
    "instrument": ("arme", "Instrument", ["barde"], False, [("CHA", .7), ("AGI", .3)]),
    # Tenues
    "lourde": ("armure", "Tenue lourde", ["gardien", "berserker", "lame-runique"], None, [("armure", .6), ("VIT", .2), ("FOR", .2)]),
    "intermediaire": ("armure", "Tenue intermédiaire", ["ombre", "archer", "alchimiste", "barde"], None, [("armure", .5), ("AGI", .25), ("VIT", .25)]),
    "legere": ("armure", "Tenue légère", ["arcaniste", "invocateur", "guerisseur"], None, [("armure", .3), ("ESP", .35), ("INT", .35)]),
    # Accessoires
    "bouclier": ("accessoire", "Bouclier", ["gardien", "lame-runique"], None, [("armure", .6), ("VIT", .4)]),
    "anneau": ("accessoire", "Anneau", TOUTES, None, [("AGI", .5), ("CHA", .5)]),
    "amulette": ("accessoire", "Amulette", TOUTES, None, [("ESP", .5), ("INT", .5)]),
    "talisman": ("accessoire", "Talisman", TOUTES, None, [("VIT", .6), ("FOR", .4)]),
    "carquois": ("accessoire", "Carquois", ["archer"], None, [("AGI", .6), ("ESP", .4)]),
    "sacoche": ("accessoire", "Sacoche", ["alchimiste"], None, [("INT", .6), ("AGI", .4)]),
}

# Noms des objets génériques, palier I → VI
NOMS = {
    "epee": ["Épée courte", "Cimeterre des caravanes", "Épée-feuille sylvaine", "Épée de Grisfer", "Épée d'aube-acier", "Épée de cendracier"],
    "deux-mains": ["Hache de bûcheron", "Grande hache du désert", "Espadon sylvain", "Espadon de forge-lave", "Grande hache d'aube-acier", "Espadon de cendracier"],
    "masse": ["Masse de fer", "Marteau des caravaniers", "Masse de cœur-de-chêne", "Marteau de forge naine", "Marteau d'aube-acier", "Masse de cendracier"],
    "dague": ["Dague fine", "Kriss du désert", "Dague-épine sylvaine", "Stylet de Grisfer", "Dague d'aube-acier", "Dague de cendracier"],
    "arc": ["Arc court", "Arc composite du désert", "Arc long sylvain", "Arc de fer-souple", "Arc d'aube-bois", "Arc de cendre-if"],
    "arbalete": ["Arbalète de poing", "Lance-fioles du bazar", "Arbalète de bois-vif", "Arbalète à vapeur", "Arbalète d'aube-acier", "Arbalète de cendracier"],
    "baton": ["Bâton d'apprenti", "Bâton de mage du désert", "Bâton de bois-de-lune", "Bâton de basalte", "Bâton d'aube-cristal", "Bâton de cendre-cristal"],
    "sceptre": ["Sceptre de novice", "Sceptre de l'oasis", "Sceptre de sève", "Sceptre de cristal de mine", "Sceptre d'aube-cristal", "Sceptre de cendre-cristal"],
    "orbe": ["Orbe de verre", "Orbe de sable fondu", "Grimoire de feuilles", "Orbe de lave figée", "Orbe d'aube-cristal", "Grimoire de cendre"],
    "instrument": ["Flûte de roseau", "Oud du bazar", "Harpe sylvaine", "Cornemuse de Grisfer", "Luth d'aube-bois", "Luth de cendre-if"],
    "lourde": ["Cotte de mailles", "Armure à écailles du désert", "Cuirasse d'écorce", "Plates de Grisfer", "Plates d'aube-acier", "Plates de cendracier"],
    "intermediaire": ["Armure de cuir", "Cuir de nomade", "Cuir de cerf sylvain", "Cuir renforcé de Grisfer", "Brigandine d'aube-acier", "Cuir de cendre"],
    "legere": ["Robe de mage", "Robe de soie du désert", "Robe de brume", "Robe de laine de forge", "Robe d'aube-soie", "Robe de cendre-soie"],
    "bouclier": ["Bouclier de bois", "Rondache du désert", "Bouclier de chêne", "Pavois de Grisfer", "Bouclier d'aube-acier", "Bouclier de cendracier"],
    "anneau": ["Anneau de cuivre", "Anneau de turquoise", "Anneau de bois-de-lune", "Anneau de rubis de mine", "Anneau d'aube-or", "Anneau de cendre-or"],
    "amulette": ["Amulette de bois", "Amulette de verre-sable", "Amulette de sève", "Amulette de basalte", "Amulette d'aube-cristal", "Amulette de cendre-cristal"],
    "talisman": ["Talisman d'os", "Talisman de croc de chacal", "Talisman de racine", "Talisman de fer de forge", "Talisman d'aube-pierre", "Talisman de cendre-pierre"],
    "carquois": ["Carquois de cuir", "Carquois du nomade", "Carquois sylvain", "Carquois de Grisfer", "Carquois d'aube-cuir", "Carquois de cendre-cuir"],
    "sacoche": ["Sacoche d'herboriste", "Sacoche du bazar", "Sacoche de feuilles", "Sacoche de forge", "Sacoche d'aube-cuir", "Sacoche de cendre-cuir"],
}

# Les 7 objets déjà dans le jeu : id, nom, description, prix et stats conservés (armure de cuir : 3 → 4)
EXISTANTS = {
    "epee": ("epee-courte", "Épée courte", "+2 de puissance d'attaque.", 40, {"puissance": 2}),
    "dague": ("dague", "Dague fine", "+1 de puissance, +1 AGI.", 35, {"puissance": 1, "AGI": 1}),
    "baton": ("baton-apprenti", "Bâton d'apprenti", "+1 INT, +1 ESP.", 40, {"INT": 1, "ESP": 1}),
    "arc": ("arc-court", "Arc court", "+2 de puissance d'attaque.", 40, {"puissance": 2}),
    "bouclier": ("bouclier-bois", "Bouclier de bois", "+3 d'armure.", 30, {"armure": 3}),
    "intermediaire": ("armure-cuir", "Armure de cuir", "+4 d'armure.", 45, {"armure": 4}),
    "legere": ("robe-mage", "Robe de mage", "+1 d'armure, +1 ESP.", 40, {"armure": 1, "ESP": 1}),
}

# Pour le tableau de comparaison : caractéristique principale et équipement type de chaque classe
PROFILS = {  # classe: (carac principale, valeur niveau 1, VIT niveau 1, arme, tenue, accessoire)
    "lame-runique": ("FOR", 12, 10, "epee", "lourde", "bouclier"),
    "arcaniste": ("INT", 15, 8, "baton", "legere", "amulette"),
    "invocateur": ("INT", 14, 9, "orbe", "legere", "amulette"),
    "ombre": ("AGI", 15, 9, "dague", "intermediaire", "anneau"),
    "gardien": ("FOR", 11, 15, "masse", "lourde", "bouclier"),
    "alchimiste": ("INT", 14, 9, "arbalete", "intermediaire", "sacoche"),
    "archer": ("AGI", 14, 9, "arc", "intermediaire", "carquois"),
    "guerisseur": ("ESP", 15, 10, "sceptre", "legere", "amulette"),
    "berserker": ("FOR", 15, 13, "deux-mains", "lourde", "talisman"),
    "barde": ("CHA", 14, 9, "instrument", "intermediaire", "anneau"),
}
ARMURE_CLASSE = {"lame-runique": 6, "arcaniste": 3, "invocateur": 2, "ombre": 4, "gardien": 10, "alchimiste": 4,
                 "archer": 3, "guerisseur": 3, "berserker": 6, "barde": 3}


# ── Calculs ──────────────────────────────────────────────────────────────
def arrondi(x: float) -> int:
    """Arrondi au plus proche, 0,5 vers le haut."""
    return int(math.floor(x + 0.5))


def budget(niveau: int, rarete: str) -> int:
    return arrondi((2 + 0.3 * niveau) * RARETES[rarete][1])


def repartir(points: int, poids: list) -> dict:
    """Répartit des points entiers selon des poids (méthode du plus grand reste)."""
    total = sum(p for _, p in poids)
    bruts = [(cle, points * p / total) for cle, p in poids]
    res = {cle: int(math.floor(v)) for cle, v in bruts}
    reste = points - sum(res.values())
    for cle, v in sorted(bruts, key=lambda kv: kv[1] - math.floor(kv[1]), reverse=True)[:reste]:
        res[cle] += 1
    return res


def stats(type_id: str, niveau: int, b: int) -> dict:
    """Bonus d'un objet : {'puissance', 'armure', FOR…} à partir de son budget."""
    emplacement, _, _, physique, poids = TYPES[type_id]
    puissance = 0
    if emplacement == "arme":
        plafond = 1 + niveau // 5
        puissance = min(plafond, b // 3 if physique else b // 4)
    pts = repartir(b - puissance, poids)
    res = {"puissance": puissance, "armure": 2 * pts.pop("armure", 0)}
    res.update(pts)
    return res


def points_utilises(s: dict) -> float:
    return s.get("puissance", 0) + s.get("armure", 0) / 2 + sum(s.get(c, 0) for c in CARACS)


def prix(b: int, niveau: int) -> int:
    return int(5 * arrondi(20 * b * (1 + niveau / 10) / 5))


def effet(code: str, palier: str) -> dict:
    nom, _, element = code.partition(":")
    if nom not in EFFETS:
        raise ValueError(f"effet inconnu : {code}")
    valeur = EFFETS[nom][0][INDEX[palier]]
    e = {"effet": nom}
    if element:
        if element not in ELEMENTS:
            raise ValueError(f"élément inconnu : {code}")
        e["element"] = element
    e["puissance" if nom == "touche" else "valeur"] = valeur
    return e


def texte_effet(e: dict) -> str:
    nom = e["effet"]
    if nom == "touche":
        el = NOM_ELEMENT[e["element"]]
        prefixe = "d'" if el[0] in "aeiou" else "de "
        return f"Touche {prefixe}{el} (+{e['puissance']} puissance)"
    if nom == "resistance":
        return f"Résistance ({NOM_ELEMENT[e['element']]}) +{round(e['valeur'] * 100)} %"
    if nom == "mana":
        return f"Mana max +{e['valeur']}"
    return f"{EFFETS[nom][1]} +{round(e['valeur'] * 100)} %"


def description_stats(s: dict) -> str:
    morceaux = []
    if s.get("puissance"):
        morceaux.append(f"+{s['puissance']} de puissance")
    if s.get("armure"):
        morceaux.append(f"+{s['armure']} d'armure")
    morceaux += [f"+{s[c]} {c}" for c in CARACS if s.get(c)]
    return ", ".join(morceaux)


def objet(id_, nom, description, type_id, palier, rarete, s, effets=(), pouvoir=None, pense_pour=None, prix_=None, existant=False):
    niveau = NIVEAU[palier]
    b = budget(niveau, rarete)
    return {
        "id": id_, "nom": nom, "description": description, "categorie": type_id, "palier": palier,
        "niveau": niveau, "rarete": rarete, "budget": b, "stats": s, "effets": list(effets),
        "pouvoir": pouvoir, "pense_pour": pense_pour, "prix": prix_ if prix_ is not None else prix(b, niveau),
        "existant": existant, "unique": rarete == "mythique",
    }


def generiques() -> list:
    res = []
    for type_id, (emplacement, libelle, classes, _, _) in TYPES.items():
        for i, (palier, niveau, _, _) in enumerate(STANDARD):
            nom = NOMS[type_id][i]
            for rarete in ("commun", "peu-commun"):
                b = budget(niveau, rarete)
                if palier == "I" and rarete == "commun" and type_id in EXISTANTS:
                    id_, nom_e, desc, px, st = EXISTANTS[type_id]
                    s = {"puissance": st.get("puissance", 0), "armure": st.get("armure", 0), **{c: st[c] for c in CARACS if c in st}}
                    res.append(objet(id_, nom_e, desc, type_id, palier, rarete, s, prix_=px, existant=True))
                    continue
                s = stats(type_id, niveau, b)
                base = f"{type_id}-{palier.lower()}"
                if rarete == "commun":
                    res.append(objet(base, nom, f"{libelle} du palier {palier}. {description_stats(s)}.", type_id, palier, rarete, s))
                else:
                    res.append(objet(base + "-maitre", f"{nom} de maître", f"Version soignée par un maître artisan. {description_stats(s)}.", type_id, palier, rarete, s))
    return res


def slug(nom: str) -> str:
    import unicodedata
    s = unicodedata.normalize("NFKD", nom.split(",")[0]).encode("ascii", "ignore").decode().lower()
    s = "".join(ch if ch.isalnum() else "-" for ch in s)
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-")


def nommes() -> list:
    donnees = yaml.safe_load((ICI / "objets-nommes.yaml").read_text(encoding="utf-8"))
    res = []
    for classe, liste in donnees.items():
        if classe != "mythiques" and classe not in CLASSES:
            raise ValueError(f"classe inconnue dans objets-nommes.yaml : {classe}")
        for o in liste:
            niveau = NIVEAU[o["palier"]]
            b = budget(niveau, o["rarete"])
            s = stats(o["type"], niveau, b)
            effets = [effet(code, o["palier"]) for code in o.get("effets", [])]
            res.append(objet(slug(o["nom"]), o["nom"], o["description"], o["type"], o["palier"], o["rarete"], s,
                             effets, o.get("pouvoir"), None if classe == "mythiques" else classe))
    return res


# ── Vérifications ────────────────────────────────────────────────────────
def verifier(objets: list) -> list:
    erreurs = []
    ids = [o["id"] for o in objets]
    for i in sorted(set(i for i in ids if ids.count(i) > 1)):
        erreurs.append(f"id en double : {i}")
    for o in objets:
        utilises = points_utilises(o["stats"])
        if not o["existant"] and utilises != o["budget"]:
            erreurs.append(f"{o['id']} : {utilises} points utilisés pour un budget de {o['budget']}")
        if o["existant"] and utilises > o["budget"]:
            erreurs.append(f"{o['id']} (existant) dépasse son budget")
        attendu = RARETES[o["rarete"]][2]
        if len(o["effets"]) != attendu:
            erreurs.append(f"{o['id']} : {len(o['effets'])} effet(s), {attendu} attendu(s) pour {o['rarete']}")
        if o["rarete"] == "legendaire" and not o["pouvoir"]:
            erreurs.append(f"{o['id']} : légendaire sans pouvoir unique")
        if TYPES[o["categorie"]][0] == "arme" and o["stats"]["puissance"] > 1 + o["niveau"] // 5 and not o["existant"]:
            erreurs.append(f"{o['id']} : puissance au-dessus du plafond")
        if o["pense_pour"] and o["pense_pour"] not in TYPES[o["categorie"]][2]:
            erreurs.append(f"{o['id']} : pensé pour {o['pense_pour']}, qui ne peut pas utiliser « {o['categorie']} »")
    ordre = list(RARETES)
    for o in objets:
        if ordre.index(o["rarete"]) > ordre.index(MAX_RARETE[o["palier"]]):
            erreurs.append(f"{o['id']} : {o['rarete']} interdit au palier {o['palier']}")
        if o["palier"] == "X" and o["rarete"] != "mythique":
            erreurs.append(f"{o['id']} : le palier X est réservé aux mythiques")
    mythiques = [o for o in objets if o["rarete"] == "mythique"]
    if len(mythiques) != 6:
        erreurs.append(f"{len(mythiques)} armes mythiques, 6 attendues")
    for o in mythiques:
        if TYPES[o["categorie"]][0] != "arme":
            erreurs.append(f"{o['id']} : un mythique doit être une arme")
    for classe in CLASSES:
        if not any(classe in TYPES[o["categorie"]][2] for o in mythiques):
            erreurs.append(f"{classe} ne peut utiliser aucune arme mythique")
    for classe in CLASSES:
        for palier, *_ in STANDARD:
            for emplacement in ("arme", "armure", "accessoire"):
                if not any(TYPES[o["categorie"]][0] == emplacement and classe in TYPES[o["categorie"]][2]
                           and o["palier"] == palier for o in objets):
                    erreurs.append(f"{classe} n'a pas de {emplacement} au palier {palier}")
        attendus = {"I": {"peu-commun": 2}, "II": {"rare": 2}, "V": {"rare": 1, "epique": 1, "legendaire": 1}}
        for palier, *_ in STANDARD:
            voulu = attendus.get(palier, {"rare": 1, "epique": 1})
            trouve = {}
            for o in objets:
                if o["pense_pour"] == classe and o["palier"] == palier:
                    trouve[o["rarete"]] = trouve.get(o["rarete"], 0) + 1
            if trouve != voulu:
                erreurs.append(f"{classe}, palier {palier} : objets nommés {trouve}, attendu {voulu}")
    return erreurs


# ── Sorties ──────────────────────────────────────────────────────────────
def vers_yaml(objets: list) -> str:
    sortie = []
    for o in objets:
        s = o["stats"]
        bonus = {}
        if s.get("armure"):
            bonus["armure"] = s["armure"]
        if s.get("puissance"):
            bonus["puissance"] = s["puissance"]
        caracs = {c: s[c] for c in CARACS if s.get(c)}
        if caracs:
            bonus["caracs"] = caracs
        e = {
            "id": o["id"], "nom": o["nom"], "description": o["description"], "type": "equipement",
            "emplacement": TYPES[o["categorie"]][0], "prix": o["prix"], "bonus": bonus,
            "rarete": o["rarete"], "palier": o["palier"], "niveau": o["niveau"], "categorie": o["categorie"],
            "classes": TYPES[o["categorie"]][2],
        }
        if o["effets"]:
            e["effets_equipement"] = o["effets"]
        if o["pouvoir"]:
            e["pouvoir_unique"] = o["pouvoir"]
        if o["unique"]:
            e["unique_par_partie"] = True
        sortie.append(e)
    entete = ("# Catalogue d'équipements — généré par generer.py, ne pas modifier à la main.\n"
              "# Champs nouveaux (le moteur ne les connaît pas encore) : rarete, niveau, categorie, classes,\n"
              "# palier, effets_equipement, pouvoir_unique, unique_par_partie. Voir CONCEPTION-EQUIPEMENTS.md § 12.\n")
    class SansAlias(yaml.SafeDumper):
        def ignore_aliases(self, data):
            return True
    return entete + yaml.dump({"objets": sortie}, Dumper=SansAlias, allow_unicode=True, sort_keys=False, width=140)


def ecrire_excel(objets: list, chemin: Path):
    wb = Workbook()
    gras = Font(bold=True)
    entete_fill = PatternFill("solid", fgColor="37474F")
    entete_font = Font(bold=True, color="FFFFFF")

    def entete(ws, colonnes, largeurs):
        ws.append(colonnes)
        for i, w in enumerate(largeurs, 1):
            c = ws.cell(row=ws.max_row, column=i)
            c.fill, c.font = entete_fill, entete_font
            c.alignment = Alignment(wrap_text=True, vertical="center")
            ws.column_dimensions[get_column_letter(i)].width = w

    # 1. Catalogue
    ws = wb.active
    ws.title = "Catalogue"
    cols = ["Nom", "Rareté", "Palier", "Niveau requis", "Emplacement", "Catégorie", "Classes autorisées", "Pensé pour",
            "Puissance", "Armure", "FOR", "AGI", "INT", "VIT", "ESP", "CHA", "Points (budget)", "Effets spéciaux",
            "Pouvoir unique", "Prix (or)", "Description", "Remarque", "ID"]
    entete(ws, cols, [34, 12, 8, 9, 12, 20, 40, 20, 9, 8, 6, 6, 6, 6, 6, 6, 9, 42, 40, 9, 60, 22, 34])
    ordre_r = list(RARETES)
    ordre_e = {"arme": 0, "armure": 1, "accessoire": 2}
    for o in sorted(objets, key=lambda o: (INDEX[o["palier"]], ordre_e[TYPES[o["categorie"]][0]], o["categorie"], ordre_r.index(o["rarete"]))):
        s = o["stats"]
        emplacement = {"arme": "Arme", "armure": "Tenue", "accessoire": "Accessoire"}[TYPES[o["categorie"]][0]]
        ligne = [o["nom"], RARETES[o["rarete"]][0], o["palier"], o["niveau"], emplacement, TYPES[o["categorie"]][1],
                 ", ".join(CLASSES[c] for c in TYPES[o["categorie"]][2]) if TYPES[o["categorie"]][2] != TOUTES else "Toutes",
                 CLASSES.get(o["pense_pour"], ""), s.get("puissance") or None, s.get("armure") or None,
                 *[s.get(c) or None for c in CARACS], o["budget"], " ; ".join(texte_effet(e) for e in o["effets"]),
                 o["pouvoir"] or "", o["prix"], o["description"], "Objet déjà dans le jeu" if o["existant"] else ("Un seul exemplaire par partie" if o["unique"] else ""), o["id"]]
        ws.append(ligne)
        ws.cell(row=ws.max_row, column=2).fill = PatternFill("solid", fgColor=RARETES[o["rarete"]][3])
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(cols))}{ws.max_row}"

    # 2. Règles
    wr = wb.create_sheet("Règles")
    wr.column_dimensions["A"].width = 26
    for col in "BCDEFG":
        wr.column_dimensions[col].width = 16

    def titre(t):
        wr.append([])
        wr.append([t])
        wr.cell(row=wr.max_row, column=1).font = Font(bold=True, size=13)

    titre("Formule")
    wr.append(["Points (budget) = (2 + 0,3 × niveau requis) × multiplicateur de rareté, arrondi"])
    wr.append(["1 point = 1 caractéristique = 1 puissance = 2 d'armure"])
    wr.append(["Puissance d'une arme : au plus 1 + niveau ÷ 5 ; armes physiques = 1/3 du budget, armes magiques = 1/4, le reste en caractéristiques"])
    wr.append(["Prix = 20 × points × (1 + niveau ÷ 10), arrondi à 5 (à recaler avec l'économie du jeu)"])
    titre("Raretés")
    wr.append(["Rareté", "Multiplicateur", "Effets spéciaux", "Où l'obtenir"])
    ou = {"commun": "boutiques", "peu-commun": "boutiques, contrats", "rare": "butin, quêtes", "epique": "boss, donjons", "legendaire": "quête de classe (palier V)", "mythique": "quêtes cachées du ch. 6, boss final"}
    for r, (nom, m, n, couleur) in RARETES.items():
        wr.append([nom, m, {"legendaire": "2 + pouvoir unique", "mythique": "3 + pouvoir majeur"}.get(r, n), ou[r]])
        wr.cell(row=wr.max_row, column=1).fill = PatternFill("solid", fgColor=couleur)
    titre("Rareté maximum par palier")
    wr.append(["Palier", "Rareté maximum"])
    for code, *_ in PALIERS:
        wr.append([code, RARETES[MAX_RARETE[code]][0]])
        wr.cell(row=wr.max_row, column=2).fill = PatternFill("solid", fgColor=RARETES[MAX_RARETE[code]][3])
    titre("Points par palier et rareté")
    wr.append(["Palier (niveau, chapitre)"] + [RARETES[r][0] for r in RARETES])
    for code, niveau, chap, region in PALIERS:
        lim = list(RARETES).index(MAX_RARETE[code])
        debut = 0 if code != "X" else lim
        wr.append([f"{code} — niv. {niveau} — ch. {chap} ({region})"] + [budget(niveau, r) if debut <= i <= lim else "—" for i, r in enumerate(RARETES)])
    titre("Effets spéciaux : valeur par palier")
    wr.append(["Effet"] + [p[0] for p in PALIERS])
    for nom, (valeurs, libelle) in EFFETS.items():
        wr.append([libelle] + [v if nom in ("touche", "mana") else f"{round(v * 100)} %" for v in valeurs])
    titre("Catégories et classes")
    wr.append(["Catégorie", "Emplacement", "Classes", "Répartition des points"])
    for t, (emp, lib, classes, _, poids) in TYPES.items():
        wr.append([lib, {"arme": "Arme", "armure": "Tenue", "accessoire": "Accessoire"}[emp],
                   "Toutes" if classes == TOUTES else ", ".join(CLASSES[c] for c in classes),
                   ", ".join(f"{k} {round(p * 100)} %" for k, p in poids)])

    # 3. Comparaison des dégâts
    wc = wb.create_sheet("Comparaison")
    entete(wc, ["Classe", "Palier", "Niveau", "Carac. principale sans équipement", "+ équipement commun",
                "+ équipement épique", "Dégâts en plus (commun)", "Dégâts en plus (épique)",
                "Dégâts physiques subis (épique, par rapport à sans équipement)"], [22, 7, 7, 16, 14, 14, 14, 14, 22])
    wc.append(["Hypothèse : le héros met la moitié de ses points de niveau (1,5 par niveau) dans sa caractéristique principale et 0,5 en VIT. Équipement : arme + tenue + accessoire typiques de la classe."])
    for classe, (carac, base, vit, arme, tenue, acc) in PROFILS.items():
        for code, niveau, *_ in STANDARD:
            stat0 = base + 1.5 * (niveau - 1)
            vit0 = vit + 0.5 * (niveau - 1)
            gains = {}
            for r in ("commun", "epique"):
                total = {"carac": 0, "VIT": 0, "armure": 0}
                for t in (arme, tenue, acc):
                    s = stats(t, niveau, budget(niveau, r))
                    total["carac"] += s.get(carac, 0)
                    total["VIT"] += s.get("VIT", 0) if carac != "VIT" else 0
                    total["armure"] += s.get("armure", 0)
                gains[r] = total
            def facteur(st):
                return 1 + st / 20
            d_c = facteur(stat0 + gains["commun"]["carac"]) / facteur(stat0) - 1
            d_e = facteur(stat0 + gains["epique"]["carac"]) / facteur(stat0) - 1
            def0 = 2 * vit0 + ARMURE_CLASSE[classe]
            def1 = 2 * (vit0 + gains["epique"]["VIT"]) + ARMURE_CLASSE[classe] + gains["epique"]["armure"]
            subis = (100 / (100 + def1)) / (100 / (100 + def0)) - 1
            wc.append([CLASSES[classe], code, niveau, round(stat0), f"+{gains['commun']['carac']}", f"+{gains['epique']['carac']}",
                       f"+{round(d_c * 100)} %", f"+{round(d_e * 100)} %", f"{round(subis * 100)} %"])
    wc.freeze_panes = "A2"

    # 4. Par classe : objets nommés
    wp = wb.create_sheet("Objets nommés")
    entete(wp, ["Pensé pour", "Palier", "Rareté", "Nom", "Emplacement", "Stats", "Effets spéciaux", "Pouvoir unique", "Description"],
           [22, 7, 11, 40, 12, 34, 44, 44, 70])
    for classe in CLASSES:
        for o in sorted((o for o in objets if o["pense_pour"] == classe), key=lambda o: (INDEX[o["palier"]], ordre_r.index(o["rarete"]))):
            wp.append([CLASSES[classe], o["palier"], RARETES[o["rarete"]][0], o["nom"],
                       {"arme": "Arme", "armure": "Tenue", "accessoire": "Accessoire"}[TYPES[o["categorie"]][0]],
                       description_stats(o["stats"]), " ; ".join(texte_effet(e) for e in o["effets"]), o["pouvoir"] or "", o["description"]])
            wp.cell(row=wp.max_row, column=3).fill = PatternFill("solid", fgColor=RARETES[o["rarete"]][3])
    for o in (o for o in objets if o["rarete"] == "mythique"):
        wp.append(["Relique du Voile (" + ", ".join(CLASSES[c] for c in TYPES[o["categorie"]][2]) + ")", o["palier"], RARETES[o["rarete"]][0], o["nom"], "Arme",
                   description_stats(o["stats"]), " ; ".join(texte_effet(e) for e in o["effets"]), o["pouvoir"] or "", o["description"]])
        wp.cell(row=wp.max_row, column=3).fill = PatternFill("solid", fgColor=RARETES[o["rarete"]][3])
    wp.freeze_panes = "A2"
    wp.auto_filter.ref = f"A1:I{wp.max_row}"

    wb.save(chemin)


def main():
    objets = generiques() + nommes()
    erreurs = verifier(objets)
    if erreurs:
        print("Erreurs :")
        for e in erreurs:
            print(" -", e)
        sys.exit(1)
    (ICI / "equipements.yaml").write_text(vers_yaml(objets), encoding="utf-8")
    ecrire_excel(objets, ICI / "equipements.xlsx")
    par_rarete = {r: sum(1 for o in objets if o["rarete"] == r) for r in RARETES}
    print(f"{len(objets)} objets générés :", ", ".join(f"{RARETES[r][0]} {n}" for r, n in par_rarete.items()))


if __name__ == "__main__":
    main()
