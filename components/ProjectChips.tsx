'use client';

export function ProjectChips({
  projects,
  active,
  onSelect,
}: {
  projects: string[];
  active: string | null;
  onSelect: (p: string | null) => void;
}) {
  if (projects.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 border-b border-border-tone no-scrollbar">
      <Chip label="Усі" active={active === null} onClick={() => onSelect(null)} />
      {projects.map(p => (
        <Chip key={p} label={p} active={active === p} onClick={() => onSelect(p)} />
      ))}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
        active ? 'bg-fg text-page' : 'bg-input-bg text-muted'
      }`}
    >
      {label}
    </button>
  );
}
