<script lang="ts">
  /**
   * Un lieu : son décor, avec les personnages posés dessus (on clique sur eux pour leur parler)
   * et des zones cliquables (porte, escalier, lit, tableau des contrats…).
   * Un symbole au-dessus d'un personnage signale qu'il a quelque chose d'important à dire :
   * « ! » doré = quête principale, « ! » argenté = quête secondaire, « ? » = quête à rendre.
   * Ordre d'affichage : décor, PNJ (du fond vers l'avant), premier plan (comptoirs).
   */
  import { tick } from 'svelte';
  import { jeu } from '../jeu.svelte';
  import { candidatsExamen, conditionHeros, conditionScene, etapeContrat, listeHeros, objetConnu, palierCompagnon, prochainExamen, rangHeros, scenesDisponibles } from '../../moteur/partie';
  import ObjetInfo from '../ObjetInfo.svelte';
  import { absentsDuGroupe, aideNiveau, couleurNiveau, estExaminateur, estGuilde, marqueurPnj, trouverLieu, niveauGroupe, niveauScene, sceneAvecCombat, type Marqueur } from '../../moteur/guide';
  import NiveauConseille from '../NiveauConseille.svelte';
  import { avantPlanDecor, imageDecor, imagePnjDecor, positionsImage, TAILLE_PNJ_DECOR } from '../../rendu/assets';
  import { portraitPersonnage } from '../outils';
  import { fusionsPossibles } from '../../moteur/fusions';
  import CompetenceInfo from '../CompetenceInfo.svelte';
  import type { Scene } from '../../contenu/schemas';
  import Boutique from './Boutique.svelte';
  import Auberge from './Auberge.svelte';
  import Cadre169 from '../Cadre169.svelte';
  import Fenetre from '../Fenetre.svelte';
  import { ecrirePreference, lirePreference } from '../preferences';

  let { id, retour }: { id: string; retour: () => void } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const lieu = $derived(trouverLieu(c, id)!.lieu);
  const tous = $derived(listeHeros(etat).map((x) => x.id));
  const pnj = $derived(lieu.pnj.filter((p) => conditionScene(c, etat, p.si, tous)));
  const scenes = $derived(scenesDisponibles(c, etat, id, h.id));
  /** Scènes qui ne passent par aucun personnage présent : on les lance depuis « Sur place ». */
  const scenesSurPlace = $derived(scenes.filter((s) => !s.pnj || !pnj.some((p) => p.id === s.pnj)));
  const contrats = $derived(estGuilde(id) ? Object.values(c.contrats).filter((ct) => !ct.examen_rang && conditionHeros(c, etat, ct.disponible_si, h)) : []);
  const rang = $derived(rangHeros(etat, h.id));
  /** Examen du prochain rang de Guilde, et héros présents qui peuvent le passer en même temps. */
  const examen = $derived(prochainExamen(c, etat, h.id));
  const avecMoi = $derived(candidatsExamen(c, etat, h.id).filter((x) => x !== h.id).map((x) => etat.heros[x].nom));
  const ordre = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
  const nomPnj = (p: string) => c.compagnons[p]?.nom ?? c.pnj[p]?.nom ?? p;
  const fusions = $derived(estGuilde(id) ? fusionsPossibles(c, h) : []);
  const absents = $derived(absentsDuGroupe(etat));
  /** Contrat en cours du héros, et son étape si elle se joue ici. */
  const contratEnCours = $derived(etapeContrat(c, etat, h.id));
  const etapeIci = $derived(contratEnCours && contratEnCours.etape.lieu === id ? contratEnCours : null);
  const nomLieu = (l: string) => trouverLieu(c, l)?.lieu.nom ?? l;

  // ───────────── Ce qui est ouvert sous le décor ─────────────
  let pnjChoisi = $state<string | null>(null);
  /** Pièce affichée : la salle du lieu, ou la chambre de l'auberge (à l'étage). */
  let piece = $state<'salle' | 'chambre'>('salle');
  let boutiqueOuverte = $state(false);
  let contratsOuverts = $state(false);
  let litOuvert = $state(false);
  let panneaux = $state<HTMLElement | null>(null);
  /** Cadre d'informations en bas de l'écran : replié (une ligne) ou déplié. */
  let detailsOuverts = $state(lirePreference('lieu-details', false));
  $effect(() => ecrirePreference('lieu-details', detailsOuverts));
  /** La proposition de repos en cours a été mise de côté (la fenêtre du lit est fermée). */
  let reposCache = $state(false);
  $effect(() => { void id; pnjChoisi = null; piece = 'salle'; boutiqueOuverte = false; contratsOuverts = false; litOuvert = false; });
  $effect(() => { if (!etat.repos) reposCache = false; });
  // une proposition de repos en cours se règle dans la chambre
  $effect(() => { if (etat.repos && lieu.auberge) piece = 'chambre'; });
  const scenesPnj = $derived(pnjChoisi ? scenes.filter((s) => s.pnj === pnjChoisi) : []);
  const symbole = (m: Marqueur | null) => (m === 'rendre' ? '?' : m ? '!' : '');
  const titreSymbole = (m: Marqueur | null) => (m === 'principale' ? 'Quête principale' : m === 'rendre' ? 'Quête à rendre' : m ? 'Quête secondaire' : '');
  /** Avant un combat bien trop fort pour le groupe (rouge), on demande une confirmation. */
  function tropFort(niveau: number | null): boolean {
    if (niveau === null) return false;
    const groupe = niveauGroupe(etat);
    return couleurNiveau(niveau, groupe) === 'rouge' && !confirm(`${aideNiveau(niveau, groupe)}\n\nY aller quand même ?`);
  }
  function lancer(s: Scene) {
    if (sceneAvecCombat(s) && tropFort(niveauScene(c, s))) return;
    jeu.agir({ type: 'lancer_scene', scene: s.id });
  }
  function combatDuContrat() {
    if (etapeIci && tropFort(etapeIci.contrat.niveau)) return;
    jeu.agir({ type: 'etape_contrat' });
  }
  const etiquetteScene = (s: Scene) => (s.rend_quete ? 'Quête à rendre' : s.quete ? (c.quetes[s.quete].type === 'principale' ? 'Quête principale' : 'Quête secondaire') : '');
  /** Objets mystérieux pas encore identifiés, que le héros possède ou que les boutiques accessibles vendent. */
  const mysteres = $derived.by(() => {
    const vus = new Set<string>(Object.entries(h.inventaire).filter(([, n]) => n > 0).map(([o]) => o));
    for (const l of Object.values(c.regions).flatMap((r) => r.lieux)) if (conditionScene(c, etat, l.disponible_si, tous)) for (const o of l.boutique) vus.add(o);
    return [...vus].filter((o) => c.objets[o]?.mystere && !objetConnu(c, etat, o)).sort();
  });
  /** Quelque chose vient de s'ouvrir dans le cadre du bas (discussion, contrats…) : on le déplie et on remonte en haut. */
  async function montrerPanneaux() { detailsOuverts = true; await tick(); panneaux?.scrollTo({ top: 0, behavior: 'smooth' }); }

  // ───────────── Le décor : PNJ et zones cliquables ─────────────
  const decor = $derived(piece === 'chambre' ? 'auberge-chambre' : lieu.decor);
  /** Décor sans fichier de positions (nouvelles régions, en attendant le graphiste) : zones par défaut. */
  const DEFAUTS: Record<string, { x: number; y: number }> = { tableau: { x: 1060, y: 300 }, escalier: { x: 1130, y: 420 }, porte: { x: 120, y: 470 }, lit: { x: 640, y: 470 } };
  const positions = $derived(positionsImage(`decors/${decor}`) ?? DEFAUTS);
  const avantPlan = $derived(avantPlanDecor(decor));
  /** Le gérant tient la boutique : s'il est absent (ou non défini), la boutique reste accessible directement. */
  const gerantPresent = $derived(!!lieu.gerant && pnj.some((p) => p.id === lieu.gerant));

  /** PNJ de la salle avec le point au sol où poser leurs pieds, triés du fond vers l'avant. */
  const persos = $derived.by(() => {
    if (piece !== 'salle') return [];
    const places = pnj.map((p) => ({ id: p.id, pos: positions[p.id] ?? p.position ?? null as { x: number; y: number } | null }));
    // sans position connue : un emplacement libre au sol, sans chevaucher les autres
    const emplacements = [640, 440, 840, 260, 1020, 540, 740, 340, 940, 160, 1120];
    for (const p of places) {
      if (p.pos) continue;
      const libre = emplacements.find((x) => !places.some((q) => q.pos && Math.abs(q.pos.x - x) < 110 && Math.abs(q.pos.y - 620) < 150)) ?? 640;
      p.pos = { x: libre, y: 620 };
    }
    return places.map((p) => ({ id: p.id, x: p.pos!.x, y: p.pos!.y })).sort((a, b) => a.y - b.y);
  });
  /** On parle à un personnage : une petite bulle s'ouvre près de lui (le cadre du bas reste comme il est). */
  function parler(p: string) { pnjChoisi = p; boutiqueOuverte = false; examenOuvert = false; identifierOuvert = false; }
  let examenOuvert = $state(false);
  let identifierOuvert = $state(false);
  /** Place de la bulle dans le décor (en %) : au-dessus de la tête, ou sous les pieds si la tête est trop haute. */
  const bulle = $derived.by(() => {
    const p = persos.find((x) => x.id === pnjChoisi);
    if (!p) return null;
    const tete = ((p.y - TAILLE_PNJ_DECOR.h) / 720) * 100;
    const dessous = tete < 42;
    return { x: Math.min(80, Math.max(20, (p.x / 1280) * 100)), y: dessous ? (p.y / 720) * 100 : tete, dessous };
  });
  /** Un clic sur le décor lui-même (pas sur un personnage ni une zone) referme la bulle. */
  function clicDecor(e: MouseEvent) { if (e.target === e.currentTarget) pnjChoisi = null; }

  interface Zone { cle: string; nom: string; x: number; y: number; l: number; h: number; action: () => void }
  const aFaireIci = $derived(!!etapeIci || scenesSurPlace.length > 0);
  /** Zones cliquables du décor (invisibles ; un contour apparaît au survol). Positions : centre de la zone, dans le JSON du décor. */
  const zones = $derived.by((): Zone[] => {
    const res: Zone[] = [];
    const ajouter = (cle: string, nom: string, l: number, hz: number, action: () => void) => {
      const p = positions[cle];
      if (p) res.push({ cle, nom, x: p.x, y: p.y, l, h: hz, action });
    };
    if (piece === 'chambre') {
      ajouter('lit', 'Le lit : dormir', 300, 190, () => { litOuvert = true; void montrerPanneaux(); });
      ajouter('porte', 'Redescendre dans la salle', 120, 230, () => { piece = 'salle'; litOuvert = false; });
      return res;
    }
    if (lieu.auberge) {
      const monter = () => { piece = 'chambre'; pnjChoisi = null; boutiqueOuverte = false; };
      ajouter('escalier', 'Monter à la chambre', 240, 300, monter);
      ajouter('porte_chambre', 'Monter à la chambre', 110, 170, monter);
    }
    ajouter('sortie', 'Sortir', 100, 200, retour);
    if (!lieu.auberge) ajouter('porte', 'Sortir', 120, 230, retour);
    if (contrats.length) ajouter('tableau', 'Tableau des contrats', 200, 190, () => { contratsOuverts = true; void montrerPanneaux(); });
    // entrées et points d'intérêt : actifs seulement quand il y a quelque chose à faire ici
    if (aFaireIci) {
      for (const [cle, nom] of [['entree', 'Entrer'], ['grille', 'Descendre'], ['trappe', 'Examiner la trappe'], ['empreintes', 'Examiner les empreintes'], ['taniere', 'Approcher'], ['sillons', 'Examiner les sillons'], ['centre', 'Avancer'], ['cercle', 'Avancer']] as const) {
        ajouter(cle, nom, 220, 220, () => void montrerPanneaux());
      }
    }
    return res;
  });
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
</script>

{#snippet boutonScene(s: Scene, verbe: string)}
  <div class="item">
    <div class="ligne entre">
      <span>{s.titre}{#if etiquetteScene(s)} <span class="badge or">{etiquetteScene(s)}</span>{/if}{#if niveauScene(c, s) !== null} <NiveauConseille niveau={niveauScene(c, s)!} />{/if}</span>
      <button class="principal" onclick={() => lancer(s)}>{verbe}</button>
    </div>
    {#if s.type === 'groupe'}
      <p class="discret">Scène de groupe : tous les héros y participent et les choix sont votés.
        {#if absents.length}<br /><strong class="alerte">Il manque : {absents.join(' ; ')}.</strong> Attendez-les, ou lancez la scène sans eux.{/if}</p>
    {:else}
      <p class="discret">Scène pour {h.nom} seul.</p>
    {/if}
  </div>
{/snippet}

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && pnjChoisi && !boutiqueOuverte && !examenOuvert && !identifierOuvert) pnjChoisi = null; }} />
<section class="lieu">
  <Cadre169>
    <div class="decor pixel" role="presentation" onclick={clicDecor} data-decor={decor} style={`background-image:url(${imageDecor(decor, piece === 'chambre' ? 'Chambre du Chaudron Fêlé' : lieu.nom)})`}>
    {#each zones as z (z.cle)}
      <button class="zone" data-zone={z.cle} style={`left:${pct(z.x, 1280)}; top:${pct(z.y, 720)}; width:${pct(z.l, 1280)}; height:${pct(z.h, 720)}`} title={z.nom} aria-label={z.nom} onclick={z.action}><span class="etiquette">{z.nom}</span></button>
    {/each}
    {#each persos as p (p.id)}
      {@const m = marqueurPnj(c, etat, id, p.id, h.id)}
      <button class={`perso ${m ?? ''}`} class:choisi={pnjChoisi === p.id} data-pnj={p.id}
        style={`left:${pct(p.x, 1280)}; top:${pct(p.y, 720)}; width:${pct(TAILLE_PNJ_DECOR.l, 1280)}; height:${pct(TAILLE_PNJ_DECOR.h, 720)}; z-index:${10 + Math.round(p.y / 10)}`}
        aria-label={`Parler à ${nomPnj(p.id)}${m ? ` (${titreSymbole(m)})` : ''}`} onclick={() => parler(p.id)}>
        <img class="pixel" src={imagePnjDecor(p.id)} alt="" draggable="false" />
        {#if m}<span class="symbole" title={titreSymbole(m)}>{symbole(m)}</span>{/if}
        <span class="etiquette">{nomPnj(p.id)}</span>
      </button>
    {/each}
    {#if avantPlan}<img class="avant-plan pixel" src={avantPlan} alt="" draggable="false" />{/if}
    </div>
    {#if pnjChoisi && bulle}
      {@const fiche = c.pnj[pnjChoisi]}
      <div class="bulle carte-ui" class:dessous={bulle.dessous} style={bulle.dessous ? `left:${bulle.x}%; top:${bulle.y}%` : `left:${bulle.x}%; bottom:${100 - bulle.y}%`} role="dialog" aria-label={`Discussion avec ${nomPnj(pnjChoisi)}`}>
        <div class="ligne entre tete-bulle">
          <div class="ligne">
            <img class="tete pixel" src={portraitPersonnage(c, pnjChoisi)} alt="" />
            <div><h3>{nomPnj(pnjChoisi)}</h3><p class="discret">{fiche?.titre ?? c.compagnons[pnjChoisi]?.titre ?? ''}</p></div>
          </div>
          <button class="fermer-bulle" aria-label="Fermer" onclick={() => (pnjChoisi = null)}>✕</button>
        </div>
        {#if fiche?.accueil && pnjChoisi === lieu.gerant}<p class="accueil">« {fiche.accueil} »</p>{/if}
        {#each scenesPnj as s (s.id)}
          <div class="ligne entre item-bulle">
            <span>{s.titre}{#if etiquetteScene(s)} <span class="badge or">{etiquetteScene(s)}</span>{/if}{#if niveauScene(c, s) !== null} <NiveauConseille niveau={niveauScene(c, s)!} />{/if}</span>
            <button class="principal" onclick={() => lancer(s)}>Lui parler</button>
          </div>
          {#if s.type === 'groupe' && absents.length}<p class="discret alerte">Il manque : {absents.join(' ; ')}.</p>{/if}
        {/each}
        {#if pnjChoisi === lieu.gerant && lieu.boutique.length}
          <button class:principal={!scenesPnj.length} onclick={() => (boutiqueOuverte = true)}>🛒 Voir la marchandise</button>
        {/if}
        {#if estExaminateur(c, id, pnjChoisi)}
          <button class:principal={!scenesPnj.length} onclick={() => (examenOuvert = true)}>🎖 Examen de rang{#if examen?.pret} <span class="badge or">prêt</span>{/if}</button>
        {/if}
        {#if fiche?.identifie !== undefined}
          <button onclick={() => (identifierOuvert = true)}>🔎 Faire identifier un objet</button>
        {/if}
        {#if !scenesPnj.length && !(pnjChoisi === lieu.gerant && lieu.boutique.length) && !estExaminateur(c, id, pnjChoisi) && fiche?.identifie === undefined}
          <p>{nomPnj(pnjChoisi)} n'a rien de particulier à vous dire pour le moment.</p>
          {#if c.compagnons[pnjChoisi] && etat.compagnonsRencontres.includes(pnjChoisi)}
            <p class="discret">Palier : {palierCompagnon(c, etat, h.id, pnjChoisi).nom}. Offrez-lui un cadeau depuis le menu « Compagnons ».</p>
          {/if}
        {/if}
      </div>
    {/if}
  </Cadre169>
  <button class="petit retour" onclick={() => (piece === 'chambre' ? (piece = 'salle') : retour())}>← {piece === 'chambre' ? 'La salle' : lieu.ville ? 'Plan de la ville' : 'Carte'}</button>

  <!-- cadre d'informations en bas : une ligne repliée (le nom du lieu), dépliable -->
  <div class="cadre-bas" class:ouvert={detailsOuverts}>
    <button class="entete-cadre" aria-expanded={detailsOuverts} onclick={() => (detailsOuverts = !detailsOuverts)}>
      <h2>{piece === 'chambre' ? 'La chambre' : lieu.nom}</h2>
      <span class="bascule">{detailsOuverts ? '▾ Réduire' : '▴ Détails'}</span>
    </button>
    {#if detailsOuverts}
      <div class="corps-cadre" bind:this={panneaux}>
        <p>{piece === 'chambre' ? 'Une chambre simple sous les toits. Les mois ne passent que si vous dormez ici, tous d\'accord.' : lieu.description}</p>
      {#if persos.length || zones.length}
        <details class="presents">
          <summary>Personnes présentes et endroits ({persos.length + zones.length})</summary>
          <div class="ligne">
            {#each persos as p (p.id)}
              {@const m = marqueurPnj(c, etat, id, p.id, h.id)}
              <button class="petit" onclick={() => parler(p.id)}>{#if m}<strong class={`sym ${m}`}>{symbole(m)}</strong> {/if}Parler à {nomPnj(p.id)}</button>
            {/each}
            {#each zones as z (z.cle)}<button class="petit" onclick={z.action}>{z.nom}</button>{/each}
          </div>
        </details>
      {/if}

      <div>
        {#if etapeIci}
          <div class="carte-ui contrat-etape">
            <h3>📜 Contrat : {etapeIci.contrat.titre} <span class="badge or">étape {etapeIci.numero}/{etapeIci.total}</span> <NiveauConseille niveau={etapeIci.contrat.niveau} /></h3>
            {#each etapeIci.notes as n, i (i)}<p class="discret">{n}</p>{/each}
            <p>{etapeIci.etape.texte}</p>
            {#if etapeIci.etape.choix.length}
              <div class="reponses">
                {#each etapeIci.etape.choix as ch, i (i)}<button onclick={() => jeu.agir({ type: 'etape_contrat', choix: i })}>{ch.texte}</button>{/each}
              </div>
            {:else if etapeIci.etape.combat}
              <button class="principal" onclick={combatDuContrat}>⚔ {etapeIci.etape.bouton ?? 'Engager le combat'}</button>
            {:else if etapeIci.etape.test}
              <button class="principal" onclick={() => jeu.agir({ type: 'etape_contrat' })}>{etapeIci.etape.bouton ?? 'Tenter'} ({etapeIci.etape.test.carac}, difficulté {etapeIci.etape.test.difficulte})</button>
            {:else}
              <button class="principal" onclick={() => jeu.agir({ type: 'etape_contrat' })}>{etapeIci.etape.bouton ?? 'Continuer'}</button>
            {/if}
          </div>
        {/if}

        {#if lieu.auberge && piece === 'chambre' && !litOuvert && !etat.repos}<div class="item"><button onclick={() => (litOuvert = true)}>🛏 Aller au lit</button></div>{/if}

        <div class="grille colonnes">
          {#if scenesSurPlace.length && piece === 'salle'}
            <div class="carte-ui">
              <h3>Sur place</h3>
              {#each scenesSurPlace as s (s.id)}{@render boutonScene(s, s.type === 'groupe' ? 'Y aller ensemble' : 'Y aller')}{/each}
            </div>
          {/if}
          {#if contrats.length && contratEnCours && !contratsOuverts}
            <div class="carte-ui">
              <p><strong>📜 Contrat en cours : {contratEnCours.contrat.titre}</strong> <span class="badge or">étape {contratEnCours.numero}/{contratEnCours.total}</span></p>
              <p>➤ {contratEnCours.etape.objectif} <span class="badge">📍 {nomLieu(contratEnCours.etape.lieu)}</span></p>
            </div>
          {/if}
          {#if contrats.length && contratsOuverts}
            <div class="carte-ui" data-panneau="contrats">
              <div class="ligne entre"><h3>Tableau des contrats <span class="badge">votre rang : {rang}</span></h3><button class="petit" onclick={() => (contratsOuverts = false)}>Fermer ✕</button></div>
              {#if contratEnCours}
                <div class="item en-cours">
                  <p><strong>En cours : {contratEnCours.contrat.titre}</strong> <span class="badge or">étape {contratEnCours.numero}/{contratEnCours.total}</span></p>
                  <p>➤ {contratEnCours.etape.objectif} <span class="badge">📍 {nomLieu(contratEnCours.etape.lieu)}</span></p>
                  <button class="petit danger" onclick={() => confirm('Abandonner ce contrat ? Il faudra le reprendre depuis le début.') && jeu.agir({ type: 'abandonner_contrat' })}>Abandonner</button>
                </div>
              {/if}
              <p class="discret">Un contrat se joue en plusieurs étapes sur la carte : le prochain lieu clignote. On revient ici toucher la récompense. Un seul contrat à la fois.</p>
              {#each contrats as ct (ct.id)}
                <div class="item">
                  <div class="ligne"><strong>{ct.titre}</strong><span class="badge">rang {ct.rang_min}</span><NiveauConseille niveau={ct.niveau} />{#if ct.etapes.length}<span class="badge">{ct.etapes.length} étapes</span>{/if}</div>
                  <p class="discret">{ct.description} Récompense : {ct.recompenses.or} or, {ct.recompenses.xp} XP, {ct.recompenses.points_guilde} pts de guilde.</p>
                  {#if couleurNiveau(ct.niveau, niveauGroupe(etat)) !== 'vert'}<p class={`aide-niveau ${couleurNiveau(ct.niveau, niveauGroupe(etat))}`}>{aideNiveau(ct.niveau, niveauGroupe(etat))}</p>{/if}
                  <button disabled={ordre.indexOf(rang) < ordre.indexOf(ct.rang_min) || !!contratEnCours} title={contratEnCours ? "Terminez d'abord votre contrat en cours" : ''} onclick={() => jeu.agir({ type: 'contrat', contrat: ct.id })}>Accepter (en solo)</button>
                </div>
              {/each}
            </div>
          {/if}
          {#if estGuilde(id)}
            <details class="carte-ui">
              <summary><strong>📖 Fusions que la Guilde peut vous enseigner</strong> ({fusions.length})</summary>
              <p class="discret">Uniquement les fusions de votre classe et de vos compétences. Ce que vous apprenez va dans votre grimoire personnel : les autres joueurs ne le voient pas.</p>
              {#each fusions as f (f.technique.id)}
                <div class="item">
                  <p><CompetenceInfo comp={f.technique} rang={h.rangsCompetences[f.technique.parent] ?? 1} sujet={null} heros={h} /></p>
                  <button class="petit" disabled={!!f.probleme} onclick={() => jeu.agir({ type: 'apprendre_technique', technique: f.technique.id })}>Apprendre</button>
                  {#if f.probleme}<small class="discret"> {f.probleme}</small>{/if}
                </div>
              {:else}
                <p class="discret">Aucune fusion à apprendre pour l'instant : il faut deux compétences d'éléments différents.</p>
              {/each}
            </details>
          {/if}
          {#if lieu.boutique.length && !gerantPresent && piece === 'salle'}<div class="carte-ui"><button class="principal" onclick={() => (boutiqueOuverte = true)}>🛒 Voir la marchandise</button></div>{/if}
        </div>
      </div>
      {#if !scenes.length && !contrats.length && !lieu.boutique.length && !pnj.length && !etapeIci}
        <p class="discret">Rien de particulier à faire ici pour le moment.</p>
      {:else if persos.length}
        <p class="discret">Cliquez sur un personnage du décor pour lui parler.{#if gerantPresent && lieu.boutique.length}{' '}La boutique s'ouvre en parlant à {nomPnj(lieu.gerant!)}.{/if}</p>
      {/if}
      </div>
    {/if}
  </div>

  {#if boutiqueOuverte && lieu.boutique.length}
    <Fenetre titre={`Boutique — ${lieu.gerant ? nomPnj(lieu.gerant) : lieu.nom}`} fermer={() => (boutiqueOuverte = false)}><Boutique lieu={id} objets={lieu.boutique} /></Fenetre>
  {/if}
  {#if examenOuvert && pnjChoisi && estExaminateur(c, id, pnjChoisi)}
    <Fenetre titre={`🎖 Rang de Guilde : ${rang}`} fermer={() => (examenOuvert = false)}>
            <div class="examen" data-panneau="examen">
              
              {#if examen}
                <p>Rang suivant : <strong>{examen.rang}</strong>. Il faut
                  <span class:ok={examen.points >= examen.pointsRequis}>{examen.pointsRequis} points de Guilde ({examen.points})</span>,
                  <span class:ok={h.niveau >= examen.niveauRequis}>le niveau {examen.niveauRequis} ({h.niveau})</span>,
                  puis réussir {examen.type === 'epreuve' ? 'une épreuve en plusieurs étapes, qui se termine par un combat' : examen.type === 'scene' ? 'une épreuve qui arrive pendant l\'histoire' : 'un combat contre un examinateur'}.</p>
                <p class="discret">Les points ne donnent plus le rang : ils ouvrent l'examen. Aucun danger au combat d'examen : ni blessure, ni or perdu. En cas d'échec, on revient le lendemain.</p>
                {#if examen.pret}
                  {#if avecMoi.length}<p class="discret">{avecMoi.join(', ')} {avecMoi.length > 1 ? 'sont prêts' : 'est prêt'} aussi : vous passerez le combat ensemble.</p>{/if}
                  <button class="principal" onclick={() => jeu.agir({ type: 'examen_rang' })}>{examen.type === 'epreuve' ? `Commencer l'épreuve du rang ${examen.rang}` : `⚔ Passer l'examen du rang ${examen.rang}`}</button>
                {:else}
                  <p class="aide-niveau orange">{examen.raison}</p>
                {/if}
              {:else}
                <p>Vous avez atteint le rang le plus haut de la Guilde.</p>
              {/if}
            </div>
    </Fenetre>
  {/if}
  {#if identifierOuvert && pnjChoisi && c.pnj[pnjChoisi]?.identifie !== undefined}
    {@const fiche = c.pnj[pnjChoisi]}
    {@const prixIdentification = fiche?.identifie ?? 0}
    <Fenetre titre="Faire identifier un objet" fermer={() => (identifierOuvert = false)}>
            <div>
              <h3>🔎 Faire identifier un objet <span class="badge or">{fiche.identifie} or</span></h3>
              <p class="discret">Un objet mystérieux affiche « ??? ». {nomPnj(pnjChoisi)} vous dit ce qu'il est vraiment, avant même de l'acheter. Une fois identifié, tout le groupe le sait.</p>
              {#each mysteres as o (o)}
                <div class="ligne item entre">
                  <ObjetInfo id={o} />
                  <button class="petit" disabled={h.or < prixIdentification} title={h.or < prixIdentification ? "Pas assez d'or" : ''} onclick={() => jeu.agir({ type: 'identifier', objet: o, pnj: pnjChoisi! })}>Identifier · {prixIdentification} or</button>
                </div>
              {:else}<p class="discret">Aucun objet mystérieux à identifier pour le moment.</p>{/each}
            </div>
    </Fenetre>
  {/if}  {#if lieu.auberge && piece === 'chambre' && (litOuvert || (etat.repos && !reposCache))}
    <Fenetre titre="Le lit" fermer={() => { litOuvert = false; reposCache = true; }}><Auberge bind:ouvert={litOuvert} /></Fenetre>
  {/if}
</section>

<style>
  .lieu { position: absolute; inset: 0; }
  .decor { position: absolute; inset: 0; isolation: isolate; background-size: 100% 100%; background-position: center; overflow: hidden; }
  .retour { position: absolute; z-index: 30; top: calc(max(0.3rem, env(safe-area-inset-top)) + 3rem); left: max(0.5rem, env(safe-area-inset-left)); min-height: 40px; background: #1d1928e6; }

  /* cadre d'informations en bas : replié, une seule ligne ; déplié, au plus un tiers de l'écran, défilement interne */
  .cadre-bas { position: absolute; z-index: 40; left: 50%; translate: -50% 0; bottom: max(0.4rem, env(safe-area-inset-bottom)); width: min(980px, calc(100% - 0.8rem)); display: flex; flex-direction: column;
    background: #14111cf0; border: 1px solid var(--bord); border-radius: var(--rayon); box-shadow: var(--ombre); backdrop-filter: blur(3px); }
  .cadre-bas.ouvert { border-color: var(--or); }
  .entete-cadre { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; min-height: 44px; padding: 0.3rem 0.8rem; background: none; border: none; border-radius: var(--rayon); text-align: left; }
  .entete-cadre:hover:not(:disabled) { background: #ffffff0a; }
  .entete-cadre h2 { margin: 0; font-size: clamp(1rem, 2.4vw, 1.3rem); }
  .bascule { color: var(--or-2); font-size: 0.9rem; white-space: nowrap; }
  .corps-cadre { max-height: 34dvh; overflow-y: auto; overscroll-behavior: contain; padding: 0 0.8rem 0.8rem; border-top: 1px solid var(--bord); }
  .corps-cadre > p:first-child { margin-top: 0.6rem; }

  /* bulle de discussion près du personnage (au-dessus de sa tête, ou sous ses pieds s'il est en haut du décor) */
  .bulle { position: absolute; z-index: 250; translate: -50% 0; width: min(340px, 90%); max-height: 62%; overflow-y: auto; overscroll-behavior: contain; display: grid; gap: 0.4rem; padding: 0.6rem 0.7rem; margin-bottom: 0.6rem; border-color: var(--or); background: #14111cf2; animation: bulle 0.15s ease-out; }
  .bulle.dessous { margin: 0.4rem 0 0; }
  .bulle h3, .bulle p { margin: 0.1em 0; }
  .bulle > button { min-height: 44px; text-align: left; }
  .tete-bulle { flex-wrap: nowrap; align-items: flex-start; }
  .tete-bulle .tete { width: 48px; height: 48px; }
  .fermer-bulle { min-width: 40px; min-height: 40px; padding: 0; flex: none; }
  .item-bulle { flex-wrap: nowrap; gap: 0.5rem; padding: 0.3rem 0; border-top: 1px solid var(--bord); }
  .item-bulle button { flex: none; min-height: 44px; }
  @keyframes bulle { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .bulle { animation: none; } }
  /* téléphone en portrait : l'image est petite, la bulle se place juste dessous, sur toute la largeur */
  @media (max-aspect-ratio: 1 / 1) {
    .bulle, .bulle.dessous { left: 50% !important; top: calc(100% + 0.4rem) !important; bottom: auto !important; width: calc(100vw - 1rem); max-height: calc(100dvh - 56.25vw - 8.5rem); margin: 0; }
  }
  @media (max-aspect-ratio: 1 / 1) { .corps-cadre { max-height: calc(100dvh - 56.25vw - 7.5rem); } }

  /* Zones et personnages : la zone cliquable est FIXE (centrée par des marges, jamais par transform),
     au moins 44 × 44 px ; les animations ne touchent que des éléments décoratifs à l'intérieur. */
  .zone, .perso { position: absolute; padding: 0; background: none; border: none; border-radius: 10px; min-width: 44px; min-height: 44px; cursor: pointer; }
  .zone:active, .perso:active, .zone:hover, .perso:hover { transform: none; background: none; }
  .zone { transform: translate(-50%, -50%); z-index: 5; border: 2px dashed transparent; }
  .zone:active:not(:disabled), .zone:hover:not(:disabled) { transform: translate(-50%, -50%); }
  .zone:hover, .zone:focus-visible { border-color: #ffd166aa; background: #ffd16618; }
  .perso { transform: translate(-50%, -100%); display: flex; justify-content: center; align-items: flex-end; }
  .perso:active:not(:disabled), .perso:hover:not(:disabled) { transform: translate(-50%, -100%); }
  .perso img { height: 100%; width: auto; max-width: none; display: block; pointer-events: none; transition: filter 0.15s; }
  .perso:hover img, .perso:focus-visible img, .perso.choisi img { filter: brightness(1.25) drop-shadow(0 0 4px #ffd166); }
  .etiquette { position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); margin-bottom: 2px; white-space: nowrap; font-size: clamp(0.65rem, 1.4vw, 0.85rem); background: #1b1308e6; color: #f3ead7; padding: 0.05em 0.5em; border-radius: 4px; opacity: 0; pointer-events: none; transition: opacity 0.15s; }
  .zone .etiquette { bottom: auto; top: 50%; transform: translate(-50%, -50%); margin: 0; }
  .zone:hover .etiquette, .zone:focus-visible .etiquette, .perso:hover .etiquette, .perso:focus-visible .etiquette, .perso.choisi .etiquette { opacity: 1; }
  .symbole { position: absolute; left: 50%; bottom: 100%; margin-left: -0.3em; font-weight: 900; font-size: clamp(1.1rem, 3vw, 1.7rem); line-height: 1; text-shadow: 0 0 3px #000, 0 0 3px #000; animation: saut 1.2s infinite; pointer-events: none; }
  .perso:hover .symbole, .perso:focus-visible .symbole, .perso.choisi .symbole { margin-bottom: 1.3em; }
  .principale .symbole, .sym.principale { color: var(--or-2); }
  .secondaire .symbole, .sym.secondaire { color: #d5dbe6; }
  .rendre .symbole, .sym.rendre { color: #9fd3ff; }
  .avant-plan { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 200; pointer-events: none; }

  .presents { margin-bottom: 0.6rem; }
  .presents summary { cursor: pointer; color: var(--texte-2); }
  .presents .ligne { margin-top: 0.4rem; flex-wrap: wrap; }
  .tete { width: 64px; height: 64px; border-radius: 8px; border: 2px solid var(--or); object-fit: cover; object-position: top; background: var(--fond); flex: none; }
  .accueil { font-style: italic; color: var(--or-2); }
  .contrat-etape { border-color: var(--or); margin-bottom: 0.8rem; }
  .reponses { display: grid; gap: 0.4rem; }
  .reponses button { text-align: left; }
  .en-cours { border: 1px solid var(--or); border-radius: 8px; padding: 0.5rem 0.7rem; margin-bottom: 0.5rem; }
  .entre { justify-content: space-between; }
  .alerte { color: #ffb4a8; }
  .aide-niveau { font-size: 0.85rem; }
  .examen { border-color: var(--or); margin-bottom: 0.8rem; }
  .examen .ok { color: var(--vert); }
  .aide-niveau.orange { color: #f2a33a; }
  .aide-niveau.rouge { color: var(--rouge); }
  .colonnes { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .item { padding: 0.4rem 0; border-bottom: 1px solid var(--bord); }
  .item:last-of-type { border-bottom: none; }
  .item p { margin: 0.2em 0; }
  details.carte-ui summary { cursor: pointer; }
  @keyframes saut { 50% { transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) { .symbole { animation: none; } }
</style>
