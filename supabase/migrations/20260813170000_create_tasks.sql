create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  assigned_to uuid not null references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text,
  due_at timestamptz not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_company_status_due_idx
  on public.tasks(company_id, status, due_at);

create index if not exists tasks_assigned_status_due_idx
  on public.tasks(assigned_to, status, due_at);

create index if not exists tasks_lead_idx
  on public.tasks(lead_id);

create or replace function public.set_tasks_updated_at()
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

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_tasks_updated_at();

alter table public.tasks enable row level security;

-- A tarefa só pode ser criada dentro da empresa do utilizador. Vendedores
-- só podem atribuir a si próprios; administradores podem atribuir a membros
-- da sua empresa.
drop policy if exists "tasks_select_company_members" on public.tasks;
create policy "tasks_select_company_members"
on public.tasks for select
using (
  exists (
    select 1 from public.profiles viewer
    where viewer.id = auth.uid()
      and viewer.company_id = tasks.company_id
      and (viewer.role = 'admin' or tasks.assigned_to = auth.uid())
  )
);

drop policy if exists "tasks_insert_company_members" on public.tasks;
create policy "tasks_insert_company_members"
on public.tasks for insert
with check (
  exists (
    select 1 from public.profiles creator
    where creator.id = auth.uid()
      and creator.company_id = tasks.company_id
      and (
        (creator.role = 'sales' and tasks.assigned_to = auth.uid())
        or (
          creator.role = 'admin'
          and exists (
            select 1 from public.profiles assignee
            where assignee.id = tasks.assigned_to
              and assignee.company_id = tasks.company_id
          )
        )
      )
  )
  and tasks.created_by = auth.uid()
);

drop policy if exists "tasks_update_company_members" on public.tasks;
create policy "tasks_update_company_members"
on public.tasks for update
using (
  exists (
    select 1 from public.profiles viewer
    where viewer.id = auth.uid()
      and viewer.company_id = tasks.company_id
      and (viewer.role = 'admin' or tasks.assigned_to = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.profiles viewer
    where viewer.id = auth.uid()
      and viewer.company_id = tasks.company_id
      and (
        viewer.role = 'admin'
        or tasks.assigned_to = auth.uid()
      )
  )
);

drop policy if exists "tasks_delete_admins" on public.tasks;
create policy "tasks_delete_admins"
on public.tasks for delete
using (
  exists (
    select 1 from public.profiles viewer
    where viewer.id = auth.uid()
      and viewer.company_id = tasks.company_id
      and viewer.role = 'admin'
  )
);
