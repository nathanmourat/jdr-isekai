<script lang="ts">
  /**
   * Invitations aux quêtes solo (mise à jour 5, point 6).
   * - Invité : demande « Kael vous invite à … » (Accepter / Refuser). Elle attend que l'écran soit libre
   *   (pas pendant l'animation des soins du Temple ni une autre scène).
   * - Lanceur : qui a répondu ; « Commencer sans attendre » après 20 secondes, ou « Annuler ».
   */
  import { jeu } from './jeu.svelte';
  import Fenetre from './Fenetre.svelte';

  let { libre }: { libre: boolean } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros);
  const recue = $derived(h ? Object.values(etat.invitations ?? {}).find((i) => i.invites.includes(h.id) && i.reponses[h.id] === undefined) ?? null : null);
  const envoyee = $derived(h ? etat.invitations?.[h.id] ?? null : null);
  const pseudo = (id: string) => etat.joueurs[etat.heros[id].joueurId]?.pseudo ?? etat.heros[id].nom;
  const ATTENTE_MS = 20000;
  let peutCommencer = $state(false);
  $effect(() => {
    peutCommencer = false;
    if (!envoyee) return;
    const t = setTimeout(() => (peutCommencer = true), ATTENTE_MS);
    return () => clearTimeout(t);
  });
</script>

{#if recue && libre && !jeu.soinTemple}
  <Fenetre titre="Invitation" cle="invitation-quete">
    <p><strong>{pseudo(recue.lanceur)}</strong> ({etat.heros[recue.lanceur].nom}) vous invite à l'accompagner : <strong>« {c.scenes[recue.scene].titre} »</strong>.</p>
    <p class="discret">C'est sa quête : {etat.heros[recue.lanceur].sexe === 'f' ? 'elle' : 'il'} fait les choix. Vous gagnez l'XP, l'or et le butin des combats.</p>
    <div class="ligne">
      <button class="principal" onclick={() => jeu.agir({ type: 'repondre_invitation', lanceur: recue.lanceur, accepte: true })}>Accepter</button>
      <button onclick={() => jeu.agir({ type: 'repondre_invitation', lanceur: recue.lanceur, accepte: false })}>Refuser</button>
    </div>
  </Fenetre>
{:else if envoyee}
  <div class="attente carte-ui" role="status">
    <p><strong>« {c.scenes[envoyee.scene].titre} »</strong> : en attente des réponses.</p>
    <ul>
      {#each envoyee.invites as id (id)}
        <li>{pseudo(id)} : {envoyee.reponses[id] === true ? 'accepte ✔' : envoyee.reponses[id] === false ? 'refuse' : 'réfléchit…'}</li>
      {/each}
    </ul>
    <div class="ligne">
      <button class="petit principal" disabled={!peutCommencer} title={peutCommencer ? '' : 'Possible après 20 secondes'} onclick={() => jeu.agir({ type: 'demarrer_quete' })}>Commencer sans attendre</button>
      <button class="petit" onclick={() => jeu.agir({ type: 'annuler_invitation' })}>Annuler</button>
    </div>
  </div>
{/if}

<style>
  .attente { position: fixed; z-index: 94; right: max(0.6rem, env(safe-area-inset-right)); bottom: max(0.6rem, env(safe-area-inset-bottom)); width: min(340px, calc(100vw - 1.2rem)); }
  .attente p { margin: 0 0 0.3rem; }
  .attente ul { margin: 0 0 0.4rem; padding-left: 1.1rem; }
  .ligne { gap: 0.5rem; flex-wrap: wrap; }
</style>
