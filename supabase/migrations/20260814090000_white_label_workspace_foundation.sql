create extension if not exists pgcrypto;

create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  workspace_slug text not null unique,
  portal_name text not null default 'CRM Workspace',
  industry_key text not null default 'general',
  brand_primary_color text not null default '#2563eb',
  brand_secondary_color text not null default '#0f172a',
  brand_accent_color text not null default '#22c55e',
  logo_url text,
  favicon_url text,
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  currency text not null default 'BRL',
  lead_label_singular text not null default 'Lead',
  lead_label_plural text not null default 'Leads',
  customer_label_singular text not null default 'Cliente',
  customer_label_plural text not null default 'Clientes',
  pipeline_label text not null default 'Funil de vendas',
  feature_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workspace_settings_slug_format check (workspace_slug ~ '^[a-z0-9][a-z0-9-]{2,62}$'),
  constraint workspace_settings_colors_format check (
    brand_primary_color ~ '^#[0-9A-Fa-f]{6}$'
    and brand_secondary_color ~ '^#[0-9A-Fa-f]{6}$'
    and brand_accent_color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint workspace_settings_labels_length check (
    char_length(trim(lead_label_singular)) between 2 and 40
    and char_length(trim(lead_label_plural)) between 2 and 40
    and char_length(trim(customer_label_singular)) between 2 and 40
    and char_length(trim(customer_label_plural)) between 2 and 40
    and char_length(trim(pipeline_label)) between 2 and 60
  )
);

create table if not exists public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'sales' check (role in ('owner', 'admin', 'manager', 'sales', 'viewer')),
  is_active boolean not null default true,
  invited_at timestamptz,
  joined_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (company_id, user_id)
);

create index if not exists workspace_memberships_user_idx on public.workspace_memberships(user_id, is_active);
create index if not exists workspace_memberships_company_role_idx on public.workspace_memberships(company_id, role, is_active);

create table if not exists public.workspace_pipelines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  pipeline_key text not null check (pipeline_key ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  is_default boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, pipeline_key)
);

create index if not exists workspace_pipelines_company_active_idx on public.workspace_pipelines(company_id, is_active);

create or replace function public.bootstrap_workspace_after_company()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
begin
  base_slug := left(lower(regexp_replace(coalesce(nullif(trim(new.name), ''), 'workspace') || '-' || left(new.id::text, 8), '[^a-zA-Z0-9]+', '-', 'g')), 63);
  insert into public.workspace_settings (company_id, workspace_slug, portal_name)
  values (new.id, base_slug, coalesce(nullif(trim(new.name), ''), 'CRM Workspace'))
  on conflict (company_id) do nothing;
  insert into public.workspace_pipelines (company_id, name, pipeline_key, is_default)
  values (new.id, 'Vendas', 'sales', true)
  on conflict (company_id, pipeline_key) do nothing;
  return new;
end;
$$;

drop trigger if exists companies_bootstrap_workspace on public.companies;
create trigger companies_bootstrap_workspace
after insert on public.companies
for each row execute function public.bootstrap_workspace_after_company();

create or replace function public.bootstrap_membership_after_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.company_id is not null then
    insert into public.workspace_memberships (company_id, user_id, role)
    values (new.company_id, new.id, case when new.role = 'admin' then 'admin' else 'sales' end)
    on conflict (company_id, user_id) do update set role = excluded.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_bootstrap_membership on public.profiles;
create trigger profiles_bootstrap_membership
after insert or update of company_id, role on public.profiles
for each row execute function public.bootstrap_membership_after_profile();

create or replace function public.assign_default_pipeline_to_step()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.pipeline_id is null then
    select id into new.pipeline_id
    from public.workspace_pipelines
    where company_id = new.company_id and is_default = true and is_active = true
    order by created_at asc
    limit 1;
  end if;
  return new;
end;
$$;

alter table public.funnel_steps
  add column if not exists pipeline_id uuid references public.workspace_pipelines(id) on delete cascade;

drop trigger if exists funnel_steps_assign_default_pipeline on public.funnel_steps;
create trigger funnel_steps_assign_default_pipeline
before insert on public.funnel_steps
for each row execute function public.assign_default_pipeline_to_step();

create index if not exists funnel_steps_pipeline_position_idx on public.funnel_steps(pipeline_id, position);

insert into public.workspace_settings (
  company_id, workspace_slug, portal_name
)
select
  c.id,
  left(
    lower(regexp_replace(
      coalesce(nullif(trim(c.name), ''), 'workspace') || '-' || left(c.id::text, 8),
      '[^a-zA-Z0-9]+', '-', 'g'
    )),
    63
  ),
  coalesce(nullif(trim(c.name), ''), 'CRM Workspace')
from public.companies c
on conflict (company_id) do nothing;

insert into public.workspace_memberships (company_id, user_id, role)
select
  p.company_id,
  p.id,
  case when p.role = 'admin' then 'admin' else 'sales' end
from public.profiles p
where p.company_id is not null
on conflict (company_id, user_id) do update set role = excluded.role;

insert into public.workspace_pipelines (company_id, name, pipeline_key, is_default)
select c.id, 'Vendas', 'sales', true
from public.companies c
on conflict (company_id, pipeline_key) do nothing;

update public.funnel_steps fs
set pipeline_id = wp.id
from public.workspace_pipelines wp
where wp.company_id = fs.company_id
  and wp.pipeline_key = 'sales'
  and fs.pipeline_id is null;

create or replace function public.set_workspace_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists workspace_settings_set_updated_at on public.workspace_settings;
create trigger workspace_settings_set_updated_at
before update on public.workspace_settings
for each row execute function public.set_workspace_updated_at();

drop trigger if exists workspace_pipelines_set_updated_at on public.workspace_pipelines;
create trigger workspace_pipelines_set_updated_at
before update on public.workspace_pipelines
for each row execute function public.set_workspace_updated_at();

alter table public.workspace_settings enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_pipelines enable row level security;

drop policy if exists "workspace_settings_read_members" on public.workspace_settings;
create policy "workspace_settings_read_members"
on public.workspace_settings for select
using (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_settings.company_id
));

drop policy if exists "workspace_settings_manage_admins" on public.workspace_settings;
create policy "workspace_settings_manage_admins"
on public.workspace_settings for update
using (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_settings.company_id and viewer.role = 'admin'
))
with check (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_settings.company_id and viewer.role = 'admin'
));

drop policy if exists "workspace_settings_insert_admins" on public.workspace_settings;
create policy "workspace_settings_insert_admins"
on public.workspace_settings for insert
with check (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_settings.company_id and viewer.role = 'admin'
));

drop policy if exists "workspace_memberships_read_members" on public.workspace_memberships;
create policy "workspace_memberships_read_members"
on public.workspace_memberships for select
using (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid()
    and viewer.company_id = workspace_memberships.company_id
    and (viewer.role = 'admin' or workspace_memberships.user_id = auth.uid())
));

drop policy if exists "workspace_memberships_manage_admins" on public.workspace_memberships;
create policy "workspace_memberships_manage_admins"
on public.workspace_memberships for all
using (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_memberships.company_id and viewer.role = 'admin'
))
with check (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_memberships.company_id and viewer.role = 'admin'
));

drop policy if exists "workspace_pipelines_read_members" on public.workspace_pipelines;
create policy "workspace_pipelines_read_members"
on public.workspace_pipelines for select
using (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_pipelines.company_id
));

drop policy if exists "workspace_pipelines_manage_admins" on public.workspace_pipelines;
create policy "workspace_pipelines_manage_admins"
on public.workspace_pipelines for all
using (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_pipelines.company_id and viewer.role = 'admin'
))
with check (exists (
  select 1 from public.profiles viewer
  where viewer.id = auth.uid() and viewer.company_id = workspace_pipelines.company_id and viewer.role = 'admin'
));
