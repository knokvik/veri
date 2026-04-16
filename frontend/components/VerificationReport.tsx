"use client";

import { VisionResult, SatelliteResult, LLMResult } from '../lib/projectStore';
import CCTSBadge from './CCTSBadge';

interface VerificationReportProps {
  projectName: string;
  lat: string;
  lng: string;
  schemeType: 'compliance' | 'offset';
  ipfsHash?: string;
  visionResult?: VisionResult;
  satelliteResult?: SatelliteResult;
  llmResult?: LLMResult;
  createdAt?: string;
}

function ScoreBar({ value, max = 100, color = 'bg-climateGreen' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatItem({ label, value, unit, color = 'text-climateGreen' }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-b-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`font-mono font-semibold ${color}`}>
        {value}{unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export default function VerificationReport({
  projectName,
  lat,
  lng,
  schemeType,
  ipfsHash,
  visionResult,
  satelliteResult,
  llmResult,
  createdAt,
}: VerificationReportProps) {

  const handleDownloadPDF = () => {
    window.print();
  };

  const overallScore = llmResult
    ? Math.round((llmResult.additionality_score + (visionResult?.average_health_score || 0) + ((satelliteResult?.ndvi || 0) * 100)) / 3)
    : 0;

  return (
    <div className="verification-report space-y-6" id="verification-report">
      {/* Header */}
      <div className="panel border-t-4 border-t-climateGreen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{projectName}</h2>
            <p className="text-sm text-slate-400 mt-1">
              📍 {lat}, {lng} · 📅 {createdAt || new Date().toISOString().split('T')[0]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CCTSBadge schemeType={schemeType === 'compliance' ? 'Compliance' : 'Offset'} />
            {llmResult?.final_verification_status === 'Approved' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-900/40 border border-green-500 text-green-400">
                ✅ VERIFIED
              </span>
            )}
          </div>
        </div>

        {ipfsHash && (
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-xs">
            <span className="text-slate-400">IPFS Hash: </span>
            <span className="font-mono text-tealAccent break-all">{ipfsHash}</span>
          </div>
        )}

        {/* Overall Score */}
        {llmResult && (
          <div className="mt-4 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-climateGreen flex items-center justify-center bg-green-900/20">
              <span className="text-2xl font-black text-climateGreen">{overallScore}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Overall Verification Score</p>
              <p className="text-xs text-slate-400">Composite of vision, satellite, and AI analysis</p>
            </div>
          </div>
        )}
      </div>

      {/* ML Vision Results Section */}
      <div className={`panel ${visionResult ? 'border-l-4 border-l-climateGreen' : 'opacity-50'}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">📸</span> ML Vision Analysis
          <span className="text-xs text-slate-500">(DeepForest)</span>
        </h3>

        {visionResult ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">Trees Detected</span>
                <span className="text-lg font-black text-climateGreen">{visionResult.tree_count}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">Average Health Score</span>
                <span className="font-mono text-sm text-climateGreen">{visionResult.average_health_score}%</span>
              </div>
              <ScoreBar value={visionResult.average_health_score} />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">Survival Rate</span>
                <span className="font-mono text-sm text-climateGreen">{(visionResult.survival_rate * 100 || 0).toFixed(1)}%</span>
              </div>
              <ScoreBar value={visionResult.survival_rate * 100} color="bg-tealAccent" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Awaiting vision analysis…</p>
        )}
      </div>

      {/* Satellite Results Section */}
      <div className={`panel ${satelliteResult ? 'border-l-4 border-l-blue-500' : 'opacity-50'}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">🛰️</span> Satellite Analysis
          <span className="text-xs text-slate-500">(Google Earth Engine / Sentinel-2)</span>
        </h3>

        {satelliteResult ? (
          <div className="space-y-1">
            <StatItem label="NDVI Index" value={(satelliteResult?.ndvi || 0).toFixed(3)} color="text-blue-400" />
            <StatItem label="Canopy Cover" value={(satelliteResult?.canopy_cover_percentage || 0).toFixed(1)} unit="%" color="text-blue-400" />
            <StatItem label="Biomass Estimate" value={(satelliteResult?.biomass_estimate_tons || 0).toFixed(2)} unit="tons" color="text-blue-400" />

            {satelliteResult.positive_change_from_last_year && (
              <div className="mt-3 bg-blue-900/20 border border-blue-800 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="text-sm font-semibold text-blue-300">Year-over-Year Change</p>
                  <p className="text-lg font-bold text-blue-400">{satelliteResult.positive_change_from_last_year}</p>
                </div>
              </div>
            )}

            {satelliteResult.latest_imagery && (
              <p className="text-xs text-slate-500 mt-2">Latest imagery: {satelliteResult.latest_imagery}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Awaiting satellite data…</p>
        )}
      </div>

      {/* LLM Verification Section */}
      <div className={`panel ${llmResult ? 'border-l-4 border-l-purple-500' : 'opacity-50'}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">🧠</span> AI Verification Score
          <span className="text-xs bg-purple-900/40 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full ml-2">
            PLACEHOLDER — Future Vertex Generative AI
          </span>
        </h3>
        {/* 
          @@@ VERTEX GENERATIVE AI INTEGRATION PLACEHOLDER @@@
          When connecting Vertex AI, replace the simulated data below with 
          the actual API response from /api/verify/llm which will call
          Vertex Generative AI for additionality scoring, greenwashing 
          detection, full MRV compliance, and final verification decision.
        */}

        {llmResult ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">Additionality Score</span>
                <span className="font-mono font-bold text-purple-400">{llmResult.additionality_score}/100</span>
              </div>
              <ScoreBar value={llmResult.additionality_score} color="bg-purple-500" />
            </div>

            <StatItem
              label="Greenwashing Risk"
              value={llmResult.greenwashing_risk}
              color={llmResult.greenwashing_risk === 'Low' ? 'text-green-400' : llmResult.greenwashing_risk === 'Medium' ? 'text-amber-400' : 'text-red-400'}
            />
            <StatItem label="MRV Compliance" value={llmResult.mrv_compliance ? 'Passed ✓' : 'Failed ✗'} color={llmResult.mrv_compliance ? 'text-green-400' : 'text-red-400'} />
            <StatItem label="CCTS Eligible" value={llmResult.ccts_eligible ? 'Yes ✓' : 'No ✗'} color={llmResult.ccts_eligible ? 'text-green-400' : 'text-red-400'} />

            <div className="mt-3 bg-slate-900 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">Final Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                llmResult.final_verification_status === 'Approved'
                  ? 'bg-green-900/40 border border-green-500 text-green-400'
                  : 'bg-red-900/40 border border-red-500 text-red-400'
              }`}>
                {llmResult.final_verification_status}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Awaiting AI verification…</p>
        )}
      </div>

      {/* Download PDF Button */}
      <div className="flex justify-center print:hidden">
        <button
          onClick={handleDownloadPDF}
          className="btn-secondary px-8 py-3 flex items-center gap-2 text-sm"
        >
          <span>📄</span> Download Report as PDF
        </button>
      </div>
    </div>
  );
}
