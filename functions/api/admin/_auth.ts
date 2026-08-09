// Shared authentication helper for admin APIs
// Validates the admin API key from request headers

interface AdminEnv {
  ADMIN_API_KEY?: string;
}

export function validateAdminAuth(
  request: Request,
  env: AdminEnv
): { valid: boolean; error?: Response } {
  // Check if ADMIN_API_KEY is configured
  const configuredKey = env.ADMIN_API_KEY;
  if (!configuredKey) {
    console.warn('Admin API: ADMIN_API_KEY environment variable not set');
    return {
      valid: false,
      error: new Response(
        JSON.stringify({ error: 'Admin API not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Get key from Authorization header (Bearer token) or X-Admin-Key header
  const authHeader = request.headers.get('Authorization');
  const adminKeyHeader = request.headers.get('X-Admin-Key');

  let providedKey: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    providedKey = authHeader.slice(7);
  } else if (adminKeyHeader) {
    providedKey = adminKeyHeader;
  }

  if (!providedKey) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Constant-time comparison to prevent timing attacks
  if (providedKey.length !== configuredKey.length) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  let isValid = true;
  for (let i = 0; i < providedKey.length; i++) {
    if (providedKey[i] !== configuredKey[i]) {
      isValid = false;
    }
  }

  if (!isValid) {
    return {
      valid: false,
      error: new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { valid: true };
}
