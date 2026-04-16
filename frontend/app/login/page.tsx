"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

type TabMode = 'login' | 'signup';

export default function Login() {
  const { signIn, signUp, signInAsAdmin, loginWithWallet, error, clearError, loading, isDemoMode } = useAuth();
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const [tab, setTab] = useState<TabMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [signupTier, setSignupTier] = useState<'basic' | 'premium'>('basic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) return;

    if (tab === 'signup') {
      await signUp(email, password, 'user', signupTier);
    } else if (isAdminMode) {
      await signInAsAdmin(email, password);
    } else {
      await signIn(email, password);
    }
  };

  const handleWalletLogin = () => {
    if (isConnected) {
      loginWithWallet();
    } else if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 space-y-6 animate-fadeIn">
      <div className="panel space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-1">
            {tab === 'login' ? 'Access VeriCredit' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-400">
            {isDemoMode && (
              <span className="inline-block bg-amber-900/30 border border-amber-600/50 text-amber-400 px-2 py-0.5 rounded text-xs mb-2">
                Demo Mode — Supabase not configured
              </span>
            )}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => { setTab('login'); clearError(); setIsAdminMode(false); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${tab === 'login' ? 'bg-climateGreen text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setTab('signup'); clearError(); setIsAdminMode(false); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${tab === 'signup' ? 'bg-climateGreen text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="user@climatecorp.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {tab === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Subscription Tier</label>
              <select
                value={signupTier}
                onChange={(e) => setSignupTier(e.target.value as 'basic' | 'premium')}
                className="input-field appearance-none"
              >
                <option value="basic">Basic — Submit projects</option>
                <option value="premium">Premium — Full marketplace + retirement</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Free tier: view-only access (no submission).</p>
            </div>
          )}

          {tab === 'login' && (
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAdminMode}
                  onChange={(e) => setIsAdminMode(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-climateGreen focus:ring-climateGreen"
                />
                Admin Login
              </label>
              <Link href="/forgot-password" className="text-xs text-tealAccent hover:underline">
                Forgot Password?
              </Link>
            </div>
          )}

          {error && (
            <div className={`text-sm p-3 rounded border ${error.includes('sent') || error.includes('created') ? 'bg-green-900/20 border-green-600 text-green-400' : 'bg-red-900/20 border-red-600 text-red-400'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? 'Processing...' : tab === 'signup' ? 'Create Account' : isAdminMode ? 'Login as Admin' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">or</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        {/* Wallet Login */}
        <button
          onClick={handleWalletLogin}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg border border-slate-600 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">🦊</span>
          {isConnected ? 'Continue with Connected Wallet' : 'Connect Web3 Wallet'}
        </button>
      </div>

      {/* Info card */}
      <div className="panel bg-slate-800/50 text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">Subscription Tiers:</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
            <p className="font-bold text-slate-300">Free</p>
            <p>View only</p>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-blue-800 text-center">
            <p className="font-bold text-blue-300">Basic</p>
            <p>Submit projects</p>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-amber-800 text-center">
            <p className="font-bold text-amber-300">Premium</p>
            <p>Full access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
