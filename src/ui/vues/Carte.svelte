<script lang="ts">
  /**
   * Carte du monde, puis plan d'une ville : une ville n'a qu'un seul point sur la carte ;
   * un clic dessus ouvre son plan, où l'on choisit le lieu.
   */
  import { jeu } from '../jeu.svelte';
  import { conditionScene, listeHeros } from '../../moteur/partie';
  import { imageCarte, imagePlan, positionsImage } from '../../rendu/assets';
  import { lieuAvecCombat, marqueurLieu, prochaineEtape, type Marqueur } from '../../moteur/guide';

  let { choisir, ville = $bindable(null) }: { choisir: (id: string) => void; ville?: string | null } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const region = c.regions.aubeclaire;
  const tous = $derived(listeHeros(etat).map((h) => h.id));
  const moi = $derived(jeu.monHeros?.id ?? null);
  const lieux = $derived(region.lieux.filter((l) => conditionScene(c, etat, l.disponible_si, tous)));
  const horsVille = $derived(lieux.filter((l) => !l.ville));
  const villes = $derived(region.villes.filter((v) => lieux.some((l) => l.ville === v.id)));
  const villeOuverte = $derived(ville ? region.villes.find((v) => v.id === ville) ?? null : null);
  const lieuxVille = $derived(villeOuverte ? lieux.filter((l) => l.ville === villeOuverte.id) : []);
  const positions = $derived(villeOuverte ? positionsImage(`cartes/${villeOuverte.plan}`) : null);
  const etape = $derived(prochaineEtape(c, etat, moi));

  const symbole = (m: Marqueur | null) => (m === 'rendre' ? '?' : m ? '!' : '');
  const ordre: (Marqueur | null)[] = [null, 'secondaire', 'rendre', 'principale'];
  /** Symbole d'une ville : le plus important de ceux de ses lieux. */
  function marqueurVille(id: string): Marqueur | null {
    let res: Marqueur | null = null;
    for (const l of lieux.filter((x) => x.ville === id)) {
      const m = marqueurLieu(c, etat, l.id, moi);
      if (ordre.indexOf(m) > ordre.indexOf(res)) res = m;
    }
    return res;
  }
  const combatVille = (id: string) => lieux.some((l) => l.ville === id && lieuAvecCombat(c, etat, l.id, moi));
  function positionPlan(l: (typeof lieux)[number], i: number) {
    const p = positions?.[l.id] ?? l.position_plan ?? { x: 200 + (i % 4) * 290, y: 200 + Math.floor(i / 4) * 200 };
    return `left:${(p.x / 1280) * 100}%; top:${(p.y / 720) * 100}%`;
  }
  function allerEtape() {
    if (!etape?.lieu) return;
    choisir(etape.lieu);
  }
</script>

<section>
  <h2>{villeOuverte ? villeOuverte.nom : region.nom}</h2>
  {#if etape}
    <div class="etape carte-ui">
      <span>➤ <strong>Prochaine étape :</strong> {etape.objectif}{#if etape.nomLieu && !etape.objectif.includes(etape.nomLieu)}{' '}<span class="discret">({etape.nomLieu})</span>{/if}</span>
      {#if etape.lieu && etape.disponible && lieux.some((l) => l.id === etape.lieu)}
        <button class="principal petit" onclick={allerEtape}>Y aller</button>
      {:else if !etape.disponible}
        <small class="discret">Pas encore possible : suivez les autres pistes en attendant.</small>
      {/if}
    </div>
  {/if}

  {#if villeOuverte}
    <p class="ligne"><button onclick={() => (ville = null)}>← Retour à la carte</button> <span class="discret">{villeOuverte.description}</span></p>
    <div class="carte">
      <img class="pixel" src={imagePlan(villeOuverte.plan, villeOuverte.nom)} alt={`Plan : ${villeOuverte.nom}`} />
      {#each lieuxVille as l, i (l.id)}
        {@const m = marqueurLieu(c, etat, l.id, moi)}
        <button class={`lieu ${m ?? ''}`} style={positionPlan(l, i)} onclick={() => choisir(l.id)}>
          {#if m}<span class="symbole">{symbole(m)}</span>{/if}
          <span class="point"></span>
          <span class="nom">{#if lieuAvecCombat(c, etat, l.id, moi)}<span class="epee" title="Combat possible ici">⚔ </span>{/if}{l.nom}</span>
        </button>
      {/each}
    </div>
  {:else}
    <div class="carte">
      <img class="pixel" src={imageCarte(region.carte)} alt={`Carte : ${region.nom}`} />
      {#each villes as v (v.id)}
        {@const m = marqueurVille(v.id)}
        <button class={`lieu ville ${m ?? ''}`} style={`left:${(v.position.x / 1920) * 100}%; top:${(v.position.y / 1080) * 100}%`} onclick={() => (ville = v.id)}>
          {#if m}<span class="symbole">{symbole(m)}</span>{/if}
          <span class="point"></span>
          <span class="nom">{#if combatVille(v.id)}<span class="epee" title="Combat possible dans la ville">⚔ </span>{/if}{v.nom}</span>
        </button>
      {/each}
      {#each horsVille as l (l.id)}
        {@const m = marqueurLieu(c, etat, l.id, moi)}
        <button class={`lieu ${m ?? ''}`} style={`left:${(l.position.x / 1920) * 100}%; top:${(l.position.y / 1080) * 100}%`} onclick={() => choisir(l.id)}>
          {#if m}<span class="symbole">{symbole(m)}</span>{/if}
          <span class="point"></span>
          <span class="nom">{#if lieuAvecCombat(c, etat, l.id, moi)}<span class="epee" title="Combat possible ici">⚔ </span>{/if}{l.nom}</span>
        </button>
      {/each}
    </div>
  {/if}
  <p class="discret">Cliquez sur un lieu. <span class="leg principale">!</span> quête principale · <span class="leg secondaire">!</span> quête secondaire · <span class="leg rendre">?</span> quête à rendre · ⚔ combat possible.</p>
</section>

<style>
  .etape { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.6rem; border-color: var(--or); }
  .epee { color: #ff9b8a; }
  .carte { position: relative; border-radius: var(--rayon); overflow: hidden; border: 1px solid var(--bord); }
  .carte img { display: block; width: 100%; height: auto; }
  .lieu { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: none; padding: 0; }
  .point { width: 18px; height: 18px; border-radius: 50%; background: #e8dcc0; border: 3px solid #3b2a10; box-shadow: 0 0 0 2px #0006; }
  .ville .point { width: 26px; height: 26px; border-radius: 6px; }
  .nom { font-size: clamp(0.65rem, 1.4vw, 0.9rem); background: #1b1308d9; color: #f3ead7; padding: 0.05em 0.45em; border-radius: 4px; white-space: nowrap; }
  .lieu:hover .nom { background: #3b2a10; }
  .symbole { font-weight: 900; font-size: clamp(1rem, 2.2vw, 1.5rem); line-height: 1; text-shadow: 0 0 3px #000, 0 0 3px #000; animation: saut 1.2s infinite; }
  .principale .symbole, .leg.principale { color: var(--or-2); }
  .secondaire .symbole, .leg.secondaire { color: #d5dbe6; }
  .rendre .symbole, .leg.rendre { color: #9fd3ff; }
  .leg { font-weight: 900; }
  .principale .point { background: var(--or-2); animation: pulse 1.4s infinite; }
  .secondaire .point { background: #d5dbe6; }
  .rendre .point { background: #9fd3ff; }
  @keyframes pulse { 50% { box-shadow: 0 0 0 8px #ffd16633; } }
  @keyframes saut { 50% { transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) { .symbole, .principale .point { animation: none; } }
</style>
