import os, sys, json
OUT = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('/') else '../../../assets'
import scenes_int
mods = [scenes_int]
try:
    import scenes_ext; mods.append(scenes_ext)
except ImportError:
    pass
only = [a for a in sys.argv[1:] if not a.startswith('/')]
os.makedirs(f'{OUT}/decors', exist_ok=True)
for m in mods:
    for k, f in m.SCENES.items():
        if only and k not in only: continue
        img, zones = f()
        img.save(f'{OUT}/decors/{k}.png', optimize=True)
        av = getattr(m, 'AVANT', {}).get(k)
        if av:
            from PIL import Image
            over = Image.new('RGBA', img.size, (0, 0, 0, 0))
            src = img.convert('RGBA')
            for (x0, y0, x1, y1) in av:
                box = (x0 * 2, y0 * 2, x1 * 2, y1 * 2)
                over.paste(src.crop(box), box[:2])
            over.save(f'{OUT}/decors/{k}-avant.png', optimize=True)
            zones = dict(zones); zones['_avant_plan'] = f'decors/{k}-avant.png'
        if zones:
            avp = zones.pop('_avant_plan', None)
            doc = {'_info': "Positions en pixels de l'image 1280×720. PNJ : point au sol (pieds). Autres : centre de la zone cliquable.", 'positions': zones}
            if avp:
                doc['avant_plan'] = avp
            json.dump(doc,
                      open(f'{OUT}/decors/{k}.json', 'w'), ensure_ascii=False, indent=1)
        print(k)
