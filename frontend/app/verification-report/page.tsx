"use client";

import { useSearchParams } from 'next/navigation';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore } from '../../lib/projectStore';
import VerificationReport from '../../components/VerificationReport';
import Link from 'next/link';
import { Suspense } from 'react';

function ReportContent() {
  const { isAuthorized, loading, accessDenied } = useProtectedRoute();
  const { projects } = useProjectStore();
  const searchParams = useSearchParams();

  if (loading) return <div className="text-center mt-20 text-slate-400 animate-pulse">Loading...</div>;
  if (accessDenied) return <div className="text-center mt-20 text-red-400 panel max-w-md mx-auto">{accessDenied}</div>;
  if (!isAuthorized) return null;

  const projectId = searchParams.get('id');
  const project = projectId ? projects.find(p => p.id === projectId) : projects[0];

  if (!project) {
    return (
      <div className="max-w-md mx-auto mt-20 panel text-center space-y-4">
        <p className="text-xl text-slate-300">No verification report found</p>
        <p className="text-sm text-slate-500">Submit a project first to generate a verification report.</p>
        <Link href="/submit-project" className="btn-primary inline-block px-6 py-2 text-sm">
          Submit a Project
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <Link href="/my-projects" className="text-sm text-tealAccent hover:underline">
          ← Back to My Projects
        </Link>
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
    <Suspense fallback={<div className="text-center mt-20 text-slate-400 animate-pulse">Loading report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
