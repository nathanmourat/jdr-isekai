<script lang="ts">
  /** Explique une compétence : description, chiffres calculés pour ce héros, origine. */
  import { jeu } from './jeu.svelte';
  import type { Competence } from '../contenu/schemas';
  import type { Heros } from '../moteur/personnage';
  import { chiffresCompetence, origineCompetence, resumeChiffres, sujetHeros, type SujetChiffres } from '../moteur/fiche';

  let { comp, rang = 1, heros = null, sujet = null, reel = null }: {
    comp: Competence; rang?: number; heros?: Heros | null; sujet?: SujetChiffres | null;
    /** En combat : chiffres réels contre la cible actuelle (calculés par le moteur). */
    reel?: { degats: [number, number] | null; reussite: number | null } | null;
  } = $props();
  const c = jeu.contenu!;
  const s = $derived(sujet ?? (heros ? sujetHeros(c, heros) : null));
  const k = $derived.by(() => {
    if (!s) return null;
    const x = chiffresCompetence(c, s, comp, rang);
    if (reel?.degats) x.degats = reel.degats;
    if (reel && reel.reussite !== null) x.toucher = reel.reussite;
    return x;
  });
</script>

<span class="comp-info">
  <strong>{comp.nom}</strong>{#if rang > 1} <span class="badge">rang {rang}</span>{/if}
  {#if k}<span class="chiffres"> ({resumeChiffres(k)})</span>{/if} :
  {comp.description}
  {#if k?.effets.length}<span class="effets"> Effets : {k.effets.join(' ; ')}.</span>{/if}
  {#if heros}<em class="origine"> — {origineCompetence(c, heros, comp.id)}</em>{/if}
</span>

<style>
  .comp-info { font-size: 0.9rem; }
  .chiffres { color: var(--or-2); }
  .effets { color: var(--texte); }
  .origine { color: var(--texte-2); font-size: 0.85rem; }
</style>
