import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSummary } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('opsmind_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('opsmind_token');
      const storedUser = localStorage.getItem('opsmind_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh profile in background
          const me = await authApi.getMe();
          setUser(me);
          localStorage.setItem('opsmind_user', JSON.stringify(me));
        } catch (e) {
          console.warn('Session expired, clearing tokens');
          localStorage.removeItem('opsmind_token');
          localStorage.removeItem('opsmind_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    localStorage.setItem('opsmind_token', res.token);
    localStorage.setItem('opsmind_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string, fullName?: string) => {
    const res = await authApi.register({ username, email, password, fullName });
    localStorage.setItem('opsmind_token', res.token);
    localStorage.setItem('opsmind_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('opsmind_token');
    localStorage.removeItem('opsmind_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: string) => {
    if (!user || !user.roles) return false;
    const formatted = role.startsWith('ROLE_') ? role : `ROLE_${role.toUpperCase()}`;
    return user.roles.includes(formatted);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        hasRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
