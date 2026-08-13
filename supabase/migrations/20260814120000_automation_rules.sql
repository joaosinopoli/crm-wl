create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  trigger_event text not null check (trigger_event in ('lead_created', 'lead_stage_changed', 'task_overdue', 'conversation_received')),
  action_type text not null check (action_type in ('create_task', 'assign_owner', 'send_notification')),
  action_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists automation_rules_company_active_idx on public.automation_rules(company_id, is_active);
alter table public.automation_rules enable row level security;

drop policy if exists automation_rules_select_company on public.automation_rules;
create policy automation_rules_select_company on public.automation_rules for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = automation_rules.company_id)
);

drop policy if exists automation_rules_write_manager on public.automation_rules;
create policy automation_rules_write_manager on public.automation_rules for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = automation_rules.company_id and p.role in ('owner', 'admin'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = automation_rules.company_id and p.role in ('owner', 'admin'))
);
