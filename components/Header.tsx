'use client';
import Link from 'next/link';

type Tab = 'today' | 'all';

export function Header({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <header
      className="sticky top-0 z-10 bg-page/95 backdrop-blur px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 border-b border-border-tone"
    >
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-fg">AI Planer</h1>
        <Link
          href="/settings"
          aria-label="Налаштування"
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-fg"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-1 p-1 bg-card rounded-xl">
        <button
          onClick={() => onTab('today')}
          className={`py-2 rounded-lg text-sm font-medium transition ${tab === 'today' ? 'bg-pill text-fg' : 'text-muted'}`}
        >
          Сьогодні
        </button>
        <button
          onClick={() => onTab('all')}
          className={`py-2 rounded-lg text-sm font-medium transition ${tab === 'all' ? 'bg-pill text-fg' : 'text-muted'}`}
        >
          Усі
        </button>
      </div>
    </header>
  );
}

export type { Tab };
