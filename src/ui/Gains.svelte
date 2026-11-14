<script lang="ts">
  /**
   * Notifications de gain (test 3, point 5) : 3 secondes, empilées en haut à droite, sans bloquer les clics.
   * Chaque joueur voit les gains de son héros (et des héros joués sur cet appareil) ; un gain de groupe, tout le monde le voit.
   */
  import { jeu } from './jeu.svelte';
  import { urlAsset } from '../rendu/assets';

  const DUREE_MS = 3000;
  const MAX = 4;
  let vus = new Set<number>();
  let visibles = $state<{ id: number; texte: string; sorte: string; icone: string | null }[]>([]);

  $effect(() => {
    const etat = jeu.etat;
    const miens = new Set(jeu.joueursLocaux.map((j) => etat?.joueurs[j]?.herosId).filter(Boolean));
    for (const g of jeu.gains) {
      if (vus.has(g.id)) continue;
      vus.add(g.id);
      if (g.heros !== null && !miens.has(g.heros)) continue;
      visibles = [...visibles, { id: g.id, texte: g.texte, sorte: g.sorte, icone: g.objet ? urlAsset(`icones/objets/${g.objet}`) : null }].slice(-MAX);
      setTimeout(() => { visibles = visibles.filter((x) => x.id !== g.id); }, DUREE_MS);
    }
  });
</script>

{#if visibles.length}
  <div class="gains" aria-live="polite">
    {#each visibles as v (v.id)}
      <p class={v.sorte}>{#if v.icone}<img class="pixel" src={v.icone} alt="" />{/if}<span>{v.texte}</span></p>
    {/each}
  </div>
{/if}

<style>
  .gains { display: grid; gap: 0.3rem; justify-items: end; pointer-events: none; max-width: min(300px, calc(100vw - 1.2rem)); }
  p { margin: 0; display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.7rem; border-radius: 999px; background: #14111cf0; border: 1px solid var(--bord); font-weight: 700; font-size: 0.92rem; box-shadow: var(--ombre); animation: entree 0.18s ease-out, sortie 0.3s ease-in 2.7s forwards; }
  p.gain { color: #8fe38f; border-color: #2f6b3a; }
  p.perte { color: #ff8f84; border-color: #7a2f2a; }
  p.info { color: var(--or-2); border-color: var(--or); }
  img { width: 24px; height: 24px; image-rendering: pixelated; }
  @keyframes entree { from { opacity: 0; transform: translateX(12px); } }
  @keyframes sortie { to { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { p { animation: sortie 0.01s 2.99s forwards; } }
</style>
