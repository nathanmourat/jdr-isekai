"""Liste du bestiaire : du plus faible au plus fort, région par région."""
import os
from mobs import *

BONE = hexc('e8e0c8')


def H(**kw):
    base = dict(skin=hexc('f2c9a0'), hair=hexc('3a2a22'), hair_style='short', top=hexc('5a4a3a'), top2=None,
                legs=hexc('4a3a2a'), boots=hexc('3a2a1a'), weapon='sword', magic=hexc('ffffff'), attack='melee')
    base.update(kw)
    return base


# (id, nom, région, niveaux conseillés, rang, description, générateur)
MOBS = [
    # ---------------- Aubeclaire (1–10)
    ('gelee-verte', 'Gelée verte', 'Aubeclaire', '1–2', 'faible', 'Petite gelée verte qui rebondit.',
     lambda: creature_sheet(blob(dict(col=hexc('6ad04a'), s=0.8)), ko='melt', fx_y=46)),
    ('rat-geant', 'Rat géant', 'Aubeclaire', '1–3', 'faible', 'Rat brun de la taille d’un chat, queue rose.',
     lambda: creature_sheet(quadruped(dict(col=hexc('8a6a50'), dark=hexc('5a4430'), light=hexc('b89a7a'), s=0.7, head='rat',
                                           tail='thin', low=True, eye=hexc('ff3030'))), fx_y=48)),
    ('chauve-souris', 'Chauve-souris', 'Aubeclaire', '2–4', 'faible', 'Chauve-souris des cavernes.',
     lambda: creature_sheet(flyer(dict(kind='bat', col=hexc('5a4a6a'), dark=hexc('3a2e48'), eye=hexc('ff3030'))), ko='fall', fx_y=30)),
    ('sanglier', 'Sanglier des plaines', 'Aubeclaire', '3–5', 'standard', 'Sanglier brun, défenses blanches, charge.',
     lambda: creature_sheet(quadruped(dict(col=hexc('6a4a32'), dark=hexc('4a3222'), light=hexc('8a6a4a'), s=1.0, head='boar',
                                           tail='stub', spikes=True, spike_c=hexc('3a2618'), eye=hexc('ff5030'))), fx_y=44)),
    ('araignee-geante', 'Araignée géante', 'Aubeclaire', '4–6', 'standard', 'Araignée de la taille d’un chien, carapace noire et violette (liste n° 52).',
     lambda: creature_sheet(arthropod(dict(kind='spider', col=hexc('2e2838'), dark=hexc('1e1a26'), light=hexc('4a3e5a'),
                                           mark=hexc('9a4ad8'))), fx_y=46)),
    ('bandit', 'Bandit', 'Aubeclaire', '4–7', 'standard', 'Bandit humain, foulard sur le visage, gourdin (liste n° 53).',
     lambda: humanoid(H(hair=hexc('4a3020'), top=hexc('6a5a3a'), legs=hexc('4a4a3a'), weapon='club', scarf=hexc('8a2a2a'),
                        belt=LEATHER))),
    ('cultiste', 'Cultiste des Cendres', 'Aubeclaire', '6–9', 'fort', 'Robe grise à capuche, sceau violet qui brille dans la main (liste n° 54).',
     lambda: humanoid(H(hair_style='hood', hood=hexc('6a6670'), top=hexc('6a6670'), robe=hexc('6a6670'), top2=hexc('9a4ad8'),
                        weapon='none', attack='bolt', magic=hexc('b04aff'), marks=hexc('b04aff')))),

    # ---------------- Marche des Sables (8–16)
    ('chacal', 'Chacal des dunes', 'Sables', '8–10', 'standard', 'Chacal fauve aux grandes oreilles, chasse en meute.',
     lambda: creature_sheet(quadruped(dict(col=hexc('c89a5a'), dark=hexc('8a6a3a'), light=hexc('e8d0a0'), s=0.9, head='jackal',
                                           tail='bushy', eye=hexc('ffd030'))), fx_y=42)),
    ('scorpion-des-sables', 'Scorpion des sables', 'Sables', '9–12', 'standard', 'Scorpion ocre, dard noir.',
     lambda: creature_sheet(arthropod(dict(kind='scorpion', col=hexc('c8883a'), dark=hexc('8a5a24'), light=hexc('e8b060'))), fx_y=44)),
    ('pillard-du-desert', 'Pillard du désert', 'Sables', '10–13', 'standard', 'Pillard au chèche turquoise, cimeterre.',
     lambda: humanoid(H(skin=hexc('c8946a'), hair=hexc('2a1a12'), top=hexc('c8a060'), top2=hexc('3ab0a8'), legs=hexc('8a6a3a'),
                        weapon='sword', scarf=hexc('3ab0a8'), belt=hexc('3ab0a8')))),
    ('momie-de-sel', 'Momie de sel', 'Sables', '12–15', 'fort', 'Momie couverte de bandelettes, yeux turquoise (Ruines de Sel).',
     lambda: humanoid(H(skin=hexc('e8e0c8'), hair_style='none', top=hexc('d8ccb0'), legs=hexc('d8ccb0'), boots=hexc('b8ac90'),
                        weapon='none', wraps=True, eye=hexc('3af0e0'), bare_arms=True))),

    # ---------------- Sylvenoire (15–22)
    ('feu-follet', 'Feu follet', 'Sylvenoire', '15–17', 'faible', 'Esprit de lumière bleue, sans corps.',
     lambda: creature_sheet(flyer(dict(kind='wisp', col=hexc('6ad8ff'), dark=hexc('1a3a5a'))), ko='melt', fx_y=30)),
    ('champignon-veneneux', 'Champignon vénéneux', 'Sylvenoire', '15–18', 'standard', 'Myconide au chapeau violet, crache des spores.',
     lambda: creature_sheet(mushroom(dict(cap=hexc('8a3ab0'), spots=hexc('e8d8f8'), spore=hexc('c08aff'))), fx_y=40)),
    ('loup-spectral', 'Loup spectral', 'Sylvenoire', '17–20', 'fort', 'Loup translucide bleu brume, yeux blancs.',
     lambda: creature_sheet(quadruped(dict(col=hexc('7aa8d8'), dark=hexc('4a6a9a'), light=hexc('b8d8f8'), s=0.95, head='wolf',
                                           tail='bushy', spikes=True, eye=hexc('ffffff'), glow_eye=True, alpha=0.8,
                                           aura=hexc('b8e8ff'))), fx_y=42)),
    ('sylvain-corrompu', 'Sylvain corrompu', 'Sylvenoire', '19–22', 'fort', 'Arbre vivant aux feuilles tachées de violet.',
     lambda: creature_sheet(golem(dict(kind='tree', col=hexc('6a4a2e'), dark=hexc('4a321e'), light=hexc('8a6a44'),
                                       leaf=hexc('2e5a3a'), rot=hexc('9a4ad8'), eye=hexc('d8ff6a'))), ko='crumble', fx_y=40)),

    # ---------------- Monts Grisfer (20–28)
    ('chauve-souris-de-lave', 'Chauve-souris de lave', 'Grisfer', '20–22', 'standard', 'Chauve-souris noire aux ailes rougeoyantes.',
     lambda: creature_sheet(flyer(dict(kind='bat', col=hexc('2a2026'), dark=hexc('1a1418'), wing=hexc('a8321a'),
                                       eye=hexc('ffd84a'), aura=hexc('ff8a3a'))), ko='fall', fx_y=30)),
    ('kobold-mineur', 'Kobold mineur', 'Grisfer', '20–23', 'standard', 'Petit kobold écailleux, pioche et casque de mineur.',
     lambda: humanoid(H(skin=hexc('a8643a'), hair_style='none', top=hexc('5a5a64'), legs=hexc('4a3a2a'), weapon='pick',
                        nose=True, ears=True, eye=hexc('ffd030'), helmet=True))),
    ('gelee-de-magma', 'Gelée de magma', 'Grisfer', '22–25', 'standard', 'Gelée de roche fondue, brûlante.',
     lambda: creature_sheet(blob(dict(col=hexc('e8521a'), s=1.05, eye=hexc('fff4a0'), aura=hexc('ffb03a'),
                                      bubbles=[(-5, -6, 2), (5, -3, 1.5), (0, -9, 1)])), ko='melt', fx_y=46)),
    ('salamandre', 'Salamandre de forge', 'Grisfer', '23–26', 'fort', 'Lézard des forges, queue enflammée, crache du feu.',
     lambda: creature_sheet(quadruped(dict(col=hexc('c8422a'), dark=hexc('8a2a1a'), light=hexc('f0a040'), s=0.95, head='lizard',
                                           tail='lizard', tail_fire=True, low=True, scales=True, breath=True,
                                           eye=hexc('ffd84a'))), fx_y=44)),
    ('golem-de-pierre', 'Golem de pierre', 'Grisfer', '25–28', 'fort', 'Golem de granite, rune bleue sur le torse.',
     lambda: creature_sheet(golem(dict(col=hexc('8a8478'), dark=hexc('5a564e'), light=hexc('aaa498'), rune=hexc('5fd3ff'),
                                       moss=hexc('5a7a3a'))), ko='crumble', fx_y=50)),

    # ---------------- Archipel des Brumes (22–30)
    ('crabe-des-recifs', 'Crabe des récifs', 'Brumes', '22–25', 'standard', 'Gros crabe rouge couvert de coquillages.',
     lambda: creature_sheet(arthropod(dict(kind='crab', col=hexc('c8422a'), dark=hexc('8a2a1a'), light=hexc('e87a5a'),
                                           barnacles=hexc('d8d0b8'))), fx_y=34)),
    ('pirate-noye', 'Pirate noyé', 'Brumes', '24–28', 'fort', 'Squelette de pirate, bandeau rouge, sabre, coquillages.',
     lambda: humanoid(H(skin=BONE, hair_style='none', top=hexc('2a5a5a'), top2=hexc('c8a050'), legs=BONE, boots=hexc('3a3a2a'),
                        weapon='sword', skull=True, eye=hexc('6affb0'), band=hexc('c8322a'), feather=hexc('c8322a'),
                        barnacles=hexc('d8d0b8'), bare_arms=True, armor='light'))),
    ('wyrmling', 'Jeune wyrm', 'Brumes', '27–30', 'fort', 'Jeune dragon des brumes, ailes, souffle de feu.',
     lambda: creature_sheet(quadruped(dict(col=hexc('3a7a6a'), dark=hexc('24504a'), light=hexc('8ac0a0'), s=1.0, head='lizard',
                                           tail='lizard', wings=hexc('2a5a50'), horns=hexc('e8dcc0'), scales=True, breath=True,
                                           eye=hexc('ffd84a'))), fx_y=40)),

    # ---------------- Terres Cendrées (28–40)
    ('diablotin', 'Diablotin', 'Cendres', '28–31', 'standard', 'Petit démon rouge ailé avec une fourche.',
     lambda: creature_sheet(flyer(dict(kind='imp', col=hexc('c83a3a'), dark=hexc('8a1a2a'), wing=hexc('5a1a2a'),
                                       eye=hexc('ffd84a'))), ko='fall', fx_y=30)),
    ('gelee-cendree', 'Gelée cendrée', 'Cendres', '29–32', 'standard', 'Gelée de cendre violette, braises à l’intérieur.',
     lambda: creature_sheet(blob(dict(col=hexc('5a3a6a'), s=1.15, eye=hexc('ff4a4a'), aura=hexc('b04aff'),
                                      bubbles=[(-5, -6, 1.5), (5, -4, 1.5), (-1, -10, 1)])), ko='melt', fx_y=46)),
    ('chien-des-enfers', 'Chien des enfers', 'Cendres', '31–35', 'fort', 'Molosse noir à crinière de flammes.',
     lambda: creature_sheet(quadruped(dict(col=hexc('2a2026'), dark=hexc('1a1418'), light=hexc('4a3a40'), s=1.0, head='hound',
                                           tail='fire', mane=hexc('ff5a1a'), spikes=True, spike_c=hexc('ff7a1a'),
                                           eye=hexc('ffd84a'), glow_eye=True, aura=hexc('ff8a3a'))), fx_y=40)),
    ('chevalier-cendre', 'Chevalier cendré', 'Cendres', '34–38', 'élite', 'Chevalier en armure noire, lame aux runes violettes.',
     lambda: humanoid(H(skin=hexc('6a6670'), hair_style='none', top=hexc('2a2630'), top2=hexc('9a4ad8'), legs=hexc('2a2630'),
                        boots=hexc('1a1820'), weapon='sword', runes=hexc('c070ff'), armor='heavy', helmet=True, helmet_c=hexc('3a3446'),
                        eye=hexc('c070ff'), brokenshield=False))),
    ('golem-d-obsidienne', 'Golem d’obsidienne', 'Cendres', '36–40', 'élite', 'Golem noir veiné de lave, garde de la Citadelle.',
     lambda: creature_sheet(golem(dict(col=hexc('2a2430'), dark=hexc('1a1620'), light=hexc('4a4058'), cracks=hexc('ff6a1a'),
                                       eye=hexc('ff4a4a'), aura=hexc('ff8a3a'))), ko='crumble', fx_y=50)),
]


def build(out='../../../assets/ennemis', only=None):
    for m in MOBS:
        if only and m[0] not in only:
            continue
        os.makedirs(f'{out}/{m[0]}', exist_ok=True)
        m[6]().save(f'{out}/{m[0]}/combat.png')


if __name__ == '__main__':
    import sys
    build(only=sys.argv[1:] or None)
    print(len(MOBS), 'mobs')
