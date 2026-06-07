import type { Task } from './types';
import { todayIso } from './date';

/**
 * View IDs match the URL slugs (root path "/" is Today).
 * Order in the array is the order in the drawer.
 */
export const VIEWS = [
  'inbox',
  'today',
  'upcoming',
  'anytime',
  'someday',
  'logbook',
] as const;

export type ViewId = (typeof VIEWS)[number];

export const VIEW_TITLES: Record<ViewId, string> = {
  inbox: 'Inbox',
  today: 'Today',
  upcoming: 'Upcoming',
  anytime: 'Anytime',
  someday: 'Someday',
  logbook: 'Logbook',
};

export const VIEW_HREFS: Record<ViewId, string> = {
  inbox: '/inbox',
  today: '/',
  upcoming: '/upcoming',
  anytime: '/anytime',
  someday: '/someday',
  logbook: '/logbook',
};

/**
 * Filter logic, derived from the existing Task fields (deadline, done).
 * Heuristics for views we don't have explicit fields for:
 *  - Anytime: open tasks with no deadline (deadline is empty/invalid)
 *  - Someday: open tasks deadline > today + 30 days
 *  - Upcoming: open, deadline > today AND <= today + 30 days
 */
export function filterTasks(tasks: Task[], view: ViewId): Task[] {
  const today = todayIso();
  switch (view) {
    case 'inbox':
      return tasks.filter(t => !t.done);
    case 'today':
      return tasks.filter(t => !t.done && t.deadline && t.deadline <= today);
    case 'upcoming': {
      const horizon = isoPlusDays(today, 30);
      return tasks.filter(t => !t.done && t.deadline > today && t.deadline <= horizon);
    }
    case 'anytime':
      return tasks.filter(t => !t.done && !isValidDate(t.deadline));
    case 'someday': {
      const horizon = isoPlusDays(today, 30);
      return tasks.filter(t => !t.done && isValidDate(t.deadline) && t.deadline > horizon);
    }
    case 'logbook':
      return tasks.filter(t => t.done);
  }
}

export function countByView(tasks: Task[]): Record<ViewId, number> {
  const counts = Object.fromEntries(VIEWS.map(v => [v, 0])) as Record<ViewId, number>;
  for (const v of VIEWS) counts[v] = filterTasks(tasks, v).length;
  return counts;
}

export function countOverdue(tasks: Task[]): number {
  const today = todayIso();
  return tasks.filter(t => !t.done && isValidDate(t.deadline) && t.deadline < today).length;
}

function isValidDate(s: string | undefined): boolean {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isoPlusDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
