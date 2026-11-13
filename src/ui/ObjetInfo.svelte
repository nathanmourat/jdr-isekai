<script lang="ts">
  /** Nom, icône et détails d'un objet : rareté (couleur), niveau requis, classes autorisées, effets et pouvoir unique. */
  import { jeu } from './jeu.svelte';
  import { COULEURS_RARETE, NOMS_RARETE, problemeEquipement, texteEffets } from '../moteur/equipement';
  import { urlAsset } from '../rendu/assets';

  let { id, nombre }: { id: string; nombre?: number } = $props();
  const c = jeu.contenu!;
  const o = $derived(c.objets[id]);
  const h = $derived(jeu.monHeros);
  const couleur = $derived(o.rarete ? COULEURS_RARETE[o.rarete] : undefined);
  const icone = $derived(urlAsset(`icones/objets/${id}`));
  const probleme = $derived(h && o.type === 'equipement' ? problemeEquipement(c, h, o) : undefined);
  const effets = $derived(o.type === 'equipement' ? texteEffets(o) : []);
</script>

<span class="objet">
  {#if icone}<img class="pixel icone" src={icone} alt="" />{/if}
  <span class="texte">
    <strong style:color={couleur}>{o.nom}</strong>{#if nombre !== undefined} × {nombre}{/if}
    {#if o.rarete}<span class="badge" style:border-color={couleur} style:color={couleur}>{NOMS_RARETE[o.rarete]}</span>{/if}
    {#if o.niveau !== undefined && o.niveau > 1}<span class="badge" class:refus={h && h.niveau < o.niveau}>niv. {o.niveau}</span>{/if}
    {#if o.classes?.length}<small class="discret" class:refus={probleme?.startsWith('Réservé')}> · {o.classes.map((k) => c.classes[k]?.nom ?? k).join(', ')}</small>{/if}
    {#if effets.length}<br /><small class="effets">{effets.join(' · ')}</small>{/if}
    {#if o.pouvoir_unique}<br /><small class="pouvoir">✦ {o.pouvoir_unique}</small>{/if}
    <br /><small class="discret">{o.description}</small>
  </span>
</span>

<style>
  .objet { display: flex; gap: 0.5rem; align-items: flex-start; min-width: 0; }
  .icone { width: 32px; height: 32px; flex: none; image-rendering: pixelated; }
  .texte { min-width: 0; }
  .effets { color: var(--texte); }
  .pouvoir { color: #f2b53a; font-style: italic; }
  .refus { color: #e0605a; border-color: #e0605a; }
</style>
