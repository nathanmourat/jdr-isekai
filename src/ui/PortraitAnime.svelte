<script lang="ts">
  /**
   * Portrait animé de dialogue (un contexte WebGL par portrait affiché, détruit quand il disparaît).
   * Le texte de la réplique s'affiche d'un coup ; seul le portrait « parle » à son rythme (prononcer, lettre par lettre).
   * Si une image ne se charge pas : portrait fixe.
   */
  import { untrack } from 'svelte';
  import { PortraitAnime } from '../rendu/portraitAnime';
  import { delaiApresLettre, type PortraitAnimeDef } from './portraits';

  let { portrait, texte = '', cleParole = '', alt = '' }: { portrait: PortraitAnimeDef; texte?: string; cleParole?: string; alt?: string } = $props();

  let boite: HTMLDivElement;
  let anime: PortraitAnime | null = null;
  let pret = $state(false);
  let echec = $state(false);
  let cleChargee = '';

  // création au montage, destruction au démontage
  $effect(() => {
    // untrack : changer de personnage ne recrée pas le portrait (l'effet suivant le recharge)
    const p = untrack(() => new PortraitAnime(boite, { lueur: portrait.effets.lueur, particules: portrait.effets.particules }));
    anime = p;
    return () => { anime = null; cleChargee = ''; p.detruire(); };
  });

  // personnage ou expression qui change : on recharge (le module change d'image pendant un clignement, en fondu)
  $effect(() => {
    const def = portrait;
    const p = anime;
    if (!p || def.cle === cleChargee) return;
    cleChargee = def.cle;
    if (p.options.lueur !== def.effets.lueur) p.definirLueur(def.effets.lueur);
    if (p.options.particules !== def.effets.particules) p.definirParticules(def.effets.particules);
    p.charger(def.calques, def.reglages).then(
      () => { if (anime === p) pret = true; },
      (e: unknown) => { console.warn('[portrait animé]', e); if (anime === p) echec = true; },
    );
  });

  // parole : une lettre toutes les 42 ms environ, pauses après la ponctuation ; arrêtée si la réplique change
  $effect(() => {
    void cleParole;
    const t = texte;
    const p = anime;
    if (!p || !t) return;
    let i = 0;
    let minuteur: ReturnType<typeof setTimeout> | undefined;
    const suite = () => {
      if (i >= t.length) { p.parler(false); return; }
      const lettre = t[i++];
      p.prononcer(lettre);
      minuteur = setTimeout(suite, delaiApresLettre(lettre));
    };
    suite();
    return () => { clearTimeout(minuteur); p.parler(false); };
  });
</script>

<div class="cadre-portrait" role="img" aria-label={alt}>
  {#if !pret || echec}<img class="fixe" src={portrait.calques.base} alt="" />{/if}
  <div class="anime" class:cache={echec} bind:this={boite}></div>
</div>

<style>
  /* même cadre que les portraits fixes du dialogue (bordure dorée) ; pas de « pixel » : ce sont des illustrations */
  .cadre-portrait { position: relative; width: clamp(72px, 14vw, 140px); aspect-ratio: 1; border-radius: 8px; border: 2px solid var(--or); background: var(--fond); flex: none; overflow: hidden; }
  .fixe, .anime { position: absolute; inset: 0; width: 100%; height: 100%; }
  .fixe { object-fit: cover; }
  .cache { display: none; }
</style>
