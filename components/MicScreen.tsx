'use client';
import { useEffect, useState } from 'react';
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
  const { state, transcript, setTranscript, start, stop } = useSpeechRecognition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state === 'idle' && !transcript) {
      // авто-старт при відкритті
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (state === 'recording') stop();
    const text = transcript.trim();
    if (!text) { setError('Скажи або напиши щось'); return; }
    setError(null);
    try {
      await onSubmit(text);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Не вдалось розпарсити');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      <div className="flex justify-between items-center px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3">
        <button onClick={onCancel} className="text-neutral-400 text-base">Скасувати</button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-orange-400 text-base font-medium disabled:opacity-50"
        >
          {loading ? 'Парсю…' : 'Готово'}
        </button>
      </div>

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
        <p className="text-neutral-500 text-sm mt-4">
          {state === 'recording' ? 'Слухаю…' : state === 'unavailable' ? '' : 'Тап щоб почати'}
        </p>
      </div>

      <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Або введи тут…"
          className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white text-base resize-none"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
