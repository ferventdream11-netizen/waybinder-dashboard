'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  // Read saved theme once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wb-theme');
      const initial: Theme = stored === 'light' ? 'light' : 'dark';
      setTheme(initial);
    } catch {
      setTheme('dark');
    }
  }, []);

  // Apply theme to <html> whenever it changes
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme'); // default is dark
    }
  }, [theme]);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('wb-theme', next);
    } catch {}
  };

  return (
    <button className="button" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
