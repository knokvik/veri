"use client"
import { useState } from 'react';
import CCTSBadge from '../../components/CCTSBadge';
import { useAccount, useWriteContract } from 'wagmi';
import { vericreditAbi } from '../../utils/abis';

export default function Marketplace() {
  const { isConnected, address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  
  const [certReadyFor, setCertReadyFor] = useState<number | null>(null);

  // Hardcoded for demonstration representing data pulled from the Blockchain events log
  const dummyCredits = [
    { 
      id: 1, 
      name: "Western Ghats Afforestation Base", 
      type: "Compliance", 
      price: 12.5, 
      score: 92, 
      mintedAt: "2026-04-10",
      tokenId: 101, // Mock token id pointing to the contract
      owner: "0xMockOwnerAddress...",
      retired: false
    },
    { 
      id: 2, 
      name: "Himalayan Foothills Restoration", 
      type: "Offset", 
      price: 8.2, 
      score: 85, 
      mintedAt: "2026-03-22",
      tokenId: 102,
      owner: "0xMockOwnerAddress...",
      retired: false 
    },
    { 
       id: 3, 
       name: "Sundarbans Mangrove Defense", 
       type: "Compliance", 
       price: 15.0, 
       score: 98, 
       mintedAt: "2026-04-12",
       tokenId: 103,
       owner: "0xMockOwnerAddress...",
       retired: true // Example of an already retired credit
    },
  ];

  const handleRetire = (tokenId: number, creditId: number) => {
    const VERICREDIT_CONTRACT_ADDRESS = "0xYourDeployedContractAddressHere";

    // Assuming we somehow own it or bought it prior.
    writeContract({
      address: VERICREDIT_CONTRACT_ADDRESS as `0x${string}`,
      abi: vericreditAbi,
      functionName: 'retireCredit',
      args: [
        tokenId, // tokenId
        10, // amount to retire
        `ipfs://MockCID-${tokenId}-compliance-cert` // Compliance certificate URI
      ],
    }, {
      onSuccess: () => {
        // UI simulation of the pdf generation
        setTimeout(() => setCertReadyFor(creditId), 2000);
      },
      onError: (err) => alert("Retirement failed: Check token balance. " + err.message)
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-slate-100">Carbon Marketplace</h2>
           <p className="text-slate-400 mt-1">Acquire and retire CCTS-compliant ERC-1155 tokens straight from VeriCredit.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
           <input type="text" placeholder="Search by region or ID..." className="input-field max-w-xs" />
           <button className="btn-secondary whitespace-nowrap">Filter</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyCredits.map(credit => (
          <div key={credit.id} className="panel flex flex-col justify-between hover:border-slate-500 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-5">
                <CCTSBadge schemeType={credit.type as any} />
                <span className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded font-mono">TKN: #{credit.tokenId}</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 mb-3">{credit.name}</h3>
              
              <div className="space-y-2 mb-4 text-sm text-slate-300 bg-slate-900 rounded p-3 border border-slate-800">
                <p className="flex justify-between"><span>Additionality Score:</span> <span className="font-mono text-blue-400">{credit.score}/100</span></p>
                <p className="flex justify-between"><span>Minted:</span> <span className="font-mono text-slate-400">{credit.mintedAt}</span></p>
                <p className="flex justify-between"><span>Status:</span> 
                  {credit.retired ? (
                     <span className="text-slate-500 font-bold border border-slate-700 px-1 rounded text-xs">RETIRED (BURNED)</span>
                  ) : (
                     <span className="text-climateGreen font-bold border border-climateGreen px-1 rounded text-xs bg-green-900/10">ACTIVE FOR SALE</span>
                  )}
                </p>
              </div>
              
              {certReadyFor === credit.id && (
                  <div className="bg-green-900/30 border border-green-500 text-green-400 p-3 rounded mb-4 text-sm flex justify-between items-center">
                    <span>✅ Retirement Confirmed</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Downloading dummy CCTS PDF Certificate..."); }} className="underline decoration-green-400 font-bold ml-2">Download Cert</a>
                  </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-700 flex justify-between items-center mt-4">
              <span className="text-2xl font-bold text-white">{credit.price} <span className="text-sm font-medium text-slate-400">MATIC</span></span>
              
              <button 
                onClick={() => handleRetire(credit.tokenId, credit.id)}
                disabled={!isConnected || credit.retired || isPending} 
                className={`font-bold px-4 py-2 rounded shrink-0 transition-colors ${isConnected && !credit.retired ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
              >
                {!isConnected ? "Connect Wallet" : credit.retired ? "Already Burned" : isPending ? "Wait..." : "Buy & Retire"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
