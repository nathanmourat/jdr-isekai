<script lang="ts">
  /** Nom d'un objet avec son icône et la couleur de sa rareté ; pour l'équipement, ses détails en dessous. */
  import { jeu } from './jeu.svelte';
  import { urlAsset } from '../rendu/assets';
  import { detailsObjet, NOMS_RARETES } from '../moteur/fiche';

  let { id, quantite = 0, details = true }: { id: string; quantite?: number; details?: boolean } = $props();
  const c = jeu.contenu!;
  const o = $derived(c.objets[id]);
  const icone = $derived(urlAsset(`icones/objets/${id}`));
  const lignes = $derived(details ? detailsObjet(c, id) : []);
</script>

{#if o}
  <span class="objet">
    {#if icone}<img class="pixel icone rarete-bord-{o.rarete}" src={icone} alt="" />{/if}
    <span>
      <strong class="rarete-{o.type === 'equipement' ? o.rarete : 'aucune'}">{o.nom}</strong>{#if quantite > 1}{' '}× {quantite}{/if}
      {#if o.type === 'equipement' && o.rarete !== 'commun'}<span class="badge rarete-{o.rarete}">{NOMS_RARETES[o.rarete]}</span>{/if}
      {#if lignes.length > 0}
        {#each lignes as l, i (i)}<br /><small class="discret">{l}</small>{/each}
      {:else}<br /><small class="discret">{o.description}</small>{/if}
    </span>
  </span>
{/if}

<style>
  .objet { display: inline-flex; gap: 0.5rem; align-items: flex-start; }
  .icone { width: 32px; height: 32px; flex: none; border-radius: 4px; border: 1px solid var(--bord); background: var(--fond); }
</style>
