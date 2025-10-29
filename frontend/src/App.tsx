import React, { useState, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { useEVM } from './hooks/useEVM';
import { Agent } from './types';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import MessageInput from './components/MessageInput';
import AgentSelector from './components/AgentSelector';
import EVMBalanceCard from './components/EVMBalanceCard';
import ConversationHistory from './components/ConversationHistory';
import ErrorBoundary from './components/ErrorBoundary';
import { Bot, MessageCircle, Settings, History } from 'lucide-react';

const App: React.FC = () => {
  const {
    messages,
    currentSession,
    agents,
    isTyping,
    isLoading,
    agentsLoading,
    sendMessage,
    startNewSession,
    endSession,
    sendHeartbeat,
    loadConversation,
    messagesEndRef,
  } = useChat();

  const {
    balanceResult,
    getBalance,
    getBalanceFromPrivateKey,
    extractAddressOrPrivateKey,
    clearResult,
  } = useEVM();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [showEVMResult, setShowEVMResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 自动选择第一个可用的 Agent
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

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

    // 暂时禁用 EVM 余额查询功能，专注于修复聊天功能
    // const { address, privateKey } = extractAddressOrPrivateKey(content);
    // if (address || privateKey) {
    //   if (privateKey) {
    //     getBalanceFromPrivateKey(privateKey);
    //     setShowEVMResult(true);
    //   } else if (address) {
    //     getBalance(address);
    //     setShowEVMResult(true);
    //   }
    // }

    sendMessage(content);
  };

  // 处理 Agent 选择
  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentSelector(false);
    if (currentSession) {
      endSession();
    }
  };

  // 开始新会话
  const handleStartNewSession = () => {
    if (selectedAgent) {
      startNewSession(selectedAgent.id);
    }
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
    <ErrorBoundary>
      <div className="h-screen bg-secondary-50 flex flex-col">
      {/* 头部 */}
      <div className="bg-white border-b border-secondary-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">Chain Prophet</h1>
              <p className="text-sm text-secondary-600">AI Agent 对话平台</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors"
            >
              <History size={16} />
              <span>历史对话</span>
            </button>
            <button
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors"
            >
              <Settings size={16} />
              <span>选择 Agent</span>
            </button>
            
            {!currentSession && selectedAgent && (
              <button
                onClick={handleStartNewSession}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-500 text-white text-sm rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '连接中...' : '开始对话'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <div className={`w-80 bg-white border-r border-secondary-200 transition-transform duration-300 ${
          showAgentSelector ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="p-4">
            <AgentSelector
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={handleSelectAgent}
              isLoading={agentsLoading}
            />
          </div>
        </div>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 聊天头部 */}
          <ChatHeader
            session={currentSession}
            agent={selectedAgent}
            onEndSession={endSession}
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
        </div>
      </div>

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

      {/* 移动端遮罩 */}
      {showAgentSelector && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowAgentSelector(false)}
        />
      )}

      {/* 历史对话对话框 */}
      {showHistory && (
        <ConversationHistory
          onSelectConversation={handleSelectConversation}
          onClose={() => setShowHistory(false)}
        />
      )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
