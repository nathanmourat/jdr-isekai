<script lang="ts">
  /**
   * Écran de combat. Le moteur a déjà tout calculé (avec le hasard à graine) : cet écran ne fait que RÉVÉLER
   * les événements petit à petit — suspense avant le résultat d'une action, délai avant la riposte des ennemis.
   */
  import { jeu } from '../jeu.svelte';
  import PhaserHote from '../PhaserHote.svelte';
  import ActionsLibres from './ActionsLibres.svelte';
  import CompetenceInfo from '../CompetenceInfo.svelte';
  import { utiliseMana, type SceneCombat } from '../../rendu/SceneCombat';
  import { actionsDisponibles, estimerAction, NOMS_ETATS, type ActionCombat, type Combat, type Combattant, type EvenementCombat } from '../../moteur/combat';
  import type { Competence } from '../../contenu/schemas';

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

  $effect(() => {
    scene?.afficher(vu, {
      echelle: c.config.graphismes.echelle_combat ?? 3,
      tailleCombat: c.config.graphismes.taille_sprite_combat ?? 64,
      tailleBoss: c.config.graphismes.taille_sprite_boss ?? 128,
      tailleExploration: c.config.graphismes.taille_sprite_exploration ?? 32,
      ciblesCliquables: termine ? cibles : [],
      actif: termine ? combat.enAttente : null,
      surClic: (id) => { if (termine && cibles.includes(id)) viser(id); },
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
  const journal = $derived(vu.evenements.slice(-8).reverse());
  const herosCamp = $derived(vu.combattants.filter((x) => x.camp === 'heros' && !x.parti));
  const ennemis = $derived(vu.combattants.filter((x) => x.camp === 'ennemis' && !x.parti));
  const peutSecondDepart = $derived(jeu.monHeros?.don === 'second-depart' && etat.secondDepart[jeu.monHeros.id] !== etat.session && combat.instantane && !combat.resultat && termine);
</script>

<section class="combat">
  <div class="ligne entete">
    <h2>⚔ {combat.nom}</h2>
    <span class="discret">Tour {combat.tour}</span>
    <label class="option"><input type="checkbox" checked={jeu.animationsRapides} onchange={(e) => jeu.changerAnimationsRapides((e.target as HTMLInputElement).checked)} /> Animations rapides</label>
  </div>
  <div class="arene">
    <PhaserHote scene="combat" surPret={(s) => (scene = s as SceneCombat)} />
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

  <div class="bas">
    <div class="carte-ui panneau-actions">
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
          <p class="consigne">Choisissez une cible{cibles.length ? ' (cliquez sur le personnage ou ci-dessous)' : ' — aucune cible possible'} :</p>
          <div class="ligne">
            {#each cibles as id (id)}<button onclick={() => viser(id)}>{nom(id)}<small>{chanceSur(id)}</small></button>{/each}
            <button class="petit" onclick={() => (selection = null)}>Annuler</button>
          </div>
        {:else}
          {#key acteur.id}<ActionsLibres {cle} acteur={acteur} />{/key}
          <details class="manuel" open>
            <summary>Ce que font mes compétences</summary>
            {#each dispo.competences as k (k.comp.id)}
              <p class="explication" class:indispo={!k.utilisable}><CompetenceInfo comp={k.comp} rang={k.rang} heros={herosActeur} sujet={acteur} reel={reel(k.comp)} />{#if k.raison} <span class="badge">{k.raison}</span>{/if}</p>
            {/each}
            <p class="discret">Plus une action est puissante, moins elle est sûre : une attaque de base touche plus souvent qu'une compétence coûteuse. La maîtrise et le niveau améliorent la précision.</p>
          </details>
          <details class="manuel">
          <summary>Toutes les actions (mode manuel)</summary>
          <div class="actions">
            <button onclick={() => choisir({ type: 'attaque' })}>Attaque <small>fiable</small></button>
            {#each dispo.competences as k (k.comp.id)}
              {@const r = reel(k.comp)}
              <button disabled={!k.utilisable} title={`${k.comp.description}${k.raison ? ' — ' + k.raison : ''}`} onclick={() => choisir({ type: 'competence', comp: k.comp })}>
                {k.comp.nom}{k.rang > 1 ? ` ${k.rang}` : ''} <small class:trop-cher={k.raison === 'Mana insuffisant'}>{k.comp.cout ? `${k.comp.cout} mana` : ''}{r?.reussite !== null && r?.reussite !== undefined ? ` · ${pourcent(r.reussite)}` : ''}{k.raison ? ` · ${k.raison}` : ''}</small>
              </button>
            {/each}
            <button disabled={dispo.potions <= 0} onclick={() => choisir({ type: 'potion' })}>Potion ({dispo.potions})</button>
            {#if dispo.bombes > 0}<button onclick={() => envoyer({ type: 'objet', acteur: acteur!.id, objet: 'bombe' })}>Bombe ({dispo.bombes})</button>{/if}
            {#each dispo.sac as o (o.id)}
              <button title={o.description} onclick={() => utiliserDuSac(o.id, o.cible)}>🎒 {o.nom} ({o.nombre})</button>
            {/each}
            {#if dispo.pacifier.length}<button onclick={() => choisir({ type: 'pacifier' })}>Pacifier</button>{/if}
            <button onclick={() => envoyer({ type: 'defendre', acteur: acteur!.id })}>Se défendre</button>
            <button onclick={() => envoyer({ type: 'changer_rang', acteur: acteur!.id })}>Passer au rang {acteur.rang === 'avant' ? 'arrière' : 'avant'}</button>
            {#if dispo.fuite}<button class="danger" onclick={() => envoyer({ type: 'fuir', acteur: acteur!.id })}>Fuir</button>{/if}
          </div>
          </details>
        {/if}
      {:else if acteur}
        <p>C'est au tour de <strong>{acteur.nom}</strong> ({etat.joueurs[acteur.joueurId ?? '']?.pseudo ?? '?'})…</p>
      {/if}
      {#if peutSecondDepart}<button class="petit" onclick={() => jeu.agir({ type: 'second_depart', cle })}>⟲ Second départ (rejouer le tour)</button>{/if}
    </div>

    <div class="carte-ui etats">
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
    </div>

    <div class="carte-ui journal" aria-live="polite">
      <h3>Journal du combat</h3>
      {#each journal as e, i (vu.evenements.length - i)}<p class:fort={e.type === 'ko' || e.type === 'fin'} class:poison={e.etat === 'poison'}>{e.texte}</p>{/each}
    </div>
  </div>
</section>

<style>
  .entete { justify-content: space-between; }
  .entete h2 { margin: 0; }
  .option { display: flex; align-items: center; gap: 0.3rem; font-size: 0.9rem; color: var(--texte-2); }
  .option input { width: auto; }
  .arene { position: relative; }
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
  .bas { display: grid; gap: 0.6rem; grid-template-columns: 1.4fr 1fr 1fr; margin-top: 0.6rem; }
  @media (max-width: 900px) { .bas { grid-template-columns: 1fr; } }
  .actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .actions small, .ligne button small { display: block; color: var(--texte-2); font-size: 0.75rem; }
  .consigne { color: var(--or-2); }
  .manuel { margin-top: 0.6rem; }
  .explication { margin: 0.35em 0; }
  .explication.indispo { opacity: 0.6; }
  .manuel summary { cursor: pointer; color: var(--texte-2); margin-bottom: 0.4rem; }
  .combattant { display: grid; grid-template-columns: 1fr 90px; gap: 0.1rem 0.5rem; align-items: center; margin-bottom: 0.35rem; font-size: 0.9rem; }
  .combattant small { grid-column: 1 / -1; }
  .combattant.ko { opacity: 0.45; }
  .barres { display: grid; gap: 2px; }
  .barre.mana { height: 5px; }
  .combattant .barre.mana > div { background: #4f8dff; }
  .mana-txt { color: var(--bleu); }
  .niveau { color: var(--or-2); }
  .actions small.trop-cher { color: var(--rouge); font-weight: 600; }
  .combattant.ennemi .barre > div { background: var(--rouge); }
  .journal p { margin: 0.15em 0; font-size: 0.88rem; }
  .journal .fort { color: var(--or-2); font-weight: 600; }
  .journal .poison { color: #8fe38f; }
  .journal { max-height: 280px; overflow: auto; }
  @media (prefers-reduced-motion: reduce) { .roue, .jauge > div { animation-duration: 0.01s; } }
</style>
