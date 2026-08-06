import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../../App';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { User, X } from 'lucide-react';

interface ChatWidgetProps {
  language: Language;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'chat_username';
const MSG_STORAGE_KEY = 'chat_history_messages';
const MAX_STORED_MESSAGES = 6; // 1 greeting + 5 recent conversation messages

const ChatWidget: React.FC<ChatWidgetProps> = ({ language }) => {
  // Lazy initialization for username
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) ?? '';
    }
    return '';
  });

  // Lazy initialization for messages - restore from localStorage or create greeting
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MSG_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Message[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Invalid JSON in storage, ignore and create fresh greeting
      }
    }
    // No stored messages - will be set by greeting effect
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Always start minimized
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [nicknameInputValue, setNicknameInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  // Session guards - prevent duplicate greetings/welcome backs
  const hasGreeted = useRef(false);
  const hasWelcomedBack = useRef(false);
  // Track if messages were restored from storage (for welcome back logic)
  const hadRestoredMessages = useRef(messages.length > 0);

  const text = {
    en: {
      title: 'Chat with AI Yun',
      greeting: "Hi! I'm Yun's AI assistant. Ask me anything about her work, services, or projects!",
      greetingWithName: (name: string) => `Hi ${name}! I'm Yun's AI assistant. How can I help you today?`,
      welcomeBack: (name: string) => name
        ? `Welcome back, ${name}! Great to see you again. We were just talking about the portfolio. Should we continue, or do you have something new in mind?`
        : `Welcome back! Great to see you again. Should we continue where we left off, or do you have something new in mind?`,
      error: 'Sorry, something went wrong. Please try again.',
      setNickname: 'Set nickname',
      nicknamePlaceholder: 'Enter your name',
      save: 'Save',
      cancel: 'Cancel',
    },
    zh: {
      title: '与芸对话',
      greeting: '你好！我是芸的AI助手。问我任何关于她的作品、服务或项目的问题吧！',
      greetingWithName: (name: string) => `${name}，你好！我是芸的AI助手，今天有什么可以帮你的吗？`,
      welcomeBack: (name: string) => name
        ? `欢迎回来，${name}！很高兴再次见到您。我们刚才聊到了一些话题，您想继续聊聊，还是有新的想法呢？`
        : `欢迎回来！很高兴再次见到您。您想继续之前的话题，还是有新的想法呢？`,
      error: '抱歉，出了点问题。请重试。',
      setNickname: '设置昵称',
      nicknamePlaceholder: '输入你的名字',
      save: '保存',
      cancel: '取消',
    },
  };

  const t = text[language];

  // Save username to localStorage
  const saveNickname = () => {
    const trimmedName = nicknameInputValue.trim();
    setUsername(trimmedName);
    if (trimmedName) {
      localStorage.setItem(STORAGE_KEY, trimmedName);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setShowNicknameInput(false);
    setNicknameInputValue('');
  };

  // Handle input focus - trigger greeting or welcome back message
  const handleInputFocus = () => {
    // Case 1: Fresh session with no messages - show initial greeting
    if (messages.length === 0 && !hasGreeted.current) {
      hasGreeted.current = true;
      const greeting = username.trim()
        ? text[language].greetingWithName(username.trim())
        : text[language].greeting;
      setMessages([{ role: 'assistant', content: greeting }]);
      return;
    }

    // Case 2: Restored session - show welcome back message (once per session)
    if (hadRestoredMessages.current && !hasWelcomedBack.current) {
      hasWelcomedBack.current = true;
      const welcomeBack = text[language].welcomeBack(username.trim());
      setMessages((prev) => [...prev, { role: 'assistant', content: welcomeBack }]);
    }
  };

  // Persist messages to localStorage with rolling window (max 6 messages)
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        // Keep only the last MAX_STORED_MESSAGES to prevent memory issues
        const messagesToStore = messages.length > MAX_STORED_MESSAGES
          ? messages.slice(-MAX_STORED_MESSAGES)
          : messages;
        localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(messagesToStore));
      } catch {
        // Storage full or unavailable, silently fail
      }
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Click outside to minimize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          username: username.trim() || undefined,
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

  // Determine height based on state
  const getHeight = () => {
    if (!isExpanded) {
      return 'h-[44px] md:h-[48px]'; // Minimized size
    }
    return 'h-[350px] md:h-[400px]'; // Expanded size
  };

  // Determine width based on state
  const getWidth = () => {
    if (!isExpanded) {
      return 'w-[140px] md:w-[160px]'; // Minimized size
    }
    return 'w-[280px] md:w-[320px]'; // Expanded size
  };

  return (
    <div
      ref={widgetRef}
      onClick={() => { if (!isExpanded) setIsExpanded(true); }}
      className={`fixed z-50 bottom-4 right-4 md:bottom-6 md:right-6 ${getWidth()} ${getHeight()} bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col overflow-hidden ${!isExpanded ? 'cursor-pointer' : ''}`}>
      {/* Minimized View */}
      {!isExpanded ? (
        <div className="h-full flex items-center justify-center px-4">
          <p className="font-sans text-sm text-gray-500">
            {language === 'zh' ? '💬 点击展开对话' : '💬 Click to chat'}
          </p>
        </div>
      ) : (
        <>
          {/* Nickname Setting Bar */}
          {showNicknameInput ? (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <input
                type="text"
                value={nicknameInputValue}
                onChange={(e) => { setNicknameInputValue(e.target.value); }}
                placeholder={t.nicknamePlaceholder}
                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-coral"
                maxLength={20}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveNickname();
                  }
                }}
              />
              <button
                onClick={saveNickname}
                className="px-2 py-1 text-xs bg-coral text-white rounded hover:bg-coral/90 transition-colors"
              >
                {t.save}
              </button>
              <button
                onClick={() => { setShowNicknameInput(false); setNicknameInputValue(''); }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-400">
                {username ? `${language === 'zh' ? '你好' : 'Hi'}, ${username}` : ''}
              </span>
              <button
                onClick={() => { setNicknameInputValue(username); setShowNicknameInput(true); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-coral transition-colors"
              >
                <User size={12} />
                {t.setNickname}
              </button>
            </div>
          )}

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
            onFocus={handleInputFocus}
            disabled={isLoading}
            language={language}
          />
        </>
      )}
    </div>
  );
};

export default ChatWidget;
