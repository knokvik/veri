"use client";

import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import Link from 'next/link';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';
import { useState } from 'react';
import CCTSBadge from '../../components/CCTSBadge';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Flame, 
  History, 
  ArrowRight,
  Eye,
  FileText,
  BarChart3,
  Search,
  Check,
  X
} from "lucide-react"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function AdminPanel() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute({ requiredRole: 'admin' });
  const { projects, ownedTokens, updateProject, addOwnedToken } = useProjectStore();
  const { isConnected, address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [adminOverrides, setAdminOverrides] = useState<Record<string, { credits: string; additionality: string; notes: string }>>({});

  const defaultCredits = (project: any) => {
    const metadata = project.validationData?.layer_4_llm_placeholder;
    return Math.max(1, Math.floor(metadata?.net_issuable_carbon_tons || 100));
  };

  const defaultAdditionality = (project: any) => {
    const metadata = project.validationData?.layer_4_llm_placeholder;
    return Math.max(1, Math.floor(metadata?.additionality_score || 94));
  };

  const getOverride = (project: any) => {
    return adminOverrides[project.id] || {
      credits: String(defaultCredits(project)),
      additionality: String(defaultAdditionality(project)),
      notes: '',
    };
  };

  const setOverrideField = (projectId: string, field: 'credits' | 'additionality' | 'notes', value: string, project?: any) => {
    setAdminOverrides(prev => {
      const current = prev[projectId] || {
        credits: String(project ? defaultCredits(project) : 100),
        additionality: String(project ? defaultAdditionality(project) : 94),
        notes: '',
      };
      return {
        ...prev,
        [projectId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleMintCredit = (project: any) => {
    if (!address) {
       alert("Please connect Admin wallet to mint");
       return;
    }
    setMintingId(project.id);

    const override = getOverride(project);
    const mintAmount = Number(override.credits);
    const additionality = Number(override.additionality);
    if (!Number.isFinite(mintAmount) || mintAmount <= 0) {
      alert("Please enter a valid mint credit amount.");
      setMintingId(null);
      return;
    }
    if (!Number.isFinite(additionality) || additionality < 0 || additionality > 100) {
      alert("Additionality must be between 0 and 100.");
      setMintingId(null);
      return;
    }

    const nextTokenId = 100 + Date.now() % 1000;

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: vericreditAbi,
      functionName: 'mintCredit',
      args: [
        project.owner || address, // Mint to the project owner
        mintAmount,
        project.schemeType === 'compliance' ? 'Compliance' : 'Offset',
        additionality,
        true,
        `ipfs://${project.ipfsHash || 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'}`,
      ],
    }, {
      onSuccess: () => {
        alert(`Transaction submitted! Minted ${mintAmount} credits to ${project.owner}`);
        updateProject(project.id, {
          status: 'minted',
          tokenId: nextTokenId,
          mintedAt: new Date().toISOString().split('T')[0],
          adminDecision: {
            approvedCredits: mintAmount,
            approvedAdditionality: additionality,
            adminNotes: override.notes || 'Approved and minted by admin.',
            decidedAt: new Date().toISOString(),
          },
        });
        addOwnedToken({
          tokenId: nextTokenId,
          projectName: project.name,
          schemeType: project.schemeType,
          amount: mintAmount,
          mintedAt: new Date().toISOString().split('T')[0],
          retired: false,
        });
        setMintingId(null);
      },
      onError: (err) => {
        alert('Transaction failed: ' + err.message);
        // Still update locally for demo purposes
        updateProject(project.id, {
          status: 'minted',
          tokenId: nextTokenId,
          mintedAt: new Date().toISOString().split('T')[0],
          adminDecision: {
            approvedCredits: mintAmount,
            approvedAdditionality: additionality,
            adminNotes: override.notes || 'Approved in demo mode after transaction error.',
            decidedAt: new Date().toISOString(),
          },
        });
        addOwnedToken({
          tokenId: nextTokenId,
          projectName: project.name,
          schemeType: project.schemeType,
          amount: mintAmount,
          mintedAt: new Date().toISOString().split('T')[0],
          retired: false,
        });
        setMintingId(null);
      },
    });
  };

  const handleReject = (id: string) => {
     const override = adminOverrides[id];
     updateProject(id, {
       status: 'rejected',
       adminDecision: {
         adminNotes: override?.notes || 'Rejected by admin after review.',
         decidedAt: new Date().toISOString(),
       },
     });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse font-medium">Verifying authority credentials...</div>;
  if (accessDenied) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-destructive shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <ShieldCheck className="w-12 h-12 text-destructive opacity-20" />
          </div>
          <CardTitle className="text-destructive text-2xl font-black">Access Denied</CardTitle>
          <CardDescription>{accessDenied}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
           <Button asChild variant="outline">
              <Link href="/login">Login as administrator</Link>
           </Button>
        </CardContent>
      </Card>
    );
  }
  if (!isAuthorized) return null;

  const totalProjects = projects.length;
  const verifiedCount = projects.filter(p => ['verified', 'minted', 'listed'].includes(p.status)).length;
  const pendingCount = projects.filter(p => p.status === 'pending' || p.status === 'pending_admin').length;
  const mintedCount = projects.filter(p => p.status === 'minted').length;
  const retiredCount = projects.filter(p => p.status === 'retired').length;
  const totalTokens = ownedTokens.reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: 'Total Projects', value: totalProjects, icon: FileText, color: 'text-primary' },
    { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-500' },
    { label: 'Verified Assets', value: verifiedCount, icon: ShieldCheck, color: 'text-blue-500' },
    { label: 'Minted Credits', value: mintedCount, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Retired (Burnt)', value: retiredCount, icon: Flame, color: 'text-muted-foreground' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black tracking-tight">Global Administrator</h2>
            <Badge variant="destructive" className="font-black h-5 px-2 text-[10px] tracking-widest uppercase">Admin Mode</Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-sm font-medium">System-wide monitoring of all CCTS submissions and token lifecycles.</p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="border-border shadow-sm overflow-hidden relative group hover:border-primary transition-all">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* All Projects Table */}
        <Card className="lg:col-span-2 shadow-sm border-border overflow-hidden">
          <CardHeader className="border-b border-border bg-muted">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">CCTS Submission Ledger</CardTitle>
                <CardDescription>Comprehensive list of all platform projects.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest gap-2">
                <Search className="w-3.5 h-3.5" /> Filter Results
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-12">
                 <Activity className="w-12 h-12 text-muted-foreground/20 mb-4" />
                 <p className="text-sm font-bold text-muted-foreground">No active data artifacts found</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground h-10">Project Identity</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground h-10">Coordinates</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground h-10">Platform Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground h-10 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(p => (
                    <TableRow key={p.id} className="border-border hover:bg-muted transition-all">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold tracking-tight text-sm">{p.name}</span>
                          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-2.5 h-2.5" /> {p.createdAt}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {p.lat}, {p.lng}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={p.status === 'minted' ? 'default' : 'secondary'} className={`text-[9px] font-black h-5 px-1.5 py-0 border-none ${
                              p.status === 'minted' ? 'bg-green-500 text-white' :
                             p.status === 'verified' ? 'bg-blue-500 text-white' :
                             p.status === 'pending_admin' ? 'bg-amber-500 text-black' :
                             p.status === 'pending' ? 'bg-yellow-500 text-black' :
                             p.status === 'rejected' ? 'bg-red-500 text-white' :
                             'bg-muted text-muted-foreground'
                          }`}>
                            {p.status.toUpperCase()}
                          </Badge>
                          {p.tokenId && <span className="font-mono text-[9px] text-muted-foreground"># {p.tokenId}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === 'pending_admin' && (
                             <div className="flex items-center gap-2">
                               <Input
                                 type="number"
                                 min={1}
                                 value={getOverride(p).credits}
                                 onChange={(e) => setOverrideField(p.id, 'credits', e.target.value, p)}
                                 className="h-8 w-20 text-[10px]"
                                 placeholder="Credits"
                               />
                               <Input
                                 type="number"
                                 min={0}
                                 max={100}
                                 value={getOverride(p).additionality}
                                 onChange={(e) => setOverrideField(p.id, 'additionality', e.target.value, p)}
                                 className="h-8 w-16 text-[10px]"
                                 placeholder="Addl."
                               />
                               <Input
                                 type="text"
                                 value={getOverride(p).notes}
                                 onChange={(e) => setOverrideField(p.id, 'notes', e.target.value, p)}
                                 className="h-8 w-44 text-[10px]"
                                 placeholder="Admin notes"
                               />
                               <Button onClick={() => handleMintCredit(p)} disabled={isPending && mintingId === p.id} size="sm" className="h-8 bg-green-600 hover:bg-green-700 font-bold px-2">
                                 {isPending && mintingId === p.id ? '...' : <Check className="w-3.5 h-3.5" />}
                               </Button>
                               <Button onClick={() => handleReject(p.id)} variant="destructive" size="sm" className="h-8 px-2">
                                 <X className="w-3.5 h-3.5" />
                               </Button>
                             </div>
                           )}
                           <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary hover:text-white transition-colors">
                              <Link href={`/verification-report?id=${p.id}`}>
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* System Summary */}
        <div className="space-y-6">
           <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-4">
                 <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                   <BarChart3 className="w-4 h-4 text-primary" /> Token Lifecycle
                 </CardTitle>
                 <CardDescription className="text-xs">Aggregate data across Polygon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 rounded-xl bg-background border border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">CCTS Supply</p>
                    <p className="text-3xl font-black text-green-500 tracking-tighter">{totalTokens} <span className="text-xs font-medium text-muted-foreground">Tokens</span></p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-background border border-border/50">
                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active</p>
                       <p className="text-xl font-black text-blue-500 tracking-tighter">{ownedTokens.filter(t => !t.retired).length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border/50">
                       <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Retired</p>
                       <p className="text-xl font-black text-muted-foreground tracking-tighter">{ownedTokens.filter(t => t.retired).length}</p>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="pt-2">
                 <Button asChild className="w-full h-10 font-bold gap-2">
                    <Link href="/dashboard">View Public Dashboard <ArrowRight className="w-3.5 h-3.5" /></Link>
                 </Button>
              </CardFooter>
           </Card>

           <Card className="border-border shadow-sm bg-muted">
              <CardHeader className="p-4">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> System Activity
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                 {[
                   { msg: 'Admin session initiated', time: 'Just now' },
                   { msg: 'CCTS Contract Synced', time: '2m ago' },
                   { msg: 'API Gateway Online', time: 'Active' },
                 ].map((log, i) => (
                   <div key={i} className="flex justify-between items-center text-[10px] font-medium py-1 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{log.msg}</span>
                      <span className="font-mono text-primary">{log.time}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
