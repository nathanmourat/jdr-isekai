<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { listeHeros, palierCompagnon } from '../../moteur/partie';
  import { age } from '../../moteur/personnage';
  import { versDate } from '../../moteur/temps';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const annee = $derived(versDate(c, etat.jour).annee);
</script>

<section class="carte-ui fin">
  <h1>Fin du chapitre {etat.finChapitre}</h1>
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
  <p><strong>Un long moment va passer.</strong> Quand tout le monde est prêt, retrouvez-vous au Chaudron Fêlé (Ville de Lysmont) et cliquez sur le lit : le groupe dormira jusqu'au début du chapitre suivant.</p>
  <p>Le chapitre 2, « Les Routes du Sud », arrivera dans une prochaine mise à jour. Votre sauvegarde sera reprise telle quelle.</p>
  <button class="principal" onclick={() => jeu.agir({ type: 'chapitre_suivant' })}>Continuer à explorer Aubeclaire</button>
</section>

<style>
  .fin { text-align: center; }
  .heros { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); text-align: left; margin: 1rem 0; }
</style>
