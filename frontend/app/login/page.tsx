"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, ShieldCheck, Wallet, Lock, Mail, ArrowRight } from "lucide-react"

type TabMode = 'login' | 'signup';

export default function Login() {
  const { signIn, signUp, signInAsAdmin, loginWithWallet, error, clearError, loading, isDemoMode } = useAuth();
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const [tab, setTab] = useState<TabMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [signupTier, setSignupTier] = useState<'basic' | 'premium'>('basic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) return;

    if (tab === 'signup') {
      await signUp(email, password, 'user', signupTier);
    } else if (isAdminMode) {
      await signInAsAdmin(email, password);
    } else {
      await signIn(email, password);
    }
  };

  const handleWalletLogin = () => {
    if (isConnected) {
      loginWithWallet();
    } else if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 space-y-8 animate-fadeIn pb-20 px-4">
      <Card className="border-border shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {isDemoMode && (
             <div className="flex justify-center mb-4">
               <Badge variant="outline" className="text-amber-500 border-amber-500 font-bold px-3 py-1 gap-1.5 uppercase text-[10px] tracking-widest">
                 <AlertCircle className="w-3 h-3" /> Demo Mode Active
               </Badge>
             </div>
          )}
          <CardTitle className="text-3xl font-black tracking-tighter">
            {tab === 'login' ? 'Welcome Back' : 'Join VeriCredit'}
          </CardTitle>
          <CardDescription>
            {tab === 'login' ? 'Access your high-integrity carbon assets' : 'Start your transparency-first forestry journey'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as TabMode); clearError(); setIsAdminMode(false); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted border border-border">
              <TabsTrigger value="login" className="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-10 h-11 border-border focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                {tab === 'login' && (
                  <Link href="/forgot-password" title="Forgot Password" className="text-[10px] font-bold text-primary hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="pl-10 h-11 border-border focus:border-primary/50"
                />
              </div>
            </div>

            {tab === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="tier" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Tier</Label>
                <Select value={signupTier} onValueChange={(v) => setSignupTier(v as 'basic' | 'premium')}>
                  <SelectTrigger className="h-11 border-border bg-background">
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic" className="font-medium">Basic — Submit & Verify</SelectItem>
                    <SelectItem value="premium" className="font-medium">Premium — Trading & MRV</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground ml-1 font-medium">Free access includes read-only portfolio viewing.</p>
              </div>
            )}

            {tab === 'login' && (
              <div className="flex items-center space-x-2 pt-1 ml-1">
                <Checkbox
                  id="admin"
                  checked={isAdminMode}
                  onCheckedChange={(v) => setIsAdminMode(v as boolean)}
                  className="rounded border-border"
                />
                <label htmlFor="admin" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                  Login as Administrator
                </label>
              </div>
            )}

            {error && (
              <div className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium animate-shake ${error.includes('sent') || error.includes('created') ? 'bg-green-500 text-white border-green-600' : 'bg-destructive text-white border-destructive'}`}>
                {error.includes('sent') || error.includes('created') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-black tracking-tight mt-6 shadow-lg hover:scale-[1.01] transition-all"
            >
              {loading ? 'Processing...' : tab === 'signup' ? 'Create Account' : isAdminMode ? 'Admin Access' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-[10px] font-black uppercase tracking-widest">or continue with</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <Button
            onClick={handleWalletLogin}
            variant="outline"
            className="w-full h-12 font-bold gap-3 border-border hover:border-primary hover:bg-muted transition-all"
          >
            <Wallet className="w-5 h-5 text-primary" />
            {isConnected ? 'Connected Web3 Identity' : 'Connect Crypto Wallet'}
          </Button>
        </CardContent>

        <CardFooter className="bg-muted border-t border-border justify-center p-6 text-center">
          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              { label: 'Free', color: 'bg-muted-foreground text-background border-border' },
              { label: 'Basic', color: 'bg-blue-600 text-white border-blue-400' },
              { label: 'Premium', color: 'bg-amber-500 text-black border-amber-400' },
            ].map((t) => (
              <div key={t.label} className={`rounded-md border p-1.5 ${t.color}`}>
                <p className="text-[9px] font-black uppercase tracking-tight">{t.label}</p>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>

      <div className="text-center">
        <p className="text-[10px] text-muted-foreground font-medium max-w-[280px] mx-auto">
          By continuing, you agree to VeriCredit's Terms of Service and Privacy Policy regarding CCTS data sovereignity.
        </p>
      </div>
    </div>
  );
}
