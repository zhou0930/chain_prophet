import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import { Agent } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layouts/Sidebar';
import ChatPage from './pages/ChatPage';
import WalletPage from './pages/WalletPage';

// 主应用组件
const App: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { agents, agentsLoading } = useChat();

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
                  />
                }
              />

              {/* 钱包页面 */}
              <Route path="/wallet" element={<WalletPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
