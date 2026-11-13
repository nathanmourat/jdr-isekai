<script lang="ts">
  import { jeu } from '../jeu.svelte';
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const quetes = $derived(Object.entries(etat.quetes).map(([id, q]) => ({ def: c.quetes[id], ...q })).sort((a, b) => Number(a.terminee) - Number(b.terminee)));
  const types: Record<string, string> = { principale: 'Quête principale', secondaire: 'Quête secondaire', classe: 'Quête de classe', compagnon: 'Quête de compagnon', contrat: 'Contrat' };
</script>

<section class="grille">
  {#each quetes as q (q.def.id)}
    <article class="carte-ui" class:terminee={q.terminee}>
      <div class="ligne"><h3>{q.def.titre}</h3><span class="badge">{types[q.def.type]}</span>{#if q.terminee}<span class="badge or">terminée</span>{/if}</div>
      <p class="discret">{q.def.resume}</p>
      {#if !q.terminee}<p>➤ {q.def.etapes.find((e) => e.id === q.etape)?.objectif}</p>{/if}
    </article>
  {:else}<p class="discret">Aucune quête pour l'instant.</p>{/each}
</section>

<style>
  .terminee { opacity: 0.6; }
  h3 { margin: 0; }
</style>
