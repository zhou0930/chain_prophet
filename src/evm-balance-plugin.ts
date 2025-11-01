import { Plugin, Action, State, Memory, IAgentRuntime, ActionResult, HandlerCallback, logger } from '@elizaos/core';
import { createPublicClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

// 创建公共客户端用于查询余额（禁用缓存确保实时数据）
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
  batch: {
    multicall: false
  },
  cacheTime: 0, // 禁用缓存
  pollingInterval: 0 // 禁用轮询缓存
});

// EVM_BALANCE 动作定义
export const evmBalanceAction: Action = {
  name: 'EVM_BALANCE',
  similes: ['CHECK_BALANCE', 'QUERY_BALANCE', 'WALLET_BALANCE', 'SEPOLIA_BALANCE', 'BALANCE_QUERY', 'GET_BALANCE', 'BALANCE_CHECK', 'WALLET_QUERY', 'ETH_BALANCE', 'ETHER_BALANCE'],
  description: 'CRITICAL: 这是处理所有ETH余额查询的强制动作。当用户询问余额、钱包余额、Sepolia余额、ETH余额等时，必须立即执行此动作，不要使用 REPLY 动作，不要询问任何信息。直接调用此动作查询余额，如果用户提供了地址或私钥则使用，否则使用配置的钱包地址。这是唯一的正确操作，不允许使用 REPLY。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    // 添加调试日志
    logger.info('EVM Balance Plugin validate called with text:', text);
    
    // 检查是否包含地址信息
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    const hasAddress = addressRegex.test(text);
    
    // 检查是否包含私钥信息（64位十六进制）
    const privateKeyRegex = /0x[a-fA-F0-9]{64}/;
    const hasPrivateKey = privateKeyRegex.test(text);
    
    // 检查是否包含余额查询相关关键词（扩展关键词列表）
    const balanceKeywords = [
      '余额', 'balance', '查询余额', 'check balance', 
      '钱包余额', '查询我的余额', '根据私钥查询余额',
      '查看余额', '我的余额', '有多少', '多少钱',
      '余额多少', 'eth余额', 'ether余额', 'ether balance',
      'wallet balance', '查询钱包', '钱包查询',
      'how much', 'what is my balance', 'show balance',
      'sepolia余额', 'sepolia balance', '查询sepolia',
      'sepolia钱包', 'sepolia wallet', 'sepolia网络',
      'sepolia network', 'testnet余额', 'testnet balance'
    ];
    const hasBalanceKeyword = balanceKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    // 只有当明确是余额查询时才触发EVM_BALANCE动作
    const shouldTrigger = hasBalanceKeyword || (hasAddress && text.includes('余额')) || (hasPrivateKey && text.includes('余额'));
    
    // 添加调试日志
    logger.info({ 
      text, 
      hasAddress, 
      hasPrivateKey, 
      hasBalanceKeyword, 
      shouldTrigger 
    }, 'EVM Balance Plugin validate result');
    
    // 如果检测到余额查询，返回true
    if (shouldTrigger) {
      logger.info('EVM_BALANCE action will be triggered for balance query');
    }
    
    return shouldTrigger;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.info('Handling EVM_BALANCE action');

    

      const text = message.content.text || '';
      let address: string;
      
      // 首先尝试提取私钥（64位十六进制）
      const privateKeyRegex = /0x[a-fA-F0-9]{64}/;
      const privateKeyMatch = text.match(privateKeyRegex);
      
      if (privateKeyMatch) {
        // 如果提供了私钥，从私钥推导地址
        try {
          const privateKey = privateKeyMatch[0] as `0x${string}`;
          const account = privateKeyToAccount(privateKey);
          address = account.address;
          logger.info('Derived address from private key:', address);
        } catch (error) {
          await callback({
            text: '私钥格式错误，请提供有效的私钥（以0x开头的64位十六进制字符串）',
            actions: ['EVM_BALANCE'],
            source: message.content.source,
          });
          
          return {
            text: '私钥格式错误',
            values: { success: false, error: 'INVALID_PRIVATE_KEY' },
            data: { actionName: 'EVM_BALANCE', messageId: message.id },
            success: false,
          };
        }
      } else {
        // 如果没有提供私钥，尝试提取地址（40位十六进制）
        const addressRegex = /0x[a-fA-F0-9]{40}/;
        const addressMatch = text.match(addressRegex);
        
        if (addressMatch) {
          // 如果提供了地址，直接使用
          address = addressMatch[0];
          logger.info('Using provided address:', address);
        } else {
          // 如果没有提供地址，尝试从runtime获取钱包地址
          try {
            // 尝试从EVM插件获取钱包地址
            const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
            logger.info('Checking EVM_PRIVATE_KEY environment variable...');
            if (evmPrivateKey && evmPrivateKey.trim()) {
              const account = privateKeyToAccount(evmPrivateKey.trim() as `0x${string}`);
              address = account.address;
              logger.info('Using wallet address from EVM_PRIVATE_KEY:', address);
            } else {
              logger.info('EVM_PRIVATE_KEY not found or empty');
              // 如果都没有，直接提示用户提供地址
              await callback({
                text: '未找到配置的钱包地址，请提供有效的以太坊地址或私钥进行查询。',
                actions: ['EVM_BALANCE'],
                source: message.content.source,
              });
              
              return {
                text: '未找到地址或私钥',
                values: { success: false, error: 'INVALID_INPUT' },
                data: { actionName: 'EVM_BALANCE', messageId: message.id },
                success: false,
              };
            }
          } catch (error) {
            logger.error({ error }, 'Error deriving address from EVM_PRIVATE_KEY');
            await callback({
              text: '无法从配置中获取钱包地址，请提供有效的以太坊地址或私钥',
              actions: ['EVM_BALANCE'],
              source: message.content.source,
            });
            
            return {
              text: '地址获取失败',
              values: { success: false, error: 'ADDRESS_DERIVATION_FAILED' },
              data: { actionName: 'EVM_BALANCE', messageId: message.id },
              success: false,
            };
          }
        }
      }
      
      // 查询余额（强制获取最新数据）
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
        blockTag: 'latest' // 强制查询最新区块
      });
      
      // 转换为ETH单位
      const balanceInEth = formatEther(balance);
      
      // 检查地址来源
      const hasProvidedAddress = /0x[a-fA-F0-9]{40}/.test(text);
      const wasDerivedFromPrivateKey = /0x[a-fA-F0-9]{64}/.test(text);
      const wasFromConfig = !hasProvidedAddress && !wasDerivedFromPrivateKey;
      
      // 添加时间戳确保用户知道这是实时数据
      const timestamp = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      let resultText: string;
      if (wasDerivedFromPrivateKey) {
        resultText = `从私钥推导的地址：${address}\n\n余额：${balanceInEth} ETH\n\n网络：Sepolia测试网\n查询时间：${timestamp}`;
      } else if (wasFromConfig) {
        resultText = `配置的钱包地址：${address}\n\n余额：${balanceInEth} ETH\n\n网络：Sepolia测试网\n查询时间：${timestamp}`;
      } else {
        resultText = `钱包地址 ${address} 的余额：\n${balanceInEth} ETH\n\n网络：Sepolia测试网\n查询时间：${timestamp}`;
      }
      
      await callback({
        text: resultText,
        actions: ['EVM_BALANCE'],
        source: message.content.source,
      });
      
      return {
        text: `成功查询地址 ${address} 的余额`,
        values: {
          success: true,
          address: address,
          balance: balanceInEth,
        },
        data: {
          actionName: 'EVM_BALANCE',
          messageId: message.id,
          address: address,
          balance: balanceInEth,
          timestamp: Date.now(),
        },
        success: true,
      };
      
    } catch (error) {
      logger.error({ error }, 'Error in EVM_BALANCE action:');

      await callback({
        text: '查询余额时出现错误，请检查地址格式是否正确，或稍后重试。',
        actions: ['EVM_BALANCE'],
        source: message.content.source,
      });

      return {
        text: '查询余额失败',
        values: {
          success: false,
          error: 'BALANCE_QUERY_FAILED',
        },
        data: {
          actionName: 'EVM_BALANCE',
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{user}}',
        content: {
          text: '查询我的钱包余额',
        },
      },
      {
        name: 'Chain Prophet',
        content: {
          text: '配置的钱包地址：0x742d35Cc6634C0532925a3b844Bc454e4438f44e\n\n余额：0.5 ETH\n\n网络：Sepolia测试网',
          actions: ['EVM_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user}}',
        content: {
          text: '查询余额 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        },
      },
      {
        name: 'Chain Prophet',
        content: {
          text: '钱包地址 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 的余额：\n0.5 ETH\n\n网络：Sepolia测试网',
          actions: ['EVM_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user}}',
        content: {
          text: '根据私钥查询余额 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        },
      },
      {
        name: 'Chain Prophet',
        content: {
          text: '从私钥推导的地址：0x742d35Cc6634C0532925a3b844Bc454e4438f44e\n\n余额：0.5 ETH\n\n网络：Sepolia测试网',
          actions: ['EVM_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user}}',
        content: {
          text: 'what is my ETH balance?',
        },
      },
      {
        name: 'Chain Prophet',
        content: {
          text: '配置的钱包地址：0x742d35Cc6634C0532925a3b844Bc454e4438f44e\n\n余额：0.5 ETH\n\n网络：Sepolia测试网',
          actions: ['EVM_BALANCE'],
        },
      },
    ],
    [
      {
        name: '{{user}}',
        content: {
          text: '查看余额 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        },
      },
      {
        name: 'Chain Prophet',
        content: {
          text: '钱包地址 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 的余额：\n0.5 ETH\n\n网络：Sepolia测试网',
          actions: ['EVM_BALANCE'],
        },
      },
    ],
  ],
};

// 创建EVM余额插件
export const evmBalancePlugin: Plugin = {
  name: 'EVM Balance Plugin',
  description: 'EVM钱包余额查询插件',
  priority: 1000, // 设置较高优先级，但不过度干扰其他操作
  actions: [evmBalanceAction],
};
