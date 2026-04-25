"use client";

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useWalletInfo } from '../hooks/useWalletInfo';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ModeToggle } from './mode-toggle';

const TIER_COLORS: Record<string, string> = {
  free: 'bg-slate-700 text-slate-300 border-slate-600',
  basic: 'bg-blue-600 text-white border-blue-400',
  premium: 'bg-amber-500 text-black border-amber-400',
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
      className={`text-sm font-medium transition-colors ${isCurrent(href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {label}
    </Link>
  );

  // User avatar (initials)
  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : '??';

  return (
    <nav className="border-b border-border bg-background backdrop-blur-md sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-tealAccent hover:opacity-80 transition-opacity">
              VeriCredit
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

            <ModeToggle />

            {isLoggedIn && !isConnected && (
              <Button
                variant="link"
                size="sm"
                onClick={handleManualConnect}
                className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground h-auto p-0 underline underline-offset-4"
              >
                Fallback Connect
              </Button>
            )}

            {isLoggedIn && isConnected && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-none border border-border">
                {formattedBalance}
              </span>
            )}

            {isLoggedIn && (
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-none bg-gradient-to-br from-primary to-tealAccent flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                {/* Subscription Badge */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-none border ${TIER_COLORS[subscriptionTier]}`}>
                  {subscriptionTier.toUpperCase()}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-none border bg-destructive text-destructive-foreground border-destructive">
                    ADMIN
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="h-7 text-[10px] px-2"
                >
                  Logout
                </Button>
              </div>
            )}

            {!isLoggedIn && pathname !== '/login' && (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login / Connect</Link>
              </Button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <ModeToggle />
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border pt-4 space-y-4 animate-fadeIn">
            {isLoggedIn && (
              <>
                <div className="flex flex-col gap-3">
                  {navLinks.map(link => (
                    <NavLink key={link.href} {...link} />
                  ))}
                  {isAdmin && (
                    <NavLink href="/admin" label="Admin Panel" />
                  )}
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <div className="w-8 h-8 rounded-none bg-gradient-to-br from-primary to-tealAccent flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-none border ${TIER_COLORS[subscriptionTier]}`}>
                    {subscriptionTier.toUpperCase()}
                  </span>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-destructive ml-auto h-7 px-2">
                    Logout
                  </Button>
                </div>
              </>
            )}
            {!isLoggedIn && (
              <Button asChild className="w-full">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Login / Connect</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
