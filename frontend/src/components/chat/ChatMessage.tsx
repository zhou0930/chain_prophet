import React from 'react';
import { Message } from '../../types';
import { utils } from '../../services/api';
import { Bot, User, Zap } from 'lucide-react';


interface ChatMessageProps {
  message: Message;
  onButtonClick?: (callbackData: string) => void;
  allMessages?: Message[]; // 所有消息，用于检查按钮状态
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onButtonClick, allMessages = [] }) => {
  const isUser = message.role === 'user';
  
  // 状态：跟踪哪个按钮被点击了（存储 callback_data）
  const [clickedButton, setClickedButton] = React.useState<string | null>(null);

  // 从消息历史中恢复按钮状态
  React.useEffect(() => {
    if (message.buttons && allMessages.length > 0) {
      // 找到当前消息在列表中的位置
      const currentIndex = allMessages.findIndex(msg => msg.id === message.id);
      if (currentIndex === -1) return;
      
      // 检查消息的 metadata 中是否已标记按钮状态
      if (message.metadata?.buttonClicked) {
        console.log('[ChatMessage] 从 metadata 恢复按钮状态:', message.metadata.buttonClicked);
        setClickedButton(message.metadata.buttonClicked);
        return;
      }
      
      // 检查后续消息中是否有按钮点击的响应或相关操作结果
      const buttonCallbackDataValues = ['balance_confirm_yes', 'balance_confirm_no', 'transfer_confirm_yes', 'transfer_confirm_no', 'nft_action_confirm_yes', 'nft_action_confirm_no'];
      
      // 检查后续消息，寻找：
      // 1. 按钮点击响应消息（callback_data）
      // 2. AI 的回复消息（操作完成、已取消等）
      // 3. 操作结果消息（余额查询结果等）
      for (let i = currentIndex + 1; i < allMessages.length; i++) {
        const nextMessage = allMessages[i];
        const nextContent = (nextMessage.content || '').toLowerCase();
        const nextMetadata = nextMessage.metadata || {};
        
        // 检查是否是按钮点击响应（虽然按钮点击消息被过滤，但可能在 metadata 中有记录）
        const matchedCallbackData = buttonCallbackDataValues.find(callbackData => {
          return nextContent === callbackData ||
                 nextMetadata.callback_data === callbackData ||
                 nextMetadata.buttonCallbackData === callbackData;
        });
        
        if (matchedCallbackData) {
          console.log('[ChatMessage] 从后续消息恢复按钮状态:', matchedCallbackData);
          setClickedButton(matchedCallbackData);
          // 同时更新当前消息的 metadata 以便下次直接读取
          if (message.metadata) {
            message.metadata.buttonClicked = matchedCallbackData;
          }
          break;
        }
        
        // 检查是否是 AI 的回复消息，可能包含操作结果
        // 如果消息中包含"操作已取消"、"查询完成"、"余额"等关键词，说明按钮已被点击
        if (nextMessage.role === 'agent') {
          // 检查是否是取消消息
          if (nextContent.includes('操作已取消') || nextContent.includes('已取消')) {
            // 检查按钮类型，如果是确认类按钮，取消对应"取消"按钮被点击
            const hasConfirmButtons = message.buttons.some(row => 
              row.some(btn => btn.callback_data?.includes('_yes'))
            );
            if (hasConfirmButtons) {
              const cancelButton = message.buttons.flat().find(btn => btn.callback_data?.includes('_no'));
              if (cancelButton?.callback_data) {
                console.log('[ChatMessage] 从取消回复恢复按钮状态:', cancelButton.callback_data);
                setClickedButton(cancelButton.callback_data);
                break;
              }
            }
          }
          
          // 检查是否是操作完成消息（包含余额、结果等）
          // 如果是确认类操作的结果，说明确认按钮被点击了
          if (nextContent.includes('余额') || 
              nextContent.includes('查询') || 
              nextContent.includes('eth') ||
              nextContent.includes('结果') ||
              nextMessage.actions?.some(action => action.includes('BALANCE') || action.includes('NFT'))) {
            const confirmButton = message.buttons.flat().find(btn => btn.callback_data?.includes('_yes'));
            if (confirmButton?.callback_data) {
              console.log('[ChatMessage] 从操作结果恢复按钮状态:', confirmButton.callback_data);
              setClickedButton(confirmButton.callback_data);
              break;
            }
          }
        }
      }
    }
  }, [message.id, message.buttons, allMessages, message.metadata]);

  // 调试日志
  React.useEffect(() => {
    if (message.buttons) {
      console.log('[ChatMessage] 消息包含按钮:', {
        messageId: message.id,
        buttons: message.buttons,
        buttonsLength: message.buttons.length,
        clickedButton,
      });
    }
  }, [message.buttons, message.id, clickedButton]);

  // 忽略 action 相关的消息
  if (message.isAction) {
    return null;
  }

  // 处理按钮点击
  const handleButtonClick = (callbackData?: string, url?: string) => {
    console.log('[ChatMessage] 按钮被点击:', { callbackData, url });
    
    // 如果已经点击过按钮，不再处理
    if (clickedButton) {
      return;
    }
    
    if (url) {
      window.open(url, '_blank');
      return;
    }
    
    if (callbackData) {
      // 标记按钮已被点击
      setClickedButton(callbackData);
      
      // 在消息的 metadata 中保存按钮状态，以便从历史记录恢复
      if (message.metadata) {
        message.metadata.buttonClicked = callbackData;
      } else {
        message.metadata = { buttonClicked: callbackData };
      }
      
      // 发送 callback_data
      if (onButtonClick) {
        onButtonClick(callbackData);
      }
    }
  };

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
            
            {/* 显示按钮 */}
            {message.buttons && message.buttons.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {message.buttons.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2 flex-wrap">
                    {row.map((button, buttonIndex) => {
                      const isClicked = clickedButton === button.callback_data;
                      const shouldHide = clickedButton && clickedButton !== button.callback_data;
                      
                      // 如果按钮应该隐藏，不渲染
                      if (shouldHide) {
                        return null;
                      }
                      
                      return (
                        <button
                          key={buttonIndex}
                          onClick={() => handleButtonClick(button.callback_data, button.url)}
                          disabled={isClicked || !!clickedButton}
                          className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                            isClicked
                              ? 'bg-green-500 cursor-not-allowed opacity-75'
                              : clickedButton
                              ? 'bg-gray-400 cursor-not-allowed opacity-50'
                              : 'bg-primary-500 hover:bg-primary-600 cursor-pointer'
                          }`}
                        >
                          {isClicked ? '✓ ' : ''}{button.text}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            
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
