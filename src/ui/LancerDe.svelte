<script lang="ts">
  /**
   * Animation du lancer de dé (test 4, point 9), pour chaque test de caractéristique (scène, étape de contrat,
   * épreuve, piège de donjon) : le dé roule, puis le résultat du dé, le bonus, le total contre la difficulté,
   * et « Réussi » ou « Échoué ». Elle ne fait que montrer le résultat du moteur (etat.tests) : elle ne calcule rien.
   * Tous les joueurs présents la voient (l'état rejoué est le même partout). Un clic passe à la fin, un second ferme.
   * Avec prefers-reduced-motion : le résultat directement.
   */
  import { jeu } from './jeu.svelte';
  import { NOMS_CARACS } from './outils';

  const reduit = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  type Phase = 'roule' | 'de' | 'bonus' | 'total' | 'resultat';
  const ORDRE: Phase[] = ['roule', 'de', 'bonus', 'total', 'resultat'];
  const DUREES: Record<Phase, number> = { roule: 1100, de: 450, bonus: 450, total: 500, resultat: 1400 };

  let courant = $state<(typeof jeu.lancers)[number] | null>(null);
  let phase = $state<Phase>('roule');
  let face = $state(20);
  let minuteur: ReturnType<typeof setTimeout> | undefined;
  let roulement: ReturnType<typeof setInterval> | undefined;

  /** « de Charisme », « d'Agilité » */
  const deCarac = (k: string) => { const n = NOMS_CARACS[k] ?? k; return /^[AEIOUÉ]/.test(n) ? `d'${n}` : `de ${n}`; };
  const vu = (p: Phase) => ORDRE.indexOf(phase) >= ORDRE.indexOf(p);

  function arreter() { clearTimeout(minuteur); clearInterval(roulement); }
  function suivant() {
    arreter();
    courant = null;
    jeu.deEnCours = jeu.lancers.length > 0;
  }
  function aller(p: Phase) {
    arreter();
    phase = p;
    if (p === 'roule') roulement = setInterval(() => (face = 1 + Math.floor(Math.random() * 20)), 70);
    else if (courant) face = courant.jet;
    const i = ORDRE.indexOf(p);
    minuteur = setTimeout(() => (i < ORDRE.length - 1 ? aller(ORDRE[i + 1]) : suivant()), reduit && p === 'resultat' ? 1800 : DUREES[p]);
  }
  // le suivant de la file
  $effect(() => {
    if (courant || !jeu.lancers.length) return;
    courant = jeu.lancers[0];
    jeu.lancers = jeu.lancers.slice(1);
    jeu.deEnCours = true;
    aller(reduit ? 'resultat' : 'roule');
  });
  $effect(() => () => arreter());
  function clic() {
    if (phase === 'resultat') suivant();
    else aller('resultat');
  }
</script>

{#if courant}
  {@const nomHeros = jeu.etat?.heros[courant.heros]?.nom ?? ''}
  <div class="voile-de" role="presentation" onclick={clic}></div>
  <div class="lancer carte-ui" class:reussi={vu('resultat') && courant.reussi} class:echoue={vu('resultat') && !courant.reussi}
    role="dialog" aria-label="Lancer de dé" aria-live="polite" tabindex="-1" onclick={clic} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') && clic()}>
    <p class="titre">{nomHeros} — test {deCarac(courant.carac)}</p>
    {#if courant.quoi}<p class="quoi">{courant.quoi}</p>{/if}
    <div class="de" class:roule={phase === 'roule'} aria-hidden="true"><span>{face}</span></div>
    <div class="calcul">
      <span class:montre={vu('de')}>Dé <strong>{courant.jet}</strong></span>
      <span class:montre={vu('bonus')}>+ {courant.bonus} <small>({NOMS_CARACS[courant.carac]})</small></span>
      <span class:montre={vu('total')}>= <strong>{courant.total}</strong> contre {courant.difficulte}</span>
    </div>
    <p class="verdict" class:montre={vu('resultat')}>
      {#if courant.jet === 20 && courant.reussi}20 naturel : Réussi !{:else if courant.jet === 1 && !courant.reussi}1 naturel : Échoué…{:else}{courant.reussi ? 'Réussi' : 'Échoué'}{/if}
    </p>
    <p class="aide">Cliquer pour {phase === 'resultat' ? 'fermer' : 'passer'}</p>
  </div>
{/if}

<style>
  .voile-de { position: fixed; inset: 0; z-index: 90; background: #0b0910a8; }
  .lancer { position: fixed; z-index: 91; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(340px, calc(100vw - 2rem)); text-align: center; padding: 1rem 1.2rem 0.7rem; cursor: pointer; border: 2px solid var(--or); }
  .lancer.reussi { border-color: var(--vert); box-shadow: 0 0 24px #6fcf7a66; }
  .lancer.echoue { border-color: var(--rouge); box-shadow: 0 0 24px #d9473b66; }
  .titre { margin: 0; font-family: 'Cinzel', serif; color: var(--or-2); font-size: 1.05rem; }
  .quoi { margin: 0.1rem 0 0.4rem; font-size: 0.85rem; opacity: 0.8; }
  .de { margin: 0.6rem auto; width: 92px; height: 92px; display: grid; place-items: center;
    clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
    background: linear-gradient(160deg, #f6e2a8, #c9973a 60%, #8a6220); color: #2a1a05; font: 700 2.1rem 'Cinzel', serif; }
  .de.roule { animation: rouler 0.35s linear infinite; }
  @keyframes rouler { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(0.88); } 100% { transform: rotate(360deg) scale(1); } }
  .calcul { display: flex; justify-content: center; flex-wrap: wrap; gap: 0.35rem 0.6rem; min-height: 1.6em; font-size: 1.05rem; }
  .calcul span, .verdict { opacity: 0; transform: translateY(4px); transition: opacity 180ms, transform 180ms; }
  .calcul span.montre, .verdict.montre { opacity: 1; transform: none; }
  .verdict { margin: 0.5rem 0 0.2rem; font: 700 1.5rem 'Cinzel', serif; }
  .reussi .verdict { color: var(--vert); }
  .echoue .verdict { color: var(--rouge); }
  .aide { margin: 0.3rem 0 0; font-size: 0.75rem; opacity: 0.6; }
  @media (prefers-reduced-motion: reduce) {
    .de.roule { animation: none; }
    .calcul span, .verdict { transition: none; }
  }
</style>
