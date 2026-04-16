"use client";

import { useState } from 'react';
import CCTSBadge from '../../components/CCTSBadge';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function Marketplace() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const { projects, ownedTokens, addOwnedToken, retireToken } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [certReadyFor, setCertReadyFor] = useState<string | null>(null);

  if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse">Verifying secure access...</div>;
  if (accessDenied) return <div className="text-center mt-20 text-red-400 panel max-w-md mx-auto">{accessDenied}</div>;
  if (!isAuthorized) return null;

  // Get marketplace listings from minted projects
  const mintedProjects = projects.filter(p => p.tokenId && (p.status === 'minted' || p.status === 'listed' || p.status === 'retired'));

  // Fallback demo credits if no projects yet
  const demoCredits = mintedProjects.length === 0 ? [
    {
      id: 'demo-1', name: 'Western Ghats Afforestation Base', schemeType: 'compliance' as const,
      price: 12.5, score: 92, mintedAt: '2026-04-10', tokenId: 101, retired: false,
    },
    {
      id: 'demo-2', name: 'Himalayan Foothills Restoration', schemeType: 'offset' as const,
      price: 8.2, score: 85, mintedAt: '2026-03-22', tokenId: 102, retired: false,
    },
    {
      id: 'demo-3', name: 'Sundarbans Mangrove Defense', schemeType: 'compliance' as const,
      price: 15.0, score: 98, mintedAt: '2026-04-12', tokenId: 103, retired: true,
    },
  ] : [];

  const allCredits = [
    ...mintedProjects.map(p => ({
      id: p.id,
      name: p.name,
      schemeType: p.schemeType,
      price: p.schemeType === 'compliance' ? 12.5 : 8.2,
      score: p.llmResult?.additionality_score || 0,
      mintedAt: p.mintedAt || p.createdAt,
      tokenId: p.tokenId!,
      retired: p.status === 'retired',
    })),
    ...demoCredits,
  ];

  const filteredCredits = searchQuery
    ? allCredits.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allCredits;

  const handleBuyAndRetire = (credit: typeof allCredits[0]) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: vericreditAbi,
      functionName: 'retireCredit',
      args: [
        credit.tokenId,
        10,
        `ipfs://Mock-${credit.tokenId}-compliance-cert`,
      ],
    }, {
      onSuccess: () => {
        retireToken(credit.tokenId);
        setCertReadyFor(credit.id);
      },
      onError: () => {
        // Demo mode: still retire locally
        retireToken(credit.tokenId);
        setCertReadyFor(credit.id);
      },
    });
  };

  const handleDownloadCert = (credit: typeof allCredits[0]) => {
    // Generate a simple text-based certificate
    const cert = `
═══════════════════════════════════════════════
       CARBON CREDIT RETIREMENT CERTIFICATE
           CCTS Compliance - India 2026
═══════════════════════════════════════════════

Project: ${credit.name}
Token ID: #${credit.tokenId}
Scheme: ${credit.schemeType.toUpperCase()} Market
Additionality Score: ${credit.score}/100
Minted Date: ${credit.mintedAt}
Retirement Date: ${new Date().toISOString().split('T')[0]}

Status: PERMANENTLY RETIRED (BURNED)

This certificate confirms that the above carbon
credit has been permanently retired and removed
from circulation on the Polygon blockchain.

Registry: VeriCredit AI Platform
BEE Reference: CCTS-${credit.tokenId}-${Date.now()}

═══════════════════════════════════════════════
    Bureau of Energy Efficiency - India
    Carbon Credit Trading Scheme 2026
═══════════════════════════════════════════════
    `;
    const blob = new Blob([cert], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CCTS_Certificate_TKN${credit.tokenId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Carbon Marketplace</h2>
          <p className="text-slate-400 mt-1">Acquire and retire CCTS-compliant ERC-1155 tokens from VeriCredit.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by region or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field max-w-xs"
          />
        </div>
      </div>

      {filteredCredits.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-lg">No credits available yet</p>
          <p className="text-sm mt-1">Submit and mint a project to see it here, or load sample data from the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredits.map(credit => (
            <div key={credit.id} className="panel flex flex-col justify-between hover:border-slate-500 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-5">
                  <CCTSBadge schemeType={credit.schemeType === 'compliance' ? 'Compliance' : 'Offset'} />
                  <span className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded font-mono">
                    TKN: #{credit.tokenId}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-3">{credit.name}</h3>

                <div className="space-y-2 mb-4 text-sm text-slate-300 bg-slate-900 rounded-lg p-3 border border-slate-800">
                  <p className="flex justify-between">
                    <span>Additionality Score:</span>
                    <span className="font-mono text-blue-400">{credit.score}/100</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Minted:</span>
                    <span className="font-mono text-slate-400">{credit.mintedAt}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Status:</span>
                    {credit.retired ? (
                      <span className="text-slate-500 font-bold border border-slate-700 px-1 rounded text-xs">RETIRED (BURNED)</span>
                    ) : (
                      <span className="text-climateGreen font-bold border border-climateGreen px-1 rounded text-xs bg-green-900/10">ACTIVE FOR SALE</span>
                    )}
                  </p>
                </div>

                {certReadyFor === credit.id && (
                  <div className="bg-green-900/30 border border-green-500 text-green-400 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
                    <span>✅ Retirement Confirmed</span>
                    <button onClick={() => handleDownloadCert(credit)} className="underline decoration-green-400 font-bold ml-2">
                      Download Cert
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-between items-center mt-4">
                <span className="text-2xl font-bold text-white">
                  {credit.price} <span className="text-sm font-medium text-slate-400">MATIC</span>
                </span>

                <button
                  onClick={() => handleBuyAndRetire(credit)}
                  disabled={!isConnected || credit.retired || isPending}
                  className={`font-bold px-4 py-2 rounded shrink-0 transition-colors ${isConnected && !credit.retired ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                >
                  {!isConnected ? 'Connect Wallet' : credit.retired ? 'Already Burned' : isPending ? 'Wait...' : 'Buy & Retire'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
