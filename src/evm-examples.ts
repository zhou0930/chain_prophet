/**
 * EVM Plugin Usage Examples
 * 
 * This file contains examples of how to use the EVM plugin for blockchain operations.
 * Based on the official ElizaOS EVM plugin documentation.
 */

import { IAgentRuntime, Memory, State } from '@elizaos/core';

/**
 * Example 1: Token Transfer
 * 
 * User prompt: "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 * 
 * The EVM plugin will:
 * 1. Parse the transfer parameters (amount, token, recipient)
 * 2. Validate the recipient address
 * 3. Check wallet balance
 * 4. Execute the transfer transaction
 * 5. Return transaction hash
 */
export const transferExample = {
  prompt: "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  expectedAction: "EVM_TRANSFER",
  parameters: {
    amount: "0.1",
    token: "ETH",
    toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    chain: "sepolia"
  }
};

/**
 * Example 2: Token Swap
 * 
 * User prompt: "Swap 100 USDC for DAI on Arbitrum"
 * 
 * The EVM plugin will:
 * 1. Parse swap parameters (from token, to token, amount, chain)
 * 2. Get quotes from multiple DEX aggregators (LiFi, Bebop)
 * 3. Select the best route
 * 4. Execute the swap transaction
 * 5. Return swap details
 */
export const swapExample = {
  prompt: "Swap 100 USDC for DAI on Arbitrum",
  expectedAction: "EVM_SWAP",
  parameters: {
    fromToken: "USDC",
    toToken: "DAI",
    amount: "100",
    chain: "sepolia"
  }
};

/**
 * Example 3: Cross-Chain Bridge
 * 
 * User prompt: "Bridge 50 USDC from Ethereum to Base"
 * 
 * The EVM plugin will:
 * 1. Parse bridge parameters (token, amount, from chain, to chain)
 * 2. Find optimal bridge route using LiFi
 * 3. Execute the bridge transaction
 * 4. Return bridge transaction details
 */
export const bridgeExample = {
  prompt: "Bridge 50 USDC from Ethereum to Base",
  expectedAction: "EVM_BRIDGE",
  parameters: {
    token: "USDC",
    amount: "50",
    fromChain: "mainnet",
    toChain: "sepolia"
  }
};

/**
 * Example 4: Governance Actions
 * 
 * User prompt: "Vote FOR on proposal #42"
 * 
 * The EVM plugin will:
 * 1. Parse governance parameters (proposal ID, vote choice)
 * 2. Connect to the governance contract
 * 3. Execute the vote transaction
 * 4. Return vote confirmation
 */
export const governanceExample = {
  prompt: "Vote FOR on proposal #42",
  expectedAction: "EVM_GOV_VOTE",
  parameters: {
    proposalId: "42",
    support: "FOR",
    chain: "sepolia"
  }
};

/**
 * Example 5: Check Wallet Balance
 * 
 * User prompt: "What's my ETH balance?"
 * 
 * The EVM plugin will:
 * 1. Parse the balance query
 * 2. Check wallet balance across all configured chains
 * 3. Return formatted balance information
 */
export const balanceExample = {
  prompt: "What's my ETH balance?",
  expectedAction: "EVM_BALANCE",
  parameters: {
    token: "ETH",
    chain: "sepolia"
  }
};

/**
 * Supported Chains
 * 
 * The EVM plugin supports all EVM-compatible chains including:
 */
export const supportedChains = [
  "mainnet",       // Ethereum Mainnet
  "sepolia",       // Ethereum Sepolia Testnet
  "base",          // Base Mainnet
  "baseSepolia",   // Base Sepolia Testnet
  "arbitrum",      // Arbitrum One
  "arbitrumSepolia", // Arbitrum Sepolia Testnet
  "optimism",      // Optimism Mainnet
  "optimismSepolia", // Optimism Sepolia Testnet
  "polygon",       // Polygon Mainnet
  "polygonMumbai", // Polygon Mumbai Testnet
  "bsc",           // Binance Smart Chain
  "avalanche",     // Avalanche C-Chain
  "zksync",        // zkSync Era
  "linea",         // Linea
  "scroll",        // Scroll
  "mantle",        // Mantle
  "blast"          // Blast
];

/**
 * Common Tokens by Chain
 * 
 * The plugin automatically resolves these token symbols:
 */
export const commonTokens = {
  mainnet: {
    "ETH": "0x0000000000000000000000000000000000000000",
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  },
  sepolia: {
    "ETH": "0x0000000000000000000000000000000000000000",
    "USDC": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
  },
  base: {
    "ETH": "0x0000000000000000000000000000000000000000",
    "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  },
  arbitrum: {
    "ETH": "0x0000000000000000000000000000000000000000",
    "USDC": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "USDT": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
  }
};

/**
 * Error Handling Examples
 * 
 * The plugin handles common error scenarios:
 */
export const errorScenarios = {
  insufficientFunds: "Insufficient funds for transaction",
  invalidAddress: "Invalid recipient address",
  networkCongestion: "Network congestion, please try again",
  gasEstimationFailed: "Gas estimation failed",
  slippageExceeded: "Slippage tolerance exceeded"
};

/**
 * Security Best Practices
 * 
 * Important security considerations:
 */
export const securityTips = [
  "Never share your private key",
  "Use environment variables for sensitive data",
  "Validate all addresses before transactions",
  "Set appropriate slippage tolerances",
  "Monitor gas prices and limits",
  "Test with small amounts first",
  "Use hardware wallets for large amounts"
];

/**
 * Testing the EVM Plugin
 * 
 * To test the plugin integration:
 */
export const testingSteps = [
  "1. Set up environment variables (.env file)",
  "2. Configure EVM_PRIVATE_KEY with a test wallet",
  "3. Add custom RPC endpoints for better performance",
  "4. Test with small amounts on testnets first",
  "5. Verify transaction execution and confirmations",
  "6. Check wallet balance updates",
  "7. Test error handling scenarios"
];
