-- Ellix Connect — invoice numbering and atomic POS checkout
--
-- These replace the two legacy client-side transactions in src/lib/storeSync.ts:
--   reserveStoreInvoiceNumber / commitStoreInvoiceNumber / release...
--   syncPOSSaleAtomic (stock check + stock decrement + invoice + customer + audit)
--
-- All functions are SECURITY DEFINER: clients write `store_counters` and mutate
-- stock only through them, never with direct table writes.
--
-- Error contract (PostgREST returns these as { code, message, details }):
--   code 42501  forbidden
--   code P0001  message = 'Insufficient stock', details = {"code":"INSUFFICIENT_STOCK","productId":..., "availableStock":..., "requestedQuantity":...}
--   code P0001  message = 'Invalid quantity',   details = {"code":"INVALID_QUANTITY","productId":...}
--   code P0001  message = 'Product not found',  details = {"code":"PRODUCT_NOT_FOUND","productId":...}

-- ---------------------------------------------------------------- internals

create or replace function public._invoice_date_key(p_date text)
returns text
language sql
stable
as $$
  select case
    when p_date ~ '^\d{8}$' then p_date
    when p_date ~ '^\d{4}-\d{2}-\d{2}' then replace(substr(p_date, 1, 10), '-', '')
    else to_char(now() at time zone 'utc', 'YYYYMMDD')
  end;
$$;

-- Caller must already be authorised. Locks the store counter row.
create or replace function public._reserve_invoice_number(
  p_store_id text,
  p_invoice_id text,
  p_invoice_date text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_state jsonb;
  v_issued jsonb;
  v_by_id jsonb;
  v_last integer;
  v_seq integer;
  v_number text;
  v_date_key text;
begin
  insert into public.store_counters (store_id, data)
  values (
    p_store_id,
    jsonb_build_object(
      'storeId', p_store_id,
      'lastSequence', 0,
      'baselineSequence', 0,
      'issuedNumbers', '{}'::jsonb,
      'issuedByInvoiceId', '{}'::jsonb
    )
  )
  on conflict (store_id) do nothing;

  select data into v_state
  from public.store_counters
  where store_id = p_store_id
  for update;

  v_issued := coalesce(v_state->'issuedNumbers', '{}'::jsonb);
  v_by_id := coalesce(v_state->'issuedByInvoiceId', '{}'::jsonb);
  v_last := coalesce((v_state->>'lastSequence')::integer, 0);

  -- Idempotent: an invoice that already holds a reservation keeps its number.
  if v_by_id ? p_invoice_id then
    return v_by_id->p_invoice_id->>'invoiceNumber';
  end if;

  v_date_key := public._invoice_date_key(p_invoice_date);
  v_seq := v_last + 1;

  loop
    v_number := 'INV-' || v_date_key || '-' || lpad(v_seq::text, 2, '0');
    exit when not (v_issued ? v_number) or v_issued->>v_number = p_invoice_id;
    v_seq := v_seq + 1;
  end loop;

  v_state := v_state || jsonb_build_object(
    'storeId', p_store_id,
    'lastSequence', v_seq,
    'issuedNumbers', v_issued || jsonb_build_object(v_number, p_invoice_id),
    'issuedByInvoiceId', v_by_id || jsonb_build_object(
      p_invoice_id,
      jsonb_build_object(
        'invoiceNumber', v_number,
        'sequence', v_seq,
        'updatedAt', now()
      )
    ),
    'updatedAt', now()
  );

  update public.store_counters
  set data = v_state, updated_at = now()
  where store_id = p_store_id;

  return v_number;
end;
$$;

-- Records an authoritative number for an invoice (baseline advances too).
create or replace function public._commit_invoice_number(
  p_store_id text,
  p_invoice_id text,
  p_invoice_number text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_state jsonb;
  v_issued jsonb;
  v_by_id jsonb;
  v_last integer;
  v_baseline integer;
  v_seq integer;
  v_previous jsonb;
begin
  insert into public.store_counters (store_id, data)
  values (
    p_store_id,
    jsonb_build_object(
      'storeId', p_store_id,
      'lastSequence', 0,
      'baselineSequence', 0,
      'issuedNumbers', '{}'::jsonb,
      'issuedByInvoiceId', '{}'::jsonb
    )
  )
  on conflict (store_id) do nothing;

  select data into v_state
  from public.store_counters
  where store_id = p_store_id
  for update;

  v_issued := coalesce(v_state->'issuedNumbers', '{}'::jsonb);
  v_by_id := coalesce(v_state->'issuedByInvoiceId', '{}'::jsonb);
  v_last := coalesce((v_state->>'lastSequence')::integer, 0);
  v_baseline := coalesce((v_state->>'baselineSequence')::integer, 0);

  v_seq := coalesce(
    nullif(regexp_replace(split_part(p_invoice_number, '-', 3), '\D', '', 'g'), '')::integer,
    0
  );
  if v_seq <= 0 then
    v_seq := greatest(1, v_last);
  end if;

  v_previous := v_by_id->p_invoice_id;
  if v_previous is not null and v_previous->>'invoiceNumber' is distinct from p_invoice_number then
    if v_issued->>(v_previous->>'invoiceNumber') = p_invoice_id then
      v_issued := v_issued - (v_previous->>'invoiceNumber');
    end if;
  end if;

  v_state := v_state || jsonb_build_object(
    'lastSequence', greatest(v_last, v_seq),
    'baselineSequence', greatest(v_baseline, v_seq),
    'issuedNumbers', v_issued || jsonb_build_object(p_invoice_number, p_invoice_id),
    'issuedByInvoiceId', v_by_id || jsonb_build_object(
      p_invoice_id,
      jsonb_build_object(
        'invoiceNumber', p_invoice_number,
        'sequence', v_seq,
        'updatedAt', now()
      )
    ),
    'updatedAt', now()
  );

  update public.store_counters
  set data = v_state, updated_at = now()
  where store_id = p_store_id;
end;
$$;

-- ---------------------------------------------------------------- public API

create or replace function public.reserve_invoice_number(
  p_store_id text,
  p_invoice_id text,
  p_invoice_date text default null
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not (public.is_service_role() or public.is_store_authorized(p_store_id)) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  return public._reserve_invoice_number(p_store_id, p_invoice_id, p_invoice_date);
end;
$$;

create or replace function public.commit_invoice_number(
  p_store_id text,
  p_invoice_id text,
  p_invoice_number text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not (public.is_service_role() or public.is_store_authorized(p_store_id)) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  perform public._commit_invoice_number(p_store_id, p_invoice_id, p_invoice_number);
end;
$$;

create or replace function public.release_invoice_number(
  p_store_id text,
  p_invoice_id text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_state jsonb;
  v_issued jsonb;
  v_by_id jsonb;
  v_previous jsonb;
  v_last integer;
  v_baseline integer;
  v_entry record;
begin
  if not (public.is_service_role() or public.is_store_authorized(p_store_id)) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  select data into v_state
  from public.store_counters
  where store_id = p_store_id
  for update;

  if v_state is null then
    return;
  end if;

  v_issued := coalesce(v_state->'issuedNumbers', '{}'::jsonb);
  v_by_id := coalesce(v_state->'issuedByInvoiceId', '{}'::jsonb);
  v_baseline := coalesce((v_state->>'baselineSequence')::integer, 0);
  v_previous := v_by_id->p_invoice_id;

  if v_previous is null then
    return;
  end if;

  if v_issued->>(v_previous->>'invoiceNumber') = p_invoice_id then
    v_issued := v_issued - (v_previous->>'invoiceNumber');
  end if;
  v_by_id := v_by_id - p_invoice_id;

  v_last := v_baseline;
  for v_entry in
    select value from jsonb_each(v_by_id)
  loop
    v_last := greatest(v_last, coalesce((v_entry.value->>'sequence')::integer, 0));
  end loop;

  update public.store_counters
  set data = v_state || jsonb_build_object(
      'lastSequence', v_last,
      'issuedNumbers', v_issued,
      'issuedByInvoiceId', v_by_id,
      'updatedAt', now()
    ),
    updated_at = now()
  where store_id = p_store_id;
end;
$$;

-- Atomic POS checkout: stock check + decrement + invoice + customer + audit log.
-- Idempotent per invoice id (retries and offline replays are safe).
create or replace function public.sync_pos_sale_atomic(
  p_store_id text,
  p_invoice jsonb,
  p_products jsonb default '[]'::jsonb,
  p_customer jsonb default null,
  p_audit_log jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id text := nullif(p_invoice->>'id', '');
  v_existing jsonb;
  v_number text;
  v_item jsonb;
  v_product_id text;
  v_qty numeric;
  v_stock numeric;
  v_product jsonb;
  v_updated jsonb := '[]'::jsonb;
  v_customer jsonb;
  v_customer_id text;
  v_conflict_id text;
begin
  if v_invoice_id is null then
    raise exception 'Invoice id is required' using errcode = '22023';
  end if;

  if not (public.is_service_role() or public.is_store_authorized(p_store_id)) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if nullif(p_invoice->>'storeId', '') is not null
     and (p_invoice->>'storeId') <> p_store_id then
    raise exception 'storeId mismatch' using errcode = '42501';
  end if;

  -- Idempotency: already committed means no stock/customer/counter changes.
  select data into v_existing
  from public.invoices
  where store_id = p_store_id and id = v_invoice_id;

  if found then
    return jsonb_build_object(
      'alreadyCommitted', true,
      'invoiceNumber', v_existing->>'invoiceNumber',
      'products', '[]'::jsonb
    );
  end if;

  if coalesce(jsonb_array_length(
       case when jsonb_typeof(p_invoice->'items') = 'array'
            then p_invoice->'items' else '[]'::jsonb end), 0) = 0 then
    raise exception 'Empty cart' using errcode = 'P0001',
      detail = jsonb_build_object('code', 'EMPTY_CART')::text;
  end if;

  -- Stock: validate and decrement in one pass, holding row locks.
  for v_item in
    select value from jsonb_array_elements(coalesce(p_invoice->'items', '[]'::jsonb))
  loop
    v_product_id := nullif(v_item->>'productId', '');
    v_qty := coalesce((v_item->>'quantity')::numeric, 0);

    if v_product_id is null or v_qty <= 0 then
      raise exception 'Invalid quantity' using errcode = 'P0001',
        detail = jsonb_build_object(
          'code', 'INVALID_QUANTITY',
          'productId', v_product_id,
          'requestedQuantity', v_item->>'quantity'
        )::text;
    end if;

    select data into v_product
    from public.products
    where store_id = p_store_id and id = v_product_id
    for update;

    if not found then
      raise exception 'Product not found' using errcode = 'P0001',
        detail = jsonb_build_object('code', 'PRODUCT_NOT_FOUND', 'productId', v_product_id)::text;
    end if;

    v_stock := coalesce((v_product->>'stock')::numeric, 0);
    if v_stock < v_qty then
      raise exception 'Insufficient stock' using errcode = 'P0001',
        detail = jsonb_build_object(
          'code', 'INSUFFICIENT_STOCK',
          'productId', v_product_id,
          'availableStock', v_stock,
          'requestedQuantity', v_qty
        )::text;
    end if;

    update public.products
    set data = jsonb_set(data, '{stock}', to_jsonb(v_stock - v_qty), true)
    where store_id = p_store_id and id = v_product_id
    returning data into v_product;

    v_updated := v_updated || jsonb_build_array(v_product);
  end loop;

  -- Authoritative invoice number, self-healing against numbers already used by
  -- rows that bypassed the counter (imports, legacy writes, offline replays).
  v_number := nullif(p_invoice->>'invoiceNumber', '');

  if v_number is not null then
    select i.id into v_conflict_id
    from public.invoices i
    where i.store_id = p_store_id
      and i.id <> v_invoice_id
      and i.data->>'invoiceNumber' = v_number
    limit 1;

    if v_conflict_id is not null then
      v_number := null;
    end if;
  end if;

  while v_number is null loop
    v_number := public._reserve_invoice_number(p_store_id, v_invoice_id, p_invoice->>'date');

    select i.id into v_conflict_id
    from public.invoices i
    where i.store_id = p_store_id
      and i.id <> v_invoice_id
      and i.data->>'invoiceNumber' = v_number
    limit 1;

    if v_conflict_id is not null then
      -- Drop our reservation, register the incumbent number in the counter,
      -- then reserve again: the next free sequence is returned.
      perform public.release_invoice_number(p_store_id, v_invoice_id);
      perform public._commit_invoice_number(p_store_id, v_conflict_id, v_number);
      v_number := null;
    end if;
  end loop;

  -- Baseline committed numbers so release_invoice_number can never reissue them.
  perform public._commit_invoice_number(p_store_id, v_invoice_id, v_number);

  insert into public.invoices (id, store_id, data)
  values (
    v_invoice_id,
    p_store_id,
    p_invoice || jsonb_build_object(
      'id', v_invoice_id,
      'storeId', p_store_id,
      'invoiceNumber', v_number,
      'totalAmount', coalesce((p_invoice->>'totalAmount')::numeric, (p_invoice->>'grandTotal')::numeric),
      'updatedAt', now()
    )
  );

  -- Customer counters, merged only for the fields supplied.
  if p_customer is not null then
    v_customer_id := nullif(p_customer->>'id', '');
    if v_customer_id is not null then
      insert into public.customers (id, store_id, data)
      values (
        v_customer_id,
        p_store_id,
        p_customer || jsonb_build_object('id', v_customer_id, 'storeId', p_store_id, 'updatedAt', now())
      )
      on conflict (store_id, id) do update
        set data = customers.data || (
              p_customer || jsonb_build_object('storeId', p_store_id, 'updatedAt', now())
            );

      select data into v_customer
      from public.customers
      where store_id = p_store_id and id = v_customer_id;
    end if;
  end if;

  if p_audit_log is not null and nullif(p_audit_log->>'id', '') is not null then
    insert into public.audit_logs (id, store_id, data)
    values (
      p_audit_log->>'id',
      p_store_id,
      p_audit_log || jsonb_build_object('storeId', p_store_id, 'updatedAt', now())
    )
    on conflict (store_id, id) do nothing;
  end if;

  return jsonb_build_object(
    'alreadyCommitted', false,
    'invoiceNumber', v_number,
    'products', v_updated,
    'customer', v_customer
  );
end;
$$;

-- ---------------------------------------------------------------- grants

revoke all on function public._reserve_invoice_number(text, text, text) from public, anon, authenticated;
revoke all on function public._commit_invoice_number(text, text, text) from public, anon, authenticated;
revoke all on function public._invoice_date_key(text) from public, anon, authenticated;

grant execute on function public.reserve_invoice_number(text, text, text) to authenticated;
grant execute on function public.commit_invoice_number(text, text, text) to authenticated;
grant execute on function public.release_invoice_number(text, text) to authenticated;
grant execute on function public.sync_pos_sale_atomic(text, jsonb, jsonb, jsonb, jsonb) to authenticated;

grant execute on function public.reserve_invoice_number(text, text, text) to service_role;
grant execute on function public.commit_invoice_number(text, text, text) to service_role;
grant execute on function public.release_invoice_number(text, text) to service_role;
grant execute on function public.sync_pos_sale_atomic(text, jsonb, jsonb, jsonb, jsonb) to service_role;
