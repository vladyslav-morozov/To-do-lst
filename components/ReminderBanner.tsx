'use client';
import type { Task } from '@/lib/types';

export function ReminderBanner({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;
  const first = tasks[0];
  const extra = tasks.length - 1;
  return (
    <div className="mx-4 mt-3 mb-1 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
      <div className="text-amber-700 dark:text-amber-300 text-sm font-medium">⏰ Нагадування</div>
      <div className="text-amber-900 dark:text-amber-100 text-sm mt-0.5">
        {first.title}{extra > 0 ? ` (+${extra})` : ''}
      </div>
    </div>
  );
}
