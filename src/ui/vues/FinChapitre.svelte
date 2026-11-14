<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { listeHeros, palierCompagnon } from '../../moteur/partie';
  import { age } from '../../moteur/personnage';
  import { versDate } from '../../moteur/temps';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const annee = $derived(versDate(c, etat.jour).annee);
  const TITRES: Record<number, string> = { 2: 'Les Routes du Sud', 3: 'La Forêt qui se souvient', 4: 'Feu et Écailles', 5: 'La Guerre des Cendres', 6: 'Le Souverain des Cendres' };
  const finSaison = $derived(etat.finChapitre === 6);
  const FINS: Record<string, string> = { 'fin-sceau': 'A. Le Sceau', 'fin-pacte': 'B. Le Pacte', 'fin-couronne': 'C. La Couronne', 'fin-retour': 'D. Le Retour' };
  const fin = $derived(Object.keys(FINS).find((f) => etat.flags[f]) ?? null);
</script>

<section class="carte-ui fin">
  <h1>{finSaison ? 'Fin de la saison 1' : `Fin du chapitre ${etat.finChapitre}`}</h1>
  {#if finSaison && fin}<p class="or"><strong>Fin {FINS[fin]}</strong></p>{/if}
  <p>{annee}. Voici où en sont les héros.</p>
  <div class="grille heros">
    {#each listeHeros(etat) as h (h.id)}
      <div class="carte-ui">
        <h3>{h.nom}</h3>
        <p class="discret">{age(h, annee)} ans · niveau {h.niveau} · {h.or} or</p>
        {#each etat.compagnonsRencontres as co (co)}<p class="discret">{c.compagnons[co].nom} : {palierCompagnon(c, etat, h.id, co).nom}</p>{/each}
      </div>
    {/each}
  </div>
  {#if finSaison}
    <p><strong>La saison 1 est terminée.</strong> Vous pouvez continuer à parcourir Velmaris, finir vos contrats et vos quêtes de compagnes.</p>
    <p>La saison 2 arrivera dans une prochaine mise à jour : votre sauvegarde sera reprise, et la fin que vous avez obtenue décidera de son point de départ.</p>
  {:else}
    <p><strong>Un long moment va passer.</strong> Quand tout le monde est prêt, retrouvez-vous dans une auberge et cliquez sur le lit : le groupe dormira jusqu'au début du chapitre suivant.</p>
    <p>Chapitre {(etat.finChapitre ?? 1) + 1} : « {TITRES[(etat.finChapitre ?? 1) + 1]} ».</p>
  {/if}
  <button class="principal" onclick={() => jeu.agir({ type: 'chapitre_suivant' })}>Continuer</button>
</section>

<style>
  .fin { text-align: center; }
  .heros { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); text-align: left; margin: 1rem 0; }
</style>
