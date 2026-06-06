import type { Task } from './types';

const KEY = 'ai-planer:tasks';
const EMPTY: Task[] = [];

let cachedRaw: string | null = null;
let cachedTasks: Task[] = EMPTY;

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return EMPTY;
  const raw = window.localStorage.getItem(KEY) ?? '';
  if (raw === cachedRaw) return cachedTasks;
  cachedRaw = raw;
  if (!raw) {
    cachedTasks = EMPTY;
    return cachedTasks;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedTasks = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedTasks = EMPTY;
  }
  return cachedTasks;
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(tasks);
    window.localStorage.setItem(KEY, raw);
    cachedRaw = raw;
    cachedTasks = tasks;
    window.dispatchEvent(new CustomEvent('ai-planer:tasks-changed'));
  } catch {
    // QuotaExceeded / private Safari — silent fail
  }
}

export function subscribe(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    cachedRaw = null; // force re-read on next snapshot
    cb();
  };
  window.addEventListener('ai-planer:tasks-changed', handler);
  window.addEventListener('storage', handler); // інша вкладка
  return () => {
    window.removeEventListener('ai-planer:tasks-changed', handler);
    window.removeEventListener('storage', handler);
  };
}
