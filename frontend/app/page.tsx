import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center mt-12 md:mt-24 max-w-5xl mx-auto space-y-10">
      
      <div className="inline-block py-1 px-3 rounded-full border border-climateGreen bg-climateGreen/10 text-climateGreen text-sm font-semibold mb-2 shadow-sm">
        India CCTS 2026 Compatible
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
        Transparent Forestry Carbon Credits. <br/>
        <span className="text-climateGreen">
          Provably Immutable.
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
        VeriCredit AI leverages DeepForest ML Vision, Earth Engine Satellite Analytics, and strict Vertex Generative AI mapping to automate compliance for high-integrity Polygon-native carbon offsets.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
        <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
          Submit a Project
        </Link>
        <Link href="/marketplace" className="btn-secondary text-lg px-8 py-4">
          Explore Market
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full pt-12 border-t border-slate-800">
        <div className="panel hover:-translate-y-1 transition-transform">
          <h3 className="text-xl font-bold text-tealAccent mb-2 flex items-center"><span className="text-2xl mr-2">📸</span> AI Vision</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Robust DeepForest algorithms process high-resolution photography rendering bounding boxes for accurate tree counts and estimated canopy survival models.</p>
        </div>
        <div className="panel hover:-translate-y-1 transition-transform">
          <h3 className="text-xl font-bold text-tealAccent mb-2 flex items-center"><span className="text-2xl mr-2">🛰️</span> Satellite Auth</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Backend endpoints query Google Earth Engine leveraging Sentinel-2 10m resolutions mapping NDVI indices preventing geospatial spoofing.</p>
        </div>
        <div className="panel hover:-translate-y-1 transition-transform">
          <h3 className="text-xl font-bold text-tealAccent mb-2 flex items-center"><span className="text-2xl mr-2">🔗</span> Polygon Scaling</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Secure, low-friction minting via audited ERC-1155 ledgers. Unified marketplace structure strictly adhering to physical retirement proofs requested by the BEE.</p>
        </div>
      </div>
    </div>
  );
}
