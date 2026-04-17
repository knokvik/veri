"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { useMemo, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ProjectStoreProvider } from '../lib/projectStore';
import { ThemeProvider } from '../components/theme-provider';

// IMPORTANT: Get a Project ID from https://cloud.reown.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '12f02977989261322d4cebd295c74b90ff731f2e2350af77e44517e3b2780b40';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const config = useMemo(() => {
    return getDefaultConfig({
      appName: 'VeriCredit AI',
      projectId: projectId,
      chains: [polygonAmoy],
      ssr: false,
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RainbowKitProvider theme={darkTheme({
              accentColor: '#2e7d32',
              accentColorForeground: 'white',
            })}>
            <AuthProvider>
              <ProjectStoreProvider>
                {children}
              </ProjectStoreProvider>
            </AuthProvider>
          </RainbowKitProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
