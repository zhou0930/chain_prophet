import React from 'react';
import { Session, Agent } from '../../types';
import { Wifi, WifiOff, Clock, History } from 'lucide-react';
import { utils } from '../../services/api';
import AgentSelector from './AgentSelector';

interface ChatHeaderProps {
  session: Session | null;
  agent: Agent | null;
  agents: Agent[];
  agentsLoading: boolean;
  onSelectAgent: (agent: Agent) => void;
  onEndSession: () => void;
  onShowHistory?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  session, 
  agent, 
  agents,
  agentsLoading,
  onSelectAgent, 
  onEndSession,
  onShowHistory
}) => {
  const getStatusIcon = () => {
    if (!session) return null;
    switch (session.status) {
      case 'active':
        return <Wifi size={16} className="text-green-500" />;
      case 'inactive':
        return <WifiOff size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (!session) return '未连接';
    switch (session.status) {
      case 'active':
        return '在线';
      case 'inactive':
        return '离线';
      default:
        return '连接中';
    }
  };

  return (
    <div className="bg-white border-b border-secondary-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Agent 选择器 */}
          <AgentSelector
            agents={agents}
            selectedAgent={agent}
            onSelectAgent={onSelectAgent}
            isLoading={agentsLoading}
          />

          {/* 会话状态 */}
          {session && (
            <>
              <div className="h-6 w-px bg-secondary-300"></div>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-xs text-secondary-600">{getStatusText()}</span>
                <span className="text-xs text-secondary-400">•</span>
                <span className="text-xs text-secondary-400">
                  会话开始于 {utils.formatTime(session.createdAt)}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 历史对话按钮 */}
          {onShowHistory && (
            <button
              onClick={onShowHistory}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors"
            >
              <History size={16} />
              <span>历史</span>
            </button>
          )}
          
          {/* 结束会话按钮 */}
          {session && (
            <button
              onClick={onEndSession}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
            >
              结束会话
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
