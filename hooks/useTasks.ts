'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { loadTasks, saveTasks, subscribe } from '@/lib/storage';
import type { Task } from '@/lib/types';

const EMPTY: Task[] = [];

export function useTasks() {
  const tasks = useSyncExternalStore(
    subscribe,
    () => loadTasks(),
    () => EMPTY,
  );

  const addMany = useCallback((newTasks: Task[]) => {
    saveTasks([...loadTasks(), ...newTasks]);
  }, []);

  const update = useCallback((id: string, patch: Partial<Task>) => {
    saveTasks(loadTasks().map(t => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const remove = useCallback((id: string) => {
    saveTasks(loadTasks().filter(t => t.id !== id));
  }, []);

  const toggleDone = useCallback((id: string) => {
    saveTasks(loadTasks().map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  return { tasks, addMany, update, remove, toggleDone };
}
