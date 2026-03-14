'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isListening?: boolean;
  onMicToggle?: () => void;
  hasMic?: boolean;
}

export default function ChatInput({ onSend, disabled, isListening, onMicToggle, hasMic }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">

      {/* Mic button */}
      {hasMic && (
        <button
          type="button"
          onClick={onMicToggle}
          disabled={disabled}
          className={`w-14 h-14 shrink-0 ${isListening ? 'btn-mic-listening' : 'btn-surface'}`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
      )}

      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={isListening ? 'Listening...' : 'Ask AIMy anything...'}
        disabled={disabled || isListening}
        className="flex-1 kiosk-input px-5 py-3.5 text-base"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="w-14 h-14 shrink-0 btn-primary"
        aria-label="Send message"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </button>
    </form>
  );
}
