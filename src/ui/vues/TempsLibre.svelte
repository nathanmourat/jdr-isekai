<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { conditionHeros, listeHeros } from '../../moteur/partie';
  import { formaterDate } from '../../moteur/temps';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const tl = $derived(etat.tempsLibre!);
  const h = $derived(jeu.monHeros!);
  const nb = $derived(c.config.ellipses.activites_temps_libre + (h.don === 'croissance-acceleree' ? 1 : 0));
  const activites = $derived(Object.values(c.activites).filter((a) => conditionHeros(c, etat, a.disponible_si, h)));
  let choix = $state<{ activite: string; compagnon?: string }[]>([]);
  const dejaChoisi = $derived(!!tl.choix[h.id]);
  const attente = $derived(listeHeros(etat).filter((x) => !tl.choix[x.id]).map((x) => x.nom));

  function ajouter(id: string) {
    if (choix.length >= nb) return;
    choix = [...choix, { activite: id, compagnon: c.activites[id].choix_compagnon ? etat.compagnonsRencontres[0] : undefined }];
  }
</script>

<section class="carte-ui">
  <h2>Temps libre — {tl.titre}</h2>
  <p>{tl.mois} mois vont passer, jusqu'au {formaterDate(c, tl.jusqua)}. Chaque joueur choisit {c.config.ellipses.activites_temps_libre} activités ; les gains sont proportionnels à la durée.</p>

  {#if tl.resultats}
    <h3>Ce qui s'est passé</h3>
    {#each listeHeros(etat) as x (x.id)}
      <p><strong>{x.nom}</strong></p>
      <ul>{#each tl.resultats[x.id] ?? [] as r, i (i)}<li>{r}</li>{/each}</ul>
    {/each}
    <button class="principal" onclick={() => jeu.agir({ type: 'valider_temps_libre' })}>Reprendre l'aventure</button>
  {:else if dejaChoisi}
    <p class="succes">Vos activités sont choisies. En attente de : {attente.join(', ')}.</p>
    {#if etat.meneur && jeu.joueursLocaux.includes(etat.meneur)}
      <button onclick={() => jeu.agir({ type: 'valider_temps_libre', joueur: etat.meneur! })}>Valider pour les absents (Repos + Contrats de guilde)</button>
    {/if}
  {:else}
    <h3>Activités de {h.nom} ({choix.length}/{nb})</h3>
    <div class="activites">
      {#each activites as a (a.id)}
        <button class="activite" disabled={choix.length >= nb || (a.choix_compagnon && !etat.compagnonsRencontres.length)} onclick={() => ajouter(a.id)}>
          <strong>{a.nom}</strong><span class="discret">{a.description}</span>
        </button>
      {/each}
    </div>
    {#if choix.length}
      <ol class="choisies">
        {#each choix as ch, i (i)}
          <li>
            {c.activites[ch.activite].nom}
            {#if c.activites[ch.activite].choix_compagnon}
              avec <select bind:value={ch.compagnon}>{#each etat.compagnonsRencontres as co (co)}<option value={co}>{c.compagnons[co].nom}</option>{/each}</select>
            {/if}
            <button class="petit" onclick={() => (choix = choix.filter((_, k) => k !== i))}>Retirer</button>
          </li>
        {/each}
      </ol>
    {/if}
    <button class="principal" disabled={choix.length !== nb} onclick={() => jeu.agir({ type: 'temps_libre', activites: choix })}>Valider mes activités</button>
  {/if}
</section>

<style>
  .activites { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); margin-bottom: 0.8rem; }
  .activite { display: grid; text-align: left; gap: 0.2rem; }
  .choisies li { margin-bottom: 0.3rem; }
  .choisies select { width: auto; }
</style>
