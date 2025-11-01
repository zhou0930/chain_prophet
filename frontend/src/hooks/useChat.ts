import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sessionAPI, agentAPI, SessionTimeoutConfig } from '../services/api';
import { saveConversation, updateConversationMessages, updateConversationActivity } from '../services/storage';
import socketService from '../services/socket';
import { Message, Session } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAgentNameRef = useRef<string>(''); // 用于存储当前Agent名称
  const processedMessageIds = useRef<Set<string>>(new Set()); // 用于跟踪已处理的消息ID
  const socketConnectedRef = useRef<boolean>(false); // 跟踪 Socket 连接状态

  // 获取可用 Agent 列表
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: agentAPI.getAgents,
  });
  
  // 确保 agents 始终是数组
  const agents = Array.isArray(agentsData) ? agentsData : [];

  // 断开 Socket.IO（先定义，供 connectSocket 使用）
  const disconnectSocket = useCallback(() => {
    if (socketConnectedRef.current) {
      console.log('断开 Socket.IO 连接');
      socketService.disconnect();
      socketConnectedRef.current = false;
    }
  }, []);

  // 连接 Socket.IO
  const connectSocket = useCallback(async (session: Session) => {
    if (socketConnectedRef.current && socketService.getCurrentSessionId() === session.id) {
      console.log('Socket 已连接到该会话');
      return;
    }

    try {
      console.log('正在连接 Socket.IO 到会话:', session.id);
      // 使用默认 serverId（00000000-0000-0000-0000-000000000000）作为 serverId
      // 这是 ElizaOS 的标准默认服务器 ID
      await socketService.connect(session.id, session.agentId, session.userId);
      socketConnectedRef.current = true;

      // 监听消息广播
      socketService.onMessageBroadcast((message: Message) => {
        console.log('[Socket.IO] 收到 AI 消息:', message);
        
        // 检查是否已处理过
        if (!processedMessageIds.current.has(message.id)) {
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === message.id);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
          
          processedMessageIds.current.add(message.id);
          setIsTyping(false);
        }
      });

      // 监听消息处理完成
      socketService.onMessageComplete(() => {
        console.log('[Socket.IO] 消息处理完成');
        setIsTyping(false);
      });

      // 监听会话过期警告
      socketService.onSessionExpirationWarning((data) => {
        console.warn('[Socket.IO] 会话即将过期:', data);
        // 可以在这里显示警告提示
      });

      // 监听会话过期
      socketService.onSessionExpired((data) => {
        console.error('[Socket.IO] 会话已过期:', data);
        // 会话过期时断开连接并清理状态
        disconnectSocket();
        setCurrentSession(null);
        setMessages([]);
        processedMessageIds.current.clear();
        setIsInitialLoad(true);
      });

      // 监听会话续期
      socketService.onSessionRenewed((data) => {
        console.log('[Socket.IO] 会话已续期:', data);
      });

      // 监听连接建立
      socketService.onConnectionEstablished((data) => {
        console.log('[Socket.IO] 连接已建立:', data);
      });

      // 监听错误
      socketService.onError((error) => {
        console.error('[Socket.IO] 发生错误:', error);
      });

      console.log('Socket.IO 连接成功');
    } catch (error) {
      console.error('Socket.IO 连接失败:', error);
      socketConnectedRef.current = false;
    }
  }, [disconnectSocket]);

  // 创建会话 - 基于 ElizaOS 标准
  const createSessionMutation = useMutation({
    mutationFn: ({ agentId, userId, timeoutConfig }: { 
      agentId: string; 
      userId?: string; 
      timeoutConfig?: SessionTimeoutConfig;
    }) => {
      console.log('创建会话:', { agentId, userId, timeoutConfig });
      
      // 默认超时配置
      const defaultTimeoutConfig: SessionTimeoutConfig = {
        idleTimeout: 30 * 60 * 1000, // 30分钟空闲超时
        maxLifetime: 24 * 60 * 60 * 1000, // 24小时最大生命周期
        autoRenew: true, // 自动续期
        warningThreshold: 5 * 60 * 1000, // 5分钟警告阈值
      };
      
      return sessionAPI.createSession(agentId, userId, timeoutConfig || defaultTimeoutConfig);
    },
    onSuccess: async (session) => {
      console.log('会话创建成功:', session);
      setCurrentSession(session);
      // 不立即清空消息，让消息历史加载来处理
      
      // 更新Agent名称引用
      const agent = agents.find(a => a.id === session.agentId);
      if (agent) {
        currentAgentNameRef.current = agent.name;
      }

      // 连接 Socket.IO
      // 延迟连接 Socket，确保会话信息已设置
      setTimeout(() => {
        connectSocket(session);
      }, 500);
    },
    onError: (error) => {
      console.error('会话创建失败:', error);
    },
  });

  // 发送消息（使用 Socket.IO）
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content, metadata }: { 
      sessionId: string; 
      content: string; 
      metadata?: Record<string, any> 
    }) => {
      console.log('通过 Socket.IO 发送消息:', { sessionId, content, metadata });
      
      // 检查 Socket 连接状态
      if (!socketService.isSocketConnected()) {
        console.warn('Socket 未连接，尝试使用 REST API 发送消息');
        // 如果 Socket 未连接，回退到 REST API
        return await sessionAPI.sendMessage(sessionId, content, metadata);
      }

      // 使用 Socket.IO 发送消息
      socketService.sendMessage(content, metadata);
      
      // 返回一个成功的响应（Socket.IO 是异步的，不需要等待响应）
      return {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        text: content,
        timestamp: Date.now(),
        metadata: metadata || {},
        actions: [],
      };
    },
    onMutate: async ({ content }) => {
      // 乐观更新：立即添加用户消息
      const userMessage: Message = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        role: 'user',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
    },
    onSuccess: (response) => {
      // 消息发送成功，等待 Socket.IO 接收 AI 回复
      console.log('消息发送成功，等待 AI 回复...', response);
    },
    onError: (error) => {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        role: 'agent',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    },
  });

  // 获取消息历史
  const { data: messageHistory, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', currentSession?.id],
    queryFn: () => currentSession ? sessionAPI.getMessages(currentSession.id) : Promise.resolve([]),
    enabled: !!currentSession,
  });

  // 当消息历史加载时更新消息列表（仅在会话初始化时）
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (messageHistory && messageHistory.length > 0 && isInitialLoad && currentSession) {
      console.log('加载消息历史:', messageHistory);
      const formattedMessages: Message[] = messageHistory.map((msg: any, index: number) => ({
        id: msg.id || `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        content: msg.content || msg.text || '',
        role: msg.role || 'agent',
        timestamp: msg.timestamp || Date.now(),
        actions: msg.actions,
        metadata: msg.metadata,
      }));
      setMessages(formattedMessages);
      setIsInitialLoad(false); // 标记为已加载
      
      // 更新Agent名称引用
      const agent = agents.find(a => a.id === currentSession.agentId);
      if (agent) {
        currentAgentNameRef.current = agent.name;
      }
    }
  }, [messageHistory, currentSession, agents, isInitialLoad]);

  // 调试：监控 messages 状态变化
  useEffect(() => {
    console.log('Messages 状态更新:', {
      count: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content.substring(0, 50) + '...',
        role: msg.role,
        timestamp: msg.timestamp
      }))
    });
  }, [messages]);

  // 当消息更新时，保存到历史记录
  useEffect(() => {
    if (currentSession && messages.length > 0) {
      // 更新对话消息
      updateConversationMessages(currentSession.id, messages);
      
      // 更新活动时间
      updateConversationActivity(currentSession.id);
      
      // 保存完整对话（包含会话信息）
      const agentName = currentAgentNameRef.current || agents.find(a => a.id === currentSession.agentId)?.name || 'Unknown Agent';
      saveConversation(currentSession, agentName, messages);
    }
  }, [messages, currentSession, agents]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 当会话创建时，连接 Socket.IO
  useEffect(() => {
    if (currentSession && !socketConnectedRef.current) {
      // 延迟连接，等待消息历史加载完成
      const timer = setTimeout(() => {
        connectSocket(currentSession);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    } else if (!currentSession) {
      // 如果没有会话，断开 Socket 连接
      disconnectSocket();
    }
  }, [currentSession, connectSocket, disconnectSocket]);

  // 注意：移除了组件卸载时断开连接的逻辑
  // 这样即使路由切换，对话也会在后台保持连接，实现静默状态
  // 只有在用户主动结束会话或会话过期时才会断开连接

  // 发送消息
  const sendMessage = useCallback((content: string, metadata?: Record<string, any>) => {
    if (!currentSession) {
      console.error('没有活跃的会话');
      return;
    }

    if (!currentSession.id) {
      console.error('会话 ID 无效:', currentSession);
      return;
    }

    console.log('准备发送消息到会话:', currentSession.id);
    sendMessageMutation.mutate({
      sessionId: currentSession.id,
      content,
      metadata,
    });
  }, [currentSession, sendMessageMutation]);

  // 开始新会话 - 基于 ElizaOS 标准
  const startNewSession = useCallback((agentId: string, userId?: string, timeoutConfig?: SessionTimeoutConfig) => {
    createSessionMutation.mutate({ agentId, userId, timeoutConfig });
  }, [createSessionMutation]);

  // 结束当前会话
  const endSession = useCallback(() => {
    // 断开 Socket 连接
    disconnectSocket();
    setCurrentSession(null);
    setMessages([]);
    // 清理已处理的消息ID
    processedMessageIds.current.clear();
    // 重置初始加载状态
    setIsInitialLoad(true);
  }, [disconnectSocket]);

  // 续期会话 - 基于 ElizaOS 标准
  const renewSession = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      console.log('续期会话:', currentSession.id);
      await sessionAPI.renewSession(currentSession.id);
      console.log('会话续期成功');
    } catch (error) {
      console.error('续期会话失败:', error);
    }
  }, [currentSession]);

  // 发送心跳 - 基于 ElizaOS 标准
  const sendHeartbeat = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      console.log('发送心跳:', currentSession.id);
      await sessionAPI.sendHeartbeat(currentSession.id);
      console.log('心跳发送成功');
    } catch (error) {
      console.error('发送心跳失败:', error);
    }
  }, [currentSession]);

  // 自动会话管理
  useEffect(() => {
    if (!currentSession) return;

    // 定期发送心跳（每5分钟）
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 5 * 60 * 1000);

    // 定期续期会话（每25分钟）
    const renewInterval = setInterval(() => {
      renewSession();
    }, 25 * 60 * 1000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(renewInterval);
    };
  }, [currentSession, sendHeartbeat, renewSession]);

  // 加载历史对话
  const loadConversation = useCallback((sessionId: string, historyMessages: Message[]) => {
    // 设置消息
    setMessages(historyMessages);
    
    // 更新最后活动时间
    if (currentSession && currentSession.id === sessionId) {
      updateConversationActivity(sessionId);
    }
  }, [currentSession]);

  return {
    // 状态
    messages,
    currentSession,
    agents,
    isTyping,
    isLoading: createSessionMutation.isPending || sendMessageMutation.isPending,
    agentsLoading,
    
    // 操作
    sendMessage,
    startNewSession,
    endSession,
    renewSession,
    sendHeartbeat,
    refetchMessages,
    loadConversation,
    
    // 引用
    messagesEndRef,
  };
};
