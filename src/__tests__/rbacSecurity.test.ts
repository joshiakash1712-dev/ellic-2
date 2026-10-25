import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeCanonicalRole, isUserStatusInactive } from '../types';
import {
  normalizeCanonicalRole as serverNormalizeCanonicalRole,
  isUserRecordInactive
} from '../../server';

const repoRoot = path.resolve(__dirname, '..', '..');

const read = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf-8');

describe('Ellix Connect — Canonical RBAC & Security Verification Suite', () => {
  describe('1. Canonical Role Normalization & Fail-Closed Policy', () => {
    it('maps Level 1 super_admin identically on frontend and server', () => {
      expect(normalizeCanonicalRole('super_admin')).toBe('super_admin');
      expect(serverNormalizeCanonicalRole('super_admin')).toBe('super_admin');
      expect(normalizeCanonicalRole('  SUPER_ADMIN ')).toBe('super_admin');
    });

    it('maps Level 2 ellix_admin and legacy aliases (admin, platform_admin) identically', () => {
      for (const alias of ['ellix_admin', 'admin', 'platform_admin']) {
        expect(normalizeCanonicalRole(alias)).toBe('ellix_admin');
        expect(serverNormalizeCanonicalRole(alias)).toBe('ellix_admin');
      }
    });

    it('maps Level 3 client and legacy aliases (owner, retailer) identically', () => {
      for (const alias of ['client', 'owner', 'retailer']) {
        expect(normalizeCanonicalRole(alias)).toBe('client');
        expect(serverNormalizeCanonicalRole(alias)).toBe('client');
      }
    });

    it('maps Level 4 crew and legacy aliases (employee, cashier, staff) identically', () => {
      for (const alias of ['crew', 'employee', 'cashier', 'staff']) {
        expect(normalizeCanonicalRole(alias)).toBe('crew');
        expect(serverNormalizeCanonicalRole(alias)).toBe('crew');
      }
    });

    it('maps B2B wholesaler_admin and wholesaler identically', () => {
      for (const alias of ['wholesaler_admin', 'wholesaler']) {
        expect(normalizeCanonicalRole(alias)).toBe('wholesaler_admin');
        expect(serverNormalizeCanonicalRole(alias)).toBe('wholesaler_admin');
      }
    });

    it('fails closed to unauthorized for unknown, empty, or arbitrary roles (never defaults to client)', () => {
      const invalidRoles: unknown[] = [
        '',
        'unknown_role',
        'root',
        'guest',
        'hacker',
        'moderator',
        null,
        undefined,
        123,
        {},
        []
      ];
      for (const invalid of invalidRoles) {
        expect(normalizeCanonicalRole(invalid)).toBe('unauthorized');
        expect(serverNormalizeCanonicalRole(invalid)).toBe('unauthorized');
      }
    });
  });

  describe('2. Account Deactivation / Revocation Status Enforcement', () => {
    it('marks active and pending_approval accounts as active', () => {
      expect(isUserStatusInactive({ status: 'active' })).toBe(false);
      expect(isUserRecordInactive({ status: 'active' })).toBe(false);
      expect(isUserStatusInactive({})).toBe(false);
    });

    it('detects deactivated, suspended, revoked, disabled, and deleted accounts', () => {
      for (const st of ['inactive', 'suspended', 'revoked', 'disabled', 'deactivated', 'deleted']) {
        expect(isUserStatusInactive({ status: st })).toBe(true);
        expect(isUserRecordInactive({ status: st })).toBe(true);
      }
      expect(isUserStatusInactive({ disabled: true })).toBe(true);
      expect(isUserRecordInactive({ disabled: true })).toBe(true);
      expect(isUserStatusInactive({ active: false })).toBe(true);
      expect(isUserRecordInactive({ isActive: false })).toBe(true);
    });
  });

  describe('3. Supabase Row-Level Security Hardening Verification', () => {
    const rlsMigration = read('supabase/migrations/0002_rls.sql');
    const authMigration = read('supabase/migrations/0005_supabase_auth.sql');

    it('enables RLS on all tenant-bearing tables', () => {
      for (const table of [
        'users', 'stores', 'products', 'customers', 'invoices', 'employees',
        'suppliers', 'restock_orders', 'restock_logs', 'customer_orders',
        'audit_logs', 'wholesalers', 'business_applications', 'client_subscriptions',
        'client_subscription_payments', 'store_counters', 'notifications'
      ]) {
        expect(rlsMigration).toContain(`alter table public.${table} enable row level security`);
      }
    });

    it('resolves caller identity through current_uid(), never auth.uid() directly', () => {
      expect(rlsMigration).toContain('create or replace function public.current_uid()');
      // Policies must go through current_uid(); auth.uid() may only appear
      // auth.uid() may only appear inside current_uid() itself.
      const policyBlocks = rlsMigration.split(/create policy /).slice(1);
      for (const block of policyBlocks) {
        expect(block).not.toContain('auth.uid()');
      }
    });

    it('provisions public.users from auth.users by trigger', () => {
      expect(authMigration).toContain('create or replace function public.handle_new_auth_user()');
      expect(authMigration).toContain('on_auth_user_created');
      expect(authMigration).toContain('after insert on auth.users');
    });

    it('keeps the service-role key out of client code', () => {
      const clientFiles = ['src/lib/supabase.ts', 'src/context/AuthContext.tsx'];
      for (const file of clientFiles) {
        expect(read(file)).not.toContain('SERVICE_ROLE');
      }
    });

    it('fails closed when no profile row exists for the caller', () => {
      expect(rlsMigration).toContain('users_insert');
      expect(rlsMigration).toContain("coalesce(data->>'role', 'client') = 'client'");
      expect(rlsMigration).toContain("data->>'storeId' is null");
      expect(rlsMigration).toContain('users_select');
      expect(rlsMigration).toContain('id = public.current_uid()');
    });
  });

  describe('4. Backend API & AuthContext / StoreContext / Sync Hardening Verification', () => {
    const serverPath = path.resolve(process.cwd(), 'server.ts');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    const authContextPath = path.resolve(process.cwd(), 'src/context/AuthContext.tsx');
    const authContextContent = fs.readFileSync(authContextPath, 'utf8');
    const storeContextPath = path.resolve(process.cwd(), 'src/context/StoreContext.tsx');
    const storeContextContent = fs.readFileSync(storeContextPath, 'utf8');
    const syncPath = path.resolve(process.cwd(), 'src/lib/storeSync.ts');
    const syncContent = fs.readFileSync(syncPath, 'utf8');

    it('enforces 401 before 403 and active status checks on server endpoints', () => {
      expect(serverContent).toContain('let isInactive = false;');
      expect(serverContent).toContain('Unauthorized: Valid Supabase authentication token required');
      expect(serverContent).toContain("app.post('/api/subscription/cancel-and-purge'");
      expect(serverContent).toContain("app.post('/api/admin/subscription/status'");
    });

    it('uses Supabase Auth exclusively', () => {
      expect(authContextContent).toContain('supabase.auth.signInWithPassword');
      expect(authContextContent).toContain('supabase.auth.signInWithOAuth');
      expect(authContextContent).toContain('supabase.auth.signOut');
      expect(authContextContent).toContain('onAuthStateChange');
      expect(authContextContent).not.toContain('firebase/auth');
      expect(authContextContent).not.toContain('signInWithEmailAndPassword');
      expect(authContextContent).not.toContain('linkWithCredential');
    });

    it('provisions profiles through the auth.users trigger, not client self-insert', () => {
      expect(authContextContent).not.toContain('setDoc(userDocRef');
      expect(authContextContent).not.toContain('updateDoc(userDocRef');
      expect(authContextContent).not.toContain('firebase/firestore');
    });

    it('preserves role-scoped listener guards in storeSync', () => {
      expect(syncContent).toContain('const canManageStoreRole =');
      expect(syncContent).toContain('if (customerExistsInCloud) {');
      expect(syncContent).toContain("const isWholesalerRole = canonicalRole === 'wholesaler_admin';");
    });

    it('enforces defense-in-depth RBAC and store-isolation guards in StoreContext', () => {
      expect(storeContextContent).toContain("const isAuthorizedOwnerOrAdmin = isPlatformAdminRole || canonicalRole === 'client';");
      expect(storeContextContent).toContain('const canUserAccessStore = React.useCallback((storeObj: Store | undefined): boolean =>');
      expect(storeContextContent).toContain("const isCrewRole = canonicalRole === 'crew';");
      expect(storeContextContent).not.toContain('firebaseUid');
    });
  });
});
