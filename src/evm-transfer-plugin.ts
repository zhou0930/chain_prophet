import { Plugin, Action, State, Memory, IAgentRuntime, ActionResult, HandlerCallback, logger } from '@elizaos/core';
import { createWalletClient, createPublicClient, http, parseEther, formatEther, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
  batch: {
    multicall: false
  },
  cacheTime: 0,
  pollingInterval: 0
});

// 提取转账参数：金额和接收地址（包含名单信息）
function extractTransferParams(text: string): { 
  amount: string | null; 
  to: string | null; 
  listType?: 'whitelist' | 'blacklist' | null;  // 名单类型
  originalName?: string;  // 原始名字/昵称
  error?: string;
} {

  // 匹配模式：任意中文或英文名字（地址+whitelist/blacklist）
  const listPattern = /([^\s（]+)（(0x[a-fA-F0-9]{40})\+(whitelist|blacklist)）/;
  const listMatch = text.match(listPattern);
  
  let to: string | null = null;
  let listType: 'whitelist' | 'blacklist' | null = null;
  let originalName: string | undefined = undefined;
  
  if (listMatch) {
    // 找到了带名单信息的格式
    originalName = listMatch[1].trim();
    to = listMatch[2];
    const listTypeStr = listMatch[3].toLowerCase();
    listType = listTypeStr === 'whitelist' ? 'whitelist' : 'blacklist';
    // 提取转账参数（带名单信息）
  } else {
    // 如果没有找到名单格式，则按原逻辑提取地址
    const addressRegex = /0x[a-fA-F0-9]{40}/g;
    const addresses = text.match(addressRegex) || [];
    to = addresses.length > 0 ? addresses[addresses.length - 1] : null;
    // 提取转账参数（无名单信息）
  }
  
  // 提取金额（支持多种格式）
  // 匹配：数字 + ETH/ether/wei 或纯数字（默认为 ETH）
  const amountPatterns = [
    /(\d+\.?\d*)\s*(?:ETH|ether|以太坊)/i,
    /(\d+\.?\d*)\s*(?:wei)/i,
    /发送\s*(\d+\.?\d*)\s*(?:ETH|ether|以太坊)?/i,
    /transfer\s+(\d+\.?\d*)\s*(?:ETH|ether)?/i,
    /send\s+(\d+\.?\d*)\s*(?:ETH|ether)?/i,
    /(\d+\.?\d*)\s*to\s*0x[a-fA-F0-9]{40}/i,
  ];
  
  let amount: string | null = null;
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      amount = match[1];
      break;
    }
  }
  
  // 如果没有找到明确的金额格式，尝试提取数字（可能是 ETH 数量）
  if (!amount) {
    const numberMatch = text.match(/(\d+\.?\d*)/);
    if (numberMatch && numberMatch[1]) {
      // 检查数字是否合理（0.001 到 1000 之间，可能是 ETH 金额）
      const num = parseFloat(numberMatch[1]);
      if (num >= 0.001 && num <= 1000) {
        amount = numberMatch[1];
      }
    }
  }
  
  return { amount, to, listType, originalName, error: undefined };
}

// 获取钱包账户
function getWalletAccount() {
  const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
  if (!evmPrivateKey || !evmPrivateKey.trim()) {
    throw new Error('未配置钱包私钥，请设置 EVM_PRIVATE_KEY 环境变量');
  }
  return privateKeyToAccount(evmPrivateKey.trim() as `0x${string}`);
}

// 执行转账的核心逻辑
async function executeTransfer(
  to: string, 
  amount: string, 
  originalText: string, 
  callback: HandlerCallback
): Promise<ActionResult> {
  try {
    // 验证地址格式
    if (!isAddress(to)) {
      await callback({
        text: `无效的接收地址：${to}。请提供有效的以太坊地址（0x开头的40位十六进制字符串）。`,
        actions: ['EVM_TRANSFER'],
      });
      
      return {
        success: false,
        text: '地址格式错误',
        values: {
          error: 'INVALID_ADDRESS',
          address: to,
        },
        error: new Error('INVALID_ADDRESS'),
      };
    }
    
    // 解析金额（默认单位为 ETH）
    let amountInWei: bigint;
    try {
      amountInWei = parseEther(amount);
    } catch (error) {
      await callback({
        text: `无效的金额格式：${amount}。请提供有效的数字（例如：0.1 或 1.5）。`,
        actions: ['EVM_TRANSFER'],
      });
      
      return {
        success: false,
        text: '金额格式错误',
        values: {
          error: 'INVALID_AMOUNT',
          amount: amount,
        },
        error: new Error('INVALID_AMOUNT'),
      };
    }
    
    // 获取钱包账户
    const account = getWalletAccount();
    
    // 创建钱包客户端
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    });
    
    // 查询发送者余额
    const balance = await publicClient.getBalance({
      address: account.address,
    });
    
    // 估算 Gas 费用
    let gasPrice: bigint;
    try {
      gasPrice = await publicClient.getGasPrice();
    } catch (error) {
      logger.error({ error }, '获取 Gas 价格失败，使用默认值');
      gasPrice = parseEther('0.00000000002');
    }
    
    let gasLimit: bigint = 21000n;
    try {
      const estimatedGas = await publicClient.estimateGas({
        account,
        to: to as `0x${string}`,
        value: amountInWei,
      });
      gasLimit = estimatedGas;
    } catch (error) {
      logger.error({ error }, 'Gas 估算失败，使用默认值');
    }
    
    // 计算总费用（转账金额 + Gas 费用）
    const totalCost = amountInWei + (gasPrice * gasLimit);
    
    // 检查余额是否足够
    if (balance < totalCost) {
      const balanceInEth = formatEther(balance);
      const totalCostInEth = formatEther(totalCost);
      
      await callback({
        text: `余额不足！\n\n钱包余额：${balanceInEth} ETH\n转账金额：${formatEther(amountInWei)} ETH\nGas 费用：约 ${formatEther(gasPrice * gasLimit)} ETH\n总计需要：${totalCostInEth} ETH\n\n请确保钱包中有足够的 ETH 用于转账和 Gas 费用。`,
        actions: ['EVM_TRANSFER'],
      });
      
      return {
        success: false,
        text: '余额不足',
        values: {
          error: 'INSUFFICIENT_BALANCE',
          balance: balanceInEth,
          required: totalCostInEth,
        },
        error: new Error('INSUFFICIENT_BALANCE'),
      };
    }
    
    // 发送进度更新
    await callback({
      text: `正在执行转账...\n\n发送地址：${account.address}\n接收地址：${to}\n金额：${formatEther(amountInWei)} ETH\n网络：Sepolia测试网`,
      actions: ['EVM_TRANSFER'],
    });
    
    // 执行转账
    const hash = await walletClient.sendTransaction({
      to: to as `0x${string}`,
      value: amountInWei,
      gas: gasLimit,
      gasPrice: gasPrice,
    });
    
    // 等待交易确认
    await callback({
      text: `交易已发送！正在等待确认...\n\n交易哈希：${hash}\n\n您可以在区块浏览器中查看交易状态：\nhttps://sepolia.etherscan.io/tx/${hash}`,
      actions: ['EVM_TRANSFER'],
    });
    
    // 等待交易确认（最多等待 60 秒）
    let receipt;
    try {
      receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60000,
      });
    } catch (error) {
      // 如果等待确认时出错（如 RPC 速率限制），交易可能已经成功
      // 检查是否是 RPC 相关错误
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRpcError = errorMessage.includes('429') || 
                        errorMessage.includes('rate limit') || 
                        errorMessage.includes('HTTP request failed') ||
                        errorMessage.includes('thirdweb');
      
      if (isRpcError) {
        // RPC 速率限制错误，但交易已发送，告诉用户到区块浏览器查看
        const timestamp = new Date().toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        logger.warn({ error, hash }, '等待交易确认时遇到 RPC 速率限制，但交易已成功发送');
        
        await callback({
          text: `✅ 交易已成功发送！\n\n由于 RPC 速率限制，无法立即获取交易确认状态。\n\n交易详情：\n发送地址：${account.address}\n接收地址：${to}\n金额：${formatEther(amountInWei)} ETH\n交易哈希：${hash}\n网络：Sepolia测试网\n发送时间：${timestamp}\n\n请到区块浏览器查看交易状态：\nhttps://sepolia.etherscan.io/tx/${hash}\n\n💡 提示：如果交易长时间未确认，可能需要检查网络状态或重试。`,
          actions: ['EVM_TRANSFER'],
        });
        
        // 即使无法获取 receipt，交易已发送就算成功
        return {
          success: true,
          text: `交易已成功发送 ${formatEther(amountInWei)} ETH 到 ${to}`,
          values: {
            success: true,
            to: to,
            amount: formatEther(amountInWei),
            hash: hash,
            rpcError: true,
          },
          data: {
            actionName: 'EVM_TRANSFER',
            to: to,
            amount: formatEther(amountInWei),
            hash: hash,
            timestamp: Date.now(),
            rpcError: true,
            error: errorMessage,
          },
        };
      } else {
        // 其他错误，可能是网络问题
        logger.error({ error, hash }, '等待交易确认时出错');
        
        await callback({
          text: `⚠️ 交易已发送，但无法确认状态\n\n交易哈希：${hash}\n错误：${errorMessage}\n\n请到区块浏览器手动查看交易状态：\nhttps://sepolia.etherscan.io/tx/${hash}\n\n如果交易长时间未确认，可能需要检查网络状态。`,
          actions: ['EVM_TRANSFER'],
        });
        
        // 交易已发送，即使无法确认也算部分成功
        return {
          success: true,
          text: `交易已发送 ${formatEther(amountInWei)} ETH 到 ${to}（无法确认状态）`,
          values: {
            success: true,
            to: to,
            amount: formatEther(amountInWei),
            hash: hash,
            confirmationError: true,
          },
          data: {
            actionName: 'EVM_TRANSFER',
            to: to,
            amount: formatEther(amountInWei),
            hash: hash,
            timestamp: Date.now(),
            confirmationError: true,
            error: errorMessage,
          },
        };
      }
    }
    
    // 成功获取 receipt
    const timestamp = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    if (receipt.status === 'success') {
      const resultText = `✅ 转账成功！\n\n发送地址：${account.address}\n接收地址：${to}\n金额：${formatEther(amountInWei)} ETH\n交易哈希：${hash}\n区块号：${receipt.blockNumber}\nGas 使用：${receipt.gasUsed.toString()}\n网络：Sepolia测试网\n时间：${timestamp}\n\n查看交易：https://sepolia.etherscan.io/tx/${hash}`;
      
      await callback({
        text: resultText,
        actions: ['EVM_TRANSFER'],
      });
      
      return {
        success: true,
        text: `成功转账 ${formatEther(amountInWei)} ETH 到 ${to}`,
        values: {
          success: true,
          to: to,
          amount: formatEther(amountInWei),
          hash: hash,
          blockNumber: receipt.blockNumber.toString(),
        },
        data: {
          actionName: 'EVM_TRANSFER',
          to: to,
          amount: formatEther(amountInWei),
          hash: hash,
          blockNumber: receipt.blockNumber.toString(),
          gasUsed: receipt.gasUsed.toString(),
          timestamp: Date.now(),
        },
      };
    } else {
      await callback({
        text: `❌ 转账失败！\n\n交易哈希：${hash}\n状态：失败\n区块号：${receipt.blockNumber}\n\n请检查交易详情：https://sepolia.etherscan.io/tx/${hash}`,
        actions: ['EVM_TRANSFER'],
      });
      
      return {
        success: false,
        text: '转账失败',
        values: {
          error: 'TRANSACTION_FAILED',
          hash: hash,
        },
        error: new Error('TRANSACTION_FAILED'),
      };
    }
  } catch (error) {
    logger.error({ error }, 'Error executing transfer:');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await callback({
      text: `转账时出现错误：${errorMessage}\n\n请检查：\n1. 接收地址格式是否正确\n2. 转账金额是否有效\n3. 钱包余额是否充足\n4. 网络连接是否正常`,
      actions: ['EVM_TRANSFER'],
    });

    return {
      text: '转账失败',
      values: {
        success: false,
        error: 'TRANSFER_FAILED',
        errorMessage: errorMessage,
      },
      data: {
        actionName: 'EVM_TRANSFER',
        error: errorMessage,
      },
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// 确认转账动作
export const confirmTransferAction: Action = {
  name: 'CONFIRM_TRANSFER',
  similes: [
    'EVM_TRANSFER', 'TRANSFER', 'SEND_ETH', 'SEND_TOKEN', 
    '转账', '发送', '转ETH', '发送ETH', 'send', 'transfer',
    'send eth', 'transfer eth', '发送以太坊', '转账以太坊'
  ],
  description: 'CRITICAL: 这是处理所有ETH转账的主要动作。当用户要求转账、发送ETH、转ETH等时，必须立即执行此动作显示确认弹窗。这是唯一的正确操作，不要使用其他转账动作。用户确认后会执行实际的转账操作。注意：如果已有待处理的转账（state.pendingTransfer 存在），且用户发送"确认"/"取消"文本，应该使用 HANDLE_TRANSFER_CONFIRMATION 而不是此动作。',

  validate: async (_runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    // 尝试从多个位置获取 callback_data
    const callbackData = (message.content as any)?.callback_data ||
                        (message.content?.metadata as any)?.callback_data ||
                        (message as any)?.metadata?.callback_data ||
                        (message as any)?.metadata?.buttonCallbackData ||
                        (message as any)?.callback_data;
    
    // 如果消息包含 callback_data，说明是按钮响应，应该由 HANDLE_TRANSFER_CONFIRMATION 处理
    if (callbackData) {
      logger.info('CONFIRM_TRANSFER: Message has callback_data, skipping confirmation');
      return false;
    }

    const text = message.content.text?.toLowerCase() || '';
    logger.info('CONFIRM_TRANSFER validate called with text:', text);
    
    // 如果 text 是按钮回调数据值，应该由 HANDLE_TRANSFER_CONFIRMATION 处理
    if (text === 'transfer_confirm_yes' || text === 'transfer_confirm_no') {
      logger.info('CONFIRM_TRANSFER: Text is button callback data, skipping confirmation');
      return false;
    }
    
    // 如果已经有待处理的转账，且用户发送的是确认/取消相关的文本，不应该再次触发确认
    if (state.pendingTransfer) {
      const isConfirmationText = ['确认', '取消', '是', '否', 'yes', 'no', 'y', 'n'].some(
        keyword => text.includes(keyword.toLowerCase())
      );
      if (isConfirmationText) {
        logger.info('CONFIRM_TRANSFER: Pending transfer exists and user sent confirmation text, skip - HANDLE_TRANSFER_CONFIRMATION should handle this');
        return false;
      }
    }
    
    // 检查是否包含转账相关关键词
    const transferKeywords = [
      '转账', '发送', 'transfer', 'send', 
      '转eth', '发送eth', 'send eth', 'transfer eth',
      '转以太坊', '发送以太坊', '转eth到', 'send to',
      '转给', '发给', '转', '给'  // 添加更短的关键词
    ];
    
    const hasTransferKeyword = transferKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    // 检查是否包含地址
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    const hasAddress = addressRegex.test(text);
    
    // 检查是否包含金额（包括"转0.001eth"这种格式）
    const amountPatterns = [
      /\d+\.?\d*\s*(?:ETH|ether|以太坊)/i,
      /转\s*\d+\.?\d*\s*(?:eth|ether|以太坊)?/i,  // 匹配"转0.001eth"、"转0.001 eth"等
      /发送\s*\d+\.?\d*/i,
      /transfer\s+\d+\.?\d*/i,
      /send\s+\d+\.?\d*/i,
      /\d+\.?\d*\s*(?:eth|ether)/i,  // 匹配"0.001eth"、"0.001 eth"等
    ];
    const hasAmount = amountPatterns.some(pattern => pattern.test(text));
    
    // 匹配"转X eth给地址"这种格式（中文常用）
    const chineseTransferPattern = /转\s*\d+\.?\d*\s*(?:eth|ether|以太坊)?\s*给\s*0x[a-fA-F0-9]{40}/i;
    const matchesChinesePattern = chineseTransferPattern.test(text);
    
    // 匹配"转X到地址"、"转X给地址"等格式
    const chineseSimplePattern = /转\s*\d+\.?\d*/i.test(text) && 
                                  (text.includes('给') || text.includes('到') || text.includes('to')) &&
                                  hasAddress;
    
    // 如果包含转账关键词、地址和金额（或地址），则触发确认
    // 或者匹配中文常用格式"转X eth给地址"
    const shouldTrigger = (hasTransferKeyword && hasAddress && (hasAmount || text.includes('到') || text.includes('to') || text.includes('给'))) ||
                          matchesChinesePattern ||
                          chineseSimplePattern;
    
    // 验证是否应该触发转账确认
    
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
      logger.info('Handling CONFIRM_TRANSFER action');
      
      const text = message.content.text || '';
      const transferParams = extractTransferParams(text);
      
      if (transferParams.error || !transferParams.to || !transferParams.amount) {
        let errorMsg = '无法解析转账信息。请提供以下信息：\n1. 接收地址（0x开头的40位十六进制）\n2. 转账金额（例如：0.1 ETH）\n\n示例：发送 0.1 ETH 到 0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        
        if (!transferParams.to) {
          errorMsg = '未找到接收地址。请提供有效的以太坊地址（0x开头的40位十六进制字符串）。';
        } else if (!transferParams.amount) {
          errorMsg = '未找到转账金额。请指定要转账的 ETH 数量（例如：0.1 或 1.5）。';
        }
        
        await callback?.({
          text: errorMsg,
          actions: ['CONFIRM_TRANSFER'],
          source: message.content.source,
        });
        
        return {
          success: false,
          text: errorMsg,
          values: {
            error: 'PARAMETER_EXTRACTION_FAILED',
            errorMessage: errorMsg,
          },
          data: {
            actionName: 'CONFIRM_TRANSFER',
            messageId: message.id,
            error: errorMsg,
          },
          error: new Error(errorMsg),
        };
      }
      
      // 验证地址格式
      if (!isAddress(transferParams.to)) {
        await callback?.({
          text: `无效的接收地址：${transferParams.to}。请提供有效的以太坊地址（0x开头的40位十六进制字符串）。`,
          actions: ['CONFIRM_TRANSFER'],
          source: message.content.source,
        });
        
        return {
          success: false,
          text: '地址格式错误',
          values: {
            error: 'INVALID_ADDRESS',
            address: transferParams.to,
          },
          error: new Error('INVALID_ADDRESS'),
        };
      }
      
      // 验证金额
      const amountNum = parseFloat(transferParams.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        await callback?.({
          text: `无效的转账金额：${transferParams.amount}。请提供有效的正数（例如：0.1 或 1.5）。`,
          actions: ['CONFIRM_TRANSFER'],
          source: message.content.source,
        });
        
        return {
          success: false,
          text: '金额格式错误',
          values: {
            error: 'INVALID_AMOUNT',
            amount: transferParams.amount,
          },
          error: new Error('INVALID_AMOUNT'),
        };
      }
      
      // 获取发送者地址
      let fromAddress: string;
      try {
        const account = getWalletAccount();
        fromAddress = account.address;
      } catch (error) {
        await callback?.({
          text: '无法获取发送钱包地址。请确保已配置 EVM_PRIVATE_KEY 环境变量。',
          actions: ['CONFIRM_TRANSFER'],
          source: message.content.source,
        });
        
        return {
          success: false,
          text: '钱包配置错误',
          values: {
            error: 'WALLET_CONFIG_ERROR',
          },
          error: new Error('WALLET_CONFIG_ERROR'),
        };
      }
      
      // 构建确认消息（根据名单类型显示不同级别的警告）
      let confirmText = `请确认以下转账信息：\n\n发送地址：${fromAddress}\n接收地址：${transferParams.to}`;
      
      // 如果有原始名字/昵称，显示在确认消息中
      if (transferParams.originalName) {
        confirmText += `\n接收人：${transferParams.originalName}`;
      }
      
      confirmText += `\n金额：${transferParams.amount} ETH\n网络：Sepolia测试网\n\n`;
      
      // 根据名单类型显示不同级别的警告
      if (transferParams.listType === 'whitelist') {
        // 白名单：轻微提醒
        confirmText += `✅ 该地址在白名单中，可以安全转账。\n⚠️ 请仔细核对接收地址，转账一旦完成无法撤销！`;
      } else if (transferParams.listType === 'blacklist') {
        // 黑名单：严重警告
        confirmText += `🚨 严重警告：强烈建议不要向此地址转账！\n🚨 转账可能存在风险，请谨慎操作！\n⚠️ 请仔细核对接收地址，转账一旦完成无法撤销！`;
      } else {
        // 无名单信息：中等提示
        confirmText += `⚠️ 请仔细核对接收地址，确认无误后再继续。\n⚠️ 转账一旦完成无法撤销！`;
      }
      
      // 保存原始转账信息到 state，供确认后使用
      if (!state.pendingTransfer) {
        state.pendingTransfer = {};
      }
      state.pendingTransfer = {
        originalText: text,
        timestamp: Date.now(),
        to: transferParams.to,
        amount: transferParams.amount,
        listType: transferParams.listType,
        originalName: transferParams.originalName,
      };
      
      // 发送确认请求，包含按钮
      const buttonsContent = [
        [
          { text: '✅ 确认转账', callback_data: 'transfer_confirm_yes' },
          { text: '❌ 取消', callback_data: 'transfer_confirm_no' }
        ]
      ];
      
      await callback?.({
        text: confirmText,
        buttons: buttonsContent,
        actions: ['CONFIRM_TRANSFER'],
        source: message.content.source,
        metadata: {
          buttons: buttonsContent,
        },
      });
      
      return {
        success: true,
        text: '等待用户确认转账...',
        values: {
          pendingConfirmation: true,
          originalQuery: text,
          to: transferParams.to,
          amount: transferParams.amount,
        },
        data: {
          actionName: 'CONFIRM_TRANSFER',
          messageId: message.id,
          to: transferParams.to,
          amount: transferParams.amount,
          buttons: buttonsContent,
        },
      };
      
    } catch (error) {
      logger.error({ error }, 'Error in CONFIRM_TRANSFER action:');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await callback?.({
        text: `显示确认弹窗时出现错误：${errorMessage}\n\n请稍后重试。`,
        actions: ['CONFIRM_TRANSFER'],
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
          actionName: 'CONFIRM_TRANSFER',
          error: errorMessage,
          messageId: message.id,
        },
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  },

  examples: [],
};

// 处理转账确认动作
export const handleTransferConfirmationAction: Action = {
  name: 'HANDLE_TRANSFER_CONFIRMATION',
  similes: [
    'PROCESS_TRANSFER_CONFIRMATION', '确认转账', '取消转账',
    'CONFIRM_TRANSFER', 'CANCEL_TRANSFER', 'TRANSFER_CONFIRMED', 'TRANSFER_CANCELLED',
    '确认', '取消', '是', '否', 'yes', 'no'
  ],
  description: 'ABSOLUTE PRIORITY - HANDLE_TRANSFER_CONFIRMATION: 这是处理转账确认响应的唯一动作。当用户发送"确认"/"取消"文本或点击确认/取消按钮时，必须立即执行此动作，而不是 REPLY 或 CONFIRM_TRANSFER。此动作会检查待处理的转账并执行实际的转账或取消操作。',

  validate: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    // 尝试从多个位置获取 callback_data
    const callbackData = (message.content as any)?.callback_data ||
                        (message.content?.metadata as any)?.callback_data ||
                        (message as any)?.metadata?.callback_data ||
                        (message as any)?.metadata?.buttonCallbackData ||
                        (message as any)?.callback_data;
    const text = (message.content.text || '').toLowerCase().trim();
    
    // 支持按钮回调数据和文本确认
    const isButtonYes = callbackData === 'transfer_confirm_yes' || text === 'transfer_confirm_yes';
    const isButtonNo = callbackData === 'transfer_confirm_no' || text === 'transfer_confirm_no';
    const isTextYes = text === '确认' || text === '是' || text === 'yes' || text === 'y' || text.includes('确认转账');
    const isTextNo = text === '取消' || text === '否' || text === 'no' || text === 'n' || text.includes('取消');
    
    // 检查是否有待处理的转账（从 state 或最近的记忆中查找）
    let hasPendingTransfer = !!state.pendingTransfer;
    
    // 如果 state 中没有，尝试从最近的消息记忆中查找确认请求
    if (!hasPendingTransfer && message.roomId) {
      try {
        const recentMemories = await runtime.getMemories({
          roomId: message.roomId,
          count: 10,
          unique: true,
          tableName: 'messages',
        });
        
        // 查找最近包含转账确认请求或按钮的消息
        const confirmationMessage = recentMemories.find(mem => {
          const memContent = mem.content?.text || '';
          const memAsAny = mem as any;
          const memActions = (mem.content as any)?.actions || memAsAny?.data?.actions || [];
          const memButtons = (mem.content as any)?.buttons || (mem.content?.metadata as any)?.buttons;
          
          return (
            memActions.includes('CONFIRM_TRANSFER') ||
            memContent.includes('请确认以下转账') ||
            memContent.includes('确认转账') ||
            (memButtons && Array.isArray(memButtons) && memButtons.some((row: any[]) =>
              row.some((btn: any) => 
                btn.callback_data === 'transfer_confirm_yes' || btn.callback_data === 'transfer_confirm_no'
              )
            ))
          );
        });
        
        if (confirmationMessage) {
          hasPendingTransfer = true;
          logger.info({}, 'HANDLE_TRANSFER_CONFIRMATION validate: 从消息记忆中找到了确认请求');
        }
      } catch (error) {
        logger.error({ error }, 'HANDLE_TRANSFER_CONFIRMATION validate: 获取消息记忆时出错');
      }
    }
    
    // 验证是否应该处理转账确认响应
    
    return hasPendingTransfer && (isButtonYes || isButtonNo || isTextYes || isTextNo);
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
      logger.info('Handling HANDLE_TRANSFER_CONFIRMATION action');
      
      // 尝试从多个位置获取 callback_data
      const callbackData = (message.content as any)?.callback_data ||
                          (message.content?.metadata as any)?.callback_data ||
                          (message as any)?.metadata?.callback_data ||
                          (message as any)?.metadata?.buttonCallbackData ||
                          (message as any)?.callback_data;
      const text = (message.content.text || '').toLowerCase().trim();
      
      // 判断用户是确认还是取消
      const isConfirm = callbackData === 'transfer_confirm_yes' || 
                       text === 'transfer_confirm_yes' ||
                       text === '确认' || text === '是' || text === 'yes' || text === 'y' || text.includes('确认转账');
      const isCancel = callbackData === 'transfer_confirm_no' || 
                      text === 'transfer_confirm_no' ||
                      text === '取消' || text === '否' || text === 'no' || text === 'n' || text.includes('取消');
      
      // 判断用户是确认还是取消
      
      if (isCancel) {
        // 用户取消转账
        await callback?.({
          text: '转账已取消',
          actions: ['HANDLE_TRANSFER_CONFIRMATION'],
          source: message.content.source,
        });
        
        // 清除待处理的转账信息
        if (state.pendingTransfer) {
          delete state.pendingTransfer;
        }
        
        return {
          success: true,
          text: '用户取消转账',
          values: {
            confirmed: false,
            cancelled: true,
          },
          data: {
            actionName: 'HANDLE_TRANSFER_CONFIRMATION',
            messageId: message.id,
            cancelled: true,
          },
        };
      }
      
      // 用户确认转账
      if (isConfirm) {
        // 获取保存的原始转账信息（先从 state 获取，如果不存在则从消息记忆中恢复）
        let pendingTransfer = state.pendingTransfer;
        
        // 如果 state 中没有，尝试从最近的消息记忆中恢复
        if ((!pendingTransfer || !pendingTransfer.to || !pendingTransfer.amount) && message.roomId) {
          try {
            const recentMemories = await runtime.getMemories({
              roomId: message.roomId,
              count: 20,
              unique: true,
              tableName: 'messages',
            });
            
            // 查找确认请求消息（包含转账确认按钮的消息）
            const confirmationMessage = recentMemories.find(mem => {
              const memActions = (mem.content as any)?.actions || (mem as any)?.data?.actions || [];
              const memButtons = (mem.content as any)?.buttons || (mem.content?.metadata as any)?.buttons;
              const memContent = mem.content?.text || '';
              
              return (
                memActions.includes('CONFIRM_TRANSFER') ||
                memContent.includes('请确认以下转账') ||
                (memButtons && Array.isArray(memButtons) && memButtons.some((row: any[]) =>
                  row.some((btn: any) => 
                    btn.callback_data === 'transfer_confirm_yes' || btn.callback_data === 'transfer_confirm_no'
                  )
                ))
              );
            });
            
            // 如果找到确认消息，从中提取转账信息
            if (confirmationMessage) {
              const memContent = confirmationMessage.content?.text || '';
              const transferParams = extractTransferParams(memContent);
              
              if (transferParams.to && transferParams.amount) {
                pendingTransfer = {
                  originalText: memContent,
                  timestamp: confirmationMessage.createdAt ? new Date(confirmationMessage.createdAt).getTime() : Date.now(),
                  to: transferParams.to,
                  amount: transferParams.amount,
                };
                
                // 从消息记忆中恢复了转账信息
              }
            }
            
            // 如果还是没找到，尝试查找用户的原始转账请求消息
            if (!pendingTransfer && confirmationMessage) {
              // 查找用户的原始转账请求消息（包含地址和金额的消息）
              const userTransferMessage = recentMemories.find(mem => {
                const memAsAny = mem as any;
                const messageAsAny = message as any;
                const isUserMessage = memAsAny.userId && memAsAny.userId === messageAsAny.userId && memAsAny.userId !== messageAsAny.agentId;
                if (!isUserMessage) {
                  const source = (mem.content as any)?.source;
                  const isNotAgent = source !== 'agent' && source !== 'assistant';
                  if (!isNotAgent) return false;
                }
                
                const memText = mem.content?.text || '';
                const addressRegex = /0x[a-fA-F0-9]{40}/;
                const hasAddress = addressRegex.test(memText);
                const hasTransferKeyword = /转账|发送|transfer|send/i.test(memText);
                const hasAmount = /\d+\.?\d*/.test(memText);
                
                return hasAddress && hasTransferKeyword && hasAmount;
              });
              
              if (userTransferMessage) {
                const originalText = userTransferMessage.content?.text || '';
                const transferParams = extractTransferParams(originalText);
                
                if (transferParams.to && transferParams.amount) {
                  pendingTransfer = {
                    originalText: originalText,
                    timestamp: userTransferMessage.createdAt ? new Date(userTransferMessage.createdAt).getTime() : Date.now(),
                    to: transferParams.to,
                    amount: transferParams.amount,
                  };
                  
                  // 从用户消息中恢复了转账信息
                }
              }
            }
          } catch (error) {
            logger.error({ error }, 'HANDLE_TRANSFER_CONFIRMATION: 从消息记忆中恢复转账信息时出错');
          }
        }
        
        if (!pendingTransfer || !pendingTransfer.to || !pendingTransfer.amount) {
          await callback?.({
            text: '未找到转账信息，请重新发起转账请求。',
            actions: ['HANDLE_TRANSFER_CONFIRMATION'],
            source: message.content.source,
          });
          
          return {
            success: false,
            text: '转账信息丢失',
            values: {
              error: 'PENDING_TRANSFER_NOT_FOUND',
            },
            data: {
              actionName: 'HANDLE_TRANSFER_CONFIRMATION',
              messageId: message.id,
            },
            error: new Error('PENDING_TRANSFER_NOT_FOUND'),
          };
        }
        
        // 清除待处理的转账信息
        delete state.pendingTransfer;
        
        // 执行实际的转账
        const result = await executeTransfer(
          pendingTransfer.to,
          pendingTransfer.amount,
          pendingTransfer.originalText,
          callback
        );
        
        // 返回增强的结果，包含确认信息
        return {
          ...result,
          success: result.success,
          text: result.text || '转账完成',
          values: {
            ...result.values,
            confirmed: true,
          },
          data: {
            ...result.data,
            confirmed: true,
          },
        };
      }
      
      // 未知的确认响应
      await callback?.({
        text: '未知的确认响应，请重新发起转账。',
        actions: ['HANDLE_TRANSFER_CONFIRMATION'],
        source: message.content.source,
      });
      
      return {
        success: false,
        text: '未知的确认响应',
        values: {
          error: 'UNKNOWN_CONFIRMATION_RESPONSE',
        },
        data: {
          actionName: 'HANDLE_TRANSFER_CONFIRMATION',
          messageId: message.id,
          callbackData: callbackData,
        },
        error: new Error('UNKNOWN_CONFIRMATION_RESPONSE'),
      };
      
    } catch (error) {
      logger.error({ error }, 'Error in HANDLE_TRANSFER_CONFIRMATION action:');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await callback?.({
        text: `处理确认响应时出现错误：${errorMessage}\n\n请稍后重试。`,
        actions: ['HANDLE_TRANSFER_CONFIRMATION'],
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
          actionName: 'HANDLE_TRANSFER_CONFIRMATION',
          error: errorMessage,
          messageId: message.id,
        },
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  },

  examples: [],
};

// 创建EVM转账插件
export const evmTransferPlugin: Plugin = {
  name: 'EVM Transfer Plugin',
  description: 'EVM转账插件（带确认机制）',
  priority: 10000, // 设置非常高的优先级，确保优先于其他插件（包括官方 EVM 插件）
  actions: [
    handleTransferConfirmationAction,  // 处理确认响应的优先级应该最高，放在最前面
    confirmTransferAction,  // 确认动作放在第二位
  ],
};

