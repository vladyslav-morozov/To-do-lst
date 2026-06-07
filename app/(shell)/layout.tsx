'use client';
import { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Drawer } from '@/components/Drawer';
import { Composer } from '@/components/Composer';
import { ReminderBanner } from '@/components/ReminderBanner';
import { useTasks } from '@/hooks/useTasks';
import { useSettings } from '@/hooks/useSettings';
import { useActiveReminders } from '@/hooks/useReminders';
import { todayIso, defaultReminderAt } from '@/lib/date';
import {
  VIEWS,
  VIEW_HREFS,
  VIEW_TITLES,
  countByView,
  countOverdue,
  type ViewId,
} from '@/lib/views';
import type { Task } from '@/lib/types';
import type { ParsedTask } from '@/lib/schema';

const HREF_TO_VIEW: Record<string, ViewId> = Object.fromEntries(
  VIEWS.map(v => [VIEW_HREFS[v], v]),
) as Record<string, ViewId>;

const MONTHS_UK = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];
const DAYS_UK = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'пʼятниця', 'субота'];

function formatTodaySubtitle(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTHS_UK[d.getMonth()]}, ${DAYS_UK[d.getDay()]}`;
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const view: ViewId = HREF_TO_VIEW[pathname] ?? 'today';

  const { tasks, addMany } = useTasks();
  const { settings } = useSettings();
  const reminders = useActiveReminders(tasks);

  const counts = useMemo(() => countByView(tasks), [tasks]);
  const overdueCount = useMemo(() => countOverdue(tasks), [tasks]);

  const projects = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach(t => { if (t.project) s.add(t.project); });
    return Array.from(s).sort();
  }, [tasks]);

  // Native notifications for active reminders (one-shot on mount)
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    if (Notification.permission === 'granted') {
      reminders.forEach(t => {
        try { new Notification('AI Planer', { body: t.title }); } catch {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    try {
      const today = todayIso();
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, today, knownProjects: projects }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Parse failed');
      }
      const data: { tasks: ParsedTask[] } = await res.json();
      const newTasks: Task[] = data.tasks.map(t => ({
        id: crypto.randomUUID(),
        title: t.title,
        priority: t.priority,
        estimateMin: t.estimateMin,
        deadline: t.deadline,
        reminderAt: t.reminderAt ?? defaultReminderAt(t.deadline, settings.reminderHour, settings.reminderMinute),
        project: t.project ?? undefined,
        done: false,
        createdAt: new Date().toISOString(),
      }));
      addMany(newTasks);
      // After adding, route to Inbox so every freshly parsed task is visible
      // regardless of its deadline. User can navigate further from drawer.
      if (view !== 'inbox') router.push('/inbox');
    } finally {
      setLoading(false);
    }
  };

  const subtitle = view === 'today' ? formatTodaySubtitle() : undefined;

  return (
    <div className="min-h-dvh flex flex-col bg-page text-fg">
      <TopBar
        title={VIEW_TITLES[view]}
        subtitle={subtitle}
        onMenu={() => setDrawerOpen(true)}
      />
      <ReminderBanner tasks={reminders} />
      <main className="flex-1 px-4 py-3 pb-40">{children}</main>
      <Composer onSubmit={handleSubmit} loading={loading} />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        counts={counts}
        overdueCount={overdueCount}
      />
    </div>
  );
}
