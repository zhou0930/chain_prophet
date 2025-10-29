import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sessionAPI, agentAPI, SessionTimeoutConfig } from '../services/api';
import { Message, Session } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 获取可用 Agent 列表
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: agentAPI.getAgents,
  });
  
  // 确保 agents 始终是数组
  const agents = Array.isArray(agentsData) ? agentsData : [];

  // 轮询获取 AI 回复 - 基于 ElizaOS 标准
  const pollForAgentResponse = useCallback(() => {
    if (!currentSession) return;

    let pollCount = 0;
    const maxPolls = 30; // 最多轮询30次（90秒）
    let lastMessageId: string | null = null; // 记录最后一条消息ID
    let consecutiveEmptyPolls = 0; // 连续空轮询次数
    
    const poll = async () => {
      try {
        // 使用 after 参数获取新消息
        const after = lastMessageId ? new Date(lastMessageId).getTime() : undefined;
        const response = await sessionAPI.getMessages(currentSession.id, 10, undefined, after);
        console.log('轮询获取消息:', response);
        
        // 处理不同的响应格式
        let messagesList = [];
        if (response && response.messages && Array.isArray(response.messages)) {
          messagesList = response.messages;
        } else if (Array.isArray(response)) {
          messagesList = response;
        }
        
        if (messagesList.length > 0) {
          // 查找最新的AI回复消息（可能在列表的任何位置）
          let foundAgentMessage = null;
          let latestMessageId = null;
          let latestAgentMessageTime = 0;
          
          // 遍历所有消息，查找最新的AI回复
          for (let i = 0; i < messagesList.length; i++) {
            const message = messagesList[i];
            const messageTime = new Date(message.createdAt).getTime();
            
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
              metadata: message.metadata,
              hasAgentFlag,
              hasAgentMetadata,
              isAgentAuthor,
              isNotUserMessage,
              isAgentMessage,
              finalResult: isAgentMessage && isNotUserMessage
            });
            
            if (isAgentMessage && isNotUserMessage && messageTime > latestAgentMessageTime) {
              foundAgentMessage = message;
              latestAgentMessageTime = messageTime;
              console.log('找到更新的AI消息:', message);
            }
            
            // 更新最新的消息ID（用于下次轮询）
            if (!latestMessageId || messageTime > new Date(latestMessageId).getTime()) {
              latestMessageId = message.id;
            }
          }
          
          // 更新最后一条消息ID
          lastMessageId = latestMessageId;
          consecutiveEmptyPolls = 0; // 重置空轮询计数
          
          if (foundAgentMessage) {
            console.log('AI消息详情:', foundAgentMessage);
            
            // 检查是否已经添加过这条消息
            const messageExists = messages.some(msg => msg.id === foundAgentMessage.id);
            console.log('消息是否已存在:', messageExists);
            
            if (!messageExists) {
              const agentMessage: Message = {
                id: foundAgentMessage.id,
                content: foundAgentMessage.content || foundAgentMessage.text || '收到消息',
                role: 'agent',
                timestamp: foundAgentMessage.timestamp || new Date(foundAgentMessage.createdAt).getTime() || Date.now(),
                actions: foundAgentMessage.actions || [],
                metadata: foundAgentMessage.metadata || {},
              };
              
              console.log('添加AI消息到界面:', agentMessage);
              setMessages(prev => [...prev, agentMessage]);
              setIsTyping(false);
              
              // 停止轮询
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              return;
            }
          }
        } else {
          consecutiveEmptyPolls++;
        }
        
        pollCount++;
        
        // 动态调整轮询间隔
        let pollInterval = 2000; // 默认2秒
        if (consecutiveEmptyPolls < 3) {
          pollInterval = 1000; // 前3次空轮询使用1秒间隔
        } else if (consecutiveEmptyPolls < 10) {
          pollInterval = 2000; // 中间使用2秒间隔
        } else {
          pollInterval = 3000; // 后期使用3秒间隔
        }
        
        if (pollCount >= maxPolls) {
          console.log('轮询超时，停止等待 AI 回复');
          setIsTyping(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else {
          // 动态调整轮询间隔
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = setInterval(poll, pollInterval);
          }
        }
      } catch (error) {
        console.error('轮询获取消息失败:', error);
        setIsTyping(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // 立即执行一次，然后开始轮询
    poll();
    pollingIntervalRef.current = setInterval(poll, 1000); // 初始1秒轮询
  }, [currentSession, messages]);

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
      setMessages([]);
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
        id: `user_${Date.now()}`,
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
      
      // 延迟1.5秒后开始轮询，给AI一些时间生成回复
      setTimeout(() => {
        pollForAgentResponse();
      }, 1500);
    },
    onError: (error) => {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
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

  // 当消息历史加载时更新消息列表
  useEffect(() => {
    if (messageHistory && messageHistory.length > 0) {
      const formattedMessages: Message[] = messageHistory.map((msg: any) => ({
        id: msg.id || `msg_${Date.now()}`,
        content: msg.content || msg.text || '',
        role: msg.role || 'agent',
        timestamp: msg.timestamp || Date.now(),
        actions: msg.actions,
        metadata: msg.metadata,
      }));
      setMessages(formattedMessages);
    }
  }, [messageHistory]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

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
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setCurrentSession(null);
    setMessages([]);
  }, []);

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
    
    // 引用
    messagesEndRef,
  };
};
