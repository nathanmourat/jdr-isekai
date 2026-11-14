<script lang="ts">
  /**
   * Cadre 16:9 agrandi au maximum dans l'espace disponible, en gardant ses proportions.
   * Les bandes vides éventuelles restent sombres. Le contenu se place en pourcentages de ce cadre :
   * les zones cliquables restent ainsi exactement sur leur image, quelle que soit la taille de l'écran.
   */
  import type { Snippet } from 'svelte';
  let { children, classe = '' }: { children: Snippet; classe?: string } = $props();
</script>

<div class="zone169">
  <div class={`boite169 ${classe}`}>{@render children()}</div>
</div>

<style>
  .zone169 { position: absolute; inset: 0; container-type: size; display: grid; place-items: center; background: #07060a; overflow: hidden; }
  .boite169 { position: relative; width: min(100cqw, 100cqh * 16 / 9); aspect-ratio: 16 / 9; }
  /* écran en hauteur (téléphone en portrait) : la scène se met en haut, sous la barre, et laisse la place dessous aux informations */
  @media (max-aspect-ratio: 1 / 1) { .zone169 { place-items: start center; padding-top: calc(max(0.2rem, env(safe-area-inset-top)) + 3rem); } }
</style>
