import axios from 'axios';

export const STORAGE_KEY = 'workbridge_user_cache';
export const TOKEN_KEY = 'workbridge_token';
// Fired on window when the server rejects the session (401) so AuthContext can log out the UI
export const AUTH_EXPIRED_EVENT = 'workbridge:auth-expired';

/**
 * Centralized Axios API Service Client
 * Configured with withCredentials to automatically exchange HTTP-only session cookies
 * and supports Bearer token header authorization.
 */
const api = axios.create({
  baseURL:
    import.meta.env?.VITE_API_URL ||
    (typeof window !== 'undefined' ? '/api' : 'http://localhost:5000/api'),
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 15000
});

// Request interceptor: Preserves explicit headers and supports HTTP-only cookie exchange
api.interceptors.request.use(
  (config) => {
    // Rely on withCredentials: true for automatic HTTP-only session cookies.
    // If request explicitly configures an Authorization header (e.g. tests or external clients), keep it.
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction and session expiration handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const statusCode = error.response?.status || (error.code === 'ECONNABORTED' ? 408 : 500);

    // Expired or invalid session (401 Unauthorized): clear authentication credentials
    if (statusCode === 401 && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      // Login attempts with wrong credentials also return 401; they are not a session expiry
      const isLoginAttempt = /\/auth\/(login|signup|register|google)$/.test(error.config?.url || '');
      if (!isLoginAttempt && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
    }

    const customError = {
      message:
        error.response?.data?.message ||
        (error.message?.includes('Network Error')
          ? 'Unable to connect to the WorkBridge server. Please check your internet connection.'
          : error.message || 'An unexpected server error occurred'),
      statusCode,
      errors: error.response?.data?.errors || null,
      isNetworkError: !error.response
    };

    return Promise.reject(customError);
  }
);

/**
 * True when the backend could not serve the request at all (offline, proxy error,
 * database down, timeout). Only these cases may fall back to bundled sample data;
 * 4xx errors (bad input, not found, unauthorized) must reach the user.
 */
export const isServerUnavailable = (error) =>
  Boolean(error?.isNetworkError) || error?.statusCode === 408 || (error?.statusCode ?? 0) >= 500;

export default api;
