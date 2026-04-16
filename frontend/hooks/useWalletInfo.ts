"use client";

import { useAccount, useBalance } from 'wagmi';

export function useWalletInfo() {
  const { address, isConnected, chain } = useAccount();

  const { data: balance } = useBalance({
    address: address,
  });

  const formattedAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : '';

  const formattedBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
    : '0.0000 MATIC';

  return {
    address,
    isConnected,
    chain,
    formattedAddress,
    formattedBalance,
    rawBalance: balance,
  };
}
