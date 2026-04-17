"use client";

import Link from 'next/link';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectStore } from '../../lib/projectStore';
import WalletCard from '../../components/WalletCard';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Database, Sparkles, History, LayoutDashboard, Settings2, ExternalLink, Trash2 } from "lucide-react"

export default function Dashboard() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { user, subscriptionTier, isAdmin } = useAuth();
  const { projects, ownedTokens, loadSampleData, clearAll } = useProjectStore();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse font-medium">Verifying secure access...</div>;
  }
  if (accessDenied) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-destructive cover">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>{accessDenied}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  if (!isAuthorized) return null;

  const verifiedCount = projects.filter(p => p.status === 'verified' || p.status === 'minted' || p.status === 'listed').length;
  const mintedCount = ownedTokens.reduce((sum, t) => sum + t.amount, 0);
  const retiredCount = ownedTokens.filter(t => t.retired).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 animate-fadeIn pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Executive Dashboard</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="font-mono text-[10px] py-0 px-2">
              {user?.email && user.email !== 'wallet-user' ? user.email : 'Web3 Identity'}
            </Badge>
            {isAdmin && <Badge variant="destructive" className="text-[10px] py-0 px-2 font-bold italic">ADMIN</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSampleData}
            className="h-9 gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Load Sample Data
          </Button>
          {projects.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-9 text-destructive hover:bg-destructive hover:text-white border border-border"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear
            </Button>
          )}
          {subscriptionTier !== 'free' && (
            <Button asChild size="sm" className="h-9 px-6 shadow-lg">
              <Link href="/submit-project"><Plus className="w-4 h-4 mr-1" /> New Project</Link>
            </Button>
          )}
        </div>
      </div>

      <WalletCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-primary transition-colors shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-widest text-[10px] font-black">Total Assets</CardDescription>
            <CardTitle className="text-4xl font-black tracking-tighter">{projects.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <div className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
              {verifiedCount} verified certificates
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-widest text-[10px] font-black">Inventory</CardDescription>
            <CardTitle className="text-4xl font-black tracking-tighter">{mintedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Database className="w-3 h-3" /> {ownedTokens.filter(t => !t.retired).length} active tokens
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500 transition-colors shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-widest text-[10px] font-black">Impact</CardDescription>
            <CardTitle className="text-4xl font-black tracking-tighter text-blue-500">{retiredCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-500">
              <History className="w-3 h-3" /> CCTS Compliance Offset
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" /> Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-none">
                <p className="font-semibold text-lg mb-1">No activity yet</p>
                <p className="text-sm">Submit your first project to begin verification.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {projects.slice(0, 5).map(p => (
                  <div key={p.id} className="flex justify-between items-center py-3 border-b border-border last:border-0 hover:bg-muted/30 px-2 rounded-none transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-none ${p.status === 'minted' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.tokenId && <Badge variant="outline" className="text-[10px] font-mono">TKN #{p.tokenId}</Badge>}
                      <Badge className={`text-[10px] font-black ${
                        p.status === 'minted' ? 'bg-green-500 text-white' :
                        p.status === 'verified' ? 'bg-blue-500 text-white' :
                        p.status === 'pending_admin' ? 'bg-amber-500 text-black' :
                        p.status === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-amber-500 text-black'
                      }`}>
                        {p.status.toUpperCase()}
                      </Badge>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Link href={`/verification-report?id=${p.id}`}><ExternalLink className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Console / Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button asChild variant="outline" className="justify-start h-12 gap-3 text-sm font-semibold border-border hover:border-primary transition-all">
              <Link href="/my-projects">📋 My Portfolio</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-12 gap-3 text-sm font-semibold border-border hover:border-primary transition-all">
              <Link href="/marketplace">🏪 Marketplace</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-12 gap-3 text-sm font-semibold border-border hover:border-primary transition-all">
              <Link href="/portfolio">💼 Assets & Credits</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="secondary" className="justify-start h-12 gap-3 text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/80 mt-4">
                <Link href="/admin">🛡️ Global Admin Panel</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
