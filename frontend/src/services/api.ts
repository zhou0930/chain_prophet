import axios from 'axios';
import { Session, Agent, EVMBalanceResult } from '../types';

// ElizaOS 会话超时配置
export interface SessionTimeoutConfig {
  idleTimeout?: number; // 空闲超时时间（毫秒）
  maxLifetime?: number; // 最大生命周期（毫秒）
  autoRenew?: boolean; // 是否自动续期
  warningThreshold?: number; // 警告阈值（毫秒）
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 生成 UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 会话管理 API - 基于 ElizaOS 官方标准
export const sessionAPI = {
  // 创建新会话
  createSession: async (agentId: string, userId?: string, timeoutConfig?: SessionTimeoutConfig) => {
    // 如果没有提供 userId 或不是有效的 UUID，生成一个新的
    const validUserId = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) 
      ? userId 
      : generateUUID();
    
    const payload = {
      agentId,
      userId: validUserId,
      ...(timeoutConfig && { timeoutConfig })
    };
    
    const response = await api.post('/api/messaging/sessions', payload);
    
    // 处理 ElizaOS 标准响应格式
    const sessionData = response.data;
    const session: Session = {
      id: sessionData.sessionId || sessionData.id,
      agentId: sessionData.agentId,
      userId: sessionData.userId,
      createdAt: new Date(sessionData.createdAt || sessionData.created_at).getTime(),
      lastActivity: new Date(sessionData.lastActivity || sessionData.createdAt || sessionData.created_at).getTime(),
      status: sessionData.status || 'active'
    };
    
    return session;
  },

  // 发送消息
  sendMessage: async (sessionId: string, content: string, metadata?: Record<string, any>) => {
    const payload: any = { content };
    if (metadata) {
      payload.metadata = metadata;
    }
    
    const response = await api.post(`/api/messaging/sessions/${sessionId}/messages`, payload);
    
    // 处理 ElizaOS 标准响应格式
    const messageData = response.data;
    return {
      id: messageData.id || messageData.messageId,
      content: messageData.content || content,
      text: messageData.content || content,
      timestamp: new Date(messageData.createdAt || messageData.timestamp).getTime(),
      metadata: messageData.metadata || {},
      actions: messageData.actions || []
    };
  },

  // 获取消息历史 - 支持 before/after 参数
  getMessages: async (sessionId: string, limit = 50, before?: number, after?: number) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before.toString());
    if (after) params.append('after', after.toString());
    
    const response = await api.get(`/api/messaging/sessions/${sessionId}/messages?${params}`);
    
    // 处理 ElizaOS 标准响应格式
    const messagesData = response.data;
    console.log('API响应原始数据:', messagesData);
    
    // 处理不同的响应格式
    let messagesList = [];
    if (messagesData && messagesData.messages && Array.isArray(messagesData.messages)) {
      messagesList = messagesData.messages;
    } else if (Array.isArray(messagesData)) {
      messagesList = messagesData;
    }
    
    if (messagesList.length > 0) {
      return messagesList.map((msg: any) => {
        // 判断消息角色 - 基于 ElizaOS 标准
        const isAgent = msg.isAgent === true || 
                       msg.role === 'agent' || 
                       msg.role === 'assistant' ||
                       (msg.metadata && msg.metadata.agent_id) ||
                       (msg.metadata && msg.metadata.agentName) ||
                       (msg.authorId && msg.authorId !== msg.userId);
        
        return {
          id: msg.id || msg.messageId,
          content: msg.content || msg.text || '',
          text: msg.content || msg.text || '',
          role: isAgent ? 'agent' : 'user',
          authorId: msg.authorId || msg.userId,
          isAgent: msg.isAgent || isAgent,
          timestamp: new Date(msg.createdAt || msg.timestamp).getTime(),
          createdAt: msg.createdAt || msg.timestamp,
          metadata: msg.metadata || {},
          actions: msg.actions || []
        };
      });
    }
    
    return messagesList;
  },

  // 续期会话
  renewSession: async (sessionId: string) => {
    const response = await api.post(`/api/messaging/sessions/${sessionId}/renew`);
    return response.data;
  },

  // 发送心跳
  sendHeartbeat: async (sessionId: string) => {
    const response = await api.post(`/api/messaging/sessions/${sessionId}/heartbeat`);
    return response.data;
  },
};

// Agent 管理 API
export const agentAPI = {
  // 获取可用 Agent 列表
  getAgents: async (): Promise<Agent[]> => {
    try {
      const response = await api.get('/api/agents');
      console.log('API 响应:', response.data);
      
      // 处理 ElizaOS 的响应格式
      let agents = [];
      if (response.data.success && response.data.data && response.data.data.agents) {
        // ElizaOS 格式
        agents = response.data.data.agents;
      } else if (Array.isArray(response.data)) {
        // 直接数组格式
        agents = response.data;
      } else if (response.data.agents && Array.isArray(response.data.agents)) {
        // 包装在 agents 字段中
        agents = response.data.agents;
      }
      
      // 转换数据格式以匹配前端期望
      const formattedAgents = agents.map((agent: any) => ({
        id: agent.id || agent.agentId,
        name: agent.name || agent.characterName,
        bio: agent.bio || agent.description || 'AI Agent',
        capabilities: agent.capabilities || ['AI 对话', '智能助手'],
        status: agent.status || 'active'
      }));
      
      console.log('格式化后的 Agent 列表:', formattedAgents);
      return formattedAgents;
    } catch (error) {
      console.error('获取 Agent 列表失败:', error);
      // 返回默认的 Agent 列表作为后备
      return [
        {
          id: 'chain-prophet',
          name: 'Chain Prophet',
          bio: '专业的区块链和 DeFi 助手，能够查询钱包余额、分析交易数据，并提供区块链相关的技术支持。',
          capabilities: ['EVM 余额查询', '私钥地址推导', '区块链数据分析', 'DeFi 协议支持'],
          status: 'active'
        }
      ];
    }
  },

  // 获取特定 Agent 信息
  getAgent: async (agentId: string): Promise<Agent> => {
    try {
      const response = await api.get(`/api/agents/${agentId}`);
      return response.data as Agent;
    } catch (error) {
      console.error('获取 Agent 信息失败:', error);
      throw error;
    }
  },
};

// EVM 插件 API
export const evmAPI = {
  // 查询余额
  getBalance: async (address: string, privateKey?: string): Promise<EVMBalanceResult> => {
    try {
      const response = await api.post('/api/evm/balance', {
        address,
        privateKey
      });
      return response.data;
    } catch (error) {
      console.error('查询余额失败:', error);
      return {
        address,
        balance: '0',
        network: 'Sepolia',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  },

  // 获取支持的链
  getSupportedChains: async () => {
    const response = await api.get('/api/evm/chains');
    return response.data;
  },
};

// 工具函数
export const utils = {
  // 格式化时间
  formatTime: (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // 格式化日期
  formatDate: (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  },

  // 生成消息 ID
  generateMessageId: () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // 生成会话 ID
  generateSessionId: () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};

export default api;
