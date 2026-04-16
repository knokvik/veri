"use client";

import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';
import WalletCard from '../../components/WalletCard';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  Store, 
  Flame, 
  FileCheck, 
  History, 
  Download, 
  ArrowUpRight, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Coins
} from "lucide-react"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function Portfolio() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { ownedTokens, retireToken } = useProjectStore();
  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [retiredJust, setRetiredJust] = useState<number | null>(null);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse font-medium">Loading asset portfolio...</div>;
  if (accessDenied) {
     return (
      <Card className="max-w-md mx-auto mt-20 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>{accessDenied}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
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
    <div className="max-w-7xl mx-auto space-y-8 mt-6 animate-fadeIn pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Active Portfolio</h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Manage your acquired VeriCredit tokens and CCTS compliance retirements.</p>
        </div>
        <Button asChild variant="outline" className="h-10 px-6 gap-2 border-border hover:border-primary/50 transition-all font-bold">
          <Link href="/marketplace">
            <Store className="w-4 h-4" /> Browse Marketplace
          </Link>
        </Button>
      </div>

      <WalletCard />

      {ownedTokens.length === 0 ? (
        <Card className="bg-muted/30 border-dashed py-16">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-none bg-muted flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">Your portfolio is empty</p>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                Acquire carbon credits from the marketplace or mint your own assets to see them here.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/marketplace">Marketplace</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/submit-project">Mint Credits</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {/* Active Tokens */}
          {activeTokens.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-black tracking-tight">Active Credits</h3>
                <Badge variant="secondary" className="rounded-none px-2 h-5 text-[10px] font-black text-white">{activeTokens.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeTokens.map(token => (
                  <Card key={token.tokenId} className="group hover:border-primary/50 transition-all duration-300 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                         <CardTitle className="text-xl font-bold tracking-tight">{token.projectName}</CardTitle>
                         <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">TKN #{token.tokenId}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" /> Scheme: {token.schemeType === 'compliance' ? 'CCTS Compliance' : 'Voluntary Offset'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3 p-4 bg-muted/40 rounded-none border border-border/50 mb-6">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Available Balance</span>
                          <span className="font-mono font-bold text-primary">{token.amount} Credits</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Minted Date</span>
                          <span className="font-mono">{token.mintedAt}</span>
                        </div>
                      </div>

                      {retiredJust === token.tokenId && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-none flex items-center gap-3 mb-4 animate-slideUp">
                           <CheckCircle2 className="w-4 h-4 shrink-0" />
                           <span className="text-xs font-bold">Successfully retired for compliance!</span>
                        </div>
                      )}

                      <Button 
                        onClick={() => handleRetire(token.tokenId)}
                        disabled={isPending}
                        variant="default"
                        className="w-full h-11 font-black tracking-tight gap-2 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/10"
                      >
                         <Flame className="w-4 h-4" /> {isPending ? 'Propagating Tx...' : 'Retire for Compliance'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Retired Tokens */}
          {retiredTokens.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-xl font-black tracking-tight text-muted-foreground">Retired Credits</h3>
                <Badge variant="outline" className="rounded-none px-2 h-5 text-[10px] font-black text-muted-foreground">{retiredTokens.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {retiredTokens.map(token => (
                  <Card key={token.tokenId} className="opacity-60 grayscale-[0.5] border-muted hover:opacity-100 hover:grayscale-0 transition-all duration-300 overflow-hidden shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                         <CardTitle className="text-xl font-bold tracking-tight">{token.projectName}</CardTitle>
                         <Badge variant="outline" className="font-mono text-[10px]">TKN #{token.tokenId}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Permanently Retired
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3 p-4 bg-muted/60 rounded-none border border-border/50 mb-6">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Retirement Date</span>
                          <span className="font-mono font-bold">{token.retiredAt}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">BEE Reference</span>
                          <span className="font-mono text-[10px]">CCTS-RET-{token.tokenId}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleDownloadCert(token)}
                        variant="ghost"
                        className="w-full h-11 font-bold gap-2 text-primary hover:bg-primary/5 transition-all"
                      >
                         <Download className="w-4 h-4" /> Download Compliance Cert
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
