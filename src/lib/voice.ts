'use client';

export function createSpeechRecognition(
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
): { start: () => void; stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const w = window as any;
  const SpeechRecognitionCtor = w.webkitSpeechRecognition || w.SpeechRecognition;

  if (!SpeechRecognitionCtor) return null;

  const recognition = new SpeechRecognitionCtor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onend = () => onEnd();
  recognition.onerror = (event: any) => onError(event.error);

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined') return;
  if (!window.speechSynthesis) return;

  // Cancel any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to pick a nice voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    v => v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female')
  );
  if (preferred) utterance.voice = preferred;

  if (onEnd) utterance.onend = () => onEnd();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
}
