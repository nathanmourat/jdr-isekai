<script lang="ts">
  /**
   * Tiroir qui glisse depuis la droite, par-dessus la scène, avec un fond assombri derrière.
   * On le ferme avec ✕, Échap, un clic en dehors, ou en balayant vers la droite sur téléphone.
   * Son contenu défile à l'intérieur : la page, elle, ne défile jamais.
   */
  import type { Snippet } from 'svelte';
  import { onMount, tick } from 'svelte';
  let { titre, fermer, children }: { titre: string; fermer: () => void; children: Snippet } = $props();
  let boite: HTMLElement;
  let debutX: number | null = null;

  onMount(() => {
    // le focus va dans le tiroir ; il reviendra au bouton qui l'a ouvert à la fermeture
    const avant = document.activeElement as HTMLElement | null;
    void tick().then(() => boite?.querySelector<HTMLElement>('.fermer')?.focus());
    return () => avant?.focus?.();
  });

  function clavier(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); fermer(); return; }
    if (e.key !== 'Tab') return;
    // le focus reste dans le tiroir
    const elements = [...boite.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.hasAttribute('disabled'));
    if (!elements.length) return;
    const premier = elements[0], dernier = elements[elements.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  }
</script>

<div class="voile" onclick={fermer} role="presentation"></div>
<div class="tiroir" bind:this={boite} role="dialog" aria-modal="true" aria-label={titre} tabindex="-1" onkeydown={clavier}
  ontouchstart={(e) => (debutX = e.touches[0].clientX)}
  ontouchend={(e) => { if (debutX !== null && e.changedTouches[0].clientX - debutX > 80) fermer(); debutX = null; }}>
  <header><h2>{titre}</h2><button class="fermer" aria-label="Fermer" onclick={fermer}>✕</button></header>
  <div class="contenu">{@render children()}</div>
</div>

<style>
  .voile { position: fixed; inset: 0; background: #0008; z-index: 80; animation: apparaitre 0.18s ease-out; }
  .tiroir { position: fixed; top: 0; right: 0; bottom: 0; width: min(440px, 100vw); z-index: 81; display: flex; flex-direction: column; background: var(--fond); border-left: 1px solid var(--bord); box-shadow: var(--ombre); animation: glisser 0.18s ease-out; padding-right: env(safe-area-inset-right); }
  header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--bord); padding-top: max(0.6rem, env(safe-area-inset-top)); }
  header h2 { margin: 0; }
  .fermer { min-width: 44px; min-height: 44px; }
  .contenu { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 0.8rem; padding-bottom: max(0.8rem, env(safe-area-inset-bottom)); }
  @keyframes glisser { from { transform: translateX(100%); } }
  @keyframes apparaitre { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .tiroir, .voile { animation: none; } }
</style>
