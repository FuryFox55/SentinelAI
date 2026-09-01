'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  tokens: typeof lightTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storeTheme = useAppStore((state) => state.preferences?.theme);
  const setPreference = useAppStore((state) => state.setPreference);
  const [localTheme, setLocalTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme_preference') as Theme) || 'light';
    }
    return 'light';
  });

  const theme: Theme = storeTheme || localTheme;

  const setTheme = (newTheme: Theme) => {
    setLocalTheme(newTheme);
    setPreference('theme', newTheme);
  };

  const tokens = theme === 'light' ? lightTheme : darkTheme;

  // Dynamically update document variables
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Inject CSS variables for colors
    Object.entries(tokens.colors).forEach(([key, val]) => {
      const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssKey, val);
    });

    // Inject CSS variables for spacing
    Object.entries(tokens.spacing).forEach(([key, val]) => {
      root.style.setProperty(`--spacing-${key}`, val);
    });

    // Inject CSS variables for radius
    Object.entries(tokens.radius).forEach(([key, val]) => {
      root.style.setProperty(`--radius-${key}`, val);
    });

    // Inject CSS variables for shadows
    Object.entries(tokens.shadows).forEach(([key, val]) => {
      root.style.setProperty(`--shadow-${key}`, val);
    });

    // Inject CSS variables for animations
    Object.entries(tokens.animations).forEach(([key, val]) => {
      const cssKey = `--animation-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssKey, val);
    });
  }, [theme, tokens]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
