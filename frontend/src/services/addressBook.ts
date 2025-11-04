import { AddressEntry } from '../types';

const WHITELIST_KEY = 'chain_prophet_whitelist';
const BLACKLIST_KEY = 'chain_prophet_blacklist';

/**
 * 白名单服务
 */
export const whitelistService = {
  getAll: (): AddressEntry[] => {
    try {
      const stored = localStorage.getItem(WHITELIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('读取白名单失败:', error);
      return [];
    }
  },

  getByAddress: (address: string): AddressEntry | null => {
    const addresses = whitelistService.getAll();
    return addresses.find(entry => entry.address.toLowerCase() === address.toLowerCase()) || null;
  },

  getByName: (name: string): AddressEntry | null => {
    const addresses = whitelistService.getAll();
    return addresses.find(entry => 
      entry.name?.toLowerCase() === name.toLowerCase() ||
      entry.nickname?.toLowerCase() === name.toLowerCase()
    ) || null;
  },

  add: (address: string, name?: string, nickname?: string): AddressEntry => {
    const addresses = whitelistService.getAll();
    
    // 检查地址是否已存在
    if (whitelistService.getByAddress(address)) {
      throw new Error('该地址已在白名单中');
    }
    
    const newEntry: AddressEntry = {
      id: Date.now(),
      address,
      name,
      nickname,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    addresses.push(newEntry);
    localStorage.setItem(WHITELIST_KEY, JSON.stringify(addresses));
    return newEntry;
  },

  update: (id: number, name?: string, nickname?: string): AddressEntry => {
    const addresses = whitelistService.getAll();
    const index = addresses.findIndex(entry => entry.id === id);
    
    if (index === -1) {
      throw new Error('地址不存在');
    }
    
    const entry = addresses[index];
    entry.name = name !== undefined ? name : entry.name;
    entry.nickname = nickname !== undefined ? nickname : entry.nickname;
    entry.updated_at = new Date().toISOString();
    
    localStorage.setItem(WHITELIST_KEY, JSON.stringify(addresses));
    return entry;
  },

  delete: (id: number): boolean => {
    const addresses = whitelistService.getAll();
    const filtered = addresses.filter(entry => entry.id !== id);
    
    if (filtered.length < addresses.length) {
      localStorage.setItem(WHITELIST_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  },
};

/**
 * 黑名单服务
 */
export const blacklistService = {
  getAll: (): AddressEntry[] => {
    try {
      const stored = localStorage.getItem(BLACKLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('读取黑名单失败:', error);
      return [];
    }
  },

  getByAddress: (address: string): AddressEntry | null => {
    const addresses = blacklistService.getAll();
    return addresses.find(entry => entry.address.toLowerCase() === address.toLowerCase()) || null;
  },

  getByName: (name: string): AddressEntry | null => {
    const addresses = blacklistService.getAll();
    return addresses.find(entry => 
      entry.name?.toLowerCase() === name.toLowerCase() ||
      entry.nickname?.toLowerCase() === name.toLowerCase()
    ) || null;
  },

  add: (address: string, name?: string, nickname?: string): AddressEntry => {
    const addresses = blacklistService.getAll();
    
    // 检查地址是否已存在
    if (blacklistService.getByAddress(address)) {
      throw new Error('该地址已在黑名单中');
    }
    
    const newEntry: AddressEntry = {
      id: Date.now(),
      address,
      name,
      nickname,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    addresses.push(newEntry);
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(addresses));
    return newEntry;
  },

  update: (id: number, name?: string, nickname?: string): AddressEntry => {
    const addresses = blacklistService.getAll();
    const index = addresses.findIndex(entry => entry.id === id);
    
    if (index === -1) {
      throw new Error('地址不存在');
    }
    
    const entry = addresses[index];
    entry.name = name !== undefined ? name : entry.name;
    entry.nickname = nickname !== undefined ? nickname : entry.nickname;
    entry.updated_at = new Date().toISOString();
    
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(addresses));
    return entry;
  },

  delete: (id: number): boolean => {
    const addresses = blacklistService.getAll();
    const filtered = addresses.filter(entry => entry.id !== id);
    
    if (filtered.length < addresses.length) {
      localStorage.setItem(BLACKLIST_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  },
};

/**
 * 替换消息中的昵称为地址+名单信息（用于发送给后端）
 * 格式：给小明（0x地址+whitelist/blacklist）转0.001eth
 */
export const replaceNameWithAddress = (text: string): string => {
  // 先检查白名单，再检查黑名单
  const whitelist = whitelistService.getAll();
  const blacklist = blacklistService.getAll();
  
  let processedText = text;
  
  // 先处理白名单
  for (const entry of whitelist) {
    if (entry.name || entry.nickname) {
      const names = [entry.name, entry.nickname].filter(Boolean);
      
      for (const name of names) {
        if (name) {
          // 转义特殊字符
          const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // 简单的全局替换
          const regex = new RegExp(escapedName, 'g');
          
          // 替换为：名字（地址+whitelist）
          const replacement = `${name}（${entry.address}+whitelist）`;
          const newText = processedText.replace(regex, replacement);
          
          if (newText !== processedText) {
            processedText = newText;
            console.log(`[地址簿] 替换昵称: ${name} -> ${entry.address}+whitelist`);
          }
        }
      }
    }
  }
  
  // 再处理黑名单（如果白名单已经替换过，则不会再次替换）
  for (const entry of blacklist) {
    if (entry.name || entry.nickname) {
      const names = [entry.name, entry.nickname].filter(Boolean);
      
      for (const name of names) {
        if (name) {
          // 检查是否已经被白名单替换过（如果文本中已经包含该地址，说明已替换过）
          if (processedText.includes(entry.address)) {
            continue;
          }
          
          // 转义特殊字符
          const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // 简单的全局替换
          const regex = new RegExp(escapedName, 'g');
          
          // 替换为：名字（地址+blacklist）
          const replacement = `${name}（${entry.address}+blacklist）`;
          const newText = processedText.replace(regex, replacement);
          
          if (newText !== processedText) {
            processedText = newText;
            console.log(`[地址簿] 替换昵称: ${name} -> ${entry.address}+blacklist`);
          }
        }
      }
    }
  }
  
  return processedText;
};

/**
 * 替换地址为昵称（用于显示）
 */
export const replaceAddressWithName = (text: string): string => {
  const whitelist = whitelistService.getAll();
  const blacklist = blacklistService.getAll();
  
  let processedText = text;
  
  for (const entry of [...whitelist, ...blacklist]) {
    // 使用不区分大小写的地址匹配
    const regex = new RegExp(entry.address, 'gi');
    
    if (regex.test(processedText)) {
      const displayName = entry.nickname || entry.name || entry.address;
      processedText = processedText.replace(regex, displayName);
    }
  }
  
  return processedText;
};

