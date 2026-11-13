<script lang="ts">
  /** Boutique d'un lieu : acheter et vendre, avec quantité et confirmation. */
  import { jeu } from '../jeu.svelte';
  import { prixAchat, prixVente } from '../../moteur/partie';
  import NomObjet from '../NomObjet.svelte';

  let { lieu, objets }: { lieu: string; objets: string[] } = $props();
  const c = jeu.contenu!;
  const h = $derived(jeu.monHeros!);
  let onglet = $state<'acheter' | 'vendre'>('acheter');
  let choix = $state<{ objet: string; sens: 'acheter' | 'vendre' } | null>(null);
  let quantite = $state(1);

  const aVendre = $derived(Object.entries(h.inventaire).filter(([o, n]) => n > 0 && c.objets[o] && c.objets[o].type !== 'quete').map(([o, n]) => ({ o, n })));
  const prixUnitaire = $derived(choix ? (choix.sens === 'acheter' ? prixAchat(c, h, choix.objet) : prixVente(c, h, choix.objet)) : 0);
  const maximum = $derived.by(() => {
    if (!choix) return 1;
    if (choix.sens === 'vendre') return h.inventaire[choix.objet] ?? 0;
    return Math.max(1, Math.min(99, Math.floor(h.or / Math.max(1, prixUnitaire))));
  });
  const total = $derived(prixUnitaire * quantite);
  const possible = $derived(!!choix && quantite >= 1 && quantite <= maximum && (choix.sens === 'vendre' || total <= h.or));

  function ouvrir(objet: string, sens: 'acheter' | 'vendre') { choix = { objet, sens }; quantite = 1; }
  async function confirmer() {
    if (!choix || !possible) return;
    const ok = choix.sens === 'acheter'
      ? await jeu.agir({ type: 'acheter', objet: choix.objet, lieu, quantite })
      : await jeu.agir({ type: 'vendre', objet: choix.objet, quantite });
    if (ok) choix = null;
  }
  const types: Record<string, string> = { consommable: 'à utiliser', cadeau: 'cadeau', equipement: 'équipement', quete: 'quête', materiau: 'matériau' };
</script>

<div class="carte-ui boutique">
  <div class="ligne tete">
    <h3>🛒 Boutique</h3>
    <span class="badge or bourse">Votre or : {h.or}</span>
  </div>
  <div class="onglets" role="tablist">
    <button role="tab" aria-selected={onglet === 'acheter'} class:actif={onglet === 'acheter'} onclick={() => { onglet = 'acheter'; choix = null; }}>Acheter</button>
    <button role="tab" aria-selected={onglet === 'vendre'} class:actif={onglet === 'vendre'} onclick={() => { onglet = 'vendre'; choix = null; }}>Vendre</button>
  </div>

  {#if choix}
    {@const o = c.objets[choix.objet]}
    <div class="confirmation" role="dialog" aria-label="Confirmation">
      <p><strong>{choix.sens === 'acheter' ? 'Acheter' : 'Vendre'} : {o.nom}</strong><br /><small class="discret">{o.description}</small></p>
      <div class="ligne">
        <label class="ligne">Quantité
          <button class="petit" disabled={quantite <= 1} onclick={() => (quantite = Math.max(1, quantite - 1))} aria-label="Moins">−</button>
          <input type="number" min="1" max={maximum} bind:value={quantite} />
          <button class="petit" disabled={quantite >= maximum} onclick={() => (quantite = Math.min(maximum, quantite + 1))} aria-label="Plus">+</button>
        </label>
        <span class="discret">({prixUnitaire} or pièce{choix.sens === 'vendre' ? `, vous en avez ${maximum}` : ''})</span>
      </div>
      <p class="total">{choix.sens === 'acheter' ? `Total à payer : ${total} or` : `Vous recevrez : ${total} or`}
        <span class="discret">· il vous restera {choix.sens === 'acheter' ? h.or - total : h.or + total} or</span></p>
      {#if choix.sens === 'acheter' && total > h.or}<p class="erreur">Pas assez d'or.</p>{/if}
      <div class="ligne">
        <button class="principal" disabled={!possible} onclick={confirmer}>Confirmer</button>
        <button onclick={() => (choix = null)}>Annuler</button>
      </div>
    </div>
  {:else if onglet === 'acheter'}
    {#each objets as o (o)}
      {@const prix = prixAchat(c, h, o)}
      <div class="ligne item">
        <span class="nom"><NomObjet id={o} /> <span class="badge">{types[c.objets[o].type]}</span>{#if h.inventaire[o]} <span class="badge">vous en avez {h.inventaire[o]}</span>{/if}</span>
        <button disabled={h.or < prix} title={h.or < prix ? "Pas assez d'or" : ''} onclick={() => ouvrir(o, 'acheter')}>Acheter · {prix} or</button>
      </div>
    {/each}
  {:else}
    {#each aVendre as x (x.o)}
      <div class="ligne item">
        <span class="nom"><NomObjet id={x.o} quantite={x.n} /></span>
        <button onclick={() => ouvrir(x.o, 'vendre')}>Vendre · {prixVente(c, h, x.o)} or</button>
      </div>
    {:else}<p class="discret">Votre sac est vide : rien à vendre.</p>{/each}
    <p class="discret">Les objets se revendent à moitié prix. Les objets de quête ne se vendent pas.</p>
  {/if}
</div>

<style>
  .tete { justify-content: space-between; }
  .tete h3 { margin: 0; }
  .bourse { font-size: 0.95rem; }
  .onglets { display: flex; gap: 0.3rem; margin: 0.6rem 0; }
  .onglets button { flex: 1; }
  .onglets .actif { border-color: var(--or); background: #3b2f18; }
  .item { justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--bord); flex-wrap: nowrap; }
  .item .nom { flex: 1; min-width: 0; }
  .item button { white-space: nowrap; }
  .confirmation { border: 1px solid var(--or); border-radius: 8px; padding: 0.7rem; background: var(--fond); }
  .confirmation input { width: 5em; text-align: center; }
  .total { font-size: 1.05rem; color: var(--or-2); }
</style>
