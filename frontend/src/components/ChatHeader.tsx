import React from 'react';
import { Session, Agent } from '../types';
import { Bot, Wifi, WifiOff, Clock } from 'lucide-react';
import { utils } from '../services/api';

interface ChatHeaderProps {
  session: Session | null;
  agent: Agent | null;
  onEndSession: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ session, agent, onEndSession }) => {
  if (!session || !agent) {
    return (
      <div className="bg-white border-b border-secondary-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <Bot size={20} className="text-secondary-400" />
          <span className="text-sm text-secondary-500">未连接</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
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
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center">
            <Bot size={20} />
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-secondary-900">{agent.name}</h2>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-xs text-secondary-600">{getStatusText()}</span>
              <span className="text-xs text-secondary-400">•</span>
              <span className="text-xs text-secondary-400">
                会话开始于 {utils.formatTime(session.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onEndSession}
          className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
        >
          结束会话
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
