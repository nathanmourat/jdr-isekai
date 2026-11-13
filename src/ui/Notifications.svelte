<script lang="ts">
  /**
   * Messages courts (« Daleko rejoint l'histoire », gains, cadeaux…) : ils s'affichent quelques secondes
   * puis s'effacent en fondu. L'historique complet reste dans l'onglet Journal.
   */
  import { jeu } from './jeu.svelte';

  const DUREE_MS = 6000;
  const FONDU_MS = 600;
  let messages = $state<{ id: number; texte: string; sortie: boolean }[]>([]);
  let compteur = 0;
  let dernier = -1;

  $effect(() => {
    const etat = jeu.etat;
    if (!etat || etat.numeroAction === dernier) return;
    const premier = dernier === -1;
    dernier = etat.numeroAction;
    if (premier) return; // à l'ouverture d'une partie, on ne rejoue pas les anciens messages
    for (const texte of etat.dernieresNouvelles) {
      const id = ++compteur;
      messages.push({ id, texte, sortie: false });
      setTimeout(() => { const m = messages.find((x) => x.id === id); if (m) m.sortie = true; }, DUREE_MS);
      setTimeout(() => { messages = messages.filter((x) => x.id !== id); }, DUREE_MS + FONDU_MS);
    }
    if (messages.length > 5) messages = messages.slice(-5);
  });
</script>

{#if messages.length}
  <aside class="notifications" aria-live="polite">
    {#each messages as m (m.id)}
      <p class:sortie={m.sortie}>{m.texte}</p>
    {/each}
  </aside>
{/if}

<style>
  .notifications { position: fixed; right: 1rem; bottom: 1rem; max-width: min(340px, calc(100vw - 2rem)); display: grid; gap: 0.4rem; z-index: 40; pointer-events: none; }
  p { margin: 0; background: var(--fond-2); border: 1px solid var(--or); border-radius: var(--rayon); padding: 0.5rem 0.8rem; box-shadow: var(--ombre); font-size: 0.92rem; animation: entree 0.3s ease-out; transition: opacity 0.6s; }
  p.sortie { opacity: 0; }
  @keyframes entree { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { p { animation: none; } }
</style>
