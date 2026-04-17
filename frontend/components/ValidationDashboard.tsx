"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Camera, Satellite, Brain, AlertCircle, Leaf, Activity, Mountain, CloudRain, Thermometer } from "lucide-react"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function ValidationDashboard({ data }: { data: any }) {
  if (!data) return null;

  const { 
    status, 
    document_packet,
    layer_1_vision, 
    layer_2_satellite, 
    layer_3_cross_validation, 
    layer_4_llm_placeholder,
    layer_5_environmental_data
  } = data || {};

  const handleDownloadPDF = () => window.print();

  // Create graph data
  const ndviData = [
    { month: 'Pre-Planting', ndvi: layer_2_satellite?.baseline_ndvi || 0.15 },
    { month: 'Growth Phase', ndvi: ((layer_2_satellite?.baseline_ndvi || 0.15) + (layer_2_satellite?.current_ndvi || 0.78)) / 2 },
    { month: 'Current', ndvi: layer_2_satellite?.current_ndvi || 0.78 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn" id="verification-report">
      
      {/* Overview Block */}
      <Card className="border-t-4 border-t-teal-500 overflow-hidden shadow-sm">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-black text-teal-700">
              {status === 'APPROVED' ? '✅ VERIFIED & COMPLIANT' : '⚠️ REVIEW REQUIRED'}
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground tracking-widest uppercase text-[10px] mt-1">
              VeriCredit Multi-Layer Integrity Report
            </CardDescription>
          </div>
          <Badge className="bg-teal-500/10 text-teal-700 border-teal-500/20 text-xs px-3 py-1 font-black tracking-widest rounded-none">
            {layer_4_llm_placeholder?.mrv_compliance || "PENDING"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 border border-border p-4 mb-6">
            <p className="text-sm font-medium leading-relaxed">
              {layer_4_llm_placeholder?.human_readable_summary || "Audit complete."}
            </p>
          </div>
          {layer_4_llm_placeholder?.score_reasoning && (
            <div className="bg-blue-50 border border-blue-200 p-4 mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                Why This Score: {layer_4_llm_placeholder.score_reasoning.score_band} ({layer_4_llm_placeholder.score_reasoning.score_value})
              </p>
              <p className="text-xs text-blue-800 mt-2">
                {layer_4_llm_placeholder.score_reasoning.recommended_action}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              label="Validation Confidence" 
              value={`${layer_4_llm_placeholder?.overall_confidence || 0}%`} 
              icon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
            />
            <MetricCard 
              label="Net Issuable Carbon" 
              value={`${layer_4_llm_placeholder?.net_issuable_carbon_tons || 0} tCO₂e`} 
              icon={<Leaf className="w-4 h-4 text-emerald-500" />}
            />
            <MetricCard 
              label="Additionality Score" 
              value={layer_4_llm_placeholder?.additionality_score || 0} 
              icon={<Activity className="w-4 h-4 text-blue-500" />}
            />
            <MetricCard 
              label="Greenwashing Risk" 
              value={layer_4_llm_placeholder?.greenwashing_risk || "Unknown"} 
              icon={<AlertCircle className={`w-4 h-4 ${layer_4_llm_placeholder?.greenwashing_risk === 'High' ? 'text-red-500' : 'text-amber-500'}`} />}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Ground Vision Findings */}
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b border-border mb-4 pb-4 bg-muted/20">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-600" /> Ground Vision
            </CardTitle>
            <CardDescription>Uploaded Evidence Analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="relative w-full h-40 bg-zinc-100 dark:bg-zinc-900 border border-border rounded-sm overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/70 to-teal-200/40 dark:from-zinc-800 dark:to-zinc-900" />
                <Badge className="absolute top-2 right-2 bg-black/80 text-teal-300 font-mono text-[10px] uppercase border-none rounded-none backdrop-blur-sm">
                  {layer_1_vision?.model_used || "vision-model"}
                </Badge>
                <div className="z-10 text-center px-4">
                  <p className="text-xs uppercase tracking-widest font-black text-teal-700 dark:text-teal-300">
                    Processed Photos
                  </p>
                  <p className="text-2xl font-black text-teal-800 dark:text-teal-200">
                    {layer_1_vision?.valid_photo_count ?? 0}/{layer_1_vision?.total_photo_count ?? 0}
                  </p>
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Model</span>
                   <span className="text-xs font-mono">{layer_1_vision?.model_used || "DeepForest"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Trees Detected</span>
                   <span className="text-xl font-black text-teal-700">{layer_1_vision?.tree_count || 0}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Health Score</span>
                   <span className="text-xs font-mono">{layer_1_vision?.average_health_score || 0}%</span>
                </div>
                <div className="flex justify-between pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Est. Survival</span>
                   <span className="text-xs font-mono">{layer_1_vision?.survival_rate || 0}%</span>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Card 2: Satellite Analytics */}
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b border-border mb-4 pb-4 bg-muted/20">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Satellite className="w-5 h-5 text-blue-500" /> Satellite Analytics
            </CardTitle>
            <CardDescription>
              {layer_2_satellite?.is_live_observation ? "Live GEE Sentinel-2 Observation" : "Fallback Satellite Estimate (Review Recommended)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full h-40 bg-blue-50 dark:bg-zinc-900 border border-border rounded-sm overflow-hidden flex items-center justify-center">
               {layer_2_satellite?.satellite_preview_url ? (
                 <img
                   src={layer_2_satellite.satellite_preview_url}
                   alt="Satellite preview"
                   className="absolute inset-0 w-full h-full object-cover"
                 />
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-tr from-green-500/40 via-emerald-400/20 to-blue-500/30 mix-blend-multiply dark:mix-blend-color animate-pulse" />
               )}
               <Badge className="absolute top-2 right-2 bg-blue-900/80 text-blue-300 font-mono text-[10px] uppercase border-none rounded-none backdrop-blur-sm">
                 {layer_2_satellite?.sensor || "Satellite"}
               </Badge>
            </div>

            {/* Dynamic Graph using Recharts (Bottom) */}
            <div className="w-full h-32 pt-4 bg-muted/10 border border-border rounded-sm">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ndviData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="month" hide />
                        <YAxis domain={[-0.2, 1]} hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'black', borderRadius: '4px', border: 'none', color: 'white', fontSize: '10px', textTransform: 'uppercase' }}
                            itemStyle={{ color: '#60a5fa' }} 
                        />
                        <Line type="monotone" dataKey="ndvi" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Baseline NDVI</span>
                   <span className="text-xs font-mono">{layer_2_satellite?.baseline_ndvi}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current NDVI</span>
                   <span className="text-xl font-black text-blue-600">{layer_2_satellite?.current_ndvi}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Growth Delta</span>
                   <span className="text-xs font-mono text-emerald-600">+{layer_2_satellite?.change_from_baseline}%</span>
                </div>
                 <div className="flex justify-between pb-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Est. Canopy Cover</span>
                   <span className="text-xs font-mono">{layer_2_satellite?.canopy_cover_percentage}%</span>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Card 3: Weather Data */}
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b border-border mb-4 pb-4 bg-muted/20">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-sky-500" /> Weather & Climate Data
            </CardTitle>
            <CardDescription>NASA POWER Climatology Integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full h-40 bg-sky-50 dark:bg-zinc-900 border border-border rounded-sm flex items-center justify-center">
               <div className="z-10 text-center px-4">
                  <p className="text-xs uppercase tracking-widest font-black text-sky-700 dark:text-sky-300">
                    Annual Est. Rainfall
                  </p>
                  <p className="text-2xl font-black text-sky-800 dark:text-sky-200">
                    {layer_5_environmental_data?.nasa_power_weather?.estimated_annual_rainfall_mm || 0} mm
                  </p>
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Thermometer className="w-3 h-3"/> Avg Temperature</span>
                  <span className="text-xs font-mono">{layer_5_environmental_data?.nasa_power_weather?.annual_average_temperature_c || 0} °C</span>
               </div>
               <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg Daily Rainfall</span>
                  <span className="text-xs font-mono">{layer_5_environmental_data?.nasa_power_weather?.annual_average_precipitation_mm_day || 0} mm/day</span>
               </div>
               <div className="flex justify-between pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Source</span>
                  <span className="text-xs font-mono text-muted-foreground">{layer_5_environmental_data?.nasa_power_weather?.source || "NASA POWER"}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Topography */}
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b border-border mb-4 pb-4 bg-muted/20">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Mountain className="w-5 h-5 text-amber-600" /> Topography
            </CardTitle>
            <CardDescription>Elevation and Terrain Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="relative w-full h-40 bg-orange-50 dark:bg-zinc-900 border border-border rounded-sm flex items-center justify-center">
                 <div className="z-10 text-center px-4">
                  <p className="text-xs uppercase tracking-widest font-black text-amber-700 dark:text-amber-300">
                    Elevation
                  </p>
                  <p className="text-2xl font-black text-amber-800 dark:text-amber-200">
                    {layer_5_environmental_data?.open_meteo_topography?.elevation_meters || 0}m
                  </p>
               </div>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Slope Estimate</span>
                  <span className="text-xs font-mono">{layer_5_environmental_data?.open_meteo_topography?.slope_estimate || "Unknown"}</span>
               </div>
               <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Soil Config</span>
                  <span className="text-xs font-mono">{layer_5_environmental_data?.soil_placeholder || "Default"}</span>
               </div>
                <div className="flex justify-between pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Source</span>
                  <span className="text-xs font-mono text-muted-foreground">{layer_5_environmental_data?.open_meteo_topography?.source || "Open-Meteo"}</span>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Card 5: LLM Placeholder / Cross Validation */}
        <Card className="shadow-sm border-border bg-gradient-to-br from-card to-muted/20 lg:col-span-2">
          <CardHeader className="border-b border-border mb-4 pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" /> AI Verification Profile
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-purple-600">
               {/* TODO: Replace with Vertex Generative AI call from friend's laptop */}
               * [LLM Placeholder Generated] *
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {layer_4_llm_placeholder?.flags && layer_4_llm_placeholder.flags.length > 0 ? (
               layer_4_llm_placeholder.flags.map((flag: string, i: number) => (
                  <div key={i} className={`p-3 border-l-4 text-xs ${flag.includes("CRITICAL") ? "border-red-500 bg-red-50" : "border-amber-500 bg-amber-50"}`}>
                     {flag}
                  </div>
               ))
             ) : (
                <div className="p-3 border-l-4 border-teal-500 bg-teal-50 text-xs text-teal-800 font-medium">
                   Ground vision and satellite data correlate successfully. No significant discrepancies found.
                </div>
             )}

             {layer_3_cross_validation?.verification_blocked && (
               <div className="p-3 border-l-4 border-red-600 bg-red-50 text-xs text-red-800 font-semibold">
                 Automated approval is blocked due to evidence integrity checks. Admin manual verification is required.
               </div>
             )}

             {layer_4_llm_placeholder?.score_reasoning?.positives?.length > 0 && (
               <div className="p-3 border-l-4 border-green-500 bg-green-50 text-xs text-green-800">
                 <p className="font-bold mb-1">Positive Factors</p>
                 {layer_4_llm_placeholder.score_reasoning.positives.map((item: string, i: number) => (
                   <p key={i}>• {item}</p>
                 ))}
               </div>
             )}

             {layer_4_llm_placeholder?.score_reasoning?.concerns?.length > 0 && (
               <div className="p-3 border-l-4 border-amber-500 bg-amber-50 text-xs text-amber-800">
                 <p className="font-bold mb-1">Risk/Concern Factors</p>
                 {layer_4_llm_placeholder.score_reasoning.concerns.map((item: string, i: number) => (
                   <p key={i}>• {item}</p>
                 ))}
               </div>
             )}

             <div className="p-3 border-l-4 border-slate-500 bg-slate-50 text-xs text-slate-700">
               <p className="font-bold mb-1">Document Evidence</p>
               <p>
                 Packet: {document_packet?.status || "unknown"} | Files: {document_packet?.total_document_count || 0} | Completeness: {Math.round((document_packet?.completeness_score || 0) * 100)}%
               </p>
             </div>

             <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground font-mono">
                  Deterministic policy checks can override LLM output to prevent false approvals.
                </p>
             </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Download Action */}
      <div className="flex justify-center pt-8 print:hidden border-t border-border mt-8">
        <Button onClick={handleDownloadPDF} variant="outline" size="lg" className="rounded-none h-12 uppercase tracking-widest font-black text-xs text-teal-700 border-teal-200 hover:bg-teal-50">
          Export Verified Blueprint PDF
        </Button>
      </div>

    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string, value: string | React.ReactNode, icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-black border border-border p-4 flex flex-col items-start gap-2 shadow-sm rounded-md">
      <div className="flex items-center gap-2 text-muted-foreground w-full">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</p>
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
