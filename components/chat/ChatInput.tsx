import React, { KeyboardEvent, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Language } from '../../App';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFocus?: () => void;
  disabled: boolean;
  language: Language;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, onFocus, disabled, language }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholder = language === 'zh'
    ? '给 Yun AI 发送消息...'
    : 'Message Yun AI...';

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3">
      <div className="relative flex items-end bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border focus-within:border-gray-300 dark:focus-within:border-dark-muted transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-3 py-2.5 text-sm font-sans bg-transparent dark:text-dark-text resize-none focus:outline-none disabled:text-gray-400 dark:disabled:text-dark-muted leading-relaxed"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className={`m-1.5 p-1.5 text-white rounded-lg transition-colors ${
            value.trim() ? 'bg-coral hover:bg-coral/90' : 'bg-gray-200 dark:bg-dark-border text-gray-400 dark:text-dark-muted'
          } disabled:bg-gray-200 dark:disabled:bg-dark-border disabled:text-gray-400 dark:disabled:text-dark-muted`}
          aria-label={language === 'zh' ? '发送' : 'Send'}
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
