<script lang="ts">
  /**
   * Niveau conseillé d'une quête ou d'un contrat, coloré selon le niveau moyen du groupe :
   * vert (le groupe a le niveau), orange (il manque 1 ou 2 niveaux), rouge (il en manque 3 ou plus).
   */
  import { jeu } from './jeu.svelte';
  import { aideNiveau, couleurNiveau, niveauGroupe } from '../moteur/guide';

  let { niveau, aide = false }: { niveau: number; aide?: boolean } = $props();
  const groupe = $derived(niveauGroupe(jeu.etat!));
  const couleur = $derived(couleurNiveau(niveau, groupe));
</script>

<span class={`badge niveau ${couleur}`} title={aideNiveau(niveau, groupe)}>Niv. {niveau}</span>{#if aide && couleur !== 'vert'}<small class={`aide ${couleur}`}> {aideNiveau(niveau, groupe)}</small>{/if}

<style>
  .niveau { font-weight: 700; }
  .niveau.vert { color: var(--vert); border-color: #2f6b3a; }
  .niveau.orange, .aide.orange { color: #f2a33a; }
  .niveau.orange { border-color: #7a5a20; }
  .niveau.rouge, .aide.rouge { color: var(--rouge); }
  .niveau.rouge { border-color: #7a2f2a; }
  .aide { display: block; margin: 0.15em 0; }
</style>
