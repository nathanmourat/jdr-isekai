<script lang="ts">
  /**
   * Animation des pièces : quand de l'or sort du porte-monnaie d'un héros de cet appareil (mise d'un pari)
   * ou y rentre (pari gagné), des pièces s'envolent avec « −20 or » en rouge ou « +40 or » en vert.
   * Les montants viennent du moteur (`etat.mouvementsOr`) : l'animation ne fait que les montrer.
   */
  import { jeu } from './jeu.svelte';

  let vols = $state<{ id: number; montant: number; nom: string; pieces: number[] }[]>([]);
  let compteur = 0;
  let dernier = -1;

  $effect(() => {
    const etat = jeu.etat;
    if (!etat || etat.numeroAction === dernier) return;
    const premier = dernier === -1;
    dernier = etat.numeroAction;
    if (premier) return;
    const miens = jeu.joueursLocaux.map((j) => etat.joueurs[j]?.herosId).filter((x): x is string => !!x);
    for (const m of etat.mouvementsOr ?? []) {
      if (!miens.includes(m.heros)) continue;
      const id = ++compteur;
      const nb = Math.min(8, Math.max(3, Math.round(Math.abs(m.montant) / 5)));
      vols.push({ id, montant: m.montant, nom: etat.heros[m.heros]?.nom ?? '', pieces: Array.from({ length: nb }, (_, i) => i) });
      setTimeout(() => { vols = vols.filter((v) => v.id !== id); }, 2200);
    }
  });
</script>

{#each vols as v (v.id)}
  <div class="vol" class:gain={v.montant > 0} class:perte={v.montant < 0} aria-live="polite">
    <span class="montant">{v.montant > 0 ? '+' : '−'}{Math.abs(v.montant)} or{#if jeu.joueursLocaux.length > 1} <small>({v.nom})</small>{/if}</span>
    {#each v.pieces as i (i)}
      <span class="piece" style={`--i:${i}; --dx:${(i % 2 ? 1 : -1) * (12 + i * 9)}px`}>🪙</span>
    {/each}
  </div>
{/each}

<style>
  .vol { position: fixed; top: 3.2rem; right: 1.2rem; z-index: 60; pointer-events: none; width: 0; height: 0; }
  .montant { position: absolute; right: 0; top: 0; white-space: nowrap; font-weight: 800; font-size: 1.5rem; text-shadow: 0 0 4px #000, 0 2px 6px #000; animation: montant 2.1s ease-out forwards; }
  .perte .montant { color: #ff6b5a; }
  .gain .montant { color: #7be38a; }
  .piece { position: absolute; right: 1rem; top: 0; font-size: 1.4rem; opacity: 0; animation-duration: 1.3s; animation-timing-function: ease-in-out; animation-fill-mode: forwards; animation-delay: calc(var(--i) * 90ms); }
  .perte .piece { animation-name: sortir; }
  .gain .piece { animation-name: rentrer; }
  /* les pièces sortent du porte-monnaie (barre du héros, en haut à droite) et tombent */
  @keyframes sortir { 0% { opacity: 1; transform: translate(0, 0) scale(1); } 100% { opacity: 0; transform: translate(var(--dx), 150px) scale(0.7) rotate(240deg); } }
  /* les pièces arrivent d'en bas et rentrent dans le porte-monnaie */
  @keyframes rentrer { 0% { opacity: 0; transform: translate(var(--dx), 150px) scale(0.7) rotate(-240deg); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(0, 0) scale(1); } }
  @keyframes montant { 0% { opacity: 0; transform: translateY(10px) scale(0.8); } 15% { opacity: 1; transform: translateY(26px) scale(1.15); } 75% { opacity: 1; transform: translateY(40px) scale(1); } 100% { opacity: 0; transform: translateY(54px); } }
  @media (prefers-reduced-motion: reduce) { .piece { display: none; } }
</style>
