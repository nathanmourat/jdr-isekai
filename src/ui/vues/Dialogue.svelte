<script lang="ts">
  /** Scène de dialogue : décor, portrait, répliques une par une, choix (votés en groupe), tests de caractéristique. */
  import { jeu } from '../jeu.svelte';
  import { choixVisibles, conditionScene, noeudCourant, remplacerVariables } from '../../moteur/partie';
  import { imageDecor } from '../../rendu/assets';
  import { NOMS_CARACS, nomPersonnage, portraitHeros, portraitPersonnage } from '../outils';

  let { cle }: { cle: string } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const es = $derived(etat.scenes[cle]);
  const scene = $derived(c.scenes[es.sceneId]);
  const noeud = $derived(noeudCourant(c, etat, cle));
  const repliques = $derived(noeud ? noeud.repliques.filter((r) => conditionScene(c, etat, r.si, es.heros)) : []);
  const decor = $derived(noeud?.decor ?? scene.decor);
  let vues = $state(1);
  let derniereCle = '';
  $effect(() => {
    const k = `${es.sceneId}:${es.noeud}`;
    if (k !== derniereCle) { derniereCle = k; vues = 1; }
  });
  const toutVu = $derived(vues >= repliques.length);
  const replique = $derived(repliques[Math.min(vues, repliques.length) - 1]);
  const choix = $derived(choixVisibles(c, etat, cle));
  const groupe = $derived(cle === 'groupe');
  const presents = $derived(etat.ordreJoueurs.filter((j) => etat.joueurs[j].present && etat.joueurs[j].herosId));
  const mesJoueurs = $derived(groupe ? jeu.joueursLocaux.filter((j) => presents.includes(j)) : [jeu.joueurActif]);
  const fini = $derived(es.noeud === '__fin__');
  const combatEnAttente = $derived(!!etat.combats[cle === 'groupe' ? 'groupe' : cle]);

  function texte(t: string) { return remplacerVariables(c, etat, t, es.heros); }
  function votants(index: number) { return Object.entries(es.votes).filter(([, v]) => v === index).map(([j]) => etat.joueurs[j]?.pseudo); }
  function aVote(j: string) { return es.votes[j] !== undefined; }
  function suivant() { if (!toutVu) vues++; }
</script>

<section class="scene" style={`--decor: url(${imageDecor(decor, scene.titre)})`}>
  <div class="decor pixel" role="img" aria-label={`Décor : ${scene.titre}`}></div>
  <div class="bandeau"><h2>{scene.titre}</h2>{#if groupe}<span class="badge">scène de groupe</span>{/if}</div>

  <div class="boite carte-ui">
    {#if es.dernierTest && vues === 1}
      <p class="test" class:reussi={es.dernierTest.reussi}>
        Test de {NOMS_CARACS[es.dernierTest.carac]} ({etat.heros[es.dernierTest.heros]?.nom}) : dé {es.dernierTest.jet} + {es.dernierTest.total - es.dernierTest.jet} = <strong>{es.dernierTest.total}</strong>
        contre {es.dernierTest.difficulte} → {es.dernierTest.reussi ? 'réussite !' : 'échec.'}
      </p>
    {/if}
    {#if es.messages.length && vues === 1}
      <ul class="gains">{#each es.messages as m, i (i)}<li>{m}</li>{/each}</ul>
    {/if}

    {#if replique}
      <div class="replique" onclick={suivant} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && suivant()} role="button" tabindex="0">
        {#if portraitPersonnage(c, replique.qui, replique.expression)}
          <img class="portrait pixel" src={portraitPersonnage(c, replique.qui, replique.expression)} alt={nomPersonnage(c, etat, replique.qui, es.heros)} />
        {:else if replique.qui === 'heros' && es.heros[0]}
          <img class="portrait pixel" src={portraitHeros(c, etat.heros[es.heros[0]])} alt="" />
        {/if}
        <div>
          {#if replique.qui !== 'narrateur'}<p class="qui">{nomPersonnage(c, etat, replique.qui, es.heros)}</p>{/if}
          <p class="dit" class:narration={replique.qui === 'narrateur'}>{texte(replique.dit)}</p>
          {#if !toutVu}<p class="discret suite">Cliquer pour continuer ({vues}/{repliques.length})</p>{/if}
        </div>
      </div>
    {/if}

    {#if toutVu}
      {#if fini}
        <button class="principal" onclick={() => jeu.agir({ type: 'quitter_scene', cle })}>Terminer la scène</button>
      {:else if combatEnAttente}
        <button class="principal" onclick={() => (jeu.combatsVus = [...jeu.combatsVus, etat.combats[cle === 'groupe' ? 'groupe' : cle].combat.id])}>⚔ Au combat !</button>
      {:else if choix.length}
        <div class="choix">
          {#each choix as ch (ch.index)}
            <div class="option">
              <span class="libelle">{texte(ch.choix.texte)}{#if !ch.possible} <span class="badge">indisponible</span>{/if}</span>
              <div class="ligne">
                {#if groupe && votants(ch.index).length}<span class="discret">Votes : {votants(ch.index).join(', ')}</span>{/if}
                {#each mesJoueurs as j (j)}
                  <button class="petit" disabled={!ch.possible} class:vote={es.votes[j] === ch.index} onclick={() => jeu.agir({ type: 'choisir', joueur: j, cle, index: ch.index })}>
                    {groupe ? (mesJoueurs.length > 1 ? `Vote de ${etat.joueurs[j].pseudo}` : 'Voter') : 'Choisir'}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        {#if groupe}
          <p class="discret">En attente des votes : {presents.filter((j) => !aVote(j)).map((j) => etat.joueurs[j].pseudo).join(', ') || 'personne'}.
            {#if etat.meneur && jeu.joueursLocaux.includes(etat.meneur) && Object.keys(es.votes).length}
              <button class="petit" onclick={() => jeu.agir({ type: 'trancher', joueur: etat.meneur!, cle })}>Trancher (meneur)</button>
            {/if}
          </p>
        {/if}
      {:else if noeud?.suite}
        <button class="principal" onclick={() => jeu.agir({ type: 'continuer', joueur: groupe ? mesJoueurs[0] ?? jeu.joueurActif : jeu.joueurActif, cle })}>Continuer</button>
      {/if}
    {/if}
  </div>
</section>

<style>
  .scene { position: relative; border-radius: var(--rayon); overflow: hidden; border: 1px solid var(--bord); min-height: 70dvh; display: grid; grid-template-rows: auto 1fr auto; }
  .decor { position: absolute; inset: 0; background: var(--decor) center / cover no-repeat; }
  .bandeau { position: relative; display: flex; gap: 0.6rem; align-items: center; padding: 0.6rem 1rem; background: linear-gradient(rgba(10,8,14,0.85), transparent); }
  .bandeau h2 { margin: 0; text-shadow: 0 2px 4px #000; }
  .boite { position: relative; grid-row: 3; margin: 0.8rem; background: rgba(20,17,28,0.92); backdrop-filter: blur(2px); }
  .replique { display: flex; gap: 0.9rem; align-items: flex-start; cursor: pointer; }
  .portrait { width: clamp(72px, 14vw, 140px); aspect-ratio: 1; border-radius: 8px; border: 2px solid var(--or); object-fit: cover; background: var(--fond); flex: none; }
  .qui { margin: 0; color: var(--or-2); font-weight: 700; font-family: 'Cinzel', serif; }
  .dit { margin: 0.2em 0 0; font-size: 1.08rem; }
  .narration { font-style: italic; color: #e9e1f3; }
  .suite { margin: 0.4em 0 0; }
  .choix { display: grid; gap: 0.5rem; margin-top: 0.8rem; }
  .option { display: flex; justify-content: space-between; gap: 0.6rem; align-items: center; flex-wrap: wrap; padding: 0.5rem 0.7rem; border: 1px solid var(--bord); border-radius: 8px; background: var(--fond); }
  .libelle { flex: 1 1 260px; }
  .vote { border-color: var(--or); background: #3b2f18; }
  .gains { margin: 0 0 0.6rem; padding-left: 1.2rem; color: var(--or-2); font-size: 0.92rem; }
  .test { margin: 0 0 0.5rem; padding: 0.4em 0.6em; border-radius: 6px; background: #3a1a1a; }
  .test.reussi { background: #173022; }
</style>
