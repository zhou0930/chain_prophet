import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// 多个备用 RPC 端点（按优先级排序）
const RPC_ENDPOINTS = [
  // 用户自定义的 RPC
  (import.meta as any).env?.VITE_SEPOLIA_RPC_URL,
  // 公共 RPC 端点（备用）
  'https://rpc.sepolia.org',
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.gateway.tenderly.co',
].filter(Boolean) as string[];

let currentRpcIndex = 0;

/**
 * 获取当前可用的 RPC URL
 */
export const getCurrentRpcUrl = (): string => {
  return RPC_ENDPOINTS[currentRpcIndex] || RPC_ENDPOINTS[0];
};

/**
 * 切换到下一个 RPC 端点
 */
export const switchToNextRpc = (): string => {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  console.log(`切换到 RPC: ${getCurrentRpcUrl()}`);
  return getCurrentRpcUrl();
};

/**
 * 创建公共客户端（带错误处理）
 */
export const createPublicClientWithRetry = () => {
  const createClient = (rpcUrl: string) => {
    return createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl, {
        retryCount: 3,
        retryDelay: 1000,
      }),
    });
  };

  let client = createClient(getCurrentRpcUrl());

  // 包装客户端方法，添加自动切换 RPC 功能
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
              
              // 如果是速率限制错误，切换到下一个 RPC
              if (error?.message?.includes('429') || 
                  error?.status === 429 ||
                  error?.cause?.status === 429) {
                console.warn(`RPC 速率限制，切换到下一个端点 (尝试 ${attempts + 1}/${maxAttempts})`);
                
                if (attempts < maxAttempts - 1) {
                  const newRpcUrl = switchToNextRpc();
                  client = createClient(newRpcUrl);
                  target = client;
                  attempts++;
                  await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // 递增延迟
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

/**
 * 创建钱包客户端（带错误处理）
 */
export const createWalletClientWithRetry = (privateKey: string) => {
  if (!privateKey) {
    throw new Error('请配置钱包私钥 VITE_WALLET_PRIVATE_KEY');
  }

  const account = privateKeyToAccount(privateKey.trim() as `0x${string}`);
  
  const createClient = (rpcUrl: string) => {
    return createWalletClient({
      account,
      chain: sepolia,
      transport: http(rpcUrl, {
        retryCount: 3,
        retryDelay: 1000,
      }),
    });
  };

  let client = createClient(getCurrentRpcUrl());

  // 包装客户端方法，添加自动切换 RPC 功能
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
              
              // 如果是速率限制错误，切换到下一个 RPC
              if (error?.message?.includes('429') || 
                  error?.status === 429 ||
                  error?.cause?.status === 429 ||
                  error?.response?.status === 429) {
                console.warn(`RPC 速率限制，切换到下一个端点 (尝试 ${attempts + 1}/${maxAttempts})`);
                
                if (attempts < maxAttempts - 1) {
                  const newRpcUrl = switchToNextRpc();
                  client = createClient(newRpcUrl);
                  target = client;
                  attempts++;
                  await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // 递增延迟
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

