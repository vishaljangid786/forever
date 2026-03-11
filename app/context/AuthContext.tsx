import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type AuthContextType = {
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let storedToken;
        if (Platform.OS === 'web') {
          storedToken = localStorage.getItem('token');
        } else {
          storedToken = await SecureStore.getItemAsync('token');
        }
        if (storedToken) {
          setToken(storedToken);
        } else {
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (newToken: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', newToken);
    } else {
      await SecureStore.setItemAsync('token', newToken);
    }
    setToken(newToken);
  };

  const logout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
    } else {
      await SecureStore.deleteItemAsync('token');
    }
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
