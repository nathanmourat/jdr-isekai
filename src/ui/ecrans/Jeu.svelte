<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { aideDate, formaterDate, saisonDe } from '../../moteur/temps';
  import { attenteRepos, noeudCourant, rangHeros } from '../../moteur/partie';
  import Carte from '../vues/Carte.svelte';
  import Lieu from '../vues/Lieu.svelte';
  import Dialogue from '../vues/Dialogue.svelte';
  import CombatVue from '../vues/CombatVue.svelte';
  import DonjonVue from '../vues/DonjonVue.svelte';
  import TempsLibre from '../vues/TempsLibre.svelte';
  import FinChapitre from '../vues/FinChapitre.svelte';
  import Fiche from '../panneaux/Fiche.svelte';
  import Compagnons from '../panneaux/Compagnons.svelte';
  import Journal from '../panneaux/Journal.svelte';
  import Quetes from '../panneaux/Quetes.svelte';
  import Partie from '../panneaux/Partie.svelte';
  import Histoire from '../panneaux/Histoire.svelte';
  import FicheRapide from '../panneaux/FicheRapide.svelte';
  import Notifications from '../Notifications.svelte';
  import PiecesAnimees from '../PiecesAnimees.svelte';

  const c = jeu.contenu!;
  type Panneau = 'carte' | 'histoire' | 'fiche' | 'compagnons' | 'quetes' | 'journal' | 'partie';
  let panneau = $state<Panneau>('carte');
  let lieu = $state<string | null>(null);
  let ville = $state<string | null>(null);
  let ficheOuverte = $state(false);
  /** Ouvre un lieu ; s'il est dans une ville, on reviendra ensuite sur le plan de cette ville. */
  function ouvrirLieu(id: string) {
    lieu = id;
    ville = c.regions.aubeclaire.lieux.find((l) => l.id === id)?.ville ?? null;
  }
  let aideDateOuverte = $state(false);

  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const nouvellesEntrees = $derived(etat.journal.length - jeu.journalVu);

  // Ce qui doit s'afficher au centre, par ordre de priorité
  const combatCle = $derived.by(() => {
    for (const k of ['groupe', h.id]) {
      const e = etat.combats[k];
      if (!e) continue;
      // un combat lancé par une scène s'affiche après la lecture de son introduction
      const sc = e.contexte.sceneCle ? etat.scenes[e.contexte.sceneCle] : null;
      const intro = sc ? noeudCourant(c, etat, e.contexte.sceneCle!)?.repliques.length ?? 0 : 0;
      if (e.contexte.origine !== 'scene' || intro === 0 || jeu.combatsVus.includes(e.combat.id)) return k;
    }
    return null;
  });
  const sceneGroupeActive = $derived(!!etat.scenes.groupe);
  const sceneMoi = $derived(etat.scenes[h.id] ? h.id : null);
  const vue = $derived.by(() => {
    if (combatCle) return 'combat';
    if (etat.donjon) return 'donjon';
    if (sceneGroupeActive) return 'scene-groupe';
    if (sceneMoi) return 'scene-moi';
    if (etat.tempsLibre) return 'temps-libre';
    if (etat.finChapitre) return 'fin-chapitre';
    return 'monde';
  });

  const onglets: [Panneau, string][] = [['carte', 'Carte'], ['histoire', 'Histoire'], ['fiche', 'Personnage'], ['compagnons', 'Compagnons'], ['quetes', 'Quêtes'], ['journal', 'Journal'], ['partie', 'Partie']];
</script>

<div class="jeu">
  <header class="barre-haut">
    <div class="titre">
      <button class="date" title={aideDate(c, etat.jour).join('\n')} aria-expanded={aideDateOuverte} onclick={() => (aideDateOuverte = !aideDateOuverte)}><strong>{formaterDate(c, etat.jour)}</strong></button>
      <span class="discret">· {saisonDe(c, etat.jour)} · Chapitre {etat.chapitre}</span>
      {#if aideDateOuverte}
        <div class="aide-date carte-ui" role="note">
          {#each aideDate(c, etat.jour) as l, i (i)}<p>{l}</p>{/each}
        </div>
      {/if}
    </div>
    <div class="ligne moi">
      <button class="badge or barre-heros" aria-expanded={ficheOuverte} title="Ouvrir ou fermer ma fiche" onclick={() => (ficheOuverte = !ficheOuverte)}>{h.nom} · niv. {h.niveau} · rang {rangHeros(etat, h.id)} · {h.or} or {ficheOuverte ? '▴' : '▾'}</button>
      {#if etat.meneur}<span class="badge" title="Le meneur du jour tranche les égalités et guide le groupe dans les donjons">Meneur : {etat.joueurs[etat.meneur]?.pseudo}</span>{/if}
      {#if jeu.joueursLocaux.length > 1}
        <select aria-label="Joueur actif sur cet appareil" value={jeu.joueurActif} onchange={(e) => jeu.changerJoueur((e.target as HTMLSelectElement).value)}>
          {#each jeu.joueursLocaux as j (j)}<option value={j}>{etat.joueurs[j]?.pseudo ?? 'Nouveau joueur'}</option>{/each}
        </select>
      {/if}
    </div>
    {#if ficheOuverte}<FicheRapide fermer={() => (ficheOuverte = false)} />{/if}
  </header>

  {#if jeu.erreur}<p class="erreur flottant" role="alert">{jeu.erreur} <button class="petit" onclick={() => (jeu.erreur = null)}>OK</button></p>{/if}

  <main class="centre">
    {#if vue === 'combat'}
      <CombatVue cle={combatCle!} />
    {:else if vue === 'donjon'}
      <DonjonVue />
    {:else if vue === 'scene-groupe'}
      <Dialogue cle="groupe" />
    {:else if vue === 'scene-moi'}
      <Dialogue cle={sceneMoi!} />
    {:else if vue === 'temps-libre'}
      <TempsLibre />
    {:else if vue === 'fin-chapitre'}
      <FinChapitre />
    {:else}
      <nav class="onglets" aria-label="Menu du jeu">
        {#each onglets as [id, nom] (id)}
          <button class:actif={panneau === id} onclick={() => { panneau = id; if (id === 'carte') { lieu = null; ville = null; } }}>
            {nom}{#if id === 'journal' && nouvellesEntrees > 0} <span class="pastille">{nouvellesEntrees}</span>{/if}
            {#if id === 'fiche' && (h.pointsCaracDispo || h.pointsCompetenceDispo)} <span class="pastille">!</span>{/if}
          </button>
        {/each}
      </nav>
      {#if etat.repos}
        <div class="repos carte-ui">
          <span>🛏 <strong>{etat.joueurs[etat.repos.par]?.pseudo}</strong> propose de dormir {etat.repos.mois} mois à l'auberge.{#if attenteRepos(etat).length} En attente de : {attenteRepos(etat).map((j) => etat.joueurs[j]?.pseudo).join(', ')}.{/if}</span>
          <button class="principal petit" onclick={() => { panneau = 'carte'; ouvrirLieu('taverne'); }}>Aller à l'auberge</button>
        </div>
      {/if}
      {#if panneau === 'carte'}
        {#if lieu}<Lieu id={lieu} retour={() => (lieu = null)} />{:else}<Carte choisir={ouvrirLieu} bind:ville />{/if}
      {:else if panneau === 'histoire'}<Histoire />
      {:else if panneau === 'fiche'}<Fiche />
      {:else if panneau === 'compagnons'}<Compagnons />
      {:else if panneau === 'quetes'}<Quetes />
      {:else if panneau === 'journal'}<Journal />
      {:else if panneau === 'partie'}<Partie />{/if}
    {/if}
  </main>

  <Notifications />
  <PiecesAnimees />
</div>

<style>
  .jeu { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr; grid-template-columns: minmax(0, 1fr); }
  .barre-haut { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 0.5rem 1rem; background: var(--fond-2); border-bottom: 1px solid var(--bord); position: sticky; top: 0; z-index: 10; }
  .moi select { width: auto; padding: 0.2em 0.4em; }
  .centre { max-width: 1200px; width: 100%; min-width: 0; margin: 0 auto; padding: 0.8rem; }
  .onglets { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
  .onglets button { padding: 0.4em 0.9em; }
  .onglets button.actif { border-color: var(--or); background: #3b2f18; }
  .pastille { display: inline-block; min-width: 1.3em; padding: 0 0.3em; border-radius: 99px; background: var(--rouge); color: white; font-size: 0.75rem; text-align: center; }
  .flottant { position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%); z-index: 50; max-width: 90vw; box-shadow: var(--ombre); }
  .titre { position: relative; }
  .date { background: none; border: none; padding: 0; text-decoration: underline dotted; text-underline-offset: 3px; }
  .aide-date { position: absolute; top: 100%; left: 0; margin-top: 0.3rem; width: min(360px, calc(100vw - 2rem)); padding: 0.6rem 0.8rem; z-index: 30; font-size: 0.9rem; border-color: var(--or); }
  .aide-date p { margin: 0.2em 0; }
  .repos { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.6rem; border-color: var(--or); padding: 0.6rem 0.9rem; }
  .barre-heros { cursor: pointer; font-size: 0.85rem; padding: 0.3em 0.8em; }
</style>
