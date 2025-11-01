import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

// Socket.IO 消息类型（基于 ElizaOS 标准）
enum SOCKET_MESSAGE_TYPE {
  ROOM_JOINING = 1,
  SEND_MESSAGE = 2,
}

interface SocketMessagePayload {
  senderId: string;
  author_id?: string; // 别名，某些后端可能需要
  senderName: string;
  message: string;
  roomId?: string;
  channelId: string; // 必需的字段
  serverId?: string; // server_id 的别名
  server_id?: string; // 必需的字段
  messageId: string;
  source?: string;
  attachments?: any[];
  metadata?: Record<string, any>;
}

interface SocketMessageResponse {
  senderId?: string;
  senderName?: string;
  text?: string;
  content?: string;
  roomId?: string;
  channelId?: string;
  id?: string;
  createdAt?: string;
  timestamp?: number;
  source?: string;
  thought?: string;
  actions?: string[];
  attachments?: any[];
  metadata?: Record<string, any>;
  isAgent?: boolean;
  role?: string;
  authorId?: string;
  raw_message?: any; // ElizaOS 原始消息格式
  [key: string]: any; // 允许其他字段
}

// 生成 UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Socket.IO 服务类
class SocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private agentId: string | null = null;
  private userId: string | null = null;
  private serverId: string = '00000000-0000-0000-0000-000000000000'; // 默认 serverId（ElizaOS 标准）
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnected = false;

  // 获取 Socket.IO 服务器地址
  private getSocketURL(): string {
    const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
    return API_BASE_URL;
  }

  // 连接到 Socket.IO 服务器
  connect(sessionId: string, agentId: string, userId: string, serverId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果已经连接且会话相同，直接返回
      if (this.socket?.connected && this.sessionId === sessionId) {
        console.log('Socket 已连接，会话相同');
        resolve();
        return;
      }

      // 断开现有连接
      this.disconnect();

      // 保存会话信息
      this.sessionId = sessionId;
      this.agentId = agentId;
      this.userId = userId;
      // serverId 使用默认值（ElizaOS 标准默认服务器）或传入的值
      this.serverId = serverId || '00000000-0000-0000-0000-000000000000';

      const socketURL = this.getSocketURL();
      console.log('正在连接到 Socket.IO 服务器:', socketURL);

      // 创建 Socket.IO 连接
      this.socket = io(socketURL, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
      });

      // 连接成功
      this.socket.on('connect', () => {
        console.log('[Socket.IO] 连接成功, Socket ID:', this.socket?.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 加入房间（使用 sessionId 作为 roomId）
        if (this.socket && this.sessionId) {
          this.joinRoom(this.sessionId);
        }

        resolve();
      });

      // 连接错误
      this.socket.on('connect_error', (error) => {
        console.error('[Socket.IO] 连接错误:', error);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Socket.IO 连接失败，已达到最大重试次数'));
        }
      });

      // 断开连接
      this.socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] 断开连接:', reason);
        this.isConnected = false;
      });

      // 重连成功
      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket.IO] 重连成功, 尝试次数:', attemptNumber);
        this.isConnected = true;
        
        // 重新加入房间
        if (this.sessionId) {
          this.joinRoom(this.sessionId);
        }
      });

      // 重连尝试
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('[Socket.IO] 重连尝试:', attemptNumber);
      });

      // 重连失败
      this.socket.on('reconnect_failed', () => {
        console.error('[Socket.IO] 重连失败');
        this.isConnected = false;
      });
    });
  }

  // 加入房间
  private joinRoom(roomId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[Socket.IO] 无法加入房间，Socket 未连接');
      return;
    }

    console.log('[Socket.IO] 加入房间:', roomId);
    
    // 方式1：使用 message 事件加入房间（基于 ElizaOS 标准）
    this.socket.emit('message', {
      type: SOCKET_MESSAGE_TYPE.ROOM_JOINING,
      payload: {
        roomId: roomId,
        entityId: this.userId || this.agentId,
        agentId: this.agentId,
      },
    });

    // 方式2：也尝试使用 join 事件（如果后端支持）
    this.socket.emit('join', {
      roomId: roomId,
      agentId: this.agentId,
    });
  }

  // 离开房间
  leaveRoom(roomId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    console.log('[Socket.IO] 离开房间:', roomId);
    
    this.socket.emit('leave', {
      roomId: roomId,
      agentId: this.agentId,
    });
  }

  // 发送消息
  sendMessage(content: string, metadata?: Record<string, any>): void {
    if (!this.socket || !this.socket.connected) {
      console.error('[Socket.IO] 无法发送消息，Socket 未连接');
      return;
    }

    if (!this.sessionId || !this.userId) {
      console.error('[Socket.IO] 无法发送消息，缺少会话信息');
      return;
    }

    // 生成消息 ID（使用 UUID v4 格式，与成功例子一致）
    const messageId = generateUUID();

    // 构建消息负载，包含后端所需的所有字段
    // 根据成功的例子，需要设置 metadata 中的 channelType、isDm 和 targetUserId
    const messagePayload: SocketMessagePayload = {
      senderId: this.userId!,
      author_id: this.userId!, // 某些后端可能需要 author_id
      senderName: 'user', // 小写，与成功例子一致
      message: content,
      channelId: this.sessionId!, // 必需字段：使用 sessionId 作为 channelId
      serverId: this.serverId, // 必需字段：使用默认 serverId
      server_id: this.serverId, // 某些后端可能需要 server_id
      roomId: this.sessionId, // 保留 roomId 以兼容
      messageId: messageId,
      source: 'client_chat', // 使用 'client_chat' 与成功例子一致
      attachments: [],
      metadata: {
        channelType: 'DM', // 设置为 DM 类型
        isDm: true, // 标记为 DM
        targetUserId: this.agentId || '', // 设置目标 Agent ID，这是关键！
        ...(metadata || {}), // 合并用户传入的 metadata
      },
    };

    console.log('[Socket.IO] 发送消息:', messagePayload);

    // 使用 ElizaOS 标准格式发送消息
    this.socket.emit('message', {
      type: SOCKET_MESSAGE_TYPE.SEND_MESSAGE,
      payload: messagePayload,
    });
  }

  // 监听消息广播
  onMessageBroadcast(callback: (message: Message) => void): void {
    if (!this.socket) {
      console.warn('[Socket.IO] Socket 未初始化，无法监听消息');
      return;
    }

    this.socket.on('messageBroadcast', (data: SocketMessageResponse) => {
      console.log('[Socket.IO] 收到消息广播:', data);

      // 检查消息是否属于当前会话
      const roomId = data.roomId || data.channelId;
      if (roomId !== this.sessionId) {
        console.log('[Socket.IO] 消息不属于当前会话，忽略');
        return;
      }

      // 判断是否为 AI 消息
      const isAgentMessage = data.isAgent === true || 
                            data.role === 'agent' || 
                            data.role === 'assistant' ||
                            (data.metadata && data.metadata.agent_id) ||
                            (data.metadata && data.metadata.agentName) ||
                            (data.senderId && data.senderId !== this.userId && data.senderId === this.agentId);

      // 如果发送者不是当前用户，则认为是 AI 消息
      const isNotUserMessage = !data.senderId || data.senderId !== this.userId;

      if (isAgentMessage && isNotUserMessage) {
        const content = data.text || data.content || '';
        
        // 忽略所有 action 相关的消息（执行中和完成的都忽略）
        if (content.match(/^Executing action:/) || content.match(/^Action \w+ completed/)) {
          console.log('[Socket.IO] 忽略 action 消息:', content);
          return;
        }
        
        const message: Message = {
          id: data.id || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: content,
          role: 'agent',
          timestamp: data.timestamp || (data.createdAt ? new Date(data.createdAt).getTime() : Date.now()),
          actions: data.actions || [],
          metadata: data.metadata || {},
        };

        callback(message);
      }
    });
  }

  // 监听消息处理完成
  onMessageComplete(callback: () => void): void {
    if (!this.socket) return;

    this.socket.on('messageComplete', (data) => {
      console.log('[Socket.IO] 消息处理完成:', data);
      callback();
    });
  }

  // 监听会话过期警告
  onSessionExpirationWarning(callback: (data: any) => void): void {
    if (!this.socket) return;

    this.socket.on('sessionExpirationWarning', (data) => {
      console.log('[Socket.IO] 会话过期警告:', data);
      callback(data);
    });
  }

  // 监听会话过期
  onSessionExpired(callback: (data: any) => void): void {
    if (!this.socket) return;

    this.socket.on('sessionExpired', (data) => {
      console.log('[Socket.IO] 会话已过期:', data);
      callback(data);
    });
  }

  // 监听会话续期
  onSessionRenewed(callback: (data: any) => void): void {
    if (!this.socket) return;

    this.socket.on('sessionRenewed', (data) => {
      console.log('[Socket.IO] 会话已续期:', data);
      callback(data);
    });
  }

  // 监听连接建立
  onConnectionEstablished(callback: (data: any) => void): void {
    if (!this.socket) return;

    this.socket.on('connection_established', (data) => {
      console.log('[Socket.IO] 连接已建立:', data);
      callback(data);
    });
  }

  // 监听错误
  onError(callback: (error: any) => void): void {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('[Socket.IO] 错误:', error);
      callback(error);
    });
  }

  // 移除所有监听器
  removeAllListeners(): void {
    if (!this.socket) return;

    this.socket.removeAllListeners('messageBroadcast');
    this.socket.removeAllListeners('messageComplete');
    this.socket.removeAllListeners('sessionExpirationWarning');
    this.socket.removeAllListeners('sessionExpired');
    this.socket.removeAllListeners('sessionRenewed');
    this.socket.removeAllListeners('connection_established');
    this.socket.removeAllListeners('error');
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      // 离开房间
      if (this.sessionId) {
        this.leaveRoom(this.sessionId);
      }

      // 移除所有监听器
      this.removeAllListeners();

      // 断开连接
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.sessionId = null;
    this.agentId = null;
    this.userId = null;
    // 注意：不重置 serverId，保持使用默认值
    console.log('[Socket.IO] 已断开连接');
  }

  // 检查连接状态
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // 获取当前会话 ID
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }
}

// 导出单例
export const socketService = new SocketService();
export default socketService;

