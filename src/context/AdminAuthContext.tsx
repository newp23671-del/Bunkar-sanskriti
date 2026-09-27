import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api.ts';

interface AdminAuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  checking: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue>({
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  checking: true,
});

const TOKEN_KEY = 'bunkar_admin_token';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setChecking(false);
        return;
      }
      try {
        const valid = await api.checkAdminAuth(token);
        setIsAuthenticated(valid);
        if (!valid) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ token, isAuthenticated, login, logout, checking }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
