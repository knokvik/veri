"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/* ─────────── Types ─────────── */
export type UserRole = 'user' | 'admin';
export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  subscriptionTier: SubscriptionTier;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, role?: UserRole, tier?: SubscriptionTier) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  loginWithWallet: () => void;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─────────── Provider ─────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isDemoMode = !isSupabaseConfigured;

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (isDemoMode) {
        // Demo mode: restore from localStorage
        try {
          const stored = localStorage.getItem('vc_demo_user');
          if (stored) setUser(JSON.parse(stored));
        } catch { /* ignore */ }
        setLoading(false);
        return;
      }

      // Supabase mode
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (meta.role as UserRole) || 'user',
            subscriptionTier: (meta.subscription_tier as SubscriptionTier) || 'basic',
          });
        }
      } catch (e) {
        console.error('Session restore error:', e);
      }
      setLoading(false);
    };

    restoreSession();

    // Listen for Supabase auth state changes
    if (!isDemoMode && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (meta.role as UserRole) || 'user',
            subscriptionTier: (meta.subscription_tier as SubscriptionTier) || 'basic',
          });
        } else {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [isDemoMode]);

  /* ─── Demo helpers ─── */
  const demoLogin = useCallback((email: string, role: UserRole = 'user', tier: SubscriptionTier = 'premium') => {
    const demoUser: AuthUser = {
      id: `demo-${Date.now()}`,
      email,
      role,
      subscriptionTier: tier,
    };
    setUser(demoUser);
    localStorage.setItem('vc_demo_user', JSON.stringify(demoUser));
    router.push('/dashboard');
  }, [router]);

  /* ─── Sign Up ─── */
  const signUp = useCallback(async (email: string, password: string, role: UserRole = 'user', tier: SubscriptionTier = 'basic') => {
    setError(null);
    setLoading(true);

    if (isDemoMode) {
      demoLogin(email, role, tier);
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: { role, subscription_tier: tier },
        },
      });
      if (signUpError) throw signUpError;
      // Supabase may require email confirmation — show success message
      setError('Account created! Check your email to confirm, then log in.');
    } catch (e: any) {
      setError(e.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoLogin]);

  /* ─── Sign In ─── */
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    if (isDemoMode) {
      demoLogin(email, 'user', 'premium');
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase!.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoLogin, router]);

  /* ─── Sign In as Admin ─── */
  const signInAsAdmin = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    if (isDemoMode) {
      demoLogin(email, 'admin', 'premium');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase!.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      // Verify admin role from metadata
      const meta = data.user?.user_metadata;
      if (meta?.role !== 'admin') {
        setError('This account does not have admin privileges.');
        await supabase!.auth.signOut();
        setLoading(false);
        return;
      }
      router.push('/admin');
    } catch (e: any) {
      setError(e.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoLogin, router]);

  /* ─── Wallet Login ─── */
  const loginWithWallet = useCallback(() => {
    const walletUser: AuthUser = {
      id: `wallet-${Date.now()}`,
      email: 'wallet-user',
      role: 'user',
      subscriptionTier: 'premium',
    };
    setUser(walletUser);
    localStorage.setItem('vc_demo_user', JSON.stringify(walletUser));
    router.push('/dashboard');
  }, [router]);

  /* ─── Reset Password ─── */
  const resetPassword = useCallback(async (email: string) => {
    setError(null);

    if (isDemoMode) {
      setError('Password reset email sent! (Demo mode — no actual email sent)');
      return;
    }

    try {
      const { error: resetError } = await supabase!.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setError('Password reset email sent! Check your inbox.');
    } catch (e: any) {
      setError(e.message || 'Password reset failed');
    }
  }, [isDemoMode]);

  /* ─── Logout ─── */
  const logout = useCallback(async () => {
    if (!isDemoMode && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('vc_demo_user');
    setUser(null);
    router.push('/');
  }, [isDemoMode, router]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      subscriptionTier: user?.subscriptionTier || 'free',
      loading,
      error,
      signUp,
      signIn,
      signInAsAdmin,
      loginWithWallet,
      resetPassword,
      logout,
      clearError,
      isDemoMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
