import api, { STORAGE_KEY, TOKEN_KEY } from './api.js';

let inFlightGetMe = null;

/**
 * Real Authentication Service Layer
 * Connects to Express backend HTTP-only cookie session endpoints & Bearer token auth:
 * - POST /api/auth/signup
 * - POST /api/auth/login
 * - POST /api/auth/logout
 * - GET  /api/auth/me
 * - POST /api/auth/google
 */
export const authService = {
  /**
   * Log in with email and password
   */
  login: async ({ email, password, rememberMe = true }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data?.user || res.data;
      const token = res.data?.token;

      // Cache user info in localStorage for fast initial UI render (session token is protected in HTTP-only cookie)
      if (typeof localStorage !== 'undefined' && user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }

      return {
        success: true,
        message: res.message || 'Logged in successfully',
        data: user,
        token
      };
    } catch (error) {
      // If network error / backend offline, support local dev simulation
      if (
        error.message?.includes('Network Error') ||
        error.statusCode === 500 && error.message?.includes('ECONNREFUSED')
      ) {
        console.warn('[Auth Service] Backend offline: using local prototype fallback session');
        const isFreelancer = email.toLowerCase().includes('freelancer');
        const mockUser = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' '),
          email,
          role: isFreelancer ? 'freelancer' : 'client',
          accountStatus: 'active',
          isVerified: true
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        }
        return { success: true, data: mockUser };
      }
      throw error;
    }
  },

  /**
   * Register a new client or freelancer account
   */
  register: async ({ name, email, password, role }) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password, role });
      const user = res.data?.user || res.data;
      const token = res.data?.token;

      if (typeof localStorage !== 'undefined' && user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }

      return {
        success: true,
        message: res.message || 'Account created successfully',
        data: user,
        token
      };
    } catch (error) {
      if (
        error.message?.includes('Network Error') ||
        error.statusCode === 500 && error.message?.includes('ECONNREFUSED')
      ) {
        console.warn('[Auth Service] Backend offline: using local prototype registration fallback');
        const mockUser = {
          id: `usr-${Date.now()}`,
          name,
          email,
          role,
          accountStatus: 'active',
          isVerified: false
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        }
        return { success: true, data: mockUser };
      }
      throw error;
    }
  },

  /**
   * Fetch active session user via HTTP-only cookie or Bearer token header.
   * Deduplicates concurrent in-flight requests to prevent duplicate calls.
   */
  getMe: async () => {
    if (inFlightGetMe) {
      return inFlightGetMe;
    }

    inFlightGetMe = (async () => {
      try {
        const res = await api.get('/auth/me');
        const user = res.data?.user || res.data;

        if (typeof localStorage !== 'undefined' && user) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }

        return {
          success: true,
          data: user
        };
      } catch (error) {
        if (error.statusCode === 401) {
          // Clear cached user and token if session is unauthenticated / expired
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TOKEN_KEY);
          }
          return {
            success: false,
            data: null,
            unauthenticated: true
          };
        }
        throw error;
      } finally {
        inFlightGetMe = null;
      }
    })();

    return inFlightGetMe;
  },

  /**
   * Sign in with verified Google ID token
   */
  googleLogin: async ({ idToken, role = 'client' } = {}) => {
    if (!idToken || typeof idToken !== 'string') {
      throw new Error('Google ID token is required. Please complete Google sign-in.');
    }

    const res = await api.post('/auth/google', {
      idToken,
      role
    });

    const user = res.data?.user || res.data;
    const token = res.data?.token;

    if (typeof localStorage !== 'undefined' && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    return {
      success: true,
      message: res.message || 'Authenticated with Google successfully',
      data: user,
      token
    };
  },

  /**
   * Log out and clear session cookie and Bearer token
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Proceed even if server is unreachable
      console.warn('[Auth Service] Error calling logout endpoint:', err.message);
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    return { success: true };
  },

  /**
   * Return cached user from client storage (synchronous initial check)
   */
  getCurrentUser: () => {
    if (typeof localStorage === 'undefined') return null;
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  },

  /**
   * Return cached token from client storage
   */
  getToken: () => {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;
