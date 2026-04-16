"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { useState } from 'react';

const config = getDefaultConfig({
  appName: 'VeriCredit AI',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID_PLACEHOLDER',
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
