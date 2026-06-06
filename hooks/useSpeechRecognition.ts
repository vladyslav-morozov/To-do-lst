/* eslint-disable @typescript-eslint/no-explicit-any */
// Web Speech API is not in stable TS lib — using loose types intentionally.
'use client';
import { useCallback, useRef, useState } from 'react';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export type SpeechState = 'idle' | 'recording' | 'unavailable';

function detectAvailable(): SpeechState {
  if (typeof window === 'undefined') return 'idle';
  return window.SpeechRecognition || window.webkitSpeechRecognition ? 'idle' : 'unavailable';
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function errorText(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Доступ до мікрофона заборонено. Перевір: Settings → Safari → Microphone (або тапни 🅰🅰 у адресному рядку).';
    case 'no-speech':
      return 'Нічого не почув. Спробуй ще раз.';
    case 'audio-capture':
      return 'Не зміг отримати аудіо. Перевір що мікрофон не зайнятий іншим додатком.';
    case 'network':
      return 'Помилка мережі під час розпізнавання.';
    default:
      return `Помилка розпізнавання: ${code}`;
  }
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>(detectAvailable);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);
  const baseTextRef = useRef('');

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) { setState('unavailable'); return; }

    setError(null);
    baseTextRef.current = transcript ? transcript + ' ' : '';

    const rec = new Ctor();
    rec.lang = 'uk-UA';
    // iOS Safari: continuous mode unreliable. Use single-shot, accumulate manually.
    rec.continuous = !isIOS();
    rec.interimResults = true;

    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript((baseTextRef.current + finalText + ' ' + interim).trim());
    };
    rec.onerror = (e: any) => {
      console.warn('SR error', e);
      setError(errorText(e?.error ?? 'unknown'));
      setState('idle');
    };
    rec.onend = () => {
      setState(s => (s === 'recording' ? 'idle' : s));
    };
    try {
      rec.start();
      recRef.current = rec;
      setState('recording');
    } catch (e: any) {
      setError(`Не вдалося стартувати: ${e?.message ?? e}`);
      setState('idle');
    }
  }, [transcript]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setState('idle');
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setState('idle');
  }, []);

  return { state, transcript, setTranscript, error, start, stop, reset };
}
