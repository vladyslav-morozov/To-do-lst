'use client';
import { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export function MicScreen({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (text: string) => Promise<void>;
  loading: boolean;
}) {
  const { state, transcript, setTranscript, error: srError, start, stop } = useSpeechRecognition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (state === 'recording') stop();
    const text = transcript.trim();
    if (!text) { setSubmitError('Скажи або напиши щось'); return; }
    setSubmitError(null);
    try {
      await onSubmit(text);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Не вдалось розпарсити');
    }
  };

  const error = srError ?? submitError;
  const canSubmit = !loading && transcript.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      {/* Top bar — only cancel */}
      <div className="flex justify-start items-center px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3">
        <button
          onClick={onCancel}
          aria-label="Скасувати"
          className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Mic centre */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {state === 'unavailable' ? (
          <p className="text-neutral-400 text-center text-sm mb-4">
            Голосовий ввід недоступний у цьому браузері. Введи текстом нижче.
          </p>
        ) : (
          <button
            onClick={state === 'recording' ? stop : start}
            className={`w-32 h-32 rounded-full flex items-center justify-center ${
              state === 'recording'
                ? 'bg-red-500 animate-pulse'
                : 'bg-orange-500'
            }`}
            aria-label={state === 'recording' ? 'Зупинити' : 'Записати'}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10v2a7 7 0 0 0 14 0v-2"/>
              <path d="M12 19v3"/>
            </svg>
          </button>
        )}
        <p className="text-neutral-500 text-sm mt-4 text-center">
          {state === 'recording'
            ? 'Слухаю…'
            : state === 'unavailable'
              ? ''
              : 'Тапни мікрофон і почни говорити'}
        </p>
      </div>

      {/* Bottom: textarea + send button side-by-side */}
      <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Або введи тут…"
            className="flex-1 h-24 bg-neutral-900 border border-neutral-800 rounded-2xl p-3 text-white text-base resize-none focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Відправити"
            className="shrink-0 w-12 h-12 rounded-full bg-orange-500 disabled:bg-neutral-700 disabled:opacity-50 flex items-center justify-center transition active:scale-95"
          >
            {loading ? (
              <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              // Paper-plane / send icon (Telegram-style)
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
