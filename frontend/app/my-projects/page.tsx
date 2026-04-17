"use client";

import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import Link from 'next/link';
import CCTSBadge from '../../components/CCTSBadge';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TreePine, Activity, Eye, MapPin, ExternalLink } from "lucide-react"

export default function MyProjects() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { projects } = useProjectStore();

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse font-medium">Loading projects...</div>;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'minted': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">MINTED</Badge>;
      case 'verified': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">VERIFIED</Badge>;
      case 'pending_admin': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">PENDING ADMIN</Badge>;
      case 'rejected': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">REJECTED</Badge>;
      case 'retired': return <Badge variant="outline" className="text-muted-foreground">RETIRED</Badge>;
      case 'listed': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">LISTED</Badge>;
      default: return <Badge variant="secondary">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 animate-fadeIn pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Project Portfolio</h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Review your forest assets and active CCTS compliance certificates.</p>
        </div>
        <Button asChild className="shadow-lg shadow-primary/20 h-10 px-6">
          <Link href="/submit-project">
            <Plus className="w-4 h-4 mr-2" /> New Submission
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-muted/30 border-dashed py-16">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <TreePine className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">No projects found</p>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                Your portfolio is empty. Submit a project or load sample data from the dashboard to begin.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/submit-project">Start Submission</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map(p => (
            <Card key={p.id} className="group hover:border-primary/50 transition-all duration-300 relative overflow-hidden shadow-sm">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                p.status === 'minted' ? 'bg-green-500' :
                p.status === 'verified' ? 'bg-blue-500' :
                p.status === 'listed' ? 'bg-amber-500' : 'bg-muted'
              }`} />
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{p.name}</CardTitle>
                  <CCTSBadge schemeType={p.schemeType === 'compliance' ? 'Compliance' : 'Offset'} />
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {p.lat}, {p.lng}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.validationData?.layer_1_vision && (
                    <Badge variant="secondary" className="font-mono text-[10px] gap-1.5 bg-muted/60 border-border">
                      <TreePine className="w-3 h-3" /> Trees: {p.validationData.layer_1_vision.tree_count}
                    </Badge>
                  )}
                   {p.validationData?.layer_1_vision && (
                    <Badge variant="secondary" className="font-mono text-[10px] gap-1.5 bg-muted/60 border-border">
                      <Activity className="w-3 h-3" /> Health: {p.validationData.layer_1_vision.average_health_score}%
                    </Badge>
                  )}
                  {p.validationData?.layer_4_llm_placeholder && (
                    <Badge className="font-mono text-[10px] gap-1.5 bg-blue-500/10 text-blue-500 border-blue-500/10 hover:bg-blue-500/20">
                      <Activity className="w-3 h-3" /> Additionality: {p.validationData.layer_4_llm_placeholder.additionality_score}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Platform Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(p.status)}
                      {p.tokenId && <span className="text-[11px] font-mono text-muted-foreground"># {p.tokenId}</span>}
                    </div>
                  </div>

                  <Button asChild variant="ghost" size="sm" className="group/btn text-xs font-bold gap-2 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href={`/verification-report?id=${p.id}`}>
                      Full Report <ExternalLink className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
