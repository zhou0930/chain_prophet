import { Transaction } from '../hooks/useWallet';

const STORAGE_KEY_PREFIX = 'wallet_transactions_';
const BALANCE_HISTORY_KEY_PREFIX = 'wallet_balance_history_';
const LAST_BALANCE_KEY_PREFIX = 'wallet_last_balance_';
const CALCULATED_BALANCE_HISTORY_KEY_PREFIX = 'wallet_calculated_balance_history_';

// 存储交易记录
export const saveTransactions = (address: string, transactions: Transaction[]): void => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
    
    // 将 BigInt 转换为字符串以便序列化
    const serializableTransactions = transactions.map(tx => ({
      ...tx,
      blockNumber: tx.blockNumber.toString(),
      gasUsed: tx.gasUsed ? tx.gasUsed.toString() : null,
      gasPrice: tx.gasPrice ? tx.gasPrice.toString() : null,
    }));
    
    const data = {
      address: address.toLowerCase(),
      transactions: serializableTransactions,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[Wallet Storage] 已保存 ${transactions.length} 笔交易记录`);
  } catch (error) {
    console.error('[Wallet Storage] 保存交易记录失败:', error);
  }
};

// 获取存储的交易记录
export const getStoredTransactions = (address: string): Transaction[] => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      // 转换回正确的类型（将字符串转换回 BigInt）
      return parsed.transactions.map((tx: any) => ({
        ...tx,
        blockNumber: typeof tx.blockNumber === 'string' 
          ? BigInt(tx.blockNumber) 
          : BigInt(tx.blockNumber || '0'),
        gasUsed: tx.gasUsed && typeof tx.gasUsed === 'string'
          ? BigInt(tx.gasUsed)
          : tx.gasUsed
          ? BigInt(tx.gasUsed)
          : null,
        gasPrice: tx.gasPrice && typeof tx.gasPrice === 'string'
          ? BigInt(tx.gasPrice)
          : tx.gasPrice
          ? BigInt(tx.gasPrice)
          : null,
      }));
    }
    return [];
  } catch (error) {
    console.error('[Wallet Storage] 读取交易记录失败:', error);
    return [];
  }
};

// 合并新的交易记录（去重）
export const mergeTransactions = (existing: Transaction[], newTransactions: Transaction[]): Transaction[] => {
  const txMap = new Map<string, Transaction>();
  
  // 先添加已有的交易
  existing.forEach(tx => {
    txMap.set(tx.hash, tx);
  });
  
  // 添加新交易（如果有相同的 hash，用新的覆盖）
  newTransactions.forEach(tx => {
    txMap.set(tx.hash, tx);
  });
  
  // 按时间戳倒序排列（最新的在前）
  return Array.from(txMap.values()).sort((a, b) => b.timestamp - a.timestamp);
};

// 存储余额历史记录（用于资产走势）
export interface BalanceHistoryPoint {
  timestamp: number;
  balance: string;
  address: string;
}

export const saveBalanceHistory = (address: string, balance: string): void => {
  try {
    const key = `${BALANCE_HISTORY_KEY_PREFIX}${address.toLowerCase()}`;
    const existing = getBalanceHistory(address);
    
    const newPoint: BalanceHistoryPoint = {
      timestamp: Date.now(),
      balance,
      address: address.toLowerCase(),
    };
    
    // 如果最新记录是今天的，更新它；否则添加新记录
    const today = new Date().setHours(0, 0, 0, 0);
    const latest = existing[existing.length - 1];
    
    if (latest && new Date(latest.timestamp).setHours(0, 0, 0, 0) === today) {
      // 更新今天的记录
      existing[existing.length - 1] = newPoint;
    } else {
      // 添加新记录
      existing.push(newPoint);
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error('[Wallet Storage] 保存余额历史失败:', error);
  }
};

// 获取余额历史记录
export const getBalanceHistory = (address: string): BalanceHistoryPoint[] => {
  try {
    const key = `${BALANCE_HISTORY_KEY_PREFIX}${address.toLowerCase()}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Wallet Storage] 读取余额历史失败:', error);
    return [];
  }
};

// 根据交易记录计算历史余额（用于资产走势）
export const calculateBalanceHistoryFromTransactions = (
  address: string,
  currentBalance: string,
  transactions: Transaction[]
): BalanceHistoryPoint[] => {
  if (transactions.length === 0) {
    // 如果没有交易，只返回当前余额点
    return [{
      timestamp: Date.now(),
      balance: currentBalance,
      address: address.toLowerCase(),
    }];
  }

  // 从当前余额开始，逆向计算历史余额
  let balance = parseFloat(currentBalance);
  const history: BalanceHistoryPoint[] = [];
  
  // 按时间倒序排列交易（从新到旧），这样才能正确逆向计算
  const sortedTx = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  
  // 从最新的交易开始，逆向计算每个交易后的余额
  for (const tx of sortedTx) {
    const txBalance = parseFloat(tx.value);
    
    // 先将当前余额记录为交易后的余额
    history.unshift({
      timestamp: tx.timestamp * 1000, // 转换为毫秒
      balance: balance.toFixed(6),
      address: address.toLowerCase(),
    });
    
    // 逆向计算：从当前余额（交易后）计算交易前的余额
    if (tx.isIncoming) {
      // 接收交易：交易前余额 = 交易后余额 - 接收金额
      balance -= txBalance;
    } else {
      // 发送交易：交易前余额 = 交易后余额 + 发送金额
      balance += txBalance;
    }
    
    // 确保余额不为负
    balance = Math.max(0, balance);
  }
  
  // 添加当前余额点（最新的，放在最后）
  history.push({
    timestamp: Date.now(),
    balance: currentBalance,
    address: address.toLowerCase(),
  });
  
  return history;
};

// 保存上次余额（用于比较余额是否变化）
export const saveLastBalance = (address: string, balance: string): void => {
  try {
    const key = `${LAST_BALANCE_KEY_PREFIX}${address.toLowerCase()}`;
    localStorage.setItem(key, balance);
  } catch (error) {
    console.error('[Wallet Storage] 保存上次余额失败:', error);
  }
};

// 获取上次余额
export const getLastBalance = (address: string): string | null => {
  try {
    const key = `${LAST_BALANCE_KEY_PREFIX}${address.toLowerCase()}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error('[Wallet Storage] 读取上次余额失败:', error);
    return null;
  }
};

// 比较余额是否有变化（考虑到浮点数精度问题）
export const hasBalanceChanged = (oldBalance: string | null, newBalance: string): boolean => {
  if (!oldBalance) {
    return true; // 没有旧余额，认为有变化
  }
  
  const oldValue = parseFloat(oldBalance);
  const newValue = parseFloat(newBalance);
  
  // 如果差异小于 0.000001 ETH，认为没有变化（避免浮点数精度问题）
  return Math.abs(newValue - oldValue) >= 0.000001;
};

// 存储计算好的历史余额点（基于交易记录计算的）
export const saveCalculatedBalanceHistory = (
  address: string,
  currentBalance: string,
  transactions: Transaction[]
): void => {
  try {
    const key = `${CALCULATED_BALANCE_HISTORY_KEY_PREFIX}${address.toLowerCase()}`;
    const history = calculateBalanceHistoryFromTransactions(address, currentBalance, transactions);
    
    const data = {
      address: address.toLowerCase(),
      history,
      currentBalance,
      transactionCount: transactions.length,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[Wallet Storage] 已保存计算好的历史余额点: ${history.length} 个`);
  } catch (error) {
    console.error('[Wallet Storage] 保存计算好的历史余额失败:', error);
  }
};

// 获取存储的计算好的历史余额点
export const getCalculatedBalanceHistory = (
  address: string,
  currentBalance: string,
  transactions: Transaction[]
): BalanceHistoryPoint[] => {
  try {
    const key = `${CALCULATED_BALANCE_HISTORY_KEY_PREFIX}${address.toLowerCase()}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      const parsed = JSON.parse(data);
      
      // 检查是否需要重新计算：
      // 1. 当前余额是否变化
      // 2. 交易数量是否变化
      const balanceChanged = hasBalanceChanged(parsed.currentBalance, currentBalance);
      const txCountChanged = parsed.transactionCount !== transactions.length;
      
      if (!balanceChanged && !txCountChanged) {
        // 不需要重新计算，返回存储的数据
        console.log(`[Wallet Storage] 使用存储的历史余额点: ${parsed.history.length} 个`);
        return parsed.history;
      } else {
        // 需要重新计算
        console.log('[Wallet Storage] 交易或余额已变化，重新计算历史余额');
      }
    }
    
    // 如果没有存储的数据或需要更新，重新计算
    const history = calculateBalanceHistoryFromTransactions(address, currentBalance, transactions);
    
    // 保存计算好的历史余额
    saveCalculatedBalanceHistory(address, currentBalance, transactions);
    
    return history;
  } catch (error) {
    console.error('[Wallet Storage] 读取计算好的历史余额失败:', error);
    // 出错时重新计算
    return calculateBalanceHistoryFromTransactions(address, currentBalance, transactions);
  }
};

