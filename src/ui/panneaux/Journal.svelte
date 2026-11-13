<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { onMount } from 'svelte';

  const etat = $derived(jeu.etat!);
  let vuAuDebut = jeu.journalVu;
  const nouvelles = $derived(etat.journal.slice(vuAuDebut));
  onMount(() => jeu.marquerJournalVu());
</script>

<section class="grille">
  {#if nouvelles.length && vuAuDebut > 0}
    <div class="carte-ui nouveau">
      <h2>Pendant votre absence</h2>
      {#each nouvelles as e, i (i)}<p>{e.texte}</p>{/each}
    </div>
  {/if}
  <div class="carte-ui">
    <h2>Journal de la partie</h2>
    {#each [...etat.journal].reverse() as e, i (i)}<p class="entree"><span class="badge">ch. {e.chapitre}</span> {e.texte}</p>{/each}
  </div>
</section>

<style>
  .nouveau { border-color: var(--or); }
  .entree { margin: 0.3em 0; }
</style>
