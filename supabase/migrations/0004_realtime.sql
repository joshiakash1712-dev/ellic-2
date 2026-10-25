-- Ellix Connect — Realtime
--
-- The client currently uses 14 onSnapshot listeners. They map to postgres_changes
-- subscriptions on these tables; RLS is enforced for each subscriber's JWT.
-- replica identity full so UPDATE/DELETE payloads carry the document body.

do $$
declare
  t text;
begin
  foreach t in array array[
    'stores', 'users', 'clients', 'client_subscriptions', 'store_counters',
    'products', 'customers', 'invoices', 'employees', 'suppliers',
    'restock_logs', 'restock_orders', 'customer_orders', 'audit_logs',
    'wholesalers', 'notifications'
  ]
  loop
    execute format('alter table public.%I replica identity full', t);

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;
