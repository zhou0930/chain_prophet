import React, { useState, useEffect } from 'react';
import { ConversationHistory as ConversationHistoryType, getConversationHistory, deleteConversation, clearAllConversations } from '../../services/storage';
import { Message } from '../../types';
import { utils } from '../../services/api';
import { History, Trash2, X, MessageSquare, Clock } from 'lucide-react';

interface ConversationHistoryProps {
  onSelectConversation: (sessionId: string, messages: Message[]) => void;
  onClose: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onSelectConversation, onClose }) => {
  const [conversations, setConversations] = useState<ConversationHistoryType[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationHistoryType | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    const history = getConversationHistory();
    setConversations(history);
  };

  const handleSelectConversation = (conversation: ConversationHistoryType) => {
    setSelectedConversation(conversation);
  };

  const handleConfirmSelect = () => {
    if (selectedConversation) {
      onSelectConversation(selectedConversation.sessionId, selectedConversation.messages);
      onClose();
    }
  };

  const handleDeleteConversation = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteConversation(sessionId);
    loadConversations();
    if (selectedConversation?.sessionId === sessionId) {
      setSelectedConversation(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有历史对话吗？此操作不可恢复。')) {
      clearAllConversations();
      loadConversations();
      setSelectedConversation(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天 ' + utils.formatTime(timestamp);
    } else if (days === 1) {
      return '昨天 ' + utils.formatTime(timestamp);
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return utils.formatDate(timestamp) + ' ' + utils.formatTime(timestamp);
    }
  };

  const getPreviewText = (messages: Message[]) => {
    if (messages.length === 0) return '暂无消息';
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.substring(0, 50);
    return preview + (lastMessage.content.length > 50 ? '...' : '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <div className="flex items-center space-x-2">
            <History size={20} className="text-secondary-600" />
            <h2 className="text-lg font-semibold text-secondary-900">历史对话</h2>
            <span className="text-sm text-secondary-500">({conversations.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            {conversations.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                清空全部
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 对话列表 */}
          <div className="w-1/3 border-r border-secondary-200 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-secondary-500">
                <MessageSquare size={48} className="mx-auto mb-4 text-secondary-300" />
                <p>暂无历史对话</p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.sessionId}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.sessionId === conversation.sessionId
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-secondary-50 hover:bg-secondary-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-secondary-900 truncate">
                            {conversation.agentName}
                          </span>
                          <span className="text-xs text-secondary-500">
                            ({conversation.messages.length}条)
                          </span>
                        </div>
                        <p className="text-xs text-secondary-600 truncate mb-1">
                          {getPreviewText(conversation.messages)}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-secondary-400">
                          <Clock size={12} />
                          <span>{formatDate(conversation.lastActivity)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conversation.sessionId)}
                        className="ml-2 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 对话详情 */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-secondary-900">
                        {selectedConversation.agentName}
                      </h3>
                      <p className="text-sm text-secondary-500">
                        {selectedConversation.messages.length} 条消息 · {formatDate(selectedConversation.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={handleConfirmSelect}
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                    >
                      加载此对话
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message, index) => (
                    <div
                      key={`${message.id}-${index}`}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3xl px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-secondary-100 text-secondary-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words text-sm">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-primary-100' : 'text-secondary-500'
                        }`}>
                          {utils.formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-secondary-500">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-secondary-300" />
                  <p>选择一个对话查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;

