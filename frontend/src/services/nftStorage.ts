import { NFT } from '../types';
import { cachedGetBlockNumber } from './rpcCache';

const NFT_CACHE_KEY_PREFIX = 'nft_cache_';
const NFT_LAST_BLOCK_KEY_PREFIX = 'nft_last_block_';

export interface NFTCacheData {
  address: string;
  nfts: NFT[];
  lastUpdated: number;
  lastBlockNumber: bigint; // 上次查询的区块号
  balance: number; // 当时的余额
}

// 存储 NFT 缓存
export const saveNFTCache = (address: string, nfts: NFT[], lastBlockNumber: bigint, balance: number): void => {
  try {
    const key = `${NFT_CACHE_KEY_PREFIX}${address.toLowerCase()}`;
    
    // 将 lastBlockNumber 转换为字符串存储
    const serializableData = {
      address: address.toLowerCase(),
      nfts,
      lastUpdated: Date.now(),
      lastBlockNumber: lastBlockNumber.toString(),
      balance,
    };
    
    localStorage.setItem(key, JSON.stringify(serializableData));
    console.log(`[NFT Storage] 已保存 ${nfts.length} 个 NFT 到缓存`);
  } catch (error) {
    console.error('[NFT Storage] 保存 NFT 缓存失败:', error);
  }
};

// 获取 NFT 缓存
export const getNFTCache = (address: string): NFTCacheData | null => {
  try {
    const key = `${NFT_CACHE_KEY_PREFIX}${address.toLowerCase()}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        lastBlockNumber: BigInt(parsed.lastBlockNumber || '0'),
      };
    }
    return null;
  } catch (error) {
    console.error('[NFT Storage] 读取 NFT 缓存失败:', error);
    return null;
  }
};

// 获取上次查询的区块号
export const getLastBlockNumber = (address: string): bigint | null => {
  try {
    const key = `${NFT_LAST_BLOCK_KEY_PREFIX}${address.toLowerCase()}`;
    const blockStr = localStorage.getItem(key);
    if (blockStr) {
      return BigInt(blockStr);
    }
    return null;
  } catch (error) {
    console.error('[NFT Storage] 读取上次区块号失败:', error);
    return null;
  }
};

// 保存上次查询的区块号
export const saveLastBlockNumber = (address: string, blockNumber: bigint): void => {
  try {
    const key = `${NFT_LAST_BLOCK_KEY_PREFIX}${address.toLowerCase()}`;
    localStorage.setItem(key, blockNumber.toString());
  } catch (error) {
    console.error('[NFT Storage] 保存上次区块号失败:', error);
  }
};

// 检查是否有新的 Transfer 事件（只查询自上次查询后的新区块）
export const checkForNewTransfers = async (
  address: string,
  fromBlock: bigint,
  publicClient: any
): Promise<boolean> => {
  try {
    const NFT_CONTRACT_ADDRESS = (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330';
    
    // 获取当前区块号（带缓存）
    const currentBlock = await cachedGetBlockNumber(() => publicClient.getBlockNumber());
    
    // 如果 fromBlock 大于等于当前区块，说明没有新区块
    if (fromBlock >= currentBlock) {
      return false;
    }
    
    // 查询自上次查询后的 Transfer 事件
    const transferEvents = await publicClient.getLogs({
      address: NFT_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: true, name: 'tokenId' },
        ],
      },
      args: {
        from: address as `0x${string}`,
      },
      fromBlock,
      toBlock: currentBlock,
    });
    
    const receivedEvents = await publicClient.getLogs({
      address: NFT_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: true, name: 'tokenId' },
        ],
      },
      args: {
        to: address as `0x${string}`,
      },
      fromBlock,
      toBlock: currentBlock,
    });
    
    // 如果有新事件，返回 true
    return transferEvents.length > 0 || receivedEvents.length > 0;
  } catch (error) {
    console.error('[NFT Storage] 检查新 Transfer 事件失败:', error);
    // 出错时返回 true，强制刷新
    return true;
  }
};

