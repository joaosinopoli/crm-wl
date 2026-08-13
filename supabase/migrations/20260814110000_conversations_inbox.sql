create table if not exists public.conversation_threads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  subject text,
  channel text not null default 'manual' check (channel in ('manual', 'whatsapp', 'email', 'webchat')),
  status text not null default 'open' check (status in ('open', 'pending', 'closed')),
  last_message_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  thread_id uuid not null references public.conversation_threads(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_type text not null default 'user' check (sender_type in ('user', 'contact', 'system')),
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);

create index if not exists conversation_threads_company_last_idx on public.conversation_threads(company_id, last_message_at desc);
create index if not exists conversation_threads_company_status_idx on public.conversation_threads(company_id, status);
create index if not exists conversation_messages_thread_created_idx on public.conversation_messages(thread_id, created_at);

alter table public.conversation_threads enable row level security;
alter table public.conversation_messages enable row level security;

drop policy if exists conversation_threads_select_company on public.conversation_threads;
create policy conversation_threads_select_company on public.conversation_threads for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = conversation_threads.company_id)
);

drop policy if exists conversation_threads_write_company on public.conversation_threads;
create policy conversation_threads_write_company on public.conversation_threads for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = conversation_threads.company_id and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = conversation_threads.company_id and p.role = 'admin')
);

drop policy if exists conversation_messages_select_company on public.conversation_messages;
create policy conversation_messages_select_company on public.conversation_messages for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = conversation_messages.company_id)
);

drop policy if exists conversation_messages_insert_company on public.conversation_messages;
create policy conversation_messages_insert_company on public.conversation_messages for insert with check (
  sender_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.company_id = conversation_messages.company_id)
);

create or replace function public.touch_conversation_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversation_threads set last_message_at = new.created_at, updated_at = now() where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists conversation_message_touch_thread on public.conversation_messages;
create trigger conversation_message_touch_thread after insert on public.conversation_messages for each row execute function public.touch_conversation_thread();
