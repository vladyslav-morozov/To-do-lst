'use client';
import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import { defaultReminderAt } from '@/lib/date';
import { useSettings } from './useSettings';

export function useActiveReminders(tasks: Task[]): Task[] {
  const { settings } = useSettings();
  return useMemo(() => {
    const now = new Date();
    return tasks.filter(t => {
      if (t.done) return false;
      const rem = t.reminderAt ?? defaultReminderAt(t.deadline, settings.reminderHour, settings.reminderMinute);
      const remDate = new Date(rem);
      const [y, m, d] = t.deadline.split('-').map(Number);
      const endOfDeadline = new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59);
      return remDate <= now && now <= endOfDeadline;
    });
  }, [tasks, settings.reminderHour, settings.reminderMinute]);
}
