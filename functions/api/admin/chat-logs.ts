// Cloudflare Pages Function: GET /api/admin/chat-logs
// Retrieve chat conversation logs

interface Env {
  CHAT_LOGS: KVNamespace;
}

interface ChatLogEntry {
  id: string;
  timestamp: string;
  language: 'en' | 'zh';
  messages: string[];
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

    // List all chat log keys
    const listResult = await context.env.CHAT_LOGS.list({ prefix: 'chat_' });

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

    // Sort by timestamp, newest first
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
