import React, { createContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../constants/roles';
import authService from '../services/authService';
import { AUTH_EXPIRED_EVENT } from '../services/api';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  isClient: false,
  isFreelancer: false,
  login: async () => {},
  register: async () => {},
  googleLogin: async () => {},
  logout: async () => {},
  refreshSession: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on initial mount.
  // No once-only ref guard: StrictMode remounts, and a guard would leave isLoading stuck at true.
  // authService.getMe() dedupes concurrent calls, so the remount does not double-fetch.
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // Fast-render using locally cached user profile if present
        const cachedUser = authService.getCurrentUser();
        if (cachedUser && isMounted) {
          setUser(cachedUser);
        }

        // Verify real session with backend using HTTP-only cookie or Bearer header
        const res = await authService.getMe();
        if (isMounted) {
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            // Visitor is unauthenticated or session expired: clean reset
            setUser(null);
          }
        }
      } catch (err) {
        // Handle unexpected network errors without crashing
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Any API call that comes back 401 means the server session is gone: reflect that in the UI
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res.data);
    return res.data;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.data);
    return res.data;
  };

  const googleLogin = async (options) => {
    const res = await authService.googleLogin(options);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshSession = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
      setUser(null);
      return null;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    role: user?.role || null,
    isClient: user?.role === USER_ROLES.CLIENT,
    isFreelancer: user?.role === USER_ROLES.FREELANCER,
    login,
    register,
    googleLogin,
    logout,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
