export const vericreditAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "_schemeType", "type": "string" },
      { "internalType": "uint256", "name": "_additionalityScore", "type": "uint256" },
      { "internalType": "bool", "name": "_beeExportFlag", "type": "bool" },
      { "internalType": "string", "name": "_ipfsProjectURI", "type": "string" }
    ],
    "name": "mintCredit",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "certificateURI", "type": "string" }
    ],
    "name": "retireCredit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "pricePerToken", "type": "uint256" }
    ],
    "name": "listCredit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "listingId", "type": "uint256" },
      { "internalType": "uint256", "name": "amountToBuy", "type": "uint256" }
    ],
    "name": "buyCredit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];
