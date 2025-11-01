// RPC 请求缓存服务，减少对 RPC 的访问次数和频率

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // 缓存过期时间（毫秒）
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

// 缓存存储（内存缓存）
const cache = new Map<string, CacheItem<any>>();
// 待处理的请求（用于去重）
const pendingRequests = new Map<string, PendingRequest<any>>();

// 默认缓存时间（毫秒）
const DEFAULT_CACHE_TIME = 30000; // 30秒
const BLOCK_NUMBER_CACHE_TIME = 5000; // 区块号缓存 5秒
const BALANCE_CACHE_TIME = 10000; // 余额缓存 10秒
const READ_CONTRACT_CACHE_TIME = 60000; // 只读合约调用缓存 60秒

/**
 * 生成缓存键
 */
function getCacheKey(method: string, ...args: any[]): string {
  return `${method}:${JSON.stringify(args)}`;
}

/**
 * 清理过期缓存
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.timestamp + item.expiry) {
      cache.delete(key);
    }
  }
  
  // 清理过期的待处理请求（超过10秒的请求移除）
  for (const [key, pending] of pendingRequests.entries()) {
    if (now - pending.timestamp > 10000) {
      pendingRequests.delete(key);
    }
  }
}

// 每30秒清理一次过期缓存
setInterval(cleanExpiredCache, 30000);

/**
 * 获取缓存数据
 */
export function getCachedData<T>(key: string): T | null {
  cleanExpiredCache();
  const item = cache.get(key);
  if (!item) {
    return null;
  }
  
  const now = Date.now();
  if (now > item.timestamp + item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data as T;
}

/**
 * 设置缓存数据
 */
export function setCachedData<T>(key: string, data: T, cacheTime: number = DEFAULT_CACHE_TIME): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: cacheTime,
  });
}

/**
 * 包装 RPC 调用，添加缓存和去重
 */
export function cachedRpcCall<T>(
  method: string,
  fn: () => Promise<T>,
  cacheTime?: number,
  ...args: any[]
): Promise<T> {
  const cacheKey = getCacheKey(method, ...args);
  
  // 检查缓存
  const cached = getCachedData<T>(cacheKey);
  if (cached !== null) {
    console.log(`[RPC Cache] 缓存命中: ${method}`);
    return Promise.resolve(cached);
  }
  
  // 检查是否有待处理的相同请求（去重）
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    console.log(`[RPC Cache] 请求去重: ${method}`);
    return pending.promise;
  }
  
  // 创建新请求
  const promise = fn().then((result) => {
    // 请求成功后，设置缓存
    setCachedData(cacheKey, result, cacheTime);
    // 移除待处理请求
    pendingRequests.delete(cacheKey);
    return result;
  }).catch((error) => {
    // 请求失败，移除待处理请求
    pendingRequests.delete(cacheKey);
    throw error;
  });
  
  // 记录待处理请求
  pendingRequests.set(cacheKey, {
    promise,
    timestamp: Date.now(),
  });
  
  return promise;
}

/**
 * 包装 getBlockNumber，添加短时间缓存
 */
export function cachedGetBlockNumber(
  fn: () => Promise<bigint>
): Promise<bigint> {
  return cachedRpcCall('getBlockNumber', fn, BLOCK_NUMBER_CACHE_TIME);
}

/**
 * 包装 getBalance，添加缓存
 */
export function cachedGetBalance(
  address: string,
  fn: () => Promise<bigint>
): Promise<bigint> {
  return cachedRpcCall('getBalance', fn, BALANCE_CACHE_TIME, address);
}

/**
 * 包装 readContract，添加缓存
 */
export function cachedReadContract<T>(
  contractAddress: string,
  functionName: string,
  args: any[],
  fn: () => Promise<T>,
  cacheTime?: number
): Promise<T> {
  return cachedRpcCall(
    'readContract',
    fn,
    cacheTime ?? READ_CONTRACT_CACHE_TIME,
    contractAddress,
    functionName,
    ...args
  );
}

/**
 * 清除特定方法的缓存
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    pendingRequests.clear();
    return;
  }
  
  // 清除匹配的缓存
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * 清除特定地址相关的缓存（用于地址变化时）
 */
export function clearAddressCache(address: string): void {
  const lowerAddress = address.toLowerCase();
  for (const key of cache.keys()) {
    if (key.toLowerCase().includes(lowerAddress)) {
      cache.delete(key);
    }
  }
}

/**
 * 清除合约相关的缓存（用于写操作后）
 */
export function clearContractCache(contractAddress: string): void {
  const lowerAddress = contractAddress.toLowerCase();
  for (const key of cache.keys()) {
    if (key.toLowerCase().includes(lowerAddress)) {
      cache.delete(key);
    }
  }
}

/**
 * 清除所有余额缓存（用于余额变化后）
 */
export function clearBalanceCache(): void {
  clearCache('getBalance');
}

