# Équilibrage des examens de rang de la Guilde

Simulation : chaque classe, au niveau minimum du rang, **sans équipement ni objets** (le cas le plus dur). Objectif : entre 45 % et 85 % de réussite en moyenne quand on passe l'examen seul. Un examen raté ne coûte rien et se retente le lendemain.

Commande : `npm run equilibrage:examens`.

## Examen du rang E (examen-rang-e) — niveau 3, 300 combats par cas

| Classe | Seul | Avec un Guérisseur |
|---|---|---|
| Alchimiste-artificier  | 67 % | 85 % |
| Arcaniste élémentaire  | 57 % | 81 % |
| Archer spirituel       | 90 % | 94 % |
| Barde enchanteur       | 74 % | 94 % |
| Berserker draconique   | 85 % | 79 % |
| Gardien sacré          | 56 % | 100 % |
| Guérisseur             | 87 % | 84 % |
| Invocateur             | 88 % | 98 % |
| Lame runique           | 56 % | 78 % |
| Ombre                  | 89 % | 95 % |

Moyenne seul : 74.9 % ✅

## Examen du rang D (examen-rang-d) — niveau 6, 300 combats par cas

| Classe | Seul | Avec un Guérisseur |
|---|---|---|
| Alchimiste-artificier  | 30 % | 82 % |
| Arcaniste élémentaire  | 33 % | 79 % |
| Archer spirituel       | 95 % | 96 % |
| Barde enchanteur       | 64 % | 97 % |
| Berserker draconique   | 75 % | 78 % |
| Gardien sacré          | 25 % | 100 % |
| Guérisseur             | 82 % | 87 % |
| Invocateur             | 100 % | 99 % |
| Lame runique           | 24 % | 78 % |
| Ombre                  | 46 % | 95 % |

Moyenne seul : 57.2 % ✅

## Examen du rang C (examen-rang-c) — niveau 10, 300 combats par cas

| Classe | Seul | Avec un Guérisseur |
|---|---|---|
| Alchimiste-artificier  | 7 % | 87 % |
| Arcaniste élémentaire  | 16 % | 74 % |
| Archer spirituel       | 94 % | 96 % |
| Barde enchanteur       | 67 % | 100 % |
| Berserker draconique   | 40 % | 73 % |
| Gardien sacré          | 99 % | 100 % |
| Guérisseur             | 96 % | 93 % |
| Invocateur             | 100 % | 99 % |
| Lame runique           | 25 % | 89 % |
| Ombre                  | 69 % | 99 % |

Moyenne seul : 61.3 % ✅

## À retenir

- En moyenne, les trois examens sont dans la cible.
- **L'écart entre classes est grand en duel.** L'Invocateur, le Guérisseur et l'Archer passent facilement à tous les rangs. L'Arcaniste, l'Alchimiste et la Lame runique ont du mal seuls aux rangs D et C (moins de 35 % sans équipement). Le Gardien est irrégulier (facile au rang C, difficile au rang D).
- Avec un deuxième héros, toutes les classes dépassent 70 %. Les rangs E et D peuvent se passer à plusieurs ; **le combat du rang C se joue seul** (c'est la fin d'une épreuve individuelle) : c'est le point à surveiller.
- Ces chiffres sont **sans équipement ni objets** : en jeu, l'équipement du palier et les potions du sac les remontent. Un échec ne coûte rien.
- Si une classe reste bloquée pendant les tests du groupe : baisser la puissance de l'examinateur dans `content/ennemis/chapitre-1.yaml`, puis relancer `npm run equilibrage:examens`.
