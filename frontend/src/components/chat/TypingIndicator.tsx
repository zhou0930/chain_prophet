import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-2">
        {/* 头像 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-200 text-secondary-700 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-secondary-400"></div>
        </div>

        {/* 打字指示器 */}
        <div className="bg-secondary-100 text-secondary-900 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
