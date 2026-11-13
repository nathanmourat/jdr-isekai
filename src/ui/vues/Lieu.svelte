<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { conditionHeros, conditionScene, listeHeros, palierCompagnon, prixAchat, rangGuilde, scenesDisponibles } from '../../moteur/partie';
  import { imageDecor } from '../../rendu/assets';
  import { portraitPersonnage } from '../outils';

  let { id, retour }: { id: string; retour: () => void } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const lieu = $derived(c.regions.aubeclaire.lieux.find((l) => l.id === id)!);
  const tous = $derived(listeHeros(etat).map((x) => x.id));
  const pnj = $derived(lieu.pnj.filter((p) => conditionScene(c, etat, p.si, tous)));
  const scenesGroupe = $derived(scenesDisponibles(c, etat, id, h.id).filter((s) => s.type === 'groupe'));
  const scenesPerso = $derived(scenesDisponibles(c, etat, id, h.id).filter((s) => s.type === 'individuel'));
  const contrats = $derived(id === 'guilde' ? Object.values(c.contrats).filter((ct) => conditionHeros(c, etat, ct.disponible_si, h)) : []);
  const rang = $derived(rangGuilde(c, etat.pointsGuilde[h.id] ?? 0));
  const ordre = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
  const nomPnj = (p: string) => c.compagnons[p]?.nom ?? c.pnj[p]?.nom ?? p;
</script>

<section class="lieu">
  <div class="decor pixel" style={`background-image:url(${imageDecor(lieu.decor, lieu.nom)})`}>
    <button class="petit retour" onclick={retour}>← Carte</button>
    <h2>{lieu.nom}</h2>
  </div>
  <p>{lieu.description}</p>

  {#if pnj.length}
    <div class="pnj">
      {#each pnj as p (p.id)}
        <figure><img class="pixel" src={portraitPersonnage(c, p.id)} alt="" /><figcaption>{nomPnj(p.id)}</figcaption></figure>
      {/each}
    </div>
  {/if}

  <div class="grille colonnes">
    {#if scenesGroupe.length}
      <div class="carte-ui">
        <h3>Avec le groupe</h3>
        {#each scenesGroupe as s (s.id)}
          <div class="ligne item">
            <span>{s.titre}{#if s.quete}<span class="badge or">{c.quetes[s.quete].type === 'principale' ? 'Quête principale' : 'Quête'}</span>{/if}</span>
            <button class="principal" onclick={() => jeu.agir({ type: 'lancer_scene', scene: s.id })}>Lancer</button>
          </div>
        {/each}
        <p class="discret">Une scène de groupe implique tous les héros : les choix sont votés.</p>
      </div>
    {/if}
    {#if scenesPerso.length}
      <div class="carte-ui">
        <h3>Pour {h.nom} seul</h3>
        {#each scenesPerso as s (s.id)}
          <div class="ligne item"><span>{s.titre}</span><button onclick={() => jeu.agir({ type: 'lancer_scene', scene: s.id })}>Y aller</button></div>
        {/each}
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
    {#if lieu.boutique.length}
      <div class="carte-ui">
        <h3>Boutique <span class="badge or">{h.or} or</span></h3>
        {#each lieu.boutique as o (o)}
          <div class="ligne item">
            <span title={c.objets[o].description}>{c.objets[o].nom} <small class="discret">{c.objets[o].description}</small></span>
            <button class="petit" disabled={h.or < prixAchat(c, h, o)} onclick={() => jeu.agir({ type: 'acheter', objet: o, lieu: id })}>{prixAchat(c, h, o)} or</button>
          </div>
        {/each}
      </div>
    {/if}
    {#each pnj.filter((p) => c.compagnons[p.id] && etat.compagnonsRencontres.includes(p.id)) as p (p.id)}
      <div class="carte-ui">
        <h3>{c.compagnons[p.id].nom}</h3>
        <p class="discret">Palier : {palierCompagnon(c, etat, h.id, p.id).nom}. Offrez-lui un cadeau depuis l'onglet « Compagnons ».</p>
      </div>
    {/each}
  </div>
  {#if !scenesGroupe.length && !scenesPerso.length && !contrats.length && !lieu.boutique.length}
    <p class="discret">Rien de particulier à faire ici pour le moment.</p>
  {/if}
</section>

<style>
  .decor { position: relative; height: clamp(160px, 32vw, 340px); background-size: cover; background-position: center; border-radius: var(--rayon); border: 1px solid var(--bord); display: flex; align-items: flex-end; padding: 0.8rem; }
  .decor h2 { margin: 0; text-shadow: 0 2px 6px #000; }
  .retour { position: absolute; top: 0.6rem; left: 0.6rem; }
  .pnj { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
  .pnj figure { margin: 0; text-align: center; width: 84px; }
  .pnj img { width: 72px; height: 72px; border-radius: 8px; border: 1px solid var(--bord); object-fit: cover; }
  .pnj figcaption { font-size: 0.8rem; color: var(--texte-2); }
  .colonnes { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .item { justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--bord); }
  .item:last-of-type { border-bottom: none; }
  .item p { margin: 0.2em 0; }
</style>
