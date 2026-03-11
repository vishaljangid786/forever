import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useColorScheme } from 'nativewind';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (value: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'app-theme';

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const theme = colorScheme as Theme;

  useEffect(() => {
    (async () => {
      try {
        let stored;
        if (Platform.OS === 'web') {
          stored = localStorage.getItem(THEME_KEY);
        } else {
          stored = await SecureStore.getItemAsync(THEME_KEY);
        }
        if (stored === 'light' || stored === 'dark') {
          setColorScheme(stored);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const setTheme = async (value: Theme) => {
    setColorScheme(value);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(THEME_KEY, value);
      } else {
        await SecureStore.setItemAsync(THEME_KEY, value);
      }
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return ctx;
};
