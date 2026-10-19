import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('imovies_token')));

  useEffect(() => {
    if (!loading) return;

    authApi
      .me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((err) => {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('imovies_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(credentials) {
        const result = await authApi.login(credentials);
        localStorage.setItem('imovies_token', result.token);
        setUser(result.user);
        return result;
      },
      async register(details) {
        const result = await authApi.register(details);
        localStorage.setItem('imovies_token', result.token);
        setUser(result.user);
        return result;
      },
      logout() {
        localStorage.removeItem('imovies_token');
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

