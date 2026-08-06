// Cloudflare Pages Function: GET /api/admin/chat-logs
// Retrieve chat conversation logs

interface Env {
  CHAT_LOGS: KVNamespace;
}

interface ChatLogEntry {
  id: string;
  // New session format
  firstSeen?: string;
  lastSeen?: string;
  ipHint?: string;
  username?: string;
  messages: Array<{ time: string; content: string }> | string[];
  // Legacy format
  timestamp?: string;
  language: 'en' | 'zh';
  userAgent: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.CHAT_LOGS) {
      return new Response(JSON.stringify({ error: 'Chat logs not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // List all chat log keys (sessions are stored with 'session_' prefix)
    const listResult = await context.env.CHAT_LOGS.list({ prefix: 'session_' });

    // Fetch all log entries
    const logs: ChatLogEntry[] = [];
    for (const key of listResult.keys) {
      const value = await context.env.CHAT_LOGS.get(key.name);
      if (value) {
        try {
          logs.push(JSON.parse(value) as ChatLogEntry);
        } catch {
          // Skip invalid entries
        }
      }
    }

    // Sort by timestamp, newest first (handle both old 'timestamp' and new 'firstSeen' formats)
    logs.sort((a, b) => {
      const timeA = a.firstSeen ?? a.timestamp ?? '1970-01-01';
      const timeB = b.firstSeen ?? b.timestamp ?? '1970-01-01';
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return new Response(JSON.stringify({ logs }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat logs API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch chat logs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
