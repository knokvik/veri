"use client";

import { useSearchParams } from 'next/navigation';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import VerificationReport from '../../components/VerificationReport';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ChevronLeft, FileSearch, TreePine } from "lucide-react"

function ReportContent() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { projects } = useProjectStore();
  const searchParams = useSearchParams();

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse font-medium">Loading report assets...</div>;
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

  const projectId = searchParams.get('id');
  const project = projectId ? projects.find(p => p.id === projectId) : projects[0];

  if (!project) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
             <FileSearch className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Report Not Found</CardTitle>
            <CardDescription className="max-w-[250px] mx-auto mt-1">
              We couldn't locate a verification certificate for this project ID.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="mt-4">
            <Link href="/submit-project"><TreePine className="mr-2 w-4 h-4" /> Submit a Project</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center px-1">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors h-8 -ml-2">
          <Link href="/my-projects">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Projects
          </Link>
        </Button>
      </div>

      <VerificationReport
        projectName={project.name}
        lat={project.lat}
        lng={project.lng}
        schemeType={project.schemeType}
        ipfsHash={project.ipfsHash}
        visionResult={project.visionResult}
        satelliteResult={project.satelliteResult}
        llmResult={project.llmResult}
        createdAt={project.createdAt}
      />
    </div>
  );
}

export default function VerificationReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse">Initializing renderer...</div>}>
      <ReportContent />
    </Suspense>
  );
}
