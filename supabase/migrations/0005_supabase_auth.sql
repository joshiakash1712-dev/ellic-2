-- Ellix Connect — move identity from Firebase Auth to Supabase Auth
--
-- The app previously used Firebase Auth and forwarded the Firebase ID token to
-- Supabase (Third-Party Auth). Every RLS helper resolved the caller through
-- `current_uid()`, which read the JWT `sub` claim — a Firebase uid.
--
-- Supabase Auth issues its own uuids, so this migration:
--   1. lets `public.users.id` hold a Supabase uuid,
--   2. teaches `current_uid()` to resolve `auth.uid()` first,
--   3. provisions `public.users` from `auth.users` by trigger, so a signed-up
--      user always has a profile row before any policy runs.
--
-- `current_uid()` remains the single identity entry point, so none of the ~68
-- policies have to change.

-- ---------------------------------------------------------------- identity map

-- Optional legacy mapping. The hosted project is empty, so nothing populates
-- this today; it exists so a Firebase uid can be carried forward without
-- re-keying every table if data is ever imported.
alter table public.users add column if not exists firebase_uid text;

create unique index if not exists users_firebase_uid_key
  on public.users (firebase_uid)
  where firebase_uid is not null;

-- Resolve the caller to the key used everywhere else (`public.users.id`).
-- Order: Supabase Auth uuid -> legacy mapped uid -> raw JWT sub (Firebase-era
-- tokens and service-role calls). Falls back to the raw uuid so first-time
-- sign-ups can still satisfy `users_insert` before their row exists.
create or replace function public.current_uid()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (
      select u.id
      from public.users u
      where u.id = auth.uid()::text
         or (u.firebase_uid is not null and u.firebase_uid = auth.uid()::text)
      limit 1
    ),
    auth.uid()::text,
    public.jwt_claim('sub'),
    nullif(current_setting('request.jwt.claim.sub', true), '')
  );
$$;

-- ---------------------------------------------------------------- provisioning

-- Create the profile row the moment Supabase Auth creates a user. This replaces
-- the Phase 2 client-side self-insert, which could only ever create a pristine
-- `client` root and therefore could not provision crew or wholesaler accounts.
--
-- Role comes from sign-up metadata, restricted to the same self-registration
-- set the Firebase client allowed. Everything else is server-owned.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_email text := lower(coalesce(new.email, ''));
  v_display text;
  v_providers jsonb;
  v_now text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  v_role := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'client');
  if v_role not in ('client', 'crew', 'wholesaler_admin') then
    v_role := 'client';
  end if;

  -- Same platform-owner rule as is_super_admin(), applied at creation time so
  -- the role exists before the first query runs.
  if v_email = 'joshiakash1712@gmail.com' then
    v_role := 'super_admin';
  end if;

  v_display := coalesce(
    nullif(new.raw_user_meta_data->>'displayName', ''),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );

  -- Supabase records linked providers in raw_app_meta_data.providers.
  v_providers := coalesce(
    new.raw_app_meta_data->'providers',
    case
      when new.encrypted_password is not null then '["email"]'::jsonb
      else '[]'::jsonb
    end
  );

  insert into public.users (id, data)
  values (
    new.id::text,
    jsonb_build_object(
      'uid', new.id::text,
      'email', coalesce(new.email, ''),
      'emailVerified', new.email_confirmed_at is not null,
      'displayName', v_display,
      'photoURL', coalesce(new.raw_user_meta_data->>'avatar_url', ''),
      'phoneNumber', coalesce(new.phone, ''),
      'phoneVerified', new.phone_confirmed_at is not null,
      'role', v_role,
      'clientId', 'client-' || new.id::text,
      'assignedStoreIds', '[]'::jsonb,
      'status', 'active',
      'linkedProviders', v_providers,
      'passwordSynchronized', new.encrypted_password is not null,
      'createdAt', v_now,
      'updatedAt', v_now
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Keep the mirrored verification flags accurate when a user confirms an email
-- or phone after sign-up. Only fields on guard_user_self_update's allow-list are
-- touched, so the guard accepts this update even without a caller JWT.
create or replace function public.sync_auth_user_flags()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.email is not distinct from new.email
     and old.email_confirmed_at is not distinct from new.email_confirmed_at
     and old.phone is not distinct from new.phone
     and old.phone_confirmed_at is not distinct from new.phone_confirmed_at
  then
    return new;
  end if;

  update public.users
     set data = data || jsonb_build_object(
       'email', coalesce(new.email, ''),
       'emailVerified', new.email_confirmed_at is not null,
       'phoneNumber', coalesce(new.phone, ''),
       'phoneVerified', new.phone_confirmed_at is not null,
       'updatedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
     )
   where id = new.id::text;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.sync_auth_user_flags();

-- ---------------------------------------------------------------- hardening

-- Trigger functions are not part of the callable API surface.
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.sync_auth_user_flags() from public, anon, authenticated;
