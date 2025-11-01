import type { Plugin } from '@elizaos/core';
import {
  type Action,
  type ActionResult,
  type Content,
  type GenerateTextParams,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type Provider,
  type ProviderResult,
  Service,
  type State,
  logger,
} from '@elizaos/core';
import { z } from 'zod';
import { createPublicClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

/**
 * Define the configuration schema for the plugin with the following properties:
 *
 * @param {string} EXAMPLE_PLUGIN_VARIABLE - The name of the plugin (min length of 1, optional)
 * @returns {object} - The configured schema object
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, 'Example plugin variable is not provided')
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn('Warning: Example plugin variable is not provided');
      }
      return val;
    }),
});

/**
 * Example HelloWorld action
 * This demonstrates the simplest possible action structure
 */
/**
 * Represents an action that responds with a simple hello world message.
 *
 * @typedef {Object} Action
 * @property {string} name - The name of the action
 * @property {string[]} similes - The related similes of the action
 * @property {string} description - Description of the action
 * @property {Function} validate - Validation function for the action
 * @property {Function} handler - The function that handles the action
 * @property {Object[]} examples - Array of examples for the action
 */
const helloWorldAction: Action = {
  name: 'HELLO_WORLD',
  similes: ['GREET', 'SAY_HELLO'],
  description: 'Responds with a simple hello world message',

  validate: async (_runtime: IAgentRuntime, _message: Memory, _state: State): Promise<boolean> => {
    // Always valid
    return true;
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
      logger.info('Handling HELLO_WORLD action');

      // Simple response content
      const responseContent: Content = {
        text: 'hello world!',
        actions: ['HELLO_WORLD'],
        source: message.content.source,
      };

      // Call back with the hello world message
      await callback(responseContent);

      return {
        text: 'Sent hello world greeting',
        values: {
          success: true,
          greeted: true,
        },
        data: {
          actionName: 'HELLO_WORLD',
          messageId: message.id,
          timestamp: Date.now(),
        },
        success: true,
      };
    } catch (error) {
      logger.error({ error }, 'Error in HELLO_WORLD action:');

      return {
        text: 'Failed to send hello world greeting',
        values: {
          success: false,
          error: 'GREETING_FAILED',
        },
        data: {
          actionName: 'HELLO_WORLD',
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
        name: '{{name1}}',
        content: {
          text: 'Can you say hello?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'hello world!',
          actions: ['HELLO_WORLD'],
        },
      },
    ],
  ],
};

// 创建公共客户端用于查询余额
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

// 提取地址或私钥的辅助函数
const extractAddressOrPrivateKey = (text: string): { address?: string; privateKey?: string } => {
  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const privateKeyRegex = /0x[a-fA-F0-9]{64}/g;
  
  const addressMatch = text.match(addressRegex);
  const privateKeyMatch = text.match(privateKeyRegex);
  
  if (privateKeyMatch) {
    return { privateKey: privateKeyMatch[0] };
  } else if (addressMatch) {
    return { address: addressMatch[0] };
  }
  
  return {};
};


/**
 * Example Hello World Provider
 * This demonstrates the simplest possible provider implementation
 */
const helloWorldProvider: Provider = {
  name: 'HELLO_WORLD_PROVIDER',
  description: 'A simple example provider',

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    return {
      text: 'I am a provider',
      values: {},
      data: {},
    };
  },
};

export class StarterService extends Service {
  static serviceType = 'starter';
  capabilityDescription =
    'This is a starter service which is attached to the agent through the starter plugin.';

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info('*** Starting starter service ***');
    const service = new StarterService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info('*** Stopping starter service ***');
    // get the service from the runtime
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error('Starter service not found');
    }
    service.stop();
  }

  async stop() {
    logger.info('*** Stopping starter service instance ***');
  }
}

const plugin: Plugin = {
  name: 'starter',
  description: 'A starter plugin for Eliza',
  // Set lowest priority so real models take precedence
  priority: -1000,
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
  },
  async init(config: Record<string, string>) {
    logger.info('*** Initializing starter plugin ***');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages =
          error.issues?.map((e) => e.message)?.join(', ') || 'Unknown validation error';
        throw new Error(`Invalid plugin configuration: ${errorMessages}`);
      }
      throw new Error(
        `Invalid plugin configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (
      _runtime,
      { prompt, stopSequences = [] }: GenerateTextParams
    ) => {
      return 'Never gonna give you up, never gonna let you down, never gonna run around and desert you...';
    },
    [ModelType.TEXT_LARGE]: async (
      _runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams
    ) => {
      return 'Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...';
    },
  },
  routes: [
    {
      name: 'helloworld',
      path: '/helloworld',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        // send a response
        res.json({
          message: 'Hello World!',
        });
      },
    },
    {
      name: 'agents-api',
      path: '/api/agents',
      type: 'GET',
      handler: async (req: any, res: any) => {
        try {
          const agents = [
            {
              id: 'chain-prophet',
              name: 'Chain Prophet',
              bio: '专业的区块链和 DeFi 助手，能够查询钱包余额、分析交易数据，并提供区块链相关的技术支持。',
              capabilities: ['EVM 余额查询', '私钥地址推导', '区块链数据分析', 'DeFi 协议支持'],
              status: 'active'
            }
          ];
          res.json(agents);
        } catch (error) {
          console.error('获取 Agent 列表失败:', error);
          res.status(500).json({ error: '获取 Agent 列表失败' });
        }
      },
    },
    {
      name: 'agent-detail-api',
      path: '/api/agents/:id',
      type: 'GET',
      handler: async (req: any, res: any) => {
        try {
          const { id } = req.params;
          if (id === 'chain-prophet') {
            const agent = {
              id: 'chain-prophet',
              name: 'Chain Prophet',
              bio: '专业的区块链和 DeFi 助手，能够查询钱包余额、分析交易数据，并提供区块链相关的技术支持。',
              capabilities: ['EVM 余额查询', '私钥地址推导', '区块链数据分析', 'DeFi 协议支持'],
              status: 'active'
            };
            res.json(agent);
          } else {
            res.status(404).json({ error: 'Agent 未找到' });
          }
        } catch (error) {
          console.error('获取 Agent 信息失败:', error);
          res.status(500).json({ error: '获取 Agent 信息失败' });
        }
      },
    },
    {
      name: 'evm-balance-api',
      path: '/api/evm/balance',
      type: 'POST',
      handler: async (req: any, res: any) => {
        try {
          const { address, privateKey } = req.body;
          
          if (!address && !privateKey) {
            return res.status(400).json({ 
              success: false, 
              error: '请提供地址或私钥' 
            });
          }
          
          let targetAddress: string;
          
          if (privateKey) {
            // 从私钥推导地址
            try {
              const account = privateKeyToAccount(privateKey as `0x${string}`);
              targetAddress = account.address;
            } catch (error) {
              return res.status(400).json({
                success: false,
                error: '私钥格式错误'
              });
            }
          } else {
            targetAddress = address;
          }
          
          // 验证地址格式
          const addressRegex = /^0x[a-fA-F0-9]{40}$/;
          if (!addressRegex.test(targetAddress)) {
            return res.status(400).json({
              success: false,
              error: '地址格式错误'
            });
          }
          
          // 查询余额
          const balance = await publicClient.getBalance({
            address: targetAddress as `0x${string}`,
          });
          
          // 转换为 ETH 单位
          const balanceInEth = formatEther(balance);
          
          res.json({
            success: true,
            address: targetAddress,
            balance: balanceInEth,
            network: 'Sepolia',
            wasDerivedFromPrivateKey: !!privateKey
          });
          
        } catch (error) {
          console.error('查询余额失败:', error);
          res.status(500).json({
            success: false,
            error: '查询余额失败: ' + (error instanceof Error ? error.message : '未知错误')
          });
        }
      },
    },
    {
      name: 'health-check',
      path: '/api/health',
      type: 'GET',
      handler: async (req: any, res: any) => {
        res.json({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          service: 'chain-prophet-api'
        });
      },
    },
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('MESSAGE_RECEIVED event received');
        logger.info({ message: params.message }, 'Received message');
        
        // 处理消息并生成回复
        if (params.message && params.runtime) {
          try {
            const message = params.message;
            const runtime = params.runtime;
            
            // 检查是否是 EVM 相关查询
            const text = message.content?.text || '';
            const { address, privateKey } = extractAddressOrPrivateKey(text);
            
            if (address || privateKey) {
              // 处理 EVM 查询
              logger.info({ address, privateKey }, 'Processing EVM query');
              // EVM 查询会在 action 中处理
            } else {
              // 处理普通对话
              logger.info('Processing regular conversation');
              // 普通对话由系统自动处理
            }
          } catch (error) {
            logger.error({ error }, 'Error processing message');
          }
        }
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('VOICE_MESSAGE_RECEIVED event received');
        // print the keys
        logger.info({ keys: Object.keys(params) }, 'VOICE_MESSAGE_RECEIVED param keys');
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info('WORLD_CONNECTED event received');
        // print the keys
        logger.info({ keys: Object.keys(params) }, 'WORLD_CONNECTED param keys');
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info('WORLD_JOINED event received');
        // print the keys
        logger.info({ keys: Object.keys(params) }, 'WORLD_JOINED param keys');
      },
    ],
  },
  services: [StarterService],
  actions: [helloWorldAction],
  providers: [helloWorldProvider],
};

export default plugin;
