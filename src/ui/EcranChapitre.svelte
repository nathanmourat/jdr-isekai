<script lang="ts">
  /**
   * Écran de début de chapitre : grande illustration peinte, numéro et titre du chapitre.
   * Affiché une seule fois par partie et par appareil (voir illustrations.ts), seulement quand le héros est libre.
   */
  import { cleChapitreVu, ecranDuChapitre, masqueParRobot } from './illustrations';
  import { lireTexte, ecrireTexte } from './preferences';
  import { annoncer } from './premierPlan.svelte';
  import { jeu } from './jeu.svelte';
  import { untrack } from 'svelte';

  let { chapitre, partie, libre }: { chapitre: number; partie: string; libre: boolean } = $props();
  const ecran = $derived(ecranDuChapitre(jeu.contenu!, chapitre));
  const cle = $derived(cleChapitreVu(partie, chapitre));
  let fermes = $state<string[]>([]);
  const robot = masqueParRobot('ecran-chapitre');
  const visible = $derived(libre && !robot && !!ecran && !fermes.includes(cle) && lireTexte(cle) !== 'vu');
  let image = $state(0);
  let bouton: HTMLButtonElement | undefined = $state();
  const romains = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  function fermer() {
    ecrireTexte(cle, 'vu');
    fermes = [...fermes, cle];
  }
  $effect(() => {
    if (!visible) return;
    const n = ecran!.urls.length;
    // annoncer() lit et change premierPlan : hors suivi, sinon l'effet se relancerait sans fin
    untrack(() => { annoncer('ecran-chapitre'); image = 0; bouton?.focus(); });
    if (n < 2) return;
    const t = setInterval(() => { image = (image + 1) % n; }, 5000);
    return () => clearInterval(t);
  });
  function clavier(e: KeyboardEvent) { if (visible && e.key === 'Escape') { e.preventDefault(); fermer(); } }
</script>

<svelte:window onkeydown={clavier} />

{#if visible && ecran}
  <div class="ecran-chapitre" role="dialog" aria-modal="true" aria-label="Chapitre {chapitre} — {ecran.titre}">
    {#each ecran.urls as url, i (url)}
      <img src={url} alt="" class:active={i === image} />
    {/each}
    <div class="voile"></div>
    <div class="texte">
      <p class="numero">Chapitre {romains[chapitre - 1] ?? chapitre}</p>
      <h1>{ecran.titre}</h1>
      {#if ecran.sous_titre}<p class="sous-titre">{ecran.sous_titre}</p>{/if}
      <button class="principal" bind:this={bouton} onclick={fermer}>Continuer</button>
    </div>
  </div>
{/if}

<style>
  .ecran-chapitre {
    position: fixed; inset: 0; z-index: 70; background: #000; overflow: hidden;
    animation: apparition 600ms ease-out;
  }
  img {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    opacity: 0; transition: opacity 1200ms ease;
    animation: zoom 24s ease-out forwards;
  }
  img.active { opacity: 1; }
  .voile { position: absolute; inset: 0; background: linear-gradient(to bottom, #0000 45%, #000c 100%); pointer-events: none; }
  .texte {
    position: absolute; left: 0; right: 0; bottom: 7%; text-align: center; color: #fff;
    display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 0 1rem;
    text-shadow: 0 2px 8px #000;
  }
  .numero { margin: 0; letter-spacing: 0.35em; text-transform: uppercase; font-size: clamp(0.8rem, 1.6vw, 1.1rem); color: #f3d58a; }
  h1 { margin: 0; font-size: clamp(1.6rem, 5vw, 3.2rem); line-height: 1.1; }
  .sous-titre { margin: 0 0 0.6rem; font-size: clamp(0.9rem, 1.8vw, 1.2rem); opacity: 0.9; }
  button { min-width: 44px; min-height: 44px; padding: 0.5rem 1.6rem; }
  @keyframes zoom { from { transform: scale(1); } to { transform: scale(1.08); } }
  @keyframes apparition { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .ecran-chapitre, img { animation: none; }
    img { transition: none; }
  }
</style>
