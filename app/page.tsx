'use client';
import { useState, useMemo } from 'react';
import { Header, type Tab } from '@/components/Header';
import { ProjectChips } from '@/components/ProjectChips';
import { Fab } from '@/components/Fab';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { isToday } from '@/lib/date';

export default function Page() {
  const [tab, setTab] = useState<Tab>('today');
  const [project, setProject] = useState<string | null>(null);
  const { tasks, update, remove, toggleDone } = useTasks();

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

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header tab={tab} onTab={setTab} />
      <ProjectChips projects={projects} active={project} onSelect={setProject} />
      <main className="px-4 py-3 pb-32">
        <TaskList
          tasks={filtered}
          onUpdate={update}
          onToggle={toggleDone}
          onDelete={remove}
        />
      </main>
      <Fab onClick={() => alert('mic screen coming next task')} />
    </div>
  );
}
