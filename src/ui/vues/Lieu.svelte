<script lang="ts">
  /**
   * Un lieu : son décor, ses personnages (on clique sur eux pour leur parler), ses contrats, sa boutique.
   * Un symbole au-dessus d'un personnage signale qu'il a quelque chose d'important à dire :
   * « ! » doré = quête principale, « ! » argenté = quête secondaire, « ? » = quête à rendre.
   */
  import { jeu } from '../jeu.svelte';
  import { conditionHeros, conditionScene, listeHeros, palierCompagnon, rangGuilde, scenesDisponibles } from '../../moteur/partie';
  import { absentsDuGroupe, marqueurPnj, type Marqueur } from '../../moteur/guide';
  import { imageDecor } from '../../rendu/assets';
  import { portraitPersonnage } from '../outils';
  import { peutApprendre } from '../../moteur/fusions';
  import type { Scene } from '../../contenu/schemas';
  import Boutique from './Boutique.svelte';
  import Auberge from './Auberge.svelte';

  let { id, retour }: { id: string; retour: () => void } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const lieu = $derived(c.regions.aubeclaire.lieux.find((l) => l.id === id)!);
  const tous = $derived(listeHeros(etat).map((x) => x.id));
  const pnj = $derived(lieu.pnj.filter((p) => conditionScene(c, etat, p.si, tous)));
  const scenes = $derived(scenesDisponibles(c, etat, id, h.id));
  /** Scènes qui ne passent par aucun personnage présent : on les lance depuis « Sur place ». */
  const scenesSurPlace = $derived(scenes.filter((s) => !s.pnj || !pnj.some((p) => p.id === s.pnj)));
  const contrats = $derived(id === 'guilde' ? Object.values(c.contrats).filter((ct) => conditionHeros(c, etat, ct.disponible_si, h)) : []);
  const rang = $derived(rangGuilde(c, etat.pointsGuilde[h.id] ?? 0));
  const ordre = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
  const nomPnj = (p: string) => c.compagnons[p]?.nom ?? c.pnj[p]?.nom ?? p;
  const grimoire = $derived(id === 'guilde' ? Object.values(etat.grimoire ?? {}) : []);
  const absents = $derived(absentsDuGroupe(etat));

  let pnjChoisi = $state<string | null>(null);
  $effect(() => { void id; pnjChoisi = null; });
  const scenesPnj = $derived(pnjChoisi ? scenes.filter((s) => s.pnj === pnjChoisi) : []);
  const symbole = (m: Marqueur | null) => (m === 'rendre' ? '?' : m ? '!' : '');
  const titreSymbole = (m: Marqueur | null) => (m === 'principale' ? 'Quête principale' : m === 'rendre' ? 'Quête à rendre' : m ? 'Quête secondaire' : '');
  function lancer(s: Scene) { jeu.agir({ type: 'lancer_scene', scene: s.id }); }
  const etiquetteScene = (s: Scene) => (s.rend_quete ? 'Quête à rendre' : s.quete ? (c.quetes[s.quete].type === 'principale' ? 'Quête principale' : 'Quête secondaire') : '');
</script>

{#snippet boutonScene(s: Scene, verbe: string)}
  <div class="item">
    <div class="ligne entre">
      <span>{s.titre}{#if etiquetteScene(s)} <span class="badge or">{etiquetteScene(s)}</span>{/if}</span>
      <button class="principal" onclick={() => lancer(s)}>{verbe}</button>
    </div>
    {#if s.type === 'groupe'}
      <p class="discret">Scène de groupe : tous les héros y participent et les choix sont votés.
        {#if absents.length}<br /><strong class="alerte">Il manque : {absents.join(' ; ')}.</strong> Attendez-les, ou lancez la scène sans eux.{/if}</p>
    {:else}
      <p class="discret">Scène pour {h.nom} seul.</p>
    {/if}
  </div>
{/snippet}

<section class="lieu">
  <div class="decor pixel" style={`background-image:url(${imageDecor(lieu.decor, lieu.nom)})`}>
    <button class="petit retour" onclick={retour}>← {lieu.ville ? 'Plan de la ville' : 'Carte'}</button>
    {#each pnj.filter((p) => p.position) as p (p.id)}
      {@const m = marqueurPnj(c, etat, id, p.id, h.id)}
      <button class={`silhouette ${m ?? ''}`} style={`left:${(p.position!.x / 1280) * 100}%; top:${(p.position!.y / 720) * 100}%`} title={`Parler à ${nomPnj(p.id)}`} aria-label={`Parler à ${nomPnj(p.id)}${m ? ` (${titreSymbole(m)})` : ''}`} onclick={() => (pnjChoisi = p.id)}>
        {#if m}<span class="symbole">{symbole(m)}</span>{/if}
        <span class="zone"></span>
      </button>
    {/each}
    <h2>{lieu.nom}</h2>
  </div>
  <p>{lieu.description}</p>

  {#if pnj.length}
    <p class="discret">Cliquez sur un personnage pour lui parler.</p>
    <div class="pnj">
      {#each pnj as p (p.id)}
        {@const m = marqueurPnj(c, etat, id, p.id, h.id)}
        <button class={`perso ${m ?? ''}`} class:choisi={pnjChoisi === p.id} title={titreSymbole(m)} onclick={() => (pnjChoisi = pnjChoisi === p.id ? null : p.id)}>
          {#if m}<span class="symbole" aria-label={titreSymbole(m)}>{symbole(m)}</span>{/if}
          <img class="pixel" src={portraitPersonnage(c, p.id)} alt="" />
          <span class="legende">{nomPnj(p.id)}</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if pnjChoisi}
    <div class="carte-ui discussion">
      <div class="ligne entre"><h3>{nomPnj(pnjChoisi)}</h3><button class="petit" onclick={() => (pnjChoisi = null)}>Fermer ✕</button></div>
      <p class="discret">{c.pnj[pnjChoisi]?.titre ?? c.compagnons[pnjChoisi]?.titre ?? ''}{#if c.pnj[pnjChoisi]?.description} — {c.pnj[pnjChoisi].description}{/if}</p>
      {#each scenesPnj as s (s.id)}
        {@render boutonScene(s, 'Lui parler')}
      {:else}
        <p>{nomPnj(pnjChoisi)} n'a rien de particulier à vous dire pour le moment.</p>
        {#if c.compagnons[pnjChoisi] && etat.compagnonsRencontres.includes(pnjChoisi)}
          <p class="discret">Palier : {palierCompagnon(c, etat, h.id, pnjChoisi).nom}. Offrez-lui un cadeau depuis l'onglet « Compagnons ».</p>
        {/if}
      {/each}
    </div>
  {/if}

  <div class="grille colonnes">
    {#if scenesSurPlace.length}
      <div class="carte-ui">
        <h3>Sur place</h3>
        {#each scenesSurPlace as s (s.id)}{@render boutonScene(s, s.type === 'groupe' ? 'Y aller ensemble' : 'Y aller')}{/each}
      </div>
    {/if}
    {#if contrats.length}
      <div class="carte-ui">
        <h3>Tableau des contrats <span class="badge">votre rang : {rang}</span></h3>
        {#each contrats as ct (ct.id)}
          <div class="item">
            <div class="ligne"><strong>{ct.titre}</strong><span class="badge">rang {ct.rang_min}</span></div>
            <p class="discret">{ct.description} Récompense : {ct.recompenses.or} or, {ct.recompenses.xp} XP, {ct.recompenses.points_guilde} pts de guilde.</p>
            <button disabled={ordre.indexOf(rang) < ordre.indexOf(ct.rang_min)} onclick={() => jeu.agir({ type: 'contrat', contrat: ct.id })}>Accepter (en solo)</button>
          </div>
        {/each}
      </div>
    {/if}
    {#if id === 'guilde'}
      <div class="carte-ui">
        <h3>📖 Grimoire de la partie</h3>
        {#each grimoire as t (t.id)}
          {@const pb = peutApprendre(c, h, t)}
          <div class="item">
            <div class="ligne"><strong>{t.nom}</strong><span class="badge">inventée par {t.creePar}</span></div>
            <p class="discret">{t.description} {t.cout} mana, recharge {t.recharge} tour(s).</p>
            {#if (h.variantes[t.parent] ?? []).includes(t.id)}<span class="badge or">connue</span>
            {:else}<button class="petit" disabled={!!pb} title={pb ?? ''} onclick={() => jeu.agir({ type: 'apprendre_technique', technique: t.id })}>Apprendre</button>{#if pb}<small class="discret"> {pb}</small>{/if}{/if}
          </div>
        {:else}
          <p class="discret">Encore vide. En combat, combinez deux de vos compétences (« je combine X et Y ») pour inventer une technique : elle sera ajoutée ici pour tout le groupe.</p>
        {/each}
      </div>
    {/if}
    {#if lieu.auberge}<Auberge />{/if}
    {#if lieu.boutique.length}<Boutique lieu={id} objets={lieu.boutique} />{/if}
  </div>
  {#if !scenes.length && !contrats.length && !lieu.boutique.length && !pnj.length}
    <p class="discret">Rien de particulier à faire ici pour le moment.</p>
  {/if}
</section>

<style>
  .decor { position: relative; aspect-ratio: 16 / 9; max-height: 420px; width: 100%; background-size: 100% 100%; background-position: center; border-radius: var(--rayon); border: 1px solid var(--bord); display: flex; align-items: flex-end; padding: 0.8rem; overflow: hidden; }
  .decor h2 { margin: 0; text-shadow: 0 2px 6px #000; position: relative; }
  .retour { position: absolute; top: 0.6rem; left: 0.6rem; z-index: 2; }
  .silhouette { position: absolute; transform: translate(-50%, -50%); background: none; border: none; padding: 0; display: flex; flex-direction: column; align-items: center; }
  .silhouette .zone { width: clamp(44px, 9vw, 96px); height: clamp(70px, 15vw, 160px); border-radius: 40% 40% 12px 12px; border: 2px dashed transparent; }
  .silhouette:hover .zone, .silhouette:focus-visible .zone { border-color: var(--or-2); background: #ffd16622; }
  .pnj { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
  .perso { position: relative; width: 96px; padding: 0.35rem; display: grid; justify-items: center; gap: 0.2rem; background: var(--fond-2); }
  .perso.choisi { border-color: var(--or); background: #2a2238; }
  .perso img { width: 72px; height: 72px; border-radius: 8px; border: 1px solid var(--bord); object-fit: cover; }
  .legende { font-size: 0.8rem; color: var(--texte-2); line-height: 1.15; }
  .symbole { font-weight: 900; font-size: 1.5rem; line-height: 1; text-shadow: 0 0 3px #000, 0 0 3px #000; animation: saut 1.2s infinite; }
  .perso .symbole { position: absolute; top: -0.7rem; left: 50%; margin-left: -0.3em; }
  .principale .symbole { color: var(--or-2); }
  .secondaire .symbole { color: #d5dbe6; }
  .rendre .symbole { color: #9fd3ff; }
  .discussion { border-color: var(--or); margin-bottom: 0.8rem; }
  .discussion h3 { margin: 0; }
  .entre { justify-content: space-between; }
  .alerte { color: #ffb4a8; }
  .colonnes { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .item { padding: 0.4rem 0; border-bottom: 1px solid var(--bord); }
  .item:last-of-type { border-bottom: none; }
  .item p { margin: 0.2em 0; }
  @keyframes saut { 50% { transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) { .symbole { animation: none; } }
</style>
