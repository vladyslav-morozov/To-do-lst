import type { Task } from './types';

export type Stats = {
  /** Consecutive days ending today with at least one task completed. */
  streak: number;
  /** Total completed tasks since Monday 00:00 local of current week. */
  completedThisWeek: number;
  /** Total completed tasks today (local). */
  completedToday: number;
};

export function computeStats(tasks: Task[], now: Date = new Date()): Stats {
  const completedDays = new Set<string>();
  let completedThisWeek = 0;
  let completedToday = 0;

  const weekStart = startOfWeek(now);
  const todayStr = localDateString(now);

  for (const t of tasks) {
    if (!t.done || !t.completedAt) continue;
    const completedAt = new Date(t.completedAt);
    if (Number.isNaN(completedAt.getTime())) continue;

    completedDays.add(localDateString(completedAt));
    if (completedAt >= weekStart) completedThisWeek++;
    if (localDateString(completedAt) === todayStr) completedToday++;
  }

  // Streak: walk backward from today as long as that day has ≥1 completion.
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  while (completedDays.has(localDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { streak, completedThisWeek, completedToday };
}

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Monday 00:00 of the week containing `now` (local). */
function startOfWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday … 6 = Saturday
  // Convert so Monday becomes day index 0; Sunday becomes 6
  const offset = (day + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}
