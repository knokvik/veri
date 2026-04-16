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
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${llmResult.final_verification_status === 'REJECTED' ? 'border-red-500 bg-red-900/20 text-red-500' : 'border-climateGreen bg-green-900/20 text-climateGreen'}`}>
              <span className="text-2xl font-black">{llmResult.additionality_score}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Consensus Engine Score</p>
              <p className="text-xs text-slate-400">Final score based on Agentic AI penalties and weights</p>
            </div>
          </div>
        )}
      </div>

      {llmResult?.final_verification_status === 'REJECTED' && llmResult.greenwashing_risk === 'Critical' && (
        <div className="bg-red-900/30 border border-red-500 rounded p-4 text-red-300 text-sm font-mono mt-4">
          <p className="font-bold text-red-400 mb-1">⚠ PIPELINE ERROR DETECTED</p>
          <p>The agentic pipeline blocked verification because critical services are offline or data is missing. Please ensure Ollama is running and API keys are configured.</p>
        </div>
      )}

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
                <span className={`text-lg font-black ${visionResult.tree_count === 0 ? 'text-red-400' : 'text-climateGreen'}`}>{visionResult.tree_count}</span>
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
          <span className="text-xl">🧠</span> Agentic AI Output
          <span className="text-xs bg-purple-900/40 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full ml-2">
            LangGraph / Ollama
          </span>
        </h3>

        {llmResult ? (
          <div className="space-y-3">
            <StatItem
              label="Risk Level (Penalty Applied)"
              value={llmResult.greenwashing_risk.toUpperCase()}
              color={llmResult.greenwashing_risk === 'Low' ? 'text-green-400' : llmResult.greenwashing_risk === 'Medium' ? 'text-amber-400' : 'text-red-400'}
            />
            <StatItem label="MRV Compliance" value={llmResult.mrv_compliance ? 'Passed ✓' : 'Failed ✗'} color={llmResult.mrv_compliance ? 'text-green-400' : 'text-red-400'} />
            <StatItem label="CCTS Eligible" value={llmResult.ccts_eligible ? 'Yes ✓' : 'No ✗'} color={llmResult.ccts_eligible ? 'text-green-400' : 'text-red-400'} />

            <div className={`mt-3 rounded-lg p-3 border flex items-center justify-between ${llmResult.final_verification_status === 'APPROVED' ? 'bg-slate-900 border-slate-800' : 'bg-red-900/10 border-red-500/50'}`}>
              <span className="text-sm font-semibold text-slate-300">Final Decision</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                llmResult.final_verification_status === 'APPROVED'
                  ? 'bg-green-900/40 border border-green-500 text-green-400'
                  : 'bg-red-900/40 border border-red-500 text-red-400'
              }`}>
                {llmResult.final_verification_status}
              </span>
            </div>

            {llmResult.explanation && (
              <div className="mt-3 bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-4 shadow-inner">
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-1 block">🧠 Agentic AI Reasoning</span>
                <p className="text-sm text-indigo-100/80 leading-relaxed font-serif">
                  "{llmResult.explanation}"
                </p>
              </div>
            )}
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
