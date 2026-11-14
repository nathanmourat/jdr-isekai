<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { affinite, goutConnu, palierCompagnon } from '../../moteur/partie';
  import { portraitPersonnage } from '../outils';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const cadeaux = $derived(Object.entries(h.inventaire).filter(([o, n]) => n > 0 && c.objets[o].type === 'cadeau'));
  const paliers = c.config.affinite.paliers;
  /** Goûts déjà découverts (en lui offrant ce cadeau, ou en discutant). */
  const REACTIONS = { prefere: 'adore', apprecie: 'aime bien', neutre: 'sans plus', deteste: 'déteste' } as const;
</script>

<section class="grille">
  {#each etat.compagnonsRencontres as id (id)}
    {@const co = c.compagnons[id]}
    {@const a = affinite(etat, h.id, id)}
    {@const p = palierCompagnon(c, etat, h.id, id)}
    <article class="carte-ui compagnon">
      <img class="pixel" src={portraitPersonnage(c, id, p.index >= 3 ? 'joie' : 'neutre')} alt={`Portrait de ${co.nom}`} />
      <div class="infos">
        <h2>{co.nom}</h2>
        <p class="discret">{co.titre} · {co.age} ans</p>
        <p>{co.personnalite}</p>
        <p><strong>Palier : {p.nom}</strong> ({a.points}/100){#if a.blocage} <span class="badge">{a.blocage === 'definitive' ? 'relation brisée' : 'blessée — il faudra se faire pardonner'}</span>{/if}</p>
        <div class="paliers">
          {#each paliers as pl, i (pl.id)}<span class:atteint={i <= p.index} title={`${pl.nom} : ${pl.seuil}`}>{pl.nom}</span>{/each}
        </div>
        <div class="barre"><div style={`width:${a.points}%; background: var(--violet)`}></div></div>
        <h3>Bonus en combat</h3>
        <ul>
          {#each Object.entries(co.bonus_paliers) as [pal, b] (pal)}
            <li class:inactif={paliers.findIndex((x) => x.id === pal) > p.index}>{paliers.find((x) => x.id === pal)?.nom} — <strong>{b.nom}</strong> : {b.description}</li>
          {/each}
        </ul>
        <div class="ligne">
          {#if etat.equipe[h.id] === id}
            <span class="badge or">Vous accompagne</span><button class="petit" onclick={() => jeu.agir({ type: 'equipe', compagnon: null })}>Laisser au camp</button>
          {:else}
            <button class="petit" disabled={p.index < 1} title={p.index < 1 ? 'Palier « Alliée » requis' : ''} onclick={() => jeu.agir({ type: 'equipe', compagnon: id })}>L'emmener en combat</button>
          {/if}
        </div>
        <h3>Offrir un cadeau</h3>
        {#if cadeaux.length}
          <div class="ligne">
            {#each cadeaux as [o, n] (o)}
              <button class="petit" onclick={() => jeu.agir({ type: 'cadeau', compagnon: id, objet: o })}>{c.objets[o].nom} ×{n}{#if goutConnu(c, etat, id, o)} <small class="gout">({REACTIONS[goutConnu(c, etat, id, o)!]})</small>{/if}</button>
            {/each}
          </div>
        <p class="discret">Ses goûts se découvrent en lui offrant des cadeaux : la réaction reste ensuite notée ici.</p>
        {:else}<p class="discret">Vous n'avez aucun cadeau. On en trouve dans les boutiques de Lysmont.</p>{/if}
      </div>
    </article>
  {:else}
    <p class="discret">Vous n'avez encore rencontré personne… L'aventure commence au Temple du Seuil.</p>
  {/each}
</section>

<style>
  .compagnon { display: flex; gap: 1rem; flex-wrap: wrap; }
  .gout { color: #ff9bb8; }
  .compagnon img { width: 160px; height: 160px; border-radius: 10px; border: 2px solid var(--violet); object-fit: cover; object-position: top; }
  .infos { flex: 1 1 300px; }
  .infos p { margin: 0.25em 0; }
  .paliers { display: flex; gap: 0.3rem; flex-wrap: wrap; margin: 0.4rem 0; }
  .paliers span { font-size: 0.78rem; padding: 0.1em 0.5em; border-radius: 99px; border: 1px solid var(--bord); color: var(--texte-2); }
  .paliers .atteint { border-color: var(--violet); color: #e6d8ff; background: #2e2248; }
  .inactif { opacity: 0.5; }
  ul { padding-left: 1.2rem; margin: 0.3rem 0; }
</style>
