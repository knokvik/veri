"use client";

import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import Link from 'next/link';
import CCTSBadge from '../../components/CCTSBadge';

export default function MyProjects() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { projects } = useProjectStore();

  if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse">Loading...</div>;
  if (accessDenied) return <div className="text-center mt-20 text-red-400 panel max-w-md mx-auto">{accessDenied}</div>;
  if (!isAuthorized) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case 'minted': return 'border-l-climateGreen';
      case 'verified': return 'border-l-blue-500';
      case 'retired': return 'border-l-slate-500';
      case 'listed': return 'border-l-amber-500';
      default: return 'border-l-slate-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">My Verified Projects</h2>
          <p className="text-slate-400 mt-1">Review your submitted afforestation data and verification results.</p>
        </div>
        <Link href="/submit-project" className="btn-primary text-sm px-6 py-2">
          + Submit New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg">No projects submitted yet</p>
          <p className="text-sm mt-2">
            <Link href="/submit-project" className="text-tealAccent hover:underline">Submit your first project</Link>
            {' '}or{' '}
            <Link href="/dashboard" className="text-tealAccent hover:underline">load sample data from the dashboard</Link>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(p => (
            <div key={p.id} className={`panel border-l-4 ${statusColor(p.status)} hover:border-slate-500 transition-colors`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <CCTSBadge schemeType={p.schemeType === 'compliance' ? 'Compliance' : 'Offset'} />
              </div>

              <p className="text-sm text-slate-400 mb-4">📍 {p.lat}, {p.lng}</p>

              <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-300 mb-4">
                {p.visionResult && (
                  <>
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">
                      🌳 Trees: {p.visionResult.tree_count}
                    </span>
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">
                      💚 Health: {p.visionResult.average_health_score}%
                    </span>
                  </>
                )}
                {p.satelliteResult && (
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    🛰️ NDVI: {p.satelliteResult.ndvi}
                  </span>
                )}
                {p.llmResult && (
                  <span className="bg-blue-900/30 px-2 py-1 rounded border border-blue-700 text-blue-300">
                    🧠 Score: {p.llmResult.additionality_score}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                  p.status === 'minted' ? 'bg-green-900/20 border-green-600 text-green-400' :
                  p.status === 'verified' ? 'bg-blue-900/20 border-blue-600 text-blue-400' :
                  p.status === 'retired' ? 'bg-slate-900 border-slate-600 text-slate-400' :
                  'bg-amber-900/20 border-amber-600 text-amber-400'
                }`}>
                  {p.status.toUpperCase()}
                  {p.tokenId && <span className="ml-1 text-slate-500">· TKN #{p.tokenId}</span>}
                </span>

                <Link
                  href={`/verification-report?id=${p.id}`}
                  className="text-xs text-tealAccent hover:underline"
                >
                  View Report →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
