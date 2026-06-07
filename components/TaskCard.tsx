'use client';
import { useState } from 'react';
import type { Task, Priority } from '@/lib/types';
import { formatDate } from '@/lib/date';

const PRIORITY_COLOR: Record<Priority, string> = {
  high: 'bg-red-500/20 text-red-700 dark:text-red-300',
  medium: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  low: 'bg-neutral-500/20 text-muted',
};

export function TaskCard({
  task,
  onUpdate,
  onToggle,
  onDelete,
}: {
  task: Task;
  onUpdate: (patch: Partial<Task>) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card rounded-xl p-3 mb-2 border border-border-tone">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          aria-label="toggle done"
          className={`mt-0.5 w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center ${
            task.done ? 'bg-green-500 border-green-500' : 'border-faint'
          }`}
        >
          {task.done && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </button>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 text-left"
        >
          <div className={`text-base ${task.done ? 'line-through text-faint' : 'text-fg'}`}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted flex-wrap">
            <span className={`px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
              {task.priority}
            </span>
            <span>⏱ {task.estimateMin} хв</span>
            <span>📅 {formatDate(task.deadline)}</span>
            {task.project && <span className="text-fg">#{task.project}</span>}
          </div>
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-border-tone space-y-3">
          <Field label="Назва">
            <input
              value={task.title}
              onChange={e => onUpdate({ title: e.target.value })}
              className="w-full bg-input-bg rounded-lg px-3 py-2 text-sm text-fg"
            />
          </Field>
          <Field label="Пріоритет">
            <div className="grid grid-cols-3 gap-1 p-1 bg-input-bg rounded-lg">
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => onUpdate({ priority: p })}
                  className={`py-2 rounded-md text-xs ${task.priority === p ? 'bg-pill text-fg' : 'text-muted'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Час, хв">
            <input
              type="number"
              min={5}
              max={240}
              value={task.estimateMin}
              onChange={e => onUpdate({ estimateMin: Number(e.target.value) || 5 })}
              className="w-full bg-input-bg rounded-lg px-3 py-2 text-sm text-fg"
            />
          </Field>
          <Field label="Дедлайн">
            <input
              type="date"
              value={task.deadline}
              onChange={e => onUpdate({ deadline: e.target.value })}
              className="w-full bg-input-bg rounded-lg px-3 py-2 text-sm text-fg"
            />
          </Field>
          <Field label="Проект">
            <input
              value={task.project ?? ''}
              onChange={e => onUpdate({ project: e.target.value || undefined })}
              placeholder="—"
              className="w-full bg-input-bg rounded-lg px-3 py-2 text-sm text-fg"
            />
          </Field>
          <Field label="Нагадування">
            <input
              type="datetime-local"
              value={task.reminderAt ? toLocalInput(task.reminderAt) : ''}
              onChange={e => onUpdate({ reminderAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="w-full bg-input-bg rounded-lg px-3 py-2 text-sm text-fg"
            />
          </Field>
          <button
            onClick={onDelete}
            className="w-full py-2 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 text-sm"
          >
            Видалити
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
