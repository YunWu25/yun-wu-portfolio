import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// Parse markdown content and render images
function renderContent(content: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  // Match markdown images: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = imageRegex.exec(content)) !== null) {
    // Add text before the image
    if (match.index > lastIndex) {
      elements.push(
        <span key={key++}>{content.slice(lastIndex, match.index)}</span>
      );
    }

    // Add the image wrapped in a link to open full size
    const alt = match[1];
    const url = match[2];
    elements.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer"
      >
        <img
          src={url}
          alt={alt}
          className="max-w-full h-auto rounded-lg my-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          loading="lazy"
          onError={(e) => {
            // Hide broken images
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) parent.style.display = 'none';
          }}
        />
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last image
  if (lastIndex < content.length) {
    elements.push(<span key={key++}>{content.slice(lastIndex)}</span>);
  }

  return elements.length > 0 ? elements : [content];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isStreaming }) => {
  const isUser = role === 'user';

  return (
    <div className={`px-4 py-3 ${isUser ? '' : 'bg-gray-50'}`}>
      <div className="font-sans text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
        {renderContent(content)}
        {isStreaming && !content && (
          <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
