import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light-green' | 'emerald-dark' | 'slate-dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light-green',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('opsmind_theme');
      if (saved === 'light-green' || saved === 'emerald-dark' || saved === 'slate-dark') {
        return saved as ThemeMode;
      }
    } catch (e) {
      // ignore
    }
    return 'light-green'; // Default is requested lighter green shade
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('opsmind_theme', newTheme);
    } catch (e) {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
