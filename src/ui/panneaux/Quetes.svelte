<script lang="ts">
  /** Quêtes : pour chacune, l'étape en cours, le prochain lieu et la liste des étapes. Le contrat en cours y figure aussi. */
  import { jeu } from '../jeu.svelte';
  import { etapeContrat } from '../../moteur/partie';
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const quetes = $derived(Object.entries(etat.quetes).map(([id, q]) => ({ def: c.quetes[id], ...q })).sort((a, b) => Number(a.terminee) - Number(b.terminee)));
  const nomLieu = (id?: string) => (id ? Object.values(c.regions).flatMap((r) => r.lieux).find((l) => l.id === id)?.nom ?? id : null);
  const lieuDe = (e?: { lieu?: string; scene?: string }) => nomLieu(e?.lieu ?? (e?.scene ? c.scenes[e.scene]?.lieu : undefined));
  const types: Record<string, string> = { principale: 'Quête principale', secondaire: 'Quête secondaire', classe: 'Quête de classe', compagnon: 'Quête de compagnon', contrat: 'Contrat' };
  const contrat = $derived(jeu.monHeros ? etapeContrat(c, etat, jeu.monHeros.id) : null);
</script>

<section class="grille">
  {#if contrat}
    <article class="carte-ui">
      <div class="ligne"><h3>{contrat.contrat.titre}</h3><span class="badge">Contrat de guilde</span><span class="badge or">étape {contrat.numero}/{contrat.total}</span></div>
      <p class="discret">{contrat.contrat.description}</p>
      <ol class="etapes">
        {#each contrat.contrat.etapes as e, i (i)}
          <li class:faite={i < contrat.numero - 1} class:courante={i === contrat.numero - 1}>
            {#if i === contrat.numero - 1}➤ {/if}{e.objectif}{#if i === contrat.numero - 1} <span class="badge">📍 {nomLieu(e.lieu)}</span>{/if}
          </li>
        {/each}
      </ol>
    </article>
  {/if}
  {#each quetes as q (q.def.id)}
    {@const index = q.def.etapes.findIndex((e) => e.id === q.etape)}
    <article class="carte-ui" class:terminee={q.terminee}>
      <div class="ligne"><h3>{q.def.titre}</h3><span class="badge">{types[q.def.type]}</span>{#if q.terminee}<span class="badge or">terminée</span>{:else if q.def.etapes.length > 1 && index >= 0}<span class="badge or">étape {index + 1}/{q.def.etapes.length}</span>{/if}</div>
      <p class="discret">{q.def.resume}</p>
      {#if !q.terminee}
        <ol class="etapes">
          {#each q.def.etapes as e, i (e.id)}
            {#if i <= index}
              <li class:faite={i < index} class:courante={i === index}>
                {#if i === index}➤ {/if}{e.objectif}{#if i === index && lieuDe(e)} <span class="badge">📍 {lieuDe(e)}</span>{/if}
              </li>
            {/if}
          {/each}
        </ol>
      {/if}
    </article>
  {:else}{#if !contrat}<p class="discret">Aucune quête pour l'instant.</p>{/if}{/each}
</section>

<style>
  .terminee { opacity: 0.6; }
  h3 { margin: 0; }
  .etapes { margin: 0.3rem 0 0; padding-left: 1.3rem; }
  .etapes li { margin: 0.15em 0; }
  .faite { color: var(--texte-2); text-decoration: line-through; }
  .courante { color: var(--or-2); font-weight: 600; }
</style>