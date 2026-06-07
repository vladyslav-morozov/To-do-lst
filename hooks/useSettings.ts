'use client';
import { useCallback, useSyncExternalStore } from 'react';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  subscribeSettings,
  type Settings,
} from '@/lib/settings';

export function useSettings() {
  const settings = useSyncExternalStore(
    subscribeSettings,
    () => loadSettings(),
    () => DEFAULT_SETTINGS,
  );

  const update = useCallback((patch: Partial<Settings>) => {
    saveSettings({ ...loadSettings(), ...patch });
  }, []);

  return { settings, update };
}
