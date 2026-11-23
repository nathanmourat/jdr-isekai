<script lang="ts">
  /** Cinématique jouée au début d'une scène (voir cinematiques.ts). Chaque appareil retient qu'il l'a vue, par partie. */
  import { cleCinematiqueVue, urlCinematique } from './cinematiques';
  import { lireTexte, ecrireTexte } from './preferences';
  import { masqueParRobot } from './illustrations';

  let { id, partie, surFin }: { id: string; partie: string; surFin?: () => void } = $props();
  const url = $derived(urlCinematique(id));
  const cleVue = $derived(cleCinematiqueVue(partie, id));
  let finie = $state(false);
  const robot = masqueParRobot('cinematique');
  const visible = $derived(!!url && !robot && !finie && lireTexte(cleVue) !== 'vue');
  let bouton: HTMLButtonElement | undefined = $state();

  function terminer() {
    if (finie) return;
    finie = true;
    ecrireTexte(cleVue, 'vue');
    surFin?.();
  }
  $effect(() => { if (visible) bouton?.focus(); });
  function clavier(e: KeyboardEvent) { if (visible && e.key === 'Escape') { e.preventDefault(); terminer(); } }
</script>

<svelte:window onkeydown={clavier} />

{#if visible}
  <div class="cinematique" role="dialog" aria-modal="true" aria-label="Cinématique">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video src={url} autoplay muted playsinline onended={terminer} onerror={terminer}></video>
    <button class="passer" bind:this={bouton} onclick={terminer}>Passer ⏭</button>
  </div>
{/if}

<style>
  .cinematique {
    position: absolute; inset: 0; z-index: 60;
    background: #000; display: flex; align-items: center; justify-content: center;
  }
  video { width: 100%; height: 100%; object-fit: contain; }
  .passer {
    position: absolute; right: 1rem; bottom: 1rem; min-width: 44px; min-height: 44px;
    padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid #fff6;
    background: #0009; color: #fff; font-size: 1rem; cursor: pointer;
  }
  .passer:hover, .passer:focus-visible { background: #000c; border-color: #fff; }
</style>
