<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { caracsTotales, competencesConnues, manaMax, pvMax, xpPourNiveau, age } from '../../moteur/personnage';
  import { prixVente, rangGuilde } from '../../moteur/partie';
  import { CARACS } from '../../contenu/schemas';
  import { versDate } from '../../moteur/temps';
  import { urlAsset } from '../../rendu/assets';
  import { NOMS_CARACS, portraitHeros, redimensionnerPortrait } from '../outils';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const cl = $derived(c.classes[h.classe]);
  const ra = $derived(c.races[h.race]);
  const k = $derived(caracsTotales(c, h));
  const connues = $derived(competencesConnues(c, h));
  const inventaire = $derived(Object.entries(h.inventaire).filter(([, n]) => n > 0));
  const peutBranche = $derived(!h.branche && h.niveau >= c.config.personnage.niveau_branche);

  async function portrait(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) await jeu.agir({ type: 'portrait', image: await redimensionnerPortrait(f) });
  }
</script>

<section class="fiche">
  <div class="carte-ui identite">
    <img class="pixel" src={portraitHeros(c, h)} alt={`Portrait de ${h.nom}`} />
    <div>
      <h2>{h.nom}</h2>
      <p>{ra.nom} · {cl.nom} · {h.origine === 'invoque' ? 'Invoqué' : 'Réincarné'} · {age(h, versDate(c, etat.jour).annee)} ans</p>
      <p class="discret">Niveau {h.niveau} — XP {h.xp} / {xpPourNiveau(c, h.niveau)} · Rang de guilde {rangGuilde(c, etat.pointsGuilde[h.id] ?? 0)} · {h.or} or{h.blessure ? ' · blessé' : ''}</p>
      <p class="discret">PV max {pvMax(c, k.VIT, h.niveau)} · Mana {manaMax(k.ESP, h.niveau)}</p>
      <label class="discret">Changer de portrait <input type="file" accept="image/*" onchange={portrait} /></label>
      <label class="discret ligne">Si je suis absent, mon héros
        <select value={h.siAbsent} onchange={(e) => jeu.agir({ type: 'si_absent', mode: (e.target as HTMLSelectElement).value as 'ia' | 'camp' })} style="width:auto">
          <option value="ia">est joué par l'ordinateur</option>
          <option value="camp">reste au camp</option>
        </select>
      </label>
    </div>
  </div>

  <div class="carte-ui">
    <h3>Caractéristiques {#if h.pointsCaracDispo}<span class="badge or">{h.pointsCaracDispo} point(s) à répartir</span>{/if}</h3>
    <div class="stats">
      {#each CARACS as x (x)}
        <div><span class="discret">{NOMS_CARACS[x]}</span><strong>{k[x]}</strong>
          {#if h.pointsCaracDispo}<button class="petit" onclick={() => jeu.agir({ type: 'repartir', carac: x })}>+1</button>{/if}</div>
      {/each}
    </div>
  </div>

  <div class="carte-ui">
    <h3>Don, trait et passif</h3>
    <p><strong>Don : {c.dons[h.don].nom}</strong> — {c.dons[h.don].combat} <em>Hors combat :</em> {c.dons[h.don].hors_combat}</p>
    <p class="ligne">{#if urlAsset(`icones/races/${ra.trait.id}`)}<img class="pixel icone" src={urlAsset(`icones/races/${ra.trait.id}`)} alt="" />{/if}<strong>{ra.trait.nom}</strong> — {ra.trait.avantage} <em>Défaut :</em> {ra.trait.defaut}</p>
    <p><strong>Passif : {cl.passif.nom}</strong> — {cl.passif.description}</p>
    {#if h.atout}<p class="discret">Atout de départ : {h.atout}{h.origineEnfance ? ` · enfance : ${h.origineEnfance}` : ''}</p>{/if}
  </div>

  <div class="carte-ui">
    <h3>Compétences {#if h.pointsCompetenceDispo}<span class="badge or">{h.pointsCompetenceDispo} point(s) de compétence</span>{/if}</h3>
    {#each connues as id (id)}
      <div class="ligne item">
        <span><strong>{c.competences[id].nom}</strong> (rang {h.rangsCompetences[id] ?? 1}) <small class="discret">{c.competences[id].description}</small></span>
        {#if h.pointsCompetenceDispo && (h.rangsCompetences[id] ?? 1) < c.config.personnage.rang_competence_max}
          <button class="petit" onclick={() => jeu.agir({ type: 'ameliorer', competence: id })}>Améliorer (+10 %)</button>
        {/if}
      </div>
    {/each}
    {#if peutBranche}
      <h3>Choisir une branche</h3>
      {#each cl.branches as b (b.id)}
        <div class="ligne item"><span><strong>{b.nom}</strong> — {b.description} ({b.competences.map((x) => c.competences[x.competence].nom).join(', ')})</span>
          <button class="principal petit" onclick={() => jeu.agir({ type: 'branche', branche: b.id })}>Choisir</button></div>
      {/each}
    {:else if !h.branche}
      <p class="discret">Au niveau {c.config.personnage.niveau_branche}, vous choisirez une branche : {cl.branches.map((b) => b.nom).join(' ou ')}.</p>
    {/if}
    <p class="discret">Ultime ({c.config.saisons[0].niveau_ultime}+, après la quête de classe) : {cl.ultime.nom} — {cl.ultime.description}</p>
  </div>

  <div class="carte-ui">
    <h3>Équipement et inventaire</h3>
    {#each ['arme', 'armure', 'accessoire'] as const as emp (emp)}
      <p class="ligne">{emp} : <strong>{h.equipement[emp] ? c.objets[h.equipement[emp]!].nom : '—'}</strong>
        {#if h.equipement[emp]}<button class="petit" onclick={() => jeu.agir({ type: 'desequiper', emplacement: emp })}>Retirer</button>{/if}</p>
    {/each}
    {#each inventaire as [o, n] (o)}
      <div class="ligne item">
        <span>{c.objets[o].nom} × {n} <small class="discret">{c.objets[o].description}</small></span>
        {#if c.objets[o].type === 'equipement'}<button class="petit" onclick={() => jeu.agir({ type: 'equiper', objet: o })}>Équiper</button>{/if}
        {#if c.objets[o].type !== 'quete'}<button class="petit" onclick={() => jeu.agir({ type: 'vendre', objet: o })}>Vendre ({prixVente(c, h, o)} or)</button>{/if}
      </div>
    {:else}<p class="discret">Inventaire vide.</p>{/each}
  </div>
</section>

<style>
  .fiche { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .identite { display: flex; gap: 1rem; grid-column: 1 / -1; flex-wrap: wrap; }
  .identite img { width: 140px; height: 140px; border-radius: 10px; border: 2px solid var(--or); object-fit: cover; }
  .identite p { margin: 0.2em 0; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .stats div { display: grid; text-align: center; background: var(--fond); border-radius: 8px; padding: 0.4rem; gap: 0.2rem; }
  .stats strong { font-size: 1.3rem; color: var(--or-2); }
  .item { justify-content: space-between; border-bottom: 1px solid var(--bord); padding: 0.3rem 0; }
  .icone { width: 24px; height: 24px; }
</style>
