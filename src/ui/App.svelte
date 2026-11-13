<script lang="ts">
  import { jeu } from './jeu.svelte';
  import Accueil from './ecrans/Accueil.svelte';
  import Creation from './ecrans/Creation.svelte';
  import Jeu from './ecrans/Jeu.svelte';
</script>

{#if jeu.erreurContenu}
  <main class="conteneur">
    <h1>Erreur dans le contenu du jeu</h1>
    <p>Un fichier de <code>content/</code> contient une erreur. Corrigez-la puis rechargez la page (ou lancez <code>npm test</code> pour le détail).</p>
    <pre class="erreur" style="white-space: pre-wrap">{jeu.erreurContenu}</pre>
  </main>
{:else if jeu.chargement}
  <main class="conteneur"><p>Chargement de la partie…</p></main>
{:else if !jeu.etat}
  <Accueil />
{:else if !jeu.monHeros}
  <Creation />
{:else}
  <Jeu />
{/if}
