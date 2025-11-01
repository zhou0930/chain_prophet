import { NFTListing, NFTStaking, NFTLoan } from '../types';
import { parseEther, formatEther, encodeFunctionData } from 'viem';
import { createWalletClientWithRetry, createPublicClientWithRetry } from './rpcClient';
import { cachedReadContract, cachedGetBalance } from './rpcCache';

// 简单的 NFT Marketplace 合约 ABI（示例，实际需要根据部署的合约调整）
const NFT_MARKETPLACE_ABI = [
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'price', type: 'uint256' }
    ],
    name: 'listNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' }
    ],
    name: 'cancelListing',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' }
    ],
    name: 'buyNFT',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getListing',
    outputs: [
      { name: 'seller', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'active', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

// NFT Staking 合约 ABI（示例）
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
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getStakingInfo',
    outputs: [
      { name: 'staker', type: 'address' },
      { name: 'startTime', type: 'uint256' },
      { name: 'rewards', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

// NFT Loan 合约 ABI（示例）
const NFT_LOAN_ABI = [
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'loanAmount', type: 'uint256' },
      { name: 'duration', type: 'uint256' }
    ],
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
    name: 'getLoanInfo',
    outputs: [
      { name: 'borrower', type: 'address' },
      { name: 'lender', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'dueDate', type: 'uint256' },
      { name: 'repaid', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

// 合约地址（从环境变量读取，如果未配置则使用已部署的 Sepolia 地址）
const NFT_MARKETPLACE_ADDRESS = (import.meta as any).env?.VITE_NFT_MARKETPLACE_ADDRESS || '0x96D1227aCD29057607601Afdf16BF853D5B58203';
const NFT_STAKING_ADDRESS = (import.meta as any).env?.VITE_NFT_STAKING_ADDRESS || '0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9';
const NFT_LOAN_ADDRESS = (import.meta as any).env?.VITE_NFT_LOAN_ADDRESS || '0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1';
const NFT_CONTRACT_ADDRESS = (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330';

// 从环境变量获取私钥
const PRIVATE_KEY = (import.meta as any).env?.VITE_WALLET_PRIVATE_KEY || '';

// 创建钱包客户端（带 RPC 重试和切换）
const getWalletClient = () => {
  return createWalletClientWithRetry(PRIVATE_KEY);
};

// TestNFT 合约 ABI
const TEST_NFT_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }],
    name: 'mint',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'batchMint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
] as const;

// ERC721 ABI for approve
const ERC721_APPROVE_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
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
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' }
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' }
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
] as const;

// NFT 铸造服务
export const nftMintService = {
  /**
   * 检查是否是合约 owner
   */
  async checkIsOwner(userAddress: string): Promise<boolean> {
    try {
      const publicClient = createPublicClientWithRetry();
      const nftAddress = (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330';
      
      const owner = await publicClient.readContract({
        address: nftAddress as `0x${string}`,
        abi: TEST_NFT_ABI,
        functionName: 'owner',
        args: []
      });
      
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error('[NFT Mint] 检查 owner 失败:', error);
      return false;
    }
  },

  /**
   * 铸造单个 NFT
   */
  async mint(to: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const nftAddress = (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330';
      
      const hash = await walletClient.writeContract({
        address: nftAddress as `0x${string}`,
        abi: TEST_NFT_ABI,
        functionName: 'mint',
        args: [to as `0x${string}`]
      });
      
      console.log('[NFT Mint] 铸造成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Mint] 铸造失败:', error);
      
      if (error.message?.includes('OwnableUnauthorizedAccount') || 
          error.message?.includes('not owner') ||
          error.message?.includes('only owner')) {
        throw new Error('您不是合约所有者，无法铸造 NFT。只有合约部署者可以铸造。');
      }
      
      throw error;
    }
  },

  /**
   * 批量铸造 NFT
   */
  async batchMint(to: string, amount: number): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const nftAddress = (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330';
      
      if (amount <= 0 || amount > 10) {
        throw new Error('批量铸造数量必须在 1-10 之间');
      }
      
      const hash = await walletClient.writeContract({
        address: nftAddress as `0x${string}`,
        abi: TEST_NFT_ABI,
        functionName: 'batchMint',
        args: [to as `0x${string}`, BigInt(amount)]
      });
      
      console.log(`[NFT Mint] 批量铸造 ${amount} 个 NFT 成功:`, hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Mint] 批量铸造失败:', error);
      
      if (error.message?.includes('OwnableUnauthorizedAccount') || 
          error.message?.includes('not owner') ||
          error.message?.includes('only owner')) {
        throw new Error('您不是合约所有者，无法铸造 NFT。只有合约部署者可以铸造。');
      }
      
      throw error;
    }
  },
};

// NFT Marketplace 服务
export const nftMarketplaceService = {
  /**
   * 授权合约转移 NFT（通用方法，供内部使用）
   */
  approveContract: async function(tokenId: string, contractAddress: string, nftContractAddress?: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const publicClient = createPublicClientWithRetry();
      const account = walletClient.account;
      
      if (!account) {
        throw new Error('无法获取账户信息');
      }
      
      const nftAddress = (nftContractAddress || (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330') as `0x${string}`;
      
      // 首先验证 NFT 所有权
      const ERC721_OWNER_ABI = [
        {
          inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
          name: 'ownerOf',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
          name: 'getApproved',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function'
        }
      ] as const;

      const owner = await publicClient.readContract({
        address: nftAddress,
        abi: ERC721_OWNER_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
      });

      if (owner.toLowerCase() !== account.address.toLowerCase()) {
        throw new Error('您不是该 NFT 的所有者，无法进行授权');
      }

      // 检查当前授权状态
      try {
        const currentApproved = await publicClient.readContract({
          address: nftAddress,
          abi: ERC721_OWNER_ABI,
          functionName: 'getApproved',
          args: [BigInt(tokenId)]
        });

        // 如果已经授权给其他地址，先撤销授权（授权给零地址）
        if (currentApproved && currentApproved.toLowerCase() !== '0x0000000000000000000000000000000000000000' && 
            currentApproved.toLowerCase() !== contractAddress.toLowerCase()) {
          console.log('[NFT] 检测到已有授权，先撤销之前的授权...');
          await walletClient.writeContract({
            address: nftAddress,
            abi: ERC721_APPROVE_ABI,
            functionName: 'approve',
            args: ['0x0000000000000000000000000000000000000000' as `0x${string}`, BigInt(tokenId)]
          });
          // 等待一个区块确认
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (err) {
        console.warn('[NFT] 检查当前授权状态失败，继续授权:', err);
      }
      
      // 授权合约可以转移这个特定的 NFT
      const hash = await walletClient.writeContract({
        address: nftAddress,
        abi: ERC721_APPROVE_ABI,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, BigInt(tokenId)]
      });
      
      console.log('[NFT] 授权成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT] 授权失败:', error);
      
      // 提供更友好的错误信息
      if (error.message?.includes('不是该 NFT 的所有者') || 
          error.message?.includes('Not the owner') ||
          error.message?.includes('ERC721InsufficientApproval') ||
          error.message?.includes('0xa9fbf51f')) {
        if (error.message?.includes('不是该 NFT 的所有者')) {
          throw error;
        }
        throw new Error('授权失败：您不是该 NFT 的所有者，或者 NFT 已授权给其他地址。请确认您拥有该 NFT。');
      }
      
      throw error;
    }
  },

  /**
   * 全局授权市场合约（授权所有 NFT，更方便）
   */
  async setApprovalForAllMarketplace(approved: boolean = true, nftContractAddress?: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const nftAddress = (nftContractAddress || (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330') as `0x${string}`;
      
      const hash = await walletClient.writeContract({
        address: nftAddress,
        abi: ERC721_APPROVE_ABI,
        functionName: 'setApprovalForAll',
        args: [NFT_MARKETPLACE_ADDRESS as `0x${string}`, approved]
      });
      
      console.log(`[NFT Marketplace] ${approved ? '全局授权' : '撤销全局授权'}成功:`, hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Marketplace] 全局授权失败:', error);
      throw error;
    }
  },

  /**
   * 授权市场合约转移 NFT（如果需要）
   */
  async approveMarketplace(tokenId: string, nftContractAddress?: string): Promise<string> {
    return nftMarketplaceService.approveContract(tokenId, NFT_MARKETPLACE_ADDRESS, nftContractAddress);
  },

  /**
   * 检查是否已授权（全局授权）
   */
  async checkApproval(ownerAddress: string, nftContractAddress?: string): Promise<boolean> {
    try {
      const publicClient = createPublicClientWithRetry();
      const nftAddress = (nftContractAddress || (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330') as `0x${string}`;
      
      // 检查市场合约是否有全局权限
      const approved = await publicClient.readContract({
        address: nftAddress,
        abi: ERC721_APPROVE_ABI,
        functionName: 'isApprovedForAll',
        args: [ownerAddress as `0x${string}`, NFT_MARKETPLACE_ADDRESS as `0x${string}`]
      });
      
      return approved;
    } catch (error) {
      console.error('[NFT Marketplace] 检查授权失败:', error);
      return false;
    }
  },

  /**
   * 检查单个 NFT 是否已授权（包括全局授权和单独授权）
   */
  async checkTokenApproval(tokenId: string, ownerAddress: string, nftContractAddress?: string): Promise<boolean> {
    try {
      const publicClient = createPublicClientWithRetry();
      const nftAddress = (nftContractAddress || (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330') as `0x${string}`;
      
      // 并行检查全局授权和单独授权
      const [isGlobalApproved, approvedAddress] = await Promise.all([
        this.checkApproval(ownerAddress, nftContractAddress),
        publicClient.readContract({
          address: nftAddress,
          abi: ERC721_APPROVE_ABI,
          functionName: 'getApproved',
          args: [BigInt(tokenId)]
        }).catch(() => '0x0000000000000000000000000000000000000000' as `0x${string}`)
      ]);
      
      // 如果全局授权，直接返回 true
      if (isGlobalApproved) {
        return true;
      }
      
      // 检查单独授权
      const isTokenApproved = approvedAddress.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase();
      return isTokenApproved;
    } catch (error) {
      console.error(`[NFT Marketplace] 检查 Token ${tokenId} 授权失败:`, error);
      return false;
    }
  },

  /**
   * 上架 NFT（需要先授权）
   */
  async listNFT(tokenId: string, price: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const publicClient = createPublicClientWithRetry();
      const account = walletClient.account;
      
      if (!account) {
        throw new Error('无法获取账户信息');
      }
      
      // 检查 NFT 所有权
      const owner = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
            name: 'ownerOf',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function'
          }
        ] as const,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
      });

      if (owner.toLowerCase() !== account.address.toLowerCase()) {
        throw new Error('您不是该 NFT 的所有者，无法上架');
      }

      // 检查是否已授权
      const isApproved = await this.checkTokenApproval(tokenId, account.address);
      if (!isApproved) {
        throw new Error('请先授权市场合约，然后再尝试上架');
      }
      
      const value = parseEther(price);
      
      const hash = await walletClient.writeContract({
        address: NFT_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: NFT_MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [BigInt(tokenId), value]
      });
      
      console.log('[NFT Marketplace] NFT 上架成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Marketplace] 上架失败:', error);
      
      // 如果是授权相关错误，提供更友好的错误信息
      if (error.message?.includes('0x177e802f') ||
          error.message?.includes('0x7e273289') || 
          error.message?.includes('insufficient approval') ||
          error.message?.includes('ERC721InsufficientApproval') ||
          error.message?.includes('Not the owner') ||
          error.message?.includes('caller is not token owner or approved') ||
          error.message?.includes('授权')) {
        if (error.message?.includes('不是该 NFT 的所有者')) {
          throw error;
        }
        throw new Error('请先授权市场合约，然后再尝试上架');
      }
      
      throw error;
    }
  },

  /**
   * 取消上架
   */
  async cancelListing(tokenId: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      
      const hash = await walletClient.writeContract({
        address: NFT_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: NFT_MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [BigInt(tokenId)]
      });
      
      console.log('[NFT Marketplace] 取消上架成功:', hash);
      return hash;
    } catch (error) {
      console.error('[NFT Marketplace] 取消上架失败:', error);
      throw error;
    }
  },

  /**
   * 购买 NFT（自动获取实际价格）
   */
  async buyNFT(tokenId: string, price?: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      
      // 先获取上架信息，验证 NFT 是否可购买
      const listing = await this.getListing(tokenId);
      if (!listing) {
        throw new Error('该 NFT 未上架或已被售出');
      }
      
      // 确定支付金额
      let paymentAmount: bigint;
      if (price) {
        // 用户提供了价格，使用用户价格（但必须 >= 上架价格）
        paymentAmount = parseEther(price);
        const listingPrice = parseEther(listing.price);
        if (paymentAmount < listingPrice) {
          throw new Error(`支付金额不足！该 NFT 的价格是 ${listing.price} ETH，您输入了 ${price} ETH。请确保输入的价格至少为 ${listing.price} ETH。`);
        }
      } else {
        // 未提供价格，使用上架价格
        paymentAmount = parseEther(listing.price);
      }
      
      const hash = await walletClient.writeContract({
        address: NFT_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: NFT_MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [BigInt(tokenId)],
        value: paymentAmount
      });
      
      console.log('[NFT Marketplace] 购买 NFT 成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Marketplace] 购买失败:', error);
      
      // 如果是金额不足错误，提供更友好的提示
      if (error.message?.includes('Insufficient payment') || 
          error.message?.includes('金额不足') ||
          error.message?.includes('支付金额不足')) {
        // 尝试获取实际价格并重新抛出更友好的错误
        try {
          const listing = await this.getListing(tokenId);
          if (listing) {
            throw new Error(`支付金额不足！该 NFT 的价格是 ${listing.price} ETH。请确保输入的价格至少为 ${listing.price} ETH。`);
          }
        } catch (e: any) {
          // 如果已经是友好的错误，直接抛出
          if (e.message?.includes('价格是')) {
            throw e;
          }
          // 否则使用原始错误
          throw new Error(`支付金额不足。请确保您输入的价格大于等于 NFT 的上架价格。${price ? `您输入了 ${price} ETH。` : ''}`);
        }
      }
      
      throw error;
    }
  },

  /**
   * 获取上架信息
   */
  async getListing(tokenId: string): Promise<NFTListing | null> {
    try {
      const publicClient = createPublicClientWithRetry();
      
      const result = await publicClient.readContract({
        address: NFT_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: NFT_MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [BigInt(tokenId)]
      }) as [string, bigint, boolean];
      
      if (!result[2]) { // active is false
        return null;
      }
      
      return {
        id: `listing_${tokenId}`,
        seller: result[0],
        price: formatEther(result[1]),
        startTime: Date.now(),
        status: 'active'
      } as NFTListing;
    } catch (error) {
      console.error('[NFT Marketplace] 获取上架信息失败:', error);
      return null;
    }
  }
};

// NFT Staking 服务
export const nftStakingService = {
  /**
   * 全局授权质押合约（授权所有 NFT，更方便）
   */
  async setApprovalForAllStaking(approved: boolean = true): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const nftAddress = NFT_CONTRACT_ADDRESS as `0x${string}`;
      
      const hash = await walletClient.writeContract({
        address: nftAddress,
        abi: ERC721_APPROVE_ABI,
        functionName: 'setApprovalForAll',
        args: [NFT_STAKING_ADDRESS as `0x${string}`, approved]
      });
      
      console.log(`[NFT Staking] ${approved ? '全局授权' : '撤销全局授权'}成功:`, hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Staking] 全局授权失败:', error);
      throw error;
    }
  },

  /**
   * 授权质押合约（单个 NFT）
   */
  async approveStaking(tokenId: string): Promise<string> {
    return nftMarketplaceService.approveContract(tokenId, NFT_STAKING_ADDRESS);
  },

  /**
   * 检查是否已授权质押合约
   */
  async checkStakingApproval(tokenId: string): Promise<boolean> {
    try {
      const publicClient = createPublicClientWithRetry();
      const account = getWalletClient().account;
      if (!account) {
        return false;
      }

      // 检查全局授权
      const isApprovedForAll = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: ERC721_APPROVE_ABI,
        functionName: 'isApprovedForAll',
        args: [account.address, NFT_STAKING_ADDRESS as `0x${string}`]
      });

      if (isApprovedForAll) {
        return true;
      }

      // 检查单个 token 授权
      const approvedAddress = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: ERC721_APPROVE_ABI,
        functionName: 'getApproved',
        args: [BigInt(tokenId)]
      });

      return approvedAddress.toLowerCase() === NFT_STAKING_ADDRESS.toLowerCase();
    } catch (error) {
      console.error('[NFT Staking] 检查授权状态失败:', error);
      return false;
    }
  },

  /**
   * 质押 NFT
   */
  async stakeNFT(tokenId: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const publicClient = createPublicClientWithRetry();
      
      // 检查 NFT 所有权
      const account = walletClient.account;
      if (!account) {
        throw new Error('无法获取账户信息');
      }

      // 注意：ownerOf 不在 ERC721_APPROVE_ABI 中，需要使用 ERC721_ABI
      const ERC721_OWNER_ABI = [
        {
          inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
          name: 'ownerOf',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function'
        }
      ] as const;

      const owner = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: ERC721_OWNER_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
      });

      if (owner.toLowerCase() !== account.address.toLowerCase()) {
        throw new Error('您不是该 NFT 的所有者，无法质押');
      }

      // 检查是否已授权
      const isApproved = await this.checkStakingApproval(tokenId);
      if (!isApproved) {
        throw new Error('请先授权质押合约，然后再尝试质押');
      }

      // 检查是否已经质押
      const stakingInfo = await this.getStakingInfo(tokenId);
      if (stakingInfo && stakingInfo.status === 'active') {
        throw new Error('该 NFT 已经质押，无法重复质押');
      }
      
      const hash = await walletClient.writeContract({
        address: NFT_STAKING_ADDRESS as `0x${string}`,
        abi: NFT_STAKING_ABI,
        functionName: 'stakeNFT',
        args: [BigInt(tokenId)]
      });
      
      console.log('[NFT Staking] 质押成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Staking] 质押失败:', error);
      
      // 提供更友好的错误信息
      if (error.message?.includes('insufficient approval') || 
          error.message?.includes('ERC721InsufficientApproval') ||
          error.message?.includes('0x177e802f') ||
          error.message?.includes('授权')) {
        throw new Error('请先授权质押合约，然后再尝试质押');
      }
      if (error.message?.includes('Already staked') || error.message?.includes('已经质押')) {
        throw new Error('该 NFT 已经质押，无法重复质押');
      }
      if (error.message?.includes('Not the owner') || error.message?.includes('不是该 NFT 的所有者')) {
        throw new Error('您不是该 NFT 的所有者，无法质押');
      }
      
      throw error;
    }
  },

  /**
   * 解除质押
   */
  async unstakeNFT(tokenId: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const account = walletClient.account;
      if (!account) {
        throw new Error('无法获取账户信息');
      }

      // 检查质押信息，确保是用户自己质押的
      const stakingInfo = await this.getStakingInfo(tokenId);
      if (!stakingInfo || stakingInfo.status !== 'active') {
        throw new Error('该 NFT 未质押或已解除质押');
      }

      if (stakingInfo.staker.toLowerCase() !== account.address.toLowerCase()) {
        throw new Error('该 NFT 不是您质押的，无法解除质押');
      }

      // 检查是否满足最小质押时间
      const publicClient = createPublicClientWithRetry();
      const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
      const currentTime = Number(currentBlock.timestamp);
      const stakingDuration = currentTime - stakingInfo.startTime;
      const minStakeDuration = 7 * 24 * 60 * 60; // 7 天（秒）
      
      if (stakingDuration < minStakeDuration) {
        const remainingTime = minStakeDuration - stakingDuration;
        const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60));
        throw new Error(`质押时间不足，至少需要质押 7 天。还需等待约 ${remainingDays} 天`);
      }
      
      const hash = await walletClient.writeContract({
        address: NFT_STAKING_ADDRESS as `0x${string}`,
        abi: NFT_STAKING_ABI,
        functionName: 'unstakeNFT',
        args: [BigInt(tokenId)]
      });
      
      console.log('[NFT Staking] 解除质押成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Staking] 解除质押失败:', error);
      
      // 提供更友好的错误信息
      if (error.message?.includes('Not your staking') || 
          error.message?.includes('不是您质押的')) {
        throw new Error('该 NFT 不是您质押的，无法解除质押');
      }
      if (error.message?.includes('Not staked') || error.message?.includes('未质押')) {
        throw new Error('该 NFT 未质押或已解除质押');
      }
      if (error.message?.includes('Too early') || error.message?.includes('时间不足')) {
        throw error;
      }
      
      throw error;
    }
  },

  /**
   * 领取奖励
   */
  async claimRewards(tokenId: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const account = walletClient.account;
      if (!account) {
        throw new Error('无法获取账户信息');
      }

      // 检查质押信息，确保是用户自己质押的
      const stakingInfo = await this.getStakingInfo(tokenId);
      if (!stakingInfo || stakingInfo.status !== 'active') {
        throw new Error('该 NFT 未质押或已解除质押');
      }

      if (stakingInfo.staker.toLowerCase() !== account.address.toLowerCase()) {
        throw new Error('该 NFT 不是您质押的，无法领取奖励');
      }

      const hash = await walletClient.writeContract({
        address: NFT_STAKING_ADDRESS as `0x${string}`,
        abi: NFT_STAKING_ABI,
        functionName: 'claimRewards',
        args: [BigInt(tokenId)]
      });
      
      console.log('[NFT Staking] 领取奖励成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Staking] 领取奖励失败:', error);
      
      // 提供更友好的错误信息
      if (error.message?.includes('Not your staking') || 
          error.message?.includes('不是您质押的')) {
        throw new Error('该 NFT 不是您质押的，无法领取奖励');
      }
      if (error.message?.includes('Not staked') || error.message?.includes('未质押')) {
        throw new Error('该 NFT 未质押或已解除质押');
      }
      if (error.message?.includes('No rewards') || error.message?.includes('没有奖励')) {
        throw new Error('当前没有可领取的奖励');
      }
      
      throw error;
    }
  },

  /**
   * 获取质押信息
   */
  async getStakingInfo(tokenId: string): Promise<NFTStaking | null> {
    try {
      const publicClient = createPublicClientWithRetry();
      
      const result = await cachedReadContract(
        NFT_STAKING_ADDRESS,
        'getStakingInfo',
        [tokenId],
        () => publicClient.readContract({
          address: NFT_STAKING_ADDRESS as `0x${string}`,
          abi: NFT_STAKING_ABI,
          functionName: 'getStakingInfo',
          args: [BigInt(tokenId)]
        }),
        20000 // 质押信息缓存 20 秒
      ) as [string, bigint, bigint];
      
      if (!result[0] || result[0] === '0x0000000000000000000000000000000000000000') {
        return null;
      }
      
      return {
        id: `staking_${tokenId}`,
        staker: result[0],
        startTime: Number(result[1]),
        claimedRewards: formatEther(result[2]),
        status: 'active'
      } as NFTStaking;
    } catch (error) {
      console.error('[NFT Staking] 获取质押信息失败:', error);
      return null;
    }
  }
};

// NFT Loan 服务
export const nftLoanService = {
  /**
   * 授权借贷合约转移 NFT
   */
  async approveLoan(tokenId: string, nftContractAddress?: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const nftAddress = (nftContractAddress || (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330') as `0x${string}`;
      
      // 授权借贷合约可以转移这个特定的 NFT
      const hash = await walletClient.writeContract({
        address: nftAddress,
        abi: ERC721_APPROVE_ABI,
        functionName: 'approve',
        args: [NFT_LOAN_ADDRESS as `0x${string}`, BigInt(tokenId)]
      });
      
      console.log('[NFT Loan] 授权成功:', hash);
      return hash;
    } catch (error) {
      console.error('[NFT Loan] 授权失败:', error);
      throw error;
    }
  },

  /**
   * 创建借贷
   * @param tokenId NFT Token ID
   * @param loanAmount 借贷金额（ETH）
   * @param durationDays 借贷期限（天数，7-365天）
   */
  async createLoan(tokenId: string, loanAmount: string, durationDays: number): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const amount = parseEther(loanAmount);
      
      // 验证期限范围（7-365天）
      if (durationDays < 7 || durationDays > 365) {
        throw new Error('借贷期限必须在 7-365 天之间');
      }
      
      // 将天数转换为秒数（合约需要秒数）
      // 1 天 = 24 * 60 * 60 = 86400 秒
      const durationInSeconds = durationDays * 24 * 60 * 60;
      
      const hash = await walletClient.writeContract({
        address: NFT_LOAN_ADDRESS as `0x${string}`,
        abi: NFT_LOAN_ABI,
        functionName: 'createLoan',
        args: [BigInt(tokenId), amount, BigInt(durationInSeconds)]
      });
      
      console.log('[NFT Loan] 创建借贷成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Loan] 创建借贷失败:', error);
      
      // 提供更友好的错误信息
      if (error.message?.includes('Invalid duration')) {
        throw new Error('借贷期限无效。期限必须在 7-365 天之间。');
      }
      if (error.message?.includes('Not the owner')) {
        throw new Error('您不是该 NFT 的所有者，无法创建借贷。');
      }
      if (error.message?.includes('0x177e802f') ||
          error.message?.includes('caller is not token owner or approved') ||
          error.message?.includes('ERC721InsufficientApproval')) {
        throw new Error('需要先授权借贷合约才能创建借贷。请先点击"授权"按钮。');
      }
      
      throw error;
    }
  },

  /**
   * 出借资金（自动获取借贷金额）
   */
  async fulfillLoan(loanId: string, amount?: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      const publicClient = createPublicClientWithRetry();
      
      // 获取账户余额和地址
      const account = walletClient.account;
      if (!account) {
        throw new Error('无法获取账户信息');
      }
      const accountBalance = await cachedGetBalance(
        account.address,
        () => publicClient.getBalance({ address: account.address })
      );
      
      // 获取借贷信息以获取借贷金额
      const loanInfo = await this.getLoanInfo(loanId);
      if (!loanInfo) {
        throw new Error('借贷不存在');
      }
      
      if (loanInfo.status === 'repaid') {
        throw new Error('该借贷已还款，无法出资');
      }
      
      // 获取借贷金额（带缓存）
      const loanData = await cachedReadContract(
        NFT_LOAN_ADDRESS,
        'loans',
        [loanId.toString()],
        () => publicClient.readContract({
          address: NFT_LOAN_ADDRESS as `0x${string}`,
          abi: [
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
        ],
        functionName: 'loans',
        args: [BigInt(loanId)]
        }) as any,
        30000 // 借贷信息缓存 30 秒
      ) as any;
      
      const loanAmount = loanData[3] as bigint;
      const lender = loanData[1] as string;
      
      // 检查是否已有贷款人
      if (lender && lender !== '0x0000000000000000000000000000000000000000') {
        throw new Error('该借贷已有贷款人出资');
      }
      
      // 使用用户提供的金额或自动使用借贷金额
      const value = amount ? parseEther(amount) : loanAmount;
      
      // 确保支付金额足够
      if (value < loanAmount) {
        throw new Error(`出资金额不足。需要至少 ${formatEther(loanAmount)} ETH，您提供了 ${amount || formatEther(loanAmount)} ETH。`);
      }
      
      // 估算 gas 费用
      try {
        const gasEstimate = await publicClient.estimateGas({
          account: account.address,
          to: NFT_LOAN_ADDRESS as `0x${string}`,
          value: loanAmount,
          data: encodeFunctionData({
            abi: NFT_LOAN_ABI,
            functionName: 'fulfillLoan',
            args: [BigInt(loanId)]
          })
        });
        
        const gasPrice = await publicClient.getGasPrice();
        const estimatedGasCost = gasEstimate * gasPrice;
        const totalCost = loanAmount + estimatedGasCost;
        
        // 检查余额是否足够（包括 gas 费用）
        if (accountBalance < totalCost) {
          const balanceEth = formatEther(accountBalance);
          const neededEth = formatEther(totalCost);
          const loanAmountEth = formatEther(loanAmount);
          const gasCostEth = formatEther(estimatedGasCost);
          
          throw new Error(
            `余额不足！出资需要 ${loanAmountEth} ETH，预计 gas 费用约 ${gasCostEth} ETH，总计约 ${neededEth} ETH。` +
            `您的账户余额为 ${balanceEth} ETH。请先充值 ETH 到账户。`
          );
        }
      } catch (gasError: any) {
        // 如果 gas 估算失败，仍然尝试执行，但给出警告
        console.warn('[NFT Loan] Gas 估算失败，继续执行:', gasError);
        // 简单检查：余额至少要大于借贷金额 + 0.001 ETH（预估 gas）
        const minRequired = loanAmount + parseEther('0.001');
        if (accountBalance < minRequired) {
          throw new Error(
            `余额可能不足。出资需要 ${formatEther(loanAmount)} ETH，预计还需要约 0.001 ETH 作为 gas 费用。` +
            `您的账户余额为 ${formatEther(accountBalance)} ETH。请确保余额充足。`
          );
        }
      }
      
      const hash = await walletClient.writeContract({
        address: NFT_LOAN_ADDRESS as `0x${string}`,
        abi: NFT_LOAN_ABI,
        functionName: 'fulfillLoan',
        args: [BigInt(loanId)],
        value: loanAmount // 使用准确的借贷金额，多余部分会自动退还
      });
      
      console.log('[NFT Loan] 出借成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Loan] 出借失败:', error);
      
      // 提供更友好的错误信息
      if (error.message?.includes('余额不足') || 
          error.message?.includes('insufficient funds') ||
          error.message?.includes('exceeds the balance')) {
        throw error;
      }
      if (error.message?.includes('金额不足') || error.message?.includes('Insufficient')) {
        throw error;
      }
      if (error.message?.includes('already fulfilled')) {
        throw new Error('该借贷已有贷款人出资。');
      }
      if (error.message?.includes('Loan not active')) {
        throw new Error('该借贷已失效。');
      }
      
      throw error;
    }
  },

  /**
   * 还款（自动获取还款金额）
   */
  async repayLoan(loanId: string, amount?: string): Promise<string> {
    try {
      const walletClient = getWalletClient();
      
      // 获取借贷信息以获取还款金额
      const loanInfo = await this.getLoanInfo(loanId);
      if (!loanInfo) {
        throw new Error('借贷不存在或已被还款');
      }
      
      if (loanInfo.status === 'repaid') {
        throw new Error('该借贷已还款');
      }
      
      // 计算还款金额（本金 + 利息）
      // 需要从合约获取 repaymentAmount，这里我们从事件或通过估算
      // 为了准确，我们需要读取合约的 repaymentAmount（带缓存）
      const publicClient = createPublicClientWithRetry();
      const loanData = await cachedReadContract(
        NFT_LOAN_ADDRESS,
        'loans',
        [loanId.toString()],
        () => publicClient.readContract({
          address: NFT_LOAN_ADDRESS as `0x${string}`,
          abi: [
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
        ],
        functionName: 'loans',
        args: [BigInt(loanId)]
        }) as any,
        30000 // 借贷信息缓存 30 秒
      ) as any;
      
      const repaymentAmount = loanData[7] as bigint; // repaymentAmount
      
      // 使用用户提供的金额或自动使用还款金额
      const value = amount ? parseEther(amount) : repaymentAmount;
      
      // 确保支付金额足够
      if (value < repaymentAmount) {
        throw new Error(`还款金额不足。需要至少 ${formatEther(repaymentAmount)} ETH，您提供了 ${amount || formatEther(repaymentAmount)} ETH。`);
      }
      
      const hash = await walletClient.writeContract({
        address: NFT_LOAN_ADDRESS as `0x${string}`,
        abi: NFT_LOAN_ABI,
        functionName: 'repayLoan',
        args: [BigInt(loanId)],
        value: repaymentAmount // 使用准确的还款金额
      });
      
      console.log('[NFT Loan] 还款成功:', hash);
      return hash;
    } catch (error: any) {
      console.error('[NFT Loan] 还款失败:', error);
      
      if (error.message?.includes('金额不足') || error.message?.includes('Insufficient')) {
        throw error;
      }
      if (error.message?.includes('Not the borrower')) {
        throw new Error('您不是该借贷的借款人，无法还款。');
      }
      if (error.message?.includes('Already repaid')) {
        throw new Error('该借贷已还款。');
      }
      if (error.message?.includes('Loan not fulfilled')) {
        throw new Error('该借贷尚未有贷款人出资，无法还款。');
      }
      
      throw error;
    }
  },

  /**
   * 获取借贷信息
   */
  async getLoanInfo(loanId: string): Promise<NFTLoan | null> {
    try {
      const publicClient = createPublicClientWithRetry();
      
      // 获取完整借贷信息（带缓存）
      const loanData = await cachedReadContract(
        NFT_LOAN_ADDRESS,
        'loans',
        [loanId.toString()],
        () => publicClient.readContract({
          address: NFT_LOAN_ADDRESS as `0x${string}`,
          abi: [
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
        ],
        functionName: 'loans',
        args: [BigInt(loanId)]
        }) as any,
        30000 // 借贷信息缓存 30 秒
      ) as any;
      
      if (!loanData[0] || loanData[0] === '0x0000000000000000000000000000000000000000') {
        return null;
      }
      
      return {
        id: `loan_${loanId}`,
        borrower: loanData[0] as string,
        lender: loanData[1] as string,
        loanAmount: formatEther(loanData[3] as bigint),
        dueDate: Number(loanData[6] as bigint),
        status: (loanData[9] as boolean) ? 'repaid' : 'active',
        repaymentAmount: formatEther(loanData[7] as bigint),
        tokenId: loanData[2].toString(),
      } as NFTLoan & { repaymentAmount?: string; tokenId?: string };
    } catch (error) {
      console.error('[NFT Loan] 获取借贷信息失败:', error);
      return null;
    }
  },

  /**
   * 获取用户创建的借贷列表
   */
  async getMyLoans(userAddress: string): Promise<Array<NFTLoan & { loanId: string; repaymentAmount?: string; tokenId?: string }>> {
    try {
      const publicClient = createPublicClientWithRetry();
      
      // 查询 LoanCreated 事件来找到用户创建的借贷
      const events = await publicClient.getLogs({
        address: NFT_LOAN_ADDRESS as `0x${string}`,
        event: {
          type: 'event',
          name: 'LoanCreated',
          inputs: [
            { type: 'uint256', indexed: true, name: 'loanId' },
            { type: 'address', indexed: true, name: 'borrower' },
            { type: 'uint256', indexed: true, name: 'tokenId' },
            { type: 'uint256', indexed: false, name: 'loanAmount' },
            { type: 'uint256', indexed: false, name: 'duration' },
          ],
        },
        args: {
          borrower: userAddress as `0x${string}`,
        },
        fromBlock: 0n,
      });

      const myLoans: Array<NFTLoan & { loanId: string; repaymentAmount?: string; tokenId?: string }> = [];
      
      // 并行获取每个借贷的详细信息
      const loanPromises = events.map(async (event) => {
        const loanId = (event.args.loanId as bigint).toString();
        const loanInfo = await this.getLoanInfo(loanId);
        if (loanInfo) {
          return { ...loanInfo, loanId };
        }
        return null;
      });
      
      const loans = await Promise.all(loanPromises);
      myLoans.push(...loans.filter((loan): loan is NFTLoan & { loanId: string; repaymentAmount?: string; tokenId?: string } => loan !== null));
      
      // 按 loanId 倒序排列（最新的在前）
      myLoans.sort((a, b) => parseInt(b.loanId) - parseInt(a.loanId));
      
      return myLoans;
    } catch (error) {
      console.error('[NFT Loan] 获取我的借贷列表失败:', error);
      return [];
    }
  }
};

