<script lang="ts">
  /** Héberge le jeu Phaser (scènes combat et donjon) dans un cadre 16:9 adaptable. */
  import Phaser from 'phaser';
  import { onDestroy, onMount } from 'svelte';
  import { SceneCombat } from '../rendu/SceneCombat';
  import { SceneDonjon } from '../rendu/SceneDonjon';
  import { jeu } from './jeu.svelte';

  let { scene, surPret }: { scene: 'combat' | 'donjon'; surPret: (s: SceneCombat | SceneDonjon) => void } = $props();
  let cadre: HTMLDivElement;
  let game: Phaser.Game | null = null;

  onMount(() => {
    const g = jeu.contenu!.config.graphismes;
    const tailles = { tailleCombat: g.taille_sprite_combat ?? 64, tailleBoss: g.taille_sprite_boss ?? 128, tailleExploration: g.taille_sprite_exploration ?? 32 };
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: cadre,
      width: 960,
      height: 540,
      backgroundColor: '#0d0b12',
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [],
      banner: false,
    });
    const s = scene === 'combat' ? new SceneCombat() : new SceneDonjon();
    game.scene.add(scene, s, true, tailles);
    surPret(s);
  });

  onDestroy(() => game?.destroy(true));
</script>

<div class="cadre" bind:this={cadre}></div>

<style>
  .cadre { width: 100%; aspect-ratio: 16 / 9; max-height: 70dvh; background: #0d0b12; border-radius: var(--rayon); overflow: hidden; border: 1px solid var(--bord); }
</style>
