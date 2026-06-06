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

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>(detectAvailable);
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<any>(null);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) { setState('unavailable'); return; }
    const rec = new Ctor();
    rec.lang = 'uk-UA';
    rec.continuous = true;
    rec.interimResults = true;

    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript((finalText + ' ' + interim).trim());
    };
    rec.onerror = (e: any) => {
      console.warn('SR error', e);
      setState('idle');
    };
    rec.onend = () => {
      setState(s => (s === 'recording' ? 'idle' : s));
    };
    setTranscript('');
    rec.start();
    recRef.current = rec;
    setState('recording');
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setState('idle');
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setState('idle');
  }, []);

  return { state, transcript, setTranscript, start, stop, reset };
}
