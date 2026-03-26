import React, { createContext, useContext, useMemo } from 'react';
import { darkTheme, lightTheme, type Theme } from './colors';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'light',
  isDark: false,
});

interface ThemeProviderProps {
  mode: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({ mode, children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(() => ({
    theme: mode === 'dark' ? darkTheme : lightTheme,
    mode,
    isDark: mode === 'dark',
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
