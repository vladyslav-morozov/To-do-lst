'use client';
import { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export function Composer({
  onSubmit,
  loading,
}: {
  onSubmit: (text: string) => Promise<void>;
  loading: boolean;
}) {
  const { state, transcript, setTranscript, error: srError, start, stop } = useSpeechRecognition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const showTextarea = active || transcript.length > 0;
  const recording = state === 'recording';

  const handleMicTap = () => {
    setActive(true);
    setSubmitError(null);
    if (recording) stop();
    else start();
  };

  const handleSubmit = async () => {
    if (recording) stop();
    const text = transcript.trim();
    if (!text) { setSubmitError('Скажи або напиши щось'); return; }
    setSubmitError(null);
    try {
      await onSubmit(text);
      setTranscript('');
      setActive(false);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Не вдалось розпарсити');
    }
  };

  const handleCollapse = () => {
    if (recording) stop();
    setTranscript('');
    setActive(false);
    setSubmitError(null);
  };

  const error = srError ?? submitError;

  return (
    <div className="sticky bottom-0 bg-page/95 backdrop-blur border-t border-border-tone">
      <div className="px-4 pt-4 pb-[max(env(safe-area-inset-bottom),12px)]">
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mb-2 text-center">{error}</p>
        )}

        {showTextarea && (
          <div className="flex items-end gap-2 mb-3">
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Або введи тут…"
              autoFocus
              className="flex-1 h-20 bg-card border border-border-tone rounded-2xl p-3 text-fg text-base resize-none focus:outline-none focus:border-burgundy placeholder:text-faint"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || transcript.trim().length === 0}
              aria-label="Відправити"
              className="shrink-0 w-12 h-12 rounded-full bg-burgundy text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95 hover:bg-burgundy-hover"
            >
              {loading ? (
                <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Big centred record button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleMicTap}
            disabled={state === 'unavailable'}
            aria-label={recording ? 'Зупинити запис' : 'Почати запис'}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 ${
              recording
                ? 'bg-red-600 animate-pulse scale-110'
                : 'bg-burgundy hover:bg-burgundy-hover record-idle'
            } disabled:opacity-40 disabled:bg-faint`}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10v2a7 7 0 0 0 14 0v-2"/>
              <path d="M12 19v3"/>
            </svg>
          </button>
          <div className="text-xs text-faint h-4">
            {state === 'unavailable'
              ? 'Голосовий ввід недоступний — введи текстом'
              : recording
                ? 'Слухаю… тап щоб зупинити'
                : showTextarea
                  ? 'Тап щоб додати ще'
                  : 'Тап щоб почати запис'}
          </div>
          {showTextarea && !recording && (
            <button
              onClick={handleCollapse}
              className="text-xs text-faint hover:text-muted underline-offset-2 hover:underline"
            >
              Скасувати
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
