import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isStreaming }) => {
  const isUser = role === 'user';

  return (
    <div className={`px-4 py-3 ${isUser ? '' : 'bg-gray-50'}`}>
      <div className="font-sans text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
        {content}
        {isStreaming && !content && (
          <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
