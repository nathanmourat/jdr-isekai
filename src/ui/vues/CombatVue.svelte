<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import PhaserHote from '../PhaserHote.svelte';
  import ActionsLibres from './ActionsLibres.svelte';
  import type { SceneCombat } from '../../rendu/SceneCombat';
  import { actionsDisponibles, estimerAction, NOMS_ETATS, type ActionCombat, type Combattant } from '../../moteur/combat';
  import CompetenceInfo from '../CompetenceInfo.svelte';
  import type { Competence } from '../../contenu/schemas';

  let { cle }: { cle: string } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const entree = $derived(etat.combats[cle]);
  const combat = $derived(entree.combat);
  const acteur = $derived(combat.enAttente ? combat.combattants.find((x) => x.id === combat.enAttente) ?? null : null);
  const monTour = $derived(!!acteur && !!acteur.joueurId && jeu.joueursLocaux.includes(acteur.joueurId));
  const dispo = $derived(acteur && monTour ? actionsDisponibles(c, combat, acteur.id) : null);
  let selection = $state<{ type: 'attaque' } | { type: 'competence'; comp: Competence } | { type: 'potion' } | { type: 'pacifier' } | null>(null);
  let scene: SceneCombat | null = null;

  const cibles = $derived.by((): string[] => {
    if (!dispo || !acteur || !selection) return [];
    if (selection.type === 'attaque') return acteur.attaque.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance;
    if (selection.type === 'potion') return dispo.allies;
    if (selection.type === 'pacifier') return dispo.pacifier;
    const k = selection.comp;
    if (k.cible === 'ennemi') return k.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance;
    if (k.cible === 'allie') return dispo.allies;
    if (k.cible === 'allie_ko') return dispo.alliesKo;
    return [];
  });

  $effect(() => {
    scene?.afficher(combat, {
      echelle: c.config.graphismes.echelle_combat ?? 3,
      tailleCombat: c.config.graphismes.taille_sprite_combat ?? 64,
      tailleBoss: c.config.graphismes.taille_sprite_boss ?? 128,
      tailleExploration: c.config.graphismes.taille_sprite_exploration ?? 32,
      ciblesCliquables: cibles,
      actif: combat.enAttente,
      surClic: (id) => { if (cibles.includes(id)) viser(id); },
    });
  });
  $effect(() => { void combat.enAttente; selection = null; });

  function envoyer(action: ActionCombat) {
    selection = null;
    jeu.agir({ type: 'combat', joueur: acteur!.joueurId!, cle, action });
  }
  function choisir(sel: NonNullable<typeof selection>) {
    // sans cible à choisir : on joue tout de suite
    if (sel.type === 'competence' && !['ennemi', 'allie', 'allie_ko'].includes(sel.comp.cible)) return envoyer({ type: 'competence', acteur: acteur!.id, competence: sel.comp.id });
    selection = sel;
  }
  function viser(id: string) {
    if (!selection || !acteur) return;
    if (selection.type === 'attaque') envoyer({ type: 'attaque', acteur: acteur.id, cible: id });
    else if (selection.type === 'potion') envoyer({ type: 'objet', acteur: acteur.id, objet: 'potion', cible: id });
    else if (selection.type === 'pacifier') envoyer({ type: 'pacifier', acteur: acteur.id, cible: id });
    else envoyer({ type: 'competence', acteur: acteur.id, competence: selection.comp.id, cible: id });
  }
  /** Chiffres réels d'une compétence contre la première cible possible (calculés par le moteur). */
  function reel(k: Competence) {
    if (!acteur || !dispo) return null;
    const cible = k.cible === 'ennemi' ? (k.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance)[0] : undefined;
    const e = estimerAction(c, combat, { type: 'competence', acteur: acteur.id, competence: k.id, cible });
    return e.possible ? { degats: e.degats, reussite: e.reussite } : null;
  }
  const herosActeur = $derived(acteur?.herosId ? etat.heros[acteur.herosId] ?? null : null);
  const nom = (id: string) => combat.combattants.find((x) => x.id === id)?.nom ?? id;
  const etatsDe = (x: Combattant) => x.etats.map((e) => NOMS_ETATS[e.id]).join(', ');
  const journal = $derived(combat.evenements.filter((e) => e.type !== 'action' || true).slice(-8).reverse());
  const herosCamp = $derived(combat.combattants.filter((x) => x.camp === 'heros' && !x.parti));
  const ennemis = $derived(combat.combattants.filter((x) => x.camp === 'ennemis' && !x.parti));
  const peutSecondDepart = $derived(jeu.monHeros?.don === 'second-depart' && etat.secondDepart[jeu.monHeros.id] !== etat.session && combat.instantane && !combat.resultat);
</script>

<section class="combat">
  <div class="ligne entete"><h2>⚔ {combat.nom}</h2><span class="discret">Tour {combat.tour}</span></div>
  <PhaserHote scene="combat" surPret={(s) => (scene = s as SceneCombat)} />

  <div class="bas">
    <div class="carte-ui panneau-actions">
      {#if combat.resultat}
        <h3>{combat.resultat === 'victoire' ? '🏆 Victoire !' : combat.resultat === 'defaite' ? 'Défaite…' : 'Fuite'}</h3>
        {#each entree.contexte.bilan ?? [] as b, i (i)}<p class="discret">{b}</p>{/each}
        {#if combat.resultat === 'defaite'}<p class="discret">Mort douce : personne ne meurt pour de bon. L'histoire continue.</p>{/if}
        <button class="principal" onclick={() => jeu.agir({ type: 'fin_combat', cle })}>Continuer</button>
      {:else if acteur && monTour && dispo}
        <h3>À vous : {acteur.nom} <span class="discret">({acteur.pv}/{acteur.pvMax} PV · {acteur.mana} mana)</span></h3>
        {#if selection}
          <p class="consigne">Choisissez une cible{cibles.length ? ' (cliquez sur le personnage ou ci-dessous)' : ' — aucune cible possible'} :</p>
          <div class="ligne">
            {#each cibles as id (id)}<button onclick={() => viser(id)}>{nom(id)}</button>{/each}
            <button class="petit" onclick={() => (selection = null)}>Annuler</button>
          </div>
        {:else}
          {#key acteur.id}<ActionsLibres {cle} acteur={acteur} />{/key}
          <details class="manuel" open>
            <summary>Ce que font mes compétences</summary>
            {#each dispo.competences as k (k.comp.id)}
              <p class="explication" class:indispo={!k.utilisable}><CompetenceInfo comp={k.comp} rang={k.rang} heros={herosActeur} sujet={acteur} reel={reel(k.comp)} />{#if k.raison} <span class="badge">{k.raison}</span>{/if}</p>
            {/each}
          </details>
          <details class="manuel">
          <summary>Toutes les actions (mode manuel)</summary>
          <div class="actions">
            <button onclick={() => choisir({ type: 'attaque' })}>Attaque</button>
            {#each dispo.competences as k (k.comp.id)}
              <button disabled={!k.utilisable} title={`${k.comp.description}${k.raison ? ' — ' + k.raison : ''}`} onclick={() => choisir({ type: 'competence', comp: k.comp })}>
                {k.comp.nom}{k.rang > 1 ? ` ${k.rang}` : ''} <small>{k.comp.cout ? `${k.comp.cout} mana` : ''}{k.raison ? ` · ${k.raison}` : ''}</small>
              </button>
            {/each}
            <button disabled={dispo.potions <= 0} onclick={() => choisir({ type: 'potion' })}>Potion ({dispo.potions})</button>
            {#if dispo.bombes > 0}<button onclick={() => envoyer({ type: 'objet', acteur: acteur!.id, objet: 'bombe' })}>Bombe ({dispo.bombes})</button>{/if}
            {#if dispo.pacifier.length}<button onclick={() => choisir({ type: 'pacifier' })}>Pacifier</button>{/if}
            <button onclick={() => envoyer({ type: 'defendre', acteur: acteur!.id })}>Se défendre</button>
            <button onclick={() => envoyer({ type: 'changer_rang', acteur: acteur!.id })}>Passer au rang {acteur.rang === 'avant' ? 'arrière' : 'avant'}</button>
            {#if dispo.fuite}<button class="danger" onclick={() => envoyer({ type: 'fuir', acteur: acteur!.id })}>Fuir</button>{/if}
          </div>
          </details>
        {/if}
      {:else if acteur}
        <p>C'est au tour de <strong>{acteur.nom}</strong> ({etat.joueurs[acteur.joueurId ?? '']?.pseudo ?? '?'})…</p>
      {/if}
      {#if peutSecondDepart}<button class="petit" onclick={() => jeu.agir({ type: 'second_depart', cle })}>⟲ Second départ (rejouer le tour)</button>{/if}
    </div>

    <div class="carte-ui etats">
      <h3>Combattants</h3>
      {#each [...herosCamp, ...ennemis] as x (x.id)}
        <div class="combattant" class:ko={x.ko} class:ennemi={x.camp === 'ennemis'}>
          <span>{x.nom}</span>
          <div class="barre" title={`${x.pv}/${x.pvMax} PV`}><div style={`width:${(x.pv / x.pvMax) * 100}%`}></div></div>
          <small class="discret">{x.pv}/{x.pvMax}{x.bouclier ? ` +${x.bouclier}` : ''}{x.etats.length ? ` · ${etatsDe(x)}` : ''}</small>
        </div>
      {/each}
    </div>

    <div class="carte-ui journal" aria-live="polite">
      <h3>Journal du combat</h3>
      {#each journal as e, i (combat.evenements.length - i)}<p class:fort={e.type === 'ko' || e.type === 'fin'}>{e.texte}</p>{/each}
    </div>
  </div>
</section>

<style>
  .entete { justify-content: space-between; }
  .entete h2 { margin: 0; }
  .bas { display: grid; gap: 0.6rem; grid-template-columns: 1.4fr 1fr 1fr; margin-top: 0.6rem; }
  @media (max-width: 900px) { .bas { grid-template-columns: 1fr; } }
  .actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .actions small { display: block; color: var(--texte-2); font-size: 0.75rem; }
  .consigne { color: var(--or-2); }
  .manuel { margin-top: 0.6rem; }
  .explication { margin: 0.35em 0; }
  .explication.indispo { opacity: 0.6; }
  .manuel summary { cursor: pointer; color: var(--texte-2); margin-bottom: 0.4rem; }
  .combattant { display: grid; grid-template-columns: 1fr 90px; gap: 0.1rem 0.5rem; align-items: center; margin-bottom: 0.35rem; font-size: 0.9rem; }
  .combattant small { grid-column: 1 / -1; }
  .combattant.ko { opacity: 0.45; }
  .combattant.ennemi .barre > div { background: var(--rouge); }
  .journal p { margin: 0.15em 0; font-size: 0.88rem; }
  .journal .fort { color: var(--or-2); font-weight: 600; }
  .journal { max-height: 280px; overflow: auto; }
</style>
