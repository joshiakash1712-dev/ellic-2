import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const read = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf-8');

const readJson = (relativePath: string) => JSON.parse(read(relativePath));

const exists = (relativePath: string) => fs.existsSync(path.join(repoRoot, relativePath));

// The Supabase project ref is the single deployment target. It is pinned here
// and in three other places that must never drift apart:
//   * supabase/config.toml          — CLI target for `supabase link` / `db push`
//   * src/lib/supabase.ts           — client fallback when env vars are absent
//   * .env.example                  — documented configuration surface
const PROJECT_REF = 'qxbkpeacbyypfbtxzudn';

describe('Supabase deployment configuration', () => {
  it('pins one project ref across the CLI config, the client and the env template', () => {
    const config = read('supabase/config.toml');
    const configRef = /^project_id\s*=\s*"([^"]+)"/m.exec(config)?.[1];
    expect(configRef).toBe(PROJECT_REF);

    // The client builds its URL from this ref; the fallback must match, because
    // a wrong ref silently points the whole app at a different project.
    const client = read('src/lib/supabase.ts');
    expect(client).toContain(`https://${PROJECT_REF}.supabase.co`);

    const envExample = read('.env.example');
    expect(envExample).toContain('SUPABASE_URL');
    expect(envExample).toContain('VITE_SUPABASE_URL');
    expect(envExample).toContain('VITE_SUPABASE_PUBLISHABLE_KEY');
    expect(envExample).toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('ships migrations in order and as the source of truth for schema changes', () => {
    const dir = path.join(repoRoot, 'supabase/migrations');
    const files = fs
      .readdirSync(dir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    expect(files.length).toBeGreaterThanOrEqual(5);
    expect(files[0]).toBe('0001_init.sql');

    // Numbered, gap-free, and monotonically ordered.
    files.forEach((file, index) => {
      expect(file.startsWith(String(index + 1).padStart(4, '0'))).toBe(true);
    });

    // The auth cutover must be present: identity resolution and provisioning.
    const authMigration = fs
      .readdirSync(dir)
      .filter(file => file.endsWith('.sql'))
      .map(file => read(`supabase/migrations/${file}`))
      .join('\n');
    expect(authMigration).toContain('create or replace function public.current_uid()');
    expect(authMigration).toContain('public.handle_new_auth_user()');
    expect(authMigration).toContain('on_auth_user_created');
  });

  it('keeps the service-role key out of the client bundle', () => {
    // The service-role key bypasses RLS, so it may only ever be read through
    // process.env on the server. A VITE_ prefix would inline it into the bundle.
    const clientFiles = ['src/lib/supabase.ts', 'src/context/AuthContext.tsx'];
    for (const file of clientFiles) {
      expect(read(file)).not.toContain('SERVICE_ROLE');
    }
    expect(read('server.ts')).toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('no longer depends on the legacy platform for hosting, data or identity', () => {
    for (const file of [
      'firebase.json',
      '.firebaserc',
      'firestore.rules',
      'firestore.indexes.json',
      'firebase-applet-config.json',
      'src/lib/firebase.ts',
      'src/lib/firestoreDatabase.ts',
      'functions'
    ]) {
      expect(exists(file), `Firebase artefact still present: ${file}`).toBe(false);
    }

    const pkg = readJson('package.json');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const dep of ['firebase', 'firebase-admin', 'firebase-functions']) {
      expect(Object.keys(allDeps)).not.toContain(dep);
    }
    expect(Object.keys(allDeps)).toContain('@supabase/supabase-js');
  });

  it('builds a vendor-supabase chunk instead of a vendor-legacy chunk', () => {
    const viteConfig = read('vite.config.ts');
    expect(viteConfig).toContain("if (id.includes('@supabase')) return 'vendor-supabase';");
    expect(viteConfig).not.toContain('vendor-firebase');
    expect(viteConfig).toContain("'@supabase/supabase-js'");
  });

  it('keeps the root typecheck free of build output', () => {
    const tsconfig = readJson('tsconfig.json');
    expect(tsconfig.exclude).toContain('node_modules');
    expect(tsconfig.exclude).toContain('dist');
  });
});
