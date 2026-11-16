<script lang="ts">
  /**
   * Soins au Temple : petite scène animée d'environ 10 secondes, chez le joueur soigné seulement
   * (test 4, point 8 ; plus vivante à la mise à jour 5, point 1). Décor du Temple du Seuil en fond.
   *
   *   0 – 1,5 s   la lumière baisse ; le héros (son vrai sprite et son calque de race) se tient sur le cercle ; réplique 1
   *   1,5 – 3,5 s le prêtre (son vrai sprite) s'avance vers lui
   *   3,5 – 5 s   ses mains s'illuminent, la lueur pulse ; réplique 2
   *   5 – 6,5 s   un rayon descend de la grande rosace jusqu'au héros
   *   6,5 – 8 s   un halo l'enveloppe, de petites lueurs s'allument puis s'éteignent sur son corps (les blessures se
   *               referment), des particules dorées montent
   *   8 s         léger flash doré, les PV remontent en 1 s ; réplique 3
   *   8,5 – 10 s  la lumière revient à la normale, le prêtre s'incline ; puis la notification verte « +X PV »
   *               (les notifications attendent la fin : jeu.pauseNotifications)
   *
   * Bouton « Passer ». Avec prefers-reduced-motion : version courte de 2 secondes, image fixe (halo, PV pleins,
   * dernière réplique). L'animation ne calcule rien : les PV de départ sont lus avant l'action, l'arrivée est le maximum.
   */
  import { jeu } from './jeu.svelte';
  import { remplacerVariables } from '../moteur/partie';
  import { imageDecor, imagePnjDecor, urlAsset } from '../rendu/assets';
  import { nomPersonnage, portraitPersonnage } from './outils';

  const reduit = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Début de chaque phase (ms) : 1 marche, 2 mains, 3 rayon, 4 halo, 5 flash et PV, 6 retour au calme, puis fin. */
  const PHASES = [0, 1500, 3500, 5000, 6500, 8000, 8500];
  const DUREE = reduit ? 2000 : 10000;

  const c = $derived(jeu.contenu);
  const soin = $derived(jeu.soinTemple);
  let phase = $state(0);
  let minuteurs: ReturnType<typeof setTimeout>[] = [];
  let derniere: typeof soin = null;

  function arreter() { for (const t of minuteurs) clearTimeout(t); minuteurs = []; }
  function finir() { arreter(); jeu.soinTemple = null; }

  $effect(() => {
    if (!soin || soin === derniere) return;
    derniere = soin;
    arreter();
    if (reduit) phase = 6;
    else {
      phase = 0;
      PHASES.forEach((t, i) => { if (i > 0) minuteurs.push(setTimeout(() => (phase = i), t)); });
    }
    minuteurs.push(setTimeout(finir, DUREE));
  });
  $effect(() => () => arreter());

  const cfg = $derived(c?.config.soins.temple);
  const pnj = $derived(cfg?.pnj ?? 'elianne');
  const lignes = $derived(cfg ? (soin?.blesse && cfg.repliques_blessure.length ? cfg.repliques_blessure : cfg.repliques) : []);
  /** Réplique 1 au début, 2 quand les mains s'illuminent, 3 quand les PV remontent. */
  const numero = $derived(phase < 2 ? 0 : phase < 5 ? 1 : 2);
  const ligne = $derived.by(() => {
    const t = lignes[Math.min(numero, lignes.length - 1)] ?? '';
    return c && jeu.etat && soin ? remplacerVariables(c, jeu.etat, t, [soin.heros]) : t;
  });
  const gueri = $derived(phase >= 5);
  const ratio = $derived(soin ? (gueri ? 1 : soin.avant / Math.max(1, soin.max)) : 0);
  const pvAffiches = $derived(soin ? (gueri ? soin.max : soin.avant) : 0);

  // sprite du héros : sa planche de combat (ligne « attente ») et son calque de race (féminin s'il existe)
  const h = $derived(soin && jeu.etat ? jeu.etat.heros[soin.heros] : null);
  const planche = $derived(h ? urlAsset(`personnages/heros/${h.classe}/combat`) : null);
  const calque = $derived(h && h.race !== 'humain'
    ? (h.sexe === 'f' ? urlAsset(`personnages/races/${h.race}/calque-combat-f`) : null) ?? urlAsset(`personnages/races/${h.race}/calque-combat`)
    : null);

  const particules = Array.from({ length: 26 }, (_, i) => ({ x: 20 + ((i * 37) % 60), delai: (i * 173) % 1500, taille: 3 + (i % 3) * 2, derive: ((i * 29) % 21) - 10 }));
  /** Petites lueurs sur le corps du héros (en % de sa case) : les blessures qui se referment. */
  const lueurs = [{ x: 50, y: 40, d: 0 }, { x: 44, y: 55, d: 250 }, { x: 57, y: 63, d: 500 }, { x: 47, y: 74, d: 750 }, { x: 54, y: 48, d: 1000 }];
</script>

{#if soin && c && jeu.etat}
  <div class="soins" role="dialog" aria-label="Soins au Temple" aria-live="polite">
    <div class="scene" class:lumiere={phase >= 2} class:reduit data-phase={phase}>
      <div class="cadre" style={`--decor:url("${imageDecor('temple-du-seuil', 'Temple du Seuil')}")`}>
        <div class="assombri" aria-hidden="true"></div>
        <div class="rosace" aria-hidden="true"></div>
        <div class="rayon" aria-hidden="true"></div>

        <div class="heros" aria-hidden="true">
          <div class="halo"></div>
          {#if planche}
            <div class="sprite" style={`background-image:url("${planche}")`}></div>
            {#if calque}<div class="sprite" style={`background-image:url("${calque}")`}></div>{/if}
          {:else}
            <div class="silhouette"></div>
          {/if}
          {#each lueurs as l, i (i)}<span class="lueur" style={`left:${l.x}%;top:${l.y}%;animation-delay:${l.d}ms`}></span>{/each}
          {#if phase >= 4 && phase < 6}
            <div class="particules">
              {#each particules as p, i (i)}<span style={`left:${p.x}%;animation-delay:${p.delai}ms;width:${p.taille}px;height:${p.taille}px;--derive:${p.derive}px`}></span>{/each}
            </div>
          {/if}
        </div>

        <div class="pretre" aria-hidden="true">
          <img class="pixel" src={imagePnjDecor(pnj)} alt="" />
          <span class="main"></span>
        </div>
        <div class="flash" aria-hidden="true"></div>

        <div class="sante">
          <p>{h?.nom} — <strong>{pvAffiches} / {soin.max} PV</strong>{#if soin.blesse && gueri} · blessure guérie{/if}</p>
          <div class="barre-pv"><div style={`width:${Math.round(ratio * 100)}%`}></div></div>
        </div>
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
  .soins { position: fixed; inset: 0; z-index: 92; display: grid; grid-template-rows: 1fr auto; background: #0b0910f2; padding: max(0.8rem, env(safe-area-inset-top)) 1rem max(0.8rem, env(safe-area-inset-bottom)); gap: 0.6rem; }
  /* le décor garde ses proportions (16:9) : la rosace et le cercle restent aux mêmes endroits sur tous les écrans */
  .scene { position: relative; min-height: 0; container-type: size; display: grid; place-items: center; }
  .cadre { position: relative; width: min(100cqw, 100cqh * 16 / 9); aspect-ratio: 16 / 9; overflow: hidden; border-radius: 12px; border: 1px solid var(--bord); background: var(--decor) center / 100% 100% no-repeat, #14111c; }

  /* 0 → 1,5 s : la lumière baisse ; 8,5 s : elle revient */
  .assombri { position: absolute; inset: 0; background: #0a0812; opacity: 0; transition: opacity 1.4s ease; }
  [data-phase='1'] .assombri, [data-phase='2'] .assombri, [data-phase='3'] .assombri, [data-phase='4'] .assombri, [data-phase='5'] .assombri { opacity: 0.45; }

  /* la grande rosace (50 %, 24 % du décor) s'allume au moment du rayon */
  .rosace { position: absolute; left: 50%; top: 23.6%; width: 17%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(#fff6c8, #f3c45a88 45%, transparent 70%); opacity: 0; transition: opacity 0.8s ease; mix-blend-mode: screen; }
  [data-phase='3'] .rosace, [data-phase='4'] .rosace, [data-phase='5'] .rosace { opacity: 1; }

  /* 5 s : un rayon descend de la rosace jusqu'au héros */
  /* il part du centre de la rosace (50 %) et s'élargit jusqu'au héros (44 %) : boîte de 37 % à 57 % du décor */
  .rayon { position: absolute; left: 37%; top: 23.6%; width: 20%; height: 0; background: linear-gradient(180deg, #fff6c8f0, #f3c45ab0 55%, #f3c45a40); filter: blur(5px); mix-blend-mode: screen; transition: height 1.4s ease-out, opacity 1.2s ease; clip-path: polygon(55% 0, 75% 0, 70% 100%, 0 100%); }
  [data-phase='3'] .rayon, [data-phase='4'] .rayon, [data-phase='5'] .rayon { height: 62%; }
  [data-phase='6'] .rayon { height: 62%; opacity: 0; }

  /* le héros, debout sur le cercle bleu, un peu à gauche du centre, tourné vers le prêtre */
  .heros { position: absolute; left: 44%; bottom: 10%; width: 22%; aspect-ratio: 1; translate: -50% 0; }
  .sprite { position: absolute; inset: 0; background-size: 800% 600%; background-repeat: no-repeat; image-rendering: pixelated; animation: attente 0.8s steps(4) infinite; }
  @keyframes attente { from { background-position: 0 0; } to { background-position: calc(400% / 7) 0; } }
  .silhouette { position: absolute; left: 38%; right: 38%; top: 22%; bottom: 8%; border-radius: 40% 40% 12% 12%; background: #3a3348; }
  .halo { position: absolute; left: 50%; top: 52%; width: 70%; height: 92%; translate: -50% -50%; border-radius: 50%; background: radial-gradient(#fff3c066, #f3c45a33 55%, transparent 72%); box-shadow: 0 0 0 2px #ffe9a066 inset; opacity: 0; scale: 0.6; transition: opacity 0.8s ease, scale 0.8s ease; }
  [data-phase='4'] .halo, [data-phase='5'] .halo { opacity: 1; scale: 1; animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 50% { scale: 1.06; } }
  .lueur { position: absolute; width: 6%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(#ffffff, #ffe08a 45%, transparent 70%); opacity: 0; }
  [data-phase='4'] .lueur { animation: refermer 1.1s ease-in-out both; }
  @keyframes refermer { 0% { opacity: 0; scale: 0.4; } 40% { opacity: 1; scale: 1.4; } 100% { opacity: 0; scale: 0.2; } }
  .particules span { position: absolute; bottom: 10%; border-radius: 50%; background: #ffe9a0; box-shadow: 0 0 8px #f3c45a; animation: monter 1.6s ease-out infinite; opacity: 0; }
  @keyframes monter { 0% { transform: translate(0, 0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(var(--derive), -260%); opacity: 0; } }

  /* le prêtre entre par la droite et s'avance jusqu'au héros (1,5 → 3,5 s), puis s'incline (8,5 s) */
  .pretre { position: absolute; left: 112%; bottom: 10%; height: 34%; aspect-ratio: 80 / 128; translate: -50% 0; transition: left 2s ease-out; }
  .pretre img { width: 100%; height: 100%; image-rendering: pixelated; transform-origin: 50% 100%; }
  [data-phase='1'] .pretre img { animation: marche 0.5s ease-in-out infinite; }
  @keyframes marche { 50% { translate: 0 -3%; } }
  .scene:not([data-phase='0']) .pretre { left: 58%; }
  [data-phase='6'] .pretre img { transform: rotate(-6deg) translateY(2%); transition: transform 0.6s ease; }
  /* ses mains s'illuminent (3,5 s), la lueur pulse jusqu'au flash */
  .main { position: absolute; left: 18%; top: 50%; width: 46%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(#fffbe6, #ffd76a99 40%, transparent 70%); opacity: 0; mix-blend-mode: screen; }
  [data-phase='2'] .main, [data-phase='3'] .main, [data-phase='4'] .main { opacity: 1; animation: briller 0.7s ease-in-out infinite alternate; }
  @keyframes briller { from { scale: 0.75; filter: brightness(0.9); } to { scale: 1.15; filter: brightness(1.3); } }

  /* 8 s : léger flash au moment où les PV remontent */
  .flash { position: absolute; inset: 0; background: radial-gradient(circle at 44% 70%, #fff8dc, #fff3c0aa 40%, transparent 75%); opacity: 0; pointer-events: none; }
  [data-phase='5'] .flash { animation: flash 0.5s ease-out; }
  @keyframes flash { 0% { opacity: 0; } 25% { opacity: 0.85; } 100% { opacity: 0; } }

  .sante { position: absolute; left: 50%; bottom: 2.5%; transform: translateX(-50%); width: min(420px, 86%); text-align: center; }
  .sante p { margin: 0 0 0.3rem; text-shadow: 0 1px 3px #000, 0 0 6px #000; color: #fff; }
  .barre-pv { height: 12px; border-radius: 99px; background: #000a; border: 1px solid var(--bord); overflow: hidden; }
  .barre-pv div { height: 100%; background: var(--vert); transition: width 1s ease-out; }

  /* mouvement réduit : image fixe, sans transition */
  .reduit *, .reduit .cadre * { transition: none !important; animation: none !important; }
  .reduit .halo { opacity: 1; scale: 1; }
  .reduit .pretre { left: 58%; }

  .replique { display: flex; gap: 0.8rem; align-items: flex-start; max-width: 900px; width: 100%; justify-self: center; position: relative; }
  .portrait { width: clamp(56px, 10vw, 96px); aspect-ratio: 1; border-radius: 8px; border: 2px solid var(--or); object-fit: cover; object-position: top; flex: none; }
  .qui { margin: 0; font-family: 'Cinzel', serif; color: var(--or-2); }
  .dit { margin: 0.2rem 0 0; }
  .passer { margin-left: auto; align-self: flex-end; min-height: 44px; white-space: nowrap; }
</style>
