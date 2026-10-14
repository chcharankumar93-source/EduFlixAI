import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Theme } from '@/types';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('eduflix_theme', 'system');

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mq.matches);
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = isDark ? 'dark' : 'light';
    };

    apply();
    if (theme === 'system') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  return { theme, setTheme };
}
