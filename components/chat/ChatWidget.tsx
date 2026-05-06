import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
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

  // Add greeting message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.greeting }]);
    }
  }, [isOpen, messages.length, t.greeting]);

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
    <>
      {/* Chat Button */}
      <button
        onClick={() => { setIsOpen(true); }}
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label={language === 'zh' ? '打开聊天' : 'Open chat'}
      >
        <MessageCircle size={18} />
        <span className="font-sans text-sm font-medium">
          {language === 'zh' ? '问 Yun AI' : 'Ask Yun AI'}
        </span>
      </button>

      {/* Chat Panel - smaller window */}
      <div
        className={`fixed z-50 bottom-6 left-6 w-[380px] h-[520px] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-left ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-coral flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Y</span>
            </div>
            <h3 className="font-sans text-sm font-semibold text-gray-900">{t.title}</h3>
          </div>
          <button
            onClick={() => { setIsOpen(false); }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label={language === 'zh' ? '关闭' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center mb-3">
                <span className="text-white text-base font-semibold">Y</span>
              </div>
              <h2 className="font-sans text-base font-medium text-gray-900 mb-1">
                {language === 'zh' ? '有什么可以帮你的？' : 'How can I help you?'}
              </h2>
              <p className="font-sans text-xs text-gray-500 text-center">
                {language === 'zh'
                  ? '问我关于伍芸的作品或服务'
                  : "Ask about Yun's work or services"}
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
    </>
  );
};

export default ChatWidget;
