<script lang="ts">
  /**
   * Écran de jeu en plein écran : la scène (carte, lieu, dialogue, combat, donjon) occupe toute la fenêtre,
   * une barre fine semi-transparente passe par-dessus, et les panneaux (Histoire, Personnage…) s'ouvrent
   * comme des tiroirs depuis la droite. La page ne défile jamais.
   */
  import { onMount } from 'svelte';
  import { jeu } from '../jeu.svelte';
  import { aideDate, formaterDate, saisonDe } from '../../moteur/temps';
  import { attenteRepos, noeudCourant, rangHeros, sceneEstDisponible } from '../../moteur/partie';
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
  import Tiroir from '../Tiroir.svelte';
  import Fenetre from '../Fenetre.svelte';
  import { trouverLieu } from '../../moteur/guide';

  const c = jeu.contenu!;
  type Panneau = 'histoire' | 'fiche' | 'compagnons' | 'quetes' | 'journal' | 'partie';
  /** Tiroir ouvert (un seul à la fois), ou aucun. */
  let tiroir = $state<Panneau | null>(null);
  let menuOuvert = $state(false);
  let lieu = $state<string | null>(null);
  let ville = $state<string | null>(null);
  let ficheOuverte = $state(false);
  let aideDateOuverte = $state(false);
  let barreRepliee = $state(false);
  let pleinEcran = $state(false);
  /** Ouvre un lieu ; s'il est dans une ville, on reviendra ensuite sur le plan de cette ville. */
  function ouvrirLieu(id: string) {
    lieu = id;
    ville = trouverLieu(c, id)?.lieu.ville ?? null;
  }
  function allerCarte() { lieu = null; ville = null; tiroir = null; menuOuvert = false; }
  function ouvrir(p: Panneau) { tiroir = p; menuOuvert = false; }

  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const nouvellesEntrees = $derived(Math.max(0, etat.journal.length - jeu.journalVu));
  const pointsARepartir = $derived(!!(h.pointsCaracDispo || h.pointsCompetenceDispo));
  /** Une quête attend d'être rendue quelque part (scène « ? » disponible). */
  const queteARendre = $derived(Object.values(c.scenes).some((s) => s.rend_quete && sceneEstDisponible(c, etat, s, h.id)));
  const pastilleMenu = $derived(nouvellesEntrees + (pointsARepartir ? 1 : 0) + (queteARendre ? 1 : 0));

  // Ce qui doit s'afficher dans la scène, par ordre de priorité
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

  const entrees: [Panneau, string, string, string][] = [
    ['histoire', 'Histoire', '📖', 'H'], ['fiche', 'Personnage', '🧝', 'P'], ['compagnons', 'Compagnons', '💞', 'O'],
    ['quetes', 'Quêtes', '📜', 'Q'], ['journal', 'Journal', '🗒', 'J'], ['partie', 'Partie', '⚙', ''],
  ];
  const titres: Record<Panneau, string> = { histoire: 'Histoire', fiche: 'Personnage', compagnons: 'Compagnons', quetes: 'Quêtes', journal: 'Journal', partie: 'Partie' };

  // ───────────── Plein écran du navigateur ─────────────
  async function basculerPleinEcran() {
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); return; }
      await document.documentElement.requestFullscreen();
      // sur téléphone, on essaie de bloquer le paysage ; sans erreur si le navigateur refuse
      const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      if (matchMedia('(pointer: coarse)').matches) await orientation.lock?.('landscape').catch(() => undefined);
    } catch { /* plein écran refusé : on reste en fenêtre */ }
  }

  // ───────────── Raccourcis clavier ─────────────
  function clavier(e: KeyboardEvent) {
    const cible = e.target as HTMLElement | null;
    if (cible && (cible.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(cible.tagName))) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { if (tiroir || menuOuvert || ficheOuverte) { tiroir = null; menuOuvert = false; ficheOuverte = false; } return; }
    const touche = e.key.toUpperCase();
    if (touche === 'C' && vue === 'monde') { allerCarte(); return; }
    const p = entrees.find(([, , , k]) => k === touche);
    if (p) { e.preventDefault(); tiroir = tiroir === p[0] ? null : p[0]; menuOuvert = false; }
  }

  onMount(() => {
    const maj = () => (pleinEcran = !!document.fullscreenElement);
    document.addEventListener('fullscreenchange', maj);
    // l'écran de jeu fait exactement la taille de la fenêtre : la page ne défile pas
    document.documentElement.classList.add('jeu-plein-ecran');
    return () => { document.removeEventListener('fullscreenchange', maj); document.documentElement.classList.remove('jeu-plein-ecran'); };
  });
</script>

<svelte:window onkeydown={clavier} />

<div class="jeu">
  <main class="scene">
    {#if vue === 'combat'}
      <CombatVue cle={combatCle!} />
    {:else if vue === 'donjon'}
      <DonjonVue />
    {:else if vue === 'scene-groupe'}
      <Dialogue cle="groupe" />
    {:else if vue === 'scene-moi'}
      <Dialogue cle={sceneMoi!} />
    {:else if vue === 'temps-libre' || vue === 'fin-chapitre'}
      <div class="arriere" inert><Carte choisir={() => undefined} /></div>
      <Fenetre titre={vue === 'temps-libre' ? 'Temps libre' : 'Fin du chapitre'}>
        {#if vue === 'temps-libre'}<TempsLibre />{:else}<FinChapitre />{/if}
      </Fenetre>
    {:else if lieu}
      <Lieu id={lieu} retour={() => (lieu = null)} />
    {:else}
      <Carte choisir={ouvrirLieu} bind:ville />
    {/if}
  </main>

  {#if barreRepliee}
    <button class="languette" aria-label="Afficher la barre du haut" aria-expanded="false" onclick={() => (barreRepliee = false)}>▾</button>
  {:else}
    <header class="barre-haut">
      <div class="gauche">
        <div class="titre">
          <button class="date" title={aideDate(c, etat.jour).join('\n')} aria-expanded={aideDateOuverte} onclick={() => (aideDateOuverte = !aideDateOuverte)}><strong>{formaterDate(c, etat.jour)}</strong></button>
          <span class="discret infos">· {saisonDe(c, etat.jour)} · Chapitre {etat.chapitre}</span>
          {#if aideDateOuverte}
            <div class="aide-date carte-ui" role="note">
              {#each aideDate(c, etat.jour) as l, i (i)}<p>{l}</p>{/each}
            </div>
          {/if}
        </div>
        <button class="badge or barre-heros" aria-expanded={ficheOuverte} title="Ouvrir ou fermer ma fiche" onclick={() => (ficheOuverte = !ficheOuverte)}>{h.nom} · niv. {h.niveau} · rang {rangHeros(etat, h.id)} · {h.or} or {ficheOuverte ? '▴' : '▾'}</button>
        {#if etat.meneur}<span class="badge meneur" title="Le meneur du jour tranche les égalités et guide le groupe dans les donjons">Meneur : {etat.joueurs[etat.meneur]?.pseudo}</span>{/if}
        {#if jeu.joueursLocaux.length > 1}
          <select aria-label="Joueur actif sur cet appareil" value={jeu.joueurActif} onchange={(e) => jeu.changerJoueur((e.target as HTMLSelectElement).value)}>
            {#each jeu.joueursLocaux as j (j)}<option value={j}>{etat.joueurs[j]?.pseudo ?? 'Nouveau joueur'}</option>{/each}
          </select>
        {/if}
      </div>
      <nav class="droite" aria-label="Menu du jeu">
        {#if vue === 'monde' && (lieu || ville)}<button class="icone" aria-label="Carte" title="Revenir à la carte (C)" onclick={allerCarte}>🗺<span class="texte"> Carte</span></button>{/if}
        <div class="menu">
          <button class="icone" aria-label="Menu" aria-expanded={menuOuvert} aria-haspopup="true" onclick={() => (menuOuvert = !menuOuvert)}>☰{#if pastilleMenu}<span class="pastille">{pastilleMenu}</span>{/if}</button>
          {#if menuOuvert}
            <div class="liste-menu carte-ui" role="menu">
              {#each entrees as [id, nom, icone, k] (id)}
                <button role="menuitem" aria-expanded={tiroir === id} onclick={() => ouvrir(id)}>
                  <span>{icone} {nom}</span>
                  {#if id === 'journal' && nouvellesEntrees}<span class="pastille">{nouvellesEntrees}</span>{/if}
                  {#if id === 'fiche' && pointsARepartir}<span class="pastille">!</span>{/if}
                  {#if id === 'quetes' && queteARendre}<span class="pastille">?</span>{/if}
                  {#if k}<kbd>{k}</kbd>{/if}
                </button>
              {/each}
              <p class="aide-touches discret">Raccourcis : <kbd>C</kbd> carte · <kbd>H</kbd> histoire · <kbd>P</kbd> personnage · <kbd>O</kbd> compagnons · <kbd>Q</kbd> quêtes · <kbd>J</kbd> journal · <kbd>Échap</kbd> fermer</p>
            </div>
          {/if}
        </div>
        <button class="icone" aria-label={pleinEcran ? 'Quitter le plein écran' : 'Plein écran'} title={pleinEcran ? 'Quitter le plein écran' : 'Plein écran'} onclick={basculerPleinEcran}>{pleinEcran ? '🗗' : '⛶'}</button>
        <button class="icone" aria-label="Replier la barre du haut" title="Replier la barre" onclick={() => { barreRepliee = true; ficheOuverte = false; menuOuvert = false; aideDateOuverte = false; }}>▴</button>
      </nav>
      {#if ficheOuverte}<FicheRapide fermer={() => (ficheOuverte = false)} />{/if}
    </header>
  {/if}

  {#if etat.repos && vue === 'monde' && !barreRepliee}
    <div class="bandeau-repos carte-ui">
      <span>🛏 <strong>{etat.joueurs[etat.repos.par]?.pseudo}</strong> propose de dormir {etat.repos.mois} mois à l'auberge.{#if attenteRepos(etat).length} En attente de : {attenteRepos(etat).map((j) => etat.joueurs[j]?.pseudo).join(', ')}.{/if}</span>
      <button class="principal petit" onclick={() => ouvrirLieu('taverne')}>Aller à l'auberge</button>
    </div>
  {/if}

  {#if tiroir}
    <Tiroir titre={titres[tiroir]} fermer={() => (tiroir = null)}>
      {#if tiroir === 'histoire'}<Histoire />
      {:else if tiroir === 'fiche'}<Fiche />
      {:else if tiroir === 'compagnons'}<Compagnons />
      {:else if tiroir === 'quetes'}<Quetes />
      {:else if tiroir === 'journal'}<Journal />
      {:else if tiroir === 'partie'}<Partie />{/if}
    </Tiroir>
  {/if}

  {#if jeu.erreur}<p class="erreur flottant" role="alert">{jeu.erreur} <button class="petit" onclick={() => (jeu.erreur = null)}>OK</button></p>{/if}
  <Notifications />
  <PiecesAnimees />
</div>

<style>
  :global(html.jeu-plein-ecran), :global(html.jeu-plein-ecran body) { overflow: hidden; height: 100%; overscroll-behavior: none; }
  .jeu { position: fixed; inset: 0; width: 100vw; height: 100dvh; overflow: hidden; background: #07060a; }
  .scene { position: absolute; inset: 0; }
  .arriere { position: absolute; inset: 0; filter: brightness(0.55) blur(1px); }

  /* barre du haut : fine, semi-transparente, par-dessus l'image */
  .barre-haut { position: absolute; top: 0; left: 0; right: 0; z-index: 70; display: flex; justify-content: space-between; align-items: center; gap: 0.4rem 0.6rem; flex-wrap: wrap;
    padding: 0.3rem 0.6rem; padding-top: max(0.3rem, env(safe-area-inset-top)); padding-left: max(0.6rem, env(safe-area-inset-left)); padding-right: max(0.6rem, env(safe-area-inset-right));
    background: linear-gradient(#0d0b14e6, #0d0b14b3); border-bottom: 1px solid #ffffff14; backdrop-filter: blur(3px); }
  .gauche, .droite { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; min-width: 0; }
  .droite { margin-left: auto; }
  .gauche select { width: auto; padding: 0.2em 0.4em; }
  .titre { position: relative; }
  .date { background: none; border: none; padding: 0.2rem 0; text-decoration: underline dotted; text-underline-offset: 3px; font-size: 0.92rem; }
  .aide-date { position: absolute; top: 100%; left: 0; margin-top: 0.3rem; width: min(360px, calc(100vw - 2rem)); padding: 0.6rem 0.8rem; z-index: 30; font-size: 0.9rem; border-color: var(--or); }
  .aide-date p { margin: 0.2em 0; }
  .barre-heros { cursor: pointer; font-size: 0.85rem; padding: 0.3em 0.8em; min-height: 32px; }
  .icone { position: relative; min-width: 44px; min-height: 40px; padding: 0.2em 0.6em; background: #ffffff10; border-color: #ffffff22; font-size: 1.05rem; }
  .texte { font-size: 0.9rem; }
  .menu { position: relative; }
  .liste-menu { position: absolute; right: 0; top: calc(100% + 0.3rem); width: min(300px, calc(100vw - 1rem)); display: grid; gap: 0.3rem; padding: 0.5rem; z-index: 75; }
  .liste-menu button { display: flex; align-items: center; gap: 0.5rem; text-align: left; min-height: 44px; }
  .liste-menu button span:first-child { flex: 1; }
  kbd { font: 0.75rem monospace; padding: 0.05em 0.35em; border: 1px solid var(--bord); border-radius: 4px; color: var(--texte-2); }
  .aide-touches { margin: 0.3rem 0 0; font-size: 0.8rem; line-height: 1.6; }
  .pastille { display: inline-block; min-width: 1.3em; padding: 0 0.3em; border-radius: 99px; background: var(--rouge); color: white; font-size: 0.72rem; text-align: center; }
  .icone .pastille { position: absolute; top: -4px; right: -4px; }
  .languette { position: absolute; top: 0; left: 50%; translate: -50% 0; z-index: 70; min-width: 64px; min-height: 28px; padding: 0 1rem; border-radius: 0 0 10px 10px; border-top: none; background: #0d0b14cc; font-size: 0.9rem; }
  .bandeau-repos { position: absolute; z-index: 65; top: 3.4rem; left: 50%; translate: -50% 0; width: min(720px, calc(100% - 1rem)); display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; flex-wrap: wrap; border-color: var(--or); padding: 0.5rem 0.8rem; }
  .flottant { position: fixed; top: 3.6rem; left: 50%; translate: -50% 0; z-index: 95; max-width: 90vw; box-shadow: var(--ombre); }
  /* téléphone : une barre sur une seule ligne (la date reste dans la fiche rapide du héros) */
  @media (max-width: 640px), (max-height: 500px) {
    .infos, .meneur, .texte, .titre { display: none; }
    .barre-haut { flex-wrap: nowrap; padding-top: max(0.2rem, env(safe-area-inset-top)); padding-bottom: 0.2rem; }
    .gauche { flex-wrap: nowrap; min-width: 0; }
    .barre-heros { font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .droite { flex-wrap: nowrap; gap: 0.25rem; }
    .icone { min-width: 44px; min-height: 40px; padding: 0 0.4rem; }
  }
</style>
