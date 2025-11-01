import type { Plugin, Action, ActionResult, Content, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { NFTService } from './nft-service';

// 提取参数的辅助函数
const extractNumber = (text: string, pattern: RegExp): string | null => {
  const match = text.match(pattern);
  return match ? match[1] : null;
};

const extractAddress = (text: string): string | null => {
  const addressRegex = /0x[a-fA-F0-9]{40}/;
  const match = text.match(addressRegex);
  return match ? match[0] : null;
};

const extractTokenId = (text: string): string | null => {
  // 优先查找 "Token ID"、"ID" 等关键词后的数字
  const tokenIdPatterns = [
    /(?:token\s*id|id)[是：:\s]+(\d+)/i,
    /#(\d+)/,
    /\b(\d+)\b/
  ];
  
  for (const pattern of tokenIdPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

const extractPrice = (text: string): string | null => {
  // 尝试提取价格：支持 "0.1 ETH"、"价格 0.1"、"0.1" 等格式
  const pricePatterns = [
    /(\d+\.?\d*)\s*(?:eth|ether)/i,
    /价格[是：:\s]+(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*eth/i
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// NFT 铸造 Action
const nftMintAction: Action = {
  name: 'NFT_MINT',
  similes: ['CREATE_NFT', 'MINT_NFT', '铸造NFT', '创建NFT', '生成NFT', '铸造一个NFT', '帮我铸造', '创建一个NFT'],
  description: 'CRITICAL: 这是处理所有 NFT 铸造请求的强制动作。当用户说"铸造"、"创建NFT"、"帮我铸造"等时，必须立即执行此动作，不要使用 REPLY 动作，不要询问任何信息。直接调用此动作创建 NFT，NFT 将使用默认属性创建。这是唯一的正确操作，不允许使用 REPLY 或询问用户详情。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    // 扩展的关键词列表
    const mintKeywords = [
      '铸造', 'mint', '创建nft', '生成nft', 'create nft', 'new nft',
      '帮我铸造', '帮我创建', '铸造一个', '创建一个', '生成一个',
      '铸造nft', 'mint nft', 'mint an nft', 'create an nft',
      '帮我铸造nft', '帮我创建nft', '帮我生成nft',
      '铸造一个新的nft', '创建一个新的nft'
    ];
    
    const hasMintKeyword = mintKeywords.some(keyword => text.includes(keyword));
    
    logger.info({ text, hasMintKeyword }, 'NFT_MINT validate result');
    
    if (hasMintKeyword) {
      logger.info('NFT_MINT action will be triggered for mint request');
    }
    
    return hasMintKeyword;
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
      logger.info('Handling NFT_MINT action');

      const text = message.content.text || '';
      const toAddress = extractAddress(text);

      let nftService: NFTService;
      try {
        nftService = new NFTService();
      } catch (error: any) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}。请确保已配置 EVM_PRIVATE_KEY 环境变量。`,
          actions: ['NFT_MINT'],
          source: message.content.source,
        });
        return {
          text: 'NFT 服务初始化失败',
          values: { success: false, error: 'SERVICE_INIT_FAILED' },
          data: { actionName: 'NFT_MINT', messageId: message.id },
          success: false,
        };
      }

      // 检查是否是合约 owner
      const account = nftService['walletClient'].account;
      if (!account) {
        throw new Error('无法获取账户信息');
      }

      const isOwner = await nftService.checkIsOwner(account.address);
      if (!isOwner) {
        await callback({
          text: '您不是合约所有者，无法铸造 NFT。只有合约部署者可以铸造。',
          actions: ['NFT_MINT'],
          source: message.content.source,
        });
        return {
          text: '权限不足',
          values: { success: false, error: 'NOT_OWNER' },
          data: { actionName: 'NFT_MINT', messageId: message.id },
          success: false,
        };
      }

      // 直接铸造 NFT，使用默认值（不需要名称、描述等信息）
      // 通知用户正在铸造
      await callback({
        text: '正在为您铸造 NFT...',
        actions: ['NFT_MINT'],
        source: message.content.source,
      });

      const recipientAddress = toAddress || account.address;
      const hash = await nftService.mintNFT(recipientAddress);

      await callback({
        text: `NFT 铸造成功！\n\n交易哈希: ${hash}\n接收地址: ${recipientAddress}\n\nNFT 已使用默认属性创建，后续可以通过其他方式更新元数据。`,
        actions: ['NFT_MINT'],
        source: message.content.source,
      });

      return {
        text: `成功铸造 NFT，交易哈希: ${hash}`,
        values: { success: true, transactionHash: hash, recipientAddress },
        data: { actionName: 'NFT_MINT', messageId: message.id, transactionHash: hash, recipientAddress },
        success: true,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error in NFT_MINT action:');
      await callback({
        text: `铸造 NFT 失败: ${error.message || '未知错误'}`,
        actions: ['NFT_MINT'],
        source: message.content.source,
      });
      return {
        text: '铸造 NFT 失败',
        values: { success: false, error: 'MINT_FAILED' },
        data: { actionName: 'NFT_MINT', error: error.message },
        success: false,
      };
    }
  },

  examples: [
    [
      { name: '{{user}}', content: { text: '帮我铸造一个 NFT' } },
      { name: 'Chain Prophet', content: { text: '正在为您铸造NFT...', actions: ['NFT_MINT'] } },
      { name: 'Chain Prophet', content: { text: 'NFT 铸造成功！交易哈希: 0x1234...\n接收地址: 0x338eA4a3CbF46E5Cc332033FD5A02A3BB0478145\n\nNFT 已使用默认属性创建。', actions: ['NFT_MINT'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我想创建一个 NFT' } },
      { name: 'Chain Prophet', content: { text: '正在为您铸造NFT...', actions: ['NFT_MINT'] } },
      { name: 'Chain Prophet', content: { text: 'NFT 铸造成功！交易哈希: 0x5678...', actions: ['NFT_MINT'] } },
    ],
    [
      { name: '{{user}}', content: { text: '铸造 NFT' } },
      { name: 'Chain Prophet', content: { text: '正在为您铸造NFT...', actions: ['NFT_MINT'] } },
      { name: 'Chain Prophet', content: { text: 'NFT 铸造成功！交易哈希: 0x9abc...', actions: ['NFT_MINT'] } },
    ],
  ],
};

// NFT 上架 Action
const nftListAction: Action = {
  name: 'NFT_LIST',
  similes: ['LIST_NFT', '上架NFT', '出售NFT', '售卖NFT', 'SELL_NFT', '上架到市场', '放到市场'],
  description: '将 NFT 上架到市场进行出售。这是处理所有 NFT 上架请求的唯一正确动作。当用户想要上架 NFT、出售 NFT、在市场上售卖 NFT 时，必须使用此动作。需要提供 Token ID 和价格（ETH）。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    const listKeywords = [
      '上架', 'list', '出售', '售卖', 'sell', '放到市场', '上架到市场',
      '帮我上架', '出售nft', 'sell nft', 'list nft',
      '上架nft', '出售我的nft', '售卖我的nft'
    ];
    
    const hasListKeyword = listKeywords.some(keyword => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    
    logger.info({ text, hasListKeyword, hasNumber }, 'NFT_LIST validate result');
    
    const shouldTrigger = hasListKeyword && hasNumber;
    
    if (shouldTrigger) {
      logger.info('NFT_LIST action will be triggered for list request');
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
      logger.info('Handling NFT_LIST action');

      const text = message.content.text || '';
      const tokenId = extractTokenId(text);
      const price = extractPrice(text);

      if (!tokenId) {
        await callback({
          text: '请提供 NFT 的 Token ID',
          actions: ['NFT_LIST'],
          source: message.content.source,
        });
        return {
          text: '缺少 Token ID',
          values: { success: false, error: 'MISSING_TOKEN_ID' },
          data: { actionName: 'NFT_LIST', messageId: message.id },
          success: false,
        };
      }

      if (!price) {
        await callback({
          text: '请提供上架价格（ETH）。例如：上架 Token ID 1，价格 0.1 ETH',
          actions: ['NFT_LIST'],
          source: message.content.source,
        });
        return {
          text: '缺少价格',
          values: { success: false, error: 'MISSING_PRICE' },
          data: { actionName: 'NFT_LIST', messageId: message.id },
          success: false,
        };
      }

      let nftService: NFTService;
      try {
        nftService = new NFTService();
      } catch (error: any) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ['NFT_LIST'],
          source: message.content.source,
        });
        return {
          text: 'NFT 服务初始化失败',
          values: { success: false, error: 'SERVICE_INIT_FAILED' },
          data: { actionName: 'NFT_LIST', messageId: message.id },
          success: false,
        };
      }

      try {
        const hash = await nftService.listNFT(tokenId, price);

        await callback({
          text: `NFT 上架成功！交易哈希: ${hash}\nToken ID: ${tokenId}\n价格: ${price} ETH`,
          actions: ['NFT_LIST'],
          source: message.content.source,
        });

        return {
          text: `成功上架 NFT，交易哈希: ${hash}`,
          values: { success: true, transactionHash: hash, tokenId, price },
          data: { actionName: 'NFT_LIST', messageId: message.id, transactionHash: hash, tokenId, price },
          success: true,
        };
      } catch (listError: any) {
        // 如果是因为授权错误，尝试自动授权
        const errorMessage = listError.message || '';
        const isApprovalError = errorMessage.includes('0x177e802f') || 
                                errorMessage.includes('ERC721InsufficientApproval') ||
                                errorMessage.includes('insufficient approval') ||
                                errorMessage.includes('caller is not token owner or approved');

        if (isApprovalError) {
          logger.info(`检测到授权错误，尝试自动授权 NFT ${tokenId}...`);
          try {
            // 先授权
            const approveHash = await nftService.approveMarketplace(tokenId);
            await callback({
              text: `检测到需要授权，正在进行授权...\n授权交易哈希: ${approveHash}\n请等待几秒钟后再次尝试上架。`,
              actions: ['NFT_LIST'],
              source: message.content.source,
            });
            
            // 等待授权确认
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 再次尝试上架
            const hash = await nftService.listNFT(tokenId, price, false);
            
            await callback({
              text: `授权成功，NFT 上架成功！\n授权交易哈希: ${approveHash}\n上架交易哈希: ${hash}\nToken ID: ${tokenId}\n价格: ${price} ETH`,
              actions: ['NFT_LIST'],
              source: message.content.source,
            });

            return {
              text: `成功上架 NFT，交易哈希: ${hash}`,
              values: { success: true, transactionHash: hash, tokenId, price },
              data: { actionName: 'NFT_LIST', messageId: message.id, transactionHash: hash, tokenId, price },
              success: true,
            };
          } catch (approveError: any) {
            throw new Error(`授权失败: ${approveError.message}。请手动授权市场合约后再试。`);
          }
        }
        
        // 其他错误，直接抛出
        throw listError;
      }
    } catch (error: any) {
      logger.error({ error }, 'Error in NFT_LIST action:');
      
      // 分析错误原因
      const { analyzeNFTError } = await import('./nft-service');
      const errorAnalysis = analyzeNFTError(error, '上架 NFT');
      
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ['NFT_LIST'],
        source: message.content.source,
      });
      
      return {
        text: `上架 NFT 失败: ${errorAnalysis.errorType}`,
        values: { 
          success: false, 
          error: 'LIST_FAILED',
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: { 
          actionName: 'NFT_LIST', 
          error: error.message,
          errorAnalysis 
        },
        success: false,
      };
    }
  },

  examples: [
    [
      { name: '{{user}}', content: { text: '上架 Token ID 1，价格 0.1 ETH' } },
      { name: 'Chain Prophet', content: { text: 'NFT 上架成功！交易哈希: 0x...', actions: ['NFT_LIST'] } },
    ],
    [
      { name: '{{user}}', content: { text: '帮我上架 ID 为 5 的 NFT，价格 0.5 ETH' } },
      { name: 'Chain Prophet', content: { text: 'NFT 上架成功！交易哈希: 0x...', actions: ['NFT_LIST'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我想出售我的 NFT，Token ID 是 3，价格 1 ETH' } },
      { name: 'Chain Prophet', content: { text: 'NFT 上架成功！交易哈希: 0x...', actions: ['NFT_LIST'] } },
    ],
  ],
};

// NFT 质押 Action
const nftStakeAction: Action = {
  name: 'NFT_STAKE',
  similes: ['STAKE_NFT', '质押NFT', '锁定NFT', 'LOCK_NFT', '质押我的NFT', '把NFT质押'],
  description: '质押 NFT 以获得奖励。这是处理所有 NFT 质押请求的唯一正确动作。当用户想要质押 NFT、锁定 NFT 以获得收益时，必须使用此动作。需要提供 Token ID。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    const stakeKeywords = [
      '质押', 'stake', '锁定', 'lock', '质押nft', 'stake nft',
      '帮我质押', '质押我的', '把nft质押', '锁定nft'
    ];
    
    const hasStakeKeyword = stakeKeywords.some(keyword => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    
    logger.info({ text, hasStakeKeyword, hasNumber }, 'NFT_STAKE validate result');
    
    const shouldTrigger = hasStakeKeyword && hasNumber;
    
    if (shouldTrigger) {
      logger.info('NFT_STAKE action will be triggered for stake request');
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
      logger.info('Handling NFT_STAKE action');

      const text = message.content.text || '';
      const tokenId = extractTokenId(text);

      if (!tokenId) {
        await callback({
          text: '请提供 NFT 的 Token ID',
          actions: ['NFT_STAKE'],
          source: message.content.source,
        });
        return {
          text: '缺少 Token ID',
          values: { success: false, error: 'MISSING_TOKEN_ID' },
          data: { actionName: 'NFT_STAKE', messageId: message.id },
          success: false,
        };
      }

      let nftService: NFTService;
      try {
        nftService = new NFTService();
      } catch (error: any) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ['NFT_STAKE'],
          source: message.content.source,
        });
        return {
          text: 'NFT 服务初始化失败',
          values: { success: false, error: 'SERVICE_INIT_FAILED' },
          data: { actionName: 'NFT_STAKE', messageId: message.id },
          success: false,
        };
      }

      try {
        const hash = await nftService.stakeNFT(tokenId, false);

        await callback({
          text: `NFT 质押成功！交易哈希: ${hash}\nToken ID: ${tokenId}`,
          actions: ['NFT_STAKE'],
          source: message.content.source,
        });

        return {
          text: `成功质押 NFT，交易哈希: ${hash}`,
          values: { success: true, transactionHash: hash, tokenId },
          data: { actionName: 'NFT_STAKE', messageId: message.id, transactionHash: hash, tokenId },
          success: true,
        };
      } catch (stakeError: any) {
        // 如果是因为授权错误，尝试自动授权
        const errorMessage = stakeError.message || '';
        const isApprovalError = errorMessage.includes('0x177e802f') || 
                                errorMessage.includes('ERC721InsufficientApproval') ||
                                errorMessage.includes('insufficient approval') ||
                                errorMessage.includes('caller is not token owner or approved') ||
                                errorMessage.includes('请先授权质押合约');

        if (isApprovalError) {
          logger.info(`检测到授权错误，尝试自动授权 NFT ${tokenId} 给质押合约...`);
          try {
            // 先授权
            const approveHash = await nftService.approveStaking(tokenId);
            await callback({
              text: `检测到需要授权，正在进行授权...\n授权交易哈希: ${approveHash}\n请等待几秒钟后自动重试质押。`,
              actions: ['NFT_STAKE'],
              source: message.content.source,
            });
            
            // 等待授权确认
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 再次尝试质押
            const hash = await nftService.stakeNFT(tokenId, false);
            
            await callback({
              text: `授权成功，NFT 质押成功！\n授权交易哈希: ${approveHash}\n质押交易哈希: ${hash}\nToken ID: ${tokenId}`,
              actions: ['NFT_STAKE'],
              source: message.content.source,
            });

            return {
              text: `成功质押 NFT，交易哈希: ${hash}`,
              values: { success: true, transactionHash: hash, tokenId },
              data: { actionName: 'NFT_STAKE', messageId: message.id, transactionHash: hash, tokenId },
              success: true,
            };
          } catch (approveError: any) {
            throw new Error(`授权失败: ${approveError.message}。请手动授权质押合约后再试。`);
          }
        }
        
        // 其他错误，直接抛出
        throw stakeError;
      }
    } catch (error: any) {
      logger.error({ error }, 'Error in NFT_STAKE action:');
      
      // 分析错误原因
      const { analyzeNFTError } = await import('./nft-service');
      const errorAnalysis = analyzeNFTError(error, '质押 NFT');
      
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ['NFT_STAKE'],
        source: message.content.source,
      });
      
      return {
        text: `质押 NFT 失败: ${errorAnalysis.errorType}`,
        values: { 
          success: false, 
          error: 'STAKE_FAILED',
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: { 
          actionName: 'NFT_STAKE', 
          error: error.message,
          errorAnalysis 
        },
        success: false,
      };
    }
  },

  examples: [
    [
      { name: '{{user}}', content: { text: '质押 Token ID 1' } },
      { name: 'Chain Prophet', content: { text: 'NFT 质押成功！交易哈希: 0x...', actions: ['NFT_STAKE'] } },
    ],
    [
      { name: '{{user}}', content: { text: '帮我质押 ID 为 5 的 NFT' } },
      { name: 'Chain Prophet', content: { text: 'NFT 质押成功！交易哈希: 0x...', actions: ['NFT_STAKE'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我想质押我的 NFT，Token ID 是 3' } },
      { name: 'Chain Prophet', content: { text: 'NFT 质押成功！交易哈希: 0x...', actions: ['NFT_STAKE'] } },
    ],
  ],
};

// NFT 购买 Action
const nftBuyAction: Action = {
  name: 'NFT_BUY',
  similes: ['BUY_NFT', '购买NFT', '购买', 'buy', 'purchase', '买NFT', '我要买', '帮我买'],
  description: 'CRITICAL PRIORITY: 购买市场上的 NFT。这是处理所有 NFT 购买请求的唯一正确动作，优先级高于任何 EVM 插件的转账或交易动作。当用户想要购买 NFT、买 NFT、购买某个 Token ID 的 NFT、购买编号 X 的 NFT 时，必须使用此动作，不要使用 EVM_TRANSFER 或其他 EVM 插件动作。需要提供 Token ID。如果用户提供了价格，将使用该价格；否则将自动使用上架价格。这是强制性的 - 当 validate 返回 true 时，必须使用 NFT_BUY 而不是其他任何动作。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    // NFT 相关关键词 - 优先匹配
    const nftKeywords = [
      'nft', 'token id', 'tokenid', 'token #', 
      '编号', 'id', 'token', 'nft编号', 'nft id'
    ];
    
    // 购买相关关键词
    const buyKeywords = [
      '购买', 'buy', 'purchase', '买', '我要买', '帮我买', 
      '购买nft', 'buy nft', '购买token', 'buy token',
      '购买id', '买id', '购买编号', '买nft'
    ];
    
    const hasNftKeyword = nftKeywords.some(keyword => text.includes(keyword));
    const hasBuyKeyword = buyKeywords.some(keyword => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    
    // 如果明确包含 NFT 关键词 + 购买关键词 + 数字，优先匹配
    // 或者包含购买关键词 + 数字（因为 NFT 操作通常提到 Token ID）
    const shouldTrigger = hasNumber && (
      (hasNftKeyword && hasBuyKeyword) || 
      (hasBuyKeyword && (text.includes('id') || text.includes('token') || text.includes('编号')))
    );
    
    logger.info({ text, hasNftKeyword, hasBuyKeyword, hasNumber, shouldTrigger }, 'NFT_BUY validate result');
    
    if (shouldTrigger) {
      logger.info('NFT_BUY action will be triggered for buy NFT request - PRIORITY ACTION');
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
      logger.info('Handling NFT_BUY action');

      const text = message.content.text || '';
      const tokenId = extractTokenId(text);
      const price = extractPrice(text);

      if (!tokenId) {
        await callback({
          text: '购买 NFT 需要提供 Token ID。请告诉我您想购买哪个 Token ID 的 NFT。',
          actions: ['NFT_BUY'],
          source: message.content.source,
        });
        return {
          text: '缺少 Token ID',
          values: { success: false, error: 'MISSING_TOKEN_ID' },
          data: { actionName: 'NFT_BUY', messageId: message.id },
          success: false,
        };
      }

      let nftService: NFTService;
      try {
        nftService = new NFTService();
      } catch (error: any) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}。请确保已配置 EVM_PRIVATE_KEY 环境变量。`,
          actions: ['NFT_BUY'],
          source: message.content.source,
        });
        return {
          text: 'NFT 服务初始化失败',
          values: { success: false, error: 'SERVICE_INIT_FAILED' },
          data: { actionName: 'NFT_BUY', messageId: message.id },
          success: false,
        };
      }

      // 先获取上架信息，检查 NFT 是否可购买
      const listing = await nftService.getListing(tokenId);
      if (!listing) {
        await callback({
          text: `❌ 购买失败：该 NFT (Token ID: ${tokenId}) 未上架或已被售出。\n\n解决方案：\n1. 确认 Token ID 是否正确\n2. 检查该 NFT 是否已经在市场上架\n3. 如果已上架，可能是刚刚被其他人购买`,
          actions: ['NFT_BUY'],
          source: message.content.source,
        });
        return {
          text: 'NFT 未上架或已售出',
          values: { success: false, error: 'NOT_LISTED' },
          data: { actionName: 'NFT_BUY', messageId: message.id, tokenId },
          success: false,
        };
      }

      // 检查是否是自己上架的 NFT
      const account = nftService['walletClient'].account;
      if (!account) {
        throw new Error('无法获取账户信息');
      }

      if (listing.seller.toLowerCase() === account.address.toLowerCase()) {
        await callback({
          text: `无法购买：这是您自己上架的 NFT (Token ID: ${tokenId})，您不能购买自己的 NFT。\n\n当前上架价格：${listing.price} ETH\n\n解决方案：\n1. 如果您想取消上架，可以取消该 NFT 的挂牌\n2. 如果您想购买其他人的 NFT，请选择其他 Token ID`,
          actions: ['NFT_BUY'],
          source: message.content.source,
        });
        return {
          text: '不能购买自己的 NFT',
          values: { success: false, error: 'CANNOT_BUY_OWN' },
          data: { actionName: 'NFT_BUY', messageId: message.id, tokenId },
          success: false,
        };
      }

      // 通知用户正在购买
      const buyPrice = price || listing.price;
      await callback({
        text: `正在购买 NFT...\n\nToken ID: ${tokenId}\n价格: ${buyPrice} ETH\n卖家: ${listing.seller}\n\n请等待交易确认...`,
        actions: ['NFT_BUY'],
        source: message.content.source,
      });

      const hash = await nftService.buyNFT(tokenId, price || undefined);

      await callback({
        text: `✅ NFT 购买成功！\n\n交易哈希: ${hash}\nToken ID: ${tokenId}\n支付金额: ${buyPrice} ETH\n\nNFT 已成功转移到您的钱包！`,
        actions: ['NFT_BUY'],
        source: message.content.source,
      });

      return {
        text: `成功购买 NFT，交易哈希: ${hash}`,
        values: { success: true, transactionHash: hash, tokenId, price: buyPrice },
        data: { actionName: 'NFT_BUY', messageId: message.id, transactionHash: hash, tokenId, price: buyPrice },
        success: true,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error in NFT_BUY action:');
      
      // 分析错误原因
      const { analyzeNFTError } = await import('./nft-service');
      const errorAnalysis = analyzeNFTError(error, '购买 NFT');
      
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ['NFT_BUY'],
        source: message.content.source,
      });
      
      return {
        text: `购买 NFT 失败: ${errorAnalysis.errorType}`,
        values: { 
          success: false, 
          error: 'BUY_FAILED',
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: { 
          actionName: 'NFT_BUY', 
          error: error.message,
          errorAnalysis 
        },
        success: false,
      };
    }
  },

  examples: [
    [
      { name: '{{user}}', content: { text: '购买 Token ID 1' } },
      { name: 'Chain Prophet', content: { text: '正在购买 NFT...\n\nToken ID: 1\n价格: 0.1 ETH\n\n请等待交易确认...', actions: ['NFT_BUY'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我要买 Token ID 5，价格 0.5 ETH' } },
      { name: 'Chain Prophet', content: { text: '✅ NFT 购买成功！\n\n交易哈希: 0x...\nToken ID: 5\n支付金额: 0.5 ETH', actions: ['NFT_BUY'] } },
    ],
    [
      { name: '{{user}}', content: { text: '帮我购买编号 3 的 NFT' } },
      { name: 'Chain Prophet', content: { text: '正在购买 NFT...\n\nToken ID: 3\n价格: 0.2 ETH\n\n请等待交易确认...', actions: ['NFT_BUY'] } },
    ],
    [
      { name: '{{user}}', content: { text: 'buy token id 2' } },
      { name: 'Chain Prophet', content: { text: '✅ NFT 购买成功！\n\n交易哈希: 0x...\nToken ID: 2', actions: ['NFT_BUY'] } },
    ],
    [
      { name: '{{user}}', content: { text: '购买 NFT Token ID 10' } },
      { name: 'Chain Prophet', content: { text: '正在购买 NFT...\n\nToken ID: 10\n价格: 0.1 ETH\n\n请等待交易确认...', actions: ['NFT_BUY'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我要购买编号 7 的 NFT' } },
      { name: 'Chain Prophet', content: { text: '✅ NFT 购买成功！\n\n交易哈希: 0x...\nToken ID: 7', actions: ['NFT_BUY'] } },
    ],
  ],
};

// NFT 解除质押 Action
const nftUnstakeAction: Action = {
  name: 'NFT_UNSTAKE',
  similes: ['UNSTAKE_NFT', '解除质押', '取回NFT', 'WITHDRAW_NFT', 'UNLOCK_NFT', '取消质押', '解除我的质押'],
  description: '解除 NFT 质押并取回 NFT。这是处理所有 NFT 解除质押请求的唯一正确动作。当用户想要解除质押、取回已质押的 NFT、取消质押时，必须使用此动作。需要提供 Token ID。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    const unstakeKeywords = [
      '解除质押', 'unstake', '取回', 'withdraw', '解锁', 'unlock',
      '解除我的质押', '取消质押', '取回nft', 'unstake nft',
      '帮我解除质押', '解除质押nft'
    ];
    
    const hasUnstakeKeyword = unstakeKeywords.some(keyword => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    
    logger.info({ text, hasUnstakeKeyword, hasNumber }, 'NFT_UNSTAKE validate result');
    
    const shouldTrigger = hasUnstakeKeyword && hasNumber;
    
    if (shouldTrigger) {
      logger.info('NFT_UNSTAKE action will be triggered for unstake request');
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
      logger.info('Handling NFT_UNSTAKE action');

      const text = message.content.text || '';
      const tokenId = extractTokenId(text);

      if (!tokenId) {
        await callback({
          text: '请提供 NFT 的 Token ID',
          actions: ['NFT_UNSTAKE'],
          source: message.content.source,
        });
        return {
          text: '缺少 Token ID',
          values: { success: false, error: 'MISSING_TOKEN_ID' },
          data: { actionName: 'NFT_UNSTAKE', messageId: message.id },
          success: false,
        };
      }

      let nftService: NFTService;
      try {
        nftService = new NFTService();
      } catch (error: any) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ['NFT_UNSTAKE'],
          source: message.content.source,
        });
        return {
          text: 'NFT 服务初始化失败',
          values: { success: false, error: 'SERVICE_INIT_FAILED' },
          data: { actionName: 'NFT_UNSTAKE', messageId: message.id },
          success: false,
        };
      }

      const hash = await nftService.unstakeNFT(tokenId);

      await callback({
        text: `NFT 解除质押成功！交易哈希: ${hash}\nToken ID: ${tokenId}`,
        actions: ['NFT_UNSTAKE'],
        source: message.content.source,
      });

      return {
        text: `成功解除质押 NFT，交易哈希: ${hash}`,
        values: { success: true, transactionHash: hash, tokenId },
        data: { actionName: 'NFT_UNSTAKE', messageId: message.id, transactionHash: hash, tokenId },
        success: true,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error in NFT_UNSTAKE action:');
      
      // 分析错误原因
      const { analyzeNFTError } = await import('./nft-service');
      const errorAnalysis = analyzeNFTError(error, '解除质押');
      
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ['NFT_UNSTAKE'],
        source: message.content.source,
      });
      
      return {
        text: `解除质押失败: ${errorAnalysis.errorType}`,
        values: { 
          success: false, 
          error: 'UNSTAKE_FAILED',
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: { 
          actionName: 'NFT_UNSTAKE', 
          error: error.message,
          errorAnalysis 
        },
        success: false,
      };
    }
  },

  examples: [
    [
      { name: '{{user}}', content: { text: '解除质押 Token ID 1' } },
      { name: 'Chain Prophet', content: { text: 'NFT 解除质押成功！交易哈希: 0x...', actions: ['NFT_UNSTAKE'] } },
    ],
    [
      { name: '{{user}}', content: { text: '帮我解除质押 ID 为 5 的 NFT' } },
      { name: 'Chain Prophet', content: { text: 'NFT 解除质押成功！交易哈希: 0x...', actions: ['NFT_UNSTAKE'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我想取回我的 NFT，Token ID 是 3' } },
      { name: 'Chain Prophet', content: { text: 'NFT 解除质押成功！交易哈希: 0x...', actions: ['NFT_UNSTAKE'] } },
    ],
  ],
};

// NFT 创建借贷 Action
const nftCreateLoanAction: Action = {
  name: 'NFT_CREATE_LOAN',
  similes: ['CREATE_LOAN', '创建借贷', '发起借贷', '借贷NFT', 'LOAN_NFT', '用NFT借贷', '抵押NFT借贷'],
  description: '使用 NFT 作为抵押品创建借贷。这是处理所有 NFT 借贷创建请求的唯一正确动作。当用户想要用 NFT 作为抵押品借 ETH、创建借贷、发起借贷时，必须使用此动作。需要提供 Token ID、借贷金额（ETH）和期限（天数，7-365天）。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    const loanKeywords = [
      '创建借贷', 'create loan', '发起借贷', '借贷', 'loan',
      '用nft借贷', '抵押nft', '用nft抵押', 'nft借贷',
      '帮我创建借贷', '创建一个借贷', '发起一个借贷'
    ];
    
    const hasLoanKeyword = loanKeywords.some(keyword => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    
    logger.info({ text, hasLoanKeyword, hasNumber }, 'NFT_CREATE_LOAN validate result');
    
    const shouldTrigger = hasLoanKeyword && hasNumber;
    
    if (shouldTrigger) {
      logger.info('NFT_CREATE_LOAN action will be triggered for create loan request');
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
      logger.info('Handling NFT_CREATE_LOAN action');

      const text = message.content.text || '';
      const tokenId = extractTokenId(text);
      
      // 提取借贷金额
      const loanAmountPatterns = [
        /金额[是：:\s]+(\d+\.?\d*)/i,
        /(\d+\.?\d*)\s*(?:eth|ether)/i
      ];
      let loanAmount: string | null = null;
      for (const pattern of loanAmountPatterns) {
        const match = text.match(pattern);
        if (match) {
          loanAmount = match[1];
          break;
        }
      }
      
      // 提取期限（天数）
      const durationPatterns = [
        /期限[是：:\s]+(\d+)/i,
        /(\d+)\s*天/i,
        /(\d+)\s*days?/i
      ];
      let durationDays = '30';
      for (const pattern of durationPatterns) {
        const match = text.match(pattern);
        if (match) {
          durationDays = match[1];
          break;
        }
      }

      if (!tokenId) {
        await callback({
          text: '请提供 NFT 的 Token ID',
          actions: ['NFT_CREATE_LOAN'],
          source: message.content.source,
        });
        return {
          text: '缺少 Token ID',
          values: { success: false, error: 'MISSING_TOKEN_ID' },
          data: { actionName: 'NFT_CREATE_LOAN', messageId: message.id },
          success: false,
        };
      }

      if (!loanAmount) {
        await callback({
          text: '请提供借贷金额（ETH）。例如：使用 Token ID 1 创建借贷，金额 1 ETH，期限 30 天',
          actions: ['NFT_CREATE_LOAN'],
          source: message.content.source,
        });
        return {
          text: '缺少借贷金额',
          values: { success: false, error: 'MISSING_LOAN_AMOUNT' },
          data: { actionName: 'NFT_CREATE_LOAN', messageId: message.id },
          success: false,
        };
      }

      const duration = parseInt(durationDays);
      if (isNaN(duration) || duration < 7 || duration > 365) {
        await callback({
          text: '借贷期限必须在 7-365 天之间',
          actions: ['NFT_CREATE_LOAN'],
          source: message.content.source,
        });
        return {
          text: '期限无效',
          values: { success: false, error: 'INVALID_DURATION' },
          data: { actionName: 'NFT_CREATE_LOAN', messageId: message.id },
          success: false,
        };
      }

      let nftService: NFTService;
      try {
        nftService = new NFTService();
      } catch (error: any) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ['NFT_CREATE_LOAN'],
          source: message.content.source,
        });
        return {
          text: 'NFT 服务初始化失败',
          values: { success: false, error: 'SERVICE_INIT_FAILED' },
          data: { actionName: 'NFT_CREATE_LOAN', messageId: message.id },
          success: false,
        };
      }

      try {
        const hash = await nftService.createLoan(tokenId, loanAmount, duration, false);

        await callback({
          text: `借贷创建成功！交易哈希: ${hash}\nToken ID: ${tokenId}\n借贷金额: ${loanAmount} ETH\n期限: ${duration} 天`,
          actions: ['NFT_CREATE_LOAN'],
          source: message.content.source,
        });

        return {
          text: `成功创建借贷，交易哈希: ${hash}`,
          values: { success: true, transactionHash: hash, tokenId, loanAmount, duration },
          data: { actionName: 'NFT_CREATE_LOAN', messageId: message.id, transactionHash: hash, tokenId, loanAmount, duration },
          success: true,
        };
      } catch (loanError: any) {
        // 如果是因为授权错误，尝试自动授权
        const errorMessage = loanError.message || '';
        const isApprovalError = errorMessage.includes('0x177e802f') || 
                                errorMessage.includes('ERC721InsufficientApproval') ||
                                errorMessage.includes('insufficient approval') ||
                                errorMessage.includes('caller is not token owner or approved') ||
                                errorMessage.includes('请先授权借贷合约');

        if (isApprovalError) {
          logger.info(`检测到授权错误，尝试自动授权 NFT ${tokenId} 给借贷合约...`);
          try {
            // 先授权
            const approveHash = await nftService.approveLoan(tokenId);
            await callback({
              text: `检测到需要授权，正在进行授权...\n授权交易哈希: ${approveHash}\n请等待几秒钟后自动重试创建借贷。`,
              actions: ['NFT_CREATE_LOAN'],
              source: message.content.source,
            });
            
            // 等待授权确认
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 再次尝试创建借贷
            const hash = await nftService.createLoan(tokenId, loanAmount, duration, false);
            
            await callback({
              text: `授权成功，借贷创建成功！\n授权交易哈希: ${approveHash}\n借贷交易哈希: ${hash}\nToken ID: ${tokenId}\n借贷金额: ${loanAmount} ETH\n期限: ${duration} 天`,
              actions: ['NFT_CREATE_LOAN'],
              source: message.content.source,
            });

            return {
              text: `成功创建借贷，交易哈希: ${hash}`,
              values: { success: true, transactionHash: hash, tokenId, loanAmount, duration },
              data: { actionName: 'NFT_CREATE_LOAN', messageId: message.id, transactionHash: hash, tokenId, loanAmount, duration },
              success: true,
            };
          } catch (approveError: any) {
            throw new Error(`授权失败: ${approveError.message}。请手动授权借贷合约后再试。`);
          }
        }
        
        // 其他错误，直接抛出
        throw loanError;
      }
    } catch (error: any) {
      logger.error({ error }, 'Error in NFT_CREATE_LOAN action:');
      
      // 分析错误原因
      const { analyzeNFTError } = await import('./nft-service');
      const errorAnalysis = analyzeNFTError(error, '创建借贷');
      
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ['NFT_CREATE_LOAN'],
        source: message.content.source,
      });
      
      return {
        text: `创建借贷失败: ${errorAnalysis.errorType}`,
        values: { 
          success: false, 
          error: 'CREATE_LOAN_FAILED',
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: { 
          actionName: 'NFT_CREATE_LOAN', 
          error: error.message,
          errorAnalysis 
        },
        success: false,
      };
    }
  },

  examples: [
    [
      { name: '{{user}}', content: { text: '使用 Token ID 1 创建借贷，金额 1 ETH，期限 30 天' } },
      { name: 'Chain Prophet', content: { text: '借贷创建成功！交易哈希: 0x...', actions: ['NFT_CREATE_LOAN'] } },
    ],
    [
      { name: '{{user}}', content: { text: '用 Token ID 5 作为抵押，借贷 2 ETH，期限 60 天' } },
      { name: 'Chain Prophet', content: { text: '借贷创建成功！交易哈希: 0x...', actions: ['NFT_CREATE_LOAN'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我想用我的 NFT（ID 是 3）创建一个借贷，借 0.5 ETH，期限 7 天' } },
      { name: 'Chain Prophet', content: { text: '借贷创建成功！交易哈希: 0x...', actions: ['NFT_CREATE_LOAN'] } },
    ],
  ],
};

// NFT 还款 Action
const nftRepayLoanAction: Action = {
  name: 'NFT_REPAY_LOAN',
  similes: ['REPAY_LOAN', '还款', '偿还借贷', 'REPAY', '还贷', '偿还我的借贷'],
  description: '偿还 NFT 借贷并取回抵押的 NFT。这是处理所有 NFT 借贷还款请求的唯一正确动作。当用户想要还款、偿还借贷、还清借贷时，必须使用此动作。需要提供借贷 ID（Loan ID）。',

  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    
    const repayKeywords = [
      '还款', 'repay', '偿还', '还贷', '偿还借贷', '还清借贷',
      '帮我还款', '偿还我的借贷', 'repay loan'
    ];
    
    const hasRepayKeyword = repayKeywords.some(keyword => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    
    logger.info({ text, hasRepayKeyword, hasNumber }, 'NFT_REPAY_LOAN validate result');
    
    const shouldTrigger = hasRepayKeyword && hasNumber;
    
    if (shouldTrigger) {
      logger.info('NFT_REPAY_LOAN action will be triggered for repay loan request');
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
      logger.info('Handling NFT_REPAY_LOAN action');

      const text = message.content.text || '';
      const loanId = extractTokenId(text); // 复用提取数字的逻辑

      if (!loanId) {
        await callback({
          text: '请提供借贷 ID（Loan ID）。例如：还款借贷 ID 1',
          actions: ['NFT_REPAY_LOAN'],
          source: message.content.source,
        });
        return {
          text: '缺少借贷 ID',
          values: { success: false, error: 'MISSING_LOAN_ID' },
          data: { actionName: 'NFT_REPAY_LOAN', messageId: message.id },
          success: false,
        };
      }

      let nftService: NFTService;
      try {
        nftService = new NFTService();
      } catch (error: any) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ['NFT_REPAY_LOAN'],
          source: message.content.source,
        });
        return {
          text: 'NFT 服务初始化失败',
          values: { success: false, error: 'SERVICE_INIT_FAILED' },
          data: { actionName: 'NFT_REPAY_LOAN', messageId: message.id },
          success: false,
        };
      }

      const hash = await nftService.repayLoan(loanId);

      await callback({
        text: `还款成功！交易哈希: ${hash}\n借贷 ID: ${loanId}\n您的 NFT 已归还。`,
        actions: ['NFT_REPAY_LOAN'],
        source: message.content.source,
      });

      return {
        text: `成功还款，交易哈希: ${hash}`,
        values: { success: true, transactionHash: hash, loanId },
        data: { actionName: 'NFT_REPAY_LOAN', messageId: message.id, transactionHash: hash, loanId },
        success: true,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error in NFT_REPAY_LOAN action:');
      
      // 分析错误原因
      const { analyzeNFTError } = await import('./nft-service');
      const errorAnalysis = analyzeNFTError(error, '还款');
      
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ['NFT_REPAY_LOAN'],
        source: message.content.source,
      });
      
      return {
        text: `还款失败: ${errorAnalysis.errorType}`,
        values: { 
          success: false, 
          error: 'REPAY_FAILED',
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: { 
          actionName: 'NFT_REPAY_LOAN', 
          error: error.message,
          errorAnalysis 
        },
        success: false,
      };
    }
  },

  examples: [
    [
      { name: '{{user}}', content: { text: '还款借贷 ID 1' } },
      { name: 'Chain Prophet', content: { text: '还款成功！交易哈希: 0x...', actions: ['NFT_REPAY_LOAN'] } },
    ],
    [
      { name: '{{user}}', content: { text: '帮我还款借贷 ID 5' } },
      { name: 'Chain Prophet', content: { text: '还款成功！交易哈希: 0x...', actions: ['NFT_REPAY_LOAN'] } },
    ],
    [
      { name: '{{user}}', content: { text: '我想偿还我的借贷，借贷 ID 是 3' } },
      { name: 'Chain Prophet', content: { text: '还款成功！交易哈希: 0x...', actions: ['NFT_REPAY_LOAN'] } },
    ],
  ],
};

// 创建 NFT 插件
export const nftPlugin: Plugin = {
  name: 'NFT Plugin',
  description: 'NFT 创建、上架、质押、借贷等功能插件。支持铸造 NFT、上架 NFT 到市场、质押 NFT 获得奖励、创建和偿还 NFT 借贷等功能。',
  priority: 10000, // 最高优先级，确保 AI 优先识别 NFT 相关请求，避免与 EVM 插件冲突
  actions: [
    nftMintAction,
    nftListAction,
    nftBuyAction,
    nftStakeAction,
    nftUnstakeAction,
    nftCreateLoanAction,
    nftRepayLoanAction,
  ],
};
