<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import PhaserHote from '../PhaserHote.svelte';
  import type { SceneDonjon } from '../../rendu/SceneDonjon';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const dj = $derived(etat.donjon!);
  const meneurPresent = $derived(!!etat.meneur && !!etat.joueurs[etat.meneur]?.present);
  /** Le meneur guide ; s'il est absent, n'importe quel joueur présent peut guider. */
  const guide = $derived(etat.meneur && jeu.joueursLocaux.includes(etat.meneur) ? etat.meneur : !meneurPresent ? jeu.joueurActif : null);
  const herosMeneur = $derived(etat.meneur && etat.joueurs[etat.meneur]?.herosId ? etat.heros[etat.joueurs[etat.meneur].herosId!] : jeu.monHeros);
  let scene: SceneDonjon | null = null;
  let envoi = false;

  async function bouger(dx: number, dy: number) {
    if (!guide || envoi) return;
    envoi = true;
    await jeu.agir({ type: 'donjon_deplacer', joueur: guide, dx, dy });
    envoi = false;
  }

  $effect(() => {
    scene?.afficher(etat, {
      contenu: c,
      echelle: c.config.graphismes.echelle_pixel_art ?? 2,
      meneur: herosMeneur ? { classe: herosMeneur.classe, race: herosMeneur.race, teinte: c.races[herosMeneur.race].teinte ?? null } : null,
      peutBouger: !!guide,
      surDeplacement: bouger,
    });
  });
</script>

<section class="donjon">
  <PhaserHote plein scene="donjon" surPret={(s) => (scene = s as SceneDonjon)} />
  <div class="ligne entete">
    <h2>{c.donjons[dj.id].nom}</h2>
    <span class="discret">{guide ? 'Flèches, ZQSD ou clic pour avancer.' : `${etat.joueurs[etat.meneur ?? '']?.pseudo} guide le groupe.`}</span>
  </div>
  <div class="bas">
    <div class="carte-ui messages" aria-live="polite">
      {#each dj.messages as m, i (i)}<p>{m}</p>{:else}<p class="discret">Le groupe avance prudemment…</p>{/each}
    </div>
    {#if guide}
      <div class="croix" aria-label="Déplacements">
        <button aria-label="Haut" onclick={() => bouger(0, -1)}>▲</button>
        <button aria-label="Gauche" onclick={() => bouger(-1, 0)}>◀</button>
        <button aria-label="Bas" onclick={() => bouger(0, 1)}>▼</button>
        <button aria-label="Droite" onclick={() => bouger(1, 0)}>▶</button>
      </div>
    {/if}
  </div>
</section>

<style>
  .donjon { position: absolute; inset: 0; }
  .entete { position: absolute; z-index: 20; top: calc(max(0.3rem, env(safe-area-inset-top)) + 3rem); left: max(0.5rem, env(safe-area-inset-left)); right: max(0.5rem, env(safe-area-inset-right)); justify-content: space-between; pointer-events: none; }
  .entete h2 { margin: 0; text-shadow: 0 2px 6px #000, 0 0 2px #000; }
  .entete span { background: #1d1928d9; border-radius: 6px; padding: 0.1rem 0.5rem; }
  .bas { position: absolute; z-index: 30; left: 50%; translate: -50% 0; bottom: max(0.4rem, env(safe-area-inset-bottom)); width: min(980px, calc(100% - 0.8rem)); display: flex; gap: 0.6rem; align-items: flex-end; }
  .messages { flex: 1; max-height: 30dvh; overflow-y: auto; padding: 0.6rem 0.8rem; background: #14111cf0; }
  .messages p { margin: 0.2em 0; }
  .croix { display: grid; grid-template-areas: '. h .' 'g b d'; gap: 0.3rem; }
  .croix button { width: 52px; height: 52px; font-size: 1.2rem; background: #27213ae6; }
  .croix button:nth-child(1) { grid-area: h; }
  .croix button:nth-child(2) { grid-area: g; }
  .croix button:nth-child(3) { grid-area: b; }
  .croix button:nth-child(4) { grid-area: d; }
</style>
