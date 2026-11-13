<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { conditionScene, listeHeros, scenesDisponibles } from '../../moteur/partie';
  import { imageCarte } from '../../rendu/assets';

  let { choisir }: { choisir: (id: string) => void } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const region = c.regions.aubeclaire;
  const tous = $derived(listeHeros(etat).map((h) => h.id));
  const lieux = $derived(region.lieux.filter((l) => conditionScene(c, etat, l.disponible_si, tous)));
  /** Un lieu « important » a une scène de la quête principale disponible. */
  function marque(id: string) {
    const s = scenesDisponibles(c, etat, id, jeu.monHeros?.id ?? null);
    if (s.some((x) => x.quete && c.quetes[x.quete]?.type === 'principale')) return 'principale';
    if (s.length) return 'secondaire';
    return '';
  }
</script>

<section>
  <h2>{region.nom}</h2>
  <div class="carte">
    <img class="pixel" src={imageCarte(region.carte)} alt={`Carte : ${region.nom}`} />
    {#each lieux as l (l.id)}
      <button class={`lieu ${marque(l.id)}`} style={`left:${(l.position.x / 1920) * 100}%; top:${(l.position.y / 1080) * 100}%`} onclick={() => choisir(l.id)}>
        <span class="point"></span><span class="nom">{l.nom}</span>
      </button>
    {/each}
  </div>
  <p class="discret">Cliquez sur un lieu. <span class="leg principale">●</span> quête principale · <span class="leg secondaire">●</span> autre chose à faire.</p>
</section>

<style>
  .carte { position: relative; border-radius: var(--rayon); overflow: hidden; border: 1px solid var(--bord); }
  .carte img { display: block; width: 100%; height: auto; }
  .lieu { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: none; padding: 0; }
  .point { width: 18px; height: 18px; border-radius: 50%; background: #e8dcc0; border: 3px solid #3b2a10; box-shadow: 0 0 0 2px #0006; }
  .nom { font-size: clamp(0.65rem, 1.4vw, 0.9rem); background: #1b1308d9; color: #f3ead7; padding: 0.05em 0.45em; border-radius: 4px; white-space: nowrap; }
  .lieu:hover .nom { background: #3b2a10; }
  .principale .point { background: var(--or-2); animation: pulse 1.4s infinite; }
  .secondaire .point { background: #9fd3ff; }
  .leg.principale { color: var(--or-2); }
  .leg.secondaire { color: #9fd3ff; }
  @keyframes pulse { 50% { box-shadow: 0 0 0 8px #ffd16633; } }
</style>
