import type { Task } from './types';

const KEY = 'ai-planer:tasks';

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent('ai-planer:tasks-changed'));
  } catch {
    // QuotaExceeded / private Safari — silent fail
  }
}

export function subscribe(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  window.addEventListener('ai-planer:tasks-changed', handler);
  window.addEventListener('storage', handler); // інша вкладка
  return () => {
    window.removeEventListener('ai-planer:tasks-changed', handler);
    window.removeEventListener('storage', handler);
  };
}
