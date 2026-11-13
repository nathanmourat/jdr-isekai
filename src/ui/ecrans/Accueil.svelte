<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { CanalLocal, creerPartieLocale, partiesLocales, supprimerPartieLocale } from '../../sync/local';
  import { CanalSupabase, creerPartieEnLigne, enLigneConfigure, mesPartiesEnLigne, rejoindrePartieEnLigne } from '../../sync/supabase';
  import { lireSauvegarde } from '../../sauvegarde/fichier';
  import type { InfosPartie } from '../../sync/types';
  import { urlAsset } from '../../rendu/assets';

  let nomLocal = $state('Ma partie');
  let nomEnLigne = $state('Notre campagne');
  let code = $state('');
  let erreur = $state<string | null>(null);
  let locales = $state(partiesLocales());
  let enLigne = $state<InfosPartie[] | null>(null);
  let occupe = $state(false);
  const fond = urlAsset('decors/temple-du-seuil');

  async function ouvrirLocale(infos: InfosPartie) {
    erreur = null;
    try { await jeu.ouvrir(new CanalLocal(infos)); } catch (e) { erreur = (e as Error).message; }
  }
  async function creerLocale() {
    const infos = creerPartieLocale(jeu.contenu!, nomLocal);
    locales = partiesLocales();
    await ouvrirLocale(infos);
  }
  function supprimer(infos: InfosPartie) {
    if (!confirm(`Supprimer définitivement la partie « ${infos.nom} » de ce navigateur ?`)) return;
    supprimerPartieLocale(infos.id);
    locales = partiesLocales();
  }
  async function importer(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    erreur = null;
    try {
      const texte = await f.text();
      const s = lireSauvegarde(texte);
      const brut = JSON.parse(texte) as { infos?: InfosPartie };
      const infos = creerPartieLocale(jeu.contenu!, brut.infos?.nom ?? s.depart.nom, { infos: brut.infos ?? ({ nom: s.depart.nom } as InfosPartie), depart: s.depart, actions: s.actions });
      locales = partiesLocales();
      await ouvrirLocale(infos);
    } catch (err) { erreur = (err as Error).message; }
  }
  async function enLigneAction(f: () => Promise<InfosPartie>) {
    erreur = null; occupe = true;
    try { const infos = await f(); await jeu.ouvrir(await CanalSupabase.ouvrir(infos)); }
    catch (e) { erreur = (e as Error).message; }
    finally { occupe = false; }
  }
  async function chargerMesParties() {
    erreur = null;
    try { enLigne = await mesPartiesEnLigne(); } catch (e) { erreur = (e as Error).message; }
  }
</script>

<main class="accueil" style={fond ? `--fond-image: url(${fond})` : ''}>
  <div class="voile"></div>
  <div class="conteneur contenu">
    <header>
      <h1>Les Appelés de Velmaris</h1>
      <p class="sous-titre">Un jeu de rôle isekai à plusieurs, de 1 à 6 joueurs.</p>
    </header>

    {#if erreur}<p class="erreur" role="alert">{erreur}</p>{/if}

    <div class="colonnes">
      <section class="carte-ui">
        <h2>Partie locale</h2>
        <p class="discret">Sur cet appareil : idéal pour tester, jouer seul ou à tour de rôle. Plusieurs onglets restent synchronisés.</p>
        <div class="ligne">
          <input bind:value={nomLocal} placeholder="Nom de la partie" aria-label="Nom de la nouvelle partie locale" maxlength="40" />
          <button class="principal" onclick={creerLocale}>Créer</button>
        </div>
        {#if locales.length}
          <h3 style="margin-top:1rem">Continuer</h3>
          <ul class="liste">
            {#each locales as p (p.id)}
              <li>
                <button class="lien" onclick={() => ouvrirLocale(p)}>{p.nom}</button>
                <span class="discret">{new Date(p.creeeLe).toLocaleDateString('fr-FR')}</span>
                <button class="petit danger" onclick={() => supprimer(p)} aria-label={`Supprimer ${p.nom}`}>Supprimer</button>
              </li>
            {/each}
          </ul>
        {/if}
        <label class="importer">
          <span>Importer une sauvegarde (.json)</span>
          <input type="file" accept="application/json,.json" onchange={importer} />
        </label>
      </section>

      <section class="carte-ui">
        <h2>Partie en ligne</h2>
        {#if enLigneConfigure()}
          <p class="discret">Chacun joue depuis chez soi, en direct ou à son rythme. Partagez le code à 6 caractères.</p>
          <div class="ligne">
            <input bind:value={nomEnLigne} placeholder="Nom de la campagne" aria-label="Nom de la nouvelle partie en ligne" maxlength="40" />
            <button class="principal" disabled={occupe} onclick={() => enLigneAction(() => creerPartieEnLigne(jeu.contenu!, nomEnLigne))}>Créer</button>
          </div>
          <div class="ligne" style="margin-top:0.6rem">
            <input bind:value={code} placeholder="CODE" aria-label="Code de la partie à rejoindre" maxlength="6" style="text-transform:uppercase; max-width:9em; letter-spacing:0.2em" />
            <button disabled={occupe || code.trim().length !== 6} onclick={() => enLigneAction(() => rejoindrePartieEnLigne(code))}>Rejoindre</button>
          </div>
          <button class="petit" style="margin-top:0.8rem" onclick={chargerMesParties}>Mes parties en ligne</button>
          {#if enLigne}
            <ul class="liste">
              {#each enLigne as p (p.id)}
                <li><button class="lien" onclick={() => enLigneAction(async () => p)}>{p.nom}</button> <span class="badge or">{p.code}</span></li>
              {:else}<li class="discret">Aucune partie pour l'instant.</li>{/each}
            </ul>
          {/if}
        {:else}
          <p class="discret">Le mode en ligne n'est pas encore configuré. Il faut créer un projet gratuit sur Supabase et renseigner deux valeurs : voir la section « Jouer en ligne » du README. En attendant, la partie locale fonctionne entièrement.</p>
        {/if}
      </section>
    </div>
  </div>
</main>

<style>
  .accueil { position: relative; min-height: 100dvh; background: var(--fond-image, none) center / cover no-repeat, var(--fond); image-rendering: pixelated; }
  .voile { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,17,28,0.55), rgba(20,17,28,0.95) 60%); }
  .contenu { position: relative; padding-top: 8vh; }
  header { text-align: center; margin-bottom: 2rem; }
  .sous-titre { color: var(--texte-2); }
  .colonnes { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
  .liste { list-style: none; padding: 0; margin: 0.5rem 0 0; display: grid; gap: 0.4rem; }
  .liste li { display: flex; gap: 0.5rem; align-items: center; }
  .lien { background: none; border: none; color: var(--or-2); padding: 0.2em 0; text-decoration: underline; flex: 1; text-align: left; }
  .importer { display: grid; gap: 0.3rem; margin-top: 1rem; font-size: 0.9rem; color: var(--texte-2); }
</style>
