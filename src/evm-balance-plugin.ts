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

// 提取地址的逻辑（供多个动作复用）
async function extractAddress(text: string): Promise<{ address: string; source: 'privateKey' | 'address' | 'config'; error?: string }> {
  // 首先尝试提取私钥（64位十六进制）
  const privateKeyRegex = /0x[a-fA-F0-9]{64}/;
  const privateKeyMatch = text.match(privateKeyRegex);
  
  if (privateKeyMatch) {
    try {
      const privateKey = privateKeyMatch[0] as `0x${string}`;
      const account = privateKeyToAccount(privateKey);
      return { address: account.address, source: 'privateKey' };
    } catch (error) {
      return { address: '', source: 'privateKey', error: '私钥格式错误，请提供有效的私钥（以0x开头的64位十六进制字符串）' };
    }
  }
  
  // 尝试提取地址（40位十六进制）
  const addressRegex = /0x[a-fA-F0-9]{40}/;
  const addressMatch = text.match(addressRegex);
  
  if (addressMatch) {
    return { address: addressMatch[0], source: 'address' };
  }
  
  // 尝试从配置获取
  try {
    const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
    if (evmPrivateKey && evmPrivateKey.trim()) {
      const account = privateKeyToAccount(evmPrivateKey.trim() as `0x${string}`);
      return { address: account.address, source: 'config' };
    } else {
      return { address: '', source: 'config', error: '未找到配置的钱包地址，请提供有效的以太坊地址或私钥进行查询。' };
    }
  } catch (error) {
    return { address: '', source: 'config', error: '无法从配置中获取钱包地址，请提供有效的以太坊地址或私钥' };
  }
}

// 执行余额查询的核心逻辑
async function executeBalanceQuery(address: string, originalText: string, callback: HandlerCallback): Promise<ActionResult> {
  try {
    // 查询余额（强制获取最新数据）
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
      blockTag: 'latest' // 强制查询最新区块
    });
    
    // 转换为ETH单位
    const balanceInEth = formatEther(balance);
    
    // 检查地址来源
    const hasProvidedAddress = /0x[a-fA-F0-9]{40}/.test(originalText);
    const wasDerivedFromPrivateKey = /0x[a-fA-F0-9]{64}/.test(originalText);
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
      source: originalText.includes('callback_data') ? undefined : 'user',
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
        address: address,
        balance: balanceInEth,
        timestamp: Date.now(),
      },
      success: true,
    };
  } catch (error) {
    logger.error({ error }, 'Error executing balance query:');
    
    await callback({
      text: '查询余额时出现错误，请检查地址格式是否正确，或稍后重试。',
      actions: ['EVM_BALANCE'],
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
}

// 确认余额查询动作
export const confirmBalanceQueryAction: Action = {
  name: 'CONFIRM_BALANCE_QUERY',
  similes: ['REQUEST_BALANCE_CONFIRMATION', 'EVM_BALANCE', 'CHECK_BALANCE', 'QUERY_BALANCE', 'WALLET_BALANCE', 'SEPOLIA_BALANCE', 'BALANCE_QUERY', 'GET_BALANCE', 'BALANCE_CHECK', 'WALLET_QUERY', 'ETH_BALANCE', 'ETHER_BALANCE'],
  description: 'CRITICAL: 这是处理所有ETH余额查询的主要动作。当用户询问余额、钱包余额、Sepolia余额、ETH余额等时，必须立即执行此动作显示确认弹窗。这是唯一的正确操作，不要使用其他余额查询动作。用户确认后会执行实际的余额查询。注意：如果已有待处理的余额查询（state.pendingBalanceQuery 存在），且用户发送"确认"/"取消"文本，应该使用 HANDLE_BALANCE_CONFIRMATION 而不是此动作。',

  validate: async (_runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    // 尝试从多个位置获取 callback_data
    const callbackData = (message.content as any)?.callback_data ||
                        (message.content?.metadata as any)?.callback_data ||
                        (message as any)?.metadata?.callback_data ||
                        (message as any)?.metadata?.buttonCallbackData ||
                        (message as any)?.callback_data;
    
    // 如果消息包含 callback_data，说明是按钮响应，应该由 HANDLE_BALANCE_CONFIRMATION 处理
    if (callbackData) {
      logger.info('CONFIRM_BALANCE_QUERY: Message has callback_data, skipping confirmation');
      return false;
    }

    const text = message.content.text?.toLowerCase() || '';
    logger.info('CONFIRM_BALANCE_QUERY validate called with text:', text);
    
    // 如果 text 是按钮回调数据值，应该由 HANDLE_BALANCE_CONFIRMATION 处理
    if (text === 'balance_confirm_yes' || text === 'balance_confirm_no') {
      logger.info('CONFIRM_BALANCE_QUERY: Text is button callback data, skipping confirmation');
      return false;
    }
    
    // 如果已经有待处理的余额查询，且用户发送的是确认/取消相关的文本，不应该再次触发确认
    // 这应该由 HANDLE_BALANCE_CONFIRMATION 处理，所以这里返回 false
    if (state.pendingBalanceQuery) {
      const isConfirmationText = ['确认', '取消', '是', '否', 'yes', 'no', 'y', 'n'].some(
        keyword => text.includes(keyword.toLowerCase())
      );
      if (isConfirmationText) {
        logger.info('CONFIRM_BALANCE_QUERY: Pending query exists and user sent confirmation text, skip - HANDLE_BALANCE_CONFIRMATION should handle this');
        return false; // 让 HANDLE_BALANCE_CONFIRMATION 处理
      }
    }
    
    // 检查是否包含余额查询相关关键词
    const balanceKeywords = [
      '余额', 'balance', '查询余额', 'check balance', 
      '钱包余额', '查询我的余额', '根据私钥查询余额',
      '查看余额', '我的余额', '有多少', '多少钱',
      '余额多少', 'eth余额', 'ether余额', 'ether balance',
      'wallet balance', '查询钱包', '钱包查询',
      'how much', 'what is my balance', 'show balance',
      'sepolia余额', 'sepolia balance', '查询sepolia',
      'sepolia钱包', 'sepolia wallet', 'sepolia网络',
      'sepolia network', 'testnet余额', 'testnet balance',
      '查余额' // 添加简短的关键词
    ];
    
    const hasBalanceKeyword = balanceKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    // 检查是否包含地址或私钥
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    const privateKeyRegex = /0x[a-fA-F0-9]{64}/;
    const hasAddress = addressRegex.test(text);
    const hasPrivateKey = privateKeyRegex.test(text);
    
    // 如果包含余额关键词，或者包含地址/私钥且提及余额，则触发确认
    const shouldTrigger = hasBalanceKeyword || (hasAddress && text.includes('余额')) || (hasPrivateKey && text.includes('余额'));
    
    // 验证是否应该触发余额查询确认
    
    return shouldTrigger;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.info('Handling CONFIRM_BALANCE_QUERY action');
      
      const text = message.content.text || '';
      const addressInfo = await extractAddress(text);
      
      let confirmText = '请确认是否查询余额？';
      if (addressInfo.address) {
        confirmText = `请确认是否查询以下地址的余额？\n\n地址：${addressInfo.address}\n\n网络：Sepolia测试网`;
      } else if (addressInfo.error) {
        // 如果提取地址失败，直接返回错误
        await callback?.({
          text: addressInfo.error,
          actions: ['CONFIRM_BALANCE_QUERY'],
          source: message.content.source,
        });
        
        return {
          success: false,
          text: addressInfo.error,
          values: {
            error: 'ADDRESS_EXTRACTION_FAILED',
            errorMessage: addressInfo.error,
          },
          data: {
            actionName: 'CONFIRM_BALANCE_QUERY',
            messageId: message.id,
            error: addressInfo.error,
          },
          error: new Error(addressInfo.error),
        };
      }
      
      // 保存原始查询信息到 state，供确认后使用
      if (!state.pendingBalanceQuery) {
        state.pendingBalanceQuery = {};
      }
      state.pendingBalanceQuery = {
        originalText: text,
        timestamp: Date.now(),
        addressInfo: addressInfo,
      };
      
      // 发送确认请求，包含按钮
      const buttonsContent = [
        [
          { text: '✅ 确认', callback_data: 'balance_confirm_yes' },
          { text: '❌ 取消', callback_data: 'balance_confirm_no' }
        ]
      ];
      
      await callback?.({
        text: confirmText,
        buttons: buttonsContent,
        actions: ['CONFIRM_BALANCE_QUERY'],
        source: message.content.source,
        metadata: {
          buttons: buttonsContent, // 也在 metadata 中包含，以防 callback 不传递
        },
      });
      
      return {
        success: true,
        text: '等待用户确认...',
        values: {
          pendingConfirmation: true,
          originalQuery: text,
          address: addressInfo.address,
        },
        data: {
          actionName: 'CONFIRM_BALANCE_QUERY',
          messageId: message.id,
          addressInfo: addressInfo,
          buttons: buttonsContent, // 在返回数据中也包含 buttons
        },
      };
      
    } catch (error) {
      logger.error({ error }, 'Error in CONFIRM_BALANCE_QUERY action:');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await callback?.({
        text: `显示确认弹窗时出现错误：${errorMessage}\n\n请稍后重试。`,
        actions: ['CONFIRM_BALANCE_QUERY'],
        source: message.content.source,
      });
      
      return {
        success: false,
        text: '确认请求失败',
        values: {
          error: 'CONFIRMATION_REQUEST_FAILED',
          errorMessage: errorMessage,
        },
        data: {
          actionName: 'CONFIRM_BALANCE_QUERY',
          error: errorMessage,
          messageId: message.id,
        },
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  },

  examples: [],
};

// 处理余额查询确认动作
export const handleBalanceConfirmationAction: Action = {
  name: 'HANDLE_BALANCE_CONFIRMATION',
  similes: [
    'PROCESS_BALANCE_CONFIRMATION', '确认', '取消', '确认余额查询', '取消余额查询',
    'CONFIRM_BALANCE', 'CANCEL_BALANCE', 'BALANCE_CONFIRMED', 'BALANCE_CANCELLED',
    '确认查询', '取消查询', '是', '否', 'yes', 'no'
  ],
  description: 'ABSOLUTE PRIORITY - HANDLE_BALANCE_CONFIRMATION: 这是处理余额查询确认响应的唯一动作。当用户发送"确认"/"取消"文本或点击确认/取消按钮时，必须立即执行此动作，而不是 REPLY 或 CONFIRM_BALANCE_QUERY。此动作会检查待处理的余额查询并执行实际的余额查询或取消操作。当有待处理的余额查询（state.pendingBalanceQuery 存在）且用户发送确认/取消相关文本时，此动作优先级最高，必须被优先选择。如果此动作的 validate 返回 true，必须执行此动作，不要使用其他任何动作。',

  validate: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    // 尝试从多个位置获取 callback_data
    const callbackData = (message.content as any)?.callback_data ||
                        (message.content?.metadata as any)?.callback_data ||
                        (message as any)?.metadata?.callback_data ||
                        (message as any)?.metadata?.buttonCallbackData ||
                        (message as any)?.callback_data;
    const text = (message.content.text || '').toLowerCase().trim();
    
    // 支持按钮回调数据和文本确认
    // 注意：按钮点击时，callback_data 可能被传递到 text 字段
    const isButtonYes = callbackData === 'balance_confirm_yes' || text === 'balance_confirm_yes';
    const isButtonNo = callbackData === 'balance_confirm_no' || text === 'balance_confirm_no';
    const isTextYes = text === '确认' || text === '是' || text === 'yes' || text === 'y' || text.includes('确认');
    const isTextNo = text === '取消' || text === '否' || text === 'no' || text === 'n' || text.includes('取消');
    
    // 如果消息是确认/取消相关的
    if (!isButtonYes && !isButtonNo && !isTextYes && !isTextNo) {
      return false;
    }
    
    // 检查是否有待处理的余额查询（从 state 或最近的记忆中查找）
    let hasPendingQuery = !!state.pendingBalanceQuery;
    
    // 如果 state 中没有，尝试从最近的消息记忆中查找确认请求
    if (!hasPendingQuery && message.roomId) {
      try {
        const recentMemories = await runtime.getMemories({
          roomId: message.roomId,
          count: 10,
          unique: true,
          tableName: 'messages',
        });
        
        // 查找最近包含确认请求或按钮的消息
        const confirmationMessage = recentMemories.find(mem => {
          const memContent = mem.content?.text || '';
          const memAsAny = mem as any;
          const memActions = (mem.content as any)?.actions || memAsAny?.data?.actions || [];
          const memButtons = (mem.content as any)?.buttons || (mem.content?.metadata as any)?.buttons;
          
          return (
            memActions.includes('CONFIRM_BALANCE_QUERY') ||
            memContent.includes('请确认是否查询') ||
            memContent.includes('请确认') ||
            (memButtons && Array.isArray(memButtons) && memButtons.some((row: any[]) =>
              row.some((btn: any) => 
                btn.callback_data === 'balance_confirm_yes' || btn.callback_data === 'balance_confirm_no'
              )
            ))
          );
        });
        
        if (confirmationMessage) {
          hasPendingQuery = true;
          logger.info({}, 'HANDLE_BALANCE_CONFIRMATION validate: 从消息记忆中找到了确认请求');
        }
      } catch (error) {
        logger.error({ error }, 'HANDLE_BALANCE_CONFIRMATION validate: 获取消息记忆时出错');
      }
    }
    
    // 验证是否应该处理余额查询确认响应
    
    // 只有当有确认请求且消息是确认/取消相关时才返回 true
    return hasPendingQuery && (isButtonYes || isButtonNo || isTextYes || isTextNo);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      // 尝试从多个位置获取 callback_data
      const callbackData = (message.content as any)?.callback_data ||
                          (message.content?.metadata as any)?.callback_data ||
                          (message as any)?.metadata?.callback_data ||
                          (message as any)?.metadata?.buttonCallbackData ||
                          (message as any)?.callback_data;
      const text = (message.content.text || '').toLowerCase().trim();
      
      // 判断用户是确认还是取消（支持按钮和文本两种方式）
      // 注意：按钮点击时，callback_data 可能被传递到 text 字段
      const isConfirm = callbackData === 'balance_confirm_yes' || 
                       text === 'balance_confirm_yes' ||
                       text === '确认' || text === '是' || text === 'yes' || text === 'y' || text.includes('确认');
      const isCancel = callbackData === 'balance_confirm_no' || 
                      text === 'balance_confirm_no' ||
                      text === '取消' || text === '否' || text === 'no' || text === 'n' || text.includes('取消');
      
      // 判断用户是确认还是取消
      
      if (isCancel) {
        // 用户取消查询
        await callback?.({
          text: '操作已取消',
          actions: ['HANDLE_BALANCE_CONFIRMATION'],
          source: message.content.source,
        });
        
        // 清除待处理的查询信息
        if (state.pendingBalanceQuery) {
          delete state.pendingBalanceQuery;
        }
        
        return {
          success: true,
          text: '用户取消余额查询',
          values: {
            confirmed: false,
            cancelled: true,
          },
          data: {
            actionName: 'HANDLE_BALANCE_CONFIRMATION',
            messageId: message.id,
            cancelled: true,
          },
        };
      }
      
      // 用户确认查询
      if (isConfirm) {
        // 获取保存的原始查询信息（先从 state 获取，如果不存在则从消息记忆中恢复）
        let pendingQuery = state.pendingBalanceQuery;
        
        // 如果 state 中没有，尝试从最近的消息记忆中恢复
        if ((!pendingQuery || !pendingQuery.originalText) && message.roomId) {
          try {
            const recentMemories = await runtime.getMemories({
              roomId: message.roomId,
              count: 20,
              unique: true,
              tableName: 'messages',
            });
            
            // 查找用户的原始查询消息（包含地址或私钥的消息）
            const userQueryMessage = recentMemories.find(mem => {
              const memAsAny = mem as any;
              const messageAsAny = message as any;
              // 检查是否是用户消息（不是 agent 消息）
              const isUserMessage = memAsAny.userId && memAsAny.userId === messageAsAny.userId && memAsAny.userId !== messageAsAny.agentId;
              if (!isUserMessage) {
                // 如果没有 userId，通过 content.source 或其他方式判断
                const source = (mem.content as any)?.source;
                const isNotAgent = source !== 'agent' && source !== 'assistant';
                if (!isNotAgent) return false;
              }
              
              const memText = mem.content?.text || '';
              // 查找包含地址、私钥或余额查询关键词的消息
              const hasAddress = /0x[a-fA-F0-9]{40}/.test(memText);
              const hasPrivateKey = /0x[a-fA-F0-9]{64}/.test(memText);
              const hasBalanceKeyword = /余额|balance|查询余额|check balance/i.test(memText);
              return (hasAddress || hasPrivateKey) && hasBalanceKeyword;
            });
            
            // 查找确认请求消息（AI发送的包含按钮的消息）
            const confirmationMessage = recentMemories.find(mem => {
              const memAsAny = mem as any;
              const memActions = (mem.content as any)?.actions || memAsAny?.data?.actions || [];
              const memButtons = (mem.content as any)?.buttons || (mem.content?.metadata as any)?.buttons;
              const memContent = mem.content?.text || '';
              
              return (
                memActions.includes('CONFIRM_BALANCE_QUERY') ||
                memContent.includes('请确认是否查询') ||
                (memButtons && Array.isArray(memButtons) && memButtons.some((row: any[]) =>
                  row.some((btn: any) => 
                    btn.callback_data === 'balance_confirm_yes' || btn.callback_data === 'balance_confirm_no'
                  )
                ))
              );
            });
            
            // 如果找到了原始查询消息，重建 pendingQuery
            if (userQueryMessage) {
              const originalText = userQueryMessage.content?.text || '';
              const addressInfo = await extractAddress(originalText);
              
              pendingQuery = {
                originalText: originalText,
                timestamp: userQueryMessage.createdAt ? new Date(userQueryMessage.createdAt).getTime() : Date.now(),
                addressInfo: addressInfo,
              };
              
              // 从消息记忆中恢复了查询信息
            }
          } catch (error) {
            logger.error({ error }, 'HANDLE_BALANCE_CONFIRMATION: 从消息记忆中恢复查询信息时出错');
          }
        }
        
        if (!pendingQuery || !pendingQuery.originalText) {
          await callback?.({
            text: '未找到查询信息，请重新发起查询请求。',
            actions: ['HANDLE_BALANCE_CONFIRMATION'],
            source: message.content.source,
          });
          
          return {
            success: false,
            text: '查询信息丢失',
            values: {
              error: 'PENDING_QUERY_NOT_FOUND',
            },
            data: {
              actionName: 'HANDLE_BALANCE_CONFIRMATION',
              messageId: message.id,
            },
            error: new Error('PENDING_QUERY_NOT_FOUND'),
          };
        }
        
        const originalText = pendingQuery.originalText;
        
        // 使用保存的地址信息，如果不存在则重新提取
        let addressInfo = pendingQuery.addressInfo;
        if (!addressInfo || !addressInfo.address) {
          await callback?.({
            text: '正在提取地址信息...',
            actions: ['HANDLE_BALANCE_CONFIRMATION'],
            source: message.content.source,
          });
          
          addressInfo = await extractAddress(originalText);
        }
        
        if (addressInfo.error || !addressInfo.address) {
          await callback?.({
            text: addressInfo.error || '无法获取钱包地址，请重新发起查询。',
            actions: ['HANDLE_BALANCE_CONFIRMATION'],
            source: message.content.source,
          });
          
          return {
            success: false,
            text: addressInfo.error || '地址获取失败',
            values: {
              error: 'ADDRESS_EXTRACTION_FAILED',
              errorMessage: addressInfo.error,
            },
            data: {
              actionName: 'HANDLE_BALANCE_CONFIRMATION',
              messageId: message.id,
              error: addressInfo.error,
            },
            error: new Error(addressInfo.error || 'ADDRESS_EXTRACTION_FAILED'),
          };
        }
        
        // 清除待处理的查询信息
        delete state.pendingBalanceQuery;
        
        // 发送进度更新
        await callback?.({
          text: `正在查询地址 ${addressInfo.address} 的余额...`,
          actions: ['HANDLE_BALANCE_CONFIRMATION'],
          source: message.content.source,
        });
        
        // 执行实际的余额查询
        const result = await executeBalanceQuery(addressInfo.address, originalText, callback);
        
        // 返回增强的结果，包含确认信息
        return {
          ...result,
          success: result.success,
          text: result.text || '余额查询完成',
          values: {
            ...result.values,
            confirmed: true,
            address: addressInfo.address,
          },
          data: {
            ...result.data,
            confirmed: true,
            addressInfo: addressInfo,
          },
        };
      }
      
      // 未知的确认响应
      await callback?.({
        text: '未知的确认响应，请重新发起查询。',
        actions: ['HANDLE_BALANCE_CONFIRMATION'],
        source: message.content.source,
      });
      
      return {
        success: false,
        text: '未知的确认响应',
        values: {
          error: 'UNKNOWN_CONFIRMATION_RESPONSE',
        },
        data: {
          actionName: 'HANDLE_BALANCE_CONFIRMATION',
          messageId: message.id,
          callbackData: callbackData,
        },
        error: new Error('UNKNOWN_CONFIRMATION_RESPONSE'),
      };
      
    } catch (error) {
      logger.error({ error }, 'Error in HANDLE_BALANCE_CONFIRMATION action:');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await callback?.({
        text: `处理确认响应时出现错误：${errorMessage}\n\n请稍后重试。`,
        actions: ['HANDLE_BALANCE_CONFIRMATION'],
        source: message.content.source,
      });
      
      return {
        success: false,
        text: '确认处理失败',
        values: {
          error: 'CONFIRMATION_HANDLING_FAILED',
          errorMessage: errorMessage,
        },
        data: {
          actionName: 'HANDLE_BALANCE_CONFIRMATION',
          error: errorMessage,
          messageId: message.id,
        },
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  },

  examples: [],
};

// EVM_BALANCE 动作定义（保留用于向后兼容，但不再直接触发）
// 注意：此动作不应该被 LLM 直接选择，应该通过 CONFIRM_BALANCE_QUERY -> HANDLE_BALANCE_CONFIRMATION 流程执行
export const evmBalanceAction: Action = {
  name: 'EVM_BALANCE',
  similes: [],
  description: 'DEPRECATED: 此动作已被弃用，不应该被直接调用。请使用 CONFIRM_BALANCE_QUERY 动作来处理余额查询请求。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    // 如果有 callback_data，说明是确认响应，应该由 HANDLE_BALANCE_CONFIRMATION 处理
    if (message.content.callback_data) {
      logger.info('EVM_BALANCE: Message has callback_data, skipping direct execution');
      return false;
    }
    
    // EVM_BALANCE 现在只在确认后通过 HANDLE_BALANCE_CONFIRMATION 内部调用
    // 禁用直接触发，强制使用确认流程
    logger.info('EVM_BALANCE validate called, but returning false to force confirmation flow');
    return false; // 不通过 validate 触发，而是通过其他动作调用
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    // EVM_BALANCE 现在主要通过 HANDLE_BALANCE_CONFIRMATION 调用 executeBalanceQuery
    // 保留此 handler 用于向后兼容或特殊场景
    try {
      logger.info('Handling EVM_BALANCE action (legacy handler)');
      
      const text = message.content.text || '';
      const addressInfo = await extractAddress(text);
      
      if (addressInfo.error || !addressInfo.address) {
        await callback({
          text: addressInfo.error || '无法获取钱包地址',
          actions: ['EVM_BALANCE'],
          source: message.content.source,
        });
        
        return {
          text: addressInfo.error || '地址获取失败',
          values: { success: false, error: addressInfo.error || 'ADDRESS_EXTRACTION_FAILED' },
          data: { actionName: 'EVM_BALANCE', messageId: message.id },
          success: false,
        };
      }
      
      return await executeBalanceQuery(addressInfo.address, text, callback);
      
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
  description: 'EVM钱包余额查询插件（带确认机制）',
  priority: 10000, // 设置非常高的优先级，确保优先于其他插件（包括官方 EVM 插件）
  actions: [
    handleBalanceConfirmationAction,  // 处理确认响应的优先级应该最高，放在最前面
    confirmBalanceQueryAction,  // 确认动作放在第二位
    evmBalanceAction,  // 保留用于向后兼容，但 validate 返回 false
  ],
};
