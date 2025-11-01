import { Message, Session } from '../types';

export interface ConversationHistory {
  sessionId: string;
  agentId: string;
  agentName: string;
  messages: Message[];
  createdAt: number;
  lastActivity: number;
}

const STORAGE_KEY = 'chain_prophet_conversations';
const MAX_CONVERSATIONS = 50; // 最多保存50个历史对话

/**
 * 获取所有历史对话
 */
export const getConversationHistory = (): ConversationHistory[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const conversations: ConversationHistory[] = JSON.parse(stored);
    // 按最后活动时间排序，最新的在前
    return conversations.sort((a, b) => b.lastActivity - a.lastActivity);
  } catch (error) {
    console.error('读取历史对话失败:', error);
    return [];
  }
};

/**
 * 保存对话到历史记录
 */
export const saveConversation = (session: Session, agentName: string, messages: Message[]): void => {
  try {
    const conversations = getConversationHistory();
    
    // 查找是否已存在相同的会话
    const existingIndex = conversations.findIndex(c => c.sessionId === session.id);
    
    const conversation: ConversationHistory = {
      sessionId: session.id,
      agentId: session.agentId,
      agentName,
      messages: [...messages], // 深拷贝消息数组
      createdAt: session.createdAt,
      lastActivity: session.lastActivity || Date.now(),
    };
    
    if (existingIndex >= 0) {
      // 更新已存在的对话
      conversations[existingIndex] = conversation;
    } else {
      // 添加新对话
      conversations.unshift(conversation);
      
      // 限制对话数量
      if (conversations.length > MAX_CONVERSATIONS) {
        conversations.splice(MAX_CONVERSATIONS);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    console.log('对话已保存到历史记录');
  } catch (error) {
    console.error('保存对话失败:', error);
    // 如果存储空间不足，尝试清理旧对话
    try {
      const conversations = getConversationHistory();
      // 只保留最新的20个对话
      const limitedConversations = conversations.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedConversations));
      console.log('已清理旧对话，重新保存');
    } catch (cleanupError) {
      console.error('清理对话失败:', cleanupError);
    }
  }
};

/**
 * 更新对话的最后活动时间
 */
export const updateConversationActivity = (sessionId: string): void => {
  try {
    const conversations = getConversationHistory();
    const index = conversations.findIndex(c => c.sessionId === sessionId);
    
    if (index >= 0) {
      conversations[index].lastActivity = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  } catch (error) {
    console.error('更新对话活动时间失败:', error);
  }
};

/**
 * 更新对话的消息列表
 */
export const updateConversationMessages = (sessionId: string, messages: Message[]): void => {
  try {
    const conversations = getConversationHistory();
    const index = conversations.findIndex(c => c.sessionId === sessionId);
    
    if (index >= 0) {
      conversations[index].messages = [...messages];
      conversations[index].lastActivity = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  } catch (error) {
    console.error('更新对话消息失败:', error);
  }
};

/**
 * 删除指定的对话
 */
export const deleteConversation = (sessionId: string): void => {
  try {
    const conversations = getConversationHistory();
    const filtered = conversations.filter(c => c.sessionId !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('对话已删除');
  } catch (error) {
    console.error('删除对话失败:', error);
  }
};

/**
 * 清空所有历史对话
 */
export const clearAllConversations = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('所有历史对话已清空');
  } catch (error) {
    console.error('清空对话失败:', error);
  }
};

/**
 * 根据会话ID获取对话
 */
export const getConversationBySessionId = (sessionId: string): ConversationHistory | null => {
  try {
    const conversations = getConversationHistory();
    return conversations.find(c => c.sessionId === sessionId) || null;
  } catch (error) {
    console.error('获取对话失败:', error);
    return null;
  }
};

/**
 * 获取最近的N个对话
 */
export const getRecentConversations = (limit: number = 10): ConversationHistory[] => {
  const conversations = getConversationHistory();
  return conversations.slice(0, limit);
};

