<script lang="ts">
  /** Scène de dialogue : décor, portrait, répliques une par une, choix (votés en groupe), tests de caractéristique. */
  import { jeu } from '../jeu.svelte';
  import { choixVisibles, conditionScene, joueursDuPari, miseDuChoix, noeudAffiche, partMinimaleDePari, partsDeMise, remplacerVariables } from '../../moteur/partie';
  import { imageDecor } from '../../rendu/assets';
  import { NOMS_CARACS, nomPersonnage, portraitHeros, portraitPersonnage } from '../outils';

  let { cle }: { cle: string } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const es = $derived(etat.scenes[cle]);
  const scene = $derived(c.scenes[es.sceneId]);
  // une scène terminée affiche encore les répliques de son dernier nœud, avant « Terminer la scène »
  const noeud = $derived(noeudAffiche(c, etat, cle));
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
  // Un personnage s'adresse à un joueur précis : lui seul répond
  const parole = $derived(noeud?.parole_a && es.parole ? { def: noeud.parole_a, heros: etat.heros[es.parole.heros], reponses: es.parole.reponses } : null);
  const joueurInterroge = $derived(parole ? etat.joueurs[parole.heros.joueurId] : null);
  const cEstAMoi = $derived(!!joueurInterroge && jeu.joueursLocaux.includes(joueurInterroge.id));
  function texteParole(t: string) { return remplacerVariables(c, etat, t, es.heros, parole?.heros.id); }
  /** Pari : pourquoi ce joueur ne peut pas choisir cette réponse (pas assez d'or), ou ''. */
  function blocageMise(j: string, ch: (typeof choix)[number]): string {
    const mise = miseDuChoix(ch.choix);
    const hj = etat.heros[etat.joueurs[j]?.herosId ?? ''];
    if (!mise || !hj || hj.or >= mise) return '';
    return `Pas assez d'or : il faut ${mise} pièces pour miser, ${hj.nom} n'en a que ${hj.or}.`;
  }
  // Pari partagé : chaque joueur dit s'il mise ; la mise est répartie entre ceux qui misent
  const pari = $derived(noeud?.pari && es.pari ? { def: noeud.pari, reponses: es.pari, joueurs: joueursDuPari(etat, cle) } : null);
  const partMin = $derived(pari ? partMinimaleDePari(etat, cle, pari.def.mise) : 0);
  /** Exemple de répartition si tout le monde mise (« 7 + 7 + 6 »). */
  const exemplePari = $derived(pari ? partsDeMise(pari.def.mise, pari.joueurs.length).join(' + ') : '');
  function blocagePari(j: string): string {
    const hj = etat.heros[etat.joueurs[j]?.herosId ?? ''];
    if (!pari || !hj || hj.or >= partMin) return '';
    return `Pas assez d'or : il faut au moins ${partMin} pièces pour sa part, ${hj.nom} n'en a que ${hj.or}.`;
  }
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
      {:else if parole}
        <div class="parole">
          <div class="question">
            {#if portraitPersonnage(c, parole.def.question.qui, parole.def.question.expression)}<img class="portrait pixel" src={portraitPersonnage(c, parole.def.question.qui, parole.def.question.expression)} alt="" />{/if}
            <div>
              <p class="qui">{nomPersonnage(c, etat, parole.def.question.qui, es.heros)} <span class="badge or">s'adresse à {joueurInterroge?.pseudo}</span></p>
              <p class="dit">{texteParole(parole.def.question.dit)}</p>
            </div>
          </div>
          {#if cEstAMoi}
            <p class="consigne">{joueurInterroge?.pseudo}, c'est à toi de répondre ({parole.heros.nom}) :</p>
            <div class="choix">
              {#each parole.reponses as i (i)}
                <button class="reponse" onclick={() => jeu.agir({ type: 'repondre', joueur: joueurInterroge!.id, cle, index: i })}>{texteParole(parole.def.reponses[i].texte)}</button>
              {/each}
            </div>
          {:else}
            <p class="discret">Seul {joueurInterroge?.pseudo} peut répondre. En attente de sa réponse…</p>
            <ul class="discret">{#each parole.reponses as i (i)}<li>{texteParole(parole.def.reponses[i].texte)}</li>{/each}</ul>
          {/if}
        </div>
      {:else if pari}
        <div class="pari">
          <p class="consigne">🪙 Pari : <strong>{pari.def.mise} pièces</strong> pour le groupe. La mise est partagée entre ceux qui misent{#if pari.joueurs.length > 1} (si tout le monde mise : {exemplePari}){/if}. Pari gagné : chacun récupère {pari.def.gain} fois sa part. Pari perdu : la part est perdue.</p>
          {#each pari.joueurs as j (j)}
            {@const hj = etat.heros[etat.joueurs[j].herosId ?? '']}
            <div class="option">
              <span class="libelle">{etat.joueurs[j].pseudo} <span class="discret">({hj?.nom}, {hj?.or} or)</span>
                {#if pari.reponses[j] !== undefined} — <strong>{pari.reponses[j] ? 'mise' : 'ne mise pas'}</strong>{/if}
                {#if jeu.joueursLocaux.includes(j) && pari.reponses[j] === undefined && blocagePari(j)}<br /><small class="aide-mise">{blocagePari(j)}</small>{/if}</span>
              {#if pari.reponses[j] === undefined}
                {#if jeu.joueursLocaux.includes(j)}
                  <div class="ligne">
                    <button class="petit principal" disabled={!!blocagePari(j)} title={blocagePari(j)} onclick={() => jeu.agir({ type: 'parier', joueur: j, cle, mise: true })}>Je mise</button>
                    <button class="petit" onclick={() => jeu.agir({ type: 'parier', joueur: j, cle, mise: false })}>Je ne mise pas</button>
                  </div>
                {:else}<span class="discret">réfléchit…</span>{/if}
              {/if}
            </div>
          {/each}
        </div>
      {:else if choix.length}
        <div class="choix">
          {#each choix as ch (ch.index)}
            <div class="option">
              <span class="libelle">{texte(ch.choix.texte)}{#if !ch.possible} <span class="badge">indisponible</span>{/if}{#if miseDuChoix(ch.choix)} <span class="badge or">mise : {miseDuChoix(ch.choix)} or</span>{/if}
                {#each mesJoueurs.filter((j) => blocageMise(j, ch)) as j (j)}<br /><small class="aide-mise">{blocageMise(j, ch)}</small>{/each}</span>
              <div class="ligne">
                {#if groupe && votants(ch.index).length}<span class="discret">Votes : {votants(ch.index).join(', ')}</span>{/if}
                {#each mesJoueurs as j (j)}
                  <button class="petit" disabled={!ch.possible || !!blocageMise(j, ch)} title={blocageMise(j, ch)} class:vote={es.votes[j] === ch.index} onclick={() => jeu.agir({ type: 'choisir', joueur: j, cle, index: ch.index })}>
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
  .portrait { width: clamp(72px, 14vw, 140px); aspect-ratio: 1; border-radius: 8px; border: 2px solid var(--or); object-fit: cover; object-position: top; background: var(--fond); flex: none; }
  .qui { margin: 0; color: var(--or-2); font-weight: 700; font-family: 'Cinzel', serif; }
  .dit { margin: 0.2em 0 0; font-size: 1.08rem; }
  .narration { font-style: italic; color: #e9e1f3; }
  .suite { margin: 0.4em 0 0; }
  .choix { display: grid; gap: 0.5rem; margin-top: 0.8rem; }
  .parole { margin-top: 0.6rem; }
  .question { display: flex; gap: 0.9rem; align-items: flex-start; }
  .consigne { color: var(--or-2); margin: 0.6em 0 0; }
  .reponse { text-align: left; }
  .aide-mise { color: #ffb4a8; }
  .option { display: flex; justify-content: space-between; gap: 0.6rem; align-items: center; flex-wrap: wrap; padding: 0.5rem 0.7rem; border: 1px solid var(--bord); border-radius: 8px; background: var(--fond); }
  .libelle { flex: 1 1 260px; }
  .vote { border-color: var(--or); background: #3b2f18; }
  .gains { margin: 0 0 0.6rem; padding-left: 1.2rem; color: var(--or-2); font-size: 0.92rem; }
  .test { margin: 0 0 0.5rem; padding: 0.4em 0.6em; border-radius: 6px; background: #3a1a1a; }
  .test.reussi { background: #173022; }
</style>
