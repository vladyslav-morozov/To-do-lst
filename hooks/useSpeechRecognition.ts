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

  // User explicitly tapped stop — don't auto-restart.
  const userStoppedRef = useRef(true);
  // Text committed from previous recognition sessions (also includes manual edits).
  const baseTextRef = useRef('');
  // Current recognition instance.
  const recRef = useRef<any>(null);

  // Internal: build and start a recognition session. Returns the instance or null.
  // Calls itself recursively from onend until userStoppedRef.current becomes true.
  // Declared as `function` (hoisted) so the self-reference inside onend is legal.
  function launchRecognition(): any {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) { setState('unavailable'); return null; }

    const rec = new Ctor();
    rec.lang = 'uk-UA';
    // iOS Safari ignores/poorly implements continuous=true. Use single-shot and
    // restart in onend below — gives the user unlimited thinking time.
    rec.continuous = !isIOS();
    rec.interimResults = true;

    let sessionFinal = '';

    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) sessionFinal += r[0].transcript;
        else interim += r[0].transcript;
      }
      const combined = [baseTextRef.current, sessionFinal, interim]
        .map(s => s.trim())
        .filter(Boolean)
        .join(' ');
      setTranscript(combined);
    };

    rec.onerror = (e: any) => {
      const code = e?.error ?? 'unknown';
      // Benign on iOS: fires after a few seconds of silence. Let onend restart us.
      if (code === 'no-speech') return;
      console.warn('SR error', e);
      setError(errorText(code));
      // Permission/audio errors are fatal — stop trying.
      if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'audio-capture') {
        userStoppedRef.current = true;
      }
    };

    rec.onend = () => {
      // Commit this session's final text so next session starts after it.
      if (sessionFinal.trim()) {
        baseTextRef.current = `${baseTextRef.current} ${sessionFinal}`.trim();
      }
      if (userStoppedRef.current) {
        setState('idle');
        return;
      }
      // Restart to keep listening through pauses ("thinking time").
      // Small delay to let the engine reset cleanly between sessions.
      setTimeout(() => {
        if (userStoppedRef.current) return;
        const next = launchRecognition();
        if (next) {
          recRef.current = next;
          try { next.start(); } catch (err) {
            console.warn('Restart failed', err);
            userStoppedRef.current = true;
            setState('idle');
          }
        }
      }, 120);
    };

    return rec;
  }

  const start = useCallback(() => {
    setError(null);
    userStoppedRef.current = false;
    // Preserve whatever's already in the textarea (manual edits + prior dump).
    baseTextRef.current = transcript.trim();

    const rec = launchRecognition();
    if (!rec) { setState('unavailable'); return; }

    try {
      rec.start();
      recRef.current = rec;
      setState('recording');
    } catch (e: any) {
      setError(`Не вдалося стартувати: ${e?.message ?? e}`);
      setState('idle');
    }
    // launchRecognition is a local function declaration with stable behavior;
    // omitting from deps avoids spurious re-creation of the start callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const stop = useCallback(() => {
    userStoppedRef.current = true;
    try { recRef.current?.stop(); } catch {}
    setState('idle');
  }, []);

  const reset = useCallback(() => {
    userStoppedRef.current = true;
    try { recRef.current?.stop(); } catch {}
    baseTextRef.current = '';
    setTranscript('');
    setError(null);
    setState('idle');
  }, []);

  return { state, transcript, setTranscript, error, start, stop, reset };
}
