-- ─────────────────────────────────────────────────────────────
--  Les Appelés de Velmaris — base Supabase
--  À coller dans Supabase : SQL Editor → New query → Run.
--  Prérequis : Authentication → Sign In / Providers → activer « Allow anonymous sign-ins ».
-- ─────────────────────────────────────────────────────────────

create table if not exists public.parties (
  id uuid primary key,
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  nom text not null,
  depart jsonb not null,
  cree_par uuid not null default auth.uid(),
  cree_le timestamptz not null default now()
);

create table if not exists public.membres (
  partie_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  rejoint_le timestamptz not null default now(),
  primary key (partie_id, user_id)
);

create table if not exists public.actions (
  id bigserial primary key,
  partie_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  action jsonb not null,
  cree_le timestamptz not null default now()
);
create index if not exists actions_partie_idx on public.actions (partie_id, id);

-- Instantanés (réservé pour les très longues parties ; facultatif)
create table if not exists public.instantanes (
  partie_id uuid not null references public.parties(id) on delete cascade,
  indice integer not null,
  etat jsonb not null,
  primary key (partie_id, indice)
);

-- Fonction utilitaire : l'utilisateur est-il membre de la partie ?
create or replace function public.est_membre(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membres where partie_id = p and user_id = auth.uid());
$$;

-- Rejoindre une partie avec son code (sans pouvoir lister les autres parties)
create or replace function public.rejoindre_partie(code_partie text)
returns setof public.parties
language plpgsql security definer set search_path = public as $$
declare p public.parties;
begin
  select * into p from public.parties where code = upper(code_partie);
  if not found then raise exception 'Partie introuvable'; end if;
  if (select count(*) from public.membres where partie_id = p.id) >= 6
     and not exists (select 1 from public.membres where partie_id = p.id and user_id = auth.uid()) then
    raise exception 'Partie complète (6 joueurs)';
  end if;
  insert into public.membres (partie_id, user_id) values (p.id, auth.uid()) on conflict do nothing;
  return next p;
end;
$$;

-- ── Règles de sécurité (RLS) : seuls les membres voient et modifient une partie ──
alter table public.parties enable row level security;
alter table public.membres enable row level security;
alter table public.actions enable row level security;
alter table public.instantanes enable row level security;

drop policy if exists "parties: lecture membres" on public.parties;
create policy "parties: lecture membres" on public.parties for select using (public.est_membre(id) or cree_par = auth.uid());
drop policy if exists "parties: création" on public.parties;
create policy "parties: création" on public.parties for insert with check (cree_par = auth.uid());

drop policy if exists "membres: lecture" on public.membres;
create policy "membres: lecture" on public.membres for select using (public.est_membre(partie_id));
drop policy if exists "membres: le créateur s'ajoute" on public.membres;
create policy "membres: le créateur s'ajoute" on public.membres for insert
  with check (user_id = auth.uid() and exists (select 1 from public.parties where id = partie_id and cree_par = auth.uid()));

drop policy if exists "actions: lecture membres" on public.actions;
create policy "actions: lecture membres" on public.actions for select using (public.est_membre(partie_id));
drop policy if exists "actions: envoi par un membre, en son nom" on public.actions;
create policy "actions: envoi par un membre, en son nom" on public.actions for insert
  with check (public.est_membre(partie_id) and user_id = auth.uid() and (action->>'joueur') = auth.uid()::text);

drop policy if exists "instantanes: membres" on public.instantanes;
create policy "instantanes: membres" on public.instantanes for all using (public.est_membre(partie_id)) with check (public.est_membre(partie_id));

-- Temps réel sur les actions
do $$ begin
  alter publication supabase_realtime add table public.actions;
exception when duplicate_object then null; end $$;
