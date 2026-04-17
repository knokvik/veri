"use client";

import { useState, useRef } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore, Project } from '../../lib/projectStore';
import ValidationDashboard from '../../components/ValidationDashboard';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  TreePine,
  MapPin,
  Terminal,
  ChevronLeft,
  Hammer,
  FlaskConical,
  CloudUpload,
  AlertCircle,
  Activity,
  ArrowRight,
  Compass
} from "lucide-react"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function SubmitProject() {
  const { isAuthorized, loading: authLoading, accessDenied } = useProtectedRoute({ requiredTier: 'basic' });
  const { isConnected, address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const { addProject, updateProject, addOwnedToken } = useProjectStore();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'report'>('form');

  const [projectName, setProjectName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [claimedTrees, setClaimedTrees] = useState('500');
  const [landAreaHectares, setLandAreaHectares] = useState('5.2');
  const [plantingDate, setPlantingDate] = useState('2026-01-15');
  const [speciesCsv, setSpeciesCsv] = useState('Teak, Bamboo');
  const [schemeType, setSchemeType] = useState<'compliance' | 'offset'>('compliance');
  const [files, setFiles] = useState<File[]>([]);
  const [landLeaseDocs, setLandLeaseDocs] = useState<File[]>([]);
  const [plantingReportDocs, setPlantingReportDocs] = useState<File[]>([]);
  const [permitDocs, setPermitDocs] = useState<File[]>([]);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse font-medium">Verifying project permissions...</div>;
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

  const pushLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const loadSampleData = () => {
    setProjectName('Western Ghats Reforestation Alpha');
    setLat('15.345');
    setLng('73.891');
    setClaimedTrees('500');
    setLandAreaHectares('5.2');
    setPlantingDate('2026-01-15');
    setSpeciesCsv('Teak, Bamboo, Neem');
    setSchemeType('compliance');
    
    // Inject mock photos for testing
    const mockFile1 = new File(["mock_image_data_1"], "sample_tree_canopy.jpg", { type: "image/jpeg" });
    const mockFile2 = new File(["mock_image_data_2"], "sample_sapling.jpg", { type: "image/jpeg" });
    setFiles([mockFile1, mockFile2]);
    setLandLeaseDocs([]);
    setPlantingReportDocs([]);
    setPermitDocs([]);
    setSupportingDocs([]);

    pushLog('Sample data injected: Ready for test pipeline.');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    pushLog("Requesting device GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        pushLog(`📍 Position Locked: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      (error) => {
        pushLog(`🚨 GPS Error: ${error.message}`);
        alert(`Unable to retrieve location: ${error.message}`);
      }
    );
  };

  const handleSimulateVerification = async () => {
    if (!lat || !lng || !projectName || !claimedTrees || !landAreaHectares || !plantingDate) {
      alert('Please complete all required claim fields before starting verification.');
      return;
    }
    if (files.length === 0) {
      alert('Please upload at least one real ground photo.');
      return;
    }
    if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
      alert('Latitude and longitude must be valid numbers.');
      return;
    }
    setLoading(true);
    setLogs([]);

    const projectId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      name: projectName,
      lat,
      lng,
      schemeType,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      owner: address,
    };
    addProject(newProject);
    setCurrentProject(newProject);

    try {
      pushLog('Initiating unified 4-layer AI verification pipeline...');
      pushLog(`Preparing ${files.length} uploaded photo(s) for multi-angle vision analysis...`);

      const formData = new FormData();
      const parsedSpecies = speciesCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append('claims', JSON.stringify({
        project_name: projectName,
        tree_count: Number(claimedTrees),
        species: parsedSpecies.length > 0 ? parsedSpecies : ["Unknown"],
        planting_date: plantingDate,
        land_area_hectares: Number(landAreaHectares),
        estimated_carbon_tons: 25.0,
        scheme_type: schemeType
      }));
      formData.append('location', JSON.stringify({ lat: parseFloat(lat), lng: parseFloat(lng) }));
      formData.append('planting_date', plantingDate);

      pushLog(`Attaching ${files.length} ground photos for Layer 1 Vision...`);
      files.forEach((file) => formData.append('ground_photos', file));
      landLeaseDocs.forEach((file) => formData.append('land_lease_docs', file));
      plantingReportDocs.forEach((file) => formData.append('planting_report_docs', file));
      permitDocs.forEach((file) => formData.append('government_permit_docs', file));
      supportingDocs.forEach((file) => formData.append('supporting_docs', file));
      pushLog(`Attached ${landLeaseDocs.length + plantingReportDocs.length + permitDocs.length + supportingDocs.length} legal/supporting document(s).`);

      pushLog('Dispatching payload to /validate (DeepForest + GEE + Gemini)...');
      const res = await fetch('http://localhost:8000/api/validate/', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.detail || `Backend validation failed (${res.status})`);
      }

      const valData = await res.json();
      
      // Detailed logging for each of the 4 layers
      pushLog(`Layer 1 (Vision): Detected ${valData.layer_1_vision?.tree_count || 0} trees via ${valData.layer_1_vision?.model_used || 'unknown'}; valid photos ${valData.layer_1_vision?.valid_photo_count ?? 'n/a'}.`);
      pushLog(`Layer 2 (Satellite): NDVI Change +${valData.layer_2_satellite?.change_from_baseline}% (${valData.layer_2_satellite?.is_live_observation ? 'live' : 'fallback'}).`);
      pushLog(`Layer 3 (Cross-Validation): Flags: ${valData.layer_3_cross_validation?.flags?.length || 0}`);
      pushLog(`Layer 4 (LLM Placeholder): Conf Score: ${valData.layer_4_llm_placeholder?.overall_confidence}%`);
      pushLog(`Documents: ${valData.document_packet?.total_document_count || 0} uploaded (${valData.document_packet?.status || 'unknown'} packet).`);
      
      if (valData.status === 'REVIEW_REQUIRED') {
        pushLog(`🚨 REVIEW REQUIRED: Discrepancies found in cross-validation.`);
      }
      
      newProject.validationData = valData;
      newProject.status = valData.status === 'APPROVED' ? 'verified' : 'pending';
      updateProject(projectId, newProject);
      setCurrentProject({ ...newProject });

      // For blockchain metadata IPFS emulation
      newProject.ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; 

      pushLog('✅ Integrity Pipeline Complete. Generating verification dashboard...');
      setStep('report');

    } catch (e) {
      pushLog('Error in workflow: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleMintCredit = () => {
    if (!address || !currentProject?.validationData) return;

    const metadata = currentProject.validationData.layer_4_llm_placeholder;
    const mintAmount = metadata?.net_issuable_carbon_tons ? Math.floor(metadata.net_issuable_carbon_tons) : 100;
    const nextTokenId = 100 + Date.now() % 1000;
    const additionality = metadata?.additionality_score ? Math.floor(metadata.additionality_score) : 94;

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: vericreditAbi,
      functionName: 'mintCredit',
      args: [
        address,
        mintAmount,
        currentProject.schemeType === 'compliance' ? 'Compliance' : 'Offset',
        additionality,
        true,
        `ipfs://${currentProject.ipfsHash || 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'}`,
      ],
    }, {
      onSuccess: () => {
        pushLog(`✅ Transaction submitted! Minted ${mintAmount} credits as TKN #${nextTokenId}`);
        if (currentProject) {
          updateProject(currentProject.id, { status: 'minted', tokenId: nextTokenId, mintedAt: new Date().toISOString().split('T')[0] });
          addOwnedToken({
            tokenId: nextTokenId,
            projectName: currentProject.name,
            schemeType: currentProject.schemeType,
            amount: mintAmount,
            mintedAt: new Date().toISOString().split('T')[0],
            retired: false,
          });
          setCurrentProject({ ...currentProject, status: 'minted', tokenId: nextTokenId });
        }
      },
      onError: (err) => {
        pushLog('Transaction failed: ' + err.message);
        // Still update locally for demo purposes
        if (currentProject) {
          updateProject(currentProject.id, { status: 'minted', tokenId: nextTokenId, mintedAt: new Date().toISOString().split('T')[0] });
          addOwnedToken({
            tokenId: nextTokenId,
            projectName: currentProject.name,
            schemeType: currentProject.schemeType,
            amount: mintAmount,
            mintedAt: new Date().toISOString().split('T')[0],
            retired: false,
          });
          setCurrentProject({ ...currentProject, status: 'minted', tokenId: nextTokenId });
          pushLog(`(Demo) Minted ${mintAmount} credits locally as TKN #${nextTokenId}`);
        }
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Project Submission</h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Connect your forest assets to the global carbon market via AI-powered MRV.</p>
        </div>
        {!isConnected && (
          <Alert variant="destructive" className="max-w-md py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-black uppercase tracking-widest">Wallet Required</AlertTitle>
            <AlertDescription className="text-xs font-medium">
              Connect to mint credits on Polygon Amoy.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {step === 'form' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border mb-6">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-primary" /> Submission Metadata
                </CardTitle>
                <CardDescription>Enter geographic and administrative details.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadSampleData} className="h-8 gap-2 font-bold text-[10px] uppercase tracking-wider">
                <FlaskConical className="w-3.5 h-3.5" /> Sample Data
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Western Ghats Afforestation Alpha"
                  className="h-11 border-border focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimedTrees" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Claimed Trees</Label>
                  <Input
                    id="claimedTrees"
                    type="number"
                    min={1}
                    value={claimedTrees}
                    onChange={e => setClaimedTrees(e.target.value)}
                    placeholder="e.g. 500"
                    className="h-11 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landAreaHectares" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Land Area (hectares)</Label>
                  <Input
                    id="landAreaHectares"
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={landAreaHectares}
                    onChange={e => setLandAreaHectares(e.target.value)}
                    placeholder="e.g. 5.2"
                    className="h-11 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plantingDate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Planting Date</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={plantingDate}
                    onChange={e => setPlantingDate(e.target.value)}
                    className="h-11 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speciesCsv" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Species (comma separated)</Label>
                  <Input
                    id="speciesCsv"
                    value={speciesCsv}
                    onChange={e => setSpeciesCsv(e.target.value)}
                    placeholder="e.g. Teak, Bamboo, Neem"
                    className="h-11 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Latitude</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="lat"
                      value={lat}
                      onChange={e => setLat(e.target.value)}
                      placeholder="Latitude"
                      className="pl-10 h-11 border-border focus:border-primary/50 rounded-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Longitude</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="lng"
                      value={lng}
                      onChange={e => setLng(e.target.value)}
                      placeholder="Longitude"
                      className="pl-10 h-11 border-border focus:border-primary/50 rounded-none"
                    />
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                type="button" 
                onClick={handleGetLocation}
                className="w-full h-11 border-dashed border-primary/30 hover:border-primary/50 text-primary font-black uppercase tracking-widest text-[10px] gap-2 rounded-none"
              >
                <Compass className="w-3.5 h-3.5" /> Locate via Device GPS
              </Button>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Environmental Photos</Label>
                <div className="relative group">
                  <Input
                    type="file"
                    multiple
                    ref={fileRef}
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="h-24 py-8 border-dashed bg-muted hover:bg-muted/80 transition-all cursor-pointer text-center"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                    <CloudUpload className="w-8 h-8 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {files.length > 0 ? `${files.length} Files Selected` : 'Drag & Drop or Click to Upload'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Land/Farm Papers (Lease/Ownership)</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setLandLeaseDocs(Array.from(e.target.files || []))}
                  className="h-11 border-dashed bg-muted/40"
                />
                <p className="text-[10px] text-muted-foreground ml-1">{landLeaseDocs.length} file(s) attached</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Planting Report Documents</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setPlantingReportDocs(Array.from(e.target.files || []))}
                  className="h-11 border-dashed bg-muted/40"
                />
                <p className="text-[10px] text-muted-foreground ml-1">{plantingReportDocs.length} file(s) attached</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Government Permits</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setPermitDocs(Array.from(e.target.files || []))}
                  className="h-11 border-dashed bg-muted/40"
                />
                <p className="text-[10px] text-muted-foreground ml-1">{permitDocs.length} file(s) attached</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Other Supporting Documents</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setSupportingDocs(Array.from(e.target.files || []))}
                  className="h-11 border-dashed bg-muted/40"
                />
                <p className="text-[10px] text-muted-foreground ml-1">{supportingDocs.length} file(s) attached</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheme" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Scheme</Label>
                <Select value={schemeType} onValueChange={(v) => setSchemeType(v as 'compliance' | 'offset')}>
                  <SelectTrigger id="scheme" className="h-11 border-border bg-background">
                    <SelectValue placeholder="Select target compliance scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance" className="font-medium">CCTS Compliance Market</SelectItem>
                    <SelectItem value="offset" className="font-medium">Voluntary Offset Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                onClick={handleSimulateVerification}
                disabled={loading}
                className="w-full h-12 text-base font-black tracking-tight shadow-lg hover:scale-[1.01] transition-all"
              >
                {loading ? (
                  <>
                    <Activity className="mr-2 w-4 h-4 animate-spin" /> Verifying via Backend Pipeline...
                  </>
                ) : (
                  <>
                    <Hammer className="mr-2 w-4 h-4" /> Start AI Audit Pipeline
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-sm border-border flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border mb-0">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" /> Pipeline Logs
              </CardTitle>
              <CardDescription>Real-time telemetry from AI and satellite systems.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0">
              {logs.length > 0 ? (
                <div className="bg-muted dark:bg-black h-[450px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed selection:bg-primary">
                  {logs.map((L, i) => (
                    <div key={i} className={`flex gap-3 mb-1.5 ${L.startsWith('✅') ? 'text-green-400 font-black' : L.startsWith('Error') ? 'text-destructive font-bold' : 'text-primary'}`}>
                      <span className="opacity-30 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                      <span>{L}</span>
                    </div>
                  ))}
                  {loading && (
                    <span className="font-bold tracking-widest uppercase text-[10px] animate-pulse">Processing data artifacts...</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 py-20 px-12 text-center">
                  <Activity className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-sm font-black uppercase tracking-widest">Waiting for Initiation</p>
                  <p className="text-xs font-medium max-w-[200px] mt-2 leading-relaxed">
                    Submit metadata to trigger the automated verification sequence.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'report' && currentProject && (
        <div className="space-y-6 animate-fadeIn pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border border-border p-6 rounded-none shadow-sm">
            <Button variant="ghost" onClick={() => setStep('form')} className="h-10 text-muted-foreground hover:text-primary transition-colors gap-2 px-0">
              <ChevronLeft className="w-5 h-5" /> Back to Parameters
            </Button>

            {currentProject.validationData && (
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audit Ready</span>
                  <span className="text-xs font-bold text-green-500">Integrity Score Locked</span>
                </div>
                <Button
                  onClick={() => {
                     updateProject(currentProject.id, { status: 'pending_admin' });
                     pushLog('✅ Project submitted for Admin Review. An admin will verify the payload.');
                     setStep('form'); // or just show success
                     alert('Submitted to Admin! You can check the Admin dashboard.');
                  }}
                  className={`flex-grow md:flex-initial h-12 px-8 font-black tracking-tight text-base transition-all shadow-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg text-white`}
                >
                  Submit for Admin Review <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <ValidationDashboard data={currentProject.validationData} />

          {logs.filter(l => l.includes('Mint') || l.includes('Transaction') || l.includes('Demo')).length > 0 && (
            <Card className="bg-muted/30 border-border">
              <CardHeader className="py-4 border-b border-border">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" /> Minting Execution Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-[11px] text-green-400 space-y-1">
                {logs.filter(l => l.includes('Mint') || l.includes('Transaction') || l.includes('Demo')).map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="opacity-30">❯</span>
                    <span>{l}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
