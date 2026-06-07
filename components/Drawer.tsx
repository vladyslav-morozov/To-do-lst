'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  Star,
  CalendarDays,
  Layers,
  Archive,
  BookCheck,
  Settings,
  X,
} from 'lucide-react';
import { VIEWS, VIEW_TITLES, VIEW_HREFS, type ViewId } from '@/lib/views';

type Counts = Record<ViewId, number>;

const ICON: Record<ViewId, React.ComponentType<{ size?: number; className?: string }>> = {
  inbox: Inbox,
  today: Star,
  upcoming: CalendarDays,
  anytime: Layers,
  someday: Archive,
  logbook: BookCheck,
};

const ICON_TINT: Record<ViewId, string> = {
  inbox: 'text-blue-500',
  today: 'text-amber-400',
  upcoming: 'text-red-500',
  anytime: 'text-green-500',
  someday: 'text-amber-700/70',
  logbook: 'text-green-600',
};

export function Drawer({
  open,
  onClose,
  counts,
  overdueCount,
}: {
  open: boolean;
  onClose: () => void;
  counts: Counts;
  overdueCount: number;
}) {
  const pathname = usePathname();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Меню"
        aria-modal="true"
        className={`fixed top-0 left-0 z-50 h-dvh w-1/2 min-w-[260px] max-w-[360px] bg-page text-fg shadow-2xl flex flex-col transition-transform duration-[220ms] ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 border-b border-border-tone">
          <button
            onClick={onClose}
            aria-label="Закрити меню"
            className="w-10 h-10 -ml-2 flex items-center justify-center text-muted hover:text-fg"
          >
            <X size={22} />
          </button>
          <span className="text-sm font-medium text-faint">AI Planer</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {VIEWS.map((v) => {
            const Icon = ICON[v];
            const href = VIEW_HREFS[v];
            const active = pathname === href;
            const showOverdue = v === 'today' && overdueCount > 0;
            return (
              <Link
                key={v}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-base font-medium transition ${
                  active ? 'bg-card text-fg' : 'text-fg/90 hover:bg-card/70'
                }`}
              >
                <Icon size={22} className={ICON_TINT[v]} />
                <span className="flex-1">{VIEW_TITLES[v]}</span>
                {showOverdue && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-semibold rounded-full bg-red-500 text-white">
                    {overdueCount}
                  </span>
                )}
                <span className="text-sm text-muted tabular-nums">{counts[v]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-tone p-2 pb-[max(env(safe-area-inset-bottom),8px)]">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-base font-medium text-fg/90 hover:bg-card/70"
          >
            <Settings size={22} className="text-muted" />
            <span>Налаштування</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
