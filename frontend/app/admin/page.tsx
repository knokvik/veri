"use client";

import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import Link from 'next/link';
import CCTSBadge from '../../components/CCTSBadge';

export default function AdminPanel() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute({ requiredRole: 'admin' });
  const { projects, ownedTokens } = useProjectStore();

  if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse">Verifying admin access...</div>;
  if (accessDenied) {
    return (
      <div className="max-w-md mx-auto mt-20 panel text-center space-y-4">
        <div className="text-4xl">🛡️</div>
        <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
        <p className="text-sm text-slate-400">{accessDenied}</p>
        <Link href="/login" className="btn-primary inline-block px-6 py-2 text-sm">
          Login as Admin
        </Link>
      </div>
    );
  }
  if (!isAuthorized) return null;

  const totalProjects = projects.length;
  const verifiedCount = projects.filter(p => ['verified', 'minted', 'listed'].includes(p.status)).length;
  const pendingCount = projects.filter(p => p.status === 'pending').length;
  const mintedCount = projects.filter(p => p.status === 'minted').length;
  const retiredCount = projects.filter(p => p.status === 'retired').length;
  const totalTokens = ownedTokens.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-6 animate-fadeIn">
      <div className="border-b border-red-900/50 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🛡️</span>
          <h2 className="text-3xl font-bold text-slate-100">Admin Panel</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-red-900/40 text-red-300 border-red-600">
            ADMIN ONLY
          </span>
        </div>
        <p className="text-slate-400">View and manage all submitted projects across all users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Projects', value: totalProjects, color: 'text-white' },
          { label: 'Pending', value: pendingCount, color: 'text-amber-400' },
          { label: 'Verified', value: verifiedCount, color: 'text-blue-400' },
          { label: 'Minted', value: mintedCount, color: 'text-climateGreen' },
          { label: 'Retired', value: retiredCount, color: 'text-slate-400' },
        ].map(stat => (
          <div key={stat.label} className="panel text-center py-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* All Projects Table */}
      <div className="panel overflow-x-auto">
        <h3 className="text-xl font-bold text-slate-100 mb-4">All Submitted Projects</h3>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No projects in the system</p>
            <p className="text-sm mt-1">Load sample data from the dashboard to populate test data.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-400">
                <th className="pb-3 pr-4">Project</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Scheme</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Score</th>
                <th className="pb-3 pr-4">Token</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-white">{p.name}</span>
                    <br />
                    <span className="text-xs text-slate-500">{p.createdAt}</span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                    {p.lat}, {p.lng}
                  </td>
                  <td className="py-3 pr-4">
                    <CCTSBadge schemeType={p.schemeType === 'compliance' ? 'Compliance' : 'Offset'} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                      p.status === 'minted' ? 'bg-green-900/20 border-green-600 text-green-400' :
                      p.status === 'verified' ? 'bg-blue-900/20 border-blue-600 text-blue-400' :
                      p.status === 'retired' ? 'bg-slate-900 border-slate-600 text-slate-400' :
                      'bg-amber-900/20 border-amber-600 text-amber-400'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-blue-400">
                    {p.llmResult?.additionality_score || '—'}
                  </td>
                  <td className="py-3 pr-4 font-mono text-tealAccent text-xs">
                    {p.tokenId ? `#${p.tokenId}` : '—'}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/verification-report?id=${p.id}`}
                      className="text-xs text-tealAccent hover:underline"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Token Summary */}
      <div className="panel">
        <h3 className="text-xl font-bold text-slate-100 mb-4">Token Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-1">Total Minted Credits</p>
            <p className="text-2xl font-black text-climateGreen">{totalTokens}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-1">Active Tokens</p>
            <p className="text-2xl font-black text-blue-400">{ownedTokens.filter(t => !t.retired).length}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-1">Retired Tokens</p>
            <p className="text-2xl font-black text-slate-400">{ownedTokens.filter(t => t.retired).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
