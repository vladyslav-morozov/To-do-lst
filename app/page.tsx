'use client';
import { useState, useMemo, useEffect } from 'react';
import { Header, type Tab } from '@/components/Header';
import { ProjectChips } from '@/components/ProjectChips';
import { Fab } from '@/components/Fab';
import { TaskList } from '@/components/TaskList';
import { MicScreen } from '@/components/MicScreen';
import { ReminderBanner } from '@/components/ReminderBanner';
import { useTasks } from '@/hooks/useTasks';
import { useActiveReminders } from '@/hooks/useReminders';
import { isToday, todayIso, defaultReminderAt } from '@/lib/date';
import type { Task } from '@/lib/types';
import type { ParsedTask } from '@/lib/schema';

export default function Page() {
  const [tab, setTab] = useState<Tab>('today');
  const [project, setProject] = useState<string | null>(null);
  const [micOpen, setMicOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tasks, addMany, update, remove, toggleDone } = useTasks();
  const reminders = useActiveReminders(tasks);

  const projects = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach(t => { if (t.project) s.add(t.project); });
    return Array.from(s).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks
      .filter(t => (project ? t.project === project : true))
      .filter(t => (tab === 'today' ? isToday(t) : true))
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const pr = { high: 0, medium: 1, low: 2 };
        if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
        return a.deadline.localeCompare(b.deadline);
      });
  }, [tasks, tab, project]);

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
      const knownProjects = projects;
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, today, knownProjects }),
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
        reminderAt: t.reminderAt ?? defaultReminderAt(t.deadline),
        project: t.project ?? undefined,
        done: false,
        createdAt: new Date().toISOString(),
      }));
      addMany(newTasks);
      setMicOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header tab={tab} onTab={setTab} />
      <ProjectChips projects={projects} active={project} onSelect={setProject} />
      <ReminderBanner tasks={reminders} />
      <main className="px-4 py-3 pb-32">
        <TaskList
          tasks={filtered}
          onUpdate={update}
          onToggle={toggleDone}
          onDelete={remove}
        />
      </main>
      <Fab onClick={() => setMicOpen(true)} />
      {micOpen && (
        <MicScreen
          onCancel={() => setMicOpen(false)}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </div>
  );
}
