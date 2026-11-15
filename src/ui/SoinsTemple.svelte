<script lang="ts">
  /**
   * Soins au Temple (test 4, point 8) : petite scène animée d'environ 10 secondes, chez le joueur soigné seulement.
   * Le prêtre s'approche et prie, une lumière dorée descend avec des particules, les PV remontent ; la notification
   * verte « +X PV » arrive à la fin (les notifications attendent, jeu.pauseNotifications).
   * Bouton « Passer ». Avec prefers-reduced-motion : version courte de 2 secondes.
   * L'animation ne calcule rien : les PV de départ sont lus avant l'action, l'arrivée est le maximum (soins complets).
   */
  import { jeu } from './jeu.svelte';
  import { remplacerVariables } from '../moteur/partie';
  import { imagePnjDecor } from '../rendu/assets';
  import { nomPersonnage, portraitPersonnage } from './outils';

  const reduit = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Moments (ms) : réplique 1 + approche, réplique 2 + lumière, réplique 3 + PV qui remontent, fin. */
  const ETAPES = reduit ? [0, 0, 0, 2000] : [0, 3300, 6600, 10000];

  const c = $derived(jeu.contenu);
  const soin = $derived(jeu.soinTemple);
  let etape = $state(0);
  /** Le prêtre entre par la droite : sa place d'arrivée est posée une image après l'apparition (transition CSS). */
  let arrivee = $state(false);
  let minuteurs: ReturnType<typeof setTimeout>[] = [];
  let derniere: typeof soin = null;

  function arreter() { for (const t of minuteurs) clearTimeout(t); minuteurs = []; }
  function finir() { arreter(); jeu.soinTemple = null; }

  $effect(() => {
    if (!soin || soin === derniere) return;
    derniere = soin;
    arreter();
    etape = reduit ? 2 : 0;
    arrivee = reduit;
    if (!reduit) requestAnimationFrame(() => requestAnimationFrame(() => (arrivee = true)));
    if (!reduit) {
      minuteurs.push(setTimeout(() => (etape = 1), ETAPES[1]));
      minuteurs.push(setTimeout(() => (etape = 2), ETAPES[2]));
    }
    minuteurs.push(setTimeout(finir, ETAPES[3]));
  });
  $effect(() => () => arreter());

  const cfg = $derived(c?.config.soins.temple);
  const pnj = $derived(cfg?.pnj ?? 'elianne');
  const lignes = $derived(cfg ? (soin?.blesse && cfg.repliques_blessure.length ? cfg.repliques_blessure : cfg.repliques) : []);
  const ligne = $derived.by(() => {
    const t = lignes[Math.min(etape, lignes.length - 1)] ?? '';
    return c && jeu.etat && soin ? remplacerVariables(c, jeu.etat, t, [soin.heros]) : t;
  });
  /** PV affichés : ceux d'avant, puis ils remontent jusqu'au maximum à la 3e étape. */
  const ratio = $derived(soin ? (etape >= 2 ? 1 : soin.avant / Math.max(1, soin.max)) : 0);
  const pvAffiches = $derived(soin ? (etape >= 2 ? soin.max : soin.avant) : 0);
  const particules = Array.from({ length: 22 }, (_, i) => ({ x: 8 + ((i * 37) % 84), delai: (i * 173) % 1600, taille: 3 + (i % 3) * 2 }));
</script>

{#if soin && c && jeu.etat}
  <div class="soins" role="dialog" aria-label="Soins au Temple" aria-live="polite">
    <div class="scene" class:lumiere={etape >= 1} class:reduit>
      <div class="rayon" aria-hidden="true"></div>
      {#if etape >= 1}
        <div class="particules" aria-hidden="true">
          {#each particules as p, i (i)}<span style={`left:${p.x}%;animation-delay:${p.delai}ms;width:${p.taille}px;height:${p.taille}px`}></span>{/each}
        </div>
      {/if}
      <img class="pretre pixel" class:arrive={arrivee} src={imagePnjDecor(pnj)} alt="" />
      <div class="sante">
        <p>{jeu.etat.heros[soin.heros]?.nom} — <strong>{pvAffiches} / {soin.max} PV</strong>{#if soin.blesse && etape >= 2} · blessure guérie{/if}</p>
        <div class="barre-pv"><div style={`width:${Math.round(ratio * 100)}%`}></div></div>
      </div>
    </div>
    <div class="replique carte-ui">
      {#if portraitPersonnage(c, pnj)}<img class="portrait pixel" src={portraitPersonnage(c, pnj)} alt="" />{/if}
      <div>
        <p class="qui">{nomPersonnage(c, jeu.etat, pnj, [])}</p>
        <p class="dit">{ligne}</p>
      </div>
      <button class="petit passer" onclick={finir}>Passer ▸</button>
    </div>
  </div>
{/if}

<style>
  .soins { position: fixed; inset: 0; z-index: 92; display: grid; grid-template-rows: 1fr auto; background: #0b0910d9; padding: max(0.8rem, env(safe-area-inset-top)) 1rem max(0.8rem, env(safe-area-inset-bottom)); gap: 0.6rem; }
  .scene { position: relative; overflow: hidden; border-radius: 12px; background: radial-gradient(ellipse at 50% 85%, #3a2e1c, #14111c 70%); border: 1px solid var(--bord); min-height: 0; }
  .rayon { position: absolute; left: 50%; top: 0; width: min(260px, 60%); height: 0; transform: translateX(-50%); background: linear-gradient(180deg, #fff3c0ee, #f3c45a99 60%, #f3c45a00); filter: blur(6px); transition: height 1.6s ease-out; }
  .lumiere .rayon { height: 100%; }
  .reduit .rayon { transition: none; }
  .particules span { position: absolute; top: -10px; border-radius: 50%; background: #ffe9a0; box-shadow: 0 0 8px #f3c45a; animation: tomber 2.4s linear infinite; opacity: 0; }
  @keyframes tomber { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(70vh); opacity: 0; } }
  .pretre { position: absolute; bottom: 18%; left: 100%; height: min(45%, 256px); image-rendering: pixelated; transition: left 2.2s ease-out; transform: translateX(-50%); }
  .pretre.arrive { left: 58%; }
  .reduit .pretre { transition: none; }
  .sante { position: absolute; left: 50%; bottom: 4%; transform: translateX(-50%); width: min(420px, 86%); text-align: center; }
  .sante p { margin: 0 0 0.3rem; text-shadow: 0 1px 3px #000; }
  .barre-pv { height: 12px; border-radius: 99px; background: #000a; border: 1px solid var(--bord); overflow: hidden; }
  .barre-pv div { height: 100%; background: var(--vert); transition: width 2s ease-out; }
  .reduit .barre-pv div { transition: none; }
  .replique { display: flex; gap: 0.8rem; align-items: flex-start; max-width: 900px; width: 100%; justify-self: center; position: relative; }
  .portrait { width: clamp(56px, 10vw, 96px); aspect-ratio: 1; border-radius: 8px; border: 2px solid var(--or); object-fit: cover; object-position: top; flex: none; }
  .qui { margin: 0; font-family: 'Cinzel', serif; color: var(--or-2); }
  .dit { margin: 0.2rem 0 0; }
  .passer { margin-left: auto; align-self: flex-end; min-height: 44px; white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) { .particules { display: none; } }
</style>
