"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useProjectStore, Project } from '../../lib/projectStore';
import VerificationReport from '../../components/VerificationReport';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function SubmitProject() {
  const { isAuthorized, loading: authLoading, accessDenied } = useProtectedRoute({ requiredTier: 'basic' });
  const { isConnected, address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const { addProject, updateProject, addOwnedToken } = useProjectStore();
  const router = useRouter();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'report'>('form');

  const [projectName, setProjectName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [schemeType, setSchemeType] = useState<'compliance' | 'offset'>('compliance');
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (authLoading) return <div className="text-center mt-20 text-slate-400 animate-pulse">Verifying secure access...</div>;
  if (accessDenied) return <div className="text-center mt-20 text-amber-400 panel max-w-md mx-auto">{accessDenied}</div>;
  if (!isAuthorized) return null;

  const pushLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const loadSampleData = () => {
    setProjectName('Western Ghats Reforestation Alpha');
    setLat('15.345');
    setLng('73.891');
    setSchemeType('compliance');
    pushLog('Sample data injected: Ready for test pipeline.');
  };

  const handleSimulateVerification = async () => {
    if (!lat || !lng || !projectName) {
      alert('Please enter project name and coordinates.');
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
      pushLog('Initiating verification pipeline...');

      // Step 1: Mock Upload/IPFS
      pushLog('1. Processing images...');
      await new Promise(r => setTimeout(r, 1000));
      const simulatedHash = `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`;
      newProject.ipfsHash = simulatedHash;

      // Step 2: Call Real Backend for Vision
      pushLog('2. Requesting DeepForest Vision Analysis from Backend...');
      const visionRes = await fetch('http://localhost:8000/api/verify/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, lat, lng })
      });
      const visionData = await visionRes.json();
      newProject.visionResult = visionData.vision_results;
      pushLog(`   → Backend Success: ${visionData.vision_results.tree_count} trees detected.`);

      // Step 3: Call Real Backend for Satellite
      pushLog('3. Requesting Earth Engine Satellite Data from Backend...');
      const satRes = await fetch('http://localhost:8000/api/verify/satellite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, lat, lng })
      });
      const satData = await satRes.json();
      newProject.satelliteResult = satData.satellite_results;
      pushLog('   → Backend Success: Satellite data received.');

      // Step 4: Call Real Backend for AI Decision (Vertex Placeholder)
      pushLog('4. Requesting AI Verification Decision...');
      const llmRes = await fetch('http://localhost:8000/api/verify/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, lat, lng })
      });
      const llmData = await llmRes.json();
      newProject.llmResult = llmData.llm_results;
      pushLog('   → AI Audit Complete.');

      // Update project in store
      newProject.status = 'verified';
      updateProject(projectId, newProject);
      setCurrentProject({ ...newProject });

      pushLog('✅ Full verification pipeline complete via Backend APIs.');
      setStep('report');

    } catch (e) {
      pushLog('Error in workflow: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleMintCredit = () => {
    if (!address || !currentProject?.llmResult) return;

    const mintAmount = 100;
    const nextTokenId = 100 + Date.now() % 1000;

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: vericreditAbi,
      functionName: 'mintCredit',
      args: [
        address,
        mintAmount,
        currentProject.schemeType === 'compliance' ? 'Compliance' : 'Offset',
        currentProject.llmResult.additionality_score,
        true,
        `ipfs://${currentProject.ipfsHash}`,
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 mt-2">Submit New Project</h2>
        <p className="text-slate-400 mt-2">Upload your tree planting data for multi-layered AI and Earth Engine verification.</p>
        {!isConnected && (
          <p className="text-amber-500 font-semibold mt-4 text-sm border border-amber-500/50 bg-amber-900/20 p-2 rounded inline-block">
            ⚠ Please connect your wallet (Amoy Testnet) to mint approved credits.
          </p>
        )}
      </div>

      {step === 'form' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="panel flex flex-col space-y-5">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h3 className="text-xl font-bold text-climateGreen">1. Project Data</h3>
              <button onClick={loadSampleData} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors border border-slate-500">
                🧪 Test with Sample Data
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Project Name</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="input-field" placeholder="e.g. Western Ghats Afforestation" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Latitude</label>
                <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="input-field py-2" placeholder="15.345" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Longitude</label>
                <input type="text" value={lng} onChange={e => setLng(e.target.value)} className="input-field py-2" placeholder="73.891" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Tree Photos (Multiple Support)</label>
              <input
                type="file"
                multiple
                ref={fileRef}
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-700 file:text-white file:cursor-pointer hover:file:bg-slate-600 outline-none"
              />
              {files.length > 0 && (
                <p className="text-xs text-tealAccent mt-1">{files.length} file(s) selected</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">CCTS Target Scheme</label>
              <select value={schemeType} onChange={e => setSchemeType(e.target.value as 'compliance' | 'offset')} className="input-field appearance-none">
                <option value="compliance">Compliance Mode</option>
                <option value="offset">Offset Mode</option>
              </select>
            </div>

            <button
              onClick={handleSimulateVerification}
              disabled={loading}
              className="w-full btn-primary mt-2 disabled:opacity-50"
            >
              {loading ? 'Processing via Backend APIs...' : 'Submit to verification pipeline'}
            </button>
          </div>

          {/* Logs Panel */}
          <div className="panel space-y-5">
            <h3 className="text-xl font-bold text-tealAccent border-b border-slate-700 pb-2">2. Pipeline Logs</h3>

            {logs.length > 0 ? (
              <div className="bg-black/50 p-4 rounded-lg text-xs font-mono text-climateGreen h-80 overflow-y-auto space-y-1 border border-slate-800">
                {logs.map((L, i) => (
                  <div key={i} className={`${L.startsWith('✅') ? 'text-green-400 font-bold' : L.startsWith('Error') ? 'text-red-400' : ''}`}>
                    {L}
                  </div>
                ))}
                {loading && <div className="animate-pulse text-slate-400">Processing...</div>}
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 text-slate-500 text-sm">
                <div className="text-center">
                  <p className="text-4xl mb-3">🔬</p>
                  <p>Submit a project to see pipeline logs here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report View */}
      {step === 'report' && currentProject && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button onClick={() => setStep('form')} className="btn-secondary text-sm px-4 py-2">
              ← Back to Form
            </button>
            {currentProject.llmResult && (
              <button
                onClick={handleMintCredit}
                disabled={!isConnected || isPending}
                className={`font-bold px-8 py-3 rounded-lg text-lg transition-all shadow-md ${!isConnected ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 text-white'}`}
              >
                {isPending ? 'Confirming tx...' : !isConnected ? 'Connect Wallet to Mint' : '⛏ Mint Credit on Polygon Amoy'}
              </button>
            )}
          </div>

          <VerificationReport
            projectName={currentProject.name}
            lat={currentProject.lat}
            lng={currentProject.lng}
            schemeType={currentProject.schemeType}
            ipfsHash={currentProject.ipfsHash}
            visionResult={currentProject.visionResult}
            satelliteResult={currentProject.satelliteResult}
            llmResult={currentProject.llmResult}
            createdAt={currentProject.createdAt}
          />

          {/* Mint result logs */}
          {logs.filter(l => l.includes('Mint') || l.includes('Transaction') || l.includes('Demo')).length > 0 && (
            <div className="panel bg-black/50 text-xs font-mono text-tealAccent space-y-1">
              {logs.filter(l => l.includes('Mint') || l.includes('Transaction') || l.includes('Demo')).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
