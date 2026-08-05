import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, Calendar, Globe } from 'lucide-react';

interface ChatMessage {
  time: string;
  content: string;
}

interface ChatLogEntry {
  id: string;
  // New session-based format
  firstSeen?: string;
  lastSeen?: string;
  ipHint?: string;
  messages: ChatMessage[] | string[]; // Support both old and new formats
  // Legacy format
  timestamp?: string;
  language: 'en' | 'zh';
  userAgent: string;
}

export const ChatLogs: React.FC = () => {
  const [logs, setLogs] = useState<ChatLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Override body overflow:hidden from index.html for admin page
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/chat-logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data: { logs: ChatLogEntry[] } = await response.json();
      setLogs(data.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceType = (userAgent: string) => {
    if (/mobile/i.test(userAgent)) return '📱 Mobile';
    if (/tablet/i.test(userAgent)) return '📱 Tablet';
    return '💻 Desktop';
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat Logs
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => void fetchLogs()}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <a
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Photos
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Back to Site
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => void fetchLogs()}
              className="px-4 py-2 bg-coral text-white rounded-lg hover:bg-coral/90"
            >
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No chat logs yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Conversations will appear here when visitors use the AI chat.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-6">
              {logs.length} conversation{logs.length !== 1 ? 's' : ''} logged
            </p>

            {logs.map((log) => {
              // Get timestamp from new or old format
              const timestamp = log.firstSeen ?? log.timestamp ?? '';
              const messageCount = log.messages.length;

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {log.language === 'zh' ? '中文' : 'English'}
                    </span>
                    <span>{getDeviceType(log.userAgent)}</span>
                    {log.ipHint && (
                      <span className="text-gray-400">IP: {log.ipHint}</span>
                    )}
                    {messageCount > 1 && (
                      <span className="bg-coral/10 text-coral px-2 py-0.5 rounded-full text-xs">
                        {messageCount} messages
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {log.messages.map((message, idx) => {
                      // Handle both old (string) and new ({ time, content }) formats
                      const content = typeof message === 'string' ? message : message.content;
                      const time = typeof message === 'string' ? null : message.time;

                      return (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg px-4 py-3 text-gray-700"
                        >
                          <span className="text-xs text-gray-400 block mb-1">
                            {time ? formatDate(time) : `Question ${idx + 1}`}
                          </span>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
