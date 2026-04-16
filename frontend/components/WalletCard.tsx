"use client";

import { useWalletInfo } from '../hooks/useWalletInfo';
import { useProjectStore } from '../lib/projectStore';

export default function WalletCard() {
  const { address, isConnected, formattedAddress, formattedBalance, chain } = useWalletInfo();
  const { ownedTokens } = useProjectStore();

  const activeTokens = ownedTokens.filter(t => !t.retired);
  const retiredTokens = ownedTokens.filter(t => t.retired);

  if (!isConnected) {
    return (
      <div className="panel border-l-4 border-l-amber-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-400 text-lg">⚠️</div>
          <div>
            <h4 className="text-sm font-semibold text-amber-400">Wallet Not Connected</h4>
            <p className="text-xs text-slate-400">Connect your wallet to view balances and interact with smart contracts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel border-l-4 border-l-tealAccent">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tealAccent/20 flex items-center justify-center">
            <span className="text-tealAccent text-lg">🔗</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Connected Wallet</h4>
            <p className="text-xs font-mono text-tealAccent">{formattedAddress}</p>
          </div>
        </div>
        {chain && (
          <span className="text-[10px] bg-purple-900/40 border border-purple-500/50 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
            {chain.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Balance</p>
          <p className="text-sm font-bold text-white">{formattedBalance}</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Active Tokens</p>
          <p className="text-sm font-bold text-climateGreen">{activeTokens.length}</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Retired</p>
          <p className="text-sm font-bold text-blue-400">{retiredTokens.length}</p>
        </div>
      </div>

      {activeTokens.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2">Owned Credits</p>
          <div className="space-y-1">
            {activeTokens.slice(0, 3).map(t => (
              <div key={t.tokenId} className="flex justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[60%]">{t.projectName}</span>
                <span className="font-mono text-tealAccent">{t.amount} TKN</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
