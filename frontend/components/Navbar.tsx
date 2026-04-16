"use client";

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useWalletInfo } from '../hooks/useWalletInfo';
import { useState } from 'react';

const TIER_COLORS: Record<string, string> = {
  free: 'bg-slate-700 text-slate-300 border-slate-600',
  basic: 'bg-blue-900/40 text-blue-300 border-blue-600',
  premium: 'bg-amber-900/40 text-amber-300 border-amber-600',
};

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, subscriptionTier, logout } = useAuth();
  const { formattedAddress, formattedBalance, isConnected } = useWalletInfo();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleManualConnect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        window.location.reload(); 
      } catch (err) {
        console.error("Manual connect failed", err);
        alert("Please unlock MetaMask and try again.");
      }
    } else {
      alert("MetaMask extension not detected. Please install it from metamask.io");
    }
  };

  const isCurrent = (path: string) => pathname === path;

  const navLinks = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/submit-project', label: 'Submit Data' },
    { href: '/my-projects', label: 'My Projects' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={`text-sm font-medium transition-colors ${isCurrent(href) ? 'text-climateGreen' : 'text-slate-300 hover:text-white'}`}
    >
      {label}
    </Link>
  );

  // User avatar (initials)
  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : '??';

  return (
    <nav className="border-b border-climateGreen/30 bg-black/50 backdrop-blur-md sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-climateGreen to-tealAccent">
              VeriCredit<span className="text-white">AI</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-5 items-center">
            {isLoggedIn && (
              <>
                {navLinks.map(link => (
                  <NavLink key={link.href} {...link} />
                ))}
                {isAdmin && (
                  <NavLink href="/admin" label="Admin" />
                )}
              </>
            )}

            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />

            {isLoggedIn && !isConnected && (
              <button 
                onClick={handleManualConnect}
                className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors underline underline-offset-4"
              >
                Fallback Connect
              </button>
            )}

            {isLoggedIn && isConnected && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                {formattedBalance}
              </span>
            )}

            {isLoggedIn && (
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-climateGreen to-tealAccent flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                {/* Subscription Badge */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TIER_COLORS[subscriptionTier]}`}>
                  {subscriptionTier.toUpperCase()}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-900/40 text-red-300 border-red-600">
                    ADMIN
                  </span>
                )}
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors border border-slate-700 px-2 py-1 rounded-sm ml-1"
                >
                  Logout
                </button>
              </div>
            )}

            {!isLoggedIn && pathname !== '/login' && (
              <Link href="/login" className="btn-secondary text-sm">
                Login / Connect
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800 pt-4 space-y-3 animate-fadeIn">
            {isLoggedIn && (
              <>
                {navLinks.map(link => (
                  <div key={link.href}>
                    <NavLink {...link} />
                  </div>
                ))}
                {isAdmin && (
                  <div><NavLink href="/admin" label="Admin Panel" /></div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-climateGreen to-tealAccent flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TIER_COLORS[subscriptionTier]}`}>
                    {subscriptionTier.toUpperCase()}
                  </span>
                  <button onClick={logout} className="text-xs text-red-400 ml-auto">
                    Logout
                  </button>
                </div>
              </>
            )}
            {!isLoggedIn && (
              <Link href="/login" className="btn-primary block text-center text-sm" onClick={() => setMobileOpen(false)}>
                Login / Connect
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
