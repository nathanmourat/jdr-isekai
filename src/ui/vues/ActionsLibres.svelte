<script lang="ts">
  /**
   * Panneau d'action en combat :
   *  - « Suivre le script » : l'IA maison propose les meilleures actions, on clique ;
   *  - « Proposer mon action » : on écrit librement, l'IA comprend, le moteur vérifie.
   * 3 propositions irréalisables par tour au maximum : ensuite, il faut choisir parmi les propositions.
   */
  import { jeu } from '../jeu.svelte';
  import { interpreter, propositionsScript, type ContexteIA, type Interpretation, type Proposition } from '../../ia/interpreteur';
  import type { Combattant } from '../../moteur/combat';

  let { cle, acteur }: { cle: string; acteur: Combattant } = $props();
  const c = jeu.contenu!;
  const ESSAIS_MAX = 3;
  const etat = $derived(jeu.etat!);
  const combat = $derived(etat.combats[cle].combat);
  const heros = $derived(acteur.herosId ? etat.heros[acteur.herosId] ?? null : null);
  const ctx = $derived<ContexteIA>({ contenu: c, combat, acteur: acteur.id, heros, grimoire: etat.grimoire ?? {} });
  const cleEssais = $derived(`${combat.id}:${combat.tour}:${acteur.id}`);
  const essais = $derived(jeu.essais[cleEssais] ?? 0);
  const bloque = $derived(essais >= ESSAIS_MAX);
  const script = $derived(propositionsScript(ctx));

  function lireMode(): 'script' | 'libre' {
    try { return (localStorage.getItem(`velmaris:mode-combat:${acteur.herosId}`) as 'script' | 'libre') ?? 'script'; } catch { return 'script'; }
  }
  let mode = $state<'script' | 'libre'>(lireMode());
  function changerMode(m: 'script' | 'libre') {
    mode = m;
    try { localStorage.setItem(`velmaris:mode-combat:${acteur.herosId}`, m); } catch { /* stockage indisponible : préférence non retenue */ }
  }

  let texte = $state('');
  let reponse = $state<Interpretation | null>(null);
  let derniereCle = '';
  $effect(() => {
    if (cleEssais !== derniereCle) { derniereCle = cleEssais; reponse = null; texte = ''; }
  });

  function proposer(e?: Event) {
    e?.preventDefault();
    if (bloque || !texte.trim()) return;
    reponse = interpreter(ctx, texte);
    if (reponse.compteCommeEssai) jeu.essais = { ...jeu.essais, [cleEssais]: essais + 1 };
  }

  function jouer(p: Proposition) {
    const joueur = acteur.joueurId!;
    if (p.action.kind === 'combat') jeu.agir({ type: 'combat', joueur, cle, action: p.action.action });
    else jeu.agir({ type: 'fusionner', joueur, cle, parent: p.action.parent, secondaire: p.action.secondaire, cible: p.action.cible });
  }
</script>

<div class="libre">
  <div class="modes" role="group" aria-label="Façon de jouer ce tour">
    <button class:actif={mode === 'script'} aria-pressed={mode === 'script'} onclick={() => changerMode('script')}>📜 Suivre le script</button>
    <button class:actif={mode === 'libre'} aria-pressed={mode === 'libre'} onclick={() => changerMode('libre')}>✍️ Proposer mon action</button>
  </div>

  {#if mode === 'libre' && !bloque}
    <form class="saisie" onsubmit={proposer}>
      <input bind:value={texte} placeholder="Ex. : je vise la tête du loup · je combine feu et glace · je me cache derrière le pilier" aria-label="Votre action, en toutes lettres" maxlength="200" />
      <button class="principal" type="submit" disabled={!texte.trim()}>Proposer</button>
    </form>
    <p class="discret essais">Propositions impossibles ce tour-ci : {essais} / {ESSAIS_MAX}</p>

    {#if reponse}
      <div class="reponse" class:ok={reponse.possible} aria-live="polite">
        <p class="message">{reponse.message}</p>
        {#if reponse.proposition && reponse.possible}
          <div class="carte-prop principale">
            <div><strong>{reponse.proposition.libelle}</strong><br /><small>{reponse.proposition.details}</small>
              {#if reponse.proposition.estimation.effets.length}<br /><small class="discret">Effets : {reponse.proposition.estimation.effets.join(', ')}</small>{/if}
              {#if reponse.proposition.conseil}<br /><small class="conseil">💡 {reponse.proposition.conseil}</small>{/if}
            </div>
            <button class="principal" onclick={() => jouer(reponse!.proposition!)}>Valider</button>
          </div>
        {/if}
        {#each reponse.informations as info, i (i)}<p class="info">🔎 {info}</p>{/each}
        {#if reponse.alternatives.length}
          <p class="discret">{reponse.possible ? 'Autres idées :' : 'Propositions :'}</p>
          {#each reponse.alternatives as p (p.libelle)}
            <div class="carte-prop">
              <div><strong>{p.libelle}</strong><br /><small>{p.details}</small>{#if p.conseil}<br /><small class="conseil">💡 {p.conseil}</small>{/if}</div>
              <button onclick={() => jouer(p)}>Jouer</button>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  {:else}
    {#if mode === 'libre' && bloque}
      <p class="alerte">Trois propositions impossibles ce tour-ci : choisissez parmi les propositions du jeu. Vous pourrez de nouveau proposer au prochain tour.</p>
    {/if}
    <div class="propositions">
      {#each script as p, i (p.libelle)}
        <div class="carte-prop" class:principale={i === 0}>
          <div><strong>{p.libelle}</strong><br /><small>{p.details}</small>{#if p.conseil}<br /><small class="conseil">💡 {p.conseil}</small>{/if}</div>
          <button class:principal={i === 0} onclick={() => jouer(p)}>Jouer</button>
        </div>
      {:else}<p class="discret">Aucune proposition : utilisez les actions manuelles ci-dessous.</p>{/each}
    </div>
  {/if}
</div>

<style>
  .modes { display: flex; gap: 0.3rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
  .modes button { flex: 1 1 160px; }
  .modes .actif { border-color: var(--or); background: #3b2f18; }
  .saisie { display: flex; gap: 0.4rem; }
  .essais { margin: 0.3rem 0 0.5rem; font-size: 0.82rem; }
  .reponse { border-left: 3px solid var(--rouge); padding-left: 0.7rem; margin-top: 0.4rem; }
  .reponse.ok { border-left-color: var(--vert); }
  .message { margin: 0.2rem 0 0.5rem; }
  .carte-prop { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; padding: 0.5rem 0.6rem; margin-bottom: 0.4rem; border: 1px solid var(--bord); border-radius: 8px; background: var(--fond); }
  .carte-prop.principale { border-color: var(--or); }
  .carte-prop small { color: var(--texte-2); }
  .conseil { color: var(--or-2) !important; }
  .info { margin: 0.2rem 0; font-size: 0.9rem; }
  .alerte { background: #3a2a14; border: 1px solid #7a5a20; padding: 0.5rem 0.7rem; border-radius: 8px; }
</style>
