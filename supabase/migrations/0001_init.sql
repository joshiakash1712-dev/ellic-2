-- Ellix Connect — Supabase schema (Phase 1: database)
--
-- Document-shaped tables mirror the legacy document store layout so the client
-- data layer can be swapped without touching the UI:
--   * `data`      — the original document payload
--   * `store_id`  — derived from data->>'storeId' by trigger; used by RLS + indexes
--   * `client_id` — derived from data->>'clientId' by trigger; used by RLS
--   * `id`        — the document id (text, not uuid: legacy ids)
--
-- Invariants that the legacy store enforced in rules/transactions are enforced here by
-- triggers (crew field immutability) and by SECURITY DEFINER functions
-- (invoice numbering + atomic POS sale), never by multi-step client writes.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- helpers

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Convert an incoming JSON array to text[]; anything else becomes '{}'.
create or replace function public.jsonb_text_array(j jsonb)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(v), '{}'::text[])
  from jsonb_array_elements_text(
    case when jsonb_typeof(j) = 'array' then j else '[]'::jsonb end
  ) as t(v);
$$;

-- Store-scoped documents: storeId must be present and is mirrored into a column.
-- Partial updates that omit storeId inherit the existing scope; changing scope
-- is rejected for everyone except Ellix admins and the service role.
create or replace function public.sync_store_scoped_columns()
returns trigger
language plpgsql
as $$
declare
  v_store_id text;
  v_client_id text;
begin
  if tg_op = 'UPDATE' then
    v_store_id := coalesce(new.data->>'storeId', new.data->>'store_id', old.store_id);
  else
    v_store_id := coalesce(new.data->>'storeId', new.data->>'store_id');
  end if;

  if v_store_id is null or v_store_id = '' then
    raise exception 'storeId is required in document data'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' and v_store_id is distinct from old.store_id
     and not (public.is_service_role() or public.is_ellix_admin()) then
    raise exception 'storeId cannot be changed'
      using errcode = '42501';
  end if;

  v_client_id := coalesce(new.data->>'clientId', new.data->>'client_id');

  new.store_id := v_store_id;
  if v_client_id is not null then
    new.client_id := v_client_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Users: tenant anchors are mirrored into columns for RLS lookups.
create or replace function public.sync_user_columns()
returns trigger
language plpgsql
as $$
begin
  new.client_id := coalesce(new.data->>'clientId', new.data->>'client_id', new.client_id);
  new.store_id := coalesce(new.data->>'storeId', new.data->>'store_id', new.store_id);
  new.assigned_store_ids := public.jsonb_text_array(new.data->'assignedStoreIds');
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- users

create table if not exists public.users (
  id text primary key,
  client_id text,
  store_id text,
  assigned_store_ids text[] not null default '{}'::text[],
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_client_id_idx on public.users (client_id);
create index if not exists users_role_idx on public.users ((data->>'role'));

drop trigger if exists users_sync_columns on public.users;
create trigger users_sync_columns
  before insert or update on public.users
  for each row execute function public.sync_user_columns();

-- ---------------------------------------------------------------- clients & billing

create table if not exists public.clients (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_subscriptions (
  client_id text primary key references public.clients(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_subscription_payments (
  id text primary key,
  client_id text not null references public.clients(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_subscription_payments_client_idx
  on public.client_subscription_payments (client_id);

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists client_subscriptions_updated_at on public.client_subscriptions;
create trigger client_subscriptions_updated_at
  before update on public.client_subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists client_subscription_payments_updated_at on public.client_subscription_payments;
create trigger client_subscription_payments_updated_at
  before update on public.client_subscription_payments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- onboarding

create table if not exists public.business_applications (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_applications_status_idx
  on public.business_applications ((data->>'status'));

drop trigger if exists business_applications_updated_at on public.business_applications;
create trigger business_applications_updated_at
  before update on public.business_applications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- stores

create table if not exists public.stores (
  id text primary key,
  client_id text,
  owner_uid text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stores_client_id_idx on public.stores (client_id);
create index if not exists stores_owner_uid_idx on public.stores (owner_uid);

create or replace function public.sync_store_columns()
returns trigger
language plpgsql
as $$
begin
  new.client_id := coalesce(new.data->>'clientId', new.data->>'client_id', new.client_id);
  new.owner_uid := coalesce(new.data->>'ownerUid', new.owner_uid);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists stores_sync_columns on public.stores;
create trigger stores_sync_columns
  before insert or update on public.stores
  for each row execute function public.sync_store_columns();

-- ---------------------------------------------------------------- store-scoped tables

create table if not exists public.products (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.customers (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.invoices (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.employees (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.suppliers (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.restock_logs (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.restock_orders (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.customer_orders (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.audit_logs (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.wholesalers (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

create table if not exists public.notifications (
  id text not null,
  store_id text not null references public.stores(id) on delete cascade,
  client_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = data->>'id'),
  primary key (store_id, id)
);

-- Invoice sequence state. Written only through the RPC functions in 0003.
create table if not exists public.store_counters (
  store_id text primary key references public.stores(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Indexes used by RLS, store scoping and CPS/CRM lookups.
do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'customers', 'invoices', 'employees', 'suppliers',
    'restock_logs', 'restock_orders', 'customer_orders', 'audit_logs',
    'wholesalers', 'notifications'
  ]
  loop
    execute format('create index if not exists %I on public.%I (store_id)', t || '_store_idx', t);
  end loop;
end;
$$;

create index if not exists products_shared_idx on public.products (store_id) where (data->>'sharedWithWholesalers') = 'true';
create index if not exists invoices_store_created_idx on public.invoices (store_id, created_at desc);
create index if not exists invoices_store_cashier_idx on public.invoices (store_id, (data->>'cashierId'));
create unique index if not exists invoices_store_number_uniq
  on public.invoices (store_id, (data->>'invoiceNumber'));
create index if not exists restock_orders_wholesaler_idx on public.restock_orders (store_id, (data->>'wholesalerId'));

-- Column-sync triggers for every store-scoped table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'customers', 'invoices', 'employees', 'suppliers',
    'restock_logs', 'restock_orders', 'customer_orders', 'audit_logs',
    'wholesalers', 'notifications'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_sync_columns', t);
    execute format(
      'create trigger %I before insert or update on public.%I
         for each row execute function public.sync_store_scoped_columns()',
      t || '_sync_columns', t
    );
  end loop;
end;
$$;
