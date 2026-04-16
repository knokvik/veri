import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center mt-12 md:mt-20 max-w-5xl mx-auto space-y-10 animate-fadeIn">

      <div className="inline-block py-1.5 px-4 rounded-full border border-climateGreen bg-climateGreen/10 text-climateGreen text-sm font-semibold mb-2 shadow-sm animate-slideUp">
        🇮🇳 India CCTS 2026 Compatible
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
        Transparent Forestry Carbon Credits. <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-climateGreen to-tealAccent">
          Provably Immutable.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
        VeriCredit AI leverages DeepForest ML Vision, Earth Engine Satellite Analytics, and strict Vertex Generative AI mapping to automate compliance for high-integrity Polygon-native carbon offsets.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
        <Link href="/login" className="btn-primary text-xl px-10 py-5 font-extrabold shadow-lg hover:scale-105 transition-transform duration-200">
          🚀 Get Started
        </Link>
        <Link href="/login" className="btn-secondary text-xl px-10 py-5 font-extrabold hover:scale-105 transition-transform duration-200">
          Connect Wallet
        </Link>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full pt-12 border-t border-slate-800">
        <div className="panel hover:-translate-y-1 transition-transform duration-300 border-t-2 border-t-tealAccent group">
          <div className="w-12 h-12 rounded-lg bg-tealAccent/10 flex items-center justify-center mb-4 group-hover:bg-tealAccent/20 transition-colors">
            <span className="text-2xl">📸</span>
          </div>
          <h3 className="text-xl font-bold text-tealAccent mb-2">AI Vision</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Robust DeepForest algorithms process high-resolution photography rendering bounding boxes for accurate tree counts and canopy survival models.</p>
        </div>
        <div className="panel hover:-translate-y-1 transition-transform duration-300 border-t-2 border-t-climateGreen group">
          <div className="w-12 h-12 rounded-lg bg-climateGreen/10 flex items-center justify-center mb-4 group-hover:bg-climateGreen/20 transition-colors">
            <span className="text-2xl">🛰️</span>
          </div>
          <h3 className="text-xl font-bold text-climateGreen mb-2">Satellite Auth</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Backend endpoints query Google Earth Engine leveraging Sentinel-2 resolutions parsing direct NDVI indices and biomass estimates.</p>
        </div>
        <div className="panel hover:-translate-y-1 transition-transform duration-300 border-t-2 border-t-blue-500 group">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-xl font-bold text-blue-400 mb-2">Web3 Ledgers</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Secure, low-friction minting via audited ERC-1155 smart contracts handling immutable generation events directly on Polygon.</p>
        </div>
      </div>

      {/* How it works */}
      <div className="w-full pt-12 border-t border-slate-800 pb-8">
        <h2 className="text-2xl font-bold text-white mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Submit', desc: 'Upload tree photos and GPS coordinates', icon: '📤' },
            { step: '2', title: 'Verify', desc: 'AI Vision + Satellite + LLM analysis', icon: '🔬' },
            { step: '3', title: 'Mint', desc: 'Create CCTS-compliant NFT credits', icon: '⛏' },
            { step: '4', title: 'Trade/Retire', desc: 'Buy, sell, or retire for compliance', icon: '🔥' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-climateGreen/20 to-tealAccent/20 border border-climateGreen/30 flex items-center justify-center mx-auto mb-3 text-2xl">
                {s.icon}
              </div>
              <p className="text-xs text-climateGreen font-bold mb-1">STEP {s.step}</p>
              <p className="font-bold text-white mb-1">{s.title}</p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
