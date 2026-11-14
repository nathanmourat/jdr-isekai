<script lang="ts">
  import { jeu } from '../jeu.svelte';
  import { santeHeros } from '../sante';
  import { caracsTotales, competencesConnues, competencesEquipees, manaMax, pvMax, xpPourNiveau, age } from '../../moteur/personnage';
  import { prixVente, prochainExamen, rangHeros } from '../../moteur/partie';
  import { CARACS } from '../../contenu/schemas';
  import { versDate } from '../../moteur/temps';
  import { urlAsset } from '../../rendu/assets';
  import { portraitHeros, redimensionnerPortrait } from '../outils';
  import { AIDE_CARACS } from '../../moteur/fiche';
  import CompetenceInfo from '../CompetenceInfo.svelte';
  import ObjetInfo from '../ObjetInfo.svelte';
  import { avertissementEquipement, problemeEquipement } from '../../moteur/equipement';

  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const cl = $derived(c.classes[h.classe]);
  const ra = $derived(c.races[h.race]);
  const k = $derived(caracsTotales(c, h));
  const sante = $derived(santeHeros(c, h));
  const connues = $derived(competencesConnues(c, h));
  const equipees = $derived(competencesEquipees(c, h));
  const maxEquipees = c.config.personnage.competences_equipees_max;
  function basculerEquipee(id: string) {
    const liste = equipees.includes(id) ? equipees.filter((x) => x !== id) : [...equipees, id];
    jeu.agir({ type: 'equiper_competences', competences: liste });
  }
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
      <p class="discret">Niveau {h.niveau} — XP {h.xp} / {xpPourNiveau(c, h.niveau)} · Rang de guilde {rangHeros(etat, h.id)}{#if prochainExamen(c, etat, h.id)?.pret} <span class="badge or">examen du rang {prochainExamen(c, etat, h.id)!.rang} possible</span>{/if} · {h.or} or{h.blessure ? ' · blessé' : ''}</p>

      <div class="sante">
        <p><strong>PV : {sante.pv} / {sante.pvMax}</strong>{#if h.blessure} <span class="badge rouge">blessé : −{c.config.mort_douce.blessure_pv_pourcent} % jusqu'au repos (auberge, Temple)</span>{/if}</p>
        <div class="jauge pv"><div style={`width:${(sante.pv / sante.pvMax) * 100}%`}></div></div>
        <p><strong>Mana : {sante.mana} / {sante.manaMax}</strong> <span class="discret">(plein au début de chaque combat)</span></p>
        <div class="jauge mana"><div style="width:100%"></div></div>
      </div>
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
        <div title={`${AIDE_CARACS[x].nom} : ${AIDE_CARACS[x].effet}`}><span class="discret">{AIDE_CARACS[x].nom} ({x})</span><strong>{k[x]}</strong>
          {#if h.pointsCaracDispo}<button class="petit" onclick={() => jeu.agir({ type: 'repartir', carac: x })}>+1</button>{/if}</div>
      {/each}
    </div>
    <details class="aide-caracs">
      <summary>À quoi servent les caractéristiques ?</summary>
      {#each CARACS as x (x)}<p><strong>{AIDE_CARACS[x].nom} ({x})</strong> : {AIDE_CARACS[x].effet}</p>{/each}
    </details>
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
    <p class="discret">Rang maximum {c.config.personnage.rang_competence_max} · {equipees.length}/{maxEquipees} compétences équipées pour le combat · {c.config.personnage.variantes_max} variantes au plus par compétence (une seule active).</p>
    {#each connues as id (id)}
      <div class="item">
        <div class="ligne">
          <label class="equipe" title="Équipée pour le combat"><input type="checkbox" checked={equipees.includes(id)} disabled={!equipees.includes(id) && equipees.length >= maxEquipees} onchange={() => basculerEquipee(id)} /></label>
          <span class="detail"><CompetenceInfo comp={c.competences[id]} rang={h.rangsCompetences[id] ?? 1} heros={h} /> <small class="discret">(rang {h.rangsCompetences[id] ?? 1}/{c.config.personnage.rang_competence_max})</small></span>
          {#if h.pointsCompetenceDispo && (h.rangsCompetences[id] ?? 1) < c.config.personnage.rang_competence_max}
            <button class="petit" onclick={() => jeu.agir({ type: 'ameliorer', competence: id })}>Améliorer (+10 %)</button>
          {/if}
        </div>
        {#if (h.variantes[id] ?? []).length}
          <div class="variantes">
            <label><input type="radio" name={`var-${id}`} checked={!h.varianteActive[id]} onchange={() => jeu.agir({ type: 'variante_active', competence: id, technique: null })} /> version de base</label>
            {#each h.variantes[id] as v (v)}
              {@const t = h.grimoire?.[v]}
              <label><input type="radio" name={`var-${id}`} checked={h.varianteActive[id] === v} onchange={() => jeu.agir({ type: 'variante_active', competence: id, technique: v })} /> {t?.nom ?? v} <small class="discret">({t ? `${t.cout} mana, recharge ${t.recharge}` : ''})</small></label>
              <button class="petit danger" onclick={() => confirm(`Oublier la variante « ${t?.nom ?? v} » ?`) && jeu.agir({ type: 'oublier_variante', technique: v })}>Oublier</button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
    <p class="discret">Astuce : en combat, choisissez « Proposer mon action » et écrivez par exemple « je combine {c.competences[connues[0]]?.nom ?? 'une compétence'} et {c.competences[connues[1]]?.nom ?? 'une autre'} » pour inventer une variante (les deux compétences doivent être au rang {c.config.personnage.fusion_rang_min}).</p>
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
    <h3>📖 Mon grimoire</h3>
    <p class="discret">Vos fusions apprises. Ce grimoire est personnel et privé : les autres joueurs ne le voient pas.</p>
    {#each Object.values(h.grimoire ?? {}) as t (t.id)}
      <p><CompetenceInfo comp={t} rang={h.rangsCompetences[t.parent] ?? 1} heros={h} />{#if h.varianteActive[t.parent] === t.id} <span class="badge or">active</span>{/if}</p>
    {:else}
      <p class="discret">Encore vide. Pour apprendre une fusion : à la Guilde (liste des fusions de votre classe), ou en combat avec « Proposer mon action » (« je combine X et Y »).</p>
    {/each}
  </div>

  <div class="carte-ui">
    <h3>Équipement et inventaire</h3>
    {#each ['arme', 'armure', 'accessoire'] as const as emp (emp)}
      <p class="ligne">{emp} : {#if h.equipement[emp]}<ObjetInfo id={h.equipement[emp]!} />{:else}<strong>—</strong>{/if}
        {#if h.equipement[emp]}<button class="petit" onclick={() => jeu.agir({ type: 'desequiper', emplacement: emp })}>Retirer</button>{/if}</p>
    {/each}
    {#each inventaire as [o, n] (o)}
      <div class="ligne item">
        <ObjetInfo id={o} nombre={n} />
        {#if c.objets[o].type === 'equipement'}{@const refus = problemeEquipement(c, h, c.objets[o])}{@const malus = avertissementEquipement(c, h, c.objets[o])}<button class="petit" disabled={refus !== undefined} title={refus ?? malus ?? ''} onclick={() => jeu.agir({ type: 'equiper', objet: o })}>Équiper</button>{#if refus}<small class="refus-equip">{refus}</small>{:else if malus}<small class="malus-equip">{malus}</small>{/if}{/if}
        {#if c.objets[o].type !== 'quete'}<button class="petit" onclick={() => jeu.agir({ type: 'vendre', objet: o })}>Vendre ({prixVente(c, h, o)} or)</button>{/if}
      </div>
    {:else}<p class="discret">Inventaire vide.</p>{/each}
  </div>
</section>

<style>
  .sante p { margin: 0.2em 0; }
  .sante .jauge { height: 8px; border-radius: 4px; background: #000a; border: 1px solid var(--bord); overflow: hidden; margin-bottom: 0.3rem; }
  .sante .jauge > div { height: 100%; }
  .sante .pv > div { background: linear-gradient(90deg, #3f9b4f, #7fd18a); }
  .sante .mana > div { background: #4f8dff; }
  .badge.rouge { color: var(--rouge); border-color: #7a2f2a; }
  .malus-equip { color: #f2a33a; }
  .refus-equip { color: var(--rouge); }
  .fiche { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .identite { display: flex; gap: 1rem; grid-column: 1 / -1; flex-wrap: wrap; }
  .identite img { width: 140px; height: 140px; border-radius: 10px; border: 2px solid var(--or); object-fit: cover; }
  .identite p { margin: 0.2em 0; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .stats div { display: grid; text-align: center; background: var(--fond); border-radius: 8px; padding: 0.4rem; gap: 0.2rem; }
  .stats strong { font-size: 1.3rem; color: var(--or-2); }
  .item { justify-content: space-between; border-bottom: 1px solid var(--bord); padding: 0.3rem 0; }
  .icone { width: 24px; height: 24px; }
  .detail { flex: 1 1 220px; }
  .aide-caracs { margin-top: 0.6rem; font-size: 0.9rem; }
  .aide-caracs summary { cursor: pointer; color: var(--or-2); }
  .aide-caracs p { margin: 0.3em 0; }
  .equipe input { width: auto; }
  .variantes { display: flex; flex-wrap: wrap; gap: 0.3rem 0.8rem; align-items: center; padding: 0.3rem 0 0.2rem 2rem; font-size: 0.9rem; }
  .variantes input { width: auto; }
</style>
