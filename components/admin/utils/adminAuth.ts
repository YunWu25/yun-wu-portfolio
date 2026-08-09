// Admin authentication utility for frontend
// Manages API key storage and authenticated fetch

const ADMIN_KEY_STORAGE = 'admin_api_key';

export function getStoredApiKey(): string | null {
  return localStorage.getItem(ADMIN_KEY_STORAGE);
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(ADMIN_KEY_STORAGE);
}

export function promptForApiKey(): string | null {
  const key = window.prompt('Enter Admin API Key:');
  if (key) {
    setStoredApiKey(key);
  }
  return key;
}

export function getApiKey(): string | null {
  return getStoredApiKey() ?? promptForApiKey();
}

// Authenticated fetch wrapper for admin APIs
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Authentication required');
  }

  const headers = new Headers(options.headers);
  headers.set('X-Admin-Key', apiKey);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If authentication failed, clear the stored key so user can try again
  if (response.status === 401 || response.status === 403) {
    clearStoredApiKey();
    throw new Error('Invalid API key. Please refresh and try again.');
  }

  return response;
}
