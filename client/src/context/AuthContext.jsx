import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authService from '../services/authService';
import { clearToken, getToken } from '../services/apiClient';
import { getErrorMessage } from '../utils/errors';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    // Restore session if Bearer token exists in localStorage
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await authService.me(); // API: GET /auth/me
      if (res?.success) {
        setUser(res.data);
        setError(null);
        return res.data;
      }
      clearToken();
      setUser(null);
      return null;
    } catch {
      clearToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener('farstack:unauthorized', onUnauthorized);
    return () => window.removeEventListener('farstack:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      // API: POST /auth/login — token saved inside authService.login
      const res = await authService.login(credentials);
      if (!res?.success) {
        throw new Error(res?.message || 'Login failed');
      }
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const message = getErrorMessage(err, 'Invalid email or password.');
      setError(message);
      throw Object.assign(err, { friendlyMessage: message });
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    try {
      // API: POST /auth/register — not in Postman (live returns 404)
      const res = await authService.register(payload);
      if (!res?.success) {
        throw new Error(res?.message || 'Registration failed');
      }
      if (res.data?.user) setUser(res.data.user);
      return res.data;
    } catch (err) {
      const message = getErrorMessage(err, 'Registration is not available on this API.');
      setError(message);
      throw Object.assign(err, { friendlyMessage: message });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout(); // API: POST /auth/logout
    } catch {
      clearToken();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading, error, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
