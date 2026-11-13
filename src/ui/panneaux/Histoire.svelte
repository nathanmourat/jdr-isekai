<script lang="ts">
  /** Scènes personnelles disponibles partout (prologue des réincarnés…). */
  import { jeu } from '../jeu.svelte';
  import { scenesDisponibles } from '../../moteur/partie';
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const scenes = $derived(scenesDisponibles(c, etat, null, h.id).filter((s) => s.type === 'individuel'));
</script>

<section class="carte-ui">
  <h2>Histoire personnelle de {h.nom}</h2>
  {#each scenes as s (s.id)}
    <div class="ligne item"><span>{s.titre}</span><button class="principal" onclick={() => jeu.agir({ type: 'lancer_scene', scene: s.id })}>Jouer</button></div>
  {:else}
    <p class="discret">{h.origine === 'reincarne' ? 'Votre prologue est terminé.' : 'Pas de scène personnelle en attente. Les scènes avec les compagnons se trouvent dans les lieux de la carte.'}</p>
  {/each}
  {#if h.origine === 'reincarne'}<p class="discret">Le prologue se joue seul, quand vous voulez, sans bloquer les autres joueurs.</p>{/if}
</section>

<style>.item { justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--bord); }</style>
