# Glossaire des traductions (anglais, espagnol, allemand, japonais)

À respecter dans tous les fichiers de `traductions/` pour que le jeu reste cohérent.
Outils : `npm run traductions:extraire`, `npm run traductions:rapport`, `npm run roblox:traductions` (voir `scripts/traductions.ts`).

## Règles
- Garder tels quels : `{n}`, `{heros}`, `{pseudo}`, `{1}`… ; les balises `<b>`, `<i>`, `<font …>` ; les émojis.
- Marques d'accord : `[[seul||groupe]]` (tu/vous) et `{{masculin|féminin}}`, `{{groupe:masc|fém|mixte}}`. Les garder quand la langue en a besoin
  (espagnol, allemand : oui ; anglais : souvent inutile, on peut écrire directement « you » ; japonais : en général inutile).
- Ton : tutoiement du joueur (anglais « you », espagnol « tú », allemand « du », japonais style simple et amical, pas de keigo dans l'interface ;
  les personnages gardent leur façon de parler).
- Guillemets : anglais “ ” ; espagnol « » ; allemand „ “ ; japonais 「」.
- Noms propres inventés (lieux, personnes) : on les garde, sauf ceux du tableau. En japonais : katakana.

## Termes de jeu
| Français | English | Español | Deutsch | 日本語 |
|---|---|---|---|---|
| or (monnaie) | gold | oro | Gold | G / ゴールド |
| PV | HP | PV | LP | HP |
| mana | mana | maná | Mana | マナ |
| XP | XP | XP | EP | 経験値 |
| niveau / niv. | level / lvl | nivel / nv. | Level / Lv. | レベル / Lv. |
| héros | hero | héroe | Held | ヒーロー |
| groupe | group | grupo | Gruppe | パーティー |
| meneur | leader | líder | Anführer | リーダー |
| compagne / compagnon | companion | compañera / compañero | Gefährtin / Gefährte | 仲間 |
| quête | quest | misión | Quest | クエスト |
| contrat (de la Guilde) | contract | contrato | Auftrag | 依頼 |
| Guilde | Guild | Gremio | Gilde | ギルド |
| rang | rank | rango | Rang | ランク |
| don | gift | don | Gabe | 天賦 |
| compétence | skill | habilidad | Fähigkeit | スキル |
| ultime | ultimate | definitiva | ultimative Fähigkeit | 奥義 |
| fusion | fusion | fusión | Fusion | 融合技 |
| grimoire | grimoire | grimorio | Grimoire | 魔導書 |
| caractéristiques | attributes | características | Attribute | 能力値 |
| Force / Agilité / Intelligence / Vitalité / Esprit / Charisme | Strength / Agility / Intelligence / Vitality / Spirit / Charisma | Fuerza / Agilidad / Inteligencia / Vitalidad / Espíritu / Carisma | Stärke / Geschick / Intelligenz / Vitalität / Geist / Charisma | 筋力 / 敏捷 / 知力 / 体力 / 精神 / 魅力 |
| invoqué / réincarné | summoned / reincarnated | invocado / reencarnado | beschworen / wiedergeboren | 召喚者 / 転生者 |
| pierre de voyage | waystone | piedra de viaje | Reisestein | 旅の石 |
| temps libre | free time | tiempo libre | Freizeit | 自由時間 |
| test (de caractéristique) | check | prueba | Probe | 判定 |
| mort douce / K.O. | soft death / KO | muerte suave / K.O. | sanfter Tod / K. o. | ソフトデス / 戦闘不能 |

## Noms propres
| Français | English | Español | Deutsch | 日本語 |
|---|---|---|---|---|
| Les Appelés de Velmaris | The Summoned of Velmaris | Los Llamados de Velmaris | Die Gerufenen von Velmaris | ヴェルマリスの召喚者たち |
| Velmaris | Velmaris | Velmaris | Velmaris | ヴェルマリス |
| Lysmont | Lysmont | Lysmont | Lysmont | リスモン |
| Aubeclaire | Aubeclaire | Aubeclaire | Aubeclaire | オーブクレール |
| Le Chaudron Fêlé | the Cracked Cauldron | el Caldero Rajado | der Gesprungene Kessel | ひび割れ釜亭 |
| Temple du Seuil | Temple of the Threshold | Templo del Umbral | Tempel der Schwelle | 境界の神殿 |
| Mur d'Aube | Dawnwall | Muro del Alba | Morgenwall | 暁の壁 |
| Souverain des Cendres | Ash Sovereign | Soberano de las Cenizas | Aschenherrscher | 灰の君主 |
| Marche des Sables | Sand Marches | Marca de las Arenas | Sandmark | 砂の辺境 |
| Sylvenoire | Sylvenoire | Sylvenoire | Sylvenoire | シルヴェノワール |
| Monts Grisfer | Greyiron Mountains | Montes Grisfer | Grauerz-Berge | グリフェル山脈 |
| Archipel des Brumes | Mist Archipelago | Archipiélago de las Brumas | Nebelarchipel | 霧の群島 |
| Terres Cendrées | Ashlands | Tierras Cenicientas | Aschelande | 灰の大地 |
| Ardenclume | Ardenclume | Ardenclume | Ardenclume | アルダンクリューム |
| le Haut-Forgeron | the High Smith | el Alto Herrero | der Hohe Schmied | 大鍛冶王 |
| Ordre de la Lumière Sereine | Order of the Serene Light | Orden de la Luz Serena | Orden des Heiteren Lichts | 静謐なる光の教団 |
| le Voile | the Veil | el Velo | der Schleier | ヴェール |
| Chapitres 1 à 6 | The Lanterns of Aubeclaire · The Southern Roads · The Forest That Remembers · Fire and Scales · The War of Ashes · The Ash Sovereign | Las Linternas de Aubeclaire · Los Caminos del Sur · El Bosque que Recuerda · Fuego y Escamas · La Guerra de las Cenizas · El Soberano de las Cenizas | Die Laternen von Aubeclaire · Die Straßen des Südens · Der Wald, der sich erinnert · Feuer und Schuppen · Der Aschenkrieg · Der Aschenherrscher | オーブクレールの灯 · 南への道 · 記憶する森 · 炎と鱗 · 灰の戦争 · 灰の君主 |
| Fins : le Sceau, le Pacte, la Couronne, le Retour | the Seal, the Pact, the Crown, the Return | el Sello, el Pacto, la Corona, el Regreso | das Siegel, der Pakt, die Krone, die Rückkehr | 封印、盟約、王冠、帰還 |

## Calendrier
| Français | English | Español | Deutsch | 日本語 |
|---|---|---|---|---|
| Germinal, Floréal, Pluvial, Solaire | Germinal, Floreal, Pluvial, Solar | Germinal, Floreal, Pluvial, Solar | Keimmond, Blütenmond, Regenmond, Sonnenmond | 芽吹月、花月、雨月、陽月 |
| Moisson, Ardent, Brumaire, Cendral | Harvest, Ardent, Brumaire, Cendral | Cosecha, Ardiente, Brumario, Cendral | Erntemond, Glutmond, Nebelmond, Aschenmond | 収穫月、灼熱月、霧月、灰月 |
| Givral, Nivôse, Nuitlongue, Aurore | Rimefall, Nivose, Longnight, Aurora | Escarcha, Nivoso, Nochelarga, Aurora | Reifmond, Schneemond, Langnacht, Morgenrot | 霜月、雪月、長夜月、曙月 |
| AV (Après le Voile) | AV (After the Veil) | AV (Después del Velo) | AV (Nach dem Schleier) | AV（ヴェール後） |

## Personnages (déjà fixés)
Auréliath = 大修道院長オレリアス ; Aveline de Castelroc = アヴリーヌ・ド・カステルロック ; Rowena = ロウェナ ; Kaya Lunecroc = Kaya Mooncrest / Kaya Colmillo de Luna / Kaya Mondzahn / カヤ・ルヌクロ ;
Séraphine = Serafina (es) / セラフィーヌ ; Edmund IV = Edmundo IV (es) / エドマンド4世 ; Elianne = エリアンヌ ; Vorthak = ヴォルサック ; Bram = ブラム ; Halvine = アルヴィーヌ ;
Ferrand = フェラン ; Orlan = オルラン ; Barnoul Kestrin = バルヌール・ケストラン ; Tobin = トビン ; Gareth = ガレス ; Orlo = オルロ ; Cassian = カシアン ; Pipa = ピパ ; Gauvain = ゴーヴァン.
