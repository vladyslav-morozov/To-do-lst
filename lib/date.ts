import type { Task } from './types';

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDate(iso: string): string {
  // "2026-06-06" -> "06.06.2026"
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function isOverdue(task: Task): boolean {
  return !task.done && task.deadline < todayIso();
}

export function isToday(task: Task): boolean {
  if (task.done) return false;
  if (task.pinnedToToday) return true;
  return task.deadline <= todayIso(); // includes overdue
}

export function defaultReminderAt(deadlineIso: string): string {
  // Default reminder: deadline 09:00 local, minus 1 hour = 08:00 local same day
  const [y, m, d] = deadlineIso.split('-').map(Number);
  const local = new Date(y, (m ?? 1) - 1, d ?? 1, 8, 0, 0, 0);
  return local.toISOString();
}
