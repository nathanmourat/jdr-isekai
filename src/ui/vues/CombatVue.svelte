<script lang="ts">
  /**
   * Écran de combat. Le moteur a déjà tout calculé (avec le hasard à graine) : cet écran ne fait que RÉVÉLER
   * les événements petit à petit — suspense avant le résultat d'une action, délai avant la riposte des ennemis.
   */
  import { jeu } from '../jeu.svelte';
  import PhaserHote from '../PhaserHote.svelte';
  import ActionsLibres from './ActionsLibres.svelte';
  import { utiliseMana, type SceneCombat } from '../../rendu/SceneCombat';
  import { actionsDisponibles, estimerAction, NOMS_ETATS, type ActionCombat, type Combat, type Combattant, type EvenementCombat } from '../../moteur/combat';
  import type { Competence } from '../../contenu/schemas';
  import { etapeContrat } from '../../moteur/partie';
  import { ecrirePreference, lirePreference } from '../preferences';

  let { cle }: { cle: string } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const entree = $derived(etat.combats[cle]);
  const combat = $derived(entree.combat);

  // ───────────── Révélation progressive des événements ─────────────
  /** Nombre d'événements déjà montrés au joueur. */
  let revele = $state(0);
  let enLecture = $state(false);
  let suspense = $state<{ nom: string; action: string; chance: number | null; resultat: 'reussi' | 'critique' | 'rate' | null } | null>(null);
  let combatSuivi = '';
  $effect(() => {
    if (combat.id === combatSuivi) return;
    combatSuivi = combat.id;
    // un combat qui vient de commencer se joue depuis le début ; un combat repris est montré tel quel
    revele = combat.tour <= 1 ? 0 : combat.evenements.length;
  });
  $effect(() => {
    const n = combat.evenements.length;
    if (revele > n) revele = n; // tour annulé (Second départ)
    else if (revele < n && !enLecture) void lire();
  });
  const attendre = (ms: number) => new Promise<void>((ok) => setTimeout(ok, ms));
  const evenementsActuels = (): EvenementCombat[] => jeu.etat?.combats[cle]?.combat.evenements ?? [];
  const combattantActuel = (id?: string) => (id ? jeu.etat?.combats[cle]?.combat.combattants.find((x) => x.id === id) : undefined);

  async function lire() {
    enLecture = true;
    try {
      for (let garde = 0; garde < 500; garde++) {
        const evts = evenementsActuels();
        if (revele >= evts.length) break;
        const rapide = jeu.animationsRapides;
        const debut = revele;
        let fin = debut + 1;
        while (fin < evts.length && evts[fin].type !== 'action') fin++;
        const premier = evts[debut];
        if (premier.type === 'action') {
          const src = combattantActuel(premier.source);
          const issue = evts.slice(debut + 1, fin).find((e) => (e.type === 'degats' || e.type === 'rate') && e.source === premier.source);
          // riposte : un temps de respiration avant chaque ennemi (de 0,8 à 1,2 seconde)
          if (src?.camp === 'ennemis') await attendre(rapide ? 250 : 800 + ((debut * 137) % 401));
          revele = debut + 1; // le personnage lance son attaque
          if (issue && src?.type === 'heros') {
            // suspense : la jauge monte vers la chance annoncée, puis le résultat du moteur est révélé
            suspense = { nom: src.nom, action: premier.competence === 'attaque' ? 'Attaque' : nomCompetence(src, premier.competence), chance: issue.chance ?? null, resultat: null };
            await attendre(rapide ? 250 : 1000);
            if (suspense) suspense.resultat = issue.type === 'rate' ? 'rate' : issue.critique ? 'critique' : 'reussi';
            await attendre(rapide ? 200 : 550);
            suspense = null;
          } else await attendre(rapide ? 120 : 380);
        }
        revele = Math.min(fin, evenementsActuels().length);
        await attendre(rapide ? 100 : 320);
      }
    } finally {
      enLecture = false;
      suspense = null;
    }
  }
  function nomCompetence(x: Combattant, id?: string) {
    if (!id) return 'Action';
    return x.competencesPropres.find((k) => k.id === id)?.nom ?? c.competences[id]?.nom ?? c.objets[id]?.nom ?? 'Action';
  }

  /** Le combat tel que le joueur le voit : les événements pas encore révélés ne sont pas appliqués. */
  const vu = $derived.by((): Combat => {
    const reste = combat.evenements.slice(revele);
    if (!reste.length) return combat;
    const combattants = combat.combattants
      .filter((x) => !reste.some((e) => e.type === 'invocation' && e.cible === x.id))
      .map((x) => {
        let pv = x.pv;
        for (const e of reste) {
          if (e.cible !== x.id || e.valeur === undefined) continue;
          if (e.type === 'degats') pv += e.valeur; else if (e.type === 'soin') pv -= e.valeur;
        }
        const koCache = reste.some((e) => e.type === 'ko' && e.cible === x.id);
        const fuiteCachee = reste.some((e) => e.type === 'fuite' && e.cible === x.id);
        pv = Math.max(koCache ? 1 : 0, Math.min(x.pvMax, pv));
        // un état posé par un événement pas encore révélé ne s'affiche pas avant lui
        const etats = x.etats.filter((s) => !reste.some((e) => e.type === 'etat' && e.cible === x.id && e.etat === s.id));
        return { ...x, pv, etats, ko: x.ko && !koCache, parti: x.parti && !fuiteCachee && !koCache };
      });
    return { ...combat, combattants, evenements: combat.evenements.slice(0, revele) };
  });
  const termine = $derived(revele >= combat.evenements.length && !enLecture);

  const acteur = $derived(combat.enAttente ? combat.combattants.find((x) => x.id === combat.enAttente) ?? null : null);
  const monTour = $derived(!!acteur && !!acteur.joueurId && jeu.joueursLocaux.includes(acteur.joueurId));
  const dispo = $derived(acteur && monTour ? actionsDisponibles(c, combat, acteur.id) : null);
  let selection = $state<{ type: 'attaque' } | { type: 'competence'; comp: Competence } | { type: 'potion' } | { type: 'pacifier' } | { type: 'sac'; item: string; cible: string } | null>(null);
  let scene: SceneCombat | null = null;
  /** Panneau d'actions replié, volet du journal ouvert (affichage seulement, propre à cet appareil). */
  let actionsReduites = $state(lirePreference('combat-actions-reduites', false));
  let journalOuvert = $state(lirePreference('combat-journal', false));
  $effect(() => ecrirePreference('combat-actions-reduites', actionsReduites));
  $effect(() => ecrirePreference('combat-journal', journalOuvert));

  const cibles = $derived.by((): string[] => {
    if (!dispo || !acteur || !selection) return [];
    if (selection.type === 'attaque') return acteur.attaque.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance;
    if (selection.type === 'potion') return dispo.allies;
    if (selection.type === 'sac') return selection.cible === 'allie' ? dispo.allies : selection.cible === 'allie_ko' ? dispo.alliesKo : selection.cible === 'ennemi' ? dispo.ciblesDistance : [];
    if (selection.type === 'pacifier') return dispo.pacifier;
    const k = selection.comp;
    if (k.cible === 'ennemi') return k.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance;
    if (k.cible === 'allie') return dispo.allies;
    if (k.cible === 'allie_ko') return dispo.alliesKo;
    return [];
  });

  /**
   * Décor du lieu où le combat a commencé (fond de secours si le vrai fond de combat n'existe pas encore) :
   * décor de la scène qui a lancé le combat, sinon décor du lieu de l'étape de contrat en cours.
   */
  const decorLieu = $derived.by((): string | null => {
    const ctx = entree.contexte;
    const sc = ctx.sceneCle ? etat.scenes[ctx.sceneCle] : undefined;
    if (sc) return c.scenes[sc.sceneId]?.decor ?? null;
    const etape = etat.heros[cle] ? etapeContrat(c, etat, cle) : null;
    if (etape) return Object.values(c.regions).flatMap((r) => r.lieux).find((l) => l.id === etape.etape.lieu)?.decor ?? null;
    return null;
  });
  $effect(() => {
    void decorLieu;
    scene?.afficher(vu, {
      echelle: c.config.graphismes.echelle_combat ?? 3,
      tailleCombat: c.config.graphismes.taille_sprite_combat ?? 64,
      tailleBoss: c.config.graphismes.taille_sprite_boss ?? 128,
      tailleExploration: c.config.graphismes.taille_sprite_exploration ?? 32,
      ciblesCliquables: termine ? cibles : [],
      actif: termine ? combat.enAttente : null,
      surClic: (id) => { if (termine && cibles.includes(id)) viser(id); },
      contenu: c,
      decorLieu,
    });
  });
  $effect(() => { void combat.enAttente; selection = null; });

  function envoyer(action: ActionCombat) {
    selection = null;
    jeu.agir({ type: 'combat', joueur: acteur!.joueurId!, cle, action });
  }
  function choisir(sel: NonNullable<typeof selection>) {
    // sans cible à choisir : on joue tout de suite
    if (sel.type === 'competence' && !['ennemi', 'allie', 'allie_ko'].includes(sel.comp.cible)) return envoyer({ type: 'competence', acteur: acteur!.id, competence: sel.comp.id });
    selection = sel;
  }
  /** Objet du sac : sans cible à choisir (soi, tout le groupe, tous les ennemis), il part tout de suite. */
  function utiliserDuSac(item: string, cible: string) {
    if (cible === 'allie' || cible === 'allie_ko' || cible === 'ennemi') selection = { type: 'sac', item, cible };
    else envoyer({ type: 'objet', acteur: acteur!.id, objet: 'potion', item });
  }
  function viser(id: string) {
    if (!selection || !acteur) return;
    if (selection.type === 'attaque') envoyer({ type: 'attaque', acteur: acteur.id, cible: id });
    else if (selection.type === 'potion') envoyer({ type: 'objet', acteur: acteur.id, objet: 'potion', cible: id });
    else if (selection.type === 'sac') envoyer({ type: 'objet', acteur: acteur.id, objet: 'potion', item: selection.item, cible: id });
    else if (selection.type === 'pacifier') envoyer({ type: 'pacifier', acteur: acteur.id, cible: id });
    else envoyer({ type: 'competence', acteur: acteur.id, competence: selection.comp.id, cible: id });
  }
  /** Chiffres réels d'une compétence contre la première cible possible (calculés par le moteur). */
  function reel(k: Competence) {
    if (!acteur || !dispo) return null;
    const cible = k.cible === 'ennemi' ? (k.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance)[0] : undefined;
    const e = estimerAction(c, combat, { type: 'competence', acteur: acteur.id, competence: k.id, cible });
    return e.possible ? { degats: e.degats, reussite: e.reussite } : null;
  }
  /** Chance de réussite de l'action choisie contre une cible précise (affichée avant de valider). */
  function chanceSur(id: string): string {
    if (!selection || !acteur || selection.type === 'potion' || selection.type === 'pacifier' || selection.type === 'sac') return '';
    const action: ActionCombat = selection.type === 'attaque' ? { type: 'attaque', acteur: acteur.id, cible: id } : { type: 'competence', acteur: acteur.id, competence: selection.comp.id, cible: id };
    const e = estimerAction(c, combat, action);
    return e.possible && e.reussite !== null ? ` · ${Math.round(e.reussite * 100)} % de réussite${e.degats ? `, ${e.degats[0]}–${e.degats[1]} dégâts` : ''}` : '';
  }
  const pourcent = (x: number | null | undefined) => (x === null || x === undefined ? '' : `${Math.round(x * 100)} %`);
  const herosActeur = $derived(acteur?.herosId ? etat.heros[acteur.herosId] ?? null : null);
  const nom = (id: string) => combat.combattants.find((x) => x.id === id)?.nom ?? id;
  const etatsDe = (x: Combattant) => x.etats.map((e) => `${NOMS_ETATS[e.id]}${e.cumul > 1 ? ` ×${e.cumul}` : ''}${e.duree > 50 ? '' : ` (${e.duree} tour${e.duree > 1 ? 's' : ''})`}`).join(', ');
  const journal = $derived(vu.evenements.slice(-60).reverse());
  /** Dernière ligne du journal, affichée seule en haut de la scène. */
  const derniere = $derived(vu.evenements.length ? vu.evenements[vu.evenements.length - 1] : null);

  // ───────────── Barre d'actions compacte (test 3, point 3) ─────────────
  /** Détail de l'action survolée (souris) ou tenue appuyée (téléphone), affiché au-dessus des boutons. */
  let detail = $state<string | null>(null);
  let appui: ReturnType<typeof setTimeout> | null = null;
  let appuiLong = false;
  function survol(texte: string) { return { onpointerenter: (e: PointerEvent) => { if (e.pointerType === 'mouse') detail = texte; }, onpointerleave: (e: PointerEvent) => { if (e.pointerType === 'mouse') detail = null; },
    onpointerdown: (e: PointerEvent) => { if (e.pointerType === 'mouse') return; appuiLong = false; appui = setTimeout(() => { appuiLong = true; detail = texte; }, 450); },
    onpointerup: () => { if (appui) clearTimeout(appui); }, oncontextmenu: (e: Event) => e.preventDefault() }; }
  /** Un appui long montre le détail sans lancer l'action. */
  function siCourt(f: () => void) { return () => { if (appuiLong) { appuiLong = false; return; } detail = null; f(); }; }
  function detailComp(k: { comp: Competence; rang: number; raison: string | null }): string {
    const r = reel(k.comp);
    const bouts = [k.comp.description];
    if (k.comp.cout) bouts.push(`${k.comp.cout} mana`);
    if (r?.degats) bouts.push(`${r.degats[0]}–${r.degats[1]} dégâts`);
    if (r?.reussite !== null && r?.reussite !== undefined) bouts.push(`${pourcent(r.reussite)} de réussite`);
    if (k.comp.recharge) bouts.push(`recharge ${k.comp.recharge} tour${k.comp.recharge > 1 ? 's' : ''}`);
    if (k.raison) bouts.push(k.raison);
    return `${k.comp.nom}${k.rang > 1 ? ` ${k.rang}` : ''} : ${bouts.join(' · ')}`;
  }
  const iconeComp = (k: Competence) => (k.cible === 'allie' || k.cible === 'allie_ko' || k.cible === 'tous_allies' ? '✚' : k.cible === 'soi' ? '✧' : '✦');
  const detailAttaque = $derived.by(() => {
    if (!acteur || !dispo) return '';
    const cible = (acteur.attaque.portee === 'melee' ? dispo.ciblesMelee : dispo.ciblesDistance)[0];
    const e = cible ? estimerAction(c, combat, { type: 'attaque', acteur: acteur.id, cible }) : null;
    return `Attaque de base : fiable, sans mana${e?.degats ? ` · ${e.degats[0]}–${e.degats[1]} dégâts` : ''}${e?.reussite != null ? ` · ${pourcent(e.reussite)} de réussite` : ''}`;
  });
  /** Panneau « Proposer mon action » (texte libre et propositions de l'IA) : il se ferme dès que l'action est jouée. */
  let proposerOuvert = $state(false);
  $effect(() => { void combat.evenements.length; void combat.enAttente; proposerOuvert = false; detail = null; });
  /** Hauteur de la barre du bas : la scène Phaser s'arrête au-dessus, pour ne jamais cacher les combattants. */
  let hauteurBarre = $state(0);
  const herosCamp = $derived(vu.combattants.filter((x) => x.camp === 'heros' && !x.parti));
  const ennemis = $derived(vu.combattants.filter((x) => x.camp === 'ennemis' && !x.parti));
  const peutSecondDepart = $derived(jeu.monHeros?.don === 'second-depart' && etat.secondDepart[jeu.monHeros.id] !== etat.session && combat.instantane && !combat.resultat && termine);
</script>

<section class="combat">
  <div class="arene" style={`bottom:${hauteurBarre ? hauteurBarre + 8 : 0}px`}>
    <PhaserHote plein scene="combat" surPret={(s) => (scene = s as SceneCombat)} />
    {#if suspense}
      <div class="suspense" class:fini={!!suspense.resultat} aria-live="polite">
        <p class="qui">{suspense.nom} — {suspense.action}</p>
        {#if suspense.chance !== null}
          <div class="jauge" class:rapide={jeu.animationsRapides}><div style={`--cible:${Math.round(suspense.chance * 100)}%`}></div></div>
          <p class="chance">{pourcent(suspense.chance)} de chance de réussite</p>
        {/if}
        <p class={`tirage ${suspense.resultat ?? 'tourne'}`}>
          {#if suspense.resultat === 'critique'}Critique !{:else if suspense.resultat === 'reussi'}Réussi{:else if suspense.resultat === 'rate'}Raté{:else}<span class="roue"><span>Réussi</span><span>Raté</span><span>Critique !</span><span>Réussi</span></span>{/if}
        </p>
      </div>
    {/if}
  </div>

  <!-- en-tête par-dessus la scène : nom du combat, tour, options -->
  <div class="hud-combat">
    <h2>⚔ {combat.nom} <span class="discret">· Tour {combat.tour}</span></h2>
    {#if derniere}<p class="ligne-journal" aria-live="polite" class:fort={derniere.type === 'ko' || derniere.type === 'fin'}>{derniere.texte}</p>{/if}
    <div class="ligne">
      <label class="option"><input type="checkbox" checked={jeu.animationsRapides} onchange={(e) => jeu.changerAnimationsRapides((e.target as HTMLInputElement).checked)} /> Animations rapides</label>
      <button class="petit" aria-expanded={journalOuvert} onclick={() => (journalOuvert = !journalOuvert)}>📜 Journal{journalOuvert ? ' ▸' : ' ◂'}</button>
    </div>
  </div>

  {#if journalOuvert}
    <aside class="cote carte-ui" aria-label="Combattants et journal du combat">
      <h3>Combattants</h3>

        {#each [...herosCamp, ...ennemis] as x (x.id)}
          <div class="combattant" class:ko={x.ko} class:ennemi={x.camp === 'ennemis'}>
            <span>{x.nom}{#if x.camp === 'ennemis'} <small class="niveau">Niv. {x.niveau}</small>{/if}</span>
            <div class="barres">
              <div class="barre" title={`${x.pv}/${x.pvMax} PV`}><div style={`width:${(x.pv / x.pvMax) * 100}%`}></div></div>
              {#if utiliseMana(x)}<div class="barre mana" title={`${x.mana}/${x.manaMax} mana`}><div style={`width:${(x.mana / x.manaMax) * 100}%`}></div></div>{/if}
            </div>
            <small class="discret">{x.pv}/{x.pvMax} PV{#if utiliseMana(x)} · <span class="mana-txt">{x.mana}/{x.manaMax} mana</span>{/if}{x.bouclier ? ` +${x.bouclier}` : ''}{x.etats.length ? ` · ${etatsDe(x)}` : ''}</small>
          </div>
        {/each}
      <h3>Journal du combat</h3>
      <div class="journal" aria-live="polite">
        {#each journal as e, i (vu.evenements.length - i)}<p class:fort={e.type === 'ko' || e.type === 'fin'} class:poison={e.etat === 'poison'}>{e.texte}</p>{/each}
      </div>
    </aside>
  {/if}

  <!-- actions et propositions du combat libre : panneau en bas, qui se replie -->
  <div class="panneau-bas" class:reduit={actionsReduites} bind:clientHeight={hauteurBarre}>
    <button class="entete-panneau" aria-expanded={!actionsReduites} onclick={() => (actionsReduites = !actionsReduites)}>
      <span>{#if combat.resultat && termine}{combat.resultat === 'victoire' ? '🏆 Victoire !' : combat.resultat === 'defaite' ? 'Défaite…' : 'Fuite'}{:else if acteur && monTour && termine}À vous : {acteur.nom} <span class="stats">{acteur.pv}/{acteur.pvMax} PV · {acteur.mana}/{acteur.manaMax} mana</span>{:else if acteur && termine}Au tour de {acteur.nom}{:else}Le tour se déroule…{/if}</span>
      <span class="bascule">{actionsReduites ? '▴ Actions' : '▾ Réduire'}</span>
    </button>
    {#if !actionsReduites}
      <div class="panneau-actions">
      {#if !termine}
        <p class="discret">Le tour se déroule…</p>
      {:else if combat.resultat}
        <h3>{combat.resultat === 'victoire' ? '🏆 Victoire !' : combat.resultat === 'defaite' ? 'Défaite…' : 'Fuite'}</h3>
        {#each entree.contexte.bilan ?? [] as b, i (i)}<p class="discret">{b}</p>{/each}
        {#if combat.resultat === 'defaite'}<p class="discret">Mort douce : personne ne meurt pour de bon. L'histoire continue.</p>{/if}
        <button class="principal" onclick={() => jeu.agir({ type: 'fin_combat', cle })}>Continuer</button>
      {:else if acteur && monTour && dispo}
        <h3>À vous : {acteur.nom} <span class="discret">({acteur.pv}/{acteur.pvMax} PV · {acteur.mana}/{acteur.manaMax} mana)</span></h3>
        {#if selection}
          <p class="consigne">Cliquez sur la cible dans la scène{cibles.length ? '' : ' — aucune cible possible'}, ou :</p>
          <div class="ligne cibles">
            {#each cibles as id (id)}<button onclick={() => viser(id)}>{nom(id)}<small>{chanceSur(id)}</small></button>{/each}
            <button class="petit" onclick={() => (selection = null)}>Annuler</button>
          </div>
        {:else}
          <p class="detail" aria-live="polite">{detail ?? 'Survolez une action (ou appuyez longuement) pour voir son détail.'}</p>
          <div class="actions courtes">
            <button {...survol(detailAttaque)} onclick={siCourt(() => choisir({ type: 'attaque' }))}>⚔ Attaque</button>
            {#each dispo.competences as k (k.comp.id)}
              <button disabled={!k.utilisable} class:trop-cher={k.raison === 'Mana insuffisant'} aria-label={detailComp(k)} {...survol(detailComp(k))} onclick={siCourt(() => choisir({ type: 'competence', comp: k.comp }))}>
                {iconeComp(k.comp)} {k.comp.nom}{k.rang > 1 ? ` ${k.rang}` : ''}{#if k.comp.cout}&nbsp;<small class="cout">{k.comp.cout}💧</small>{/if}
              </button>
            {/each}
            <button disabled={dispo.potions <= 0} {...survol(`Potion de soin : rend des PV à un allié (il vous en reste ${dispo.potions})`)} onclick={siCourt(() => choisir({ type: 'potion' }))}>🧪 Potion <small class="cout">{dispo.potions}</small></button>
            {#if dispo.bombes > 0}<button {...survol('Bombe : dégâts à tous les ennemis')} onclick={siCourt(() => envoyer({ type: 'objet', acteur: acteur!.id, objet: 'bombe' }))}>💣 Bombe <small class="cout">{dispo.bombes}</small></button>{/if}
            {#each dispo.sac as o (o.id)}
              <button {...survol(`${o.nom} : ${o.description}`)} onclick={siCourt(() => utiliserDuSac(o.id, o.cible))}>🎒 {o.nom} <small class="cout">{o.nombre}</small></button>
            {/each}
            {#if dispo.pacifier.length}<button {...survol('Pacifier : tenter de calmer un ennemi')} onclick={siCourt(() => choisir({ type: 'pacifier' }))}>🕊 Pacifier</button>{/if}
            <button {...survol('Se défendre : moins de dégâts reçus jusqu\'au prochain tour')} onclick={siCourt(() => envoyer({ type: 'defendre', acteur: acteur!.id }))}>🛡 Défendre</button>
            <button {...survol(`Passer au rang ${acteur.rang === 'avant' ? 'arrière (moins exposé, mais pas de corps à corps)' : 'avant (corps à corps possible)'}`)} onclick={siCourt(() => envoyer({ type: 'changer_rang', acteur: acteur!.id }))}>↔ Rang {acteur.rang === 'avant' ? 'arrière' : 'avant'}</button>
            {#if dispo.fuite}<button class="danger" {...survol('Fuir le combat')} onclick={siCourt(() => envoyer({ type: 'fuir', acteur: acteur!.id }))}>🏃 Fuir</button>{/if}
            <button class="proposer" aria-expanded={proposerOuvert} onclick={() => (proposerOuvert = !proposerOuvert)}>✍ Proposer<span class="long"> / conseils</span></button>
          </div>
          {#if proposerOuvert}
            <div class="panneau-proposer carte-ui" role="dialog" aria-label="Proposer mon action">
              <div class="ligne entre"><strong>Proposer mon action</strong><button class="petit fermer-proposer" aria-label="Fermer" onclick={() => (proposerOuvert = false)}>✕</button></div>
              {#key acteur.id}<ActionsLibres {cle} acteur={acteur} />{/key}
            </div>
          {/if}
        {/if}
      {:else if acteur}
        <p>C'est au tour de <strong>{acteur.nom}</strong> ({etat.joueurs[acteur.joueurId ?? '']?.pseudo ?? '?'})…</p>
      {/if}
      {#if peutSecondDepart}<button class="petit" onclick={() => jeu.agir({ type: 'second_depart', cle })}>⟲ Second départ (rejouer le tour)</button>{/if}
      </div>
    {/if}
  </div>
</section>

<style>
  .option { display: flex; align-items: center; gap: 0.3rem; font-size: 0.9rem; color: var(--texte-2); }
  .option input { width: auto; }
  .combat { position: absolute; inset: 0; }
  .arene { position: absolute; inset: 0; transition: bottom 0.15s; }
  .ligne-journal { flex-basis: 100%; order: 3; margin: 0; max-width: min(760px, 100%); font-size: 0.9rem; line-height: 1.25; background: #14111cd9; border-radius: 6px; padding: 0.15rem 0.55rem; text-shadow: none; }
  .ligne-journal.fort { color: var(--or-2); font-weight: 600; }
  .detail { margin: 0.25rem 0 0.35rem; font-size: 0.85rem; color: var(--texte-2); min-height: 1.2em; }
  .actions.courtes { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .actions.courtes button { min-height: 44px; padding: 0.2rem 0.6rem; font-size: 0.92rem; -webkit-touch-callout: none; user-select: none; }
  .actions.courtes .cout { display: inline; color: var(--bleu); font-size: 0.8rem; }
  .actions.courtes .trop-cher .cout { color: var(--rouge); }
  .actions.courtes .proposer { border-color: var(--or); }
  .panneau-proposer { position: absolute; bottom: calc(100% + 0.4rem); right: 0; width: min(520px, 100%); max-height: 55dvh; overflow-y: auto; overscroll-behavior: contain; padding: 0.6rem 0.7rem; background: #14111cf5; border-color: var(--or); z-index: 2; }
  .fermer-proposer { min-width: 44px; min-height: 44px; }
  .cibles button { min-height: 44px; }
  /* téléphone : les actions tiennent sur une ligne qu'on fait défiler du doigt, pour laisser voir le combat */
  @media (max-width: 640px), (max-height: 500px) {
    .actions.courtes { flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-x: contain; padding-bottom: 0.2rem; scrollbar-width: thin; }
    .actions.courtes button { flex: none; }
    .entete-panneau { min-height: 40px; font-size: 0.9rem; padding: 0.15rem 0.6rem; }
    .entete-panneau .stats { font-size: 0.75rem; }
    .panneau-actions { padding: 0 0.5rem 0.4rem; }
    .detail { display: none; }
    .proposer .long { display: none; }
  }
  .hud-combat { position: absolute; z-index: 20; top: calc(max(0.3rem, env(safe-area-inset-top)) + 3rem); left: max(0.5rem, env(safe-area-inset-left)); right: max(0.5rem, env(safe-area-inset-right)); display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; flex-wrap: wrap; pointer-events: none; }
  .hud-combat > * { pointer-events: auto; }
  .hud-combat h2 { margin: 0; font-size: clamp(1rem, 2.4vw, 1.3rem); text-shadow: 0 2px 6px #000, 0 0 2px #000; }
  .hud-combat .option { background: #1d1928e6; border-radius: 8px; padding: 0.2rem 0.5rem; min-height: 36px; }
  .hud-combat button { background: #1d1928e6; min-height: 36px; }
  .cote { position: absolute; z-index: 30; top: calc(max(0.3rem, env(safe-area-inset-top)) + 6rem); right: max(0.5rem, env(safe-area-inset-right)); width: min(340px, calc(100% - 1rem)); max-height: calc(100% - 13rem); overflow-y: auto; overscroll-behavior: contain; padding: 0.7rem; background: #14111cf0; }
  .cote h3 { margin: 0 0 0.4rem; }
  .cote h3 + .journal, .cote .journal { margin-bottom: 0; }
  /* panneau d'actions en bas : se replie en une ligne ; déplié, au plus 45 % de l'écran avec défilement interne */
  .panneau-bas { position: absolute; z-index: 40; left: 50%; translate: -50% 0; bottom: max(0.4rem, env(safe-area-inset-bottom)); width: min(980px, calc(100% - 0.8rem)); display: flex; flex-direction: column;
    background: #14111cf0; border: 1px solid var(--or); border-radius: var(--rayon); box-shadow: var(--ombre); backdrop-filter: blur(3px); }
  .panneau-bas.reduit { border-color: var(--bord); }
  .entete-panneau { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; min-height: 44px; padding: 0.3rem 0.8rem; background: none; border: none; text-align: left; font-family: 'Cinzel', serif; color: var(--or-2); }
  .entete-panneau:hover:not(:disabled) { background: #ffffff0a; }
  .bascule { font-family: 'Source Sans 3', system-ui, sans-serif; font-size: 0.9rem; white-space: nowrap; }
  .panneau-actions { max-height: 30dvh; overflow-y: auto; overscroll-behavior: contain; padding: 0 0.8rem 0.8rem; border-top: 1px solid var(--bord); }
  /* le titre du panneau (« À vous… », « Victoire ! ») est déjà dans l'en-tête */
  .panneau-actions > h3:first-child { display: none; }
  .stats { font-family: 'Source Sans 3', system-ui, sans-serif; font-size: 0.85rem; color: var(--texte-2); }
  /* téléphone en paysage : peu de hauteur, le panneau reste petit pour laisser voir le combat */
  @media (max-height: 500px) {
    .panneau-actions { max-height: 30dvh; }
    .detail { display: none; }
    .actions.courtes button { min-height: 40px; font-size: 0.85rem; padding: 0.15rem 0.45rem; }
    .ligne-journal { font-size: 0.8rem; }
    .hud-combat h2 { font-size: 0.95rem; }
    .hud-combat .option { display: none; }
    .entete-panneau { min-height: 40px; }
  }
  .suspense { position: absolute; left: 50%; top: 12%; transform: translateX(-50%); width: min(340px, 86%); background: rgba(20, 17, 28, 0.94); border: 2px solid var(--or); border-radius: var(--rayon); padding: 0.7rem 0.9rem; text-align: center; box-shadow: var(--ombre); z-index: 5; }
  .suspense p { margin: 0.2em 0; }
  .suspense .qui { color: var(--or-2); font-weight: 700; }
  .jauge { height: 14px; border-radius: 7px; background: #000a; overflow: hidden; border: 1px solid var(--bord); }
  .jauge > div { height: 100%; width: 0; background: linear-gradient(90deg, #b8862f, #ffd166); animation: remplir 0.9s ease-out forwards; }
  .jauge.rapide > div { animation-duration: 0.2s; }
  @keyframes remplir { to { width: var(--cible); } }
  .chance { font-size: 0.9rem; color: var(--texte-2); }
  .tirage { font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 700; height: 1.4em; overflow: hidden; }
  .tirage.reussi { color: var(--vert); }
  .tirage.critique { color: var(--or-2); animation: eclat 0.4s; }
  .tirage.rate { color: #c9c3d6; }
  .roue { display: flex; flex-direction: column; animation: tourner 0.36s linear infinite; }
  .roue span { height: 1.4em; line-height: 1.4em; color: var(--texte-2); }
  @keyframes tourner { to { transform: translateY(-4.2em); } }
  @keyframes eclat { 50% { transform: scale(1.3); } }
  .actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .actions small, .ligne button small { display: block; color: var(--texte-2); font-size: 0.75rem; }
  .consigne { color: var(--or-2); }
  .combattant { display: grid; grid-template-columns: 1fr 90px; gap: 0.1rem 0.5rem; align-items: center; margin-bottom: 0.35rem; font-size: 0.9rem; }
  .combattant small { grid-column: 1 / -1; }
  .combattant.ko { opacity: 0.45; }
  .barres { display: grid; gap: 2px; }
  .barre.mana { height: 5px; }
  .combattant .barre.mana > div { background: #4f8dff; }
  .mana-txt { color: var(--bleu); }
  .niveau { color: var(--or-2); }
  .combattant.ennemi .barre > div { background: var(--rouge); }
  .journal p { margin: 0.15em 0; font-size: 0.88rem; }
  .journal .fort { color: var(--or-2); font-weight: 600; }
  .journal .poison { color: #8fe38f; }

  @media (prefers-reduced-motion: reduce) { .roue, .jauge > div { animation-duration: 0.01s; } }
</style>
