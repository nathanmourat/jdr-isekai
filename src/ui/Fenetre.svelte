<script lang="ts">
  /** Fenêtre centrée par-dessus la scène (boutique, auberge, temps libre…), qu'on peut fermer ; elle défile à l'intérieur. */
  import type { Snippet } from 'svelte';
  let { titre = '', fermer = null, children }: { titre?: string; fermer?: (() => void) | null; children: Snippet } = $props();
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && fermer) fermer(); }} />
<div class="voile" onclick={() => fermer?.()} role="presentation"></div>
<div class="fenetre carte-ui" role="dialog" aria-modal="true" aria-label={titre || 'Fenêtre'}>
  {#if titre || fermer}
    <header>{#if titre}<h2>{titre}</h2>{/if}{#if fermer}<button class="fermer" aria-label="Fermer" onclick={fermer}>✕</button>{/if}</header>
  {/if}
  <div class="contenu">{@render children()}</div>
</div>

<style>
  .voile { position: absolute; inset: 0; background: #0009; z-index: 60; }
  .fenetre { position: absolute; z-index: 61; left: 50%; top: 50%; translate: -50% -50%; width: min(760px, calc(100% - 1.5rem)); max-height: calc(100% - 5rem); display: flex; flex-direction: column; padding: 0; animation: apparaitre 0.18s ease-out; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.6rem 0.9rem; border-bottom: 1px solid var(--bord); }
  header h2 { margin: 0; }
  .fermer { min-width: 44px; min-height: 44px; }
  .contenu { overflow-y: auto; padding: 0.9rem; overscroll-behavior: contain; }
  @keyframes apparaitre { from { opacity: 0; scale: 0.97; } }
  @media (prefers-reduced-motion: reduce) { .fenetre { animation: none; } }
</style>
