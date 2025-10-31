import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../../types';
import { Bot, ChevronDown, Check } from 'lucide-react';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  isLoading: boolean;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 确保 agents 是数组
  const safeAgents = Array.isArray(agents) ? agents : [];

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="relative">
        <button
          disabled
          className="flex items-center space-x-2 px-3 py-2 bg-secondary-100 text-secondary-500 rounded-lg cursor-not-allowed"
        >
          <div className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">加载中...</span>
        </button>
      </div>
    );
  }

  if (safeAgents.length === 0) {
    return (
      <div className="relative">
        <button
          disabled
          className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg cursor-not-allowed border border-yellow-200"
        >
          <Bot size={16} />
          <span className="text-sm">无可用 Agent</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 下拉按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-sm"
      >
        <Bot size={16} className="text-secondary-600" />
        <span className="text-secondary-900 font-medium">
          {selectedAgent ? selectedAgent.name : '选择 Agent'}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-secondary-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2 space-y-1">
            {safeAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-left ${
                  selectedAgent?.id === agent.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-secondary-50 text-secondary-900'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedAgent?.id === agent.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-200 text-secondary-700'
                }`}>
                  <Bot size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium truncate">
                      {agent.name}
                    </span>
                    {selectedAgent?.id === agent.id && (
                      <Check size={16} className="text-primary-500 flex-shrink-0" />
                    )}
                  </div>
                  {agent.bio && (
                    <p className="text-xs text-secondary-600 truncate mt-0.5">
                      {agent.bio}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSelector;
