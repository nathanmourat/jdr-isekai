<script lang="ts">
  /**
   * Quête solo : avec qui la faire (mise à jour 5, point 6). Seul (comme avant), avec tout le groupe présent, ou avec
   * certains joueurs (cases à cocher). Un joueur occupé ou absent est grisé, avec la raison.
   * Les invités reçoivent une demande ; la quête reste celle du lanceur.
   */
  import type { Scene } from '../contenu/schemas';
  import { invitablesQuete } from '../moteur/partie';
  import { jeu } from './jeu.svelte';
  import Fenetre from './Fenetre.svelte';

  let { scene, fermer }: { scene: Scene; fermer: () => void } = $props();
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const liste = $derived(invitablesQuete(etat, h.id));
  const libres = $derived(liste.filter((x) => x.raison === null).map((x) => x.heros));
  let mode = $state<'seul' | 'groupe' | 'certains'>('seul');
  let coches = $state<string[]>([]);
  const invites = $derived(mode === 'seul' ? [] : mode === 'groupe' ? libres : coches.filter((x) => libres.includes(x)));
  const pseudo = (id: string) => etat.joueurs[etat.heros[id].joueurId]?.pseudo ?? etat.heros[id].nom;

  async function partir() {
    const ok = invites.length === 0
      ? await jeu.agir({ type: 'lancer_scene', scene: scene.id })
      : await jeu.agir({ type: 'inviter_quete', scene: scene.id, invites });
    if (ok) fermer();
  }
</script>

<Fenetre titre={scene.titre} cle="inviter-quete" {fermer}>
  <p>Avec qui partez-vous ? La quête reste la vôtre ; ceux qui vous accompagnent gagnent l'XP, l'or et le butin des combats.</p>
  <fieldset class="modes">
    <label class="choix"><input type="radio" bind:group={mode} value="seul" /> <strong>Seul{h.sexe === 'f' ? 'e' : ''}</strong></label>
    <label class="choix"><input type="radio" bind:group={mode} value="groupe" disabled={libres.length === 0} /> <strong>Avec tout le groupe présent</strong>{#if libres.length === 0} <span class="discret">(personne n'est libre)</span>{/if}</label>
    <label class="choix"><input type="radio" bind:group={mode} value="certains" disabled={libres.length === 0} /> <strong>Avec certains joueurs</strong></label>
  </fieldset>
  {#if mode !== 'seul'}
    <ul class="joueurs">
      {#each liste as x (x.heros)}
        <li class:grise={x.raison !== null}>
          <label>
            <input type="checkbox" value={x.heros} bind:group={coches} disabled={x.raison !== null || mode === 'groupe'} checked={mode === 'groupe' && x.raison === null} />
            <strong>{pseudo(x.heros)}</strong> <span class="discret">({etat.heros[x.heros].nom})</span>
            {#if x.raison}<span class="badge">{x.raison}</span>{/if}
          </label>
        </li>
      {/each}
    </ul>
  {/if}
  <div class="ligne">
    <button class="principal" disabled={mode !== 'seul' && invites.length === 0} onclick={partir}>{invites.length ? `Inviter (${invites.length})` : 'Partir'}</button>
    <button onclick={fermer}>Annuler</button>
  </div>
</Fenetre>

<style>
  .modes { border: 0; padding: 0; margin: 0.6rem 0; display: grid; gap: 0.4rem; }
  .choix { display: flex; gap: 0.5rem; align-items: center; min-height: 44px; }
  .joueurs { list-style: none; padding: 0; margin: 0 0 0.8rem; display: grid; gap: 0.3rem; }
  .joueurs label { display: flex; gap: 0.5rem; align-items: center; min-height: 44px; flex-wrap: wrap; }
  .grise { opacity: 0.55; }
  .ligne { gap: 0.6rem; }
</style>
