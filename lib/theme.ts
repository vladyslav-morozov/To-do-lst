export type Theme = 'light' | 'dark' | 'system';

const KEY = 'ai-planer:theme';

export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

export function saveTheme(t: Theme): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, t);
  applyTheme(t);
}

export function applyTheme(t: Theme): void {
  if (typeof document === 'undefined') return;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = t === 'dark' || (t === 'system' && systemDark);
  document.documentElement.classList.toggle('dark', dark);
}

// Inline script string — run before hydration to avoid theme flash.
// Read by app/layout.tsx and injected as a raw <script>.
export const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem('${KEY}') || 'system';
  var d = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  if (d) document.documentElement.classList.add('dark');
} catch (e) {}
`.trim();
