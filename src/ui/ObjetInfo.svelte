<script lang="ts">
  /**
   * Un objet, en version compacte : icône, nom (couleur de rareté), quantité.
   * Le détail s'affiche dans une infobulle : au survol (après 0,4 s) sur ordinateur, par un appui long
   * ou le petit bouton « i » sur mobile. Rien ne prend de place en permanence.
   * L'infobulle dit à quoi sert l'objet : effet en chiffres, utilité, prix de vente, goûts connus des compagnes.
   * Un objet mystérieux affiche « ??? » tant qu'il n'a pas été acheté ou identifié.
   */
  import { jeu } from './jeu.svelte';
  import { COULEURS_RARETE, messageEquipement, NOMS_RARETE, texteEffets } from '../moteur/equipement';
  import { goutConnu, objetConnu, prixVente } from '../moteur/partie';
  import { urlAsset } from '../rendu/assets';
  import type { Objet } from '../contenu/schemas';

  let { id, nombre }: { id: string; nombre?: number } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const o = $derived(c.objets[id]);
  const h = $derived(jeu.monHeros);
  const connu = $derived(objetConnu(c, etat, id));
  const couleur = $derived(o.rarete ? COULEURS_RARETE[o.rarete] : undefined);
  const icone = $derived(urlAsset(`icones/objets/${id}`));
  const probleme = $derived(h && o.type === 'equipement' ? messageEquipement(c, h, o) : undefined);

  const TYPES: Record<string, string> = { consommable: 'Objet à utiliser', cadeau: 'Cadeau', equipement: 'Équipement', quete: 'Objet de quête', materiau: 'Matériau' };
  const EMPLACEMENTS: Record<string, string> = { arme: 'arme', armure: 'armure', accessoire: 'accessoire' };
  const ETATS: Record<string, string> = { bonus_defense: 'de défense', bonus_degats: 'de dégâts', bonus_precision: 'de précision', regeneration: 'de régénération' };
  const REACTIONS = { prefere: 'adore ça', apprecie: 'aime bien', neutre: 'reste polie', deteste: 'déteste ça' } as const;

  /** Effet en chiffres (« Rend 24 PV », « +3 armure »…). */
  function chiffres(x: Objet): string[] {
    if (x.type === 'equipement') return texteEffets(x);
    const res: string[] = [];
    for (const e of x.effets) {
      if (e.type === 'soin') res.push(`Rend environ ${Math.round((e.puissance ?? 0) * 1.5)} PV`);
      else if (e.type === 'mana') res.push(`Rend ${e.valeur ?? 0} mana`);
      else if (e.type === 'purifier') res.push('Retire le poison, la brûlure et les malus');
      else if (e.type === 'degats') res.push(`Dégâts de ${e.element ?? 'base'} (puissance ${e.puissance ?? 0})`);
      else if (e.type === 'etat') res.push(`+${Math.round((e.valeur ?? 0) * 100)} % ${ETATS[e.etat ?? ''] ?? ''} pendant ${e.duree ?? 1} tours`);
    }
    return res;
  }
  /** Utilité en une phrase : celle du contenu, sinon une phrase selon le type. */
  function utilite(x: Objet): string {
    if (x.utilite) return x.utilite;
    if (x.type === 'cadeau') return "Cadeau : augmente l'affinité d'une compagne (onglet « Compagnons »). Ses goûts se découvrent en discutant avec elle ou en lui offrant.";
    if (x.type === 'equipement') return `S'équipe comme ${EMPLACEMENTS[x.emplacement ?? ''] ?? 'équipement'} depuis l'onglet « Personnage ».`;
    if (x.type === 'quete') return "Objet de quête : il sert à l'histoire et ne se vend pas.";
    if (x.type === 'materiau') return 'Matériau : se revend dans une boutique.';
    return "S'utilise en combat.";
  }
  /** Goûts déjà découverts : « Aveline adore ça ». */
  const gouts = $derived.by(() => {
    if (o.type !== 'cadeau') return [];
    const res: string[] = [];
    for (const co of Object.values(c.compagnons)) {
      const g = goutConnu(c, etat, co.id, id);
      if (g) res.push(`${co.nom} ${REACTIONS[g]}`);
    }
    return res;
  });

  // ───────────── Infobulle : survol (0,4 s), appui long, bouton « i », clavier ─────────────
  let ouvert = $state(false);
  let position = $state('');
  let ancre = $state<HTMLElement | null>(null);
  let minuteur: ReturnType<typeof setTimeout> | null = null;
  function placer() {
    if (!ancre) return;
    const r = ancre.getBoundingClientRect();
    const largeur = Math.min(320, window.innerWidth - 16);
    const gauche = Math.max(8, Math.min(r.left, window.innerWidth - largeur - 8));
    const enBas = r.bottom + 8 + 180 < window.innerHeight;
    position = `left:${gauche}px; width:${largeur}px; ${enBas ? `top:${r.bottom + 6}px` : `bottom:${window.innerHeight - r.top + 6}px`}`;
  }
  function ouvrir() { placer(); ouvert = true; }
  function fermer() { if (minuteur) clearTimeout(minuteur); minuteur = null; ouvert = false; }
  function attendre(ms: number) { if (minuteur) clearTimeout(minuteur); minuteur = setTimeout(ouvrir, ms); }
  function surPointeur(e: PointerEvent) { if (e.pointerType === 'mouse') attendre(400); }
  function surAppui(e: PointerEvent) { if (e.pointerType !== 'mouse') attendre(500); }
  $effect(() => {
    if (!ouvert) return;
    const f = () => fermer();
    window.addEventListener('scroll', f, true);
    return () => window.removeEventListener('scroll', f, true);
  });
</script>

<span class="objet" role="group" bind:this={ancre} onpointerenter={surPointeur} onpointerleave={fermer} onpointerdown={surAppui} onpointerup={(e) => { if (e.pointerType !== 'mouse' && !ouvert && minuteur) { clearTimeout(minuteur); minuteur = null; } }} onpointercancel={fermer}>
  {#if icone}<img class="pixel icone" src={icone} alt="" />{/if}
  <strong class="nom" style:color={couleur}>{o.nom}</strong>{#if nombre !== undefined}<span> × {nombre}</span>{/if}
  {#if probleme}<span class={`badge ${probleme.startsWith('Non maîtrisé') ? 'attention' : 'refus'}`}>{probleme.startsWith('Interdit') ? 'Interdit' : probleme.startsWith('Non maîtrisé') ? 'Non maîtrisé' : probleme.startsWith('Réservé') ? 'Réservé' : probleme}</span>{/if}
  <button type="button" class="info" aria-label={`Détails : ${o.nom}`} aria-expanded={ouvert} onclick={(e) => { e.stopPropagation(); if (ouvert) fermer(); else ouvrir(); }} onblur={fermer}>i</button>
  {#if ouvert}
    <span class="bulle" role="tooltip" style={position}>
      <strong style:color={couleur}>{o.nom}</strong>
      {#if !connu}
        <span class="ligne-b"><strong>???</strong> — effet inconnu.</span>
        <span class="ligne-b discret">On découvre son effet en l'achetant, ou avant, en payant Ferrand (au Chaudron Fêlé) pour une identification.</span>
      {:else}
        <span class="ligne-b discret">{TYPES[o.type]}{#if o.rarete} · <span style:color={couleur}>{NOMS_RARETE[o.rarete]}</span>{/if}{#if o.niveau !== undefined && o.niveau > 1} · <span class:refus={h && h.niveau < o.niveau}>niveau {o.niveau}</span>{/if}</span>
        {#if chiffres(o).length}<span class="ligne-b effets">{chiffres(o).join(' · ')}</span>{/if}
        {#if o.pouvoir_unique}<span class="ligne-b pouvoir">✦ {o.pouvoir_unique}</span>{/if}
        {#if o.classes?.length}<span class="ligne-b discret">Pour : {o.classes.map((k) => c.classes[k]?.nom ?? k).join(', ')}</span>{/if}
        {#if probleme}<span class={`ligne-b ${probleme.startsWith('Non maîtrisé') ? 'attention' : 'refus'}`}>{probleme}</span>{/if}
        <span class="ligne-b">{o.description}</span>
        <span class="ligne-b utilite">{utilite(o)}</span>
        {#each gouts as g (g)}<span class="ligne-b gout">♥ {g}</span>{/each}
      {/if}
      {#if h && o.type !== 'quete'}<span class="ligne-b discret">Se revend {prixVente(c, h, id)} or.</span>{/if}
    </span>
  {/if}
</span>

<style>
  .objet { display: inline-flex; gap: 0.35rem; align-items: center; min-width: 0; flex-wrap: wrap; vertical-align: middle; }
  .icone { width: 32px; height: 32px; flex: none; image-rendering: pixelated; }
  .nom { min-width: 0; }
  .info { width: 1.4rem; height: 1.4rem; padding: 0; border-radius: 50%; font-size: 0.75rem; font-weight: 700; font-style: italic; line-height: 1; color: var(--texte-2); flex: none; }
  .bulle { position: fixed; z-index: 100; display: block; background: #14111cf7; border: 1px solid var(--or); border-radius: 8px; padding: 0.5rem 0.7rem; box-shadow: var(--ombre); font-size: 0.88rem; font-weight: 400; text-align: left; white-space: normal; pointer-events: none; }
  .ligne-b { display: block; margin-top: 0.2rem; }
  .effets { color: var(--texte); font-weight: 600; }
  .utilite { color: var(--or-2); }
  .gout { color: #ff9bb8; }
  .pouvoir { color: #f2b53a; font-style: italic; }
  .refus { color: #e0605a; border-color: #e0605a; }
  .attention { color: #f2a33a; border-color: #7a5a20; }
</style>
