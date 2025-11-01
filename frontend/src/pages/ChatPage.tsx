import React, { useEffect, useState } from 'react';
import { useEVM } from '../hooks/useEVM';
import { Agent, Message, Session } from '../types';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessage from '../components/chat/ChatMessage';
import TypingIndicator from '../components/chat/TypingIndicator';
import MessageInput from '../components/chat/MessageInput';
import EVMBalanceCard from '../components/wallet/EVMBalanceCard';
import ConversationHistory from '../components/chat/ConversationHistory';
import { MessageCircle } from 'lucide-react';
import { RefObject } from 'react';

interface ChatPageProps {
  selectedAgent: Agent | null;
  agents: Agent[];
  agentsLoading: boolean;
  onSelectAgent: (agent: Agent) => void;
  messages: Message[];
  currentSession: Session | null;
  isTyping: boolean;
  isLoading: boolean;
  sendMessage: (content: string, metadata?: Record<string, any>) => void;
  startNewSession: (agentId: string, userId?: string, timeoutConfig?: any) => void;
  endSession: () => void;
  sendHeartbeat: () => void;
  loadConversation: (sessionId: string, historyMessages: Message[]) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const ChatPage: React.FC<ChatPageProps> = ({
  selectedAgent,
  agents,
  agentsLoading,
  onSelectAgent,
  messages,
  currentSession,
  isTyping,
  isLoading,
  sendMessage,
  startNewSession,
  endSession,
  sendHeartbeat,
  loadConversation,
  messagesEndRef,
}) => {

  const {
    balanceResult,
    clearResult,
  } = useEVM();

  const [showEVMResult, setShowEVMResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 定期发送心跳
  useEffect(() => {
    if (!currentSession) return;

    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000); // 每30秒发送一次心跳

    return () => clearInterval(heartbeatInterval);
  }, [currentSession, sendHeartbeat]);

  // 自动开始对话（如果没有会话且有选中的 Agent）
  const autoStartSession = () => {
    if (!currentSession && selectedAgent && !isLoading) {
      startNewSession(selectedAgent.id);
    }
  };

  // 处理消息发送
  const handleSendMessage = (content: string) => {
    if (!currentSession) {
      // 如果没有会话，先创建会话
      if (selectedAgent) {
        startNewSession(selectedAgent.id);
        // 延迟发送消息
        setTimeout(() => {
          sendMessage(content);
        }, 1000);
      }
      return;
    }

    sendMessage(content);
  };

  // 处理加载历史对话
  const handleSelectConversation = (sessionId: string, historyMessages: any[]) => {
    // 加载历史消息到当前会话
    if (currentSession && currentSession.id === sessionId) {
      loadConversation(sessionId, historyMessages);
    } else {
      // 如果有会话但ID不匹配，需要先结束当前会话
      if (currentSession) {
        endSession();
      }
      // 如果没有会话，创建一个新会话，然后加载消息
      if (selectedAgent) {
        startNewSession(selectedAgent.id);
        // 延迟加载消息，等待会话创建
        setTimeout(() => {
          loadConversation(sessionId, historyMessages);
        }, 1000);
      }
    }
    setShowHistory(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-secondary-50">
      {/* 聊天头部 */}
      <ChatHeader
        session={currentSession}
        agent={selectedAgent}
        agents={agents}
        agentsLoading={agentsLoading}
        onSelectAgent={(agent) => {
          onSelectAgent(agent);
          if (currentSession) {
            endSession();
          }
        }}
        onEndSession={endSession}
        onShowHistory={() => setShowHistory(true)}
      />

      {/* 消息列表 */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onClick={autoStartSession}
      >
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={48} className="text-secondary-300 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              开始与 AI Agent 对话
            </h3>
            <p className="text-secondary-600 mb-4">
              点击此处或输入框开始对话
            </p>
            <div className="text-sm text-secondary-500 space-y-1">
              <p>💡 支持 EVM 钱包余额查询</p>
              <p>💡 支持私钥推导地址查询</p>
              <p>💡 支持多种区块链网络</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={`${message.id}-${index}`} message={message} />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* 消息输入 */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onFocus={autoStartSession}
        isLoading={isLoading}
        placeholder={
          selectedAgent 
            ? `与 ${selectedAgent.name} 对话...` 
            : "请先选择一个 Agent"
        }
      />

      {/* EVM 余额查询结果 */}
      {showEVMResult && balanceResult && (
        <div className="fixed bottom-4 right-4 w-80 z-50">
          <EVMBalanceCard
            result={balanceResult}
            onClose={() => {
              setShowEVMResult(false);
              clearResult();
            }}
          />
        </div>
      )}

      {/* 历史对话对话框 */}
      {showHistory && (
        <ConversationHistory
          onSelectConversation={handleSelectConversation}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;
