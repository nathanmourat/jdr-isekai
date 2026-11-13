<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { telecharger } from '../outils';

  const etat = $derived(jeu.etat!);
  const infos = $derived(jeu.canal!.infos);
  const moi = $derived(etat.joueurs[jeu.joueurActif]);
  function exporter() {
    telecharger(`velmaris-${infos.nom.replace(/[^\p{L}\p{N}]+/gu, '-')}-${new Date().toISOString().slice(0, 10)}.json`, jeu.exporter());
  }
</script>

<section class="grille">
  <div class="carte-ui">
    <h2>{infos.nom}</h2>
    <p>Mode : <strong>{infos.mode === 'local' ? 'local (ce navigateur)' : 'en ligne'}</strong>{#if infos.mode === 'en-ligne'} · code à partager : <span class="badge or code">{infos.code}</span>{/if}</p>
    <p class="discret">Session {etat.session} · {jeu.actions.length} actions jouées.</p>
    <div class="ligne">
      <button onclick={exporter}>Exporter la sauvegarde</button>
      <button onclick={() => jeu.fermer()}>Quitter vers l'accueil</button>
    </div>
  </div>
  <div class="carte-ui">
    <h2>Options</h2>
    <label class="option"><input type="checkbox" checked={jeu.animationsRapides} onchange={(e) => jeu.changerAnimationsRapides((e.target as HTMLInputElement).checked)} />
      <span><strong>Animations rapides</strong><br /><small class="discret">Raccourcit le suspense avant le résultat d'une attaque et les pauses entre les ripostes des ennemis. Ce réglage ne vaut que pour cet appareil.</small></span></label>
  </div>
  <div class="carte-ui">
    <h2>Joueurs</h2>
    {#each etat.ordreJoueurs as j (j)}
      {@const jo = etat.joueurs[j]}
      <p class="ligne">
        <strong>{jo.pseudo}</strong> {jo.herosId ? `— ${etat.heros[jo.herosId].nom}` : '(pas encore de héros)'}
        <span class="badge">{jo.present ? 'présent' : 'absent'}</span>
        {#if etat.meneur === j}<span class="badge or">meneur du jour</span>{/if}
      </p>
    {/each}
    <div class="ligne">
      {#if moi}<button class="petit" onclick={() => jeu.agir({ type: 'presence', present: !moi.present })}>{moi.present ? 'Me déclarer absent' : 'Me déclarer présent'}</button>{/if}
      <button class="petit" onclick={() => jeu.agir({ type: 'nouvelle_session' })}>Nouvelle session (le meneur change)</button>
      {#if infos.mode === 'local' && jeu.joueursLocaux.length < 6}<button class="petit" onclick={() => jeu.ajouterJoueurLocal()}>+ Ajouter un joueur sur cet appareil</button>{/if}
    </div>
    <p class="discret">Un joueur absent ne bloque rien : les votes se font entre présents, et son héros est joué par l'ordinateur ou reste au camp (réglage dans « Personnage »).</p>
  </div>
</section>

<style>
  .option { display: flex; gap: 0.6rem; align-items: flex-start; }
  .option input { width: auto; margin-top: 0.3rem; }.code { font-size: 1.1rem; letter-spacing: 0.2em; }</style>
