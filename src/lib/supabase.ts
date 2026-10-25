import { createClient } from '@supabase/supabase-js';

// The publishable (anon) key is safe to ship in the browser bundle. Row Level
// Security in Supabase is what protects tenant data, not this key.
const FALLBACK_URL = 'https://qxbkpeacbyypfbtxzudn.supabase.co';
const FALLBACK_KEY = 'sb_publishable_98ZtFmDZQpR4OZSMurDSeg_nQEH8z10';

const viteEnv = ((import.meta as any)?.env || {}) as Record<string, string | undefined>;

export const SUPABASE_URL = viteEnv.VITE_SUPABASE_URL || FALLBACK_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;

export const SUPABASE_PROJECT_REF = SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0];

/**
 * Supabase client. Supabase Auth is the identity provider: the client manages
 * its own session and sends the resulting access token, so `auth.uid()` inside
 * the RLS helpers resolves to `public.users.id`.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
