import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ellix_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light', 'theme-light');
      body?.classList.add('dark');
      body?.classList.remove('light', 'theme-light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light', 'theme-light');
      body?.classList.remove('dark');
      body?.classList.add('light', 'theme-light');
    }
    try {
      localStorage.setItem('ellix_theme', theme);
      window.dispatchEvent(new CustomEvent('ellix-theme-sync', { detail: theme }));
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const handleThemeSync = (e: Event) => {
      const nextTheme = (e as CustomEvent<Theme>).detail;
      if (nextTheme === 'light' || nextTheme === 'dark') {
        setThemeState(prev => (prev !== nextTheme ? nextTheme : prev));
      }
    };
    window.addEventListener('ellix-theme-sync', handleThemeSync);
    return () => window.removeEventListener('ellix-theme-sync', handleThemeSync);
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
