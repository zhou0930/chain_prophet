import React from 'react';
import { Agent } from '../types';
import { Bot, Check } from 'lucide-react';

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
  // 确保 agents 是数组
  const safeAgents = Array.isArray(agents) ? agents : [];

  if (isLoading) {
    return (
      <div className="p-4 bg-secondary-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-secondary-600">加载 Agent 中...</span>
        </div>
      </div>
    );
  }

  if (safeAgents.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">没有可用的 Agent</p>
        <p className="text-yellow-600 text-sm mt-1">请检查后端服务是否正常运行</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-secondary-700 mb-3">选择 AI Agent</h3>
      <div className="space-y-2">
        {safeAgents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={`w-full p-3 text-left rounded-lg border transition-colors ${
              selectedAgent?.id === agent.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                selectedAgent?.id === agent.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-200 text-secondary-700'
              }`}>
                <Bot size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-secondary-900 truncate">
                    {agent.name}
                  </h4>
                  {selectedAgent?.id === agent.id && (
                    <Check size={16} className="text-primary-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-xs text-secondary-600 mt-1 line-clamp-2">
                  {agent.bio}
                </p>
                
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.capabilities.slice(0, 3).map((capability, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-700"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="text-xs text-secondary-500">
                        +{agent.capabilities.length - 3} 更多
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgentSelector;
