import React from 'react';
import { User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isStreaming }) => {
  const isUser = role === 'user';

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            isUser ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gradient-to-br from-coral to-orange-400'
          }`}
        >
          {isUser ? (
            <User size={14} className="text-white" />
          ) : (
            <span className="text-white text-xs font-bold">Y</span>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="font-sans text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
            {content}
            {isStreaming && !content && (
              <span className="inline-block w-2 h-4 bg-gray-300 animate-pulse rounded-sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
