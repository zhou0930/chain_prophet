import { createPublicClient, createWalletClient, http, parseEther, formatEther, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { logger } from '@elizaos/core';

// 错误分析接口
interface ErrorAnalysis {
  errorType: string;
  reason: string;
  suggestion: string;
  userFriendlyMessage: string;
}

// 常见的错误代码映射
const ERROR_CODE_MAP: Record<string, { name: string; description: string; solution: string }> = {
  '0x177e802f': {
    name: 'ERC721InsufficientApproval',
    description: 'NFT 授权不足',
    solution: '需要先授权合约才能操作此 NFT'
  },
  '0x42842e0e': {
    name: 'ERC721InsufficientApproval',
    description: '调用者不是所有者或已授权的地址',
    solution: '请确认您是 NFT 的所有者，或已完成授权'
  },
  '0xa9fbf51f': {
    name: 'NotAuthorized',
    description: '未授权',
    solution: '请先授权合约'
  },
  '0x8c379a00': {
    name: 'Error',
    description: '合约执行失败',
    solution: '请检查操作参数是否正确'
  }
};

// 分析错误并返回详细原因
export function analyzeNFTError(error: any, operation: string): ErrorAnalysis {
  const errorMessage = error.message || String(error);
  const errorString = errorMessage.toLowerCase();
  
  logger.info({ errorMessage, operation }, 'Analyzing NFT error');

  // 检查授权相关错误
  if (errorMessage.includes('0x177e802f') || 
      errorMessage.includes('ERC721InsufficientApproval') ||
      errorMessage.includes('insufficient approval') ||
      errorMessage.includes('caller is not token owner or approved') ||
      errorMessage.includes('not authorized') ||
      errorMessage.includes('未授权')) {
    return {
      errorType: '授权错误',
      reason: 'NFT 未授权给相应的合约。ERC721 标准要求在进行转账或操作前，必须先授权合约。',
      suggestion: `1. 确认您是该 NFT 的所有者\n2. 先执行授权操作，授权对应的合约地址\n3. 等待授权交易确认后（通常需要 1-2 个区块），再重试当前操作`,
      userFriendlyMessage: `❌ ${operation}失败：授权不足\n\n原因：该 NFT 尚未授权给合约，无法进行操作。\n\n解决方案：\n1. 请先授权该 NFT 给对应的合约\n2. 等待授权交易确认（约 1-2 个区块时间）\n3. 然后重新尝试${operation}操作\n\n提示：授权只需要执行一次，授权后即可进行后续操作。`
    };
  }

  // 检查所有权错误
  if (errorMessage.includes('Not the owner') ||
      errorMessage.includes('not owner') ||
      errorMessage.includes('OwnableUnauthorizedAccount') ||
      errorMessage.includes('不是该 NFT 的所有者') ||
      errorMessage.includes('不是所有者')) {
    return {
      errorType: '所有权错误',
      reason: '您不是该 NFT 的所有者，无法进行操作。',
      suggestion: '请确认您拥有该 NFT，可以通过查询您的 NFT 列表来验证。',
      userFriendlyMessage: `❌ ${operation}失败：权限不足\n\n原因：您不是该 NFT 的所有者，无法进行此操作。\n\n解决方案：\n1. 确认您输入的 Token ID 是否正确\n2. 检查该 NFT 是否在您的钱包中\n3. 如果 NFT 已转移，请使用正确的 Token ID`
    };
  }

  // 检查余额不足
  if (errorMessage.includes('insufficient funds') ||
      errorMessage.includes('余额不足') ||
      errorMessage.includes('Insufficient balance') ||
      errorMessage.includes('balance too low')) {
    return {
      errorType: '余额不足',
      reason: '账户余额不足以支付 gas 费用或交易金额。',
      suggestion: '请向账户充值足够的 ETH 以支付 gas 费用和交易金额。',
      userFriendlyMessage: `❌ ${operation}失败：余额不足\n\n原因：您的账户余额不足以完成此操作（包括 gas 费用）。\n\n解决方案：\n1. 检查当前账户余额\n2. 确保有足够的 ETH 支付交易费用（建议至少 0.01 ETH）\n3. 如果是 Sepolia 测试网，可以从水龙头获取测试币`
    };
  }

  // 检查已上架/已质押
  if (errorMessage.includes('already listed') ||
      errorMessage.includes('already staked') ||
      errorMessage.includes('Already staked') ||
      errorMessage.includes('已经上架') ||
      errorMessage.includes('已经质押') ||
      errorMessage.includes('已上架')) {
    return {
      errorType: '状态错误',
      reason: '该 NFT 已经处于操作状态（已上架或已质押）。',
      suggestion: '请先取消上架或解除质押，然后再进行操作。',
      userFriendlyMessage: `❌ ${operation}失败：NFT 状态冲突\n\n原因：该 NFT 当前已经上架/质押，无法重复操作。\n\n解决方案：\n1. 如果您想重新操作，请先取消当前状态\n2. 等待状态更新后，再执行新的操作`
    };
  }

  // 检查参数错误
  if (errorMessage.includes('Invalid tokenId') ||
      errorMessage.includes('Token does not exist') ||
      errorMessage.includes('NFT not found') ||
      errorMessage.includes('无效') ||
      errorMessage.includes('不存在')) {
    return {
      errorType: '参数错误',
      reason: '提供的 Token ID 无效或 NFT 不存在。',
      suggestion: '请检查 Token ID 是否正确，确保该 NFT 存在。',
      userFriendlyMessage: `❌ ${operation}失败：参数错误\n\n原因：提供的 Token ID 无效或该 NFT 不存在。\n\n解决方案：\n1. 检查 Token ID 是否正确\n2. 确认该 NFT 是否已铸造\n3. 使用正确的数字格式（如：1、2、3 等）`
    };
  }

  // 检查价格错误
  if (errorMessage.includes('Invalid price') ||
      errorMessage.includes('价格无效') ||
      errorMessage.includes('Price too low') ||
      errorMessage.includes('价格过低')) {
    return {
      errorType: '价格错误',
      reason: '提供的价格无效或过低。',
      suggestion: '请提供有效的价格（必须大于 0）。',
      userFriendlyMessage: `❌ ${operation}失败：价格无效\n\n原因：提供的价格格式错误或数值无效。\n\n解决方案：\n1. 确保价格是大于 0 的数字\n2. 使用正确的格式（如：0.1、1.5 等）\n3. 价格单位为 ETH`
    };
  }

  // 检查 Gas 相关错误
  if (errorMessage.includes('gas') ||
      errorMessage.includes('Gas') ||
      errorMessage.includes('revert') ||
      errorMessage.includes('execution reverted')) {
    return {
      errorType: '交易执行错误',
      reason: '交易执行被回滚，可能是合约逻辑检查失败。',
      suggestion: '请检查操作参数是否满足合约要求，或稍后重试。',
      userFriendlyMessage: `❌ ${operation}失败：交易执行被回滚\n\n原因：合约执行时检查失败，操作不符合合约规则。\n\n可能的原因：\n1. NFT 状态不符合要求（已上架、已质押等）\n2. 参数不满足合约条件\n3. 网络拥堵导致交易失败\n\n解决方案：\n1. 检查 NFT 当前状态\n2. 确认操作参数正确\n3. 等待片刻后重试`
    };
  }

  // 检查网络错误
  if (errorMessage.includes('network') ||
      errorMessage.includes('Network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection')) {
    return {
      errorType: '网络错误',
      reason: '网络连接问题导致操作失败。',
      suggestion: '请检查网络连接，稍后重试。',
      userFriendlyMessage: `❌ ${operation}失败：网络连接问题\n\n原因：无法连接到区块链网络。\n\n解决方案：\n1. 检查网络连接\n2. 确认 RPC 端点可用\n3. 稍后重试`
    };
  }

  // 默认错误
  return {
    errorType: '未知错误',
    reason: errorMessage || '操作失败，原因未知',
    suggestion: '请检查操作参数和网络状态，或联系技术支持。',
    userFriendlyMessage: `❌ ${operation}失败\n\n错误信息：${errorMessage}\n\n建议：\n1. 检查操作参数是否正确\n2. 确认网络连接正常\n3. 查看上述错误信息以获取更多线索\n4. 如果问题持续，请稍后重试`
  };
}

// 合约地址配置
const NFT_MARKETPLACE_ADDRESS = (process.env.NFT_MARKETPLACE_ADDRESS || '0x96D1227aCD29057607601Afdf16BF853D5B58203') as `0x${string}`;
const NFT_STAKING_ADDRESS = (process.env.NFT_STAKING_ADDRESS || '0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9') as `0x${string}`;
const NFT_LOAN_ADDRESS = (process.env.NFT_LOAN_ADDRESS || '0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1') as `0x${string}`;
const NFT_CONTRACT_ADDRESS = (process.env.NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330') as `0x${string}`;

// 多个备用 RPC 端点
const RPC_ENDPOINTS = [
  process.env.SEPOLIA_RPC_URL,
  'https://rpc.sepolia.org',
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.gateway.tenderly.co',
].filter(Boolean) as string[];

let currentRpcIndex = 0;

const getCurrentRpcUrl = (): string => {
  return RPC_ENDPOINTS[currentRpcIndex] || RPC_ENDPOINTS[0] || 'https://rpc.sepolia.org';
};

const switchToNextRpc = (): string => {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  return getCurrentRpcUrl();
};

// 创建公共客户端
const createPublicClientWithRetry = () => {
  const createClient = (rpcUrl: string) => {
    return createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl, { retryCount: 3, retryDelay: 1000 }),
    });
  };

  let client = createClient(getCurrentRpcUrl());

  const proxyClient = new Proxy(client, {
    get(target, prop) {
      const originalMethod = (target as any)[prop];
      if (typeof originalMethod === 'function') {
        return async (...args: any[]) => {
          let lastError: any;
          let attempts = 0;
          const maxAttempts = Math.min(3, RPC_ENDPOINTS.length);

          while (attempts < maxAttempts) {
            try {
              return await originalMethod.apply(target, args);
            } catch (error: any) {
              lastError = error;
              if (error?.message?.includes('429') || error?.status === 429 || error?.cause?.status === 429) {
                if (attempts < maxAttempts - 1) {
                  const newRpcUrl = switchToNextRpc();
                  client = createClient(newRpcUrl);
                  target = client;
                  attempts++;
                  await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                  continue;
                }
              }
              throw error;
            }
          }
          throw lastError;
        };
      }
      return originalMethod;
    },
  });

  return proxyClient;
};

// 创建钱包客户端
const createWalletClientWithRetry = (privateKey: string) => {
  if (!privateKey) {
    throw new Error('请配置钱包私钥 EVM_PRIVATE_KEY');
  }

  const account = privateKeyToAccount(privateKey.trim() as `0x${string}`);
  
  const createClient = (rpcUrl: string) => {
    return createWalletClient({
      account,
      chain: sepolia,
      transport: http(rpcUrl, { retryCount: 3, retryDelay: 1000 }),
    });
  };

  let client = createClient(getCurrentRpcUrl());

  const proxyClient = new Proxy(client, {
    get(target, prop) {
      const originalMethod = (target as any)[prop];
      if (typeof originalMethod === 'function') {
        return async (...args: any[]) => {
          let lastError: any;
          let attempts = 0;
          const maxAttempts = Math.min(3, RPC_ENDPOINTS.length);

          while (attempts < maxAttempts) {
            try {
              return await originalMethod.apply(target, args);
            } catch (error: any) {
              lastError = error;
              if (error?.message?.includes('429') || error?.status === 429 || error?.cause?.status === 429) {
                if (attempts < maxAttempts - 1) {
                  const newRpcUrl = switchToNextRpc();
                  client = createClient(newRpcUrl);
                  target = client;
                  attempts++;
                  await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                  continue;
                }
              }
              throw error;
            }
          }
          throw lastError;
        };
      }
      return originalMethod;
    },
  });

  return proxyClient;
};

// 合约 ABI
const NFT_MARKETPLACE_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }, { name: 'price', type: 'uint256' }],
    name: 'listNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'cancelListing',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'buyNFT',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getListing',
    outputs: [{ name: 'seller', type: 'address' }, { name: 'price', type: 'uint256' }, { name: 'active', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const NFT_STAKING_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'stakeNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'unstakeNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getStakingInfo',
    outputs: [{ name: 'staker', type: 'address' }, { name: 'startTime', type: 'uint256' }, { name: 'rewards', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const NFT_LOAN_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }, { name: 'loanAmount', type: 'uint256' }, { name: 'duration', type: 'uint256' }],
    name: 'createLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'loanId', type: 'uint256' }],
    name: 'fulfillLoan',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'loanId', type: 'uint256' }],
    name: 'repayLoan',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'loanId', type: 'uint256' }],
    name: 'loans',
    outputs: [
      { name: 'borrower', type: 'address' },
      { name: 'lender', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'loanAmount', type: 'uint256' },
      { name: 'interestRate', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'dueDate', type: 'uint256' },
      { name: 'repaymentAmount', type: 'uint256' },
      { name: 'active', type: 'bool' },
      { name: 'repaid', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const TEST_NFT_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }],
    name: 'mint',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const ERC721_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'operator', type: 'address' }],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// NFT 服务类
export class NFTService {
  private privateKey: string;
  private walletClient: ReturnType<typeof createWalletClientWithRetry>;
  private publicClient: ReturnType<typeof createPublicClientWithRetry>;

  constructor(privateKey?: string) {
    this.privateKey = privateKey || process.env.EVM_PRIVATE_KEY || '';
    if (!this.privateKey) {
      throw new Error('未配置钱包私钥，请设置 EVM_PRIVATE_KEY 环境变量');
    }
    this.walletClient = createWalletClientWithRetry(this.privateKey);
    this.publicClient = createPublicClientWithRetry();
  }

  // 铸造 NFT
  async mintNFT(toAddress?: string): Promise<string> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error('无法获取账户信息');
    }
    const recipient = toAddress || account.address;

    const hash = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: TEST_NFT_ABI,
      functionName: 'mint',
      args: [recipient as `0x${string}`]
    });

    return hash;
  }

  // 检查是否是合约 owner
  async checkIsOwner(userAddress: string): Promise<boolean> {
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: TEST_NFT_ABI,
      functionName: 'owner',
      args: []
    });
    return owner.toLowerCase() === userAddress.toLowerCase();
  }

  // 授权市场合约
  async approveMarketplace(tokenId: string): Promise<string> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error('无法获取账户信息');
    }

    // 验证所有权
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    });

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('您不是该 NFT 的所有者，无法进行授权');
    }

    const hash = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [NFT_MARKETPLACE_ADDRESS, BigInt(tokenId)]
    });

    return hash;
  }

  // 检查是否已授权市场合约
  async checkMarketplaceApproval(tokenId: string): Promise<boolean> {
    const account = this.walletClient.account;
    if (!account) {
      return false;
    }

    try {
      // 检查全局授权
      const isApprovedForAll = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'isApprovedForAll',
        args: [account.address, NFT_MARKETPLACE_ADDRESS]
      });

      if (isApprovedForAll) {
        return true;
      }

      // 检查单个 token 授权
      const approvedAddress = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'getApproved',
        args: [BigInt(tokenId)]
      });

      return approvedAddress.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase();
    } catch (error) {
      logger.error({ error }, '检查授权状态失败');
      return false;
    }
  }

  // 上架 NFT
  async listNFT(tokenId: string, price: string, autoApprove: boolean = true): Promise<string> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error('无法获取账户信息');
    }

    // 验证所有权
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    });

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('您不是该 NFT 的所有者，无法上架');
    }

    // 检查并自动授权
    const isApproved = await this.checkMarketplaceApproval(tokenId);
    if (!isApproved && autoApprove) {
      logger.info(`NFT ${tokenId} 未授权，自动进行授权...`);
      await this.approveMarketplace(tokenId);
      // 等待交易确认
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else if (!isApproved) {
      throw new Error('请先授权市场合约才能上架 NFT。您可以先授权，然后再尝试上架。');
    }

    const value = parseEther(price);
    const hash = await this.walletClient.writeContract({
      address: NFT_MARKETPLACE_ADDRESS,
      abi: NFT_MARKETPLACE_ABI,
      functionName: 'listNFT',
      args: [BigInt(tokenId), value]
    });

    return hash;
  }

  // 购买 NFT
  async buyNFT(tokenId: string, price?: string): Promise<string> {
    const listing = await this.getListing(tokenId);
    if (!listing) {
      throw new Error('该 NFT 未上架或已被售出');
    }

    const paymentAmount = price ? parseEther(price) : parseEther(listing.price);
    const listingPrice = parseEther(listing.price);
    if (paymentAmount < listingPrice) {
      throw new Error(`支付金额不足！该 NFT 的价格是 ${listing.price} ETH`);
    }

    const hash = await this.walletClient.writeContract({
      address: NFT_MARKETPLACE_ADDRESS,
      abi: NFT_MARKETPLACE_ABI,
      functionName: 'buyNFT',
      args: [BigInt(tokenId)],
      value: paymentAmount
    });

    return hash;
  }

  // 获取上架信息
  async getListing(tokenId: string): Promise<{ seller: string; price: string; active: boolean } | null> {
    try {
      const result = await this.publicClient.readContract({
        address: NFT_MARKETPLACE_ADDRESS,
        abi: NFT_MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [BigInt(tokenId)]
      }) as [string, bigint, boolean];

      if (!result[2]) {
        return null;
      }

      return {
        seller: result[0],
        price: formatEther(result[1]),
        active: result[2]
      };
    } catch (error) {
      return null;
    }
  }

  // 检查是否已授权质押合约
  async checkStakingApproval(tokenId: string): Promise<boolean> {
    const account = this.walletClient.account;
    if (!account) {
      return false;
    }

    try {
      // 检查全局授权
      const isApprovedForAll = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'isApprovedForAll',
        args: [account.address, NFT_STAKING_ADDRESS]
      });

      if (isApprovedForAll) {
        return true;
      }

      // 检查单个 token 授权
      const approvedAddress = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'getApproved',
        args: [BigInt(tokenId)]
      });

      return approvedAddress.toLowerCase() === NFT_STAKING_ADDRESS.toLowerCase();
    } catch (error) {
      logger.error({ error }, '检查质押授权状态失败');
      return false;
    }
  }

  // 授权质押合约
  async approveStaking(tokenId: string): Promise<string> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error('无法获取账户信息');
    }

    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    });

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('您不是该 NFT 的所有者，无法进行授权');
    }

    const hash = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [NFT_STAKING_ADDRESS, BigInt(tokenId)]
    });

    return hash;
  }

  // 质押 NFT
  async stakeNFT(tokenId: string, autoApprove: boolean = true): Promise<string> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error('无法获取账户信息');
    }

    // 验证所有权
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    });

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('您不是该 NFT 的所有者，无法质押');
    }

    // 检查并自动授权
    const isApproved = await this.checkStakingApproval(tokenId);
    if (!isApproved && autoApprove) {
      logger.info(`NFT ${tokenId} 未授权质押合约，自动进行授权...`);
      await this.approveStaking(tokenId);
      // 等待交易确认
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else if (!isApproved) {
      throw new Error('请先授权质押合约才能质押 NFT。您可以先授权，然后再尝试质押。');
    }

    const hash = await this.walletClient.writeContract({
      address: NFT_STAKING_ADDRESS,
      abi: NFT_STAKING_ABI,
      functionName: 'stakeNFT',
      args: [BigInt(tokenId)]
    });

    return hash;
  }

  // 解除质押
  async unstakeNFT(tokenId: string): Promise<string> {
    const hash = await this.walletClient.writeContract({
      address: NFT_STAKING_ADDRESS,
      abi: NFT_STAKING_ABI,
      functionName: 'unstakeNFT',
      args: [BigInt(tokenId)]
    });

    return hash;
  }

  // 获取质押信息
  async getStakingInfo(tokenId: string): Promise<{ staker: string; startTime: number; rewards: string } | null> {
    try {
      const result = await this.publicClient.readContract({
        address: NFT_STAKING_ADDRESS,
        abi: NFT_STAKING_ABI,
        functionName: 'getStakingInfo',
        args: [BigInt(tokenId)]
      }) as [string, bigint, bigint];

      if (!result[0] || result[0] === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return {
        staker: result[0],
        startTime: Number(result[1]),
        rewards: formatEther(result[2])
      };
    } catch (error) {
      return null;
    }
  }

  // 检查是否已授权借贷合约
  async checkLoanApproval(tokenId: string): Promise<boolean> {
    const account = this.walletClient.account;
    if (!account) {
      return false;
    }

    try {
      // 检查全局授权
      const isApprovedForAll = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'isApprovedForAll',
        args: [account.address, NFT_LOAN_ADDRESS]
      });

      if (isApprovedForAll) {
        return true;
      }

      // 检查单个 token 授权
      const approvedAddress = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'getApproved',
        args: [BigInt(tokenId)]
      });

      return approvedAddress.toLowerCase() === NFT_LOAN_ADDRESS.toLowerCase();
    } catch (error) {
      logger.error({ error }, '检查借贷授权状态失败');
      return false;
    }
  }

  // 授权借贷合约
  async approveLoan(tokenId: string): Promise<string> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error('无法获取账户信息');
    }

    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    });

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('您不是该 NFT 的所有者，无法进行授权');
    }

    const hash = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [NFT_LOAN_ADDRESS, BigInt(tokenId)]
    });

    return hash;
  }

  // 创建借贷
  async createLoan(tokenId: string, loanAmount: string, durationDays: number, autoApprove: boolean = true): Promise<string> {
    if (durationDays < 7 || durationDays > 365) {
      throw new Error('借贷期限必须在 7-365 天之间');
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error('无法获取账户信息');
    }

    // 验证所有权
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    });

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('您不是该 NFT 的所有者，无法创建借贷');
    }

    // 检查并自动授权
    const isApproved = await this.checkLoanApproval(tokenId);
    if (!isApproved && autoApprove) {
      logger.info(`NFT ${tokenId} 未授权借贷合约，自动进行授权...`);
      await this.approveLoan(tokenId);
      // 等待交易确认
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else if (!isApproved) {
      throw new Error('请先授权借贷合约才能创建借贷。您可以先授权，然后再尝试创建借贷。');
    }

    const amount = parseEther(loanAmount);
    const durationInSeconds = durationDays * 24 * 60 * 60;

    const hash = await this.walletClient.writeContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: 'createLoan',
      args: [BigInt(tokenId), amount, BigInt(durationInSeconds)]
    });

    return hash;
  }

  // 出资完成借贷
  async fulfillLoan(loanId: string): Promise<string> {
    const loanData = await this.publicClient.readContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: 'loans',
      args: [BigInt(loanId)]
    }) as any;

    const loanAmount = loanData[3] as bigint;
    const lender = loanData[1] as string;

    if (lender && lender !== '0x0000000000000000000000000000000000000000') {
      throw new Error('该借贷已有贷款人出资');
    }

    const hash = await this.walletClient.writeContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: 'fulfillLoan',
      args: [BigInt(loanId)],
      value: loanAmount
    });

    return hash;
  }

  // 还款
  async repayLoan(loanId: string): Promise<string> {
    const loanData = await this.publicClient.readContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: 'loans',
      args: [BigInt(loanId)]
    }) as any;

    const repaymentAmount = loanData[7] as bigint;

    const hash = await this.walletClient.writeContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: 'repayLoan',
      args: [BigInt(loanId)],
      value: repaymentAmount
    });

    return hash;
  }

  // 获取借贷信息
  async getLoanInfo(loanId: string): Promise<{ borrower: string; lender: string; loanAmount: string; dueDate: number; repaid: boolean; repaymentAmount: string } | null> {
    try {
      const loanData = await this.publicClient.readContract({
        address: NFT_LOAN_ADDRESS,
        abi: NFT_LOAN_ABI,
        functionName: 'loans',
        args: [BigInt(loanId)]
      }) as any;

      if (!loanData[0] || loanData[0] === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return {
        borrower: loanData[0] as string,
        lender: loanData[1] as string,
        loanAmount: formatEther(loanData[3] as bigint),
        dueDate: Number(loanData[6] as bigint),
        repaid: loanData[9] as boolean,
        repaymentAmount: formatEther(loanData[7] as bigint)
      };
    } catch (error) {
      return null;
    }
  }
}
