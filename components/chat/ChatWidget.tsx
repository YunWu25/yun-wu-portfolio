import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../../App';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWidgetProps {
  language: Language;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const text = {
    en: {
      title: 'Chat with Yun',
      greeting: "Hi! I'm Yun's AI assistant. Ask me anything about her work, services, or projects!",
      error: 'Sorry, something went wrong. Please try again.',
    },
    zh: {
      title: '与芸对话',
      greeting: '你好！我是芸的AI助手。问我任何关于她的作品、服务或项目的问题吧！',
      error: '抱歉，出了点问题。请重试。',
    },
  };

  const t = text[language];

  // Add greeting message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.greeting }]);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      let buffer = '';

      const processChunk = (text: string) => {
        buffer += text;
        const lines = buffer.split('\n');
        // Keep the last incomplete line in buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data) as { response?: string };
              if (parsed.response) {
                fullContent += parsed.response;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = fullContent;
                  }
                  return newMessages;
                });
              }
            } catch {
              // Skip invalid JSON - might be partial
            }
          }
        }
      };

      const readStream = async (): Promise<void> => {
        const result = await reader.read();
        if (result.done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            processChunk('\n');
          }
          return;
        }

        const chunk = decoder.decode(result.value, { stream: true });
        processChunk(chunk);
        return readStream();
      };

      await readStream();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage?.role === 'assistant') {
          lastMessage.content = t.error;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-50 bottom-6 right-6 w-[300px] h-[240px] bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4 text-center">
            <p className="font-sans text-sm text-gray-400">
              {language === 'zh' ? '问我任何问题...' : 'Ask me anything...'}
            </p>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={() => void sendMessage()}
        disabled={isLoading}
        language={language}
      />
    </div>
  );
};

export default ChatWidget;
