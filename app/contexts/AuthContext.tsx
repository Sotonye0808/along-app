import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTokens, clearTokens } from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; name: string } | null;
  logout: () => void;
  setAuthState: (user: { id: string; name: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const { accessToken } = getTokens();
    const userId = localStorage.getItem('userID');
    const name = localStorage.getItem('name');

    if (accessToken && userId && name) {
      setIsAuthenticated(true);
      setUser({ id: userId, name });
    }
  }, []);

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
  };

  const setAuthState = (userData: { id: string; name: string }) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};