/**
 * Dynamic API Base URL resolver:
 * 1. Explicit NEXT_PUBLIC_API_URL environment variable if provided.
 * 2. In browser environments without NEXT_PUBLIC_API_URL, fallback to empty string
 *    so requests transparently proxy through Next.js rewrites (backed by BACKEND_URL).
 * 3. In local Node / SSR development, fallback to http://localhost:3001.
 */
export const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();
