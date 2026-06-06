'use client';

type Tab = 'today' | 'all';

export function Header({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <header
      className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 border-b border-neutral-800"
    >
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-white">AI Planer</h1>
      </div>
      <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-900 rounded-xl">
        <button
          onClick={() => onTab('today')}
          className={`py-2 rounded-lg text-sm font-medium transition ${tab === 'today' ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
        >
          Сьогодні
        </button>
        <button
          onClick={() => onTab('all')}
          className={`py-2 rounded-lg text-sm font-medium transition ${tab === 'all' ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
        >
          Усі
        </button>
      </div>
    </header>
  );
}

export type { Tab };
