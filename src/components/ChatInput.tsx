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
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${
            isListening
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-gray-700 text-gray-300 active:bg-gray-500'
          } disabled:opacity-50`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {/* Pulsing rings when listening */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
              <span className="absolute inset-[-4px] rounded-full border-2 border-red-400/30 animate-pulse" />
            </>
          )}
          <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
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
        className="flex-1 bg-gray-800 text-white rounded-full px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 disabled:opacity-50"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center active:bg-purple-600 transition-colors disabled:opacity-50 shrink-0"
        aria-label="Send message"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </button>
    </form>
  );
}
