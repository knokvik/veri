"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function ForgotPassword() {
  const { resetPassword, error, clearError, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email) return;
    await resetPassword(email);
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto mt-20 panel space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-100 text-center">Reset Password</h2>

      {isDemoMode && (
        <div className="text-center">
          <span className="inline-block bg-amber-900/30 border border-amber-600/50 text-amber-400 px-2 py-0.5 rounded text-xs">
            Demo Mode — Supabase not configured
          </span>
        </div>
      )}

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="user@climatecorp.com"
            />
          </div>

          {error && (
            <div className={`text-sm p-3 rounded border ${error.includes('sent') ? 'bg-green-900/20 border-green-600 text-green-400' : 'bg-red-900/20 border-red-600 text-red-400'}`}>
              {error}
            </div>
          )}

          <button type="submit" className="w-full btn-primary py-3">
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-500 flex items-center justify-center mx-auto text-3xl">
            ✉️
          </div>
          <p className="text-slate-300">
            If an account exists for <span className="text-tealAccent font-semibold">{email}</span>, a password reset link has been sent.
          </p>
          {error && <p className="text-sm text-green-400">{error}</p>}
        </div>
      )}

      <div className="pt-4 text-center">
        <Link href="/login" className="text-sm text-tealAccent hover:underline">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
