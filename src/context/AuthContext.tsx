import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { normalizeCanonicalRole, isUserStatusInactive } from '../types';

export type ProfileRole =
  | 'super_admin'
  | 'ellix_admin'
  | 'client'
  | 'crew'
  | 'wholesaler_admin'
  | 'unauthorized'
  // Legacy compatibility
  | 'retailer'
  | 'owner'
  | 'wholesaler'
  | 'admin'
  | 'platform_admin'
  | 'employee'
  | 'cashier'
  | 'staff';

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  displayName?: string;
  photoURL?: string;
  role: ProfileRole;
  clientId?: string;
  assignedStoreIds?: string[];
  wholesalerId?: string;
  status?: 'active' | 'pending_approval' | 'suspended' | 'inactive' | 'revoked' | 'disabled';
  disabled?: boolean;
  active?: boolean;
  isActive?: boolean;
  linkedProviders: string[]; // e.g. ['google', 'email', 'phone']
  passwordSynchronized: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * The authenticated principal. Mirrors the subset of the Supabase Auth `User` shape
 * the app consumed (`uid`, `email`, `displayName`, `photoURL`, `phoneNumber`,
 * `emailVerified`, `providerData`) so no consumer component had to change.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  providerData: { providerId: string }[];
}

/**
 * A pending phone-verification challenge. Phone OTP has no browser-side
 * Supabase equivalent, so the flow is delegated to a swappable adapter. This
 * type replaces the legacy `ConfirmationResult` in the phone UI.
 */
export interface PhoneOtpChallenge {
  verificationId: string;
  phoneNumber: string;
}

export interface PhoneOtpAdapter {
  /** Prepare a challenge (reCAPTCHA container or equivalent widget). */
  setUp(containerId: string): unknown;
  /** Send a code and return the pending challenge. */
  send(phoneNumber: string, handle: unknown): Promise<PhoneOtpChallenge>;
  /** Complete the challenge. */
  confirm(challenge: PhoneOtpChallenge, code: string): Promise<void>;
}

export type AuthModalMode = 'login' | 'register' | 'phone' | 'forgot_password';

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  isSyncHubOpen: boolean;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setIsSyncHubOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string,
    role?: ProfileRole
  ) => Promise<void>;
  setUpPhoneRecaptcha: (containerId: string) => unknown;
  sendPhoneOtp: (phoneNumber: string, handle: unknown) => Promise<PhoneOtpChallenge>;
  confirmPhoneOtp: (
    challenge: PhoneOtpChallenge,
    otpCode: string,
    displayName?: string,
    role?: ProfileRole
  ) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  linkEmailAndPassword: (email: string, password: string) => Promise<void>;
  linkPhoneOtp: (challenge: PhoneOtpChallenge, otpCode: string) => Promise<void>;
  synchronizeMasterPassword: (newPassword: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
  refreshUserProfile: () => Promise<void>;
  loginWithDemoRole: (role: ProfileRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'joshiakash1712@gmail.com';

// Supabase returns snake_case error codes; the existing UI branches on legacy
// style `auth/*` codes. Map the common ones so error messaging is unchanged.
const LEGACY_ERROR_CODES: Record<string, string> = {
  invalid_credentials: 'auth/invalid-credential',
  invalid_login_credentials: 'auth/invalid-login-credentials',
  email_not_confirmed: 'auth/unverified-email',
  user_already_exists: 'auth/email-already-in-use',
  over_email_send_rate_limit: 'auth/too-many-requests',
  same_password: 'auth/requires-recent-login',
  phone_not_confirmed: 'auth/invalid-verification-code',
  otp_expired: 'auth/code-expired'
};

function authError(error: unknown): Error & { code?: string } {
  const source = error as { message?: string; code?: string; error_code?: string } | null;
  const rawCode = source?.code || source?.error_code || '';
  const err = new Error(source?.message || 'Authentication failed') as Error & { code?: string };
  err.code = LEGACY_ERROR_CODES[rawCode] || rawCode || 'auth/unknown';
  return err;
}

function toAuthUser(user: SupabaseUser): AuthUser {
  const meta = (user.user_metadata || {}) as Record<string, any>;
  const providers = Array.isArray(user.app_metadata?.providers)
    ? (user.app_metadata.providers as string[])
    : [];
  return {
    uid: user.id,
    email: user.email ?? null,
    displayName:
      (meta.displayName as string) ||
      (meta.full_name as string) ||
      (meta.name as string) ||
      null,
    photoURL: (meta.avatar_url as string) || (meta.picture as string) || null,
    phoneNumber: user.phone ?? null,
    emailVerified: Boolean(user.email_confirmed_at),
    providerData: providers.map(providerId => ({ providerId }))
  };
}

/**
 * Phone OTP has no browser-side Supabase implementation. This default adapter
 * reports itself as unconfigured so the UI shows a clear message instead of
 * failing silently. Assign `window.__ellixPhoneOtpAdapter` (or replace this
 * object) with a provider-backed implementation to enable SMS sign-in.
 */
const unconfiguredPhoneOtpAdapter: PhoneOtpAdapter = {
  setUp() {
    return null;
  },
  async send() {
    const err = new Error(
      'Phone sign-in is not configured. Use Google or email, or connect an SMS provider.'
    ) as Error & { code?: string };
    err.code = 'auth/operation-not-supported-in-this-environment';
    throw err;
  },
  async confirm() {
    const err = new Error(
      'Phone sign-in is not configured. Use Google or email, or connect an SMS provider.'
    ) as Error & { code?: string };
    err.code = 'auth/operation-not-supported-in-this-environment';
    throw err;
  }
};

function phoneOtpAdapter(): PhoneOtpAdapter {
  const override = (globalThis as any).__ellixPhoneOtpAdapter as PhoneOtpAdapter | undefined;
  return override || unconfiguredPhoneOtpAdapter;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [isSyncHubOpen, setIsSyncHubOpen] = useState<boolean>(false);

  const syncProfileDoc = useCallback(async (user: AuthUser): Promise<UserProfile> => {
    const linkedProviders = user.providerData.map(p => p.providerId);
    const hasPassword = linkedProviders.includes('email');
    const isEmailVerified = user.emailVerified || linkedProviders.includes('google');
    const hasPhone = Boolean(user.phoneNumber);
    const nowIso = new Date().toISOString();

    let existingData: Record<string, any> | undefined;
    try {
      const { data: row, error: readError } = await supabase
        .from('users')
        .select('data')
        .eq('id', user.uid)
        .maybeSingle();
      if (readError) throw readError;
      existingData = (row?.data as Record<string, any>) || undefined;
    } catch (error: any) {
      console.warn('[AuthContext] Supabase profile read notice:', error?.message || error);
    }

    if (existingData) {
      const isAdminUser = user.email === ADMIN_EMAIL && isEmailVerified;

      if (isUserStatusInactive(existingData)) {
        const inactiveProfile: UserProfile = {
          ...(existingData as unknown as UserProfile),
          uid: user.uid,
          role: 'unauthorized',
          linkedProviders
        };
        setUserProfile(inactiveProfile);
        return inactiveProfile;
      }

      // Preserve the authoritative role stored in the database; fail closed if
      // unrecognized.
      const resolvedCanonical = isAdminUser
        ? 'super_admin'
        : normalizeCanonicalRole(existingData.role);

      // Only non-authorization fields may be written by the client. The
      // guard_user_self_update trigger enforces the same allow-list server-side.
      const safeProfilePatch: Record<string, any> = {
        emailVerified: isEmailVerified,
        phoneNumber: user.phoneNumber || existingData.phoneNumber || '',
        phoneVerified: hasPhone,
        displayName:
          user.displayName ||
          existingData.displayName ||
          (user.email ? user.email.split('@')[0] : 'Merchant'),
        photoURL: user.photoURL || existingData.photoURL || '',
        linkedProviders: Array.from(new Set([...linkedProviders, ...(existingData.linkedProviders || [])])),
        passwordSynchronized: existingData.passwordSynchronized ?? hasPassword,
        lastLoginAt: nowIso,
        updatedAt: nowIso
      };

      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({ data: { ...existingData, ...safeProfilePatch } })
          .eq('id', user.uid);
        if (updateError) throw updateError;
      } catch (updateErr) {
        console.warn('[AuthContext] Safe profile metadata update skipped:', updateErr);
      }

      const updatedProfile: UserProfile = {
        ...(existingData as unknown as UserProfile),
        ...safeProfilePatch,
        uid: user.uid,
        email: existingData.email || user.email || '',
        role: resolvedCanonical,
        clientId: existingData.clientId || `client-${user.uid}`,
        assignedStoreIds: existingData.assignedStoreIds || [],
        status: existingData.status || 'active'
      };
      setUserProfile(updatedProfile);
      return updatedProfile;
    }

    // No profile row yet. The auth.users trigger normally creates it; this is a
    // fallback for the brief window before the trigger ran.
    const isAdminUser = user.email === ADMIN_EMAIL && isEmailVerified;
    const initialRole: ProfileRole = isAdminUser ? 'super_admin' : 'client';
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      emailVerified: isEmailVerified,
      phoneNumber: user.phoneNumber || '',
      phoneVerified: hasPhone,
      displayName:
        user.displayName || (user.email ? user.email.split('@')[0] : 'Merchant'),
      photoURL: user.photoURL || '',
      role: initialRole,
      clientId: `client-${user.uid}`,
      assignedStoreIds: [],
      status: 'active',
      linkedProviders: linkedProviders.length > 0 ? linkedProviders : ['email'],
      passwordSynchronized: hasPassword,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    if (initialRole === 'client') {
      try {
        const { error: insertError } = await supabase.from('users').insert({
          id: user.uid,
          data: {
            ...newProfile,
            uid: user.uid,
            role: 'client',
            clientId: `client-${user.uid}`,
            assignedStoreIds: [],
            status: 'active',
            updatedAt: nowIso
          }
        });
        if (insertError) throw insertError;
      } catch (insertErr: any) {
        console.warn('[AuthContext] Supabase profile self-provision skipped:', insertErr?.message || insertErr);
      }
    }

    setUserProfile(newProfile);
    return newProfile;
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setUserProfile(null);
      return;
    }
    await syncProfileDoc(toAuthUser(data.user));
  }, [syncProfileDoc]);

  // Listen to Supabase Auth state changes.
  useEffect(() => {
    let active = true;

    const applySession = async (session: Session | null) => {
      if (!active) return;
      const user = session?.user ? toAuthUser(session.user) : null;
      setCurrentUser(user);
      if (user) {
        await syncProfileDoc(user);
      } else {
        setUserProfile(null);
      }
      if (active) setLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: calling Supabase data APIs synchronously inside this callback can
      // deadlock the auth client while it holds its internal lock.
      setTimeout(() => {
        void applySession(session);
      }, 0);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncProfileDoc]);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // 1. Google 1-Click Login
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
      closeAuthModal();
    } catch (error: any) {
      console.error('[Auth] Google Sign-In Error:', error);
      throw authError(error);
    }
  };

  // 2. Email & Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass
      });
      if (error) throw error;
      closeAuthModal();
    } catch (error: any) {
      console.error('[Auth] Email Login Error:', error);
      throw authError(error);
    }
  };

  // 3. Email & Password Registration
  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    role: ProfileRole = 'client'
  ) => {
    try {
      const canonical = normalizeCanonicalRole(role);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            displayName: displayName.trim(),
            role: canonical === 'unauthorized' ? 'client' : canonical
          }
        }
      });
      if (error) throw error;
      closeAuthModal();
    } catch (error: any) {
      console.error('[Auth] Email Registration Error:', error);
      throw authError(error);
    }
  };

  // 3b. Quick Demo Account Login / Auto-Registration for Testing (Development Only)
  const loginWithDemoRole = async (role: ProfileRole) => {
    if (!(import.meta as any).env?.DEV) {
      throw new Error('Demo role login is disabled in production builds.');
    }
    let demoEmail = '';
    const demoPass = (import.meta as any).env?.VITE_DEMO_AUTH_PASSWORD || '';
    if (!demoPass) {
      throw new Error('Demo account password is not configured. Set VITE_DEMO_AUTH_PASSWORD in your local .env file.');
    }
    let demoName = '';

    if (role === 'super_admin') {
      demoEmail = 'superadmin@ellic.com';
      demoName = 'Akash Joshi (Super Admin)';
    } else if (role === 'ellix_admin' || role === 'admin') {
      demoEmail = 'admin@ellic.com';
      demoName = 'Siddharth Admin (Ellic)';
    } else if (role === 'client' || role === 'retailer') {
      demoEmail = 'client@ellic.com';
      demoName = 'Vikram Malhotra (Client Owner)';
    } else if (role === 'crew' || role === 'employee') {
      demoEmail = 'crew@ellic.com';
      demoName = 'Rahul Sharma (Store Crew)';
    } else if (role === 'wholesaler') {
      demoEmail = 'wholesaler@ellic.com';
      demoName = 'Metro Wholesaler (Supplier)';
    } else {
      demoEmail = 'client@ellic.com';
      demoName = 'Vikram Malhotra (Client Owner)';
    }

    const canonical = normalizeCanonicalRole(role);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass
      });
      if (error) throw error;
      closeAuthModal();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'invalid_credentials' || code === 'invalid_login_credentials') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            data: {
              displayName: demoName,
              role: canonical === 'unauthorized' ? 'client' : canonical
            }
          }
        });
        if (signUpError) {
          console.error('[Auth] Demo auto-registration error:', signUpError);
          throw authError(signUpError);
        }
        closeAuthModal();
      } else {
        console.error('[Auth] Demo login error:', err);
        throw authError(err);
      }
    }
  };

  // 4. Phone Verification (adapter-backed)
  const setUpPhoneRecaptcha = (containerId: string): unknown => {
    return phoneOtpAdapter().setUp(containerId);
  };

  const sendPhoneOtp = async (phoneNumber: string, handle: unknown): Promise<PhoneOtpChallenge> => {
    try {
      const cleanPhone = phoneNumber.trim().startsWith('+')
        ? phoneNumber.trim()
        : `+${phoneNumber.trim()}`;
      return await phoneOtpAdapter().send(cleanPhone, handle);
    } catch (error: any) {
      console.error('[Auth] Phone OTP dispatch failed:', error);
      throw authError(error);
    }
  };

  const confirmPhoneOtp = async (
    challenge: PhoneOtpChallenge,
    otpCode: string,
    displayName?: string,
    role: ProfileRole = 'client'
  ) => {
    try {
      await phoneOtpAdapter().confirm(challenge, otpCode.trim());
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await syncProfileDoc(toAuthUser(data.user));
      }
      void displayName;
      void role;
      closeAuthModal();
    } catch (error: any) {
      console.error('[Auth] Confirm Phone OTP Error:', error);
      throw authError(error);
    }
  };

  // 5. Account Synchronization: Link Google Account
  const linkGoogleAccount = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('No authenticated user to link');
    try {
      const { error } = await supabase.auth.linkIdentity({ provider: 'google' });
      if (error) throw error;
    } catch (error: any) {
      console.error('[Auth] Link Google Error:', error);
      throw authError(error);
    }
  };

  // 6. Account Synchronization: Link Email and Password
  const linkEmailAndPassword = async (email: string, pass: string) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('No authenticated user to link');
    try {
      const { error } = await supabase.auth.updateUser({
        email: email.trim(),
        password: pass
      });
      if (error) throw error;
      await syncProfileDoc(toAuthUser(data.user));
    } catch (error: any) {
      console.error('[Auth] Link Email & Password Error:', error);
      throw authError(error);
    }
  };

  // 7. Account Synchronization: Link Phone with OTP
  const linkPhoneOtp = async (challenge: PhoneOtpChallenge, otpCode: string) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('No authenticated user to link');
    try {
      await phoneOtpAdapter().confirm(challenge, otpCode.trim());
      await syncProfileDoc(toAuthUser(data.user));
    } catch (error: any) {
      console.error('[Auth] Link Phone Error:', error);
      throw authError(error);
    }
  };

  // 8. Synchronize Master Password Across All Methods
  const synchronizeMasterPassword = async (newPassword: string) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('No authenticated user active');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      await syncProfileDoc(toAuthUser(data.user));
    } catch (error: any) {
      console.error('[Auth] Synchronize Password Error:', error);
      throw authError(error);
    }
  };

  // 9. Email Verification Dispatch
  const resendVerificationEmail = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user?.email) throw new Error('No authenticated user found');
    const { error } = await supabase.auth.resend({ type: 'signup', email: data.user.email });
    if (error) throw authError(error);
  };

  // 10. Password Reset Dispatch
  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin
    });
    if (error) throw authError(error);
  };

  // 11. Sign Out
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
  };

  /**
   * Return the current Supabase access token, or '' when no session exists.
   * Returns the current Supabase access token for authenticated `/api/*` calls.
   */
  const getAccessToken = async (): Promise<string> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || '';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAuthModalOpen,
        authModalMode,
        isSyncHubOpen,
        openAuthModal,
        closeAuthModal,
        setIsSyncHubOpen,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        setUpPhoneRecaptcha,
        sendPhoneOtp,
        confirmPhoneOtp,
        linkGoogleAccount,
        linkEmailAndPassword,
        linkPhoneOtp,
        synchronizeMasterPassword,
        resendVerificationEmail,
        sendPasswordReset,
        logout,
        getAccessToken,
        refreshUserProfile,
        loginWithDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
