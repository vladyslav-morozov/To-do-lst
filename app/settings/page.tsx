'use client';
import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import type { Theme } from '@/lib/theme';

const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: 'light', label: 'Світла', emoji: '☀️' },
  { id: 'dark', label: 'Темна', emoji: '🌙' },
  { id: 'system', label: 'Системна', emoji: '🖥️' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, update } = useSettings();

  const timeValue = `${pad(settings.reminderHour)}:${pad(settings.reminderMinute)}`;

  return (
    <div className="min-h-dvh bg-page text-fg">
      <header className="sticky top-0 z-10 bg-page/95 backdrop-blur px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 border-b border-border-tone">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Назад"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-fg"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-fg">Налаштування</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-8 max-w-md mx-auto">
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Тема</h2>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`py-4 rounded-xl border text-center transition active:scale-95 ${
                  theme === t.id
                    ? 'bg-card border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-card border-border-tone hover:border-faint'
                }`}
              >
                <div className="text-2xl mb-1">{t.emoji}</div>
                <div className="text-sm text-fg">{t.label}</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Нагадування</h2>
          <div className="bg-card rounded-xl border border-border-tone p-4">
            <label className="block">
              <span className="text-sm text-fg">Час нагадування</span>
              <p className="text-xs text-muted mt-1 mb-3">
                У який час дня дедлайну спрацює нагадування (якщо для задачі не задане своє).
              </p>
              <input
                type="time"
                value={timeValue}
                onChange={e => {
                  const [h, m] = e.target.value.split(':').map(Number);
                  if (Number.isFinite(h) && Number.isFinite(m)) {
                    update({ reminderHour: h, reminderMinute: m });
                  }
                }}
                className="w-full bg-input-bg rounded-lg px-3 py-2 text-base text-fg border border-transparent focus:outline-none focus:border-orange-500"
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Про</h2>
          <div className="bg-card rounded-xl border border-border-tone p-4 text-sm text-muted">
            AI Planer · MVP · hackathon edition.
            <br />
            Дані зберігаються локально у браузері (localStorage).
          </div>
        </section>
      </main>
    </div>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
