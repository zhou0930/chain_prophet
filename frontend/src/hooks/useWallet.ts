import { useState, useCallback, useEffect } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { saveTransactions, getStoredTransactions, mergeTransactions, saveBalanceHistory, saveLastBalance, getLastBalance, hasBalanceChanged, saveCalculatedBalanceHistory } from '../services/walletStorage';

const SEPOLIA_RPC_URL = (import.meta as any).env?.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/443ab1c362d646dcaa353c5b653c8173';
const PRIVATE_KEY = (import.meta as any).env?.VITE_WALLET_PRIVATE_KEY || '';
const ETHERSCAN_API_KEY = (import.meta as any).env?.VITE_ETHERSCAN_API_KEY || ''; // 可选，用于提高速率限制

// 创建公共客户端
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL),
});

export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  timestamp: number;
  blockNumber: bigint;
  status: 'success' | 'failed' | 'pending';
  isIncoming?: boolean; // 是否为接收交易
  gasUsed?: bigint | null;
  gasPrice?: bigint | null;
}

export const useWallet = () => {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从私钥推导地址
  useEffect(() => {
    if (PRIVATE_KEY && PRIVATE_KEY.trim()) {
      try {
        const account = privateKeyToAccount(PRIVATE_KEY.trim() as `0x${string}`);
        setAddress(account.address);
      } catch (err) {
        console.error('私钥格式错误:', err);
        setError('私钥格式错误，请检查环境变量 VITE_WALLET_PRIVATE_KEY');
      }
    }
  }, []);

  // 查询余额
  const fetchBalance = useCallback(async (walletAddress?: string): Promise<{ balance: string; hasChanged: boolean } | null> => {
    const targetAddress = walletAddress || address;
    if (!targetAddress) {
      setError('请先配置钱包地址或私钥');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balance = await publicClient.getBalance({
        address: targetAddress as `0x${string}`,
      });
      const balanceStr = formatEther(balance);
      
      // 获取上次余额并比较
      const lastBalance = getLastBalance(targetAddress);
      const changed = hasBalanceChanged(lastBalance, balanceStr);
      
      // 更新余额
      setBalance(balanceStr);
      
      // 保存当前余额作为上次余额
      saveLastBalance(targetAddress, balanceStr);
      
      // 保存余额历史
      saveBalanceHistory(targetAddress, balanceStr);
      
      // 如果余额变化，更新计算好的历史余额点
      if (changed) {
        const storedTransactions = getStoredTransactions(targetAddress);
        if (storedTransactions.length > 0) {
          saveCalculatedBalanceHistory(targetAddress, balanceStr, storedTransactions);
        }
      }
      
      console.log(`[Wallet] 余额查询完成: ${balanceStr} ETH, 是否有变化: ${changed}`);
      
      return { balance: balanceStr, hasChanged: changed };
    } catch (err) {
      console.error('查询余额失败:', err);
      setError(err instanceof Error ? err.message : '查询余额失败');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // 查询最近的交易
  const fetchTransactions = useCallback(async (walletAddress?: string, limit: number = 20, force: boolean = false) => {
    const targetAddress = walletAddress || address;
    if (!targetAddress) {
      setError('请先配置钱包地址或私钥');
      return;
    }

    // 如果不是强制刷新，先检查余额是否有变化
    if (!force) {
      const lastBalance = getLastBalance(targetAddress);
      const currentBalance = balance;
      if (lastBalance && !hasBalanceChanged(lastBalance, currentBalance)) {
        console.log('[Wallet] 余额未变化，跳过交易记录查询');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // 使用 Etherscan API V2 获取交易历史
      // Sepolia 测试网的 chainid 是 11155111
      // API 文档: https://docs.etherscan.io/
      if (!ETHERSCAN_API_KEY) {
        setError('请配置 VITE_ETHERSCAN_API_KEY 以查询交易记录');
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      // Etherscan API V2 统一端点，使用 chainid 参数指定链
      // chainid: 11155111 表示 Sepolia 测试网
      const apiUrl = `https://api.etherscan.io/v2/api?module=account&action=txlist&chainid=11155111&address=${targetAddress}&startblock=0&endblock=99999999&sort=desc&page=1&offset=${limit}&apikey=${ETHERSCAN_API_KEY}`;
      
      console.log('[Wallet] 查询交易记录:', targetAddress);
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('[Wallet] Etherscan API 响应:', data);

      // 检查 API 响应状态
      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        // 解析交易数据
        const parsedTransactions: Transaction[] = data.result
          .filter((tx: any) => tx.hash && tx.blockNumber) // 过滤掉无效交易
          .map((tx: any) => {
            // 判断交易方向（to 地址与目标地址相同则为接收）
            const isIncoming = tx.to?.toLowerCase() === targetAddress.toLowerCase();
            
            // 判断交易状态
            // txreceipt_status: "1" = 成功, "0" = 失败, null = pending
            let status: 'success' | 'failed' | 'pending' = 'pending';
            if (tx.txreceipt_status === '1') {
              status = 'success';
            } else if (tx.txreceipt_status === '0') {
              status = 'failed';
            } else if (tx.isError === '1') {
              status = 'failed';
            } else if (tx.blockNumber && tx.blockNumber !== '0') {
              status = 'success'; // 有区块号但没状态，默认成功
            }
            
            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to || null,
              value: formatEther(BigInt(tx.value || '0')),
              timestamp: parseInt(tx.timeStamp || '0'),
              blockNumber: BigInt(tx.blockNumber || '0'),
              status,
              isIncoming,
              gasUsed: tx.gasUsed ? BigInt(tx.gasUsed) : null,
              gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : null,
            };
          });
        
        console.log(`[Wallet] 解析到 ${parsedTransactions.length} 笔交易`);
        
        // 获取存储的交易记录并合并
        const storedTransactions = getStoredTransactions(targetAddress);
        const mergedTransactions = mergeTransactions(storedTransactions, parsedTransactions);
        
        // 保存到本地存储
        saveTransactions(targetAddress, mergedTransactions);
        
        // 如果有新交易，重新计算并保存历史余额点
        // 注意：这里使用传入的余额，因为此时 balance state 可能还没有更新
        if (mergedTransactions.length > 0) {
          // 从存储中获取最新的余额
          const lastBalance = getLastBalance(targetAddress) || balance || '0';
          saveCalculatedBalanceHistory(targetAddress, lastBalance, mergedTransactions);
        }
        
        setTransactions(mergedTransactions);
      } else if (data.status === '0') {
        // API 返回错误或无交易
        const message = data.message || data.result || '查询失败';
        console.log('[Wallet] Etherscan API 返回:', message);
        
        if (message.includes('No transactions found') || message.includes('No transaction found')) {
          // 没有交易记录是正常的
          setTransactions([]);
        } else {
          // 其他错误
          setError(`查询失败: ${message}`);
          setTransactions([]);
        }
      } else {
        // 未知响应格式
        console.warn('[Wallet] 未知的 API 响应格式:', data);
        setError('API 响应格式错误');
        setTransactions([]);
      }
    } catch (err) {
      console.error('查询交易失败:', err);
      setError(err instanceof Error ? err.message : '查询交易失败');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, balance]);

  // 刷新钱包信息
  const refresh = useCallback(async () => {
    if (address) {
      // 先查询余额
      const balanceResult = await fetchBalance(address);
      
      // 如果余额有变化，才查询交易记录
      if (balanceResult?.hasChanged) {
        console.log('[Wallet] 余额已变化，开始查询交易记录');
        await fetchTransactions(address, 20, true); // 强制刷新
      } else {
        console.log('[Wallet] 余额未变化，跳过交易记录查询');
      }
    }
  }, [address, fetchBalance, fetchTransactions]);

  // 当地址变化时自动加载存储的交易和查询余额
  useEffect(() => {
    if (address) {
      // 先加载存储的交易记录
      const storedTransactions = getStoredTransactions(address);
      if (storedTransactions.length > 0) {
        setTransactions(storedTransactions);
        console.log(`[Wallet] 加载了 ${storedTransactions.length} 笔存储的交易记录`);
      }
      
      // 先查询余额，然后根据余额是否变化决定是否查询交易记录
      fetchBalance(address).then((balanceResult) => {
        if (balanceResult?.hasChanged) {
          console.log('[Wallet] 余额已变化，开始查询交易记录');
          fetchTransactions(address, 20, true); // 强制刷新
        } else {
          console.log('[Wallet] 余额未变化，跳过交易记录查询');
        }
      });
    }
  }, [address, fetchBalance, fetchTransactions]);

  return {
    // 状态
    address,
    balance,
    transactions,
    isLoading,
    error,
    hasPrivateKey: !!PRIVATE_KEY,

    // 操作
    fetchBalance,
    fetchTransactions,
    refresh,
    setAddress,
  };
};

