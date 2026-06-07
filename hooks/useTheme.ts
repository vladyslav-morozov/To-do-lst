'use client';
import { useCallback, useEffect, useState } from 'react';
import { applyTheme, loadTheme, saveTheme, type Theme } from '@/lib/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');

  // Sync local state with localStorage on mount + listen to OS theme changes.
  // setState during mount-effect is intentional: SSR can't read localStorage,
  // so client-side hydration must reconcile the state once.
  useEffect(() => {
    const initial = loadTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    applyTheme(initial);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (loadTheme() === 'system') applyTheme('system');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    saveTheme(t);
    setThemeState(t);
  }, []);

  return { theme, setTheme };
}
