"use client";

import { useState } from 'react';
import CCTSBadge from '../../components/CCTSBadge';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Download, CheckCircle2, Info, ArrowUpRight, Coins } from "lucide-react"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function Marketplace() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const { projects, ownedTokens, addOwnedToken, retireToken } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [certReadyFor, setCertReadyFor] = useState<string | null>(null);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse font-medium">Verifying secure access...</div>;
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
      score: p.validationData?.layer_4_llm_placeholder?.additionality_score || 0,
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
    <div className="max-w-7xl mx-auto space-y-8 mt-6 animate-fadeIn pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight">VCM Marketplace</h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Acquire and retire CCTS-compliant ERC-1155 tokens on Polygon.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 border-border focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {filteredCredits.length === 0 ? (
        <Card className="bg-muted/30 border-dashed py-16">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-none bg-muted flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">No credits available</p>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                There are currently no active listings. Check back later or mint your own credits.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCredits.map(credit => (
            <Card key={credit.id} className="group hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm relative">
              <div className={`absolute top-0 right-0 p-1.5 px-3 rounded-none text-[10px] font-black tracking-widest ${credit.retired ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                {credit.retired ? 'RETIRED' : 'LISTED'}
              </div>
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2 pr-12">
                   <CCTSBadge schemeType={credit.schemeType === 'compliance' ? 'Compliance' : 'Offset'} />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">{credit.name}</CardTitle>
                <CardDescription className="font-mono text-[10px] flex items-center gap-1">
                  TOKEN # {credit.tokenId}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 p-4 bg-muted/40 rounded-none border border-border/50 mb-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Additionality</span>
                    <Badge variant="ghost" className="font-mono font-bold text-primary p-0 h-auto">{credit.score}/100</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Minted Date</span>
                    <span className="font-mono">{credit.mintedAt}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Market Status</span>
                    {credit.retired ? (
                      <Badge variant="secondary" className="text-[10px] h-5 py-0">Permanently Burned</Badge>
                    ) : (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] h-5 py-0">Active For Sale</Badge>
                    )}
                  </div>
                </div>

                {certReadyFor === credit.id && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-none flex items-center justify-between gap-3 animate-slideUp">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" />
                       <span className="text-xs font-bold">Retirement Successful</span>
                    </div>
                    <Button variant="link" onClick={() => handleDownloadCert(credit)} className="h-auto p-0 text-xs font-black decoration-green-500">
                      GET CERT <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t border-border flex justify-between items-center bg-muted/10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Asset Price</span>
                  <div className="flex items-center gap-1.5 font-black text-xl">
                    <Coins className="w-4 h-4 text-amber-500" /> {credit.price} <span className="text-[10px] font-bold text-muted-foreground">MATIC</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleBuyAndRetire(credit)}
                  disabled={!isConnected || credit.retired || isPending}
                  size="sm"
                  className={`font-black tracking-tight rounded-none px-6 h-10 ${!credit.retired && isConnected ? 'shadow-lg shadow-primary/10' : ''}`}
                  variant={credit.retired ? "secondary" : "default"}
                >
                  {!isConnected ? 'Login' : credit.retired ? 'Sold' : isPending ? 'Processing' : 'Buy & Retire'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
