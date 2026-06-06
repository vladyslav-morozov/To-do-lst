'use client';
import { useState, useMemo } from 'react';
import { Header, type Tab } from '@/components/Header';
import { ProjectChips } from '@/components/ProjectChips';
import { Fab } from '@/components/Fab';
import { useTasks } from '@/hooks/useTasks';

export default function Page() {
  const [tab, setTab] = useState<Tab>('today');
  const [project, setProject] = useState<string | null>(null);
  const { tasks } = useTasks();

  const projects = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach(t => { if (t.project) s.add(t.project); });
    return Array.from(s).sort();
  }, [tasks]);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header tab={tab} onTab={setTab} />
      <ProjectChips projects={projects} active={project} onSelect={setProject} />
      <main className="px-4 py-3 pb-32">
        <p className="text-neutral-500 text-sm">
          {tasks.length === 0 ? 'Тапни мікрофон і вивали все, що в голові.' : `Tab: ${tab}, фільтр: ${project ?? 'усі'}`}
        </p>
      </main>
      <Fab onClick={() => alert('mic screen coming next task')} />
    </div>
  );
}
