"use client";

import { VisionResult, SatelliteResult, LLMResult } from '../lib/projectStore';
import CCTSBadge from './CCTSBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, MapPin, Calendar, Camera, Satellite, Brain, CheckCircle2, AlertCircle } from "lucide-react"

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

function ScoreBar({ value, max = 100, color = 'bg-emerald-500' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-slate-800 rounded-none h-2.5 overflow-hidden">
      <div className={`h-full rounded-none transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatItem({ label, value, unit, color = 'text-primary' }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono font-semibold ${color}`}>
        {value}{unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
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
      <Card className="border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">{projectName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {lat}, {lng} · <Calendar className="w-3.5 h-3.5" /> {createdAt || new Date().toISOString().split('T')[0]}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <CCTSBadge schemeType={schemeType === 'compliance' ? 'Compliance' : 'Offset'} />
            {llmResult?.final_verification_status === 'Approved' && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                <CheckCircle2 className="w-3 h-3 mr-1" /> VERIFIED
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {ipfsHash && (
            <div className="bg-muted rounded-none p-3 border border-border text-xs">
              <span className="text-muted-foreground">IPFS Hash: </span>
              <span className="font-mono text-primary break-all">{ipfsHash}</span>
            </div>
          )}

          {/* Overall Score */}
          {llmResult && (
            <div className="flex items-center gap-6 p-4 bg-muted rounded-none border border-border">
              <div className="relative flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-border"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={226.2}
                    strokeDashoffset={226.2 - (226.2 * overallScore) / 100}
                    className="text-primary"
                  />
                </svg>
                <span className="absolute text-2xl font-black text-primary">{overallScore}</span>
              </div>
              <div>
                <p className="text-sm font-bold">Overall Verification Score</p>
                <p className="text-xs text-muted-foreground">Composite of vision, satellite, and AI analysis</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ML Vision Results Section */}
        <Card className={`${!visionResult && 'opacity-50'}`}>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> ML Vision Analysis
            </CardTitle>
            <CardDescription>DeepForest Tree Detection</CardDescription>
          </CardHeader>
          <CardContent>
            {visionResult ? (
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-muted-foreground">Trees Detected</span>
                  <span className="text-2xl font-black text-primary">{visionResult.tree_count}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Average Health Score</span>
                    <span className="font-mono font-bold text-primary">{visionResult.average_health_score}%</span>
                  </div>
                  <Progress value={visionResult.average_health_score} className="h-2" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Survival Rate</span>
                    <span className="font-mono font-bold text-primary">{(visionResult.survival_rate * 100 || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={visionResult.survival_rate * 100} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-none text-muted-foreground italic text-sm">
                Awaiting vision analysis…
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satellite Results Section */}
        <Card className={`${!satelliteResult && 'opacity-50'}`}>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Satellite className="w-5 h-5 text-blue-500" /> Satellite Analysis
            </CardTitle>
            <CardDescription>GEE / Sentinel-2 Data</CardDescription>
          </CardHeader>
          <CardContent>
            {satelliteResult ? (
              <div className="space-y-2">
                <StatItem label="NDVI Index" value={(satelliteResult?.ndvi || 0).toFixed(3)} color="text-blue-500" />
                <StatItem label="Canopy Cover" value={(satelliteResult?.canopy_cover_percentage || 0).toFixed(1)} unit="%" color="text-blue-500" />
                <StatItem label="Biomass Estimate" value={(satelliteResult?.biomass_estimate_tons || 0).toFixed(2)} unit="tons" color="text-blue-500" />

                {satelliteResult.positive_change_from_last_year && (
                  <div className="mt-4 p-3 bg-muted border border-blue-500/30 rounded-none flex items-center gap-4">
                    <div className="w-10 h-10 rounded-none bg-blue-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">YoY Vegetation Gain</p>
                      <p className="text-lg font-bold text-blue-500">{satelliteResult.positive_change_from_last_year}</p>
                    </div>
                  </div>
                )}
                {satelliteResult.latest_imagery && (
                  <p className="text-[10px] text-muted-foreground mt-4 text-center">Imagery acquired on {satelliteResult.latest_imagery}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-none text-muted-foreground italic text-sm">
                Awaiting satellite data…
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* LLM Verification Section */}
      <Card className={`${!llmResult && 'opacity-50'}`}>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" /> AI Verification Analysis
            <Badge variant="outline" className="ml-2 font-normal text-[10px] text-purple-500 border-purple-500">
              Vertex AI (Simulated)
            </Badge>
          </CardTitle>
          <CardDescription>Multi-modal MRV Assessment</CardDescription>
        </CardHeader>
        <CardContent>
          {llmResult ? (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Additionality Score</span>
                  <span className="font-mono font-bold text-purple-500">{llmResult.additionality_score}/100</span>
                </div>
                <Progress value={llmResult.additionality_score} className="h-2 bg-muted" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <StatItem
                  label="Greenwashing Risk"
                  value={llmResult.greenwashing_risk}
                  color={llmResult.greenwashing_risk === 'Low' ? 'text-green-500' : llmResult.greenwashing_risk === 'Medium' ? 'text-amber-500' : 'text-red-500'}
                />
                <StatItem label="MRV Compliance" value={llmResult.mrv_compliance ? 'Passed ✓' : 'Failed ✗'} color={llmResult.mrv_compliance ? 'text-green-500' : 'text-red-500'} />
                <StatItem label="CCTS Eligible" value={llmResult.ccts_eligible ? 'Yes ✓' : 'No ✗'} color={llmResult.ccts_eligible ? 'text-green-500' : 'text-red-500'} />
              </div>

              <div className="mt-4 p-4 rounded-none border-2 border-dashed border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-none ${llmResult.final_verification_status === 'Approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {llmResult.final_verification_status === 'Approved' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold">Final Verification Decision</h4>
                    <p className="text-xs text-muted-foreground">CCTS Eligibility Status</p>
                  </div>
                </div>
                <Badge className={`text-base px-6 py-1.5 rounded-none ${
                  llmResult.final_verification_status === 'Approved'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {llmResult.final_verification_status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-none text-muted-foreground italic text-sm">
              Awaiting AI verification…
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download PDF Button */}
      <div className="flex justify-center pt-4 print:hidden">
        <Button
          onClick={handleDownloadPDF}
          size="lg"
          className="rounded-none px-8 h-12 gap-2"
        >
          <FileDown className="w-5 h-5" /> Download Report as PDF
        </Button>
      </div>
    </div>
  );
}
