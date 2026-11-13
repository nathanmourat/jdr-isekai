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

<section>
  <div class="ligne entete">
    <h2>{c.donjons[dj.id].nom}</h2>
    <span class="discret">{guide ? 'Flèches, ZQSD ou clic pour avancer.' : `${etat.joueurs[etat.meneur ?? '']?.pseudo} guide le groupe.`}</span>
  </div>
  <PhaserHote scene="donjon" surPret={(s) => (scene = s as SceneDonjon)} />
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
  .entete { justify-content: space-between; }
  .entete h2 { margin: 0; }
  .bas { display: flex; gap: 0.8rem; margin-top: 0.6rem; align-items: flex-start; }
  .messages { flex: 1; }
  .messages p { margin: 0.2em 0; }
  .croix { display: grid; grid-template-areas: '. h .' 'g b d'; gap: 0.3rem; }
  .croix button { width: 52px; height: 52px; font-size: 1.2rem; }
  .croix button:nth-child(1) { grid-area: h; }
  .croix button:nth-child(2) { grid-area: g; }
  .croix button:nth-child(3) { grid-area: b; }
  .croix button:nth-child(4) { grid-area: d; }
</style>
