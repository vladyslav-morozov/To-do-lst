'use client';
import { useMemo } from 'react';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { filterTasks, type ViewId } from '@/lib/views';
import type { Task } from '@/lib/types';

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

function sortForView(tasks: Task[], view: ViewId): Task[] {
  const copy = [...tasks];
  if (view === 'logbook') {
    // Latest-done first
    return copy.sort((a, b) => {
      const ax = a.completedAt ?? a.createdAt ?? '';
      const bx = b.completedAt ?? b.createdAt ?? '';
      return bx.localeCompare(ax);
    });
  }
  return copy.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority])
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return (a.deadline ?? '').localeCompare(b.deadline ?? '');
  });
}

const EMPTY_HINT: Record<ViewId, string> = {
  inbox: 'Inbox порожній.',
  today: 'На сьогодні нічого. Тапни мікрофон і скажи, що в тебе.',
  upcoming: 'Найближчий місяць вільний.',
  anytime: 'Тут будуть задачі без конкретної дати.',
  someday: 'Сюди потраплять задачі з далеким дедлайном.',
  logbook: 'Поки нічого не виконано.',
};

export function ViewScreen({ view }: { view: ViewId }) {
  const { tasks, update, remove, toggleDone } = useTasks();
  const filtered = useMemo(() => sortForView(filterTasks(tasks, view), view), [tasks, view]);

  if (filtered.length === 0) {
    return <p className="text-faint text-sm py-8 text-center">{EMPTY_HINT[view]}</p>;
  }

  return (
    <TaskList
      tasks={filtered}
      onUpdate={update}
      onToggle={toggleDone}
      onDelete={remove}
    />
  );
}
