<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { caracsDeDepart, type Carac } from '../../moteur/personnage';
  import { listeHeros } from '../../moteur/partie';
  import { CARACS } from '../../contenu/schemas';
  import { imagePortrait, urlAsset } from '../../rendu/assets';
  import { redimensionnerPortrait, signe } from '../outils';
  import { AIDE_CARACS } from '../../moteur/fiche';

  const c = jeu.contenu!;
  let pseudo = $state('');
  let nom = $state('');
  let origine = $state<'invoque' | 'reincarne'>('invoque');
  /** Sexe du héros (test 3) : accords des textes et portrait féminin s'il existe. */
  let sexe = $state<'m' | 'f'>('m');
  let age = $state(20);
  let race = $state('humain');
  let classe = $state('lame-runique');
  let don = $state('');
  let plus = $state<Carac[]>(['FOR', 'VIT']);
  let moins = $state<Carac[]>(['CHA', 'INT']);
  let portrait = $state<string | null>(null);
  let erreurLocale = $state<string | null>(null);

  const etat = $derived(jeu.etat!);
  const joueur = $derived(etat.joueurs[jeu.joueurActif]);
  const donsPris = $derived(Object.fromEntries(listeHeros(etat).map((h) => [h.don, h.nom])));
  const libres = $derived(c.races[race].modificateurs_libres);
  const libresObj = $derived(libres ? {
    plus: Object.fromEntries(plus.map((k) => [k, 1])) as Partial<Record<Carac, number>>,
    moins: Object.fromEntries(moins.map((k) => [k, 1])) as Partial<Record<Carac, number>>,
  } : undefined);
  const apercu = $derived.by(() => {
    try { return { caracs: caracsDeDepart(c, classe, race, libresObj), erreur: null }; }
    catch (e) { return { caracs: null, erreur: (e as Error).message }; }
  });
  const enCours = $derived(etat.jour > 0 || listeHeros(etat).some((h) => h.niveau > 1));

  async function rejoindre() {
    await jeu.agir({ type: 'rejoindre', pseudo });
  }
  async function creer() {
    erreurLocale = null;
    if (!nom.trim()) { erreurLocale = 'Donnez un nom à votre héros.'; return; }
    if (!don) { erreurLocale = 'Choisissez un don.'; return; }
    const ok = await jeu.agir({ type: 'creer_heros', heros: { nom, classe, race, don, origine, sexe, age: origine === 'invoque' ? age : undefined, libres: libresObj } });
    if (ok && portrait) await jeu.agir({ type: 'portrait', image: portrait });
  }
  async function choisirPortrait(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try { portrait = await redimensionnerPortrait(f); } catch (err) { erreurLocale = (err as Error).message; }
  }
  // ── Tirages au hasard : ils ne font que remplir le formulaire, le joueur peut tout retoucher ensuite.
  function auHasard<T>(liste: T[]): T { return liste[Math.floor(Math.random() * liste.length)]; }
  const donsLibres = $derived(Object.keys(c.dons).filter((d) => !donsPris[d]));
  function tirerClasse() { classe = auHasard(Object.keys(c.classes)); }
  function tirerDon() { if (donsLibres.length) don = auHasard(donsLibres); }
  function tirerRace() {
    // on retire jusqu'à trouver une combinaison autorisée (caractéristiques dans les limites)
    for (let essai = 0; essai < 50; essai++) {
      race = auHasard(Object.keys(c.races));
      if (c.races[race].modificateurs_libres) {
        const melange = [...CARACS].sort(() => Math.random() - 0.5);
        plus = melange.slice(0, 2);
        moins = melange.slice(2, 4);
      }
      try {
        caracsDeDepart(c, classe, race, c.races[race].modificateurs_libres ? { plus: Object.fromEntries(plus.map((k) => [k, 1])), moins: Object.fromEntries(moins.map((k) => [k, 1])) } : undefined);
        return;
      } catch { /* combinaison hors limites : on retire */ }
    }
  }
  function toutAuHasard() {
    tirerClasse();
    tirerRace();
    tirerDon();
    const p = c.config.personnage;
    if (origine === 'invoque') age = p.age_invoque_min + Math.floor(Math.random() * (p.age_invoque_max - p.age_invoque_min + 1));
  }
  function basculer(liste: Carac[], k: Carac): Carac[] {
    if (liste.includes(k)) return liste.filter((x) => x !== k);
    return [...liste, k].slice(-2);
  }
</script>

<main class="conteneur">
  <div class="ligne entete">
    <h1>Création de personnage</h1>
    <span class="badge or">Partie : {jeu.canal?.infos.nom} · code {jeu.canal?.infos.code}</span>
    <button class="petit" onclick={() => jeu.fermer()}>Retour à l'accueil</button>
  </div>
  {#if jeu.joueursLocaux.length > 1 || jeu.canal?.infos.mode === 'local'}
    <div class="ligne discret" style="margin-bottom:1rem">
      Joueur sur cet appareil :
      {#each jeu.joueursLocaux as j, i (j)}
        <button class="petit" class:actif={j === jeu.joueurActif} onclick={() => jeu.changerJoueur(j)}>{etat.joueurs[j]?.pseudo ?? `Joueur ${i + 1} (nouveau)`}</button>
      {/each}
      {#if jeu.canal?.infos.mode === 'local' && jeu.joueursLocaux.length < 6}
        <button class="petit" onclick={() => jeu.ajouterJoueurLocal()}>+ Ajouter un joueur ici</button>
      {/if}
    </div>
  {/if}

  {#if jeu.erreur}<p class="erreur" role="alert">{jeu.erreur}</p>{/if}
  {#if erreurLocale}<p class="erreur" role="alert">{erreurLocale}</p>{/if}

  {#if !joueur}
    <section class="carte-ui" style="max-width:480px">
      <h2>Votre pseudo</h2>
      <p class="discret">C'est le nom sous lequel les autres joueurs vous verront.</p>
      <div class="ligne">
        <input bind:value={pseudo} maxlength="24" placeholder="Pseudo" aria-label="Pseudo" />
        <button class="principal" disabled={!pseudo.trim()} onclick={rejoindre}>Rejoindre la partie</button>
      </div>
    </section>
  {:else}
    <p class="ligne"><button onclick={toutAuHasard}>🎲 Tout au hasard</button> <span class="discret">Tire la race, la classe, le don{origine === 'invoque' ? " et l'âge" : ''}. Vous pouvez ensuite tout retoucher.</span></p>
    {#if enCours}<p class="succes">La campagne a déjà commencé : votre héros arrivera au niveau moyen du groupe, avec ses points répartis automatiquement (modifiables ensuite).</p>{/if}
    <div class="formulaire">
      <section class="carte-ui">
        <h2>1. Identité</h2>
        <label>Nom du héros <input bind:value={nom} maxlength="30" placeholder="ex. Kael" /></label>
        <fieldset class="sexe">
          <legend>Votre héros est…</legend>
          <label class="choix"><input type="radio" bind:group={sexe} value="m" /> <strong>un homme</strong></label>
          <label class="choix"><input type="radio" bind:group={sexe} value="f" /> <strong>une femme</strong></label>
          <small class="discret">L'histoire s'accorde (« accueilli » ou « accueillie », « Messire » ou « Dame »…).</small>
        </fieldset>
        <fieldset>
          <legend>Arrivée dans ce monde</legend>
          <label class="choix"><input type="radio" bind:group={origine} value="invoque" /> <strong>Invoqué</strong> — appelé adulte par l'Ordre, au printemps 1012.</label>
          {#if origine === 'invoque'}
            <label class="age">Âge à l'arrivée : <input type="number" min={c.config.personnage.age_invoque_min} max={c.config.personnage.age_invoque_max} bind:value={age} /></label>
          {/if}
          <label class="choix"><input type="radio" bind:group={origine} value="reincarne" /> <strong>Réincarné</strong> — né en 994 dans ce monde ; vous jouerez un court prologue d'enfance (6, 10, 14 et 17 ans) avant le chapitre 1.</label>
        </fieldset>
        <div class="portrait">
          <img class="pixel" alt="Portrait" src={portrait ?? imagePortrait([...(sexe === 'f' ? [`personnages/races/${race}/portrait-defaut-f`] : []), `personnages/races/${race}/portrait-defaut`], race, c.races[race].nom)} />
          <label>Portrait personnel (facultatif)<input type="file" accept="image/*" onchange={choisirPortrait} /></label>
        </div>
      </section>

      <section class="carte-ui">
        <h2>2. Race <button class="petit" onclick={tirerRace}>🎲 Au hasard</button></h2>
        <div class="cartes">
          {#each Object.values(c.races) as r (r.id)}
            <button class="option" class:choisi={race === r.id} onclick={() => (race = r.id)}>
              <span class="titre">{#if urlAsset(`icones/races/${r.trait.id}`)}<img class="icone pixel" src={urlAsset(`icones/races/${r.trait.id}`)} alt="" />{/if}{r.nom}</span>
              <span class="mods">{r.modificateurs_libres ? '+1 / +1 et −1 / −1 au choix' : Object.entries(r.modificateurs).map(([k, v]) => `${k} ${signe(v ?? 0)}`).join(', ')}</span>
              <span class="trait"><strong>{r.trait.nom}</strong> : {r.trait.avantage} <em>Défaut :</em> {r.trait.defaut}</span>
            </button>
          {/each}
        </div>
        {#if libres}
          <div class="libres">
            <p>Humain : choisissez <strong>deux</strong> caractéristiques à +1 et <strong>deux autres</strong> à −1.</p>
            <div class="ligne">+1 : {#each CARACS as k (k)}<button class="petit" class:actif={plus.includes(k)} disabled={moins.includes(k)} onclick={() => (plus = basculer(plus, k))}>{k}</button>{/each}</div>
            <div class="ligne">−1 : {#each CARACS as k (k)}<button class="petit" class:actif={moins.includes(k)} disabled={plus.includes(k)} onclick={() => (moins = basculer(moins, k))}>{k}</button>{/each}</div>
          </div>
        {/if}
      </section>

      <section class="carte-ui large">
        <h2>3. Classe <button class="petit" onclick={tirerClasse}>🎲 Au hasard</button></h2>
        <div class="cartes">
          {#each Object.values(c.classes) as cl (cl.id)}
            <button class="option" class:choisi={classe === cl.id} onclick={() => (classe = cl.id)}>
              <span class="titre">{cl.nom} <span class="badge">{cl.role}</span></span>
              <span class="trait">{cl.description}</span>
              <span class="mods">Passif : {cl.passif.nom} · Compétences : {cl.competences.map((x) => c.competences[x].nom).join(', ')}</span>
              <span class="trait"><em>Fort :</em> {cl.point_fort} <em>Faible :</em> {cl.point_faible}</span>
            </button>
          {/each}
        </div>
      </section>

      <section class="carte-ui large">
        <h2>4. Don <button class="petit" disabled={!donsLibres.length} onclick={tirerDon}>🎲 Au hasard</button></h2>
        <p class="discret">Chaque don est unique dans la partie : le tirage ne choisit que parmi les dons encore libres ({donsLibres.length} sur {Object.keys(c.dons).length}).</p>
        <div class="cartes dons">
          {#each Object.values(c.dons) as d (d.id)}
            <button class="option" class:choisi={don === d.id} disabled={!!donsPris[d.id]} onclick={() => (don = d.id)}>
              <span class="titre">{d.nom}{#if donsPris[d.id]} <span class="badge">pris par {donsPris[d.id]}</span>{/if}</span>
              <span class="trait"><em>En combat :</em> {d.combat}</span>
              <span class="trait"><em>Hors combat :</em> {d.hors_combat}</span>
            </button>
          {/each}
        </div>
      </section>

      <section class="carte-ui large recap">
        <h2>Récapitulatif</h2>
        {#if apercu.caracs}
          <div class="stats">
            {#each CARACS as k (k)}<div><span class="discret">{AIDE_CARACS[k].nom}</span><strong>{apercu.caracs[k]}</strong></div>{/each}
          </div>
          <ul class="aide-caracs">
            {#each CARACS as k (k)}<li><strong>{AIDE_CARACS[k].nom} ({k})</strong> : {AIDE_CARACS[k].effet}</li>{/each}
          </ul>
          <p class="discret">Total : {Object.values(apercu.caracs).reduce((a, b) => a + b, 0)} points (identique pour toutes les combinaisons).</p>
        {:else}<p class="erreur">{apercu.erreur}</p>{/if}
        <button class="principal" disabled={!apercu.caracs || !don || !nom.trim()} onclick={creer}>Créer mon héros</button>
      </section>
    </div>
  {/if}
</main>

<style>
  .entete { justify-content: space-between; margin-bottom: 0.5rem; }
  .formulaire { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .large { grid-column: 1 / -1; }
  label { display: grid; gap: 0.25rem; margin-bottom: 0.6rem; }
  fieldset { border: 1px solid var(--bord); border-radius: 8px; padding: 0.6rem; margin: 0 0 0.8rem; }
  legend { color: var(--texte-2); padding: 0 0.3rem; }
  .choix { display: block; }
  .choix input { width: auto; }
  .age input { max-width: 6em; }
  .cartes { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
  .option { display: grid; gap: 0.25rem; text-align: left; padding: 0.7rem; background: var(--fond); }
  .option.choisi { border-color: var(--or); background: #2a2238; box-shadow: 0 0 0 1px var(--or) inset; }
  .titre { font-weight: 700; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
  .mods { color: var(--or-2); font-size: 0.85rem; }
  .trait { font-size: 0.85rem; color: var(--texte-2); }
  .icone { width: 24px; height: 24px; }
  .actif { border-color: var(--or); background: #3b2f18; }
  .libres { margin-top: 0.8rem; display: grid; gap: 0.4rem; }
  .portrait { display: flex; gap: 0.8rem; align-items: center; }
  .portrait img { width: 96px; height: 96px; border-radius: 8px; border: 1px solid var(--bord); object-fit: cover; }
  .stats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.4rem; margin-bottom: 0.5rem; }
  .stats div { display: grid; text-align: center; background: var(--fond); border-radius: 8px; padding: 0.4rem; }
  .stats strong { font-size: 1.4rem; color: var(--or-2); }
  .aide-caracs { margin: 0 0 0.6rem; padding-left: 1.1rem; font-size: 0.9rem; color: var(--texte-2); }
  .aide-caracs strong { color: var(--texte); }
  h2 button { font-family: 'Source Sans 3', system-ui, sans-serif; margin-left: 0.4rem; }
  @media (max-width: 640px) { .stats { grid-template-columns: repeat(3, 1fr); } }
</style>
