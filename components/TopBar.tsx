'use client';
import { Menu } from 'lucide-react';

export function TopBar({
  title,
  subtitle,
  onMenu,
}: {
  title: string;
  subtitle?: string;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-page/95 backdrop-blur px-3 pt-[max(env(safe-area-inset-top),10px)] pb-3 border-b border-border-tone">
      <div className="relative h-11 flex items-center">
        <button
          onClick={onMenu}
          aria-label="Меню"
          className="absolute left-0 w-11 h-11 flex items-center justify-center text-muted hover:text-fg"
        >
          <Menu size={24} />
        </button>
        <div className="flex-1 text-center px-12">
          <h1 className="text-lg font-semibold text-fg leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted leading-tight truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
