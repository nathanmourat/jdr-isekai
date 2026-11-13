<script lang="ts">
  /**
   * La chambre de l'auberge : un clic sur le lit propose de faire passer des mois.
   * Le temps ne passe que si tous les joueurs présents sont d'accord sur la même durée.
   */
  import { jeu } from '../jeu.svelte';
  import { attenteRepos, prochaineDateHistoire } from '../../moteur/partie';
  import { formaterDate } from '../../moteur/temps';
  import { imageDecor, positionsImage } from '../../rendu/assets';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const repos = $derived(etat.repos);
  const moi = $derived(jeu.joueurActif);
  const attente = $derived(attenteRepos(etat));
  const histoire = $derived(prochaineDateHistoire(c, etat));
  const moisHistoire = $derived(histoire ? Math.max(1, Math.round((histoire.jour - etat.jour) / c.config.calendrier.jours_par_mois)) : 0);
  const lit = positionsImage('decors/auberge-chambre')?.lit ?? { x: 900, y: 470 };
  let ouvert = $state(false);
  const pseudo = (j: string) => etat.joueurs[j]?.pseudo ?? '?';
  /** Sur un même appareil, chaque joueur local donne son accord : un bouton par joueur qui n'a pas encore répondu. */
  const mesJoueursEnAttente = $derived(attente.filter((j) => jeu.joueursLocaux.includes(j)));
  const jaiAccepte = $derived(!!repos && mesJoueursEnAttente.length === 0);
</script>

<div class="carte-ui auberge">
  <h3>🛏 La chambre</h3>
  <div class="chambre pixel" style={`background-image:url(${imageDecor('auberge-chambre', 'Chambre du Chaudron Fêlé')})`}>
    <button class="lit" style={`left:${(lit.x / 1280) * 100}%; top:${(lit.y / 720) * 100}%`} onclick={() => (ouvert = !ouvert)} aria-expanded={ouvert}>🛏 Le lit<br /><small>cliquez pour dormir</small></button>
  </div>
  <p class="discret">Les mois ne passent que si vous le décidez, ici. En jouant, seuls les jours avancent (jusqu'au dernier jour du mois).</p>

  {#if repos}
    <div class="proposition" aria-live="polite">
      <p><strong>{pseudo(repos.par)}</strong> propose de dormir <strong>{repos.mois} mois</strong>, jusqu'au {formaterDate(c, repos.jusqua)}.</p>
      {#if attente.length}<p>En attente de : <strong>{attente.map(pseudo).join(', ')}</strong></p>{/if}
      {#if !jaiAccepte}
        <div class="ligne">
          {#each mesJoueursEnAttente as j (j)}
            <button class="principal" onclick={() => jeu.agir({ type: 'repondre_repos', joueur: j, accepte: true })}>Accepter ({pseudo(j)})</button>
          {/each}
          <button onclick={() => jeu.agir({ type: 'repondre_repos', joueur: mesJoueursEnAttente[0] ?? moi, accepte: false })}>Refuser et proposer autre chose</button>
        </div>
      {:else}
        <p class="succes">Vous êtes d'accord. Le temps passera quand tout le monde aura accepté.</p>
        <button class="petit" onclick={() => jeu.agir({ type: 'repondre_repos', accepte: false })}>Annuler la proposition</button>
      {/if}
    </div>
  {:else if ouvert}
    <div class="proposition">
      <p><strong>Combien de temps voulez-vous dormir ?</strong> Chacun choisira ensuite ses activités de temps libre (s'entraîner, travailler, étudier…).</p>
      <div class="ligne">
        {#each c.config.ellipses.durees_auberge_mois as m (m)}
          <button onclick={() => { ouvert = false; jeu.agir({ type: 'proposer_repos', mois: m }); }}>{m} mois</button>
        {/each}
      </div>
      {#if histoire}
        <p class="histoire">
          <button class="principal" onclick={() => { ouvert = false; jeu.agir({ type: 'proposer_repos', histoire: true }); }}>Jusqu'à la suite de l'histoire ({moisHistoire} mois)</button>
          <span class="discret">{histoire.raison} — {formaterDate(c, histoire.jour)}</span>
        </p>
      {/if}
      {#if etat.ordreJoueurs.length > 1}<p class="discret">Les autres joueurs devront accepter, ou proposer une autre durée.</p>{/if}
    </div>
  {/if}
</div>

<style>
  .auberge h3 { margin-bottom: 0.4rem; }
  .chambre { position: relative; aspect-ratio: 16 / 9; max-height: 260px; width: 100%; background-size: 100% 100%; border-radius: 8px; border: 1px solid var(--bord); overflow: hidden; }
  .lit { position: absolute; transform: translate(-50%, -50%); background: #1b1308d9; border-color: var(--or); line-height: 1.15; }
  .lit small { color: var(--texte-2); }
  .proposition { border: 1px solid var(--or); border-radius: 8px; padding: 0.6rem 0.8rem; margin-top: 0.5rem; background: var(--fond); }
  .proposition p { margin: 0.3em 0; }
  .histoire { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
</style>
