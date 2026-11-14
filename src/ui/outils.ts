import type { Contenu } from '../contenu/charger';
import type { Heros } from '../moteur/personnage';
import type { EtatPartie } from '../moteur/partie';
import { imagePortrait } from '../rendu/assets';

/** Nom affiché d'un personnage de dialogue. */
export function nomPersonnage(contenu: Contenu, etat: EtatPartie, qui: string, heros: string[]): string {
  if (qui === 'narrateur') return '';
  if (qui === 'heros' || qui === 'meneur') return heros.map((h) => etat.heros[h]?.nom).join(', ');
  return contenu.compagnons[qui]?.nom ?? contenu.pnj[qui]?.nom ?? qui;
}

/** Portrait d'un personnage de dialogue (vraie image si présente, sinon provisoire). */
export function portraitPersonnage(contenu: Contenu, qui: string, expression = 'neutre'): string | null {
  if (qui === 'narrateur' || qui === 'heros' || qui === 'meneur') return null;
  // Tant que le portrait anime (512 × 512) n'est pas livré, on montre le haut de l'image « decor.png »
  // (tête et épaules) : les balises <img class="portrait"> la cadrent par le haut (object-position: top).
  if (contenu.compagnons[qui]) {
    const base = `personnages/compagnes/${qui}/`;
    return imagePortrait([`${base}portrait-${expression}`, `${base}portrait-neutre`, `${base}decor`], qui, contenu.compagnons[qui].nom);
  }
  const base = `personnages/pnj/${qui}/`;
  return imagePortrait([`${base}portrait-${expression}`, `${base}portrait-neutre`, `${base}decor`], qui, contenu.pnj[qui]?.nom ?? qui);
}

export function portraitHeros(contenu: Contenu, h: Heros): string {
  if (h.portrait) return h.portrait;
  // héroïne : version féminine du portrait si elle existe, sinon le portrait actuel (repli automatique)
  const f = h.sexe === 'f' ? [`personnages/races/${h.race}/portrait-defaut-f`, `personnages/heros/${h.classe}/f/portrait-defaut`] : [];
  return imagePortrait([...f, `personnages/races/${h.race}/portrait-defaut`, `personnages/heros/${h.classe}/portrait-defaut`], `${h.race}-${h.classe}`, h.nom);
}

export const NOMS_CARACS: Record<string, string> = { FOR: 'Force', AGI: 'Agilité', INT: 'Intelligence', VIT: 'Vitalité', ESP: 'Esprit', CHA: 'Charisme' };

export function signe(n: number) { return n > 0 ? `+${n}` : `${n}`; }

/** Redimensionne une image importée (portrait) en carré de 256 px, au format data URL. */
export function redimensionnerPortrait(fichier: File): Promise<string> {
  return new Promise((ok, ko) => {
    const lecteur = new FileReader();
    lecteur.onerror = () => ko(new Error('Lecture du fichier impossible'));
    lecteur.onload = () => {
      const img = new Image();
      img.onerror = () => ko(new Error('Ce fichier n\'est pas une image'));
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const ctx = c.getContext('2d')!;
        const cote = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, 256, 256);
        ok(c.toDataURL('image/webp', 0.85));
      };
      img.src = String(lecteur.result);
    };
    lecteur.readAsDataURL(fichier);
  });
}

export function telecharger(nom: string, texte: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }));
  a.download = nom;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
