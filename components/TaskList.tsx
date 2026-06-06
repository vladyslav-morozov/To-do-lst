'use client';
import type { Task } from '@/lib/types';
import { TaskCard } from './TaskCard';

export function TaskList({
  tasks,
  onUpdate,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return <p className="text-neutral-500 text-sm py-8 text-center">Тут порожньо. Тапни мікрофон.</p>;
  }
  return (
    <div>
      {tasks.map(t => (
        <TaskCard
          key={t.id}
          task={t}
          onUpdate={p => onUpdate(t.id, p)}
          onToggle={() => onToggle(t.id)}
          onDelete={() => onDelete(t.id)}
        />
      ))}
    </div>
  );
}
