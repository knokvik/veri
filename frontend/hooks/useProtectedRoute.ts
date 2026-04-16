"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole, SubscriptionTier } from '../contexts/AuthContext';
import { useAccount } from 'wagmi';

interface ProtectedRouteOptions {
  requiredRole?: UserRole;
  requiredTier?: SubscriptionTier;
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

export function useProtectedRoute(options?: ProtectedRouteOptions) {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const { isConnecting } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || isConnecting) return;

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Role check
    if (options?.requiredRole && user?.role !== options.requiredRole) {
      setAccessDenied('You do not have permission to access this page.');
      setLoading(false);
      return;
    }

    // Subscription tier check
    if (options?.requiredTier && user) {
      const userRank = TIER_RANK[user.subscriptionTier];
      const requiredRank = TIER_RANK[options.requiredTier];
      if (userRank < requiredRank) {
        setAccessDenied(`This feature requires a ${options.requiredTier} subscription or higher.`);
        setLoading(false);
        return;
      }
    }

    setAccessDenied(null);
    setLoading(false);
  }, [isLoggedIn, user, authLoading, isConnecting, router, options?.requiredRole, options?.requiredTier]);

  return { isAuthorized: isLoggedIn && !accessDenied, loading: loading || authLoading, accessDenied };
}
