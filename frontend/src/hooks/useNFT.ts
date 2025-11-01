import { useState, useCallback } from 'react';
import { NFT } from '../types';
import { createPublicClientWithRetry } from '../services/rpcClient';
import { saveNFTCache, getNFTCache, saveLastBlockNumber, getLastBlockNumber, checkForNewTransfers } from '../services/nftStorage';
import { cachedReadContract, cachedGetBlockNumber } from '../services/rpcCache';

const NFT_CONTRACT_ADDRESS = (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330';

// ERC721 ABI
const ERC721_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// 使用带重试和 RPC 切换的公共客户端
const publicClient = createPublicClientWithRetry();

export const useNFT = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取用户拥有的 NFT 数量（带缓存）
  const fetchBalance = useCallback(async (address: string): Promise<number> => {
    try {
      const balance = await cachedReadContract(
        NFT_CONTRACT_ADDRESS,
        'balanceOf',
        [address],
        () => publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        })
      );
      return Number(balance);
    } catch (err) {
      console.error('获取 NFT 数量失败:', err);
      return 0;
    }
  }, []);

  // 检查 tokenId 是否属于指定地址（带缓存）
  const checkOwnership = useCallback(async (tokenId: bigint, address: string): Promise<boolean> => {
    try {
      const owner = await cachedReadContract(
        NFT_CONTRACT_ADDRESS,
        'ownerOf',
        [tokenId.toString()],
        () => publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        })
      );
      return owner.toLowerCase() === address.toLowerCase();
    } catch (err) {
      return false;
    }
  }, []);

  // 获取 NFT 元数据（带缓存，缓存时间较长）
  const fetchTokenURI = useCallback(async (tokenId: bigint): Promise<string | null> => {
    try {
      const uri = await cachedReadContract(
        NFT_CONTRACT_ADDRESS,
        'tokenURI',
        [tokenId.toString()],
        () => publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }),
        300000 // tokenURI 缓存 5 分钟（元数据很少变化）
      );
      return uri as string;
    } catch (err) {
      console.error(`获取 Token ${tokenId} URI 失败:`, err);
      return null;
    }
  }, []);

  // 通过事件日志查询用户拥有的 NFT（优化版本，并行处理）
  const fetchMyNFTsFromEvents = useCallback(async (address: string): Promise<bigint[]> => {
    try {
      // 并行查询接收和转出事件
      const [transferEvents, sentEvents] = await Promise.all([
        publicClient.getLogs({
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
          fromBlock: 0n,
        }),
        publicClient.getLogs({
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
          fromBlock: 0n,
        }),
      ]);

      // 使用 Map 来跟踪每个 tokenId 的最终状态
      const tokenStates = new Map<bigint, { received: number; sent: number }>();

      // 处理接收事件
      for (const event of transferEvents) {
        if (event.args && event.args.tokenId !== undefined) {
          const tokenId = BigInt(event.args.tokenId as string | number | bigint);
          const state = tokenStates.get(tokenId) || { received: 0, sent: 0 };
          state.received++;
          tokenStates.set(tokenId, state);
        }
      }

      // 处理转出事件
      for (const event of sentEvents) {
        if (event.args && event.args.tokenId !== undefined) {
          const tokenId = BigInt(event.args.tokenId as string | number | bigint);
          const state = tokenStates.get(tokenId) || { received: 0, sent: 0 };
          state.sent++;
          tokenStates.set(tokenId, state);
        }
      }

      // 找出仍然拥有的 tokenId（接收次数 > 转出次数）
      const candidateTokens: bigint[] = [];
      for (const [tokenId, state] of tokenStates.entries()) {
        if (state.received > state.sent) {
          candidateTokens.push(tokenId);
        }
      }

      // 批量验证所有权（并行处理，批次大小 20）
      const ownedTokens: bigint[] = [];
      const verifyBatchSize = 20;
      
      for (let i = 0; i < candidateTokens.length; i += verifyBatchSize) {
        const batch = candidateTokens.slice(i, i + verifyBatchSize);
        const verificationResults = await Promise.all(
          batch.map(tokenId => checkOwnership(tokenId, address))
        );
        
        batch.forEach((tokenId, index) => {
          if (verificationResults[index]) {
            ownedTokens.push(tokenId);
          }
        });
      }

      return ownedTokens;
    } catch (err) {
      console.error('通过事件查询 NFT 失败:', err);
      return [];
    }
  }, [checkOwnership]);

  // 获取用户拥有的所有 NFT（带缓存优化）
  const fetchMyNFTs = useCallback(async (address: string, forceRefresh: boolean = false) => {
    if (!address) {
      setNfts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 获取当前区块号（带缓存）
      const currentBlock = await cachedGetBlockNumber(() => publicClient.getBlockNumber());
      
      // 获取缓存数据
      const cachedData = getNFTCache(address);
      const lastBlock = cachedData?.lastBlockNumber || getLastBlockNumber(address);
      
      // 如果不是强制刷新，尝试使用缓存
      if (!forceRefresh && cachedData && cachedData.nfts.length > 0) {
        // 检查是否有新的 Transfer 事件（只查询自上次查询后的新区块）
        const fromBlock = lastBlock || (currentBlock - 100n); // 如果没有上次区块，查询最近 100 个区块
        const hasNewTransfers = await checkForNewTransfers(address, fromBlock, publicClient);
        
        // 如果没有新事件且余额没变化，直接使用缓存
        if (!hasNewTransfers) {
          const currentBalance = await fetchBalance(address);
          
          // 如果余额没变化，直接使用缓存
          if (currentBalance === cachedData.balance) {
            console.log('[NFT] 使用缓存数据，没有新的 Transfer 事件');
            setNfts(cachedData.nfts);
            setIsLoading(false);
            // 更新最后区块号
            saveLastBlockNumber(address, currentBlock);
            return;
          }
        }
      }

      // 获取用户拥有的 NFT 数量
      const balance = await fetchBalance(address);
      
      if (balance === 0) {
        setNfts([]);
        saveNFTCache(address, [], currentBlock, 0);
        saveLastBlockNumber(address, currentBlock);
        setIsLoading(false);
        return;
      }

      // 优先使用事件查询（更快），如果没有结果再手动检查
      console.log('开始查询 NFT...');
      let ownedTokenIds: bigint[] = [];
      
      // 如果是强制刷新，从区块 0 开始完整查询；否则使用增量查询
      if (forceRefresh) {
        // 强制刷新：完整查询所有事件
        console.log('[NFT] 强制刷新模式：完整查询所有 NFT');
        try {
          ownedTokenIds = await fetchMyNFTsFromEvents(address);
          console.log(`[NFT] 通过完整事件查询找到 ${ownedTokenIds.length} 个 NFT`);
        } catch (err) {
          console.warn('[NFT] 完整事件查询失败，改用手动检查:', err);
        }
      } else {
        // 非强制刷新：使用增量查询（从上次区块开始）
        const queryFromBlock = lastBlock ? lastBlock : 0n;
        
        try {
          if (lastBlock && lastBlock > 0n) {
            // 只查询新区块的事件
            const [transferEvents, receivedEvents] = await Promise.all([
              publicClient.getLogs({
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
                fromBlock: queryFromBlock,
                toBlock: currentBlock,
              }),
              publicClient.getLogs({
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
                fromBlock: queryFromBlock,
                toBlock: currentBlock,
              }),
            ]);
            
            // 如果有缓存，合并缓存和新事件的结果
            if (cachedData && cachedData.nfts.length > 0) {
              // 从缓存中获取已有的 tokenId
              const cachedTokenIds = new Set(cachedData.nfts.map(nft => BigInt(nft.tokenId)));
              
              // 处理新事件
              const newTokenIds = new Set<bigint>();
              
              // 处理接收事件
              for (const event of receivedEvents) {
                if (event.args && event.args.tokenId !== undefined) {
                  newTokenIds.add(BigInt(event.args.tokenId as string | number | bigint));
                }
              }
              
              // 处理转出事件（从集合中移除）
              for (const event of transferEvents) {
                if (event.args && event.args.tokenId !== undefined) {
                  cachedTokenIds.delete(BigInt(event.args.tokenId as string | number | bigint));
                }
              }
              
              // 合并结果：保留缓存中未被转出的 + 新接收的
              ownedTokenIds = Array.from(new Set([...cachedTokenIds, ...newTokenIds]));
              console.log(`[NFT] 从缓存和新区块事件合并得到 ${ownedTokenIds.length} 个 NFT`);
            } else {
              // 没有缓存，使用完整的事件查询
              ownedTokenIds = await fetchMyNFTsFromEvents(address);
              console.log(`通过事件查询找到 ${ownedTokenIds.length} 个 NFT`);
            }
          } else {
            // 没有上次区块，使用完整查询
            ownedTokenIds = await fetchMyNFTsFromEvents(address);
            console.log(`通过事件查询找到 ${ownedTokenIds.length} 个 NFT`);
          }
        } catch (err) {
          console.warn('事件查询失败，改用手动检查:', err);
        }
      }

      // 如果事件查询没找到，或者找到的数量少于 balance，使用手动检查作为补充
      if (ownedTokenIds.length === 0 || ownedTokenIds.length < balance) {
        console.log('使用手动检查补充...');
        const maxCheck = 100; // 减少检查范围到 100 个
        const batchSize = 30; // 增加批次大小到 30 个，提高并发
        const manualCheckResults: bigint[] = [];
        
        for (let i = 0; i < maxCheck; i += batchSize) {
          const batchPromises: Promise<bigint | null>[] = [];
          
          for (let j = i; j < Math.min(i + batchSize, maxCheck); j++) {
            batchPromises.push(
              (async () => {
                try {
                  const tokenId = BigInt(j);
                  const isOwner = await checkOwnership(tokenId, address);
                  return isOwner ? tokenId : null;
                } catch (err) {
                  return null;
                }
              })()
            );
          }
          
          const batchResults = await Promise.all(batchPromises);
          manualCheckResults.push(...batchResults.filter((id): id is bigint => id !== null));
          
          // 如果已经找到了 balance 数量的 NFT，提前结束
          if (manualCheckResults.length >= balance) {
            break;
          }
        }
        
        // 合并事件查询和手动检查的结果
        const allTokenIds = new Set([...ownedTokenIds, ...manualCheckResults]);
        ownedTokenIds = Array.from(allTokenIds);
      }

      if (ownedTokenIds.length === 0) {
        setNfts([]);
        saveNFTCache(address, [], currentBlock, balance);
        saveLastBlockNumber(address, currentBlock);
        setIsLoading(false);
        return;
      }

      // 并行获取所有 NFT 的详细信息（批次处理，每批 20 个）
      const ownedNFTs: NFT[] = [];
      const detailsBatchSize = 20;
      
      for (let i = 0; i < ownedTokenIds.length; i += detailsBatchSize) {
        const batch = ownedTokenIds.slice(i, i + detailsBatchSize);
        
        const batchNFTs = await Promise.all(
          batch.map(async (tokenId) => {
            try {
              // 如果是强制刷新，不使用缓存，直接获取新信息
              if (!forceRefresh && cachedData && cachedData.nfts.length > 0) {
                const cachedNFT = cachedData.nfts.find(nft => nft.tokenId === tokenId.toString());
                
                // 如果缓存中有，快速验证所有权后使用缓存
                if (cachedNFT) {
                  // 快速验证所有权（确保 NFT 还在）
                  try {
                    const isOwner = await checkOwnership(tokenId, address);
                    if (isOwner) {
                      return cachedNFT;
                    }
                  } catch (err) {
                    // 验证失败，继续获取新信息
                    console.debug(`验证 Token ${tokenId} 所有权失败，获取新信息`);
                  }
                }
              }
              
              // 强制刷新或缓存中没有或验证失败，获取新信息
              const [uri] = await Promise.all([
                fetchTokenURI(tokenId).catch(() => null)
              ]);
              
              // 使用 SVG 数据 URI 作为默认图片
              const defaultImage = `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
                  <rect width="300" height="300" fill="#e5e7eb"/>
                  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">NFT #${tokenId.toString()}</text>
                </svg>
              `)}`;
              
              return {
                id: `nft_${tokenId.toString()}`,
                tokenId: tokenId.toString(),
                contractAddress: NFT_CONTRACT_ADDRESS,
                name: `NFT #${tokenId.toString()}`,
                description: `Token ID: ${tokenId.toString()}`,
                image: uri || defaultImage,
                owner: address,
                listed: false,
                metadata: {
                  tokenURI: uri || '',
                },
              } as NFT;
            } catch (err) {
              console.error(`获取 Token ${tokenId} 信息失败:`, err);
              return null;
            }
          })
        );
        
        ownedNFTs.push(...batchNFTs.filter((nft): nft is NFT => nft !== null));
      }

      // 按 tokenId 排序
      ownedNFTs.sort((a, b) => {
        const aId = BigInt(a.tokenId);
        const bId = BigInt(b.tokenId);
        return aId < bId ? -1 : aId > bId ? 1 : 0;
      });

      // 保存到缓存
      saveNFTCache(address, ownedNFTs, currentBlock, balance);
      saveLastBlockNumber(address, currentBlock);

      setNfts(ownedNFTs);
    } catch (err: any) {
      console.error('获取 NFT 列表失败:', err);
      setError(err.message || '获取 NFT 列表失败');
      
      // 如果出错，尝试使用缓存
      const cachedData = getNFTCache(address);
      if (cachedData && cachedData.nfts.length > 0) {
        console.log('[NFT] 查询失败，使用缓存数据');
        setNfts(cachedData.nfts);
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkOwnership, fetchTokenURI, fetchBalance, fetchMyNFTsFromEvents]);

  return {
    nfts,
    isLoading,
    error,
    fetchMyNFTs,
    fetchBalance,
    checkOwnership,
    fetchTokenURI,
  };
};

