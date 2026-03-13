import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AppThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  isReady: boolean;
  theme: AppThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: AppThemeMode) => void;
};

const THEME_STORAGE_KEY = 'preferences:theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeMode>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (isMounted && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeState(storedTheme);
          colorScheme.set(storedTheme);
        } else {
          colorScheme.set('light');
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = useCallback((nextTheme: AppThemeMode) => {
    setThemeState(nextTheme);
    colorScheme.set(nextTheme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      isReady,
      theme,
      toggleTheme,
      setTheme,
    }),
    [isReady, setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }

  return value;
}
