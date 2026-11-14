<script lang="ts">
  /**
   * Carte du monde, puis plan d'une ville : une ville n'a qu'un seul point sur la carte ;
   * un clic dessus ouvre son plan, où l'on choisit le lieu.
   */
  import { jeu } from '../jeu.svelte';
  import { conditionScene, listeHeros } from '../../moteur/partie';
  import { formaterDate } from '../../moteur/temps';
  import { imageCarte, imagePlan, positionsImage } from '../../rendu/assets';
  import { aideNiveau, couleurNiveau, lieuAvecCombat, lieuxDesEtapes, marqueurLieu, niveauDuLieu, niveauGroupe, prochaineEtape, trouverLieu, type Marqueur } from '../../moteur/guide';
  import NiveauConseille from '../NiveauConseille.svelte';
  import Cadre169 from '../Cadre169.svelte';

  let { choisir, ville = $bindable(null) }: { choisir: (id: string) => void; ville?: string | null } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const tous = $derived(listeHeros(etat).map((h) => h.id));
  const moi = $derived(jeu.monHeros?.id ?? null);
  /** Lieux où mène une étape en cours (quête ou contrat) : ils clignotent. */
  const etapes = $derived(lieuxDesEtapes(c, etat, moi));
  // ───────────── Régions : une carte par région ; on change de région par les onglets du haut ─────────────
  const regions = $derived(Object.values(c.regions).filter((r) => conditionScene(c, etat, r.disponible_si, tous)).sort((a, b) => a.chapitre - b.chapitre));
  let regionChoisie = $state<string | null>(null);
  /** Région affichée : celle choisie, sinon celle de la prochaine étape, sinon la plus récente. */
  const region = $derived.by(() => {
    if (regionChoisie && regions.some((r) => r.id === regionChoisie)) return c.regions[regionChoisie];
    const e = prochaineEtape(c, etat, moi);
    const r = e?.lieu ? trouverLieu(c, e.lieu)?.region : undefined;
    if (r && regions.some((x) => x.id === r)) return c.regions[r];
    return regions[regions.length - 1] ?? c.regions.aubeclaire;
  });
  function changerRegion(id: string) { regionChoisie = id; ville = null; }
  const lieux = $derived(region.lieux.filter((l) => conditionScene(c, etat, l.disponible_si, tous) && (!l.etape_seulement || etapes.includes(l.id))));
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
  /** Infobulle d'un lieu : son nom, et le niveau conseillé de l'étape qui y mène. */
  function infobulle(id: string, nom: string): string {
    const n = niveauDuLieu(c, etat, id, moi);
    return n === null ? nom : `${nom} — étape en cours. ${aideNiveau(n, niveauGroupe(etat))}`;
  }
  /** Couleur du niveau conseillé de l'étape qui mène à ce lieu ('' s'il n'y en a pas). */
  function couleurLieu(id: string): string {
    const n = niveauDuLieu(c, etat, id, moi);
    return n === null ? '' : `niv-${couleurNiveau(n, niveauGroupe(etat))}`;
  }
  const niveauEtape = $derived(etape?.lieu ? niveauDuLieu(c, etat, etape.lieu, moi) : null);
  function allerEtape() {
    if (!etape?.lieu) return;
    const r = trouverLieu(c, etape.lieu)?.region;
    if (r) regionChoisie = r;
    choisir(etape.lieu);
  }
  /** L'étape mène-t-elle à un lieu ouvert, dans n'importe quelle région ? */
  const etapeAccessible = $derived.by(() => {
    if (!etape?.lieu) return false;
    const t = trouverLieu(c, etape.lieu);
    return !!t && regions.some((r) => r.id === t.region) && conditionScene(c, etat, t.lieu.disponible_si, tous) && (!t.lieu.etape_seulement || etapes.includes(t.lieu.id));
  });
  /** Région qui a une étape en cours (pour signaler l'onglet). */
  const regionAvecEtape = (id: string) => c.regions[id].lieux.some((l) => etapes.includes(l.id));
</script>

<section class="vue-carte">
  <Cadre169>
    {#if villeOuverte}
      <div class="carte">
        <img class="pixel" src={imagePlan(villeOuverte.plan, villeOuverte.nom)} alt={`Plan : ${villeOuverte.nom}`} />
        {#each lieuxVille as l, i (l.id)}
          {@const m = marqueurLieu(c, etat, l.id, moi)}
          <button class={`lieu ${m ?? ''}`} class:etape={etapes.includes(l.id)} data-lieu={l.id} aria-label={l.nom} title={infobulle(l.id, l.nom)} style={positionPlan(l, i)} onclick={() => choisir(l.id)}>
            {#if m}<span class="symbole">{symbole(m)}</span>{/if}
            <span class="point"></span>
            <span class="nom">{#if lieuAvecCombat(c, etat, l.id, moi)}<span class="epee" title="Combat possible ici">⚔ </span>{/if}{l.nom}{#if niveauDuLieu(c, etat, l.id, moi) !== null} <span class={`niv ${couleurLieu(l.id)}`}>niv. {niveauDuLieu(c, etat, l.id, moi)}</span>{/if}</span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="carte">
        <img class="pixel" src={imageCarte(region.carte)} alt={`Carte : ${region.nom}`} />
        {#each villes as v (v.id)}
          {@const m = marqueurVille(v.id)}
          <button class={`lieu ville ${m ?? ''}`} class:etape={lieux.some((l) => l.ville === v.id && etapes.includes(l.id))} data-ville={v.id} aria-label={v.nom} style={`left:${(v.position.x / 1920) * 100}%; top:${(v.position.y / 1080) * 100}%`} onclick={() => (ville = v.id)}>
            {#if m}<span class="symbole">{symbole(m)}</span>{/if}
            <span class="point"></span>
            <span class="nom">{#if combatVille(v.id)}<span class="epee" title="Combat possible dans la ville">⚔ </span>{/if}{v.nom}</span>
          </button>
        {/each}
        {#each horsVille as l (l.id)}
          {@const m = marqueurLieu(c, etat, l.id, moi)}
          <button class={`lieu ${m ?? ''}`} class:etape={etapes.includes(l.id)} data-lieu={l.id} aria-label={l.nom} title={infobulle(l.id, l.nom)} style={`left:${(l.position.x / 1920) * 100}%; top:${(l.position.y / 1080) * 100}%`} onclick={() => choisir(l.id)}>
            {#if m}<span class="symbole">{symbole(m)}</span>{/if}
            <span class="point"></span>
            <span class="nom">{#if lieuAvecCombat(c, etat, l.id, moi)}<span class="epee" title="Combat possible ici">⚔ </span>{/if}{l.nom}{#if niveauDuLieu(c, etat, l.id, moi) !== null} <span class={`niv ${couleurLieu(l.id)}`}>niv. {niveauDuLieu(c, etat, l.id, moi)}</span>{/if}</span>
          </button>
        {/each}
      </div>
    {/if}
  </Cadre169>

  <!-- informations par-dessus l'image : région, retour, prochaine étape -->
  <div class="hud">
    {#if regions.length > 1 && !villeOuverte}
      <div class="onglets-regions" role="tablist" aria-label="Régions">
        {#each regions as r (r.id)}
          <button role="tab" aria-selected={r.id === region.id} class:actif={r.id === region.id} onclick={() => changerRegion(r.id)}>{r.nom}{#if regionAvecEtape(r.id)} <span class="leg principale">●</span>{/if}</button>
        {/each}
      </div>
    {/if}
    <div class="ligne titre-carte">
      {#if villeOuverte}<button class="petit" onclick={() => (ville = null)}>← Retour à la carte</button>{/if}
      <h2>{villeOuverte ? villeOuverte.nom : region.nom}</h2>
    </div>
    {#if etape}
      <div class="bandeau-etape carte-ui">
        <span>➤ <strong>Prochaine étape :</strong> {etape.objectif}{#if etape.nomLieu && !etape.objectif.includes(etape.nomLieu)}{' '}<span class="discret">({etape.nomLieu})</span>{/if}{#if niveauEtape !== null}{' '}<NiveauConseille niveau={niveauEtape} aide />{/if}</span>
        {#if etape.lieu && etape.disponible && etapeAccessible}
          <button class="principal petit" onclick={allerEtape}>Y aller</button>
        {:else if etape.attenteJour !== null}
          <small class="discret">Pas avant : {formaterDate(c, etape.attenteJour)}. Pour faire passer les mois, dormez dans une auberge (le Chaudron Fêlé à Lysmont, ou l'auberge de la région).</small>
          {#if lieux.some((l) => l.auberge)}<button class="petit" onclick={() => choisir(lieux.find((l) => l.auberge)!.id)}>Aller à l'auberge</button>{/if}
        {:else if !etape.disponible}
          <small class="discret">Pas encore possible : suivez les autres pistes en attendant.</small>
        {/if}
      </div>
    {/if}
  </div>
  <details class="legende carte-ui">
    <summary>Légende</summary>
    <p>{#if villeOuverte}{villeOuverte.description} {:else if region.description}{region.description} {/if}Cliquez sur un lieu. <span class="leg principale">!</span> quête principale · <span class="leg secondaire">!</span> quête secondaire · <span class="leg rendre">?</span> quête à rendre · ⚔ combat possible · un point qui clignote = prochaine étape d'une quête ou d'un contrat.</p>
  </details>
</section>
<style>
  .vue-carte { position: absolute; inset: 0; }
  .hud { position: absolute; z-index: 20; top: calc(max(0.3rem, env(safe-area-inset-top)) + 3rem); left: max(0.5rem, env(safe-area-inset-left)); width: min(460px, 44%); display: grid; gap: 0.4rem; pointer-events: none; }
  @media (max-aspect-ratio: 1 / 1) { .hud { width: calc(100% - 1rem); top: calc(max(0.2rem, env(safe-area-inset-top)) + 3.5rem + 56.25vw); } }
  @media (max-height: 500px) { .bandeau-etape { font-size: 0.8rem; padding: 0.3rem 0.5rem; } .titre-carte h2 { font-size: 1rem; } }
  .hud > * { pointer-events: auto; justify-self: start; }
  .titre-carte h2 { margin: 0; text-shadow: 0 2px 6px #000, 0 0 2px #000; }
  .legende { position: absolute; z-index: 20; left: max(0.5rem, env(safe-area-inset-left)); bottom: max(0.5rem, env(safe-area-inset-bottom)); width: min(460px, calc(100% - 1rem)); padding: 0.4rem 0.7rem; background: #1d1928e6; font-size: 0.85rem; }
  .legende summary { cursor: pointer; min-height: 32px; display: flex; align-items: center; }
  .legende p { margin: 0.3rem 0 0; }
  .onglets-regions { display: flex; gap: 0.3rem; flex-wrap: wrap; }
  .onglets-regions button { background: #1d1928e6; }
  .onglets-regions .actif { border-color: var(--or); background: #3b2f18; }
  .bandeau-etape { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; flex-wrap: wrap; border-color: var(--or); padding: 0.5rem 0.7rem; background: #1d1928e6; font-size: 0.92rem; }
  .epee { color: #ff9b8a; }
  .niv { font-weight: 700; }
  .niv-vert { color: var(--vert); }
  .niv-orange { color: #f2a33a; }
  .niv-rouge { color: var(--rouge); }
  .carte { position: absolute; inset: 0; overflow: hidden; }
  .carte img { display: block; width: 100%; height: 100%; }
  /* Zone cliquable FIXE de 44 × 44 px, centrée sur le point par des marges (jamais par transform : le style
     « bouton enfoncé » du site décalait le bouton au moment de l'appui, et le clic tombait à côté).
     Le point, le symbole et le nom sont décoratifs : ils ne captent pas le clic et seuls eux sont animés. */
  .lieu { position: absolute; width: 44px; height: 44px; margin: -22px 0 0 -22px; padding: 0; background: none; border: none; border-radius: 50%; cursor: pointer; }
  .lieu:hover:not(:disabled), .lieu:active:not(:disabled) { transform: none; background: none; }
  .lieu:hover, .lieu:focus-visible { background: #ffd16626; }
  .lieu > span { position: absolute; left: 50%; pointer-events: none; }
  .point { top: 50%; width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%; background: #e8dcc0; border: 3px solid #3b2a10; box-shadow: 0 0 0 2px #0006; z-index: 2; }
  .ville .point { width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 6px; }
  .nom { top: calc(50% + 15px); transform: translateX(-50%); z-index: 1; font-size: clamp(0.65rem, 1.4vw, 0.9rem); background: #1b1308d9; color: #f3ead7; padding: 0.05em 0.45em; border-radius: 4px; white-space: nowrap; }
  .ville .nom { top: calc(50% + 19px); }
  .lieu:hover .nom, .lieu:focus-visible .nom { background: #3b2a10; z-index: 3; }
  .symbole { bottom: calc(50% + 12px); width: 1.2em; margin-left: -0.6em; text-align: center; z-index: 2; font-weight: 900; font-size: clamp(1rem, 2.2vw, 1.5rem); line-height: 1; text-shadow: 0 0 3px #000, 0 0 3px #000; animation: saut 1.2s infinite; }
  .principale .symbole, .leg.principale { color: var(--or-2); }
  .secondaire .symbole, .leg.secondaire { color: #d5dbe6; }
  .rendre .symbole, .leg.rendre { color: #9fd3ff; }
  .leg { font-weight: 900; }
  .principale .point { background: var(--or-2); animation: pulse 1.4s infinite; }
  .secondaire .point { background: #d5dbe6; }
  .rendre .point { background: #9fd3ff; }
  .etape .point { animation: clignote 0.9s infinite; border-color: #fff; }
  .etape .nom { outline: 1px solid var(--or-2); }
  @keyframes clignote { 50% { box-shadow: 0 0 0 9px #ffffff55; } }
  @keyframes pulse { 50% { box-shadow: 0 0 0 8px #ffd16633; } }
  @keyframes saut { 50% { transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) { .symbole, .principale .point, .etape .point { animation: none; } }
</style>
