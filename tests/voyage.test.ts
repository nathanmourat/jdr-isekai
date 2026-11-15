import { describe, expect, it } from 'vitest';
import { contenuDisque } from '../src/contenu/node';
import { appliquer, nouvellePartie, rejouer, type Action, type EtatPartie } from '../src/moteur/partie';
import { exporterHeros } from '../src/moteur/voyage';

const c = contenuDisque();

/** Campagne d'un seul joueur (comme sur Roblox : chaque joueur a la sienne). */
function campagneSolo(id: string, joueur: string, pseudo: string, don: string, classe: string): { etat: EtatPartie; actions: Action[]; depart: EtatPartie } {
  const depart = nouvellePartie(c, id, `Campagne de ${pseudo}`, `graine-${id}`);
  const actions: Action[] = [
    { type: 'rejoindre', joueur, pseudo },
    { type: 'creer_heros', joueur, heros: { nom: pseudo, classe, race: 'humain', don, origine: 'invoque', age: 22, libres: { plus: { FOR: 1, VIT: 1 }, moins: { CHA: 1, INT: 1 } } } },
  ];
  let etat = depart;
  for (const a of actions) etat = appliquer(c, etat, a);
  return { etat, actions, depart };
}

describe('Héros voyageurs (Roblox : groupe dans la campagne du chef)', () => {
  const dons = Object.keys(c.dons);
  const classes = Object.keys(c.classes);

  it('un renfort arrive, gagne de la progression, puis la ramène dans sa propre campagne', () => {
    const chef = campagneSolo('chef', 'u1', 'Alice', dons[0], classes[0]);
    const invite = campagneSolo('invite', 'u2', 'Bruno', dons[0], classes[1]); // même don : permis pour un renfort
    const v = exporterHeros(invite.etat, 'h1');
    let a = appliquer(c, chef.etat, { type: 'invite_arrive', joueur: 'u2', pseudo: 'Bruno', voyageur: v });
    const idRenfort = a.joueurs.u2.herosId!;
    expect(idRenfort).toBe('h2');
    expect(a.heros.h2.invite).toBe(true);
    expect(a.heros.h2.nom).toBe('Bruno');
    expect(a.heros.h2.classe).toBe(classes[1]);

    // il gagne de l'or et de l'XP dans la campagne du chef
    a = JSON.parse(JSON.stringify(a)) as EtatPartie;
    a.heros.h2.or += 120;
    a.heros.h2.xp += 40;
    a.heros.h2.inventaire['potion-soin-petite'] = 3;
    a.pointsGuilde.h2 = 25;
    a.rangs.h2 = 'E';

    // il repart : sa campagne reçoit ses gains, son histoire ne change pas
    const retour = exporterHeros(a, 'h2');
    const flagsAvant = JSON.stringify(invite.etat.flags);
    const b = appliquer(c, invite.etat, { type: 'heros_retour', joueur: 'u2', voyageur: retour });
    expect(b.heros.h1.id).toBe('h1');
    expect(b.heros.h1.joueurId).toBe('u2');
    expect(b.heros.h1.or).toBe(invite.etat.heros.h1.or + 120);
    expect(b.heros.h1.xp).toBe(invite.etat.heros.h1.xp + 40);
    expect(b.heros.h1.inventaire['potion-soin-petite']).toBe(3);
    expect(b.pointsGuilde.h1).toBe(25);
    expect(b.rangs.h1).toBe('E');
    expect(JSON.stringify(b.flags)).toBe(flagsAvant);
  });

  it('absent, un renfort reste au camp ; s\'il revient, il reprend la même place avec sa nouvelle progression', () => {
    const chef = campagneSolo('chef2', 'u1', 'Alice', dons[0], classes[0]);
    const invite = campagneSolo('invite2', 'u2', 'Alice', dons[1], classes[2]); // même pseudo : renommé
    let a = appliquer(c, chef.etat, { type: 'invite_arrive', joueur: 'u2', pseudo: 'Alice', voyageur: exporterHeros(invite.etat, 'h1') });
    expect(a.joueurs.u2.pseudo).toBe('Alice2');
    a = appliquer(c, a, { type: 'presence', joueur: 'u2', present: false });
    expect(a.heros.h2.siAbsent).toBe('camp');
    const v2 = exporterHeros(invite.etat, 'h1');
    v2.heros.niveau = 3;
    a = appliquer(c, a, { type: 'invite_arrive', joueur: 'u2', pseudo: 'Alice', voyageur: v2 });
    expect(a.joueurs.u2.herosId).toBe('h2');
    expect(a.heros.h2.niveau).toBe(3);
    expect(a.joueurs.u2.present).toBe(true);
    expect(a.ordreJoueurs.length).toBe(2);
  });

  it('6 joueurs présents au plus ; le journal d\'actions se rejoue à l\'identique', () => {
    const chef = campagneSolo('chef3', 'u1', 'Alice', dons[0], classes[0]);
    const actions: Action[] = [...chef.actions];
    let etat = chef.etat;
    for (let i = 2; i <= 6; i++) {
      const autre = campagneSolo(`autre${i}`, `u${i}`, `J${i}`, dons[i], classes[i % classes.length]);
      const act: Action = { type: 'invite_arrive', joueur: `u${i}`, pseudo: `J${i}`, voyageur: exporterHeros(autre.etat, 'h1') };
      etat = appliquer(c, etat, act);
      actions.push(act);
    }
    const septieme = campagneSolo('autre7', 'u7', 'J7', dons[7], classes[0]);
    expect(() => appliquer(c, etat, { type: 'invite_arrive', joueur: 'u7', pseudo: 'J7', voyageur: exporterHeros(septieme.etat, 'h1') })).toThrow(/complet/);
    const rejoue = rejouer(c, chef.depart, actions);
    expect(rejoue.erreurs).toEqual([]);
    expect(JSON.stringify(rejoue.etat.heros)).toBe(JSON.stringify(etat.heros));
  });

  it('cadeau du propriétaire (Roblox) : or, XP et objet sur le héros du joueur', () => {
    const solo = campagneSolo('cadeau', 'u1', 'Alice', dons[0], classes[0]);
    const or0 = solo.etat.heros.h1.or;
    const e = appliquer(c, solo.etat, { type: 'cadeau_admin', joueur: 'u1', or: 100, xp: 5000, objet: 'potion-soin-petite', quantite: 2 });
    expect(e.heros.h1.or).toBe(or0 + 100);
    expect(e.heros.h1.niveau).toBeGreaterThan(1);
    expect(e.heros.h1.inventaire['potion-soin-petite']).toBeGreaterThanOrEqual(2);
    expect(() => appliquer(c, solo.etat, { type: 'cadeau_admin', joueur: 'u1', objet: 'objet-qui-n-existe-pas' })).toThrow(/inconnu/);
  });
});
