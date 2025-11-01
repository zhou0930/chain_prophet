import React from 'react';
import { Message } from '../../types';
import { utils } from '../../services/api';
import { Bot, User, Zap } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // 忽略 action 相关的消息
  if (message.isAction) {
    return null;
  }

  // 普通消息的渲染
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
        {/* 头像 */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary-500 text-white' 
            : 'bg-secondary-200 text-secondary-700'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* 消息内容 */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-secondary-100 text-secondary-900 rounded-bl-md'
          }`}>
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            
            {/* 显示动作 */}
            {message.actions && message.actions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.actions.map((action, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700"
                  >
                    <Zap size={12} className="mr-1" />
                    {action}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* 时间戳 */}
          <div className={`text-xs text-secondary-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {utils.formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
