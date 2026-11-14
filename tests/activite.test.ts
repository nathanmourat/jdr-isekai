import { describe, expect, it } from 'vitest';
import { activiteChangee, signatureActivite } from '../src/ui/activite';
import type { EtatPartie } from '../src/moteur/partie';

// Test 3, point 11 : une fenêtre (examen de rang, boutique…) ne doit jamais rester par-dessus une scène, un combat ou une épreuve qui commence.
const base = () => ({ scenes: {}, combats: {}, donjon: null, contrats: {} }) as unknown as EtatPartie;

describe('fermeture des fenêtres quand une activité commence', () => {
  it('rien ne change au premier affichage', () => {
    expect(activiteChangee(null, signatureActivite(base(), 'h1'))).toBe(false);
  });
  it('un combat d\'examen (groupe) ferme les fenêtres', () => {
    const e = base(); const avant = signatureActivite(e, 'h1');
    (e.combats as Record<string, unknown>).groupe = { combat: { id: 'c1' }, contexte: {} };
    expect(activiteChangee(avant, signatureActivite(e, 'h1'))).toBe(true);
  });
  it('une épreuve de rang (contrat) ferme les fenêtres, et chaque nouvelle étape aussi', () => {
    const e = base(); const avant = signatureActivite(e, 'h1');
    (e.contrats as Record<string, unknown>).h1 = { id: 'c-examen-c', etape: 0, notes: [] };
    const pendant = signatureActivite(e, 'h1');
    expect(activiteChangee(avant, pendant)).toBe(true);
    (e.contrats as Record<string, { etape: number }>).h1.etape = 1;
    expect(activiteChangee(pendant, signatureActivite(e, 'h1'))).toBe(true);
  });
  it('une scène personnelle d\'un autre héros ne ferme pas mes fenêtres', () => {
    const e = base(); const avant = signatureActivite(e, 'h1');
    (e.scenes as Record<string, unknown>).h2 = { sceneId: 's' };
    expect(activiteChangee(avant, signatureActivite(e, 'h1'))).toBe(false);
  });
  it('une scène de groupe ferme les fenêtres', () => {
    const e = base(); const avant = signatureActivite(e, 'h1');
    (e.scenes as Record<string, unknown>).groupe = { sceneId: 's' };
    expect(activiteChangee(avant, signatureActivite(e, 'h1'))).toBe(true);
  });
});
