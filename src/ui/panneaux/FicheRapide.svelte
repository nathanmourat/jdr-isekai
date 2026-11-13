<script lang="ts">
  /** Fiche résumée, dépliée depuis la barre du héros (un clic l'ouvre, un autre la referme). */
  import { jeu } from '../jeu.svelte';
  import { age, caracsTotales, competencesEquipees, manaMax, pvMax, xpPourNiveau } from '../../moteur/personnage';
  import { rangGuilde } from '../../moteur/partie';
  import { aideDate, formaterDate, versDate } from '../../moteur/temps';
  import { AIDE_CARACS } from '../../moteur/fiche';
  import { NOMS_ETATS } from '../../moteur/combat';
  import { CARACS } from '../../contenu/schemas';
  import { signe } from '../outils';
  import CompetenceInfo from '../CompetenceInfo.svelte';

  let { fermer }: { fermer: () => void } = $props();
  const c = jeu.contenu!;
  const etat = $derived(jeu.etat!);
  const h = $derived(jeu.monHeros!);
  const cl = $derived(c.classes[h.classe]);
  const ra = $derived(c.races[h.race]);
  const k = $derived(caracsTotales(c, h));
  const enCombat = $derived(Object.values(etat.combats).flatMap((e) => e.combat.combattants).find((x) => x.type === 'heros' && x.herosId === h.id) ?? null);
  const fusions = $derived(Object.values(h.variantes).flat());
  const effets = $derived.by(() => {
    const res: string[] = [];
    if (h.blessure) res.push(`Blessé : −${c.config.mort_douce.blessure_pv_pourcent} % de PV max jusqu'au prochain repos`);
    if (enCombat) {
      for (const e of enCombat.etats) res.push(`${NOMS_ETATS[e.id]}${e.cumul > 1 ? ` ×${e.cumul}` : ''} (encore ${e.duree > 50 ? 'tout le combat' : `${e.duree} tour${e.duree > 1 ? 's' : ''}`})`);
      if (enCombat.bouclier > 0) res.push(`Bouclier : ${enCombat.bouclier}`);
    }
    return res;
  });
  const modRace = (x: (typeof CARACS)[number]) => h.caracsBase[x] - cl.caracteristiques[x];
</script>

<div class="fiche-rapide carte-ui" role="region" aria-label={`Fiche de ${h.nom}`}>
  <div class="ligne tete">
    <h3>{h.nom}</h3>
    <button class="petit" onclick={fermer}>Fermer ✕</button>
  </div>
  <div class="colonnes">
    <div>
      <h4>Identité</h4>
      <p>{age(h, versDate(c, etat.jour).annee)} ans · {ra.nom} · {cl.nom}</p>
      <p>{h.origine === 'invoque' ? `Invoqué — don : ${c.dons[h.don].nom}` : `Réincarné${h.origineEnfance ? ` — enfance : ${h.origineEnfance}` : ''} — don : ${c.dons[h.don].nom}`}</p>
      <h4>État</h4>
      <p>PV {enCombat ? `${enCombat.pv} / ${enCombat.pvMax}` : pvMax(c, k.VIT, h.niveau)} · Mana {enCombat ? `${enCombat.mana} / ${enCombat.manaMax}` : manaMax(k.ESP, h.niveau)}</p>
      <p>Niveau {h.niveau} · XP {h.xp} / {xpPourNiveau(c, h.niveau)} (niveau {h.niveau + 1})</p>
      <p>Rang à la Guilde : {rangGuilde(c, etat.pointsGuilde[h.id] ?? 0)} ({etat.pointsGuilde[h.id] ?? 0} points) · {h.or} or</p>
      <h4>Effets en cours</h4>
      {#each effets as e, i (i)}<p>{e}</p>{:else}<p class="discret">Aucun.</p>{/each}
      <h4>Date du monde</h4>
      <p>{formaterDate(c, etat.jour)}</p>
      {#each aideDate(c, etat.jour) as l, i (i)}<p class="discret">{l}</p>{/each}
    </div>
    <div>
      <h4>Caractéristiques</h4>
      {#each CARACS as x (x)}
        <p class="carac"><strong>{AIDE_CARACS[x].nom} ({x}) : {k[x]}</strong>{#if modRace(x) !== 0} <span class="badge">race {signe(modRace(x))}</span>{/if}<br /><small class="discret">{AIDE_CARACS[x].effet}</small></p>
      {/each}
    </div>
    <div>
      <h4>Compétences équipées</h4>
      {#each competencesEquipees(c, h) as id (id)}<p><CompetenceInfo comp={c.competences[id]} rang={h.rangsCompetences[id] ?? 1} heros={h} /></p>{/each}
      <h4>Mon grimoire</h4>
      {#each fusions as v (v)}
        {@const t = h.grimoire?.[v]}
        {#if t}<p><CompetenceInfo comp={t} rang={h.rangsCompetences[t.parent] ?? 1} heros={h} /></p>{/if}
      {:else}<p class="discret">Aucune fusion apprise pour l'instant. Votre grimoire est personnel : les autres joueurs ne le voient pas.</p>{/each}
      <h4>Trait et passif</h4>
      <p><strong>{ra.trait.nom}</strong> (race) : {ra.trait.avantage} <em>Défaut :</em> {ra.trait.defaut}</p>
      <p><strong>{cl.passif.nom}</strong> (classe) : {cl.passif.description}</p>
      <h4>Équipement</h4>
      {#each ['arme', 'armure', 'accessoire'] as const as emp (emp)}
        <p>{emp} : {h.equipement[emp] ? c.objets[h.equipement[emp]!].nom : '—'}</p>
      {/each}
    </div>
  </div>
</div>

<style>
  .fiche-rapide { position: absolute; top: 100%; right: 0.5rem; left: 0.5rem; max-width: 1100px; margin: 0.3rem auto 0; max-height: calc(100dvh - 5rem); overflow: auto; z-index: 30; border-color: var(--or); }
  .tete { justify-content: space-between; }
  .tete h3 { margin: 0; color: var(--or); }
  .colonnes { display: grid; gap: 0.5rem 1.2rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  h4 { margin: 0.7rem 0 0.2rem; color: var(--or-2); font-size: 0.95rem; }
  p { margin: 0.2em 0; font-size: 0.92rem; }
  .carac { margin-bottom: 0.4em; }
</style>
