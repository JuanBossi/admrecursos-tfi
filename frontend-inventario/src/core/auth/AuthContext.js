import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'inv_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          setToken(parsed.token);
          api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
        }
        if (parsed?.user) setUser(parsed.user);
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  const saveSession = useCallback((session) => {
    const { user: u, token: t } = session || {};
    setUser(u || null);
    setToken(t || null);
    if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`;
    else delete api.defaults.headers.common.Authorization;
    if (u && t) localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(async (loginFn, credentials) => {
    const session = await loginFn(credentials);
    saveSession(session);
    return session;
  }, [saveSession]);

  const logout = useCallback(() => {
    saveSession(null);
  }, [saveSession]);

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}


