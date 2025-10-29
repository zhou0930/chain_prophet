import { Plugin, Action, State, Memory } from '@elizaos/core';
import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';

// 创建公共客户端用于查询余额
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

// EVM_BALANCE 动作定义
const EVM_BALANCE_ACTION: Action = {
  name: 'EVM_BALANCE',
  description: '查询EVM钱包地址的ETH余额',
  examples: [
    [
      {
        user: '{{user}}',
        content: {
          text: '查询我的钱包余额',
        },
      },
      {
        user: '{{user}}',
        content: {
          text: '我的地址是 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        },
      },
    ],
  ],
  validate: async (state: State, userMessage: string) => {
    // 检查是否包含地址信息
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    const hasAddress = addressRegex.test(userMessage);
    
    // 检查是否包含余额查询相关关键词
    const balanceKeywords = ['余额', 'balance', '查询余额', 'check balance', '钱包余额'];
    const hasBalanceKeyword = balanceKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return hasAddress && hasBalanceKeyword;
  },
  handler: async (state: State, userMessage: string) => {
    try {
      // 提取地址
      const addressRegex = /0x[a-fA-F0-9]{40}/;
      const addressMatch = userMessage.match(addressRegex);
      
      if (!addressMatch) {
        return {
          text: '请提供有效的以太坊地址（以0x开头的40位十六进制字符串）',
        };
      }
      
      const address = addressMatch[0];
      
      // 查询余额
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });
      
      // 转换为ETH单位
      const balanceInEth = formatEther(balance);
      
      return {
        text: `钱包地址 ${address} 的余额：\n${balanceInEth} ETH\n\n网络：Sepolia测试网`,
      };
      
    } catch (error) {
      console.error('查询余额时出错:', error);
      return {
        text: '查询余额时出现错误，请检查地址格式是否正确，或稍后重试。',
      };
    }
  },
};

// 创建插件
export const evmBalancePlugin: Plugin = {
  name: 'EVM Balance Plugin',
  actions: [EVM_BALANCE_ACTION],
};
