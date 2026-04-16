"use client";

import { useWalletInfo } from '../hooks/useWalletInfo';
import { useProjectStore } from '../lib/projectStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Link as LinkIcon, ShieldCheck, History, Coins } from "lucide-react";

export default function WalletCard() {
  const { address, isConnected, formattedAddress, formattedBalance, chain } = useWalletInfo();
  const { ownedTokens } = useProjectStore();

  const activeTokens = ownedTokens.filter(t => !t.retired);
  const retiredTokens = ownedTokens.filter(t => t.retired);

  if (!isConnected) {
    return (
      <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="w-12 h-12 rounded-none bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Wallet Not Connected</h4>
            <p className="text-xs text-muted-foreground mt-1">Connect your wallet to view balances and interact with carbon credits.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary bg-card/50 shadow-sm transition-all hover:bg-card">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center text-primary">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Identity</h4>
            <p className="text-sm font-mono font-bold text-primary mt-0.5">{formattedAddress}</p>
          </div>
        </div>
        {chain && (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3">
            {chain.name}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-none p-4 border border-border/50 text-center transition-colors hover:bg-muted/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-center gap-1">
              <Coins className="w-3 h-3" /> Balance
            </p>
            <p className="text-lg font-black text-foreground">{formattedBalance}</p>
          </div>
          <div className="bg-muted/30 rounded-none p-4 border border-border/50 text-center transition-colors hover:bg-muted/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Credits
            </p>
            <p className="text-lg font-black text-primary">{activeTokens.length}</p>
          </div>
          <div className="bg-muted/30 rounded-none p-4 border border-border/50 text-center transition-colors hover:bg-muted/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-center gap-1">
              <History className="w-3 h-3" /> Retired
            </p>
            <p className="text-lg font-black text-blue-500">{retiredTokens.length}</p>
          </div>
        </div>

        {activeTokens.length > 0 && (
          <div className="pt-2">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              Recent Inventory <div className="h-px flex-grow bg-border" />
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeTokens.slice(0, 4).map(t => (
                <div key={t.tokenId} className="flex justify-between items-center p-2 rounded-none bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors">
                  <span className="text-[11px] font-bold truncate max-w-[140px]">{t.projectName}</span>
                  <Badge variant="secondary" className="text-[9px] font-mono font-bold">{t.amount} TKN</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
