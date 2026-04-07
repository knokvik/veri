"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ─────────── Types ─────────── */
export interface VisionResult {
  tree_count: number;
  average_health_score: number;
  survival_rate: number;
  confidence_score?: number;
}

export interface SatelliteResult {
  ndvi: number;
  canopy_cover_percentage: number;
  biomass_estimate_tons: number;
  positive_change_from_last_year?: string;
  latest_imagery?: string;
}

export interface LLMResult {
  additionality_score: number;
  greenwashing_risk: string;
  mrv_compliance: boolean;
  final_verification_status: string;
  ccts_eligible: boolean;
}

export interface Project {
  id: string;
  name: string;
  lat: string;
  lng: string;
  schemeType: 'compliance' | 'offset';
  status: 'pending' | 'pending_admin' | 'verified' | 'minted' | 'listed' | 'retired' | 'rejected';
  ipfsHash?: string;
  validationData?: any;
  visionResult?: VisionResult; // legacy compatibility
  satelliteResult?: SatelliteResult; // legacy compatibility
  llmResult?: any; // legacy compatibility
  adminDecision?: {
    approvedCredits?: number;
    approvedAdditionality?: number;
    adminNotes?: string;
    decidedAt?: string;
  };
  tokenId?: number;
  mintedAt?: string;
  createdAt: string;
  owner?: string;
}

export interface OwnedToken {
  tokenId: number;
  projectName: string;
  schemeType: 'compliance' | 'offset';
  amount: number;
  mintedAt: string;
  retired: boolean;
  retiredAt?: string;
  certificateURI?: string;
}

interface ProjectStoreContextType {
  projects: Project[];
  ownedTokens: OwnedToken[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProject: (id: string) => Project | undefined;
  addOwnedToken: (token: OwnedToken) => void;
  retireToken: (tokenId: number) => void;
  loadSampleData: () => void;
  clearAll: () => void;
}

const ProjectStoreContext = createContext<ProjectStoreContextType | undefined>(undefined);

const STORAGE_KEY_PROJECTS = 'vc_projects';
const STORAGE_KEY_TOKENS = 'vc_tokens';

/* ─────────── Sample Data ─────────── */
const sampleProjects: Project[] = [
  {
    id: 'sample-001',
    name: 'Western Ghats Reforestation Alpha',
    lat: '15.345',
    lng: '73.891',
    schemeType: 'compliance',
    status: 'minted',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    validationData: {
      status: "APPROVED",
      layer_1_vision: { model_used: "deepforest", tree_count: 512, average_health_score: 95.0, survival_rate: 98.4 },
      layer_2_satellite: { baseline_ndvi: 0.15, current_ndvi: 0.82, change_from_baseline: 446.7, canopy_cover_percentage: 86.1 },
      layer_3_cross_validation: { mismatches_found: false, flags: [], greenwashing_risk: "Low" },
      layer_4_llm_placeholder: { overall_confidence: 95, additionality_score: 100, greenwashing_risk: "Low", net_issuable_carbon_tons: 125.4, mrv_compliance: "PASS", human_readable_summary: "Verification complete. DeepForest detected trees correlating with Satellite canopy." }
    },
    tokenId: 101,
    mintedAt: '2026-04-10',
    createdAt: '2026-04-08',
  },
  {
    id: 'sample-002',
    name: 'Himalayan Foothills Restoration',
    lat: '27.986',
    lng: '86.922',
    schemeType: 'offset',
    status: 'verified',
    ipfsHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX',
    validationData: {
      status: "REVIEW_REQUIRED",
      layer_1_vision: { model_used: "deepforest", tree_count: 320, average_health_score: 75.0, survival_rate: 65.0 },
      layer_2_satellite: { baseline_ndvi: 0.20, current_ndvi: 0.55, change_from_baseline: 175.0, canopy_cover_percentage: 57.7 },
      layer_3_cross_validation: { mismatches_found: true, flags: ["WARNING: Vision tree count significantly exceeds claimed amount. Verify plot boundaries."], greenwashing_risk: "Medium" },
      layer_4_llm_placeholder: { overall_confidence: 80, additionality_score: 87.5, greenwashing_risk: "Medium", net_issuable_carbon_tons: 65.2, mrv_compliance: "FAIL", human_readable_summary: "CRITICAL FLAGS DETECTED! Potential plot boundary discrepancy." }
    },
    createdAt: '2026-03-15',
  },
  {
    id: 'sample-003',
    name: 'Sundarbans Mangrove Defense',
    lat: '21.948',
    lng: '89.183',
    schemeType: 'compliance',
    status: 'minted',
    ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
    validationData: {
      status: "APPROVED",
      layer_1_vision: { model_used: "heuristic-pixel-density", tree_count: 1205, average_health_score: 98.0, survival_rate: 88.2 },
      layer_2_satellite: { baseline_ndvi: 0.10, current_ndvi: 0.88, change_from_baseline: 780.0, canopy_cover_percentage: 92.4 },
      layer_3_cross_validation: { mismatches_found: false, flags: [], greenwashing_risk: "Low" },
      layer_4_llm_placeholder: { overall_confidence: 95, additionality_score: 100, greenwashing_risk: "Low", net_issuable_carbon_tons: 450.5, mrv_compliance: "PASS", human_readable_summary: "Verification complete. Dense biomass detected." }
    },
    tokenId: 103,
    mintedAt: '2026-04-12',
    createdAt: '2026-04-05',
  },
];

const sampleTokens: OwnedToken[] = [
  { tokenId: 101, projectName: 'Western Ghats Reforestation Alpha', schemeType: 'compliance', amount: 100, mintedAt: '2026-04-10', retired: false },
  { tokenId: 103, projectName: 'Sundarbans Mangrove Defense', schemeType: 'compliance', amount: 50, mintedAt: '2026-04-12', retired: false },
];

/* ─────────── Provider ─────────── */
export function ProjectStoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ownedTokens, setOwnedTokens] = useState<OwnedToken[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
      const storedTokens = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (storedProjects) setProjects(JSON.parse(storedProjects));
      if (storedTokens) setOwnedTokens(JSON.parse(storedTokens));
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(ownedTokens));
  }, [ownedTokens]);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const addOwnedToken = useCallback((token: OwnedToken) => {
    setOwnedTokens(prev => [token, ...prev]);
  }, []);

  const retireToken = useCallback((tokenId: number) => {
    setOwnedTokens(prev => prev.map(t =>
      t.tokenId === tokenId ? { ...t, retired: true, retiredAt: new Date().toISOString().split('T')[0] } : t
    ));
    setProjects(prev => prev.map(p =>
      p.tokenId === tokenId ? { ...p, status: 'retired' as const } : p
    ));
  }, []);

  const loadSampleData = useCallback(() => {
    setProjects(sampleProjects);
    setOwnedTokens(sampleTokens);
  }, []);

  const clearAll = useCallback(() => {
    setProjects([]);
    setOwnedTokens([]);
  }, []);

  return (
    <ProjectStoreContext.Provider value={{ projects, ownedTokens, addProject, updateProject, getProject, addOwnedToken, retireToken, loadSampleData, clearAll }}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore() {
  const context = useContext(ProjectStoreContext);
  if (!context) throw new Error('useProjectStore must be used within ProjectStoreProvider');
  return context;
}
