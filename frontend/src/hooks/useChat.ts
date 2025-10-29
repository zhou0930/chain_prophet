import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sessionAPI, agentAPI, SessionTimeoutConfig } from '../services/api';
import { saveConversation, updateConversationMessages, updateConversationActivity } from '../services/storage';
import { Message, Session } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentAgentNameRef = useRef<string>(''); // 用于存储当前Agent名称
  const processedMessageIds = useRef<Set<string>>(new Set()); // 用于跟踪已处理的消息ID

  // 获取可用 Agent 列表
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: agentAPI.getAgents,
  });
  
  // 确保 agents 始终是数组
  const agents = Array.isArray(agentsData) ? agentsData : [];

  // 持续轮询获取 AI 回复 - 改进版本：在对话状态下持续轮询
  const startContinuousPolling = useCallback(() => {
    if (!currentSession) return;

    // 清除之前的轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    let lastPolledTimestamp = Date.now(); // 记录上次轮询的时间戳

    const poll = async () => {
      if (!currentSession) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }

      try {
        // 使用 after 参数获取新消息（基于时间戳）
        const response = await sessionAPI.getMessages(currentSession.id, 50, undefined, lastPolledTimestamp);
        console.log('轮询获取消息:', response);
        
        // 处理不同的响应格式
        let messagesList: any[] = [];
        if (response && response.messages && Array.isArray(response.messages)) {
          messagesList = response.messages;
        } else if (Array.isArray(response)) {
          messagesList = response;
        }
        
        if (messagesList.length > 0) {
          // 查找所有AI回复消息（支持多条消息）
          const foundAgentMessages: any[] = [];
          let latestTimestamp = lastPolledTimestamp;
          
          // 遍历所有消息，查找所有AI回复
          for (let i = 0; i < messagesList.length; i++) {
            const message = messagesList[i];
            const messageTime = new Date(message.createdAt || message.timestamp).getTime();
            
            // 判断是否为AI回复 - 基于 ElizaOS 标准
            // 1. 检查明确的AI标识
            const hasAgentFlag = message.isAgent === true || 
                                message.role === 'agent' || 
                                message.role === 'assistant';
            
            // 2. 检查metadata中的AI标识
            const hasAgentMetadata = message.metadata && (
              message.metadata.agent_id || 
              message.metadata.agentName ||
              message.metadata.agent_id === currentSession?.agentId
            );
            
            // 3. 检查authorId是否为AI的ID（如果已知）
            const isAgentAuthor = message.authorId && 
                                 message.authorId !== currentSession.userId &&
                                 (message.authorId === currentSession?.agentId || 
                                  message.authorId === '51313af0-f433-02b3-81a6-f01b84929d4e'); // 已知的AI ID
            
            // 4. 确保不是用户自己的消息
            const isNotUserMessage = !message.authorId || message.authorId !== currentSession.userId;
            
            // 综合判断：必须有明确的AI标识，且不是用户消息
            const isAgentMessage = (hasAgentFlag || hasAgentMetadata || isAgentAuthor) && isNotUserMessage;
            
            console.log('消息分析:', {
              id: message.id,
              content: message.content?.substring(0, 50) + '...',
              isAgent: message.isAgent,
              role: message.role,
              authorId: message.authorId,
              userId: currentSession.userId,
              agentId: currentSession?.agentId,
              hasAgentFlag,
              hasAgentMetadata,
              isAgentAuthor,
              isNotUserMessage,
              isAgentMessage,
              messageTime,
              lastPolledTimestamp,
              isNew: messageTime > lastPolledTimestamp
            });
            
            if (isAgentMessage && isNotUserMessage && messageTime > lastPolledTimestamp) {
              foundAgentMessages.push(message);
              console.log('找到新的AI消息:', message);
            }
            
            // 更新最新的时间戳（用于下次轮询）
            if (messageTime > latestTimestamp) {
              latestTimestamp = messageTime;
            }
          }
          
          // 处理找到的AI消息
          if (foundAgentMessages.length > 0) {
            console.log(`找到 ${foundAgentMessages.length} 条新AI消息`);
            
            // 按时间排序，确保按正确顺序添加
            foundAgentMessages.sort((a, b) => 
              new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime()
            );
            
            // 简化消息添加逻辑
            console.log('开始处理找到的AI消息，数量:', foundAgentMessages.length);
            
            for (const agentMsg of foundAgentMessages) {
              const messageId = agentMsg.id || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              // 检查是否已经处理过这个消息
              if (!processedMessageIds.current.has(messageId)) {
                const agentMessage: Message = {
                  id: messageId,
                  content: agentMsg.content || agentMsg.text || '收到消息',
                  role: 'agent',
                  timestamp: agentMsg.timestamp || new Date(agentMsg.createdAt).getTime() || Date.now(),
                  actions: agentMsg.actions || [],
                  metadata: agentMsg.metadata || {},
                };
                
                console.log('添加AI消息到界面:', agentMessage);
                
                // 直接添加消息
                setMessages(prev => {
                  // 检查是否已存在
                  const exists = prev.some(msg => msg.id === messageId);
                  if (!exists) {
                    return [...prev, agentMessage];
                  }
                  return prev;
                });
                
                processedMessageIds.current.add(messageId);
                setIsTyping(false);
              }
            }
          }
          
          // 更新最后轮询的时间戳
          if (latestTimestamp > lastPolledTimestamp) {
            lastPolledTimestamp = latestTimestamp;
          }
        }
      } catch (error) {
        console.error('轮询获取消息失败:', error);
        // 出错时不停止轮询，继续尝试
      }
    };

    // 立即执行一次
    poll();
    
    // 开始持续轮询（每5秒一次）
    pollingIntervalRef.current = setInterval(poll, 5000);
    console.log('开始持续轮询AI回复');
  }, [currentSession]);

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('停止轮询');
    }
  }, []);

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
    onSuccess: (session) => {
      console.log('会话创建成功:', session);
      setCurrentSession(session);
      // 不立即清空消息，让消息历史加载来处理
      
      // 更新Agent名称引用
      const agent = agents.find(a => a.id === session.agentId);
      if (agent) {
        currentAgentNameRef.current = agent.name;
      }
    },
    onError: (error) => {
      console.error('会话创建失败:', error);
    },
  });

  // 发送消息
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content, metadata }: { 
      sessionId: string; 
      content: string; 
      metadata?: Record<string, any> 
    }) => {
      console.log('发送消息:', { sessionId, content, metadata });
      return sessionAPI.sendMessage(sessionId, content, metadata);
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
      // 消息发送成功，但不立即添加 AI 回复
      // 等待后端处理并生成回复
      console.log('消息发送成功，等待 AI 回复...', response);
      
      // 轮询已经在会话创建时启动，不需要重新启动
      // 只需要确保轮询在运行即可
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

  // 当会话创建时，开始持续轮询
  useEffect(() => {
    if (currentSession) {
      // 延迟启动轮询，等待消息历史加载完成
      const timer = setTimeout(() => {
        startContinuousPolling();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        stopPolling();
      };
    } else {
      stopPolling();
    }
  }, [currentSession, startContinuousPolling, stopPolling]);

  // 清理轮询
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

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
    // 停止轮询
    stopPolling();
    setCurrentSession(null);
    setMessages([]);
    // 清理已处理的消息ID
    processedMessageIds.current.clear();
    // 重置初始加载状态
    setIsInitialLoad(true);
  }, [stopPolling]);

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
