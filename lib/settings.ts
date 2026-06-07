const KEY = 'ai-planer:settings';

export type Settings = {
  /** Hour of day (0-23) at which the default reminder fires on deadline day. */
  reminderHour: number;
  /** Minute of hour (0-59) for the default reminder. */
  reminderMinute: number;
};

export const DEFAULT_SETTINGS: Settings = {
  reminderHour: 8,
  reminderMinute: 0,
};

let cachedRaw: string | null = null;
let cachedSettings: Settings = DEFAULT_SETTINGS;

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const raw = window.localStorage.getItem(KEY) ?? '';
  if (raw === cachedRaw) return cachedSettings;
  cachedRaw = raw;
  if (!raw) {
    cachedSettings = DEFAULT_SETTINGS;
    return cachedSettings;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedSettings = {
      reminderHour: clamp(parsed.reminderHour, 0, 23, DEFAULT_SETTINGS.reminderHour),
      reminderMinute: clamp(parsed.reminderMinute, 0, 59, DEFAULT_SETTINGS.reminderMinute),
    };
  } catch {
    cachedSettings = DEFAULT_SETTINGS;
  }
  return cachedSettings;
}

export function saveSettings(s: Settings): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(s);
    window.localStorage.setItem(KEY, raw);
    cachedRaw = raw;
    cachedSettings = s;
    window.dispatchEvent(new CustomEvent('ai-planer:settings-changed'));
  } catch {
    // noop
  }
}

export function subscribeSettings(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    cachedRaw = null;
    cb();
  };
  window.addEventListener('ai-planer:settings-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('ai-planer:settings-changed', handler);
    window.removeEventListener('storage', handler);
  };
}

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const num = typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : fallback;
  return Math.min(Math.max(num, min), max);
}
