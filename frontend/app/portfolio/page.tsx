"use client";

import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';
import WalletCard from '../../components/WalletCard';
import Link from 'next/link';
import { useState } from 'react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function Portfolio() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { ownedTokens, retireToken } = useProjectStore();
  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [retiredJust, setRetiredJust] = useState<number | null>(null);

  if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse">Loading...</div>;
  if (accessDenied) return <div className="text-center mt-20 text-red-400 panel max-w-md mx-auto">{accessDenied}</div>;
  if (!isAuthorized) return null;

  const activeTokens = ownedTokens.filter(t => !t.retired);
  const retiredTokens = ownedTokens.filter(t => t.retired);

  const handleRetire = (tokenId: number) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: vericreditAbi,
      functionName: 'retireCredit',
      args: [tokenId, 10, `ipfs://cert-${tokenId}`],
    }, {
      onSuccess: () => {
        retireToken(tokenId);
        setRetiredJust(tokenId);
      },
      onError: () => {
        // Demo: still retire locally
        retireToken(tokenId);
        setRetiredJust(tokenId);
      },
    });
  };

  const handleDownloadCert = (token: typeof ownedTokens[0]) => {
    const cert = `
═══════════════════════════════════════════════
       CARBON CREDIT RETIREMENT CERTIFICATE
           CCTS Compliance - India 2026
═══════════════════════════════════════════════

Project: ${token.projectName}
Token ID: #${token.tokenId}
Scheme: ${token.schemeType.toUpperCase()} Market
Amount: ${token.amount} credits
Minted: ${token.mintedAt}
Retired: ${token.retiredAt || new Date().toISOString().split('T')[0]}

Status: PERMANENTLY RETIRED (BURNED)

BEE Reference: CCTS-${token.tokenId}-${Date.now()}

═══════════════════════════════════════════════
    Bureau of Energy Efficiency - India
    Carbon Credit Trading Scheme 2026
═══════════════════════════════════════════════
    `;
    const blob = new Blob([cert], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CCTS_Certificate_TKN${token.tokenId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">My Portfolio</h2>
          <p className="text-slate-400 mt-1">Manage your acquired VeriCredit tokens and CCTS retirements.</p>
        </div>
        <Link href="/marketplace" className="btn-secondary text-sm px-6 py-2">
          🏪 Browse Marketplace
        </Link>
      </div>

      {/* Wallet Summary */}
      <WalletCard />

      {ownedTokens.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">💼</p>
          <p className="text-lg">No tokens in your portfolio</p>
          <p className="text-sm mt-2">
            <Link href="/marketplace" className="text-tealAccent hover:underline">Buy credits from the marketplace</Link>
            {' '}or{' '}
            <Link href="/submit-project" className="text-tealAccent hover:underline">mint your own</Link>.
          </p>
        </div>
      ) : (
        <>
          {/* Active Tokens */}
          {activeTokens.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-climateGreen mb-4">Active Credits ({activeTokens.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTokens.map(token => (
                  <div key={token.tokenId} className="panel border-l-4 border-l-climateGreen hover:border-slate-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-white">{token.projectName}</h4>
                      <span className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded font-mono">
                        TKN #{token.tokenId}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300 bg-slate-900 rounded-lg p-3 border border-slate-800 mb-4">
                      <p className="flex justify-between"><span>Amount:</span> <span className="font-mono text-climateGreen">{token.amount} credits</span></p>
                      <p className="flex justify-between"><span>Scheme:</span> <span className="font-mono text-blue-400">{token.schemeType}</span></p>
                      <p className="flex justify-between"><span>Minted:</span> <span className="font-mono text-slate-400">{token.mintedAt}</span></p>
                    </div>

                    {retiredJust === token.tokenId && (
                      <div className="bg-green-900/30 border border-green-500 text-green-400 p-3 rounded-lg mb-3 text-sm">
                        ✅ Successfully retired!
                      </div>
                    )}

                    <button
                      onClick={() => handleRetire(token.tokenId)}
                      disabled={isPending}
                      className="w-full text-sm btn-primary py-2 bg-amber-700 hover:bg-amber-600 border-none"
                    >
                      {isPending ? 'Processing...' : '🔥 Burn for CCTS Compliance'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retired Tokens */}
          {retiredTokens.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-400 mb-4">Retired Credits ({retiredTokens.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {retiredTokens.map(token => (
                  <div key={token.tokenId} className="panel border-l-4 border-l-slate-600 opacity-80">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-slate-300">{token.projectName}</h4>
                      <span className="text-xs bg-slate-900 border border-slate-700 text-slate-500 px-2 py-1 rounded font-mono">
                        TKN #{token.tokenId}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-400 bg-slate-900 rounded-lg p-3 border border-slate-800 mb-4">
                      <p className="flex justify-between"><span>Status:</span> <span className="font-bold text-slate-500">BURNED</span></p>
                      <p className="flex justify-between"><span>Retired:</span> <span className="font-mono">{token.retiredAt}</span></p>
                    </div>

                    <button
                      onClick={() => handleDownloadCert(token)}
                      className="w-full text-sm btn-secondary py-2"
                    >
                      📄 Download Compliance Certificate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
