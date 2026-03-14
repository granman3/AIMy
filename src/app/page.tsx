'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { ToolCallInfo } from '@/lib/types';
import { createSpeechRecognition, speak, stopSpeaking } from '@/lib/voice';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
}

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function KioskPage() {
  const [sessionId, setSessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR =
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition ||
        (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
      setHasMic(!!SR);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, planId]);

  // Idle timer — auto-reset after 5 min of inactivity
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (messages.length > 0) {
        stopSpeaking();
        setMessages([]);
        setPlanId(null);
        setIsLoading(false);
        setIsListening(false);
        setSessionId(uuidv4());
      }
    }, IDLE_TIMEOUT_MS);
  }, [messages.length]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [messages, resetIdleTimer]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    stopSpeaking();
    resetIdleTimer();

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I had trouble processing that. Could you try again?' },
        ]);
      } else {
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.message,
          toolCalls: data.toolCalls,
        };
        setMessages(prev => [...prev, assistantMsg]);

        if (data.planId) {
          setPlanId(data.planId);
        }

        // Speak the response
        if (voiceEnabled && data.message) {
          speak(data.message);
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Oops, something went wrong. Please try again!' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, voiceEnabled, resetIdleTimer]);

  const toggleMic = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = createSpeechRecognition(
      (text) => {
        setIsListening(false);
        sendMessage(text);
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  }, [isListening, sendMessage]);

  // Smooth reset — no page reload
  const handleReset = () => {
    stopSpeaking();
    setMessages([]);
    setPlanId(null);
    setIsLoading(false);
    setIsListening(false);
    setSessionId(uuidv4());
  };

  const planUrl = planId
    ? `${process.env.NEXT_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/plan/${sessionId}`
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
            🐾
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AIMy
            </h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">
              Paws & Claws Pet Emporium
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          <button
            onClick={() => {
              stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled ? 'text-purple-400 bg-purple-500/10' : 'text-gray-500 bg-gray-800'
            }`}
            title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
          >
            {voiceEnabled ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            )}
          </button>

          {/* Reset button — larger, more visible */}
          <button
            onClick={handleReset}
            className="text-sm px-4 py-2 rounded-lg bg-gray-800 text-gray-300 active:bg-gray-600 border border-gray-700 transition-colors"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto" aria-live="polite">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-3xl font-bold mb-2">
              {getGreeting()}! I&apos;m{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AIMy
              </span>
            </h2>
            <p className="text-lg text-gray-400 mb-6 max-w-md mx-auto">
              Your AI shopping assistant. Tell me what you need and I&apos;ll build a personalized plan!
            </p>

            {/* Mic prompt — prominent */}
            {hasMic && (
              <div className="flex items-center justify-center gap-3 mb-8 text-purple-300">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
                <span className="text-base font-medium">Tap the mic and tell me what you need</span>
              </div>
            )}

            {/* Quick suggestions */}
            <p className="text-sm text-gray-500 mb-3">Or try one of these:</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
              {[
                'I just got a goldfish - what do I need?',
                'My betta fish might have fin rot',
                'Tropical fish tank under $75',
                'I need supplies for a new puppy',
                'My cat needs a scratching post',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-base px-5 py-3 rounded-full bg-gray-800 text-gray-300 active:bg-purple-500/30 active:text-purple-200 border border-gray-700 active:border-purple-500/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} toolCalls={msg.toolCalls} />
        ))}

        {/* Loading indicator */}
        {isLoading && <ChatMessage role="assistant" content="" isLoading />}

        {/* QR Code */}
        {planUrl && <div className="mt-6"><QRCodeDisplay planUrl={planUrl} /></div>}

        <div ref={messagesEndRef} />
      </main>

      {/* Input area */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 px-4 py-3 max-w-2xl w-full mx-auto">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          isListening={isListening}
          onMicToggle={toggleMic}
          hasMic={hasMic}
        />
      </footer>
    </div>
  );
}
