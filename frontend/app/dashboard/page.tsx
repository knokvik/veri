"use client";

import Link from 'next/link';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectStore } from '../../lib/projectStore';
import WalletCard from '../../components/WalletCard';

export default function Dashboard() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { user, subscriptionTier, isAdmin } = useAuth();
  const { projects, ownedTokens, loadSampleData, clearAll } = useProjectStore();

  if (loading) {
    return <div className="text-center mt-20 text-slate-400 animate-pulse">Verifying secure access...</div>;
  }
  if (accessDenied) {
    return <div className="text-center mt-20 text-red-400 panel max-w-md mx-auto">{accessDenied}</div>;
  }
  if (!isAuthorized) return null;

  const verifiedCount = projects.filter(p => p.status === 'verified' || p.status === 'minted' || p.status === 'listed').length;
  const mintedCount = ownedTokens.reduce((sum, t) => sum + t.amount, 0);
  const retiredCount = ownedTokens.filter(t => t.retired).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-slate-400 mt-1">
            {user?.email && user.email !== 'wallet-user' ? `Logged in as ${user.email}` : 'Connected via Web3 Wallet'}
            {isAdmin && <span className="ml-2 text-red-400 font-semibold text-xs">[ADMIN]</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSampleData}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white transition-colors border border-slate-500"
          >
            🧪 Load Sample Data
          </button>
          {projects.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs bg-slate-800 hover:bg-red-900/50 px-3 py-2 rounded text-red-400 transition-colors border border-slate-700"
            >
              Clear Data
            </button>
          )}
          {subscriptionTier !== 'free' && (
            <Link href="/submit-project" className="btn-primary text-sm px-6 py-2">
              + Submit New Project
            </Link>
          )}
        </div>
      </div>

      {/* Wallet Card */}
      <WalletCard />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="panel flex flex-col justify-between hover:border-slate-500 transition-colors">
          <div>
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Projects</h3>
            <span className="text-4xl font-extrabold text-white">{projects.length}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-climateGreen">
            {verifiedCount} verified
          </div>
        </div>

        <div className="panel flex flex-col justify-between hover:border-slate-500 transition-colors">
          <div>
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Minted Credits</h3>
            <span className="text-4xl font-extrabold text-white">{mintedCount}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-climateGreen">
            {ownedTokens.filter(t => !t.retired).length} active tokens
          </div>
        </div>

        <div className="panel flex flex-col justify-between hover:border-slate-500 transition-colors">
          <div>
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Retired Portfolio</h3>
            <span className="text-4xl font-extrabold text-blue-400">{retiredCount}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-blue-300">
            CCTS Compliance certificates
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="panel">
          <h3 className="text-xl font-bold text-slate-100 mb-6">Recent Projects</h3>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-lg mb-2">No projects yet</p>
              <p className="text-sm">Click "Load Sample Data" to populate test data, or submit a new project.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {projects.slice(0, 5).map(p => (
                <li key={p.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-3 last:border-0">
                  <div>
                    <span className="text-slate-200 font-medium">{p.name}</span>
                    {p.tokenId && (
                      <span className="ml-2 text-[10px] font-mono text-tealAccent bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                        TKN #{p.tokenId}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                    p.status === 'minted' ? 'bg-green-900/20 border-green-600 text-green-400' :
                    p.status === 'verified' ? 'bg-blue-900/20 border-blue-600 text-blue-400' :
                    p.status === 'retired' ? 'bg-slate-900 border-slate-600 text-slate-400' :
                    'bg-amber-900/20 border-amber-600 text-amber-400'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Links */}
        <div className="panel">
          <h3 className="text-xl font-bold text-slate-100 mb-6">Quick Links</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/my-projects" className="block p-4 border border-slate-700 rounded-lg bg-slate-900 hover:bg-slate-800 hover:border-slate-500 transition-all text-center text-sm font-semibold text-tealAccent">
              📋 View My Projects
            </Link>
            <Link href="/portfolio" className="block p-4 border border-slate-700 rounded-lg bg-slate-900 hover:bg-slate-800 hover:border-slate-500 transition-all text-center text-sm font-semibold text-tealAccent">
              💼 Manage Portfolio
            </Link>
            <Link href="/marketplace" className="block p-4 border border-slate-700 rounded-lg bg-slate-900 hover:bg-slate-800 hover:border-slate-500 transition-all text-center text-sm font-semibold text-tealAccent col-span-2">
              🏪 Explore The Marketplace
            </Link>
            {isAdmin && (
              <Link href="/admin" className="block p-4 border border-red-900/50 rounded-lg bg-red-900/10 hover:bg-red-900/20 hover:border-red-700 transition-all text-center text-sm font-semibold text-red-400 col-span-2">
                🛡️ Admin Panel — All Projects
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
