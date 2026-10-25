-- Ellix Connect — Row Level Security
--
-- Row Level Security policies. Identity is resolved by current_uid(), which checks
-- auth.uid() (Supabase uuid) first, then falls back to the JWT `sub` claim
-- (legacy tokens). Legacy uids and ids are not UUIDs.
-- Helper functions are SECURITY DEFINER so policy lookups do not recurse through RLS.
--
-- Deliberate deviations from the legacy document-store rules (documented in the migration report):
--   * PostgREST cannot distinguish "get" from "list"; where the legacy store limited a
--     crew member to their own documents, the policy filters rows instead.
--   * `store_counters` is written only by the RPC functions in 0003, never by clients.

-- ---------------------------------------------------------------- identity

create or replace function public.jwt_claim(p_key text)
returns text
language sql
stable
as $$
  select nullif(
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb)->>p_key,
    ''
  );
$$;

create or replace function public.current_uid()
returns text
language sql
stable
as $$
  select coalesce(
    public.jwt_claim('sub'),
    nullif(current_setting('request.jwt.claim.sub', true), '')
  );
$$;

create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(public.jwt_claim('role'), '') = 'service_role';
$$;

create or replace function public.user_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select nullif(u.data->>'role', '') from public.users u where u.id = public.current_uid();
$$;

create or replace function public.user_client_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select u.client_id from public.users u where u.id = public.current_uid();
$$;

create or replace function public.user_wholesaler_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select nullif(coalesce(u.data->>'wholesalerId', u.data->>'wholesaler_id'), '')
  from public.users u where u.id = public.current_uid();
$$;

-- Fail-closed: no user document, or an inactive one, grants nothing.
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.users u
    where u.id = public.current_uid()
      and coalesce(u.data->>'status', 'active') = 'active'
      and coalesce(u.data->>'disabled', 'false') <> 'true'
      and coalesce(u.data->>'isActive', 'true') <> 'false'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (public.is_active_user() and public.user_role() = 'super_admin')
      or (
        public.jwt_claim('email') = 'joshiakash1712@gmail.com'
        and coalesce(public.jwt_claim('email_verified'), '') in ('true', 'True')
        and (public.user_role() is null or public.is_active_user())
      );
$$;

create or replace function public.is_ellix_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_super_admin()
      or (
        public.is_active_user()
        and coalesce(public.user_role(), '') in ('ellix_admin', 'platform_admin', 'admin')
      );
$$;

create or replace function public.is_client_role()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.user_role(), '') in ('client', 'retailer', 'owner');
$$;

create or replace function public.is_crew_role()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.user_role(), '') in
    ('crew', 'employee', 'cashier', 'staff', 'manager', 'inventory_staff');
$$;

create or replace function public.is_wholesaler_role()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.user_role(), '') in ('wholesaler_admin', 'wholesaler');
$$;

-- ---------------------------------------------------------------- tenancy

create or replace function public.is_client_owner_of_store(p_store_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_ellix_admin()
      or (
        public.is_active_user()
        and public.is_client_role()
        and exists (
          select 1
          from public.stores s
          where s.id = p_store_id
            and (
              s.owner_uid = public.current_uid()
              or (s.client_id is not null and s.client_id = public.user_client_id())
            )
        )
      );
$$;

create or replace function public.is_crew_assigned_to_store(p_store_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_ellix_admin()
      or (
        public.is_active_user()
        and public.is_crew_role()
        and exists (
          select 1
          from public.users u
          join public.stores s on s.id = p_store_id
          where u.id = public.current_uid()
            and (u.client_id is null or s.client_id is null or u.client_id = s.client_id)
            and (u.store_id = p_store_id or p_store_id = any (u.assigned_store_ids))
        )
      );
$$;

create or replace function public.is_store_authorized(p_store_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_client_owner_of_store(p_store_id) or public.is_crew_assigned_to_store(p_store_id);
$$;

-- ---------------------------------------------------------------- guards

create or replace function public.changed_doc_keys(p_old jsonb, p_new jsonb)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(k order by k), '{}'::text[])
  from (
    select jsonb_object_keys(coalesce(p_new, '{}'::jsonb)) as k
    union
    select jsonb_object_keys(coalesce(p_old, '{}'::jsonb)) as k
  ) keys
  where (coalesce(p_new, '{}'::jsonb)->k) is distinct from (coalesce(p_old, '{}'::jsonb)->k);
$$;

-- Self-service profile edits cannot touch role, tenant anchors or status flags.
create or replace function public.guard_user_self_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  allowed text[] := array[
    'displayName', 'name', 'photoURL', 'phoneNumber', 'phoneVerified',
    'email', 'emailVerified', 'lastLoginAt', 'updatedAt',
    'linkedProviders', 'passwordSynchronized'
  ];
  changed text[];
begin
  if new.id <> public.current_uid() or public.is_ellix_admin() or public.is_service_role() then
    return new;
  end if;

  changed := public.changed_doc_keys(old.data, new.data);
  if not (changed <@ allowed) then
    raise exception 'Forbidden profile fields: %', array_to_string(changed, ', ')
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Crew may restock but never change product identity, prices or sharing flags.
create or replace function public.guard_product_crew_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  allowed text[] := array['stock', 'updatedAt', 'lastRestockedAt', 'lastRestockedBy', 'lastRestockedQty', 'storeId'];
  changed text[];
begin
  if public.is_client_owner_of_store(new.store_id) or public.is_service_role() then
    return new;
  end if;

  changed := public.changed_doc_keys(old.data, new.data);
  if not (changed <@ allowed) then
    raise exception 'Crew cannot modify product fields: %', array_to_string(changed, ', ')
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Crew POS writes may only move loyalty/credit/purchase totals upward.
create or replace function public.guard_customer_crew_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  allowed text[] := array['totalPurchases', 'loyaltyPoints', 'creditBalance', 'updatedAt', 'storeId'];
  changed text[];
  old_points numeric := coalesce((old.data->>'loyaltyPoints')::numeric, 0);
  new_points numeric := coalesce((new.data->>'loyaltyPoints')::numeric, 0);
  old_credit numeric := coalesce((old.data->>'creditBalance')::numeric, 0);
  new_credit numeric := coalesce((new.data->>'creditBalance')::numeric, 0);
  old_purchases numeric := coalesce((old.data->>'totalPurchases')::numeric, 0);
  new_purchases numeric := coalesce((new.data->>'totalPurchases')::numeric, 0);
begin
  if public.is_client_owner_of_store(new.store_id) or public.is_service_role() then
    return new;
  end if;

  changed := public.changed_doc_keys(old.data, new.data);
  if not (changed <@ allowed) then
    raise exception 'Crew cannot modify customer fields: %', array_to_string(changed, ', ')
      using errcode = '42501';
  end if;
  if new_points < old_points or (new_points - old_points) > 5000 then
    raise exception 'Crew cannot redeem or inflate loyalty points' using errcode = '42501';
  end if;
  if new_credit < old_credit then
    raise exception 'Crew cannot reduce customer credit balance' using errcode = '42501';
  end if;
  if new_purchases < old_purchases then
    raise exception 'Crew cannot reduce customer purchase totals' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Clients may edit business profile fields only; billing/plan/status stay admin-only.
create or replace function public.guard_client_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  allowed text[] := array['name', 'businessName', 'phone', 'email', 'address', 'city', 'gstin', 'updatedAt'];
  changed text[];
begin
  if public.is_ellix_admin() or public.is_service_role() then
    return new;
  end if;

  changed := public.changed_doc_keys(old.data, new.data);
  if not (changed <@ allowed) then
    raise exception 'Clients cannot modify billing fields: %', array_to_string(changed, ', ')
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Wholesalers may only quote/ship: quantities, prices, status, tracking.
create or replace function public.guard_restock_order_wholesaler_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  allowed text[] := array[
    'status', 'quotedQty', 'quotedUnitPrice', 'totalQuotedAmount',
    'deliveryDate', 'trackingNumber', 'notes', 'updatedAt'
  ];
  changed text[];
begin
  if public.is_client_owner_of_store(new.store_id) or public.is_service_role() then
    return new;
  end if;

  changed := public.changed_doc_keys(old.data, new.data);
  if not (changed <@ allowed) then
    raise exception 'Wholesaler cannot modify restock order fields: %', array_to_string(changed, ', ')
      using errcode = '42501';
  end if;
  if coalesce(new.data->>'status', '') not in ('quoted', 'accepted', 'shipped', 'rejected') then
    raise exception 'Invalid wholesaler status transition' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists users_guard_self_update on public.users;
create trigger users_guard_self_update
  before update on public.users
  for each row execute function public.guard_user_self_update();

drop trigger if exists clients_guard_profile_update on public.clients;
create trigger clients_guard_profile_update
  before update on public.clients
  for each row execute function public.guard_client_profile_update();

drop trigger if exists products_guard_crew_update on public.products;
create trigger products_guard_crew_update
  before update on public.products
  for each row execute function public.guard_product_crew_update();

drop trigger if exists customers_guard_crew_update on public.customers;
create trigger customers_guard_crew_update
  before update on public.customers
  for each row execute function public.guard_customer_crew_update();

drop trigger if exists restock_orders_guard_wholesaler_update on public.restock_orders;
create trigger restock_orders_guard_wholesaler_update
  before update on public.restock_orders
  for each row execute function public.guard_restock_order_wholesaler_update();

-- ---------------------------------------------------------------- enable RLS

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.client_subscriptions enable row level security;
alter table public.client_subscription_payments enable row level security;
alter table public.business_applications enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.employees enable row level security;
alter table public.suppliers enable row level security;
alter table public.restock_logs enable row level security;
alter table public.restock_orders enable row level security;
alter table public.customer_orders enable row level security;
alter table public.audit_logs enable row level security;
alter table public.wholesalers enable row level security;
alter table public.notifications enable row level security;
alter table public.store_counters enable row level security;

revoke all on public.store_counters from anon, authenticated;
grant select on public.store_counters to authenticated;

-- ---------------------------------------------------------------- users

drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select using (id = public.current_uid() or public.is_ellix_admin());

drop policy if exists users_insert on public.users;
create policy users_insert on public.users
  for insert with check (
    id = public.current_uid()
    and coalesce(data->>'role', 'client') = 'client'
    and coalesce(data->>'clientId', 'client-' || id) = 'client-' || id
    and coalesce(data->>'client_id', 'client-' || id) = 'client-' || id
    and data->>'storeId' is null
    and data->>'store_id' is null
    and coalesce(jsonb_array_length(
      case when jsonb_typeof(data->'assignedStoreIds') = 'array'
           then data->'assignedStoreIds' else '[]'::jsonb end), 0) = 0
    and coalesce(data->>'status', 'active') = 'active'
    and coalesce(data->>'disabled', 'false') <> 'true'
    and coalesce(data->>'isActive', 'true') <> 'false'
    and not (data ? 'permissions')
    and not (data ? 'isAdmin')
    and not (data ? 'ownerUid')
  );

drop policy if exists users_update on public.users;
create policy users_update on public.users
  for update using (id = public.current_uid() or public.is_ellix_admin())
  with check (id = public.current_uid() or public.is_ellix_admin());

drop policy if exists users_delete on public.users;
create policy users_delete on public.users
  for delete using (public.is_super_admin());

-- ---------------------------------------------------------------- onboarding

drop policy if exists business_applications_insert on public.business_applications;
create policy business_applications_insert on public.business_applications
  for insert with check (coalesce(data->>'status', 'pending') = 'pending');

drop policy if exists business_applications_select on public.business_applications;
create policy business_applications_select on public.business_applications
  for select using (public.is_ellix_admin());

drop policy if exists business_applications_update on public.business_applications;
create policy business_applications_update on public.business_applications
  for update using (public.is_ellix_admin()) with check (public.is_ellix_admin());

drop policy if exists business_applications_delete on public.business_applications;
create policy business_applications_delete on public.business_applications
  for delete using (public.is_ellix_admin());

-- ---------------------------------------------------------------- stores

drop policy if exists stores_select on public.stores;
create policy stores_select on public.stores
  for select using (
    public.is_ellix_admin()
    or public.is_crew_assigned_to_store(id)
    or public.is_client_owner_of_store(id)
  );

drop policy if exists stores_insert on public.stores;
create policy stores_insert on public.stores
  for insert with check (
    public.is_ellix_admin()
    or (
      public.is_client_role()
      and public.is_active_user()
      and data->>'ownerUid' = public.current_uid()
      and (
        public.user_client_id() is null
        or coalesce(data->>'clientId', data->>'client_id') = public.user_client_id()
      )
    )
  );

drop policy if exists stores_update on public.stores;
create policy stores_update on public.stores
  for update using (public.is_client_owner_of_store(id))
  with check (public.is_client_owner_of_store(id));

drop policy if exists stores_delete on public.stores;
create policy stores_delete on public.stores
  for delete using (public.is_ellix_admin() or public.is_client_owner_of_store(id));

-- ---------------------------------------------------------------- products

drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (
    public.is_store_authorized(store_id)
    or (public.is_wholesaler_role() and (data->'sharedWithWholesalers') = 'true'::jsonb)
  );

drop policy if exists products_insert on public.products;
create policy products_insert on public.products
  for insert with check (public.is_store_authorized(store_id));

drop policy if exists products_update on public.products;
create policy products_update on public.products
  for update using (public.is_store_authorized(store_id))
  with check (public.is_store_authorized(store_id));

drop policy if exists products_delete on public.products;
create policy products_delete on public.products
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- customers

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select using (public.is_store_authorized(store_id));

drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers
  for insert with check (
    public.is_client_owner_of_store(store_id)
    or (
      public.is_crew_assigned_to_store(store_id)
      and coalesce((data->>'loyaltyPoints')::numeric, 0) = 0
      and coalesce((data->>'creditBalance')::numeric, 0) = 0
      and coalesce((data->>'totalPurchases')::numeric, 0) = 0
    )
  );

drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers
  for update using (public.is_store_authorized(store_id))
  with check (public.is_store_authorized(store_id));

drop policy if exists customers_delete on public.customers;
create policy customers_delete on public.customers
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- invoices

drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices
  for select using (
    public.is_client_owner_of_store(store_id)
    or (
      public.is_crew_assigned_to_store(store_id)
      and data->>'cashierId' = public.current_uid()
    )
  );

drop policy if exists invoices_insert on public.invoices;
create policy invoices_insert on public.invoices
  for insert with check (
    public.is_client_owner_of_store(store_id)
    or (
      public.is_crew_assigned_to_store(store_id)
      and data->>'cashierId' = public.current_uid()
      and coalesce(data->>'createdById', public.current_uid()) = public.current_uid()
      and coalesce((data->>'discountAmount')::numeric, 0) = 0
      and coalesce((data->>'discountTotal')::numeric, 0) = 0
      and coalesce((data->>'discountPercent')::numeric, 0) = 0
      and coalesce((data->>'flatDiscount')::numeric, 0) = 0
      and coalesce((data->>'loyaltyPointsRedeemed')::numeric, 0) = 0
    )
  );

drop policy if exists invoices_update on public.invoices;
create policy invoices_update on public.invoices
  for update using (public.is_client_owner_of_store(store_id))
  with check (public.is_client_owner_of_store(store_id));

drop policy if exists invoices_delete on public.invoices;
create policy invoices_delete on public.invoices
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- staff

drop policy if exists employees_select on public.employees;
create policy employees_select on public.employees
  for select using (public.is_client_owner_of_store(store_id));

drop policy if exists employees_insert on public.employees;
create policy employees_insert on public.employees
  for insert with check (public.is_client_owner_of_store(store_id));

drop policy if exists employees_update on public.employees;
create policy employees_update on public.employees
  for update using (public.is_client_owner_of_store(store_id))
  with check (public.is_client_owner_of_store(store_id));

drop policy if exists employees_delete on public.employees;
create policy employees_delete on public.employees
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- suppliers

drop policy if exists suppliers_select on public.suppliers;
create policy suppliers_select on public.suppliers
  for select using (public.is_store_authorized(store_id));

drop policy if exists suppliers_insert on public.suppliers;
create policy suppliers_insert on public.suppliers
  for insert with check (public.is_client_owner_of_store(store_id));

drop policy if exists suppliers_update on public.suppliers;
create policy suppliers_update on public.suppliers
  for update using (public.is_client_owner_of_store(store_id))
  with check (public.is_client_owner_of_store(store_id));

drop policy if exists suppliers_delete on public.suppliers;
create policy suppliers_delete on public.suppliers
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- restock logs

drop policy if exists restock_logs_select on public.restock_logs;
create policy restock_logs_select on public.restock_logs
  for select using (public.is_store_authorized(store_id));

drop policy if exists restock_logs_insert on public.restock_logs;
create policy restock_logs_insert on public.restock_logs
  for insert with check (
    public.is_client_owner_of_store(store_id)
    or (
      public.is_crew_assigned_to_store(store_id)
      and (data ? 'crewId' or data ? 'addedById')
      and coalesce(data->>'crewId', public.current_uid()) = public.current_uid()
      and coalesce(data->>'addedById', public.current_uid()) = public.current_uid()
    )
  );

drop policy if exists restock_logs_update on public.restock_logs;
create policy restock_logs_update on public.restock_logs
  for update using (public.is_client_owner_of_store(store_id))
  with check (public.is_client_owner_of_store(store_id));

drop policy if exists restock_logs_delete on public.restock_logs;
create policy restock_logs_delete on public.restock_logs
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- restock orders

drop policy if exists restock_orders_select on public.restock_orders;
create policy restock_orders_select on public.restock_orders
  for select using (
    public.is_client_owner_of_store(store_id)
    or (
      public.is_wholesaler_role()
      and (
        public.user_wholesaler_id() is null
        or data->>'wholesalerId' = public.user_wholesaler_id()
      )
    )
  );

drop policy if exists restock_orders_insert on public.restock_orders;
create policy restock_orders_insert on public.restock_orders
  for insert with check (public.is_client_owner_of_store(store_id));

drop policy if exists restock_orders_update on public.restock_orders;
create policy restock_orders_update on public.restock_orders
  for update using (
    public.is_client_owner_of_store(store_id) or public.is_wholesaler_role()
  )
  with check (
    public.is_client_owner_of_store(store_id) or public.is_wholesaler_role()
  );

drop policy if exists restock_orders_delete on public.restock_orders;
create policy restock_orders_delete on public.restock_orders
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- customer orders

drop policy if exists customer_orders_select on public.customer_orders;
create policy customer_orders_select on public.customer_orders
  for select using (public.is_store_authorized(store_id));

drop policy if exists customer_orders_insert on public.customer_orders;
create policy customer_orders_insert on public.customer_orders
  for insert with check (public.is_store_authorized(store_id));

drop policy if exists customer_orders_update on public.customer_orders;
create policy customer_orders_update on public.customer_orders
  for update using (public.is_store_authorized(store_id))
  with check (public.is_store_authorized(store_id));

drop policy if exists customer_orders_delete on public.customer_orders;
create policy customer_orders_delete on public.customer_orders
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- audit trail

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
  for select using (public.is_client_owner_of_store(store_id));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
  for insert with check (public.is_store_authorized(store_id));

drop policy if exists audit_logs_delete on public.audit_logs;
create policy audit_logs_delete on public.audit_logs
  for delete using (public.is_super_admin());
-- No UPDATE policy: the audit trail is append-only.

-- ---------------------------------------------------------------- wholesalers

drop policy if exists wholesalers_select on public.wholesalers;
create policy wholesalers_select on public.wholesalers
  for select using (public.is_client_owner_of_store(store_id));

drop policy if exists wholesalers_insert on public.wholesalers;
create policy wholesalers_insert on public.wholesalers
  for insert with check (public.is_client_owner_of_store(store_id));

drop policy if exists wholesalers_update on public.wholesalers;
create policy wholesalers_update on public.wholesalers
  for update using (public.is_client_owner_of_store(store_id))
  with check (public.is_client_owner_of_store(store_id));

drop policy if exists wholesalers_delete on public.wholesalers;
create policy wholesalers_delete on public.wholesalers
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- notifications

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (
    public.is_store_authorized(store_id)
    and (
      public.is_client_owner_of_store(store_id)
      or public.is_ellix_admin()
      or coalesce(data->>'targetRole', '') <> 'client'
    )
  );

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert with check (public.is_store_authorized(store_id));

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (public.is_client_owner_of_store(store_id))
  with check (public.is_client_owner_of_store(store_id));

drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete using (public.is_client_owner_of_store(store_id));

-- ---------------------------------------------------------------- clients & billing

drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients
  for select using (
    public.is_ellix_admin()
    or (
      public.is_active_user()
      and public.is_client_role()
      and public.user_client_id() = id
    )
  );

drop policy if exists clients_insert on public.clients;
create policy clients_insert on public.clients
  for insert with check (public.is_ellix_admin());

drop policy if exists clients_update on public.clients;
create policy clients_update on public.clients
  for update using (
    public.is_ellix_admin()
    or (
      public.is_active_user()
      and public.is_client_role()
      and public.user_client_id() = id
    )
  )
  with check (
    public.is_ellix_admin()
    or (
      public.is_active_user()
      and public.is_client_role()
      and public.user_client_id() = id
    )
  );

drop policy if exists clients_delete on public.clients;
create policy clients_delete on public.clients
  for delete using (public.is_ellix_admin());

drop policy if exists client_subscriptions_select on public.client_subscriptions;
create policy client_subscriptions_select on public.client_subscriptions
  for select using (
    public.is_ellix_admin()
    or (
      public.is_active_user()
      and public.is_client_role()
      and public.user_client_id() = client_id
    )
  );

drop policy if exists client_subscriptions_write on public.client_subscriptions;
create policy client_subscriptions_write on public.client_subscriptions
  for insert with check (public.is_ellix_admin());

drop policy if exists client_subscriptions_update on public.client_subscriptions;
create policy client_subscriptions_update on public.client_subscriptions
  for update using (public.is_ellix_admin()) with check (public.is_ellix_admin());

drop policy if exists client_subscriptions_delete on public.client_subscriptions;
create policy client_subscriptions_delete on public.client_subscriptions
  for delete using (public.is_super_admin());

drop policy if exists client_payments_select on public.client_subscription_payments;
create policy client_payments_select on public.client_subscription_payments
  for select using (
    public.is_ellix_admin()
    or (
      public.is_active_user()
      and public.is_client_role()
      and public.user_client_id() = client_id
    )
  );

drop policy if exists client_payments_insert on public.client_subscription_payments;
create policy client_payments_insert on public.client_subscription_payments
  for insert with check (public.is_ellix_admin());

drop policy if exists client_payments_update on public.client_subscription_payments;
create policy client_payments_update on public.client_subscription_payments
  for update using (public.is_ellix_admin()) with check (public.is_ellix_admin());

drop policy if exists client_payments_delete on public.client_subscription_payments;
create policy client_payments_delete on public.client_subscription_payments
  for delete using (public.is_super_admin());

-- ---------------------------------------------------------------- sequence state

drop policy if exists store_counters_select on public.store_counters;
create policy store_counters_select on public.store_counters
  for select using (public.is_store_authorized(store_id));

-- ---------------------------------------------------------------- grants

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
revoke all on public.store_counters from anon, authenticated;
grant select on public.store_counters to authenticated;
