"use client";

import { useAccount, useReadContract } from 'wagmi';
import { vericreditAbi } from '../utils/abis';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERICREDIT_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

/**
 * Hook to read ERC-1155 token balance for a specific tokenId from VeriCredit contract.
 * Returns the balance as a bigint.
 */
export function useTokenBalance(tokenId: number) {
  const { address } = useAccount();

  const { data: balance, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "balanceOf",
        outputs: [
          { internalType: "uint256", name: "", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: 'balanceOf',
    args: address ? [address, BigInt(tokenId)] : undefined,
  });

  return {
    balance: balance ? Number(balance) : 0,
    isLoading,
    error,
  };
}

/**
 * Hook to read CCTS metadata for a specific tokenId.
 */
export function useCreditDetails(tokenId: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "getCreditDetails",
        outputs: [
          {
            components: [
              { internalType: "string", name: "schemeType", type: "string" },
              { internalType: "uint256", name: "additionalityScore", type: "uint256" },
              { internalType: "bool", name: "beeExportFlag", type: "bool" },
              { internalType: "string", name: "ipfsProjectURI", type: "string" },
              { internalType: "uint256", name: "mintedAt", type: "uint256" },
              { internalType: "bool", name: "retired", type: "bool" },
            ],
            internalType: "struct VeriCredit.CCTSMetadata",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: 'getCreditDetails',
    args: [BigInt(tokenId)],
  });

  return { details: data, isLoading, error };
}
