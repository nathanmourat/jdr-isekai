/**
 * Mise à jour 5, point 6 : une quête solo peut se faire seul, avec tout le groupe ou avec certains joueurs.
 * Les invités acceptent ou refusent ; un héros occupé ne peut pas être invité ; la quête reste celle du lanceur
 * (ses invités gagnent l'XP et l'or) ; tout passe par le journal d'actions et se rejoue à l'identique.
 */
import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, etapeContrat, invitablesQuete, occupationHeros, queteInvitable, remplacerVariables } from '../src/moteur/partie';
import { creerSauvegarde, migrer } from '../src/sauvegarde/migrations';
import { groupeDeDeux, jouer, jouerPrologues, type Robot } from './robot';

const c = contenuDisque();

function partie(graine: string): Robot {
  const r = groupeDeDeux(c, graine);
  jouerPrologues(c, r);
  // on se place après l'examen de la Guilde (la boutique d'Halvine propose « Premiers pas au Comptoir »)
  r.etat.flags['examen-reussi'] = true;
  return r;
}

describe('quêtes solo à plusieurs', () => {
  it('quelles quêtes : celles d\'une quête, jamais une scène romantique ni le prologue', () => {
    expect(queteInvitable(c, c.scenes['sq-boutique'])).toBe(true);
    expect(queteInvitable(c, c.scenes['cl-ombre-1'])).toBe(true);
    expect(queteInvitable(c, c.scenes['ky-hurlement'])).toBe(true);
    expect(queteInvitable(c, c.scenes['ky-falaise'])).toBe(false);   // romantique
    expect(queteInvitable(c, c.scenes['prologue-6-ans'])).toBe(false);
    expect(queteInvitable(c, c.scenes['ep-heros'])).toBe(false);
    expect(queteInvitable(c, c.scenes['ch1-appel'])).toBe(false);    // scène de groupe
  });

  it('invitation acceptée : les deux héros jouent la quête du lanceur', () => {
    const r = partie('solo1');
    jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique', invites: ['h2'] });
    expect(r.etat.invitations?.h1).toMatchObject({ scene: 'sq-boutique', lanceur: 'h1', invites: ['h2'] });
    expect(occupationHeros(r.etat, 'h2')).toBe('invité à une quête');
    expect(occupationHeros(r.etat, 'h1')).toBe('en train de préparer une quête');
    jouer(c, r, { type: 'repondre_invitation', joueur: 'j2', lanceur: 'h1', accepte: true });
    expect(r.etat.invitations?.h1).toBeUndefined();
    const es = r.etat.scenes.h1;
    expect(es.heros).toEqual(['h1', 'h2']);
    // l'objet et la quête vont au lanceur
    expect(r.etat.heros.h1.inventaire['breloque-cabossee']).toBe(1);
    expect(r.etat.heros.h2.inventaire['breloque-cabossee'] ?? 0).toBe(0);
    expect(r.etat.quetes['q-boutique'].etape).toBe('acheter');
    // la scène est « vue » pour le lanceur seulement : l'invité pourra faire la sienne
    jouer(c, r, { type: 'quitter_scene', joueur: 'j2', cle: 'h1' });
    expect(r.etat.scenes.h1.heros).toEqual(['h1']);
    jouer(c, r, { type: 'quitter_scene', joueur: 'j1', cle: 'h1' });
    expect(r.etat.scenesVues).toContain('sq-boutique@h1');
    expect(r.etat.scenesVues).not.toContain('sq-boutique@h2');
  });

  it('récompenses : l\'invité gagne l\'XP et l\'or, la fin de quête et l\'objet restent au lanceur', () => {
    const r = partie('solo2');
    r.etat.quetes['q-boutique'] = { etape: 'retour', terminee: false };
    const potions = (h: string) => r.etat.heros[h].inventaire['potion-soin-petite'] ?? 0;
    const avant = { xp1: r.etat.heros.h1.xp, or1: r.etat.heros.h1.or, xp2: r.etat.heros.h2.xp, or2: r.etat.heros.h2.or, p1: potions('h1'), p2: potions('h2') };
    jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique-fin', invites: ['h2'] });
    jouer(c, r, { type: 'repondre_invitation', joueur: 'j2', lanceur: 'h1', accepte: true });
    expect(r.etat.heros.h1.or - avant.or1).toBe(15);
    expect(r.etat.heros.h2.or - avant.or2).toBe(15);
    expect(r.etat.heros.h1.xp).not.toBe(avant.xp1);
    expect(r.etat.heros.h2.xp).not.toBe(avant.xp2);
    expect(potions('h1')).toBe(avant.p1 + 1);
    expect(potions('h2')).toBe(avant.p2);
    expect(r.etat.quetes['q-boutique'].terminee).toBe(true);
  });

  it('seul le lanceur fait les choix et avance la quête', () => {
    const r = partie('solo3');
    jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique', invites: ['h2'] });
    jouer(c, r, { type: 'repondre_invitation', joueur: 'j2', lanceur: 'h1', accepte: true });
    expect(() => jouer(c, r, { type: 'continuer', joueur: 'j2', cle: 'h1' })).toThrow(/pas votre scène/);
    expect(() => jouer(c, r, { type: 'choisir', joueur: 'j2', cle: 'h1', index: 0 })).toThrow();
  });

  it('refus : la quête commence seule quand tout le monde a répondu', () => {
    const r = partie('solo4');
    jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique', invites: ['h2'] });
    jouer(c, r, { type: 'repondre_invitation', joueur: 'j2', lanceur: 'h1', accepte: false });
    expect(r.etat.scenes.h1.heros).toEqual(['h1']);
    expect(occupationHeros(r.etat, 'h2')).toBeNull();
  });

  it('« Commencer sans attendre » : seuls ceux qui ont accepté viennent ; « Annuler » retire l\'invitation', () => {
    const r = partie('solo5');
    jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique', invites: ['h2'] });
    jouer(c, r, { type: 'annuler_invitation', joueur: 'j1' });
    expect(r.etat.invitations?.h1).toBeUndefined();
    expect(() => jouer(c, r, { type: 'repondre_invitation', joueur: 'j2', lanceur: 'h1', accepte: true })).toThrow(/n'existe plus/);
    jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique', invites: ['h2'] });
    jouer(c, r, { type: 'demarrer_quete', joueur: 'j1' });
    expect(r.etat.scenes.h1.heros).toEqual(['h1']);
  });

  it('un joueur occupé (en combat) est grisé avec la raison et ne peut pas être invité', () => {
    const r = partie('solo6');
    jouer(c, r, { type: 'contrat', joueur: 'j2', contrat: 'c-gobelins' });
    for (let k = 0; k < 10 && !r.etat.combats.h2; k++) {
      const x = etapeContrat(c, r.etat, 'h2');
      jouer(c, r, { type: 'etape_contrat', joueur: 'j2', choix: x?.etape.choix.length ? 0 : undefined });
    }
    expect(invitablesQuete(r.etat, 'h1')).toEqual([{ heros: 'h2', raison: 'en combat' }]);
    expect(() => jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique', invites: ['h2'] })).toThrow(/en combat/);
    // le lanceur peut toujours partir seul
    jouer(c, r, { type: 'lancer_scene', joueur: 'j1', scene: 'sq-boutique' });
    expect(r.etat.scenes.h1.heros).toEqual(['h1']);
  });

  it('accords : [[tu||vous]] selon les participants, {{masc|fém}} selon le lanceur', () => {
    const r = partie('solo7');
    r.etat.heros.h1.sexe = 'f';
    const t = '[[Tu es prêt||Vous êtes prêts]], {{Messire|Dame}} {heros}. {{groupe:Tous|Toutes|Tous}} en route.';
    expect(remplacerVariables(c, r.etat, t, ['h1'], undefined, 'h1')).toBe('Tu es prêt, Dame Kael. Toutes en route.');
    expect(remplacerVariables(c, r.etat, t, ['h1', 'h2'], undefined, 'h1')).toBe('Vous êtes prêts, Dame Kael et Ilo. Tous en route.');
  });

  it('synchronisation : le journal d\'actions se rejoue à l\'identique', () => {
    const depart = groupeDeDeux(c, 'solo8');
    const r: Robot = { etat: depart.etat, actions: [...depart.actions] };
    const etatDepart = JSON.parse(JSON.stringify(r.etat));
    jouerPrologues(c, r);
    r.etat.flags['examen-reussi'] = true;
    etatDepart.flags['examen-reussi'] = true;
    const debut = r.actions.length;
    jouer(c, r, { type: 'inviter_quete', joueur: 'j1', scene: 'sq-boutique', invites: ['h2'] });
    jouer(c, r, { type: 'repondre_invitation', joueur: 'j2', lanceur: 'h1', accepte: true });
    // rejeu de toutes les actions depuis le départ (sans les 4 de groupeDeDeux, déjà dans etatDepart)
    let e = etatDepart;
    for (const a of r.actions.slice(depart.actions.length)) e = appliquer(c, e, a);
    expect(JSON.stringify(e.scenes)).toBe(JSON.stringify(r.etat.scenes));
    expect(JSON.stringify(e.heros)).toBe(JSON.stringify(r.etat.heros));
    expect(debut).toBeGreaterThan(0);
    const s = migrer(creerSauvegarde(etatDepart, r.actions.slice(depart.actions.length), '2026-11-16'));
    expect(s.actions.at(-1)?.type).toBe('repondre_invitation');
  });
});
