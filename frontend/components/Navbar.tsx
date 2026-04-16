import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-center text-white">
      <div className="flex items-center space-x-3 mb-4 md:mb-0">
        <div className="w-10 h-10 bg-climateGreen rounded flex items-center justify-center font-bold text-white shadow-lg border border-green-600">
          V
        </div>
        <Link href="/" className="text-xl font-bold tracking-tight">
          VeriCredit <span className="text-tealAccent">AI</span>
        </Link>
      </div>
      
      <div className="flex flex-grow justify-center space-x-6 text-sm font-medium text-slate-300">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link href="/marketplace" className="hover:text-white transition-colors">
          Marketplace
        </Link>
      </div>

      <div className="mt-4 md:mt-0">
        <ConnectButton />
      </div>
    </nav>
  );
}
