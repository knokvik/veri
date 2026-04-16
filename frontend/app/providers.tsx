"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { useState } from 'react';

// IMPORTANT: Get a Project ID from https://cloud.reown.com/
// Using a placeholder that looks valid but requires user input for production
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '12f02977989261322d4cebd295c74b90ff731f2e2350af77e44517e3b2780b40'; 

const config = getDefaultConfig({
  appName: 'VeriCredit AI',
  projectId: projectId,
  chains: [polygonAmoy],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
            accentColor: '#2e7d32',
            accentColorForeground: 'white',
          })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
