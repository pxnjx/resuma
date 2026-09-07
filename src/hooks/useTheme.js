import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'resuma-theme';
const DEFAULT_THEME = 'light';

// App-wide theme state (light by default.. Persists to localStorage and
// mirrors itself onto <html data-theme="..."> so every CSS variable switches.
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'dark' ? 'dark' : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* private mode / storage blocked — ignore */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}