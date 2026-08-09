import React, { useEffect, useState, useMemo } from 'react';
import { MessageSquare, RefreshCw, Calendar, Globe, Users, ChevronRight } from 'lucide-react';

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

// Group logs by user (ipHint)
interface UserGroup {
  ipHint: string;
  logs: ChatLogEntry[];
  totalMessages: number;
  lastActive: string;
}

export const ChatLogs: React.FC = () => {
  const [logs, setLogs] = useState<ChatLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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

  // Group logs by user (ipHint)
  const userGroups = useMemo((): UserGroup[] => {
    const groups = new Map<string, ChatLogEntry[]>();

    for (const log of logs) {
      const key = log.ipHint ?? 'unknown';
      const existing = groups.get(key) ?? [];
      existing.push(log);
      groups.set(key, existing);
    }

    return Array.from(groups.entries())
      .map(([ipHint, userLogs]) => {
        const totalMessages = userLogs.reduce((sum, l) => sum + l.messages.length, 0);
        const lastActive = userLogs.reduce((latest, l) => {
          const time = l.firstSeen ?? l.timestamp ?? '';
          return time > latest ? time : latest;
        }, '');
        return { ipHint, logs: userLogs, totalMessages, lastActive };
      })
      .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }, [logs]);

  // Auto-select first user when data loads
  useEffect(() => {
    if (userGroups.length > 0 && !selectedUser) {
      setSelectedUser(userGroups[0]?.ipHint ?? null);
    }
  }, [userGroups, selectedUser]);

  // Get logs for selected user
  const selectedUserLogs = useMemo(() => {
    if (!selectedUser) return [];
    return userGroups.find(g => g.ipHint === selectedUser)?.logs ?? [];
  }, [userGroups, selectedUser]);

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

  const formatShortDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
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

      {/* Two-column layout */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => void fetchLogs()}
              className="px-4 py-2 bg-coral text-white rounded-lg hover:bg-coral/90"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No chat logs yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Conversations will appear here when visitors use the AI chat.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - User list */}
          <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{userGroups.length} users</span>
                <span className="text-gray-300">|</span>
                <span>{logs.length} sessions</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {userGroups.map((group) => (
                <button
                  key={group.ipHint}
                  onClick={() => { setSelectedUser(group.ipHint); }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                    selectedUser === group.ipHint
                      ? 'bg-coral/5 border-l-2 border-l-coral'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${
                      selectedUser === group.ipHint ? 'text-coral' : 'text-gray-700'
                    }`}>
                      {group.ipHint === 'unknown' ? 'Unknown' : group.ipHint}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${
                      selectedUser === group.ipHint ? 'text-coral' : 'text-gray-300'
                    }`} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{group.logs.length} session{group.logs.length !== 1 ? 's' : ''}</span>
                    <span>{group.totalMessages} msg{group.totalMessages !== 1 ? 's' : ''}</span>
                    <span>{formatShortDate(group.lastActive)}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Right panel - Conversation details */}
          <main className="flex-1 overflow-y-auto p-6">
            {selectedUser ? (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedUser === 'unknown' ? 'Unknown User' : `User ${selectedUser}`}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {selectedUserLogs.length} conversation{selectedUserLogs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {selectedUserLogs.map((log) => {
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
                        {messageCount > 1 && (
                          <span className="bg-coral/10 text-coral px-2 py-0.5 rounded-full text-xs">
                            {messageCount} messages
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {log.messages.map((message, idx) => {
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a user to view their conversations
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
