import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import { Agent } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layouts/Sidebar';
import ChatPage from './pages/ChatPage';
import WalletPage from './pages/WalletPage';
import MyNFTPage from './pages/MyNFTPage';
import NFTMarketplacePage from './pages/NFTMarketplacePage';
import AddressBookPage from './pages/AddressBookPage';
import TransferPage from './pages/TransferPage';

// 主应用组件
const App: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const {
    messages,
    currentSession,
    isTyping,
    isLoading,
    agents,
    agentsLoading,
    sendMessage,
    startNewSession,
    endSession,
    sendHeartbeat,
    loadConversation,
    messagesEndRef,
  } = useChat();

  // 自动选择第一个可用的 Agent
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="h-screen bg-secondary-50 flex overflow-hidden">
          {/* 左侧边栏 */}
          <Sidebar className="w-64 flex-shrink-0" />

          {/* 主内容区域 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              {/* AI 对话页面 */}
              <Route
                path="/"
                element={
                  <ChatPage
                    selectedAgent={selectedAgent}
                    agents={agents}
                    agentsLoading={agentsLoading}
                    onSelectAgent={setSelectedAgent}
                    messages={messages}
                    currentSession={currentSession}
                    isTyping={isTyping}
                    isLoading={isLoading}
                    sendMessage={sendMessage}
                    startNewSession={startNewSession}
                    endSession={endSession}
                    sendHeartbeat={sendHeartbeat}
                    loadConversation={loadConversation}
                    messagesEndRef={messagesEndRef}
                  />
                }
              />

              {/* 钱包页面 */}
              <Route path="/wallet" element={<WalletPage />} />

              {/* 我的 NFT 页面 */}
              <Route path="/my-nft" element={<MyNFTPage />} />

              {/* NFT 市场页面 */}
              <Route path="/nft" element={<NFTMarketplacePage />} />

              {/* 地址簿页面 */}
              <Route path="/address-book" element={<AddressBookPage />} />

              {/* 转账页面 */}
              <Route path="/transfer" element={<TransferPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
